import { createBrowserClient } from '@/lib/supabase';
import type { Job, JobListing, JobFilters, JobStatus } from '@/types';
import type { Database } from '@/types/database.types';

type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

// Create client instance for service
const supabase = createBrowserClient();

/**
 * Job Service - Data access layer for job-related operations
 */
export const jobService = {
  /**
   * Get all jobs with filtering and pagination
   */
  async getJobs(filters: JobFilters = {}, page = 1, limit = 20) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          organizations (
            id,
            name,
            logo_url,
            industry
          ),
          users:users!employer_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        query = query.eq('location_city', filters.location);
      }

      if (filters.jobType) {
        query = query.eq('job_type', filters.jobType);
      }

      if (filters.workLocation) {
        query = query.eq('work_mode', filters.workLocation);
      }

      if (filters.experienceLevel) {
        query = query.eq('experience_level', filters.experienceLevel);
      }

      if (filters.salaryMin !== undefined) {
        query = query.gte('salary_min', filters.salaryMin);
      }

      if (filters.salaryMax !== undefined) {
        query = query.lte('salary_max', filters.salaryMax);
      }

      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Extract all skill IDs across the returned jobs to fetch names in a single batch
      const allSkillIds = new Set<string>();
      (data || []).forEach((job: Record<string, unknown>) => {
        if (Array.isArray(job.required_skills)) {
          job.required_skills.forEach((id: unknown) => {
            if (typeof id === 'string') allSkillIds.add(id);
          });
        }
        if (Array.isArray(job.preferred_skills)) {
          job.preferred_skills.forEach((id: unknown) => {
            if (typeof id === 'string') allSkillIds.add(id);
          });
        }
      });

      const skillMap = new Map<string, { id: string; name: string; category?: string }>();
      if (allSkillIds.size > 0) {
        const { data: skillsData } = await supabase
          .from('skills')
          .select('id, name, category')
          .in('id', Array.from(allSkillIds));
        (skillsData || []).forEach((s) => skillMap.set(s.id, s));
      }

      const jobsWithSkills = (data || []).map((job: Record<string, unknown>) => {
        const u = job.users as { id: string; full_name?: string; email?: string; avatar_url?: string } | null;
        const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
        const lastName = rest.join(' ');
        return {
          ...job,
          posted_by: u ? {
            id: u.id,
            full_name: u.full_name || '',
            first_name: firstName,
            last_name: lastName,
            email: u.email || '',
            avatar_url: u.avatar_url || '',
          } : undefined,
          skills: [
            ...(Array.isArray(job.required_skills)
              ? job.required_skills
                  .map((id: unknown) => (typeof id === 'string' ? skillMap.get(id) : null))
                  .filter(Boolean)
              : [])
          ]
        };
      });

      return {
        jobs: jobsWithSkills as unknown as JobListing[],
        total: count || 0,
        page,
        limit,
        hasMore: from + (data?.length || 0) < (count || 0)
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  /**
   * Get a single job by ID
   */
  async getJobById(jobId: string) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          organizations (
            id,
            name,
            logo_url,
            industry,
            description,
            website,
            size
          ),
          users:users!employer_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      // Resolve skill names from required_skills and preferred_skills
      let skillsList: Array<{ id: string; name: string; category?: string }> = [];
      const skillIds = [
        ...(Array.isArray(data.required_skills) ? data.required_skills : []),
        ...(Array.isArray(data.preferred_skills) ? data.preferred_skills : []),
      ].filter((id: unknown): id is string => typeof id === 'string');

      if (skillIds.length > 0) {
        const { data: skillsData } = await supabase
          .from('skills')
          .select('id, name, category')
          .in('id', skillIds);
        skillsList = skillsData || [];
      }

      const u = data.users as { id: string; full_name?: string; email?: string; avatar_url?: string } | null;
      const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
      const lastName = rest.join(' ');

      return {
        ...data,
        posted_by: u ? {
          id: u.id,
          full_name: u.full_name || '',
          first_name: firstName,
          last_name: lastName,
          email: u.email || '',
          avatar_url: u.avatar_url || '',
        } : undefined,
        skills: skillsList,
      } as unknown as JobListing;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  /**
   * Get jobs posted by a specific recruiter
   */
  async getRecruiterJobs(recruiterId: string, status?: JobStatus) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          organizations (
            id,
            name,
            logo_url
          )
        `)
        .eq('employer_id', recruiterId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as Job[];
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error);
      throw error;
    }
  },

  /**
   * Create a new job posting
   */
  async createJob(jobData: JobInsert) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  /**
   * Update an existing job
   */
  async updateJob(jobId: string, updates: JobUpdate) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data as Job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  /**
   * Delete a job posting
   */
  async deleteJob(jobId: string) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  /**
   * Get job statistics for a recruiter
   */
  async getJobStats(recruiterId: string) {
    try {
      const { data, error } = await supabase.rpc('get_job_stats', {
        p_recruiter_id: recruiterId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  },

  /**
   * Search jobs by keywords
   */
  async searchJobs(keywords: string, limit = 10) {
    try {
      const { data, error } = await supabase.rpc('search_jobs', {
        search_query: keywords,
        result_limit: limit
      });

      if (error) throw error;
      return (data || []) as unknown as JobListing[];
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  },

  /**
   * Get recommended jobs for a candidate based on their profile
   */
  async getRecommendedJobs(candidateId: string, limit = 10) {
    try {
      const { data, error } = await supabase.rpc('get_recommended_jobs', {
        p_candidate_id: candidateId,
        p_limit: limit
      });

      if (error) throw error;
      return (data || []) as unknown as JobListing[];
    } catch (error) {
      console.error('Error getting recommended jobs:', error);
      return [];
    }
  },

  /**
   * Get similar jobs to a given job
   */
  async getSimilarJobs(jobId: string, limit = 5) {
    try {
      const { data, error } = await supabase.rpc('get_similar_jobs', {
        p_job_id: jobId,
        p_limit: limit
      });

      if (error) throw error;
      return (data || []) as unknown as JobListing[];
    } catch (error) {
      console.error('Error getting similar jobs:', error);
      return [];
    }
  },

  /**
   * Get unique locations for filter dropdown
   */
  async getUniqueLocations() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('location_city')
        .in('status', ['active', 'published'])
        .not('location_city', 'is', null);

      if (error) throw error;

      const locations = (data || [])
        .map((j: { location_city: string | null }) => j.location_city)
        .filter((loc: string | null, index: number, self: (string | null)[]): loc is string => Boolean(loc) && self.indexOf(loc) === index)
        .sort();

      return locations as string[];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  },

  /**
   * Get unique skills required for jobs
   */
  async getUniqueSkills() {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .order('name');

      if (error) throw error;

      return (data || []) as Array<{ id: string; name: string; category: string }>;
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  },

  /**
   * Bookmark/save a job for later
   */
  async bookmarkJob(jobId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('job_bookmarks')
        .insert({ job_id: jobId, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error bookmarking job:', error);
      throw error;
    }
  },

  /**
   * Remove a bookmark
   */
  async removeBookmark(jobId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('job_bookmarks')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },

  /**
   * Get user's bookmarked jobs
   */
  async getBookmarkedJobs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('job_bookmarks')
        .select(`
          jobs (
            *,
            organizations (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const jobs = (data || []).map((b: { jobs: unknown }) => b.jobs).filter(Boolean);
      return jobs as unknown as JobListing[];
    } catch (error) {
      console.error('Error fetching bookmarked jobs:', error);
      return [];
    }
  }
};

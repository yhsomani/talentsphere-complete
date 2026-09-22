/**
 * Job Service - Data access layer for job-related operations
 * 
 * Refactored to use DatabaseAdapter for:
 * - Loose coupling from Supabase SDK
 * - Built-in retry and circuit breaker patterns
 * - Testability with mock adapters
 * - Consistent error handling
 */

import type { Job, JobListing, JobFilters, JobStatus, JobFacets } from '@/types';
import type { Database } from '@/types/database.types';
import { DatabaseAdapter } from '../lib/database/adapter';
import { AppErrors, isAppError } from '../lib/errors/index';

type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export interface JobAnalyticsSummary {
  jobId: string;
  viewCount: number;
  applicationCount: number;
  conversionRate: number;
  stageBreakdown: {
    submitted: number;
    screening: number;
    interviewing: number;
    offered: number;
    hired: number;
    rejected: number;
    withdrawn: number;
  };
}

export function computeJobFacets(rawJobs: Array<Record<string, unknown>>): JobFacets {
  const facets: JobFacets = {
    workLocation: { remote: 0, hybrid: 0, onsite: 0 },
    jobType: { full_time: 0, part_time: 0, contract: 0, internship: 0, apprenticeship: 0 },
    experienceLevel: { entry: 0, mid: 0, senior: 0, lead: 0, executive: 0 },
    locations: [],
    totalMatches: rawJobs.length,
  };

  const locCountMap = new Map<string, number>();

  for (const j of rawJobs) {
    const wm = j.work_mode as string;
    if (wm === 'remote') facets.workLocation.remote++;
    else if (wm === 'hybrid') facets.workLocation.hybrid++;
    else if (wm === 'onsite') facets.workLocation.onsite++;

    const jt = j.job_type as string;
    if (jt === 'full_time') facets.jobType.full_time++;
    else if (jt === 'part_time') facets.jobType.part_time++;
    else if (jt === 'contract') facets.jobType.contract++;
    else if (jt === 'internship') facets.jobType.internship++;
    else if (jt === 'apprenticeship') facets.jobType.apprenticeship++;

    const el = j.experience_level as string;
    if (el === 'entry') facets.experienceLevel.entry++;
    else if (el === 'mid') facets.experienceLevel.mid++;
    else if (el === 'senior') facets.experienceLevel.senior++;
    else if (el === 'lead') facets.experienceLevel.lead++;
    else if (el === 'executive') facets.experienceLevel.executive++;

    const loc = (j.location_city as string) || (j.location_country as string);
    if (loc && typeof loc === 'string') {
      const cleanLoc = loc.trim();
      locCountMap.set(cleanLoc, (locCountMap.get(cleanLoc) || 0) + 1);
    }
  }

  facets.locations = Array.from(locCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return facets;
}

/**
 * JobService class with dependency injection
 */
export class JobService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get all jobs with filtering and pagination
   */
  async getJobs(filters: JobFilters = {}, page = 1, limit = 20) {
    try {
      const result = await this.db.list<Record<string, unknown>>('jobs', {
        pagination: {
          page,
          pageSize: limit,
          orderBy: 'created_at',
          ascending: false,
        },
      });

      if (result.error) {
        throw result.error;
      }

      let jobs = result.data;
      
      // Apply filters
      if (filters.search) {
        jobs = jobs.filter(job => 
          (typeof job.title === 'string' && job.title.toLowerCase().includes(filters.search!.toLowerCase())) ||
          (typeof job.description === 'string' && job.description.toLowerCase().includes(filters.search!.toLowerCase()))
        );
      }
      if (filters.location) jobs = jobs.filter(job => job.location_city === filters.location);
      if (filters.jobType) jobs = jobs.filter(job => job.job_type === filters.jobType);
      if (filters.workLocation) jobs = jobs.filter(job => job.work_mode === filters.workLocation);
      if (filters.experienceLevel) jobs = jobs.filter(job => job.experience_level === filters.experienceLevel);
      if (filters.salaryMin !== undefined) jobs = jobs.filter(job => ((job.salary_min as number) ?? 0) >= filters.salaryMin!);
      if (filters.salaryMax !== undefined) jobs = jobs.filter(job => ((job.salary_max as number) ?? 0) <= filters.salaryMax!);
      if (filters.organizationId) jobs = jobs.filter(job => job.organization_id === filters.organizationId);
      if (filters.status) jobs = jobs.filter(job => job.status === filters.status);

      // Fetch skills
      const allSkillIds = new Set<string>();
      jobs.forEach((job: Record<string, unknown>) => {
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
        const skillsResult = await this.db.list<{ id: string; name: string; category?: string }>('skills');
        if (!skillsResult.error && skillsResult.data) {
          skillsResult.data.forEach((s) => skillMap.set(s.id, s));
        }
      }

      const jobsWithSkills = jobs.map((job: Record<string, unknown>) => {
        const u = job.users as { id: string; full_name?: string; email?: string; avatar_url?: string } | null;
        const [firstName = '', ...rest] = (u?.full_name || '').split(' ');
        return {
          ...job,
          posted_by: u ? {
            id: u.id,
            full_name: u.full_name || '',
            first_name: firstName,
            last_name: rest.join(' '),
            email: u.email || '',
            avatar_url: u.avatar_url || '',
          } : undefined,
          skills: Array.isArray(job.required_skills)
            ? job.required_skills
                .map((id: unknown) => (typeof id === 'string' ? skillMap.get(id) : null))
                .filter(Boolean)
            : []
        };
      });

      // Compute dynamic facets across pool matching current search/organization filter
      const allJobsRes = await this.db.list<Record<string, unknown>>('jobs');
      let facetPool = ((allJobsRes.data as unknown as Array<Record<string, unknown>>) || []);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        facetPool = facetPool.filter(job =>
          (typeof job.title === 'string' && job.title.toLowerCase().includes(q)) ||
          (typeof job.description === 'string' && job.description.toLowerCase().includes(q))
        );
      }
      if (filters.organizationId) {
        facetPool = facetPool.filter(job => job.organization_id === filters.organizationId);
      }
      if (filters.status) {
        facetPool = facetPool.filter(job => job.status === filters.status);
      }

      const facets = computeJobFacets(facetPool);

      return {
        jobs: jobsWithSkills as unknown as JobListing[],
        total: result.count ?? jobs.length,
        page,
        limit,
        hasMore: (page - 1) * limit + jobs.length < (result.count ?? jobs.length),
        facets,
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw AppErrors.database('Failed to fetch jobs', { filters, page, limit }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get dynamic facet counts for job search filters
   * Implements SRCH-001: Facet-Based Filtering with Dynamic Count Badges
   */
  async getJobFacets(filters: JobFilters = {}): Promise<JobFacets> {
    try {
      const result = await this.db.list<Record<string, unknown>>('jobs');
      let jobs = ((result.data as unknown as Array<Record<string, unknown>>) || []);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        jobs = jobs.filter(job =>
          (typeof job.title === 'string' && job.title.toLowerCase().includes(q)) ||
          (typeof job.description === 'string' && job.description.toLowerCase().includes(q))
        );
      }
      if (filters.organizationId) {
        jobs = jobs.filter(job => job.organization_id === filters.organizationId);
      }
      if (filters.status) {
        jobs = jobs.filter(job => job.status === filters.status);
      }

      return computeJobFacets(jobs);
    } catch (error) {
      console.error('Error computing job facets:', error);
      return computeJobFacets([]);
    }
  }

  /**
   * Get a single job by ID
   */
  async getJobById(jobId: string) {
    try {
      const result = await this.db.getById<Record<string, unknown>>('jobs', jobId);
      
      if (result.error) throw result.error;
      if (!result.data) throw AppErrors.notFound('Job', jobId);

      const data = result.data;
      
      // Fetch skills
      const skillIds = [
        ...(Array.isArray(data.required_skills) ? data.required_skills : []),
        ...(Array.isArray(data.preferred_skills) ? data.preferred_skills : []),
      ].filter((id: unknown): id is string => typeof id === 'string');

      let skillsList: Array<{ id: string; name: string; category?: string }> = [];
      if (skillIds.length > 0) {
        const skillsResult = await this.db.list<{ id: string; name: string; category?: string }>('skills');
        if (!skillsResult.error && skillsResult.data) {
          skillsList = skillsResult.data.filter((s) => skillIds.includes(s.id));
        }
      }

      const u = data.users as { id: string; full_name?: string; email?: string; avatar_url?: string } | null;
      const [firstName = '', ...rest] = (u?.full_name || '').split(' ');

      return {
        ...data,
        posted_by: u ? {
          id: u.id,
          full_name: u.full_name || '',
          first_name: firstName,
          last_name: rest.join(' '),
          email: u.email || '',
          avatar_url: u.avatar_url || '',
        } : undefined,
        skills: skillsList,
      } as unknown as JobListing;
    } catch (error) {
      console.error('Error fetching job:', error);
      if (isAppError(error)) throw error;
      throw AppErrors.database('Failed to fetch job', { jobId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get jobs posted by a specific recruiter
   */
  async getRecruiterJobs(recruiterId: string, status?: JobStatus) {
    try {
      const result = await this.db.list<Record<string, unknown>>('jobs', {
        filters: { employer_id: recruiterId, ...(status ? { status } : {}) },
        pagination: { orderBy: 'created_at', ascending: false },
      });

      if (result.error) throw result.error;
      return result.data as unknown as Job[];
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error);
      throw AppErrors.database('Failed to fetch recruiter jobs', { recruiterId, status }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Create a new job posting
   */
  async createJob(jobData: JobInsert) {
    try {
      const result = await this.db.insert<Record<string, unknown>>('jobs', jobData as Record<string, unknown>);
      
      if (result.error) throw result.error;
      return result.data as unknown as Job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw AppErrors.database('Failed to create job', { jobData }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Update an existing job
   */
  async updateJob(jobId: string, updates: JobUpdate) {
    try {
      const result = await this.db.update<Record<string, unknown>>('jobs', jobId, {
        ...updates,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>);

      if (result.error) throw result.error;
      return result.data as unknown as Job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw AppErrors.database('Failed to update job', { jobId, updates }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Update job requisition lifecycle status (JOB-006)
   */
  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    return this.updateJob(jobId, { status });
  }

  /**
   * Clone / fast duplicate an existing job requisition (JOB-016)
   */
  async cloneJob(jobId: string, recruiterId: string, options?: { newTitle?: string; status?: JobStatus }): Promise<Job> {
    try {
      const sourceResult = await this.db.getById<Record<string, unknown>>('jobs', jobId);
      if (sourceResult.error) throw sourceResult.error;
      if (!sourceResult.data) throw AppErrors.notFound('Job', jobId);

      const source = sourceResult.data;
      const title = options?.newTitle || `${(source.title as string) || 'Job'} (Copy)`;
      const rawSlug = (source.slug as string) || (source.title as string) || 'job';
      const baseSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const uniqueSlug = `${baseSlug}-copy-${Date.now().toString(36)}`;

      const clonePayload: Record<string, unknown> = {
        employer_id: recruiterId,
        organization_id: source.organization_id || null,
        title,
        slug: uniqueSlug,
        description: source.description || '',
        requirements: source.requirements || [],
        responsibilities: source.responsibilities || [],
        benefits: source.benefits || [],
        job_type: source.job_type,
        work_mode: source.work_mode,
        experience_level: source.experience_level,
        department: source.department || null,
        location_city: source.location_city || null,
        location_country: source.location_country || null,
        location_remote: source.location_remote ?? false,
        salary_min: source.salary_min || null,
        salary_max: source.salary_max || null,
        salary_currency: source.salary_currency || 'USD',
        salary_period: source.salary_period || 'yearly',
        status: options?.status || 'draft',
        positions_available: source.positions_available || 1,
        positions_filled: 0,
        application_count: 0,
        view_count: 0,
        required_skills: source.required_skills || [],
        preferred_skills: source.preferred_skills || [],
        visa_sponsorship: source.visa_sponsorship ?? false,
        relocation_assistance: source.relocation_assistance ?? false,
        is_remote_worldwide: source.is_remote_worldwide ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await this.db.insert<Record<string, unknown>>('jobs', clonePayload);
      if (result.error) throw result.error;
      return result.data as unknown as Job;
    } catch (error) {
      console.error('Error cloning job:', error);
      throw AppErrors.database('Failed to clone job', { jobId, recruiterId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Delete a job posting
   */
  async deleteJob(jobId: string) {
    try {
      const result = await this.db.delete('jobs', jobId);
      
      if (result.error) throw result.error;
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw AppErrors.database('Failed to delete job', { jobId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get job statistics for a recruiter
   */
  async getJobStats(recruiterId: string) {
    try {
      // Note: RPC calls need special handling - using query method
      const result = await this.db.query<Record<string, unknown>>('SELECT * FROM get_job_stats($1)', [recruiterId]);
      
      if (result.error) throw result.error;
      return result.data?.[0];
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw AppErrors.database('Failed to fetch job stats', { recruiterId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Search jobs by keywords
   */
  async searchJobs(keywords: string, limit = 10) {
    try {
      const result = await this.db.query<Record<string, unknown>>('SELECT * FROM search_jobs($1, $2)', [keywords, limit]);
      
      if (result.error) {
        console.error('Error searching jobs:', result.error);
        return [];
      }
      return result.data as unknown as JobListing[];
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  }

  /**
   * Get recommended jobs for a candidate
   */
  async getRecommendedJobs(candidateId: string, limit = 10) {
    try {
      const result = await this.db.query<Record<string, unknown>>('SELECT * FROM get_recommended_jobs($1, $2)', [candidateId, limit]);
      
      if (result.error) {
        console.error('Error getting recommended jobs:', result.error);
        return [];
      }
      return result.data as unknown as JobListing[];
    } catch (error) {
      console.error('Error getting recommended jobs:', error);
      return [];
    }
  }

  /**
   * Get similar job recommendations based on skills, department, work mode, and experience (JOB-012)
   */
  async getSimilarJobs(jobId: string, limit = 4): Promise<JobListing[]> {
    try {
      // 1. Fetch current target job
      const targetRes = await this.db.getById<Record<string, unknown>>('jobs', jobId);
      if (targetRes.error || !targetRes.data) {
        return [];
      }
      const target = targetRes.data;

      // 2. Fetch active candidate jobs
      const allJobsRes = await this.db.list<Record<string, unknown>>('jobs', {
        filters: { status: 'active' },
      });

      if (allJobsRes.error || !allJobsRes.data) {
        return [];
      }

      // Filter out target job
      const otherJobs = allJobsRes.data.filter(j => j.id !== jobId);
      if (otherJobs.length === 0) {
        return [];
      }

      const targetSkills = new Set<string>();
      if (Array.isArray(target.required_skills)) {
        for (const s of target.required_skills) if (typeof s === 'string') targetSkills.add(s);
      }
      if (Array.isArray(target.preferred_skills)) {
        for (const s of target.preferred_skills) if (typeof s === 'string') targetSkills.add(s);
      }

      // 3. Score candidate jobs
      const scored = otherJobs.map(job => {
        let score = 0;

        // Same organization bonus (+20)
        if (job.organization_id && target.organization_id && job.organization_id === target.organization_id) {
          score += 20;
        }

        // Same work mode bonus (+15)
        if (job.work_mode && target.work_mode && job.work_mode === target.work_mode) {
          score += 15;
        }

        // Same experience level bonus (+15)
        if (job.experience_level && target.experience_level && job.experience_level === target.experience_level) {
          score += 15;
        }

        // Shared skills bonus (+10 per shared skill)
        if (Array.isArray(job.required_skills) && targetSkills.size > 0) {
          for (const s of job.required_skills) {
            if (typeof s === 'string' && targetSkills.has(s)) {
              score += 10;
            }
          }
        }

        // Same location city bonus (+10)
        if (job.location_city && target.location_city && String(job.location_city).toLowerCase() === String(target.location_city).toLowerCase()) {
          score += 10;
        }

        // Same job type bonus (+5)
        if (job.job_type && target.job_type && job.job_type === target.job_type) {
          score += 5;
        }

        return { job, score };
      });

      // 4. Sort highest score first
      scored.sort((a, b) => b.score - a.score);
      const topJobs = scored.slice(0, limit).map(s => s.job);

      // 5. Enrich top jobs with skills and organizations
      const skillIds = new Set<string>();
      const orgIds = new Set<string>();

      for (const j of topJobs) {
        if (Array.isArray(j.required_skills)) {
          for (const s of j.required_skills) if (typeof s === 'string') skillIds.add(s);
        }
        if (j.organization_id && typeof j.organization_id === 'string') {
          orgIds.add(j.organization_id);
        }
      }

      const skillMap = new Map<string, { id: string; name: string; category?: string }>();
      if (skillIds.size > 0) {
        const skillsResult = await this.db.list<{ id: string; name: string; category?: string }>('skills');
        if (!skillsResult.error && skillsResult.data) {
          skillsResult.data.forEach(s => skillMap.set(s.id, s));
        }
      }

      const orgMap = new Map<string, Record<string, unknown>>();
      if (orgIds.size > 0) {
        const orgsResult = await this.db.list<Record<string, unknown>>('organizations');
        if (!orgsResult.error && orgsResult.data) {
          orgsResult.data.forEach(o => orgMap.set(o.id as string, o));
        }
      }

      return topJobs.map(j => {
        const skillsList = (Array.isArray(j.required_skills) ? j.required_skills : [])
          .map((id: unknown) => (typeof id === 'string' ? skillMap.get(id) || { id, name: id } : null))
          .filter(Boolean);

        const org = j.organization_id ? orgMap.get(j.organization_id as string) : undefined;

        return {
          ...j,
          skills: skillsList,
          organization: org,
        } as unknown as JobListing;
      });
    } catch (error) {
      console.error('Error getting similar jobs:', error);
      return [];
    }
  }

  /**
   * Get unique locations for filter dropdown
   */
  async getUniqueLocations() {
    try {
      const result = await this.db.list<{ location_city: string | null }>('jobs', {
        filters: { status: 'active' },
      });

      if (result.error) throw result.error;

      const locations = (result.data || [])
        .map((j: { location_city: string | null }) => j.location_city)
        .filter((loc: string | null, index: number, self: (string | null)[]): loc is string => Boolean(loc) && self.indexOf(loc) === index)
        .sort();

      return locations as string[];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  /**
   * Get unique skills
   */
  async getUniqueSkills() {
    try {
      const result = await this.db.list<{ id: string; name: string; category: string }>('skills', {
        pagination: { orderBy: 'name', ascending: true },
      });

      if (result.error) throw result.error;
      return result.data as Array<{ id: string; name: string; category: string }>;
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  /**
   * Bookmark a job
   */
  async bookmarkJob(jobId: string, userId: string) {
    try {
      const result = await this.db.insert('job_bookmarks', { job_id: jobId, user_id: userId });
      
      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      console.error('Error bookmarking job:', error);
      throw AppErrors.database('Failed to bookmark job', { jobId, userId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(jobId: string, userId: string) {
    try {
      // Note: Need to implement delete with filters in adapter
      const result = await this.db.delete('job_bookmarks', `${jobId}_${userId}`);
      
      if (result.error) throw result.error;
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw AppErrors.database('Failed to remove bookmark', { jobId, userId }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get user's bookmarked jobs
   */
  async getBookmarkedJobs(userId: string) {
    try {
      const result = await this.db.list<{ jobs: unknown }>('job_bookmarks', {
        filters: { user_id: userId },
        pagination: { orderBy: 'created_at', ascending: false },
      });

      if (result.error) throw result.error;
      
      const jobs = (result.data || []).map((b: { jobs: unknown }) => b.jobs).filter(Boolean);
      return jobs as unknown as JobListing[];
    } catch (error) {
      console.error('Error fetching bookmarked jobs:', error);
      return [];
    }
  }

  /**
   * Record a view impression for a job with 24-hour deduplication (JOB-014)
   */
  async recordJobView(jobId: string, options?: { userId?: string; visitorHash?: string }): Promise<boolean> {
    try {
      if (!jobId) return false;

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      // Check for recent view by user or visitor
      let recentViewQuery = this.db.from('job_views').select('id').eq('job_id', jobId);

      if (options?.userId) {
        recentViewQuery = recentViewQuery.eq('viewer_id', options.userId);
      } else if (options?.visitorHash) {
        recentViewQuery = recentViewQuery.eq('visitor_hash', options.visitorHash);
      }

      const { data: existingViews } = await recentViewQuery.gte('viewed_at', twentyFourHoursAgo);
      const hasRecent = Array.isArray(existingViews) && existingViews.length > 0;

      if (hasRecent) {
        // Already viewed in the last 24h, skip increment
        return false;
      }

      // Log the new view impression
      await this.db.from('job_views').insert({
        job_id: jobId,
        viewer_id: options?.userId || null,
        visitor_hash: options?.visitorHash || null,
        viewed_at: now.toISOString(),
      });

      // Increment view_count on the jobs table
      const { data: jobData } = await this.db.from('jobs').select('view_count').eq('id', jobId).maybeSingle();
      const currentCount = Number((jobData as unknown as Record<string, unknown>)?.view_count) || 0;
      await this.db.from('jobs').update({ view_count: currentCount + 1 }).eq('id', jobId);

      return true;
    } catch (error) {
      console.error('Non-blocking error recording job view:', error);
      return false;
    }
  }

  /**
   * Get requisition analytics & conversion metrics (JOB-014)
   */
  async getJobAnalytics(jobId: string): Promise<JobAnalyticsSummary> {
    try {
      // 1. Fetch job record for view_count and application_count
      const { data: jobData } = await this.db
        .from('jobs')
        .select('id, view_count, application_count')
        .eq('id', jobId)
        .maybeSingle();

      const viewCount = Math.max(0, Number((jobData as unknown as Record<string, unknown>)?.view_count) || 0);

      // 2. Query applications for this job to compute exact stage breakdown
      const { data: appsData } = await this.db
        .from('applications')
        .select('id, status')
        .eq('job_id', jobId);

      const applications = (appsData as unknown as Array<{ status: string }>) || [];
      const applicationCount = applications.length;

      const stageBreakdown = {
        submitted: 0,
        screening: 0,
        interviewing: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
        withdrawn: 0,
      };

      applications.forEach(a => {
        const s = a.status;
        if (s === 'submitted') stageBreakdown.submitted += 1;
        else if (['screening', 'under_review'].includes(s)) stageBreakdown.screening += 1;
        else if (['interview_scheduled', 'interviewed'].includes(s)) stageBreakdown.interviewing += 1;
        else if (s === 'offer_extended') stageBreakdown.offered += 1;
        else if (['offer_accepted', 'hired'].includes(s)) stageBreakdown.hired += 1;
        else if (['rejected', 'offer_declined'].includes(s)) stageBreakdown.rejected += 1;
        else if (s === 'withdrawn') stageBreakdown.withdrawn += 1;
      });

      const conversionRate = viewCount > 0
        ? Number(((applicationCount / viewCount) * 100).toFixed(1))
        : applicationCount > 0 ? 100 : 0;

      return {
        jobId,
        viewCount,
        applicationCount,
        conversionRate,
        stageBreakdown,
      };
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      return {
        jobId,
        viewCount: 0,
        applicationCount: 0,
        conversionRate: 0,
        stageBreakdown: {
          submitted: 0,
          screening: 0,
          interviewing: 0,
          offered: 0,
          hired: 0,
          rejected: 0,
          withdrawn: 0,
        },
      };
    }
  }

  /**
   * Aggregate analytics across all jobs for an employer/recruiter (JOB-014)
   */
  async getEmployerJobsAnalytics(employerId: string): Promise<{
    totalViews: number;
    totalApplications: number;
    averageConversionRate: number;
    topJobs: Array<{ id: string; title: string; views: number; applications: number; conversionRate: number }>;
  }> {
    try {
      const { data: jobsData } = await this.db
        .from('jobs')
        .select('id, title, view_count, application_count')
        .eq('employer_id', employerId);

      const jobs = (jobsData as unknown as Array<{ id: string; title: string; view_count?: number; application_count?: number }>) || [];

      let totalViews = 0;
      let totalApplications = 0;

      const jobMetrics = jobs.map(j => {
        const views = Number(j.view_count) || 0;
        const apps = Number(j.application_count) || 0;
        totalViews += views;
        totalApplications += apps;
        const conversionRate = views > 0 ? Number(((apps / views) * 100).toFixed(1)) : 0;
        return {
          id: j.id,
          title: j.title,
          views,
          applications: apps,
          conversionRate,
        };
      });

      const averageConversionRate = totalViews > 0
        ? Number(((totalApplications / totalViews) * 100).toFixed(1))
        : 0;

      jobMetrics.sort((a, b) => b.applications - a.applications);

      return {
        totalViews,
        totalApplications,
        averageConversionRate,
        topJobs: jobMetrics.slice(0, 5),
      };
    } catch {
      return {
        totalViews: 0,
        totalApplications: 0,
        averageConversionRate: 0,
        topJobs: [],
      };
    }
  }
}

// Backward compatibility export - creates instance with default adapter
import { createDatabaseAdapter } from '../lib/database/adapter';
import { AppConfig } from '../config/index';

const defaultAdapter = createDatabaseAdapter({
  supabaseUrl: AppConfig.supabase.url,
  supabaseKey: AppConfig.supabase.anonKey,
});
export const jobService = new JobService(defaultAdapter);
export const jobsService = jobService;

/**
 * Job Service - Data access layer for job-related operations
 * 
 * Refactored to use DatabaseAdapter for:
 * - Loose coupling from Supabase SDK
 * - Built-in retry and circuit breaker patterns
 * - Testability with mock adapters
 * - Consistent error handling
 */

import type { Job, JobListing, JobFilters, JobStatus } from '@/types';
import type { Database } from '@/types/database.types';
import { DatabaseAdapter } from '@/lib/database/adapter';
import { AppErrors, isAppError } from '@/lib/errors';

type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

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
      const result = await this.db.list<any>('jobs', {
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
          job.title?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          job.description?.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      if (filters.location) jobs = jobs.filter(job => job.location_city === filters.location);
      if (filters.jobType) jobs = jobs.filter(job => job.job_type === filters.jobType);
      if (filters.workLocation) jobs = jobs.filter(job => job.work_mode === filters.workLocation);
      if (filters.experienceLevel) jobs = jobs.filter(job => job.experience_level === filters.experienceLevel);
      if (filters.salaryMin !== undefined) jobs = jobs.filter(job => (job.salary_min ?? 0) >= filters.salaryMin!);
      if (filters.salaryMax !== undefined) jobs = jobs.filter(job => (job.salary_max ?? 0) <= filters.salaryMax!);
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
        const skillsResult = await this.db.list<any>('skills');
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

      return {
        jobs: jobsWithSkills as unknown as JobListing[],
        total: result.count ?? jobs.length,
        page,
        limit,
        hasMore: (page - 1) * limit + jobs.length < (result.count ?? jobs.length)
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw AppErrors.database('Failed to fetch jobs', { filters, page, limit }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get a single job by ID
   */
  async getJobById(jobId: string) {
    try {
      const result = await this.db.getById<any>('jobs', jobId);
      
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
        const skillsResult = await this.db.list<any>('skills');
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
      const result = await this.db.list<any>('jobs', {
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
      const result = await this.db.insert<any>('jobs', jobData as Record<string, unknown>);
      
      if (result.error) throw result.error;
      return result.data as Job;
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
      const result = await this.db.update<any>('jobs', jobId, {
        ...updates,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>);

      if (result.error) throw result.error;
      return result.data as Job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw AppErrors.database('Failed to update job', { jobId, updates }, error instanceof Error ? error : undefined);
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
      const result = await this.db.query<any>('SELECT * FROM get_job_stats($1)', [recruiterId]);
      
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
      const result = await this.db.query<any>('SELECT * FROM search_jobs($1, $2)', [keywords, limit]);
      
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
      const result = await this.db.query<any>('SELECT * FROM get_recommended_jobs($1, $2)', [candidateId, limit]);
      
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
   * Get similar jobs
   */
  async getSimilarJobs(jobId: string, limit = 5) {
    try {
      const result = await this.db.query<any>('SELECT * FROM get_similar_jobs($1, $2)', [jobId, limit]);
      
      if (result.error) {
        console.error('Error getting similar jobs:', result.error);
        return [];
      }
      return result.data as unknown as JobListing[];
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
      const result = await this.db.list<any>('jobs', {
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
      const result = await this.db.list<any>('skills', {
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
      const result = await this.db.list<any>('job_bookmarks', {
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
}

// Backward compatibility export
// Async initialization helper for modern usage
export const initJobService = async (): Promise<JobService> => {
  const { createDatabaseAdapter } = await import('@/lib/database/adapter');
  const { getConfig } = await import('@/lib/config/validation');
  const config = getConfig();
  const db = createDatabaseAdapter({
    supabaseUrl: config.required.supabaseUrl,
    supabaseKey: config.required.supabaseAnonKey,
  });
  return new JobService(db);
};

// Lazy-initialized service instance for backward compatibility
// Uses dynamic imports to avoid circular dependencies
let _cachedDb: Promise<DatabaseAdapter> | null = null;
const getDbAsync = async (): Promise<DatabaseAdapter> => {
  if (!_cachedDb) {
    const { createDatabaseAdapter } = await import('@/lib/database/adapter');
    const { getConfig } = await import('@/lib/config/validation');
    const config = getConfig();
    _cachedDb = Promise.resolve(createDatabaseAdapter({
      supabaseUrl: config.required.supabaseUrl,
      supabaseKey: config.required.supabaseAnonKey,
    }));
  }
  return _cachedDb;
};

// Initialize service asynchronously
let _jobServiceInstance: JobService | null = null;
const initServiceSync = () => {
  if (!_jobServiceInstance) {
    try {
      // Try synchronous initialization for Node.js environments
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createDatabaseAdapter } = require('@/lib/database/adapter');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getConfig } = require('@/lib/config/validation');
      const config = getConfig();
      const db = createDatabaseAdapter({
        supabaseUrl: config.required.supabaseUrl,
        supabaseKey: config.required.supabaseAnonKey,
      });
      _jobServiceInstance = new JobService(db);
    } catch (err) {
      // Fall back to async initialization
      console.warn('[JobService] Synchronous initialization failed. Use initJobService() for async usage.');
      throw err;
    }
  }
  return _jobServiceInstance;
};

export const jobService = initServiceSync();

export const jobsService = jobService;

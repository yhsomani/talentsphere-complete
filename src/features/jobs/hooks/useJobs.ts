import { useState, useEffect, useCallback } from 'react';
import { jobService } from '@/services/jobs.service';
import type { Job, JobListing, JobFilters, JobStatus } from '@/types';

interface UseJobsOptions {
  initialFilters?: JobFilters;
  pageSize?: number;
  enabled?: boolean;
}

interface UseJobsReturn {
  // Data
  jobs: JobListing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  
  // Loading & Error states
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  
  // Filters & Pagination
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  resetFilters: () => void;
  
  // Pagination handlers
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Actions
  bookmarkJob: (jobId: string) => Promise<void>;
  removeBookmark: (jobId: string) => Promise<void>;
  isBookmarked: (jobId: string) => boolean;
  
  // Derived state
  isEmpty: boolean;
  currentPage: number;
  totalPages: number;
}

/**
 * Hook for managing job listings with filtering, pagination, and actions
 */
export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const {
    initialFilters = {},
    pageSize = 20,
    enabled = true
  } = options;

  // State
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState<JobFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Load jobs
  const loadJobs = useCallback(async (pageNum: number, append = false) => {
    if (!enabled) return;

    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await jobService.getJobs(filters, pageNum, pageSize);
      
      setJobs(prev => append ? [...prev, ...result.jobs] : result.jobs);
      setTotal(result.total);
      setPage(result.page);
      setBookmarkedIds(new Set(result.jobs.filter(j => j.is_bookmarked).map(j => j.id)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load jobs'));
      console.error('useJobs: Error loading jobs:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, pageSize, enabled]);

  // Initial load
  useEffect(() => {
    loadJobs(1);
  }, [filters, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter updates
  const setFilters = useCallback((newFilters: JobFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on filter change
    setJobs([]); // Clear current jobs
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({});
    setPage(1);
    setJobs([]);
  }, []);

  // Load more for infinite scroll
  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    const maxPage = Math.ceil(total / pageSize);
    
    if (nextPage > maxPage || isLoadingMore) return;
    
    await loadJobs(nextPage, true);
  }, [page, total, pageSize, isLoadingMore, loadJobs]);

  // Refresh
  const refresh = useCallback(async () => {
    await loadJobs(1);
  }, [loadJobs]);

  // Bookmark actions
  const bookmarkJob = useCallback(async (jobId: string) => {
    try {
      // Optimistic update
      setBookmarkedIds(prev => new Set(prev).add(jobId));
      
      // In a real app, you'd get userId from auth context
      const userId = 'current-user-id'; // TODO: Get from auth
      await jobService.bookmarkJob(jobId, userId);
    } catch (err) {
      // Revert on error
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      console.error('Failed to bookmark job:', err);
    }
  }, []);

  const removeBookmark = useCallback(async (jobId: string) => {
    try {
      // Optimistic update
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      
      const userId = 'current-user-id'; // TODO: Get from auth
      await jobService.removeBookmark(jobId, userId);
    } catch (err) {
      // Revert on error
      setBookmarkedIds(prev => new Set(prev).add(jobId));
      console.error('Failed to remove bookmark:', err);
    }
  }, []);

  const isBookmarked = useCallback((jobId: string) => {
    return bookmarkedIds.has(jobId);
  }, [bookmarkedIds]);

  // Derived state
  const isEmpty = jobs.length === 0 && !isLoading;
  const currentPage = page;
  const totalPages = Math.ceil(total / pageSize);

  return {
    // Data
    jobs,
    total,
    page,
    limit: pageSize,
    hasMore: page * pageSize < total,
    
    // Loading & Error states
    isLoading,
    isLoadingMore,
    error,
    
    // Filters & Pagination
    filters,
    setFilters,
    resetFilters,
    
    // Pagination handlers
    loadMore,
    refresh,
    
    // Actions
    bookmarkJob,
    removeBookmark,
    isBookmarked,
    
    // Derived state
    isEmpty,
    currentPage,
    totalPages
  };
}

/**
 * Hook for a single job
 */
export function useJob(jobId: string | undefined) {
  const [job, setJob] = useState<JobListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const loadJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await jobService.getJobById(jobId);
        setJob(data);
        setIsBookmarked(data.is_bookmarked ?? false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load job'));
        console.error('useJob: Error loading job:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  const bookmark = async () => {
    if (!jobId) return;
    
    setIsBookmarked(true);
    const userId = 'current-user-id'; // TODO: Get from auth
    try {
      await jobService.bookmarkJob(jobId, userId);
    } catch (err) {
      setIsBookmarked(false);
      console.error('Failed to bookmark job:', err);
    }
  };

  const removeBookmark = async () => {
    if (!jobId) return;
    
    setIsBookmarked(false);
    const userId = 'current-user-id'; // TODO: Get from auth
    try {
      await jobService.removeBookmark(jobId, userId);
    } catch (err) {
      setIsBookmarked(true);
      console.error('Failed to remove bookmark:', err);
    }
  };

  return {
    job,
    isLoading,
    error,
    isBookmarked,
    bookmark,
    removeBookmark,
    refresh: () => jobId && jobService.getJobById(jobId).then(setJob)
  };
}

/**
 * Hook for recruiter's jobs
 */
export function useRecruiterJobs(recruiterId: string | undefined, status?: JobStatus) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!recruiterId) {
      setIsLoading(false);
      return;
    }

    const loadJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await jobService.getRecruiterJobs(recruiterId, status);
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load jobs'));
        console.error('useRecruiterJobs: Error loading jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [recruiterId, status]);

  return {
    jobs,
    isLoading,
    error,
    refresh: () => recruiterId && jobService.getRecruiterJobs(recruiterId, status).then(setJobs)
  };
}

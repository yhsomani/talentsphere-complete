import { DomainError } from './index.js';
import type { Job } from './jobs.js';

export type AlertFrequency = 'instant' | 'daily' | 'weekly' | 'never';

export interface SearchCriteria {
  query?: string;
  location?: string;
  workMode?: 'remote' | 'hybrid' | 'onsite';
  jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
  requiredSkillIds?: string[];
  salaryMinMinor?: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  title: string;
  criteria: SearchCriteria;
  alertFrequency: AlertFrequency;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobAlert {
  id: string;
  userId: string;
  savedSearchId: string;
  jobId: string;
  isRead: boolean;
  deliveredAt: string;
  createdAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export const MAX_ACTIVE_SAVED_SEARCHES = 20;

export interface CreateSavedSearchParams {
  id?: string;
  userId: string;
  title: string;
  criteria: SearchCriteria;
  alertFrequency?: AlertFrequency;
  existingSearches: SavedSearch[];
}

/**
 * Creates a new saved search for a candidate.
 * Enforces per-user active saved search limits and title requirements.
 */
export function createSavedSearch(params: CreateSavedSearchParams): SavedSearch {
  const { userId, title, criteria, alertFrequency = 'daily', existingSearches } = params;

  if (!title || title.trim().length < 2) {
    throw new DomainError('VALIDATION_FAILED', 'Saved search title must be at least 2 characters.');
  }

  const activeCount = existingSearches.filter((s) => s.userId === userId && s.isActive).length;
  if (activeCount >= MAX_ACTIVE_SAVED_SEARCHES) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `Cannot exceed maximum limit of ${MAX_ACTIVE_SAVED_SEARCHES} active saved searches per user.`
    );
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    userId,
    title: title.trim(),
    criteria: {
      query: criteria.query?.trim() || undefined,
      location: criteria.location?.trim() || undefined,
      workMode: criteria.workMode,
      jobType: criteria.jobType,
      requiredSkillIds:
        criteria.requiredSkillIds && criteria.requiredSkillIds.length > 0
          ? criteria.requiredSkillIds
          : undefined,
      salaryMinMinor:
        criteria.salaryMinMinor !== undefined && criteria.salaryMinMinor > 0
          ? criteria.salaryMinMinor
          : undefined,
    },
    alertFrequency,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateSavedSearchParams {
  title?: string;
  criteria?: Partial<SearchCriteria>;
  alertFrequency?: AlertFrequency;
  isActive?: boolean;
}

/**
 * Updates an existing saved search.
 */
export function updateSavedSearch(
  search: SavedSearch,
  updates: UpdateSavedSearchParams
): SavedSearch {
  const now = new Date().toISOString();

  let nextCriteria = { ...search.criteria };
  if (updates.criteria) {
    nextCriteria = {
      ...nextCriteria,
      ...updates.criteria,
    };
  }

  return {
    ...search,
    title: updates.title !== undefined ? updates.title.trim() : search.title,
    criteria: nextCriteria,
    alertFrequency:
      updates.alertFrequency !== undefined ? updates.alertFrequency : search.alertFrequency,
    isActive: updates.isActive !== undefined ? updates.isActive : search.isActive,
    updatedAt: now,
  };
}

/**
 * Matches a job against saved search criteria.
 */
export function matchJobAgainstCriteria(job: Job, criteria: SearchCriteria): boolean {
  if (job.status !== 'published') {
    return false;
  }

  // 1. Keyword query matching (title or description)
  if (criteria.query && criteria.query.trim().length > 0) {
    const q = criteria.query.toLowerCase().trim();
    const titleMatch = job.title.toLowerCase().includes(q);
    const descMatch = job.description.toLowerCase().includes(q);
    if (!titleMatch && !descMatch) {
      return false;
    }
  }

  // 2. Location matching
  if (criteria.location && criteria.location.trim().length > 0) {
    const loc = criteria.location.toLowerCase().trim();
    if (!job.location || !job.location.toLowerCase().includes(loc)) {
      return false;
    }
  }

  // 3. Work mode matching
  if (criteria.workMode && job.workMode) {
    if (job.workMode !== criteria.workMode) {
      return false;
    }
  }

  // 4. Job type matching
  if (criteria.jobType && job.jobType) {
    if (job.jobType !== criteria.jobType) {
      return false;
    }
  }

  // 5. Salary minimum matching
  if (criteria.salaryMinMinor !== undefined && criteria.salaryMinMinor > 0) {
    if (!job.salaryRange || job.salaryRange.maxMinor < criteria.salaryMinMinor) {
      return false;
    }
  }

  // 6. Required skills matching (job must contain at least one requested skill)
  if (criteria.requiredSkillIds && criteria.requiredSkillIds.length > 0) {
    const hasMatchingSkill = criteria.requiredSkillIds.some((sid) =>
      job.requiredSkillIds.includes(sid)
    );
    if (!hasMatchingSkill) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluates active saved searches against a newly published job and generates alerts (new-only, no backfill per SSOT line 1018).
 */
export function evaluateJobAlertsForPublishedJob(
  job: Job,
  activeSearches: SavedSearch[]
): JobAlert[] {
  if (job.status !== 'published') {
    return [];
  }

  const generatedAlerts: JobAlert[] = [];
  const now = new Date().toISOString();

  for (const search of activeSearches) {
    if (!search.isActive || search.alertFrequency === 'never') {
      continue;
    }

    if (matchJobAgainstCriteria(job, search.criteria)) {
      generatedAlerts.push({
        id: crypto.randomUUID(),
        userId: search.userId,
        savedSearchId: search.id,
        jobId: job.id,
        isRead: false,
        deliveredAt: now,
        createdAt: now,
      });
    }
  }

  return generatedAlerts;
}

/**
 * Saves/bookmarks a job for a candidate.
 */
export function createSavedJob(
  userId: string,
  jobId: string,
  existingSavedJobs: SavedJob[]
): SavedJob {
  const existing = existingSavedJobs.find((s) => s.userId === userId && s.jobId === jobId);
  if (existing) {
    throw new DomainError('CONFLICT', 'Job is already saved in your bookmarks.');
  }

  return {
    id: crypto.randomUUID(),
    userId,
    jobId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Removes a job from candidate's saved list.
 */
export function removeSavedJob(
  userId: string,
  jobId: string,
  existingSavedJobs: SavedJob[]
): SavedJob[] {
  const existing = existingSavedJobs.find((s) => s.userId === userId && s.jobId === jobId);
  if (!existing) {
    throw new DomainError('NOT_FOUND', 'Saved job bookmark not found.');
  }

  return existingSavedJobs.filter((s) => !(s.userId === userId && s.jobId === jobId));
}

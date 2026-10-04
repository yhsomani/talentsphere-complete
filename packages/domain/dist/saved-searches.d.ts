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
export declare const MAX_ACTIVE_SAVED_SEARCHES = 20;
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
export declare function createSavedSearch(params: CreateSavedSearchParams): SavedSearch;
export interface UpdateSavedSearchParams {
    title?: string;
    criteria?: Partial<SearchCriteria>;
    alertFrequency?: AlertFrequency;
    isActive?: boolean;
}
/**
 * Updates an existing saved search.
 */
export declare function updateSavedSearch(search: SavedSearch, updates: UpdateSavedSearchParams): SavedSearch;
/**
 * Matches a job against saved search criteria.
 */
export declare function matchJobAgainstCriteria(job: Job, criteria: SearchCriteria): boolean;
/**
 * Evaluates active saved searches against a newly published job and generates alerts (new-only, no backfill per SSOT line 1018).
 */
export declare function evaluateJobAlertsForPublishedJob(job: Job, activeSearches: SavedSearch[]): JobAlert[];
/**
 * Saves/bookmarks a job for a candidate.
 */
export declare function createSavedJob(userId: string, jobId: string, existingSavedJobs: SavedJob[]): SavedJob;
/**
 * Removes a job from candidate's saved list.
 */
export declare function removeSavedJob(userId: string, jobId: string, existingSavedJobs: SavedJob[]): SavedJob[];
//# sourceMappingURL=saved-searches.d.ts.map
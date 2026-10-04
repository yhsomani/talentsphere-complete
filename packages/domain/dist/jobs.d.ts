import { type Role } from './core.js';
export type JobStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'paused' | 'closed' | 'archived';
export interface Job {
    id: string;
    orgId: string;
    title: string;
    description: string;
    location: string;
    workMode?: 'remote' | 'hybrid' | 'onsite';
    jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
    status: JobStatus;
    requiredSkillIds: string[];
    salaryRange?: {
        minMinor: number;
        maxMinor: number;
        currency: string;
    };
    createdAt: string;
    updatedAt: string;
}
export declare const ALLOWED_JOB_TRANSITIONS: Record<JobStatus, JobStatus[]>;
export declare function canTransitionJob(from: JobStatus, to: JobStatus): boolean;
export interface CreateJobParams {
    id?: string;
    orgId: string;
    title: string;
    description: string;
    location: string;
    workMode?: 'remote' | 'hybrid' | 'onsite';
    jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
    requiredSkillIds?: string[];
    salaryRange?: {
        minMinor: number;
        maxMinor: number;
        currency: string;
    };
    actor: {
        userId: string;
        roles: Role[];
        orgId?: string;
    };
}
/**
 * Creates a job posting.
 * Under BR-01 & BR-12: Must be created by an authorized recruiter for their organization.
 */
export declare function createJobPosting(params: CreateJobParams): Job;
/**
 * Transitions job lifecycle status with role and ownership checks.
 */
export declare function transitionJobStatus(job: Job, targetStatus: JobStatus, actor: {
    userId: string;
    roles: Role[];
    orgId?: string;
}): Job;
//# sourceMappingURL=jobs.d.ts.map
import { DomainError, type Role } from './core.js';

export type JobStatus =
  'draft' | 'pending_approval' | 'approved' | 'published' | 'paused' | 'closed' | 'archived';

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

export const ALLOWED_JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ['pending_approval', 'published', 'archived'],
  pending_approval: ['approved', 'draft', 'archived'],
  approved: ['published', 'draft', 'archived'],
  published: ['paused', 'closed', 'archived'],
  paused: ['published', 'closed', 'archived'],
  closed: ['archived'],
  archived: [],
};

export function canTransitionJob(from: JobStatus, to: JobStatus): boolean {
  return ALLOWED_JOB_TRANSITIONS[from]?.includes(to) ?? false;
}

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
export function createJobPosting(params: CreateJobParams): Job {
  const isAuthorizedRecruiter =
    params.actor.roles.includes('recruiter') || params.actor.roles.includes('platform_admin');

  if (!isAuthorizedRecruiter) {
    throw new DomainError('FORBIDDEN', 'Only recruiters or administrators may post jobs (BR-01).');
  }

  if (
    params.actor.orgId &&
    params.actor.orgId !== params.orgId &&
    !params.actor.roles.includes('platform_admin')
  ) {
    throw new DomainError(
      'FORBIDDEN',
      'Recruiters may only post jobs for their assigned organization (BR-12).'
    );
  }

  if (!params.title || params.title.trim().length < 3) {
    throw new DomainError('VALIDATION_FAILED', 'Job title must be at least 3 characters.');
  }

  if (!params.description || params.description.trim().length < 10) {
    throw new DomainError('VALIDATION_FAILED', 'Job description must be at least 10 characters.');
  }

  if (!params.location || params.location.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Job location is required.');
  }

  if (params.salaryRange) {
    if (
      params.salaryRange.minMinor < 0 ||
      params.salaryRange.maxMinor < params.salaryRange.minMinor
    ) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Invalid salary range: min must be non-negative and max >= min.'
      );
    }
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    orgId: params.orgId,
    title: params.title.trim(),
    description: params.description.trim(),
    location: params.location.trim(),
    workMode: params.workMode,
    jobType: params.jobType,
    status: 'draft',
    requiredSkillIds: params.requiredSkillIds || [],
    salaryRange: params.salaryRange,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Transitions job lifecycle status with role and ownership checks.
 */
export function transitionJobStatus(
  job: Job,
  targetStatus: JobStatus,
  actor: { userId: string; roles: Role[]; orgId?: string }
): Job {
  const isAuthorized =
    actor.roles.includes('platform_admin') ||
    (actor.roles.includes('recruiter') && actor.orgId === job.orgId);

  if (!isAuthorized) {
    throw new DomainError(
      'FORBIDDEN',
      'You do not have permission to manage this job posting (BR-12).'
    );
  }

  if (!canTransitionJob(job.status, targetStatus)) {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Cannot transition job from ${job.status} to ${targetStatus} (BR-11).`
    );
  }

  const now = new Date().toISOString();
  return {
    ...job,
    status: targetStatus,
    updatedAt: now,
  };
}

/**
 * Shapes of the API responses the web app reads. They mirror the domain
 * types (packages/domain) as serialized by apps/api — kept here, narrowly, so
 * the browser bundle does not pull in server-side domain code.
 */

export interface OrganizationRef {
  id: string;
  name: string;
  slug?: string;
}

export interface Job {
  id: string;
  orgId: string;
  title: string;
  description: string;
  location: string;
  workMode?: 'remote' | 'hybrid' | 'onsite';
  jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
  status: string;
  requiredSkillIds: string[];
  salaryRange?: { minMinor: number; maxMinor: number; currency: string };
  createdAt: string;
  updatedAt: string;
  organization?: OrganizationRef;
  /** Hiring-side listing only (GET /organizations/:id/jobs). */
  applicationCounts?: Record<string, number>;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  coverLetter?: string;
  attachedEvidenceIds: string[];
  submittedAt?: string;
  withdrawnAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  hiredAt?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

export interface EvidenceItem {
  id: string;
  subjectId: string;
  type: string;
  title: string;
  description: string;
  source: string;
  status: string;
  verificationLevel: string;
  recencyDate: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  location?: string;
}

export interface Applicant extends Application {
  candidate?: CandidateProfile;
  evidence: EvidenceItem[];
  workHistorySummary: {
    roles: number;
    emailVerifiedRoles: number;
    bestTier: 'gold' | 'silver' | 'bronze' | 'none';
  };
}

/** Mirrors ALLOWED_APPLICATION_TRANSITIONS (packages/domain/src/core.ts). */
export const APPLICATION_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['in_review', 'withdrawn', 'rejected'],
  in_review: ['shortlisted', 'rejected', 'withdrawn'],
  shortlisted: ['interviewing', 'rejected', 'withdrawn'],
  interviewing: ['offered', 'rejected', 'withdrawn'],
  offered: ['hired', 'rejected', 'withdrawn'],
  hired: [],
  rejected: [],
  withdrawn: [],
  expired: [],
};

export const ACTIVE_APPLICATION_STATUSES = [
  'submitted',
  'in_review',
  'shortlisted',
  'interviewing',
  'offered',
];

/** Mirrors ALLOWED_JOB_TRANSITIONS (packages/domain/src/jobs.ts). */
export const JOB_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_approval', 'published', 'archived'],
  pending_approval: ['approved', 'draft', 'archived'],
  approved: ['published', 'draft', 'archived'],
  published: ['paused', 'closed', 'archived'],
  paused: ['published', 'closed', 'archived'],
  closed: ['archived'],
  archived: [],
};

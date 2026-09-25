/**
 * TalentSphere Canonical Domain Model
 * Pure domain representations, invariants, and business rules.
 */

export * from './auth.js';
export * from './profile.js';
export * from './evidence.js';
export * from './skills.js';
export * from './jobs.js';
export * from './applications.js';
export * from './challenges.js';
export * from './assessment.js';
export * from './lms.js';
export * from './messaging.js';
export * from './notifications.js';
export * from './ai-gateway.js';
export * from './resumes.js';
export * from './networking.js';
export * from './portfolio.js';
export * from './gamification.js';
export * from './settings.js';
export * from './billing.js';
export * from './admin.js';
export * from './search.js';
export * from './moderation.js';
export * from './saved-searches.js';
export * from './application-drafts.js';
export * from './analytics.js';
export * from './job-templates.js';
export * from './salary-intelligence.js';
export * from './application-feedback.js';
export * from './skill-decay.js';
export * from './technical-interview.js';
export * from './reputation-engine.js';
export * from './warm-introductions.js';
export * from './referral-requests.js';
export * from './activity-contributions.js';
export * from './instructor-reputation.js';
export * from './peer-credibility.js';
export * from './alumni-networks.js';

export type Role =
  | 'candidate'
  | 'recruiter'
  | 'hiring_manager'
  | 'course_author'
  | 'instructor'
  | 'institution_admin'
  | 'platform_admin'
  | 'moderator'
  | 'verification_staff'
  | 'service_account';

export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'deactivated';

export interface User {
  id: string;
  email: string;
  roles: Role[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  privacy: ProfilePrivacy;
  createdAt: string;
  updatedAt: string;
}

export type ProfilePrivacy = 'public' | 'connections_only' | 'recruiters_only' | 'private';

export type EvidenceType =
  | 'self_declaration'
  | 'course_completion'
  | 'assessment'
  | 'project'
  | 'work_experience'
  | 'contribution'
  | 'employer_verification'
  | 'institution_credential'
  | 'external_verification';

export type VerificationLevel = 'unverified' | 'peer_reviewed' | 'institution_verified' | 'authority_verified';

export type EvidenceStatus = 'pending' | 'verified' | 'disputed' | 'revoked' | 'expired';

export interface Evidence {
  id: string;
  subjectId: string;
  type: EvidenceType;
  title: string;
  description: string;
  source: string;
  provenance: string;
  verificationLevel: VerificationLevel;
  verifiedBy?: string;
  verifiedAt?: string;
  status: EvidenceStatus;
  conflictState?: 'none' | 'disputed' | 'overridden';
  recencyDate: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationState =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'shortlisted'
  | 'interviewing'
  | 'offered'
  | 'hired'
  | 'rejected'
  | 'withdrawn'
  | 'expired';

export const ALLOWED_APPLICATION_TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
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

export function canTransitionApplication(from: ApplicationState, to: ApplicationState): boolean {
  return ALLOWED_APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export type AssessmentPolicyMode =
  | 'AI_PROHIBITED'
  | 'AI_RESTRICTED'
  | 'AI_ALLOWED'
  | 'POST_ASSESSMENT_ONLY';

export interface AssessmentSession {
  id: string;
  candidateId: string;
  assessmentId: string;
  policyMode: AssessmentPolicyMode;
  startTime: string;
  endTime?: string;
  timeLimitSeconds: number;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'timed_out' | 'abandoned' | 'invalidated';
}

export function isAIAssistanceAllowed(policyMode: AssessmentPolicyMode): boolean {
  return policyMode === 'AI_ALLOWED';
}

export type DomainErrorCode =
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_FAILED'
  | 'INVALID_STATE_TRANSITION'
  | 'ASSESSMENT_AI_PROHIBITED'
  | 'FREE_USER_AI_QUOTA_EXCEEDED'
  | 'POLICY_VIOLATION'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TENANT_ISOLATION_VIOLATION'
  | 'INTERNAL_ERROR';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

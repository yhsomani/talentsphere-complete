/**
 * Core domain primitives (roles, user/profile/evidence shapes, application state
 * machine, assessment policy, DomainError).
 *
 * This module deliberately has NO imports. Sibling modules import from here
 * rather than from the package barrel `index.ts`, because `index.ts` re-exports
 * those same siblings — importing the barrel from inside the package creates a
 * circular dependency (auth.ts -> index.ts -> auth.ts) that breaks tree-shaking
 * and yields `undefined` bindings under some module-evaluation orders.
 *
 * `index.ts` re-exports everything here, so the public API is unchanged.
 */
export type Role = 'candidate' | 'recruiter' | 'hiring_manager' | 'course_author' | 'instructor' | 'institution_admin' | 'platform_admin' | 'moderator' | 'verification_staff' | 'service_account';
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
export type EvidenceType = 'self_declaration' | 'course_completion' | 'assessment' | 'project' | 'work_experience' | 'contribution' | 'employer_verification' | 'institution_credential' | 'external_verification';
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
export type ApplicationState = 'draft' | 'submitted' | 'in_review' | 'shortlisted' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn' | 'expired';
export declare const ALLOWED_APPLICATION_TRANSITIONS: Record<ApplicationState, ApplicationState[]>;
export declare function canTransitionApplication(from: ApplicationState, to: ApplicationState): boolean;
export type AssessmentPolicyMode = 'AI_PROHIBITED' | 'AI_RESTRICTED' | 'AI_ALLOWED' | 'POST_ASSESSMENT_ONLY';
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
export declare function isAIAssistanceAllowed(policyMode: AssessmentPolicyMode): boolean;
export type DomainErrorCode = 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_FAILED' | 'INVALID_STATE_TRANSITION' | 'ASSESSMENT_AI_PROHIBITED' | 'FREE_USER_AI_QUOTA_EXCEEDED' | 'POLICY_VIOLATION' | 'RATE_LIMIT_EXCEEDED' | 'TENANT_ISOLATION_VIOLATION' | 'INTERNAL_ERROR';
export declare class DomainError extends Error {
    readonly code: DomainErrorCode;
    readonly details?: unknown | undefined;
    constructor(code: DomainErrorCode, message: string, details?: unknown | undefined);
}
//# sourceMappingURL=core.d.ts.map
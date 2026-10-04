import { type Role } from './core.js';
export type FeedbackReasonCategory = 'skills_gap' | 'experience_gap' | 'culture_fit' | 'overqualified' | 'position_filled' | 'compensation_mismatch' | 'other';
export type FeedbackStatus = 'pending' | 'provided' | 'viewed' | 'requested' | 'responded' | 'skipped';
export interface ApplicationFeedback {
    id: string;
    applicationId: string;
    candidateId: string;
    jobId: string;
    orgId: string;
    authorId: string;
    stage: string;
    reasonCategory: FeedbackReasonCategory;
    strengths: string;
    areasForImprovement: string;
    actionableAdvice: string;
    suggestedSkillIds: string[];
    isAiAssisted: boolean;
    humanReviewed: boolean;
    status: FeedbackStatus;
    requestedAt?: string;
    viewedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface FeedbackTemplate {
    id: string;
    orgId: string;
    templateName: string;
    stage: string;
    reasonCategory: FeedbackReasonCategory;
    defaultStrengths?: string;
    defaultAreasForImprovement?: string;
    defaultActionableAdvice?: string;
    createdAt: string;
    updatedAt: string;
}
export interface FeedbackActorContext {
    userId: string;
    roles: Role[];
    orgId?: string;
}
export interface CreateApplicationFeedbackParams {
    id?: string;
    applicationId: string;
    candidateId: string;
    jobId: string;
    orgId: string;
    stage: string;
    reasonCategory: FeedbackReasonCategory;
    strengths: string;
    areasForImprovement: string;
    actionableAdvice: string;
    suggestedSkillIds?: string[];
    isAiAssisted?: boolean;
    humanReviewed?: boolean;
    actor: FeedbackActorContext;
}
export interface CreateFeedbackTemplateParams {
    id?: string;
    orgId: string;
    templateName: string;
    stage: string;
    reasonCategory: FeedbackReasonCategory;
    defaultStrengths?: string;
    defaultAreasForImprovement?: string;
    defaultActionableAdvice?: string;
    actor: FeedbackActorContext;
}
/**
 * Creates structured candidate feedback upon application progression or rejection (F-122, BR-217..BR-224, P-02).
 */
export declare function createApplicationFeedback(params: CreateApplicationFeedbackParams): ApplicationFeedback;
/**
 * Validates candidate's request for follow-up feedback within a 30-day window (BR-222).
 */
export declare function requestApplicationFeedback(applicationUpdatedAt: string, candidateProfileUserId: string, requestingUserId: string): {
    requestedAt: string;
};
/**
 * Marks feedback as viewed by the candidate (BR-219).
 */
export declare function markFeedbackViewed(feedback: ApplicationFeedback, candidateProfileUserId: string, requestingUserId: string): ApplicationFeedback;
/**
 * Computes anonymized aggregate insights on application rejections (BR-220: k >= 10).
 */
export declare function computeFeedbackAggregateInsights(feedbacks: ApplicationFeedback[], minCohortSize?: number): {
    totalEvaluated: number;
    categoryBreakdown: Record<string, {
        count: number;
        percentage: number;
    }>;
    isPrivacyProtected: boolean;
};
/**
 * Creates an organization-configurable feedback template (BR-224).
 */
export declare function createFeedbackTemplate(params: CreateFeedbackTemplateParams): FeedbackTemplate;
//# sourceMappingURL=application-feedback.d.ts.map
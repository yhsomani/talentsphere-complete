import { DomainError, type Role } from './index.js';

export type FeedbackReasonCategory =
  | 'skills_gap'
  | 'experience_gap'
  | 'culture_fit'
  | 'overqualified'
  | 'position_filled'
  | 'compensation_mismatch'
  | 'other';

export type FeedbackStatus =
  | 'pending'
  | 'provided'
  | 'viewed'
  | 'requested'
  | 'responded'
  | 'skipped';

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
export function createApplicationFeedback(params: CreateApplicationFeedbackParams): ApplicationFeedback {
  const isAuthorized =
    params.actor.roles.includes('recruiter') ||
    params.actor.roles.includes('hiring_manager') ||
    params.actor.roles.includes('platform_admin');

  if (!isAuthorized) {
    throw new DomainError('FORBIDDEN', 'Only recruiters, hiring managers, or platform administrators may provide application feedback.');
  }

  if (params.actor.orgId && params.actor.orgId !== params.orgId && !params.actor.roles.includes('platform_admin')) {
    throw new DomainError('FORBIDDEN', 'Recruiters may only provide feedback for their assigned organization (BR-12).');
  }

  // BR-217: Minimum reason category required on rejection
  const validCategories: FeedbackReasonCategory[] = [
    'skills_gap',
    'experience_gap',
    'culture_fit',
    'overqualified',
    'position_filled',
    'compensation_mismatch',
    'other',
  ];
  if (!params.reasonCategory || !validCategories.includes(params.reasonCategory)) {
    throw new DomainError('VALIDATION_FAILED', 'A valid reason category is required (BR-217).');
  }

  if (!params.strengths || params.strengths.trim().length < 5) {
    throw new DomainError('VALIDATION_FAILED', 'Candidate strengths description must be at least 5 characters.');
  }

  if (!params.areasForImprovement || params.areasForImprovement.trim().length < 5) {
    throw new DomainError('VALIDATION_FAILED', 'Areas for improvement must be at least 5 characters.');
  }

  // BR-223: Negative feedback must include actionable element
  if (!params.actionableAdvice || params.actionableAdvice.trim().length < 5) {
    throw new DomainError('VALIDATION_FAILED', 'Actionable advice is required to support candidate dignity and growth (BR-223, P-02).');
  }

  // BR-221: AI drafts require human review before sending
  const isAiAssisted = params.isAiAssisted === true;
  const humanReviewed = params.humanReviewed !== false; // defaults to true
  if (isAiAssisted && !humanReviewed) {
    throw new DomainError('POLICY_VIOLATION', 'AI-assisted feedback must be human-reviewed before delivery to candidate (BR-221).');
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    applicationId: params.applicationId,
    candidateId: params.candidateId,
    jobId: params.jobId,
    orgId: params.orgId,
    authorId: params.actor.userId,
    stage: params.stage.trim(),
    reasonCategory: params.reasonCategory,
    strengths: params.strengths.trim(),
    areasForImprovement: params.areasForImprovement.trim(),
    actionableAdvice: params.actionableAdvice.trim(),
    suggestedSkillIds: params.suggestedSkillIds ? [...params.suggestedSkillIds] : [],
    isAiAssisted,
    humanReviewed,
    status: 'provided',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validates candidate's request for follow-up feedback within a 30-day window (BR-222).
 */
export function requestApplicationFeedback(
  applicationUpdatedAt: string,
  candidateProfileUserId: string,
  requestingUserId: string
): { requestedAt: string } {
  if (candidateProfileUserId !== requestingUserId) {
    throw new DomainError('FORBIDDEN', 'Candidates may only request feedback for their own applications.');
  }

  const decisionTime = new Date(applicationUpdatedAt).getTime();
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (now - decisionTime > thirtyDaysMs) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Feedback requests must be submitted within 30 days of application decision (BR-222).'
    );
  }

  return {
    requestedAt: new Date(now).toISOString(),
  };
}

/**
 * Marks feedback as viewed by the candidate (BR-219).
 */
export function markFeedbackViewed(
  feedback: ApplicationFeedback,
  candidateProfileUserId: string,
  requestingUserId: string
): ApplicationFeedback {
  if (candidateProfileUserId !== requestingUserId) {
    throw new DomainError('FORBIDDEN', 'Application feedback is private and visible only to the candidate (BR-219).');
  }

  if (feedback.status === 'viewed') {
    return feedback;
  }

  const now = new Date().toISOString();
  return {
    ...feedback,
    status: 'viewed',
    viewedAt: now,
    updatedAt: now,
  };
}

/**
 * Computes anonymized aggregate insights on application rejections (BR-220: k >= 10).
 */
export function computeFeedbackAggregateInsights(
  feedbacks: ApplicationFeedback[],
  minCohortSize: number = 10
): {
  totalEvaluated: number;
  categoryBreakdown: Record<string, { count: number; percentage: number }>;
  isPrivacyProtected: boolean;
} {
  if (feedbacks.length < minCohortSize) {
    return {
      totalEvaluated: feedbacks.length,
      categoryBreakdown: {},
      isPrivacyProtected: true,
    };
  }

  const counts: Record<string, number> = {};
  for (const fb of feedbacks) {
    counts[fb.reasonCategory] = (counts[fb.reasonCategory] || 0) + 1;
  }

  const categoryBreakdown: Record<string, { count: number; percentage: number }> = {};
  for (const [cat, count] of Object.entries(counts)) {
    categoryBreakdown[cat] = {
      count,
      percentage: Math.round((count / feedbacks.length) * 100),
    };
  }

  return {
    totalEvaluated: feedbacks.length,
    categoryBreakdown,
    isPrivacyProtected: false,
  };
}

/**
 * Creates an organization-configurable feedback template (BR-224).
 */
export function createFeedbackTemplate(params: CreateFeedbackTemplateParams): FeedbackTemplate {
  const isAuthorized =
    params.actor.roles.includes('recruiter') ||
    params.actor.roles.includes('hiring_manager') ||
    params.actor.roles.includes('platform_admin');

  if (!isAuthorized) {
    throw new DomainError('FORBIDDEN', 'Only recruiters or administrators may configure feedback templates.');
  }

  if (params.actor.orgId && params.actor.orgId !== params.orgId && !params.actor.roles.includes('platform_admin')) {
    throw new DomainError('FORBIDDEN', 'Cannot configure feedback templates for a foreign organization.');
  }

  if (!params.templateName || params.templateName.trim().length < 2) {
    throw new DomainError('VALIDATION_FAILED', 'Template name must be at least 2 characters.');
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    orgId: params.orgId,
    templateName: params.templateName.trim(),
    stage: params.stage.trim(),
    reasonCategory: params.reasonCategory,
    defaultStrengths: params.defaultStrengths?.trim(),
    defaultAreasForImprovement: params.defaultAreasForImprovement?.trim(),
    defaultActionableAdvice: params.defaultActionableAdvice?.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

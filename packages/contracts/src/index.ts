import { z } from 'zod';

/**
 * Standard Canonical Error Envelope
 * Per Section 20 of Master Execution Prompt and docs/engineering/API_CONTRACTS.md
 */
export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    request_id: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/**
 * Standard Pagination Schema
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginatedMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type PaginatedMeta = z.infer<typeof PaginatedMetaSchema>;

/**
 * Authentication Contracts
 */
export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['candidate', 'recruiter']).default('candidate'),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UserSessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    roles: z.array(z.string()),
  }),
  accessToken: z.string(),
  expiresAt: z.number(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

/**
 * Profile Contracts
 */
export const UpdateProfileInputSchema = z.object({
  fullName: z.string().min(2).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  privacy: z.enum(['public', 'connections_only', 'recruiters_only', 'private']).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/**
 * Evidence Contracts
 */
export const CreateEvidenceInputSchema = z.object({
  type: z.enum([
    'self_declaration',
    'course_completion',
    'assessment',
    'project',
    'work_experience',
    'contribution',
    'employer_verification',
    'institution_credential',
    'external_verification',
  ]),
  title: z.string().min(3).max(200),
  description: z.string().max(5000),
  source: z.string().max(500),
  provenance: z.string().max(500),
  recencyDate: z.string(),
  skillIds: z.array(z.string().uuid()).optional(),
});

export type CreateEvidenceInput = z.infer<typeof CreateEvidenceInputSchema>;

export const VerifyEvidenceInputSchema = z.object({
  verificationLevel: z.enum(['peer_reviewed', 'institution_verified', 'authority_verified']),
  notes: z.string().max(1000).optional(),
});

export type VerifyEvidenceInput = z.infer<typeof VerifyEvidenceInputSchema>;

export const DisputeEvidenceInputSchema = z.object({
  reason: z.string().min(5).max(1000),
});

export type DisputeEvidenceInput = z.infer<typeof DisputeEvidenceInputSchema>;

export const RevokeEvidenceInputSchema = z.object({
  reason: z.string().min(5).max(1000),
});

export type RevokeEvidenceInput = z.infer<typeof RevokeEvidenceInputSchema>;

/**
 * Skills & Taxonomy Contracts (BR-141..147)
 */
export const CreateSkillInputSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
});

export type CreateSkillInput = z.infer<typeof CreateSkillInputSchema>;

export const CreateSkillRelationshipInputSchema = z.object({
  sourceSkillId: z.string().uuid(),
  targetSkillId: z.string().uuid(),
  relationshipType: z.enum(['prerequisite_of', 'subskill_of', 'supersedes', 'correlates_with']),
  weight: z.number().min(0).max(1).default(1.0),
});

export type CreateSkillRelationshipInput = z.infer<typeof CreateSkillRelationshipInputSchema>;

/**
 * Organization Contracts
 */
export const CreateOrganizationInputSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  website: z.string().url().optional(),
  description: z.string().max(1000).optional(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationInputSchema>;

/**
 * Job Marketplace Contracts (F-04, F-05, BR-01..BR-12)
 */
export const CreateJobInputSchema = z.object({
  orgId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(10000),
  location: z.string().min(2).max(100),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  requiredSkillIds: z.array(z.string().uuid()).optional(),
  salaryMinMinor: z.number().int().nonnegative().optional(),
  salaryMaxMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
});

export type CreateJobInput = z.infer<typeof CreateJobInputSchema>;

export const UpdateJobStatusInputSchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'approved', 'published', 'paused', 'closed', 'archived']),
});

export type UpdateJobStatusInput = z.infer<typeof UpdateJobStatusInputSchema>;

/**
 * Job Application & ATS Pipeline Contracts (F-06, BR-02, BR-15..BR-41)
 */
export const SubmitApplicationInputSchema = z.object({
  coverLetter: z.string().max(3000).optional(),
  attachedEvidenceIds: z.array(z.string().uuid()).optional(),
});

export type SubmitApplicationInput = z.infer<typeof SubmitApplicationInputSchema>;

export const TransitionApplicationInputSchema = z.object({
  applicationId: z.string().uuid(),
  targetState: z.enum([
    'draft',
    'submitted',
    'in_review',
    'shortlisted',
    'interviewing',
    'offered',
    'hired',
    'rejected',
    'withdrawn',
  ]),
  reason: z.string().max(500).optional(),
});

export type TransitionApplicationInput = z.infer<typeof TransitionApplicationInputSchema>;

/**
 * Challenges Arena & Assessment Contracts (F-08, BR-24..BR-51)
 */
export const CreateChallengeInputSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(10000),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string().min(2).max(100),
  skillIds: z.array(z.string().uuid()).optional(),
  testCases: z.array(
    z.object({
      id: z.string().optional(),
      input: z.string(),
      expectedOutput: z.string(),
      isHidden: z.boolean().default(false),
    })
  ).min(2),
  timeLimitMs: z.number().int().min(100).max(30000).default(5000),
  memoryLimitMb: z.number().int().min(64).max(512).default(512),
  policyMode: z.enum(['AI_PROHIBITED', 'AI_RESTRICTED', 'AI_ALLOWED', 'POST_ASSESSMENT_ONLY']).default('AI_PROHIBITED'),
});

export type CreateChallengeInput = z.infer<typeof CreateChallengeInputSchema>;

export const SubmitChallengeSolutionInputSchema = z.object({
  sessionId: z.string().uuid().optional(),
  language: z.enum(['typescript', 'javascript', 'python', 'rust', 'go']),
  code: z.string().min(1).max(50000),
});

export type SubmitChallengeSolutionInput = z.infer<typeof SubmitChallengeSolutionInputSchema>;

/**
 * AI Assistant & Gateway Query Contract
 */
export const AIAssistantQueryInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

export type AIAssistantQueryInput = z.infer<typeof AIAssistantQueryInputSchema>;

/**
 * LMS & Course Contracts (F-07, BR-21..BR-48, BR-91, BR-92)
 */
export const CreateCourseInputSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10).max(5000),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedDurationMinutes: z.number().int().min(10).max(10000).default(60),
  passingScorePercent: z.number().int().min(1).max(100).default(70),
  xpReward: z.number().int().min(0).max(200).default(50),
  skillIds: z.array(z.string().uuid()).optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseInputSchema>;

export const CreateCourseModuleInputSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  orderIndex: z.number().int().min(0),
});

export type CreateCourseModuleInput = z.infer<typeof CreateCourseModuleInputSchema>;

export const CreateLessonInputSchema = z.object({
  title: z.string().min(2).max(200),
  contentType: z.enum(['text', 'video', 'interactive', 'quiz']).default('text'),
  contentBody: z.string().min(5).max(100000),
  durationMinutes: z.number().int().min(1).max(300).default(10),
  orderIndex: z.number().int().min(0),
  prerequisiteLessonId: z.string().uuid().optional(),
  isFreePreview: z.boolean().default(false),
});

export type CreateLessonInput = z.infer<typeof CreateLessonInputSchema>;

export const EnrollCourseInputSchema = z.object({
  courseId: z.string().uuid(),
});

export type EnrollCourseInput = z.infer<typeof EnrollCourseInputSchema>;

export const CompleteLessonInputSchema = z.object({
  lessonId: z.string().uuid(),
});

export type CompleteLessonInput = z.infer<typeof CompleteLessonInputSchema>;

/**
 * Direct Messaging Contracts (F-10, WF-10, BR-214)
 */
export const CreateThreadInputSchema = z.object({
  recipientId: z.string().uuid(),
  initialMessage: z.string().min(1).max(5000),
  subject: z.string().max(200).optional(),
  clientMessageId: z.string().max(100).optional(),
});

export type CreateThreadInput = z.infer<typeof CreateThreadInputSchema>;

export const SendMessageInputSchema = z.object({
  content: z.string().min(1).max(5000),
  clientMessageId: z.string().max(100).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

/**
 * Notification Center Contracts (F-14, BR-120)
 */
export const MarkNotificationsReadInputSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional(),
});

export type MarkNotificationsReadInput = z.infer<typeof MarkNotificationsReadInputSchema>;

export const UpdateNotificationPreferencesInputSchema = z.object({
  allowMessages: z.boolean().optional(),
  allowMentions: z.boolean().optional(),
  allowApplications: z.boolean().optional(),
  allowCourseUpdates: z.boolean().optional(),
  emailDigestFrequency: z.enum(['realtime', 'daily', 'weekly', 'never']).optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesInputSchema>;

/**
 * AI Gateway & Career Assistant Contracts (F-11, SSOT Section 16)
 */
export const CreateAIConversationInputSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  purpose: z.string().min(1).max(64).default('career_guidance'),
});

export type CreateAIConversationInput = z.infer<typeof CreateAIConversationInputSchema>;

export const AIChatInputSchema = z.object({
  conversationId: z.string().uuid().optional(),
  prompt: z.string().min(1).max(2000),
});

export type AIChatInput = z.infer<typeof AIChatInputSchema>;

/**
 * Resume Builder Contracts (F-13, BR-26)
 */
export const ResumeExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(3000).optional(),
  highlights: z.array(z.string().max(500)).optional(),
});

export const ResumeEducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  fieldOfStudy: z.string().max(200).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  gpa: z.string().max(20).optional(),
});

export const ResumeSkillItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  level: z.string().max(50).optional(),
  evidenceId: z.string().uuid().optional(),
});

export const CreateResumeInputSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  template: z.enum(['modern', 'minimal', 'executive', 'technical']).default('modern'),
  headline: z.string().max(255).optional(),
  summary: z.string().max(5000).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(64).optional(),
  location: z.string().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  experience: z.array(ResumeExperienceSchema).default([]),
  education: z.array(ResumeEducationSchema).default([]),
  skills: z.array(ResumeSkillItemSchema).default([]),
  evidenceIds: z.array(z.string().uuid()).default([]),
  isPrimary: z.boolean().default(false),
});

export type CreateResumeInput = z.infer<typeof CreateResumeInputSchema>;

export const UpdateResumeInputSchema = CreateResumeInputSchema.partial();
export type UpdateResumeInput = z.infer<typeof UpdateResumeInputSchema>;

export const ExportResumeInputSchema = z.object({
  format: z.enum(['json', 'markdown', 'html', 'pdf']).default('markdown'),
});

export type ExportResumeInput = z.infer<typeof ExportResumeInputSchema>;

/**
 * Professional Networking Contracts (F-09)
 */
export const RequestConnectionInputSchema = z.object({
  recipientId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export type RequestConnectionInput = z.infer<typeof RequestConnectionInputSchema>;

export const RespondConnectionInputSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export type RespondConnectionInput = z.infer<typeof RespondConnectionInputSchema>;

/**
 * Portfolio Showcase Contracts (F-26)
 */
export const PortfolioProjectMediaSchema = z.object({
  id: z.string().optional(),
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video', 'document']).default('image'),
  caption: z.string().max(255).optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export type PortfolioProjectMediaInput = z.infer<typeof PortfolioProjectMediaSchema>;

export const CreatePortfolioProjectInputSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(10000),
  projectUrl: z.string().url().max(500).optional(),
  repoUrl: z.string().url().max(500).optional(),
  visibility: z.enum(['public', 'connections_only', 'recruiters_only', 'private']).default('public'),
  featured: z.boolean().default(false),
  orderIndex: z.number().int().min(0).default(0),
  skillIds: z.array(z.string().uuid()).default([]),
  evidenceIds: z.array(z.string().uuid()).default([]),
  media: z.array(PortfolioProjectMediaSchema).default([]),
});

export type CreatePortfolioProjectInput = z.infer<typeof CreatePortfolioProjectInputSchema>;

export const UpdatePortfolioProjectInputSchema = CreatePortfolioProjectInputSchema.partial();
export type UpdatePortfolioProjectInput = z.infer<typeof UpdatePortfolioProjectInputSchema>;

/**
 * Gamification & XP Ledger Contracts (F-22, F-23, BR-25)
 */
export const ClaimGamificationActivityInputSchema = z.object({
  referenceType: z.string().min(1).max(64),
  referenceId: z.string().min(1).max(128),
  amount: z.number().int().min(1).max(200),
  description: z.string().max(255).optional(),
});

export type ClaimGamificationActivityInput = z.infer<typeof ClaimGamificationActivityInputSchema>;

export const GetLeaderboardQuerySchema = z.object({
  period: z.enum(['weekly', 'all_time']).default('all_time'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type GetLeaderboardQuery = z.infer<typeof GetLeaderboardQuerySchema>;

/**
 * Account Settings, Privacy & GDPR Erasure Contracts (F-15, §31, BR-06)
 */
export const UpdateUserSettingsInputSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).max(64).optional(),
  profileVisibility: z.enum(['public', 'connections_only', 'recruiters_only', 'private']).optional(),
  showEmail: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  allowConnectionRequests: z.boolean().optional(),
  allowDirectMessages: z.enum(['everyone', 'connections_only', 'none']).optional(),
  searchEngineIndexing: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  digestFrequency: z.enum(['realtime', 'daily', 'weekly', 'none']).optional(),
  twoFactorEnabled: z.boolean().optional(),
  byoAiKey: z.string().max(256).nullable().optional(),
  aiDataUsageConsent: z.boolean().optional(),
});

export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsInputSchema>;

export const RequestErasureInputSchema = z.object({
  reason: z.string().max(1000).optional(),
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'You must explicitly confirm account deletion to initiate the 30-day grace period.' }),
  }),
});

export type RequestErasureInput = z.infer<typeof RequestErasureInputSchema>;

export const CancelErasureInputSchema = z.object({
  requestId: z.string().uuid(),
});

export type CancelErasureInput = z.infer<typeof CancelErasureInputSchema>;

export const RequestDataExportInputSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
});

export type RequestDataExportInput = z.infer<typeof RequestDataExportInputSchema>;

/**
 * Billing & Subscriptions Contracts (F-16, Section 64, WF-16, WIT-016)
 */
export const SubscribePlanInputSchema = z.object({
  planTier: z.enum(['free', 'candidate_pro', 'recruiter_starter', 'recruiter_enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  paymentMethodId: z.string().min(1).max(100).optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export type SubscribePlanInput = z.infer<typeof SubscribePlanInputSchema>;

export const CancelSubscriptionInputSchema = z.object({
  immediate: z.boolean().default(false),
  reason: z.string().max(500).optional(),
});

export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionInputSchema>;

export const ProcessPaymentWebhookInputSchema = z.object({
  eventType: z.string().min(1).max(64),
  idempotencyKey: z.string().min(1).max(128),
  subscriptionId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  amountCents: z.number().int().min(0),
  currency: z.string().length(3).default('USD'),
});

export type ProcessPaymentWebhookInput = z.infer<typeof ProcessPaymentWebhookInputSchema>;

/**
 * Platform Administration & Governance Contracts (F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068)
 */
export const AdminUpdateUserStatusInputSchema = z.object({
  status: z.enum(['active', 'suspended', 'deactivated']),
  reason: z.string().min(3).max(500),
});

export type AdminUpdateUserStatusInput = z.infer<typeof AdminUpdateUserStatusInputSchema>;

export const AdminUpdateUserRolesInputSchema = z.object({
  roles: z.array(z.string()).min(1),
});

export type AdminUpdateUserRolesInput = z.infer<typeof AdminUpdateUserRolesInputSchema>;

export const AdminToggleFeatureFlagInputSchema = z.object({
  enabled: z.boolean(),
  description: z.string().max(255).optional(),
});

export type AdminToggleFeatureFlagInput = z.infer<typeof AdminToggleFeatureFlagInputSchema>;

export const AdminSetMaintenanceModeInputSchema = z.object({
  inMaintenance: z.boolean(),
  reason: z.string().max(255).optional(),
});

export type AdminSetMaintenanceModeInput = z.infer<typeof AdminSetMaintenanceModeInputSchema>;

export const AdminQueryAuditLogsSchema = z.object({
  actorId: z.string().uuid().optional(),
  eventName: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type AdminQueryAuditLogs = z.infer<typeof AdminQueryAuditLogsSchema>;

/**
 * Multi-Entity Search & Command Palette Contracts (F-20, F-34, F-32)
 */
export const SearchQueryInputSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['all', 'jobs', 'skills', 'courses', 'challenges', 'profiles', 'commands']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SearchQueryInput = z.infer<typeof SearchQueryInputSchema>;

export const ClearSearchHistoryInputSchema = z.object({
  olderThanDays: z.number().int().min(0).optional(),
});

export type ClearSearchHistoryInput = z.infer<typeof ClearSearchHistoryInputSchema>;

/**
 * Trust, Safety & Moderation Contracts (F-24, BR-34, BR-68, BR-125, BR-154, WIT-008, WIT-013)
 */
export const ScanContentInputSchema = z.object({
  text: z.string().min(1).max(10000),
});

export type ScanContentInput = z.infer<typeof ScanContentInputSchema>;

export const CreateModerationReportInputSchema = z.object({
  targetType: z.enum(['user', 'job', 'message', 'evidence', 'review', 'portfolio_project']),
  targetId: z.string().min(1).max(128),
  reason: z.enum(['spam', 'harassment', 'fraud', 'inappropriate', 'intellectual_property', 'security_violation', 'other']),
  details: z.string().max(2000).optional(),
});

export type CreateModerationReportInput = z.infer<typeof CreateModerationReportInputSchema>;

export const UpdateModerationReportStatusInputSchema = z.object({
  status: z.enum(['pending', 'under_review', 'resolved', 'dismissed']),
});

export type UpdateModerationReportStatusInput = z.infer<typeof UpdateModerationReportStatusInputSchema>;

export const ResolveModerationReportInputSchema = z.object({
  action: z.enum(['none', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'dismissed']),
  resolutionNotes: z.string().min(3).max(2000),
  secondApproverId: z.string().uuid().optional(),
});

export type ResolveModerationReportInput = z.infer<typeof ResolveModerationReportInputSchema>;

export const CreateModerationAppealInputSchema = z.object({
  reason: z.string().min(10).max(2000),
});

export type CreateModerationAppealInput = z.infer<typeof CreateModerationAppealInputSchema>;

export const ReviewModerationAppealInputSchema = z.object({
  decision: z.enum(['upheld', 'denied']),
  decisionNotes: z.string().min(3).max(2000),
});

export type ReviewModerationAppealInput = z.infer<typeof ReviewModerationAppealInputSchema>;

/**
 * Saved Searches & Job Alerts Contracts (F-32, F-04, F-25, Section 7)
 */
export const SearchCriteriaSchema = z.object({
  query: z.string().max(200).optional(),
  location: z.string().max(120).optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  requiredSkillIds: z.array(z.string()).optional(),
  salaryMinMinor: z.number().int().min(0).optional(),
});

export type SearchCriteriaInput = z.infer<typeof SearchCriteriaSchema>;

export const CreateSavedSearchInputSchema = z.object({
  title: z.string().min(2).max(100),
  criteria: SearchCriteriaSchema.default({}),
  alertFrequency: z.enum(['instant', 'daily', 'weekly', 'never']).default('daily'),
});

export type CreateSavedSearchInput = z.infer<typeof CreateSavedSearchInputSchema>;

export const UpdateSavedSearchInputSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  criteria: SearchCriteriaSchema.optional(),
  alertFrequency: z.enum(['instant', 'daily', 'weekly', 'never']).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateSavedSearchInput = z.infer<typeof UpdateSavedSearchInputSchema>;

/**
 * Application Draft Autosave Contracts (F-36, BR-18, SSOT 1015)
 */
export const SaveApplicationDraftInputSchema = z.object({
  resumeId: z.string().uuid().optional(),
  coverLetter: z.string().max(5000).optional(),
  answers: z.record(z.unknown()).default({}),
  attachedEvidenceIds: z.array(z.string().uuid()).default([]),
  stepIndex: z.number().int().min(0).max(50).default(0),
});

export type SaveApplicationDraftInput = z.infer<typeof SaveApplicationDraftInputSchema>;

export const RestoreApplicationDraftVersionInputSchema = z.object({
  targetVersion: z.number().int().positive(),
});

export type RestoreApplicationDraftVersionInput = z.infer<typeof RestoreApplicationDraftVersionInputSchema>;

/**
 * Product Analytics & Telemetry Contracts (F-19, F-31, BR-27)
 */
export const RecordAnalyticsEventInputSchema = z.object({
  eventType: z.string().min(2).max(100),
  anonymousId: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).default({}),
});

export type RecordAnalyticsEventInput = z.infer<typeof RecordAnalyticsEventInputSchema>;

export const RecordAnalyticsEventBatchInputSchema = z.object({
  events: z.array(RecordAnalyticsEventInputSchema).min(1).max(100),
});

export type RecordAnalyticsEventBatchInput = z.infer<typeof RecordAnalyticsEventBatchInputSchema>;

export const QueryAnalyticsKPIsInputSchema = z.object({
  eventType: z.string().optional(),
});

export type QueryAnalyticsKPIsInput = z.infer<typeof QueryAnalyticsKPIsInputSchema>;

/**
 * Certificate Verification & Revocation Contracts (F-52, S-02)
 */
export const RevokeCertificateInputSchema = z.object({
  reason: z.string().min(5).max(1000),
});

export type RevokeCertificateInput = z.infer<typeof RevokeCertificateInputSchema>;

/**
 * Job Templates Contracts (F-37, F-05, BR-01, BR-12, BR-144)
 */
export const ScreeningQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(3).max(500),
  required: z.boolean().default(false),
  idealAnswer: z.string().max(1000).optional(),
});

export type ScreeningQuestion = z.infer<typeof ScreeningQuestionSchema>;

export const CreateJobTemplateInputSchema = z.object({
  orgId: z.string().uuid(),
  templateName: z.string().min(2).max(150),
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(20000),
  location: z.string().min(1).max(255),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  requiredSkillIds: z.array(z.string()).default([]),
  salaryMinMinor: z.number().int().nonnegative().optional(),
  salaryMaxMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
  department: z.string().max(100).optional(),
  screeningQuestions: z.array(ScreeningQuestionSchema).default([]),
});

export type CreateJobTemplateInput = z.infer<typeof CreateJobTemplateInputSchema>;

export const UpdateJobTemplateInputSchema = z.object({
  templateName: z.string().min(2).max(150).optional(),
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(20000).optional(),
  location: z.string().min(1).max(255).optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  requiredSkillIds: z.array(z.string()).optional(),
  salaryMinMinor: z.number().int().nonnegative().nullable().optional(),
  salaryMaxMinor: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional(),
  department: z.string().max(100).optional(),
  screeningQuestions: z.array(ScreeningQuestionSchema).optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateJobTemplateInput = z.infer<typeof UpdateJobTemplateInputSchema>;

export const InstantiateJobFromTemplateInputSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(20000).optional(),
  location: z.string().min(1).max(255).optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  requiredSkillIds: z.array(z.string()).optional(),
  salaryMinMinor: z.number().int().nonnegative().optional(),
  salaryMaxMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
});

export type InstantiateJobFromTemplateInput = z.infer<typeof InstantiateJobFromTemplateInputSchema>;

export const SaveJobAsTemplateInputSchema = z.object({
  templateName: z.string().min(2).max(150),
  department: z.string().max(100).optional(),
  screeningQuestions: z.array(ScreeningQuestionSchema).default([]),
});

export type SaveJobAsTemplateInput = z.infer<typeof SaveJobAsTemplateInputSchema>;

/**
 * Salary Intelligence & Compensation Benchmarks Contracts (F-86, BR-177..BR-183)
 */
export const SubmitSalaryReportInputSchema = z.object({
  jobTitle: z.string().min(2).max(255),
  standardizedRole: z.string().min(2).max(100),
  seniorityLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'principal', 'director', 'executive']),
  location: z.string().min(2).max(255),
  countryCode: z.string().length(2).default('US'),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  currency: z.string().length(3).default('USD'),
  baseSalaryMinor: z.number().int().positive(),
  bonusMinor: z.number().int().nonnegative().optional(),
  equityAnnualMinor: z.number().int().nonnegative().optional(),
  yearsOfExperience: z.number().nonnegative(),
  companyName: z.string().max(255).optional(),
  companySize: z.enum(['seed', 'early', 'midsize', 'enterprise']).optional(),
  industry: z.string().max(100).optional(),
  verificationType: z.enum(['self_reported', 'employment_verified']).default('self_reported'),
});

export type SubmitSalaryReportInput = z.infer<typeof SubmitSalaryReportInputSchema>;

export const SalaryBenchmarkQuerySchema = z.object({
  role: z.string().optional(),
  level: z.enum(['entry', 'mid', 'senior', 'lead', 'principal', 'director', 'executive']).optional(),
  location: z.string().optional(),
  currency: z.string().length(3).default('USD'),
  minCohortSize: z.coerce.number().int().min(1).max(20).default(3),
});

export type SalaryBenchmarkQuery = z.infer<typeof SalaryBenchmarkQuerySchema>;












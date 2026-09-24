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



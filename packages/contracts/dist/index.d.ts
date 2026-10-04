import { z } from 'zod';
/**
 * Standard Canonical Error Envelope
 * Per Section 20 of Master Execution Prompt and docs/engineering/API_CONTRACTS.md
 */
export declare const ErrorEnvelopeSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        request_id: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        request_id: string;
        details?: unknown;
    }, {
        code: string;
        message: string;
        request_id: string;
        details?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        code: string;
        message: string;
        request_id: string;
        details?: unknown;
    };
}, {
    error: {
        code: string;
        message: string;
        request_id: string;
        details?: unknown;
    };
}>;
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
/**
 * Standard Pagination Schema
 */
export declare const PaginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export declare const PaginatedMetaSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}>;
export type PaginatedMeta = z.infer<typeof PaginatedMetaSchema>;
/**
 * Authentication Contracts
 */
export declare const RegisterInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["candidate", "recruiter"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    role: "candidate" | "recruiter";
}, {
    email: string;
    password: string;
    fullName: string;
    role?: "candidate" | "recruiter" | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export declare const LoginInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export declare const UserSessionSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        roles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        email: string;
        id: string;
        roles: string[];
    }, {
        email: string;
        id: string;
        roles: string[];
    }>;
    accessToken: z.ZodString;
    expiresAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    user: {
        email: string;
        id: string;
        roles: string[];
    };
    accessToken: string;
    expiresAt: number;
}, {
    user: {
        email: string;
        id: string;
        roles: string[];
    };
    accessToken: string;
    expiresAt: number;
}>;
export type UserSession = z.infer<typeof UserSessionSchema>;
/**
 * Profile Contracts
 */
export declare const UpdateProfileInputSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    headline: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    privacy: z.ZodOptional<z.ZodEnum<["public", "connections_only", "recruiters_only", "private"]>>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    headline?: string | undefined;
    bio?: string | undefined;
    location?: string | undefined;
    privacy?: "public" | "connections_only" | "recruiters_only" | "private" | undefined;
}, {
    fullName?: string | undefined;
    headline?: string | undefined;
    bio?: string | undefined;
    location?: string | undefined;
    privacy?: "public" | "connections_only" | "recruiters_only" | "private" | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
/**
 * Evidence Contracts
 */
export declare const CreateEvidenceInputSchema: z.ZodObject<{
    type: z.ZodEnum<["self_declaration", "course_completion", "assessment", "project", "work_experience", "contribution", "employer_verification", "institution_credential", "external_verification"]>;
    title: z.ZodString;
    description: z.ZodString;
    source: z.ZodString;
    provenance: z.ZodString;
    recencyDate: z.ZodString;
    skillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "self_declaration" | "course_completion" | "assessment" | "project" | "work_experience" | "contribution" | "employer_verification" | "institution_credential" | "external_verification";
    title: string;
    description: string;
    source: string;
    provenance: string;
    recencyDate: string;
    skillIds?: string[] | undefined;
}, {
    type: "self_declaration" | "course_completion" | "assessment" | "project" | "work_experience" | "contribution" | "employer_verification" | "institution_credential" | "external_verification";
    title: string;
    description: string;
    source: string;
    provenance: string;
    recencyDate: string;
    skillIds?: string[] | undefined;
}>;
export type CreateEvidenceInput = z.infer<typeof CreateEvidenceInputSchema>;
export declare const VerifyEvidenceInputSchema: z.ZodObject<{
    verificationLevel: z.ZodEnum<["peer_reviewed", "institution_verified", "authority_verified"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    verificationLevel: "peer_reviewed" | "institution_verified" | "authority_verified";
    notes?: string | undefined;
}, {
    verificationLevel: "peer_reviewed" | "institution_verified" | "authority_verified";
    notes?: string | undefined;
}>;
export type VerifyEvidenceInput = z.infer<typeof VerifyEvidenceInputSchema>;
export declare const DisputeEvidenceInputSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export type DisputeEvidenceInput = z.infer<typeof DisputeEvidenceInputSchema>;
export declare const RevokeEvidenceInputSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export type RevokeEvidenceInput = z.infer<typeof RevokeEvidenceInputSchema>;
/**
 * Skills & Taxonomy Contracts (BR-141..147)
 */
export declare const CreateSkillInputSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    category: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    category: string;
    description?: string | undefined;
}, {
    slug: string;
    name: string;
    category: string;
    description?: string | undefined;
}>;
export type CreateSkillInput = z.infer<typeof CreateSkillInputSchema>;
export declare const CreateSkillRelationshipInputSchema: z.ZodObject<{
    sourceSkillId: z.ZodString;
    targetSkillId: z.ZodString;
    relationshipType: z.ZodEnum<["prerequisite_of", "subskill_of", "supersedes", "correlates_with"]>;
    weight: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sourceSkillId: string;
    targetSkillId: string;
    relationshipType: "prerequisite_of" | "subskill_of" | "supersedes" | "correlates_with";
    weight: number;
}, {
    sourceSkillId: string;
    targetSkillId: string;
    relationshipType: "prerequisite_of" | "subskill_of" | "supersedes" | "correlates_with";
    weight?: number | undefined;
}>;
export type CreateSkillRelationshipInput = z.infer<typeof CreateSkillRelationshipInputSchema>;
/**
 * Organization Contracts
 */
export declare const CreateOrganizationInputSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    description?: string | undefined;
    website?: string | undefined;
}, {
    slug: string;
    name: string;
    description?: string | undefined;
    website?: string | undefined;
}>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationInputSchema>;
/**
 * Job Marketplace Contracts (F-04, F-05, BR-01..BR-12)
 */
export declare const CreateJobInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
    jobType: z.ZodOptional<z.ZodEnum<["full_time", "part_time", "contract", "internship"]>>;
    requiredSkillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    salaryMinMinor: z.ZodOptional<z.ZodNumber>;
    salaryMaxMinor: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    location: string;
    title: string;
    description: string;
    orgId: string;
    currency: string;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | undefined;
    salaryMaxMinor?: number | undefined;
}, {
    location: string;
    title: string;
    description: string;
    orgId: string;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | undefined;
    salaryMaxMinor?: number | undefined;
    currency?: string | undefined;
}>;
export type CreateJobInput = z.infer<typeof CreateJobInputSchema>;
export declare const UpdateJobStatusInputSchema: z.ZodObject<{
    status: z.ZodEnum<["draft", "pending_approval", "approved", "published", "paused", "closed", "archived"]>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "pending_approval" | "approved" | "published" | "paused" | "closed" | "archived";
}, {
    status: "draft" | "pending_approval" | "approved" | "published" | "paused" | "closed" | "archived";
}>;
export type UpdateJobStatusInput = z.infer<typeof UpdateJobStatusInputSchema>;
/**
 * Job Application & ATS Pipeline Contracts (F-06, BR-02, BR-15..BR-41)
 */
export declare const SubmitApplicationInputSchema: z.ZodObject<{
    coverLetter: z.ZodOptional<z.ZodString>;
    attachedEvidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    coverLetter?: string | undefined;
    attachedEvidenceIds?: string[] | undefined;
}, {
    coverLetter?: string | undefined;
    attachedEvidenceIds?: string[] | undefined;
}>;
export type SubmitApplicationInput = z.infer<typeof SubmitApplicationInputSchema>;
export declare const TransitionApplicationInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    targetState: z.ZodEnum<["draft", "submitted", "in_review", "shortlisted", "interviewing", "offered", "hired", "rejected", "withdrawn"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    applicationId: string;
    targetState: "draft" | "submitted" | "in_review" | "shortlisted" | "interviewing" | "offered" | "hired" | "rejected" | "withdrawn";
    reason?: string | undefined;
}, {
    applicationId: string;
    targetState: "draft" | "submitted" | "in_review" | "shortlisted" | "interviewing" | "offered" | "hired" | "rejected" | "withdrawn";
    reason?: string | undefined;
}>;
export type TransitionApplicationInput = z.infer<typeof TransitionApplicationInputSchema>;
/**
 * Challenges Arena & Assessment Contracts (F-08, BR-24..BR-51)
 */
export declare const CreateChallengeInputSchema: z.ZodObject<{
    slug: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
    category: z.ZodString;
    skillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    testCases: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        input: z.ZodString;
        expectedOutput: z.ZodString;
        isHidden: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
        id?: string | undefined;
    }, {
        input: string;
        expectedOutput: string;
        id?: string | undefined;
        isHidden?: boolean | undefined;
    }>, "many">;
    timeLimitMs: z.ZodDefault<z.ZodNumber>;
    memoryLimitMb: z.ZodDefault<z.ZodNumber>;
    policyMode: z.ZodDefault<z.ZodEnum<["AI_PROHIBITED", "AI_RESTRICTED", "AI_ALLOWED", "POST_ASSESSMENT_ONLY"]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    slug: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
    testCases: {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
        id?: string | undefined;
    }[];
    timeLimitMs: number;
    memoryLimitMb: number;
    policyMode: "AI_PROHIBITED" | "AI_RESTRICTED" | "AI_ALLOWED" | "POST_ASSESSMENT_ONLY";
    skillIds?: string[] | undefined;
}, {
    title: string;
    description: string;
    slug: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
    testCases: {
        input: string;
        expectedOutput: string;
        id?: string | undefined;
        isHidden?: boolean | undefined;
    }[];
    skillIds?: string[] | undefined;
    timeLimitMs?: number | undefined;
    memoryLimitMb?: number | undefined;
    policyMode?: "AI_PROHIBITED" | "AI_RESTRICTED" | "AI_ALLOWED" | "POST_ASSESSMENT_ONLY" | undefined;
}>;
export type CreateChallengeInput = z.infer<typeof CreateChallengeInputSchema>;
export declare const SubmitChallengeSolutionInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    language: z.ZodEnum<["typescript", "javascript", "python", "rust", "go"]>;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    language: "typescript" | "javascript" | "python" | "rust" | "go";
    sessionId?: string | undefined;
}, {
    code: string;
    language: "typescript" | "javascript" | "python" | "rust" | "go";
    sessionId?: string | undefined;
}>;
export type SubmitChallengeSolutionInput = z.infer<typeof SubmitChallengeSolutionInputSchema>;
/**
 * AI Assistant & Gateway Query Contract
 */
export declare const AIAssistantQueryInputSchema: z.ZodObject<{
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    prompt: string;
}, {
    prompt: string;
}>;
export type AIAssistantQueryInput = z.infer<typeof AIAssistantQueryInputSchema>;
/**
 * LMS & Course Contracts (F-07, BR-21..BR-48, BR-91, BR-92)
 */
export declare const CreateCourseInputSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    level: z.ZodDefault<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    estimatedDurationMinutes: z.ZodDefault<z.ZodNumber>;
    passingScorePercent: z.ZodDefault<z.ZodNumber>;
    xpReward: z.ZodDefault<z.ZodNumber>;
    skillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    slug: string;
    level: "beginner" | "intermediate" | "advanced";
    estimatedDurationMinutes: number;
    passingScorePercent: number;
    xpReward: number;
    skillIds?: string[] | undefined;
}, {
    title: string;
    description: string;
    slug: string;
    skillIds?: string[] | undefined;
    level?: "beginner" | "intermediate" | "advanced" | undefined;
    estimatedDurationMinutes?: number | undefined;
    passingScorePercent?: number | undefined;
    xpReward?: number | undefined;
}>;
export type CreateCourseInput = z.infer<typeof CreateCourseInputSchema>;
export declare const CreateCourseModuleInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    orderIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    title: string;
    orderIndex: number;
    description?: string | undefined;
}, {
    title: string;
    orderIndex: number;
    description?: string | undefined;
}>;
export type CreateCourseModuleInput = z.infer<typeof CreateCourseModuleInputSchema>;
export declare const CreateLessonInputSchema: z.ZodObject<{
    title: z.ZodString;
    contentType: z.ZodDefault<z.ZodEnum<["text", "video", "interactive", "quiz"]>>;
    contentBody: z.ZodString;
    durationMinutes: z.ZodDefault<z.ZodNumber>;
    orderIndex: z.ZodNumber;
    prerequisiteLessonId: z.ZodOptional<z.ZodString>;
    isFreePreview: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    orderIndex: number;
    contentType: "text" | "video" | "interactive" | "quiz";
    contentBody: string;
    durationMinutes: number;
    isFreePreview: boolean;
    prerequisiteLessonId?: string | undefined;
}, {
    title: string;
    orderIndex: number;
    contentBody: string;
    contentType?: "text" | "video" | "interactive" | "quiz" | undefined;
    durationMinutes?: number | undefined;
    prerequisiteLessonId?: string | undefined;
    isFreePreview?: boolean | undefined;
}>;
export type CreateLessonInput = z.infer<typeof CreateLessonInputSchema>;
export declare const EnrollCourseInputSchema: z.ZodObject<{
    courseId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    courseId: string;
}, {
    courseId: string;
}>;
export type EnrollCourseInput = z.infer<typeof EnrollCourseInputSchema>;
export declare const CompleteLessonInputSchema: z.ZodObject<{
    lessonId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    lessonId: string;
}, {
    lessonId: string;
}>;
export type CompleteLessonInput = z.infer<typeof CompleteLessonInputSchema>;
/**
 * Direct Messaging Contracts (F-10, WF-10, BR-214)
 */
export declare const CreateThreadInputSchema: z.ZodObject<{
    recipientId: z.ZodString;
    initialMessage: z.ZodString;
    subject: z.ZodOptional<z.ZodString>;
    clientMessageId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    recipientId: string;
    initialMessage: string;
    subject?: string | undefined;
    clientMessageId?: string | undefined;
}, {
    recipientId: string;
    initialMessage: string;
    subject?: string | undefined;
    clientMessageId?: string | undefined;
}>;
export type CreateThreadInput = z.infer<typeof CreateThreadInputSchema>;
export declare const SendMessageInputSchema: z.ZodObject<{
    content: z.ZodString;
    clientMessageId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    clientMessageId?: string | undefined;
}, {
    content: string;
    clientMessageId?: string | undefined;
}>;
export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;
/**
 * Notification Center Contracts (F-14, BR-120)
 */
export declare const MarkNotificationsReadInputSchema: z.ZodObject<{
    notificationIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    all: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    notificationIds?: string[] | undefined;
    all?: boolean | undefined;
}, {
    notificationIds?: string[] | undefined;
    all?: boolean | undefined;
}>;
export type MarkNotificationsReadInput = z.infer<typeof MarkNotificationsReadInputSchema>;
export declare const UpdateNotificationPreferencesInputSchema: z.ZodObject<{
    allowMessages: z.ZodOptional<z.ZodBoolean>;
    allowMentions: z.ZodOptional<z.ZodBoolean>;
    allowApplications: z.ZodOptional<z.ZodBoolean>;
    allowCourseUpdates: z.ZodOptional<z.ZodBoolean>;
    emailDigestFrequency: z.ZodOptional<z.ZodEnum<["realtime", "daily", "weekly", "never"]>>;
}, "strip", z.ZodTypeAny, {
    allowMessages?: boolean | undefined;
    allowMentions?: boolean | undefined;
    allowApplications?: boolean | undefined;
    allowCourseUpdates?: boolean | undefined;
    emailDigestFrequency?: "never" | "realtime" | "daily" | "weekly" | undefined;
}, {
    allowMessages?: boolean | undefined;
    allowMentions?: boolean | undefined;
    allowApplications?: boolean | undefined;
    allowCourseUpdates?: boolean | undefined;
    emailDigestFrequency?: "never" | "realtime" | "daily" | "weekly" | undefined;
}>;
export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesInputSchema>;
/**
 * AI Gateway & Career Assistant Contracts (F-11, SSOT Section 16)
 */
export declare const CreateAIConversationInputSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    purpose: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    purpose: string;
    title?: string | undefined;
}, {
    title?: string | undefined;
    purpose?: string | undefined;
}>;
export type CreateAIConversationInput = z.infer<typeof CreateAIConversationInputSchema>;
export declare const AIChatInputSchema: z.ZodObject<{
    conversationId: z.ZodOptional<z.ZodString>;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    conversationId?: string | undefined;
}, {
    prompt: string;
    conversationId?: string | undefined;
}>;
export type AIChatInput = z.infer<typeof AIChatInputSchema>;
/**
 * Resume Builder Contracts (F-13, BR-26)
 */
export declare const ResumeExperienceSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    company: z.ZodString;
    title: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    isCurrent: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    company: string;
    startDate: string;
    isCurrent: boolean;
    id?: string | undefined;
    location?: string | undefined;
    description?: string | undefined;
    endDate?: string | undefined;
    highlights?: string[] | undefined;
}, {
    title: string;
    company: string;
    startDate: string;
    id?: string | undefined;
    location?: string | undefined;
    description?: string | undefined;
    endDate?: string | undefined;
    isCurrent?: boolean | undefined;
    highlights?: string[] | undefined;
}>;
export declare const ResumeEducationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    institution: z.ZodString;
    degree: z.ZodString;
    fieldOfStudy: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    gpa: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    institution: string;
    degree: string;
    id?: string | undefined;
    endDate?: string | undefined;
    fieldOfStudy?: string | undefined;
    gpa?: string | undefined;
}, {
    startDate: string;
    institution: string;
    degree: string;
    id?: string | undefined;
    endDate?: string | undefined;
    fieldOfStudy?: string | undefined;
    gpa?: string | undefined;
}>;
export declare const ResumeSkillItemSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodString>;
    evidenceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category?: string | undefined;
    level?: string | undefined;
    evidenceId?: string | undefined;
}, {
    name: string;
    category?: string | undefined;
    level?: string | undefined;
    evidenceId?: string | undefined;
}>;
export declare const CreateResumeInputSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    template: z.ZodDefault<z.ZodEnum<["modern", "minimal", "executive", "technical"]>>;
    headline: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    experience: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        company: z.ZodString;
        title: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        isCurrent: z.ZodDefault<z.ZodBoolean>;
        description: z.ZodOptional<z.ZodString>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        company: string;
        startDate: string;
        isCurrent: boolean;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        highlights?: string[] | undefined;
    }, {
        title: string;
        company: string;
        startDate: string;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        isCurrent?: boolean | undefined;
        highlights?: string[] | undefined;
    }>, "many">>;
    education: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        institution: z.ZodString;
        degree: z.ZodString;
        fieldOfStudy: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        gpa: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }, {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }>, "many">>;
    skills: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
        evidenceId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }, {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }>, "many">>;
    evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    template: "modern" | "minimal" | "executive" | "technical";
    experience: {
        title: string;
        company: string;
        startDate: string;
        isCurrent: boolean;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        highlights?: string[] | undefined;
    }[];
    education: {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }[];
    skills: {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }[];
    evidenceIds: string[];
    isPrimary: boolean;
    headline?: string | undefined;
    location?: string | undefined;
    title?: string | undefined;
    summary?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    websiteUrl?: string | undefined;
}, {
    headline?: string | undefined;
    location?: string | undefined;
    title?: string | undefined;
    template?: "modern" | "minimal" | "executive" | "technical" | undefined;
    summary?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    websiteUrl?: string | undefined;
    experience?: {
        title: string;
        company: string;
        startDate: string;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        isCurrent?: boolean | undefined;
        highlights?: string[] | undefined;
    }[] | undefined;
    education?: {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }[] | undefined;
    skills?: {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }[] | undefined;
    evidenceIds?: string[] | undefined;
    isPrimary?: boolean | undefined;
}>;
export type CreateResumeInput = z.infer<typeof CreateResumeInputSchema>;
export declare const UpdateResumeInputSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    template: z.ZodOptional<z.ZodDefault<z.ZodEnum<["modern", "minimal", "executive", "technical"]>>>;
    headline: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    summary: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    contactEmail: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    contactPhone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    websiteUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    experience: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        company: z.ZodString;
        title: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        isCurrent: z.ZodDefault<z.ZodBoolean>;
        description: z.ZodOptional<z.ZodString>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        company: string;
        startDate: string;
        isCurrent: boolean;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        highlights?: string[] | undefined;
    }, {
        title: string;
        company: string;
        startDate: string;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        isCurrent?: boolean | undefined;
        highlights?: string[] | undefined;
    }>, "many">>>;
    education: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        institution: z.ZodString;
        degree: z.ZodString;
        fieldOfStudy: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        gpa: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }, {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }>, "many">>>;
    skills: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
        evidenceId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }, {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }>, "many">>>;
    evidenceIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    isPrimary: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    headline?: string | undefined;
    location?: string | undefined;
    title?: string | undefined;
    template?: "modern" | "minimal" | "executive" | "technical" | undefined;
    summary?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    websiteUrl?: string | undefined;
    experience?: {
        title: string;
        company: string;
        startDate: string;
        isCurrent: boolean;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        highlights?: string[] | undefined;
    }[] | undefined;
    education?: {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }[] | undefined;
    skills?: {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }[] | undefined;
    evidenceIds?: string[] | undefined;
    isPrimary?: boolean | undefined;
}, {
    headline?: string | undefined;
    location?: string | undefined;
    title?: string | undefined;
    template?: "modern" | "minimal" | "executive" | "technical" | undefined;
    summary?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    websiteUrl?: string | undefined;
    experience?: {
        title: string;
        company: string;
        startDate: string;
        id?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        endDate?: string | undefined;
        isCurrent?: boolean | undefined;
        highlights?: string[] | undefined;
    }[] | undefined;
    education?: {
        startDate: string;
        institution: string;
        degree: string;
        id?: string | undefined;
        endDate?: string | undefined;
        fieldOfStudy?: string | undefined;
        gpa?: string | undefined;
    }[] | undefined;
    skills?: {
        name: string;
        category?: string | undefined;
        level?: string | undefined;
        evidenceId?: string | undefined;
    }[] | undefined;
    evidenceIds?: string[] | undefined;
    isPrimary?: boolean | undefined;
}>;
export type UpdateResumeInput = z.infer<typeof UpdateResumeInputSchema>;
export declare const ExportResumeInputSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<["json", "markdown", "html", "pdf"]>>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "markdown" | "html" | "pdf";
}, {
    format?: "json" | "markdown" | "html" | "pdf" | undefined;
}>;
export type ExportResumeInput = z.infer<typeof ExportResumeInputSchema>;
/**
 * Professional Networking Contracts (F-09)
 */
export declare const RequestConnectionInputSchema: z.ZodObject<{
    recipientId: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    recipientId: string;
    note?: string | undefined;
}, {
    recipientId: string;
    note?: string | undefined;
}>;
export type RequestConnectionInput = z.infer<typeof RequestConnectionInputSchema>;
export declare const RespondConnectionInputSchema: z.ZodObject<{
    action: z.ZodEnum<["accept", "reject"]>;
}, "strip", z.ZodTypeAny, {
    action: "accept" | "reject";
}, {
    action: "accept" | "reject";
}>;
export type RespondConnectionInput = z.infer<typeof RespondConnectionInputSchema>;
/**
 * Portfolio Showcase Contracts (F-26)
 */
export declare const PortfolioProjectMediaSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    mediaUrl: z.ZodString;
    mediaType: z.ZodDefault<z.ZodEnum<["image", "video", "document"]>>;
    caption: z.ZodOptional<z.ZodString>;
    orderIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    orderIndex: number;
    mediaUrl: string;
    mediaType: "video" | "image" | "document";
    id?: string | undefined;
    caption?: string | undefined;
}, {
    mediaUrl: string;
    id?: string | undefined;
    orderIndex?: number | undefined;
    mediaType?: "video" | "image" | "document" | undefined;
    caption?: string | undefined;
}>;
export type PortfolioProjectMediaInput = z.infer<typeof PortfolioProjectMediaSchema>;
export declare const CreatePortfolioProjectInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    projectUrl: z.ZodOptional<z.ZodString>;
    repoUrl: z.ZodOptional<z.ZodString>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "connections_only", "recruiters_only", "private"]>>;
    featured: z.ZodDefault<z.ZodBoolean>;
    orderIndex: z.ZodDefault<z.ZodNumber>;
    skillIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    media: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        mediaUrl: z.ZodString;
        mediaType: z.ZodDefault<z.ZodEnum<["image", "video", "document"]>>;
        caption: z.ZodOptional<z.ZodString>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        orderIndex: number;
        mediaUrl: string;
        mediaType: "video" | "image" | "document";
        id?: string | undefined;
        caption?: string | undefined;
    }, {
        mediaUrl: string;
        id?: string | undefined;
        orderIndex?: number | undefined;
        mediaType?: "video" | "image" | "document" | undefined;
        caption?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    skillIds: string[];
    orderIndex: number;
    evidenceIds: string[];
    visibility: "public" | "connections_only" | "recruiters_only" | "private";
    featured: boolean;
    media: {
        orderIndex: number;
        mediaUrl: string;
        mediaType: "video" | "image" | "document";
        id?: string | undefined;
        caption?: string | undefined;
    }[];
    projectUrl?: string | undefined;
    repoUrl?: string | undefined;
}, {
    title: string;
    description: string;
    skillIds?: string[] | undefined;
    orderIndex?: number | undefined;
    evidenceIds?: string[] | undefined;
    projectUrl?: string | undefined;
    repoUrl?: string | undefined;
    visibility?: "public" | "connections_only" | "recruiters_only" | "private" | undefined;
    featured?: boolean | undefined;
    media?: {
        mediaUrl: string;
        id?: string | undefined;
        orderIndex?: number | undefined;
        mediaType?: "video" | "image" | "document" | undefined;
        caption?: string | undefined;
    }[] | undefined;
}>;
export type CreatePortfolioProjectInput = z.infer<typeof CreatePortfolioProjectInputSchema>;
export declare const UpdatePortfolioProjectInputSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    projectUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    repoUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    visibility: z.ZodOptional<z.ZodDefault<z.ZodEnum<["public", "connections_only", "recruiters_only", "private"]>>>;
    featured: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    orderIndex: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    skillIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    evidenceIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    media: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        mediaUrl: z.ZodString;
        mediaType: z.ZodDefault<z.ZodEnum<["image", "video", "document"]>>;
        caption: z.ZodOptional<z.ZodString>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        orderIndex: number;
        mediaUrl: string;
        mediaType: "video" | "image" | "document";
        id?: string | undefined;
        caption?: string | undefined;
    }, {
        mediaUrl: string;
        id?: string | undefined;
        orderIndex?: number | undefined;
        mediaType?: "video" | "image" | "document" | undefined;
        caption?: string | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    skillIds?: string[] | undefined;
    orderIndex?: number | undefined;
    evidenceIds?: string[] | undefined;
    projectUrl?: string | undefined;
    repoUrl?: string | undefined;
    visibility?: "public" | "connections_only" | "recruiters_only" | "private" | undefined;
    featured?: boolean | undefined;
    media?: {
        orderIndex: number;
        mediaUrl: string;
        mediaType: "video" | "image" | "document";
        id?: string | undefined;
        caption?: string | undefined;
    }[] | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    skillIds?: string[] | undefined;
    orderIndex?: number | undefined;
    evidenceIds?: string[] | undefined;
    projectUrl?: string | undefined;
    repoUrl?: string | undefined;
    visibility?: "public" | "connections_only" | "recruiters_only" | "private" | undefined;
    featured?: boolean | undefined;
    media?: {
        mediaUrl: string;
        id?: string | undefined;
        orderIndex?: number | undefined;
        mediaType?: "video" | "image" | "document" | undefined;
        caption?: string | undefined;
    }[] | undefined;
}>;
export type UpdatePortfolioProjectInput = z.infer<typeof UpdatePortfolioProjectInputSchema>;
/**
 * Gamification & XP Ledger Contracts (F-22, F-23, BR-25)
 */
export declare const ClaimGamificationActivityInputSchema: z.ZodObject<{
    referenceType: z.ZodString;
    referenceId: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    referenceType: string;
    referenceId: string;
    amount: number;
    description?: string | undefined;
}, {
    referenceType: string;
    referenceId: string;
    amount: number;
    description?: string | undefined;
}>;
export type ClaimGamificationActivityInput = z.infer<typeof ClaimGamificationActivityInputSchema>;
export declare const GetLeaderboardQuerySchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodEnum<["weekly", "all_time"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    period: "weekly" | "all_time";
}, {
    limit?: number | undefined;
    period?: "weekly" | "all_time" | undefined;
}>;
export type GetLeaderboardQuery = z.infer<typeof GetLeaderboardQuerySchema>;
/**
 * Account Settings, Privacy & GDPR Erasure Contracts (F-15, §31, BR-06)
 */
export declare const UpdateUserSettingsInputSchema: z.ZodObject<{
    theme: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
    language: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    profileVisibility: z.ZodOptional<z.ZodEnum<["public", "connections_only", "recruiters_only", "private"]>>;
    showEmail: z.ZodOptional<z.ZodBoolean>;
    showActivity: z.ZodOptional<z.ZodBoolean>;
    allowConnectionRequests: z.ZodOptional<z.ZodBoolean>;
    allowDirectMessages: z.ZodOptional<z.ZodEnum<["everyone", "connections_only", "none"]>>;
    searchEngineIndexing: z.ZodOptional<z.ZodBoolean>;
    emailNotifications: z.ZodOptional<z.ZodBoolean>;
    pushNotifications: z.ZodOptional<z.ZodBoolean>;
    marketingEmails: z.ZodOptional<z.ZodBoolean>;
    digestFrequency: z.ZodOptional<z.ZodEnum<["realtime", "daily", "weekly", "none"]>>;
    twoFactorEnabled: z.ZodOptional<z.ZodBoolean>;
    byoAiKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    aiDataUsageConsent: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    language?: string | undefined;
    theme?: "light" | "dark" | "system" | undefined;
    timezone?: string | undefined;
    profileVisibility?: "public" | "connections_only" | "recruiters_only" | "private" | undefined;
    showEmail?: boolean | undefined;
    showActivity?: boolean | undefined;
    allowConnectionRequests?: boolean | undefined;
    allowDirectMessages?: "connections_only" | "everyone" | "none" | undefined;
    searchEngineIndexing?: boolean | undefined;
    emailNotifications?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    marketingEmails?: boolean | undefined;
    digestFrequency?: "realtime" | "daily" | "weekly" | "none" | undefined;
    twoFactorEnabled?: boolean | undefined;
    byoAiKey?: string | null | undefined;
    aiDataUsageConsent?: boolean | undefined;
}, {
    language?: string | undefined;
    theme?: "light" | "dark" | "system" | undefined;
    timezone?: string | undefined;
    profileVisibility?: "public" | "connections_only" | "recruiters_only" | "private" | undefined;
    showEmail?: boolean | undefined;
    showActivity?: boolean | undefined;
    allowConnectionRequests?: boolean | undefined;
    allowDirectMessages?: "connections_only" | "everyone" | "none" | undefined;
    searchEngineIndexing?: boolean | undefined;
    emailNotifications?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    marketingEmails?: boolean | undefined;
    digestFrequency?: "realtime" | "daily" | "weekly" | "none" | undefined;
    twoFactorEnabled?: boolean | undefined;
    byoAiKey?: string | null | undefined;
    aiDataUsageConsent?: boolean | undefined;
}>;
export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsInputSchema>;
export declare const RequestErasureInputSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    confirm: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    confirm: true;
    reason?: string | undefined;
}, {
    confirm: true;
    reason?: string | undefined;
}>;
export type RequestErasureInput = z.infer<typeof RequestErasureInputSchema>;
export declare const CancelErasureInputSchema: z.ZodObject<{
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    requestId: string;
}, {
    requestId: string;
}>;
export type CancelErasureInput = z.infer<typeof CancelErasureInputSchema>;
export declare const RequestDataExportInputSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<["json", "csv"]>>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "csv";
}, {
    format?: "json" | "csv" | undefined;
}>;
export type RequestDataExportInput = z.infer<typeof RequestDataExportInputSchema>;
/**
 * Billing & Subscriptions Contracts (F-16, Section 64, WF-16, WIT-016)
 */
export declare const SubscribePlanInputSchema: z.ZodObject<{
    planTier: z.ZodEnum<["free", "candidate_pro", "recruiter_starter", "recruiter_enterprise"]>;
    billingCycle: z.ZodDefault<z.ZodEnum<["monthly", "yearly"]>>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planTier: "free" | "candidate_pro" | "recruiter_starter" | "recruiter_enterprise";
    billingCycle: "monthly" | "yearly";
    paymentMethodId?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    planTier: "free" | "candidate_pro" | "recruiter_starter" | "recruiter_enterprise";
    billingCycle?: "monthly" | "yearly" | undefined;
    paymentMethodId?: string | undefined;
    idempotencyKey?: string | undefined;
}>;
export type SubscribePlanInput = z.infer<typeof SubscribePlanInputSchema>;
export declare const CancelSubscriptionInputSchema: z.ZodObject<{
    immediate: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    immediate: boolean;
    reason?: string | undefined;
}, {
    reason?: string | undefined;
    immediate?: boolean | undefined;
}>;
export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionInputSchema>;
export declare const ProcessPaymentWebhookInputSchema: z.ZodObject<{
    eventType: z.ZodString;
    idempotencyKey: z.ZodString;
    subscriptionId: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    amountCents: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    idempotencyKey: string;
    eventType: string;
    userId: string;
    amountCents: number;
    subscriptionId?: string | undefined;
}, {
    idempotencyKey: string;
    eventType: string;
    userId: string;
    amountCents: number;
    currency?: string | undefined;
    subscriptionId?: string | undefined;
}>;
export type ProcessPaymentWebhookInput = z.infer<typeof ProcessPaymentWebhookInputSchema>;
/**
 * Platform Administration & Governance Contracts (F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068)
 */
export declare const AdminUpdateUserStatusInputSchema: z.ZodObject<{
    status: z.ZodEnum<["active", "suspended", "deactivated"]>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "suspended" | "deactivated";
    reason: string;
}, {
    status: "active" | "suspended" | "deactivated";
    reason: string;
}>;
export type AdminUpdateUserStatusInput = z.infer<typeof AdminUpdateUserStatusInputSchema>;
export declare const AdminUpdateUserRolesInputSchema: z.ZodObject<{
    roles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    roles: string[];
}, {
    roles: string[];
}>;
export type AdminUpdateUserRolesInput = z.infer<typeof AdminUpdateUserRolesInputSchema>;
export declare const AdminToggleFeatureFlagInputSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    description?: string | undefined;
}, {
    enabled: boolean;
    description?: string | undefined;
}>;
export type AdminToggleFeatureFlagInput = z.infer<typeof AdminToggleFeatureFlagInputSchema>;
export declare const AdminSetMaintenanceModeInputSchema: z.ZodObject<{
    inMaintenance: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    inMaintenance: boolean;
    reason?: string | undefined;
}, {
    inMaintenance: boolean;
    reason?: string | undefined;
}>;
export type AdminSetMaintenanceModeInput = z.infer<typeof AdminSetMaintenanceModeInputSchema>;
export declare const AdminQueryAuditLogsSchema: z.ZodObject<{
    actorId: z.ZodOptional<z.ZodString>;
    eventName: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    actorId?: string | undefined;
    eventName?: string | undefined;
}, {
    limit?: number | undefined;
    actorId?: string | undefined;
    eventName?: string | undefined;
}>;
export type AdminQueryAuditLogs = z.infer<typeof AdminQueryAuditLogsSchema>;
/**
 * Multi-Entity Search & Command Palette Contracts (F-20, F-34, F-32)
 */
export declare const SearchQueryInputSchema: z.ZodObject<{
    query: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["all", "jobs", "skills", "courses", "challenges", "profiles", "commands", "companies", "projects"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    location: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodString>;
    minScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "all" | "skills" | "jobs" | "courses" | "challenges" | "profiles" | "commands" | "companies" | "projects";
    limit: number;
    query: string;
    location?: string | undefined;
    level?: string | undefined;
    minScore?: number | undefined;
}, {
    query: string;
    type?: "all" | "skills" | "jobs" | "courses" | "challenges" | "profiles" | "commands" | "companies" | "projects" | undefined;
    limit?: number | undefined;
    location?: string | undefined;
    level?: string | undefined;
    minScore?: number | undefined;
}>;
export type SearchQueryInput = z.infer<typeof SearchQueryInputSchema>;
export declare const AutocompleteQueryInputSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
}, {
    query: string;
    limit?: number | undefined;
}>;
export type AutocompleteQueryInput = z.infer<typeof AutocompleteQueryInputSchema>;
export declare const ClearSearchHistoryInputSchema: z.ZodObject<{
    olderThanDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    olderThanDays?: number | undefined;
}, {
    olderThanDays?: number | undefined;
}>;
export type ClearSearchHistoryInput = z.infer<typeof ClearSearchHistoryInputSchema>;
/**
 * Trust, Safety & Moderation Contracts (F-24, BR-34, BR-68, BR-125, BR-154, WIT-008, WIT-013)
 */
export declare const ScanContentInputSchema: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
export type ScanContentInput = z.infer<typeof ScanContentInputSchema>;
export declare const CreateModerationReportInputSchema: z.ZodObject<{
    targetType: z.ZodEnum<["user", "job", "message", "evidence", "review", "portfolio_project"]>;
    targetId: z.ZodString;
    reason: z.ZodEnum<["spam", "harassment", "fraud", "inappropriate", "intellectual_property", "security_violation", "other"]>;
    details: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "spam" | "harassment" | "fraud" | "inappropriate" | "intellectual_property" | "security_violation" | "other";
    targetType: "message" | "user" | "job" | "evidence" | "review" | "portfolio_project";
    targetId: string;
    details?: string | undefined;
}, {
    reason: "spam" | "harassment" | "fraud" | "inappropriate" | "intellectual_property" | "security_violation" | "other";
    targetType: "message" | "user" | "job" | "evidence" | "review" | "portfolio_project";
    targetId: string;
    details?: string | undefined;
}>;
export type CreateModerationReportInput = z.infer<typeof CreateModerationReportInputSchema>;
export declare const UpdateModerationReportStatusInputSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "under_review", "resolved", "dismissed"]>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "under_review" | "resolved" | "dismissed";
}, {
    status: "pending" | "under_review" | "resolved" | "dismissed";
}>;
export type UpdateModerationReportStatusInput = z.infer<typeof UpdateModerationReportStatusInputSchema>;
export declare const ResolveModerationReportInputSchema: z.ZodObject<{
    action: z.ZodEnum<["none", "warning", "content_removed", "user_suspended", "user_banned", "dismissed"]>;
    resolutionNotes: z.ZodString;
    secondApproverId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "none" | "dismissed" | "warning" | "content_removed" | "user_suspended" | "user_banned";
    resolutionNotes: string;
    secondApproverId?: string | undefined;
}, {
    action: "none" | "dismissed" | "warning" | "content_removed" | "user_suspended" | "user_banned";
    resolutionNotes: string;
    secondApproverId?: string | undefined;
}>;
export type ResolveModerationReportInput = z.infer<typeof ResolveModerationReportInputSchema>;
export declare const CreateModerationAppealInputSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export type CreateModerationAppealInput = z.infer<typeof CreateModerationAppealInputSchema>;
export declare const ReviewModerationAppealInputSchema: z.ZodObject<{
    decision: z.ZodEnum<["upheld", "denied"]>;
    decisionNotes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    decision: "upheld" | "denied";
    decisionNotes: string;
}, {
    decision: "upheld" | "denied";
    decisionNotes: string;
}>;
export type ReviewModerationAppealInput = z.infer<typeof ReviewModerationAppealInputSchema>;
/**
 * Saved Searches & Job Alerts Contracts (F-32, F-04, F-25, Section 7)
 */
export declare const SearchCriteriaSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
    jobType: z.ZodOptional<z.ZodEnum<["full_time", "part_time", "contract", "internship"]>>;
    requiredSkillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    salaryMinMinor: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    location?: string | undefined;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | undefined;
    query?: string | undefined;
}, {
    location?: string | undefined;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | undefined;
    query?: string | undefined;
}>;
export type SearchCriteriaInput = z.infer<typeof SearchCriteriaSchema>;
export declare const CreateSavedSearchInputSchema: z.ZodObject<{
    title: z.ZodString;
    criteria: z.ZodDefault<z.ZodObject<{
        query: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
        jobType: z.ZodOptional<z.ZodEnum<["full_time", "part_time", "contract", "internship"]>>;
        requiredSkillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        salaryMinMinor: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    }, {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    }>>;
    alertFrequency: z.ZodDefault<z.ZodEnum<["instant", "daily", "weekly", "never"]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    criteria: {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    };
    alertFrequency: "never" | "daily" | "weekly" | "instant";
}, {
    title: string;
    criteria?: {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    } | undefined;
    alertFrequency?: "never" | "daily" | "weekly" | "instant" | undefined;
}>;
export type CreateSavedSearchInput = z.infer<typeof CreateSavedSearchInputSchema>;
export declare const UpdateSavedSearchInputSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    criteria: z.ZodOptional<z.ZodObject<{
        query: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
        jobType: z.ZodOptional<z.ZodEnum<["full_time", "part_time", "contract", "internship"]>>;
        requiredSkillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        salaryMinMinor: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    }, {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    }>>;
    alertFrequency: z.ZodOptional<z.ZodEnum<["instant", "daily", "weekly", "never"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    criteria?: {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    } | undefined;
    alertFrequency?: "never" | "daily" | "weekly" | "instant" | undefined;
    isActive?: boolean | undefined;
}, {
    title?: string | undefined;
    criteria?: {
        location?: string | undefined;
        workMode?: "remote" | "hybrid" | "onsite" | undefined;
        jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
        requiredSkillIds?: string[] | undefined;
        salaryMinMinor?: number | undefined;
        query?: string | undefined;
    } | undefined;
    alertFrequency?: "never" | "daily" | "weekly" | "instant" | undefined;
    isActive?: boolean | undefined;
}>;
export type UpdateSavedSearchInput = z.infer<typeof UpdateSavedSearchInputSchema>;
/**
 * Application Draft Autosave Contracts (F-36, BR-18, SSOT 1015)
 */
export declare const SaveApplicationDraftInputSchema: z.ZodObject<{
    resumeId: z.ZodOptional<z.ZodString>;
    coverLetter: z.ZodOptional<z.ZodString>;
    answers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    attachedEvidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    stepIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    attachedEvidenceIds: string[];
    answers: Record<string, unknown>;
    stepIndex: number;
    coverLetter?: string | undefined;
    resumeId?: string | undefined;
}, {
    coverLetter?: string | undefined;
    attachedEvidenceIds?: string[] | undefined;
    resumeId?: string | undefined;
    answers?: Record<string, unknown> | undefined;
    stepIndex?: number | undefined;
}>;
export type SaveApplicationDraftInput = z.infer<typeof SaveApplicationDraftInputSchema>;
export declare const RestoreApplicationDraftVersionInputSchema: z.ZodObject<{
    targetVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    targetVersion: number;
}, {
    targetVersion: number;
}>;
export type RestoreApplicationDraftVersionInput = z.infer<typeof RestoreApplicationDraftVersionInputSchema>;
/**
 * Product Analytics & Telemetry Contracts (F-19, F-31, BR-27)
 */
export declare const RecordAnalyticsEventInputSchema: z.ZodObject<{
    eventType: z.ZodString;
    anonymousId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    eventType: string;
    metadata: Record<string, unknown>;
    anonymousId?: string | undefined;
}, {
    eventType: string;
    anonymousId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type RecordAnalyticsEventInput = z.infer<typeof RecordAnalyticsEventInputSchema>;
export declare const RecordAnalyticsEventBatchInputSchema: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        eventType: z.ZodString;
        anonymousId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        eventType: string;
        metadata: Record<string, unknown>;
        anonymousId?: string | undefined;
    }, {
        eventType: string;
        anonymousId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    events: {
        eventType: string;
        metadata: Record<string, unknown>;
        anonymousId?: string | undefined;
    }[];
}, {
    events: {
        eventType: string;
        anonymousId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}>;
export type RecordAnalyticsEventBatchInput = z.infer<typeof RecordAnalyticsEventBatchInputSchema>;
export declare const QueryAnalyticsKPIsInputSchema: z.ZodObject<{
    eventType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventType?: string | undefined;
}, {
    eventType?: string | undefined;
}>;
export type QueryAnalyticsKPIsInput = z.infer<typeof QueryAnalyticsKPIsInputSchema>;
/**
 * Certificate Verification & Revocation Contracts (F-52, S-02)
 */
export declare const RevokeCertificateInputSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export type RevokeCertificateInput = z.infer<typeof RevokeCertificateInputSchema>;
/**
 * Job Templates Contracts (F-37, F-05, BR-01, BR-12, BR-144)
 */
export declare const ScreeningQuestionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    question: z.ZodString;
    required: z.ZodDefault<z.ZodBoolean>;
    idealAnswer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    question: string;
    required: boolean;
    id?: string | undefined;
    idealAnswer?: string | undefined;
}, {
    question: string;
    id?: string | undefined;
    required?: boolean | undefined;
    idealAnswer?: string | undefined;
}>;
export type ScreeningQuestion = z.infer<typeof ScreeningQuestionSchema>;
export declare const CreateJobTemplateInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    templateName: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
    jobType: z.ZodOptional<z.ZodEnum<["full_time", "part_time", "contract", "internship"]>>;
    requiredSkillIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    salaryMinMinor: z.ZodOptional<z.ZodNumber>;
    salaryMaxMinor: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    screeningQuestions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        question: z.ZodString;
        required: z.ZodDefault<z.ZodBoolean>;
        idealAnswer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        question: string;
        required: boolean;
        id?: string | undefined;
        idealAnswer?: string | undefined;
    }, {
        question: string;
        id?: string | undefined;
        required?: boolean | undefined;
        idealAnswer?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    location: string;
    title: string;
    description: string;
    orgId: string;
    requiredSkillIds: string[];
    currency: string;
    templateName: string;
    screeningQuestions: {
        question: string;
        required: boolean;
        id?: string | undefined;
        idealAnswer?: string | undefined;
    }[];
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    salaryMinMinor?: number | undefined;
    salaryMaxMinor?: number | undefined;
    department?: string | undefined;
}, {
    location: string;
    title: string;
    description: string;
    orgId: string;
    templateName: string;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | undefined;
    salaryMaxMinor?: number | undefined;
    currency?: string | undefined;
    department?: string | undefined;
    screeningQuestions?: {
        question: string;
        id?: string | undefined;
        required?: boolean | undefined;
        idealAnswer?: string | undefined;
    }[] | undefined;
}>;
export type CreateJobTemplateInput = z.infer<typeof CreateJobTemplateInputSchema>;
export declare const UpdateJobTemplateInputSchema: z.ZodObject<{
    templateName: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
    jobType: z.ZodOptional<z.ZodEnum<["full_time", "part_time", "contract", "internship"]>>;
    requiredSkillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    salaryMinMinor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    salaryMaxMinor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    currency: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    screeningQuestions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        question: z.ZodString;
        required: z.ZodDefault<z.ZodBoolean>;
        idealAnswer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        question: string;
        required: boolean;
        id?: string | undefined;
        idealAnswer?: string | undefined;
    }, {
        question: string;
        id?: string | undefined;
        required?: boolean | undefined;
        idealAnswer?: string | undefined;
    }>, "many">>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    location?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | null | undefined;
    salaryMaxMinor?: number | null | undefined;
    currency?: string | undefined;
    templateName?: string | undefined;
    department?: string | undefined;
    screeningQuestions?: {
        question: string;
        required: boolean;
        id?: string | undefined;
        idealAnswer?: string | undefined;
    }[] | undefined;
    isArchived?: boolean | undefined;
}, {
    location?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | null | undefined;
    salaryMaxMinor?: number | null | undefined;
    currency?: string | undefined;
    templateName?: string | undefined;
    department?: string | undefined;
    screeningQuestions?: {
        question: string;
        id?: string | undefined;
        required?: boolean | undefined;
        idealAnswer?: string | undefined;
    }[] | undefined;
    isArchived?: boolean | undefined;
}>;
export type UpdateJobTemplateInput = z.infer<typeof UpdateJobTemplateInputSchema>;
export declare const InstantiateJobFromTemplateInputSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
    jobType: z.ZodOptional<z.ZodEnum<["full_time", "part_time", "contract", "internship"]>>;
    requiredSkillIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    salaryMinMinor: z.ZodOptional<z.ZodNumber>;
    salaryMaxMinor: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    location?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | undefined;
    salaryMaxMinor?: number | undefined;
    currency?: string | undefined;
}, {
    location?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    jobType?: "full_time" | "part_time" | "contract" | "internship" | undefined;
    requiredSkillIds?: string[] | undefined;
    salaryMinMinor?: number | undefined;
    salaryMaxMinor?: number | undefined;
    currency?: string | undefined;
}>;
export type InstantiateJobFromTemplateInput = z.infer<typeof InstantiateJobFromTemplateInputSchema>;
export declare const SaveJobAsTemplateInputSchema: z.ZodObject<{
    templateName: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    screeningQuestions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        question: z.ZodString;
        required: z.ZodDefault<z.ZodBoolean>;
        idealAnswer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        question: string;
        required: boolean;
        id?: string | undefined;
        idealAnswer?: string | undefined;
    }, {
        question: string;
        id?: string | undefined;
        required?: boolean | undefined;
        idealAnswer?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    templateName: string;
    screeningQuestions: {
        question: string;
        required: boolean;
        id?: string | undefined;
        idealAnswer?: string | undefined;
    }[];
    department?: string | undefined;
}, {
    templateName: string;
    department?: string | undefined;
    screeningQuestions?: {
        question: string;
        id?: string | undefined;
        required?: boolean | undefined;
        idealAnswer?: string | undefined;
    }[] | undefined;
}>;
export type SaveJobAsTemplateInput = z.infer<typeof SaveJobAsTemplateInputSchema>;
/**
 * Salary Intelligence & Compensation Benchmarks Contracts (F-86, BR-177..BR-183)
 */
export declare const SubmitSalaryReportInputSchema: z.ZodObject<{
    jobTitle: z.ZodString;
    standardizedRole: z.ZodString;
    seniorityLevel: z.ZodEnum<["entry", "mid", "senior", "lead", "principal", "director", "executive"]>;
    location: z.ZodString;
    countryCode: z.ZodDefault<z.ZodString>;
    workMode: z.ZodOptional<z.ZodEnum<["remote", "hybrid", "onsite"]>>;
    currency: z.ZodDefault<z.ZodString>;
    baseSalaryMinor: z.ZodNumber;
    bonusMinor: z.ZodOptional<z.ZodNumber>;
    equityAnnualMinor: z.ZodOptional<z.ZodNumber>;
    yearsOfExperience: z.ZodNumber;
    companyName: z.ZodOptional<z.ZodString>;
    companySize: z.ZodOptional<z.ZodEnum<["seed", "early", "midsize", "enterprise"]>>;
    industry: z.ZodOptional<z.ZodString>;
    verificationType: z.ZodDefault<z.ZodEnum<["self_reported", "employment_verified"]>>;
}, "strip", z.ZodTypeAny, {
    location: string;
    currency: string;
    jobTitle: string;
    standardizedRole: string;
    seniorityLevel: "executive" | "entry" | "mid" | "senior" | "lead" | "principal" | "director";
    countryCode: string;
    baseSalaryMinor: number;
    yearsOfExperience: number;
    verificationType: "self_reported" | "employment_verified";
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    bonusMinor?: number | undefined;
    equityAnnualMinor?: number | undefined;
    companyName?: string | undefined;
    companySize?: "seed" | "early" | "midsize" | "enterprise" | undefined;
    industry?: string | undefined;
}, {
    location: string;
    jobTitle: string;
    standardizedRole: string;
    seniorityLevel: "executive" | "entry" | "mid" | "senior" | "lead" | "principal" | "director";
    baseSalaryMinor: number;
    yearsOfExperience: number;
    workMode?: "remote" | "hybrid" | "onsite" | undefined;
    currency?: string | undefined;
    countryCode?: string | undefined;
    bonusMinor?: number | undefined;
    equityAnnualMinor?: number | undefined;
    companyName?: string | undefined;
    companySize?: "seed" | "early" | "midsize" | "enterprise" | undefined;
    industry?: string | undefined;
    verificationType?: "self_reported" | "employment_verified" | undefined;
}>;
export type SubmitSalaryReportInput = z.infer<typeof SubmitSalaryReportInputSchema>;
export declare const SalaryBenchmarkQuerySchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodEnum<["entry", "mid", "senior", "lead", "principal", "director", "executive"]>>;
    location: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    minCohortSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    minCohortSize: number;
    role?: string | undefined;
    location?: string | undefined;
    level?: "executive" | "entry" | "mid" | "senior" | "lead" | "principal" | "director" | undefined;
}, {
    role?: string | undefined;
    location?: string | undefined;
    currency?: string | undefined;
    level?: "executive" | "entry" | "mid" | "senior" | "lead" | "principal" | "director" | undefined;
    minCohortSize?: number | undefined;
}>;
export type SalaryBenchmarkQuery = z.infer<typeof SalaryBenchmarkQuerySchema>;
/**
 * Application Feedback Loop Contracts (F-122, BR-217..BR-224, P-02)
 */
export declare const CreateApplicationFeedbackInputSchema: z.ZodObject<{
    reasonCategory: z.ZodEnum<["skills_gap", "experience_gap", "culture_fit", "overqualified", "position_filled", "compensation_mismatch", "other"]>;
    stage: z.ZodDefault<z.ZodString>;
    strengths: z.ZodString;
    areasForImprovement: z.ZodString;
    actionableAdvice: z.ZodString;
    suggestedSkillIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isAiAssisted: z.ZodDefault<z.ZodBoolean>;
    humanReviewed: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reasonCategory: "other" | "skills_gap" | "experience_gap" | "culture_fit" | "overqualified" | "position_filled" | "compensation_mismatch";
    stage: string;
    strengths: string;
    areasForImprovement: string;
    actionableAdvice: string;
    suggestedSkillIds: string[];
    isAiAssisted: boolean;
    humanReviewed: boolean;
}, {
    reasonCategory: "other" | "skills_gap" | "experience_gap" | "culture_fit" | "overqualified" | "position_filled" | "compensation_mismatch";
    strengths: string;
    areasForImprovement: string;
    actionableAdvice: string;
    stage?: string | undefined;
    suggestedSkillIds?: string[] | undefined;
    isAiAssisted?: boolean | undefined;
    humanReviewed?: boolean | undefined;
}>;
export type CreateApplicationFeedbackInput = z.infer<typeof CreateApplicationFeedbackInputSchema>;
export declare const CreateFeedbackTemplateInputSchema: z.ZodObject<{
    templateName: z.ZodString;
    stage: z.ZodString;
    reasonCategory: z.ZodEnum<["skills_gap", "experience_gap", "culture_fit", "overqualified", "position_filled", "compensation_mismatch", "other"]>;
    defaultStrengths: z.ZodOptional<z.ZodString>;
    defaultAreasForImprovement: z.ZodOptional<z.ZodString>;
    defaultActionableAdvice: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    templateName: string;
    reasonCategory: "other" | "skills_gap" | "experience_gap" | "culture_fit" | "overqualified" | "position_filled" | "compensation_mismatch";
    stage: string;
    defaultStrengths?: string | undefined;
    defaultAreasForImprovement?: string | undefined;
    defaultActionableAdvice?: string | undefined;
}, {
    templateName: string;
    reasonCategory: "other" | "skills_gap" | "experience_gap" | "culture_fit" | "overqualified" | "position_filled" | "compensation_mismatch";
    stage: string;
    defaultStrengths?: string | undefined;
    defaultAreasForImprovement?: string | undefined;
    defaultActionableAdvice?: string | undefined;
}>;
export type CreateFeedbackTemplateInput = z.infer<typeof CreateFeedbackTemplateInputSchema>;
/**
 * Skill Decay & Freshness Tracking Contracts (F-123, BR-225..BR-232)
 */
export declare const RegisterSkillFreshnessInputSchema: z.ZodObject<{
    skillId: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<["fast_changing", "moderate", "stable", "foundational"]>>;
    lastVerifiedAt: z.ZodOptional<z.ZodString>;
    verificationSource: z.ZodDefault<z.ZodEnum<["challenge", "course", "certification", "evidence", "self_attestation"]>>;
}, "strip", z.ZodTypeAny, {
    category: "fast_changing" | "moderate" | "stable" | "foundational";
    skillId: string;
    verificationSource: "evidence" | "challenge" | "course" | "certification" | "self_attestation";
    lastVerifiedAt?: string | undefined;
}, {
    skillId: string;
    category?: "fast_changing" | "moderate" | "stable" | "foundational" | undefined;
    lastVerifiedAt?: string | undefined;
    verificationSource?: "evidence" | "challenge" | "course" | "certification" | "self_attestation" | undefined;
}>;
export type RegisterSkillFreshnessInput = z.infer<typeof RegisterSkillFreshnessInputSchema>;
export declare const ReverifySkillInputSchema: z.ZodObject<{
    source: z.ZodDefault<z.ZodEnum<["challenge", "course", "certification", "evidence", "self_attestation"]>>;
}, "strip", z.ZodTypeAny, {
    source: "evidence" | "challenge" | "course" | "certification" | "self_attestation";
}, {
    source?: "evidence" | "challenge" | "course" | "certification" | "self_attestation" | undefined;
}>;
export type ReverifySkillInput = z.infer<typeof ReverifySkillInputSchema>;
/**
 * Technical Interview Assessment Platform Contracts (F-88, S-06, BR-169..BR-176)
 */
export declare const CreateInterviewQuestionInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    title: z.ZodString;
    statement: z.ZodString;
    category: z.ZodEnum<["code", "design", "behavioral", "text"]>;
    difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
    durationMinutes: z.ZodDefault<z.ZodNumber>;
    expectedCompetencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    testCases: z.ZodDefault<z.ZodArray<z.ZodObject<{
        input: z.ZodString;
        expectedOutput: z.ZodString;
        isHidden: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }, {
        input: string;
        expectedOutput: string;
        isHidden?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    category: "code" | "text" | "design" | "behavioral";
    orgId: string;
    difficulty: "easy" | "medium" | "hard";
    testCases: {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }[];
    durationMinutes: number;
    statement: string;
    expectedCompetencies: string[];
}, {
    title: string;
    category: "code" | "text" | "design" | "behavioral";
    orgId: string;
    difficulty: "easy" | "medium" | "hard";
    statement: string;
    testCases?: {
        input: string;
        expectedOutput: string;
        isHidden?: boolean | undefined;
    }[] | undefined;
    durationMinutes?: number | undefined;
    expectedCompetencies?: string[] | undefined;
}>;
export type CreateInterviewQuestionInput = z.infer<typeof CreateInterviewQuestionInputSchema>;
export declare const ScheduleInterviewAssessmentInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    applicationId: z.ZodOptional<z.ZodString>;
    candidateProfileId: z.ZodString;
    interviewerUserId: z.ZodString;
    title: z.ZodString;
    scheduledAt: z.ZodString;
    durationMinutes: z.ZodDefault<z.ZodNumber>;
    meetingUrl: z.ZodOptional<z.ZodString>;
    questionIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    orgId: string;
    durationMinutes: number;
    candidateProfileId: string;
    interviewerUserId: string;
    scheduledAt: string;
    questionIds: string[];
    applicationId?: string | undefined;
    meetingUrl?: string | undefined;
}, {
    title: string;
    orgId: string;
    candidateProfileId: string;
    interviewerUserId: string;
    scheduledAt: string;
    applicationId?: string | undefined;
    durationMinutes?: number | undefined;
    meetingUrl?: string | undefined;
    questionIds?: string[] | undefined;
}>;
export type ScheduleInterviewAssessmentInput = z.infer<typeof ScheduleInterviewAssessmentInputSchema>;
export declare const SetRecordingConsentInputSchema: z.ZodObject<{
    consent: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    consent: boolean;
}, {
    consent: boolean;
}>;
export type SetRecordingConsentInput = z.infer<typeof SetRecordingConsentInputSchema>;
export declare const SubmitInterviewScorecardInputSchema: z.ZodObject<{
    technicalCorrectness: z.ZodNumber;
    communication: z.ZodNumber;
    problemSolving: z.ZodNumber;
    codeQuality: z.ZodNumber;
    recommendation: z.ZodEnum<["strong_yes", "yes", "neutral", "no", "strong_no"]>;
    strengths: z.ZodString;
    areasForImprovement: z.ZodString;
    privateNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    strengths: string;
    areasForImprovement: string;
    technicalCorrectness: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    recommendation: "strong_yes" | "yes" | "neutral" | "no" | "strong_no";
    privateNotes?: string | undefined;
}, {
    strengths: string;
    areasForImprovement: string;
    technicalCorrectness: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    recommendation: "strong_yes" | "yes" | "neutral" | "no" | "strong_no";
    privateNotes?: string | undefined;
}>;
export type SubmitInterviewScorecardInput = z.infer<typeof SubmitInterviewScorecardInputSchema>;
export declare const CompensateInterviewScorecardInputSchema: z.ZodObject<{
    technicalCorrectness: z.ZodNumber;
    communication: z.ZodNumber;
    problemSolving: z.ZodNumber;
    codeQuality: z.ZodNumber;
    recommendation: z.ZodEnum<["strong_yes", "yes", "neutral", "no", "strong_no"]>;
    strengths: z.ZodString;
    areasForImprovement: z.ZodString;
    compensationReason: z.ZodString;
    privateNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    strengths: string;
    areasForImprovement: string;
    technicalCorrectness: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    recommendation: "strong_yes" | "yes" | "neutral" | "no" | "strong_no";
    compensationReason: string;
    privateNotes?: string | undefined;
}, {
    strengths: string;
    areasForImprovement: string;
    technicalCorrectness: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    recommendation: "strong_yes" | "yes" | "neutral" | "no" | "strong_no";
    compensationReason: string;
    privateNotes?: string | undefined;
}>;
export type CompensateInterviewScorecardInput = z.infer<typeof CompensateInterviewScorecardInputSchema>;
export declare const ExecuteInterviewCodeInputSchema: z.ZodObject<{
    code: z.ZodString;
    language: z.ZodDefault<z.ZodEnum<["javascript", "typescript", "python"]>>;
    questionId: z.ZodOptional<z.ZodString>;
    customTestCases: z.ZodOptional<z.ZodArray<z.ZodObject<{
        input: z.ZodString;
        expectedOutput: z.ZodString;
        isHidden: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }, {
        input: string;
        expectedOutput: string;
        isHidden?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    language: "typescript" | "javascript" | "python";
    questionId?: string | undefined;
    customTestCases?: {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }[] | undefined;
}, {
    code: string;
    language?: "typescript" | "javascript" | "python" | undefined;
    questionId?: string | undefined;
    customTestCases?: {
        input: string;
        expectedOutput: string;
        isHidden?: boolean | undefined;
    }[] | undefined;
}>;
export type ExecuteInterviewCodeInput = z.infer<typeof ExecuteInterviewCodeInputSchema>;
/**
 * Multi-Context Reputation Engine Contracts (F-144, S-03, BR-247..BR-254)
 */
export declare const AddReputationSignalInputSchema: z.ZodObject<{
    targetUserId: z.ZodOptional<z.ZodString>;
    context: z.ZodEnum<["candidate", "instructor", "employer", "peer", "community", "mentor"]>;
    domain: z.ZodDefault<z.ZodString>;
    signalType: z.ZodEnum<["credential", "endorsement", "review", "contribution", "peer_feedback", "assessment", "penalty"]>;
    rawValue: z.ZodNumber;
    weight: z.ZodDefault<z.ZodNumber>;
    decayHalfLifeDays: z.ZodDefault<z.ZodNumber>;
    evidenceReferenceId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    weight: number;
    context: "candidate" | "instructor" | "employer" | "peer" | "community" | "mentor";
    domain: string;
    signalType: "assessment" | "contribution" | "review" | "credential" | "endorsement" | "peer_feedback" | "penalty";
    rawValue: number;
    decayHalfLifeDays: number;
    notes?: string | undefined;
    targetUserId?: string | undefined;
    evidenceReferenceId?: string | undefined;
}, {
    context: "candidate" | "instructor" | "employer" | "peer" | "community" | "mentor";
    signalType: "assessment" | "contribution" | "review" | "credential" | "endorsement" | "peer_feedback" | "penalty";
    rawValue: number;
    notes?: string | undefined;
    weight?: number | undefined;
    targetUserId?: string | undefined;
    domain?: string | undefined;
    decayHalfLifeDays?: number | undefined;
    evidenceReferenceId?: string | undefined;
}>;
export type AddReputationSignalInput = z.infer<typeof AddReputationSignalInputSchema>;
export declare const QueryReputationInputSchema: z.ZodObject<{
    context: z.ZodOptional<z.ZodEnum<["candidate", "instructor", "employer", "peer", "community", "mentor"]>>;
    domain: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    context?: "candidate" | "instructor" | "employer" | "peer" | "community" | "mentor" | undefined;
    domain?: string | undefined;
}, {
    context?: "candidate" | "instructor" | "employer" | "peer" | "community" | "mentor" | undefined;
    domain?: string | undefined;
}>;
export type QueryReputationInput = z.infer<typeof QueryReputationInputSchema>;
export declare const StartRecoveryPlanInputSchema: z.ZodObject<{
    context: z.ZodEnum<["candidate", "instructor", "employer", "peer", "community", "mentor"]>;
    penaltySignalId: z.ZodString;
    targetReboundPoints: z.ZodNumber;
    tasks: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        points: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        points: number;
    }, {
        description: string;
        points: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    context: "candidate" | "instructor" | "employer" | "peer" | "community" | "mentor";
    penaltySignalId: string;
    targetReboundPoints: number;
    tasks: {
        description: string;
        points: number;
    }[];
}, {
    context: "candidate" | "instructor" | "employer" | "peer" | "community" | "mentor";
    penaltySignalId: string;
    targetReboundPoints: number;
    tasks: {
        description: string;
        points: number;
    }[];
}>;
export type StartRecoveryPlanInput = z.infer<typeof StartRecoveryPlanInputSchema>;
export declare const CompleteRecoveryTaskInputSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
export type CompleteRecoveryTaskInput = z.infer<typeof CompleteRecoveryTaskInputSchema>;
/**
 * Warm Introduction Paths Contracts (F-121, S-11, BR-209..BR-216)
 */
export declare const UpdateWarmIntroPreferencesInputSchema: z.ZodObject<{
    optOutIntroducer: z.ZodOptional<z.ZodBoolean>;
    blockAllIncomingIntros: z.ZodOptional<z.ZodBoolean>;
    blockedUserIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    optOutIntroducer?: boolean | undefined;
    blockAllIncomingIntros?: boolean | undefined;
    blockedUserIds?: string[] | undefined;
}, {
    optOutIntroducer?: boolean | undefined;
    blockAllIncomingIntros?: boolean | undefined;
    blockedUserIds?: string[] | undefined;
}>;
export type UpdateWarmIntroPreferencesInput = z.infer<typeof UpdateWarmIntroPreferencesInputSchema>;
export declare const CreateWarmIntroRequestInputSchema: z.ZodObject<{
    targetUserId: z.ZodString;
    introducerUserId: z.ZodString;
    purpose: z.ZodString;
    note: z.ZodString;
}, "strip", z.ZodTypeAny, {
    purpose: string;
    note: string;
    targetUserId: string;
    introducerUserId: string;
}, {
    purpose: string;
    note: string;
    targetUserId: string;
    introducerUserId: string;
}>;
export type CreateWarmIntroRequestInput = z.infer<typeof CreateWarmIntroRequestInputSchema>;
export declare const RespondWarmIntroRequestInputSchema: z.ZodObject<{
    decision: z.ZodEnum<["approve", "decline"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    decision: "approve" | "decline";
    reason?: string | undefined;
}, {
    decision: "approve" | "decline";
    reason?: string | undefined;
}>;
export type RespondWarmIntroRequestInput = z.infer<typeof RespondWarmIntroRequestInputSchema>;
/**
 * Referral Request System Contracts (F-142, S-11, BR-233..BR-240)
 */
export declare const CreateReferralRequestInputSchema: z.ZodObject<{
    referrerId: z.ZodString;
    jobId: z.ZodString;
    pitch: z.ZodString;
    resumeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    referrerId: string;
    jobId: string;
    pitch: string;
    resumeId?: string | undefined;
}, {
    referrerId: string;
    jobId: string;
    pitch: string;
    resumeId?: string | undefined;
}>;
export type CreateReferralRequestInput = z.infer<typeof CreateReferralRequestInputSchema>;
export declare const RespondReferralRequestInputSchema: z.ZodObject<{
    action: z.ZodEnum<["refer", "forward", "decline"]>;
    declineReason: z.ZodOptional<z.ZodString>;
    forwardedToUserId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "decline" | "refer" | "forward";
    declineReason?: string | undefined;
    forwardedToUserId?: string | undefined;
}, {
    action: "decline" | "refer" | "forward";
    declineReason?: string | undefined;
    forwardedToUserId?: string | undefined;
}>;
export type RespondReferralRequestInput = z.infer<typeof RespondReferralRequestInputSchema>;
/**
 * Activity & Contribution Tracking Contracts (F-146, S-09)
 */
export declare const RecordActivityEventInputSchema: z.ZodObject<{
    category: z.ZodEnum<["learning", "creation", "collaboration", "social"]>;
    activityType: z.ZodString;
    weight: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    occurredAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    category: "learning" | "creation" | "collaboration" | "social";
    activityType: string;
    weight?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
    occurredAt?: string | undefined;
}, {
    category: "learning" | "creation" | "collaboration" | "social";
    activityType: string;
    weight?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
    occurredAt?: string | undefined;
}>;
export type RecordActivityEventInput = z.infer<typeof RecordActivityEventInputSchema>;
export declare const QueryActivityEventsInputSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["learning", "creation", "collaboration", "social"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    category?: "learning" | "creation" | "collaboration" | "social" | undefined;
}, {
    limit?: number | undefined;
    category?: "learning" | "creation" | "collaboration" | "social" | undefined;
}>;
export type QueryActivityEventsInput = z.infer<typeof QueryActivityEventsInputSchema>;
/**
 * Instructor Reputation System Contracts (F-148, F-72, F-144)
 */
export declare const SubmitInstructorMetricsInputSchema: z.ZodObject<{
    completionRate: z.ZodNumber;
    daysSinceLastCourseUpdate: z.ZodNumber;
    avgQaResponseHours: z.ZodNumber;
    qaAnsweredRate: z.ZodNumber;
    activeCoursesCount: z.ZodNumber;
    reviews: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        rating: z.ZodNumber;
        isVerifiedEnrollment: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        rating: number;
        isVerifiedEnrollment: boolean;
        createdAt?: string | undefined;
    }, {
        id: string;
        rating: number;
        isVerifiedEnrollment: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    completionRate: number;
    daysSinceLastCourseUpdate: number;
    avgQaResponseHours: number;
    qaAnsweredRate: number;
    activeCoursesCount: number;
    reviews?: {
        id: string;
        rating: number;
        isVerifiedEnrollment: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    completionRate: number;
    daysSinceLastCourseUpdate: number;
    avgQaResponseHours: number;
    qaAnsweredRate: number;
    activeCoursesCount: number;
    reviews?: {
        id: string;
        rating: number;
        isVerifiedEnrollment: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>;
export type SubmitInstructorMetricsInput = z.infer<typeof SubmitInstructorMetricsInputSchema>;
export declare const CreateInstructorEndorsementInputSchema: z.ZodObject<{
    skillDomain: z.ZodDefault<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    skillDomain: string;
    notes?: string | undefined;
}, {
    notes?: string | undefined;
    skillDomain?: string | undefined;
}>;
export type CreateInstructorEndorsementInput = z.infer<typeof CreateInstructorEndorsementInputSchema>;
export declare const SubmitInstructorReviewInputSchema: z.ZodObject<{
    rating: z.ZodNumber;
    isVerifiedEnrollment: z.ZodDefault<z.ZodBoolean>;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    isVerifiedEnrollment: boolean;
    feedback?: string | undefined;
}, {
    rating: number;
    isVerifiedEnrollment?: boolean | undefined;
    feedback?: string | undefined;
}>;
export type SubmitInstructorReviewInput = z.infer<typeof SubmitInstructorReviewInputSchema>;
/**
 * Peer Credibility Networks & Skill Endorsement Contracts (F-150, F-110, F-144)
 */
export declare const CreateSkillEndorsementInputSchema: z.ZodObject<{
    recipientId: z.ZodString;
    skillId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    recipientId: string;
    skillId: string;
    notes?: string | undefined;
}, {
    recipientId: string;
    skillId: string;
    notes?: string | undefined;
}>;
export type CreateSkillEndorsementInput = z.infer<typeof CreateSkillEndorsementInputSchema>;
export declare const RevokeSkillEndorsementInputSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export type RevokeSkillEndorsementInput = z.infer<typeof RevokeSkillEndorsementInputSchema>;
export declare const QuerySkillEndorsementsInputSchema: z.ZodObject<{
    skillId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    skillId?: string | undefined;
}, {
    skillId?: string | undefined;
}>;
export type QuerySkillEndorsementsInput = z.infer<typeof QuerySkillEndorsementsInputSchema>;
/**
 * Alumni Networks Contracts (F-125, F-12, F-09, F-40)
 */
export declare const CreateAlumniAffiliationInputSchema: z.ZodObject<{
    institutionId: z.ZodString;
    degreeType: z.ZodEnum<["bachelors", "masters", "phd", "bootcamp", "certification", "other"]>;
    fieldOfStudy: z.ZodString;
    graduationYear: z.ZodNumber;
    verificationMethod: z.ZodDefault<z.ZodEnum<["email_domain", "institutional_seat", "manual_review", "unverified"]>>;
}, "strip", z.ZodTypeAny, {
    fieldOfStudy: string;
    institutionId: string;
    degreeType: "other" | "certification" | "bachelors" | "masters" | "phd" | "bootcamp";
    graduationYear: number;
    verificationMethod: "email_domain" | "institutional_seat" | "manual_review" | "unverified";
}, {
    fieldOfStudy: string;
    institutionId: string;
    degreeType: "other" | "certification" | "bachelors" | "masters" | "phd" | "bootcamp";
    graduationYear: number;
    verificationMethod?: "email_domain" | "institutional_seat" | "manual_review" | "unverified" | undefined;
}>;
export type CreateAlumniAffiliationInput = z.infer<typeof CreateAlumniAffiliationInputSchema>;
export declare const VerifyAlumniAffiliationInputSchema: z.ZodObject<{
    verificationMethod: z.ZodEnum<["email_domain", "institutional_seat"]>;
    seatCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    verificationMethod: "email_domain" | "institutional_seat";
    seatCode?: string | undefined;
}, {
    verificationMethod: "email_domain" | "institutional_seat";
    seatCode?: string | undefined;
}>;
export type VerifyAlumniAffiliationInput = z.infer<typeof VerifyAlumniAffiliationInputSchema>;
export declare const QueryAlumniDirectoryInputSchema: z.ZodObject<{
    graduationYear: z.ZodOptional<z.ZodNumber>;
    minGraduationYear: z.ZodOptional<z.ZodNumber>;
    maxGraduationYear: z.ZodOptional<z.ZodNumber>;
    fieldOfStudy: z.ZodOptional<z.ZodString>;
    degreeType: z.ZodOptional<z.ZodEnum<["bachelors", "masters", "phd", "bootcamp", "certification", "other"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fieldOfStudy?: string | undefined;
    degreeType?: "other" | "certification" | "bachelors" | "masters" | "phd" | "bootcamp" | undefined;
    graduationYear?: number | undefined;
    minGraduationYear?: number | undefined;
    maxGraduationYear?: number | undefined;
    search?: string | undefined;
}, {
    fieldOfStudy?: string | undefined;
    degreeType?: "other" | "certification" | "bachelors" | "masters" | "phd" | "bootcamp" | undefined;
    graduationYear?: number | undefined;
    minGraduationYear?: number | undefined;
    maxGraduationYear?: number | undefined;
    search?: string | undefined;
}>;
export type QueryAlumniDirectoryInput = z.infer<typeof QueryAlumniDirectoryInputSchema>;
export declare const CreateAlumniGroupInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    chapterLocation: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    chapterLocation: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    chapterLocation?: string | undefined;
}>;
export type CreateAlumniGroupInput = z.infer<typeof CreateAlumniGroupInputSchema>;
export declare const JoinAlumniGroupInputSchema: z.ZodObject<{
    role: z.ZodDefault<z.ZodEnum<["member", "moderator"]>>;
}, "strip", z.ZodTypeAny, {
    role: "member" | "moderator";
}, {
    role?: "member" | "moderator" | undefined;
}>;
export type JoinAlumniGroupInput = z.infer<typeof JoinAlumniGroupInputSchema>;
export declare const RequestAlumniMentorshipInputSchema: z.ZodObject<{
    mentorId: z.ZodString;
    institutionId: z.ZodString;
    focusAreas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    institutionId: string;
    mentorId: string;
    focusAreas?: string[] | undefined;
}, {
    institutionId: string;
    mentorId: string;
    focusAreas?: string[] | undefined;
}>;
export type RequestAlumniMentorshipInput = z.infer<typeof RequestAlumniMentorshipInputSchema>;
export declare const RespondAlumniMentorshipInputSchema: z.ZodObject<{
    action: z.ZodEnum<["accept", "decline", "complete"]>;
}, "strip", z.ZodTypeAny, {
    action: "accept" | "decline" | "complete";
}, {
    action: "accept" | "decline" | "complete";
}>;
export type RespondAlumniMentorshipInput = z.infer<typeof RespondAlumniMentorshipInputSchema>;
/**
 * Employer Reputation & Brand System Contracts (F-149, F-75, F-56, F-144)
 */
export declare const SubmitEmployerReviewInputSchema: z.ZodObject<{
    employmentStatus: z.ZodEnum<["current", "former", "candidate"]>;
    hiringRating: z.ZodNumber;
    cultureRating: z.ZodNumber;
    growthRating: z.ZodNumber;
    compensationRating: z.ZodNumber;
    leadershipRating: z.ZodNumber;
    title: z.ZodString;
    feedback: z.ZodOptional<z.ZodString>;
    isVerifiedEmployee: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    employmentStatus: "candidate" | "current" | "former";
    hiringRating: number;
    cultureRating: number;
    growthRating: number;
    compensationRating: number;
    leadershipRating: number;
    isVerifiedEmployee: boolean;
    feedback?: string | undefined;
}, {
    title: string;
    employmentStatus: "candidate" | "current" | "former";
    hiringRating: number;
    cultureRating: number;
    growthRating: number;
    compensationRating: number;
    leadershipRating: number;
    feedback?: string | undefined;
    isVerifiedEmployee?: boolean | undefined;
}>;
export type SubmitEmployerReviewInput = z.infer<typeof SubmitEmployerReviewInputSchema>;
export declare const SubmitEmployerMetricsInputSchema: z.ZodObject<{
    avgTimeToHireDays: z.ZodOptional<z.ZodNumber>;
    offerAcceptanceRate: z.ZodOptional<z.ZodNumber>;
    offerRescindedRate: z.ZodOptional<z.ZodNumber>;
    salaryTransparencyIndex: z.ZodOptional<z.ZodNumber>;
    internalPromotionRate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    avgTimeToHireDays?: number | undefined;
    offerAcceptanceRate?: number | undefined;
    offerRescindedRate?: number | undefined;
    salaryTransparencyIndex?: number | undefined;
    internalPromotionRate?: number | undefined;
}, {
    avgTimeToHireDays?: number | undefined;
    offerAcceptanceRate?: number | undefined;
    offerRescindedRate?: number | undefined;
    salaryTransparencyIndex?: number | undefined;
    internalPromotionRate?: number | undefined;
}>;
export type SubmitEmployerMetricsInput = z.infer<typeof SubmitEmployerMetricsInputSchema>;
/**
 * Skill Supply/Demand Forecasting Contracts (F-151, F-84, F-86, F-97)
 */
export declare const RecordSkillMarketSignalInputSchema: z.ZodObject<{
    demandPostingsCount: z.ZodNumber;
    activeCandidatesCount: z.ZodNumber;
    avgSalaryOffered: z.ZodOptional<z.ZodNumber>;
    geographicRegion: z.ZodDefault<z.ZodString>;
    industry: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    industry: string;
    demandPostingsCount: number;
    activeCandidatesCount: number;
    geographicRegion: string;
    avgSalaryOffered?: number | undefined;
}, {
    demandPostingsCount: number;
    activeCandidatesCount: number;
    industry?: string | undefined;
    avgSalaryOffered?: number | undefined;
    geographicRegion?: string | undefined;
}>;
export type RecordSkillMarketSignalInput = z.infer<typeof RecordSkillMarketSignalInputSchema>;
export declare const GenerateSkillForecastInputSchema: z.ZodObject<{
    forecastHorizonMonths: z.ZodDefault<z.ZodNumber>;
    skillCategory: z.ZodOptional<z.ZodString>;
    prerequisiteDepth: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    forecastHorizonMonths: number;
    prerequisiteDepth: number;
    skillCategory?: string | undefined;
}, {
    forecastHorizonMonths?: number | undefined;
    skillCategory?: string | undefined;
    prerequisiteDepth?: number | undefined;
}>;
export type GenerateSkillForecastInput = z.infer<typeof GenerateSkillForecastInputSchema>;
export declare const QuerySkillForecastInputSchema: z.ZodObject<{
    forecastHorizonMonths: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    forecastHorizonMonths: number;
}, {
    forecastHorizonMonths?: number | undefined;
}>;
export type QuerySkillForecastInput = z.infer<typeof QuerySkillForecastInputSchema>;
export declare const TopEmergingSkillsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
}, {
    limit?: number | undefined;
}>;
export type TopEmergingSkillsQuery = z.infer<typeof TopEmergingSkillsQuerySchema>;
/**
 * Career Trajectory Analysis & Progression Benchmarks Contracts (F-152, F-85, BR-157..BR-163)
 */
export declare const RecordCareerTransitionInputSchema: z.ZodObject<{
    fromRole: z.ZodString;
    toRole: z.ZodString;
    fromCompanyId: z.ZodOptional<z.ZodString>;
    toCompanyId: z.ZodOptional<z.ZodString>;
    transitionDate: z.ZodOptional<z.ZodString>;
    salaryDelta: z.ZodNumber;
    timeInRoleMonths: z.ZodNumber;
    consentFlag: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    fromRole: string;
    toRole: string;
    salaryDelta: number;
    timeInRoleMonths: number;
    consentFlag: boolean;
    fromCompanyId?: string | undefined;
    toCompanyId?: string | undefined;
    transitionDate?: string | undefined;
}, {
    fromRole: string;
    toRole: string;
    salaryDelta: number;
    timeInRoleMonths: number;
    consentFlag: boolean;
    fromCompanyId?: string | undefined;
    toCompanyId?: string | undefined;
    transitionDate?: string | undefined;
}>;
export type RecordCareerTransitionInput = z.infer<typeof RecordCareerTransitionInputSchema>;
export declare const QueryCareerBenchmarksQuerySchema: z.ZodObject<{
    fromRole: z.ZodOptional<z.ZodString>;
    toRole: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    minSamples: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    minSamples: number;
    industry?: string | undefined;
    fromRole?: string | undefined;
    toRole?: string | undefined;
}, {
    industry?: string | undefined;
    fromRole?: string | undefined;
    toRole?: string | undefined;
    minSamples?: number | undefined;
}>;
export type QueryCareerBenchmarksQuery = z.infer<typeof QueryCareerBenchmarksQuerySchema>;
export declare const CalculateTransitionProbabilityInputSchema: z.ZodObject<{
    fromRole: z.ZodString;
    toRole: z.ZodString;
    industry: z.ZodDefault<z.ZodString>;
    baselineSalary: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    industry: string;
    fromRole: string;
    toRole: string;
    baselineSalary?: number | undefined;
}, {
    fromRole: string;
    toRole: string;
    industry?: string | undefined;
    baselineSalary?: number | undefined;
}>;
export type CalculateTransitionProbabilityInput = z.infer<typeof CalculateTransitionProbabilityInputSchema>;
export declare const CareerProgressionPathwaysQuerySchema: z.ZodObject<{
    originRole: z.ZodString;
    industry: z.ZodDefault<z.ZodString>;
    enforceKAnonymity: z.ZodDefault<z.ZodEffects<z.ZodBoolean, boolean, unknown>>;
    baselineSalary: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    industry: string;
    originRole: string;
    enforceKAnonymity: boolean;
    baselineSalary?: number | undefined;
}, {
    originRole: string;
    industry?: string | undefined;
    baselineSalary?: number | undefined;
    enforceKAnonymity?: unknown;
}>;
export type CareerProgressionPathwaysQuery = z.infer<typeof CareerProgressionPathwaysQuerySchema>;
export declare const EvaluateMilestoneReadinessInputSchema: z.ZodObject<{
    targetRole: z.ZodString;
    candidateSkills: z.ZodArray<z.ZodString, "many">;
    requiredSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    yearsOfExperience: z.ZodNumber;
    requiredYearsOfExperience: z.ZodOptional<z.ZodNumber>;
    educationLevel: z.ZodDefault<z.ZodEnum<["none", "bootcamp", "associate", "bachelor", "master", "doctorate"]>>;
    requiredEducationLevel: z.ZodDefault<z.ZodEnum<["none", "bootcamp", "associate", "bachelor", "master", "doctorate"]>>;
}, "strip", z.ZodTypeAny, {
    yearsOfExperience: number;
    targetRole: string;
    candidateSkills: string[];
    educationLevel: "none" | "bootcamp" | "associate" | "bachelor" | "master" | "doctorate";
    requiredEducationLevel: "none" | "bootcamp" | "associate" | "bachelor" | "master" | "doctorate";
    requiredSkills?: string[] | undefined;
    requiredYearsOfExperience?: number | undefined;
}, {
    yearsOfExperience: number;
    targetRole: string;
    candidateSkills: string[];
    requiredSkills?: string[] | undefined;
    requiredYearsOfExperience?: number | undefined;
    educationLevel?: "none" | "bootcamp" | "associate" | "bachelor" | "master" | "doctorate" | undefined;
    requiredEducationLevel?: "none" | "bootcamp" | "associate" | "bachelor" | "master" | "doctorate" | undefined;
}>;
export type EvaluateMilestoneReadinessInput = z.infer<typeof EvaluateMilestoneReadinessInputSchema>;
/**
 * Learning Impact Dashboard & Outcome Correlation Contracts (F-153, F-114, BR-189..BR-193, OD-51)
 */
export declare const RecordLearningOutcomeInputSchema: z.ZodObject<{
    courseId: z.ZodString;
    hiredWithin12m: z.ZodDefault<z.ZodBoolean>;
    salaryGrowthPct: z.ZodOptional<z.ZodNumber>;
    jobSatisfactionScore: z.ZodOptional<z.ZodNumber>;
    retentionMonths: z.ZodOptional<z.ZodNumber>;
    promotedWithin18m: z.ZodDefault<z.ZodBoolean>;
    skillsUsedOnJob: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    consentFlag: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    courseId: string;
    consentFlag: boolean;
    hiredWithin12m: boolean;
    promotedWithin18m: boolean;
    skillsUsedOnJob: string[];
    salaryGrowthPct?: number | undefined;
    jobSatisfactionScore?: number | undefined;
    retentionMonths?: number | undefined;
}, {
    courseId: string;
    consentFlag: boolean;
    hiredWithin12m?: boolean | undefined;
    salaryGrowthPct?: number | undefined;
    jobSatisfactionScore?: number | undefined;
    retentionMonths?: number | undefined;
    promotedWithin18m?: boolean | undefined;
    skillsUsedOnJob?: string[] | undefined;
}>;
export type RecordLearningOutcomeInput = z.infer<typeof RecordLearningOutcomeInputSchema>;
export declare const QueryLearningImpactInputSchema: z.ZodObject<{
    minCohortSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    minCohortSize: number;
}, {
    minCohortSize?: number | undefined;
}>;
export type QueryLearningImpactInput = z.infer<typeof QueryLearningImpactInputSchema>;
export declare const ComputeLearningImpactInputSchema: z.ZodObject<{
    enrolledCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enrolledCount?: number | undefined;
}, {
    enrolledCount?: number | undefined;
}>;
export type ComputeLearningImpactInput = z.infer<typeof ComputeLearningImpactInputSchema>;
export declare const LearningImpactDashboardQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
}, {
    limit?: number | undefined;
}>;
export type LearningImpactDashboardQuery = z.infer<typeof LearningImpactDashboardQuerySchema>;
/**
 * Talent Pool Intelligence & Analytics Contracts (F-158, F-92, BR-200, BR-201)
 */
export declare const CreateTalentPoolInputSchema: z.ZodObject<{
    orgId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    targetRole: z.ZodOptional<z.ZodString>;
    targetSkills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    targetSkills: string[];
    description?: string | undefined;
    orgId?: string | undefined;
    targetRole?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    orgId?: string | undefined;
    targetRole?: string | undefined;
    targetSkills?: string[] | undefined;
}>;
export type CreateTalentPoolInput = z.infer<typeof CreateTalentPoolInputSchema>;
export declare const AddPoolMemberInputSchema: z.ZodObject<{
    candidateId: z.ZodString;
    source: z.ZodDefault<z.ZodEnum<["search", "referral", "inbound_application", "alumni", "outreach"]>>;
    costMinorUnits: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: "search" | "referral" | "inbound_application" | "alumni" | "outreach";
    candidateId: string;
    costMinorUnits: number;
    notes?: string | undefined;
}, {
    candidateId: string;
    source?: "search" | "referral" | "inbound_application" | "alumni" | "outreach" | undefined;
    notes?: string | undefined;
    costMinorUnits?: number | undefined;
}>;
export type AddPoolMemberInput = z.infer<typeof AddPoolMemberInputSchema>;
export declare const UpdatePoolMemberStatusInputSchema: z.ZodObject<{
    status: z.ZodEnum<["sourced", "contacted", "screening", "interviewing", "offered", "hired", "archived"]>;
}, "strip", z.ZodTypeAny, {
    status: "archived" | "interviewing" | "offered" | "hired" | "screening" | "sourced" | "contacted";
}, {
    status: "archived" | "interviewing" | "offered" | "hired" | "screening" | "sourced" | "contacted";
}>;
export type UpdatePoolMemberStatusInput = z.infer<typeof UpdatePoolMemberStatusInputSchema>;
export declare const QueryPoolIntelligenceInputSchema: z.ZodObject<{
    kThreshold: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    kThreshold: number;
}, {
    kThreshold?: number | undefined;
}>;
export type QueryPoolIntelligenceInput = z.infer<typeof QueryPoolIntelligenceInputSchema>;
/**
 * Behavioral Talent Discovery Contracts (F-159, F-146, F-130, F-150)
 */
export declare const DiscoverBehavioralTalentQuerySchema: z.ZodObject<{
    skills: z.ZodOptional<z.ZodString>;
    minCompositeScore: z.ZodOptional<z.ZodNumber>;
    minActivityScore: z.ZodOptional<z.ZodNumber>;
    minReputationScore: z.ZodOptional<z.ZodNumber>;
    maxDaysSinceActive: z.ZodOptional<z.ZodNumber>;
    minEndorsements: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    skills?: string | undefined;
    minCompositeScore?: number | undefined;
    minActivityScore?: number | undefined;
    minReputationScore?: number | undefined;
    maxDaysSinceActive?: number | undefined;
    minEndorsements?: number | undefined;
}, {
    limit?: number | undefined;
    skills?: string | undefined;
    minCompositeScore?: number | undefined;
    minActivityScore?: number | undefined;
    minReputationScore?: number | undefined;
    maxDaysSinceActive?: number | undefined;
    minEndorsements?: number | undefined;
    offset?: number | undefined;
}>;
export type DiscoverBehavioralTalentQuery = z.infer<typeof DiscoverBehavioralTalentQuerySchema>;
export declare const ComputeBehavioralProfileInputSchema: z.ZodObject<{
    candidateId: z.ZodOptional<z.ZodString>;
    weights: z.ZodOptional<z.ZodObject<{
        activity: z.ZodNumber;
        reputation: z.ZodNumber;
        peerCredibility: z.ZodNumber;
        learningVelocity: z.ZodNumber;
        emergingExpertise: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        activity: number;
        reputation: number;
        peerCredibility: number;
        learningVelocity: number;
        emergingExpertise: number;
    }, {
        activity: number;
        reputation: number;
        peerCredibility: number;
        learningVelocity: number;
        emergingExpertise: number;
    }>>;
    rawSignals: z.ZodOptional<z.ZodObject<{
        contributionsCount30d: z.ZodDefault<z.ZodNumber>;
        challengesCompleted: z.ZodDefault<z.ZodNumber>;
        reputationOverallScore: z.ZodDefault<z.ZodNumber>;
        verifiedEndorsements: z.ZodDefault<z.ZodArray<z.ZodObject<{
            endorserWeight: z.ZodDefault<z.ZodNumber>;
            isReciprocalRing: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            endorserWeight: number;
            isReciprocalRing?: boolean | undefined;
        }, {
            endorserWeight?: number | undefined;
            isReciprocalRing?: boolean | undefined;
        }>, "many">>;
        coursesCompletedLast90d: z.ZodDefault<z.ZodNumber>;
        emergingSkillsCount: z.ZodDefault<z.ZodNumber>;
        highlightedSkills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        lastActiveDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        contributionsCount30d: number;
        challengesCompleted: number;
        reputationOverallScore: number;
        verifiedEndorsements: {
            endorserWeight: number;
            isReciprocalRing?: boolean | undefined;
        }[];
        coursesCompletedLast90d: number;
        emergingSkillsCount: number;
        highlightedSkills: string[];
        lastActiveDate?: string | undefined;
    }, {
        contributionsCount30d?: number | undefined;
        challengesCompleted?: number | undefined;
        reputationOverallScore?: number | undefined;
        verifiedEndorsements?: {
            endorserWeight?: number | undefined;
            isReciprocalRing?: boolean | undefined;
        }[] | undefined;
        coursesCompletedLast90d?: number | undefined;
        emergingSkillsCount?: number | undefined;
        highlightedSkills?: string[] | undefined;
        lastActiveDate?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    candidateId?: string | undefined;
    weights?: {
        activity: number;
        reputation: number;
        peerCredibility: number;
        learningVelocity: number;
        emergingExpertise: number;
    } | undefined;
    rawSignals?: {
        contributionsCount30d: number;
        challengesCompleted: number;
        reputationOverallScore: number;
        verifiedEndorsements: {
            endorserWeight: number;
            isReciprocalRing?: boolean | undefined;
        }[];
        coursesCompletedLast90d: number;
        emergingSkillsCount: number;
        highlightedSkills: string[];
        lastActiveDate?: string | undefined;
    } | undefined;
}, {
    candidateId?: string | undefined;
    weights?: {
        activity: number;
        reputation: number;
        peerCredibility: number;
        learningVelocity: number;
        emergingExpertise: number;
    } | undefined;
    rawSignals?: {
        contributionsCount30d?: number | undefined;
        challengesCompleted?: number | undefined;
        reputationOverallScore?: number | undefined;
        verifiedEndorsements?: {
            endorserWeight?: number | undefined;
            isReciprocalRing?: boolean | undefined;
        }[] | undefined;
        coursesCompletedLast90d?: number | undefined;
        emergingSkillsCount?: number | undefined;
        highlightedSkills?: string[] | undefined;
        lastActiveDate?: string | undefined;
    } | undefined;
}>;
export type ComputeBehavioralProfileInput = z.infer<typeof ComputeBehavioralProfileInputSchema>;
/**
 * Talent Segmentation & Classification Contracts (F-160, F-84, F-85, BR-200)
 */
export declare const ClassifyCandidateInputSchema: z.ZodObject<{
    candidateId: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    yearsOfExperience: z.ZodOptional<z.ZodNumber>;
    lastActiveDays: z.ZodOptional<z.ZodNumber>;
    isStealthMode: z.ZodOptional<z.ZodBoolean>;
    recentApplicationCount: z.ZodOptional<z.ZodNumber>;
    verifiedEvidenceCount: z.ZodOptional<z.ZodNumber>;
    assessmentsPassedCount: z.ZodOptional<z.ZodNumber>;
    skillDecayRiskCount: z.ZodOptional<z.ZodNumber>;
    milestoneReadinessScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    skills?: string[] | undefined;
    yearsOfExperience?: number | undefined;
    candidateId?: string | undefined;
    lastActiveDays?: number | undefined;
    isStealthMode?: boolean | undefined;
    recentApplicationCount?: number | undefined;
    verifiedEvidenceCount?: number | undefined;
    assessmentsPassedCount?: number | undefined;
    skillDecayRiskCount?: number | undefined;
    milestoneReadinessScore?: number | undefined;
}, {
    skills?: string[] | undefined;
    yearsOfExperience?: number | undefined;
    candidateId?: string | undefined;
    lastActiveDays?: number | undefined;
    isStealthMode?: boolean | undefined;
    recentApplicationCount?: number | undefined;
    verifiedEvidenceCount?: number | undefined;
    assessmentsPassedCount?: number | undefined;
    skillDecayRiskCount?: number | undefined;
    milestoneReadinessScore?: number | undefined;
}>;
export type ClassifyCandidateInput = z.infer<typeof ClassifyCandidateInputSchema>;
export declare const QuerySegmentDistributionInputSchema: z.ZodObject<{
    kThreshold: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    kThreshold: number;
}, {
    kThreshold?: number | undefined;
}>;
export type QuerySegmentDistributionInput = z.infer<typeof QuerySegmentDistributionInputSchema>;
export declare const FilterSegmentedTalentQuerySchema: z.ZodObject<{
    specialization: z.ZodOptional<z.ZodString>;
    seniorityTier: z.ZodOptional<z.ZodString>;
    engagementSegment: z.ZodOptional<z.ZodString>;
    readinessBand: z.ZodOptional<z.ZodString>;
    minConfidenceScore: z.ZodOptional<z.ZodNumber>;
    minYearsOfExperience: z.ZodOptional<z.ZodNumber>;
    maxYearsOfExperience: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    specialization?: string | undefined;
    seniorityTier?: string | undefined;
    engagementSegment?: string | undefined;
    readinessBand?: string | undefined;
    minConfidenceScore?: number | undefined;
    minYearsOfExperience?: number | undefined;
    maxYearsOfExperience?: number | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    specialization?: string | undefined;
    seniorityTier?: string | undefined;
    engagementSegment?: string | undefined;
    readinessBand?: string | undefined;
    minConfidenceScore?: number | undefined;
    minYearsOfExperience?: number | undefined;
    maxYearsOfExperience?: number | undefined;
}>;
export type FilterSegmentedTalentQuery = z.infer<typeof FilterSegmentedTalentQuerySchema>;
/**
 * Verified Work History Network & References Contracts (F-162, F-94, F-84)
 */
export declare const CreateWorkHistoryInputSchema: z.ZodObject<{
    companyName: z.ZodString;
    companyId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    employmentType: z.ZodDefault<z.ZodEnum<["full_time", "part_time", "contract", "internship", "freelance"]>>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    isCurrent: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    corporateEmail: z.ZodOptional<z.ZodString>;
    skills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    startDate: string;
    isCurrent: boolean;
    skills: string[];
    companyName: string;
    employmentType: "full_time" | "part_time" | "contract" | "internship" | "freelance";
    description?: string | undefined;
    endDate?: string | undefined;
    companyId?: string | undefined;
    corporateEmail?: string | undefined;
}, {
    title: string;
    startDate: string;
    companyName: string;
    description?: string | undefined;
    endDate?: string | undefined;
    isCurrent?: boolean | undefined;
    skills?: string[] | undefined;
    companyId?: string | undefined;
    employmentType?: "full_time" | "part_time" | "contract" | "internship" | "freelance" | undefined;
    corporateEmail?: string | undefined;
}>;
export type CreateWorkHistoryInput = z.infer<typeof CreateWorkHistoryInputSchema>;
export declare const VerifyWorkHistoryEmailInputSchema: z.ZodObject<{
    corporateEmail: z.ZodString;
    verificationCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    corporateEmail: string;
    verificationCode?: string | undefined;
}, {
    corporateEmail: string;
    verificationCode?: string | undefined;
}>;
export type VerifyWorkHistoryEmailInput = z.infer<typeof VerifyWorkHistoryEmailInputSchema>;
export declare const RequestEmploymentReferenceInputSchema: z.ZodObject<{
    refereeName: z.ZodString;
    refereeEmail: z.ZodString;
    relationship: z.ZodEnum<["manager", "peer", "direct_report", "mentor", "client"]>;
}, "strip", z.ZodTypeAny, {
    refereeName: string;
    refereeEmail: string;
    relationship: "peer" | "mentor" | "manager" | "direct_report" | "client";
}, {
    refereeName: string;
    refereeEmail: string;
    relationship: "peer" | "mentor" | "manager" | "direct_report" | "client";
}>;
export type RequestEmploymentReferenceInput = z.infer<typeof RequestEmploymentReferenceInputSchema>;
export declare const SubmitEmploymentReferenceInputSchema: z.ZodObject<{
    token: z.ZodOptional<z.ZodString>;
    confirmDates: z.ZodBoolean;
    confirmTitle: z.ZodBoolean;
    technicalProficiency: z.ZodNumber;
    collaborationRating: z.ZodNumber;
    deliveryReliability: z.ZodNumber;
    leadershipRating: z.ZodOptional<z.ZodNumber>;
    endorsedSkills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    summaryNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confirmDates: boolean;
    confirmTitle: boolean;
    technicalProficiency: number;
    collaborationRating: number;
    deliveryReliability: number;
    endorsedSkills: string[];
    leadershipRating?: number | undefined;
    token?: string | undefined;
    summaryNotes?: string | undefined;
}, {
    confirmDates: boolean;
    confirmTitle: boolean;
    technicalProficiency: number;
    collaborationRating: number;
    deliveryReliability: number;
    leadershipRating?: number | undefined;
    token?: string | undefined;
    endorsedSkills?: string[] | undefined;
    summaryNotes?: string | undefined;
}>;
export type SubmitEmploymentReferenceInput = z.infer<typeof SubmitEmploymentReferenceInputSchema>;
export declare const QueryWorkHistoryGraphSchema: z.ZodObject<{
    includeUnverified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    includeUnverified: boolean;
}, {
    includeUnverified?: boolean | undefined;
}>;
export type QueryWorkHistoryGraph = z.infer<typeof QueryWorkHistoryGraphSchema>;
//# sourceMappingURL=index.d.ts.map
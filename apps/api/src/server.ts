import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import crypto from 'node:crypto';
import { ZodError } from 'zod';
import { validateServerEnv, ServerEnv } from '@talentsphere/config';
import {
  DomainError,
  Role,
  Profile,
  Evidence,
  Skill,
  SkillRelationship,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  createProfileEntity,
  updateProfileEntity,
  canViewProfile,
  createEvidence,
  verifyEvidence,
  disputeEvidence,
  revokeEvidence,
  generatePublicProof,
  createSkillRelationship,
  traverseSkillGraph,
  Job,
  JobStatus,
  JobApplication,
  createJobPosting,
  transitionJobStatus,
  submitJobApplication,
  transitionApplicationState,
  Challenge,
  AssessmentSession,
  XpTransaction,
  createChallenge,
  filterChallengeForCandidate,
  startAssessmentSession,
  assertAIAssistanceAllowed,
  evaluateChallengeSubmission,
  calculateCappedXp,
  Course,
  CourseModule,
  Lesson,
  CourseEnrollment,
  LessonProgress,
  CourseCertificate,
  validateCoursePublishReadiness,
  enrollUserInCourse,
  verifySequentialModuleProgress,
  verifyLessonPrerequisites,
  calculateCourseProgress,
  mintCourseCertificate,
  MessageThread,
  ThreadParticipant,
  Message,
  createThreadEntities,
  assertThreadParticipant,
  createMessageEntity,
  calculateUnreadCount,
  Notification,
  NotificationType,
  NotificationPreferences,
  createDefaultNotificationPreferences,
  shouldDeliverNotification,
  createNotificationEntity,
  markNotificationsAsRead,
  AIConversation,
  AIMessage,
  AIUsageMeter,
  AITier,
  AI_QUOTA_LIMITS,
  AI_ADVISORY_DISCLAIMER,
  createAIConversationEntity,
  sanitizePromptInput,
  estimateTokens,
  assertWithinAIQuota,
  generateCareerAssistantResponse,
  Resume,
  ResumeExport,
  ResumeFormat,
  ResumeTemplate,
  createResumeEntity,
  updateResumeEntity,
  createResumeExport,
  softDeleteResumeExport,
  Connection,
  ConnectionStatus,
  requestConnection,
  acceptConnection,
  rejectConnection,
  withdrawConnection,
  areConnected,
  getConnectionBetween,
  PortfolioProject,
  createPortfolioProject,
  updatePortfolioProject,
  canViewPortfolioProject,
  Badge,
  UserBadge,
  GamificationProfile,
  DEFAULT_PLATFORM_BADGES,
  DAILY_XP_CAP,
  calculateLevel,
  updateStreak,
  processXpAward,
  evaluateEligibleBadges,
  LeaderboardUserRecord,
  LeaderboardEntry,
  computeLeaderboard,
  UserSettings,
  DataErasureRequest,
  DataExportRequest,
  createDefaultUserSettings,
  updateUserSettings,
  requestAccountErasure,
  cancelAccountErasure,
  executeLogicalAnonymization,
  compileDataExportArchive,
  Subscription,
  Invoice,
  Entitlements,
  BillingEvent,
  PLATFORM_PLANS,
  getPlanEntitlements,
  createSubscription,
  cancelSubscription,
  renewSubscription,
  validateMonetizationIntegrity,
  assertPlatformAdmin,
  computeSystemHealth,
  validateUserStatusTransition,
  updateFeatureFlagState,
  createAdminAuditLog,
  AdminAuditLog,
  FeatureFlag,
  SystemDiagnostics,
  PlatformConfig,
  scoreSearchMatch,
  rankSearchResults,
  getAvailableCommands,
  filterCommandsByQuery,
  createSearchHistoryRecord,
  SearchResultItem,
  CommandItem,
  SearchHistoryItem,
  SearchEntityType,
  ModerationReport,
  ModerationAppeal,
  ContentScanResult,
  scanContentForAbuse,
  createModerationReport,
  assertModeratorAuthority,
  transitionReportStatus,
  resolveModerationReport,
  createModerationAppeal,
  reviewModerationAppeal,
  SavedSearch,
  JobAlert,
  SavedJob,
  SearchCriteria,
  createSavedSearch,
  updateSavedSearch,
  matchJobAgainstCriteria,
  evaluateJobAlertsForPublishedJob,
  createSavedJob,
  removeSavedJob,
  ApplicationDraft,
  ApplicationDraftVersion,
  saveApplicationDraft,
  restoreApplicationDraftVersion,
  markDraftSubmitted,
} from '@talentsphere/domain';
import {
  RegisterInputSchema,
  LoginInputSchema,
  UpdateProfileInputSchema,
  CreateEvidenceInputSchema,
  VerifyEvidenceInputSchema,
  DisputeEvidenceInputSchema,
  RevokeEvidenceInputSchema,
  CreateSkillInputSchema,
  CreateSkillRelationshipInputSchema,
  CreateOrganizationInputSchema,
  CreateJobInputSchema,
  UpdateJobStatusInputSchema,
  SubmitApplicationInputSchema,
  TransitionApplicationInputSchema,
  CreateChallengeInputSchema,
  SubmitChallengeSolutionInputSchema,
  AIAssistantQueryInputSchema,
  CreateCourseInputSchema,
  CreateCourseModuleInputSchema,
  CreateLessonInputSchema,
  EnrollCourseInputSchema,
  CompleteLessonInputSchema,
  CreateThreadInputSchema,
  SendMessageInputSchema,
  MarkNotificationsReadInputSchema,
  UpdateNotificationPreferencesInputSchema,
  CreateAIConversationInputSchema,
  AIChatInputSchema,
  CreateResumeInputSchema,
  UpdateResumeInputSchema,
  ExportResumeInputSchema,
  RequestConnectionInputSchema,
  RespondConnectionInputSchema,
  CreatePortfolioProjectInputSchema,
  UpdatePortfolioProjectInputSchema,
  ClaimGamificationActivityInputSchema,
  GetLeaderboardQuerySchema,
  UpdateUserSettingsInputSchema,
  RequestErasureInputSchema,
  CancelErasureInputSchema,
  RequestDataExportInputSchema,
  SubscribePlanInputSchema,
  CancelSubscriptionInputSchema,
  ProcessPaymentWebhookInputSchema,
  AdminUpdateUserStatusInputSchema,
  AdminUpdateUserRolesInputSchema,
  AdminToggleFeatureFlagInputSchema,
  AdminSetMaintenanceModeInputSchema,
  AdminQueryAuditLogsSchema,
  SearchQueryInputSchema,
  ClearSearchHistoryInputSchema,
  ScanContentInputSchema,
  CreateModerationReportInputSchema,
  UpdateModerationReportStatusInputSchema,
  ResolveModerationReportInputSchema,
  CreateModerationAppealInputSchema,
  ReviewModerationAppealInputSchema,
  CreateSavedSearchInputSchema,
  UpdateSavedSearchInputSchema,
  SaveApplicationDraftInputSchema,
  RestoreApplicationDraftVersionInputSchema,
  ErrorEnvelope,
} from '@talentsphere/contracts';
import { createLogger } from '@talentsphere/observability';

export async function buildApp(customEnv?: Partial<ServerEnv>): Promise<FastifyInstance> {
  const env = validateServerEnv(customEnv as Record<string, string | undefined>);

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      redact: [
        'req.headers.authorization',
        'headers.authorization',
        'password',
        'token',
        'accessToken',
      ],
    },
    genReqId: (req) => {
      const existing = req.headers['x-request-id'];
      if (typeof existing === 'string' && existing.length > 0) {
        return existing;
      }
      return `req_${crypto.randomUUID()}`;
    },
  });

  // Attach x-request-id header to all outgoing responses for tracing
  app.addHook('onSend', async (req, reply) => {
    reply.header('x-request-id', req.id);
  });

  // Security Plugins
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await app.register(cors, {
    origin: env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // 404 Handler - Canonical Error Envelope
  app.setNotFoundHandler((req: FastifyRequest, reply: FastifyReply) => {
    const errorBody: ErrorEnvelope = {
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.url} not found`,
        request_id: req.id,
      },
    };
    return reply.status(404).send(errorBody);
  });

  // Global Error Handler - Canonical Error Envelope
  app.setErrorHandler((error: Error, req: FastifyRequest, reply: FastifyReply) => {
    req.log.error({ err: error, reqId: req.id }, 'API request failed');

    if (error instanceof ZodError) {
      const errorBody: ErrorEnvelope = {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'The submitted payload failed schema validation.',
          request_id: req.id,
          details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      };
      return reply.status(400).send(errorBody);
    }

    if (error instanceof DomainError) {
      const statusMap: Record<string, number> = {
        UNAUTHENTICATED: 401,
        UNAUTHORIZED: 403,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        VALIDATION_FAILED: 422,
        INVALID_STATE_TRANSITION: 422,
        ASSESSMENT_AI_PROHIBITED: 403,
        FREE_USER_AI_QUOTA_EXCEEDED: 402,
        POLICY_VIOLATION: 422,
        RATE_LIMIT_EXCEEDED: 429,
        TENANT_ISOLATION_VIOLATION: 403,
      };
      const statusCode = statusMap[error.code] || 400;

      const errorBody: ErrorEnvelope = {
        error: {
          code: error.code,
          message: error.message,
          request_id: req.id,
          details: error.details,
        },
      };
      return reply.status(statusCode).send(errorBody);
    }

    // Default 500 Internal Error
    const errorBody: ErrorEnvelope = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          env.NODE_ENV === 'production'
            ? 'An unexpected internal error occurred.'
            : error.message,
        request_id: req.id,
      },
    };
    return reply.status(500).send(errorBody);
  });

  // Base Health Checks
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: env.APP_VERSION,
    };
  });

  app.get('/api/v1/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: env.APP_VERSION,
      environment: env.NODE_ENV,
    };
  });

  // In-memory repositories for modular monolith runtime state
  interface StoredUser {
    id: string;
    email: string;
    roles: Role[];
    passwordHash: string;
    createdAt: string;
    status?: string;
  }
  const usersByEmail = new Map<string, StoredUser>();
  const usersById = new Map<string, StoredUser>();
  const profilesByUserId = new Map<string, any>();
  const profilesById = new Map<string, any>();
  const userSettingsByUserId = new Map<string, UserSettings>();
  const erasureRequestsByUserId = new Map<string, DataErasureRequest[]>();
  const erasureRequestsById = new Map<string, DataErasureRequest>();
  const exportRequestsByUserId = new Map<string, DataExportRequest[]>();
  const subscriptionsByUserId = new Map<string, Subscription>();
  const entitlementsByUserId = new Map<string, Entitlements>();
  const invoicesByUserId = new Map<string, Invoice[]>();
  const invoicesById = new Map<string, Invoice>();
  const billingEventsByIdempotency = new Map<string, BillingEvent>();
  const searchHistoryByUserId = new Map<string, SearchHistoryItem[]>();
  const moderationReportsById = new Map<string, ModerationReport>();
  const moderationAppealsById = new Map<string, ModerationAppeal>();
  const savedSearchesById = new Map<string, SavedSearch>();
  const jobAlertsById = new Map<string, JobAlert>();
  const savedJobsByUserId = new Map<string, SavedJob[]>();
  const applicationDraftsById = new Map<string, ApplicationDraft>();
  const applicationDraftsByCandidateAndJob = new Map<string, string>(); // `${candidateId}:${jobId}` -> draftId
  const applicationDraftVersionsByDraftId = new Map<string, ApplicationDraftVersion[]>();

  // Feature Flags & Admin Repositories (F-17, F-35)
  const adminAuditLogs: AdminAuditLog[] = [];
  const featureFlags = new Map<string, FeatureFlag>([
    [
      'FEATURE_LMS',
      {
        key: 'FEATURE_LMS',
        enabled: true,
        description: 'Learning management system and interactive course modules',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'FEATURE_CODE_ARENA',
      {
        key: 'FEATURE_CODE_ARENA',
        enabled: true,
        description: 'Competitive coding challenges and assessments',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'FEATURE_MESSAGING',
      {
        key: 'FEATURE_MESSAGING',
        enabled: true,
        description: 'Direct messaging and networking channels',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'FEATURE_NOTIFICATIONS',
      {
        key: 'FEATURE_NOTIFICATIONS',
        enabled: true,
        description: 'Real-time and batch notification delivery',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'FEATURE_AI_MATCHING',
      {
        key: 'FEATURE_AI_MATCHING',
        enabled: false,
        description: 'AI-assisted recruiter candidate matching',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);
  let systemInMaintenance = false;

  // Public Feature Flags Route
  app.get('/api/v1/feature-flags', async () => {
    const flagsObj: Record<string, boolean> = {};
    for (const [k, v] of featureFlags.entries()) {
      flagsObj[k] = v.enabled;
    }
    return {
      flags: flagsObj,
    };
  });

  // Authentication Helper
  const extractUser = (req: FastifyRequest) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new DomainError('UNAUTHENTICATED', 'Missing or malformed Authorization header.');
    }
    const token = authHeader.substring(7).trim();
    const session = verifySessionToken(token);
    if (!session) {
      throw new DomainError('UNAUTHENTICATED', 'Invalid or expired session token.');
    }
    return session;
  };

  const maybeExtractUser = (req: FastifyRequest) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7).trim();
    try {
      return verifySessionToken(token);
    } catch {
      return null;
    }
  };

  // Auth Routes
  app.post('/api/v1/auth/register', async (req: FastifyRequest, reply: FastifyReply) => {
    const input = RegisterInputSchema.parse(req.body);
    const existing = usersByEmail.get(input.email.toLowerCase());
    if (existing) {
      throw new DomainError('CONFLICT', 'An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(input.password);
    const userId = crypto.randomUUID();

    const storedUser: StoredUser = {
      id: userId,
      email: input.email.toLowerCase(),
      roles: [input.role],
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    usersByEmail.set(storedUser.email, storedUser);
    usersById.set(storedUser.id, storedUser);

    const profile = createProfileEntity(userId, input.fullName);
    profilesByUserId.set(userId, profile);
    profilesById.set(profile.id, profile);

    const token = createSessionToken(userId, storedUser.email, storedUser.roles);

    return reply.status(201).send({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email: storedUser.email,
        roles: storedUser.roles,
      },
      profile,
    });
  });

  app.post('/api/v1/auth/login', async (req: FastifyRequest, reply: FastifyReply) => {
    const input = LoginInputSchema.parse(req.body);
    const user = usersByEmail.get(input.email.toLowerCase());
    if (!user) {
      throw new DomainError('UNAUTHENTICATED', 'Invalid email or password.');
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new DomainError('UNAUTHENTICATED', 'Invalid email or password.');
    }

    const profile = profilesByUserId.get(user.id);
    const token = createSessionToken(user.id, user.email, user.roles);

    return reply.status(200).send({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
      profile,
    });
  });

  // Profile Routes
  app.get('/api/v1/profile/me', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }
    return reply.status(200).send({ profile });
  });

  app.patch('/api/v1/profile/me', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const updates = UpdateProfileInputSchema.parse(req.body);

    const currentProfile = profilesByUserId.get(session.userId);
    if (!currentProfile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const updated = updateProfileEntity(currentProfile, updates as any);

    profilesByUserId.set(session.userId, updated);
    profilesById.set(updated.id, updated);

    return reply.status(200).send({ profile: updated });
  });

  app.get('/api/v1/profile/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const profile = profilesById.get(id);
    if (!profile) {
      throw new DomainError('NOT_FOUND', `Profile with ID ${id} not found.`);
    }

    let viewerId: string | undefined;
    let viewerRoles: Role[] = [];

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const session = verifySessionToken(authHeader.substring(7).trim());
        if (session) {
          viewerId = session.userId;
          viewerRoles = session.roles;
        }
      } catch {
        // anonymous
      }
    }

    const allowed = canViewProfile(profile, viewerId, viewerRoles);
    if (!allowed) {
      throw new DomainError('FORBIDDEN', 'This profile is private or restricted to authorized roles.');
    }

    return reply.status(200).send({ profile });
  });

  // Evidence & Skills Repositories
  const evidenceById = new Map<string, Evidence>();
  const evidenceBySubjectId = new Map<string, Evidence[]>();
  const skillsById = new Map<string, Skill>();
  const skillsBySlug = new Map<string, Skill>();
  const skillRelationships: SkillRelationship[] = [];
  const evidenceSkills = new Map<string, Set<string>>();
  const auditLogs: any[] = [];
  const enqueuedWorkerJobs: any[] = [];

  // Notification Center Repositories & Helper (F-14, BR-120)
  const notificationsById = new Map<string, Notification>();
  const notificationsByRecipientId = new Map<string, Notification[]>();
  const notificationPreferencesByUserId = new Map<string, NotificationPreferences>();

  const sendNotification = (params: {
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    referenceType?: string;
    referenceId?: string;
  }): Notification | null => {
    let prefs = notificationPreferencesByUserId.get(params.recipientId);
    if (!prefs) {
      prefs = createDefaultNotificationPreferences(params.recipientId);
      notificationPreferencesByUserId.set(params.recipientId, prefs);
    }

    if (!shouldDeliverNotification(prefs, params.type)) {
      return null;
    }

    const notif = createNotificationEntity(params);
    notificationsById.set(notif.id, notif);

    const list = notificationsByRecipientId.get(params.recipientId) || [];
    list.unshift(notif);
    notificationsByRecipientId.set(params.recipientId, list);

    enqueuedWorkerJobs.push({
      type: 'notification.push',
      payload: {
        notificationId: notif.id,
        recipientId: notif.recipientId,
        type: notif.type,
      },
      enqueuedAt: notif.createdAt,
    });

    return notif;
  };

  // Seed canonical baseline skills (BR-141)
  const seedSkills: Skill[] = [
    {
      id: '10000000-0000-4000-a000-000000000001',
      slug: 'typescript',
      name: 'TypeScript',
      category: 'Programming Languages',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '10000000-0000-4000-a000-000000000002',
      slug: 'react',
      name: 'React',
      category: 'Frontend Frameworks',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '10000000-0000-4000-a000-000000000003',
      slug: 'postgresql',
      name: 'PostgreSQL',
      category: 'Databases',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '10000000-0000-4000-a000-000000000004',
      slug: 'system-design',
      name: 'System Design',
      category: 'Architecture',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const s of seedSkills) {
    skillsById.set(s.id, s);
    skillsBySlug.set(s.slug, s);
  }

  // Evidence Endpoints (F-96, BR-149..155)
  app.post('/api/v1/evidence', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateEvidenceInputSchema.parse(req.body);

    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile required before creating evidence.');
    }

    const evidence = createEvidence({
      subjectId: profile.id,
      type: input.type,
      title: input.title,
      description: input.description,
      source: input.source,
      provenance: input.provenance,
      recencyDate: input.recencyDate,
    });

    evidenceById.set(evidence.id, evidence);
    const existingList = evidenceBySubjectId.get(profile.id) || [];
    existingList.push(evidence);
    evidenceBySubjectId.set(profile.id, existingList);

    if (input.skillIds && input.skillIds.length > 0) {
      for (const skillId of input.skillIds) {
        if (!skillsById.has(skillId)) {
          throw new DomainError('NOT_FOUND', `Canonical skill ${skillId} does not exist (BR-144).`);
        }
      }
      evidenceSkills.set(evidence.id, new Set(input.skillIds));
    }

    auditLogs.push({
      event: 'evidence.created',
      actorId: session.userId,
      targetId: evidence.id,
      timestamp: new Date().toISOString(),
    });

    return reply.status(201).send({ evidence });
  });

  app.get('/api/v1/evidence/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const evidence = evidenceById.get(id);
    if (!evidence) {
      throw new DomainError('NOT_FOUND', `Evidence with ID ${id} not found.`);
    }

    const profile = profilesById.get(evidence.subjectId);
    let viewerId: string | undefined;
    let viewerRoles: Role[] = [];

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const session = verifySessionToken(authHeader.substring(7).trim());
        if (session) {
          viewerId = session.userId;
          viewerRoles = session.roles;
        }
      } catch {
        // anonymous
      }
    }

    if (profile && !canViewProfile(profile, viewerId, viewerRoles)) {
      throw new DomainError('FORBIDDEN', 'Access to this evidence is restricted by profile privacy.');
    }

    const mappedSkillIds = evidenceSkills.get(evidence.id);
    const skills = mappedSkillIds
      ? Array.from(mappedSkillIds).map((sid) => skillsById.get(sid)).filter(Boolean)
      : [];

    return reply.status(200).send({ evidence, skills });
  });

  app.get('/api/v1/evidence/subject/:subjectId', async (req: FastifyRequest<{ Params: { subjectId: string } }>, reply: FastifyReply) => {
    const { subjectId } = req.params;
    const profile = profilesById.get(subjectId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', `Profile with ID ${subjectId} not found.`);
    }

    let viewerId: string | undefined;
    let viewerRoles: Role[] = [];

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const session = verifySessionToken(authHeader.substring(7).trim());
        if (session) {
          viewerId = session.userId;
          viewerRoles = session.roles;
        }
      } catch {
        // anonymous
      }
    }

    if (!canViewProfile(profile, viewerId, viewerRoles)) {
      throw new DomainError('FORBIDDEN', 'Access to evidence is restricted by subject privacy settings.');
    }

    const list = evidenceBySubjectId.get(subjectId) || [];
    return reply.status(200).send({ evidence: list });
  });

  app.post('/api/v1/evidence/:id/verify', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = VerifyEvidenceInputSchema.parse(req.body);

    const evidence = evidenceById.get(id);
    if (!evidence) {
      throw new DomainError('NOT_FOUND', `Evidence with ID ${id} not found.`);
    }

    const subjectProfile = profilesById.get(evidence.subjectId);
    const updated = verifyEvidence(
      evidence,
      { userId: session.userId, role: session.roles[0] },
      input.verificationLevel,
      input.notes,
      subjectProfile?.userId
    );

    evidenceById.set(updated.id, updated);
    const list = evidenceBySubjectId.get(updated.subjectId) || [];
    const index = list.findIndex((e) => e.id === updated.id);
    if (index >= 0) list[index] = updated;

    enqueuedWorkerJobs.push({
      type: 'evidence.propagate',
      payload: { evidenceId: updated.id, status: updated.status, level: updated.verificationLevel },
      enqueuedAt: new Date().toISOString(),
    });

    auditLogs.push({
      event: 'evidence.verified',
      actorId: session.userId,
      targetId: updated.id,
      timestamp: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Evidence verified successfully.',
      evidence: updated,
    });
  });

  app.post('/api/v1/evidence/:id/dispute', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = DisputeEvidenceInputSchema.parse(req.body);

    const evidence = evidenceById.get(id);
    if (!evidence) {
      throw new DomainError('NOT_FOUND', `Evidence with ID ${id} not found.`);
    }

    const updated = disputeEvidence(
      evidence,
      { userId: session.userId, role: session.roles[0] },
      input.reason
    );

    evidenceById.set(updated.id, updated);
    const list = evidenceBySubjectId.get(updated.subjectId) || [];
    const index = list.findIndex((e) => e.id === updated.id);
    if (index >= 0) list[index] = updated;

    enqueuedWorkerJobs.push({
      type: 'evidence.propagate',
      payload: { evidenceId: updated.id, status: updated.status },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Evidence disputed.',
      evidence: updated,
    });
  });

  app.post('/api/v1/evidence/:id/revoke', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = RevokeEvidenceInputSchema.parse(req.body);

    const evidence = evidenceById.get(id);
    if (!evidence) {
      throw new DomainError('NOT_FOUND', `Evidence with ID ${id} not found.`);
    }

    const updated = revokeEvidence(
      evidence,
      { userId: session.userId, role: session.roles[0] },
      input.reason
    );

    evidenceById.set(updated.id, updated);
    const list = evidenceBySubjectId.get(updated.subjectId) || [];
    const index = list.findIndex((e) => e.id === updated.id);
    if (index >= 0) list[index] = updated;

    enqueuedWorkerJobs.push({
      type: 'evidence.propagate',
      payload: { evidenceId: updated.id, status: updated.status },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Evidence revoked.',
      evidence: updated,
    });
  });

  app.get('/api/v1/evidence/:id/verify-public', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const evidence = evidenceById.get(id);
    if (!evidence) {
      throw new DomainError('NOT_FOUND', `Evidence with ID ${id} not found.`);
    }

    const proof = generatePublicProof(evidence);
    return reply.status(200).send({ proof });
  });

  // Skills Taxonomy Endpoints (F-84, BR-141..147)
  app.get('/api/v1/skills', async () => {
    return { skills: Array.from(skillsById.values()) };
  });

  app.post('/api/v1/skills', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    if (!session.roles.includes('platform_admin')) {
      throw new DomainError('UNAUTHORIZED', 'Skills taxonomy is curated by Platform Admin only (BR-141).');
    }

    const input = CreateSkillInputSchema.parse(req.body);
    if (skillsBySlug.has(input.slug)) {
      throw new DomainError('CONFLICT', `Skill with slug "${input.slug}" already exists.`);
    }

    const now = new Date().toISOString();
    const skill: Skill = {
      id: crypto.randomUUID(),
      slug: input.slug,
      name: input.name,
      category: input.category,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };

    skillsById.set(skill.id, skill);
    skillsBySlug.set(skill.slug, skill);

    return reply.status(201).send({ skill });
  });

  app.post('/api/v1/skills/relationships', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    if (!session.roles.includes('platform_admin')) {
      throw new DomainError('UNAUTHORIZED', 'Only Platform Admins may define skill relationships (BR-141).');
    }

    const input = CreateSkillRelationshipInputSchema.parse(req.body);
    if (!skillsById.has(input.sourceSkillId)) {
      throw new DomainError('NOT_FOUND', `Source skill ${input.sourceSkillId} not found.`);
    }
    if (!skillsById.has(input.targetSkillId)) {
      throw new DomainError('NOT_FOUND', `Target skill ${input.targetSkillId} not found.`);
    }

    const relationship = createSkillRelationship(skillRelationships, {
      sourceSkillId: input.sourceSkillId,
      targetSkillId: input.targetSkillId,
      relationshipType: input.relationshipType,
      weight: input.weight,
    });

    skillRelationships.push(relationship);

    return reply.status(201).send({ relationship });
  });

  app.get('/api/v1/skills/:id/graph', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const skill = skillsById.get(id);
    if (!skill) {
      throw new DomainError('NOT_FOUND', `Skill with ID ${id} not found.`);
    }

    const graph = traverseSkillGraph(skill, skillsById, skillRelationships, 5);
    return reply.status(200).send({ graph });
  });

  // Organization, Job & Application Repositories (F-04, F-05, F-06)
  interface StoredOrganization {
    id: string;
    name: string;
    slug: string;
    website?: string;
    description?: string;
    createdAt: string;
  }
  interface StoredOrgMembership {
    id: string;
    orgId: string;
    userId: string;
    role: string;
    createdAt: string;
  }

  const organizationsById = new Map<string, StoredOrganization>();
  const organizationsBySlug = new Map<string, StoredOrganization>();
  const orgMembershipsByOrgId = new Map<string, StoredOrgMembership[]>();
  const orgMembershipsByUserId = new Map<string, StoredOrgMembership[]>();
  const jobsById = new Map<string, Job>();
  const jobsByOrgId = new Map<string, Job[]>();
  const applicationsById = new Map<string, JobApplication>();
  const applicationsByJobId = new Map<string, JobApplication[]>();
  const applicationsByCandidateId = new Map<string, JobApplication[]>();

  // Organization Endpoints
  app.post('/api/v1/organizations', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateOrganizationInputSchema.parse(req.body);

    if (organizationsBySlug.has(input.slug)) {
      throw new DomainError('CONFLICT', `Organization with slug "${input.slug}" already exists.`);
    }

    const orgId = crypto.randomUUID();
    const now = new Date().toISOString();
    const org: StoredOrganization = {
      id: orgId,
      name: input.name,
      slug: input.slug,
      website: input.website,
      description: input.description,
      createdAt: now,
    };

    organizationsById.set(orgId, org);
    organizationsBySlug.set(input.slug, org);

    const membership: StoredOrgMembership = {
      id: crypto.randomUUID(),
      orgId,
      userId: session.userId,
      role: 'owner',
      createdAt: now,
    };

    const orgMembers = orgMembershipsByOrgId.get(orgId) || [];
    orgMembers.push(membership);
    orgMembershipsByOrgId.set(orgId, orgMembers);

    const userMembers = orgMembershipsByUserId.get(session.userId) || [];
    userMembers.push(membership);
    orgMembershipsByUserId.set(session.userId, userMembers);

    return reply.status(201).send({ organization: org });
  });

  app.get('/api/v1/organizations/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const org = organizationsById.get(id);
    if (!org) {
      throw new DomainError('NOT_FOUND', `Organization with ID ${id} not found.`);
    }
    return reply.status(200).send({ organization: org });
  });

  // Jobs Endpoints (F-04, F-05, BR-01..BR-12)
  app.post('/api/v1/jobs', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateJobInputSchema.parse(req.body);

    const userMemberships = orgMembershipsByUserId.get(session.userId) || [];
    const isMember = userMemberships.some((m) => m.orgId === input.orgId);
    const isAdmin = session.roles.includes('platform_admin');

    if (!isMember && !isAdmin) {
      throw new DomainError('FORBIDDEN', 'You do not belong to the organization for this job posting (BR-12).');
    }

    if (input.requiredSkillIds && input.requiredSkillIds.length > 0) {
      for (const skillId of input.requiredSkillIds) {
        if (!skillsById.has(skillId)) {
          throw new DomainError('NOT_FOUND', `Canonical skill ${skillId} does not exist (BR-144).`);
        }
      }
    }

    const job = createJobPosting({
      orgId: input.orgId,
      title: input.title,
      description: input.description,
      location: input.location,
      workMode: input.workMode,
      jobType: input.jobType,
      requiredSkillIds: input.requiredSkillIds,
      salaryRange:
        input.salaryMinMinor !== undefined && input.salaryMaxMinor !== undefined
          ? {
              minMinor: input.salaryMinMinor,
              maxMinor: input.salaryMaxMinor,
              currency: input.currency,
            }
          : undefined,
      actor: {
        userId: session.userId,
        roles: session.roles,
        orgId: input.orgId,
      },
    });

    jobsById.set(job.id, job);
    const list = jobsByOrgId.get(input.orgId) || [];
    list.push(job);
    jobsByOrgId.set(input.orgId, list);

    if (job.status === 'published') {
      const activeSearches = Array.from(savedSearchesById.values()).filter((s) => s.isActive);
      const alerts = evaluateJobAlertsForPublishedJob(job, activeSearches);
      for (const alert of alerts) {
        jobAlertsById.set(alert.id, alert);
      }
    }

    auditLogs.push({
      event: 'job.created',
      actorId: session.userId,
      targetId: job.id,
      timestamp: new Date().toISOString(),
    });

    return reply.status(201).send({ job });
  });

  app.get('/api/v1/jobs', async () => {
    const published = Array.from(jobsById.values()).filter((j) => j.status === 'published');
    return { jobs: published };
  });

  app.get('/api/v1/jobs/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const job = jobsById.get(id);
    if (!job) {
      throw new DomainError('NOT_FOUND', `Job with ID ${id} not found.`);
    }

    const org = organizationsById.get(job.orgId);
    const skills = job.requiredSkillIds.map((sid) => skillsById.get(sid)).filter(Boolean);

    return reply.status(200).send({ job, organization: org, requiredSkills: skills });
  });

  app.patch('/api/v1/jobs/:id/status', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = UpdateJobStatusInputSchema.parse(req.body);

    const job = jobsById.get(id);
    if (!job) {
      throw new DomainError('NOT_FOUND', `Job with ID ${id} not found.`);
    }

    const updated = transitionJobStatus(job, input.status, {
      userId: session.userId,
      roles: session.roles,
      orgId: job.orgId,
    });

    jobsById.set(updated.id, updated);
    const list = jobsByOrgId.get(job.orgId) || [];
    const idx = list.findIndex((j) => j.id === updated.id);
    if (idx >= 0) list[idx] = updated;

    if (updated.status === 'published' && job.status !== 'published') {
      const activeSearches = Array.from(savedSearchesById.values()).filter((s) => s.isActive);
      const alerts = evaluateJobAlertsForPublishedJob(updated, activeSearches);
      for (const alert of alerts) {
        jobAlertsById.set(alert.id, alert);
      }
    }

    return reply.status(200).send({
      message: 'Job status updated successfully.',
      job: updated,
    });
  });

  // Application Endpoints (F-06, BR-02, BR-15..BR-41)
  app.post('/api/v1/jobs/:id/apply', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id: jobId } = req.params;
    const input = SubmitApplicationInputSchema.parse(req.body);

    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile required before submitting job applications.');
    }

    const job = jobsById.get(jobId);
    if (!job) {
      throw new DomainError('NOT_FOUND', `Job with ID ${jobId} not found.`);
    }

    if (input.attachedEvidenceIds && input.attachedEvidenceIds.length > 0) {
      for (const evId of input.attachedEvidenceIds) {
        const ev = evidenceById.get(evId);
        if (!ev) {
          throw new DomainError('NOT_FOUND', `Evidence item ${evId} not found.`);
        }
        if (ev.subjectId !== profile.id) {
          throw new DomainError('FORBIDDEN', `Evidence item ${evId} does not belong to your profile.`);
        }
      }
    }

    const existingApps = Array.from(applicationsById.values());
    const application = submitJobApplication({
      jobId,
      jobStatus: job.status,
      candidateProfileId: profile.id,
      actor: {
        userId: session.userId,
        roles: session.roles,
      },
      existingApplications: existingApps,
      coverLetter: input.coverLetter,
      attachedEvidenceIds: input.attachedEvidenceIds,
    });

    applicationsById.set(application.id, application);
    const jobList = applicationsByJobId.get(jobId) || [];
    jobList.push(application);
    applicationsByJobId.set(jobId, jobList);

    const candList = applicationsByCandidateId.get(profile.id) || [];
    candList.push(application);
    applicationsByCandidateId.set(profile.id, candList);

    // Mark candidate draft as submitted if exists (F-36)
    const draftKey = `${profile.id}:${jobId}`;
    const draftId = applicationDraftsByCandidateAndJob.get(draftKey);
    if (draftId) {
      const existingDraft = applicationDraftsById.get(draftId);
      if (existingDraft && !existingDraft.isSubmitted) {
        const submittedDraft = markDraftSubmitted(existingDraft);
        applicationDraftsById.set(draftId, submittedDraft);
      }
    }

    enqueuedWorkerJobs.push({
      type: 'application.submitted',
      payload: { applicationId: application.id, jobId, candidateId: profile.id },
      enqueuedAt: new Date().toISOString(),
    });

    auditLogs.push({
      event: 'application.submitted',
      actorId: session.userId,
      targetId: application.id,
      timestamp: new Date().toISOString(),
    });

    return reply.status(201).send({
      message: 'Application submitted successfully.',
      application,
    });
  });

  app.get('/api/v1/applications/my', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const list = applicationsByCandidateId.get(profile.id) || [];
    const withJobDetails = list.map((app) => ({
      ...app,
      job: jobsById.get(app.jobId),
    }));

    return reply.status(200).send({ applications: withJobDetails });
  });

  app.get('/api/v1/jobs/:id/applications', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id: jobId } = req.params;

    const job = jobsById.get(jobId);
    if (!job) {
      throw new DomainError('NOT_FOUND', `Job with ID ${jobId} not found.`);
    }

    const userMemberships = orgMembershipsByUserId.get(session.userId) || [];
    const isMember = userMemberships.some((m) => m.orgId === job.orgId);
    const isAdmin = session.roles.includes('platform_admin');

    if (!isMember && !isAdmin) {
      throw new DomainError('FORBIDDEN', 'Access to candidate applications is restricted to authorized recruiters for this organization (BR-40).');
    }

    const list = applicationsByJobId.get(jobId) || [];
    const enriched = list.map((app) => ({
      ...app,
      candidate: profilesById.get(app.candidateId),
      evidence: app.attachedEvidenceIds.map((evId) => evidenceById.get(evId)).filter(Boolean),
    }));

    return reply.status(200).send({ applications: enriched });
  });

  app.post('/api/v1/applications/:id/transition', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = TransitionApplicationInputSchema.parse(req.body);

    const application = applicationsById.get(id);
    if (!application) {
      throw new DomainError('NOT_FOUND', `Application with ID ${id} not found.`);
    }

    const candidateProfile = profilesById.get(application.candidateId);
    const isCandidateOwner = candidateProfile?.userId === session.userId;

    const job = jobsById.get(application.jobId);
    const userMemberships = orgMembershipsByUserId.get(session.userId) || [];
    const isRecruiterForJob = job ? userMemberships.some((m) => m.orgId === job.orgId) : false;

    const updated = transitionApplicationState(
      application,
      input.targetState,
      {
        userId: session.userId,
        roles: session.roles,
        isCandidateOwner,
        isRecruiterForJob,
      },
      input.reason
    );

    applicationsById.set(updated.id, updated);

    // Update candidate list
    const candList = applicationsByCandidateId.get(application.candidateId) || [];
    const candIdx = candList.findIndex((a) => a.id === updated.id);
    if (candIdx >= 0) candList[candIdx] = updated;

    // Update job list
    const jobList = applicationsByJobId.get(application.jobId) || [];
    const jobIdx = jobList.findIndex((a) => a.id === updated.id);
    if (jobIdx >= 0) jobList[jobIdx] = updated;

    enqueuedWorkerJobs.push({
      type: 'application.status_changed',
      payload: { applicationId: updated.id, status: updated.status },
      enqueuedAt: new Date().toISOString(),
    });

    auditLogs.push({
      event: 'application.status_changed',
      actorId: session.userId,
      targetId: updated.id,
      metadata: { targetState: input.targetState, reason: input.reason },
      timestamp: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Application status transitioned successfully.',
      application: updated,
    });
  });

  // Challenges Arena & Assessment Engine Repositories (F-08, BR-24, BR-25, BR-49..51)
  const challengesById = new Map<string, Challenge>();
  const challengesBySlug = new Map<string, Challenge>();
  const assessmentSessionsById = new Map<string, AssessmentSession>();
  const assessmentSessionsByCandidateId = new Map<string, AssessmentSession[]>();
  const xpTransactionsByUserId = new Map<string, XpTransaction[]>();

  // Seed baseline challenge
  const seedChallenge = createChallenge({
    slug: 'reverse-words-string',
    title: 'Reverse Words in a String',
    description: 'Given an input string s, reverse the order of the words.',
    difficulty: 'easy',
    category: 'Strings',
    testCases: [
      { id: 'tc1', input: '"the sky is blue"', expectedOutput: '"blue is sky the"', isHidden: false },
      { id: 'tc2', input: '"  hello world  "', expectedOutput: '"world hello"', isHidden: true },
    ],
    actor: { userId: '00000000-0000-0000-0000-000000000000', roles: ['platform_admin'] },
  });
  challengesById.set(seedChallenge.id, seedChallenge);
  challengesBySlug.set(seedChallenge.slug, seedChallenge);

  // Challenges Endpoints
  app.get('/api/v1/challenges', async () => {
    const list = Array.from(challengesById.values()).map((c) => filterChallengeForCandidate(c));
    return { challenges: list };
  });

  app.get('/api/v1/challenges/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const challenge = challengesById.get(id);
    if (!challenge) {
      throw new DomainError('NOT_FOUND', `Challenge with ID ${id} not found.`);
    }
    return reply.status(200).send({ challenge: filterChallengeForCandidate(challenge) });
  });

  app.post('/api/v1/challenges', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateChallengeInputSchema.parse(req.body);

    if (challengesBySlug.has(input.slug)) {
      throw new DomainError('CONFLICT', `Challenge with slug "${input.slug}" already exists.`);
    }

    const challenge = createChallenge({
      slug: input.slug,
      title: input.title,
      description: input.description,
      difficulty: input.difficulty,
      category: input.category,
      skillIds: input.skillIds,
      testCases: input.testCases as any,
      timeLimitMs: input.timeLimitMs,
      memoryLimitMb: input.memoryLimitMb,
      policyMode: input.policyMode,
      actor: {
        userId: session.userId,
        roles: session.roles,
      },
    });

    challengesById.set(challenge.id, challenge);
    challengesBySlug.set(challenge.slug, challenge);

    return reply.status(201).send({ challenge });
  });

  // Assessment Session & Submission Endpoints
  app.post('/api/v1/challenges/:id/start-session', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id: challengeId } = req.params;

    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Candidate profile required before starting assessment.');
    }

    const challenge = challengesById.get(challengeId);
    if (!challenge) {
      throw new DomainError('NOT_FOUND', `Challenge with ID ${challengeId} not found.`);
    }

    const assessmentSession = startAssessmentSession({
      candidateProfileId: profile.id,
      challenge,
    });

    assessmentSessionsById.set(assessmentSession.id, assessmentSession);
    const list = assessmentSessionsByCandidateId.get(profile.id) || [];
    list.push(assessmentSession);
    assessmentSessionsByCandidateId.set(profile.id, list);

    return reply.status(201).send({ session: assessmentSession });
  });

  app.post('/api/v1/challenges/:id/submit', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id: challengeId } = req.params;
    const input = SubmitChallengeSolutionInputSchema.parse(req.body);

    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Candidate profile required.');
    }

    const challenge = challengesById.get(challengeId);
    if (!challenge) {
      throw new DomainError('NOT_FOUND', `Challenge with ID ${challengeId} not found.`);
    }

    let activeSession: AssessmentSession | undefined;
    if (input.sessionId) {
      activeSession = assessmentSessionsById.get(input.sessionId);
    } else {
      const candidateSessions = assessmentSessionsByCandidateId.get(profile.id) || [];
      activeSession = candidateSessions.find(
        (s) => s.assessmentId === challengeId && s.status === 'in_progress'
      );
    }

    const evalResult = evaluateChallengeSubmission({
      challenge,
      candidateProfileId: profile.id,
      language: input.language,
      code: input.code,
      session: activeSession,
    });

    let awardedXp = 0;
    if (evalResult.status === 'passed') {
      // 1. Store auto-minted verified evidence
      if (evalResult.evidence) {
        evidenceById.set(evalResult.evidence.id, evalResult.evidence);
        const evList = evidenceBySubjectId.get(profile.id) || [];
        evList.push(evalResult.evidence);
        evidenceBySubjectId.set(profile.id, evList);

        enqueuedWorkerJobs.push({
          type: 'evidence.propagate',
          payload: {
            evidenceId: evalResult.evidence.id,
            status: evalResult.evidence.status,
            level: evalResult.evidence.verificationLevel,
          },
          enqueuedAt: new Date().toISOString(),
        });
      }

      // 2. Calculate and award XP with 200 XP/day cap (BR-25)
      const userTxs = xpTransactionsByUserId.get(session.userId) || [];
      awardedXp = calculateCappedXp(evalResult.xpEarned, userTxs, 200);

      if (awardedXp > 0) {
        const tx: XpTransaction = {
          id: crypto.randomUUID(),
          userId: session.userId,
          amount: awardedXp,
          referenceType: 'challenge',
          referenceId: challenge.id,
          description: `Passed challenge "${challenge.title}"`,
          createdAt: new Date().toISOString(),
        };
        userTxs.push(tx);
        xpTransactionsByUserId.set(session.userId, userTxs);
      }
    }

    // Close session if active
    if (activeSession && activeSession.status === 'in_progress') {
      activeSession.status = 'submitted';
      activeSession.submittedAt = new Date().toISOString();
      activeSession.endTime = new Date().toISOString();
    }

    return reply.status(200).send({
      result: evalResult,
      evidence: evalResult.evidence,
      xpEarned: awardedXp,
    });
  });

  // AI Assistant & Gateway Entry Point (SSOT Section D: Strict AI_PROHIBITED Enforcement)
  app.post('/api/v1/ai/assistant/query', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = AIAssistantQueryInputSchema.parse(req.body);

    const profile = profilesByUserId.get(session.userId);
    if (profile) {
      const activeSessions = assessmentSessionsByCandidateId.get(profile.id) || [];
      // SSOT Section D: Mandatory server-side enforcement. Never trust UI hiding.
      assertAIAssistanceAllowed(activeSessions);
    }

    return reply.status(200).send({
      answer: `AI Assistant guidance for: "${input.prompt}"`,
      disclaimer: 'AI outputs are advisory and not verified candidate evidence.',
    });
  });

  // XP Ledger Endpoint
  app.get('/api/v1/xp/ledger', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const txs = xpTransactionsByUserId.get(session.userId) || [];
    const totalXp = txs.reduce((sum, t) => sum + t.amount, 0);

    return reply.status(200).send({
      totalXp,
      transactions: txs,
    });
  });

  // LMS & Course Platform Repositories (F-07, BR-21..23, BR-46..48, BR-91..94, BR-150)
  const coursesById = new Map<string, Course>();
  const coursesBySlug = new Map<string, Course>();
  const courseModulesById = new Map<string, CourseModule>();
  const lessonsById = new Map<string, Lesson>();
  const enrollmentsById = new Map<string, CourseEnrollment>();
  const enrollmentsByUserAndCourse = new Map<string, CourseEnrollment>(); // key: `${userId}:${courseId}`
  const lessonProgressByEnrollmentAndLesson = new Map<string, LessonProgress>(); // key: `${enrollmentId}:${lessonId}`
  const certificatesByNumber = new Map<string, CourseCertificate>();
  const certificatesByEnrollmentId = new Map<string, CourseCertificate>();
  const courseSkillsByCourseId = new Map<string, string[]>();

  // Seed baseline course for instant onboarding & exploration
  const seedCourseId = 'c0000000-0000-0000-0000-000000000001';
  const seedModule1Id = 'm0000000-0000-0000-0000-000000000001';
  const seedModule2Id = 'm0000000-0000-0000-0000-000000000002';
  const seedLesson1Id = 'l0000000-0000-0000-0000-000000000001';
  const seedLesson2Id = 'l0000000-0000-0000-0000-000000000002';
  const seedLesson3Id = 'l0000000-0000-0000-0000-000000000003';

  const seedCourse: Course = {
    id: seedCourseId,
    instructorId: '00000000-0000-0000-0000-000000000000',
    title: 'TypeScript Full-Stack Architecture',
    slug: 'typescript-fullstack-architecture',
    description: 'Master enterprise TypeScript, Fastify modular architecture, and schema migrations.',
    status: 'published',
    level: 'intermediate',
    estimatedDurationMinutes: 60,
    passingScorePercent: 70,
    xpReward: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  coursesById.set(seedCourse.id, seedCourse);
  coursesBySlug.set(seedCourse.slug, seedCourse);

  const seedModule1: CourseModule = {
    id: seedModule1Id,
    courseId: seedCourseId,
    title: 'Module 1: Domain-Driven Foundations',
    description: 'Pure domain business rules and entity invariants',
    orderIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const seedModule2: CourseModule = {
    id: seedModule2Id,
    courseId: seedCourseId,
    title: 'Module 2: Fastify & Async Processing',
    description: 'High performance API endpoints and durable worker queues',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  courseModulesById.set(seedModule1.id, seedModule1);
  courseModulesById.set(seedModule2.id, seedModule2);

  const seedLesson1: Lesson = {
    id: seedLesson1Id,
    moduleId: seedModule1Id,
    title: 'Domain Entities and Pure Functions',
    contentType: 'text',
    contentBody: 'Writing testable, framework-independent business rules.',
    durationMinutes: 15,
    orderIndex: 0,
    isFreePreview: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const seedLesson2: Lesson = {
    id: seedLesson2Id,
    moduleId: seedModule1Id,
    title: 'Error Envelopes & Canonical Schemas',
    contentType: 'text',
    contentBody: 'Zod schemas and RFC-compliant error structures.',
    durationMinutes: 20,
    orderIndex: 1,
    prerequisiteLessonId: seedLesson1Id,
    isFreePreview: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const seedLesson3: Lesson = {
    id: seedLesson3Id,
    moduleId: seedModule2Id,
    title: 'Fastify Server Hooks and Rate Limiting',
    contentType: 'video',
    contentBody: 'Building hardened Fastify plugins.',
    durationMinutes: 25,
    orderIndex: 0,
    isFreePreview: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  lessonsById.set(seedLesson1.id, seedLesson1);
  lessonsById.set(seedLesson2.id, seedLesson2);
  lessonsById.set(seedLesson3.id, seedLesson3);

  // LMS Endpoints (F-07)
  app.get('/api/v1/courses', async (req: FastifyRequest<{ Querystring: { search?: string; level?: string } }>) => {
    const { search, level } = req.query;
    let list = Array.from(coursesById.values()).filter((c) => c.status === 'published');

    if (level) {
      list = list.filter((c) => c.level === level);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    const coursesWithSummary = list.map((c) => {
      const modules = Array.from(courseModulesById.values()).filter((m) => m.courseId === c.id);
      const moduleIds = new Set(modules.map((m) => m.id));
      const lessons = Array.from(lessonsById.values()).filter((l) => moduleIds.has(l.moduleId));
      return {
        ...c,
        moduleCount: modules.length,
        lessonCount: lessons.length,
        skillIds: courseSkillsByCourseId.get(c.id) || [],
      };
    });

    return { courses: coursesWithSummary };
  });

  app.post('/api/v1/courses', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found. Please create a profile first.');
    }

    const input = CreateCourseInputSchema.parse(req.body);
    if (coursesBySlug.has(input.slug)) {
      throw new DomainError('CONFLICT', `Course with slug "${input.slug}" already exists.`);
    }

    const now = new Date().toISOString();
    const course: Course = {
      id: crypto.randomUUID(),
      instructorId: profile.id,
      title: input.title,
      slug: input.slug,
      description: input.description,
      status: 'draft',
      level: input.level,
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      passingScorePercent: input.passingScorePercent,
      xpReward: input.xpReward,
      createdAt: now,
      updatedAt: now,
    };

    coursesById.set(course.id, course);
    coursesBySlug.set(course.slug, course);

    if (input.skillIds && input.skillIds.length > 0) {
      courseSkillsByCourseId.set(course.id, input.skillIds);
    }

    return reply.status(201).send({ course });
  });

  app.get('/api/v1/courses/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const course = coursesById.get(id) || coursesBySlug.get(id);
    if (!course) {
      throw new DomainError('NOT_FOUND', `Course with ID or slug "${id}" not found.`);
    }

    const modules = Array.from(courseModulesById.values())
      .filter((m) => m.courseId === course.id)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const modulesWithLessons = modules.map((m) => {
      const lessons = Array.from(lessonsById.values())
        .filter((l) => l.moduleId === m.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      return {
        ...m,
        lessons,
      };
    });

    return reply.status(200).send({
      course: {
        ...course,
        modules: modulesWithLessons,
        skillIds: courseSkillsByCourseId.get(course.id) || [],
      },
    });
  });

  app.post('/api/v1/courses/:id/modules', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const course = coursesById.get(id);
    if (!course) {
      throw new DomainError('NOT_FOUND', `Course with ID "${id}" not found.`);
    }

    const profile = profilesByUserId.get(session.userId);
    if (course.instructorId !== profile?.id && !session.roles.includes('platform_admin' as any)) {
      throw new DomainError('FORBIDDEN', 'Only the course instructor or platform admin can add modules.');
    }

    const input = CreateCourseModuleInputSchema.parse(req.body);
    const existing = Array.from(courseModulesById.values()).find(
      (m) => m.courseId === course.id && m.orderIndex === input.orderIndex
    );
    if (existing) {
      throw new DomainError('CONFLICT', `Module with orderIndex ${input.orderIndex} already exists in this course.`);
    }

    const now = new Date().toISOString();
    const module: CourseModule = {
      id: crypto.randomUUID(),
      courseId: course.id,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex,
      createdAt: now,
      updatedAt: now,
    };

    courseModulesById.set(module.id, module);
    return reply.status(201).send({ module });
  });

  app.post('/api/v1/modules/:id/lessons', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const module = courseModulesById.get(id);
    if (!module) {
      throw new DomainError('NOT_FOUND', `Module with ID "${id}" not found.`);
    }

    const course = coursesById.get(module.courseId);
    const profile = profilesByUserId.get(session.userId);
    if (course?.instructorId !== profile?.id && !session.roles.includes('platform_admin' as any)) {
      throw new DomainError('FORBIDDEN', 'Only the course instructor or platform admin can add lessons.');
    }

    const input = CreateLessonInputSchema.parse(req.body);
    if (input.prerequisiteLessonId && !lessonsById.has(input.prerequisiteLessonId)) {
      throw new DomainError('NOT_FOUND', `Prerequisite lesson with ID "${input.prerequisiteLessonId}" not found.`);
    }

    const existing = Array.from(lessonsById.values()).find(
      (l) => l.moduleId === module.id && l.orderIndex === input.orderIndex
    );
    if (existing) {
      throw new DomainError('CONFLICT', `Lesson with orderIndex ${input.orderIndex} already exists in this module.`);
    }

    const now = new Date().toISOString();
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      moduleId: module.id,
      title: input.title,
      contentType: input.contentType,
      contentBody: input.contentBody,
      durationMinutes: input.durationMinutes,
      orderIndex: input.orderIndex,
      prerequisiteLessonId: input.prerequisiteLessonId || null,
      isFreePreview: input.isFreePreview,
      createdAt: now,
      updatedAt: now,
    };

    lessonsById.set(lesson.id, lesson);
    return reply.status(201).send({ lesson });
  });

  app.post('/api/v1/courses/:id/publish', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const course = coursesById.get(id);
    if (!course) {
      throw new DomainError('NOT_FOUND', `Course with ID "${id}" not found.`);
    }

    const profile = profilesByUserId.get(session.userId);
    if (course.instructorId !== profile?.id && !session.roles.includes('platform_admin' as any)) {
      throw new DomainError('FORBIDDEN', 'Only the course instructor or platform admin can publish this course.');
    }

    const modules = Array.from(courseModulesById.values()).filter((m) => m.courseId === course.id);
    const moduleIds = new Set(modules.map((m) => m.id));
    const lessons = Array.from(lessonsById.values()).filter((l) => moduleIds.has(l.moduleId));

    const readiness = validateCoursePublishReadiness(course, modules, lessons);
    if (!readiness.valid) {
      throw new DomainError('VALIDATION_FAILED', `Course publish requirements not met: ${readiness.errors.join('; ')}`);
    }

    course.status = 'published';
    course.updatedAt = new Date().toISOString();

    return reply.status(200).send({
      message: 'Course published successfully',
      course,
    });
  });

  app.post('/api/v1/courses/:id/enroll', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const course = coursesById.get(id);
    if (!course) {
      throw new DomainError('NOT_FOUND', `Course with ID "${id}" not found.`);
    }

    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found. Please create a profile first.');
    }

    const existingEnrollments = Array.from(enrollmentsById.values());
    const enrollment = enrollUserInCourse(existingEnrollments, profile.id, course);

    enrollmentsById.set(enrollment.id, enrollment);
    enrollmentsByUserAndCourse.set(`${profile.id}:${course.id}`, enrollment);

    return reply.status(201).send({
      message: 'Enrolled successfully',
      enrollment,
    });
  });

  app.get('/api/v1/courses/:id/progress', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const course = coursesById.get(id);
    if (!course) {
      throw new DomainError('NOT_FOUND', `Course with ID "${id}" not found.`);
    }

    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const enrollment = enrollmentsByUserAndCourse.get(`${profile.id}:${course.id}`);
    if (!enrollment) {
      return reply.status(200).send({ enrolled: false });
    }

    const completedProgress = Array.from(lessonProgressByEnrollmentAndLesson.values()).filter(
      (p) => p.enrollmentId === enrollment.id && p.status === 'completed'
    );
    const completedLessonIds = completedProgress.map((p) => p.lessonId);
    const certificate = certificatesByEnrollmentId.get(enrollment.id);

    return reply.status(200).send({
      enrolled: true,
      enrollment,
      completedLessonIds,
      certificate,
    });
  });

  app.post('/api/v1/lessons/:id/complete', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const lesson = lessonsById.get(id);
    if (!lesson) {
      throw new DomainError('NOT_FOUND', `Lesson with ID "${id}" not found.`);
    }

    const module = courseModulesById.get(lesson.moduleId);
    if (!module) {
      throw new DomainError('NOT_FOUND', 'Module for lesson not found.');
    }

    const course = coursesById.get(module.courseId);
    if (!course) {
      throw new DomainError('NOT_FOUND', 'Course for lesson not found.');
    }

    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const enrollment = enrollmentsByUserAndCourse.get(`${profile.id}:${course.id}`);
    if (!enrollment || enrollment.status === 'dropped' || enrollment.status === 'expired') {
      throw new DomainError('FORBIDDEN', 'You must be actively enrolled in the course to complete lessons.');
    }

    const progressKey = `${enrollment.id}:${lesson.id}`;
    // BR-21: Idempotent lesson completion
    if (lessonProgressByEnrollmentAndLesson.has(progressKey)) {
      return reply.status(200).send({
        message: 'Lesson already completed',
        progressPercent: enrollment.progressPercent,
        alreadyCompleted: true,
      });
    }

    // Retrieve all modules and lessons for this course to evaluate prerequisites and sequential modules
    const courseModules = Array.from(courseModulesById.values()).filter((m) => m.courseId === course.id);
    const courseModuleIds = new Set(courseModules.map((m) => m.id));
    const courseLessons = Array.from(lessonsById.values()).filter((l) => courseModuleIds.has(l.moduleId));

    const completedProgressList = Array.from(lessonProgressByEnrollmentAndLesson.values()).filter(
      (p) => p.enrollmentId === enrollment.id && p.status === 'completed'
    );
    const completedLessonIds = new Set<string>(completedProgressList.map((p) => p.lessonId));

    // BR-47: Sequential module progress
    verifySequentialModuleProgress(courseModules, courseLessons, completedLessonIds, lesson);

    // BR-22: Direct prerequisite check
    verifyLessonPrerequisites(lesson, completedLessonIds);

    // Record lesson progress
    const now = new Date().toISOString();
    const progress: LessonProgress = {
      id: crypto.randomUUID(),
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      status: 'completed',
      completedAt: now,
    };
    lessonProgressByEnrollmentAndLesson.set(progressKey, progress);
    completedLessonIds.add(lesson.id);

    // Calculate new progress percentage
    const newProgressPercent = calculateCourseProgress(courseLessons.length, completedLessonIds.size);
    enrollment.progressPercent = newProgressPercent;
    enrollment.updatedAt = now;

    let certificate: CourseCertificate | undefined;
    let awardedXp = 0;

    // Check course completion (BR-23, BR-48)
    const isCompleted = completedLessonIds.size === courseLessons.length;
    if (isCompleted && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = now;

      // Auto-mint verified Evidence in the Talent Graph (BR-23)
      const evidence = createEvidence({
        subjectId: profile.id,
        type: 'course_completion',
        title: `Course Certificate: ${course.title}`,
        description: `Successfully completed all modules and lessons in "${course.title}".`,
        source: 'TalentSphere LMS',
        provenance: `course:${course.id}`,
        recencyDate: now.split('T')[0],
      });
      // Authority level for platform LMS completion
      evidence.status = 'verified';
      evidence.verificationLevel = 'authority_verified';

      evidenceById.set(evidence.id, evidence);
      const evList = evidenceBySubjectId.get(profile.id) || [];
      evList.push(evidence);
      evidenceBySubjectId.set(profile.id, evList);

      enqueuedWorkerJobs.push({
        type: 'evidence.propagate',
        payload: {
          evidenceId: evidence.id,
          status: evidence.status,
          level: evidence.verificationLevel,
        },
        enqueuedAt: now,
      });

      // Mint zero-PII certificate (BR-150)
      certificate = mintCourseCertificate(enrollment.id, profile.id, course, evidence.id);
      certificatesByNumber.set(certificate.certificateNumber, certificate);
      certificatesByEnrollmentId.set(enrollment.id, certificate);

      // Award XP bonus capped by 200 XP/day (BR-25)
      const userTxs = xpTransactionsByUserId.get(session.userId) || [];
      awardedXp = calculateCappedXp(course.xpReward, userTxs, 200);

      if (awardedXp > 0) {
        const tx: XpTransaction = {
          id: crypto.randomUUID(),
          userId: session.userId,
          amount: awardedXp,
          referenceType: 'course',
          referenceId: course.id,
          description: `Completed course "${course.title}"`,
          createdAt: now,
        };
        userTxs.push(tx);
        xpTransactionsByUserId.set(session.userId, userTxs);
      }

      enqueuedWorkerJobs.push({
        type: 'lms.course.completed',
        payload: {
          courseId: course.id,
          userId: profile.id,
          certificateNumber: certificate.certificateNumber,
        },
        enqueuedAt: now,
      });
    }

    return reply.status(200).send({
      progress: enrollment.progressPercent,
      completed: enrollment.status === 'completed',
      certificate,
      xpAwarded: awardedXp,
    });
  });

  // Public Certificate Verification Endpoint (Zero-PII verification BR-150, BR-155)
  app.get('/api/v1/certificates/:certificateNumber', async (req: FastifyRequest<{ Params: { certificateNumber: string } }>, reply: FastifyReply) => {
    const { certificateNumber } = req.params;
    const cert = certificatesByNumber.get(certificateNumber);
    if (!cert) {
      throw new DomainError('NOT_FOUND', `Certificate "${certificateNumber}" not found.`);
    }

    const course = coursesById.get(cert.courseId);

    return reply.status(200).send({
      certificateNumber: cert.certificateNumber,
      courseTitle: course?.title || 'Unknown Course',
      status: cert.status,
      issuedAt: cert.issuedAt,
      verificationProofHash: cert.verificationProofHash,
      isValid: cert.status === 'verified',
    });
  });

  // Direct Messaging Repositories (F-10, WF-10, BR-214)
  const threadsById = new Map<string, MessageThread>();
  const threadParticipantsByThreadId = new Map<string, ThreadParticipant[]>();
  const messagesById = new Map<string, Message>();
  const messagesByThreadId = new Map<string, Message[]>();
  const messagesByClientMessageId = new Map<string, Message>(); // key: `${threadId}:${clientMessageId}`

  // Messaging Endpoints (F-10)
  app.get('/api/v1/threads', async (req: FastifyRequest) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    // Find all threads where the profile is a participant
    const userThreads: any[] = [];
    for (const [threadId, participants] of threadParticipantsByThreadId.entries()) {
      const currentParticipant = participants.find((p) => p.userId === profile.id);
      if (currentParticipant) {
        const thread = threadsById.get(threadId);
        if (thread) {
          const msgs = messagesByThreadId.get(threadId) || [];
          const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          const unreadCount = calculateUnreadCount(msgs, currentParticipant);
          userThreads.push({
            ...thread,
            participants,
            lastMessage,
            unreadCount,
          });
        }
      }
    }

    userThreads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return { threads: userThreads };
  });

  app.post('/api/v1/threads', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found. Please create a profile first.');
    }

    const input = CreateThreadInputSchema.parse(req.body);
    const recipientProfile = profilesById.get(input.recipientId);
    if (!recipientProfile) {
      throw new DomainError('NOT_FOUND', 'Recipient profile not found.');
    }

    const { thread, participants } = createThreadEntities(profile.id, [input.recipientId], input.subject);
    threadsById.set(thread.id, thread);
    threadParticipantsByThreadId.set(thread.id, participants);
    messagesByThreadId.set(thread.id, []);

    let initialMessage: Message | undefined;
    if (input.initialMessage) {
      initialMessage = createMessageEntity(thread.id, profile.id, input.initialMessage, input.clientMessageId);
      messagesById.set(initialMessage.id, initialMessage);
      messagesByThreadId.set(thread.id, [initialMessage]);
      if (input.clientMessageId) {
        messagesByClientMessageId.set(`${thread.id}:${input.clientMessageId}`, initialMessage);
      }
      thread.lastMessageAt = initialMessage.createdAt;

      enqueuedWorkerJobs.push({
        type: 'messaging.message.sent',
        payload: {
          threadId: thread.id,
          messageId: initialMessage.id,
          senderId: profile.id,
          recipientIds: [input.recipientId],
        },
        enqueuedAt: initialMessage.createdAt,
      });

      sendNotification({
        recipientId: input.recipientId,
        type: 'message',
        title: `New message from ${profile.fullName}`,
        body: initialMessage.content.slice(0, 100),
        referenceType: 'thread',
        referenceId: thread.id,
      });
    }

    return reply.status(201).send({
      thread,
      participants,
      message: initialMessage,
    });
  });

  app.get('/api/v1/threads/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const { id } = req.params;
    const thread = threadsById.get(id);
    if (!thread) {
      throw new DomainError('NOT_FOUND', `Thread with ID "${id}" not found.`);
    }

    const participants = threadParticipantsByThreadId.get(id) || [];
    const currentParticipant = assertThreadParticipant(participants, profile.id);

    // Automatically mark read up to now
    currentParticipant.lastReadAt = new Date().toISOString();

    const messages = messagesByThreadId.get(id) || [];
    return reply.status(200).send({
      thread,
      participants,
      messages,
    });
  });

  app.post('/api/v1/threads/:id/messages', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const { id } = req.params;
    const thread = threadsById.get(id);
    if (!thread) {
      throw new DomainError('NOT_FOUND', `Thread with ID "${id}" not found.`);
    }

    const participants = threadParticipantsByThreadId.get(id) || [];
    const currentParticipant = assertThreadParticipant(participants, profile.id);

    const input = SendMessageInputSchema.parse(req.body);

    // ClientMessageId Deduplication (WF-10, WIT-010)
    if (input.clientMessageId) {
      const dedupeKey = `${thread.id}:${input.clientMessageId}`;
      const existing = messagesByClientMessageId.get(dedupeKey);
      if (existing) {
        return reply.status(200).send({
          message: existing,
          deduplicated: true,
        });
      }
    }

    const message = createMessageEntity(thread.id, profile.id, input.content, input.clientMessageId);
    messagesById.set(message.id, message);

    const threadMsgs = messagesByThreadId.get(thread.id) || [];
    threadMsgs.push(message);
    messagesByThreadId.set(thread.id, threadMsgs);

    if (input.clientMessageId) {
      messagesByClientMessageId.set(`${thread.id}:${input.clientMessageId}`, message);
    }

    thread.lastMessageAt = message.createdAt;
    thread.updatedAt = message.createdAt;
    currentParticipant.lastReadAt = message.createdAt;

    const recipientIds = participants.filter((p) => p.userId !== profile.id).map((p) => p.userId);
    enqueuedWorkerJobs.push({
      type: 'messaging.message.sent',
      payload: {
        threadId: thread.id,
        messageId: message.id,
        senderId: profile.id,
        recipientIds,
      },
      enqueuedAt: message.createdAt,
    });

    for (const recipientId of recipientIds) {
      sendNotification({
        recipientId,
        type: 'message',
        title: `New message from ${profile.fullName}`,
        body: message.content.slice(0, 100),
        referenceType: 'thread',
        referenceId: thread.id,
      });
    }

    return reply.status(201).send({ message });
  });

  app.post('/api/v1/threads/:id/read', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const { id } = req.params;
    const thread = threadsById.get(id);
    if (!thread) {
      throw new DomainError('NOT_FOUND', `Thread with ID "${id}" not found.`);
    }

    const participants = threadParticipantsByThreadId.get(id) || [];
    const currentParticipant = assertThreadParticipant(participants, profile.id);
    currentParticipant.lastReadAt = new Date().toISOString();

    return reply.status(200).send({
      message: 'Thread marked as read',
      lastReadAt: currentParticipant.lastReadAt,
    });
  });

  // Notification Center Endpoints (F-14, BR-120)
  app.get('/api/v1/notifications', async (req: FastifyRequest<{ Querystring: { unreadOnly?: string; type?: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const userNotifs = notificationsByRecipientId.get(profile.id) || [];
    const unreadCount = userNotifs.filter((n) => !n.isRead).length;

    let filtered = [...userNotifs];
    if (req.query.unreadOnly === 'true') {
      filtered = filtered.filter((n) => !n.isRead);
    }
    if (req.query.type) {
      filtered = filtered.filter((n) => n.type === req.query.type);
    }

    return reply.status(200).send({
      notifications: filtered,
      unreadCount,
    });
  });

  app.post('/api/v1/notifications/mark-read', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const input = MarkNotificationsReadInputSchema.parse(req.body || {});
    const userNotifs = notificationsByRecipientId.get(profile.id) || [];
    const targetIds = input.all ? undefined : input.notificationIds;

    const markedCount = markNotificationsAsRead(userNotifs, targetIds);
    const remainingUnread = userNotifs.filter((n) => !n.isRead).length;

    return reply.status(200).send({
      markedCount,
      unreadCount: remainingUnread,
    });
  });

  app.get('/api/v1/notifications/preferences', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    let prefs = notificationPreferencesByUserId.get(profile.id);
    if (!prefs) {
      prefs = createDefaultNotificationPreferences(profile.id);
      notificationPreferencesByUserId.set(profile.id, prefs);
    }

    return reply.status(200).send({ preferences: prefs });
  });

  app.patch('/api/v1/notifications/preferences', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const input = UpdateNotificationPreferencesInputSchema.parse(req.body);
    let prefs = notificationPreferencesByUserId.get(profile.id);
    if (!prefs) {
      prefs = createDefaultNotificationPreferences(profile.id);
      notificationPreferencesByUserId.set(profile.id, prefs);
    }

    if (input.allowMessages !== undefined) prefs.allowMessages = input.allowMessages;
    if (input.allowMentions !== undefined) prefs.allowMentions = input.allowMentions;
    if (input.allowApplications !== undefined) prefs.allowApplications = input.allowApplications;
    if (input.allowCourseUpdates !== undefined) prefs.allowCourseUpdates = input.allowCourseUpdates;
    if (input.emailDigestFrequency !== undefined) prefs.emailDigestFrequency = input.emailDigestFrequency;
    prefs.updatedAt = new Date().toISOString();

    return reply.status(200).send({
      message: 'Preferences updated successfully',
      preferences: prefs,
    });
  });

  // Central AI Gateway & Career Assistant Repositories (F-11, SSOT Section 16)
  const aiConversationsById = new Map<string, AIConversation>();
  const aiConversationsByUserId = new Map<string, AIConversation[]>();
  const aiMessagesByConversationId = new Map<string, AIMessage[]>();
  const aiUsageMetersByUserAndDate = new Map<string, AIUsageMeter>();

  const getOrCreateAIUsageMeter = (userId: string, tier: AITier = 'free'): AIUsageMeter => {
    const periodDate = new Date().toISOString().slice(0, 10);
    const key = `${userId}:${periodDate}`;
    let meter = aiUsageMetersByUserAndDate.get(key);
    if (!meter) {
      meter = {
        id: crypto.randomUUID(),
        userId,
        periodDate,
        tokensConsumed: 0,
        requestsCount: 0,
        tier,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      aiUsageMetersByUserAndDate.set(key, meter);
    }
    return meter;
  };

  // Central AI Gateway Endpoints
  app.post('/api/v1/ai/conversations', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateAIConversationInputSchema.parse(req.body || {});

    const conversation = createAIConversationEntity(session.userId, input.title, input.purpose);
    aiConversationsById.set(conversation.id, conversation);

    const userConvs = aiConversationsByUserId.get(session.userId) || [];
    userConvs.unshift(conversation);
    aiConversationsByUserId.set(session.userId, userConvs);

    return reply.status(201).send({ conversation });
  });

  app.get('/api/v1/ai/conversations', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const conversations = aiConversationsByUserId.get(session.userId) || [];
    return reply.status(200).send({ conversations });
  });

  app.get('/api/v1/ai/conversations/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const conversation = aiConversationsById.get(id);
    if (!conversation) {
      throw new DomainError('NOT_FOUND', `Conversation with ID "${id}" not found.`);
    }

    if (conversation.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to conversation.');
    }

    const messages = aiMessagesByConversationId.get(id) || [];
    return reply.status(200).send({ conversation, messages });
  });

  app.post('/api/v1/ai/career-assistant/chat', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);

    // 1. Mandatory server-side assessment session AI prohibition (SSOT Section D, TRD Section 7)
    if (profile) {
      const activeSessions = (assessmentSessionsByCandidateId.get(profile.id) || []).filter(
        (s) => s.status === 'in_progress'
      );
      assertAIAssistanceAllowed(activeSessions);
    }

    const input = AIChatInputSchema.parse(req.body);

    // 2. Context Firewall & Prompt Injection Defense (WIT-007, APP_FLOW.md)
    const { sanitized } = sanitizePromptInput(input.prompt);

    // 3. Entitlement Quota Check (SSOT Section 16.4: Free-User Cost Invariant)
    const userTier: AITier = 'free'; // default free tier, strictly metered
    const meter = getOrCreateAIUsageMeter(session.userId, userTier);
    const requestedTokens = estimateTokens(input.prompt);
    assertWithinAIQuota(meter, requestedTokens, userTier);

    // 4. Conversation Management
    let conversation: AIConversation;
    if (input.conversationId) {
      const existing = aiConversationsById.get(input.conversationId);
      if (!existing) {
        throw new DomainError('NOT_FOUND', `Conversation with ID "${input.conversationId}" not found.`);
      }
      if (existing.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to conversation.');
      }
      conversation = existing;
    } else {
      conversation = createAIConversationEntity(session.userId, input.prompt.slice(0, 30));
      aiConversationsById.set(conversation.id, conversation);
      const userConvs = aiConversationsByUserId.get(session.userId) || [];
      userConvs.unshift(conversation);
      aiConversationsByUserId.set(session.userId, userConvs);
    }

    // 5. Store user message
    const userMsg: AIMessage = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      senderRole: 'user',
      content: input.prompt,
      sanitizedContent: sanitized,
      tokensUsed: requestedTokens,
      model: 'talentsphere-career-v1',
      createdAt: new Date().toISOString(),
    };

    const convMessages = aiMessagesByConversationId.get(conversation.id) || [];
    convMessages.push(userMsg);

    // 6. Generate AI response with advisory provenance
    const aiResult = generateCareerAssistantResponse({
      conversationId: conversation.id,
      prompt: input.prompt,
    });

    convMessages.push(aiResult.message);
    aiMessagesByConversationId.set(conversation.id, convMessages);
    conversation.updatedAt = new Date().toISOString();

    // 7. Update usage meter
    meter.tokensConsumed += aiResult.provenance.tokensUsed;
    meter.requestsCount += 1;
    meter.updatedAt = new Date().toISOString();

    // 8. Enqueue async worker job for interaction telemetry
    enqueuedWorkerJobs.push({
      type: 'ai.interaction.logged',
      payload: {
        userId: session.userId,
        conversationId: conversation.id,
        tokensUsed: aiResult.provenance.tokensUsed,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      conversationId: conversation.id,
      message: aiResult.message,
      provenance: aiResult.provenance,
    });
  });

  app.get('/api/v1/ai/usage', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const meter = getOrCreateAIUsageMeter(session.userId, 'free');
    return reply.status(200).send({
      usage: meter,
      limits: AI_QUOTA_LIMITS[meter.tier],
    });
  });

  // Resume Builder Repositories & Endpoints (F-13, BR-26)
  const resumesById = new Map<string, Resume>();
  const resumesByUserId = new Map<string, Resume[]>();
  const resumeExportsById = new Map<string, ResumeExport>();
  const resumeExportsByResumeId = new Map<string, ResumeExport[]>();

  app.post('/api/v1/resumes', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateResumeInputSchema.parse(req.body || {});

    const resume = createResumeEntity(session.userId, input);
    resumesById.set(resume.id, resume);

    const userResumes = resumesByUserId.get(session.userId) || [];
    userResumes.unshift(resume);
    resumesByUserId.set(session.userId, userResumes);

    return reply.status(201).send({ resume });
  });

  app.get('/api/v1/resumes', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userResumes = resumesByUserId.get(session.userId) || [];
    return reply.status(200).send({ resumes: userResumes });
  });

  app.get('/api/v1/resumes/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const resume = resumesById.get(id);
    if (!resume) {
      throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
    }

    if (resume.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to resume.');
    }

    return reply.status(200).send({ resume });
  });

  app.patch('/api/v1/resumes/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const resume = resumesById.get(id);
    if (!resume) {
      throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
    }

    if (resume.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to resume.');
    }

    const input = UpdateResumeInputSchema.parse(req.body || {});
    const updated = updateResumeEntity(resume, input);
    resumesById.set(updated.id, updated);

    // Update in user list
    const userResumes = resumesByUserId.get(session.userId) || [];
    const idx = userResumes.findIndex((r) => r.id === updated.id);
    if (idx !== -1) {
      userResumes[idx] = updated;
      resumesByUserId.set(session.userId, userResumes);
    }

    return reply.status(200).send({ resume: updated });
  });

  app.post('/api/v1/resumes/:id/export', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const resume = resumesById.get(id);
    if (!resume) {
      throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
    }

    if (resume.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to resume.');
    }

    const input = ExportResumeInputSchema.parse(req.body || {});
    const profile = profilesByUserId.get(session.userId);

    const exportItem = createResumeExport(resume, input.format, profile?.fullName);
    resumeExportsById.set(exportItem.id, exportItem);

    const resumeExports = resumeExportsByResumeId.get(resume.id) || [];
    resumeExports.unshift(exportItem);
    resumeExportsByResumeId.set(resume.id, resumeExports);

    enqueuedWorkerJobs.push({
      type: 'resume.exported',
      payload: {
        userId: session.userId,
        resumeId: resume.id,
        exportId: exportItem.id,
        format: exportItem.format,
        sha256Hash: exportItem.sha256Hash,
      },
      enqueuedAt: exportItem.createdAt,
    });

    return reply.status(201).send({ export: exportItem });
  });

  app.get('/api/v1/resumes/:id/exports', async (req: FastifyRequest<{ Params: { id: string }; Querystring: { includeDeleted?: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const resume = resumesById.get(id);
    if (!resume) {
      throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
    }

    if (resume.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to resume.');
    }

    const allExports = resumeExportsByResumeId.get(id) || [];
    const filtered = req.query.includeDeleted === 'true'
      ? allExports
      : allExports.filter((e) => e.status !== 'deleted');

    return reply.status(200).send({ exports: filtered });
  });

  app.delete('/api/v1/resumes/exports/:exportId', async (req: FastifyRequest<{ Params: { exportId: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { exportId } = req.params;

    const exportItem = resumeExportsById.get(exportId);
    if (!exportItem) {
      throw new DomainError('NOT_FOUND', `Resume export with ID "${exportId}" not found.`);
    }

    if (exportItem.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to resume export.');
    }

    const softDeleted = softDeleteResumeExport(exportItem);
    resumeExportsById.set(softDeleted.id, softDeleted);

    // Update in list
    const resumeExports = resumeExportsByResumeId.get(softDeleted.resumeId) || [];
    const idx = resumeExports.findIndex((e) => e.id === softDeleted.id);
    if (idx !== -1) {
      resumeExports[idx] = softDeleted;
      resumeExportsByResumeId.set(softDeleted.resumeId, resumeExports);
    }

    return reply.status(200).send({
      message: 'Resume export soft-deleted (BR-26)',
      export: softDeleted,
    });
  });

  // Professional Networking Repositories & Endpoints (F-09)
  const connectionsById = new Map<string, Connection>();
  const connectionsByUserId = new Map<string, Connection[]>();

  app.post('/api/v1/connections/request', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = RequestConnectionInputSchema.parse(req.body || {});

    let targetUserId = input.recipientId;
    const targetProfile = profilesById.get(input.recipientId);
    if (targetProfile) {
      targetUserId = targetProfile.userId;
    }

    if (!usersById.has(targetUserId) && !profilesByUserId.has(targetUserId)) {
      throw new DomainError('NOT_FOUND', 'Recipient user not found.');
    }

    const userConnections = connectionsByUserId.get(session.userId) || [];
    const connection = requestConnection(
      {
        senderId: session.userId,
        recipientId: targetUserId,
        note: input.note,
      },
      userConnections
    );

    connectionsById.set(connection.id, connection);

    // Save for sender
    userConnections.unshift(connection);
    connectionsByUserId.set(session.userId, userConnections);

    // Save for recipient
    const recipientConnections = connectionsByUserId.get(targetUserId) || [];
    recipientConnections.unshift(connection);
    connectionsByUserId.set(targetUserId, recipientConnections);

    // Trigger notification to recipient
    const senderProfile = profilesByUserId.get(session.userId);
    const senderName = senderProfile?.fullName || 'A professional';
    const notifRecipientProfile = profilesByUserId.get(targetUserId);
    const notifRecipientId = notifRecipientProfile?.id || targetUserId;

    sendNotification({
      recipientId: notifRecipientId,
      type: 'connection_request',
      title: 'New Connection Request',
      body: `${senderName} wants to connect with you.`,
      referenceType: 'connection',
      referenceId: connection.id,
    });

    // Enqueue async worker job
    enqueuedWorkerJobs.push({
      type: 'connection.requested',
      payload: {
        connectionId: connection.id,
        senderId: session.userId,
        recipientId: targetUserId,
      },
      enqueuedAt: connection.createdAt,
    });

    return reply.status(201).send({ connection });
  });

  app.get('/api/v1/connections', async (req: FastifyRequest<{ Querystring: { status?: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const userConnections = connectionsByUserId.get(session.userId) || [];
    const filter = req.query.status || 'accepted';

    let filtered = userConnections;
    if (filter === 'accepted') {
      filtered = userConnections.filter((c) => c.status === 'accepted');
    } else if (filter === 'pending') {
      filtered = userConnections.filter((c) => c.status === 'pending');
    } else if (filter === 'pending_sent') {
      filtered = userConnections.filter((c) => c.status === 'pending' && c.senderId === session.userId);
    } else if (filter === 'pending_received') {
      filtered = userConnections.filter((c) => c.status === 'pending' && c.recipientId === session.userId);
    } else if (filter === 'rejected') {
      filtered = userConnections.filter((c) => c.status === 'rejected');
    } else if (filter === 'withdrawn') {
      filtered = userConnections.filter((c) => c.status === 'withdrawn');
    } else if (filter === 'all') {
      filtered = userConnections;
    }

    return reply.status(200).send({ connections: filtered });
  });

  app.get('/api/v1/connections/status/:targetUserId', async (req: FastifyRequest<{ Params: { targetUserId: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    let { targetUserId } = req.params;

    const targetProfile = profilesById.get(targetUserId);
    if (targetProfile) {
      targetUserId = targetProfile.userId;
    }

    const userConnections = connectionsByUserId.get(session.userId) || [];
    const conn = getConnectionBetween(userConnections, session.userId, targetUserId);

    return reply.status(200).send({
      status: conn ? conn.status : 'none',
      connection: conn || null,
      isConnected: conn?.status === 'accepted',
    });
  });

  app.post('/api/v1/connections/:id/respond', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const conn = connectionsById.get(id);
    if (!conn) {
      throw new DomainError('NOT_FOUND', `Connection request with ID "${id}" not found.`);
    }

    const input = RespondConnectionInputSchema.parse(req.body || {});
    let updated: Connection;

    if (input.action === 'accept') {
      updated = acceptConnection(conn, session.userId);

      const recipientProfile = profilesByUserId.get(session.userId);
      const recipientName = recipientProfile?.fullName || 'A professional';
      const senderProfile = profilesByUserId.get(conn.senderId);
      const notifRecipientId = senderProfile?.id || conn.senderId;

      sendNotification({
        recipientId: notifRecipientId,
        type: 'connection_accepted',
        title: 'Connection Request Accepted',
        body: `${recipientName} accepted your connection request.`,
        referenceType: 'connection',
        referenceId: conn.id,
      });

      enqueuedWorkerJobs.push({
        type: 'connection.accepted',
        payload: {
          connectionId: conn.id,
          senderId: conn.senderId,
          recipientId: conn.recipientId,
        },
        enqueuedAt: updated.acceptedAt,
      });
    } else {
      updated = rejectConnection(conn, session.userId);

      enqueuedWorkerJobs.push({
        type: 'connection.rejected',
        payload: {
          connectionId: conn.id,
          senderId: conn.senderId,
          recipientId: conn.recipientId,
        },
        enqueuedAt: updated.updatedAt,
      });
    }

    connectionsById.set(updated.id, updated);

    const senderList = connectionsByUserId.get(updated.senderId) || [];
    const sIdx = senderList.findIndex((c) => c.id === updated.id);
    if (sIdx !== -1) senderList[sIdx] = updated;

    const recipientList = connectionsByUserId.get(updated.recipientId) || [];
    const rIdx = recipientList.findIndex((c) => c.id === updated.id);
    if (rIdx !== -1) recipientList[rIdx] = updated;

    return reply.status(200).send({ connection: updated });
  });

  app.post('/api/v1/connections/:id/withdraw', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const conn = connectionsById.get(id);
    if (!conn) {
      throw new DomainError('NOT_FOUND', `Connection request with ID "${id}" not found.`);
    }

    const updated = withdrawConnection(conn, session.userId);
    connectionsById.set(updated.id, updated);

    const senderList = connectionsByUserId.get(updated.senderId) || [];
    const sIdx = senderList.findIndex((c) => c.id === updated.id);
    if (sIdx !== -1) senderList[sIdx] = updated;

    const recipientList = connectionsByUserId.get(updated.recipientId) || [];
    const rIdx = recipientList.findIndex((c) => c.id === updated.id);
    if (rIdx !== -1) recipientList[rIdx] = updated;

    enqueuedWorkerJobs.push({
      type: 'connection.withdrawn',
      payload: {
        connectionId: conn.id,
        senderId: conn.senderId,
        recipientId: conn.recipientId,
      },
      enqueuedAt: updated.updatedAt,
    });

    return reply.status(200).send({ connection: updated });
  });

  app.delete('/api/v1/connections/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const conn = connectionsById.get(id);
    if (!conn) {
      throw new DomainError('NOT_FOUND', `Connection with ID "${id}" not found.`);
    }

    if (conn.senderId !== session.userId && conn.recipientId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to connection.');
    }

    connectionsById.delete(id);

    const senderList = connectionsByUserId.get(conn.senderId) || [];
    connectionsByUserId.set(conn.senderId, senderList.filter((c) => c.id !== id));

    const recipientList = connectionsByUserId.get(conn.recipientId) || [];
    connectionsByUserId.set(conn.recipientId, recipientList.filter((c) => c.id !== id));

    enqueuedWorkerJobs.push({
      type: 'connection.removed',
      payload: {
        connectionId: conn.id,
        removedBy: session.userId,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Connection removed successfully',
      deletedId: id,
    });
  });

  // Portfolio Showcase Repositories & Endpoints (F-26)
  const portfolioProjectsById = new Map<string, PortfolioProject>();
  const portfolioProjectsByUserId = new Map<string, PortfolioProject[]>();

  app.post('/api/v1/portfolio/projects', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreatePortfolioProjectInputSchema.parse(req.body || {});

    const project = createPortfolioProject(session.userId, input);
    portfolioProjectsById.set(project.id, project);

    const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
    userProjects.push(project);
    portfolioProjectsByUserId.set(session.userId, userProjects);

    enqueuedWorkerJobs.push({
      type: 'portfolio.project.created',
      payload: {
        userId: session.userId,
        projectId: project.id,
        title: project.title,
        visibility: project.visibility,
      },
      enqueuedAt: project.createdAt,
    });

    return reply.status(201).send({ project });
  });

  app.get('/api/v1/portfolio/projects', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
    return reply.status(200).send({ projects: userProjects });
  });

  app.get('/api/v1/portfolio/projects/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const project = portfolioProjectsById.get(id);
    if (!project) {
      throw new DomainError('NOT_FOUND', `Portfolio project with ID "${id}" not found.`);
    }

    let viewerUserId: string | undefined;
    let viewerRoles: Role[] | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const session = verifySessionToken(token);
      if (session) {
        viewerUserId = session.userId;
        viewerRoles = session.roles;
      }
    }

    const userConnections = viewerUserId ? (connectionsByUserId.get(viewerUserId) || []) : [];
    const isConnected = viewerUserId ? areConnected(userConnections, viewerUserId, project.userId) : false;

    if (!canViewPortfolioProject(project, { userId: viewerUserId, roles: viewerRoles, isConnected })) {
      throw new DomainError('FORBIDDEN', 'Access denied to portfolio project.');
    }

    return reply.status(200).send({ project });
  });

  app.patch('/api/v1/portfolio/projects/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const project = portfolioProjectsById.get(id);
    if (!project) {
      throw new DomainError('NOT_FOUND', `Portfolio project with ID "${id}" not found.`);
    }

    if (project.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to portfolio project.');
    }

    const input = UpdatePortfolioProjectInputSchema.parse(req.body || {});
    const updated = updatePortfolioProject(project, input);
    portfolioProjectsById.set(updated.id, updated);

    const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
    const idx = userProjects.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      userProjects[idx] = updated;
      portfolioProjectsByUserId.set(session.userId, userProjects);
    }

    enqueuedWorkerJobs.push({
      type: 'portfolio.project.updated',
      payload: {
        userId: session.userId,
        projectId: updated.id,
      },
      enqueuedAt: updated.updatedAt,
    });

    return reply.status(200).send({ project: updated });
  });

  app.delete('/api/v1/portfolio/projects/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;

    const project = portfolioProjectsById.get(id);
    if (!project) {
      throw new DomainError('NOT_FOUND', `Portfolio project with ID "${id}" not found.`);
    }

    if (project.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to portfolio project.');
    }

    portfolioProjectsById.delete(id);

    const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
    portfolioProjectsByUserId.set(session.userId, userProjects.filter((p) => p.id !== id));

    enqueuedWorkerJobs.push({
      type: 'portfolio.project.removed',
      payload: {
        userId: session.userId,
        projectId: id,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Portfolio project deleted successfully',
      deletedId: id,
    });
  });

  app.get('/api/v1/portfolio/showcase/:targetUserId', async (req: FastifyRequest<{ Params: { targetUserId: string } }>, reply: FastifyReply) => {
    let { targetUserId } = req.params;
    const targetProfile = profilesById.get(targetUserId);
    if (targetProfile) {
      targetUserId = targetProfile.userId;
    }

    let viewerUserId: string | undefined;
    let viewerRoles: Role[] | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const session = verifySessionToken(token);
      if (session) {
        viewerUserId = session.userId;
        viewerRoles = session.roles;
      }
    }

    const userConnections = viewerUserId ? (connectionsByUserId.get(viewerUserId) || []) : [];
    const isConnected = viewerUserId ? areConnected(userConnections, viewerUserId, targetUserId) : false;

    const allProjects = portfolioProjectsByUserId.get(targetUserId) || [];
    const visibleProjects = allProjects.filter((p) =>
      canViewPortfolioProject(p, { userId: viewerUserId, roles: viewerRoles, isConnected })
    );

    visibleProjects.sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      if (a.orderIndex !== b.orderIndex) {
        return a.orderIndex - b.orderIndex;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return reply.status(200).send({
      projects: visibleProjects,
      totalCount: visibleProjects.length,
    });
  });

  // Gamification & XP Ledger Repositories & Endpoints (F-22, F-23, BR-25, WF-11)
  const gamificationProfilesByUserId = new Map<string, GamificationProfile>();
  const badgesById = new Map<string, Badge>();
  const userBadgesByUserId = new Map<string, UserBadge[]>();

  for (const b of DEFAULT_PLATFORM_BADGES) {
    const badge: Badge = {
      ...b,
      id: crypto.randomUUID(),
    };
    badgesById.set(badge.id, badge);
  }

  const getOrCreateGamificationProfile = (userId: string): GamificationProfile => {
    let profile = gamificationProfilesByUserId.get(userId);
    if (!profile) {
      const now = new Date().toISOString();
      const txs = xpTransactionsByUserId.get(userId) || [];
      const totalXp = txs.reduce((sum, t) => sum + t.amount, 0);
      const levelInfo = calculateLevel(totalXp);
      profile = {
        userId,
        totalXp,
        currentLevel: levelInfo.level,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: now,
        updatedAt: now,
      };
      gamificationProfilesByUserId.set(userId, profile);
    }
    return profile;
  };

  app.get('/api/v1/gamification/summary', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = getOrCreateGamificationProfile(session.userId);
    const levelInfo = calculateLevel(profile.totalXp);

    const userTxs = xpTransactionsByUserId.get(session.userId) || [];
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = userTxs.filter((t) => t.createdAt.startsWith(today));
    const todayXp = todayTxs.reduce((sum, t) => sum + t.amount, 0);
    const remainingDailyCap = Math.max(0, DAILY_XP_CAP - todayXp);

    const userBadges = userBadgesByUserId.get(session.userId) || [];

    return reply.status(200).send({
      profile,
      levelInfo,
      todayXp,
      dailyCap: DAILY_XP_CAP,
      remainingDailyCap,
      badgesCount: userBadges.length,
      recentTransactions: userTxs.slice(0, 10),
    });
  });

  app.get('/api/v1/gamification/transactions', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userTxs = xpTransactionsByUserId.get(session.userId) || [];
    return reply.status(200).send({ transactions: userTxs });
  });

  app.get('/api/v1/gamification/badges', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userBadges = userBadgesByUserId.get(session.userId) || [];
    const earnedBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.awardedAt]));

    const allBadges = Array.from(badgesById.values()).map((b) => ({
      ...b,
      isEarned: earnedBadgeMap.has(b.id),
      awardedAt: earnedBadgeMap.get(b.id),
    }));

    return reply.status(200).send({ badges: allBadges });
  });

  app.get('/api/v1/gamification/leaderboard', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const query = GetLeaderboardQuerySchema.parse(req.query || {});

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const records: LeaderboardUserRecord[] = [];
    for (const [userId, user] of usersById.entries()) {
      const gProfile = getOrCreateGamificationProfile(userId);
      const userProfile = profilesByUserId.get(userId);
      const displayName = userProfile?.fullName || user.email.split('@')[0];
      const badges = userBadgesByUserId.get(userId) || [];
      const txs = xpTransactionsByUserId.get(userId) || [];

      const weeklyXp = txs
        .filter((t) => t.createdAt >= sevenDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      records.push({
        userId,
        displayName,
        totalXp: gProfile.totalXp,
        level: gProfile.currentLevel,
        currentStreak: gProfile.currentStreak,
        badgesCount: badges.length,
        weeklyXp,
      });
    }

    const leaderboard = computeLeaderboard(records, query.period, query.limit);
    const fullLeaderboard = computeLeaderboard(records, query.period, records.length);
    const currentUserEntry = fullLeaderboard.find((e) => e.userId === session.userId);
    const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;

    return reply.status(200).send({
      period: query.period,
      leaderboard,
      currentUserRank,
      totalParticipants: records.length,
    });
  });

  app.post('/api/v1/gamification/claim-activity', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = ClaimGamificationActivityInputSchema.parse(req.body || {});

    const profile = getOrCreateGamificationProfile(session.userId);
    const existingTxs = xpTransactionsByUserId.get(session.userId) || [];

    const result = processXpAward({
      userId: session.userId,
      amount: input.amount,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      description: input.description,
      profile,
      existingTransactions: existingTxs,
    });

    if (result.isDuplicate) {
      return reply.status(200).send({
        message: 'XP already credited for this activity.',
        awarded: 0,
        isDuplicate: true,
        transaction: result.transaction,
        profile,
      });
    }

    if (result.isCapReached) {
      return reply.status(200).send({
        message: `Daily XP cap reached (${DAILY_XP_CAP} XP/day). No additional XP awarded.`,
        awarded: 0,
        isCapReached: true,
        profile,
      });
    }

    // Persist transaction
    if (result.transaction) {
      existingTxs.unshift(result.transaction);
      xpTransactionsByUserId.set(session.userId, existingTxs);
    }
    gamificationProfilesByUserId.set(session.userId, result.updatedProfile);

    // Check eligible badges
    const userBadges = userBadgesByUserId.get(session.userId) || [];
    const alreadyAwardedIds = userBadges.map((b) => b.badgeId);

    const completedChallengesCount = existingTxs.filter((t) => t.referenceType === 'challenge' || t.referenceType === 'challenge_completion').length;
    const completedCoursesCount = existingTxs.filter((t) => t.referenceType === 'course' || t.referenceType === 'course_completion').length;
    const connectionsCount = (connectionsByUserId.get(session.userId) || []).filter((c) => c.status === 'accepted').length;

    const newlyEligible = evaluateEligibleBadges(
      {
        totalXp: result.updatedProfile.totalXp,
        completedChallengesCount,
        completedCoursesCount,
        currentStreak: result.updatedProfile.currentStreak,
        connectionsCount,
      },
      Array.from(badgesById.values()),
      alreadyAwardedIds
    );

    const now = new Date().toISOString();
    for (const badge of newlyEligible) {
      const ub: UserBadge = {
        id: crypto.randomUUID(),
        userId: session.userId,
        badgeId: badge.id,
        awardedAt: now,
      };
      userBadges.push(ub);

      enqueuedWorkerJobs.push({
        type: 'gamification.badge.unlocked',
        payload: {
          userId: session.userId,
          badgeId: badge.id,
          badgeSlug: badge.slug,
          badgeName: badge.name,
        },
        enqueuedAt: now,
      });
    }
    userBadgesByUserId.set(session.userId, userBadges);

    enqueuedWorkerJobs.push({
      type: 'gamification.xp.awarded',
      payload: {
        userId: session.userId,
        amount: result.awardedAmount,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
      enqueuedAt: now,
    });

    return reply.status(200).send({
      message: `Successfully awarded ${result.awardedAmount} XP`,
      awarded: result.awardedAmount,
      transaction: result.transaction,
      profile: result.updatedProfile,
      newlyUnlockedBadges: newlyEligible,
    });
  });

  // ============================================================================
  // Account Settings, Privacy & GDPR/DPDP Erasure Routes (F-15, §31, BR-06)
  // ============================================================================

  // Helper to safely format settings for HTTP responses (mask sensitive keys)
  const sanitizeSettings = (settings: UserSettings) => {
    return {
      ...settings,
      byoAiKey: settings.byoAiKey ? '••••••••' : null,
    };
  };

  // 1. Get current user settings (creates defaults if not yet initialized)
  app.get('/api/v1/settings', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    let settings = userSettingsByUserId.get(session.userId);
    if (!settings) {
      settings = createDefaultUserSettings(session.userId);
      userSettingsByUserId.set(session.userId, settings);
    }

    return reply.status(200).send({
      settings: sanitizeSettings(settings),
    });
  });

  // 2. Update user settings
  app.patch('/api/v1/settings', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = UpdateUserSettingsInputSchema.parse(req.body);

    let current = userSettingsByUserId.get(session.userId);
    if (!current) {
      current = createDefaultUserSettings(session.userId);
    }

    const updated = updateUserSettings(current, input);
    userSettingsByUserId.set(session.userId, updated);

    // If profile visibility was changed, synchronize with profile entity
    if (input.profileVisibility) {
      const profile = profilesByUserId.get(session.userId);
      if (profile) {
        profile.privacy = input.profileVisibility;
        profilesByUserId.set(session.userId, profile);
        if (profile.id) profilesById.set(profile.id, profile);
      }
    }

    enqueuedWorkerJobs.push({
      type: 'user.settings.updated',
      payload: {
        userId: session.userId,
        updatedFields: Object.keys(input),
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Account settings updated successfully.',
      settings: sanitizeSettings(updated),
    });
  });

  // 3. Initiate Data Portability / Export (GDPR Art 15 & 20)
  app.post('/api/v1/settings/export', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = RequestDataExportInputSchema.parse(req.body || {});

    const user = usersById.get(session.userId) || {
      id: session.userId,
      email: session.email,
      roles: session.roles as any,
      status: 'active' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const profile = profilesByUserId.get(session.userId) || {
      id: crypto.randomUUID(),
      userId: session.userId,
      fullName: 'TalentSphere User',
      privacy: 'public' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let settings = userSettingsByUserId.get(session.userId);
    if (!settings) {
      settings = createDefaultUserSettings(session.userId);
      userSettingsByUserId.set(session.userId, settings);
    }

    const evidence = evidenceBySubjectId.get(session.userId) || [];
    const applications = Array.from(applicationsById.values()).filter(
      (a) => a.candidateId === session.userId
    );
    const resumes = resumesByUserId.get(session.userId) || [];
    const portfolio = portfolioProjectsByUserId.get(session.userId) || [];
    const gamification = gamificationProfilesByUserId.get(session.userId);

    const now = new Date().toISOString();
    const exportBundle = compileDataExportArchive({
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles as any,
        status: (user.status as any) || 'active',
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
      },
      profile,
      settings,
      evidence: evidence as any,
      applications: applications as any,
      resumes: resumes as any,
      portfolio: portfolio as any,
      gamification: gamification as any,
      nowIso: now,
    });

    const exportRequestId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const exportRequest: DataExportRequest = {
      id: exportRequestId,
      userId: session.userId,
      status: 'completed',
      format: input.format,
      downloadUrl: `/api/v1/settings/export/download/${exportRequestId}`,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    const userExports = exportRequestsByUserId.get(session.userId) || [];
    userExports.unshift(exportRequest);
    exportRequestsByUserId.set(session.userId, userExports);

    enqueuedWorkerJobs.push({
      type: 'gdpr.data.exported',
      payload: {
        userId: session.userId,
        requestId: exportRequestId,
        format: input.format,
      },
      enqueuedAt: now,
    });

    return reply.status(200).send({
      message: 'Data export compiled successfully in accordance with GDPR Articles 15 & 20.',
      exportRequest,
      data: exportBundle,
    });
  });

  // 4. Get Latest Data Export Request Status
  app.get('/api/v1/settings/export/latest', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userExports = exportRequestsByUserId.get(session.userId) || [];
    const latest = userExports[0] || null;

    return reply.status(200).send({
      latestExport: latest,
    });
  });

  // 5. Request Account Erasure (GDPR Art 17 with mandatory 30-day grace period)
  app.post('/api/v1/settings/erasure/request', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = RequestErasureInputSchema.parse(req.body);

    const userRequests = erasureRequestsByUserId.get(session.userId) || [];
    const active = userRequests.find(
      (r) => r.status === 'grace_period' || r.status === 'pending'
    );
    if (active) {
      throw new DomainError(
        'CONFLICT',
        'An active account erasure request is already pending. You can cancel it before the grace period ends.'
      );
    }

    const erasureRequest = requestAccountErasure(session.userId, input.reason);
    userRequests.unshift(erasureRequest);
    erasureRequestsByUserId.set(session.userId, userRequests);
    erasureRequestsById.set(erasureRequest.id, erasureRequest);

    enqueuedWorkerJobs.push({
      type: 'gdpr.erasure.requested',
      payload: {
        userId: session.userId,
        requestId: erasureRequest.id,
        gracePeriodEndsAt: erasureRequest.gracePeriodEndsAt,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(201).send({
      message: 'Account erasure request initiated with 30-day grace period (GDPR Art 17).',
      erasureRequest,
    });
  });

  // 6. Get Account Erasure Request Status
  app.get('/api/v1/settings/erasure/status', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userRequests = erasureRequestsByUserId.get(session.userId) || [];
    const active = userRequests.find(
      (r) => r.status === 'grace_period' || r.status === 'pending'
    );

    return reply.status(200).send({
      hasPendingErasure: !!active,
      activeRequest: active || null,
      history: userRequests,
    });
  });

  // 7. Cancel Account Erasure within 30-Day Grace Period
  app.post('/api/v1/settings/erasure/cancel', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CancelErasureInputSchema.parse(req.body);

    const erasureRequest = erasureRequestsById.get(input.requestId);
    if (!erasureRequest) {
      throw new DomainError('NOT_FOUND', `Erasure request ${input.requestId} not found.`);
    }

    if (erasureRequest.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'You are not authorized to cancel this erasure request.');
    }

    const cancelled = cancelAccountErasure(erasureRequest);
    erasureRequestsById.set(cancelled.id, cancelled);

    const list = erasureRequestsByUserId.get(session.userId) || [];
    const idx = list.findIndex((r) => r.id === cancelled.id);
    if (idx !== -1) {
      list[idx] = cancelled;
      erasureRequestsByUserId.set(session.userId, list);
    }

    enqueuedWorkerJobs.push({
      type: 'gdpr.erasure.cancelled',
      payload: {
        userId: session.userId,
        requestId: cancelled.id,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: 'Account erasure request successfully cancelled.',
      erasureRequest: cancelled,
    });
  });

  // 8. Execute Immediate Account Erasure / Logical Anonymization (§31.4)
  app.post('/api/v1/settings/erasure/execute', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);

    const user = usersById.get(session.userId);
    const profile = profilesByUserId.get(session.userId);

    if (!user || !profile) {
      throw new DomainError('NOT_FOUND', 'User or profile not found for erasure execution.');
    }

    const result = executeLogicalAnonymization(
      {
        id: user.id,
        email: user.email,
        roles: user.roles as any,
        status: (user.status as any) || 'active',
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
      },
      profile
    );

    // Persist anonymized state
    user.email = result.anonymizedUser.email;
    user.status = 'deactivated';
    usersById.set(user.id, user);
    usersByEmail.delete(session.email.toLowerCase());
    usersByEmail.set(user.email.toLowerCase(), user);

    profilesByUserId.set(session.userId, result.anonymizedProfile);
    if (profile.id) {
      profilesById.set(profile.id, result.anonymizedProfile);
    }

    // Mark any active erasure request as completed
    const list = erasureRequestsByUserId.get(session.userId) || [];
    const active = list.find((r) => r.status === 'grace_period' || r.status === 'pending');
    if (active) {
      active.status = 'completed';
      active.completedAt = result.completedAt;
      active.anonymizedHash = result.anonymizedHash;
      active.updatedAt = result.completedAt;
      erasureRequestsById.set(active.id, active);
    }

    enqueuedWorkerJobs.push({
      type: 'gdpr.erasure.completed',
      payload: {
        userId: session.userId,
        anonymizedHash: result.anonymizedHash,
      },
      enqueuedAt: result.completedAt,
    });

    return reply.status(200).send({
      message: 'Account logically anonymized and deactivated in compliance with GDPR Art 17 and §31.4.',
      anonymizedHash: result.anonymizedHash,
      completedAt: result.completedAt,
    });
  });

  // ============================================================================
  // Billing & Subscriptions Routes (F-16, Section 64, WF-16, WIT-016)
  // ============================================================================

  // 1. Get available platform plans (public catalog)
  app.get('/api/v1/billing/plans', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      plans: Object.values(PLATFORM_PLANS),
    });
  });

  // 2. Get user's current subscription & active entitlements
  app.get('/api/v1/billing/subscription', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);

    let subscription = subscriptionsByUserId.get(session.userId);
    if (!subscription) {
      const now = new Date().toISOString();
      subscription = {
        id: crypto.randomUUID(),
        userId: session.userId,
        planTier: 'free',
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      };
      subscriptionsByUserId.set(session.userId, subscription);
    }

    let entitlements = entitlementsByUserId.get(session.userId);
    if (!entitlements) {
      entitlements = getPlanEntitlements(session.userId, subscription.planTier);
      entitlementsByUserId.set(session.userId, entitlements);
    }

    return reply.status(200).send({
      subscription,
      entitlements,
    });
  });

  // 3. Subscribe or upgrade plan tier
  app.post('/api/v1/billing/subscribe', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = SubscribePlanInputSchema.parse(req.body);

    // Idempotency check if idempotencyKey provided
    if (input.idempotencyKey) {
      const existingInvoices = invoicesByUserId.get(session.userId) || [];
      const match = existingInvoices.find((i) => i.idempotencyKey === input.idempotencyKey);
      if (match) {
        const sub = subscriptionsByUserId.get(session.userId)!;
        const ent = entitlementsByUserId.get(session.userId)!;
        return reply.status(200).send({
          message: 'Subscription already active for this idempotency key.',
          subscription: sub,
          invoice: match,
          entitlements: ent,
          isDuplicate: true,
        });
      }
    }

    const result = createSubscription({
      userId: session.userId,
      planTier: input.planTier,
      billingCycle: input.billingCycle,
      idempotencyKey: input.idempotencyKey,
    });

    subscriptionsByUserId.set(session.userId, result.subscription);
    entitlementsByUserId.set(session.userId, result.entitlements);

    const userInvoices = invoicesByUserId.get(session.userId) || [];
    userInvoices.unshift(result.invoice);
    invoicesByUserId.set(session.userId, userInvoices);
    invoicesById.set(result.invoice.id, result.invoice);

    enqueuedWorkerJobs.push({
      type: 'billing.subscription.created',
      payload: {
        userId: session.userId,
        subscriptionId: result.subscription.id,
        planTier: result.subscription.planTier,
        amountCents: result.invoice.amountCents,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(201).send({
      message: 'Subscription successfully activated.',
      subscription: result.subscription,
      invoice: result.invoice,
      entitlements: result.entitlements,
    });
  });

  // 4. Cancel active subscription
  app.post('/api/v1/billing/cancel', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CancelSubscriptionInputSchema.parse(req.body || {});

    const current = subscriptionsByUserId.get(session.userId);
    if (!current || current.planTier === 'free' || current.status === 'canceled') {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        'No active paid subscription found to cancel.'
      );
    }

    const cancelled = cancelSubscription(current, input.immediate);
    subscriptionsByUserId.set(session.userId, cancelled);

    if (input.immediate) {
      const freeEntitlements = getPlanEntitlements(session.userId, 'free');
      entitlementsByUserId.set(session.userId, freeEntitlements);
    }

    enqueuedWorkerJobs.push({
      type: 'billing.subscription.cancelled',
      payload: {
        userId: session.userId,
        subscriptionId: cancelled.id,
        immediate: input.immediate,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      message: input.immediate
        ? 'Subscription canceled immediately.'
        : 'Subscription set to cancel at end of current billing period.',
      subscription: cancelled,
    });
  });

  // 5. Get user invoices history
  app.get('/api/v1/billing/invoices', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const invoices = invoicesByUserId.get(session.userId) || [];

    return reply.status(200).send({
      invoices,
    });
  });

  // 6. External Payment Webhook (with replay resistance & idempotency - WIT-016)
  app.post('/api/v1/billing/webhook', async (req: FastifyRequest, reply: FastifyReply) => {
    const input = ProcessPaymentWebhookInputSchema.parse(req.body);

    const existingEvent = billingEventsByIdempotency.get(input.idempotencyKey);
    if (existingEvent) {
      return reply.status(200).send({
        replayed: true,
        message: 'Billing event already processed (idempotent duplicate).',
        eventId: existingEvent.id,
      });
    }

    const eventId = crypto.randomUUID();
    const event: BillingEvent = {
      id: eventId,
      userId: input.userId,
      eventType: input.eventType,
      payload: {
        amountCents: input.amountCents,
        currency: input.currency,
        subscriptionId: input.subscriptionId,
      },
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    billingEventsByIdempotency.set(input.idempotencyKey, event);

    enqueuedWorkerJobs.push({
      type: 'billing.webhook.received',
      payload: {
        eventId,
        eventType: input.eventType,
        userId: input.userId,
      },
      enqueuedAt: event.createdAt,
    });

    return reply.status(200).send({
      status: 'success',
      message: 'Billing webhook processed successfully.',
      eventId,
    });
  });

  // ============================================================================
  // Platform Administration & Governance Routes (F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068)
  // ============================================================================

  // 1. List users (Admin)
  app.get('/api/v1/admin/users', async (req: FastifyRequest<{ Querystring: { search?: string; status?: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const { search, status } = req.query;
    let users = Array.from(usersById.values());

    if (status) {
      users = users.filter((u) => (u.status || 'active') === status);
    }
    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) => u.email.toLowerCase().includes(q));
    }

    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      roles: u.roles,
      status: u.status || 'active',
      createdAt: u.createdAt,
    }));

    return reply.status(200).send({
      users: sanitizedUsers,
      total: sanitizedUsers.length,
    });
  });

  // 2. Update user status (Admin - with anti-lockout BR-29, BR-068)
  app.patch('/api/v1/admin/users/:id/status', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const { id } = req.params;
    const targetUser = usersById.get(id);
    if (!targetUser) {
      throw new DomainError('NOT_FOUND', `User with ID "${id}" not found.`);
    }

    const input = AdminUpdateUserStatusInputSchema.parse(req.body);
    const oldStatus = (targetUser.status || 'active') as any;

    validateUserStatusTransition(oldStatus, input.status, session.userId, targetUser.id);

    targetUser.status = input.status;
    usersById.set(targetUser.id, targetUser);

    const auditLog = createAdminAuditLog({
      eventName: 'USER_STATUS_UPDATED',
      actorId: session.userId,
      targetId: targetUser.id,
      targetType: 'user',
      metadata: {
        oldStatus,
        newStatus: input.status,
        reason: input.reason,
      },
    });
    adminAuditLogs.unshift(auditLog);

    enqueuedWorkerJobs.push({
      type: 'admin.user.status_updated',
      payload: {
        userId: targetUser.id,
        newStatus: input.status,
        updatedBy: session.userId,
      },
      enqueuedAt: auditLog.createdAt,
    });

    return reply.status(200).send({
      message: 'User status updated successfully.',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        roles: targetUser.roles,
        status: targetUser.status,
      },
      auditLog,
    });
  });

  // 3. Update user roles (Admin)
  app.patch('/api/v1/admin/users/:id/roles', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const { id } = req.params;
    const targetUser = usersById.get(id);
    if (!targetUser) {
      throw new DomainError('NOT_FOUND', `User with ID "${id}" not found.`);
    }

    const input = AdminUpdateUserRolesInputSchema.parse(req.body);
    const oldRoles = [...targetUser.roles];
    targetUser.roles = input.roles as Role[];
    usersById.set(targetUser.id, targetUser);

    const auditLog = createAdminAuditLog({
      eventName: 'USER_ROLES_UPDATED',
      actorId: session.userId,
      targetId: targetUser.id,
      targetType: 'user',
      metadata: {
        oldRoles,
        newRoles: input.roles,
      },
    });
    adminAuditLogs.unshift(auditLog);

    return reply.status(200).send({
      message: 'User roles updated successfully.',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        roles: targetUser.roles,
        status: targetUser.status || 'active',
      },
      auditLog,
    });
  });

  // 4. List feature flags (Admin)
  app.get('/api/v1/admin/feature-flags', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const flags = Array.from(featureFlags.values());
    return reply.status(200).send({
      flags,
      total: flags.length,
    });
  });

  // 5. Update/toggle feature flag (Admin)
  app.put('/api/v1/admin/feature-flags/:key', async (req: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const { key } = req.params;
    const input = AdminToggleFeatureFlagInputSchema.parse(req.body);

    const existingFlag = featureFlags.get(key) || {
      key,
      enabled: false,
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = updateFeatureFlagState(existingFlag, input.enabled, input.description);
    featureFlags.set(key, updated);

    const auditLog = createAdminAuditLog({
      eventName: 'FEATURE_FLAG_UPDATED',
      actorId: session.userId,
      targetId: key,
      targetType: 'feature_flag',
      metadata: {
        key,
        enabled: updated.enabled,
        description: updated.description,
      },
    });
    adminAuditLogs.unshift(auditLog);

    return reply.status(200).send({
      message: 'Feature flag updated successfully.',
      flag: updated,
      auditLog,
    });
  });

  // 6. Query admin audit logs (BR-067)
  app.get('/api/v1/admin/audit-logs', async (req: FastifyRequest<{ Querystring: { actorId?: string; eventName?: string; limit?: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const query = AdminQueryAuditLogsSchema.parse(req.query);
    let logs = [...adminAuditLogs];

    if (query.actorId) {
      logs = logs.filter((l) => l.actorId === query.actorId);
    }
    if (query.eventName) {
      logs = logs.filter((l) => l.eventName === query.eventName);
    }

    const limited = logs.slice(0, query.limit);

    return reply.status(200).send({
      logs: limited,
      total: limited.length,
    });
  });

  // 7. System health & diagnostics (BR-28)
  app.get('/api/v1/admin/health-diagnostics', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const status = computeSystemHealth({
      dbConnected: true,
      queueOperational: true,
      inMaintenance: systemInMaintenance,
    });

    const diagnostics: SystemDiagnostics = {
      status,
      database: 'connected',
      queue: 'operational',
      inMaintenance: systemInMaintenance,
      uptimeSeconds: Math.floor(process.uptime()),
      registeredUsersCount: usersById.size,
      activeJobsCount: enqueuedWorkerJobs.length,
      evaluatedAt: new Date().toISOString(),
    };

    return reply.status(200).send({
      diagnostics,
    });
  });

  // 8. Toggle maintenance mode
  app.post('/api/v1/admin/maintenance', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    assertPlatformAdmin(session.roles);

    const input = AdminSetMaintenanceModeInputSchema.parse(req.body);
    systemInMaintenance = input.inMaintenance;

    const auditLog = createAdminAuditLog({
      eventName: 'MAINTENANCE_MODE_TOGGLED',
      actorId: session.userId,
      metadata: {
        inMaintenance: input.inMaintenance,
        reason: input.reason,
      },
    });
    adminAuditLogs.unshift(auditLog);

    return reply.status(200).send({
      message: `System maintenance mode ${input.inMaintenance ? 'enabled' : 'disabled'}.`,
      inMaintenance: systemInMaintenance,
      auditLog,
    });
  });

  // ============================================================================
  // Multi-Entity Backend Search & Command Palette Routes (F-20, F-34, F-32)
  // ============================================================================

  // 1. Unified Multi-Entity Search
  app.get('/api/v1/search', async (req: FastifyRequest, reply: FastifyReply) => {
    const input = SearchQueryInputSchema.parse(req.query);
    const session = maybeExtractUser(req);
    const viewerId = session?.userId;
    const viewerRoles = session?.roles || [];

    const query = input.query.trim();
    const type = input.type;
    const limit = input.limit;

    const matchedResults: SearchResultItem[] = [];
    const categories: Record<string, number> = {
      jobs: 0,
      skills: 0,
      courses: 0,
      challenges: 0,
      profiles: 0,
      commands: 0,
    };

    // 1a. Jobs Search
    if (type === 'all' || type === 'jobs') {
      for (const job of jobsById.values()) {
        if (job.status !== 'published') continue;
        const titleScore = scoreSearchMatch(job.title, query);
        const locScore = scoreSearchMatch(job.location, query);
        const descScore = scoreSearchMatch(job.description, query);
        const maxScore = Math.max(titleScore, locScore, descScore);

        if (maxScore > 0) {
          categories.jobs++;
          matchedResults.push({
            id: job.id,
            type: 'job',
            title: job.title,
            subtitle: job.location || 'Remote',
            url: `/jobs/${job.id}`,
            badge: job.status,
            score: maxScore,
          });
        }
      }
    }

    // 1b. Skills Search
    if (type === 'all' || type === 'skills') {
      for (const skill of skillsById.values()) {
        const nameScore = scoreSearchMatch(skill.name, query);
        const catScore = scoreSearchMatch(skill.category, query);
        const maxScore = Math.max(nameScore, catScore);

        if (maxScore > 0) {
          categories.skills++;
          matchedResults.push({
            id: skill.id,
            type: 'skill',
            title: skill.name,
            subtitle: skill.category,
            url: `/skills/${skill.slug}`,
            badge: 'Skill',
            score: maxScore,
          });
        }
      }
    }

    // 1c. Courses Search
    if (type === 'all' || type === 'courses') {
      for (const course of coursesById.values()) {
        if (course.status !== 'published') continue;
        const titleScore = scoreSearchMatch(course.title, query);
        const descScore = scoreSearchMatch(course.description, query);
        const levelScore = scoreSearchMatch(course.level, query);
        const maxScore = Math.max(titleScore, descScore, levelScore);

        if (maxScore > 0) {
          categories.courses++;
          matchedResults.push({
            id: course.id,
            type: 'course',
            title: course.title,
            subtitle: `${course.level} • ${course.estimatedDurationMinutes} mins`,
            url: `/courses/${course.id}`,
            badge: `${course.xpReward} XP`,
            score: maxScore,
          });
        }
      }
    }

    // 1d. Coding Challenges Search
    if (type === 'all' || type === 'challenges') {
      for (const challenge of challengesById.values()) {
        const titleScore = scoreSearchMatch(challenge.title, query);
        const catScore = scoreSearchMatch(challenge.category, query);
        const diffScore = scoreSearchMatch(challenge.difficulty, query);
        const maxScore = Math.max(titleScore, catScore, diffScore);

        if (maxScore > 0) {
          categories.challenges++;
          matchedResults.push({
            id: challenge.id,
            type: 'challenge',
            title: challenge.title,
            subtitle: `${challenge.difficulty} • ${challenge.category}`,
            url: `/arena/challenges/${challenge.id}`,
            badge: challenge.difficulty,
            score: maxScore,
          });
        }
      }
    }

    // 1e. Profiles Search (Strict Privacy Enforced via canViewProfile)
    if (type === 'all' || type === 'profiles') {
      for (const profile of profilesById.values()) {
        // Enforce privacy rule: skip if viewer cannot view profile
        if (!canViewProfile(profile, viewerId, viewerRoles)) {
          continue;
        }

        const nameScore = scoreSearchMatch(profile.fullName, query);
        const headScore = scoreSearchMatch(profile.headline || '', query);
        const maxScore = Math.max(nameScore, headScore);

        if (maxScore > 0) {
          categories.profiles++;
          matchedResults.push({
            id: profile.id,
            type: 'profile',
            title: profile.fullName,
            subtitle: profile.headline || 'TalentSphere Member',
            url: `/profile/${profile.userId}`,
            badge: profile.privacy,
            score: maxScore,
          });
        }
      }
    }

    // 1f. Command Palette Search
    const availableCommands = getAvailableCommands(viewerRoles);
    let matchedCommands: CommandItem[] = [];
    if (type === 'all' || type === 'commands') {
      matchedCommands = filterCommandsByQuery(availableCommands, query);
      categories.commands = matchedCommands.length;
    }

    // Rank and slice results
    const rankedResults = rankSearchResults(matchedResults);
    const slicedResults = rankedResults.slice(0, limit);

    // Save search history for authenticated users
    if (session) {
      const historyRecord = createSearchHistoryRecord(
        session.userId,
        query,
        type,
        slicedResults.length
      );
      const userHistory = searchHistoryByUserId.get(session.userId) || [];
      userHistory.unshift(historyRecord);
      searchHistoryByUserId.set(session.userId, userHistory);
    }

    enqueuedWorkerJobs.push({
      type: 'search.queried',
      payload: {
        userId: viewerId || 'anonymous',
        query,
        entityType: type,
        resultCount: slicedResults.length,
      },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({
      query,
      type,
      totalResults: rankedResults.length,
      results: slicedResults,
      commands: matchedCommands.slice(0, limit),
      categories,
    });
  });

  // 2. Get Available Commands (Command Palette ⌘K)
  app.get('/api/v1/search/commands', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = maybeExtractUser(req);
    const commands = getAvailableCommands(session?.roles || []);
    return reply.status(200).send({
      commands,
      total: commands.length,
    });
  });

  // 3. Get User Search History
  app.get('/api/v1/search/history', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const history = searchHistoryByUserId.get(session.userId) || [];
    return reply.status(200).send({
      history,
      total: history.length,
    });
  });

  // 4. Clear User Search History
  app.delete('/api/v1/search/history', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = ClearSearchHistoryInputSchema.parse(req.body || {});

    if (input.olderThanDays !== undefined && input.olderThanDays > 0) {
      const cutoff = new Date(Date.now() - input.olderThanDays * 86400000).toISOString();
      const current = searchHistoryByUserId.get(session.userId) || [];
      const retained = current.filter((h) => h.createdAt >= cutoff);
      searchHistoryByUserId.set(session.userId, retained);
    } else {
      searchHistoryByUserId.set(session.userId, []);
    }

    return reply.status(200).send({
      message: 'Search history cleared successfully.',
    });
  });

  // =========================================================================
  // Trust, Safety & Content Moderation Endpoints (F-24, BR-34, BR-68, BR-125, BR-154, WIT-008, WIT-013)
  // =========================================================================

  // 1. Scan content for abuse prior to publication (BR-125)
  app.post('/api/v1/moderation/scan', async (req: FastifyRequest, reply: FastifyReply) => {
    const input = ScanContentInputSchema.parse(req.body);
    const scanResult = scanContentForAbuse(input.text);
    return reply.status(200).send({ scanResult });
  });

  // 2. Submit a moderation report
  app.post('/api/v1/moderation/reports', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateModerationReportInputSchema.parse(req.body);
    const existingReports = Array.from(moderationReportsById.values());

    const report = createModerationReport({
      reporterId: session.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      details: input.details,
      existingReports,
    });

    moderationReportsById.set(report.id, report);

    enqueuedWorkerJobs.push({
      type: 'moderation.report_created',
      payload: { reportId: report.id, targetType: report.targetType, targetId: report.targetId, severity: report.severity },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(201).send({ report });
  });

  // 3. Get reporter's own submitted reports
  app.get('/api/v1/moderation/reports/my', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const myReports = Array.from(moderationReportsById.values()).filter(
      (r) => r.reporterId === session.userId
    );
    return reply.status(200).send({ reports: myReports, total: myReports.length });
  });

  // 4. Moderator Queue: List reports with optional filters
  app.get('/api/v1/moderation/reports', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    assertModeratorAuthority(session.roles);

    const query = req.query as { status?: string; targetType?: string; severity?: string } | undefined;
    let list = Array.from(moderationReportsById.values());

    if (query?.status) {
      list = list.filter((r) => r.status === query.status);
    }
    if (query?.targetType) {
      list = list.filter((r) => r.targetType === query.targetType);
    }
    if (query?.severity) {
      list = list.filter((r) => r.severity === query.severity);
    }

    return reply.status(200).send({ reports: list, total: list.length });
  });

  // 5. Get report details
  app.get('/api/v1/moderation/reports/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const report = moderationReportsById.get(id);
    if (!report) {
      throw new DomainError('NOT_FOUND', `Moderation report with ID "${id}" not found.`);
    }

    const isModerator = session.roles.includes('moderator') || session.roles.includes('platform_admin');
    if (!isModerator && report.reporterId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to this moderation report.');
    }

    return reply.status(200).send({ report });
  });

  // 6. Transition report status (BR-34)
  app.patch('/api/v1/moderation/reports/:id/status', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = UpdateModerationReportStatusInputSchema.parse(req.body);

    const report = moderationReportsById.get(id);
    if (!report) {
      throw new DomainError('NOT_FOUND', `Moderation report with ID "${id}" not found.`);
    }

    const updated = transitionReportStatus(report, input.status, {
      userId: session.userId,
      roles: session.roles,
    });
    moderationReportsById.set(id, updated);

    return reply.status(200).send({ report: updated });
  });

  // 7. Resolve moderation report with enforcement action (BR-068, WIT-008, WIT-013)
  app.post('/api/v1/moderation/reports/:id/resolve', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = ResolveModerationReportInputSchema.parse(req.body);

    const report = moderationReportsById.get(id);
    if (!report) {
      throw new DomainError('NOT_FOUND', `Moderation report with ID "${id}" not found.`);
    }

    let secondApproverRoles: string[] | undefined;
    if (input.secondApproverId) {
      const secondUser = usersById.get(input.secondApproverId);
      secondApproverRoles = secondUser?.roles;
    }

    const resolved = resolveModerationReport({
      report,
      action: input.action,
      resolutionNotes: input.resolutionNotes,
      resolver: { userId: session.userId, roles: session.roles },
      secondApproverId: input.secondApproverId,
      secondApproverRoles,
    });

    moderationReportsById.set(id, resolved);

    // Apply side effects of enforcement
    if (resolved.actionTaken === 'user_suspended' && resolved.targetType === 'user') {
      const user = usersById.get(resolved.targetId);
      if (user) user.status = 'suspended';
    } else if (resolved.actionTaken === 'user_banned' && resolved.targetType === 'user') {
      const user = usersById.get(resolved.targetId);
      if (user) user.status = 'deactivated';
    } else if (resolved.actionTaken === 'content_removed' && resolved.targetType === 'job') {
      const job = jobsById.get(resolved.targetId);
      if (job) job.status = 'closed';
    }

    enqueuedWorkerJobs.push({
      type: 'moderation.report_resolved',
      payload: { reportId: resolved.id, action: resolved.actionTaken, targetId: resolved.targetId },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({ report: resolved });
  });

  // 8. Submit an appeal against an adverse moderation action (WIT-013, BR-154)
  app.post('/api/v1/moderation/reports/:id/appeal', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = CreateModerationAppealInputSchema.parse(req.body);

    const report = moderationReportsById.get(id);
    if (!report) {
      throw new DomainError('NOT_FOUND', `Moderation report with ID "${id}" not found.`);
    }

    const existingAppeals = Array.from(moderationAppealsById.values());
    const appeal = createModerationAppeal(report, session.userId, input.reason, existingAppeals);
    moderationAppealsById.set(appeal.id, appeal);

    enqueuedWorkerJobs.push({
      type: 'moderation.appeal_submitted',
      payload: { appealId: appeal.id, reportId: report.id, appellantId: appeal.appellantId },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(201).send({ appeal });
  });

  // 9. List appeals (Moderator Queue)
  app.get('/api/v1/moderation/appeals', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    assertModeratorAuthority(session.roles);

    const appeals = Array.from(moderationAppealsById.values());
    return reply.status(200).send({ appeals, total: appeals.length });
  });

  // 10. Review and decide on an appeal
  app.post('/api/v1/moderation/appeals/:id/review', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const input = ReviewModerationAppealInputSchema.parse(req.body);

    const appeal = moderationAppealsById.get(id);
    if (!appeal) {
      throw new DomainError('NOT_FOUND', `Appeal with ID "${id}" not found.`);
    }

    const reviewed = reviewModerationAppeal(appeal, input.decision, input.decisionNotes, {
      userId: session.userId,
      roles: session.roles,
    });

    moderationAppealsById.set(id, reviewed);

    // If appeal is upheld, reverse penalty on target entity
    if (reviewed.status === 'upheld') {
      const origReport = moderationReportsById.get(reviewed.reportId);
      if (origReport) {
        origReport.actionTaken = 'dismissed';
        origReport.status = 'dismissed';
        if (origReport.targetType === 'user') {
          const user = usersById.get(origReport.targetId);
          if (user) user.status = 'active';
        }
      }
    }

    enqueuedWorkerJobs.push({
      type: 'moderation.appeal_reviewed',
      payload: { appealId: reviewed.id, status: reviewed.status },
      enqueuedAt: new Date().toISOString(),
    });

    return reply.status(200).send({ appeal: reviewed });
  });

  // =========================================================================
  // Saved Searches, Job Alerts & Saved Jobs Endpoints (F-32, F-04, F-25)
  // =========================================================================

  // 1. Create a new saved search
  app.post('/api/v1/jobs/saved-searches', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateSavedSearchInputSchema.parse(req.body);
    const existing = Array.from(savedSearchesById.values());

    const savedSearch = createSavedSearch({
      userId: session.userId,
      title: input.title,
      criteria: input.criteria,
      alertFrequency: input.alertFrequency,
      existingSearches: existing,
    });

    savedSearchesById.set(savedSearch.id, savedSearch);
    return reply.status(201).send({ savedSearch });
  });

  // 2. List candidate's saved searches
  app.get('/api/v1/jobs/saved-searches', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userSearches = Array.from(savedSearchesById.values()).filter(
      (s) => s.userId === session.userId
    );
    return reply.status(200).send({ savedSearches: userSearches, total: userSearches.length });
  });

  // 3. Get single saved search by ID
  app.get('/api/v1/jobs/saved-searches/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const search = savedSearchesById.get(id);
    if (!search) {
      throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
    }
    if (search.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
    }
    return reply.status(200).send({ savedSearch: search });
  });

  // 4. Update saved search
  app.patch('/api/v1/jobs/saved-searches/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const search = savedSearchesById.get(id);
    if (!search) {
      throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
    }
    if (search.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
    }
    const input = UpdateSavedSearchInputSchema.parse(req.body);
    const updated = updateSavedSearch(search, input);
    savedSearchesById.set(id, updated);
    return reply.status(200).send({ savedSearch: updated });
  });

  // 5. Delete saved search
  app.delete('/api/v1/jobs/saved-searches/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const search = savedSearchesById.get(id);
    if (!search) {
      throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
    }
    if (search.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
    }
    savedSearchesById.delete(id);
    return reply.status(200).send({ message: 'Saved search deleted successfully.' });
  });

  // 6. Run saved search on live published inventory
  app.post('/api/v1/jobs/saved-searches/:id/run', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const search = savedSearchesById.get(id);
    if (!search) {
      throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
    }
    if (search.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
    }
    const published = Array.from(jobsById.values()).filter((j) => j.status === 'published');
    const matched = published.filter((j) => matchJobAgainstCriteria(j, search.criteria));
    return reply.status(200).send({ matchingJobs: matched, total: matched.length });
  });

  // 7. List job alerts for candidate
  app.get('/api/v1/jobs/alerts', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const alerts = Array.from(jobAlertsById.values())
      .filter((a) => a.userId === session.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return reply.status(200).send({ alerts, total: alerts.length });
  });

  // 8. Mark job alert as read
  app.patch('/api/v1/jobs/alerts/:id/read', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id } = req.params;
    const alert = jobAlertsById.get(id);
    if (!alert) {
      throw new DomainError('NOT_FOUND', `Job alert with ID "${id}" not found.`);
    }
    if (alert.userId !== session.userId) {
      throw new DomainError('FORBIDDEN', 'Access denied to this alert.');
    }
    alert.isRead = true;
    jobAlertsById.set(id, alert);
    return reply.status(200).send({ alert });
  });

  // 9. Bookmark / save job
  app.post('/api/v1/jobs/:id/save', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id: jobId } = req.params;
    const job = jobsById.get(jobId);
    if (!job) {
      throw new DomainError('NOT_FOUND', `Job with ID "${jobId}" not found.`);
    }
    const currentSaved = savedJobsByUserId.get(session.userId) || [];
    const savedJob = createSavedJob(session.userId, jobId, currentSaved);
    currentSaved.push(savedJob);
    savedJobsByUserId.set(session.userId, currentSaved);
    return reply.status(201).send({ savedJob });
  });

  // 10. Remove saved job bookmark
  app.delete('/api/v1/jobs/:id/save', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const { id: jobId } = req.params;
    const currentSaved = savedJobsByUserId.get(session.userId) || [];
    const updated = removeSavedJob(session.userId, jobId, currentSaved);
    savedJobsByUserId.set(session.userId, updated);
    return reply.status(200).send({ message: 'Job removed from saved bookmarks.' });
  });

  // 11. List candidate's saved jobs
  app.get('/api/v1/jobs/saved', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const currentSaved = savedJobsByUserId.get(session.userId) || [];
    const jobs = currentSaved.map((s) => jobsById.get(s.jobId)).filter(Boolean);
    return reply.status(200).send({ savedJobs: currentSaved, jobs, total: currentSaved.length });
  });

  // Application Draft Autosave & Version Recovery (F-36, BR-18, SSOT 1015)
  app.put('/api/v1/jobs/:jobId/draft', async (req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Candidate profile not found.');
    }

    const { jobId } = req.params;
    const job = jobsById.get(jobId);
    if (!job) {
      throw new DomainError('NOT_FOUND', `Job with ID "${jobId}" not found.`);
    }

    const input = SaveApplicationDraftInputSchema.parse(req.body);

    const draftKey = `${profile.id}:${jobId}`;
    const existingDraftId = applicationDraftsByCandidateAndJob.get(draftKey);
    const existingDraft = existingDraftId ? applicationDraftsById.get(existingDraftId) : undefined;

    const { draft, versionSnapshot } = saveApplicationDraft({
      candidateId: profile.id,
      jobId,
      actor: {
        userId: session.userId,
        roles: session.roles,
      },
      resumeId: input.resumeId,
      coverLetter: input.coverLetter,
      answers: input.answers,
      attachedEvidenceIds: input.attachedEvidenceIds,
      stepIndex: input.stepIndex,
      existingDraft,
    });

    applicationDraftsById.set(draft.id, draft);
    applicationDraftsByCandidateAndJob.set(draftKey, draft.id);

    const versions = applicationDraftVersionsByDraftId.get(draft.id) || [];
    versions.push(versionSnapshot);
    applicationDraftVersionsByDraftId.set(draft.id, versions);

    return reply.status(200).send({
      message: 'Application draft saved successfully.',
      draft,
      version: draft.version,
    });
  });

  app.get('/api/v1/jobs/:jobId/draft', async (req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Candidate profile not found.');
    }

    const { jobId } = req.params;
    const draftKey = `${profile.id}:${jobId}`;
    const draftId = applicationDraftsByCandidateAndJob.get(draftKey);
    if (!draftId) {
      throw new DomainError('NOT_FOUND', 'No active application draft found for this job.');
    }

    const draft = applicationDraftsById.get(draftId);
    if (!draft || draft.isSubmitted) {
      throw new DomainError('NOT_FOUND', 'No active application draft found for this job.');
    }

    const versions = applicationDraftVersionsByDraftId.get(draft.id) || [];

    return reply.status(200).send({
      draft,
      versions,
    });
  });

  app.delete('/api/v1/jobs/:jobId/draft', async (req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Candidate profile not found.');
    }

    const { jobId } = req.params;
    const draftKey = `${profile.id}:${jobId}`;
    const draftId = applicationDraftsByCandidateAndJob.get(draftKey);
    if (!draftId) {
      throw new DomainError('NOT_FOUND', 'No active application draft found for this job.');
    }

    applicationDraftsById.delete(draftId);
    applicationDraftsByCandidateAndJob.delete(draftKey);
    applicationDraftVersionsByDraftId.delete(draftId);

    return reply.status(200).send({
      message: 'Application draft discarded successfully.',
    });
  });

  app.post('/api/v1/jobs/:jobId/draft/restore', async (req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Candidate profile not found.');
    }

    const { jobId } = req.params;
    const draftKey = `${profile.id}:${jobId}`;
    const draftId = applicationDraftsByCandidateAndJob.get(draftKey);
    if (!draftId) {
      throw new DomainError('NOT_FOUND', 'No active application draft found for this job.');
    }

    const draft = applicationDraftsById.get(draftId);
    if (!draft || draft.isSubmitted) {
      throw new DomainError('NOT_FOUND', 'No active application draft found for this job.');
    }

    const input = RestoreApplicationDraftVersionInputSchema.parse(req.body);
    const versions = applicationDraftVersionsByDraftId.get(draft.id) || [];

    const restored = restoreApplicationDraftVersion(
      draft,
      input.targetVersion,
      versions,
      {
        userId: session.userId,
        candidateProfileId: profile.id,
      }
    );

    applicationDraftsById.set(restored.draft.id, restored.draft);
    versions.push(restored.versionSnapshot);
    applicationDraftVersionsByDraftId.set(restored.draft.id, versions);

    return reply.status(200).send({
      message: `Application draft restored to version ${input.targetVersion}.`,
      draft: restored.draft,
      version: restored.draft.version,
    });
  });

  app.get('/api/v1/applications/drafts', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Candidate profile not found.');
    }

    const candidateDrafts = Array.from(applicationDraftsById.values())
      .filter((d) => d.candidateId === profile.id && !d.isSubmitted)
      .map((draft) => {
        const job = jobsById.get(draft.jobId);
        return {
          ...draft,
          job: job ? { id: job.id, title: job.title, orgId: job.orgId, location: job.location } : undefined,
        };
      });

    return reply.status(200).send({
      drafts: candidateDrafts,
      total: candidateDrafts.length,
    });
  });

  // Internal test helper for inspecting async job dispatch
  app.get('/api/v1/internal/worker-jobs', async () => {
    return { jobs: enqueuedWorkerJobs };
  });

  return app;
}


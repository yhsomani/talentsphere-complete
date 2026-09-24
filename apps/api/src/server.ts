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

  // Feature Flags Route
  app.get('/api/v1/feature-flags', async () => {
    return {
      flags: {
        FEATURE_LMS: true,
        FEATURE_CODE_ARENA: true,
        FEATURE_MESSAGING: true,
        FEATURE_NOTIFICATIONS: true,
        FEATURE_AI_MATCHING: false,
      },
    };
  });

  // In-memory repositories for modular monolith runtime state
  interface StoredUser {
    id: string;
    email: string;
    roles: ('candidate' | 'recruiter')[];
    passwordHash: string;
    createdAt: string;
  }
  const usersByEmail = new Map<string, StoredUser>();
  const usersById = new Map<string, StoredUser>();
  const profilesByUserId = new Map<string, any>();
  const profilesById = new Map<string, any>();

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

  // Internal test helper for inspecting async job dispatch
  app.get('/api/v1/internal/worker-jobs', async () => {
    return { jobs: enqueuedWorkerJobs };
  });


  return app;
}


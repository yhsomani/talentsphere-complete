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

  // Internal test helper for inspecting async job dispatch
  app.get('/api/v1/internal/worker-jobs', async () => {
    return { jobs: enqueuedWorkerJobs };
  });

  return app;
}


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
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  createProfileEntity,
  updateProfileEntity,
  canViewProfile,
} from '@talentsphere/domain';
import {
  RegisterInputSchema,
  LoginInputSchema,
  UpdateProfileInputSchema,
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

  return app;
}

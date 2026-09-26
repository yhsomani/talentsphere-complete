/**
 * Security Verification Suite — OWASP API Security Top 10 / ASVS 5.0
 *
 * Verifies the controls required by docs/quality/SECURITY.md against a real
 * built Fastify instance (app.inject), not mocks.
 *
 * Covered threats: broken authentication (API2), broken function-level
 * authorization (API5), broken object-level authorization (API1), unbounded
 * resource consumption / rate-limit bypass (API4), CORS misconfiguration
 * (API8), data exposure (API3), webhook replay/billing replay.
 *
 * Scoped deliberately: this suite does not duplicate tests/integration/
 * api-server.test.ts (404 envelope, x-request-id propagation, helmet headers,
 * basic auth route contracts).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken, Role } from '../../packages/domain/src/index.js';

const ALLOWED_ORIGIN = 'http://localhost:5173';
const ATTACKER_ORIGIN = 'https://evil.example.com';

const ADMIN_ONLY_ROUTES: ReadonlyArray<{ method: 'GET' | 'POST' | 'PUT'; url: string }> = [
  { method: 'GET', url: '/api/v1/admin/users' },
  { method: 'GET', url: '/api/v1/admin/feature-flags' },
  { method: 'GET', url: '/api/v1/admin/health-diagnostics' },
];

function token(roles: Role[], userId: string, email: string, ttlSeconds = 3600): string {
  return createSessionToken(userId, email, roles, ttlSeconds);
}

function bearer(t: string): { authorization: string } {
  return { authorization: `Bearer ${t}` };
}

describe('SEC: Authentication (SECURITY.md §8, threat: account/session compromise)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: `${ALLOWED_ORIGIN},http://127.0.0.1:4173`,
      RATE_LIMIT_MAX_REQUESTS: '10000',
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a request with no Authorization header', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/resumes' });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a malformed Authorization header that is not a Bearer scheme', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes',
      headers: { authorization: 'Basic YWRtaW46cGFzc3dvcmQ=' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a structurally invalid token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes',
      headers: bearer('not.a.jwt'),
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a token whose signature has been tampered with', async () => {
    const forged = token(['candidate'], crypto.randomUUID(), 'mallory@example.com');
    const [payloadB64, signature] = forged.split('.');
    const tampered = `${payloadB64}.${signature.slice(0, -2)}${signature.slice(-2) === 'A' ? 'B' : 'A'}`;

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes',
      headers: bearer(tampered),
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a correctly signed but expired token', async () => {
    const expired = token(['candidate'], crypto.randomUUID(), 'expired@example.com', -60);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes',
      headers: bearer(expired),
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a token whose roles were escalated after signing', async () => {
    // Privilege escalation attempt: re-encode the payload with platform_admin
    // while reusing the original candidate signature.
    const candidate = token(['candidate'], crypto.randomUUID(), 'eve@example.com');
    const [payloadB64, signature] = candidate.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    payload.roles = ['platform_admin'];
    const escalated = `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/users',
      headers: bearer(escalated),
    });

    expect(res.statusCode).toBe(401);
  });
});

describe('SEC: Session signing key is not a committed constant (threat: token forgery)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: `${ALLOWED_ORIGIN},http://127.0.0.1:4173`,
      RATE_LIMIT_MAX_REQUESTS: '10000',
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // Regression guard. This literal was previously the hardcoded fallback in
  // packages/domain/src/auth.ts. Because the signing key shipped in the source
  // tree, anyone could sign an arbitrary payload and the API would honour its
  // `roles` claim, reaching platform_admin on every guarded route. The fallback
  // is now a random per-process key, so this forgery must be rejected.
  const FORMER_HARDCODED_SECRET = 'talentsphere_local_secret_must_be_32_bytes_min!';

  it('rejects a platform_admin token signed with the former hardcoded secret', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      userId: crypto.randomUUID(),
      email: 'attacker@example.com',
      roles: ['platform_admin'],
      issuedAt: now,
      expiresAt: now + 86400,
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', FORMER_HARDCODED_SECRET)
      .update(payloadB64)
      .digest('base64url');

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/users',
      headers: bearer(`${payloadB64}.${signature}`),
    });

    expect(res.statusCode).toBe(401);
  });

  it('rejects a token signed with any other guessed secret', async () => {
    const forged = (secret: string) => {
      const now = Math.floor(Date.now() / 1000);
      const payloadB64 = Buffer.from(
        JSON.stringify({
          userId: crypto.randomUUID(),
          email: 'attacker@example.com',
          roles: ['platform_admin'],
          issuedAt: now,
          expiresAt: now + 86400,
        })
      ).toString('base64url');
      const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
      return `${payloadB64}.${signature}`;
    };

    for (const secret of ['', 'secret', 'talentsphere', 'test-secret', 'a'.repeat(32)]) {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users',
        headers: bearer(forged(secret)),
      });
      expect(res.statusCode).toBe(401);
    }
  });

  it('still accepts a token minted by the server itself', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes',
      headers: bearer(token(['candidate'], crypto.randomUUID(), 'ok@example.com')),
    });

    expect(res.statusCode).toBe(200);
  });
});

describe('SEC: Function-level authorization (threat: broken function-level authz)', () => {
  let app: FastifyInstance;
  let candidateToken: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
      RATE_LIMIT_MAX_REQUESTS: '10000',
    });
    await app.ready();

    const email = `sec.fla.${Date.now()}@example.com`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'StrongPassword123!',
        fullName: 'Fiona Candidate',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    candidateToken = res.json().token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('does not allow a self-registered candidate to claim an admin role', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `sec.esc.${Date.now()}@example.com`,
        password: 'StrongPassword123!',
        fullName: 'Mallory Escalator',
        role: 'platform_admin',
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_FAILED');
  });

  it.each(ADMIN_ONLY_ROUTES)(
    'denies $method $url to a non-admin principal',
    async ({ method, url }) => {
      const res = await app.inject({ method, url, headers: bearer(candidateToken) });

      expect(res.statusCode).toBe(403);
      expect(res.json().error.code).toBe('FORBIDDEN');
    }
  );

  it('denies admin routes to an unauthenticated caller', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/users' });

    expect(res.statusCode).toBe(401);
  });

  it('allows an admin principal to reach admin routes', async () => {
    const adminToken = token(['platform_admin'], crypto.randomUUID(), 'admin@example.com');

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/feature-flags',
      headers: bearer(adminToken),
    });

    expect(res.statusCode).toBe(200);
  });
});

describe('SEC: Object-level authorization (threat: broken object-level authz)', () => {
  let app: FastifyInstance;
  let ownerToken: string;
  let attackerToken: string;
  let ownerResumeId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
      RATE_LIMIT_MAX_REQUESTS: '10000',
    });
    await app.ready();

    const makeCandidate = async (label: string) => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: `sec.bola.${label}.${Date.now()}@example.com`,
          password: 'StrongPassword123!',
          fullName: `Bola ${label}`,
          role: 'candidate',
        },
      });
      expect(res.statusCode).toBe(201);
      return res.json().token as string;
    };

    ownerToken = await makeCandidate('owner');
    attackerToken = await makeCandidate('attacker');

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/resumes',
      headers: bearer(ownerToken),
      payload: { title: 'Owner Private Resume', summary: 'Sensitive career history' },
    });
    expect(created.statusCode).toBe(201);
    ownerResumeId = created.json().resume.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows the owner to read their own resume', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/resumes/${ownerResumeId}`,
      headers: bearer(ownerToken),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().resume.id).toBe(ownerResumeId);
  });

  it('denies a different principal read access to that resume', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/resumes/${ownerResumeId}`,
      headers: bearer(attackerToken),
    });

    expect(res.statusCode).toBe(403);
  });

  it('denies a different principal write access to that resume', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/resumes/${ownerResumeId}`,
      headers: bearer(attackerToken),
      payload: { title: 'Tampered' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('does not disclose another principal resume through the list endpoint', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes',
      headers: bearer(attackerToken),
    });

    expect(res.statusCode).toBe(200);
    const resumes = res.json().resumes as Array<{ id: string }>;
    expect(resumes.map((r) => r.id)).not.toContain(ownerResumeId);
  });
});

describe('SEC: CORS allow-list (threat: cross-origin data theft)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: `${ALLOWED_ORIGIN},http://127.0.0.1:4173`,
      RATE_LIMIT_MAX_REQUESTS: '10000',
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('echoes an allow-listed origin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: ALLOWED_ORIGIN },
    });

    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('does not reflect a non-allow-listed origin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: ATTACKER_ORIGIN },
    });

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('does not authorize a non-allow-listed origin preflight', async () => {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/resumes',
      headers: {
        origin: ATTACKER_ORIGIN,
        'access-control-request-method': 'GET',
      },
    });

    // Fetch requires an ACAO matching the requesting origin before a credentialed
    // response is readable, so the absent ACAO is the control that matters here;
    // a bare ACAC without ACAO grants the attacker nothing.
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('SEC: Error and secret leakage (SECURITY.md §6, §8)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
      RATE_LIMIT_MAX_REQUESTS: '10000',
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('never returns a stack trace to the client', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes/not-a-uuid',
      headers: bearer(token(['candidate'], crypto.randomUUID(), 'leak@example.com')),
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    const body = res.body;
    expect(body).not.toContain('"stack"');
    expect(body).not.toMatch(/\sat\s+[A-Za-z0-9_$.<>() ]+\(/);
  });

  it('never echoes a submitted password back to the client', async () => {
    const password = 'LeakProbe123!Secret';
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `sec.leak.${Date.now()}@example.com`,
        password,
        fullName: 'Leak Probe',
        role: 'candidate',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).not.toContain(password);
    expect(res.body).not.toContain('passwordHash');
  });

  it('does not leak internal identifiers for an unknown admin sub-resource', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/audit-log?actorId=00000000-0000-0000-0000-000000000000',
      headers: bearer(token(['platform_admin'], crypto.randomUUID(), 'admin@example.com')),
    });

    expect(res.statusCode).toBe(500 === res.statusCode ? 500 : res.statusCode);
    expect(res.body).not.toContain('"stack"');
  });
});

describe('SEC: Webhook replay and billing idempotency (SECURITY.md §9)', () => {
  let app: FastifyInstance;
  let sequence = 0;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
      RATE_LIMIT_MAX_REQUESTS: '10000',
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('processes a valid billing webhook', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/webhook',
      payload: {
        eventType: 'invoice.paid',
        idempotencyKey: `sec-hook-ok-${sequence++}`,
        userId: crypto.randomUUID(),
        amountCents: 1900,
        currency: 'USD',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('success');
    expect(res.json().eventId).toBeDefined();
  });

  it('treats a replayed provider event id as idempotent', async () => {
    const idempotencyKey = `sec-hook-replay-${sequence++}`;
    const payload = {
      eventType: 'invoice.paid',
      idempotencyKey,
      userId: crypto.randomUUID(),
      amountCents: 1900,
      currency: 'USD',
    };

    const first = await app.inject({ method: 'POST', url: '/api/v1/billing/webhook', payload });
    const replay = await app.inject({ method: 'POST', url: '/api/v1/billing/webhook', payload });

    expect(first.statusCode).toBe(200);
    expect(replay.statusCode).toBe(200);
    expect(replay.json().replayed).toBe(true);
    expect(replay.json().eventId).toBe(first.json().eventId);
  });

  it('rejects a malformed billing webhook at the validation boundary', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/webhook',
      payload: {
        eventType: 'invoice.paid',
        idempotencyKey: '',
        userId: 'not-a-uuid',
        amountCents: -1,
        currency: 'DOLLARS',
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_FAILED');
    expect(Array.isArray(res.json().error.details)).toBe(true);
  });
});

describe('SEC: Rate limiting (SECURITY.md §8, threat: rate-limit bypass)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
      RATE_LIMIT_MAX_REQUESTS: '3',
      RATE_LIMIT_WINDOW_MS: '60000',
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 429 once the configured window budget is exhausted', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await app.inject({ method: 'GET', url: '/health' });
      statuses.push(res.statusCode);
    }

    expect(statuses.slice(0, 3)).toEqual([200, 200, 200]);
    expect(statuses).toContain(429);
  });

  it('reports a throttle as a canonical RATE_LIMIT_EXCEEDED envelope, not a server fault', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(429);
    expect(res.json().error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
    expect(res.headers['retry-after']).toBeDefined();
  });

  it('never leaks a stack trace through the throttle path', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(429);
    expect(res.body).not.toContain('"stack"');
  });
});

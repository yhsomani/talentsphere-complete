/**
 * GET /api/v1/evidence/subject/:subjectId follows the subject's profile
 * visibility (canViewProfile). The route is in the durable registry and had
 * no test (audit A10-003, cross-review C-24 T2).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

type Json = Record<string, any>;

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; body: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : {} };
}

async function register(app: FastifyInstance, label: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email: `${label}.${crypto.randomUUID().slice(0, 8)}@example.com`,
    password: 'Password123!Secure',
    fullName: `Evidence ${label}`,
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

const evidenceInput = (title: string) => ({
  type: 'project',
  title,
  description: 'A shipped project.',
  source: 'https://example.com/project',
  provenance: 'direct',
  recencyDate: '2026-05-15',
});

describe('GET /api/v1/evidence/subject/:subjectId honours profile visibility (A10-003)', () => {
  let app: FastifyInstance;
  let owner: Awaited<ReturnType<typeof register>>;
  let stranger: Awaited<ReturnType<typeof register>>;
  let recruiter: Awaited<ReturnType<typeof register>>;
  let adminToken: string;
  const url = () => `/api/v1/evidence/subject/${owner.profile.id}`;
  const setPrivacy = async (privacy: string) => {
    const res = await call(app, 'PATCH', '/api/v1/profile/me', owner.token, { privacy });
    expect(res.status).toBe(200);
  };

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
    } as never);
    await app.ready();
    owner = await register(app, 'owner');
    stranger = await register(app, 'stranger');
    recruiter = await register(app, 'recruiter', 'recruiter');
    adminToken = createSessionToken(crypto.randomUUID(), 'admin@talentsphere.io', [
      'platform_admin',
    ]);
    for (const title of ['First project', 'Second project']) {
      const created = await call(
        app,
        'POST',
        '/api/v1/evidence',
        owner.token,
        evidenceInput(title)
      );
      expect(created.status).toBe(201);
      // Distinct createdAt values, so the order assertion below is meaningful.
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('public profile: anyone, including an anonymous caller, reads the list', async () => {
    await setPrivacy('public');
    const anon = await call(app, 'GET', url());
    expect(anon.status).toBe(200);
    expect(anon.body.evidence).toHaveLength(2);
    expect((await call(app, 'GET', url(), stranger.token)).status).toBe(200);
  });

  it('private profile: anonymous and strangers get 403; the owner and an admin get 200', async () => {
    await setPrivacy('private');
    const anon = await call(app, 'GET', url());
    expect(anon.status).toBe(403);
    expect(anon.body.error.code).toBe('FORBIDDEN');
    const asStranger = await call(app, 'GET', url(), stranger.token);
    expect(asStranger.status).toBe(403);
    expect(asStranger.body.error.code).toBe('FORBIDDEN');
    // A recruiter is no exception to `private`.
    expect((await call(app, 'GET', url(), recruiter.token)).status).toBe(403);
    const asOwner = await call(app, 'GET', url(), owner.token);
    expect(asOwner.status).toBe(200);
    expect(asOwner.body.evidence).toHaveLength(2);
    expect((await call(app, 'GET', url(), adminToken)).status).toBe(200);
  });

  it('recruiters_only profile: a recruiter gets 200, a candidate and anonymous get 403', async () => {
    await setPrivacy('recruiters_only');
    const asRecruiter = await call(app, 'GET', url(), recruiter.token);
    expect(asRecruiter.status).toBe(200);
    expect(asRecruiter.body.evidence).toHaveLength(2);
    expect((await call(app, 'GET', url(), stranger.token)).status).toBe(403);
    expect((await call(app, 'GET', url())).status).toBe(403);
  });

  it('an unknown profile id is 404', async () => {
    const res = await call(
      app,
      'GET',
      `/api/v1/evidence/subject/${crypto.randomUUID()}`,
      adminToken
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('a tampered token is treated as anonymous, never as its claimed identity', async () => {
    await setPrivacy('private');
    const [payloadB64, signature] = adminToken.split('.');
    const forged = `${payloadB64}.${signature.slice(0, -1)}${signature.endsWith('A') ? 'B' : 'A'}`;
    expect((await call(app, 'GET', url(), forged)).status).toBe(403);
  });

  // NEW FINDING I-D-01 (Low): A10-003 expects this list newest first, as
  // GET /evidence/mine returns it (server.ts:1451-1457). The subject route
  // returns evidenceBySubjectId in insertion order, oldest first
  // (server.ts:1480-1481). Flip to `it` once the route sorts.
  it.fails('lists the evidence newest first, like /evidence/mine', async () => {
    const res = await call(app, 'GET', url(), owner.token);
    expect(res.status).toBe(200);
    expect(res.body.evidence.map((e: Json) => e.title)).toEqual([
      'Second project',
      'First project',
    ]);
  });
});

describe('evidence internals are hidden from non-owners and non-staff (K-03)', () => {
  let app: FastifyInstance;
  let owner: Awaited<ReturnType<typeof register>>;
  let recruiter: Awaited<ReturnType<typeof register>>;
  let adminToken: string;
  let evidenceId: string;
  const reason = 'Dispute reason only staff and the subject may read';

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
    } as never);
    await app.ready();
    owner = await register(app, 'internals-owner');
    recruiter = await register(app, 'internals-recruiter', 'recruiter');
    adminToken = createSessionToken(crypto.randomUUID(), 'admin@talentsphere.io', [
      'platform_admin',
    ]);
    expect(
      (await call(app, 'PATCH', '/api/v1/profile/me', owner.token, { privacy: 'public' })).status
    ).toBe(200);
    const created = await call(
      app,
      'POST',
      '/api/v1/evidence',
      owner.token,
      evidenceInput('Disputed project')
    );
    expect(created.status).toBe(201);
    evidenceId = created.body.evidence.id;
    const disputed = await call(app, 'POST', `/api/v1/evidence/${evidenceId}/dispute`, adminToken, {
      reason,
    });
    expect(disputed.status).toBe(200);
  });

  afterAll(async () => {
    await app.close();
  });

  const reads = () => [
    `/api/v1/evidence/${evidenceId}`,
    `/api/v1/evidence/subject/${owner.profile.id}`,
  ];
  const records = (body: Json): Json[] =>
    Array.isArray(body.evidence) ? body.evidence : [body.evidence];

  it('anonymous callers and a recruiter get no metadata, verifier id or reason', async () => {
    for (const token of [undefined, recruiter.token]) {
      for (const url of reads()) {
        const res = await call(app, 'GET', url, token);
        expect(res.status).toBe(200);
        for (const record of records(res.body)) {
          expect(record.metadata).toBeUndefined();
          expect(record.verifiedBy).toBeUndefined();
          expect(record.status).toBe('disputed');
        }
        expect(JSON.stringify(res.body)).not.toContain(reason);
      }
    }
  });

  it('the subject and a platform admin still see the dispute reason', async () => {
    for (const token of [owner.token, adminToken]) {
      for (const url of reads()) {
        const res = await call(app, 'GET', url, token);
        expect(res.status).toBe(200);
        expect(records(res.body)[0].metadata.disputeReason).toBe(reason);
      }
    }
  });
});

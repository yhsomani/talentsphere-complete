/**
 * Regression suite for authorization defects found in the 2026-10-10 audit
 * (docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md). Each test reproduces the
 * original exploit and asserts it is now refused.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { DURABLE_ROUTES } from '../../apps/api/src/durability.js';

type Json = Record<string, any>;

const boot = (overrides: Record<string, string> = {}) =>
  buildApp({
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    RATE_LIMIT_MAX_REQUESTS: '100000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    ...overrides,
  } as never);

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; body: Json; headers: Record<string, unknown> }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return {
    status: res.statusCode,
    body: res.body ? JSON.parse(res.body) : {},
    headers: res.headers as Record<string, unknown>,
  };
}

async function register(app: FastifyInstance, email: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: 'a-long-enough-passphrase',
    fullName: email.split('@')[0],
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

async function orgWithJob(app: FastifyInstance, token: string, slug: string) {
  const org = await call(app, 'POST', '/api/v1/organizations', token, { name: slug, slug });
  expect(org.status).toBe(201);
  const job = await call(app, 'POST', '/api/v1/jobs', token, {
    orgId: org.body.organization.id,
    title: 'Backend Engineer',
    description: 'Build and run the API platform.',
    location: 'Remote',
  });
  expect(job.status).toBe(201);
  return { orgId: org.body.organization.id as string, jobId: job.body.job.id as string };
}

describe('SEC: tenant isolation on job postings (BR-12)', () => {
  let app: FastifyInstance;
  let alice: Json;
  let mallory: Json;
  let aliceJob: Json;

  beforeAll(async () => {
    app = await boot();
    alice = await register(app, 'alice@acme.example', 'recruiter');
    mallory = await register(app, 'mallory@rival.example', 'recruiter');
    aliceJob = await orgWithJob(app, alice.token, 'acme');
    await orgWithJob(app, mallory.token, 'rival');
  });
  afterAll(() => app.close());

  it("refuses a recruiter changing another company's job status", async () => {
    // Exploit: the handler used to pass the JOB's orgId as the actor's, so
    // the domain's "same organization" check always passed.
    const res = await call(app, 'PATCH', `/api/v1/jobs/${aliceJob.jobId}/status`, mallory.token, {
      status: 'archived',
    });
    expect(res.status).toBe(403);
    const still = await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`, alice.token);
    expect(still.body.job.status).toBe('draft');
  });

  it('hides unpublished postings from everyone outside the hiring organization', async () => {
    expect((await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`)).status).toBe(404);
    expect((await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`, mallory.token)).status).toBe(
      404
    );
    expect((await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`, alice.token)).status).toBe(
      200
    );
  });

  it("refuses listing another organization's jobs", async () => {
    const res = await call(
      app,
      'GET',
      `/api/v1/organizations/${aliceJob.orgId}/jobs`,
      mallory.token
    );
    expect(res.status).toBe(403);
    const own = await call(app, 'GET', `/api/v1/organizations/${aliceJob.orgId}/jobs`, alice.token);
    expect(own.status).toBe(200);
    expect(own.body.jobs).toHaveLength(1);
  });
});

describe('SEC: organization membership grants', () => {
  let app: FastifyInstance;
  let owner: Json;
  let colleague: Json;
  let orgId: string;

  beforeAll(async () => {
    app = await boot();
    owner = await register(app, 'owner@acme.example', 'recruiter');
    colleague = await register(app, 'colleague@acme.example', 'recruiter');
    orgId = (await orgWithJob(app, owner.token, 'acme-members')).orgId;
  });
  afterAll(() => app.close());

  it('does not let ownership be granted through the member endpoint', async () => {
    const res = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: colleague.user.id,
      role: 'owner',
    });
    expect(res.status).toBe(400);
  });

  it('refuses unknown accounts and duplicate memberships', async () => {
    const unknown = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: '00000000-0000-4000-a000-0000000000ff',
    });
    expect(unknown.status).toBe(404);

    const first = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: colleague.user.id,
      role: 'recruiter',
    });
    expect(first.status).toBe(201);
    const again = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: colleague.user.id,
    });
    expect(again.status).toBe(409);
  });

  it('only owners and admins may add members', async () => {
    const outsider = await register(app, 'outsider@acme.example', 'recruiter');
    const res = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, colleague.token, {
      userId: outsider.user.id,
    });
    expect(res.status).toBe(403);
  });
});

describe('SEC: account state is enforced on every request, not at token expiry', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    app = await boot();
    adminId = '00000000-0000-4000-a000-00000000ad99';
    adminToken = createSessionToken(adminId, 'root@talentsphere.internal', ['platform_admin']);
  });
  afterAll(() => app.close());

  it('confines a suspended account to its appeal and data-rights routes', async () => {
    const user = await register(app, 'suspended@example.com');
    const suspend = await call(
      app,
      'PATCH',
      `/api/v1/admin/users/${user.user.id}/status`,
      adminToken,
      {
        status: 'suspended',
        reason: 'Under investigation for spam',
      }
    );
    expect(suspend.status).toBe(200);

    // The token issued before the suspension no longer opens normal routes...
    const blocked = await call(app, 'POST', '/api/v1/evidence', user.token, {
      type: 'project',
      title: 'Anything',
      description: '',
      source: 'x',
      provenance: 'x',
      recencyDate: '2026-01-01',
    });
    expect(blocked.status).toBe(403);
    // ...but the governed-review path stays open (SSOT: restrictions require appeal).
    expect((await call(app, 'GET', '/api/v1/moderation/reports/my', user.token)).status).toBe(200);
    expect((await call(app, 'GET', '/api/v1/profile/me', user.token)).status).toBe(200);

    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'suspended@example.com',
      password: 'a-long-enough-passphrase',
    });
    expect(login.status).toBe(200);
    expect(login.body.user.status).toBe('suspended');
  });

  it('applies a role change to existing sessions immediately', async () => {
    const recruiter = await register(app, 'demoted@example.com', 'recruiter');
    const org = await call(app, 'POST', '/api/v1/organizations', recruiter.token, {
      name: 'Demo',
      slug: 'demoted-org',
    });
    const demote = await call(
      app,
      'PATCH',
      `/api/v1/admin/users/${recruiter.user.id}/roles`,
      adminToken,
      {
        roles: ['candidate'],
      }
    );
    expect(demote.status).toBe(200);

    const post = await call(app, 'POST', '/api/v1/jobs', recruiter.token, {
      orgId: org.body.organization.id,
      title: 'Should not post',
      description: 'The poster lost the recruiter role.',
      location: 'Remote',
    });
    expect(post.status).toBe(403);
  });

  it('rejects roles the domain does not define', async () => {
    const user = await register(app, 'roles@example.com');
    const res = await call(app, 'PATCH', `/api/v1/admin/users/${user.user.id}/roles`, adminToken, {
      roles: ['superuser'],
    });
    expect(res.status).toBe(400);
  });
});

describe('SEC: credential endpoints have their own rate limit', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await boot({ AUTH_RATE_LIMIT_MAX_REQUESTS: '3' });
    await register(app, 'target@example.com');
  });
  afterAll(() => app.close());

  it('throttles repeated guesses against one account', async () => {
    const guess = () =>
      call(app, 'POST', '/api/v1/auth/login', undefined, {
        email: 'target@example.com',
        password: 'wrong-guess',
      });
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await guess()).status);
    expect(statuses).toEqual([401, 401, 401, 429]);

    // A different account from the same client is not locked out with it.
    const other = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'someone-else@example.com',
      password: 'whatever',
    });
    expect(other.status).toBe(401);
  });
});

describe('SEC: evidence writes are all-or-nothing', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await boot();
  });
  afterAll(() => app.close());

  it('stores nothing when a referenced skill does not exist', async () => {
    const user = await register(app, 'atomic@example.com');
    const res = await call(app, 'POST', '/api/v1/evidence', user.token, {
      type: 'project',
      title: 'Half-written evidence',
      description: '',
      source: 'x',
      provenance: 'x',
      recencyDate: '2026-01-01',
      skillIds: ['00000000-0000-4000-a000-0000000000aa'],
    });
    expect(res.status).toBe(404);
    const mine = await call(app, 'GET', '/api/v1/evidence/mine', user.token);
    expect(mine.body.evidence).toHaveLength(0);
  });
});

describe('Durability is stated, not implied (ADR-015)', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await boot();
    await app.ready();
  });
  afterAll(() => app.close());

  it('every route in the durable registry exists', () => {
    for (const key of DURABLE_ROUTES) {
      const [method, url] = key.split(' ');
      expect(app.hasRoute({ method: method as never, url }), key).toBe(true);
    }
  });

  it('marks every API response ephemeral when the server runs without a database', async () => {
    const res = await call(app, 'GET', '/api/v1/jobs');
    expect(res.headers['x-talentsphere-durability']).toBe('ephemeral');
  });
});

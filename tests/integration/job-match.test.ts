/**
 * Explained job match (plan TS-13, §7.2 acceptance 1 and 2): a posting's
 * required skills are compared with the signed-in person's skill profile,
 * skill by skill, naming the records each rests on. Verifying evidence raises
 * the match; revoking it removes its effect. There is no score.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

type Json = Record<string, any>;

const TS = '10000000-0000-4000-a000-000000000001';
const SQL = '10000000-0000-4000-a000-000000000003';
const OTHER = '10000000-0000-4000-a000-000000000004';

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

async function register(app: FastifyInstance, email: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: 'a-long-enough-passphrase',
    fullName: email.split('@')[0],
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string };
}

describe('Explained job match (TS-13)', () => {
  let app: FastifyInstance;
  let recruiter: string;
  let candidate: string;
  let jobId: string;
  let draftId: string;
  const admin = createSessionToken(
    'a0000000-0000-4000-a000-000000000091',
    'admin@talentsphere.io',
    ['platform_admin']
  );
  const match = async (id = jobId, token = candidate) =>
    call(app, 'GET', `/api/v1/jobs/${id}/match`, token);

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    } as never);
    recruiter = (await register(app, 'rhea@match.example', 'recruiter')).token;
    candidate = (await register(app, 'cam@match.example')).token;
    const org = await call(app, 'POST', '/api/v1/organizations', recruiter, {
      name: 'Match Co',
      slug: 'match-co',
    });
    const orgId = org.body.organization.id;
    const job = await call(app, 'POST', '/api/v1/jobs', recruiter, {
      orgId,
      title: 'Data Engineer',
      description: 'Build the reporting warehouse.',
      location: 'Remote',
      requiredSkillIds: [SQL, TS, OTHER],
    });
    expect(job.status).toBe(201);
    jobId = job.body.job.id;
    await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, recruiter, { status: 'published' });
    const draft = await call(app, 'POST', '/api/v1/jobs', recruiter, {
      orgId,
      title: 'Hidden draft',
      description: 'Not published.',
      location: 'Remote',
    });
    draftId = draft.body.job.id;
  });
  afterAll(() => app.close());

  it('lists every required skill as not shown yet for an empty profile', async () => {
    const res = await match();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ required: 3, shown: 0, verified: 0 });
    expect(res.body.skills.map((s: Json) => [s.skillId, s.shown])).toEqual([
      [SQL, false],
      [TS, false],
      [OTHER, false],
    ]);
    expect(res.body.skills[0].name).toEqual(expect.any(String));
  });

  it('names the evidence behind a shown skill, raises it when verified and drops it when revoked', async () => {
    const created = await call(app, 'POST', '/api/v1/evidence', candidate, {
      type: 'project',
      title: 'Reporting warehouse',
      description: 'Built and shipped.',
      source: 'https://example.com/repo',
      provenance: 'github_repository',
      recencyDate: '2026-05-15',
      skillIds: [SQL],
    });
    expect(created.status).toBe(201);
    const evidenceId = created.body.evidence.id;

    let res = await match();
    expect(res.body).toMatchObject({ required: 3, shown: 1, verified: 0 });
    expect(res.body.skills[0]).toMatchObject({
      skillId: SQL,
      shown: true,
      strongestRung: 'unverified',
      sources: [{ sourceRef: evidenceId, rung: 'unverified', title: 'Reporting warehouse' }],
    });

    const verified = await call(app, 'POST', `/api/v1/evidence/${evidenceId}/verify`, admin, {
      verificationLevel: 'authority_verified',
    });
    expect(verified.status).toBe(200);
    res = await match();
    expect(res.body).toMatchObject({ shown: 1, verified: 1 });
    expect(res.body.skills[0].strongestRung).toBe('authority_verified');

    const revoked = await call(app, 'POST', `/api/v1/evidence/${evidenceId}/revoke`, candidate, {
      reason: 'Posted to the wrong account.',
    });
    expect(revoked.status).toBe(200);
    res = await match();
    expect(res.body).toMatchObject({ shown: 0, verified: 0 });
    expect(res.body.skills[0]).toMatchObject({ skillId: SQL, shown: false, sources: [] });
  });

  it('hides an unpublished posting from people outside the organization', async () => {
    expect((await match(draftId)).status).toBe(404);
    expect((await match(draftId, recruiter)).status).toBe(200);
  });

  it('needs a session', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/jobs/${jobId}/match` });
    expect(res.statusCode).toBe(401);
  });
});

/**
 * Career goal v1 (plan TS-13, §6.5, ADR-034): a person names a target role,
 * sees the skills live postings for it require with how they meet each, and
 * one next step per skill. A step is done as soon as its signal lands.
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
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
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

describe('Career goal (TS-13)', () => {
  let app: FastifyInstance;
  let recruiter: string;
  let candidate: string;
  let other: string;
  const admin = createSessionToken(
    'a0000000-0000-4000-a000-000000000091',
    'admin@talentsphere.io',
    ['platform_admin']
  );
  const goal = (token = candidate) => call(app, 'GET', '/api/v1/goals/mine', token);

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    } as never);
    recruiter = (await register(app, 'rhea@goal.example', 'recruiter')).token;
    candidate = (await register(app, 'cam@goal.example')).token;
    other = (await register(app, 'olu@goal.example')).token;
    const org = await call(app, 'POST', '/api/v1/organizations', recruiter, {
      name: 'Goal Co',
      slug: 'goal-co',
    });
    const orgId = org.body.organization.id;
    const post = async (title: string, requiredSkillIds: string[], publish = true) => {
      const job = await call(app, 'POST', '/api/v1/jobs', recruiter, {
        orgId,
        title,
        description: 'A role on the data team.',
        location: 'Remote',
        requiredSkillIds,
      });
      expect(job.status, JSON.stringify(job.body)).toBe(201);
      if (publish) {
        await call(app, 'PATCH', `/api/v1/jobs/${job.body.job.id}/status`, recruiter, {
          status: 'published',
        });
      }
    };
    await post('Data Engineer', [SQL, TS]);
    await post('Senior Data Engineer', [SQL]);
    await post('Data Engineer (draft)', [OTHER], false);
    await post('Frontend Developer', [OTHER]);
  });
  afterAll(() => app.close());

  it('has no goal until one is set', async () => {
    const res = await goal();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ goal: null, plan: null });
  });

  it('lists the skills matching published postings need, most needed first', async () => {
    const set = await call(app, 'PUT', '/api/v1/goals/mine', candidate, { title: 'data engineer' });
    expect(set.status).toBe(200);
    expect(set.body.goal.title).toBe('data engineer');
    expect(set.body.plan).toMatchObject({ matchingPostings: 2, shown: 0, verified: 0 });
    expect(
      set.body.plan.skills.map((s: Json) => [s.skillId, s.requiredBy, s.nextStep?.kind])
    ).toEqual([
      [SQL, 2, 'show'],
      [TS, 1, 'show'],
    ]);
    expect(set.body.plan.skills[0].name).toEqual(expect.any(String));
  });

  it('moves a step on as soon as its signal lands, and back when the evidence is revoked', async () => {
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
    let sql = (await goal()).body.plan.skills[0];
    expect(sql).toMatchObject({
      skillId: SQL,
      shown: true,
      nextStep: { kind: 'verify', produces: 'peer_reviewed' },
      sources: [{ sourceRef: evidenceId, title: 'Reporting warehouse' }],
    });

    await call(app, 'POST', `/api/v1/evidence/${evidenceId}/verify`, admin, {
      verificationLevel: 'peer_reviewed',
    });
    sql = (await goal()).body.plan.skills[0];
    expect(sql).toMatchObject({ strongestRung: 'peer_reviewed', nextStep: null });

    await call(app, 'POST', `/api/v1/evidence/${evidenceId}/revoke`, candidate, {
      reason: 'Posted to the wrong account.',
    });
    sql = (await goal()).body.plan.skills[0];
    expect(sql).toMatchObject({ shown: false, nextStep: { kind: 'show' } });
  });

  it('is private to its owner', async () => {
    expect((await goal(other)).body).toEqual({ goal: null, plan: null });
  });

  it('validates the title, clears the goal and needs a session', async () => {
    expect((await call(app, 'PUT', '/api/v1/goals/mine', candidate, { title: 'x' })).status).toBe(
      400
    );
    expect(
      (await call(app, 'PUT', '/api/v1/goals/mine', candidate, { title: 'ok', extra: 1 })).status
    ).toBe(400);
    expect((await call(app, 'DELETE', '/api/v1/goals/mine', candidate)).status).toBe(204);
    expect((await goal()).body).toEqual({ goal: null, plan: null });
    expect((await app.inject({ method: 'GET', url: '/api/v1/goals/mine' })).statusCode).toBe(401);
  });
});

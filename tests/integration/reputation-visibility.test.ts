import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

/**
 * BR-167 (audit finding F-01): reputation is private by default. The candidate,
 * a platform admin, and a hiring account whose organization the candidate
 * applied to may read it. Other recruiters are refused.
 */
describe('Reputation visibility (BR-167, audit F-01)', () => {
  let app: FastifyInstance;
  const run = Date.now().toString(36);
  let candidateToken: string;
  let candidateUserId: string;
  let appliedRecruiterToken: string;
  let unrelatedRecruiterToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    });
    await app.ready();

    const register = async (email: string, fullName: string, role: string) => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: { email, password: 'Password123!Secure', fullName, role },
      });
      expect(res.statusCode).toBe(201);
      return JSON.parse(res.body) as { token: string; user: { id: string } };
    };

    const candidate = await register(
      `rv.candidate.${run}@example.com`,
      'Casey Candidate',
      'candidate'
    );
    candidateToken = candidate.token;
    candidateUserId = candidate.user.id;
    const applied = await register(`rv.applied.${run}@cloudcorp.io`, 'Avi Applied', 'recruiter');
    appliedRecruiterToken = applied.token;
    const unrelated = await register(`rv.other.${run}@otherco.io`, 'Oz Unrelated', 'recruiter');
    unrelatedRecruiterToken = unrelated.token;
    adminToken = createSessionToken(
      '00000000-0000-4000-a000-0000000000f1',
      `rv.admin.${run}@talentsphere.internal`,
      ['platform_admin']
    );

    // The applied recruiter publishes a job; the candidate applies to it.
    const org = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${appliedRecruiterToken}` },
      payload: {
        name: `Visibility Co ${run}`,
        slug: `visibility-co-${run}`,
        website: 'https://visibility.example',
        description: 'Hiring team used by the reputation visibility tests.',
      },
    });
    expect(org.statusCode).toBe(201);
    const orgId = JSON.parse(org.body).organization.id;

    const job = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${appliedRecruiterToken}` },
      payload: {
        orgId,
        title: `Reputation Reviewer ${run}`,
        description: 'Review code and quality signals for the hiring team.',
        location: 'Remote',
      },
    });
    expect(job.statusCode).toBe(201);
    const jobId = JSON.parse(job.body).job.id;

    const publish = await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: { authorization: `Bearer ${appliedRecruiterToken}` },
      payload: { status: 'published' },
    });
    expect(publish.statusCode).toBe(200);

    const apply = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { coverLetter: 'Interested in this role.' },
    });
    expect(apply.statusCode).toBe(201);
  });

  afterAll(async () => {
    await app.close();
  });

  const read = (token: string) =>
    app.inject({
      method: 'GET',
      url: `/api/v1/reputation/users/${candidateUserId}`,
      headers: { authorization: `Bearer ${token}` },
    });

  it('lets the candidate read their own reputation', async () => {
    expect((await read(candidateToken)).statusCode).toBe(200);
  });

  it('lets a hiring account read reputation of a candidate who applied to its organization', async () => {
    const res = await read(appliedRecruiterToken);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).scores).toBeDefined();
  });

  it('refuses a recruiter whose organization has no application from the candidate', async () => {
    expect((await read(unrelatedRecruiterToken)).statusCode).toBe(403);
  });

  it('lets a platform admin read reputation for compliance', async () => {
    expect((await read(adminToken)).statusCode).toBe(200);
  });
});

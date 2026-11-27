import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

// The member's organization role decides what they may do (TS-04, ADR-032;
// conflicts CF-14, CF-45). Before this, any membership allowed everything.
describe('Organization roles (TS-04)', () => {
  let app: FastifyInstance;
  const tokens: Record<string, string> = {};
  const userIds: Record<string, string> = {};
  let orgId: string;
  let jobId: string;
  let applicationId: string;

  const call = async (
    method: 'GET' | 'POST' | 'PATCH',
    url: string,
    who: string,
    payload?: unknown
  ) => {
    const res = await app.inject({
      method,
      url,
      headers: { authorization: `Bearer ${tokens[who]}` },
      payload: payload as never,
    });
    return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : {} };
  };
  const register = async (who: string, role: 'candidate' | 'recruiter') => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `${who}@roles.example`,
        password: 'Password123!Secure',
        fullName: who,
        role,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    tokens[who] = body.token;
    userIds[who] = body.user.id;
  };
  const newJob = (who: string) =>
    call('POST', '/api/v1/jobs', who, {
      orgId,
      title: `Role test job by ${who}`,
      description: 'A job used to test organization roles.',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
    });

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: '0' });
    await app.ready();
    await register('owner', 'recruiter');
    for (const who of ['admin', 'recruiter', 'hiring_manager', 'member'])
      await register(who, 'recruiter');
    await register('candidate', 'candidate');

    const org = await call('POST', '/api/v1/organizations', 'owner', {
      name: 'Role Test Labs',
      slug: 'role-test-labs',
    });
    expect(org.status).toBe(201);
    orgId = org.body.organization.id;
    for (const role of ['admin', 'recruiter', 'hiring_manager', 'member']) {
      const added = await call('POST', `/api/v1/organizations/${orgId}/members`, 'owner', {
        userId: userIds[role],
        role,
      });
      expect(added.status).toBe(201);
    }

    const job = await newJob('owner');
    expect(job.status).toBe(201);
    jobId = job.body.job.id;
    expect(
      (await call('PATCH', `/api/v1/jobs/${jobId}/status`, 'owner', { status: 'published' })).status
    ).toBe(200);
    const applied = await call('POST', `/api/v1/jobs/${jobId}/apply`, 'candidate', {
      coverLetter: 'Please consider me.',
    });
    expect(applied.status).toBe(201);
    applicationId = applied.body.application.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets every member see the organization’s jobs', async () => {
    for (const who of ['admin', 'recruiter', 'hiring_manager', 'member']) {
      expect((await call('GET', `/api/v1/organizations/${orgId}/jobs`, who)).status).toBe(200);
    }
  });

  it('tells each member what their role allows', async () => {
    const permissions = async (who: string) =>
      (await call('GET', '/api/v1/organizations/mine', who)).body.organizations[0].permissions;
    expect(await permissions('member')).toEqual(['view_jobs']);
    expect(await permissions('hiring_manager')).toEqual(['view_jobs', 'review_candidates']);
    expect(await permissions('owner')).toEqual([
      'view_jobs',
      'manage_jobs',
      'review_candidates',
      'manage_organization',
    ]);
  });

  it('lets only owners, admins and recruiters post and change jobs', async () => {
    expect((await newJob('admin')).status).toBe(201);
    const byRecruiter = await newJob('recruiter');
    expect(byRecruiter.status).toBe(201);
    expect((await newJob('hiring_manager')).status).toBe(403);
    expect((await newJob('member')).status).toBe(403);
    const draftId = byRecruiter.body.job.id;
    // A draft is visible to every member, but only job managers can change it.
    expect((await call('GET', `/api/v1/jobs/${draftId}`, 'member')).status).toBe(200);
    expect(
      (
        await call('PATCH', `/api/v1/jobs/${draftId}/status`, 'hiring_manager', {
          status: 'published',
        })
      ).status
    ).toBe(403);
  });

  it('keeps applicants from members whose role does not review candidates', async () => {
    expect((await call('GET', `/api/v1/jobs/${jobId}/applications`, 'member')).status).toBe(403);
    expect((await call('GET', `/api/v1/applications/${applicationId}`, 'member')).status).toBe(403);
    expect(
      (
        await call('POST', `/api/v1/applications/${applicationId}/transition`, 'member', {
          applicationId,
          targetState: 'in_review',
        })
      ).status
    ).toBe(403);
    expect((await call('GET', `/api/v1/jobs/${jobId}/applications`, 'hiring_manager')).status).toBe(
      200
    );
    const moved = await call(
      'POST',
      `/api/v1/applications/${applicationId}/transition`,
      'hiring_manager',
      {
        applicationId,
        targetState: 'in_review',
      }
    );
    expect(moved.status).toBe(200);
  });

  it('notifies only members who review candidates about a new application', async () => {
    const notices = async (who: string) =>
      ((await call('GET', '/api/v1/notifications', who)).body.notifications ?? []) as unknown[];
    expect((await notices('recruiter')).length).toBeGreaterThan(0);
    expect(await notices('member')).toEqual([]);
  });

  it('lets only owners and admins add members', async () => {
    await register('newcomer', 'candidate');
    for (const who of ['recruiter', 'hiring_manager', 'member']) {
      const res = await call('POST', `/api/v1/organizations/${orgId}/members`, who, {
        userId: userIds.newcomer,
        role: 'member',
      });
      expect(res.status).toBe(403);
    }
    const byAdmin = await call('POST', `/api/v1/organizations/${orgId}/members`, 'admin', {
      userId: userIds.newcomer,
      role: 'member',
    });
    expect(byAdmin.status).toBe(201);
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

// A job can state the experience it asks for (TS-09, finding P-07).
describe('Job experience level (TS-09)', () => {
  let app: FastifyInstance;
  let token: string;
  let orgId: string;

  const post = (payload: Record<string, unknown>) =>
    app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        orgId,
        title: 'Data Intern',
        description: 'Learn data engineering on real pipelines.',
        location: 'Remote',
        jobType: 'internship',
        ...payload,
      },
    });

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: '0' });
    await app.ready();
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'experience.level@example.com',
        password: 'Password123!Secure',
        fullName: 'Exp Recruiter',
        role: 'recruiter',
      },
    });
    token = JSON.parse(reg.body).token;
    const org = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'Experience Labs', slug: 'experience-labs' },
    });
    orgId = JSON.parse(org.body).organization.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('stores the level and shows it on the public listing', async () => {
    const created = await post({ experienceLevel: 'fresher' });
    expect(created.statusCode).toBe(201);
    const job = JSON.parse(created.body).job;
    expect(job.experienceLevel).toBe('fresher');
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${job.id}/status`,
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'published' },
    });
    const listed = JSON.parse((await app.inject({ method: 'GET', url: '/api/v1/jobs' })).body).jobs;
    expect(listed.find((j: { id: string }) => j.id === job.id).experienceLevel).toBe('fresher');
  });

  it('leaves the level unset when none is given, and refuses an unknown one', async () => {
    const unset = await post({});
    expect(unset.statusCode).toBe(201);
    expect(JSON.parse(unset.body).job.experienceLevel).toBeUndefined();
    expect((await post({ experienceLevel: 'expert' })).statusCode).toBe(400);
  });
});

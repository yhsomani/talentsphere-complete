import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { createPublishedCourse } from '../helpers/content.js';

// Client-supplied trust flags and foreign ids must be validated server-side.
describe('Route trust flags: review verification and resume ownership', () => {
  let app: FastifyInstance;
  const stamp = Date.now();

  type Account = { token: string; userId: string };
  const register = async (label: string, role = 'candidate'): Promise<Account> => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `${label}.${stamp}@example.com`,
        password: 'Password123!Secure',
        fullName: `Trust ${label}`,
        role,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    return { token: body.token, userId: body.user.id };
  };
  const auth = (a: Account) => ({ authorization: `Bearer ${a.token}` });

  let instructor: Account;
  let enrolled: Account;
  let outsider: Account;
  let other: Account;
  let recruiter: Account;
  let jobId: string;
  let referrerUserId: string;
  let outsiderResumeId: string;
  let ownResumeId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    });
    await app.ready();

    instructor = await register('trust.instructor');
    enrolled = await register('trust.enrolled');
    outsider = await register('trust.outsider');
    other = await register('trust.other');
    recruiter = await register('trust.recruiter', 'recruiter');
    const referrer = await register('trust.referrer');
    referrerUserId = referrer.userId;

    const adminToken = createSessionToken(
      '00000000-0000-4000-a000-0000000000d7',
      'admin.trust@talentsphere.internal',
      ['platform_admin']
    );
    const promoted = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${instructor.userId}/roles`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { roles: ['candidate', 'instructor'] },
    });
    expect(promoted.statusCode).toBe(200);

    const course = await createPublishedCourse(app, instructor.token, `trust-flags-${stamp}`);
    const enroll = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${course.id}/enroll`,
      headers: auth(enrolled),
    });
    expect(enroll.statusCode).toBe(201);

    // Job at an org the referrer belongs to, for the referral route.
    const org = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: auth(recruiter),
      payload: { name: 'Trust Corp', slug: `trust-corp-${stamp}`, website: 'https://trust.io' },
    });
    expect(org.statusCode).toBe(201);
    const orgId = org.json().organization.id;
    const member = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${orgId}/members`,
      headers: auth(recruiter),
      payload: { userId: referrerUserId, role: 'member' },
    });
    expect(member.statusCode).toBe(201);
    const job = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: auth(recruiter),
      payload: {
        orgId,
        title: 'Trust Engineer',
        description: 'Checks trust boundaries',
        location: 'Remote',
        workMode: 'remote',
        jobType: 'full_time',
      },
    });
    expect(job.statusCode).toBe(201);
    jobId = job.json().job.id;
    const pub = await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: auth(recruiter),
      payload: { status: 'published' },
    });
    expect(pub.statusCode).toBe(200);

    const mk = async (acc: Account) => {
      const r = await app.inject({
        method: 'POST',
        url: '/api/v1/resumes',
        headers: auth(acc),
        payload: { title: 'Resume' },
      });
      expect(r.statusCode).toBe(201);
      return r.json().resume.id as string;
    };
    outsiderResumeId = await mk(outsider);
    ownResumeId = await mk(other);
  });

  afterAll(async () => {
    await app.close();
  });

  const score = async (): Promise<number> => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/instructors/${instructor.userId}`,
    });
    expect(res.statusCode).toBe(200);
    return res.json().compositeScore as number;
  };
  const review = (acc: Account, payload: Record<string, unknown>) =>
    app.inject({
      method: 'POST',
      url: `/api/v1/reputation/instructors/${instructor.userId}/reviews`,
      headers: auth(acc),
      payload,
    });

  it('does not count a review as verified just because the body claims it', async () => {
    const before = await score();
    const res = await review(outsider, { rating: 1, isVerifiedEnrollment: true });
    expect(res.statusCode).toBe(201);
    // Unverified reviews are excluded from the score, so nothing moves.
    expect(await score()).toBe(before);
  });

  it('counts a review from a real enrollee as verified without any flag', async () => {
    const before = await score();
    const res = await review(enrolled, { rating: 1 });
    expect(res.statusCode).toBe(201);
    expect(await score()).toBeLessThan(before);
  });

  it("rejects another user's resumeId on referral requests and drafts, accepts own", async () => {
    const referral = (resumeId?: string) =>
      app.inject({
        method: 'POST',
        url: '/api/v1/referrals/requests',
        headers: auth(other),
        payload: { referrerId: referrerUserId, jobId, pitch: 'Please refer me.', resumeId },
      });
    const draft = (acc: Account, resumeId?: string) =>
      app.inject({
        method: 'PUT',
        url: `/api/v1/jobs/${jobId}/draft`,
        headers: auth(acc),
        payload: { resumeId, coverLetter: 'Hello' },
      });

    expect((await referral(outsiderResumeId)).statusCode).toBe(403);
    expect((await referral(crypto.randomUUID())).statusCode).toBe(404);
    expect((await draft(other, outsiderResumeId)).statusCode).toBe(403);
    expect((await draft(other, crypto.randomUUID())).statusCode).toBe(404);

    expect((await draft(other, ownResumeId)).statusCode).toBe(200);
    expect((await draft(other)).statusCode).toBe(200);
    expect((await referral(ownResumeId)).statusCode).toBe(201);
  });
});

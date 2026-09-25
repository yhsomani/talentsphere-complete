import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Referral Request System (F-142, S-11, BR-233..BR-240)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let referrerToken: string;
  let referrerUserId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let jobId: string;
  let applicationId: string;
  let referralRequestId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      SESSION_SECRET: 'test-session-secret-at-least-32-characters-long',
    });
    await app.ready();

    // 1. Register Candidate (Alice)
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `alice.ref.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Alice Candidate',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.payload);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;
    candidateProfileId = candBody.profile.id;

    // 2. Register Referrer (Bob)
    const refRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `bob.ref.${Date.now()}@techcorp.io`,
        password: 'Password123!',
        fullName: 'Bob Referrer',
        role: 'candidate',
      },
    });
    expect(refRes.statusCode).toBe(201);
    const refBody = JSON.parse(refRes.payload);
    referrerToken = refBody.token;
    referrerUserId = refBody.user.id;

    // 3. Register Recruiter (Carol)
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `carol.rec.${Date.now()}@techcorp.io`,
        password: 'Password123!',
        fullName: 'Carol Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recBody = JSON.parse(recRes.payload);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;

    // 4. Create Organization (TechCorp)
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'TechCorp Solutions',
        slug: `techcorp-${Date.now()}`,
        website: 'https://techcorp.io',
      },
    });
    expect(orgRes.statusCode).toBe(201);
    orgId = JSON.parse(orgRes.payload).organization.id;

    // 5. Add Referrer Bob as employee member of TechCorp (BR-237)
    const addMemberRes = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${orgId}/members`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        userId: referrerUserId,
        role: 'member',
      },
    });
    expect(addMemberRes.statusCode).toBe(201);

    // 6. Create Job at TechCorp
    const jobRes = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Senior Distributed Systems Engineer',
        description: 'Building high throughput event brokers',
        location: 'Remote',
        workMode: 'remote',
        jobType: 'full_time',
      },
    });
    expect(jobRes.statusCode).toBe(201);
    jobId = JSON.parse(jobRes.payload).job.id;

    // 7. Publish the job
    const pubRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: { status: 'published' },
    });
    expect(pubRes.statusCode).toBe(200);

    // 8. Candidate applies for the job
    const appRes = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'I have deep expertise in Kafka and Raft clusters.',
      },
    });
    expect(appRes.statusCode).toBe(201);
    applicationId = JSON.parse(appRes.payload).application.id;
  });

  it('rejects referral request if referrer is not employed at target org (BR-237)', async () => {
    // Register random user not in TechCorp
    const outsideRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `outsider.${Date.now()}@other.com`,
        password: 'Password123!',
        fullName: 'Outsider Person',
        role: 'candidate',
      },
    });
    const outsiderId = JSON.parse(outsideRes.payload).user.id;

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/referrals/requests',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        referrerId: outsiderId,
        jobId,
        pitch: 'Please refer me to TechCorp!',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error.message).toMatch(/referrer must be employed at target organization/);
  });

  it('creates referral request in pending status (BR-234, BR-237)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/referrals/requests',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        referrerId: referrerUserId,
        jobId,
        pitch: 'Hey Bob, I worked on the Raft storage engine previously and would love a referral!',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.request.id).toBeDefined();
    expect(body.request.status).toBe('pending');
    expect(body.request.candidateId).toBe(candidateUserId);
    expect(body.request.referrerId).toBe(referrerUserId);
    expect(body.request.jobId).toBe(jobId);
    expect(body.request.orgId).toBe(orgId);
    referralRequestId = body.request.id;
  });

  it('inspects incoming requests for referrer and outgoing for candidate', async () => {
    // Referrer incoming
    const inRes = await app.inject({
      method: 'GET',
      url: '/api/v1/referrals/requests/incoming',
      headers: { authorization: `Bearer ${referrerToken}` },
    });
    expect(inRes.statusCode).toBe(200);
    const inBody = JSON.parse(inRes.payload);
    expect(inBody.requests.some((r: any) => r.id === referralRequestId)).toBe(true);

    // Candidate outgoing
    const outRes = await app.inject({
      method: 'GET',
      url: '/api/v1/referrals/requests/outgoing',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(outRes.statusCode).toBe(200);
    const outBody = JSON.parse(outRes.payload);
    expect(outBody.requests.some((r: any) => r.id === referralRequestId)).toBe(true);
  });

  it('approves referral request, generates 12-month attribution outcome, and tags application (BR-234, BR-235, BR-236, BR-240)', async () => {
    // Non-referrer cannot respond (BR-234)
    const forbiddenRes = await app.inject({
      method: 'POST',
      url: `/api/v1/referrals/requests/${referralRequestId}/respond`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { action: 'refer' },
    });
    expect(forbiddenRes.statusCode).toBe(403);

    // Referrer Bob approves
    const approveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/referrals/requests/${referralRequestId}/respond`,
      headers: { authorization: `Bearer ${referrerToken}` },
      payload: { action: 'refer' },
    });

    expect(approveRes.statusCode).toBe(200);
    const body = JSON.parse(approveRes.payload);
    expect(body.request.status).toBe('approved');
    expect(body.outcome).toBeDefined();
    expect(body.outcome.status).toBe('referred');
    expect(body.outcome.rewardXp).toBe(500); // BR-236: Default XP
    expect(body.outcome.attributionExpiresAt).toBeDefined(); // BR-240: 12-month window

    // Verify candidate application is tagged as referred (BR-235)
    const getAppRes = await app.inject({
      method: 'GET',
      url: `/api/v1/applications/${applicationId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(getAppRes.statusCode).toBe(200);
    const appBody = JSON.parse(getAppRes.payload);
    expect(appBody.application.isReferred).toBe(true);
    expect(appBody.application.referralId).toBe(body.outcome.id);
  });

  it('queries referral outcomes with proper organization scoping (BR-240)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/referrals/outcomes?orgId=${orgId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.outcomes).toHaveLength(1);
    expect(body.outcomes[0].jobId).toBe(jobId);
    expect(body.outcomes[0].referrerId).toBe(referrerUserId);
    expect(body.outcomes[0].candidateId).toBe(candidateUserId);
  });
});

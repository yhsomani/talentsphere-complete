import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Application Draft Autosave & Recovery (F-36, BR-18, SSOT 1015)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;

  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let jobId: string;

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

    // 1. Register candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `cand.drafts.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Taylor Applicant',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candData = JSON.parse(candRes.payload);
    candidateToken = candData.token;
    candidateUserId = candData.user.id;
    candidateProfileId = candData.profile.id;

    // 2. Register recruiter & organization
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `recruiter.drafts.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Morgan HiringManager',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recData = JSON.parse(recRes.payload);
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;

    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'Nexus Cloud Systems',
        slug: `nexus-cloud-${Date.now()}`,
        website: 'https://nexus.example.com',
        description: 'Next-gen distributed edge compute.',
      },
    });
    expect(orgRes.statusCode).toBe(201);
    const orgData = JSON.parse(orgRes.payload);
    orgId = orgData.organization.id;

    // 3. Post and publish job
    const jobRes = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Senior Distributed Storage Engineer',
        description: 'Design distributed LSM-tree based storage engines.',
        location: 'Remote, US',
        workMode: 'remote',
        jobType: 'full_time',
      },
    });
    expect(jobRes.statusCode).toBe(201);
    const jobData = JSON.parse(jobRes.payload);
    jobId = jobData.job.id;

    await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: { status: 'published' },
    });
  });

  it('allows candidate to create initial application draft (F-36, BR-18)', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/jobs/${jobId}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'I have 6 years experience building distributed storage nodes.',
        answers: { availableInWeeks: 2, willRelocate: false },
        stepIndex: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.draft.id).toBeDefined();
    expect(data.draft.jobId).toBe(jobId);
    expect(data.draft.candidateId).toBe(candidateProfileId);
    expect(data.draft.version).toBe(1);
    expect(data.draft.coverLetter).toBe('I have 6 years experience building distributed storage nodes.');
    expect(data.draft.answers.availableInWeeks).toBe(2);
    expect(data.draft.stepIndex).toBe(1);
    expect(data.draft.isSubmitted).toBe(false);
  });

  it('retrieves candidate active draft along with version snapshots', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${jobId}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.draft.version).toBe(1);
    expect(data.versions.length).toBe(1);
    expect(data.versions[0].version).toBe(1);
    expect(data.versions[0].coverLetter).toBe('I have 6 years experience building distributed storage nodes.');
  });

  it('increments version on continuous autosave (BR-18)', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/jobs/${jobId}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'Updated cover letter with additional open-source links.',
        answers: { availableInWeeks: 4, willRelocate: false },
        stepIndex: 2,
      },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.draft.version).toBe(2);
    expect(data.draft.coverLetter).toBe('Updated cover letter with additional open-source links.');
    expect(data.draft.stepIndex).toBe(2);

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${jobId}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    const getData = JSON.parse(getRes.payload);
    expect(getData.versions.length).toBe(2);
  });

  it('restores previous version of the draft (BR-18 recovery)', async () => {
    const restoreRes = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/draft/restore`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { targetVersion: 1 },
    });

    expect(restoreRes.statusCode).toBe(200);
    const data = JSON.parse(restoreRes.payload);
    expect(data.draft.version).toBe(3); // version advances
    expect(data.draft.coverLetter).toBe('I have 6 years experience building distributed storage nodes.');
    expect(data.draft.stepIndex).toBe(1);
  });

  it('lists all active candidate drafts across jobs', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/applications/drafts',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.total).toBe(1);
    expect(data.drafts[0].jobId).toBe(jobId);
    expect(data.drafts[0].job.title).toBe('Senior Distributed Storage Engineer');
  });

  it('prohibits recruiters from saving candidate application drafts (BR-02)', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/jobs/${jobId}/draft`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        coverLetter: 'Recruiter attempting to save candidate draft',
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('automatically transitions draft to submitted when application is filed', async () => {
    const applyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'Final submitted cover letter.',
      },
    });
    expect(applyRes.statusCode).toBe(201);

    // Active draft should now return 404 since it was submitted
    const draftRes = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${jobId}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(draftRes.statusCode).toBe(404);

    // Active drafts list should be empty
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/applications/drafts',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    const listData = JSON.parse(listRes.payload);
    expect(listData.total).toBe(0);
  });

  it('allows discarding an active draft', async () => {
    // 1. Post a second job
    const job2Res = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Frontend Performance Architect',
        description: 'Build hyper-fast reactive UI.',
        location: 'Remote',
      },
    });
    expect(job2Res.statusCode).toBe(201);
    const job2Id = JSON.parse(job2Res.payload).job.id;

    // 2. Candidate saves draft for job 2
    await app.inject({
      method: 'PUT',
      url: `/api/v1/jobs/${job2Id}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { coverLetter: 'Frontend draft' },
    });

    // 3. Discard draft
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/jobs/${job2Id}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(deleteRes.statusCode).toBe(200);

    // 4. Getting discarded draft returns 404
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${job2Id}/draft`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(getRes.statusCode).toBe(404);
  });
});

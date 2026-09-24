import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Job Marketplace & ATS Candidate Pipeline Integration Suite (F-04, F-05, F-06)', () => {
  let app: FastifyInstance;
  let recruiterToken: string;
  let recruiterUserId: string;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let otherRecruiterToken: string;
  let orgId: string;
  let jobId: string;
  let evidenceId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 4003,
      APP_VERSION: '1.0.0-test',
    });
    await app.ready();

    // 1. Register Recruiter
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'recruiter@techcorp.io',
        password: 'Password123!',
        fullName: 'Sarah Recruiter',
        role: 'recruiter',
      },
    });
    const recBody = JSON.parse(recRes.body);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;

    // 2. Register Candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'candidate-jobs@example.com',
        password: 'Password123!',
        fullName: 'Alex Candidate',
        role: 'candidate',
      },
    });
    const candBody = JSON.parse(candRes.body);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;
    candidateProfileId = candBody.profile.id;

    // 3. Register Other Recruiter (unauthorized for TechCorp)
    const otherRecRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'other-recruiter@othercorp.io',
        password: 'Password123!',
        fullName: 'Bob Other',
        role: 'recruiter',
      },
    });
    otherRecruiterToken = JSON.parse(otherRecRes.body).token;

    // 4. Create Organization by primary Recruiter
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'TechCorp Engineering',
        slug: 'techcorp-engineering',
        website: 'https://techcorp.io',
        description: 'Building world-class distributed cloud infrastructure.',
      },
    });
    orgId = JSON.parse(orgRes.body).organization.id;

    // 5. Candidate creates an evidence record to attach to applications
    const evRes = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'project',
        title: 'Distributed Consensus Engine in Go',
        description: 'Implemented Raft consensus cluster.',
        source: 'github',
        provenance: 'git_commit',
        recencyDate: '2026-06-01',
      },
    });
    evidenceId = JSON.parse(evRes.body).evidence.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows recruiter to create job posting in draft status (F-04, F-05, BR-01, BR-12)', async () => {
    const tsSkillId = '10000000-0000-4000-a000-000000000001';

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Principal Distributed Systems Engineer',
        description: 'Architect and scale our multi-region event-driven distributed system.',
        location: 'Remote / US',
        requiredSkillIds: [tsSkillId],
        salaryMinMinor: 19000000,
        salaryMaxMinor: 23000000,
        currency: 'USD',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.job).toBeDefined();
    expect(body.job.status).toBe('draft');
    expect(body.job.orgId).toBe(orgId);
    expect(body.job.title).toBe('Principal Distributed Systems Engineer');
    jobId = body.job.id;
  });

  it('rejects candidate attempting to post a job (BR-01)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        orgId,
        title: 'Unauthorized Candidate Job',
        description: 'Should fail immediately.',
        location: 'Remote',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('rejects candidate application to draft job (BR-16, BR-38)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'Interested in this role.',
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.error.message).toContain('only accepted for published jobs');
  });

  it('allows recruiter to publish job posting (BR-11, BR-12)', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        status: 'published',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.job.status).toBe('published');

    // Verify it now appears in public job list
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/jobs',
    });
    expect(listRes.statusCode).toBe(200);
    const listBody = JSON.parse(listRes.body);
    const published = listBody.jobs.find((j: any) => j.id === jobId);
    expect(published).toBeDefined();
  });

  it('allows candidate to apply with attached evidence and enqueues worker event (F-06, BR-02)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: '10+ years scaling low-latency consensus systems.',
        attachedEvidenceIds: [evidenceId],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.application).toBeDefined();
    expect(body.application.status).toBe('submitted');
    expect(body.application.attachedEvidenceIds).toContain(evidenceId);

    // Verify worker queue event
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const jobsBody = JSON.parse(jobsRes.body);
    const jobSubmission = jobsBody.jobs.find(
      (j: any) => j.type === 'application.submitted' && j.payload.jobId === jobId
    );
    expect(jobSubmission).toBeDefined();
  });

  it('rejects recruiter attempting to apply to a job (BR-02)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        coverLetter: 'Recruiter applying.',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toContain('Recruiters may not submit job applications');
  });

  it('rejects duplicate active application for same job (BR-15, BR-39)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'Duplicate attempt.',
      },
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('CONFLICT');
    expect(body.error.message).toContain('An active application for this job already exists');
  });

  it('enforces tenant privacy: other recruiter cannot access candidate applications (BR-40)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${jobId}/applications`,
      headers: { authorization: `Bearer ${otherRecruiterToken}` },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toContain('restricted to authorized recruiters for this organization');
  });

  it('allows authorized recruiter to view candidate pipeline and advance stages (F-06, BR-41)', async () => {
    // 1. Recruiter views candidate pipeline
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${jobId}/applications`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(listRes.statusCode).toBe(200);
    const listBody = JSON.parse(listRes.body);
    expect(listBody.applications).toHaveLength(1);
    const application = listBody.applications[0];
    expect(application.candidate).toBeDefined();
    expect(application.evidence).toHaveLength(1);

    // 2. Advance stage: submitted -> in_review
    const inReviewRes = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${application.id}/transition`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        applicationId: application.id,
        targetState: 'in_review',
      },
    });
    expect(inReviewRes.statusCode).toBe(200);
    expect(JSON.parse(inReviewRes.body).application.status).toBe('in_review');

    // 3. Advance stage: in_review -> shortlisted
    const shortlistRes = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${application.id}/transition`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        applicationId: application.id,
        targetState: 'shortlisted',
      },
    });
    expect(shortlistRes.statusCode).toBe(200);
    expect(JSON.parse(shortlistRes.body).application.status).toBe('shortlisted');

    // 4. Advance stage: shortlisted -> interviewing
    const interviewRes = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${application.id}/transition`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        applicationId: application.id,
        targetState: 'interviewing',
      },
    });
    expect(interviewRes.statusCode).toBe(200);
    expect(JSON.parse(interviewRes.body).application.status).toBe('interviewing');

    // 5. Advance stage: interviewing -> offered
    const offerRes = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${application.id}/transition`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        applicationId: application.id,
        targetState: 'offered',
      },
    });
    expect(offerRes.statusCode).toBe(200);
    expect(JSON.parse(offerRes.body).application.status).toBe('offered');

    // 6. Advance stage: offered -> hired
    const hireRes = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${application.id}/transition`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        applicationId: application.id,
        targetState: 'hired',
      },
    });
    expect(hireRes.statusCode).toBe(200);
    expect(JSON.parse(hireRes.body).application.status).toBe('hired');

    // 7. Verify status change worker event
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const jobsBody = JSON.parse(jobsRes.body);
    const statusChangedJobs = jobsBody.jobs.filter(
      (j: any) => j.type === 'application.status_changed' && j.payload.applicationId === application.id
    );
    expect(statusChangedJobs.length).toBeGreaterThanOrEqual(5);
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Application Feedback Loop (F-122, BR-217..BR-224, P-02)', () => {
  let app: FastifyInstance;
  let recruiterToken: string;
  let recruiterUserId: string;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let foreignRecruiterToken: string;
  let orgId: string;
  let jobId: string;
  let applicationId: string;
  let validSkillId: string;

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

    // 1. Register Recruiter for Org
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `recruiter.fb.${Date.now()}@acmeinfra.io`,
        password: 'Password123!',
        fullName: 'Sarah Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recBody = JSON.parse(recRes.payload);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;

    // 2. Create Organization
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'Acme Infra Systems',
        slug: `acme-infra-${Date.now()}`,
        website: 'https://acmeinfra.io',
      },
    });
    expect(orgRes.statusCode).toBe(201);
    orgId = JSON.parse(orgRes.payload).organization.id;

    // 3. Register Candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `cand.fb.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Casey Applicant',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.payload);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;
    candidateProfileId = candBody.profile.id;

    // 4. Register Foreign Recruiter
    const foreignRecRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `foreign.recruiter.${Date.now()}@othercorp.io`,
        password: 'Password123!',
        fullName: 'Other Recruiter',
        role: 'recruiter',
      },
    });
    expect(foreignRecRes.statusCode).toBe(201);
    foreignRecruiterToken = JSON.parse(foreignRecRes.payload).token;

    // 5. Get valid canonical skill
    const skillsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/skills',
    });
    expect(skillsRes.statusCode).toBe(200);
    validSkillId = JSON.parse(skillsRes.payload).skills[0].id;

    // 6. Post Job Requisition
    const jobRes = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Senior Distributed Systems Engineer',
        description: 'Design resilient microservices architectures with event streams.',
        location: 'San Francisco, CA',
        workMode: 'hybrid',
        jobType: 'full_time',
        requiredSkillIds: [validSkillId],
        salaryMinMinor: 15000000,
        salaryMaxMinor: 20000000,
        currency: 'USD',
      },
    });
    expect(jobRes.statusCode).toBe(201);
    jobId = JSON.parse(jobRes.payload).job.id;

    // Publish job so candidate can apply
    const pubRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: { status: 'published' },
    });
    expect(pubRes.statusCode).toBe(200);

    // 7. Candidate applies to job
    const applyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'Excited to apply for the distributed systems engineer position.',
      },
    });
    expect(applyRes.statusCode).toBe(201);
    applicationId = JSON.parse(applyRes.payload).application.id;
  });

  it('rejects candidate attempting to write recruiter feedback (403 Forbidden)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${applicationId}/feedback`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        reasonCategory: 'skills_gap',
        stage: 'screening',
        strengths: 'Good candidate.',
        areasForImprovement: 'Needs more practice.',
        actionableAdvice: 'Study distributed consensus.',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('enforces tenant boundary when recruiter from another organization attempts feedback (BR-12)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${applicationId}/feedback`,
      headers: { authorization: `Bearer ${foreignRecruiterToken}` },
      payload: {
        reasonCategory: 'position_filled',
        stage: 'screening',
        strengths: 'Impressive credentials.',
        areasForImprovement: 'Position was filled internally.',
        actionableAdvice: 'Keep an eye on our careers page.',
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('configures and lists feedback templates for organization (BR-224)', async () => {
    // 1. Create feedback template
    const createRes = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${orgId}/feedback-templates`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        templateName: 'Core Engineering Rejection Template',
        stage: 'technical_interview',
        reasonCategory: 'skills_gap',
        defaultStrengths: 'Solid fundamentals and great problem-solving aptitude.',
        defaultAreasForImprovement: 'Needs stronger depth in event-driven streaming.',
        defaultActionableAdvice: 'Work through distributed log architecture tutorials.',
      },
    });

    expect(createRes.statusCode).toBe(201);
    const createBody = JSON.parse(createRes.payload);
    expect(createBody.template.templateName).toBe('Core Engineering Rejection Template');

    // 2. List templates
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${orgId}/feedback-templates`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(listRes.statusCode).toBe(200);
    const listBody = JSON.parse(listRes.payload);
    expect(listBody.templates.length).toBeGreaterThanOrEqual(1);
  });

  it('provides structured feedback on application with actionable element (BR-217, BR-223)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${applicationId}/feedback`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        reasonCategory: 'skills_gap',
        stage: 'technical_interview',
        strengths: 'Excellent system design intuition and clean modular code architecture.',
        areasForImprovement:
          'Deep dive into concurrent transactions and isolation levels was missing.',
        actionableAdvice:
          'We recommend hands-on practice with PostgreSQL serialized snapshots and locking mechanisms.',
        suggestedSkillIds: [validSkillId],
        isAiAssisted: false,
        humanReviewed: true,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.feedback.id).toBeDefined();
    expect(body.feedback.applicationId).toBe(applicationId);
    expect(body.feedback.reasonCategory).toBe('skills_gap');
    expect(body.feedback.status).toBe('provided');
    expect(body.feedback.suggestedSkillIds).toContain(validSkillId);
  });

  it('delivers feedback to candidate and updates status to viewed (BR-219)', async () => {
    // 1. Candidate views feedback
    const viewRes = await app.inject({
      method: 'GET',
      url: `/api/v1/applications/${applicationId}/feedback`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(viewRes.statusCode).toBe(200);
    const viewBody = JSON.parse(viewRes.payload);
    expect(viewBody.feedback.status).toBe('viewed');
    expect(viewBody.feedback.viewedAt).toBeDefined();
    expect(viewBody.feedback.reasonCategory).toBe('skills_gap');

    // 2. Foreign candidate cannot view this feedback
    const foreignCandRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `foreign.cand.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Intruder Candidate',
        role: 'candidate',
      },
    });
    const foreignToken = JSON.parse(foreignCandRes.payload).token;

    const blockedRes = await app.inject({
      method: 'GET',
      url: `/api/v1/applications/${applicationId}/feedback`,
      headers: { authorization: `Bearer ${foreignToken}` },
    });

    expect(blockedRes.statusCode).toBe(403);
  });

  it('allows candidate to request feedback follow-up within 30-day window (BR-222)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/applications/${applicationId}/feedback/request`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.message).toContain('already been provided');
  });

  it('computes anonymized aggregate insights with privacy protection (BR-220)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/feedback/aggregate-insights',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.insights).toBeDefined();
    // With only 1 feedback in system, k >= 10 privacy gate is active
    expect(body.insights.isPrivacyProtected).toBe(true);
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Job Templates & Requisition Instantiation (F-37, F-05, BR-01, BR-12, BR-144)', () => {
  let app: FastifyInstance;
  let recruiterToken: string;
  let recruiterUserId: string;
  let candidateToken: string;
  let otherRecruiterToken: string;
  let orgId: string;
  let otherOrgId: string;
  let validSkillId: string;
  let createdTemplateId: string;
  let createdJobId: string;

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

    // 1. Register Recruiter for TechCorp
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `sarah.recruiter.${Date.now()}@techcorp.io`,
        password: 'Password123!',
        fullName: 'Sarah Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recBody = JSON.parse(recRes.payload);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;

    // 2. Create TechCorp Organization
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'TechCorp Cloud Systems',
        slug: `techcorp-cloud-${Date.now()}`,
        website: 'https://techcorp.cloud',
        description: 'Enterprise Cloud Infrastructure',
      },
    });
    expect(orgRes.statusCode).toBe(201);
    const orgBody = JSON.parse(orgRes.payload);
    orgId = orgBody.organization.id;

    // 3. Register Candidate Alex
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `alex.candidate.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Alex Candidate',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.payload);
    candidateToken = candBody.token;

    // 4. Register Other Recruiter for RivalCorp
    const otherRecRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `david.recruiter.${Date.now()}@rivalcorp.io`,
        password: 'Password123!',
        fullName: 'David Recruiter',
        role: 'recruiter',
      },
    });
    expect(otherRecRes.statusCode).toBe(201);
    const otherRecBody = JSON.parse(otherRecRes.payload);
    otherRecruiterToken = otherRecBody.token;

    const otherOrgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${otherRecruiterToken}` },
      payload: {
        name: 'RivalCorp Global',
        slug: `rivalcorp-${Date.now()}`,
        website: 'https://rivalcorp.com',
      },
    });
    expect(otherOrgRes.statusCode).toBe(201);
    otherOrgId = JSON.parse(otherOrgRes.payload).organization.id;

    // 5. Query skills to find a valid canonical skill ID
    const skillsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/skills',
    });
    expect(skillsRes.statusCode).toBe(200);
    const skillsBody = JSON.parse(skillsRes.payload);
    validSkillId = skillsBody.skills[0].id;
  });

  it('rejects candidate attempting to create a job template (BR-01)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/job-templates',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        orgId,
        templateName: 'Unauthorized Template',
        title: 'Backend Engineer',
        description: 'Lead backend microservices architecture.',
        location: 'Remote',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('enforces tenant boundary when recruiter attempts to create template for foreign org (BR-12)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/job-templates',
      headers: { authorization: `Bearer ${otherRecruiterToken}` },
      payload: {
        orgId, // TechCorp org ID, but otherRecruiter is only in RivalCorp
        templateName: 'Cross-Tenant Template',
        title: 'Staff Engineer',
        description: 'Design distributed architectures.',
        location: 'Remote',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('validates canonical skill IDs on template creation (BR-144)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/job-templates',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        templateName: 'Invalid Skills Template',
        title: 'Full Stack Engineer',
        description: 'Full stack development with Next.js and Postgres.',
        location: 'San Francisco, CA',
        requiredSkillIds: ['skill_fake_nonexistent_123'],
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
    expect(body.error.message).toContain('BR-144');
  });

  it('successfully creates a job template with valid skills, salary range, and screening questions', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/job-templates',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        templateName: 'Senior Distributed Systems Architect',
        title: 'Senior Systems Architect',
        description: 'Lead core cloud infrastructure and resilient distributed databases.',
        location: 'San Francisco, CA',
        workMode: 'hybrid',
        jobType: 'full_time',
        department: 'Infrastructure & Core',
        requiredSkillIds: [validSkillId],
        salaryMinMinor: 15000000,
        salaryMaxMinor: 22000000,
        currency: 'USD',
        screeningQuestions: [
          {
            question: 'How do you approach database partitioning under high write load?',
            required: true,
            idealAnswer: 'Consistent hashing with virtual nodes.',
          },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.template.id).toBeDefined();
    expect(body.template.orgId).toBe(orgId);
    expect(body.template.templateName).toBe('Senior Distributed Systems Architect');
    expect(body.template.title).toBe('Senior Systems Architect');
    expect(body.template.salaryRange.minMinor).toBe(15000000);
    expect(body.template.screeningQuestions.length).toBe(1);
    expect(body.template.isArchived).toBe(false);

    createdTemplateId = body.template.id;
  });

  it('lists job templates for organization and enforces tenant isolation (BR-12)', async () => {
    // 1. TechCorp recruiter can view TechCorp templates
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/job-templates?orgId=${orgId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(listRes.statusCode).toBe(200);
    const listBody = JSON.parse(listRes.payload);
    expect(listBody.templates.length).toBeGreaterThanOrEqual(1);
    expect(listBody.templates.some((t: any) => t.id === createdTemplateId)).toBe(true);

    // 2. RivalCorp recruiter is blocked from viewing TechCorp templates
    const foreignListRes = await app.inject({
      method: 'GET',
      url: `/api/v1/job-templates?orgId=${orgId}`,
      headers: { authorization: `Bearer ${otherRecruiterToken}` },
    });

    expect(foreignListRes.statusCode).toBe(403);
  });

  it('retrieves single job template by ID with organization verification', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/job-templates/${createdTemplateId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.template.id).toBe(createdTemplateId);
    expect(body.template.title).toBe('Senior Systems Architect');

    // Rival recruiter cannot fetch this template
    const foreignRes = await app.inject({
      method: 'GET',
      url: `/api/v1/job-templates/${createdTemplateId}`,
      headers: { authorization: `Bearer ${otherRecruiterToken}` },
    });
    expect(foreignRes.statusCode).toBe(403);
  });

  it('updates a job template and verifies modifications', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/job-templates/${createdTemplateId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        templateName: 'Lead Systems Architect & Distributed Infra',
        title: 'Lead Systems Architect',
        salaryMinMinor: 16000000,
        salaryMaxMinor: 23000000,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.template.templateName).toBe('Lead Systems Architect & Distributed Infra');
    expect(body.template.title).toBe('Lead Systems Architect');
    expect(body.template.salaryRange.minMinor).toBe(16000000);
    expect(body.template.salaryRange.maxMinor).toBe(23000000);
  });

  it('instantiates a job requisition from the template (F-37, F-05)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/job-templates/${createdTemplateId}/instantiate`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        title: 'Lead Systems Architect - Core Engine',
        workMode: 'remote',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.job.id).toBeDefined();
    expect(body.job.orgId).toBe(orgId);
    expect(body.job.title).toBe('Lead Systems Architect - Core Engine');
    expect(body.job.workMode).toBe('remote');
    expect(body.job.status).toBe('draft');
    expect(body.job.requiredSkillIds).toContain(validSkillId);

    createdJobId = body.job.id;

    // Verify requisition exists in job repository
    const jobRes = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${createdJobId}`,
    });
    expect(jobRes.statusCode).toBe(200);
    const jobBody = JSON.parse(jobRes.payload);
    expect(jobBody.job.id).toBe(createdJobId);
    expect(jobBody.job.title).toBe('Lead Systems Architect - Core Engine');
  });

  it('saves an existing job requisition as a reusable template (save-as-template)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${createdJobId}/save-as-template`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        templateName: 'Core Engine Requisition Blueprint',
        department: 'Core Engine Engineering',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.template.id).toBeDefined();
    expect(body.template.orgId).toBe(orgId);
    expect(body.template.templateName).toBe('Core Engine Requisition Blueprint');
    expect(body.template.title).toBe('Lead Systems Architect - Core Engine');
    expect(body.template.department).toBe('Core Engine Engineering');
  });

  it('archives a job template and blocks further instantiations', async () => {
    // 1. Archive template
    const delRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/job-templates/${createdTemplateId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(delRes.statusCode).toBe(200);
    const delBody = JSON.parse(delRes.payload);
    expect(delBody.template.isArchived).toBe(true);

    // 2. Default list hides archived templates
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/job-templates?orgId=${orgId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(listRes.statusCode).toBe(200);
    const listBody = JSON.parse(listRes.payload);
    expect(listBody.templates.some((t: any) => t.id === createdTemplateId)).toBe(false);

    // 3. With includeArchived=true, it is returned
    const listArchivedRes = await app.inject({
      method: 'GET',
      url: `/api/v1/job-templates?orgId=${orgId}&includeArchived=true`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(listArchivedRes.statusCode).toBe(200);
    const listArchivedBody = JSON.parse(listArchivedRes.payload);
    expect(listArchivedBody.templates.some((t: any) => t.id === createdTemplateId)).toBe(true);

    // 4. Instantiation from archived template is blocked (CONFLICT 409)
    const instRes = await app.inject({
      method: 'POST',
      url: `/api/v1/job-templates/${createdTemplateId}/instantiate`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {},
    });

    expect(instRes.statusCode).toBe(409);
    const instBody = JSON.parse(instRes.payload);
    expect(instBody.error.code).toBe('CONFLICT');
    expect(instBody.error.message).toContain('archived template');
  });
});

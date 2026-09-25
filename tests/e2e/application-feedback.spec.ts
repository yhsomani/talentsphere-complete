import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Application Feedback Loop (F-122, BR-217..BR-224, P-02)', () => {
  let recruiterToken: string;
  let recruiterUserId: string;
  let candidateToken: string;
  let candidateUserId: string;
  let orgId: string;
  let jobId: string;
  let applicationId: string;
  let validSkillId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.fb.e2e.${Date.now()}@vertexcloud.io`,
        password: 'Password123!Secure',
        fullName: 'Jordan Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;

    // 2. Create Organization
    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: 'Vertex Cloud Platforms',
        slug: `vertex-cloud-${Date.now()}`,
        website: 'https://vertexcloud.io',
      },
    });
    expect(orgRes.status()).toBe(201);
    orgId = (await orgRes.json()).organization.id;

    // 3. Register Candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.fb.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Taylor Applicant',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 4. Fetch canonical skill
    const skillsRes = await request.get(`${API_BASE}/skills`);
    expect(skillsRes.status()).toBe(200);
    validSkillId = (await skillsRes.json()).skills[0].id;

    // 5. Post and publish job
    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Lead Platform Reliability Architect',
        description: 'Architect multi-region fault tolerance and resilient cloud infrastructure.',
        location: 'Seattle, WA',
        workMode: 'hybrid',
        jobType: 'full_time',
        requiredSkillIds: [validSkillId],
        salaryMinMinor: 16000000,
        salaryMaxMinor: 22000000,
        currency: 'USD',
      },
    });
    expect(jobRes.status()).toBe(201);
    jobId = (await jobRes.json()).job.id;

    await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });

    // 6. Candidate applies
    const appRes = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Passionate about resilient distributed platforms and site reliability.',
      },
    });
    expect(appRes.status()).toBe(201);
    applicationId = (await appRes.json()).application.id;
  });

  test('candidate cannot create recruiter feedback (403 Forbidden)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/applications/${applicationId}/feedback`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        reasonCategory: 'skills_gap',
        stage: 'screening',
        strengths: 'Good candidate.',
        areasForImprovement: 'Needs more practice.',
        actionableAdvice: 'Study distributed consensus.',
      },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  test('recruiter configures feedback template for organization (BR-224)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/organizations/${orgId}/feedback-templates`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        templateName: 'Vertex SRE Rejection & Guidance Template',
        stage: 'technical_interview',
        reasonCategory: 'skills_gap',
        defaultStrengths: 'Strong fundamental knowledge of network protocols and kernel limits.',
        defaultAreasForImprovement: 'Limited experience with eBPF tracing and kernel telemetry.',
        defaultActionableAdvice:
          'Read through Cilium/eBPF architectural guides and experiment in a sandbox.',
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.template.id).toBeDefined();
    expect(data.template.templateName).toBe('Vertex SRE Rejection & Guidance Template');

    // List templates
    const listRes = await request.get(`${API_BASE}/organizations/${orgId}/feedback-templates`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(listData.templates.length).toBeGreaterThanOrEqual(1);
  });

  test('recruiter provides structured feedback and candidate views it privately (BR-217, BR-219, BR-223)', async ({
    request,
  }) => {
    // 1. Recruiter submits feedback
    const provRes = await request.post(`${API_BASE}/applications/${applicationId}/feedback`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        stage: 'technical_interview',
        reasonCategory: 'skills_gap',
        strengths: 'Deep domain expertise in Linux sysadmin and distributed tracing.',
        areasForImprovement: 'Could improve on concurrent consensus algorithms (Raft/Paxos).',
        actionableAdvice:
          'We suggest building a toy Raft cluster in Go to deepen consensus mechanics.',
        suggestedSkillIds: [validSkillId],
        isAiAssisted: false,
        humanReviewed: true,
      },
    });

    expect(provRes.status()).toBe(201);
    const provData = await provRes.json();
    expect(provData.feedback.id).toBeDefined();
    expect(provData.feedback.reasonCategory).toBe('skills_gap');
    expect(provData.feedback.status).toBe('provided');

    // 2. Candidate retrieves feedback: status transitions to 'viewed' (BR-219)
    const viewRes = await request.get(`${API_BASE}/applications/${applicationId}/feedback`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(viewRes.status()).toBe(200);
    const viewData = await viewRes.json();
    expect(viewData.feedback.status).toBe('viewed');
    expect(viewData.feedback.viewedAt).toBeDefined();
    expect(viewData.feedback.actionableAdvice).toContain('toy Raft cluster');

    // 3. Candidate requests follow-up
    const reqRes = await request.post(
      `${API_BASE}/applications/${applicationId}/feedback/request`,
      {
        headers: { authorization: `Bearer ${candidateToken}` },
      }
    );
    expect(reqRes.status()).toBe(200);
  });
});

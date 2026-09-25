import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Job Templates & Requisition Lifecycle (F-37, F-05, BR-01, BR-12, BR-144)', () => {
  let recruiterToken: string;
  let recruiterUserId: string;
  let candidateToken: string;
  let orgId: string;
  let validSkillId: string;
  let templateId: string;
  let instantiatedJobId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.e2e.${Date.now()}@apexcloud.io`,
        password: 'Password123!Secure',
        fullName: 'Jordan Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;

    // 2. Create organization
    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: 'Apex Cloud Solutions',
        slug: `apex-cloud-${Date.now()}`,
        website: 'https://apexcloud.io',
        description: 'Next-generation cloud networking',
      },
    });
    expect(orgRes.status()).toBe(201);
    const orgData = await orgRes.json();
    orgId = orgData.organization.id;

    // 3. Register candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.e2e.template.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Morgan Applicant',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;

    // 4. Fetch valid canonical skill
    const skillsRes = await request.get(`${API_BASE}/skills`);
    expect(skillsRes.status()).toBe(200);
    const skillsData = await skillsRes.json();
    validSkillId = skillsData.skills[0].id;
  });

  test('candidate cannot create job template (BR-01 403 Forbidden)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/job-templates`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        orgId,
        templateName: 'Malicious Candidate Template',
        title: 'Lead Architect',
        description: 'Attempting to create unauthorized template.',
        location: 'Remote',
      },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  test('recruiter creates and manages reusable job template with screening questions and salary (F-37)', async ({
    request,
  }) => {
    // 1. Create template
    const createRes = await request.post(`${API_BASE}/job-templates`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        templateName: 'Site Reliability Engineering Template',
        title: 'Senior Site Reliability Engineer',
        description:
          'Own production infrastructure uptime, Kubernetes clustering, and SLI/SLO monitoring.',
        location: 'Seattle, WA',
        workMode: 'hybrid',
        jobType: 'full_time',
        department: 'Infrastructure Operations',
        requiredSkillIds: [validSkillId],
        salaryMinMinor: 14500000,
        salaryMaxMinor: 19500000,
        currency: 'USD',
        screeningQuestions: [
          {
            question: 'Describe an outage you diagnosed using distributed tracing.',
            required: true,
            idealAnswer: 'Traced bottleneck using OpenTelemetry spans.',
          },
        ],
      },
    });

    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    expect(createData.template.id).toBeDefined();
    expect(createData.template.templateName).toBe('Site Reliability Engineering Template');
    expect(createData.template.title).toBe('Senior Site Reliability Engineer');
    expect(createData.template.salaryRange.minMinor).toBe(14500000);
    expect(createData.template.screeningQuestions.length).toBe(1);

    templateId = createData.template.id;

    // 2. Fetch template by ID
    const getRes = await request.get(`${API_BASE}/job-templates/${templateId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.template.id).toBe(templateId);

    // 3. Update template
    const patchRes = await request.patch(`${API_BASE}/job-templates/${templateId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        templateName: 'Principal SRE & Cloud Reliability Template',
        title: 'Principal Site Reliability Engineer',
        salaryMinMinor: 17000000,
        salaryMaxMinor: 22000000,
      },
    });
    expect(patchRes.status()).toBe(200);
    const patchData = await patchRes.json();
    expect(patchData.template.title).toBe('Principal Site Reliability Engineer');
    expect(patchData.template.salaryRange.minMinor).toBe(17000000);
  });

  test('recruiter instantiates job requisition, publishes it to marketplace, and clones it as new template (F-37, F-05, F-04)', async ({
    request,
  }) => {
    // 1. Instantiate job requisition from template
    const instRes = await request.post(`${API_BASE}/job-templates/${templateId}/instantiate`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        title: 'Principal SRE - Core Platform',
        workMode: 'remote',
      },
    });

    expect(instRes.status()).toBe(201);
    const instData = await instRes.json();
    expect(instData.job.id).toBeDefined();
    expect(instData.job.title).toBe('Principal SRE - Core Platform');
    expect(instData.job.status).toBe('draft');
    expect(instData.job.workMode).toBe('remote');
    expect(instData.job.requiredSkillIds).toContain(validSkillId);

    instantiatedJobId = instData.job.id;

    // 2. Publish instantiated job
    const pubRes = await request.patch(`${API_BASE}/jobs/${instantiatedJobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });
    expect(pubRes.status()).toBe(200);

    // 3. Candidate verifies job in public marketplace
    const marketRes = await request.get(`${API_BASE}/jobs`);
    expect(marketRes.status()).toBe(200);
    const marketData = await marketRes.json();
    const published = marketData.jobs.find((j: any) => j.id === instantiatedJobId);
    expect(published).toBeDefined();
    expect(published.title).toBe('Principal SRE - Core Platform');

    // 4. Save existing job requisition as template
    const saveTplRes = await request.post(
      `${API_BASE}/jobs/${instantiatedJobId}/save-as-template`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
        data: {
          templateName: 'Core Platform SRE Blueprint v2',
          department: 'Core Infrastructure',
        },
      }
    );
    expect(saveTplRes.status()).toBe(201);
    const saveTplData = await saveTplRes.json();
    expect(saveTplData.template.id).toBeDefined();
    expect(saveTplData.template.templateName).toBe('Core Platform SRE Blueprint v2');
    expect(saveTplData.template.title).toBe('Principal SRE - Core Platform');

    // 5. Archive original template
    const delRes = await request.delete(`${API_BASE}/job-templates/${templateId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(delRes.status()).toBe(200);

    // 6. Verify cannot instantiate from archived template (409 Conflict)
    const failInstRes = await request.post(`${API_BASE}/job-templates/${templateId}/instantiate`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {},
    });
    expect(failInstRes.status()).toBe(409);
    const failBody = await failInstRes.json();
    expect(failBody.error.code).toBe('CONFLICT');
  });
});

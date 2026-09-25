import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Organizations, Jobs & Applications Lifecycle (F-04, F-05, F-06, BR-039, BR-40)', () => {
  let recruiterToken: string;
  let recruiterId: string;
  let candidateToken: string;
  let candidateId: string;
  let orgId: string;
  let jobId: string;
  let applicationId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.${Date.now()}@acme-corp.com`,
        password: 'Password123!Secure',
        fullName: 'Jane Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterId = recData.user.id;

    // 2. Register candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `candidate.applicant.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Alex Applicant',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateId = candData.user.id;
  });

  test('creates organization and posts job requisition (F-04, F-05)', async ({ request }) => {
    // 1. Create Organization
    const slug = `acme-systems-${Date.now()}`;
    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: 'Acme Systems Inc.',
        slug,
        website: 'https://acme.example.com',
        description: 'Next-gen distributed cloud computing platform.',
      },
    });
    expect(orgRes.status()).toBe(201);
    const orgData = await orgRes.json();
    expect(orgData.organization.slug).toBe(slug);
    orgId = orgData.organization.id;

    // 2. Post Job Requisition (draft)
    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Staff Distributed Systems Engineer',
        description: 'Lead engineering for high-throughput distributed consensus engines.',
        location: 'Remote, US',
        requiredSkillIds: ['10000000-0000-4000-a000-000000000001'], // TypeScript
        salaryMinMinor: 18000000,
        salaryMaxMinor: 24000000,
        currency: 'USD',
      },
    });
    expect(jobRes.status()).toBe(201);
    const jobData = await jobRes.json();
    expect(jobData.job.status).toBe('draft');
    jobId = jobData.job.id;

    // 3. Publish Job
    const publishRes = await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });
    expect(publishRes.status()).toBe(200);
    const publishData = await publishRes.json();
    expect(publishData.job.status).toBe('published');

    // 4. Verify public job listing
    const listRes = await request.get(`${API_BASE}/jobs`);
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    const found = listData.jobs.find((j: any) => j.id === jobId);
    expect(found).toBeDefined();
    expect(found.title).toBe('Staff Distributed Systems Engineer');
  });

  test('applies to job, enforces anti-duplicate constraint (BR-039), and progresses through hiring pipeline (F-06)', async ({ request }) => {
    // 1. Candidate submits application
    const applyRes = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Excited about distributed consensus and high throughput systems!',
        attachedEvidenceIds: [],
      },
    });
    expect(applyRes.status()).toBe(201);
    const applyData = await applyRes.json();
    expect(applyData.application.status).toBe('submitted');
    applicationId = applyData.application.id;

    // 2. Duplicate application must be rejected with 409 (BR-039)
    const duplicateRes = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Attempting duplicate application.',
      },
    });
    expect(duplicateRes.status()).toBe(409);

    // 3. Candidate views their own applications
    const myAppsRes = await request.get(`${API_BASE}/applications/my`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(myAppsRes.status()).toBe(200);
    const myAppsData = await myAppsRes.json();
    expect(myAppsData.applications.length).toBeGreaterThanOrEqual(1);
    expect(myAppsData.applications.some((a: any) => a.id === applicationId)).toBe(true);

    // 4. Recruiter reviews applications for job
    const recruiterAppsRes = await request.get(`${API_BASE}/jobs/${jobId}/applications`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(recruiterAppsRes.status()).toBe(200);
    const recruiterAppsData = await recruiterAppsRes.json();
    expect(recruiterAppsData.applications.length).toBeGreaterThanOrEqual(1);
    expect(recruiterAppsData.applications.some((a: any) => a.id === applicationId)).toBe(true);

    // 5. Recruiter transitions application: submitted -> in_review -> shortlisted -> interviewing
    const inReviewRes = await request.post(`${API_BASE}/applications/${applicationId}/transition`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        applicationId,
        targetState: 'in_review',
        reason: 'Reviewing initial technical qualifications.',
      },
    });
    expect(inReviewRes.status()).toBe(200);
    const inReviewData = await inReviewRes.json();
    expect(inReviewData.application.status).toBe('in_review');

    const shortlistRes = await request.post(`${API_BASE}/applications/${applicationId}/transition`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        applicationId,
        targetState: 'shortlisted',
        reason: 'Strong match on distributed systems skills.',
      },
    });
    expect(shortlistRes.status()).toBe(200);
    const shortlistData = await shortlistRes.json();
    expect(shortlistData.application.status).toBe('shortlisted');

    const interviewRes = await request.post(`${API_BASE}/applications/${applicationId}/transition`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        applicationId,
        targetState: 'interviewing',
        reason: 'Scheduled technical architecture loop.',
      },
    });
    expect(interviewRes.status()).toBe(200);
    const interviewData = await interviewRes.json();
    expect(interviewData.application.status).toBe('interviewing');
  });
});

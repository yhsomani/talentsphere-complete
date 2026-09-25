import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Referral Request System (F-142, S-11, BR-233..BR-240, P-02)', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let referrerToken: string;
  let referrerUserId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let jobId: string;
  let applicationId: string;
  let referralRequestId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.ref.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Dan Candidate',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Register Referrer
    const refRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `ref.e2e.${Date.now()}@apexcloud.io`,
        password: 'Password123!Secure',
        fullName: 'Elena Referrer',
        role: 'candidate',
      },
    });
    expect(refRes.status()).toBe(201);
    const refData = await refRes.json();
    referrerToken = refData.token;
    referrerUserId = refData.user.id;

    // 3. Register Recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `rec.e2e.${Date.now()}@apexcloud.io`,
        password: 'Password123!Secure',
        fullName: 'Fiona Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;

    // 4. Create Organization
    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: 'Apex Cloud Systems',
        slug: `apex-cloud-${Date.now()}`,
        website: 'https://apexcloud.io',
      },
    });
    expect(orgRes.status()).toBe(201);
    orgId = (await orgRes.json()).organization.id;

    // 5. Add Referrer as member of Organization (BR-237)
    const addMemRes = await request.post(`${API_BASE}/organizations/${orgId}/members`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        userId: referrerUserId,
        role: 'member',
      },
    });
    expect(addMemRes.status()).toBe(201);

    // 6. Create Job
    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Principal Cloud Architect',
        description: 'Lead multi-region multi-cloud architectures',
        location: 'San Francisco, CA',
        workMode: 'hybrid',
        jobType: 'full_time',
      },
    });
    expect(jobRes.status()).toBe(201);
    jobId = (await jobRes.json()).job.id;

    // 7. Publish Job
    const pubRes = await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });
    expect(pubRes.status()).toBe(200);

    // 8. Candidate applies
    const appRes = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'I designed Kubernetes platforms for Fortune 500 enterprises.',
      },
    });
    expect(appRes.status()).toBe(201);
    applicationId = (await appRes.json()).application.id;
  });

  test('enforces employment verification: rejects referral request for non-employee (BR-237)', async ({
    request,
  }) => {
    // Register outside user
    const outsideRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `outsider.e2e.${Date.now()}@other.com`,
        password: 'Password123!Secure',
        fullName: 'George Outsider',
        role: 'candidate',
      },
    });
    const outsideId = (await outsideRes.json()).user.id;

    const res = await request.post(`${API_BASE}/referrals/requests`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        referrerId: outsideId,
        jobId,
        pitch: 'Please refer me to this position!',
      },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error.message).toMatch(/referrer must be employed at target organization/);
  });

  test('creates referral request in pending status (BR-233, BR-237)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/referrals/requests`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        referrerId: referrerUserId,
        jobId,
        pitch:
          'Hi Elena, I have architected global Kubernetes clusters and would appreciate your referral!',
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.request.id).toBeDefined();
    expect(body.request.status).toBe('pending');
    expect(body.request.candidateId).toBe(candidateUserId);
    expect(body.request.referrerId).toBe(referrerUserId);
    expect(body.request.jobId).toBe(jobId);
    referralRequestId = body.request.id;
  });

  test('referrer inspects incoming request and candidate inspects outgoing request', async ({
    request,
  }) => {
    // Referrer incoming
    const inRes = await request.get(`${API_BASE}/referrals/requests/incoming`, {
      headers: { authorization: `Bearer ${referrerToken}` },
    });
    expect(inRes.status()).toBe(200);
    const inBody = await inRes.json();
    expect(inBody.requests.some((r: any) => r.id === referralRequestId)).toBe(true);

    // Candidate outgoing
    const outRes = await request.get(`${API_BASE}/referrals/requests/outgoing`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(outRes.status()).toBe(200);
    const outBody = await outRes.json();
    expect(outBody.requests.some((r: any) => r.id === referralRequestId)).toBe(true);
  });

  test('referrer approves referral, generates 12-month attribution outcome and tags application (BR-234..BR-240)', async ({
    request,
  }) => {
    const approveRes = await request.post(
      `${API_BASE}/referrals/requests/${referralRequestId}/respond`,
      {
        headers: { authorization: `Bearer ${referrerToken}` },
        data: { action: 'refer' },
      }
    );

    expect(approveRes.status()).toBe(200);
    const body = await approveRes.json();
    expect(body.request.status).toBe('approved');
    expect(body.outcome).toBeDefined();
    expect(body.outcome.status).toBe('referred');
    expect(body.outcome.rewardXp).toBe(500); // BR-236 default XP
    expect(body.outcome.attributionExpiresAt).toBeDefined(); // BR-240 12-month attribution

    // Verify candidate application has isReferred tag for recruiter view (BR-235)
    const appRes = await request.get(`${API_BASE}/applications/${applicationId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(appRes.status()).toBe(200);
    const appData = await appRes.json();
    expect(appData.application.isReferred).toBe(true);
    expect(appData.application.referralId).toBe(body.outcome.id);
  });

  test('organization recruiters can query referral outcomes (BR-240)', async ({ request }) => {
    const outcomesRes = await request.get(`${API_BASE}/referrals/outcomes?orgId=${orgId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(outcomesRes.status()).toBe(200);
    const body = await outcomesRes.json();
    expect(body.outcomes.length).toBeGreaterThanOrEqual(1);
    expect(
      body.outcomes.some((o: any) => o.candidateId === candidateUserId && o.jobId === jobId)
    ).toBe(true);
  });
});

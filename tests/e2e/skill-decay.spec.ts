import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Skill Decay & Freshness Tracking (F-123, BR-225..BR-232, P-02)', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let jobId: string;
  let validSkillId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.decay.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan SkillTrack',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;
    candidateProfileId = candData.profile.id;

    // 2. Register Recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `rec.decay.e2e.${Date.now()}@apexcloud.io`,
        password: 'Password123!Secure',
        fullName: 'Morgan Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;

    // 3. Create Recruiter Organization
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

    // 4. Fetch canonical skill
    const skillsRes = await request.get(`${API_BASE}/skills`);
    expect(skillsRes.status()).toBe(200);
    validSkillId = (await skillsRes.json()).skills[0].id;

    // 5. Post and publish job
    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Senior Systems Reliability Engineer',
        description: 'Lead high-scale multi-region distributed cluster operations.',
        location: 'San Francisco, CA',
        workMode: 'remote',
        jobType: 'full_time',
        requiredSkillIds: [validSkillId],
        salaryMinMinor: 15000000,
        salaryMaxMinor: 21000000,
        currency: 'USD',
      },
    });
    expect(jobRes.status()).toBe(201);
    jobId = (await jobRes.json()).job.id;

    await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });
  });

  test('candidate can register a skill for freshness tracking with initial 100 score and fresh band', async ({ request }) => {
    const res = await request.post(`${API_BASE}/skills/freshness`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        skillId: validSkillId,
        category: 'fast_changing',
        verificationSource: 'challenge',
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.freshness).toBeDefined();
    expect(body.freshness.skillId).toBe(validSkillId);
    expect(body.freshness.freshnessScore).toBe(100);
    expect(body.freshness.freshnessBand).toBe('fresh');
    expect(body.freshness.category).toBe('fast_changing');
    expect(body.freshness.isDemoted).toBe(false);

    // Retrieve private portfolio
    const myRes = await request.get(`${API_BASE}/skills/freshness/my`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(myRes.status()).toBe(200);
    const myBody = await myRes.json();
    expect(myBody.records.length).toBeGreaterThanOrEqual(1);
    const tracked = myBody.records.find((r: any) => r.skillId === validSkillId);
    expect(tracked).toBeDefined();
    expect(tracked.freshnessScore).toBe(100);
  });

  test('recruiter without application context cannot view candidate freshness (403 Forbidden, BR-230)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/candidates/${candidateProfileId}/skills/freshness`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toContain('BR-230');
  });

  test('recruiter within application context can inspect candidate skill freshness portfolio (BR-230)', async ({ request }) => {
    // Candidate applies to recruiter's job
    const applyRes = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Expertise in high-throughput cloud environments and cluster reliability.',
      },
    });
    expect(applyRes.status()).toBe(201);

    // Now recruiter accesses candidate freshness
    const res = await request.get(`${API_BASE}/candidates/${candidateProfileId}/skills/freshness`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.records)).toBe(true);
    expect(body.records.length).toBeGreaterThanOrEqual(1);
    const skillRecord = body.records.find((r: any) => r.skillId === validSkillId);
    expect(skillRecord).toBeDefined();
    expect(skillRecord.freshnessBand).toBe('fresh');
  });

  test('candidate can re-verify a skill via self-attestation with 0.5x credit and assessment challenge with 100 restoration', async ({ request }) => {
    // 1. Re-verify via self_attestation (BR-229: 0.5x credit)
    const selfRes = await request.post(`${API_BASE}/skills/${validSkillId}/reverify`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        source: 'self_attestation',
      },
    });

    expect(selfRes.status()).toBe(200);
    const selfBody = await selfRes.json();
    expect(selfBody.freshness.verificationSource).toBe('self_attestation');
    expect(selfBody.freshness.freshnessScore).toBe(100);

    // 2. Re-verify via challenge (BR-228: restores to 100)
    const chalRes = await request.post(`${API_BASE}/skills/${validSkillId}/reverify`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        source: 'challenge',
      },
    });

    expect(chalRes.status()).toBe(200);
    const chalBody = await chalRes.json();
    expect(chalBody.freshness.verificationSource).toBe('challenge');
    expect(chalBody.freshness.freshnessScore).toBe(100);
    expect(chalBody.freshness.freshnessBand).toBe('fresh');

    // 3. Nightly batch recalculation simulation (BR-225)
    const refreshRes = await request.post(`${API_BASE}/skills/freshness/refresh-all`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(refreshRes.status()).toBe(200);
    const refreshBody = await refreshRes.json();
    expect(refreshBody.message).toContain('BR-225');
  });
});

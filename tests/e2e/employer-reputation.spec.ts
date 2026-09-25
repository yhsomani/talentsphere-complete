import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Employer Reputation & Brand System (F-149, F-75, F-56, F-144, P-02)', () => {
  let candidateToken: string;
  let candidateId: string;
  let recruiterToken: string;
  let recruiterId: string;
  let orgId: string;

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // 1. Register Candidate
    const reg1 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.emp.${ts}@brandpulse.org`,
        password: 'Password123!Secure',
        fullName: 'Candidate Reviewer',
        role: 'candidate',
      },
    });
    expect(reg1.status()).toBe(201);
    const d1 = await reg1.json();
    candidateId = d1.user.id;
    candidateToken = d1.token;

    // 2. Register Recruiter
    const reg2 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.emp.${ts}@brandpulse.org`,
        password: 'Password123!Secure',
        fullName: 'Org Recruiter',
        role: 'recruiter',
      },
    });
    expect(reg2.status()).toBe(201);
    const d2 = await reg2.json();
    recruiterId = d2.user.id;
    recruiterToken = d2.token;

    // 3. Create Org
    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: `InnoCorp Solutions ${ts}`,
        slug: `innocorp-${ts}`,
        website: 'https://innocorp.example.com',
      },
    });
    expect(orgRes.status()).toBe(201);
    orgId = (await orgRes.json()).organization.id;
  });

  test('queries baseline employer reputation profile with transparent factor breakdown', async ({ request }) => {
    const res = await request.get(`${API_BASE}/reputation/organizations/${orgId}`);
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.profile.organizationId).toBe(orgId);
    expect(data.profile.overallScore).toBeGreaterThanOrEqual(50);
    expect(data.profile.reputationBand).toBe('developing');
    expect(data.profile.totalReviewsCount).toBe(0);
    expect(data.profile.factors.hiringScore).toBeDefined();
    expect(data.profile.factors.cultureScore).toBeDefined();
    expect(data.profile.factors.growthScore).toBeDefined();
    expect(data.profile.factors.compensationReliabilityScore).toBeDefined();
    expect(data.profile.factors.leadershipScore).toBeDefined();
  });

  test('submits employer review and updates reputation score dynamically (BR-F149-01)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/reputation/organizations/${orgId}/reviews`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        employmentStatus: 'candidate',
        hiringRating: 4.8,
        cultureRating: 4.6,
        growthRating: 4.4,
        compensationRating: 4.7,
        leadershipRating: 4.5,
        title: 'Exemplary interviewing and transparent team culture',
        feedback: 'Transparent compensation bracket, rapid feedback loops, and highly respectful interviewers.',
        isVerifiedEmployee: false,
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.review.organizationId).toBe(orgId);
    expect(data.review.reviewerId).toBe(candidateId);
    expect(data.profile.overallScore).toBeGreaterThan(70);
    expect(['strong_reputation', 'top_employer']).toContain(data.profile.reputationBand);
    expect(data.profile.totalReviewsCount).toBe(1);
  });

  test('enforces duplicate review prevention per user (BR-F149-02)', async ({ request }) => {
    const dupRes = await request.post(`${API_BASE}/reputation/organizations/${orgId}/reviews`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        employmentStatus: 'candidate',
        hiringRating: 5.0,
        cultureRating: 5.0,
        growthRating: 5.0,
        compensationRating: 5.0,
        leadershipRating: 5.0,
        title: 'Second review attempt',
      },
    });

    expect(dupRes.status()).toBe(409);
    const err = await dupRes.json();
    expect(err.error.code).toBe('CONFLICT');
  });

  test('updates operational metrics and elevates reputation into top tier', async ({ request }) => {
    const metricsRes = await request.post(`${API_BASE}/reputation/organizations/${orgId}/metrics`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        avgTimeToHireDays: 14,
        offerAcceptanceRate: 96,
        offerRescindedRate: 0,
        salaryTransparencyIndex: 98,
        internalPromotionRate: 90,
      },
    });

    expect(metricsRes.status()).toBe(200);
    const data = await metricsRes.json();
    expect(data.profile.overallScore).toBeGreaterThanOrEqual(85);
    expect(data.profile.reputationBand).toBe('top_employer');
    expect(data.profile.highlights.length).toBeGreaterThanOrEqual(2);

    // Verify reviews listing endpoint
    const reviewsRes = await request.get(`${API_BASE}/reputation/organizations/${orgId}/reviews`);
    expect(reviewsRes.status()).toBe(200);
    const reviewsData = await reviewsRes.json();
    expect(reviewsData.reviews).toHaveLength(1);
    expect(reviewsData.reviews[0].title).toBe('Exemplary interviewing and transparent team culture');
  });
});

import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Learning Impact Dashboard & Tracking (F-153, F-114, BR-189..BR-193, OD-51, P-02)', () => {
  let candidateToken: string;
  let candidateId: string;
  const seedCourseId = 'c0000000-0000-0000-0000-000000000001';

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // Register Candidate
    const reg = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `learner.impact.${ts}@academy.test`,
        password: 'Password123!Secure',
        fullName: 'Impact Learner E2E',
        role: 'candidate',
      },
    });
    expect(reg.status()).toBe(201);
    const d = await reg.json();
    candidateId = d.user.id;
    candidateToken = d.token;
  });

  test('records an opt-in learner career outcome (F-114, BR-190)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/learning/impact/outcomes`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        courseId: seedCourseId,
        hiredWithin12m: true,
        salaryGrowthPct: 26.0,
        jobSatisfactionScore: 4.7,
        retentionMonths: 14,
        promotedWithin18m: true,
        skillsUsedOnJob: ['TypeScript', 'Fastify', 'Architecture'],
        consentFlag: true,
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.outcome).toBeDefined();
    expect(data.outcome.courseId).toBe(seedCourseId);
    expect(data.outcome.hiredWithin12m).toBe(true);
    expect(data.outcome.salaryGrowthPct).toBe(26.0);
    expect(data.outcome.jobSatisfactionScore).toBe(4.7);
    expect(data.outcome.consentFlag).toBe(true);
  });

  test('enforces explicit consent policy on learner outcome tracking (BR-190)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/learning/impact/outcomes`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        courseId: seedCourseId,
        hiredWithin12m: true,
        consentFlag: false,
      },
    });

    expect(res.status()).toBe(422);
    const err = await res.json();
    expect(err.error.code).toBe('POLICY_VIOLATION');
    expect(err.error.message).toContain('BR-190');
  });

  test('retrieves publishable course impact metrics when cohort >= 30 with correlational claim label (BR-189, BR-193, OD-51)', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/learning/impact/courses/${seedCourseId}?minCohortSize=30`
    );
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.metrics).toBeDefined();
    expect(data.metrics.courseId).toBe(seedCourseId);
    expect(data.metrics.sampleCount).toBeGreaterThanOrEqual(30);
    expect(data.metrics.isPublishable).toBe(true);
    expect(data.metrics.hireRatePct).toBeGreaterThan(0);
    expect(data.metrics.pathEffectivenessScore).toBeGreaterThan(0);
    // BR-193, OD-51: All outcome claims labelled as correlational
    expect(data.metrics.correlationalClaimLabel).toContain('Correlational finding');
  });

  test('suppresses course impact metrics when sample cohort is below threshold (BR-189)', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/learning/impact/courses/${seedCourseId}?minCohortSize=200`
    );
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.isPublishable).toBe(false);
    expect(data.message).toContain('Insufficient measurable outcome data');
    expect(data.correlationalClaimLabel).toContain('Correlational finding');
  });

  test('recomputes course impact metrics with updated cohort parameters (BR-191)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/learning/impact/courses/${seedCourseId}/compute`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        enrolledCount: 60,
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.metrics).toBeDefined();
    expect(data.metrics.cohortSize).toBe(60);
    expect(data.metrics.sampleCount).toBeGreaterThan(0);
    expect(data.metrics.pathEffectivenessScore).toBeGreaterThan(0);
  });

  test('retrieves platform-wide learning impact dashboard with top performing courses (F-153)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/learning/impact/dashboard?limit=5`);
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.dashboard).toBeDefined();
    expect(data.dashboard.totalCoursesTracked).toBeGreaterThan(0);
    expect(data.dashboard.totalOutcomesSampled).toBeGreaterThanOrEqual(30);
    expect(data.dashboard.averageHireRatePct).toBeGreaterThan(0);
    expect(data.dashboard.topPerformingCourses).toBeDefined();
    expect(data.dashboard.correlationalDisclaimer).toContain('Correlational finding');
  });
});

import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Skill Supply/Demand Forecasting (F-151, F-84, F-86, F-97, P-02)', () => {
  let recruiterToken: string;
  let recruiterId: string;
  const canonicalSkillId = '10000000-0000-4000-a000-000000000001'; // TypeScript

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // Register Recruiter
    const reg = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.forecast.${ts}@futurelab.test`,
        password: 'Password123!Secure',
        fullName: 'Forecast Lab Lead',
        role: 'recruiter',
      },
    });
    expect(reg.status()).toBe(201);
    const d = await reg.json();
    recruiterId = d.user.id;
    recruiterToken = d.token;
  });

  test('queries top emerging skills with forward growth and scarcity scores', async ({ request }) => {
    const res = await request.get(`${API_BASE}/skills/forecast/top-growth?limit=5`);
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.topEmergingSkills).toBeDefined();
    expect(Array.isArray(data.topEmergingSkills)).toBe(true);
    expect(data.topEmergingSkills.length).toBeGreaterThan(0);

    const first = data.topEmergingSkills[0];
    expect(first.skillId).toBeDefined();
    expect(first.skillName).toBeDefined();
    expect(first.emergingScore).toBeGreaterThan(0);
    expect(first.forecast).toBeDefined();
    expect(first.forecast.forecastHorizonMonths).toBe(12);
    expect(first.forecast.confidenceLevel).toBe(0.95);
  });

  test('records a new real-time labor market signal for a skill', async ({ request }) => {
    const res = await request.post(`${API_BASE}/skills/${canonicalSkillId}/market-signals`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        demandPostingsCount: 2800,
        activeCandidatesCount: 1450,
        avgSalaryOffered: 160000,
        geographicRegion: 'North America',
        industry: 'Cloud Infrastructure',
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.signal.skillId).toBe(canonicalSkillId);
    expect(data.signal.demandPostingsCount).toBe(2800);
    expect(data.signal.activeCandidatesCount).toBe(1450);
    expect(data.signal.avgSalaryOffered).toBe(160000);
    expect(data.signal.industry).toBe('Cloud Infrastructure');
  });

  test('retrieves 12-month forward forecast with salary bounds and regional distributions', async ({ request }) => {
    const res = await request.get(`${API_BASE}/skills/${canonicalSkillId}/forecast?forecastHorizonMonths=12`);
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.skillId).toBe(canonicalSkillId);
    expect(data.forecast.forecastHorizonMonths).toBe(12);
    expect(data.forecast.confidenceLevel).toBe(0.95);
    expect(data.forecast.projectedMedianSalary).toBeGreaterThan(100000);
    expect(data.forecast.salaryLowerBound).toBeLessThanOrEqual(data.forecast.projectedMedianSalary);
    expect(data.forecast.salaryUpperBound).toBeGreaterThanOrEqual(data.forecast.projectedMedianSalary);
    expect(data.forecast.scarcityIndex).toBeGreaterThan(0);
    expect(data.forecast.estimatedWeeksToMarketability).toBeGreaterThan(0);
    expect(data.forecast.regionalDistribution).toBeDefined();
    expect(data.forecast.industryDistribution).toBeDefined();
  });

  test('generates on-demand custom horizon forecast with prerequisite depth', async ({ request }) => {
    const res = await request.post(`${API_BASE}/skills/${canonicalSkillId}/forecast/generate`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        forecastHorizonMonths: 24,
        skillCategory: 'Programming Languages',
        prerequisiteDepth: 2,
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.forecast.forecastHorizonMonths).toBe(24);
    expect(data.forecast.estimatedWeeksToMarketability).toBeGreaterThanOrEqual(8 + 2 * 4);
  });

  test('enforces validation and authentication error handling', async ({ request }) => {
    // 401 unauthenticated signal creation
    const unauth = await request.post(`${API_BASE}/skills/${canonicalSkillId}/market-signals`, {
      data: {
        demandPostingsCount: 100,
        activeCandidatesCount: 100,
      },
    });
    expect(unauth.status()).toBe(401);

    // 400 validation error (negative demand postings)
    const invalidData = await request.post(`${API_BASE}/skills/${canonicalSkillId}/market-signals`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        demandPostingsCount: -50,
        activeCandidatesCount: 100,
      },
    });
    expect(invalidData.status()).toBe(400);

    // 404 non-existent skill
    const notFound = await request.get(`${API_BASE}/skills/00000000-0000-0000-0000-000000000099/forecast`);
    expect(notFound.status()).toBe(404);
  });
});

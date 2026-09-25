import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Salary Intelligence & Compensation Benchmarks (F-86, BR-177..BR-183)', () => {
  let app: FastifyInstance;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;
  let submittedReportId: string;

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

    // 1. Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `sal.user1.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Dev Alpha',
        role: 'candidate',
      },
    });
    expect(res1.statusCode).toBe(201);
    const body1 = JSON.parse(res1.payload);
    user1Token = body1.token;
    user1Id = body1.user.id;

    // 2. Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `sal.user2.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Dev Beta',
        role: 'candidate',
      },
    });
    expect(res2.statusCode).toBe(201);
    const body2 = JSON.parse(res2.payload);
    user2Token = body2.token;
    user2Id = body2.user.id;

    // 3. Register User 3
    const res3 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `sal.user3.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Dev Gamma',
        role: 'candidate',
      },
    });
    expect(res3.statusCode).toBe(201);
    const body3 = JSON.parse(res3.payload);
    user3Token = body3.token;
    user3Id = body3.user.id;
  });

  it('rejects unauthenticated salary report submissions', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/salaries/reports',
      payload: {
        jobTitle: 'Backend Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'mid',
        location: 'San Francisco, CA',
        baseSalaryMinor: 14000000,
        yearsOfExperience: 4,
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('validates submission schema and rejects invalid salary numbers', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/salaries/reports',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        jobTitle: 'Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'mid',
        location: 'San Francisco, CA',
        baseSalaryMinor: -50000, // Invalid: must be positive
        yearsOfExperience: 3,
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('submits a verified salary report with weights (BR-177: self_reported 0.5, employment_verified 1.0)', async () => {
    // 1. Self reported (weight = 0.5)
    const selfRes = await app.inject({
      method: 'POST',
      url: '/api/v1/salaries/reports',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        jobTitle: 'Senior Cloud Systems Architect',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'senior',
        location: 'San Francisco, CA',
        baseSalaryMinor: 17500000,
        bonusMinor: 2000000,
        equityAnnualMinor: 4000000,
        yearsOfExperience: 7,
        companyName: 'CloudScale Technologies',
        companySize: 'enterprise',
        industry: 'Cloud Infrastructure',
        verificationType: 'self_reported',
      },
    });

    expect(selfRes.statusCode).toBe(201);
    const selfBody = JSON.parse(selfRes.payload);
    expect(selfBody.report.id).toBeDefined();
    expect(selfBody.report.verificationWeight).toBe(0.5);
    expect(selfBody.report.status).toBe('verified');
    submittedReportId = selfBody.report.id;

    // 2. Employment verified (weight = 1.0)
    const verifiedRes = await app.inject({
      method: 'POST',
      url: '/api/v1/salaries/reports',
      headers: { authorization: `Bearer ${user2Token}` },
      payload: {
        jobTitle: 'Senior Backend Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'senior',
        location: 'San Francisco, CA',
        baseSalaryMinor: 18500000,
        bonusMinor: 2500000,
        equityAnnualMinor: 5000000,
        yearsOfExperience: 8,
        companyName: 'CloudScale Technologies',
        verificationType: 'employment_verified',
      },
    });

    expect(verifiedRes.statusCode).toBe(201);
    const verifiedBody = JSON.parse(verifiedRes.payload);
    expect(verifiedBody.report.verificationWeight).toBe(1.0);
  });

  it('allows candidate to view their submitted reports', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/salaries/reports/my',
      headers: { authorization: `Bearer ${user1Token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.reports.length).toBeGreaterThanOrEqual(1);
    expect(body.reports.some((r: any) => r.id === submittedReportId)).toBe(true);
  });

  it('enforces k-anonymity privacy protection before minimum cohort is reached (BR-178)', async () => {
    // We currently have 2 backend_engineer:senior reports. Policy requires >= 3 reports.
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/salaries/benchmarks?role=backend_engineer&level=senior',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('insufficient_data');
    expect(body.minRequired).toBe(3);
    expect(body.actualCount).toBe(2);
    expect(body.message).toContain('BR-178');
  });

  it('returns comprehensive percentile distribution once cohort reaches k-anonymity (BR-178, BR-183)', async () => {
    // User 3 submits 3rd report for backend_engineer:senior
    const res3 = await app.inject({
      method: 'POST',
      url: '/api/v1/salaries/reports',
      headers: { authorization: `Bearer ${user3Token}` },
      payload: {
        jobTitle: 'Senior Infrastructure Software Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'senior',
        location: 'San Francisco, CA',
        baseSalaryMinor: 19500000,
        bonusMinor: 3000000,
        equityAnnualMinor: 6000000,
        yearsOfExperience: 9,
        companyName: 'CloudScale Technologies',
        verificationType: 'self_reported',
      },
    });
    expect(res3.statusCode).toBe(201);

    // Now cohort has 3 reports -> benchmark available!
    const benchmarkRes = await app.inject({
      method: 'GET',
      url: '/api/v1/salaries/benchmarks?role=backend_engineer&level=senior',
    });

    expect(benchmarkRes.statusCode).toBe(200);
    const body = JSON.parse(benchmarkRes.payload);
    expect(body.status).toBe('available');
    expect(body.benchmark.sampleCount).toBe(3);
    expect(body.benchmark.p50Minor).toBe(18500000); // Median of 175k, 185k, 195k
    expect(body.benchmark.minMinor).toBe(17500000);
    expect(body.benchmark.maxMinor).toBe(19500000);
    expect(body.benchmark.equityP50Minor).toBe(5000000); // Median equity
    expect(body.benchmark.bonusP50Minor).toBe(2500000); // Median bonus
  });

  it('enforces company reporting threshold of >= 3 reports (BR-180)', async () => {
    // 1. Company with 3 reports (CloudScale Technologies)
    const availableRes = await app.inject({
      method: 'GET',
      url: '/api/v1/salaries/company/CloudScale Technologies',
    });

    expect(availableRes.statusCode).toBe(200);
    const availableBody = JSON.parse(availableRes.payload);
    expect(availableBody.status).toBe('available');
    expect(availableBody.reportCount).toBe(3);
    expect(availableBody.medianBaseMinor).toBe(18500000);

    // 2. Company with < 3 reports
    const sparseRes = await app.inject({
      method: 'GET',
      url: '/api/v1/salaries/company/Startup Unicorn',
    });

    expect(sparseRes.statusCode).toBe(200);
    const sparseBody = JSON.parse(sparseRes.payload);
    expect(sparseBody.status).toBe('insufficient_reports');
    expect(sparseBody.minRequired).toBe(3);
  });

  it('enforces withdrawal rights and ownership (BR-181)', async () => {
    // User 2 cannot withdraw User 1's report (403 FORBIDDEN)
    const unauthorizedRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/salaries/reports/${submittedReportId}`,
      headers: { authorization: `Bearer ${user2Token}` },
    });
    expect(unauthorizedRes.statusCode).toBe(403);

    // User 1 withdraws their own report (200 OK)
    const withdrawRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/salaries/reports/${submittedReportId}`,
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(withdrawRes.statusCode).toBe(200);
    const withdrawBody = JSON.parse(withdrawRes.payload);
    expect(withdrawBody.report.status).toBe('withdrawn');

    // After withdrawal, cohort count drops from 3 to 2 -> drops below k-anonymity!
    const benchmarkRes = await app.inject({
      method: 'GET',
      url: '/api/v1/salaries/benchmarks?role=backend_engineer&level=senior',
    });
    const benchBody = JSON.parse(benchmarkRes.payload);
    expect(benchBody.status).toBe('insufficient_data');
    expect(benchBody.actualCount).toBe(2);
  });
});

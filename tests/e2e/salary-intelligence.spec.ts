import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Salary Intelligence & Compensation Benchmarks (F-86, BR-177..BR-183)', () => {
  let jordanToken: string;
  let jordanUserId: string;
  let alexToken: string;
  let morganToken: string;
  let jordanReportId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Jordan
    const res1 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `jordan.salary.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan Architect',
        role: 'candidate',
      },
    });
    expect(res1.status()).toBe(201);
    const data1 = await res1.json();
    jordanToken = data1.token;
    jordanUserId = data1.user.id;

    // 2. Register Alex
    const res2 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `alex.salary.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Alex Architect',
        role: 'candidate',
      },
    });
    expect(res2.status()).toBe(201);
    alexToken = (await res2.json()).token;

    // 3. Register Morgan
    const res3 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `morgan.salary.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Morgan Architect',
        role: 'candidate',
      },
    });
    expect(res3.status()).toBe(201);
    morganToken = (await res3.json()).token;
  });

  test('submits salary reports and protects candidate privacy under k-anonymity (BR-178)', async ({
    request,
  }) => {
    // 1. Jordan submits report 1
    const sub1 = await request.post(`${API_BASE}/salaries/reports`, {
      headers: { authorization: `Bearer ${jordanToken}` },
      data: {
        jobTitle: 'Staff Distributed Systems Architect',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'principal',
        location: 'San Francisco, CA',
        currency: 'USD',
        baseSalaryMinor: 18000000, // $180,000
        bonusMinor: 2000000,
        equityAnnualMinor: 5000000,
        yearsOfExperience: 9,
        companyName: 'Apex Cloud Systems',
        verificationType: 'self_reported',
      },
    });
    expect(sub1.status()).toBe(201);
    const sub1Data = await sub1.json();
    expect(sub1Data.report.verificationWeight).toBe(0.5);
    jordanReportId = sub1Data.report.id;

    // 2. Alex submits report 2
    const sub2 = await request.post(`${API_BASE}/salaries/reports`, {
      headers: { authorization: `Bearer ${alexToken}` },
      data: {
        jobTitle: 'Principal Backend Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'principal',
        location: 'San Francisco, CA',
        currency: 'USD',
        baseSalaryMinor: 20000000, // $200,000
        bonusMinor: 3000000,
        equityAnnualMinor: 7000000,
        yearsOfExperience: 10,
        companyName: 'Apex Cloud Systems',
        verificationType: 'employment_verified',
      },
    });
    expect(sub2.status()).toBe(201);
    const sub2Data = await sub2.json();
    expect(sub2Data.report.verificationWeight).toBe(1.0);

    // 3. Query benchmark with only 2 reports: must enforce k-anonymity privacy (BR-178)
    const benchSparse = await request.get(
      `${API_BASE}/salaries/benchmarks?role=backend_engineer&level=principal`
    );
    expect(benchSparse.status()).toBe(200);
    const sparseData = await benchSparse.json();
    expect(sparseData.status).toBe('insufficient_data');
    expect(sparseData.actualCount).toBe(2);
    expect(sparseData.minRequired).toBe(3);
  });

  test('aggregates compensation benchmarks once cohort threshold is met (BR-178, BR-180, BR-183)', async ({
    request,
  }) => {
    // 1. Morgan submits report 3
    const sub3 = await request.post(`${API_BASE}/salaries/reports`, {
      headers: { authorization: `Bearer ${morganToken}` },
      data: {
        jobTitle: 'Principal Cloud Architect',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'principal',
        location: 'San Francisco, CA',
        currency: 'USD',
        baseSalaryMinor: 22000000, // $220,000
        bonusMinor: 4000000,
        equityAnnualMinor: 9000000,
        yearsOfExperience: 11,
        companyName: 'Apex Cloud Systems',
        verificationType: 'self_reported',
      },
    });
    expect(sub3.status()).toBe(201);

    // 2. Query benchmark: now available!
    const benchRes = await request.get(
      `${API_BASE}/salaries/benchmarks?role=backend_engineer&level=principal`
    );
    expect(benchRes.status()).toBe(200);
    const benchData = await benchRes.json();
    expect(benchData.status).toBe('available');
    expect(benchData.benchmark.sampleCount).toBe(3);
    expect(benchData.benchmark.p50Minor).toBe(20000000); // Median: $200,000
    expect(benchData.benchmark.minMinor).toBe(18000000);
    expect(benchData.benchmark.maxMinor).toBe(22000000);
    expect(benchData.benchmark.equityP50Minor).toBe(7000000); // Median equity

    // 3. Query company compensation summary (Apex Cloud Systems >= 3 reports BR-180)
    const companyRes = await request.get(`${API_BASE}/salaries/company/Apex%20Cloud%20Systems`);
    expect(companyRes.status()).toBe(200);
    const companyData = await companyRes.json();
    expect(companyData.status).toBe('available');
    expect(companyData.reportCount).toBe(3);
    expect(companyData.medianBaseMinor).toBe(20000000);
  });

  test('withdraws salary submission and updates live aggregates (BR-181)', async ({ request }) => {
    // 1. Jordan withdraws their report
    const delRes = await request.delete(`${API_BASE}/salaries/reports/${jordanReportId}`, {
      headers: { authorization: `Bearer ${jordanToken}` },
    });
    expect(delRes.status()).toBe(200);
    const delData = await delRes.json();
    expect(delData.report.status).toBe('withdrawn');

    // 2. Query benchmark again: active cohort count is now 2, falls below k-anonymity!
    const benchRes = await request.get(
      `${API_BASE}/salaries/benchmarks?role=backend_engineer&level=principal`
    );
    expect(benchRes.status()).toBe(200);
    const benchData = await benchRes.json();
    expect(benchData.status).toBe('insufficient_data');
    expect(benchData.actualCount).toBe(2);
  });
});

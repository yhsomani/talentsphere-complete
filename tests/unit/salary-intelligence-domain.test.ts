import { describe, it, expect } from 'vitest';
import {
  calculateVerificationWeight,
  detectSalaryOutlier,
  createSalaryReport,
  withdrawSalaryReport,
  computeSalaryAggregates,
  querySalaryBenchmark,
  queryCompanySalarySummary,
  countDistinctReporters,
  type SalaryReport,
} from '../../packages/domain/src/salary-intelligence.js';

describe('Domain: Salary Intelligence & Compensation Benchmarks (F-86, BR-177..BR-183)', () => {
  it('calculates verification weight accurately according to BR-177 (0.5 vs 1.0)', () => {
    expect(calculateVerificationWeight('self_reported')).toBe(0.5);
    expect(calculateVerificationWeight('employment_verified')).toBe(1.0);
  });

  it('detects implausible outliers based on absolute thresholds and distribution variance', () => {
    // Implausibly low (< $10,000 / 1,000,000 minor)
    expect(detectSalaryOutlier(500000)).toBe(true);

    // Implausibly high (> $3,500,000 / 350,000,000 minor)
    expect(detectSalaryOutlier(400000000)).toBe(true);

    // Normal tech salary: $150,000 (15,000,000 minor)
    expect(detectSalaryOutlier(15000000)).toBe(false);

    // With established distribution cluster: mean ~150k
    const existingReports: SalaryReport[] = [
      { baseSalaryMinor: 14000000, status: 'verified' } as any,
      { baseSalaryMinor: 15000000, status: 'verified' } as any,
      { baseSalaryMinor: 15500000, status: 'verified' } as any,
      { baseSalaryMinor: 14500000, status: 'verified' } as any,
      { baseSalaryMinor: 16000000, status: 'verified' } as any,
    ];

    // Standard deviation is ~6600 minor. 250,000 is > 10 stddev away -> outlier
    expect(detectSalaryOutlier(25000000, existingReports)).toBe(true);
    // 152,000 is within 1 stddev -> valid
    expect(detectSalaryOutlier(15200000, existingReports)).toBe(false);
  });

  it('creates salary reports with validation, rounding, and verified status', () => {
    const report = createSalaryReport({
      userId: 'user_cand_1',
      jobTitle: 'Senior Full Stack Engineer',
      standardizedRole: 'FullStack_Engineer',
      seniorityLevel: 'senior',
      location: 'New York, NY',
      countryCode: 'US',
      workMode: 'hybrid',
      currency: 'USD',
      baseSalaryMinor: 16500000, // $165,000
      bonusMinor: 1500000, // $15,000
      equityAnnualMinor: 3000000, // $30,000
      yearsOfExperience: 6.5,
      companyName: 'Acme SaaS Corp',
      companySize: 'midsize',
      industry: 'Enterprise Software',
      verificationType: 'employment_verified',
    });

    expect(report.id).toBeDefined();
    expect(report.userId).toBe('user_cand_1');
    expect(report.standardizedRole).toBe('fullstack_engineer'); // Normalized to lower-case
    expect(report.seniorityLevel).toBe('senior');
    expect(report.verificationType).toBe('employment_verified');
    expect(report.verificationWeight).toBe(1.0);
    expect(report.status).toBe('verified');
    expect(report.baseSalaryMinor).toBe(16500000);
    expect(report.bonusMinor).toBe(1500000);
    expect(report.equityAnnualMinor).toBe(3000000);
  });

  it('validates required fields and rejects invalid inputs', () => {
    expect(() =>
      createSalaryReport({
        userId: 'user_cand_1',
        jobTitle: '',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'mid',
        location: 'Remote',
        baseSalaryMinor: 12000000,
        yearsOfExperience: 3,
      })
    ).toThrowError(/Job title must be at least 2 characters/);

    expect(() =>
      createSalaryReport({
        userId: 'user_cand_1',
        jobTitle: 'Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'mid',
        location: 'Remote',
        baseSalaryMinor: -100, // Invalid negative salary
        yearsOfExperience: 3,
      })
    ).toThrowError(/Base salary must be greater than zero/);

    expect(() =>
      createSalaryReport({
        userId: 'user_cand_1',
        jobTitle: 'Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'mid',
        location: 'Remote',
        baseSalaryMinor: 12000000,
        yearsOfExperience: -2, // Invalid experience
      })
    ).toThrowError(/Years of experience cannot be negative/);
  });

  it('allows user to withdraw their salary submission and enforces ownership (BR-181)', () => {
    const report = createSalaryReport({
      userId: 'user_cand_1',
      jobTitle: 'Data Engineer',
      standardizedRole: 'data_engineer',
      seniorityLevel: 'mid',
      location: 'Chicago, IL',
      baseSalaryMinor: 12500000,
      yearsOfExperience: 3,
    });

    // Foreign user cannot withdraw
    expect(() => withdrawSalaryReport(report, 'intruder_user_99')).toThrowError(
      /Users may only withdraw their own salary reports/
    );

    // Legitimate owner withdraws
    const withdrawn = withdrawSalaryReport(report, 'user_cand_1');
    expect(withdrawn.status).toBe('withdrawn');

    // Duplicate withdrawal rejected
    expect(() => withdrawSalaryReport(withdrawn, 'user_cand_1')).toThrowError(
      /Salary report is already withdrawn/
    );
  });

  // Person n reports base 130k + n*10k, equity n*1M, bonus n*0.5M (USD minor units).
  const seniorBackendReport = (n: number, userId = `u${n}`) =>
    createSalaryReport({
      userId,
      jobTitle: 'Senior Backend Engineer',
      standardizedRole: 'backend_engineer',
      seniorityLevel: 'senior',
      location: n % 2 ? 'San Francisco, CA' : 'Austin, TX',
      baseSalaryMinor: 13000000 + n * 1000000,
      equityAnnualMinor: n * 1000000,
      bonusMinor: n * 500000,
      yearsOfExperience: 5 + n,
    });

  it('computes salary percentiles and equity aggregates with k-anonymity (BR-178, BR-183)', () => {
    const reports: SalaryReport[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => seniorBackendReport(n));

    // Nine people: below BR-178's floor of 10, even when asked for 3 (G-27, ADR-028).
    expect(computeSalaryAggregates(reports, 3).get('backend_engineer:senior:USD')).toBeUndefined();

    reports.push(seniorBackendReport(10));
    const aggregates = computeSalaryAggregates(reports, 3);
    const cohort = aggregates.get('backend_engineer:senior:USD');
    expect(cohort).toBeDefined();
    expect(cohort?.sampleCount).toBe(10);
    expect(cohort?.p50Minor).toBe(18500000); // Median of 140k..230k
    expect(cohort?.equityP50Minor).toBe(5500000); // Median equity
    expect(cohort?.bonusP50Minor).toBe(2750000); // Median bonus
    // No individual figure and no one person's location (REV-05).
    expect(cohort).not.toHaveProperty('minMinor');
    expect(cohort).not.toHaveProperty('maxMinor');
    expect(cohort).not.toHaveProperty('meanMinor');
    expect(cohort?.location).toBe('all');
  });

  it('counts different people, not reports, toward the cohort (BR-178, ADR-028)', () => {
    // One person filing ten reports is still one person.
    const onePerson = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => seniorBackendReport(n, 'u1'));
    expect(countDistinctReporters(onePerson)).toBe(1);
    expect(computeSalaryAggregates(onePerson).size).toBe(0);

    // Twelve reports from nine people: not enough.
    const ninePeople = [
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => seniorBackendReport(n)),
      seniorBackendReport(10, 'u1'),
      seniorBackendReport(11, 'u2'),
      seniorBackendReport(12, 'u3'),
    ];
    expect(computeSalaryAggregates(ninePeople).size).toBe(0);
    const result = querySalaryBenchmark(ninePeople, { role: 'backend_engineer', level: 'senior' });
    expect(result.status).toBe('insufficient_data');
    if (result.status === 'insufficient_data') {
      expect(result.actualCount).toBe(9);
      expect(result.minRequired).toBe(10);
    }

    const tenPeople = [...ninePeople, seniorBackendReport(13, 'u10')];
    expect(
      querySalaryBenchmark(tenPeople, { role: 'backend_engineer', level: 'senior' }).status
    ).toBe('available');
  });

  it('enforces k-anonymity privacy protection on query benchmark (BR-178)', () => {
    const singleReport = [
      createSalaryReport({
        userId: 'u1',
        jobTitle: 'Rare Specialty Role',
        standardizedRole: 'quantum_cryptographer',
        seniorityLevel: 'principal',
        location: 'Zurich, Switzerland',
        baseSalaryMinor: 25000000,
        yearsOfExperience: 10,
      }),
    ];

    // Even a caller asking for a cohort of 1 gets BR-178's floor of 10 (G-27).
    for (const requested of [1, 3, undefined]) {
      const result = querySalaryBenchmark(
        singleReport,
        { role: 'quantum_cryptographer', level: 'principal' },
        requested
      );

      expect(result.status).toBe('insufficient_data');
      if (result.status === 'insufficient_data') {
        expect(result.actualCount).toBe(1);
        expect(result.minRequired).toBe(10);
        expect(result.message).toContain('BR-178');
      }
    }
  });

  it('enforces company reporting threshold of >= 3 reports (BR-180)', () => {
    const reports: SalaryReport[] = [
      createSalaryReport({
        userId: 'u1',
        jobTitle: 'SWE',
        standardizedRole: 'swe',
        seniorityLevel: 'mid',
        location: 'Austin, TX',
        baseSalaryMinor: 12000000,
        yearsOfExperience: 3,
        companyName: 'SmallStartup Inc',
      }),
      createSalaryReport({
        userId: 'u2',
        jobTitle: 'SWE',
        standardizedRole: 'swe',
        seniorityLevel: 'senior',
        location: 'Austin, TX',
        baseSalaryMinor: 16000000,
        yearsOfExperience: 6,
        companyName: 'SmallStartup Inc',
      }),
    ];

    // Only 2 reports for SmallStartup Inc -> below BR-180 threshold of 3
    const belowThreshold = queryCompanySalarySummary(reports, 'SmallStartup Inc', 3);
    expect(belowThreshold.status).toBe('insufficient_reports');
    if (belowThreshold.status === 'insufficient_reports') {
      expect(belowThreshold.reportCount).toBe(2);
      expect(belowThreshold.minRequired).toBe(3);
    }

    // Add a 3rd report
    reports.push(
      createSalaryReport({
        userId: 'u3',
        jobTitle: 'SWE Lead',
        standardizedRole: 'swe',
        seniorityLevel: 'lead',
        location: 'Austin, TX',
        baseSalaryMinor: 19000000,
        yearsOfExperience: 8,
        companyName: 'SmallStartup Inc',
      })
    );

    const available = queryCompanySalarySummary(reports, 'SmallStartup Inc', 3);
    expect(available.status).toBe('available');
    if (available.status === 'available') {
      expect(available.reportCount).toBe(3);
      expect(available.medianBaseMinor).toBe(16000000);
    }
  });
});

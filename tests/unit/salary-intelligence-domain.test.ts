import { describe, it, expect } from 'vitest';
import {
  calculateVerificationWeight,
  detectSalaryOutlier,
  createSalaryReport,
  withdrawSalaryReport,
  computeSalaryAggregates,
  querySalaryBenchmark,
  queryCompanySalarySummary,
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

  it('computes salary percentiles and equity aggregates with k-anonymity (BR-178, BR-183)', () => {
    const reports: SalaryReport[] = [
      createSalaryReport({
        userId: 'u1',
        jobTitle: 'Backend Dev',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'senior',
        location: 'San Francisco, CA',
        baseSalaryMinor: 14000000,
        equityAnnualMinor: 2000000,
        bonusMinor: 1000000,
        yearsOfExperience: 5,
      }),
      createSalaryReport({
        userId: 'u2',
        jobTitle: 'Senior Backend Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'senior',
        location: 'San Francisco, CA',
        baseSalaryMinor: 16000000,
        equityAnnualMinor: 4000000,
        bonusMinor: 2000000,
        yearsOfExperience: 6,
      }),
      createSalaryReport({
        userId: 'u3',
        jobTitle: 'Staff Backend Architect',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'senior',
        location: 'San Francisco, CA',
        baseSalaryMinor: 18000000,
        equityAnnualMinor: 6000000,
        bonusMinor: 3000000,
        yearsOfExperience: 8,
      }),
      createSalaryReport({
        userId: 'u4',
        jobTitle: 'Backend Engineer',
        standardizedRole: 'backend_engineer',
        seniorityLevel: 'senior',
        location: 'San Francisco, CA',
        baseSalaryMinor: 20000000,
        equityAnnualMinor: 8000000,
        bonusMinor: 4000000,
        yearsOfExperience: 9,
      }),
    ];

    const aggregates = computeSalaryAggregates(reports, 3);
    const cohort = aggregates.get('backend_engineer:senior:USD');
    expect(cohort).toBeDefined();
    expect(cohort?.sampleCount).toBe(4);
    expect(cohort?.p50Minor).toBe(17000000); // Median between 160k and 180k
    expect(cohort?.equityP50Minor).toBe(5000000); // Median equity
    expect(cohort?.bonusP50Minor).toBe(2500000); // Median bonus
    expect(cohort?.minMinor).toBe(14000000);
    expect(cohort?.maxMinor).toBe(20000000);
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

    // Querying with minCohortSize = 3 should return insufficient_data to protect anonymity
    const result = querySalaryBenchmark(
      singleReport,
      { role: 'quantum_cryptographer', level: 'principal' },
      3
    );

    expect(result.status).toBe('insufficient_data');
    if (result.status === 'insufficient_data') {
      expect(result.actualCount).toBe(1);
      expect(result.minRequired).toBe(3);
      expect(result.message).toContain('BR-178');
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

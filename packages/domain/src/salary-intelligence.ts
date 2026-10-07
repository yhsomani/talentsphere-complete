import { DomainError } from './core.js';

export type SeniorityLevel =
  'entry' | 'mid' | 'senior' | 'lead' | 'principal' | 'director' | 'executive';

export type SalaryVerificationType = 'self_reported' | 'employment_verified';
export type SalaryReportStatus = 'submitted' | 'verified' | 'flagged_outlier' | 'withdrawn';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export interface SalaryReport {
  id: string;
  userId: string;
  jobTitle: string;
  standardizedRole: string;
  seniorityLevel: SeniorityLevel;
  location: string;
  countryCode: string;
  workMode?: WorkMode;
  currency: string;
  baseSalaryMinor: number;
  bonusMinor: number;
  equityAnnualMinor: number;
  yearsOfExperience: number;
  companyName?: string;
  companySize?: 'seed' | 'early' | 'midsize' | 'enterprise';
  industry?: string;
  verificationType: SalaryVerificationType;
  verificationWeight: number;
  status: SalaryReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitSalaryReportParams {
  id?: string;
  userId: string;
  jobTitle: string;
  standardizedRole: string;
  seniorityLevel: SeniorityLevel;
  location: string;
  countryCode?: string;
  workMode?: WorkMode;
  currency?: string;
  baseSalaryMinor: number;
  bonusMinor?: number;
  equityAnnualMinor?: number;
  yearsOfExperience: number;
  companyName?: string;
  companySize?: 'seed' | 'early' | 'midsize' | 'enterprise';
  industry?: string;
  verificationType?: SalaryVerificationType;
  existingRoleReports?: SalaryReport[];
}

export interface SalaryBenchmarkCohort {
  cohortKey: string;
  standardizedRole: string;
  seniorityLevel: SeniorityLevel;
  location: string;
  currency: string;
  sampleCount: number;
  p25Minor: number;
  p50Minor: number; // Median
  p75Minor: number;
  p90Minor: number;
  meanMinor: number;
  minMinor: number;
  maxMinor: number;
  equityP50Minor: number;
  bonusP50Minor: number;
  updatedAt: string;
}

export interface SalaryQueryFilter {
  role?: string;
  level?: SeniorityLevel;
  location?: string;
  currency?: string;
}

export type BenchmarkQueryResult =
  | {
      status: 'available';
      benchmark: SalaryBenchmarkCohort;
    }
  | {
      status: 'insufficient_data';
      message: string;
      minRequired: number;
      actualCount: number;
    };

export type CompanyBenchmarkResult =
  | {
      status: 'available';
      companyName: string;
      reportCount: number;
      medianBaseMinor: number;
      p25Minor: number;
      p75Minor: number;
      currency: string;
    }
  | {
      status: 'insufficient_reports';
      message: string;
      companyName: string;
      reportCount: number;
      minRequired: number;
    };

/**
 * Computes verification weight based on verification method (BR-177).
 * self_reported = 0.50, employment_verified = 1.00
 */
export function calculateVerificationWeight(type: SalaryVerificationType): number {
  switch (type) {
    case 'employment_verified':
      return 1.0;
    case 'self_reported':
    default:
      return 0.5;
  }
}

/**
 * Detects whether a submitted salary report is an implausible outlier (BR-177, BR-180).
 */
export function detectSalaryOutlier(
  baseSalaryMinor: number,
  existingReports: SalaryReport[] = []
): boolean {
  // Absolute sane bounds: < $10k (1,000,000 minor) or > $3.5M (350,000,000 minor)
  if (baseSalaryMinor < 1000000 || baseSalaryMinor > 350000000) {
    return true;
  }

  const validActiveReports = existingReports.filter(
    (r) => r.status === 'verified' && r.baseSalaryMinor > 0
  );

  // If we have at least 5 established reports, check standard deviation (> 4.0 stddev)
  if (validActiveReports.length >= 5) {
    const values = validActiveReports.map((r) => r.baseSalaryMinor);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > 0 && Math.abs(baseSalaryMinor - mean) > 4.0 * stdDev) {
      return true;
    }
  }

  return false;
}

/**
 * Submits a new salary report with validation and outlier classification (F-86, BR-177..BR-183).
 */
export function createSalaryReport(params: SubmitSalaryReportParams): SalaryReport {
  if (!params.userId || params.userId.trim().length === 0) {
    throw new DomainError(
      'UNAUTHENTICATED',
      'User authentication required to submit salary report.'
    );
  }

  if (!params.jobTitle || params.jobTitle.trim().length < 2) {
    throw new DomainError('VALIDATION_FAILED', 'Job title must be at least 2 characters.');
  }

  if (!params.standardizedRole || params.standardizedRole.trim().length < 2) {
    throw new DomainError('VALIDATION_FAILED', 'Standardized role is required.');
  }

  if (!params.location || params.location.trim().length < 2) {
    throw new DomainError('VALIDATION_FAILED', 'Location is required.');
  }

  if (params.baseSalaryMinor <= 0) {
    throw new DomainError('VALIDATION_FAILED', 'Base salary must be greater than zero.');
  }

  if (params.yearsOfExperience < 0) {
    throw new DomainError('VALIDATION_FAILED', 'Years of experience cannot be negative.');
  }

  const verificationType = params.verificationType || 'self_reported';
  const verificationWeight = calculateVerificationWeight(verificationType);
  const isOutlier = detectSalaryOutlier(params.baseSalaryMinor, params.existingRoleReports);
  const status: SalaryReportStatus = isOutlier ? 'flagged_outlier' : 'verified';

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    userId: params.userId,
    jobTitle: params.jobTitle.trim(),
    standardizedRole: params.standardizedRole.trim().toLowerCase(),
    seniorityLevel: params.seniorityLevel,
    location: params.location.trim(),
    countryCode: (params.countryCode || 'US').trim().toUpperCase(),
    workMode: params.workMode,
    currency: (params.currency || 'USD').trim().toUpperCase(),
    baseSalaryMinor: Math.round(params.baseSalaryMinor),
    bonusMinor: Math.max(0, Math.round(params.bonusMinor || 0)),
    equityAnnualMinor: Math.max(0, Math.round(params.equityAnnualMinor || 0)),
    yearsOfExperience: Number(params.yearsOfExperience),
    companyName: params.companyName?.trim(),
    companySize: params.companySize,
    industry: params.industry?.trim(),
    verificationType,
    verificationWeight,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Withdraws a user's salary report (BR-181).
 */
export function withdrawSalaryReport(report: SalaryReport, requestingUserId: string): SalaryReport {
  if (report.userId !== requestingUserId) {
    throw new DomainError(
      'FORBIDDEN',
      'Users may only withdraw their own salary reports (BR-181).'
    );
  }

  if (report.status === 'withdrawn') {
    throw new DomainError('CONFLICT', 'Salary report is already withdrawn.');
  }

  return {
    ...report,
    status: 'withdrawn',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Computes percentile from a sorted array of numbers (0 <= p <= 1).
 */
function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = p * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
}

/**
 * Aggregates verified, non-withdrawn salary reports into statistical cohorts (BR-178, BR-183).
 */
export function computeSalaryAggregates(
  reports: SalaryReport[],
  minCohortSize: number = 3
): Map<string, SalaryBenchmarkCohort> {
  const activeReports = reports.filter((r) => r.status === 'verified');
  const grouped = new Map<string, SalaryReport[]>();

  for (const report of activeReports) {
    const key = `${report.standardizedRole}:${report.seniorityLevel}:${report.currency}`;
    const list = grouped.get(key) || [];
    list.push(report);
    grouped.set(key, list);
  }

  const aggregates = new Map<string, SalaryBenchmarkCohort>();
  const now = new Date().toISOString();

  for (const [cohortKey, cohortReports] of grouped.entries()) {
    if (cohortReports.length < minCohortSize) {
      continue; // k-anonymity privacy protection (BR-178)
    }

    const baseSalaries = cohortReports.map((r) => r.baseSalaryMinor).sort((a, b) => a - b);
    const equities = cohortReports.map((r) => r.equityAnnualMinor).sort((a, b) => a - b);
    const bonuses = cohortReports.map((r) => r.bonusMinor).sort((a, b) => a - b);

    const first = cohortReports[0];
    const mean = Math.round(baseSalaries.reduce((sum, val) => sum + val, 0) / baseSalaries.length);

    aggregates.set(cohortKey, {
      cohortKey,
      standardizedRole: first.standardizedRole,
      seniorityLevel: first.seniorityLevel,
      location: first.location,
      currency: first.currency,
      sampleCount: cohortReports.length,
      p25Minor: calculatePercentile(baseSalaries, 0.25),
      p50Minor: calculatePercentile(baseSalaries, 0.5), // Median
      p75Minor: calculatePercentile(baseSalaries, 0.75),
      p90Minor: calculatePercentile(baseSalaries, 0.9),
      meanMinor: mean,
      minMinor: baseSalaries[0],
      maxMinor: baseSalaries[baseSalaries.length - 1],
      equityP50Minor: calculatePercentile(equities, 0.5),
      bonusP50Minor: calculatePercentile(bonuses, 0.5),
      updatedAt: now,
    });
  }

  return aggregates;
}

/**
 * Retrieves benchmark for role/level/currency with strict k-anonymity privacy check (BR-178).
 */
export function querySalaryBenchmark(
  reports: SalaryReport[],
  filter: SalaryQueryFilter,
  minCohortSize: number = 3
): BenchmarkQueryResult {
  const currency = (filter.currency || 'USD').toUpperCase();
  const role = filter.role?.trim().toLowerCase();
  const level = filter.level;

  const matching = reports.filter((r) => {
    if (r.status !== 'verified') return false;
    if (r.currency !== currency) return false;
    if (role && r.standardizedRole !== role) return false;
    if (level && r.seniorityLevel !== level) return false;
    return true;
  });

  if (matching.length < minCohortSize) {
    return {
      status: 'insufficient_data',
      message: `Salary benchmark requires a minimum cohort of ${minCohortSize} verified reports to protect participant privacy (BR-178).`,
      minRequired: minCohortSize,
      actualCount: matching.length,
    };
  }

  const baseSalaries = matching.map((r) => r.baseSalaryMinor).sort((a, b) => a - b);
  const equities = matching.map((r) => r.equityAnnualMinor).sort((a, b) => a - b);
  const bonuses = matching.map((r) => r.bonusMinor).sort((a, b) => a - b);

  const mean = Math.round(baseSalaries.reduce((sum, val) => sum + val, 0) / baseSalaries.length);

  const cohortKey = `${role || 'all'}:${level || 'all'}:${currency}`;
  return {
    status: 'available',
    benchmark: {
      cohortKey,
      standardizedRole: role || 'all',
      seniorityLevel: level || ('mid' as SeniorityLevel),
      location: filter.location || 'all',
      currency,
      sampleCount: matching.length,
      p25Minor: calculatePercentile(baseSalaries, 0.25),
      p50Minor: calculatePercentile(baseSalaries, 0.5),
      p75Minor: calculatePercentile(baseSalaries, 0.75),
      p90Minor: calculatePercentile(baseSalaries, 0.9),
      meanMinor: mean,
      minMinor: baseSalaries[0],
      maxMinor: baseSalaries[baseSalaries.length - 1],
      equityP50Minor: calculatePercentile(equities, 0.5),
      bonusP50Minor: calculatePercentile(bonuses, 0.5),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Retrieves company-specific compensation summary (BR-180: requires >= 3 reports).
 */
export function queryCompanySalarySummary(
  reports: SalaryReport[],
  companyName: string,
  minThreshold: number = 3
): CompanyBenchmarkResult {
  const normTarget = companyName.trim().toLowerCase();
  const matching = reports.filter(
    (r) =>
      r.status === 'verified' && r.companyName && r.companyName.trim().toLowerCase() === normTarget
  );

  if (matching.length < minThreshold) {
    return {
      status: 'insufficient_reports',
      message: `Company-specific compensation data requires at least ${minThreshold} reports (BR-180).`,
      companyName,
      reportCount: matching.length,
      minRequired: minThreshold,
    };
  }

  const baseSalaries = matching.map((r) => r.baseSalaryMinor).sort((a, b) => a - b);
  return {
    status: 'available',
    companyName: matching[0].companyName || companyName,
    reportCount: matching.length,
    currency: matching[0].currency,
    medianBaseMinor: calculatePercentile(baseSalaries, 0.5),
    p25Minor: calculatePercentile(baseSalaries, 0.25),
    p75Minor: calculatePercentile(baseSalaries, 0.75),
  };
}

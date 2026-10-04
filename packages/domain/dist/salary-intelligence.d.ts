export type SeniorityLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'principal' | 'director' | 'executive';
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
    p50Minor: number;
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
export type BenchmarkQueryResult = {
    status: 'available';
    benchmark: SalaryBenchmarkCohort;
} | {
    status: 'insufficient_data';
    message: string;
    minRequired: number;
    actualCount: number;
};
export type CompanyBenchmarkResult = {
    status: 'available';
    companyName: string;
    reportCount: number;
    medianBaseMinor: number;
    p25Minor: number;
    p75Minor: number;
    currency: string;
} | {
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
export declare function calculateVerificationWeight(type: SalaryVerificationType): number;
/**
 * Detects whether a submitted salary report is an implausible outlier (BR-177, BR-180).
 */
export declare function detectSalaryOutlier(baseSalaryMinor: number, existingReports?: SalaryReport[]): boolean;
/**
 * Submits a new salary report with validation and outlier classification (F-86, BR-177..BR-183).
 */
export declare function createSalaryReport(params: SubmitSalaryReportParams): SalaryReport;
/**
 * Withdraws a user's salary report (BR-181).
 */
export declare function withdrawSalaryReport(report: SalaryReport, requestingUserId: string): SalaryReport;
/**
 * Aggregates verified, non-withdrawn salary reports into statistical cohorts (BR-178, BR-183).
 */
export declare function computeSalaryAggregates(reports: SalaryReport[], minCohortSize?: number): Map<string, SalaryBenchmarkCohort>;
/**
 * Retrieves benchmark for role/level/currency with strict k-anonymity privacy check (BR-178).
 */
export declare function querySalaryBenchmark(reports: SalaryReport[], filter: SalaryQueryFilter, minCohortSize?: number): BenchmarkQueryResult;
/**
 * Retrieves company-specific compensation summary (BR-180: requires >= 3 reports).
 */
export declare function queryCompanySalarySummary(reports: SalaryReport[], companyName: string, minThreshold?: number): CompanyBenchmarkResult;
//# sourceMappingURL=salary-intelligence.d.ts.map
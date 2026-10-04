export interface SkillMarketSignal {
    id: string;
    skillId: string;
    recordedAt: string;
    demandPostingsCount: number;
    activeCandidatesCount: number;
    avgSalaryOffered?: number;
    geographicRegion: string;
    industry: string;
}
export interface SkillForecast {
    id?: string;
    skillId: string;
    forecastHorizonMonths: number;
    demandGrowthPct: number;
    supplyGrowthPct: number;
    scarcityIndex: number;
    projectedMedianSalary: number;
    salaryLowerBound: number;
    salaryUpperBound: number;
    confidenceLevel: number;
    estimatedWeeksToMarketability: number;
    regionalDistribution: Record<string, number>;
    industryDistribution: Record<string, number>;
    historicalAccuracyMape?: number;
    generatedAt: string;
}
export interface RecordSkillMarketSignalParams {
    id?: string;
    skillId: string;
    demandPostingsCount: number;
    activeCandidatesCount: number;
    avgSalaryOffered?: number;
    geographicRegion?: string;
    industry?: string;
    recordedAt?: string;
}
export interface ComputeSkillForecastParams {
    id?: string;
    skillId: string;
    signals: SkillMarketSignal[];
    forecastHorizonMonths?: number;
    skillCategory?: string;
    prerequisiteDepth?: number;
    previousForecast?: SkillForecast;
}
/**
 * Validates and records a real-time labor market signal for a skill (F-151, F-84, F-97).
 */
export declare function recordSkillMarketSignal(params: RecordSkillMarketSignalParams): SkillMarketSignal;
/**
 * Computes a 12-month (or custom horizon) forward-looking supply/demand forecast with confidence intervals (F-151).
 */
export declare function computeSkillForecast(params: ComputeSkillForecastParams): SkillForecast;
/**
 * Ranks top emerging skills based on demand trajectory and scarcity pressure (F-151).
 */
export declare function rankTopEmergingSkills(skillsWithForecasts: Array<{
    skillId: string;
    skillName: string;
    forecast: SkillForecast;
}>, limit?: number): Array<{
    skillId: string;
    skillName: string;
    emergingScore: number;
    forecast: SkillForecast;
}>;
//# sourceMappingURL=skill-forecasting.d.ts.map
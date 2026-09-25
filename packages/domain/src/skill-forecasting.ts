import { DomainError } from './index.js';

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
export function recordSkillMarketSignal(params: RecordSkillMarketSignalParams): SkillMarketSignal {
  if (!params.skillId || typeof params.skillId !== 'string' || params.skillId.trim() === '') {
    throw new DomainError('VALIDATION_FAILED', 'Skill ID is required to record a market signal.');
  }

  if (
    typeof params.demandPostingsCount !== 'number' ||
    params.demandPostingsCount < 0 ||
    !Number.isInteger(params.demandPostingsCount)
  ) {
    throw new DomainError('VALIDATION_FAILED', 'Demand postings count must be a non-negative integer.');
  }

  if (
    typeof params.activeCandidatesCount !== 'number' ||
    params.activeCandidatesCount < 0 ||
    !Number.isInteger(params.activeCandidatesCount)
  ) {
    throw new DomainError('VALIDATION_FAILED', 'Active candidates count must be a non-negative integer.');
  }

  if (params.avgSalaryOffered !== undefined) {
    if (typeof params.avgSalaryOffered !== 'number' || params.avgSalaryOffered <= 0 || isNaN(params.avgSalaryOffered)) {
      throw new DomainError('VALIDATION_FAILED', 'Average salary offered must be a positive number.');
    }
  }

  return {
    id: params.id || crypto.randomUUID(),
    skillId: params.skillId,
    recordedAt: params.recordedAt || new Date().toISOString(),
    demandPostingsCount: params.demandPostingsCount,
    activeCandidatesCount: params.activeCandidatesCount,
    avgSalaryOffered: params.avgSalaryOffered ? Math.round(params.avgSalaryOffered * 100) / 100 : undefined,
    geographicRegion: params.geographicRegion?.trim() || 'Global',
    industry: params.industry?.trim() || 'Technology',
  };
}

/**
 * Computes a 12-month (or custom horizon) forward-looking supply/demand forecast with confidence intervals (F-151).
 */
export function computeSkillForecast(params: ComputeSkillForecastParams): SkillForecast {
  if (!params.skillId || typeof params.skillId !== 'string' || params.skillId.trim() === '') {
    throw new DomainError('VALIDATION_FAILED', 'Skill ID is required to compute a forecast.');
  }

  const horizonMonths = params.forecastHorizonMonths ?? 12;
  if (
    typeof horizonMonths !== 'number' ||
    !Number.isInteger(horizonMonths) ||
    horizonMonths < 1 ||
    horizonMonths > 36
  ) {
    throw new DomainError('VALIDATION_FAILED', 'Forecast horizon months must be an integer between 1 and 36.');
  }

  if (!params.signals || params.signals.length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'At least one market signal is required to compute a forecast.');
  }

  // Sort signals chronologically
  const sortedSignals = [...params.signals].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const horizonYears = horizonMonths / 12;

  // 1. Demand & Supply Growth calculations
  let demandGrowthPct = 5.0; // default baseline moderate growth
  let supplyGrowthPct = 3.0; // default baseline talent growth

  if (sortedSignals.length >= 2) {
    const oldest = sortedSignals[0];
    const newest = sortedSignals[sortedSignals.length - 1];

    const oldestTime = new Date(oldest.recordedAt).getTime();
    const newestTime = new Date(newest.recordedAt).getTime();
    const monthsElapsed = Math.max(1, (newestTime - oldestTime) / (1000 * 60 * 60 * 24 * 30.4375));

    const demandChange = (newest.demandPostingsCount - oldest.demandPostingsCount) / Math.max(1, oldest.demandPostingsCount);
    demandGrowthPct = Math.round((demandChange * (12 / monthsElapsed) * 100) * 100) / 100;

    const supplyChange = (newest.activeCandidatesCount - oldest.activeCandidatesCount) / Math.max(1, oldest.activeCandidatesCount);
    supplyGrowthPct = Math.round((supplyChange * (12 / monthsElapsed) * 100) * 100) / 100;
  }

  // 2. Scarcity Index (0.000 to 1.000)
  // Combines current posting/candidate ratio with projected growth differential
  const latestSignal = sortedSignals[sortedSignals.length - 1];
  const totalPool = latestSignal.demandPostingsCount + latestSignal.activeCandidatesCount;
  const ratio = totalPool > 0 ? latestSignal.demandPostingsCount / totalPool : 0.5;

  // Growth differential: demand growth outpacing supply growth increases scarcity
  const growthDifferential = (demandGrowthPct - supplyGrowthPct) / 100;
  const clampedGrowthFactor = Math.max(-0.5, Math.min(0.5, growthDifferential));

  const rawScarcity = 0.65 * ratio + 0.35 * (0.5 + clampedGrowthFactor);
  const scarcityIndex = Math.round(Math.max(0.001, Math.min(0.999, rawScarcity)) * 1000) / 1000;

  // 3. Salary Trend Prediction & 95% Confidence Interval
  const signalsWithSalary = sortedSignals.filter(
    (s) => s.avgSalaryOffered !== undefined && s.avgSalaryOffered > 0
  );

  const baselineSalary =
    signalsWithSalary.length > 0
      ? signalsWithSalary.reduce((sum, s) => sum + (s.avgSalaryOffered || 0), 0) / signalsWithSalary.length
      : 110000; // baseline market tech median

  // Annual salary growth driven by baseline inflation (3%) + scarcity premium (up to 12%)
  const annualSalaryGrowth = 0.03 + (scarcityIndex - 0.5) * 0.12;
  const projectedMedianSalary = Math.round(baselineSalary * (1 + annualSalaryGrowth * horizonYears));

  // 95% Confidence Interval (z = 1.96, std dev estimated proportional to horizon and signal variance)
  const salaryStdDev = signalsWithSalary.length > 1
    ? Math.sqrt(
        signalsWithSalary.reduce((sum, s) => sum + Math.pow((s.avgSalaryOffered || 0) - baselineSalary, 2), 0) /
          (signalsWithSalary.length - 1)
      )
    : baselineSalary * 0.10;

  const marginOfError = Math.round(
    Math.max(
      projectedMedianSalary * 0.05,
      1.96 * (salaryStdDev / Math.sqrt(Math.max(1, signalsWithSalary.length))) * Math.sqrt(horizonYears)
    )
  );

  const salaryLowerBound = Math.max(30000, projectedMedianSalary - marginOfError);
  const salaryUpperBound = projectedMedianSalary + marginOfError;

  // 4. Time to Marketability (weeks)
  const category = (params.skillCategory || '').toLowerCase();
  let baseWeeks = 8;
  if (category.includes('ai') || category.includes('ml') || category.includes('data science') || category.includes('machine learning')) {
    baseWeeks = 16;
  } else if (category.includes('security') || category.includes('systems') || category.includes('cloud') || category.includes('devops')) {
    baseWeeks = 12;
  } else if (category.includes('design') || category.includes('frontend') || category.includes('qa')) {
    baseWeeks = 6;
  }

  const depthBonus = Math.max(0, (params.prerequisiteDepth ?? 0) * 4);
  const estimatedWeeksToMarketability = Math.max(1, baseWeeks + depthBonus);

  // 5. Regional & Industry Distributions
  const regionCounts: Record<string, number> = {};
  const industryCounts: Record<string, number> = {};
  let totalDemandAcrossSignals = 0;

  for (const signal of sortedSignals) {
    const weight = Math.max(1, signal.demandPostingsCount);
    totalDemandAcrossSignals += weight;
    regionCounts[signal.geographicRegion] = (regionCounts[signal.geographicRegion] || 0) + weight;
    industryCounts[signal.industry] = (industryCounts[signal.industry] || 0) + weight;
  }

  const regionalDistribution: Record<string, number> = {};
  for (const [region, count] of Object.entries(regionCounts)) {
    regionalDistribution[region] = Math.round((count / totalDemandAcrossSignals) * 1000) / 10;
  }

  const industryDistribution: Record<string, number> = {};
  for (const [industry, count] of Object.entries(industryCounts)) {
    industryDistribution[industry] = Math.round((count / totalDemandAcrossSignals) * 1000) / 10;
  }

  // 6. Historical Accuracy Tracking (MAPE)
  let historicalAccuracyMape: number | undefined = undefined;
  if (params.previousForecast) {
    const prevForecast = params.previousForecast;
    const latestActualDemand = latestSignal.demandPostingsCount;
    // Expected demand from previous forecast
    const expectedDemand = latestSignal.demandPostingsCount / (1 + (prevForecast.demandGrowthPct / 100));
    if (latestActualDemand > 0) {
      const absError = Math.abs(latestActualDemand - expectedDemand);
      historicalAccuracyMape = Math.round((absError / latestActualDemand) * 10000) / 100;
    }
  }

  return {
    id: params.id || crypto.randomUUID(),
    skillId: params.skillId,
    forecastHorizonMonths: horizonMonths,
    demandGrowthPct,
    supplyGrowthPct,
    scarcityIndex,
    projectedMedianSalary,
    salaryLowerBound,
    salaryUpperBound,
    confidenceLevel: 0.95,
    estimatedWeeksToMarketability,
    regionalDistribution,
    industryDistribution,
    historicalAccuracyMape,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Ranks top emerging skills based on demand trajectory and scarcity pressure (F-151).
 */
export function rankTopEmergingSkills(
  skillsWithForecasts: Array<{
    skillId: string;
    skillName: string;
    forecast: SkillForecast;
  }>,
  limit = 10
): Array<{
  skillId: string;
  skillName: string;
  emergingScore: number;
  forecast: SkillForecast;
}> {
  return skillsWithForecasts
    .map((item) => {
      // Score balances demand trajectory (50%) and talent scarcity index (50%)
      const demandComponent = Math.max(0, item.forecast.demandGrowthPct);
      const scarcityComponent = item.forecast.scarcityIndex * 100;
      const emergingScore = Math.round((demandComponent * 0.5 + scarcityComponent * 0.5) * 100) / 100;
      return {
        skillId: item.skillId,
        skillName: item.skillName,
        emergingScore,
        forecast: item.forecast,
      };
    })
    .sort((a, b) => b.emergingScore - a.emergingScore)
    .slice(0, Math.max(1, limit));
}

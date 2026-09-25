import { DomainError } from './index.js';

export interface LearningOutcome {
  id: string;
  userId: string;
  courseId: string;
  completedAt: string;
  hiredWithin12m: boolean;
  salaryGrowthPct: number;
  jobSatisfactionScore?: number;
  retentionMonths: number;
  promotedWithin18m: boolean;
  skillsUsedOnJob: string[];
  consentFlag: boolean;
  createdAt: string;
}

export interface RecordLearningOutcomeParams {
  id?: string;
  userId: string;
  courseId: string;
  completedAt?: string;
  hiredWithin12m: boolean;
  salaryGrowthPct?: number;
  jobSatisfactionScore?: number;
  retentionMonths?: number;
  promotedWithin18m?: boolean;
  skillsUsedOnJob?: string[];
  consentFlag: boolean;
  createdAt?: string;
}

export interface LearningImpactMetrics {
  id?: string;
  courseId: string;
  cohortSize: number;
  completionRatePct: number;
  hireRatePct: number;
  avgSalaryDeltaPct: number;
  avgJobSatisfaction: number;
  retentionRatePct: number;
  advancementRatePct: number;
  skillUtilizationPct: number;
  pathEffectivenessScore: number;
  correlationalClaimLabel: string;
  sampleCount: number;
  isPublishable: boolean;
  updatedAt: string;
}

export interface LearningImpactDashboard {
  totalCoursesTracked: number;
  totalOutcomesSampled: number;
  averageHireRatePct: number;
  averageSalaryGrowthPct: number;
  topPerformingCourses: Array<{
    courseId: string;
    hireRatePct: number;
    pathEffectivenessScore: number;
    sampleCount: number;
  }>;
  correlationalDisclaimer: string;
  generatedAt: string;
}

export const CORRELATION_DISCLAIMER_LABEL =
  'Correlational finding based on observational learner data. Not causal.';

/**
 * Validates and records an individual learner career outcome with explicit consent (F-114, BR-190).
 */
export function recordLearningOutcome(params: RecordLearningOutcomeParams): LearningOutcome {
  if (!params.userId || typeof params.userId !== 'string' || params.userId.trim() === '') {
    throw new DomainError('VALIDATION_FAILED', 'User ID is required to record learning outcome.');
  }

  if (!params.courseId || typeof params.courseId !== 'string' || params.courseId.trim() === '') {
    throw new DomainError('VALIDATION_FAILED', 'Course ID is required to record learning outcome.');
  }

  // BR-190: Individual learner outcomes are never exposed without consent
  if (!params.consentFlag) {
    throw new DomainError(
      'POLICY_VIOLATION',
      'BR-190: Learner outcome tracking requires explicit user consent.'
    );
  }

  if (params.salaryGrowthPct !== undefined) {
    if (typeof params.salaryGrowthPct !== 'number' || !Number.isFinite(params.salaryGrowthPct)) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Salary growth percentage must be a finite number.'
      );
    }
  }

  if (params.jobSatisfactionScore !== undefined) {
    if (
      typeof params.jobSatisfactionScore !== 'number' ||
      params.jobSatisfactionScore < 1.0 ||
      params.jobSatisfactionScore > 5.0 ||
      !Number.isFinite(params.jobSatisfactionScore)
    ) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Job satisfaction score must be a number between 1.0 and 5.0.'
      );
    }
  }

  if (params.retentionMonths !== undefined) {
    if (
      typeof params.retentionMonths !== 'number' ||
      params.retentionMonths < 0 ||
      !Number.isInteger(params.retentionMonths)
    ) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Retention months must be a non-negative integer.'
      );
    }
  }

  return {
    id: params.id || crypto.randomUUID(),
    userId: params.userId,
    courseId: params.courseId,
    completedAt: params.completedAt || new Date().toISOString(),
    hiredWithin12m: Boolean(params.hiredWithin12m),
    salaryGrowthPct: Math.round((params.salaryGrowthPct ?? 0) * 100) / 100,
    jobSatisfactionScore:
      params.jobSatisfactionScore !== undefined
        ? Math.round(params.jobSatisfactionScore * 10) / 10
        : undefined,
    retentionMonths: params.retentionMonths ?? 0,
    promotedWithin18m: Boolean(params.promotedWithin18m),
    skillsUsedOnJob: params.skillsUsedOnJob || [],
    consentFlag: params.consentFlag,
    createdAt: params.createdAt || new Date().toISOString(),
  };
}

/**
 * Computes learning impact outcome metrics, effectiveness score, and correlational disclosures (F-153, F-114, BR-189, BR-193).
 */
export function computeLearningImpactMetrics(
  courseId: string,
  outcomes: LearningOutcome[],
  enrolledCount?: number
): LearningImpactMetrics {
  if (!courseId || typeof courseId !== 'string' || courseId.trim() === '') {
    throw new DomainError('VALIDATION_FAILED', 'Course ID is required.');
  }

  const consentedOutcomes = outcomes.filter((o) => o.courseId === courseId && o.consentFlag);
  const sampleCount = consentedOutcomes.length;
  const cohortSize = Math.max(enrolledCount ?? sampleCount, sampleCount);

  // BR-189: Course outcome correlation requires >= 30 enrolled learners with measurable outcomes
  const isPublishable = sampleCount >= 30;

  if (sampleCount === 0) {
    return {
      courseId,
      cohortSize,
      completionRatePct: 0,
      hireRatePct: 0,
      avgSalaryDeltaPct: 0,
      avgJobSatisfaction: 0,
      retentionRatePct: 0,
      advancementRatePct: 0,
      skillUtilizationPct: 0,
      pathEffectivenessScore: 0,
      correlationalClaimLabel: CORRELATION_DISCLAIMER_LABEL,
      sampleCount: 0,
      isPublishable: false,
      updatedAt: new Date().toISOString(),
    };
  }

  const completionRatePct =
    cohortSize > 0 ? Math.round((sampleCount / cohortSize) * 10000) / 100 : 0;

  const hiredOutcomes = consentedOutcomes.filter((o) => o.hiredWithin12m);
  const hireRatePct = Math.round((hiredOutcomes.length / sampleCount) * 10000) / 100;

  const totalSalaryDelta = consentedOutcomes.reduce((acc, o) => acc + o.salaryGrowthPct, 0);
  const avgSalaryDeltaPct = Math.round((totalSalaryDelta / sampleCount) * 100) / 100;

  const satisfactionScores = consentedOutcomes
    .map((o) => o.jobSatisfactionScore)
    .filter((s): s is number => s !== undefined);
  const avgJobSatisfaction =
    satisfactionScores.length > 0
      ? Math.round(
          (satisfactionScores.reduce((acc, s) => acc + s, 0) / satisfactionScores.length) * 100
        ) / 100
      : 0;

  // Retention: percentage of hired learners retained at least 6 months
  const retainedCount = hiredOutcomes.filter((o) => o.retentionMonths >= 6).length;
  const retentionRatePct =
    hiredOutcomes.length > 0 ? Math.round((retainedCount / hiredOutcomes.length) * 10000) / 100 : 0;

  // Advancement: percentage of hired learners promoted within 18 months
  const promotedCount = hiredOutcomes.filter((o) => o.promotedWithin18m).length;
  const advancementRatePct =
    hiredOutcomes.length > 0 ? Math.round((promotedCount / hiredOutcomes.length) * 10000) / 100 : 0;

  // Skills utilization: percentage of learners applying learned skills on the job
  const skillsUsedCount = consentedOutcomes.filter((o) => o.skillsUsedOnJob.length > 0).length;
  const skillUtilizationPct = Math.round((skillsUsedCount / sampleCount) * 10000) / 100;

  // Path Effectiveness composite score (0 - 100):
  // 35% hire rate + 25% normalized salary growth (capped at 40%) + 20% retention rate + 20% skill utilization
  const normalizedSalaryScore = Math.min(100, (Math.max(0, avgSalaryDeltaPct) / 40) * 100);
  const compositeScore =
    hireRatePct * 0.35 +
    normalizedSalaryScore * 0.25 +
    retentionRatePct * 0.2 +
    skillUtilizationPct * 0.2;

  const pathEffectivenessScore = Math.min(100, Math.max(0, Math.round(compositeScore * 100) / 100));

  return {
    courseId,
    cohortSize,
    completionRatePct,
    hireRatePct,
    avgSalaryDeltaPct,
    avgJobSatisfaction,
    retentionRatePct,
    advancementRatePct,
    skillUtilizationPct,
    pathEffectivenessScore,
    correlationalClaimLabel: CORRELATION_DISCLAIMER_LABEL,
    sampleCount,
    isPublishable,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Aggregates multi-course metrics into a cross-platform learning impact dashboard (F-153, F-114).
 */
export function aggregateLearningImpactDashboard(
  metricsList: LearningImpactMetrics[]
): LearningImpactDashboard {
  const publishable = metricsList.filter((m) => m.isPublishable);

  if (publishable.length === 0) {
    return {
      totalCoursesTracked: metricsList.length,
      totalOutcomesSampled: metricsList.reduce((acc, m) => acc + m.sampleCount, 0),
      averageHireRatePct: 0,
      averageSalaryGrowthPct: 0,
      topPerformingCourses: [],
      correlationalDisclaimer: CORRELATION_DISCLAIMER_LABEL,
      generatedAt: new Date().toISOString(),
    };
  }

  const totalSamples = publishable.reduce((acc, m) => acc + m.sampleCount, 0);
  const avgHireRate =
    publishable.reduce((acc, m) => acc + m.hireRatePct * m.sampleCount, 0) /
    (totalSamples > 0 ? totalSamples : 1);
  const avgSalaryGrowth =
    publishable.reduce((acc, m) => acc + m.avgSalaryDeltaPct * m.sampleCount, 0) /
    (totalSamples > 0 ? totalSamples : 1);

  const sortedCourses = [...publishable]
    .sort((a, b) => b.pathEffectivenessScore - a.pathEffectivenessScore)
    .map((m) => ({
      courseId: m.courseId,
      hireRatePct: m.hireRatePct,
      pathEffectivenessScore: m.pathEffectivenessScore,
      sampleCount: m.sampleCount,
    }));

  return {
    totalCoursesTracked: metricsList.length,
    totalOutcomesSampled: metricsList.reduce((acc, m) => acc + m.sampleCount, 0),
    averageHireRatePct: Math.round(avgHireRate * 100) / 100,
    averageSalaryGrowthPct: Math.round(avgSalaryGrowth * 100) / 100,
    topPerformingCourses: sortedCourses.slice(0, 10),
    correlationalDisclaimer: CORRELATION_DISCLAIMER_LABEL,
    generatedAt: new Date().toISOString(),
  };
}

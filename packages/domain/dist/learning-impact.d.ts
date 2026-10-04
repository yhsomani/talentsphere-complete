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
export declare const CORRELATION_DISCLAIMER_LABEL = "Correlational finding based on observational learner data. Not causal.";
/**
 * Validates and records an individual learner career outcome with explicit consent (F-114, BR-190).
 */
export declare function recordLearningOutcome(params: RecordLearningOutcomeParams): LearningOutcome;
/**
 * Computes learning impact outcome metrics, effectiveness score, and correlational disclosures (F-153, F-114, BR-189, BR-193).
 */
export declare function computeLearningImpactMetrics(courseId: string, outcomes: LearningOutcome[], enrolledCount?: number): LearningImpactMetrics;
/**
 * Aggregates multi-course metrics into a cross-platform learning impact dashboard (F-153, F-114).
 */
export declare function aggregateLearningImpactDashboard(metricsList: LearningImpactMetrics[]): LearningImpactDashboard;
//# sourceMappingURL=learning-impact.d.ts.map
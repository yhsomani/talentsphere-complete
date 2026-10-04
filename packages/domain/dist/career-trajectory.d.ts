export interface CareerTransition {
    id: string;
    userId: string;
    fromRole: string;
    toRole: string;
    fromCompanyId?: string;
    toCompanyId?: string;
    transitionDate: string;
    salaryDelta: number;
    timeInRoleMonths: number;
    consentFlag: boolean;
    createdAt: string;
}
export interface RecordCareerTransitionParams {
    id?: string;
    userId: string;
    fromRole: string;
    toRole: string;
    fromCompanyId?: string;
    toCompanyId?: string;
    transitionDate?: string;
    salaryDelta: number;
    timeInRoleMonths: number;
    consentFlag: boolean;
    createdAt?: string;
}
export interface ProgressionBenchmark {
    id?: string;
    fromRole: string;
    toRole: string;
    industry: string;
    sampleCount: number;
    transitionProbability: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    medianTimeMonths: number;
    medianSalaryDelta: number;
    salaryGrowthPct: number;
    confidenceLevel: number;
    successFactors: string[];
    riskFactors: string[];
    retentionRatePct: number;
    isPublishable: boolean;
    dataSources: string[];
    updatedAt: string;
}
export interface ProgressionPathwayNode {
    targetRole: string;
    transitionProbability: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    medianTimeMonths: number;
    medianSalaryDelta: number;
    salaryGrowthPct: number;
    sampleCount: number;
    retentionRatePct: number;
    successFactors: string[];
    riskFactors: string[];
    isPublishable: boolean;
}
export interface ProgressionPathway {
    originRole: string;
    industry: string;
    totalHistoricalTransitions: number;
    pathways: ProgressionPathwayNode[];
    kAnonymityMet: boolean;
    dataSources: string[];
}
export interface SalaryProjectionItem {
    year: number;
    projectedSalary: number;
    cumulativeDelta: number;
    pathwayRole: string;
}
export interface RecommendedMilestone {
    title: string;
    type: 'skill' | 'experience' | 'certification';
    estimatedWeeks: number;
    priority: 'high' | 'medium' | 'low';
}
export interface CareerMilestoneReadiness {
    id?: string;
    userId: string;
    currentRole: string;
    targetRole: string;
    overallReadinessScore: number;
    skillsOverlapPct: number;
    experienceReadinessPct: number;
    educationReadinessPct: number;
    candidateSkills: string[];
    requiredSkills: string[];
    missingPrerequisites: string[];
    recommendedMilestones: RecommendedMilestone[];
    evaluatedAt: string;
}
export interface EvaluateMilestoneReadinessParams {
    id?: string;
    userId: string;
    currentRole: string;
    targetRole: string;
    candidateSkills: string[];
    requiredSkills?: string[];
    yearsOfExperience: number;
    requiredYearsOfExperience?: number;
    educationLevel?: 'none' | 'bootcamp' | 'associate' | 'bachelor' | 'master' | 'doctorate';
    requiredEducationLevel?: 'none' | 'bootcamp' | 'associate' | 'bachelor' | 'master' | 'doctorate';
    evaluatedAt?: string;
}
/**
 * Validates and records an individual career transition with explicit consent (F-85, BR-157, BR-159, BR-161).
 */
export declare function recordCareerTransition(params: RecordCareerTransitionParams): CareerTransition;
/**
 * Calculates Wilson score confidence interval for a binomial proportion at 95% confidence (BR-163).
 */
export declare function calculateWilsonConfidenceInterval(successes: number, total: number, confidence?: number): {
    lower: number;
    upper: number;
};
/**
 * Calculates career transition probability, median timeline, and salary delta with statistical confidence (F-152, F-85, BR-160, BR-163).
 */
export declare function calculateCareerTransitionProbability(transitions: CareerTransition[], fromRole: string, toRole: string, options?: {
    industry?: string;
    baselineSalary?: number;
    successFactors?: string[];
    riskFactors?: string[];
}): ProgressionBenchmark;
/**
 * Generates forward progression pathways from a current role based on historical graph patterns (F-152, F-85).
 */
export declare function generateProgressionPathways(transitions: CareerTransition[], originRole: string, options?: {
    industry?: string;
    enforceKAnonymity?: boolean;
    baselineSalary?: number;
}): ProgressionPathway;
/**
 * Projects multi-year salary progression along a career pathway separate from base salary (BR-161, F-152).
 */
export declare function projectSalaryTrajectory(currentSalary: number, pathways: ProgressionPathwayNode[], horizonYears?: number): SalaryProjectionItem[];
/**
 * Evaluates candidate readiness against target role requirements and benchmarks (F-85, F-152).
 */
export declare function evaluateMilestoneReadiness(params: EvaluateMilestoneReadinessParams): CareerMilestoneReadiness;
//# sourceMappingURL=career-trajectory.d.ts.map
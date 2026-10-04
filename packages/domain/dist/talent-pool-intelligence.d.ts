export type TalentPoolSource = 'search' | 'referral' | 'inbound_application' | 'alumni' | 'outreach';
export type TalentPoolStatus = 'sourced' | 'contacted' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'archived';
export interface TalentPool {
    id: string;
    orgId: string;
    name: string;
    description?: string;
    targetRole?: string;
    targetSkills: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface TalentPoolMember {
    id: string;
    poolId: string;
    orgId: string;
    candidateId: string;
    source: TalentPoolSource;
    status: TalentPoolStatus;
    costMinorUnits: number;
    addedAt: string;
    contactedAt?: string;
    interviewedAt?: string;
    offeredAt?: string;
    hiredAt?: string;
    archivedAt?: string;
    notes?: string;
}
export interface CandidateSkill {
    skillName: string;
    verified: boolean;
    proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
export interface CandidateSkillProfile {
    candidateId: string;
    skills: CandidateSkill[];
    isStealthMode?: boolean;
    privacyLevel?: 'public' | 'recruiters_only' | 'private';
    hasAppliedOrConsented?: boolean;
}
export interface SkillCompositionItem {
    skillName: string;
    candidateCount: number;
    prevalencePct: number;
    verifiedCount: number;
    verifiedPct: number;
}
export interface SkillGapAnalysis {
    targetSkill: string;
    inPoolCount: number;
    coveragePct: number;
    status: 'adequate' | 'moderate_gap' | 'severe_gap';
}
export interface PipelineStageMetrics {
    stage: TalentPoolStatus;
    count: number;
    pctOfTotal: number;
    avgDaysInStage: number;
}
export interface SourceEffectivenessMetrics {
    source: TalentPoolSource;
    totalCandidates: number;
    hiredCount: number;
    conversionRatePct: number;
    avgTimeToHireDays: number | null;
    avgCostPerHireMinorUnits: number | null;
}
export interface AggregatedDiversityResult {
    cohortsAnalyzed: number;
    kThreshold: number;
    isSuppressedDueToKAnonymity: boolean;
    metrics: Record<string, number> | null;
    disclaimer: string;
}
export interface TalentPoolIntelligenceSummary {
    poolId: string;
    poolName: string;
    targetRole?: string;
    totalMembers: number;
    activePipelineCount: number;
    hiredCount: number;
    archivedCount: number;
    overallConversionRatePct: number;
    avgTimeToHireDays: number | null;
    totalCostMinorUnits: number;
    avgCostPerHireMinorUnits: number | null;
    skillComposition: SkillCompositionItem[];
    skillGaps: SkillGapAnalysis[];
    pipelineStages: PipelineStageMetrics[];
    sourceEffectiveness: SourceEffectivenessMetrics[];
    aggregatedDiversity: AggregatedDiversityResult;
}
export declare const VALID_SOURCES: TalentPoolSource[];
export declare const VALID_STATUSES: TalentPoolStatus[];
export declare const DIVERSITY_DISCLAIMER = "Aggregated diversity analytics conform to BR-200 and k-anonymity (k >= 10). Individual demographic records are never persisted.";
/**
 * Validates candidate eligibility for talent pooling respecting candidate privacy controls (SSOT F-92, F-158).
 */
export declare function validateCandidatePoolEligibility(candidate: {
    isStealthMode?: boolean;
    privacyLevel?: string;
    hasAppliedOrConsented?: boolean;
}): void;
/**
 * Creates a new talent pool representation.
 */
export declare function createTalentPool(input: {
    id?: string;
    orgId: string;
    name: string;
    description?: string;
    targetRole?: string;
    targetSkills?: string[];
    createdBy: string;
}): TalentPool;
/**
 * Adds a candidate to a talent pool with privacy and duplicate validation.
 */
export declare function addCandidateToPool(pool: TalentPool, candidate: CandidateSkillProfile, source: TalentPoolSource, costMinorUnits?: number, notes?: string): TalentPoolMember;
/**
 * Updates a talent pool member's status along the recruitment funnel.
 */
export declare function updatePoolMemberStatus(member: TalentPoolMember, newStatus: TalentPoolStatus, timestampStr?: string): TalentPoolMember;
/**
 * Computes pool skill composition (frequency, prevalence, and verified percentage).
 */
export declare function computePoolSkillComposition(members: TalentPoolMember[], candidateSkills: CandidateSkillProfile[]): SkillCompositionItem[];
/**
 * Computes pool skill gaps relative to target job requirements.
 */
export declare function computePoolSkillGaps(targetSkills: string[], composition: SkillCompositionItem[], totalMembers: number): SkillGapAnalysis[];
/**
 * Computes pipeline health: candidate count per stage, percentage, and avg days in stage.
 */
export declare function computePipelineStages(members: TalentPoolMember[], now?: Date): PipelineStageMetrics[];
/**
 * Computes source effectiveness: conversion rate, avg time to hire, and avg cost per hire.
 */
export declare function computeSourceEffectiveness(members: TalentPoolMember[]): SourceEffectivenessMetrics[];
/**
 * Anonymizes demographic/diversity metrics under k-anonymity (k >= 10, BR-200).
 * If any cell count is below k, the cell/metrics are suppressed to prevent deanonymization.
 */
export declare function computeAggregatedDiversity(cohorts: Array<{
    category: string;
}>, kThreshold?: number): AggregatedDiversityResult;
/**
 * Generates comprehensive talent pool intelligence summary.
 */
export declare function generateTalentPoolIntelligence(pool: TalentPool, members: TalentPoolMember[], candidateSkills: CandidateSkillProfile[], diversityCohorts?: Array<{
    category: string;
}>, kThreshold?: number, now?: Date): TalentPoolIntelligenceSummary;
//# sourceMappingURL=talent-pool-intelligence.d.ts.map
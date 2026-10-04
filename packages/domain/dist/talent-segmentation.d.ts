export type TalentSpecialization = 'frontend' | 'backend' | 'fullstack' | 'devops_cloud' | 'data_ai' | 'mobile' | 'security' | 'system_architecture' | 'generalist';
export type SeniorityTier = 'entry' | 'mid' | 'senior' | 'staff' | 'principal';
export type EngagementSegment = 'active' | 'open' | 'passive' | 'stealth' | 'inactive';
export type ReadinessBand = 'ready_now' | 'near_ready' | 'in_training' | 'unassessed';
export interface CandidateSegmentation {
    id: string;
    candidateId: string;
    specialization: TalentSpecialization;
    seniorityTier: SeniorityTier;
    engagementSegment: EngagementSegment;
    readinessBand: ReadinessBand;
    confidenceScore: number;
    primarySkills: string[];
    yearsOfExperience: number;
    classifiedAt: string;
    updatedAt: string;
}
export interface CandidateClassificationInput {
    candidateId: string;
    skills: string[];
    yearsOfExperience: number;
    lastActiveDays: number;
    isStealthMode?: boolean;
    recentApplicationCount?: number;
    verifiedEvidenceCount?: number;
    assessmentsPassedCount?: number;
    skillDecayRiskCount?: number;
    milestoneReadinessScore?: number;
}
export interface SegmentDistributionItem {
    segment: string;
    count: number | '<10';
    percentage: number | null;
    isSuppressed: boolean;
}
export interface SegmentDistributionReport {
    totalAnalyzed: number;
    kThreshold: number;
    bySpecialization: SegmentDistributionItem[];
    bySeniority: SegmentDistributionItem[];
    byEngagement: SegmentDistributionItem[];
    byReadiness: SegmentDistributionItem[];
    suppressedCellCount: number;
}
export interface SegmentFilter {
    specializations?: TalentSpecialization[];
    seniorityTiers?: SeniorityTier[];
    engagementSegments?: EngagementSegment[];
    readinessBands?: ReadinessBand[];
    minConfidenceScore?: number;
    minYearsOfExperience?: number;
    maxYearsOfExperience?: number;
    limit?: number;
    offset?: number;
}
/**
 * Determines primary candidate specialization based on verified skills keyword matching.
 */
export declare function classifyCandidateSpecialization(skills: string[]): {
    specialization: TalentSpecialization;
    confidence: number;
};
/**
 * Determines seniority tier strictly from verified years of experience and optional milestone score.
 */
export declare function classifySeniorityTier(yearsOfExperience: number, milestoneScore?: number): SeniorityTier;
/**
 * Determines engagement segment from activity recency and stealth mode status.
 */
export declare function classifyEngagementSegment(lastActiveDays: number, isStealthMode?: boolean, recentAppCount?: number): EngagementSegment;
/**
 * Determines readiness band based on evidence, assessments, and skill freshness.
 */
export declare function classifyReadinessBand(verifiedEvidenceCount?: number, assessmentsPassed?: number, skillDecayRiskCount?: number): ReadinessBand;
/**
 * Classifies a candidate into multidimensional talent segmentation profile.
 */
export declare function classifyCandidate(input: CandidateClassificationInput): CandidateSegmentation;
/**
 * Aggregates candidate segmentations into an anonymized distribution report with k-anonymity.
 */
export declare function aggregateSegmentDistribution(segmentations: CandidateSegmentation[], kThreshold?: number): SegmentDistributionReport;
/**
 * Filters segmented candidates according to recruiter criteria.
 */
export declare function filterSegmentedTalent(segmentations: CandidateSegmentation[], filter: SegmentFilter): {
    results: CandidateSegmentation[];
    total: number;
};
//# sourceMappingURL=talent-segmentation.d.ts.map
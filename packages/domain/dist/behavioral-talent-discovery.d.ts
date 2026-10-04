export interface BehavioralWeights {
    activity: number;
    reputation: number;
    peerCredibility: number;
    learningVelocity: number;
    emergingExpertise: number;
}
export declare const DEFAULT_BEHAVIORAL_WEIGHTS: BehavioralWeights;
export interface BehavioralTalentProfile {
    id: string;
    candidateId: string;
    activityScore: number;
    reputationScore: number;
    peerCredibilityScore: number;
    learningVelocityScore: number;
    emergingExpertiseScore: number;
    compositeBehavioralScore: number;
    highlightedSkills: string[];
    verifiedEndorsementsCount: number;
    recentActivityCount: number;
    lastActiveAt: string;
    updatedAt: string;
}
export interface CandidateRawSignals {
    candidateId: string;
    contributionsCount30d: number;
    challengesCompleted: number;
    reputationOverallScore: number;
    verifiedEndorsements: Array<{
        endorserWeight: number;
        isReciprocalRing?: boolean;
    }>;
    coursesCompletedLast90d: number;
    emergingSkillsCount: number;
    highlightedSkills?: string[];
    lastActiveDate?: string;
    privacyLevel?: 'public' | 'recruiters_only' | 'private';
    isStealthMode?: boolean;
}
export interface BehavioralDiscoveryFilter {
    requiredSkills?: string[];
    minCompositeScore?: number;
    minActivityScore?: number;
    minReputationScore?: number;
    maxDaysSinceActive?: number;
    minEndorsements?: number;
    limit?: number;
    offset?: number;
}
/**
 * Validates that custom weights sum to 1.0 (within epsilon tolerance).
 */
export declare function validateBehavioralWeights(weights: BehavioralWeights): void;
/**
 * Computes dampened activity score with logarithmic curve to resist bot spam.
 */
export declare function computeActivityScore(contributions30d: number, challengesCompleted: number): number;
/**
 * Computes peer credibility score with anti-gaming discount for reciprocal rings (F-150).
 */
export declare function computePeerCredibilityScore(endorsements: Array<{
    endorserWeight: number;
    isReciprocalRing?: boolean;
}>): {
    score: number;
    validCount: number;
};
/**
 * Computes learning velocity score based on recent course and certificate milestones.
 */
export declare function computeLearningVelocityScore(coursesCompleted90d: number): number;
/**
 * Computes emerging expertise score based on verified depth in high-growth skills.
 */
export declare function computeEmergingExpertiseScore(emergingSkillsCount: number): number;
/**
 * Evaluates candidate behavioral talent profile from verified signals.
 */
export declare function evaluateBehavioralTalentProfile(signals: CandidateRawSignals, weights?: BehavioralWeights): BehavioralTalentProfile;
/**
 * Filters and ranks candidate behavioral profiles for talent discovery.
 */
export declare function filterAndRankBehavioralTalent(profiles: BehavioralTalentProfile[], filter: BehavioralDiscoveryFilter, now?: Date): {
    profiles: BehavioralTalentProfile[];
    total: number;
};
//# sourceMappingURL=behavioral-talent-discovery.d.ts.map
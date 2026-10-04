/**
 * TalentSphere Peer Credibility Networks Domain Model (F-150, F-110, F-144)
 * Deterministic multi-factor endorsement weighting incorporating network distance,
 * endorser credibility, domain specialization, track record, and anti-collusion dampening.
 */
export interface EndorsementWeightBreakdown {
    endorserCredibility: number;
    networkDistance: number;
    distanceFactor: number;
    specializationMultiplier: number;
    trackRecordMultiplier: number;
    isReciprocalDampened: boolean;
    finalWeight: number;
}
export interface SkillEndorsement {
    id: string;
    recipientId: string;
    endorserId: string;
    skillId: string;
    notes?: string;
    weight: EndorsementWeightBreakdown;
    status: 'active' | 'revoked' | 'disputed';
    createdAt: string;
    revokedAt?: string;
}
export interface CalculateEndorsementWeightParams {
    endorserReputationScore?: number;
    networkDistance: number;
    hasSpecializationInSkill?: boolean;
    endorserAccuracyScore?: number;
    isReciprocalEndorsement?: boolean;
}
export interface CreateSkillEndorsementParams {
    id?: string;
    recipientId: string;
    endorserId: string;
    skillId: string;
    notes?: string;
    networkDistance: number;
    endorserReputationScore?: number;
    hasSpecializationInSkill?: boolean;
    endorserAccuracyScore?: number;
    isReciprocalEndorsement?: boolean;
    recentEndorsementsCountThisWeek?: number;
    nowIso?: string;
}
/**
 * Calculates deterministic network distance factor (BR-F150-01).
 * 1st-degree (direct connection): 1.00
 * 2nd-degree: 0.75
 * 3rd-degree: 0.50
 * 4th-degree: 0.25
 * 5th-degree / unlinked: 0.10
 */
export declare function calculateNetworkDistanceFactor(distance: number): number;
/**
 * Normalizes endorser's reputation score to credibility factor (0.10 - 1.00).
 */
export declare function normalizeEndorserCredibility(reputationScore?: number): number;
/**
 * Converts accuracy score to track record multiplier (0.50 - 1.50).
 */
export declare function calculateTrackRecordMultiplier(accuracyScore?: number): number;
/**
 * Computes deterministic endorsement weight breakdown (F-150).
 */
export declare function computeEndorsementWeight(params: CalculateEndorsementWeightParams): EndorsementWeightBreakdown;
/**
 * Validates invariants and creates a skill endorsement entity.
 */
export declare function createSkillEndorsement(params: CreateSkillEndorsementParams): SkillEndorsement;
/**
 * Revokes a skill endorsement within the allowed 30-day window (SSOT F-110).
 */
export declare function revokeSkillEndorsement(endorsement: SkillEndorsement, actorUserId: string, nowIso?: string): SkillEndorsement;
/**
 * Computes aggregated skill endorsement strength from active endorsements.
 */
export declare function aggregateSkillEndorsements(endorsements: SkillEndorsement[]): {
    totalCount: number;
    totalWeight: number;
    averageWeight: number;
    firstDegreeCount: number;
    specialistCount: number;
};
//# sourceMappingURL=peer-credibility.d.ts.map
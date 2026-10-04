export type SkillDecayCategory = 'fast_changing' | 'moderate' | 'stable' | 'foundational';
export type SkillFreshnessBand = 'fresh' | 'current' | 'aging' | 'stale' | 'expired';
export type ReverificationSource = 'challenge' | 'course' | 'certification' | 'evidence' | 'self_attestation';
export interface SkillFreshnessRecord {
    id: string;
    candidateId: string;
    skillId: string;
    category: SkillDecayCategory;
    lastVerifiedAt: string;
    freshnessScore: number;
    freshnessBand: SkillFreshnessBand;
    isDemoted: boolean;
    verificationSource: ReverificationSource;
    createdAt: string;
    updatedAt: string;
}
export interface CreateSkillFreshnessParams {
    id?: string;
    candidateId: string;
    skillId: string;
    category?: SkillDecayCategory;
    lastVerifiedAt?: string;
    verificationSource?: ReverificationSource;
}
/**
 * Returns half-life in days based on skill decay category (BR-226).
 * - fast_changing: 18 months (548 days)
 * - moderate: 36 months (1095 days)
 * - stable: 60 months (1825 days)
 * - foundational: 120 months (3650 days)
 */
export declare function getCategoryHalfLifeDays(category: SkillDecayCategory): number;
/**
 * Computes freshness score and band using continuous exponential decay (BR-225, BR-226, BR-227).
 * S(t) = 100 * 2^(-t / T_half)
 */
export declare function calculateFreshnessScore(lastVerifiedAt: string, category: SkillDecayCategory, currentTime?: Date): {
    score: number;
    band: SkillFreshnessBand;
    isDemoted: boolean;
    daysSinceVerification: number;
};
/**
 * Initializes a new skill freshness record.
 */
export declare function createSkillFreshnessRecord(params: CreateSkillFreshnessParams): SkillFreshnessRecord;
/**
 * Re-verifies a skill via challenge, course, certification, or self-attestation (BR-228, BR-229).
 */
export declare function reverifySkill(existing: SkillFreshnessRecord, source: ReverificationSource, currentTime?: Date): SkillFreshnessRecord;
//# sourceMappingURL=skill-decay.d.ts.map
import { DomainError } from './index.js';

export type SkillDecayCategory = 'fast_changing' | 'moderate' | 'stable' | 'foundational';
export type SkillFreshnessBand = 'fresh' | 'current' | 'aging' | 'stale' | 'expired';
export type ReverificationSource =
  'challenge' | 'course' | 'certification' | 'evidence' | 'self_attestation';

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
export function getCategoryHalfLifeDays(category: SkillDecayCategory): number {
  switch (category) {
    case 'fast_changing':
      return 548;
    case 'moderate':
      return 1095;
    case 'stable':
      return 1825;
    case 'foundational':
      return 3650;
    default:
      return 1095;
  }
}

/**
 * Computes freshness score and band using continuous exponential decay (BR-225, BR-226, BR-227).
 * S(t) = 100 * 2^(-t / T_half)
 */
export function calculateFreshnessScore(
  lastVerifiedAt: string,
  category: SkillDecayCategory,
  currentTime?: Date
): {
  score: number;
  band: SkillFreshnessBand;
  isDemoted: boolean;
  daysSinceVerification: number;
} {
  const verifiedTime = new Date(lastVerifiedAt).getTime();
  const now = (currentTime || new Date()).getTime();
  const elapsedMs = Math.max(0, now - verifiedTime);
  const daysSinceVerification = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

  const halfLife = getCategoryHalfLifeDays(category);
  const rawScore = 100 * Math.pow(0.5, daysSinceVerification / halfLife);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let band: SkillFreshnessBand;
  if (score >= 80) {
    band = 'fresh';
  } else if (score >= 60) {
    band = 'current';
  } else if (score >= 40) {
    band = 'aging';
  } else if (score >= 20) {
    band = 'stale';
  } else {
    band = 'expired';
  }

  // BR-227: Freshness <20 demotes to self-reported
  const isDemoted = score < 20;

  return {
    score,
    band,
    isDemoted,
    daysSinceVerification,
  };
}

/**
 * Initializes a new skill freshness record.
 */
export function createSkillFreshnessRecord(
  params: CreateSkillFreshnessParams
): SkillFreshnessRecord {
  if (!params.candidateId || params.candidateId.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Candidate ID is required.');
  }

  if (!params.skillId || params.skillId.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Skill ID is required.');
  }

  const category = params.category || 'moderate';
  const lastVerifiedAt = params.lastVerifiedAt || new Date().toISOString();
  const verificationSource = params.verificationSource || 'evidence';
  const { score, band, isDemoted } = calculateFreshnessScore(lastVerifiedAt, category);

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    candidateId: params.candidateId,
    skillId: params.skillId,
    category,
    lastVerifiedAt,
    freshnessScore: score,
    freshnessBand: band,
    isDemoted,
    verificationSource,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Re-verifies a skill via challenge, course, certification, or self-attestation (BR-228, BR-229).
 */
export function reverifySkill(
  existing: SkillFreshnessRecord,
  source: ReverificationSource,
  currentTime?: Date
): SkillFreshnessRecord {
  const now = (currentTime || new Date()).toISOString();

  // BR-229: Self-attestation counts 0.5x (boosts halfway to 100)
  if (source === 'self_attestation') {
    const boost = Math.round((100 - existing.freshnessScore) * 0.5);
    const newScore = Math.min(100, existing.freshnessScore + boost);

    let band: SkillFreshnessBand;
    if (newScore >= 80) band = 'fresh';
    else if (newScore >= 60) band = 'current';
    else if (newScore >= 40) band = 'aging';
    else if (newScore >= 20) band = 'stale';
    else band = 'expired';

    return {
      ...existing,
      freshnessScore: newScore,
      freshnessBand: band,
      isDemoted: newScore < 20,
      verificationSource: 'self_attestation',
      updatedAt: now,
    };
  }

  // BR-228: Re-verification restores freshness to 100
  return {
    ...existing,
    lastVerifiedAt: now,
    freshnessScore: 100,
    freshnessBand: 'fresh',
    isDemoted: false,
    verificationSource: source,
    updatedAt: now,
  };
}

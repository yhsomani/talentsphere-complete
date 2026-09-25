import { DomainError } from './index.js';

export interface BehavioralWeights {
  activity: number;
  reputation: number;
  peerCredibility: number;
  learningVelocity: number;
  emergingExpertise: number;
}

export const DEFAULT_BEHAVIORAL_WEIGHTS: BehavioralWeights = {
  activity: 0.25,
  reputation: 0.25,
  peerCredibility: 0.2,
  learningVelocity: 0.15,
  emergingExpertise: 0.15,
};

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
  verifiedEndorsements: Array<{ endorserWeight: number; isReciprocalRing?: boolean }>;
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
 * Clamps a numerical value to a range [min, max].
 */
function clamp(val: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Validates that custom weights sum to 1.0 (within epsilon tolerance).
 */
export function validateBehavioralWeights(weights: BehavioralWeights): void {
  const sum =
    weights.activity +
    weights.reputation +
    weights.peerCredibility +
    weights.learningVelocity +
    weights.emergingExpertise;

  if (Math.abs(sum - 1.0) > 0.001) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `Behavioral weights must sum to 1.0 (current sum: ${sum.toFixed(3)}).`
    );
  }

  for (const [key, w] of Object.entries(weights)) {
    if (w < 0 || w > 1) {
      throw new DomainError(
        'VALIDATION_FAILED',
        `Weight for "${key}" must be between 0.0 and 1.0.`
      );
    }
  }
}

/**
 * Computes dampened activity score with logarithmic curve to resist bot spam.
 */
export function computeActivityScore(
  contributions30d: number,
  challengesCompleted: number
): number {
  if (contributions30d <= 0 && challengesCompleted <= 0) return 0;
  // Dampen contributions with log scale: max 60 points from commits/contributions
  const contribScore = Math.min(60, Math.round(15 * Math.log2(1 + Math.max(0, contributions30d))));
  // Challenges up to 40 points (8 pts per completed challenge)
  const challengeScore = Math.min(40, Math.max(0, challengesCompleted) * 8);

  return clamp(contribScore + challengeScore, 0, 100);
}

/**
 * Computes peer credibility score with anti-gaming discount for reciprocal rings (F-150).
 */
export function computePeerCredibilityScore(
  endorsements: Array<{ endorserWeight: number; isReciprocalRing?: boolean }>
): { score: number; validCount: number } {
  if (!endorsements || endorsements.length === 0) {
    return { score: 0, validCount: 0 };
  }

  let totalWeighted = 0;
  let validCount = 0;

  for (const end of endorsements) {
    if (end.isReciprocalRing) {
      // Reciprocal collusion ring discounted to 0 weight
      continue;
    }
    const weight = clamp(end.endorserWeight || 1.0, 0.1, 3.0);
    totalWeighted += weight * 10;
    validCount += 1;
  }

  // Diminishing returns after 10 high-quality endorsements
  const score = clamp(Math.round(100 * (1 - Math.exp(-totalWeighted / 60))), 0, 100);
  return { score, validCount };
}

/**
 * Computes learning velocity score based on recent course and certificate milestones.
 */
export function computeLearningVelocityScore(coursesCompleted90d: number): number {
  if (coursesCompleted90d <= 0) return 0;
  // 1 course = 40, 2 courses = 70, 3+ courses = 90-100
  const score = Math.round(100 * (1 - Math.exp(-coursesCompleted90d * 0.55)));
  return clamp(score, 0, 100);
}

/**
 * Computes emerging expertise score based on verified depth in high-growth skills.
 */
export function computeEmergingExpertiseScore(emergingSkillsCount: number): number {
  if (emergingSkillsCount <= 0) return 0;
  // Up to 5 emerging skills: 20 pts per skill
  return clamp(emergingSkillsCount * 20, 0, 100);
}

/**
 * Evaluates candidate behavioral talent profile from verified signals.
 */
export function evaluateBehavioralTalentProfile(
  signals: CandidateRawSignals,
  weights: BehavioralWeights = DEFAULT_BEHAVIORAL_WEIGHTS
): BehavioralTalentProfile {
  validateBehavioralWeights(weights);

  const activityScore = computeActivityScore(
    signals.contributionsCount30d,
    signals.challengesCompleted
  );
  const reputationScore = clamp(signals.reputationOverallScore || 0, 0, 100);
  const { score: peerCredibilityScore, validCount: verifiedEndorsementsCount } =
    computePeerCredibilityScore(signals.verifiedEndorsements);
  const learningVelocityScore = computeLearningVelocityScore(signals.coursesCompletedLast90d);
  const emergingExpertiseScore = computeEmergingExpertiseScore(signals.emergingSkillsCount);

  const composite =
    activityScore * weights.activity +
    reputationScore * weights.reputation +
    peerCredibilityScore * weights.peerCredibility +
    learningVelocityScore * weights.learningVelocity +
    emergingExpertiseScore * weights.emergingExpertise;

  const compositeBehavioralScore = Math.round(composite * 100) / 100;
  const now = new Date().toISOString();

  return {
    id: `btp_${crypto.randomUUID()}`,
    candidateId: signals.candidateId,
    activityScore,
    reputationScore,
    peerCredibilityScore,
    learningVelocityScore,
    emergingExpertiseScore,
    compositeBehavioralScore,
    highlightedSkills: (signals.highlightedSkills || []).map((s) => s.trim().toLowerCase()),
    verifiedEndorsementsCount,
    recentActivityCount: signals.contributionsCount30d,
    lastActiveAt: signals.lastActiveDate || now,
    updatedAt: now,
  };
}

/**
 * Filters and ranks candidate behavioral profiles for talent discovery.
 */
export function filterAndRankBehavioralTalent(
  profiles: BehavioralTalentProfile[],
  filter: BehavioralDiscoveryFilter,
  now: Date = new Date()
): { profiles: BehavioralTalentProfile[]; total: number } {
  let matched = profiles.slice();

  if (filter.requiredSkills && filter.requiredSkills.length > 0) {
    const required = filter.requiredSkills.map((s) => s.trim().toLowerCase());
    matched = matched.filter((p) => {
      const skills = new Set(p.highlightedSkills.map((s) => s.toLowerCase()));
      return required.every((req) => skills.has(req));
    });
  }

  if (filter.minCompositeScore !== undefined) {
    matched = matched.filter((p) => p.compositeBehavioralScore >= filter.minCompositeScore!);
  }

  if (filter.minActivityScore !== undefined) {
    matched = matched.filter((p) => p.activityScore >= filter.minActivityScore!);
  }

  if (filter.minReputationScore !== undefined) {
    matched = matched.filter((p) => p.reputationScore >= filter.minReputationScore!);
  }

  if (filter.minEndorsements !== undefined) {
    matched = matched.filter((p) => p.verifiedEndorsementsCount >= filter.minEndorsements!);
  }

  if (filter.maxDaysSinceActive !== undefined) {
    const maxMs = filter.maxDaysSinceActive * 24 * 60 * 60 * 1000;
    matched = matched.filter((p) => {
      const activeMs = new Date(p.lastActiveAt).getTime();
      return now.getTime() - activeMs <= maxMs;
    });
  }

  // Rank by composite behavioral score descending, breaking ties by activity score
  matched.sort((a, b) => {
    if (b.compositeBehavioralScore !== a.compositeBehavioralScore) {
      return b.compositeBehavioralScore - a.compositeBehavioralScore;
    }
    return b.activityScore - a.activityScore;
  });

  const total = matched.length;
  const offset = filter.offset || 0;
  const limit = filter.limit || 50;
  const paged = matched.slice(offset, offset + limit);

  return { profiles: paged, total };
}

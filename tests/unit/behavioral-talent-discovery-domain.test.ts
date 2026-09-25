import { describe, expect, it } from 'vitest';
import {
  validateBehavioralWeights,
  computeActivityScore,
  computePeerCredibilityScore,
  computeLearningVelocityScore,
  computeEmergingExpertiseScore,
  evaluateBehavioralTalentProfile,
  filterAndRankBehavioralTalent,
  DEFAULT_BEHAVIORAL_WEIGHTS,
  CandidateRawSignals,
  BehavioralTalentProfile,
} from '../../packages/domain/src/behavioral-talent-discovery.js';

describe('Behavioral Talent Discovery Domain (F-159, F-146, F-130, F-150)', () => {
  describe('validateBehavioralWeights', () => {
    it('accepts default weights summing to 1.0', () => {
      expect(() => validateBehavioralWeights(DEFAULT_BEHAVIORAL_WEIGHTS)).not.toThrow();
    });

    it('rejects weights that do not sum to 1.0', () => {
      expect(() =>
        validateBehavioralWeights({
          activity: 0.5,
          reputation: 0.5,
          peerCredibility: 0.2, // sum = 1.2
          learningVelocity: 0.0,
          emergingExpertise: 0.0,
        })
      ).toThrowError(/must sum to 1.0/i);
    });

    it('rejects negative weights', () => {
      expect(() =>
        validateBehavioralWeights({
          activity: 1.2,
          reputation: -0.2,
          peerCredibility: 0.0,
          learningVelocity: 0.0,
          emergingExpertise: 0.0,
        })
      ).toThrowError(/must be between 0.0 and 1.0/i);
    });
  });

  describe('computeActivityScore (Anti-Bot Logarithmic Dampening)', () => {
    it('returns 0 when there is zero activity', () => {
      expect(computeActivityScore(0, 0)).toBe(0);
    });

    it('computes positive activity score from contributions and challenges', () => {
      // 15 contributions: 15 * log2(16) = 15 * 4 = 60 (capped)
      // 2 challenges: 2 * 8 = 16
      const score = computeActivityScore(15, 2);
      expect(score).toBe(76);
    });

    it('dampens extreme bot submission spam (10,000 commits capped to 60 pts)', () => {
      const score = computeActivityScore(10000, 0);
      expect(score).toBe(60); // Logarithmic cap prevents runaway bot gaming
    });

    it('clamps overall activity score to 100 max', () => {
      const score = computeActivityScore(500, 10);
      expect(score).toBe(100);
    });
  });

  describe('computePeerCredibilityScore (Anti-Gaming Reciprocal Ring Discount)', () => {
    it('returns 0 score for empty endorsements', () => {
      const res = computePeerCredibilityScore([]);
      expect(res.score).toBe(0);
      expect(res.validCount).toBe(0);
    });

    it('computes weighted peer credibility score from verified practitioners', () => {
      const endorsements = [
        { endorserWeight: 2.0 },
        { endorserWeight: 1.5 },
        { endorserWeight: 1.0 },
      ];
      const res = computePeerCredibilityScore(endorsements);
      expect(res.validCount).toBe(3);
      expect(res.score).toBeGreaterThan(40);
    });

    it('discounts reciprocal collusion rings to 0 weight (F-150)', () => {
      const endorsements = [
        { endorserWeight: 2.5, isReciprocalRing: true }, // Reciprocal ring -> discounted
        { endorserWeight: 1.0, isReciprocalRing: false },
      ];
      const res = computePeerCredibilityScore(endorsements);
      expect(res.validCount).toBe(1);
      // Only 1 valid endorsement counted
      expect(res.score).toBeLessThan(25);
    });
  });

  describe('computeLearningVelocityScore & computeEmergingExpertiseScore', () => {
    it('computes learning velocity score based on recent course completions', () => {
      expect(computeLearningVelocityScore(0)).toBe(0);
      expect(computeLearningVelocityScore(1)).toBe(42);
      expect(computeLearningVelocityScore(3)).toBe(81);
      expect(computeLearningVelocityScore(6)).toBe(96);
    });

    it('computes emerging expertise score based on verified depth in high-growth skills', () => {
      expect(computeEmergingExpertiseScore(0)).toBe(0);
      expect(computeEmergingExpertiseScore(2)).toBe(40);
      expect(computeEmergingExpertiseScore(5)).toBe(100);
      expect(computeEmergingExpertiseScore(8)).toBe(100); // Clamped
    });
  });

  describe('evaluateBehavioralTalentProfile (Multi-Dimensional Composite)', () => {
    it('evaluates full candidate behavioral profile with default weights', () => {
      const signals: CandidateRawSignals = {
        candidateId: 'cand-alice-123',
        contributionsCount30d: 20,
        challengesCompleted: 3,
        reputationOverallScore: 88,
        verifiedEndorsements: [{ endorserWeight: 1.5 }, { endorserWeight: 2.0 }],
        coursesCompletedLast90d: 2,
        emergingSkillsCount: 3,
        highlightedSkills: ['TypeScript', 'Rust', 'Distributed Systems'],
      };

      const profile = evaluateBehavioralTalentProfile(signals);

      expect(profile.candidateId).toBe('cand-alice-123');
      expect(profile.activityScore).toBeGreaterThan(60);
      expect(profile.reputationScore).toBe(88);
      expect(profile.peerCredibilityScore).toBeGreaterThan(30);
      expect(profile.learningVelocityScore).toBeGreaterThan(60);
      expect(profile.emergingExpertiseScore).toBe(60);
      expect(profile.compositeBehavioralScore).toBeGreaterThan(60);
      expect(profile.highlightedSkills).toEqual(['typescript', 'rust', 'distributed systems']);
      expect(profile.verifiedEndorsementsCount).toBe(2);
      expect(profile.recentActivityCount).toBe(20);
    });

    it('supports custom weights for specialized discovery needs', () => {
      const signals: CandidateRawSignals = {
        candidateId: 'cand-bob-456',
        contributionsCount30d: 0,
        challengesCompleted: 0,
        reputationOverallScore: 95,
        verifiedEndorsements: [],
        coursesCompletedLast90d: 0,
        emergingSkillsCount: 0,
      };

      // Custom weights emphasizing reputation 100%
      const customWeights = {
        activity: 0.0,
        reputation: 1.0,
        peerCredibility: 0.0,
        learningVelocity: 0.0,
        emergingExpertise: 0.0,
      };

      const profile = evaluateBehavioralTalentProfile(signals, customWeights);
      expect(profile.reputationScore).toBe(95);
      expect(profile.compositeBehavioralScore).toBe(95);
    });
  });

  describe('filterAndRankBehavioralTalent (Search & Discovery)', () => {
    const fixedNow = new Date('2026-09-25T12:00:00Z');

    const sampleProfiles: BehavioralTalentProfile[] = [
      {
        id: 'p1',
        candidateId: 'c1',
        activityScore: 90,
        reputationScore: 92,
        peerCredibilityScore: 85,
        learningVelocityScore: 75,
        emergingExpertiseScore: 80,
        compositeBehavioralScore: 86.5,
        highlightedSkills: ['typescript', 'react', 'graphql'],
        verifiedEndorsementsCount: 5,
        recentActivityCount: 35,
        lastActiveAt: '2026-09-24T00:00:00Z', // 1 day ago
        updatedAt: '2026-09-24T00:00:00Z',
      },
      {
        id: 'p2',
        candidateId: 'c2',
        activityScore: 70,
        reputationScore: 80,
        peerCredibilityScore: 60,
        learningVelocityScore: 50,
        emergingExpertiseScore: 40,
        compositeBehavioralScore: 64.0,
        highlightedSkills: ['typescript', 'node.js'],
        verifiedEndorsementsCount: 2,
        recentActivityCount: 15,
        lastActiveAt: '2026-09-10T00:00:00Z', // 15 days ago
        updatedAt: '2026-09-10T00:00:00Z',
      },
      {
        id: 'p3',
        candidateId: 'c3',
        activityScore: 95,
        reputationScore: 96,
        peerCredibilityScore: 90,
        learningVelocityScore: 85,
        emergingExpertiseScore: 100,
        compositeBehavioralScore: 93.0,
        highlightedSkills: ['rust', 'typescript', 'kubernetes'],
        verifiedEndorsementsCount: 8,
        recentActivityCount: 50,
        lastActiveAt: '2026-09-25T08:00:00Z', // Today
        updatedAt: '2026-09-25T08:00:00Z',
      },
    ];

    it('ranks candidates by composite behavioral score descending', () => {
      const result = filterAndRankBehavioralTalent(sampleProfiles, {}, fixedNow);
      expect(result.total).toBe(3);
      expect(result.profiles[0].candidateId).toBe('c3'); // 93.0
      expect(result.profiles[1].candidateId).toBe('c1'); // 86.5
      expect(result.profiles[2].candidateId).toBe('c2'); // 64.0
    });

    it('filters candidates by required skill match', () => {
      const result = filterAndRankBehavioralTalent(
        sampleProfiles,
        { requiredSkills: ['rust'] },
        fixedNow
      );
      expect(result.total).toBe(1);
      expect(result.profiles[0].candidateId).toBe('c3');
    });

    it('filters candidates by minimum composite score threshold', () => {
      const result = filterAndRankBehavioralTalent(
        sampleProfiles,
        { minCompositeScore: 80 },
        fixedNow
      );
      expect(result.total).toBe(2);
      expect(result.profiles.map((p) => p.candidateId)).toEqual(['c3', 'c1']);
    });

    it('filters candidates by recency of activity (maxDaysSinceActive)', () => {
      const result = filterAndRankBehavioralTalent(
        sampleProfiles,
        { maxDaysSinceActive: 7 }, // Active in last 7 days
        fixedNow
      );
      expect(result.total).toBe(2);
      expect(result.profiles.map((p) => p.candidateId)).toEqual(['c3', 'c1']);
    });

    it('supports offset and limit pagination', () => {
      const result = filterAndRankBehavioralTalent(
        sampleProfiles,
        { limit: 1, offset: 1 },
        fixedNow
      );
      expect(result.total).toBe(3);
      expect(result.profiles).toHaveLength(1);
      expect(result.profiles[0].candidateId).toBe('c1');
    });
  });
});

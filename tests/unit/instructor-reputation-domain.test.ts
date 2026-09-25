import { describe, it, expect } from 'vitest';
import {
  trimOutlierReviews,
  calculateCourseQualityScore,
  calculateTeachingEffectivenessScore,
  calculateCurrencyScore,
  calculateResponsivenessScore,
  calculateCommunityStandingScore,
  calculateInstructorReputation,
  createInstructorEndorsement,
  InstructorOperationalMetrics,
  InstructorReviewInput,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Instructor Reputation System Domain (F-148, F-72, F-144)', () => {
  describe('trimOutlierReviews (BR-F148-01: Anti-Manipulation)', () => {
    it('discards unverified enrollment reviews from reputation calculation', () => {
      const reviews: InstructorReviewInput[] = [
        { id: '1', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '2', rating: 1, isVerifiedEnrollment: false, createdAt: '2026-09-01T00:00:00Z' }, // spam/brigading
        { id: '3', rating: 4, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
      ];

      const result = trimOutlierReviews(reviews);
      expect(result.cleanRatings).toEqual([5, 4]);
      expect(result.verifiedAverage).toBe(4.5);
    });

    it('trims statistical outlier reviews exceeding 2 standard deviations', () => {
      // 9 ratings of 5, and 1 brigading rating of 1
      const reviews: InstructorReviewInput[] = [
        { id: '1', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '2', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '3', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '4', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '5', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '6', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '7', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '8', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '9', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        { id: '10', rating: 1, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' }, // Outlier
      ];

      const result = trimOutlierReviews(reviews);
      expect(result.trimmedCount).toBe(1);
      expect(result.cleanRatings.every((r) => r === 5)).toBe(true);
      expect(result.verifiedAverage).toBe(5);
    });

    it('returns baseline prior for zero verified reviews', () => {
      const result = trimOutlierReviews([]);
      expect(result.cleanRatings).toEqual([]);
      expect(result.verifiedAverage).toBe(3.5);
    });
  });

  describe('calculateCourseQualityScore', () => {
    it('accurately blends completion rate and verified review satisfaction', () => {
      // 80% completion rate, 5.0 review avg -> (80 * 0.5) + (100 * 0.5) = 40 + 50 = 90
      const score = calculateCourseQualityScore(80, 5.0);
      expect(score).toBe(90);
    });
  });

  describe('calculateTeachingEffectivenessScore', () => {
    it('applies Bayesian prior smoothing to dampen low-volume ratings', () => {
      // A single 5-star review should not yield 100/100 immediately
      const singleReview = calculateTeachingEffectivenessScore([5]);
      expect(singleReview.score).toBeLessThan(90);

      // 50 5-star reviews converges towards maximum score
      const manyReviews = calculateTeachingEffectivenessScore(Array(50).fill(5));
      expect(manyReviews.score).toBeGreaterThan(95);
    });
  });

  describe('calculateCurrencyScore', () => {
    it('rewards recently updated course material', () => {
      expect(calculateCurrencyScore(30, 2)).toBe(100);
      expect(calculateCurrencyScore(90, 2)).toBe(85);
      expect(calculateCurrencyScore(150, 2)).toBe(70);
      expect(calculateCurrencyScore(200, 2)).toBe(50);
      expect(calculateCurrencyScore(400, 2)).toBe(30);
    });

    it('returns default currency score when instructor has no active courses', () => {
      expect(calculateCurrencyScore(0, 0)).toBe(40);
    });
  });

  describe('calculateResponsivenessScore', () => {
    it('scores based on speed and answer rate', () => {
      // < 4 hours and 100% answer rate: (100 * 0.6) + (100 * 0.4) = 100
      expect(calculateResponsivenessScore(2, 100)).toBe(100);

      // 20 hours and 80% answer rate: (70 * 0.6) + (80 * 0.4) = 42 + 32 = 74
      expect(calculateResponsivenessScore(20, 80)).toBe(74);
    });
  });

  describe('calculateCommunityStandingScore', () => {
    it('caps community standing at 100 points (5 endorsements max)', () => {
      expect(calculateCommunityStandingScore(0)).toBe(0);
      expect(calculateCommunityStandingScore(3)).toBe(60);
      expect(calculateCommunityStandingScore(5)).toBe(100);
      expect(calculateCommunityStandingScore(8)).toBe(100);
    });
  });

  describe('calculateInstructorReputation', () => {
    it('produces a transparent factor breakdown with 5 weighted pillars', () => {
      const metrics: InstructorOperationalMetrics = {
        instructorId: '00000000-0000-4000-a000-000000000001',
        reviews: [
          { id: '1', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
          { id: '2', rating: 4, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
          { id: '3', rating: 5, isVerifiedEnrollment: true, createdAt: '2026-09-01T00:00:00Z' },
        ],
        completionRate: 85.0,
        daysSinceLastCourseUpdate: 45,
        avgQaResponseHours: 6.0,
        qaAnsweredRate: 95.0,
        activeCoursesCount: 3,
        peerEndorsementCount: 3,
      };

      const profile = calculateInstructorReputation(metrics);

      expect(profile.instructorId).toBe(metrics.instructorId);
      expect(profile.compositeScore).toBeGreaterThanOrEqual(70);
      expect(profile.band).toBeDefined();

      // Transparent Factor Breakdown (F-148 Acceptance)
      expect(profile.factors.courseQuality).toBeDefined();
      expect(profile.factors.courseQuality.weight).toBe(0.25);
      expect(profile.factors.teachingEffectiveness.weight).toBe(0.25);
      expect(profile.factors.currency.weight).toBe(0.20);
      expect(profile.factors.responsiveness.weight).toBe(0.15);
      expect(profile.factors.communityStanding.weight).toBe(0.15);

      const totalWeight =
        profile.factors.courseQuality.weight +
        profile.factors.teachingEffectiveness.weight +
        profile.factors.currency.weight +
        profile.factors.responsiveness.weight +
        profile.factors.communityStanding.weight;
      expect(Math.round(totalWeight * 100) / 100).toBe(1.0);
    });
  });

  describe('createInstructorEndorsement', () => {
    it('prevents self-endorsements (BR-F148-02)', () => {
      expect(() =>
        createInstructorEndorsement({
          instructorId: 'inst-123',
          endorserId: 'inst-123',
          endorserRoles: ['instructor'],
        })
      ).toThrowError(DomainError);
    });

    it('rejects endorsements from non-instructor roles', () => {
      expect(() =>
        createInstructorEndorsement({
          instructorId: 'inst-123',
          endorserId: 'cand-456',
          endorserRoles: ['candidate'],
        })
      ).toThrowError(DomainError);
    });

    it('creates verified peer instructor endorsement', () => {
      const endorsement = createInstructorEndorsement({
        instructorId: 'inst-123',
        endorserId: 'inst-789',
        endorserRoles: ['instructor'],
        skillDomain: 'Distributed Systems',
        notes: 'Exceptional pedagogy in Raft consensus algorithms',
      });

      expect(endorsement.id).toBeDefined();
      expect(endorsement.instructorId).toBe('inst-123');
      expect(endorsement.endorserId).toBe('inst-789');
      expect(endorsement.skillDomain).toBe('distributed systems');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  ratingToScore,
  determineEmployerReputationBand,
  createEmployerReview,
  trimOutlierEmployerReviews,
  calculateEmployerReputation,
  EmployerReview,
} from '../../packages/domain/src/employer-reputation.js';
import { DomainError } from '../../packages/domain/src/index.js';

describe('Employer Reputation & Brand System Domain (F-149, F-75, F-56, F-144)', () => {
  const orgId = '11111111-1111-1111-1111-111111111111';
  const reviewer1Id = '22222222-2222-2222-2222-222222222222';

  describe('Rating Normalization & Reputation Bands', () => {
    it('normalizes 1..5 star ratings to 0..100 continuous score', () => {
      expect(ratingToScore(1)).toBe(0);
      expect(ratingToScore(3)).toBe(50);
      expect(ratingToScore(5)).toBe(100);
      expect(ratingToScore(4)).toBe(75);
    });

    it('determines reputation bands correctly (BR-F149-03)', () => {
      expect(determineEmployerReputationBand(92)).toBe('top_employer');
      expect(determineEmployerReputationBand(85)).toBe('top_employer');
      expect(determineEmployerReputationBand(78)).toBe('strong_reputation');
      expect(determineEmployerReputationBand(70)).toBe('strong_reputation');
      expect(determineEmployerReputationBand(65)).toBe('developing');
      expect(determineEmployerReputationBand(50)).toBe('developing');
      expect(determineEmployerReputationBand(42)).toBe('needs_improvement');
    });
  });

  describe('Review Creation & Invariants', () => {
    it('creates a valid employer review', () => {
      const review = createEmployerReview({
        organizationId: orgId,
        reviewerId: reviewer1Id,
        employmentStatus: 'current',
        hiringRating: 4.5,
        cultureRating: 4.0,
        growthRating: 5.0,
        compensationRating: 4.0,
        leadershipRating: 4.5,
        title: 'Outstanding engineering culture',
        feedback: 'Transparent leadership and high autonomy.',
        isVerifiedEmployee: true,
      });

      expect(review.id).toBeDefined();
      expect(review.organizationId).toBe(orgId);
      expect(review.reviewerId).toBe(reviewer1Id);
      expect(review.isVerifiedEmployee).toBe(true);
      expect(review.title).toBe('Outstanding engineering culture');
    });

    it('rejects ratings outside 1..5 bounds', () => {
      expect(() =>
        createEmployerReview({
          organizationId: orgId,
          reviewerId: reviewer1Id,
          employmentStatus: 'candidate',
          hiringRating: 5.5, // Invalid > 5
          cultureRating: 3.0,
          growthRating: 3.0,
          compensationRating: 3.0,
          leadershipRating: 3.0,
          title: 'Review',
        })
      ).toThrow(DomainError);
    });

    it('rejects empty review title', () => {
      expect(() =>
        createEmployerReview({
          organizationId: orgId,
          reviewerId: reviewer1Id,
          employmentStatus: 'former',
          hiringRating: 3.0,
          cultureRating: 3.0,
          growthRating: 3.0,
          compensationRating: 3.0,
          leadershipRating: 3.0,
          title: '   ',
        })
      ).toThrow(DomainError);
    });

    it('prohibits organization owners and recruiters from submitting reviews as candidates', () => {
      expect(() =>
        createEmployerReview({
          organizationId: orgId,
          reviewerId: reviewer1Id,
          employmentStatus: 'candidate',
          hiringRating: 5.0,
          cultureRating: 5.0,
          growthRating: 5.0,
          compensationRating: 5.0,
          leadershipRating: 5.0,
          title: 'Self Astroturfed Review',
          isOrgRecruiterOrOwner: true,
        })
      ).toThrow(DomainError);
    });
  });

  describe('Anti-Manipulation Outlier Trimming (BR-F149-02)', () => {
    it('does not trim when fewer than 5 reviews exist', () => {
      const sampleReviews: EmployerReview[] = [
        {
          id: 'r1',
          organizationId: orgId,
          reviewerId: 'u1',
          employmentStatus: 'candidate',
          hiringRating: 5,
          cultureRating: 5,
          growthRating: 5,
          compensationRating: 5,
          leadershipRating: 5,
          title: 'Great',
          isVerifiedEmployee: false,
          createdAt: new Date().toISOString(),
        },
      ];

      const { retainedReviews, trimmedCount } = trimOutlierEmployerReviews(sampleReviews);
      expect(trimmedCount).toBe(0);
      expect(retainedReviews).toHaveLength(1);
    });

    it('trims unverified reviews that are statistical outliers >2 stddev away from mean', () => {
      const clusterReviews: EmployerReview[] = Array.from({ length: 8 }, (_, i) => ({
        id: `r-${i}`,
        organizationId: orgId,
        reviewerId: `u-${i}`,
        employmentStatus: 'current',
        hiringRating: 4.8,
        cultureRating: 4.8,
        growthRating: 4.8,
        compensationRating: 4.8,
        leadershipRating: 4.8,
        title: 'Solid company',
        isVerifiedEmployee: true,
        createdAt: new Date().toISOString(),
      }));

      // Add 1 extreme malicious brigading review from unverified user (all 1s)
      clusterReviews.push({
        id: 'r-brigade',
        organizationId: orgId,
        reviewerId: 'u-brigade',
        employmentStatus: 'candidate',
        hiringRating: 1,
        cultureRating: 1,
        growthRating: 1,
        compensationRating: 1,
        leadershipRating: 1,
        title: 'Horrible',
        isVerifiedEmployee: false,
        createdAt: new Date().toISOString(),
      });

      const { retainedReviews, trimmedCount } = trimOutlierEmployerReviews(clusterReviews);
      expect(trimmedCount).toBe(1);
      expect(retainedReviews.some((r) => r.id === 'r-brigade')).toBe(false);
    });
  });

  describe('Multi-Dimensional Scoring Calculation (BR-F149-01)', () => {
    it('returns default baseline (50 score, developing band) when no reviews or metrics exist', () => {
      const profile = calculateEmployerReputation({ organizationId: orgId });

      expect(profile.organizationId).toBe(orgId);
      expect(profile.overallScore).toBeGreaterThanOrEqual(50);
      expect(profile.reputationBand).toBe('developing');
      expect(profile.verifiedReviewsCount).toBe(0);
      expect(profile.totalReviewsCount).toBe(0);
    });

    it('computes transparent factor breakdown based on weights (25/25/20/15/15)', () => {
      const reviews: EmployerReview[] = [
        {
          id: 'r1',
          organizationId: orgId,
          reviewerId: 'u1',
          employmentStatus: 'current',
          hiringRating: 5.0, // 100
          cultureRating: 5.0, // 100
          growthRating: 5.0, // 100
          compensationRating: 5.0, // 100
          leadershipRating: 5.0, // 100
          title: 'Best place to work',
          isVerifiedEmployee: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const profile = calculateEmployerReputation({
        organizationId: orgId,
        reviews,
        metrics: {
          offerAcceptanceRate: 90,
          internalPromotionRate: 85,
          salaryTransparencyIndex: 95,
          offerRescindedRate: 0,
        },
      });

      expect(profile.overallScore).toBeGreaterThanOrEqual(85);
      expect(profile.reputationBand).toBe('top_employer');
      expect(profile.factors.hiringScore).toBeGreaterThan(80);
      expect(profile.factors.cultureScore).toBe(100);
      expect(profile.factors.growthScore).toBeGreaterThan(80);
      expect(profile.factors.compensationReliabilityScore).toBeGreaterThan(85);
      expect(profile.factors.leadershipScore).toBe(100);
      expect(profile.highlights.length).toBeGreaterThanOrEqual(3);
    });
  });
});

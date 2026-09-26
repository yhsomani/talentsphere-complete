/**
 * TalentSphere Instructor Reputation System Domain Model (F-148, F-72, F-144)
 * Provides multi-factor credibility scoring, transparent factor breakdowns,
 * and robust anti-manipulation review trimming.
 */

import crypto from 'node:crypto';
import { DomainError } from './core.js';
import { ReputationBand, determineReputationBand } from './reputation-engine.js';

export interface FactorDetail {
  score: number; // 0 - 100
  weight: number; // Decimal (sum of weights = 1.0)
  contribution: number; // score * weight
  metrics: Record<string, number | string>;
}

export interface InstructorReputationFactors {
  courseQuality: FactorDetail;
  teachingEffectiveness: FactorDetail;
  currency: FactorDetail;
  responsiveness: FactorDetail;
  communityStanding: FactorDetail;
}

export interface InstructorReputationProfile {
  id: string;
  instructorId: string;
  compositeScore: number; // 0 - 100
  band: ReputationBand;
  factors: InstructorReputationFactors;
  reviewCount: number;
  completionRate: number;
  avgQaResponseHours: number;
  endorsementCount: number;
  coursesCount: number;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorReviewInput {
  id: string;
  rating: number; // 1 to 5
  isVerifiedEnrollment: boolean;
  createdAt: string;
}

export interface InstructorOperationalMetrics {
  instructorId: string;
  reviews: InstructorReviewInput[];
  completionRate: number; // 0 - 100 percentage
  daysSinceLastCourseUpdate: number;
  avgQaResponseHours: number;
  qaAnsweredRate: number; // 0 - 100 percentage
  activeCoursesCount: number;
  peerEndorsementCount: number;
}

export interface CreateInstructorEndorsementParams {
  id?: string;
  instructorId: string;
  endorserId: string;
  endorserRoles: string[];
  skillDomain?: string;
  notes?: string;
  nowIso?: string;
}

export interface InstructorEndorsement {
  id: string;
  instructorId: string;
  endorserId: string;
  skillDomain: string;
  notes?: string;
  createdAt: string;
}

/**
 * Anti-manipulation review trimmer (BR-F148-01).
 * Filters out unverified enrollment reviews and trims statistical outliers (> 2 standard deviations).
 */
export function trimOutlierReviews(reviews: InstructorReviewInput[]): {
  cleanRatings: number[];
  trimmedCount: number;
  verifiedAverage: number;
} {
  // 1. Only verified enrollments are considered for formal instructor reputation
  const verifiedReviews = reviews.filter(
    (r) => r.isVerifiedEnrollment && r.rating >= 1 && r.rating <= 5
  );

  if (verifiedReviews.length === 0) {
    return { cleanRatings: [], trimmedCount: 0, verifiedAverage: 3.5 };
  }

  const ratings = verifiedReviews.map((r) => r.rating);

  // If sample size is small (< 5), outlier rejection is not statistically sound
  if (ratings.length < 5) {
    const sum = ratings.reduce((acc, v) => acc + v, 0);
    const avg = Math.round((sum / ratings.length) * 100) / 100;
    return { cleanRatings: ratings, trimmedCount: 0, verifiedAverage: avg };
  }

  const mean = ratings.reduce((acc, v) => acc + v, 0) / ratings.length;
  const variance = ratings.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / ratings.length;
  const stdDev = Math.sqrt(variance);

  // Trim ratings > 2 stdDev away from mean
  const cleanRatings = ratings.filter((r) => {
    if (stdDev < 0.2) return true; // tight consensus
    return Math.abs(r - mean) <= 2 * stdDev;
  });

  const trimmedCount = ratings.length - cleanRatings.length;
  const cleanSum = cleanRatings.reduce((acc, v) => acc + v, 0);
  const cleanAvg =
    cleanRatings.length > 0 ? Math.round((cleanSum / cleanRatings.length) * 100) / 100 : mean;

  return {
    cleanRatings,
    trimmedCount,
    verifiedAverage: cleanAvg,
  };
}

/**
 * Calculates deterministic course quality score (0 - 100).
 * Blends course completion rate and verified student review average.
 */
export function calculateCourseQualityScore(
  completionRate: number,
  verifiedReviewAvg: number
): number {
  const normCompletion = Math.max(0, Math.min(100, completionRate));
  const normReview = ((Math.max(1, Math.min(5, verifiedReviewAvg)) - 1) / 4) * 100;
  // 50% completion rate + 50% normalized review satisfaction
  return Math.round((normCompletion * 0.5 + normReview * 0.5) * 100) / 100;
}

/**
 * Calculates teaching effectiveness score with Bayesian prior smoothing (0 - 100).
 */
export function calculateTeachingEffectivenessScore(cleanRatings: number[]): {
  score: number;
  dampenedAverage: number;
} {
  const priorMean = 3.5;
  const priorWeight = 5;

  const count = cleanRatings.length;
  const sampleSum = cleanRatings.reduce((sum, r) => sum + r, 0);

  const bayesianMean = (sampleSum + priorMean * priorWeight) / (count + priorWeight);
  const score = Math.round(((bayesianMean - 1) / 4) * 100 * 100) / 100;

  return {
    score: Math.max(0, Math.min(100, score)),
    dampenedAverage: Math.round(bayesianMean * 100) / 100,
  };
}

/**
 * Calculates course currency score based on freshness of course material updates.
 */
export function calculateCurrencyScore(
  daysSinceLastUpdate: number,
  activeCoursesCount: number
): number {
  if (activeCoursesCount === 0) return 40.0;

  if (daysSinceLastUpdate <= 60) return 100.0;
  if (daysSinceLastUpdate <= 120) return 85.0;
  if (daysSinceLastUpdate <= 180) return 70.0;
  if (daysSinceLastUpdate <= 365) return 50.0;
  return 30.0;
}

/**
 * Calculates Q&A and support responsiveness score (0 - 100).
 */
export function calculateResponsivenessScore(
  avgResponseHours: number,
  answeredRate: number
): number {
  let speedScore = 25.0;
  if (avgResponseHours <= 4) speedScore = 100.0;
  else if (avgResponseHours <= 12) speedScore = 85.0;
  else if (avgResponseHours <= 24) speedScore = 70.0;
  else if (avgResponseHours <= 48) speedScore = 50.0;

  const answerRateScore = Math.max(0, Math.min(100, answeredRate));
  return Math.round((speedScore * 0.6 + answerRateScore * 0.4) * 100) / 100;
}

/**
 * Calculates community standing from peer instructor endorsements (0 - 100).
 */
export function calculateCommunityStandingScore(endorsementCount: number): number {
  // Each verified peer instructor endorsement grants 20 points, up to 100 (max 5 endorsements)
  return Math.min(100, endorsementCount * 20.0);
}

/**
 * Computes transparent, deterministic instructor reputation profile (F-148).
 */
export function calculateInstructorReputation(
  metrics: InstructorOperationalMetrics,
  nowIso: string = new Date().toISOString()
): InstructorReputationProfile {
  if (!metrics.instructorId) {
    throw new DomainError('VALIDATION_FAILED', 'Instructor ID is required.');
  }

  // 1. Process reviews and trim manipulation
  const reviewResult = trimOutlierReviews(metrics.reviews);

  // 2. Compute individual factors
  const courseQualityScore = calculateCourseQualityScore(
    metrics.completionRate,
    reviewResult.verifiedAverage
  );
  const teaching = calculateTeachingEffectivenessScore(reviewResult.cleanRatings);
  const currencyScore = calculateCurrencyScore(
    metrics.daysSinceLastCourseUpdate,
    metrics.activeCoursesCount
  );
  const responsivenessScore = calculateResponsivenessScore(
    metrics.avgQaResponseHours,
    metrics.qaAnsweredRate
  );
  const communityScore = calculateCommunityStandingScore(metrics.peerEndorsementCount);

  // Factor weights:
  // Course Quality: 25%, Teaching Effectiveness: 25%, Currency: 20%, Responsiveness: 15%, Community Standing: 15%
  const WEIGHT_QUALITY = 0.25;
  const WEIGHT_TEACHING = 0.25;
  const WEIGHT_CURRENCY = 0.2;
  const WEIGHT_RESPONSIVENESS = 0.15;
  const WEIGHT_COMMUNITY = 0.15;

  const factors: InstructorReputationFactors = {
    courseQuality: {
      score: courseQualityScore,
      weight: WEIGHT_QUALITY,
      contribution: Math.round(courseQualityScore * WEIGHT_QUALITY * 100) / 100,
      metrics: {
        completionRate: metrics.completionRate,
        verifiedReviewAverage: reviewResult.verifiedAverage,
        trimmedOutlierCount: reviewResult.trimmedCount,
      },
    },
    teachingEffectiveness: {
      score: teaching.score,
      weight: WEIGHT_TEACHING,
      contribution: Math.round(teaching.score * WEIGHT_TEACHING * 100) / 100,
      metrics: {
        sampleSize: reviewResult.cleanRatings.length,
        dampenedRatingAverage: teaching.dampenedAverage,
      },
    },
    currency: {
      score: currencyScore,
      weight: WEIGHT_CURRENCY,
      contribution: Math.round(currencyScore * WEIGHT_CURRENCY * 100) / 100,
      metrics: {
        daysSinceLastUpdate: metrics.daysSinceLastCourseUpdate,
        activeCoursesCount: metrics.activeCoursesCount,
      },
    },
    responsiveness: {
      score: responsivenessScore,
      weight: WEIGHT_RESPONSIVENESS,
      contribution: Math.round(responsivenessScore * WEIGHT_RESPONSIVENESS * 100) / 100,
      metrics: {
        avgQaResponseHours: metrics.avgQaResponseHours,
        qaAnsweredRate: metrics.qaAnsweredRate,
      },
    },
    communityStanding: {
      score: communityScore,
      weight: WEIGHT_COMMUNITY,
      contribution: Math.round(communityScore * WEIGHT_COMMUNITY * 100) / 100,
      metrics: {
        peerEndorsements: metrics.peerEndorsementCount,
      },
    },
  };

  const compositeRaw =
    factors.courseQuality.contribution +
    factors.teachingEffectiveness.contribution +
    factors.currency.contribution +
    factors.responsiveness.contribution +
    factors.communityStanding.contribution;

  const compositeScore = Math.max(0, Math.min(100, Math.round(compositeRaw * 100) / 100));
  const band = determineReputationBand(compositeScore);

  return {
    id: crypto.randomUUID(),
    instructorId: metrics.instructorId,
    compositeScore,
    band,
    factors,
    reviewCount: metrics.reviews.length,
    completionRate: metrics.completionRate,
    avgQaResponseHours: metrics.avgQaResponseHours,
    endorsementCount: metrics.peerEndorsementCount,
    coursesCount: metrics.activeCoursesCount,
    lastCalculatedAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Validates and creates a peer instructor endorsement.
 */
export function createInstructorEndorsement(
  params: CreateInstructorEndorsementParams
): InstructorEndorsement {
  if (!params.instructorId || !params.endorserId) {
    throw new DomainError('VALIDATION_FAILED', 'Both instructorId and endorserId are required.');
  }

  if (params.instructorId === params.endorserId) {
    throw new DomainError('FORBIDDEN', 'Instructors cannot endorse themselves.');
  }

  const isQualifiedEndorser =
    params.endorserRoles.includes('instructor') ||
    params.endorserRoles.includes('course_author') ||
    params.endorserRoles.includes('platform_admin');

  if (!isQualifiedEndorser) {
    throw new DomainError(
      'FORBIDDEN',
      'Only verified instructors or platform administrators can endorse an instructor.'
    );
  }

  return {
    id: params.id || crypto.randomUUID(),
    instructorId: params.instructorId,
    endorserId: params.endorserId,
    skillDomain: (params.skillDomain || 'general').toLowerCase().trim(),
    notes: params.notes?.trim(),
    createdAt: params.nowIso || new Date().toISOString(),
  };
}

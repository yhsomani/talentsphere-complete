/**
 * TalentSphere Instructor Reputation System Domain Model (F-148, F-72, F-144)
 * Provides multi-factor credibility scoring, transparent factor breakdowns,
 * and robust anti-manipulation review trimming.
 */
import { ReputationBand } from './reputation-engine.js';
export interface FactorDetail {
    score: number;
    weight: number;
    contribution: number;
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
    compositeScore: number;
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
    rating: number;
    isVerifiedEnrollment: boolean;
    createdAt: string;
}
export interface InstructorOperationalMetrics {
    instructorId: string;
    reviews: InstructorReviewInput[];
    completionRate: number;
    daysSinceLastCourseUpdate: number;
    avgQaResponseHours: number;
    qaAnsweredRate: number;
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
export declare function trimOutlierReviews(reviews: InstructorReviewInput[]): {
    cleanRatings: number[];
    trimmedCount: number;
    verifiedAverage: number;
};
/**
 * Calculates deterministic course quality score (0 - 100).
 * Blends course completion rate and verified student review average.
 */
export declare function calculateCourseQualityScore(completionRate: number, verifiedReviewAvg: number): number;
/**
 * Calculates teaching effectiveness score with Bayesian prior smoothing (0 - 100).
 */
export declare function calculateTeachingEffectivenessScore(cleanRatings: number[]): {
    score: number;
    dampenedAverage: number;
};
/**
 * Calculates course currency score based on freshness of course material updates.
 */
export declare function calculateCurrencyScore(daysSinceLastUpdate: number, activeCoursesCount: number): number;
/**
 * Calculates Q&A and support responsiveness score (0 - 100).
 */
export declare function calculateResponsivenessScore(avgResponseHours: number, answeredRate: number): number;
/**
 * Calculates community standing from peer instructor endorsements (0 - 100).
 */
export declare function calculateCommunityStandingScore(endorsementCount: number): number;
/**
 * Computes transparent, deterministic instructor reputation profile (F-148).
 */
export declare function calculateInstructorReputation(metrics: InstructorOperationalMetrics, nowIso?: string): InstructorReputationProfile;
/**
 * Validates and creates a peer instructor endorsement.
 */
export declare function createInstructorEndorsement(params: CreateInstructorEndorsementParams): InstructorEndorsement;
//# sourceMappingURL=instructor-reputation.d.ts.map
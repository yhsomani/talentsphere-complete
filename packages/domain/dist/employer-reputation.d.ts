/**
 * TalentSphere Employer Reputation & Brand System Domain Model (F-149, F-75, F-56, F-144)
 * Deterministic multi-dimensional brand perception scoring based on transparent factor pillars,
 * anti-manipulation outlier trimming, verified review weighting, and hiring reliability metrics.
 */
export type EmployerReputationBand = 'top_employer' | 'strong_reputation' | 'developing' | 'needs_improvement';
export interface EmployerFactorBreakdown {
    hiringScore: number;
    cultureScore: number;
    growthScore: number;
    compensationReliabilityScore: number;
    leadershipScore: number;
}
export interface EmployerReputationProfile {
    organizationId: string;
    overallScore: number;
    reputationBand: EmployerReputationBand;
    factors: EmployerFactorBreakdown;
    verifiedReviewsCount: number;
    totalReviewsCount: number;
    highlights: string[];
    areasForImprovement: string[];
    updatedAt: string;
}
export interface EmployerReview {
    id: string;
    organizationId: string;
    reviewerId: string;
    employmentStatus: 'current' | 'former' | 'candidate';
    hiringRating: number;
    cultureRating: number;
    growthRating: number;
    compensationRating: number;
    leadershipRating: number;
    title: string;
    feedback?: string;
    isVerifiedEmployee: boolean;
    createdAt: string;
}
export interface EmployerOperationalMetrics {
    avgTimeToHireDays?: number;
    offerAcceptanceRate?: number;
    offerRescindedRate?: number;
    salaryTransparencyIndex?: number;
    internalPromotionRate?: number;
}
export interface CalculateEmployerReputationParams {
    organizationId: string;
    reviews?: EmployerReview[];
    metrics?: EmployerOperationalMetrics;
    nowIso?: string;
}
/**
 * Normalizes a 1..5 star rating to a 0..100 continuous score.
 */
export declare function ratingToScore(rating: number): number;
/**
 * Determines the Employer Reputation Band based on overall score (BR-F149-03).
 */
export declare function determineEmployerReputationBand(score: number): EmployerReputationBand;
/**
 * Trims outlier reviews to prevent astroturfing and brigading (BR-F149-02).
 * Dampens or excludes reviews that are > 2.0 standard deviations from the cohort mean.
 */
export declare function trimOutlierEmployerReviews(reviews: EmployerReview[]): {
    retainedReviews: EmployerReview[];
    trimmedCount: number;
};
/**
 * Calculates deterministic Employer Reputation Breakdown and Overall Score (BR-F149-01).
 * 5 Factor Pillars:
 * 1. Hiring Process (25%)
 * 2. Work Culture (25%)
 * 3. Career Growth (20%)
 * 4. Compensation Reliability (15%)
 * 5. Leadership & Brand (15%)
 */
export declare function calculateEmployerReputation(params: CalculateEmployerReputationParams): EmployerReputationProfile;
/**
 * Validates and creates an Employer Review.
 */
export declare function createEmployerReview(params: {
    id?: string;
    organizationId: string;
    reviewerId: string;
    employmentStatus: 'current' | 'former' | 'candidate';
    hiringRating: number;
    cultureRating: number;
    growthRating: number;
    compensationRating: number;
    leadershipRating: number;
    title: string;
    feedback?: string;
    isVerifiedEmployee?: boolean;
    isOrgRecruiterOrOwner?: boolean;
    nowIso?: string;
}): EmployerReview;
//# sourceMappingURL=employer-reputation.d.ts.map
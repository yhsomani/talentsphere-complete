/**
 * TalentSphere Employer Reputation & Brand System Domain Model (F-149, F-75, F-56, F-144)
 * Deterministic multi-dimensional brand perception scoring based on transparent factor pillars,
 * anti-manipulation outlier trimming, verified review weighting, and hiring reliability metrics.
 */
import crypto from 'node:crypto';
import { DomainError } from './core.js';
/**
 * Normalizes a 1..5 star rating to a 0..100 continuous score.
 */
export function ratingToScore(rating) {
    const bounded = Math.max(1, Math.min(5, rating));
    return Math.round(((bounded - 1) / 4) * 100 * 100) / 100;
}
/**
 * Determines the Employer Reputation Band based on overall score (BR-F149-03).
 */
export function determineEmployerReputationBand(score) {
    if (score >= 85)
        return 'top_employer';
    if (score >= 70)
        return 'strong_reputation';
    if (score >= 50)
        return 'developing';
    return 'needs_improvement';
}
/**
 * Trims outlier reviews to prevent astroturfing and brigading (BR-F149-02).
 * Dampens or excludes reviews that are > 2.0 standard deviations from the cohort mean.
 */
export function trimOutlierEmployerReviews(reviews) {
    if (reviews.length < 5) {
        return { retainedReviews: reviews, trimmedCount: 0 };
    }
    const scores = reviews.map((r) => {
        return ((r.hiringRating +
            r.cultureRating +
            r.growthRating +
            r.compensationRating +
            r.leadershipRating) /
            5);
    });
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < 0.2) {
        return { retainedReviews: reviews, trimmedCount: 0 };
    }
    const retained = [];
    let trimmedCount = 0;
    for (let i = 0; i < reviews.length; i++) {
        const r = reviews[i];
        const s = scores[i];
        const isOutlier = Math.abs(s - mean) > 2.0 * stdDev;
        // Unverified reviews that are statistical outliers are trimmed
        if (isOutlier && !r.isVerifiedEmployee) {
            trimmedCount++;
        }
        else {
            retained.push(r);
        }
    }
    return { retainedReviews: retained, trimmedCount };
}
/**
 * Calculates deterministic Employer Reputation Breakdown and Overall Score (BR-F149-01).
 * 5 Factor Pillars:
 * 1. Hiring Process (25%)
 * 2. Work Culture (25%)
 * 3. Career Growth (20%)
 * 4. Compensation Reliability (15%)
 * 5. Leadership & Brand (15%)
 */
export function calculateEmployerReputation(params) {
    const reviews = params.reviews || [];
    const metrics = params.metrics || {};
    const now = params.nowIso || new Date().toISOString();
    const { retainedReviews } = trimOutlierEmployerReviews(reviews);
    // Compute baseline averages from reviews (default 50 if no reviews)
    let rawHiring = 50;
    let rawCulture = 50;
    let rawGrowth = 50;
    let rawComp = 50;
    let rawLead = 50;
    if (retainedReviews.length > 0) {
        let totalWeight = 0;
        let sumHiring = 0;
        let sumCulture = 0;
        let sumGrowth = 0;
        let sumComp = 0;
        let sumLead = 0;
        for (const r of retainedReviews) {
            // Verified employee reviews carry higher weighting (1.0 vs 0.7 for candidate/unverified)
            const w = r.isVerifiedEmployee ? 1.0 : 0.7;
            totalWeight += w;
            sumHiring += ratingToScore(r.hiringRating) * w;
            sumCulture += ratingToScore(r.cultureRating) * w;
            sumGrowth += ratingToScore(r.growthRating) * w;
            sumComp += ratingToScore(r.compensationRating) * w;
            sumLead += ratingToScore(r.leadershipRating) * w;
        }
        rawHiring = sumHiring / totalWeight;
        rawCulture = sumCulture / totalWeight;
        rawGrowth = sumGrowth / totalWeight;
        rawComp = sumComp / totalWeight;
        rawLead = sumLead / totalWeight;
    }
    // Factor 1: Hiring Process (25% total weight)
    // Blend candidate review score with operational time-to-hire & offer acceptance
    let hiringOperational = 70;
    if (metrics.offerAcceptanceRate !== undefined) {
        hiringOperational = metrics.offerAcceptanceRate;
    }
    const hiringScore = Math.round((rawHiring * 0.7 + hiringOperational * 0.3) * 100) / 100;
    // Factor 2: Work Culture (25% total weight)
    const cultureScore = Math.round(rawCulture * 100) / 100;
    // Factor 3: Career Growth (20% total weight)
    let growthOperational = 60;
    if (metrics.internalPromotionRate !== undefined) {
        growthOperational = metrics.internalPromotionRate;
    }
    const growthScore = Math.round((rawGrowth * 0.7 + growthOperational * 0.3) * 100) / 100;
    // Factor 4: Compensation & Reliability (15% total weight)
    let compOperational = 70;
    if (metrics.salaryTransparencyIndex !== undefined && metrics.offerRescindedRate !== undefined) {
        const rescindScore = Math.max(0, 100 - metrics.offerRescindedRate * 10);
        compOperational = metrics.salaryTransparencyIndex * 0.5 + rescindScore * 0.5;
    }
    else if (metrics.salaryTransparencyIndex !== undefined) {
        compOperational = metrics.salaryTransparencyIndex;
    }
    const compensationReliabilityScore = Math.round((rawComp * 0.6 + compOperational * 0.4) * 100) / 100;
    // Factor 5: Leadership & Brand (15% total weight)
    const leadershipScore = Math.round(rawLead * 100) / 100;
    // Aggregate Overall Score (weights sum to 1.00)
    const overallScore = Math.round((hiringScore * 0.25 +
        cultureScore * 0.25 +
        growthScore * 0.2 +
        compensationReliabilityScore * 0.15 +
        leadershipScore * 0.15) *
        100) / 100;
    const reputationBand = determineEmployerReputationBand(overallScore);
    const verifiedReviewsCount = reviews.filter((r) => r.isVerifiedEmployee).length;
    // Generate transparent highlights and areas for improvement
    const highlights = [];
    const areasForImprovement = [];
    if (cultureScore >= 80)
        highlights.push('Exceptional workplace culture & psychological safety');
    if (hiringScore >= 80)
        highlights.push('Candidate-centric, responsive hiring experience');
    if (growthScore >= 80)
        highlights.push('Strong internal career mobility & promotion path');
    if (compensationReliabilityScore >= 80)
        highlights.push('Transparent, reliable compensation & honor rates');
    if (leadershipScore >= 80)
        highlights.push('High executive approval & transparent vision');
    if (cultureScore < 60)
        areasForImprovement.push('Workplace environment & inclusion feedback');
    if (hiringScore < 60)
        areasForImprovement.push('Interview process responsiveness & clarity');
    if (growthScore < 60)
        areasForImprovement.push('Career development & mentorship opportunities');
    if (compensationReliabilityScore < 60)
        areasForImprovement.push('Salary transparency & compensation equity');
    if (leadershipScore < 60)
        areasForImprovement.push('Leadership visibility & strategic direction');
    return {
        organizationId: params.organizationId,
        overallScore,
        reputationBand,
        factors: {
            hiringScore,
            cultureScore,
            growthScore,
            compensationReliabilityScore,
            leadershipScore,
        },
        verifiedReviewsCount,
        totalReviewsCount: reviews.length,
        highlights,
        areasForImprovement,
        updatedAt: now,
    };
}
/**
 * Validates and creates an Employer Review.
 */
export function createEmployerReview(params) {
    if (params.isOrgRecruiterOrOwner) {
        throw new DomainError('FORBIDDEN', 'Organization owners and recruiters cannot submit reviews for their own employer.');
    }
    const ratings = [
        params.hiringRating,
        params.cultureRating,
        params.growthRating,
        params.compensationRating,
        params.leadershipRating,
    ];
    for (const r of ratings) {
        if (typeof r !== 'number' || isNaN(r) || r < 1 || r > 5) {
            throw new DomainError('VALIDATION_FAILED', 'All rating dimensions must be between 1 and 5');
        }
    }
    if (!params.title || params.title.trim().length === 0) {
        throw new DomainError('VALIDATION_FAILED', 'Review title is required');
    }
    return {
        id: params.id || crypto.randomUUID(),
        organizationId: params.organizationId,
        reviewerId: params.reviewerId,
        employmentStatus: params.employmentStatus,
        hiringRating: params.hiringRating,
        cultureRating: params.cultureRating,
        growthRating: params.growthRating,
        compensationRating: params.compensationRating,
        leadershipRating: params.leadershipRating,
        title: params.title.trim(),
        feedback: params.feedback?.trim(),
        isVerifiedEmployee: params.isVerifiedEmployee ?? false,
        createdAt: params.nowIso || new Date().toISOString(),
    };
}
//# sourceMappingURL=employer-reputation.js.map
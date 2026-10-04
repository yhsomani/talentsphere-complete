/**
 * TalentSphere Peer Credibility Networks Domain Model (F-150, F-110, F-144)
 * Deterministic multi-factor endorsement weighting incorporating network distance,
 * endorser credibility, domain specialization, track record, and anti-collusion dampening.
 */
import crypto from 'node:crypto';
import { DomainError } from './core.js';
/**
 * Calculates deterministic network distance factor (BR-F150-01).
 * 1st-degree (direct connection): 1.00
 * 2nd-degree: 0.75
 * 3rd-degree: 0.50
 * 4th-degree: 0.25
 * 5th-degree / unlinked: 0.10
 */
export function calculateNetworkDistanceFactor(distance) {
    if (distance <= 1)
        return 1.0;
    if (distance === 2)
        return 0.75;
    if (distance === 3)
        return 0.5;
    if (distance === 4)
        return 0.25;
    return 0.1;
}
/**
 * Normalizes endorser's reputation score to credibility factor (0.10 - 1.00).
 */
export function normalizeEndorserCredibility(reputationScore) {
    if (reputationScore === undefined || reputationScore === null)
        return 0.5;
    const clamped = Math.max(0, Math.min(100, reputationScore));
    return Math.max(0.1, Math.round((clamped / 100) * 100) / 100);
}
/**
 * Converts accuracy score to track record multiplier (0.50 - 1.50).
 */
export function calculateTrackRecordMultiplier(accuracyScore) {
    if (accuracyScore === undefined || accuracyScore === null)
        return 1.0;
    const clamped = Math.max(0.0, Math.min(1.0, accuracyScore));
    // Maps 0.0 -> 0.50, 0.5 -> 1.00, 1.0 -> 1.50
    return Math.round((0.5 + clamped) * 100) / 100;
}
/**
 * Computes deterministic endorsement weight breakdown (F-150).
 */
export function computeEndorsementWeight(params) {
    const endorserCredibility = normalizeEndorserCredibility(params.endorserReputationScore);
    const networkDistance = Math.max(1, Math.min(5, Math.floor(params.networkDistance)));
    const distanceFactor = calculateNetworkDistanceFactor(networkDistance);
    const specializationMultiplier = params.hasSpecializationInSkill ? 1.3 : 1.0;
    const trackRecordMultiplier = calculateTrackRecordMultiplier(params.endorserAccuracyScore);
    const isReciprocalDampened = Boolean(params.isReciprocalEndorsement);
    let raw = endorserCredibility * distanceFactor * specializationMultiplier * trackRecordMultiplier;
    if (isReciprocalDampened) {
        raw *= 0.5; // Reciprocal collusion dampener (BR-F150-02)
    }
    const finalWeight = Math.max(0.05, Math.min(2.0, Math.round(raw * 1000) / 1000));
    return {
        endorserCredibility,
        networkDistance,
        distanceFactor,
        specializationMultiplier,
        trackRecordMultiplier,
        isReciprocalDampened,
        finalWeight,
    };
}
/**
 * Validates invariants and creates a skill endorsement entity.
 */
export function createSkillEndorsement(params) {
    if (!params.recipientId || !params.endorserId) {
        throw new DomainError('VALIDATION_FAILED', 'Recipient ID and Endorser ID are required.');
    }
    if (params.recipientId === params.endorserId) {
        throw new DomainError('FORBIDDEN', 'Users cannot endorse their own skills.');
    }
    if (!params.skillId || params.skillId.trim().length === 0) {
        throw new DomainError('VALIDATION_FAILED', 'Skill ID is required.');
    }
    // Rate limiting to prevent endorsement farming (max 5 endorsements/week)
    const weeklyCount = params.recentEndorsementsCountThisWeek ?? 0;
    if (weeklyCount >= 5) {
        throw new DomainError('RATE_LIMIT_EXCEEDED', 'You have reached your weekly endorsement quota (maximum 5 endorsements per 7 days).');
    }
    const weight = computeEndorsementWeight({
        endorserReputationScore: params.endorserReputationScore,
        networkDistance: params.networkDistance,
        hasSpecializationInSkill: params.hasSpecializationInSkill,
        endorserAccuracyScore: params.endorserAccuracyScore,
        isReciprocalEndorsement: params.isReciprocalEndorsement,
    });
    const now = params.nowIso || new Date().toISOString();
    return {
        id: params.id || crypto.randomUUID(),
        recipientId: params.recipientId,
        endorserId: params.endorserId,
        skillId: params.skillId.trim(),
        notes: params.notes?.trim(),
        weight,
        status: 'active',
        createdAt: now,
    };
}
/**
 * Revokes a skill endorsement within the allowed 30-day window (SSOT F-110).
 */
export function revokeSkillEndorsement(endorsement, actorUserId, nowIso = new Date().toISOString()) {
    if (endorsement.endorserId !== actorUserId) {
        throw new DomainError('FORBIDDEN', 'Only the original endorser can revoke this endorsement.');
    }
    if (endorsement.status !== 'active') {
        throw new DomainError('CONFLICT', `Endorsement is already ${endorsement.status}.`);
    }
    const createdTime = new Date(endorsement.createdAt).getTime();
    const currentTime = new Date(nowIso).getTime();
    const elapsedDays = (currentTime - createdTime) / (1000 * 60 * 60 * 24);
    if (elapsedDays > 30) {
        throw new DomainError('VALIDATION_FAILED', 'Endorsements can only be revoked within 30 days of issuance.');
    }
    return {
        ...endorsement,
        status: 'revoked',
        revokedAt: nowIso,
    };
}
/**
 * Computes aggregated skill endorsement strength from active endorsements.
 */
export function aggregateSkillEndorsements(endorsements) {
    const active = endorsements.filter((e) => e.status === 'active');
    if (active.length === 0) {
        return {
            totalCount: 0,
            totalWeight: 0,
            averageWeight: 0,
            firstDegreeCount: 0,
            specialistCount: 0,
        };
    }
    const totalWeight = Math.round(active.reduce((acc, e) => acc + e.weight.finalWeight, 0) * 1000) / 1000;
    const firstDegreeCount = active.filter((e) => e.weight.networkDistance === 1).length;
    const specialistCount = active.filter((e) => e.weight.specializationMultiplier > 1.0).length;
    return {
        totalCount: active.length,
        totalWeight,
        averageWeight: Math.round((totalWeight / active.length) * 1000) / 1000,
        firstDegreeCount,
        specialistCount,
    };
}
//# sourceMappingURL=peer-credibility.js.map
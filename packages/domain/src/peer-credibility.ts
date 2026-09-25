/**
 * TalentSphere Peer Credibility Networks Domain Model (F-150, F-110, F-144)
 * Deterministic multi-factor endorsement weighting incorporating network distance,
 * endorser credibility, domain specialization, track record, and anti-collusion dampening.
 */

import crypto from 'node:crypto';
import { DomainError } from './index.js';

export interface EndorsementWeightBreakdown {
  endorserCredibility: number; // 0.10 to 1.00
  networkDistance: number; // 1 to 5
  distanceFactor: number; // 0.10 to 1.00
  specializationMultiplier: number; // 1.00 or 1.30
  trackRecordMultiplier: number; // 0.50 to 1.50
  isReciprocalDampened: boolean;
  finalWeight: number; // 0.050 to 2.000
}

export interface SkillEndorsement {
  id: string;
  recipientId: string;
  endorserId: string;
  skillId: string;
  notes?: string;
  weight: EndorsementWeightBreakdown;
  status: 'active' | 'revoked' | 'disputed';
  createdAt: string;
  revokedAt?: string;
}

export interface CalculateEndorsementWeightParams {
  endorserReputationScore?: number; // 0 to 100
  networkDistance: number; // 1 to 5 (1 = direct connection)
  hasSpecializationInSkill?: boolean; // verified credential or evidence
  endorserAccuracyScore?: number; // 0.0 to 1.0
  isReciprocalEndorsement?: boolean; // mutual endorsement detected
}

export interface CreateSkillEndorsementParams {
  id?: string;
  recipientId: string;
  endorserId: string;
  skillId: string;
  notes?: string;
  networkDistance: number;
  endorserReputationScore?: number;
  hasSpecializationInSkill?: boolean;
  endorserAccuracyScore?: number;
  isReciprocalEndorsement?: boolean;
  recentEndorsementsCountThisWeek?: number;
  nowIso?: string;
}

/**
 * Calculates deterministic network distance factor (BR-F150-01).
 * 1st-degree (direct connection): 1.00
 * 2nd-degree: 0.75
 * 3rd-degree: 0.50
 * 4th-degree: 0.25
 * 5th-degree / unlinked: 0.10
 */
export function calculateNetworkDistanceFactor(distance: number): number {
  if (distance <= 1) return 1.0;
  if (distance === 2) return 0.75;
  if (distance === 3) return 0.50;
  if (distance === 4) return 0.25;
  return 0.10;
}

/**
 * Normalizes endorser's reputation score to credibility factor (0.10 - 1.00).
 */
export function normalizeEndorserCredibility(reputationScore?: number): number {
  if (reputationScore === undefined || reputationScore === null) return 0.50;
  const clamped = Math.max(0, Math.min(100, reputationScore));
  return Math.max(0.10, Math.round((clamped / 100) * 100) / 100);
}

/**
 * Converts accuracy score to track record multiplier (0.50 - 1.50).
 */
export function calculateTrackRecordMultiplier(accuracyScore?: number): number {
  if (accuracyScore === undefined || accuracyScore === null) return 1.0;
  const clamped = Math.max(0.0, Math.min(1.0, accuracyScore));
  // Maps 0.0 -> 0.50, 0.5 -> 1.00, 1.0 -> 1.50
  return Math.round((0.5 + clamped) * 100) / 100;
}

/**
 * Computes deterministic endorsement weight breakdown (F-150).
 */
export function computeEndorsementWeight(
  params: CalculateEndorsementWeightParams
): EndorsementWeightBreakdown {
  const endorserCredibility = normalizeEndorserCredibility(params.endorserReputationScore);
  const networkDistance = Math.max(1, Math.min(5, Math.floor(params.networkDistance)));
  const distanceFactor = calculateNetworkDistanceFactor(networkDistance);
  const specializationMultiplier = params.hasSpecializationInSkill ? 1.30 : 1.0;
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
export function createSkillEndorsement(
  params: CreateSkillEndorsementParams
): SkillEndorsement {
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
    throw new DomainError(
      'RATE_LIMIT_EXCEEDED',
      'You have reached your weekly endorsement quota (maximum 5 endorsements per 7 days).'
    );
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
export function revokeSkillEndorsement(
  endorsement: SkillEndorsement,
  actorUserId: string,
  nowIso: string = new Date().toISOString()
): SkillEndorsement {
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
    throw new DomainError(
      'VALIDATION_FAILED',
      'Endorsements can only be revoked within 30 days of issuance.'
    );
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
export function aggregateSkillEndorsements(
  endorsements: SkillEndorsement[]
): {
  totalCount: number;
  totalWeight: number;
  averageWeight: number;
  firstDegreeCount: number;
  specialistCount: number;
} {
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

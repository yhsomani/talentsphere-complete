import crypto from 'node:crypto';
import { DomainError } from './index.js';

export type ReferralRequestStatus = 'pending' | 'approved' | 'forwarded' | 'declined' | 'expired';
export type ReferralOutcomeStatus = 'referred' | 'interviewing' | 'hired' | 'rejected';

export interface ReferralRequest {
  id: string;
  candidateId: string;
  referrerId: string;
  jobId: string;
  orgId: string;
  pitch: string;
  resumeId?: string;
  status: ReferralRequestStatus;
  declineReason?: string;
  forwardedToUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralOutcome {
  id: string;
  referralRequestId: string;
  candidateId: string;
  referrerId: string;
  jobId: string;
  orgId: string;
  status: ReferralOutcomeStatus;
  attributionExpiresAt: string;
  rewardXp: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralRequestParams {
  id?: string;
  candidateId: string;
  referrerId: string;
  jobId: string;
  orgId: string;
  pitch: string;
  resumeId?: string;
}

export interface RespondReferralRequestResult {
  request: ReferralRequest;
  outcome?: ReferralOutcome;
}

/**
 * Creates a referral request under network limits and employment verification (BR-233, BR-237, BR-238).
 */
export function createReferralRequest(
  params: CreateReferralRequestParams,
  recentRequests30DaysCount: number,
  isReferrerEmployedAtOrg: boolean,
  isBlocked: boolean = false
): ReferralRequest {
  if (params.candidateId === params.referrerId) {
    throw new DomainError('VALIDATION_FAILED', 'Cannot request a referral from yourself.');
  }

  // BR-233: Max 3 referral requests per 30 days per candidate
  if (recentRequests30DaysCount >= 3) {
    throw new DomainError(
      'RATE_LIMIT_EXCEEDED',
      'Max 3 referral requests per 30 days per candidate (BR-233).'
    );
  }

  // BR-237: System verifies referrer's employment
  if (!isReferrerEmployedAtOrg) {
    throw new DomainError(
      'FORBIDDEN',
      'System verifies referrer employment: referrer must be employed at target organization (BR-237).'
    );
  }

  // BR-238: No referral request from blocked user
  if (isBlocked) {
    throw new DomainError('FORBIDDEN', 'Cannot request referral from a blocked user (BR-238).');
  }

  if (!params.pitch || params.pitch.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Referral pitch is required.');
  }

  // Pitch <= 300 chars
  if (params.pitch.trim().length > 300) {
    throw new DomainError('VALIDATION_FAILED', 'Referral pitch must not exceed 300 characters.');
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    candidateId: params.candidateId,
    referrerId: params.referrerId,
    jobId: params.jobId,
    orgId: params.orgId,
    pitch: params.pitch.trim(),
    resumeId: params.resumeId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Responds to a referral request with mandatory referrer consent (BR-234, BR-236, BR-239, BR-240).
 */
export function respondToReferralRequest(
  request: ReferralRequest,
  actorUserId: string,
  action: 'refer' | 'forward' | 'decline',
  quarterlyReferralsCount: number,
  declineReason?: string,
  forwardedToUserId?: string,
  currentTime?: Date
): RespondReferralRequestResult {
  // BR-234: Referrer consent required per request
  if (request.referrerId !== actorUserId) {
    throw new DomainError(
      'FORBIDDEN',
      'Only the designated referrer can respond to this referral request (BR-234).'
    );
  }

  if (request.status !== 'pending') {
    throw new DomainError(
      'CONFLICT',
      `Cannot respond to referral request in '${request.status}' status.`
    );
  }

  const now = (currentTime || new Date()).toISOString();

  if (action === 'refer') {
    // BR-239: Referrer max 20 referrals/quarter
    if (quarterlyReferralsCount >= 20) {
      throw new DomainError(
        'RATE_LIMIT_EXCEEDED',
        'Referrer has reached the maximum of 20 referrals per quarter (BR-239).'
      );
    }

    const updatedRequest: ReferralRequest = {
      ...request,
      status: 'approved',
      updatedAt: now,
    };

    // BR-240: Referral attribution tracked 12 months
    const dateObj = currentTime || new Date();
    const expiry = new Date(dateObj);
    expiry.setFullYear(expiry.getFullYear() + 1);

    // BR-236: Referral rewards follow org policy; XP default 500
    const outcome: ReferralOutcome = {
      id: crypto.randomUUID(),
      referralRequestId: request.id,
      candidateId: request.candidateId,
      referrerId: request.referrerId,
      jobId: request.jobId,
      orgId: request.orgId,
      status: 'referred',
      attributionExpiresAt: expiry.toISOString(),
      rewardXp: 500,
      createdAt: now,
      updatedAt: now,
    };

    return { request: updatedRequest, outcome };
  } else if (action === 'forward') {
    if (!forwardedToUserId || forwardedToUserId.trim().length === 0) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'forwardedToUserId is required when forwarding a referral request.'
      );
    }

    const updatedRequest: ReferralRequest = {
      ...request,
      status: 'forwarded',
      forwardedToUserId,
      updatedAt: now,
    };

    return { request: updatedRequest };
  } else {
    const updatedRequest: ReferralRequest = {
      ...request,
      status: 'declined',
      declineReason: declineReason?.trim() || 'Declined by referrer',
      updatedAt: now,
    };

    return { request: updatedRequest };
  }
}

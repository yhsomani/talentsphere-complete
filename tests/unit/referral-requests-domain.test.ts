import { describe, it, expect } from 'vitest';
import {
  createReferralRequest,
  respondToReferralRequest,
  ReferralRequest,
} from '../../packages/domain/src/index.js';

describe('Domain: Referral Request System (F-142, S-11, BR-233..BR-240)', () => {
  const candidateId = '11111111-1111-1111-1111-111111111111';
  const referrerId = '22222222-2222-2222-2222-222222222222';
  const otherUserId = '33333333-3333-3333-3333-333333333333';
  const jobId = '44444444-4444-4444-4444-444444444444';
  const orgId = '55555555-5555-5555-5555-555555555555';

  describe('createReferralRequest', () => {
    it('creates a pending referral request with valid parameters', () => {
      const req = createReferralRequest(
        {
          candidateId,
          referrerId,
          jobId,
          orgId,
          pitch: 'I have 5 years experience with Node.js and distributed systems, would love a referral!',
        },
        1, // 1 prior request in 30 days
        true, // referrer is employed at org
        false // not blocked
      );

      expect(req.id).toBeDefined();
      expect(req.candidateId).toBe(candidateId);
      expect(req.referrerId).toBe(referrerId);
      expect(req.jobId).toBe(jobId);
      expect(req.orgId).toBe(orgId);
      expect(req.status).toBe('pending');
      expect(req.pitch).toBe('I have 5 years experience with Node.js and distributed systems, would love a referral!');
    });

    it('rejects self-referral requests', () => {
      expect(() =>
        createReferralRequest(
          {
            candidateId,
            referrerId: candidateId,
            jobId,
            orgId,
            pitch: 'Self referral',
          },
          0,
          true,
          false
        )
      ).toThrowError(/Cannot request a referral from yourself/);
    });

    it('enforces maximum 3 referral requests per 30 days per candidate (BR-233)', () => {
      expect(() =>
        createReferralRequest(
          {
            candidateId,
            referrerId,
            jobId,
            orgId,
            pitch: 'Great pitch',
          },
          3, // already at 3 requests in 30 days
          true,
          false
        )
      ).toThrowError(/Max 3 referral requests per 30 days per candidate/);
    });

    it('enforces employment verification for referrer (BR-237)', () => {
      expect(() =>
        createReferralRequest(
          {
            candidateId,
            referrerId,
            jobId,
            orgId,
            pitch: 'Great pitch',
          },
          0,
          false, // NOT employed at org
          false
        )
      ).toThrowError(/System verifies referrer employment/);
    });

    it('prevents referral requests involving blocked users (BR-238)', () => {
      expect(() =>
        createReferralRequest(
          {
            candidateId,
            referrerId,
            jobId,
            orgId,
            pitch: 'Great pitch',
          },
          0,
          true,
          true // blocked
        )
      ).toThrowError(/Cannot request referral from a blocked user/);
    });

    it('enforces pitch character limit of 300 characters', () => {
      const longPitch = 'x'.repeat(301);
      expect(() =>
        createReferralRequest(
          {
            candidateId,
            referrerId,
            jobId,
            orgId,
            pitch: longPitch,
          },
          0,
          true,
          false
        )
      ).toThrowError(/must not exceed 300 characters/);
    });
  });

  describe('respondToReferralRequest', () => {
    const pendingRequest: ReferralRequest = {
      id: '99999999-9999-9999-9999-999999999999',
      candidateId,
      referrerId,
      jobId,
      orgId,
      pitch: 'Check out my portfolio',
      status: 'pending',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    it('requires designated referrer consent to respond (BR-234)', () => {
      expect(() =>
        respondToReferralRequest(pendingRequest, candidateId, 'refer', 0)
      ).toThrowError(/Only the designated referrer can respond/);
    });

    it('approves referral, establishes 12-month attribution, and grants default XP (BR-234, BR-236, BR-240)', () => {
      const now = new Date('2026-09-01T12:00:00Z');
      const { request: approved, outcome } = respondToReferralRequest(
        pendingRequest,
        referrerId,
        'refer',
        5, // 5 quarterly referrals so far
        undefined,
        undefined,
        now
      );

      expect(approved.status).toBe('approved');
      expect(outcome).toBeDefined();
      expect(outcome!.status).toBe('referred');
      expect(outcome!.rewardXp).toBe(500); // BR-236 default XP
      expect(outcome!.candidateId).toBe(candidateId);
      expect(outcome!.referrerId).toBe(referrerId);
      expect(outcome!.jobId).toBe(jobId);
      expect(outcome!.orgId).toBe(orgId);

      // Verify 12-month attribution window (BR-240)
      const expectedExpiry = new Date('2027-09-01T12:00:00Z').toISOString();
      expect(outcome!.attributionExpiresAt).toBe(expectedExpiry);
    });

    it('enforces maximum 20 referrals per quarter for referrer (BR-239)', () => {
      expect(() =>
        respondToReferralRequest(
          pendingRequest,
          referrerId,
          'refer',
          20 // already at 20 referrals this quarter
        )
      ).toThrowError(/Referrer has reached the maximum of 20 referrals per quarter/);
    });

    it('allows forwarding referral request with new target user', () => {
      const { request: forwarded } = respondToReferralRequest(
        pendingRequest,
        referrerId,
        'forward',
        0,
        undefined,
        otherUserId
      );

      expect(forwarded.status).toBe('forwarded');
      expect(forwarded.forwardedToUserId).toBe(otherUserId);
    });

    it('allows declining referral request with reason', () => {
      const { request: declined } = respondToReferralRequest(
        pendingRequest,
        referrerId,
        'decline',
        0,
        'Position requires senior staff level'
      );

      expect(declined.status).toBe('declined');
      expect(declined.declineReason).toBe('Position requires senior staff level');
    });

    it('rejects responding to non-pending request', () => {
      const { request: approved } = respondToReferralRequest(
        pendingRequest,
        referrerId,
        'refer',
        0
      );

      expect(() =>
        respondToReferralRequest(approved, referrerId, 'decline', 0)
      ).toThrowError(/Cannot respond to referral request in 'approved' status/);
    });
  });
});

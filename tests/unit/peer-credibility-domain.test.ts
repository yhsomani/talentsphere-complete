import { describe, it, expect } from 'vitest';
import {
  calculateNetworkDistanceFactor,
  normalizeEndorserCredibility,
  calculateTrackRecordMultiplier,
  computeEndorsementWeight,
  createSkillEndorsement,
  revokeSkillEndorsement,
  aggregateSkillEndorsements,
  SkillEndorsement,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Peer Credibility Networks & Skill Endorsements Domain (F-150, F-110, F-144)', () => {
  describe('calculateNetworkDistanceFactor (BR-F150-01)', () => {
    it('scales weight strictly according to network graph distance', () => {
      expect(calculateNetworkDistanceFactor(1)).toBe(1.0); // 1st degree
      expect(calculateNetworkDistanceFactor(2)).toBe(0.75); // 2nd degree
      expect(calculateNetworkDistanceFactor(3)).toBe(0.5); // 3rd degree
      expect(calculateNetworkDistanceFactor(4)).toBe(0.25); // 4th degree
      expect(calculateNetworkDistanceFactor(5)).toBe(0.1); // 5th degree or distant
      expect(calculateNetworkDistanceFactor(8)).toBe(0.1);
    });
  });

  describe('normalizeEndorserCredibility', () => {
    it('normalizes reputation score to 0.10 - 1.00 credibility range', () => {
      expect(normalizeEndorserCredibility(90)).toBe(0.9);
      expect(normalizeEndorserCredibility(100)).toBe(1.0);
      expect(normalizeEndorserCredibility(0)).toBe(0.1);
      expect(normalizeEndorserCredibility(undefined)).toBe(0.5);
    });
  });

  describe('calculateTrackRecordMultiplier', () => {
    it('maps recommendation accuracy to multiplier range [0.50, 1.50]', () => {
      expect(calculateTrackRecordMultiplier(1.0)).toBe(1.5);
      expect(calculateTrackRecordMultiplier(0.5)).toBe(1.0);
      expect(calculateTrackRecordMultiplier(0.0)).toBe(0.5);
      expect(calculateTrackRecordMultiplier(undefined)).toBe(1.0);
    });
  });

  describe('computeEndorsementWeight', () => {
    it('computes deterministic multi-factor endorsement weight with specialization boost', () => {
      // Endorser rep: 80 (0.80), distance 1 (1.0), specialized (1.30), track record neutral (1.0)
      // 0.80 * 1.0 * 1.30 * 1.0 = 1.040
      const weight = computeEndorsementWeight({
        endorserReputationScore: 80,
        networkDistance: 1,
        hasSpecializationInSkill: true,
        endorserAccuracyScore: 0.5,
      });

      expect(weight.endorserCredibility).toBe(0.8);
      expect(weight.networkDistance).toBe(1);
      expect(weight.distanceFactor).toBe(1.0);
      expect(weight.specializationMultiplier).toBe(1.3);
      expect(weight.trackRecordMultiplier).toBe(1.0);
      expect(weight.isReciprocalDampened).toBe(false);
      expect(weight.finalWeight).toBe(1.04);
    });

    it('applies 0.5x reciprocal collusion dampener when mutual endorsement is detected', () => {
      const normal = computeEndorsementWeight({
        endorserReputationScore: 80,
        networkDistance: 1,
        hasSpecializationInSkill: false,
        isReciprocalEndorsement: false,
      });

      const reciprocal = computeEndorsementWeight({
        endorserReputationScore: 80,
        networkDistance: 1,
        hasSpecializationInSkill: false,
        isReciprocalEndorsement: true,
      });

      expect(reciprocal.isReciprocalDampened).toBe(true);
      expect(reciprocal.finalWeight).toBe(Math.round(normal.finalWeight * 0.5 * 1000) / 1000);
    });
  });

  describe('createSkillEndorsement', () => {
    it('prevents self-endorsement (BR-153)', () => {
      expect(() =>
        createSkillEndorsement({
          recipientId: 'user-123',
          endorserId: 'user-123',
          skillId: 'skill-ts',
          networkDistance: 1,
        })
      ).toThrowError(DomainError);
    });

    it('enforces weekly rate limit quota (max 5 endorsements/week)', () => {
      expect(() =>
        createSkillEndorsement({
          recipientId: 'user-123',
          endorserId: 'user-456',
          skillId: 'skill-ts',
          networkDistance: 1,
          recentEndorsementsCountThisWeek: 5,
        })
      ).toThrowError(DomainError);
    });

    it('creates endorsement entity with calculated weight', () => {
      const endorsement = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-456',
        skillId: 'skill-ts',
        notes: 'Exceptional TypeScript generics wizardry',
        networkDistance: 2,
        endorserReputationScore: 70,
        hasSpecializationInSkill: true,
      });

      expect(endorsement.id).toBeDefined();
      expect(endorsement.status).toBe('active');
      expect(endorsement.weight.networkDistance).toBe(2);
      expect(endorsement.weight.specializationMultiplier).toBe(1.3);
      expect(endorsement.weight.finalWeight).toBeGreaterThan(0.5);
    });
  });

  describe('revokeSkillEndorsement', () => {
    it('allows endorser to revoke within 30 days', () => {
      const endorsement = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-456',
        skillId: 'skill-ts',
        networkDistance: 1,
        nowIso: '2026-09-01T00:00:00.000Z',
      });

      const revoked = revokeSkillEndorsement(endorsement, 'user-456', '2026-09-20T00:00:00.000Z');
      expect(revoked.status).toBe('revoked');
      expect(revoked.revokedAt).toBe('2026-09-20T00:00:00.000Z');
    });

    it('forbids other users from revoking an endorsement', () => {
      const endorsement = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-456',
        skillId: 'skill-ts',
        networkDistance: 1,
      });

      expect(() => revokeSkillEndorsement(endorsement, 'intruder-999')).toThrowError(DomainError);
    });

    it('rejects revocation attempts after 30-day window has expired', () => {
      const endorsement = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-456',
        skillId: 'skill-ts',
        networkDistance: 1,
        nowIso: '2026-08-01T00:00:00.000Z',
      });

      expect(() =>
        revokeSkillEndorsement(endorsement, 'user-456', '2026-09-15T00:00:00.000Z')
      ).toThrowError(DomainError);
    });
  });

  describe('aggregateSkillEndorsements', () => {
    it('aggregates total count, composite weight, and specialist signals', () => {
      const e1 = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-1',
        skillId: 'skill-ts',
        networkDistance: 1,
        endorserReputationScore: 80,
        hasSpecializationInSkill: true,
      });
      const e2 = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-2',
        skillId: 'skill-ts',
        networkDistance: 2,
        endorserReputationScore: 60,
        hasSpecializationInSkill: false,
      });

      const agg = aggregateSkillEndorsements([e1, e2]);
      expect(agg.totalCount).toBe(2);
      expect(agg.totalWeight).toBeGreaterThan(1.0);
      expect(agg.firstDegreeCount).toBe(1);
      expect(agg.specialistCount).toBe(1);
    });

    it('excludes revoked endorsements from aggregate', () => {
      const e1 = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-1',
        skillId: 'skill-ts',
        networkDistance: 1,
      });
      const e2 = createSkillEndorsement({
        recipientId: 'user-123',
        endorserId: 'user-2',
        skillId: 'skill-ts',
        networkDistance: 1,
      });
      const e2Revoked = revokeSkillEndorsement(e2, 'user-2');

      const agg = aggregateSkillEndorsements([e1, e2Revoked]);
      expect(agg.totalCount).toBe(1);
    });
  });
});

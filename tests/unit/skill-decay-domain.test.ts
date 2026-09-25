import { describe, it, expect } from 'vitest';
import {
  getCategoryHalfLifeDays,
  calculateFreshnessScore,
  createSkillFreshnessRecord,
  reverifySkill,
} from '../../packages/domain/src/skill-decay.js';

describe('Domain: Skill Decay & Freshness Tracking (F-123, BR-225..BR-232)', () => {
  it('returns category-specific half-life days according to BR-226', () => {
    expect(getCategoryHalfLifeDays('fast_changing')).toBe(548); // 18 months
    expect(getCategoryHalfLifeDays('moderate')).toBe(1095); // 36 months
    expect(getCategoryHalfLifeDays('stable')).toBe(1825); // 60 months
    expect(getCategoryHalfLifeDays('foundational')).toBe(3650); // 120 months
  });

  it('calculates freshness score and bands accurately over exponential decay timeline (BR-225, BR-227)', () => {
    const baseDate = new Date('2026-01-01T00:00:00Z');

    // Day 0: Freshly verified -> 100, 'fresh', not demoted
    const day0 = calculateFreshnessScore(baseDate.toISOString(), 'fast_changing', baseDate);
    expect(day0.score).toBe(100);
    expect(day0.band).toBe('fresh');
    expect(day0.isDemoted).toBe(false);

    // Day 548 (1 half-life): ~50, 'aging'
    const day548 = new Date('2027-07-03T00:00:00Z');
    const midDecay = calculateFreshnessScore(baseDate.toISOString(), 'fast_changing', day548);
    expect(midDecay.score).toBe(50);
    expect(midDecay.band).toBe('aging');
    expect(midDecay.isDemoted).toBe(false);

    // Day 1096 (2 half-lives): ~25, 'stale'
    const day1096 = new Date('2029-01-01T00:00:00Z');
    const staleDecay = calculateFreshnessScore(baseDate.toISOString(), 'fast_changing', day1096);
    expect(staleDecay.score).toBe(25);
    expect(staleDecay.band).toBe('stale');
    expect(staleDecay.isDemoted).toBe(false);

    // Day 1644 (3 half-lives): ~13 (<20 -> expired, demotes to self-reported BR-227)
    const day1644 = new Date('2030-07-02T00:00:00Z');
    const expiredDecay = calculateFreshnessScore(baseDate.toISOString(), 'fast_changing', day1644);
    expect(expiredDecay.score).toBe(13);
    expect(expiredDecay.band).toBe('expired');
    expect(expiredDecay.isDemoted).toBe(true);
  });

  it('creates skill freshness record with initial computed state', () => {
    const record = createSkillFreshnessRecord({
      candidateId: 'cand_123',
      skillId: 'skill_react',
      category: 'fast_changing',
      verificationSource: 'challenge',
    });

    expect(record.id).toBeDefined();
    expect(record.candidateId).toBe('cand_123');
    expect(record.skillId).toBe('skill_react');
    expect(record.category).toBe('fast_changing');
    expect(record.freshnessScore).toBe(100);
    expect(record.freshnessBand).toBe('fresh');
    expect(record.isDemoted).toBe(false);
  });

  it('fully re-verifies a decayed skill and restores freshness to 100 (BR-228)', () => {
    const decayedRecord = createSkillFreshnessRecord({
      candidateId: 'cand_123',
      skillId: 'skill_kubernetes',
      category: 'moderate',
    });

    // Simulate decay to score 15 (expired & demoted)
    decayedRecord.freshnessScore = 15;
    decayedRecord.freshnessBand = 'expired';
    decayedRecord.isDemoted = true;

    // Re-verify via challenge completion (BR-228)
    const reverified = reverifySkill(decayedRecord, 'challenge');
    expect(reverified.freshnessScore).toBe(100);
    expect(reverified.freshnessBand).toBe('fresh');
    expect(reverified.isDemoted).toBe(false);
    expect(reverified.verificationSource).toBe('challenge');
  });

  it('applies 0.5x multiplier for self-attestation re-verification (BR-229)', () => {
    const decayedRecord = createSkillFreshnessRecord({
      candidateId: 'cand_123',
      skillId: 'skill_python',
      category: 'moderate',
    });

    // Stale score of 20
    decayedRecord.freshnessScore = 20;
    decayedRecord.freshnessBand = 'stale';

    // Self-attestation restores half of the missing 80 points -> 20 + 40 = 60 ('current')
    const attestationResult = reverifySkill(decayedRecord, 'self_attestation');
    expect(attestationResult.freshnessScore).toBe(60);
    expect(attestationResult.freshnessBand).toBe('current');
    expect(attestationResult.verificationSource).toBe('self_attestation');
    expect(attestationResult.isDemoted).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  AI_QUOTA_LIMITS,
  PLATFORM_PLANS,
  aiQuotaForEntitlements,
  aiTierForPlan,
  assertCanPublishAnotherJob,
  effectiveEntitlements,
  getPlanEntitlements,
  type PlanTier,
  type Subscription,
} from '../../packages/domain/src/index.js';

const sub = (planTier: PlanTier, status: Subscription['status']): Subscription => ({
  id: 's1',
  userId: 'u1',
  planTier,
  status,
  currentPeriodStart: '2026-01-01T00:00:00Z',
  currentPeriodEnd: '2026-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

describe('plan limits: one source of truth', () => {
  it('AI quota table is derived from entitlements, not a second list', () => {
    expect(AI_QUOTA_LIMITS.free).toEqual(aiQuotaForEntitlements(getPlanEntitlements('u', 'free')));
    expect(AI_QUOTA_LIMITS.pro).toEqual(
      aiQuotaForEntitlements(getPlanEntitlements('u', 'candidate_pro'))
    );
  });

  it('plan marketing copy states the same AI numbers the entitlements enforce', () => {
    for (const tier of ['free', 'candidate_pro'] as const) {
      const e = getPlanEntitlements('u', tier);
      const copy = PLATFORM_PLANS[tier].features.join(' ');
      expect(copy).toContain(`${e.aiDailyRequestsLimit} req/day`);
    }
  });

  it('maps every plan tier to a meter tier', () => {
    expect(aiTierForPlan('free')).toBe('free');
    expect(aiTierForPlan('recruiter_starter')).toBe('pro');
    expect(aiTierForPlan('recruiter_enterprise')).toBe('enterprise');
  });
});

describe('effectiveEntitlements follows verified subscription state', () => {
  it('is free without a subscription', () => {
    expect(effectiveEntitlements('u1', undefined).planTier).toBe('free');
  });
  it('grants the paid tier only while active or trialing', () => {
    expect(effectiveEntitlements('u1', sub('candidate_pro', 'active')).planTier).toBe(
      'candidate_pro'
    );
    expect(effectiveEntitlements('u1', sub('candidate_pro', 'trialing')).planTier).toBe(
      'candidate_pro'
    );
  });
  it.each(['past_due', 'canceled', 'incomplete'] as const)('falls back to free when %s', (s) => {
    expect(effectiveEntitlements('u1', sub('recruiter_starter', s)).planTier).toBe('free');
  });
});

describe('active job posting limit', () => {
  it('blocks the 6th published job on Recruiter Starter with PAYMENT_REQUIRED', () => {
    const e = getPlanEntitlements('u', 'recruiter_starter');
    expect(() => assertCanPublishAnotherJob(e, 4)).not.toThrow();
    expect(() => assertCanPublishAnotherJob(e, 5)).toThrowError(
      expect.objectContaining({ code: 'PAYMENT_REQUIRED' })
    );
  });
  it('does not limit non-recruiter tiers (no free-recruiter policy yet)', () => {
    expect(() => assertCanPublishAnotherJob(getPlanEntitlements('u', 'free'), 99)).not.toThrow();
    expect(() =>
      assertCanPublishAnotherJob(getPlanEntitlements('u', 'candidate_pro'), 99)
    ).not.toThrow();
  });
  it('enterprise allows far more than starter', () => {
    expect(() =>
      assertCanPublishAnotherJob(getPlanEntitlements('u', 'recruiter_enterprise'), 100)
    ).not.toThrow();
  });
});

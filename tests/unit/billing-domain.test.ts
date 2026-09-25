import { describe, it, expect } from 'vitest';
import {
  PLATFORM_PLANS,
  getPlanEntitlements,
  createSubscription,
  cancelSubscription,
  renewSubscription,
  validateMonetizationIntegrity,
} from '../../packages/domain/src/index.js';

describe('Billing, Subscriptions & Monetization Domain (F-16, Section 64, WF-16, WIT-016)', () => {
  const userId = '00000000-0000-0000-0000-000000000001';

  describe('PLATFORM_PLANS & Integer Minor Units (Section 19)', () => {
    it('defines canonical plans with strict integer minor units (USD cents)', () => {
      expect(PLATFORM_PLANS.free.priceMonthlyCents).toBe(0);
      expect(PLATFORM_PLANS.free.currency).toBe('USD');

      expect(PLATFORM_PLANS.candidate_pro.priceMonthlyCents).toBe(1999); // $19.99
      expect(PLATFORM_PLANS.candidate_pro.priceYearlyCents).toBe(19990); // $199.90

      expect(PLATFORM_PLANS.recruiter_starter.priceMonthlyCents).toBe(9900); // $99.00
      expect(PLATFORM_PLANS.recruiter_enterprise.priceMonthlyCents).toBe(29900); // $299.00
    });
  });

  describe('getPlanEntitlements', () => {
    it('derives baseline entitlements for free tier', () => {
      const entitlements = getPlanEntitlements(userId, 'free');
      expect(entitlements.userId).toBe(userId);
      expect(entitlements.planTier).toBe('free');
      expect(entitlements.aiDailyRequestsLimit).toBe(5);
      expect(entitlements.aiDailyTokensLimit).toBe(5000);
      expect(entitlements.activeJobsLimit).toBe(0);
      expect(entitlements.hasAdvancedAnalytics).toBe(false);
      expect(entitlements.canExportCredentials).toBe(true);
    });

    it('derives upgraded entitlements for candidate_pro tier', () => {
      const entitlements = getPlanEntitlements(userId, 'candidate_pro');
      expect(entitlements.planTier).toBe('candidate_pro');
      expect(entitlements.aiDailyRequestsLimit).toBe(50);
      expect(entitlements.aiDailyTokensLimit).toBe(100000);
      expect(entitlements.hasAdvancedAnalytics).toBe(true);
    });

    it('derives high-capacity job posting entitlements for recruiter tiers', () => {
      const starter = getPlanEntitlements(userId, 'recruiter_starter');
      expect(starter.activeJobsLimit).toBe(5);

      const enterprise = getPlanEntitlements(userId, 'recruiter_enterprise');
      expect(enterprise.activeJobsLimit).toBe(1000);
      expect(enterprise.aiDailyRequestsLimit).toBe(200);
    });
  });

  describe('createSubscription & Invoices', () => {
    it('creates active subscription and initial paid invoice for monthly pro plan', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const result = createSubscription({
        userId,
        planTier: 'candidate_pro',
        billingCycle: 'monthly',
        idempotencyKey: 'idem_sub_123',
        nowIso,
      });

      expect(result.subscription.userId).toBe(userId);
      expect(result.subscription.planTier).toBe('candidate_pro');
      expect(result.subscription.status).toBe('active');
      expect(result.subscription.currentPeriodStart).toBe(nowIso);

      const expectedEnd = new Date(
        new Date(nowIso).getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(result.subscription.currentPeriodEnd).toBe(expectedEnd);

      expect(result.invoice.amountCents).toBe(1999);
      expect(result.invoice.currency).toBe('USD');
      expect(result.invoice.status).toBe('paid');
      expect(result.invoice.idempotencyKey).toBe('idem_sub_123');

      expect(result.entitlements.aiDailyRequestsLimit).toBe(50);
    });

    it('handles yearly billing cycle with 365-day period and discounted price', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const result = createSubscription({
        userId,
        planTier: 'recruiter_starter',
        billingCycle: 'yearly',
        nowIso,
      });

      expect(result.invoice.amountCents).toBe(99000);
      const expectedEnd = new Date(
        new Date(nowIso).getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(result.subscription.currentPeriodEnd).toBe(expectedEnd);
    });
  });

  describe('cancelSubscription', () => {
    it('marks cancelAtPeriodEnd without immediately canceling active access', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const { subscription } = createSubscription({
        userId,
        planTier: 'candidate_pro',
        nowIso,
      });

      const cancelled = cancelSubscription(subscription, false, nowIso);
      expect(cancelled.cancelAtPeriodEnd).toBe(true);
      expect(cancelled.status).toBe('active');
      expect(cancelled.canceledAt).toBe(nowIso);
    });

    it('immediately cancels subscription when requested', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const { subscription } = createSubscription({
        userId,
        planTier: 'candidate_pro',
        nowIso,
      });

      const cancelled = cancelSubscription(subscription, true, nowIso);
      expect(cancelled.status).toBe('canceled');
      expect(cancelled.cancelAtPeriodEnd).toBe(false);

      expect(() => {
        cancelSubscription(cancelled, true, nowIso);
      }).toThrowError(/already canceled/);
    });
  });

  describe('renewSubscription', () => {
    it('extends subscription period by specified cycle duration', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const { subscription } = createSubscription({
        userId,
        planTier: 'candidate_pro',
        nowIso,
      });

      const renewed = renewSubscription(subscription, 30, nowIso);
      expect(renewed.status).toBe('active');
      expect(renewed.currentPeriodStart).toBe(subscription.currentPeriodEnd);

      const expectedEnd = new Date(
        new Date(subscription.currentPeriodEnd).getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(renewed.currentPeriodEnd).toBe(expectedEnd);
    });

    it('prohibits renewing a canceled subscription', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const { subscription } = createSubscription({
        userId,
        planTier: 'candidate_pro',
        nowIso,
      });
      const canceled = cancelSubscription(subscription, true, nowIso);

      expect(() => {
        renewSubscription(canceled, 30, nowIso);
      }).toThrowError(/Cannot renew a subscription that has already been canceled/);
    });
  });

  describe('validateMonetizationIntegrity (Section 64 Monetization Invariants)', () => {
    it('blocks attempting to buy hiring rank, assessment bypass, or fake credentials', () => {
      expect(() => {
        validateMonetizationIntegrity('recruiter_enterprise', 'inflate_hiring_rank');
      }).toThrowError(/Section 64 Monetization Invariant/);

      expect(() => {
        validateMonetizationIntegrity('candidate_pro', 'bypass_assessment_proctoring');
      }).toThrowError(/Section 64 Monetization Invariant/);

      expect(() => {
        validateMonetizationIntegrity('candidate_pro', 'fabricate_credentials');
      }).toThrowError(/Section 64 Monetization Invariant/);
    });

    it('permits valid product interactions', () => {
      expect(() => {
        validateMonetizationIntegrity('candidate_pro', 'generate_resume_variation');
      }).not.toThrow();
    });
  });
});

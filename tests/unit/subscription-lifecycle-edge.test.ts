import { describe, it, expect } from 'vitest';
import {
  createSubscription,
  cancelSubscription,
  settleSubscription,
  renewSubscription,
  effectiveEntitlements,
  DomainError,
  type Subscription,
} from '../../packages/domain/src/index.js';

const userId = '00000000-0000-0000-0000-000000000042';
const DAY_MS = 24 * 60 * 60 * 1000;
const START = '2026-10-01T00:00:00.000Z';

function errorOf(fn: () => unknown): DomainError {
  try {
    fn();
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('expected function to throw');
}

function paidSubscription(
  planTier: 'candidate_pro' | 'recruiter_starter' | 'recruiter_enterprise' = 'candidate_pro',
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): Subscription {
  return createSubscription({
    userId,
    planTier,
    billingCycle,
    nowIso: START,
    allowSimulatedPayment: true,
  }).subscription;
}

describe('Subscription lifecycle edge cases (pure domain)', () => {
  describe('settleSubscription', () => {
    it('turns a scheduled cancellation into canceled once the period has ended, keeping the original canceledAt', () => {
      const sub = paidSubscription();
      const scheduledAt = '2026-10-05T00:00:00.000Z';
      const scheduled = cancelSubscription(sub, false, scheduledAt);
      const afterEnd = new Date(new Date(sub.currentPeriodEnd).getTime() + DAY_MS).toISOString();

      const settled = settleSubscription(scheduled, afterEnd);

      expect(settled).not.toBe(scheduled);
      expect(settled.status).toBe('canceled');
      expect(settled.cancelAtPeriodEnd).toBe(false);
      expect(settled.canceledAt).toBe(scheduledAt);
      expect(settled.updatedAt).toBe(afterEnd);
    });

    it('leaves a scheduled cancellation active while the period has not yet ended', () => {
      const sub = paidSubscription();
      const scheduled = cancelSubscription(sub, false, '2026-10-05T00:00:00.000Z');
      const midPeriod = '2026-10-15T00:00:00.000Z';

      const result = settleSubscription(scheduled, midPeriod);

      expect(result).toBe(scheduled);
      expect(result.status).toBe('active');
      expect(result.cancelAtPeriodEnd).toBe(true);
    });

    it('treats the exact period end instant as ended', () => {
      const sub = paidSubscription();
      const scheduled = cancelSubscription(sub, false, '2026-10-05T00:00:00.000Z');

      const settled = settleSubscription(scheduled, sub.currentPeriodEnd);

      expect(settled.status).toBe('canceled');
    });

    it('leaves an already canceled subscription unchanged, returning the same reference', () => {
      const sub = paidSubscription();
      const canceled = cancelSubscription(sub, true, '2026-10-05T00:00:00.000Z');

      expect(settleSubscription(canceled, '2030-01-01T00:00:00.000Z')).toBe(canceled);
    });

    it('returns the same reference for an active subscription with no scheduled cancellation', () => {
      const sub = paidSubscription();

      expect(settleSubscription(sub, '2030-01-01T00:00:00.000Z')).toBe(sub);
    });
  });

  describe('cancelSubscription', () => {
    it('cancels immediately, clearing the period-end flag', () => {
      const sub = paidSubscription();
      const now = '2026-10-05T00:00:00.000Z';

      const canceled = cancelSubscription(sub, true, now);

      expect(canceled.status).toBe('canceled');
      expect(canceled.cancelAtPeriodEnd).toBe(false);
      expect(canceled.canceledAt).toBe(now);
    });

    it('schedules cancellation at period end without changing status', () => {
      const sub = paidSubscription();
      const now = '2026-10-05T00:00:00.000Z';

      const scheduled = cancelSubscription(sub, false, now);

      expect(scheduled.status).toBe('active');
      expect(scheduled.cancelAtPeriodEnd).toBe(true);
      expect(scheduled.canceledAt).toBe(now);
      expect(scheduled.currentPeriodEnd).toBe(sub.currentPeriodEnd);
    });

    it('keeps the first canceledAt when a second period-end cancel is requested', () => {
      const sub = paidSubscription();
      const first = cancelSubscription(sub, false, '2026-10-05T00:00:00.000Z');

      const second = cancelSubscription(first, false, '2026-10-20T00:00:00.000Z');

      expect(second.canceledAt).toBe('2026-10-05T00:00:00.000Z');
      expect(second.cancelAtPeriodEnd).toBe(true);
      expect(second).toBe(first);
    });

    it('throws INVALID_STATE_TRANSITION when canceling an already-canceled subscription', () => {
      const sub = paidSubscription();
      const canceled = cancelSubscription(sub, true, '2026-10-05T00:00:00.000Z');

      let caught: unknown;
      try {
        cancelSubscription(canceled, true, '2026-10-06T00:00:00.000Z');
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(DomainError);
      expect((caught as DomainError).code).toBe('INVALID_STATE_TRANSITION');
    });

    it('throws INVALID_STATE_TRANSITION when a period-end cancel is requested on a canceled subscription', () => {
      const sub = paidSubscription();
      const canceled = cancelSubscription(sub, true, '2026-10-05T00:00:00.000Z');

      const error = errorOf(() => cancelSubscription(canceled, false, '2026-10-06T00:00:00.000Z'));
      expect(error).toBeInstanceOf(DomainError);
      expect(error.code).toBe('INVALID_STATE_TRANSITION');
    });
  });

  describe('effectiveEntitlements after settlement', () => {
    it('yields free entitlements once an expired scheduled cancellation of candidate_pro is settled', () => {
      const sub = paidSubscription('candidate_pro');
      const scheduled = cancelSubscription(sub, false, '2026-10-05T00:00:00.000Z');
      const afterEnd = new Date(new Date(sub.currentPeriodEnd).getTime() + DAY_MS).toISOString();

      // Before settlement the stored status is still active, so paid access persists.
      expect(effectiveEntitlements(userId, scheduled, afterEnd).planTier).toBe('candidate_pro');

      const settled = settleSubscription(scheduled, afterEnd);
      const entitlements = effectiveEntitlements(userId, settled, afterEnd);

      expect(entitlements.planTier).toBe('free');
      expect(entitlements.aiDailyRequestsLimit).toBe(5);
      expect(entitlements.aiDailyTokensLimit).toBe(5000);
      expect(entitlements.hasAdvancedAnalytics).toBe(false);
    });

    it('keeps candidate_pro entitlements while a scheduled cancellation has not yet taken effect', () => {
      const sub = paidSubscription('candidate_pro');
      const scheduled = cancelSubscription(sub, false, '2026-10-05T00:00:00.000Z');
      const midPeriod = '2026-10-15T00:00:00.000Z';

      const entitlements = effectiveEntitlements(
        userId,
        settleSubscription(scheduled, midPeriod),
        midPeriod
      );

      expect(entitlements.planTier).toBe('candidate_pro');
      expect(entitlements.aiDailyRequestsLimit).toBe(50);
    });
  });

  describe('createSubscription guards and cycle length', () => {
    it('refuses a paid tier without allowSimulatedPayment with code PAYMENT_REQUIRED', () => {
      let caught: unknown;
      try {
        createSubscription({ userId, planTier: 'candidate_pro', nowIso: START });
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(DomainError);
      expect((caught as DomainError).code).toBe('PAYMENT_REQUIRED');
    });

    it('refuses a recruiter tier explicitly passed allowSimulatedPayment: false', () => {
      const error = errorOf(() =>
        createSubscription({
          userId,
          planTier: 'recruiter_starter',
          nowIso: START,
          allowSimulatedPayment: false,
        })
      );
      expect(error).toBeInstanceOf(DomainError);
      expect(error.code).toBe('PAYMENT_REQUIRED');
    });

    it('allows the free tier without payment evidence and creates a zero-cost invoice', () => {
      const result = createSubscription({ userId, planTier: 'free', nowIso: START });

      expect(result.subscription.planTier).toBe('free');
      expect(result.invoice.amountCents).toBe(0);
    });

    it('sets a yearly cycle period to exactly 365 days', () => {
      const { subscription } = createSubscription({
        userId,
        planTier: 'candidate_pro',
        billingCycle: 'yearly',
        nowIso: START,
        allowSimulatedPayment: true,
      });

      const lengthMs =
        new Date(subscription.currentPeriodEnd).getTime() -
        new Date(subscription.currentPeriodStart).getTime();

      expect(lengthMs).toBe(365 * DAY_MS);
    });

    it('sets a monthly cycle period to 30 days', () => {
      const sub = paidSubscription('candidate_pro', 'monthly');

      const lengthMs =
        new Date(sub.currentPeriodEnd).getTime() - new Date(sub.currentPeriodStart).getTime();

      expect(lengthMs).toBe(30 * DAY_MS);
    });
  });

  describe('renewSubscription', () => {
    it('refuses to renew a canceled subscription with INVALID_STATE_TRANSITION', () => {
      const sub = paidSubscription();
      const canceled = cancelSubscription(sub, true, '2026-10-05T00:00:00.000Z');

      let caught: unknown;
      try {
        renewSubscription(canceled, 30, '2026-10-06T00:00:00.000Z');
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(DomainError);
      expect((caught as DomainError).code).toBe('INVALID_STATE_TRANSITION');
    });

    it('refuses to renew a subscription that was settled into canceled', () => {
      const sub = paidSubscription();
      const scheduled = cancelSubscription(sub, false, '2026-10-05T00:00:00.000Z');
      const afterEnd = new Date(new Date(sub.currentPeriodEnd).getTime() + DAY_MS).toISOString();
      const settled = settleSubscription(scheduled, afterEnd);

      const error = errorOf(() => renewSubscription(settled, 30, afterEnd));
      expect(error).toBeInstanceOf(DomainError);
      expect(error.code).toBe('INVALID_STATE_TRANSITION');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  buildPriceCatalog,
  entitledTier,
  invoiceFromStripe,
  mapStripeStatus,
  reconcileStripeSubscription,
  type StripeInvoiceSnapshot,
  type StripeSubscriptionSnapshot,
  type StripeSubscriptionStatus,
  type Subscription,
} from '../../packages/domain/src/index.js';

const userId = '00000000-0000-0000-0000-000000000001';
const NOW = '2026-10-23T12:00:00.000Z';
const t = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

const catalog = buildPriceCatalog({
  'candidate_pro:monthly': 'price_pro_m',
  'candidate_pro:yearly': 'price_pro_y',
  'recruiter_starter:monthly': 'price_starter_m',
});

const snapshot = (over: Partial<StripeSubscriptionSnapshot> = {}): StripeSubscriptionSnapshot => ({
  id: 'sub_1',
  customerId: 'cus_1',
  status: 'active',
  priceId: 'price_pro_m',
  cancelAtPeriodEnd: false,
  canceledAt: null,
  currentPeriodStart: t('2026-10-23T00:00:00Z'),
  currentPeriodEnd: t('2026-11-22T00:00:00Z'),
  eventCreated: t('2026-10-23T11:00:00Z'),
  ...over,
});

describe('buildPriceCatalog', () => {
  it('maps plan and cycle to a price id and back', () => {
    expect(catalog.priceIdFor('candidate_pro', 'yearly')).toBe('price_pro_y');
    expect(catalog.planForPrice('price_starter_m')).toEqual({
      tier: 'recruiter_starter',
      cycle: 'monthly',
    });
  });

  it('knows nothing about unconfigured plans or foreign prices', () => {
    expect(catalog.priceIdFor('recruiter_enterprise', 'monthly')).toBeUndefined();
    expect(catalog.planForPrice('price_someone_elses')).toBeUndefined();
    expect(catalog.planForPrice(undefined)).toBeUndefined();
  });

  it('never sells the free tier', () => {
    const c = buildPriceCatalog({ 'free:monthly': 'price_free' } as never);
    expect(c.planForPrice('price_free')).toBeUndefined();
  });
});

describe('mapStripeStatus and entitledTier', () => {
  const cases: Array<[StripeSubscriptionStatus, string, boolean]> = [
    ['active', 'active', true],
    ['trialing', 'trialing', true],
    ['past_due', 'past_due', false],
    ['unpaid', 'past_due', false],
    ['paused', 'past_due', false],
    ['incomplete', 'incomplete', false],
    ['incomplete_expired', 'canceled', false],
    ['canceled', 'canceled', false],
  ];

  it.each(cases)('%s -> %s (paid access: %s)', (stripe, status, paid) => {
    expect(mapStripeStatus(stripe)).toBe(status);
    expect(entitledTier(mapStripeStatus(stripe), 'candidate_pro')).toBe(
      paid ? 'candidate_pro' : 'free'
    );
  });

  it('treats a status it has never heard of as incomplete, never as active', () => {
    expect(mapStripeStatus('something_new' as StripeSubscriptionStatus)).toBe('incomplete');
  });
});

describe('reconcileStripeSubscription', () => {
  it('grants the paid tier and entitlements for an active subscription at a known price', () => {
    const r = reconcileStripeSubscription({ userId, snapshot: snapshot(), catalog, nowIso: NOW });
    expect(r.stale).toBe(false);
    expect(r.subscription).toMatchObject({
      userId,
      planTier: 'candidate_pro',
      status: 'active',
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: 'sub_1',
      stripePriceId: 'price_pro_m',
      currentPeriodEnd: '2026-11-22T00:00:00.000Z',
    });
    expect(r.entitlements.planTier).toBe('candidate_pro');
    expect(r.entitlements.aiDailyRequestsLimit).toBe(50);
  });

  it('keeps access but flags the pending cancellation until the period ends', () => {
    const r = reconcileStripeSubscription({
      userId,
      snapshot: snapshot({ cancelAtPeriodEnd: true, canceledAt: t('2026-10-23T11:30:00Z') }),
      catalog,
      nowIso: NOW,
    });
    expect(r.subscription.cancelAtPeriodEnd).toBe(true);
    expect(r.subscription.canceledAt).toBe('2026-10-23T11:30:00.000Z');
    expect(r.entitlements.planTier).toBe('candidate_pro');
  });

  it('withdraws paid access on a failed payment (past_due) without losing the plan record', () => {
    const r = reconcileStripeSubscription({
      userId,
      snapshot: snapshot({ status: 'past_due' }),
      catalog,
      nowIso: NOW,
    });
    expect(r.subscription.status).toBe('past_due');
    expect(r.subscription.planTier).toBe('candidate_pro');
    expect(r.entitlements.planTier).toBe('free');
  });

  it('ends the subscription on deletion and clears the pending-cancel flag', () => {
    const r = reconcileStripeSubscription({
      userId,
      snapshot: snapshot({
        status: 'canceled',
        cancelAtPeriodEnd: true,
        canceledAt: t('2026-10-23T11:59:00Z'),
      }),
      catalog,
      nowIso: NOW,
    });
    expect(r.subscription.status).toBe('canceled');
    expect(r.subscription.cancelAtPeriodEnd).toBe(false);
    expect(r.entitlements.planTier).toBe('free');
  });

  it('never grants a paid tier for a price that is not in the catalog', () => {
    const r = reconcileStripeSubscription({
      userId,
      snapshot: snapshot({ priceId: 'price_not_ours' }),
      catalog,
      nowIso: NOW,
    });
    expect(r.subscription.planTier).toBe('free');
    expect(r.entitlements.planTier).toBe('free');
  });

  it('ignores an event older than the newest one already applied (out-of-order delivery)', () => {
    const newest = reconcileStripeSubscription({
      userId,
      snapshot: snapshot({ status: 'past_due', eventCreated: t('2026-10-23T11:00:00Z') }),
      catalog,
      nowIso: NOW,
    }).subscription;

    const late = reconcileStripeSubscription({
      userId,
      snapshot: snapshot({ status: 'active', eventCreated: t('2026-10-23T10:00:00Z') }),
      catalog,
      existing: newest,
      nowIso: NOW,
    });
    expect(late.stale).toBe(true);
    expect(late.subscription).toBe(newest);
    expect(late.entitlements.planTier).toBe('free'); // still past_due
  });

  it('applies an event at the same instant (idempotent) and keeps the row identity', () => {
    const first = reconcileStripeSubscription({
      userId,
      snapshot: snapshot(),
      catalog,
      nowIso: NOW,
    }).subscription;
    const again = reconcileStripeSubscription({
      userId,
      snapshot: snapshot(),
      catalog,
      existing: first,
      nowIso: '2026-10-23T12:05:00.000Z',
    });
    expect(again.stale).toBe(false);
    expect(again.subscription.id).toBe(first.id);
    expect(again.subscription.createdAt).toBe(first.createdAt);
  });

  it('keeps the recorded tier when an unknown price arrives for an existing subscription', () => {
    const existing: Subscription = reconcileStripeSubscription({
      userId,
      snapshot: snapshot(),
      catalog,
      nowIso: NOW,
    }).subscription;
    const r = reconcileStripeSubscription({
      userId,
      snapshot: snapshot({ priceId: 'price_not_ours', eventCreated: t('2026-10-23T11:30:00Z') }),
      catalog,
      existing,
      nowIso: NOW,
    });
    expect(r.subscription.planTier).toBe('candidate_pro');
    expect(r.entitlements.planTier).toBe('free'); // unrecognised price grants nothing
  });
});

describe('invoiceFromStripe', () => {
  const paid: StripeInvoiceSnapshot = {
    id: 'in_1',
    customerId: 'cus_1',
    subscriptionId: 'sub_1',
    status: 'paid',
    amountPaid: 1999,
    amountDue: 1999,
    currency: 'usd',
    hostedInvoiceUrl: 'https://invoice.stripe.com/i/1',
    paidAt: t('2026-10-23T11:00:00Z'),
  };

  it('keeps integer minor units and upper-cases the currency', () => {
    const invoice = invoiceFromStripe({ userId, snapshot: paid, nowIso: NOW });
    expect(invoice).toMatchObject({
      userId,
      amountCents: 1999,
      currency: 'USD',
      status: 'paid',
      paidAt: '2026-10-23T11:00:00.000Z',
      stripeInvoiceId: 'in_1',
      hostedInvoiceUrl: 'https://invoice.stripe.com/i/1',
    });
    expect(Number.isInteger(invoice.amountCents)).toBe(true);
  });

  it('records an unpaid invoice at its amount due with no paid timestamp', () => {
    const invoice = invoiceFromStripe({
      userId,
      snapshot: { ...paid, status: 'open', amountPaid: 0, paidAt: undefined },
      nowIso: NOW,
    });
    expect(invoice.status).toBe('open');
    expect(invoice.amountCents).toBe(1999);
    expect(invoice.paidAt).toBeUndefined();
  });

  it('links the subscription only when given one', () => {
    expect(
      invoiceFromStripe({ userId, snapshot: paid, nowIso: NOW }).subscriptionId
    ).toBeUndefined();
    expect(
      invoiceFromStripe({ userId, snapshot: paid, subscriptionId: 'local-sub', nowIso: NOW })
        .subscriptionId
    ).toBe('local-sub');
  });
});

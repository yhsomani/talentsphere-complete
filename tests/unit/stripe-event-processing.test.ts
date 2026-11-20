import { describe, expect, it, vi } from 'vitest';
import { processStripeEvent, type StripeBillingDeps } from '../../apps/api/src/billing-stripe.js';
import { MemoryBillingStore } from '../../apps/api/src/storage/billing-store.js';
import type {
  NormalizedStripeEvent,
  StripeGateway,
  StripeSubscriptionSnapshot,
} from '../../apps/api/src/stripe-gateway.js';
import { buildPriceCatalog } from '../../packages/domain/src/stripe-billing.js';

// C-21 (b) and (d), at the event-processing layer: subscription events apply
// Stripe's current state, and a second live subscription is logged at error
// level with both ids (what to do about it is an owner policy decision).
const PRICE = 'price_pro_m';
const now = Math.floor(Date.now() / 1000);
const snap = (id: string, status: StripeSubscriptionSnapshot['status'], created = now) =>
  ({
    id,
    customerId: 'cus_1',
    status,
    priceId: PRICE,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    currentPeriodStart: now - 60,
    currentPeriodEnd: now + 30 * 86400,
    eventCreated: created,
  }) satisfies StripeSubscriptionSnapshot;
const subEvent = (id: string, snapshot: StripeSubscriptionSnapshot): NormalizedStripeEvent => ({
  kind: 'subscription',
  id,
  type: 'customer.subscription.updated',
  created: snapshot.eventCreated,
  snapshot,
});

function setup() {
  const stripeNow = new Map<string, StripeSubscriptionSnapshot>();
  const retrieveSubscription = vi.fn(async (id: string, eventCreated: number) => {
    const current = stripeNow.get(id);
    if (!current) throw new Error('provider down');
    return { ...current, eventCreated };
  });
  const log = { warn: vi.fn(), error: vi.fn() };
  const billing = new MemoryBillingStore();
  const deps: StripeBillingDeps = {
    appUrl: 'http://localhost:5173',
    storage: { billing },
    gateway: { retrieveSubscription } as unknown as StripeGateway,
    catalog: buildPriceCatalog({ 'candidate_pro:monthly': PRICE }),
    extractUser: () => {
      throw new Error('not used');
    },
    getAccountEmail: (userId) => (userId === 'user_1' ? 'u@example.com' : undefined),
    dispatchJob: async () => undefined,
    log,
  };
  const link = () =>
    processStripeEvent(deps, {
      kind: 'checkout.completed',
      id: 'evt_link',
      type: 'checkout.session.completed',
      created: now,
      customerId: 'cus_1',
      subscriptionId: 'sub_a',
      userId: 'user_1',
    });
  return { deps, billing, stripeNow, retrieveSubscription, log, link };
}

describe('Stripe subscription events apply the current Stripe state (C-21 b)', () => {
  it('a same-second older event delivered last does not undo the newer state', async () => {
    const { deps, billing, stripeNow, link } = setup();
    await link();
    stripeNow.set('sub_a', snap('sub_a', 'active'));
    // Stripe created "created(incomplete)" then "updated(active)" in the same
    // second, and delivers them in the opposite order.
    await processStripeEvent(deps, subEvent('evt_updated', snap('sub_a', 'active')));
    await processStripeEvent(deps, subEvent('evt_created', snap('sub_a', 'incomplete')));
    expect((await billing.getSubscription('user_1'))?.status).toBe('active');
    expect((await billing.getEntitlements('user_1'))?.planTier).toBe('candidate_pro');
  });

  it('a provider failure refuses the event (503) and records nothing, so Stripe retries', async () => {
    const { deps, billing, link } = setup();
    await link();
    await expect(
      processStripeEvent(deps, subEvent('evt_x', snap('sub_a', 'active')))
    ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    expect(await billing.getSubscription('user_1')).toBeUndefined();
  });
});

describe('A second live subscription is logged for an operator (C-21 d)', () => {
  it('logs at error with both subscription ids and does not apply it', async () => {
    const { deps, billing, stripeNow, log, link } = setup();
    await link();
    stripeNow.set('sub_a', snap('sub_a', 'active'));
    await processStripeEvent(deps, subEvent('evt_a', snap('sub_a', 'active')));
    stripeNow.set('sub_b', snap('sub_b', 'active'));
    await processStripeEvent(deps, subEvent('evt_b', snap('sub_b', 'active')));

    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error.mock.calls[0][0]).toMatchObject({
      liveSubscriptionId: 'sub_a',
      secondSubscriptionId: 'sub_b',
      secondSubscriptionStatus: 'active',
    });
    expect((await billing.getSubscription('user_1'))?.stripeSubscriptionId).toBe('sub_a');
  });

  it('an old subscription ending after a newer one went live stays a warning', async () => {
    const { deps, stripeNow, log, link } = setup();
    await link();
    stripeNow.set('sub_a', snap('sub_a', 'active'));
    await processStripeEvent(deps, subEvent('evt_a', snap('sub_a', 'active')));
    stripeNow.set('sub_old', snap('sub_old', 'canceled'));
    await processStripeEvent(deps, subEvent('evt_old', snap('sub_old', 'canceled')));
    expect(log.error).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'evt_old' }),
      expect.stringContaining('superseded')
    );
  });
});

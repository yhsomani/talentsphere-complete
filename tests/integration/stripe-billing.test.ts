import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createStripeGateway, type StripeGateway } from '../../apps/api/src/stripe-gateway.js';
import {
  FAKE_PRICES,
  FAKE_STRIPE_ENV,
  checkoutCompletedEvent,
  invoiceEvent,
  signStripeWebhook,
  subscriptionEvent,
} from '../helpers/stripe.js';

const real = createStripeGateway({
  secretKey: FAKE_STRIPE_ENV.STRIPE_SECRET_KEY,
  webhookSecret: FAKE_STRIPE_ENV.STRIPE_WEBHOOK_SECRET,
  logger: { error: () => undefined },
});

const calls = {
  customers: [] as Array<{ userId: string; email: string }>,
  checkouts: [] as Array<Parameters<StripeGateway['createCheckoutSession']>[0]>,
  portals: 0,
  cancellations: [] as Array<{ id: string; immediate: boolean }>,
  deletedCustomers: [] as string[],
};

/** Real signature verification, fake network: nothing here reaches Stripe. */
const gateway: StripeGateway = {
  ...real,
  createCustomer: async (input) => {
    calls.customers.push(input);
    return `cus_${input.userId.slice(0, 8)}`;
  },
  createCheckoutSession: async (input) => {
    calls.checkouts.push(input);
    return { url: 'https://checkout.stripe.test/session' };
  },
  createPortalSession: async () => {
    calls.portals += 1;
    return { url: 'https://billing.stripe.test/portal' };
  },
  setCancellation: async (id, immediate) => {
    calls.cancellations.push({ id, immediate });
    const now = Math.floor(Date.now() / 1000);
    return {
      id,
      customerId: 'cus_x',
      status: immediate ? 'canceled' : 'active',
      priceId: FAKE_PRICES.proMonthly,
      cancelAtPeriodEnd: !immediate,
      canceledAt: now,
      currentPeriodStart: now - 86400,
      currentPeriodEnd: now + 29 * 86400,
      // Later than every event the tests above send, as a live Stripe response is.
      eventCreated: now + 3600,
    };
  },
  deleteCustomer: async (id) => {
    calls.deletedCustomers.push(id);
  },
};

describe('Stripe billing (F-16)', () => {
  let app: FastifyInstance;
  let token: string;
  let userId: string;
  let customerId: string;
  const auth = () => ({ authorization: `Bearer ${token}` });
  const post = (url: string, payload?: unknown, headers = auth()) =>
    app.inject({ method: 'POST', url, headers, payload: payload as never });
  const send = (event: unknown, opts?: Parameters<typeof signStripeWebhook>[1]) => {
    const { body, headers } = signStripeWebhook(event, opts);
    return app.inject({
      method: 'POST',
      url: '/api/v1/billing/stripe-webhook',
      headers,
      payload: body,
    });
  };
  const subscription = async () =>
    JSON.parse(
      (await app.inject({ method: 'GET', url: '/api/v1/billing/subscription', headers: auth() }))
        .body
    );

  beforeAll(async () => {
    app = await buildApp(
      {
        NODE_ENV: 'test',
        PORT: '0',
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
        APP_URL: 'http://localhost:5173',
        ...FAKE_STRIPE_ENV,
      } as never,
      { stripeGateway: gateway }
    );
    await app.ready();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'stripe.buyer@example.com',
        password: 'Password123!Secure',
        fullName: 'Sam Stripe Buyer',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    token = body.token;
    userId = body.user.id;
    customerId = `cus_${userId.slice(0, 8)}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('advertises that checkout is enabled', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/billing/plans' });
    const body = JSON.parse(res.body);
    expect(body.billingMode).toBe('stripe');
    expect(body.checkoutEnabled).toBe(true);
  });

  it('refuses to activate a paid plan through the client-driven subscribe route', async () => {
    const res = await post('/api/v1/billing/subscribe', {
      planTier: 'candidate_pro',
      billingCycle: 'monthly',
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect((await subscription()).entitlements?.planTier ?? 'free').toBe('free');
  });

  it('requires authentication for checkout and portal', async () => {
    expect((await post('/api/v1/billing/checkout', {}, {} as never)).statusCode).toBe(401);
    expect((await post('/api/v1/billing/portal', {}, {} as never)).statusCode).toBe(401);
  });

  it('rejects a plan the account type may not buy and unknown plans', async () => {
    const wrongRole = await post('/api/v1/billing/checkout', { planTier: 'recruiter_starter' });
    expect(wrongRole.statusCode).toBe(403);
    const free = await post('/api/v1/billing/checkout', { planTier: 'free' });
    expect(free.statusCode).toBe(400);
    const unconfigured = await post('/api/v1/billing/checkout', {
      planTier: 'candidate_pro',
      billingCycle: 'yearly',
    });
    expect(unconfigured.statusCode).toBe(201); // yearly is configured in the fake env
  });

  it('has no billing account to open a portal for before the first checkout', async () => {
    // A fresh user: this account already started checkout above, so use a new one.
    const other = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'stripe.noportal@example.com',
        password: 'Password123!Secure',
        fullName: 'No Portal Yet',
        role: 'candidate',
      },
    });
    const res = await post(
      '/api/v1/billing/portal',
      {},
      {
        authorization: `Bearer ${JSON.parse(other.body).token}`,
      }
    );
    expect(res.statusCode).toBe(404);
  });

  it('creates a checkout session with a server-side price and reuses the customer', async () => {
    calls.checkouts.length = 0;
    const first = await post('/api/v1/billing/checkout', {
      planTier: 'candidate_pro',
      billingCycle: 'monthly',
      idempotencyKey: 'k1',
    });
    expect(first.statusCode).toBe(201);
    expect(JSON.parse(first.body)).toEqual({ url: 'https://checkout.stripe.test/session' });
    expect(calls.checkouts[0]).toMatchObject({
      customerId,
      priceId: FAKE_PRICES.proMonthly,
      userId,
      planTier: 'candidate_pro',
      successUrl: 'http://localhost:5173/checkout?checkout=success',
      cancelUrl: 'http://localhost:5173/checkout?checkout=cancelled',
    });
    expect(calls.checkouts[0]!.idempotencyKey).toContain('k1');

    await post('/api/v1/billing/checkout', { planTier: 'candidate_pro', idempotencyKey: 'k2' });
    expect(calls.customers.filter((c) => c.userId === userId)).toHaveLength(1);
  });

  it('ignores a client-supplied price or amount', async () => {
    calls.checkouts.length = 0;
    await post('/api/v1/billing/checkout', {
      planTier: 'candidate_pro',
      priceId: 'price_free_lunch',
      amountCents: 1,
    });
    expect(calls.checkouts[0]?.priceId).toBe(FAKE_PRICES.proMonthly);
  });

  it('opens the billing portal once a customer exists', async () => {
    const res = await post('/api/v1/billing/portal', {});
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).url).toBe('https://billing.stripe.test/portal');
  });

  describe('webhook', () => {
    it('rejects a missing, forged or stale signature and changes nothing', async () => {
      const event = subscriptionEvent({ eventId: 'evt_bad', customerId });
      const missing = await app.inject({
        method: 'POST',
        url: '/api/v1/billing/stripe-webhook',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify(event),
      });
      expect(missing.statusCode).toBe(401);
      expect((await send(event, { secret: 'whsec_wrong_secret_value' })).statusCode).toBe(401);
      const stale = await send(event, { timestamp: Math.floor(Date.now() / 1000) - 3600 });
      expect(stale.statusCode).toBe(401);
      expect((await subscription()).entitlements.planTier).toBe('free');
    });

    it('rejects a body altered after signing', async () => {
      const { body, headers } = signStripeWebhook(
        subscriptionEvent({ eventId: 'evt_tamper', customerId })
      );
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/billing/stripe-webhook',
        headers,
        payload: body.replace('"active"', '"trialing"'),
      });
      expect(res.statusCode).toBe(401);
    });

    it('links the customer on checkout completion without granting access', async () => {
      const res = await send(
        checkoutCompletedEvent({
          eventId: 'evt_co',
          userId,
          customerId,
          subscriptionId: 'sub_main',
        })
      );
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).status).toBe('processed');
      expect((await subscription()).entitlements.planTier).toBe('free');
    });

    it('grants the paid tier from a signed active subscription and records the invoice', async () => {
      const t0 = Math.floor(Date.now() / 1000) - 600;
      const res = await send(
        subscriptionEvent({
          eventId: 'evt_sub_1',
          customerId,
          subscriptionId: 'sub_main',
          type: 'customer.subscription.created',
          created: t0,
        })
      );
      expect(res.statusCode).toBe(200);
      const sub = await subscription();
      expect(sub.subscription).toMatchObject({ planTier: 'candidate_pro', status: 'active' });
      expect(sub.entitlements.planTier).toBe('candidate_pro');

      await send(
        invoiceEvent({ eventId: 'evt_inv_1', customerId, subscriptionId: 'sub_main', created: t0 })
      );
      const invoices = JSON.parse(
        (await app.inject({ method: 'GET', url: '/api/v1/billing/invoices', headers: auth() })).body
      );
      expect(invoices.invoices).toHaveLength(1);
      expect(invoices.invoices[0]).toMatchObject({
        amountCents: 1999,
        status: 'paid',
        currency: 'USD',
      });
    });

    it('applies a duplicate delivery once', async () => {
      const event = invoiceEvent({ eventId: 'evt_inv_1', customerId, subscriptionId: 'sub_main' });
      const res = await send(event);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).status).toBe('replayed');
      const invoices = JSON.parse(
        (await app.inject({ method: 'GET', url: '/api/v1/billing/invoices', headers: auth() })).body
      );
      expect(invoices.invoices).toHaveLength(1);
    });

    it('refuses a second checkout while a paid subscription is live', async () => {
      const res = await post('/api/v1/billing/checkout', { planTier: 'candidate_pro' });
      expect(res.statusCode).toBe(409);
    });

    it('ignores an older event that arrives after a newer one', async () => {
      const now = Math.floor(Date.now() / 1000);
      await send(
        subscriptionEvent({
          eventId: 'evt_sub_fail',
          customerId,
          subscriptionId: 'sub_main',
          status: 'past_due',
          created: now - 60,
        })
      );
      expect((await subscription()).entitlements.planTier).toBe('free');

      await send(
        subscriptionEvent({
          eventId: 'evt_sub_late',
          customerId,
          subscriptionId: 'sub_main',
          status: 'active',
          created: now - 300,
        })
      );
      const sub = await subscription();
      expect(sub.subscription.status).toBe('past_due');
      expect(sub.entitlements.planTier).toBe('free');
    });

    it('restores access when payment recovers', async () => {
      await send(
        subscriptionEvent({
          eventId: 'evt_sub_ok',
          customerId,
          subscriptionId: 'sub_main',
          status: 'active',
          created: Math.floor(Date.now() / 1000),
        })
      );
      expect((await subscription()).entitlements.planTier).toBe('candidate_pro');
    });

    it('never grants a plan for a price that is not in the catalog', async () => {
      const res = await send(
        subscriptionEvent({
          eventId: 'evt_foreign_price',
          customerId,
          subscriptionId: 'sub_main',
          priceId: 'price_not_ours',
          created: Math.floor(Date.now() / 1000) + 5,
        })
      );
      expect(res.statusCode).toBe(200);
      expect((await subscription()).entitlements.planTier).toBe('free');
    });

    it('acknowledges unrelated and unknown-customer events without failing', async () => {
      const unrelated = await send({
        id: 'evt_other',
        object: 'event',
        type: 'charge.refunded',
        created: Math.floor(Date.now() / 1000),
        data: { object: { id: 'ch_1', object: 'charge' } },
      });
      expect(unrelated.statusCode).toBe(200);
      expect(JSON.parse(unrelated.body).status).toBe('ignored');

      const stranger = await send(
        subscriptionEvent({
          eventId: 'evt_stranger',
          customerId: 'cus_nobody',
          subscriptionId: 'sub_zzz',
        })
      );
      expect(stranger.statusCode).toBe(200);
      expect(JSON.parse(stranger.body).status).toBe('ignored');
    });

    it('does not let an old subscription ending cancel a live newer one', async () => {
      const now = Math.floor(Date.now() / 1000);
      await send(
        subscriptionEvent({
          eventId: 'evt_resub',
          customerId,
          subscriptionId: 'sub_main',
          status: 'active',
          created: now + 10,
        })
      );
      await send(
        subscriptionEvent({
          eventId: 'evt_old_gone',
          customerId,
          subscriptionId: 'sub_main',
          type: 'customer.subscription.deleted',
          status: 'canceled',
          created: now + 20,
        })
      );
      expect((await subscription()).subscription.status).toBe('canceled');
    });
  });

  describe('cancellation and erasure', () => {
    it('cancels at Stripe, is idempotent, and keeps access until the period ends', async () => {
      await send(
        subscriptionEvent({
          eventId: 'evt_active_again',
          customerId,
          subscriptionId: 'sub_second',
          status: 'active',
          created: Math.floor(Date.now() / 1000) + 100,
        })
      );
      calls.cancellations.length = 0;
      const res = await post('/api/v1/billing/cancel', {});
      expect(res.statusCode).toBe(200);
      expect(calls.cancellations).toEqual([{ id: 'sub_second', immediate: false }]);
      const sub = await subscription();
      expect(sub.subscription.cancelAtPeriodEnd).toBe(true);
      expect(sub.entitlements.planTier).toBe('candidate_pro');

      await post('/api/v1/billing/cancel', {});
      expect(calls.cancellations).toHaveLength(1);
    });
  });
});

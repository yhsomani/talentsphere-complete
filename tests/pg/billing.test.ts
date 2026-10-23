/**
 * Billing against real PostgreSQL (migration 00052): durability across a
 * restart, exactly-once event handling under concurrent delivery, stale-event
 * protection, constraints, and erasure. Stripe's network is faked; webhook
 * signatures are verified for real.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createStripeGateway, type StripeGateway } from '../../apps/api/src/stripe-gateway.js';
import {
  FAKE_STRIPE_ENV,
  invoiceEvent,
  signStripeWebhook,
  subscriptionEvent,
} from '../helpers/stripe.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) throw new Error('TEST_DATABASE_URL is required for billing persistence tests.');

const dbName = `ts_pgbilling_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
const databaseUrl = withDb(baseUrl, dbName);

const real = createStripeGateway({
  secretKey: FAKE_STRIPE_ENV.STRIPE_SECRET_KEY,
  webhookSecret: FAKE_STRIPE_ENV.STRIPE_WEBHOOK_SECRET,
  logger: { error: () => undefined },
});
const deletedCustomers: string[] = [];
const gateway: StripeGateway = {
  ...real,
  createCustomer: async ({ userId }) => `cus_${userId.slice(0, 8)}`,
  createCheckoutSession: async () => ({ url: 'https://checkout.stripe.test/s' }),
  deleteCustomer: async (id) => {
    deletedCustomers.push(id);
  },
};

const boot = () =>
  buildApp(
    {
      NODE_ENV: 'test',
      STORAGE: 'pg',
      DATABASE_URL: databaseUrl,
      LOG_LEVEL: 'error',
      APP_URL: 'http://localhost:5173',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
      ...FAKE_STRIPE_ENV,
    } as never,
    { stripeGateway: gateway }
  );

type Json = Record<string, any>;

describe('Billing persistence (PostgreSQL)', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let token: string;
  let userId: string;
  let customerId: string;
  const auth = () => ({ authorization: `Bearer ${token}` });
  const get = async (url: string) => {
    const res = await app.inject({ method: 'GET', url, headers: auth() });
    return { status: res.statusCode, data: JSON.parse(res.body) as Json, headers: res.headers };
  };
  const send = (event: unknown) => {
    const { body, headers } = signStripeWebhook(event);
    return app.inject({
      method: 'POST',
      url: '/api/v1/billing/stripe-webhook',
      headers,
      payload: body,
    });
  };
  const count = async (sql: string, params: unknown[] = []) =>
    (await pool.query(sql, params)).rows[0].n as number;

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    try {
      await admin.query(`CREATE DATABASE ${dbName}`);
    } finally {
      await admin.end();
    }
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl });
    app = await boot();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'pg.billing@example.org',
        password: 'long-enough-billing-test-password',
        fullName: 'Pat Billing',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    token = body.token;
    userId = body.user.id;
    customerId = `cus_${userId.slice(0, 8)}`;

    // Creates and links the Stripe customer.
    const checkout = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/checkout',
      headers: auth(),
      payload: { planTier: 'candidate_pro' },
    });
    expect(checkout.statusCode).toBe(201);
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('serves billing routes as durable (no ephemeral label)', async () => {
    const res = await get('/api/v1/billing/subscription');
    expect(res.status).toBe(200);
    expect(res.headers['x-talentsphere-durability']).toBeUndefined();
  });

  it('applies concurrent duplicate deliveries of one event exactly once', async () => {
    const t0 = Math.floor(Date.now() / 1000) - 1000;
    const sub = subscriptionEvent({
      eventId: 'evt_pg_sub',
      customerId,
      subscriptionId: 'sub_pg',
      type: 'customer.subscription.created',
      created: t0,
    });
    const results = await Promise.all(Array.from({ length: 8 }, () => send(sub)));
    expect(results.every((r) => r.statusCode === 200)).toBe(true);
    const statuses = results.map((r) => JSON.parse(r.body).status as string);
    expect(statuses.filter((s) => s === 'processed')).toHaveLength(1);
    expect(statuses.filter((s) => s === 'replayed')).toHaveLength(7);

    expect(
      await count(
        "SELECT count(*)::int n FROM billing_events WHERE provider_event_id = 'evt_pg_sub'"
      )
    ).toBe(1);
    expect(
      await count('SELECT count(*)::int n FROM subscriptions WHERE user_id = $1', [userId])
    ).toBe(1);
    const state = await get('/api/v1/billing/subscription');
    expect(state.data.entitlements.planTier).toBe('candidate_pro');
  });

  it('records one invoice per Stripe invoice even under concurrent delivery', async () => {
    const events = Array.from({ length: 4 }, (_, i) =>
      invoiceEvent({
        eventId: `evt_pg_inv_${i}`,
        customerId,
        invoiceId: 'in_pg',
        subscriptionId: 'sub_pg',
      })
    );
    const results = await Promise.all(events.map((e) => send(e)));
    expect(results.every((r) => r.statusCode === 200)).toBe(true);
    expect(
      await count('SELECT count(*)::int n FROM invoices WHERE stripe_invoice_id = $1', ['in_pg'])
    ).toBe(1);
  });

  it('does not let a late older event overwrite newer state', async () => {
    const now = Math.floor(Date.now() / 1000);
    await send(
      subscriptionEvent({
        eventId: 'evt_pg_fail',
        customerId,
        subscriptionId: 'sub_pg',
        status: 'past_due',
        created: now - 10,
      })
    );
    await send(
      subscriptionEvent({
        eventId: 'evt_pg_late',
        customerId,
        subscriptionId: 'sub_pg',
        status: 'active',
        created: now - 500,
      })
    );
    const state = await get('/api/v1/billing/subscription');
    expect(state.data.subscription.status).toBe('past_due');
    expect(state.data.entitlements.planTier).toBe('free');
    // The late event is still recorded as received, so a retry is a no-op.
    expect(
      await count(
        "SELECT count(*)::int n FROM billing_events WHERE provider_event_id = 'evt_pg_late'"
      )
    ).toBe(1);
  });

  it('survives an application restart', async () => {
    await send(
      subscriptionEvent({
        eventId: 'evt_pg_ok',
        customerId,
        subscriptionId: 'sub_pg',
        status: 'active',
        created: Math.floor(Date.now() / 1000),
      })
    );
    await app.close();
    app = await boot();
    const state = await get('/api/v1/billing/subscription');
    expect(state.data.entitlements.planTier).toBe('candidate_pro');
    const invoices = await get('/api/v1/billing/invoices');
    expect(invoices.data.invoices).toHaveLength(1);
  });

  it('enforces one subscription per user and one Stripe id per row in the schema', async () => {
    await expect(
      pool.query(
        `INSERT INTO subscriptions (user_id, plan_tier, status, current_period_start, current_period_end)
         VALUES ($1, 'free', 'active', now(), now())`,
        [userId]
      )
    ).rejects.toMatchObject({ code: '23505' });
    await expect(
      pool.query(
        "INSERT INTO stripe_customers (user_id, stripe_customer_id) VALUES ($1, 'cus_dup')",
        [userId]
      )
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('keeps billing tables server-only (RLS on, no public grants)', async () => {
    const rls = await pool.query(
      `SELECT relrowsecurity FROM pg_class WHERE relname = 'stripe_customers' AND relkind = 'r'`
    );
    expect(rls.rows[0].relrowsecurity).toBe(true);
    const grants = await pool.query(
      `SELECT count(*)::int n FROM information_schema.role_table_grants
       WHERE table_name = 'stripe_customers' AND grantee = 'PUBLIC'`
    );
    expect(grants.rows[0].n).toBe(0);
  });

  it('erases billing records and the Stripe customer with the account', async () => {
    const erased = await app.inject({
      method: 'POST',
      url: '/api/v1/settings/erasure/execute',
      headers: auth(),
    });
    expect(erased.statusCode).toBe(200);
    expect(deletedCustomers).toContain(customerId);
    for (const table of ['subscriptions', 'entitlements', 'invoices', 'stripe_customers']) {
      expect(await count(`SELECT count(*)::int n FROM ${table} WHERE user_id = $1`, [userId])).toBe(
        0
      );
    }
  });
});

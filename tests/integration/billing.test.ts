import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { signWebhook } from '../helpers/webhook.js';
import { TEST_WEBHOOK_SECRET } from '../../test-secrets.mjs';

describe('Billing, Subscriptions & Monetization Integration (F-16, Section 64, WF-16, WIT-016)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
      // No payment processor exists: paid plans activate only in the explicit
      // simulated mode (see the 'disabled' suite below for the default).
      BILLING_MODE: 'simulated',
      BILLING_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
    } as never);
    await app.ready();

    // Register a test candidate
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'billing.user@example.com',
        password: 'Password123!Secure',
        fullName: 'Jordan Billing Pro',
        role: 'candidate',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    candidateToken = body.token;
    candidateUserId = body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows public access to platform pricing catalog with integer minor units', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/plans',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body.plans)).toBe(true);
    expect(body.plans.length).toBeGreaterThanOrEqual(4);

    const proPlan = body.plans.find((p: any) => p.tier === 'candidate_pro');
    expect(proPlan).toBeDefined();
    expect(proPlan.priceMonthlyCents).toBe(1999);
    expect(proPlan.currency).toBe('USD');
  });

  it('rejects unauthenticated requests to subscription endpoints with 401', async () => {
    const resGet = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/subscription',
    });
    expect(resGet.statusCode).toBe(401);

    const resPost = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/subscribe',
      payload: { planTier: 'candidate_pro' },
    });
    expect(resPost.statusCode).toBe(401);
  });

  it('returns default free subscription and baseline entitlements for new user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/subscription',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.subscription.planTier).toBe('free');
    expect(body.subscription.status).toBe('active');
    expect(body.entitlements.aiDailyRequestsLimit).toBe(5);
    expect(body.entitlements.aiDailyTokensLimit).toBe(5000);
    expect(body.entitlements.hasAdvancedAnalytics).toBe(false);
  });

  it('subscribes to candidate_pro plan with idempotency and updates entitlements', async () => {
    const idempotencyKey = 'sub_idem_key_unique_888';

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/subscribe',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        planTier: 'candidate_pro',
        billingCycle: 'monthly',
        idempotencyKey,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.subscription.planTier).toBe('candidate_pro');
    expect(body.invoice.amountCents).toBe(1999);
    expect(body.invoice.currency).toBe('USD');
    expect(body.entitlements.aiDailyRequestsLimit).toBe(50);
    expect(body.entitlements.aiDailyTokensLimit).toBe(100000);
    expect(body.entitlements.hasAdvancedAnalytics).toBe(true);

    // Duplicate request with same idempotencyKey should return 200 with isDuplicate
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/subscribe',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        planTier: 'candidate_pro',
        billingCycle: 'monthly',
        idempotencyKey,
      },
    });

    expect(dupRes.statusCode).toBe(200);
    const dupBody = JSON.parse(dupRes.body);
    expect(dupBody.isDuplicate).toBe(true);
    expect(dupBody.subscription.planTier).toBe('candidate_pro');
  });

  it('lists user invoices history with exact minor unit values', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/invoices',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body.invoices)).toBe(true);
    expect(body.invoices.length).toBeGreaterThanOrEqual(1);
    expect(body.invoices[0].amountCents).toBe(1999);
  });

  it('cancels active subscription gracefully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/cancel',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        immediate: false,
        reason: 'Finished job search successfully',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.subscription.cancelAtPeriodEnd).toBe(true);
    expect(body.subscription.status).toBe('active');
  });

  it('processes payment webhook with replay resistance (WIT-016)', async () => {
    const idempotencyKey = 'stripe_evt_webhook_999';

    // First arrival of webhook event
    const event = {
      eventType: 'invoice.payment_succeeded',
      idempotencyKey,
      userId: candidateUserId,
      amountCents: 1999,
      currency: 'USD',
    };
    const signed = signWebhook(event);
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/webhook',
      headers: signed.headers,
      payload: signed.body,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('success');
    expect(body.eventId).toBeDefined();

    // Replay of same webhook event
    const resigned = signWebhook(event);
    const replayRes = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/webhook',
      headers: resigned.headers,
      payload: resigned.body,
    });

    expect(replayRes.statusCode).toBe(200);
    const replayBody = JSON.parse(replayRes.body);
    expect(replayBody.replayed).toBe(true);

    // Verify async worker events were dispatched
    const workerRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    expect(workerRes.statusCode).toBe(200);
    const workerBody = JSON.parse(workerRes.body);
    const jobTypes = workerBody.jobs.map((j: any) => j.type);
    expect(jobTypes).toContain('billing.subscription.created');
    expect(jobTypes).toContain('billing.subscription.cancelled');
    expect(jobTypes).toContain('billing.webhook.received');
  });
});

describe('Billing without a payment processor (BILLING_MODE default)', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', LOG_LEVEL: 'error' } as never);
    await app.ready();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'no.payments@example.com',
        password: 'Password123!Secure',
        fullName: 'No Payments',
      },
    });
    token = JSON.parse(res.body).token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuses to activate a paid plan that nobody paid for', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/subscribe',
      headers: { authorization: `Bearer ${token}` },
      payload: { planTier: 'candidate_pro', billingCycle: 'monthly' },
    });
    expect(res.statusCode).toBe(503);
    expect(res.json().error.message).toContain('Paid plans are not available yet');

    const sub = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/subscription',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(sub.json().subscription.planTier).toBe('free');
    const invoices = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/invoices',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(invoices.json().invoices).toHaveLength(0);
  });

  it('refuses every webhook while no signing secret is configured', async () => {
    const signed = signWebhook({
      eventType: 'invoice.paid',
      idempotencyKey: 'unconfigured-1',
      userId: '00000000-0000-4000-a000-000000000001',
      amountCents: 100,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/webhook',
      headers: signed.headers,
      payload: signed.body,
    });
    expect(res.statusCode).toBe(503);
  });
});

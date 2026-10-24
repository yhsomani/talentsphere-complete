import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { TEST_WEBHOOK_SECRET } from '../../test-secrets.mjs';

describe('Plan entitlements are enforced by the backend', () => {
  let app: FastifyInstance;
  const auth = (t: string) => ({ authorization: `Bearer ${t}` });

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      BILLING_MODE: 'simulated',
      BILLING_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
    } as never);
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  const register = async (email: string, role: 'candidate' | 'recruiter') => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password: 'Password123!Secure', fullName: 'Plan Tester', role },
    });
    expect(res.statusCode).toBe(201);
    return res.json().token as string;
  };

  it('AI quota follows the stored subscription: free then candidate_pro', async () => {
    const token = await register('plan-ai@example.com', 'candidate');
    const free = await app.inject({ method: 'GET', url: '/api/v1/ai/usage', headers: auth(token) });
    expect(free.json().limits).toEqual({ maxTokensPerDay: 5000, maxRequestsPerDay: 5 });

    const sub = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/subscribe',
      headers: auth(token),
      payload: { planTier: 'candidate_pro', billingCycle: 'monthly', idempotencyKey: 'plan-ai-1' },
    });
    expect(sub.statusCode).toBe(201);

    const pro = await app.inject({ method: 'GET', url: '/api/v1/ai/usage', headers: auth(token) });
    expect(pro.json().limits).toEqual({ maxTokensPerDay: 100000, maxRequestsPerDay: 50 });
    expect(pro.json().usage.tier).toBe('pro');
  });

  it('free AI chat is blocked after the daily request limit', async () => {
    const token = await register('plan-ai-free@example.com', 'candidate');
    let last = 200;
    for (let i = 0; i < 6; i++) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/ai/career-assistant/chat',
        headers: auth(token),
        payload: { prompt: 'How do I improve my resume?' },
      });
      last = res.statusCode;
    }
    expect(last).toBe(402);
  });

  it('Recruiter Starter cannot publish more than 5 jobs, even calling the API directly', async () => {
    const token = await register('plan-rec@example.com', 'recruiter');
    const org = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: auth(token),
      payload: { name: 'Plan Corp', slug: 'plan-corp', website: 'https://plan.example.com' },
    });
    const orgId = org.json().organization.id as string;
    const sub = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/subscribe',
      headers: auth(token),
      payload: {
        planTier: 'recruiter_starter',
        billingCycle: 'monthly',
        idempotencyKey: 'plan-rec-1',
      },
    });
    expect(sub.statusCode).toBe(201);

    const results: number[] = [];
    for (let i = 0; i < 6; i++) {
      const job = await app.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        headers: auth(token),
        payload: {
          orgId,
          title: `Engineer ${i}`,
          description: 'Build and run reliable distributed services for our customers.',
          location: 'Remote',
        },
      });
      const id = job.json().job.id as string;
      const pub = await app.inject({
        method: 'PATCH',
        url: `/api/v1/jobs/${id}/status`,
        headers: auth(token),
        payload: { status: 'published' },
      });
      results.push(pub.statusCode);
    }
    expect(results.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(results[5]).toBe(402);
  });
});

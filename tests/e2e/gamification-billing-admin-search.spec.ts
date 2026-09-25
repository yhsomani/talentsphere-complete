import { test, expect } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Gamification, Billing, Admin Governance & Search (F-16, F-18, F-17, F-35, F-20, F-34, BR-25, BR-29, WIT-016)', () => {
  let userToken: string;
  let userId: string;
  let userProfileId: string;

  let adminToken: string;
  let adminId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register candidate
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `governance.user.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan AdminTester',
        role: 'candidate',
      },
    });
    expect(regRes.status()).toBe(201);
    const regData = await regRes.json();
    userToken = regData.token;
    userId = regData.user.id;
    userProfileId = regData.profile.id;

    // 2. Generate platform_admin token for registered user
    adminId = userId;
    adminToken = createSessionToken(
      adminId,
      'admin.root@talentsphere.internal',
      ['platform_admin']
    );
  });

  test('tracks gamification XP, enforces daily cap (200 XP/day BR-25), and views leaderboard (F-22, F-23)', async ({ request }) => {
    // 1. Check initial gamification summary
    const summaryRes = await request.get(`${API_BASE}/gamification/summary`, {
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(summaryRes.status()).toBe(200);
    const summaryData = await summaryRes.json();
    expect(summaryData.dailyCap).toBe(200);
    expect(summaryData.remainingDailyCap).toBe(200);

    // 2. Claim activity: 150 XP
    const claim1Res = await request.post(`${API_BASE}/gamification/claim-activity`, {
      headers: { authorization: `Bearer ${userToken}` },
      data: {
        amount: 150,
        referenceType: 'daily_quest',
        referenceId: `quest-1-${Date.now()}`,
        description: 'Completed morning algorithmic problem',
      },
    });
    expect(claim1Res.status()).toBe(200);
    const claim1Data = await claim1Res.json();
    expect(claim1Data.awarded).toBe(150);

    // 3. Claim activity: 100 XP -> Must be capped at 50 XP to enforce 200 XP/day cap (BR-25)
    const claim2Res = await request.post(`${API_BASE}/gamification/claim-activity`, {
      headers: { authorization: `Bearer ${userToken}` },
      data: {
        amount: 100,
        referenceType: 'daily_quest',
        referenceId: `quest-2-${Date.now()}`,
        description: 'Completed afternoon system design review',
      },
    });
    expect(claim2Res.status()).toBe(200);
    const claim2Data = await claim2Res.json();
    expect(claim2Data.awarded).toBe(50); // Capped to reach exactly 200

    // 4. View Leaderboard
    const lbRes = await request.get(`${API_BASE}/gamification/leaderboard`, {
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(lbRes.status()).toBe(200);
    const lbData = await lbRes.json();
    expect(Array.isArray(lbData.leaderboard)).toBe(true);
    expect(lbData.totalParticipants).toBeGreaterThanOrEqual(1);
  });

  test('subscribes to platform plan and verifies webhook replay idempotency (F-16, WIT-016)', async ({ request }) => {
    // 1. Inspect public plans
    const plansRes = await request.get(`${API_BASE}/billing/plans`);
    expect(plansRes.status()).toBe(200);
    const plansData = await plansRes.json();
    expect(plansData.plans.length).toBeGreaterThanOrEqual(3);

    // 2. Subscribe to candidate_pro tier
    const subRes = await request.post(`${API_BASE}/billing/subscribe`, {
      headers: { authorization: `Bearer ${userToken}` },
      data: {
        planTier: 'candidate_pro',
        billingCycle: 'monthly',
        idempotencyKey: `sub-key-${Date.now()}`,
      },
    });
    expect(subRes.status()).toBe(201);
    const subData = await subRes.json();
    expect(subData.subscription.planTier).toBe('candidate_pro');
    expect(subData.subscription.status).toBe('active');
    expect(subData.entitlements.hasAdvancedAnalytics).toBe(true);
    expect(subData.entitlements.aiDailyRequestsLimit).toBe(50);

    // 3. Process external billing webhook with idempotency (WIT-016)
    const webhookKey = `wh-evt-${Date.now()}`;
    const whRes1 = await request.post(`${API_BASE}/billing/webhook`, {
      data: {
        idempotencyKey: webhookKey,
        eventType: 'invoice.paid',
        userId,
        amountCents: 2900,
        currency: 'USD',
        subscriptionId: subData.subscription.id,
      },
    });
    expect(whRes1.status()).toBe(200);
    const whData1 = await whRes1.json();
    expect(whData1.status).toBe('success');

    // Replay same webhook -> Must return replayed: true
    const whRes2 = await request.post(`${API_BASE}/billing/webhook`, {
      data: {
        idempotencyKey: webhookKey,
        eventType: 'invoice.paid',
        userId,
        amountCents: 2900,
        currency: 'USD',
        subscriptionId: subData.subscription.id,
      },
    });
    expect(whRes2.status()).toBe(200);
    const whData2 = await whRes2.json();
    expect(whData2.replayed).toBe(true);
  });

  test('enforces admin governance, feature flags, anti-lockout (BR-29, BR-068), and executes multi-entity search (F-17, F-35, F-20, F-34)', async ({ request }) => {
    // 1. Non-admin accessing admin endpoint must be rejected with 403
    const forbiddenRes = await request.get(`${API_BASE}/admin/users`, {
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(forbiddenRes.status()).toBe(403);

    // 2. Admin lists users
    const usersRes = await request.get(`${API_BASE}/admin/users`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(usersRes.status()).toBe(200);
    const usersData = await usersRes.json();
    expect(usersData.users.some((u: any) => u.id === userId)).toBe(true);

    // 3. Admin self-lockout prevention (BR-29, BR-068)
    const lockoutRes = await request.patch(`${API_BASE}/admin/users/${adminId}/status`, {
      headers: { authorization: `Bearer ${adminToken}` },
      data: {
        status: 'suspended',
        reason: 'Attempting self-lockout',
      },
    });
    expect(lockoutRes.status()).toBe(422);
    const lockoutErr = await lockoutRes.json();
    expect(lockoutErr.error.message).toContain('prevent governance lockout');

    // 4. Admin toggles feature flag
    const flagRes = await request.put(`${API_BASE}/admin/feature-flags/ai_resume_analyzer`, {
      headers: { authorization: `Bearer ${adminToken}` },
      data: {
        enabled: true,
        description: 'AI-assisted resume analysis feature flag',
      },
    });
    expect(flagRes.status()).toBe(200);
    const flagData = await flagRes.json();
    expect(flagData.flag.enabled).toBe(true);

    // 5. Admin inspects system health diagnostics (BR-28)
    const healthRes = await request.get(`${API_BASE}/admin/health-diagnostics`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(healthRes.status()).toBe(200);
    const healthData = await healthRes.json();
    expect(healthData.diagnostics.status).toBe('healthy');
    expect(healthData.diagnostics.database).toBe('connected');

    // 6. Multi-Entity Unified Search (F-20, F-34)
    const searchRes = await request.get(`${API_BASE}/search?query=typescript&type=all`, {
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(searchRes.status()).toBe(200);
    const searchData = await searchRes.json();
    expect(searchData.query).toBe('typescript');
    expect(searchData.totalResults).toBeGreaterThanOrEqual(1);

    // 7. Command Palette available commands (⌘K)
    const cmdRes = await request.get(`${API_BASE}/search/commands`, {
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect(cmdRes.status()).toBe(200);
    const cmdData = await cmdRes.json();
    expect(cmdData.commands.length).toBeGreaterThanOrEqual(3);
    expect(cmdData.commands.some((c: any) => c.id === 'nav_jobs')).toBe(true);
  });
});

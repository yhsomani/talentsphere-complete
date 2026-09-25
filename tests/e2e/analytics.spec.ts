import { test, expect } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Product Analytics, Telemetry & KPI Rollups (F-19, F-31, BR-27)', () => {
  let candidateToken: string;
  let candidateUserId: string;

  let adminToken: string;
  let adminUserId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.telemetry.cand.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan Telemetry',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Mint platform admin token
    adminUserId = 'user_admin_e2e_' + Date.now();
    adminToken = createSessionToken(adminUserId, `admin.e2e.${Date.now()}@talentsphere.internal`, [
      'platform_admin',
    ]);
  });

  test('ingests client telemetry events and enforces metadata allowlist (F-19, BR-27)', async ({
    request,
  }) => {
    // 1. Ingest single telemetry event
    const singleRes = await request.post(`${API_BASE}/analytics/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        eventType: 'job_viewed',
        metadata: {
          jobId: 'job_distributed_consensus',
          source: 'recommendations',
          browser: 'Chromium',
          platform: 'Windows',
        },
      },
    });
    expect(singleRes.status()).toBe(201);
    const singleData = await singleRes.json();
    expect(singleData.count).toBe(1);
    expect(singleData.events[0].eventType).toBe('job_viewed');
    expect(singleData.events[0].userId).toBe(candidateUserId);

    // 2. Batch ingestion
    const batchRes = await request.post(`${API_BASE}/analytics/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        events: [
          {
            eventType: 'job_search_performed',
            metadata: { query: 'Raft consensus', location: 'Remote' },
          },
          {
            eventType: 'application_submitted',
            metadata: { jobId: 'job_distributed_consensus', source: 'quick_apply' },
          },
        ],
      },
    });
    expect(batchRes.status()).toBe(201);
    const batchData = await batchRes.json();
    expect(batchData.count).toBe(2);

    // 3. Prohibit secret keys and tokens (BR-27)
    const secretRes = await request.post(`${API_BASE}/analytics/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        eventType: 'auth_attempt',
        metadata: {
          userPassword: 'secret_leak_password',
        },
      },
    });
    expect(secretRes.status()).toBe(422);

    const tokenRes = await request.post(`${API_BASE}/analytics/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        eventType: 'api_call',
        metadata: {
          authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy',
        },
      },
    });
    expect(tokenRes.status()).toBe(422);
  });

  test('enforces RBAC on analytics queries and aggregates KPIs for platform admin (F-31, BR-06)', async ({
    request,
  }) => {
    // 1. Candidate forbidden from accessing telemetry queries
    const candForbiddenEvents = await request.get(`${API_BASE}/analytics/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candForbiddenEvents.status()).toBe(403);

    const candForbiddenKpis = await request.get(`${API_BASE}/analytics/kpis`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candForbiddenKpis.status()).toBe(403);

    // 2. Platform Admin retrieves event stream
    const adminEventsRes = await request.get(`${API_BASE}/analytics/events`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(adminEventsRes.status()).toBe(200);
    const adminEventsData = await adminEventsRes.json();
    expect(adminEventsData.total).toBeGreaterThanOrEqual(3);

    // 3. Platform Admin queries aggregated KPIs
    const adminKpiRes = await request.get(`${API_BASE}/analytics/kpis`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(adminKpiRes.status()).toBe(200);
    const adminKpiData = await adminKpiRes.json();
    expect(adminKpiData.kpis.totalEvents).toBeGreaterThanOrEqual(3);
    expect(adminKpiData.kpis.eventsByType.job_viewed).toBeGreaterThanOrEqual(1);
    expect(adminKpiData.kpis.eventsByType.application_submitted).toBeGreaterThanOrEqual(1);
    expect(adminKpiData.kpis.uniqueUsers).toBeGreaterThanOrEqual(1);
  });

  test('respects candidate privacy opt-out by anonymizing telemetry (F-15, §31)', async ({
    request,
  }) => {
    // 1. Candidate opts out of activity telemetry
    const optOutRes = await request.patch(`${API_BASE}/settings`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        showActivity: false,
      },
    });
    expect(optOutRes.status()).toBe(200);

    // 2. Ingest telemetry event
    const eventRes = await request.post(`${API_BASE}/analytics/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        eventType: 'anonymized_page_view',
        metadata: { path: '/jobs' },
      },
    });
    expect(eventRes.status()).toBe(201);
    const eventData = await eventRes.json();
    expect(eventData.events[0].isAnonymized).toBe(true);
    expect(eventData.events[0].userId).toBeUndefined();
  });
});

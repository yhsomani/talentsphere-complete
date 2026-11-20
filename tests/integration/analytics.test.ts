import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Integration: Product Analytics & KPI Rollups (F-19, F-31, BR-27)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;

  let adminToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    });
    await app.ready();

    // 1. Register candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `cand.telemetry.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Robin TelemetryTester',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candData = JSON.parse(candRes.payload);
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Mint platform admin token
    adminUserId = 'user_admin_' + Date.now();
    adminToken = createSessionToken(
      adminUserId,
      `admin.telemetry.${Date.now()}@talentsphere.internal`,
      ['platform_admin']
    );
  });

  it('allows candidate to ingest a single telemetry event with clean metadata (F-19)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        eventType: 'job_viewed',
        metadata: {
          jobId: 'job_distributed_systems_101',
          source: 'search_results',
          device: 'desktop',
        },
      },
    });

    expect(res.statusCode).toBe(201);
    const data = JSON.parse(res.payload);
    expect(data.count).toBe(1);
    expect(data.events[0].eventType).toBe('job_viewed');
    expect(data.events[0].userId).toBe(candidateUserId);
    expect(data.events[0].metadata.jobId).toBe('job_distributed_systems_101');
  });

  it('allows batch ingestion of telemetry events (F-19)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        events: [
          {
            eventType: 'job_search_performed',
            metadata: { query: 'distributed consensus', filterRemote: true },
          },
          {
            eventType: 'application_submitted',
            metadata: { jobId: 'job_distributed_systems_101', stepCount: 3 },
          },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const data = JSON.parse(res.payload);
    expect(data.count).toBe(2);
  });

  it('rejects ingestion with prohibited secret or token keys per BR-27', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        eventType: 'unsafe_event',
        metadata: {
          clientSecret: 'secret_leak_123',
        },
      },
    });

    expect(res.statusCode).toBe(422); // Validation failure (DomainError VALIDATION_FAILED)
  });

  it('forbids candidates and non-admins from accessing raw analytics queries and KPIs', async () => {
    const eventsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/events',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(eventsRes.statusCode).toBe(403);

    const kpisRes = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/kpis',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(kpisRes.statusCode).toBe(403);
  });

  it('allows platform admin to inspect events and aggregated KPIs (F-31)', async () => {
    // 1. Inspect raw event stream
    const eventsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/events',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(eventsRes.statusCode).toBe(200);
    const eventsData = JSON.parse(eventsRes.payload);
    expect(eventsData.total).toBeGreaterThanOrEqual(3);

    // 2. Query aggregated KPIs
    const kpisRes = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/kpis',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(kpisRes.statusCode).toBe(200);
    const kpisData = JSON.parse(kpisRes.payload);
    expect(kpisData.kpis.totalEvents).toBeGreaterThanOrEqual(3);
    expect(kpisData.kpis.eventsByType.job_viewed).toBeGreaterThanOrEqual(1);
    expect(kpisData.kpis.eventsByType.application_submitted).toBeGreaterThanOrEqual(1);
    expect(kpisData.kpis.uniqueUsers).toBeGreaterThanOrEqual(1);
  });

  it('anonymizes event if user has opted out of activity tracking', async () => {
    // 1. Update candidate privacy settings to turn off activity tracking
    await app.inject({
      method: 'PATCH',
      url: '/api/v1/settings',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        showActivity: false,
      },
    });

    // 2. Ingest event
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        eventType: 'privacy_focused_view',
        metadata: { path: '/careers' },
      },
    });
    expect(res.statusCode).toBe(201);
    const data = JSON.parse(res.payload);
    expect(data.events[0].isAnonymized).toBe(true);
    expect(data.events[0].userId).toBeUndefined();
  });
});

describe('Integration: analytics ingestion is bounded (C-03)', () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: '0' });
    await app.ready();
    adminToken = createSessionToken('user_admin_bounds', 'admin.bounds@talentsphere.internal', [
      'platform_admin',
    ]);
  });

  it('refuses a body over 64 KB with 413', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      payload: { eventType: 'big', metadata: { blob: 'x'.repeat(100 * 1024) } },
    });
    expect(res.statusCode).toBe(413);
  });

  it('refuses metadata with more than 30 keys with 422', async () => {
    const metadata = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`k${i}`, i]));
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      payload: { eventType: 'wide', metadata },
    });
    expect(res.statusCode).toBe(422);
  });

  it('does not echo the address hash or user agent; the admin record keeps them', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { 'user-agent': 'bounds-test-agent' },
      payload: { eventType: 'echo_check', metadata: { path: '/x' } },
    });
    expect(res.statusCode).toBe(201);
    const event = JSON.parse(res.payload).events[0];
    expect(event.eventType).toBe('echo_check');
    expect(event).not.toHaveProperty('ipHash');
    expect(event).not.toHaveProperty('userAgent');

    const admin = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/events?eventType=echo_check',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const stored = JSON.parse(admin.payload).events[0];
    expect(stored.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.userAgent).toBe('bounds-test-agent');
  });

  it('limits one caller to 60 ingestion requests a minute', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 61; i++) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/analytics/events',
        remoteAddress: '203.0.113.7',
        payload: { eventType: 'rate_check' },
      });
      statuses.push(res.statusCode);
    }
    expect(statuses.slice(0, 60).every((s) => s === 201)).toBe(true);
    expect(statuses[60]).toBe(429);
  });
});

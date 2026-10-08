import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

// SSOT §27.1 ADR-009: dispatched background work must be durably observable
// with truthful state — queued work is never reported as completed, and the
// health endpoint never claims an operational queue it cannot reach.
describe('Background job observability', () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: 0, LOG_LEVEL: 'error' });
    await app.ready();
    adminToken = createSessionToken(
      '00000000-0000-4000-a000-000000000099',
      'admin.jobs@talentsphere.internal',
      ['platform_admin']
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  it('records dispatched events with truthful queued state and payload', async () => {
    const searchRes = await app.inject({
      method: 'GET',
      url: '/api/v1/search?query=typescript&type=all',
    });
    expect(searchRes.statusCode).toBe(200);

    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    expect(jobsRes.statusCode).toBe(200);
    const jobs = jobsRes.json().jobs as Array<{
      id: string;
      type: string;
      status: string;
      attempts: number;
      enqueuedAt: string;
      payload: Record<string, unknown>;
    }>;

    const dispatched = jobs.find((j) => j.type === 'search.queried');
    expect(dispatched).toBeDefined();
    expect(dispatched!.id).toMatch(/^[0-9a-f-]{36}$/);
    // Truthful language: nothing has claimed this job (memory mode has no
    // worker), so it must read queued with zero attempts — never "completed".
    expect(dispatched!.status).toBe('queued');
    expect(dispatched!.attempts).toBe(0);
    expect(dispatched!.enqueuedAt).toBeTruthy();
    expect(dispatched!.payload.query).toBe('typescript');
  });

  it('reports queue health truthfully under memory mode', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/health-diagnostics',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(200);
    const { diagnostics } = res.json();
    // Memory mode: the queue neither persists nor processes — degraded, not
    // a hardcoded "operational".
    expect(diagnostics.queue).toBe('degraded');
    // Active = queued + running, measured from the store, not a dead array.
    expect(diagnostics.activeJobsCount).toBeGreaterThanOrEqual(1);
  });
});

describe('Internal dispatch endpoint is hidden in production (least privilege)', () => {
  let prodApp: FastifyInstance;

  beforeAll(async () => {
    // STORAGE=memory keeps the boot independent of a live database while
    // exercising the production code path.
    prodApp = await buildApp({
      NODE_ENV: 'production',
      STORAGE: 'memory',
      PORT: 0,
      LOG_LEVEL: 'error',
    });
    await prodApp.ready();
  });

  afterAll(async () => {
    await prodApp?.close();
  });

  it('returns 404 for the internal worker-jobs route in production', async () => {
    const res = await prodApp.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
  });
});

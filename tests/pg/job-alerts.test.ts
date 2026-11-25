/**
 * Job alerts on real PostgreSQL (migration 00018; F-32, #48).
 * Proves an alert raised by publishing a matching job is written to SQL,
 * survives a restart, stays private to its candidate, keeps its read state,
 * and is removed by account erasure.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { PgJobAlertStore } from '../../apps/api/src/storage/job-alert-store.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for PostgreSQL job-alert tests.');
}

const dbName = `ts_pgalerts_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
const databaseUrl = withDb(baseUrl, dbName);
const boot = () =>
  buildApp({
    NODE_ENV: 'test',
    STORAGE: 'pg',
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: 'error',
    RATE_LIMIT_MAX_REQUESTS: '100000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
  } as never);

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
) {
  const response = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return {
    status: response.statusCode,
    data: response.body ? JSON.parse(response.body) : {},
    durability: response.headers['x-talentsphere-durability'],
  };
}

describe('Job-alert persistence and isolation', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;

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
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('keeps alerts and their read state across a restart, privately', async () => {
    const password = 'long-job-alert-test-passphrase';
    const register = async (email: string, role: 'candidate' | 'recruiter') => {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email,
        fullName: 'Alert Tester',
        password,
        role,
      });
      expect(res.status).toBe(201);
      return res.data as { token: string; user: { id: string } };
    };
    const owner = await register('alert-owner@example.org', 'candidate');
    const stranger = await register('alert-stranger@example.org', 'candidate');
    const recruiter = await register('alert-recruiter@example.org', 'recruiter');

    const search = await call(app, 'POST', '/api/v1/jobs/saved-searches', owner.token, {
      title: 'Remote platform roles',
      criteria: { query: 'Platform', workMode: 'remote' },
      alertFrequency: 'instant',
    });
    expect(search.status).toBe(201);
    const searchId = search.data.savedSearch.id as string;

    const org = await call(app, 'POST', '/api/v1/organizations', recruiter.token, {
      name: 'Alert Labs',
      slug: 'alert-labs',
      website: 'https://alert-labs.example',
    });
    expect(org.status).toBe(201);
    const job = await call(app, 'POST', '/api/v1/jobs', recruiter.token, {
      orgId: org.data.organization.id,
      title: 'Platform Engineer',
      description: 'Run the deployment platform.',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
    });
    expect(job.status).toBe(201);
    const jobId = job.data.job.id as string;
    const published = await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, recruiter.token, {
      status: 'published',
    });
    expect(published.status).toBe(200);

    // The publish wrote the alert row itself, not a process-local copy.
    const rows = await pool.query(
      'SELECT id, saved_search_id, job_id, is_read FROM public.job_alerts WHERE user_id = $1',
      [owner.user.id]
    );
    expect(rows.rows).toMatchObject([{ saved_search_id: searchId, job_id: jobId, is_read: false }]);
    const alertId = rows.rows[0].id as string;

    const listed = await call(app, 'GET', '/api/v1/jobs/alerts', owner.token);
    expect(listed.status).toBe(200);
    expect(listed.durability).toBeUndefined();
    expect(listed.data.alerts).toMatchObject([{ id: alertId, jobId, isRead: false }]);
    expect((await call(app, 'GET', '/api/v1/jobs/alerts', stranger.token)).data.total).toBe(0);
    expect(
      (await call(app, 'PATCH', `/api/v1/jobs/alerts/${alertId}/read`, stranger.token)).status
    ).toBe(403);
    expect(
      (await call(app, 'PATCH', '/api/v1/jobs/alerts/not-a-uuid/read', owner.token)).status
    ).toBe(404);
    expect(
      (await call(app, 'PATCH', `/api/v1/jobs/alerts/${crypto.randomUUID()}/read`, owner.token))
        .status
    ).toBe(404);

    // Restart: the alert is still there and can be marked read.
    await app.close();
    app = await boot();
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'alert-owner@example.org',
      password,
    });
    expect(login.status).toBe(200);
    const token = login.data.token as string;
    const reloaded = await call(app, 'GET', '/api/v1/jobs/alerts', token);
    expect(reloaded.data.alerts).toMatchObject([{ id: alertId, isRead: false }]);
    const read = await call(app, 'PATCH', `/api/v1/jobs/alerts/${alertId}/read`, token);
    expect(read.status).toBe(200);
    expect(read.data.alert).toMatchObject({ id: alertId, isRead: true });

    await app.close();
    app = await boot();
    const again = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'alert-owner@example.org',
      password,
    });
    const afterRestart = await call(app, 'GET', '/api/v1/jobs/alerts', again.data.token);
    expect(afterRestart.data.alerts).toMatchObject([{ id: alertId, isRead: true }]);

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', again.data.token, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    expect(
      (
        await pool.query('SELECT count(*)::int AS n FROM public.job_alerts WHERE user_id = $1', [
          owner.user.id,
        ])
      ).rows[0].n
    ).toBe(0);
  });

  it('drops an alert whose saved search is gone instead of failing the others', async () => {
    const store = new PgJobAlertStore(pool);
    const reg = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email: 'alert-race@example.org',
      fullName: 'Race Tester',
      password: 'long-job-alert-race-passphrase',
      role: 'candidate',
    });
    expect(reg.status).toBe(201);
    const userId = reg.data.user.id as string;
    const search = await call(app, 'POST', '/api/v1/jobs/saved-searches', reg.data.token, {
      title: 'Anything',
      criteria: { query: 'Engineer' },
      alertFrequency: 'instant',
    });
    const searchId = search.data.savedSearch.id as string;
    const job = await pool.query<{ id: string }>('SELECT id FROM public.jobs LIMIT 1');
    const jobId = job.rows[0].id;
    const now = new Date().toISOString();
    const alert = (savedSearchId: string) => ({
      id: crypto.randomUUID(),
      userId,
      savedSearchId,
      jobId,
      isRead: false,
      deliveredAt: now,
      createdAt: now,
    });
    const kept = alert(searchId);
    await store.createMany([kept, alert(crypto.randomUUID())]);
    expect((await store.listByUser(userId)).map((a) => a.id)).toEqual([kept.id]);
  });
});

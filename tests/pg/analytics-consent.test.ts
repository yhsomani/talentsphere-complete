/**
 * Analytics consent after a restart (C-10, A05-002), on real PostgreSQL.
 *
 * The analytics route used to read only the in-process settings cache, which
 * is filled by GET/PATCH /settings. After a restart an explicit opt-out
 * (showActivity: false) was forgotten and events were attributed again until
 * the user next opened Settings. The route now reads the stored setting
 * through, without creating a settings row for users who never saved one.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for the analytics consent tests.');
}

const dbName = `ts_pgconsent_${crypto.randomBytes(4).toString('hex')}`;
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

async function register(app: FastifyInstance, email: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: {
      email,
      password: 'long-enough-consent-password',
      fullName: 'Consent',
      role: 'candidate',
    },
  });
  expect(res.statusCode).toBe(201);
  const body = JSON.parse(res.body);
  return { token: body.token as string, userId: body.user.id as string };
}

const track = (app: FastifyInstance, token: string) =>
  app.inject({
    method: 'POST',
    url: '/api/v1/analytics/events',
    headers: { authorization: `Bearer ${token}` },
    payload: { eventType: 'page_viewed', metadata: { path: '/jobs' } },
  });

describe('Analytics consent survives a restart (C-10)', () => {
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

  it('keeps an explicit opt-out after the API restarts, without writing settings for others', async () => {
    const optedOut = await register(app, `consent.out.${Date.now()}@example.com`);
    const patched = await app.inject({
      method: 'PATCH',
      url: '/api/v1/settings',
      headers: { authorization: `Bearer ${optedOut.token}` },
      payload: { showActivity: false },
    });
    expect(patched.statusCode).toBe(200);
    const bystander = await register(app, `consent.default.${Date.now()}@example.com`);

    await app.close();
    app = await boot();

    const after = await track(app, optedOut.token);
    expect(after.statusCode).toBe(201);
    const event = JSON.parse(after.body).events[0];
    expect(event.isAnonymized).toBe(true);
    expect(event.userId).toBeUndefined();

    // A user who never saved settings keeps the default (consenting) and the
    // read-through does not create a settings row for them.
    const other = await track(app, bystander.token);
    expect(JSON.parse(other.body).events[0].userId).toBe(bystander.userId);
    const rows = await pool.query('SELECT 1 FROM public.user_settings WHERE user_id = $1', [
      bystander.userId,
    ]);
    expect(rows.rowCount).toBe(0);
  });
});

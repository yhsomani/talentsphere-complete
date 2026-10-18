/**
 * Saved-search CRUD on real PostgreSQL (migration 00018): no cache-only success.
 * Proves restart round-trip, owner isolation, update/delete, and account erasure.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) throw new Error('TEST_DATABASE_URL is required for PostgreSQL saved-search tests.');

const dbName = `ts_pgsaved_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => url.replace(/\\/[^/?]*(\\?|$)/, `/${name}$1`);
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
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
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

describe('Saved-search persistence and isolation', () => {
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

  it('persists real CRUD after restart without exposing a different user\'s searches', async () => {
    const password = 'long-saved-search-test-passphrase';
    const register = async (email: string) => {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email,
        fullName: 'Search Tester',
        password,
        role: 'candidate',
      });
      expect(res.status).toBe(201);
      return res.data as { token: string; user: { id: string } };
    };
    const owner = await register('saved-owner@example.org');
    const stranger = await register('saved-stranger@example.org');

    const created = await call(app, 'POST', '/api/v1/jobs/saved-searches', owner.token, {
      title: 'Remote platform roles',
      criteria: { query: 'Platform', workMode: 'remote' },
      alertFrequency: 'daily',
    });
    expect(created.status).toBe(201);
    expect(created.durability).toBeUndefined();
    const id = created.data.savedSearch.id as string;

    const persisted = await pool.query(
      'SELECT title, work_mode FROM public.saved_searches WHERE id = $1 AND user_id = $2',
      [id, owner.user.id]
    );
    expect(persisted.rows).toMatchObject([{ title: 'Remote platform roles', work_mode: 'remote' }]);
    expect((await call(app, 'GET', '/api/v1/jobs/saved-searches', stranger.token)).data.total).toBe(0);
    expect((await call(app, 'GET', `/api/v1/jobs/saved-searches/${id}`, stranger.token)).status).toBe(403);
    expect((await call(app, 'DELETE', `/api/v1/jobs/saved-searches/${id}`, stranger.token)).status).toBe(403);

    await app.close();
    app = await boot();
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'saved-owner@example.org',
      password,
    });
    expect(login.status).toBe(200);
    const token = login.data.token as string;

    const listed = await call(app, 'GET', '/api/v1/jobs/saved-searches', token);
    expect(listed.status).toBe(200);
    expect(listed.data.savedSearches).toHaveLength(1);
    const patched = await call(app, 'PATCH', `/api/v1/jobs/saved-searches/${id}`, token, {
      title: 'Remote developer roles',
    });
    expect(patched.status).toBe(200);
    expect(patched.data.savedSearch.title).toBe('Remote developer roles');
    expect((await pool.query('SELECT title FROM public.saved_searches WHERE id = $1', [id])).rows[0].title).toBe('Remote developer roles');

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', token);
    expect(erased.status).toBe(200);
    expect((await pool.query('SELECT count(*)::int AS n FROM public.saved_searches WHERE user_id = $1', [owner.user.id])).rows[0].n).toBe(0);
  });
});

/**
 * Password reset against real PostgreSQL (migration 00058, ADR-019).
 * Proves only the token hash is stored, a link works once even when two
 * requests race, and the new password survives a restart.
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
  throw new Error('TEST_DATABASE_URL is required for password reset tests.');
}

const dbName = `ts_pgreset_${crypto.randomBytes(4).toString('hex')}`;
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

type Json = Record<string, any>;
async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; data: Json; durability: unknown }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return {
    status: res.statusCode,
    data: res.body ? JSON.parse(res.body) : {},
    durability: res.headers['x-talentsphere-durability'],
  };
}

describe('Password reset persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const email = 'reset-pg@example.org';

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

  it('stores a hash, works once under a race and survives a restart', async () => {
    const registered = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email,
      password: 'original-reset-password',
      fullName: 'Reset Tester',
      role: 'candidate',
    });
    expect(registered.status).toBe(201);
    const userId = registered.data.user.id as string;

    const requested = await call(app, 'POST', '/api/v1/auth/password-reset/request', undefined, {
      email,
    });
    expect(requested.status).toBe(202);
    expect(requested.durability).toBeUndefined();
    const job = await pool.query<{ payload: { token: string } }>(
      `SELECT payload FROM public.background_jobs WHERE kind = 'auth.password_reset_requested'`
    );
    const token = job.rows[0].payload.token;
    const rows = await pool.query(
      'SELECT token_hash, used_at FROM public.password_reset_tokens WHERE user_id = $1',
      [userId]
    );
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0].token_hash).toBe(crypto.createHash('sha256').update(token).digest('hex'));
    expect(rows.rows[0].token_hash).not.toContain(token);
    expect(rows.rows[0].used_at).toBeNull();

    const results = await Promise.all([
      call(app, 'POST', '/api/v1/auth/password-reset/confirm', undefined, {
        token,
        newPassword: 'first-new-password',
      }),
      call(app, 'POST', '/api/v1/auth/password-reset/confirm', undefined, {
        token,
        newPassword: 'second-new-password',
      }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 422]);
    const winner = results[0].status === 200 ? 'first-new-password' : 'second-new-password';

    await app.close();
    app = await boot();
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email,
      password: winner,
    });
    expect(login.status).toBe(200);
    const used = await pool.query(
      'SELECT used_at FROM public.password_reset_tokens WHERE user_id = $1',
      [userId]
    );
    expect(used.rows[0].used_at).not.toBeNull();
  });
});

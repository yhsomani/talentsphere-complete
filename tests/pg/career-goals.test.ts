/**
 * Career goals against real PostgreSQL (plan TS-13, ADR-034, migration
 * 00066): the goal survives restarts, replacing it keeps when it was first
 * set, clearing it removes the row, and account erasure removes it.
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
  throw new Error('TEST_DATABASE_URL is required for career goal tests.');
}

const dbName = `ts_pggoals_${crypto.randomBytes(4).toString('hex')}`;
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
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; data: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return { status: res.statusCode, data: res.body ? JSON.parse(res.body) : {} };
}

describe('Career goal persistence (TS-13, migration 00066)', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const password = 'long-enough-goal-password';
  const email = 'aimer@goals-pg.example';
  let token: string;
  let userId: string;
  const restart = async () => {
    await app.close();
    app = await boot();
    token = (await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password })).data
      .token;
  };

  beforeAll(async () => {
    const root = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await root.connect();
    try {
      await root.query(`CREATE DATABASE ${dbName}`);
    } finally {
      await root.end();
    }
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl });
    app = await boot();
    const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email,
      password,
      fullName: 'Pg Aimer',
      role: 'candidate',
    });
    expect(res.status).toBe(201);
    userId = res.data.user.id;
    token = res.data.token;
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('keeps the goal across a restart, replaces it, and clears it', async () => {
    expect(
      (await call(app, 'PUT', '/api/v1/goals/mine', token, { title: ' Data  Engineer ' })).status
    ).toBe(200);
    await restart();
    let mine = await call(app, 'GET', '/api/v1/goals/mine', token);
    expect(mine.data.goal.title).toBe('Data Engineer');
    const firstSet = mine.data.goal.createdAt;

    await call(app, 'PUT', '/api/v1/goals/mine', token, { title: 'Backend Engineer' });
    await restart();
    mine = await call(app, 'GET', '/api/v1/goals/mine', token);
    expect(mine.data.goal).toMatchObject({ title: 'Backend Engineer', createdAt: firstSet });
    const row = (await pool.query('SELECT * FROM public.career_goals WHERE user_id = $1', [userId]))
      .rows[0];
    expect(row.title).toBe('Backend Engineer');

    expect((await call(app, 'DELETE', '/api/v1/goals/mine', token)).status).toBe(204);
    await restart();
    expect((await call(app, 'GET', '/api/v1/goals/mine', token)).data).toEqual({
      goal: null,
      plan: null,
    });
  });

  it('removes the goal with the account', async () => {
    await call(app, 'PUT', '/api/v1/goals/mine', token, { title: 'Data Engineer' });
    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', token, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    expect(
      (
        await pool.query('SELECT count(*)::int AS n FROM public.career_goals WHERE user_id = $1', [
          userId,
        ])
      ).rows[0].n
    ).toBe(0);
  });
});

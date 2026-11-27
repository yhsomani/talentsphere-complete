/**
 * The skill-signal ledger against real PostgreSQL (migration 00060, TS-07).
 * Proves signals are written with the evidence, retired rather than edited,
 * survive a restart, and are filled in at boot for evidence that has none.
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
  throw new Error('TEST_DATABASE_URL is required for skill-signal tests.');
}

const dbName = `ts_pgsignals_${crypto.randomBytes(4).toString('hex')}`;
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

const TS = '10000000-0000-4000-a000-000000000001';
const SQL = '10000000-0000-4000-a000-000000000003';

type Json = Record<string, any>;
async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST',
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

describe('Skill-signal ledger persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  const adminEmail = 'signals-admin-pg@example.org';
  const email = 'signals-pg@example.org';
  const password = 'long-enough-signal-test-password';

  const rows = async () =>
    (
      await pool.query(
        'SELECT source_ref, skill_id, rung, status FROM public.skill_signals ORDER BY created_at, status, skill_id'
      )
    ).rows;
  const login = async () =>
    (await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password })).data
      .token as string;
  const profile = async (token: string) =>
    (await call(app, 'GET', '/api/v1/skills/profile/me', token)).data.skills.map((s: Json) => [
      s.skillId,
      s.strongestRung,
      s.signalCount,
    ]);
  const addEvidence = async (token: string, title: string, skillIds: string[]) => {
    const res = await call(app, 'POST', '/api/v1/evidence', token, {
      type: 'project',
      title,
      description: 'Built and shipped.',
      source: 'github',
      provenance: 'https://example.com/repo',
      recencyDate: '2026-06-01',
      skillIds,
    });
    expect(res.status).toBe(201);
    return res.data.evidence.id as string;
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
    // A real platform admin: sessions are checked against the users table.
    await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email: adminEmail,
      password,
      fullName: 'Signal Admin',
      role: 'candidate',
    });
    await pool.query("UPDATE public.users SET roles = ARRAY['platform_admin'] WHERE email = $1", [
      adminEmail,
    ]);
    await app.close();
    app = await boot();
    admin = (
      await call(app, 'POST', '/api/v1/auth/login', undefined, { email: adminEmail, password })
    ).data.token;
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('writes signals with the evidence, retires them on change, and keeps them across a restart', async () => {
    const registered = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email,
      password,
      fullName: 'Signal Tester',
      role: 'candidate',
    });
    expect(registered.status).toBe(201);
    let token = registered.data.token as string;

    const id = await addEvidence(token, 'Deploy pipeline', [TS]);
    expect(await rows()).toEqual([
      { source_ref: id, skill_id: TS, rung: 'unverified', status: 'live' },
    ]);

    const verified = await call(app, 'POST', `/api/v1/evidence/${id}/verify`, admin, {
      verificationLevel: 'authority_verified',
    });
    expect(verified.status).toBe(200);
    expect(await rows()).toEqual([
      { source_ref: id, skill_id: TS, rung: 'unverified', status: 'superseded' },
      { source_ref: id, skill_id: TS, rung: 'authority_verified', status: 'live' },
    ]);

    await app.close();
    app = await boot();
    token = await login();
    expect(await profile(token)).toEqual([[TS, 'authority_verified', 1]]);

    const revoked = await call(app, 'POST', `/api/v1/evidence/${id}/revoke`, token, {
      reason: 'Posted to the wrong account.',
    });
    expect(revoked.status).toBe(200);
    const after = await rows();
    expect(after.filter((r) => r.status === 'live')).toEqual([]);
    expect(after.map((r) => r.status)).toEqual(['superseded', 'revoked']);
    expect(await profile(token)).toEqual([]);
  });

  it('fills in signals at boot for evidence that has none', async () => {
    let token = await login();
    const id = await addEvidence(token, 'Reporting warehouse', [SQL]);
    await pool.query('DELETE FROM public.skill_signals WHERE source_ref = $1', [id]);

    await app.close();
    app = await boot();
    token = await login();
    expect(await profile(token)).toEqual([[SQL, 'unverified', 1]]);
    const live = await pool.query(
      "SELECT skill_id FROM public.skill_signals WHERE source_ref = $1 AND status = 'live'",
      [id]
    );
    expect(live.rows).toEqual([{ skill_id: SQL }]);
  });
});

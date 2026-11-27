/**
 * Organization roles against real PostgreSQL (TS-04, ADR-032). Proves the
 * stored membership role, not just membership, decides access after a
 * restart, across two organizations.
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
  throw new Error('TEST_DATABASE_URL is required for organization role tests.');
}

const dbName = `ts_pgorgroles_${crypto.randomBytes(4).toString('hex')}`;
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
  method: 'GET' | 'POST' | 'PATCH',
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

describe('Organization roles persistence', () => {
  let app: FastifyInstance;
  const password = 'long-enough-org-role-password';
  const login = async (who: string) =>
    (
      await call(app, 'POST', '/api/v1/auth/login', undefined, {
        email: `${who}@orgroles-pg.example`,
        password,
      })
    ).data.token as string;
  const job = (token: string, orgId: string) =>
    call(app, 'POST', '/api/v1/jobs', token, {
      orgId,
      title: 'Persisted role job',
      description: 'A job used to test organization roles.',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
    });

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
    app = await boot();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('applies the stored role after a restart, per organization', async () => {
    const ids: Record<string, string> = {};
    let tokens: Record<string, string> = {};
    for (const who of ['ownerA', 'ownerB', 'dana']) {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email: `${who}@orgroles-pg.example`,
        password,
        fullName: who,
        role: 'recruiter',
      });
      expect(res.status).toBe(201);
      ids[who] = res.data.user.id;
      tokens[who] = res.data.token;
    }
    const orgA = (
      await call(app, 'POST', '/api/v1/organizations', tokens.ownerA, {
        name: 'Alpha Hiring',
        slug: 'alpha-hiring',
      })
    ).data.organization.id as string;
    const orgB = (
      await call(app, 'POST', '/api/v1/organizations', tokens.ownerB, {
        name: 'Beta Hiring',
        slug: 'beta-hiring',
      })
    ).data.organization.id as string;
    // Dana recruits for Alpha but is only a plain member of Beta.
    expect(
      (
        await call(app, 'POST', `/api/v1/organizations/${orgA}/members`, tokens.ownerA, {
          userId: ids.dana,
          role: 'recruiter',
        })
      ).status
    ).toBe(201);
    expect(
      (
        await call(app, 'POST', `/api/v1/organizations/${orgB}/members`, tokens.ownerB, {
          userId: ids.dana,
          role: 'member',
        })
      ).status
    ).toBe(201);

    await app.close();
    app = await boot();
    tokens = { dana: await login('dana') };

    expect((await job(tokens.dana, orgA)).status).toBe(201);
    expect((await job(tokens.dana, orgB)).status).toBe(403);
    expect((await call(app, 'GET', `/api/v1/organizations/${orgB}/jobs`, tokens.dana)).status).toBe(
      200
    );
    const mine = await call(app, 'GET', '/api/v1/organizations/mine', tokens.dana);
    expect(
      Object.fromEntries(mine.data.organizations.map((o: Json) => [o.id, o.membershipRole]))
    ).toEqual({ [orgA]: 'recruiter', [orgB]: 'member' });
  });
});

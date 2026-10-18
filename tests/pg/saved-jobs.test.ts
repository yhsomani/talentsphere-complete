/**
 * Saved-job bookmarks against real PostgreSQL (migration 00018).
 * Proves duplicate arbitration, isolation, restart and account erasure.
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
  throw new Error('TEST_DATABASE_URL is required for saved-job persistence tests.');
}

const dbName = `ts_pgbookmarks_${crypto.randomBytes(4).toString('hex')}`;
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
  method: 'GET' | 'POST' | 'DELETE',
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

describe('Saved-job bookmark persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const password = 'long-enough-bookmark-test-password';

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

  it('keeps owner-specific bookmarks across restart and erases them on account deletion', async () => {
    const register = async (email: string, role: 'candidate' | 'recruiter') => {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email,
        password,
        fullName: 'Bookmark Tester',
        role,
      });
      expect(res.status).toBe(201);
      return res.data as { token: string; user: { id: string } };
    };

    const recruiter = await register('bookmark-rec@example.org', 'recruiter');
    const owner = await register('bookmark-owner@example.org', 'candidate');
    const other = await register('bookmark-other@example.org', 'candidate');

    const org = await call(app, 'POST', '/api/v1/organizations', recruiter.token, {
      name: 'Bookmarks Organization',
      slug: 'bookmarks-organization',
    });
    expect(org.status).toBe(201);
    const job = await call(app, 'POST', '/api/v1/jobs', recruiter.token, {
      orgId: org.data.organization.id,
      title: 'Saved Job Engineer',
      description: 'Build and test resilient job bookmarks.',
      location: 'Remote',
    });
    expect(job.status).toBe(201);
    const jobId = job.data.job.id as string;
    const route = `/api/v1/jobs/${jobId}/save`;

    // Two concurrent requests may create only one bookmark.
    const responses = await Promise.all([
      call(app, 'POST', route, owner.token),
      call(app, 'POST', route, owner.token),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    const accepted = responses.find((response) => response.status === 201);
    expect(accepted?.durability).toBeUndefined();
    const savedId = accepted?.data.savedJob.id as string;

    expect((await call(app, 'DELETE', route, other.token)).status).toBe(404);
    expect((await call(app, 'GET', '/api/v1/jobs/saved', other.token)).data.total).toBe(0);
    const dbRows = await pool.query(
      'SELECT id FROM public.saved_jobs WHERE user_id = $1 AND job_id = $2',
      [owner.user.id, jobId]
    );
    expect(dbRows.rows).toHaveLength(1);
    expect(dbRows.rows[0].id).toBe(savedId);

    await app.close();
    app = await boot();
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'bookmark-owner@example.org',
      password,
    });
    expect(login.status).toBe(200);
    const token = login.data.token as string;

    const listed = await call(app, 'GET', '/api/v1/jobs/saved', token);
    expect(listed.status).toBe(200);
    expect(listed.durability).toBeUndefined();
    expect(listed.data.savedJobs).toHaveLength(1);
    expect(listed.data.jobs).toHaveLength(1);
    expect(listed.data.savedJobs[0].id).toBe(savedId);

    expect((await call(app, 'DELETE', route, token)).status).toBe(200);
    expect((await call(app, 'DELETE', route, token)).status).toBe(404);
    expect((await call(app, 'POST', route, token)).status).toBe(201);

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', token);
    expect(erased.status).toBe(200);
    const afterErasure = await pool.query(
      'SELECT count(*)::int AS n FROM public.saved_jobs WHERE user_id = $1',
      [owner.user.id]
    );
    expect(afterErasure.rows[0].n).toBe(0);

    expect((await call(app, 'POST', route, other.token)).status).toBe(201);
    const otherCount = await pool.query('SELECT count(*)::int AS n FROM public.saved_jobs');
    expect(otherCount.rows[0].n).toBe(1);
  });
});

/**
 * Profile imports against real PostgreSQL (plan TS-08, ADR-033, migration
 * 00065). Proves an import waiting for review, its confirmation and its
 * undo survive restarts with the records they made, that a lapsed import
 * is deleted at boot, and that account erasure removes every import.
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
  throw new Error('TEST_DATABASE_URL is required for import tests.');
}

const dbName = `ts_pgimports_${crypto.randomBytes(4).toString('hex')}`;
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
): Promise<{ status: number; data: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return { status: res.statusCode, data: res.body ? JSON.parse(res.body) : {} };
}

describe('Profile import persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const password = 'long-enough-import-password';
  const email = 'importer@imports-pg.example';
  let token: string;
  let userId: string;
  const login = async () => {
    token = (await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password })).data
      .token;
  };
  const restart = async () => {
    await app.close();
    app = await boot();
    await login();
  };
  const csv = 'company,title,start_date\nAcme,Engineer,2021-04\nBeta,Analyst,2019-01\n';

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
      fullName: 'Pg Importer',
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

  it('keeps an import through review, confirm and undo across restarts', async () => {
    const started = await call(app, 'POST', '/api/v1/imports', token, {
      source: 'csv_positions',
      content: csv,
    });
    expect(started.status).toBe(201);
    const id = started.data.import.id;
    const row = (await pool.query('SELECT * FROM public.import_batches WHERE id = $1', [id]))
      .rows[0];
    expect(row.owner_id).toBe(userId);
    expect(row.status).toBe('ready_for_review');
    // The file itself is not kept, only the parsed entries.
    expect(JSON.stringify(row)).not.toContain('company,title');

    await restart();
    const review = await call(app, 'GET', `/api/v1/imports/${id}`, token);
    expect(review.data.import.counts.suggestedAccept).toBe(2);
    const accept = review.data.import.items.map((i: Json) => ({ itemId: i.id }));
    const committed = await call(app, 'POST', `/api/v1/imports/${id}/commit`, token, { accept });
    expect(committed.status).toBe(200);
    expect(committed.data.added).toBe(2);

    await restart();
    const history = await call(app, 'GET', `/api/v1/candidates/${userId}/work-history`, token);
    expect(history.data.workHistories.map((h: Json) => h.importedFrom)).toEqual([
      'csv_positions',
      'csv_positions',
    ]);
    // A repeat after the restart finds both already on the profile.
    const again = await call(app, 'POST', '/api/v1/imports', token, {
      source: 'csv_positions',
      content: csv,
    });
    expect(again.data.import.counts.duplicates).toBe(2);

    const undone = await call(app, 'POST', `/api/v1/imports/${id}/undo`, token);
    expect(undone.status).toBe(200);
    await restart();
    expect((await call(app, 'GET', `/api/v1/imports/${id}`, token)).data.import.status).toBe(
      'undone'
    );
    expect(
      (await pool.query('SELECT count(*)::int AS n FROM public.verified_work_histories')).rows[0].n
    ).toBe(0);
  });

  it('deletes an unconfirmed import past its review window at boot', async () => {
    const started = await call(app, 'POST', '/api/v1/imports', token, {
      source: 'csv_skills',
      content: 'name\nTypeScript\n',
    });
    const id = started.data.import.id;
    await pool.query(
      "UPDATE public.import_batches SET review_expires_at = now() - interval '1 minute' WHERE id = $1",
      [id]
    );
    await restart();
    expect((await call(app, 'GET', `/api/v1/imports/${id}`, token)).status).toBe(404);
    expect(
      (await pool.query('SELECT count(*)::int AS n FROM public.import_batches WHERE id = $1', [id]))
        .rows[0].n
    ).toBe(0);
  });

  it('removes every import with the account', async () => {
    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', token, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    expect(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM public.import_batches WHERE owner_id = $1',
          [userId]
        )
      ).rows[0].n
    ).toBe(0);
  });
});

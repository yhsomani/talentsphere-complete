/**
 * Readiness and writer-lease loss on a REAL PostgreSQL (C-07, ADR-015).
 *
 * The API's single-writer guarantee is a session-level advisory lock on one
 * retained connection. When that session dies the API already refuses every
 * request (503); it now also tells the process entry point, which exits so
 * the supervisor restarts it. GET /ready reports the same state to a load
 * balancer. Requires TEST_DATABASE_URL. Run: pnpm test:pg.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for the writer-lease tests.');
}

const dbName = `ts_pglease_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
const databaseUrl = withDb(baseUrl, dbName);
const boot = (onWriterLeaseLost: () => void) =>
  buildApp(
    { NODE_ENV: 'test', STORAGE: 'pg', DATABASE_URL: databaseUrl, LOG_LEVEL: 'fatal' } as never,
    { onWriterLeaseLost }
  );

describe('Writer lease loss and readiness (C-07)', () => {
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
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('a normal close does not report the lease as lost', async () => {
    const lost = vi.fn();
    const app = await boot(lost);
    const ready = await app.inject({ method: 'GET', url: '/ready' });
    expect(ready.statusCode).toBe(200);
    expect(JSON.parse(ready.body)).toEqual({ status: 'ready' });
    expect(ready.headers['x-talentsphere-durability']).toBeUndefined();
    await app.close();
    expect(lost).not.toHaveBeenCalled();
  });

  it('killing the lease session reports the loss once and /ready answers 503', async () => {
    const lost = vi.fn();
    const app = await boot(lost);
    try {
      expect((await app.inject({ method: 'GET', url: '/ready' })).statusCode).toBe(200);
      const killed = await pool.query(
        `SELECT pg_terminate_backend(pid) AS ok FROM pg_locks
         WHERE locktype = 'advisory' AND classid = 718201 AND objid = 1 AND granted`
      );
      expect(killed.rowCount).toBe(1);
      await vi.waitFor(() => expect(lost).toHaveBeenCalled(), { timeout: 5000 });

      const ready = await app.inject({ method: 'GET', url: '/ready' });
      expect(ready.statusCode).toBe(503);
      // Any other request is refused the same way (existing onRequest guard).
      expect((await app.inject({ method: 'GET', url: '/api/v1/health' })).statusCode).toBe(503);
      expect(lost).toHaveBeenCalledTimes(1);
    } finally {
      await app.close();
    }
    expect(lost).toHaveBeenCalledTimes(1);
  });
});

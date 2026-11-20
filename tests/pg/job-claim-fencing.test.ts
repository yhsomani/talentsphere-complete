/**
 * Attempts fencing on the durable job store, against a REAL PostgreSQL.
 *
 * A worker paused past its lease must not be able to acknowledge or fail a job
 * another worker has since re-claimed. `attempts` (incremented on every claim)
 * is the fencing token; no schema change.
 *
 * Requires TEST_DATABASE_URL. Run: pnpm test:pg.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import { dropTestDatabase } from './test-db.js';
import { createPgJobStore, type JobStore } from '../../packages/domain/src/index.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for the pg suite');
}

const dbName = `ts_pgfence_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => url.replace(/\/[^/?]*(\?|$)/, `/${name}$1`);
const databaseUrl = withDb(baseUrl, dbName);

const outcome = (attempts: number) => ({
  disposition: 'retry' as const,
  error: 'boom',
  maxAttempts: 5,
  backoffMs: 100,
  attempts,
  fence: attempts,
});

describe('background_jobs attempts fencing (pg)', () => {
  let pool: pg.Pool;
  let store: JobStore;

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    await admin.query(`CREATE DATABASE ${dbName}`);
    await admin.end();
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl, max: 4 });
    store = createPgJobStore((sql, params) => pool.query(sql, params as unknown[]));
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  /** Worker A claims with a 1ms lease, it lapses, worker B re-claims (attempts 2). */
  async function reclaimed(kind: string) {
    const { job } = await store.enqueue({ kind, payload: {} });
    const [a] = await store.claim({ limit: 1, leaseMs: 1 });
    expect(a.id).toBe(job.id);
    expect(a.attempts).toBe(1);
    await new Promise((r) => setTimeout(r, 25));
    const [b] = await store.claim({ limit: 1, leaseMs: 60_000 });
    expect(b.id).toBe(job.id);
    expect(b.attempts).toBe(2);
    return job.id;
  }
  const statusOf = async (id: string) => (await store.list()).find((j) => j.id === id)?.status;

  it('refuses a stale complete and accepts the current holder', async () => {
    const id = await reclaimed('fence.complete');
    expect(await store.complete(id, 1)).toBe(false);
    expect(await statusOf(id)).toBe('running');
    expect(await store.complete(id, 2)).toBe(true);
    expect(await statusOf(id)).toBe('succeeded');
  });

  it('refuses a stale fail and accepts the current holder', async () => {
    const id = await reclaimed('fence.fail');
    expect(await store.fail(id, outcome(1))).toBeNull();
    expect(await statusOf(id)).toBe('running');
    expect((await store.fail(id, outcome(2)))?.status).toBe('queued');
  });

  it('keeps legacy complete(id) without a token working', async () => {
    const id = await reclaimed('fence.legacy');
    expect(await store.complete(id)).toBe(true);
  });

  // C-22: a job whose lease expires on its last allowed attempt (worker crash
  // or hang) is dead-lettered at claim time instead of being re-run forever.
  it('dead-letters a lease-expired job that has used its attempts, stripping secrets', async () => {
    await pool.query(
      "UPDATE public.background_jobs SET status = 'canceled' WHERE status IN ('queued', 'running')"
    );
    const { job } = await store.enqueue({
      kind: 'fence.dead',
      payload: { to: 'a@example.com', code: '123456', token: 'secret' },
    });
    for (let i = 1; i <= 3; i += 1) {
      const [claimed] = await store.claim({ limit: 1, leaseMs: 1, maxAttempts: 3 });
      expect(claimed.id).toBe(job.id);
      expect(claimed.attempts).toBe(i);
      await new Promise((r) => setTimeout(r, 25));
    }
    expect(await store.claim({ limit: 1, leaseMs: 1, maxAttempts: 3 })).toHaveLength(0);
    const record = (await store.list()).find((j) => j.id === job.id)!;
    expect(record.status).toBe('dead');
    expect(record.lockExpiresAt).toBeNull();
    expect(record.lastError).toMatch(/lease expired after 3 attempts/);
    expect(record.payload).toEqual({ to: 'a@example.com' });
  });
});

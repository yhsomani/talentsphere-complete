/**
 * Erasure-request store under concurrency, against a REAL PostgreSQL.
 *
 * beginExecution, create and cancel each run in their own transaction on their
 * own pooled connection. These tests race them and assert the invariants the
 * lifecycle depends on: at most one open request per user, and a cancelled
 * request is never resurrected as 'processing'.
 *
 * Requires TEST_DATABASE_URL. Run: pnpm test:pg.
 */
import {
  afterAll as baseAfterAll,
  beforeAll as baseBeforeAll,
  describe,
  expect,
  it as baseIt,
} from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import { DomainError, requestAccountErasure } from '../../packages/domain/src/index.js';
import { PgErasureRequestStore } from '../../apps/api/src/storage/erasure-store.js';
import { dropTestDatabase } from './test-db.js';

// DIAGNOSTIC: surface failures as GitHub annotations.
const emit = (where: string, err: unknown) => {
  const e = err as { stack?: string; message?: string; code?: string };
  const msg = `[${where}] code=${e?.code} ${String(e?.stack ?? err)}`
    .replace(/\r?\n/g, '%0A')
    .slice(0, 1500);
  console.log(`::error title=erasure-pg::${msg}`);
};
process.on('unhandledRejection', (e) => emit('unhandledRejection', e));
process.on('uncaughtException', (e) => emit('uncaughtException', e));
const wrap = <T extends (...a: never[]) => Promise<void>>(where: string, fn: T) =>
  (async (...a: never[]) => {
    try {
      await fn(...a);
    } catch (e) {
      emit(where, e);
      throw e;
    }
  }) as unknown as T;
const it = (name: string, fn: () => Promise<void>) => baseIt(name, wrap(name, fn));
const beforeAll = (fn: () => Promise<void>, t?: number) => baseBeforeAll(wrap('beforeAll', fn), t);
const afterAll = (fn: () => Promise<void>) => baseAfterAll(wrap('afterAll', fn));

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for the pg suite');
}

const dbName = `ts_pgerase_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => url.replace(/\/[^/?]*(\?|$)/, `/${name}$1`);
const databaseUrl = withDb(baseUrl, dbName);

// Each round races 2-3 calls, so a pool of 4 is enough; 8 rounds keep the
// shared CI service container (default max_connections) well clear of limits.
const ROUNDS = 8;
const POOL_MAX = 4;
const TEST_TIMEOUT = 60_000;
const OPEN = ['pending', 'grace_period', 'processing'];

describe('Erasure store concurrency on PostgreSQL', { timeout: TEST_TIMEOUT }, () => {
  let pool: pg.Pool;
  let store: PgErasureRequestStore;

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    await admin.query(`CREATE DATABASE ${dbName}`);
    await admin.end();
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl, max: POOL_MAX });
    // An idle client killed server-side must not become an unhandled 'error' event.
    pool.on('error', () => {});
    store = new PgErasureRequestStore(pool);
    const v = await pool.query("SELECT version() v, current_setting('max_connections') mc");
    console.log(`::notice title=erasure-pg-info::${v.rows[0].v} max_connections=${v.rows[0].mc}`);
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  async function newUser(): Promise<string> {
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO public.users (id, email, password_hash, roles)
       VALUES ($1, $2, 'not-a-real-hash', ARRAY['candidate'])`,
      [id, `erase-${id}@example.test`]
    );
    return id;
  }

  const rowsOf = async (userId: string) =>
    (
      await pool.query(
        'SELECT id, status, cancelled_at FROM public.data_erasure_requests WHERE user_id = $1',
        [userId]
      )
    ).rows as { id: string; status: string; cancelled_at: Date | null }[];

  /** Every rejection must be a defined DomainError, never a raw pg error. */
  function expectDomainErrors(results: PromiseSettledResult<unknown>[], codes: string[]) {
    for (const r of results) {
      if (r.status === 'rejected') {
        expect(r.reason).toBeInstanceOf(DomainError);
        expect(codes).toContain((r.reason as DomainError).code);
      }
    }
  }

  it('(a) two concurrent beginExecution calls leave exactly one processing row', async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const userId = await newUser();
      const now = new Date().toISOString();
      const results = await Promise.allSettled([
        store.beginExecution(userId, crypto.randomUUID(), now, 'hash-a'),
        store.beginExecution(userId, crypto.randomUUID(), now, 'hash-b'),
      ]);
      expectDomainErrors(results, ['CONFLICT']);
      expect(results.some((r) => r.status === 'fulfilled')).toBe(true);
      const rows = await rowsOf(userId);
      expect(rows).toHaveLength(1);
      expect(rows[0].status).toBe('processing');
    }
  });

  it('(a) concurrent beginExecution on an existing grace_period request reuses that row', async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const userId = await newUser();
      const request = requestAccountErasure(userId);
      await store.create(request);
      const now = new Date().toISOString();
      const results = await Promise.allSettled([
        store.beginExecution(userId, crypto.randomUUID(), now, 'hash-a'),
        store.beginExecution(userId, crypto.randomUUID(), now, 'hash-b'),
        store.beginExecution(userId, crypto.randomUUID(), now, 'hash-c'),
      ]);
      expectDomainErrors(results, ['CONFLICT']);
      const rows = await rowsOf(userId);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ id: request.id, status: 'processing' });
    }
  });

  it('(b) beginExecution racing cancel never overwrites a cancelled row to processing', async () => {
    const outcomes = { cancelled: 0, processing: 0 };
    for (let i = 0; i < ROUNDS; i++) {
      const userId = await newUser();
      const request = requestAccountErasure(userId);
      await store.create(request);
      const now = new Date().toISOString();
      const results = await Promise.allSettled([
        store.beginExecution(userId, crypto.randomUUID(), now, 'hash'),
        store.cancel(userId, request.id),
      ]);
      expectDomainErrors(results, ['CONFLICT', 'INVALID_STATE_TRANSITION']);
      const rows = await rowsOf(userId);
      // No row may be both cancelled-stamped and processing.
      for (const row of rows) {
        expect(row.status === 'cancelled').toBe(row.cancelled_at !== null);
      }
      expect(rows.filter((r) => OPEN.includes(r.status))).toHaveLength(1);
      const original = rows.find((r) => r.id === request.id)!;
      if (original.status === 'cancelled') {
        // cancel won: beginExecution must have created a fresh processing row.
        outcomes.cancelled++;
        expect(rows).toHaveLength(2);
        expect(rows.filter((r) => r.status === 'processing')).toHaveLength(1);
      } else {
        // beginExecution won: cancel must have been refused.
        outcomes.processing++;
        expect(original.status).toBe('processing');
        expect(rows).toHaveLength(1);
        const cancelResult = results[1];
        expect(cancelResult.status).toBe('rejected');
      }
    }
    expect(outcomes.cancelled + outcomes.processing).toBe(ROUNDS);
  });

  it('(c) create racing beginExecution never yields two open rows', async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const userId = await newUser();
      const request = requestAccountErasure(userId);
      const now = new Date().toISOString();
      const results = await Promise.allSettled([
        store.create(request),
        store.beginExecution(userId, crypto.randomUUID(), now, 'hash'),
      ]);
      expectDomainErrors(results, ['CONFLICT']);
      const rows = await rowsOf(userId);
      expect(rows.filter((r) => OPEN.includes(r.status))).toHaveLength(1);
      // beginExecution always succeeds here (it reuses or creates the open row).
      expect(results[1].status).toBe('fulfilled');
      expect(rows.some((r) => r.status === 'processing')).toBe(true);
    }
  });

  it('(c) concurrent create calls for one user leave exactly one open row', async () => {
    for (let i = 0; i < ROUNDS; i++) {
      const userId = await newUser();
      const results = await Promise.allSettled([
        store.create(requestAccountErasure(userId)),
        store.create(requestAccountErasure(userId)),
      ]);
      expectDomainErrors(results, ['CONFLICT']);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await rowsOf(userId)).toHaveLength(1);
    }
  });
});

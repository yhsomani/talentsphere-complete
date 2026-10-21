/**
 * Admin audit trail against real PostgreSQL (migration 00050, F-17 / BR-067).
 * Proves entries survive a restart (a fresh pool reads what the first wrote),
 * and that the event and actor filters apply in the database.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { AdminAuditLog } from '@talentsphere/domain';
import { PgAdminAuditStore } from '../../apps/api/src/storage/admin-audit-store.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for admin audit persistence tests.');
}

const dbName = `ts_pgaudit_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
const databaseUrl = withDb(baseUrl, dbName);

const entry = (over: Partial<AdminAuditLog>): AdminAuditLog => ({
  id: crypto.randomUUID(),
  eventName: 'USER_STATUS_UPDATED',
  actorId: crypto.randomUUID(),
  targetId: crypto.randomUUID(),
  targetType: 'user',
  metadata: { oldStatus: 'active', newStatus: 'suspended', reason: 'abuse report' },
  createdAt: new Date().toISOString(),
  ...over,
});

describe('admin audit log (pg)', () => {
  let pool: pg.Pool;
  let store: PgAdminAuditStore;
  const admin = crypto.randomUUID();
  const other = crypto.randomUUID();

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
    store = new PgAdminAuditStore(pool);
    await store.append(entry({ actorId: admin, createdAt: '2026-10-20T10:00:00.000Z' }));
    await store.append(
      entry({
        actorId: other,
        eventName: 'FEATURE_FLAG_UPDATED',
        targetType: 'feature_flag',
        metadata: { key: 'FEATURE_LMS', enabled: true },
        createdAt: '2026-10-21T10:00:00.000Z',
      })
    );
    await store.append(entry({ actorId: admin, createdAt: '2026-10-21T09:00:00.000Z' }));
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('returns entries newest first and keeps metadata and targets', async () => {
    // A second pool stands in for a restarted API process reading the same database.
    const freshPool = new pg.Pool({ connectionString: databaseUrl });
    let logs: AdminAuditLog[];
    try {
      logs = await new PgAdminAuditStore(freshPool).list({ limit: 50 });
    } finally {
      await freshPool.end();
    }
    expect(logs.map((l) => l.createdAt)).toEqual([
      '2026-10-21T10:00:00.000Z',
      '2026-10-21T09:00:00.000Z',
      '2026-10-20T10:00:00.000Z',
    ]);
    expect(logs[1].metadata).toEqual({
      oldStatus: 'active',
      newStatus: 'suspended',
      reason: 'abuse report',
    });
    expect(logs[1].targetType).toBe('user');
  });

  it('filters by actor and by event name in the database', async () => {
    const byActor = await store.list({ actorId: admin, limit: 50 });
    expect(byActor).toHaveLength(2);
    expect(byActor.every((l) => l.actorId === admin)).toBe(true);

    const byEvent = await store.list({ eventName: 'FEATURE_FLAG_UPDATED', limit: 50 });
    expect(byEvent).toHaveLength(1);
    expect(byEvent[0].targetType).toBe('feature_flag');
  });

  it('honours the limit', async () => {
    expect(await store.list({ limit: 1 })).toHaveLength(1);
  });
});

/**
 * Feature flags against real PostgreSQL (migration 00051, F-35).
 * Proves the migration seeds the platform defaults, an upsert changes the
 * stored flag, and a fresh pool (a restarted API) reads the change back.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import { PgFeatureFlagStore } from '../../apps/api/src/storage/feature-flag-store.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for feature flag persistence tests.');
}

const dbName = `ts_pgflags_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
const databaseUrl = withDb(baseUrl, dbName);

describe('feature flags (pg)', () => {
  let pool: pg.Pool;

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
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('starts with the platform defaults seeded by the migration', async () => {
    const flags = await new PgFeatureFlagStore(pool).list();
    expect(flags.map((f) => f.key)).toEqual([
      'FEATURE_AI_MATCHING',
      'FEATURE_CODE_ARENA',
      'FEATURE_LMS',
      'FEATURE_MESSAGING',
      'FEATURE_NOTIFICATIONS',
    ]);
    expect(flags.find((f) => f.key === 'FEATURE_AI_MATCHING')?.enabled).toBe(false);
  });

  it('persists an upsert so a restarted reader sees it', async () => {
    const store = new PgFeatureFlagStore(pool);
    const before = await store.get('FEATURE_AI_MATCHING');
    expect(before).toBeDefined();
    await store.upsert({
      ...before!,
      enabled: true,
      updatedAt: '2026-10-21T12:00:00.000Z',
    });

    const freshPool = new pg.Pool({ connectionString: databaseUrl });
    try {
      const after = await new PgFeatureFlagStore(freshPool).get('FEATURE_AI_MATCHING');
      expect(after?.enabled).toBe(true);
      expect(after?.updatedAt).toBe('2026-10-21T12:00:00.000Z');
    } finally {
      await freshPool.end();
    }
  });

  it('creates a new flag on first upsert and returns undefined for unknown keys', async () => {
    const store = new PgFeatureFlagStore(pool);
    expect(await store.get('FEATURE_NEW_THING')).toBeUndefined();
    await store.upsert({
      key: 'FEATURE_NEW_THING',
      enabled: false,
      description: 'test flag',
      createdAt: '2026-10-21T12:00:00.000Z',
      updatedAt: '2026-10-21T12:00:00.000Z',
    });
    expect((await store.get('FEATURE_NEW_THING'))?.description).toBe('test flag');
  });
});

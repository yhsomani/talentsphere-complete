/**
 * Notifications on a REAL PostgreSQL (migration 00044): they survive a
 * restart with their read state, erasure deletes the person's rows, and the
 * database accepts every notification type the domain can produce (00007
 * accepted 6 of 16).
 *
 * Requires TEST_DATABASE_URL. Run: pnpm test:pg.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { PgCoreStore } from '../../apps/api/src/storage/core-store.js';
import { NOTIFICATION_TYPES, createNotificationEntity } from '../../packages/domain/src/index.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for the pg suite');
}

const dbName = `ts_pgnotify_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => url.replace(/\/[^/?]*(\?|$)/, `/${name}$1`);
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
): Promise<{ status: number; body: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : {} };
}

let pool: pg.Pool;
const sql = async <T = Json>(query: string, params: unknown[] = []) =>
  (await pool.query(query, params)).rows as T[];

const PASSWORD = 'a-long-enough-passphrase';
async function register(app: FastifyInstance, email: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: PASSWORD,
    fullName: 'Notify Tester',
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}
const login = async (app: FastifyInstance, email: string) =>
  (await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password: PASSWORD })).body
    .token as string;

describe('Notifications on PostgreSQL', () => {
  let app: FastifyInstance;
  const ids: Json = {};

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
    app = await boot();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    await admin.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    await admin.end();
  });

  it('stores the notification in the same transaction as the event that caused it', async () => {
    const rec = await register(app, 'rec@acme.example', 'recruiter');
    const cand = await register(app, 'cand@example.org');
    ids.recProfile = rec.profile.id;
    ids.candProfile = cand.profile.id;
    const org = await call(app, 'POST', '/api/v1/organizations', rec.token, {
      name: 'Acme',
      slug: 'acme',
    });
    const job = await call(app, 'POST', '/api/v1/jobs', rec.token, {
      orgId: org.body.organization.id,
      title: 'Platform Engineer',
      description: 'Own the deployment platform.',
      location: 'Remote',
    });
    const jobId = job.body.job.id;
    await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, rec.token, { status: 'published' });
    const applied = await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, cand.token, {});
    const appId = applied.body.application.id;
    const moved = await call(app, 'POST', `/api/v1/applications/${appId}/transition`, rec.token, {
      applicationId: appId,
      targetState: 'in_review',
    });
    expect(moved.status).toBe(200);

    const rows = await sql(
      `SELECT recipient_id, type, title, is_read FROM notifications ORDER BY created_at`
    );
    expect(rows).toEqual([
      {
        recipient_id: rec.profile.id,
        type: 'application_received',
        title: 'New application: Platform Engineer',
        is_read: false,
      },
      {
        recipient_id: cand.profile.id,
        type: 'application_status',
        title: 'Platform Engineer: in review',
        is_read: false,
      },
    ]);
  });

  it('keeps notifications and their read state across a restart', async () => {
    const recToken = await login(app, 'rec@acme.example');
    const marked = await call(app, 'POST', '/api/v1/notifications/mark-read', recToken, {
      all: true,
    });
    expect(marked.body.markedCount).toBe(1);
    await call(app, 'PATCH', '/api/v1/notifications/preferences', recToken, {
      allowMessages: false,
    });

    await app.close();
    app = await boot();

    const rec = await call(
      app,
      'GET',
      '/api/v1/notifications',
      await login(app, 'rec@acme.example')
    );
    expect(rec.body.unreadCount).toBe(0);
    expect(rec.body.notifications[0]).toMatchObject({
      type: 'application_received',
      isRead: true,
    });
    expect(rec.body.notifications[0].readAt).toBeTruthy();
    const prefs = await call(
      app,
      'GET',
      '/api/v1/notifications/preferences',
      await login(app, 'rec@acme.example')
    );
    expect(prefs.body.preferences.allowMessages).toBe(false);

    const cand = await call(
      app,
      'GET',
      '/api/v1/notifications/summary',
      await login(app, 'cand@example.org')
    );
    expect(cand.body.unreadCount).toBe(1);
  });

  it('accepts every notification type the domain can produce', async () => {
    const store = new PgCoreStore(pool);
    await store.commit(
      NOTIFICATION_TYPES.map((type) => ({
        kind: 'notification' as const,
        value: createNotificationEntity({
          recipientId: ids.recProfile,
          type,
          title: `type ${type}`,
          body: 'drift check',
        }),
      }))
    );
    const rows = await sql<{ n: number }>(
      `SELECT count(*)::int AS n FROM notifications WHERE body = 'drift check'`
    );
    expect(rows[0].n).toBe(NOTIFICATION_TYPES.length);
  });

  it('erasure deletes every notification addressed to the person', async () => {
    const token = await login(app, 'cand@example.org');
    expect(
      (await sql(`SELECT 1 FROM notifications WHERE recipient_id = $1`, [ids.candProfile])).length
    ).toBeGreaterThan(0);
    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', token);
    expect(erased.status).toBe(200);
    expect(
      await sql(`SELECT 1 FROM notifications WHERE recipient_id = $1`, [ids.candProfile])
    ).toHaveLength(0);
    // ...and it stays that way after a restart.
    await app.close();
    app = await boot();
    expect(
      await sql(`SELECT 1 FROM notifications WHERE recipient_id = $1`, [ids.candProfile])
    ).toHaveLength(0);
  });
});

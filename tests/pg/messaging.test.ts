/**
 * Messaging on a REAL PostgreSQL (tables from migration 00006, written since
 * 2026-10-11): a conversation, its messages and each person's read position
 * survive a restart; a message and its notification commit together; a
 * retried send is one row; erasure deletes what the person wrote.
 *
 * Requires TEST_DATABASE_URL. Run: pnpm test:pg.
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
  throw new Error('TEST_DATABASE_URL is required for the pg suite');
}

const dbName = `ts_pgmsg_${crypto.randomBytes(4).toString('hex')}`;
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
    fullName: 'Message Tester',
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}
const login = async (app: FastifyInstance, email: string) =>
  (await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password: PASSWORD })).body
    .token as string;

describe('Messaging on PostgreSQL', () => {
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
    await call(app, 'PATCH', `/api/v1/jobs/${job.body.job.id}/status`, rec.token, {
      status: 'published',
    });
    await call(app, 'POST', `/api/v1/jobs/${job.body.job.id}/apply`, cand.token, {});
    ids.job = job.body.job.id;
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('stores the conversation, each message with its notification, and survives a restart', async () => {
    const rec = await login(app, 'rec@acme.example');
    const started = await call(app, 'POST', '/api/v1/threads', rec, {
      recipientId: ids.candProfile,
      subject: 'Platform Engineer',
      initialMessage: 'Are you free on Thursday?',
    });
    expect(started.status).toBe(201);
    ids.thread = started.body.thread.id;
    const cand = await login(app, 'cand@example.org');
    const replied = await call(app, 'POST', `/api/v1/threads/${ids.thread}/messages`, cand, {
      content: 'Thursday works.',
    });
    expect(replied.status).toBe(201);

    expect(
      await sql('SELECT content FROM messages WHERE thread_id = $1 ORDER BY created_at', [
        ids.thread,
      ])
    ).toEqual([{ content: 'Are you free on Thursday?' }, { content: 'Thursday works.' }]);
    expect(
      await sql(
        `SELECT recipient_id, title FROM notifications WHERE type = 'message' ORDER BY created_at`
      )
    ).toEqual([
      { recipient_id: ids.candProfile, title: 'New message from Message Tester' },
      { recipient_id: ids.recProfile, title: 'New message from Message Tester' },
    ]);

    // The recruiter has not read the reply yet; the candidate has read everything.
    await app.close();
    app = await boot();
    const recThreads = await call(
      app,
      'GET',
      '/api/v1/threads',
      await login(app, 'rec@acme.example')
    );
    expect(recThreads.body.threads).toHaveLength(1);
    expect(recThreads.body.threads[0]).toMatchObject({ id: ids.thread, unreadCount: 1 });
    expect(recThreads.body.threads[0].lastMessage.content).toBe('Thursday works.');

    // Reading is recorded, and holds across another restart.
    await call(app, 'GET', `/api/v1/threads/${ids.thread}`, await login(app, 'rec@acme.example'));
    await app.close();
    app = await boot();
    const after = await call(app, 'GET', '/api/v1/threads', await login(app, 'rec@acme.example'));
    expect(after.body.threads[0].unreadCount).toBe(0);
  });

  it('stores a retried send as one row', async () => {
    const rec = await login(app, 'rec@acme.example');
    const send = () =>
      call(app, 'POST', `/api/v1/threads/${ids.thread}/messages`, rec, {
        content: 'See you then.',
        clientMessageId: 'retry-1',
      });
    const results = await Promise.all([send(), send(), send()]);
    for (const r of results) expect([200, 201, 409]).toContain(r.status);
    expect(
      await sql(`SELECT 1 FROM messages WHERE thread_id = $1 AND client_message_id = 'retry-1'`, [
        ids.thread,
      ])
    ).toHaveLength(1);
  });

  it('two people starting a conversation at the same moment get one conversation', async () => {
    const rec = await login(app, 'rec@acme.example');
    for (let i = 0; i < 5; i++) {
      const other = await register(app, `race-${i}@example.org`);
      await call(app, 'POST', `/api/v1/jobs/${ids.job}/apply`, other.token, {});
      const [a, b] = await Promise.all([
        call(app, 'POST', '/api/v1/threads', rec, {
          recipientId: other.profile.id,
          initialMessage: 'Hello from the hiring team',
        }),
        call(app, 'POST', '/api/v1/threads', other.token, {
          recipientId: ids.recProfile,
          initialMessage: 'Hello from the candidate',
        }),
      ]);
      for (const r of [a, b]) expect([200, 201, 409]).toContain(r.status);
      const threads = await sql(
        `SELECT thread_id FROM thread_participants WHERE user_id = $1
         INTERSECT SELECT thread_id FROM thread_participants WHERE user_id = $2`,
        [ids.recProfile, other.profile.id]
      );
      expect(threads).toHaveLength(1);
    }
  });

  it('erasure deletes what the person wrote and their place in the conversation', async () => {
    const cand = await login(app, 'cand@example.org');
    expect((await call(app, 'POST', '/api/v1/settings/erasure/execute', cand)).status).toBe(200);
    expect(
      await sql('SELECT 1 FROM messages WHERE sender_id = $1', [ids.candProfile])
    ).toHaveLength(0);
    expect(
      await sql('SELECT 1 FROM thread_participants WHERE user_id = $1', [ids.candProfile])
    ).toHaveLength(0);
    // The recruiter's own messages remain, and it stays that way after a restart.
    await app.close();
    app = await boot();
    const view = await call(
      app,
      'GET',
      `/api/v1/threads/${ids.thread}`,
      await login(app, 'rec@acme.example')
    );
    expect(view.body.messages.map((m: Json) => m.content)).toEqual([
      'Are you free on Thursday?',
      'See you then.',
    ]);
  });
});

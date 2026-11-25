/**
 * Professional connections on real PostgreSQL (migrations 00010, 00057; F-09, #48).
 * Proves requests, accepts, rejects and removals are written to SQL and survive
 * a restart (including connections-only profile visibility), that a second
 * open request for the same pair is refused in either direction, that asking
 * again after a rejection works, and that account erasure removes the rows.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { PgConnectionStore } from '../../apps/api/src/storage/connection-store.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for PostgreSQL connection tests.');
}

const dbName = `ts_pgconn_${crypto.randomBytes(4).toString('hex')}`;
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

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
) {
  const response = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return {
    status: response.statusCode,
    data: response.body ? JSON.parse(response.body) : {},
    durability: response.headers['x-talentsphere-durability'],
  };
}

describe('Connection persistence', () => {
  let app: FastifyInstance;
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
    app = await boot();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  const password = 'long-connection-test-passphrase';
  const register = async (email: string) => {
    const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email,
      fullName: email.split('@')[0],
      password,
      role: 'candidate',
    });
    expect(res.status).toBe(201);
    return res.data as { token: string; user: { id: string } };
  };
  const login = async (email: string) => {
    const res = await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password });
    expect(res.status).toBe(200);
    return res.data.token as string;
  };
  const restart = async () => {
    await app.close();
    app = await boot();
  };
  const count = async (sql: string, params: unknown[]) =>
    (await pool.query<{ n: number }>(sql, params)).rows[0].n;

  it('keeps the network across restarts and refuses duplicate open requests', async () => {
    const ana = await register('ana@example.org');
    const ben = await register('ben@example.org');
    const cy = await register('cy@example.org');

    const sent = await call(app, 'POST', '/api/v1/connections/request', ana.token, {
      recipientId: ben.user.id,
      note: 'Met at the meetup.',
    });
    expect(sent.status).toBe(201);
    expect(sent.durability).toBeUndefined();
    const connectionId = sent.data.connection.id as string;
    expect(
      (
        await pool.query('SELECT status, note FROM public.connections WHERE id = $1', [
          connectionId,
        ])
      ).rows
    ).toEqual([{ status: 'pending', note: 'Met at the meetup.' }]);

    // The reverse direction is the same pair: refused while one is open.
    const reverse = await call(app, 'POST', '/api/v1/connections/request', ben.token, {
      recipientId: ana.user.id,
    });
    expect(reverse.status).toBe(409);

    await restart();
    const benToken = await login('ben@example.org');
    const pending = await call(app, 'GET', '/api/v1/connections?status=pending_received', benToken);
    expect(pending.data.connections).toMatchObject([{ id: connectionId, senderId: ana.user.id }]);
    const accepted = await call(
      app,
      'POST',
      `/api/v1/connections/${connectionId}/respond`,
      benToken,
      {
        action: 'accept',
      }
    );
    expect(accepted.status).toBe(200);

    await restart();
    const anaToken = await login('ana@example.org');
    const status = await call(app, 'GET', `/api/v1/connections/status/${ben.user.id}`, anaToken);
    expect(status.data).toMatchObject({ status: 'accepted', isConnected: true });
    expect(
      (await pool.query('SELECT accepted_at FROM public.connections WHERE id = $1', [connectionId]))
        .rows[0].accepted_at
    ).not.toBeNull();

    // A rejected request may be sent again; the closed row stays as history.
    const cyToken = await login('cy@example.org');
    const first = await call(app, 'POST', '/api/v1/connections/request', cyToken, {
      recipientId: ana.user.id,
    });
    expect(first.status).toBe(201);
    const rejected = await call(
      app,
      'POST',
      `/api/v1/connections/${first.data.connection.id}/respond`,
      anaToken,
      { action: 'reject' }
    );
    expect(rejected.status).toBe(200);
    const again = await call(app, 'POST', '/api/v1/connections/request', cyToken, {
      recipientId: ana.user.id,
    });
    expect(again.status).toBe(201);
    expect(
      await count(
        'SELECT count(*)::int AS n FROM public.connections WHERE sender_id = $1 AND recipient_id = $2',
        [cy.user.id, ana.user.id]
      )
    ).toBe(2);

    // Removal is durable too.
    const removed = await call(app, 'DELETE', `/api/v1/connections/${connectionId}`, anaToken);
    expect(removed.status).toBe(200);
    await restart();
    const after = await call(
      app,
      'GET',
      `/api/v1/connections/status/${ben.user.id}`,
      await login('ana@example.org')
    );
    expect(after.data.status).toBe('none');

    // Erasure deletes every row the person sent or received.
    const erased = await call(
      app,
      'POST',
      '/api/v1/settings/erasure/execute',
      await login('cy@example.org'),
      { currentPassword: password }
    );
    expect(erased.status).toBe(200);
    expect(
      await count(
        'SELECT count(*)::int AS n FROM public.connections WHERE sender_id = $1 OR recipient_id = $1',
        [cy.user.id]
      )
    ).toBe(0);
  });

  it('the database refuses a second open request for a pair, in either direction', async () => {
    const store = new PgConnectionStore(pool);
    const dee = await register('dee@example.org');
    const eve = await register('eve@example.org');
    const now = new Date().toISOString();
    const open = (senderId: string, recipientId: string) => ({
      id: crypto.randomUUID(),
      senderId,
      recipientId,
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    });
    const firstRequest = open(dee.user.id, eve.user.id);
    await store.insert(firstRequest);
    await expect(store.insert(open(eve.user.id, dee.user.id))).rejects.toMatchObject({
      code: 'CONFLICT',
    });
    // A stale write (someone else answered first) is a CONFLICT, not a lost update.
    await store.update(
      { ...firstRequest, status: 'accepted', updatedAt: new Date().toISOString() },
      now
    );
    await expect(
      store.update(
        { ...firstRequest, status: 'rejected', updatedAt: new Date().toISOString() },
        now
      )
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});

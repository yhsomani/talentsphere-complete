/**
 * Signing out ends the session on the server (OWASP ASVS V3.3.1). Before
 * 2026-10-11 sign-out deleted the browser's copy of the token and nothing
 * else, so anyone who had copied it kept a working session for up to 24
 * hours. That the ending survives a restart is checked against Postgres in
 * tests/pg/concurrency.test.ts.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { TEST_TOKEN_SECRET } from '../../test-secrets.mjs';

type Json = Record<string, any>;
const PASSWORD = 'a-long-enough-passphrase';

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

const sessionIdOf = (token: string) =>
  JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8')).sessionId;

describe('SEC: signing out ends the session on the server', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    } as never);
  });
  afterAll(() => app.close());

  const register = async (email: string) => {
    const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email,
      password: PASSWORD,
      fullName: 'Sign Out',
    });
    expect(res.status).toBe(201);
    return res.body as { token: string; user: { id: string; email: string } };
  };
  const login = async (email: string) =>
    (await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password: PASSWORD })).body
      .token as string;

  it('refuses the signed-out token from then on, and leaves the person’s other sessions alone', async () => {
    const laptop = await register('two-devices@example.org');
    const phone = await login('two-devices@example.org');

    const out = await call(app, 'POST', '/api/v1/auth/sign-out', laptop.token);
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ ended: true, message: 'Signed out.' });

    const reused = await call(app, 'GET', '/api/v1/auth/session', laptop.token);
    expect(reused.status).toBe(401);
    expect(reused.body.error.message).toBe('You signed out of this session. Sign in again.');
    // Every route, not just the session check.
    expect((await call(app, 'GET', '/api/v1/profile/me', laptop.token)).status).toBe(401);
    // Signing out twice is not an error the client must handle differently.
    expect((await call(app, 'POST', '/api/v1/auth/sign-out', laptop.token)).status).toBe(401);

    expect((await call(app, 'GET', '/api/v1/auth/session', phone)).status).toBe(200);
  });

  it('gives every token its own session id, even two issued in the same second', () => {
    const now = Date.now();
    const a = createSessionToken('u1', 'a@example.org', ['candidate'], undefined, now);
    const b = createSessionToken('u1', 'a@example.org', ['candidate'], undefined, now);
    expect(sessionIdOf(a)).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(sessionIdOf(a)).not.toBe(sessionIdOf(b));
  });

  it('lets a suspended account sign out', async () => {
    const user = await register('suspended-sign-out@example.org');
    const admin = createSessionToken(
      '00000000-0000-4000-a000-00000000ad77',
      'root@talentsphere.internal',
      ['platform_admin']
    );
    const suspended = await call(
      app,
      'PATCH',
      `/api/v1/admin/users/${user.user.id}/status`,
      admin,
      {
        status: 'suspended',
        reason: 'Policy review',
      }
    );
    expect(suspended.status).toBe(200);
    expect((await call(app, 'POST', '/api/v1/auth/sign-out', user.token)).body.ended).toBe(true);
    expect((await call(app, 'GET', '/api/v1/auth/session', user.token)).status).toBe(401);
  });

  it('says so when an older token (no session id) cannot be ended on the server', async () => {
    const user = await register('legacy-token@example.org');
    // A token in the format minted before 2026-10-11: no sessionId.
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(
      JSON.stringify({
        userId: user.user.id,
        email: user.user.email,
        roles: ['candidate'],
        issuedAt,
        expiresAt: issuedAt + 86400,
      })
    ).toString('base64url');
    const legacy = `${payload}.${crypto.createHmac('sha256', TEST_TOKEN_SECRET).update(payload).digest('base64url')}`;
    expect((await call(app, 'GET', '/api/v1/auth/session', legacy)).status).toBe(200);

    const out = await call(app, 'POST', '/api/v1/auth/sign-out', legacy);
    expect(out.status).toBe(200);
    expect(out.body.ended).toBe(false);
    expect(out.body.message).toContain('expires within 24 hours');
  });

  it('requires a session', async () => {
    expect((await call(app, 'POST', '/api/v1/auth/sign-out')).status).toBe(401);
    expect((await call(app, 'POST', '/api/v1/auth/sign-out-others')).status).toBe(401);
  });

  it('signing out of other devices ends every other session, keeps this device, and keeps the password', async () => {
    const here = await register('other-devices@example.org');
    const phone = await login('other-devices@example.org');
    const tablet = await login('other-devices@example.org');

    const res = await call(app, 'POST', '/api/v1/auth/sign-out-others', here.token);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Signed out of every other device. This one stays signed in.');
    const fresh = res.body.token as string;

    for (const ended of [phone, tablet]) {
      const refused = await call(app, 'GET', '/api/v1/auth/session', ended);
      expect(refused.status).toBe(401);
      expect(refused.body.error.message).toBe(
        'This session was ended from another device. Sign in again.'
      );
    }
    // This device carries on with the token it was handed; the one it sent is replaced.
    expect((await call(app, 'GET', '/api/v1/auth/session', fresh)).status).toBe(200);
    expect((await call(app, 'GET', '/api/v1/auth/session', here.token)).status).toBe(401);
    // The password did not change: signing in again works at once.
    const again = await login('other-devices@example.org');
    expect((await call(app, 'GET', '/api/v1/auth/session', again)).status).toBe(200);
  });

  it('lets a suspended account sign out of its other devices', async () => {
    const user = await register('suspended-others@example.org');
    const other = await login('suspended-others@example.org');
    const admin = createSessionToken(
      '00000000-0000-4000-a000-00000000ad78',
      'root@talentsphere.internal',
      ['platform_admin']
    );
    await call(app, 'PATCH', `/api/v1/admin/users/${user.user.id}/status`, admin, {
      status: 'suspended',
      reason: 'Policy review',
    });
    const res = await call(app, 'POST', '/api/v1/auth/sign-out-others', user.token);
    expect(res.status).toBe(200);
    expect((await call(app, 'GET', '/api/v1/auth/session', other)).status).toBe(401);
  });
});

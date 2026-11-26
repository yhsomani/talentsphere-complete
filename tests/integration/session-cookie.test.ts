import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import {
  cookieCsrfProblem,
  readCookie,
  sessionTokenOf,
} from '../../apps/api/src/session-cookie.js';

// Session cookie (ADR-019): an httpOnly cookie carries the session for the
// web app; Bearer still works; cookie-only writes need the CSRF header and an
// allowed Origin.
describe('Session cookie (ADR-019)', () => {
  let app: FastifyInstance;
  let cookie: string;
  let bearer: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
    });
    await app.ready();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cookie.candidate@example.com',
        password: 'Password123!Secure',
        fullName: 'Cookie Candidate',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    bearer = JSON.parse(res.body).token;
    const setCookie = String(res.headers['set-cookie']);
    expect(setCookie).toMatch(
      /^ts_session=[^;]+; Path=\/api; HttpOnly; SameSite=Lax; Max-Age=86400$/
    );
    // Not Secure outside deployed environments, so it works on http://localhost.
    expect(setCookie).not.toContain('Secure');
    cookie = setCookie.split(';')[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('signs in from the cookie alone for reads', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/session',
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('refuses a cookie-only write without the CSRF header', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/sign-out-others',
      headers: { cookie },
    });
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body).error.message).toContain('X-TalentSphere-CSRF');
  });

  it('refuses a cookie-only write from another origin, even with the header', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/sign-out-others',
      headers: { cookie, 'x-talentsphere-csrf': '1', origin: 'https://evil.example' },
    });
    expect(res.statusCode).toBe(403);
  });

  it('accepts a cookie write with the header from an allowed origin, and renews the cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/sign-out-others',
      headers: { cookie, 'x-talentsphere-csrf': '1', origin: 'http://localhost:5173' },
    });
    expect(res.statusCode).toBe(200);
    const renewed = String(res.headers['set-cookie']).split(';')[0];
    expect(renewed).toMatch(/^ts_session=.+/);
    expect(renewed).not.toBe(cookie);
    // The old cookie was ended with every other session.
    const old = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/session',
      headers: { cookie },
    });
    expect(old.statusCode).toBe(401);
    cookie = renewed;
    bearer = JSON.parse(res.body).token;
  });

  it('still accepts the Bearer header, with no CSRF header needed', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/sign-out',
      headers: { authorization: `Bearer ${bearer}` },
    });
    expect(res.statusCode).toBe(200);
    expect(String(res.headers['set-cookie'])).toContain(
      'ts_session=; Path=/api; HttpOnly; SameSite=Lax; Max-Age=0'
    );
  });

  it('parses cookies and picks the Bearer header first', () => {
    expect(readCookie('a=1; ts_session=abc%2Edef; b=2', 'ts_session')).toBe('abc.def');
    expect(readCookie('ts_session=', 'ts_session')).toBeNull();
    expect(readCookie(undefined, 'ts_session')).toBeNull();
    expect(sessionTokenOf({ authorization: 'Bearer x', cookie: 'ts_session=y' })).toEqual({
      token: 'x',
      via: 'bearer',
    });
    expect(sessionTokenOf({ cookie: 'ts_session=y' })).toEqual({ token: 'y', via: 'cookie' });
    expect(cookieCsrfProblem('GET', {}, [])).toBeNull();
    expect(cookieCsrfProblem('POST', { 'x-talentsphere-csrf': '1' }, [])).toBeNull();
  });
});

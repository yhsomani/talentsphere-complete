import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

// Password reset (ADR-019) through the API: the request answers the same way
// for unknown emails; a link works once, ends every session and does not sign
// anyone in.
describe('Password reset (ADR-019)', () => {
  let app: FastifyInstance;
  const email = 'reset.candidate@example.com';
  let oldToken: string;

  const resetJobs = async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/internal/worker-jobs' });
    return (
      JSON.parse(res.body).jobs as { type: string; payload: Record<string, string> }[]
    ).filter((j) => j.type === 'auth.password_reset_requested');
  };
  const request = (address: string) =>
    app.inject({
      method: 'POST',
      url: '/api/v1/auth/password-reset/request',
      payload: { email: address },
    });
  const confirm = (token: string, newPassword: string) =>
    app.inject({
      method: 'POST',
      url: '/api/v1/auth/password-reset/confirm',
      payload: { token, newPassword },
    });
  const login = (password: string) =>
    app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email, password } });

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    });
    await app.ready();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'Password123!Secure',
        fullName: 'Reset Candidate',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    oldToken = JSON.parse(res.body).token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers an unknown email exactly like a known one, and emails only the known one', async () => {
    const unknown = await request('nobody.here@example.com');
    const known = await request(email.toUpperCase());
    expect(unknown.statusCode).toBe(202);
    expect(known.statusCode).toBe(202);
    expect(unknown.body).toBe(known.body);
    const jobs = await resetJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0].payload.to).toBe(email);
    expect(jobs[0].payload.token).toBeTruthy();
  });

  it('refuses a token that is unknown, and a password that is too short', async () => {
    const bad = await confirm('not-a-real-token', 'BrandNewPassword1');
    expect(bad.statusCode).toBe(422);
    expect(JSON.parse(bad.body).error.message).toContain('not valid, has expired');
    const [job] = await resetJobs();
    const short = await confirm(job.payload.token, 'short');
    expect(short.statusCode).toBe(400);
  });

  it('sets the new password once, ends every session and clears the cookie', async () => {
    const [job] = await resetJobs();
    const res = await confirm(job.payload.token, 'BrandNewPassword1');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).token).toBeUndefined();
    expect(String(res.headers['set-cookie'])).toContain('ts_session=; Path=/api');

    const again = await confirm(job.payload.token, 'AnotherPassword2');
    expect(again.statusCode).toBe(422);

    const session = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/session',
      headers: { authorization: `Bearer ${oldToken}` },
    });
    expect(session.statusCode).toBe(401);
    expect((await login('Password123!Secure')).statusCode).toBe(401);
    expect((await login('BrandNewPassword1')).statusCode).toBe(200);
  });

  it("using one link ends the account's other unused links", async () => {
    await request(email);
    await request(email);
    const jobs = await resetJobs();
    const [older, newer] = jobs.slice(-2);
    expect((await confirm(newer.payload.token, 'ThirdPassword33')).statusCode).toBe(200);
    expect((await confirm(older.payload.token, 'FourthPassword44')).statusCode).toBe(422);
  });

  it('sends no more than three links an hour, with the same answer', async () => {
    // Three were already sent in this hour; the fourth is answered but not sent.
    const before = (await resetJobs()).length;
    const res = await request(email);
    expect(res.statusCode).toBe(202);
    expect((await resetJobs()).length).toBe(before);
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { MemoryAccountMetadataStore } from '../../apps/api/src/storage/account-store.js';

describe('Account erasure execute is resumable and idempotent', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      LOG_LEVEL: 'error',
    });
    await app.ready();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'resume.erasure@example.com',
        password: 'Password123!Secure',
        fullName: 'Resume Erasure',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    token = JSON.parse(res.body).token;
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  const execute = (bearer?: string) =>
    app.inject({
      method: 'POST',
      url: '/api/v1/settings/erasure/execute',
      headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
    });

  it('finishes an interrupted run on the next call, then returns the completed result', async () => {
    // The process "dies" after the core transaction, before the remaining steps.
    vi.spyOn(MemoryAccountMetadataStore.prototype, 'erase').mockRejectedValueOnce(
      new Error('simulated crash after core transaction')
    );
    const interrupted = await execute(token);
    expect(interrupted.statusCode).toBeGreaterThanOrEqual(500);

    // The account is already closed for every other route...
    const closed = await app.inject({
      method: 'GET',
      url: '/api/v1/profile/me',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(closed.statusCode).toBe(401);

    // ...but the same user's token can resume its own erasure.
    const resumed = await execute(token);
    expect(resumed.statusCode).toBe(200);
    const body = JSON.parse(resumed.body);
    expect(body.anonymizedHash).toHaveLength(64);

    // A further call is a no-op that returns the recorded result.
    const again = await execute(token);
    expect(again.statusCode).toBe(200);
    const againBody = JSON.parse(again.body);
    expect(againBody.anonymizedHash).toBe(body.anonymizedHash);
    expect(againBody.completedAt).toBeDefined();

    const jobs = JSON.parse(
      (await app.inject({ method: 'GET', url: '/api/v1/internal/worker-jobs' })).body
    ).jobs as Array<{ type: string }>;
    expect(jobs.filter((j) => j.type === 'gdpr.erasure.completed')).toHaveLength(1);
  });

  it('does not let an unauthenticated caller resume or re-read an erasure', async () => {
    expect((await execute()).statusCode).toBe(401);
  });

  const registerUser = async (email: string) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'Password123!Secure',
        fullName: 'Resume Test',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    return JSON.parse(res.body).token as string;
  };
  const login = async (email: string) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password: 'Password123!Secure' },
    });
    expect(res.statusCode).toBe(200);
    return JSON.parse(res.body).token as string;
  };
  const crashOnce = () =>
    vi
      .spyOn(MemoryAccountMetadataStore.prototype, 'erase')
      .mockRejectedValueOnce(new Error('simulated crash after core transaction'));

  it('refuses to resume with a signed-out (revoked) session', async () => {
    const email = 'resume.revoked@example.com';
    await registerUser(email);
    const revoked = await login(email);
    const live = await login(email);
    const out = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/sign-out',
      headers: { authorization: `Bearer ${revoked}` },
    });
    expect(out.statusCode).toBe(200);
    crashOnce();
    expect((await execute(live)).statusCode).toBeGreaterThanOrEqual(500);
    expect((await execute(revoked)).statusCode).toBe(401);
    expect((await execute(live)).statusCode).toBe(200);
  });

  it('refuses to resume with a session issued before sessionsValidAfter', async () => {
    const email = 'resume.cutoff@example.com';
    await registerUser(email);
    const older = await login(email);
    const others = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/sign-out-others',
      headers: { authorization: `Bearer ${older}` },
    });
    expect(others.statusCode).toBe(200);
    const fresh = JSON.parse(others.body).token as string;
    expect(fresh).toBeTruthy();
    crashOnce();
    // Wait until the cut-off has passed so `fresh` and later tokens are valid.
    await new Promise((r) => setTimeout(r, 1100));
    const fresher = await login(email);
    expect((await execute(fresher)).statusCode).toBeGreaterThanOrEqual(500);
    expect((await execute(older)).statusCode).toBe(401);
    expect((await execute(fresher)).statusCode).toBe(200);
  });

  it("does not let another user's token resume or read someone else's erasure", async () => {
    const victim = await registerUser('resume.victim@example.com');
    const other = await registerUser('resume.other@example.com');
    crashOnce();
    expect((await execute(victim)).statusCode).toBeGreaterThanOrEqual(500);
    // The other (healthy) account only ever erases itself, with its own hash.
    const own = await execute(other);
    expect(own.statusCode).toBe(200);
    const victimResume = await execute(victim);
    expect(victimResume.statusCode).toBe(200);
    expect(JSON.parse(victimResume.body).anonymizedHash).not.toBe(
      JSON.parse(own.body).anonymizedHash
    );
  });
});

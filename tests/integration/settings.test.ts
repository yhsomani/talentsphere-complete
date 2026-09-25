import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Account Settings, Privacy Control & GDPR Erasure Integration (F-15, §31, BR-06)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // Register a candidate user
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'maya.privacy@example.com',
        password: 'Password123!Secure',
        fullName: 'Maya Privacy Candidate',
        role: 'candidate',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    candidateToken = body.token;
    candidateUserId = body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated requests with 401 UNAUTHENTICATED', async () => {
    const resGet = await app.inject({
      method: 'GET',
      url: '/api/v1/settings',
    });
    expect(resGet.statusCode).toBe(401);

    const resPatch = await app.inject({
      method: 'PATCH',
      url: '/api/v1/settings',
      payload: { theme: 'dark' },
    });
    expect(resPatch.statusCode).toBe(401);
  });

  it('fetches default settings on initial access', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/settings',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.settings.userId).toBe(candidateUserId);
    expect(body.settings.theme).toBe('system');
    expect(body.settings.profileVisibility).toBe('public');
    expect(body.settings.showEmail).toBe(false);
    expect(body.settings.digestFrequency).toBe('daily');
    expect(body.settings.byoAiKey).toBeNull();
  });

  it('updates account settings and masks BYO AI keys in HTTP response', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/settings',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        theme: 'dark',
        showEmail: true,
        digestFrequency: 'weekly',
        byoAiKey: 'sk-antigravity-private-key-12345',
        profileVisibility: 'connections_only',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.settings.theme).toBe('dark');
    expect(body.settings.showEmail).toBe(true);
    expect(body.settings.digestFrequency).toBe('weekly');
    expect(body.settings.profileVisibility).toBe('connections_only');
    expect(body.settings.byoAiKey).toBe('••••••••'); // Masked for security

    // Verify profile privacy is synchronized
    const profileRes = await app.inject({
      method: 'GET',
      url: '/api/v1/profile/me',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(profileRes.statusCode).toBe(200);
    const profileBody = JSON.parse(profileRes.body);
    expect(profileBody.profile.privacy).toBe('connections_only');
  });

  it('compiles and returns GDPR Art 15 & 20 data portability archive', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/settings/export',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { format: 'json' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.exportRequest.status).toBe('completed');
    expect(body.exportRequest.format).toBe('json');
    expect(body.data.exportMetadata.subjectId).toBe(candidateUserId);
    expect(body.data.account.email).toBe('maya.privacy@example.com');
    expect(body.data.settings.theme).toBe('dark');
    expect(body.data.settings.byoAiKey).toBeUndefined(); // Sensitive key scrubbed

    // Check latest export endpoint
    const latestRes = await app.inject({
      method: 'GET',
      url: '/api/v1/settings/export/latest',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(latestRes.statusCode).toBe(200);
    const latestBody = JSON.parse(latestRes.body);
    expect(latestBody.latestExport.id).toBe(body.exportRequest.id);
  });

  it('manages GDPR Art 17 erasure request lifecycle: initiate, status, conflict, cancel', async () => {
    // 1. Request erasure
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/settings/erasure/request',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        reason: 'Relocating and closing account',
        confirm: true,
      },
    });

    expect(reqRes.statusCode).toBe(201);
    const reqBody = JSON.parse(reqRes.body);
    expect(reqBody.erasureRequest.status).toBe('grace_period');
    expect(reqBody.erasureRequest.userId).toBe(candidateUserId);
    expect(reqBody.erasureRequest.gracePeriodEndsAt).toBeDefined();
    const requestId = reqBody.erasureRequest.id;

    // 2. Check active erasure status
    const statusRes = await app.inject({
      method: 'GET',
      url: '/api/v1/settings/erasure/status',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(statusRes.statusCode).toBe(200);
    const statusBody = JSON.parse(statusRes.body);
    expect(statusBody.hasPendingErasure).toBe(true);
    expect(statusBody.activeRequest.id).toBe(requestId);

    // 3. Duplicate request should be rejected with 409 CONFLICT
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/settings/erasure/request',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { confirm: true },
    });
    expect(dupRes.statusCode).toBe(409);

    // 4. Cancel erasure within grace period
    const cancelRes = await app.inject({
      method: 'POST',
      url: '/api/v1/settings/erasure/cancel',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { requestId },
    });
    expect(cancelRes.statusCode).toBe(200);
    const cancelBody = JSON.parse(cancelRes.body);
    expect(cancelBody.erasureRequest.status).toBe('cancelled');

    // 5. Status should now report no pending erasure
    const afterCancelStatus = await app.inject({
      method: 'GET',
      url: '/api/v1/settings/erasure/status',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(afterCancelStatus.statusCode).toBe(200);
    const afterCancelBody = JSON.parse(afterCancelStatus.body);
    expect(afterCancelBody.hasPendingErasure).toBe(false);
  });

  it('executes logical anonymization & deactivation under §31.4 severance pattern', async () => {
    const execRes = await app.inject({
      method: 'POST',
      url: '/api/v1/settings/erasure/execute',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(execRes.statusCode).toBe(200);
    const execBody = JSON.parse(execRes.body);
    expect(execBody.anonymizedHash).toBeDefined();
    expect(execBody.anonymizedHash.length).toBe(64);

    // Verify profile is now anonymized and private
    const profileRes = await app.inject({
      method: 'GET',
      url: '/api/v1/profile/me',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(profileRes.statusCode).toBe(200);
    const profileBody = JSON.parse(profileRes.body);
    expect(profileBody.profile.fullName).toBe('Anonymized User');
    expect(profileBody.profile.privacy).toBe('private');

    // Verify async worker events were dispatched
    const workerRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    expect(workerRes.statusCode).toBe(200);
    const workerBody = JSON.parse(workerRes.body);
    const jobTypes = workerBody.jobs.map((j: any) => j.type);
    expect(jobTypes).toContain('user.settings.updated');
    expect(jobTypes).toContain('gdpr.data.exported');
    expect(jobTypes).toContain('gdpr.erasure.requested');
    expect(jobTypes).toContain('gdpr.erasure.cancelled');
    expect(jobTypes).toContain('gdpr.erasure.completed');
  });
});

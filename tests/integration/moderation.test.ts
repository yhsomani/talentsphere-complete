import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Trust, Safety & Moderation Integration Tests (F-24, BR-34, BR-68, BR-125, BR-154, WIT-008, WIT-013)', () => {
  let app: FastifyInstance;

  // Actors
  let reporterToken: string;
  let reporterId: string;

  let targetCandidateToken: string;
  let targetCandidateId: string;

  let bystanderToken: string;
  let bystanderId: string;

  const moderatorId = '00000000-0000-4000-a000-000000000077';
  let moderatorToken: string;

  const admin1Id = '00000000-0000-4000-a000-000000000088';
  let admin1Token: string;

  let admin2Id: string;
  let admin2Token: string;

  let createdReportId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Register reporter candidate
    const repRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'safety.reporter@example.com',
        password: 'Password123!Secure',
        fullName: 'Alice Vigilant',
        role: 'candidate',
      },
    });
    expect(repRes.statusCode).toBe(201);
    const repBody = JSON.parse(repRes.body);
    reporterToken = repBody.token;
    reporterId = repBody.user.id;

    // 2. Register target candidate
    const targetRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'abusive.target@example.com',
        password: 'Password123!Secure',
        fullName: 'Bad Actor Target',
        role: 'candidate',
      },
    });
    expect(targetRes.statusCode).toBe(201);
    const targetBody = JSON.parse(targetRes.body);
    targetCandidateToken = targetBody.token;
    targetCandidateId = targetBody.user.id;

    // 3. Register neutral bystander
    const byRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'bystander@example.com',
        password: 'Password123!Secure',
        fullName: 'Charlie Neutral',
        role: 'candidate',
      },
    });
    expect(byRes.statusCode).toBe(201);
    const byBody = JSON.parse(byRes.body);
    bystanderToken = byBody.token;
    bystanderId = byBody.user.id;

    // 4. Generate Moderator token
    moderatorToken = createSessionToken(
      moderatorId,
      'moderator@talentsphere.internal',
      ['moderator'],
      3600
    );

    // 5. Generate Admin 1 token
    admin1Token = createSessionToken(
      admin1Id,
      'admin1@talentsphere.internal',
      ['platform_admin'],
      3600
    );

    // 6. Register Admin 2 as real user and promote to platform_admin
    const admin2Res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'admin2@talentsphere.internal',
        password: 'Password123!Secure',
        fullName: 'Admin Two Approver',
        role: 'candidate',
      },
    });
    expect(admin2Res.statusCode).toBe(201);
    const admin2User = JSON.parse(admin2Res.body).user;
    admin2Id = admin2User.id;

    const promoteRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${admin2Id}/roles`,
      headers: {
        authorization: `Bearer ${admin1Token}`,
      },
      payload: {
        roles: ['platform_admin'],
      },
    });
    expect(promoteRes.statusCode).toBe(200);

    admin2Token = createSessionToken(
      admin2Id,
      'admin2@talentsphere.internal',
      ['platform_admin'],
      3600
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/moderation/scan (BR-125 Automated Abuse Screening)', () => {
    it('returns allow for safe professional description', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/scan',
        payload: {
          text: 'Passionate frontend developer experienced with Vue, React, and Accessible Web Design.',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.scanResult.isFlagged).toBe(false);
      expect(body.scanResult.suggestedAction).toBe('allow');
    });

    it('returns block for wire fraud / crypto scam keywords', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/scan',
        payload: {
          text: 'Send eth to get guaranteed returns in our 100x crypto investment pool!',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.scanResult.isFlagged).toBe(true);
      expect(body.scanResult.suggestedAction).toBe('block');
      expect(body.scanResult.matchedCategories).toContain('financial_scam');
    });
  });

  describe('POST /api/v1/moderation/reports & GET /api/v1/moderation/reports/my', () => {
    it('rejects unauthenticated report submission', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        payload: {
          targetType: 'user',
          targetId: targetCandidateId,
          reason: 'harassment',
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it('prohibits self-reporting (anti-self report invariant)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${reporterToken}`,
        },
        payload: {
          targetType: 'user',
          targetId: reporterId, // Reporting self
          reason: 'spam',
        },
      });

      expect(res.statusCode).toBe(422);
      const body = JSON.parse(res.body);
      expect(body.error.message).toContain('You cannot report your own profile.');
    });

    it('successfully submits a report for an abusive entity', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${reporterToken}`,
        },
        payload: {
          targetType: 'user',
          targetId: targetCandidateId,
          reason: 'harassment',
          details: 'Sent threatening direct messages in connection request.',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.report.id).toBeDefined();
      expect(body.report.status).toBe('pending');
      expect(body.report.severity).toBe('high');
      expect(body.report.targetId).toBe(targetCandidateId);
      createdReportId = body.report.id;
    });

    it('prevents duplicate active report for same target by same reporter', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${reporterToken}`,
        },
        payload: {
          targetType: 'user',
          targetId: targetCandidateId,
          reason: 'harassment',
          details: 'Another report for the same issue.',
        },
      });

      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('CONFLICT');
    });

    it('allows reporter to list their own submitted reports', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/moderation/reports/my',
        headers: {
          authorization: `Bearer ${reporterToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBe(1);
      expect(body.reports[0].id).toBe(createdReportId);
    });
  });

  describe('Moderator Queue: GET /api/v1/moderation/reports & PATCH /api/v1/moderation/reports/:id/status', () => {
    it('denies standard candidates from viewing the moderator queue', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${reporterToken}`,
        },
      });

      expect(res.statusCode).toBe(403);
    });

    it('allows moderator to inspect reports queue', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${moderatorToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBeGreaterThanOrEqual(1);
      const found = body.reports.find((r: any) => r.id === createdReportId);
      expect(found).toBeDefined();
    });

    it('denies unrelated user from fetching specific report details', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/moderation/reports/${createdReportId}`,
        headers: {
          authorization: `Bearer ${bystanderToken}`,
        },
      });

      expect(res.statusCode).toBe(403);
    });

    it('transitions report from pending to under_review', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/moderation/reports/${createdReportId}/status`,
        headers: {
          authorization: `Bearer ${moderatorToken}`,
        },
        payload: {
          status: 'under_review',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.report.status).toBe('under_review');
    });
  });

  describe('POST /api/v1/moderation/reports/:id/resolve (BR-068 Dual Admin Bans & WIT-013 Appeals)', () => {
    it('allows moderator to resolve report with suspension and opens 14-day appeal window', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${createdReportId}/resolve`,
        headers: {
          authorization: `Bearer ${moderatorToken}`,
        },
        payload: {
          action: 'user_suspended',
          resolutionNotes: 'Violated community guidelines with hostile language.',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.report.status).toBe('resolved');
      expect(body.report.actionTaken).toBe('user_suspended');
      expect(body.report.appealEligibleUntil).toBeDefined();
    });

    it('rejects permanent account ban when attempted by a single moderator', async () => {
      // Create a second report for a severe security violation
      const rep2Res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${bystanderToken}`,
        },
        payload: {
          targetType: 'user',
          targetId: targetCandidateId,
          reason: 'security_violation',
          details: 'Credential stuffing attack identified.',
        },
      });
      const rep2 = JSON.parse(rep2Res.body).report;

      // Moderator attempts ban
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${rep2.id}/resolve`,
        headers: {
          authorization: `Bearer ${moderatorToken}`,
        },
        payload: {
          action: 'user_banned',
          resolutionNotes: 'Banning user.',
        },
      });

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body).error.message).toContain('Platform Admin authority');
    });

    it('rejects permanent account ban by platform admin without second admin approver (WIT-008)', async () => {
      // Create fresh report
      const repRes = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${bystanderToken}`,
        },
        payload: {
          targetType: 'user',
          targetId: 'target-credential-thief',
          reason: 'security_violation',
          details: 'Confirmed phishing distributor.',
        },
      });
      const rep = JSON.parse(repRes.body).report;

      // Move to under review
      await app.inject({
        method: 'PATCH',
        url: `/api/v1/moderation/reports/${rep.id}/status`,
        headers: { authorization: `Bearer ${admin1Token}` },
        payload: { status: 'under_review' },
      });

      // Admin 1 attempts unilateral ban
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${rep.id}/resolve`,
        headers: { authorization: `Bearer ${admin1Token}` },
        payload: {
          action: 'user_banned',
          resolutionNotes: 'Permanent ban requested.',
        },
      });

      expect(res.statusCode).toBe(422);
      expect(JSON.parse(res.body).error.message).toContain('dual Platform Admin approval');
    });

    it('successfully bans account when dual distinct platform admins approve (BR-068, WIT-008)', async () => {
      const repRes = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: {
          authorization: `Bearer ${bystanderToken}`,
        },
        payload: {
          targetType: 'user',
          targetId: 'target-credential-thief-2',
          reason: 'security_violation',
          details: 'Confirmed phishing distributor with multiple reports.',
        },
      });
      const rep = JSON.parse(repRes.body).report;

      await app.inject({
        method: 'PATCH',
        url: `/api/v1/moderation/reports/${rep.id}/status`,
        headers: { authorization: `Bearer ${admin1Token}` },
        payload: { status: 'under_review' },
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${rep.id}/resolve`,
        headers: { authorization: `Bearer ${admin1Token}` },
        payload: {
          action: 'user_banned',
          resolutionNotes: 'Permanent ban approved by dual admins.',
          secondApproverId: admin2Id,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.report.status).toBe('resolved');
      expect(body.report.actionTaken).toBe('user_banned');
    });
  });

  describe('Appeals Lifecycle (POST /api/v1/moderation/reports/:id/appeal & Review)', () => {
    let appealId: string;

    it('allows penalized user to submit an appeal with reasoned justification', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${createdReportId}/appeal`,
        headers: {
          authorization: `Bearer ${targetCandidateToken}`,
        },
        payload: {
          reason: 'My account was accessed unauthorized from an external location. Security logs attached.',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.appeal.id).toBeDefined();
      expect(body.appeal.status).toBe('pending');
      appealId = body.appeal.id;
    });

    it('rejects appeal with insufficient reasoning (< 10 chars)', async () => {
      // Create another report to test validation
      const repRes = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: { authorization: `Bearer ${bystanderToken}` },
        payload: {
          targetType: 'job',
          targetId: 'job-short-test',
          reason: 'spam',
        },
      });
      const rep = JSON.parse(repRes.body).report;

      // Move to under review and resolve
      await app.inject({
        method: 'PATCH',
        url: `/api/v1/moderation/reports/${rep.id}/status`,
        headers: { authorization: `Bearer ${moderatorToken}` },
        payload: { status: 'under_review' },
      });

      await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${rep.id}/resolve`,
        headers: { authorization: `Bearer ${moderatorToken}` },
        payload: { action: 'warning', resolutionNotes: 'Spam warning issued.' },
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${rep.id}/appeal`,
        headers: { authorization: `Bearer ${bystanderToken}` },
        payload: {
          reason: 'Too brief',
        },
      });

      expect(res.statusCode).toBe(400); // Zod schema min(10)
    });

    it('allows moderator to inspect appeals queue', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/moderation/appeals',
        headers: {
          authorization: `Bearer ${moderatorToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBeGreaterThanOrEqual(1);
    });

    it('moderator reviews and upholds appeal to reverse adverse sanction', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/moderation/appeals/${appealId}/review`,
        headers: {
          authorization: `Bearer ${moderatorToken}`,
        },
        payload: {
          decision: 'upheld',
          decisionNotes: 'Compromised session confirmed. Reversing suspension and restoring profile.',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.appeal.status).toBe('upheld');
      expect(body.appeal.reviewedBy).toBe(moderatorId);
    });
  });
});

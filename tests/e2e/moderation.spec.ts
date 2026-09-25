import { test, expect } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Trust, Safety & Content Moderation (F-24, BR-34, BR-68, BR-125, BR-154, WIT-008, WIT-013)', () => {
  let reporterToken: string;
  let reporterId: string;

  let targetCandidateToken: string;
  let targetCandidateId: string;

  let moderatorToken: string;
  const moderatorId = '00000000-0000-4000-a000-000000000077';

  let admin1Token: string;
  const admin1Id = '00000000-0000-4000-a000-000000000088';

  let admin2Token: string;
  let admin2Id: string;

  let activeReportId: string;
  let activeAppealId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register reporter candidate
    const repRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.reporter.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'E2E Vigilant Reporter',
        role: 'candidate',
      },
    });
    expect(repRes.status()).toBe(201);
    const repData = await repRes.json();
    reporterToken = repData.token;
    reporterId = repData.user.id;

    // 2. Register target candidate
    const targetRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.abusive.target.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'E2E Suspicious Actor',
        role: 'candidate',
      },
    });
    expect(targetRes.status()).toBe(201);
    const targetData = await targetRes.json();
    targetCandidateToken = targetData.token;
    targetCandidateId = targetData.user.id;

    // 3. Register second admin and promote via admin1Token
    admin1Token = createSessionToken(admin1Id, 'admin1.moderation@talentsphere.internal', [
      'platform_admin',
    ]);

    const admin2RegRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.admin2.${Date.now()}@talentsphere.internal`,
        password: 'Password123!Secure',
        fullName: 'Admin Two CoApprover',
        role: 'candidate',
      },
    });
    expect(admin2RegRes.status()).toBe(201);
    const admin2Data = await admin2RegRes.json();
    admin2Id = admin2Data.user.id;

    const promoteRes = await request.patch(`${API_BASE}/admin/users/${admin2Id}/roles`, {
      headers: { authorization: `Bearer ${admin1Token}` },
      data: { roles: ['platform_admin'] },
    });
    expect(promoteRes.status()).toBe(200);

    admin2Token = createSessionToken(admin2Id, 'admin2.moderation@talentsphere.internal', [
      'platform_admin',
    ]);

    // 4. Generate Moderator token
    moderatorToken = createSessionToken(moderatorId, 'moderator.e2e@talentsphere.internal', [
      'moderator',
    ]);
  });

  test('scans user content for abuse prior to publication (BR-125)', async ({ request }) => {
    // 1. Safe text passes
    const safeRes = await request.post(`${API_BASE}/moderation/scan`, {
      data: {
        text: 'Staff Software Architect specializing in distributed event streams and TypeScript microservices.',
      },
    });
    expect(safeRes.status()).toBe(200);
    const safeData = await safeRes.json();
    expect(safeData.scanResult.isFlagged).toBe(false);
    expect(safeData.scanResult.suggestedAction).toBe('allow');

    // 2. Abusive financial scam text is blocked
    const scamRes = await request.post(`${API_BASE}/moderation/scan`, {
      data: {
        text: 'Join our telegram channel now! Guaranteed returns and send eth to get 10x multiplier!',
      },
    });
    expect(scamRes.status()).toBe(200);
    const scamData = await scamRes.json();
    expect(scamData.scanResult.isFlagged).toBe(true);
    expect(scamData.scanResult.suggestedAction).toBe('block');
    expect(scamData.scanResult.matchedCategories).toContain('financial_scam');
  });

  test('submits moderation reports, enforces anti-self reporting and anti-duplicate rules', async ({
    request,
  }) => {
    // 1. Anti-self report rejection
    const selfRes = await request.post(`${API_BASE}/moderation/reports`, {
      headers: { authorization: `Bearer ${reporterToken}` },
      data: {
        targetType: 'user',
        targetId: reporterId,
        reason: 'spam',
      },
    });
    expect(selfRes.status()).toBe(422);

    // 2. Legitimate report submission
    const repRes = await request.post(`${API_BASE}/moderation/reports`, {
      headers: { authorization: `Bearer ${reporterToken}` },
      data: {
        targetType: 'user',
        targetId: targetCandidateId,
        reason: 'harassment',
        details: 'Sent harassing messages following challenge submission.',
      },
    });
    expect(repRes.status()).toBe(201);
    const repData = await repRes.json();
    expect(repData.report.id).toBeDefined();
    expect(repData.report.status).toBe('pending');
    expect(repData.report.severity).toBe('high');
    activeReportId = repData.report.id;

    // 3. Duplicate active report prevention (BR-34)
    const dupRes = await request.post(`${API_BASE}/moderation/reports`, {
      headers: { authorization: `Bearer ${reporterToken}` },
      data: {
        targetType: 'user',
        targetId: targetCandidateId,
        reason: 'harassment',
        details: 'Duplicate submission attempt.',
      },
    });
    expect(dupRes.status()).toBe(409);

    // 4. View own submitted reports
    const myRes = await request.get(`${API_BASE}/moderation/reports/my`, {
      headers: { authorization: `Bearer ${reporterToken}` },
    });
    expect(myRes.status()).toBe(200);
    const myData = await myRes.json();
    expect(myData.total).toBe(1);
    expect(myData.reports[0].id).toBe(activeReportId);
  });

  test('moderator reviews queue, transitions lifecycle status (BR-34), and enforces sanctions', async ({
    request,
  }) => {
    // 1. Moderator lists queue
    const queueRes = await request.get(`${API_BASE}/moderation/reports`, {
      headers: { authorization: `Bearer ${moderatorToken}` },
    });
    expect(queueRes.status()).toBe(200);
    const queueData = await queueRes.json();
    expect(queueData.total).toBeGreaterThanOrEqual(1);

    // 2. Fetch report details
    const detailRes = await request.get(`${API_BASE}/moderation/reports/${activeReportId}`, {
      headers: { authorization: `Bearer ${moderatorToken}` },
    });
    expect(detailRes.status()).toBe(200);

    // 3. Transition to under_review
    const statusRes = await request.patch(
      `${API_BASE}/moderation/reports/${activeReportId}/status`,
      {
        headers: { authorization: `Bearer ${moderatorToken}` },
        data: { status: 'under_review' },
      }
    );
    expect(statusRes.status()).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.report.status).toBe('under_review');

    // 4. Resolve with user suspension and verify 14-day appeal window is opened (WIT-013)
    const resolveRes = await request.post(
      `${API_BASE}/moderation/reports/${activeReportId}/resolve`,
      {
        headers: { authorization: `Bearer ${moderatorToken}` },
        data: {
          action: 'user_suspended',
          resolutionNotes:
            'Violated Terms of Service Section 4 (Harassment). Temporary 14-day account suspension.',
        },
      }
    );
    expect(resolveRes.status()).toBe(200);
    const resolveData = await resolveRes.json();
    expect(resolveData.report.status).toBe('resolved');
    expect(resolveData.report.actionTaken).toBe('user_suspended');
    expect(resolveData.report.appealEligibleUntil).toBeDefined();
  });

  test('enforces dual-human platform admin approval for permanent account bans (BR-068, WIT-008)', async ({
    request,
  }) => {
    // 1. Create a separate critical security report
    const secRepRes = await request.post(`${API_BASE}/moderation/reports`, {
      headers: { authorization: `Bearer ${reporterToken}` },
      data: {
        targetType: 'user',
        targetId: targetCandidateId,
        reason: 'security_violation',
        details: 'Attempted SQL injection exploit payloads via profile fields.',
      },
    });
    expect(secRepRes.status()).toBe(201);
    const secReportId = (await secRepRes.json()).report.id;

    // Move to under review
    await request.patch(`${API_BASE}/moderation/reports/${secReportId}/status`, {
      headers: { authorization: `Bearer ${admin1Token}` },
      data: { status: 'under_review' },
    });

    // 2. Moderator attempts permanent ban -> 403 Forbidden
    const modBanRes = await request.post(`${API_BASE}/moderation/reports/${secReportId}/resolve`, {
      headers: { authorization: `Bearer ${moderatorToken}` },
      data: {
        action: 'user_banned',
        resolutionNotes: 'Banning user.',
      },
    });
    expect(modBanRes.status()).toBe(403);

    // 3. Platform Admin 1 attempts unilateral ban without second approver -> 422 Policy Violation
    const unilatBanRes = await request.post(
      `${API_BASE}/moderation/reports/${secReportId}/resolve`,
      {
        headers: { authorization: `Bearer ${admin1Token}` },
        data: {
          action: 'user_banned',
          resolutionNotes: 'Unilateral permanent ban request.',
        },
      }
    );
    expect(unilatBanRes.status()).toBe(422);

    // 4. Platform Admin 1 executes ban with Platform Admin 2 co-approval -> 200 OK
    const dualBanRes = await request.post(`${API_BASE}/moderation/reports/${secReportId}/resolve`, {
      headers: { authorization: `Bearer ${admin1Token}` },
      data: {
        action: 'user_banned',
        resolutionNotes: 'Permanent ban approved by dual distinct platform admins.',
        secondApproverId: admin2Id,
      },
    });
    expect(dualBanRes.status()).toBe(200);
    const dualBanData = await dualBanRes.json();
    expect(dualBanData.report.status).toBe('resolved');
    expect(dualBanData.report.actionTaken).toBe('user_banned');
  });

  test('executes appeals lifecycle: submission, queue inspection, and moderator review (WIT-013, BR-154)', async ({
    request,
  }) => {
    // 1. Penalized user submits appeal within the 14-day appeal window
    const appealRes = await request.post(
      `${API_BASE}/moderation/reports/${activeReportId}/appeal`,
      {
        headers: { authorization: `Bearer ${targetCandidateToken}` },
        data: {
          reason:
            'My account was accessed unauthorized from a public computer; I have reset my password and enabled MFA.',
        },
      }
    );
    expect(appealRes.status()).toBe(201);
    const appealData = await appealRes.json();
    expect(appealData.appeal.id).toBeDefined();
    expect(appealData.appeal.status).toBe('pending');
    activeAppealId = appealData.appeal.id;

    // 2. Moderator views appeals queue
    const queueRes = await request.get(`${API_BASE}/moderation/appeals`, {
      headers: { authorization: `Bearer ${moderatorToken}` },
    });
    expect(queueRes.status()).toBe(200);
    const queueData = await queueRes.json();
    expect(queueData.total).toBeGreaterThanOrEqual(1);

    // 3. Moderator upholds appeal and restores candidate profile
    const reviewRes = await request.post(
      `${API_BASE}/moderation/appeals/${activeAppealId}/review`,
      {
        headers: { authorization: `Bearer ${moderatorToken}` },
        data: {
          decision: 'upheld',
          decisionNotes:
            'Confirmed foreign IP intrusion during incident window. Reversing suspension and restoring account.',
        },
      }
    );
    expect(reviewRes.status()).toBe(200);
    const reviewData = await reviewRes.json();
    expect(reviewData.appeal.status).toBe('upheld');
    expect(reviewData.appeal.reviewedBy).toBe(moderatorId);
  });
});

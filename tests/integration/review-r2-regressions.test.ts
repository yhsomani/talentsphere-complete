import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { createChallenge } from '../helpers/content.js';

/**
 * Regression tests for the second review round (R2-2, R2-3, R2-7, R2-8).
 * Each finding was fixed in apps/api/src/server.ts without a dedicated test;
 * these fail if the fix is reverted.
 */
describe('Review round 2 regressions (R2-2, R2-3, R2-7, R2-8)', () => {
  let app: FastifyInstance;

  const PASSWORD = 'Password123!Secure';
  const adminAId = '00000000-0000-4000-a000-000000000201';
  const adminBId = '00000000-0000-4000-a000-000000000202';
  const moderatorId = '00000000-0000-4000-a000-000000000203';
  let adminAToken: string;
  let adminBToken: string;
  let moderatorToken: string;

  async function register(email: string, fullName: string, role: string) {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password: PASSWORD, fullName, role },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    return { token: body.token as string, id: body.user.id as string };
  }

  async function reportUser(token: string, targetId: string, details: string) {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/moderation/reports',
      headers: { authorization: `Bearer ${token}` },
      payload: { targetType: 'user', targetId, reason: 'harassment', details },
    });
    expect(res.statusCode).toBe(201);
    return JSON.parse(res.body).report.id as string;
  }

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    });
    await app.ready();
    adminAToken = createSessionToken(adminAId, 'r2.admin-a@talentsphere.internal', [
      'platform_admin',
    ]);
    adminBToken = createSessionToken(adminBId, 'r2.admin-b@talentsphere.internal', [
      'platform_admin',
    ]);
    moderatorToken = createSessionToken(moderatorId, 'r2.moderator@talentsphere.internal', [
      'moderator',
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // R2-2: a candidate who classifies themselves as stealth must not appear in
  // recruiter talent listings. Before the fix only a settings flag was read,
  // and nothing ever wrote it.
  it('R2-2: a self-declared stealth candidate is hidden from recruiter talent listings', async () => {
    const stealth = await register('r2.stealth@example.com', 'Sam Stealth', 'candidate');
    const visible = await register('r2.visible@example.com', 'Vee Visible', 'candidate');
    const recruiter = await register('r2.recruiter@example.com', 'Rhea Recruiter', 'recruiter');

    const classify = (token: string, isStealthMode: boolean) =>
      app.inject({
        method: 'POST',
        url: '/api/v1/recruiter/talent-segmentation/classify',
        headers: { authorization: `Bearer ${token}` },
        payload: { isStealthMode },
      });
    expect((await classify(stealth.token, true)).statusCode).toBe(200);
    expect((await classify(visible.token, false)).statusCode).toBe(200);

    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/candidates',
      headers: { authorization: `Bearer ${recruiter.token}` },
    });
    expect(listRes.statusCode).toBe(200);
    const ids = JSON.parse(listRes.body).candidates.map(
      (c: { candidateId: string }) => c.candidateId
    );

    // Control: the non-stealth candidate is listed, so the empty-list case is ruled out.
    expect(ids).toContain(visible.id);
    expect(ids).not.toContain(stealth.id);
  });

  // R2-3: the subject of a decision sees it for appeal, but not who reported
  // them, the reporter's words, or the moderator who decided.
  it('R2-3: reports/my shows the subject only resolved decisions, with reporter and moderator withheld', async () => {
    const reporter = await register('r2.reporter@example.com', 'Rory Reporter', 'candidate');
    const subject = await register('r2.subject@example.com', 'Sid Subject', 'candidate');
    const bystander = await register('r2.bystander@example.com', 'Bo Bystander', 'candidate');

    const resolvedId = await reportUser(reporter.token, subject.id, 'Hostile messages.');
    await reportUser(bystander.token, subject.id, 'Still pending, must stay hidden.');

    const resolveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/moderation/reports/${resolvedId}/resolve`,
      headers: { authorization: `Bearer ${moderatorToken}` },
      payload: { action: 'user_suspended', resolutionNotes: 'Hostile language confirmed.' },
    });
    expect(resolveRes.statusCode).toBe(200);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/moderation/reports/my',
      headers: { authorization: `Bearer ${subject.token}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.aboutMe.map((r: { id: string }) => r.id)).toEqual([resolvedId]);
    const [entry] = body.aboutMe;
    expect(entry.reporterId).toBeUndefined();
    expect(entry.details).toBeUndefined();
    expect(entry.resolvedBy).toBeUndefined();
    expect(res.body).not.toContain(reporter.id);
    expect(res.body).not.toContain(moderatorId);
  });

  // R2-7: a ban proposal lapses after a day. Otherwise an old proposal would
  // let a second admin's single confirmation execute a ban nobody re-proposed.
  it('R2-7: an expired ban proposal does not count toward a later confirmation', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-01T09:00:00Z'));

    const subject = await register('r2.ban-subject@example.com', 'Bea Banned', 'candidate');
    const reporter = await register('r2.ban-reporter@example.com', 'Ben Reporter', 'candidate');
    const reportId = await reportUser(reporter.token, subject.id, 'Phishing links.');

    const move = await app.inject({
      method: 'PATCH',
      url: `/api/v1/moderation/reports/${reportId}/status`,
      headers: { authorization: `Bearer ${adminAToken}` },
      payload: { status: 'under_review' },
    });
    expect(move.statusCode).toBe(200);

    const ban = (token: string) =>
      app.inject({
        method: 'POST',
        url: `/api/v1/moderation/reports/${reportId}/resolve`,
        headers: { authorization: `Bearer ${token}` },
        payload: { action: 'user_banned', resolutionNotes: 'Permanent ban requested.' },
      });

    // Admin A proposes; the report is not resolved yet.
    const proposed = await ban(adminAToken);
    expect(proposed.statusCode).toBe(202);
    expect(JSON.parse(proposed.body).pendingApproval).toBe(true);

    // A day and more later the proposal has lapsed. Admin B's call must start
    // a fresh proposal, not execute the ban.
    vi.setSystemTime(new Date('2026-10-02T10:00:00Z'));
    const afterExpiry = await ban(adminBToken);
    expect(afterExpiry.statusCode).toBe(202);
    expect(JSON.parse(afterExpiry.body).pendingApproval).toBe(true);
    expect(JSON.parse(afterExpiry.body).report.status).not.toBe('resolved');

    // Admin A confirms Admin B's fresh proposal: now it executes.
    const confirmed = await ban(adminAToken);
    expect(confirmed.statusCode).toBe(200);
    expect(JSON.parse(confirmed.body).report.status).toBe('resolved');
    expect(JSON.parse(confirmed.body).report.actionTaken).toBe('user_banned');
  });

  // R2-8: resubmitting a passed challenge stores one evidence record, and the
  // response returns that stored record rather than an unsaved new id.
  it('R2-8: a repeat pass of the same challenge returns the stored evidence, not a new one', async () => {
    const candidate = await register('r2.challenge@example.com', 'Cy Challenger', 'candidate');
    const challengeId = (await createChallenge(app)).id;

    const submit = () =>
      app.inject({
        method: 'POST',
        url: `/api/v1/challenges/${challengeId}/submit`,
        headers: { authorization: `Bearer ${candidate.token}` },
        payload: {
          language: 'typescript',
          code: 'function reverseWords(s: string): string { return s.trim().split(/\\s+/).reverse().join(" "); }',
        },
      });

    const first = await submit();
    expect(first.statusCode).toBe(200);
    const firstBody = JSON.parse(first.body);
    expect(firstBody.result.status).toBe('submitted');

    const second = await submit();
    expect(second.statusCode).toBe(200);
    const secondBody = JSON.parse(second.body);
    expect(secondBody.result.status).toBe('submitted');
    expect(secondBody.evidence.id).toBe(firstBody.evidence.id);

    // The stored evidence is retrievable by the id the second response returned.
    const stored = await app.inject({
      method: 'GET',
      url: `/api/v1/evidence/${secondBody.evidence.id}`,
      headers: { authorization: `Bearer ${candidate.token}` },
    });
    expect(stored.statusCode).toBe(200);
  });
});

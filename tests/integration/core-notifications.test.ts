/**
 * The core loop tells people what happened to them: a hiring team hears about
 * new applications and withdrawals, a candidate hears when the hiring team
 * moves them and when a referee responds. Before 2026-10-10 nothing in the
 * loop sent a notification.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

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

async function register(app: FastifyInstance, email: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: 'a-long-enough-passphrase',
    fullName: email.split('@')[0],
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

const inbox = async (app: FastifyInstance, token: string) =>
  (await call(app, 'GET', '/api/v1/notifications', token)).body as {
    notifications: Json[];
    unreadCount: number;
  };

describe('Core-loop notifications', () => {
  let app: FastifyInstance;
  let owner: Json;
  let teammate: Json;
  let candidate: Json;
  let jobId: string;
  let orgId: string;
  let applicationId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    } as never);
    owner = await register(app, 'owner@acme.example', 'recruiter');
    teammate = await register(app, 'teammate@acme.example', 'recruiter');
    candidate = await register(app, 'casey@example.org');
    const org = await call(app, 'POST', '/api/v1/organizations', owner.token, {
      name: 'Acme',
      slug: 'acme-notify',
    });
    orgId = org.body.organization.id;
    const member = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: teammate.user.id,
      role: 'recruiter',
    });
    expect(member.status).toBe(201);
    const job = await call(app, 'POST', '/api/v1/jobs', owner.token, {
      orgId,
      title: 'Platform Engineer',
      description: 'Own the deployment platform.',
      location: 'Remote',
    });
    jobId = job.body.job.id;
    await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, owner.token, { status: 'published' });
  });
  afterAll(() => app.close());

  it('tells every member of the hiring team about a new application, without naming the candidate', async () => {
    const applied = await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, candidate.token, {});
    expect(applied.status).toBe(201);
    applicationId = applied.body.application.id;

    for (const member of [owner, teammate]) {
      const { notifications, unreadCount } = await inbox(app, member.token);
      expect(unreadCount).toBe(1);
      expect(notifications[0]).toMatchObject({
        type: 'application_received',
        title: 'New application: Platform Engineer',
        referenceType: 'job',
        referenceId: jobId,
        isRead: false,
      });
      expect(JSON.stringify(notifications[0])).not.toContain('casey');
    }
    // The applicant is not notified of their own action.
    expect((await inbox(app, candidate.token)).unreadCount).toBe(0);
  });

  it('tells the candidate each time the hiring team moves them, and nobody else', async () => {
    for (const targetState of ['in_review', 'shortlisted']) {
      const moved = await call(
        app,
        'POST',
        `/api/v1/applications/${applicationId}/transition`,
        owner.token,
        { applicationId, targetState }
      );
      expect(moved.status).toBe(200);
    }
    const { notifications, unreadCount } = await inbox(app, candidate.token);
    expect(unreadCount).toBe(2);
    expect(notifications.map((n) => n.title)).toEqual([
      'Platform Engineer: shortlisted',
      'Platform Engineer: in review',
    ]);
    expect(notifications[0]).toMatchObject({
      type: 'application_status',
      body: 'You were shortlisted for Platform Engineer at Acme.',
      referenceType: 'job_application',
      referenceId: applicationId,
    });
    // The hiring team made the move; they get no echo of it.
    expect((await inbox(app, teammate.token)).unreadCount).toBe(1);
  });

  it('never shows the candidate a private rejection reason', async () => {
    const other = await register(app, 'riley@example.org');
    const applied = await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, other.token, {});
    const id = applied.body.application.id;
    await call(app, 'POST', `/api/v1/applications/${id}/transition`, owner.token, {
      applicationId: id,
      targetState: 'rejected',
      reason: 'INTERNAL-NOTE-weak-system-design',
    });
    const { notifications } = await inbox(app, other.token);
    expect(notifications[0].title).toBe('Platform Engineer: not taken forward');
    expect(JSON.stringify(notifications)).not.toContain('INTERNAL-NOTE');
  });

  it('tells the hiring team when a candidate withdraws', async () => {
    const before = (await inbox(app, owner.token)).notifications.length;
    const withdrawn = await call(
      app,
      'POST',
      `/api/v1/applications/${applicationId}/transition`,
      candidate.token,
      { applicationId, targetState: 'withdrawn' }
    );
    expect(withdrawn.status).toBe(200);
    const { notifications } = await inbox(app, owner.token);
    expect(notifications).toHaveLength(before + 1);
    expect(notifications[0]).toMatchObject({
      type: 'application_status',
      title: 'Application withdrawn: Platform Engineer',
    });
  });

  it('respects the application-notifications preference', async () => {
    const quiet = await register(app, 'quiet@example.org');
    const pref = await call(app, 'PATCH', '/api/v1/notifications/preferences', quiet.token, {
      allowApplications: false,
    });
    expect(pref.status).toBe(200);
    const applied = await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, quiet.token, {});
    const id = applied.body.application.id;
    await call(app, 'POST', `/api/v1/applications/${id}/transition`, owner.token, {
      applicationId: id,
      targetState: 'in_review',
    });
    expect((await inbox(app, quiet.token)).unreadCount).toBe(0);
  });

  it('marks read only the caller’s own notifications and reports the badge count', async () => {
    const summary = await call(app, 'GET', '/api/v1/notifications/summary', candidate.token);
    expect(summary.body.unreadCount).toBe(2);
    const ownerInbox = await inbox(app, owner.token);
    // Someone else's notification id is ignored, not marked.
    const foreign = await call(app, 'POST', '/api/v1/notifications/mark-read', candidate.token, {
      notificationIds: [ownerInbox.notifications[0].id],
    });
    expect(foreign.body.markedCount).toBe(0);
    expect((await inbox(app, owner.token)).notifications[0].isRead).toBe(false);

    const all = await call(app, 'POST', '/api/v1/notifications/mark-read', candidate.token, {
      all: true,
    });
    expect(all.body).toMatchObject({ markedCount: 2, unreadCount: 0 });
    expect(
      (await call(app, 'GET', '/api/v1/notifications/summary', candidate.token)).body.unreadCount
    ).toBe(0);
  });

  it('tells the candidate when a referee responds', async () => {
    const wh = await call(app, 'POST', '/api/v1/candidates/work-history', candidate.token, {
      companyName: 'Contoso',
      title: 'SRE',
      startDate: '2021-01-01',
      endDate: '2024-01-01',
    });
    const whId = wh.body.workHistory.id;
    const req = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/${whId}/references/request`,
      candidate.token,
      {
        refereeName: 'Morgan Manager',
        refereeEmail: 'morgan@contoso.example',
        relationship: 'manager',
      }
    );
    const refId = req.body.reference.id;
    const outbox = await call(app, 'GET', '/api/v1/internal/worker-jobs');
    const token = outbox.body.jobs.find(
      (j: Json) => j.type === 'reference.requested' && j.payload.referenceId === refId
    ).payload.token;
    const submitted = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/references/${refId}/submit`,
      undefined,
      {
        token,
        confirmDates: true,
        confirmTitle: true,
        technicalProficiency: 5,
        collaborationRating: 5,
        deliveryReliability: 5,
      }
    );
    expect(submitted.status).toBe(200);
    const { notifications } = await inbox(app, candidate.token);
    expect(notifications[0]).toMatchObject({
      type: 'reference_received',
      title: 'Morgan Manager responded to your reference request',
      referenceType: 'work_history',
      referenceId: whId,
      isRead: false,
    });
    expect(notifications[0].body).toContain('For SRE at Contoso.');
  });

  it('erasure succeeds with notifications present and leaves the hiring team’s own inbox', async () => {
    // That the erased person's notifications are deleted is checked against
    // the database in tests/pg/notifications.test.ts.
    expect((await inbox(app, candidate.token)).notifications.length).toBeGreaterThan(0);
    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', candidate.token);
    expect(erased.status).toBe(200);
    expect((await inbox(app, owner.token)).notifications.length).toBeGreaterThan(0);
  });
});

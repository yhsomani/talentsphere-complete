/**
 * A candidate can remove a role from their own work history. Before
 * 2026-10-11 a mistaken entry could only be removed by deleting the whole
 * account. Removal takes the role's references and open email check with it,
 * kills the referee's link, and cancels emails still waiting in the queue
 * (which hold the link token or verification code). The same queue cleanup
 * now runs on account erasure.
 *
 * That the rows are gone from Postgres, stay gone after a restart, and that a
 * removal racing a referee's submission leaves served state equal to stored
 * state is checked in tests/pg/work-history-removal.test.ts.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

type Json = Record<string, any>;

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
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

const jobs = async (app: FastifyInstance) =>
  (await call(app, 'GET', '/api/v1/internal/worker-jobs')).body.jobs as Json[];

async function addRole(app: FastifyInstance, token: string, companyName: string, extra = {}) {
  const res = await call(app, 'POST', '/api/v1/candidates/work-history', token, {
    companyName,
    title: 'SRE',
    startDate: '2021-01-01',
    endDate: '2024-01-01',
    ...extra,
  });
  expect(res.status).toBe(201);
  return res.body.workHistory.id as string;
}

async function requestReference(app: FastifyInstance, token: string, historyId: string) {
  const res = await call(
    app,
    'POST',
    `/api/v1/candidates/work-history/${historyId}/references/request`,
    token,
    {
      refereeName: 'Morgan Manager',
      refereeEmail: 'morgan@contoso.example',
      relationship: 'manager',
    }
  );
  expect(res.status).toBe(201);
  const refId = res.body.reference.id as string;
  const job = (await jobs(app)).find(
    (j) => j.type === 'reference.requested' && j.payload.referenceId === refId
  )!;
  return { refId, jobId: job.id as string, token: job.payload.token as string };
}

const listRoles = async (app: FastifyInstance, userId: string, token: string) =>
  (await call(app, 'GET', `/api/v1/candidates/${userId}/work-history`, token)).body
    .workHistories as Json[];

describe('Removing a role from your work history', () => {
  let app: FastifyInstance;
  let casey: Awaited<ReturnType<typeof register>>;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    } as never);
    casey = await register(app, 'casey@example.org');
  });
  afterAll(() => app.close());

  it('removes the role with its references and open email check, and keeps the others', async () => {
    const mistaken = await addRole(app, casey.token, 'Contoso');
    const kept = await addRole(app, casey.token, 'Fabrikam');
    await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/${mistaken}/verify-email`,
      casey.token,
      {
        corporateEmail: 'casey@contoso.example',
      }
    );
    const pending = await requestReference(app, casey.token, mistaken);
    const answered = await requestReference(app, casey.token, mistaken);
    const submitted = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/references/${answered.refId}/submit`,
      undefined,
      {
        token: answered.token,
        confirmDates: true,
        confirmTitle: true,
        technicalProficiency: 5,
        collaborationRating: 5,
        deliveryReliability: 5,
      }
    );
    expect(submitted.status).toBe(200);
    const keptRef = await requestReference(app, casey.token, kept);

    const removed = await call(
      app,
      'DELETE',
      `/api/v1/candidates/work-history/${mistaken}`,
      casey.token
    );
    expect(removed.status).toBe(200);
    expect(removed.body).toEqual({
      message: 'Removed SRE at Contoso from your work history.',
      removed: { id: mistaken, references: 2 },
    });

    const roles = await listRoles(app, casey.user.id, casey.token);
    expect(roles.map((r) => r.id)).toEqual([kept]);
    expect(roles[0].references.map((r: Json) => r.id)).toEqual([keptRef.refId]);

    // The referee's link is dead: neither the page nor the submission works.
    const page = await call(
      app,
      'GET',
      `/api/v1/references/${pending.refId}`,
      undefined,
      undefined,
      {
        'x-reference-token': pending.token,
      }
    );
    expect(page.status).toBe(404);
    const late = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/references/${pending.refId}/submit`,
      undefined,
      {
        token: pending.token,
        confirmDates: true,
        confirmTitle: true,
        technicalProficiency: 5,
        collaborationRating: 5,
        deliveryReliability: 5,
      }
    );
    expect(late.status).toBe(404);
  });

  it('cancels the emails still queued for the removed role and strips their credentials', async () => {
    const role = await addRole(app, casey.token, 'Northwind');
    await call(app, 'POST', `/api/v1/candidates/work-history/${role}/verify-email`, casey.token, {
      corporateEmail: 'casey@northwind.example',
    });
    const ref = await requestReference(app, casey.token, role);
    const other = await addRole(app, casey.token, 'Tailspin');
    const otherRef = await requestReference(app, casey.token, other);

    expect(
      (await call(app, 'DELETE', `/api/v1/candidates/work-history/${role}`, casey.token)).status
    ).toBe(200);

    const queue = await jobs(app);
    const referenceEmail = queue.find((j) => j.id === ref.jobId)!;
    expect(referenceEmail.status).toBe('canceled');
    expect(referenceEmail.payload.token).toBeUndefined();
    const codeEmail = queue.find(
      (j) =>
        j.type === 'work_history.email_verification_requested' && j.payload.workHistoryId === role
    )!;
    expect(codeEmail.status).toBe('canceled');
    expect(codeEmail.payload.code).toBeUndefined();
    // Another role's email is untouched.
    const untouched = queue.find((j) => j.id === otherRef.jobId)!;
    expect(untouched.status).toBe('queued');
    expect(untouched.payload.token).toBe(otherRef.token);
  });

  it('lets only the person the role belongs to remove it', async () => {
    const role = await addRole(app, casey.token, 'Litware');
    const other = await register(app, 'riley@example.org');
    const recruiter = await register(app, 'rita@acme.example', 'recruiter');
    const admin = createSessionToken(
      '00000000-0000-4000-a000-00000000ad42',
      'root@talentsphere.internal',
      ['platform_admin']
    );
    const url = `/api/v1/candidates/work-history/${role}`;
    expect((await call(app, 'DELETE', url)).status).toBe(401);
    expect((await call(app, 'DELETE', url, other.token)).status).toBe(403);
    expect((await call(app, 'DELETE', url, recruiter.token)).status).toBe(403);
    expect((await call(app, 'DELETE', url, admin)).status).toBe(403);
    expect((await listRoles(app, casey.user.id, casey.token)).map((r) => r.id)).toContain(role);

    expect((await call(app, 'DELETE', url, casey.token)).status).toBe(200);
    // Removing it again, or a role that never existed, is a 404.
    expect((await call(app, 'DELETE', url, casey.token)).status).toBe(404);
    expect(
      (
        await call(
          app,
          'DELETE',
          '/api/v1/candidates/work-history/00000000-0000-4000-a000-000000000000',
          casey.token
        )
      ).status
    ).toBe(404);
  });

  it('a role removed by mistake can be added again, even by replaying the original submission', async () => {
    const clientRequestId = 'add-role-replay-1';
    const first = await addRole(app, casey.token, 'Adventure Works', { clientRequestId });
    await call(app, 'DELETE', `/api/v1/candidates/work-history/${first}`, casey.token);
    // The replay guard must not hand back the removed record as "already recorded".
    const again = await call(app, 'POST', '/api/v1/candidates/work-history', casey.token, {
      companyName: 'Adventure Works',
      title: 'SRE',
      startDate: '2021-01-01',
      endDate: '2024-01-01',
      clientRequestId,
    });
    expect(again.status).toBe(201);
    expect(again.body.workHistory.id).not.toBe(first);
    expect((await listRoles(app, casey.user.id, casey.token)).map((r) => r.id)).toContain(
      again.body.workHistory.id
    );
  });

  it('erasing the account also cancels reference emails still waiting to go out', async () => {
    const leaving = await register(app, 'leaving@example.org');
    const role = await addRole(app, leaving.token, 'Wingtip');
    const ref = await requestReference(app, leaving.token, role);
    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', leaving.token);
    expect(erased.status).toBe(200);
    const job = (await jobs(app)).find((j) => j.id === ref.jobId)!;
    expect(job.status).toBe('canceled');
    expect(job.payload.token).toBeUndefined();
  });
});

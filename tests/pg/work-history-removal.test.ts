/**
 * Removing a role on a REAL PostgreSQL: the row, its references and its open
 * email check are deleted in one transaction and stay deleted after a
 * restart; the queued emails for it are canceled with their credentials
 * stripped; and a removal racing a referee's submission never leaves the API
 * serving something the database does not hold.
 *
 * Requires TEST_DATABASE_URL. Run: pnpm test:pg.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for the pg suite');
}

const dbName = `ts_pgremove_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => url.replace(/\/[^/?]*(\?|$)/, `/${name}$1`);
const databaseUrl = withDb(baseUrl, dbName);

const boot = () =>
  buildApp({
    NODE_ENV: 'test',
    STORAGE: 'pg',
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: 'error',
    RATE_LIMIT_MAX_REQUESTS: '100000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
  } as never);

type Json = Record<string, any>;
async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'DELETE',
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

let pool: pg.Pool;
const sql = async <T = Json>(query: string, params: unknown[] = []) =>
  (await pool.query(query, params)).rows as T[];

const PASSWORD = 'a-long-enough-passphrase';
const SUBMISSION = {
  confirmDates: true,
  confirmTitle: true,
  technicalProficiency: 5,
  collaborationRating: 5,
  deliveryReliability: 5,
};

describe('Removing a role on PostgreSQL', () => {
  let app: FastifyInstance;
  let token: string;
  let userId: string;

  const addRole = async (companyName: string) => {
    const res = await call(app, 'POST', '/api/v1/candidates/work-history', token, {
      companyName,
      title: 'SRE',
      startDate: '2021-01-01',
      isCurrent: true,
    });
    expect(res.status).toBe(201);
    return res.body.workHistory.id as string;
  };
  const requestReference = async (historyId: string) => {
    const res = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/${historyId}/references/request`,
      token,
      { refereeName: 'Morgan', refereeEmail: 'morgan@contoso.example', relationship: 'manager' }
    );
    expect(res.status).toBe(201);
    const refId = res.body.reference.id as string;
    const [job] = await sql<{ id: string; token: string }>(
      `SELECT id, payload->>'token' AS token FROM public.background_jobs
       WHERE kind = 'reference.requested' AND payload->>'referenceId' = $1`,
      [refId]
    );
    return { refId, jobId: job.id, token: job.token };
  };

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    await admin.query(`CREATE DATABASE ${dbName}`);
    await admin.end();
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl, max: 4 });
    app = await boot();
    const reg = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email: 'casey@example.org',
      password: PASSWORD,
      fullName: 'Casey',
    });
    token = reg.body.token;
    userId = reg.body.user.id;
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('deletes the role, its references and email check, cancels its emails, and stays deleted', async () => {
    const role = await addRole('Contoso');
    const kept = await addRole('Fabrikam');
    await call(app, 'POST', `/api/v1/candidates/work-history/${role}/verify-email`, token, {
      corporateEmail: 'casey@contoso.example',
    });
    const pending = await requestReference(role);
    const answered = await requestReference(role);
    const submitted = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/references/${answered.refId}/submit`,
      undefined,
      { token: answered.token, ...SUBMISSION }
    );
    expect(submitted.status).toBe(200);
    const keptRef = await requestReference(kept);

    const removed = await call(app, 'DELETE', `/api/v1/candidates/work-history/${role}`, token);
    expect(removed.status).toBe(200);

    expect(await sql('SELECT 1 FROM verified_work_histories WHERE id = $1', [role])).toHaveLength(
      0
    );
    expect(
      await sql('SELECT 1 FROM employment_references WHERE work_history_id = $1', [role])
    ).toHaveLength(0);
    expect(
      await sql('SELECT 1 FROM work_history_email_challenges WHERE work_history_id = $1', [role])
    ).toHaveLength(0);
    expect(
      await sql('SELECT id FROM employment_references WHERE work_history_id = $1', [kept])
    ).toEqual([{ id: keptRef.refId }]);

    const queue = await sql<{ id: string; status: string; payload: Json }>(
      `SELECT id, status, payload FROM background_jobs
       WHERE payload->>'referenceId' = ANY($1::text[]) OR payload->>'workHistoryId' = $2`,
      [[pending.refId, keptRef.refId], role]
    );
    const byId = Object.fromEntries(queue.map((j) => [j.id, j]));
    expect(byId[pending.jobId]).toMatchObject({ status: 'canceled' });
    expect(byId[pending.jobId].payload.token).toBeUndefined();
    const codeEmail = queue.find((j) => j.payload.workHistoryId === role)!;
    expect(codeEmail.status).toBe('canceled');
    expect(codeEmail.payload.code).toBeUndefined();
    expect(byId[keptRef.jobId]).toMatchObject({
      status: 'queued',
      payload: { token: keptRef.token },
    });

    await app.close();
    app = await boot();
    const roles = await call(app, 'GET', `/api/v1/candidates/${userId}/work-history`, token);
    expect(roles.body.workHistories.map((r: Json) => r.id)).toEqual([kept]);
    const late = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/references/${pending.refId}/submit`,
      undefined,
      { token: pending.token, ...SUBMISSION }
    );
    expect(late.status).toBe(404);
  });

  it('a removal racing a referee’s submission never serves what the database does not hold', async () => {
    for (let i = 0; i < 6; i++) {
      const role = await addRole(`Race ${i}`);
      const ref = await requestReference(role);
      const remove = () => call(app, 'DELETE', `/api/v1/candidates/work-history/${role}`, token);
      const submit = () =>
        call(
          app,
          'POST',
          `/api/v1/candidates/work-history/references/${ref.refId}/submit`,
          undefined,
          {
            token: ref.token,
            ...SUBMISSION,
          }
        );
      // Alternate which request starts first. Locally the removal takes the
      // in-flight lock either way and the submission is refused (409); the
      // invariant below holds whichever wins.
      const [removal, submission] =
        i % 2 === 0
          ? await Promise.all([remove(), submit()])
          : (await Promise.all([submit(), remove()])).reverse();
      expect([200, 409]).toContain(removal.status);
      expect([200, 404, 409]).toContain(submission.status);
      expect([removal.status, submission.status]).toContain(200);

      const stored = await sql<{ status: string }>(
        `SELECT r.status FROM verified_work_histories h
         JOIN employment_references r ON r.work_history_id = h.id WHERE h.id = $1`,
        [role]
      );
      const served = (
        await call(app, 'GET', `/api/v1/candidates/${userId}/work-history`, token)
      ).body.workHistories.find((h: Json) => h.id === role);
      if (removal.status === 200) {
        // Acknowledged removal: gone in both places, whatever the referee saw.
        expect(stored).toHaveLength(0);
        expect(served).toBeUndefined();
      } else {
        // Removal refused: the referee's acknowledged submission is what is stored and served.
        expect(submission.status).toBe(200);
        expect(stored).toEqual([{ status: 'submitted' }]);
        expect(served.references[0].status).toBe('submitted');
      }
    }
  });
});

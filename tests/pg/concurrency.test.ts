/**
 * Concurrency and data-integrity guarantees on a REAL PostgreSQL.
 *
 * Found by adversarial review of the ADR-015 persistence layer: with a real
 * database, every commit is an await, so two requests can both pass a
 * read-model check before either writes. Before the fix, 40 concurrent wrong
 * email codes were recorded as ONE attempt (a 6-digit code was brute-forcible
 * in batches), and a concurrent hire + withdrawal were both acknowledged with
 * only one surviving. These tests reproduce both races and the other
 * pg-only failures (values Postgres cannot store surfacing as 500s, one-time
 * credentials left in the jobs table).
 *
 * Requires TEST_DATABASE_URL. Run: pnpm test:pg.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { PgCoreStore } from '../../apps/api/src/storage/core-store.js';
import { createPgJobStore } from '../../packages/domain/src/index.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for the pg suite');
}

const dbName = `ts_pgrace_${crypto.randomBytes(4).toString('hex')}`;
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

let pool: pg.Pool;
const sql = async <T = Json>(query: string, params: unknown[] = []) =>
  (await pool.query(query, params)).rows as T[];

async function register(app: FastifyInstance, email: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: 'a-long-enough-passphrase',
    fullName: 'Race Tester',
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

describe('Concurrency and integrity on PostgreSQL', () => {
  let app: FastifyInstance;

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
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    await admin.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    await admin.end();
  });

  it('counts every evaluated wrong email code even when 40 arrive at once', async () => {
    const cand = await register(app, 'brute@example.org');
    const wh = await call(app, 'POST', '/api/v1/candidates/work-history', cand.token, {
      companyName: 'Acme Corp',
      title: 'Engineer',
      startDate: '2020-01-01',
      isCurrent: true,
    });
    const id = wh.body.workHistory.id;
    const url = `/api/v1/candidates/work-history/${id}/verify-email`;
    await call(app, 'POST', url, cand.token, { corporateEmail: 'me@acme-corp.io' });
    const outbox = await call(app, 'GET', '/api/v1/internal/worker-jobs');
    const code: string = outbox.body.jobs.find(
      (j: Json) =>
        j.type === 'work_history.email_verification_requested' && j.payload.workHistoryId === id
    ).payload.code;
    const wrong = (n: number) => String((Number(code) + n) % 1_000_000).padStart(6, '0');

    const burst = await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        call(app, 'POST', url, cand.token, {
          corporateEmail: 'me@acme-corp.io',
          verificationCode: wrong(i + 1),
        })
      )
    );
    const evaluated = burst.filter((r) => r.status === 422).length;
    expect(burst.every((r) => [409, 422, 429].includes(r.status))).toBe(true);
    expect(evaluated).toBeGreaterThanOrEqual(1);
    expect(evaluated).toBeLessThanOrEqual(5);
    // Every evaluated guess is on record — before the fix this was 1 after 40.
    const [row] = await sql(
      'SELECT attempts FROM public.work_history_email_challenges WHERE work_history_id = $1',
      [id]
    );
    expect(row.attempts).toBe(evaluated);

    for (let i = evaluated; i < 5; i++) {
      const r = await call(app, 'POST', url, cand.token, {
        corporateEmail: 'me@acme-corp.io',
        verificationCode: wrong(100 + i),
      });
      expect(r.status).toBe(422);
    }
    const locked = await call(app, 'POST', url, cand.token, {
      corporateEmail: 'me@acme-corp.io',
      verificationCode: code,
    });
    expect(locked.status).toBe(429);
    const [after] = await sql(
      'SELECT email_verified_at FROM public.verified_work_histories WHERE id = $1',
      [id]
    );
    expect(after.email_verified_at).toBeNull();
  });

  it('acknowledges exactly one of a concurrent hire and withdrawal, every time', async () => {
    const rec = await register(app, 'race-rec@acme.example', 'recruiter');
    const org = await call(app, 'POST', '/api/v1/organizations', rec.token, {
      name: 'Race Org',
      slug: 'race-org',
    });
    const job = await call(app, 'POST', '/api/v1/jobs', rec.token, {
      orgId: org.body.organization.id,
      title: 'Race Engineer',
      description: 'A long enough description.',
      location: 'Remote',
    });
    const jobId = job.body.job.id;
    await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, rec.token, { status: 'published' });

    for (let i = 0; i < 5; i++) {
      const cand = await register(app, `race-cand-${i}@example.org`);
      const applied = await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, cand.token, {});
      const id = applied.body.application.id;
      for (const targetState of ['in_review', 'shortlisted', 'interviewing', 'offered']) {
        const moved = await call(app, 'POST', `/api/v1/applications/${id}/transition`, rec.token, {
          applicationId: id,
          targetState,
        });
        expect(moved.status).toBe(200);
      }
      const results = await Promise.all([
        call(app, 'POST', `/api/v1/applications/${id}/transition`, rec.token, {
          applicationId: id,
          targetState: 'hired',
        }),
        call(app, 'POST', `/api/v1/applications/${id}/transition`, cand.token, {
          applicationId: id,
          targetState: 'withdrawn',
        }),
      ]);
      const winners = results.filter((r) => r.status === 200);
      expect(winners).toHaveLength(1);
      const acknowledged = winners[0].body.application.status;
      const [row] = await sql('SELECT status FROM public.job_applications WHERE id = $1', [id]);
      expect(row.status).toBe(acknowledged);
      const served = await call(app, 'GET', `/api/v1/applications/${id}`, rec.token);
      expect(served.body.application.status).toBe(acknowledged);
    }
  });

  it('turns values Postgres cannot store into validation errors, not 500s', async () => {
    const cand = await register(app, 'dates@example.org');
    const rec = await register(app, 'salary@acme.example', 'recruiter');
    const org = await call(app, 'POST', '/api/v1/organizations', rec.token, {
      name: 'Salary Org',
      slug: 'salary-org',
    });
    const statuses = [
      (
        await call(app, 'POST', '/api/v1/candidates/work-history', cand.token, {
          companyName: 'Acme',
          title: 'Eng',
          startDate: '2023-02-30',
          isCurrent: true,
        })
      ).status,
      (
        await call(app, 'POST', '/api/v1/jobs', rec.token, {
          orgId: org.body.organization.id,
          title: 'Job',
          description: 'A long description',
          location: 'Remote',
          salaryMinMinor: 1e20,
        })
      ).status,
      (
        await call(app, 'POST', '/api/v1/auth/register', undefined, {
          email: `${'a'.repeat(250)}@example.com`,
          password: 'a-long-enough-passphrase',
          fullName: 'Long Email',
        })
      ).status,
    ];
    expect(statuses).toEqual([400, 400, 400]);

    // Defence in depth below the contracts: a data exception from Postgres
    // itself (SQLSTATE class 22) is a VALIDATION_FAILED, never an unhandled error.
    const store = new PgCoreStore(pool);
    const now = new Date().toISOString();
    await expect(
      store.commit([
        {
          kind: 'evidence',
          value: {
            id: crypto.randomUUID(),
            subjectId: crypto.randomUUID(),
            type: 'project',
            title: 'Impossible date',
            description: 'd',
            source: 's',
            provenance: 'p',
            verificationLevel: 'self_declared',
            status: 'pending',
            recencyDate: '2023-02-30',
            createdAt: now,
            updatedAt: now,
          } as never,
        },
      ])
    ).rejects.toMatchObject({ name: 'DomainError', code: 'VALIDATION_FAILED' });
  });

  it('strips one-time credentials from a job payload once the job is finished', async () => {
    const jobs = createPgJobStore((text, params) => pool.query(text, params as unknown[]));
    const payload = { to: 'referee@example.org', referenceId: 'r1', token: 'secret-token' };
    const delivered = await jobs.enqueue({ kind: 'reference.requested', payload });
    const retried = await jobs.enqueue({
      kind: 'work_history.email_verification_requested',
      payload: { to: 'me@acme-corp.io', code: '123456' },
    });
    const failed = await jobs.enqueue({ kind: 'reference.requested', payload });
    const claimed = await jobs.claim({ limit: 1000, leaseMs: 60_000 });
    expect(claimed.map((j) => j.id)).toEqual(
      expect.arrayContaining([delivered.job.id, retried.job.id, failed.job.id])
    );

    await jobs.complete(delivered.job.id);
    await jobs.fail(retried.job.id, {
      disposition: 'retry',
      error: 'smtp timeout',
      maxAttempts: 5,
      backoffMs: 0,
      attempts: 1,
    });
    await jobs.fail(failed.job.id, {
      disposition: 'permanent',
      error: 'no provider',
      maxAttempts: 5,
      backoffMs: 0,
      attempts: 1,
    });

    const rows = await sql<{ id: string; payload: Json }>(
      'SELECT id, payload FROM public.background_jobs WHERE id = ANY($1::uuid[])',
      [[delivered.job.id, retried.job.id, failed.job.id]]
    );
    const byId = Object.fromEntries(rows.map((r) => [r.id, r.payload]));
    expect(byId[delivered.job.id]).toEqual({ to: 'referee@example.org', referenceId: 'r1' });
    expect(byId[failed.job.id]).toEqual({ to: 'referee@example.org', referenceId: 'r1' });
    // A job that will retry still needs its code to deliver the email.
    expect(byId[retried.job.id]).toEqual({ to: 'me@acme-corp.io', code: '123456' });
  });
});

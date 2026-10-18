/**
 * Core-loop durability on a REAL PostgreSQL (ADR-015, production audit P0-04).
 *
 * Everything else in the suite runs on STORAGE=memory. This file proves the
 * thing memory mode cannot: that what the API acknowledges survives a
 * restart. It drives the whole career loop through the HTTP API, closes the
 * server, boots a brand-new one against the same database, and checks that
 * the second process sees exactly what the first one wrote.
 *
 * Requires TEST_DATABASE_URL (any database on the server; a fresh, uniquely
 * named database is created and dropped around the run). Run: pnpm test:pg.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createStorage } from '../../apps/api/src/storage/index.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error(
    'TEST_DATABASE_URL is required for the pg suite (e.g. postgresql://postgres:postgres@localhost:5432/postgres)'
  );
}

const dbName = `ts_pgtest_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => url.replace(/\/[^/?]*(\?|$)/, `/${name}$1`);
const databaseUrl = withDb(baseUrl, dbName);

const boot = () =>
  buildApp({
    NODE_ENV: 'test',
    STORAGE: 'pg',
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: 'error',
    RATE_LIMIT_MAX_REQUESTS: '100000',
    BYO_AI_KEY_ENCRYPTION_KEY: 'a'.repeat(64),
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

async function sql<T = Json>(query: string, params: unknown[] = []): Promise<T[]> {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return (await client.query(query, params)).rows as T[];
  } finally {
    await client.end();
  }
}

describe('Core-loop persistence on PostgreSQL (ADR-015)', () => {
  let app: FastifyInstance;
  const ids: Json = {};

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    await admin.query(`CREATE DATABASE ${dbName}`);
    await admin.end();
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    app = await boot();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('writes the whole career loop as real rows', async () => {
    const recruiter = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email: 'Rita.Recruiter@Example.com',
      password: 'correct-horse-battery-staple',
      fullName: 'Rita Recruiter',
      role: 'recruiter',
    });
    expect(recruiter.status).toBe(201);
    ids.recruiterToken = recruiter.body.token;

    const candidate = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email: 'casey@example.com',
      password: 'another-long-passphrase',
      fullName: 'Casey Candidate',
    });
    expect(candidate.status).toBe(201);
    ids.candidateToken = candidate.body.token;
    ids.candidateUserId = candidate.body.user.id;
    ids.candidateProfileId = candidate.body.profile.id;

    const org = await call(app, 'POST', '/api/v1/organizations', ids.recruiterToken, {
      name: 'Northwind Labs',
      slug: 'northwind-labs',
      website: 'https://northwind.example',
    });
    expect(org.status).toBe(201);
    ids.orgId = org.body.organization.id;

    const job = await call(app, 'POST', '/api/v1/jobs', ids.recruiterToken, {
      orgId: ids.orgId,
      title: 'Platform Engineer',
      description: 'Own the deployment platform end to end.',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
      requiredSkillIds: ['10000000-0000-4000-a000-000000000001'],
      salaryMinMinor: 9_000_000,
      salaryMaxMinor: 12_000_000,
      currency: 'USD',
    });
    expect(job.status).toBe(201);
    ids.jobId = job.body.job.id;

    const published = await call(
      app,
      'PATCH',
      `/api/v1/jobs/${ids.jobId}/status`,
      ids.recruiterToken,
      { status: 'published' }
    );
    expect(published.status).toBe(200);

    const evidence = await call(app, 'POST', '/api/v1/evidence', ids.candidateToken, {
      type: 'project',
      title: 'Zero-downtime deploy pipeline',
      description: 'Blue/green rollout with automated rollback.',
      source: 'github',
      provenance: 'https://example.com/repo',
      recencyDate: '2026-06-01',
      skillIds: ['10000000-0000-4000-a000-000000000001'],
    });
    expect(evidence.status).toBe(201);
    ids.evidenceId = evidence.body.evidence.id;

    const applied = await call(app, 'POST', `/api/v1/jobs/${ids.jobId}/apply`, ids.candidateToken, {
      coverLetter: 'I build deployment platforms.',
      attachedEvidenceIds: [ids.evidenceId],
    });
    expect(applied.status).toBe(201);
    ids.applicationId = applied.body.application.id;

    const moved = await call(
      app,
      'POST',
      `/api/v1/applications/${ids.applicationId}/transition`,
      ids.recruiterToken,
      { applicationId: ids.applicationId, targetState: 'in_review' }
    );
    expect(moved.status).toBe(200);

    const history = await call(app, 'POST', '/api/v1/candidates/work-history', ids.candidateToken, {
      companyName: 'Contoso',
      title: 'SRE',
      startDate: '2022-01-01',
      endDate: '2025-12-31',
      clientRequestId: 'wh-1',
    });
    expect(history.status).toBe(201);
    ids.workHistoryId = history.body.workHistory.id;

    const reference = await call(
      app,
      'POST',
      `/api/v1/candidates/work-history/${ids.workHistoryId}/references/request`,
      ids.candidateToken,
      {
        refereeName: 'Morgan Manager',
        refereeEmail: 'morgan@contoso.example',
        relationship: 'manager',
      }
    );
    expect(reference.status).toBe(201);
    ids.referenceId = reference.body.reference.id;

    // Real rows, with the domain values intact.
    const [userRow] = await sql(`SELECT email, roles, status FROM users WHERE id = $1`, [
      ids.candidateUserId,
    ]);
    expect(userRow).toMatchObject({
      email: 'casey@example.com',
      roles: ['candidate'],
      status: 'active',
    });
    const [jobRow] = await sql(
      `SELECT status, work_mode, salary_min_minor::int AS min, salary_currency FROM jobs WHERE id = $1`,
      [ids.jobId]
    );
    expect(jobRow).toMatchObject({ status: 'published', work_mode: 'remote', min: 9_000_000 });
    const [appRow] = await sql(`SELECT status, cover_letter FROM job_applications WHERE id = $1`, [
      ids.applicationId,
    ]);
    expect(appRow).toMatchObject({
      status: 'in_review',
      cover_letter: 'I build deployment platforms.',
    });
    const [refRow] = await sql(
      `SELECT token_hash, status FROM employment_references WHERE id = $1`,
      [ids.referenceId]
    );
    expect(refRow.status).toBe('requested');
    expect(String(refRow.token_hash).trim()).toMatch(/^[0-9a-f]{64}$/); // a hash, never the token
  });

  it('stores apostrophes and SQL-like input as literal profile data', async () => {
    const headline = "O'Connor's experience: ' OR 1=1 --";
    const changed = await call(app, 'PATCH', '/api/v1/profile/me', ids.candidateToken, {
      headline,
    });
    expect(changed.status).toBe(200);

    const [profile] = await sql<{ headline: string }>(
      'SELECT headline FROM public.profiles WHERE id = $1',
      [ids.candidateProfileId]
    );
    expect(profile.headline).toBe(headline);
  });

  it('serves the same state from a brand-new process after a restart', async () => {
    await app.close();
    app = await boot();

    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'casey@example.com',
      password: 'another-long-passphrase',
    });
    expect(login.status).toBe(200);
    const token = login.body.token;

    const mine = await call(app, 'GET', '/api/v1/applications/my', token);
    expect(mine.status).toBe(200);
    expect(mine.body.applications).toHaveLength(1);
    expect(mine.body.applications[0]).toMatchObject({
      id: ids.applicationId,
      status: 'in_review',
      attachedEvidenceIds: [ids.evidenceId],
    });
    expect(mine.body.applications[0].job.title).toBe('Platform Engineer');

    const jobs = await call(app, 'GET', '/api/v1/jobs');
    const job = jobs.body.jobs.find((j: Json) => j.id === ids.jobId);
    expect(job).toMatchObject({
      status: 'published',
      requiredSkillIds: ['10000000-0000-4000-a000-000000000001'],
      salaryRange: { minMinor: 9_000_000, maxMinor: 12_000_000, currency: 'USD' },
    });

    const evidence = await call(app, 'GET', `/api/v1/evidence/${ids.evidenceId}`, token);
    expect(evidence.status).toBe(200);
    expect(evidence.body.evidence.recencyDate).toBe('2026-06-01');
    expect(evidence.body.skills.map((s: Json) => s.slug)).toEqual(['typescript']);

    const histories = await call(
      app,
      'GET',
      `/api/v1/candidates/${ids.candidateUserId}/work-history`,
      token
    );
    expect(histories.body.workHistories).toHaveLength(1);
    expect(histories.body.workHistories[0]).toMatchObject({
      id: ids.workHistoryId,
      startDate: '2022-01-01',
      endDate: '2025-12-31',
    });

    // The replay guard survives the restart too (rebuilt from client_request_id).
    const replay = await call(app, 'POST', '/api/v1/candidates/work-history', token, {
      companyName: 'Contoso',
      title: 'SRE',
      startDate: '2022-01-01',
      endDate: '2025-12-31',
      clientRequestId: 'wh-1',
    });
    expect(replay.status).toBe(200);
    expect(replay.body.deduplicated).toBe(true);

    // Recruiter side: the pipeline still belongs to the org that owns the job.
    const recruiterLogin = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'rita.recruiter@example.com',
      password: 'correct-horse-battery-staple',
    });
    const applicants = await call(
      app,
      'GET',
      `/api/v1/jobs/${ids.jobId}/applications`,
      recruiterLogin.body.token
    );
    expect(applicants.status).toBe(200);
    expect(applicants.body.applications[0].candidate.fullName).toBe('Casey Candidate');
  });

  it('exports the real candidate evidence and applications by profile id', async () => {
    const result = await call(app, 'POST', '/api/v1/settings/export', ids.candidateToken, {
      format: 'json',
    });
    expect(result.status).toBe(200);
    expect(result.body.data.evidence.map((value: Json) => value.id)).toContain(ids.evidenceId);
    expect(result.body.data.applications.map((value: Json) => value.id)).toContain(
      ids.applicationId
    );
    expect(result.body.exportRequest.downloadUrl).toBeUndefined();
    expect(result.body.message).toMatch(/not yet a complete statutory/);
  });

  it('retains settings and data export history across API restarts', async () => {
    const updated = await call(app, 'PATCH', '/api/v1/settings', ids.candidateToken, {
      theme: 'dark',
      digestFrequency: 'weekly',
      showEmail: true,
      byoAiKey: 'sk-fake-test-only-never-use',
    });
    expect(updated.status).toBe(200);
    expect(updated.body.settings.theme).toBe('dark');
    expect(updated.body.settings.digestFrequency).toBe('weekly');
    expect(updated.body.settings.byoAiKey).toBe('••••••••');
    const [encrypted] = await sql(
      'SELECT byo_ai_key FROM public.user_settings WHERE user_id = $1',
      [ids.candidateUserId]
    );
    expect(encrypted.byo_ai_key).toMatch(/^enc:v1:/);
    expect(encrypted.byo_ai_key).not.toContain('sk-fake-test-only');

    const exported = await call(app, 'POST', '/api/v1/settings/export', ids.candidateToken, {
      format: 'json',
    });
    expect(exported.status).toBe(200);
    const requestId = exported.body.exportRequest.id;
    expect(
      await sql('SELECT id FROM public.data_export_requests WHERE id = $1', [requestId])
    ).toHaveLength(1);

    await app.close();
    app = await boot();
    const settings = await call(app, 'GET', '/api/v1/settings', ids.candidateToken);
    expect(settings.status).toBe(200);
    expect(settings.body.settings.theme).toBe('dark');
    expect(settings.body.settings.digestFrequency).toBe('weekly');
    expect(settings.body.settings.showEmail).toBe(true);
    expect(settings.body.settings.byoAiKey).toBe('••••••••');

    const latest = await call(app, 'GET', '/api/v1/settings/export/latest', ids.candidateToken);
    expect(latest.status).toBe(200);
    expect(latest.body.latestExport.id).toBe(requestId);
  });

  it('lets the database arbitrate a race the read model cannot see', async () => {
    const attempts = await Promise.all(
      [1, 2, 3].map(() =>
        call(app, 'POST', '/api/v1/auth/register', undefined, {
          email: 'race@example.com',
          password: 'race-condition-passphrase',
          fullName: 'Race Condition',
        })
      )
    );
    const statuses = attempts.map((a) => a.status).sort();
    expect(statuses).toEqual([201, 409, 409]);
    const rows = await sql(`SELECT count(*)::int AS n FROM users WHERE email = 'race@example.com'`);
    expect(rows[0].n).toBe(1);
  });

  it('allows re-applying after a withdrawal but never two active applications (BR-15)', async () => {
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'casey@example.com',
      password: 'another-long-passphrase',
    });
    const token = login.body.token;

    const duplicate = await call(app, 'POST', `/api/v1/jobs/${ids.jobId}/apply`, token, {});
    expect(duplicate.status).toBe(409);

    const withdrawn = await call(
      app,
      'POST',
      `/api/v1/applications/${ids.applicationId}/transition`,
      token,
      {
        applicationId: ids.applicationId,
        targetState: 'withdrawn',
      }
    );
    expect(withdrawn.status).toBe(200);

    const again = await call(app, 'POST', `/api/v1/jobs/${ids.jobId}/apply`, token, {});
    expect(again.status).toBe(201);

    const rows = await sql(
      `SELECT status FROM job_applications WHERE job_id = $1 ORDER BY created_at`,
      [ids.jobId]
    );
    expect(rows.map((r) => r.status)).toEqual(['withdrawn', 'submitted']);
  });

  it('keeps erasure request and cancellation history durable across restarts', async () => {
    const signup = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email: 'pending-erasure@example.com',
      password: 'pending-erasure-passphrase',
      fullName: 'Erasure Request Tester',
    });
    expect(signup.status).toBe(201);
    const token = signup.body.token;
    const userId = signup.body.user.id;

    const request = await call(app, 'POST', '/api/v1/settings/erasure/request', token, {
      reason: 'Testing durable request',
      confirm: true,
    });
    expect(request.status).toBe(201);
    const requestId = request.body.erasureRequest.id;
    const concurrent = await Promise.all(
      Array.from({ length: 2 }, () =>
        call(app, 'POST', '/api/v1/settings/erasure/request', token, { confirm: true })
      )
    );
    expect(concurrent.every((result) => result.status === 409)).toBe(true);

    expect(
      await sql('SELECT id FROM public.data_erasure_requests WHERE user_id = $1', [userId])
    ).toHaveLength(1);

    await app.close();
    app = await boot();
    const status = await call(app, 'GET', '/api/v1/settings/erasure/status', token);
    expect(status.status).toBe(200);
    expect(status.body.hasPendingErasure).toBe(true);
    expect(status.body.activeRequest.id).toBe(requestId);

    const cancelled = await call(app, 'POST', '/api/v1/settings/erasure/cancel', token, {
      requestId,
    });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.erasureRequest.status).toBe('cancelled');

    await app.close();
    app = await boot();
    const finalStatus = await call(app, 'GET', '/api/v1/settings/erasure/status', token);
    expect(finalStatus.body.hasPendingErasure).toBe(false);
    expect(finalStatus.body.history[0].status).toBe('cancelled');
  });

  it('rejects concurrent API writers instead of serving divergent read models', async () => {
    await expect(boot()).rejects.toThrow(/second API writer/);
    // The existing server keeps its lock after rejecting another boot.
    expect((await call(app, 'GET', '/api/v1/health')).status).toBe(200);
    // Releasing the first instance makes a replacement boot possible.
    await app.close();
    app = await boot();
    expect((await call(app, 'GET', '/api/v1/health')).status).toBe(200);
  });

  it('reports stale, missing and current worker heartbeats from real PostgreSQL', async () => {
    const store = createStorage({ STORAGE: 'pg', NODE_ENV: 'test', DATABASE_URL: databaseUrl });
    try {
      expect(await store.workerHeartbeat()).toEqual({ alive: false, lastSeenAt: null });

      await sql(
        "INSERT INTO public.worker_health (id, last_seen_at) VALUES (1, now() - INTERVAL '90 seconds')"
      );
      const stale = await store.workerHeartbeat();
      expect(stale.alive).toBe(false);
      expect(stale.lastSeenAt).not.toBeNull();

      await sql('UPDATE public.worker_health SET last_seen_at = now() WHERE id = 1');
      const fresh = await store.workerHeartbeat();
      expect(fresh.alive).toBe(true);
      expect(fresh.lastSeenAt).not.toBeNull();
    } finally {
      await store.close();
    }
  });

  it('erasure removes personal data from the database, not just from memory', async () => {
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'casey@example.com',
      password: 'another-long-passphrase',
    });
    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', login.body.token);
    expect(erased.status).toBe(200);

    const [user] = await sql(`SELECT email, status, password_hash FROM users WHERE id = $1`, [
      ids.candidateUserId,
    ]);
    expect(user.email).toMatch(/^anonymized_/);
    expect(user.status).toBe('deactivated');
    expect(user.password_hash).toBe('!erased');
    expect(
      await sql('SELECT 1 FROM public.user_settings WHERE user_id = $1', [ids.candidateUserId])
    ).toHaveLength(0);
    expect(
      await sql('SELECT 1 FROM public.data_export_requests WHERE user_id = $1', [
        ids.candidateUserId,
      ])
    ).toHaveLength(0);
    expect(
      await sql(`SELECT 1 FROM verified_work_histories WHERE candidate_id = $1`, [
        ids.candidateUserId,
      ])
    ).toHaveLength(0);
    expect(
      await sql(`SELECT 1 FROM employment_references WHERE candidate_id = $1`, [
        ids.candidateUserId,
      ])
    ).toHaveLength(0);
    expect(
      await sql(`SELECT 1 FROM evidence WHERE subject_id = $1`, [ids.candidateProfileId])
    ).toHaveLength(0);
    const apps = await sql(
      `SELECT status, cover_letter FROM job_applications WHERE candidate_id = $1`,
      [ids.candidateProfileId]
    );
    expect(apps.every((a) => a.status === 'withdrawn' && a.cover_letter === null)).toBe(true);

    // ...and it stays erased across a restart.
    await app.close();
    app = await boot();
    const relogin = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'casey@example.com',
      password: 'another-long-passphrase',
    });
    expect(relogin.status).toBe(401);
  });
});

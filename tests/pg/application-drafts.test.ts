/**
 * Application drafts on real PostgreSQL (migrations 00019, 00056; F-36, #48).
 * Proves a draft and its version history survive a restart, stay private to
 * their candidate, refuse a stale concurrent save, are marked submitted by the
 * apply route, and are removed by account erasure.
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
  throw new Error('TEST_DATABASE_URL is required for PostgreSQL application-draft tests.');
}

const dbName = `ts_pgdrafts_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
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

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
) {
  const response = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return {
    status: response.statusCode,
    data: response.body ? JSON.parse(response.body) : {},
    durability: response.headers['x-talentsphere-durability'],
  };
}

describe('Application-draft persistence and isolation', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    try {
      await admin.query(`CREATE DATABASE ${dbName}`);
    } finally {
      await admin.end();
    }
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl });
    app = await boot();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('keeps drafts and versions across a restart, privately and without lost writes', async () => {
    const password = 'long-application-draft-passphrase';
    const register = async (email: string, role: 'candidate' | 'recruiter') => {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email,
        fullName: 'Draft Tester',
        password,
        role,
      });
      expect(res.status).toBe(201);
      return res.data as { token: string; user: { id: string }; profile: { id: string } };
    };
    const owner = await register('draft-owner@example.org', 'candidate');
    const stranger = await register('draft-stranger@example.org', 'candidate');
    const recruiter = await register('draft-recruiter@example.org', 'recruiter');

    const org = await call(app, 'POST', '/api/v1/organizations', recruiter.token, {
      name: 'Draft Labs',
      slug: 'draft-labs',
      website: 'https://draft-labs.example',
    });
    expect(org.status).toBe(201);
    const job = await call(app, 'POST', '/api/v1/jobs', recruiter.token, {
      orgId: org.data.organization.id,
      title: 'Platform Engineer',
      description: 'Run the deployment platform.',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
    });
    expect(job.status).toBe(201);
    const jobId = job.data.job.id as string;
    expect(
      (
        await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, recruiter.token, {
          status: 'published',
        })
      ).status
    ).toBe(200);

    // Resumes are still in memory; migration 00056 lets a draft name one.
    const resume = await call(app, 'POST', '/api/v1/resumes', owner.token, { title: 'CV' });
    expect(resume.status).toBe(201);

    // Version 1, then version 2: both rows land in SQL, not in a cache.
    const first = await call(app, 'PUT', `/api/v1/jobs/${jobId}/draft`, owner.token, {
      resumeId: resume.data.resume.id,
      coverLetter: 'First pass.',
      answers: { noticeWeeks: 2 },
      stepIndex: 1,
    });
    expect(first.status).toBe(200);
    expect(first.durability).toBeUndefined();
    const draftId = first.data.draft.id as string;
    const second = await call(app, 'PUT', `/api/v1/jobs/${jobId}/draft`, owner.token, {
      coverLetter: 'Second pass.',
      answers: { noticeWeeks: 2 },
      stepIndex: 1,
      expectedVersion: 1,
    });
    expect(second.status).toBe(200);
    expect(second.data.version).toBe(2);
    const stored = await pool.query(
      'SELECT cover_letter, version, answers FROM public.application_drafts WHERE id = $1 AND candidate_id = $2',
      [draftId, owner.profile.id]
    );
    expect(stored.rows).toMatchObject([
      { cover_letter: 'Second pass.', version: 2, answers: { noticeWeeks: 2 } },
    ]);
    expect(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM public.application_draft_versions WHERE draft_id = $1',
          [draftId]
        )
      ).rows[0].n
    ).toBe(2);

    // A save that read version 1 after version 2 landed is refused.
    const stale = await call(app, 'PUT', `/api/v1/jobs/${jobId}/draft`, owner.token, {
      coverLetter: 'Stale tab.',
      expectedVersion: 1,
    });
    expect(stale.status).toBe(409);

    // Another candidate sees nothing of it.
    expect((await call(app, 'GET', `/api/v1/jobs/${jobId}/draft`, stranger.token)).status).toBe(
      404
    );
    expect((await call(app, 'GET', '/api/v1/applications/drafts', stranger.token)).data.total).toBe(
      0
    );
    expect((await call(app, 'DELETE', `/api/v1/jobs/${jobId}/draft`, stranger.token)).status).toBe(
      404
    );

    await app.close();
    app = await boot();
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'draft-owner@example.org',
      password,
    });
    expect(login.status).toBe(200);
    const token = login.data.token as string;

    const reloaded = await call(app, 'GET', `/api/v1/jobs/${jobId}/draft`, token);
    expect(reloaded.status).toBe(200);
    expect(reloaded.data.draft).toMatchObject({ id: draftId, version: 2, stepIndex: 1 });
    expect(reloaded.data.versions.map((v: { version: number }) => v.version)).toEqual([1, 2]);
    expect((await call(app, 'GET', '/api/v1/applications/drafts', token)).data.total).toBe(1);

    const restored = await call(app, 'POST', `/api/v1/jobs/${jobId}/draft/restore`, token, {
      targetVersion: 1,
    });
    expect(restored.status).toBe(200);
    expect(restored.data.draft).toMatchObject({ version: 3, coverLetter: 'First pass.' });

    // Applying marks the draft submitted in SQL; it leaves the active list.
    expect((await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, token, {})).status).toBe(201);
    expect(
      (
        await pool.query('SELECT is_submitted FROM public.application_drafts WHERE id = $1', [
          draftId,
        ])
      ).rows[0].is_submitted
    ).toBe(true);
    expect((await call(app, 'GET', '/api/v1/applications/drafts', token)).data.total).toBe(0);

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', token, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    expect(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM public.application_drafts WHERE candidate_id = $1',
          [owner.profile.id]
        )
      ).rows[0].n
    ).toBe(0);
  });
});

/**
 * Moderation reports and appeals against real PostgreSQL (plan TS-03,
 * ADR-026, migration 00064). Proves a report, its review, its resolution, an
 * appeal and an upheld appeal's reversal all survive restarts, and that the
 * people on them are stored as user ids, as the RLS policies assume.
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
  throw new Error('TEST_DATABASE_URL is required for portfolio tests.');
}

const dbName = `ts_pgmoderation_${crypto.randomBytes(4).toString('hex')}`;
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

type Json = Record<string, any>;
async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; data: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return { status: res.statusCode, data: res.body ? JSON.parse(res.body) : {} };
}

describe('Moderation report and appeal persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const password = 'long-enough-moderation-password';
  const email = (who: string) => `${who}@moderation-pg.example`;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};
  const restart = async () => {
    await app.close();
    app = await boot();
    for (const who of ['reporter', 'target', 'moderator']) {
      tokens[who] = (
        await call(app, 'POST', '/api/v1/auth/login', undefined, { email: email(who), password })
      ).data.token;
    }
  };

  beforeAll(async () => {
    const root = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await root.connect();
    try {
      await root.query(`CREATE DATABASE ${dbName}`);
    } finally {
      await root.end();
    }
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl });
    app = await boot();
    for (const who of ['reporter', 'target', 'moderator']) {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email: email(who),
        password,
        fullName: who,
        role: 'candidate',
      });
      expect(res.status).toBe(201);
      ids[who] = res.data.user.id;
    }
    // Sessions are checked against the users table, so the role is granted there.
    await pool.query("UPDATE public.users SET roles = ARRAY['moderator'] WHERE email = $1", [
      email('moderator'),
    ]);
    await restart();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('keeps reports, decisions and appeals across restarts, keyed by user id', async () => {
    const filed = await call(app, 'POST', '/api/v1/moderation/reports', tokens.reporter, {
      targetType: 'user',
      targetId: ids.target,
      reason: 'harassment',
      details: 'Repeated abusive messages after being asked to stop.',
    });
    expect(filed.status).toBe(201);
    const reportId = filed.data.report.id as string;

    await restart();

    const mine = await call(app, 'GET', '/api/v1/moderation/reports/my', tokens.reporter);
    expect(mine.data.reports.map((r: Json) => r.id)).toEqual([reportId]);
    const queue = await call(app, 'GET', '/api/v1/moderation/reports', tokens.moderator);
    expect(queue.data.reports).toHaveLength(1);
    expect(
      (
        await call(
          app,
          'PATCH',
          `/api/v1/moderation/reports/${reportId}/status`,
          tokens.moderator,
          {
            status: 'under_review',
          }
        )
      ).status
    ).toBe(200);
    const resolved = await call(
      app,
      'POST',
      `/api/v1/moderation/reports/${reportId}/resolve`,
      tokens.moderator,
      { action: 'warning', resolutionNotes: 'A first warning for abusive messages.' }
    );
    expect(resolved.status).toBe(200);

    await restart();

    // The decision is still there for the person it was about, who appeals it.
    const aboutMe = await call(app, 'GET', '/api/v1/moderation/reports/my', tokens.target);
    expect(aboutMe.data.aboutMe.map((r: Json) => r.id)).toEqual([reportId]);
    expect(aboutMe.data.aboutMe[0]).toMatchObject({ status: 'resolved', actionTaken: 'warning' });
    const appealed = await call(
      app,
      'POST',
      `/api/v1/moderation/reports/${reportId}/appeal`,
      tokens.target,
      { reason: 'The messages were quoted out of context; here is the full thread.' }
    );
    expect(appealed.status).toBe(201);
    const appealId = appealed.data.appeal.id as string;

    await restart();

    const appeals = await call(app, 'GET', '/api/v1/moderation/appeals', tokens.moderator);
    expect(appeals.data.appeals.map((a: Json) => a.id)).toEqual([appealId]);
    const upheld = await call(
      app,
      'POST',
      `/api/v1/moderation/appeals/${appealId}/review`,
      tokens.moderator,
      { decision: 'upheld', decisionNotes: 'Context shows no abuse.' }
    );
    expect(upheld.status).toBe(200);

    await restart();

    const report = await call(
      app,
      'GET',
      `/api/v1/moderation/reports/${reportId}`,
      tokens.moderator
    );
    expect(report.data.report).toMatchObject({ status: 'dismissed', actionTaken: 'dismissed' });
    const rows = await pool.query(
      `SELECT r.reporter_id, r.resolved_by, a.appellant_id, a.reviewed_by, a.status
         FROM public.moderation_reports r JOIN public.moderation_appeals a ON a.report_id = r.id`
    );
    expect(rows.rows[0]).toEqual({
      reporter_id: ids.reporter,
      resolved_by: ids.moderator,
      appellant_id: ids.target,
      reviewed_by: ids.moderator,
      status: 'upheld',
    });
  });
});

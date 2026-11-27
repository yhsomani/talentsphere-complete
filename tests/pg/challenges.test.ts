/**
 * Coding challenges against real PostgreSQL (plan TS-03, ADR-026). Proves a
 * challenge with its skills and hidden tests, a candidate's assessment
 * session and its submission survive restarts; the session's AI block still
 * holds after a restart; and erasure removes the candidate's sessions and
 * submitted code.
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

const dbName = `ts_pgchallenges_${crypto.randomBytes(4).toString('hex')}`;
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

const TS = '10000000-0000-4000-a000-000000000001';

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

describe('Challenge, session and submission persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const password = 'long-enough-challenge-password';
  const email = (who: string) => `${who}@challenges-pg.example`;
  const tokens: Record<string, string> = {};
  const restart = async () => {
    await app.close();
    app = await boot();
    for (const who of ['admin', 'candidate']) {
      tokens[who] = (
        await call(app, 'POST', '/api/v1/auth/login', undefined, { email: email(who), password })
      ).data.token;
    }
  };
  const count = async (table: string) =>
    (await pool.query(`SELECT count(*)::int AS n FROM public.${table}`)).rows[0].n as number;
  const askAi = () =>
    call(app, 'POST', '/api/v1/ai/assistant/query', tokens.candidate, {
      prompt: 'How do I reverse the words in a string?',
    });

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
    for (const who of ['admin', 'candidate']) {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email: email(who),
        password,
        fullName: who,
        role: 'candidate',
      });
      expect(res.status).toBe(201);
    }
    // Sessions are checked against the users table, so the role is granted there.
    await pool.query("UPDATE public.users SET roles = ARRAY['platform_admin'] WHERE email = $1", [
      email('admin'),
    ]);
    await restart();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it("keeps challenges, sessions and submissions across restarts, and erasure removes the candidate's", async () => {
    const created = await call(app, 'POST', '/api/v1/challenges', tokens.admin, {
      slug: 'reverse-words-pg',
      title: 'Reverse words',
      description: 'Reverse the order of words in a sentence.',
      difficulty: 'easy',
      category: 'Strings',
      skillIds: [TS, TS],
      testCases: [
        { id: 'visible-1', input: 'a b', expectedOutput: 'b a', isHidden: false },
        { id: 'hidden-1', input: 'x y z', expectedOutput: 'z y x', isHidden: true },
      ],
    });
    expect(created.status).toBe(201);
    const challengeId = created.data.challenge.id as string;
    expect(
      (
        await call(app, 'POST', '/api/v1/challenges', tokens.admin, {
          slug: 'unknown-skill-pg',
          title: 'Unknown skill',
          description: 'Links a skill that does not exist.',
          difficulty: 'easy',
          category: 'Strings',
          skillIds: ['10000000-0000-4000-a000-0000000000ff'],
          testCases: [
            { id: 'v', input: '1', expectedOutput: '1', isHidden: false },
            { id: 'h', input: '2', expectedOutput: '2', isHidden: true },
          ],
        })
      ).status
    ).toBe(404);

    const started = await call(
      app,
      'POST',
      `/api/v1/challenges/${challengeId}/start-session`,
      tokens.candidate
    );
    expect(started.status).toBe(201);
    expect((await askAi()).status).toBe(403);

    await restart();

    // The AI block of an open AI_PROHIBITED session survives the restart.
    expect((await askAi()).status).toBe(403);
    const listed = await call(app, 'GET', '/api/v1/challenges', tokens.candidate);
    expect(listed.data.challenges).toHaveLength(1);
    expect(listed.data.challenges[0]).toMatchObject({ id: challengeId, skillIds: [TS] });
    expect(listed.data.challenges[0].publicTestCases.map((t: Json) => t.id)).toEqual(['visible-1']);

    const code = 'export const reverse = (s: string) => s.split(" ").reverse().join(" ");';
    const submitted = await call(
      app,
      'POST',
      `/api/v1/challenges/${challengeId}/submit`,
      tokens.candidate,
      {
        language: 'typescript',
        code,
      }
    );
    expect(submitted.status).toBe(200);
    const submissionId = submitted.data.result.submissionId as string;
    expect(submitted.data.evidence.provenance).toBe(`challenge_submission:${submissionId}`);

    await restart();

    expect((await askAi()).status).toBe(200);
    const stored = await pool.query(
      `SELECT s.session_id, s.code, s.status, s.total_cases, a.status AS session_status
         FROM public.challenge_submissions s JOIN public.assessment_sessions a ON a.id = s.session_id
        WHERE s.id = $1`,
      [submissionId]
    );
    expect(stored.rows[0]).toMatchObject({
      session_id: started.data.session.id,
      code,
      status: 'submitted',
      total_cases: 2,
      session_status: 'submitted',
    });

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', tokens.candidate, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    expect(await count('challenge_submissions')).toBe(0);
    expect(await count('assessment_sessions')).toBe(0);
    expect(await count('challenges')).toBe(1);
    expect(await count('challenge_skills')).toBe(1);
  });
});

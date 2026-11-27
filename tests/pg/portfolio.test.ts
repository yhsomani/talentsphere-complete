/**
 * Portfolio projects against real PostgreSQL (plan TS-03, ADR-026). Proves a
 * project with its skills, evidence link and media survives a restart, its
 * visibility still holds for others, edits and deletes are stored, and
 * account erasure removes the rows.
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

const dbName = `ts_pgportfolio_${crypto.randomBytes(4).toString('hex')}`;
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

describe('Portfolio persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const password = 'long-enough-portfolio-password';
  const login = async (who: string) =>
    (
      await call(app, 'POST', '/api/v1/auth/login', undefined, {
        email: `${who}@portfolio-pg.example`,
        password,
      })
    ).data.token as string;
  const count = async (table: string) =>
    (await pool.query(`SELECT count(*)::int AS n FROM public.${table}`)).rows[0].n as number;

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
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('keeps projects across a restart, with their links, visibility, edits and deletes', async () => {
    let tokens: Record<string, string> = {};
    const ids: Record<string, string> = {};
    for (const who of ['owner', 'stranger']) {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email: `${who}@portfolio-pg.example`,
        password,
        fullName: who,
        role: 'candidate',
      });
      expect(res.status).toBe(201);
      tokens[who] = res.data.token;
      ids[who] = res.data.user.id;
    }
    const evidence = await call(app, 'POST', '/api/v1/evidence', tokens.owner, {
      type: 'project',
      title: 'Payments ledger',
      description: 'Double-entry ledger with idempotent writes.',
      source: 'github',
      provenance: 'https://example.com/ledger',
      recencyDate: '2026-06-01',
    });
    expect(evidence.status).toBe(201);
    const evidenceId = evidence.data.evidence.id as string;

    const shown = await call(app, 'POST', '/api/v1/portfolio/projects', tokens.owner, {
      title: 'Ledger service',
      description: 'A ledger service with an audit trail.',
      repoUrl: 'https://example.com/ledger',
      featured: true,
      skillIds: [TS],
      evidenceIds: [evidenceId],
      media: [{ mediaUrl: 'https://images.example.com/ledger.png', caption: 'Architecture' }],
    });
    expect(shown.status).toBe(201);
    const hidden = await call(app, 'POST', '/api/v1/portfolio/projects', tokens.owner, {
      title: 'Private notes',
      description: 'Drafts nobody else should see.',
      visibility: 'private',
    });
    const doomed = await call(app, 'POST', '/api/v1/portfolio/projects', tokens.owner, {
      title: 'Old experiment',
      description: 'An experiment to delete later.',
    });
    expect([hidden.status, doomed.status]).toEqual([201, 201]);
    expect(await count('portfolio_projects')).toBe(3);

    const edited = await call(
      app,
      'PATCH',
      `/api/v1/portfolio/projects/${shown.data.project.id}`,
      tokens.owner,
      { title: 'Ledger service v2' }
    );
    expect(edited.status).toBe(200);
    expect(
      (
        await call(
          app,
          'DELETE',
          `/api/v1/portfolio/projects/${doomed.data.project.id}`,
          tokens.owner
        )
      ).status
    ).toBe(200);

    await app.close();
    app = await boot();
    tokens = { owner: await login('owner'), stranger: await login('stranger') };

    const mine = await call(app, 'GET', '/api/v1/portfolio/projects', tokens.owner);
    expect(mine.data.projects.map((p: Json) => p.title).sort()).toEqual([
      'Ledger service v2',
      'Private notes',
    ]);
    const ledger = mine.data.projects.find((p: Json) => p.title === 'Ledger service v2');
    expect(ledger).toMatchObject({
      featured: true,
      repoUrl: 'https://example.com/ledger',
      skillIds: [TS],
      evidenceIds: [evidenceId],
      media: [
        {
          id: shown.data.project.media[0].id,
          mediaUrl: 'https://images.example.com/ledger.png',
          caption: 'Architecture',
        },
      ],
    });
    const showcase = await call(
      app,
      'GET',
      `/api/v1/portfolio/showcase/${ids.owner}`,
      tokens.stranger
    );
    expect(showcase.data.projects.map((p: Json) => p.title)).toEqual(['Ledger service v2']);
    expect(
      (
        await call(
          app,
          'GET',
          `/api/v1/portfolio/projects/${hidden.data.project.id}`,
          tokens.stranger
        )
      ).status
    ).toBe(403);

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', tokens.owner, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    for (const table of [
      'portfolio_projects',
      'portfolio_project_skills',
      'portfolio_project_evidence',
      'portfolio_project_media',
    ]) {
      expect(await count(table)).toBe(0);
    }
  });
});

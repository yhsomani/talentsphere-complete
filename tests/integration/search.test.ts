import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Multi-Entity Backend Search & Command Palette Integration (F-20, F-34, F-32)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let adminToken: string;
  const adminUserId = '00000000-0000-4000-a000-000000000099';

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Register candidate user
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'search.candidate@example.com',
        password: 'Password123!Secure',
        fullName: 'Devon Public Searchable',
        role: 'candidate',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    candidateToken = body.token;
    candidateUserId = body.user.id;

    // 2. Register private candidate user
    const privRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'private.user@example.com',
        password: 'Password123!Secure',
        fullName: 'Secret Agent Private',
        role: 'candidate',
      },
    });
    expect(privRes.statusCode).toBe(201);
    const privToken = JSON.parse(privRes.body).token;

    // Set privacy to 'private'
    const updateRes = await app.inject({
      method: 'PATCH',
      url: '/api/v1/profile/me',
      headers: {
        authorization: `Bearer ${privToken}`,
      },
      payload: {
        privacy: 'private',
      },
    });
    expect(updateRes.statusCode).toBe(200);

    // 3. Platform Admin token
    adminToken = createSessionToken(
      adminUserId,
      'admin.search@talentsphere.internal',
      ['platform_admin']
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('performs public search matching seeded skills and commands without authentication', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/search?query=typescript',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.query).toBe('typescript');
    expect(body.totalResults).toBeGreaterThanOrEqual(1);

    const hasSkill = body.results.some((r: any) => r.type === 'skill' && r.title.toLowerCase().includes('typescript'));
    expect(hasSkill).toBe(true);
  });

  it('enforces privacy boundary: private profiles are never returned to public or unauthorized search', async () => {
    // 1. Search for public candidate
    const pubSearchRes = await app.inject({
      method: 'GET',
      url: '/api/v1/search?query=Devon&type=profiles',
    });
    expect(pubSearchRes.statusCode).toBe(200);
    const pubBody = JSON.parse(pubSearchRes.body);
    expect(pubBody.results.some((r: any) => r.title.includes('Devon'))).toBe(true);

    // 2. Search for private candidate
    const privSearchRes = await app.inject({
      method: 'GET',
      url: '/api/v1/search?query=Secret+Agent&type=profiles',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
    });
    expect(privSearchRes.statusCode).toBe(200);
    const privBody = JSON.parse(privSearchRes.body);
    expect(privBody.results.length).toBe(0);
  });

  it('filters search results strictly by entity type', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/search?query=type&type=skills',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.results.length).toBeGreaterThanOrEqual(1);
    expect(body.results.every((r: any) => r.type === 'skill')).toBe(true);
  });

  it('returns and filters command palette actions (F-20)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/search?query=jobs&type=commands',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.commands.length).toBeGreaterThanOrEqual(1);
    expect(body.commands.some((c: any) => c.id === 'nav_jobs')).toBe(true);
  });

  it('provides role-aware commands in /api/v1/search/commands', async () => {
    // 1. Candidate caller
    const candRes = await app.inject({
      method: 'GET',
      url: '/api/v1/search/commands',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
    });
    expect(candRes.statusCode).toBe(200);
    const candBody = JSON.parse(candRes.body);
    expect(candBody.commands.some((c: any) => c.id === 'adm_console')).toBe(false);

    // 2. Platform Admin caller
    const adminRes = await app.inject({
      method: 'GET',
      url: '/api/v1/search/commands',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    expect(adminRes.statusCode).toBe(200);
    const adminBody = JSON.parse(adminRes.body);
    expect(adminBody.commands.some((c: any) => c.id === 'adm_console')).toBe(true);
    expect(adminBody.commands.some((c: any) => c.id === 'adm_feature_flags')).toBe(true);
  });

  it('tracks search history for authenticated users and allows clearing history (F-32)', async () => {
    // 1. Execute search as candidate
    await app.inject({
      method: 'GET',
      url: '/api/v1/search?query=React&type=skills',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
    });

    // 2. Query search history
    const histRes = await app.inject({
      method: 'GET',
      url: '/api/v1/search/history',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
    });
    expect(histRes.statusCode).toBe(200);
    const histBody = JSON.parse(histRes.body);
    expect(histBody.history.length).toBeGreaterThanOrEqual(1);
    expect(histBody.history[0].query).toBe('React');

    // 3. Clear search history
    const delRes = await app.inject({
      method: 'DELETE',
      url: '/api/v1/search/history',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
      payload: {},
    });
    expect(delRes.statusCode).toBe(200);

    // 4. Verify history is empty
    const verifyHistRes = await app.inject({
      method: 'GET',
      url: '/api/v1/search/history',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
    });
    const verifyBody = JSON.parse(verifyHistRes.body);
    expect(verifyBody.history.length).toBe(0);
  });
});

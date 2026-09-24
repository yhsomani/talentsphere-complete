import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Challenges Arena & Assessment Engine Integration Suite (F-08, SSOT Section D)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let adminToken: string;
  let adminUserId: string;
  let challengeId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 4004,
      APP_VERSION: '1.0.0-test',
    });
    await app.ready();

    // 1. Register candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'challenger@example.com',
        password: 'Password123!',
        fullName: 'Challenger Dev',
        role: 'candidate',
      },
    });
    const candBody = JSON.parse(candRes.body);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;
    candidateProfileId = candBody.profile.id;

    // 2. Admin token
    adminUserId = 'a0000000-0000-4000-a000-000000000001';
    adminToken = createSessionToken(adminUserId, 'admin@talentsphere.io', ['platform_admin']);

    // 3. Fetch seeded challenge
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/challenges',
    });
    const listBody = JSON.parse(listRes.body);
    challengeId = listBody.challenges[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('filters challenge representation to hide hidden test cases from candidates (BR-51)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/challenges/${challengeId}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.challenge).toBeDefined();
    expect(body.challenge.publicTestCases).toBeDefined();
    expect(body.challenge.publicTestCases.length).toBeGreaterThanOrEqual(1);

    // Ensure hidden test cases are completely omitted from response
    const raw = res.body;
    expect(raw).not.toContain('"isHidden":true');
    expect(raw).not.toContain('"world hello"'); // Expected output of hidden test case
  });

  it('strictly enforces SSOT Section D: blocks AI Assistant during active AI_PROHIBITED session', async () => {
    // 1. Before assessment, candidate can query AI Assistant
    const preRes = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/assistant/query',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        prompt: 'How do I optimize string reversal in TypeScript?',
      },
    });
    expect(preRes.statusCode).toBe(200);

    // 2. Candidate starts proctored assessment session (policy: AI_PROHIBITED)
    const sessionRes = await app.inject({
      method: 'POST',
      url: `/api/v1/challenges/${challengeId}/start-session`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(sessionRes.statusCode).toBe(201);
    const session = JSON.parse(sessionRes.body).session;
    expect(session.status).toBe('in_progress');
    expect(session.policyMode).toBe('AI_PROHIBITED');

    // 3. Mandatory server-side enforcement: AI query must fail with 403
    const blockedRes = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/assistant/query',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        prompt: 'Give me the solution to this challenge.',
      },
    });

    expect(blockedRes.statusCode).toBe(403);
    const blockedBody = JSON.parse(blockedRes.body);
    expect(blockedBody.error.code).toBe('ASSESSMENT_AI_PROHIBITED');
    expect(blockedBody.error.message).toContain('AI assistance is strictly prohibited during an active proctored assessment session');
  });

  it('evaluates solution, closes session, auto-mints verified evidence, and unlocks AI (F-08, BR-49, BR-25)', async () => {
    // 1. Submit solution
    const submitRes = await app.inject({
      method: 'POST',
      url: `/api/v1/challenges/${challengeId}/submit`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        language: 'typescript',
        code: 'function reverseWords(s: string): string { return s.trim().split(/\\s+/).reverse().join(" "); }',
      },
    });

    expect(submitRes.statusCode).toBe(200);
    const submitBody = JSON.parse(submitRes.body);
    expect(submitBody.result.status).toBe('passed');
    expect(submitBody.result.score).toBe(100);
    expect(submitBody.xpEarned).toBeGreaterThan(0);

    // 2. Verify auto-minted Evidence
    expect(submitBody.evidence).toBeDefined();
    expect(submitBody.evidence.type).toBe('assessment');
    expect(submitBody.evidence.verificationLevel).toBe('authority_verified');
    expect(submitBody.evidence.status).toBe('verified');

    // 3. Verify evidence is retrievable via Evidence API
    const evRes = await app.inject({
      method: 'GET',
      url: `/api/v1/evidence/${submitBody.evidence.id}`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(evRes.statusCode).toBe(200);

    // 4. Verify XP ledger recorded transaction
    const xpRes = await app.inject({
      method: 'GET',
      url: '/api/v1/xp/ledger',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(xpRes.statusCode).toBe(200);
    const xpBody = JSON.parse(xpRes.body);
    expect(xpBody.totalXp).toBe(submitBody.xpEarned);
    expect(xpBody.transactions).toHaveLength(1);

    // 5. Post-assessment AI query succeeds now that active session is concluded
    const postRes = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/assistant/query',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        prompt: 'Can you analyze the time complexity of my submission?',
      },
    });
    expect(postRes.statusCode).toBe(200);
  });

  it('allows admin to create challenge with split test cases (BR-51)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/challenges',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        slug: 'fibonacci-number',
        title: 'Fibonacci Number',
        description: 'Compute the n-th Fibonacci number.',
        difficulty: 'easy',
        category: 'Dynamic Programming',
        testCases: [
          { input: '2', expectedOutput: '1', isHidden: false },
          { input: '4', expectedOutput: '3', isHidden: true },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.challenge.slug).toBe('fibonacci-number');
    expect(body.challenge.policyMode).toBe('AI_PROHIBITED');
  });
});

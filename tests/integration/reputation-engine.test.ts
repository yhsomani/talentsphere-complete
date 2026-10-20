import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Integration: Multi-Context Reputation Engine (F-144, S-03, BR-247..BR-254)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let penaltySignalId: string;
  let recoveryPlanId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    });
    await app.ready();

    // 1. Register Candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `cand.rep.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Robin RepCandidate',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.payload);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;

    // 2. Register Recruiter
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `rec.rep.${Date.now()}@cloudcorp.io`,
        password: 'Password123!',
        fullName: 'Morgan Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recBody = JSON.parse(recRes.payload);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;
  });

  it('provides baseline reputation score of 50 in developing band when user has no prior signals', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/users/${candidateUserId}?context=candidate&domain=general`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.scores).toHaveLength(1);
    expect(body.scores[0].score).toBe(50);
    expect(body.scores[0].band).toBe('developing');
    expect(body.scores[0].signalCount).toBe(0);
    expect(body.scores[0].confidenceScore).toBe(0);
  });

  const moderatorToken = createSessionToken(
    '00000000-0000-4000-a000-0000000000c1',
    'moderator.reputation@talentsphere.internal',
    ['moderator']
  );

  it('refuses reputation signals written by ordinary accounts (SEC-01)', async () => {
    for (const payload of [
      // raising one's own score
      {
        context: 'candidate',
        domain: 'general',
        signalType: 'credential',
        rawValue: 100,
        weight: 5,
      },
      // penalising someone else
      {
        targetUserId: candidateUserId,
        context: 'candidate',
        domain: 'general',
        signalType: 'penalty',
        rawValue: -100,
        weight: 5,
      },
    ]) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/reputation/signals',
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload,
      });
      expect(res.statusCode).toBe(403);
    }
  });

  it('aggregates signals, computes domain reputation, and maintains context isolation (F-144)', async () => {
    // 1. A moderator records a verified credential in distributed_systems
    const credRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/signals',
      headers: { authorization: `Bearer ${moderatorToken}` },
      payload: {
        targetUserId: candidateUserId,
        context: 'candidate',
        domain: 'distributed_systems',
        signalType: 'credential',
        rawValue: 60,
        weight: 2.0,
      },
    });
    expect(credRes.statusCode).toBe(201);
    const credBody = JSON.parse(credRes.payload);
    expect(credBody.updatedScore.score).toBeGreaterThan(50);
    expect(['high', 'exceptional']).toContain(credBody.updatedScore.band);

    // 2. An instructor-context signal for the same person
    const instRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/signals',
      headers: { authorization: `Bearer ${moderatorToken}` },
      payload: {
        targetUserId: candidateUserId,
        context: 'instructor',
        domain: 'distributed_systems',
        signalType: 'review',
        rawValue: 15,
        weight: 1.0,
      },
    });
    expect(instRes.statusCode).toBe(201);

    // 3. Query candidate context: isolated from instructor signal
    const candQuery = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/users/${candidateUserId}?context=candidate`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candQuery.statusCode).toBe(200);
    const candQueryBody = JSON.parse(candQuery.payload);
    expect(candQueryBody.scores).toHaveLength(1);
    expect(candQueryBody.scores[0].context).toBe('candidate');
    expect(candQueryBody.scores[0].signalCount).toBe(1);

    // 4. Query instructor context: isolated
    const instQuery = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/users/${candidateUserId}?context=instructor`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(instQuery.statusCode).toBe(200);
    const instQueryBody = JSON.parse(instQuery.payload);
    expect(instQueryBody.scores).toHaveLength(1);
    expect(instQueryBody.scores[0].context).toBe('instructor');
    expect(instQueryBody.scores[0].signalCount).toBe(1);
  });

  it('refuses a recruiter with no application to the candidate, and never leaks signals (BR-167, BR-253)', async () => {
    // BR-167: reputation is private by default. A recruiter whose organization
    // has no application from this candidate is refused outright.
    const refused = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/users/${candidateUserId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(refused.statusCode).toBe(403);
    expect(JSON.parse(refused.payload).scores).toBeUndefined();

    // The candidate reads their own aggregated scores, still without raw signals.
    const ownRes = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/users/${candidateUserId}`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(ownRes.statusCode).toBe(200);
    const publicBody = JSON.parse(ownRes.payload);
    expect(publicBody.scores).toBeDefined();
    // Signals array must not exist on the aggregated endpoint
    expect(publicBody.signals).toBeUndefined();

    // Candidate queries their own private signals
    const privateRes = await app.inject({
      method: 'GET',
      url: '/api/v1/reputation/my/signals',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(privateRes.statusCode).toBe(200);
    const privateBody = JSON.parse(privateRes.payload);
    expect(privateBody.signals.length).toBeGreaterThanOrEqual(2);
    expect(privateBody.signals[0].rawValue).toBeDefined();
  });

  it('records penalty signal and executes structured reputation recovery plan to rebound score', async () => {
    // 1. A moderator records a penalty
    const penRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/signals',
      headers: { authorization: `Bearer ${moderatorToken}` },
      payload: {
        targetUserId: candidateUserId,
        context: 'candidate',
        domain: 'distributed_systems',
        signalType: 'penalty',
        rawValue: -45,
        weight: 2.0,
      },
    });
    expect(penRes.statusCode).toBe(201);
    const penBody = JSON.parse(penRes.payload);
    penaltySignalId = penBody.signal.id;
    const penalizedScore = penBody.updatedScore.score;

    // 2. Start recovery plan
    const recovRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/recovery',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        context: 'candidate',
        penaltySignalId,
        targetReboundPoints: 50,
        tasks: [
          { description: 'Complete Algorithmic Integrity Assessment', points: 30 },
          { description: 'Mentor 2 Peer Code Reviews', points: 25 },
        ],
      },
    });
    expect(recovRes.statusCode).toBe(201);
    const recovBody = JSON.parse(recovRes.payload);
    recoveryPlanId = recovBody.plan.id;
    expect(recovBody.plan.status).toBe('in_progress');
    expect(recovBody.plan.reboundTasks).toHaveLength(2);

    const task1Id = recovBody.plan.reboundTasks[0].id;
    const task2Id = recovBody.plan.reboundTasks[1].id;

    // The penalised person cannot sign off their own tasks (SEC-01).
    const selfConfirm = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/recovery/${recoveryPlanId}/tasks/${task1Id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(selfConfirm.statusCode).toBe(403);

    // 3. A moderator confirms Task 1 (30 pts, target 50 -> in_progress)
    const step1Res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/recovery/${recoveryPlanId}/tasks/${task1Id}/complete`,
      headers: { authorization: `Bearer ${moderatorToken}` },
    });
    expect(step1Res.statusCode).toBe(200);
    const step1Body = JSON.parse(step1Res.payload);
    expect(step1Body.isFullyRecovered).toBe(false);
    expect(step1Body.plan.status).toBe('in_progress');

    // 4. Task 2 confirmed (25 pts -> 55 >= 50 -> full recovery!)
    const step2Res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/recovery/${recoveryPlanId}/tasks/${task2Id}/complete`,
      headers: { authorization: `Bearer ${moderatorToken}` },
    });
    expect(step2Res.statusCode).toBe(200);
    const step2Body = JSON.parse(step2Res.payload);
    expect(step2Body.isFullyRecovered).toBe(true);
    expect(step2Body.plan.status).toBe('completed');
    expect(step2Body.updatedScore).toBeDefined();
    // Reputation rebounds higher than the penalized score!
    expect(step2Body.updatedScore.score).toBeGreaterThan(penalizedScore);
  });

  it('refuses the platform-wide reputation recomputation to anyone but a platform admin (G-04)', async () => {
    const anonymous = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/recalculate-all',
    });
    expect(anonymous.statusCode).toBe(401);

    for (const token of [candidateToken, recruiterToken]) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/reputation/recalculate-all',
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(403);
    }
  });

  it('runs nightly recalculation batch across all active scores', async () => {
    const adminToken = createSessionToken(
      '00000000-0000-4000-a000-0000000000ae',
      'admin.reputation@talentsphere.internal',
      ['platform_admin']
    );
    const recalcRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/recalculate-all',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(recalcRes.statusCode).toBe(200);
    const recalcBody = JSON.parse(recalcRes.payload);
    expect(recalcBody.updatedCount).toBeGreaterThanOrEqual(1);
    expect(recalcBody.message).toContain('recomputed successfully');
  });
});

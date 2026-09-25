import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

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
      SESSION_SECRET: 'test-session-secret-at-least-32-characters-long',
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
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.scores).toHaveLength(1);
    expect(body.scores[0].score).toBe(50);
    expect(body.scores[0].band).toBe('developing');
    expect(body.scores[0].signalCount).toBe(0);
    expect(body.scores[0].confidenceScore).toBe(0);
  });

  it('aggregates signals, computes domain reputation, and maintains context isolation (F-144)', async () => {
    // 1. Candidate adds verified credential in distributed_systems
    const credRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/signals',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
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

    // 2. Candidate adds instructor signal in different context
    const instRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/signals',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
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
      headers: { authorization: `Bearer ${recruiterToken}` },
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
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(instQuery.statusCode).toBe(200);
    const instQueryBody = JSON.parse(instQuery.payload);
    expect(instQueryBody.scores).toHaveLength(1);
    expect(instQueryBody.scores[0].context).toBe('instructor');
    expect(instQueryBody.scores[0].signalCount).toBe(1);
  });

  it('guarantees zero individual signal leakage to other users while allowing owner private inspection (BR-253)', async () => {
    // Recruiter queries candidate reputation -> only aggregated scores, no raw signals
    const publicRes = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/users/${candidateUserId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(publicRes.statusCode).toBe(200);
    const publicBody = JSON.parse(publicRes.payload);
    expect(publicBody.scores).toBeDefined();
    // Signals array must not exist on public endpoint
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
    // 1. Record penalty signal
    const penRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/signals',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
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

    // 3. Complete Task 1 (30 pts, target 50 -> in_progress)
    const step1Res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/recovery/${recoveryPlanId}/tasks/${task1Id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(step1Res.statusCode).toBe(200);
    const step1Body = JSON.parse(step1Res.payload);
    expect(step1Body.isFullyRecovered).toBe(false);
    expect(step1Body.plan.status).toBe('in_progress');

    // 4. Complete Task 2 (25 pts -> 55 >= 50 -> full recovery!)
    const step2Res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/recovery/${recoveryPlanId}/tasks/${task2Id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(step2Res.statusCode).toBe(200);
    const step2Body = JSON.parse(step2Res.payload);
    expect(step2Body.isFullyRecovered).toBe(true);
    expect(step2Body.plan.status).toBe('completed');
    expect(step2Body.updatedScore).toBeDefined();
    // Reputation rebounds higher than the penalized score!
    expect(step2Body.updatedScore.score).toBeGreaterThan(penalizedScore);
  });

  it('runs nightly recalculation batch across all active scores', async () => {
    const recalcRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/recalculate-all',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(recalcRes.statusCode).toBe(200);
    const recalcBody = JSON.parse(recalcRes.payload);
    expect(recalcBody.updatedCount).toBeGreaterThanOrEqual(1);
    expect(recalcBody.message).toContain('recomputed successfully');
  });
});

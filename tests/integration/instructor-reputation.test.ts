import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Instructor Reputation System Integration (F-148, F-72, F-144)', () => {
  let app: FastifyInstance;
  let instructor1Token: string;
  let instructor1Id: string;
  let instructor2Token: string;
  let instructor2Id: string;
  let candidateToken: string;
  let candidateId: string;
  let adminToken: string;
  const adminId = '00000000-0000-4000-a000-000000000099';

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Instructor 1
    instructor1Id = '00000000-0000-4000-a000-000000000101';
    instructor1Token = createSessionToken(
      instructor1Id,
      'prof.smith@university.edu',
      ['instructor']
    );

    // 2. Instructor 2
    instructor2Id = '00000000-0000-4000-a000-000000000102';
    instructor2Token = createSessionToken(
      instructor2Id,
      'dr.curie@institute.org',
      ['instructor']
    );

    // 3. Student Candidate
    candidateId = '00000000-0000-4000-a000-000000000103';
    candidateToken = createSessionToken(
      candidateId,
      'student.bob@learner.io',
      ['candidate']
    );

    // 4. Admin session token
    adminToken = createSessionToken(adminId, 'admin@talentsphere.internal', ['platform_admin']);
  });

  afterAll(async () => {
    await app.close();
  });

  it('retrieves transparent factor breakdown for an instructor with zero PII leakage', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/instructors/${instructor1Id}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.instructorId).toBe(instructor1Id);
    expect(body.compositeScore).toBeGreaterThanOrEqual(0);
    expect(body.compositeScore).toBeLessThanOrEqual(100);
    expect(body.band).toBeDefined();

    // Transparent factor breakdown (F-148 Acceptance)
    expect(body.factors.courseQuality).toBeDefined();
    expect(body.factors.teachingEffectiveness).toBeDefined();
    expect(body.factors.currency).toBeDefined();
    expect(body.factors.responsiveness).toBeDefined();
    expect(body.factors.communityStanding).toBeDefined();

    // Verification: Zero raw student reviews or personal identifiers leaked
    expect(body.rawReviews).toBeUndefined();
    expect(body.studentIds).toBeUndefined();
  });

  it('allows instructor to submit operational metrics and recomputes composite score', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/instructors/${instructor1Id}/metrics`,
      headers: {
        authorization: `Bearer ${instructor1Token}`,
      },
      payload: {
        completionRate: 92.5,
        daysSinceLastCourseUpdate: 15,
        avgQaResponseHours: 3.5,
        qaAnsweredRate: 98.0,
        activeCoursesCount: 4,
        reviews: [
          { id: 'rev-1', rating: 5, isVerifiedEnrollment: true },
          { id: 'rev-2', rating: 5, isVerifiedEnrollment: true },
          { id: 'rev-3', rating: 4, isVerifiedEnrollment: true },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.profile.compositeScore).toBeGreaterThanOrEqual(75);
    expect(body.profile.factors.courseQuality.score).toBeGreaterThan(80);
    expect(body.profile.factors.responsiveness.score).toBeGreaterThan(95);
  });

  it('prevents unauthorized users from updating instructor metrics', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/instructors/${instructor1Id}/metrics`,
      headers: {
        authorization: `Bearer ${candidateToken}`, // Student cannot submit instructor operational metrics
      },
      payload: {
        completionRate: 50.0,
        daysSinceLastCourseUpdate: 100,
        avgQaResponseHours: 40.0,
        qaAnsweredRate: 50.0,
        activeCoursesCount: 1,
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('allows peer instructor to endorse and updates community standing', async () => {
    // 1. Instructor 2 endorses Instructor 1
    const endorseRes = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/instructors/${instructor1Id}/endorse`,
      headers: {
        authorization: `Bearer ${instructor2Token}`,
      },
      payload: {
        skillDomain: 'Computer Architecture',
        notes: 'World-class pedagogy in RISC-V pipelined processors',
      },
    });

    expect(endorseRes.statusCode).toBe(201);
    const body = JSON.parse(endorseRes.body);
    expect(body.endorsement.skillDomain).toBe('computer architecture');
    expect(body.profile.factors.communityStanding.score).toBe(20); // 1 endorsement = 20 pts
  });

  it('prevents self-endorsement and duplicate endorsements', async () => {
    // 1. Self-endorsement rejected
    const selfRes = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/instructors/${instructor1Id}/endorse`,
      headers: {
        authorization: `Bearer ${instructor1Token}`,
      },
      payload: {
        skillDomain: 'Computer Architecture',
      },
    });
    expect(selfRes.statusCode).toBe(403);

    // 2. Duplicate endorsement rejected
    const dupRes = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/instructors/${instructor1Id}/endorse`,
      headers: {
        authorization: `Bearer ${instructor2Token}`,
      },
      payload: {
        skillDomain: 'Computer Architecture',
      },
    });
    expect(dupRes.statusCode).toBe(409);
  });

  it('allows student to submit review and adjusts teaching effectiveness', async () => {
    const revRes = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/instructors/${instructor1Id}/reviews`,
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
      payload: {
        rating: 5,
        isVerifiedEnrollment: true,
        feedback: 'Superb explanations of cache hierarchy and memory stalls!',
      },
    });

    expect(revRes.statusCode).toBe(201);
    const body = JSON.parse(revRes.body);
    expect(body.compositeScore).toBeGreaterThanOrEqual(50);
    expect(body.factorBreakdown.teachingEffectiveness.score).toBeGreaterThan(0);
  });

  it('executes nightly batch recomputation under admin authority', async () => {
    // Non-admin receives 403
    const unauthRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/instructors/recompute',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
    });
    expect(unauthRes.statusCode).toBe(403);

    // Admin succeeds
    const adminRes = await app.inject({
      method: 'POST',
      url: '/api/v1/reputation/instructors/recompute',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    expect(adminRes.statusCode).toBe(200);
    const body = JSON.parse(adminRes.body);
    expect(body.recomputedCount).toBeGreaterThanOrEqual(1);
  });
});

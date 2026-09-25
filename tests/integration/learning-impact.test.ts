import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { CORRELATION_DISCLAIMER_LABEL } from '../../packages/domain/src/learning-impact.js';

describe('Learning Impact Dashboard & Tracking Integration (F-153, F-114, BR-189..BR-193, OD-51)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateId: string;
  const seedCourseId = 'c0000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // Register Candidate
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'learner.impact@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Impact Learner',
        role: 'candidate',
      },
    });
    const d = JSON.parse(reg.body);
    candidateId = d.user.id;
    candidateToken = d.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/learning/impact/outcomes (BR-190)', () => {
    it('records a learner career outcome with explicit consent (201)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/learning/impact/outcomes',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          courseId: seedCourseId,
          hiredWithin12m: true,
          salaryGrowthPct: 24.5,
          jobSatisfactionScore: 4.8,
          retentionMonths: 12,
          promotedWithin18m: true,
          skillsUsedOnJob: ['TypeScript', 'Fastify'],
          consentFlag: true,
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.outcome).toBeDefined();
      expect(data.outcome.courseId).toBe(seedCourseId);
      expect(data.outcome.hiredWithin12m).toBe(true);
      expect(data.outcome.salaryGrowthPct).toBe(24.5);
      expect(data.outcome.jobSatisfactionScore).toBe(4.8);
      expect(data.outcome.consentFlag).toBe(true);
    });

    it('rejects recording when consentFlag is false (BR-190 policy violation, 422)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/learning/impact/outcomes',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          courseId: seedCourseId,
          hiredWithin12m: true,
          consentFlag: false,
        },
      });

      expect(res.statusCode).toBe(422);
      const data = JSON.parse(res.body);
      expect(data.error.code).toBe('POLICY_VIOLATION');
      expect(data.error.message).toContain('BR-190');
    });

    it('rejects unauthenticated outcome submissions (401)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/learning/impact/outcomes',
        payload: {
          courseId: seedCourseId,
          hiredWithin12m: true,
          consentFlag: true,
        },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/learning/impact/courses/:courseId (BR-189, BR-193, OD-51)', () => {
    it('retrieves publishable course impact metrics when sample count >= 30', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/learning/impact/courses/${seedCourseId}?minCohortSize=30`,
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.courseId).toBe(seedCourseId);
      expect(data.metrics.sampleCount).toBeGreaterThanOrEqual(30);
      expect(data.metrics.isPublishable).toBe(true);
      expect(data.metrics.hireRatePct).toBeGreaterThan(0);
      expect(data.metrics.pathEffectivenessScore).toBeGreaterThan(0);
      // BR-193, OD-51: All outcome claims labelled as correlational
      expect(data.metrics.correlationalClaimLabel).toBe(CORRELATION_DISCLAIMER_LABEL);
    });

    it('suppresses publication when cohort size is below threshold', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/learning/impact/courses/${seedCourseId}?minCohortSize=100`, // Requesting higher threshold
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.isPublishable).toBe(false);
      expect(data.message).toContain('Insufficient measurable outcome data');
      expect(data.correlationalClaimLabel).toBe(CORRELATION_DISCLAIMER_LABEL);
    });
  });

  describe('POST /api/v1/learning/impact/courses/:courseId/compute (BR-191)', () => {
    it('recomputes course impact metrics successfully (201)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/learning/impact/courses/${seedCourseId}/compute`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          enrolledCount: 50,
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.cohortSize).toBe(50);
      expect(data.metrics.sampleCount).toBeGreaterThan(0);
    });

    it('returns 404 for non-existent course', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/learning/impact/courses/00000000-0000-0000-0000-000000000999/compute',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: { enrolledCount: 10 },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/learning/impact/dashboard (F-153)', () => {
    it('retrieves the platform learning impact dashboard', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/learning/impact/dashboard?limit=5',
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.dashboard).toBeDefined();
      expect(data.dashboard.totalCoursesTracked).toBeGreaterThan(0);
      expect(data.dashboard.totalOutcomesSampled).toBeGreaterThanOrEqual(30);
      expect(data.dashboard.averageHireRatePct).toBeGreaterThan(0);
      expect(data.dashboard.topPerformingCourses).toBeDefined();
      expect(data.dashboard.correlationalDisclaimer).toBe(CORRELATION_DISCLAIMER_LABEL);
    });
  });
});

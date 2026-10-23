import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { adminToken } from '../helpers/content.js';

describe('Skill Supply/Demand Forecasting Integration (F-151, F-84, F-86, F-97)', () => {
  let app: FastifyInstance;
  let recruiterToken: string;
  let recruiterId: string;
  const canonicalSkillId = '10000000-0000-4000-a000-000000000001'; // TypeScript

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    });
    await app.ready();

    // Register Recruiter
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'recruiter.forecast@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Forecast Recruiter',
        role: 'recruiter',
      },
    });
    const d = JSON.parse(reg.body);
    recruiterId = d.user.id;
    recruiterToken = d.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/skills/forecast/top-growth', () => {
    it('lists nothing, and invents no figures, before any market data is recorded', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/skills/forecast/top-growth?limit=5',
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).topEmergingSkills).toEqual([]);

      const forecast = await app.inject({
        method: 'GET',
        url: `/api/v1/skills/${canonicalSkillId}/forecast`,
      });
      expect(forecast.statusCode).toBe(404);

      const generate = await app.inject({
        method: 'POST',
        url: `/api/v1/skills/${canonicalSkillId}/forecast/generate`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: { forecastHorizonMonths: 12, prerequisiteDepth: 1 },
      });
      expect(generate.statusCode).toBe(404);
    });

    it('ranks a skill once market data has been recorded for it', async () => {
      const record = await app.inject({
        method: 'POST',
        url: `/api/v1/skills/${canonicalSkillId}/market-signals`,
        headers: { authorization: `Bearer ${adminToken()}` },
        payload: {
          demandPostingsCount: 1650,
          activeCandidatesCount: 1050,
          avgSalaryOffered: 142000,
          geographicRegion: 'Global',
          industry: 'Technology',
        },
      });
      expect(record.statusCode).toBe(201);

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/skills/forecast/top-growth?limit=5',
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(Array.isArray(data.topEmergingSkills)).toBe(true);
      expect(data.topEmergingSkills.map((s: { skillId: string }) => s.skillId)).toEqual([
        canonicalSkillId,
      ]);
      expect(data.topEmergingSkills[0]).toHaveProperty('emergingScore');
      expect(data.topEmergingSkills[0].forecast.confidenceLevel).toBe(0.95);
    });
  });

  describe('POST /api/v1/skills/:skillId/market-signals', () => {
    it('refuses a signed-in account that is not a platform admin (403)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/skills/${canonicalSkillId}/market-signals`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: { demandPostingsCount: 999999, activeCandidatesCount: 1, avgSalaryOffered: 1 },
      });
      expect(res.statusCode).toBe(403);
    });

    it('records a labor market signal when a platform admin supplies it', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/skills/${canonicalSkillId}/market-signals`,
        headers: { authorization: `Bearer ${adminToken()}` },
        payload: {
          demandPostingsCount: 2200,
          activeCandidatesCount: 1200,
          avgSalaryOffered: 155000,
          geographicRegion: 'Remote / US',
          industry: 'FinTech',
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.signal).toBeDefined();
      expect(data.signal.skillId).toBe(canonicalSkillId);
      expect(data.signal.demandPostingsCount).toBe(2200);
      expect(data.signal.activeCandidatesCount).toBe(1200);
      expect(data.signal.avgSalaryOffered).toBe(155000);
      expect(data.signal.geographicRegion).toBe('Remote / US');
      expect(data.signal.industry).toBe('FinTech');
    });

    it('rejects unauthenticated requests', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/skills/${canonicalSkillId}/market-signals`,
        payload: {
          demandPostingsCount: 100,
          activeCandidatesCount: 80,
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it('returns 404 for non-existent skill ID', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/skills/99999999-9999-4000-a000-999999999999/market-signals',
        headers: { authorization: `Bearer ${adminToken()}` },
        payload: {
          demandPostingsCount: 100,
          activeCandidatesCount: 80,
        },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/skills/:skillId/forecast', () => {
    it('retrieves forward-looking forecast with confidence intervals and distributions', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/skills/${canonicalSkillId}/forecast?forecastHorizonMonths=12`,
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.skillId).toBe(canonicalSkillId);
      expect(data.forecast).toBeDefined();
      expect(data.forecast.forecastHorizonMonths).toBe(12);
      expect(data.forecast.confidenceLevel).toBe(0.95);
      expect(data.forecast.projectedMedianSalary).toBeGreaterThan(0);
      expect(data.forecast.salaryLowerBound).toBeLessThanOrEqual(
        data.forecast.projectedMedianSalary
      );
      expect(data.forecast.salaryUpperBound).toBeGreaterThanOrEqual(
        data.forecast.projectedMedianSalary
      );
      expect(data.forecast.scarcityIndex).toBeGreaterThan(0);
      expect(data.forecast.regionalDistribution).toBeDefined();
      expect(data.forecast.industryDistribution).toBeDefined();
    });

    it('returns 404 for non-existent skill ID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/skills/99999999-9999-4000-a000-999999999999/forecast',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/skills/:skillId/forecast/generate', () => {
    it('refuses a candidate, who may not replace the shared forecast (403)', async () => {
      const reg = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'candidate.forecast@talentsphere.test',
          password: 'Password123!Secure',
          fullName: 'Forecast Candidate',
          role: 'candidate',
        },
      });
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/skills/${canonicalSkillId}/forecast/generate`,
        headers: { authorization: `Bearer ${JSON.parse(reg.body).token}` },
        payload: { forecastHorizonMonths: 6, prerequisiteDepth: 1 },
      });
      expect(res.statusCode).toBe(403);
    });

    it('triggers explicit recomputation with custom horizon and prerequisite depth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/skills/${canonicalSkillId}/forecast/generate`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          forecastHorizonMonths: 24,
          prerequisiteDepth: 3,
          skillCategory: 'Programming Languages',
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.forecast).toBeDefined();
      expect(data.forecast.forecastHorizonMonths).toBe(24);
      expect(data.forecast.estimatedWeeksToMarketability).toBeGreaterThanOrEqual(8 + 3 * 4);
    });
  });
});

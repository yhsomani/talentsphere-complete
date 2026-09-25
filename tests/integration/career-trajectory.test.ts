import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Career Trajectory Analysis Integration (F-152, F-85, BR-157..BR-163)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateId: string;
  let secondCandidateToken: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // Register Candidate 1
    const reg1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'candidate.career1@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Trajectory Candidate One',
        role: 'candidate',
      },
    });
    const d1 = JSON.parse(reg1.body);
    candidateId = d1.user.id;
    candidateToken = d1.token;

    // Register Candidate 2
    const reg2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'candidate.career2@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Trajectory Candidate Two',
        role: 'candidate',
      },
    });
    const d2 = JSON.parse(reg2.body);
    secondCandidateToken = d2.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/career/transitions (BR-157, BR-159, BR-161)', () => {
    it('records a new career transition with explicit opt-in consent (201)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/career/transitions',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          fromRole: 'Software Engineer',
          toRole: 'Senior Software Engineer',
          salaryDelta: 28000,
          timeInRoleMonths: 26,
          consentFlag: true,
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.transition).toBeDefined();
      expect(data.transition.fromRole).toBe('Software Engineer');
      expect(data.transition.toRole).toBe('Senior Software Engineer');
      expect(data.transition.salaryDelta).toBe(28000);
      expect(data.transition.timeInRoleMonths).toBe(26);
      expect(data.transition.consentFlag).toBe(true);
    });

    it('rejects recording when consentFlag is false (BR-157: policy violation, 422)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/career/transitions',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          fromRole: 'Software Engineer',
          toRole: 'Senior Software Engineer',
          salaryDelta: 20000,
          timeInRoleMonths: 24,
          consentFlag: false,
        },
      });

      expect(res.statusCode).toBe(422);
      const data = JSON.parse(res.body);
      expect(data.error.code).toBe('POLICY_VIOLATION');
      expect(data.error.message).toContain('BR-157');
    });

    it('rejects identical origin and destination roles (422)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/career/transitions',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          fromRole: 'Software Engineer',
          toRole: 'software engineer',
          salaryDelta: 10000,
          timeInRoleMonths: 18,
          consentFlag: true,
        },
      });

      expect(res.statusCode).toBe(422);
      const data = JSON.parse(res.body);
      expect(data.error.message).toContain('cannot be identical');
    });

    it('rejects unauthenticated requests (401)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/career/transitions',
        payload: {
          fromRole: 'Software Engineer',
          toRole: 'Senior Software Engineer',
          salaryDelta: 20000,
          timeInRoleMonths: 24,
          consentFlag: true,
        },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/career/transitions/my (BR-159)', () => {
    it('returns only the current authenticated candidate transitions', async () => {
      const res1 = await app.inject({
        method: 'GET',
        url: '/api/v1/career/transitions/my',
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res1.statusCode).toBe(200);
      const data1 = JSON.parse(res1.body);
      expect(data1.transitions.length).toBeGreaterThan(0);
      expect(data1.transitions[0].fromRole).toBe('Software Engineer');

      // Candidate 2 has no recorded transitions
      const res2 = await app.inject({
        method: 'GET',
        url: '/api/v1/career/transitions/my',
        headers: { authorization: `Bearer ${secondCandidateToken}` },
      });

      expect(res2.statusCode).toBe(200);
      const data2 = JSON.parse(res2.body);
      expect(data2.transitions.length).toBe(0);
    });
  });

  describe('GET /api/v1/career/benchmarks (BR-160, BR-163)', () => {
    it('returns benchmarks meeting the k-anonymity threshold (>= 20 data points)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/career/benchmarks?minSamples=20',
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.benchmarks).toBeDefined();
      expect(data.benchmarks.length).toBeGreaterThan(0);

      // All returned benchmarks must have sampleCount >= 20
      for (const bm of data.benchmarks) {
        expect(bm.sampleCount).toBeGreaterThanOrEqual(20);
        expect(bm.isPublishable).toBe(true);
        expect(bm.dataSources).toContain('opt_in_career_transitions');
        expect(bm.confidenceInterval).toBeDefined();
      }

      // Should contain Software Engineer -> Senior Software Engineer (sampleCount ~ 29)
      const seToSenior = data.benchmarks.find(
        (b: any) => b.fromRole === 'Software Engineer' && b.toRole === 'Senior Software Engineer'
      );
      expect(seToSenior).toBeDefined();
      expect(seToSenior.sampleCount).toBeGreaterThanOrEqual(20);

      // Should NOT contain Software Engineer -> Product Manager (sampleCount = 10, suppressed by BR-160)
      const seToPm = data.benchmarks.find(
        (b: any) => b.fromRole === 'Software Engineer' && b.toRole === 'Product Manager'
      );
      expect(seToPm).toBeUndefined();
    });

    it('filters benchmarks by fromRole and toRole query parameters', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/career/benchmarks?fromRole=Software+Engineer&toRole=Senior+Software+Engineer',
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.benchmarks.length).toBe(1);
      expect(data.benchmarks[0].fromRole).toBe('Software Engineer');
      expect(data.benchmarks[0].toRole).toBe('Senior Software Engineer');
    });
  });

  describe('POST /api/v1/career/transition-probability (BR-163)', () => {
    it('calculates transition probability with disclosed confidence intervals and data sources', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/career/transition-probability',
        payload: {
          fromRole: 'Software Engineer',
          toRole: 'Senior Software Engineer',
          baselineSalary: 120000,
        },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.benchmark).toBeDefined();
      expect(data.benchmark.transitionProbability).toBeGreaterThan(0.5);
      expect(data.benchmark.confidenceInterval.lower).toBeGreaterThan(0.3);
      expect(data.benchmark.confidenceInterval.upper).toBeLessThan(0.9);
      expect(data.benchmark.dataSources).toContain('opt_in_career_transitions');
      expect(data.benchmark.medianTimeMonths).toBeGreaterThan(20);
      expect(data.benchmark.medianSalaryDelta).toBeGreaterThan(20000);
    });
  });

  describe('GET /api/v1/career/pathways (F-152, BR-160, BR-161)', () => {
    it('discovers progression pathways and 5-year salary projections', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/career/pathways?originRole=Software+Engineer&enforceKAnonymity=true&baselineSalary=110000',
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.pathway).toBeDefined();
      expect(data.pathway.originRole).toBe('Software Engineer');
      expect(data.pathway.pathways.length).toBeGreaterThan(0);
      expect(data.pathway.pathways[0].targetRole).toBe('Senior Software Engineer');
      expect(data.pathway.pathways[0].sampleCount).toBeGreaterThanOrEqual(20);

      // Verify 5-year salary projections separate from base salary (BR-161)
      expect(data.salaryProjections).toBeDefined();
      expect(data.salaryProjections.length).toBe(5);
      expect(data.salaryProjections[0].year).toBe(1);
      expect(data.salaryProjections[0].projectedSalary).toBeGreaterThan(110000);
      expect(data.salaryProjections[0].cumulativeDelta).toBeGreaterThan(0);
      expect(data.salaryProjections[4].year).toBe(5);
      expect(data.salaryProjections[4].projectedSalary).toBeGreaterThan(
        data.salaryProjections[0].projectedSalary
      );
    });

    it('returns under-threshold pathways when enforceKAnonymity is false', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/career/pathways?originRole=Software+Engineer&enforceKAnonymity=false',
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      const roles = data.pathway.pathways.map((p: any) => p.targetRole);
      expect(roles).toContain('Product Manager');
    });
  });

  describe('POST /api/v1/career/milestones/readiness (F-85, F-152)', () => {
    it('evaluates candidate milestone readiness and generates recommended milestones', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/career/milestones/readiness',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          targetRole: 'Senior Software Engineer',
          candidateSkills: ['TypeScript', 'Node.js'],
          yearsOfExperience: 3,
          requiredYearsOfExperience: 5,
          educationLevel: 'bachelor',
          requiredEducationLevel: 'bachelor',
        },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.readiness).toBeDefined();
      expect(data.readiness.targetRole).toBe('Senior Software Engineer');
      expect(data.readiness.overallReadinessScore).toBeGreaterThan(0);
      expect(data.readiness.skillsOverlapPct).toBe(40); // 2 of 5
      expect(data.readiness.experienceReadinessPct).toBe(60); // 3 of 5
      expect(data.readiness.missingPrerequisites.length).toBeGreaterThan(0);
      expect(data.readiness.recommendedMilestones.length).toBeGreaterThan(0);
      expect(data.readiness.recommendedMilestones[0]).toHaveProperty('title');
      expect(data.readiness.recommendedMilestones[0]).toHaveProperty('type');
    });
  });
});

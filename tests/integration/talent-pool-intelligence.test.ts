import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Talent Pool Intelligence & Analytics Integration (F-158, F-92, BR-200, BR-201)', () => {
  let app: FastifyInstance;
  let recruiterToken: string;
  let candidate1Id: string;
  let candidate2Id: string;
  let orgId: string;
  let poolId: string;
  let member1Id: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // Register Recruiter
    const regRecruiter = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'recruiter.talentpools@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Talent Pool Lead Recruiter',
        role: 'recruiter',
      },
    });
    const dRecruiter = JSON.parse(regRecruiter.body);
    recruiterToken = dRecruiter.token;

    // Create Organization
    const createOrgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'Nexus Cloud Technologies',
        slug: 'nexus-cloud-tech',
        website: 'https://nexuscloud.test',
      },
    });
    const dOrg = JSON.parse(createOrgRes.body);
    orgId = dOrg.organization.id;

    // Register Candidate 1
    const regCand1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'candidate.tp1@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'FullStack Candidate One',
        role: 'candidate',
      },
    });
    const dCand1 = JSON.parse(regCand1.body);
    candidate1Id = dCand1.user.id;

    // Add evidence with TypeScript skill for Candidate 1
    await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${dCand1.token}` },
      payload: {
        title: 'Production Full-Stack Application in TypeScript',
        type: 'work_sample',
        url: 'https://github.com/candidate1/repo',
        skillIds: ['10000000-0000-4000-a000-000000000001'], // TypeScript
      },
    });

    // Register Candidate 2
    const regCand2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'candidate.tp2@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Frontend Candidate Two',
        role: 'candidate',
      },
    });
    const dCand2 = JSON.parse(regCand2.body);
    candidate2Id = dCand2.user.id;

    // Add evidence with React skill for Candidate 2
    await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${dCand2.token}` },
      payload: {
        title: 'React Micro-Frontend Dashboard',
        type: 'work_sample',
        url: 'https://github.com/candidate2/frontend',
        skillIds: ['10000000-0000-4000-a000-000000000002'], // React
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/recruiter/talent-pools (F-158, F-92)', () => {
    it('rejects unauthenticated request with 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/recruiter/talent-pools',
        payload: {
          name: 'Core Engineering Pool',
        },
      });
      expect(res.statusCode).toBe(401);
    });

    it('creates a new talent pool for the recruiter organization (201)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/recruiter/talent-pools',
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          orgId,
          name: 'Senior Full Stack Engineers',
          description: 'High velocity React & TypeScript developers',
          targetRole: 'Senior Full Stack Engineer',
          targetSkills: ['typescript', 'react', 'kubernetes'],
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.pool).toBeDefined();
      expect(data.pool.name).toBe('Senior Full Stack Engineers');
      expect(data.pool.orgId).toBe(orgId);
      expect(data.pool.targetSkills).toContain('typescript');
      poolId = data.pool.id;
    });

    it('validates required fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/recruiter/talent-pools',
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          name: '',
        },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/recruiter/talent-pools', () => {
    it('lists organization talent pools with member counts (200)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/recruiter/talent-pools?orgId=${orgId}`,
        headers: { authorization: `Bearer ${recruiterToken}` },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.pools).toBeDefined();
      expect(data.pools.length).toBeGreaterThanOrEqual(1);
      const created = data.pools.find((p: any) => p.id === poolId);
      expect(created).toBeDefined();
      expect(created.memberCount).toBe(0);
    });
  });

  describe('GET /api/v1/recruiter/talent-pools/:poolId', () => {
    it('retrieves talent pool details (200)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/recruiter/talent-pools/${poolId}`,
        headers: { authorization: `Bearer ${recruiterToken}` },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.pool.id).toBe(poolId);
      expect(data.members).toEqual([]);
      expect(data.totalMembers).toBe(0);
    });

    it('returns 404 for non-existent pool', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/recruiter/talent-pools/00000000-0000-0000-0000-000000000999',
        headers: { authorization: `Bearer ${recruiterToken}` },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/recruiter/talent-pools/:poolId/members', () => {
    it('adds Candidate 1 from search with sourcing cost (201)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/recruiter/talent-pools/${poolId}/members`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          candidateId: candidate1Id,
          source: 'search',
          costMinorUnits: 2500, // $25.00 sourcing cost
          notes: 'High GitHub activity and strong TypeScript evidence',
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.member).toBeDefined();
      expect(data.member.candidateId).toBe(candidate1Id);
      expect(data.member.status).toBe('sourced');
      expect(data.member.costMinorUnits).toBe(2500);
      member1Id = data.member.id;
    });

    it('adds Candidate 2 from referral (201)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/recruiter/talent-pools/${poolId}/members`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          candidateId: candidate2Id,
          source: 'referral',
          costMinorUnits: 5000,
          notes: 'Referred by senior frontend engineer',
        },
      });

      expect(res.statusCode).toBe(201);
    });

    it('rejects adding duplicate candidate to the same talent pool (409 Conflict)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/recruiter/talent-pools/${poolId}/members`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          candidateId: candidate1Id,
          source: 'search',
        },
      });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('PATCH /api/v1/recruiter/talent-pools/:poolId/members/:memberId', () => {
    it('advances Candidate 1 along the pipeline: sourced -> interviewing -> hired (200)', async () => {
      // Step 1: to interviewing
      const res1 = await app.inject({
        method: 'PATCH',
        url: `/api/v1/recruiter/talent-pools/${poolId}/members/${member1Id}`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          status: 'interviewing',
        },
      });
      expect(res1.statusCode).toBe(200);
      const d1 = JSON.parse(res1.body);
      expect(d1.member.status).toBe('interviewing');
      expect(d1.member.interviewedAt).toBeDefined();

      // Step 2: to hired
      const res2 = await app.inject({
        method: 'PATCH',
        url: `/api/v1/recruiter/talent-pools/${poolId}/members/${member1Id}`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          status: 'hired',
        },
      });
      expect(res2.statusCode).toBe(200);
      const d2 = JSON.parse(res2.body);
      expect(d2.member.status).toBe('hired');
      expect(d2.member.hiredAt).toBeDefined();
    });
  });

  describe('GET /api/v1/recruiter/talent-pools/:poolId/intelligence (F-158, BR-200, BR-201)', () => {
    it('computes full on-demand intelligence with skill composition, gaps, pipeline health, and source metrics', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/recruiter/talent-pools/${poolId}/intelligence?kThreshold=10`,
        headers: { authorization: `Bearer ${recruiterToken}` },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      const intel = data.intelligence;

      expect(intel.poolId).toBe(poolId);
      expect(intel.poolName).toBe('Senior Full Stack Engineers');
      expect(intel.totalMembers).toBe(2);
      expect(intel.hiredCount).toBe(1);
      expect(intel.activePipelineCount).toBe(1);
      expect(intel.overallConversionRatePct).toBe(50);
      expect(intel.totalCostMinorUnits).toBe(7500); // 2500 + 5000

      // Pipeline Stages
      expect(intel.pipelineStages).toHaveLength(7);
      const hiredStage = intel.pipelineStages.find((s: any) => s.stage === 'hired');
      expect(hiredStage.count).toBe(1);
      expect(hiredStage.pctOfTotal).toBe(50);

      // Source Effectiveness
      expect(intel.sourceEffectiveness).toHaveLength(5);
      const searchSource = intel.sourceEffectiveness.find((s: any) => s.source === 'search');
      expect(searchSource.totalCandidates).toBe(1);
      expect(searchSource.hiredCount).toBe(1);
      expect(searchSource.conversionRatePct).toBe(100);

      // Skill Gaps
      expect(intel.skillGaps).toBeDefined();
      const k8sGap = intel.skillGaps.find((g: any) => g.targetSkill === 'kubernetes');
      expect(k8sGap).toBeDefined();
      expect(k8sGap.inPoolCount).toBe(0);
      expect(k8sGap.status).toBe('severe_gap');

      // Anonymized Diversity (BR-200, k >= 10 suppression)
      expect(intel.aggregatedDiversity).toBeDefined();
      expect(intel.aggregatedDiversity.isSuppressedDueToKAnonymity).toBe(true);
      expect(intel.aggregatedDiversity.metrics).toBeNull();
      expect(intel.aggregatedDiversity.disclaimer).toContain('BR-200');
    });
  });
});

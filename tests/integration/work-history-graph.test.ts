import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Verified Work History Network & References Integration (F-162, F-94, F-84)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateId: string;
  let candidateEmail: string;
  let refereeToken: string;
  let refereeId: string;
  let refereeEmail: string;
  let recruiterToken: string;
  let otherCandidateToken: string;
  let createdWorkHistoryId: string;
  let createdReferenceId: string;
  let referenceToken: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // Register Candidate
    candidateEmail = 'alex.mercer.wh@talentsphere.test';
    const regCand = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: candidateEmail,
        password: 'Password123!Secure',
        fullName: 'Alex Mercer',
        role: 'candidate',
      },
    });
    const dCand = JSON.parse(regCand.body);
    candidateToken = dCand.token;
    candidateId = dCand.user.id;

    // Register Referee Colleague / Manager
    refereeEmail = 'sarah.connor.mgr@talentsphere.test';
    const regRef = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: refereeEmail,
        password: 'Password123!Secure',
        fullName: 'Sarah Connor',
        role: 'candidate',
      },
    });
    const dRef = JSON.parse(regRef.body);
    refereeToken = dRef.token;
    refereeId = dRef.user.id;

    // Register Recruiter
    const regRecruiter = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'recruiter.wh@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Talent Scout Recruiter',
        role: 'recruiter',
      },
    });
    const dRecruiter = JSON.parse(regRecruiter.body);
    recruiterToken = dRecruiter.token;

    // Register Other Candidate
    const regOther = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'other.cand.wh@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Other Candidate',
        role: 'candidate',
      },
    });
    const dOther = JSON.parse(regOther.body);
    otherCandidateToken = dOther.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Add Work History (POST /api/v1/candidates/work-history)', () => {
    it('creates an unverified work history record successfully', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          companyName: 'Acme Cloud Systems',
          title: 'Senior Distributed Systems Engineer',
          employmentType: 'full_time',
          startDate: '2022-01-01',
          endDate: '2024-01-01',
          isCurrent: false,
          description: 'Designed highly available multi-tenant microservices.',
          skills: ['Go', 'PostgreSQL', 'Kafka'],
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.workHistory).toBeDefined();
      expect(data.workHistory.candidateId).toBe(candidateId);
      expect(data.workHistory.companyName).toBe('Acme Cloud Systems');
      expect(data.workHistory.verificationStatus).toBe('unverified');
      expect(data.workHistory.badgeTier).toBe('none');
      expect(data.workHistory.verificationScore).toBe(0);

      createdWorkHistoryId = data.workHistory.id;
    });

    it('rejects work history creation with future start date', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          companyName: 'Future Tech Corp',
          title: 'Lead Architect',
          startDate: '2028-01-01',
          isCurrent: true,
        },
      });

      expect(res.statusCode).toBe(422);
      const data = JSON.parse(res.body);
      expect(data.error.code).toBe('VALIDATION_FAILED');
      expect(data.error.message).toContain('Start date cannot be in the future');
    });

    it('rejects work history creation where end date precedes start date', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          companyName: 'Inverted Dates LLC',
          title: 'Developer',
          startDate: '2023-01-01',
          endDate: '2022-01-01',
          isCurrent: false,
        },
      });

      expect(res.statusCode).toBe(422);
      const data = JSON.parse(res.body);
      expect(data.error.code).toBe('VALIDATION_FAILED');
      expect(data.error.message).toContain('End date cannot precede start date');
    });

    it('rejects unauthenticated requests', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        payload: {
          companyName: 'Acme Cloud Systems',
          title: 'Dev',
          startDate: '2023-01-01',
          isCurrent: true,
        },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('2. Verify Corporate Email (POST /api/v1/candidates/work-history/:id/verify-email)', () => {
    it('verifies corporate email and promotes verification score & badge tier', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/verify-email`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          corporateEmail: 'alex.mercer@acmecloud.io',
        },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.workHistory.corporateEmail).toBe('alex.mercer@acmecloud.io');
      expect(data.workHistory.emailVerifiedAt).toBeDefined();
      expect(data.workHistory.verificationStatus).toBe('verified');
      // 40 pts email + 5 pts skills = 45 pts -> bronze
      expect(data.workHistory.verificationScore).toBe(45);
      expect(data.workHistory.badgeTier).toBe('bronze');
    });

    it('rejects verification when candidate does not own the work history', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/verify-email`,
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload: {
          corporateEmail: 'intruder@acmecloud.io',
        },
      });

      expect(res.statusCode).toBe(403);
      const data = JSON.parse(res.body);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('rejects disposable email addresses for corporate verification', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/verify-email`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          corporateEmail: 'fake.alex@mailinator.com',
        },
      });

      expect(res.statusCode).toBe(422);
      const data = JSON.parse(res.body);
      expect(data.error.message).toContain('Disposable email');
    });

    it('rejects generic consumer webmail for corporate verification', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/verify-email`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          corporateEmail: 'alex.mercer@gmail.com',
        },
      });

      expect(res.statusCode).toBe(422);
      const data = JSON.parse(res.body);
      expect(data.error.message).toContain('Generic webmail');
    });

    it('returns 404 for non-existent work history id', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history/00000000-0000-0000-0000-000000000000/verify-email',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          corporateEmail: 'alex@acme.com',
        },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('3. Request Employment Reference (POST /api/v1/candidates/work-history/:id/references/request)', () => {
    it('successfully requests reference with generated token and status "requested"', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/references/request`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          refereeName: 'Sarah Connor',
          refereeEmail,
          relationship: 'manager',
        },
      });

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res.body);
      expect(data.reference).toBeDefined();
      expect(data.reference.workHistoryId).toBe(createdWorkHistoryId);
      expect(data.reference.status).toBe('requested');
      expect(data.reference.token).toBeDefined();
      expect(data.reference.refereeId).toBe(refereeId);

      createdReferenceId = data.reference.id;
      referenceToken = data.reference.token;
    });

    it('rejects candidate attempting to request a reference using their own email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/references/request`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          refereeName: 'Alex Mercer Self',
          refereeEmail: candidateEmail,
          relationship: 'manager',
        },
      });

      expect(res.statusCode).toBe(409);
      const data = JSON.parse(res.body);
      expect(data.error.code).toBe('CONFLICT');
      expect(data.error.message).toMatch(
        /Candidate (cannot act as their own referee|email cannot match referee email)/
      );
    });

    it('rejects non-owner from requesting reference for someone else', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/references/request`,
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload: {
          refereeName: 'Colleague',
          refereeEmail: 'colleague@example.com',
          relationship: 'peer',
        },
      });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('4. Submit Employment Reference (POST /api/v1/candidates/work-history/references/:refId/submit)', () => {
    it('submits referee structured feedback and upgrades work history to gold badge', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/references/${createdReferenceId}/submit`,
        headers: { authorization: `Bearer ${refereeToken}` },
        payload: {
          token: referenceToken,
          confirmDates: true,
          confirmTitle: true,
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
          leadershipRating: 5,
          endorsedSkills: ['Go', 'Distributed Systems'],
          summaryNotes: 'Exceptional engineer and leader.',
        },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.reference.status).toBe('submitted');
      expect(data.reference.confirmDates).toBe(true);
      expect(data.reference.ratings.technicalProficiency).toBe(5);

      // Work history recalculation:
      // Email (40) + Manager Ref (30) + High Rating Bonus (10) + Skills (5) = 85 -> Gold Tier!
      expect(data.workHistory.verificationScore).toBe(85);
      expect(data.workHistory.badgeTier).toBe('gold');
      expect(data.workHistory.verificationStatus).toBe('verified');
    });

    it('prevents candidate from submitting reference on themselves', async () => {
      // Create a second reference request
      const reqRes = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/references/request`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          refereeName: 'Bob Peer',
          refereeEmail: 'bob.peer@example.com',
          relationship: 'peer',
        },
      });
      const reqData = JSON.parse(reqRes.body);
      const refId2 = reqData.reference.id;

      // Candidate tries to submit it
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/references/${refId2}/submit`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          confirmDates: true,
          confirmTitle: true,
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
        },
      });

      expect(res.statusCode).toBe(403);
      const data = JSON.parse(res.body);
      expect(data.error.message).toContain('Candidate cannot submit their own reference');
    });

    it('rejects submitting invalid rating values (< 1 or > 5)', async () => {
      const reqRes = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/references/request`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          refereeName: 'Carol Peer',
          refereeEmail: 'carol.peer@example.com',
          relationship: 'peer',
        },
      });
      const reqData = JSON.parse(reqRes.body);
      const refId3 = reqData.reference.id;

      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/references/${refId3}/submit`,
        payload: {
          confirmDates: true,
          confirmTitle: true,
          technicalProficiency: 10, // out of range
          collaborationRating: 4,
          deliveryReliability: 4,
        },
      });

      // Zod schema error or domain validation error produces 400
      expect(res.statusCode).toBe(400);
    });
  });

  describe('5. Get Candidate Work History (GET /api/v1/candidates/:candidateId/work-history)', () => {
    it('returns candidate work histories to recruiter', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/candidates/${candidateId}/work-history`,
        headers: { authorization: `Bearer ${recruiterToken}` },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.workHistories.length).toBeGreaterThanOrEqual(1);
      expect(data.workHistories[0].badgeTier).toBe('gold');
      expect(data.workHistories[0].verificationStatus).toBe('verified');
    });

    it('returns verified work histories to public caller', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/candidates/${candidateId}/work-history`,
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.workHistories.length).toBeGreaterThanOrEqual(1);
      expect(data.workHistories[0].verificationStatus).toBe('verified');
    });
  });

  describe('6. Work History Network & Graph (GET /api/v1/candidates/:candidateId/work-history-graph)', () => {
    it('returns complete multi-entity graph and summary metrics', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/candidates/${candidateId}/work-history-graph?includeUnverified=true`,
        headers: { authorization: `Bearer ${recruiterToken}` },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.graph).toBeDefined();
      expect(data.graph.candidateId).toBe(candidateId);

      // Verify Nodes
      const nodeTypes = data.graph.nodes.map((n: any) => n.type);
      expect(nodeTypes).toContain('candidate');
      expect(nodeTypes).toContain('company');
      expect(nodeTypes).toContain('reference');
      expect(nodeTypes).toContain('skill');

      // Verify Edges
      const edgeTypes = data.graph.edges.map((e: any) => e.type);
      expect(edgeTypes).toContain('employed_at');
      expect(edgeTypes).toContain('referred_by');
      expect(edgeTypes).toContain('managed_by');
      expect(edgeTypes).toContain('endorsed_skill');

      // Verify Summary
      expect(data.graph.summary.totalRoles).toBe(1);
      expect(data.graph.summary.verifiedRoles).toBe(1);
      expect(data.graph.summary.totalReferences).toBe(1);
      expect(data.graph.summary.averageReferenceRating).toBe(5);
      expect(data.graph.summary.aggregateTrustScore).toBe(85);
      expect(data.graph.summary.topVerifiedSkills.length).toBeGreaterThanOrEqual(1);
    });
  });
});

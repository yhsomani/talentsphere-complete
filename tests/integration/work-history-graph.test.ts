import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';
// The API runs on the built domain package; spy on the class it instantiates.
import { MemoryJobStore } from '../../packages/domain/dist/index.js';

/**
 * The email the worker would deliver (dev/test outbox). Codes and referee
 * links are never returned to the browser that asked for them, so tests read
 * them where the real recipient would: the outbound message.
 */
async function outbox(app: FastifyInstance, kind: string): Promise<Record<string, any>[]> {
  const res = await app.inject({ method: 'GET', url: '/api/v1/internal/worker-jobs' });
  return JSON.parse(res.body)
    .jobs.filter((j: any) => j.type === kind)
    .map((j: any) => j.payload);
}

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
    it('does not mark an address verified until a code sent to it is confirmed', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/verify-email`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: { corporateEmail: 'alex.mercer@acmecloud.io' },
      });

      expect(res.statusCode).toBe(202);
      const pending = JSON.parse(res.body);
      expect(pending.status).toBe('verification_pending');
      expect(JSON.stringify(pending)).not.toMatch(/\b\d{6}\b/); // the code is not echoed back

      const list = await app.inject({
        method: 'GET',
        url: `/api/v1/candidates/${candidateId}/work-history`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });
      const record = JSON.parse(list.body).workHistories.find(
        (h: any) => h.id === createdWorkHistoryId
      );
      expect(record.emailVerifiedAt).toBeUndefined();
      expect(record.verificationScore).toBe(0);
    });

    it('rejects a wrong code and counts the attempt', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/verify-email`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: { corporateEmail: 'alex.mercer@acmecloud.io', verificationCode: '000000x' },
      });
      expect(res.statusCode).toBe(422);
      expect(JSON.parse(res.body).error.message).toContain('not correct');
    });

    it('verifies corporate email with the emailed code and promotes score & badge tier', async () => {
      const [message] = (await outbox(app, 'work_history.email_verification_requested')).filter(
        (m) => m.workHistoryId === createdWorkHistoryId
      );
      expect(message.to).toBe('alex.mercer@acmecloud.io');

      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/verify-email`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: { corporateEmail: 'alex.mercer@acmecloud.io', verificationCode: message.code },
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.workHistory.corporateEmail).toBe('alex.mercer@acmecloud.io');
      expect(data.workHistory.emailVerifiedAt).toBeDefined();
      expect(data.workHistory.verificationStatus).toBe('verified');
      // 40 pts for mailbox proof; unendorsed self-reported skills earn no trust points
      expect(data.workHistory.verificationScore).toBe(40);
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
      // The referee's one-time token is their credential: it goes to the
      // referee's inbox only, never to the candidate who asked.
      expect(data.reference.token).toBeUndefined();
      expect(data.reference.tokenHash).toBeUndefined();
      expect(data.reference.refereeId).toBe(refereeId);

      createdReferenceId = data.reference.id;
      const [message] = (await outbox(app, 'reference.requested')).filter(
        (m) => m.referenceId === createdReferenceId
      );
      expect(message.to).toBe(refereeEmail);
      referenceToken = message.token;
      expect(referenceToken).toMatch(/^[0-9a-f]{32}$/);
    });

    it('shows the referee what they are vouching for, only with the token', async () => {
      const withToken = await app.inject({
        method: 'GET',
        url: `/api/v1/references/${createdReferenceId}`,
        headers: { 'x-reference-token': referenceToken },
      });
      expect(withToken.statusCode).toBe(200);
      const details = JSON.parse(withToken.body).reference;
      expect(details.companyName).toBeDefined();
      expect(details.relationship).toBe('manager');
      expect(JSON.stringify(details)).not.toContain('acmecloud.io'); // no candidate mailbox

      const withoutToken = await app.inject({
        method: 'GET',
        url: `/api/v1/references/${createdReferenceId}`,
      });
      expect(withoutToken.statusCode).toBe(404);

      const wrongToken = await app.inject({
        method: 'GET',
        url: `/api/v1/references/${createdReferenceId}`,
        headers: { 'x-reference-token': '0'.repeat(32) },
      });
      expect(wrongToken.statusCode).toBe(404);
    });

    it('stops honouring the referee link 30 days after the request', async () => {
      const day = 24 * 60 * 60 * 1000;
      try {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(Date.now() + 29 * day);
        const stillValid = await app.inject({
          method: 'GET',
          url: `/api/v1/references/${createdReferenceId}`,
          headers: { 'x-reference-token': referenceToken },
        });
        expect(stillValid.statusCode).toBe(200);

        vi.setSystemTime(Date.now() + 2 * day);
        const expired = await app.inject({
          method: 'GET',
          url: `/api/v1/references/${createdReferenceId}`,
          headers: { 'x-reference-token': referenceToken },
        });
        expect(expired.statusCode).toBe(404);

        // The referee's own session is fresh, but the link they hold is not.
        const freshSession = createSessionToken(refereeId, refereeEmail, ['candidate']);
        const submit = await app.inject({
          method: 'POST',
          url: `/api/v1/candidates/work-history/references/${createdReferenceId}/submit`,
          headers: { authorization: `Bearer ${freshSession}` },
          payload: {
            token: referenceToken,
            confirmDates: true,
            confirmTitle: true,
            technicalProficiency: 5,
            collaborationRating: 5,
            deliveryReliability: 5,
            leadershipRating: 5,
            endorsedSkills: [],
          },
        });
        expect(submit.statusCode).toBe(403);
      } finally {
        vi.useRealTimers();
      }
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

    it('refuses the role work email, a repeat referee, and self-reference via an admin (C-17)', async () => {
      const ask = (historyId: string, token: string, refereeEmailAddress: string) =>
        app.inject({
          method: 'POST',
          url: `/api/v1/candidates/work-history/${historyId}/references/request`,
          headers: { authorization: `Bearer ${token}` },
          payload: {
            refereeName: 'Someone',
            refereeEmail: refereeEmailAddress,
            relationship: 'peer',
          },
        });

      // The work email verified for this role is the candidate's own mailbox.
      const corporate = await ask(createdWorkHistoryId, candidateToken, 'Alex.Mercer@acmecloud.io');
      expect(corporate.statusCode).toBe(409);
      expect(JSON.parse(corporate.body).error.message).toMatch(/work email on this role/);

      // Sarah was already asked for this role.
      const repeat = await ask(createdWorkHistoryId, candidateToken, refereeEmail);
      expect(repeat.statusCode).toBe(409);
      expect(JSON.parse(repeat.body).error.message).toMatch(/already asked/);

      // An admin asking on the candidate's behalf is checked against the candidate.
      const adminToken = createSessionToken(
        '00000000-0000-4000-a000-00000000ad17',
        'ops-admin@talentsphere.test',
        ['platform_admin']
      );
      const onBehalf = await ask(createdWorkHistoryId, adminToken, candidateEmail);
      expect(onBehalf.statusCode).toBe(409);

      // The same referee may vouch for a different role.
      const reg = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'two.roles.wh@talentsphere.test',
          password: 'Password123!Secure',
          fullName: 'Two Roles',
          role: 'candidate',
        },
      });
      const twoRolesToken = JSON.parse(reg.body).token;
      const role = async (companyName: string) =>
        JSON.parse(
          (
            await app.inject({
              method: 'POST',
              url: '/api/v1/candidates/work-history',
              headers: { authorization: `Bearer ${twoRolesToken}` },
              payload: {
                companyName,
                title: 'Engineer',
                employmentType: 'full_time',
                startDate: '2021-01-01',
                endDate: '2022-01-01',
                isCurrent: false,
              },
            })
          ).body
        ).workHistory.id as string;
      const first = await role('First Co');
      const second = await role('Second Co');
      expect((await ask(first, twoRolesToken, 'pat.peer@example.com')).statusCode).toBe(201);
      expect((await ask(second, twoRolesToken, 'pat.peer@example.com')).statusCode).toBe(201);
      expect((await ask(first, twoRolesToken, 'PAT.peer@example.com')).statusCode).toBe(409);
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
      // Email (40) + Manager Ref (30) + High Rating Bonus (10) = 80 -> Gold Tier
      expect(data.workHistory.verificationScore).toBe(80);
      expect(data.workHistory.badgeTier).toBe('gold');
      expect(data.workHistory.verificationStatus).toBe('verified');
      // The referee sees the outcome, not the candidate's private record.
      expect(data.workHistory.corporateEmail).toBeUndefined();
    });

    it('treats the token as single-use', async () => {
      const replay = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/references/${createdReferenceId}/submit`,
        payload: {
          token: referenceToken,
          confirmDates: true,
          confirmTitle: true,
          technicalProficiency: 1,
          collaborationRating: 1,
          deliveryReliability: 1,
        },
      });
      expect(replay.statusCode).toBe(403);
    });

    it('refuses an anonymous submission without the referee token (self-endorsement)', async () => {
      // Regression: an omitted token used to skip the check, so a candidate
      // could sign out and vouch for themselves with the id from the request
      // response.
      const reqRes = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${createdWorkHistoryId}/references/request`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          refereeName: 'Dana Peer',
          refereeEmail: 'dana.peer@example.com',
          relationship: 'peer',
        },
      });
      const refId = JSON.parse(reqRes.body).reference.id;

      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/references/${refId}/submit`,
        payload: {
          confirmDates: true,
          confirmTitle: true,
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
        },
      });
      expect(res.statusCode).toBe(403);

      const signedInReferee = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/references/${refId}/submit`,
        headers: { authorization: `Bearer ${refereeToken}` },
        payload: {
          confirmDates: true,
          confirmTitle: true,
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
        },
      });
      // Being signed in is not proof of controlling the referee's mailbox.
      expect(signedInReferee.statusCode).toBe(403);
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
      // A recruiter sees no average of a single referee's ratings (REV-09).
      expect(data.graph.summary.averageReferenceRating).toBeNull();
      expect(JSON.stringify(data.graph)).not.toContain('technicalProficiency');
      // Self-declared skills earn no points unless two references endorse them
      // independently (#49). 85 included that unearned +5.
      expect(data.graph.summary.aggregateTrustScore).toBe(80);
      expect(data.graph.summary.topVerifiedSkills.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Isolated describe: uses otherCandidateToken so the exact-count graph
  // assertions above (totalRoles/totalReferences) stay untouched.
  describe('7. Duplicate submission replay guards (clientRequestId, WF-10 idiom)', () => {
    it('returns the original record when a work-history create is replayed', async () => {
      const payload = {
        companyName: 'Replay Corp',
        title: 'Site Reliability Engineer',
        startDate: '2021-03-01',
        endDate: '2023-06-01',
        isCurrent: false,
        clientRequestId: `wh-replay-${Date.now()}`,
      };

      const first = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload,
      });
      expect(first.statusCode).toBe(201);
      const firstId = JSON.parse(first.body).workHistory.id;

      // Retry after double tap / timeout-after-commit: same key → same record.
      const replay = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload,
      });
      expect(replay.statusCode).toBe(200);
      const replayData = JSON.parse(replay.body);
      expect(replayData.deduplicated).toBe(true);
      expect(replayData.workHistory.id).toBe(firstId);

      // A different key is a new submission, not a replay.
      const second = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload: { ...payload, clientRequestId: `${payload.clientRequestId}-b` },
      });
      expect(second.statusCode).toBe(201);
      expect(JSON.parse(second.body).workHistory.id).not.toBe(firstId);
    });

    it('returns the original reference when a reference request is replayed', async () => {
      const entryRes = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload: {
          companyName: 'Replay Corp',
          title: 'Staff Engineer',
          startDate: '2019-01-01',
          endDate: '2021-01-01',
          isCurrent: false,
        },
      });
      expect(entryRes.statusCode).toBe(201);
      const entryId = JSON.parse(entryRes.body).workHistory.id;

      const payload = {
        refereeName: 'Replay Manager',
        refereeEmail: `replay.manager.${Date.now()}@corp.test`,
        relationship: 'manager',
        clientRequestId: `ref-replay-${Date.now()}`,
      };

      const first = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${entryId}/references/request`,
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload,
      });
      expect(first.statusCode).toBe(201);
      const firstId = JSON.parse(first.body).reference.id;

      // Replay must not create a second request (and so cannot re-email the referee).
      const replay = await app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${entryId}/references/request`,
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload,
      });
      expect(replay.statusCode).toBe(200);
      const replayData = JSON.parse(replay.body);
      expect(replayData.deduplicated).toBe(true);
      expect(replayData.reference.id).toBe(firstId);
    });
  });

  describe('8. Sending budget for codes and reference invitations (C-06)', () => {
    let seq = 0;
    const newCandidate = async () => {
      seq += 1;
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: `budget.${seq}.${Date.now()}@talentsphere.test`,
          password: 'Password123!Secure',
          fullName: `Budget Candidate ${seq}`,
          role: 'candidate',
        },
      });
      expect(res.statusCode).toBe(201);
      const token = JSON.parse(res.body).token as string;
      const entry = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          companyName: 'Budget Corp',
          title: 'Engineer',
          startDate: '2019-01-01',
          endDate: '2021-01-01',
          isCurrent: false,
        },
      });
      expect(entry.statusCode).toBe(201);
      return { token, historyId: JSON.parse(entry.body).workHistory.id as string };
    };
    const requestCode = (who: { token: string; historyId: string }, corporateEmail: string) =>
      app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${who.historyId}/verify-email`,
        headers: { authorization: `Bearer ${who.token}` },
        payload: { corporateEmail },
      });
    const MINUTE = 60_000;

    afterAll(() => {
      vi.useRealTimers();
    });

    it('refuses a second code for the same record within a minute and sends only one email', async () => {
      const who = await newCandidate();
      expect((await requestCode(who, 'cooldown@budgetcorp.io')).statusCode).toBe(202);
      const again = await requestCode(who, 'cooldown@budgetcorp.io');
      expect(again.statusCode).toBe(429);
      expect(again.json().error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(again.json().error.message).toContain('less than a minute');
      const sent = (await outbox(app, 'work_history.email_verification_requested')).filter(
        (m) => m.workHistoryId === who.historyId
      );
      expect(sent).toHaveLength(1);
    });

    it('caps codes per account at 5 an hour even when each request waits out the cooldown', async () => {
      const who = await newCandidate();
      vi.useFakeTimers({ toFake: ['Date'] });
      const start = Date.now();
      const statuses: number[] = [];
      for (let i = 0; i < 6; i++) {
        vi.setSystemTime(start + i * (MINUTE + 1000));
        statuses.push((await requestCode(who, 'hourly@budgetcorp.io')).statusCode);
      }
      expect(statuses).toEqual([202, 202, 202, 202, 202, 429]);
      vi.useRealTimers();
    });

    it('caps codes sent to one address at 10 a day across accounts', async () => {
      const first = await newCandidate();
      const second = await newCandidate();
      const third = await newCandidate();
      vi.useFakeTimers({ toFake: ['Date'] });
      const start = Date.now();
      let step = 0;
      const send = async (who: { token: string; historyId: string }) => {
        step += 1;
        vi.setSystemTime(start + step * (MINUTE + 1000));
        return requestCode(who, 'mailbox.victim@budgetcorp.io');
      };
      for (let i = 0; i < 5; i++) expect((await send(first)).statusCode).toBe(202);
      for (let i = 0; i < 5; i++) expect((await send(second)).statusCode).toBe(202);
      const refused = await send(third);
      expect(refused.statusCode).toBe(429);
      expect(refused.json().error.message).toContain('this address today');
      vi.useRealTimers();
    });

    it('caps reference invitations at 10 an hour per account; a replay is still answered', async () => {
      const who = await newCandidate();
      const ask = (n: number) =>
        app.inject({
          method: 'POST',
          url: `/api/v1/candidates/work-history/${who.historyId}/references/request`,
          headers: { authorization: `Bearer ${who.token}` },
          payload: {
            refereeName: `Referee ${n}`,
            refereeEmail: `referee.${n}.${who.historyId}@corp.test`,
            relationship: 'peer',
            clientRequestId: `budget-ref-${who.historyId}-${n}`,
          },
        });
      for (let n = 1; n <= 10; n++) expect((await ask(n)).statusCode).toBe(201);
      const refused = await ask(11);
      expect(refused.statusCode).toBe(429);
      expect(refused.json().error.code).toBe('RATE_LIMIT_EXCEEDED');
      const replay = await ask(1);
      expect(replay.statusCode).toBe(200);
      expect(replay.json().deduplicated).toBe(true);
    });
  });

  describe('9. An unanswered or never-queued request does not block re-asking (K-02)', () => {
    let seq = 0;
    const newEntry = async () => {
      seq += 1;
      const email = `reask.${seq}.${Date.now()}@talentsphere.test`;
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email,
          password: 'Password123!Secure',
          fullName: `Reask Candidate ${seq}`,
          role: 'candidate',
        },
      });
      expect(res.statusCode).toBe(201);
      const { token, user } = JSON.parse(res.body) as { token: string; user: { id: string } };
      const entry = await app.inject({
        method: 'POST',
        url: '/api/v1/candidates/work-history',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          companyName: 'Reask Corp',
          title: 'Engineer',
          startDate: '2019-01-01',
          endDate: '2021-01-01',
          isCurrent: false,
        },
      });
      expect(entry.statusCode).toBe(201);
      return {
        token,
        userId: user.id,
        email,
        historyId: JSON.parse(entry.body).workHistory.id as string,
      };
    };
    const ask = (
      who: { token: string; historyId: string },
      refereeEmail: string,
      clientRequestId?: string
    ) =>
      app.inject({
        method: 'POST',
        url: `/api/v1/candidates/work-history/${who.historyId}/references/request`,
        headers: { authorization: `Bearer ${who.token}` },
        payload: {
          refereeName: 'Pat Referee',
          refereeEmail,
          relationship: 'peer',
          clientRequestId,
        },
      });

    it('refuses the same referee within 30 days and accepts them once the link expired', async () => {
      const who = await newEntry();
      const referee = `pat.${who.historyId}@corp.test`;
      const day = 24 * 60 * 60 * 1000;
      try {
        vi.useFakeTimers({ toFake: ['Date'] });
        expect((await ask(who, referee)).statusCode).toBe(201);
        // A fresh session at each step: only the reference ages.
        const later = () => ({
          ...who,
          token: createSessionToken(who.userId, who.email, ['candidate']),
        });
        vi.setSystemTime(Date.now() + 29 * day);
        const early = await ask(later(), referee);
        expect(early.statusCode).toBe(409);
        expect(early.json().error.message).toMatch(/already asked/);
        vi.setSystemTime(Date.now() + 2 * day);
        expect((await ask(later(), referee)).statusCode).toBe(201);
      } finally {
        vi.useRealTimers();
      }
    });

    it('undoes the request when the invitation cannot be queued, so the retry asks again', async () => {
      const who = await newEntry();
      const referee = `queued.${who.historyId}@corp.test`;
      const clientRequestId = `reask-${who.historyId}`;
      const enqueue = vi
        .spyOn(MemoryJobStore.prototype, 'enqueue')
        .mockRejectedValueOnce(new Error('queue down'));
      try {
        const failed = await ask(who, referee, clientRequestId);
        expect(failed.statusCode).toBe(503);
        expect(failed.json().error.code).toBe('SERVICE_UNAVAILABLE');
      } finally {
        enqueue.mockRestore();
      }
      const retry = await ask(who, referee, clientRequestId);
      expect(retry.statusCode).toBe(201);
      expect(retry.json().deduplicated).toBeUndefined();
      const invitations = (await outbox(app, 'reference.requested')).filter(
        (p) => p.to === referee
      );
      expect(invitations).toHaveLength(1);
    });
  });
});

describe('Work-history graph includeUnverified is parsed strictly (C-15, A08-013)', () => {
  let app: FastifyInstance;
  let ownerToken: string;
  let ownerId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    });
    await app.ready();
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'strict.bool.owner@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Strict Bool',
        role: 'candidate',
      },
    });
    const body = JSON.parse(reg.body);
    ownerToken = body.token;
    ownerId = body.user.id;
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/candidates/work-history',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        companyName: 'Unverified Example Ltd',
        title: 'Engineer',
        employmentType: 'full_time',
        startDate: '2021-01-01',
        endDate: '2022-01-01',
        isCurrent: false,
      },
    });
    expect(created.statusCode).toBe(201);
  });

  afterAll(async () => {
    await app.close();
  });

  const graph = (flag: string) =>
    app.inject({
      method: 'GET',
      url: `/api/v1/candidates/${ownerId}/work-history-graph?includeUnverified=${flag}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

  it('?includeUnverified=false leaves the unverified role out', async () => {
    const res = await graph('false');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).graph.summary.totalRoles).toBe(0);
  });

  it('?includeUnverified=true includes it for the owner', async () => {
    const res = await graph('true');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).graph.summary.totalRoles).toBe(1);
  });

  it('an unrecognised value is a validation error', async () => {
    const res = await graph('maybe');
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe('VALIDATION_FAILED');
  });
});

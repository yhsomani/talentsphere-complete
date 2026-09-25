import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Behavioral Talent Discovery Integration (F-159, F-146, F-130, F-150)', () => {
  let app: FastifyInstance;
  let recruiterToken: string;
  let candidate1Token: string;
  let candidate1Id: string;
  let candidate2Token: string;
  let candidate2Id: string;
  let regularCandidateToken: string;
  let regularCandidateId: string;

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
        email: 'recruiter.behavioral@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Executive Tech Recruiter',
        role: 'recruiter',
      },
    });
    const dRecruiter = JSON.parse(regRecruiter.body);
    recruiterToken = dRecruiter.token;

    // Register Candidate 1 (High activity, high peer credibility)
    const regCand1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cand1.behavioral@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Dev Lead Candidate 1',
        role: 'candidate',
      },
    });
    const dCand1 = JSON.parse(regCand1.body);
    candidate1Token = dCand1.token;
    candidate1Id = dCand1.user.id;

    // Register Candidate 2 (Bot-like spam activity, reciprocal ring)
    const regCand2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cand2.behavioral@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Colluding Candidate 2',
        role: 'candidate',
      },
    });
    const dCand2 = JSON.parse(regCand2.body);
    candidate2Token = dCand2.token;
    candidate2Id = dCand2.user.id;

    // Register Regular Candidate (Standard candidate for permissions testing)
    const regCand3 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cand3.behavioral@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Standard Candidate 3',
        role: 'candidate',
      },
    });
    const dCand3 = JSON.parse(regCand3.body);
    regularCandidateToken = dCand3.token;
    regularCandidateId = dCand3.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Candidate can compute their own behavioral talent profile with default weights', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/discovery/behavioral/compute',
      headers: { authorization: `Bearer ${candidate1Token}` },
      payload: {},
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.profile).toBeDefined();
    expect(body.profile.candidateId).toBe(candidate1Id);
    expect(body.profile.compositeBehavioralScore).toBeGreaterThanOrEqual(0);
    expect(body.profile.activityScore).toBeDefined();
    expect(body.profile.peerCredibilityScore).toBeDefined();
  });

  it('2. Candidate cannot compute behavioral talent profile for another candidate (FORBIDDEN)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/discovery/behavioral/compute',
      headers: { authorization: `Bearer ${candidate1Token}` },
      payload: {
        candidateId: candidate2Id,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('3. Recruiter can compute profile for any candidate with explicit raw signals and anti-gaming protection', async () => {
    // Candidate 1: High organic contributions, organic peer endorsements
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/discovery/behavioral/compute',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        candidateId: candidate1Id,
        rawSignals: {
          contributionsCount30d: 45,
          challengesCompleted: 3,
          reputationOverallScore: 88,
          verifiedEndorsements: [
            { endorserWeight: 2.0, isReciprocalRing: false },
            { endorserWeight: 1.5, isReciprocalRing: false },
            { endorserWeight: 1.8, isReciprocalRing: false },
          ],
          coursesCompletedLast90d: 2,
          emergingSkillsCount: 3,
          highlightedSkills: ['typescript', 'distributed-systems', 'kubernetes'],
        },
      },
    });

    expect(res1.statusCode).toBe(200);
    const body1 = JSON.parse(res1.body);
    expect(body1.profile.candidateId).toBe(candidate1Id);
    expect(body1.profile.compositeBehavioralScore).toBeGreaterThan(60);
    expect(body1.profile.highlightedSkills).toContain('typescript');

    // Candidate 2: Bot-level spam contributions (1000) and reciprocal collusion ring
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/discovery/behavioral/compute',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        candidateId: candidate2Id,
        rawSignals: {
          contributionsCount30d: 1000, // Massive bot activity
          challengesCompleted: 0,
          reputationOverallScore: 40,
          verifiedEndorsements: [
            // All reciprocal rings!
            { endorserWeight: 2.5, isReciprocalRing: true },
            { endorserWeight: 3.0, isReciprocalRing: true },
          ],
          coursesCompletedLast90d: 0,
          emergingSkillsCount: 1,
          highlightedSkills: ['python'],
        },
      },
    });

    expect(res2.statusCode).toBe(200);
    const body2 = JSON.parse(res2.body);
    // Anti-gaming verification:
    // Logarithmic cap dampens 1000 commits to max 60 pts
    expect(body2.profile.activityScore).toBeLessThanOrEqual(60);
    // Reciprocal rings are zeroed
    expect(body2.profile.peerCredibilityScore).toBe(0);
    expect(body2.profile.verifiedEndorsementsCount).toBe(0);
  });

  it('4. Rejects custom weights when they do not sum to 1.0', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/discovery/behavioral/compute',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        candidateId: candidate1Id,
        weights: {
          activity: 0.5,
          reputation: 0.5,
          peerCredibility: 0.5, // Sum = 1.7
          learningVelocity: 0.1,
          emergingExpertise: 0.1,
        },
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('5. Regular candidate cannot access recruiter behavioral discovery directory (FORBIDDEN)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/discovery/behavioral',
      headers: { authorization: `Bearer ${regularCandidateToken}` },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('6. Unauthenticated request to behavioral discovery returns 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/discovery/behavioral',
    });

    expect(res.statusCode).toBe(401);
  });

  it('7. Recruiter can list and rank candidates with multi-faceted behavioral filtering', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/discovery/behavioral',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.profiles.length).toBeGreaterThanOrEqual(2);
    expect(body.total).toBeGreaterThanOrEqual(2);
    // Ranked descending by composite score: Cand1 should rank before Cand2
    const idx1 = body.profiles.findIndex((p: any) => p.candidateId === candidate1Id);
    const idx2 = body.profiles.findIndex((p: any) => p.candidateId === candidate2Id);
    expect(idx1).toBeLessThan(idx2);
  });

  it('8. Recruiter can filter by skill and minimum composite score', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/discovery/behavioral?skills=typescript&minCompositeScore=50',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.profiles.length).toBe(1);
    expect(body.profiles[0].candidateId).toBe(candidate1Id);
    expect(body.profiles[0].highlightedSkills).toContain('typescript');
  });

  it('9. Recruiter can view candidate behavioral profile details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/recruiter/discovery/behavioral/${candidate1Id}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.profile.candidateId).toBe(candidate1Id);
    expect(body.profile.activityScore).toBeGreaterThan(0);
    expect(body.profile.peerCredibilityScore).toBeGreaterThan(0);
  });

  it('10. Candidate can view their own behavioral profile details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/recruiter/discovery/behavioral/${candidate1Id}`,
      headers: { authorization: `Bearer ${candidate1Token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.profile.candidateId).toBe(candidate1Id);
  });

  it('11. Candidate cannot view another candidate behavioral profile (FORBIDDEN)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/recruiter/discovery/behavioral/${candidate1Id}`,
      headers: { authorization: `Bearer ${regularCandidateToken}` },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('12. Returns 404 when querying unknown non-existent candidate', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/discovery/behavioral/00000000-0000-0000-0000-000000000999',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

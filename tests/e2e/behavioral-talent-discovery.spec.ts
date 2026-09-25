import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Behavioral Talent Discovery & Anti-Gaming Engine (F-159, F-146, F-130, F-150)', () => {
  let recruiterToken: string;
  let candidateToken: string;
  let candidateId: string;
  let colludingCandidateToken: string;
  let colludingCandidateId: string;
  let standardCandidateToken: string;

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // 1. Register Executive Recruiter
    const regRecruiter = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.btd.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'Behavioral Search Recruiter',
        role: 'recruiter',
      },
    });
    expect(regRecruiter.status()).toBe(201);
    const dRecruiter = await regRecruiter.json();
    recruiterToken = dRecruiter.token;

    // 2. Register Organic Candidate (Candidate 1)
    const regCand1 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand1.btd.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'Organic Engineer',
        role: 'candidate',
      },
    });
    expect(regCand1.status()).toBe(201);
    const dCand1 = await regCand1.json();
    candidateId = dCand1.user.id;
    candidateToken = dCand1.token;

    // 3. Register Colluding Candidate (Candidate 2)
    const regCand2 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand2.btd.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'Colluding Bot Engineer',
        role: 'candidate',
      },
    });
    expect(regCand2.status()).toBe(201);
    const dCand2 = await regCand2.json();
    colludingCandidateId = dCand2.user.id;
    colludingCandidateToken = dCand2.token;

    // 4. Register Standard Candidate (for authorization testing)
    const regCand3 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand3.btd.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'Standard Candidate User',
        role: 'candidate',
      },
    });
    expect(regCand3.status()).toBe(201);
    const dCand3 = await regCand3.json();
    standardCandidateToken = dCand3.token;
  });

  test('candidate computes and publishes their own behavioral talent profile (F-159)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/recruiter/discovery/behavioral/compute`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {},
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.profile).toBeDefined();
    expect(body.profile.candidateId).toBe(candidateId);
    expect(body.profile.compositeBehavioralScore).toBeGreaterThanOrEqual(0);
  });

  test('recruiter computes candidate profile with organic multi-dimensional signals', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/recruiter/discovery/behavioral/compute`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        candidateId,
        rawSignals: {
          contributionsCount30d: 38,
          challengesCompleted: 4,
          reputationOverallScore: 92,
          verifiedEndorsements: [
            { endorserWeight: 2.2, isReciprocalRing: false },
            { endorserWeight: 1.8, isReciprocalRing: false },
          ],
          coursesCompletedLast90d: 3,
          emergingSkillsCount: 4,
          highlightedSkills: ['typescript', 'rust', 'distributed-systems'],
        },
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.profile.candidateId).toBe(candidateId);
    expect(body.profile.compositeBehavioralScore).toBeGreaterThan(60);
    expect(body.profile.highlightedSkills).toContain('rust');
  });

  test('enforces anti-gaming dampening on bot spam activity and discounts collusion rings', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/recruiter/discovery/behavioral/compute`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        candidateId: colludingCandidateId,
        rawSignals: {
          contributionsCount30d: 5000, // Massive bot spam
          challengesCompleted: 0,
          reputationOverallScore: 35,
          verifiedEndorsements: [
            { endorserWeight: 3.0, isReciprocalRing: true }, // Reciprocal collusion ring
            { endorserWeight: 2.5, isReciprocalRing: true },
          ],
          coursesCompletedLast90d: 0,
          emergingSkillsCount: 0,
          highlightedSkills: ['automation'],
        },
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    // Activity score dampened to max 60 points
    expect(body.profile.activityScore).toBeLessThanOrEqual(60);
    // Collusion ring endorsements discounted to 0
    expect(body.profile.peerCredibilityScore).toBe(0);
    expect(body.profile.verifiedEndorsementsCount).toBe(0);
  });

  test('recruiter searches and filters candidates by skill and composite score (F-159)', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/recruiter/discovery/behavioral?skills=rust&minCompositeScore=50`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.profiles.length).toBe(1);
    expect(body.profiles[0].candidateId).toBe(candidateId);
    expect(body.profiles[0].highlightedSkills).toContain('rust');
  });

  test('recruiter views candidate behavioral profile details', async ({ request }) => {
    const res = await request.get(`${API_BASE}/recruiter/discovery/behavioral/${candidateId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.profile.candidateId).toBe(candidateId);
    expect(body.profile.activityScore).toBeGreaterThan(0);
    expect(body.profile.learningVelocityScore).toBeGreaterThan(0);
  });

  test('prevents non-recruiter candidates from accessing recruiter discovery endpoint (FORBIDDEN)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/recruiter/discovery/behavioral`, {
      headers: { authorization: `Bearer ${standardCandidateToken}` },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });
});

import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Multi-Context Reputation Engine (F-144, S-03, BR-247..BR-254, P-02)', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let recruiterToken: string;
  let recruiterUserId: string;
  let penaltySignalId: string;
  let recoveryPlanId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.rep.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Robin RepCandidate',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Register Recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `rec.rep.e2e.${Date.now()}@apexcloud.io`,
        password: 'Password123!Secure',
        fullName: 'Morgan Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;
  });

  test('user starts with neutral baseline reputation of 50 in developing band', async ({ request }) => {
    const res = await request.get(`${API_BASE}/reputation/users/${candidateUserId}?context=candidate&domain=general`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.scores).toHaveLength(1);
    expect(body.scores[0].score).toBe(50);
    expect(body.scores[0].band).toBe('developing');
    expect(body.scores[0].signalCount).toBe(0);
  });

  test('aggregates signals across contexts and verifies context segregation (F-144)', async ({ request }) => {
    // 1. Add verified credential in cloud_architecture
    const credRes = await request.post(`${API_BASE}/reputation/signals`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        context: 'candidate',
        domain: 'cloud_architecture',
        signalType: 'credential',
        rawValue: 65,
        weight: 2.0,
      },
    });

    expect(credRes.status()).toBe(201);
    const credBody = await credRes.json();
    expect(credBody.updatedScore.score).toBeGreaterThan(50);
    expect(['high', 'exceptional']).toContain(credBody.updatedScore.band);

    // 2. Add mentor context signal
    const mentorRes = await request.post(`${API_BASE}/reputation/signals`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        context: 'mentor',
        domain: 'cloud_architecture',
        signalType: 'peer_feedback',
        rawValue: 20,
        weight: 1.0,
      },
    });
    expect(mentorRes.status()).toBe(201);

    // 3. Query candidate context: isolated
    const candRes = await request.get(`${API_BASE}/reputation/users/${candidateUserId}?context=candidate`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(candRes.status()).toBe(200);
    const candBody = await candRes.json();
    expect(candBody.scores).toHaveLength(1);
    expect(candBody.scores[0].context).toBe('candidate');

    // 4. Query mentor context: isolated
    const mentorQueryRes = await request.get(`${API_BASE}/reputation/users/${candidateUserId}?context=mentor`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(mentorQueryRes.status()).toBe(200);
    const mentorQueryBody = await mentorQueryRes.json();
    expect(mentorQueryBody.scores).toHaveLength(1);
    expect(mentorQueryBody.scores[0].context).toBe('mentor');
  });

  test('guarantees zero individual signal leakage on public profile query (BR-253)', async ({ request }) => {
    // Recruiter view: only aggregate scores
    const pubRes = await request.get(`${API_BASE}/reputation/users/${candidateUserId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(pubRes.status()).toBe(200);
    const pubBody = await pubRes.json();
    expect(pubBody.scores.length).toBeGreaterThanOrEqual(1);
    expect(pubBody.signals).toBeUndefined(); // Zero individual signal leakage

    // Candidate private view: has signals
    const privRes = await request.get(`${API_BASE}/reputation/my/signals`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(privRes.status()).toBe(200);
    const privBody = await privRes.json();
    expect(privBody.signals.length).toBeGreaterThanOrEqual(2);
  });

  test('penalizes score and executes reputation recovery plan to restore score', async ({ request }) => {
    // 1. Add penalty signal
    const penRes = await request.post(`${API_BASE}/reputation/signals`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        context: 'candidate',
        domain: 'cloud_architecture',
        signalType: 'penalty',
        rawValue: -40,
        weight: 1.5,
      },
    });
    expect(penRes.status()).toBe(201);
    const penBody = await penRes.json();
    penaltySignalId = penBody.signal.id;
    const penalizedScore = penBody.updatedScore.score;

    // 2. Start recovery plan
    const recovRes = await request.post(`${API_BASE}/reputation/recovery`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        context: 'candidate',
        penaltySignalId,
        targetReboundPoints: 40,
        tasks: [
          { description: 'Complete Cloud Architecture Assessment Challenge', points: 25 },
          { description: 'Conduct Verified Architecture Design Walkthrough', points: 20 },
        ],
      },
    });
    expect(recovRes.status()).toBe(201);
    const recovBody = await recovRes.json();
    recoveryPlanId = recovBody.plan.id;
    expect(recovBody.plan.status).toBe('in_progress');

    // 3. Complete Task 1
    const task1Id = recovBody.plan.reboundTasks[0].id;
    const step1Res = await request.post(`${API_BASE}/reputation/recovery/${recoveryPlanId}/tasks/${task1Id}/complete`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(step1Res.status()).toBe(200);
    const step1Body = await step1Res.json();
    expect(step1Body.isFullyRecovered).toBe(false);

    // 4. Complete Task 2 -> full recovery!
    const task2Id = recovBody.plan.reboundTasks[1].id;
    const step2Res = await request.post(`${API_BASE}/reputation/recovery/${recoveryPlanId}/tasks/${task2Id}/complete`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(step2Res.status()).toBe(200);
    const step2Body = await step2Res.json();
    expect(step2Body.isFullyRecovered).toBe(true);
    expect(step2Body.plan.status).toBe('completed');
    expect(step2Body.updatedScore.score).toBeGreaterThan(penalizedScore);

    // 5. Nightly batch recalculation simulation
    const recalcRes = await request.post(`${API_BASE}/reputation/recalculate-all`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(recalcRes.status()).toBe(200);
    const recalcBody = await recalcRes.json();
    expect(recalcBody.updatedCount).toBeGreaterThanOrEqual(1);
  });
});

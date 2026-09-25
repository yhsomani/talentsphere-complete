import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Verified Work History Network & References (F-162, F-94, F-84)', () => {
  let candidateToken: string;
  let candidateId: string;
  let refereeToken: string;
  let refereeId: string;
  let recruiterToken: string;
  let workHistoryId: string;
  let referenceId: string;
  let referenceToken: string;

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // 1. Register Candidate
    const regCand = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.e2e.wh.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Alex Mercer',
        role: 'candidate',
      },
    });
    expect(regCand.status()).toBe(201);
    const dCand = await regCand.json();
    candidateId = dCand.user.id;
    candidateToken = dCand.token;

    // 2. Register Referee (Colleague / Manager)
    const regRef = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `ref.e2e.wh.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Sarah Connor',
        role: 'candidate',
      },
    });
    expect(regRef.status()).toBe(201);
    const dRef = await regRef.json();
    refereeId = dRef.user.id;
    refereeToken = dRef.token;

    // 3. Register Recruiter
    const regRecruiter = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.e2e.wh.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Headhunter Recruiter',
        role: 'recruiter',
      },
    });
    expect(regRecruiter.status()).toBe(201);
    const dRecruiter = await regRecruiter.json();
    recruiterToken = dRecruiter.token;
  });

  test('Step 1: Candidate creates work history entry', async ({ request }) => {
    const res = await request.post(`${API_BASE}/candidates/work-history`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        companyName: 'Stripe Inc',
        title: 'Staff Distributed Systems Engineer',
        employmentType: 'full_time',
        startDate: '2021-06-01',
        endDate: '2024-06-01',
        isCurrent: false,
        description: 'Led architecture of payment orchestration pipelines.',
        skills: ['Go', 'PostgreSQL', 'Distributed Systems'],
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.workHistory).toBeDefined();
    expect(data.workHistory.companyName).toBe('Stripe Inc');
    expect(data.workHistory.verificationStatus).toBe('unverified');
    expect(data.workHistory.badgeTier).toBe('none');

    workHistoryId = data.workHistory.id;
  });

  test('Step 2: Candidate attests corporate email for work history', async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/candidates/work-history/${workHistoryId}/verify-email`,
      {
        headers: { authorization: `Bearer ${candidateToken}` },
        data: {
          corporateEmail: 'alex.mercer@stripe.com',
        },
      }
    );

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.workHistory.corporateEmail).toBe('alex.mercer@stripe.com');
    expect(data.workHistory.verificationStatus).toBe('verified');
    expect(data.workHistory.badgeTier).toBe('bronze');
    expect(data.workHistory.verificationScore).toBeGreaterThanOrEqual(40);
  });

  test('Step 3: Candidate requests structured employment reference from manager', async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/candidates/work-history/${workHistoryId}/references/request`,
      {
        headers: { authorization: `Bearer ${candidateToken}` },
        data: {
          refereeName: 'Sarah Connor',
          refereeEmail: 'sarah.connor@stripe.com',
          relationship: 'manager',
        },
      }
    );

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.reference).toBeDefined();
    expect(data.reference.status).toBe('requested');
    expect(data.reference.token).toBeDefined();

    referenceId = data.reference.id;
    referenceToken = data.reference.token;
  });

  test('Step 4: Referee submits ratings and upgrades candidate work history to gold badge', async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/candidates/work-history/references/${referenceId}/submit`,
      {
        headers: { authorization: `Bearer ${refereeToken}` },
        data: {
          token: referenceToken,
          confirmDates: true,
          confirmTitle: true,
          technicalProficiency: 5,
          collaborationRating: 5,
          deliveryReliability: 5,
          leadershipRating: 5,
          endorsedSkills: ['Distributed Systems', 'Go'],
          summaryNotes: 'Alex was an exemplary engineer and team leader.',
        },
      }
    );

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.reference.status).toBe('submitted');
    expect(data.reference.ratings.technicalProficiency).toBe(5);

    // Assert upgraded work history confidence score & gold badge
    expect(data.workHistory.badgeTier).toBe('gold');
    expect(data.workHistory.verificationScore).toBeGreaterThanOrEqual(80);
    expect(data.workHistory.verificationStatus).toBe('verified');
  });

  test('Step 5: Recruiter views verified candidate work histories', async ({ request }) => {
    const res = await request.get(`${API_BASE}/candidates/${candidateId}/work-history`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.workHistories.length).toBeGreaterThanOrEqual(1);
    expect(data.workHistories[0].badgeTier).toBe('gold');
  });

  test('Step 6: Recruiter queries verified work history network & graph', async ({ request }) => {
    const res = await request.get(
      `${API_BASE}/candidates/${candidateId}/work-history-graph?includeUnverified=true`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.graph).toBeDefined();
    expect(data.graph.candidateId).toBe(candidateId);

    // Verify Graph Nodes
    const nodeTypes = data.graph.nodes.map((n: any) => n.type);
    expect(nodeTypes).toContain('candidate');
    expect(nodeTypes).toContain('company');
    expect(nodeTypes).toContain('reference');
    expect(nodeTypes).toContain('skill');

    // Verify Graph Edges
    const edgeTypes = data.graph.edges.map((e: any) => e.type);
    expect(edgeTypes).toContain('employed_at');
    expect(edgeTypes).toContain('referred_by');
    expect(edgeTypes).toContain('managed_by');
    expect(edgeTypes).toContain('endorsed_skill');

    // Verify Graph Summary
    expect(data.graph.summary.verifiedRoles).toBe(1);
    expect(data.graph.summary.totalReferences).toBe(1);
    expect(data.graph.summary.aggregateTrustScore).toBeGreaterThanOrEqual(80);
    expect(data.graph.summary.topVerifiedSkills.length).toBeGreaterThanOrEqual(1);
  });
});

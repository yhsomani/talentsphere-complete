import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Talent Pool Intelligence & Analytics (F-158, F-92, BR-200, BR-201, P-02)', () => {
  let recruiterToken: string;
  let candidateToken: string;
  let candidateId: string;
  let orgId: string;
  let poolId: string;
  let memberId: string;

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // 1. Register Recruiter
    const regRecruiter = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.e2e.${ts}@talentpool.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Talent Pool Lead Recruiter',
        role: 'recruiter',
      },
    });
    expect(regRecruiter.status()).toBe(201);
    const dRecruiter = await regRecruiter.json();
    recruiterToken = dRecruiter.token;

    // 2. Create Organization
    const createOrg = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: `Horizon Labs ${ts}`,
        slug: `horizon-labs-${ts}`,
        website: 'https://horizonlabs.test',
      },
    });
    expect(createOrg.status()).toBe(201);
    const dOrg = await createOrg.json();
    orgId = dOrg.organization.id;

    // 3. Register Candidate
    const regCandidate = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `candidate.e2e.${ts}@talentpool.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Candidate One',
        role: 'candidate',
      },
    });
    expect(regCandidate.status()).toBe(201);
    const dCandidate = await regCandidate.json();
    candidateId = dCandidate.user.id;
    candidateToken = dCandidate.token;

    // 4. Add Evidence for Candidate with TypeScript
    const addEv = await request.post(`${API_BASE}/evidence`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        title: 'Production Open Source Contributor',
        description: 'Lead author of TypeScript microservices architecture',
        source: 'GitHub',
        provenance: 'https://github.com/candidate/e2e-repo',
        recencyDate: '2026-09-01',
        type: 'project',
        skillIds: ['10000000-0000-4000-a000-000000000001'], // TypeScript
      },
    });
    expect(addEv.status()).toBe(201);
  });

  test('creates a named talent pool for the recruiter organization (F-158, F-92)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/recruiter/talent-pools`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        name: 'Distributed Systems & Cloud Architects',
        description: 'Elite backend architects with Kubernetes & Go proficiency',
        targetRole: 'Staff Cloud Architect',
        targetSkills: ['typescript', 'kubernetes', 'golang'],
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.pool).toBeDefined();
    expect(data.pool.name).toBe('Distributed Systems & Cloud Architects');
    expect(data.pool.orgId).toBe(orgId);
    expect(data.pool.targetSkills).toContain('kubernetes');
    poolId = data.pool.id;
  });

  test('lists organization talent pools with current member counts', async ({ request }) => {
    const res = await request.get(`${API_BASE}/recruiter/talent-pools?orgId=${orgId}`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.pools).toBeDefined();
    expect(data.pools.length).toBeGreaterThanOrEqual(1);
    const pool = data.pools.find((p: any) => p.id === poolId);
    expect(pool).toBeDefined();
    expect(pool.memberCount).toBe(0);
  });

  test('adds candidate to talent pool with sourcing source and cost tracking (F-158)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/recruiter/talent-pools/${poolId}/members`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        candidateId,
        source: 'search',
        costMinorUnits: 3500, // $35.00
        notes: 'Discovered through recruiter verified skills search',
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.member).toBeDefined();
    expect(data.member.candidateId).toBe(candidateId);
    expect(data.member.status).toBe('sourced');
    expect(data.member.costMinorUnits).toBe(3500);
    memberId = data.member.id;
  });

  test('rejects adding duplicate candidate to the same talent pool (409 Conflict)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/recruiter/talent-pools/${poolId}/members`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        candidateId,
        source: 'referral',
      },
    });

    expect(res.status()).toBe(409);
  });

  test('advances candidate along recruitment funnel stages (sourced -> interviewing -> hired)', async ({
    request,
  }) => {
    // 1. Advance to interviewing
    const res1 = await request.patch(
      `${API_BASE}/recruiter/talent-pools/${poolId}/members/${memberId}`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
        data: { status: 'interviewing' },
      }
    );
    expect(res1.status()).toBe(200);
    const d1 = await res1.json();
    expect(d1.member.status).toBe('interviewing');
    expect(d1.member.interviewedAt).toBeDefined();

    // 2. Advance to hired
    const res2 = await request.patch(
      `${API_BASE}/recruiter/talent-pools/${poolId}/members/${memberId}`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
        data: { status: 'hired' },
      }
    );
    expect(res2.status()).toBe(200);
    const d2 = await res2.json();
    expect(d2.member.status).toBe('hired');
    expect(d2.member.hiredAt).toBeDefined();
  });

  test('computes on-demand talent pool intelligence with skill gaps and k-anonymity (F-158, BR-200)', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/recruiter/talent-pools/${poolId}/intelligence?kThreshold=10`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = await res.json();
    const intel = data.intelligence;

    expect(intel.poolId).toBe(poolId);
    expect(intel.totalMembers).toBe(1);
    expect(intel.hiredCount).toBe(1);
    expect(intel.overallConversionRatePct).toBe(100);
    expect(intel.totalCostMinorUnits).toBe(3500);
    expect(intel.avgCostPerHireMinorUnits).toBe(3500);

    // Skill Gaps relative to target skills
    expect(intel.skillGaps).toBeDefined();
    const k8sGap = intel.skillGaps.find((g: any) => g.targetSkill === 'kubernetes');
    expect(k8sGap).toBeDefined();
    expect(k8sGap.inPoolCount).toBe(0);
    expect(k8sGap.status).toBe('severe_gap');

    // Pipeline stages
    expect(intel.pipelineStages).toHaveLength(7);
    const hiredStage = intel.pipelineStages.find((s: any) => s.stage === 'hired');
    expect(hiredStage.count).toBe(1);

    // Anonymized diversity under k-anonymity (BR-200)
    expect(intel.aggregatedDiversity.isSuppressedDueToKAnonymity).toBe(true);
    expect(intel.aggregatedDiversity.metrics).toBeNull();
    expect(intel.aggregatedDiversity.disclaimer).toContain('BR-200');
  });
});

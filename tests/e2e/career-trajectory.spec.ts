import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Career Trajectory Analysis & Progression Benchmarks (F-152, F-85, BR-157..BR-163, P-02)', () => {
  let candidateToken: string;
  let candidateId: string;
  let otherCandidateToken: string;

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // Register Candidate 1
    const reg1 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `candidate.trajectory.${ts}@pathway.test`,
        password: 'Password123!Secure',
        fullName: 'Trajectory Candidate',
        role: 'candidate',
      },
    });
    expect(reg1.status()).toBe(201);
    const d1 = await reg1.json();
    candidateId = d1.user.id;
    candidateToken = d1.token;

    // Register Candidate 2 for user isolation checks
    const reg2 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `candidate.isolated.${ts}@pathway.test`,
        password: 'Password123!Secure',
        fullName: 'Isolated Candidate',
        role: 'candidate',
      },
    });
    expect(reg2.status()).toBe(201);
    const d2 = await reg2.json();
    otherCandidateToken = d2.token;
  });

  test('records an opt-in career transition and verifies individual user privacy (BR-157, BR-159, BR-161)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/career/transitions`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        fromRole: 'Software Engineer',
        toRole: 'Senior Software Engineer',
        salaryDelta: 27500,
        timeInRoleMonths: 26,
        consentFlag: true,
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.transition).toBeDefined();
    expect(data.transition.fromRole).toBe('Software Engineer');
    expect(data.transition.toRole).toBe('Senior Software Engineer');
    expect(data.transition.salaryDelta).toBe(27500);
    expect(data.transition.timeInRoleMonths).toBe(26);
    expect(data.transition.consentFlag).toBe(true);

    // Verify candidate can view their own transitions
    const myRes = await request.get(`${API_BASE}/career/transitions/my`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(myRes.status()).toBe(200);
    const myData = await myRes.json();
    expect(myData.transitions.length).toBeGreaterThanOrEqual(1);

    // Verify second candidate cannot see the first candidate's transitions (BR-159)
    const otherRes = await request.get(`${API_BASE}/career/transitions/my`, {
      headers: { authorization: `Bearer ${otherCandidateToken}` },
    });
    expect(otherRes.status()).toBe(200);
    const otherData = await otherRes.json();
    expect(otherData.transitions.length).toBe(0);
  });

  test('enforces explicit user consent policy on career transitions (BR-157)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/career/transitions`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        fromRole: 'Software Engineer',
        toRole: 'Senior Software Engineer',
        salaryDelta: 25000,
        timeInRoleMonths: 24,
        consentFlag: false,
      },
    });

    expect(res.status()).toBe(422);
    const err = await res.json();
    expect(err.error.code).toBe('POLICY_VIOLATION');
    expect(err.error.message).toContain('BR-157');
  });

  test('queries progression benchmarks enforcing k-anonymity (sampleCount >= 20, BR-160)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/career/benchmarks?minSamples=20`);
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.benchmarks).toBeDefined();
    expect(Array.isArray(data.benchmarks)).toBe(true);
    expect(data.benchmarks.length).toBeGreaterThan(0);

    for (const benchmark of data.benchmarks) {
      expect(benchmark.sampleCount).toBeGreaterThanOrEqual(20);
      expect(benchmark.isPublishable).toBe(true);
      expect(benchmark.transitionProbability).toBeGreaterThan(0);
      expect(benchmark.confidenceInterval).toBeDefined();
      expect(benchmark.dataSources).toContain('opt_in_career_transitions');
    }

    // Benchmark for Software Engineer -> Senior Software Engineer should be present (seeded with 28 samples)
    const seToSenior = data.benchmarks.find(
      (b: any) => b.fromRole === 'Software Engineer' && b.toRole === 'Senior Software Engineer'
    );
    expect(seToSenior).toBeDefined();
    expect(seToSenior.sampleCount).toBeGreaterThanOrEqual(20);

    // Benchmark for Software Engineer -> Product Manager should be excluded (< 20 samples)
    const seToPm = data.benchmarks.find(
      (b: any) => b.fromRole === 'Software Engineer' && b.toRole === 'Product Manager'
    );
    expect(seToPm).toBeUndefined();
  });

  test('calculates career transition probability disclosing confidence intervals and source attribution (BR-163)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/career/transition-probability`, {
      data: {
        fromRole: 'Software Engineer',
        toRole: 'Senior Software Engineer',
        baselineSalary: 125000,
      },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.benchmark).toBeDefined();
    expect(data.benchmark.transitionProbability).toBeGreaterThan(0.4);
    expect(data.benchmark.confidenceInterval.lower).toBeGreaterThan(0.3);
    expect(data.benchmark.confidenceInterval.upper).toBeLessThan(0.9);
    expect(data.benchmark.medianTimeMonths).toBeGreaterThanOrEqual(24);
    expect(data.benchmark.medianSalaryDelta).toBeGreaterThanOrEqual(20000);
    expect(data.benchmark.dataSources).toContain('opt_in_career_transitions');
  });

  test('discovers career progression pathways with 5-year salary trajectory projection (F-152, BR-161)', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/career/pathways?originRole=Software+Engineer&enforceKAnonymity=true&baselineSalary=115000`
    );
    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.pathway).toBeDefined();
    expect(data.pathway.originRole).toBe('Software Engineer');
    expect(data.pathway.pathways.length).toBeGreaterThan(0);
    expect(data.pathway.pathways[0].targetRole).toBe('Senior Software Engineer');
    expect(data.pathway.pathways[0].sampleCount).toBeGreaterThanOrEqual(20);

    // Verify 5-year salary trajectory projection (BR-161)
    expect(data.salaryProjections).toBeDefined();
    expect(data.salaryProjections.length).toBe(5);
    expect(data.salaryProjections[0].year).toBe(1);
    expect(data.salaryProjections[0].projectedSalary).toBeGreaterThan(115000);
    expect(data.salaryProjections[0].cumulativeDelta).toBeGreaterThan(0);
    expect(data.salaryProjections[4].year).toBe(5);
    expect(data.salaryProjections[4].projectedSalary).toBeGreaterThan(
      data.salaryProjections[0].projectedSalary
    );
  });

  test('evaluates candidate milestone readiness against target role prerequisites (F-85, F-152)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/career/milestones/readiness`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        targetRole: 'Senior Software Engineer',
        candidateSkills: ['TypeScript', 'Node.js', 'System Architecture'],
        yearsOfExperience: 3.5,
        requiredYearsOfExperience: 5,
        educationLevel: 'bachelor',
        requiredEducationLevel: 'bachelor',
      },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.readiness).toBeDefined();
    expect(data.readiness.targetRole).toBe('Senior Software Engineer');
    expect(data.readiness.overallReadinessScore).toBeGreaterThan(50);
    expect(data.readiness.skillsOverlapPct).toBe(60); // 3 of 5
    expect(data.readiness.experienceReadinessPct).toBe(70); // 3.5 of 5
    expect(data.readiness.missingPrerequisites).toContain('Database Optimization');
    expect(data.readiness.missingPrerequisites).toContain('Distributed Systems');
    expect(data.readiness.recommendedMilestones.length).toBeGreaterThan(0);
    expect(data.readiness.recommendedMilestones[0]).toHaveProperty('title');
    expect(data.readiness.recommendedMilestones[0]).toHaveProperty('estimatedWeeks');
  });
});

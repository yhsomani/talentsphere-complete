import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Talent Segmentation & Classification (F-160, F-84, F-85, BR-200, P-02)', () => {
  let recruiterToken: string;
  let candidateToken: string;
  let candidateId: string;
  let devopsCandidateToken: string;
  let devopsCandidateId: string;
  let standardCandidateToken: string;

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // 1. Register Recruiter
    const regRecruiter = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recruiter.e2e.seg.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Segmentation Recruiter',
        role: 'recruiter',
      },
    });
    expect(regRecruiter.status()).toBe(201);
    const dRecruiter = await regRecruiter.json();
    recruiterToken = dRecruiter.token;

    // 2. Register Candidate 1 (FullStack / Frontend)
    const regCand1 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand1.e2e.seg.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Frontend Specialist',
        role: 'candidate',
      },
    });
    expect(regCand1.status()).toBe(201);
    const dCand1 = await regCand1.json();
    candidateId = dCand1.user.id;
    candidateToken = dCand1.token;

    // 3. Register Candidate 2 (Cloud / DevOps)
    const regCand2 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand2.e2e.seg.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Cloud Architect',
        role: 'candidate',
      },
    });
    expect(regCand2.status()).toBe(201);
    const dCand2 = await regCand2.json();
    devopsCandidateId = dCand2.user.id;
    devopsCandidateToken = dCand2.token;

    // 4. Register Standard Candidate (for authorization testing)
    const regCand3 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand3.e2e.seg.${ts}@talentsphere.test`,
        password: 'Password123!Secure',
        fullName: 'E2E Standard Candidate',
        role: 'candidate',
      },
    });
    expect(regCand3.status()).toBe(201);
    const dCand3 = await regCand3.json();
    standardCandidateToken = dCand3.token;
  });

  test('candidate classifies their own segmentation profile (F-160)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/recruiter/talent-segmentation/classify`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        skills: ['React', 'NextJS', 'TypeScript', 'Tailwind'],
        yearsOfExperience: 6.5,
        lastActiveDays: 3,
        verifiedEvidenceCount: 3,
        assessmentsPassedCount: 1,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.segmentation).toBeDefined();
    expect(body.segmentation.candidateId).toBe(candidateId);
    expect(body.segmentation.specialization).toBe('frontend');
    expect(body.segmentation.seniorityTier).toBe('senior');
    expect(body.segmentation.engagementSegment).toBe('active');
    expect(body.segmentation.readinessBand).toBe('ready_now');
  });

  test('recruiter classifies cloud architect candidate into staff tier (F-160)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/recruiter/talent-segmentation/classify`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        candidateId: devopsCandidateId,
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP'],
        yearsOfExperience: 10,
        lastActiveDays: 15,
        verifiedEvidenceCount: 4,
        assessmentsPassedCount: 2,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.segmentation.candidateId).toBe(devopsCandidateId);
    expect(body.segmentation.specialization).toBe('devops_cloud');
    expect(body.segmentation.seniorityTier).toBe('staff');
  });

  test('recruiter queries aggregate segment distribution with k-anonymity (BR-200)', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/recruiter/talent-segmentation/segments?kThreshold=10`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.report).toBeDefined();
    expect(body.report.totalAnalyzed).toBeGreaterThanOrEqual(2);
    expect(body.report.kThreshold).toBe(10);
    expect(body.report.bySpecialization).toBeDefined();
  });

  test('recruiter filters candidates by specialization and seniority tier (F-160)', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/recruiter/talent-segmentation/candidates?specialization=frontend&seniorityTier=senior`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.candidates.length).toBe(1);
    expect(body.candidates[0].candidateId).toBe(candidateId);
    expect(body.candidates[0].specialization).toBe('frontend');
    expect(body.candidates[0].seniorityTier).toBe('senior');
  });

  test('recruiter inspects candidate detailed segmentation profile breakdown', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/recruiter/talent-segmentation/candidates/${devopsCandidateId}`,
      {
        headers: { authorization: `Bearer ${recruiterToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.segmentation.candidateId).toBe(devopsCandidateId);
    expect(body.segmentation.specialization).toBe('devops_cloud');
    expect(body.segmentation.confidenceScore).toBeGreaterThanOrEqual(60);
  });

  test('prevents standard candidate from accessing recruiter segmentation directory (FORBIDDEN)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/recruiter/talent-segmentation/candidates`, {
      headers: { authorization: `Bearer ${standardCandidateToken}` },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });
});

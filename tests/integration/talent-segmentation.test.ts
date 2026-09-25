import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Talent Segmentation & Classification Integration (F-160, F-84, F-85, BR-200)', () => {
  let app: FastifyInstance;
  let recruiterToken: string;
  let candidate1Token: string;
  let candidate1Id: string;
  let candidate2Token: string;
  let candidate2Id: string;
  let standardCandidateToken: string;
  let standardCandidateId: string;

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
        email: 'recruiter.segmentation@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Talent Segmentation Lead',
        role: 'recruiter',
      },
    });
    const dRecruiter = JSON.parse(regRecruiter.body);
    recruiterToken = dRecruiter.token;

    // Register Candidate 1 (Frontend Senior)
    const regCand1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cand1.seg@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Senior Frontend Dev',
        role: 'candidate',
      },
    });
    const dCand1 = JSON.parse(regCand1.body);
    candidate1Token = dCand1.token;
    candidate1Id = dCand1.user.id;

    // Register Candidate 2 (DevOps Staff)
    const regCand2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cand2.seg@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Staff Cloud Architect',
        role: 'candidate',
      },
    });
    const dCand2 = JSON.parse(regCand2.body);
    candidate2Token = dCand2.token;
    candidate2Id = dCand2.user.id;

    // Register Standard Candidate
    const regCand3 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cand3.seg@talentsphere.test',
        password: 'Password123!Secure',
        fullName: 'Junior Candidate Dev',
        role: 'candidate',
      },
    });
    const dCand3 = JSON.parse(regCand3.body);
    standardCandidateToken = dCand3.token;
    standardCandidateId = dCand3.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Candidate can classify their own talent segmentation profile', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/talent-segmentation/classify',
      headers: { authorization: `Bearer ${candidate1Token}` },
      payload: {
        skills: ['React', 'NextJS', 'Tailwind', 'CSS'],
        yearsOfExperience: 6.5,
        lastActiveDays: 2,
        verifiedEvidenceCount: 3,
        assessmentsPassedCount: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.segmentation).toBeDefined();
    expect(body.segmentation.candidateId).toBe(candidate1Id);
    expect(body.segmentation.specialization).toBe('frontend');
    expect(body.segmentation.seniorityTier).toBe('senior');
    expect(body.segmentation.engagementSegment).toBe('active');
    expect(body.segmentation.readinessBand).toBe('ready_now');
  });

  it('2. Candidate cannot classify another candidate profile (FORBIDDEN)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/talent-segmentation/classify',
      headers: { authorization: `Bearer ${candidate1Token}` },
      payload: {
        candidateId: candidate2Id,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('3. Recruiter can classify candidate with multi-faceted parameters', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/recruiter/talent-segmentation/classify',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        candidateId: candidate2Id,
        skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS'],
        yearsOfExperience: 10,
        lastActiveDays: 20,
        verifiedEvidenceCount: 2,
        assessmentsPassedCount: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.segmentation.candidateId).toBe(candidate2Id);
    expect(body.segmentation.specialization).toBe('devops_cloud');
    expect(body.segmentation.seniorityTier).toBe('staff');
    expect(body.segmentation.engagementSegment).toBe('open');
  });

  it('4. Recruiter can query aggregate segment distribution with k-anonymity suppression (BR-200)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/segments?kThreshold=10',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.report).toBeDefined();
    expect(body.report.totalAnalyzed).toBeGreaterThanOrEqual(2);
    expect(body.report.kThreshold).toBe(10);
    // Since total samples is 2 (<10), buckets must be suppressed
    for (const item of body.report.bySpecialization) {
      expect(item.isSuppressed).toBe(true);
      expect(item.count).toBe('<10');
      expect(item.percentage).toBeNull();
    }
  });

  it('5. Regular candidate cannot access recruiter talent segmentation directory (FORBIDDEN)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/candidates',
      headers: { authorization: `Bearer ${standardCandidateToken}` },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('6. Unauthenticated request to talent segmentation returns 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/candidates',
    });

    expect(res.statusCode).toBe(401);
  });

  it('7. Recruiter can filter segmented candidates by specialization and seniority tier', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/candidates?specialization=frontend&seniorityTier=senior',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.candidates.length).toBe(1);
    expect(body.candidates[0].candidateId).toBe(candidate1Id);
    expect(body.candidates[0].specialization).toBe('frontend');
    expect(body.candidates[0].seniorityTier).toBe('senior');
  });

  it('8. Recruiter can view candidate segmentation breakdown details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/recruiter/talent-segmentation/candidates/${candidate2Id}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.segmentation.candidateId).toBe(candidate2Id);
    expect(body.segmentation.specialization).toBe('devops_cloud');
    expect(body.segmentation.seniorityTier).toBe('staff');
  });

  it('9. Candidate can view their own segmentation profile details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/recruiter/talent-segmentation/candidates/${candidate1Id}`,
      headers: { authorization: `Bearer ${candidate1Token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.segmentation.candidateId).toBe(candidate1Id);
  });

  it('10. Candidate cannot view another candidate segmentation profile details (FORBIDDEN)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/recruiter/talent-segmentation/candidates/${candidate1Id}`,
      headers: { authorization: `Bearer ${standardCandidateToken}` },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('11. Returns 404 when querying unknown non-existent candidate', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/candidates/00000000-0000-0000-0000-000000000999',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('12. Rejects invalid kThreshold with validation error (422)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/segments?kThreshold=2', // Min is 5
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });
});

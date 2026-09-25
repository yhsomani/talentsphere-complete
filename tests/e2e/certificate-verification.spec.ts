import { test, expect } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Certificate Verification & Credential Proofs (F-52, S-02, BR-150, SSOT 1132)', () => {
  let candidateToken: string;
  let candidateUserId: string;

  let adminToken: string;
  let adminUserId: string;

  let courseId: string;
  let certificateNumber: string;
  let verificationProofHash: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.cert.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan ProofLearner',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Mint platform admin token
    adminUserId = 'user_admin_e2e_cert_' + Date.now();
    adminToken = createSessionToken(
      adminUserId,
      `admin.e2e.cert.${Date.now()}@talentsphere.internal`,
      ['platform_admin']
    );

    // 3. Find seeded baseline course
    const catalogRes = await request.get(`${API_BASE}/courses`);
    expect(catalogRes.status()).toBe(200);
    const catalogData = await catalogRes.json();
    const seedCourse = catalogData.courses[0];
    courseId = seedCourse.id;

    // 4. Enroll candidate
    const enrollRes = await request.post(`${API_BASE}/courses/${courseId}/enroll`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(enrollRes.status()).toBe(201);

    // 5. Complete all lessons to mint certificate
    const courseDetailRes = await request.get(`${API_BASE}/courses/${courseId}`);
    expect(courseDetailRes.status()).toBe(200);
    const courseDetail = await courseDetailRes.json();
    const allLessons = courseDetail.course.modules.flatMap((m: any) => m.lessons);

    for (let i = 0; i < allLessons.length; i++) {
      const compRes = await request.post(`${API_BASE}/lessons/${allLessons[i].id}/complete`, {
        headers: { authorization: `Bearer ${candidateToken}` },
      });
      expect(compRes.status()).toBe(200);
      const compData = await compRes.json();
      if (compData.completed) {
        certificateNumber = compData.certificate.certificateNumber;
        verificationProofHash = compData.certificate.verificationProofHash;
      }
    }

    expect(certificateNumber).toBeDefined();
    expect(verificationProofHash).toBeDefined();
  });

  test('candidate can view their earned certificates with verification links', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/certificates/my`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.total).toBeGreaterThanOrEqual(1);
    const cert = data.certificates.find((c: any) => c.certificateNumber === certificateNumber);
    expect(cert).toBeDefined();
    expect(cert.verificationUrl).toBe(`/verify/${verificationProofHash}`);
  });

  test('public Zero-PII verification verifies legitimate proof hash without auth', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/verify/${verificationProofHash}`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.type).toBe('course_certificate');
    expect(data.verification.certificateNumber).toBe(certificateNumber);
    expect(data.verification.status).toBe('verified');
    expect(data.verification.authority).toContain('Zero-PII');

    // Direct alias verification
    const aliasRes = await request.get(`${API_BASE}/certificates/verify/${verificationProofHash}`);
    expect(aliasRes.status()).toBe(200);
    const aliasData = await aliasRes.json();
    expect(aliasData.valid).toBe(true);
    expect(aliasData.verification.status).toBe('verified');
  });

  test('returns 404 for unknown or tampered proof hash', async ({ request }) => {
    const res = await request.get(`${API_BASE}/verify/nonexistentproofhash1234567890abcdef`);
    expect(res.status()).toBe(404);
  });

  test('enforces role authorization on certificate revocation and reflects revocation publicly', async ({
    request,
  }) => {
    // 1. Candidate cannot revoke
    const forbidRes = await request.post(`${API_BASE}/certificates/${certificateNumber}/revoke`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: { reason: 'Unauthorized revocation attempt' },
    });
    expect(forbidRes.status()).toBe(403);

    // 2. Admin revokes certificate
    const revokeRes = await request.post(`${API_BASE}/certificates/${certificateNumber}/revoke`, {
      headers: { authorization: `Bearer ${adminToken}` },
      data: { reason: 'Integrity review failed: module completion anomaly detected.' },
    });
    expect(revokeRes.status()).toBe(200);
    const revokeData = await revokeRes.json();
    expect(revokeData.certificate.status).toBe('revoked');
    expect(revokeData.certificate.revokedAt).toBeDefined();

    // 3. Public verification now reflects revoked status
    const verifyRes = await request.get(`${API_BASE}/verify/${verificationProofHash}`);
    expect(verifyRes.status()).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData.valid).toBe(false);
    expect(verifyData.verification.status).toBe('revoked');
    expect(verifyData.verification.revocationReason).toBe(
      'Integrity review failed: module completion anomaly detected.'
    );
  });
});

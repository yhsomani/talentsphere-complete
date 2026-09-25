import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Integration: Certificate Verification & Public Proofs (F-52, S-02, BR-150, SSOT 1132)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;

  let adminToken: string;
  let adminUserId: string;

  let courseId: string;
  let certificateNumber: string;
  let verificationProofHash: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      SESSION_SECRET: 'test-session-secret-at-least-32-characters-long',
    });
    await app.ready();

    // 1. Register candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `cand.cert.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan CredentialLearner',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candData = JSON.parse(candRes.payload);
    candidateToken = candData.token;
    candidateUserId = candData.user.id;
    candidateProfileId = candData.profile.id;

    // 2. Mint platform admin token
    adminUserId = 'user_admin_cert_' + Date.now();
    adminToken = createSessionToken(adminUserId, `admin.cert.${Date.now()}@talentsphere.internal`, [
      'platform_admin',
    ]);

    // 3. Find seeded baseline course
    const catalogRes = await app.inject({
      method: 'GET',
      url: '/api/v1/courses',
    });
    expect(catalogRes.statusCode).toBe(200);
    const catalogData = JSON.parse(catalogRes.payload);
    const seedCourse = catalogData.courses[0];
    courseId = seedCourse.id;

    // 4. Enroll in course
    const enrollRes = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${courseId}/enroll`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(enrollRes.statusCode).toBe(201);

    // 5. Complete all lessons to trigger certificate minting
    const courseDetailRes = await app.inject({
      method: 'GET',
      url: `/api/v1/courses/${courseId}`,
    });
    expect(courseDetailRes.statusCode).toBe(200);
    const courseDetail = JSON.parse(courseDetailRes.payload);
    const allLessons = courseDetail.course.modules.flatMap((m: any) => m.lessons);

    for (let i = 0; i < allLessons.length; i++) {
      const compRes = await app.inject({
        method: 'POST',
        url: `/api/v1/lessons/${allLessons[i].id}/complete`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });
      expect(compRes.statusCode).toBe(200);
      const compData = JSON.parse(compRes.payload);
      if (compData.completed) {
        certificateNumber = compData.certificate.certificateNumber;
        verificationProofHash = compData.certificate.verificationProofHash;
      }
    }

    expect(certificateNumber).toBeDefined();
    expect(verificationProofHash).toBeDefined();
  });

  it('allows candidate to view their earned certificates with verification links (F-52)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/certificates/my',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.total).toBe(1);
    expect(data.certificates[0].certificateNumber).toBe(certificateNumber);
    expect(data.certificates[0].verificationUrl).toBe(`/verify/${verificationProofHash}`);
  });

  it('allows public Zero-PII verification via GET /verify/:hash (SSOT 1132, BR-150)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/verify/${verificationProofHash}`,
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.valid).toBe(true);
    expect(data.type).toBe('course_certificate');
    expect(data.verification.certificateNumber).toBe(certificateNumber);
    expect(data.verification.status).toBe('verified');
    expect(data.verification.authority).toContain('Zero-PII');
  });

  it('allows public verification via direct alias GET /certificates/verify/:hash (F-52)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/certificates/verify/${verificationProofHash}`,
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.valid).toBe(true);
    expect(data.verification.status).toBe('verified');
  });

  it('returns 404 for invalid or non-existent proof hash', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/verify/00000000000000000000000000000000',
    });

    expect(res.statusCode).toBe(404);
  });

  it('prohibits candidate from revoking a certificate', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/certificates/${certificateNumber}/revoke`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { reason: 'Unauthorized revocation attempt' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('allows platform admin to revoke certificate and reflects revoked status on public verification (BR-154)', async () => {
    // 1. Revoke certificate
    const revokeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/certificates/${certificateNumber}/revoke`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { reason: 'Irregularity identified in module progress evaluation.' },
    });
    expect(revokeRes.statusCode).toBe(200);

    // 2. Query public verification endpoint
    const verifyRes = await app.inject({
      method: 'GET',
      url: `/api/v1/verify/${verificationProofHash}`,
    });
    expect(verifyRes.statusCode).toBe(200);
    const verifyData = JSON.parse(verifyRes.payload);
    expect(verifyData.valid).toBe(false);
    expect(verifyData.verification.status).toBe('revoked');
    expect(verifyData.verification.revocationReason).toBe(
      'Irregularity identified in module progress evaluation.'
    );
  });
});

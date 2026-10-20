import { describe, it, expect } from 'vitest';
import {
  mintCourseCertificate,
  revokeCourseCertificate,
  verifyPublicCertificateProof,
  type Course,
} from '../../packages/domain/src/lms.js';

describe('Domain: Certificate Verification & Revocation (F-52, S-02, BR-150, SSOT 1132)', () => {
  const dummyCourse: Course = {
    id: 'course_cloud_arch',
    instructorId: 'prof_inst_1',
    title: 'Advanced Cloud Systems Architecture',
    slug: 'adv-cloud-arch',
    description: 'Deep dive into distributed architectures.',
    status: 'published',
    level: 'advanced',
    estimatedDurationMinutes: 180,
    passingScorePercent: 70,
    xpReward: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const adminActor = {
    userId: 'user_admin',
    roles: ['platform_admin'] as any,
  };

  // The course's own instructor (courses name their instructor by profile id).
  const instructorActor = {
    userId: 'user_inst',
    profileId: 'prof_inst_1',
    roles: ['instructor'] as any,
  };

  const otherInstructorActor = {
    userId: 'user_inst_2',
    profileId: 'prof_inst_2',
    roles: ['instructor'] as any,
  };

  const candidateActor = {
    userId: 'user_cand',
    roles: ['candidate'] as any,
  };

  it('mints certificate with verifiable proof hash and verifies public proof with Zero-PII (BR-150)', () => {
    const cert = mintCourseCertificate('enroll_1', 'user_123', dummyCourse);

    expect(cert.id).toBeDefined();
    expect(cert.certificateNumber).toMatch(/^CERT-ADVCLOUD/);
    expect(cert.verificationProofHash).toBeDefined();
    expect(cert.status).toBe('verified');

    const verified = verifyPublicCertificateProof(
      cert.verificationProofHash,
      cert,
      dummyCourse.title
    );

    expect(verified.isValid).toBe(true);
    expect(verified.status).toBe('verified');
    expect(verified.courseTitle).toBe('Advanced Cloud Systems Architecture');
    expect(verified.certificateNumber).toBe(cert.certificateNumber);
    expect(verified.verificationProofHash).toBe(cert.verificationProofHash);
    expect(verified.authority).toContain('Zero-PII');
  });

  it('rejects verification if proof hash does not match certificate or is malformed', () => {
    const cert = mintCourseCertificate('enroll_1', 'user_123', dummyCourse);

    expect(() => verifyPublicCertificateProof('short_bad', cert, dummyCourse.title)).toThrowError(
      /Invalid verification proof hash/
    );

    expect(() =>
      verifyPublicCertificateProof('00000000000000000000000000000000', cert, dummyCourse.title)
    ).toThrowError(/No certificate found matching verification proof hash/);
  });

  it('allows platform_admin to revoke a certificate with an auditable reason (BR-154)', () => {
    const cert = mintCourseCertificate('enroll_2', 'user_456', dummyCourse);
    const revoked = revokeCourseCertificate(
      cert,
      'Violation of academic integrity during final evaluation.',
      adminActor
    );

    expect(revoked.status).toBe('revoked');
    expect(revoked.revocationReason).toBe(
      'Violation of academic integrity during final evaluation.'
    );
    expect(revoked.revokedAt).toBeDefined();

    const proof = verifyPublicCertificateProof(
      revoked.verificationProofHash,
      revoked,
      dummyCourse.title
    );
    expect(proof.isValid).toBe(false);
    expect(proof.status).toBe('revoked');
    expect(proof.revocationReason).toBe('Violation of academic integrity during final evaluation.');
  });

  it("allows the course's instructor to revoke a certificate", () => {
    const cert = mintCourseCertificate('enroll_3', 'user_789', dummyCourse);
    const revoked = revokeCourseCertificate(
      cert,
      'Issued in error due to grading recalculation.',
      instructorActor,
      dummyCourse
    );

    expect(revoked.status).toBe('revoked');
    expect(revoked.revocationReason).toBe('Issued in error due to grading recalculation.');
  });

  it('prohibits an instructor of another course from revoking it (G-30)', () => {
    const cert = mintCourseCertificate('enroll_3b', 'user_789', dummyCourse);
    expect(() =>
      revokeCourseCertificate(
        cert,
        'Not my course, revoking anyway.',
        otherInstructorActor,
        dummyCourse
      )
    ).toThrowError(/course's instructor/);
    // Without the course to check against, an instructor role alone is not enough.
    expect(() =>
      revokeCourseCertificate(cert, 'Course unknown to the caller.', instructorActor)
    ).toThrowError(/course's instructor/);
  });

  it('prohibits candidate from revoking a certificate', () => {
    const cert = mintCourseCertificate('enroll_4', 'user_999', dummyCourse);
    expect(() =>
      revokeCourseCertificate(cert, 'Self revocation attempt', candidateActor)
    ).toThrowError(/Only a platform administrator or the course's instructor/);
  });

  it('rejects revocation with reason shorter than 5 characters', () => {
    const cert = mintCourseCertificate('enroll_5', 'user_111', dummyCourse);
    expect(() => revokeCourseCertificate(cert, 'Bad', adminActor)).toThrowError(
      /Revocation reason must be at least 5 characters/
    );
  });

  it('prohibits re-revoking an already revoked certificate', () => {
    const cert = mintCourseCertificate('enroll_6', 'user_222', dummyCourse);
    const revoked = revokeCourseCertificate(cert, 'First valid revocation reason.', adminActor);

    expect(() =>
      revokeCourseCertificate(revoked, 'Second revocation attempt.', adminActor)
    ).toThrowError(/Certificate has already been revoked/);
  });
});

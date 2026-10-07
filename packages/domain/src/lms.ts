import { createHash } from 'node:crypto';
import { DomainError, type Role } from './core.js';

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonContentType = 'text' | 'video' | 'interactive' | 'quiz';
export type EnrollmentStatus = 'enrolled' | 'completed' | 'dropped' | 'expired';
export type CertificateStatus = 'verified' | 'revoked' | 'expired';

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  slug: string;
  description: string;
  status: CourseStatus;
  level: CourseLevel;
  estimatedDurationMinutes: number;
  passingScorePercent: number;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: LessonContentType;
  contentBody: string;
  durationMinutes: number;
  orderIndex: number;
  prerequisiteLessonId?: string | null;
  isFreePreview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: 'in_progress' | 'completed';
  completedAt: string;
}

export interface CourseCertificate {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  verificationProofHash: string;
  evidenceId?: string | null;
  status: CertificateStatus;
  revocationReason?: string | null;
  revokedAt?: string | null;
  issuedAt: string;
}

export interface CoursePublishValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates course publishing readiness per BR-91 and BR-92.
 * BR-91: Course submission requires ≥3 lessons (standard threshold) and ≥30 min total content.
 * BR-92: Course requires ≥1 video or text lesson (no quiz-only courses).
 */
export function validateCoursePublishReadiness(
  course: Course,
  modules: CourseModule[],
  lessons: Lesson[]
): CoursePublishValidationResult {
  const errors: string[] = [];

  if (course.status === 'archived') {
    errors.push('Archived courses cannot be published.');
  }

  if (modules.length === 0) {
    errors.push('Course must have at least one module before publishing.');
  }

  if (lessons.length < 3) {
    errors.push(
      `Course must contain at least 3 lessons before publishing (BR-91). Found ${lessons.length}.`
    );
  }

  const totalDuration = lessons.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  if (totalDuration < 30) {
    errors.push(
      `Course must contain at least 30 minutes of content before publishing (BR-91). Found ${totalDuration} min.`
    );
  }

  const hasSubstantiveContent = lessons.some(
    (l) => l.contentType === 'text' || l.contentType === 'video'
  );
  if (!hasSubstantiveContent) {
    errors.push(
      'Course must include at least 1 text or video lesson; quiz-only courses are prohibited (BR-92).'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Enrolls a user in a published course with duplicate prevention (BR-46).
 */
export function enrollUserInCourse(
  existingEnrollments: CourseEnrollment[],
  userId: string,
  course: Course
): CourseEnrollment {
  if (course.status !== 'published') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Cannot enroll in course "${course.title}" because it is not published (status: ${course.status}).`
    );
  }

  const activeEnrollment = existingEnrollments.find(
    (e) =>
      e.userId === userId &&
      e.courseId === course.id &&
      (e.status === 'enrolled' || e.status === 'completed')
  );

  if (activeEnrollment) {
    throw new DomainError(
      'CONFLICT',
      `User is already enrolled in course "${course.title}" (BR-046).`
    );
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    courseId: course.id,
    status: 'enrolled',
    progressPercent: 0.0,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validates sequential module progression per BR-47.
 * Cannot complete a lesson in module N until all lessons in prior modules (orderIndex < current) are completed.
 */
export function verifySequentialModuleProgress(
  modules: CourseModule[],
  lessons: Lesson[],
  completedLessonIds: Set<string>,
  targetLesson: Lesson
): void {
  const targetModule = modules.find((m) => m.id === targetLesson.moduleId);
  if (!targetModule) {
    throw new DomainError('NOT_FOUND', 'Target module not found for lesson.');
  }

  const priorModules = modules
    .filter((m) => m.orderIndex < targetModule.orderIndex)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  for (const module of priorModules) {
    const moduleLessons = lessons.filter((l) => l.moduleId === module.id);
    const allCompleted = moduleLessons.every((l) => completedLessonIds.has(l.id));
    if (!allCompleted) {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        `Module progress is strictly sequential (BR-047). Complete all lessons in module "${module.title}" before starting module "${targetModule.title}".`
      );
    }
  }
}

/**
 * Validates direct lesson prerequisites per BR-22.
 */
export function verifyLessonPrerequisites(
  targetLesson: Lesson,
  completedLessonIds: Set<string>
): void {
  if (targetLesson.prerequisiteLessonId) {
    if (!completedLessonIds.has(targetLesson.prerequisiteLessonId)) {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        'Lesson prerequisite has not been completed yet (BR-022).'
      );
    }
  }
}

/**
 * Computes course completion percentage.
 */
export function calculateCourseProgress(totalLessons: number, completedLessons: number): number {
  if (totalLessons === 0) return 0;
  const percent = (completedLessons / totalLessons) * 100;
  return Math.min(100, Math.max(0, Number(percent.toFixed(2))));
}

/**
 * Generates a public verification proof hash per BR-150 & BR-155 (Zero PII).
 */
export function generateCertificateProofHash(
  certificateNumber: string,
  userId: string,
  courseId: string,
  issuedAt: string
): string {
  return createHash('sha256')
    .update(`cert:${certificateNumber}:user:${userId}:course:${courseId}:ts:${issuedAt}`)
    .digest('hex');
}

/**
 * Issues a verified course completion certificate (BR-23).
 */
export function mintCourseCertificate(
  enrollmentId: string,
  userId: string,
  course: Course,
  evidenceId?: string | null
): CourseCertificate {
  const now = new Date().toISOString();
  const slugClean = course.slug
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8)
    .toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const certificateNumber = `CERT-${slugClean}-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
  const proofHash = generateCertificateProofHash(certificateNumber, userId, course.id, now);

  return {
    id: crypto.randomUUID(),
    enrollmentId,
    userId,
    courseId: course.id,
    certificateNumber,
    verificationProofHash: proofHash,
    evidenceId: evidenceId || null,
    status: 'verified',
    issuedAt: now,
  };
}

/**
 * Revokes an issued course certificate (BR-154, F-52).
 * Allowed only for platform administrators or course instructors.
 */
export function revokeCourseCertificate(
  certificate: CourseCertificate,
  reason: string,
  actor: { userId: string; roles: Role[] }
): CourseCertificate {
  if (certificate.status === 'revoked') {
    throw new DomainError('INVALID_STATE_TRANSITION', 'Certificate has already been revoked.');
  }

  const isAuthorized = actor.roles.includes('platform_admin') || actor.roles.includes('instructor');
  if (!isAuthorized) {
    throw new DomainError(
      'FORBIDDEN',
      'Only platform administrators or instructors may revoke a certificate.'
    );
  }

  if (!reason || reason.trim().length < 5) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Revocation reason must be at least 5 characters long.'
    );
  }

  const now = new Date().toISOString();
  return {
    ...certificate,
    status: 'revoked',
    revocationReason: reason.trim(),
    revokedAt: now,
  };
}

/**
 * Verifies public certificate proof hash with Zero-PII guarantee (F-52, S-02, BR-150, SSOT 1132).
 */
export function verifyPublicCertificateProof(
  hash: string,
  cert?: CourseCertificate,
  courseTitle?: string
) {
  if (!hash || hash.trim().length < 10) {
    throw new DomainError('VALIDATION_FAILED', 'Invalid verification proof hash.');
  }

  if (!cert || cert.verificationProofHash !== hash) {
    throw new DomainError(
      'NOT_FOUND',
      `No certificate found matching verification proof hash "${hash}".`
    );
  }

  return {
    isValid: cert.status === 'verified',
    status: cert.status,
    certificateNumber: cert.certificateNumber,
    courseTitle: courseTitle || 'Verified Course',
    issuedAt: cert.issuedAt,
    verificationProofHash: cert.verificationProofHash,
    revokedAt: cert.revokedAt,
    revocationReason: cert.revocationReason,
    authority: 'TalentSphere Verified Credential Authority (Zero-PII BR-150)',
  };
}

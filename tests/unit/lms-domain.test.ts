import { describe, it, expect } from 'vitest';
import {
  validateCoursePublishReadiness,
  enrollUserInCourse,
  verifySequentialModuleProgress,
  verifyLessonPrerequisites,
  calculateCourseProgress,
  mintCourseCertificate,
  generateCertificateProofHash,
  Course,
  CourseModule,
  Lesson,
} from '../../packages/domain/src/index.js';

describe('LMS Domain & Business Rules (F-07)', () => {
  const mockCourse: Course = {
    id: 'course-1',
    instructorId: 'inst-1',
    title: 'Full-Stack TypeScript Mastery',
    slug: 'fullstack-ts',
    description: 'Learn modern full-stack development with TypeScript and Fastify',
    status: 'published',
    level: 'intermediate',
    estimatedDurationMinutes: 120,
    passingScorePercent: 70,
    xpReward: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const module1: CourseModule = {
    id: 'mod-1',
    courseId: 'course-1',
    title: 'Module 1: Foundations',
    orderIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const module2: CourseModule = {
    id: 'mod-2',
    courseId: 'course-1',
    title: 'Module 2: Advanced Patterns',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const lesson1: Lesson = {
    id: 'les-1',
    moduleId: 'mod-1',
    title: 'Introduction to TS',
    contentType: 'video',
    contentBody: 'Video stream',
    durationMinutes: 15,
    orderIndex: 0,
    isFreePreview: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const lesson2: Lesson = {
    id: 'les-2',
    moduleId: 'mod-1',
    title: 'Type Safety Invariants',
    contentType: 'text',
    contentBody: 'Reading material',
    durationMinutes: 20,
    orderIndex: 1,
    prerequisiteLessonId: 'les-1',
    isFreePreview: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const lesson3: Lesson = {
    id: 'les-3',
    moduleId: 'mod-2',
    title: 'Fastify Micro-Architecture',
    contentType: 'text',
    contentBody: 'Advanced architecture notes',
    durationMinutes: 25,
    orderIndex: 0,
    isFreePreview: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('validates course publish readiness rules (BR-91, BR-92)', () => {
    // Fails with < 3 lessons and < 30 mins
    const invalidRes = validateCoursePublishReadiness(mockCourse, [module1], [lesson1]);
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.errors.length).toBeGreaterThan(0);

    // Passes when threshold met (3 lessons, 60 mins, contains video/text)
    const validRes = validateCoursePublishReadiness(mockCourse, [module1, module2], [lesson1, lesson2, lesson3]);
    expect(validRes.valid).toBe(true);
    expect(validRes.errors).toHaveLength(0);
  });

  it('prevents enrollment in draft course and prevents duplicate active enrollment (BR-46)', () => {
    const draftCourse: Course = { ...mockCourse, status: 'draft' };
    expect(() => enrollUserInCourse([], 'user-1', draftCourse)).toThrowError(/not published/);

    const enrollment = enrollUserInCourse([], 'user-1', mockCourse);
    expect(enrollment.userId).toBe('user-1');
    expect(enrollment.status).toBe('enrolled');
    expect(enrollment.progressPercent).toBe(0);

    // Duplicate check
    expect(() => enrollUserInCourse([enrollment], 'user-1', mockCourse)).toThrowError(/already enrolled/);
  });

  it('enforces sequential module progression (BR-47)', () => {
    const modules = [module1, module2];
    const lessons = [lesson1, lesson2, lesson3];
    const completedLessonIds = new Set<string>(['les-1']); // Only lesson 1 completed in module 1

    // Attempting to complete lesson 3 in module 2 before finishing module 1
    expect(() =>
      verifySequentialModuleProgress(modules, lessons, completedLessonIds, lesson3)
    ).toThrowError(/Module progress is strictly sequential/);

    // Once module 1 is fully completed, module 2 is accessible
    completedLessonIds.add('les-2');
    expect(() =>
      verifySequentialModuleProgress(modules, lessons, completedLessonIds, lesson3)
    ).not.toThrow();
  });

  it('enforces lesson prerequisite completion (BR-22)', () => {
    const completedLessonIds = new Set<string>();

    // Attempting lesson 2 without lesson 1
    expect(() => verifyLessonPrerequisites(lesson2, completedLessonIds)).toThrowError(
      /Lesson prerequisite has not been completed/
    );

    // After lesson 1 is complete
    completedLessonIds.add('les-1');
    expect(() => verifyLessonPrerequisites(lesson2, completedLessonIds)).not.toThrow();
  });

  it('calculates progress percentage accurately', () => {
    expect(calculateCourseProgress(3, 1)).toBe(33.33);
    expect(calculateCourseProgress(3, 2)).toBe(66.67);
    expect(calculateCourseProgress(3, 3)).toBe(100);
    expect(calculateCourseProgress(0, 0)).toBe(0);
  });

  it('mints verified course completion certificate with zero-PII proof hash (BR-23, BR-150)', () => {
    const cert = mintCourseCertificate('enroll-1', 'user-1', mockCourse, 'evid-1');
    expect(cert.enrollmentId).toBe('enroll-1');
    expect(cert.status).toBe('verified');
    expect(cert.certificateNumber).toMatch(/^CERT-FULLSTAC-/);
    expect(cert.verificationProofHash).toHaveLength(64); // SHA-256 hex string

    const expectedHash = generateCertificateProofHash(
      cert.certificateNumber,
      'user-1',
      mockCourse.id,
      cert.issuedAt
    );
    expect(cert.verificationProofHash).toBe(expectedHash);
  });
});

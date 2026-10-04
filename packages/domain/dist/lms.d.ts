import { type Role } from './core.js';
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
export declare function validateCoursePublishReadiness(course: Course, modules: CourseModule[], lessons: Lesson[]): CoursePublishValidationResult;
/**
 * Enrolls a user in a published course with duplicate prevention (BR-46).
 */
export declare function enrollUserInCourse(existingEnrollments: CourseEnrollment[], userId: string, course: Course): CourseEnrollment;
/**
 * Validates sequential module progression per BR-47.
 * Cannot complete a lesson in module N until all lessons in prior modules (orderIndex < current) are completed.
 */
export declare function verifySequentialModuleProgress(modules: CourseModule[], lessons: Lesson[], completedLessonIds: Set<string>, targetLesson: Lesson): void;
/**
 * Validates direct lesson prerequisites per BR-22.
 */
export declare function verifyLessonPrerequisites(targetLesson: Lesson, completedLessonIds: Set<string>): void;
/**
 * Computes course completion percentage.
 */
export declare function calculateCourseProgress(totalLessons: number, completedLessons: number): number;
/**
 * Generates a public verification proof hash per BR-150 & BR-155 (Zero PII).
 */
export declare function generateCertificateProofHash(certificateNumber: string, userId: string, courseId: string, issuedAt: string): string;
/**
 * Issues a verified course completion certificate (BR-23).
 */
export declare function mintCourseCertificate(enrollmentId: string, userId: string, course: Course, evidenceId?: string | null): CourseCertificate;
/**
 * Revokes an issued course certificate (BR-154, F-52).
 * Allowed only for platform administrators or course instructors.
 */
export declare function revokeCourseCertificate(certificate: CourseCertificate, reason: string, actor: {
    userId: string;
    roles: Role[];
}): CourseCertificate;
/**
 * Verifies public certificate proof hash with Zero-PII guarantee (F-52, S-02, BR-150, SSOT 1132).
 */
export declare function verifyPublicCertificateProof(hash: string, cert?: CourseCertificate, courseTitle?: string): {
    isValid: boolean;
    status: CertificateStatus;
    certificateNumber: string;
    courseTitle: string;
    issuedAt: string;
    verificationProofHash: string;
    revokedAt: string | null | undefined;
    revocationReason: string | null | undefined;
    authority: string;
};
//# sourceMappingURL=lms.d.ts.map
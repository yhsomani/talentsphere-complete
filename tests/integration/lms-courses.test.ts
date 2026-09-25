import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('LMS Courses & Learning Management Integration (F-07)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateId: string;
  let instructorToken: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 0,
      LOG_LEVEL: 'error',
    });
    await app.ready();

    // 1. Register Candidate
    const candidateRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'learner.jane@example.com',
        password: 'SecurePassword123!',
        fullName: 'Jane Learner',
        role: 'candidate',
      },
    });
    const candidateJson = candidateRes.json();
    candidateToken = candidateJson.token;
    candidateId = candidateJson.user.id;

    // 2. Register Instructor
    const instructorRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'prof.smith@example.com',
        password: 'InstructorPassword123!',
        fullName: 'Prof. John Smith',
        role: 'candidate',
      },
    });
    instructorToken = instructorRes.json().token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows exploring seeded baseline courses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/courses',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.courses.length).toBeGreaterThanOrEqual(1);

    const seedCourse = body.courses.find(
      (c: any) => c.slug === 'typescript-fullstack-architecture'
    );
    expect(seedCourse).toBeDefined();
    expect(seedCourse.status).toBe('published');
    expect(seedCourse.moduleCount).toBe(2);
    expect(seedCourse.lessonCount).toBe(3);
  });

  it('enforces course publishing readiness rules (BR-91, BR-92)', async () => {
    // 1. Create a draft course
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/courses',
      headers: { authorization: `Bearer ${instructorToken}` },
      payload: {
        title: 'Modern Go Systems',
        slug: 'modern-go-systems',
        description: 'Building ultra low-latency services with Go.',
        level: 'advanced',
        estimatedDurationMinutes: 120,
        xpReward: 75,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const courseId = createRes.json().course.id;

    // 2. Attempt publish with 0 modules/lessons -> fails validation
    const earlyPublishRes = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${courseId}/publish`,
      headers: { authorization: `Bearer ${instructorToken}` },
    });
    expect(earlyPublishRes.statusCode).toBe(422);
    expect(earlyPublishRes.json().error.code).toBe('VALIDATION_FAILED');

    // 3. Add Module 1
    const mod1Res = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${courseId}/modules`,
      headers: { authorization: `Bearer ${instructorToken}` },
      payload: {
        title: 'Go Concurrency Primitives',
        description: 'Goroutines and Channels',
        orderIndex: 0,
      },
    });
    expect(mod1Res.statusCode).toBe(201);
    const mod1Id = mod1Res.json().module.id;

    // 4. Add Module 2
    const mod2Res = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${courseId}/modules`,
      headers: { authorization: `Bearer ${instructorToken}` },
      payload: {
        title: 'Production Observability & Metrics',
        description: 'Prometheus & OpenTelemetry',
        orderIndex: 1,
      },
    });
    expect(mod2Res.statusCode).toBe(201);
    const mod2Id = mod2Res.json().module.id;

    // 5. Add Lessons meeting duration and content requirements (≥3 lessons, ≥30 mins)
    const les1Res = await app.inject({
      method: 'POST',
      url: `/api/v1/modules/${mod1Id}/lessons`,
      headers: { authorization: `Bearer ${instructorToken}` },
      payload: {
        title: 'Goroutines and Worker Pools',
        contentType: 'text',
        contentBody: 'In-depth guide to bounded concurrency in Go.',
        durationMinutes: 15,
        orderIndex: 0,
        isFreePreview: true,
      },
    });
    const les1Id = les1Res.json().lesson.id;

    const les2Res = await app.inject({
      method: 'POST',
      url: `/api/v1/modules/${mod1Id}/lessons`,
      headers: { authorization: `Bearer ${instructorToken}` },
      payload: {
        title: 'Channel Select Mutex Elimination',
        contentType: 'text',
        contentBody: 'Non-blocking channel selection patterns.',
        durationMinutes: 15,
        orderIndex: 1,
        prerequisiteLessonId: les1Id,
        isFreePreview: false,
      },
    });
    expect(les2Res.statusCode).toBe(201);

    const les3Res = await app.inject({
      method: 'POST',
      url: `/api/v1/modules/${mod2Id}/lessons`,
      headers: { authorization: `Bearer ${instructorToken}` },
      payload: {
        title: 'Go Telemetry with OTel Tracing',
        contentType: 'video',
        contentBody: 'Video lecture on high-throughput tracing pipelines.',
        durationMinutes: 20,
        orderIndex: 0,
        isFreePreview: false,
      },
    });
    expect(les3Res.statusCode).toBe(201);

    // 6. Now publish -> succeeds
    const publishRes = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${courseId}/publish`,
      headers: { authorization: `Bearer ${instructorToken}` },
    });
    expect(publishRes.statusCode).toBe(200);
    expect(publishRes.json().course.status).toBe('published');
  });

  it('prevents duplicate active course enrollment (BR-46)', async () => {
    // Enroll in the seeded course
    const seedCourseRes = await app.inject({
      method: 'GET',
      url: '/api/v1/courses/typescript-fullstack-architecture',
    });
    const seedCourse = seedCourseRes.json().course;

    const enrollRes1 = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${seedCourse.id}/enroll`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(enrollRes1.statusCode).toBe(201);
    expect(enrollRes1.json().enrollment.status).toBe('enrolled');

    // Duplicate enrollment attempt
    const enrollRes2 = await app.inject({
      method: 'POST',
      url: `/api/v1/courses/${seedCourse.id}/enroll`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(enrollRes2.statusCode).toBe(409);
    expect(enrollRes2.json().error.code).toBe('CONFLICT');
  });

  it('enforces sequential module progression, prerequisites, idempotency, and certificate issuance (BR-21, BR-22, BR-23, BR-47, BR-150)', async () => {
    const courseRes = await app.inject({
      method: 'GET',
      url: '/api/v1/courses/typescript-fullstack-architecture',
    });
    const course = courseRes.json().course;
    const mod1 = course.modules[0];
    const mod2 = course.modules[1];
    const lesson1 = mod1.lessons[0];
    const lesson2 = mod1.lessons[1];
    const lesson3 = mod2.lessons[0];

    // 1. Attempting Lesson 3 in Module 2 without finishing Module 1 -> 422 BR-47
    const invalidModuleStepRes = await app.inject({
      method: 'POST',
      url: `/api/v1/lessons/${lesson3.id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(invalidModuleStepRes.statusCode).toBe(422);
    expect(invalidModuleStepRes.json().error.message).toContain(
      'Module progress is strictly sequential'
    );

    // 2. Attempting Lesson 2 without prerequisite Lesson 1 -> 422 BR-22
    const invalidPrereqRes = await app.inject({
      method: 'POST',
      url: `/api/v1/lessons/${lesson2.id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(invalidPrereqRes.statusCode).toBe(422);
    expect(invalidPrereqRes.json().error.message).toContain(
      'Lesson prerequisite has not been completed'
    );

    // 3. Complete Lesson 1 successfully
    const step1Res = await app.inject({
      method: 'POST',
      url: `/api/v1/lessons/${lesson1.id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(step1Res.statusCode).toBe(200);
    expect(step1Res.json().progress).toBe(33.33);
    expect(step1Res.json().completed).toBe(false);

    // 4. Idempotent check (BR-21): Completing Lesson 1 again returns 200 with alreadyCompleted: true
    const repeatStep1Res = await app.inject({
      method: 'POST',
      url: `/api/v1/lessons/${lesson1.id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(repeatStep1Res.statusCode).toBe(200);
    expect(repeatStep1Res.json().alreadyCompleted).toBe(true);

    // 5. Complete Lesson 2 (prerequisite satisfied)
    const step2Res = await app.inject({
      method: 'POST',
      url: `/api/v1/lessons/${lesson2.id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(step2Res.statusCode).toBe(200);
    expect(step2Res.json().progress).toBe(66.67);
    expect(step2Res.json().completed).toBe(false);

    // 6. Complete Lesson 3 in Module 2 (Module 1 now satisfied) -> Completes Course (BR-23)
    const step3Res = await app.inject({
      method: 'POST',
      url: `/api/v1/lessons/${lesson3.id}/complete`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(step3Res.statusCode).toBe(200);
    const step3Json = step3Res.json();
    expect(step3Json.progress).toBe(100);
    expect(step3Json.completed).toBe(true);
    expect(step3Json.certificate).toBeDefined();
    expect(step3Json.certificate.status).toBe('verified');
    expect(step3Json.xpAwarded).toBe(50);

    const certificateNumber = step3Json.certificate.certificateNumber;

    // 7. Verify public certificate endpoint (Zero-PII BR-150, BR-155)
    const certVerifyRes = await app.inject({
      method: 'GET',
      url: `/api/v1/certificates/${certificateNumber}`,
    });
    expect(certVerifyRes.statusCode).toBe(200);
    const certVerifyJson = certVerifyRes.json();
    expect(certVerifyJson.isValid).toBe(true);
    expect(certVerifyJson.courseTitle).toBe(course.title);
    expect(certVerifyJson.verificationProofHash).toHaveLength(64);

    // 8. Verify Candidate Progress endpoint returns full completion status
    const progressRes = await app.inject({
      method: 'GET',
      url: `/api/v1/courses/${course.id}/progress`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(progressRes.statusCode).toBe(200);
    const progressJson = progressRes.json();
    expect(progressJson.enrolled).toBe(true);
    expect(progressJson.enrollment.status).toBe('completed');
    expect(progressJson.completedLessonIds).toHaveLength(3);
    expect(progressJson.certificate.certificateNumber).toBe(certificateNumber);

    // 9. Verify worker dispatched background events
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const jobs = jobsRes.json().jobs;
    const lmsJob = jobs.find((j: any) => j.type === 'lms.course.completed');
    expect(lmsJob).toBeDefined();
    expect(lmsJob.payload.certificateNumber).toBe(certificateNumber);

    const evidenceJob = jobs.find(
      (j: any) => j.type === 'evidence.propagate' && j.payload.level === 'authority_verified'
    );
    expect(evidenceJob).toBeDefined();
  });
});

import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Skills Assessment, Anti-Cheating (BR-10), LMS & Course Completion (F-07, F-08, F-15, BR-23, BR-25)', () => {
  let candidateToken: string;
  let candidateId: string;
  let candidateProfileId: string;

  test.beforeAll(async ({ request }) => {
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `student.engineer.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan Coder',
        role: 'candidate',
      },
    });
    expect(regRes.status()).toBe(201);
    const regData = await regRes.json();
    candidateToken = regData.token;
    candidateId = regData.user.id;
    candidateProfileId = regData.profile.id;
  });

  test('enforces strict server-side AI prohibition during active assessment session (BR-10)', async ({
    request,
  }) => {
    // 1. Fetch available challenges
    const challengesRes = await request.get(`${API_BASE}/challenges`);
    expect(challengesRes.status()).toBe(200);
    const challengesData = await challengesRes.json();
    expect(challengesData.challenges.length).toBeGreaterThanOrEqual(1);
    const challenge = challengesData.challenges[0];

    // 2. Start assessment session for AI_PROHIBITED challenge
    const sessionRes = await request.post(`${API_BASE}/challenges/${challenge.id}/start-session`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(sessionRes.status()).toBe(201);
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.session.id;
    expect(sessionData.session.policyMode).toBe('AI_PROHIBITED');

    // 3. Attempt AI Assistant query while assessment session is active -> Must be rejected with 403 (BR-10)
    const aiProhibitedRes = await request.post(`${API_BASE}/ai/assistant/query`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        prompt: 'Can you write the code for reverse words in a string for me?',
      },
    });
    expect(aiProhibitedRes.status()).toBe(403);
    const aiErrData = await aiProhibitedRes.json();
    expect(aiErrData.error.message).toContain('proctored assessment session');

    // 4. Submit challenge solution to pass and complete session
    const submitRes = await request.post(`${API_BASE}/challenges/${challenge.id}/submit`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        sessionId,
        language: 'typescript',
        code: 'export function reverseWords(s: string): string { return s.trim().split(/\\s+/).reverse().join(" "); }',
      },
    });
    expect(submitRes.status()).toBe(200);
    const submitData = await submitRes.json();
    expect(submitData.result.status).toBe('passed');
    expect(submitData.xpEarned).toBeGreaterThan(0);

    // 5. Post-assessment: AI assistant query is now permitted
    const aiAllowedRes = await request.post(`${API_BASE}/ai/assistant/query`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        prompt: 'Explain time complexity of string reversal.',
      },
    });
    expect(aiAllowedRes.status()).toBe(200);
    const aiAllowedData = await aiAllowedRes.json();
    expect(aiAllowedData.answer).toBeDefined();
    expect(aiAllowedData.disclaimer).toBeDefined();
  });

  test('enrolls in LMS course, enforces prerequisite sequential ordering, and issues verified evidence on completion (BR-21..BR-23)', async ({
    request,
  }) => {
    // 1. Get published courses
    const coursesRes = await request.get(`${API_BASE}/courses`);
    expect(coursesRes.status()).toBe(200);
    const coursesData = await coursesRes.json();
    expect(coursesData.courses.length).toBeGreaterThanOrEqual(1);
    const course = coursesData.courses[0];

    // 2. Fetch full course structure with modules and lessons
    const detailRes = await request.get(`${API_BASE}/courses/${course.id}`);
    expect(detailRes.status()).toBe(200);
    const detailData = await detailRes.json();
    const modules = detailData.course.modules;
    expect(modules.length).toBeGreaterThanOrEqual(2);

    const module1 = modules[0];
    const module2 = modules[1];
    const lesson1 = module1.lessons[0];
    const lesson2 = module1.lessons[1];
    const lesson3 = module2.lessons[0];

    // 3. Enroll in course
    const enrollRes = await request.post(`${API_BASE}/courses/${course.id}/enroll`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(enrollRes.status()).toBe(201);
    const enrollData = await enrollRes.json();
    expect(enrollData.enrollment.status).toBe('enrolled');

    // 4. Attempting to complete Lesson 2 without completing prerequisite Lesson 1 must fail (BR-22)
    const prematureRes = await request.post(`${API_BASE}/lessons/${lesson2.id}/complete`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(prematureRes.status()).toBe(422);

    // 5. Complete Lesson 1
    const l1Res = await request.post(`${API_BASE}/lessons/${lesson1.id}/complete`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(l1Res.status()).toBe(200);

    // 6. Complete Lesson 2
    const l2Res = await request.post(`${API_BASE}/lessons/${lesson2.id}/complete`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(l2Res.status()).toBe(200);

    // 7. Complete Lesson 3 (final lesson) -> Completes course, generates certificate, auto-mints verified evidence (BR-23)
    const l3Res = await request.post(`${API_BASE}/lessons/${lesson3.id}/complete`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(l3Res.status()).toBe(200);
    const l3Data = await l3Res.json();
    expect(l3Data.completed).toBe(true);
    expect(l3Data.certificate).toBeDefined();
    expect(l3Data.certificate.certificateNumber).toBeDefined();

    // 8. Verify public zero-PII certificate (BR-150)
    const certRes = await request.get(
      `${API_BASE}/certificates/${l3Data.certificate.certificateNumber}`
    );
    expect(certRes.status()).toBe(200);
    const certData = await certRes.json();
    expect(certData.isValid).toBe(true);
    expect(certData.verificationProofHash).toBeDefined();

    // 9. Verify course progress
    const progressRes = await request.get(`${API_BASE}/courses/${course.id}/progress`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(progressRes.status()).toBe(200);
    const progressData = await progressRes.json();
    expect(progressData.enrolled).toBe(true);
    expect(progressData.enrollment.status).toBe('completed');
    expect(progressData.completedLessonIds.length).toBe(3);
  });
});

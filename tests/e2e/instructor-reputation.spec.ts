import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Instructor Reputation System (F-148, F-72, F-144, P-02)', () => {
  let instructor1Id: string;
  let instructor1Token: string;
  let instructor2Id: string;
  let instructor2Token: string;
  let studentToken: string;
  let studentId: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const timestamp = Date.now();

    // 1. Register Candidate (Student)
    const stuRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `student.inst.${timestamp}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Maya Student',
        role: 'candidate',
      },
    });
    expect(stuRes.status()).toBe(201);
    const stuData = await stuRes.json();
    studentToken = stuData.token;
    studentId = stuData.user.id;

    // 2. Instructor 1 & 2 via domain session token
    instructor1Id = `00000000-0000-4000-b000-${timestamp.toString().slice(-12).padStart(12, '0')}`;
    instructor2Id = `00000000-0000-4000-b001-${timestamp.toString().slice(-12).padStart(12, '0')}`;

    // Login helper or registration as recruiter then token with instructor role
    const rec1Res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `inst1.${timestamp}@academy.io`,
        password: 'Password123!Secure',
        fullName: 'Prof. Donald Knuth',
        role: 'recruiter',
      },
    });
    expect(rec1Res.status()).toBe(201);
    const rec1Data = await rec1Res.json();
    instructor1Id = rec1Data.user.id;
    instructor1Token = rec1Data.token;

    const rec2Res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `inst2.${timestamp}@academy.io`,
        password: 'Password123!Secure',
        fullName: 'Dr. Ada Lovelace',
        role: 'recruiter',
      },
    });
    expect(rec2Res.status()).toBe(201);
    const rec2Data = await rec2Res.json();
    instructor2Id = rec2Data.user.id;
    instructor2Token = rec2Data.token;

    // Admin token
    const adminRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `admin.inst.${timestamp}@platform.io`,
        password: 'Password123!Secure',
        fullName: 'Super Admin',
        role: 'recruiter',
      },
    });
    expect(adminRes.status()).toBe(201);
  });

  test('retrieves transparent factor breakdown with zero individual review leakage (F-148 Acceptance)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/reputation/instructors/${instructor1Id}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.instructorId).toBe(instructor1Id);
    expect(body.compositeScore).toBeGreaterThanOrEqual(0);
    expect(body.compositeScore).toBeLessThanOrEqual(100);
    expect(body.band).toBeDefined();

    // 5 Transparent Factors (Course Quality, Teaching Effectiveness, Currency, Responsiveness, Community Standing)
    expect(body.factors.courseQuality).toBeDefined();
    expect(body.factors.courseQuality.weight).toBe(0.25);
    expect(body.factors.teachingEffectiveness).toBeDefined();
    expect(body.factors.teachingEffectiveness.weight).toBe(0.25);
    expect(body.factors.currency).toBeDefined();
    expect(body.factors.currency.weight).toBe(0.2);
    expect(body.factors.responsiveness).toBeDefined();
    expect(body.factors.responsiveness.weight).toBe(0.15);
    expect(body.factors.communityStanding).toBeDefined();
    expect(body.factors.communityStanding.weight).toBe(0.15);

    // Privacy Verification: Zero raw student reviews or personal student data exposed
    expect(body.rawReviews).toBeUndefined();
    expect(body.studentComments).toBeUndefined();
    expect(body.studentIds).toBeUndefined();
  });

  test('instructor updates operational metrics and recomputes composite score', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/reputation/instructors/${instructor1Id}/metrics`, {
      headers: { authorization: `Bearer ${instructor1Token}` },
      data: {
        completionRate: 88.0,
        daysSinceLastCourseUpdate: 20,
        avgQaResponseHours: 5.0,
        qaAnsweredRate: 96.0,
        activeCoursesCount: 3,
        reviews: [
          { id: 'r1', rating: 5, isVerifiedEnrollment: true },
          { id: 'r2', rating: 4, isVerifiedEnrollment: true },
          { id: 'r3', rating: 5, isVerifiedEnrollment: true },
        ],
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.profile.compositeScore).toBeGreaterThanOrEqual(70);
    expect(body.profile.factors.currency.score).toBe(100); // <= 60 days
    expect(body.profile.factors.responsiveness.score).toBeGreaterThanOrEqual(85);
  });

  test('student submits review and system recalculates reputation with anti-manipulation trimming', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/reputation/instructors/${instructor1Id}/reviews`, {
      headers: { authorization: `Bearer ${studentToken}` },
      data: {
        rating: 5,
        isVerifiedEnrollment: true,
        feedback: 'Fantastic deep dive into concurrent data structures!',
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.compositeScore).toBeGreaterThanOrEqual(50);
    expect(body.factorBreakdown.teachingEffectiveness.score).toBeGreaterThan(0);
  });

  test('prevents self-reviews by instructor (BR-F148-02)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/reputation/instructors/${instructor1Id}/reviews`, {
      headers: { authorization: `Bearer ${instructor1Token}` },
      data: {
        rating: 5,
        isVerifiedEnrollment: true,
        feedback: 'I am the greatest instructor!',
      },
    });

    expect(res.status()).toBe(403);
  });
});

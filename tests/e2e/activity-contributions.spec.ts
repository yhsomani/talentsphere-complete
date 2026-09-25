import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Activity & Contribution Tracking (F-146, S-09, P-02)', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let recruiterToken: string;
  let recruiterUserId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `cand.act.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Alex Contributor',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Register Recruiter
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `rec.act.e2e.${Date.now()}@talentcloud.io`,
        password: 'Password123!Secure',
        fullName: 'Jordan Scout',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;
  });

  test('candidate initializes with neutral passive engagement score of 0', async ({ request }) => {
    const res = await request.get(`${API_BASE}/activity/scores/me`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.score.compositeScore).toBe(0);
    expect(body.score.engagementBand).toBe('passive');
    expect(body.score.totalEventsCount).toBe(0);
  });

  test('records diverse activity events across categories and advances engagement band', async ({
    request,
  }) => {
    // 1. Learning: complete a course
    const ev1 = await request.post(`${API_BASE}/activity/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        category: 'learning',
        activityType: 'course_completed',
        weight: 4.0,
      },
    });
    expect(ev1.status()).toBe(201);

    // 2. Creation: showcase project
    const ev2 = await request.post(`${API_BASE}/activity/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        category: 'creation',
        activityType: 'portfolio_project_published',
        weight: 3.5,
      },
    });
    expect(ev2.status()).toBe(201);

    // 3. Collaboration: peer review
    const ev3 = await request.post(`${API_BASE}/activity/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        category: 'collaboration',
        activityType: 'peer_review_submitted',
        weight: 2.5,
      },
    });
    expect(ev3.status()).toBe(201);

    // 4. Social: accepted connection
    const ev4 = await request.post(`${API_BASE}/activity/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        category: 'social',
        activityType: 'connection_accepted',
        weight: 1.0,
      },
    });
    expect(ev4.status()).toBe(201);
    const data4 = await ev4.json();
    expect(data4.score.totalEventsCount).toBe(4);
    expect(data4.score.compositeScore).toBeGreaterThanOrEqual(20);
    expect(['active', 'power_contributor', 'luminary']).toContain(data4.score.engagementBand);
  });

  test('candidate queries chronological activity feed with category filtering', async ({
    request,
  }) => {
    // All
    const allRes = await request.get(`${API_BASE}/activity/events`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(allRes.status()).toBe(200);
    const allBody = await allRes.json();
    expect(allBody.events).toHaveLength(4);

    // Category filter: creation
    const filterRes = await request.get(`${API_BASE}/activity/events?category=creation`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(filterRes.status()).toBe(200);
    const filterBody = await filterRes.json();
    expect(filterBody.events).toHaveLength(1);
    expect(filterBody.events[0].category).toBe('creation');
  });

  test('recruiter inspects candidate aggregate engagement profile with zero event leakage (F-146, P-02)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/activity/users/${candidateUserId}/score`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe(candidateUserId);
    expect(body.compositeScore).toBeGreaterThanOrEqual(20);
    expect(body.totalEventsCount).toBe(4);
    expect(body.learningScore).toBe(20); // 4.0 * 5
    expect(body.creationScore).toBe(35); // 3.5 * 10
    expect(body.collaborationScore).toBe(20); // 2.5 * 8
    expect(body.socialScore).toBe(3); // 1.0 * 3
    // Ensure zero private raw event rows leaked
    expect(body.events).toBeUndefined();
  });
});

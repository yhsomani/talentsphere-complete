import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Gamification & XP Ledger Integration (F-22, F-23, BR-25)', () => {
  let app: FastifyInstance;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 3000,
      SESSION_SECRET: 'test_jwt_secret_at_least_32_characters_long_for_security',
    });
    await app.ready();

    // Register a test candidate
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'gamification_player@example.com',
        password: 'Password123!',
        fullName: 'Jordan Sparks',
        role: 'candidate',
      },
    });
    expect(regRes.statusCode).toBe(201);
    const regBody = regRes.json();
    userToken = regBody.token;
    userId = regBody.user.id;
  });

  it('1. returns initial gamification summary with 0 XP, level 1, and 200 XP remaining cap', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/summary',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();

    expect(body.profile).toBeDefined();
    expect(body.profile.userId).toBe(userId);
    expect(body.profile.totalXp).toBe(0);
    expect(body.profile.currentLevel).toBe(1);
    expect(body.profile.currentStreak).toBe(0);

    expect(body.levelInfo).toBeDefined();
    expect(body.levelInfo.level).toBe(1);
    expect(body.levelInfo.nextLevelXp).toBe(100);
    expect(body.levelInfo.progressPercent).toBe(0);

    expect(body.todayXp).toBe(0);
    expect(body.dailyCap).toBe(200);
    expect(body.remainingDailyCap).toBe(200);
    expect(body.badgesCount).toBe(0);
    expect(body.recentTransactions).toEqual([]);
  });

  it('2. lists baseline platform badges catalog with none earned initially', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/badges',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();

    expect(Array.isArray(body.badges)).toBe(true);
    expect(body.badges.length).toBeGreaterThanOrEqual(6);

    const firstChallengeBadge = body.badges.find((b: any) => b.slug === 'first_challenge');
    expect(firstChallengeBadge).toBeDefined();
    expect(firstChallengeBadge.isEarned).toBe(false);

    const firstCourseBadge = body.badges.find((b: any) => b.slug === 'first_course');
    expect(firstCourseBadge).toBeDefined();
    expect(firstCourseBadge.isEarned).toBe(false);
  });

  it('3. successfully claims XP for a challenge, unlocks first_challenge badge, and dispatches worker jobs', async () => {
    const claimRes = await app.inject({
      method: 'POST',
      url: '/api/v1/gamification/claim-activity',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        amount: 50,
        referenceType: 'challenge',
        referenceId: 'ch-algorithm-001',
        description: 'Passed Binary Search Challenge',
      },
    });

    expect(claimRes.statusCode).toBe(200);
    const claimBody = claimRes.json();

    expect(claimBody.awarded).toBe(50);
    expect(claimBody.profile.totalXp).toBe(50);
    expect(claimBody.profile.currentLevel).toBe(1);
    expect(claimBody.profile.currentStreak).toBe(1);
    expect(claimBody.transaction).toBeDefined();
    expect(claimBody.transaction.referenceType).toBe('challenge');
    expect(claimBody.transaction.referenceId).toBe('ch-algorithm-001');

    // Badge should be awarded
    expect(claimBody.newlyUnlockedBadges).toBeDefined();
    expect(claimBody.newlyUnlockedBadges.length).toBe(1);
    expect(claimBody.newlyUnlockedBadges[0].slug).toBe('first_challenge');

    // Verify summary updated
    const summaryRes = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/summary',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    const summary = summaryRes.json();
    expect(summary.profile.totalXp).toBe(50);
    expect(summary.todayXp).toBe(50);
    expect(summary.remainingDailyCap).toBe(150);
    expect(summary.levelInfo.progressPercent).toBe(50);
    expect(summary.badgesCount).toBe(1);

    // Verify worker jobs were enqueued
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const jobs = jobsRes.json().jobs;

    const xpJob = jobs.find((j: any) => j.type === 'gamification.xp.awarded' && j.payload.referenceId === 'ch-algorithm-001');
    expect(xpJob).toBeDefined();
    expect(xpJob.payload.amount).toBe(50);

    const badgeJob = jobs.find((j: any) => j.type === 'gamification.badge.unlocked' && j.payload.badgeSlug === 'first_challenge');
    expect(badgeJob).toBeDefined();
  });

  it('4. enforces strict idempotency on duplicate activity claims (BR-25, WIT-011)', async () => {
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/gamification/claim-activity',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        amount: 50,
        referenceType: 'challenge',
        referenceId: 'ch-algorithm-001',
        description: 'Passed Binary Search Challenge (duplicate attempt)',
      },
    });

    expect(dupRes.statusCode).toBe(200);
    const body = dupRes.json();

    expect(body.isDuplicate).toBe(true);
    expect(body.awarded).toBe(0);
    expect(body.profile.totalXp).toBe(50); // Total remains 50
  });

  it('5. awards course XP, triggers level-up, and awards first_course badge', async () => {
    const claimRes = await app.inject({
      method: 'POST',
      url: '/api/v1/gamification/claim-activity',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        amount: 100,
        referenceType: 'course',
        referenceId: 'crs-typescript-101',
        description: 'Completed TypeScript Masterclass',
      },
    });

    expect(claimRes.statusCode).toBe(200);
    const body = claimRes.json();

    expect(body.awarded).toBe(100);
    expect(body.profile.totalXp).toBe(150);
    // Level 1 threshold: 0-99, Level 2 starts at 100 XP
    expect(body.profile.currentLevel).toBe(2);

    expect(body.newlyUnlockedBadges.length).toBe(1);
    expect(body.newlyUnlockedBadges[0].slug).toBe('first_course');

    // Verify badges list reflects both earned badges
    const badgesRes = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/badges',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    const badges = badgesRes.json().badges;
    const earned = badges.filter((b: any) => b.isEarned);
    expect(earned.length).toBe(2);
    expect(earned.map((b: any) => b.slug).sort()).toEqual(['first_challenge', 'first_course']);
  });

  it('6. strictly enforces daily 200 XP ledger cap with partial award and rejection (BR-25)', async () => {
    // Current total today: 50 + 100 = 150. Remaining cap: 50.
    // Requesting 80 XP should award only 50 XP, clamping daily total to 200.
    const partialClaimRes = await app.inject({
      method: 'POST',
      url: '/api/v1/gamification/claim-activity',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        amount: 80,
        referenceType: 'assessment',
        referenceId: 'ass-practical-01',
        description: 'React Practical Evaluation',
      },
    });

    expect(partialClaimRes.statusCode).toBe(200);
    const partialBody = partialClaimRes.json();

    expect(partialBody.awarded).toBe(50);
    expect(partialBody.profile.totalXp).toBe(200);

    // Summary check: remainingDailyCap should now be 0
    const summaryRes = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/summary',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    const summary = summaryRes.json();
    expect(summary.todayXp).toBe(200);
    expect(summary.remainingDailyCap).toBe(0);

    // Any further claim on the same day must be rejected with isCapReached
    const cappedRes = await app.inject({
      method: 'POST',
      url: '/api/v1/gamification/claim-activity',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        amount: 50,
        referenceType: 'challenge',
        referenceId: 'ch-algorithm-002',
        description: 'Dynamic Programming Challenge',
      },
    });

    expect(cappedRes.statusCode).toBe(200);
    const cappedBody = cappedRes.json();

    expect(cappedBody.isCapReached).toBe(true);
    expect(cappedBody.awarded).toBe(0);
    expect(cappedBody.profile.totalXp).toBe(200);
  });

  it('7. returns ordered ledger transaction history', async () => {
    const txRes = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/transactions',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(txRes.statusCode).toBe(200);
    const body = txRes.json();

    expect(Array.isArray(body.transactions)).toBe(true);
    expect(body.transactions.length).toBe(3);

    const amounts = body.transactions.map((t: any) => t.amount);
    expect(amounts).toEqual([50, 100, 50]); // reverse chronological order: latest first
  });

  it('8. requires valid authentication token', async () => {
    const unauthSummary = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/summary',
    });
    expect(unauthSummary.statusCode).toBe(401);

    const unauthClaim = await app.inject({
      method: 'POST',
      url: '/api/v1/gamification/claim-activity',
      payload: {
        amount: 50,
        referenceType: 'challenge',
        referenceId: 'ch-test',
      },
    });
    expect(unauthClaim.statusCode).toBe(401);
  });

  it('9. computes weekly and all-time leaderboard rankings with current user rank (OD-06, F-23)', async () => {
    // Register a second player who earns less XP
    const regRes2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'gamification_player2@example.com',
        password: 'Password123!',
        fullName: 'Taylor Swiftly',
        role: 'candidate',
      },
    });
    expect(regRes2.statusCode).toBe(201);
    const token2 = regRes2.json().token;

    // Player 2 earns 30 XP
    await app.inject({
      method: 'POST',
      url: '/api/v1/gamification/claim-activity',
      headers: { authorization: `Bearer ${token2}` },
      payload: {
        amount: 30,
        referenceType: 'challenge',
        referenceId: 'ch-basic-1',
        description: 'First Challenge',
      },
    });

    // Query all-time leaderboard
    const allTimeRes = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/leaderboard?period=all_time',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(allTimeRes.statusCode).toBe(200);
    const allTimeBody = allTimeRes.json();
    expect(allTimeBody.period).toBe('all_time');
    expect(allTimeBody.leaderboard.length).toBeGreaterThanOrEqual(2);

    // Player 1 (200 XP) should rank above Player 2 (30 XP)
    expect(allTimeBody.leaderboard[0].userId).toBe(userId);
    expect(allTimeBody.leaderboard[0].rank).toBe(1);
    expect(allTimeBody.leaderboard[0].xp).toBe(200);
    expect(allTimeBody.currentUserRank).toBe(1);

    // Query weekly leaderboard
    const weeklyRes = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/leaderboard?period=weekly',
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(weeklyRes.statusCode).toBe(200);
    const weeklyBody = weeklyRes.json();
    expect(weeklyBody.period).toBe('weekly');
    // Player 2 should see their rank as 2
    expect(weeklyBody.currentUserRank).toBe(2);
  });
});

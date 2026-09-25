import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  updateStreak,
  processXpAward,
  evaluateEligibleBadges,
  computeLeaderboard,
  DEFAULT_PLATFORM_BADGES,
  DAILY_XP_CAP,
  type GamificationProfile,
  type Badge,
  type XpTransaction,
  type LeaderboardUserRecord,
} from '../../packages/domain/src/index.js';

describe('Gamification & XP Ledger Domain (F-22, F-23, BR-25, WF-11)', () => {
  const userId = '11111111-1111-1111-1111-111111111111';

  describe('calculateLevel (Level Progression Curve)', () => {
    it('calculates level 1 for starting XP and computes partial progress', () => {
      const lvl0 = calculateLevel(0);
      expect(lvl0.level).toBe(1);
      expect(lvl0.currentLevelFloorXp).toBe(0);
      expect(lvl0.nextLevelXp).toBe(100);
      expect(lvl0.progressPercent).toBe(0);

      const lvl50 = calculateLevel(50);
      expect(lvl50.level).toBe(1);
      expect(lvl50.progressPercent).toBe(50);
    });

    it('advances levels across quadratic arithmetic boundaries', () => {
      // Level 2 begins at 100 XP
      const lvl100 = calculateLevel(100);
      expect(lvl100.level).toBe(2);
      expect(lvl100.currentLevelFloorXp).toBe(100);
      expect(lvl100.nextLevelXp).toBe(250);
      expect(lvl100.progressPercent).toBe(0);

      // Level 3 begins at 250 XP
      const lvl250 = calculateLevel(250);
      expect(lvl250.level).toBe(3);
      expect(lvl250.currentLevelFloorXp).toBe(250);
      expect(lvl250.nextLevelXp).toBe(450);

      // Level 4 begins at 450 XP
      const lvl450 = calculateLevel(450);
      expect(lvl450.level).toBe(4);
    });

    it('handles negative or zero gracefully', () => {
      const negative = calculateLevel(-50);
      expect(negative.level).toBe(1);
      expect(negative.progressPercent).toBe(0);
    });
  });

  describe('updateStreak', () => {
    const baseProfile: GamificationProfile = {
      userId,
      totalXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    it('initializes streak on first activity', () => {
      const updated = updateStreak(baseProfile, '2026-09-01');
      expect(updated.currentStreak).toBe(1);
      expect(updated.longestStreak).toBe(1);
      expect(updated.lastActivityDate).toBe('2026-09-01');
    });

    it('does not increment streak for duplicate activity on the same date', () => {
      const active = {
        ...baseProfile,
        currentStreak: 3,
        longestStreak: 5,
        lastActivityDate: '2026-09-02',
      };
      const updated = updateStreak(active, '2026-09-02');
      expect(updated.currentStreak).toBe(3);
      expect(updated.longestStreak).toBe(5);
    });

    it('increments streak on consecutive calendar day', () => {
      const active = {
        ...baseProfile,
        currentStreak: 3,
        longestStreak: 3,
        lastActivityDate: '2026-09-02',
      };
      const updated = updateStreak(active, '2026-09-03');
      expect(updated.currentStreak).toBe(4);
      expect(updated.longestStreak).toBe(4);
    });

    it('resets streak to 1 after an inactivity gap while preserving longest streak', () => {
      const active = {
        ...baseProfile,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: '2026-09-01',
      };
      const updated = updateStreak(active, '2026-09-05'); // 4 days later
      expect(updated.currentStreak).toBe(1);
      expect(updated.longestStreak).toBe(10);
    });
  });

  describe('processXpAward (Daily Cap & Idempotency - BR-25, WIT-011)', () => {
    const baseProfile: GamificationProfile = {
      userId,
      totalXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: '2026-09-24T00:00:00Z',
      updatedAt: '2026-09-24T00:00:00Z',
    };

    it('awards XP and updates level and transaction ledger', () => {
      const result = processXpAward({
        userId,
        amount: 50,
        referenceType: 'challenge_completion',
        referenceId: 'challenge-1',
        description: 'Passed algorithmic challenge',
        profile: baseProfile,
        existingTransactions: [],
        currentDate: '2026-09-24',
      });

      expect(result.awardedAmount).toBe(50);
      expect(result.isDuplicate).toBe(false);
      expect(result.isCapReached).toBe(false);
      expect(result.transaction).toBeDefined();
      expect(result.transaction?.amount).toBe(50);
      expect(result.updatedProfile.totalXp).toBe(50);
    });

    it('enforces idempotency for duplicate (referenceType, referenceId) pairs', () => {
      const existingTx: XpTransaction = {
        id: 'tx-1',
        userId,
        amount: 50,
        referenceType: 'challenge_completion',
        referenceId: 'challenge-1',
        description: 'Previously rewarded challenge',
        createdAt: '2026-09-24T10:00:00Z',
      };

      const result = processXpAward({
        userId,
        amount: 50,
        referenceType: 'challenge_completion',
        referenceId: 'challenge-1',
        profile: { ...baseProfile, totalXp: 50 },
        existingTransactions: [existingTx],
        currentDate: '2026-09-24',
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.awardedAmount).toBe(0);
      expect(result.transaction?.id).toBe('tx-1');
      expect(result.updatedProfile.totalXp).toBe(50);
    });

    it('enforces canonical daily 200 XP ledger cap (BR-25)', () => {
      expect(DAILY_XP_CAP).toBe(200);

      // User already earned 160 XP today
      const existingTxs: XpTransaction[] = [
        {
          id: 'tx-1',
          userId,
          amount: 100,
          referenceType: 'challenge_completion',
          referenceId: 'challenge-1',
          description: 'Challenge 1',
          createdAt: '2026-09-24T08:00:00Z',
        },
        {
          id: 'tx-2',
          userId,
          amount: 60,
          referenceType: 'lesson_completion',
          referenceId: 'lesson-1',
          description: 'Lesson 1',
          createdAt: '2026-09-24T09:00:00Z',
        },
      ];

      // User attempts to earn 75 XP (only 40 remaining under 200 cap)
      const resultPartial = processXpAward({
        userId,
        amount: 75,
        referenceType: 'course_completion',
        referenceId: 'course-1',
        profile: { ...baseProfile, totalXp: 160 },
        existingTransactions: existingTxs,
        currentDate: '2026-09-24',
      });

      expect(resultPartial.awardedAmount).toBe(40); // Capped at remaining 40
      expect(resultPartial.updatedProfile.totalXp).toBe(200);
      expect(resultPartial.isCapReached).toBe(false);

      // Now with 200 XP already earned today, next attempt awards 0
      const fullTxs = [...existingTxs, resultPartial.transaction!];
      const resultBlocked = processXpAward({
        userId,
        amount: 50,
        referenceType: 'challenge_completion',
        referenceId: 'challenge-3',
        profile: resultPartial.updatedProfile,
        existingTransactions: fullTxs,
        currentDate: '2026-09-24',
      });

      expect(resultBlocked.isCapReached).toBe(true);
      expect(resultBlocked.awardedAmount).toBe(0);
      expect(resultBlocked.transaction).toBeUndefined();
    });
  });

  describe('evaluateEligibleBadges', () => {
    const badges: Badge[] = DEFAULT_PLATFORM_BADGES.map((b, i) => ({
      ...b,
      id: `badge-${i + 1}`,
    }));

    it('identifies unlocked badges according to milestone criteria', () => {
      const metrics = {
        totalXp: 550,
        completedChallengesCount: 1,
        completedCoursesCount: 0,
        currentStreak: 4,
        connectionsCount: 2,
      };

      const unlocked = evaluateEligibleBadges(metrics, badges, []);
      const slugs = unlocked.map((b) => b.slug);

      expect(slugs).toContain('first_challenge');
      expect(slugs).toContain('streak_3');
      expect(slugs).toContain('xp_500');
      expect(slugs).toContain('first_connection');
      expect(slugs).not.toContain('first_course');
      expect(slugs).not.toContain('streak_7');
    });

    it('ignores already awarded badge IDs', () => {
      const metrics = {
        totalXp: 600,
        completedChallengesCount: 5,
        completedCoursesCount: 2,
        currentStreak: 10,
        connectionsCount: 5,
      };

      const firstChallengeBadge = badges.find((b) => b.slug === 'first_challenge')!;
      const unlocked = evaluateEligibleBadges(metrics, badges, [firstChallengeBadge.id]);
      const slugs = unlocked.map((b) => b.slug);

      expect(slugs).not.toContain('first_challenge');
      expect(slugs).toContain('first_course');
    });
  });

  describe('computeLeaderboard (OD-06, F-23)', () => {
    const mockRecords: LeaderboardUserRecord[] = [
      {
        userId: 'u1',
        displayName: 'Alice',
        totalXp: 450,
        level: 4,
        currentStreak: 5,
        badgesCount: 3,
        weeklyXp: 80,
      },
      {
        userId: 'u2',
        displayName: 'Bob',
        totalXp: 700,
        level: 5,
        currentStreak: 2,
        badgesCount: 5,
        weeklyXp: 200,
      },
      {
        userId: 'u3',
        displayName: 'Charlie',
        totalXp: 450,
        level: 4,
        currentStreak: 7, // Higher streak than Alice
        badgesCount: 2,
        weeklyXp: 50,
      },
      {
        userId: 'u4',
        displayName: 'Dana',
        totalXp: 120,
        level: 2,
        currentStreak: 1,
        badgesCount: 1,
        weeklyXp: 120,
      },
    ];

    it('ranks users by all-time XP descending with streak tie-breaking', () => {
      const leaderboard = computeLeaderboard(mockRecords, 'all_time');

      expect(leaderboard).toHaveLength(4);
      expect(leaderboard[0].displayName).toBe('Bob'); // 700 XP
      expect(leaderboard[0].rank).toBe(1);

      // Charlie and Alice both have 450 XP, but Charlie has streak 7 vs Alice 5
      expect(leaderboard[1].displayName).toBe('Charlie');
      expect(leaderboard[1].rank).toBe(2);

      expect(leaderboard[2].displayName).toBe('Alice');
      expect(leaderboard[2].rank).toBe(3);

      expect(leaderboard[3].displayName).toBe('Dana');
      expect(leaderboard[3].rank).toBe(4);
    });

    it('ranks users by weekly XP descending for weekly tab', () => {
      const weekly = computeLeaderboard(mockRecords, 'weekly');

      expect(weekly).toHaveLength(4);
      expect(weekly[0].displayName).toBe('Bob'); // 200 weekly XP
      expect(weekly[0].rank).toBe(1);
      expect(weekly[0].xp).toBe(200);

      expect(weekly[1].displayName).toBe('Dana'); // 120 weekly XP
      expect(weekly[1].rank).toBe(2);
      expect(weekly[1].xp).toBe(120);

      expect(weekly[2].displayName).toBe('Alice'); // 80 weekly XP
      expect(weekly[2].rank).toBe(3);
      expect(weekly[2].xp).toBe(80);

      expect(weekly[3].displayName).toBe('Charlie'); // 50 weekly XP
      expect(weekly[3].rank).toBe(4);
      expect(weekly[3].xp).toBe(50);
    });

    it('respects limit parameter', () => {
      const top2 = computeLeaderboard(mockRecords, 'all_time', 2);
      expect(top2).toHaveLength(2);
      expect(top2.map((e) => e.displayName)).toEqual(['Bob', 'Charlie']);
    });
  });
});

/**
 * Gamification: XP summary, transactions, badges, leaderboard and activity
 * claims (F-22, F-23, BR-25, WF-11). Moved out of server.ts with no behaviour
 * change (ADR-022, plan TS-12). The gamification, badge and XP Maps stay owned
 * by server.ts (settings, account erasure and the challenge and LMS routes use
 * them); these routes update them in place, as before.
 */
import crypto from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  computeLeaderboard,
  DAILY_XP_CAP,
  calculateLevel,
  evaluateEligibleBadges,
  processXpAward,
  type AuthPayload,
  type Badge,
  type Connection,
  type GamificationProfile,
  type LeaderboardUserRecord,
  type UserBadge,
  type XpTransaction,
} from '@talentsphere/domain';
import {
  ClaimGamificationActivityInputSchema,
  GetLeaderboardQuerySchema,
} from '@talentsphere/contracts';

export interface GamificationRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  dispatchJob(event: {
    type: string;
    payload: Record<string, unknown>;
    enqueuedAt?: string;
  }): Promise<void>;
  getOrCreateGamificationProfile(userId: string): GamificationProfile;
  gamificationProfilesByUserId: Map<string, GamificationProfile>;
  badgesById: ReadonlyMap<string, Badge>;
  userBadgesByUserId: Map<string, UserBadge[]>;
  xpTransactionsByUserId: Map<string, XpTransaction[]>;
  usersById: ReadonlyMap<string, { email: string }>;
  profilesByUserId: ReadonlyMap<string, { fullName?: string }>;
  connectionsByUserId: ReadonlyMap<string, Connection[]>;
}

export function registerGamificationRoutes(
  app: FastifyInstance,
  deps: GamificationRouteDeps
): void {
  const {
    extractUser,
    dispatchJob,
    getOrCreateGamificationProfile,
    gamificationProfilesByUserId,
    badgesById,
    userBadgesByUserId,
    xpTransactionsByUserId,
    usersById,
    profilesByUserId,
    connectionsByUserId,
  } = deps;

  app.get('/api/v1/gamification/summary', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = getOrCreateGamificationProfile(session.userId);
    const levelInfo = calculateLevel(profile.totalXp);

    const userTxs = xpTransactionsByUserId.get(session.userId) || [];
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = userTxs.filter((t) => t.createdAt.startsWith(today));
    const todayXp = todayTxs.reduce((sum, t) => sum + t.amount, 0);
    const remainingDailyCap = Math.max(0, DAILY_XP_CAP - todayXp);

    const userBadges = userBadgesByUserId.get(session.userId) || [];

    return reply.status(200).send({
      profile,
      levelInfo,
      todayXp,
      dailyCap: DAILY_XP_CAP,
      remainingDailyCap,
      badgesCount: userBadges.length,
      recentTransactions: userTxs.slice(0, 10),
    });
  });

  app.get('/api/v1/gamification/transactions', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userTxs = xpTransactionsByUserId.get(session.userId) || [];
    return reply.status(200).send({ transactions: userTxs });
  });

  app.get('/api/v1/gamification/badges', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userBadges = userBadgesByUserId.get(session.userId) || [];
    const earnedBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.awardedAt]));

    const allBadges = Array.from(badgesById.values()).map((b) => ({
      ...b,
      isEarned: earnedBadgeMap.has(b.id),
      awardedAt: earnedBadgeMap.get(b.id),
    }));

    return reply.status(200).send({ badges: allBadges });
  });

  app.get('/api/v1/gamification/leaderboard', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const query = GetLeaderboardQuerySchema.parse(req.query || {});

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const records: LeaderboardUserRecord[] = [];
    for (const [userId, user] of usersById.entries()) {
      const gProfile = getOrCreateGamificationProfile(userId);
      const userProfile = profilesByUserId.get(userId);
      const displayName = userProfile?.fullName || user.email.split('@')[0];
      const badges = userBadgesByUserId.get(userId) || [];
      const txs = xpTransactionsByUserId.get(userId) || [];

      const weeklyXp = txs
        .filter((t) => t.createdAt >= sevenDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      records.push({
        userId,
        displayName,
        totalXp: gProfile.totalXp,
        level: gProfile.currentLevel,
        currentStreak: gProfile.currentStreak,
        badgesCount: badges.length,
        weeklyXp,
      });
    }

    const leaderboard = computeLeaderboard(records, query.period, query.limit);
    const fullLeaderboard = computeLeaderboard(records, query.period, records.length);
    const currentUserEntry = fullLeaderboard.find((e) => e.userId === session.userId);
    const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;

    return reply.status(200).send({
      period: query.period,
      leaderboard,
      currentUserRank,
      totalParticipants: records.length,
    });
  });

  app.post(
    '/api/v1/gamification/claim-activity',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const input = ClaimGamificationActivityInputSchema.parse(req.body || {});

      const profile = getOrCreateGamificationProfile(session.userId);
      const existingTxs = xpTransactionsByUserId.get(session.userId) || [];

      const result = processXpAward({
        userId: session.userId,
        amount: input.amount,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
        profile,
        existingTransactions: existingTxs,
      });

      if (result.isDuplicate) {
        return reply.status(200).send({
          message: 'XP already credited for this activity.',
          awarded: 0,
          isDuplicate: true,
          transaction: result.transaction,
          profile,
        });
      }

      if (result.isCapReached) {
        return reply.status(200).send({
          message: `Daily XP cap reached (${DAILY_XP_CAP} XP/day). No additional XP awarded.`,
          awarded: 0,
          isCapReached: true,
          profile,
        });
      }

      // Persist transaction
      if (result.transaction) {
        existingTxs.unshift(result.transaction);
        xpTransactionsByUserId.set(session.userId, existingTxs);
      }
      gamificationProfilesByUserId.set(session.userId, result.updatedProfile);

      // Check eligible badges
      const userBadges = userBadgesByUserId.get(session.userId) || [];
      const alreadyAwardedIds = userBadges.map((b) => b.badgeId);

      const completedChallengesCount = existingTxs.filter(
        (t) => t.referenceType === 'challenge' || t.referenceType === 'challenge_completion'
      ).length;
      const completedCoursesCount = existingTxs.filter(
        (t) => t.referenceType === 'course' || t.referenceType === 'course_completion'
      ).length;
      const connectionsCount = (connectionsByUserId.get(session.userId) || []).filter(
        (c) => c.status === 'accepted'
      ).length;

      const newlyEligible = evaluateEligibleBadges(
        {
          totalXp: result.updatedProfile.totalXp,
          completedChallengesCount,
          completedCoursesCount,
          currentStreak: result.updatedProfile.currentStreak,
          connectionsCount,
        },
        Array.from(badgesById.values()),
        alreadyAwardedIds
      );

      const now = new Date().toISOString();
      for (const badge of newlyEligible) {
        const ub: UserBadge = {
          id: crypto.randomUUID(),
          userId: session.userId,
          badgeId: badge.id,
          awardedAt: now,
        };
        userBadges.push(ub);

        await dispatchJob({
          type: 'gamification.badge.unlocked',
          payload: {
            userId: session.userId,
            badgeId: badge.id,
            badgeSlug: badge.slug,
            badgeName: badge.name,
          },
          enqueuedAt: now,
        });
      }
      userBadgesByUserId.set(session.userId, userBadges);

      await dispatchJob({
        type: 'gamification.xp.awarded',
        payload: {
          userId: session.userId,
          amount: result.awardedAmount,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
        },
        enqueuedAt: now,
      });

      return reply.status(200).send({
        message: `Successfully awarded ${result.awardedAmount} XP`,
        awarded: result.awardedAmount,
        transaction: result.transaction,
        profile: result.updatedProfile,
        newlyUnlockedBadges: newlyEligible,
      });
    }
  );
}

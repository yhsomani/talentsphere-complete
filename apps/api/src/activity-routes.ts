/**
 * Activity and contribution tracking (F-146, S-09). Moved out of server.ts with
 * no behaviour change (ADR-022, plan TS-12). The event and score Maps stay
 * owned by server.ts (behavioral talent discovery and account erasure read
 * them); these routes update them in place, as before.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  calculateContributionScores,
  canViewActivity,
  DomainError,
  prependActivityEvent,
  recordActivityEvent,
  type ActivityEvent,
  type AuthPayload,
  type ContributionScore,
  type Profile,
} from '@talentsphere/domain';
import { RecordActivityEventInputSchema } from '@talentsphere/contracts';

export interface ActivityRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  readSettings(userId: string): Promise<{ showActivity?: boolean } | undefined>;
  viewerIsConnected(viewerId: string | undefined, profile: { userId: string }): boolean;
  activityEventsById: Map<string, ActivityEvent>;
  activityEventsByUserId: Map<string, ActivityEvent[]>;
  contributionScoresByUserId: Map<string, ContributionScore>;
  usersById: ReadonlyMap<string, unknown>;
  profilesByUserId: ReadonlyMap<string, Profile>;
}

export function registerActivityRoutes(app: FastifyInstance, deps: ActivityRouteDeps): void {
  const {
    extractUser,
    readSettings,
    viewerIsConnected,
    activityEventsById,
    activityEventsByUserId,
    contributionScoresByUserId,
    usersById,
    profilesByUserId,
  } = deps;

  // Self-reported and kept in memory: a 16 KB body, 60 a minute per account,
  // metadata limits, and the newest ACTIVITY_EVENT_RETENTION_PER_USER events
  // per account (M-1).
  const activityIngestOptions = {
    bodyLimit: 16 * 1024,
    config: { rateLimit: { max: 60, timeWindow: 60_000 } },
  };
  app.post(
    '/api/v1/activity/events',
    activityIngestOptions,
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const input = RecordActivityEventInputSchema.parse(req.body || {});

      const event = recordActivityEvent({
        userId: session.userId,
        category: input.category,
        activityType: input.activityType,
        weight: input.weight,
        metadata: input.metadata,
        occurredAt: input.occurredAt,
      });

      activityEventsById.set(event.id, event);

      const userEvents = activityEventsByUserId.get(session.userId) || [];
      for (const dropped of prependActivityEvent(userEvents, event)) {
        activityEventsById.delete(dropped.id);
      }
      activityEventsByUserId.set(session.userId, userEvents);

      const score = calculateContributionScores(session.userId, userEvents);
      contributionScoresByUserId.set(session.userId, score);

      return reply.status(201).send({ event, score });
    }
  );

  app.get(
    '/api/v1/activity/events',
    async (
      req: FastifyRequest<{ Querystring: { category?: string; limit?: string } }>,
      reply: FastifyReply
    ) => {
      const session = extractUser(req);
      const { category, limit } = req.query;

      let userEvents = activityEventsByUserId.get(session.userId) || [];
      if (category) {
        userEvents = userEvents.filter((e) => e.category === category);
      }

      if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          userEvents = userEvents.slice(0, parsedLimit);
        }
      }

      return reply.status(200).send({ events: userEvents });
    }
  );

  app.get('/api/v1/activity/scores/me', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userEvents = activityEventsByUserId.get(session.userId) || [];
    const score =
      contributionScoresByUserId.get(session.userId) ||
      calculateContributionScores(session.userId, userEvents);
    return reply.status(200).send({ score });
  });

  app.get(
    '/api/v1/activity/users/:userId/score',
    async (req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { userId } = req.params;

      const user = usersById.get(userId);
      const profile = profilesByUserId.get(userId);
      if (!user || !profile) {
        throw new DomainError('NOT_FOUND', `User ${userId} not found.`);
      }

      // Same privacy as the profile, plus the person's "show activity"
      // setting (C-26). Settings are read through without writing defaults.
      const settings = await readSettings(userId);
      const visibility = canViewActivity({
        profile,
        settings,
        viewerUserId: session.userId,
        viewerRoles: session.roles,
        isConnected: viewerIsConnected(session.userId, profile),
      });
      if (visibility === 'profile_restricted') {
        throw new DomainError(
          'FORBIDDEN',
          'This profile is private or restricted to authorized roles.'
        );
      }
      if (visibility === 'activity_hidden') {
        throw new DomainError('FORBIDDEN', 'This person does not share their activity.');
      }

      const userEvents = activityEventsByUserId.get(userId) || [];
      const score =
        contributionScoresByUserId.get(userId) || calculateContributionScores(userId, userEvents);

      return reply.status(200).send({
        userId,
        compositeScore: score.compositeScore,
        engagementBand: score.engagementBand,
        activeStreakDays: score.activeStreakDays,
        totalEventsCount: score.totalEventsCount,
        learningScore: score.learningScore,
        creationScore: score.creationScore,
        collaborationScore: score.collaborationScore,
        socialScore: score.socialScore,
        lastActiveAt: score.lastActiveAt,
      });
    }
  );

  app.post('/api/v1/activity/recalculate', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userEvents = activityEventsByUserId.get(session.userId) || [];
    const score = calculateContributionScores(session.userId, userEvents);
    contributionScoresByUserId.set(session.userId, score);

    return reply.status(200).send({ score });
  });
}

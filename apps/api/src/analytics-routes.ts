/**
 * Product analytics and telemetry (F-19, F-31, BR-27). Moved out of server.ts
 * with no behaviour change (ADR-022, plan TS-12). The bounded in-memory event
 * list stays owned by server.ts (account erasure removes a person's events
 * from it); these routes append to it and read it, as before.
 */
import crypto from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  ANALYTICS_EVENT_RETENTION,
  appendBounded,
  assertPlatformAdmin,
  computeKPIs,
  recordAnalyticsEvent,
  telemetryConsentFrom,
  type AnalyticsEvent,
  type AuthPayload,
  type UserSettings,
} from '@talentsphere/domain';
import {
  RecordAnalyticsEventBatchInputSchema,
  RecordAnalyticsEventInputSchema,
} from '@talentsphere/contracts';

export interface AnalyticsRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  maybeExtractUser(req: FastifyRequest): AuthPayload | null;
  readSettings(userId: string): Promise<UserSettings | undefined>;
  analyticsEvents: AnalyticsEvent[];
}

export function registerAnalyticsRoutes(app: FastifyInstance, deps: AnalyticsRouteDeps): void {
  const { extractUser, maybeExtractUser, readSettings, analyticsEvents } = deps;

  // Ingestion is anonymous and the store is in memory, so it is bounded: a
  // 64 KB body, 60 requests a minute per caller, metadata limits (BR-27) and
  // the newest ANALYTICS_EVENT_RETENTION events kept (C-03).
  const analyticsIngestOptions = {
    bodyLimit: 64 * 1024,
    config: { rateLimit: { max: 60, timeWindow: 60_000 } },
  };
  app.post(
    '/api/v1/analytics/events',
    analyticsIngestOptions,
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = maybeExtractUser(req);
      let telemetryConsent = true;

      if (session) {
        // The cache is filled only by GET/PATCH /settings, so after a restart
        // it is empty: read the durable setting through (never creating a
        // row) so an explicit opt-out survives restarts (C-10).
        const settings = await readSettings(session.userId);
        telemetryConsent = telemetryConsentFrom(settings);
      }

      const body = req.body as Record<string, unknown>;
      const ipHash = crypto
        .createHash('sha256')
        .update(req.ip || '127.0.0.1')
        .digest('hex');
      const userAgent =
        typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;

      const recorded: AnalyticsEvent[] = [];

      if (body && Array.isArray(body.events)) {
        const batchInput = RecordAnalyticsEventBatchInputSchema.parse(body);
        for (const item of batchInput.events) {
          const ev = recordAnalyticsEvent({
            userId: session?.userId,
            anonymousId: item.anonymousId,
            eventType: item.eventType,
            metadata: item.metadata,
            ipHash,
            userAgent,
            telemetryConsent,
          });
          appendBounded(analyticsEvents, ev, ANALYTICS_EVENT_RETENTION);
          recorded.push(ev);
        }
      } else {
        const singleInput = RecordAnalyticsEventInputSchema.parse(body);
        const ev = recordAnalyticsEvent({
          userId: session?.userId,
          anonymousId: singleInput.anonymousId,
          eventType: singleInput.eventType,
          metadata: singleInput.metadata,
          ipHash,
          userAgent,
          telemetryConsent,
        });
        appendBounded(analyticsEvents, ev, ANALYTICS_EVENT_RETENTION);
        recorded.push(ev);
      }

      return reply.status(201).send({
        message: 'Analytics event(s) recorded successfully.',
        count: recorded.length,
        // The caller's address hash and user agent stay server-side (admin
        // GET /analytics/events keeps the full record).
        events: recorded.map(({ ipHash: _ipHash, userAgent: _userAgent, ...event }) => event),
      });
    }
  );

  app.get(
    '/api/v1/analytics/events',
    async (req: FastifyRequest<{ Querystring: { eventType?: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      assertPlatformAdmin(session.roles);

      const { eventType } = req.query;
      let list = analyticsEvents;
      if (eventType) {
        list = list.filter((e) => e.eventType === eventType.toLowerCase());
      }

      return reply.status(200).send({
        events: list,
        total: list.length,
      });
    }
  );

  app.get(
    '/api/v1/analytics/kpis',
    async (req: FastifyRequest<{ Querystring: { eventType?: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      assertPlatformAdmin(session.roles);

      const { eventType } = req.query;
      let targetEvents = analyticsEvents;
      if (eventType) {
        targetEvents = targetEvents.filter((e) => e.eventType === eventType.toLowerCase());
      }

      const kpis = computeKPIs(targetEvents);
      return reply.status(200).send({ kpis });
    }
  );
}

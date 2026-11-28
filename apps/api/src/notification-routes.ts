/**
 * Notification center (F-14, BR-120). Moved out of server.ts with no behaviour
 * change (ADR-022, plan TS-12). The notification and preference Maps stay owned
 * by server.ts, which creates notifications for every other module; writes
 * still go through persist().
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  createDefaultNotificationPreferences,
  DomainError,
  markNotificationsAsRead,
  resolveMarkReadTargets,
  type AuthPayload,
  type Notification,
  type NotificationPreferences,
} from '@talentsphere/domain';
import {
  MarkNotificationsReadInputSchema,
  UpdateNotificationPreferencesInputSchema,
} from '@talentsphere/contracts';
import type { CoreOp } from './storage/index.js';

export interface NotificationRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  persist(...ops: CoreOp[]): Promise<void>;
  profilesByUserId: ReadonlyMap<string, { id: string }>;
  notificationsByRecipientId: ReadonlyMap<string, Notification[]>;
  notificationPreferencesByUserId: Map<string, NotificationPreferences>;
}

export function registerNotificationRoutes(
  app: FastifyInstance,
  deps: NotificationRouteDeps
): void {
  const {
    extractUser,
    persist,
    profilesByUserId,
    notificationsByRecipientId,
    notificationPreferencesByUserId,
  } = deps;

  app.get(
    '/api/v1/notifications',
    async (
      req: FastifyRequest<{ Querystring: { unreadOnly?: string; type?: string } }>,
      reply: FastifyReply
    ) => {
      const session = extractUser(req);
      const profile = profilesByUserId.get(session.userId);
      if (!profile) {
        throw new DomainError('NOT_FOUND', 'Profile not found.');
      }

      const userNotifs = notificationsByRecipientId.get(profile.id) || [];
      const unreadCount = userNotifs.filter((n) => !n.isRead).length;

      let filtered = [...userNotifs];
      if (req.query.unreadOnly === 'true') {
        filtered = filtered.filter((n) => !n.isRead);
      }
      if (req.query.type) {
        filtered = filtered.filter((n) => n.type === req.query.type);
      }

      return reply.status(200).send({
        notifications: filtered,
        unreadCount,
      });
    }
  );

  // The header badge: one small read on every page, instead of the list.
  app.get('/api/v1/notifications/summary', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    const unreadCount = profile
      ? (notificationsByRecipientId.get(profile.id) || []).filter((n) => !n.isRead).length
      : 0;
    return reply.status(200).send({ unreadCount });
  });

  app.post('/api/v1/notifications/mark-read', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    const input = MarkNotificationsReadInputSchema.parse(req.body || {});
    const userNotifs = notificationsByRecipientId.get(profile.id) || [];
    const targetIds = resolveMarkReadTargets(input);

    // Mark copies, never the stored objects, and persist them: the read state
    // survives a restart, and only the recipient's own notifications move.
    const copies = userNotifs.map((n) => ({ ...n }));
    markNotificationsAsRead(copies, targetIds);
    const ops: CoreOp[] = copies
      .map((copy, index) => ({ copy, base: userNotifs[index] }))
      .filter(({ copy, base }) => copy.isRead && !base.isRead)
      .map(({ copy, base }) => ({ kind: 'notification' as const, value: copy, base }));
    if (ops.length > 0) await persist(...ops);

    const remainingUnread = (notificationsByRecipientId.get(profile.id) || []).filter(
      (n) => !n.isRead
    ).length;
    return reply.status(200).send({
      markedCount: ops.length,
      unreadCount: remainingUnread,
    });
  });

  app.get('/api/v1/notifications/preferences', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Profile not found.');
    }

    let prefs = notificationPreferencesByUserId.get(profile.id);
    if (!prefs) {
      prefs = createDefaultNotificationPreferences(profile.id);
      notificationPreferencesByUserId.set(profile.id, prefs);
    }

    return reply.status(200).send({ preferences: prefs });
  });

  app.patch(
    '/api/v1/notifications/preferences',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const profile = profilesByUserId.get(session.userId);
      if (!profile) {
        throw new DomainError('NOT_FOUND', 'Profile not found.');
      }

      const input = UpdateNotificationPreferencesInputSchema.parse(req.body);
      const prefs = {
        ...(notificationPreferencesByUserId.get(profile.id) ??
          createDefaultNotificationPreferences(profile.id)),
      };

      if (input.allowMessages !== undefined) prefs.allowMessages = input.allowMessages;
      if (input.allowMentions !== undefined) prefs.allowMentions = input.allowMentions;
      if (input.allowApplications !== undefined) prefs.allowApplications = input.allowApplications;
      if (input.allowCourseUpdates !== undefined)
        prefs.allowCourseUpdates = input.allowCourseUpdates;
      if (input.emailDigestFrequency !== undefined)
        prefs.emailDigestFrequency = input.emailDigestFrequency;
      prefs.updatedAt = new Date().toISOString();
      await persist({ kind: 'notificationPreferences', value: prefs });

      return reply.status(200).send({
        message: 'Preferences updated successfully',
        preferences: prefs,
      });
    }
  );
}

/**
 * Warm introduction paths (F-121, S-11, BR-209..BR-216). Moved out of server.ts
 * with no behaviour change (ADR-022, plan TS-12). The preference and request
 * Maps and the accepted-connection graph helper stay owned by server.ts
 * (referrals, peer credibility and account erasure use them); these routes
 * update the Maps in place, as before.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  createWarmIntroRequest,
  discoverWarmIntroPaths,
  DomainError,
  respondToIntroRequest,
  type AuthPayload,
  type NotificationType,
  type WarmIntroPreferences,
  type WarmIntroRequest,
} from '@talentsphere/domain';
import {
  CreateWarmIntroRequestInputSchema,
  RespondWarmIntroRequestInputSchema,
  UpdateWarmIntroPreferencesInputSchema,
} from '@talentsphere/contracts';

export interface WarmIntroRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  sendNotification(params: {
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    referenceType?: string;
    referenceId?: string;
  }): Promise<unknown>;
  getAcceptedConnectionsGraph(): Map<string, Set<string>>;
  auditLogs: { push(entry: unknown): void };
  warmIntroPrefsByUserId: Map<string, WarmIntroPreferences>;
  warmIntroRequestsById: Map<string, WarmIntroRequest>;
  warmIntroRequestsByRequesterId: Map<string, WarmIntroRequest[]>;
  warmIntroRequestsByIntroducerId: Map<string, WarmIntroRequest[]>;
  warmIntroRequestsByTargetId: Map<string, WarmIntroRequest[]>;
  profilesById: ReadonlyMap<string, { userId: string }>;
  profilesByUserId: ReadonlyMap<string, { id: string; fullName?: string }>;
}

export function registerWarmIntroRoutes(app: FastifyInstance, deps: WarmIntroRouteDeps): void {
  const {
    extractUser,
    sendNotification,
    getAcceptedConnectionsGraph,
    auditLogs,
    warmIntroPrefsByUserId,
    warmIntroRequestsById,
    warmIntroRequestsByRequesterId,
    warmIntroRequestsByIntroducerId,
    warmIntroRequestsByTargetId,
    profilesById,
    profilesByUserId,
  } = deps;

  app.post(
    '/api/v1/networking/warm-intros/preferences',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const input = UpdateWarmIntroPreferencesInputSchema.parse(req.body || {});

      const current = warmIntroPrefsByUserId.get(session.userId) || {
        userId: session.userId,
        optOutIntroducer: false,
        blockAllIncomingIntros: false,
        blockedUserIds: [],
        updatedAt: new Date().toISOString(),
      };

      const updated: WarmIntroPreferences = {
        ...current,
        optOutIntroducer: input.optOutIntroducer ?? current.optOutIntroducer,
        blockAllIncomingIntros: input.blockAllIncomingIntros ?? current.blockAllIncomingIntros,
        blockedUserIds: input.blockedUserIds ?? current.blockedUserIds,
        updatedAt: new Date().toISOString(),
      };

      warmIntroPrefsByUserId.set(session.userId, updated);
      return reply.status(200).send({ preferences: updated });
    }
  );

  app.get(
    '/api/v1/networking/warm-intros/preferences',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const preferences = warmIntroPrefsByUserId.get(session.userId) || {
        userId: session.userId,
        optOutIntroducer: false,
        blockAllIncomingIntros: false,
        blockedUserIds: [],
        updatedAt: new Date().toISOString(),
      };
      return reply.status(200).send({ preferences });
    }
  );

  app.get(
    '/api/v1/networking/warm-intros/paths',
    async (req: FastifyRequest<{ Querystring: { targetUserId: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      let { targetUserId } = req.query;
      if (!targetUserId) {
        throw new DomainError('VALIDATION_FAILED', 'targetUserId query parameter is required.');
      }

      const targetProfile = profilesById.get(targetUserId);
      if (targetProfile) {
        targetUserId = targetProfile.userId;
      }

      const graph = getAcceptedConnectionsGraph();
      const paths = discoverWarmIntroPaths(
        session.userId,
        targetUserId,
        graph,
        warmIntroPrefsByUserId
      );

      return reply.status(200).send({ paths });
    }
  );

  app.post(
    '/api/v1/networking/warm-intros/requests',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const input = CreateWarmIntroRequestInputSchema.parse(req.body || {});

      let targetUserId = input.targetUserId;
      const targetProfile = profilesById.get(targetUserId);
      if (targetProfile) {
        targetUserId = targetProfile.userId;
      }

      let introducerUserId = input.introducerUserId;
      const introducerProfile = profilesById.get(introducerUserId);
      if (introducerProfile) {
        introducerUserId = introducerProfile.userId;
      }

      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const requesterRequests = warmIntroRequestsByRequesterId.get(session.userId) || [];
      const weeklyCount = requesterRequests.filter(
        (r) => new Date(r.createdAt).getTime() > oneWeekAgo
      ).length;

      const introducerPrefs = warmIntroPrefsByUserId.get(introducerUserId);
      const targetPrefs = warmIntroPrefsByUserId.get(targetUserId);

      const introRequest = createWarmIntroRequest(
        {
          requesterUserId: session.userId,
          targetUserId,
          introducerUserId,
          purpose: input.purpose,
          note: input.note,
        },
        weeklyCount,
        introducerPrefs,
        targetPrefs
      );

      warmIntroRequestsById.set(introRequest.id, introRequest);

      requesterRequests.unshift(introRequest);
      warmIntroRequestsByRequesterId.set(session.userId, requesterRequests);

      const introList = warmIntroRequestsByIntroducerId.get(introducerUserId) || [];
      introList.unshift(introRequest);
      warmIntroRequestsByIntroducerId.set(introducerUserId, introList);

      const targetList = warmIntroRequestsByTargetId.get(targetUserId) || [];
      targetList.unshift(introRequest);
      warmIntroRequestsByTargetId.set(targetUserId, targetList);

      const senderProfile = profilesByUserId.get(session.userId);
      const senderName = senderProfile?.fullName || 'A professional';
      const notifRecipientProfile = profilesByUserId.get(introducerUserId);
      const notifRecipientId = notifRecipientProfile?.id || introducerUserId;

      await sendNotification({
        recipientId: notifRecipientId,
        type: 'warm_intro_requested',
        title: 'New Introduction Request',
        body: `${senderName} requested an introduction.`,
        referenceType: 'warm_intro',
        referenceId: introRequest.id,
      });

      auditLogs.push({
        event: 'warm_intro.requested',
        actorId: session.userId,
        targetId: introRequest.id,
        metadata: { targetUserId, introducerUserId },
        timestamp: new Date().toISOString(),
      });

      return reply.status(201).send({ request: introRequest });
    }
  );

  app.get(
    '/api/v1/networking/warm-intros/requests/incoming',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const requests = warmIntroRequestsByIntroducerId.get(session.userId) || [];
      return reply.status(200).send({ requests });
    }
  );

  app.get(
    '/api/v1/networking/warm-intros/requests/outgoing',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const requests = warmIntroRequestsByRequesterId.get(session.userId) || [];
      return reply.status(200).send({ requests });
    }
  );

  app.get(
    '/api/v1/networking/warm-intros/requests/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const request = warmIntroRequestsById.get(id);
      if (!request) {
        throw new DomainError('NOT_FOUND', `Warm intro request with ID ${id} not found.`);
      }

      const isRequester = request.requesterUserId === session.userId;
      const isIntroducer = request.introducerUserId === session.userId;
      const isTargetApproved =
        request.targetUserId === session.userId &&
        (request.status === 'approved' || request.status === 'completed');
      const isAdmin = session.roles.includes('platform_admin');

      if (!isRequester && !isIntroducer && !isTargetApproved && !isAdmin) {
        throw new DomainError('FORBIDDEN', 'Access denied to this introduction request.');
      }

      return reply.status(200).send({ request });
    }
  );

  app.post(
    '/api/v1/networking/warm-intros/requests/:id/respond',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const input = RespondWarmIntroRequestInputSchema.parse(req.body || {});

      const request = warmIntroRequestsById.get(id);
      if (!request) {
        throw new DomainError('NOT_FOUND', `Warm intro request with ID ${id} not found.`);
      }

      const updated = respondToIntroRequest(request, session.userId, input.decision, input.reason);
      warmIntroRequestsById.set(updated.id, updated);

      // Update in user arrays
      const reqList = warmIntroRequestsByRequesterId.get(updated.requesterUserId) || [];
      const rIdx = reqList.findIndex((r) => r.id === updated.id);
      if (rIdx !== -1) reqList[rIdx] = updated;

      const introList = warmIntroRequestsByIntroducerId.get(updated.introducerUserId) || [];
      const iIdx = introList.findIndex((r) => r.id === updated.id);
      if (iIdx !== -1) introList[iIdx] = updated;

      const targetList = warmIntroRequestsByTargetId.get(updated.targetUserId) || [];
      const tIdx = targetList.findIndex((r) => r.id === updated.id);
      if (tIdx !== -1) targetList[tIdx] = updated;

      const notifRequesterProfile = profilesByUserId.get(updated.requesterUserId);
      const notifRequesterId = notifRequesterProfile?.id || updated.requesterUserId;

      if (updated.status === 'approved') {
        await sendNotification({
          recipientId: notifRequesterId,
          type: 'warm_intro_approved',
          title: 'Introduction Approved',
          body: `Your introduction request was approved! A three-way thread has been created.`,
          referenceType: 'warm_intro',
          referenceId: updated.id,
        });

        const notifTargetProfile = profilesByUserId.get(updated.targetUserId);
        const notifTargetId = notifTargetProfile?.id || updated.targetUserId;
        await sendNotification({
          recipientId: notifTargetId,
          type: 'warm_intro_delivered',
          title: 'New Warm Introduction',
          body: `You have received a warm introduction!`,
          referenceType: 'warm_intro',
          referenceId: updated.id,
        });
      } else {
        await sendNotification({
          recipientId: notifRequesterId,
          type: 'warm_intro_declined',
          title: 'Introduction Declined',
          body: `Your introduction request was declined by the introducer.`,
          referenceType: 'warm_intro',
          referenceId: updated.id,
        });
      }

      auditLogs.push({
        event: 'warm_intro.responded',
        actorId: session.userId,
        targetId: updated.id,
        metadata: { status: updated.status, threadId: updated.threadId },
        timestamp: new Date().toISOString(),
      });

      return reply.status(200).send({ request: updated });
    }
  );
}

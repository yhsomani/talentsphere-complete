/**
 * Referral requests (F-142, S-11, BR-233..BR-240). Moved out of server.ts with
 * no behaviour change (ADR-022, plan TS-12). The referral Maps stay owned by
 * server.ts (account erasure clears them); these routes update them in place,
 * and the application tag still goes through persist(), as before.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  createReferralRequest,
  DomainError,
  respondToReferralRequest,
  type AuthPayload,
  type Job,
  type JobApplication,
  type NotificationType,
  type OrgAction,
  type ReferralOutcome,
  type ReferralRequest,
  type WarmIntroPreferences,
} from '@talentsphere/domain';
import {
  CreateReferralRequestInputSchema,
  RespondReferralRequestInputSchema,
} from '@talentsphere/contracts';
import type { CoreOp, StoredOrgMembership } from './storage/index.js';

export interface ReferralRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  persist(...ops: CoreOp[]): Promise<void>;
  sendNotification(params: {
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    referenceType?: string;
    referenceId?: string;
  }): Promise<unknown>;
  assertOwnedResume(resumeId: string | undefined, userId: string): void;
  memberMay(userId: string, orgId: string, action: OrgAction): boolean;
  auditLogs: { push(entry: unknown): void };
  referralRequestsById: Map<string, ReferralRequest>;
  referralRequestsByCandidateId: Map<string, ReferralRequest[]>;
  referralRequestsByReferrerId: Map<string, ReferralRequest[]>;
  referralOutcomesById: Map<string, ReferralOutcome>;
  referralOutcomesByOrgId: Map<string, ReferralOutcome[]>;
  jobsById: ReadonlyMap<string, Job>;
  profilesById: ReadonlyMap<string, { userId: string }>;
  profilesByUserId: ReadonlyMap<string, { id: string; fullName?: string }>;
  orgMembershipsByUserId: ReadonlyMap<string, StoredOrgMembership[]>;
  warmIntroPrefsByUserId: ReadonlyMap<string, WarmIntroPreferences>;
  applicationsByCandidateId: ReadonlyMap<string, JobApplication[]>;
}

export function registerReferralRoutes(app: FastifyInstance, deps: ReferralRouteDeps): void {
  const {
    extractUser,
    persist,
    sendNotification,
    assertOwnedResume,
    memberMay,
    auditLogs,
    referralRequestsById,
    referralRequestsByCandidateId,
    referralRequestsByReferrerId,
    referralOutcomesById,
    referralOutcomesByOrgId,
    jobsById,
    profilesById,
    profilesByUserId,
    orgMembershipsByUserId,
    warmIntroPrefsByUserId,
    applicationsByCandidateId,
  } = deps;

  app.post('/api/v1/referrals/requests', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateReferralRequestInputSchema.parse(req.body || {});

    const job = jobsById.get(input.jobId);
    if (!job) {
      throw new DomainError('NOT_FOUND', `Job with ID ${input.jobId} not found.`);
    }

    assertOwnedResume(input.resumeId, session.userId);

    let referrerUserId = input.referrerId;
    const referrerProfile = profilesById.get(referrerUserId);
    if (referrerProfile) {
      referrerUserId = referrerProfile.userId;
    }

    const userMemberships = orgMembershipsByUserId.get(referrerUserId) || [];
    const isReferrerEmployedAtOrg = userMemberships.some((m) => m.orgId === job.orgId);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const candRequests = referralRequestsByCandidateId.get(session.userId) || [];
    const recentRequests30DaysCount = candRequests.filter(
      (r) => new Date(r.createdAt).getTime() > thirtyDaysAgo
    ).length;

    // Check blocked status (BR-238)
    const referrerPrefs = warmIntroPrefsByUserId.get(referrerUserId);
    const candidatePrefs = warmIntroPrefsByUserId.get(session.userId);
    const isBlocked =
      referrerPrefs?.blockedUserIds.includes(session.userId) ||
      candidatePrefs?.blockedUserIds.includes(referrerUserId) ||
      false;

    const request = createReferralRequest(
      {
        candidateId: session.userId,
        referrerId: referrerUserId,
        jobId: job.id,
        orgId: job.orgId,
        pitch: input.pitch,
        resumeId: input.resumeId,
      },
      recentRequests30DaysCount,
      isReferrerEmployedAtOrg,
      isBlocked
    );

    referralRequestsById.set(request.id, request);

    candRequests.unshift(request);
    referralRequestsByCandidateId.set(session.userId, candRequests);

    const refRequests = referralRequestsByReferrerId.get(referrerUserId) || [];
    refRequests.unshift(request);
    referralRequestsByReferrerId.set(referrerUserId, refRequests);

    const candidateProfile = profilesByUserId.get(session.userId);
    const candidateName = candidateProfile?.fullName || 'A candidate';
    const notifRecipientProfile = profilesByUserId.get(referrerUserId);
    const notifRecipientId = notifRecipientProfile?.id || referrerUserId;

    await sendNotification({
      recipientId: notifRecipientId,
      type: 'referral_requested',
      title: 'New Referral Request',
      body: `${candidateName} requested a referral for ${job.title}.`,
      referenceType: 'referral',
      referenceId: request.id,
    });

    auditLogs.push({
      event: 'referral.requested',
      actorId: session.userId,
      targetId: request.id,
      metadata: { jobId: job.id, orgId: job.orgId, referrerId: referrerUserId },
      timestamp: new Date().toISOString(),
    });

    return reply.status(201).send({ request });
  });

  app.get(
    '/api/v1/referrals/requests/incoming',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const requests = referralRequestsByReferrerId.get(session.userId) || [];
      return reply.status(200).send({ requests });
    }
  );

  app.get(
    '/api/v1/referrals/requests/outgoing',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const requests = referralRequestsByCandidateId.get(session.userId) || [];
      return reply.status(200).send({ requests });
    }
  );

  app.get(
    '/api/v1/referrals/requests/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const request = referralRequestsById.get(id);
      if (!request) {
        throw new DomainError('NOT_FOUND', `Referral request with ID ${id} not found.`);
      }

      const isCandidate = request.candidateId === session.userId;
      const isReferrer = request.referrerId === session.userId;
      const isOrgMember = memberMay(session.userId, request.orgId, 'review_candidates');
      const isAdmin = session.roles.includes('platform_admin');

      if (!isCandidate && !isReferrer && !isOrgMember && !isAdmin) {
        throw new DomainError('FORBIDDEN', 'Access denied to this referral request.');
      }

      return reply.status(200).send({ request });
    }
  );

  app.post(
    '/api/v1/referrals/requests/:id/respond',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const input = RespondReferralRequestInputSchema.parse(req.body || {});

      const request = referralRequestsById.get(id);
      if (!request) {
        throw new DomainError('NOT_FOUND', `Referral request with ID ${id} not found.`);
      }

      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
      const quarterlyCount = Array.from(referralOutcomesById.values()).filter(
        (o) => o.referrerId === session.userId && new Date(o.createdAt).getTime() > ninetyDaysAgo
      ).length;

      const result = respondToReferralRequest(
        request,
        session.userId,
        input.action,
        quarterlyCount,
        input.declineReason,
        input.forwardedToUserId
      );

      referralRequestsById.set(result.request.id, result.request);

      // Update in user arrays
      const candList = referralRequestsByCandidateId.get(result.request.candidateId) || [];
      const cIdx = candList.findIndex((r) => r.id === result.request.id);
      if (cIdx !== -1) candList[cIdx] = result.request;

      const refList = referralRequestsByReferrerId.get(session.userId) || [];
      const rIdx = refList.findIndex((r) => r.id === result.request.id);
      if (rIdx !== -1) refList[rIdx] = result.request;

      const candidateProfile = profilesByUserId.get(result.request.candidateId);
      const notifCandidateId = candidateProfile?.id || result.request.candidateId;

      if (result.outcome) {
        referralOutcomesById.set(result.outcome.id, result.outcome);
        const orgOutcomes = referralOutcomesByOrgId.get(result.outcome.orgId) || [];
        orgOutcomes.push(result.outcome);
        referralOutcomesByOrgId.set(result.outcome.orgId, orgOutcomes);

        // Tag existing active application if present (BR-235)
        const candApps = applicationsByCandidateId.get(candidateProfile?.id || '') || [];
        const matchingApp = candApps.find(
          (a) =>
            a.jobId === result.outcome!.jobId && a.status !== 'withdrawn' && a.status !== 'rejected'
        );
        if (matchingApp) {
          await persist({
            kind: 'application',
            base: matchingApp,
            value: {
              ...matchingApp,
              isReferred: true,
              referralId: result.outcome.id,
              updatedAt: new Date().toISOString(),
            },
          });
        }

        await sendNotification({
          recipientId: notifCandidateId,
          type: 'referral_approved',
          title: 'Referral Submitted',
          body: 'Your referral request was approved and submitted to the hiring team!',
          referenceType: 'referral',
          referenceId: result.request.id,
        });
      } else if (input.action === 'forward' && input.forwardedToUserId) {
        const forwardedList = referralRequestsByReferrerId.get(input.forwardedToUserId) || [];
        forwardedList.unshift(result.request);
        referralRequestsByReferrerId.set(input.forwardedToUserId, forwardedList);

        const fwdProfile = profilesByUserId.get(input.forwardedToUserId);
        const notifFwdId = fwdProfile?.id || input.forwardedToUserId;
        await sendNotification({
          recipientId: notifFwdId,
          type: 'referral_forwarded',
          title: 'Referral Request Forwarded',
          body: 'A colleague forwarded a referral request to you.',
          referenceType: 'referral',
          referenceId: result.request.id,
        });
      } else {
        await sendNotification({
          recipientId: notifCandidateId,
          type: 'referral_declined',
          title: 'Referral Request Declined',
          body: 'Your referral request was declined by the referrer.',
          referenceType: 'referral',
          referenceId: result.request.id,
        });
      }

      auditLogs.push({
        event: 'referral.responded',
        actorId: session.userId,
        targetId: result.request.id,
        metadata: { action: input.action, outcomeId: result.outcome?.id },
        timestamp: new Date().toISOString(),
      });

      return reply.status(200).send({
        request: result.request,
        outcome: result.outcome,
      });
    }
  );

  app.get(
    '/api/v1/referrals/outcomes',
    async (req: FastifyRequest<{ Querystring: { orgId?: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { orgId } = req.query;

      const isMemberOfQueryOrg = orgId
        ? memberMay(session.userId, orgId, 'review_candidates')
        : false;
      const isAdmin = session.roles.includes('platform_admin');

      let list = Array.from(referralOutcomesById.values());
      if (orgId) {
        if (!isMemberOfQueryOrg && !isAdmin) {
          throw new DomainError('FORBIDDEN', 'Access denied to organization referral outcomes.');
        }
        list = list.filter((o) => o.orgId === orgId);
      } else if (!isAdmin) {
        // Non-admins see outcomes where they are candidate or referrer
        list = list.filter(
          (o) => o.candidateId === session.userId || o.referrerId === session.userId
        );
      }

      return reply.status(200).send({ outcomes: list });
    }
  );
}

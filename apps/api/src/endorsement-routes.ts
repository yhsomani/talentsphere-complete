/**
 * Peer skill endorsements (F-150, F-110, F-144). Moved out of server.ts with no
 * behaviour change (ADR-022, plan TS-12). The endorsement Maps stay owned by
 * server.ts (behavioral talent discovery, candidate classification and account
 * erasure read them); these routes update them in place, as before.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  aggregateSkillEndorsements,
  createSkillEndorsement,
  DomainError,
  revokeSkillEndorsement,
  type AuthPayload,
  type Evidence,
  type ReputationScore,
  type Skill,
  type SkillEndorsement,
} from '@talentsphere/domain';
import { CreateSkillEndorsementInputSchema } from '@talentsphere/contracts';

export interface EndorsementRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  dispatchJob(event: {
    type: string;
    payload: Record<string, unknown>;
    enqueuedAt?: string;
  }): Promise<void>;
  getAcceptedConnectionsGraph(): Map<string, Set<string>>;
  skillEndorsementsById: Map<string, SkillEndorsement>;
  skillEndorsementsByRecipientId: Map<string, SkillEndorsement[]>;
  skillEndorsementsByEndorserId: Map<string, SkillEndorsement[]>;
  skillsById: ReadonlyMap<string, Skill>;
  usersById: ReadonlyMap<string, unknown>;
  reputationScoresByUserContextDomain: ReadonlyMap<string, ReputationScore>;
  evidenceBySubjectId: ReadonlyMap<string, Evidence[]>;
  evidenceSkills: ReadonlyMap<string, Set<string>>;
}

export function registerEndorsementRoutes(app: FastifyInstance, deps: EndorsementRouteDeps): void {
  const {
    extractUser,
    dispatchJob,
    getAcceptedConnectionsGraph,
    skillEndorsementsById,
    skillEndorsementsByRecipientId,
    skillEndorsementsByEndorserId,
    skillsById,
    usersById,
    reputationScoresByUserContextDomain,
    evidenceBySubjectId,
    evidenceSkills,
  } = deps;

  function computeGraphDistance(sourceId: string, targetId: string): number {
    if (sourceId === targetId) return 1;
    const graph = getAcceptedConnectionsGraph();
    const visited = new Set<string>([sourceId]);
    const queue: [string, number][] = [[sourceId, 0]];

    while (queue.length > 0) {
      const [current, dist] = queue.shift()!;
      if (dist >= 4) break;
      const neighbors = graph.get(current) || new Set();
      for (const next of neighbors) {
        if (next === targetId) return dist + 1;
        if (!visited.has(next)) {
          visited.add(next);
          queue.push([next, dist + 1]);
        }
      }
    }
    return 5;
  }

  // 1. Create a Skill Endorsement
  app.post('/api/v1/skills/endorsements', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateSkillEndorsementInputSchema.parse(req.body);

    const skill = skillsById.get(input.skillId);
    if (!skill) {
      throw new DomainError('NOT_FOUND', `Skill with ID ${input.skillId} not found.`);
    }
    if (!usersById.has(input.recipientId)) {
      throw new DomainError('NOT_FOUND', 'The person you are endorsing was not found.');
    }

    // Check rate limit: max 5 endorsements given per week
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const endorserHistory = skillEndorsementsByEndorserId.get(session.userId) || [];
    const recentWeeklyCount = endorserHistory.filter(
      (e) => new Date(e.createdAt).getTime() > oneWeekAgo
    ).length;

    // Check duplicate endorsement
    const recipientList = skillEndorsementsByRecipientId.get(input.recipientId) || [];
    const existing = recipientList.find(
      (e) => e.endorserId === session.userId && e.skillId === input.skillId && e.status === 'active'
    );
    if (existing) {
      throw new DomainError('CONFLICT', 'You have already endorsed this skill for this user.');
    }

    // Network distance
    const networkDistance = computeGraphDistance(session.userId, input.recipientId);

    // Endorser reputation score
    const endorserScoreObj =
      reputationScoresByUserContextDomain.get(`${session.userId}:peer:general`) ||
      reputationScoresByUserContextDomain.get(`${session.userId}:candidate:general`);
    const endorserReputationScore = endorserScoreObj?.score ?? 50.0;

    // Check domain specialization
    const endorserEvidence = evidenceBySubjectId.get(session.userId) || [];
    const hasSpecialization = endorserEvidence.some(
      (ev) => ev.status === 'verified' && (evidenceSkills.get(ev.id)?.has(input.skillId) ?? false)
    );

    // Check reciprocal endorsement in past 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recipientGivenEndorsements = skillEndorsementsByEndorserId.get(input.recipientId) || [];
    const isReciprocal = recipientGivenEndorsements.some(
      (e) =>
        e.recipientId === session.userId &&
        e.status === 'active' &&
        new Date(e.createdAt).getTime() > thirtyDaysAgo
    );

    const endorsement = createSkillEndorsement({
      recipientId: input.recipientId,
      endorserId: session.userId,
      skillId: input.skillId,
      notes: input.notes,
      networkDistance,
      endorserReputationScore,
      hasSpecializationInSkill: hasSpecialization,
      isReciprocalEndorsement: isReciprocal,
      recentEndorsementsCountThisWeek: recentWeeklyCount,
    });

    skillEndorsementsById.set(endorsement.id, endorsement);

    recipientList.unshift(endorsement);
    skillEndorsementsByRecipientId.set(input.recipientId, recipientList);

    endorserHistory.unshift(endorsement);
    skillEndorsementsByEndorserId.set(session.userId, endorserHistory);

    await dispatchJob({
      type: 'skill.endorsed',
      payload: {
        endorsementId: endorsement.id,
        recipientId: endorsement.recipientId,
        skillId: endorsement.skillId,
        weight: endorsement.weight.finalWeight,
      },
      enqueuedAt: endorsement.createdAt,
    });

    return reply.status(201).send({
      message: 'Skill endorsed successfully with credibility weight.',
      endorsement,
    });
  });

  // 2. Query Skill Endorsements for a Candidate (with aggregated strength)
  app.get(
    '/api/v1/skills/endorsements/recipients/:recipientId',
    async (
      req: FastifyRequest<{ Params: { recipientId: string }; Querystring: { skillId?: string } }>,
      reply: FastifyReply
    ) => {
      const { recipientId } = req.params;
      const { skillId } = req.query;

      let list = skillEndorsementsByRecipientId.get(recipientId) || [];
      if (skillId) {
        list = list.filter((e) => e.skillId === skillId);
      }

      const activeList = list.filter((e) => e.status === 'active');
      const aggregate = aggregateSkillEndorsements(activeList);

      return reply.status(200).send({
        recipientId,
        skillId,
        aggregate,
        endorsements: activeList,
      });
    }
  );

  // 3. Revoke Endorsement within 30-day window
  app.delete(
    '/api/v1/skills/endorsements/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const endorsement = skillEndorsementsById.get(id);
      if (!endorsement) {
        throw new DomainError('NOT_FOUND', `Endorsement with ID ${id} not found.`);
      }

      const revoked = revokeSkillEndorsement(endorsement, session.userId);
      skillEndorsementsById.set(revoked.id, revoked);

      const rList = skillEndorsementsByRecipientId.get(revoked.recipientId) || [];
      const rIdx = rList.findIndex((e) => e.id === revoked.id);
      if (rIdx >= 0) rList[rIdx] = revoked;

      const eList = skillEndorsementsByEndorserId.get(revoked.endorserId) || [];
      const eIdx = eList.findIndex((e) => e.id === revoked.id);
      if (eIdx >= 0) eList[eIdx] = revoked;

      return reply.status(200).send({
        message: 'Endorsement revoked successfully.',
        endorsement: revoked,
      });
    }
  );

  // 4. Query Endorsements Given by Authenticated User
  app.get(
    '/api/v1/skills/endorsements/my/given',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const history = skillEndorsementsByEndorserId.get(session.userId) || [];
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklyGiven = history.filter(
        (e) => new Date(e.createdAt).getTime() > oneWeekAgo
      ).length;

      return reply.status(200).send({
        endorsements: history,
        weeklyQuotaRemaining: Math.max(0, 5 - weeklyGiven),
        totalGiven: history.length,
      });
    }
  );
}

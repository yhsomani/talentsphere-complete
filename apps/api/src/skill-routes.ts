/**
 * Readers of the skill-signal ledger (plan TS-07, TS-13): the skill profile,
 * the explained job match and the career goal. Moved out of server.ts with
 * no behaviour change (ADR-022, plan TS-12); the shared read model is passed
 * in, so these routes see exactly what they saw before.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  DomainError,
  explainSkillMatch,
  normalizeGoalTitle,
  planCareerGoal,
  type AuthPayload,
  type Evidence,
  type Job,
  type OrgAction,
  type Skill,
  type SkillProfileEntry,
} from '@talentsphere/domain';
import { SetCareerGoalInputSchema } from '@talentsphere/contracts';
import type { Storage } from './storage/index.js';

export interface SkillRouteDeps {
  storage: Pick<Storage, 'careerGoals'>;
  extractUser(req: FastifyRequest): AuthPayload;
  canInOrg(session: AuthPayload, orgId: string, action: OrgAction): boolean;
  jobsById: ReadonlyMap<string, Job>;
  profilesByUserId: ReadonlyMap<string, { id: string }>;
  skillsById: ReadonlyMap<string, Skill>;
  evidenceById: ReadonlyMap<string, Evidence>;
  skillProfileOf(subjectId: string): SkillProfileEntry[];
}

export function registerSkillRoutes(app: FastifyInstance, deps: SkillRouteDeps): void {
  const {
    storage,
    extractUser,
    canInOrg,
    jobsById,
    profilesByUserId,
    skillsById,
    evidenceById,
    skillProfileOf,
  } = deps;

  // Skill profile (TS-07): derived from the skill-signal ledger, strongest
  // skills first. Each entry names the evidence it rests on, so the rung is
  // explained rather than asserted.
  app.get('/api/v1/skills/profile/me', async (req: FastifyRequest) => {
    const session = extractUser(req);
    const profile = profilesByUserId.get(session.userId);
    const entries = profile ? skillProfileOf(profile.id) : [];
    return {
      skills: entries.map((entry) => {
        const skill = skillsById.get(entry.skillId);
        return {
          ...entry,
          name: skill?.name ?? null,
          slug: skill?.slug ?? null,
          sources: entry.sources.map((source) => ({
            ...source,
            title:
              source.sourceModule === 'evidence'
                ? (evidenceById.get(source.sourceRef)?.title ?? null)
                : null,
          })),
        };
      }),
    };
  });

  // TS-13 career goal (ADR-034): the role a person aims for, the skills live
  // postings for that role require, how the person's skill profile meets
  // each, and the one next step per skill. Private to its owner; the plan is
  // computed on read, so a step is done as soon as its signal lands.
  const goalView = async (userId: string) => {
    const goal = await storage.careerGoals.get(userId);
    if (!goal) return { goal: null, plan: null };
    const profile = profilesByUserId.get(userId);
    const plan = planCareerGoal(
      goal.title,
      [...jobsById.values()],
      profile ? skillProfileOf(profile.id) : []
    );
    return {
      goal: { title: goal.title, createdAt: goal.createdAt, updatedAt: goal.updatedAt },
      plan: {
        ...plan,
        skills: plan.skills.map((entry) => ({
          ...entry,
          name: skillsById.get(entry.skillId)?.name ?? null,
          sources: entry.sources.map((source) => ({
            ...source,
            title:
              source.sourceModule === 'evidence'
                ? (evidenceById.get(source.sourceRef)?.title ?? null)
                : null,
          })),
        })),
      },
    };
  };

  app.get('/api/v1/goals/mine', async (req: FastifyRequest) => {
    const session = extractUser(req);
    return goalView(session.userId);
  });

  app.put('/api/v1/goals/mine', async (req: FastifyRequest) => {
    const session = extractUser(req);
    const input = SetCareerGoalInputSchema.parse(req.body);
    await storage.careerGoals.set(
      session.userId,
      normalizeGoalTitle(input.title),
      new Date().toISOString()
    );
    return goalView(session.userId);
  });

  app.delete('/api/v1/goals/mine', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    await storage.careerGoals.clear(session.userId);
    return reply.status(204).send();
  });

  // TS-13 explained match: how the signed-in person's skill profile meets this
  // posting's required skills, skill by skill, naming the records each rests
  // on. No score. Visible on the same terms as the posting itself.
  app.get(
    '/api/v1/jobs/:id/match',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const job = jobsById.get(id);
      if (!job || (job.status !== 'published' && !canInOrg(session, job.orgId, 'view_jobs'))) {
        throw new DomainError('NOT_FOUND', `Job with ID ${id} not found.`);
      }
      const profile = profilesByUserId.get(session.userId);
      const match = explainSkillMatch(
        job.requiredSkillIds,
        profile ? skillProfileOf(profile.id) : []
      );
      return reply.status(200).send({
        ...match,
        skills: match.skills.map((entry) => ({
          ...entry,
          name: skillsById.get(entry.skillId)?.name ?? null,
          sources: entry.sources.map((source) => ({
            ...source,
            title:
              source.sourceModule === 'evidence'
                ? (evidenceById.get(source.sourceRef)?.title ?? null)
                : null,
          })),
        })),
      });
    }
  );
}

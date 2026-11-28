/**
 * Coding challenges and assessment sessions (F-08, BR-25, SEC-11). Moved out
 * of server.ts with no behaviour change (ADR-022, plan TS-12). The challenge,
 * session and XP Maps stay owned by server.ts (boot load, the AI assistant
 * guard and the LMS XP award read them); these routes update them after each
 * write, as before.
 */
import crypto from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  calculateCappedXp,
  createChallenge,
  DomainError,
  evaluateChallengeSubmission,
  filterChallengeForCandidate,
  startAssessmentSession,
  type AssessmentSession,
  type AuthPayload,
  type Challenge,
  type Evidence,
  type Skill,
  type XpTransaction,
} from '@talentsphere/domain';
import {
  CreateChallengeInputSchema,
  SubmitChallengeSolutionInputSchema,
} from '@talentsphere/contracts';
import type { CoreOp, Storage } from './storage/index.js';

export interface ChallengeRouteDeps {
  storage: Pick<Storage, 'challenges'>;
  extractUser(req: FastifyRequest): AuthPayload;
  persist(...ops: CoreOp[]): Promise<void>;
  dispatchJob(event: {
    type: string;
    payload: Record<string, unknown>;
    enqueuedAt?: string;
  }): Promise<void>;
  challengesById: Map<string, Challenge>;
  challengesBySlug: Map<string, Challenge>;
  assessmentSessionsById: Map<string, AssessmentSession>;
  assessmentSessionsByCandidateId: Map<string, AssessmentSession[]>;
  xpTransactionsByUserId: Map<string, XpTransaction[]>;
  profilesByUserId: ReadonlyMap<string, { id: string }>;
  skillsById: ReadonlyMap<string, Skill>;
  evidenceBySubjectId: ReadonlyMap<string, Evidence[]>;
}

export function registerChallengeRoutes(app: FastifyInstance, deps: ChallengeRouteDeps): void {
  const {
    storage,
    extractUser,
    persist,
    dispatchJob,
    challengesById,
    challengesBySlug,
    assessmentSessionsById,
    assessmentSessionsByCandidateId,
    xpTransactionsByUserId,
    profilesByUserId,
    skillsById,
    evidenceBySubjectId,
  } = deps;

  app.get('/api/v1/challenges', async () => {
    const list = Array.from(challengesById.values()).map((c) => filterChallengeForCandidate(c));
    return { challenges: list };
  });

  app.get(
    '/api/v1/challenges/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = req.params;
      const challenge = challengesById.get(id);
      if (!challenge) {
        throw new DomainError('NOT_FOUND', `Challenge with ID ${id} not found.`);
      }
      return reply.status(200).send({ challenge: filterChallengeForCandidate(challenge) });
    }
  );

  app.post('/api/v1/challenges', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateChallengeInputSchema.parse(req.body);

    if (challengesBySlug.has(input.slug)) {
      throw new DomainError('CONFLICT', `Challenge with slug "${input.slug}" already exists.`);
    }

    const challenge = createChallenge({
      slug: input.slug,
      title: input.title,
      description: input.description,
      difficulty: input.difficulty,
      category: input.category,
      skillIds: input.skillIds,
      testCases: input.testCases as any,
      timeLimitMs: input.timeLimitMs,
      memoryLimitMb: input.memoryLimitMb,
      policyMode: input.policyMode,
      actor: {
        userId: session.userId,
        roles: session.roles,
      },
    });

    // An unknown skill would fail the stored foreign key (BR-144).
    challenge.skillIds = Array.from(new Set(challenge.skillIds));
    for (const skillId of challenge.skillIds) {
      if (!skillsById.has(skillId)) {
        throw new DomainError('NOT_FOUND', `Canonical skill ${skillId} does not exist (BR-144).`);
      }
    }
    await storage.challenges.saveChallenge(challenge);
    challengesById.set(challenge.id, challenge);
    challengesBySlug.set(challenge.slug, challenge);

    return reply.status(201).send({ challenge });
  });

  // Assessment Session & Submission Endpoints
  app.post(
    '/api/v1/challenges/:id/start-session',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id: challengeId } = req.params;

      const profile = profilesByUserId.get(session.userId);
      if (!profile) {
        throw new DomainError(
          'NOT_FOUND',
          'Candidate profile required before starting assessment.'
        );
      }

      const challenge = challengesById.get(challengeId);
      if (!challenge) {
        throw new DomainError('NOT_FOUND', `Challenge with ID ${challengeId} not found.`);
      }

      const assessmentSession = startAssessmentSession({
        candidateProfileId: profile.id,
        challenge,
      });

      await storage.challenges.saveSession(assessmentSession);
      assessmentSessionsById.set(assessmentSession.id, assessmentSession);
      const list = assessmentSessionsByCandidateId.get(profile.id) || [];
      list.push(assessmentSession);
      assessmentSessionsByCandidateId.set(profile.id, list);

      return reply.status(201).send({ session: assessmentSession });
    }
  );

  app.post(
    '/api/v1/challenges/:id/submit',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id: challengeId } = req.params;
      const input = SubmitChallengeSolutionInputSchema.parse(req.body);

      const profile = profilesByUserId.get(session.userId);
      if (!profile) {
        throw new DomainError('NOT_FOUND', 'Candidate profile required.');
      }

      const challenge = challengesById.get(challengeId);
      if (!challenge) {
        throw new DomainError('NOT_FOUND', `Challenge with ID ${challengeId} not found.`);
      }

      let activeSession: AssessmentSession | undefined;
      if (input.sessionId) {
        // Only the caller's own session for this challenge (SEC-11).
        activeSession = assessmentSessionsById.get(input.sessionId);
        if (
          !activeSession ||
          activeSession.candidateId !== profile.id ||
          activeSession.assessmentId !== challengeId
        ) {
          throw new DomainError('NOT_FOUND', 'Assessment session not found.');
        }
      } else {
        const candidateSessions = assessmentSessionsByCandidateId.get(profile.id) || [];
        activeSession = candidateSessions.find(
          (s) => s.assessmentId === challengeId && s.status === 'in_progress'
        );
      }

      const evalResult = evaluateChallengeSubmission({
        challenge,
        candidateProfileId: profile.id,
        language: input.language,
        code: input.code,
        session: activeSession,
      });

      let awardedXp = 0;
      if (evalResult.status === 'submitted') {
        // 1. Store the submission as (unverified) evidence, once per challenge.
        // A repeat submission returns the record already stored, not a fresh id that
        // was never saved (review R2-8).
        const existingEvidence = (evidenceBySubjectId.get(profile.id) || []).find(
          (e) => e.metadata?.challengeId === challenge.id
        );
        if (existingEvidence) {
          evalResult.evidence = existingEvidence;
        }
        if (evalResult.evidence && !existingEvidence) {
          await persist({ kind: 'evidence', value: evalResult.evidence });

          await dispatchJob({
            type: 'evidence.propagate',
            payload: {
              evidenceId: evalResult.evidence.id,
              status: evalResult.evidence.status,
              level: evalResult.evidence.verificationLevel,
            },
            enqueuedAt: new Date().toISOString(),
          });
        }

        // 2. Calculate and award XP with 200 XP/day cap (BR-25)
        const userTxs = xpTransactionsByUserId.get(session.userId) || [];
        awardedXp = calculateCappedXp(evalResult.xpEarned, userTxs, 200);

        if (awardedXp > 0) {
          const tx: XpTransaction = {
            id: crypto.randomUUID(),
            userId: session.userId,
            amount: awardedXp,
            referenceType: 'challenge',
            referenceId: challenge.id,
            description: `Passed challenge "${challenge.title}"`,
            createdAt: new Date().toISOString(),
          };
          userTxs.push(tx);
          xpTransactionsByUserId.set(session.userId, userTxs);
        }
      }

      // Store the submission (the evidence cites its id) and close the session
      // if it was active, in one transaction; the Maps change after (TS-03).
      const submittedAt = new Date().toISOString();
      const closedSession =
        activeSession && activeSession.status === 'in_progress'
          ? {
              ...activeSession,
              status: 'submitted' as const,
              submittedAt,
              endTime: submittedAt,
            }
          : undefined;
      await storage.challenges.recordSubmission(
        {
          id: evalResult.submissionId,
          sessionId: activeSession?.id ?? null,
          challengeId: challenge.id,
          candidateId: profile.id,
          language: input.language,
          code: input.code,
          status: evalResult.status,
          score: evalResult.score,
          passedCases: evalResult.passedCases,
          totalCases: evalResult.totalCases,
          createdAt: submittedAt,
        },
        closedSession
      );
      if (activeSession && closedSession) Object.assign(activeSession, closedSession);

      return reply.status(200).send({
        result: evalResult,
        evidence: evalResult.evidence,
        xpEarned: awardedXp,
        // The evaluator never runs the submitted code; say so in the response.
        executed: false,
        verified: false,
        note: 'Submitted code is not executed yet, so the score is not a verified test result.',
      });
    }
  );
}

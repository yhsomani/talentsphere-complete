import { DomainError, type AssessmentSession, type Evidence } from './core.js';
import { createEvidence } from './evidence.js';
import { type Challenge, type AllowedLanguage, ALLOWED_LANGUAGES } from './challenges.js';

export interface SubmissionResult {
  submissionId: string;
  challengeId: string;
  candidateId: string;
  status: 'submitted' | 'passed' | 'failed' | 'compilation_error' | 'runtime_error' | 'timed_out';
  score: number;
  passedCases: number;
  totalCases: number;
  evidence?: Evidence;
  xpEarned: number;
  details?: string;
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  referenceType: string;
  referenceId: string;
  description: string;
  createdAt: string;
}

/**
 * Assesses whether AI assistance is currently permitted for a candidate.
 * SSOT Section D: If candidate is in an active assessment session with AI_PROHIBITED,
 * AI assistance is strictly blocked server-side across all entry points.
 */
export function assertAIAssistanceAllowed(activeSessions: AssessmentSession[]): void {
  const prohibitedSession = activeSessions.find(
    (s) => s.status === 'in_progress' && s.policyMode === 'AI_PROHIBITED'
  );

  if (prohibitedSession) {
    throw new DomainError(
      'ASSESSMENT_AI_PROHIBITED',
      'AI assistance is strictly prohibited during an active proctored assessment session (SSOT Section D).'
    );
  }
}

/**
 * Starts an assessment session for a candidate.
 */
export function startAssessmentSession(params: {
  id?: string;
  candidateProfileId: string;
  challenge: Challenge;
  timeLimitSeconds?: number;
}): AssessmentSession {
  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    candidateId: params.candidateProfileId,
    assessmentId: params.challenge.id,
    policyMode: params.challenge.policyMode,
    startTime: now,
    timeLimitSeconds: params.timeLimitSeconds || 3600,
    status: 'in_progress',
  };
}

/**
 * Evaluates a candidate solution in the assessment sandbox.
 * Runs against public and hidden test cases (BR-49, BR-51).
 * If all pass, mints verified Evidence item automatically.
 */
export function evaluateChallengeSubmission(params: {
  submissionId?: string;
  session?: AssessmentSession;
  challenge: Challenge;
  candidateProfileId: string;
  language: string;
  code: string;
}): SubmissionResult {
  if (!ALLOWED_LANGUAGES.includes(params.language as AllowedLanguage)) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `Language "${params.language}" is not permitted (BR-24).`
    );
  }

  if (!params.code || params.code.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Solution code is required.');
  }

  const submissionId = params.submissionId || crypto.randomUUID();
  const testCases = params.challenge.testCases;

  // Code is never executed here, so no pass/fail or score can be reported (D-01,
  // SEC-02). The submission is only recorded as unverified evidence, with no XP.
  // Raise this once submissions really run against the test cases.
  const evidence = createEvidence({
    subjectId: params.candidateProfileId,
    type: 'assessment',
    title: `${params.challenge.title} — solution submitted`,
    description: `Submitted a solution to "${params.challenge.title}". Solutions are not executed yet, so it has not been verified.`,
    source: 'talentsphere_challenges_arena',
    provenance: `challenge_submission:${submissionId}`,
    recencyDate: new Date().toISOString().split('T')[0],
    metadata: {
      challengeId: params.challenge.id,
      challengeSlug: params.challenge.slug,
      language: params.language,
      executed: false,
    },
  });

  return {
    submissionId,
    challengeId: params.challenge.id,
    candidateId: params.candidateProfileId,
    status: 'submitted',
    score: 0,
    passedCases: 0,
    totalCases: testCases.length,
    evidence,
    xpEarned: 0,
    details: 'Solution saved but not executed, so it has no score.',
  };
}

/**
 * Calculates XP reward enforcing the daily cap of 200 XP/day (BR-25).
 */
export function calculateCappedXp(
  requestedXp: number,
  userTodayTransactions: XpTransaction[],
  dailyCap: number = 200
): number {
  const currentTotalToday = userTodayTransactions.reduce((acc, t) => acc + t.amount, 0);
  const remainingAllowance = Math.max(0, dailyCap - currentTotalToday);
  return Math.min(requestedXp, remainingAllowance);
}

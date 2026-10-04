import { type AssessmentSession, type Evidence } from './core.js';
import { type Challenge } from './challenges.js';
export interface SubmissionResult {
    submissionId: string;
    challengeId: string;
    candidateId: string;
    status: 'passed' | 'failed' | 'compilation_error' | 'runtime_error' | 'timed_out';
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
export declare function assertAIAssistanceAllowed(activeSessions: AssessmentSession[]): void;
/**
 * Starts an assessment session for a candidate.
 */
export declare function startAssessmentSession(params: {
    id?: string;
    candidateProfileId: string;
    challenge: Challenge;
    timeLimitSeconds?: number;
}): AssessmentSession;
/**
 * Evaluates a candidate solution in the assessment sandbox.
 * Runs against public and hidden test cases (BR-49, BR-51).
 * If all pass, mints verified Evidence item automatically.
 */
export declare function evaluateChallengeSubmission(params: {
    submissionId?: string;
    session?: AssessmentSession;
    challenge: Challenge;
    candidateProfileId: string;
    language: string;
    code: string;
}): SubmissionResult;
/**
 * Calculates XP reward enforcing the daily cap of 200 XP/day (BR-25).
 */
export declare function calculateCappedXp(requestedXp: number, userTodayTransactions: XpTransaction[], dailyCap?: number): number;
//# sourceMappingURL=assessment.d.ts.map
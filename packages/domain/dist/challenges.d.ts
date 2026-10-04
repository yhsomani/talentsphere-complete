import { type AssessmentPolicyMode, type Role } from './core.js';
export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export declare const ALLOWED_LANGUAGES: readonly ["typescript", "javascript", "python", "rust", "go"];
export type AllowedLanguage = (typeof ALLOWED_LANGUAGES)[number];
export interface Challenge {
    id: string;
    slug: string;
    title: string;
    description: string;
    difficulty: ChallengeDifficulty;
    category: string;
    skillIds: string[];
    testCases: TestCase[];
    timeLimitMs: number;
    memoryLimitMb: number;
    policyMode: AssessmentPolicyMode;
    createdAt: string;
    updatedAt: string;
}
export interface CreateChallengeParams {
    id?: string;
    slug: string;
    title: string;
    description: string;
    difficulty: ChallengeDifficulty;
    category: string;
    skillIds?: string[];
    testCases: TestCase[];
    timeLimitMs?: number;
    memoryLimitMb?: number;
    policyMode?: AssessmentPolicyMode;
    actor: {
        userId: string;
        roles: Role[];
    };
}
/**
 * Creates a new coding challenge for the Challenges Arena (F-08).
 * Enforces role restriction (admin / instructor only), non-empty test cases, and public/hidden test case split (BR-51).
 */
export declare function createChallenge(params: CreateChallengeParams): Challenge;
/**
 * Filters challenge representation for candidate view.
 * BR-51: Hidden test cases are never returned to candidate client.
 */
export declare function filterChallengeForCandidate(challenge: Challenge): Omit<Challenge, 'testCases'> & {
    publicTestCases: TestCase[];
};
//# sourceMappingURL=challenges.d.ts.map
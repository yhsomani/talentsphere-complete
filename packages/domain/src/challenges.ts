import { DomainError, type AssessmentPolicyMode, type Role } from './index.js';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export const ALLOWED_LANGUAGES = ['typescript', 'javascript', 'python', 'rust', 'go'] as const;
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
export function createChallenge(params: CreateChallengeParams): Challenge {
  const isAuthorized =
    params.actor.roles.includes('platform_admin') ||
    params.actor.roles.includes('instructor') ||
    params.actor.roles.includes('course_author');

  if (!isAuthorized) {
    throw new DomainError('FORBIDDEN', 'Only instructors or administrators may create challenges.');
  }

  if (!params.title || params.title.trim().length < 3) {
    throw new DomainError('VALIDATION_FAILED', 'Challenge title must be at least 3 characters.');
  }

  if (!params.slug || !/^[a-z0-9-]+$/.test(params.slug)) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Challenge slug must be lowercase alphanumeric with hyphens.'
    );
  }

  if (!params.testCases || params.testCases.length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Challenge requires at least one test case.');
  }

  // Ensure test cases have at least one public and one hidden test case (BR-51)
  const hasPublic = params.testCases.some((tc) => !tc.isHidden);
  const hasHidden = params.testCases.some((tc) => tc.isHidden);

  if (!hasPublic || !hasHidden) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Challenge test cases must be split between public and hidden (BR-51).'
    );
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    slug: params.slug,
    title: params.title.trim(),
    description: params.description.trim(),
    difficulty: params.difficulty,
    category: params.category.trim(),
    skillIds: params.skillIds || [],
    testCases: params.testCases,
    timeLimitMs: params.timeLimitMs || 5000,
    memoryLimitMb: Math.min(params.memoryLimitMb || 512, 512), // Max 512MB RAM per BR-50
    policyMode: params.policyMode || 'AI_PROHIBITED',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Filters challenge representation for candidate view.
 * BR-51: Hidden test cases are never returned to candidate client.
 */
export function filterChallengeForCandidate(
  challenge: Challenge
): Omit<Challenge, 'testCases'> & { publicTestCases: TestCase[] } {
  const publicTestCases = challenge.testCases.filter((tc) => !tc.isHidden);
  return {
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    category: challenge.category,
    skillIds: challenge.skillIds,
    publicTestCases,
    timeLimitMs: challenge.timeLimitMs,
    memoryLimitMb: challenge.memoryLimitMb,
    policyMode: challenge.policyMode,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
  };
}

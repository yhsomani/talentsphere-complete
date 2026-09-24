import { describe, it, expect } from 'vitest';
import {
  createChallenge,
  filterChallengeForCandidate,
  startAssessmentSession,
  assertAIAssistanceAllowed,
  evaluateChallengeSubmission,
  calculateCappedXp,
  type Challenge,
  type XpTransaction,
} from '../../packages/domain/src/index.js';

describe('Challenges Arena & Assessment Domain Model (F-08, BR-24, BR-25, BR-49..51, SSOT Section D)', () => {
  const adminActor = {
    userId: 'u0000000-0000-4000-a000-000000000001',
    roles: ['platform_admin' as const],
  };
  const candidateActor = {
    userId: 'u0000000-0000-4000-a000-000000000002',
    roles: ['candidate' as const],
  };

  const sampleTestCases = [
    { id: 'tc1', input: '2, 3', expectedOutput: '5', isHidden: false },
    { id: 'tc2', input: '10, -5', expectedOutput: '5', isHidden: true },
  ];

  it('creates challenge with public and hidden test case split (BR-51)', () => {
    const challenge = createChallenge({
      slug: 'sum-two-integers',
      title: 'Sum of Two Integers',
      description: 'Compute the sum of two 32-bit integers.',
      difficulty: 'easy',
      category: 'Algorithms',
      testCases: sampleTestCases,
      actor: adminActor,
    });

    expect(challenge.id).toBeDefined();
    expect(challenge.slug).toBe('sum-two-integers');
    expect(challenge.testCases).toHaveLength(2);
    expect(challenge.policyMode).toBe('AI_PROHIBITED');
  });

  it('rejects challenge creation without hidden test cases (BR-51)', () => {
    expect(() => {
      createChallenge({
        slug: 'only-public-tests',
        title: 'Only Public Tests',
        description: 'Testing split requirement',
        difficulty: 'easy',
        category: 'Algorithms',
        testCases: [{ id: 'tc1', input: '1', expectedOutput: '1', isHidden: false }],
        actor: adminActor,
      });
    }).toThrowError(/test cases must be split between public and hidden/);
  });

  it('rejects challenge creation by candidates', () => {
    expect(() => {
      createChallenge({
        slug: 'candidate-challenge',
        title: 'Candidate Created',
        description: 'Should fail',
        difficulty: 'easy',
        category: 'Algorithms',
        testCases: sampleTestCases,
        actor: candidateActor,
      });
    }).toThrowError(/Only instructors or administrators may create challenges/);
  });

  it('filters challenge representation to hide hidden test cases from candidates (BR-51)', () => {
    const challenge = createChallenge({
      slug: 'reverse-string',
      title: 'Reverse String',
      description: 'Reverse characters of a string.',
      difficulty: 'easy',
      category: 'Strings',
      testCases: [
        { id: 'tc1', input: '"hello"', expectedOutput: '"olleh"', isHidden: false },
        { id: 'tc2', input: '"secret"', expectedOutput: '"terces"', isHidden: true },
      ],
      actor: adminActor,
    });

    const candidateView = filterChallengeForCandidate(challenge);
    expect(candidateView.publicTestCases).toHaveLength(1);
    expect(candidateView.publicTestCases[0].input).toBe('"hello"');
    expect((candidateView as any).testCases).toBeUndefined();
  });

  it('strictly blocks AI assistance when candidate has active AI_PROHIBITED session (SSOT Section D)', () => {
    const challenge = createChallenge({
      slug: 'binary-search',
      title: 'Binary Search',
      description: 'Search for target in sorted array.',
      difficulty: 'medium',
      category: 'Algorithms',
      testCases: sampleTestCases,
      actor: adminActor,
    });

    const candidateProfileId = 'p0000000-0000-4000-a000-000000000002';
    const session = startAssessmentSession({
      candidateProfileId,
      challenge,
    });

    expect(session.status).toBe('in_progress');
    expect(session.policyMode).toBe('AI_PROHIBITED');

    // SSOT Section D: Verification that AI access is blocked server-side
    expect(() => {
      assertAIAssistanceAllowed([session]);
    }).toThrowError(/AI assistance is strictly prohibited during an active proctored assessment session/);
  });

  it('evaluates solution, verifies all test cases, and auto-mints verified evidence', () => {
    const challenge = createChallenge({
      slug: 'two-sum',
      title: 'Two Sum',
      description: 'Find two numbers that add up to target.',
      difficulty: 'easy',
      category: 'Arrays',
      testCases: sampleTestCases,
      actor: adminActor,
    });

    const candidateProfileId = 'p0000000-0000-4000-a000-000000000002';
    const result = evaluateChallengeSubmission({
      challenge,
      candidateProfileId,
      language: 'typescript',
      code: 'function twoSum(a: number, b: number) { return a + b; }',
    });

    expect(result.status).toBe('passed');
    expect(result.score).toBe(100);
    expect(result.passedCases).toBe(2);
    expect(result.xpEarned).toBe(25);
    expect(result.evidence).toBeDefined();
    expect(result.evidence?.type).toBe('assessment');
    expect(result.evidence?.verificationLevel).toBe('authority_verified');
    expect(result.evidence?.status).toBe('verified');
  });

  it('enforces language allowlist (BR-24)', () => {
    const challenge = createChallenge({
      slug: 'lang-check',
      title: 'Language Check',
      description: 'Check allowed language',
      difficulty: 'easy',
      category: 'Algorithms',
      testCases: sampleTestCases,
      actor: adminActor,
    });

    expect(() => {
      evaluateChallengeSubmission({
        challenge,
        candidateProfileId: 'cand-1',
        language: 'php' as any,
        code: 'echo "hello";',
      });
    }).toThrowError(/Language "php" is not permitted/);
  });

  it('enforces daily cap of 200 XP/day on XP transactions (BR-25)', () => {
    const todayTransactions: XpTransaction[] = [
      {
        id: 't1',
        userId: 'u1',
        amount: 150,
        referenceType: 'challenge',
        referenceId: 'c1',
        description: 'Solved challenge',
        createdAt: '2026-09-24T10:00:00Z',
      },
    ];

    // User already has 150 XP today. Cap is 200 XP.
    // Earning 100 XP should be capped to 50 XP.
    const capped = calculateCappedXp(100, todayTransactions, 200);
    expect(capped).toBe(50);

    // If user already reached 200 XP, 0 XP awarded
    const maxTransactions: XpTransaction[] = [
      {
        id: 't1',
        userId: 'u1',
        amount: 200,
        referenceType: 'challenge',
        referenceId: 'c1',
        description: 'Solved challenge',
        createdAt: '2026-09-24T10:00:00Z',
      },
    ];
    const zero = calculateCappedXp(50, maxTransactions, 200);
    expect(zero).toBe(0);
  });
});

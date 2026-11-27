import { describe, expect, it } from 'vitest';
import {
  normalizeGoalTitle,
  planCareerGoal,
  postingMatchesGoal,
} from '../../packages/domain/src/career-goals.js';

const job = (title: string, requiredSkillIds: string[], status = 'published') =>
  ({ title, status, requiredSkillIds }) as never;
const entry = (skillId: string, rung: 'unverified' | 'peer_reviewed') => ({
  skillId,
  strongestRung: rung,
  signalCount: 1,
  lastSignalAt: '2026-05-15T10:00:00.000Z',
  sources: [{ sourceModule: 'evidence' as const, sourceRef: `ev-${skillId}`, rung }],
});

describe('career goals', () => {
  it('normalizes a title and refuses one out of bounds', () => {
    expect(normalizeGoalTitle('  Data   Engineer ')).toBe('Data Engineer');
    expect(() => normalizeGoalTitle(' x ')).toThrow(/2 to 80/);
    expect(() => normalizeGoalTitle('a'.repeat(81))).toThrow(/2 to 80/);
  });

  it('matches a posting whose title holds every word of the goal', () => {
    expect(postingMatchesGoal('data engineer', 'Senior Data Engineer (Remote)')).toBe(true);
    expect(postingMatchesGoal('Data Engineer', 'Data Analyst')).toBe(false);
    expect(postingMatchesGoal('C++ developer', 'Embedded C++ Developer')).toBe(true);
    expect(postingMatchesGoal('engineer', 'Engineering Manager')).toBe(false);
  });

  it('ranks skills by how many matching postings need them, with one next step each', () => {
    const plan = planCareerGoal(
      'Data Engineer',
      [
        job('Data Engineer', ['sql', 'python']),
        job('Senior Data Engineer', ['sql', 'spark']),
        job('Data Engineer', ['rust'], 'draft'),
        job('Data Analyst', ['excel']),
      ],
      [entry('sql', 'peer_reviewed'), entry('python', 'unverified')]
    );
    expect(plan).toMatchObject({ matchingPostings: 2, shown: 2, verified: 1 });
    expect(plan.skills.map((s) => [s.skillId, s.requiredBy, s.nextStep])).toEqual([
      ['sql', 2, null],
      ['python', 1, { kind: 'verify', produces: 'peer_reviewed' }],
      ['spark', 1, { kind: 'show', produces: 'unverified' }],
    ]);
  });

  it('is empty when no published posting matches', () => {
    expect(planCareerGoal('Astronaut', [job('Data Engineer', ['sql'])], [])).toEqual({
      matchingPostings: 0,
      shown: 0,
      verified: 0,
      skills: [],
    });
  });
});

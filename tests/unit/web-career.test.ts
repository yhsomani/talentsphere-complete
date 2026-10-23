import { describe, expect, it } from 'vitest';
import { yearsOfExperience } from '../../apps/web/src/lib/career.js';

const NOW = new Date('2026-01-01T00:00:00.000Z');

describe('yearsOfExperience', () => {
  it('is zero with no roles', () => {
    expect(yearsOfExperience([], NOW)).toBe(0);
  });

  it('adds up roles that do not overlap', () => {
    expect(
      yearsOfExperience(
        [
          { startDate: '2020-01-01', endDate: '2021-01-01' },
          { startDate: '2022-01-01', endDate: '2024-01-01' },
        ],
        NOW
      )
    ).toBe(3);
  });

  it('counts months held in two roles at once only once', () => {
    expect(
      yearsOfExperience(
        [
          { startDate: '2020-01-01', endDate: '2022-01-01' },
          { startDate: '2021-01-01', endDate: '2023-01-01' },
        ],
        NOW
      )
    ).toBe(3);
  });

  it('counts a role fully inside another one once', () => {
    expect(
      yearsOfExperience(
        [
          { startDate: '2020-01-01', endDate: '2024-01-01' },
          { startDate: '2021-01-01', endDate: '2022-01-01' },
        ],
        NOW
      )
    ).toBe(4);
  });

  it('runs a current role up to now', () => {
    expect(yearsOfExperience([{ startDate: '2024-01-01', isCurrent: true }], NOW)).toBe(2);
    expect(yearsOfExperience([{ startDate: '2024-01-01', endDate: null }], NOW)).toBe(2);
  });

  it('ignores roles with unusable dates or an end before the start', () => {
    expect(
      yearsOfExperience(
        [
          { startDate: 'not a date', endDate: '2024-01-01' },
          { startDate: '2024-01-01', endDate: '2023-01-01' },
        ],
        NOW
      )
    ).toBe(0);
  });
});

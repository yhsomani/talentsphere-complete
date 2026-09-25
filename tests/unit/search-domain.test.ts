import { describe, it, expect } from 'vitest';
import {
  scoreSearchMatch,
  rankSearchResults,
  getAvailableCommands,
  filterCommandsByQuery,
  createSearchHistoryRecord,
  SearchResultItem,
  BASE_COMMANDS,
} from '../../packages/domain/src/index.js';

describe('Multi-Entity Search & Command Palette Domain (F-20, F-34, F-32)', () => {
  describe('scoreSearchMatch', () => {
    it('returns 100 for exact match (case-insensitive and trimmed)', () => {
      expect(scoreSearchMatch('TypeScript', 'typescript')).toBe(100);
      expect(scoreSearchMatch('  Full Stack Developer  ', 'full stack developer')).toBe(100);
    });

    it('returns 85 for prefix match', () => {
      expect(scoreSearchMatch('TypeScript Programming', 'typescript')).toBe(85);
      expect(scoreSearchMatch('Backend Engineering', 'back')).toBe(85);
    });

    it('returns 75 for exact word match within multi-word string', () => {
      expect(scoreSearchMatch('Senior React Developer', 'react')).toBe(75);
    });

    it('returns 70 for word prefix match within multi-word string', () => {
      expect(scoreSearchMatch('Senior Frontend Engineer', 'engin')).toBe(70);
    });

    it('returns 50 for generic substring match', () => {
      expect(scoreSearchMatch('TypeScript', 'script')).toBe(50);
    });

    it('returns 0 for no match or empty input', () => {
      expect(scoreSearchMatch('Python Developer', 'rust')).toBe(0);
      expect(scoreSearchMatch('', 'test')).toBe(0);
      expect(scoreSearchMatch('test', '')).toBe(0);
    });
  });

  describe('rankSearchResults', () => {
    it('sorts results by score descending, then by title alphabetically', () => {
      const items: SearchResultItem[] = [
        { id: '1', type: 'skill', title: 'Python Web', url: '/skills/python-web', score: 50 },
        { id: '2', type: 'job', title: 'Python', url: '/jobs/1', score: 100 },
        { id: '3', type: 'course', title: 'Advanced Python', url: '/courses/1', score: 75 },
        { id: '4', type: 'challenge', title: 'Basic Python', url: '/arena/1', score: 75 },
      ];

      const ranked = rankSearchResults(items);

      expect(ranked[0].id).toBe('2'); // score 100
      expect(ranked[1].id).toBe('3'); // score 75, "Advanced Python" before "Basic Python"
      expect(ranked[2].id).toBe('4'); // score 75, "Basic Python"
      expect(ranked[3].id).toBe('1'); // score 50
    });
  });

  describe('getAvailableCommands', () => {
    it('provides standard navigation and public action commands for candidates', () => {
      const commands = getAvailableCommands(['candidate']);
      expect(commands.some((c) => c.id === 'nav_jobs')).toBe(true);
      expect(commands.some((c) => c.id === 'nav_courses')).toBe(true);
      expect(commands.some((c) => c.id === 'nav_arena')).toBe(true);
      expect(commands.some((c) => c.id === 'acc_settings')).toBe(true);

      // Candidate must not see recruiter or admin commands
      expect(commands.some((c) => c.id === 'act_post_job')).toBe(false);
      expect(commands.some((c) => c.id === 'adm_console')).toBe(false);
    });

    it('provides job posting command for recruiters', () => {
      const commands = getAvailableCommands(['recruiter']);
      expect(commands.some((c) => c.id === 'act_post_job')).toBe(true);
      expect(commands.some((c) => c.id === 'adm_console')).toBe(false);
    });

    it('provides admin console and governance commands for platform_admin', () => {
      const commands = getAvailableCommands(['platform_admin']);
      expect(commands.some((c) => c.id === 'adm_console')).toBe(true);
      expect(commands.some((c) => c.id === 'adm_feature_flags')).toBe(true);
      expect(commands.some((c) => c.id === 'adm_health')).toBe(true);
      expect(commands.some((c) => c.id === 'act_post_job')).toBe(true);
    });
  });

  describe('filterCommandsByQuery', () => {
    it('filters commands by title keyword', () => {
      const filtered = filterCommandsByQuery(BASE_COMMANDS, 'billing');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('acc_billing');
    });

    it('filters commands by keyboard shortcut', () => {
      const filtered = filterCommandsByQuery(BASE_COMMANDS, 'G A');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('nav_arena');
    });

    it('returns all commands when query is empty', () => {
      const filtered = filterCommandsByQuery(BASE_COMMANDS, '');
      expect(filtered.length).toBe(BASE_COMMANDS.length);
    });
  });

  describe('createSearchHistoryRecord', () => {
    it('creates an immutable search history entry', () => {
      const userId = '00000000-0000-0000-0000-000000000001';
      const record = createSearchHistoryRecord(userId, ' TypeScript ', 'skills', 4, '2026-09-24T18:00:00.000Z');

      expect(record.id).toBeDefined();
      expect(record.userId).toBe(userId);
      expect(record.query).toBe('TypeScript');
      expect(record.entityType).toBe('skills');
      expect(record.resultCount).toBe(4);
      expect(record.createdAt).toBe('2026-09-24T18:00:00.000Z');
    });
  });
});

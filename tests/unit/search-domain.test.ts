import { describe, it, expect } from 'vitest';
import {
  scoreSearchMatch,
  rankSearchResults,
  getAvailableCommands,
  filterCommandsByQuery,
  createSearchHistoryRecord,
  levenshteinDistance,
  generateAutocompleteSuggestions,
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

  describe('levenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(levenshteinDistance('typescript', 'typescript')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('returns string length when comparing with empty string', () => {
      expect(levenshteinDistance('react', '')).toBe(5);
      expect(levenshteinDistance('', 'python')).toBe(6);
    });

    it('calculates single-character insertion, deletion, and substitution', () => {
      expect(levenshteinDistance('typescrip', 'typescript')).toBe(1); // insertion
      expect(levenshteinDistance('pythons', 'python')).toBe(1); // deletion
      expect(levenshteinDistance('dockkr', 'docker')).toBe(1); // substitution
    });

    it('calculates multi-character edit distance accurately', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });
  });

  describe('Typo Tolerance in scoreSearchMatch (BR-266)', () => {
    it('matches target with 1 edit distance when query is >= 4 chars', () => {
      expect(scoreSearchMatch('TypeScript', 'typescrit')).toBe(45);
      expect(scoreSearchMatch('Python Web', 'pythn')).toBe(45);
      expect(scoreSearchMatch('Docker Containers', 'dockr')).toBe(45);
    });

    it('matches target with 2 edit distance when query is >= 5 chars', () => {
      expect(scoreSearchMatch('Kubernetes', 'kubernits')).toBe(35);
    });

    it('does not trigger typo tolerance for short queries < 4 chars', () => {
      expect(scoreSearchMatch('Go', 'g')).toBe(85); // prefix
      expect(scoreSearchMatch('Rust', 'rus')).toBe(85); // prefix
      expect(scoreSearchMatch('Rust', 'rst')).toBe(0); // edit distance 1, but query length 3 (< 4)
    });
  });

  describe('generateAutocompleteSuggestions (BR-265)', () => {
    const catalog: SearchResultItem[] = [
      { id: '1', type: 'skill', title: 'TypeScript', url: '/skills/typescript', score: 0 },
      { id: '2', type: 'job', title: 'TypeScript Lead Engineer', url: '/jobs/1', score: 0 },
      { id: '3', type: 'course', title: 'Fullstack TypeScript Mastery', url: '/courses/1', score: 0 },
      { id: '4', type: 'skill', title: 'Python', url: '/skills/python', score: 0 },
      { id: '5', type: 'company', title: 'TypeCraft AI', url: '/orgs/1', score: 0 },
      { id: '6', type: 'skill', title: 'TypeScript', url: '/skills/ts-duplicate', score: 0 },
    ];

    it('returns ranked suggestions matching query prefix or term', () => {
      const suggestions = generateAutocompleteSuggestions('type', catalog, 5);
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].text).toBe('TypeScript');
      expect(suggestions[0].score).toBe(85); // prefix match
    });

    it('deduplicates identical suggestion titles', () => {
      const suggestions = generateAutocompleteSuggestions('type', catalog, 10);
      const tsTitles = suggestions.filter((s) => s.text.toLowerCase() === 'typescript');
      expect(tsTitles.length).toBe(1);
    });

    it('respects limit argument', () => {
      const suggestions = generateAutocompleteSuggestions('type', catalog, 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('returns empty array when query is empty or whitespace', () => {
      expect(generateAutocompleteSuggestions('', catalog)).toEqual([]);
      expect(generateAutocompleteSuggestions('   ', catalog)).toEqual([]);
    });

    it('handles typo-tolerant autocomplete queries', () => {
      const suggestions = generateAutocompleteSuggestions('typescrip', catalog, 5);
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions.some((s) => s.text === 'TypeScript')).toBe(true);
    });
  });
});


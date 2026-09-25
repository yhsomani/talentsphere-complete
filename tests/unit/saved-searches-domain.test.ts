import { describe, it, expect } from 'vitest';
import {
  createSavedSearch,
  updateSavedSearch,
  matchJobAgainstCriteria,
  evaluateJobAlertsForPublishedJob,
  createSavedJob,
  removeSavedJob,
  SavedSearch,
  Job,
  DomainError,
  MAX_ACTIVE_SAVED_SEARCHES,
} from '../../packages/domain/src/index.js';

describe('Saved Searches & Job Alerts Domain Unit Tests (F-32, F-04, F-25, SSOT 1018)', () => {
  const userId = '11111111-1111-4000-a000-000000000001';

  const sampleJob: Job = {
    id: 'job-101',
    orgId: 'org-1',
    title: 'Senior Distributed Systems Engineer',
    description: 'Lead architecture of high-throughput consensus and event streams in Rust and Go.',
    location: 'San Francisco, CA',
    workMode: 'remote',
    jobType: 'full_time',
    requiredSkillIds: ['skill-rust', 'skill-distributed-systems'],
    salaryRange: {
      minMinor: 18000000,
      maxMinor: 24000000,
      currency: 'USD',
    },
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('createSavedSearch', () => {
    it('creates a valid saved search with default daily alert frequency', () => {
      const search = createSavedSearch({
        userId,
        title: 'Distributed Systems Remote',
        criteria: {
          query: 'Distributed Systems',
          workMode: 'remote',
          requiredSkillIds: ['skill-rust'],
        },
        existingSearches: [],
      });

      expect(search.id).toBeDefined();
      expect(search.userId).toBe(userId);
      expect(search.title).toBe('Distributed Systems Remote');
      expect(search.alertFrequency).toBe('daily');
      expect(search.isActive).toBe(true);
      expect(search.criteria.query).toBe('Distributed Systems');
      expect(search.criteria.workMode).toBe('remote');
    });

    it('rejects saved search with empty or too short title', () => {
      expect(() => {
        createSavedSearch({
          userId,
          title: ' ',
          criteria: {},
          existingSearches: [],
        });
      }).toThrowError('Saved search title must be at least 2 characters');
    });

    it('enforces maximum active saved searches limit per user (20)', () => {
      const existing: SavedSearch[] = [];
      for (let i = 0; i < MAX_ACTIVE_SAVED_SEARCHES; i++) {
        existing.push({
          id: `search-${i}`,
          userId,
          title: `Search ${i}`,
          criteria: {},
          alertFrequency: 'daily',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      expect(() => {
        createSavedSearch({
          userId,
          title: 'Over Limit Search',
          criteria: {},
          existingSearches: existing,
        });
      }).toThrowError(`Cannot exceed maximum limit of ${MAX_ACTIVE_SAVED_SEARCHES} active saved searches`);
    });
  });

  describe('updateSavedSearch', () => {
    it('updates criteria and toggles active state', () => {
      const search = createSavedSearch({
        userId,
        title: 'Initial Search',
        criteria: { location: 'New York' },
        existingSearches: [],
      });

      const updated = updateSavedSearch(search, {
        title: 'Updated Search',
        criteria: { location: 'San Francisco, CA', workMode: 'remote' },
        isActive: false,
        alertFrequency: 'instant',
      });

      expect(updated.title).toBe('Updated Search');
      expect(updated.criteria.location).toBe('San Francisco, CA');
      expect(updated.criteria.workMode).toBe('remote');
      expect(updated.isActive).toBe(false);
      expect(updated.alertFrequency).toBe('instant');
    });
  });

  describe('matchJobAgainstCriteria', () => {
    it('matches job on keyword query in title or description', () => {
      expect(matchJobAgainstCriteria(sampleJob, { query: 'distributed systems' })).toBe(true);
      expect(matchJobAgainstCriteria(sampleJob, { query: 'consensus' })).toBe(true);
      expect(matchJobAgainstCriteria(sampleJob, { query: 'react frontend' })).toBe(false);
    });

    it('matches job on location substring', () => {
      expect(matchJobAgainstCriteria(sampleJob, { location: 'San Francisco' })).toBe(true);
      expect(matchJobAgainstCriteria(sampleJob, { location: 'London' })).toBe(false);
    });

    it('matches work mode and job type', () => {
      expect(matchJobAgainstCriteria(sampleJob, { workMode: 'remote', jobType: 'full_time' })).toBe(true);
      expect(matchJobAgainstCriteria(sampleJob, { workMode: 'onsite' })).toBe(false);
      expect(matchJobAgainstCriteria(sampleJob, { jobType: 'contract' })).toBe(false);
    });

    it('matches required skills', () => {
      expect(matchJobAgainstCriteria(sampleJob, { requiredSkillIds: ['skill-rust'] })).toBe(true);
      expect(matchJobAgainstCriteria(sampleJob, { requiredSkillIds: ['skill-python', 'skill-django'] })).toBe(false);
    });

    it('matches minimum salary threshold', () => {
      expect(matchJobAgainstCriteria(sampleJob, { salaryMinMinor: 20000000 })).toBe(true);
      expect(matchJobAgainstCriteria(sampleJob, { salaryMinMinor: 25000000 })).toBe(false);
    });

    it('rejects unpublished jobs', () => {
      const draftJob = { ...sampleJob, status: 'draft' as const };
      expect(matchJobAgainstCriteria(draftJob, { query: 'distributed systems' })).toBe(false);
    });
  });

  describe('evaluateJobAlertsForPublishedJob (New-only alert dispatch SSOT line 1018)', () => {
    it('generates alerts only for active matching saved searches with non-never frequency', () => {
      const matchingSearch: SavedSearch = {
        id: 'search-match',
        userId: 'candidate-1',
        title: 'Rust Jobs',
        criteria: { requiredSkillIds: ['skill-rust'] },
        alertFrequency: 'daily',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const inactiveSearch: SavedSearch = {
        id: 'search-inactive',
        userId: 'candidate-2',
        title: 'Rust Inactive',
        criteria: { requiredSkillIds: ['skill-rust'] },
        alertFrequency: 'daily',
        isActive: false, // inactive
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const neverAlertSearch: SavedSearch = {
        id: 'search-never',
        userId: 'candidate-3',
        title: 'Rust No Alerts',
        criteria: { requiredSkillIds: ['skill-rust'] },
        alertFrequency: 'never', // never
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const alerts = evaluateJobAlertsForPublishedJob(sampleJob, [
        matchingSearch,
        inactiveSearch,
        neverAlertSearch,
      ]);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].userId).toBe('candidate-1');
      expect(alerts[0].savedSearchId).toBe('search-match');
      expect(alerts[0].jobId).toBe(sampleJob.id);
      expect(alerts[0].isRead).toBe(false);
    });
  });

  describe('createSavedJob & removeSavedJob (Bookmarks)', () => {
    it('bookmarks a job and prevents duplicates', () => {
      const saved = createSavedJob(userId, 'job-101', []);
      expect(saved.id).toBeDefined();
      expect(saved.userId).toBe(userId);
      expect(saved.jobId).toBe('job-101');

      expect(() => {
        createSavedJob(userId, 'job-101', [saved]);
      }).toThrowError('Job is already saved in your bookmarks.');
    });

    it('removes a job bookmark and throws if not found', () => {
      const saved = { id: 'save-1', userId, jobId: 'job-101', createdAt: new Date().toISOString() };
      const updated = removeSavedJob(userId, 'job-101', [saved]);
      expect(updated).toHaveLength(0);

      expect(() => {
        removeSavedJob(userId, 'job-999', [saved]);
      }).toThrowError('Saved job bookmark not found.');
    });
  });
});

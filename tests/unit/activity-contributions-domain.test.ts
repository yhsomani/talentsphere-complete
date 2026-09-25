import { describe, it, expect } from 'vitest';
import {
  recordActivityEvent,
  calculateContributionScores,
  determineEngagementBand,
  ActivityEvent,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Domain: Activity & Contribution Tracking (F-146, S-09)', () => {
  const userId = '11111111-2222-3333-4444-555555555555';

  describe('recordActivityEvent', () => {
    it('creates an activity event with valid inputs and defaults', () => {
      const ev = recordActivityEvent({
        userId,
        category: 'learning',
        activityType: 'lesson_completed',
        weight: 1.5,
        metadata: { courseId: 'course_123', lessonId: 'lesson_456' },
      });

      expect(ev.id).toBeDefined();
      expect(ev.userId).toBe(userId);
      expect(ev.category).toBe('learning');
      expect(ev.activityType).toBe('lesson_completed');
      expect(ev.weight).toBe(1.5);
      expect(ev.metadata.courseId).toBe('course_123');
      expect(ev.occurredAt).toBeDefined();
    });

    it('rejects invalid inputs', () => {
      expect(() =>
        recordActivityEvent({
          userId: '',
          category: 'learning',
          activityType: 'lesson_completed',
        })
      ).toThrowError(DomainError);

      expect(() =>
        recordActivityEvent({
          userId,
          category: 'invalid_category' as any,
          activityType: 'lesson_completed',
        })
      ).toThrowError(DomainError);

      expect(() =>
        recordActivityEvent({
          userId,
          category: 'learning',
          activityType: '',
        })
      ).toThrowError(DomainError);

      expect(() =>
        recordActivityEvent({
          userId,
          category: 'learning',
          activityType: 'lesson_completed',
          weight: -1,
        })
      ).toThrowError(DomainError);
    });
  });

  describe('determineEngagementBand', () => {
    it('maps scores to canonical engagement bands', () => {
      expect(determineEngagementBand(95)).toBe('luminary');
      expect(determineEngagementBand(80)).toBe('luminary');
      expect(determineEngagementBand(70)).toBe('power_contributor');
      expect(determineEngagementBand(50)).toBe('power_contributor');
      expect(determineEngagementBand(35)).toBe('active');
      expect(determineEngagementBand(20)).toBe('active');
      expect(determineEngagementBand(10)).toBe('passive');
      expect(determineEngagementBand(0)).toBe('passive');
    });
  });

  describe('calculateContributionScores', () => {
    it('returns zero score in passive band for user with no events', () => {
      const score = calculateContributionScores(userId, []);

      expect(score.compositeScore).toBe(0);
      expect(score.engagementBand).toBe('passive');
      expect(score.learningScore).toBe(0);
      expect(score.creationScore).toBe(0);
      expect(score.collaborationScore).toBe(0);
      expect(score.socialScore).toBe(0);
      expect(score.activeStreakDays).toBe(0);
      expect(score.totalEventsCount).toBe(0);
      expect(score.lastActiveAt).toBeNull();
    });

    it('calculates category scores and composite engagement for mixed activities', () => {
      const now = new Date('2026-09-15T12:00:00Z');
      const events: ActivityEvent[] = [
        {
          id: '1',
          userId,
          category: 'learning',
          activityType: 'course_completed',
          weight: 4.0,
          metadata: {},
          occurredAt: '2026-09-15T10:00:00Z',
          createdAt: '2026-09-15T10:00:00Z',
        },
        {
          id: '2',
          userId,
          category: 'creation',
          activityType: 'project_showcased',
          weight: 3.0,
          metadata: {},
          occurredAt: '2026-09-15T11:00:00Z',
          createdAt: '2026-09-15T11:00:00Z',
        },
        {
          id: '3',
          userId,
          category: 'collaboration',
          activityType: 'peer_review_submitted',
          weight: 2.0,
          metadata: {},
          occurredAt: '2026-09-14T09:00:00Z',
          createdAt: '2026-09-14T09:00:00Z',
        },
        {
          id: '4',
          userId,
          category: 'social',
          activityType: 'connection_accepted',
          weight: 2.0,
          metadata: {},
          occurredAt: '2026-09-13T08:00:00Z',
          createdAt: '2026-09-13T08:00:00Z',
        },
      ];

      const score = calculateContributionScores(userId, events, now);

      expect(score.totalEventsCount).toBe(4);
      expect(score.learningScore).toBe(20); // 4 * 5
      expect(score.creationScore).toBe(30); // 3 * 10
      expect(score.collaborationScore).toBe(16); // 2 * 8
      expect(score.socialScore).toBe(6); // 2 * 3
      expect(score.compositeScore).toBeGreaterThan(15);
      expect(score.activeStreakDays).toBe(3); // 2026-09-15, 2026-09-14, 2026-09-13
      expect(score.lastActiveAt).toBe('2026-09-15T11:00:00.000Z');
    });

    it('applies time decay for older events (> 30 days old)', () => {
      const ref = new Date('2026-09-15T12:00:00Z');
      const recentEvent: ActivityEvent = {
        id: '1',
        userId,
        category: 'creation',
        activityType: 'article_published',
        weight: 2.0,
        metadata: {},
        occurredAt: '2026-09-10T12:00:00Z', // 5 days old
        createdAt: '2026-09-10T12:00:00Z',
      };
      const oldEvent: ActivityEvent = {
        id: '2',
        userId,
        category: 'creation',
        activityType: 'article_published',
        weight: 2.0,
        metadata: {},
        occurredAt: '2026-06-15T12:00:00Z', // 92 days old (> 30 days)
        createdAt: '2026-06-15T12:00:00Z',
      };

      const scoreRecentOnly = calculateContributionScores(userId, [recentEvent], ref);
      const scoreOldOnly = calculateContributionScores(userId, [oldEvent], ref);

      expect(scoreRecentOnly.creationScore).toBe(20); // 2 * 10
      expect(scoreOldOnly.creationScore).toBeLessThan(scoreRecentOnly.creationScore);
    });
  });
});

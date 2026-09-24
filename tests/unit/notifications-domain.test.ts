import { describe, it, expect } from 'vitest';
import {
  createDefaultNotificationPreferences,
  shouldDeliverNotification,
  createNotificationEntity,
  markNotificationsAsRead,
  Notification,
  NotificationPreferences,
} from '../../packages/domain/src/index.js';

describe('Notification Center Domain Model (F-14, BR-120)', () => {
  const userId = '00000000-0000-0000-0000-000000000001';

  it('generates sensible default preferences', () => {
    const prefs = createDefaultNotificationPreferences(userId);
    expect(prefs.userId).toBe(userId);
    expect(prefs.allowMessages).toBe(true);
    expect(prefs.allowMentions).toBe(true);
    expect(prefs.allowApplications).toBe(true);
    expect(prefs.allowCourseUpdates).toBe(true);
    expect(prefs.emailDigestFrequency).toBe('daily');
  });

  it('respects notification preferences and mention gating (BR-120)', () => {
    const prefs: NotificationPreferences = {
      id: 'prefs-1',
      userId,
      allowMessages: true,
      allowMentions: false, // BR-120 disabled mentions
      allowApplications: false,
      allowCourseUpdates: true,
      emailDigestFrequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mentions blocked per BR-120
    expect(shouldDeliverNotification(prefs, 'mention')).toBe(false);

    // Messages allowed
    expect(shouldDeliverNotification(prefs, 'message')).toBe(true);

    // Applications blocked
    expect(shouldDeliverNotification(prefs, 'application_status')).toBe(false);

    // Course updates allowed
    expect(shouldDeliverNotification(prefs, 'course_completion')).toBe(true);

    // System notifications always delivered
    expect(shouldDeliverNotification(prefs, 'system')).toBe(true);
  });

  it('validates notification entity creation constraints', () => {
    // Missing recipient
    expect(() =>
      createNotificationEntity({
        recipientId: '',
        type: 'system',
        title: 'System Alert',
        body: 'Maintenance at midnight',
      })
    ).toThrowError(/Recipient ID is required/);

    // Empty title
    expect(() =>
      createNotificationEntity({
        recipientId: userId,
        type: 'system',
        title: '   ',
        body: 'Maintenance at midnight',
      })
    ).toThrowError(/title is required/);

    // Empty body
    expect(() =>
      createNotificationEntity({
        recipientId: userId,
        type: 'system',
        title: 'System Alert',
        body: '',
      })
    ).toThrowError(/body is required/);

    // Valid notification
    const notif = createNotificationEntity({
      recipientId: userId,
      type: 'challenge_passed',
      title: 'Challenge Passed!',
      body: 'You scored 100% on Reverse Words.',
      referenceType: 'challenge',
      referenceId: 'ch-1',
    });
    expect(notif.id).toBeDefined();
    expect(notif.isRead).toBe(false);
    expect(notif.readAt).toBeNull();
    expect(notif.title).toBe('Challenge Passed!');
  });

  it('marks notifications read individually and in bulk', () => {
    const n1 = createNotificationEntity({
      recipientId: userId,
      type: 'message',
      title: 'New message',
      body: 'Hello',
    });
    const n2 = createNotificationEntity({
      recipientId: userId,
      type: 'system',
      title: 'Welcome',
      body: 'Welcome to TalentSphere',
    });

    const list: Notification[] = [n1, n2];

    // Mark single notification read
    const count1 = markNotificationsAsRead(list, [n1.id]);
    expect(count1).toBe(1);
    expect(n1.isRead).toBe(true);
    expect(n1.readAt).toBeDefined();
    expect(n2.isRead).toBe(false);

    // Mark all read
    const count2 = markNotificationsAsRead(list);
    expect(count2).toBe(1); // Only n2 was unread
    expect(n2.isRead).toBe(true);
  });
});

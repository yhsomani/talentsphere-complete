import { DomainError } from './index.js';

export type NotificationType =
  | 'message'
  | 'application_status'
  | 'course_completion'
  | 'challenge_passed'
  | 'mention'
  | 'connection_request'
  | 'connection_accepted'
  | 'warm_intro_requested'
  | 'warm_intro_approved'
  | 'warm_intro_delivered'
  | 'warm_intro_declined'
  | 'referral_requested'
  | 'referral_approved'
  | 'referral_declined'
  | 'referral_forwarded'
  | 'system';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceType?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export type EmailDigestFrequency = 'realtime' | 'daily' | 'weekly' | 'never';

export interface NotificationPreferences {
  id: string;
  userId: string;
  allowMessages: boolean;
  allowMentions: boolean;
  allowApplications: boolean;
  allowCourseUpdates: boolean;
  emailDigestFrequency: EmailDigestFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationParams {
  id?: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

/**
 * Creates default notification preferences for a user profile.
 */
export function createDefaultNotificationPreferences(userId: string): NotificationPreferences {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    allowMessages: true,
    allowMentions: true,
    allowApplications: true,
    allowCourseUpdates: true,
    emailDigestFrequency: 'daily',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Evaluates delivery eligibility against user notification preferences (BR-120).
 * System notifications are always delivered.
 */
export function shouldDeliverNotification(
  prefs: NotificationPreferences | undefined,
  type: NotificationType
): boolean {
  if (!prefs) return true; // Default to allow if preferences not yet configured

  switch (type) {
    case 'mention':
      // BR-120: Mentions notify only if recipient allows mentions
      return prefs.allowMentions;
    case 'message':
      return prefs.allowMessages;
    case 'application_status':
      return prefs.allowApplications;
    case 'course_completion':
      return prefs.allowCourseUpdates;
    case 'challenge_passed':
    case 'system':
      return true;
    default:
      return true;
  }
}

/**
 * Creates a notification entity with validation.
 */
export function createNotificationEntity(params: CreateNotificationParams): Notification {
  if (!params.recipientId) {
    throw new DomainError('VALIDATION_FAILED', 'Recipient ID is required for notification.');
  }
  if (!params.title || params.title.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Notification title is required.');
  }
  if (!params.body || params.body.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Notification body is required.');
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    recipientId: params.recipientId,
    type: params.type,
    title: params.title.trim(),
    body: params.body.trim(),
    referenceType: params.referenceType || null,
    referenceId: params.referenceId || null,
    isRead: false,
    readAt: null,
    createdAt: now,
  };
}

/**
 * Marks target notifications as read.
 */
export function markNotificationsAsRead(
  notifications: Notification[],
  idsToMark?: string[]
): number {
  const now = new Date().toISOString();
  let count = 0;
  const targetIds = idsToMark ? new Set(idsToMark) : null;

  for (const n of notifications) {
    if (!targetIds || targetIds.has(n.id)) {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = now;
        count++;
      }
    }
  }

  return count;
}

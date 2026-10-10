import { DomainError } from './core.js';

/**
 * Every notification kind, at runtime: the database CHECK constraint
 * (migration 00044) is drift-checked against this list.
 */
export const NOTIFICATION_TYPES = [
  'message',
  'application_status',
  'application_received',
  'reference_received',
  'course_completion',
  'challenge_passed',
  'mention',
  'connection_request',
  'connection_accepted',
  'warm_intro_requested',
  'warm_intro_approved',
  'warm_intro_delivered',
  'warm_intro_declined',
  'referral_requested',
  'referral_approved',
  'referral_declined',
  'referral_forwarded',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

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
    case 'application_received':
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

/**
 * What a candidate is told when the hiring team moves their application.
 * Null for states the candidate caused (withdrawn) or that need no message.
 * Deliberately says nothing the candidate cannot already see on their
 * applications page — no private rejection reasons, no interviewer notes.
 */
export function candidateApplicationUpdate(
  status: string,
  jobTitle: string,
  companyName: string
): { title: string; body: string } | null {
  const role = `${jobTitle} at ${companyName}`;
  switch (status) {
    case 'in_review':
      return {
        title: `${jobTitle}: in review`,
        body: `The hiring team is reviewing your application for ${role}.`,
      };
    case 'shortlisted':
      return { title: `${jobTitle}: shortlisted`, body: `You were shortlisted for ${role}.` };
    case 'interviewing':
      return {
        title: `${jobTitle}: interviews`,
        body: `Your application for ${role} moved to interviews.`,
      };
    case 'offered':
      return { title: `${jobTitle}: offer`, body: `You have an offer for ${role}.` };
    case 'hired':
      return { title: `${jobTitle}: hired`, body: `Congratulations — you were hired for ${role}.` };
    case 'rejected':
      return {
        title: `${jobTitle}: not taken forward`,
        body: `The hiring team did not take your application for ${role} forward.`,
      };
    default:
      return null;
  }
}

/** Fired after the user reads notifications, so the header badge updates at once. */
export const NOTIFICATIONS_EVENT = 'talentsphere:notifications-changed';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceType?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

/** Where a notification takes you: the thing it is about. */
export function notificationTarget(n: AppNotification): string | null {
  switch (n.referenceType) {
    case 'job_application':
      return '/applications';
    case 'job':
      return n.referenceId ? `/hiring/jobs/${n.referenceId}` : '/hiring';
    case 'work_history':
      return '/evidence';
    default:
      return null;
  }
}

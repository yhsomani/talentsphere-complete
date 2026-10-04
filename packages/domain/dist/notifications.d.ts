export type NotificationType = 'message' | 'application_status' | 'course_completion' | 'challenge_passed' | 'mention' | 'connection_request' | 'connection_accepted' | 'warm_intro_requested' | 'warm_intro_approved' | 'warm_intro_delivered' | 'warm_intro_declined' | 'referral_requested' | 'referral_approved' | 'referral_declined' | 'referral_forwarded' | 'system';
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
export declare function createDefaultNotificationPreferences(userId: string): NotificationPreferences;
/**
 * Evaluates delivery eligibility against user notification preferences (BR-120).
 * System notifications are always delivered.
 */
export declare function shouldDeliverNotification(prefs: NotificationPreferences | undefined, type: NotificationType): boolean;
/**
 * Creates a notification entity with validation.
 */
export declare function createNotificationEntity(params: CreateNotificationParams): Notification;
/**
 * Marks target notifications as read.
 */
export declare function markNotificationsAsRead(notifications: Notification[], idsToMark?: string[]): number;
//# sourceMappingURL=notifications.d.ts.map
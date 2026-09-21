/**
 * Notification Service - Refactored Version
 * 
 * Data access layer for notification operations.
 * Handles all Supabase interactions for notifications and preferences.
 * Uses DatabaseAdapter for loose coupling and testability.
 */

import type { Database } from '@/types/database.types';
import { DatabaseAdapter } from '@/lib/database/adapter';
import { AppErrors, isAppError } from '@/lib/errors';

type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];
type PreferencesInsert = Database['public']['Tables']['notification_preferences']['Insert'];
type PreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update'];

export interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url: string | null;
  link_label: string | null;
  is_read: boolean;
  read_at: string | null;
  channel: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreferencesRecord {
  id?: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  application_updates: boolean;
  job_alerts: boolean;
  messages: boolean;
  system_announcements: boolean;
  gamification_updates: boolean;
  marketing_emails: boolean;
}

/**
 * NotificationService class with dependency injection
 */
export class NotificationService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Fetch all notifications for a given user
   */
  async getNotifications(userId: string): Promise<NotificationRecord[]> {
    try {
      const result = await this.db.list<any>('notifications', {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
        pagination: { orderBy: 'created_at', ascending: false },
      });

      if (result.error) {
        console.error('Error fetching notifications:', result.error);
        return [];
      }

      return (result.data || []) as NotificationRecord[];
    } catch (err) {
      console.error('Error in getNotifications:', err);
      const error = isAppError(err) ? err : AppErrors.UNKNOWN;
      throw error;
    }
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const result = await this.db.update<any>('notifications', notificationId, {
        is_read: true,
        read_at: new Date().toISOString(),
      });

      return !result.error;
    } catch (err) {
      console.error('Error in markAsRead:', err);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const result = await this.db.update('notifications', undefined, {
        is_read: true,
        read_at: new Date().toISOString(),
      }, {
        filters: [
          { field: 'user_id', operator: 'eq', value: userId },
          { field: 'is_read', operator: 'eq', value: false },
        ],
      });

      return !result.error;
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const result = await this.db.delete('notifications', notificationId);
      return !result.error;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferencesRecord> {
    const defaultPrefs: NotificationPreferencesRecord = {
      user_id: userId,
      email_enabled: true,
      push_enabled: false,
      in_app_enabled: true,
      application_updates: true,
      job_alerts: true,
      messages: true,
      system_announcements: true,
      gamification_updates: true,
      marketing_emails: false,
    };

    try {
      const result = await this.db.get<any>('notification_preferences', undefined, {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
      });

      if (result.error || !result.data) {
        return defaultPrefs;
      }

      return {
        ...defaultPrefs,
        ...result.data,
      };
    } catch {
      return defaultPrefs;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferencesRecord>
  ): Promise<NotificationPreferencesRecord | null> {
    try {
      const payload: PreferencesInsert = {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Check if preferences exist
      const existing = await this.db.get<any>('notification_preferences', undefined, {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
      });

      let result;
      if (existing.data) {
        result = await this.db.update<any>('notification_preferences', existing.data.id, payload);
      } else {
        result = await this.db.create<any>('notification_preferences', payload);
      }

      if (result.error) {
        console.error('Error updating preferences:', result.error);
        return null;
      }

      return result.data as NotificationPreferencesRecord;
    } catch (err) {
      console.error('Error in updatePreferences:', err);
      return null;
    }
  }

  /**
   * Create a notification (system / trigger helper)
   */
  async createNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    linkUrl?: string;
    linkLabel?: string;
    channel?: string;
    metadata?: Record<string, unknown>;
  }): Promise<NotificationRecord | null> {
    try {
      const insertData: NotificationInsert = {
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link_url: params.linkUrl || null,
        link_label: params.linkLabel || null,
        channel: params.channel || 'in_app',
        metadata: params.metadata || {},
        is_read: false,
      };

      const result = await this.db.create<any>('notifications', insertData);

      if (result.error) {
        console.error('Error creating notification:', result.error);
        return null;
      }

      return result.data as NotificationRecord;
    } catch (err) {
      console.error('Error in createNotification:', err);
      return null;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await this.db.list<any>('notifications', {
        filters: [
          { field: 'user_id', operator: 'eq', value: userId },
          { field: 'is_read', operator: 'eq', value: false },
        ],
      });

      if (result.error) {
        return 0;
      }

      return result.data?.length || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get recent notifications with pagination
   */
  async getRecentNotifications(userId: string, limit = 20): Promise<NotificationRecord[]> {
    try {
      const result = await this.db.list<any>('notifications', {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
        pagination: {
          page: 1,
          pageSize: limit,
          orderBy: 'created_at',
          ascending: false,
        },
      });

      if (result.error) {
        return [];
      }

      return (result.data || []) as NotificationRecord[];
    } catch (err) {
      console.error('Error in getRecentNotifications:', err);
      return [];
    }
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteReadNotifications(userId: string): Promise<boolean> {
    try {
      // Note: bulkDelete may need to be implemented in DatabaseAdapter
      // For now, we'll fetch and delete individually or use a workaround
      const readResult = await this.db.list<any>('notifications', {
        filters: [
          { field: 'user_id', operator: 'eq', value: userId },
          { field: 'is_read', operator: 'eq', value: true },
        ],
      });

      if (readResult.error || !readResult.data) {
        return false;
      }

      // Delete each notification (inefficient but works with current adapter)
      const deletePromises = readResult.data.map((n: any) => 
        this.db.delete('notifications', n.id)
      );

      await Promise.all(deletePromises);
      return true;
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      return false;
    }
  }

  /**
   * Mark multiple notifications as read by IDs
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<boolean> {
    try {
      const result = await this.db.update('notifications', undefined, {
        is_read: true,
        read_at: new Date().toISOString(),
      }, {
        filters: [{ field: 'id', operator: 'in', value: notificationIds }],
      });

      return !result.error;
    } catch (err) {
      console.error('Error marking multiple notifications as read:', err);
      return false;
    }
  }
}

// Backward compatible exports
let defaultNotificationService: NotificationService | null = null;

export function initNotificationService(db: DatabaseAdapter): NotificationService {
  defaultNotificationService = new NotificationService(db);
  return defaultNotificationService;
}

export const notificationService = new Proxy<NotificationService>({} as NotificationService, {
  get(_target, prop) {
    if (!defaultNotificationService) {
      throw new Error('NotificationService not initialized. Call initNotificationService() first.');
    }
    return (defaultNotificationService as any)[prop];
  },
});

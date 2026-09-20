import { createBrowserClient } from '@/lib/supabase';

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

const supabase = createBrowserClient();

export const notificationService = {
  /**
   * Fetch all notifications for a given user
   */
  async getNotifications(userId: string): Promise<NotificationRecord[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return (data || []) as NotificationRecord[];
    } catch (err) {
      console.error('Error in getNotifications:', err);
      return [];
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      return !error;
    } catch (err) {
      console.error('Error in markAsRead:', err);
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      return !error;
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
      return false;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return !error;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  },

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
      const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return defaultPrefs;
      }

      return {
        ...defaultPrefs,
        ...data,
      };
    } catch {
      return defaultPrefs;
    }
  },

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferencesRecord>
  ): Promise<NotificationPreferencesRecord | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .upsert(
          {
            user_id: userId,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select('*')
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        return null;
      }

      return data as NotificationPreferencesRecord;
    } catch (err) {
      console.error('Error in updatePreferences:', err);
      return null;
    }
  },

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
      const { data, error } = await (supabase as any)
        .from('notifications')
        .insert({
          user_id: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          link_url: params.linkUrl || null,
          link_label: params.linkLabel || null,
          channel: params.channel || 'in_app',
          metadata: params.metadata || {},
          is_read: false,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data as NotificationRecord;
    } catch (err) {
      console.error('Error in createNotification:', err);
      return null;
    }
  },
};

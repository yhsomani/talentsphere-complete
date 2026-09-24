-- TalentSphere Migration: 00007_notifications_schema.sql
-- Notification Center schema: notifications and notification_preferences with RLS.
-- Conforms to: F-14, BR-120.

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'application_status', 'course_completion', 'challenge_passed', 'mention', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 2. Notification Preferences Table (BR-120: mentions control)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  allow_messages BOOLEAN NOT NULL DEFAULT TRUE,
  allow_mentions BOOLEAN NOT NULL DEFAULT TRUE,
  allow_applications BOOLEAN NOT NULL DEFAULT TRUE,
  allow_course_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_digest_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (email_digest_frequency IN ('realtime', 'daily', 'weekly', 'never')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications RLS: Only the recipient profile can view or update notifications
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT USING (
    recipient_id = auth.uid()
  );

CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE USING (
    recipient_id = auth.uid()
  );

-- Notification Preferences RLS: Only owner profile can read and update preferences
CREATE POLICY notification_preferences_select_policy ON public.notification_preferences
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY notification_preferences_all_policy ON public.notification_preferences
  FOR ALL USING (
    user_id = auth.uid()
  );

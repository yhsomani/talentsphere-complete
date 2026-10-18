-- =============================================================================
-- TalentSphere 00047: Correct profile-owned RLS and fail closed on membership writes
--
-- The running application uses its own Fastify sessions and authorizes requests
-- server-side. These policies apply only to future/direct Supabase JWT access.
-- Never use a Supabase service-role credential in a browser.
-- =============================================================================

-- 00006/00007 used profile ids where auth.uid() is an auth USER id.
-- A user can own a profile only when profiles.user_id matches the validated
-- Supabase JWT subject. No claim, or no linked profile, means no access.

CREATE OR REPLACE FUNCTION public.is_message_thread_participant(target_thread_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.thread_participants AS tp
      JOIN public.profiles AS p ON p.id = tp.user_id
      WHERE tp.thread_id = target_thread_id
        AND p.user_id = auth.uid()
    );
$$;

-- The helper deliberately runs as the table owner: a SELECT policy that
-- queries thread_participants from itself would otherwise recurse forever.
-- It accepts a thread id, NEVER a caller-supplied user id.
REVOKE ALL ON FUNCTION public.is_message_thread_participant(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_message_thread_participant(UUID) TO authenticated;

DROP POLICY IF EXISTS message_threads_select_policy ON public.message_threads;
CREATE POLICY message_threads_select_policy ON public.message_threads
  FOR SELECT USING (public.is_message_thread_participant(id));

DROP POLICY IF EXISTS thread_participants_select_policy ON public.thread_participants;
CREATE POLICY thread_participants_select_policy ON public.thread_participants
  FOR SELECT USING (public.is_message_thread_participant(thread_id));

-- A client must never be able to self-join a guessed private thread UUID or
-- invite an arbitrary person. Only the API's validated conversation-creation
-- flow (database owner / server role) may create participants.
DROP POLICY IF EXISTS thread_participants_insert_policy ON public.thread_participants;
REVOKE INSERT ON public.thread_participants FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS messages_select_policy ON public.messages;
CREATE POLICY messages_select_policy ON public.messages
  FOR SELECT USING (public.is_message_thread_participant(thread_id));

DROP POLICY IF EXISTS messages_insert_policy ON public.messages;
CREATE POLICY messages_insert_policy ON public.messages
  FOR INSERT WITH CHECK (
    public.is_message_thread_participant(thread_id)
    AND EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = sender_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS notifications_select_policy ON public.notifications;
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = recipient_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS notifications_update_policy ON public.notifications;
CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = recipient_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = recipient_id AND p.user_id = auth.uid()
    )
  );

-- Direct JWT users can mark their notifications read, not rewrite message
-- bodies, recipient ids or notification metadata. The Fastify API retains its
-- server-side persistence path.
REVOKE UPDATE ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT UPDATE (is_read, read_at) ON public.notifications TO authenticated;

DROP POLICY IF EXISTS notification_preferences_all_policy ON public.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_select_policy ON public.notification_preferences;

CREATE POLICY notification_preferences_select_policy ON public.notification_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = user_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY notification_preferences_insert_policy ON public.notification_preferences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = user_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY notification_preferences_update_policy ON public.notification_preferences
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = user_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = user_id AND p.user_id = auth.uid()
    )
  );

-- Keep RLS enabled even if a legacy environment had disabled it manually.
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

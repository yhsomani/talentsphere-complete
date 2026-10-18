-- =============================================================================
-- TalentSphere 00048: Resolve notification preference owner against OUTER row
--
-- In 00047, unqualified "user_id" inside SELECT FROM public.profiles p
-- resolved to p.user_id (the inner relation), not the policy row's profile id.
-- Thus p.id = p.user_id matched nothing and even the owner was denied.
-- Always qualify correlated columns in RLS policy subqueries.
-- =============================================================================

DROP POLICY IF EXISTS notification_preferences_select_policy
  ON public.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_insert_policy
  ON public.notification_preferences;
DROP POLICY IF EXISTS notification_preferences_update_policy
  ON public.notification_preferences;

CREATE POLICY notification_preferences_select_policy
  ON public.notification_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = notification_preferences.user_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY notification_preferences_insert_policy
  ON public.notification_preferences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = notification_preferences.user_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY notification_preferences_update_policy
  ON public.notification_preferences
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = notification_preferences.user_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = notification_preferences.user_id
        AND p.user_id = auth.uid()
    )
  );

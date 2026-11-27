-- ============================================================================
-- Migration: 00064_moderation_people_are_users.sql
-- Description: Moderation reports and appeals are keyed by USER id (plan
--              TS-03): the API writes user ids and the 00017 RLS policies
--              compare reporter_id and appellant_id to the signed-in user. The 00017
--              foreign keys pointed at profiles(id), which would reject every
--              row the API writes. Re-point them at users(id), as 00043 did
--              for work history. Constraint changes only; no data changes.
-- ============================================================================

ALTER TABLE public.moderation_reports
  DROP CONSTRAINT IF EXISTS moderation_reports_reporter_id_fkey;
ALTER TABLE public.moderation_reports
  ADD CONSTRAINT moderation_reports_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.moderation_reports
  DROP CONSTRAINT IF EXISTS moderation_reports_resolved_by_fkey;
ALTER TABLE public.moderation_reports
  ADD CONSTRAINT moderation_reports_resolved_by_fkey
  FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.moderation_appeals
  DROP CONSTRAINT IF EXISTS moderation_appeals_appellant_id_fkey;
ALTER TABLE public.moderation_appeals
  ADD CONSTRAINT moderation_appeals_appellant_id_fkey
  FOREIGN KEY (appellant_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.moderation_appeals
  DROP CONSTRAINT IF EXISTS moderation_appeals_reviewed_by_fkey;
ALTER TABLE public.moderation_appeals
  ADD CONSTRAINT moderation_appeals_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;

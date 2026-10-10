-- =============================================================================
-- TalentSphere Database Migration 00044: Notifications become durable
--
-- Notifications were kept only in API process memory, so every restart erased
-- them — and nothing in the core loop sent one: a candidate was never told
-- their application moved, a hiring team never heard of a new applicant, and a
-- candidate never learned that a referee had vouched for them. The API now
-- writes notifications (and preference changes) through the same transaction
-- as the event that causes them (ADR-015 persist()).
--
-- Additive only. No rows are rewritten.
-- =============================================================================

-- 1. The 00007 CHECK allowed 6 of the domain's NotificationType values; every
--    other notification the API produces (connections, introductions,
--    referrals, and the new core-loop kinds) would have been rejected.
--    Kept in step with packages/domain/src/notifications.ts by
--    tests/unit/database-migrations.test.ts.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check CHECK (type IN (
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
    'system'
  ));

-- 2. The read path: a recipient's notifications, newest first.
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
  ON public.notifications (recipient_id, created_at DESC);

-- 3. Note on 00007's RLS policies: they compare recipient_id / user_id (profile
--    ids) to auth.uid() (a user id), so they match nothing for real users. The
--    API uses the service role and authorizes in code, so this does not affect
--    it; correcting the policies belongs with the RLS review (SECURITY.md §4),
--    not with this migration.

-- ============================================================================
-- Migration: 00057_connections_durable.sql
-- Description: The API now writes professional connections (00010) to
--              PostgreSQL (F-09, issue #48). Two adjustments make that possible:
--   1. 00010's UNIQUE (sender_id, recipient_id) forbids asking again after a
--      request was rejected or withdrawn, which the domain rule allows, and it
--      does not stop A->B and B->A being open at once. Replace it with a
--      unique index over the unordered pair that covers only open
--      (pending or accepted) connections. Closed rows stay as history.
--   2. The API role alone reads and writes connections (there is no Supabase
--      Auth, so the 00010 Supabase-session policies never match). Drop client-role
--      access, as 00053, 00055 and 00056 do. RLS stays enabled.
--              Idempotent; no data change.
-- ============================================================================

ALTER TABLE public.connections
  DROP CONSTRAINT IF EXISTS uq_connections_pair;

CREATE UNIQUE INDEX IF NOT EXISTS uq_connections_open_pair
  ON public.connections (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id))
  WHERE status IN ('pending', 'accepted');

REVOKE ALL ON public.connections FROM anon, authenticated;

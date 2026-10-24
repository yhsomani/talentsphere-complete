-- ============================================================================
-- Migration: 00055_certificate_revocations_rls.sql
-- Description: 00021 created certificate_revocations without Row Level
--              Security, so on a database where anon/authenticated hold default
--              table grants (hosted Supabase) anyone with the public key could
--              read and rewrite revocation records. The API role alone writes
--              them. Enable RLS (no client policy = deny) and drop client-role
--              access, as 00053 does for billing. Idempotent; no data change.
-- ============================================================================

ALTER TABLE public.certificate_revocations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.certificate_revocations FROM anon, authenticated;

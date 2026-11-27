-- ============================================================================
-- Migration: 00058_password_reset_tokens.sql
-- Description: Password reset (ADR-019). One row per reset link sent. Only
--              the SHA-256 hash of the token is stored; a token works once
--              (used_at) and for 30 minutes (expires_at). Rows go with the
--              account (ON DELETE CASCADE, and account erasure deletes them).
--              The API role alone reads and writes the table: RLS is enabled
--              with no client policy and client roles hold no grants.
--              New table only; no existing data changes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_created
  ON public.password_reset_tokens (user_id, created_at);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.password_reset_tokens FROM anon, authenticated;

-- =============================================================================
-- TalentSphere Database Migration 00046: Signing out ends the session
--
-- Session tokens are signed and stateless, so signing out used to delete only
-- the browser's copy: anyone who had copied the token kept a working session
-- until its 24-hour expiry (OWASP ASVS V3.3.1 asks logout to invalidate it).
-- Tokens now carry a random session id; POST /api/v1/auth/sign-out records it
-- here and resolveSession() refuses it on every request.
--
-- A row is useless once the token it names has expired, so the API deletes
-- expired rows whenever it records a new one, and loads only live rows at boot.
--
-- Additive only. Service-role only: no user-facing policy.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.revoked_sessions (
  session_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revoked_sessions_expires_at
  ON public.revoked_sessions (expires_at);

ALTER TABLE public.revoked_sessions ENABLE ROW LEVEL SECURITY;

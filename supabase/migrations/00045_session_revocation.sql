-- =============================================================================
-- TalentSphere Database Migration 00045: Sessions end when the password changes
--
-- Session tokens are signed and stateless, so until now nothing could end one
-- before its 24-hour expiry — not even the owner changing a password they
-- believe is compromised. The API now rejects any token issued before
-- users.sessions_valid_after (set by POST /api/v1/auth/password), checked on
-- every request by resolveSession().
--
-- Additive only: NULL (the default) means no session has been revoked.
-- =============================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sessions_valid_after TIMESTAMPTZ;

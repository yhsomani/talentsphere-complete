-- ============================================================================
-- Migration: 00059_files.sql
-- Description: Uploaded files (ADR-020). One row per file; the bytes live in
--              object storage under storage_key, never in the database. A
--              file belongs to one account (owner_id cascades on account
--              delete; account erasure also deletes the objects). Purpose,
--              type and size limits are checked by the API
--              (packages/domain/src/files.ts) and bounded here as well.
--              The API role alone reads and writes the table: RLS is enabled
--              with no client policy and client roles hold no grants.
--              New table only; no existing data changes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  purpose VARCHAR(32) NOT NULL CHECK (purpose IN ('resume', 'profile_photo', 'import')),
  content_type VARCHAR(128) NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  sha256 CHAR(64) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(255) NOT NULL UNIQUE,
  scan_status VARCHAR(16) NOT NULL CHECK (scan_status IN ('clean', 'not_scanned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_owner_created ON public.files (owner_id, created_at);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.files FROM anon, authenticated;

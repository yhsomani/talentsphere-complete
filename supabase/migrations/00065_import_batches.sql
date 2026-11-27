-- ============================================================================
-- Migration: 00065_import_batches.sql
-- Description: Profile import v1 (plan TS-08, ADR-033, blueprint FR-PRF-019).
--              One row per import: the entries parsed from a JSON Resume or
--              CSV template file, waiting for the user's review, then the
--              records they became. The raw file is never stored; items are
--              kept as one JSONB array because they are always read and
--              written with their batch (at most 300).
--              ready_for_review -> applied -> undone. An unconfirmed batch
--              is deleted after its review window.
--              The API role alone reads and writes the table: RLS is enabled
--              with no client policy and client roles hold no grants.
--              New table only; no existing data changes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source VARCHAR(32) NOT NULL CHECK (source IN (
    'json_resume', 'csv_positions', 'csv_education', 'csv_skills', 'csv_certifications'
  )),
  status VARCHAR(24) NOT NULL CHECK (status IN ('ready_for_review', 'applied', 'undone')),
  items JSONB NOT NULL CHECK (jsonb_typeof(items) = 'array'),
  ignored JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_expires_at TIMESTAMPTZ NOT NULL,
  applied_at TIMESTAMPTZ,
  undo_until TIMESTAMPTZ,
  undone_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CHECK ((status = 'ready_for_review') = (applied_at IS NULL)),
  CHECK ((status = 'undone') = (undone_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_import_batches_owner
  ON public.import_batches (owner_id, created_at DESC);

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.import_batches FROM anon, authenticated;

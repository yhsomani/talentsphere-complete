-- ============================================================================
-- Migration: 00060_skill_signals.sql
-- Description: The skill-signal ledger (plan TS-07, TPD-09). One row per
--              thing a source says about one skill of one person. Rows are
--              never edited in place: a change retires the source's live
--              rows (status superseded or revoked, retired_at) and inserts
--              the new set. The skill profile is computed from live rows
--              (packages/domain/src/skill-signals.ts) and is not stored.
--              The first source is evidence (source_ref = evidence id); the
--              API writes evidence signals in the same transaction as the
--              evidence, and at boot fills in any evidence that has none, so
--              existing evidence needs no data step here.
--              The API role alone reads and writes the table: RLS is enabled
--              with no client policy and client roles hold no grants.
--              New table only; no existing data changes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skill_signals (
  id UUID PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id),
  rung verification_level NOT NULL,
  source_module VARCHAR(32) NOT NULL CHECK (source_module IN ('evidence')),
  source_ref VARCHAR(64) NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'superseded', 'revoked')),
  retired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((status = 'live') = (retired_at IS NULL))
);

-- One live signal per source and skill; retired rows stay as history.
CREATE UNIQUE INDEX IF NOT EXISTS uq_skill_signals_live_source_skill
  ON public.skill_signals (source_module, source_ref, skill_id)
  WHERE status = 'live';
CREATE INDEX IF NOT EXISTS idx_skill_signals_subject_live
  ON public.skill_signals (subject_id)
  WHERE status = 'live';

ALTER TABLE public.skill_signals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.skill_signals FROM anon, authenticated;

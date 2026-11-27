-- ============================================================================
-- Migration: 00066_career_goals.sql
-- Description: Career goal v1 (plan TS-13, ADR-034). One row per person: the
--              role title they are aiming for. The skills it needs, the gaps
--              and the next steps are computed on read from live postings and
--              the person's skill signals, so nothing else is stored.
--              Private to its owner. The API role alone reads and writes the
--              table: RLS is enabled with no client policy and client roles
--              hold no grants.
--              New table only; no existing data changes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.career_goals (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(80) NOT NULL CHECK (char_length(title) >= 2),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.career_goals FROM anon, authenticated;

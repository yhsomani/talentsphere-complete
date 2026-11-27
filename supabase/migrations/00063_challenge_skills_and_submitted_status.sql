-- ============================================================================
-- Migration: 00063_challenge_skills_and_submitted_status.sql
-- Description: Lets coding challenges, assessment sessions and submissions be
--              stored (plan TS-03). A challenge's skills get a join table, as
--              courses have (00005). A submission may be 'submitted': code is
--              not executed yet, so that is the only status the evaluator
--              gives (D-01), and the 00004 check did not allow it. New table
--              and one widened check; no existing data changes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.challenge_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_challenge_skills_skill_id ON public.challenge_skills(skill_id);
ALTER TABLE public.challenge_skills ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.challenge_skills FROM anon, authenticated;

ALTER TABLE public.challenge_submissions
  DROP CONSTRAINT IF EXISTS challenge_submissions_status_check;
ALTER TABLE public.challenge_submissions
  ADD CONSTRAINT challenge_submissions_status_check
  CHECK (status IN ('submitted', 'passed', 'failed', 'compilation_error', 'runtime_error', 'timed_out'));

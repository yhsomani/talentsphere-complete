-- ============================================================================
-- Migration: 00061_job_experience_level.sql
-- Description: How much experience a job asks for (plan TS-09, finding P-07):
--              fresher, junior, mid or senior, matching EXPERIENCE_LEVELS in
--              packages/domain/src/jobs.ts. Optional, so existing jobs keep
--              NULL ("not stated"). New nullable column only; no existing
--              data changes.
-- ============================================================================

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_level TEXT;
DO $$ BEGIN
  ALTER TABLE public.jobs
    ADD CONSTRAINT chk_jobs_experience_level
    CHECK (experience_level IS NULL OR experience_level IN ('fresher', 'junior', 'mid', 'senior'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- TalentSphere Database Migration 00003: Jobs & ATS Applications Schema
-- Conforming to docs/engineering/DATABASE.md, BR-01..BR-42, and SSOT v6.0
-- =============================================================================

-- 1. Ensure metadata columns on jobs and job_applications
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_applications' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2. Job Skills Mapping Table
CREATE TABLE IF NOT EXISTS public.job_skills (
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, skill_id)
);

-- 3. Application Evidence Mapping Table (Attached verified evidence)
CREATE TABLE IF NOT EXISTS public.application_evidence (
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (application_id, evidence_id)
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON public.job_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_app_evidence_evidence ON public.application_evidence(evidence_id);

-- Enable RLS
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_evidence ENABLE ROW LEVEL SECURITY;

-- Job Skills RLS: Publicly readable for published jobs
CREATE POLICY job_skills_select_policy ON public.job_skills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_skills.job_id
        AND (j.status = 'published' OR auth.uid() IS NOT NULL)
    )
  );

-- Application Evidence RLS: Candidate owner or authorized recruiter
CREATE POLICY app_evidence_select_policy ON public.application_evidence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.job_applications ja
      JOIN public.profiles p ON p.id = ja.candidate_id
      WHERE ja.id = application_evidence.application_id
        AND (p.user_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.job_applications ja
      JOIN public.jobs j ON j.id = ja.job_id
      JOIN public.org_memberships om ON om.org_id = j.org_id
      WHERE ja.id = application_evidence.application_id
        AND om.user_id = auth.uid()
    )
  );

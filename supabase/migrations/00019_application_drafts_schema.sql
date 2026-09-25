-- TalentSphere — Migration 00019: Application Drafts & Autosave Schema (F-36, BR-18, SSOT 1015)
-- Supports recoverable autosaving of job application drafts with version retention.

CREATE TABLE IF NOT EXISTS public.application_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  answers JSONB DEFAULT '{}'::jsonb NOT NULL,
  attached_evidence_ids UUID[] DEFAULT '{}'::uuid[] NOT NULL,
  step_index INTEGER DEFAULT 0 NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  is_submitted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_cover_letter_length CHECK (cover_letter IS NULL OR char_length(cover_letter) <= 5000),
  CONSTRAINT uq_candidate_job_draft UNIQUE (candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS public.application_draft_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES public.application_drafts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  cover_letter TEXT,
  answers JSONB DEFAULT '{}'::jsonb NOT NULL,
  attached_evidence_ids UUID[] DEFAULT '{}'::uuid[] NOT NULL,
  step_index INTEGER NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_draft_version UNIQUE (draft_id, version)
);

CREATE INDEX IF NOT EXISTS idx_application_drafts_candidate ON public.application_drafts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_application_drafts_job ON public.application_drafts(job_id);
CREATE INDEX IF NOT EXISTS idx_application_draft_versions_draft ON public.application_draft_versions(draft_id);

-- RLS: Private to candidate only (BR-19: recruiters never see drafts prior to submission)
ALTER TABLE public.application_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_draft_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates manage own application drafts"
  ON public.application_drafts
  FOR ALL
  TO authenticated
  USING (candidate_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (candidate_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Candidates view own draft version history"
  ON public.application_draft_versions
  FOR ALL
  TO authenticated
  USING (draft_id IN (
    SELECT id FROM public.application_drafts
    WHERE candidate_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  ))
  WITH CHECK (draft_id IN (
    SELECT id FROM public.application_drafts
    WHERE candidate_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  ));

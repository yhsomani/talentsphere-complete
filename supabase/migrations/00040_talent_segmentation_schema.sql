-- Migration 00040: Talent Segmentation & Classification Schema (F-160, F-84, F-85, F-144, BR-200)

CREATE TABLE IF NOT EXISTS public.candidate_segmentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialization VARCHAR(50) NOT NULL DEFAULT 'generalist',
    seniority_tier VARCHAR(30) NOT NULL DEFAULT 'entry',
    engagement_segment VARCHAR(30) NOT NULL DEFAULT 'open',
    readiness_band VARCHAR(30) NOT NULL DEFAULT 'unassessed',
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (confidence_score BETWEEN 0.00 AND 100.00),
    primary_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    years_of_experience NUMERIC(4, 1) NOT NULL DEFAULT 0.0 CHECK (years_of_experience >= 0.0),
    classified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidate_segmentation UNIQUE(candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_segmentation_specialization ON public.candidate_segmentations(specialization);
CREATE INDEX IF NOT EXISTS idx_segmentation_seniority ON public.candidate_segmentations(seniority_tier);
CREATE INDEX IF NOT EXISTS idx_segmentation_engagement ON public.candidate_segmentations(engagement_segment);
CREATE INDEX IF NOT EXISTS idx_segmentation_readiness ON public.candidate_segmentations(readiness_band);
CREATE INDEX IF NOT EXISTS idx_segmentation_confidence ON public.candidate_segmentations(confidence_score DESC);

ALTER TABLE public.candidate_segmentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY candidate_segmentations_self_read ON public.candidate_segmentations
    FOR SELECT
    USING (candidate_id = auth.uid());

CREATE POLICY candidate_segmentations_recruiter_read ON public.candidate_segmentations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'recruiter')
        )
    );

CREATE POLICY candidate_segmentations_admin_write ON public.candidate_segmentations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND 'platform_admin' = ANY(roles)
        )
    );

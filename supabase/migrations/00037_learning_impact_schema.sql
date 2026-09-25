-- Migration 00037: Learning Impact Dashboard & Outcome Correlation Schema (F-153, F-114, BR-189..BR-193, OD-51)

CREATE TABLE IF NOT EXISTS public.learning_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hired_within_12m BOOLEAN NOT NULL DEFAULT false,
    salary_growth_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    job_satisfaction_score NUMERIC(3, 1) CHECK (job_satisfaction_score BETWEEN 1.0 AND 5.0),
    retention_months INT NOT NULL DEFAULT 0 CHECK (retention_months >= 0),
    promoted_within_18m BOOLEAN NOT NULL DEFAULT false,
    skills_used_on_job JSONB NOT NULL DEFAULT '[]'::jsonb,
    consent_flag BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    cohort_size INT NOT NULL DEFAULT 0 CHECK (cohort_size >= 0),
    completion_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    hire_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    avg_salary_delta_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    avg_job_satisfaction NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    retention_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    advancement_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    skill_utilization_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    path_effectiveness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (path_effectiveness_score BETWEEN 0 AND 100),
    correlational_claim_label TEXT NOT NULL DEFAULT 'Correlational finding based on observational learner data. Not causal.',
    sample_count INT NOT NULL DEFAULT 0 CHECK (sample_count >= 0),
    is_publishable BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_course ON public.learning_outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_user ON public.learning_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_impact_metrics_course ON public.learning_impact_metrics(course_id);

-- Row Level Security
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_impact_metrics ENABLE ROW LEVEL SECURITY;

-- BR-190: Individual learner outcomes are never exposed without consent (user isolation)
CREATE POLICY learning_outcomes_owner_isolation ON public.learning_outcomes
    FOR ALL
    USING (user_id = auth.uid());

-- BR-189: Course outcome correlation requires >= 30 enrolled learners with measurable outcomes to publish
CREATE POLICY learning_impact_metrics_select ON public.learning_impact_metrics
    FOR SELECT
    USING (sample_count >= 30 OR is_publishable = true);

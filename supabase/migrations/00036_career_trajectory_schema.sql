-- Migration 00036: Career Trajectory Analysis & Progression Benchmarks Schema (F-152, F-85, BR-157..BR-163)

CREATE TABLE IF NOT EXISTS public.career_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    from_role TEXT NOT NULL,
    to_role TEXT NOT NULL,
    from_company_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    to_company_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    transition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary_delta NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    time_in_role_months INT NOT NULL CHECK (time_in_role_months >= 1),
    consent_flag BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progression_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_role TEXT NOT NULL,
    to_role TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'Technology',
    sample_count INT NOT NULL DEFAULT 0 CHECK (sample_count >= 0),
    transition_probability NUMERIC(4, 3) NOT NULL CHECK (transition_probability BETWEEN 0 AND 1),
    median_time_months NUMERIC(5, 1) NOT NULL,
    median_salary_delta NUMERIC(12, 2) NOT NULL,
    salary_growth_pct NUMERIC(5, 2) NOT NULL,
    confidence_level NUMERIC(4, 3) NOT NULL DEFAULT 0.950,
    success_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    retention_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(from_role, to_role, industry)
);

CREATE TABLE IF NOT EXISTS public.career_milestone_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    overall_readiness_score NUMERIC(5, 2) NOT NULL CHECK (overall_readiness_score BETWEEN 0 AND 100),
    skills_overlap_pct NUMERIC(5, 2) NOT NULL,
    experience_readiness_pct NUMERIC(5, 2) NOT NULL,
    education_readiness_pct NUMERIC(5, 2) NOT NULL,
    missing_prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performant progression queries
CREATE INDEX IF NOT EXISTS idx_career_transitions_user ON public.career_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_career_transitions_roles ON public.career_transitions(from_role, to_role);
CREATE INDEX IF NOT EXISTS idx_progression_benchmarks_lookup ON public.progression_benchmarks(from_role, to_role);
CREATE INDEX IF NOT EXISTS idx_milestone_evaluations_user ON public.career_milestone_evaluations(user_id, target_role);

-- Row Level Security
ALTER TABLE public.career_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestone_evaluations ENABLE ROW LEVEL SECURITY;

-- BR-159: Individual career transitions visible only to the user
CREATE POLICY career_transitions_user_isolation ON public.career_transitions
    FOR ALL
    USING (user_id = auth.uid());

-- BR-160: Progression benchmarks by role require >= 20 data points to publish
CREATE POLICY progression_benchmarks_select_public ON public.progression_benchmarks
    FOR SELECT
    USING (sample_count >= 20);

-- Candidate milestone evaluations visible only to candidate
CREATE POLICY career_milestone_evaluations_owner ON public.career_milestone_evaluations
    FOR ALL
    USING (user_id = auth.uid());

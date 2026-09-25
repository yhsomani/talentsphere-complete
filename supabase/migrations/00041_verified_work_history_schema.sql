-- Migration 00041: Verified Work History Network & References Schema (F-162, F-94, F-84)
-- Conforming to docs/engineering/DATABASE.md and SSOT v6.0

-- 1. Verified Work Histories Table
CREATE TABLE IF NOT EXISTS public.verified_work_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    company_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time',
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    corporate_email VARCHAR(255),
    email_verified_at TIMESTAMPTZ,
    verification_status VARCHAR(40) NOT NULL DEFAULT 'unverified',
    verification_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    badge_tier VARCHAR(20) NOT NULL DEFAULT 'none',
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_work_history_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_work_history_score CHECK (verification_score BETWEEN 0.00 AND 100.00),
    CONSTRAINT chk_work_history_badge CHECK (badge_tier IN ('none', 'bronze', 'silver', 'gold')),
    CONSTRAINT chk_work_history_status CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'disputed', 'rejected')),
    CONSTRAINT chk_work_history_emp_type CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance'))
);

CREATE INDEX IF NOT EXISTS idx_work_history_candidate ON public.verified_work_histories(candidate_id);
CREATE INDEX IF NOT EXISTS idx_work_history_company ON public.verified_work_histories(company_id);
CREATE INDEX IF NOT EXISTS idx_work_history_status ON public.verified_work_histories(verification_status);
CREATE INDEX IF NOT EXISTS idx_work_history_badge ON public.verified_work_histories(badge_tier);
CREATE INDEX IF NOT EXISTS idx_work_history_dates ON public.verified_work_histories(start_date, end_date);

-- 2. Employment References Table (Referee System)
CREATE TABLE IF NOT EXISTS public.employment_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_history_id UUID NOT NULL REFERENCES public.verified_work_histories(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referee_name VARCHAR(150) NOT NULL,
    referee_email VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'requested',
    confirm_dates BOOLEAN,
    confirm_title BOOLEAN,
    ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
    endorsed_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary_notes TEXT,
    token VARCHAR(100),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ref_relationship CHECK (relationship IN ('manager', 'peer', 'direct_report', 'mentor', 'client')),
    CONSTRAINT chk_ref_status CHECK (status IN ('requested', 'submitted', 'declined', 'flagged'))
);

CREATE INDEX IF NOT EXISTS idx_references_work_history ON public.employment_references(work_history_id);
CREATE INDEX IF NOT EXISTS idx_references_candidate ON public.employment_references(candidate_id);
CREATE INDEX IF NOT EXISTS idx_references_referee ON public.employment_references(referee_id);
CREATE INDEX IF NOT EXISTS idx_references_status ON public.employment_references(status);

-- 3. Row Level Security Policies
ALTER TABLE public.verified_work_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_references ENABLE ROW LEVEL SECURITY;

-- Candidates can view and manage their own work histories
CREATE POLICY work_histories_candidate_all ON public.verified_work_histories
    FOR ALL
    USING (candidate_id = auth.uid())
    WITH CHECK (candidate_id = auth.uid());

-- Recruiters and employers can view verified work histories
CREATE POLICY work_histories_recruiter_read ON public.verified_work_histories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'recruiter', 'employer')
        )
    );

-- Platform admins have full management access
CREATE POLICY work_histories_admin_all ON public.verified_work_histories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND 'platform_admin' = ANY(roles)
        )
    );

-- References: Candidates can view references requested for their work histories
CREATE POLICY references_candidate_read ON public.employment_references
    FOR SELECT
    USING (candidate_id = auth.uid());

-- References: Referees can view and submit their references
CREATE POLICY references_referee_access ON public.employment_references
    FOR ALL
    USING (referee_id = auth.uid())
    WITH CHECK (referee_id = auth.uid());

-- Recruiters can view submitted references
CREATE POLICY references_recruiter_read ON public.employment_references
    FOR SELECT
    USING (
        status = 'submitted' AND
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'recruiter', 'employer')
        )
    );

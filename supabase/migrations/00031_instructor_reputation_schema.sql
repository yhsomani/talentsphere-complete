-- Migration 00031: Instructor Reputation System Schema (F-148, F-72, F-144)

CREATE TABLE IF NOT EXISTS public.instructor_reputation_breakdown (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    composite_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (composite_score BETWEEN 0 AND 100),
    band TEXT NOT NULL CHECK (band IN ('exceptional', 'high', 'established', 'developing', 'emerging')),
    course_quality_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (course_quality_score BETWEEN 0 AND 100),
    teaching_effectiveness_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (teaching_effectiveness_score BETWEEN 0 AND 100),
    currency_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (currency_score BETWEEN 0 AND 100),
    responsiveness_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (responsiveness_score BETWEEN 0 AND 100),
    community_standing_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00 CHECK (community_standing_score BETWEEN 0 AND 100),
    review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    completion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (completion_rate BETWEEN 0 AND 100),
    avg_qa_response_hours NUMERIC(6, 2) NOT NULL DEFAULT 24.00 CHECK (avg_qa_response_hours >= 0),
    endorsement_count INT NOT NULL DEFAULT 0 CHECK (endorsement_count >= 0),
    courses_count INT NOT NULL DEFAULT 0 CHECK (courses_count >= 0),
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(instructor_id)
);

CREATE TABLE IF NOT EXISTS public.instructor_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_domain TEXT NOT NULL DEFAULT 'general',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(instructor_id, endorser_id, skill_domain),
    CHECK (instructor_id != endorser_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instructor_reputation_user ON public.instructor_reputation_breakdown(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_endorsements_inst ON public.instructor_endorsements(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_endorsements_endorser ON public.instructor_endorsements(endorser_id);

-- Enable Row Level Security
ALTER TABLE public.instructor_reputation_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_endorsements ENABLE ROW LEVEL SECURITY;

-- Transparent Public Access: Any authenticated user can view instructor reputation factors
CREATE POLICY instructor_reputation_public_select ON public.instructor_reputation_breakdown
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only platform admins or system service workers can directly modify reputation breakdown table
CREATE POLICY instructor_reputation_admin_all ON public.instructor_reputation_breakdown
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND ('platform_admin' = ANY(u.roles) OR 'service_account' = ANY(u.roles))
        )
    );

-- Endorsements: Any authenticated instructor or admin can read endorsements
CREATE POLICY instructor_endorsements_select ON public.instructor_endorsements
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Endorsements: Qualified instructors can insert endorsements for peers
CREATE POLICY instructor_endorsements_insert ON public.instructor_endorsements
    FOR INSERT
    WITH CHECK (
        auth.uid() = endorser_id AND
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND ('instructor' = ANY(u.roles) OR 'course_author' = ANY(u.roles) OR 'platform_admin' = ANY(u.roles))
        )
    );

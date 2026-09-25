-- Migration 00039: Behavioral Talent Discovery Schema (F-159, F-146, F-130, F-150)

CREATE TABLE IF NOT EXISTS public.behavioral_talent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (activity_score BETWEEN 0.00 AND 100.00),
    reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (reputation_score BETWEEN 0.00 AND 100.00),
    peer_credibility_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (peer_credibility_score BETWEEN 0.00 AND 100.00),
    learning_velocity_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (learning_velocity_score BETWEEN 0.00 AND 100.00),
    emerging_expertise_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (emerging_expertise_score BETWEEN 0.00 AND 100.00),
    composite_behavioral_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (composite_behavioral_score BETWEEN 0.00 AND 100.00),
    highlighted_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    verified_endorsements_count INT NOT NULL DEFAULT 0 CHECK (verified_endorsements_count >= 0),
    recent_activity_count INT NOT NULL DEFAULT 0 CHECK (recent_activity_count >= 0),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_behavioral_profile_candidate UNIQUE(candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_behavioral_composite_score ON public.behavioral_talent_profiles(composite_behavioral_score DESC);
CREATE INDEX IF NOT EXISTS idx_behavioral_activity_score ON public.behavioral_talent_profiles(activity_score DESC);
CREATE INDEX IF NOT EXISTS idx_behavioral_last_active ON public.behavioral_talent_profiles(last_active_at);

ALTER TABLE public.behavioral_talent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY behavioral_profiles_self_read ON public.behavioral_talent_profiles
    FOR SELECT
    USING (candidate_id = auth.uid());

CREATE POLICY behavioral_profiles_recruiter_read ON public.behavioral_talent_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'recruiter')
        )
    );

CREATE POLICY behavioral_profiles_admin_write ON public.behavioral_talent_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND 'platform_admin' = ANY(roles)
        )
    );

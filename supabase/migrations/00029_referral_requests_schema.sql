-- Migration 00029: Referral Request System Schema (F-142, S-11, BR-233..BR-240)

CREATE TABLE IF NOT EXISTS public.referral_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    pitch VARCHAR(300) NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'forwarded', 'declined', 'expired')),
    decline_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_request_id UUID NOT NULL REFERENCES public.referral_requests(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'referred' CHECK (status IN ('referred', 'interviewing', 'hired', 'rejected')),
    attribution_expires_at TIMESTAMPTZ NOT NULL, -- BR-240: 12-month attribution window
    reward_xp INTEGER NOT NULL DEFAULT 500,     -- BR-236: Default XP reward
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_requests_candidate ON public.referral_requests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_referrer ON public.referral_requests(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_job ON public.referral_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_org ON public.referral_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_referral_outcomes_candidate ON public.referral_outcomes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_referral_outcomes_referrer ON public.referral_outcomes(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_outcomes_job ON public.referral_outcomes(job_id);
CREATE INDEX IF NOT EXISTS idx_referral_outcomes_org ON public.referral_outcomes(org_id);

-- Row Level Security
ALTER TABLE public.referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_requests_candidate_select ON public.referral_requests
    FOR SELECT
    USING (candidate_id = auth.uid() OR referrer_id = auth.uid());

CREATE POLICY referral_requests_candidate_insert ON public.referral_requests
    FOR INSERT
    WITH CHECK (candidate_id = auth.uid());

CREATE POLICY referral_requests_referrer_update ON public.referral_requests
    FOR UPDATE
    USING (referrer_id = auth.uid());

CREATE POLICY referral_outcomes_participant_select ON public.referral_outcomes
    FOR SELECT
    USING (
        candidate_id = auth.uid() OR
        referrer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.organization_memberships m
            WHERE m.org_id = referral_outcomes.org_id AND m.user_id = auth.uid()
        )
    );

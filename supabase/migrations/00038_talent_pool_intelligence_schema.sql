-- Migration 00038: Talent Pool Intelligence & Analytics Schema (F-158, F-92, BR-200, BR-201)

CREATE TABLE IF NOT EXISTS public.talent_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_role TEXT,
    target_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.talent_pool_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES public.talent_pools(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('search', 'referral', 'inbound_application', 'alumni', 'outreach')),
    status TEXT NOT NULL DEFAULT 'sourced' CHECK (status IN ('sourced', 'contacted', 'screening', 'interviewing', 'offered', 'hired', 'archived')),
    cost_minor_units INT NOT NULL DEFAULT 0 CHECK (cost_minor_units >= 0),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contacted_at TIMESTAMPTZ,
    interviewed_at TIMESTAMPTZ,
    offered_at TIMESTAMPTZ,
    hired_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT uq_talent_pool_candidate UNIQUE(pool_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_talent_pools_org_id ON public.talent_pools(org_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_pool_id ON public.talent_pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_org_id ON public.talent_pool_members(org_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_candidate_id ON public.talent_pool_members(candidate_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_status ON public.talent_pool_members(status);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_source ON public.talent_pool_members(source);

ALTER TABLE public.talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pool_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY talent_pools_org_read ON public.talent_pools
    FOR SELECT
    USING (
        org_id IN (
            SELECT organization_id FROM public.memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY talent_pools_org_write ON public.talent_pools
    FOR ALL
    USING (
        org_id IN (
            SELECT organization_id FROM public.memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'recruiter')
        )
    );

CREATE POLICY talent_pool_members_org_read ON public.talent_pool_members
    FOR SELECT
    USING (
        org_id IN (
            SELECT organization_id FROM public.memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY talent_pool_members_org_write ON public.talent_pool_members
    FOR ALL
    USING (
        org_id IN (
            SELECT organization_id FROM public.memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'recruiter')
        )
    );

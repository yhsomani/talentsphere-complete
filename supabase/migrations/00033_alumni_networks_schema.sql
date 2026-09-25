-- Migration 00033: Alumni Networks Schema (F-125, F-12, F-09, F-40)

CREATE TABLE IF NOT EXISTS public.alumni_affiliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    degree_type TEXT NOT NULL CHECK (degree_type IN ('bachelors', 'masters', 'phd', 'bootcamp', 'certification', 'other')),
    field_of_study TEXT NOT NULL,
    graduation_year INT NOT NULL CHECK (graduation_year BETWEEN 1950 AND 2050),
    verification_method TEXT NOT NULL CHECK (verification_method IN ('email_domain', 'institutional_seat', 'manual_review', 'unverified')),
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, institution_id, degree_type, graduation_year)
);

CREATE TABLE IF NOT EXISTS public.alumni_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    chapter_location TEXT NOT NULL DEFAULT 'Global',
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alumni_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.alumni_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.alumni_mentorship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'active', 'completed', 'declined')),
    focus_areas TEXT[] NOT NULL DEFAULT '{}',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    CHECK (mentor_id != mentee_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alumni_affiliations_user ON public.alumni_affiliations(user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_affiliations_inst ON public.alumni_affiliations(institution_id);
CREATE INDEX IF NOT EXISTS idx_alumni_affiliations_lookup ON public.alumni_affiliations(institution_id, verification_status, graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_groups_inst ON public.alumni_groups(institution_id);
CREATE INDEX IF NOT EXISTS idx_alumni_group_members_group ON public.alumni_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_alumni_mentorship_lookup ON public.alumni_mentorship(institution_id, mentor_id, mentee_id);

-- Row Level Security
ALTER TABLE public.alumni_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_mentorship ENABLE ROW LEVEL SECURITY;

-- Affiliations: Users can view their own, or members with verified affiliation at the same institution can discover alumni
CREATE POLICY alumni_affiliations_own_select ON public.alumni_affiliations
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.alumni_affiliations my_aff
            WHERE my_aff.user_id = auth.uid()
              AND my_aff.institution_id = public.alumni_affiliations.institution_id
              AND my_aff.verification_status = 'verified'
        )
    );

CREATE POLICY alumni_affiliations_own_insert ON public.alumni_affiliations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Groups: Isolated by institution
CREATE POLICY alumni_groups_inst_select ON public.alumni_groups
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.alumni_affiliations a
            WHERE a.user_id = auth.uid()
              AND a.institution_id = public.alumni_groups.institution_id
              AND a.verification_status = 'verified'
        )
    );

-- Mentorship: Participants only
CREATE POLICY alumni_mentorship_participants_select ON public.alumni_mentorship
    FOR SELECT
    USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Migration 00032: Peer Credibility Networks & Skill Endorsements Schema (F-150, F-110, F-144)

CREATE TABLE IF NOT EXISTS public.skill_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'disputed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    UNIQUE(recipient_id, endorser_id, skill_id),
    CHECK (recipient_id != endorser_id)
);

CREATE TABLE IF NOT EXISTS public.endorsement_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorsement_id UUID NOT NULL REFERENCES public.skill_endorsements(id) ON DELETE CASCADE,
    endorser_credibility NUMERIC(4, 3) NOT NULL CHECK (endorser_credibility BETWEEN 0.0 AND 1.0),
    network_distance INT NOT NULL CHECK (network_distance >= 1),
    distance_factor NUMERIC(4, 3) NOT NULL CHECK (distance_factor BETWEEN 0.0 AND 1.0),
    specialization_multiplier NUMERIC(4, 3) NOT NULL CHECK (specialization_multiplier >= 1.0),
    track_record_multiplier NUMERIC(4, 3) NOT NULL CHECK (track_record_multiplier BETWEEN 0.5 AND 1.5),
    is_reciprocal_dampened BOOLEAN NOT NULL DEFAULT false,
    final_weight NUMERIC(5, 3) NOT NULL CHECK (final_weight BETWEEN 0.05 AND 2.0),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(endorsement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_recip ON public.skill_endorsements(recipient_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_endorser ON public.skill_endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill ON public.skill_endorsements(skill_id);
CREATE INDEX IF NOT EXISTS idx_endorsement_weights_endorsement ON public.endorsement_weights(endorsement_id);

-- Enable Row Level Security
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsement_weights ENABLE ROW LEVEL SECURITY;

-- Public Visibility: All authenticated users can view endorsements and weights
CREATE POLICY skill_endorsements_public_select ON public.skill_endorsements
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY endorsement_weights_public_select ON public.endorsement_weights
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Create Endorsement: Authenticated users can endorse peers
CREATE POLICY skill_endorsements_owner_insert ON public.skill_endorsements
    FOR INSERT
    WITH CHECK (auth.uid() = endorser_id AND endorser_id != recipient_id);

-- Revoke Endorsement: Endorser can revoke within 30 days
CREATE POLICY skill_endorsements_owner_update ON public.skill_endorsements
    FOR UPDATE
    USING (auth.uid() = endorser_id);

-- Endorsement Weights: Service/Admin managed
CREATE POLICY endorsement_weights_admin_all ON public.endorsement_weights
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND ('platform_admin' = ANY(u.roles) OR 'service_account' = ANY(u.roles))
        )
    );

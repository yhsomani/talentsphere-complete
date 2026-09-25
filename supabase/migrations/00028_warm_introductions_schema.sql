-- Migration 00028: Warm Introduction Paths Schema (F-121, S-11, BR-209..BR-216)

CREATE TABLE IF NOT EXISTS public.warm_introduction_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    opt_out_introducer BOOLEAN NOT NULL DEFAULT false,
    block_all_incoming_intros BOOLEAN NOT NULL DEFAULT false,
    blocked_user_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warm_introduction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    introducer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    note TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_introducer' CHECK (status IN ('pending_introducer', 'approved', 'declined', 'completed', 'cancelled')),
    decline_reason TEXT,
    thread_id UUID,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warm_intro_requester ON public.warm_introduction_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_warm_intro_target ON public.warm_introduction_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_warm_intro_introducer ON public.warm_introduction_requests(introducer_user_id);
CREATE INDEX IF NOT EXISTS idx_warm_intro_status ON public.warm_introduction_requests(status);

-- Row Level Security
ALTER TABLE public.warm_introduction_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warm_introduction_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY warm_intro_prefs_owner_all ON public.warm_introduction_preferences
    FOR ALL
    USING (user_id = auth.uid());

-- Warm intro requests: visible to requester, introducer, and target (once approved/delivered)
CREATE POLICY warm_intro_requests_participant_select ON public.warm_introduction_requests
    FOR SELECT
    USING (
        requester_user_id = auth.uid() OR
        introducer_user_id = auth.uid() OR
        (target_user_id = auth.uid() AND status IN ('approved', 'completed'))
    );

CREATE POLICY warm_intro_requests_requester_insert ON public.warm_introduction_requests
    FOR INSERT
    WITH CHECK (requester_user_id = auth.uid());

CREATE POLICY warm_intro_requests_introducer_update ON public.warm_introduction_requests
    FOR UPDATE
    USING (
        introducer_user_id = auth.uid() OR
        requester_user_id = auth.uid()
    );

-- Migration 00027: Multi-Context Reputation Engine Schema (F-144, S-03, BR-247..BR-254)

CREATE TABLE IF NOT EXISTS public.reputation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    context TEXT NOT NULL CHECK (context IN ('candidate', 'instructor', 'employer', 'peer', 'community', 'mentor')),
    domain TEXT NOT NULL DEFAULT 'general',
    score NUMERIC(6, 2) NOT NULL DEFAULT 50.00 CHECK (score BETWEEN 0 AND 100),
    band TEXT NOT NULL CHECK (band IN ('exceptional', 'high', 'established', 'developing', 'emerging')),
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 0.50 CHECK (confidence_score BETWEEN 0 AND 1),
    signal_count INT NOT NULL DEFAULT 0,
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, context, domain)
);

CREATE TABLE IF NOT EXISTS public.reputation_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    source_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    context TEXT NOT NULL CHECK (context IN ('candidate', 'instructor', 'employer', 'peer', 'community', 'mentor')),
    domain TEXT NOT NULL DEFAULT 'general',
    signal_type TEXT NOT NULL CHECK (signal_type IN ('credential', 'endorsement', 'review', 'contribution', 'peer_feedback', 'assessment', 'penalty')),
    raw_value NUMERIC(6, 2) NOT NULL,
    weight NUMERIC(4, 2) NOT NULL DEFAULT 1.00 CHECK (weight BETWEEN 0 AND 5),
    decay_half_life_days INT NOT NULL DEFAULT 365,
    evidence_reference_id UUID,
    notes TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    context TEXT NOT NULL,
    domain TEXT NOT NULL,
    previous_score NUMERIC(6, 2) NOT NULL,
    new_score NUMERIC(6, 2) NOT NULL,
    reason TEXT NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reputation_recovery_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    context TEXT NOT NULL,
    penalty_signal_id UUID REFERENCES public.reputation_signals(id) ON DELETE CASCADE,
    target_rebound_points NUMERIC(6, 2) NOT NULL,
    rebound_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reputation_scores_user ON public.reputation_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_lookup ON public.reputation_scores(user_id, context, domain);
CREATE INDEX IF NOT EXISTS idx_reputation_signals_user ON public.reputation_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_signals_type ON public.reputation_signals(context, domain, signal_type);
CREATE INDEX IF NOT EXISTS idx_reputation_history_user ON public.reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_recovery_user ON public.reputation_recovery_plans(user_id);

-- Row Level Security
ALTER TABLE public.reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_recovery_plans ENABLE ROW LEVEL SECURITY;

-- Reputation scores: aggregate public query for all authenticated users
CREATE POLICY reputation_scores_public_select ON public.reputation_scores
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY reputation_scores_admin_modify ON public.reputation_scores
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND 'platform_admin' = ANY(u.roles)
        )
    );

-- Reputation signals: private to the owner only (Zero individual signal leakage)
CREATE POLICY reputation_signals_owner_select ON public.reputation_signals
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY reputation_signals_owner_insert ON public.reputation_signals
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Reputation history: private to owner
CREATE POLICY reputation_history_owner_select ON public.reputation_history
    FOR SELECT
    USING (user_id = auth.uid());

-- Reputation recovery plans: private to owner
CREATE POLICY reputation_recovery_owner_all ON public.reputation_recovery_plans
    FOR ALL
    USING (user_id = auth.uid());

-- Migration 00030: Activity & Contribution Tracking Schema (F-146, S-09)

CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('learning', 'creation', 'collaboration', 'social')),
    activity_type VARCHAR(100) NOT NULL,
    weight NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contribution_scores (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    composite_score INTEGER NOT NULL DEFAULT 0 CHECK (composite_score >= 0 AND composite_score <= 100),
    engagement_band TEXT NOT NULL CHECK (engagement_band IN ('passive', 'active', 'power_contributor', 'luminary')),
    learning_score INTEGER NOT NULL DEFAULT 0,
    creation_score INTEGER NOT NULL DEFAULT 0,
    collaboration_score INTEGER NOT NULL DEFAULT 0,
    social_score INTEGER NOT NULL DEFAULT 0,
    active_streak_days INTEGER NOT NULL DEFAULT 0,
    total_events_count INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_events_user ON public.activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_category ON public.activity_events(category);
CREATE INDEX IF NOT EXISTS idx_activity_events_occurred_at ON public.activity_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_contribution_scores_band ON public.contribution_scores(engagement_band);

-- Row Level Security
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_events_owner_all ON public.activity_events
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY contribution_scores_public_select ON public.contribution_scores
    FOR SELECT
    USING (true);

CREATE POLICY contribution_scores_owner_all ON public.contribution_scores
    FOR ALL
    USING (user_id = auth.uid());

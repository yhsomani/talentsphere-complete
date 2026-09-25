-- ============================================================================
-- Migration: 00012_gamification_xp_ledger_schema.sql
-- Description: Gamification & XP Ledger, Level Curves & Badges (F-22, F-23, BR-25)
-- ============================================================================

-- 1. User Gamification Profiles (Tracking XP, level, and streaks)
CREATE TABLE IF NOT EXISTS public.user_gamification_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1),
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    last_activity_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Platform Badges Catalog
CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN ('skills', 'challenges', 'learning', 'community', 'streak')),
    icon_url VARCHAR(500),
    criteria_type VARCHAR(64) NOT NULL,
    criteria_threshold INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Earned Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.gamification_badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_slug ON public.gamification_badges(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY p_gamification_profiles_read ON public.user_gamification_profiles
    FOR SELECT
    USING (TRUE);

CREATE POLICY p_gamification_profiles_update ON public.user_gamification_profiles
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY p_badges_read ON public.gamification_badges
    FOR SELECT
    USING (TRUE);

CREATE POLICY p_user_badges_read ON public.user_badges
    FOR SELECT
    USING (TRUE);

CREATE POLICY p_user_badges_insert ON public.user_badges
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

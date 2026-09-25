-- ============================================================================
-- Migration: 00015_admin_governance_schema.sql
-- Description: Platform Administration Console & Governance (F-17, F-35, BR-06, BR-28, BR-67)
-- ============================================================================

-- 1. Platform System Configuration (Maintenance mode, system banners, throttles)
CREATE TABLE IF NOT EXISTS public.platform_config (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for config lookup
CREATE INDEX IF NOT EXISTS idx_platform_config_key ON public.platform_config(key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_config (Public read for client app config, admin-only modify)
CREATE POLICY p_platform_config_select ON public.platform_config
    FOR SELECT
    USING (TRUE);

CREATE POLICY p_platform_config_modify ON public.platform_config
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND 'platform_admin' = ANY(users.roles)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND 'platform_admin' = ANY(users.roles)
        )
    );

-- ============================================================================
-- Migration: 00013_account_settings_privacy_schema.sql
-- Description: Account Settings, Privacy Control & GDPR/DPDP Erasure (F-15, §31, BR-06)
-- ============================================================================

-- 1. User Settings & Privacy Controls (1:1 with User)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    theme VARCHAR(16) NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    profile_visibility VARCHAR(32) NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'connections_only', 'recruiters_only', 'private')),
    show_email BOOLEAN NOT NULL DEFAULT FALSE,
    show_activity BOOLEAN NOT NULL DEFAULT TRUE,
    allow_connection_requests BOOLEAN NOT NULL DEFAULT TRUE,
    allow_direct_messages VARCHAR(32) NOT NULL DEFAULT 'everyone' CHECK (allow_direct_messages IN ('everyone', 'connections_only', 'none')),
    search_engine_indexing BOOLEAN NOT NULL DEFAULT FALSE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
    digest_frequency VARCHAR(16) NOT NULL DEFAULT 'daily' CHECK (digest_frequency IN ('realtime', 'daily', 'weekly', 'none')),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    byo_ai_key TEXT,
    ai_data_usage_consent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Data Erasure & Right to Be Forgotten Requests (GDPR Art 17, 30-day grace period)
CREATE TABLE IF NOT EXISTS public.data_erasure_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'grace_period' CHECK (status IN ('pending', 'grace_period', 'processing', 'completed', 'cancelled')),
    reason TEXT,
    grace_period_ends_at TIMESTAMPTZ NOT NULL,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    anonymized_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Data Portability & Export Requests (GDPR Art 15 & 20)
CREATE TABLE IF NOT EXISTS public.data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    format VARCHAR(16) NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'csv')),
    download_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast query routing and scheduler checks
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_erasure_requests_user ON public.data_erasure_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_erasure_requests_status ON public.data_erasure_requests(status);
CREATE INDEX IF NOT EXISTS idx_export_requests_user ON public.data_export_requests(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_erasure_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY p_user_settings_select ON public.user_settings
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY p_user_settings_modify ON public.user_settings
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for data_erasure_requests
CREATE POLICY p_data_erasure_select ON public.data_erasure_requests
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY p_data_erasure_insert ON public.data_erasure_requests
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY p_data_erasure_update ON public.data_erasure_requests
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for data_export_requests
CREATE POLICY p_data_export_select ON public.data_export_requests
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY p_data_export_insert ON public.data_export_requests
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

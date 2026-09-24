-- ============================================================================
-- Migration: 00008_ai_gateway_schema.sql
-- Description: Central AI Gateway, Conversation Threads, Messages, Usage Meters & RLS (F-11, SSOT Section 16)
-- ============================================================================

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Career Assistant Chat',
    purpose VARCHAR(64) NOT NULL DEFAULT 'career_guidance',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Messages Table
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender_role VARCHAR(32) NOT NULL CHECK (sender_role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sanitized_content TEXT,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    model VARCHAR(64) NOT NULL DEFAULT 'talentsphere-assistant-v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Usage Meters Table (Enforcing Free-User Cost Invariant & Quotas)
CREATE TABLE IF NOT EXISTS public.ai_usage_meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    period_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tokens_consumed INTEGER NOT NULL DEFAULT 0,
    requests_count INTEGER NOT NULL DEFAULT 0,
    tier VARCHAR(32) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ai_usage_meter UNIQUE (user_id, period_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_meters_user_date ON public.ai_usage_meters(user_id, period_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_meters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY p_ai_conversations_owner ON public.ai_conversations
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY p_ai_messages_owner ON public.ai_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY p_ai_usage_meters_owner ON public.ai_usage_meters
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

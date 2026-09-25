-- ============================================================================
-- Migration: 00014_billing_subscriptions_schema.sql
-- Description: Billing, Subscriptions, Invoices & Entitlements (F-16, Section 64, WF-16)
-- ============================================================================

-- 1. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_tier VARCHAR(32) NOT NULL CHECK (plan_tier IN ('free', 'candidate_pro', 'recruiter_starter', 'recruiter_enterprise')),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Invoices Table (Money in integer minor units / cents - Section 19)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'paid' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    paid_at TIMESTAMPTZ,
    hosted_invoice_url TEXT,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Entitlements Table (Derived capability limits based on plan)
CREATE TABLE IF NOT EXISTS public.entitlements (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    plan_tier VARCHAR(32) NOT NULL,
    ai_daily_requests_limit INTEGER NOT NULL DEFAULT 5,
    ai_daily_tokens_limit INTEGER NOT NULL DEFAULT 5000,
    active_jobs_limit INTEGER NOT NULL DEFAULT 0,
    can_export_credentials BOOLEAN NOT NULL DEFAULT TRUE,
    has_advanced_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Billing Events Ledger (Append-only audit & webhook replay log - WIT-016)
CREATE TABLE IF NOT EXISTS public.billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_user ON public.billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_idempotency ON public.billing_events(idempotency_key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY p_subscriptions_select ON public.subscriptions
    FOR SELECT
    USING (user_id = auth.uid());

-- RLS Policies for invoices
CREATE POLICY p_invoices_select ON public.invoices
    FOR SELECT
    USING (user_id = auth.uid());

-- RLS Policies for entitlements
CREATE POLICY p_entitlements_select ON public.entitlements
    FOR SELECT
    USING (user_id = auth.uid());

-- RLS Policies for billing_events (read-only for user audit)
CREATE POLICY p_billing_events_select ON public.billing_events
    FOR SELECT
    USING (user_id = auth.uid());

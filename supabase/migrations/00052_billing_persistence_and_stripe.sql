-- ============================================================================
-- Migration: 00052_billing_persistence_and_stripe.sql
-- Description: Durable billing (F-16): Stripe linkage, per-user idempotency,
--              durable provider-event idempotency. Additive and idempotent;
--              00014 tables were never written by the API before this release.
-- ============================================================================

-- 1. Subscriptions: one row per user, linked to the Stripe subscription.
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
    -- created time of the newest provider event applied; older events are stale.
    ADD COLUMN IF NOT EXISTS provider_event_created_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_user
    ON public.subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_stripe
    ON public.subscriptions(stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

-- 2. Invoices: idempotency keys are scoped to the user (00014 made them global,
--    so two users replaying the same client key would have collided).
ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_idempotency_key_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_user_idempotency
    ON public.invoices(user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_stripe
    ON public.invoices(stripe_invoice_id)
    WHERE stripe_invoice_id IS NOT NULL;

-- 3. Billing events: the provider's own event id is the durable idempotency
--    key, so a Stripe retry after a restart is still recognised as a replay.
ALTER TABLE public.billing_events
    ADD COLUMN IF NOT EXISTS provider TEXT,
    ADD COLUMN IF NOT EXISTS provider_event_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_events_provider_event
    ON public.billing_events(provider, provider_event_id)
    WHERE provider_event_id IS NOT NULL;

-- 4. Stripe customer mapping (server-only; one customer per user, one user per
--    customer). Never exposed through the Supabase client roles.
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_customers FROM PUBLIC;

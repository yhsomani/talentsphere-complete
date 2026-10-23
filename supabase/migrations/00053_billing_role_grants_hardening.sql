-- ============================================================================
-- Migration: 00053_billing_role_grants_hardening.sql
-- Description: Defence in depth for billing tables. Supabase grants table
--              privileges to anon/authenticated by default, so 00052's
--              REVOKE ... FROM PUBLIC left stripe_customers reachable by those
--              roles and protected only by RLS having no policy. Billing state
--              is written by the API's database role alone (Stripe webhooks and
--              server routes), never by a client role. Idempotent; no data change.
-- ============================================================================

REVOKE ALL ON public.stripe_customers FROM anon, authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.invoices FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.entitlements FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.billing_events FROM anon, authenticated;

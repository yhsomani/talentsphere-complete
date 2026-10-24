-- Hosted Supabase adapter, step 2 (run after the last migration).
-- TalentSphere's API connects to PostgreSQL directly with its own role and
-- issues its own session tokens; no client calls the Supabase Data API
-- (PostgREST). Supabase grants table privileges to the anon and authenticated
-- roles by default, and its auth.uid() does not recognise the API's tokens, so a
-- copied "auth.uid() = user_id" policy is not isolation evidence. Remove the
-- Data API's access entirely, now and for tables created later (deny by default).
-- Row Level Security stays enabled on every table as a second layer.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- Found while applying this to the hosted project (2026-10-23):
-- 1. 00021 creates certificate_revocations without enabling RLS.
-- 2. The alias views from 01_org_aliases.sql are plain views owned by the
--    migration role, so they ran with owner rights and (with the default
--    anon/authenticated grants) exposed org_memberships writes. Make them run
--    with the caller's rights; the REVOKEs above then leave them unreachable.
-- 3. F-52 / BR-150: public zero-PII certificate verification stays read-only.
ALTER TABLE public.certificate_revocations ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.organization_members SET (security_invoker = true);
ALTER VIEW public.organization_memberships SET (security_invoker = true);
ALTER VIEW public.memberships SET (security_invoker = true);
GRANT SELECT ON public.public_certificate_verifications TO anon, authenticated;

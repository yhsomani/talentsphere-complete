-- Hosted Supabase adapter, step 1 (run right after migration 00001, before 00002).
-- The membership table has four names across migration history (see
-- scripts/lib/pg.mjs ensureOrgAliases): later policies read organization_members,
-- organization_memberships and memberships. These alias views point them all at
-- public.org_memberships. Same SQL the local runner applies; idempotent.

CREATE OR REPLACE VIEW public.organization_members AS
  SELECT id, org_id, user_id, role, created_at FROM public.org_memberships;
CREATE OR REPLACE VIEW public.organization_memberships AS
  SELECT id, org_id, user_id, role, created_at FROM public.org_memberships;
CREATE OR REPLACE VIEW public.memberships AS
  SELECT id, org_id, user_id, role, created_at, org_id AS organization_id
  FROM public.org_memberships;

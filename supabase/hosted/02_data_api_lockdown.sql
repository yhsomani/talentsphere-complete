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

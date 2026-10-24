# Hosted Supabase adapter

The repo's migrations assume a plain PostgreSQL where `pnpm db:migrate` runs. The runner refuses hosted Supabase on purpose, so a hosted project is built by hand in this order:

1. `supabase/migrations/00001_*.sql`
2. `01_org_aliases.sql` (alias views for the membership table)
3. `supabase/migrations/00002` through `00053`, in order, unchanged
4. `supabase/migrations/00054_repoint_auth_users_foreign_keys.sql` (points foreign keys at `public.users`; the API issues its own sessions, so `auth.users` never holds accounts)
5. `02_data_api_lockdown.sql` (removes the Data API's access for `anon` and `authenticated`)
6. Record each applied file in `schema_migrations(filename, checksum)` with the sha256 of the repo file.

Status when this file was written: 00001–00038 and the alias views are applied to the project; 00039 onward is pending the owner's go-ahead.

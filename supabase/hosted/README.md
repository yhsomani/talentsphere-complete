# Hosted Supabase adapter

The repo's migrations assume a plain PostgreSQL where `pnpm db:migrate` runs. The runner refuses hosted Supabase on purpose, so a hosted project is built by hand in this order:

1. `supabase/migrations/00001_*.sql`
2. `01_org_aliases.sql` (alias views for the membership table)
3. `supabase/migrations/00002` through `00053`, in order, unchanged
4. `supabase/migrations/00054_repoint_auth_users_foreign_keys.sql` (points foreign keys at `public.users`; the API issues its own sessions, so `auth.users` never holds accounts)
5. `02_data_api_lockdown.sql` (removes the Data API's access for `anon` and `authenticated`)
6. Record each applied file in `schema_migrations(filename, checksum)` with the sha256 of the repo file.

Status as applied on 2026-10-23 (project `qidckctwrkxyiwworchd`, all tables empty): 00001-00054, the alias views and `02_data_api_lockdown.sql` (including its additions) are applied, and `schema_migrations` holds a row per file.

Caveats: 00001-00038 were applied by an earlier session in grouped batches and their SQL was not re-read, so their ledger checksums record the repo files, not proof of byte-identical SQL. 00039-00054 were applied one file at a time with comment lines removed; the SQL statements are the repo's. Hosted RLS isolation (two-user test) and a restore drill are still unproven (#46, #47).

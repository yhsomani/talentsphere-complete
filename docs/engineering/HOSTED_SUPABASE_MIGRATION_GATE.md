# Hosted Supabase compatibility gate

Target: `talentsphere-production` in Mumbai (`ap-south-1`).

**Do not run `pnpm db:migrate` against hosted Supabase yet.** This repository's custom
migration runner was built for ordinary PostgreSQL. Its compatibility helper
creates a local `auth.users` mirror and redefines `auth.uid()` / `auth.jwt()`.
On hosted Supabase, those are platform-managed identity objects, and overriding
them risks breaking Auth and RLS. The runner now fails closed when the hosted
Supabase identity footprint is detected.

Before establishing a hosted-specific migration path:

1. Inventory all ordered SQL migrations and the local-runner bootstrap operations.
2. Decide whether the existing **Fastify self-issued authentication** remains the
   identity authority. Supabase `auth.uid()` does not automatically recognize
   Fastify's bearer tokens, so a copied `auth.uid() = user_id` policy is not
   evidence of isolation.
3. Replace `auth.users` foreign keys with an approved application-owned identity
   mapping where necessary. Do not modify the real `auth.users` table to create
   synthetic platform identities.
4. Check grants and table exposure through the Supabase Data API. Restrict
   public schema exposure to approved routes and enforce real ownership checks.
5. Use additive, reviewed migrations, tested on a disposable Supabase project,
   with deny-by-default RLS and two-user/two-organization regression coverage.
6. Preserve the existing application migrations' checksums and ledger semantics;
   don't mark them applied just because equivalent objects were created.
7. Configure the Oracle Fastify service's server-only `DATABASE_URL` over TLS.
   Never embed database credentials or service-role secrets in the React bundle.
8. Perform backup/restore, restart, concurrent-write and release smoke tests
   before enabling real users.

This document is a blocker and migration plan, **not** proof that the database
schema has been deployed or an invitation to run unreviewed SQL in production.

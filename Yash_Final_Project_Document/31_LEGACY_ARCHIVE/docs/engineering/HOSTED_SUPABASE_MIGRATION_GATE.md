# Hosted Supabase migration gate and dependency audit

Source cross-check: `431c425a`, 2026-10-23. **The ordinary `pnpm db:migrate`
runner must not be used against hosted Supabase.** It prepares local compatibility
objects, including `auth.users`, `auth.uid()` and `auth.jwt()`, and explicitly
refuses the hosted identity footprint. Hosted Auth objects belong to the platform.

## Current repository support and unknown live state

A manual adapter now exists in
[supabase/hosted/README.md](../../supabase/hosted/README.md): first migration,
organization alias views, migrations 00002?00053, migration 00054 to repoint
foreign keys, then Data API lockdown and exact checksum ledger recording.
This supersedes the older statement that no hosted path exists. It does not
establish that the complete sequence has run or is safe on populated data.
The hosted README records a historical partial application through 00038;
older audit reports describe an earlier empty project. Neither is a current
observation. This documentation pass made no live connection.

The named historical target is `talentsphere-production`, project
`qidckctwrkxyiwworchd`, Mumbai (`ap-south-1`). Validate the intended target and
current schema/ledger before any action; never infer current state from these
snapshots or mark equivalent objects applied without the matching checksums.

## Static dependency audit

From the repository root:

```sh
node scripts/audit-hosted-supabase-migrations.mjs
```

This reads checked-in migrations without a database connection and writes JSON
to stdout. Exit 1 is expected while historical SQL refers to `auth.users`,
`auth.uid()` or `auth.jwt()`. The report lists identity references, RLS declarations,
privileged functions and public views. It is a dependency signal, not a test of
current grants or authorization. Migration 00054 fixes historical foreign keys;
it does not remove old file references or make Fastify tokens Supabase identities.

## Release prerequisites

1. Review all ordered migration/bootstrap dependencies and the hosted adapter.
   Preserve historical SQL/checksums and the local migration path.
2. Keep the existing Fastify identity boundary explicit: application users are
   in `public.users`. Do not insert synthetic platform Auth users or replace
   provider-managed functions. Changes of identity authority require approval.
3. Rehearse the complete additive sequence on a disposable managed project,
   including clean and populated upgrades, foreign keys, alias views and ledger.
4. Review grants, RLS, privileged functions and views. Deny unintended Data API
   access for `anon`/`authenticated`; test actual two-user/two-organization reads
   and forged-owner mutations. API checks remain mandatory with a privileged DB
   connection. An empty advisor result is not acceptance evidence.
5. Configure only server-side `DATABASE_URL`; the API config checks the expected
   `SUPABASE_PROJECT_REF` and `sslmode=verify-full` when that ref is configured.
   Account for the session-scoped single-writer lease when choosing connectivity.
6. Verify backup/restore, restart, concurrent writes, application workflows and
   rollback/forward recovery before enabling Oracle traffic or real users.

The historical dependency-audit document is consolidated here. No migration,
credential, grant, schema, policy or deployment was changed by this audit.

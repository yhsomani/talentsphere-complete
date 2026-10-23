# Hosted Supabase migration dependency audit

Target: `talentsphere-production` (`qidckctwrkxyiwworchd`, Mumbai).

Run from repository root:

```sh
node scripts/audit-hosted-supabase-migrations.mjs
```

The script scans the **checked-in** migration history without a database
connection and produces JSON showing references to Supabase-managed identity,
RLS policy declarations, privileged functions, and public views. It deliberately
returns a failing exit code when existing migrations depend on `auth.users`,
`auth.uid()`, or `auth.jwt()`. This is a release gate, not a test of authorization.

## Compatibility requirements

TalentSphere signs its own Fastify tokens and stores account identities in
`public.users`. Existing SQL references Supabase Auth users and claims; those
identities are **not equivalent**. Do not insert synthetic users into hosted
`auth.users`, replace platform `auth.uid()`, or assume Fastify JWTs satisfy
Supabase RLS.

Before applying the 51 historic SQL migrations to hosted Supabase:

1. Inventory and review every dependency reported by the audit.
2. Prepare a version-controlled hosted migration sequence against a disposable
   managed Supabase project, preserving the historical local migration path.
3. Replace foreign keys to `auth.users` with the approved application-owned
   identity relationship; review dependent policies and views.
4. Establish explicit GRANTs and deny-by-default RLS for every API-exposed table.
   The Fastify server must enforce authz with its own verified token claims;
   Supabase `anon` and `authenticated` must not gain accidental data access.
5. Verify migrations on clean and populated copies, role/tenant isolation,
   updates with forged ownership, application workflows and full rollback.
6. Only then apply verified migrations to the newly created Mumbai project and
   enable Oracle traffic.

No migration is considered applied and no production data is considered safe
merely because this audit produces a report.

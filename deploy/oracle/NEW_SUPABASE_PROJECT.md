# TalentSphere — new Mumbai Supabase project

**Authoritative hosted Supabase project:** `qidckctwrkxyiwworchd` (`talentsphere-production`, `ap-south-1`).

No previous Supabase projects are configured or supported by this deployment profile.

## Running on Oracle without another PostgreSQL server

Use `deploy/oracle/compose.supabase.yaml` rather than the older local-database
`compose.yaml`. The API and worker both use exactly the same **server-only**
`DATABASE_URL` supplied from the private deployment environment. The React
bundle does **not** need a Supabase service-role key or PostgreSQL password.
Do not supply either as a Vite environment variable.

Example deployment-specific `deploy/oracle/.env` values (placeholders only):

```dotenv
SITE_DOMAIN=staging.example.com
ACME_EMAIL=operator@example.com
TOKEN_SECRET=REPLACE_WITH_A_FRESH_RANDOM_SECRET
# Obtain the actual URI from the new project's Connect dialog.
# This example is intentionally not a usable credential:
DATABASE_URL=postgresql://postgres:REPLACE_ME@db.qidckctwrkxyiwworchd.supabase.co:5432/postgres?sslmode=verify-full
EMAIL_PROVIDER=none
```

If Oracle's network cannot reach the direct IPv6 database endpoint, use the
appropriate Supabase **session pooler**, with the **actual** hostname and
`postgres.qidckctwrkxyiwworchd` database username provided by Supabase.
The server checks the expected project ID and rejects mismatching database
connection strings. TLS certificate and hostname verification are required.
Store credentials only in protected server-side environment or secret storage.

```sh
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.supabase.yaml config --quiet
```

**STOP:** `pnpm db:migrate` is still blocked on hosted Supabase. The existing
migration runner creates compatibility objects under the provider-managed
`auth` schema and could damage authentication. The reviewed, versioned
hosted-migration adapter and full RLS verification must be completed before
bringing up API/worker traffic. This configuration is not a functioning
application deployment by itself.

## Required release gates

- Review existing schema migrations and migrate application-owned FKs off
  `auth.users` or deliberately select Supabase Auth with an explicit transition.
- Keep one Fastify API instance until its in-memory read model is eliminated.
- Protect all public application tables with least-privilege RLS and GRANTs;
  note Fastify's tokens are **not** Supabase Auth JWTs.
- Test two users and two organizations against SQL authorization **and**
  the API, with direct Data API exposure assessed explicitly.
- Configure and test transactional email for work-history confirmation.
- Approve and implement legal deletion timeframes and scheduled erasure.
- Verify schema migrations, performance, encrypted backups, real restore,
  worker health and rollback on a nonproduction copy.
- Do not enable paid billing or simulated interview scoring.

Issue mapping: #44 email, #45 privacy, #46 migrations, #47 operations,
#48 persistence, #49 interview/session integrity, #50 billing.

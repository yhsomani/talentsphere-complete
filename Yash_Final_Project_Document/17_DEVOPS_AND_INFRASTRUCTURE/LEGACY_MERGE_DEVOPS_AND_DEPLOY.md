# Legacy Merge B-17: Deployment, Environments, Release Preflight, Backup/Restore Drills and Maintenance Tooling (Prior Attempt)

Doc ID: LGM-B-17 · Owner: Platform/Infrastructure Architect (with SRE Lead) · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: OPS-DEP, OPS-REL, OPS-OBS, OPS-SLO, DB-04, OPEN-14, OPEN-21, OPEN-22, OPEN-23, OPEN-36 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/deploy/README.md`, `.../deploy/NEW_SUPABASE_PROJECT.md`, `.../deploy/RECOVERY.md`, the environment/config/preflight sections of `docs/quality/OPERATIONS.md`, the CI sections of `docs/quality/TESTING.md`, the hosted gate (`docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md`, merged in full in `../12_DATA_AND_DATABASE/LEGACY_MERGE_DATABASE_REFERENCE.md` section 6), and `docs/engineering/PROJECT_MAINTENANCE.md`.

## 0. Frame

- **Nothing is deployed and no infrastructure code exists in this project.** The archive holds only the three deploy *markdown* files; the compose files, proxy config, Dockerfiles and backup scripts they reference (`deploy/oracle/compose.yaml`, `compose.supabase.yaml`, `.env.example`, `backup.sh`, `verify-restore.sh`) are **not in this repository** and were never executed on an Oracle VM by the prior attempt ("This config has not been executed on an Oracle VM"). Treat the documents as an *unverified starting configuration* for the reference option "A. Single VM + Compose (Oracle)" already recorded in `OPS-DEP` section 6 / OPEN-14.
- "Prior attempt reported" = statements in those documents about the earlier attempt; "Target requires" = requirement here.
- The `.env`-style example values in the verbatim records are placeholders only ("REPLACE_ME", "REPLACE_WITH_A_FRESH_RANDOM_SECRET"); no credential exists in this file. The hosted project reference `qidckctwrkxyiwworchd` (Mumbai, `ap-south-1`) is an identifier, not a secret, and is recorded as a historical reference target only.

## 1. Environment ladder and configuration (prior attempt) - requirements carried over

- Ladder: `local -> CI -> preview -> staging -> production`, each with separate secrets/config. **Target:** matches OPS-REL section 5 environment table.
- Processes: **API** - exactly one process per database in the prior design (single-writer read model); **Worker** - claims jobs with `FOR UPDATE SKIP LOCKED` (does *not* give exactly-once; multiple workers can reclaim expired batch leases and run a job twice, audit D-02); **Web** - static bundle with build-time contact variables (`VITE_SUPPORT_EMAIL`, `VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL`) baked in at build time. **Target requires:** API replicas allowed (ADR-T05), fenced leases (ADR-T09); build-time contact variables only for public values.
- Configuration rules the prior attempt enforced at startup (listing preserved because each is a good boot-time refusal for the target):

| Variable                       | Production rule                                                               |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `TOKEN_SECRET`                 | Required, ≥ 32 random characters. Rotating it signs everyone out.            |
| `DATABASE_URL`                 | Required; not the local default.                                              |
| `STORAGE`                      | `pg` (default). `memory` is refused in production and staging.                |
| `CORS_ALLOWED_ORIGINS`         | The web origin(s); localhost is refused in production.                        |
| `BILLING_MODE`                 | `disabled` (default), `simulated` (no payment; refused in production), or `stripe` (configured provider). |
| `BILLING_WEBHOOK_SECRET`       | Unset ⇒ the billing webhook answers 503 to everything.                        |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Login attempts per IP+email and sign-ups per IP per window (default 10).      |
| `RATE_LIMIT_MAX_REQUESTS` / `RATE_LIMIT_WINDOW_MS` | Global limiter per signed-in account (per address when anonymous); default 300 per minute. |
| `TRUST_PROXY`                  | **Required behind a load balancer** (e.g. `1`): otherwise every anonymous client shares the proxy's address and one rate-limit bucket. |

`apps/api/src/index.ts` refuses to start in production when any rule above is broken and
prints which ones (`productionConfigProblems()`). Staging (`NODE_ENV=staging`) gets the
`TOKEN_SECRET`, `DATABASE_URL` and `STORAGE` rules too, but may simulate billing and allow a
localhost origin for testing.

  Notes: staging got the secret, database-URL and storage rules but could simulate billing and allow a localhost origin; the API refused to start in production listing every broken rule. **Target requires:** a single typed configuration package validated at boot in API **and** worker; production refuses (a) in-memory/ephemeral storage, (b) secrets shorter than the minimum or equal to published test keys, (c) localhost CORS, (d) any simulated provider mode, (e) provider test-mode keys; `TRUST_PROXY`-style setting documented as mandatory behind a load balancer (otherwise all anonymous clients share one rate-limit bucket). Known prior defect to avoid: AI feature flags parsed with `z.coerce.boolean()` so the string `"false"` enabled them (only strict parsing - e.g. `z.enum(["true","false"])` - is safe); add a config test per boolean flag.

## 2. CI and release gates (prior attempt) - facts to reconcile with OPS-REL

Pipeline order on every push and pull request: install with frozen lockfile; lint; typecheck (project build, then test projects); tests (unit, integration, API, security); build; e2e (with accessibility and performance); PostgreSQL service container for durability tests; migration-idempotency step; migration application to an empty database. CI used Node 24; the package manager was pinned in the root manifest; the root build built packages before apps; API/worker dev commands ran compiled output rather than watchers (so a stale build gave misleading results). Release (legacy target model): "No release without: security gate; critical E2E; accessibility evidence; migration proof; rollback path; observability; business acceptance." **Target mapping:** OPS-REL RG-01..RG-14; conflicts and gaps are in `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` (L-B16-01..03).

Local developer commands reported (kept for the developer guide owner): install `pnpm install` (pinned pnpm); dev `pnpm dev`; tests `pnpm test`, `pnpm test:pg` (needs `TEST_DATABASE_URL`), `pnpm test:e2e`; `pnpm lint`; `pnpm typecheck`; `pnpm build`; `pnpm db:migrate`; on Windows the script shim may be blocked by execution policy - use the `.cmd` form or `cmd`.

## 3. Prior-attempt database operations that are deployment prerequisites

- Case-insensitive unique email index on a populated database fails if two emails differ only by case - de-duplicate first.
- Rows changed directly in SQL are seen by the (hybrid) API only after restart - **retired by ADR-T05**.
- Bootstrapping the first platform admin: no API route created one (sign-up offered only candidate and recruiter; role changes required an existing admin); the first admin was added by a direct SQL update of the user's roles followed by an API restart. **Target requires** a documented, audited, one-time bootstrap procedure (a CLI/seed task creating the first admin from a secret-manager value with an audit-log entry, never a hand-run UPDATE) - **L-B17-01**.
- Background-job retention: terminal jobs older than 7 days purged opportunistically; one-time codes and reference tokens stripped from a job's payload on finish. **Target:** DB-03 retention; keep payload scrub.

## 4. Single-writer lease and pooler compatibility

Prior design: a session-level advisory lock (`pg_try_advisory_lock(718201, 1)`) held for the whole API lifetime refused a second API process; losing the lock session returned 503 until restart; a transaction pooler was not compatible with the session lease. **Target:** retired by ADR-T05 (no single-writer constraint), which also removes the pooler restriction; if any component later needs a lease (for example a scheduler), use a leased row with fencing token (ADR-T09), not a session lock.

## 5. Read-only release preflight (prior attempt) - gate design to copy

Run from the repository root with `DATABASE_URL` pointing only at the intended target; output contains check identifiers and counts, never personal records or secrets; nonzero exit blocks promotion:

```sh
# Before applying migration 00043 on an EXISTING populated database:
node scripts/release-preflight.mjs --mode=pre-00043
# After applying all migrations; also run in CI against clean Postgres:
node scripts/release-preflight.mjs --mode=schema
# On staging/production, from an external monitor after the worker is running:
node scripts/release-preflight.mjs --mode=operational
```

- `pre-00043`: detects case-folded email duplicates, active-application collisions and candidate ids with no corresponding user record; conflicts resolved under an approved backfill plan, **not by deleting rows automatically**.
- `schema`: detects changed applied SQL (checksum), missing required migrations, required indexes, foreign-key targets and RLS enablement on sensitive tables; it checks RLS is *enabled*, **not** that grants and policies prove tenant isolation.
- `operational`: also fails on stale worker heartbeat (45 s), queued jobs overdue by five minutes, or terminal job failures within the past hour. The nonzero exit status must be wired to an external monitor - running the script once creates no alerts.
- "These checks do **not** demonstrate an actual populated-database upgrade, backup/point-in-time restore, load or cold-boot performance, HTTPS reverse proxy, multi-replica admission, rolling deploy or incident response. Capture separate staging evidence and operator approval before closing issues #46 or #47."
- **Target requires** (new RG sub-gates, owner Release Engineering): (a) a `schema` preflight in CI on every PR (checksum, contiguity, RLS-enabled, FK targets, required indexes); (b) an `operational` preflight run as a synthetic monitor that pages on stale heartbeat / overdue queue / terminal failures (maps to ALT-* alerts); (c) a `pre-import` data-quality preflight for any reference-data import (MIG-DATA-01) with duplicate-email, orphan-reference and active-application-collision checks; (d) the rule "preflight never deletes data".

## 6. Prior-attempt Oracle staging deployment (verbatim record) - reference option A

**Unverified starting configuration; public launch was blocked until issues #44-#50 had acceptance evidence.** The seven issue references map to: #44 email delivery, #45 privacy/erasure policy, #46 migrations, #47 operations, #48 persistence, #49 interview/session integrity, #50 billing (mapping given in the hosted-project document).

This deployment is an **unverified starting configuration** for Oracle Ampere ARM64.
Public launch is blocked until [issues #44–#50](https://github.com/yhsomani/talentsphere-complete/issues) have appropriate acceptance evidence.

## Host preparation

1. Provision an ARM64 Ubuntu instance in your Oracle home region. Ensure sufficient free RAM/disk, and install supported Docker Engine + Compose plugin from official packages.
2. Configure Oracle VCN security rules and host firewall to accept **only 22/tcp from a trusted management IP, 80/tcp and 443/tcp from intended testers** (and 443/udp only if HTTP/3 is desired). Keep ports 4000 and 5432 private. Prefer SSH keys and disable password SSH.
3. Point SITE_DOMAIN's DNS A/AAAA record to the public IP; verify it resolves before requesting TLS.
4. From repository root, copy `deploy/oracle/.env.example` to `deploy/oracle/.env`. Set a real domain/email, two different strong random secrets, and restrictive file permissions (`chmod 600 deploy/oracle/.env`). Use URL-safe PostgreSQL password characters or percent-encode them in the DATABASE_URL.
5. Review configuration and migrations before deploying. Do NOT run migrations automatically as part of a public service restart.

## Initial deployment (run from repository root)

```sh
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml build
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d db
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml run --rm --no-deps api node scripts/migrate.mjs
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml ps
```

**Do not treat container startup as proof of readiness.** Verify HTTPS, auth, worker heartbeat, migrations, browser journeys, tenant isolation, resource use, and outbound mail (if enabled). Provision a non-public staging account and restrict testers; this compose file does not include an access-control gateway.

## Important limitations

- Exactly **one API instance** is supported per DB. The API uses a PostgreSQL advisory lock and caches read state. Never `--scale api` or turn on multiple replicas.
- The database is intentionally private to the Compose network. The host must have a separate encrypted off-instance backup process; this Compose file **does not implement backups**. Prove a full restore into an isolated database, including migration history and jobs, before accepting real user data.
- Email verification needs provider credentials, domain verification and real deliverability testing. `EMAIL_PROVIDER=none` fails closed.
- Billing is disabled; do not enable simulated billing. Interview scoring and ephemeral modules remain release-gated.
- The image contains build tooling and source for simplicity. Hardening to smaller runtime images, pinned image digests, scans, resource ceilings, service health checks and deployment rollback remain necessary prior to public launch.
- Environment variable interpolation may break with reserved URL characters in POSTGRES_PASSWORD; prefer cryptographically generated URL-safe secrets.
- This config has not been executed on an Oracle VM. Review storage, ARM64 image availability and free-tier limits for the selected tenancy.

### 6.1 Target interpretation of the Oracle staging limitations

| Prior attempt limitation | Target requires |
|---|---|
| Exactly one API instance per DB (never scale) | Not applicable under ADR-T05; staging may still be one instance but must not rely on it |
| Database private to the Compose network; no backups implemented in the compose file | Encrypted off-host backups with a passed restore drill before any real user data (OPS-DEP section 7 REC-001/002) |
| Email provider credentials, domain verification and deliverability testing needed; `EMAIL_PROVIDER=none` fails closed | Same: fail-closed default; SPF/DKIM/DMARC (see operations file) |
| Billing disabled; do not enable simulated billing; interview scoring and ephemeral modules release-gated | No simulated billing; no simulated scoring; no ephemeral modules |
| Image contains build tooling and source; hardening to smaller runtime images, pinned image digests, scans, resource ceilings, service health checks and deployment rollback "remain necessary prior to public launch" | Multi-stage minimal runtime images, digest pinning, SBOM + vulnerability scan + signing (RG-04), resource limits, health checks, rollback path |
| Reserved URL characters in the database password break environment interpolation | Use URL-safe generated secrets or percent-encode; add a config test that parses the connection string |
| Firewall: only 22/tcp from a trusted management IP, 80/tcp and 443/tcp from intended testers (443/udp only if HTTP/3), ports 4000 and 5432 private, SSH keys, no password SSH, DNS A/AAAA resolving before TLS issuance | Adopt as the minimum host-hardening checklist for any single-VM environment |
| "This compose file does not include an access-control gateway": provision a non-public staging account and restrict testers | Staging access control (basic auth/VPN/IP allow-list) is a requirement for any internet-reachable staging |
| Do NOT run migrations automatically as part of a public service restart | Migrations are a separate, gated release step (DB-04 order: expand migrations, then deploy, then backfill, then flags, then contract) |

## 7. Prior-attempt hosted database project note (verbatim record)

Authoritative hosted project was a managed-Postgres project in the Mumbai region; "No previous projects are configured or supported by this deployment profile." The record also lists the compose-with-hosted-database variant, the STOP notice that the ordinary migration runner must not be run against the hosted project, and a list of release gates. **Target:** the same list is subsumed by the hosted gate in the database file (section 6) and by OPS-DEP; keep this text as the original.

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

## 8. Prior-attempt backup and restore checks (verbatim record)

Run `bash deploy/oracle/backup.sh` on the staging host. By default, dumps land in
`private-backups/` at repository root; this directory must remain private, untracked
and inaccessible from the web. Use `BACKUP_DIR` to select a secure external location.

Run `bash deploy/oracle/verify-restore.sh /path/to/backup.dump` to restore into a
temporary database, verify the migration ledger, and drop the test database. Ensure
adequate database disk space. The live `talentsphere` database is not replaced.

**These scripts are not yet executed in Oracle.** A local dump is insufficient:
configure an encrypted off-VM destination, retention, a scheduler, missed-backup
alerts, a separate-host restore drill, and documented RPO/RTO before real users.
Verify application data and workflows after restoring. Protect backup files as
sensitive personal information. Never commit or upload plaintext dumps publicly.

**Target requires:** backup script + restore-verification script as repeatable, scheduled jobs with: encrypted off-VM destination, retention, missed-backup alert (SLI "last successful backup / WAL age", FM-34), separate-host restore drill, documented RPO/RTO (OPEN-23), and post-restore checks (migration ledger intact, jobs table, application workflow smoke, erasure-tombstone replay). Backup files are personal data: private directory, untracked, never web-accessible, never plaintext in public storage. Both scripts "not yet executed" in the prior attempt - nothing is proven.

## 9. Project maintenance tooling (prior attempt) - developer clean/reinstall utility

A Windows PowerShell utility (batch wrapper plus engine) cleaned generated outputs and dependency directories and optionally reinstalled/rebuilt; it is **not a TalentSphere product requirement** and the prior attempt's own manifest classed its original request and test plan as a separate effort. Its distinct facts are preserved here because they contain safety lessons for any repo-cleanup script:

Source cross-check: `431c425a`, 2026-10-23. The current tool is
clean-reinstall.bat with
clean-reinstall.ps1. The older Bash
`project-maintenance.sh` and its test script are absent. Their unique usage,
requirements and test history are preserved in the
maintenance archive.

## Current execution path

The batch wrapper selects `pwsh.exe` when available, otherwise `powershell.exe`,
forwards arguments to the engine and propagates its exit code. It explicitly
uses process-scoped ExecutionPolicy Bypass; this is source behavior, not an
instruction to bypass a host refusal.

The engine binds PowerShell parameters, validates the root, initializes a log,
discovers projects/workspaces, resolves cleanup candidates, optionally prompts,
then cleans and/or invokes installers/builds. `Get-DiscoveredProjects`,
`Test-SafePathContainment`, `Resolve-ProjectCleanTargets`, `Invoke-SafeClean`,
`Resolve-Executable`, `Invoke-ToolCommand` and `Invoke-ReinstallAndBuild` are the
existing extension points. It recognizes multiple ecosystem manifests and uses
workspace membership to skip redundant member installations. Runtime correctness
for every ecosystem is unverified by this documentation pass.

Use native parameter spelling when inspecting help:

```powershell
powershell.exe -NoProfile -File .\clean-reinstall.ps1 -Help
```

`-DryRun`, `-CleanOnly`, `-InstallOnly`, `-Build`, `-DeepClean`, `-Root`, `-Exclude`,
`-MaxDepth` (default 5), `-ContinueOnError`, `-Yes` and `-VerboseOutput` are declared
parameters. The script also advertises double-dash aliases; cross-shell parsing
was not exercised here.

## Important differences from the historical safety claims

- Dry-run skips cleanup/install execution but **writes a timestamped log** under
  the selected root, falling back to the temporary directory. It is not a
  zero-filesystem-write inspection.
- The confirmation branch applies to an invocation without arguments. Explicit
  operation flags can execute without another confirmation; do not assume every
  mutation prompts or that `-Yes` is always required.
- Cleanup/install/build changes generated outputs and dependency directories.
  Under AGENTS.md, agents cannot run these operations without
  explicit authorization for protected build-file changes.
- Logging redacts selected secret patterns; that is not proof that arbitrary
  installer output cannot contain private data.
- Source contains path-containment/reparse checks and cleanup guards. Historical
  test passes are not certification against races or every filesystem/platform.

## Tests and historical material

`tests/run-tests.ps1` loads four tier files and accepts `-Tier`, `-TestId`,
`-FailFast` and `-VerboseOutput`. Fixtures and stress probes are in `tests/`.
They create/delete files and launch the maintenance engine; they were not run
for this documentation-only change. Review their effects before execution under
the build-file restriction.

The archive retains the original request and the 38-case test report, including
its empty-project-array defect finding. That finding is historical and was not
reproduced here. The duplicate root implementation plan was removed; its exact
copy remains in `.agents/teamwork/orchestrator_1/PROJECT.md`.

**Target requires:** if a clean/reinstall helper is created, it must be dry-run safe (no filesystem writes in dry-run, or document them), always confirm destructive operations, contain path-containment and reparse-point checks with tests for races, redact logs, and be excluded from agent-run commands unless authorized. Original request and 38-case test report of that utility live only in the prior attempt's reports (not in this archive subset); the defect it recorded ("empty project array") is historical and unreproduced.

## 10. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B17-01 | First-admin bootstrap procedure (audited, no hand-run SQL) | Security Architect + Platform |
| L-B17-02 | Whether to adopt Oracle single-VM Compose as dev/staging (OPS-DEP option A) given the unexecuted prior config | OPEN-14 |
| L-B17-03 | Preflight modes (schema, operational, pre-import) as RG sub-gates | Release Engineering |
| L-B17-04 | Strict boolean parsing for all feature flags | Backend (config package) |

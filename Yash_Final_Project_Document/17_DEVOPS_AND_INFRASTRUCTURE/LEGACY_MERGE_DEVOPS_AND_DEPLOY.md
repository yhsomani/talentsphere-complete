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


<!-- ledger-D D-17 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md (gap closure D-17)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: the 28 missing test-case ids TC-04..TC-37 (all of TC-01..TC-38 with results and timings are quoted in the 16_QA section), ~113 code tokens (flags `--max-depth`, `--approve-cleanup`, ecosystem markers `build.gradle`, `package-lock.json`, `.nuxt`), detected-projects table, per-candidate size tables, menu numbering, per-test timings.

~~~~text
L18: ## Detected projects and installation boundary
L19: 
L20: There are ten `package.json` files: one workspace root and nine members. `pnpm-workspace.yaml` includes `apps/*` and `packages/*`; the root `pnpm-lock.yaml` records those importers. The declared and locally available manager is `pnpm@11.7.0`. Local Node is v24.19.0; CI and Docker use Node 24. No separate nested installation boundary or competing lockfile was found outside installed dependencies.
L21: 
L22: | Project | Technology / purpose | Shared dependencies | Generated output observed |
L23: |---|---|---|---|
L24: | `.` | pnpm workspace; Vitest, Playwright, Prettier, TypeScript | Installation owner for all members | Root `node_modules`, `test-results` |
L25: | `apps/api` | TypeScript, Node, Fastify HTTP API | config, contracts, domain | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L26: | `apps/web` | TypeScript/TSX, React, React Router, Vite | ui | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L27: | `apps/worker` | TypeScript, Node, PostgreSQL worker | domain, observability | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L28: | `packages/config` | TypeScript, Zod environment validation | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L29: | `packages/contracts` | TypeScript, Zod API contracts | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L30: | `packages/domain` | TypeScript domain logic | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L31: | `packages/observability` | TypeScript, Pino | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L32: | `packages/testing` | TypeScript test helpers | domain | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L33: | `packages/ui` | TypeScript shared UI package | Workspace member | `dist`, `tsconfig.tsbuildinfo`, local `node_modules` |
L34: 
L35: Each member's manifest and `tsconfig.json` were found. All member TypeScript configs emit to `./dist`; composite compilation writes incremental metadata. Vite also targets `apps/web/dist`. Root TypeScript references list all nine members. Root build scripts compile shared packages before applications.
L36: 
L37: Other languages and infrastructure actually present:
L38: 
L39: - JavaScript/MJS: database migration/seed tooling, release checks, icon generation, and E2E server bootstrap.
L40: - Bash: `deploy/oracle/backup.sh` and `deploy/oracle/verify-restore.sh`.
L41: - SQL: PostgreSQL migrations and seed data under `supabase`; not cleanup candidates.
L42: - Python: `.audit/shoot.py`, a Playwright screenshot helper. No `pyproject.toml`, requirements file, virtual environment, or Python lockfile was found. Report it as an auxiliary script with unmanaged dependencies; do not install Python or infer a Python project.
L43: - Docker/Compose/Caddy and GitHub Actions: container build, staging deployment configuration, and CI checks.
L44: - HTML/CSS, webmanifest, fonts, icons, and screenshots are source/static/evidence assets, not automatically regenerable build output.
L45: - No Java/Kotlin, .NET, PHP, Ruby, Go, Rust, C/C++, Android, or iOS project manifest was found. The future scanner should recognize their manifest names and report unsupported projects instead of guessing cleanup or install commands.
L46: 
L47: ## Cleanup inventory and classification
L48: 
L49: Sizes below are approximate `du -sk` readings in KiB at discovery time, not promised reclaimable space. Linked/shared allocations and concurrent development can change them. No candidate was deleted. A regenerable classification is permission to propose a target, not authorization to delete it.
L50: 
L51: | Candidate | Category | Approx. KiB | Classification and evidence |
L52: |---|---|---:|---|
L53: | `apps/api/dist` | Build | 1164 | Regenerable candidate: configured TypeScript outDir |
L54: | `apps/web/dist` | Build | 910 | Regenerable candidate: TypeScript and Vite outDir |
L55: | `apps/worker/dist` | Build | 54 | Regenerable candidate: configured TypeScript outDir |
L56: | `packages/config/dist` | Build | 40 | Regenerable candidate: configured TypeScript outDir |
L57: | `packages/contracts/dist` | Build | 268 | Regenerable candidate: configured TypeScript outDir |
L58: | `packages/domain/dist` | Build | 1330 | Regenerable candidate: configured TypeScript outDir |
L59: | `packages/observability/dist` | Build | 19 | Regenerable candidate: configured TypeScript outDir |
L60: | `packages/testing/dist` | Build | 18 | Regenerable candidate: configured TypeScript outDir |
L61: | `packages/ui/dist` | Build | 21 | Regenerable candidate: configured TypeScript outDir |
L62: | Nine member `tsconfig.tsbuildinfo` files | Build metadata | 480 combined | Regenerable candidate: composite TypeScript metadata; must clean with output to avoid stale incremental state |
L63: | Root plus nine member `node_modules` directories | Dependencies | Root 150632; member readings 30–7177 each | Workspace-owned installations: one root frozen restore, not ten installs; linked/shared allocation is not additive |
L64: | `test-results` | Test output | 11 | Regenerable candidate: Playwright/performance output; warn that diagnostic evidence is lost |
L65: | `.audit` | Mixed source and evidence | 2528 | Prohibited as a cleanup directory: tracked Python source and baseline screenshots |
L66: | `.playwright-cli` | Browser evidence | 178 | Preserve: tracked recordings and current-session evidence |
L67: | `graphify-out/cache` | Tool cache | 764 | Review only: tracked files exist inside despite ignore pattern; no blanket deletion |
L68: | `graphify-out` excluding cache | Analysis artifacts | Not measured | Review only: tracked reports, graphs, manifests and tool state |
L69: | `supabase/.temp` | Tool state | 0 | Review only; no verified regeneration contract |
L70: | `.reticle` and `apps/web/.reticle` | Verification state | Not measured | Preserve recordings, intent, contracts and cloud configuration |
L71: | `TalentSphere` | Obsidian vault | Not measured | Protected user data, including `.obsidian-mcp` transactions, locks and trash |
L72: | `BRAIN` | Project memory | Not measured | Protected documentation and execution history |
L73: | `private-backups` when present | Database backups | Not measured | Always protected; backup scripts may also use an external BACKUP_DIR |
L74: 
L75: Git inspection found no tracked `dist` output, `*.tsbuildinfo`, or `test-results` content. The maintenance tool must repeat provenance checks immediately before execution and reject targets containing tracked or staged files, nested repositories, essential data, or symlinks. Ignore rules alone are insufficient evidence of safety.
L76: 
L77: Source-adjacent generated JavaScript, declarations, or map files must not be removed by extension alone. Familiar names such as `build`, `dist`, `cache`, `target`, or `vendor` are review-only without a demonstrated project-specific output contract.
L78: 
[...]
L99: Compose owns persistent `db_data`, `caddy_data`, and `caddy_config` volumes. These are never local cleanup targets. `.env*`, key material, database dumps, package manifests, lockfiles, configuration, source, migrations and static/public assets must survive every routine operation.
[...]
L105: One root `project-maintenance.sh` contains the reusable Bash functions and interactive menu requested in the brief (scan, build cleanup, dependency removal, cache cleanup, install, clean/reinstall, full maintenance/validation, individual selection, preview, export, exit). The same implementation exposes `--root PATH`, `--scan`, `--dry-run`, and explicit category/check selectors for fixture tests and automation. No shell configuration is sourced or evaluated.
[...]
L145: Run `bash -n` and ShellCheck when available, then fixture tests. Apply `chmod +x project-maintenance.sh` without staging unrelated changes. Perform only read-only `--scan` and `--dry-run` against the real repository and preserve output for review. No actual repository cleanup or reinstall is authorized by this implementation request. Native macOS/Linux behavior needs evidence or must remain a stated limitation when verification is limited to Git Bash on Windows.
[...]
L172: - [`../engineering/PROJECT_MAINTENANCE.md`](../engineering/PROJECT_MAINTENANCE.md): launch commands, selection flags, supported technology/configuration dialects, recovery, reporting, exit codes and platform limitations.
L173: - `../superpowers/plans/2026-10-21-project-maintenance.md` (retired 2026-10-26; see `docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md` Appendix A/B; original in git history): implementation plan based on the approved design.
[...]
L179: | Test-first implementation | Initial fixture invocation failed with `requested project-maintenance.sh is missing`; later safety findings were reproduced in disposable fixtures before fixes |
L180: | Bash syntax | `bash -n project-maintenance.sh` and `bash -n scripts/tests/project-maintenance.test.sh` exit 0 |
L181: | Executable script | `chmod +x` applied; `test -x project-maintenance.sh` passed in Git Bash |
L182: | Fixture safety and behavior | Final fixed-content run: 74 assertions, zero failures, exit 0; raw stdout captured in `MAINTENANCE_FIXTURE_TESTS_2026-10-21.log` |
L183: | Real recursive scan | `--scan` exit 0; ten Node manifests, nine members and one installation owner; raw stdout captured in `MAINTENANCE_SCAN_2026-10-21.log` |
L184: | Real full preview | `--dry-run --operation full` exit 0; 29 proposed removal targets and 15 proposed commands; raw stdout captured in `MAINTENANCE_DRY_RUN_2026-10-21.log` |
[...]
L188: | Native symlink fixtures | Explicitly skipped: this host cannot create native symlinks with the current identity; ordinary Git Bash `ln -s` can silently copy instead |
[...]
L192: The final real scan and dry-run were repeated after the safety fixes and both exited 0. No root `maintenance-reports` directory or maintenance lock was created by these read-only invocations. A preceding expanded test run had one exit-code assertion failure while implementation edits were still occurring; that run was not treated as passing. The script and fixture source were then held fixed for a complete rerun, which passed all 74 assertions. All actual application build/type/test commands in the dry-run remain proposals, not executed validation results.
[...]
L198: A before/after hash/size/mtime comparison sampled 55 protected existing files. It detected concurrent changes in `apps/web/tsconfig.tsbuildinfo`, `apps/web/vite.audit.config.ts`, and `playwright.audit.config.ts` while other work was active. This task only invoked the real maintenance script with scan/dry-run flags; it did not write those paths. The comparison therefore cannot be cited as proof that the entire shared checkout stayed unchanged. Fixture fingerprints and the implementation's separate read-only paths provide the maintenance-specific evidence; other agents' staged/committed work was left untouched.
[...]
L200: Reports produced by the script are timestamped private logs in an excluded `maintenance-reports` directory after confirmation. The raw verification stdout files beside this document are separate audit artifacts captured by the host and may be ignored by the repository's existing `*.log` rule. No credentials or raw package-manager output are stored in them.
[...]
L215: ## Archived Bash usage reference
L216: 
L217: The following preserves the unique usage/portability details formerly in the engineering guide. It is historical; the named Bash implementation is absent.
L218: 
L219: ### Archived Bash guide
L220: 
L221: > **Current checkout correction (2026-10-21, `a771a87b`):** `project-maintenance.sh` and `scripts/tests/project-maintenance.test.sh` are absent from both the working tree and tracked-file inventory. Commands and implementation results below are historical/proposed material, not runnable instructions or a verified deliverable in this checkout. Restoring a maintenance tool that changes build files requires explicit authorization under AGENTS.md; this documentation audit does not restore it.
L222: 
L223: 
L224: Run from the repository root in Bash:
L225: 
L226: ```bash
L227: ./project-maintenance.sh
L228: ```
L229: 
L230: If the executable bit was not preserved by the checkout:
L231: 
L232: ```bash
L233: chmod +x project-maintenance.sh
L234: ./project-maintenance.sh
L235: ```
L236: 
L237: The script opens a menu for scanning, build cleanup, dependency removal, cache cleanup, installation, combined maintenance, individual project selection, dry-run previews and report export. Menu option 11 deletes all recursively discovered *verified* build artifacts and caches; menu option 12 installs frozen dependencies and rebuilds all supported projects. Choosing a mutation shows the exact targets and commands, validates prerequisites, then requires the exact confirmation `APPLY`. Empty input or EOF cancels. Report-only export requires `EXPORT`. Cleanup is irreversible; ignored artifacts have no Git rollback. Stop dev servers/builds before maintenance and keep backups of anything that is not disposable.
L238: 
L239: ## Read-only inspection
L240: 
L241: ```bash
L242: ./project-maintenance.sh --scan
L243: ./project-maintenance.sh --dry-run --operation full
L244: ./project-maintenance.sh --scan --sizes
L245: ```
L246: 
L247: Scanning and dry-run write nothing to the target repository. Disk measurements are opt-in because traversing dependency installations can be slow; readings are not additive in linked workspaces. `--scan`, `--dry-run` and `--execute` are mutually exclusive. No configuration module or arbitrary project command is executed during discovery.
L248: 
L249: ## Selecting operations
L250: 
L251: ```bash
L252: # Review one member's build cleanup, without changing anything.
L253: ./project-maintenance.sh --dry-run --operation build --project apps/web
L254: 
L255: # Restore once at the workspace root, with a fresh confirmation prompt.
L256: ./project-maintenance.sh --execute --operation install --project .
L257: 
L258: # Choose validation commands; order is preserved.
L259: ./project-maintenance.sh --dry-run --operation validate --check build --check unit --check integration
L260: 
L261: # Exclude an exact subtree; exclusions are literal, not shell globs.
L262: ./project-maintenance.sh --dry-run --operation full --exclude path/to/independent-project
L263: 
L264: # Explicitly classify a reviewed, regenerable local cache. Hard protections remain.
L265: ./project-maintenance.sh --dry-run --operation caches --approve-cleanup caches:tools/generated-cache
L266: 
L267: # Explicit report export after a scan; requires typing EXPORT.
L268: ./project-maintenance.sh --scan --export-report
L269: ```
L270: 
L271: `--root PATH` inspects another explicitly chosen project boundary. Repeat `--project`, `--exclude`, `--approve-cleanup` and `--check` as needed. A selected workspace member cannot remove a shared installation without selecting the workspace owner. A root workspace install installs its members once; a genuinely independent deep project gets its own command. A combined reinstall cleans selected build output and dependency installations before frozen installation; use `--operation rebuild` (menu option 12) to clean verified build/cache output, install frozen dependencies, and rebuild the discovered workspace.
L272: 
L273: ## Supported projects
L274: 
L275: The script is Bash, with existing Node used only to parse JSON data. Bash 3.2 or newer and standard `find`, Git, `rm`, `mkdir`, `mktemp`, `mv`, `chmod`, `wc`, `date` and `sleep` are required. `du` is optional for `--sizes`. It adds no package dependency.
L276: 
L277: - Node projects are discovered recursively outside protected/dependency directories, including independently configured deep subprojects.
L278: - pnpm workspaces use the repository's simple `packages:` YAML list. npm/Yarn workspace arrays and `{packages: [...]}` are recognized. Literal path components and single-component globs work. Unsupported workspace syntax, negative patterns, recursive `**` patterns and overlapping nested workspace definitions block installation rather than guessing ownership. Commands also refuse workspace scopes containing excluded/protected projects or their pruned ancestors.
L279: - Manager declarations and lockfiles must agree. Ambiguous managers, missing lockfiles, symlink manifests/locks, unsupported managers and declared-version mismatches block execution before removal. No lockfile is generated or deleted.
L280: - Frozen restores use `pnpm install --frozen-lockfile --ignore-scripts`, `npm ci --ignore-scripts`, Yarn 1 frozen installs with scripts disabled, or Yarn modern immutable installs with `YARN_ENABLE_SCRIPTS=false`.
L281: - Lifecycle scripts are deliberately disabled during installation. Review any required native-addon/build approvals and run them manually afterwards. This can prevent an application build until those project-specific steps are completed; restore success alone is not application validation.
L282: - TypeScript outputs are eligible when a safely parsed `tsconfig.json` explicitly identifies an in-project `outDir`. Composite metadata is paired with that output. Ambiguous JSONC, inherited/dynamic output configuration and Vite-only output conventions remain review-only instead of executing configuration code.
L283: - Known Playwright `test-results` output is classified when this repository's Playwright config exists. Losing diagnostic output is called out in the plan. Other caches require explicit review/approval.
L284: - Common Python, JVM, .NET, PHP, Ruby, Go, Rust, C/C++, Swift and Deno manifests are reported as unsupported for execution. The actual repository is a Node monorepo; `.audit/shoot.py` is a preserved auxiliary script without a Python dependency manifest. This tool does not install absent language runtimes or speculate about their cleanup conventions.
L285: 
L286: Available check selectors are `lint`, `typecheck`, `unit`, `integration`, `security`, `test`, `build`, `smoke` and `e2e`. Missing scripts are reported as skipped. Only inspected command forms run; unknown scripts and pre/post hooks require manual review and are refused. Recursive pnpm builds also inspect member build scripts/hooks. Formatting checks are supported; formatting writes, migrations, seeding, deployment, Docker cleanup, database tests against an inferred target, global cache purges and automatic server termination are excluded.
L287: 
L288: In this repository the root typecheck emits output, API/worker/tests import built shared packages, and Playwright needs Chromium and free server ports. A cleanup or dependency restore alone does not prove the app works. Choose builds before dependent checks, and read failed/skipped results.
L289: 
L290: ## Safety and reports
L291: 
L292: No directory is deletable merely because it is named `dist`, `build`, `cache`, `target` or `vendor`. Candidate rows show the owner, category, evidence, classification and optional size. Only verified/explicitly approved candidates reach the execution plan; every target is checked again immediately before deletion.
L293: 
L294: Hard protections cover source/configuration, environment files and credentials, databases/dumps/migrations, original public assets, documentation, user data, nested repositories, tracked/staged files, excluded descendants, Reticle/browser evidence and the Obsidian vault. Dependency cleanup allows installed package source/configuration but still refuses embedded secrets and data. Symlink roots/ancestors are rejected; dependency symlinks are unlinked with their installation and never traversed. Generated declarations/maps/assets inside verified output directories are distinguished from original source/static input.
L295: 
L296: A repository-local `.project-maintenance.lock` serializes approved operations. An existing lock is never overridden automatically; investigate whether a run is active before removing a stale lock manually. This does not synchronize external dev servers or defend against a malicious concurrent filesystem writer. Do not run maintenance across bind mounts or other externally managed storage. Installation and selected validation run trusted repository/tooling code after review; this script is not a sandbox for hostile projects.
L297: 
L298: Confirmed execution and explicit export create private timestamped logs under `maintenance-reports/`, excluded from scanning and cleanup. Logs record selected operations, paths, classifications, skipped items, commands, exact exit codes, failures, warnings and final status. Raw command stdout/stderr is captured in a mode-600 temporary file, counted and removed; arbitrary output is withheld from logs to avoid publishing credentials. On failure, rerun the displayed command privately for full diagnostics. No environment dump or `.env` contents are logged. A failed restore/build stops dependent commands, and incomplete work is never reported as a pass. Removed space is not asserted from overlapping/shared allocations.
L299: 
L300: SIGINT/SIGTERM stop the invocation-owned command process group, remove private capture files and the lock, retain the report and return 130/143. Deleted artifacts stay deleted. Other errors use 1 for partial failures, 2 for invalid arguments, and 3 for fatal safety/prerequisite/discovery/reporting errors. Cancellation/no-op uses 0; interactive invalid input redisplays the menu.
L301: 
L302: ## Tests and portability
L303: 
L304: ```bash
L305: bash -n project-maintenance.sh
L306: bash -n scripts/tests/project-maintenance.test.sh
L307: bash scripts/tests/project-maintenance.test.sh
L308: shellcheck project-maintenance.sh scripts/tests/project-maintenance.test.sh # if installed
L309: ```
L310: 
L311: The tests create disposable temporary repositories, use stub package managers for command outcomes, and never delete real project output or download packages. They cover recursive discovery, spaces, workspace boundaries, dry-run preservation, confirmations, unknown/protected paths, Git provenance, exclusions, restoration failures, hooks, private reports and descendant cancellation. Native symlink and permission-denial checks explicitly skip when the host cannot enforce them.
L312: 
L313: The implementation uses portable Bash/Unix forms intended for macOS/Linux; verification in this environment uses Git Bash on Windows. Native macOS/Linux and Bash 3.2 have not been executed here. Git Bash may copy instead of creating native symlinks, and Windows ACLs do not necessarily enforce Unix mode bits. The fixture suite detects these cases instead of presenting a false pass. WSL and ShellCheck are not installed on this host.
L314: 
L315: See [the repository audit and validation record](../reports/MAINTENANCE_AUDIT_2026-10-21.md) for detected projects, approximate candidate sizes, verification results and remaining limitations. Existing build files and agent instructions are unchanged by this implementation; real cleanup/reinstallation is an operator action requiring review of the exact current plan.
L316: 
L317: 
[...]
L339: - Remove build outputs, local dependency folders, and temporary caches according to detected technology (e.g., `node_modules`, `.venv`, `__pycache__`, `.pytest_cache`, `.turbo`, `.next`, `.nuxt`, `dist`, `build`, `bin`, `obj`, `target`, `vendor`).
L340: - Strict Guardrails: Never delete source files, configuration (`.env*`, `.git`, IDE settings), manifests (`package.json`, `pom.xml`, etc.), or lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `poetry.lock`, etc.).
[...]
L346: - Respect local wrappers (`mvnw`, `gradlew`) when present; detect installed tools via PATH (`where.exe`) and gracefully warn/skip if a tool/runtime is absent without crashing the entire run.
[...]
L352: - Supported CLI flags: `--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root <path>`, `--exclude <patterns>`, `--max-depth <int>`, `--continue-on-error`, `--verbose`, `--help`.
~~~~

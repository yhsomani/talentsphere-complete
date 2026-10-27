# 07 - Testing and Operations

Audience: developers, release owners and on-call operators.
Companion: `03-DEVELOPMENT-GUIDE.md` (setup, env vars, conventions). Architecture, data, API and security: docs 01, 02, 04, 05, 06, 08.

Written 2026-10-26 on branch `docs/consolidation-2026-10-26`. **Execution disclosure:** no test, build, migration, backup, restore, container or deployment was run by the author of this document. The only repository script executed was the read-only `node scripts/check-new-hosted-migrations.mjs` (exit code 1, see section 3); an independent validator ran the same script with the same result. Every other command below was checked against `package.json`, `scripts/*`, `.github/workflows/*`, `deploy/*` and tool configs by reading them. Other documents in this set make their own execution statements (for example doc 06 records a two-process token probe); each document's statement covers only itself.

## 0. Evidence labels and ground rules

| Label | Meaning |
| --- | --- |
| **Verified-by-config** | Exists in `package.json`, `scripts/*`, CI, `deploy/*` or tool config. Read, not run. |
| **Unverified** | Stated by a repo document or inferred; never run or confirmed by config. |
| **Proposed** | Target design from `Yash_Final_Project_Document` folders 15-18, 23. Not built. |

- Dated test counts below are evidence about their own revision. They are not a statement about the current checkout.
- A passing assertion is not acceptance. Known false-green risks are in section 11.
- Agents: `AGENTS.md` forbids installs, emitting builds/typechecks and cache writes without explicit authorization. Commands marked **writes** below need that authorization. Read-only alternatives are given where they exist.
- Release status of the project as of the sources: **not production-ready** (`README.md`; `deploy/oracle/README.md`: "NOT evidence of a production release").

## 1. Test strategy

Principle (`docs/quality/TESTING.md`): tests prove intended behaviour, not accidental current behaviour. A flaky test is a defect: Playwright runs with `retries: 0` and `forbidOnly` in CI; do not add retries and do not quarantine critical tests without an owner, reason and deadline.

Risk-based minimum coverage (Proposed in `16_QA_AND_TESTING/TEST_STRATEGY.md` section 8; adopt as guidance):

| Class | Examples | Minimum layers |
| --- | --- | --- |
| R1 invariant / security / money / privacy | authz, tenancy, billing, consent, erasure | unit + integration + security + e2e journey + a negative control |
| R2 core loop | profile, evidence, apply, pipeline | unit + integration + contract + e2e + a11y |
| R3 supporting | notifications, messaging, analytics | unit + integration + smoke e2e |
| R4 presentational | static pages, copy | component/a11y/visual check |

The test layers listed in `docs/quality/TESTING.md` section 2 as a vision (component, failure/recovery, regression, AI, assessment-security) that have no dedicated suite must not be reported as covered. Only the layers in section 2 below have executable suites.

## 2. Layers and exact commands

All commands Verified-by-config (root `package.json` scripts unless stated). Run from the repo root. Windows PowerShell: use `pnpm.cmd` if `pnpm.ps1` is blocked.

| Layer | Command | Runner / config | Files on disk (2026-10-26 count) | Needs | Writes protected files? |
| --- | --- | --- | --- | --- | --- |
| Everything in Vitest default | `pnpm test` = `vitest run` | `vitest.config.ts`: includes `tests/unit`, `tests/integration`, `tests/security`, `tests/accessibility`, `tests/performance`; env `STORAGE=memory`, pinned `TOKEN_SECRET`, `PASSWORD_PBKDF2_ITERATIONS=10000` | - | Built workspace packages (see 2.1) | Vitest may write its cache |
| Unit | `pnpm test:unit` = `vitest run tests/unit` | same | 68 `*.test.ts` (domain rules, state machines, config, honesty) | - | cache |
| Integration / API contract | `pnpm test:integration` = `vitest run tests/integration` | `app.inject` against `buildApp` in memory mode | 54 | - | cache |
| Security | `pnpm test:security` = `vitest run --dir tests/security` | authz, injection, session, RLS-shaped tests | 5 | - | cache |
| Durability / real PostgreSQL | `pnpm test:pg` = `vitest run --config vitest.pg.config.ts` | `vitest.pg.config.ts`: `tests/pg/**`, 60 s test and 120 s hook timeouts, no file parallelism | 13 tests + `test-db.ts` | `TEST_DATABASE_URL` with a role that can create and drop databases | cache |
| Migration-history helper | `node --test scripts/tests/migration-integrity.test.mjs` | Node test runner | 1 | - | no |
| E2E (Chromium) | `pnpm test:e2e` (alias `pnpm test:playwright`) = `playwright test` | `playwright.config.ts`: `tests/e2e`, 1 worker, `fullyParallel: false`, `retries: 0`, timeout 30 s, base URL `http://127.0.0.1:4173` | 58 `*.spec.ts` (+ `content.ts`, `fixtures.ts` helpers) | Built `apps/api/dist` and `apps/web/dist`; Chromium | `test-results/` (the `trace: 'on-first-retry'` setting never records a trace because `retries` is 0) |
| Accessibility | `pnpm test:a11y` = `playwright test tests/e2e/accessibility.spec.ts` | real Chromium | 1 spec | as E2E | as E2E |
| Performance baseline | `pnpm test:performance` = `playwright test tests/e2e/performance.spec.ts` | writes percentiles to `test-results/performance/*.json` | 1 spec | as E2E | `test-results/` |
| Lint | `pnpm lint` = `prettier --check "**/*.{ts,tsx,js,json,md}"` | `.prettierrc`, `.prettierignore` | - | - | no |
| Typecheck | `pnpm typecheck` = `tsc -b && tsc -p tests` | project references; `tests/tsconfig.json` is `noEmit` | - | - | **writes** (`dist`, `tsbuildinfo`) |
| Static hosted-migration audit | `node scripts/audit-hosted-supabase-migrations.mjs` | static SQL scan, no DB | - | - | no (stdout JSON) |
| Static new-migration check | `node scripts/check-new-hosted-migrations.mjs` | fails if a migration after 00051 references `auth.*`. **It exits 1 on the current tree** ("Unreviewed platform Auth reference in new migration: 00054_repoint_auth_users_foreign_keys.sql"; 00054 legitimately mentions `auth.users` to repoint keys). | - | - | no |
| Bundle secret scan | `node scripts/check-client-secrets.mjs` | scans `apps/web/dist` for sentinel server secrets | built web | **sentinel env vars** set | no |
| Schema / migration-ledger preflight | `node scripts/release-preflight.mjs --mode=schema` | read-only transaction | - | `DATABASE_URL` | no |

Notes:

- `vitest.config.ts` also lists `tests/accessibility/**` and `tests/performance/**`; both directories exist but are empty. Accessibility and performance coverage is the Playwright specs.
- `pnpm validate` = `pnpm typecheck && pnpm test:unit` (writes, via typecheck).
- The default Playwright servers: API via `node scripts/start-e2e-api.mjs` (imports `apps/api/dist/server.js`, memory-mode config, `BILLING_MODE=simulated`, very high rate limits), web via `pnpm --filter @talentsphere/web preview --port 4173`. They reuse already-running servers locally and never in CI.

### 2.1 Read-only alternatives for agents (from `docs/quality/TESTING.md`; Unverified here)

```text
node node_modules/vitest/vitest.mjs run --configLoader native --no-cache
node node_modules/typescript/bin/tsc -p apps/api/tsconfig.json --noEmit --incremental false --composite false --declaration false --declarationMap false
```

These still import already-built workspace output and cannot certify a fresh build. Installing Chromium, rebuilding output or starting Vite can write protected paths; for a documentation-only change run static checks only.

### 2.2 What each layer proves and does not

- **Unit/integration/security run on `STORAGE=memory`.** They prove rule logic and HTTP behaviour, not durability, restart behaviour, database constraints, RLS, or the worker. `test:pg` carries those (restart round trip, race arbitration for BR-15, erasure concurrency, job claim fencing, private-data RLS, billing, messaging, notifications, saved searches and jobs, admin audit, feature flags, work-history removal).
- **E2E** boots the memory-mode API; it does not exercise the Postgres path, Firefox/WebKit, real email, real Stripe, real uploads, rate limits (raised), or screen readers.
- **Accessibility** covers semantics, landmarks, names, keyboard reachability, focus, 320 px reflow, 200 % zoom and reduced motion. Not covered: automated contrast (`axe-core` is not a dependency) and any assistive technology. Do not make an accessibility conformance claim from this.
- **Performance** asserts only gross-regression guards (route render 5 s, API response 2 s, interaction 3 s); it records a baseline but sets no SLO. DB query counts and queue age are not measured.
- **Honesty tests** `tests/unit/persistence-honesty.test.ts` and `tests/unit/database-migrations.test.ts`, plus `tests/unit/production-config.test.ts`, guard against fake persistence, migration drift and unsafe deployed config. Never weaken them.

### 2.3 Dated evidence (history, not current)

| Date | Source | Result recorded |
| --- | --- | --- |
| 2026-10-21 | `docs/reports/FEATURE_STATUS_2026-10-21.md` (source `a771a87b`) | Vitest 1,172 passing in 115 files; migration helper 5 passing; ten TS projects pass with emission disabled; Prettier failed on seven files. Two probes reproduced defects: arbitrary challenge text scored `passed`/100, and six leased jobs executed nine times with two workers. |
| 2026-10-21 | `docs/reports/E2E_AUDIT_2026-10-21.md` | Playwright-CLI audit, 227 checks: 191 pass, 36 fail (16 real defects, 20 test or tool errors); after fixes, 13/13 regression checks and full suite green (113 files, 1159 tests). Ran in memory mode only; Postgres path, other browsers, rate limits, real email/payments not tested. |
| 2026-10-23 | `docs/system-model/05-audit.md` | `pnpm test` 120 files, 1266 tests pass; `pnpm lint` passes; tsc `--noEmit` on API and tests clean; `pnpm build` ok; `pnpm test:e2e` 256 passed in 5.0 minutes. **Not run:** `pnpm test:pg`, anything against live Stripe or hosted Supabase, any deployment. |

Nothing above establishes PostgreSQL behaviour, deployment readiness, or a fresh pass on this checkout.

### 2.4 Proposed additional layers (not built)

From `16_QA_AND_TESTING/TEST_STRATEGY.md` (Draft; tool names are options): contract tests (OpenAPI diff, consumer-driven, AsyncAPI), tenant-canary and permission-matrix suites, DAST on staging, Lighthouse CI budgets, k6-style load/soak, resilience/chaos (Toxiproxy-class), offline/service-worker tests, real-device lab for iOS/Android, deployment smoke and canary analysis, migration lock-time tests on a sized copy, scheduled recovery drills, mutation-sanity checks for security suites, and CI-computed traceability (GOAL to FEAT to FR to AC to TEST). Critical journeys J1-J14 are defined there; the built E2E suite maps to the candidate, recruiter and institution loops in `docs/quality/TESTING.md` section 5, not to J1-J14. Release gates RG-01 to RG-14 in that document are Proposed.

## 3. CI gates

Authoritative file: `.github/workflows/ci.yml` (workflow `CI`; triggers: push to `main`, every pull request, manual; one job `verify` on `ubuntu-latest`, 30 min timeout, `concurrency` cancels superseded runs). Postgres 16 service container (password `postgres`, `pg_isready` health check). Steps in order, all blocking:

| # | Step | Command |
| --- | --- | --- |
| 1 | Setup | pnpm 11.7.0, Node 24 with pnpm cache |
| 2 | Install | `pnpm install --frozen-lockfile` |
| 3 | Browser | `pnpm exec playwright install --with-deps chromium` |
| 4 | Lint | `pnpm lint` |
| 5 | Typecheck | `pnpm typecheck` |
| 6 | Unit, integration, security | `pnpm test` |
| 7 | Migration history guard | `node --test scripts/tests/migration-integrity.test.mjs` |
| 8 | Hosted-Supabase incompatibility must remain detected | `node scripts/audit-hosted-supabase-migrations.mjs` must exit 1, report `checkedMigrations >= 51`, and still count `auth_uid_claim` or `platform_auth_fk` hits |
| 9 | Migrations on a clean DB | `node scripts/migrate.mjs` twice; second output must contain "Already up to date" (`DATABASE_URL=.../talentsphere_ci`) |
| 10 | Schema and ledger after upgrade | `node scripts/release-preflight.mjs --mode=schema` |
| 11 | Persistence tests on real PostgreSQL | `pnpm test:pg` (`TEST_DATABASE_URL=.../postgres`) |
| 12 | Build and scan browser bundle | `pnpm build` then `node scripts/check-client-secrets.mjs`, with synthetic sentinel values for `TOKEN_SECRET`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `API_AUTH_TOKEN`, `BILLING_WEBHOOK_SECRET` (never real secrets) |
| 13 | E2E, accessibility, performance | `pnpm test:e2e` |
| 14 | Artifacts | On failure upload `test-results/` and `playwright-report/` (7 days); always upload `test-results/performance/` (30 days) |

Other workflows:

| Workflow | Trigger | Gate |
| --- | --- | --- |
| `hosted-supabase-audit.yml` | PR touching `supabase/migrations/**`, the audit script, or itself; manual | Runs the static audit, uploads its JSON, runs `scripts/check-new-hosted-migrations.mjs` (blocks new `auth.*` dependencies in migrations 00052+). **Known red guard:** the script scans every file numbered above 51, not only the PR's files, and 00054 matches, so this workflow fails for every PR that touches `supabase/migrations/**` until the script or 00054's handling is changed (script is protected; ask first). Do not read a red result here as caused by your new migration without checking which file it names. |
| `oracle-staging.yml` | PR touching `deploy/oracle/**`, `.dockerignore`, itself; manual | `docker compose config --quiet` with synthetic env; fails if the `db` or `api` service publishes any host port |

Notes: `docs/quality/TESTING.md` section 10 lists a shorter, older CI sequence (no migration, pg, bundle-scan or ordering after `build`). `ci.yml` is the truth. No deploy job, no image build, no dependency or container vulnerability scan, no SBOM, no coverage threshold and no secret-scan of git history exist in CI (Verified-by-config by absence in `ci.yml`).

## 4. Environments

| Environment | What exists | Config source | Data |
| --- | --- | --- | --- |
| Local dev | `pnpm dev`, `.env` copied from `.env.example`, local PostgreSQL or `STORAGE=memory` | `.env`, process env | Synthetic |
| CI | GitHub Actions job above, Postgres 16 service | workflow env | Synthetic |
| Staging (Oracle) | `deploy/oracle/compose.yaml` (own Postgres container) or `compose.supabase.yaml` (external managed Postgres). `NODE_ENV=staging`. | `deploy/oracle/.env` (gitignored) | "Non-public staging account", restricted testers |
| Staging (Coolify) | `deploy/coolify/compose.yaml`, TLS by Coolify's Traefik | Coolify env | as above |
| Production | **None.** Public launch is blocked pending issues #44 to #50 (email, privacy, migrations, operations, persistence, interview integrity, billing) | - | - |
| Preview per PR | None | - | - |

Neither staging variant has been run on a VM in the sources: `deploy/oracle/README.md` states "This config has not been executed on an Oracle VM"; `RECOVERY.md` states the backup scripts "are not yet executed". Treat everything in sections 5-9 as Unverified in practice.

`NODE_ENV` values: `development`, `test`, `staging`, `production`. `staging` and `production` get the deployed hardening (required `TOKEN_SECRET`, `STORAGE` must be `pg`, no default DB DSN, CSP header, internal error messages hidden). Production additionally refuses `BILLING_MODE=simulated`, Stripe test keys and localhost CORS (`packages/config/src/env.ts`). Environment variables: doc 03 section 4.

## 5. Deployment

### 5.1 Topology (Verified-by-config)

Images are built from `deploy/oracle/Dockerfile` (context = repo root, Node 24 bookworm-slim, `pnpm install --frozen-lockfile && pnpm build`, runs as user `node`). Targets: `api` (`node apps/api/dist/index.js`), `worker` (`node apps/worker/dist/index.js`), `web` (Caddy 2 serving `apps/web/dist` plus `deploy/oracle/Caddyfile`). The image carries source and build tooling (not slimmed).

| Service | Oracle `compose.yaml` | Coolify `compose.yaml` | Oracle `compose.supabase.yaml` |
| --- | --- | --- | --- |
| `db` (postgres:16-bookworm, volume `db_data`, `pg_isready` healthcheck) | yes, `internal` network only | yes | none (managed Postgres via `DATABASE_URL`) |
| `api` | `TRUST_PROXY=1`, no healthcheck, no published port | `TRUST_PROXY=2`, node-fetch healthcheck on `/health` | `TRUST_PROXY=1`, `SUPABASE_PROJECT_REF` set |
| `worker` | no healthcheck | no healthcheck | no healthcheck |
| `web` (Caddy) | publishes 80, 443, 443/udp; automatic HTTPS using `SITE_DOMAIN` and `ACME_EMAIL`; `/api/*` proxied to `api:4000`; SPA fallback; `nosniff`, referrer policy, `X-Frame-Options: DENY` | no host ports, `auto_https off`, listens on `:80` behind Traefik; wget healthcheck | as Oracle |

All set `STORAGE=pg`, `BILLING_MODE=disabled`, `APP_URL=https://$SITE_DOMAIN`, `CORS_ALLOWED_ORIGINS=https://$SITE_DOMAIN`. The `internal` network has no gateway; `egress` lets api and worker reach providers.

### 5.2 Oracle Always Free procedure (from `deploy/oracle/README.md`; Unverified in practice)

Host preparation:

1. ARM64 Ubuntu instance with Docker Engine and the Compose plugin from official packages.
2. Oracle VCN rules and host firewall: allow only 22/tcp from a trusted management IP, 80/tcp and 443/tcp for testers (443/udp only for HTTP/3). Keep 4000 and 5432 private. SSH keys only.
3. Point the `SITE_DOMAIN` A/AAAA record at the instance and confirm it resolves before TLS issuance.
4. Copy `deploy/oracle/.env.example` to `deploy/oracle/.env`; set `SITE_DOMAIN`, `ACME_EMAIL`, a URL-safe `POSTGRES_PASSWORD`, a distinct strong `TOKEN_SECRET`; `chmod 600`.
5. Review configuration and migrations. Do not auto-migrate on restart.

Initial deployment, from the repo root:

```sh
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml build
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d db
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml run --rm --no-deps api node scripts/migrate.mjs
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml ps
```

Container start is not readiness. After start verify: HTTPS and certificate, sign-up/login, worker heartbeat, migration ledger, a browser journey, tenant isolation, resource use, outbound mail if enabled (section 6).

Managed-database variant (`compose.supabase.yaml`): `DATABASE_URL` is server-only; the API refuses a URL that does not match `SUPABASE_PROJECT_REF` or lacks `sslmode=verify-full`. **`pnpm db:migrate` is blocked on hosted Supabase**; the hosted adapter (doc 03 section 7, `supabase/hosted/README.md`) and full RLS verification are release gates. `deploy/oracle/NEW_SUPABASE_PROJECT.md` states the compose file "is not a functioning application deployment by itself". That file names the hosted project `talentsphere-production` (region `ap-south-1`, Mumbai) while this document says no production environment exists: the name is a project label, not evidence of a production release. Connection notes from it: the direct endpoint may be IPv6-only; if the Oracle network cannot reach it, use the Supabase session pooler, whose database username is `postgres.<project ref>`; the API validates the project ref and requires TLS certificate and hostname verification (`sslmode=verify-full`). No previous Supabase project is configured or supported by this profile.

### 5.3 Coolify (from `deploy/coolify/compose.yaml` header; Unverified in practice)

Create a Docker Compose build-pack application with compose path `deploy/coolify/compose.yaml`; set `POSTGRES_PASSWORD`, `TOKEN_SECRET`, `SITE_DOMAIN` as Coolify variables; assign the domain to the `web` service on port 80. Trusted-proxy chain is Traefik to Caddy to API, hence `TRUST_PROXY=2`. The Coolify `web` mounts its own Caddyfile over the one baked into the image. Email variables are not passed to its worker (section 10).

### 5.4 Hard constraints

- **Exactly one API instance per database** (advisory lock; in-memory read model). Never `--scale api`, never run two replicas.
- No access-control gateway in front of staging; restrict testers at the network layer.
- Deploy order that matters: build, DB up, migrate, then API and worker. Migrations are a manual, reviewed step.
- Rollback: **no documented rollback procedure.** Practical path (Unverified): redeploy the previous image tag, and if a migration ran, forward-fix with a new migration (applied SQL is immutable). A schema rollback needs a restored backup.

### 5.5 Known deployment-file defects (report, do not edit; protected files)

1. `deploy/oracle/.env.example` and both Oracle compose files use `RESEND_API_KEY`; the code supports `EMAIL_PROVIDER` `none` or `brevo` only and never reads `RESEND_API_KEY`. The compose files do not pass `BREVO_API_KEY`, so Brevo cannot be enabled through them.
2. `deploy/coolify/compose.yaml` passes no email variables to the worker; the API's email section is a comment.
3. `deploy/oracle/compose.yaml` has no `api`, `worker` or `web` healthchecks; Coolify has api and web only.
4. `.claude/launch.json` lists port 3000 for the preview server; the web dev server uses 5173.
5. **Oracle default configuration likely does not boot the API.** `deploy/oracle/.env.example` ships `EMAIL_FROM=` empty, and `deploy/oracle/compose.yaml` (api and worker) and `compose.supabase.yaml` pass `EMAIL_FROM: ${EMAIL_FROM:-}`, so the container receives an empty string. `ServerEnvSchema.EMAIL_FROM` is `z.string().email().optional()` (`packages/config/src/env.ts`), and an empty string fails validation, so `validateServerEnv()` throws at API start ("Invalid server environment configuration"). The worker trims empty values to undefined and is not affected. Workaround without editing a protected file: in your private, gitignored `deploy/oracle/.env` set `EMAIL_FROM` to a syntactically valid address you control (removing the line does not help, because the compose default `:-` also yields an empty string). The permanent fix is a change to the protected compose files (pass the variable only when set). Not run in a container; derived from reading the schema and compose files (Unverified).
6. **`/health` is not reachable through the Caddy front end.** Both Caddyfiles proxy only `/api/*` to the API; any other path (including `/health`) falls through to the SPA `index.html` and returns 200 with HTML. External checks must use `/api/v1/health`. The Coolify `api` healthcheck works because it calls `127.0.0.1:4000/health` inside the container.
7. The `hosted-supabase-audit.yml` guard is red for every migration PR (section 3).

### 5.6 Proposed delivery model (not built; `17_DEVOPS_AND_INFRASTRUCTURE`)

Build once, sign, promote the same artifact; SBOM and image signing; IaC for environments; dedicated migration job with its own DB role, run once under an advisory lock; expand then migrate then contract migrations with N/N-1 compatibility; staged rollout (staging soak, internal, canary cohort by stable principal hash, majority, full) with automatic halt on error ratio, latency, auth failures and a business proxy; feature flags and kill switches; rollback sequencing across API, worker and schema; immutable release record; hotfix path. None exists today.

## 6. Health checks

Verified-by-config (`apps/api/src/server.ts`, `packages/domain`, `apps/api/src/storage/index.ts`, `scripts/release-preflight.mjs`):

| Check | What it proves | Not proof of |
| --- | --- | --- |
| `GET /health` | API process liveness. Body `status`, `timestamp`, `version`. Exempt from rate limiting. Reachable only directly on port 4000 (container-internal checks); through the Oracle/Coolify Caddy it returns the SPA page, so use `/api/v1/health` externally. | Database, worker, email, billing |
| `GET /api/v1/health` | Same plus `environment`. Exempt from rate limiting. | same |
| `GET /api/v1/admin/health-diagnostics` (platform admin) | Storage mode, live database round trip, queue status and active job count, durable-versus-ephemeral route split, worker liveness from the database heartbeat | Delivery receipts |
| Worker heartbeat | Worker writes `public.worker_health.last_seen_at` between claim cycles when 10 s elapsed. Admin diagnostics mark the queue degraded when the heartbeat is missing or older than 45 s. | Throughput (long batches delay the write) |
| `node scripts/release-preflight.mjs --mode=schema` | Applied-migration ledger matches repo files (no changed applied SQL), 00043/00049 present, required indexes and foreign keys target `public.users`, RLS enabled on six sensitive tables | Cross-tenant isolation, grants, policies |
| `node scripts/release-preflight.mjs --mode=operational` | All of schema, plus worker heartbeat <= 45 s, no queued jobs overdue > 5 min, no `dead`/`failed` job in the last hour. Exit code 1 on failure, JSON on stdout, read-only transaction. | An alerting system: the script alerts on nothing by itself; schedule it from an external monitor and wire the exit code |
| Compose `db` healthcheck | `pg_isready` | Schema |
| Coolify `api` / `web` healthchecks | `/health` fetch / `wget /` | Dependencies |
| `node scripts/hosted-supabase-preflight.mjs` | Read-only inventory (tables, RLS flags, policies, ledger existence) of the configured database | Authorization correctness |

Post-deploy smoke checklist (`docs/quality/TESTING.md` section 11, Verified as intent only): authentication, authorization, a critical API call, database connectivity, queue health, storage, observability, one critical journey. No automated post-deploy smoke job exists.

## 7. Observability as built

Verified-by-config unless noted.

- **Logs:** Pino JSON (`packages/observability/src/logger.ts`), level from `LOG_LEVEL`, redaction of `req.headers.authorization`, `password`, `token`, `apiKey`, `secret`, `accessToken`, `refreshToken`. Refused requests (4xx) log at `info` as `API request rejected`; server faults (5xx) log at `error` as `API request failed` with stack. **Alert on error-level logs.** No log shipping or retention is configured; logs go to container stdout (`docker compose logs`).
- **Correlation:** every response carries `x-request-id` (honours an inbound id); error bodies repeat it as `request_id`.
- **Audit:** admin actions are written to the SQL table `admin_audit_logs` (`admin-audit-store.ts`). The `AuditSink` interface in `packages/observability` is an in-memory implementation only and is not durable. No general-purpose audit trail beyond admin actions was verified.
- **Metrics, tracing, dashboards, uptime probes, error tracker, status page:** none in the code or deploy files (no OpenTelemetry, Prometheus or Sentry dependency was found). The performance Playwright spec records percentiles only in CI.
- **Domain signals available to scrape from SQL:** `public.background_jobs` (queued, retry, dead), `public.worker_health`, `schema_migrations`.
- **Security headers:** `@fastify/helmet` registered in the API; Caddy adds `nosniff`, referrer policy, `X-Frame-Options`. A 2026-10-21 audit found no `content-security-policy` on JSON API responses; deployed environments are documented to enable CSP (Unverified for the web host).

Proposed (`17_*/OBSERVABILITY_DESIGN.md`, `15_*/SLO_AND_PERFORMANCE_TARGETS.md`; Draft): OpenTelemetry traces across client, API, DB and worker; golden-signal dashboards as code; SLOs (for example core API 99.9 % over 30 days) with multi-window burn-rate alerts (fast 14.4x/1 h and 5 min page, medium 6x/6 h page, slow 3x/24 h ticket); invariant alerts (cross-tenant canary, outbox age, backup age, certificate expiry, webhook failures, AI spend); synthetic probes and RUM; alerts must link a runbook, dashboard and owner. SLO ratification is deferred until baseline measurement (`docs/quality/OPERATIONS.md` section 3).

## 8. Backup and restore

Built (Verified-by-config; **never executed** per `deploy/oracle/RECOVERY.md`):

- **Backup:** `bash deploy/oracle/backup.sh` on the host. Requires `deploy/oracle/.env`. Runs `pg_dump -Fc` for database `talentsphere` as user `talentsphere` through `docker compose exec` into `private-backups/talentsphere-<UTC timestamp>.dump` (or `$BACKUP_DIR`), umask 077, writes to a `.partial` file and renames on success, refuses an empty file. The output directory must stay private, untracked and not web-served.
- **Restore check:** `bash deploy/oracle/verify-restore.sh /path/to/backup.dump` creates a throwaway database `ts_restore_<epoch>_<pid>`, runs `pg_restore --exit-on-error --no-owner --no-acl`, counts rows in `public.schema_migrations`, and drops the database. It does not replace the live database and is explicitly "not a full disaster recovery rehearsal".
- Applies to `deploy/oracle/compose.yaml` only (it execs into the `db` service). It does not cover the Coolify compose (different project name, same service) or the managed Supabase database; use the provider's backups there (Unverified, not documented in the repo).

Missing before real users (stated by `RECOVERY.md` and `deploy/oracle/README.md`): encrypted off-VM destination, retention, scheduler, missed-backup alert, separate-host restore drill, documented RPO/RTO, verification of application data and workflows after restore, point-in-time recovery, volume (`db_data`, `caddy_data`) backup, secret/config backup, worker/job-queue recovery procedure.

Restore-to-live procedure for `deploy/oracle/compose.yaml` (derived from `backup.sh`, `verify-restore.sh` and the compose file; **Unverified, never executed**). `C` below means `docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml`; run from the repo root on the host; the dump is custom format from `pg_dump -Fc`.

1. **Rehearse first.** `bash deploy/oracle/verify-restore.sh <dump>` into a throwaway database. Do not restore to live if this fails.
2. **Stop writers.** `C stop api worker web` (single-writer rule; nothing may write during the restore). Keep `db` running.
3. **Safety copy.** `bash deploy/oracle/backup.sh` (dump the current state, even if damaged) and keep it.
4. **Replace the database.** `C exec -T db dropdb -U talentsphere talentsphere`, then `C exec -T db createdb -U talentsphere talentsphere`, then `C exec -T db pg_restore --exit-on-error --no-owner --no-acl -U talentsphere -d talentsphere < <dump>`. The `--no-owner --no-acl` flags and role names are copied from `verify-restore.sh`; grants and roles set outside the dump are not restored.
5. **Check the schema.** Run `node scripts/release-preflight.mjs --mode=schema` with `DATABASE_URL` pointing at the restored database (from a host or container that can reach `db`; `db` publishes no port, so use `C run --rm --no-deps api node scripts/release-preflight.mjs --mode=schema`).
6. **Start services.** `C up -d api`, then `worker`, then `web`. Exactly one API. Confirm `/api/v1/health` over HTTPS, a sign-in, and `--mode=operational` once the worker heartbeat is fresh.
7. **Reconcile.** Data written after the dump time is lost (RPO equals the age of the dump; no RPO or RTO is defined). Re-apply any account erasure requested after the dump time: a restore can bring erased data back and no tombstone mechanism is documented as built (check `public.data_erasure_requests` in the safety copy). Reconcile Stripe-derived billing state against the provider if billing was on. Restart the API after any manual SQL, because the core read model hydrates at boot.
8. Treat dumps as personal data: encrypt, restrict, never commit or upload. For the Coolify variant the same steps apply with that compose file; for managed Supabase use the provider's backup and restore tooling (not documented in the repo).

Proposed targets (`15_*/SLO_AND_PERFORMANCE_TARGETS.md` section 8, `17_*/DEPLOYMENT_ARCHITECTURE.md` section 7; placeholders, not commitments): single-node failure RPO about 0 and RTO under 5 minutes with a synchronous replica; logical corruption via point-in-time recovery with RPO under 5 minutes and RTO under 1 hour; encrypted backups with a separate key; drills before first launch, after any backup-system change and on a schedule; off-site restore on a separate host; erasure tombstone replay after restore; DR tiers T1 to T5. Object storage, region loss and DR values are explicitly open decisions.

## 9. Runbooks and recovery

### 9.1 Built / documented operations

| Situation | Procedure (source) |
| --- | --- |
| API will not start in staging or production | Read the printed list from `productionConfigProblems()`; fix each named variable (doc 03 section 10) |
| Second API refuses to boot | Intended single-writer lock. Stop the other process. Losing the lock session makes API traffic return 503 until restart |
| Stale read model after SQL edit | Restart the API |
| First platform admin | SQL `UPDATE public.users SET roles = array_append(roles, 'platform_admin') ...` then restart (`docs/quality/OPERATIONS.md` section 9) |
| Worker stalled or queue degraded | Check heartbeat age, long claim batch, DB reachability, `background_jobs` retry/dead rows. Note: leased batches can be reclaimed and a job can execute twice (audit D-02); handlers must be idempotent |
| Email 503 | Provider not fully configured. Fail-closed by design; configure Brevo (sender authenticated, HTTPS `APP_URL`, key) and test real mailboxes. A provider "accepted" is not "delivered"; no bounce/delivery webhook is consumed |
| Checkout unavailable | Check `BILLING_MODE`, `STRIPE_*`, user role; "redirect success" is not subscription confirmation, inspect persisted subscription and events and Stripe logs |
| Stripe webhook failures | Endpoint `POST /api/v1/billing/stripe-webhook`; verify signing secret not rotated; events handled: checkout completion, subscription created/updated/deleted, invoice paid/payment_failed, charge refunded. Disputes and voided invoices are unsupported. The generic `/api/v1/billing/webhook` uses a different HMAC signature |
| Bad migration | Do not edit applied SQL. Forward-fix with a new migration. Hosted: follow the hosted adapter; never run `db:migrate` against hosted Supabase |
| Secret exposure | Rotate. `TOKEN_SECRET` rotation signs out all users; `BYO_AI_KEY_ENCRYPTION_KEY` rotation needs a planned re-encryption (no tool exists). There is no incident procedure document (see Proposed) |
| Privacy request | Settings export (`POST /api/v1/settings/export`, partial JSON snapshot; CSV returns 503) and erasure request (no scheduled executor exists; 30-day grace versus immediate deletion needs owner and legal approval). Do not claim automatic due-date deletion |
| Background-job retention | Terminal jobs older than 7 days are purged opportunistically; one-time codes and reference tokens are stripped from finished job payloads |

### 9.2 Proposed incident process (not built; `18_OPERATIONS_AND_SUPPORT`, Draft)

Lifecycle: detect, triage and declare severity, assign roles, contain, assess, recover, verify, communicate, blameless review, track actions. Severity: Sev-1 includes any cross-tenant exposure or suspected exposure (page immediately, preserve evidence before restarts), Sev-2 major degradation, Sev-3 partial with workaround, Sev-4 minor; "when unsure, declare higher". Roles: incident commander, operations lead, security lead, communications lead, scribe, privacy/legal liaison, support liaison. Response-time numbers and rota size are placeholders until on-call capacity is known.

Runbook index `RB-01` to `RB-37` is specified (trigger and first steps) but **none is written**. Those most relevant to the built system:

| ID | Topic | First steps (summary) |
| --- | --- | --- |
| RB-01 | Suspected cross-tenant exposure | Declare Sev-1, page security, preserve logs/audit before restart, contain via kill switch or deny rule, revoke sessions in scope |
| RB-03 | DB failover, pool exhaustion, disk pressure | Check primary health, pool waits, locks; shed load; failover only if standby in sync |
| RB-04 | API elevated errors | Compare error rate by route and release; roll back if tied to a deploy; check saturation |
| RB-05 | Bad deploy, config or migration | Stop rollout, freeze deploys, identify change set, roll back or forward-fix; never contract-migrate under pressure |
| RB-10 to RB-12 | Worker backlog, stuck/duplicate jobs, outbox/poison event | Identify class, pause lower priority, check lease and fencing, quarantine poison event, replay with dedupe |
| RB-15, RB-17 | Email provider outage, Stripe/webhook failure | Check provider status and queue retention; keep entitlements as last known; replay events idempotently |
| RB-26 | Secret or signing-key compromise | Declare incident, rotate, invalidate sessions if session keys affected, review access logs |
| RB-28, RB-29, RB-30, RB-31 | Data-rights failure, backup/restore failure, corruption (PITR), DR failover | Privacy lead engaged; treat failed backup as an incident; stop writer; restore to side instance; reconcile |
| RB-34 | Billing drift | Provider-versus-local reconciliation, repair by audited action, not manual entitlements |

Operations processes PROC-01 to PROC-15 (privileged access, maintenance windows, business continuity/DR, change and release management, billing disputes) are also design-only.

## 10. Release checklist

Use for any staging deployment or release candidate. "Required by" shows the source; items without a built mechanism are marked manual.

Before merge (all enforced by `ci.yml`, section 3):

- [ ] `pnpm lint`, `pnpm typecheck` green.
- [ ] `pnpm test` green (unit, integration, security).
- [ ] Migration history guard, clean-database migration (twice, second is a no-op), and `release-preflight --mode=schema` green.
- [ ] `pnpm test:pg` green against real PostgreSQL.
- [ ] `pnpm build` and the browser-bundle secret scan green.
- [ ] `pnpm test:e2e` green with `retries: 0` (includes accessibility and performance specs).
- [ ] If migrations changed: hosted-supabase audit workflow green; no new `auth.*` references after 00051.
- [ ] If `deploy/oracle/**` changed: Oracle staging config workflow green (no published db/api ports).

Before deploy (manual; sources `docs/quality/OPERATIONS.md` sections 8-9, `deploy/oracle/README.md`):

- [ ] UI-visible changes have a Reticle verdict (`verified: "yes"`), not `unknown`/`no-fault`.
- [ ] Completion report written: files changed, behaviour, tests executed, security, migrations, known limitations, docs updated (`AGENTS.md`).
- [ ] Docs updated for the behaviour change; ADR for material decisions; feature-status record not overstated.
- [ ] Deployed config satisfies `productionConfigProblems()`: private `TOKEN_SECRET` (not the published test one), `STORAGE=pg`, non-default `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `TRUST_PROXY`, `BILLING_MODE` appropriate (never `simulated` in production), email and Stripe fully configured or off.
- [ ] Target database: `release-preflight --mode=pre-00043` (populated DB, once) then `--mode=schema`; no unexpected checksum drift.
- [ ] Backup taken immediately before any migration; restore verified with `verify-restore.sh` (currently never executed).
- [ ] Exactly one API instance; worker present.
- [ ] Rollback or forward-fix path stated for this release (no standard procedure exists).

After deploy:

- [ ] `GET /api/v1/health` ok over HTTPS (not `/health`: through Caddy that path returns the SPA page, section 5.5 item 6); TLS certificate valid.
- [ ] Sign-up, login, one core journey (profile, evidence, apply) by hand or Reticle.
- [ ] `release-preflight --mode=operational` passes (worker heartbeat fresh, no overdue or dead jobs).
- [ ] Admin health diagnostics show DB reachable and queue healthy.
- [ ] Error-level log lines reviewed.
- [ ] If email enabled: real-mailbox delivery test recorded. If Stripe enabled: test-mode checkout, webhook receipt and reconciliation recorded (production refuses test keys).

Public-launch blockers (not checklist items: they are open work, from `deploy/oracle/README.md`, `NEW_SUPABASE_PROJECT.md`, `docs/quality/OPERATIONS.md`): #44 email delivery proven, #45 privacy and legal deletion timeframes, #46 migrations on hosted Supabase and populated-upgrade proof, #47 operations (encrypted off-site backups, restore drill, RPO/RTO, monitoring and alerting), #48 persistence of long-tail modules, #49 interview and assessment integrity (challenge code is not executed; see docs 04 and 08), #50 billing (live acceptance). Also required: two-user/two-organization isolation tests against SQL and the API, hardened runtime images with pinned digests and scans, resource limits, service healthchecks.

Proposed release gates RG-01 to RG-14 (`16_*/TEST_STRATEGY.md` section 9) and fitness functions FF-01 to FF-10 are the target model, not current practice.

## 11. Known gaps and risks

Testing

- No automated check that documentation matches code.
- Challenge code is not executed: submissions are recorded as `submitted` with `executed: false` and are unscored (commits 3e9bedbf and 77cb8bd6 replaced the earlier fake `passed`/100; see docs 04 and 08). Tests that asserted simulated scoring were a 2026-10-21 finding; recheck any assessment test against the intended requirement. The 2026-10-21 `grep` false-green in `tests/security/injection-defenses.test.ts` was fixed (commit 52705d34; the file now contains no grep call).
- `pnpm test:pg` is not in the three dated local-run records in section 2.3; doc 01 cites a 2026-10-23 CI run with 50 PG tests in 11 files, which is the only recorded execution path (the tree now has 13 pg test files). Not reproduced here.
- Accessibility: no contrast automation, no screen-reader testing. Performance: no SLO, no DB or queue metrics. No Firefox or WebKit, no real-device tests, no load or soak tests, no DAST, no dependency/container/secret-history scanning in CI.
- Worker duplicate execution under two workers was reproduced on 2026-10-21 (six jobs executed nine times); batch leases and multi-store erasure have unresolved recovery risks.
- Hostile-input E2E exists (`hostile-user.spec.ts`, `ui-sweep.spec.ts`) but multi-organization IDOR on hiring and pagination at scale were listed as untested in the 2026-10-21 audit.
- `docs/quality/TESTING.md` section 10 (older CI list) disagrees with `ci.yml`; this document follows `ci.yml`.

Operations

- Staging has never run on a VM; backups have never run; no encrypted off-site copy, schedule, retention, RPO/RTO or alerting.
- No metrics, tracing, uptime monitor, error tracker, log retention or status page. Audit trail is limited to admin actions.
- No rollback procedure, no deploy pipeline, no image scanning or signing, images contain build tooling and source.
- Single API writer: no horizontal scaling, no high availability; an API restart is required to see SQL edits.
- Health endpoints prove liveness only. Worker health depends on a database heartbeat that long batches can delay.
- Email: acceptance by Brevo is not delivery; no bounce handling; a timeout retry can send a duplicate. Oracle/Coolify files cannot enable Brevo as written (section 5.5).
- Hosted Supabase: adapter exists but live applied state is contradictory across documents; RLS isolation (two-user test) and a restore drill are unproven; platform-auth dependencies in historical migrations remain by design.
- Maintenance mode toggle changes only the health panel and blocks no requests (2026-10-21 finding, open at that date).
- Weak passwords (`password`, `12345678`) were accepted on 2026-10-21; session token lives in `localStorage` (documented risk).
- The target SLOs, alerts, runbooks RB-01 to RB-37, incident process, DR tiers, canary delivery and migration-to-target plan (`Yash_Final_Project_Document` folders 15-18, 23) are Draft design only.

Documentation

- Section 2.3 counts come from dated reports and were not reproduced. File counts in section 2 were taken by listing `tests/` on 2026-10-26 (68 unit, 54 integration, 5 security, 13 pg, 58 e2e specs).
- Sources read only in part: `docs/reports/*` (grepped and sampled, not read in full), `Yash_Final_Project_Document` folders 15, 16, 17, 18, 23, 29 (headings plus selected sections).

## 12. Requirements preserved from `docs/quality/` (intent; most not built)

Carried here so the originals can be retired later. Each is a stated requirement in `docs/quality/TESTING.md` or `OPERATIONS.md`, not evidence of coverage. Check section 2 for what actually runs.

Coverage ownership per layer (`TESTING.md` section 3): unit = domain rules, pure transformations, scoring, matching explanations, state transitions; component = UI states, forms, validation, accessibility behaviour (no dedicated component suite exists); integration = database, RLS, queues, provider adapters, transactional workflows; API = authorization, schema validation, pagination, errors, idempotency, rate limits; E2E = critical journeys; security = authorization fuzzing, RLS deny tests, tenant isolation, SSRF, upload, webhook replay, secrets; accessibility = keyboard, focus, semantics, screen reader, zoom, contrast, reduced motion; performance = route startup, interaction latency, API p95/p99, DB queries, queue age.

Critical E2E journeys (`TESTING.md` section 5):
- Candidate: sign-up, goal, skills, learning, assessment, evidence, job, apply.
- Recruiter: organization, job, search, review, message, interview, decision.
- Institution: tenant, learner, learning, assessment, credential, verification.

Assessment-security tests to have (section 6): session binding, timing, submission idempotency, answer protection, `AI_PROHIBITED` enforcement, closure of AI escape routes, suspicious-event capture, retry behaviour, replay resistance.

AI tests to have (section 7): prompt injection, data-boundary enforcement, provider fallback, free-user cost gate, provenance, malformed model output, policy denial, context minimisation, groundedness evaluation where applicable. No external model provider is connected today.

Data-integrity tests to have (section 8): unique and foreign-key constraints, state-transition validity, audit records, evidence-revocation impact, tenant isolation, migration verification (partly covered by `tests/pg` and the migration-history guard).

Flaky tests: owner, reason and removal deadline are mandatory before any quarantine of a critical test.

Operating model (`OPERATIONS.md` sections 1-8, target):
- Environments `local, CI, preview, staging, production`, each with separate secrets and configuration (no preview environment exists).
- Critical trace: request, user, tenant, feature, API, DB or queue, provider, result; structured logs, metrics, traces, audit events, business dashboards (only logs and request ids exist).
- Alert on: error rate, latency or SLO breach, queue age and backlog, database saturation, auth failures, tenant-isolation signals, payment and webhook failures, AI policy and cost anomalies, assessment-integrity anomalies (none are wired).
- Backups and DR must prove restore, point-in-time recovery where supported, storage recovery, queue recovery, configuration restoration and rollback.
- Incident lifecycle: detect, contain, assess, recover, communicate, post-mortem.
- Runbooks required at minimum for: database incident, auth, RLS or tenant isolation, storage, queue, provider outage, payments, AI provider or policy, assessment integrity, privacy request, rollback, disaster recovery (none written; see section 9.2).
- No release without: security gate, critical E2E, accessibility evidence, migration proof, rollback path, observability, business acceptance.
- Post-deploy smoke tests cover authentication, authorization, a critical API, database connectivity, queue health, storage, observability and a critical user journey.

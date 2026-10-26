# 03 - Development Guide

Audience: a new developer or AI agent who must set up, build, test and change TalentSphere from scratch.
Companion: `07-TESTING-AND-OPERATIONS.md` (tests, CI, deploy, recovery). Architecture, data model, API and security live in docs 01, 02, 04, 05, 06 and 08; this guide links to them by number and does not repeat them.

Written 2026-10-26 on branch `docs/consolidation-2026-10-26`. Nothing in this guide was executed while writing it: every command was checked against `package.json`, `scripts/`, CI and config files only.

## 0. Evidence labels

| Label | Meaning |
| --- | --- |
| **Verified-by-config** | The command, file or value exists in `package.json`, `scripts/*`, `.github/workflows/*`, `deploy/*` or a tool config. It was read, not run. |
| **Unverified** | Documented by a repo document, or inferred; no config or source read confirms it, or it was never run. |
| **Proposed** | Target design from `Yash_Final_Project_Document` folders 15-18, 23, 29. Nothing described as Proposed is built. |

Rule when sources disagree: `package.json` scripts, CI and config win; then source code; then `ARCHITECTURE.md`; then dated reports (history only). A feature is not "implemented" because a document says so; check `docs/reports/FEATURE_STATUS_2026-10-21.md` (a dated snapshot) and the code.

## 1. Prerequisites

| Requirement | Version / value | Source | Label |
| --- | --- | --- | --- |
| Node.js | 24 (CI `node-version: 24`, Docker `node:24-bookworm-slim`). Root `package.json` has no `engines` field and there is no `.nvmrc`. A 2026-10-21 report records local Node v24.19.0. | `ci.yml`, `deploy/oracle/Dockerfile` | Verified-by-config |
| pnpm | 11.7.0, pinned by `packageManager` in root `package.json`; CI uses `pnpm/action-setup` version 11.7.0. | `package.json`, `ci.yml` | Verified-by-config |
| PostgreSQL | 16 (CI service `postgres:16`; Compose `postgres:16-bookworm`). Needed for `db:migrate`, `test:pg` and any `STORAGE=pg` run. | `ci.yml`, `deploy/*/compose.yaml` | Verified-by-config |
| Playwright Chromium | Installed with `pnpm exec playwright install --with-deps chromium` (CI). Only Chromium is configured. | `ci.yml`, `playwright.config.ts` | Verified-by-config |
| Docker Engine + Compose plugin | Only for the deploy descriptors in `deploy/`. | `deploy/oracle/README.md` | Verified-by-config |
| Git | Any recent version. | - | Unverified |
| PowerShell / Git Bash on Windows | See section 8. | `CLAUDE.md`, `README.md` | Verified-by-config |

Workspace shape (`pnpm-workspace.yaml`): `apps/*` and `packages/*`. `allowBuilds: esbuild` and `onlyBuiltDependencies: [esbuild]` are set.

| Workspace | Package | Role |
| --- | --- | --- |
| `apps/api` | `@talentsphere/api` | Fastify 5 API (`src/server.ts` holds `buildApp` and nearly all routes) |
| `apps/web` | `@talentsphere/web` | React 19 + Vite 5173 app |
| `apps/worker` | `@talentsphere/worker` | Postgres job-claim worker plus email adapter |
| `packages/config` | `@talentsphere/config` | Zod server env schema and deployment refusals |
| `packages/contracts` | `@talentsphere/contracts` | Zod request schemas, error envelope |
| `packages/domain` | `@talentsphere/domain` | Pure business rules, auth primitives, job store |
| `packages/observability` | `@talentsphere/observability` | Pino logger with redaction, audit interface |
| `packages/testing` | `@talentsphere/testing` | Shared test factories |
| `packages/ui` | `@talentsphere/ui` | Design tokens (`src/tokens.ts`) |

Details of what each module does: doc 02.

## 2. Hard rules before you touch anything

These come from `AGENTS.md` and `CLAUDE.md` (Verified-by-config; they are instructions, not tool-enforced).

1. **Build files are read-only for AI agents.** Do not create, edit, delete, rename, regenerate or stage: any `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, any `tsconfig*.json`, `vite*.config.*`, `vitest*.config.*`, `playwright.config.*`, `.github/workflows/**`, `deploy/**`, Dockerfiles, Compose files, `.dockerignore`, `.prettierrc*`, `.prettierignore`, `.gitignore`, `.gitattributes`, release/build scripts (`scripts/generate-icons.js`, `scripts/start-e2e-api.mjs`, `scripts/release-preflight.mjs`), and generated output (`dist/`, `build/`, `coverage/`, `node_modules/`, `*.tsbuildinfo`, source maps).
2. **Indirect writes count.** Dependency installs, formatters, code generators, Reticle init, and emitting builds or typechecks are all forbidden for agents without explicit user authorization. A generic "build/test/install" request is not that authorization. If a task needs a protected-file change, state the blocker and the proposed path; do not make the change.
3. **Do not commit or push unless asked.** Record `git status` before work, compare afterwards, and never revert or stage someone else's edits.
4. **Keep changes small.** Ask before any large refactor.
5. **Business rules live only in `packages/domain`.** Routes call them and never restate them.
6. **Do not weaken** auth, RLS, rate limits, or the honesty and migration tests (`tests/unit/persistence-honesty.test.ts`, `tests/unit/database-migrations.test.ts`).
7. **UI changes need a Reticle verdict** (section 9.4).
8. Escalate (do not decide alone): schema-breaking design, security architecture, AI provider/entitlement, pricing/entitlement behaviour, major API versioning, consequential decision logic.
9. `SSOT.md` (intent) and `docs/PRICING.md` are not edited as part of development documentation work.

## 3. Setup, step by step

Operator setup. An AI agent must not run steps 1 and 4 (install, build) without explicit authorization (rule 2).

1. **Install dependencies.** `pnpm install --frozen-lockfile` (Verified-by-config: CI and Dockerfile use the same command). On Windows PowerShell use `pnpm.cmd` if `pnpm.ps1` is blocked (section 8).
2. **Create `.env`.** Copy `.env.example` to `.env` at the repo root (`.env` is gitignored). Set at least `DATABASE_URL` and a private, stable `TOKEN_SECRET` (>= 32 characters). Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` (command given in `.env.example`). API and worker load `.env` from the current directory or `../../.env` via `process.loadEnvFile`; variables already in the process environment are never overridden by the file. Never commit real values and never reuse the secrets published in `test-secrets.mjs`: the API refuses them in staging and production.
3. **Create the database and apply migrations (local PostgreSQL only).** `pnpm db:migrate`. It may create the database. Do **not** run it against hosted Supabase; it refuses `*.supabase.co` and `*.pooler.supabase.com`. See section 7.
4. **Build.** `pnpm build`. Required before `pnpm dev` because the API and worker `dev` scripts run `node dist/index.js`.
5. **Start.** `pnpm dev` (section 5).
6. **Open** `http://localhost:5173`. Vite proxies `/api` to `http://127.0.0.1:4000`. `GET /health` is liveness only.

Disposable run without a database: `STORAGE=memory` (data is lost at restart; the separate worker idles and does not process the API's in-memory queue; deployed startup refuses it).

## 4. Environment variables

Names and purposes only; no values. Source of truth: `packages/config/src/env.ts` (`ServerEnvSchema`), `.env.example`, `apps/worker/src/index.ts`, `apps/worker/src/email/config.ts`, `apps/web/src/**` (`import.meta.env`), `deploy/**`.

"Where read": **API** = `apps/api/src/index.ts` via `validateServerEnv()` then `productionConfigProblems()`; **Worker** = `apps/worker/src/index.ts` and `email/config.ts` read `process.env` directly; **Web** = Vite build time; **Script** = `scripts/*`.

### 4.1 Core

| Variable | Purpose | Required? | Where read |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` (default), `test`, `staging`, `production`. `staging` and `production` are "deployed": extra refusals apply. | Optional locally; set by deploy files | API, Worker |
| `DATABASE_URL` | PostgreSQL connection string. Default is a local dev DSN that deployed startup refuses. | Required for `STORAGE=pg`, migrations, worker | API, Worker, Script |
| `STORAGE` | `pg` (default outside tests) or `memory`. `memory` is refused in staging/production. | Optional | API, Worker |
| `TOKEN_SECRET` | Signs session tokens (>= 32 chars). Unset locally: random per process, sessions die on restart. Required when deployed. Rotating it signs everyone out. | Required when deployed | API (domain `auth.ts` also reads `process.env`) |
| `PASSWORD_PBKDF2_ITERATIONS` | Password hash work factor. Deployed minimum 210000. Tests set 10000. | Optional | API |
| `PORT`, `HOST` | API listen address. Defaults 4000, `0.0.0.0`. | Optional | API |
| `APP_URL` | Public web origin; used in links. HTTPS required in deployed environments for email and Stripe. Default `http://localhost:5173`. | Required (HTTPS) when email or Stripe is on | API, Worker |
| `API_URL`, `APP_NAME`, `APP_VERSION` | Declared in schema; `APP_VERSION` is returned by `/health`. `API_URL` and `APP_NAME`: no consumer found in `apps/*/src`. | Optional | API |
| `LOG_LEVEL` | Pino level (`fatal` ... `trace`), default `info`. | Optional | API, Worker (`packages/observability`) |
| `LOG_FORMAT` | `json` or `pretty`. Declared in schema; no consumer found. | Optional | schema only |
| `CORS_ALLOWED_ORIGINS` | Comma-separated web origins. Production refuses `localhost`. Default `http://localhost:5173`. | Required when deployed | API |
| `TRUST_PROXY` | `1` (one trusted hop), `true`, or proxy IP/CIDR list. Required behind a proxy or all clients share one rate-limit bucket. Oracle uses `1`, Coolify `2`. | Required behind a proxy | API |
| `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS` | Global limiter, default 300 per 60000 ms, per account (per address if anonymous). Health routes are exempt. | Optional | API |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Login attempts per IP+email and sign-ups per IP per 15 minutes. Default 10. | Optional | API |

### 4.2 Hosted Supabase

| Variable | Purpose | Required? | Where read |
| --- | --- | --- | --- |
| `SUPABASE_PROJECT_REF` | 20-character project id. When set in a deployed environment the API requires `DATABASE_URL` to match it and to carry `sslmode=verify-full`. | Optional (hosted DB only) | API |
| `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL`, `SUPABASE_BUCKET_AVATARS`, `SUPABASE_BUCKET_RESUMES`, `SUPABASE_BUCKET_COURSE_CONTENT`, `SUPABASE_BUCKET_PORTFOLIO` | Declared in the schema with dev placeholders. Supabase Auth and Storage are not used; no consumer found in `apps/*/src`. Never put a service-role key in a Vite variable. | Optional | schema only |

### 4.3 Billing

| Variable | Purpose | Required? | Where read |
| --- | --- | --- | --- |
| `BILLING_MODE` | `disabled` (default), `simulated` (activates paid plans without payment; refused in production), `stripe`. | Optional | API |
| `BILLING_WEBHOOK_SECRET` | HMAC key (>= 16 chars) for the generic `/api/v1/billing/webhook`. Unset: webhook answers 503. | Optional | API |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Needed with `BILLING_MODE=stripe`. Production refuses test-mode keys. | Required for stripe mode | API |
| `STRIPE_PRICE_CANDIDATE_PRO_MONTHLY`, `STRIPE_PRICE_CANDIDATE_PRO_YEARLY`, `STRIPE_PRICE_RECRUITER_STARTER_MONTHLY`, `STRIPE_PRICE_RECRUITER_STARTER_YEARLY`, `STRIPE_PRICE_RECRUITER_ENTERPRISE_MONTHLY`, `STRIPE_PRICE_RECRUITER_ENTERPRISE_YEARLY` | One Stripe price id per plan and cycle; ids must be distinct; at least one required in stripe mode. | Required (>= 1) for stripe mode | API |

Billing details and prices: doc 04/08 and `docs/PRICING.md`.

### 4.4 Email

| Variable | Purpose | Required? | Where read |
| --- | --- | --- | --- |
| `EMAIL_PROVIDER` | `none` (default) or `brevo`. Anything else is a startup error. | Optional | API, Worker |
| `BREVO_API_KEY` | Brevo secret (>= 12 chars). | Required if `brevo` | API, Worker |
| `EMAIL_FROM` | Sender authenticated in Brevo. | Required if `brevo` | API, Worker |
| `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO` | Display name (default `TalentSphere`), reply address. | Optional | API, Worker |

### 4.5 AI and secrets at rest

| Variable | Purpose | Required? | Where read |
| --- | --- | --- | --- |
| `BYO_AI_KEY_ENCRYPTION_KEY` | 64 hex characters (AES-256-GCM key) for stored user-supplied AI keys. Without it, storing such a key is refused. Separate from `TOKEN_SECRET`. | Optional | API (`account-store.ts`, `server.ts`) |
| `AI_ENABLED`, `AI_FREE_USER_PAID_INFERENCE`, `AI_CLOUD_FALLBACK_ENABLED`, `AI_REQUEST_TIMEOUT_MS` | Declared in schema; no consumer found in `apps/*/src`. `z.coerce.boolean()` treats the text `false` as true, so do not rely on them to disable anything. No external model provider is connected. | Optional | schema only |

### 4.6 Web build (public by design)

| Variable | Purpose | Required? | Where read |
| --- | --- | --- | --- |
| `VITE_SUPPORT_EMAIL` | Support address shown in UI; unset hides the line. | Optional | Web (`import.meta.env`) |
| `VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL` | Contact addresses. Set only after ownership and monitoring are proven; unset keeps the privacy page reporting that public release is blocked. | Optional | Web |

Everything with a `VITE_` prefix is embedded in the browser bundle. Server secrets must never get one (CI guards this, see doc 07).

### 4.7 Test, CI, deploy and tooling variables

| Variable | Purpose | Where |
| --- | --- | --- |
| `TEST_DATABASE_URL` | Postgres URL for `pnpm test:pg`. The role must be able to create and drop databases: the pg suites make a per-file test database and drop it afterwards (`tests/pg/test-db.ts`). CI uses the `postgres` superuser on the service container. | `tests/pg`, CI |
| `CI` | Enables `forbidOnly` in Playwright and disables server reuse. | Playwright |
| `API_AUTH_TOKEN` | Only a CI sentinel name for the bundle secret scan; the application does not read it. | `scripts/check-client-secrets.mjs` |
| `SITE_DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD` | Oracle/Coolify Compose interpolation. `POSTGRES_PASSWORD` must be URL-safe because it is inlined into `DATABASE_URL`. | `deploy/*` |
| `RESEND_API_KEY` | Present in Oracle Compose and `deploy/oracle/.env.example`, but **no code reads it**; the shipped adapter is Brevo only (see section 10 and doc 07 known gaps). | `deploy/oracle` |
| `BACKUP_DIR` | Output directory for `deploy/oracle/backup.sh`. | Script |

Test-only signing secrets live in `test-secrets.mjs` (`TEST_TOKEN_SECRET`, `TEST_WEBHOOK_SECRET`). They are public, hashed in `packages/config/src/env.ts`, and refused in deployed environments.

## 5. Local development

All commands Verified-by-config unless noted.

| Goal | Command | Notes |
| --- | --- | --- |
| Run web + API + worker | `pnpm dev` | Root script: `pnpm --parallel --filter "./apps/*" dev`. API and worker run `node dist/index.js` (no compile, no watch). Web runs `vite` on 5173. |
| Run one app | `pnpm --filter @talentsphere/web dev` (or `@talentsphere/api`, `@talentsphere/worker`) | |
| After editing API/worker/package source | `pnpm build`, then restart the process | Stale `dist` is the most common "my change does nothing" cause. |
| Web only edits | Vite hot reload | |
| Seed feature flags | `pnpm db:seed` | Runs `scripts/seed.mjs`: applies `supabase/seed/01_initial_seed.sql`; creates that file if missing (a write; run only with authorization). |
| Create first platform admin | No API route does this. In SQL: `UPDATE public.users SET roles = array_append(roles, 'platform_admin') WHERE lower(email) = lower($1);` then restart the API | From `docs/quality/OPERATIONS.md`. The API read model is hydrated at boot, so SQL edits need a restart. |

Facts that shape dev work:

- Run **one API process per database.** An advisory lock (`pg_try_advisory_lock(718201, 1)`) makes a second API refuse to boot. Do not scale the API.
- Ports: API 4000, Vite dev 5173, E2E web preview 4173 (see `playwright.config.ts`).
- Responses from modules that keep state in process memory carry `x-talentsphere-durability: ephemeral`. Do not promise persistence for those.
- Billing stays `disabled` unless you are deliberately working on the Stripe adapter.
- `.claude/launch.json` defines a preview server named `dev` as `pnpm run dev` on port 3000. The web app listens on 5173, so that port value looks wrong (Unverified; it is a protected-adjacent tooling file, do not edit).

## 6. Build

| Task | Command | Writes build output? |
| --- | --- | --- |
| Build everything | `pnpm build` | Yes. Runs `pnpm --recursive --filter "./packages/*" build`, then `./apps/*`. Package/API/worker `build` is `tsc`; web is `tsc && vite build`. |
| Typecheck (project references + tests) | `pnpm typecheck` = `tsc -b && tsc -p tests` | **Yes** (`tsc -b` emits `dist` and `tsbuildinfo`). Treated as an emitting command under `AGENTS.md`. |
| Read-only typecheck of one project | `node node_modules/typescript/bin/tsc -p apps/api/tsconfig.json --noEmit --incremental false --composite false --declaration false --declarationMap false` | No. From `docs/quality/TESTING.md`; needs existing declaration output from dependencies. Unverified in this guide. |
| Lint (Prettier check) | `pnpm lint` | No |
| Format (write) | `pnpm format` | Writes source. Not for agents repo-wide. |
| Clean a package | `pnpm --filter <name> clean` | Deletes its `dist` |
| Validate | `pnpm validate` = `pnpm typecheck && pnpm test:unit` | Emits (via typecheck) |

TypeScript settings (root `tsconfig.json`): target ES2022, module NodeNext, `strict`, `noUnusedLocals`, `noUnusedParameters`, `composite`, project references to all nine workspaces. `tests/tsconfig.json` extends it with `noEmit` and relaxes unused checks. Prettier (`.prettierrc`): semicolons, single quotes, 2 spaces, trailing commas `es5`, width 100.

Production images build with `pnpm install --frozen-lockfile && pnpm build` inside `deploy/oracle/Dockerfile` (targets `api`, `worker`, `web`).

## 7. Database migrations

- Location: `supabase/migrations/`, 55 files `00001` to `00055`, applied in filename order. The runner requires a contiguous sequence from `00001` and rejects empty files.
- Runner: `pnpm db:migrate` = `node scripts/migrate.mjs`. One transaction per file; records `filename` and sha256 `checksum` in `schema_migrations`; re-running prints "Already up to date" and changes nothing; if an already-applied file's content changed, it refuses to run (`scripts/lib/migration-integrity.mjs`). It creates the database if absent and installs a local Supabase-compatibility shim (`auth.users`, `auth.uid()`, `auth.jwt()`), organization alias views and a users mirror. Source: `scripts/migrate.mjs`, `scripts/lib/pg.mjs`.
- **Applied SQL is immutable.** Never edit an applied migration; add a new one. Next number is `00056`.
- **Hosted Supabase is a separate, manual path.** The runner refuses hosted endpoints. Use `supabase/hosted/README.md` and `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md`: `00001`, `01_org_aliases.sql`, `00002`-`00053`, `00054` (repoints foreign keys to `public.users`), `02_data_api_lockdown.sql`, then record each file with its sha256 in `schema_migrations`. The live state of that project is Unverified (the hosted README claims 00001-00055 applied on 2026-10-23; another dated doc, `docs/system-model/05-audit.md`, says the same project held one keepalive migration and no application tables; the conflict is unresolved).
- **New migrations must not reference `auth.users`, `auth.uid()`, `auth.jwt()` or `CREATE/ALTER/DROP ... auth.`** after `00051` (`scripts/check-new-hosted-migrations.mjs`, run in the `hosted-supabase-audit.yml` workflow). Application identity lives in `public.users`; tokens are Fastify-issued, not Supabase JWTs.
- New tenant or private tables need RLS and grants in the same migration, plus a test (`tests/pg/private-data-rls.test.ts` is the pattern).
- `00043` builds a case-insensitive unique index on `users.email`; on a populated database run `node scripts/release-preflight.mjs --mode=pre-00043` first (read-only) and fix duplicates by an approved backfill, not by deleting rows.
- Read-only inventory of a configured database, safe on hosted Supabase: `node scripts/hosted-supabase-preflight.mjs`. Static dependency audit (no DB): `node scripts/audit-hosted-supabase-migrations.mjs` (exit code 1 is expected while historical SQL references `auth.*`).
- `supabase/functions/` and `supabase/tests/` are empty directories.
- Do not run migrations automatically on service restart (`deploy/oracle/README.md`). Data model reference: doc 05.

Proposed (not built; `Yash_Final_Project_Document/17_*` OPS-REL section 8): expand then migrate then contract; N and N-1 API compatible with the schema; `lock_timeout`/`statement_timeout`; a dedicated migration job; no ad-hoc production SQL.

## 8. Windows and PowerShell notes

- The repo is developed on Windows. PowerShell can block `pnpm.ps1` under the default execution policy. Run `pnpm.cmd ...` (or `cmd /c pnpm ...`). No machine-wide execution-policy change is needed or recommended (`README.md`, `CLAUDE.md`).
- Shell syntax differs: PowerShell 5.1 has no `&&`; use `a; if ($?) { b }`. Git Bash uses POSIX syntax. Use `$env:NAME = 'value'` in PowerShell, `NAME=value cmd` in bash.
- `deploy/oracle/backup.sh` and `verify-restore.sh` are Bash scripts for the Linux host, not for PowerShell.
- `clean-reinstall.bat` forwards to `clean-reinstall.ps1` (prefers `pwsh.exe`, falls back to `powershell.exe`, and explicitly uses process-scoped ExecutionPolicy Bypass). Parameters include `-DryRun`, `-CleanOnly`, `-InstallOnly`, `-Build`, `-DeepClean`, `-Root`, `-Exclude`, `-MaxDepth`, `-ContinueOnError`, `-Yes`, `-VerboseOutput`. Even `-DryRun` writes a log file. It deletes and reinstalls dependency and output directories, so agents may not run it without authorization (`docs/engineering/PROJECT_MAINTENANCE.md`). The PowerShell test files `tests/run-tests.ps1` and `tests/test-tier*.ps1` test this tool; they are not part of `pnpm test`.
- OneDrive: this checkout sits under `OneDrive\Desktop`. Syncing `node_modules`, `dist` and `test-results` is slow and can lock files (Unverified inference; consider moving the repo out of OneDrive if file-lock errors appear).

## 9. Repo conventions

### 9.1 Code style (`docs/engineering/CODE_STYLE.md`)

- TypeScript `strict`; explicit public types; avoid `any`; discriminated unions for domain states; validate external input.
- Naming: `camelCase` values and functions, `PascalCase` components and types, `UPPER_SNAKE_CASE` only for true constants, stable ID prefixes (`F-` feature, `J-` journey, `BR-` business rule). Consistent `kebab-case` filenames.
- Structure: routes thin; domain holds rules; repositories hide persistence; adapters hide providers. No abstraction before real reuse.
- React: functional components, hooks for behaviour, no business rules in JSX, accessible semantics, explicit loading/error/empty states.
- Errors: typed/canonical codes, never throw strings, preserve request ids.
- Async: timeouts on external calls, bounded retries, idempotency for retried side effects.
- Never: commit secrets, log tokens/passwords, trust client role flags, expose raw DB errors.
- Use design tokens from `packages/ui/src/tokens.ts`; no hard-coded colours or spacing in feature code.
- Unused locals/parameters fail the build (`noUnusedLocals`, `noUnusedParameters`); prefix intentionally unused parameters with `_`.
- A behaviour-changing PR updates tests, analytics, docs, migration, feature status and any ADR (`CODE_STYLE.md` section 10).

### 9.2 Status vocabulary

Never treat "documented", "implemented", "verified" and "production-ready" as equivalent. Every statement in docs and PRs names its evidence (a command run, or `path:line`). Dated reports describe their own revision, not the current checkout.

### 9.3 Agent workflow (`AGENTS.md`)

UNDERSTAND, SEARCH, PLAN, MODIFY, TEST, VERIFY, REVIEW, DOCUMENT, REPORT. Read first: `SSOT.md`, relevant PRD/TRD, `ARCHITECTURE.md`, the feature contract, security/testing rules. Every task ends with a report: files changed, behaviour changed, tests executed, security considerations, migrations, known limitations, documentation updates, final status. Before answering a codebase question in this repo, `CLAUDE.md` requires `graphify query "<question>"` (graph in `graphify-out/`) before raw grep; after code changes run `graphify update .`.

### 9.4 Reticle verification rule (`CLAUDE.md`, `AGENTS.md`, `RETICLE.md`)

- A change a user can see or do (component, form, route, request, state that reaches the screen) must be driven in the running app and produce a Reticle verdict **before** it is reported done. Use `reticle_act_and_wait` or `reticle_assert`; only these produce a verdict. Name the expected consequence (`until`) before acting.
- `verified: "unknown"` and `"no-fault"` are not passes. Never weaken or delete a check to get green.
- Skip Reticle, saying so in one line, for: documentation, comments, tests, build config, CI, dependency bumps with no user-visible effect, and backend/CLI work with no UI surface.
- One dev server at a time; do not kill processes you did not start; restart a stale server after the build config changed. Never guess the dev command; it comes from `package.json` (`pnpm dev`).
- The web Vite config loads `@reticlehq/vite-plugin`. Whether it is stripped from production bundles was not checked (Unverified).

### 9.5 Git and review

- No commit or push unless the user asks. Prefer new commits to amends. Never skip hooks.
- A large diff to a committed `graphify-out/graph.json` is expected; do not flag it as churn.
- Do not call a feature implemented from documentation alone.

## 10. Troubleshooting

| Symptom | Likely cause and check |
| --- | --- |
| `pnpm` blocked in PowerShell ("running scripts is disabled") | Use `pnpm.cmd`. Do not change the execution policy. |
| API/worker exit immediately or "Missing workspace export" | `dist` missing or stale. Operator runs `pnpm build`, then restart. |
| "Refusing to start with an unsafe production configuration" | Output lists each failed rule (`productionConfigProblems`): missing/published `TOKEN_SECRET`, `STORAGE=memory`, localhost `DATABASE_URL` or CORS, low PBKDF2 iterations, bad `SUPABASE_PROJECT_REF`/`sslmode`, half-configured email or Stripe. Fix the variable named. |
| Second API process refuses to boot | Advisory-lock single-writer. Stop the first process. Never run two writers. |
| Sessions expire at every restart | `TOKEN_SECRET` unset or changing. Set a stable private secret. |
| Rows changed in SQL are not visible | Core read model is loaded at boot. Restart the API. |
| `Invalid server environment configuration: ...` at boot | A variable failed Zod validation (for example `TOKEN_SECRET` shorter than 32, `BYO_AI_KEY_ENCRYPTION_KEY` not 64 hex, Stripe key not matching `sk_/rk_` pattern, `EMAIL_FROM` not an email). Empty-string values also fail; leave unset instead (Coolify compose comment). |
| Email routes return 503 | `EMAIL_PROVIDER` not `brevo` or key/sender/HTTPS `APP_URL` missing. Fail-closed by design. |
| Checkout unavailable | `BILLING_MODE`, `STRIPE_*` ids, or user role. The client never supplies a price. |
| Worker idle, no jobs processed | `STORAGE=memory`, or `DATABASE_URL` missing. Check `worker_health.last_seen_at` heartbeat. |
| `db:migrate` fails with "Refusing provider-hosted endpoint" | Intentional. Use the hosted track (section 7). |
| `db:migrate` fails on checksum/history | An applied file was edited or the sequence has a gap. Restore the file; add a new migration instead. |
| Migration 00043 fails | Case-insensitive duplicate emails exist. Run the `pre-00043` preflight; de-duplicate under an approved plan. |
| Oracle/Coolify email never enabled | The Oracle files pass `RESEND_API_KEY`, which nothing reads, and do not pass `BREVO_API_KEY`. The Coolify worker passes no email variables. Needs a deploy-file change (protected; ask first). |
| Playwright cannot start servers | The E2E API starts from built output (`apps/api/dist/server.js` via `scripts/start-e2e-api.mjs`); build first. Port 4000 or 4173 already used. |
| `vitest` passes but behaviour is wrong | Tests run in `STORAGE=memory` with a fast PBKDF2 setting; durability needs `pnpm test:pg`. |
| `pnpm test` hits missing built packages | Tests import some workspace packages from built `dist`; build first or follow doc 07. |

## 11. How to add a feature (follow the architecture)

Work from the safe order in `AGENTS.md`: identity/authz, core domain, persistence, API, UI, tests, observability, release. Keep each step small and check it before the next. Details of the boundaries are in doc 02; this is the checklist.

1. **Confirm it is in scope.** Find the F-id, BR-ids and journey in `docs/registries` and `SSOT.md`. Check the current status in `docs/reports/FEATURE_STATUS_2026-10-21.md` and `docs/system-model/01-inventory-and-coverage.md`. Escalate (section 2 rule 8) if it changes schema contracts, security, AI/pricing or entitlements.
2. **Domain rule** in `packages/domain/src/<feature>.ts`: pure functions and state machines, no Fastify, Zod or SDK imports. Export from `packages/domain/src/index.ts`. Add `tests/unit/<feature>-domain.test.ts` (table-driven for state machines).
3. **Contract** in `packages/contracts/src/index.ts`: Zod request schema and shared helpers (for example `httpUrl()` for URLs). Contracts never import domain.
4. **Persistence.** Core loop records go through `persist(...)` and `PgCoreStore` (`apps/api/src/storage/core-store.ts`, transaction first, read model updated after COMMIT). A new self-contained store gets its own file in `apps/api/src/storage/` and a pg test. If you keep state in an in-memory `Map`, the module is ephemeral: leave its routes out of `DURABLE_ROUTES` in `apps/api/src/durability.ts`, and every response from them is labelled `x-talentsphere-durability: ephemeral` automatically (admin diagnostics report the split). Add a route to `DURABLE_ROUTES` only when its writes go through `persist()` or a dedicated SQL store. `tests/security/core-authz.test.ts` checks every listed route exists. Never ship an ephemeral module as persisted.
5. **Migration** (if schema changes): add `supabase/migrations/00056_<name>.sql` (contiguous), no `auth.*` references, RLS and grants included (section 7). Never edit an applied file. Run `node scripts/audit-hosted-supabase-migrations.mjs` and `node scripts/check-new-hosted-migrations.mjs` mentally against your SQL; CI runs them.
6. **API route** in `apps/api/src/server.ts`: add a commented block under `/api/v1` for the feature. Parse the body with the contract, identify the caller with the existing `extractUser`/`resolveSession`, authorize against the resource (do not trust client role flags), call the domain function, persist, return through the global error handler. Do not add a parallel auth helper, error envelope, queue or audit store.
7. **Background work.** API effects commit first, then `dispatchJob`. Add a kind to `DISPATCH_EVENT_KINDS` in `packages/domain/src/background-jobs.ts` only if the worker must act; the default handler just records the event. A job that needs real work (delivery, recomputation) gets its own handler in `apps/worker/src/index.ts` that fails when it cannot do the work. Remember there is no transactional outbox and jobs may run twice; make handlers idempotent.
8. **Web.** Page in `apps/web/src/pages/<Feature>Page.tsx`, route in `apps/web/src/App.tsx`, requests through `apiJson` (`apps/web/src/lib/api.ts`), shared primitives from `apps/web/src/components/ui`, tokens from `packages/ui/src/tokens.ts`. Provide loading, empty and error states; load errors use `LoadError`, action errors use a plain notice (not a reload that discards edits).
9. **Tests, by layer** (commands in doc 07): unit for the domain; integration with `app.inject` in `tests/integration/<feature>.test.ts`; security cases in `tests/security/` for authz, IDOR, injection; `tests/pg/` for anything persisted; a Playwright spec in `tests/e2e/` for the user journey (create needed content through the API, as `tests/e2e/content.ts` does). Fix, do not retry, flaky tests (Playwright `retries: 0`).
10. **Verify in the running app** with Reticle (section 9.4), then run the relevant test layers and `pnpm lint`.
11. **Document.** Update the owning document (API in `docs/engineering/API_CONTRACTS.md`, data in `docs/engineering/DATABASE.md`, status in the feature status record) and record material decisions as an ADR in `docs/engineering/adr/`.
12. **Refresh the graph:** `graphify update .`.

Never: bypass the API/domain boundary, weaken RLS or assessment policy, silently add paid AI cost for free users, delete a feature without impact analysis, or invent undocumented requirements.

## 12. Proposed developer-experience targets (not built)

From `Yash_Final_Project_Document/29_DEVELOPER_IMPLEMENTATION_GUIDE` (status Draft, "nothing described here is built") and the QA/DevOps folders. Treat as direction only:

- Fitness functions in CI (route registry lint, module-boundary lint via dependency-cruiser, idempotency lint, migration lint, tenant canary test) before feature work.
- Every mutation carries an idempotency key, policy action, audit event and outbox event in one transaction; every endpoint ships with an OpenAPI entry.
- Cookie-based BFF sessions instead of `localStorage` tokens; AI only through a gateway.
- Feature Definition of Done: acceptance criteria automated, contract diff clean, tenant and policy tests, a11y checks, telemetry, runbook updated, feature flag default off until release gate.
- Strangler migration from this system to the target (`23_MIGRATION_AND_EVOLUTION`): plan only, no data migration approved or started.

## 13. Known gaps in this guide

- No command in this guide was executed; labels reflect configuration reading only.
- `pnpm.cmd` and the Windows notes are taken from repo docs, not tested here.
- Node minor version, `engines`, and a lockfile-vs-package consistency check were not verified.
- The Vite production bundle's treatment of `@reticlehq/vite-plugin`, and the exact consumers of schema-only variables (AI, Supabase URL/keys), were not exhaustively traced.
- `.claude/launch.json` port, the Oracle/Coolify email variable mismatch and the hosted-Supabase state conflict are reported, not resolved.

# Developer Implementation Guide

Doc ID: DEV-01 · Owner: Developer Experience · Version 1.0 · Status: Draft · This is a design guide; nothing described here is built.

## 1. Reading order
1. `00_CONTROL_CENTRE/ID_REGISTRY.md`, `CANONICAL_INVARIANTS.md`, `24_*/ADR_REGISTER.md` (binding).
2. `03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md` → your domain's rows in `04_*` (features) and `05_*` (specs).
3. `06_*` state machines, rules, decision tables for your domain.
4. `13_*/contracts/openapi.yaml` + `EVENT_CATALOG.md`; `12_*` data model.
5. UI: `07_*` screens/actions for your remote; `09_*` host + remote contracts.
6. Tests: `16_*` catalog rows linked to your features.

## 2. What to build first (dependency order; detail in `22_IMPLEMENTATION_ROADMAP/ROADMAP.md`)
| Step | Work | Why first | Gate |
|---|---|---|---|
| 0 | iOS/Android device lab (OPEN-12), assessment runner decision; evaluate Module Federation + Vite only if the ARB seeks activation (OPEN-03/11) | Retire platform and assessment unknowns; bundled delivery remains the proposed baseline whether or not federation is evaluated | Device matrix and runner decision; federation spike/ARB decision only if pursued |
| 1 | Monorepo, CI with FF-01..FF-10 checks, OpenAPI generation, design-system package | Fitness functions must exist before features | CI green on empty modules |
| 2 | Postgres schema core (identity, org, audit, outbox, idempotency), policy module, BFF sessions | Everything depends on authz + sessions + outbox | INV-T01/02/03/12 tests |
| 3 | Shell + typed `RemoteModule`/`HostApi` contract + one bundled domain module | Proves module boundaries, routing, error boundaries and server authorization without requiring federation | Bundled route and module-contract tests |
| 4 | Core loop MVP: profile → evidence → verification (referee) → jobs → apply | Value loop | Phase 1 release gate |
| 5 | Hiring and learning modules, assessments (with runner), billing | Phase 2 | Per roadmap; no independent remote deployment unless federation is activated |
| 6+ | Institutions, intelligence, community (Phase 3/4) | Conditional value | Per roadmap |

## 3. Rules every developer follows
- Business rules live only in the owning backend module (state-machine tables in `06_*`); routes and UI call them.
- No cross-module imports except `index.ts` public interface (FF-02); no remote→remote imports (FF-03).
- Every mutation: `Idempotency-Key`, policy action, audit event, outbox event in the same transaction (INV-T10, T12).
- Never display a claim as verified; use the ladder components from the design system (INV-T04).
- Never read or store tokens in JS; use BFF cookies (ADR-T06).
- Don't call AI providers directly; use the gateway (ADR-T12). AI output is never evidence (INV-T08).
- Every new endpoint ships with: OpenAPI entry, policy action, tenant canary (FF-05), error cases, tests from `16_*`.
- Every new screen ships with: loading/empty/error/offline states, a11y checks (`07_*/ACCESSIBILITY_SPEC.md`).

## 4. Definition of Done (feature)
Spec ACs implemented and automated; contract diff clean (FF-06); policy + tenant tests pass; a11y checks pass; telemetry/trace propagated; runbook/alert updated if operational; docs and traceability row updated; feature flag default off until release gate.

## 5. Escalation
Schema-breaking changes, new infrastructure technology, auth/security architecture, AI entitlement, pricing, public API versioning → ADR + ARB (supersession policy in the ADR register). Open items: `24_*/OPEN_DECISIONS.md`.


## 6. Cold-start rehearsal (paper exercise, 2026-10-27)

What this is. A new engineer is given only this folder and the repository root. Each of 12 tasks is rated by reading the documents. **Nothing in this table was executed here**: every command is marked "not executed here". Commands are quoted from the root `README.md`, `CLAUDE.md` and `ARCHITECTURE.md` (pnpm 11.7.0, Node 24 per the README). They describe the **prior implementation on branch `main`**, not this documentation branch, where no application source exists; they are SOURCE-labelled reference, not TARGET_APPROVED instructions for the redesign. Per `AGENTS.md`, installs, builds and emitting typechecks need explicit human authorization because build files are read-only for agents. Only environment variable NAMES appear; no value is stated, and credentials come from a secret store named below, never from a document.

Status: PASS (the information is present and sufficient on paper), PARTIAL (present but incomplete or only for the prior implementation), FAIL (absent or contradictory). Severity: High blocks a first day, Medium costs hours, Low is cosmetic.

| # | Task | Doc pointer | Status | Missing information | Owner (role) | Severity |
|---:|---|---|---|---|---|---|
| 1 | Understand goals and scope | `README.md`, `PROJECT_MASTER_BLUEPRINT.md` §1, `PROJECT_SCOPE.md` | PARTIAL | Blueprint is "Revision Required"; goals G01..G16 wording needs confirmation against the original prompt | Documentation Architect | Medium |
| 2 | Install the toolchain | Root `README.md` "Local development": Node 24, pnpm 11.7.0, `pnpm install --frozen-lockfile` (not executed here). Target toolchain: this guide §2 step 1 and `17_DEVOPS_AND_INFRASTRUCTURE` Now see section 7 steps 1-2. | PARTIAL (upgraded) | Current-implementation toolchain now in section 7 (SOURCE-cited); target pins absent because no target code exists | Platform Architect | High |
| 3 | Obtain credentials and configure the environment | Root `README.md`: copy `.env.example`, set `DATABASE_URL` and `TOKEN_SECRET`; other names: `TEST_DATABASE_URL`, `BILLING_MODE` (default `disabled`), `EMAIL_PROVIDER`, `STORAGE`, `STRIPE_*` settings (billing only). Secrets live in the team's secret store (name undecided, OPEN-14); never in docs or the repo Now see section 7 step 3 and secret-store guidance. | PARTIAL (upgraded) | Variable NAMES now in section 7 (SOURCE: root `.env.example`); secret store product undecided (OPEN-14, OPEN-22); target variable list absent | Security Architect + Platform/SRE Lead | High |
| 4 | Initialise a fresh database | `pnpm db:migrate` (local PostgreSQL only; not executed here); hosted Supabase must NOT use that runner, follow the hosted migration gate. Target schema: `12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md`, `MIGRATION_POLICY.md` Now see section 7 step 4. | PASS (current implementation, not executed); PARTIAL (target) | Target migrations do not exist; OPEN-52 persistence bridge unresolved; seed data policy absent | Database Architect | High |
| 5 | Run host, remotes, API and workers | `pnpm build` then `pnpm dev` (web on Vite port 5173, API default port 4000, worker as a separate process; not executed here). Target: bundled mode is the baseline (ADR-T23 proposed); `MF_MODE=bundled` in `09_MODULE_FEDERATION` Now see section 7 steps 5-6. | PARTIAL (upgraded) | Target run commands absent; current-implementation steps in section 7 steps 5-6; no remotes unless federation activated | Frontend Architect + Backend Architect | High |
| 6 | Exercise the PWA flows | `08_PWA_AND_MOBILE/PWA_ARCHITECTURE.md`, `OFFLINE_AND_SYNC_DESIGN.md`; UI verification by browser (Reticle) per root `CLAUDE.md` | PARTIAL | No install/offline test script; no device lab (OPEN-12); iOS/Android behaviour unverified | Frontend Architect | Medium |
| 7 | Trace one feature end to end | Example path: feature in `05_*` → `ID_REGISTRY` → rule `BR-T###` in `06_*` → `ACTION_REGISTRY` ACT → `ACTION_TO_OPERATION_MAP` → `openapi.yaml` operation → `TEST_CATALOG` row → `AC_TEST_TRACEABILITY_MATRIX` | PARTIAL | 125 of 389 ACs cited by tests; action-to-API map incomplete; crosswalks are candidates (OPEN-41, OPEN-46) | QA Architect | Medium |
| 8 | Implement a small feature | §3 rules and §4 Definition of Done of this guide; root `CLAUDE.md` rules (business rules only in `packages/domain`, keep changes small) | PARTIAL | Rules describe the prior repo; target package layout (`packages/policy` etc.) is design only; no scaffolding exists | Developer Experience lead | Medium |
| 9 | Run the tests | `pnpm test`, `pnpm test:pg` (needs `TEST_DATABASE_URL`), `pnpm test:e2e`, `pnpm lint`, `pnpm typecheck` (all not executed here). Target tests: `16_QA_AND_TESTING/TEST_CATALOG.md` (214 specified, none run) | PARTIAL | Target test harness does not exist; `CH-nn`/`CT-nn` tests absent from the catalog (OPEN-P02) | QA Architect | High |
| 10 | Describe a deployment | `17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md`, `DEVOPS_AND_RELEASE_STRATEGY.md`; prior-attempt operator material under `deploy/oracle` (outside this folder) Now also 17 DEVOPS Revision 3 (gate checklist, rollback triggers, environment matrix). | PARTIAL (was FAIL) | Hosting undecided (OPEN-14), so no target deploy steps can be stated; environment names and promotion path undefined | Platform/SRE Lead | High |
| 11 | Operate, restore and erase | `18_OPERATIONS_AND_SUPPORT/RUNBOOK_INDEX.md`, `INCIDENT_MANAGEMENT.md`; erasure in `14_*/PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md` | PARTIAL | Restore drill (RG-14) not run; on-call and support owners unnamed (OPEN-16, OPEN-39); PROC-16 counsel owner unnamed (OPEN-X04); runbooks not rehearsed | SRE Lead + Privacy Lead | High |
| 12 | Find versions, owners and sign-offs | `DOCUMENT_STATUS.md`, `ADR_REGISTER.md`, `OPEN_DECISIONS.md` §6 | PARTIAL | Owners are roles, not named people; no sign-off exists for any document (ARB not convened); version pins for the target stack are absent | Documentation Architect + Executive sponsor | Medium |

Result (original pass): 0 PASS, 11 PARTIAL, 1 FAIL out of 12.

Re-score after the section 7 and 17_DEVOPS patch (paper only, nothing executed): against the current implementation 1 PASS (task 4), 11 PARTIAL, 0 FAIL (task 10 moves FAIL to PARTIAL: `17_DEVOPS_AND_INFRASTRUCTURE` now has a gate checklist, rollback triggers, environment matrix; hosting still OPEN-14). Against the target redesign, 0 PASS, 12 PARTIAL, 0 FAIL, because no target code, run commands or secret store exist. The rehearsal finds the documents sufficient to orient a reader but not to start building or deploying the target: the target toolchain, secret store, run commands and hosting are the gaps. This is a documentation judgement; no engineer attempted it (OPEN: schedule a real cold-start trial and record its time and blockers).


## 7. Local setup, credentials and first run (CURRENT implementation, SOURCE; not executed here)

Scope. These steps describe the **current implementation** (prior code on branch `main`: React 19 + Vite web, Fastify 5 API, pnpm workspace worker, PostgreSQL via `pg`, self-issued HMAC session tokens). They are **SOURCE** reference, not **TARGET_APPROVED** instructions for the redesigned blueprint (BFF cookie sessions, outbox, remotes). This documentation branch contains no application source, `package.json` or migrations, and `deploy/oracle` is empty here, so no command below can run on this branch. Every command is **not executed here**. Per `AGENTS.md`, installs, builds and emitting typechecks need explicit human authorization. Only variable NAMES appear.

### 7.1 Ordered steps

| Step | Action | Command or name | SOURCE |
|---:|---|---|---|
| 1 | Install runtimes | Node 24 (the CI runtime); pnpm 11.7.0 (root `packageManager`); a local PostgreSQL server (CI uses Postgres 16) | Root `README.md` "Local development"; root `CLAUDE.md` Stack and Commands |
| 2 | Install dependencies | `pnpm install --frozen-lockfile`. On Windows PowerShell, if the `pnpm.ps1` shim is blocked, use `pnpm.cmd`; no execution-policy change is needed | `README.md` step 1 and Windows note; `CLAUDE.md` Commands |
| 3 | Configure environment | Copy `.env.example` to `.env` (gitignored). Set `DATABASE_URL` and a private, stable `TOKEN_SECRET`. API and worker load `.env` from the root or two directories above their working directory; existing environment values win. See 7.2 for names | `README.md` step 2; `.env.example` header comments |
| 4 | Initialise the database (local PostgreSQL only) | `pnpm db:migrate` (applies `supabase/migrations`, 55 files in the prior repo; may create the database). Not for hosted Supabase: follow `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` | `README.md` step 3; `CLAUDE.md` Stack and Commands; `.env.example` DATABASE_URL note |
| 5 | Build, then start | `pnpm build`, then `pnpm dev` (web, API and worker in parallel). API and worker `dev` scripts run `dist/index.js`; they do not compile or watch, so rebuild and restart after source changes | `README.md` step 4; `CLAUDE.md` Commands |
| 6 | Open the app | `http://localhost:5173`; API default port 4000, Vite proxies `/api`. `/health` is liveness only, not database acceptance | `README.md` step 5 |
| 7 | Checks | `pnpm test` (Vitest); `pnpm test:pg` (needs `TEST_DATABASE_URL`); `pnpm test:e2e` (Playwright); `pnpm lint` (Prettier check); `pnpm typecheck` (emitting build) | `README.md` "Checks and contribution"; `CLAUDE.md` Commands |
| 8 | Disposable mode (optional) | `STORAGE=memory` needs no database but loses data on restart; the worker idles; refused by deployed startup checks. Keep `BILLING_MODE=disabled` | `README.md` after step 5; `.env.example` STORAGE and BILLING_MODE notes |
| 9 | Run exactly one API process per database | The API keeps an in-memory read model (ADR-015 single-writer constraint) | `.env.example` STORAGE note |

### 7.2 Environment variable names (names only; SOURCE: root `.env.example`)

| Group | Names | Notes (no values) |
|---|---|---|
| Database and storage | `DATABASE_URL`, `TEST_DATABASE_URL`, `STORAGE` (`pg` or `memory`) | `memory` refused in production-like environments |
| Session and abuse limits | `TOKEN_SECRET` (minimum 32 characters), `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX_REQUESTS`, `TRUST_PROXY` | Production and staging must set `TOKEN_SECRET` |
| Billing | `BILLING_MODE` (`disabled` default, `simulated`, `stripe`), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_CANDIDATE_PRO_MONTHLY`, `STRIPE_PRICE_CANDIDATE_PRO_YEARLY`, `STRIPE_PRICE_RECRUITER_STARTER_MONTHLY`, `STRIPE_PRICE_RECRUITER_STARTER_YEARLY`, `STRIPE_PRICE_RECRUITER_ENTERPRISE_MONTHLY`, `STRIPE_PRICE_RECRUITER_ENTERPRISE_YEARLY`, `BILLING_WEBHOOK_SECRET` | `simulated` refused in production; production refuses test-mode Stripe keys |
| Email | `EMAIL_PROVIDER` (Brevo only), `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`, `APP_URL` | Needs a verified sender domain and HTTPS `APP_URL` |
| Encryption | `BYO_AI_KEY_ENCRYPTION_KEY` (64-character hex, separate from `TOKEN_SECRET`) | Required before storing user-supplied AI keys; rotation needs a ciphertext migration |
| Web build (public) | `VITE_SUPPORT_EMAIL`, `VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL` | Public build-time values; set only after ownership and monitoring are proven |

Variables read by code but not shown in `.env.example` could not be enumerated on this branch because no source exists (OPEN item D-4 below).

### 7.3 Credentials and secret-store guidance (PROPOSED; product undecided, OPEN-14 / OPEN-22)

1. Secrets never enter documents, the repository, chat or shell history. Local `.env` is gitignored; `.env.example` holds names and comments only.
2. Use one secret store per environment: local (developer password manager or untracked `.env`), CI (CI secret variables), staging store, production store. Proposed placeholder names for the stores: `ts-staging-secrets`, `ts-production-secrets` (placeholders, not created).
3. Staging never holds production values. Use Stripe test mode and a sandbox Brevo sender outside production only.
4. Access is granted by the Platform/SRE Lead on a named-person basis, reviewed quarterly; the grant mechanism is OPEN-22.
5. Generate local secrets on the developer machine (the `.env.example` comment gives a Node one-liner for `TOKEN_SECRET`); do not reuse them across environments. Rotate on suspected exposure; `BYO_AI_KEY_ENCRYPTION_KEY` rotation is a planned migration.
6. A secret found in a commit, log or ticket is a security incident: rotate first, then clean up (see `14_SECURITY_PRIVACY_COMPLIANCE`, `18_OPERATIONS_AND_SUPPORT/INCIDENT_MANAGEMENT.md`).

### 7.4 First-run smoke (what a successful local start should show; not executed)

`pnpm build` completes; `pnpm dev` serves the web app at port 5173; the API answers `/health`; with `STORAGE=pg` the migrated database holds the core career-loop tables. Other API modules are in memory and their responses carry `x-talentsphere-durability: ephemeral` (SOURCE: `.env.example`). Cross-check against `docs/reports/FEATURE_STATUS_2026-10-21.md` before calling any feature implemented.

## 8. OPEN items: repo documents versus target blueprint (recorded 2026-10-27)

| ID | Repo (current implementation) says | Blueprint (target) says | Status |
|---|---|---|---|
| D-1 | Auth: self-issued HMAC session tokens; Supabase Auth not used (`CLAUDE.md`) | BFF cookie sessions, no tokens in JS (ADR-T06, section 3 rule above) | OPEN, owner Security Architect |
| D-2 | Single API process per database; in-memory read model (ADR-015) | At least 2 API replicas in staging; no hidden in-process state (`17_*/DEPLOYMENT_ARCHITECTURE.md` section 8) | OPEN, tied to OPEN-52 |
| D-3 | Only the core career loop is persisted; other modules in memory, labelled `ephemeral` | Every mutation transactional with audit and outbox events (INV-T10, T12) | OPEN, OPEN-52 |
| D-4 | `.env.example` is the only available variable inventory | Target variable list not defined | OPEN, owner Platform Architect |
| D-5 | Migrations: 55 SQL files via `pnpm db:migrate`; hosted Supabase uses a separate gate document | Hosting undecided (OPEN-14); target migration tool in `12_*/MIGRATION_POLICY.md` | OPEN |
| D-6 | Worker claims `background_jobs` with `FOR UPDATE SKIP LOCKED`; opt-in Brevo email | Outbox plus worker classes; email provider not fixed | OPEN |
| D-7 | Business rules only in `packages/domain`; routes in `apps/api/src/server.ts` | Backend modules with `index.ts` public interfaces (FF-02), policy module | OPEN, target layout is design only |
| D-8 | Repo hosting material in `deploy/oracle` (Oracle staging workflow, compose, backup script), not present on this branch | Hosting provider undecided | OPEN-14; verify against branch `main` before reuse |
| D-9 | Dev server ports 5173 (web) and 4000 (API) | Not specified in blueprint | LOW, record only |

Resolution rule: none of D-1..D-9 is resolved by editing this guide. Each needs an ADR or an owner decision (section 5), and the repo side must be re-checked against branch `main` because it was not readable here.

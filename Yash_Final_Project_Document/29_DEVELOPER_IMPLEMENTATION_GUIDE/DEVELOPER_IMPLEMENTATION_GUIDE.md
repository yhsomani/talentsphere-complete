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
| 2 | Install the toolchain | Root `README.md` "Local development": Node 24, pnpm 11.7.0, `pnpm install --frozen-lockfile` (not executed here). Target toolchain: this guide §2 step 1 and `17_DEVOPS_AND_INFRASTRUCTURE` | PARTIAL | Target (redesign) toolchain and version pins are not listed in one place; prior-stack commands only | Platform Architect | High |
| 3 | Obtain credentials and configure the environment | Root `README.md`: copy `.env.example`, set `DATABASE_URL` and `TOKEN_SECRET`; other names: `TEST_DATABASE_URL`, `BILLING_MODE` (default `disabled`), `EMAIL_PROVIDER`, `STORAGE`, `STRIPE_*` settings (billing only). Secrets live in the team's secret store (name undecided, OPEN-14); never in docs or the repo | PARTIAL | No document names the secret store, who grants access, or the full target variable list; `STRIPE_*` individual names not listed here | Security Architect + Platform/SRE Lead | High |
| 4 | Initialise a fresh database | `pnpm db:migrate` (local PostgreSQL only; not executed here); hosted Supabase must NOT use that runner, follow the hosted migration gate. Target schema: `12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md`, `MIGRATION_POLICY.md` | PARTIAL | Target migrations do not exist; OPEN-52 persistence bridge unresolved; seed data policy absent | Database Architect | High |
| 5 | Run host, remotes, API and workers | `pnpm build` then `pnpm dev` (web on Vite port 5173, API default port 4000, worker as a separate process; not executed here). Target: bundled mode is the baseline (ADR-T23 proposed); `MF_MODE=bundled` in `09_MODULE_FEDERATION` | PARTIAL | No target run commands; no remotes exist unless federation is activated (OPEN-03/11); API and worker need compiled output first | Frontend Architect + Backend Architect | High |
| 6 | Exercise the PWA flows | `08_PWA_AND_MOBILE/PWA_ARCHITECTURE.md`, `OFFLINE_AND_SYNC_DESIGN.md`; UI verification by browser (Reticle) per root `CLAUDE.md` | PARTIAL | No install/offline test script; no device lab (OPEN-12); iOS/Android behaviour unverified | Frontend Architect | Medium |
| 7 | Trace one feature end to end | Example path: feature in `05_*` → `ID_REGISTRY` → rule `BR-T###` in `06_*` → `ACTION_REGISTRY` ACT → `ACTION_TO_OPERATION_MAP` → `openapi.yaml` operation → `TEST_CATALOG` row → `AC_TEST_TRACEABILITY_MATRIX` | PARTIAL | 125 of 389 ACs cited by tests; action-to-API map incomplete; crosswalks are candidates (OPEN-41, OPEN-46) | QA Architect | Medium |
| 8 | Implement a small feature | §3 rules and §4 Definition of Done of this guide; root `CLAUDE.md` rules (business rules only in `packages/domain`, keep changes small) | PARTIAL | Rules describe the prior repo; target package layout (`packages/policy` etc.) is design only; no scaffolding exists | Developer Experience lead | Medium |
| 9 | Run the tests | `pnpm test`, `pnpm test:pg` (needs `TEST_DATABASE_URL`), `pnpm test:e2e`, `pnpm lint`, `pnpm typecheck` (all not executed here). Target tests: `16_QA_AND_TESTING/TEST_CATALOG.md` (214 specified, none run) | PARTIAL | Target test harness does not exist; `CH-nn`/`CT-nn` tests absent from the catalog (OPEN-P02) | QA Architect | High |
| 10 | Describe a deployment | `17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md`, `DEVOPS_AND_RELEASE_STRATEGY.md`; prior-attempt operator material under `deploy/oracle` (outside this folder) | FAIL | Hosting undecided (OPEN-14), so no target deploy steps can be stated; environment names and promotion path undefined | Platform/SRE Lead | High |
| 11 | Operate, restore and erase | `18_OPERATIONS_AND_SUPPORT/RUNBOOK_INDEX.md`, `INCIDENT_MANAGEMENT.md`; erasure in `14_*/PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md` | PARTIAL | Restore drill (RG-14) not run; on-call and support owners unnamed (OPEN-16, OPEN-39); PROC-16 counsel owner unnamed (OPEN-X04); runbooks not rehearsed | SRE Lead + Privacy Lead | High |
| 12 | Find versions, owners and sign-offs | `DOCUMENT_STATUS.md`, `ADR_REGISTER.md`, `OPEN_DECISIONS.md` §6 | PARTIAL | Owners are roles, not named people; no sign-off exists for any document (ARB not convened); version pins for the target stack are absent | Documentation Architect + Executive sponsor | Medium |

Result: 0 PASS, 11 PARTIAL, 1 FAIL out of 12. The rehearsal finds the documents sufficient to orient a reader but not to start building or deploying the target: the target toolchain, secret store, run commands and hosting are the gaps. This is a documentation judgement; no engineer attempted it (OPEN: schedule a real cold-start trial and record its time and blockers).

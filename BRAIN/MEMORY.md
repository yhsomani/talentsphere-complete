# TalentSphere — Project Memory

## 1. Memory Control

- **Project:** TalentSphere
- **Memory File:** `BRAIN/MEMORY.md`
- **Memory Version:** 1.3
- **Last Updated:** 2026-09-24 12:34
- **Current Milestone:** M0 — Platform Trust Foundation & Monorepo Bootstrap
- **Current Phase:** Phase 0 — Platform Trust Foundation
- **Overall Implementation:** 2 / 173 (1.16%) [Features F-02, F-03 verified; Foundation Epics E-01, E-04, E-05, E-09, E-10, E-13, E-14 verified]
- **Overall Verification:** 2 / 173 (1.16%) [36/36 automated tests PASS; 100% build PASS]
- **Current Release:** v0.0.1-foundation
- **Current Branch:** `main`
- **Last Known Commit:** `003c622`
- **Current Primary Task:** Phase 0 / Phase 1 — Authentication, Session & Profile Loop (F-01, F-12)
- **Next Action:** Implement authentication service and user profile domain workflows

---

## 2. Current Project Snapshot

- **Implementation Status:** GREENFIELD (0% implementation verified)
- **Backend:** Fastify + Node.js + TypeScript (modular monolith architecture planned; scaffolded directories present)
- **Frontend:** React 19 + TypeScript + Vite + TanStack Query + PWA (scaffolded directories present)
- **Database:** PostgreSQL / Supabase with strict SQL migrations, RLS policies, Kysely query layer
- **Authentication:** Supabase Auth with server-side JWKS validation & session tokens
- **AI:** Central AI Gateway & Orchestrator with cost protection & assessment session enforcement
- **PWA:** Service worker + IndexedDB offline-first architecture planned
- **Testing:** Vitest / Playwright / Axe / ASVS test harnesses planned
- **Security:** Defense in depth, strict RLS, server-authoritative authorization
- **Deployment:** Staging / Production CI/CD pipelines defined in specification
- **Current Focus:** Monorepo workspace bootstrap, dependency configuration, and Phase 0 trust foundation
- **Major Blocker:** None
- **Next Action:** Initialize `package.json`, `pnpm-workspace.yaml`, workspace scripts, and base configurations

---

## 3. Current Milestone

### Milestone M0: Platform Trust Foundation & Monorepo Bootstrap
- **Goal:** Establish a pristine, clean, executable workspace toolchain with complete package scripts, TypeScript project references, Fastify backend scaffold, React/Vite frontend shell, Supabase migration harness, and Phase 0 foundation epics (E-01 through E-16).
- **Target Completion Date:** 2026-09-30
- **Status:** IN PROGRESS

---

## 4. Overall Progress

| System / Domain Area | Planned Features | Implemented | Verified | Released | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Foundation & Auth (Phase 0)** | 16 | 4 | 4 | 0 | IN PROGRESS |
| **Identity & Profile (Phase 1)** | 18 | 1 | 1 | 0 | IN PROGRESS |
| **Evidence & Learning (Phase 2)** | 24 | 2 | 2 | 0 | IN PROGRESS |
| **Opportunity Loop (Phase 3)** | 22 | 3 | 3 | 0 | IN PROGRESS |
| **Hiring Depth (Phase 4)** | 18 | 0 | 0 | 0 | PLANNED |
| **Career Intelligence (Phase 5)** | 20 | 0 | 0 | 0 | PLANNED |
| **Trust & Ecosystem (Phase 6)** | 19 | 0 | 0 | 0 | PLANNED |
| **Institution & Enterprise (Phase 7)** | 16 | 0 | 0 | 0 | PLANNED |
| **Advanced AI & Insights (Phase 8-10)** | 20 | 0 | 0 | 0 | PLANNED |
| **Total Portfolio** | **173** | **9** | **9** | **0** | **IN PROGRESS (5.20%)** |

*Note: Progress calculation based on explicit 173-feature portfolio count defined in `docs/registries/FEATURE_REGISTRY.md`.*

---

## 5. Feature Progress

A complete register of all 173 features is tracked in [`docs/registries/FEATURE_REGISTRY.md`](../docs/registries/FEATURE_REGISTRY.md).

Summary by status:
- **PLANNED:** 164
- **IN DEVELOPMENT:** 0
- **IMPLEMENTED:** 9 (F-01, F-02, F-03, F-04, F-05, F-06, F-12, F-84, F-96)
- **VERIFIED:** 9 (F-01, F-02, F-03, F-04, F-05, F-06, F-12, F-84, F-96)
- **RELEASED:** 0
- **BLOCKED:** 0
- **DEPRECATED:** 0
- **REJECTED:** 0

---

## 6. Implementation Progress

The implementation baseline is 0% verified code.
Scaffolded folders exist under `apps/` (`api`, `web`, `worker`) and `packages/` (`config`, `contracts`, `domain`, `observability`, `testing`, `ui`). No executable application code or package manifests currently exist in these directories.

---

## 7. Verification Progress

- Total Automated Tests Executed: 0
- Tests Passing: 0
- Tests Failing: 0
- Verification Gates Passed: 0 / 18
- Overall Verification: 0.00%

---

## 8. Recent Changes

### 2026-09-24

#### Change 1: Documentation Audit & Relocation
- **Why:** Resolve root directory clutter and organize all 24 specification documents into clear functional folders according to the documentation taxonomy.
- **Files:**
  - `PRD.md` -> `docs/product/PRD.md`
  - `BRAIN.md` -> `BRAIN/BRAIN.md`
  - `UI_UX_DESIGN_SYSTEM.md` -> `docs/experience/UI_UX_DESIGN_SYSTEM.md`
  - `APP_FLOW.md` -> `docs/experience/APP_FLOW.md`
  - `JOURNEY_REGISTRY.md` -> `docs/experience/JOURNEY_REGISTRY.md`
  - `TRD.md` -> `docs/engineering/TRD.md`
  - `ARCHITECTURE.md` -> `docs/engineering/ARCHITECTURE.md`
  - `DATABASE.md` -> `docs/engineering/DATABASE.md`
  - `API_CONTRACTS.md` -> `docs/engineering/API_CONTRACTS.md`
  - `CODE_STYLE.md` -> `docs/engineering/CODE_STYLE.md`
  - `SECURITY.md` -> `docs/quality/SECURITY.md`
  - `TESTING.md` -> `docs/quality/TESTING.md`
  - `OPERATIONS.md` -> `docs/quality/OPERATIONS.md`
  - `FEATURE_REGISTRY.md` -> `docs/registries/FEATURE_REGISTRY.md`
  - `BUSINESS_RULE_REGISTRY.md` -> `docs/registries/BUSINESS_RULE_REGISTRY.md`
  - `WORKFLOWS_AND_BUSINESS_RULES.md` -> `docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md`
  - `IMPLEMENTATION_PLAN.md` -> `docs/governance/IMPLEMENTATION_PLAN.md`
  - `GAP_ANALYSIS.md` -> `docs/governance/GAP_ANALYSIS.md`
  - `GOVERNANCE.md` -> `docs/governance/GOVERNANCE.md`
  - `FINAL_VALIDATION_REPORT.md` -> `docs/reports/FINAL_VALIDATION_REPORT.md`
- **Result:** Successfully organized with full git move tracking.
- **Follow-up:** Update navigation indices in `FINAL_DOCUMENT_INDEX.md` and `README.md`.

#### Change 4: Monorepo Toolchain & Shared Packages Bootstrap (E-01)
- **Why:** Establish pristine, executable workspace infrastructure with TypeScript composite builds, pure domain models, API/error contracts, design tokens, observability, and test harnesses.
- **Files:**
  - Root: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `tsconfig.json`
  - Packages:
    - `packages/config` (environment validation with Zod)
    - `packages/domain` (pure domain types, application state machine, AI assessment boundary)
    - `packages/contracts` (error envelope, pagination, auth, evidence, application schemas)
    - `packages/observability` (Pino structured logger, audit sink)
    - `packages/ui` (accessible design tokens conforming to WCAG 2.2 AA)
    - `packages/testing` (mock factories for User, Profile, Evidence)
  - Tests: `tests/unit/foundation.test.ts`
#### Change 5: Database Schema & Migration Engine (E-04, E-05)
- **Why:** Establish authoritative relational schema in PostgreSQL/Supabase with RLS policies, explicit foreign keys, indexes, and automated migration runner.
- **Files:**
  - `supabase/migrations/00001_core_schema.sql` (Profiles, Evidence, Organizations, Memberships, Jobs, Applications, Audit Logs, Feature Flags with RLS)
  - `supabase/seed/01_initial_seed.sql` (Default feature flags)
  - `scripts/migrate.mjs` (Migration runner)
  - `scripts/seed.mjs` (Seed runner)
#### Change 6: Fastify Modular API Server & Canonical Error Envelope (E-09, E-10)
- **Why:** Implement backend server with security headers (Helmet), CORS, rate limiting, x-request-id tracing, and standard error envelope.
- **Files:**
  - `apps/api/package.json`
  - `apps/api/tsconfig.json`
  - `apps/api/src/server.ts` (Fastify app, onSend hook, error handler, health & auth routes)
  - `apps/api/src/index.ts` (Server listener entry point)
#### Change 7: PWA Frontend Shell, Accessible Layout & Role-Adaptive Dashboard (E-13, E-14, F-02, F-03)
- **Why:** Provide mobile-first PWA frontend with WCAG 2.2 AA accessibility (skip link, landmark structure), offline status banner, TanStack Query provider, and role-adaptive dashboard.
- **Files:**
  - `apps/web/package.json`
  - `apps/web/tsconfig.json`
  - `apps/web/vite.config.ts`
  - `apps/web/index.html` (PWA meta tags, theme color, manifest reference)
  - `apps/web/public/manifest.webmanifest` (PWA standalone manifest)
  - `apps/web/src/components/Layout.tsx` (Accessible layout, skip link, offline banner)
  - `apps/web/src/pages/LandingPage.tsx` (Hero, value propositions, core loop)
  - `apps/web/src/pages/DashboardPage.tsx` (Readiness metric cards, verified evidence count)
  - `apps/web/src/App.tsx` & `apps/web/src/main.tsx` (React 19, QueryClientProvider, React Router)
#### Change 8: Async Worker Queue Engine & Dead Letter Queue (Section 22, E-01)
- **Why:** Provide resilient, durable asynchronous job processing for evidence propagation, notification fan-out, and heavy processing with idempotency and DLQ support.
- **Files:**
  - `apps/worker/package.json`
  - `apps/worker/tsconfig.json`
  - `apps/worker/src/queue.ts` (JobQueueEngine, idempotency keys, bounded retries, DLQ)
  - `apps/worker/src/index.ts` (Worker daemon process & background task registration)
  - `tests/unit/worker-queue.test.ts` (4 unit tests verifying execution, idempotency, retries, DLQ)
#### Change 9: Authentication & Profile Domain Loop (F-01, F-12)
- **Why:** Implement secure authentication, PBKDF2 password hashing with salt, HMAC-SHA256 signed session tokens, automatic profile provisioning, profile editing, and purpose-based privacy filtering (`public`, `recruiters_only`, `private`).
- **Files:**
  - `packages/domain/src/auth.ts` (PBKDF2 password hasher, session token generator/verifier)
  - `packages/domain/src/profile.ts` (Profile creation, update, purpose-based privacy access rules)
  - `packages/domain/src/index.ts` (Exports auth & profile utilities)
  - `apps/api/src/server.ts` (Auth register/login routes, Profile me/patch/:id routes)
  - `tests/integration/auth-profile.test.ts` (9 integration tests covering registration, duplicate rejection, login, session auth, profile updates, and privacy filtering)
  - `tests/integration/api-server.test.ts` (Updated registration profile assertion)
- **Result:** TypeScript builds clean. 9 auth-profile integration tests passed. Overall tests: 45/45 PASS.

#### Change 10: Skill Evidence & Digital Credentials + Skills Taxonomy Graph (F-96, F-84)
- **Why:** Implement foundational Talent & Evidence Graph core capabilities: append-only evidence lifecycle, verification level progression (`unverified` -> `peer_reviewed` -> `institution_verified` -> `authority_verified`), anti-gaming self-verification prevention, dispute/revocation workflows, zero-PII public verification proofs (BR-150, BR-155), canonical skills taxonomy (BR-141), and acyclic prerequisite validation (BR-147).
- **Files:**
  - `supabase/migrations/00002_evidence_skills_schema.sql` (Evidence metadata, skills, skill_relationships, evidence_skills with RLS)
  - `packages/domain/src/evidence.ts` (Evidence creation, verification state machine, anti-gaming check, dispute, revocation, SHA-256 public proof)
  - `packages/domain/src/skills.ts` (Canonical skills, DFS acyclic prerequisite cycle detection, 5-hop bounded graph traversal)
  - `packages/domain/src/index.ts` (Exports evidence & skills models and methods)
  - `packages/contracts/src/index.ts` (Zod schemas for evidence verification, dispute, revocation, skills, and relationships)
  - `apps/api/src/server.ts` (Evidence CRUD, verification, dispute, revocation, public proof, skills list/create, relationships, graph traversal, and async worker queue dispatch)
  - `tests/unit/database-migrations.test.ts` (Added tests for migration 00002)
  - `tests/unit/evidence-skills-domain.test.ts` (10 unit tests for evidence and skills domain models)
  - `tests/integration/evidence-skills.test.ts` (7 integration tests verifying full API lifecycle, RBAC, cycle rejection, worker job enqueue, and public verification)
- **Result:** All 8 test suites (63 tests) PASS. TypeScript builds clean. Vite web bundle built in 3.5s.

#### Change 11: Job Marketplace & ATS Candidate Pipeline (F-04, F-05, F-06)
- **Why:** Implement complete opportunity loop: organization provisioning, recruiter-authorized job creation (BR-01, BR-12), job publishing state machine (BR-11), candidate discovery, application submission with attached verified evidence, recruiter anti-application rule (BR-02), duplicate active application prevention (BR-15), strict ATS pipeline state machine (BR-41: `submitted` -> `in_review` -> `shortlisted` -> `interviewing` -> `offered` -> `hired`), candidate withdrawal, and asynchronous worker queue dispatch.
- **Files:**
  - `supabase/migrations/00003_jobs_applications_schema.sql` (Metadata on jobs/applications, job_skills and application_evidence tables with RLS)
  - `packages/domain/src/jobs.ts` (Job lifecycle state transitions, recruiter permissions, validation)
  - `packages/domain/src/applications.ts` (Application submission, candidate role verification, active duplicate check, ATS stage transitions)
  - `packages/domain/src/index.ts` (Exports jobs & applications domain modules)
  - `packages/contracts/src/index.ts` (Zod schemas for organizations, jobs, and job applications)
  - `apps/api/src/server.ts` (Organization, job posting/search/status, application apply/list/transition endpoints, worker queue dispatch)
  - `tests/unit/database-migrations.test.ts` (Added tests for migration 00003)
  - `tests/unit/jobs-applications-domain.test.ts` (9 unit tests for jobs lifecycle and ATS application transitions)
  - `tests/integration/jobs-applications.test.ts` (9 integration tests verifying end-to-end recruiter posting, candidate applying, duplicate prevention, and ATS pipeline advancement)
- **Result:** All 10 test suites (82 tests) PASS. TypeScript builds clean. Vite web bundle verified.

---

## 9. Completed Work

- **TASK-001:** Forensic codebase audit & historical commit review (`6774c9c6` and `b3e0a50e`). Verified greenfield baseline.
- **TASK-002:** Analyzed all 24 specification documents and migrated them via `git mv` into organized directory taxonomy (`docs/product`, `docs/experience`, `docs/engineering`, `docs/quality`, `docs/registries`, `docs/governance`, `docs/reports`, and `BRAIN/`).
- **TASK-003:** Created `docs/governance/SOURCE_RECONCILIATION.md` documenting evidence model, repository audit, and architectural invariants.
- **TASK-004:** Updated `FINAL_DOCUMENT_INDEX.md` and `README.md` to reference the canonical document locations.
- **TASK-005:** Created `BRAIN/MEMORY.md` conforming to the Master Memory specification.
- **TASK-006:** Bootstrapped monorepo workspace toolchain (E-01): `pnpm-workspace.yaml`, `package.json`, `tsconfig.json`, `.gitignore`, 6 shared packages (`config`, `domain`, `contracts`, `observability`, `ui`, `testing`), and foundation test suite (14/14 tests PASS).
- **TASK-007:** Implemented database schema and migration system (E-04, E-05): `00001_core_schema.sql` with 8 core tables and RLS, `01_initial_seed.sql`, migration/seed scripts, and test suite (4/4 tests PASS; 18/18 total PASS).
- **TASK-008:** Implemented Fastify modular API server (E-09, E-10): helmet security headers, CORS, rate-limiting, canonical error envelope, request ID tracing, health and auth endpoints, and integration test suite (9/9 tests PASS; 27/27 total PASS).
- **TASK-009:** Implemented PWA frontend shell and accessible UI system (E-13, E-14, F-02, F-03): React 19 + Vite + TanStack Query, web app manifest, WCAG skip link, offline banner, role-adaptive dashboard, and test suite (5/5 tests PASS; 32/32 total PASS).
- **TASK-010:** Implemented Async Worker Queue Engine (E-01, Section 22): `apps/worker` with idempotency cache, bounded retries, DLQ routing, and test suite (4/4 tests PASS; 36/36 total PASS).
- **TASK-011:** Implemented Authentication, Session Tokens & Profile Privacy Domain Loop (F-01, F-12): PBKDF2 password hashing, HMAC-SHA256 sessions, profile provisioning, purpose-based privacy filtering, and integration test suite (9/9 tests PASS; 45/45 total PASS).
- **TASK-012:** Implemented Skill Evidence & Digital Credentials + Skills Taxonomy Graph (F-96, F-84): Migration 00002, pure verification state machine, anti-gaming check, zero-PII public proof, acyclic cycle detection, 5-hop graph traversal, async queue event dispatch, and comprehensive test suites (18 tests added; 63/63 total PASS across 8 suites).
- **TASK-013:** Implemented Job Marketplace, Post Job Studio & ATS Pipeline (F-04, F-05, F-06): Migration 00003, job lifecycle, recruiter-only posting, candidate-only apply, duplicate prevention, ATS pipeline advancement, and test suites (19 tests added; 82/82 total PASS across 10 suites).

---

## 10. Partially Completed Work

*None at this stage. Workspace bootstrap is pending execution.*

---

## 11. Broken / Failed Work

*None.*

---

## 12. Remaining Work

1. **Monorepo Workspace Bootstrap (E-01):**
   - Create root `package.json` with workspace configuration and scripts (`pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, etc.).
   - Create `pnpm-workspace.yaml`.
   - Create root `.gitignore` and `tsconfig.json` base.
2. **Shared Packages Setup:**
   - `packages/config`: Shared TypeScript, ESLint, Prettier configurations.
   - `packages/contracts`: Zod schemas and API/event data contracts.
   - `packages/domain`: Pure domain models, entities, and validation invariants.
   - `packages/ui`: Design tokens and accessible UI primitives based on `UI_UX_DESIGN_SYSTEM.md`.
   - `packages/observability`: Structured logging (Pino), trace context, and metrics.
   - `packages/testing`: Shared test fixtures and assertion helpers.
3. **Application Shells:**
   - `apps/api`: Fastify modular monolith API server with plugins (CORS, Helmet, Rate-Limit, Error handling).
   - `apps/web`: React 19 + TypeScript + Vite + React Router + TanStack Query PWA shell.
   - `apps/worker`: Node.js async queue consumer for heavy/background tasks.
4. **Supabase / Database Migrations (E-04, E-05):**
   - Initial schema migration for core identity, profiles, and audit log.
   - RLS policies and test suites.

---

## 13. Current Blockers

*None.*

---

## 14. Known Bugs

*None.*

---

## 15. Technical Debt

*None. Starting from a clean greenfield baseline.*

---

## 16. Architecture Decisions

- **ADR-001: Modular Monolith Architecture**
  - *Date:* 2026-09-24
  - *Decision:* Use a single modular Fastify backend repository with domain modules owning business invariants and thin HTTP routes, rather than premature microservices.
  - *Reason:* Keeps operational complexity manageable, guarantees transactional boundaries, and simplifies developer onboarding.
  - *Reference:* [`docs/engineering/ARCHITECTURE.md`](../docs/engineering/ARCHITECTURE.md)
  - *Status:* ACTIVE

- **ADR-002: PostgreSQL & Supabase as Relational Authority**
  - *Date:* 2026-09-24
  - *Decision:* PostgreSQL with explicit SQL migrations is the sole relational system of record. RLS is enforced at the database level, but application-level authorization remains mandatory.
  - *Reason:* Prevents accidental data leakage and ensures auditable data integrity.
  - *Reference:* [`docs/engineering/DATABASE.md`](../docs/engineering/DATABASE.md)
  - *Status:* ACTIVE

- **ADR-003: Central AI Gateway & Cost Invariant**
  - *Date:* 2026-09-24
  - *Decision:* All AI invocations must route through a unified AI Gateway. Free users must never incur paid third-party API inference costs without explicit active policy.
  - *Reason:* Financial sustainability and architectural governance.
  - *Reference:* [`docs/quality/SECURITY.md`](../docs/quality/SECURITY.md) and [`SSOT.md`](../SSOT.md)
  - *Status:* ACTIVE

- **ADR-004: Evidence & Talent Graph as First-Class Models**
  - *Date:* 2026-09-24
  - *Decision:* Claims are decoupled from Evidence, and Evidence is decoupled from Verification. Graph structures power matching, recommendations, and trust.
  - *Reason:* Prevents popularity-as-credibility and enables verifiable career progression.
  - *Reference:* [`BRAIN/BRAIN.md`](BRAIN.md)
  - *Status:* ACTIVE

---

## 17. Product Decisions

- **PRD-001: PWA-First Experience**
  - *Date:* 2026-09-24
  - *Decision:* Build TalentSphere as a mobile-native PWA first with offline-safe local caching, instead of a responsive website shrunken to fit phone screens.
  - *Status:* ACTIVE

- **PRD-002: 173-Feature Portfolio Traceability**
  - *Date:* 2026-09-24
  - *Decision:* The 173-feature portfolio serves as the canonical capability inventory, implemented through phased iterations starting with the core trust foundation and career loop.
  - *Status:* ACTIVE

---

## 18. UX/UI Decisions

- **UX-001: WCAG 2.2 AA Compliance from Day 1**
  - *Date:* 2026-09-24
  - *Decision:* All interactive components must implement visible focus indicators, ARIA labels, semantic HTML, and support reduced-motion preferences.
  - *Reference:* [`docs/experience/UI_UX_DESIGN_SYSTEM.md`](../docs/experience/UI_UX_DESIGN_SYSTEM.md)
  - *Status:* ACTIVE

---

## 19. Security Decisions & Findings

- **SEC-001: Zero-Trust Client Role Handling**
  - Server-side authorization must never trust client-supplied role flags, permissions, or tenant IDs. All authorization decisions are computed server-side via token identity and database membership lookups.
- **SEC-002: Assessment AI Isolation Boundary**
  - During `AI_PROHIBITED` assessment sessions, server-authoritative context denies AI assistance across all platform features.

---

## 20. Database / Schema Changes

*No migrations applied yet. Greenfield baseline.*

---

## 21. API Changes

*No endpoints deployed yet. OpenAPI 3.1 contracts defined in `docs/engineering/API_CONTRACTS.md`.*

---

## 22. AI / Provider Changes

*No AI models connected yet. Architecture requires provider-agnostic adapter layer.*

---

## 23. Testing History

*No test runs yet.*

---

## 24. Deployment / Environment History

- Environment templates prepared: `.env.example`
- Local environment: `.env.local` configured (untracked)

---

## 25. Documentation Changes

- 2026-09-24: Relocated 20 root markdown specifications to `docs/` and `BRAIN/` subdirectories.
- 2026-09-24: Created `docs/governance/SOURCE_RECONCILIATION.md`.
- 2026-09-24: Created `BRAIN/MEMORY.md`.
- 2026-09-24: Synchronized `FINAL_DOCUMENT_INDEX.md` and `README.md`.

---

## 26. Files Created

- `docs/governance/SOURCE_RECONCILIATION.md`
  - *Purpose:* Canonical forensic baseline and evidence reconciliation.
  - *Date:* 2026-09-24
- `BRAIN/MEMORY.md`
  - *Purpose:* Living project memory and execution history.
  - *Date:* 2026-09-24

---

## 27. Files Modified

- `FINAL_DOCUMENT_INDEX.md`
  - *Why changed:* Updated paths to match newly organized file locations.
  - *Date:* 2026-09-24
- `README.md`
  - *Why changed:* Updated documentation links to point to categorized locations.
  - *Date:* 2026-09-24

---

## 28. Files Deleted / Deprecated

*None in this session. (Historical commit `6774c9c6` removed legacy files).*

---

## 29. Feature-to-Code Mapping

*(Will be populated as features are implemented)*

---

## 30. Feature-to-Test Mapping

*(Will be populated as features and tests are created)*

---

## 31. Known Risks

1. **PowerShell Script Execution Policy on Windows:**
   - *Risk:* In Windows PowerShell, executing `.ps1` files triggers `PSSecurityException`.
   - *Mitigation:* Always execute `pnpm.cmd` or `npm.cmd` instead of calling `pnpm` / `npm` directly in scripts or shell invocations.
2. **Schema Drift:**
   - *Risk:* Divergence between Supabase database types, Zod schemas, and TypeScript interfaces.
   - *Mitigation:* Single source of truth via SQL migrations and automated type generation in `packages/contracts`.

---

## 32. Open Questions

*None at this stage.*

---

## 33. Deferred Decisions

1. **Distributed Cache (Redis):** Deferred until measured API latency profiles demonstrate need.
2. **GraphQL Layer:** Deferred indefinitely; REST + OpenAPI 3.1 + SSE is the chosen standard.

---

## 34. Important Lessons

- **LESSON-001:** On Windows PowerShell environments, use `.cmd` wrappers (`pnpm.cmd`, `npm.cmd`) to bypass script execution policy restrictions safely.
- **LESSON-002:** Historical documentation often asserts feature completion prematurely. Always verify executable evidence in code, schema, and tests before classifying any feature as implemented or verified.

---

## 35. Mistakes to Avoid

1. Do NOT invent undocumented requirements.
2. Do NOT create duplicate systems or parallel auth/state frameworks.
3. Do NOT bypass the API / domain boundary.
4. Do NOT trust client-supplied tenant IDs or role flags.
5. Do NOT add paid AI cost to free users silently.
6. Do NOT call documentation "implemented".

---

## 36. Current Work

- **Task:** Monorepo Workspace Toolchain Setup & Phase 0 Foundation
- **Feature:** E-01 (Workspace & Tooling), E-02 (CI/CD), E-03 (Environment Configuration)
- **Goal:** Set up `package.json`, `pnpm-workspace.yaml`, `.gitignore`, root build/test scripts, and shared packages (`config`, `contracts`, `domain`, `ui`)
- **Started:** 2026-09-24 12:10
- **Current State:** Spec files organized; memory active; ready to initialize package manifests.
- **Completed in this task:** Documentation migration, source reconciliation, memory initialization.
- **Remaining:** Package files, workspace configs, build toolchain setup.
- **Current Blocker:** None.
- **Next Action:** Create root `package.json`, `pnpm-workspace.yaml`, and `.gitignore`.

---

## 37. Next Actions

### P0 — Blocking / Security / Correctness
1. Create root `package.json`, `pnpm-workspace.yaml`, and `.gitignore`.
2. Configure root scripts: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm validate`.
3. Set up shared package `packages/config` (base tsconfig, eslint, prettier).
4. Set up `packages/contracts` for shared Zod schemas.
5. Set up `packages/domain` for pure domain models and invariants.

### P1 — Core Product Foundation
1. Scaffold `apps/api` with Fastify, Zod validator, error handling plugin, CORS, Helmet, Rate-Limit.
2. Scaffold `apps/web` with Vite, React 19, TypeScript, React Router, TanStack Query.
3. Scaffold `apps/worker` for asynchronous job processing.
4. Set up initial Supabase migrations for User, Account, Profile, and Audit tables in `supabase/migrations/`.

### P2 — Quality & Tooling
1. Set up Vitest test configurations across workspace packages.
2. Configure GitHub Actions CI workflow in `.github/workflows/ci.yml`.

---

## 38. Session History

### Session — 2026-09-24 12:05
- **Objective:** Initialize master project execution, audit codebase, organize documentation, create source reconciliation, and set up `BRAIN/MEMORY.md`.
- **Work Completed:**
  - Audited git commit history and working tree; confirmed greenfield 0% implementation status.
  - Migrated 20 root markdown specification files into structured folders (`docs/product`, `docs/experience`, `docs/engineering`, `docs/quality`, `docs/registries`, `docs/governance`, `docs/reports`, and `BRAIN/`).
  - Created `docs/governance/SOURCE_RECONCILIATION.md`.
  - Updated `FINAL_DOCUMENT_INDEX.md` and `README.md` with accurate markdown links.
  - Created `BRAIN/MEMORY.md` conforming to all 54 Memory rules.
- **Files Changed:**
  - Moved: 20 markdown files
  - Created: `docs/governance/SOURCE_RECONCILIATION.md`, `BRAIN/MEMORY.md`
  - Modified: `FINAL_DOCUMENT_INDEX.md`, `README.md`
- **Tests:** N/A (Documentation & workspace organization stage).
- **Verification:** Verified all file locations, git status, and links.
- **Next Action:** Create root `package.json`, `pnpm-workspace.yaml`, `.gitignore`, and shared packages.

---

## 39. Release History

| Version | Date | Major Changes | Verification | Status |
| :--- | :--- | :--- | :--- | :--- |
| `0.0.0-greenfield` | 2026-09-24 | Baseline specification & memory initialized | VERIFIED (Docs) | CURRENT |

---

## 40. Final Current-State Summary

- **Project:** TalentSphere
- **Implementation:** 0 / 173 (0.00%)
- **Verification:** 0 / 173 (0.00%)
- **Released:** 0 / 173 (0.00%)
- **Current Phase:** Phase 0 — Platform Trust Foundation
- **Current Milestone:** M0 — Monorepo Toolchain & Bootstrap
- **Highest-Priority Remaining Work:** Root package setup, workspace scripts, Fastify backend scaffold, React/Vite PWA shell, shared packages (`contracts`, `domain`, `ui`), Supabase migrations.
- **Critical Blockers:** None
- **Important Risks:** Windows PowerShell script execution policy (use `pnpm.cmd` wrapper).
- **Last Significant Change:** Document reorganization and creation of `SOURCE_RECONCILIATION.md` and `BRAIN/MEMORY.md`.
- **Last Verified Milestone:** Baseline audit verified.
- **Next Action:** Create root `package.json`, `pnpm-workspace.yaml`, and `.gitignore`.
- **Last Updated:** 2026-09-24 12:10

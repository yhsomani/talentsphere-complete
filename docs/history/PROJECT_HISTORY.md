# Project history and agent memory

> **Status.** History. Execution memory and plans written by coding agents. Not current state.
>
> **What this file holds.** The former `BRAIN/` folder (conceptual model and execution memory) and the 2026-10-21 maintenance plan.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| TalentSphere — BRAIN.md v6.0 | `BRAIN/BRAIN.md` |
| TalentSphere — Project Memory | `BRAIN/MEMORY.md` |
| Project Maintenance Implementation Plan | `docs/superpowers/plans/2026-10-21-project-maintenance.md` |

## TalentSphere — BRAIN.md v6.0

_Former file: `BRAIN/BRAIN.md`._

### 1. How to Think About the System

TalentSphere is not primarily a job board, learning site, social network or AI wrapper. It is a **career evidence system**.

### 2. Core mental model

```text
GOAL
→ CAPABILITY GAP
→ ACTIVITY
→ EVIDENCE
→ VERIFICATION
→ OPPORTUNITY
→ OUTCOME
→ NEW EVIDENCE
```

### 3. Claim vs Evidence

A profile claim says what a user says.

Evidence says what supports the claim.

Verification says who/what validated the evidence.

Reputation is context around trust and behavior.

### 4. Graph Model

Talent Graph:
- skills;
- competencies;
- capabilities;
- prerequisites;
- relationships.

Evidence Graph:
- evidence;
- provenance;
- verification;
- credentials;
- recency;
- conflicts;
- outcomes.

Career Graph:
- goals;
- transitions;
- experiences;
- learning;
- applications;
- interviews;
- outcomes.

### 5. Decision Systems

#### Matching
Hard constraints first. Then capability/evidence/experience/preferences/recency/uncertainty.

#### Recommendations
Always explain why.

#### Career intelligence
Scenario/decision support, not prophecy.

#### Trust
Anomaly is a signal for review, not automatic guilt.

### 6. AI

AI can draft, explain, summarize, classify and recommend within policy.

AI does not own truth.

AI memory does not equal profile truth.

AI-generated evidence is always provenance-labeled.

### 7. Assessment

The assessment session is a trust boundary. AI policy follows the session.

### 8. Privacy

The same data can have different visibility based on purpose. Never collapse privacy into a single public/private boolean.

### 9. Architecture Heuristic

Prefer:
```text
clear module
+ explicit contract
+ boring infrastructure
+ strong tests
```
over:
```text
generic abstraction
+ distributed complexity
+ hidden coupling
```

### 10. Common mistakes

- building AI before domain data is trustworthy;
- turning every feature into a shared platform;
- using a score when dimensions are needed;
- treating realtime as truth;
- treating queues as exactly-once business side effects;
- hard-coding policy values;
- confusing implementation existence with correctness.

## TalentSphere — Project Memory

_Former file: `BRAIN/MEMORY.md`._

### Audit update — 2026-10-21 (current evidence, not release acceptance)

- Current audit and roadmap remain in `docs/reports/FEATURE_STATUS_2026-10-21.md`
  and `docs/reports/FEATURE_PLAN_2026-10-21.md`; supporting source/reference/test
  records are in `docs/reports/AUDIT_EVIDENCE_2026-10-21.json`.
- Initial `main` HEAD was `a30b35bf` with 27 staged entries. Another actor committed
  those entries as `a771a87b` during discovery. The auditor did not commit or alter
  that product work; all audit changes are documentation/evidence only.
- Current execution: 1,172 Vitest tests across 115 files passed, zero failed/pending;
  five migration-history helper tests passed; all ten projects passed non-emitting
  typechecks. Formatting failed in seven existing paths. Native Vitest config
  loading and disabled cache avoided protected build writes. Existing compiled
  workspace imports limit source-to-result attribution.
- No current PG, browser, live-provider, deployment or restore pass is claimed.
  Build/install/root emitting typecheck were not run under the protected-file rule.
- Reproduced: non-executable challenge text receives simulated passed/100 while
  evidence remains unverified; sequential worker batch leases allow duplicate
  handler executions. Static finding: cross-store erasure can fail after account
  deactivation, requiring durable recovery. See D-01–D-03 before implementation.
- GitHub #44–#50 remain open. PRs #43 and #51–#58 are merged. Existing Resend,
  saved-search/bookmark/account/audit/flag stores, writer lease and heartbeat must
  not be rebuilt from stale absence claims. Live acceptance and owner decisions
  still gate release.
- All 173 features have provisional maturity/limitations and backlog disposition;
  detailed subfeature and 248-rule semantic acceptance review remains incomplete.
  No whole feature was newly certified implemented-and-verified. Product scope,
  legal/privacy, provider, pricing and architecture decisions remain with owners.

> **Historical log.** Status figures in §2 to §7 ("51 verified", "1058 tests pass", milestone dates) were written on 2026-10-10 and 2026-10-18. They are not re-measured and conflict with the code-checked status of record, `docs/reports/FEATURE_STATUS_2026-10-21.md` (see the current matrix; earlier counts are superseded). See `docs/governance/GAP_ANALYSIS.md` conflicts C-2 and C-3.

### 1. Memory Control

- **Project:** TalentSphere
- **Memory File:** `BRAIN/MEMORY.md`
- **Memory Version:** 4.0
- **Last Updated:** 2026-10-22
- **Current Branch:** `repository_audit_roadmap` (synchronized with `main` at `83dc7d24`)
- **Current HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924` (Commit: `update`, author: Yash Somani)
- **Current Primary Task:** Master Repository Audit & Agile Roadmap Synthesis. Official deliverables published in `docs/reports/` (`AUDIT_MASTER_REPORT.md`, `FEATURE_TRACEABILITY_MATRIX.md`, `ARCHITECTURE_DURABILITY_REPORT.md`, `GIT_RECONCILIATION_REPORT.md`, `RELEASE_SCOPE_AND_BACKLOG.md`).
- **Overall Verification (measured 2026-10-22):** 
  - Automated Tests: **1,143 passing tests across 112 test files** (100% green).
    - Vitest Unit: 55 files, 627 passed (`pnpm test:unit`)
    - Vitest Integration: 50 files, 402 passed (`pnpm test:integration`)
    - Vitest Security: 5 files, 101 passed (`vitest run tests/security`)
    - Playwright Browser E2E: 2 files, 13 passed (`tests/e2e/core-loop.spec.ts` 7/7, `tests/e2e/frontend-fixes.spec.ts` 6/6)
  - PostgreSQL Persistence Suite: 8 test files in `tests/pg/` (require `TEST_DATABASE_URL`, fail-closed when database is unconfigured).
  - Compilation & Build: `pnpm exec tsc -b` (clean), `pnpm exec tsc -p tests` (clean), `pnpm build` (6 packages + 3 apps clean).
  - Database Migrations: **49 SQL migrations** applied and verified in `supabase/migrations/`.
  - Code Style & Formatting: Production & test source code 100% Prettier compliant.
- **Production Readiness:** **GATED** — see §10.
- **Next Action:** Execute Stage A operational gates (Staging email DNS/credentials, Legal counsel terms ratification, SEC-01 email HMAC fix, SEC-02 referee token TTL fix, OPS-02 Caddy `/health` proxying).

---

### 2. Current Project Snapshot

- **Implementation Status:** HYBRID TRANSITION STATE (Core loop 100% durable in PostgreSQL; ~217 long-tail routes ephemeral in memory).
- **Backend:** Fastify 5 + Node.js + TypeScript (modular monolith architecture; 274 registered routes across 43 route prefixes in `apps/api/src/server.ts`).
  - Durable Routes: 54 registered routes (~20%) persisting to PostgreSQL 16 via ADR-015 single-writer lease (`PgCoreStore`).
  - Ephemeral Routes: 217 routes (~80%) persisting in ~150 in-process `Map` collections returning header `x-talentsphere-durability: ephemeral`.
  - Stateless Routes: 3 routes (`/health`, `/api/v1/health`, `/api/v1/billing/plans`).
- **Frontend:** React 19 + TypeScript + Vite PWA (20 pages, 16 reusable components in `apps/web/src/`). Dynamic candidate, recruiter, and referee journeys on real data. Accessibility verified for keyboard navigation, focus states, and WCAG 3:1 input contrast ratio (`rgb(100, 116, 139)`).
- **Database:** PostgreSQL 16, 49 SQL migrations in `supabase/migrations/` (migrations 00001–00049).
- **Authentication & Security:** PBKDF2-HMAC-SHA512 with 210,000 iterations floor and transparent upgrade on login; HMAC-SHA256 session tokens with unique `sessionId`; database session revocation table `revoked_sessions`; global device cut-off `sessions_valid_after`.
- **Proof-of-Control Verification:** Corporate email OTP attestation with disposable/webmail filtering; 128-bit referee voucher links stored as SHA-256 hashes with single-use consumption and idempotency keys (`clientRequestId`).
- **AI Governance:** Server-authoritative `AI_PROHIBITED` enforcement on proctored assessments; user quota metering (20 req/day free); prompt injection context firewall (WIT-007); local heuristic pattern matching (`generateCareerAssistantResponse`). Zero external LLM network calls.
- **External Integrations:** Resend transactional email adapter with exponential backoff retries and staging fail-closed checks; simulated billing mode refusing paid plans in production; signed HMAC-SHA256 billing webhooks.
- **Deployment:** Oracle Ampere ARM64 Docker Compose configuration (`deploy/oracle/compose.yaml`) with strict internal network isolation (database and API host ports closed; Caddy edge reverse proxy on 80/443).

---

### 3. Current Milestone

#### Milestone M6: Repository Audit, Operational Gating & Core Loop Production Release
- **Goal:** Synthesize comprehensive audit findings, reconcile all PRs #40–#58 and Issues #44–#50, harden operational gates, and release the Core Career Loop to production GA.
- **Target Completion Date:** 2026-11-15
- **Status:** IN PROGRESS (Audit completed, Stage A hardening active)

---

### 4. Overall Progress across Canonical 173 Features

| Implementation Status | Count | Percentage | Definition |
| :--- | :---: | :---: | :--- |
| **Full** | **26** | 15.0% | DB Migration + Domain Model + API Route (Durable) + React UI + Passing E2E Tests |
| **Partial** | **91** | 52.6% | Domain Model + DB Migration + Fastify Route (Ephemeral / Memory) or Missing UI |
| **Stub / Mock** | **6** | 3.5% | Deprecated legacy endpoints (F-38, F-39) or Vendor-Gated/Prohibited concepts |
| **Missing** | **50** | 28.9% | Planned for future roadmap phases (Phases 5–10) or Chrome Extension |
| **Total Inventory** | **173** | **100.0%** | Complete canonical capability register (F-01 through F-173) |

---

### 5. Canonical Features Summary by Domain

1. **Identity & Foundation (F-01, F-02, F-03, F-12, F-15, F-21, F-60, F-65, F-80)**: **Full / Operational**. Backed by PostgreSQL (`users`, `profiles`, `revoked_sessions`, `user_settings`, `data_erasure_requests`), PBKDF2 210k iterations, multi-device sign-out, role-adaptive dashboard, and accessible React UI.
2. **Job Marketplace & Hiring ATS (F-04, F-05, F-06, F-25, F-32, F-56, F-102, F-117, F-173)**: **Full / Operational**. Recruiter job creation, status state machine, candidate application submission, pipeline review, saved searches, bookmarks, and mobile-friendly application forms.
3. **Verifiable Work History & Credentials (F-58, F-94, F-96, F-162)**: **Full / Operational**. Corporate email OTP verification, 128-bit referee voucher tokens, referee review submission, verification score badges (Gold/Silver/Bronze), SHA-256 digital skill evidence, and verified work history graph.
4. **Communication & Alerts (F-10, F-14, F-29)**: **Full / Operational**. 1:1 direct messaging backed by `message_threads` and `messages`, unread counts, and notification delivery with user digest preferences.
5. **Learning Management (F-07, F-40, F-50, F-66, F-67, F-68, F-70)**: **Partial**. Schema and Fastify API routes exist across 24 endpoints; state is currently ephemeral in memory and web UI is not yet built.
6. **Challenges & Assessments (F-08, F-77, F-78, F-115)**: **Partial**. Schemas (`challenges`, `assessment_sessions`, `xp_transactions`) and domain rules exist; web UI preview exists; backend state is ephemeral.
7. **Reputation, Credibility & Intelligence (F-85, F-86, F-118, F-123, F-144, F-148, F-149, F-150, F-151, F-152, F-153, F-158, F-159, F-160)**: **Partial**. Rich mathematical models (Markov progression, half-life decay, $k$-anonymity, Wilson score CI) and API routes exist; currently ephemeral in memory.
8. **Prohibited & Out-of-Scope (F-45, F-61, F-62, F-63, F-154, F-168)**: **Stub / Prohibited**. Third-party proctoring (F-45) and candidate paid tiers (F-61) are vendor-gated. Sponsored content (F-62) and BD sales graphs (F-63) are explicitly NOT RECOMMENDED. Predictive hiring rejection models (F-154, F-168) are strictly banned per SSOT §E.

---

### 6. Monorepo Structural Health

The workspace comprises 10 packages and applications configured with pnpm workspaces:
- `apps/api`: Fastify modular API server (13,405 lines, 274 routes, structured error envelopes, single-writer advisory lock lease).
- `apps/web`: React 19 + TypeScript + Vite PWA (20 pages, 16 components, WCAG 3:1 input contrast, responsive grids).
- `apps/worker`: Async background job runner with idempotency keys, exponential retries, and Resend email adapter.
- `packages/config`: Environment schema validation and safe secret defaults.
- `packages/contracts`: Zod input/output schemas and standard domain error envelopes.
- `packages/domain`: Pure TypeScript domain models, mathematical formulas, state machines, and cryptographic proof generators (48 modules).
- `packages/observability`: Structured Pino logging and audit sinks.
- `packages/ui`: Accessible design tokens and components.
- `packages/testing`: Test factories, mock stores, and assertion helpers.
- `supabase/migrations`: 49 PostgreSQL migrations defining schemas, constraints, foreign keys, and RLS policies.

---

### 7. Verification Status

- **Automated Tests Executed:** 1,143
- **Automated Tests Passing:** 1,143 (100% green)
- **Tests Failing:** 0
- **Test Suite Breakdown:**
  - Vitest Unit: 55 files / 627 passed (`pnpm test:unit`)
  - Vitest Integration: 50 files / 402 passed (`pnpm test:integration`)
  - Vitest Security: 5 files / 101 passed (`vitest run tests/security`)
  - Playwright E2E: 2 files / 13 passed (`tests/e2e/core-loop.spec.ts` 7/7, `tests/e2e/frontend-fixes.spec.ts` 6/6)
- **PostgreSQL Persistence Tests:** 8 test files in `tests/pg/` covering real-DB race conditions, durability across process restarts, messaging, notifications, saved searches, and bookmarks (executed via `pnpm test:pg` with `TEST_DATABASE_URL`).
- **Composite Typecheck:** Clean across all 6 packages and 3 apps (`tsc -b && tsc -p tests`).
- **Production Build:** Clean across all packages and apps (`pnpm build`).

---

### 8. Git History & Pull Request Lineage (PRs #40 through #58)

All 302 commits in git history lead directly to HEAD `83dc7d24`. There are zero orphaned branches. Pull requests #40 through #58 form a clean linear progression:
- **PR #40 (`4004457d`)**: ADR-015 PostgreSQL persistence for core loop, proof-of-control verification, honest dynamic frontend.
- **PR #41 (`8bdad381`)**: RLS policies for direct messaging and notifications.
- **PR #42 (`5c130a7e`)**: RLS outer query fix and Vite production bundle secret scanner CI guard.
- **PR #43 (`d8dd0567`)**: Single-writer advisory lock lease, worker heartbeat, fail-closed transactional email, durable erasure request store.
- **PR #51 (`4890ef21`)**: AES-256-GCM encryption for BYO AI keys, opt-in Resend adapter, durable settings store.
- **PR #52 (`616f942d`)**: Release preflight migration drift verification tool (`scripts/release-preflight.mjs`).
- **PR #53 (`eb69a2f8`)**: SQL-backed saved searches store with owner-scoped CRUD.
- **PR #54 (`1776f948`)**: SQL-backed saved job bookmarks with job visibility filter.
- **PR #55 (`8864d2c8`)**: Oracle Ampere ARM64 staging compose configuration with private network isolation.
- **PR #56 (`252b03f9`)**: Staging database backup and isolated restore verification drill (`deploy/oracle/verify-backup-restore.sh`).
- **PR #57 (`9156b1a8`)**: Comprehensive fixes for Issues #44–#50; frontend fixes FE-02 through FE-07, FE-11, and Playwright E2E suite.
- **PR #58 (`61eae132`)**: Review Round 2 regressions and BR-167 candidate reputation visibility gate.
- **Commit `83dc7d24`**: Graphify knowledge graph index committed to `graphify-out/`.

---

### 9. Reconciliation of GitHub Issues #44 through #50

- **Issue #44 (Transactional Email & Provider Delivery)**: Partially Addressed / Staging Gate Open. Fail-closed guards and Resend adapter built; staging DNS SPF/DKIM verification required.
- **Issue #45 (Reputation Visibility & Candidate Consent - BR-167)**: Partially Addressed. Unauthorized recruiter visibility blocked with 403 Forbidden; candidate opt-in consent setting UI deferred to Stage F.
- **Issue #46 (Technical Interview Code Execution Sandbox)**: Partially Addressed / Documented Limitation. Cross-tenant IDOR resolved; simulated code evaluation rejected with 503; secure containerized sandbox deferred to Stage E.
- **Issue #47 (Privacy Policy, Terms & Legal Contact Claims)**: Resolved in Code / Legal Gate Open. Unverified compliance badges and fake contacts removed; formal legal counsel ratification required.
- **Issue #48 (User Data Erasure Lifecycle)**: Partially Addressed. Immediate erasure is fully durable in PostgreSQL; automated 30-day scheduled deletion worker cron deferred to Stage B.
- **Issue #49 (PostgreSQL Durability vs Ephemeral Routes)**: Partially Addressed / Progressive Migration. Core loop, settings, searches, and bookmarks are durable; ~210 long-tail routes remain in-memory and will migrate in Stage C.
- **Issue #50 (Payment Gateway & Billing Integrity)**: Resolved in Code / Commercial Gate Open. Fake checkout removed, unsigned webhooks eliminated, and simulated mode refused in production; live Stripe integration deferred to Stage D.

---

### 10. Current Production Blockers & Gating Decisions

Production deployment is blocked by four mandatory operational and legal gates:
1. **Transactional Email DNS & Credentials (Issue #44)**:
   - *Requirement:* Register SPF, DKIM, and DMARC DNS records for the sending domain and configure live Resend API credentials in staging.
2. **Commercial Payment Gateway Integration (Issue #50)**:
   - *Requirement:* Procure commercial Stripe merchant account and integrate Stripe Checkout before activating paid plans (launch under free tier if necessary).
3. **Legal Counsel Ratification (Issue #47)**:
   - *Requirement:* Formal legal audit and sign-off on `PrivacyPage.tsx` and `TermsPage.tsx` by qualified corporate counsel.
4. **Data Erasure Grace Period Policy (Issue #48)**:
   - *Requirement:* Founder decision ratifying immediate deletion vs 30-day grace period, and implementing the background scheduled worker executor if grace period is selected.

---

### 11. Known Architectural Risks & Deficiencies

1. **Corporate Email Challenge Lacks HMAC (SEC-01)**:
   - *Risk:* Hash is computed as `sha256Hex(`${id}:${code}`)` with public UUID salt and no HMAC key. Attacker with database read access can precompute a 1,000,000-entry rainbow table in $<50$ms.
   - *Remediation:* Key with server `TOKEN_SECRET` via `crypto.createHmac('sha256', ...)`.
2. **Referee Voucher Tokens Have No Expiration (SEC-02)**:
   - *Risk:* Tokens have 128-bit entropy but lack an `expires_at` column, remaining valid indefinitely.
   - *Remediation:* Add `expires_at TIMESTAMPTZ` (30 days TTL) to `employment_references`.
3. **Fastify API Bypasses PostgreSQL RLS (SEC-04)**:
   - *Risk:* API connects as database superuser/owner (`postgres`), automatically bypassing all RLS policies. Tenant isolation relies solely on application layer guards.
4. **$O(N)$ Boot Hydration Overhead (OPS-01)**:
   - *Risk:* `PgCoreStore.load()` queries every row in 20 tables at boot, consuming excessive heap and causing startup timeouts at scale. Single-writer lock blocks horizontal replica scaling.
   - *Remediation:* Transition read paths to direct SQL queries; retire in-process Maps.
5. **Caddy Health Proxying Defect (OPS-02)**:
   - *Risk:* Caddy routes only `/api/*` to Fastify. Requests to `/health` return static `index.html` with status 200, masking API crashes.
   - *Remediation:* Update `Caddyfile` to proxy `/health` to `api:4000`.

---

### 12. Strategic Sprint Roadmap (Stages A through F)

- **Stage A: Production Hardening & Operational Gates (Sprints 1–2)**:
  - BL-001 (HMAC-SHA256 email OTPs)
  - BL-002 (30-day TTL for referee voucher tokens)
  - BL-003 (Resend DNS SPF/DKIM verification in staging)
  - BL-004 (Legal counsel review of Terms & Privacy)
  - BL-005 (Caddy `/health` proxying)
  - BL-007 (`pnpm test:security` script fix)
  - BL-008 (`.prettierignore` update for `graphify-out` and `.agents`)
- **Stage B: Core Career Loop GA Launch (Sprints 3–4)**:
  - BL-006 (Automated 30-day erasure execution cron)
  - BL-009 (Postgres persistence for active assessment sessions)
  - BL-010 (AI gateway Pro tier quota resolution)
  - Public GA launch of Core Career Loop on Oracle Staging (free launch tier).
- **Stage C: Progressive Durability Migration (Sprints 5–6)**:
  - BL-011 & BL-012 (Challenges Arena & Assessments persisted to PostgreSQL; UI wired)
  - BL-013 (LMS Courses & module completion persisted to PostgreSQL)
  - BL-015 (Application draft autosave persisted to PostgreSQL)
  - Portfolio Showcase (F-26) and Admin Console (F-17) persisted to PostgreSQL.
- **Stage D: Commercial Monetization & Enterprise Subscriptions (Sprints 7–8)**:
  - BL-016 (Live Stripe Checkout and billing webhook processing)
  - Enterprise seat licensing and invoice generation.
- **Stage E: Sandboxed Code Execution & Remote Assessment (Sprints 9–10)**:
  - BL-017 (Containerized gVisor/Docker execution sandbox)
  - Technical Interview real-time WebRTC room wiring.
- **Stage F: Ecosystem, Reputation & Career Graph Expansion (Sprints 11+)**:
  - BL-014 (Candidate reputation opt-in consent UI)
  - Career Trajectory graph visualizations in React web app
  - Alumni networks, warm introduction pathfinding, and peer credibility UI views.

---

### 13. Documentation & Deliverables Index

- `docs/reports/AUDIT_MASTER_REPORT.md`: Master repository audit and engineering findings.
- `docs/reports/FEATURE_TRACEABILITY_MATRIX.md`: Complete 173-feature traceability register.
- `docs/reports/ARCHITECTURE_DURABILITY_REPORT.md`: In-depth persistence, security, and integration audit.
- `docs/reports/GIT_RECONCILIATION_REPORT.md`: Exhaustive git lineage, PRs #40–#58, and Issues #44–#50 reconciliation.
- `docs/reports/RELEASE_SCOPE_AND_BACKLOG.md`: Core loop release scope, backlog (BL-001–BL-018), and Stages A–F.
- `docs/INDEX.md`: Canonical intra-documentation navigation index.
- `SSOT.md`: Single Source of Truth specification (v6.0).
- `docs/registries/FEATURE_REGISTRY.md`: Canonical capability register (v6.0).
- `docs/engineering/adr/ADR-015-core-loop-persistence.md`: Core loop persistence architecture of record.

## Project Maintenance Implementation Plan

_Former file: `docs/superpowers/plans/2026-10-21-project-maintenance.md`._

> **Current checkout correction (2026-10-21, `a771a87b`):** `project-maintenance.sh` and `scripts/tests/project-maintenance.test.sh` are absent from both the working tree and tracked-file inventory. Commands and implementation results below are historical/proposed material, not runnable instructions or a verified deliverable in this checkout. Restoring a maintenance tool that changes build files requires explicit authorization under AGENTS.md; this documentation audit does not restore it.

> **For agentic workers:** Use superpowers:executing-plans for native execution; the user approved the design and requested implementation in this session.

**Goal:** Deliver the complete interactive Bash maintenance tool and prove its safety using disposable fixture repositories and real read-only previews.

**Architecture:** Bash handles discovery, candidate verification, planning, selection, execution, and reporting. Existing Node performs JSON metadata reads only. Workspace owners install once; ambiguous and unsupported projects remain visible without guessed mutations.

**Tech Stack:** Bash 3.2+, standard Unix utilities, Git, existing Node/package managers; no new dependencies.

**Spec:** `docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` and the attached original brief.

### Global constraints

- Do not edit existing build files, package manifests, lockfiles, source or CI configuration.
- No real repository cleanup, installation, builds or emitting typechecks during verification.
- Dry-run and scan must not write to their target repository; report export is explicit.
- Confirm exact actions before execution; never remove source, secrets, user data or tracked files.
- Run destructive tests only in verified disposable temporary fixture directories.
- Preserve pre-existing staged and unstaged work; no commit, branch move or publication is requested.

### Review focus

- An output directory can contain source, a nested repository or secrets: block the whole target.
- Workspace glob membership differs from ancestry: independent nested projects must install independently.
- Symlinked ancestors and changed targets must fail revalidation before deletion.
- Failed prerequisites must block cleanup before dependencies disappear.
- EOF, interruptions, invalid input and reporting errors must not become successful executions.

### Task 1: Discovery and safety fixtures

Files: create `scripts/tests/project-maintenance.test.sh`; create `project-maintenance.sh`.

- [ ] Write fixture tests for scan, recursive boundaries, dry-run preservation, cleanup confirmation and protected targets.
- [ ] Run tests and observe expected failure because `project-maintenance.sh` does not exist.
- [ ] Implement CLI parsing, read-only recursive discovery, project/workspace metadata and candidate classification.
- [ ] Verify empty/deep/space-containing projects, missing/ambiguous manifests, unsupported stacks, symlinks and exclusions.

### Task 2: Planned operations and interactive execution

Interfaces: `--scan`, `--dry-run`, `--operation`, `--project`, `--check`, `--exclude`, `--approve-cleanup`, `--execute`, `--export-report`, `--root`.

- [ ] Extend tests for installation deduplication, missing tools/locks, failures, interruption and report handling before implementing those behaviors.
- [ ] Implement exact plan previews, category/project selection, prerequisites, confirmation, protected-target rechecks and operation lock.
- [ ] Implement frozen dependency restores, selected validation checks, error aggregation and private output capture with secret-safe summary reporting.
- [ ] Implement menu choices 0–10 and explicit report export.
- [ ] Run all fixture tests; verify invalid input/EOF, repeated executions and no writes in dry-run.

### Task 3: Documentation and authoritative verification

Files: create `docs/engineering/PROJECT_MAINTENANCE.md`; update maintenance audit with actual evidence.

- [ ] Run `chmod +x`, `bash -n` for implementation/tests, and ShellCheck if installed.
- [ ] Run disposable fixture suite; document platform/permission skips honestly.
- [ ] Run real `--scan` and `--dry-run`, verify target filesystem and Git changes remain untouched, save reviewable results outside cleanup candidates.
- [ ] Obtain fresh safety review, resolve findings with regression tests and rerun relevant checks.
- [ ] Document launch commands, menu/CLI behavior, supported/unsupported stacks, security limits and final status.

### Execution record

Design approved by the user. Native implementation is authorized. Work is additive in the user's current checkout to preserve concurrent work and the existing index; no Git integration operations will run. Verification evidence and deviations will be recorded in the audit report rather than treating these checkboxes as proof of completion.

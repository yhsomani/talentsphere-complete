# Legacy Prior-Attempt Roadmap, Backlog and Lessons (from BRAIN/MEMORY.md) merged

Doc ID: RDM-LEG-01 · Owner: Program Director (with Delivery Lead) · Version 1.0 · Status: Draft for Review · Relates: `ROADMAP.md` (RDM-01), `ROADMAP_REV2.md`, `../30_PRIOR_IMPLEMENTATION_REFERENCE/` (earlier as-built analysis), `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/BRAIN/MEMORY.md` (memory version 4.0, last updated 2026-10-22, plus an audit update dated 2026-10-21 at its top)

## 0. Frame

**Nothing is implemented in this project.** `MEMORY.md` was the prior attempt's living execution log. Every statement below is "**the prior attempt reported**" and is history or a lesson, not a fact about this project. The prior file itself warned that its status figures ("51 verified", "1058 tests pass") were not re-measured and conflicted with a later status of record. Numbers differ between its own sections (see section 2). Use this file as (a) a menu of candidate work packages and (b) a list of mistakes to avoid. The target plan stays `ROADMAP.md` (Ph0 to Ph4).

## 1. What the prior attempt reported (snapshot, not truth)

| Topic | Prior report |
|---|---|
| Overall state | "Hybrid transition": core career loop durable in PostgreSQL; about 217 long-tail routes ephemeral in memory |
| Backend | Fastify 5 + Node.js + TypeScript modular monolith; 274 registered routes across 43 prefixes; 54 durable routes (about 20%) on PostgreSQL 16 under a single-writer advisory-lock lease; 217 ephemeral routes (about 80%) across about 150 in-process maps returning an `x-talentsphere-durability: ephemeral` header; 3 stateless routes (health x2, billing plans) |
| Frontend | React 19 + TypeScript + Vite PWA; 20 pages, 16 components; candidate, recruiter and referee journeys on real data; keyboard, focus and 3:1 input-contrast checks reported |
| Database | PostgreSQL 16; 49 SQL migrations (00001 to 00049) at the time of the memory file |
| Authentication | PBKDF2-HMAC-SHA512 with a 210,000-iteration floor and transparent upgrade on login; HMAC-SHA256 session tokens with a unique session id; a revoked-sessions table; a global device cut-off timestamp |
| Proof of control | Corporate-email OTP attestation with disposable/webmail filtering; 128-bit referee voucher links stored as SHA-256 hashes, single-use, idempotency key `clientRequestId` |
| AI governance | Server-authoritative `AI_PROHIBITED` on proctored assessments; user quota metering (20 requests/day free, later changed, see `../19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md`); prompt-injection context firewall (WIT-007); local heuristic assistant; **zero external LLM network calls** |
| Integrations | Resend transactional email adapter with exponential-backoff retries and staging fail-closed checks; simulated billing mode that refused paid plans in production; signed HMAC-SHA256 billing webhooks (later replaced by Stripe, see pricing file) |
| Deployment | Oracle Ampere ARM64 Docker Compose with internal network isolation (database and API ports closed; Caddy edge proxy on 80/443) |
| Workspace | 10 packages/apps (api 13,405 lines; web; worker; config; contracts; domain 48 modules; observability; ui; testing; migrations) |
| Tests reported (2026-10-22) | 1,143 passing in 112 files: unit 55 files / 627; integration 50 files / 402; security 5 files / 101; Playwright E2E 2 files / 13 (7 + 6); plus 8 PostgreSQL persistence files needing a test database URL |
| Git | 302 commits; PRs #40 to #58 linear (section 7) |

## 2. Conflicting counts inside the prior attempt (preserved so the conflict stays visible)

| Quantity | Values the prior documents gave | Note |
|---|---|---|
| SQL migrations | 41 (index), 46 (README), 49 (memory), 51 (2026-10-21 audit), 54 (2026-10-23 reconciliation), 55 (prior INDEX reference to its database document) | Dated snapshots; inventory is not execution proof (legacy conflicts C-4, C-16) |
| Feature maturity | memory: Full 26 / Partial 91 / Stub 6 / Missing 50 = 173 (15.0% / 52.6% / 3.5% / 28.9%); 2026-10-21 audit: 6 implemented-unverified, 87 partial, 1 broken/regressed, 75 not implemented, 4 deprecated/not recommended; earlier counts 16/78/75, 47 and 51 | The audit explicitly said no feature was newly certified end to end and that the memory counts were superseded (C-2) |
| Tests | memory 1,143 passing in 112 files; audit 1,172 assertions in 115 files, lint failed in 7 files, PostgreSQL and browser suites not run; earlier "1058" | C-3 |
| Role count | root SSOT 3 JWT roles + 24 contextual roles; built union of 10 roles | C-21 (OPEN-44) |
| Routes | 274 registered (memory) vs 278 unique method/path pairs (API reference) | |

None of these numbers describe this project. They show **why status must come from executable evidence and one tracker** (target: release gates, `IMPLEMENTATION_READINESS.md`).

## 3. Milestone

**M6: Repository audit, operational gating and core-loop production release.** Goal: synthesise audit findings, reconcile PRs #40 to #58 and issues #44 to #50, harden operational gates, release the Core Career Loop to production GA. Prior target date: 2026-11-15. Prior status: in progress. (History; target milestones are in `ROADMAP.md`.)

## 4. Prior capability groups and their reported state (history; useful as grouping hints)

| Group | Features (legacy IDs) | Prior reported state |
|---|---|---|
| Identity and foundation | F-01, F-02, F-03, F-12, F-15, F-21, F-60, F-65, F-80 | "Full / operational" (durable tables for users, profiles, revoked sessions, settings, erasure requests) |
| Job marketplace and ATS | F-04, F-05, F-06, F-25, F-32, F-56, F-102, F-117, F-173 | "Full / operational" |
| Verifiable work history and credentials | F-58, F-94, F-96, F-162 | "Full / operational": corporate email OTP, referee voucher tokens, referee review, verification score badges (Gold/Silver/Bronze), SHA-256 digital skill evidence |
| Communication and alerts | F-10, F-14, F-29 | "Full / operational": 1:1 messaging with threads, unread counts, notification delivery with digest preferences |
| Learning management | F-07, F-40, F-50, F-66, F-67, F-68, F-70 | Partial: schema and 24 endpoints; state ephemeral; no web UI |
| Challenges and assessments | F-08, F-77, F-78, F-115 | Partial: schemas and rules; web preview; backend ephemeral |
| Reputation, credibility, intelligence | F-85, F-86, F-118, F-123, F-144, F-148..F-153, F-158..F-160 | Partial: mathematical models (Markov progression, half-life decay, k-anonymity, Wilson-score confidence interval); ephemeral |
| Prohibited / out of scope | F-45, F-61, F-62, F-63, F-154, F-168 | Stub: third-party proctoring and candidate paid tier vendor/pricing-gated; sponsored content and business-development graph NOT RECOMMENDED; predictive hiring rejection models described as banned (see `../04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md` section 4) |

## 5. Prior staged roadmap (Stages A to F) and backlog items BL-001..BL-018

Treated here as **candidate work packages** to place in the target roadmap. Mapping to target phases is for the Program Director (OPEN-LGA-19).

| Stage | Prior sprints | Backlog items | Candidate target phase |
|---|---|---|---|
| A: Production hardening and operational gates | 1 to 2 | BL-001 HMAC-SHA256 for email OTPs; BL-002 30-day TTL for referee voucher tokens; BL-003 Resend DNS SPF/DKIM verification in staging; BL-004 legal-counsel review of Terms and Privacy; BL-005 edge proxy must route `/health` to the API; BL-007 fix security-test script; BL-008 ignore-file update for generated graph and agent folders | Ph0/Ph1 (security and operations foundations; these are design requirements here, not fixes) |
| B: Core-loop GA launch | 3 to 4 | BL-006 automated 30-day erasure execution; BL-009 persistence for active assessment sessions; BL-010 AI gateway Pro-tier quota resolution; public GA of the core career loop on staging (free launch tier) | Ph1/Ph2 |
| C: Progressive durability migration | 5 to 6 | BL-011/BL-012 challenges and assessments persisted and UI wired; BL-013 LMS courses and module completion persisted; BL-015 application draft autosave persisted; portfolio showcase (F-26) and admin console (F-17) persisted | Not applicable as migration; in the target everything is durable from the start (ADR-T05; OPEN-52) |
| D: Commercial monetisation | 7 to 8 | BL-016 live Stripe Checkout and billing webhook processing; enterprise seat licensing and invoice generation | Ph2 (billing launch gates: OPEN-18, OPEN-19, OPEN-33) |
| E: Sandboxed code execution and remote assessment | 9 to 10 | BL-017 containerised (gVisor/Docker) execution sandbox; technical-interview real-time (WebRTC) room wiring | Ph2 (OPEN-27 sandbox runner build vs buy) |
| F: Ecosystem, reputation and career-graph expansion | 11+ | BL-014 candidate reputation opt-in consent UI; career-trajectory graph visualisations; alumni networks, warm-introduction pathfinding, peer-credibility views | Ph3/Ph4 |

BL-018 is named in the prior file's range ("BL-001 to BL-018") but its content is not stated in this source group. Per `../30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` section 2.4 it is a P3 item, "Dockerfile pruning below 250 MB" (status unknown); the full backlog lives in `../31_LEGACY_ARCHIVE/docs/reports/RELEASE_SCOPE_AND_BACKLOG.md`, which is outside this merge's source group (OPEN-LGA-19).

## 6. Prior production blockers (four mandatory gates) as target launch gates

| Gate | Prior requirement | Target counterpart |
|---|---|---|
| Transactional email DNS and credentials (issue #44) | Register SPF, DKIM and DMARC for the sending domain; configure live provider credentials in staging | OPEN-26 (email stack), VR-02; launch checklist |
| Commercial payment gateway (issue #50) | Procure a commercial payment merchant account and integrate hosted checkout before activating paid plans; launch under the free tier if necessary | OPEN-18, OPEN-19 |
| Legal counsel ratification (issue #47) | Formal sign-off of the privacy policy and terms by qualified counsel; remove unverified compliance badges and fake contact details | OPEN-08 |
| Erasure grace-period policy (issue #48) | Founder decision: immediate deletion vs 30-day grace; background scheduled worker if grace is chosen | OPEN-08 (retention/erasure), legacy rule BR-063 (export within 30 days) |

## 7. Prior issue reconciliation (#44 to #50) and PR lineage (#40 to #58)

| Issue | Subject | Prior state | Lesson for the target |
|---|---|---|---|
| #44 | Transactional email and provider delivery | Partially addressed; fail-closed guards and adapter built; staging DNS verification open | Fail closed when the provider is unconfigured; verify DNS before claiming delivery |
| #45 | Reputation visibility and candidate consent (BR-167) | Unauthorised recruiter visibility blocked with 403; candidate opt-in consent UI deferred | Consent UI is part of the feature, not a later stage |
| #46 | Technical-interview code execution sandbox | Cross-tenant IDOR fixed; simulated evaluation rejected with 503; secure sandbox deferred | Never simulate a pass; ADR-T13 (unverified until a real sandbox) |
| #47 | Privacy policy, terms, legal contact claims | Resolved in code; legal ratification open | Do not show unverified compliance claims |
| #48 | User data erasure lifecycle | Immediate erasure durable; scheduled 30-day worker deferred | Erasure across stores needs a durable recovery path |
| #49 | PostgreSQL durability vs ephemeral routes | Core loop, settings, searches, bookmarks durable; about 210 routes in memory | Do not ship in-memory state behind production routes (target ADR-T05) |
| #50 | Payment gateway and billing integrity | Fake checkout removed, unsigned webhooks eliminated, simulated mode refused in production; live integration deferred | Redirect success grants nothing (INV-T17); signed webhooks only |

PR lineage the prior file recorded: #40 persistence for the core loop, proof-of-control and an honest dynamic frontend (ADR-015); #41 RLS for direct messaging and notifications; #42 RLS outer-query fix and a bundle-secret scanner in CI; #43 single-writer advisory-lock lease, worker heartbeat, fail-closed transactional email, durable erasure store; #51 AES-256-GCM encryption of bring-your-own AI keys, opt-in email adapter, durable settings; #52 release preflight migration-drift tool; #53 SQL-backed saved searches; #54 SQL-backed saved job bookmarks; #55 Oracle Ampere ARM64 staging compose; #56 staging backup and isolated restore drill; #57 fixes for #44 to #50, frontend fixes FE-02..FE-07 and FE-11, Playwright suite; #58 review round 2 regressions and the BR-167 visibility gate. Final commit: graph index. These are history; target equivalents are the CI secret-scan gate, restore drills (OPS-DR), and RLS tests.

## 8. Prior audit update of 2026-10-21 (top of MEMORY.md)

The prior audit stated: current execution passed 1,172 unit/integration assertions in 115 files, five migration-helper tests and ten non-emitting type checks; formatting failed in seven files; no PostgreSQL, browser, live-provider, deployment or restore pass was claimed; build, install and emitting typecheck were not run because of a protected-build-file rule. Reproduced defects: **non-executable challenge text received a simulated passed/100 while evidence remained unverified**; **sequential worker batch leases allowed duplicate handler executions**; a static finding that **cross-store erasure can fail after account deactivation, requiring durable recovery**. The three defects above are the prior reproductions D-01 (simulated challenge pass), D-02 (duplicate handler executions) and D-03 (erasure recovery) as used in the prior feature plan (`../31_LEGACY_ARCHIVE/docs/reports/FEATURE_PLAN_2026-10-21.md`, outside this source group). Prior GitHub issues #44 to #50 stayed open and PRs #43 and #51 to #58 were merged; the prior file warned not to rebuild existing email, saved-search, bookmark, account, audit, flag stores, writer lease or heartbeat "from stale absence claims".

Target requirement candidates from these defects: (1) a challenge result must never be `passed` unless a real sandbox ran it (ADR-T13); (2) worker leases must be per-job with idempotent handlers (outbox + `FOR UPDATE SKIP LOCKED`, idempotency keys); (3) erasure must be a durable multi-store saga with retry and a visible state.

## 9. Documentation deliverables the prior attempt indexed

Audit master report; feature traceability matrix; architecture-durability report; git reconciliation report; release scope and backlog; documentation index; the root SSOT (v6.0); feature registry (v6.0); ADR-015 core-loop persistence. All live in the archive (`../31_LEGACY_ARCHIVE/docs/reports/`, `../31_LEGACY_ARCHIVE/docs/engineering/adr/`) and are outside this merge's source group.

## 10. Open items

| ID | Item |
|---|---|
| OPEN-LGA-19 | Place legacy Stages A to F and BL-001..BL-018 in the target roadmap; BL-018 and D-01..D-03 are resolved in the paragraphs above; the remaining backlog detail is in the archive reports. Owner: Program Director. |


<!-- ledger-D D-01 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/BRAIN/MEMORY.md (gap closure D-01)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: branch name and memory-control metadata (lines 1-14, 38-41), Next Action (line 53), and the code snippets `deploy/oracle/verify-backup-restore.sh`, `pnpm exec tsc -b`, `pnpm exec tsc -p tests`, `rgb(100, 116, 139)`, `crypto.createHmac('sha256', ...)`.

~~~~text
L1: # TalentSphere — Project Memory
L2: 
L3: ## Audit update — 2026-10-21 (current evidence, not release acceptance)
L4: 
L5: - Current audit and roadmap remain in `docs/reports/FEATURE_STATUS_2026-10-21.md`
L6:   and `docs/reports/FEATURE_PLAN_2026-10-21.md`; supporting source/reference/test
L7:   records are in `docs/reports/AUDIT_EVIDENCE_2026-10-21.json`.
L8: - Initial `main` HEAD was `a30b35bf` with 27 staged entries. Another actor committed
L9:   those entries as `a771a87b` during discovery. The auditor did not commit or alter
L10:   that product work; all audit changes are documentation/evidence only.
L11: - Current execution: 1,172 Vitest tests across 115 files passed, zero failed/pending;
L12:   five migration-history helper tests passed; all ten projects passed non-emitting
L13:   typechecks. Formatting failed in seven existing paths. Native Vitest config
L14:   loading and disabled cache avoided protected build writes. Existing compiled
[...]
L38: - **Last Updated:** 2026-10-22
L39: - **Current Branch:** `repository_audit_roadmap` (synchronized with `main` at `83dc7d24`)
L40: - **Current HEAD:** `83dc7d247efbd3b3c3312bef74ac49978d33e924` (Commit: `update`, author: Yash Somani)
L41: - **Current Primary Task:** Master Repository Audit & Agile Roadmap Synthesis. Official deliverables published in `docs/reports/` (`AUDIT_MASTER_REPORT.md`, `FEATURE_TRACEABILITY_MATRIX.md`, `ARCHITECTURE_DURABILITY_REPORT.md`, `GIT_RECONCILIATION_REPORT.md`, `RELEASE_SCOPE_AND_BACKLOG.md`).
[...]
L49:   - Compilation & Build: `pnpm exec tsc -b` (clean), `pnpm exec tsc -p tests` (clean), `pnpm build` (6 packages + 3 apps clean).
[...]
L53: - **Next Action:** Execute Stage A operational gates (Staging email DNS/credentials, Legal counsel terms ratification, SEC-01 email HMAC fix, SEC-02 referee token TTL fix, OPS-02 Caddy `/health` proxying).
[...]
L64: - **Frontend:** React 19 + TypeScript + Vite PWA (20 pages, 16 reusable components in `apps/web/src/`). Dynamic candidate, recruiter, and referee journeys on real data. Accessibility verified for keyboard navigation, focus states, and WCAG 3:1 input contrast ratio (`rgb(100, 116, 139)`).
[...]
L152: - **PR #56 (`252b03f9`)**: Staging database backup and isolated restore verification drill (`deploy/oracle/verify-backup-restore.sh`).
[...]
L189:    - *Remediation:* Key with server `TOKEN_SECRET` via `crypto.createHmac('sha256', ...)`.
~~~~


<!-- ledger-D D-19 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/PRODUCTION_AUDIT_2026-10-03.md (gap closure D-19)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: ids QW-03, QW-05, QW-06 and TD-04 as named items (sections 15 and 16, lines 1070-1175), scorecard arithmetic chains ('30 + 7 = 37', '5 + 2 = 7'), causal-chain strings ('real browser -> real backend -> real database -> ...'), about 78 code/line tokens (`LoginPage.tsx:38`, `CheckoutPage.tsx:331`, `package-lock.json`).

Prior-attempt technical debt and quick wins now carried by id (full text quoted below):

| Id | Prior attempt reported / recommended | Target requirement derived |
|---|---|---|
| TD-04 | High debt: demo fallback behavior left inside authentication | No demo or fabricated session path in authentication; failure shows an error with retry (see QW-01) |
| QW-03 | Make web pages data-driven: replace hard-coded dashboard/jobs/evidence state with API queries | Every screen state comes from server data; no hard-coded product data |
| QW-05 | Create a real settings surface: exposes already-existing backend functionality with comparatively little conceptual work | A real settings screen backed by the account-settings API |
| QW-06 | Create the first real messaging UI: the backend foundation already existed, so this gave the API capabilities an actual user value surface | A real messaging UI over the messaging API |

~~~~text
L15: > - **CI red on `main`:** the latest GitHub Actions run (2026-10-03) failed at the `pnpm typecheck` step (`.github/workflows/ci.yml` line 50) with `TS2307: Cannot find module '@talentsphere/ui'` and `TS2307: Cannot find module '@talentsphere/observability'`, before tests/build/E2E ran. A local reproduction of the typecheck failure (`tsc -p apps/web/tsconfig.json --noEmit`) emits the same `TS2307` family for `@talentsphere/ui` (and uninstalled workspace/runtime dependencies), consistent with the CI failure mode. Added as blocker **P0-08**.
[...]
L17: > - **Assessment sandbox simulation confirmed:** `apps/web/src/pages/AssessmentsPage.tsx` — `handleRunSandbox` (line 103) emits precomputed PASS logs via `setTimeout` (line 110, ~1.2 s) ending in "Verification Complete"; no real code execution, container isolation, or profiling occurs in the browser journey.
L18: > - **Additional compliance copy:** beyond "GDPR & CCPA Compliant" (`PrivacyPage.tsx:28`), the footer also asserts **"SOC2 Type II Ready"** (`components/Layout.tsx:493`). Both remain unsupported by executable evidence (finding 22.6).
L19: > - **Accessibility detail confirmed:** the checkout plan selector uses custom `role="radio"` divs (`CheckoutPage.tsx:331`) without conventional arrow-key radio-group navigation.
[...]
L22: > - **In-flight remediation attempt exists but is not merged to `main`:** commit `d1b191e` ("Fix TypeScript CI failures by migrating from pnpm to npm and updating build cache") exists on a feature branch only. It adds `package-lock.json` alongside the retained `pnpm-lock.yaml`, but `.github/workflows/ci.yml` still invokes `pnpm install --frozen-lockfile` / `pnpm typecheck` (lines 40/50), so as authored it would not change the CI failure mode. Until a fix lands on `main`, blocker **P0-08 stands as of 2026-10-03**: no green automated proof beyond lint/install exists on the trunk, and tests/build/E2E remain skipped by the gate.
[...]
L27: > - **CI confirmation basis:** the October 3 `main` typecheck failure (`TS2307 @talentsphere/ui`, `@talentsphere/observability`) is consistently reported across all four independent audit passes and was reproduced locally via `tsc`; direct GitHub Actions API access was unavailable from this environment, so the remote-run observation rests on auditor-reported evidence plus local reproduction. Blocker **P0-08 remains open**; the unmerged `d1b191e` attempt still does not update `ci.yml`.
L28: > - The fourth pass also confirms: 9 routes (`App.tsx:18–27`), demo-token fallback (`LoginPage.tsx:47`), swallowed checkout failure (`CheckoutPage.tsx:117`) and login (`LoginPage.tsx:38`), fake `sha256:` hash (`EvidencePage.tsx:133`), local-state "Application Transmitted" (`JobsPage.tsx:79,82,218`), 147 in-process Maps (`server.ts`), hardcoded free AI tier (`server.ts:5198`), log-only worker delivery (`worker/index.ts:13`), and unsupported compliance copy (`PrivacyPage.tsx:28`, `Layout.tsx:493`). Verdict unchanged: **NOT READY — 4.6/10**.
[...]
L44: - the API stores primary state in **in-process `Map` objects**, so the application loses runtime state when the API process restarts (verified: `apps/api/src/server.ts:571` "In-memory repositories for modular monolith runtime state", Maps from line 580 onward);
[...]
L46: - checkout can show **"Subscription Confirmed!" even when the backend call fails** (verified: `apps/web/src/pages/CheckoutPage.tsx` lines 105–124, `.catch(() => null)` followed by unconditional `setConfirmedOrder`);
[...]
L49: - AI is implemented as a deterministic/domain response path rather than a real external AI-provider flow, with the tier hardcoded (`apps/api/src/server.ts:5198`: `const userTier: AITier = 'free'; // default free tier, strictly metered`);
[...]
L51: - the web UI contains substantial hard-coded/demo data (verified: `DashboardPage.tsx` hardcodes `12` verified items and `88%` readiness; `EvidencePage.tsx:133` fabricates hashes via `Math.random()`; `JobsPage.tsx:79-82` sets "Application Transmitted" from local React state with no fetch);
[...]
L74: `Landing → Dashboard / Evidence / Jobs / Assessments / Login / Checkout`
[...]
L98: `talentsphere_token = demo_token_<timestamp>`
[...]
L118: `CheckoutPage.tsx` validates the card fields locally, sends `/api/v1/billing/subscribe`, ignores the response status with `.catch(() => null)`, and then unconditionally creates a local `confirmedOrder`.
[...]
L122: `invalid/no API response → local confirmation → "Subscription Confirmed!"`
[...]
L152: (`apps/api/src/server.ts:571`) and creates `Map` instances for users, profiles, subscriptions, jobs, applications, messages, notifications, resumes, settings, AI conversations and many additional entities.
[...]
L154: Examples include (`apps/api/src/server.ts:580+`):
[...]
L156: `usersByEmail`, `subscriptionsByUserId`, `notificationsById`, `resumesById`, `applicationsById`, `messagesById`, `evidenceById`, etc.
[...]
L164: `process restart → application state lost`
[...]
L200: There is no actual email/push/SMS provider call in that handler (nor in the `evidence.propagate` and `analytics.aggregate` handlers — all three are log-only).
[...]
L204: `event → queue → worker → log`
[...]
L208: `event → queue → provider → delivery → acknowledgment → retry/dead-letter`
[...]
L214: Added in Revision B. `EvidencePage.tsx` derives "verification" from `isEmailVerified: Boolean(email)` (line 130) and fabricates the displayed `sha256:` digest with `Math.random()` (line 133); `JobsPage.tsx` flips local React state (`setAppliedJobs`, lines 79–82) to render "Application Transmitted" (line 218) without any backend application transaction; `AssessmentsPage.tsx` simulates sandbox execution with precomputed PASS logs behind a `setTimeout` (`handleRunSandbox`, line 103). The product's core promises — trustworthy evidence, real applications, proctored assessment — are represented by UI state rather than committed business state.
[...]
L220: Added in Revision B and re-confirmed against the live remote in Revision C (third audit pass, 2026-10-03). The latest GitHub Actions run on 2026-10-03 failed at `pnpm typecheck` (`.github/workflows/ci.yml` line 50) with `TS2307: Cannot find module '@talentsphere/ui'` and `TS2307: Cannot find module '@talentsphere/observability'`, so the release gate never reached unit/integration/security tests, build, or E2E (all skipped). A local reproduction of the same failure family was observed in this working tree (`tsc -p apps/web/tsconfig.json --noEmit` reports the `@talentsphere/ui` TS2307 among unresolved modules). This means even the existing automated proof is currently not executing end-to-end on `main`. Note (Revision C): an unmerged feature-branch commit (`d1b191e`) attempts a pnpm→npm migration but does not update `ci.yml`, which still runs `pnpm install --frozen-lockfile` and `pnpm typecheck`; the blocker remains open until a corrected fix lands on `main`.
[...]
L265: `browser still has token → token may verify cryptographically → backing user state no longer exists`
[...]
L346: - `notifications.send` handler.
[...]
L370: - always assigns `userTier = 'free'` (`apps/api/src/server.ts:5198`);
[...]
L372: - uses `generateCareerAssistantResponse(...)`;
[...]
L379: `AI Assistant guidance for: "${input.prompt}"`
[...]
L425: `Select plan → enter card → submit → Subscription Confirmed`
[...]
L429: `client validation → best-effort API call → local confirmation`
[...]
L433: `payment provider authorization → webhook → reconciled entitlement`
[...]
L451: `backend capability ≠ user capability`
[...]
L477: `Failure → explain → preserve → retry → alternate path → confirm final state`.
[...]
L682: `Goal → Skills → Evidence → Learning`
[...]
L752: `strong automated shell checks ≠ complete accessibility conformance`
[...]
L850: `React → Fastify → Domain → Worker → Supabase`
[...]
L854: `React → Fastify → in-memory Maps → pseudo queue`
[...]
L901: `41 SQL migrations`
[...]
L905: ### 11.4 Test architecture can create false confidence
L906: 
L907: A large number of API tests against `app.inject()` can prove domain behavior while still failing to prove:
L908: 
L909: `real browser → real backend → real database → real worker → real provider`
L910: 
L911: That exact distinction is visible in the repository's test design.
L912: 
[...]
L937: `identity → profile → goals → skills → evidence → opportunity → persistent application → communication → outcome`
[...]
L957: `Enter invalid credentials → API unavailable → demo token → dashboard`
[...]
L965: `Enter card → backend request fails → local success state`
[...]
L973: `Enter corporate email → browser marks email verified because string exists`
[...]
L983: `Click Apply → local React state → "Application Transmitted"`
[...]
L993: `Event → queue → worker → log`
[...]
L1003: `Create data → restart API → data disappears`
[...]
L1070: 
L1071: ## 15. Technical Debt
L1072: 
L1073: ## High
L1074: 
L1075: ### TD-01
L1076: 390 KB single Fastify server file.
L1077: 
L1078: ### TD-02
L1079: In-memory persistence pretending to be production data architecture.
L1080: 
L1081: ### TD-03
L1082: Frontend business state hard-coded.
L1083: 
L1084: ### TD-04
L1085: Demo fallback behavior left inside authentication.
L1086: 
L1087: ### TD-05
L1088: Frontend API failures swallowed.
L1089: 
L1090: ### TD-06
L1091: Billing without provider integration.
L1092: 
L1093: ### TD-07
L1094: Worker handlers that only log completion.
L1095: 
L1096: ### TD-08
L1097: Large divergence between canonical route documentation and actual route implementation.
L1098: 
L1099: ### TD-09
L1100: Duplicate specification/status claims across README, registries and validation reports.
L1101: 
L1102: For example, README and FINAL_VALIDATION_REPORT describe different feature/test-count snapshots, which demonstrates documentation synchronization drift. [README.md](../../../../README.md) [FINAL_VALIDATION_REPORT.md](FINAL_VALIDATION_REPORT.md)
L1103: 
L1104: ### TD-10
L1105: Test suites validate many API capabilities that are not reachable through the production web application.
L1106: 
L1107: ---
L1108: 
L1109: ## 16. Quick Wins
L1110: 
L1111: ## QW-01 — Delete demo authentication fallback
L1112: 
L1113: Replace:
L1114: 
L1115: `API failure → demo login`
L1116: 
L1117: with:
L1118: 
L1119: `API failure → visible error + retry`
L1120: 
L1121: This is the most important quick fix.
L1122: 
L1123: ---
L1124: 
L1125: ## QW-02 — Make UI success dependent on API success
L1126: 
L1127: Every transactional action should require:
L1128: 
L1129: `HTTP success + valid response body + state confirmation`
L1130: 
L1131: before showing success.
L1132: 
L1133: Do this first for:
L1134: 
L1135: - login;
L1136: - checkout;
L1137: - evidence;
L1138: - apply.
L1139: 
L1140: ---
L1141: 
L1142: ## QW-03 — Make web pages data-driven
L1143: 
L1144: Replace hard-coded dashboard/jobs/evidence state with API queries.
L1145: 
L1146: ---
L1147: 
L1148: ## QW-04 — Add route guards
L1149: 
L1150: Unauthenticated users should not be able to access authenticated experiences merely by navigating to `/dashboard`.
L1151: 
L1152: ---
L1153: 
L1154: ## QW-05 — Create a real settings surface
L1155: 
L1156: This exposes already-existing backend functionality with comparatively little conceptual work.
L1157: 
L1158: ---
L1159: 
L1160: ## QW-06 — Create the first real messaging UI
L1161: 
L1162: The backend foundation already exists, so this gives the API capabilities an actual user value surface.
L1163: 
L1164: ---
L1165: 
L1166: ## QW-07 — Remove unsupported compliance claims
L1167: 
L1168: Do not say "GDPR & CCPA Compliant" until executable and operational evidence exists.
L1169: 
L1170: ---
L1171: 
L1172: ## 17. Prioritized Remediation Roadmap
L1173: 
L1174: ## Phase 0 — Stop pretending transactions succeeded
L1175: 
[...]
L1195: `API → domain → repository → Supabase/Postgres`
[...]
L1231: `Register → Verify → Onboard → Goal → Skills → Evidence → Profile → Jobs → Apply → Track`
[...]
L1271: `entitlement → provider selection → AI generation → provenance → cost accounting → human review → action`
[...]
L1305: Scores are out of 10.
L1306: 
L1307: | Area | Score | Reason |
L1308: |---|---:|---|
L1309: | Architecture | **5/10** | Strong modular intent and shared packages, but runtime persistence architecture is not production-grade |
L1310: | Business Readiness | **2/10** | Core product value cannot yet be reliably completed by end users |
L1311: | Feature Completeness | **4/10** | Broad backend surface, weak browser coverage and many incomplete flows |
L1312: | UX | **4/10** | Good visual shell, but state integrity and journey completeness are poor |
L1313: | Accessibility | **8/10** | Strong automated Chromium accessibility coverage, but contrast/screen-reader verification is absent |
L1314: | Security | **2/10** | Strong test intent, but fake login, raw card handling and unsigned webhook are critical |
L1315: | Performance | **5/10** | Fast in-memory demo, insufficient evidence for real production load |
L1316: | Test Coverage | **7/10** | Large and thoughtful automated suite, but substantial API-vs-browser coverage mismatch |
L1317: 
L1318: ### Calculation
L1319: 
L1320: `5 + 2 + 4 + 4 + 8 + 2 + 5 + 7`
L1321: 
L1322: Digit by digit:
L1323: 
L1324: `5 + 2 = 7`
L1325: `7 + 4 = 11`
L1326: `11 + 4 = 15`
L1327: `15 + 8 = 23`
L1328: `23 + 2 = 25`
L1329: `25 + 5 = 30`
L1330: `30 + 7 = 37`
L1331: 
L1332: `37 ÷ 8 = 4.625`
L1333: 
L1334: Rounded to one decimal:
L1335: 
~~~~

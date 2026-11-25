# Target blueprint 22: Implementation Roadmap

> **Status.** Archive: proposal, not ratified. A greenfield redesign blueprint written in October 2026. Every area was Draft, Under Review or Revision Required (its own document status) and no test was run against it. Its content was mined into `docs/blueprint/`; `SSOT.md` remains the source of intent. Module federation described here was not adopted: the built system is a modular monolith (`ARCHITECTURE.md`).
>
> **What this file holds.** All files of the former `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/` folder, in order.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| Legacy Prior-Attempt Roadmap, Backlog and Lessons (from BRAIN/MEMORY.md) merged | `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` |
| Legacy Release Gates, Issue and PR Lineage (reports group) | `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` |
| Implementation Roadmap | `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP.md` |
| Implementation Roadmap, Revision 2 overlay (RDM-01 REV2) | `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP_REV2.md` |

## Legacy Prior-Attempt Roadmap, Backlog and Lessons (from BRAIN/MEMORY.md) merged

_Former file: `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md`._

Doc ID: RDM-LEG-01 · Owner: Program Director (with Delivery Lead) · Version 1.0 · Status: Draft for Review · Relates: `ROADMAP.md` (RDM-01), `ROADMAP.md#record-roadmap-rev2`, `../30_PRIOR_IMPLEMENTATION_REFERENCE/` (earlier as-built analysis), `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

### Merged from legacy: `31_LEGACY_ARCHIVE/BRAIN/MEMORY.md` (memory version 4.0, last updated 2026-10-22, plus an audit update dated 2026-10-21 at its top)

### 0. Frame

**Nothing is implemented in this project.** `MEMORY.md` was the prior attempt's living execution log. Every statement below is "**the prior attempt reported**" and is history or a lesson, not a fact about this project. The prior file itself warned that its status figures ("51 verified", "1058 tests pass") were not re-measured and conflicted with a later status of record. Numbers differ between its own sections (see section 2). Use this file as (a) a menu of candidate work packages and (b) a list of mistakes to avoid. The target plan stays `ROADMAP.md` (Ph0 to Ph4).

### 1. What the prior attempt reported (snapshot, not truth)

| Topic                       | Prior report                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Overall state               | "Hybrid transition": core career loop durable in PostgreSQL; about 217 long-tail routes ephemeral in memory                                                                                                                                                                                                                                                        |
| Backend                     | Fastify 5 + Node.js + TypeScript modular monolith; 274 registered routes across 43 prefixes; 54 durable routes (about 20%) on PostgreSQL 16 under a single-writer advisory-lock lease; 217 ephemeral routes (about 80%) across about 150 in-process maps returning an `x-talentsphere-durability: ephemeral` header; 3 stateless routes (health x2, billing plans) |
| Frontend                    | React 19 + TypeScript + Vite PWA; 20 pages, 16 components; candidate, recruiter and referee journeys on real data; keyboard, focus and 3:1 input-contrast checks reported                                                                                                                                                                                          |
| Database                    | PostgreSQL 16; 49 SQL migrations (00001 to 00049) at the time of the memory file                                                                                                                                                                                                                                                                                   |
| Authentication              | PBKDF2-HMAC-SHA512 with a 210,000-iteration floor and transparent upgrade on login; HMAC-SHA256 session tokens with a unique session id; a revoked-sessions table; a global device cut-off timestamp                                                                                                                                                               |
| Proof of control            | Corporate-email OTP attestation with disposable/webmail filtering; 128-bit referee voucher links stored as SHA-256 hashes, single-use, idempotency key `clientRequestId`                                                                                                                                                                                           |
| AI governance               | Server-authoritative `AI_PROHIBITED` on proctored assessments; user quota metering (20 requests/day free, later changed, see `../19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md`); prompt-injection context firewall (WIT-007); local heuristic assistant; **zero external LLM network calls**                                              |
| Integrations                | Resend transactional email adapter with exponential-backoff retries and staging fail-closed checks; simulated billing mode that refused paid plans in production; signed HMAC-SHA256 billing webhooks (later replaced by Stripe, see pricing file)                                                                                                                 |
| Deployment                  | Oracle Ampere ARM64 Docker Compose with internal network isolation (database and API ports closed; Caddy edge proxy on 80/443)                                                                                                                                                                                                                                     |
| Workspace                   | 10 packages/apps (api 13,405 lines; web; worker; config; contracts; domain 48 modules; observability; ui; testing; migrations)                                                                                                                                                                                                                                     |
| Tests reported (2026-10-22) | 1,143 passing in 112 files: unit 55 files / 627; integration 50 files / 402; security 5 files / 101; Playwright E2E 2 files / 13 (7 + 6); plus 8 PostgreSQL persistence files needing a test database URL                                                                                                                                                          |
| Git                         | 302 commits; PRs #40 to #58 linear (section 7)                                                                                                                                                                                                                                                                                                                     |

### 2. Conflicting counts inside the prior attempt (preserved so the conflict stays visible)

| Quantity         | Values the prior documents gave                                                                                                                                                                                                                           | Note                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| SQL migrations   | 41 (index), 46 (README), 49 (memory), 51 (2026-10-21 audit), 54 (2026-10-23 reconciliation), 55 (prior INDEX reference to its database document)                                                                                                          | Dated snapshots; inventory is not execution proof (legacy conflicts C-4, C-16)                                       |
| Feature maturity | memory: Full 26 / Partial 91 / Stub 6 / Missing 50 = 173 (15.0% / 52.6% / 3.5% / 28.9%); 2026-10-21 audit: 6 implemented-unverified, 87 partial, 1 broken/regressed, 75 not implemented, 4 deprecated/not recommended; earlier counts 16/78/75, 47 and 51 | The audit explicitly said no feature was newly certified end to end and that the memory counts were superseded (C-2) |
| Tests            | memory 1,143 passing in 112 files; audit 1,172 assertions in 115 files, lint failed in 7 files, PostgreSQL and browser suites not run; earlier "1058"                                                                                                     | C-3                                                                                                                  |
| Role count       | root SSOT 3 JWT roles + 24 contextual roles; built union of 10 roles                                                                                                                                                                                      | C-21 (OPEN-44)                                                                                                       |
| Routes           | 274 registered (memory) vs 278 unique method/path pairs (API reference)                                                                                                                                                                                   |                                                                                                                      |

None of these numbers describe this project. They show **why status must come from executable evidence and one tracker** (target: release gates, `IMPLEMENTATION_READINESS.md`).

### 3. Milestone

**M6: Repository audit, operational gating and core-loop production release.** Goal: synthesise audit findings, reconcile PRs #40 to #58 and issues #44 to #50, harden operational gates, release the Core Career Loop to production GA. Prior target date: 2026-11-15. Prior status: in progress. (History; target milestones are in `ROADMAP.md`.)

### 4. Prior capability groups and their reported state (history; useful as grouping hints)

| Group                                   | Features (legacy IDs)                                       | Prior reported state                                                                                                                                                                                                                                                                 |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity and foundation                 | F-01, F-02, F-03, F-12, F-15, F-21, F-60, F-65, F-80        | "Full / operational" (durable tables for users, profiles, revoked sessions, settings, erasure requests)                                                                                                                                                                              |
| Job marketplace and ATS                 | F-04, F-05, F-06, F-25, F-32, F-56, F-102, F-117, F-173     | "Full / operational"                                                                                                                                                                                                                                                                 |
| Verifiable work history and credentials | F-58, F-94, F-96, F-162                                     | "Full / operational": corporate email OTP, referee voucher tokens, referee review, verification score badges (Gold/Silver/Bronze), SHA-256 digital skill evidence                                                                                                                    |
| Communication and alerts                | F-10, F-14, F-29                                            | "Full / operational": 1:1 messaging with threads, unread counts, notification delivery with digest preferences                                                                                                                                                                       |
| Learning management                     | F-07, F-40, F-50, F-66, F-67, F-68, F-70                    | Partial: schema and 24 endpoints; state ephemeral; no web UI                                                                                                                                                                                                                         |
| Challenges and assessments              | F-08, F-77, F-78, F-115                                     | Partial: schemas and rules; web preview; backend ephemeral                                                                                                                                                                                                                           |
| Reputation, credibility, intelligence   | F-85, F-86, F-118, F-123, F-144, F-148..F-153, F-158..F-160 | Partial: mathematical models (Markov progression, half-life decay, k-anonymity, Wilson-score confidence interval); ephemeral                                                                                                                                                         |
| Prohibited / out of scope               | F-45, F-61, F-62, F-63, F-154, F-168                        | Stub: third-party proctoring and candidate paid tier vendor/pricing-gated; sponsored content and business-development graph NOT RECOMMENDED; predictive hiring rejection models described as banned (see `../04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md` section 4) |

### 5. Prior staged roadmap (Stages A to F) and backlog items BL-001..BL-018

Treated here as **candidate work packages** to place in the target roadmap. Mapping to target phases is for the Program Director (OPEN-LGA-19).

| Stage                                               | Prior sprints | Backlog items                                                                                                                                                                                                                                                                                                                              | Candidate target phase                                                                             |
| --------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| A: Production hardening and operational gates       | 1 to 2        | BL-001 HMAC-SHA256 for email OTPs; BL-002 30-day TTL for referee voucher tokens; BL-003 Resend DNS SPF/DKIM verification in staging; BL-004 legal-counsel review of Terms and Privacy; BL-005 edge proxy must route `/health` to the API; BL-007 fix security-test script; BL-008 ignore-file update for generated graph and agent folders | Ph0/Ph1 (security and operations foundations; these are design requirements here, not fixes)       |
| B: Core-loop GA launch                              | 3 to 4        | BL-006 automated 30-day erasure execution; BL-009 persistence for active assessment sessions; BL-010 AI gateway Pro-tier quota resolution; public GA of the core career loop on staging (free launch tier)                                                                                                                                 | Ph1/Ph2                                                                                            |
| C: Progressive durability migration                 | 5 to 6        | BL-011/BL-012 challenges and assessments persisted and UI wired; BL-013 LMS courses and module completion persisted; BL-015 application draft autosave persisted; portfolio showcase (F-26) and admin console (F-17) persisted                                                                                                             | Not applicable as migration; in the target everything is durable from the start (ADR-T05; OPEN-52) |
| D: Commercial monetisation                          | 7 to 8        | BL-016 live Stripe Checkout and billing webhook processing; enterprise seat licensing and invoice generation                                                                                                                                                                                                                               | Ph2 (billing launch gates: OPEN-18, OPEN-19, OPEN-33)                                              |
| E: Sandboxed code execution and remote assessment   | 9 to 10       | BL-017 containerised (gVisor/Docker) execution sandbox; technical-interview real-time (WebRTC) room wiring                                                                                                                                                                                                                                 | Ph2 (OPEN-27 sandbox runner build vs buy)                                                          |
| F: Ecosystem, reputation and career-graph expansion | 11+           | BL-014 candidate reputation opt-in consent UI; career-trajectory graph visualisations; alumni networks, warm-introduction pathfinding, peer-credibility views                                                                                                                                                                              | Ph3/Ph4                                                                                            |

BL-018 is named in the prior file's range ("BL-001 to BL-018") but its content is not stated in this source group. Per `../30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` section 2.4 it is a P3 item, "Dockerfile pruning below 250 MB" (status unknown); the full backlog lives in `../31_LEGACY_ARCHIVE/docs/reports/RELEASE_SCOPE_AND_BACKLOG.md`, which is outside this merge's source group (OPEN-LGA-19).

### 6. Prior production blockers (four mandatory gates) as target launch gates

| Gate                                                | Prior requirement                                                                                                                                 | Target counterpart                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Transactional email DNS and credentials (issue #44) | Register SPF, DKIM and DMARC for the sending domain; configure live provider credentials in staging                                               | OPEN-26 (email stack), VR-02; launch checklist                          |
| Commercial payment gateway (issue #50)              | Procure a commercial payment merchant account and integrate hosted checkout before activating paid plans; launch under the free tier if necessary | OPEN-18, OPEN-19                                                        |
| Legal counsel ratification (issue #47)              | Formal sign-off of the privacy policy and terms by qualified counsel; remove unverified compliance badges and fake contact details                | OPEN-08                                                                 |
| Erasure grace-period policy (issue #48)             | Founder decision: immediate deletion vs 30-day grace; background scheduled worker if grace is chosen                                              | OPEN-08 (retention/erasure), legacy rule BR-063 (export within 30 days) |

### 7. Prior issue reconciliation (#44 to #50) and PR lineage (#40 to #58)

| Issue | Subject                                              | Prior state                                                                                                          | Lesson for the target                                                              |
| ----- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| #44   | Transactional email and provider delivery            | Partially addressed; fail-closed guards and adapter built; staging DNS verification open                             | Fail closed when the provider is unconfigured; verify DNS before claiming delivery |
| #45   | Reputation visibility and candidate consent (BR-167) | Unauthorised recruiter visibility blocked with 403; candidate opt-in consent UI deferred                             | Consent UI is part of the feature, not a later stage                               |
| #46   | Technical-interview code execution sandbox           | Cross-tenant IDOR fixed; simulated evaluation rejected with 503; secure sandbox deferred                             | Never simulate a pass; ADR-T13 (unverified until a real sandbox)                   |
| #47   | Privacy policy, terms, legal contact claims          | Resolved in code; legal ratification open                                                                            | Do not show unverified compliance claims                                           |
| #48   | User data erasure lifecycle                          | Immediate erasure durable; scheduled 30-day worker deferred                                                          | Erasure across stores needs a durable recovery path                                |
| #49   | PostgreSQL durability vs ephemeral routes            | Core loop, settings, searches, bookmarks durable; about 210 routes in memory                                         | Do not ship in-memory state behind production routes (target ADR-T05)              |
| #50   | Payment gateway and billing integrity                | Fake checkout removed, unsigned webhooks eliminated, simulated mode refused in production; live integration deferred | Redirect success grants nothing (INV-T17); signed webhooks only                    |

PR lineage the prior file recorded: #40 persistence for the core loop, proof-of-control and an honest dynamic frontend (ADR-015); #41 RLS for direct messaging and notifications; #42 RLS outer-query fix and a bundle-secret scanner in CI; #43 single-writer advisory-lock lease, worker heartbeat, fail-closed transactional email, durable erasure store; #51 AES-256-GCM encryption of bring-your-own AI keys, opt-in email adapter, durable settings; #52 release preflight migration-drift tool; #53 SQL-backed saved searches; #54 SQL-backed saved job bookmarks; #55 Oracle Ampere ARM64 staging compose; #56 staging backup and isolated restore drill; #57 fixes for #44 to #50, frontend fixes FE-02..FE-07 and FE-11, Playwright suite; #58 review round 2 regressions and the BR-167 visibility gate. Final commit: graph index. These are history; target equivalents are the CI secret-scan gate, restore drills (OPS-DR), and RLS tests.

### 8. Prior audit update of 2026-10-21 (top of MEMORY.md)

The prior audit stated: current execution passed 1,172 unit/integration assertions in 115 files, five migration-helper tests and ten non-emitting type checks; formatting failed in seven files; no PostgreSQL, browser, live-provider, deployment or restore pass was claimed; build, install and emitting typecheck were not run because of a protected-build-file rule. Reproduced defects: **non-executable challenge text received a simulated passed/100 while evidence remained unverified**; **sequential worker batch leases allowed duplicate handler executions**; a static finding that **cross-store erasure can fail after account deactivation, requiring durable recovery**. The three defects above are the prior reproductions D-01 (simulated challenge pass), D-02 (duplicate handler executions) and D-03 (erasure recovery) as used in the prior feature plan (`../31_LEGACY_ARCHIVE/docs/reports/FEATURE_PLAN_2026-10-21.md`, outside this source group). Prior GitHub issues #44 to #50 stayed open and PRs #43 and #51 to #58 were merged; the prior file warned not to rebuild existing email, saved-search, bookmark, account, audit, flag stores, writer lease or heartbeat "from stale absence claims".

Target requirement candidates from these defects: (1) a challenge result must never be `passed` unless a real sandbox ran it (ADR-T13); (2) worker leases must be per-job with idempotent handlers (outbox + `FOR UPDATE SKIP LOCKED`, idempotency keys); (3) erasure must be a durable multi-store saga with retry and a visible state.

### 9. Documentation deliverables the prior attempt indexed

Audit master report; feature traceability matrix; architecture-durability report; git reconciliation report; release scope and backlog; documentation index; the root SSOT (v6.0); feature registry (v6.0); ADR-015 core-loop persistence. All live in the archive (`../31_LEGACY_ARCHIVE/docs/reports/`, `../31_LEGACY_ARCHIVE/docs/engineering/adr/`) and are outside this merge's source group.

### 10. Open items

| ID          | Item                                                                                                                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OPEN-LGA-19 | Place legacy Stages A to F and BL-001..BL-018 in the target roadmap; BL-018 and D-01..D-03 are resolved in the paragraphs above; the remaining backlog detail is in the archive reports. Owner: Program Director. |

<!-- ledger-D D-01 -->

### Merged from legacy: 31_LEGACY_ARCHIVE/BRAIN/MEMORY.md (gap closure D-01)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: branch name and memory-control metadata (lines 1-14, 38-41), Next Action (line 53), and the code snippets `deploy/oracle/verify-backup-restore.sh`, `pnpm exec tsc -b`, `pnpm exec tsc -p tests`, `rgb(100, 116, 139)`, `crypto.createHmac('sha256', ...)`.

```text
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
```

<!-- ledger-D D-19 -->

### Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/PRODUCTION_AUDIT_2026-10-03.md (gap closure D-19)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: ids QW-03, QW-05, QW-06 and TD-04 as named items (sections 15 and 16, lines 1070-1175), scorecard arithmetic chains ('30 + 7 = 37', '5 + 2 = 7'), causal-chain strings ('real browser -> real backend -> real database -> ...'), about 78 code/line tokens (`LoginPage.tsx:38`, `CheckoutPage.tsx:331`, `package-lock.json`).

Prior-attempt technical debt and quick wins now carried by id (full text quoted below):

| Id    | Prior attempt reported / recommended                                                                                                       | Target requirement derived                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| TD-04 | High debt: demo fallback behavior left inside authentication                                                                               | No demo or fabricated session path in authentication; failure shows an error with retry (see QW-01) |
| QW-03 | Make web pages data-driven: replace hard-coded dashboard/jobs/evidence state with API queries                                              | Every screen state comes from server data; no hard-coded product data                               |
| QW-05 | Create a real settings surface: exposes already-existing backend functionality with comparatively little conceptual work                   | A real settings screen backed by the account-settings API                                           |
| QW-06 | Create the first real messaging UI: the backend foundation already existed, so this gave the API capabilities an actual user value surface | A real messaging UI over the messaging API                                                          |

```text
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
L1102: For example, README and FINAL_VALIDATION_REPORT describe different feature/test-count snapshots, which demonstrates documentation synchronization drift. [README.md](../../README.md) FINAL_VALIDATION_REPORT.md (`FINAL_VALIDATION_REPORT.md`, not present in this tree)
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
```

## Legacy Release Gates, Issue and PR Lineage (reports group)

_Former file: `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md`._

Doc ID: RDM-GATES-C · Owner: Program Director (proposed) · Version 1.0 · Status: Proposed (Under Review) · Date: 2026-10-26 · Merge track: C (source group `31_LEGACY_ARCHIVE/docs/reports/**`)

**Relationship (no original file was edited).** This file **supersedes nothing**. It does not change `ROADMAP.md` or `ROADMAP.md#record-roadmap-rev2`; it is a register of **gates and sequencing evidence from the earlier attempt** that the target roadmap can adopt, adapt or reject by ID. It is linked from `00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md`; the documentation owner must also link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`. Owner instruction behind this merge: _"i dont want to loos information keep everything in use untile it get improved"_. Contains no dates for the target, no durations and no staffing numbers.

**Greenfield frame.** No source code exists in this repository and nothing is implemented. Every row records "the earlier attempt required X before release" or "the earlier attempt reported state Y at commit Z". Hosted-service facts (Stripe, Supabase, GitHub) describe the **earlier attempt's accounts and repositories** at the dates given, observed read-only; they are not facts about any target environment. No live-verification gate below is satisfied for the target.

Companion files: `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` (lessons `LES-nn`), `05_FEATURE_SPECIFICATIONS/LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md` (requirements `LGR-nn`, `BL-nn`, `X-nn`), `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` (`LEI-nn`). Target roadmap work packages that relate by subject (pointers only, to be confirmed by the roadmap owner): WP-BILLING-STRIPE, WP-NOTIFY-EMAIL, WP-WORKER-OUTBOX, WP-PRIVACY-CONSENT, WP-IDENTITY-SESSIONS, WP-VERIF-REFEREE, WP-ASSESS-RUNNER, WP-PROCTOR-VENDOR, WP-DR-EXERCISE, WP-LOADBASE, WP-QA-TRACE, WP-MONOREPO-CI, WP-MIGRATE-DATA.

### 1. Gate catalogue (LRG-nn)

Each gate is a condition the earlier attempt judged necessary before a user-facing release. "State then" is the last recorded state in the reports (2026-10-23) and is historical.

| ID     | Gate                                                           | Required evidence (as the reports phrased it)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Source                                                                      | State then                                                                                                             |
| ------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| LRG-01 | **Exact-commit green CI**                                      | Lint, type-check including the test projects, unit, integration and security tests, local migrations applied to an empty database twice (idempotency), real-database tests, production build, client-bundle secret scan, browser tests all green on the exact release commit; no assertion weakened to get there.                                                                                                                                                                                                                                                                              | PRODUCTION_AUDIT P0-08; REPOSITORY_AUDIT R2-01, I, L                        | Red twice: 2026-10-03 at type-check; 2026-10-23 one of 236 browser cases failed (account-security, aborted navigation) |
| LRG-02 | **Transactional email proven**                                 | Verified sender and domain (SPF, DKIM, DMARC), a real mailbox receives the verification code and the referee link, the token is absent from the requester's response and from logs, expiry and replay negatives, retries preserve idempotency, bounce and retry alerting, queue alert; worker fails closed (503) when unconfigured in staging and production.                                                                                                                                                                                                                                  | issue "email" (#44 in 10-21/10-23 numbering); BL-003; X-02                  | Blocked: adapter code existed, no live proof                                                                           |
| LRG-03 | **Privacy and erasure lifecycle approved and proven**          | Ratified policy (immediate versus 30-day grace), retention and backup treatment, scheduler for due erasures, resumable cleanup after partial failure with the account kept closed, deletion proven across every store and the payment provider, user notification, counsel sign-off.                                                                                                                                                                                                                                                                                                           | issue "privacy/erasure" (#45); BL-006; X-07; D-03; R2-05                    | Blocked: owner and legal decision; no scheduler                                                                        |
| LRG-04 | **Legal text and contacts**                                    | Counsel review of Terms and Privacy Policy against GDPR, CCPA/CPRA and India DPDP recorded in a governance record; monitored privacy and security mailboxes on a domain the company owns; no unsupported compliance claim.                                                                                                                                                                                                                                                                                                                                                                     | BL-004; finding 20                                                          | Open (code honest; law open)                                                                                           |
| LRG-05 | **Persistence design ratified; populated migration rehearsed** | Owner ratifies the persistence design and its schema change (the earlier migration 00043: replaced `UNIQUE(job_id, candidate_id)` with a partial index, dropped the plaintext reference token after hashing, re-pointed work-history and reference foreign keys to `users(id)`); duplicate case-folded emails and active applications resolved by approved policy; upgrade of a populated snapshot, rollback and restore exercised; target grants and RLS deny cross-account reads.                                                                                                            | issue "ADR-015 / hosted migration" (#46); X-08; O-01                        | Blocked: no ratification; hosted project empty                                                                         |
| LRG-06 | **Hosted database target gate**                                | Do not run the migration command against a hosted managed database until a compatible identity model exists: the earlier SQL referenced `auth.users`, `auth.uid()`, `auth.jwt()` (four migrations held foreign keys to `auth.users(id)`) while the app issued its own sessions; do not insert fake `auth.users` rows, replace `auth.uid` globally or grant blanket access; rehearse on a disposable target (drift, abort and rollback, grants, RLS, concurrent writes) first. A CI scanner that expects exit code 1 on known incompatibility is a blocker detector, not a compatibility proof. | HOSTED_SUPABASE_MIGRATION_GATE (cited); STRIPE_SUPABASE; REPOSITORY_AUDIT E | Blocked                                                                                                                |
| LRG-07 | **Deployment topology correct**                                | HTTPS; the proxy forwards the root health route to the API (not static HTML); database and API publish no host ports, only the edge proxy binds 80 and 443; secrets excluded from images (`.dockerignore`); production image pruned (below 250 MB target); single API writer enforced where the design needs it.                                                                                                                                                                                                                                                                               | BL-005, BL-018; PR #55; OPS-02; issue "deployment" (#47)                    | Code existed; not operationally verified                                                                               |
| LRG-08 | **Worker and queue reliability**                               | Claims bounded by execution capacity and fenced by claim token, expired owners cannot acknowledge, crashed claims recover, cancellation wins, mail idempotency kept; worker heartbeat and queue-age alerts observed in a kill drill.                                                                                                                                                                                                                                                                                                                                                           | D-02; X-06; R2-07                                                           | Reproduced defect (6 jobs, 9 executions); fix not proven                                                               |
| LRG-09 | **Operations drills passed**                                   | Backup restored independently into an isolated database and verified (schema, table row counts, background-job queue); the restored app passes a smoke test; rollback of the image with schema compatibility; load and cold-boot/memory measured; external monitoring of error-level logs; approved RPO and RTO; signed go/no-go.                                                                                                                                                                                                                                                              | X-09; issue "deployment"; PRs #55, #56                                      | Not performed (no deployment target)                                                                                   |
| LRG-10 | **Assessment integrity and trust policy**                      | No scored result without approved isolated execution (submission-only until then); credential issuance after the final-assessment gate; linked certificate and evidence proofs agree on revocation; trust policy for badges and scoring ratified; interview code execution refused (503) in deployed environments until a sandbox is approved.                                                                                                                                                                                                                                                 | D-01, D-09, D-10; X-05, X-11; issue "interview/trust" (#49)                 | Open decisions                                                                                                         |
| LRG-11 | **Session architecture decision**                              | Decide bearer token in storage versus httpOnly cookie, with CSRF defence, credentialed CORS and the client contract.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | TS-007; issue "trust/token storage"                                         | Open                                                                                                                   |
| LRG-12 | **Commercial gate**                                            | Explicit free-only launch, or: approved provider and price policy, test-environment webhook endpoint configured and signed delivery verified, refund and dispute behavior decided and implemented, entitlement read-model audit (all gates read entitlements, never plan tier alone), truthful UI, then live-mode readiness. Do not enable the paid billing mode for public users before these gates.                                                                                                                                                                                          | issue "commercial" (#50); X-03; REPOSITORY_AUDIT F, L                       | Partial: Stripe code merged; 0 webhook endpoints in the test account; UI free-only                                     |
| LRG-13 | **Durable beta scope**                                         | Decide which long-tail modules must persist before exposure; each slice: API, database, authorization, UI, restart, tenant and browser tests; the UI states remaining preview limits.                                                                                                                                                                                                                                                                                                                                                                                                          | issue "durable beta modules" (#48); X-01                                    | Partial                                                                                                                |
| LRG-14 | **Security hardening backlog closed**                          | Keyed hash for email codes (BL-001); referee token expiry (BL-002); durable assessment sessions (BL-009); AI tier from entitlements (BL-010); password policy; CSP on the web host; patched web-framework advisory (fastify 5.12.2 to 5.12.5 affected by GHSA-389g-gv7q-r4x8, fixed in 5.12.6); secret scanner fails on scanner error.                                                                                                                                                                                                                                                         | SEC-01, SEC-02, SEC-05, SEC-06, O-4, D-07                                   | Open at last report                                                                                                    |
| LRG-15 | **Accessibility and performance acceptance**                   | Manual contrast and screen-reader checks; measured service-level objectives (no fictitious SLOs); layout-shift budget; load, soak, backup/restore and deployment tests (never produced).                                                                                                                                                                                                                                                                                                                                                                                                       | FINAL_VALIDATION "Not produced"; FEATURE_STATUS; PRODUCTION_AUDIT section 8 | Not produced                                                                                                           |
| LRG-16 | **Documentation and claims gate**                              | Status documents match evidence, dated and tied to a commit; no feature called implemented from documentation; the docs index points to the current audit; historical reports labelled.                                                                                                                                                                                                                                                                                                                                                                                                        | REPOSITORY_AUDIT R2-08; FEATURE_PLAN K                                      | Drift recorded                                                                                                         |
| LRG-17 | **Verification-environment gate**                              | A clean, permitted environment (fresh build, install, isolated test database, browser) exists before acceptance is claimed; "not run" is never reported as pass.                                                                                                                                                                                                                                                                                                                                                                                                                               | D-06; X-00                                                                  | Blocked                                                                                                                |

### 2. Issue-by-issue gates (GitHub #44 to #50)

All seven issues were **open** at every report. No issue closure was justified (REPOSITORY_AUDIT D, J). The two mappings of numbers to titles differ; both are retained (lessons file section 12 explains why the first is preferred).

#### 2.1 Mapping used by FEATURE_STATUS (2026-10-21) and REPOSITORY_AUDIT (2026-10-23), which read the issue bodies

| Issue | Title / scope                                        | Priority | Already in code or merged work                                                                            | Remaining acceptance                                                                                                     | Whole-issue status on 2026-10-23   |
| ----- | ---------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| #44   | Transactional email delivery                         | P0       | PR #51 Resend adapter, fail-closed configuration, durable enqueue                                         | Sender and provider ownership, real inbox, monitoring, D-02                                                              | BLOCKED (provider and live proof)  |
| #45   | Privacy, legal, erasure                              | P0       | PR #43 request and cancel SQL; PR #51 encrypted metadata and cleanup; PR #58 privacy checks               | Legal, contact and retention approval, scheduler policy, complete recoverable deletion including shared data and backups | BLOCKED (owner, legal, live proof) |
| #46   | Persistence design ratification and hosted migration | P0       | PR #52 migration ledger guard and read-only preflight; ADR describing the writer lock                     | Ratification, populated migration and rollback, hosted grants and RLS                                                    | BLOCKED (schema, approval)         |
| #47   | Deployment, restore, single writer                   | P0       | Writer lock, heartbeat, PR #55 topology, PR #56 recovery scripts, PR #58 config hardening                 | Deployed drills, load and boot measurements, independent restore and rollback, release acceptance                        | BLOCKED (infrastructure proof)     |
| #48   | Durable beta modules                                 | P1       | PR #51 metadata, PR #53 searches, PR #54 bookmarks; audit and flag stores; billing in database mode       | Selected remaining modules, drafts, connections, alerts; avoid blanket rewrite                                           | PARTIAL                            |
| #49   | Interview, trust, token storage                      | P1       | PR #43 deployed interview refusal and trust changes; PRs #57, #58 regression and access control           | Challenge semantics, approved sandbox, trust, badge and session policy; no cookie migration assumed                      | PARTIAL / decisions blocked        |
| #50   | Commercial policy and payment                        | P1       | Paid activation disabled; simulated mode refused in deployment; PR #71 Stripe backend and migration 00052 | Explicit free-only decision or approved provider plus durable payment and entitlement reconciliation; price approval     | PARTIAL                            |

Status accounting (REPOSITORY_AUDIT A): fixed and verified 0; implemented, not fully verified 0; partially fixed or open 3 (#48, #49, #50); regressed 0; blocked 4 (#44 to #47); not reproducible 0. Comments counted in the 2026-10-21 snapshot: #44 2, #45 3, #46 2, #47 3, #48 5, #49 1, #50 1 (17 total). On 2026-10-23 the review posted five comments (to #45, #46, #47, #48, #50: ids 6374109469, 6374110168, 6374110786, 6374111482, 6374112336) and changed no state, label or assignee.

#### 2.2 Mapping used by GIT_RECONCILIATION_REPORT (2026-10-22), inferred from commits

| Issue | Title in that report                                                                     | Codebase status                               | Release status          | Commits and PRs cited                                                                                                                                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #44   | Transactional email, provider integration and fail-closed guard                          | Partially addressed                           | Gated (staging proof)   | `22fb8190`, `ad613fc3` (PR #43 fail-closed 503); `43ef011e`, `73f27b29`, `f75fd3b4` (PR #51 Resend adapter, exponential backoff, idempotency headers); `8aea7fee` (PR #51 worker configuration validator); `7c723a0e` (PR #55 outbound mail allowed, database private); `43bb9258` (PR #57 FE-05) |
| #45   | Reputation visibility, recruiter scoping, candidate consent (BR-167)                     | Partially addressed                           | Gated (consent setting) | `a30fcaab` (PR #57); `8f5ff69a` (PR #58 R2-2); `d3607f0f` (PR #58 BR-167 gate; message "No reputation consent setting exists yet ... #45 #49 remain open")                                                                                                                                        |
| #46   | Technical-interview code execution sandbox and cross-tenant IDOR                         | Partially addressed, architectural limitation | Documented limitation   | `93dfe125` (PR #40); `48b5fd55`, `f9c2d0bb` (PR #43 simulated sandbox claims removed, 503); `a30fcaab` (PR #57)                                                                                                                                                                                   |
| #47   | Privacy policy, terms, contact verification, false compliance claims                     | Resolved in code, open in law                 | Gated (legal counsel)   | `ae99e31c` (PR #40); `731c2ef3`, `d0f21535`, `f9c2d0bb` (PR #43); `8a81a953`, `ab410a92` (PR #43); `43bb9258` (PR #57 FE-02)                                                                                                                                                                      |
| #48   | User data erasure semantics and scheduled deletion                                       | Partially addressed                           | Gated (30-day executor) | `1bb0f625` (PR #40); `15b44921`, `7bc608b8`, `de352710` (PR #43); `34e54020`, `6f88ef74` (PR #51); `a30fcaab` (PR #57)                                                                                                                                                                            |
| #49   | PostgreSQL durability versus about 220 ephemeral routes and the single-writer constraint | Partially addressed                           | Progressive migration   | `1bb0f625`; `1515beae`, `e49c43b1` (PR #43); `000013c3`, `f6612e46`, `34e54020` (PR #51); `735b30ea` (PR #53); `47a3f130`, `b30e7e42` (PR #54); `8864d2c8` (PR #55)                                                                                                                               |
| #50   | Payment gateway and billing integrity                                                    | Resolved in code, open in plan                | Gated (provider)        | `ae99e31c`, `1bb0f625` (PR #40); `48b5fd55` (PR #43); `8864d2c8` (PR #55)                                                                                                                                                                                                                         |

Numbering fact recorded there: pull requests and issues share one counter. PR #40 to #43 were merged in succession; numbers #44 to #50 were then allocated to the seven issues; later pull requests are #51 to #58. No pull request numbered #44 to #50 ever existed.

#### 2.3 Reported defect and verifying tests per issue (GIT_RECONCILIATION_REPORT numbering)

| Issue (that report's title) | Reported defect                                                                                                                                                                                                                                   | Verifying tests named                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| #44 transactional email     | Development logged verification codes to the console; in staging or production without a provider the platform accepted verification requests without sending mail, so candidates could not verify corporate domains or obtain reference upgrades | `production-config` unit; `work-history-graph` integration; e2e `core-loop`, `frontend-fixes` (FE-05)             |
| #45 reputation visibility   | Any authenticated caller could inspect any candidate's multi-dimensional reputation score and breakdown without consent (BR-167); recalculation open to non-admins; stealth candidates exposed in discovery                                       | `reputation-visibility`, `review-r2-regressions` (R2-2), `reputation-engine` integration; e2e `reputation-engine` |
| #46 interview sandbox       | Evaluation simulated in-process, claiming to run submitted code; cross-tenant IDOR let rival organizations link, score and move another company's application and expose private questions and hidden test cases                                  | `technical-interview` integration; `core-authz` ("interview assessments are scoped...")                           |
| #47 privacy and legal       | Fabricated claims ("SOC2 Type II Ready", "GDPR & CCPA Compliant", "DKIM Verified"), fictitious hashes, a fake phone number, a support address at an unowned domain; unreviewed boilerplate Terms and Privacy Policy                               | e2e `frontend-fixes` (FE-02), `core-loop`; `core-authz`                                                           |
| #48 erasure                 | Erasure left work history, references and applications in tables; requests and cancellations lived in volatile maps; no executor for the 30-day grace period; recruiter-versus-candidate retention semantics undefined                            | `tests/pg/core-persistence`, `notifications`, `messaging`, `work-history-removal`, `saved-jobs`                   |
| #49 durability              | Only the core loop persisted; about 220 routes kept state in maps; horizontal scaling unsafe without a single-writer lock                                                                                                                         | `tests/pg/core-persistence`, `concurrency`, `saved-searches`, `saved-jobs`                                        |
| #50 payments                | Checkout collected card numbers without submitting them anywhere and activated paid plans without payment; the webhook was unsigned and open to spoofed confirmations                                                                             | `billing` integration; `api-security`; `production-config`                                                        |

### 3. Release stages and sprints

#### 3.1 Stages A to F (RELEASE_SCOPE_AND_BACKLOG, 2026-10-22)

| Stage | Focus                                               | Backlog delivered                                                                                                | Exit criteria                                                                                                                            |
| ----- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A     | Production hardening and operational gates          | BL-001, 002, 003, 004, 005, 007, 008                                                                             | All tests green, `test:security` exits 0, lint exits 0, a live email received from staging                                               |
| B     | Core career loop GA launch (free early-access tier) | BL-006, 009, 010; deployment on the single-writer design with automated backup verification                      | End-to-end in production: candidate sign-up, corporate email attestation, referee voucher completion, job apply, recruiter pipeline move |
| C     | Progressive durability (long tail)                  | BL-011, 012, 013, 015; portfolio showcase (F-26) and admin console (F-17) durable                                | Ephemeral route count reduced from 217 to below 100; restart preserves challenge submissions, course progress, drafts                    |
| D     | Commercial monetization and enterprise tier         | BL-016; enterprise seat licensing and invoice generation; webhook deduplication keys persisted                   | A live-style card test succeeds in the provider's test mode, the webhook activates the Pro subscription, canceling updates entitlements  |
| E     | Sandboxed code execution and remote assessment      | BL-017; multi-language runner (Node.js, Python, TypeScript); technical-interview real-time room                  | Unprivileged execution of untrusted code passes an isolation audit; fork bombs and unauthorized network calls blocked                    |
| F     | Ecosystem, reputation and career graph              | BL-014; career trajectory visualizations; alumni networks, warm-introduction pathfinding, peer credibility views | Full 173-feature matrix with persistence and accessible UI views                                                                         |

Timeline column in that report (relative only): Stage A sprints 1-2, B 3-4, C 5-6, D 7-8, E 9-10, F 11 and later.

#### 3.2 Sprints S0 to S6 (FEATURE_PLAN_2026-10-21, no dates or velocity)

| Stage                      | Sprint | Goal                                                              | Backlog and urgency                                                     | Demonstrable increment                                                                                                      | Exit criteria                                                                                                                                               |
| -------------------------- | ------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A delivery safety          | S0     | Select beta or GA contract from an audited baseline               | X-00 P0; prepare X-08, X-09; X-03 decision                              | Reproducible baseline and release-specific acceptance catalogue                                                             | Exact SHA and build provenance; admitted stories Ready; unexecuted gates named; no readiness claim                                                          |
| B trust integrity          | S1     | Remove false results and unsafe claims while keeping flows        | X-05, X-06 P0; X-10 P1/P2 (split if capacity requires)                  | Honest challenge submission; recoverable worker queue with bounded claims; reliable verification checks                     | D-01 and D-02 regressions fail before the fix and pass after; PG fencing proof; affected browser verdict; no trust downgrade                                |
| B verification and privacy | S2     | Real proof and recovery slice                                     | X-08 then X-02; X-07 separate P0                                        | Candidate receives proof email, referee responds, persisted result survives restart; approved erasure demonstrably recovers | Live inbox, replay, expiry; PG restart and race; erasure failure drill; monitored failure; owner accepts trust semantics                                    |
| C restricted beta          | S3     | Close admitted application and recruiter gaps on the durable core | BL-F-04, 05, 06, 10, 14, 17, 24, 32, 94, 96, 162; X-01 per needed slice | Candidate applies with evidence; recruiter reviews and transitions; candidate sees outcome; account controls work           | Fresh-browser and restart journey; duplicate, retry, expired-session, tenant cases; moderation recovery; all beta inclusions accepted                       |
| D full career loop         | S4.n   | One learning, proof or career increment per sprint                | BL-F-07a then approved BL-F-08, 26, 84, 85, 91, 95, 106, 122, 145; P1   | First durable lesson progress, later portfolio and goal, gap, outcome progression                                           | Each slice survives restart, meets its story, has PG, browser and security evidence; no simulated proficiency                                               |
| E operational release      | S5     | Prove operation under failure                                     | X-09 P0; unresolved X-07 and X-08 block entry                           | Restore and roll back a working candidate and recruiter product; detect worker failure                                      | Exact-SHA CI/build/browser; hosted RLS; backup, restore, rollback; HTTPS; accessibility and manual gaps closed; load and boot data accepted; signed release |
| F expansion                | S6.n   | One standalone extension per sprint                               | Deferred BL-F packets (P2/P3)                                           | Individually admitted                                                                                                       | Same Definition of Done; pricing, AI and predictive decisions never inferred                                                                                |

Sprint risk, isolation and rollback contract (kept verbatim in substance): S0 documentation-only diff; S1 keep the old API contract until a coordinated consumer migration, stop a scored path if unsafe, rollback must not restore fake trust or unsafe worker scale, deferrals real sandbox and provider choices; S2 fail closed on mail outage, reversible migration rehearsal, erased data is not restored to users as an application rollback; S3 restrict incomplete preview modules by approved scope, additive migration with a tested rollback and restore; S4.n one module at a time preserving old data and contract until the replacement is verified; S5 tested image rollback with schema compatibility, restore procedure owned and timed, no claim beyond measured load; S6.n feature-specific rollback and retention plan.

#### 3.3 Dependency graph of the delivery packets (FEATURE_PLAN H)

```mermaid
flowchart TD
  A[X-00 exact baseline and owner scope] --> B[X-05 assessment integrity]
  A --> C[X-06 worker claims]
  A --> D[X-08 architecture and migration rehearsal]
  A --> E[X-07 privacy policy and recovery]
  A --> F[X-03 commercial decision]
  C --> G[X-02 real verification delivery]
  D --> G
  D --> H[X-01 one durable journey]
  E --> I[Candidate and recruiter beta acceptance]
  G --> I
  H --> I
  B --> J[Learning and evidence GA increment]
  H --> J
  I --> K[X-09 release drills and go/no-go]
  F --> K
  J --> L[Full-loop GA acceptance]
  K --> L
  A --> M[X-10 verification reliability]
  M --> I
```

The graph shows delivery dependencies, not new canonical feature dependencies. Legal, provider and architecture decisions can progress independently; worker and assessment fixes are independent code paths but need the same exact-source baseline; staging preparation can proceed while features develop, but final release acceptance cannot precede privacy, proof delivery and recovery evidence. Do not make all features depend on a blanket "migrate everything" rewrite. Registry dependency cycles need interpretation, not automatic topological sorting.

#### 3.4 Dependency-ordered action plan (REPOSITORY_AUDIT M, 2026-10-23)

| Order | Priority | Workstream                            | Observable acceptance                                                                                                                                                                    |
| ----- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | P0       | CI (R2-01)                            | Pull-request CI completes with 236 of 236 browser cases; a revoked external session is still redirected with the exact banner and the active session retained                            |
| 1     | P0       | Schema (#46)                          | Approved identity model, migration adaptation, clean and populated disposable rehearsal, two-user and two-tenant RLS and grant checks; no direct hosted migration before signed approval |
| 2     | P0       | Operations (#47)                      | After #46: app boot, single-writer lock, worker liveness and queue-backlog alarm, fresh encrypted off-host restore, rollback and smoke                                                   |
| 3     | P0       | Communication (#44)                   | Verified sender, real-mailbox code and reference sends, expiry and replay negatives, bounces and retry alerts, secrets absent from logs                                                  |
| 4     | P0       | Privacy (#45, R2-05)                  | Legal, retention and contact approval, due-erasure scheduler, restart recovery, payment-provider disabled and enabled erasure consistency and staging tests                              |
| 5     | P1       | Monetization (#50; R2-03, 04, 06, 09) | Decide launch mode; test-mode provider endpoint and signed delivery; complete refund and ordering policy; entitlement read model; honest UI; then any live-mode readiness                |
| 6     | P1       | Core product (#48)                    | Prioritize drafts, network, alerts by accepted beta scope; each vertical slice API, database, authorization, UI, restart, tenant and browser tests                                       |
| 7     | P1       | Trust (#49) and worker (R2-07)        | Code executor sandbox or fail closed, policy provenance, safe worker lease fencing and replay proof                                                                                      |
| 8     | P2       | Documentation (R2-08)                 | Mark stale snapshots clearly; link the current report in the docs index; refresh the feature ledger after acceptance, not before                                                         |

Sprint increments suggested there (capacity unknown; sequencing only): A CI plus observability baseline (no new feature); B hosted schema proof on a disposable target; C one staging candidate, reference and job-application journey; D privacy plus mail and erasure proof; E optional paid vertical slice only after commercial approval; F durable beta micro-features and technical-interview security. A sprint with red CI does not complete or unlock the next.

#### 3.5 Release readiness statements from the E2E audit (2026-10-21)

Not ready for public release because: the stored-XSS link fix was uncommitted and the shared dev API stale; weak passwords were accepted and maintenance mode was inert (both needed decisions); only the memory-backed path and Chromium were browser-tested. The core career loop (sign up, profile, work history, apply, review, notifications, messaging, networking) behaved correctly under normal and abnormal input and authorization held in every case tried. The shared dev API on port 4000 was stale (it returned 404 for `GET /api/v1/auth/session`) and needed a restart from the current build; two persistence changes made in that session (admin audit log, feature flags) were not live there.

### 4. Deployment readiness table (REPOSITORY_AUDIT L, 2026-10-23)

| Gate                                               | Observed state                                              | Verdict               |
| -------------------------------------------------- | ----------------------------------------------------------- | --------------------- |
| Latest upstream full CI                            | Failed 1 of 236 browser tests; the two preceding runs green | RED                   |
| 52 local database migrations and 50 database tests | Successful in CI                                            | GREEN (local CI only) |
| Managed Supabase target schema                     | No application tables                                       | BLOCKED               |
| Hosted RLS authorization and grants                | Cannot test real application objects                        | BLOCKED               |
| Stripe SDK, signed webhook, durable storage        | Code present; mocked network tests and local PG green       | PARTIAL               |
| Stripe test-account webhook delivery               | 0 webhook endpoints configured                              | BLOCKED               |
| Live-mode payments                                 | Not accessed; no mutation performed                         | NOT VERIFIED          |
| Legal, email, privacy, backups, worker, load, TLS  | Acceptance evidence missing                                 | BLOCKED               |
| App-wide 173-feature production verification       | Only a historical provisional inventory                     | NOT VERIFIED          |

Rule recorded there: do not enable `BILLING_MODE=stripe` for public users, deploy application migrations to the current Supabase project, or describe the product as production-ready before the relevant owner-approved gates and environment checks pass.

### 5. Payment-provider live-verification gates (Stripe)

#### 5.1 Capability matrix (REPOSITORY_AUDIT F)

| Capability                         | Evidence in the earlier attempt                                                                                                                        | Remaining gate                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Server-side catalog and access     | Price catalogue, Checkout input schema and route registration enforce server-side prices and plan role; routes require a session                       | Commercial price and entitlement policy approved                                                                |
| Checkout                           | Route `/api/v1/billing/checkout` creating a Checkout Session with idempotency including user, plan, cycle and a client reference                       | Network was mocked in tests; the page still said no processor existed and showed no purchase UI                 |
| Source of truth                    | Paid access only from a signed, known-price, eligible subscription; unknown prices grant free entitlements                                             | Verify every user-facing gate reads entitlements, never plan tier alone                                         |
| Webhooks                           | Raw-body signature verification with the endpoint secret; normalized checkout, subscription, invoice events                                            | Synthetic payloads only; 0 configured endpoints, remote delivery unproven                                       |
| Idempotency and ordering           | `billing_events(provider, provider_event_id)` unique, transactional write, freshness guard, concurrency tests                                          | Event time is in seconds: test equal-second conflicting order; asynchronous side effects; no remote retry drill |
| Subscriptions and cancel           | Gateway call plus domain reconcile; scheduled and immediate cancel; persisted                                                                          | Live cancel, portal behavior, downgrade at renewal, subscription replace and retries unverified                 |
| Invoices                           | `invoice.paid` and `invoice.payment_failed`; provider invoice id uniqueness                                                                            | Live invoice mapping, credit notes, refunds unverified                                                          |
| Refunds and disputes               | `charge.refunded` later handled (see 5.3); dispute and void not handled                                                                                | Decide dispute and void behavior                                                                                |
| Erase                              | Customer deletion before local purge in enabled mode                                                                                                   | Provider disabled with an existing customer logs a warning and purges the local mapping only (R2-05)            |
| Connected test account (read-only) | account `talentsphere-production` in **test mode only**; 1 active USD 2.99 per month recurring price; 2 active test subscriptions; 0 webhook endpoints | Not a production payment test; nothing was charged, refunded, canceled, created or edited                       |

#### 5.2 Manual provider configuration (not code), from STRIPE_SUPABASE_AUDIT

Create the six `STRIPE_PRICE_*` prices; create a webhook endpoint at `/api/v1/billing/stripe-webhook` for `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`; configure the Customer Portal; keep `BILLING_MODE=disabled` until done. Apply migration 00053 (privilege revoke only) after review. The pre-integration payment audit's earlier deliverables (domain error code `PAYMENT_REQUIRED` mapped to HTTP 402; `allowSimulatedPayment` default false; `settleSubscription`) are acceptance ideas, not target facts.

#### 5.3 Open and decided payment items

- Decided 2026-10-23 (owner): a full refund of the charge that paid for the current period ends paid access; the provider subscription is canceled immediately before the event is recorded so a provider failure makes the provider retry; a replay is recorded once; a partial refund or a refund of an older charge changes nothing.
- Open: O-1 concurrent paid Checkout sessions; O-2 dispute created and void; O-3 outbox for the post-commit dispatch; O-4 framework advisory (fix needs a protected manifest edit in that repository); O-5 webhook shares the global rate limit (300 per minute per address default); R2-09 same-second ordering; R2-06 refund and dispute strategy; R2-04 UI truthfulness.

### 6. Managed-database (Supabase) gate facts

- Observed 2026-10-23 (read-only): project `talentsphere-production` (id `qidckctwrkxyiwworchd`), region `ap-south-1` (Mumbai), healthy, PostgreSQL 17; public tables none; migration ledger one entry (`add_readonly_keepalive_ping`); Edge Functions none; security and performance advisors returned no notices, which cannot certify application access control because no application schema exists.
- The 52 local migrations apply cleanly and idempotently to a disposable PostgreSQL 16 in CI; that is no evidence for the hosted PostgreSQL 17 target.
- Constraint: the earlier app signed its own HMAC sessions; a browser token is not a platform auth identity. Migrations 00016, 00018, 00022, 00023 hold foreign keys to `auth.users(id)` while the app kept users in `public.users`, so inserts would be rejected and the Data API could expose tables.
- Local evidence that did exist: two-user owner isolation for messages and notifications; `stripe_customers` declared RLS and `REVOKE ALL ... FROM PUBLIC` (then found insufficient for client roles; 00053 revokes from `anon` and `authenticated`); superuser execution in CI must not be mistaken for Data API protection.

### 7. Pull-request and commit lineage

#### 7.1 Spine PR #40 to PR #58 (GIT_RECONCILIATION_REPORT; all merged into HEAD `83dc7d247efbd3b3c3312bef74ac49978d33e924`)

Repository history to that head: 302 commits from the initial commit `e93d2514` (2026-09-19); head subject "update" (2026-10-20, Graphify artifacts). Local branches `main`, `repository_audit_roadmap`, `universal_project_clean_reinstall` and remote `origin/main`, `origin/HEAD` all pointed at the head; zero unmerged, dangling or orphaned branches. Other branches merged earlier: `improvement/core-loop-durability` (tip `b5d40da1`, merged by PR #40); `install_ralph_loop_extension` (tip `dc0d8ef0`, merged PR #37); `implementation-completion-tracker-57547` (PR #16, `73632855`); `next-priority-implementation-ff90f` (PR #28, `49beef19`, user blocking NET-005); `security/five-lock-smoke-hardening-20261018` (PR #41); `security/rls-runtime-validation-ci-fix-20261018` (PR #42).

| PR  | Merge commit | Date       | Branch                                            | Delivered                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------ | ---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #40 | `4004457d`   | 2026-10-14 | `improvement/core-loop-durability`                | Durable core loop (ADR-015); proof-of-control verification (6-digit email challenge, single-use referee token as SHA-256); dynamic React candidate, recruiter and referee flows replacing the hard-coded mock; global rate-limit lockout fix (300 per minute per account, health exempt); password change with multi-device revocation, explicit sign-out, role removal; strict type-check of the test suites                                                                                                                                                                                                                                                                                                               |
| #41 | `8bdad381`   | 2026-10-18 | `security/five-lock-smoke-hardening-20261018`     | RLS policies for messaging threads, messages, notification preferences; static regression checks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| #42 | `5c130a7e`   | 2026-10-18 | `security/rls-runtime-validation-ci-fix-20261018` | Correlated RLS column-shadowing fix; runtime two-account RLS validation on real PostgreSQL; SQL apostrophe-escape test; CI sentinel scanning the production web bundle for server secrets                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| #43 | `d8dd0567`   | 2026-10-18 | `chatgpt/production-safety-gates-20261018`        | Single-writer advisory lock lease `pg_try_advisory_lock(718201, 1)`; worker heartbeat; fail-closed transactional email (503); durable erasure request store with restart test; inline JSON export; rejection of unverified legal mailboxes; removal of simulated execution claims                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| #51 | `4890ef21`   | 2026-10-18 | `chatgpt/privacy-mail-hardening-20261018`         | AES-256-GCM encryption of BYO AI keys with a separate 64-hex key (plaintext downgrade refused); opt-in Resend adapter with idempotent retries; durable settings and export metadata                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| #52 | `616f942d`   | 2026-10-18 | `chatgpt/release-preflight-20261018`              | Read-only release preflight for migration drift; strict sequential numbering                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| #53 | `eb69a2f8`   | 2026-10-18 | `chatgpt/durable-saved-searches-20261018`         | Owner-scoped SQL saved searches with restart and isolation tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| #54 | `1776f948`   | 2026-10-18 | `chatgpt/durable-job-bookmarks-20261018`          | SQL saved jobs; unpublished or draft jobs refused; erasure purge; race, ownership, restart tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| #55 | `8864d2c8`   | 2026-10-18 | `chatgpt/oracle-staging-readiness`                | ARM64 staging compose, private network topology (db and api no host ports; edge proxy only on 80 and 443), outbound mail permitted, hardened `.dockerignore`, CI compose validation workflow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| #56 | `252b03f9`   | 2026-10-18 | `chatgpt/oracle-staging-recovery`                 | Backup and isolated restore verification script; dump files ignored by version control                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| #57 | `9156b1a8`   | 2026-10-20 | `claude/issues-44-50-fixes`                       | Stage 1 `a30fcaab` (evidence relationships and dispute handling, work-history visibility and referee contact redaction, admin-only recomputation, k floors, recruiter profiling limited to active applicants or visible public profiles, stealth hidden, institution-scoped admin seats, certificate revocation limited to instructor or admin, two-step bans with lapsing proposals, moderation appeals with reporter anonymity, challenge evidence stored once, self-verification blocked, self-reported skills 0 trust points, interview questions scoped to organization); Stage 2 `43bb9258` (FE-02, FE-03, FE-04, FE-05, FE-06, FE-07, FE-11, sign-in double-click guard, ten ported security and frontend e2e specs) |
| #58 | `61eae132`   | 2026-10-20 | `claude/audit-f01-f04-r2`                         | BR-167 reputation visibility; deployed PBKDF2 iteration floor of 210,000; regressions R2-2 (stealth hidden from segmentation), R2-3 (`/reports/my` reveals only resolved decisions, reporter id and moderator notes redacted), R2-7 (expired ban proposal cannot be confirmed after 24 hours), R2-8 (resubmitting a passed challenge returns existing evidence)                                                                                                                                                                                                                                                                                                                                                             |

Chronological order recorded: `32a3abc7` (validation report corrected to measured reality), then PR #40, an "update" commit refreshing intents, #41, #42, #43, [issue numbers #44-#50 allocated], #51, #52, #53, #54, #55, #56, #57, #58, head `83dc7d24`. Commits named in the improvement program: `1bb0f625` (API: durable core loop, proof-based verification, authorization), `ae99e31c` (web: real journeys, honest pricing and copy), `93dfe125` (adversarial review fixes), `346e1f8a` (messaging API), `81ea894a` (dead-code removal), baseline `32a3abc7` and earlier measured head `aad8b54d` (2026-10-08: Vitest 976, Playwright 183), `8db0930` (2026-10-03 production audit), `a30b35bf` and `a771a87b` (2026-10-21 audit initial and final heads), `0f40b6c9` (2026-10-23 upstream main), `fca16f51` (fix for two Playwright 5xx assertion failures), `deaea7665` and `4d3cf5d4` (earlier green runs).

#### 7.2 PRs #61 to #71 (REPOSITORY_AUDIT C, 2026-10-23)

| PRs        | Delivered                                                                                                                                    | Evidence level recorded                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| #61 to #66 | Hosted-target guard, preflight, migration-incompatibility scanners, CI gate that expects exit code 1 for the known auth dependency           | Fail-closed warning works in CI; not a hosted-compatible schema                                                        |
| #67 to #69 | Refuse unpaid entitlements; lint remediation                                                                                                 | CI-verified guard and formatting; monetization still blocked                                                           |
| #70        | Simulated billing lifecycle, idempotency and erasure                                                                                         | Tested code; simulated billing stays disabled outside development and test                                             |
| #71        | Stripe SDK gateway, signed webhook, durable Postgres records, idempotent provider-event storage, cancellation, domain tests, migration 00052 | Integration and local PG verified; 50 PG cases pass in CI; zero webhook endpoints; paid production launch not verified |

Earlier merged pull requests PR #41, #42 (RLS and ownership), #43 and #58 (fail-closed assessment, reputation visibility, PBKDF2 floor), #51, #53, #54 (durable privacy metadata, saved searches, bookmarks), #55, #56 (deployment and recovery artifacts) were cross-checked in that report: locally verified only; hosted target had no tables; deployment artifacts implemented, not operationally verified. PR objects fetched on 2026-10-21 showed #43 and #51 to #58 merged even where their old body text said draft or unmerged: do not use stale PR prose as merge state. No open pull request existed in either baseline query.

### 8. Verdict and score timeline (for calibration)

| Date          | Source                                                 | Verdict                                                                                                                                                                                                    | Key evidence                                                                                        |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 2026-10-03    | PRODUCTION_AUDIT revisions A to D at `8db0930`         | NOT READY, 4.6 of 10                                                                                                                                                                                       | Demo login, fake checkout, in-memory state, unsigned webhook, log-only worker, red CI at type-check |
| 2026-10-10/14 | IMPROVEMENT_PROGRAM                                    | Not production-ready; ready for a closed, developer-run demonstration of the core loop; real-user beta gated on the P0 list (email, ratification, architecture decision, legal); public launch gated on P1 | Vitest 1072, PG 23, Playwright 205, 46 migrations                                                   |
| 2026-10-21    | FEATURE_STATUS, E2E_AUDIT                              | Not ready for public beta or GA; restricted trusted-career beta recommended after P0 fixes                                                                                                                 | Vitest 1172 in 115 files; 6 impl-unverified, 87 partial, 1 broken, 75 not implemented, 4 excluded   |
| 2026-10-22    | AUDIT_MASTER_REPORT                                    | Gated; recommended GA scope the core career loop; four external gates (transactional email, commercial billing, legal review, scheduled erasure policy)                                                    | 1143 tests in 112 files at `83dc7d24`                                                               |
| 2026-10-23    | PAYMENT_AUDIT, STRIPE_SUPABASE_AUDIT, REPOSITORY_AUDIT | NOT READY for production or a paid public launch                                                                                                                                                           | CI 1231 Vitest, 50 PG, 235 of 236 browser; 0 issue closures                                         |

### 9. Immediate execution list and documentation-authority rules recorded on 2026-10-21 (FEATURE_PLAN L and K)

Immediate execution and decisions as written: (1) review D-01, D-02, D-03 and the proposed beta subset; keep code unchanged until each fix has a bounded reviewed contract; the audit grants no new architecture or pricing authority. (2) X-00: reconcile admitted feature contracts and the 248-rule ownership and acceptance gaps; confirm which source is the execution baseline; attach CI, PG and browser evidence in a permitted environment; explicitly authorize any protected paths before an emitting build. (3) X-05 and X-06 can start independent design and reproduction now; X-10 scanner repair is independent; do not rebuild the existing mail adapter or persistence stores. (4) Ask the owner for: email sender and provider approval, retention/deletion/legal contacts, persistence ratification and target snapshot, trust/session/executor decisions, free-only versus paid choice; "no elapsed time or unanswered question constitutes approval". (5) Once prerequisites exist, complete live proof and erasure recovery, then one admitted durable UI journey. (6) Run operational release drills before public exposure; expansion stays unscheduled until capacity and value are known.

Documentation-authority rules from the same report: the status record is the current baseline and keeps earlier assessments as history; the plan record separates priorities and keeps historical requirements as inputs; the evidence ledger supports the two records and is not a source of product authority; the memory file appends current results with a moving-head caveat and does not erase earlier learning or promote old counts; architecture documents add factual errata without changing decisions; the SSOT header drops stale implementation counts but policy and approval status are not rewritten by an audit; owner approval is required for scope, architecture and semantics, and portfolio ids are preserved. Template exports for system-design and business-review documents were blocked then (no compatible rendering capability) and were not approximated.

### 10. Improvement-program decisions and their reversibility (2026-10-14, section D)

| Decision                                                                                                                         | Reversible                 | Where recorded                        | Needed owner ratification                      |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------- | ---------------------------------------------- |
| Persist the core loop to the database; maps become a boot-hydrated read model; single API writer                                 | Yes (exit path documented) | persistence ADR                       | Yes, includes the schema change                |
| Optimistic concurrency on core records (`CoreOp.base`, in-flight set, database re-check)                                         | Yes                        | ADR decision 5                        | No                                             |
| Verification requires proof of control (email code, referee token); secrets stored only as SHA-256 (later: keyed hash for codes) | Yes                        | security notes                        | No                                             |
| No payment processor means paid plans cannot be bought (`BILLING_MODE=disabled` default); `simulated` for demos and tests only   | Yes                        | environment example, operations notes | Yes (pricing and entitlement)                  |
| Webhook signing scheme was the product's own Stripe-style `t=...,v1=...` until a provider is chosen                              | Yes                        | security notes                        | Replace with the provider's scheme when chosen |
| State what is not durable instead of hiding it (response header)                                                                 | Yes                        | durability module                     | No                                             |
| Log refused requests (4xx) at info, faults (5xx) at error                                                                        | Yes                        | error handler                         | No                                             |

<!-- ledger-D D-12 -->

### Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/FEATURE_PLAN_2026-10-21.md (gap closure D-12)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: row-level corrections to retired documents (section K, lines 137-162 including line 154) and the blocked template-export note (line 150); per-packet candidate-test-file counts below.

```text
L137: ## K. Documentation reconciliation and authority
L138:
L139: | Artifact | Correction made or required | Authority / history handling |
L140: |---|---|---|
L141: | FEATURE_STATUS_2026-10-21.md | Current baseline, corrected maturity, 173-row matrix, traces, discrepancies, defect/decision register | Earlier static assessment retained verbatim as history |
L142: | FEATURE_PLAN_2026-10-21.md | Separate priorities, scoped persistence, provider reuse, backlog/sprints/gates | Historical feature requirements retained as inputs; unsafe acceptance superseded |
L143: | AUDIT_EVIDENCE_2026-10-21.json | Source hashes, all feature/rule/journey references, routes/migrations, test results, remote state | Supporting evidence for these two existing records; not a new source of product authority |
L144: | docs/INDEX.md; governance/IMPLEMENTATION_PLAN.md | Point to current audit and release sequence | Preserve canonical long-term phases |
L145: | BRAIN/MEMORY.md | Append current measured results and moving-HEAD caveat | Do not erase earlier learning or promote old counts |
L146: | Root ARCHITECTURE.md | Add current factual erratum for Resend, SQL stores, writer lease/heartbeat | Historical sections remain; no architectural decision changed |
L147: | SSOT / feature registry / ADR-015 | Remove stale implementation counts from SSOT header; do not rewrite policy or approval status | Owner must approve scope/architecture/semantics; portfolio IDs preserved |
L148: | APP_FLOW / testing / operations / security | Correct routes, current test scope, mail/worker/privacy claims and target-versus-runtime boundaries | Policies unchanged; historical results distinguished from current evidence |
L149:
L150: System Design and Business Review template exports are **blocked**: the requested skills require compatible reference-preserving document/presentation creation and rendering. No connected document session or compatible slide-rendering capability was available. Their reference DOCX/PPTX files were not modified or approximated with generic exports. Markdown audit content is complete to the stated inspection boundary; template artifacts are not delivered.
L151:
L152: ### Subsequent document reconciliation
L153:
L154: Current README, architecture, operations, security, testing, API/database contracts,
L155: journey/rule pointers and conflict register now use the current evidence boundary.
L156: Earlier reports retain their recorded results with historical labels. The maintenance
L157: manual/report/plan now flag their two absent script deliverables; no script was
L158: restored. All tracked Markdown files have an explicit disposition in the evidence
L159: ledger. Protected `deploy/**` documentation remains read-only under AGENTS.md.
L160: Local file links were checked; this does not prove semantic completeness or runtime
L161: acceptance. X-00 retains feature/rule reconciliation, and X-09 retains live gates.
L162:
```

<!-- ledger-D D-12-packets -->

### Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/FEATURE_PLAN_2026-10-21.md (per-packet candidate tests and release text, gap closure D-12)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: per-packet candidate-test-file counts and the per-row sprint/release text for the 169 BL-F work packets. Format of each line: `packet | feature ids | tests cell | release cell`.

```text
L180: BL-F-01 | F-01 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L181: BL-F-02 | F-02 | tests: 1 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L182: BL-F-03 | F-03 | tests: 1 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L183: BL-F-04 | F-04 | tests: 8 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L184: BL-F-05 | F-05 | tests: 6 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L185: BL-F-06 | F-06 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L186: BL-F-07 | F-07 | tests: 5 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L187: BL-F-08 | F-08 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L188: BL-F-09 | F-09 | tests: 8 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L189: BL-F-10 | F-10 | tests: 7 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L190: BL-F-11 | F-11 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L191: BL-F-12 | F-12 | tests: 6 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L192: BL-F-13 | F-13 | tests: 5 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L193: BL-F-14 | F-14 | tests: 5 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L194: BL-F-15 | F-15 | tests: 7 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L195: BL-F-16 | F-16 | tests: 5 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L196: BL-F-17 | F-17 | tests: 5 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L197: BL-F-18 | F-18 | tests: 1 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L198: BL-F-19 | F-19 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L199: BL-F-20 | F-20 | tests: 5 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L200: BL-F-21 | F-21 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L201: BL-F-22 | F-22 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L202: BL-F-23 | F-23 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L203: BL-F-24 | F-24 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L204: BL-F-25 | F-25 | tests: 6 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L205: BL-F-26 | F-26 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L206: BL-F-27 | F-27 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L207: BL-F-28 | F-28 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L208: BL-F-29 | F-29 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L209: BL-F-30 | F-30 | tests: 1 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L210: BL-F-31 | F-31 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L211: BL-F-32 | F-32 | tests: 7 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L212: BL-F-33 | F-33 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L213: BL-F-34 | F-34 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L214: BL-F-35 | F-35 | tests: 6 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L215: BL-F-36 | F-36 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L216: BL-F-37 | F-37 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L217: BL-F-40 | F-40 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L218: BL-F-41 | F-41 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L219: BL-F-42 | F-42 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L220: BL-F-43 | F-43 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L221: BL-F-44 | F-44 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L222: BL-F-45 | F-45 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L223: BL-F-46 | F-46 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L224: BL-F-47 | F-47 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L225: BL-F-48 | F-48 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L226: BL-F-49 | F-49 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L227: BL-F-50 | F-50 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L228: BL-F-51 | F-51 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L229: BL-F-52 | F-52 | tests: 6 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L230: BL-F-53 | F-53 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L231: BL-F-54 | F-54 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L232: BL-F-55 | F-55 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L233: BL-F-56 | F-56 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L234: BL-F-57 | F-57 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L235: BL-F-58 | F-58 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L236: BL-F-59 | F-59 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L237: BL-F-60 | F-60 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L238: BL-F-61 | F-61 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L239: BL-F-64 | F-64 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L240: BL-F-65 | F-65 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L241: BL-F-66 | F-66 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L242: BL-F-67 | F-67 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L243: BL-F-68 | F-68 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L244: BL-F-69 | F-69 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L245: BL-F-70 | F-70 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L246: BL-F-71 | F-71 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L247: BL-F-72 | F-72 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L248: BL-F-73 | F-73 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L249: BL-F-74 | F-74 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L250: BL-F-75 | F-75 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L251: BL-F-76 | F-76 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L252: BL-F-77 | F-77 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L253: BL-F-78 | F-78 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L254: BL-F-79 | F-79 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L255: BL-F-80 | F-80 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L256: BL-F-81 | F-81 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L257: BL-F-82 | F-82 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L258: BL-F-83 | F-83 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L259: BL-F-84 | F-84 | tests: 14 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L260: BL-F-85 | F-85 | tests: 7 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L261: BL-F-86 | F-86 | tests: 6 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L262: BL-F-87 | F-87 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L263: BL-F-88 | F-88 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L264: BL-F-89 | F-89 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L265: BL-F-90 | F-90 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L266: BL-F-91 | F-91 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L267: BL-F-92 | F-92 | tests: 6 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L268: BL-F-93 | F-93 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L269: BL-F-94 | F-94 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L270: BL-F-95 | F-95 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L271: BL-F-96 | F-96 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L272: BL-F-97 | F-97 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L273: BL-F-98 | F-98 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L274: BL-F-99 | F-99 | tests: 2 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L275: BL-F-100 | F-100 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L276: BL-F-101 | F-101 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L277: BL-F-102 | F-102 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L278: BL-F-103 | F-103 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L279: BL-F-104 | F-104 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L280: BL-F-105 | F-105 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L281: BL-F-106 | F-106 | tests: 1 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L282: BL-F-107 | F-107 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L283: BL-F-108 | F-108 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L284: BL-F-109 | F-109 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L285: BL-F-110 | F-110 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L286: BL-F-111 | F-111 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L287: BL-F-112 | F-112 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L288: BL-F-113 | F-113 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L289: BL-F-114 | F-114 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L290: BL-F-115 | F-115 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L291: BL-F-116 | F-116 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L292: BL-F-117 | F-117 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L293: BL-F-118 | F-118 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L294: BL-F-119 | F-119 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L295: BL-F-120 | F-120 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L296: BL-F-121 | F-121 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L297: BL-F-122 | F-122 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L298: BL-F-123 | F-123 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L299: BL-F-124 | F-124 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L300: BL-F-125 | F-125 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L301: BL-F-126 | F-126 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L302: BL-F-127 | F-127 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L303: BL-F-128 | F-128 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L304: BL-F-129 | F-129 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L305: BL-F-130 | F-130 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L306: BL-F-131 | F-131 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L307: BL-F-132 | F-132 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L308: BL-F-133 | F-133 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L309: BL-F-134 | F-134 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L310: BL-F-135 | F-135 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L311: BL-F-136 | F-136 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L312: BL-F-137 | F-137 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L313: BL-F-138 | F-138 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L314: BL-F-139 | F-139 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L315: BL-F-140 | F-140 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L316: BL-F-141 | F-141 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L317: BL-F-142 | F-142 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L318: BL-F-143 | F-143 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L319: BL-F-144 | F-144 | tests: 12 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L320: BL-F-145 | F-145 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed GA; not a sprint commitment
L321: BL-F-146 | F-146 | tests: 7 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L322: BL-F-147 | F-147 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L323: BL-F-148 | F-148 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L324: BL-F-149 | F-149 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L325: BL-F-150 | F-150 | tests: 7 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L326: BL-F-151 | F-151 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L327: BL-F-152 | F-152 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L328: BL-F-153 | F-153 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L329: BL-F-154 | F-154 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L330: BL-F-155 | F-155 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L331: BL-F-156 | F-156 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L332: BL-F-157 | F-157 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L333: BL-F-158 | F-158 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L334: BL-F-159 | F-159 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L335: BL-F-160 | F-160 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L336: BL-F-161 | F-161 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L337: BL-F-162 | F-162 | tests: 4 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Proposed beta; not a sprint commitment
L338: BL-F-163 | F-163 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L339: BL-F-164 | F-164 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L340: BL-F-165 | F-165 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L341: BL-F-166 | F-166 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L342: BL-F-167 | F-167 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L343: BL-F-168 | F-168 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Decision gate; not a sprint commitment
L344: BL-F-169 | F-169 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L345: BL-F-170 | F-170 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L346: BL-F-171 | F-171 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L347: BL-F-172 | F-172 | tests: 3 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
L348: BL-F-173 | F-173 | tests: 0 candidate test files; add full acceptance, authorization, PG restart and browser checks as applicable | release: Expansion; unscheduled; not a sprint commitment
```

<!-- ledger-D D-15 -->

### Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/GIT_RECONCILIATION_REPORT.md (gap closure D-15)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: 5 commit hashes (2f88ff86, 9f8ad4df, b0036b84, e8290345, e0882707), the ~35-row branch table with tip hash, subject and merged-by cells (lines 22-41), `Merge pull request #37 from yhsomani/vibe-coding`, key-file cells per PR (reconciliation matrix, lines 394-end) and `MIN_DEPLOYED_PBKDF2_ITERATIONS` (line 241).

````text
L7: **Repository:** `https://github.com/yhsomani/talentsphere-complete.git`
[...]
L20: - **Working Tree Cleanliness:** Clean working tree with no uncommitted staged or unstaged modifications; only teamwork metadata directory `.agents/` is present.
L21:
L22: ### 1.2 Comprehensive Branch Topology & Ancestry Analysis
L23: A complete graph analysis of all local and remote branches in the repository was conducted using `git merge-base --is-ancestor`:
L24:
L25: | Branch Reference | Tip Commit | Tip Subject | Direct Ancestor of HEAD `83dc7d24`? | Status & Merge Details |
L26: | :--- | :---: | :--- | :---: | :--- |
L27: | `refs/heads/main` | `83dc7d24` | `update` | **YES** (Identical) | Primary repository line |
L28: | `refs/heads/repository_audit_roadmap` | `83dc7d24` | `update` | **YES** (Identical) | Active audit worktree branch |
L29: | `refs/heads/universal_project_clean_reinstall` | `83dc7d24` | `update` | **YES** (Identical) | Synchronized worktree branch |
L30: | `refs/heads/improvement/core-loop-durability` | `b5d40da1` | `feat(web): messaging between a hiring team and applicants` | **YES** | Pre-merge commit on branch merged in PR #40 (`4004457d`) |
L31: | `refs/heads/install_ralph_loop_extension` | `dc0d8ef0` | `Merge pull request #37 from yhsomani/vibe-coding-security-fixes-50685` | **YES** | Merged historical feature branch |
L32: | `refs/remotes/origin/main` | `83dc7d24` | `update` | **YES** (Identical) | Remote upstream tracking branch |
L33: | `refs/remotes/origin/HEAD` | `83dc7d24` | `update` | **YES** (Identical) | Remote default branch |
L34: | `refs/remotes/origin/improvement/core-loop-durability` | `b5d40da1` | `feat(web): messaging between a hiring team and applicants` | **YES** | Fully merged into HEAD via PR #40 |
L35: | `refs/remotes/origin/implementation-completion-tracker-57547` | `e8290345` | `Title: Next.js core functionality and routing improvements` | **YES** | Fully merged into HEAD via PR #16 (`73632855`) |
L36: | `refs/remotes/origin/next-priority-implementation-ff90f` | `9f8ad4df` | `**Implement User Blocking Mechanism (NET-005)**` | **YES** | Fully merged into HEAD via PR #28 (`49beef19`) |
L37: | `refs/remotes/origin/security/five-lock-smoke-hardening-20261018` | `2f88ff86` | `test(security): add static regression checks for private data RLS` | **YES** | Fully merged into HEAD via PR #41 (`8bdad381`) |
L38: | `refs/remotes/origin/security/rls-runtime-validation-ci-fix-20261018` | `b0036b84` | `test(security): prevent correlated RLS column shadowing regression` | **YES** | Fully merged into HEAD via PR #42 (`5c130a7e`) |
L39:
L40: **Core Finding:** There are **zero unmerged, dangling, or orphaned branches** in the entire Git repository. Every branch ever published to `origin` is a direct mathematical ancestor of HEAD `83dc7d24`.
L41:
L42: ### 1.3 Chronological Merge Lineage from PR #40 to HEAD `83dc7d24`
L43:
L44: ```text
L45: (32a3abc7 docs: correct FINAL_VALIDATION_REPORT to measured reality)
L46:   │
L47:   ├─► [PR #40] 4004457d Merge pull request #40 from yhsomani/improvement/core-loop-durability
L48:   │     (ADR-015, durable core loop, honest UI, Reticle fixes)
L49:   │
L50:   ├─► e0882707 update (Reticle intents refresh)
L51:   │
L52:   ├─► [PR #41] 8bdad381 Merge pull request #41 from yhsomani/security/five-lock-smoke-hardening-20261018
[...]
L104: - **Source Branch:** `yhsomani/improvement/core-loop-durability`
[...]
L117: - **Source Branch:** `yhsomani/security/five-lock-smoke-hardening-20261018`
[...]
L126: - **Source Branch:** `yhsomani/security/rls-runtime-validation-ci-fix-20261018`
[...]
L137: - **Source Branch:** `yhsomani/chatgpt/production-safety-gates-20261018`
[...]
L150: - **Source Branch:** `yhsomani/chatgpt/privacy-mail-hardening-20261018`
[...]
L153:   2. Opt-in Resend transactional email adapter (`apps/worker/src/email-adapter.ts`) with idempotent retries.
[...]
L161: - **Source Branch:** `yhsomani/chatgpt/release-preflight-20261018`
[...]
L170: - **Source Branch:** `yhsomani/chatgpt/durable-saved-searches-20261018`
[...]
L180: - **Source Branch:** `yhsomani/chatgpt/durable-job-bookmarks-20261018`
[...]
L191: - **Source Branch:** `yhsomani/chatgpt/oracle-staging-readiness`
[...]
L203: - **Source Branch:** `yhsomani/chatgpt/oracle-staging-recovery`
[...]
L205:   1. Operational backup and isolated restore verification script (`deploy/oracle/verify-backup-restore.sh`).
[...]
L213: - **Source Branch:** `yhsomani/claude/issues-44-50-fixes`
[...]
L238: - **Source Branch:** `yhsomani/claude/audit-f01-f04-r2`
[...]
L241:   2. Enforce `PASSWORD_PBKDF2_ITERATIONS >= 210000` floor in deployed staging and production configurations (`MIN_DEPLOYED_PBKDF2_ITERATIONS`).
[...]
L394: ## 4. Git & GitHub Tracking Reconciliation Matrix
L395:
L396: | Entity ID | Entity Type | Title / Focus Area | Source Branch / Author | Merge Commit | Incorporated in `83dc7d24`? | Codebase Status | Key Code Files | Key Verifying Tests |
L397: | :--- | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
L398: | **PR #40** | PR | Core Loop Durability & Honest Journeys | `improvement/core-loop-durability` | `4004457d` | **YES** | Resolved | `apps/api/src/server.ts`, `apps/web/src/*` | `tests/e2e/core-loop.spec.ts`, `tests/pg/core-persistence.test.ts` |
L399: | **PR #41** | PR | Five-Lock RLS Hardening | `security/five-lock-smoke-hardening-20261018` | `8bdad381` | **YES** | Resolved | `supabase/migrations/00044*` | `tests/security/private-data-rls.test.ts` |
L400: | **PR #42** | PR | RLS Runtime Validation & Secret Scan | `security/rls-runtime-validation-ci-fix-20261018` | `5c130a7e` | **YES** | Resolved | `supabase/migrations/*`, `.github/workflows/ci.yml` | `tests/pg/private-data-rls.test.ts`, `tests/security/private-data-rls.test.ts` |
L401: | **PR #43** | PR | Production Safety Gates & Fail-Closed | `chatgpt/production-safety-gates-20261018` | `d8dd0567` | **YES** | Resolved | `apps/api/src/server.ts`, `apps/api/src/storage/*` | `tests/pg/core-persistence.test.ts`, `tests/security/core-authz.test.ts` |
L402: | **Issue #44** | Issue | Transactional Email & Provider Delivery | Issue Tracker (tracked in PR #43, #51, #55, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/worker/src/email-adapter.ts`, `apps/api/src/server.ts` | `tests/unit/production-config.test.ts`, `tests/e2e/frontend-fixes.spec.ts` |
L403: | **Issue #45** | Issue | Reputation Visibility & Candidate Consent | Issue Tracker (tracked in PR #57, #58) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `packages/domain/src/reputation-engine.ts` | `tests/integration/reputation-visibility.test.ts`, `tests/integration/review-r2-regressions.test.ts` |
L404: | **Issue #46** | Issue | Technical Interview Sandbox Security | Issue Tracker (tracked in PR #40, #43, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `packages/domain/src/technical-interview.ts` | `tests/integration/technical-interview.test.ts`, `tests/security/core-authz.test.ts` |
L405: | **Issue #47** | Issue | Privacy Policy & Legal Contact Claims | Issue Tracker (tracked in PR #40, #43, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/web/src/pages/LegalPages.tsx`, `packages/config/src/env.ts` | `tests/e2e/frontend-fixes.spec.ts`, `tests/security/core-authz.test.ts` |
L406: | **Issue #48** | Issue | User Data Erasure & Scheduled Deletion | Issue Tracker (tracked in PR #40, #43, #51, #57) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `apps/api/src/storage/erasure-request-store.ts` | `tests/pg/core-persistence.test.ts`, `tests/pg/work-history-removal.test.ts` |
L407: | **Issue #49** | Issue | PostgreSQL Durability vs Ephemeral Routes | Issue Tracker (tracked in PR #40, #43, #51, #53, #54) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `apps/api/src/storage/*` | `tests/pg/core-persistence.test.ts`, `tests/pg/saved-jobs.test.ts` |
L408: | **Issue #50** | Issue | Payment Gateway & Billing Integrity | Issue Tracker (tracked in PR #40, #43, #55) | N/A (Issue) | N/A | **Partially Addressed** | `apps/api/src/server.ts`, `packages/domain/src/billing.ts` | `tests/integration/billing.test.ts`, `tests/unit/production-config.test.ts` |
L409: | **PR #51** | PR | Privacy, BYO AI Encryption & Resend | `chatgpt/privacy-mail-hardening-20261018` | `4890ef21` | **YES** | Resolved | `apps/worker/src/email-adapter.ts`, `apps/api/src/server.ts` | `tests/pg/core-persistence.test.ts`, `tests/unit/production-config.test.ts` |
L410: | **PR #52** | PR | Release Preflight Migration Drift Gate | `chatgpt/release-preflight-20261018` | `616f942d` | **YES** | Resolved | `scripts/release-preflight.mjs` | Manual preflight execution |
L411: | **PR #53** | PR | Durable Saved Searches Persistence | `chatgpt/durable-saved-searches-20261018` | `eb69a2f8` | **YES** | Resolved | `apps/api/src/storage/saved-searches-store.ts` | `tests/pg/saved-searches.test.ts` |
L412: | **PR #54** | PR | Durable Job Bookmarks & Visibility | `chatgpt/durable-job-bookmarks-20261018` | `1776f948` | **YES** | Resolved | `apps/api/src/storage/saved-jobs-store.ts` | `tests/pg/saved-jobs.test.ts` |
L413: | **PR #55** | PR | Oracle Ampere ARM64 Staging Foundation | `chatgpt/oracle-staging-readiness` | `8864d2c8` | **YES** | Resolved | `deploy/oracle/compose.yaml`, `deploy/oracle/.env.example` | `.github/workflows/oracle-staging.yml` |
L414: | **PR #56** | PR | Staging Backup & Isolated Restore Drill | `chatgpt/oracle-staging-recovery` | `252b03f9` | **YES** | Resolved | `deploy/oracle/verify-backup-restore.sh`, `.gitignore` | Execution of `verify-backup-restore.sh` |
L415: | **PR #57** | PR | Audit Findings Port & Frontend Fixes | `claude/issues-44-50-fixes` | `9156b1a8` | **YES** | Resolved | `apps/api/src/server.ts`, `apps/web/src/pages/*` | `tests/e2e/frontend-fixes.spec.ts`, integration suites |
L416: | **PR #58** | PR | Review Round 2 Regressions & BR-167 | `claude/audit-f01-f04-r2` | `61eae132` | **YES** | Resolved | `apps/api/src/server.ts`, `packages/config/src/env.ts` | `tests/integration/reputation-visibility.test.ts`, `tests/integration/review-r2-regressions.test.ts` |
L417: | **Commit `83dc7d24`** | Commit | Knowledge Graph & Architecture Index | `main` / `repository_audit_roadmap` | `83dc7d24` | **HEAD** | Resolved | `graphify-out/*` | Graphify AST and HTML reports |
L418:
L419: ---
L420:
L421: *Report ratified and published by the Teamwork Master Synthesis Engineering Group at commit `83dc7d24`.*
````

<!-- ledger-D D-20 -->

### Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/RELEASE_SCOPE_AND_BACKLOG.md (gap closure D-20)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: about 36 verifying-test command strings per backlog item (for example `pnpm test:pg tests/pg/core-persistence.test.ts -t "..."`, `pnpm exec playwright test tests/e2e/core-loop.spec.ts`, `curl -k https://127.0.0.1/health`, `node scripts/test-staging-mail.mjs`), SQL/API snippets in the Given/When/Then text, URL https://SITE_DOMAIN/health.

```text
L7: **Repository:** `https://github.com/yhsomani/talentsphere-complete.git`
[...]
L63: ## 3. Actionable, Deduplicated Backlog with Stable IDs
L64:
L65: Every backlog item carries a stable identifier (`BL-xxx`), urgency rating (`P0` Blocker to `P3` Medium), structured Given/When/Then acceptance criteria, and explicit verifying tests.
L66:
L67: ### 3.1 P0: Launch Blockers (Mandatory Pre-Launch Operational Gates)
L68:
L69: #### BL-001: Corporate Email Challenge HMAC Key Hardening (SEC-01)
L70: - **Urgency:** **P0 Blocker**
L71: - **Domain:** Cryptography / Work History
L72: - **Traceability:** SEC-01, Issue #44, F-94
L73: - **User Story:** As an application security engineer, I want corporate email OTP codes hashed using HMAC-SHA256 with a server secret so that database read leaks cannot be rainbow-table reversed.
L74: - **Acceptance Criteria:**
L75:   - **Given** a candidate requests corporate email verification for work history `W`
L76:   - **When** the 6-digit numeric OTP is generated and stored in `work_history_email_challenges`
L77:   - **Then** `code_hash` MUST be computed using `crypto.createHmac('sha256', env.TOKEN_SECRET).update(`${workHistoryId}:${code}`).digest('hex')`
L78:   - **And** raw `sha256Hex(`${id}:${code}`)` without server secret MUST NOT be used anywhere.
L79: - **Verifying Test:**
L80:   - `pnpm exec vitest run tests/integration/work-history-graph.test.ts`
L81:   - `pnpm exec vitest run tests/security/injection-defenses.test.ts`
L82:
L83: #### BL-002: Referee Voucher Token TTL Expiration Enforcement (SEC-02)
L84: - **Urgency:** **P0 Blocker**
L85: - **Domain:** Cryptography / Work History
L86: - **Traceability:** SEC-02, Issue #44, F-58, F-94
L87: - **User Story:** As a candidate and recruiter, I want referee voucher links to expire after 30 days so that stale or compromised email links cannot be submitted indefinitely.
L88: - **Acceptance Criteria:**
L89:   - **Given** an employment reference request is minted with a 128-bit voucher token
L90:   - **When** the record is created in `employment_references`
L91:   - **Then** an `expires_at TIMESTAMPTZ` column MUST be set to `now() + INTERVAL '30 days'`
L92:   - **And** when `GET /api/v1/references/:refId` or `POST /api/v1/candidates/work-history/references/:refId/submit` is called after `expires_at`, the server MUST reject with `410 GONE` (`reference_voucher_expired`).
L93: - **Verifying Test:**
L94:   - `pnpm exec vitest run tests/integration/work-history-graph.test.ts -t "voucher expiration"`
L95:   - `pnpm test:pg tests/pg/work-history-removal.test.ts`
L96:
L97: #### BL-003: Transactional Email Staging DNS & Resend Configuration (Issue #44)
L98: - **Urgency:** **P0 Blocker**
L99: - **Domain:** Infrastructure / Operations
L100: - **Traceability:** Issue #44, F-94
L101: - **User Story:** As a DevOps engineer, I want Resend credentials and domain DNS records (SPF, DKIM, DMARC) verified in staging so that corporate email OTPs and referee requests are delivered reliably.
L102: - **Acceptance Criteria:**
L103:   - **Given** staging environment configuration in `deploy/oracle/.env`
L104:   - **When** the API server boots in staging mode (`NODE_ENV=production`)
L105:   - **Then** `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` MUST validate cleanly
L106:   - **And** worker process MUST successfully dispatch a live test email through Resend with valid DKIM alignment.
L107: - **Verifying Test:**
L108:   - `pnpm exec vitest run tests/unit/production-config.test.ts`
L109:   - Staging live verification: `node scripts/test-staging-mail.mjs`
L110:
L111: #### BL-004: Legal Terms & Privacy Policy Founder Review (Issue #47)
L112: - **Urgency:** **P0 Blocker**
L113: - **Domain:** Legal / Compliance
L114: - **Traceability:** Issue #47, F-15
L115: - **User Story:** As company legal counsel, I want to review and ratify `PrivacyPage.tsx` and `TermsPage.tsx` so that public legal contracts accurately reflect platform operations and liability boundaries.
L116: - **Acceptance Criteria:**
L117:   - **Given** legal terms in `apps/web/src/pages/PrivacyPage.tsx` and `TermsPage.tsx`
L118:   - **When** audited against applicable law (GDPR, CCPA/CPRA, India DPDP)
L119:   - **Then** formal legal approval MUST be recorded in `docs/governance/LEGAL_APPROVAL.md`
L120:   - **And** contact mailboxes (`VITE_PRIVACY_EMAIL`, `VITE_SECURITY_EMAIL`) MUST be active mailboxes.
L121: - **Verifying Test:**
L122:   - `pnpm exec playwright test tests/e2e/frontend-fixes.spec.ts -t "FE-02"`
L123:
L124: #### BL-005: Caddy Reverse Proxy Root Health Route Proxying (OPS-02)
L125: - **Urgency:** **P0 Blocker**
L126: - **Domain:** Infrastructure / DevOps
L127: - **Traceability:** OPS-02, PR #55
L128: - **User Story:** As an SRE, I want Caddy to proxy `/health` to the Fastify API so that synthetic monitoring alerts immediately when the API service fails.
L129: - **Acceptance Criteria:**
L130:   - **Given** `deploy/oracle/Caddyfile`
L131:   - **When** an HTTP GET request is made to `https://SITE_DOMAIN/health`
L132:   - **Then** Caddy MUST proxy the request to `api:4000` rather than serving static `index.html`
L133:   - **And** the HTTP response MUST return JSON `{"status":"ok"}` with status code 200.
L134: - **Verifying Test:**
L135:   - `curl -k https://127.0.0.1/health` on deployed staging instance.
L136:
L137: ---
L138:
L139: ### 3.2 P1: Critical Quality & Release Readiness
L140:
L141: #### BL-006: User Data Erasure 30-Day Scheduled Worker Automation (Issue #48)
L142: - **Urgency:** **P1 Critical**
L143: - **Domain:** Compliance / Background Worker
L144: - **Traceability:** Issue #48, F-15
L145: - **User Story:** As a candidate exercising GDPR Article 17 erasure with a 30-day grace period, I want my data automatically purged when the grace period expires without manual operator intervention.
L146: - **Acceptance Criteria:**
L147:   - **Given** an active erasure request with `status: 'pending'` and `scheduled_for <= now()`
L148:   - **When** the scheduled worker cron runs
L149:   - **Then** `executeScheduledErasures()` MUST purge the candidate's work history, references, applications, messages, and account
L150:   - **And** update `data_erasure_requests.status = 'executed'`.
L151: - **Verifying Test:**
L152:   - `pnpm test:pg tests/pg/core-persistence.test.ts -t "erasure"`
L153:   - `pnpm exec vitest run tests/unit/worker-queue.test.ts`
L154:
L155: #### BL-007: Fix Vitest Security Script Argument in `package.json`
L156: - **Urgency:** **P1 Critical**
L157: - **Domain:** Toolchain / CI
L158: - **Traceability:** Baseline Diagnostics §6
L159: - **User Story:** As a developer, I want `pnpm test:security` to run cleanly without Vitest v3 argument syntax errors.
L160: - **Acceptance Criteria:**
L161:   - **Given** `package.json` line 17
L162:   - **When** `pnpm test:security` is executed
L163:   - **Then** the command MUST invoke `vitest run tests/security` (removing `--dir`)
L164:   - **And** exit with code 0 across all 5 security test files.
L165: - **Verifying Test:**
L166:   - `pnpm test:security`
L167:
L168: #### BL-008: Add Committed Cache & Agent Folders to `.prettierignore`
L169: - **Urgency:** **P1 Critical**
L170: - **Domain:** Toolchain / Code Quality
L171: - **Traceability:** Baseline Diagnostics §10
L172: - **User Story:** As a CI pipeline engineer, I want `pnpm lint` to ignore `graphify-out/` and `.agents/` so that lint checks report true repository code health.
L173: - **Acceptance Criteria:**
L174:   - **Given** `.prettierignore`
L175:   - **When** `graphify-out/` and `.agents/` are appended
L176:   - **Then** `pnpm lint` MUST exit 0 with all matched files compliant.
L177: - **Verifying Test:**
L178:   - `pnpm lint`
L179:
L180: #### BL-009: Persist Active Assessment Sessions to PostgreSQL (SEC-05)
L181: - **Urgency:** **P1 Critical**
L182: - **Domain:** Security / AI Governance
L183: - **Traceability:** SEC-05, F-08, F-11
L184: - **User Story:** As an assessment integrity officer, I want active proctored assessment sessions persisted in PostgreSQL so that API restarts cannot wipe the session map and unblock the AI assistant.
L185: - **Acceptance Criteria:**
L186:   - **Given** a candidate starts an assessment with `policyMode: 'AI_PROHIBITED'`
L187:   - **When** the session is created
L188:   - **Then** the record MUST be written to `public.assessment_sessions` (migration 00004)
L189:   - **And** when `assertAIAssistanceAllowed()` is invoked after an API process restart, it MUST load the active session from SQL and reject with `403 ASSESSMENT_AI_PROHIBITED`.
L190: - **Verifying Test:**
L191:   - `pnpm exec vitest run tests/security/injection-defenses.test.ts -t "AI_PROHIBITED"`
L192:   - `pnpm test:pg tests/pg/core-persistence.test.ts -t "assessment session restart"`
L193:
L194: #### BL-010: Fix AI Gateway Hardcoded 'free' Tier & Usage Metering (SEC-06)
L195: - **Urgency:** **P1 Critical**
L196: - **Domain:** AI Gateway / Monetization
L197: - **Traceability:** SEC-06, F-11, F-16
L198: - **User Story:** As a Pro subscriber, I want the AI Career Assistant to grant me Pro token quotas (100,000 tokens/day) rather than throttling me to the free tier limit.
L199: - **Acceptance Criteria:**
L200:   - **Given** a user with an active `'pro'` tier subscription
L201:   - **When** querying `POST /api/v1/ai/career-assistant/chat`
L202:   - **Then** `userTier` MUST resolve to `'pro'` from user entitlements
L203:   - **And** daily usage meters MUST be persisted in PostgreSQL `ai_usage_meters` table to prevent reset upon restart.
L204: - **Verifying Test:**
L205:   - `pnpm exec vitest run tests/unit/ai-gateway-domain.test.ts`
L206:   - `pnpm exec vitest run tests/integration/ai-gateway.test.ts`
L207:
L208: ---
L209:
L210: ### 3.3 P2: Staged Capability Migrations & Enhancements
L211:
L212: #### BL-011: Migrate Challenges & Arena to Durable Storage (F-08)
L213: - **Urgency:** **P2 High**
L214: - **Domain:** Assessment / Durability
L215: - **Traceability:** F-08, Issue #49
L216: - **User Story:** As a candidate solving coding challenges, I want my submissions, scores, and XP persisted to PostgreSQL so that my challenge progress is never lost.
L217: - **Acceptance Criteria:**
L218:   - **Given** challenge submission `POST /api/v1/challenges/:id/submit`
L219:   - **When** code evaluation completes
L220:   - **Then** writes MUST pass through `storage.persist()` into `challenge_submissions` and `xp_transactions`
L221:   - **And** response header `x-talentsphere-durability` MUST NOT return `ephemeral`.
L222: - **Verifying Test:**
L223:   - `pnpm test:pg tests/pg/core-persistence.test.ts -t "challenges durability"`
L224:
L225: #### BL-012: Wire Assessments Page UI to Backend API (F-08)
L226: - **Urgency:** **P2 High**
L227: - **Domain:** Frontend / Assessment
L228: - **Traceability:** F-08
L229: - **User Story:** As a candidate visiting `AssessmentsPage.tsx`, I want to browse real backend challenges and submit code rather than viewing a static client-side preview modal.
L230: - **Acceptance Criteria:**
L231:   - **Given** candidate on `/assessments`
L232:   - **When** page loads
L233:   - **Then** it MUST fetch active challenges from `GET /api/v1/challenges`
L234:   - **And** submitting code MUST dispatch `POST /api/v1/challenges/:id/submit` and display verified test results.
L235: - **Verifying Test:**
L236:   - `pnpm exec playwright test tests/e2e/core-loop.spec.ts`
L237:
L238: #### BL-013: Migrate LMS Courses & Module Progression to PostgreSQL (F-07)
L239: - **Urgency:** **P2 High**
L240: - **Domain:** Learning / Durability
L241: - **Traceability:** F-07, Issue #49
L242: - **User Story:** As a student taking courses, I want my lesson progress, quiz completions, and certificates persisted to the database across server restarts.
L243: - **Acceptance Criteria:**
L244:   - **Given** an enrollment in a course
L245:   - **When** `POST /api/v1/lessons/:id/progress` is called
L246:   - **Then** record MUST be committed to `lesson_progress` table (migration 00005)
L247:   - **And** issued certificates MUST be written to `course_certificates`.
L248: - **Verifying Test:**
L249:   - `pnpm test:pg tests/pg/core-persistence.test.ts -t "lms durability"`
L250:
L251: #### BL-014: Candidate Explicit Reputation Visibility Consent Setting (Issue #45)
L252: - **Urgency:** **P2 High**
L253: - **Domain:** Privacy / Reputation
L254: - **Traceability:** Issue #45, F-144
L255: - **User Story:** As a candidate, I want an explicit toggle in Privacy Settings to allow recruiters to view my verified reputation score before I submit a job application.
L256: - **Acceptance Criteria:**
L257:   - **Given** candidate settings on `ProfilePage.tsx`
L258:   - **When** toggling "Allow verified recruiters to view reputation"
L259:   - **Then** `user_settings.reputation_visibility` MUST update in PostgreSQL
L260:   - **And** `GET /api/v1/reputation/users/:userId` MUST allow authorized recruiters when consent is granted.
L261: - **Verifying Test:**
L262:   - `pnpm exec vitest run tests/integration/reputation-visibility.test.ts`
L263:
L264: #### BL-015: Connect Application Draft Autosave to Database (F-36)
L265: - **Urgency:** **P2 High**
L266: - **Domain:** Candidate / Durability
L267: - **Traceability:** F-36, Issue #49
L268: - **User Story:** As a candidate drafting a lengthy job application, I want my draft cover letter and answers saved to PostgreSQL every 30 seconds so that closing my browser does not lose my work.
L269: - **Acceptance Criteria:**
L270:   - **Given** candidate editing application on `JobDetailPage.tsx`
L271:   - **When** input changes
L272:   - **Then** draft MUST be written to `application_drafts` table (migration 00019)
L273:   - **And** reopening the job detail page MUST restore the saved draft.
L274: - **Verifying Test:**
L275:   - `pnpm test:pg tests/pg/core-persistence.test.ts -t "application drafts"`
L276:
L277: ---
L278:
L279: ### 3.4 P3: Monetization, Sandboxing & Ecosystem Expansion
L280:
L281: #### BL-016: Stripe Checkout & Subscription Lifecycle Integration (Issue #50, F-16)
L282: - **Urgency:** **P3 Medium**
L283: - **Domain:** Monetization / Billing
L284: - **Traceability:** Issue #50, F-16
L285: - **User Story:** As an enterprise recruiter, I want to purchase a Pro hiring plan using credit card checkout via Stripe so that our organization unlocks multi-seat postings.
L286: - **Acceptance Criteria:**
L287:   - **Given** `BILLING_MODE=stripe` and valid `STRIPE_SECRET_KEY`
L288:   - **When** recruiter selects Pro plan on `CheckoutPage.tsx`
L289:   - **Then** server MUST create a Stripe Checkout Session
L290:   - **And** upon `checkout.session.completed` webhook, activate subscription in `subscriptions` table.
L291: - **Verifying Test:**
L292:   - `pnpm exec vitest run tests/integration/billing.test.ts`
L293:
L294: #### BL-017: Secure Containerized Code Execution Sandbox (Issue #46, F-88)
L295: - **Urgency:** **P3 Medium**
L296: - **Domain:** Sandboxing / Technical Interview
L297: - **Traceability:** Issue #46, F-88
L298: - **User Story:** As an interviewer, I want candidate submitted code executed inside an isolated, unprivileged gVisor/Docker container so that arbitrary code execution cannot compromise the API host.
L299: - **Acceptance Criteria:**
L300:   - **Given** code submission on `POST /api/v1/interviews/execute-code`
L301:   - **When** executed
L302:   - **Then** runner MUST execute inside a container with seccomp profile, zero network egress, memory cap (128MB), and 5-second CPU timeout
L303:   - **And** stdout/stderr and exit code returned cleanly to Fastify.
L304: - **Verifying Test:**
L305:   - `pnpm exec vitest run tests/integration/technical-interview.test.ts`
L306:
L307: #### BL-018: Dockerfile Multi-Stage Image Pruning (OPS-01)
L308: - **Urgency:** **P3 Medium**
L309: - **Domain:** DevOps / Deployment
L310: - **Traceability:** OPS-01
L311: - **User Story:** As a DevOps engineer, I want the production Docker image pruned of build tools and devDependencies so that image size drops below 250MB.
L312: - **Acceptance Criteria:**
L313:   - **Given** `deploy/oracle/Dockerfile`
L314:   - **When** image is built
L315:   - **Then** runtime stage MUST copy only compiled `dist/` and `node_modules` generated by `pnpm --prod`
L316:   - **And** Vitest, Playwright, and TypeScript compiler MUST NOT exist in the final container image.
L317: - **Verifying Test:**
L318:   - `docker images talentsphere-api` verified $<250$MB.
L319:
L320: ---
[...]
L368:   - Production deployment on single-writer PostgreSQL architecture with automated backup verification (`deploy/oracle/verify-backup-restore.sh`).
```

<!-- ledger-D D-21 -->

### Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md (gap closure D-21)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: 15 of 31 URLs (issue-comment links #46/#48, CI run URLs), commit hash fca16f5117c8, ~21 code tokens (`stripe.webhooks.constructEvent(rawBody, signature, whsec)`, `processStripeEvent`, Playwright assertions).

```text
L5: **As-of:** 2026-10-23 UTC • **Repository:** [yhsomani/talentsphere-complete](https://github.com/yhsomani/talentsphere-complete) • **Reviewed upstream `main`:** [`0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2`](https://github.com/yhsomani/talentsphere-complete/commit/0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2) • **Report branch:** `chatgpt/second-pass-audit-20261023`.
[...]
L11: **Verdict: NOT READY for production or a paid public launch.** The most recent GitHub Actions run for this precise `main` commit [#40017740619](https://github.com/yhsomani/talentsphere-complete/actions/runs/40017740619) **failed 1 of 236 Playwright cases** (`tests/e2e/account-security.spec.ts:127`); 235 passed. Preceding commits [`deaea7665`](https://github.com/yhsomani/talentsphere-complete/actions/runs/40016584724) and [`4d3cf5d4`](https://github.com/yhsomani/talentsphere-complete/actions/runs/40014603225) had successful CI. Latest job passed all prior lint, typecheck, memory-mode unit/integration/security tests, local migration checks, real-Postgres tests, build and browser secret scan.
[...]
L13: **Latest CI measured evidence:** **1,231 passing Vitest tests (117 files)**; **50 passing PostgreSQL tests (11 files)**; **235/236 Playwright passing**; clean local PostgreSQL migrations **00001–00052** succeeded. These were executed by GitHub Actions, **not re-executed by this auditor locally**. The failing browser case saw `page.waitForURL: net::ERR_ABORTED; maybe frame was detached?` while checking the revoked other-device session. The test file was changed in this review branch to wait for the same final URL using `expect(page).toHaveURL` without requiring the transient navigation load event; the subsequent exact revoked-session-message assertion is **unchanged**. Classification: **timing/race hypothesis, pending CI confirmation**, not proved application fix.
[...]
L16: - **Stripe implementation now exists** (PR [#71](https://github.com/yhsomani/talentsphere-complete/pull/71)): SDK gateway, signed webhook, Postgres records, idempotent provider-event storage, cancellation and domain tests. This supersedes `docs/reports/PAYMENT_AUDIT_2026-10-23.md` §Scope's earlier statement that Stripe did not exist.
[...]
L37: | Stripe | `apps/api/src/stripe-gateway.ts`, `billing-stripe.ts`, `storage/billing-store.ts`, `server.ts` billing routes, `packages/domain/src/stripe-billing.ts`, `packages/config/src/env.ts`, migration 00052, unit/integration/PG tests, connected account **test mode read-only** | No live-mode Stripe account accessible; no remote delivery rehearsal; zero webhook endpoints in connected test account |
[...]
L50: | [PR #41](https://github.com/yhsomani/talentsphere-complete/pull/41), [#42](https://github.com/yhsomani/talentsphere-complete/pull/42) | Private-data RLS/ownership and security regression tests | `tests/pg/private-data-rls.test.ts` and security suite, Postgres tests green in CI | **Locally verified only**; hosted target has no tables; not production RLS verified |
[...]
L54: | [PR #61–#66](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged) | Hosted-target guard, preflight, migration incompatibility scanners, CI gate | `.github/workflows/ci.yml` explicitly expects hosted dependency scanner to detect legacy Auth dependencies; local 52 migrations green | **Fail-closed compatibility warning works in CI**, not a hosted-compatible schema; #46 open |
L55: | [PR #67–#69](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged) | Refuse unpaid entitlements and remedy lint block | Later CI succeeded on `deaea7665` and `4d3cf5d4` | **CI verification** of merged guard/formatting; monetization still blocked |
L56: | [PR #70](https://github.com/yhsomani/talentsphere-complete/pull/70) | Simulated billing lifecycle, idempotency and erasure | Unit/integration tests in latest run, domain paths | **Tested code**, but simulated billing must remain disabled outside dev/test |
L57: | [PR #71](https://github.com/yhsomani/talentsphere-complete/pull/71) | Stripe SDK, signed webhook, durable PG billing, cancellation | `apps/api/src/{billing-stripe,stripe-gateway}.ts`, `billing-store.ts`, migration 00052, `tests/{integration,pg,unit}/*stripe* / billing*`; 50 PG cases pass in CI | **Implemented; integration & local PG verified**, but zero configured provider webhook endpoints and zero hosted app tables. Paid prod launch **not verified** |
L58: | [Commit `fca16f5`](https://github.com/yhsomani/talentsphere-complete/commit/fca16f5117c8) | Two prior Playwright HTTP 5xx assertion failures | Latest run includes passing `mutation-feedback.spec.ts` cases; safe generic server message preserved | **Verified for current CI**, previous red E2E mismatch resolved |
L59: | Latest `main` [`0f40b6c`](https://github.com/yhsomani/talentsphere-complete/commit/0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2) | Readability refactor | Current run red only at session revocation E2E navigation wait | **Causality unproved**; isolated test improvement awaiting CI |
[...]
L79: 1. **Observed:** project `qidckctwrkxyiwworchd` ACTIVE_HEALTHY, `ap-south-1`; `list_tables(public)` **[]**, migration ledger exactly one `add_readonly_keepalive_ping`, `list_edge_functions` **[]**. Security/performance advisor output empty, but that **does not imply healthy application access control** when application tables are absent.
L80: 2. **Repository:** `supabase/migrations/00001_...` to `00052_billing_persistence_and_stripe.sql`. CI's custom local runner can apply all 52 to **disposable PostgreSQL 16** and rerun idempotently. This is **not evidence** they can run unmodified on **hosted Supabase PostgreSQL 17**.
[...]
L90: | Server-side catalog & access | `buildPriceCatalog`, `CreateCheckoutSessionInputSchema`, `registerStripeBilling` enforce server-side prices and plan role; routes require session | Unit/integration CI passes; commercial price and entitlement policy must be approved (#50) |
L91: | Checkout | `/api/v1/billing/checkout`, SDK `stripe.checkout.sessions.create`, idempotency including user/plan/cycle, client reference | Network is **mocked** in repo tests; connected Stripe has only one test recurring price; browser `CheckoutPage.tsx` still says no processor exists, and does not expose purchase UI |
L92: | Source-of-truth & trust | `processStripeEvent`, `reconcileStripeSubscription`; paid access from signed known-price, eligible subscription; unknown prices grant free entitlements | Appropriate fail-closed design in tests; verify all user-facing gates really read `entitlements` and never `subscription.planTier` alone |
L93: | Webhooks | `stripe.webhooks.constructEvent(rawBody, signature, whsec)`, normalized checkout/subscription/invoice events | Genuine local signature verification with **synthetic payloads**; connected test Stripe has **zero** configured endpoints, so remote delivery unproven |
[...]
L97: | Refunds/disputes | `normalizeEvent` defaults `charge.refunded` to **ignored** (integration test explicitly does this) | **P1/P2 product decision & coverage gap:** clarify whether refunds/chargebacks need invoice/entitlement changes, then implement and test. Do not assume refund means auto-cancel without policy |
L98: | Stripe erase | `eraseBillingData` calls `deleteCustomer` when Stripe mode is enabled, then local purge | **P1 risk:** if existing Stripe customer but server boots with billing disabled, code logs a warning and still purges local mapping; external customer may remain, requiring reconciliation/manual action. Add explicit operator workflow and failure test. |
[...]
L101: **Additional risk needing code-level verification:** status/order events use Stripe's Unix-second `event.created`; guard uses less-than and allows same-second events. Under particular arrival order, two status changes with equal timestamps could overwrite an outcome. This is a **potential ordering gap**, not a reproduced financial defect; design adversarial order tests before editing policy.
[...]
L103: **Backend/UI discrepancy:** `apps/web/src/pages/CheckoutPage.tsx:8–14` comment and all visible plans still describe a free-only service and say no processor exists, while backend supports `BILLING_MODE=stripe`. A deliberate free-only launch can retain the non-purchasable UI, but update that misleading code comment and make operator/billing mode truthful; do not enable paid CTAs without approved price policy and full staging tests.
[...]
L114: | R2-06 | **P2 payment policy** | `normalizeEvent` ignores `charge.refunded` | Confirmed missing handler; semantics undecided | Decide refund/dispute strategy, reconcile with invoice and entitlements; signed refund test |
[...]
L126: | `tests/e2e/account-security.spec.ts` | One narrow source-test change, replacing `waitForURL('**/login**')` after in-app navigation with `await expect(elsewhere).toHaveURL(/\/login(?:\?|$)/)` | Playwright's URL assertion retries through a client-side redirect without requiring an abort-prone `load` navigation event; exact revoked-session banner, re-login and landing checks **retained**. No app/auth code weakened. **CI verdict pending**. |
[...]
L154: | #45 | OPEN | No approved deletion/legal/live contact; payment erasure mode-off risk R2-05 | [Comment 6374109469](https://github.com/yhsomani/talentsphere-complete/issues/45#issuecomment-6374109469); kept open |
L155: | #46 | OPEN | Local migration count now 52; hosted public schema still empty | [Comment 6374110168](https://github.com/yhsomani/talentsphere-complete/issues/46#issuecomment-6374110168); kept open |
L156: | #47 | OPEN | CI latest red; stage/restore remains unproven | [Comment 6374110786](https://github.com/yhsomani/talentsphere-complete/issues/47#issuecomment-6374110786); kept open |
L157: | #48 | OPEN | Durable billing added to saved jobs/searches/settings; long-tail ephemeral | [Comment 6374111482](https://github.com/yhsomani/talentsphere-complete/issues/48#issuecomment-6374111482); kept open |
[...]
L159: | #50 | OPEN | Stripe added in PR71; connected test account zero webhook endpoints; UI free-only | [Comment 6374112336](https://github.com/yhsomani/talentsphere-complete/issues/50#issuecomment-6374112336); kept open |
[...]
L389: - [Latest red main CI, run 40017740619](https://github.com/yhsomani/talentsphere-complete/actions/runs/40017740619) — exact commit 0f40b6c, one E2E failure
L390: - [Earlier green run 40016584724](https://github.com/yhsomani/talentsphere-complete/actions/runs/40016584724), [green run 40014603225](https://github.com/yhsomani/talentsphere-complete/actions/runs/40014603225)
L391: - [PR #71: durable Stripe billing](https://github.com/yhsomani/talentsphere-complete/pull/71), [PR #70: billing fixes](https://github.com/yhsomani/talentsphere-complete/pull/70), [PRs #61–#66: hosted migration guards](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged)
```

## Implementation Roadmap

_Former file: `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP.md`._

Doc ID: RDM-01 · Owner: Program Director (with Architecture Review Board) · Version 1.0 · Status: Draft for Review · Relates: GOAL-01…GOAL-08, ADR-T01…T22, CC-INV, DOM-00, QA-AC §6.4, OPS-REL, OPS-SLO, RSK-REG, DEC-OPEN, MIG-01

> **Revision 2 folded in (2026-10-27)** from `ROADMAP.md#record-roadmap-rev2`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

**This roadmap contains no dates, durations or staffing numbers.** Sequencing is by dependency and exit gate. "Owner team" names a responsibility, not headcount. Nothing here claims any item is built.

### 1. Planning structure

| Level            | ID form            | Meaning                                                                                                                   | Example                                              |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Goal             | `GOAL-NN`          | Business outcome (STR-01)                                                                                                 | GOAL-01 prove skills with graded evidence            |
| Initiative       | `INIT-NN`          | Cross-team thrust toward goals                                                                                            | INIT-02 Evidence & verification core                 |
| Epic             | `EPIC-<INIT>.<n>`  | Deliverable capability inside an initiative                                                                               | EPIC-02.1 Evidence ladder and revocation             |
| Feature          | `FEAT-<DOM>-NN`    | User-visible capability (registry)                                                                                        | FEAT-05-02 Evidence ladder & revocation              |
| Story            | `STORY-<FEAT>-<n>` | Independently deliverable slice with AC                                                                                   | STORY-05-02-3 Show rung badge on candidate profile   |
| Task             | `TASK-<STORY>-<n>` | Engineering action                                                                                                        | TASK-05-02-3-1 Add rung badge component + a11y tests |
| **Work package** | `WP-<NAME>`        | Planning/delivery unit grouping epics and stories into a coherent, releasable slice with one owner team and exit criteria | WP-EVIDENCE-CORE                                     |

A WP is the unit tracked on the roadmap; stories and tasks live in the tracker and trace to AC/TEST ids (QA-AC §8).

```mermaid
flowchart TB
  G["GOAL-01 Prove skills with graded evidence"] --> I["INIT-02 Evidence and verification core"]
  I --> E["EPIC-02.1 Evidence ladder and revocation"]
  E --> F["FEAT-05-02 (provisional)"]
  F --> S["STORY-05-02-3 Rung badge on profile"]
  S --> T["TASK-05-02-3-1 Component + a11y tests"]
  E --> WP["WP-EVIDENCE-CORE (groups epics and stories)"]
```

### 2. Initiatives

| ID      | Initiative                                                        | Goals            | Phases                                |
| ------- | ----------------------------------------------------------------- | ---------------- | ------------------------------------- |
| INIT-01 | Foundations: repo, CI, environments, policy, contracts, data base | GOAL-06, GOAL-08 | Ph0                                   |
| INIT-02 | Evidence & verification core                                      | GOAL-01          | Ph1                                   |
| INIT-03 | Identity, tenancy, privacy                                        | GOAL-06          | Ph1                                   |
| INIT-04 | PWA platform and federation                                       | GOAL-08          | Ph0–Ph1                               |
| INIT-05 | Opportunities and applications                                    | GOAL-02          | Ph1–Ph2                               |
| INIT-06 | Matching and search                                               | GOAL-02, GOAL-03 | Ph1–Ph2                               |
| INIT-07 | Learning and assessment                                           | GOAL-04          | Ph1–Ph2                               |
| INIT-08 | Messaging, notifications, engagement                              | GOAL-02          | Ph1–Ph2                               |
| INIT-09 | Monetisation and entitlements                                     | GOAL-07          | Ph2                                   |
| INIT-10 | AI gateway and governance                                         | GOAL-07, GOAL-03 | Ph0 foundation; Ph2 provider features |
| INIT-11 | Trust, safety and operations                                      | GOAL-06          | Ph1–Ph3                               |
| INIT-12 | Institutions and intelligence                                     | GOAL-05, GOAL-04 | Ph3                                   |
| INIT-13 | Reliability, observability and DR                                 | GOAL-08          | Ph0–Ph3                               |
| INIT-14 | Migration from reference (if applicable)                          | GOAL-06          | Ph1–Ph2                               |
| INIT-15 | Community and optional capabilities                               | GOAL-01          | Ph4                                   |

### 3. Workstreams

| ID    | Workstream                | Scope                                                                          | Owner team        | Principal WPs                                           |
| ----- | ------------------------- | ------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------- |
| WS-01 | Foundations               | Monorepo, CI, IaC, environments, config                                        | Platform Eng      | WP-MONOREPO-CI, WP-IAC-ENVS                             |
| WS-02 | Identity                  | Accounts, sessions, passkeys, SSO                                              | Identity          | WP-IDENTITY-SESSIONS, WP-SSO                            |
| WS-03 | PWA platform              | Service worker, offline tiers, install, push                                   | Frontend Platform | WP-PWA-PLATFORM, WP-PUSH                                |
| WS-04 | Federation infrastructure | Host contract, registry, manifest, compat gates                                | Frontend Platform | WP-FED-SPIKE, WP-SHELL-HOST                             |
| WS-05 | Design system             | Tokens, components, a11y                                                       | Design System     | WP-DESIGN-FOUNDATION, WP-A11Y-GATE                      |
| WS-06 | Core modules (UI)         | Remotes: candidate, learning, opportunities, hiring, messaging, account, admin | Feature teams     | per feature WP                                          |
| WS-07 | Backend                   | Modular monolith modules, policy, worker                                       | Backend teams     | WP-POLICY-CORE, WP-WORKER-OUTBOX                        |
| WS-08 | Data                      | Schema, RLS, migrations, search, analytics store                               | Data Eng          | WP-DB-BASE, WP-SEARCH-BASE, WP-ANALYTICS                |
| WS-09 | Integrations              | Email, Stripe, push, AI, SSO, public API                                       | Integrations      | WP-NOTIFY-EMAIL, WP-BILLING-STRIPE, WP-INTEGRATIONS-API |
| WS-10 | Security                  | Threat modelling, pen test, secrets, privacy engineering                       | Security          | WP-PRIVACY-CONSENT, WP-ADMIN-TOOLING                    |
| WS-11 | Reliability               | SLOs, load baseline, HA/DR, resilience                                         | SRE               | WP-LOADBASE, WP-DR-HA, WP-DR-EXERCISE                   |
| WS-12 | Observability             | OTel, dashboards, alerts, RUM                                                  | SRE               | WP-OBS-BASE                                             |
| WS-13 | Testing                   | Catalog automation, traceability, device lab                                   | QA                | WP-QA-TRACE, WP-IOS-DEVICE-LAB                          |
| WS-14 | Operations                | Support tooling, runbooks, moderation, comms                                   | Support Ops, T&S  | WP-SUPPORT-TOOLING, WP-MODERATION                       |
| WS-15 | Release                   | Canary, flags, rollback, change management                                     | Release Eng       | WP-CANARY, WP-FEATURE-FLAGS                             |

### 4. Phases

```mermaid
flowchart LR
  Ph0[Phase 0: foundations and spikes] --> Ph1[Phase 1: career-loop foundation, pre-GA pilot]
  Ph1 --> Ph2[Phase 2: complete-loop GA candidate]
  Ph2 --> Ph3[Phase 3: institutions and intelligence]
  Ph3 --> Ph4[Phase 4: community and optional]
  FED[Optional federation spike] -. only if ARB evaluates ADR-T23 .-> Ph1
```

### 5. Work packages

Common elements per WP unless overridden: Definition of Done = **DoD-WP** (QA-AC §6.4) plus the "DoD+" column. "Tests / Acceptance" lists exact or explicitly grouped AC ids and TEST ids from QA-CAT. In this roadmap, `AC-<domain>-<feature>-*` means all currently registered criteria for `FEAT-<domain>-<feature>`; `AC-00-<area>-*` means all currently registered platform criteria in that area. Neither form includes unregistered criteria. A missing criterion is written `FEAT-xx-yy (AC pending; OPEN-29)` and is not covered by a nearby test. Failure handling references OPS-FMEA rows. Team abbreviations: PE Platform Eng, FP Frontend Platform, DS Design System, ID Identity, CA Candidate team, HI Hiring team, LE Learning team, DA Data Eng, SRE, SE Security, QA, SO Support Ops, CO Commercial Ops, ME Messaging, AI AI team, TS Trust & Safety, RE Release Eng, IN Institutions team, FIN Finance Ops.

#### 5.1 Phase 0 — foundations and spikes

| WP                   | Scope and value                                                                                                                                                                                                                                     | Owner        | Depends on                                           | API / data / UI                                                      | Security and failure handling                                                       | Tests / acceptance                                                                                             | DoD+                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| WP-FED-SPIKE         | Optional: only if the ARB wants to evaluate federation under proposed ADR-T23. Prove or refute Module Federation 2.0 + Vite: host/remote, singleton deps, integrity strategy, fallback/rollback, SW interaction and performance delta vs bundled.   | FP           | none                                                 | Throwaway shell + 2 remotes; no production API or registry rollout   | Reject integrity/version mismatch; test outage fallback                             | TEST-FED-001/003/005/009, TEST-PER-004, TEST-PWA-001; AC-00-02-01…06; report against activation gates          | If not run, bundled remains the baseline; no federated pipeline or signing infrastructure is implied                                              |
| WP-AI-GATEWAY-BASE   | Establish the AI Gateway contract and enforcement boundary: typed provider port, authorization, budget/entitlement check, `AI_PROHIBITED` propagation, redaction and audit shape. No provider inference or paid call in Phase 0/1.                  | AI + SE + PE | WP-MONOREPO-CI, WP-POLICY-CORE, WP-CONTRACTS-OPENAPI | `api/ai` contract, policy action and test harness                    | Deny by default; assessment prohibition applies at gateway; no secrets/client calls | TEST-ASM-005…009 contract cases; AI policy/invariant acceptance criteria; OPEN-24 provider terms remain a gate | Prohibited-mode and entitlement denial tests pass against a stub; provider execution is out of scope until owner-approved cost policy and OPEN-24 |
| WP-ASSESS-RUNNER     | **Decision spike**: build vs buy for isolated, network-less code-execution runner (ADR-T13); threat model, isolation technique options, cost per execution, startup latency, ops burden. Value: unlock verified code assessments honestly (OPEN-27) | LE + SE      | none                                                 | Runner interface contract; no UI                                     | Escape/egress threat model; fail closed to `unverified`; resource limits            | TEST-ASM-002/003 designs; decision memo; security review                                                       | Decision logged (OPEN-27); until shipped, all code submissions `unverified`                                                                       |
| WP-IOS-DEVICE-LAB    | Establish device matrix and method for real iOS/Android validation: install, push-after-gesture, storage eviction, no background sync, WebKit behaviours (OPEN-12). Value: replace secondary-source assumptions with evidence (RES-01 R2)           | QA + FP      | none                                                 | Device inventory, scripts, results register                          | n/a (test infra); privacy of test accounts                                          | TEST-MOB-001…006, TEST-PWA-010/011; AC-00-04-01/02/05                                                          | Verified platform capability matrix published (FF-09 input); OPEN-12 resolved or narrowed                                                         |
| WP-MONOREPO-CI       | Monorepo layout, task graph, affected-only builds, lint rules (FF-01, FF-02, FF-03, FF-07, FF-10 scaffolding), gates RG-01/02/04, SBOM + signing                                                                                                    | PE + RE      | none                                                 | `apps/*`, `packages/*`, CI pipelines                                 | Secret scanning; least-privilege CI tokens; supply-chain gates                      | TEST-SEC-001, TEST-SEC-015, TEST-API-001/003/006, TEST-DEP-004/006, TEST-DAT-001                               | CI runs on a sample module end-to-end; gate waiver mechanism audited                                                                              |
| WP-IAC-ENVS          | Environments from IaC (dev/ci/staging), secrets management, config schema; hosting decision implemented for staging (OPEN-14, 21, 22)                                                                                                               | PE + SRE     | WP-MONOREPO-CI                                       | Env stacks, secret manager                                           | Staging/production isolation; no prod secrets in staging                            | TEST-DEP-007/008; rebuild drill                                                                                | Environment rebuilt from scratch successfully (SLO-35 rehearsal)                                                                                  |
| WP-POLICY-CORE       | `packages/policy`: `can(principal, action, resource)`, deny-by-default, capabilities endpoint, route registry with required policy action, permission matrix as data (USR-01)                                                                       | PE + SE      | WP-MONOREPO-CI                                       | `GET /me/capabilities`; policy decision log                          | Deny-by-default; decisions audited; policy versioning/rollback (FM-15)              | TEST-SEC-001/002/003/004…008, TEST-API-014; AC-00-01-01; FEAT-01-09 (AC pending; OPEN-29)                      | Matrix tests generated from USR-01 pass; negative control demonstrated                                                                            |
| WP-CONTRACTS-OPENAPI | Zod contracts → OpenAPI 3.1, problem+json error types, cursor pagination, `Idempotency-Key` and ETag middleware, AsyncAPI scaffolding                                                                                                               | PE           | WP-MONOREPO-CI                                       | `packages/contracts`; middleware                                     | Idempotency store failure behaviour (FM-16)                                         | TEST-API-001…005, TEST-HIR-008/009; AC-00-01-04/05/06/07/08/10                                                 | oasdiff gate live; example endpoints conform                                                                                                      |
| WP-DB-BASE           | Schema baseline: tenancy columns + RLS pattern, repository layer, `withOutbox`, audit table, migration lint, expand/contract tooling, pooler                                                                                                        | DA + PE      | WP-MONOREPO-CI, WP-IAC-ENVS                          | Postgres schemas; migration runner                                   | RLS enforced for app role; append-only audit; lock budgets                          | TEST-TEN-001/002/003, TEST-API-008, TEST-DAT-001/002/003/009, TEST-OBS-003                                     | Tenant canary harness (FF-05) running in CI                                                                                                       |
| WP-OBS-BASE          | OTel baseline: Pino redaction, traces shell→API→worker, RUM skeleton, dashboards/alerts as code, synthetic framework                                                                                                                                | SRE          | WP-MONOREPO-CI                                       | `packages/observability`; collector                                  | Redaction tests; telemetry never blocks requests (FM-23)                            | TEST-SEC-016, TEST-FED-011, TEST-OBS-001/002; AC-00-03-01                                                      | Golden-signal dashboards for skeleton service; burn-rate alert test fires                                                                         |
| WP-LOADBASE          | Load/performance harness and baseline method: scenarios by API class, RMP-1 Lighthouse CI, corpus generator, calibration notes for SLO numbers                                                                                                      | SRE + QA     | WP-IAC-ENVS, WP-CONTRACTS-OPENAPI                    | k6-class scripts; datasets                                           | Synthetic data only                                                                 | TEST-PER-001/002/003/006/007; AC-00-06-01                                                                      | Calibration note per SLO (OPEN-15); targets promoted from hypothesis to commitment only after this                                                |
| WP-DESIGN-FOUNDATION | Tokens (`packages/ui`), core components, a11y baselines, state patterns (empty/loading/error/offline/denied), remote-slot skeleton                                                                                                                  | DS           | WP-MONOREPO-CI                                       | Component library                                                    | Target-size, focus, contrast; reduced motion                                        | TEST-A11-001/002/003/004/005/006, TEST-EVD-008; AC-00-07-*                                                     | Accessibility checks in CI; documented patterns                                                                                                   |
| WP-QA-TRACE          | Convert QA-CAT/AC to structured data; coverage lint (INV/FF/AC ↔ TEST), CI reports                                                                                                                                                                  | QA           | WP-MONOREPO-CI                                       | `tools/` catalog lint                                                | n/a                                                                                 | QA-STRAT §11; coverage report                                                                                  | Orphan detection blocks merge for R1 areas                                                                                                        |
| WP-CANARY            | Progressive delivery pipeline: cohort routing, automated halt/rollback, release record and compatibility matrix (RG-11/12). Federation-specific registry cohort resolution is conditional on activation.                                            | RE + SRE     | WP-OBS-BASE                                          | Release controller; registry adapter only if federation is activated | Safe defaults; rollback rehearsal                                                   | TEST-DEP-001/002/003/005; federation cases only if activated                                                   | Rollback rehearsed in staging per OPS-REL §10                                                                                                     |

#### 5.2 Phase 1 — career-loop foundation (pre-GA pilot)

Phase 1 delivers a candidate path through first-party learning, practice, evidence, verification, discovery, explainable matching and application. It is a controlled pilot stage, **not GA**: it does not yet complete the SSOT-required interview → outcome → new-evidence loop. Phase 1 release must stay limited to an explicitly scoped pilot; the product owner must approve the cohort and scope before any pilot exposure.

| WP                   | Scope and value                                                                                                                                                                                                                | Owner   | Depends on                                                                 | API / data / UI                                                              | Security and failure handling                                                                                                                                                                   | Tests / acceptance                                                                                                                                      | DoD+                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| WP-IDENTITY-SESSIONS | Sign-up/in, cookie BFF, 15-min access + rotating refresh with reuse detection (BR-T050), passkeys + password, recovery, logout cache clear                                                                                     | ID      | WP-POLICY-CORE, WP-DB-BASE, WP-WORKER-OUTBOX, WP-NOTIFY-EMAIL              | `/auth/*`; account, session, passkey tables; shell login UI                  | httpOnly/SameSite cookies, CSRF defence, rate limits fail-closed, clock tolerance                                                                                                               | TEST-SEC-010/011/017/021, TEST-PWA-003, TEST-REL-010; AC-01-01-_, AC-01-02-_, AC-01-03-_, AC-01-04-_, AC-01-05-_, AC-01-06-_                            | Account-recovery journey tested; no token in JS-readable storage                                                                       |
| WP-SHELL-HOST        | PWA shell with route-level lazy chunks and typed module contract; session, capabilities, error boundaries and offline lifecycle. Bundled mode is the proposed baseline; registry/remote loading is conditional.                | FP      | WP-DESIGN-FOUNDATION, WP-IDENTITY-SESSIONS                                 | Host contract types; static bundled module loader                            | Server authorization; CSP; route error boundaries                                                                                                                                               | TEST-SEC-012/013/014, TEST-A11-007; federation tests only if activated                                                                                  | Bundled mode passes J13; no registry/signing pipeline required unless ADR-T23 is ratified                                              |
| WP-PWA-PLATFORM      | Service worker (versioned caches, update flow, kill switch), offline tiers (ADR-T10), install UX, IndexedDB owner cache with logout wipe                                                                                       | FP      | WP-SHELL-HOST, WP-IOS-DEVICE-LAB                                           | SW; queue library; conflict UI                                               | No cross-user cache leakage; server revalidation of queued writes; WebKit fallbacks                                                                                                             | TEST-PWA-001…012, TEST-MOB-003/004; AC-00-04-*                                                                                                          | Device-lab pass; kill-switch drill                                                                                                     |
| WP-ORG-TENANCY       | Organizations, memberships, role grants (`org_owner`…), tenant bootstrap, role-change enforcement                                                                                                                              | ID + HI | WP-POLICY-CORE, WP-DB-BASE                                                 | `api/orgs`; org admin UI in MOD-ADM                                          | RLS + policy; immediate removal effect                                                                                                                                                          | TEST-TEN-001…007, TEST-SEC-003; AC-02-02.1-01, AC-02-02.3-01, AC-02-03-01, AC-02-03.1-01; FEAT-02-01 (AC pending; OPEN-29)                              | Tenant canary extended to org tables                                                                                                   |
| WP-PROFILE           | Profile, portfolio, resume variants (basic), public profile fields                                                                                                                                                             | CA      | WP-IDENTITY-SESSIONS, WP-DESIGN-FOUNDATION                                 | `api/profile`; MOD-CAND                                                      | Input sanitisation; SSRF guard on imports; offline drafts                                                                                                                                       | TEST-SEC-018/028, TEST-PWA-005; AC-03-01-_, AC-03-02-_, AC-03-06-_, AC-03-08-_                                                                          | Conflict UX validated                                                                                                                  |
| WP-SKILLS-TAXONOMY   | Skills graph and taxonomy read model, merge/alias handling                                                                                                                                                                     | DA + CA | WP-DB-BASE                                                                 | `api/skills`; read API                                                       | Versioned taxonomy; merge events                                                                                                                                                                | FEAT-04-01/02 (AC pending; OPEN-29); TEST-API-007 only covers event compatibility                                                                       | Seed taxonomy from reviewed source (licence check)                                                                                     |
| WP-EVIDENCE-CORE     | Evidence items, artefact upload, malware scan, SM-EVIDENCE, ladder display, revocation + async recompute (BR-T005)                                                                                                             | CA + SE | WP-PROFILE, WP-WORKER-OUTBOX, WP-SKILLS-TAXONOMY                           | `api/evidence`; object storage; scan worker; MOD-CAND UI                     | Scan-before-visible; IDOR-safe downloads; honest labelling                                                                                                                                      | TEST-EVD-001/002/003/007/008/009, TEST-SEC-005/007/019/020/026; AC-05-01-_, AC-05-02-_, AC-05-05-_, AC-05-12-_                                          | INV-T04/T08 tests with negative controls                                                                                               |
| WP-VERIF-REFEREE     | Work-history verification, email-code and referee token flows (hashed, single-use, expiring), reminders and expiry (BR-T004), no-account referee UX                                                                            | CA + ME | WP-EVIDENCE-CORE, WP-NOTIFY-EMAIL, WP-SHELL-HOST                           | `api/verification`; referee mini-app (shell-hosted public route)             | INV-T05; rate limits; email-outage degrade                                                                                                                                                      | TEST-EVD-004/005/006/010/011, TEST-REL-003; AC-06-01-_, AC-06-02-_, AC-06-03-_, AC-06-04-_, AC-06-10-*; referee completes in target time per persona P4 | Usability test with referee persona (OPEN-07)                                                                                          |
| WP-OPP-JOBS          | Job postings, templates, saved searches, alerts (basic), job lifecycle                                                                                                                                                         | HI      | WP-ORG-TENANCY, WP-SEARCH-BASE, WP-ENTITLEMENT-BASE                        | `api/jobs`; MOD-HIR/MOD-OPP                                                  | Posting limits by entitlement, moderation hooks                                                                                                                                                 | TEST-HIR-013; AC-09-01-_, AC-09-02-_, AC-09-03-*, AC-09-05-01, AC-09-08-01; FEAT-09-04/06 (AC pending; OPEN-29)                                         | Public job pages meet SLO-13; slot-cap policy is set before launch                                                                     |
| WP-APPLY-CORE        | Application submit/withdraw, one active per (candidate, job), idempotency, drafts offline, evidence attach                                                                                                                     | HI + CA | WP-OPP-JOBS, WP-EVIDENCE-CORE, WP-PRIVACY-CONSENT, WP-CONTRACTS-OPENAPI    | `api/applications`; MOD-OPP                                                  | BR-T001; consent snapshot for shared evidence; Phase 1 uses the free-tier baseline; partial-failure compensation                                                                                | TEST-HIR-001/008/009/010, TEST-API-011, TEST-PWA-006/007; AC-10-01-_, AC-10-02-_, AC-10-03-_, AC-10-14-_                                                | Chaos test on mid-operation failures; consent and entitlement denial cases are explicit                                                |
| WP-WORKER-OUTBOX     | Worker process, outbox dispatcher, job classes P0–P3, fenced leases, DLQ, periodic scheduler                                                                                                                                   | PE      | WP-DB-BASE                                                                 | `apps/worker`; job tables                                                    | Fencing, dedupe, backpressure                                                                                                                                                                   | TEST-API-008/009/010, TEST-REL-004/005; FEAT-24-01/02/09 (AC pending; OPEN-29)                                                                          | Duplicate-execution probe passes (FM-36)                                                                                               |
| WP-ANALYTICS-BASE    | Consent-gated event taxonomy and ingestion for the core-loop pilot; basic aggregate funnel counters only, with no individual-level recruiter analytics or experimentation                                                      | DA + SE | WP-PRIVACY-CONSENT, WP-WORKER-OUTBOX                                       | `api/analytics`; event schema registry and minimal aggregate read model      | Purpose-bound events; consent checked at capture and processing; identifiers minimized and redacted                                                                                             | TEST-PRV-006, TEST-TEN-005; FEAT-21-01 (AC pending; OPEN-29)                                                                                            | Consent withdrawal stops future eligible events; core-loop counters can be calculated without exposing individual activity             |
| WP-NOTIFY-EMAIL      | Notification preferences, email provider port (Brevo default), templates, suppression, in-app notifications                                                                                                                    | ME      | WP-WORKER-OUTBOX                                                           | `api/notify`; MOD-MSG notifications                                          | Provider breaker; no secrets in templates; accessibility of emails                                                                                                                              | TEST-REL-003, TEST-MSG-001; AC-15-02.1-01, AC-15-02.2-01, AC-15-05.1-01; FEAT-15-02/05 (AC pending; OPEN-29)                                            | Deliverability setup (DKIM/SPF/DMARC) verified [OPEN-26]                                                                               |
| WP-PRIVACY-CONSENT   | Consent scopes (purpose-bound, versioned, revocable), recruiter access gating, data export, erasure orchestration (BR-T060)                                                                                                    | SE + DA | WP-EVIDENCE-CORE, WP-WORKER-OUTBOX                                         | `api/privacy`; MOD-ACC                                                       | INV-T15; erasure across stores; retention list [OPEN-08]                                                                                                                                        | TEST-SEC-009, TEST-PRV-001…004; AC-22-01-_, AC-22-02-_, AC-22-03-*                                                                                      | Erasure verified against search, cache, storage                                                                                        |
| WP-SEARCH-BASE       | Postgres FTS + trigram behind `SearchPort`; index maintenance; tenant-safe job search. Semantic/vector search remains later.                                                                                                   | DA      | WP-DB-BASE, WP-PRIVACY-CONSENT                                             | `api/search`; search UI                                                      | Sanitised queries; tenant isolation; candidate search visibility checks current consent epoch                                                                                                   | TEST-TEN-004, TEST-SRC-001/002, TEST-PER-002; AC-11-01-*                                                                                                | ADR-T11 trigger test in place; no stale-consent result is returned                                                                     |
| WP-ENTITLEMENT-BASE  | Enforce the free-tier baseline and audited admin compensation using BR-T090/T091; apply the configured job-slot limit from BR-T093. No checkout or paid AI call. Numeric plan/slot values remain gated by OPEN-05/19.          | CO + PE | WP-POLICY-CORE, WP-DB-BASE, WP-ORG-TENANCY                                 | `api/billing` entitlement port consumed by `api/jobs` and `api/applications` | Server-derived only; no client/redirect grants; audit every compensation; fail closed on unknown entitlement                                                                                    | BR-T090/T091/T093 policy, concurrency and negative tests; AC-16-04-* for registered entitlement behavior; free-tier-specific criteria remain OPEN-29    | Finance/Product sets the free-tier slot value before launch; candidate core loop remains free                                          |
| WP-LEARNING-CORE     | Minimum first-party learning path: free course catalogue, enrolment, lesson content/progress, completion rule, non-graded practice and a link to evidence. No marketplace, instructor payouts, or evidence-minting assessment. | LE      | WP-EVIDENCE-CORE, WP-SKILLS-TAXONOMY, WP-WORKER-OUTBOX, WP-AI-GATEWAY-BASE | `api/learning`; MOD-LRN                                                      | Accessible content; scanned uploads; learner-owned progress; AI_PROHIBITED enforced; practice cannot mint verified assessment evidence; course-completion issuer trust remains gated by REVW-12 | AC-08-02-_, AC-08-03-_, AC-08-04-*; FEAT-08-01 and FEAT-07-11 (AC pending; OPEN-29); basic practice journey tests                                       | One learner can set a skill goal, complete a lesson, practice safely, and see evidence/provenance; content is first-party and reviewed |
| WP-MATCH-EXPLAIN     | Minimum candidate-facing, non-AI job match: compare job requirements with candidate skills/evidence and show matched/missing factors plus uncertainty. No recruiter ranking, auto-reject, or consequential recommendation.     | HI + CA | WP-SEARCH-BASE, WP-EVIDENCE-CORE, WP-SKILLS-TAXONOMY, WP-WORKER-OUTBOX     | `api/matching`; candidate explanation UI                                     | INV-T19; allowed inputs only; candidate can inspect factors; no employer-side decision output                                                                                                   | FEAT-11-01…03/07 acceptance criteria; explanation and forbidden-input tests                                                                             | Candidate can find a job, see why it may fit, and apply; match output is advisory and explainable                                      |
| WP-ADMIN-TOOLING     | Admin/support minimal console: audited reads, privileged access grants (≤ 4 h, BR-T041), account actions, feature flag admin, audit viewer                                                                                     | SE + SO | WP-POLICY-CORE, WP-DB-BASE                                                 | `api/admin`; MOD-ADM                                                         | INV-T18; two-person approvals; no raw SQL                                                                                                                                                       | TEST-SEC-022/023, TEST-OBS-003; FEAT-20-01/02/03 (AC pending; OPEN-29); AC-20-02.3-01 covers grant notification only                                    | PROC-01, PROC-04 walkthrough executed                                                                                                  |
| WP-FEATURE-FLAGS     | Server-side flags with audit, kill switches, SW and degradation ladder flags                                                                                                                                                   | RE + PE | WP-DB-BASE                                                                 | `api/platform`; admin UI                                                     | Safe defaults; flag changes audited                                                                                                                                                             | TEST-DEP-005, TEST-PWA-009; FEAT-20-04 (AC pending; OPEN-29)                                                                                            | Kill switch list per R1/R2 feature                                                                                                     |
| WP-DR-HA             | HA Postgres + PITR + object versioning + encrypted off-site backups; restore drill; backup SLIs                                                                                                                                | SRE     | WP-IAC-ENVS                                                                | Infra modules                                                                | Separate failure domain; backup access control                                                                                                                                                  | TEST-REL-001, TEST-REC-001/002/003/005; SLO-30/31                                                                                                       | **Production go-live blocker:** restore drill passed (RG-14)                                                                           |
| WP-A11Y-GATE         | Accessibility gates and audits for core flows; screen reader testing; conformance work list                                                                                                                                    | DS + QA | WP-DESIGN-FOUNDATION                                                       | n/a                                                                          | n/a                                                                                                                                                                                             | TEST-A11-001…007; GOAL-06                                                                                                                               | Independent audit scheduled for core flows (OPEN-37)                                                                                   |

#### 5.3 Phase 2 — complete-loop GA candidate

Phase 2 adds the human hiring and learning depth needed to close the SSOT/PRD career loop. GA cannot be declared until the gate in §7 demonstrates Goal → Gap → Learn → Practice → Prove → Verify → Discover → Match → Apply → Interview → Outcome → New Evidence end to end. The later phases remain expansion scope, not prerequisites for that loop unless their risks or dependencies make them so.

| WP                  | Scope and value                                                                                                                                                                                                      | Owner    | Depends on                                              | API / data / UI                        | Security and failure handling                                                                    | Tests / acceptance                                                                                                    | DoD+                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| WP-ATS-PIPELINE     | Minimum human recruiter review, stage management with SM-APPLICATION, interview record, candidate-visible outcome, and outcome-to-new-evidence handoff; deeper notes, collaboration and bulk actions remain additive | HI       | WP-APPLY-CORE, WP-NOTIFY-EMAIL                          | `api/applications` (pipeline); MOD-HIR | BR-T002; If-Match; no auto-reject; candidate controls whether outcome creates/shareable evidence | TEST-HIR-002/003/004; outcome/new-evidence ACs remain OPEN-29 until registered                                        | A candidate can submit, receive a human review, record an interview and outcome, and continue with new evidence; concurrency test with two recruiters |
| WP-LEARNING-DEPTH   | Instructor studio, richer course authoring, deeper learning paths and advanced content workflows.                                                                                                                    | LE       | WP-LEARNING-CORE, WP-MODERATION                         | `api/learning`; MOD-LRN                | Content scanning; moderation and version review                                                  | FEAT-08-06 (AC pending; OPEN-29); content and authoring tests                                                         | Content review checklist live (COM-OPS §13)                                                                                                           |
| WP-ASSESS-ENGINE    | Unified assessment engine, attempts, integrity sessions, human review/appeal, AI_PROHIBITED enforcement; code tasks only if runner decided (OPEN-27)                                                                 | LE + SE  | WP-LEARNING-CORE, WP-AI-GATEWAY, WP-ASSESS-RUNNER       | `api/assessment`; MOD-LRN              | ADR-T13; INV-T20; idempotent submit                                                              | TEST-ASM-001…004, 010, 011; AC-07-02-_, AC-07-03-_, AC-07-04-_, AC-07-05-_; FEAT-07-01/06/07 (AC pending; OPEN-29)    | No simulated pass anywhere                                                                                                                            |
| WP-MESSAGING        | Conversations, consented threads, outreach quota, compose offline queue                                                                                                                                              | ME       | WP-APPLY-CORE, WP-PWA-PLATFORM                          | `api/messaging`; MOD-MSG               | IDOR-safe; flagged-only moderator visibility                                                     | TEST-SEC-006, TEST-PWA-008, TEST-MSG-002; AC-13-01-*                                                                  | Message idempotency verified                                                                                                                          |
| WP-BILLING-STRIPE   | Stripe Checkout/Portal/webhooks, entitlement derivation, dunning flows, reconciliation job                                                                                                                           | CO + PE  | WP-FEATURE-FLAGS, WP-WORKER-OUTBOX                      | `api/billing`; MOD-ACC                 | INV-T17; signature verify; replay-safe; outage behaviour                                         | TEST-BIL-001…007; AC-16-02-01…05, AC-16-03-01…06, AC-16-04-01…06, AC-16-07-01; portal/refund criteria pending OPEN-29 | Tax approach decided (OPEN-18); refund policy approved (OPEN-33)                                                                                      |
| WP-AI-GATEWAY       | Provider execution through the Phase-0 gateway contract: model routing, budgets, approved provider terms, logging, kill switch and user-facing AI calls.                                                             | AI       | WP-AI-GATEWAY-BASE, WP-FEATURE-FLAGS, WP-BILLING-STRIPE | `api/ai`                               | INV-T06/T07/T08/T09; breaker; prompt-injection hygiene                                           | TEST-ASM-005…009; FEAT-17-01/02 (AC pending; OPEN-29)                                                                 | Provider terms and explicit cost policy approved (OPEN-24)                                                                                            |
| WP-MODERATION       | Report flow, moderation queue, actions, appeals tooling, audit                                                                                                                                                       | TS       | WP-ADMIN-TOOLING                                        | `api/safety`; MOD-ADM                  | INV-T09; evidence preservation                                                                   | TEST-MSG-002; AC-19-01.1-01; FEAT-19-02 (AC pending; OPEN-29)                                                         | PROC-05, PROC-15 exercised                                                                                                                            |
| WP-PUSH             | Web Push (VAPID) for installed PWAs, contextual prompt after gesture, subscription hygiene                                                                                                                           | FP + ME  | WP-PWA-PLATFORM, WP-NOTIFY-EMAIL                        | `api/notify` push endpoints            | Fallback to email/in-app; prune dead subscriptions                                               | TEST-PWA-011, TEST-MOB-001/002, TEST-MSG-001                                                                          | Reach measured (MET-049) vs ADR-T02 trigger                                                                                                           |
| WP-SUPPORT-TOOLING  | Helpdesk integration, support code correlation, macros, SLA reporting                                                                                                                                                | SO       | WP-ADMIN-TOOLING                                        | Integrations                           | Redaction; retention                                                                             | PROC-03 acceptance; MET-033/034                                                                                       | Helpdesk decision recorded (OPEN-38)                                                                                                                  |
| WP-RESILIENCE-SUITE | Automated fault-injection suite and first game day; resilience nightly                                                                                                                                               | SRE + QA | WP-CANARY, WP-WORKER-OUTBOX                             | n/a                                    | n/a                                                                                              | TEST-REL-001…012; RG-10                                                                                               | Game-day report updates OPS-FMEA                                                                                                                      |

#### 5.4 Phase 3 — institutions and intelligence

| WP                | Scope and value                                                                                                      | Owner   | Depends on                          | API / data / UI                                   | Security and failure handling                         | Tests / acceptance                                                                                 | DoD+                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------- | ------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| WP-INSTITUTIONS   | Institution tenants, cohorts import/activation, faculty views with consent boundaries, credential approval           | IN      | WP-ORG-TENANCY, WP-LEARNING-CORE    | `api/institutions`; MOD-ADM institution workspace | INV-T03/T15; learner ownership; minors rule (OPEN-09) | TEST-MSG-003, TEST-TEN-005; AC-18-01-_, AC-18-02-_, AC-18-03-_, AC-18-04-_, AC-18-06-_, AC-18-07-_ | Cohort import dry-run + undo                   |
| WP-CAREER-INTEL   | Readiness, transitions, salary insights (explainable, uncertainty)                                                   | CA + DA | WP-MATCH-EXPLAIN                    | `api/careerintel`                                 | No autonomous decisions; data provenance              | FEAT-12-01…07 (AC pending; OPEN-29)                                                                | Data sources licensed/validated                |
| WP-ANALYTICS      | Full event pipeline, metrics catalogue implementation, dashboards, k-anonymous reporting and approved warehouse flow | DA      | WP-ANALYTICS-BASE, WP-WORKER-OUTBOX | `api/analytics`; warehouse                        | Privacy classes, pseudonymisation                     | TEST-PRV-006, TEST-TEN-005; ANL-MET                                                                | Metric definitions as code                     |
| WP-SSO            | OIDC/SAML SSO for orgs, break-glass admin                                                                            | ID      | WP-ORG-TENANCY                      | `api/identity`                                    | Signature/nonce validation; IdP outage                | TEST-SEC-024; FEAT-01-08 (AC pending; OPEN-29)                                                     | Customer IdP interop checklist                 |
| WP-FAIRNESS-AUDIT | Adverse-impact audit job, voluntary self-ID store, reporting, review process                                         | DA + SE | WP-MATCH-EXPLAIN, WP-ANALYTICS      | P3 store                                          | Strict access; small-cell suppression                 | TEST-HIR-007; MET-014                                                                              | Method reviewed with counsel/advisor (OPEN-08) |
| WP-DR-EXERCISE    | Zone/region DR exercise per decision, runbook validation                                                             | SRE     | WP-DR-HA                            | Infra                                             | Out-of-band comms                                     | TEST-REC-004; SLO-33                                                                               | Measured RTO/RPO recorded; OPEN-23 closed      |

#### 5.5 Phase 4 — community and optional

| WP                  | Scope and value                                            | Owner          | Depends on                    | Notes                                                                                          |
| ------------------- | ---------------------------------------------------------- | -------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| WP-COMMUNITY        | Groups, events, articles (DOM-14)                          | Community team | Ph3 exit, moderation maturity | Only if justified by retention data (ADR-T01 revisit); moderation capacity (OPEN-32); tests R3 |
| WP-VIDEO-INTERVIEW  | Video interview recording/feedback                         | HI             | WP-ATS-PIPELINE               | Build-vs-buy decision; consent; storage cost (FIN-COST)                                        |
| WP-IDV              | Identity verification integration                          | ID + Privacy   | OPEN-10                       | Vendor-gated; sensitive data handling (VR-10)                                                  |
| WP-PROCTOR-VENDOR   | Proctoring integration                                     | LE             | WP-ASSESS-ENGINE, OPEN-28     | Vendor-gated; human review; bias/accessibility review                                          |
| WP-INTEGRATIONS-API | Public/partner API, API keys (ROLE-SVC), webhooks outbound | PE             | WP-CONTRACTS-OPENAPI          | `api/integrations`                                                                             | Scoped keys, rate limits, versioning; deferred to align with FEAT-23-01/02 Phase 4 |

#### 5.6 Migration packages (only if OPEN-17 confirms migration need)

| WP                 | Scope                                                                               | Owner | Depends on           | Notes                         |
| ------------------ | ----------------------------------------------------------------------------------- | ----- | -------------------- | ----------------------------- |
| WP-MIGRATE-EDGE    | Routing facade and parallel-run harness (MIG-01 §3)                                 | PE    | WP-SHELL-HOST        | Strangler routing             |
| WP-MIGRATE-SESSION | Token → cookie session cutover (MIG-01 §4)                                          | ID    | WP-IDENTITY-SESSIONS | Exchange endpoint, sunset     |
| WP-MIGRATE-DATA    | Execution of REFERENCE_TO_TARGET_DATA_MIGRATION plan (owned by data-migration team) | DA    | WP-DB-BASE           | Reconciliation (TEST-DAT-006) |

Total work packages: **60** (Ph0 14, Ph1 22, Ph2 10, Ph3 6, Ph4 5, migration 3), counted from the table rows.

### 6. Dependency graph (key edges)

```mermaid
flowchart LR
  subgraph Ph0
    MON[WP-MONOREPO-CI] --> IAC[WP-IAC-ENVS]
    MON --> POL[WP-POLICY-CORE]
    MON --> CON[WP-CONTRACTS-OPENAPI]
    MON --> DBB[WP-DB-BASE]
    MON --> OBS[WP-OBS-BASE]
    MON --> DSF[WP-DESIGN-FOUNDATION]
    MON --> QAT[WP-QA-TRACE]
    IAC --> LOAD[WP-LOADBASE]
    CON --> LOAD
    OBS --> CAN[WP-CANARY]
    IOS[WP-IOS-DEVICE-LAB]
    RUN[WP-ASSESS-RUNNER]
    FED[Optional WP-FED-SPIKE]
    POL --> AIB[WP-AI-GATEWAY-BASE]
    CON --> AIB
  end
  subgraph Ph1
    POL --> ID[WP-IDENTITY-SESSIONS]
    DBB --> ID
    WRK[WP-WORKER-OUTBOX] --> ID
    NOT[WP-NOTIFY-EMAIL] --> ID
    DBB --> WRK
    WRK --> NOT
    ID --> SH[WP-SHELL-HOST]
    DSF --> SH
    SH --> PWA[WP-PWA-PLATFORM]
    IOS --> PWA
    POL --> ORG[WP-ORG-TENANCY]
    DBB --> ORG
    ID --> PRO[WP-PROFILE]
    DSF --> PRO
    PRO --> EVI[WP-EVIDENCE-CORE]
    WRK --> EVI
    TAX[WP-SKILLS-TAXONOMY]
    DBB --> TAX
    TAX --> EVI
    EVI --> VER[WP-VERIF-REFEREE]
    NOT --> VER
    SH --> VER
    EVI --> PRV[WP-PRIVACY-CONSENT]
    WRK --> PRV
    PRV --> ANLB[WP-ANALYTICS-BASE]
    WRK --> ANLB
    DBB --> SRCH[WP-SEARCH-BASE]
    PRV --> SRCH
    ORG --> ENT[WP-ENTITLEMENT-BASE]
    POL --> ENT
    DBB --> ENT
    ORG --> JOB[WP-OPP-JOBS]
    SRCH --> JOB
    ENT --> JOB
    JOB --> APP[WP-APPLY-CORE]
    EVI --> APP
    PRV --> APP
    CON --> APP
    EVI --> LRN[WP-LEARNING-CORE]
    TAX --> LRN
    WRK --> LRN
    AIB --> LRN
    SRCH --> MAT[WP-MATCH-EXPLAIN]
    EVI --> MAT
    TAX --> MAT
    WRK --> MAT
    POL --> ADM[WP-ADMIN-TOOLING]
    DBB --> ADM
    DBB --> FLG[WP-FEATURE-FLAGS]
    IAC --> DR[WP-DR-HA]
    DSF --> A11[WP-A11Y-GATE]
  end
  subgraph Ph2
    APP --> ATS[WP-ATS-PIPELINE]
    NOT --> ATS
    LRN --> LDEP[WP-LEARNING-DEPTH]
    ADM --> MOD[WP-MODERATION]
    MOD --> LDEP
    LRN --> ASE[WP-ASSESS-ENGINE]
    AIG[WP-AI-GATEWAY] --> ASE
    RUN --> ASE
    FLG --> BIL[WP-BILLING-STRIPE]
    WRK --> BIL
    BIL --> AIG
    AIB --> AIG
    APP --> MSG[WP-MESSAGING]
    PWA --> MSG
    ADM --> SUP[WP-SUPPORT-TOOLING]
    CAN --> RES[WP-RESILIENCE-SUITE]
    WRK --> RES
    PWA --> PSH[WP-PUSH]
    NOT --> PSH
  end
  subgraph Ph3
    ORG --> INS[WP-INSTITUTIONS]
    LRN --> INS
    MAT --> CIN[WP-CAREER-INTEL]
    ANLB --> ANA[WP-ANALYTICS]
    WRK --> ANA
    ANA --> FAIR[WP-FAIRNESS-AUDIT]
    MAT --> FAIR
    ORG --> SSO[WP-SSO]
    DR --> DRE[WP-DR-EXERCISE]
  end
  subgraph Ph4_and_migration
    ATS --> COM[WP-COMMUNITY]
    MOD --> COM
    ATS --> VID[WP-VIDEO-INTERVIEW]
    ID --> IDV[WP-IDV]
    SSO --> PROCTOR[WP-PROCTOR-VENDOR]
    CON --> INT[WP-INTEGRATIONS-API]
    SH --> MEDGE[WP-MIGRATE-EDGE]
    ID --> MSESS[WP-MIGRATE-SESSION]
    DBB --> MDATA[WP-MIGRATE-DATA]
  end
  DR -. blocks .-> LIVE{{Production go-live}}
  PRV -. blocks .-> LIVE
  A11 -. blocks .-> LIVE
  LOAD -. calibrates SLOs .-> LIVE
```

### 7. Release gates across phases

| Gate                            | Condition                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ph0→Ph1                         | Spike decisions recorded (OPEN-03, OPEN-11, OPEN-12, OPEN-14, OPEN-27 resolved or consciously deferred with fallback); FF-01/FF-05/FF-10 lint live                                                                                                                                                                                                                                                                                           |
| Ph1 → controlled pilot (pre-GA) | Pilot cohort, purposes, support and stop conditions are approved and bounded; RG-01…RG-09, RG-12, RG-14; restore drill passed; HA failover tested; tenant canary + IDOR suite green; accessibility core audit; incident response staffed (OPEN-39); runbooks for FM top-10 proven; SLOs calibrated. This gate does not authorize GA.                                                                                                         |
| Ph1→Ph2                         | Core-loop SLOs met over observation period; no open Sev-1/2 security defects                                                                                                                                                                                                                                                                                                                                                                 |
| Ph2 → GA                        | End-to-end evidence shows the SSOT loop: goal/gap, learning/practice, proof and verification, discovery/match, application, human interview and outcome, then candidate-controlled new evidence. Consent, permissions, accessibility, audit and failure/recovery ACs are satisfied; no open Sev-1/2 defects; applicable RGs pass. AC/test IDs for the full loop must be registered under OPEN-29 before implementation readiness is claimed. |
| Ph2→Ph3                         | GA gate passed; resilience nightly green; canary pipeline in use; billing reconciliation clean; fairness reporting live                                                                                                                                                                                                                                                                                                                      |
| Ph3→Ph4                         | DR exercise result accepted; institution privacy tests; moderation capacity (OPEN-32)                                                                                                                                                                                                                                                                                                                                                        |
| Every WP                        | DoD-WP + DoD+; INV/FF tests for its scope green (QA-STRAT §9)                                                                                                                                                                                                                                                                                                                                                                                |

### 8. Spike definitions

| Spike             | Question                                                                                                                    | Method                                                                                   | Success criteria                                                 | Output                                               | Fallback                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| WP-FED-SPIKE      | Does MF 2.0 + Vite meet contract (compat, rollback, perf, SRI/signed manifests, SW coexistence, a11y focus on remote swap)? | Prototype matrix: shell × 2 remotes × versions; fault injection; bundled-mode comparison | Δ_F ≤ SLO-17 budget; FED-001/003/005/009 pass; SW update safe    | Decision memo; pinned versions; updated risk entries | `MF_MODE=bundled` (OPEN-03)                          |
| WP-ASSESS-RUNNER  | Build vs buy a no-network code runner; isolation technique feasible within security and cost limits?                        | Threat model + prototype or vendor evaluation                                            | Escape tests fail to escape; cost/latency measured with formulas | Decision (OPEN-27)                                   | Keep code tasks `unverified` / omit code assessments |
| WP-IOS-DEVICE-LAB | What do iOS PWA install, push, storage and background behaviours actually do on supported versions?                         | Scripted tests on real devices                                                           | Verified matrix published; unknowns listed                       | FF-09 matrix; OPEN-12 closed                         | Reduce offline/push promises to what is proven       |

### 9. Work-package Definition of Done

Common DoD-WP is QA-AC §6.4. In addition every WP must: link its stories to AC ids and TEST ids; update OPS-FMEA/runbooks when it adds a dependency; have kill switches where R1/R2; record new unknowns in OPEN_DECISIONS; show an operability review (dashboards, alerts, runbook links) before exit.

### 10. Not in scope for this roadmap

Dates, staffing, budgets, team structure, vendor selection outcomes. Those belong to planning once OPEN-14, OPEN-16, OPEN-19 and OPEN-39 are decided.

## Revision 2 additions (folded 2026-10-27 from `ROADMAP.md#record-roadmap-rev2`)

### 1. What the current roadmap already satisfies (checked against REVW-10 and REVW-11)

| Finding point                                                       | Status in `ROADMAP.md` now                                                                                                                                                 | Evidence                                                                                                                   |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| REVW-11 (i) identity needs email and worker                         | Done                                                                                                                                                                       | WP-IDENTITY-SESSIONS depends on WP-WORKER-OUTBOX and WP-NOTIFY-EMAIL                                                       |
| REVW-11 (ii) apply-core needs consent                               | Done                                                                                                                                                                       | WP-APPLY-CORE depends on WP-PRIVACY-CONSENT                                                                                |
| REVW-11 (iii) referee route needs the shell                         | Done                                                                                                                                                                       | WP-VERIF-REFEREE depends on WP-SHELL-HOST                                                                                  |
| REVW-11 (iv) Phase 1 slot source                                    | Done                                                                                                                                                                       | WP-ENTITLEMENT-BASE (admin comp, free-tier slot, BR-T090/T093); BR-T090 gets the explicit "Phase 1 stub" text in BR-REG-R2 |
| REVW-11 (vi) candidate search needs the consent epoch               | Done                                                                                                                                                                       | WP-SEARCH-BASE depends on WP-PRIVACY-CONSENT                                                                               |
| REVW-11 (vii) AC references that do not exist                       | Done with explicit "AC pending" markers; the criteria themselves are written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` (section 4 below maps them) |
| REVW-10 demote AI gateway, assessments, billing checkout to Phase 2 | Done (AI gateway execution, assessment engine, Stripe checkout are Phase 2; WP-AI-GATEWAY-BASE is Phase 0 and policy-only)                                                 |
| REVW-10 "roadmap authoritative, regenerate capability-map phases"   | Not complete; see `PCAP-01-R2`                                                                                                                                             |
| REVW-34 public API later                                            | Done (WP-INTEGRATIONS-API is Phase 4)                                                                                                                                      |

### 2. Changes this overlay makes

| #   | Change                                                                                                                                                                                  | Reason                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| R1  | New Phase 1 work package **WP-MESSAGING-BASIC** (section 3.1); WP-MESSAGING (Phase 2) narrowed to outreach                                                                              | Binding decision REVW-10 lists basic messaging in Phase 1; the roadmap had no Phase 1 messaging |
| R2  | **WP-FAIRNESS-AUDIT moves from Phase 3 to Phase 2** and depends on WP-ANALYTICS-BASE instead of WP-ANALYTICS (section 3.2)                                                              | REVW-11 (v) and decision: the fairness audit gates public matching launch, Phase 2              |
| R3  | WP-IDENTITY-SESSIONS adds mandatory TOTP for staff and org owners (FEAT-01-07)                                                                                                          | The Phase 1 admin console exists; BR-T044 requires MFA for privileged roles                     |
| R4  | WP-PWA-PLATFORM and WP-APPLY-CORE: Phase 1 offline is a **read cache plus local unsent drafts, with no outbox**; the outbox activates on the ADR-T10 trigger                            | REVW-24 decision                                                                                |
| R5  | Second-phase learning commerce is **first-party courses only**; the third-party paid marketplace is deferred to Phase 3 behind an ADR on seller of record, payouts, tax/VAT and refunds | REVW-30 decision                                                                                |
| R6  | WP-INSTITUTIONS delivers the institution workspace as **MOD-INS**, separate from back-office MOD-ADM                                                                                    | REVW-08 decision                                                                                |
| R7  | New explicit edges and gate text (sections 3 and 5)                                                                                                                                     | Dependency completeness                                                                         |
| R8  | Work-package counts restated (section 6)                                                                                                                                                | The count sentence changes with R1 and R2                                                       |

### 3. Work-package changes

#### 3.1 WP-MESSAGING-BASIC (new, Phase 1)

| Field                         | Content                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope and value               | Application-linked conversations between a candidate and the job's hiring team; block, report and mute (FEAT-13-01, FEAT-13-05). Reports land in the WP-ADMIN-TOOLING queue until WP-MODERATION. No recruiter outreach to non-applicants, no first-contact requests, no quota, no offline compose queue (those stay in WP-MESSAGING) |
| Owner                         | ME                                                                                                                                                                                                                                                                                                                                   |
| Depends on                    | WP-APPLY-CORE, WP-NOTIFY-EMAIL, WP-ADMIN-TOOLING, WP-PRIVACY-CONSENT                                                                                                                                                                                                                                                                 |
| API / data / UI               | `api/messaging` (conversation kind `application` only); MOD-MSG                                                                                                                                                                                                                                                                      |
| Security and failure handling | IDOR-safe (INV-T02); flagged-only moderator visibility; block is bidirectional (BR-T083); message edit window 5 min, delete is a tombstone (BR-T084)                                                                                                                                                                                 |
| Tests / acceptance            | TEST-SEC-006, TEST-MSG-002; AC-13-01-_, AC-13-05-_ (registered)                                                                                                                                                                                                                                                                      |
| DoD+                          | A candidate and a recruiter exchange messages on one application; a block stops delivery; a report reaches an admin                                                                                                                                                                                                                  |

**WP-MESSAGING (Phase 2) after this overlay:** outreach to non-applicants with quota, first-contact requests (SM-FIRSTCONTACT), compose offline queue; depends on WP-MESSAGING-BASIC, WP-PWA-PLATFORM and WP-ENTITLEMENT-BASE.

#### 3.2 WP-FAIRNESS-AUDIT (moved to Phase 2)

| Field                         | Content                                                                                                                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope and value               | Adverse-impact audit job, voluntary self-ID store (audit-only attributes), report to ROLE-AUD, review process. Provides the baseline review that BR-T126 requires before recruiter-facing ranking or public matching is enabled. Dashboards stay with WP-ANALYTICS (Phase 3) |
| Owner                         | DA + SE                                                                                                                                                                                                                                                                      |
| Depends on                    | WP-MATCH-EXPLAIN, WP-ANALYTICS-BASE (was: WP-ANALYTICS)                                                                                                                                                                                                                      |
| Security and failure handling | Strict access; small-cell suppression (k ≥ 5 style rule)                                                                                                                                                                                                                     |
| Tests / acceptance            | TEST-HIR-007; MET-014; BR-T077 process test; flag-default-off test for `matching.recruiter_ranking`                                                                                                                                                                          |
| DoD+                          | Method reviewed with counsel or an advisor (OPEN-08); baseline run recorded; threshold of BR-T077 set                                                                                                                                                                        |

The Phase 2 exit gate in RDM-01 section 7 already lists an adverse-impact job; the dependency now exists in the plan.

#### 3.3 Scope text changes

| WP                   | Text added                                                                                                                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WP-IDENTITY-SESSIONS | "Mandatory TOTP for platform staff and org owners (FEAT-01-07 scope .2); recovery codes."                                                                                                                                                                                                                                        |
| WP-PWA-PLATFORM      | "Phase 1 offline = versioned read cache and local unsent drafts (profile, application draft, message compose, note). The offline write outbox, retry queue and three-way merge activate on the ADR-T10 trigger (telemetry or research shows low-connectivity core use). One expiry and backoff table lives in OFF-01 (REVW-15)." |
| WP-APPLY-CORE        | "'Drafts offline' means a local unsent draft; no queued write. Recruiter read-only access to the application snapshot (DT-01 row 4) is part of this package until WP-ATS-PIPELINE. Re-apply after withdrawal as a linked application (BR-T125, SM-APPLICATION t12)."                                                             |
| WP-BILLING-STRIPE    | "Course purchase covers first-party (platform-sold) courses only. A third-party paid marketplace needs an ADR (seller of record, payouts, instructor identity, tax/VAT, refund-adjusted payouts) and is Phase 3 at the earliest."                                                                                                |
| WP-INSTITUTIONS      | "Institution workspace is the MOD-INS remote or lazy chunk (`/institution/*`); back-office stays MOD-ADM, served behind an authenticated edge rule."                                                                                                                                                                             |
| WP-ADMIN-TOOLING     | "Minimal takedown and revoke actions with reason code and second-person approval (BR-T043, BR-T045); `dispute` referee outcomes and message reports are reviewed here until WP-MODERATION (gaps G1, G2 of PCAP-01-R2)."                                                                                                          |
| WP-ORG-TENANCY       | "Organization verification lifecycle SM-ORG (`verification_state`) and its un-verification effects (BR-T123)."                                                                                                                                                                                                                   |

### 4. Acceptance criteria that were "AC pending" in the roadmap

`MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` registers criteria for these features, which lets the roadmap's markers be replaced once the file is accepted:

| Work package       | Feature                         | New criteria                                                           |
| ------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| WP-POLICY-CORE     | FEAT-01-09                      | AC-01-09-01 … 03                                                       |
| WP-ORG-TENANCY     | FEAT-02-01, FEAT-02-07          | AC-02-01-01 … 05, AC-02-07-01 … 03                                     |
| WP-SKILLS-TAXONOMY | FEAT-04-01, FEAT-04-02          | AC-04-01-01 … 03, AC-04-02-01 … 03                                     |
| WP-WORKER-OUTBOX   | FEAT-24-01, 24-02, 24-09        | AC-24-01-01 … 03, AC-24-02-01 … 03, AC-24-09-01 … 02                   |
| WP-NOTIFY-EMAIL    | FEAT-15-01, 15-03, 15-06, 15-07 | AC-15-01-01 … 02, AC-15-03-01 … 02, AC-15-06-01 … 02, AC-15-07-01 … 03 |
| WP-ADMIN-TOOLING   | FEAT-20-01, 20-03               | AC-20-01-01 … 03, AC-20-03-01 … 02                                     |
| WP-PRIVACY-CONSENT | FEAT-22-06                      | AC-22-06-01 … 02                                                       |
| WP-ANALYTICS-BASE  | FEAT-21-01                      | AC-21-01-01 … 02                                                       |
| WP-AI-GATEWAY-BASE | FEAT-17-01, 17-02, 17-03        | AC-17-01-01 … 02, AC-17-02-01, AC-17-03-01 … 02                        |
| WP-LEARNING-CORE   | FEAT-08-01                      | AC-08-01-01 … 02                                                       |
| Platform plumbing  | FEAT-24-04, 24-05, 24-08, 24-11 | AC-24-04-01 … 02, AC-24-05-01, AC-24-08-01, AC-24-11-01                |
| Phase 2            | FEAT-07-01, 16-01, 19-02, 19-08 | AC-07-01-01, AC-16-01-01, AC-19-02-01, AC-19-08-01                     |

### 5. Dependency edges and gates

**Edges added or confirmed (all acyclic):** WP-MESSAGING-BASIC → {WP-APPLY-CORE, WP-NOTIFY-EMAIL, WP-ADMIN-TOOLING, WP-PRIVACY-CONSENT}; WP-MESSAGING → WP-MESSAGING-BASIC; WP-FAIRNESS-AUDIT → {WP-MATCH-EXPLAIN, WP-ANALYTICS-BASE}; WP-ADMIN-TOOLING → WP-IDENTITY-SESSIONS (staff MFA); WP-VERIF-REFEREE → WP-ADMIN-TOOLING (dispute review, gap G1); WP-ENTITLEMENT-BASE → WP-ADMIN-TOOLING (comp grant UI); WP-MATCH-EXPLAIN → WP-PRIVACY-CONSENT (through WP-SEARCH-BASE, confirmed).

```mermaid
flowchart LR
  ID[WP-IDENTITY-SESSIONS] --> ADM[WP-ADMIN-TOOLING]
  ADM --> VER[WP-VERIF-REFEREE]
  ADM --> ENT[WP-ENTITLEMENT-BASE]
  APP[WP-APPLY-CORE] --> MB[WP-MESSAGING-BASIC]
  NOT[WP-NOTIFY-EMAIL] --> MB
  ADM --> MB
  PRV[WP-PRIVACY-CONSENT] --> MB
  MB --> MSG[WP-MESSAGING Ph2]
  MAT[WP-MATCH-EXPLAIN] --> FAIR[WP-FAIRNESS-AUDIT Ph2]
  ANB[WP-ANALYTICS-BASE] --> FAIR
  FAIR -. gates BR-T126 .-> RANK{{Recruiter ranking and public matching}}
```

**Gate text added to RDM-01 section 7.**

| Gate                   | Addition                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ph1 → controlled pilot | Staff and org-owner TOTP enforced; `dispute` referee outcomes and message reports have a named human review queue                                             |
| Ph2 → GA               | Baseline fairness review recorded by ROLE-AUD (BR-T126) before `matching.recruiter_ranking` is switched on; re-apply and withdrawn-application journey passes |

### 6. Work-package counts

Current `ROADMAP.md`: 60 (Ph0 14, Ph1 22, Ph2 10, Ph3 6, Ph4 5, migration 3). After this overlay: **61** (Ph0 14, **Ph1 23**, **Ph2 11**, **Ph3 5**, Ph4 5, migration 3). Method: count table rows whose first cell starts `WP-` in sections 5.1 to 5.6, apply R1 (+1 in Ph1) and R2 (−1 Ph3, +1 Ph2). Governance regenerates the sentence after acceptance.

### 7. Conflict recorded for the ARB (OPEN-42)

The binding decision for REVW-10 says Phase 1 is Prove → Showcase → Apply with search-based matching and explanation, and demotes learning _depth_. The concurrent roadmap revision, driven by the SSOT loop, keeps a **minimum first-party learning path and practice in Phase 1** (WP-LEARNING-CORE) and makes Phase 1 a pre-GA pilot. This overlay accepts the roadmap as written on that point and treats it as consistent with the decision because depth (instructor studio, richer authoring, assessments, learning paths) is Phase 2. If the ARB reads the decision more strictly, WP-LEARNING-CORE and FEAT-07-05, 07-11, 08-01..04 move to Phase 2 and the Phase 1 gate loses its learning cohort criterion. The decision is the ARB's; both readings are consistent with the rest of this overlay.

### 8. Not decided here

Dates, staffing, budgets, vendor outcomes (RDM-01 section 10 stands). The cost envelope structure (REVW-16) is owned by folder 21.

## Mission-goal ledger G01..G16 (added 2026-10-27)

Reading rules. (1) These are goals of the documentation initiative (the mission), not product work packages; the 60 `WP-*` rows above remain the product roadmap. (2) The wording of G01..G16 is RECONSTRUCTED from `PROJECT_SCOPE.md`, the execution ledgers and the folder layout, because the original mission prompt is not stored in this repository. The owner must confirm or relabel each row against the prompt (OPEN). (3) State vocabulary: `documentation-specified` (text exists, unratified), `partial`, `not started`. No row is `implemented`, `tested` or `verified`: no application code exists on this branch and `tests_executed = 0`. (4) Owners are roles, not named people. (5) Precedence: `ROADMAP.md#record-roadmap-rev2` is a change record already folded into this file (see the banner at the top); where the two differ, this file governs, and `ROADMAP.md#record-roadmap-rev2` is kept, not deleted.

| ID  | Goal                                                                   | Inputs                                                         | Outputs                                                                         | Owner (role)               | Acceptance                                                                                                                             | State                                                                                              | Blockers                                                                                     | Last evidence                                                                         |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| G01 | Preserve all source knowledge without loss                             | `SSOT.md`, `docs/`, `BRAIN/`, `.agents/` (outside this folder) | Manifest CSV (132 rows), ledgers A to D, 31_LEGACY_ARCHIVE                      | Documentation Architect    | Every manifest row reaches a terminal status (MIGRATED_VERIFIED, SUPERSEDED_JUSTIFIED or EXCLUDED_JUSTIFIED) with destination evidence | partial: 0 of 132 rows terminal; 123 `Read but partially processed`, 9 `Out of scope`; 0 deletions | Per-row destination verification not done; denominator disagreement (see manifest Part 66.3) | `KNOWLEDGE_PRESERVATION_MANIFEST.csv` counted 2026-10-27                              |
| G02 | Define vision, users, roles and journeys                               | PRD, SSOT sections 1 to 6                                      | 01, 02 folders                                                                  | Product Director           | Roles and 20 target journeys reviewed with stakeholders                                                                                | documentation-specified; no user research                                                          | OPEN-07, OPEN-44, OPEN-45, OPEN-50                                                           | `USER_JOURNEYS.md`, `STAKEHOLDERS_ROLES_PERMISSIONS.md#record-permission-matrix-rev2` |
| G03 | Define domains, capabilities, features                                 | SSOT section 7 (173 F-ids)                                     | 03, 04, 05 folders (24 DOM, 108 CAP, 253 FEAT)                                  | Domain Architect           | F-to-FEAT crosswalk approved; every P0 feature has ACs                                                                                 | partial: crosswalk is a candidate; 26 features lack ACs                                            | OPEN-41, OPEN-42, OPEN-47                                                                    | `SSOT_FEATURE_CROSSWALK.md`, `COVERAGE_MATRICES.md`                                   |
| G04 | Specify rules, processes, state machines, decision tables              | SSOT section 19, BR registry                                   | 06 folder (BR-T, INV-T, SM, DT, BP)                                             | Business Analyst Lead      | Source rules dispositioned; one state vocabulary                                                                                       | partial: 171 source rules unmatched, 8 conflicts                                                   | OPEN-43, OPEN-45                                                                             | `LEGACY_RULE_CROSSWALK.md`                                                            |
| G05 | Specify UX: screens, actions, navigation, design system, accessibility | SSOT UX patterns                                               | 07 folder (130 screens, 231 actions plus patch ids)                             | UX Lead                    | Action to API map complete; WCAG 2.2 AA checks defined                                                                                 | documentation-specified; accessibility not measured                                                | OPEN-UX-34..36, OPEN-50                                                                      | `ACTION_REGISTRY.md` patch block (2026-10-27)                                         |
| G06 | Specify PWA and offline behaviour                                      | Platform sources                                               | 08 folder                                                                       | Frontend Architect         | Device matrix verified on real iOS and Android                                                                                         | documentation-specified; no device tested                                                          | OPEN-12, OPEN-40                                                                             | `PLATFORM_COMPATIBILITY_MATRIX.md`                                                    |
| G07 | Specify frontend delivery and (optional) federation                    | Frontend sources                                               | 09, 10 folders                                                                  | Frontend Architect         | ADR-T23 ratified; spike passed if federation is pursued                                                                                | documentation-specified; bundled baseline proposed; spike not run                                  | OPEN-03, OPEN-11, OPEN-47, OPEN-P03                                                          | `FEDERATION_ARCHITECTURE.md`                                                          |
| G08 | Specify backend, data model, API and events                            | ARCHITECTURE.md, SSOT section 10 to 14                         | 11, 12, 13 folders; `openapi.yaml`, `asyncapi.yaml`                             | Backend Architect          | Contracts validated by tools; envelope agreed                                                                                          | documentation-specified; lint reported by agents, not rerun in this round                          | OPEN-46, OPEN-52, OPEN-P01, OPEN-X06                                                         | Redocly result recorded in DOCUMENT_STATUS (agent-reported)                           |
| G09 | Specify security, privacy, compliance                                  | Threat sources                                                 | 14 folder                                                                       | Security Architect         | Counsel review of applicability; controls mapped to tests                                                                              | documentation-specified; no counsel review                                                         | OPEN-08, OPEN-48, OPEN-X01..X05                                                              | `SECURITY_ARCHITECTURE.md` R3-1..R3-10                                                |
| G10 | Specify reliability, performance, failure modes                        | SLO hypotheses                                                 | 15 folder                                                                       | SRE Lead                   | SLOs calibrated against measured baselines                                                                                             | documentation-specified; no measurement                                                            | OPEN-15, OPEN-49, OPEN-P02                                                                   | `FAILURE_MODE_ANALYSIS.md` section 10                                                 |
| G11 | Specify QA strategy, test catalogue, traceability                      | Test sources                                                   | 16, 28 folders (214 specified catalogue tests, 125 of 389 ACs directly cited)   | QA Architect               | AC to test coverage reviewed; tests written and run                                                                                    | documentation-specified; tests_executed = 0                                                        | OPEN-P02, OPEN-P04, mechanical-only matrix                                                   | `AC_TEST_TRACEABILITY_MATRIX.md`                                                      |
| G12 | Specify DevOps, operations, support                                    | Ops sources                                                    | 17, 18 folders                                                                  | Platform/SRE Lead          | Hosting decided; on-call and support owners named; restore drill run                                                                   | documentation-specified; hosting undecided                                                         | OPEN-14, OPEN-16, OPEN-39                                                                    | `DEVOPS_AND_RELEASE_STRATEGY.md`                                                      |
| G13 | Specify commercial, analytics, cost                                    | Pricing sources                                                | 19, 20, 21 folders                                                              | Product Director + Finance | Pricing, metrics and cost inputs evidenced                                                                                             | documentation-specified; no price or cost data                                                     | OPEN-05, OPEN-19, OPEN-51                                                                    | `COMMERCIAL_OPERATIONS.md`                                                            |
| G14 | Sequence delivery, migration, risks and decisions                      | All of the above                                               | 22, 23, 24 folders (60 WPs, 56 risks, 52 global open ids plus namespaces, ADRs) | Program Director           | Dates and staffing added by owners; ARB ratifies ADRs                                                                                  | documentation-specified; no dates by design                                                        | OPEN-17, OPEN-42, ARB not convened                                                           | This ledger; `RISK_REGISTER.md`; `OPEN_DECISIONS.md` section 6                        |
| G15 | Independent review and verification of the documents                   | The whole tree                                                 | 27 folder (two review reports, fix status)                                      | Review lead                | Reviewer independent of writers; tools re-run                                                                                          | partial: 2 reviews, same model family; Redocly/AsyncAPI/Mermaid/SQL not rerun by reviewers         | Independence limits recorded in `SECOND_REVIEW_REPORT.md`                                    | `SECOND_REVIEW_REPORT.md`                                                             |
| G16 | Final blueprint, developer guide and cold-start readiness              | All of the above                                               | 29, 99 folders                                                                  | Developer Experience lead  | A new engineer can start from the docs alone (cold-start rehearsal passes)                                                             | partial: rehearsal written, not executed; see `DEVELOPER_IMPLEMENTATION_GUIDE.md` section 6        | Toolchain commands unrun here; env names unconfirmed                                         | Cold-start table (2026-10-27)                                                         |

Honest summary: 0 of 16 goals are complete. 11 are `documentation-specified` (G02, G05, G06, G07, G08, G09, G10, G11, G12, G13, G14) and 5 are `partial` (G01, G03, G04, G15, G16); every goal still has open owner decisions. The ledger states process state only, never product state.

---

<a id="record-roadmap-rev2"></a>

### Preserved source record: ROADMAP_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP_REV2.md -->

<a id="record-roadmap-rev2--implementation-roadmap-revision-2-overlay-rdm-01-rev2"></a>

## Implementation Roadmap, Revision 2 overlay (RDM-01 REV2)

Doc ID: RDM-01-R2 · Owner: Program Director (with Architecture Review Board) · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-10, REVW-11, REVW-24 (roadmap part), REVW-30 (roadmap part), REVW-34 (phases); feeds OPEN-42 and OPEN-29 · Relates: RDM-01, PCAP-01-R2, BR-REG-R2, SM-00-R2, ADR-T10, ADR-T14a

> **Folded into `ROADMAP.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (no original file was edited).** This is an **overlay**, not a copy. It **supersedes, once accepted**, only the work-package rows and sentences of `ROADMAP.md` that section 3 names (WP-MESSAGING, WP-FAIRNESS-AUDIT, and the scope text of WP-IDENTITY-SESSIONS, WP-PWA-PLATFORM, WP-APPLY-CORE, WP-BILLING-STRIPE, WP-INSTITUTIONS), the work-package count sentence, and the "Ph2 → GA" gate (extended). Everything else in RDM-01 stands as the roadmap of record, including the concurrent revision that made bundled delivery the baseline and introduced WP-ENTITLEMENT-BASE, WP-ANALYTICS-BASE and WP-AI-GATEWAY-BASE. Governance should link this file from `00_CONTROL_CENTRE/MASTER_INDEX.md`. This file contains no dates, durations or staffing numbers.

<a id="record-roadmap-rev2--1-what-the-current-roadmap-already-satisfies-checked-against-revw-10-and-revw-11"></a>

### 1. What the current roadmap already satisfies (checked against REVW-10 and REVW-11)

| Finding point                                                       | Status in `ROADMAP.md` now                                                                                                                                                 | Evidence                                                                                                                   |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| REVW-11 (i) identity needs email and worker                         | Done                                                                                                                                                                       | WP-IDENTITY-SESSIONS depends on WP-WORKER-OUTBOX and WP-NOTIFY-EMAIL                                                       |
| REVW-11 (ii) apply-core needs consent                               | Done                                                                                                                                                                       | WP-APPLY-CORE depends on WP-PRIVACY-CONSENT                                                                                |
| REVW-11 (iii) referee route needs the shell                         | Done                                                                                                                                                                       | WP-VERIF-REFEREE depends on WP-SHELL-HOST                                                                                  |
| REVW-11 (iv) Phase 1 slot source                                    | Done                                                                                                                                                                       | WP-ENTITLEMENT-BASE (admin comp, free-tier slot, BR-T090/T093); BR-T090 gets the explicit "Phase 1 stub" text in BR-REG-R2 |
| REVW-11 (vi) candidate search needs the consent epoch               | Done                                                                                                                                                                       | WP-SEARCH-BASE depends on WP-PRIVACY-CONSENT                                                                               |
| REVW-11 (vii) AC references that do not exist                       | Done with explicit "AC pending" markers; the criteria themselves are written in `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` (section 4 below maps them) |
| REVW-10 demote AI gateway, assessments, billing checkout to Phase 2 | Done (AI gateway execution, assessment engine, Stripe checkout are Phase 2; WP-AI-GATEWAY-BASE is Phase 0 and policy-only)                                                 |
| REVW-10 "roadmap authoritative, regenerate capability-map phases"   | Not complete; see `PCAP-01-R2`                                                                                                                                             |
| REVW-34 public API later                                            | Done (WP-INTEGRATIONS-API is Phase 4)                                                                                                                                      |

<a id="record-roadmap-rev2--2-changes-this-overlay-makes"></a>

### 2. Changes this overlay makes

| #   | Change                                                                                                                                                                                  | Reason                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| R1  | New Phase 1 work package **WP-MESSAGING-BASIC** (section 3.1); WP-MESSAGING (Phase 2) narrowed to outreach                                                                              | Binding decision REVW-10 lists basic messaging in Phase 1; the roadmap had no Phase 1 messaging |
| R2  | **WP-FAIRNESS-AUDIT moves from Phase 3 to Phase 2** and depends on WP-ANALYTICS-BASE instead of WP-ANALYTICS (section 3.2)                                                              | REVW-11 (v) and decision: the fairness audit gates public matching launch, Phase 2              |
| R3  | WP-IDENTITY-SESSIONS adds mandatory TOTP for staff and org owners (FEAT-01-07)                                                                                                          | The Phase 1 admin console exists; BR-T044 requires MFA for privileged roles                     |
| R4  | WP-PWA-PLATFORM and WP-APPLY-CORE: Phase 1 offline is a **read cache plus local unsent drafts, with no outbox**; the outbox activates on the ADR-T10 trigger                            | REVW-24 decision                                                                                |
| R5  | Second-phase learning commerce is **first-party courses only**; the third-party paid marketplace is deferred to Phase 3 behind an ADR on seller of record, payouts, tax/VAT and refunds | REVW-30 decision                                                                                |
| R6  | WP-INSTITUTIONS delivers the institution workspace as **MOD-INS**, separate from back-office MOD-ADM                                                                                    | REVW-08 decision                                                                                |
| R7  | New explicit edges and gate text (sections 3 and 5)                                                                                                                                     | Dependency completeness                                                                         |
| R8  | Work-package counts restated (section 6)                                                                                                                                                | The count sentence changes with R1 and R2                                                       |

<a id="record-roadmap-rev2--3-work-package-changes"></a>

### 3. Work-package changes

<a id="record-roadmap-rev2--31-wp-messaging-basic-new-phase-1"></a>

#### 3.1 WP-MESSAGING-BASIC (new, Phase 1)

| Field                         | Content                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope and value               | Application-linked conversations between a candidate and the job's hiring team; block, report and mute (FEAT-13-01, FEAT-13-05). Reports land in the WP-ADMIN-TOOLING queue until WP-MODERATION. No recruiter outreach to non-applicants, no first-contact requests, no quota, no offline compose queue (those stay in WP-MESSAGING) |
| Owner                         | ME                                                                                                                                                                                                                                                                                                                                   |
| Depends on                    | WP-APPLY-CORE, WP-NOTIFY-EMAIL, WP-ADMIN-TOOLING, WP-PRIVACY-CONSENT                                                                                                                                                                                                                                                                 |
| API / data / UI               | `api/messaging` (conversation kind `application` only); MOD-MSG                                                                                                                                                                                                                                                                      |
| Security and failure handling | IDOR-safe (INV-T02); flagged-only moderator visibility; block is bidirectional (BR-T083); message edit window 5 min, delete is a tombstone (BR-T084)                                                                                                                                                                                 |
| Tests / acceptance            | TEST-SEC-006, TEST-MSG-002; AC-13-01-_, AC-13-05-_ (registered)                                                                                                                                                                                                                                                                      |
| DoD+                          | A candidate and a recruiter exchange messages on one application; a block stops delivery; a report reaches an admin                                                                                                                                                                                                                  |

**WP-MESSAGING (Phase 2) after this overlay:** outreach to non-applicants with quota, first-contact requests (SM-FIRSTCONTACT), compose offline queue; depends on WP-MESSAGING-BASIC, WP-PWA-PLATFORM and WP-ENTITLEMENT-BASE.

<a id="record-roadmap-rev2--32-wp-fairness-audit-moved-to-phase-2"></a>

#### 3.2 WP-FAIRNESS-AUDIT (moved to Phase 2)

| Field                         | Content                                                                                                                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope and value               | Adverse-impact audit job, voluntary self-ID store (audit-only attributes), report to ROLE-AUD, review process. Provides the baseline review that BR-T126 requires before recruiter-facing ranking or public matching is enabled. Dashboards stay with WP-ANALYTICS (Phase 3) |
| Owner                         | DA + SE                                                                                                                                                                                                                                                                      |
| Depends on                    | WP-MATCH-EXPLAIN, WP-ANALYTICS-BASE (was: WP-ANALYTICS)                                                                                                                                                                                                                      |
| Security and failure handling | Strict access; small-cell suppression (k ≥ 5 style rule)                                                                                                                                                                                                                     |
| Tests / acceptance            | TEST-HIR-007; MET-014; BR-T077 process test; flag-default-off test for `matching.recruiter_ranking`                                                                                                                                                                          |
| DoD+                          | Method reviewed with counsel or an advisor (OPEN-08); baseline run recorded; threshold of BR-T077 set                                                                                                                                                                        |

The Phase 2 exit gate in RDM-01 section 7 already lists an adverse-impact job; the dependency now exists in the plan.

<a id="record-roadmap-rev2--33-scope-text-changes"></a>

#### 3.3 Scope text changes

| WP                   | Text added                                                                                                                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WP-IDENTITY-SESSIONS | "Mandatory TOTP for platform staff and org owners (FEAT-01-07 scope .2); recovery codes."                                                                                                                                                                                                                                        |
| WP-PWA-PLATFORM      | "Phase 1 offline = versioned read cache and local unsent drafts (profile, application draft, message compose, note). The offline write outbox, retry queue and three-way merge activate on the ADR-T10 trigger (telemetry or research shows low-connectivity core use). One expiry and backoff table lives in OFF-01 (REVW-15)." |
| WP-APPLY-CORE        | "'Drafts offline' means a local unsent draft; no queued write. Recruiter read-only access to the application snapshot (DT-01 row 4) is part of this package until WP-ATS-PIPELINE. Re-apply after withdrawal as a linked application (BR-T125, SM-APPLICATION t12)."                                                             |
| WP-BILLING-STRIPE    | "Course purchase covers first-party (platform-sold) courses only. A third-party paid marketplace needs an ADR (seller of record, payouts, instructor identity, tax/VAT, refund-adjusted payouts) and is Phase 3 at the earliest."                                                                                                |
| WP-INSTITUTIONS      | "Institution workspace is the MOD-INS remote or lazy chunk (`/institution/*`); back-office stays MOD-ADM, served behind an authenticated edge rule."                                                                                                                                                                             |
| WP-ADMIN-TOOLING     | "Minimal takedown and revoke actions with reason code and second-person approval (BR-T043, BR-T045); `dispute` referee outcomes and message reports are reviewed here until WP-MODERATION (gaps G1, G2 of PCAP-01-R2)."                                                                                                          |
| WP-ORG-TENANCY       | "Organization verification lifecycle SM-ORG (`verification_state`) and its un-verification effects (BR-T123)."                                                                                                                                                                                                                   |

<a id="record-roadmap-rev2--4-acceptance-criteria-that-were-ac-pending-in-the-roadmap"></a>

### 4. Acceptance criteria that were "AC pending" in the roadmap

`MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` registers criteria for these features, which lets the roadmap's markers be replaced once the file is accepted:

| Work package       | Feature                         | New criteria                                                           |
| ------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| WP-POLICY-CORE     | FEAT-01-09                      | AC-01-09-01 … 03                                                       |
| WP-ORG-TENANCY     | FEAT-02-01, FEAT-02-07          | AC-02-01-01 … 05, AC-02-07-01 … 03                                     |
| WP-SKILLS-TAXONOMY | FEAT-04-01, FEAT-04-02          | AC-04-01-01 … 03, AC-04-02-01 … 03                                     |
| WP-WORKER-OUTBOX   | FEAT-24-01, 24-02, 24-09        | AC-24-01-01 … 03, AC-24-02-01 … 03, AC-24-09-01 … 02                   |
| WP-NOTIFY-EMAIL    | FEAT-15-01, 15-03, 15-06, 15-07 | AC-15-01-01 … 02, AC-15-03-01 … 02, AC-15-06-01 … 02, AC-15-07-01 … 03 |
| WP-ADMIN-TOOLING   | FEAT-20-01, 20-03               | AC-20-01-01 … 03, AC-20-03-01 … 02                                     |
| WP-PRIVACY-CONSENT | FEAT-22-06                      | AC-22-06-01 … 02                                                       |
| WP-ANALYTICS-BASE  | FEAT-21-01                      | AC-21-01-01 … 02                                                       |
| WP-AI-GATEWAY-BASE | FEAT-17-01, 17-02, 17-03        | AC-17-01-01 … 02, AC-17-02-01, AC-17-03-01 … 02                        |
| WP-LEARNING-CORE   | FEAT-08-01                      | AC-08-01-01 … 02                                                       |
| Platform plumbing  | FEAT-24-04, 24-05, 24-08, 24-11 | AC-24-04-01 … 02, AC-24-05-01, AC-24-08-01, AC-24-11-01                |
| Phase 2            | FEAT-07-01, 16-01, 19-02, 19-08 | AC-07-01-01, AC-16-01-01, AC-19-02-01, AC-19-08-01                     |

<a id="record-roadmap-rev2--5-dependency-edges-and-gates"></a>

### 5. Dependency edges and gates

**Edges added or confirmed (all acyclic):** WP-MESSAGING-BASIC → {WP-APPLY-CORE, WP-NOTIFY-EMAIL, WP-ADMIN-TOOLING, WP-PRIVACY-CONSENT}; WP-MESSAGING → WP-MESSAGING-BASIC; WP-FAIRNESS-AUDIT → {WP-MATCH-EXPLAIN, WP-ANALYTICS-BASE}; WP-ADMIN-TOOLING → WP-IDENTITY-SESSIONS (staff MFA); WP-VERIF-REFEREE → WP-ADMIN-TOOLING (dispute review, gap G1); WP-ENTITLEMENT-BASE → WP-ADMIN-TOOLING (comp grant UI); WP-MATCH-EXPLAIN → WP-PRIVACY-CONSENT (through WP-SEARCH-BASE, confirmed).

```mermaid
flowchart LR
  ID[WP-IDENTITY-SESSIONS] --> ADM[WP-ADMIN-TOOLING]
  ADM --> VER[WP-VERIF-REFEREE]
  ADM --> ENT[WP-ENTITLEMENT-BASE]
  APP[WP-APPLY-CORE] --> MB[WP-MESSAGING-BASIC]
  NOT[WP-NOTIFY-EMAIL] --> MB
  ADM --> MB
  PRV[WP-PRIVACY-CONSENT] --> MB
  MB --> MSG[WP-MESSAGING Ph2]
  MAT[WP-MATCH-EXPLAIN] --> FAIR[WP-FAIRNESS-AUDIT Ph2]
  ANB[WP-ANALYTICS-BASE] --> FAIR
  FAIR -. gates BR-T126 .-> RANK{{Recruiter ranking and public matching}}
```

**Gate text added to RDM-01 section 7.**

| Gate                   | Addition                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ph1 → controlled pilot | Staff and org-owner TOTP enforced; `dispute` referee outcomes and message reports have a named human review queue                                             |
| Ph2 → GA               | Baseline fairness review recorded by ROLE-AUD (BR-T126) before `matching.recruiter_ranking` is switched on; re-apply and withdrawn-application journey passes |

<a id="record-roadmap-rev2--6-work-package-counts"></a>

### 6. Work-package counts

Current `ROADMAP.md`: 60 (Ph0 14, Ph1 22, Ph2 10, Ph3 6, Ph4 5, migration 3). After this overlay: **61** (Ph0 14, **Ph1 23**, **Ph2 11**, **Ph3 5**, Ph4 5, migration 3). Method: count table rows whose first cell starts `WP-` in sections 5.1 to 5.6, apply R1 (+1 in Ph1) and R2 (−1 Ph3, +1 Ph2). Governance regenerates the sentence after acceptance.

<a id="record-roadmap-rev2--7-conflict-recorded-for-the-arb-open-42"></a>

### 7. Conflict recorded for the ARB (OPEN-42)

The binding decision for REVW-10 says Phase 1 is Prove → Showcase → Apply with search-based matching and explanation, and demotes learning _depth_. The concurrent roadmap revision, driven by the SSOT loop, keeps a **minimum first-party learning path and practice in Phase 1** (WP-LEARNING-CORE) and makes Phase 1 a pre-GA pilot. This overlay accepts the roadmap as written on that point and treats it as consistent with the decision because depth (instructor studio, richer authoring, assessments, learning paths) is Phase 2. If the ARB reads the decision more strictly, WP-LEARNING-CORE and FEAT-07-05, 07-11, 08-01..04 move to Phase 2 and the Phase 1 gate loses its learning cohort criterion. The decision is the ARB's; both readings are consistent with the rest of this overlay.

<a id="record-roadmap-rev2--8-not-decided-here"></a>

### 8. Not decided here

Dates, staffing, budgets, vendor outcomes (RDM-01 section 10 stands). The cost envelope structure (REVW-16) is owned by folder 21.

<!-- source-record-end: Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP_REV2.md -->

## Change record: Implementation Roadmap, Revision 2 overlay (RDM-01 REV2)

_Former file: `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP_REV2.md`._

Doc ID: RDM-01-R2 · Owner: Program Director (with Architecture Review Board) · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-10, REVW-11, REVW-24 (roadmap part), REVW-30 (roadmap part), REVW-34 (phases); feeds OPEN-42 and OPEN-29 · Relates: RDM-01, PCAP-01-R2, BR-REG-R2, SM-00-R2, ADR-T10, ADR-T14a

**Relationship (no original file was edited).** This is an **overlay**, not a copy. It **supersedes, once accepted**, only the work-package rows and sentences of `ROADMAP.md` that section 3 names (WP-MESSAGING, WP-FAIRNESS-AUDIT, and the scope text of WP-IDENTITY-SESSIONS, WP-PWA-PLATFORM, WP-APPLY-CORE, WP-BILLING-STRIPE, WP-INSTITUTIONS), the work-package count sentence, and the "Ph2 → GA" gate (extended). Everything else in RDM-01 stands as the roadmap of record, including the concurrent revision that made bundled delivery the baseline and introduced WP-ENTITLEMENT-BASE, WP-ANALYTICS-BASE and WP-AI-GATEWAY-BASE. Governance should link this file from `00_CONTROL_CENTRE/MASTER_INDEX.md`. This file contains no dates, durations or staffing numbers.

### 1. What the current roadmap already satisfies (checked against REVW-10 and REVW-11)

| Finding point                                                       | Status in `ROADMAP.md` now                                                                                                                      | Evidence                                                                                                                   |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| REVW-11 (i) identity needs email and worker                         | Done                                                                                                                                            | WP-IDENTITY-SESSIONS depends on WP-WORKER-OUTBOX and WP-NOTIFY-EMAIL                                                       |
| REVW-11 (ii) apply-core needs consent                               | Done                                                                                                                                            | WP-APPLY-CORE depends on WP-PRIVACY-CONSENT                                                                                |
| REVW-11 (iii) referee route needs the shell                         | Done                                                                                                                                            | WP-VERIF-REFEREE depends on WP-SHELL-HOST                                                                                  |
| REVW-11 (iv) Phase 1 slot source                                    | Done                                                                                                                                            | WP-ENTITLEMENT-BASE (admin comp, free-tier slot, BR-T090/T093); BR-T090 gets the explicit "Phase 1 stub" text in BR-REG-R2 |
| REVW-11 (vi) candidate search needs the consent epoch               | Done                                                                                                                                            | WP-SEARCH-BASE depends on WP-PRIVACY-CONSENT                                                                               |
| REVW-11 (vii) AC references that do not exist                       | Done with explicit "AC pending" markers; the criteria themselves are written in `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` (section 4 below maps them) |
| REVW-10 demote AI gateway, assessments, billing checkout to Phase 2 | Done (AI gateway execution, assessment engine, Stripe checkout are Phase 2; WP-AI-GATEWAY-BASE is Phase 0 and policy-only)                      |
| REVW-10 "roadmap authoritative, regenerate capability-map phases"   | Not complete; see `PCAP-01-R2`                                                                                                                  |
| REVW-34 public API later                                            | Done (WP-INTEGRATIONS-API is Phase 4)                                                                                                           |

### 2. Changes this overlay makes

| #   | Change                                                                                                                                                                                  | Reason                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| R1  | New Phase 1 work package **WP-MESSAGING-BASIC** (section 3.1); WP-MESSAGING (Phase 2) narrowed to outreach                                                                              | Binding decision REVW-10 lists basic messaging in Phase 1; the roadmap had no Phase 1 messaging |
| R2  | **WP-FAIRNESS-AUDIT moves from Phase 3 to Phase 2** and depends on WP-ANALYTICS-BASE instead of WP-ANALYTICS (section 3.2)                                                              | REVW-11 (v) and decision: the fairness audit gates public matching launch, Phase 2              |
| R3  | WP-IDENTITY-SESSIONS adds mandatory TOTP for staff and org owners (FEAT-01-07)                                                                                                          | The Phase 1 admin console exists; BR-T044 requires MFA for privileged roles                     |
| R4  | WP-PWA-PLATFORM and WP-APPLY-CORE: Phase 1 offline is a **read cache plus local unsent drafts, with no outbox**; the outbox activates on the ADR-T10 trigger                            | REVW-24 decision                                                                                |
| R5  | Second-phase learning commerce is **first-party courses only**; the third-party paid marketplace is deferred to Phase 3 behind an ADR on seller of record, payouts, tax/VAT and refunds | REVW-30 decision                                                                                |
| R6  | WP-INSTITUTIONS delivers the institution workspace as **MOD-INS**, separate from back-office MOD-ADM                                                                                    | REVW-08 decision                                                                                |
| R7  | New explicit edges and gate text (sections 3 and 5)                                                                                                                                     | Dependency completeness                                                                         |
| R8  | Work-package counts restated (section 6)                                                                                                                                                | The count sentence changes with R1 and R2                                                       |

### 3. Work-package changes

#### 3.1 WP-MESSAGING-BASIC (new, Phase 1)

| Field                         | Content                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope and value               | Application-linked conversations between a candidate and the job's hiring team; block, report and mute (FEAT-13-01, FEAT-13-05). Reports land in the WP-ADMIN-TOOLING queue until WP-MODERATION. No recruiter outreach to non-applicants, no first-contact requests, no quota, no offline compose queue (those stay in WP-MESSAGING) |
| Owner                         | ME                                                                                                                                                                                                                                                                                                                                   |
| Depends on                    | WP-APPLY-CORE, WP-NOTIFY-EMAIL, WP-ADMIN-TOOLING, WP-PRIVACY-CONSENT                                                                                                                                                                                                                                                                 |
| API / data / UI               | `api/messaging` (conversation kind `application` only); MOD-MSG                                                                                                                                                                                                                                                                      |
| Security and failure handling | IDOR-safe (INV-T02); flagged-only moderator visibility; block is bidirectional (BR-T083); message edit window 5 min, delete is a tombstone (BR-T084)                                                                                                                                                                                 |
| Tests / acceptance            | TEST-SEC-006, TEST-MSG-002; AC-13-01-_, AC-13-05-_ (registered)                                                                                                                                                                                                                                                                      |
| DoD+                          | A candidate and a recruiter exchange messages on one application; a block stops delivery; a report reaches an admin                                                                                                                                                                                                                  |

**WP-MESSAGING (Phase 2) after this overlay:** outreach to non-applicants with quota, first-contact requests (SM-FIRSTCONTACT), compose offline queue; depends on WP-MESSAGING-BASIC, WP-PWA-PLATFORM and WP-ENTITLEMENT-BASE.

#### 3.2 WP-FAIRNESS-AUDIT (moved to Phase 2)

| Field                         | Content                                                                                                                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope and value               | Adverse-impact audit job, voluntary self-ID store (audit-only attributes), report to ROLE-AUD, review process. Provides the baseline review that BR-T126 requires before recruiter-facing ranking or public matching is enabled. Dashboards stay with WP-ANALYTICS (Phase 3) |
| Owner                         | DA + SE                                                                                                                                                                                                                                                                      |
| Depends on                    | WP-MATCH-EXPLAIN, WP-ANALYTICS-BASE (was: WP-ANALYTICS)                                                                                                                                                                                                                      |
| Security and failure handling | Strict access; small-cell suppression (k ≥ 5 style rule)                                                                                                                                                                                                                     |
| Tests / acceptance            | TEST-HIR-007; MET-014; BR-T077 process test; flag-default-off test for `matching.recruiter_ranking`                                                                                                                                                                          |
| DoD+                          | Method reviewed with counsel or an advisor (OPEN-08); baseline run recorded; threshold of BR-T077 set                                                                                                                                                                        |

The Phase 2 exit gate in RDM-01 section 7 already lists an adverse-impact job; the dependency now exists in the plan.

#### 3.3 Scope text changes

| WP                   | Text added                                                                                                                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WP-IDENTITY-SESSIONS | "Mandatory TOTP for platform staff and org owners (FEAT-01-07 scope .2); recovery codes."                                                                                                                                                                                                                                        |
| WP-PWA-PLATFORM      | "Phase 1 offline = versioned read cache and local unsent drafts (profile, application draft, message compose, note). The offline write outbox, retry queue and three-way merge activate on the ADR-T10 trigger (telemetry or research shows low-connectivity core use). One expiry and backoff table lives in OFF-01 (REVW-15)." |
| WP-APPLY-CORE        | "'Drafts offline' means a local unsent draft; no queued write. Recruiter read-only access to the application snapshot (DT-01 row 4) is part of this package until WP-ATS-PIPELINE. Re-apply after withdrawal as a linked application (BR-T125, SM-APPLICATION t12)."                                                             |
| WP-BILLING-STRIPE    | "Course purchase covers first-party (platform-sold) courses only. A third-party paid marketplace needs an ADR (seller of record, payouts, instructor identity, tax/VAT, refund-adjusted payouts) and is Phase 3 at the earliest."                                                                                                |
| WP-INSTITUTIONS      | "Institution workspace is the MOD-INS remote or lazy chunk (`/institution/*`); back-office stays MOD-ADM, served behind an authenticated edge rule."                                                                                                                                                                             |
| WP-ADMIN-TOOLING     | "Minimal takedown and revoke actions with reason code and second-person approval (BR-T043, BR-T045); `dispute` referee outcomes and message reports are reviewed here until WP-MODERATION (gaps G1, G2 of PCAP-01-R2)."                                                                                                          |
| WP-ORG-TENANCY       | "Organization verification lifecycle SM-ORG (`verification_state`) and its un-verification effects (BR-T123)."                                                                                                                                                                                                                   |

### 4. Acceptance criteria that were "AC pending" in the roadmap

`SPEC_ACCEPTANCE_ADDITIONS_REV2.md` registers criteria for these features, which lets the roadmap's markers be replaced once the file is accepted:

| Work package       | Feature                         | New criteria                                                           |
| ------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| WP-POLICY-CORE     | FEAT-01-09                      | AC-01-09-01 … 03                                                       |
| WP-ORG-TENANCY     | FEAT-02-01, FEAT-02-07          | AC-02-01-01 … 05, AC-02-07-01 … 03                                     |
| WP-SKILLS-TAXONOMY | FEAT-04-01, FEAT-04-02          | AC-04-01-01 … 03, AC-04-02-01 … 03                                     |
| WP-WORKER-OUTBOX   | FEAT-24-01, 24-02, 24-09        | AC-24-01-01 … 03, AC-24-02-01 … 03, AC-24-09-01 … 02                   |
| WP-NOTIFY-EMAIL    | FEAT-15-01, 15-03, 15-06, 15-07 | AC-15-01-01 … 02, AC-15-03-01 … 02, AC-15-06-01 … 02, AC-15-07-01 … 03 |
| WP-ADMIN-TOOLING   | FEAT-20-01, 20-03               | AC-20-01-01 … 03, AC-20-03-01 … 02                                     |
| WP-PRIVACY-CONSENT | FEAT-22-06                      | AC-22-06-01 … 02                                                       |
| WP-ANALYTICS-BASE  | FEAT-21-01                      | AC-21-01-01 … 02                                                       |
| WP-AI-GATEWAY-BASE | FEAT-17-01, 17-02, 17-03        | AC-17-01-01 … 02, AC-17-02-01, AC-17-03-01 … 02                        |
| WP-LEARNING-CORE   | FEAT-08-01                      | AC-08-01-01 … 02                                                       |
| Platform plumbing  | FEAT-24-04, 24-05, 24-08, 24-11 | AC-24-04-01 … 02, AC-24-05-01, AC-24-08-01, AC-24-11-01                |
| Phase 2            | FEAT-07-01, 16-01, 19-02, 19-08 | AC-07-01-01, AC-16-01-01, AC-19-02-01, AC-19-08-01                     |

### 5. Dependency edges and gates

**Edges added or confirmed (all acyclic):** WP-MESSAGING-BASIC → {WP-APPLY-CORE, WP-NOTIFY-EMAIL, WP-ADMIN-TOOLING, WP-PRIVACY-CONSENT}; WP-MESSAGING → WP-MESSAGING-BASIC; WP-FAIRNESS-AUDIT → {WP-MATCH-EXPLAIN, WP-ANALYTICS-BASE}; WP-ADMIN-TOOLING → WP-IDENTITY-SESSIONS (staff MFA); WP-VERIF-REFEREE → WP-ADMIN-TOOLING (dispute review, gap G1); WP-ENTITLEMENT-BASE → WP-ADMIN-TOOLING (comp grant UI); WP-MATCH-EXPLAIN → WP-PRIVACY-CONSENT (through WP-SEARCH-BASE, confirmed).

```mermaid
flowchart LR
  ID[WP-IDENTITY-SESSIONS] --> ADM[WP-ADMIN-TOOLING]
  ADM --> VER[WP-VERIF-REFEREE]
  ADM --> ENT[WP-ENTITLEMENT-BASE]
  APP[WP-APPLY-CORE] --> MB[WP-MESSAGING-BASIC]
  NOT[WP-NOTIFY-EMAIL] --> MB
  ADM --> MB
  PRV[WP-PRIVACY-CONSENT] --> MB
  MB --> MSG[WP-MESSAGING Ph2]
  MAT[WP-MATCH-EXPLAIN] --> FAIR[WP-FAIRNESS-AUDIT Ph2]
  ANB[WP-ANALYTICS-BASE] --> FAIR
  FAIR -. gates BR-T126 .-> RANK{{Recruiter ranking and public matching}}
```

**Gate text added to RDM-01 section 7.**

| Gate                   | Addition                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ph1 → controlled pilot | Staff and org-owner TOTP enforced; `dispute` referee outcomes and message reports have a named human review queue                                             |
| Ph2 → GA               | Baseline fairness review recorded by ROLE-AUD (BR-T126) before `matching.recruiter_ranking` is switched on; re-apply and withdrawn-application journey passes |

### 6. Work-package counts

Current `ROADMAP.md`: 60 (Ph0 14, Ph1 22, Ph2 10, Ph3 6, Ph4 5, migration 3). After this overlay: **61** (Ph0 14, **Ph1 23**, **Ph2 11**, **Ph3 5**, Ph4 5, migration 3). Method: count table rows whose first cell starts `WP-` in sections 5.1 to 5.6, apply R1 (+1 in Ph1) and R2 (−1 Ph3, +1 Ph2). Governance regenerates the sentence after acceptance.

### 7. Conflict recorded for the ARB (OPEN-42)

The binding decision for REVW-10 says Phase 1 is Prove → Showcase → Apply with search-based matching and explanation, and demotes learning _depth_. The concurrent roadmap revision, driven by the SSOT loop, keeps a **minimum first-party learning path and practice in Phase 1** (WP-LEARNING-CORE) and makes Phase 1 a pre-GA pilot. This overlay accepts the roadmap as written on that point and treats it as consistent with the decision because depth (instructor studio, richer authoring, assessments, learning paths) is Phase 2. If the ARB reads the decision more strictly, WP-LEARNING-CORE and FEAT-07-05, 07-11, 08-01..04 move to Phase 2 and the Phase 1 gate loses its learning cohort criterion. The decision is the ARB's; both readings are consistent with the rest of this overlay.

### 8. Not decided here

Dates, staffing, budgets, vendor outcomes (RDM-01 section 10 stands). The cost envelope structure (REVW-16) is owned by folder 21.

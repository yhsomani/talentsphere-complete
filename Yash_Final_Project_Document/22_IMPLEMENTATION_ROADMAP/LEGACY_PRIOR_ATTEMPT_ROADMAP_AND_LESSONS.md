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

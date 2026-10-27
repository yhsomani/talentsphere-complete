# 01 - Product Requirements

> **Reference only — prior attempt.** This file analyses an EARLIER implementation attempt. For this project nothing is assumed implemented: labels such as `Implemented-verified` describe what the prior attempt's code reportedly did, not the state of this project. Target design lives in `Yash_Final_Project_Document/` folders 00-29; founder intent is the root `SSOT.md`.

Canonical home for: vision, users and roles, scope and non-goals, product principles, business-rule summary, functional and non-functional requirements, constraints.
Not here: architecture ([02](02-ARCHITECTURE.md)), setup and conventions ([03](03-DEVELOPMENT-GUIDE.md)), per-feature behaviour and workflows ([04](04-FEATURES-AND-WORKFLOWS.md)), schema and API ([05](05-DATABASE-AND-API.md)), security and integrations ([06](06-SECURITY-AND-INTEGRATIONS.md)), tests and operations ([07](07-TESTING-AND-OPERATIONS.md)), outstanding work, ADRs and conflicts ([08](08-ROADMAP-AND-DECISIONS.md)).

As-of 2026-10-26, branch `docs/consolidation-2026-10-26`, 55 SQL migrations in `supabase/migrations` (00001-00055). Plans and prices: [docs/PRICING.md](../31_LEGACY_ARCHIVE/docs/PRICING.md) is the only home for the plan table (a unit test reads it at runtime); this file links to it and does not copy it.

## 0. How to read this file

### 0.1 Status labels (single definition for the whole set)

Other files in this set reference this table. Where 02/04/05 say "read in source, not executed" the equivalent label here is Implemented-unverified; Implemented-verified always requires a recorded pass (never source reading alone). 03/06/07/08 use their own work-status words (Verified-by-config, Confirmed, OPEN/FIXED-SRC); they map to these labels only when they cite a recorded test or runtime result.

| Label | Meaning |
|---|---|
| Implemented-verified | Source plus automated tests plus a recorded PostgreSQL and/or browser pass. Always a dated, scoped claim; nothing was re-run when this file was written. No whole feature is certified (see 0.3). |
| Implemented-unverified | Source and unit/integration tests exist; no PG, browser, live-provider or deployment evidence. |
| Partial | A subset of the contract exists (API without UI, UI without durability, or missing sub-requirements). |
| Planned-approved | Stated in `SSOT.md` (founder-authored canonical intent) or a ratified founder amendment; not built. |
| Proposed-only | Appears only in the target blueprint `Yash_Final_Project_Document/` or in an audit plan not ratified by the owner (X-xx work, Stages A-F, OPEN-xx). Never treat as requirement or as built. |
| Deprecated | Registry says deprecated or not recommended. |
| Unknown | Sources conflict or no evidence was found. |

### 0.2 Authority order

1. What exists: code, migrations, tests (`apps/`, `packages/`, `supabase/migrations`, `tests/`), then root `ARCHITECTURE.md`. Dated reports never override newer source.
2. What is intended: `SSOT.md` v6.0, then PRD, TRD, registries.
3. Proposals: `Yash_Final_Project_Document/` (target blueprint, revision-required) and audit plans. History: dated reports, `BRAIN/MEMORY.md`.

Rule carried from SSOT: documented is not implemented, implemented is not verified, verified is not production-ready. A feature is "implemented" only on current executable evidence.

### 0.3 Evidence base (all dated, none re-run here)

| Snapshot | Result | Source |
|---|---|---|
| 2026-10-21 audit (source `a771a87b`) | 1,172 Vitest tests / 115 files pass (memory mode); 10 TS projects typecheck; lint red on 7 files; no PG, browser, live-email, deploy, restore run. Provisional feature maturity: 6 implemented-unverified, 87 partial, 1 broken, 75 not implemented, 4 deprecated; zero whole features certified | `docs/reports/FEATURE_STATUS_2026-10-21.md` |
| 2026-10-22 audit (`83dc7d24`) | 1,143 tests / 112 files; claims 26 Full / 91 Partial / 6 Stub / 50 Missing | `AUDIT_MASTER_REPORT.md`, `FEATURE_TRACEABILITY_MATRIX.md`, `BRAIN/MEMORY.md` |
| 2026-10-23 CI (main `0f40b6c9`, from re-audit) | 1,231 Vitest / 117 files; 50 PG tests / 11 files; Playwright 235 of 236 pass (1 flaky navigation case); local migrations 00001-00052 apply | `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` |

Current tree: 13 PG test files under `tests/pg` (the 10-23 CI figure of 11 files is older). The count sets are incompatible by method (the 10-22 "Full" label counted DB+API+UI+tests; the 10-21 label demanded semantic acceptance). Both are kept; neither is a release certificate. Conflict K-01 in [08](08-ROADMAP-AND-DECISIONS.md).

## 1. Product definition and vision

| Item | Statement | Source | Status |
|---|---|---|---|
| Product | PWA-first Career Operating System on a Talent Graph plus Evidence Graph. "OS" describes breadth of career workflow, not kernel or device functionality | SSOT 1, 4.1; PRD 1 | Planned-approved (concept); Partial (built) |
| Vision | Make career growth transparent, verifiable, accessible: Learn - Prove - Showcase - Match - Apply - Hire - Grow as one loop | SSOT 2.1 | Planned-approved |
| Durable asset | The evidence-backed career graph (capability, proof, learning, experience, opportunities, outcomes), under user control, explainable, private | SSOT 1 | Planned-approved |
| Mental model | A career evidence system, not a job board, learning site, social network or AI wrapper. Claim is not evidence; evidence is not verification; reputation is context; AI does not own truth | BRAIN.md 1-6 | Planned-approved |
| Product class | Combines learning, networking, employer insight, assessment and institutional career systems; independent of external platforms (LinkedIn is optional import/syndication only) | SSOT 2.2 | Planned-approved |
| Core loop (SSOT/PRD) | Goal - Gap - Learn - Practice - Prove - Verify - Discover - Match - Apply - Interview - Outcome - New Evidence - Next action | SSOT 1, B; PRD 1 | Planned-approved; built subset only (see 6.1) |
| Built core loop | Candidate sign-up - profile - work history - proof of control (corporate-email code, referee link) - apply; recruiter org - post job - review pipeline - messaging/notifications | `ARCHITECTURE.md`, ADR-015, RELEASE_SCOPE doc | Implemented-verified (scoped, dated CI 2026-10-23); live email/deploy unverified |
| Target-blueprint loop | Same seven-stage loop; verified career-evidence platform; matching explainable, never pay-to-rank | Blueprint MASTER 1, ADR-T01/T22 | Proposed-only |

### 1.1 Problem and value proposition

Career information is fragmented across profiles, learning, job boards, assessments, portfolios and employer workflows; users restate the same experience as unsupported claims (PRD 2). Hiring runs on claims that are costly to check (blueprint STR-01). Promise: "a coherent evidence-backed career loop where every meaningful action can improve future career decisions", not "more features" (PRD 5).

### 1.2 Goals

| Source | Goals |
|---|---|
| PRD 6 | (1) trusted career identity; (2) activity becomes attributable evidence; (3) learning connects to opportunities; (4) explainable matching; (5) application outcomes close the loop; (6) privacy and human control preserved |
| Blueprint GOAL-01..08 (Proposed-only) | GOAL-01 graded auditable evidence; 02 faster trustworthy screening; 03 explainable and fair matching; 04 learning converts to evidence/outcomes; 05 institutions graduate learners into the loop; 06 secure, private, accessible; 07 sustainable business; 08 graceful degradation. REV2 replaces measure cells: targets are design targets, "passes" legal/audit wording retired, values OPEN until a pilot baseline (PRODUCT_VISION_GOALS_REV2) |

### 1.3 Flywheels (SSOT 2.3)

Career (learn - prove - showcase - match - apply - hire - grow); Evidence (more valid evidence - stronger matching - better outcomes); B2B2C (institution-managed learning - verified signals - independent identity - outcomes); Content/community (publish - engagement - reputation - discovery). Status: Planned-approved; B2B2C, content and community flywheels have no built code (F-40..F-47 partial/absent, F-53..F-57 absent).

### 1.4 Success metrics

| Metric class | Definition | Status |
|---|---|---|
| Primary outcome | "Verifiable Career Progress" (PRD 9; SSOT 2.4 "career progress with verifiable evidence") | Planned-approved. Conflict: blueprint names "Evidence-Backed Hiring Conversations" (OPEN-51). No baseline exists |
| Supporting | Activation, goal creation, skill coverage, evidence created/verified, learning completion, assessment improvement, qualified applications, interviews, offers, hires, outcome feedback, retention | Planned-approved; instrumentation partial (F-19 analytics API, no UI) |
| Business | Paid conversion, recurring revenue, gross margin, infrastructure and AI cost per capability, enterprise expansion, support burden | Planned-approved; no data (no revenue/cost metrics supplied to any audit) |
| Ratio targets | OD-01 workspace metric "active learners"; FC-07 candidate:employer ratio target | Unknown - FC values not defined in the files read (K-22 in file 08) |

### 1.5 Segments and monetisation intent

| Segment | Payer | Intent | Source | Status |
|---|---|---|---|---|
| Candidates / learners | Free core; optional paid tools | Core evidence, applying and messaging stay free | blueprint STR-01 5; SSOT principle 9 "monetization follows value" | Core free: Implemented (no paywall on core). Candidate Pro plan exists in code (see PRICING) but SSOT F-61 / OD-34 "Premium Candidate" is decision-gated, price TBD: conflict K-12 |
| Employers | Subscription per org/seat, job slots | BR-07 billing actions for recruiters; BR-130 outreach caps by tier | SSOT BR-07, BR-130 | Partial: Stripe Checkout/Portal/webhook exist, default `BILLING_MODE=disabled`, live billing unverified |
| Institutions | Seat licence | Volume-tier per seat (OD-15), license pools (BR-072..082) | SSOT OD-15 | Planned-approved; not built (F-41 absent) |
| Instructors | Revenue share 70/30 default (OD-28, BR-101) | Course commerce | SSOT | Planned-approved; not built (F-73 absent) |
| Rule | No plan may buy credibility, hiring rank, assessment bypass or private evidence | `validateMonetizationIntegrity` (SSOT 64); BR-187 / BR-126 labelling | Implemented-verified (unit test per PRICING.md) |

## 2. Users, roles and permissions

### 2.1 Actor groups (SSOT 5; PRD 3)

Candidate/learner, career switcher, professional, recruiter, hiring manager, employer admin, instructor/course author, institution admin/faculty/proctor, mentor/expert, moderator, verification staff, support, finance, platform admin, service account. Blueprint adds referee (no account, single-use token), auditor, viewer, org owner.

### 2.2 Role models in circulation (conflict K-05)

| Model | Content | Status |
|---|---|---|
| SSOT two-tier (SSOT 6.1) | Tier 1 JWT roles `ROLE_USER`, `ROLE_RECRUITER`, `ROLE_ADMIN` (Supabase Auth). Tier 2: 24 workspace-scoped contextual roles: Candidate, Recruiter, Hiring Manager, Interviewer, Org Admin, Agency Recruiter, Finance Admin, Support Agent, Moderator, Platform Admin, Service Account, Instructor, Mentor, Course Author, Institution Admin, Department Admin, Faculty/Proctor, Managed Learner, Billing/Procurement Manager, Student, Peer Reviewer, Contest Participant, Content Author, Company Reviewer. Resolution highest-wins: `ROLE_ADMIN` audited override - workspace grants - `ROLE_RECRUITER` (needs `org_id` membership) - `ROLE_USER` | Planned-approved; not built as specified |
| Built (`packages/domain/src/core.ts`) | `Role` union of 10: candidate, recruiter, hiring_manager, course_author, instructor, institution_admin, platform_admin, moderator, verification_staff, service_account. Self-registration accepts only candidate or recruiter. Every request re-reads account roles/status; signed role snapshots do not override. Several organization actions accept any membership regardless of org role (policy gap CF-14) | Implemented-unverified; Partial vs SSOT |
| Blueprint scoped grants (USR-01, REV2) | Grant = (principal, role, scope in platform/org/institution/self), deny by default, matrix derived from DT-01; consent-gated evidence reads; time-boxed audited staff access; referee = token not role; `GET /me/capabilities` | Proposed-only (OPEN-44) |

### 2.3 Authorization rules (SSOT 5, 7.2; BR-01..09)

- Chain: identity - role - permission - resource ownership - tenant/workspace - purpose/context - policy decision. Never trust client-supplied role, tenant or ownership ids.
- Boundary principles: no cross-user mutation without consent or legal basis; recruiter access is application-scoped; moderation escalations quorum-based; faculty scoped to assigned batches; managed learners cannot self-enrol outside the license pool or apply pre-graduation; peer review double-blind; anonymous company reviews hide identity from employer/public but never from Platform Admin/legal; instructors cannot review or rate their own courses.
- Master permission matrix (SSOT 7.1): 12 capabilities x 10 roles (publish own course, approve for marketplace, grade, peer-review, create posts, moderate UGC, company review, salary report, contests, coupons, instructor earnings, refunds). Planned-approved; only the recruiter/candidate job-and-application subset is built.
- Built enforcement: per-handler resource authorization (INVARIANT-001/014 in `ARCHITECTURE.md`); route-by-route review in `docs/system-model/06-route-authorization.md`; no global auth middleware.

### 2.4 Personas and lifecycles

| Persona set | Content | Status |
|---|---|---|
| SSOT P-A..P-T (19) | Aisha early-career candidate (J-01,02); Rohan mid-career switcher (J-01,06); Priya startup recruiter (J-03); Dev platform admin (WF-08); Elena and Sara hiring managers (J-03,27); Farid agency recruiter (J-10); Grace course creator (J-07,18); Hugo mentor (J-08); Ivy institutional partner (J-09); Dr. Rao department head (J-14,15); Meera faculty/proctor (J-15); Tomas corporate L&D (J-16); Sam self-paced learner (J-19); Nina content creator (J-23); Omar job researcher (J-22); Quinn competitive programmer (J-21); Ravi career switcher (J-26); Tara skills analyst (J-16,28) | Planned-approved; not research-validated |
| Blueprint P1-P5 | Asha career-switcher, Marcus recruiter, Dr. Lin faculty, Priya referee, Sam support operator - hypothetical, no user research (OPEN-07) | Proposed-only |

Lifecycles (SSOT 6.4): account REGISTERED - UNVERIFIED - VERIFIED - ACTIVE <-> SUSPENDED - DEACTIVATED - DELETED or TERMINATED (built `UserStatus`: active, suspended, pending_verification, deactivated; no `banned`, CF-19); managed learner provisioned - invited - claimed - active_managed - graduation_pending - independent or revoked - archived; instructor applicant - under_review - approved - active <-> suspended - retired; course draft - submitted - under_review - approved - published - updating - archived/unpublished; contest draft - scheduled - registration_open - active - ended - results_published - archived. All Planned-approved except the account subset. 53 state machines are indexed in SSOT 18 (home: [04](04-FEATURES-AND-WORKFLOWS.md)).

## 3. Scope, non-goals and gates

### 3.1 Scope guardrails

| Rule | Source |
|---|---|
| Browser/PWA career platform; not a general OS | SSOT 4.1 |
| GA proves the trusted career loop first; the 173-feature portfolio is a capability inventory, not the GA target. Marketplace, OS-like capabilities, broad social parity, proctoring and advanced enterprise stay staged | SSOT B; PRD 8; FEATURE_REGISTRY portfolio rule |
| External platforms are adapters or import sources only; TalentSphere stores its own canonical state | SSOT 4.3; MIG-01..08 |
| Complexity discipline: modular monolith first; search, cache, service extraction only on measured need | SSOT A; TRD 4 |

### 3.2 Non-goals

Sales-prospecting suite; self-serve ad network; general-purpose or non-career marketplace; social-media clone; generic HR/payroll; autonomous hiring engine; guaranteed jobs or salary outcomes; opaque pay-to-rank hiring; ungoverned autonomous AI; unnecessary realtime/live-streaming; hardware/OS platform; mandatory dependence on LinkedIn, Udemy, Coursera, Glassdoor or HackerRank (SSOT 4.2, 3.3; PRD 7). Blueprint adds: generic workflow engine, CRM, crypto credentials, native apps at launch (DOM coverage table).

### 3.3 Exclusions and decision gates

| Item | Disposition | Decision ref | Built reality |
|---|---|---|---|
| Crypto/token products, blockchain credentials | Excluded | SSOT 3.3 | none |
| Autonomous consequential AI; AI hire/reject/disqualify; emotion analysis; predictive performance scoring; resume fabrication; AI grading peer reviews; AI deciding refunds; AI auto-publishing courses | Prohibited, zero tolerance | SSOT 32.1-32.2 | AI is a local heuristic, no remote model |
| Candidate-level predictive/automated hiring decisions (F-154 Interview Prediction, F-168 Hiring Prediction) | Excluded from GA unless separate governance, validation, fairness, human-control and legal review admits it; descriptive benchmarking allowed | SSOT E | Not implemented |
| Proctoring (F-45) | Vendor-gated | OD-35 | Interview fields only; no vendor |
| Premium Candidate tier (F-61) | Decision-gated, price TBD | OD-34 | Candidate Pro plan coded in `billing.ts` (conflict K-12) |
| Sponsored content (F-62) | Not recommended / deprecated | OD-32 | none |
| Business-development graph (F-63) | Not recommended / deprecated | OD-31 (SCOPE-003) | none |
| Legacy chat service (F-38), unified backend stub (F-39) | Deprecated | registry | none |
| Native apps as prerequisite; unrestricted hardware integration | Excluded | SSOT 3.3 | PWA only |
| Live video | Defer, vendor evaluation | OD-33 | Interview rooms API only (F-33 partial) |
| White-label, enterprise API pricing | Co-branded first (OD-20); API enterprise-only (OD-53) | OD-20, OD-53 | none |
| Government ID verification (F-81), federation | Optional / vendor-gated; federation not adopted | OD (blueprint OPEN-10, ADR-T23) | Partial/Proposed-only |

## 4. Product principles and invariants

### 4.1 Principles (SSOT 3.1; PRD 10)

1 Verified over claimed. 2 Candidate dignity first. 3 Human-controlled AI. 4 Progressive disclosure. 5 One semantic model. 6 Defense in depth. 7 Observable by default. 8 Accessibility by default. 9 Monetization follows value. 10 Simplicity before scale. 11 Evidence over popularity. 12 No deterministic career promises.
PRD product rules: evidence beats self-claims; matching explainable; AI governed; assessment AI restrictions server-enforced; free users create no unplanned paid AI cost; privacy purpose-bound; popularity is not credibility; anomalies need review, not automatic guilt.
BRAIN heuristics: hard constraints before soft matching; always explain recommendations; scenarios not prophecy; clear module + explicit contract + boring infrastructure + strong tests. Common mistakes to avoid: building AI before domain data is trustworthy, turning every feature into a platform, a single score where dimensions are needed, realtime as truth, queues as exactly-once business effects, hard-coded policy values, confusing existence with correctness.

### 4.2 Product invariants (SSOT 3.2) and built status

| # | Invariant | Built status (code/test evidence; dated) |
|---|---|---|
| 1 | RLS is a DB boundary; app authorization above it | Partial: policies exist in migrations; the API connects with a privilege that can bypass RLS (SEC-04), so isolation is app-layer |
| 2 | No direct client DB writes for domain mutations; server-authoritative | Implemented-unverified (browser uses API only; no Supabase client in web) |
| 3 | No autonomous consequential AI action | Implemented (no remote AI; heuristic only) |
| 4 | Assessment AI restrictions server-side (`AI_PROHIBITED`) | Partial: enforced on two assistant routes; active sessions are in-memory so an API restart clears them (SEC-05); the separate assistant-query scaffold skips quota (INVARIANT-007 exception) |
| 5 | Free users cause no paid AI inference without explicit policy | Implemented-unverified (no paid inference exists; chat quota enforced; meter is in-memory) |
| 6 | Secrets server-side | Implemented-verified (scoped): CI sentinel build + bundle scan; env refusal checks. Windows secret-scan test has a false-green weakness (D-07) |
| 7 | Cross-tenant exposure is a critical incident | Process rule; tenant isolation tests partial; org-role gaps (CF-14) |
| 8 | AI memory is not profile truth or evidence | Implemented-unverified |
| 9 | Evidence/credential lifecycle auditable | Partial: certificate revocation and evidence revocation are independent (D-10) |
| 10 | Offline cache never authoritative | Vacuously true: no service worker / offline layer exists |
| 11 | Matching/recommendation explainable and uncertainty-aware | Partial: in-process matching; recommendation engine F-145 not implemented |
| 12 | Reputation contextual; popularity not credibility | Partial (F-144 API, ephemeral) |
| 13 | Anomaly is not guilt | Planned-approved |
| 14 | Consequential side effects idempotent and auditable | Partial: worker leases not fenced (D-02); dedicated stores outside `persist()` |
| 15 | One authoritative definition per concept | Not met: see conflict register |

Register counts in SSOT 42.1 (P-* 11, U-* 12, INV-* 16, SCOPE-* 8) do not match the text, which lists 12 principles and 15 invariants; the P-*, SCOPE-*, FC-*, TD-*, MVD-* IDs are referenced but not defined in `SSOT.md` (K-22). Built-system invariants (INVARIANT-001..015, e.g. single-writer `persist()`, hashed credentials) live in [02](02-ARCHITECTURE.md). Blueprint INV-T01..T20 and fitness functions FF-01..FF-12 are Proposed-only (OPEN-48).

## 5. Business rules summary

Full text: [docs/registries/BUSINESS_RULE_REGISTRY.md](../31_LEGACY_ARCHIVE/docs/registries/BUSINESS_RULE_REGISTRY.md) (canonical identity and text for BR-01..BR-248 plus MIG-01..MIG-08; recommended to keep as the single rule home and link, not copy). Rule IDs use two digits for BR-01..BR-35 and three digits after (K-09). Change policy: identify journeys/features, data/API impact, security/privacy impact, tests, SSOT update, rationale.

Implementation status: the rule text is inventoried and a subset carries code or test annotations, but no semantic acceptance review was done for the 248 rules (audit task X-00). A matching BR comment or ID is not proof. Known divergences are listed below; everything else is Unknown.

### 5.1 Rule families

| Family (SSOT 19.x) | IDs | Theme | Notable parameters |
|---|---|---|---|
| Access control | BR-01..09 | Recruiter/admin job authoring; only `ROLE_USER` applies; own-data access; admin-only flags/audit/moderation; billing for recruiters; route RBAC = registry; domain authz behind commands | Built: candidate/recruiter split enforced; BR-08/09 partly inline (R-2) |
| Jobs | BR-10..14, 036, 057 | Server-validated publish readiness; lifecycle draft - pending_approval - approved - scheduled - published - paused - closed - archived; own-company only; hidden jobs reversible; digest scheduler audited | Auto-close default 60 days (D-2). Built `JobStatus` omits `scheduled` (F-05 audit) |
| Applications | BR-15..20, 037..041, 045, 058, 061 | One active application per user per job (partial unique + 90-day cooldown); append-only lifecycle and history; drafts autosave 30 s; recruiter notes never candidate-visible; strict state machine; profile >=70% gate; rejection email delay 24 h default; auto-archive after 90 days submitted | BR-15 Implemented-verified (partial unique index, PG tests); draft autosave API exists, no UI (F-36) |
| Learning and challenges | BR-21..25, 046..052, 053 | Idempotent lesson completion; prerequisites; completion yields certificate and XP; language allowlist; XP idempotent with daily cap 200; sequential modules; final assessment >=70%; isolated sandbox 30 s CPU / 512 MB / 1 GB; public+hidden tests; async plagiarism; badges only on verified milestone | BR-048 not enforced in code (D-09); sandbox not built (D-01) |
| Data governance | BR-26..35, 063, 067, 068 | Append-only exports; whitelist analytics metadata; extension data local; schedulers dry-run; subscription state webhook-owned; AI drafts never auto-commit; export within 30 days; all admin actions audited; account termination needs dual admin approval | BR-32 Implemented (Stripe reconcile); BR-29 rollback not evidenced |
| Verification and trust | BR-043..044, 062..066, 149..156, 164..168 | Virus scan before text extraction; encrypted extracted text; verified signals on profiles; AI confidence <0.5 suppressed, <0.7 disclaimer; append-only credentials; public verification URL without PII; appeals SLA <=7 days; reputation derived, skill-specific, 24-month decay, private by default | Credential append-only: inconsistent (D-10); BR-167 visibility gate Implemented (PR #58), consent UI deferred |
| Operational automation | BR-069..071 | Interviewer inactivity 7/14 business days; candidate non-response 5/8 days; requisition abandonment 21/30 days | Not implemented (no scheduler) |
| Institutional | BR-072..082, 241..248 | Seat-bound access; 7-day revoke grace; atomic seat consumption; FERPA severance on graduation; dry-run bulk import; tenant scoping by `organization_id`; alumni rules | Not implemented (F-40 partial, F-41 absent) |
| Media | BR-083..090 | External media validated; embedding restrictions respected; provider allowlists server-side | Not implemented (F-42 absent) |
| Learning marketplace | BR-091..115 | >=5 lessons and >=30 min to submit; free preview <=20%; rating needs >=20% progress; refund window 30 days; instructor 70% of net; peer review >=2; quiz attempts bounded | Not implemented (F-66..F-74 mostly absent/partial) |
| Social and content | BR-116..128 | One reaction/repost per user; chronological feed always offered; sponsored labelled; minors 16+ private-by-default | Not implemented |
| Outreach, recommendations, privacy | BR-129..134, 184..188 | Outreach credits and weekly caps 20/50; endorsements need a connection; recommendations disclose factors, never use protected attributes, replaceable engine | Not implemented (F-59 absent, F-145 absent) |
| Insights and aggregates | BR-135..138, 157..163, 177..183, 189..193, 207, 220 | Salary aggregate k>=5 (BR-135/178), k>=10 (BR-220, BR-207 cells), career data k>=5 and >=20 samples, outcome correlation >=30 learners, correlation is not causation, withdraw salary any time, minor units + ISO-4217 | Salary/threshold conflict K-08 |
| Contests and certification | BR-139..140 | Server-authoritative end time; single-attempt pass | Not implemented |
| Skills graph | BR-141..148, 206 | Admin-curated taxonomy; directional prerequisite relations, acyclic; every tag references a canonical skill; traversal depth 5; emerging skill needs 5 signals (BR-148) vs platform-wide adoption (BR-206) | Partial (F-84, ephemeral) |
| Interviews | BR-169..176 | Recording dual consent, encrypted, <=90 days; AI feedback advisory, protected attributes excluded; scores append-only; structured rubrics | Interview execution simulated, refused in staging/production (CF-27) |
| Feature-specific | BR-194..205, 208 | Mentorship 30-day inactivity close; resume parsing never auto-applies; custom assessments need admin approval; WCAG 2.2 AA is a release gate (BR-204); API access enterprise tier; AI features inherit safety rules | partial |
| Warm intros / feedback / decay / referrals | BR-209..240 | Introducer consent, max depth 4, 10 requests/week; rejection reason required, feedback within 7 days, candidate request window 30 days; freshness nightly, self-attestation 0.5x, <20 demotes; 3 referral requests/30 days, attribution 12 months | Partial APIs only (F-121, 122, 123, 142 ephemeral) |
| Migration | MIG-01..08 | Imported data is project-owned; one-way user-initiated; never auto-publish; imported skills self-reported; no connection-graph import; tokens server-side and purged; external IDs never primary keys; provider surfaces flag-gated | Not implemented (F-64 absent) |

### 5.2 Registry hygiene issues (kept as conflicts, not fixed here)

BR-35 superseded; duplicate-meaning pairs (BR-15/039 duplicate application, BR-25/060 XP, BR-037/061 profile 70%, BR-11 lifecycle list vs BR-041 state machine); SSOT feature prose attaches different meaning to the same normalized ID (F-01 "BR-001 auth required" vs registry BR-01 job posting); out-of-range BR IDs treated as stale; Appendix B says BR 246 / J 31 while 42.1 says BR 248 + 8 MIG / J 28. Blueprint holds 108 BR-T rules; 256 source IDs align after padding, 4 text conflicts, 171 no-match (OPEN-43). No BR-249+ may be created from historical prose.

## 6. Functional requirements

### 6.1 Release and GA scope (four definitions in circulation, K-02)

| Definition | Scope | Source | Status |
|---|---|---|---|
| Full PRD GA | Identity - profile + goals - skills + evidence - learning - assessment/practice - portfolio/proof - jobs - applications - recruiter review - communication - outcome - career graph; plus platform foundations (SSOT B: Goal-Gap-Learn-Practice-Prove-Verify-Discover-Match-Apply-Interview-Outcome-New evidence) | PRD 8; SSOT B | Planned-approved; learning, assessment, outcome, career progression only partial |
| Restricted trusted-career beta | Identity, profile/evidence, mailbox/referee proof, jobs/apply, recruiter review, outcome, messaging, account controls; subset of F-01/02/03/04/05/06/10/12/14/15/17/20/21/24/25/32/35/52/56/60/84/94/96/162 | FEATURE_PLAN_2026-10-21 G (recommended, owner decision pending) | Proposed-only |
| "Core Career Loop GA" | Candidate sign-up - profile/skills - corporate-email proof - referee voucher - apply - ATS pipeline - messaging; in scope F-01,02,03,04,05,06,10,12,14,15,21,25,29,32,56,58,60,65,80,84,94,96,102,117,162,173; LMS, arena, video rooms, paid subscriptions, admin UI out of scope; free launch tier | RELEASE_SCOPE_AND_BACKLOG 2.2; AUDIT_MASTER 6.1 | Proposed-only (authored by an agent group, not owner-ratified) |
| Blueprint Phase 1 / Phase 2 | Ph1 pre-GA pilot (Prove - Showcase - Apply, basic messaging); Ph2 complete-loop GA candidate | Blueprint ROADMAP, REV2 | Proposed-only |

None of these is owner-approved. "Broad portfolio launch" of all 173 features is explicitly not recommended (FEATURE_PLAN G).

### 6.2 Requirement clusters with acceptance criteria and built status

Acceptance criteria are SSOT-stated targets (Planned-approved). "Built" is the strongest dated evidence found; per-feature behaviour is in [04](04-FEATURES-AND-WORKFLOWS.md).

| Cluster | Features | Requirement | SSOT acceptance criteria | Built status |
|---|---|---|---|---|
| Identity, session, account | F-01, 12, 15, 21, 60, 65, 80 | Register/verify/login/logout/reset/OAuth with normalized roles; complete professional record with privacy; settings, export, erasure; error recovery | F-01: login p95 <300 ms; 100% duplicate-email and weak-password rejection; zero secrets in bundle; rate limits at edge; age gate <16. F-12: save p95 <250 ms; public view never exposes PII; completeness reproducible; 409 on concurrent edit | Partial. Built: email/password, PBKDF2-SHA512 210k, HMAC session with revocation, profile CRUD, settings, export metadata, erasure request/cancel. Missing: account-email verification, forgot/reset password, OAuth, refresh cookie, age gate (F-01); uploads and per-section visibility (F-12). Password policy is length >= 8 only ("password" accepted, E2E B03b). Erasure executes immediately; 30-day grace scheduler absent (D-03, K-07). F-65 absent per audit |
| Skills, evidence, credentials | F-84, 96, 52, 94, 162, 58, 110, 123 | Governed skill graph; append-only credentials with public verification; proof of control for work history; references; freshness | F-84: search p95 <100 ms, traversal <200 ms depth <=3, 100% tags canonical, zero prerequisite cycles. F-96: issuance <500 ms, public verify <200 ms, zero PII, 100% append-only (DB grants), appeal <=7 d. F-94: employment verification <7 d; zero resume fraud (not a verifiable guarantee) | Partial. Corporate-email challenge (hashed, expiring, attempt-bounded), referee link (hash, single-use, 30-day expiry in API checks), SHA-256 evidence, `/verify/:hash`. Corporate-email code hash is plain SHA-256 (SEC-01 open). Domain match only when role has company website (CF-11). F-58 absent per 10-21 audit but listed Full in 10-22 audit (K-01) |
| Jobs and hiring | F-04, 05, 06, 25, 32, 35, 56, 102, 117, 24 | Job marketplace, post-job studio, ATS pipeline, saved searches/alerts, org pages, hiring-manager portal, moderation | F-04: search p95 <300 ms/100k jobs, apply <500 ms, zero duplicate active applications, 100% salary transparency, stable cursor pagination. F-06: Kanban sync <200 ms, zero cross-tenant access, audit 100% | Partial; core slice Implemented-verified (scoped): create/publish/apply/withdraw/transition with DB partial unique index; recruiter pipeline; saved searches/bookmarks SQL stores. Job approval workflow / moderation state not built (CF-15); scorecard/interview/hiring-manager journey not established |
| Learning | F-07, 66-74, 106 | LMS, creator studio, quizzes, assignments, paths | F-07: lesson completion <150 ms; reproducible certificate hash; progress survives refresh/crash; video start <3 s | Partial: lesson player UI + API exist; state is process-local; certificate issuance omits the BR-048 final-assessment gate (D-09); F-69..F-73 absent |
| Assessment and practice | F-08, 77, 78, 88, 91, 115 | Challenges with sandboxed execution; skill exams; interview platform | F-08: submission-to-result <3 s; 100% sandbox containment; deterministic scoring; no XP until pass confirmed. Exams: server timer +/-100 ms, answer keys never in client | F-08 Broken/regressed: unexecuted text returns `passed`/100 with evidence kept unverified (D-01). Interview execution simulated, fails closed in deployment. F-115 absent |
| Matching, recommendations, intelligence | F-85, 86, 91, 92, 144, 145, 147, 151, 152 | Explainable matching; readiness; salary; reputation; forecasts | Recommendation p95 <500 ms, explanations always present; readiness <500 ms, factors disclosed; salary aggregate <400 ms, k-anonymity always; reputation nightly, zero individual leakage | Partial: ephemeral APIs, mostly no UI; F-145 not implemented; CF-01..03 removed invented seed data |
| Communication | F-10, 14, 29, 33 | Messaging, notifications, digests, interview rooms | Delivery <5 s (intros/referrals) | F-10, F-14 Implemented-unverified/scoped-verified with durable threads; F-29 digest preference only, no sender job; F-33 API only |
| Billing and entitlements | F-16, 61 | Subscriptions; entitlements derive from active subscription only (BR-56) | Webhook idempotency 100%; entitlement enforcement server-side; zero double-billing | Partial: Stripe Checkout/Portal/signed webhook, durable records (00052, 00053), refund handling for full current-period refund; default disabled; live billing unverified; open O-1/O-2/O-5 (file 08) |
| Admin and trust | F-17, 24, 35, 83 | Admin console, moderation, flags, audit | All admin actions audited (BR-67) | Partial: admin UI (user search/status, audit, health, flags); maintenance mode changes diagnostics only (M-1); moderation API without UI |
| Institutions, community, marketplace, extension | F-18, 40-51, 53-57, 59, 64, 73, 76, 79, 107-143 (absent set) | See ledger below | per SSOT sections 13-15 | Not implemented unless listed Partial in 6.3 |

### 6.3 Feature status ledger (2026-10-21 audit of record; 173 IDs; K-01)

| Status | Count | Feature IDs |
|---|---|---|
| Implemented-unverified | 6 | 2, 3, 10, 14, 20, 25 |
| Broken / regressed | 1 | 8 |
| Partial | 87 | 1, 4, 5, 6, 7, 9, 11, 12, 13, 15, 16, 17, 19, 21, 22, 23, 24, 26, 29, 31, 32, 33, 34, 35, 36, 37, 40, 45, 52, 55, 56, 60, 61, 66, 67, 68, 74, 75, 77, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 102, 103, 106, 110, 114, 117, 118, 121, 122, 123, 125, 142, 144, 146, 147, 148, 149, 150, 151, 152, 153, 158, 159, 160, 162, 169, 172 |
| Not implemented (search-limited: no matching code found) | 75 | 18, 27, 28, 30, 41-44, 46-51, 53, 54, 57, 58, 59, 64, 65, 69-73, 76, 78, 79, 100, 104, 105, 107-109, 111-113, 115, 116, 119, 120, 124, 126-141, 143, 145, 154-157, 161, 163-168, 170, 171, 173 |
| Deprecated / not recommended | 4 | 38, 39, 62, 63 |

Later source changed some rows without re-audit: F-16 now has Stripe integration; F-94 mail delivery moved from dev outbox to a Brevo adapter (live delivery unverified); F-32 saved searches/bookmarks SQL-backed; F-35 flags and F-17 admin audit SQL-backed (00050, 00051); F-52 certificate revocation RLS (00055). Per-feature expected/actual/next action: `docs/reports/FEATURE_STATUS_2026-10-21.md` matrix (dated historical, retain).

Registry structure: 173 IDs = F-01..F-120 baseline, F-121..F-143 integration family, F-144..F-173 gap-analysis family; priority P 0-10 (10:10, 9:14, 8:22, 7:29, 6:31, 5:23, 4:19, 3:16, 2:4, 1:1, 0:4) and Phase 0-10 in `docs/registries/FEATURE_REGISTRY.md` (identity inventory only; SSOT 7 holds the same register, K-17). P (value score) is distinct from delivery urgency P0-P3 used in plans.

### 6.4 Foundational systems (SSOT 8)

| System | Primary feature | Role | Built |
|---|---|---|---|
| S-01 Skills Graph | F-84 | Admin-curated taxonomy, semantic edges | Partial, ephemeral |
| S-02 Verification and Credentials | F-96 | Append-only credentials, SHA-256, `/verify/:hash` | Partial; evidence vs certificate revocation inconsistent (D-10) |
| S-03 Reputation Engine | F-144 | Multi-context reputation | Partial, ephemeral |
| S-04 Recommendation Core | F-145 | Hybrid recommender + explanations | Not implemented |
| S-05 Career Graph | F-85 | Verified transitions/outcomes | Partial, ephemeral |
| S-06 Technical Interview Platform | F-88 | Structured recordable interviews | Partial; execution simulated |
| S-07 Salary Intelligence | F-86 | Transparent comp, k>=5 | Partial |
| S-08 Learning Impact | F-114 | Correlational outcome evidence k>=5 (SSOT) / >=30 (BR-189) | Partial |
| S-09 Activity Tracking | F-146 | Behavioural signals | Partial |
| S-10 Unified Search | F-147 | One RLS-safe discovery surface | Partial; no FTS runtime |
| S-11 Warm Intro and Referral | F-121 + F-142 | Introductions and referrals | Partial, ephemeral |
| S-12 Application Feedback Loop | F-122 | Feedback on every application (#1 differentiator) | Partial |
| S-13 Skill Freshness | F-123 | Decay stale evidence | Partial |
| S-14 Project Marketplace Infra | F-124 | Projects, freelance, escrow | Not implemented |

Dependency rule: declare blocking dependencies, shared primitives, policy prerequisites, external and data prerequisites; no circular dependencies unless mediated by events/contracts. Registry edges include non-runtime dependencies (e.g. F-94 lists F-58) that need interpretation, not blind topological sorting.

### 6.5 Journeys (SSOT 16 / JOURNEY_REGISTRY: J-01..J-28)

Target journeys, not a passing-test inventory; no complete journey is certified end-to-end. Terminal outcomes: J-01 portfolio with verified signals; J-02 offer accepted; J-03 offer extended; J-04 first hire; J-05 referred hire; J-06 gaps addressed; J-07 revenue; J-08 impact measured; J-09 placement reported; J-10 client invoice; J-11 profile diff applied (extension); J-12 independent candidate; J-13 course assigned to batch; J-14 seats provisioned; J-15 at-risk students intervened; J-16 certification + HRIS sync; J-17 native account from LinkedIn on-ramp; J-18 monthly settlement; J-19 path enrolled; J-20 program certificate; J-21 certification badge; J-22 apply started; J-23 audience established; J-24 published review; J-25 grade finalized; J-26 role transition confirmed; J-27 post-hire outcome recorded; J-28 learning program impact reported. Journey contract: entry conditions, actors, permissions, main/alternate paths, failure/recovery, terminal state, analytics, observability, acceptance evidence. Built: J-02 candidate/recruiter subset (apply, track, pipeline, notifications) is the only journey with PG + browser coverage; J-26 and J-01 UI exist, ephemeral. Workflows WF-01..WF-66, WIT-001..025 and 53 state machines: [04](04-FEATURES-AND-WORKFLOWS.md). Blueprint holds 20 UJ journeys (Proposed-only).

Product acceptance rule (PRD 12): an increment is accepted only when user outcome, journey, security/privacy, accessibility, operational readiness and measurable acceptance criteria are satisfied.

## 7. Non-functional requirements

SSOT register NFR-* is stated as 21 items but individual NFR texts are not listed in `SSOT.md`; the requirements below are the NFR content actually stated (SSOT 15, 19-22, 30-37; TRD 4-9; PROD-001..024).

| Area | Requirement | Threshold / acceptance | Built status |
|---|---|---|---|
| Security | Defense in depth; server-side authorization on every protected mutation; tenant-isolation tests; no critical unresolved findings at release; secrets server-side; rate limiting; audit | Vulnerability SLAs: SEV-1 <24 h mitigation + 72 h patch; SEV-2 <72 h or 7 d with blocking control; SEV-3 <14 d; SEV-4 next release (blueprint proposes 14/60 d, OPEN-48). External pen test with zero critical/high before MVP exit | Partial: PBKDF2 210k, HMAC sessions + revocation, Helmet/CORS, rate limit (300/min/account noted in SECURITY.md), hashed credentials, log redaction; token in localStorage (XSS-readable); no CSP on API; no pen test. Details [06](06-SECURITY-AND-INTEGRATIONS.md) |
| Privacy | Purpose-bound versioned consent; GDPR Art. 15/17/20/22/33/35 matrix; erasure 30-day with grace; DSR 30 d; FERPA severance by logical anonymization; data residency US-East, EU partition Ph3; CCPA; EEOC monitoring; DPDP mapped to actual legal timeline before compliance is claimed | Retention, thresholds are policy configuration, not constants (SSOT G) | Partial: immediate erasure + request/cancel store; no scheduler; cross-store failure risk (D-03); legal review absent. No compliance claim is valid yet |
| AI safety | Single AI gateway; human gate; redaction table; prompt-injection defences; confidence gates 0.5/0.7/0.85; provenance on every suggestion | Mandatory redaction cannot be disabled | Partial: local heuristic only; gateway interfaces partial; no remote LLM |
| Accessibility | WCAG 2.2 AA is a release gate; axe 0 critical/serious; contrast >=4.5:1 text, 3:1 large/UI; keyboard, focus, reflow, reduced motion, 24 px target (SSOT 36.2 forward targets 2.4.11, 2.4.13, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) | MVP exit: axe 0 critical on all MVP routes; per-route matrix, manual SR testing, VPAT | Partial: Playwright accessibility + responsive (320-2560 px) specs pass in dated runs; no manual SR/contrast audit; conformance unverified |
| Performance | Core Web Vitals: LCP <2.5 s mobile/<2.0 s desktop, INP <200 ms, CLS <0.1, TTFB <800 ms, FCP <1.8/1.5 s. Route budgets e.g. marketing LCP <=1.8 s/JS <=120 KB, search <=2.0 s/200 KB, dashboard/ATS <=2.5 s/250 KB, LMS <=3.0 s/300 KB, admin <=3.5 s/350 KB. List endpoints p95 <200 ms, search p95 <300 ms, dashboard aggregates p95 <400 ms; no N+1; no route bundle >200 KB gz. TRD: measure real p75/p95/p99 and set budgets after baseline | Blueprint proposes different values (350/400 ms; 220-400 KB), OPEN-49 | Unverified: Playwright performance spec exists; no load test; boot hydration O(N) |
| Reliability | Bounded idempotent retries; timeouts, circuit behaviour and reconciliation per integration; graceful degradation; service SLOs | Backup RPO <=15 min / RTO <=2 h (DB), rollback <15 s automated, quarterly restore drill; blueprint proposes RPO 5 min / RTO 1 h | Partial: single-writer lock, worker heartbeat, backup/restore scripts exist; no drill run, no deployed topology proven; worker leases can double-execute (D-02) |
| Observability | Structured logs, correlation ids, metrics, traces, audit events, health, SLOs, alerts, dashboards, runbooks; unknown telemetry is not healthy | P0 ack 10 min, P1 30 min, P2 4 h, P3 1 business day | Partial: Pino + request ids + admin audit + health; no metrics/trace/alert backend |
| Scalability | Evolution path: modular monolith - worker scaling - cache - search extraction - replicas - selective service extraction; name the trigger rather than over-build | Design for 10 to 1M+ users with triggers | Built is single-writer, one API per DB (ADR-015); horizontal scale blocked until reads move to SQL |
| Data | UTC timestamps; integer minor units + ISO 4217 (BR-179); opaque external ids; optimistic concurrency for high-value records; append-only audit/events; migrations authoritative | Idempotency-key contract, cursor pagination, allow-listed filters, error contract (DOR-001..018) | Partial: no generated OpenAPI, no universal pagination/idempotency layer; core records have `base` concurrency guard |
| Testing | Layers unit - component - integration - API/contract - E2E - security - accessibility - performance - data integrity - regression - failure/recovery; feature complete only when behaviour, permissions, data integrity, security, accessibility, observability, analytics, recovery, tests and AC all pass | CI: lint, types, unit, build, migration checks, authz/RLS, contract, security scans, critical E2E, a11y smoke, perf | Partial; see [07](07-TESTING-AND-OPERATIONS.md) |
| PWA / offline | Real PWA, progressive enhancement; per-feature offline contract (READ_OFFLINE, WRITE_OFFLINE, QUEUE, SYNC, CONFLICT, SERVER_REQUIRED); cache never source of truth | n/a | Manifest + capability detection only; no service worker, no offline sync (X-04 only if scope requires) |
| Release | Environments local/CI/staging/prod; pipeline lint - types - unit - build - preview - E2E - migration round trip - RLS fuzzing - staging sign-off; canary 5/25/50/100%; 24 go-live gates PROD-001..024 | MVP exit: 7 criteria (candidate loop; recruiter loop; RLS suite 100% allow+deny; axe 0 critical; CWV on mobile 4G; 5 consecutive green staging deploys; pen test 0 critical/high). Institutional exit: 5 criteria (>=500-row import with dry run; atomic license seats; certificate with public verification URL; exact revoke/reassign; cross-tenant isolation) | Not met: no staging deployment evidence, no pen test; production gate open |
| Documentation | One canonical definition; change updates dependencies, tests, analytics, migrations, ops, docs in the same change; status vocabulary PLANNED / IN DEVELOPMENT / IMPLEMENTED / VERIFIED / RELEASED, side states BLOCKED / DEPRECATED / REJECTED | GOVERNANCE 5-6 | This consolidated set |

## 8. Constraints

| Class | Constraint | Source |
|---|---|---|
| Stack as built | React 19 + TypeScript + Vite; Fastify 5 modular monolith; Zod contracts; PostgreSQL via `pg`; HMAC sessions; Node 24 in CI; pnpm 11.7 pinned. Intended-but-not-built: Supabase Auth, Queues, Edge Functions, Storage, Realtime, TanStack Query, OpenAPI generation (K-03) | CLAUDE.md, `ARCHITECTURE.md`, TRD 2 |
| Single writer | Exactly one API instance per database until core reads move off the in-process read model | ADR-015 |
| Build files read-only for AI agents | `package.json`, lockfiles, `tsconfig*`, `vite*`/`vitest*`/`playwright.config.*`, `.github/`, `deploy/`, Dockerfiles, Prettier and git ignore files, generated output; only an explicit user authorization overrides; Windows: use `pnpm.cmd` | AGENTS.md |
| Business rules in domain only | Routes call `packages/domain`; no restating | CLAUDE.md, INVARIANT-002 |
| Do-not-weaken list | auth, RLS, rate limits, honesty tests (`persistence-honesty`, `database-migrations`) | CLAUDE.md |
| New infrastructure needs an ADR | DB driver, broker, provider SDK, auth provider enter only via recorded human decision | INVARIANT-011 |
| Escalate | Schema-breaking design, security architecture, AI provider/entitlement, pricing/entitlement, major API versioning, consequential decision logic | AGENTS.md |
| Change classes | C1 text, C2 code, C3 schema/security policy, C4 dependency, C5 secret/config, C6 architecture, C7 commercial; C3+ expanded review, C6/C7 founder approval; locked registers change only via ratified C3 | GOVERNANCE 3; SSOT 42.2-42.3 |
| Hosted Supabase | Do not run `pnpm db:migrate` on the hosted target; migrations 00016/00018/00022/00023 reference `auth.users` and the app's users live in `public.users` (00054 repoints FKs; hosted adapter is a separate gated path). Hosted project held no application tables when inspected | HOSTED_SUPABASE_MIGRATION_GATE, re-audit 2026-10-23 |
| Deployment | `STORAGE=memory` refused in deployed environments; `TOKEN_SECRET` required in production and staging; paid activation refused unless `BILLING_MODE=stripe` (default `disabled`; `simulated` refused in production); Oracle Always Free staging is not evidence of production | env.ts, ARCHITECTURE |
| Email | Opt-in Brevo behind a provider-independent worker service (`EMAIL_PROVIDER` none or brevo); development uses the labelled dev outbox; live delivery unverified | env.ts, worker `email/` (K-04: audit docs say Resend) |
| Legal and regulatory | GDPR, CCPA/CPRA, EEOC, FERPA, India DPDP (map to actual stage), WCAG 2.2 AA, W3C VCDM 2.0 as credential target (2.1 draft monitored). Compliance claims need legal review; counsel sign-off not obtained | SSOT 31, G, research basis; BL-004 |
| AI | No consumer-subscription API rights assumed; provider authorization distinct from entitlement; free users never trigger paid inference without explicit active cost policy; execution order local - free quota - user-authorized provider - TalentSphere cloud only if policy permits - non-AI fallback | SSOT C, 16.3-16.4 |
| Process | Verify user-visible changes in the running app with Reticle before reporting done; do not commit or push unless asked; keep changes small; ask before big refactors | CLAUDE.md |
| Dev tooling requirement (non-product) | Windows `clean-reinstall.bat` + `.ps1` utility: discovery, safe cleanup with path canonicalization, lockfile-frozen reinstall, `--dry-run`, logging (requirements R1-R4, acceptance checks recorded in MAINTENANCE_AUDIT; 38 test cases passed historically) | MAINTENANCE_AUDIT, [03](03-DEVELOPMENT-GUIDE.md) |

## 9. Pricing and entitlement requirements

Plans, prices, limits and enforcement status: [docs/PRICING.md](../31_LEGACY_ARCHIVE/docs/PRICING.md) (single source; code is `PLATFORM_PLANS` in `packages/domain/src/billing.ts`). Requirements that are not in that file:

- BR-55: subscription changes at period boundary or prorated. BR-56: entitlements derive from active subscription only. BR-32: subscription state is webhook-owned. Redirect success grants nothing.
- Owner decision (2026-10-23): a full refund of the charge that paid for the current period ends paid access; partial or older-charge refunds change nothing. Disputes and voided invoices are not handled (open).
- Prices are recommendations awaiting founder sign-off; USD only; no trials, add-ons, usage billing. Several advertised plan features are not gated or not implemented (see PRICING enforcement table) and must not be sold until built.
- Open pricing decisions: free-recruiter posting policy; organization-level vs user-level entitlement owner; Candidate Pro vs OD-34/F-61 gate; tax/jurisdiction (blueprint OPEN-18); refund/dispute limits (OPEN-33). Home for all: [08](08-ROADMAP-AND-DECISIONS.md).

## Appendix A. Canonical feature register (identity inventory; status in 6.3)

Copied from `docs/registries/FEATURE_REGISTRY.md` (identical to SSOT 7). Columns: ID, feature, category, value score P (0-10), SSOT phase, key dependencies. P is value, not delivery urgency. Owner of the register is unresolved: K-17.

| ID | Feature | Category | P | Phase | Dependencies |
|---|---|---|---|---|---|
| F-01 | Authentication & Session | Identity | 10 | Ph0 | – |
| F-02 | Landing Page | Shell | 3 | Ph0 | – |
| F-03 | Dashboard (Role-Adaptive) | Shell | 10 | Ph0 | F-01 |
| F-04 | Job Marketplace | Marketplace | 9 | Ph2 | F-01, F-12 |
| F-05 | Post Job Studio | Marketplace | 8 | Ph2 | F-04 |
| F-06 | ATS / Candidate Pipeline | Recruiting | 9 | Ph2–3 | F-04, F-05 |
| F-07 | Learning Management System | Learning | 9 | Ph1 | F-01, F-12 |
| F-08 | Challenges Arena | Assessment | 9 | Ph1 | F-01, F-12 |
| F-09 | Professional Networking | Social | 8 | Ph2 | F-12 |
| F-10 | Direct Messaging | Communication | 10 | Ph0 | F-01 |
| F-11 | AI Career Assistant (Basic) | AI | 8 | Ph1/Ph4 | F-12 |
| F-12 | Profile Management | Identity | 10 | Ph0 | F-01 |
| F-13 | Resume Builder | Identity | 7 | Ph1 | F-12 |
| F-14 | Notification Center | Communication | 10 | Ph0 | F-01 |
| F-15 | Settings | Shell | 10 | Ph0 | F-01 |
| F-16 | Billing & Subscriptions | Monetization | 7 | Ph5 | F-01 |
| F-17 | Admin Console | Governance | 10 | Ph0 | F-01 |
| F-18 | Chrome Extension Companion | Edge | 5 | Ph2 | F-01 |
| F-19 | Product Analytics | Telemetry | 7 | Ph1 | F-01 |
| F-20 | Command Search (⌘K) | Shell | 7 | Ph2 | F-01 |
| F-21 | Error Recovery & Resilience | Shell | 10 | Ph0 | F-01 |
| F-22 | Gamification & XP Ledger | Engagement | 8 | Ph1 | F-07, F-08 |
| F-23 | Leaderboard & Badges | Engagement | 7 | Ph2 | F-22 |
| F-24 | Trust, Safety & Moderation | Safety | 8 | Ph2 | F-01 |
| F-25 | Job Detail View | Marketplace | 7 | Ph2 | F-04 |
| F-26 | Portfolio Showcase | Identity | 8 | Ph1 | F-12 |
| F-27 | Local Resume Match Preview | Edge | 6 | Ph2 | F-18 |
| F-28 | External Job Page Scanner | Edge | 6 | Ph2 | F-18 |
| F-29 | Scheduled Notification Digest | Communication | 7 | Ph2 | F-14 |
| F-30 | Networking Stale-Request Nudges | Engagement | 6 | Ph2 | F-09 |
| F-31 | KPI Aggregation & Rollups | Analytics | 6 | Ph2 | F-19 |
| F-32 | Saved Searches & Job Alerts | Candidate | 7 | Ph2 | F-04 |
| F-33 | Video Interview Rooms | Communication | 8 | Ph3 | F-10 |
| F-34 | Multi-Entity Backend Search | Platform | 7 | Ph2 | F-04, F-07 |
| F-35 | Feature Flag Console | Administration | 6 | Ph2 | F-17 |
| F-36 | Application Draft Autosave | Candidate | 7 | Ph1 | F-04 |
| F-37 | Job Templates | Recruiting | 6 | Ph2 | F-05 |
| F-38 | Legacy Chat Service (DEPRECATED) | Communication | 0 | – | – |
| F-39 | Unified Backend Stub (DEPRECATED) | Platform | 0 | – | – |
| F-40 | Institutional Managed Learning | Institutions | 8 | Ph3 | F-01, F-07 |
| F-41 | Procurement & Seat Licensing | Institutions | 6 | Ph6 | F-40, F-16 |
| F-42 | Provider-Agnostic Media Engine | Platform | 8 | Ph2 | F-07 |
| F-43 | B2B2C Graduation Flywheel | Institutions | 6 | Ph3 | F-40 |
| F-44 | AI Media Enrichment | Learning | 6 | Ph4 | F-42, F-11 |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | Learning | 4 | Ph10 | F-40, F-115 |
| F-46 | Institutional Analytics | Institutions | 6 | Ph3 | F-40 |
| F-47 | Faculty Dashboard | Institutions | 6 | Ph3 | F-40 |
| F-48 | OS Shell & Workbench | OS | 4 | Ph2+ | F-01, F-03 |
| F-49 | Automation & Agents | OS | 4 | Ph3+ | F-48 |
| F-50 | Institutional Course Marketplace | Institutions | 6 | Ph3 | F-40, F-42 |
| F-51 | Media Health Monitoring | Platform | 6 | Ph4 | F-42 |
| F-52 | Certificate Verification | Verification | 8 | Ph3 | F-07 |
| F-53 | Professional Social Graph & Feed | Networking | 5 | Ph8 | F-12 |
| F-54 | Content Publishing | Networking | 5 | Ph8 | F-12 |
| F-55 | Groups & Communities | Community | 5 | Ph8 | F-53 |
| F-56 | Organization & Institution Pages | Recruiting | 5 | Ph8 | F-12, F-40 |
| F-57 | Events & Webinars | Community | 5 | Ph8 | F-53 |
| F-58 | Written Recommendations | Networking | 6 | Ph8 | F-53 |
| F-59 | Outreach Credits (TalentMail) | Recruiting | 5 | Ph8 | F-10 |
| F-60 | Profile Views & Privacy Controls | Networking | 6 | Ph8 | F-12 |
| F-61 | Premium Candidate Tier (OD-34 gated) | Business | 4 | Ph10+ | F-60 |
| F-62 | Sponsored Content (NOT RECOMMENDED) | Business | 0 | Ph10+ | – |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | Intelligence | 0 | Ph10+ | – |
| F-64 | LinkedIn Migration Engine | Integration | 5 | Ph1/2 | F-12 |
| F-65 | LinkedIn Decoupling & Independence | Foundation | 8 | Ph1/2 | F-64 |
| F-66 | Course Creation Studio | Learning | 8 | Ph7 | F-07, F-42 |
| F-67 | Categories, Discovery & Comparison | Learning | 6 | Ph7 | F-07, F-145 |
| F-68 | Quizzes, Practice Tests & Final Exams | Learning | 8 | Ph7 | F-07 |
| F-69 | Assignments & Peer Review | Learning | 8 | Ph7 | F-07 |
| F-70 | Learning Paths, Programs & Specializations | Learning | 8 | Ph7 | F-07, F-66 |
| F-71 | Course Q&A, Discussions, Notes | Learning | 6 | Ph7 | F-07 |
| F-72 | Course Reviews & Ratings | Learning | 6 | Ph7 | F-07 |
| F-73 | Course Commerce | Learning | 6 | Ph7 | F-07, F-16 |
| F-74 | Instructor Platform | Learning | 6 | Ph7 | F-07, F-66 |
| F-75 | Employer Insights | Intelligence | 7 | Ph9 | F-12, F-56 |
| F-76 | Coding Contests & Live Leaderboards | Assessment | 5 | Ph9 | F-08 |
| F-77 | Skill Certification Exams | Assessment | 8 | Ph3 | F-08 |
| F-78 | Practice Sets & Interview Prep | Learning | 5 | Ph9 | F-08 |
| F-79 | Articles & Newsletters | Networking | 5 | Ph8 | F-54 |
| F-80 | Profile Enhancements | Profile | 6 | Ph1/Ph8 | F-12 |
| F-81 | Identity Verification | Verification | 3 | Ph9 | F-12 |
| F-82 | Student Learning Analytics | Analytics | 6 | Ph7 | F-07 |
| F-83 | Admin Platform Expansion | Administration | 3 | Ph8 | F-17 |
| F-84 | Skills Graph & Taxonomy | Platform | 10 | Ph1–2 | F-12, F-07, F-08 |
| F-85 | Career Graph & Progression | Intelligence | 9 | Ph3 | F-12, F-04, F-06, F-84 |
| F-86 | Salary Intelligence | Intelligence | 9 | Ph3 | F-04, F-06, F-56 |
| F-87 | Interview Experience Repository | Candidate | 7 | Ph4 | F-04, F-56, F-88 |
| F-88 | Technical Interview Platform | Hiring | 9 | Ph3 | F-08, F-33, F-06 |
| F-89 | Contribution Verification System | Verification | 5 | Ph8 | F-26, F-12 |
| F-90 | Peer Mentorship & Advisor Network | Community | 5 | Ph4 | F-12, F-10, F-55 |
| F-91 | Career Readiness Assessment | Career | 9 | Ph2 | F-84, F-08, F-12 |
| F-92 | Advanced Recruiter Search | Recruiting | 9 | Ph3 | F-12, F-34, F-08, F-96 |
| F-93 | Interview Video Recording & AI Feedback | Hiring | 7 | Ph4 | F-33, F-06, F-88 |
| F-94 | Verified Work History & References | Verification | 7 | Ph3 | F-12, F-58 |
| F-95 | Career Transition Planning | Career | 7 | Ph4 | F-84, F-91, F-07 |
| F-96 | Skill Evidence & Digital Credentials | Verification | 10 | Ph2 | F-12, F-26 |
| F-97 | Real-Time Job Market Analytics | Intelligence | 5 | Ph4 | F-04, F-06 |
| F-98 | Employer Equity & Compensation Intelligence | Intelligence | 7 | Ph3 | F-56, F-86 |
| F-99 | AI Career Coach (Enhanced) | AI | 7 | Ph4 | F-12, F-84, F-91, F-07 |
| F-100 | Peer Project Collaboration | Learning | 4 | Ph5 | F-07, F-69, F-10 |
| F-101 | Badge Marketplace & Recognition | Gamification | 4 | Ph8 | F-23, F-26 |
| F-102 | Hiring Manager Portal | Recruiting | 8 | Ph3 | F-06, F-88 |
| F-103 | Candidate Comparison & Rubric | Recruiting | 6 | Ph3 | F-06, F-92 |
| F-104 | Pre-Hire Assessment Customization | Hiring | 7 | Ph3 | F-06, F-08, F-88 |
| F-105 | Post-Hire Analytics & ROI Tracking | Analytics | 4 | Ph4 | F-102, F-93 |
| F-106 | Skill Prerequisite Engine | Learning | 7 | Ph5 | F-07, F-70, F-84 |
| F-107 | Live Q&A with Instructors | Learning | 6 | Ph5 | F-07, F-71, F-10 |
| F-108 | Expert Network Matching | Networking | 4 | Ph7 | F-09, F-12, F-10 |
| F-109 | Salary Negotiation Guidance | Career | 5 | Ph8 | F-86, F-98 |
| F-110 | Verified Skill Endorsements | Verification | 7 | Ph8 | F-96, F-12, F-58 |
| F-111 | Industry-Specific Learning Hubs | Learning | 4 | Ph8 | F-07, F-55 |
| F-112 | Resume Parsing & Optimization | Candidate | 6 | Ph8 | F-13, F-12 |
| F-113 | Recruiter Outreach Analytics | Recruiting | 6 | Ph8 | F-59, F-06 |
| F-114 | Learning Impact Tracking | Analytics | 9 | Ph4 | F-07, F-04, F-06 |
| F-115 | Certification Exam Platform | Assessment | 9 | Ph3 | F-77, F-45 |
| F-116 | Accessibility & Inclusive Learning | Platform | 7 | Ph8 | F-07, F-44 |
| F-117 | Mobile-First Job Application | Candidate | 5 | Ph8 | F-04, F-33 |
| F-118 | Emerging Skills Detection | Intelligence | 4 | Ph8 | F-84 |
| F-119 | Diversity & Inclusion Analytics | Hiring | 4 | Ph8 | F-06 |
| F-120 | API & Integration Platform | Platform | 2 | Ph10 | F-01, F-34 |
| F-121 | Warm Introduction Paths | Networking | 8 | Ph4 | F-09, F-12, F-56, F-125 |
| F-122 | Application Feedback Loop | Jobs | 9 | Ph3 | F-06, F-04 |
| F-123 | Skill Decay Tracking (Freshness Engine) | Verification | 9 | Ph3 | F-84, F-96 |
| F-124 | Project Marketplace | Learning | 5 | Ph5 | F-07, F-26, F-100 |
| F-125 | Alumni Networks | Networking | 7 | Ph4 | F-12, F-09, F-40 |
| F-126 | Interview Prep Marketplace | Careers | 5 | Ph4 | F-87, F-90, F-88 |
| F-127 | Company Culture Assessment | Companies | 4 | Ph5 | F-56, F-75 |
| F-128 | Offer Comparison Tool | Careers | 7 | Ph4 | F-86, F-98, F-109 |
| F-129 | Leadership Development | Learning | 3 | Ph5 | F-07, F-84 |
| F-130 | Freelance Marketplace | Jobs | 3 | Ph7 | F-04, F-100, F-124 |
| F-131 | Apprenticeship Matching | Jobs | 3 | Ph6 | F-04, F-40 |
| F-132 | Scholarship Discovery | Learning | 3 | Ph6 | F-40, F-07 |
| F-133 | Volunteer Matching | Community | 2 | Ph7 | F-26, F-100 |
| F-134 | Code Review Practice | Skills | 4 | Ph5 | F-08, F-26 |
| F-135 | System Design Practice | Skills | 4 | Ph5 | F-88, F-08 |
| F-136 | Micro-Learning | Learning | 2 | Ph4 | F-07, F-42 |
| F-137 | Spaced Repetition | Learning | 2 | Ph6 | F-07, F-68 |
| F-138 | Study Accountability Partners | Learning | 3 | Ph6 | F-07, F-55 |
| F-139 | Local Communities & Meetups | Networking | 3 | Ph7 | F-09, F-55, F-57 |
| F-140 | Affinity Groups | Community | 3 | Ph7 | F-55, F-09 |
| F-141 | Onboarding Preparation | Careers | 1 | Ph8 | F-06, F-33 |
| F-142 | Referral Request System | Jobs | 8 | Ph4 | F-09, F-04 |
| F-143 | OSS Contribution Discovery | Portfolio | 4 | Ph8 | F-89, F-26 |
| F-144 | Reputation Engine (multi-context) | Platform | 9 | Ph2 | F-96, F-58, F-72 |
| F-145 | Recommendation Engine Core | Platform | 8 | Ph2–3 | F-84, F-144 |
| F-146 | Activity & Contribution Tracking | Platform | 7 | Ph3 | F-123, F-84, F-144 |
| F-147 | Unified Search & Discovery | Platform | 8 | Ph2 | F-84, F-145 |
| F-148 | Instructor Reputation System | Reputation | 8 | Ph7 | F-72, F-144 |
| F-149 | Employer Reputation & Brand System | Reputation | 7 | Ph8 | F-75, F-56, F-144 |
| F-150 | Peer Credibility Networks | Reputation | 7 | Ph8 | F-110, F-144 |
| F-151 | Skill Supply/Demand Forecasting | Intelligence | 7 | Ph4 | F-84, F-86, F-97 |
| F-152 | Career Trajectory Analysis | Intelligence | 7 | Ph4 | F-85, F-86, F-93 |
| F-153 | Learning Impact Dashboard (Enhanced) | Intelligence | 7 | Ph4 | F-114, F-85, F-86 |
| F-154 | Interview Prediction & Benchmarking | Intelligence | 6 | Ph4 | F-88, F-102, F-105 |
| F-155 | Adaptive Learning System | Personalization | 6 | Ph5 | F-07, F-84, F-145 |
| F-156 | Professional Development Plan System | Career | 6 | Ph4–5 | F-91, F-95, F-145 |
| F-157 | Skills Co-Learning Path Optimizer | Learning | 4 | Ph5 | F-84, F-114, F-07 |
| F-158 | Talent Pool Intelligence & Analytics | Recruiting | 6 | Ph3 | F-92, F-84, F-144 |
| F-159 | Behavioral Talent Discovery | Discovery | 6 | Ph4 | F-123, F-84, F-144 |
| F-160 | Talent Segmentation & Classification | Analytics | 5 | Ph4 | F-84, F-85, F-144 |
| F-161 | Internal Mobility & Succession Platform | Enterprise | 3 | Ph6–7 | F-84, F-91, F-132 |
| F-162 | Verified Work History Network & Graph | Verification | 5 | Ph4 | F-94, F-84 |
| F-163 | Credential Wallet & Portability | Credential | 3 | Ph5 | F-96 |
| F-164 | Skills Evidence Narrative & Storytelling | Credential | 4 | Ph5 | F-96, F-26 |
| F-165 | Diversity, Equity & Inclusion Data System | Analytics | 3 | Ph8 | F-119 |
| F-166 | Interview Performance Benchmarking | Analytics | 5 | Ph4 | F-88, F-102 |
| F-167 | Candidate Comparison & Rubric (Enhanced) | Hiring | 5 | Ph3 | F-88, F-103 |
| F-168 | Hiring Prediction & Success Modeling | Analytics | 3 | Ph5 | F-88, F-105 |
| F-169 | Community Contribution Scoring & Recognition | Community | 5 | Ph7 | F-55, F-144 |
| F-170 | Expert Network (Enhanced) | Community | 4 | Ph7 | F-144, F-90 |
| F-171 | Employer Brand Management System | Company | 3 | Ph8 | F-56, F-75, F-149 |
| F-172 | Advanced Compensation Intelligence | Analytics | 4 | Ph8 | F-86, F-98, F-109 |
| F-173 | Company-to-Skills Mapping | Intelligence | 3 | Ph4 | F-84, F-04 |


## Appendix B. Governance rules (from GOVERNANCE.md, IMPLEMENTATION_PLAN.md)

| Rule | Content |
|---|---|
| Document ownership | SSOT = intent; PRD = product/business; TRD = technical requirements; root ARCHITECTURE = architecture as built (enforceable current state); TARGET_ARCHITECTURE = intended architecture; UI/UX = visual/interaction; SECURITY = security/privacy/AI/assessment; TESTING = verification; FEATURE_REGISTRY = features; APP_FLOW = application journeys; WORKFLOWS_AND_BUSINESS_RULES = behavioural corpus (now a pointer); IMPLEMENTATION_PLAN = execution order; AGENTS = coding-agent operation; CODE_STYLE = conventions; DATABASE/API = current storage and HTTP references; BRAIN = conceptual model |
| No duplication | A definition lives in one canonical place; others reference it |
| Traceability chain | Business outcome - user need - journey - feature - requirement - data/API/event - implementation - test - release gate (cross-cutting for permission, privacy, security, observability, analytics) |
| Documentation sync | Any change that alters canonical behaviour updates the relevant artifact in the same change set |
| Historical material | Prior editions are evidence/provenance only and cannot override current decisions |
| Status vocabulary | PLANNED, IN DEVELOPMENT, IMPLEMENTED, VERIFIED, RELEASED; side states BLOCKED, DEPRECATED, REJECTED |
| Exit gates per phase | User outcome, architecture integrity, security, accessibility, tests, observability, documentation, rollback/recovery |
| Sequencing rule | Do not start downstream implementation merely because a feature has high priority; blocking dependencies must be ready or intentionally mocked with a documented exit path |

## Appendix C. Journeys, graph model, TRD technical requirements

J-02 Apply - Track - Hire: browse jobs - filter - view detail - apply - completeness gate - autosave draft - submit - recruiter notified - recruiter screens - shortlist - schedule interview - interview - scorecard - hiring-manager review - offer - accept - hire recorded. Built: browse/apply/withdraw/pipeline/notifications; scorecard, interview and offer terminals not established.

J-26 Career Switcher: target role - F-91 readiness - skills gap? - F-95 transition plan - F-84 suggests learning - F-07 courses - F-08 challenges + F-69 assignments - F-96 skill evidence - F-85 career-graph comparison - ready? (no: back to plan) - apply via F-04 - F-88 interview platform - hired and outcome tracked. Built: UI pages exist, data ephemeral.

BRAIN graph model: Talent Graph = skills, competencies, capabilities, prerequisites, relationships. Evidence Graph = evidence, provenance, verification, credentials, recency, conflicts, outcomes. Career Graph = goals, transitions, experiences, learning, applications, interviews, outcomes. Matching: hard constraints first, then capability, evidence, experience, preferences, recency, uncertainty. Privacy: same data, different visibility by purpose; never one public/private boolean.

TRD technical requirements not in section 7: AI path Feature - identity - entitlement - data classification - policy - assessment context - provider selection - execution - output validation - provenance, with no paid free-user cloud inference outside policy; an active assessment session carries policy context and the gateway checks it on every AI invocation; each feature declares offline behaviour (READ_OFFLINE, WRITE_OFFLINE, QUEUE, SYNC, CONFLICT, SERVER_REQUIRED) and no secure assessment or server-authoritative decision relies on offline authority; CI must run lint/format, typecheck, unit/component, build, migration checks, authorization/RLS tests, API contract tests, security scans, critical E2E, accessibility smoke and performance checks for release-critical paths; frontend rules: feature-oriented modules, shared UI only after demonstrated reuse, no domain mutation from presentation components, URL state for shareable filters; backend rules: thin routes, use-case services, domain invariants in the domain layer, repository ports, no duplicated logic in controllers; API: consistent error contract, idempotency on retriable side effects, cursor pagination, allow-listed filters/sorts, rate limiting, request/trace ids.

## Appendix D. Documentation conflicts and resolved gaps retained from GAP_ANALYSIS.md

| Ref | Content | State |
|---|---|---|
| C-3 | Test counts and scope (1,172 Vitest/115 files, 5 migration-helper tests, 10 typechecks, lint failed on 7 files; PG and browser not run) | Dated; K-01 |
| C-4 | Migration count (41/46/51 variously); README and index moved to 51; actual now 55 | Superseded |
| C-6 | Registry status ownership: registry is an identity inventory; status lives in the audit | Resolved by separation |
| C-7 | Stray Obsidian vault `TalentSphere/` (template note, empty note, `.obsidian` config) | Owner: delete or keep; Prettier ignores it |
| C-10 | Stale duplicate copies of SSOT sections (WORKFLOWS_AND_BUSINESS_RULES 11-26, DATABASE 15-22 and 31-32, UI_UX Appendix D) replaced with pointers 2026-10-21; the registry's 8 MIG rules moved into BUSINESS_RULE_REGISTRY; J count is 28 | Resolved |
| C-11 | `.prettierignore` listed deleted `FINAL_DOCUMENT_INDEX.md` (protected file, harmless; still listed) | Owner authorisation to remove |
| C-12 | Reticle instructions duplicated in `CLAUDE.md`, `AGENTS.md`, `.claude/commands/reticle.md` (managed block rewritten by `reticle init`) | Owner choice |
| C-14 | ADR-015 not ratified; migration 00043 drops `employment_references.token` | K-11 |
| C-16 | Migration inventory counts are dated snapshots; presence is not execution proof | Verify populated migration and recovery before release |
| Resolved gaps (15) | Direct table API vs domain API: browser uses application API; AI platform late: gateway/policy foundation in Phase 0; oversized shared kernel narrowed; 173 features separated from GA scope; consumer AI subscription separated from API authorization; free-AI cost hard policy; assessment AI escape routes closed by session-aware gateway; candidate-level hiring prediction reframed as governed/descriptive; retention policy-driven; conservative configurable cohort suppression; hash commitment no longer called ZK (VC 2.0 target); LinkedIn adapter-only; realtime advisory; queue exactly-once confusion replaced by idempotent side effects; production-ready documentation claims separated from runtime readiness | Resolved in specification |
| Remaining decision-gated | Legal review of interview recording; licensed market-data providers; media provider selection; institution controller/processor model; pricing validation; optional proctoring; AI provider support matrix; regional compliance mappings | Open |
| Verification gaps (documentation cannot close) | Executable implementation, deployment, penetration evidence, accessibility conformance, performance under load, backup/restore drill, incident-response drill, AI evaluation, assessment anti-cheat validation | Open |
| Gap closure rule | Owner - evidence required - decision - implementation impact - test - acceptance - closure date | Process |

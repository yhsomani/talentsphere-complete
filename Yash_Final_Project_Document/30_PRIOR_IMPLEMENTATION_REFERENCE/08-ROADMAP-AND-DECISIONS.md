# 08 - Roadmap, Debt, Decisions and Open Conflicts

> **Reference only — prior attempt.** This file analyses an EARLIER implementation attempt. For this project nothing is assumed implemented: labels such as `Implemented-verified` describe what the prior attempt's code reportedly did, not the state of this project. Target design lives in `Yash_Final_Project_Document/` folders 00-29; founder intent is the root `SSOT.md`.

Canonical home for: outstanding work, technical debt, the decision (ADR/OD) register, open questions and source conflicts, built-versus-target comparison, migration considerations.
Requirements and status labels: [01](01-PRODUCT-REQUIREMENTS.md) (label legend in 01 section 0.1). Architecture as built: [02](02-ARCHITECTURE.md). Tests and operations: [07](07-TESTING-AND-OPERATIONS.md).

As-of 2026-10-26. Item statuses marked "code-checked 2026-10-26" were confirmed by reading source in this consolidation; all others are copied from the dated report named and may be stale. Nothing here was executed. No owner ratification is implied by any plan below; plans and the target blueprint are Proposed-only unless stated.

## 1. Where the project stands

| Fact | Evidence |
|---|---|
| Fastify modular monolith + React PWA + Postgres worker; core career loop (accounts, profiles, orgs, jobs, applications, evidence, work history, references, notifications, messaging, revoked sessions) persisted through `persist()` with an in-process read model; 197 of 278 unique routes (71%; 78 durable + 3 stateless, counted from `durability.ts` and the route registrations) in-memory and labelled `x-talentsphere-durability: ephemeral` | ADR-015; `apps/api/src/durability.ts` |
| One API writer per database (advisory lock); horizontal scale blocked | ADR-015 |
| Verdict of every audit: not production-ready; ready for a closed developer-run demonstration of the core loop. A restricted owner-approved beta is recommended by the 2026-10-21 plan but not approved | IMPROVEMENT_PROGRAM I; FEATURE_STATUS A; re-audit 2026-10-23 |
| Production gate open: no live email proof, no live billing proof, no legal sign-off, no restore/rollback drill, no deployed single-writer topology evidence, no pen test | audits; `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` |
| GitHub issues #44-#50 all open at last audit (#44 email, #45 privacy/erasure, #46 ADR-015/hosted migration, #47 deployment/restore, #48 durable beta modules, #49 trust/interview/token storage, #50 commercial policy/payment) | re-audit D |

## 2. Outstanding work

### 2.1 Release-gating findings (registers merged; one row per distinct item)

Status codes: OPEN, FIXED-SRC (fix visible in source, live proof pending), DECISION (owner call needed), BLOCKED (external access/approval), STALE (source doc no longer true).

| ID(s) | Finding | Status 2026-10-26 | Evidence |
|---|---|---|---|
| D-01 / SEC-challenge | Unexecuted challenge text got `passed`/100 | FIXED-SRC (code-checked): `evaluateChallengeSubmission` returns `submitted`, score 0, `executed:false`, no XP (commit 77cb8bd6). Real sandbox still absent (BL-017, OPEN-27) | `packages/domain/src/assessment.ts` |
| D-02 / R2-07 | Worker batch lease expires before sequential jobs run; stale acks | FIXED-SRC (code-checked): fenced acks (`fence: record.attempts`), claim only what fits in a lease (commits 292ceec3, 4d2963e5, 52705d34). Real two-worker PG kill drill and heartbeat aging under slow batch unproven | `apps/worker/src/claim.ts` |
| D-03 | Erasure commits deactivation before all cleanup | FIXED-SRC per commit 9755add4 "resumable and idempotent" (not re-read in detail). Policy still open: immediate vs 30-day grace, due-date scheduler, backups, Stripe customer when billing disabled (R2-05) | K-07; BL-006 |
| D-04 / #44 | No live email proof (sender/DNS, inbox, monitoring) | BLOCKED: provider is now Brevo (Resend removed 2026-10-24); BL-003 still names Resend (STALE text) | K-04 |
| D-05 / #48 | Visible state ephemeral (drafts, network, alerts, LMS, portfolio) | OPEN | 01 section 6.2 |
| D-06 / #46 / #47 | No exact-SHA CI/PG/browser acceptance, populated migration, hosted RLS, restore/rollback/load evidence | BLOCKED | audits |
| D-07 | Windows secret-scan test passed on shell failure | FIXED-SRC per commit 52705d34 "fail-closed secret scan" (not re-read) | |
| D-08 | Prettier gate red on 7 files (incl. `graphify-out/`) | PARTLY: `.prettierignore` now excludes `graphify-out/`, `.agents/teamwork/`, `docs/`, `BRAIN/` (code-checked); other files not re-measured | |
| D-09 | LMS certificate/evidence minted by lesson completion without the BR-048 final-assessment threshold; completion mutated before durable write | OPEN (code-checked: completion block mints `authority_verified` evidence with no assessment read) | lesson-completion route in `apps/api/src/server.ts` (block that sets `authority_verified`) |
| D-10 | Certificate revocation and evidence revocation independent | OPEN (not re-read); migration 00055 adds RLS for revocations only | FEATURE_STATUS F |
| O-01 / K-11 | ADR-015 and migration 00043 not ratified | DECISION | ADR-015 |
| O-02 / #50 | Beta vs GA scope; free-only vs paid | DECISION; code supports `BILLING_MODE=stripe`, default disabled | K-02, K-12 |
| O-03 / #49 | Trust, sessions (cookie vs localStorage), real executor, badge scoring | DECISION | K-19 |
| SEC-01 / BL-001 | Corporate-email code hashed with plain SHA-256 over public id (`sha256Hex(\`${id}:${code}\`)`) | OPEN (code-checked: corporate-email challenge creation in `server.ts` stores `codeHash` from `sha256Hex` over `id:code`) | rainbow table over 10^6 codes if DB read leaks |
| SEC-02 / BL-002 | Referee token indefinite | FIXED-SRC (code-checked): `REFERENCE_LINK_TTL_MS` 30 days from `requestedAt`; view returns 404, submit 403; no `expires_at` column and BL-002's 410 contract was not adopted | CF-10 |
| SEC-03 | 197 of 278 unique routes (71%) ephemeral (older reports: 217-220 of 274) | OPEN (see D-05) | |
| SEC-04 | API connection bypasses RLS | OPEN by design; tenant isolation is app-layer | |
| SEC-05 / BL-009 | `AI_PROHIBITED` assessment sessions in memory | OPEN (code-checked `assessmentSessionsById` Map) | |
| SEC-06 / BL-010 | AI tier hardcoded free | PARTLY (code-checked): tier now derives from entitlements via `aiTierForPlan`; usage meter still in memory | PRICING review notes |
| OPS-01 | Boot hydration O(N); single-writer ceiling | OPEN | ADR-015 exit path |
| OPS-02 / BL-005 | Oracle Caddyfile proxies only `/api/*`, so `/health` returns the static page | OPEN (code-checked `deploy/oracle/Caddyfile`); Coolify variant adds healthchecks (commit 8313b294) | protected build file |
| BL-007 | `test:security` uses `--dir` | OPEN (code-checked `package.json` line 17); protected build file | |
| BL-008 | `.prettierignore` entries | DONE (code-checked) | |
| R2-01 | CI failure `account-security.spec.ts:127` (aborted navigation) | Fix proposed in review branch; CI confirmation unknown | |
| R2-02 / CF-13 | Hosted Supabase: custom HMAC identity vs `auth.users`; hosted project had 0 app tables (2026-10-23) | BLOCKED; `supabase/hosted/README.md` records 00001-00055, alias views and the Data API lockdown applied 2026-10-23 to the named project with all tables empty and a ledger row per file; caveat: 00001-00038 were applied in grouped batches so their checksums record repo files, not proof of byte-identical SQL; hosted two-user RLS test and restore drill unproven; current live state not re-observed | HOSTED_SUPABASE_MIGRATION_GATE |
| R2-03 | Stripe test account: 0 webhook endpoints; webhook endpoint not registered until public HTTPS URL | OPEN (manual configuration) | PRICING; STRIPE audit |
| R2-04 | `CheckoutPage.tsx` comment/copy said free-only | Partly addressed by 2026-10-24 web work (plan table, meter); live paid CTA only when server reports Stripe checkout enabled | PRICING |
| R2-06 / O-2 | `charge.dispute.created`, `invoice.voided` unhandled | OPEN (refund handling decided 2026-10-23) | STRIPE audit |
| R2-09 | Same-second Stripe event ordering | OPEN (potential only) | |
| O-1 (Stripe) | Two concurrent Checkout sessions can both be paid; the second is ignored but billed | DECISION | |
| O-3, O-5 | `billing.subscription.synced` dispatched after commit (lost on dispatch failure); webhook shares global rate limit (300/min/IP) | OPEN | |
| O-4 | `fastify` 5.12.2-5.12.5 low advisory GHSA-389g-gv7q-r4x8 (fixed 5.12.6) | OPEN: needs protected `package.json` edit | |
| M-1 (E2E) | Maintenance mode only changes diagnostics | OPEN (decide exemptions, 503 otherwise) | |
| B03b/B03c/E15c | Weak passwords (`password`, `12345678`) accepted; length >= 8 only | DECISION (sign-up rule change; SSOT asks zxcvbn >= 3) | |
| C26, H03, F13, N02b | No CSP on API/prod web host; 38 px select on mobile; state-machine wording; Connect button stays after pending | OPEN, low | E2E_AUDIT |
| CF-11 | Email proof domain match only when role has company website | DECISION | |
| CF-12 | Market signals now admin-only | FIXED | system-model 03 |
| CF-14/16 | Org membership role not checked on job/applicant management; org owner lacks `recruiter` role | DECISION | |
| CF-15 | SSOT job approval / `rejected_by_moderation` vs recruiter self-approval, draft-to-published direct | DECISION | |
| CF-22/23/24 | `declined`/`flagged` reference states never set; enqueue errors swallowed; reclaim ignores attempts | OPEN | |
| CF-25/26 | UI offers drafts/alerts while ephemeral; Settings digest toggles and Privacy claims (k>=10 Laplace noise, purge in 30 days) lack implementation | OPEN: verify or remove claims | |
| CF-27 | Interview code evaluation simulated; fails closed in staging/production | OPEN (BL-017 sandbox) | |
| CF-28 | Six routes without navigation link (`/portfolio`, `/resumes`, `/network`, `/learning`, `/career`, `/assessments`) | DECISION | |
| #47 / BL-004 | Terms and Privacy pages need counsel review; monitored contact mailboxes | BLOCKED | |

Full defect narratives: `docs/reports/FEATURE_STATUS_2026-10-21.md` F, `docs/system-model/03-conflict-register.md` (CF-xx), `PAYMENT_AUDIT_2026-10-23.md`, `STRIPE_SUPABASE_AUDIT_2026-10-23.md`, `REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`, `ARCHITECTURE_DURABILITY_REPORT.md`, `E2E_AUDIT_2026-10-21.md` (all dated; retain as history).

### 2.2 Feature backlog

| Bucket | Content | Status |
|---|---|---|
| UI missing for built APIs | Moderation queue (F-24), gamification XP/leaderboard/badges (F-22/23), analytics KPIs (F-19/31), AI assistant chat (F-11), application drafts (F-36), job templates (F-37), referrals/warm intros (F-121/142), endorsements (F-110/150), skills graph/career tabs (F-84/85/95), interview room (F-33/88), search wiring (F-34) | Partial |
| Persistence for long tail | LMS, assessments, drafts, alerts, portfolio, network, admin config, AI usage meter, then reputation/salary/talent pools; one vertical slice at a time, never a blanket rewrite | Proposed-only (X-01, Stage C) |
| Missing digest/nudge jobs | F-29 digest sender, F-30 nudges, F-31 rollups | Not implemented |
| Not implemented (75) | 01 section 6.3 | Planned-approved (SSOT phases 4-10) |
| Gated / excluded | Proctoring, premium candidate, predictive hiring, sponsored content, BD graph | See 01 section 3.3 |
| New ideas recorded in plans | Member directory for network search; email-verified recruiter outreach | Proposed-only |

### 2.3 Planned-work vocabularies (K-06)

| Plan | Phases | Source | Status |
|---|---|---|---|
| SSOT 23 | Ph0 Foundation; Ph1 Candidate core + Skills Graph + Migration Center v1; Ph2 Marketplace + media + social v1 + skill evidence + career readiness; Ph3 Recruiter suite + institutional + career intelligence; Ph4 AI copilot + learning impact + career transition; Ph5 Trust and scale + peer learning; Ph6 Enterprise expansion; Ph7 Learning marketplace + expert network; Ph8 Social parity + verification depth; Ph9 Insights and assessment; Ph10 Decision-gated | Planned-approved (capability-driven, dates absent); Appendix A D-15 "FC-19 Phase 6 governs" |
| IMPLEMENTATION_PLAN (founder order) | 0 Platform trust foundation; 1 Career identity; 2 Evidence and learning; 3 Opportunity loop; 4 Hiring depth; 5 Intelligence; 6 Trust and ecosystem; 7 Institutional/enterprise; 8 Advanced AI; 9 Expansion; 10 Scale. Exit gates per phase: user outcome, architecture integrity, security, accessibility, tests, observability, documentation, rollback/recovery. First epics: monorepo, CI, DB/migrations, auth, authz/RLS, audit, API contract, PWA shell, design system, observability, profile, ontology, evidence, learning, assessment, jobs, applications, recruiter workflow, career graph, AI gateway | Planned-approved; titles differ from SSOT 23 for the same numbers |
| RELEASE_SCOPE (2026-10-22) | Stage A hardening (BL-001,002,003,004,005,007,008); B core-loop GA launch free tier (BL-006,009,010); C durability (BL-011,012,013,015, portfolio, admin); D monetization (BL-016); E sandboxed code execution (BL-017); F ecosystem/reputation (BL-014, career UI, alumni/intros) | Proposed-only |
| FEATURE_PLAN (2026-10-21) | Epics X-00 baseline/scope, X-01 one durable journey at a time, X-02 real verification delivery, X-03 commercial decision, X-04 optional offline, X-05 honest assessment, X-06 worker claims, X-07 recoverable erasure, X-08 ADR-015 + populated migration, X-09 operations/release acceptance, X-10 verification reliability, X-11 course completion trust. Sprints S0 baseline; S1 trust integrity; S2 verification + privacy; S3 restricted beta loop; S4.n full-loop increments; S5 operational release; S6.n expansion. Sizes S/M/L only; no dates | Proposed-only; supersedes blanket persistence rewrite, missing-email-adapter assumption, registry-derived P0 labels |
| Blueprint (target) | Ph0 foundations and spikes (federation spike optional, sandbox runner decision, device lab, monorepo/CI, policy core, DB base, contracts, observability, load baseline); Ph1 career-loop foundation = pre-GA pilot; Ph2 complete-loop GA candidate; Ph3 institutions and intelligence; Ph4 community and optional. 60 work packages (3 conditional migration), no dates; gates Ph0-Ph1, Ph1-pilot, Ph1-Ph2, Ph2-GA (full SSOT loop), Ph2-Ph3, Ph3-Ph4 | Proposed-only (revision required) |

SSOT MVP exit (7 criteria) and institutional exit (5 criteria): 01 section 7 (Release row). Go-live gates PROD-001..024: SSOT 37.6 (not met).

### 2.4 Backlog items BL-001..BL-018 (RELEASE_SCOPE doc) with current status

| ID | Urgency | Item | Status 2026-10-26 |
|---|---|---|---|
| BL-001 | P0 | HMAC-key corporate email code hash | OPEN |
| BL-002 | P0 | Referee token expiry | FIXED-SRC (30 days, 404/403 not 410, no column) |
| BL-003 | P0 | Staging mail DNS and credentials (written for Resend) | BLOCKED; provider now Brevo |
| BL-004 | P0 | Legal review of Terms/Privacy | BLOCKED |
| BL-005 | P0 | Caddy `/health` proxy | OPEN (Oracle); Coolify healthchecks added |
| BL-006 | P1 | Scheduled 30-day erasure executor | OPEN (policy K-07) |
| BL-007 | P1 | `test:security` script fix | OPEN (protected file) |
| BL-008 | P1 | `.prettierignore` for caches | DONE |
| BL-009 | P1 | Persist assessment sessions | OPEN |
| BL-010 | P1 | AI tier from entitlements + durable meter | PARTLY |
| BL-011 | P2 | Challenges durable | OPEN |
| BL-012 | P2 | Assessments page wired | PARTLY (UI says not executed) |
| BL-013 | P2 | LMS durable | OPEN |
| BL-014 | P2 | Reputation visibility consent setting (BR-167 gate exists, UI deferred) | OPEN |
| BL-015 | P2 | Draft autosave durable | OPEN |
| BL-016 | P3 | Stripe checkout/lifecycle | FIXED-SRC (PR #71, migrations 00052/00053); live unverified |
| BL-017 | P3 | Containerized code sandbox | OPEN (OPEN-27 build-vs-buy) |
| BL-018 | P3 | Dockerfile pruning below 250 MB | Unknown |

## 3. Technical debt

| Debt | Impact | Direction (not decided) |
|---|---|---|
| `apps/api/src/server.ts` 13,416 lines, 145 `new Map`, 278 unique routes (code-checked) | Review cost, hidden coupling, inline authorization | Split per context sharing injected stores; no rewrite justified by size alone (FEATURE_STATUS E; roadmap P2) |
| Ephemeral long tail (197 of 278 routes, 71%) | State lost on restart | Per-slice persistence via `persist()` (ADR-015 pattern) |
| In-process read model + O(N) boot hydration + single writer | Scale ceiling, stale reads after out-of-band SQL | Move reads to SQL per module, delete Maps; required before a second replica |
| API DB role bypasses RLS | Policies untested by the app path | Restricted role or documented boundary (SEC-04) |
| Inline / inconsistent authorization; org role not checked | IDOR/privilege risk | Central policy (blueprint ADR-T07) or per-handler audit (`docs/system-model/06-route-authorization.md`) |
| `JobQueueEngine` unused but unit-tested | Dead code, two scheduler concepts | Keep reserved or delete with test (IMPROVEMENT H9; INVARIANT-012) |
| Workers: leases not generation-fenced end to end; enqueue failures swallowed; reclaim ignores attempts | Duplicate effects | Finish fencing, bounded concurrency, PG two-worker drill |
| Session token in localStorage, 24 h, no refresh flow | XSS-readable bearer | Cookie + CSRF design needs owner approval (K-19) |
| No generated OpenAPI; pagination, idempotency-key, ETag layers absent | Contract drift | Tracked as DOR-001/008/009 |
| Two audit trails (SQL admin audit vs observability audit interface) | Coverage/retention unknown | R-6 |
| AI: tier/consent differ between assistant paths; usage meter ephemeral | Quota bypass, reset | R-4, SEC-06 |
| PWA claims without service worker; maintenance mode inert | Misleading UX/ops | X-04, M-1 |
| Docs: multiple ADR lists, stale counts in SSOT end-state/BRAIN/INDEX, duplicate Reticle block in `CLAUDE.md`/`AGENTS.md`/`.claude/commands/reticle.md`, stray `TalentSphere/` Obsidian vault (ignored by Prettier), `.agents/teamwork/` agent artifacts, root `ARCHITECTURE.md` formatting | Drift | This consolidated set; owner picks which sources to retire |
| Audit-script/test hygiene: tests import built `dist` (stale builds mislead); memory-mode tests dominate; 32 historical tests configured settings the API ignored (fixed) | False green/red | Fresh build gate before claims; PG + browser required |
| `pnpm.ps1` blocked on Windows PowerShell | Dev friction | Use `pnpm.cmd` |
| Cleanup audit leftovers: ~290 unused exported types, 108 unused test-setup variables, 2.72% duplication (legal pages inline styles, `Icons.tsx`) | Noise | Rewrite with legal review; no behaviour impact |
| Registry integrity: 50 canonical vs 111 created tables; routes in APP_FLOW not built; BR duplicates | Misleading target docs | Banners exist; owner chooses target vs built (K-13, K-14) |

## 4. Decisions

### 4.1 Founder amendments (SSOT v6, ratified intent; Planned-approved)

| ID | Decision | Rationale |
|---|---|---|
| A1 | Initial architecture: React + TS + Vite PWA, Node + Fastify + TS modular monolith, PostgreSQL/Supabase | Simplicity before scale |
| A2 | Browser domain mutations go through the application API; RLS protects DB access but is not the only business-logic boundary | Server-authoritative rules |
| A3 | Async: Supabase Queues + dedicated workers (durable/heavy); Edge Functions for webhooks, short HTTP, bounded AI orchestration | Built differs (Postgres `background_jobs`, no Edge Functions; K-03) |
| A4 | Search: PostgreSQL FTS/trigram until measured evidence justifies extraction | Cost; not integrated in runtime |
| A5 | Realtime advisory only; persistence authoritative | Correctness |
| A6 | Caching: browser/app caching and TanStack Query first; distributed cache only on measured need | Built has no TanStack Query |
| A7 | Shared kernel deliberately small | Avoid indiscriminate shared kernel |
| B | GA proves the trusted career loop; 173 features preserved for traceability, not a GA target | Focus |
| C | AI Gateway foundational; one "My AI" configuration; provider authorization distinct from subscription; free users no paid inference; local AI optional; AI output never silently becomes evidence | Cost, trust |
| D | Assessment AI policy propagates to every AI entry point; hiding UI is not enforcement | Integrity |
| E | Candidate-level predictive hiring excluded from GA absent governance, validation, fairness, human-control and legal review | Risk |
| F | Evidence lineage append-only in meaning; credentials have lifecycle; portable standards optional and not misrepresented | Trust |
| G | Retention, cohort thresholds, compensation rules are policy configuration; DPDP mapping needed before compliance claims | Legal |
| H | Specification-complete is not production-ready; readiness needs executable evidence across security, integrity, tests, accessibility, performance, reliability, backup/restore, operations, privacy, rollback | Honesty |

### 4.2 ADR registers (three namespaces plus proposals; K-10)

SSOT intended register (SSOT 21.3; 13 locked):

| ID | Decision | Built status |
|---|---|---|
| ADR-001 | Supabase Auth as initial identity authority behind an identity abstraction | Not built; superseded in practice by built ADR-004 |
| ADR-002 | React/Vite PWA + Fastify TS modular monolith + PostgreSQL/Supabase + managed infra | Built except Supabase platform services |
| ADR-003 | Baseline relational tables + operational extensions, RLS/grants, deny-by-default tests | Partial (111 created tables, 130 RLS statements per 2026-10-21 measure; API bypasses RLS) |
| ADR-004 | Realtime optional; DB state authoritative | No realtime built |
| ADR-005 | Stripe webhook idempotency + demo stubs | Stripe built; simulated mode refused in production |
| ADR-006 | Chrome extension local-first | Not built (F-18 absent) |
| ADR-007 | Provider-agnostic media | Not built |
| ADR-008 | Institutional tenancy | Not built |
| ADR-009 | Durable queue + dedicated worker; Edge Functions for short work | Partial: Postgres job table + worker; no Edge Functions; no dual queue |
| ADR-010 | RLS policy template generator | Not found |
| ADR-011 | Media model authoritative for lesson content | Not built |
| ADR-012 | DDD domain boundaries + feature-oriented frontend + design primitives | Partial |
| ADR-013 | Cross-domain via events or application-service interfaces only | Partial; coupling inside `server.ts` |

Built register (root `ARCHITECTURE.md` 26; status per that file):

| ID | Decision | Rationale / trade-off | Status |
|---|---|---|---|
| ADR-001 | Fastify modular monolith | Shared domain boundaries; split only on measured need | Accepted (in force) |
| ADR-002 | Pure domain business functions | Testability, framework independence | In force |
| ADR-003 | In-memory persistence | Superseded for core by ADR-015 | Superseded |
| ADR-004 | Self-issued HMAC sessions | No external IdP; needs stable secret, explicit revocation; provider adoption is a security decision | In force |
| ADR-005 | Shared Zod contracts | One request-shape owner | In force |
| ADR-006 | Central error envelope | Consistent clients/logs | In force |
| ADR-007 | Local heuristic AI | No external inference cost; remote provider needs explicit approval | In force |
| ADR-008 | Early memory queue engine | Superseded at runtime by durable claim loop; engine retained unused | Superseded |
| ADR-009 | Early SQL-as-text migration guard | Runner now executes SQL; checksum/honesty tests remain | Superseded |
| ADR-010 | pnpm, packages before apps | Built workspace deps required | In force |
| ADR-011 | Reticle for visible changes | Real flow verdict required | In force |
| ADR-015 | Persist core loop; Maps as boot-hydrated read model; single writer; `persist()` in one transaction; `base` concurrency guard (409); migration 00043 aligns schema, hashes reference tokens, partial unique index for BR-15, case-insensitive unique email; exit path: move reads to SQL | Accepted for branch; pending owner ratification; schema/constraint-changing; check duplicate emails before applying 00043 to populated DB | Pending (K-11) |
| ADR-016 | Browser-measured UI quality gates (accessibility, responsive, hostile-user, UI sweep) in Chromium | Reuses fixtures/CI; ~4.6 min full run on one worker; revisit visual regression | Proposed (test strategy only) |
| ADR-014 | unassigned | | |

Target blueprint register (all Proposed-only; ARB has not ratified): T01 verified career-evidence platform with scope discipline; T02 PWA-first, no store packaging; T03/T23 bundled lazy modules default, federation only with three independent teams + independent-release need + passing spike (T23 pending ratification); T04 modular monolith + worker; T05 PostgreSQL only system of record, SQL reads, RLS, transactional outbox; T06 cookie sessions (`__Host-` access, rotating refresh with reuse detection, passkeys, CSRF header), remotes never read tokens; T07 central policy module with `can()`; T08 REST/OpenAPI 3.1, RFC 9457 errors, cursor pagination, `Idempotency-Key`, ETag; T09 outbox + fenced leases; T10 offline tiers (queue only drafts/profile/compose/notes), T10a Ph1 read cache + local drafts; T11 Postgres FTS + trigram + pgvector behind `SearchPort`; T12 AI gateway only path, budgets, blocked in `AI_PROHIBITED`; T13 code assessments only in isolated network-less runner, otherwise `unverified`; T14 evidence ladder claimed - artifact-backed - peer-attested - authority-verified, T14a `issuer_class`; T15 Stripe-only, webhook authoritative; T16 OpenTelemetry; T17 pnpm monorepo, affected-only CI; T18 versioned host contract; T19 federation is fault containment not security isolation; T20 email via provider port (Brevo default), Web Push for installed PWAs; T21 row-level `org_id` tenancy + RLS; T22 explainable never pay-to-rank matching; T24 prerender public job/profile pages (proposal). Each carries a challenge and revisit trigger in `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/ADR_REGISTER.md`.

Numbering: `TARGET_ARCHITECTURE.md` 21.3 text (ADR-001 "Supabase Auth sole session authority", ADR-003 "50 canonical tables"), SSOT ADR-001..013, `ARCHITECTURE.md` ADR-001..011, ADR-015/016 and blueprint ADR-T* collide; ADR-015 header says it supersedes "ADR-003 in ARCHITECTURE section 26". Owner must adopt one register (K-10).

### 4.3 Open Decision register (SSOT 41.1; OD-01..OD-53; locked count says 58, K-22)

| ID | Decision | Recommended | Blocks |
|---|---|---|---|
| OD-01 | Workspace primary metric | Active learners | Ph1 |
| OD-02 | Curriculum depth | Module - Lesson | Ph1 |
| OD-03 | Video hosting | Mux | Ph2 |
| OD-04 | AI primary engine | Hybrid (MVD-01) | Ph4 |
| OD-05 | Moderation automation | AI-triage spam; humans for bans | Ph5 |
| OD-06 | Leaderboard reset | Weekly + all-time | Ph2 |
| OD-07 | AI quota and paths | Hybrid (FC-03) | Ph4 |
| OD-08 | Job alert retroactivity | New-only | Ph2 |
| OD-09 | Interview scheduling | Manual at MVP; integration Ph6 | Ph3 |
| OD-10 | Email provider | Resend primary, SendGrid failover (built: Brevo; K-04) | Ph1 |
| OD-11 | Analytics stack | PostHog self-managed | Ph2 |
| OD-12 | Storage buckets | Per-entity with RLS | Ph1 |
| OD-13 | Backup cadence | Daily + 15-min PITR | Ph1 |
| OD-14 | Video transcoding | Mux | Ph2 |
| OD-15 | Institutional pricing | Volume-tier per seat | Ph3 |
| OD-16 | Institutional SSO | Phase 6 | Ph6 |
| OD-17 | Media provider allowlist | Upload+YouTube MVP; Vimeo Ph2 | Ph2 |
| OD-18 | Certificate validity | Perpetual, configurable | Ph3 |
| OD-19 | Institutional retention | 7 years (Legal) | Ph3 |
| OD-20 | White-label | Co-branded first | Ph10 |
| OD-21 | Import row limit | 5k per batch | Ph3 |
| OD-22 | Media analytics attribution | Hybrid with labels | Ph4 |
| OD-23 | Faculty certificate issuance | Configurable | Ph3 |
| OD-24 | Archive max size | 50 MB | Ph1 |
| OD-25 | Migration rollback window | 30 days | Ph1 |
| OD-26 | Contact-hash TTL | 30 days (Legal) | Ph1 |
| OD-27 | Instructor verification | Optional badge | Ph7 |
| OD-28 | Course revenue share | 70/30 default | Ph7 |
| OD-29 | Refund policy | 30 days; pro-rated after 20% | Ph7 |
| OD-30 | Quiz attempts | 3 graded, unlimited practice | Ph7 |
| OD-31 | BD graph | Exclude (SCOPE-003) | Ph10 |
| OD-32 | Sponsored content | Excluded from core | Ph10 |
| OD-33 | Live video | Defer | Ph10 |
| OD-34 | Premium Candidate tier | Profile views + outreach + insights; price TBD | Ph10 |
| OD-35 | Proctoring | Vendor at Ph10 | Ph10 |
| OD-36 | Profile-view privacy default | Semi-anonymous | Ph8 |
| OD-37 | Peer-review minimum | 2 | Ph7 |
| OD-38 | Salary aggregation minimum | Configurable; k>=10 default for sensitive cells (Legal) | Ph9 |
| OD-39 | Certification retake | 7-day cooldown | Ph9 |
| OD-40 | Numeric targets for new metrics | After 90 days of data | Analytics |
| OD-41 | `module_progress` retirement | After Ph7 verification | Cleanup |
| OD-42 | Course publish review SLA | 72 h | Ph7 |
| OD-43 | Coupon max discount | 75% | Ph7 |
| OD-44 | Contest infrastructure | Reuse sandbox, separate pool | Ph9 |
| OD-45 | Anonymous reviews | Yes with credibility badge (Legal) | Ph9 |
| OD-46 | Skills graph build vs license | Build; licensed signals are adapters | Ph1 |
| OD-47 | Salary data source | User submissions + licensed market data | Ph3 |
| OD-48 | Interview recording default | Off, opt-in per interview | Ph3 |
| OD-49 | AI feedback in interviews | Communication signals only | Ph4 |
| OD-50 | Expert network | Hybrid free + paid calls | Ph7 |
| OD-51 | Learning impact claims | Correlational unless causal method validated | Ph4 |
| OD-52 | DE&I analytics minimum | k>=10 with suppression | Ph8 |
| OD-53 | API pricing tier | Enterprise-only | Ph10 |

Structural decisions D-01..D-05: 7 consolidated bounded contexts; confirm realtime/polling boundary; dual queue = Postgres + dedicated worker (ADR-009); full Atomic Design; FERPA severance by logical anonymization. Pre-implementation blockers DOR-001..026: API error contract, versioning/deprecation, migration order/ownership, seed/fixtures, environment ladder, secret provisioning, rate-limit numbers, pagination/filter/sort, idempotency-key contract, time/timezone, money/currency, upload limits, feature-flag lifecycle, migration rollback, local onboarding, DoR/DoD gate, retention/erasure SLAs, concurrency/conflict rule, consumer OAuth delegated billing, institutional controller/processor split, media ToS review, transcode/CDN selection, institutional pricing validation, FERPA review, skills-graph build vs license, interview recording dual-consent legal review. Gap register GAP-001..038 and GAP-T1..T8: most "RESOLVED" with FC/TD references; DEFERRED: GAP-009 calendar, GAP-019 gamification intensity, GAP-021 production checkout; UNVERIFIED: GAP-022 provider abstraction (no live model), GAP-029 RLS runtime enforcement, GAP-030 WCAG conformance. Appendix A D-1..D-39 adjudications (e.g. XP 200/day single cap, job expiry 60 d default, duplicate application partial UNIQUE + 90-day cooldown, WCAG 2.2 AA canonical, Phase 6 governs FC-19, indigo sole accent) stay in `SSOT.md`.

### 4.4 Pending owner decisions (consolidated)

| # | Decision | Needed because | Source |
|---|---|---|---|
| 1 | Architecture of record: Fastify monolith (built) vs SSOT Supabase stack vs Next.js/Supabase and Spring Boot documents in circulation | Three architectures; target-vs-built stack | IMPROVEMENT A,H1; C-5 |
| 2 | Ratify ADR-015 and migration 00043 | Schema change before any populated DB | O-01 |
| 3 | Beta scope vs full GA; free-only vs paid | X-03, #50 | O-02 |
| 4 | Email provider/sender/domain approval and live acceptance | #44 | D-04 |
| 5 | Legal review of Terms/Privacy, monitored contacts, retention, erasure semantics (immediate vs 30-day grace), backups | #45, #47 | |
| 6 | Session storage (httpOnly cookie + CSRF + credentialed CORS vs bearer) | TS-007 | K-19 |
| 7 | Trust policy: scoring rule that lets typed skills add 5 points to a verification score; real executor; badge legacy values | #49 | IMPROVEMENT H7 |
| 8 | `JobQueueEngine`: keep reserved or delete | Dead code | IMPROVEMENT H9 |
| 9 | Authorization model (3+24 roles vs 10 vs scoped grants) and org-role checks | CF-14, OPEN-44 | K-05 |
| 10 | Job approval workflow; email-proof domain rule; password policy; maintenance-mode exemptions; whether a verified external source may supply market signals | CF-15, CF-11, B03, M-1 | |
| 11 | Refund/dispute/concurrent-checkout policy; organization-level entitlement owner; free-recruiter posting limit; Candidate Pro vs OD-34 | #50, PRICING | K-12 |
| 12 | Salary and small-cell threshold (k 3/5/10) | C-8 | K-08 |
| 13 | Feature register owner (SSOT 7 vs FEATURE_REGISTRY); table/route target vs built; ADR register | C-13, C-17, C-18, C-20 | |
| 14 | Hosted Supabase target, identity adaptation, populated rehearsal | #46 | R2-02 |
| 15 | Hosting/HA platform (Oracle staging vs Coolify vs managed) and RPO/RTO | Blueprint OPEN-14/23; deploy assets for Oracle and Coolify both exist | |

## 5. Open questions and source conflicts (register of record)

Conflicts are preserved, not resolved. "Governs" states only which source the repository's own authority order points to.

| ID | Conflict | Sources | Governs (per authority order) / state |
|---|---|---|---|
| K-01 | Feature maturity and test counts: 6/87/1/75/4 (2026-10-21); 26 Full/91/6/50 (2026-10-22); 16/78/75/4 (earlier, still printed in SSOT end-state line); BRAIN "51 verified". Test totals 1,072; 1,143; 1,172; 1,182; 1,231. Migration counts 41/46/49/51/52/54/55. Test totals vary by method | FEATURE_STATUS, AUDIT_MASTER, TRACEABILITY_MATRIX, MEMORY, FINAL_VALIDATION, SSOT 5675 | 10-21 audit is "status of record" per INDEX; actual migration files = 55 (code-checked); SSOT header says counts are not maintained there, yet its last line prints 16/78/75 (stale) |
| K-02 | Four GA/beta scope definitions (01 section 6.1) | PRD 8, FEATURE_PLAN G, RELEASE_SCOPE 2, blueprint | Unresolved; owner decision pending |
| K-03 | Intended stack (Supabase Auth/Queues/Edge Functions/Storage/Realtime, TanStack Query, OpenAPI) vs built (HMAC sessions, Postgres `background_jobs`, React state + fetch, no OpenAPI) | SSOT, TRD 2, DATABASE vs `ARCHITECTURE.md` | Built governs for what exists; whether SSOT stack remains target is open (C-5). "No provider SDKs" wording is historical (Stripe SDK and Brevo adapter exist) |
| K-04 | Email provider: SSOT OD-10 Resend; audit docs, BL-003, MEMORY, PR #51 say Resend; source has `EMAIL_PROVIDER` none/brevo and Resend removed 2026-10-24; blueprint ADR-T20 Brevo | env.ts, commit 2aea1085 | Code governs: Brevo, opt-in, live delivery unverified |
| K-05 | Role model: 3+24 (SSOT) vs 10 (built) vs 15/17 scoped (blueprint); registration allows two roles | SSOT 6.1, core.ts, USR-01 | Built governs; mapping unapproved (OPEN-44, C-21) |
| K-06 | Five phase vocabularies (SSOT Ph0-10; IMPLEMENTATION_PLAN 0-10 with different titles; Stage A-F; X-xx/S0-S6; blueprint Ph0-4) | section 2.3 | Unreconciled; blueprint states phase numbers must not be equated (OPEN-42) |
| K-07 | Erasure: SSOT/GDPR matrix 30-day grace + anonymization; built executes core anonymization immediately with request/cancel store, no due-date scheduler; UI erases immediately; Privacy page claims | SSOT 31, settings, IMPROVEMENT H6 | Built behaviour; policy decision open (#45, BL-006) |
| K-08 | Small-cell thresholds: salary k>=5 (BR-135, BR-178, S-07), k>=10 (HDN-026, F-86 AC, BR-220, OD-38), k>=3 (F-87 interviews, company salary BR-180), career data k>=5 plus >=20 samples (BR-158/160), k>=20 (pattern detection), k>=30 (learning impact, BR-189), minors/other | SSOT, registry, FINAL_VALIDATION | SSOT internally inconsistent; owner and legal set one salary threshold |
| K-09 | BR formatting (two vs three digits), semantic mismatch of same ID between SSOT feature prose and registry, duplicate-meaning rules, BR 246 vs 248, MIG numbering | registry, SSOT, C-9 | Registry text governs identity; reconcile feature references by meaning; no BR-249+ |
| K-10 | ADR registers collide (section 4.2) | | Owner: adopt one |
| K-11 | ADR-015 "accepted for this branch, pending ratification" yet running in main; migration 00043 drops `employment_references.token`; case-folded unique email may fail on populated DB | ADR-015 | Pending |
| K-12 | Monetisation: SSOT OD-34 Premium Candidate price TBD / F-61 gated; BR-07 billing for recruiters; PRICING.md codes Candidate Pro $19.99 plus recruiter tiers; free AI quota 20/day (MEMORY, SEC-06) vs 5 req/5k tokens (PRICING after 2026-10-24 alignment); outreach caps BR-130 (Pro/Team/Enterprise) vs 4 coded plans; refund policy OD-29 (30 days pro-rated) vs coded rule (full refund of current-period charge ends access) | SSOT, PRICING, STRIPE audit | Code + PRICING.md govern what exists; prices are unapproved recommendations |
| K-13 | 50 canonical tables + ~185 operational (SSOT 24) vs 111 measured `CREATE TABLE` names and 130 RLS statements | DATABASE, GAP C-17 | Banner exists; owner chooses |
| K-14 | About 30 routes in APP_FLOW not built; `App.tsx` defines its own set; six built routes unlinked | C-18, CF-28 | Source governs |
| K-15 | Metrics/inventory numbers drift (route counts 269/274/277/278 (current code: 278 unique, 281 registrations), pages 19/20/29, migrations) | multiple | Re-measure in 02/05/07; do not copy |
| K-16 | Primary north-star: Verifiable Career Progress (PRD) vs Evidence-Backed Hiring Conversations (blueprint METRICS_CATALOG) | OPEN-51 | PRD governs; unresolved |
| K-17 | Owner of the 173-feature register: SSOT 7 vs FEATURE_REGISTRY (identical except headings) | C-20 | SSOT is detail source; pick one |
| K-18 | Persistence: single-writer hydrated read model (ADR-015) vs SQL-only reads with outbox (ADR-T05); blueprint OPEN-52 | | Built governs; bridge needs approval, hosted-schema adaptation, second-writer exit gate |
| K-19 | Session storage: localStorage bearer, 24 h, no refresh (built, ADR-004) vs cookie BFF + rotating refresh + passkeys (ADR-T06) vs SSOT httpOnly cookie, 1 h access/30-day refresh, JWT `jti` denylist | SSOT F-01, TS-007 | Built governs; change is architecture decision |
| K-20 | Referee link TTL: 30 days (built, SEC-02) vs 14 days with max 2 reminders (BR-T004) vs "no expiry" (stale audit text) | | Built governs |
| K-21 | API contract: SSOT `{success,data,meta}` envelope, cursor default 20, >= 6-month deprecation vs blueprint `{items,page}`, default 25, 90 days; built error envelope with `request_id`, no pagination layer | OPEN-46 | Built governs |
| K-22 | SSOT locked-register inconsistencies: OD table ends OD-53 but count says 58; EVT 72 (20 proposed) vs 72 (32 locked + 40 proposed); J 28 vs 31; BR 248 vs 246; state machines 53 vs 40; ADR 13; P-* 11/U-* 12/INV-* 16/SCOPE-* 8 counts vs listed 12 principles and 15 invariants; IDs P-*, SCOPE-*, FC-01..23, TD-01..26, MVD-01, VER-*, R-*, EVT-*, NFR-*, FEC-*, EC-*, UXC-* are referenced but their tables were not found in `SSOT.md`; internal citation tokens in the research basis are not recoverable | SSOT 42.1, App. B | Unresolved; treat referenced values (FC/TD) as Unknown |
| K-23 | F-01 contract (Supabase Auth, zxcvbn >= 3, age gate DOB >= 16, email verification, reset, OAuth, MFA readiness, p95 < 300 ms) vs built subset (min length 8, no verification/reset/OAuth/age gate) | SSOT F-01, E2E_AUDIT | Built is a subset; scope of missing sub-requirements needs approval (X-00) |
| K-24 | Job approval: SSOT admin approval + `rejected_by_moderation`; built recruiter self-approval and draft-to-published; `scheduled` status absent from `JobStatus` despite BR-11 | CF-15, FEATURE_STATUS F-05 | Built; decision |
| K-25 | Org roles: SSOT recruiter needs `org_id` membership and workspace grants; built accepts any membership for job/applicant management | CF-14 | Decision |
| K-26 | Assessment AI modes: SSOT four (`AI_PROHIBITED`, `AI_RESTRICTED`, `AI_ALLOWED`, `POST_ASSESSMENT_ONLY`) vs blueprint two or three | OPEN-48 | Built enforces prohibited mode only |
| K-27 | Residency: SSOT primary US-East, EU partition Ph3; hosted Supabase target is Mumbai `ap-south-1`; blueprint region undecided (OPEN-30) | | Decision |
| K-28 | Operational targets: vulnerability SLAs 24 h/72 h/14 d vs blueprint 14/60 d; list p95 < 200 ms and 200 KB vs 350/400 ms and 220-400 KB; canary 5/25/50 with 15 s rollback vs statistical canary; RPO 15 min/RTO 2 h vs 5 min/1 h; integration removal drill per release vs semiannual | SSOT 20-22, 30.5 vs blueprint | Both kept; measure then choose (OPEN-49) |
| K-29 | 2026-10-03 production audit judged the product against journeys not in SSOT/PRD (contact management, birthday tracking, AI message generation, message editing; "zero birthday" in every canonical doc); scorecard 4.6/10 | PRODUCTION_AUDIT | Treat those four "Missing" findings as out-of-scope; other P0 findings were fixed per IMPROVEMENT B |
| K-30 | Feature F-58 Written Recommendations: not implemented (10-21 audit) vs Full and in Core Loop scope (10-22 audit); F-65, F-173 same pattern | | 10-21 rule: vocabulary stricter; re-audit needed |
| K-31 | Auth-related target docs say Supabase Auth/RLS sole boundary; ARCHITECTURE: Express/Fastify API with privileged DB connection | | Built governs |
| K-32 | Federation / bundled frontend: not in SSOT; blueprint proposes optional federation with bundled baseline (ADR-T23) | | Not adopted |

## 6. Target blueprint (Yash_Final_Project_Document) versus built

The blueprint is a greenfield redesign produced 2026-10-25 with "no application source modified"; existing repo docs were reference only. Status: Revision Required; nothing ready for implementation.

| Dimension | Built (code) | Intended (SSOT) | Blueprint proposal (Proposed-only) |
|---|---|---|---|
| Identity/session | HMAC token in localStorage, PBKDF2 210k, revocation table | Supabase Auth JWT, httpOnly cookie | Cookie sessions, rotating refresh, passkeys, optional SSO, CSRF |
| Persistence/reads | Postgres writes via `persist()`; Map read model; 197 of 278 routes (71%) ephemeral | Postgres + RLS everywhere | SQL only, outbox, no Maps, replicas |
| Async | `background_jobs` + claim loop, two mail handlers, fenced acks | Supabase Queues + workers + dual queue | Outbox + fenced leases, at-least-once, consumer dedupe |
| API | 278 unique routes in one file, Zod, error envelope, no OpenAPI | REST + OpenAPI, `{success,data,meta}` | OpenAPI 3.1 generated from Zod, RFC 9457 problems, idempotency keys, ETags |
| Authorization | per-handler checks, 10 roles | two-tier 3+24 roles | central `packages/policy` deny-by-default, scoped grants, `/me/capabilities` |
| Evidence model | evidence + verification levels; references with hashed tokens; corporate-email proof | claim vs evidence vs verification, append-only lineage | 4-rung ladder with `issuer_class`; mailbox proof lower badge unless employer-bound |
| Frontend | React 19, router, plain state, no service worker | React PWA, TanStack Query, offline contract | host shell + typed modules, bundled baseline, optional federation, read-cache offline |
| Assessment | challenge submission unexecuted; interview exec simulated and fail-closed | sandbox TD-05 (30 s/512 MB/no network) | isolated runner or `unverified` (ADR-T13) |
| AI | local heuristic, quota, assessment gate | Gateway, My AI, providers | Gateway as only path; budgets; policy-only in Ph0 |
| Payments/email | Stripe (disabled by default), Brevo adapter | Stripe, Resend | Stripe-only, Brevo default via port |
| Hosting | Oracle compose + Coolify variant assets; no proven deployment | managed hosting + Supabase | undecided (OPEN-14) |
| Scale | one writer | evolution triggers | triggers + replicas after SQL reads |
| Scope | core loop durable; rest partial | 173 features, staged | 253 FEAT rows, 108 CAP, 60 WPs, 5 phases, 130 screens, 109 operations in contract file (230 in catalog), 74 events, 214 test cases specified (not implemented), 108 BR-T, 45 invariants, 15 state machines, 20 UJ journeys, 56 risks |

Review state: first review 46 findings (4 Critical/13 High/16 Medium/12 Low original 45): 6 closed in docs, 6 partial, 34 open, 0 Critical open, 7 High open. Second review: 44 new findings (0 Critical, 7 High, 23 Medium, 14 Low); 33 of 42 fix claims confirmed. Structural issues: REV2/V9 overlay files are not linked from README or MASTER_INDEX so superseded rules remain reachable; proposals called "binding"; preservation manifest 132 rows vs 204 claimed; REV2 files contradict each other (features without AC 158 vs 168). OPEN-01..52 recorded; blockers for production go-live: OPEN-08 legal retention, 14 hosting, 15 SLO calibration, 16 support model, 34 sub-processors, 39 on-call, restore drill; OPEN-17 scopes migration. Portfolio identity unmapped: 173 `F-*` vs 253 `FEAT-*` (OPEN-41); legacy BR parity open (OPEN-43). Registered ACs: 389, only 125 cited by catalog tests.

Use of the blueprint: take design ideas as candidates (e.g. fenced leases, central policy, evidence `issuer_class`, honest `unverified` assessments, no pay-to-rank, referee as first-class flow, consent scopes), never as facts about the product. Full risk register: `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/RISK_REGISTER.md` (RISK-01..50) and REV2 (RISK-51..56); P1 risks there: evidence gaming (RISK-03) and marketplace cold start (RISK-05); built-system top risks: ephemeral long tail, single writer, no email proof, simulated interview execution, localStorage tokens, `server.ts` size (IMPROVEMENT H).

## 7. Migration considerations

| Topic | Consideration | Source |
|---|---|---|
| Local migrations | Custom runner `pnpm db:migrate`; sequential files 00001-00055; ledger with checksums; honesty and idempotency tests; contiguous numbering (INVARIANT-009); CI applies to empty PG16 twice. Do not use `supabase db push` | ARCHITECTURE 23 |
| Populated database | 00043: case-insensitive unique email (fails on case-duplicates), partial unique index replaces `UNIQUE(job_id, candidate_id)`, drops plaintext `employment_references.token` after hashing, repoints FKs to `users(id)`; 00054 repoints `auth.users` FKs. Needs owner ratification, snapshot rehearsal, rollback/restore path, hosted grants/RLS proof | ADR-015; X-08; K-11 |
| Hosted Supabase | Manual adapter in `supabase/hosted/`, exact-checksum ledger, Data API lockdown; `pnpm db:migrate` forbidden; Fastify tokens are not Supabase identities; hosted README records 00001-00055 applied on 2026-10-23 with all tables empty (checksum caveat on 00001-00038); `scripts/check-new-hosted-migrations.mjs` exits 1 on the current tree because it flags 00054's platform Auth reference, so any PR touching `supabase/migrations/` fails the hosted audit workflow until the guard or its allow-list is decided (validator-run, read-only); CI workflow `hosted-supabase-audit.yml` | HOSTED_SUPABASE_MIGRATION_GATE |
| Ephemeral to durable | One vertical slice at a time through `persist()`: schema, repository, restart/race/erasure PG tests, UI limits made explicit; update `durability.ts`; avoid blanket rewrite; each slice needs erasure coverage and removal of its Maps | X-01; ADR-015 exit path |
| Read model to SQL | Per module delete Maps; required before second API replica or large data; boot-time hydration unmeasured at volume | ADR-015; OPS-01 |
| Stack alignment | If SSOT stack (Supabase Auth, Queues) is re-adopted: identity abstraction, token migration, session invalidation plan; if blueprint adopted: strangler migration with routing facade, single writer per domain, shadow reads, no dual writes; evidence status never upgraded by migration; timestamp-only email verification stays low rung; MIG-01 plan decision tree starts from OPEN-17 (do real users/data exist? repo evidence suggests staging only) | MIG-01 plan; REFERENCE_TO_TARGET_DATA_MIGRATION |
| Product import rules | MIG-01..08 (imported data project-owned, one-way, never auto-publish, skills self-reported, no connection graph import, tokens purged on disconnect, external IDs never keys, flag-gated providers) apply to any LinkedIn/CSV importer (F-64 not built) | BUSINESS_RULE_REGISTRY |
| Institutional / graduation | Managed learner to independent candidate keeps verified signals and severs FERPA-restricted records by logical anonymization; never hard-delete rows referenced by aggregates | SSOT 31.4; BR-076 |
| Erasure vs migration | Any migration/backup restore must replay erasure tombstones; Stripe customer deletion when billing mode toggles; backup retention unresolved | R2-05; blueprint BR-T060 |
| Documentation | Old dated reports remain evidence; SSOT preserved unchanged; consolidated set supersedes navigation only; `docs/PRICING.md` must remain in place (unit test); registry files are linked, not copied | this set |

## Appendix A — Founder execution order (preserved from the former `docs/governance/IMPLEMENTATION_PLAN.md`)

Status: founder intent (2026-09), not an evidence-based schedule. Current delivery sequencing is in `docs/reports/FEATURE_PLAN_2026-10-21.md` and the sections above. Phase numbering here differs from other vocabularies (see K-06).

| Phase | Title | Scope |
|---|---|---|
| 0 | Platform Trust Foundation | Repository, environments, CI/CD, Supabase, Postgres, migrations, Auth, authorization, RLS, API boundary, audit, observability, design system, PWA shell, AI policy engine |
| 1 | Career Identity | Profile, goals, skills, ontology, experience, education, portfolio |
| 2 | Evidence & Learning | Evidence, verification foundation, courses, progress, challenges, assessment core |
| 3 | Opportunity Loop | Jobs, search, applications, recruiter pipeline, messaging, notifications |
| 4 | Hiring Depth | Interview, scorecards, application feedback, references, career outcomes |
| 5 | Intelligence | Talent/Evidence/Career graph, matching, recommendations, readiness, market signals |
| 6 | Trust & Ecosystem | Reputation, moderation, appeals, anti-gaming, mentorship, networking |
| 7 | Institutional/Enterprise | Institutions, licensing, reporting, procurement, enterprise controls |
| 8 | Advanced AI | Expanded AI capabilities after gateway/policy/evaluation foundations are proven |
| 9 | Expansion | Marketplace, advanced analytics, internal mobility, advanced forecasting, external ecosystem |
| 10 | Scale | Only measured search extraction, cache, replicas, selective service extraction, bounded agents/automation |

Exit gates for every phase: user outcome; architecture integrity; security; accessibility; tests; observability; documentation; rollback/recovery.

First implementation epics (ordered): monorepo/tooling, CI, database/migrations, Auth, authorization/RLS, audit, API contract, PWA shell, design system, observability, profile, ontology, evidence, learning, assessment, jobs, applications, recruiter workflow, career graph, AI Gateway.

Rule: do not start downstream implementation merely because a feature has high priority; blocking dependencies must be ready or intentionally mocked with a documented exit path. The 2026-10-21 baseline note in the original: prioritize honest assessment results, safe worker claims, recoverable erasure and live verification evidence before expanding the portfolio; registry scores stay separate from P0-P3 delivery urgency; persist only admitted journeys one complete increment at a time; reuse existing mail adapters and durable stores.

## Appendix B — Retired historical documents (removed 2026-10-26; recoverable from git history before the removal commit)

- `docs/governance/SOURCE_RECONCILIATION.md` (2026-09-24, v1.0): forensic baseline recorded when the repository was an empty greenfield scaffold ("GREENFIELD - 0% IMPLEMENTATION VERIFIED"). Commit `6774c9c6` ("Deleted project") removed 343 legacy files (62,538 deletions: prototype Next.js components, outdated schema migrations, unverified tests); commit `b3e0a50e` synchronised the document index. Its greenfield status is superseded by the current code; earlier completion claims were classified as historical evidence, not runtime reality.
- `docs/superpowers/plans/2026-10-21-project-maintenance.md`: implementation plan for an interactive Bash maintenance tool (`project-maintenance.sh`); the tool and its test script are absent from the checkout (approved design: `docs/reports/MAINTENANCE_AUDIT_2026-10-21.md`).
- `docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md`: pointer document. Where topics live: journeys J-01..J-28 in `docs/experience/JOURNEY_REGISTRY.md`; workflows WF-01..WF-66, integrity traces WIT-001..025 and state machines in `SSOT.md` Part V section 10; business rules BR-001..248 and migration rules MIG-01..08 in `docs/registries/BUSINESS_RULE_REGISTRY.md`; feature-to-rule links in `SSOT.md` feature contracts (reconcile mismatches against the rule registry; BR IDs use two digits for BR-01..35 and three after, see conflict C-9).
- `REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` (root): 141-byte pointer to `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`.

# Legacy Release Gates, Issue and PR Lineage (reports group)

Doc ID: RDM-GATES-C · Owner: Program Director (proposed) · Version 1.0 · Status: Proposed (Under Review) · Date: 2026-10-26 · Merge track: C (source group `31_LEGACY_ARCHIVE/docs/reports/**`)

**Relationship (no original file was edited).** This file **supersedes nothing**. It does not change `ROADMAP.md` or `ROADMAP_REV2.md`; it is a register of **gates and sequencing evidence from the earlier attempt** that the target roadmap can adopt, adapt or reject by ID. It is linked from `00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md`; the documentation owner must also link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`. Owner instruction behind this merge: *"i dont want to loos information keep everything in use untile it get improved"*. Contains no dates for the target, no durations and no staffing numbers.

**Greenfield frame.** No source code exists in this repository and nothing is implemented. Every row records "the earlier attempt required X before release" or "the earlier attempt reported state Y at commit Z". Hosted-service facts (Stripe, Supabase, GitHub) describe the **earlier attempt's accounts and repositories** at the dates given, observed read-only; they are not facts about any target environment. No live-verification gate below is satisfied for the target.

Companion files: `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` (lessons `LES-nn`), `05_FEATURE_SPECIFICATIONS/LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md` (requirements `LGR-nn`, `BL-nn`, `X-nn`), `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` (`LEI-nn`). Target roadmap work packages that relate by subject (pointers only, to be confirmed by the roadmap owner): WP-BILLING-STRIPE, WP-NOTIFY-EMAIL, WP-WORKER-OUTBOX, WP-PRIVACY-CONSENT, WP-IDENTITY-SESSIONS, WP-VERIF-REFEREE, WP-ASSESS-RUNNER, WP-PROCTOR-VENDOR, WP-DR-EXERCISE, WP-LOADBASE, WP-QA-TRACE, WP-MONOREPO-CI, WP-MIGRATE-DATA.

## 1. Gate catalogue (LRG-nn)

Each gate is a condition the earlier attempt judged necessary before a user-facing release. "State then" is the last recorded state in the reports (2026-10-23) and is historical.

| ID | Gate | Required evidence (as the reports phrased it) | Source | State then |
|---|---|---|---|---|
| LRG-01 | **Exact-commit green CI** | Lint, type-check including the test projects, unit, integration and security tests, local migrations applied to an empty database twice (idempotency), real-database tests, production build, client-bundle secret scan, browser tests all green on the exact release commit; no assertion weakened to get there. | PRODUCTION_AUDIT P0-08; REPOSITORY_AUDIT R2-01, I, L | Red twice: 2026-10-03 at type-check; 2026-10-23 one of 236 browser cases failed (account-security, aborted navigation) |
| LRG-02 | **Transactional email proven** | Verified sender and domain (SPF, DKIM, DMARC), a real mailbox receives the verification code and the referee link, the token is absent from the requester's response and from logs, expiry and replay negatives, retries preserve idempotency, bounce and retry alerting, queue alert; worker fails closed (503) when unconfigured in staging and production. | issue "email" (#44 in 10-21/10-23 numbering); BL-003; X-02 | Blocked: adapter code existed, no live proof |
| LRG-03 | **Privacy and erasure lifecycle approved and proven** | Ratified policy (immediate versus 30-day grace), retention and backup treatment, scheduler for due erasures, resumable cleanup after partial failure with the account kept closed, deletion proven across every store and the payment provider, user notification, counsel sign-off. | issue "privacy/erasure" (#45); BL-006; X-07; D-03; R2-05 | Blocked: owner and legal decision; no scheduler |
| LRG-04 | **Legal text and contacts** | Counsel review of Terms and Privacy Policy against GDPR, CCPA/CPRA and India DPDP recorded in a governance record; monitored privacy and security mailboxes on a domain the company owns; no unsupported compliance claim. | BL-004; finding 20 | Open (code honest; law open) |
| LRG-05 | **Persistence design ratified; populated migration rehearsed** | Owner ratifies the persistence design and its schema change (the earlier migration 00043: replaced `UNIQUE(job_id, candidate_id)` with a partial index, dropped the plaintext reference token after hashing, re-pointed work-history and reference foreign keys to `users(id)`); duplicate case-folded emails and active applications resolved by approved policy; upgrade of a populated snapshot, rollback and restore exercised; target grants and RLS deny cross-account reads. | issue "ADR-015 / hosted migration" (#46); X-08; O-01 | Blocked: no ratification; hosted project empty |
| LRG-06 | **Hosted database target gate** | Do not run the migration command against a hosted managed database until a compatible identity model exists: the earlier SQL referenced `auth.users`, `auth.uid()`, `auth.jwt()` (four migrations held foreign keys to `auth.users(id)`) while the app issued its own sessions; do not insert fake `auth.users` rows, replace `auth.uid` globally or grant blanket access; rehearse on a disposable target (drift, abort and rollback, grants, RLS, concurrent writes) first. A CI scanner that expects exit code 1 on known incompatibility is a blocker detector, not a compatibility proof. | HOSTED_SUPABASE_MIGRATION_GATE (cited); STRIPE_SUPABASE; REPOSITORY_AUDIT E | Blocked |
| LRG-07 | **Deployment topology correct** | HTTPS; the proxy forwards the root health route to the API (not static HTML); database and API publish no host ports, only the edge proxy binds 80 and 443; secrets excluded from images (`.dockerignore`); production image pruned (below 250 MB target); single API writer enforced where the design needs it. | BL-005, BL-018; PR #55; OPS-02; issue "deployment" (#47) | Code existed; not operationally verified |
| LRG-08 | **Worker and queue reliability** | Claims bounded by execution capacity and fenced by claim token, expired owners cannot acknowledge, crashed claims recover, cancellation wins, mail idempotency kept; worker heartbeat and queue-age alerts observed in a kill drill. | D-02; X-06; R2-07 | Reproduced defect (6 jobs, 9 executions); fix not proven |
| LRG-09 | **Operations drills passed** | Backup restored independently into an isolated database and verified (schema, table row counts, background-job queue); the restored app passes a smoke test; rollback of the image with schema compatibility; load and cold-boot/memory measured; external monitoring of error-level logs; approved RPO and RTO; signed go/no-go. | X-09; issue "deployment"; PRs #55, #56 | Not performed (no deployment target) |
| LRG-10 | **Assessment integrity and trust policy** | No scored result without approved isolated execution (submission-only until then); credential issuance after the final-assessment gate; linked certificate and evidence proofs agree on revocation; trust policy for badges and scoring ratified; interview code execution refused (503) in deployed environments until a sandbox is approved. | D-01, D-09, D-10; X-05, X-11; issue "interview/trust" (#49) | Open decisions |
| LRG-11 | **Session architecture decision** | Decide bearer token in storage versus httpOnly cookie, with CSRF defence, credentialed CORS and the client contract. | TS-007; issue "trust/token storage" | Open |
| LRG-12 | **Commercial gate** | Explicit free-only launch, or: approved provider and price policy, test-environment webhook endpoint configured and signed delivery verified, refund and dispute behavior decided and implemented, entitlement read-model audit (all gates read entitlements, never plan tier alone), truthful UI, then live-mode readiness. Do not enable the paid billing mode for public users before these gates. | issue "commercial" (#50); X-03; REPOSITORY_AUDIT F, L | Partial: Stripe code merged; 0 webhook endpoints in the test account; UI free-only |
| LRG-13 | **Durable beta scope** | Decide which long-tail modules must persist before exposure; each slice: API, database, authorization, UI, restart, tenant and browser tests; the UI states remaining preview limits. | issue "durable beta modules" (#48); X-01 | Partial |
| LRG-14 | **Security hardening backlog closed** | Keyed hash for email codes (BL-001); referee token expiry (BL-002); durable assessment sessions (BL-009); AI tier from entitlements (BL-010); password policy; CSP on the web host; patched web-framework advisory (fastify 5.12.2 to 5.12.5 affected by GHSA-389g-gv7q-r4x8, fixed in 5.12.6); secret scanner fails on scanner error. | SEC-01, SEC-02, SEC-05, SEC-06, O-4, D-07 | Open at last report |
| LRG-15 | **Accessibility and performance acceptance** | Manual contrast and screen-reader checks; measured service-level objectives (no fictitious SLOs); layout-shift budget; load, soak, backup/restore and deployment tests (never produced). | FINAL_VALIDATION "Not produced"; FEATURE_STATUS; PRODUCTION_AUDIT section 8 | Not produced |
| LRG-16 | **Documentation and claims gate** | Status documents match evidence, dated and tied to a commit; no feature called implemented from documentation; the docs index points to the current audit; historical reports labelled. | REPOSITORY_AUDIT R2-08; FEATURE_PLAN K | Drift recorded |
| LRG-17 | **Verification-environment gate** | A clean, permitted environment (fresh build, install, isolated test database, browser) exists before acceptance is claimed; "not run" is never reported as pass. | D-06; X-00 | Blocked |

## 2. Issue-by-issue gates (GitHub #44 to #50)

All seven issues were **open** at every report. No issue closure was justified (REPOSITORY_AUDIT D, J). The two mappings of numbers to titles differ; both are retained (lessons file section 12 explains why the first is preferred).

### 2.1 Mapping used by FEATURE_STATUS (2026-10-21) and REPOSITORY_AUDIT (2026-10-23), which read the issue bodies

| Issue | Title / scope | Priority | Already in code or merged work | Remaining acceptance | Whole-issue status on 2026-10-23 |
|---|---|---|---|---|---|
| #44 | Transactional email delivery | P0 | PR #51 Resend adapter, fail-closed configuration, durable enqueue | Sender and provider ownership, real inbox, monitoring, D-02 | BLOCKED (provider and live proof) |
| #45 | Privacy, legal, erasure | P0 | PR #43 request and cancel SQL; PR #51 encrypted metadata and cleanup; PR #58 privacy checks | Legal, contact and retention approval, scheduler policy, complete recoverable deletion including shared data and backups | BLOCKED (owner, legal, live proof) |
| #46 | Persistence design ratification and hosted migration | P0 | PR #52 migration ledger guard and read-only preflight; ADR describing the writer lock | Ratification, populated migration and rollback, hosted grants and RLS | BLOCKED (schema, approval) |
| #47 | Deployment, restore, single writer | P0 | Writer lock, heartbeat, PR #55 topology, PR #56 recovery scripts, PR #58 config hardening | Deployed drills, load and boot measurements, independent restore and rollback, release acceptance | BLOCKED (infrastructure proof) |
| #48 | Durable beta modules | P1 | PR #51 metadata, PR #53 searches, PR #54 bookmarks; audit and flag stores; billing in database mode | Selected remaining modules, drafts, connections, alerts; avoid blanket rewrite | PARTIAL |
| #49 | Interview, trust, token storage | P1 | PR #43 deployed interview refusal and trust changes; PRs #57, #58 regression and access control | Challenge semantics, approved sandbox, trust, badge and session policy; no cookie migration assumed | PARTIAL / decisions blocked |
| #50 | Commercial policy and payment | P1 | Paid activation disabled; simulated mode refused in deployment; PR #71 Stripe backend and migration 00052 | Explicit free-only decision or approved provider plus durable payment and entitlement reconciliation; price approval | PARTIAL |

Status accounting (REPOSITORY_AUDIT A): fixed and verified 0; implemented, not fully verified 0; partially fixed or open 3 (#48, #49, #50); regressed 0; blocked 4 (#44 to #47); not reproducible 0. Comments counted in the 2026-10-21 snapshot: #44 2, #45 3, #46 2, #47 3, #48 5, #49 1, #50 1 (17 total). On 2026-10-23 the review posted five comments (to #45, #46, #47, #48, #50: ids 6374109469, 6374110168, 6374110786, 6374111482, 6374112336) and changed no state, label or assignee.

### 2.2 Mapping used by GIT_RECONCILIATION_REPORT (2026-10-22), inferred from commits

| Issue | Title in that report | Codebase status | Release status | Commits and PRs cited |
|---|---|---|---|---|
| #44 | Transactional email, provider integration and fail-closed guard | Partially addressed | Gated (staging proof) | `22fb8190`, `ad613fc3` (PR #43 fail-closed 503); `43ef011e`, `73f27b29`, `f75fd3b4` (PR #51 Resend adapter, exponential backoff, idempotency headers); `8aea7fee` (PR #51 worker configuration validator); `7c723a0e` (PR #55 outbound mail allowed, database private); `43bb9258` (PR #57 FE-05) |
| #45 | Reputation visibility, recruiter scoping, candidate consent (BR-167) | Partially addressed | Gated (consent setting) | `a30fcaab` (PR #57); `8f5ff69a` (PR #58 R2-2); `d3607f0f` (PR #58 BR-167 gate; message "No reputation consent setting exists yet ... #45 #49 remain open") |
| #46 | Technical-interview code execution sandbox and cross-tenant IDOR | Partially addressed, architectural limitation | Documented limitation | `93dfe125` (PR #40); `48b5fd55`, `f9c2d0bb` (PR #43 simulated sandbox claims removed, 503); `a30fcaab` (PR #57) |
| #47 | Privacy policy, terms, contact verification, false compliance claims | Resolved in code, open in law | Gated (legal counsel) | `ae99e31c` (PR #40); `731c2ef3`, `d0f21535`, `f9c2d0bb` (PR #43); `8a81a953`, `ab410a92` (PR #43); `43bb9258` (PR #57 FE-02) |
| #48 | User data erasure semantics and scheduled deletion | Partially addressed | Gated (30-day executor) | `1bb0f625` (PR #40); `15b44921`, `7bc608b8`, `de352710` (PR #43); `34e54020`, `6f88ef74` (PR #51); `a30fcaab` (PR #57) |
| #49 | PostgreSQL durability versus about 220 ephemeral routes and the single-writer constraint | Partially addressed | Progressive migration | `1bb0f625`; `1515beae`, `e49c43b1` (PR #43); `000013c3`, `f6612e46`, `34e54020` (PR #51); `735b30ea` (PR #53); `47a3f130`, `b30e7e42` (PR #54); `8864d2c8` (PR #55) |
| #50 | Payment gateway and billing integrity | Resolved in code, open in plan | Gated (provider) | `ae99e31c`, `1bb0f625` (PR #40); `48b5fd55` (PR #43); `8864d2c8` (PR #55) |

Numbering fact recorded there: pull requests and issues share one counter. PR #40 to #43 were merged in succession; numbers #44 to #50 were then allocated to the seven issues; later pull requests are #51 to #58. No pull request numbered #44 to #50 ever existed.

### 2.3 Reported defect and verifying tests per issue (GIT_RECONCILIATION_REPORT numbering)

| Issue (that report's title) | Reported defect | Verifying tests named |
|---|---|---|
| #44 transactional email | Development logged verification codes to the console; in staging or production without a provider the platform accepted verification requests without sending mail, so candidates could not verify corporate domains or obtain reference upgrades | `production-config` unit; `work-history-graph` integration; e2e `core-loop`, `frontend-fixes` (FE-05) |
| #45 reputation visibility | Any authenticated caller could inspect any candidate's multi-dimensional reputation score and breakdown without consent (BR-167); recalculation open to non-admins; stealth candidates exposed in discovery | `reputation-visibility`, `review-r2-regressions` (R2-2), `reputation-engine` integration; e2e `reputation-engine` |
| #46 interview sandbox | Evaluation simulated in-process, claiming to run submitted code; cross-tenant IDOR let rival organizations link, score and move another company's application and expose private questions and hidden test cases | `technical-interview` integration; `core-authz` ("interview assessments are scoped...") |
| #47 privacy and legal | Fabricated claims ("SOC2 Type II Ready", "GDPR & CCPA Compliant", "DKIM Verified"), fictitious hashes, a fake phone number, a support address at an unowned domain; unreviewed boilerplate Terms and Privacy Policy | e2e `frontend-fixes` (FE-02), `core-loop`; `core-authz` |
| #48 erasure | Erasure left work history, references and applications in tables; requests and cancellations lived in volatile maps; no executor for the 30-day grace period; recruiter-versus-candidate retention semantics undefined | `tests/pg/core-persistence`, `notifications`, `messaging`, `work-history-removal`, `saved-jobs` |
| #49 durability | Only the core loop persisted; about 220 routes kept state in maps; horizontal scaling unsafe without a single-writer lock | `tests/pg/core-persistence`, `concurrency`, `saved-searches`, `saved-jobs` |
| #50 payments | Checkout collected card numbers without submitting them anywhere and activated paid plans without payment; the webhook was unsigned and open to spoofed confirmations | `billing` integration; `api-security`; `production-config` |


## 3. Release stages and sprints

### 3.1 Stages A to F (RELEASE_SCOPE_AND_BACKLOG, 2026-10-22)

| Stage | Focus | Backlog delivered | Exit criteria |
|---|---|---|---|
| A | Production hardening and operational gates | BL-001, 002, 003, 004, 005, 007, 008 | All tests green, `test:security` exits 0, lint exits 0, a live email received from staging |
| B | Core career loop GA launch (free early-access tier) | BL-006, 009, 010; deployment on the single-writer design with automated backup verification | End-to-end in production: candidate sign-up, corporate email attestation, referee voucher completion, job apply, recruiter pipeline move |
| C | Progressive durability (long tail) | BL-011, 012, 013, 015; portfolio showcase (F-26) and admin console (F-17) durable | Ephemeral route count reduced from 217 to below 100; restart preserves challenge submissions, course progress, drafts |
| D | Commercial monetization and enterprise tier | BL-016; enterprise seat licensing and invoice generation; webhook deduplication keys persisted | A live-style card test succeeds in the provider's test mode, the webhook activates the Pro subscription, canceling updates entitlements |
| E | Sandboxed code execution and remote assessment | BL-017; multi-language runner (Node.js, Python, TypeScript); technical-interview real-time room | Unprivileged execution of untrusted code passes an isolation audit; fork bombs and unauthorized network calls blocked |
| F | Ecosystem, reputation and career graph | BL-014; career trajectory visualizations; alumni networks, warm-introduction pathfinding, peer credibility views | Full 173-feature matrix with persistence and accessible UI views |

Timeline column in that report (relative only): Stage A sprints 1-2, B 3-4, C 5-6, D 7-8, E 9-10, F 11 and later.

### 3.2 Sprints S0 to S6 (FEATURE_PLAN_2026-10-21, no dates or velocity)

| Stage | Sprint | Goal | Backlog and urgency | Demonstrable increment | Exit criteria |
|---|---|---|---|---|---|
| A delivery safety | S0 | Select beta or GA contract from an audited baseline | X-00 P0; prepare X-08, X-09; X-03 decision | Reproducible baseline and release-specific acceptance catalogue | Exact SHA and build provenance; admitted stories Ready; unexecuted gates named; no readiness claim |
| B trust integrity | S1 | Remove false results and unsafe claims while keeping flows | X-05, X-06 P0; X-10 P1/P2 (split if capacity requires) | Honest challenge submission; recoverable worker queue with bounded claims; reliable verification checks | D-01 and D-02 regressions fail before the fix and pass after; PG fencing proof; affected browser verdict; no trust downgrade |
| B verification and privacy | S2 | Real proof and recovery slice | X-08 then X-02; X-07 separate P0 | Candidate receives proof email, referee responds, persisted result survives restart; approved erasure demonstrably recovers | Live inbox, replay, expiry; PG restart and race; erasure failure drill; monitored failure; owner accepts trust semantics |
| C restricted beta | S3 | Close admitted application and recruiter gaps on the durable core | BL-F-04, 05, 06, 10, 14, 17, 24, 32, 94, 96, 162; X-01 per needed slice | Candidate applies with evidence; recruiter reviews and transitions; candidate sees outcome; account controls work | Fresh-browser and restart journey; duplicate, retry, expired-session, tenant cases; moderation recovery; all beta inclusions accepted |
| D full career loop | S4.n | One learning, proof or career increment per sprint | BL-F-07a then approved BL-F-08, 26, 84, 85, 91, 95, 106, 122, 145; P1 | First durable lesson progress, later portfolio and goal, gap, outcome progression | Each slice survives restart, meets its story, has PG, browser and security evidence; no simulated proficiency |
| E operational release | S5 | Prove operation under failure | X-09 P0; unresolved X-07 and X-08 block entry | Restore and roll back a working candidate and recruiter product; detect worker failure | Exact-SHA CI/build/browser; hosted RLS; backup, restore, rollback; HTTPS; accessibility and manual gaps closed; load and boot data accepted; signed release |
| F expansion | S6.n | One standalone extension per sprint | Deferred BL-F packets (P2/P3) | Individually admitted | Same Definition of Done; pricing, AI and predictive decisions never inferred |

Sprint risk, isolation and rollback contract (kept verbatim in substance): S0 documentation-only diff; S1 keep the old API contract until a coordinated consumer migration, stop a scored path if unsafe, rollback must not restore fake trust or unsafe worker scale, deferrals real sandbox and provider choices; S2 fail closed on mail outage, reversible migration rehearsal, erased data is not restored to users as an application rollback; S3 restrict incomplete preview modules by approved scope, additive migration with a tested rollback and restore; S4.n one module at a time preserving old data and contract until the replacement is verified; S5 tested image rollback with schema compatibility, restore procedure owned and timed, no claim beyond measured load; S6.n feature-specific rollback and retention plan.

### 3.3 Dependency graph of the delivery packets (FEATURE_PLAN H)

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

### 3.4 Dependency-ordered action plan (REPOSITORY_AUDIT M, 2026-10-23)

| Order | Priority | Workstream | Observable acceptance |
|---|---|---|---|
| 0 | P0 | CI (R2-01) | Pull-request CI completes with 236 of 236 browser cases; a revoked external session is still redirected with the exact banner and the active session retained |
| 1 | P0 | Schema (#46) | Approved identity model, migration adaptation, clean and populated disposable rehearsal, two-user and two-tenant RLS and grant checks; no direct hosted migration before signed approval |
| 2 | P0 | Operations (#47) | After #46: app boot, single-writer lock, worker liveness and queue-backlog alarm, fresh encrypted off-host restore, rollback and smoke |
| 3 | P0 | Communication (#44) | Verified sender, real-mailbox code and reference sends, expiry and replay negatives, bounces and retry alerts, secrets absent from logs |
| 4 | P0 | Privacy (#45, R2-05) | Legal, retention and contact approval, due-erasure scheduler, restart recovery, payment-provider disabled and enabled erasure consistency and staging tests |
| 5 | P1 | Monetization (#50; R2-03, 04, 06, 09) | Decide launch mode; test-mode provider endpoint and signed delivery; complete refund and ordering policy; entitlement read model; honest UI; then any live-mode readiness |
| 6 | P1 | Core product (#48) | Prioritize drafts, network, alerts by accepted beta scope; each vertical slice API, database, authorization, UI, restart, tenant and browser tests |
| 7 | P1 | Trust (#49) and worker (R2-07) | Code executor sandbox or fail closed, policy provenance, safe worker lease fencing and replay proof |
| 8 | P2 | Documentation (R2-08) | Mark stale snapshots clearly; link the current report in the docs index; refresh the feature ledger after acceptance, not before |

Sprint increments suggested there (capacity unknown; sequencing only): A CI plus observability baseline (no new feature); B hosted schema proof on a disposable target; C one staging candidate, reference and job-application journey; D privacy plus mail and erasure proof; E optional paid vertical slice only after commercial approval; F durable beta micro-features and technical-interview security. A sprint with red CI does not complete or unlock the next.

### 3.5 Release readiness statements from the E2E audit (2026-10-21)

Not ready for public release because: the stored-XSS link fix was uncommitted and the shared dev API stale; weak passwords were accepted and maintenance mode was inert (both needed decisions); only the memory-backed path and Chromium were browser-tested. The core career loop (sign up, profile, work history, apply, review, notifications, messaging, networking) behaved correctly under normal and abnormal input and authorization held in every case tried. The shared dev API on port 4000 was stale (it returned 404 for `GET /api/v1/auth/session`) and needed a restart from the current build; two persistence changes made in that session (admin audit log, feature flags) were not live there.

## 4. Deployment readiness table (REPOSITORY_AUDIT L, 2026-10-23)

| Gate | Observed state | Verdict |
|---|---|---|
| Latest upstream full CI | Failed 1 of 236 browser tests; the two preceding runs green | RED |
| 52 local database migrations and 50 database tests | Successful in CI | GREEN (local CI only) |
| Managed Supabase target schema | No application tables | BLOCKED |
| Hosted RLS authorization and grants | Cannot test real application objects | BLOCKED |
| Stripe SDK, signed webhook, durable storage | Code present; mocked network tests and local PG green | PARTIAL |
| Stripe test-account webhook delivery | 0 webhook endpoints configured | BLOCKED |
| Live-mode payments | Not accessed; no mutation performed | NOT VERIFIED |
| Legal, email, privacy, backups, worker, load, TLS | Acceptance evidence missing | BLOCKED |
| App-wide 173-feature production verification | Only a historical provisional inventory | NOT VERIFIED |

Rule recorded there: do not enable `BILLING_MODE=stripe` for public users, deploy application migrations to the current Supabase project, or describe the product as production-ready before the relevant owner-approved gates and environment checks pass.

## 5. Payment-provider live-verification gates (Stripe)

### 5.1 Capability matrix (REPOSITORY_AUDIT F)

| Capability | Evidence in the earlier attempt | Remaining gate |
|---|---|---|
| Server-side catalog and access | Price catalogue, Checkout input schema and route registration enforce server-side prices and plan role; routes require a session | Commercial price and entitlement policy approved |
| Checkout | Route `/api/v1/billing/checkout` creating a Checkout Session with idempotency including user, plan, cycle and a client reference | Network was mocked in tests; the page still said no processor existed and showed no purchase UI |
| Source of truth | Paid access only from a signed, known-price, eligible subscription; unknown prices grant free entitlements | Verify every user-facing gate reads entitlements, never plan tier alone |
| Webhooks | Raw-body signature verification with the endpoint secret; normalized checkout, subscription, invoice events | Synthetic payloads only; 0 configured endpoints, remote delivery unproven |
| Idempotency and ordering | `billing_events(provider, provider_event_id)` unique, transactional write, freshness guard, concurrency tests | Event time is in seconds: test equal-second conflicting order; asynchronous side effects; no remote retry drill |
| Subscriptions and cancel | Gateway call plus domain reconcile; scheduled and immediate cancel; persisted | Live cancel, portal behavior, downgrade at renewal, subscription replace and retries unverified |
| Invoices | `invoice.paid` and `invoice.payment_failed`; provider invoice id uniqueness | Live invoice mapping, credit notes, refunds unverified |
| Refunds and disputes | `charge.refunded` later handled (see 5.3); dispute and void not handled | Decide dispute and void behavior |
| Erase | Customer deletion before local purge in enabled mode | Provider disabled with an existing customer logs a warning and purges the local mapping only (R2-05) |
| Connected test account (read-only) | account `talentsphere-production` in **test mode only**; 1 active USD 2.99 per month recurring price; 2 active test subscriptions; 0 webhook endpoints | Not a production payment test; nothing was charged, refunded, canceled, created or edited |

### 5.2 Manual provider configuration (not code), from STRIPE_SUPABASE_AUDIT

Create the six `STRIPE_PRICE_*` prices; create a webhook endpoint at `/api/v1/billing/stripe-webhook` for `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`; configure the Customer Portal; keep `BILLING_MODE=disabled` until done. Apply migration 00053 (privilege revoke only) after review. The pre-integration payment audit's earlier deliverables (domain error code `PAYMENT_REQUIRED` mapped to HTTP 402; `allowSimulatedPayment` default false; `settleSubscription`) are acceptance ideas, not target facts.

### 5.3 Open and decided payment items

- Decided 2026-10-23 (owner): a full refund of the charge that paid for the current period ends paid access; the provider subscription is canceled immediately before the event is recorded so a provider failure makes the provider retry; a replay is recorded once; a partial refund or a refund of an older charge changes nothing.
- Open: O-1 concurrent paid Checkout sessions; O-2 dispute created and void; O-3 outbox for the post-commit dispatch; O-4 framework advisory (fix needs a protected manifest edit in that repository); O-5 webhook shares the global rate limit (300 per minute per address default); R2-09 same-second ordering; R2-06 refund and dispute strategy; R2-04 UI truthfulness.

## 6. Managed-database (Supabase) gate facts

- Observed 2026-10-23 (read-only): project `talentsphere-production` (id `qidckctwrkxyiwworchd`), region `ap-south-1` (Mumbai), healthy, PostgreSQL 17; public tables none; migration ledger one entry (`add_readonly_keepalive_ping`); Edge Functions none; security and performance advisors returned no notices, which cannot certify application access control because no application schema exists.
- The 52 local migrations apply cleanly and idempotently to a disposable PostgreSQL 16 in CI; that is no evidence for the hosted PostgreSQL 17 target.
- Constraint: the earlier app signed its own HMAC sessions; a browser token is not a platform auth identity. Migrations 00016, 00018, 00022, 00023 hold foreign keys to `auth.users(id)` while the app kept users in `public.users`, so inserts would be rejected and the Data API could expose tables.
- Local evidence that did exist: two-user owner isolation for messages and notifications; `stripe_customers` declared RLS and `REVOKE ALL ... FROM PUBLIC` (then found insufficient for client roles; 00053 revokes from `anon` and `authenticated`); superuser execution in CI must not be mistaken for Data API protection.

## 7. Pull-request and commit lineage

### 7.1 Spine PR #40 to PR #58 (GIT_RECONCILIATION_REPORT; all merged into HEAD `83dc7d247efbd3b3c3312bef74ac49978d33e924`)

Repository history to that head: 302 commits from the initial commit `e93d2514` (2026-09-19); head subject "update" (2026-10-20, Graphify artifacts). Local branches `main`, `repository_audit_roadmap`, `universal_project_clean_reinstall` and remote `origin/main`, `origin/HEAD` all pointed at the head; zero unmerged, dangling or orphaned branches. Other branches merged earlier: `improvement/core-loop-durability` (tip `b5d40da1`, merged by PR #40); `install_ralph_loop_extension` (tip `dc0d8ef0`, merged PR #37); `implementation-completion-tracker-57547` (PR #16, `73632855`); `next-priority-implementation-ff90f` (PR #28, `49beef19`, user blocking NET-005); `security/five-lock-smoke-hardening-20261018` (PR #41); `security/rls-runtime-validation-ci-fix-20261018` (PR #42).

| PR | Merge commit | Date | Branch | Delivered |
|---|---|---|---|---|
| #40 | `4004457d` | 2026-10-14 | `improvement/core-loop-durability` | Durable core loop (ADR-015); proof-of-control verification (6-digit email challenge, single-use referee token as SHA-256); dynamic React candidate, recruiter and referee flows replacing the hard-coded mock; global rate-limit lockout fix (300 per minute per account, health exempt); password change with multi-device revocation, explicit sign-out, role removal; strict type-check of the test suites |
| #41 | `8bdad381` | 2026-10-18 | `security/five-lock-smoke-hardening-20261018` | RLS policies for messaging threads, messages, notification preferences; static regression checks |
| #42 | `5c130a7e` | 2026-10-18 | `security/rls-runtime-validation-ci-fix-20261018` | Correlated RLS column-shadowing fix; runtime two-account RLS validation on real PostgreSQL; SQL apostrophe-escape test; CI sentinel scanning the production web bundle for server secrets |
| #43 | `d8dd0567` | 2026-10-18 | `chatgpt/production-safety-gates-20261018` | Single-writer advisory lock lease `pg_try_advisory_lock(718201, 1)`; worker heartbeat; fail-closed transactional email (503); durable erasure request store with restart test; inline JSON export; rejection of unverified legal mailboxes; removal of simulated execution claims |
| #51 | `4890ef21` | 2026-10-18 | `chatgpt/privacy-mail-hardening-20261018` | AES-256-GCM encryption of BYO AI keys with a separate 64-hex key (plaintext downgrade refused); opt-in Resend adapter with idempotent retries; durable settings and export metadata |
| #52 | `616f942d` | 2026-10-18 | `chatgpt/release-preflight-20261018` | Read-only release preflight for migration drift; strict sequential numbering |
| #53 | `eb69a2f8` | 2026-10-18 | `chatgpt/durable-saved-searches-20261018` | Owner-scoped SQL saved searches with restart and isolation tests |
| #54 | `1776f948` | 2026-10-18 | `chatgpt/durable-job-bookmarks-20261018` | SQL saved jobs; unpublished or draft jobs refused; erasure purge; race, ownership, restart tests |
| #55 | `8864d2c8` | 2026-10-18 | `chatgpt/oracle-staging-readiness` | ARM64 staging compose, private network topology (db and api no host ports; edge proxy only on 80 and 443), outbound mail permitted, hardened `.dockerignore`, CI compose validation workflow |
| #56 | `252b03f9` | 2026-10-18 | `chatgpt/oracle-staging-recovery` | Backup and isolated restore verification script; dump files ignored by version control |
| #57 | `9156b1a8` | 2026-10-20 | `claude/issues-44-50-fixes` | Stage 1 `a30fcaab` (evidence relationships and dispute handling, work-history visibility and referee contact redaction, admin-only recomputation, k floors, recruiter profiling limited to active applicants or visible public profiles, stealth hidden, institution-scoped admin seats, certificate revocation limited to instructor or admin, two-step bans with lapsing proposals, moderation appeals with reporter anonymity, challenge evidence stored once, self-verification blocked, self-reported skills 0 trust points, interview questions scoped to organization); Stage 2 `43bb9258` (FE-02, FE-03, FE-04, FE-05, FE-06, FE-07, FE-11, sign-in double-click guard, ten ported security and frontend e2e specs) |
| #58 | `61eae132` | 2026-10-20 | `claude/audit-f01-f04-r2` | BR-167 reputation visibility; deployed PBKDF2 iteration floor of 210,000; regressions R2-2 (stealth hidden from segmentation), R2-3 (`/reports/my` reveals only resolved decisions, reporter id and moderator notes redacted), R2-7 (expired ban proposal cannot be confirmed after 24 hours), R2-8 (resubmitting a passed challenge returns existing evidence) |

Chronological order recorded: `32a3abc7` (validation report corrected to measured reality), then PR #40, an "update" commit refreshing intents, #41, #42, #43, [issue numbers #44-#50 allocated], #51, #52, #53, #54, #55, #56, #57, #58, head `83dc7d24`. Commits named in the improvement program: `1bb0f625` (API: durable core loop, proof-based verification, authorization), `ae99e31c` (web: real journeys, honest pricing and copy), `93dfe125` (adversarial review fixes), `346e1f8a` (messaging API), `81ea894a` (dead-code removal), baseline `32a3abc7` and earlier measured head `aad8b54d` (2026-10-08: Vitest 976, Playwright 183), `8db0930` (2026-10-03 production audit), `a30b35bf` and `a771a87b` (2026-10-21 audit initial and final heads), `0f40b6c9` (2026-10-23 upstream main), `fca16f51` (fix for two Playwright 5xx assertion failures), `deaea7665` and `4d3cf5d4` (earlier green runs).

### 7.2 PRs #61 to #71 (REPOSITORY_AUDIT C, 2026-10-23)

| PRs | Delivered | Evidence level recorded |
|---|---|---|
| #61 to #66 | Hosted-target guard, preflight, migration-incompatibility scanners, CI gate that expects exit code 1 for the known auth dependency | Fail-closed warning works in CI; not a hosted-compatible schema |
| #67 to #69 | Refuse unpaid entitlements; lint remediation | CI-verified guard and formatting; monetization still blocked |
| #70 | Simulated billing lifecycle, idempotency and erasure | Tested code; simulated billing stays disabled outside development and test |
| #71 | Stripe SDK gateway, signed webhook, durable Postgres records, idempotent provider-event storage, cancellation, domain tests, migration 00052 | Integration and local PG verified; 50 PG cases pass in CI; zero webhook endpoints; paid production launch not verified |

Earlier merged pull requests PR #41, #42 (RLS and ownership), #43 and #58 (fail-closed assessment, reputation visibility, PBKDF2 floor), #51, #53, #54 (durable privacy metadata, saved searches, bookmarks), #55, #56 (deployment and recovery artifacts) were cross-checked in that report: locally verified only; hosted target had no tables; deployment artifacts implemented, not operationally verified. PR objects fetched on 2026-10-21 showed #43 and #51 to #58 merged even where their old body text said draft or unmerged: do not use stale PR prose as merge state. No open pull request existed in either baseline query.

## 8. Verdict and score timeline (for calibration)

| Date | Source | Verdict | Key evidence |
|---|---|---|---|
| 2026-10-03 | PRODUCTION_AUDIT revisions A to D at `8db0930` | NOT READY, 4.6 of 10 | Demo login, fake checkout, in-memory state, unsigned webhook, log-only worker, red CI at type-check |
| 2026-10-10/14 | IMPROVEMENT_PROGRAM | Not production-ready; ready for a closed, developer-run demonstration of the core loop; real-user beta gated on the P0 list (email, ratification, architecture decision, legal); public launch gated on P1 | Vitest 1072, PG 23, Playwright 205, 46 migrations |
| 2026-10-21 | FEATURE_STATUS, E2E_AUDIT | Not ready for public beta or GA; restricted trusted-career beta recommended after P0 fixes | Vitest 1172 in 115 files; 6 impl-unverified, 87 partial, 1 broken, 75 not implemented, 4 excluded |
| 2026-10-22 | AUDIT_MASTER_REPORT | Gated; recommended GA scope the core career loop; four external gates (transactional email, commercial billing, legal review, scheduled erasure policy) | 1143 tests in 112 files at `83dc7d24` |
| 2026-10-23 | PAYMENT_AUDIT, STRIPE_SUPABASE_AUDIT, REPOSITORY_AUDIT | NOT READY for production or a paid public launch | CI 1231 Vitest, 50 PG, 235 of 236 browser; 0 issue closures |

## 9. Immediate execution list and documentation-authority rules recorded on 2026-10-21 (FEATURE_PLAN L and K)

Immediate execution and decisions as written: (1) review D-01, D-02, D-03 and the proposed beta subset; keep code unchanged until each fix has a bounded reviewed contract; the audit grants no new architecture or pricing authority. (2) X-00: reconcile admitted feature contracts and the 248-rule ownership and acceptance gaps; confirm which source is the execution baseline; attach CI, PG and browser evidence in a permitted environment; explicitly authorize any protected paths before an emitting build. (3) X-05 and X-06 can start independent design and reproduction now; X-10 scanner repair is independent; do not rebuild the existing mail adapter or persistence stores. (4) Ask the owner for: email sender and provider approval, retention/deletion/legal contacts, persistence ratification and target snapshot, trust/session/executor decisions, free-only versus paid choice; "no elapsed time or unanswered question constitutes approval". (5) Once prerequisites exist, complete live proof and erasure recovery, then one admitted durable UI journey. (6) Run operational release drills before public exposure; expansion stays unscheduled until capacity and value are known.

Documentation-authority rules from the same report: the status record is the current baseline and keeps earlier assessments as history; the plan record separates priorities and keeps historical requirements as inputs; the evidence ledger supports the two records and is not a source of product authority; the memory file appends current results with a moving-head caveat and does not erase earlier learning or promote old counts; architecture documents add factual errata without changing decisions; the SSOT header drops stale implementation counts but policy and approval status are not rewritten by an audit; owner approval is required for scope, architecture and semantics, and portfolio ids are preserved. Template exports for system-design and business-review documents were blocked then (no compatible rendering capability) and were not approximated.

## 10. Improvement-program decisions and their reversibility (2026-10-14, section D)

| Decision | Reversible | Where recorded | Needed owner ratification |
|---|---|---|---|
| Persist the core loop to the database; maps become a boot-hydrated read model; single API writer | Yes (exit path documented) | persistence ADR | Yes, includes the schema change |
| Optimistic concurrency on core records (`CoreOp.base`, in-flight set, database re-check) | Yes | ADR decision 5 | No |
| Verification requires proof of control (email code, referee token); secrets stored only as SHA-256 (later: keyed hash for codes) | Yes | security notes | No |
| No payment processor means paid plans cannot be bought (`BILLING_MODE=disabled` default); `simulated` for demos and tests only | Yes | environment example, operations notes | Yes (pricing and entitlement) |
| Webhook signing scheme was the product's own Stripe-style `t=...,v1=...` until a provider is chosen | Yes | security notes | Replace with the provider's scheme when chosen |
| State what is not durable instead of hiding it (response header) | Yes | durability module | No |
| Log refused requests (4xx) at info, faults (5xx) at error | Yes | error handler | No |

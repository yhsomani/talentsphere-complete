# Legacy Requirements and Acceptance Criteria Extracted from the Prior Attempt's Reports

Doc ID: SPEC-LEGACY-C · Owner: Product Requirements Lead (proposed) · Version 1.0 · Status: Proposed (Under Review) · Date: 2026-10-26 · Merge track: C (source group `31_LEGACY_ARCHIVE/docs/reports/**`)

**Relationship (no original file was edited).** This file **supersedes nothing**. It is an **input register** that sits beside `SPEC_G1…G5`, `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` and `MICRO_FEATURE_SPECS.md`. Nothing here is approved scope. A requirement in this file becomes target scope only when a target specification or an ADR adopts it by ID. Linked from `00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md`; the documentation owner must also link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`. Owner instruction behind this merge: *"i dont want to loos information keep everything in use untile it get improved"*.

**Greenfield frame.** No source code exists in this repository and nothing is implemented. The reports describe an **earlier attempt** (a pnpm monorepo with a Fastify API, a React web app, a PostgreSQL worker and shared packages). Statements such as "fixed" or "durable" below describe that attempt's code at a dated commit; here they become **acceptance criteria the target must meet**, not claims of existing behavior. Technology names in the criteria (PBKDF2, Fastify, Resend, Stripe, PostgreSQL) are the prior attempt's choices and are kept so that nothing is lost; the target may satisfy the same criterion with a different mechanism if its ADR says so.

Companion files: `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` (lessons, `LES-nn`), `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (gates, `LRG-nn`), `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` (evidence method, `LEI-nn`).

## 1. How to read the IDs

| Prefix | Meaning | Where defined |
|---|---|---|
| `LGR-nn` | Acceptance statement derived from a defect that the prior attempt fixed or specified, with the covering test noted | Sections 3 and 4 |
| `BL-001`…`BL-018` | Release backlog item with Given/When/Then, from `RELEASE_SCOPE_AND_BACKLOG.md` (2026-10-22) | Section 6 |
| `X-00`…`X-11` | Cross-cutting delivery packets from `FEATURE_PLAN_2026-10-21.md` | Section 7 |
| `BL-F-nn` | One work packet per canonical feature (169 packets; F-38, F-39, F-62, F-63 excluded) | Section 9 register |
| `F-nn` | Canonical feature id of the prior registry (173 features) | Section 9 |
| `D-nn`, `O-nn` | Defects and owner decisions in `FEATURE_STATUS_2026-10-21.md` | Lessons file |

Priority vocabulary preserved: the registry's value score is 0 to 10 and is **not** release urgency. Delivery urgency is P0 (prevents safe or reliable release), P1 (completes a required journey), P2 (improves secondary capability or quality), P3 (can wait). Sizes S, M, L are uncertainty estimates, not days.

## 2. Product thesis, core loop and ideal state stated by the reports

**Thesis (IMPROVEMENT_PROGRAM A).** A career platform whose differentiator is trust: a candidate's claims (work history, skills, evidence) carry visible, explainable verification, such as a confirmed work email, references from named people and assessed evidence, so employers can hire on proof rather than self-description. Longer form from the 10-03 audit: a PWA-first career operating system around a Talent Graph and Evidence Graph with the loop *Goal, Gap, Learn, Practice, Prove, Verify, Discover, Match, Apply, Interview, Outcome, New Evidence*.

**Core loop (three actors).**
- Candidate: sign up, build profile, add work history, prove it (email code, references), apply.
- Recruiter: set up company, post job, review applicants (with a verification summary), move them through the pipeline.
- Referee: receive a one-time link, confirm dates and title, rate, so the candidate's record upgrades.

**Two-tier release boundary (RELEASE_SCOPE §1).** Tier 1, the core career loop (candidate sign-up, profile and skills graph, work-history proof of control, referee voucher, jobs, apply, ATS pipeline, messaging, notifications, settings and privacy) is the general-availability scope. Tier 2, the extended ecosystem (learning, challenge arena, video interview, multi-context reputation, salary intelligence), is staged and must be durable before broad release.

**Ideal-state blueprint (IMPROVEMENT_PROGRAM C), seven criteria the reports used as the definition of good:**
1. Every claim is proven or labelled; verification tiers derive only from evidence a third party controls; nothing in the UI asserts a capability, certification or result the system did not produce.
2. Everything the product promises to remember is durable, transactional and survives restarts, with concurrent writes that cannot silently overwrite each other.
3. Authorization is object-level everywhere: every route that loads a record by id checks the caller's relationship to it (owner, organization member, participant), not just that they are signed in.
4. The three roles each have a complete journey in the UI with real states (empty, loading, error, conflict, offline).
5. Delivery channels exist: transactional email (codes, reference links) and in-app notifications for status changes; without email the verification loop cannot run outside development.
6. Operable: one documented deployment, health that reports what is measured, error-level logs that mean faults, backups and a tested restore.
7. One architecture of record, with documents that describe it.

**Gap framing from the 10-03 audit (kept as requirement context).** A business owner cares about the terminal user outcome, not the number of backend endpoints; the intended first-visit path is *Landing, Sign up, Verify, Onboarding, Goal, Skills, Learning, Practice, Evidence, Profile, Jobs, Application, Interview, Outcome*; the golden rule is "documented, implemented, verified and production-ready are four different things".

## 3. Acceptance criteria derived from defects (by theme)

Each row is a testable statement. "Covering test" is the prior attempt's test file or suite where one was named; it is a pointer for test design only.

### 3.1 Honest interface and zero-state

| ID | Acceptance criterion | Source | Covering test in prior attempt |
|---|---|---|---|
| LGR-01 | When the sign-in API fails or returns non-OK, the UI shows a visible error and a retry; no token or identity is written to browser storage. | PRODUCTION_AUDIT QW-01, P0-01 | e2e `web-ui`, `navigation` |
| LGR-02 | Every transactional action (sign in, checkout, evidence, apply) shows success only after HTTP success, a valid response body and a confirmed state change. | QW-02 | e2e `core-loop` (three people, UI only) |
| LGR-03 | Dashboard, jobs and evidence pages render data from queries only; no hard-coded person, count, score or hash. A brand-new user sees a designed empty state. | P0 §7.2, §7.3, finding 5 | e2e `core-loop` |
| LGR-04 | Authenticated experiences are guarded by route guards; unauthenticated navigation to `/dashboard` redirects to sign-in; login honors `?return=` only for in-app paths. | QW-04; E2E audit | e2e `navigation` |
| LGR-05 | The UI contains no unsupported compliance or certification claim, no fabricated phone number, and support, privacy and security addresses come from validated configuration. Legal pages are labelled drafts until counsel approves. | finding 20; PR #43; BL-004 | e2e `web-ui`, `frontend-fixes` FE-02 |
| LGR-06 | Failed loads offer retry; a single error boundary per page; clear messages for offline, timeout and server errors; action errors show a plain notice and do not discard input; not-found is final. | F-21 requirement; E2E E10, G08, A16 | e2e `session-resilience` |
| LGR-07 | A 5xx response uses generic user wording (an explicit 503 may show its message); an unexpected HTML page shows "unexpected response"; field errors name the field using the API's `details`. | E2E G01, G03, E19b, E23b, E24b, N06 | `web-api-json.test.ts` (11 tests) |
| LGR-08 | When a session ends on its own the sign-in page shows the API's specific reason once (this tab only, gone on reload; none after a deliberate sign-out); a specific reason is never overwritten by a generic one. Wording: "Your session has expired or is no longer valid. Sign in again." | finding 31 | `session-ended-reason.test.ts`, e2e `account-security` |
| LGR-09 | A double click on sign-in, apply, add project, add role, send message and suspend produces exactly one request. | E2E audit; FE sign-in guard | e2e `frontend-fixes` |
| LGR-10 | Closing a job asks for confirmation and Cancel leaves it published; a hiring retry after a failed publish reuses the created draft instead of duplicating the job; the reference page distinguishes API outage (503, retry button) from invalid or used token (404); the applicant pipeline filter is an accessible toggle-button group (`aria-pressed`) rather than fake tabs; form input borders meet a 3:1 contrast ratio (prior: `neutral[500]`, 4.76:1). | PR #57 FE-04 to FE-07, FE-11 | e2e `frontend-fixes` (6 tests) |
| LGR-11 | Profile page offers "Download my data" with an explicit partial-export disclosure and error handling; the evidence page shows a session-ended notice. | FE-02, FE-03 | e2e `frontend-fixes` |
| LGR-12 | Responsive matrix: 23 pages at 7 viewports from 320x568 to 2560x1440 (portrait and landscape at 14 sizes were measured): no sideways scroll, nothing cut off, a one-row 64 px header at every width (full navigation from 1024 px signed in or 640 px signed out, menu button below that), one shared container (1200 px, 16/24/32 px gutters), stats 2x2 then 4 across, standalone text links and choices at least 32 px (44 px on touch), dialogs become bottom sheets under 640 px, the sticky header never hides a focused control (`scroll-padding-top`), text at least 12 px, WCAG 2.5.8 target size. | finding 33 | e2e `responsive` |
| LGR-13 | Layout stability: cumulative layout shift at most 0.1 at 390 px and 1280 px on every signed-in page (prior fixed to at most 0.008): PWA status detected before first paint, fixed-width account label, content area at least one screen tall. | finding 26 | e2e `performance` |
| LGR-14 | Accessibility baseline automated in the browser: document language, titles, landmarks, one H1, heading order, accessible names, labels, alt text, no positive tabindex, skip link, keyboard navigation, visible focus, 320 px reflow, 200 percent zoom, reduced motion. Contrast and screen-reader behavior stay manual checks. | PRODUCTION_AUDIT §8 | e2e `accessibility` |
| LGR-15 | URL fields (portfolio links, organization website, resume website, media and meeting URLs) accept only `http` and `https`; already-stored values render inert through a safe-href helper. | E2E E20 | `contracts-url.test.ts` (16 tests) |
| LGR-16 | The Connect button is hidden or disabled while a request is pending; the member id is validated client-side in plain words; a notes field shows a counter instead of silently cutting at 3000 characters; a paused job paused again from a stale tab shows user wording; "Work mode" select is at least 44 px on touch. | E2E N02b, F10b, F13, H03, R04 | open in the prior attempt |

### 3.2 Identity, sessions and passwords

| ID | Acceptance criterion | Source | Covering test |
|---|---|---|---|
| LGR-20 | Register, restart the API, sign in again: the account exists (real database). | finding 1 | `tests/pg/core-persistence.test.ts` |
| LGR-21 | Every request re-resolves account roles, suspension, erasure, password-change and sign-out cut-offs from the system of record; a role change applies to existing sessions immediately; restricted (suspended or banned) accounts may only appeal and exercise data rights; with durable storage a signed token for a missing account is refused ("This account no longer exists."). | findings 12, 35; TS-005 | `core-authz` ("account state is enforced", "applies a role change to existing sessions immediately"), `tests/pg/concurrency.test.ts` |
| LGR-22 | Passwords use a versioned format with at least 210,000 PBKDF2-HMAC-SHA512 iterations (or an ADR-approved stronger scheme), transparent re-hash on sign-in, a timing decoy for unknown emails, and a deployed-environment floor on iterations. Legacy hashes verify and re-hash. | finding 13; PR #58 | `password-hashing.test.ts`, `production-config.test.ts` |
| LGR-23 | Sign-out records the session id and the API refuses the token on every route until it would have expired; "Sign out of other devices" ends every other session and keeps this one; changing the password (current password required, throttled per account) ends every other session from the next second and keeps this device signed in. Tokens without a session id report `ended: false` and expire within 24 hours. | findings 27, 30 | `session-sign-out.test.ts` (mutation-checked), e2e `account-security` (two devices) |
| LGR-24 | Rate limits: per signed-in account (per address when anonymous), prior default 300 requests per minute, proxy trust configurable, health endpoints exempt, a plain 429 message with the wait time; separate login throttle (prior: 10 per 15 minutes per account); a test must run with production limits. | finding 24 | `api-security` "Rate limiting", `rate-limit-config.test.ts`, e2e `session-resilience` |
| LGR-25 | A deployed environment (production and staging) refuses to start without a token secret, with in-memory storage, with the default or localhost database URL, or without explicit CORS; error messages are generic to clients; a Content-Security-Policy is sent; staging may still allow simulated billing and a localhost origin for testing. | findings 14, 37; TS-004 | `production-config.test.ts` |
| LGR-26 | Sign-up and password change reject common and breached passwords and enforce a documented minimum (prior accepted `password` and `12345678`; decision open). | E2E B03b, B03c, E15c | open |
| LGR-27 | Registration cannot grant admin (neither `role` nor `roles[]`); profile mass-assignment cannot change roles or owner; edited-role, `alg:none`, garbage and non-Bearer tokens are rejected. | E2E suites B, C | `core-authz`, `api-security` |

### 3.3 Verification and trust

| ID | Acceptance criterion | Source | Covering test |
|---|---|---|---|
| LGR-30 | Corporate-email proof: domain must match the company domain; disposable and consumer webmail domains are rejected; a six-digit code is generated with a cryptographic RNG, stored as a keyed hash, valid 15 minutes, at most 5 attempts, consumed on success, delivered only through the queue and never returned in the HTTP response. | finding 3; SEC-01; BL-001 | `work-history-graph.test.ts`, `core-authz` |
| LGR-31 | Concurrency: 40 parallel wrong codes are evaluated at most 5 times and the correct code is then refused (conditional update `WHERE work_history_id = $1 AND code_hash = $3 AND attempts = $4`). | finding 8 | `tests/pg/concurrency.test.ts` (40 greater than 5 without the guard) |
| LGR-32 | Referee proof: a 128-bit random token, stored only as a hash, shown to the referee only, single-use, expiring (30 days proposed, `410 GONE` `reference_voucher_expired`), invalid or used tokens return a generic 404 (no id harvesting), submission refused when referee user id or referee email equals the candidate's, and refused for a signed-in session equal to the candidate (403); retries deduplicated by `clientRequestId` with a partial unique index on `(candidate_id, client_request_id)`. | findings 2, 19; SEC-02; BL-002; ARCHITECTURE_DURABILITY §3.2 | `work-history-graph.test.ts`, e2e `core-loop` |
| LGR-33 | Verification score: self-reported skills earn zero trust points; the score rises only with mailbox proof or independent references (prior question: 5 points for two typed skills undercut the promise). | improvement H7; PR #57 | owner decision |
| LGR-34 | Removing a role deletes its references and any open email challenge in the same transaction, cancels still-queued emails and strips their secrets, is owner-only, names what goes with it in a dialog, and a replayed "add role" creates a new role rather than returning the removed one; a removal racing a referee's submission resolves to one outcome. | finding 28 | `work-history-removal` integration, pg and e2e |
| LGR-35 | A challenge submission is stored once as evidence; a duplicate passing submission returns the original evidence; self-verification is blocked; self-reported skills earn 0 trust points. | PR #57; R2-8 | `review-r2-regressions.test.ts` |
| LGR-36 | A submission that was not executed never reports `passed` or a score; the result is "submission recorded, unverified" until an approved isolated executor exists. | D-01; X-05 | contract regression tests (to write) |
| LGR-37 | Course certificate issuance requires the final-assessment threshold (BR-048: at least 70 percent), is idempotent (no duplicate evidence or XP), recoverable when evidence persistence fails after completion, and linked certificate and evidence proofs agree on revocation with append-only history (BR-149). | D-09, D-10, X-11 | negative and boundary-score API tests, failure injection (to write) |
| LGR-38 | Reputation visibility (BR-167): `GET reputation/users/:userId` only for the subject, a platform admin, or a recruiter whose organization has an active application from the candidate; others receive 403; stealth candidates are hidden from recruiter listings; recalculation is admin-only; an explicit candidate consent setting is required for browse-without-application (BL-014). | PR #57, #58; R2-2 | `reputation-visibility.test.ts` |

### 3.4 Authorization and tenancy

| ID | Acceptance criterion | Source | Covering test |
|---|---|---|---|
| LGR-40 | Job status changes require membership of the job's owning organization (BR-12); draft jobs are not readable by outsiders; organization member roles come from a closed set (no `owner` injection), users must exist, duplicates rejected; admin role update accepts only valid roles. | findings 4, 10, 11 | `core-authz` "tenant isolation on job postings" |
| LGR-41 | Interview assessments are scoped to the hiring team and participants: only they can link an application, score, end, review or join; candidates never receive hidden test inputs or outputs; interview questions are scoped to the organization; scorecards never move an application backwards from a terminal state. | findings 9, 17; PR #57 | `core-authz` "interview assessments are scoped", "a scorecard never resurrects" |
| LGR-42 | A candidate cannot read, transition or list another candidate's application, the applicants of another organization's job, or a thread they are not part of (IDOR). A second recruiter's organization cannot read the first's pipeline. | E2E suite C, F2 | `core-authz`; cross-organization IDOR on hiring was a coverage gap |
| LGR-43 | Admin governance: self-suspend and self-demotion refused; a reason is required; suspension takes effect on the next request; audit entries carry the reason; reactivation works. A suspended user may sign in by design but the session is confined and the UI says the account is restricted. | E2E suite C, D | e2e admin |
| LGR-44 | Maintenance mode, when on, answers non-exempt requests with 503 and a user message; named exemptions (admins, health, login) are decided; the toggle has an enforced effect. | E2E M-1 | open |
| LGR-45 | Internal routes (`/internal/*`) exist only in development and test. | finding 15 | `api-security` |
| LGR-46 | A non-admin opening the admin area gets a refusal and no admin requests are sent. | E2E D20 | regression R05 |

### 3.5 Durability, concurrency and privacy lifecycle

| ID | Acceptance criterion | Source | Covering test |
|---|---|---|---|
| LGR-50 | After restart, all core-loop data returns: users, profiles, skills, organizations, memberships, jobs, evidence, applications, work history, references, notifications, sessions and revocations, messaging threads and read positions, settings, export and erasure requests, saved searches and saved jobs. Prior durable set listed in `LEGACY_REPORTS_EVIDENCE_INDEX.md`. | ADR-015; PRs #40-#54 | `tests/pg/*` (core-persistence, notifications, messaging, saved-jobs, saved-searches, work-history-removal, private-data-rls, concurrency) |
| LGR-51 | Concurrent hire and withdraw: exactly one is acknowledged; BR-15 re-apply after withdrawal allowed (partial unique index replaces `UNIQUE(job_id, candidate_id)`); user-record writes carry a base and a database re-check so a stale read cannot restore an old password. | findings 18, 27 | `tests/pg/concurrency.test.ts` |
| LGR-52 | Impossible dates, 300-character emails and absurd numbers return 422 (SQLSTATE class 22 mapped), not 500; duplicate ids give accurate conflict messages. | finding 21 | `core-authz`, `concurrency.test.ts` |
| LGR-53 | Erasure removes work history, references, evidence, notifications, messages, settings, export records, bookmarks and searches in the database, cancels the person's queued emails (best effort for an email already picked up), survives restart, and is resumable after a partial failure while the account stays closed; the 30-day request/cancel/execute lifecycle runs a scheduler that sets `status = executed` (BL-006) once the policy is ratified. | findings 16, 28; D-03; X-07 | `core-persistence`, `work-history-removal`, failure injection (to write) |
| LGR-54 | A durable store never keeps secrets after use: queue payload secrets are stripped on every terminal transition. | finding 19 | `tests/pg/concurrency.test.ts` |
| LGR-55 | Notifications are written in the same transaction as their cause; the hiring team is told of new applications and withdrawals; the candidate of every pipeline move and of referee responses; text contains no candidate names or private rejection reasons; a bell shows an unread count; mark-all-read persists after reload; erasure deletes the person's notifications; the in-app channel is the only channel until email push exists. | finding 25 | `core-notifications` integration, `tests/pg/notifications.test.ts`, e2e `notifications` |
| LGR-56 | Messaging: a conversation may start between connected people, or between a recruiter and a candidate after an application; two people share exactly one conversation (simultaneous starts serialized); messages, read positions and each message's notification are durable; opening a conversation marks its message notifications read; erasure deletes the person's messages; a "Message" action exists on an applicant card and a Messages page for both sides. | finding 32 | `messaging-rules` integration (start rule mutation-checked), `tests/pg/messaging.test.ts`, e2e `messaging` |
| LGR-57 | Two-account runtime RLS validation against a real database for messaging, notifications and preference tables; SQL apostrophe-escape safety; a CI sentinel proves server secrets (`TOKEN_SECRET`, `DATABASE_URL`) are never compiled into the web bundle. | PRs #41, #42 | `tests/pg/private-data-rls.test.ts`, `tests/security/private-data-rls.test.ts`, `scripts/check-client-secrets.mjs` |
| LGR-58 | BYO AI provider keys are encrypted at rest with AES-256-GCM using a separate 64-hex-character key; a plaintext downgrade is refused; the decrypted key is never sent to the client. | PR #51 | `core-persistence.test.ts` |
| LGR-59 | Migrations: strictly sequential numbering (no skips), checksum ledger, missing or duplicate or gapped ledger rejected, clean apply to an empty database and an idempotent second run; a read-only release preflight verifies drift; migration text for `stripe_customers` revokes from `anon`/`authenticated` as well as `PUBLIC`. | PR #52; S-3 | `scripts/tests/migration-integrity.test.mjs` (5 tests), CI |

### 3.6 Worker, email and background jobs

| ID | Acceptance criterion | Source | Covering test |
|---|---|---|---|
| LGR-60 | A job kind either performs its effect or fails visibly; kinds that only record an event say so ("event recorded") with the reason; no `notification.push` job exists without a channel. | finding 34 | `notifications` integration "queues no push delivery"; dispatch-kind drift guard in `background-jobs` |
| LGR-61 | Email adapter: development logs to a labelled dev outbox; staging and production require `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` and `EMAIL_FROM`; the provider call carries `Idempotency-Key: <jobId>`; 408, 429 and 5xx retry with exponential backoff; permanent 4xx raises a permanent error that ends retries; API endpoints that depend on mail return 503 when unconfigured in staging or production; worker configuration validation refuses incomplete email settings at startup. | PRs #43, #51 | `production-config.test.ts`, transactional-mail tests |
| LGR-62 | Worker claims are bounded to execution capacity and acknowledgements are fenced by claim ownership; with six jobs and two workers no job runs twice beyond the bounded rule; a crashed claim recovers; cancellation wins; heartbeat is truthful. | D-02; X-06 | fake-clock unit test; two-worker PG test (to write) |
| LGR-63 | The worker records a heartbeat and the API reports queue age and worker health; losing the single-writer lease fails requests closed with 503 (prior design, see lessons LES-32). | PR #43; ARCHITECTURE_DURABILITY | `tests/pg/core-persistence.test.ts` |

### 3.7 Billing and commerce

| ID | Acceptance criterion | Source | Covering test |
|---|---|---|---|
| LGR-70 | No card fields are collected anywhere; paid plans are refused unless billing is enabled; `BILLING_MODE` defaults to `disabled`; simulated mode is refused by production configuration; free-only is an allowed launch decision. | finding 6; X-03 | `billing*.test.ts`, e2e `web-ui` pricing |
| LGR-71 | Paid access is granted only after a signed provider event is verified (raw body, signature, tolerance) and reconciled; unknown prices grant free entitlements; the redirect page grants nothing. | PR #71; REPOSITORY_AUDIT §F | `stripe*` unit, integration, pg tests |
| LGR-72 | Billing events are stored durably keyed by `(provider, provider_event_id)` unique, transactionally; replays are recorded once; idempotency keys are scoped per user and compared with the requested plan and cycle (mismatch returns 409). | P-5; migration 00052 | `tests/pg` billing tests |
| LGR-73 | A subscription scheduled to cancel at period end settles to free on read and on cancel; repeating a period-end cancel is a no-op; immediate cancel remains allowed. | P-3, P-4 | `billing-domain.test.ts` |
| LGR-74 | Refund policy (owner decision 2026-10-23): a full refund of the charge that paid for the current period ends paid access by cancelling at the provider immediately; a partial refund or a refund of an older charge changes nothing; the cancel runs before the event is recorded so a provider failure makes the provider retry; a replay is recorded once. Dispute and void handling remain a decision. | STRIPE_SUPABASE update | integration test with fake gateway |
| LGR-75 | Concurrent Checkout sessions: a second paid subscription must not be silently ignored while still billed; auto-cancel or refund is a pricing decision (O-1). | O-1 | open |
| LGR-76 | Erasing a user whose provider customer is already deleted completes; with provider mode off, erasure fails closed or queues operator reconciliation. Erasure removes invoices and billing events. | S-1; P-6; R2-05 | unit test for `deleteCustomer`; failure test (to write) |
| LGR-77 | Entitlements (not the plan tier) gate features; plan role target is enforced; the AI gateway reads the tier from persisted entitlements and persists usage meters. | F-61; SEC-06; BL-010 | `ai-gateway*.test.ts` |
| LGR-78 | Provider configuration checklist (manual, not code): six `STRIPE_PRICE_*` prices; a webhook endpoint at `/api/v1/billing/stripe-webhook` subscribed to `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`; a Customer Portal configuration; billing stays disabled until done. | STRIPE_SUPABASE | LRG gates |

### 3.8 AI governance

| ID | Acceptance criterion | Source | Covering test |
|---|---|---|---|
| LGR-80 | `AI_PROHIBITED` is consulted at every AI entry point (prior: the assistant query and career-assistant chat), reads active assessment sessions from durable storage and rejects with `403 ASSESSMENT_AI_PROHIBITED` even after a restart. | SEC-05; BL-009 | `injection-defenses.test.ts` "AI_PROHIBITED" |
| LGR-81 | AI quotas by tier (free 5,000 tokens and 20 requests per day, pro 100,000 and 500, enterprise 1,000,000 and 5,000); free-user spend is policy-gated; consumer AI subscriptions confer no API rights; usage meters persist. | SEC-06; FINAL_VALIDATION | `ai-gateway-domain.test.ts` |

## 4. Adversarial regression acceptance (from the 227-check browser and API audit)

| ID | Acceptance criterion | Evidence in the prior attempt |
|---|---|---|
| LGR-90 | Public routes, 404, protected-route redirects and malformed ids behave (18 of 18 checks). | Suite A |
| LGR-91 | Sign-up and login validation, enumeration resistance (same message for wrong password and unknown user), XSS in name, open redirect, double submit, session, logout. | Suite B (18 of 20 passed; 2 defects: weak passwords) |
| LGR-92 | API authorization: admin routes 401 unauthenticated and 403 for candidates and recruiters; token tampering; privilege escalation; IDOR; headers; CORS; payload limits; admin governance. | Suite C (52 of 53; open: no CSP header) |
| LGR-93 | Admin console in the browser: user search, suspend or reactivate, role changes, audit log, health, maintenance. | Suite D |
| LGR-94 | Candidate flows: jobs, apply, withdraw, profile, password, settings, portfolio, resumes, network, learning. | Suites E, E2 |
| LGR-95 | Recruiter: post job validation, publish, XSS in titles, two-tab race; cross-user pipeline: apply, review, reject, notifications. | Suites F, F2 |
| LGR-96 | Resilience: 500, bad bodies, timeout, offline, revoked and expired sessions. | Suite G |
| LGR-97 | Mobile (390x844), keyboard, labels, headings, focus, zoom, color scheme. | Suite H |
| LGR-98 | Work history, network, messaging (IDOR, XSS), learning. | Suites I, I2 |
| LGR-99 | Regression suite R: every fixed defect has a named regression check (13 of 13). | Suite R |

**Not covered by the prior audit (must be covered in the target):** rate-limit and lockout behavior with production limits; Postgres-mode end to end; real email (codes, digests), payments (checkout only rendered), file upload and resume export, certificate verification, reference-giving with a real token, interview and API-only features; browsers other than Chromium and real devices; screen-reader behavior beyond labels, headings, focus trap and visibility; a second recruiter's organization (cross-organization IDOR on hiring) and large datasets or pagination; session expiry by TTL; skip link as first Tab stop on a signed-in page; a Reticle verdict for F-17.

## 5. Founder corrections and corpus facts recorded in the reports

From `FINAL_VALIDATION_REPORT.md` v6.0 ("Founder corrections applied"). These are statements of intent in the prior attempt, kept as inputs; the target's ADR register decides which stand.

1. The application API is the browser mutation boundary.
2. A modular monolith is the starting architecture; the shared kernel is narrowed.
3. The AI Gateway is foundational; assessment AI policy is inherited server-side; free-user AI spend is policy-gated; a consumer AI subscription is not assumed to confer API rights.
4. Realtime is advisory, never business truth.
5. Queues plus workers are the initial async design (prior text: Supabase Queues).
6. Search, cache and service extraction are measurement-gated.
7. Sensitive analytics use configurable privacy thresholds: k at least 10 default for public or sensitive small cells, at least 20 for career benchmarks (BR-160), at least 30 for learning-impact correlations (BR-189).
8. Credential portability targets stable W3C VCDM 2.0 semantics; draft VCDM 2.1 is monitored, not required.
9. Production readiness remains an executable evidence gate.

External basis claimed as checked: Supabase RLS/grants guidance, Supabase Queues and Edge Functions, WCAG 2.2 AA in the web shell and tokens, W3C VCDM 2.0/2.1 status, India DPDP Rules and GDPR Article 17 erasure with a 30-day grace period.

**Corpus counts in the prior registries (for scope sizing):** 173 unique feature ids (F-01 to F-173, zero duplicate headings), 28 canonical journeys (J-01 to J-28), 66 workflows declared, 248 business rules (BR-001 to BR-248), 8 migration rules, 100 UX micro-interactions. Severity rubric: Critical, High, Medium, Low (E2E audit); P0 to P3 elsewhere.

## 6. Release backlog BL-001 to BL-018 (Given / When / Then)

Source: `RELEASE_SCOPE_AND_BACKLOG.md` (2026-10-22, HEAD `83dc7d24`). Urgency P0 blocker, P1 critical, P2 high, P3 medium. Verifying tests are the prior attempt's commands, kept as test-design pointers.

| ID | Item (traces) | Acceptance criteria | Verifying test (prior) |
|---|---|---|---|
| BL-001 | **P0** Corporate-email challenge keyed hash (SEC-01, issue "email", F-94). As a security engineer I want OTP codes hashed with HMAC-SHA256 using a server secret. | Given a candidate requests corporate email verification for work history W; when the 6-digit OTP is stored in `work_history_email_challenges`; then `code_hash` is `createHmac('sha256', TOKEN_SECRET).update(workHistoryId:code)`; and raw `sha256(id:code)` without a server secret is not used anywhere. | `work-history-graph.test.ts`, `injection-defenses.test.ts` |
| BL-002 | **P0** Referee token TTL (SEC-02, F-58, F-94). | Given a reference request with a 128-bit token; when the record is created in `employment_references`; then `expires_at` is `now() + 30 days`; and a lookup or submit after expiry is rejected `410 GONE` (`reference_voucher_expired`). | `work-history-graph.test.ts -t "voucher expiration"`, `tests/pg/work-history-removal.test.ts` |
| BL-003 | **P0** Transactional email staging DNS and provider configuration (issue "email", F-94). | Given staging config; when the API boots with `NODE_ENV=production`; then `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` validate; and the worker dispatches a live test email with valid DKIM alignment (SPF, DKIM, DMARC). | `production-config.test.ts`; staging live test script |
| BL-004 | **P0** Legal Terms and Privacy Policy review (issue "privacy", F-15). | Given the legal pages; when audited against GDPR, CCPA/CPRA and India DPDP; then formal legal approval is recorded in a governance record; and privacy and security mailboxes are active. | e2e `frontend-fixes` FE-02 |
| BL-005 | **P0** Reverse proxy root health route (OPS-02, PR #55). | Given the proxy config; when GET `https://SITE/health`; then it proxies to the API and returns JSON `{"status":"ok"}` with 200 rather than static `index.html`. | `curl` on staging |
| BL-006 | **P1** Scheduled erasure after the 30-day grace period (issue "erasure", F-15). | Given an erasure request with `status: pending` and `scheduled_for <= now()`; when the scheduled worker runs; then due erasures purge work history, references, applications, messages and account, and set `status = executed`. | `tests/pg/core-persistence.test.ts -t "erasure"`, `worker-queue.test.ts` |
| BL-007 | **P1** Fix the security test script (toolchain). | Given the test script; when `test:security` runs; then it invokes `vitest run tests/security` (no `--dir`) and exits 0 across all 5 security files. | `pnpm test:security` |
| BL-008 | **P1** Ignore committed caches and agent folders in lint. | Given the lint ignore file; when `graphify-out/` and `.agents/` are added; then `pnpm lint` exits 0. | `pnpm lint` |
| BL-009 | **P1** Persist active assessment sessions (SEC-05, F-08, F-11). | Given a candidate starts an assessment with `AI_PROHIBITED`; when the session is created; then it is written to `assessment_sessions`; and after an API restart the AI assistant call is rejected `403 ASSESSMENT_AI_PROHIBITED`. | `injection-defenses.test.ts -t "AI_PROHIBITED"`, pg "assessment session restart" |
| BL-010 | **P1** AI gateway tier and metering (SEC-06, F-11, F-16). | Given a user with an active pro subscription; when POST career-assistant chat; then `userTier` resolves to `pro` from entitlements; and daily meters persist in `ai_usage_meters`. | `ai-gateway-domain.test.ts`, `ai-gateway.test.ts` |
| BL-011 | **P2** Durable challenges and arena (F-08, issue "durability"). | Given a challenge submission; when evaluation completes; then writes pass through the persistence layer into `challenge_submissions` and `xp_transactions`; and the durability header is not `ephemeral`. | pg "challenges durability" |
| BL-012 | **P2** Wire the assessments page to the backend (F-08). | Given a candidate on `/assessments`; when the page loads; then it fetches `GET /challenges`; and submitting code dispatches `POST /challenges/:id/submit` and displays verified test results. | e2e `core-loop` |
| BL-013 | **P2** Durable LMS courses and progression (F-07). | Given an enrollment; when `POST /lessons/:id/progress`; then the record commits to `lesson_progress`; and certificates are written to `course_certificates`. | pg "lms durability" |
| BL-014 | **P2** Candidate reputation visibility consent (BR-167, F-144). | Given candidate settings; when toggling "Allow verified recruiters to view reputation"; then `user_settings.reputation_visibility` updates; and `GET reputation/users/:userId` allows authorized recruiters when consent is granted. | `reputation-visibility.test.ts` |
| BL-015 | **P2** Application draft autosave to the database (F-36). | Given a candidate editing an application; when input changes (prior: every 30 seconds); then the draft is written to `application_drafts`; and reopening the job restores it. | pg "application drafts" |
| BL-016 | **P3** Stripe Checkout and subscription lifecycle (issue "payment", F-16). | Given `BILLING_MODE=stripe` and a valid secret key; when a recruiter selects Pro; then a Checkout Session is created; and on `checkout.session.completed` the subscription activates. | `billing.test.ts` |
| BL-017 | **P3** Containerized code-execution sandbox (issue "interview sandbox", F-88). | Given `POST /interviews/execute-code`; when executed; then the runner uses a container with a seccomp profile, zero network egress, a 128 MB memory cap and a 5-second CPU timeout; and stdout, stderr and exit code return to the API. | `technical-interview.test.ts` |
| BL-018 | **P3** Image pruning (OPS-01 as labelled there). | Given the production Dockerfile; when the image is built; then the runtime stage copies only compiled output and production dependencies, no test runner or compiler; and the image is below 250 MB. | `docker images` |

**Feature scope boundary of the 10-22 report (GA core loop):** F-01, F-03, F-12, F-15, F-60, F-65, F-80 (identity); F-84, F-96, F-173 (taxonomy and evidence); F-58, F-94, F-162 (proof of control); F-04, F-05, F-06, F-25, F-32, F-56, F-102, F-117 (jobs and hiring); F-10, F-14, F-29 (communication); F-02, F-21 (platform). Deferred: F-81, F-163, F-110, F-123, F-89, F-146, F-36, F-37, F-104, F-142, F-33, F-53, F-55, F-07, F-08, F-16, F-17. The 10-21 audit proposed a **different** beta subset (section 8) because it rated several of these features partial.

## 7. Cross-cutting delivery packets X-00 to X-11 and stories

Source: `FEATURE_PLAN_2026-10-21.md` sections G to L. Estimates are uncertainty classes, not dates.

| ID | Outcome | Feature ids / score | Urgency | Depends on | Estimate / risk | Acceptance | Evidence |
|---|---|---|---|---|---|---|---|
| X-00 | Exact-source baseline, atomic contracts reconciled, launch scope approved | All | P0 | Owner scope; permitted verification environment | M, high uncertainty | Given a chosen release, every included subfeature has role, boundary, rule, failure and recovery acceptance and an evidence owner; the source or build SHA and baseline results are recorded; unreviewed rules remain unaccepted | Ledger completeness and link checks; root CI, isolated PG and browser |
| X-01 | Persist one selected user journey per slice; no blanket migration | BL-F-07, 09, 26, 32, 36, 84 and other admitted slices | P1 (P0 if a durable promise is made) | X-00; ADR/schema gate X-08 | M per slice, L combined | Given two users, one creates or updates, then API and worker restart: only authorized data returns; concurrent duplicates arbitrate; erasure removes it; the UI makes remaining preview limits explicit | PG physical-row, restart, race, isolation, erasure tests; API negative cases; browser verdict |
| X-02 | Real verification delivery through the existing mail adapter | F-94 (7), F-162 (5) | P0 | Provider, sender and cost approval, secrets, X-06 | M, external uncertainty | Given an approved staging sender, the mailbox receives the code or referee link; token is absent from requester and logs, expires, is single-use; retries preserve idempotency; failure raises a monitored alert | Transactional-mail and authz tests plus a live mailbox and queue drill |
| X-03 | Record the commercial decision and enforce it | F-16 (7), F-61 (4) | P1 decision | Owner decision; OD-34 if premium | S decision, paid integration L | Free-only: paid activation consistently unavailable in UI and API. Paid: approved provider, durable replay-safe payment, entitlement, cancel, refund; no invented card storage | Billing negative and security tests; provider sandbox only after approval |
| X-04 | Optional offline shell with truthful sensitive-data boundaries | Cross-cutting | P2 | Offline scope; explicit build-config approval | M | Network-off shell works; sensitive API decisions stay server-authoritative; logout clears applicable private cache; failed writes never falsely succeed | Real browser offline, reconnect, logout; cache inspection |
| X-05 | Honest submission-only challenge semantics or approved isolated execution | F-08 (9), F-88 (9) | P0 | D-01; trust policy | S fail-closed, L executor | Arbitrary or wrong text never claims verified execution or a genuine pass; evidence stays pending or unverified; assessment policy stays enforced; retries mint no duplicate evidence | Domain and API contract regressions; UI outcome; adversarial sandbox suite only if an executor is approved |
| X-06 | Bound job claims to capacity and fence stale acknowledgements | Supports F-94, F-14 | P0 | D-02; operations coordination | M | With two workers and a slow batch, expired owners cannot complete newer claims; unfinished jobs recover after a crash; cancellation wins; mailbox idempotency preserved; heartbeat truthful | Fake-clock unit regression, real PG two-worker and kill test, mail retry and cancel tests |
| X-07 | Approved, recoverable erasure and privacy lifecycle | F-15 (10) | P0 | Policy and legal decisions; D-03; X-08 | M/L, high | Failure after core deactivation: cleanup resumes without user login; status records completion; request, cancel and due behavior match policy; shared data and backups have explicit retention | Failure injection at each store boundary, restart and idempotency tests, closed-session tests, browser request and cancel, restore and redaction drill |
| X-08 | Ratify the persistence design and rehearse populated migration and hosted access | Core features | P0 before any target upgrade | Owner approval; isolated snapshot; target role model | M, high data uncertainty | Migration ledger rejects drift; duplicate case-folded emails and active applications resolved by approved policy; target grants and RLS deny cross-account reads; rollback and restore exercised | Migration guard, PG suite, read-only preflight, populated upgrade and recovery record |
| X-09 | Prove operations and release acceptance | All in scope | P0 gate | X-02, X-07, X-08; authorized host and secrets; approved RPO and RTO | L, split by drill | One writer enforced (if relevant); HTTPS and proxy correct; worker-kill and queue-age alerts observed; backup restored independently; smoke passes on the restored app; measured load and cold boot accepted; rollback and go/no-go signed | Exact-SHA CI, staging browser and API, live drills, latency, boot and memory evidence; no fictitious SLOs |
| X-10 | Verification fails honestly; formatting gate restored | All; D-07, D-08 | P1 scan, P2 format | Scope of pre-existing edits | S | A scanner detects a synthetic secret and fails on scanner error on Windows and Linux; a bounded format change passes intended checks; no coverage weakened | Focused scanner tests and a read-only format check |
| X-11 | Course completion trust and recoverable issuance | F-07, F-52 | P0 before assessed credentials are exposed | D-09, D-10, BR-048, BR-149, X-00, X-01 | M/L | Absent or failed attempts cannot issue a credential; an eligible passing attempt issues once; repeated requests cannot duplicate evidence or XP; failure between completion and evidence or certificate writes is recoverable; restart preserves completion and public verification truth; linked proofs agree on revocation with append-only history and no accidental revocation of independent evidence | Negative and boundary-score tests, failure injection, concurrent retry, PG restart, browser completion and public verification |

**Ready stories proposed for first engineering review (FEATURE_PLAN G).**

| Story | Included / excluded | Given / When / Then | Sequence |
|---|---|---|---|
| X-05a honest challenge submission | Shared result contract, API consumers, tests; no sandbox | Given a valid session and non-executable text; when submitted; then return a submission-only, unverified outcome without a real score | Find every caller of the submission result, agree the bounded contract, change domain, API and UI together, negative and retry tests, browser outcome; preserve arbitrary-language validation and the AI prohibition |
| X-06a safe claim capacity | Runner and store claim ownership and cancel; no queue replacement | Given a batch slower than its lease and a second worker; when work is reclaimed; then the old owner cannot execute or acknowledge it | Reproduce the six-job case with a controlled clock, smallest capacity and lease fix, claim-token fencing if needed, PG dual-worker and crash or cancel test, live mail retry; a single batch-size change does not prove generic timeout cancellation |
| X-07a resumable cleanup | Durable completion and retry of existing stages; no new retention policy | Given core erasure commits and the next store fails; when recovery runs; then cleanup completes while the account stays inaccessible and status is accurate | Decide transaction versus persisted workflow, fault injection, atomic or resumable implementation, restart and operator recovery, approved privacy copy |
| BL-F-32a saved-search alert completion | Reuse SQL search and bookmark stores; alert state and chosen UI; no email digest | Given a saved search; when an eligible job publishes; then the owner sees one durable alert after restart and another user cannot read it | Confirm scope, inspect publish and matching calls, scoped persistence, UI list and recovery, duplicate publish, restart, isolation and erasure tests, browser verdict |
| BL-F-07a durable lesson progression | One enrollment, lesson, progress path; no quiz engine, commerce or marketplace | Given an enrolled learner; when a sequential lesson completes and the API restarts; then progress persists and unauthorized or out-of-order completion is denied | Reuse the course page, persist exact entities, API and domain tests, PG constraints and races, browser reload plus process restart |

**Definition of Ready.** Approved user outcome and included and excluded subfeatures; accountable role; exact API, domain and storage boundary; prerequisite decisions; observable positive, denied and recovery criteria; migration and rollback impact; estimate with uncertainty; available verification environment. "API exists, add UI" is not automatically Ready.

**Definition of Done.** All agreed acceptance passes across affected layers; authorization, privacy and evidence rules preserved; PG durability, race and erasure checks where relevant; browser journey and an in-app verification verdict for visible changes; loading, empty, error and retry behavior; no regression in selected core flows; lint, types, build and CI pass in an authorized environment; docs and status updated with command, commit and date; operations and rollback evidence; no unresolved critical defect. `unknown`, `no-fault`, a test title or code presence is not a pass. Release-level addition (REPOSITORY_AUDIT M): reviewed minimal diff, no protected-file edits or leaked secrets, role-boundary, negative, retry and idempotency tests, main green and manual runtime proof for UI changes, schema migration and rollback sign-off for database work, deferred gaps documented.

**Earlier foundation packets X-01 to X-04 (superseded wording of the first 2026-10-21 plan, kept because their "done when" sentences are acceptance criteria).** X-01 durable storage for in-memory modules (P0): move every route outside the durable set behind the persistence path with its own tables, list routes in the durability module, add database tests; done when, after an API restart, data created before it is still there for each migrated module. X-02 real email delivery (P0): replace the development outbox with a provider adapter configured by environment variables, with templates for verification codes, notifications and digests; done when a verification code arrives in a real test inbox from staging and a fake-provider test covers the adapter. X-03 payment provider decision and billing wiring (P1): the owner chooses a provider; until then keep simulated billing with a visible "simulated" label; after the choice add the adapter and webhook signature checks; done when the decision is recorded, the simulated flow works end to end and the real flow passes sandbox tests. X-04 offline app shell (P2): precache the app shell and recently viewed pages with a service worker and only then describe the app as offline-capable; done when, with the network off, the dashboard shell loads and shows a clear offline message. The first plan also listed "already built, keep, do not rebuild" 16 features (F-01, 02, 03, 04, 05, 06, 09, 10, 12, 14, 15, 20, 25, 26, 94, 162) and parked F-38, F-39, F-62, F-63.

**Always-working quality strategy (FEATURE_PLAN J).** Loop: understand, search callers, contracts and tests, plan a bounded increment, change the shared root cause, run focused tests, verify the real flow, run an appropriate regression, review, document, report; finish and verify each feature before starting a dependent one; a failing integration stops dependent work; never weaken or delete checks to turn a dashboard green.

| Gate | Mechanism in the prior attempt | Required improvement noted there |
|---|---|---|
| Static, format, types | Prettier check, TypeScript project references, non-emitting substitutes | Resolve baseline formatting; no evidence for replacing tooling |
| Domain, API, security | Vitest; production-config and authorization regressions | Add D-01, D-02, D-03 cases; portable fail-closed scanner |
| Database | CI Postgres service, migrations applied twice, ledger guard, schema preflight, PG tests | Add populated upgrade and rollback and hosted role evidence |
| Browser, accessibility, performance | Playwright on built API and web | Source-matched build; manual contrast and screen-reader gaps; measured SLOs |
| Client secrets | CI sentinel build and scan; source check | Fix Windows false green |
| Operations | Writer lock, worker heartbeat, preflight, backup and restore scripts | Execute drills; monitor externally; fix lease fencing |
| Release | CI plus release checklist | Attach exact-SHA acceptance and owner decision |

## 8. Release scope options and the beta subset proposed on 2026-10-21

| Option | Value | Tradeoff | Disposition then |
|---|---|---|---|
| Restricted trusted-career beta | Identity, profile and evidence, mailbox and reference proof, jobs, apply, recruiter review, outcome, messaging and account controls | Learning, proof and career portions of full GA remain incomplete; must be labelled beta and approved | Recommended first; owner decision pending |
| Full PRD career-loop GA | Adds dependable learning, practice, portfolio, proof and career progression | Needs persistence and assessment-trust work plus outcome acceptance | Follow beta; keep PRD section 8 requirements |
| Broad portfolio launch | More surface | The 173-feature inventory is not a coherent first increment; magnifies durability, provider and governance risk | Not recommended |

Proposed beta subsets (relevant parts of): F-01, 02, 03, 04, 05, 06, 10, 12, 14, 15, 17, 20, 21, 24, 25, 32, 35, 52, 56, 60, 84, 94, 96, 162 (24 features, "Proposed beta"). Needed for full-loop GA (9 features, "Proposed GA"): F-07, 08, 26, 85, 91, 95, 106, 122, 145. Decision gates (12): F-11, 16, 33, 45, 61, 88, 93, 99, 154, 159, 165, 168. Excluded (4): F-38, 39 (deprecated), F-62, 63 (not recommended). Deferred (124): everything else, "Expansion; unscheduled". Preview-only screens (networking, learning, assessment, career) must not be silently deleted: decide to restrict access or communicate durability and assessment limits, with an impact review and full-flow verification. Proctoring, premium-candidate policies and candidate-level predictive decisions keep their gates.

## 9. The 173-feature register of the prior attempt, with dependencies and candidate acceptance

**What this is.** A compact join of three archived sources: the `features` array of `AUDIT_EVIDENCE_2026-10-21.json` (173 records), the build-order and backlog tables of `FEATURE_PLAN_2026-10-21.md` (wave and order) and the 173-row matrix of `FEATURE_TRACEABILITY_MATRIX.md` (2026-10-22). It was produced by a script that reads those files unchanged, so every cell traces to a source cell. The JSON keeps the longer text (actual behavior, reference candidates, test evidence, ten maturity dimensions per feature), which stays archived; the expected-behavior sentence of each feature is reproduced in section 9.1.

**It is a register of the earlier attempt's claims, not a target feature list.** The target feature list is in `04_PRODUCT_CAPABILITIES` and `05_FEATURE_SPECIFICATIONS`. Use this register to check that no prior feature, dependency edge or candidate acceptance statement is missing from the target, and to see which prior features were judged absent, partial, broken or excluded.

**Columns.**
- *Reg. score / phase*: the prior registry's value score (0 to 10) and phase (Ph0 to Ph10); not urgency.
- *Registry dependencies*: the registry's edges as recorded. The reports warn that these are not necessarily hard runtime blockers (for example F-94 lists F-58 written recommendations although work-history verification existed without it), and that registry cycles (skills, learning and assessment depend on each other) need interpretation, not automatic topological sorting.
- *Status 2026-10-21 (earlier static)*: the stricter status of `FEATURE_STATUS_2026-10-21.md` with the earlier static assessment of the same day in brackets (Implemented, Partial, Not started and so on). Vocabulary: Impl-unverified = implemented but unverified; Partial = partially implemented; Not impl = no matching code found by a search-limited scan (a checklist to confirm with the owner, not proof of absence); BROKEN = broken or regressed; Excluded = deprecated or not recommended by the registry.
- *Matrix 2026-10-22*: the traceability matrix's status (Full, Partial, Missing, Stub) and durability (Durable, Ephemeral, Stateless, N/A). It disagrees with the previous column on many rows (lessons file LES-06).
- *Delivery / stage*: delivery urgency P0 to P3 and the release stage proposed on 2026-10-21 (Proposed beta, Proposed GA, Decision gate, Expansion; unscheduled, Excluded).
- *Wave / order*: the historical plan's wave (count of not-yet-started dependencies above the feature; W0 can start now) and build order number, for the 153 features still to build or finish.
- *External dependency*: an external condition recorded in the JSON (owner decision on provider, policy, entitlement or consequential logic; email provider and live delivery evidence).
- *Candidate acceptance*: the feature-specific sentence from the plan. Where the plan used its generic sentence it is abbreviated; the generic sentence is: "Given an authorized actor and approved contract, when the complete journey and its denied/recovery cases run, then outcomes match the contract and survive required restarts."

**Counts (2026-10-21 audit).** Partially implemented 87, Implemented but unverified 6 (F-02, F-03, F-10, F-14, F-20, F-25), Broken or regressed 1 (F-08), Not implemented 75, Deprecated or rejected 4 (F-38, F-39, F-62, F-63); total 173; zero features certified implemented-and-verified. Delivery urgency: P0 3 (F-08, F-15, F-94), P1 30, P2 53, P3 83, not applicable 4. Release stage: Proposed beta 24, Proposed GA 9, Decision gate 12, Expansion 124, Excluded 4. Earlier static assessment of the same day (kept as history in the report): Implemented 16, Partial 78, Not started 75, Deprecated 2, Not recommended 2. Traceability matrix 2026-10-22: Full 26, Partial 91, Stub or mock 6, Missing 50. Historical plan counts by registry-derived tier: P0 16, P1 45, P2 53, P3 39; by wave: W0 117, W1 29, W2 6, W3 1.

The 14 external-dependency rows are F-11, 16, 33, 45, 61, 88, 93, 99, 154, 159, 165, 168 (owner decision) and F-94, F-162 (email provider and live delivery evidence).

| ID | Feature (category) | Reg. score / phase | Registry dependencies | Status 2026-10-21 (earlier static) | Matrix 2026-10-22 | Delivery / stage | Wave / order | External dependency | Candidate acceptance |
|---|---|---|---|---|---|---|---|---|---|
| F-01 | Authentication & Session (Identity) | 10 / Ph0 | – | Partial (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-02 | Landing Page (Shell) | 3 / Ph0 | – | Impl-unverified (Implemented) | Full / Stateless | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-03 | Dashboard (Role-Adaptive) (Shell) | 10 / Ph0 | F-01 | Impl-unverified (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-04 | Job Marketplace (Marketplace) | 9 / Ph2 | F-01, F-12 | Partial (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-05 | Post Job Studio (Marketplace) | 8 / Ph2 | F-04 | Partial (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-06 | ATS / Candidate Pipeline (Recruiting) | 9 / Ph2–3 | F-04, F-05 | Partial (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-07 | Learning Management System (Learning) | 9 / Ph1 | F-01, F-12 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed GA | W0 / #5 | - | A learner completes a lesson in the UI and the progress bar and server agree after a reload. |
| F-08 | Challenges Arena (Assessment) | 9 / Ph1 | F-01, F-12 | BROKEN (Partial) | Partial / Ephemeral | P0 / Proposed GA | W0 / #6 | - | A candidate starts a challenge, submits code and sees a stored score. |
| F-09 | Professional Networking (Social) | 8 / Ph2 | F-12 | Partial (Implemented) | Partial / Ephemeral | P2 / Expansion; unscheduled | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-10 | Direct Messaging (Communication) | 10 / Ph0 | F-01 | Impl-unverified (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-11 | AI Career Assistant (Basic) (AI) | 8 / Ph1/Ph4 | F-12 | Partial (Partial) | Partial / Ephemeral | P2 / Decision gate | W0 / #26 | Owner decision for provider/policy/entitlement or consequential logic | A candidate asks a question, gets an answer, and sees usage go up. |
| F-12 | Profile Management (Identity) | 10 / Ph0 | F-01 | Partial (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-13 | Resume Builder (Identity) | 7 / Ph1 | F-12 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #31 | - | A candidate edits a resume section, exports it, and the export contains the edit. |
| F-14 | Notification Center (Communication) | 10 / Ph0 | F-01 | Impl-unverified (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-15 | Settings (Shell) | 10 / Ph0 | F-01 | Partial (Implemented) | Full / Durable | P0 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-16 | Billing & Subscriptions (Monetization) | 7 / Ph5 | F-01 | Partial (Partial) | Partial / Ephemeral | P2 / Decision gate | W0 / #48 | Owner decision for provider/policy/entitlement or consequential logic | A user subscribes in simulated mode, sees the plan change, and sees an invoice. |
| F-17 | Admin Console (Governance) | 10 / Ph0 | F-01 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed beta | W0 / #1 | - | An admin suspends a test user, the user is blocked, and the audit log shows the action. |
| F-18 | Chrome Extension Companion (Edge) | 5 / Ph2 | F-01 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #79 | - | Installed extension shows the user's name after sign-in and can open the dashboard. |
| F-19 | Product Analytics (Telemetry) | 7 / Ph1 | F-01 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #32 | - | After applying to a job, the KPI screen counts one more application. |
| F-20 | Command Search (⌘K) (Shell) | 7 / Ph2 | F-01 | Impl-unverified (Implemented) | Partial / Ephemeral | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-21 | Error Recovery & Resilience (Shell) | 10 / Ph0 | F-01 | Partial (Partial) | Full / Durable | P1 / Proposed beta | W0 / #2 | - | Turning the API off shows a retry message on each page, and retry works when it comes back. |
| F-22 | Gamification & XP Ledger (Engagement) | 8 / Ph1 | F-07, F-08 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #16 | - | Completing a tracked action raises the XP shown on the dashboard. |
| F-23 | Leaderboard & Badges (Engagement) | 7 / Ph2 | F-22 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #34 | - | A user with XP appears on the leaderboard and sees their badges. |
| F-24 | Trust, Safety & Moderation (Safety) | 8 / Ph2 | F-01 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed beta | W0 / #17 | - | A report filed in the UI appears in the admin queue and can be resolved. |
| F-25 | Job Detail View (Marketplace) | 7 / Ph2 | F-04 | Impl-unverified (Implemented) | Full / Durable | P1 / Proposed beta | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-26 | Portfolio Showcase (Identity) | 8 / Ph1 | F-12 | Partial (Implemented) | Partial / Ephemeral | P1 / Proposed GA | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-27 | Local Resume Match Preview (Edge) | 6 / Ph2 | F-18 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #125 | - | On a job page, the extension shows a match score and the matching skills. |
| F-28 | External Job Page Scanner (Edge) | 6 / Ph2 | F-18 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #126 | - | On a job posting page, the extension shows a "save to TalentSphere" button that creates a saved job. |
| F-29 | Scheduled Notification Digest (Communication) | 7 / Ph2 | F-14 | Partial (Partial) | Full / Durable | P2 / Expansion; unscheduled | W0 / #35 | - | A test user receives one digest email at the chosen frequency. |
| F-30 | Networking Stale-Request Nudges (Engagement) | 6 / Ph2 | F-09 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #63 | - | A request left pending for the set time creates one nudge notification. |
| F-31 | KPI Aggregation & Rollups (Analytics) | 6 / Ph2 | F-19 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #53 | - | The KPI screen shows yesterday's counts, equal to a manual count of the events. |
| F-32 | Saved Searches & Job Alerts (Candidate) | 7 / Ph2 | F-04 | Partial (Partial) | Full / Durable | P1 / Proposed beta | W0 / #36 | - | A candidate saves a search, a matching job is published, and an alert appears. |
| F-33 | Video Interview Rooms (Communication) | 8 / Ph3 | F-10 | Partial (Partial) | Partial / Ephemeral | P2 / Decision gate | W0 / #18 | Owner decision for provider/policy/entitlement or consequential logic | Both parties join a test session and the consent is recorded. |
| F-34 | Multi-Entity Backend Search (Platform) | 7 / Ph2 | F-04, F-07 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #37 | - | Typing a job title in the palette shows matching jobs. |
| F-35 | Feature Flag Console (Administration) | 6 / Ph2 | F-17 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed beta | W0 / #54 | - | An admin turns a flag on, the flag changes for the next request, and the audit log records it. |
| F-36 | Application Draft Autosave (Candidate) | 7 / Ph1 | F-04 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #33 | - | A candidate types a note, reloads, and the note is still there. |
| F-37 | Job Templates (Recruiting) | 6 / Ph2 | F-05 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #55 | - | A recruiter creates a job from a saved template. |
| F-38 | Legacy Chat Service (DEPRECATED) (Communication) | 0 / – | – | Excluded (Deprecated) | Stub/Mock / N/A | N/A / Excluded | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-39 | Unified Backend Stub (DEPRECATED) (Platform) | 0 / – | – | Excluded (Deprecated) | Stub/Mock / N/A | N/A / Excluded | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-40 | Institutional Managed Learning (Institutions) | 8 / Ph3 | F-01, F-07 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #19 | - | An institution admin enrols two members in a course and both see it. |
| F-41 | Procurement & Seat Licensing (Institutions) | 6 / Ph6 | F-40, F-16 | Not impl (Not started) | Partial / Stateless | P3 / Expansion; unscheduled | W0 / #67 | - | An institution with 10 seats can assign 10 members and not an eleventh. |
| F-42 | Provider-Agnostic Media Engine (Platform) | 8 / Ph2 | F-07 | Not impl (Not started) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #27 | - | A course video uploads, plays back, and is stored outside the API process. |
| F-43 | B2B2C Graduation Flywheel (Institutions) | 6 / Ph3 | F-40 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #64 | - | A learner who finishes a course sees a single invitation to create a profile. |
| F-44 | AI Media Enrichment (Learning) | 6 / Ph4 | F-42, F-11 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W1 / #128 | - | An uploaded course video gets a caption file and a summary a learner can read. |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) (Learning) | 4 / Ph10 | F-40, F-115 | Partial (Partial) | Stub/Mock / Ephemeral | P2 / Decision gate | W1 / #140 | Owner decision for provider/policy/entitlement or consequential logic | Owner picks a vendor; a test session records a proctoring session ID returned by the vendor. |
| F-46 | Institutional Analytics (Institutions) | 6 / Ph3 | F-40 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #65 | - | An institution admin sees completion rate for one course, matching the database. |
| F-47 | Faculty Dashboard (Institutions) | 6 / Ph3 | F-40 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #66 | - | A faculty user sees their course list with student counts. |
| F-48 | OS Shell & Workbench (OS) | 4 / Ph2+ | F-01, F-03 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #93 | - | A user saves a two-panel layout and sees it again after sign-in. |
| F-49 | Automation & Agents (OS) | 4 / Ph3+ | F-48 | Not impl (Not started) | Partial / Durable | P3 / Expansion; unscheduled | W1 / #141 | - | A user schedules a weekly saved search and gets a summary; nothing is sent without approval. |
| F-50 | Institutional Course Marketplace (Institutions) | 6 / Ph3 | F-40, F-42 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W1 / #127 | - | An institution lists a course, another institution buys seats for it. |
| F-51 | Media Health Monitoring (Platform) | 6 / Ph4 | F-42 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #129 | - | A broken video creates an alert for the course owner within one hour. |
| F-52 | Certificate Verification (Verification) | 8 / Ph3 | F-07 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed beta | W0 / #20 | - | Opening a valid certificate link shows "valid" without signing in. |
| F-53 | Professional Social Graph & Feed (Networking) | 5 / Ph8 | F-12 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #83 | - | A user posts a text update and their connections see it in the feed. |
| F-54 | Content Publishing (Networking) | 5 / Ph8 | F-12 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #84 | - | A member publishes a post and it appears on their profile and in connections' feeds. |
| F-55 | Groups & Communities (Community) | 5 / Ph8 | F-53 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W1 / #136 | - | A user joins a group and sees its members and a message thread. |
| F-56 | Organization & Institution Pages (Recruiting) | 5 / Ph8 | F-12, F-40 | Partial (Partial) | Full / Durable | P1 / Proposed beta | W0 / #76 | - | Opening /organizations/:id without signing in shows the company's open jobs. |
| F-57 | Events & Webinars (Community) | 5 / Ph8 | F-53 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #137 | - | A user signs up for an event and gets a reminder notification. |
| F-58 | Written Recommendations (Networking) | 6 / Ph8 | F-53 | Not impl (Not started) | Full / Durable | P3 / Expansion; unscheduled | W1 / #133 | - | A colleague writes a recommendation and it shows on the candidate's profile after they accept it. |
| F-59 | Outreach Credits (TalentMail) (Recruiting) | 5 / Ph8 | F-10 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #85 | - | A recruiter with zero credits cannot send outreach; after a top-up, one message uses one credit. |
| F-60 | Profile Views & Privacy Controls (Networking) | 6 / Ph8 | F-12 | Partial (Partial) | Full / Durable | P1 / Proposed beta | W0 / #61 | - | A visitor views a profile, and the owner sees one more view. |
| F-61 | Premium Candidate Tier (OD-34 gated) (Business) | 4 / Ph10+ | F-60 | Partial (Partial) | Stub/Mock / N/A | P2 / Decision gate | W0 / #92 | Owner decision for provider/policy/entitlement or consequential logic | A free user is blocked from the gated feature with an upgrade message; a paid test user is not. |
| F-62 | Sponsored Content (NOT RECOMMENDED) (Business) | 0 / Ph10+ | – | Excluded (Not recommended) | Stub/Mock / N/A | N/A / Excluded | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-63 | Business-Development Graph (NOT RECOMMENDED) (Intelligence) | 0 / Ph10+ | – | Excluded (Not recommended) | Stub/Mock / N/A | N/A / Excluded | - | - | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-64 | LinkedIn Migration Engine (Integration) | 5 / Ph1/2 | F-12 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #89 | - | Uploading a LinkedIn export creates the work history entries in the profile. |
| F-65 | LinkedIn Decoupling & Independence (Foundation) | 8 / Ph1/2 | F-64 | Not impl (Not started) | Full / Durable | P2 / Expansion; unscheduled | W1 / #121 | - | A user with an imported profile signs in without LinkedIn and sees the same data. |
| F-66 | Course Creation Studio (Learning) | 8 / Ph7 | F-07, F-42 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W1 / #119 | - | An instructor creates a course with two lessons in the UI and publishes it. |
| F-67 | Categories, Discovery & Comparison (Learning) | 6 / Ph7 | F-07, F-145 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W1 / #124 | - | A learner filters by category and compares two courses. |
| F-68 | Quizzes, Practice Tests & Final Exams (Learning) | 8 / Ph7 | F-07 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #25 | - | A learner answers a quiz and sees a stored score. |
| F-69 | Assignments & Peer Review (Learning) | 8 / Ph7 | F-07 | Not impl (Not started) | Missing / N/A | P2 / Expansion; unscheduled | W0 / #28 | - | A learner submits an assignment and receives two peer reviews. |
| F-70 | Learning Paths, Programs & Specializations (Learning) | 8 / Ph7 | F-07, F-66 | Not impl (Not started) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #29 | - | A learner enrols in a path of three courses and sees progress across all three. |
| F-71 | Course Q&A, Discussions, Notes (Learning) | 6 / Ph7 | F-07 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #68 | - | A learner asks a question on a lesson and sees the answer; their note stays private. |
| F-72 | Course Reviews & Ratings (Learning) | 6 / Ph7 | F-07 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #69 | - | A learner rates a completed course and the rating shows on the course. |
| F-73 | Course Commerce (Learning) | 6 / Ph7 | F-07, F-16 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #70 | - | A learner buys a course in sandbox payment mode and gets access. |
| F-74 | Instructor Platform (Learning) | 6 / Ph7 | F-07, F-66 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #59 | - | An instructor sees the count of enrolments and the average rating for their course. |
| F-75 | Employer Insights (Intelligence) | 7 / Ph9 | F-12, F-56 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #51 | - | A recruiter sees time-to-hire for the company's last closed job. |
| F-76 | Coding Contests & Live Leaderboards (Assessment) | 5 / Ph9 | F-08 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #87 | - | Two test users enter a contest and the leaderboard updates after each submission. |
| F-77 | Skill Certification Exams (Assessment) | 8 / Ph3 | F-08 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #21 | - | A candidate passes a test exam and a certificate appears in their profile. |
| F-78 | Practice Sets & Interview Prep (Learning) | 5 / Ph9 | F-08 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #88 | - | A candidate completes a practice set and sees a score per question. |
| F-79 | Articles & Newsletters (Networking) | 5 / Ph8 | F-54 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #138 | - | A subscriber receives an email when an author publishes an article. |
| F-80 | Profile Enhancements (Profile) | 6 / Ph1/Ph8 | F-12 | Partial (Partial) | Full / Durable | P3 / Expansion; unscheduled | W0 / #62 | - | A candidate adds one language and one education entry, and both show on the profile. |
| F-81 | Identity Verification (Verification) | 3 / Ph9 | F-12 | Partial (Partial) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #106 | - | An applicant completes a document check and sees a verified badge on the profile. |
| F-82 | Student Learning Analytics (Analytics) | 6 / Ph7 | F-07 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #60 | - | An instructor sees each student's lesson completion for their course. |
| F-83 | Admin Platform Expansion (Administration) | 3 / Ph8 | F-17 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #105 | - | An admin opens the organisation list and sees each organisation's status. |
| F-84 | Skills Graph & Taxonomy (Platform) | 10 / Ph1–2 | F-12, F-07, F-08 | Partial (Partial) | Full / Durable | P1 / Proposed beta | W0 / #4 | - | A candidate sees related skills on their profile. |
| F-85 | Career Graph & Progression (Intelligence) | 9 / Ph3 | F-12, F-04, F-06, F-84 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed GA | W0 / #8 | - | A candidate sees one suggested transition with its probability. |
| F-86 | Salary Intelligence (Intelligence) | 9 / Ph3 | F-04, F-06, F-56 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #9 | - | A candidate searches a role and sees a benchmark, or a clear "not enough data" message. |
| F-87 | Interview Experience Repository (Candidate) | 7 / Ph4 | F-04, F-56, F-88 | Partial (Partial) | Missing / N/A | P2 / Expansion; unscheduled | W0 / #40 | - | A candidate searches a company and sees posted interview experiences. |
| F-88 | Technical Interview Platform (Hiring) | 9 / Ph3 | F-08, F-33, F-06 | Partial (Partial) | Partial / Ephemeral | P2 / Decision gate | W0 / #10 | Owner decision for provider/policy/entitlement or consequential logic | An interviewer and a candidate join a test session, submit code, and the interviewer saves a scorecard. |
| F-89 | Contribution Verification System (Verification) | 5 / Ph8 | F-26, F-12 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #77 | - | A contribution with a verified link adds to the activity score; an unverified one does not. |
| F-90 | Peer Mentorship & Advisor Network (Community) | 5 / Ph4 | F-12, F-10, F-55 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #72 | - | A mentee requests a mentor, the mentor accepts, and both see the session. |
| F-91 | Career Readiness Assessment (Career) | 9 / Ph2 | F-84, F-08, F-12 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed GA | W0 / #7 | - | A candidate picks a target role and sees a readiness score with the missing milestones. |
| F-92 | Advanced Recruiter Search (Recruiting) | 9 / Ph3 | F-12, F-34, F-08, F-96 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #11 | - | A recruiter filters candidates by a skill and verified work history and sees matching results. |
| F-93 | Interview Video Recording & AI Feedback (Hiring) | 7 / Ph4 | F-33, F-06, F-88 | Partial (Partial) | Partial / Ephemeral | P2 / Decision gate | W0 / #41 | Owner decision for provider/policy/entitlement or consequential logic | A candidate records one answer and sees a transcript and feedback. |
| F-94 | Verified Work History & References (Verification) | 7 / Ph3 | F-12, F-58 | Partial (Implemented) | Full / Durable | P0 / Proposed beta | - | Email provider configuration and live delivery evidence | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-95 | Career Transition Planning (Career) | 7 / Ph4 | F-84, F-91, F-07 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed GA | W0 / #42 | - | A candidate sees one transition with its ordered steps. |
| F-96 | Skill Evidence & Digital Credentials (Verification) | 10 / Ph2 | F-12, F-26 | Partial (Partial) | Full / Durable | P1 / Proposed beta | W0 / #3 | - | A certificate issued to a candidate shows on their profile with a working verification link. |
| F-97 | Real-Time Job Market Analytics (Intelligence) | 5 / Ph4 | F-04, F-06 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #73 | - | A candidate searches a skill and sees a demand chart for the last 90 days. |
| F-98 | Employer Equity & Compensation Intelligence (Intelligence) | 7 / Ph3 | F-56, F-86 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #38 | - | A candidate opens a company and sees a pay range or "not enough data". |
| F-99 | AI Career Coach (Enhanced) (AI) | 7 / Ph4 | F-12, F-84, F-91, F-07 | Partial (Partial) | Partial / Ephemeral | P2 / Decision gate | W0 / #43 | Owner decision for provider/policy/entitlement or consequential logic | A candidate sets a goal, gets a three-step plan, and the plan is still there next visit. |
| F-100 | Peer Project Collaboration (Learning) | 4 / Ph5 | F-07, F-69, F-10 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #142 | - | Two members share a project, add a task, and both see it. |
| F-101 | Badge Marketplace & Recognition (Gamification) | 4 / Ph8 | F-23, F-26 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #90 | - | A member lists a badge for claim and another member claims it. |
| F-102 | Hiring Manager Portal (Recruiting) | 8 / Ph3 | F-06, F-88 | Partial (Partial) | Full / Durable | P2 / Expansion; unscheduled | W0 / #22 | - | A hiring manager sees each scorecard next to the applicant. |
| F-103 | Candidate Comparison & Rubric (Recruiting) | 6 / Ph3 | F-06, F-92 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #56 | - | A recruiter compares two applicants and sees each rubric score. |
| F-104 | Pre-Hire Assessment Customization (Hiring) | 7 / Ph3 | F-06, F-08, F-88 | Not impl (Not started) | Missing / N/A | P2 / Expansion; unscheduled | W0 / #52 | - | A recruiter adds two questions and a 30-minute limit to a job, and a candidate sees them. |
| F-105 | Post-Hire Analytics & ROI Tracking (Analytics) | 4 / Ph4 | F-102, F-93 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #94 | - | A recruiter sees retention at 90 days for hires from each source. |
| F-106 | Skill Prerequisite Engine (Learning) | 7 / Ph5 | F-07, F-70, F-84 | Partial (Partial) | Partial / Durable | P1 / Proposed GA | W1 / #122 | - | A candidate opening a skill sees its prerequisites and which ones they already have. |
| F-107 | Live Q&A with Instructors (Learning) | 6 / Ph5 | F-07, F-71, F-10 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #131 | - | A learner joins a live Q&A and posts a question that the instructor can see. |
| F-108 | Expert Network Matching (Networking) | 4 / Ph7 | F-09, F-12, F-10 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #100 | - | A member asks for an expert in a skill and gets a list of two matches. |
| F-109 | Salary Negotiation Guidance (Career) | 5 / Ph8 | F-86, F-98 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #86 | - | A candidate enters an offer and sees a range compared with benchmarks. |
| F-110 | Verified Skill Endorsements (Verification) | 7 / Ph8 | F-96, F-12, F-58 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W2 / #148 | - | A user endorses a colleague's skill and the endorsement shows on the profile. |
| F-111 | Industry-Specific Learning Hubs (Learning) | 4 / Ph8 | F-07, F-55 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #102 | - | A learner opens the healthcare hub and sees its courses. |
| F-112 | Resume Parsing & Optimization (Candidate) | 6 / Ph8 | F-13, F-12 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #71 | - | Uploading a PDF resume fills at least the name, title and two roles into the profile. |
| F-113 | Recruiter Outreach Analytics (Recruiting) | 6 / Ph8 | F-59, F-06 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #134 | - | A recruiter sees the reply rate for a campaign of ten messages. |
| F-114 | Learning Impact Tracking (Analytics) | 9 / Ph4 | F-07, F-04, F-06 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #14 | - | A learner sees the outcome change for a course with at least 30 learners, or "not enough data". |
| F-115 | Certification Exam Platform (Assessment) | 9 / Ph3 | F-77, F-45 | Not impl (Not started) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #15 | - | A candidate books an exam slot and receives a certificate after passing. |
| F-116 | Accessibility & Inclusive Learning (Platform) | 7 / Ph8 | F-07, F-44 | Not impl (Not started) | Partial / Stateless | P2 / Expansion; unscheduled | W2 / #149 | - | A course shows a transcript for every video and can be finished with the keyboard only. |
| F-117 | Mobile-First Job Application (Candidate) | 5 / Ph8 | F-04, F-33 | Partial (Partial) | Full / Durable | P3 / Expansion; unscheduled | W0 / #78 | - | A candidate applies on a 390 px screen in three taps using saved answers. |
| F-118 | Emerging Skills Detection (Intelligence) | 4 / Ph8 | F-84 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #91 | - | The emerging skills list shows the top five skills with their growth percentage. |
| F-119 | Diversity & Inclusion Analytics (Hiring) | 4 / Ph8 | F-06 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #103 | - | A recruiter sees the pipeline split by stage for groups of at least 10 people, and smaller groups are hidden. |
| F-120 | API & Integration Platform (Platform) | 2 / Ph10 | F-01, F-34 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #116 | - | A developer creates an API key, lists jobs with it, and receives a webhook when a job is published. |
| F-121 | Warm Introduction Paths (Networking) | 8 / Ph4 | F-09, F-12, F-56, F-125 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #23 | - | A user requests an intro, the intermediary accepts, and both see the status. |
| F-122 | Application Feedback Loop (Jobs) | 9 / Ph3 | F-06, F-04 | Partial (Partial) | Partial / Ephemeral | P1 / Proposed GA | W0 / #12 | - | A recruiter sends feedback on a rejection and the candidate sees it on the application page. |
| F-123 | Skill Decay Tracking (Freshness Engine) (Verification) | 9 / Ph3 | F-84, F-96 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #13 | - | A candidate sees a skill marked "stale" after the set period and can refresh it. |
| F-124 | Project Marketplace (Learning) | 5 / Ph5 | F-07, F-26, F-100 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W2 / #150 | - | A company posts a project, a member applies, and the company accepts them. |
| F-125 | Alumni Networks (Networking) | 7 / Ph4 | F-12, F-09, F-40 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #44 | - | A graduate of an institution joins its alumni group and sees its members. |
| F-126 | Interview Prep Marketplace (Careers) | 5 / Ph4 | F-87, F-90, F-88 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #81 | - | A candidate books a paid mock interview with an expert in sandbox payment mode. |
| F-127 | Company Culture Assessment (Companies) | 4 / Ph5 | F-56, F-75 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #95 | - | An employee completes the survey and the company page shows a culture score once five responses exist. |
| F-128 | Offer Comparison Tool (Careers) | 7 / Ph4 | F-86, F-98, F-109 | Not impl (Not started) | Missing / N/A | P2 / Expansion; unscheduled | W1 / #123 | - | A candidate compares two offers and sees the totals side by side. |
| F-129 | Leadership Development (Learning) | 3 / Ph5 | F-07, F-84 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #108 | - | A candidate starts the leadership track and sees the first two goals. |
| F-130 | Freelance Marketplace (Jobs) | 3 / Ph7 | F-04, F-100, F-124 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W3 / #153 | - | A client posts a gig and a freelancer applies to it. |
| F-131 | Apprenticeship Matching (Jobs) | 3 / Ph6 | F-04, F-40 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #110 | - | A candidate with the listed skills sees the matching apprenticeship first. |
| F-132 | Scholarship Discovery (Learning) | 3 / Ph6 | F-40, F-07 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #111 | - | A learner filters scholarships by country and sees matching ones. |
| F-133 | Volunteer Matching (Community) | 2 / Ph7 | F-26, F-100 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W2 / #152 | - | A member filters volunteer roles by skill and applies to one. |
| F-134 | Code Review Practice (Skills) | 4 / Ph5 | F-08, F-26 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #96 | - | A member submits a review of a sample PR and sees a score against the expert review. |
| F-135 | System Design Practice (Skills) | 4 / Ph5 | F-88, F-08 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #97 | - | A candidate submits a design and gets a rubric score. |
| F-136 | Micro-Learning (Learning) | 2 / Ph4 | F-07, F-42 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #146 | - | A learner gets one lesson a day and marks it done. |
| F-137 | Spaced Repetition (Learning) | 2 / Ph6 | F-07, F-68 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #115 | - | A learner sees a card due tomorrow after answering one correctly today. |
| F-138 | Study Accountability Partners (Learning) | 3 / Ph6 | F-07, F-55 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #112 | - | Two learners are paired and each sees the other's weekly progress. |
| F-139 | Local Communities & Meetups (Networking) | 3 / Ph7 | F-09, F-55, F-57 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W2 / #151 | - | A member searches their city and sees meetups they can join. |
| F-140 | Affinity Groups (Community) | 3 / Ph7 | F-55, F-09 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #113 | - | A member joins an affinity group that requires an invitation, and is refused without one. |
| F-141 | Onboarding Preparation (Careers) | 1 / Ph8 | F-06, F-33 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #117 | - | A new hire sees a checklist of three tasks before their start date. |
| F-142 | Referral Request System (Jobs) | 8 / Ph4 | F-09, F-04 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #24 | - | A candidate asks a contact for a referral, and the contact sees and answers it. |
| F-143 | OSS Contribution Discovery (Portfolio) | 4 / Ph8 | F-89, F-26 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #104 | - | A member sees three matching open issues with their skills. |
| F-144 | Reputation Engine (multi-context) (Platform) | 9 / Ph2 | F-96, F-58, F-72 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W2 / #147 | - | A candidate sees their reputation score and the factors that make it up. |
| F-145 | Recommendation Engine Core (Platform) | 8 / Ph2–3 | F-84, F-144 | Not impl (Not started) | Partial / Ephemeral | P1 / Proposed GA | W0 / #30 | - | A candidate sees a ranked job list whose top results match their skills. |
| F-146 | Activity & Contribution Tracking (Platform) | 7 / Ph3 | F-123, F-84, F-144 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #39 | - | A candidate sees their activity history for the last 30 days on the profile. |
| F-147 | Unified Search & Discovery (Platform) | 8 / Ph2 | F-84, F-145 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W1 / #118 | - | Typing a company name in the header returns the company and its jobs. |
| F-148 | Instructor Reputation System (Reputation) | 8 / Ph7 | F-72, F-144 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W1 / #120 | - | An instructor's profile shows their average rating and review count. |
| F-149 | Employer Reputation & Brand System (Reputation) | 7 / Ph8 | F-75, F-56, F-144 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #49 | - | A company page shows its reputation band and review count. |
| F-150 | Peer Credibility Networks (Reputation) | 7 / Ph8 | F-110, F-144 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #50 | - | A candidate profile shows endorsement counts by weight. |
| F-151 | Skill Supply/Demand Forecasting (Intelligence) | 7 / Ph4 | F-84, F-86, F-97 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #45 | - | A candidate opens a skill and sees its forecast chart. |
| F-152 | Career Trajectory Analysis (Intelligence) | 7 / Ph4 | F-85, F-86, F-93 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #46 | - | A candidate sees their trajectory chart and a benchmark, or "not enough data". |
| F-153 | Learning Impact Dashboard (Enhanced) (Intelligence) | 7 / Ph4 | F-114, F-85, F-86 | Partial (Partial) | Partial / Ephemeral | P2 / Expansion; unscheduled | W0 / #47 | - | An instructor sees the outcome summary for their course. |
| F-154 | Interview Prediction & Benchmarking (Intelligence) | 6 / Ph4 | F-88, F-102, F-105 | Not impl (Not started) | Missing / N/A | P2 / Decision gate | W1 / #130 | Owner decision for provider/policy/entitlement or consequential logic | A recruiter sees a benchmark for a role only when enough interviews exist. |
| F-155 | Adaptive Learning System (Personalization) | 6 / Ph5 | F-07, F-84, F-145 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #132 | - | A learner who fails a quiz gets a review lesson next. |
| F-156 | Professional Development Plan System (Career) | 6 / Ph4–5 | F-91, F-95, F-145 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #135 | - | A candidate gets a three-goal plan with dates and can tick off tasks. |
| F-157 | Skills Co-Learning Path Optimizer (Learning) | 4 / Ph5 | F-84, F-114, F-07 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #98 | - | A learner gets a course order that covers their three largest skill gaps. |
| F-158 | Talent Pool Intelligence & Analytics (Recruiting) | 6 / Ph3 | F-92, F-84, F-144 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #57 | - | A recruiter opens a talent pool and sees its skill mix. |
| F-159 | Behavioral Talent Discovery (Discovery) | 6 / Ph4 | F-123, F-84, F-144 | Partial (Partial) | Partial / Ephemeral | P2 / Decision gate | W0 / #58 | Owner decision for provider/policy/entitlement or consequential logic | A recruiter runs discovery for a role and sees ranked candidates who opted in. |
| F-160 | Talent Segmentation & Classification (Analytics) | 5 / Ph4 | F-84, F-85, F-144 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #74 | - | A recruiter filters candidates by a segment and sees the count. |
| F-161 | Internal Mobility & Succession Platform (Enterprise) | 3 / Ph6–7 | F-84, F-91, F-132 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W1 / #145 | - | An employee sees an internal role that matches their skills and applies to it. |
| F-162 | Verified Work History Network & Graph (Verification) | 5 / Ph4 | F-94, F-84 | Partial (Implemented) | Full / Durable | P1 / Proposed beta | - | Email provider configuration and live delivery evidence | (generic: complete journey incl. denied/recovery cases survives restart) |
| F-163 | Credential Wallet & Portability (Credential) | 3 / Ph5 | F-96 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #109 | - | A candidate exports a file with their credentials and the file verifies. |
| F-164 | Skills Evidence Narrative & Storytelling (Credential) | 4 / Ph5 | F-96, F-26 | Not impl (Not started) | Partial / Durable | P3 / Expansion; unscheduled | W0 / #99 | - | A candidate gets a draft narrative and saves an edited version. |
| F-165 | Diversity, Equity & Inclusion Data System (Analytics) | 3 / Ph8 | F-119 | Not impl (Not started) | Missing / N/A | P2 / Decision gate | W1 / #144 | Owner decision for provider/policy/entitlement or consequential logic | A candidate can opt in and out, and the report shows only groups above the minimum size. |
| F-166 | Interview Performance Benchmarking (Analytics) | 5 / Ph4 | F-88, F-102 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #82 | - | An interviewer sees their average score next to the panel average. |
| F-167 | Candidate Comparison & Rubric (Enhanced) (Hiring) | 5 / Ph3 | F-88, F-103 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #80 | - | A recruiter compares four candidates with weighted rubric scores. |
| F-168 | Hiring Prediction & Success Modeling (Analytics) | 3 / Ph5 | F-88, F-105 | Not impl (Not started) | Missing / N/A | P2 / Decision gate | W1 / #143 | Owner decision for provider/policy/entitlement or consequential logic | A recruiter sees a success estimate only when enough past hires exist. |
| F-169 | Community Contribution Scoring & Recognition (Community) | 5 / Ph7 | F-55, F-144 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #75 | - | A member who mentors three people sees a recognition badge. |
| F-170 | Expert Network (Enhanced) (Community) | 4 / Ph7 | F-144, F-90 | Not impl (Not started) | Missing / N/A | P3 / Expansion; unscheduled | W0 / #101 | - | An expert's profile shows availability and endorsement count. |
| F-171 | Employer Brand Management System (Company) | 3 / Ph8 | F-56, F-75, F-149 | Not impl (Not started) | Partial / Ephemeral | P3 / Expansion; unscheduled | W0 / #114 | - | A company admin edits the about text and it shows on the public page. |
| F-172 | Advanced Compensation Intelligence (Analytics) | 4 / Ph8 | F-86, F-98, F-109 | Partial (Partial) | Partial / Ephemeral | P3 / Expansion; unscheduled | W1 / #139 | - | A recruiter opens a pay band for a role and location, with the sample size shown. |
| F-173 | Company-to-Skills Mapping (Intelligence) | 3 / Ph4 | F-84, F-04 | Not impl (Not started) | Full / Durable | P3 / Expansion; unscheduled | W0 / #107 | - | A candidate opens a company and sees its top five hiring skills. |
### 9.1 Feature intent statements (expected behavior as recorded in the audit ledger)

The ledger's `expectedBehavior` field is the most specific per-feature requirement sentence the earlier attempt kept. 155 features have a specific sentence (below); 18 features (02, 03, 04, 05, 06, 09, 10, 14, 15, 20, 25, 26, 38, 39, 62, 63, 94, 162) carry only the placeholder "according to canonical registry and SSOT section 9; detailed acceptance not independently enumerated", which means their intent lives in the earlier registry and SSOT (see section 10 for the 46 extracted contracts). Some sentences contain instructions to a builder ("Uses /courses/:id/modules ..."); the route names are the earlier attempt's and are kept as written.

| ID | Feature | Expected behavior (prior ledger) |
|---|---|---|
| F-01 | Authentication & Session | SSOT F-01: registration/account verification, login/restore/logout, reset, OAuth, role normalization and age/security gates |
| F-07 | Learning Management System | Lesson player: learners open a course, move through modules and lessons, mark lessons complete and see progress. Uses existing /courses/:id/modules, /modules/:id/lessons, /lessons/:id/complete, /courses/:id/progress. |
| F-08 | Challenges Arena | Connect the assessments page to real challenges: start a session, submit a solution, see a score. Remove the "preview, nothing scored" state for live challenges. Uses /challenges/:id/start-session and /submit. |
| F-11 | AI Career Assistant (Basic) | AI career assistant chat screen that calls /ai/career-assistant/chat and shows the free-tier usage meter from /ai/usage. |
| F-12 | Profile Management | SSOT F-12: complete professional record, skills/experience/education/certifications/portfolio, safe uploads, privacy and concurrent-edit behavior |
| F-13 | Resume Builder | Resume editor: edit sections (summary, roles, skills), pick a template, export. Uses /resumes and /resumes/:id/export. |
| F-16 | Billing & Subscriptions | Billing screens wired to /billing/subscribe, /billing/subscription, /billing/cancel and /billing/invoices, labelled "simulated" until a payment provider is chosen (see X-03). |
| F-17 | Admin Console | Admin console: user search, suspend or reactivate, role changes, audit log, health diagnostics, maintenance mode. Uses /admin/* routes. Only platform_admin can open it. |
| F-18 | Chrome Extension Companion | Chrome extension: a manifest-v3 extension that signs in with the user's session and reads the active tab. Needs a new apps/extension package and a secure token hand-off. Depends on F-01. |
| F-19 | Product Analytics | Analytics events are recorded from the main flows (sign-up, apply, publish). Admin KPI screen reads /analytics/kpis. |
| F-21 | Error Recovery & Resilience | Make errors recoverable everywhere: retry buttons on failed loads, a single error boundary per page, and clear messages for offline, timeout and server errors. |
| F-22 | Gamification & XP Ledger | XP and streaks shown on the dashboard, from /gamification/summary and /xp/ledger. |
| F-23 | Leaderboard & Badges | Leaderboard and badges screen, from /gamification/leaderboard and /gamification/badges. |
| F-24 | Trust, Safety & Moderation | Moderation: users can report content, admins see a queue (/moderation/reports), resolve, and users can appeal (/moderation/reports/:id/appeal). |
| F-27 | Local Resume Match Preview | Resume match preview in the extension: compare the user's resume skills with the job text on the page and show a match score. Needs F-18 and F-112 or a simple keyword match. |
| F-28 | External Job Page Scanner | External job page scanner: detect job postings on common job sites and offer to save them to TalentSphere. Needs F-18. |
| F-29 | Scheduled Notification Digest | Worker job that sends a digest email to users who chose a frequency. Needs X-02 (email provider). |
| F-30 | Networking Stale-Request Nudges | Worker job that nudges users about stale network requests (older than a set number of days), using notifications. |
| F-31 | KPI Aggregation & Rollups | KPI rollups: nightly worker job that aggregates analytics events into daily KPI tables, and an admin screen that reads them. |
| F-32 | Saved Searches & Job Alerts | Save a job search and get alerts: "Save this search" on the jobs page, list of saved searches, alerts from /jobs/saved-searches and /jobs/alerts. |
| F-33 | Video Interview Rooms | Interview room screen: join a scheduled session using /interviews/assessments/:id/join, after consent (/consent). |
| F-34 | Multi-Entity Backend Search | Connect the command palette and search box to /search, not only to navigation commands. |
| F-35 | Feature Flag Console | Feature flag console: admin screen to list, turn on and off flags via /admin/feature-flags, with an audit log entry for each change. |
| F-36 | Application Draft Autosave | Application draft autosave on the apply form, using /jobs/:jobId/draft and restore. |
| F-37 | Job Templates | Job templates on the hiring page: save a job as a template and create a new job from it (/job-templates). |
| F-40 | Institutional Managed Learning | Institutional managed learning: an institution account that enrols its members in courses, using the alumni institution records. Needs a UI to create the institution and invite members. |
| F-41 | Procurement & Seat Licensing | Seat licensing: an institution buys a number of seats and assigns them to members. Needs F-40 and X-03 for real billing. |
| F-42 | Provider-Agnostic Media Engine | Media engine: one interface for uploading and serving course media (video, images), with a storage provider behind it. No media code exists yet. |
| F-43 | B2B2C Graduation Flywheel | Graduation flywheel: when a learner finishes an institution course, prompt them to create a profile and join the candidate network. Needs F-40. |
| F-44 | AI Media Enrichment | AI media enrichment: generate captions and summaries for uploaded course media. Needs F-42 and F-11. Needs a model provider decision first. |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | Proctoring: connect a third-party proctoring vendor for timed assessments. Vendor choice is gated (OD-35). Today only fields exist. |
| F-46 | Institutional Analytics | Institutional analytics: completion, engagement and outcome charts per institution, built on F-40 and F-82. |
| F-47 | Faculty Dashboard | Faculty dashboard: a teacher view of their courses, students and assignment status. Needs F-40 and F-69. |
| F-48 | OS Shell & Workbench | OS shell and workbench: a configurable multi-panel workspace for power users. Large scope; start with a saved panel layout on the dashboard. |
| F-49 | Automation & Agents | Automation and agents: let a user schedule an agent task (for example, a weekly job search). Needs F-48 and a safe approval step for every outgoing action. |
| F-50 | Institutional Course Marketplace | Institutional course marketplace: institutions list and sell courses to other institutions. Needs F-40, F-42 and F-73. |
| F-51 | Media Health Monitoring | Media health monitoring: check uploaded media for broken or unplayable files and alert the owner. Needs F-42. |
| F-52 | Certificate Verification | Public certificate verification page at /verify/:hash, showing issuer and status, with no login. |
| F-53 | Professional Social Graph & Feed | Social graph and feed: a feed of posts from connections, built on the connections API. No feed route exists today. |
| F-54 | Content Publishing | Content publishing: members write and publish posts or articles, with draft and publish states. Needs F-53. |
| F-55 | Groups & Communities | Groups and communities: a group page with join, members and a discussion thread. Alumni groups exist in the API; add the UI and a general group type. |
| F-56 | Organization & Institution Pages | Public organisation page: a company page showing its name, open jobs and reputation summary, reachable without login. |
| F-57 | Events & Webinars | Events and webinars: create an event with a date and join link, list upcoming events and allow sign-up. Needs F-53 for visibility. |
| F-58 | Written Recommendations | Written recommendations: one member writes a recommendation for another, tied to a work-history entry. Needs F-53 and F-94. |
| F-59 | Outreach Credits (TalentMail) | Outreach credits (TalentMail): recruiters buy credits to send outreach messages. Needs F-10 and X-03 for payment. |
| F-60 | Profile Views & Privacy Controls | Profile views and privacy controls: count profile views, show them to the owner, and let the owner turn off view tracking. |
| F-61 | Premium Candidate Tier (OD-34 gated) | Premium candidate tier: gate one or two features (for example, extra AI assistant usage) behind the paid plan. Needs F-16 and X-03. |
| F-64 | LinkedIn Migration Engine | LinkedIn migration: import a LinkedIn data export (CSV or JSON) into the profile and work history. No migration code exists yet. |
| F-65 | LinkedIn Decoupling & Independence | LinkedIn decoupling: export all data and remove the dependency on LinkedIn login. Needs F-64. |
| F-66 | Course Creation Studio | Course creation studio: a UI for instructors to create a course, add modules and lessons, and publish. The API exists; the UI does not. |
| F-67 | Categories, Discovery & Comparison | Course categories and discovery: browse courses by category, compare two courses side by side. |
| F-68 | Quizzes, Practice Tests & Final Exams | Quiz lessons: a quiz lesson type that grades answers and stores the score. Needs F-07. |
| F-69 | Assignments & Peer Review | Assignments and peer review: an instructor sets an assignment; learners submit work and review two peers. No code exists yet. |
| F-70 | Learning Paths, Programs & Specializations | Learning paths and programs: an ordered set of courses with a completion goal. Needs F-66 for course authoring. Career pathways (F-85) are a separate feature. |
| F-71 | Course Q&A, Discussions, Notes | Course Q&A, discussions and notes: a question thread per lesson and private notes for the learner. Needs F-07. |
| F-72 | Course Reviews & Ratings | Course ratings and written reviews, reusing the instructor-review pattern. Needs F-07. |
| F-73 | Course Commerce | Course commerce: sell a course for money. Needs F-07, F-16 and X-03. |
| F-74 | Instructor Platform | Instructor platform: an instructor dashboard with course stats, reviews and earnings. Needs F-66 and F-72. |
| F-75 | Employer Insights | Employer insights: a company dashboard with hiring funnel and time-to-hire, from the reputation metrics API. |
| F-76 | Coding Contests & Live Leaderboards | Coding contests and live leaderboards: time-boxed contests with live scoring. Needs F-08 and a judge. |
| F-77 | Skill Certification Exams | Skill certification exams: a timed exam for a skill that issues a certificate on pass. Needs F-08 and F-115. |
| F-78 | Practice Sets & Interview Prep | Practice sets and interview prep: sets of practice questions by role, with answers and scoring. Needs F-08. |
| F-79 | Articles & Newsletters | Articles and newsletters: publish articles and let subscribers receive them by email. Needs F-54 and X-02. |
| F-80 | Profile Enhancements | Profile enhancements: add sections for languages, education and certifications to the profile form. |
| F-81 | Identity Verification | Identity verification: confirm the person is who they say, beyond work email. Needs a provider decision. Today only work-email checks exist. |
| F-82 | Student Learning Analytics | Student learning analytics: per-student progress and outcomes for instructors, built on F-07 and the learning impact API. |
| F-83 | Admin Platform Expansion | Admin platform expansion: add the remaining admin screens (organisations, challenges, billing overview) on the existing admin routes. |
| F-84 | Skills Graph & Taxonomy | Skills graph visible on the profile: skills and their links, from /skills/:id/graph and /skills/relationships. |
| F-85 | Career Graph & Progression | Career transitions screen: pathways and transition probability from /career/transitions and /career/pathways. |
| F-86 | Salary Intelligence | Salary benchmarks screen from /salaries/benchmarks, with the k-anonymity threshold shown. |
| F-87 | Interview Experience Repository | Interview experience repository: candidates post their interview experiences per company; search them. Needs F-04 and F-88 for the data. |
| F-88 | Technical Interview Platform | Technical interview platform: candidate and interviewer screens for scheduled sessions, with consent, a shared code pad and a scorecard. The API exists; the UI does not. |
| F-89 | Contribution Verification System | Contribution verification: verify a contribution (for example, a merged pull request) before it counts toward the activity score. |
| F-90 | Peer Mentorship & Advisor Network | Peer mentorship and advisors: match mentors and mentees and run a request and accept flow. The alumni mentorship API exists; add the UI. |
| F-91 | Career Readiness Assessment | Career readiness assessment: score a candidate's readiness for a target role using milestones and skills. The API exists; add a UI. |
| F-92 | Advanced Recruiter Search | Advanced recruiter search: search candidates by skill, location, work history and verification level. Uses the talent pools and search APIs. |
| F-93 | Interview Video Recording & AI Feedback | Interview video recording and AI feedback: record the answer, transcribe it, and show AI feedback. Needs F-33 and a media provider. |
| F-95 | Career Transition Planning | Career transition planning: show a candidate's suggested transitions with the steps to take, from the career transitions API. |
| F-96 | Skill Evidence & Digital Credentials | Digital credentials: show certificates and skill evidence on the profile, each with a verification link (the API exists). |
| F-97 | Real-Time Job Market Analytics | Real-time job market analytics: show demand trends for a skill or role, from the market signals API. |
| F-98 | Employer Equity & Compensation Intelligence | Employer compensation intelligence: company-level pay ranges, from the company salary API, with a minimum sample size shown. |
| F-99 | AI Career Coach (Enhanced) | AI career coach (enhanced): multi-turn coaching plans built on the career assistant, with saved goals. Needs F-11 first. |
| F-100 | Peer Project Collaboration | Peer project collaboration: two or more members work on one project with shared tasks and comments. Needs F-07, F-69 and F-10. |
| F-101 | Badge Marketplace & Recognition | Badge marketplace: members can offer and claim badges that others have earned. Badges API exists; the marketplace does not. |
| F-102 | Hiring Manager Portal | Hiring-manager view: scorecards and interview feedback on each applicant, from /interviews/assessments/:id/scorecards. |
| F-103 | Candidate Comparison & Rubric | Candidate comparison: side-by-side scorecards and rubric scores for shortlisted applicants. |
| F-104 | Pre-Hire Assessment Customization | Pre-hire assessment customisation: recruiters choose questions and time limits for each job's assessment. Needs F-06, F-08 and F-88. |
| F-105 | Post-Hire Analytics & ROI Tracking | Post-hire analytics and ROI: track new hires' ratings and retention against the hiring source. Needs F-102 and F-93. |
| F-106 | Skill Prerequisite Engine | Skill prerequisite engine: show which skills must be learned first, from the skill relationships API. |
| F-107 | Live Q&A with Instructors | Live Q&A with instructors: scheduled live sessions where learners ask questions. Needs F-07, F-71 and F-10 plus a live session provider. |
| F-108 | Expert Network Matching | Expert network matching: match a member with experts by skill and availability. Needs F-09, F-12 and F-10. |
| F-109 | Salary Negotiation Guidance | Salary negotiation guidance: give a candidate a suggested range and talking points for an offer, using salary benchmarks. |
| F-110 | Verified Skill Endorsements | Endorse a skill from a profile or work history entry, using /skills/endorsements. |
| F-111 | Industry-Specific Learning Hubs | Industry learning hubs: curated course and resource pages per industry. Needs F-07 and F-55. |
| F-112 | Resume Parsing & Optimization | Resume parsing and optimisation: parse an uploaded resume into the profile and suggest keyword improvements. Needs F-13 and F-12. |
| F-113 | Recruiter Outreach Analytics | Recruiter outreach analytics: reply and open rates per campaign, from the outreach messages. Needs F-59 and F-06. |
| F-114 | Learning Impact Tracking | Learning impact tracking: show how a course changed a learner's outcomes, from the learning impact API, with the minimum cohort size shown. |
| F-115 | Certification Exam Platform | Certification exam platform: schedule and proctor certification exams, then issue certificates. Needs F-77 and F-45. |
| F-116 | Accessibility & Inclusive Learning | Accessibility and inclusive learning: captions, transcripts, keyboard-only course navigation and an accessibility statement per course. Needs F-07 and F-44. |
| F-117 | Mobile-First Job Application | Mobile-first job application: a short apply flow that works on a phone, with saved answers. The responsive apply page exists; finish the steps and add saved answers. |
| F-118 | Emerging Skills Detection | Emerging skills detection: list skills with the fastest growth in demand, from the top-growth API. |
| F-119 | Diversity & Inclusion Analytics | Diversity and inclusion analytics: aggregate, anonymised diversity figures for a hiring pipeline, with a minimum group size. |
| F-120 | API & Integration Platform | API and integration platform: API keys per organisation, a documented public API subset, and webhooks for job events. |
| F-121 | Warm Introduction Paths | Warm introductions UI on the network page: ask a mutual connection for an intro and respond (/networking/warm-intros/*). |
| F-122 | Application Feedback Loop | Application feedback loop: a recruiter sends structured feedback on a rejected application and the candidate sees it. The API exists; add the UI on both sides. |
| F-123 | Skill Decay Tracking (Freshness Engine) | Skill decay tracking: show each skill's freshness and prompt the candidate to refresh old skills, from the freshness API. |
| F-124 | Project Marketplace | Project marketplace: post a paid project, let members apply, and pick one. Needs F-07, F-26 and F-100. |
| F-125 | Alumni Networks | Alumni networks: the alumni directory and groups for each institution, with a join flow. The API exists; add the UI. |
| F-126 | Interview Prep Marketplace | Interview prep marketplace: experts sell interview practice sessions. Needs F-87, F-90 and F-88 plus payments. |
| F-127 | Company Culture Assessment | Company culture assessment: a short culture survey for employees and candidates, with results per company. Needs F-56 and F-75. |
| F-128 | Offer Comparison Tool | Offer comparison tool: compare two or three job offers side by side (pay, benefits, location). Not built: the memory file wrongly lists it as verified. |
| F-129 | Leadership Development | Leadership development: a leadership track with skills, goals and manager feedback. Needs F-07 and F-84. |
| F-130 | Freelance Marketplace | Freelance marketplace: post and find short freelance gigs with payment. Not built: only the freelance employment type exists, and the memory file wrongly lists it as verified. |
| F-131 | Apprenticeship Matching | Apprenticeship matching: list apprenticeships and match them to candidates by skill. No code exists yet. |
| F-132 | Scholarship Discovery | Scholarship discovery: list scholarships and match them to learners. Not built: the memory file wrongly lists it as verified. |
| F-133 | Volunteer Matching | Volunteer matching: list volunteer roles and match them to members. Not built: the memory file wrongly lists it as verified. |
| F-134 | Code Review Practice | Code review practice: members review a sample pull request and compare with an expert review. Needs F-08 and F-26. |
| F-135 | System Design Practice | System design practice: a timed design exercise with a diagram and a rubric score. Needs F-88 and F-08. |
| F-136 | Micro-Learning | Micro-learning: five-minute lessons delivered daily. Needs F-07 and F-42 for media. |
| F-137 | Spaced Repetition | Spaced repetition: review cards at growing intervals for things learned. Needs F-07 and F-68. |
| F-138 | Study Accountability Partners | Study accountability partners: pair two learners on the same course and show each other's progress. Needs F-07 and F-55. |
| F-139 | Local Communities & Meetups | Local communities and meetups: find and join meetups near the user. Needs F-57 and location data. |
| F-140 | Affinity Groups | Affinity groups: groups for a shared background or interest, with membership rules. Needs F-55 and F-09. |
| F-141 | Onboarding Preparation | Onboarding preparation: a pre-start plan for a new hire with tasks and reading, from a hiring outcome. Needs F-06 and F-33. |
| F-142 | Referral Request System | Referral requests UI on the network page (/referrals/requests and respond). |
| F-143 | OSS Contribution Discovery | OSS contribution discovery: list open-source issues that match a member's skills. No code exists yet. |
| F-144 | Reputation Engine (multi-context) | Reputation engine UI: show the reputation score breakdown on the profile and explain each factor. The API exists; add the UI. |
| F-145 | Recommendation Engine Core | Recommendation engine core: rank jobs, people and courses for each user. Not built: the memory file wrongly lists it as verified; the only "recommendation" fields are interview hire decisions. |
| F-146 | Activity & Contribution Tracking | Activity and contribution tracking UI: show the activity score and history on the profile. The API exists. |
| F-147 | Unified Search & Discovery | Unified search and discovery: one search box across jobs, people, courses and companies, using the search API. |
| F-148 | Instructor Reputation System | Instructor reputation UI: show an instructor's reviews, metrics and endorsements on their profile. |
| F-149 | Employer Reputation & Brand System | Employer reputation and brand UI: show a company's reputation on its page. The API exists. |
| F-150 | Peer Credibility Networks | Peer credibility UI: show peer endorsements and their weight on a profile. The API exists. |
| F-151 | Skill Supply/Demand Forecasting | Skill supply and demand forecasting UI: show the forecast for a skill over the next year. The API exists. |
| F-152 | Career Trajectory Analysis | Career trajectory UI: show a candidate's trajectory and benchmarks against peers with at least 20 people. The API exists. |
| F-153 | Learning Impact Dashboard (Enhanced) | Learning impact dashboard UI: show course outcome summaries to instructors and admins. The API exists. |
| F-154 | Interview Prediction & Benchmarking | Interview prediction and benchmarking: predict the likelihood of success from past interview data, with a benchmark. Needs F-88 and a sufficient sample. |
| F-155 | Adaptive Learning System | Adaptive learning: change the next lesson based on the learner's quiz results. Needs F-07, F-84 and F-145. |
| F-156 | Professional Development Plan System | Professional development plan: a plan with goals, tasks and check-ins, built from readiness and transitions. Needs F-91, F-95 and F-145. |
| F-157 | Skills Co-Learning Path Optimizer | Skills co-learning path optimiser: suggest the order of courses that fills the most skill gaps. Needs F-84, F-114 and F-07. |
| F-158 | Talent Pool Intelligence & Analytics | Talent pool intelligence UI: show pool size, skill mix and pipeline health for each pool. The API exists. |
| F-159 | Behavioral Talent Discovery | Behavioural talent discovery UI: show recruiters the discovery results for a role. The API exists; add a screen and the consent check. |
| F-160 | Talent Segmentation & Classification | Talent segmentation UI: show candidate segments and let a recruiter filter by segment. The API exists. |
| F-161 | Internal Mobility & Succession Platform | Internal mobility and succession: employees see roles in their company and managers name successors. Needs F-84, F-91 and F-132 (not built). |
| F-163 | Credential Wallet & Portability | Credential wallet and portability: export all certificates and credentials in one signed file. Needs F-96. |
| F-164 | Skills Evidence Narrative & Storytelling | Skills evidence narrative: generate a short written story of a candidate's evidence, which the candidate can edit. Needs F-96 and F-26. |
| F-165 | Diversity, Equity & Inclusion Data System | DEI data system: collect opt-in diversity data with a privacy notice and report it in aggregate. Needs F-119. |
| F-166 | Interview Performance Benchmarking | Interview performance benchmarking: compare an interviewer's scores with the panel average. Needs F-88 and F-102. |
| F-167 | Candidate Comparison & Rubric (Enhanced) | Candidate comparison and rubric (enhanced): side-by-side rubric scores for more than two candidates, with weights. Needs F-88 and F-103. |
| F-168 | Hiring Prediction & Success Modeling | Hiring prediction and success modelling: estimate the chance a hire succeeds from past outcomes. Needs F-88 and F-105 and a large sample. |
| F-169 | Community Contribution Scoring & Recognition | Community contribution scoring: score contributions to groups and mentoring, with a recognition badge. The API exists; add the UI. |
| F-170 | Expert Network (Enhanced) | Expert network (enhanced): expert profiles with availability, rates and verified endorsements. Needs F-144 and F-90. |
| F-171 | Employer Brand Management System | Employer brand management: a company edits its page, tracks reputation and responds to reviews. Needs F-56, F-75 and F-149. |
| F-172 | Advanced Compensation Intelligence | Compensation intelligence reports: pay bands by role and location, from the compensation reports API. The API exists; add a UI. |
| F-173 | Company-to-Skills Mapping | Company-to-skills mapping: list the skills each company hires for, from its job postings. Needs F-84 and F-04. |

## 10. Intended feature contracts extracted from the earlier SSOT (46 of 173 features)

The audit JSON (`features[].canonicalContract`) holds, for **46 features**, the actors, permissions, data dependencies, external dependencies, security requirements, rule references and acceptance bullets that the earlier attempt's SSOT stated for them (source file and line range given per row). Extracted by script from the JSON; whitespace-normalized only.

**Caveats the audit itself stated.** These are the *intended* contract of an earlier SSOT, not implementation evidence. Individual clauses and stale cross-references need reconciliation with founder amendments and the rule registry. Several clauses assume the earlier SSOT's stack (for example Supabase Auth, Edge Functions, Google and GitHub OAuth) which differs from what the earlier attempt built; the target may keep the outcome and change the mechanism. The extraction captured top-level numbered behavior and declared fields only; atomic semantic coverage was never certified, and the other 127 features had no extracted contract.

#### F-01 Authentication & Session
- Source: `SSOT.md` lines 617-700. Actors: Anonymous visitor, Candidate, Recruiter, Admin, Institution Admin. Permissions: Public: register/login/reset · Authenticated: logout/refresh/change password · Admin: revoke any session.
- Data dependencies (intended): `auth.users` (Supabase-managed), `profiles`, `user_settings`, `audit_logs`
- External dependencies (intended): Supabase Auth (GoTrue), Resend (transactional email), Google OAuth, GitHub OAuth
- Security requirements: HDN-008 (rate limits, lockout, jti denylist) · HDN-014 (TLS, no plaintext credentials) · MFA readiness (AUTH-008) · age gate (AUTH-017)
- Rule references: BR-001, BR-002, AUTH-001, SCI-04, HDN-008, HDN-014, AUTH-008, AUTH-017
- Acceptance (SSOT-extracted): Login p95 latency <300ms; 100% duplicate email rejection; 100% weak password rejection; Zero plaintext secrets in client bundle; Rate limits enforced at edge; Age gate blocks <16

#### F-04 Job Marketplace
- Source: `SSOT.md` lines 999-1077. Actors: Candidate, Recruiter, Org Admin. Permissions: Public read of published jobs · Authenticated apply · Recruiter/Admin post.
- Data dependencies (intended): `jobs`, `job_skills`, `organizations`, `job_applications`, `application_status_events`, `saved_jobs`, `saved_searches`, `job_alerts`, `job_views`, `job_fit`
- External dependencies (intended): not stated in extract
- Security requirements: RLS public read of published · Own-row for applications · Rate limit apply (5/hour/candidate) · Salary transparency enforced
- Rule references: BR-010, BR-011, BR-013, BR-015, BR-016, SCI-01, SCI-02
- Acceptance (SSOT-extracted): Search p95 <300ms for 100k jobs; Apply submission <500ms; Zero duplicate active applications; Salary transparency enforced (100%); Cursor pagination stable across pages

#### F-06 ATS / Candidate Pipeline
- Source: `SSOT.md` lines 1078-1112. Actors: Recruiter, Hiring Manager, Interviewer. Permissions: not stated in extract.
- Data dependencies (intended): `job_applications`, `application_status_events`, `scorecards`, `offers`, `interviews`, `application_drafts`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-017, BR-019, BR-020, BR-042, SCI-02, SCI-07
- Acceptance (SSOT-extracted): Kanban sync <200ms · 0 duplicate prevention failures · 0 cross-tenant access · audit 100%

#### F-07 Learning Management System
- Source: `SSOT.md` lines 1113-1172. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `courses`, `course_modules`, `course_enrollments`, `module_progress`, `content_items`, `media_sources`, `media_progress`, `certificates`, `quizzes`, `quiz_attempts`
- External dependencies (intended): not stated in extract
- Security requirements: RLS enrollment-gated lesson access · Time-limited media tokens · Certificate SHA-256 hash · Zero unauthorized content access
- Rule references: BR-048, BR-023, BR-021, BR-022, BR-046, BR-047, LMS-001, SCI-08, SCI-16, SCI-17, BR-114
- Acceptance (SSOT-extracted): Lesson completion <150ms · Certificate hash reproducible · Zero unauthorized content access · Video start <3s · Progress survives refresh/crash

#### F-08 Challenges Arena
- Source: `SSOT.md` lines 1173-1243. Actors: Candidate, Instructor, Employer. Permissions: not stated in extract.
- Data dependencies (intended): `challenges`, `challenge_submissions`, `challenge_test_cases`, `xp_transactions`
- External dependencies (intended): not stated in extract
- Security requirements: TD-05 sandbox (30s/512MB/1GB/no-network/seccomp) · Rate limit 10 sub/min/user · Hidden test cases RLS-protected · Zero code execution outside sandbox
- Rule references: CHALL-013, BR-024, BR-049, BR-050, BR-051, BR-052, BR-025, TD-05, CHALL-001, SCI-04
- Acceptance (SSOT-extracted): Submission → result <3s typical · 100% sandbox containment (no escape) · Deterministic scoring · No XP until pass confirmed · Rate limit enforced

#### F-12 Profile Management
- Source: `SSOT.md` lines 701-779. Actors: Candidate, Recruiter, Admin. Permissions: Own-row edit only. Admin can edit any. Public read of public-safe columns..
- Data dependencies (intended): `profiles`, `profile_skills`, `profile_experience`, `profile_education`, `profile_portfolios`, `profile_certifications`, `profile_media`, `career_signals`, `user_settings`
- External dependencies (intended): Supabase Storage, HaveIBeenPwned (password breach check), AI service (resume parsing)
- Security requirements: RLS own-row + public-safe view · Field-level encryption (phone_number, tax_id) · XSS sanitization on rich text · Upload pipeline
- Rule references: BR-005, BR-061, PROFILE-001
- Acceptance (SSOT-extracted): Profile save p95 <250ms; Public view never exposes PII columns; Completeness score 100% reproducible; Avatar upload succeeds for supported formats only; Concurrent edit returns 409 with clear message

#### F-13 Resume Builder
- Source: `SSOT.md` lines 1871-1876. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `resumes`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Resume generation <2s · PDF renders correctly · ATS parse-compatible

#### F-16 Billing & Subscriptions
- Source: `SSOT.md` lines 1877-1882. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `subscriptions`, `invoices`, `entitlements`, `payment_methods`, `billing_events`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Webhook idempotency 100% · entitlement enforcement server-side · zero double-billing

#### F-75 Employer Insights
- Source: `SSOT.md` lines 1883-1888. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `company_reviews`, `salary_reports`, `interview_experiences`, `interview_questions`, `company_responses`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-135
- Acceptance (SSOT-extracted): Acceptance: Salary aggregation k ≥5 · anonymity protection 100% · moderation SLA <24h

#### F-84 Skills Graph & Taxonomy
- Source: `SSOT.md` lines 780-884. Actors: Platform Admin (taxonomy curation), all users (read), recommendation engine (read), instructors (tag content). Permissions: Public read. Admin write. Instructor/Course Author can propose skill tags (subject to moderation)..
- Data dependencies (intended): `skills`, `skill_relationships`, `skill_market_signals`, `course_skills`, `challenge_skills`, `job_skills`, `profile_skills`, `portfolio_skills`
- External dependencies (intended): None required. Optional: licensed market data feed (OD-46).
- Security requirements: Public read of taxonomy · Admin-only writes · No PII in graph · RLS enforced on tagging tables · Rate limits on search API
- Rule references: BR-144, BR-141, BR-148, BR-142, BR-143, BR-145, BR-146, BR-147, SCI-35, SCI-45, SCI-46
- Acceptance (SSOT-extracted): Skill search p95 <100ms (cached); Traversal p95 <200ms for depth ≤3; 100% of course/challenge/job skill tags reference canonical skills; Zero cycles in `prerequisite_of` graph; Market signal updates daily (measure via scheduler); Typeahead returns relevant results for common typos; Unit: traversal algorithms, cycle detection, merge logic; Integration: CRUD, RLS on tagging tables, market signal computation; E2E: admin curates taxonomy → instructor tags course → learner typeahead shows skill

#### F-85 Career Graph & Progression
- Source: `SSOT.md` lines 1244-1286. Actors: Candidate (readiness), Recruiter (benchmarks), Analyst. Permissions: not stated in extract.
- Data dependencies (intended): `career_transitions`, `career_outcomes`, `progression_benchmarks`, `profiles`, `jobs`, `job_applications`, `offers`
- External dependencies (intended): not stated in extract
- Security requirements: Opt-in enforced · k-anonymity enforced · Individual data RLS-scoped · Aggregates public-safe
- Rule references: BR-160, BR-157, BR-163, SCI-36
- Acceptance (SSOT-extracted): Benchmark query <400ms · k-anonymity always enforced · opt-out removes data within 24h · Benchmarks only shown with ≥20 samples · Consent captured before any data collection

#### F-86 Salary Intelligence
- Source: `SSOT.md` lines 1287-1341. Actors: Candidate (research), Recruiter (offer calibration), Analyst. Permissions: not stated in extract.
- Data dependencies (intended): `salary_reports`, `salary_aggregates`, `compensation_benchmarks`, `equity_norms`
- External dependencies (intended): not stated in extract
- Security requirements: Strict anonymization · No PII in aggregates · k-anonymity enforced · Rate limit submissions
- Rule references: BR-178, BR-181, BR-177, BR-183, SCI-37
- Acceptance (SSOT-extracted): Aggregate query <400ms · minimum cohort/privacy threshold enforced by policy; k≥10 default for sensitive/public aggregates · No PII in aggregates · Outliers excluded from computation · Withdrawal effective within 24h

#### F-87 Interview Experience Repository
- Source: `SSOT.md` lines 1889-1893. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `interview_experiences`, `interview_questions`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Aggregation k ≥3 · moderation before display · zero interviewer PII

#### F-88 Technical Interview Platform
- Source: `SSOT.md` lines 1342-1400. Actors: Recruiter, Interviewer, Candidate. Permissions: not stated in extract.
- Data dependencies (intended): `interview_assessments`, `interview_recordings`, `interview_scores`, `interview_questions`, `assessment_templates`, `job_applications`, `interviews`
- External dependencies (intended): not stated in extract
- Security requirements: Room-scoped JWT tokens · Dual-consent for recording · Encryption at rest · Recording access audited · HDN-024 (peer-review fairness analog for interviews)
- Rule references: BR-169, BR-176, SCI-38, SCI-39, HDN-024, TD-05
- Acceptance (SSOT-extracted): Session join <3s · Code execution reuses TD-05 sandbox · Recording dual-consent enforced (100%) · AI feedback excludes protected attributes · Score append-only

#### F-91 Career Readiness Assessment
- Source: `SSOT.md` lines 1401-1439. Actors: Candidate. Permissions: not stated in extract.
- Data dependencies (intended): Derived from `profile_skills`, `profile_experience`, `profile_education`, `verified_credentials`, `course_enrollments`, `jobs`, `career_transitions`
- External dependencies (intended): not stated in extract
- Security requirements: Own-row only · AI computation transparent (factors shown) · No protected attributes in scoring
- Rule references: BR-163, BR-185, SCI-40
- Acceptance (SSOT-extracted): Readiness computed <500ms · Factors disclosed on every score · Zero protected attributes in model · Recalculation triggers within 60s of profile change

#### F-92 Advanced Recruiter Search
- Source: `SSOT.md` lines 1440-1474. Actors: Recruiter, Org Admin, Agency Recruiter. Permissions: not stated in extract.
- Data dependencies (intended): Derived from `profiles`, `profile_skills`, `verified_credentials`, `candidate_reputation`, `course_enrollments`, `challenge_submissions`
- External dependencies (intended): not stated in extract
- Security requirements: RLS org-scoped · Candidate privacy controls enforced · Zero stealth-mode leakage · Bulk operations audited
- Rule references: BR-064, SCI-41
- Acceptance (SSOT-extracted): Search p95 <500ms for 1M candidates · Zero stealth-mode leakage · Candidate consent revocation <24h · Bulk operations stable under load

#### F-93 Interview Video Recording & AI Feedback
- Source: `SSOT.md` lines 1894-1899. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `interview_recordings`, `interview_feedback`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-169, BR-176
- Acceptance (SSOT-extracted): Acceptance: Dual consent 100% · encryption at rest · retention ≤90d · no emotion analysis

#### F-94 Verified Work History & References
- Source: `SSOT.md` lines 1900-1904. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `verified_work_history`, `references`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Employment verification <7d · reference structured · zero resume fraud

#### F-95 Career Transition Planning
- Source: `SSOT.md` lines 1905-1910. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-84, F-85, F-91, F-07
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Plan generated <1s · progress tracked server-side

#### F-96 Skill Evidence & Digital Credentials
- Source: `SSOT.md` lines 885-996. Actors: Candidate (evidence contributor), Instructor/Peer (verifier), Recruiter (verifier), Employer (consumer). Permissions: User: issue (via achievement), view own, export. Public: verify via hash. Admin: revoke. Peer: endorse connected users..
- Data dependencies (intended): `verified_credentials`, `credential_evidence`, `endorsement_weights`, `profiles`, `xp_transactions`, `skill_endorsements`
- External dependencies (intended): not stated in extract
- Security requirements: SHA-256 hashing · Public verify endpoint rate-limited (60/min/IP) · No PII in verify response · RLS own-row for full credential list · Append-only enforcement at DB layer
- Rule references: BR-149, BR-156, BR-150, BR-151, BR-152, BR-153, BR-154, BR-155, SCI-42, SCI-17
- Acceptance (SSOT-extracted): Credential issuance <500ms; Public verify <200ms (cached); Zero PII exposure in public verify; 100% append-only enforcement (DB grants); Endorsement weight computation deterministic; Appeal resolved within 7 days SLA; Unit: hash generation, weight computation, appeal logic; Integration: issuance from each evidence source, revocation, RLS; E2E: complete course → credential issued → recruiter verifies

#### F-98 Employer Equity & Compensation Intelligence
- Source: `SSOT.md` lines 1911-1915. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `equity_norms`, `equity_reports`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-183
- Acceptance (SSOT-extracted): Acceptance: Separate from salary · aggregation k ≥5 · company-specific with ≥3 reports

#### F-99 AI Career Coach (Enhanced)
- Source: `SSOT.md` lines 1916-1920. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): not stated in extract
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Capability-specific evidence/quality gate · human review where required · no autonomous consequential action

#### F-102 Hiring Manager Portal
- Source: `SSOT.md` lines 1475-1503. Actors: Hiring Manager, Org Admin. Permissions: not stated in extract.
- Data dependencies (intended): `job_applications`, `scorecards`, `interviews`, `offers`, `interview_scores`, `career_outcomes`
- External dependencies (intended): not stated in extract
- Security requirements: RLS team-scoped · Aggregated team view only for HM · Org Admin sees all
- Rule references: 
- Acceptance (SSOT-extracted): Dashboard p95 <800ms · Scorecard queue accurate · Zero cross-team leakage

#### F-104 Pre-Hire Assessment Customization
- Source: `SSOT.md` lines 1921-1925. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `custom_assessments`, `custom_assessment_attempts`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Admin approval required · assessment results feed ATS

#### F-106 Skill Prerequisite Engine
- Source: `SSOT.md` lines 1926-1931. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-84
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-022
- Acceptance (SSOT-extracted): Acceptance: Prereq check <100ms · auto-unlock on completion

#### F-110 Verified Skill Endorsements
- Source: `SSOT.md` lines 1932-1937. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `skill_endorsements`, `endorsement_weights`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-131, BR-152
- Acceptance (SSOT-extracted): Acceptance: Endorsement weight deterministic · endorsement revocable within 30d

#### F-114 Learning Impact Tracking
- Source: `SSOT.md` lines 1504-1538. Actors: Platform Admin, Instructor, Analyst. Permissions: not stated in extract.
- Data dependencies (intended): `learning_outcomes`, `outcome_correlations`, `course_enrollments`, `module_progress`, `job_applications`, `offers`, `hires`, `career_outcomes`
- External dependencies (intended): not stated in extract
- Security requirements: Aggregate-only · k ≥30 threshold · RLS instructor-scoped
- Rule references: BR-190, BR-193, BR-189, SCI-43
- Acceptance (SSOT-extracted): Correlation job completes nightly · k ≥30 enforced · Instructor sees only own course data · All claims labelled correlational

#### F-115 Certification Exam Platform
- Source: `SSOT.md` lines 1539-1598. Actors: Candidate, Exam Administrator, Proctor (Phase 6). Permissions: not stated in extract.
- Data dependencies (intended): `skill_certifications`, `certification_attempts`, `questions`, `question_banks`, `assessment_attempts`
- External dependencies (intended): not stated in extract
- Security requirements: Answer keys encrypted · Never sent to client before grading · Server-authoritative timer · Per-attempt question randomization
- Rule references: BR-124, BR-140, SCI-32, SCI-44
- Acceptance (SSOT-extracted): Server-authoritative timer (±100ms) · Answer keys never in client payload · Auto-grading <500ms · Exam submission idempotent · Item analysis computed within 24h

#### F-116 Accessibility & Inclusive Learning
- Source: `SSOT.md` lines 1938-1941. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): not stated in extract
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: WCAG 2.2 AA conformance · axe 0 critical/serious

#### F-121 Warm Introduction Paths
- Source: `SSOT.md` lines 1793-1805. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `introduction_paths` (derived), `introduction_requests`, `introduction_consents`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-209, BR-216, SCI-47, SCI-48
- Acceptance (SSOT-extracted): Acceptance: Path p95 <500ms depth ≤3 · 0 unauthorized path exposure · introducer consent DB-enforced · rate limit 10/week · delivery <5s

#### F-122 Application Feedback Loop
- Source: `SSOT.md` lines 1599-1657. Actors: Candidate, Recruiter, Hiring Manager. Permissions: not stated in extract.
- Data dependencies (intended): `application_feedback`, `feedback_templates`, `feedback_requests`, `job_applications`, `application_status_events`
- External dependencies (intended): not stated in extract
- Security requirements: RLS own-row for candidates · Org-scoped for recruiters · Feedback immutable once delivered · Audit trail for all feedback
- Rule references: BR-217, BR-224, SCI-49, SCI-50
- Acceptance (SSOT-extracted): Feedback delivery within 7 days of decision (when provided) · Zero PII leakage in feedback · Aggregate insights k ≥10 always · Candidate can request feedback (30-day window enforced) · Recruiter feedback rate >60% (target metric)

#### F-123 Skill Decay Tracking (Freshness Engine)
- Source: `SSOT.md` lines 1658-1716. Actors: Candidate, Recruiter, Admin. Permissions: not stated in extract.
- Data dependencies (intended): `skill_freshness`, `reverification_prompts`, `skill_currency_scores`, `verified_credentials`, `skill_market_signals`
- External dependencies (intended): not stated in extract
- Security requirements: Own-row RLS for freshness data · Recruiter visibility gated by consent or application context
- Rule references: BR-225, BR-232, SCI-51, SCI-52
- Acceptance (SSOT-extracted): Freshness computed nightly for all verified skills · Decay curves validated against market data (quarterly review) · Re-verification restores freshness within 24h · Zero freshness leakage without consent · Market drift alerts accurate (measure false positive rate)

#### F-125 Alumni Networks
- Source: `SSOT.md` lines 1942-1946. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `alumni_affiliations`, `alumni_groups`, `alumni_group_members`, `alumni_hiring`, `alumni_mentorship`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Affiliation verified · cross-institution isolation 100% · discovery p95 <500ms

#### F-142 Referral Request System
- Source: `SSOT.md` lines 1806-1818. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `referral_requests`, `referral_outcomes`, `referral_rewards`, `job_applications`, `connections`, `xp_transactions`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-233, BR-240, SCI-53
- Acceptance (SSOT-extracted): Acceptance: Delivery <5s · 100% employment verification · rate limits enforced · attribution 12mo · anti-abuse active

#### F-144 Reputation Engine (multi-context)
- Source: `SSOT.md` lines 1717-1751. Actors: All authenticated users. Permissions: not stated in extract.
- Data dependencies (intended): `reputation_scores`, `reputation_signals`, `reputation_history`, `reputation_config`
- External dependencies (intended): not stated in extract
- Security requirements: RLS own-row + aggregate public
- Rule references: BR-247, BR-254, SCI-55
- Acceptance (SSOT-extracted): Reputation computation nightly · Deterministic weighting · Zero individual signal leakage · Recovery path functional

#### F-145 Recommendation Engine Core
- Source: `SSOT.md` lines 1752-1788. Actors: All authenticated users. Permissions: not stated in extract.
- Data dependencies (intended): `recommendation_signals`, `user_preferences`, `recommendation_history`
- External dependencies (intended): not stated in extract
- Security requirements: RLS-scoped · No protected attributes (FAIR-001)
- Rule references: BR-255, BR-262, SCI-56
- Acceptance (SSOT-extracted): Recommendation p95 <500ms · Confidence threshold enforced · Explanations always present · Diversity injection active

#### F-146 Activity & Contribution Tracking
- Source: `SSOT.md` lines 1819-1829. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `activity_events`, `contribution_scores`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Activity tracked real-time · engagement scores deterministic · contributions feed F-159 Behavioral Talent Discovery

#### F-147 Unified Search & Discovery
- Source: `SSOT.md` lines 1830-1842. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `search_index` (derived)
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-263, BR-268, SCI-57
- Acceptance (SSOT-extracted): Acceptance: Search p95 <300ms · 0 RLS leakage · autocomplete <100ms · typo tolerance active

#### F-148 Instructor Reputation System
- Source: `SSOT.md` lines 1843-1854. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `reputation_scores`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Instructor reputation computed nightly · transparent factor breakdown · no individual review manipulation

#### F-149 Employer Reputation & Brand System
- Source: `SSOT.md` lines 1947-1952. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `reputation_scores`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Multi-dimensional scoring · transparent factors

#### F-150 Peer Credibility Networks
- Source: `SSOT.md` lines 1855-1866. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `endorsement_weights`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Endorsement weight computation deterministic · network distance calculated correctly · zero gaming vectors

#### F-151 Skill Supply/Demand Forecasting
- Source: `SSOT.md` lines 1953-1958. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `skill_market_signals`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Forecast accuracy tracked · 12-month horizon · confidence intervals disclosed

#### F-152 Career Trajectory Analysis
- Source: `SSOT.md` lines 1959-1963. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-85
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Pattern detection statistically valid · k ≥20 per cell

#### F-153 Learning Impact Dashboard (Enhanced)
- Source: `SSOT.md` lines 1964-1968. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends F-114
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Correlation not causation · k ≥30 · all claims labelled

#### F-158 Talent Pool Intelligence & Analytics
- Source: `SSOT.md` lines 1969-1973. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-92
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Pool analytics computed on-demand · diversity metrics anonymized

#### F-159 Behavioral Talent Discovery
- Source: `SSOT.md` lines 1974-1980. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-146
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: 
- Acceptance (SSOT-extracted): Acceptance: Discovery based on real activity · no gaming vectors

## 11. Requirement conflicts and gaps the reports recorded (decisions the target must make)

### 11.1 Intent versus build (FEATURE_STATUS section D)

| Requirement source | Intended behavior | What the earlier attempt built | Conflict or gap | Resolution proposed there | Approval needed |
|---|---|---|---|---|---|
| SSOT amendments B; PRD section 8 | Full trusted career loop for GA | Durable job and evidence core; learning, assessment and career partial | A narrow job beta is not the full GA | Ratify a beta subset and keep full-loop GA gates | Product owner |
| SSOT D; BR-49 and BR-51; F-08 | Real assessment integrity | String-based simulated score; evidence unverified; UI disclaimer | `passed`/100 stayed misleading API output | Submission-only contract or an approved sandbox; never promote fake evidence | Trust policy for scoring |
| SSOT architecture; TRD section 2 | Supabase Auth and Queues, TanStack Query | HMAC and PBKDF2 auth, Postgres job table, React state and `fetch` | Intended and built architectures differ | Keep the implemented architecture; ratify ADR-015; no framework rewrite | Owner |
| SSOT F-01 and F-12 detail | Account verification, reset, OAuth, refresh-token cookies, age gate, complete professional record with uploads, education and certification editing, per-section visibility | Email and password sign-up, basic profile | Whole-feature "implemented" labels exceeded the evidence | Classify partial; approve included subfeatures and sequence missing outcomes | Product owner; security owner for auth changes |
| SSOT BR-001 versus registry BR-01 | Unambiguous requirement ids | SSOT calls BR-001 auth-required; the registry's BR-01 is recruiter or admin job-posting authority | The same normalized id has different meanings | Keep canonical registry identity; reconcile prose and test meaning before claiming coverage | Requirement owner |
| SSOT F-94 acceptance | Employment verification under seven days and zero resume fraud | Mailbox and token proof plus structured references | An absolute fraud claim is not verifiable | Bounded anti-fraud controls and measurable review outcome; do not promise zero fraud | Product and trust owner |
| F-94; old X-02 | Working verification delivery | A Resend adapter existed | The old plan wrongly asked to create a missing adapter | Configure and test the existing adapter, sender and alerts | Provider, cost, domain approval |
| F-32, F-35; old X-01 | Durable feature state | Saved searches, bookmarks, flags and settings already had SQL stores | The blanket claim "every partial feature is ephemeral" was false | Per-entity durability ledger and scoped migrations | Launch scope; schema changes |
| F-07, 17, 52, 84, 85, 91, 95, 96 | Reachable interfaces | Course, admin, verify, skills, career, credentials UI existed | Older status and APP_FLOW said absent | Updated evidence; keep partial and unverified | None (factual) |
| Settings and PRD privacy; issue "erasure" | Approved erasure lifecycle and recovery | Durable request and cancel, immediate core anonymization, no due scheduler | 30-day request versus immediate execution; cross-store completion can fail | Ratify policy; resumable cleanup; no legal-compliance claim | Privacy and legal owner |
| Root architecture; ADR-015 | Accurate current architecture | Resend, saved-search SQL, writer lease, heartbeat existed | Some passages said no providers, no deployment config, all other modules memory | The current audit erratum governs | None |
| Feature plan priority legend | Registry score 0 to 10 stays separate | The old plan converted scores 9 to 10 into P0 | Value confused with urgency | Separate columns; P0 only for evidenced release blockers | Owner ratifies release scope |
| F-45, F-61; SSOT E | Gated proctoring, premium tier, predictive hiring | Fields or stubs, or restricted implementations | API presence does not admit a capability to GA | Keep gates and exclusions | OD-35, OD-34, governance owner |
| PWA, TRD, accessibility targets | Offline layer and WCAG target | Manifest and runtime detection; no registered service worker | Installability does not prove offline or conformance | Offline work (X-04) only if scope requires it; manual accessibility checks | Scope and accessibility acceptance |
| F-94 dependency F-58; F-84, learning and assessment cycles | Traceable dependencies | Work-history verification existed without written recommendations | Registry edges are not necessarily hard blockers | Preserve ids and edges; distinguish product, technical and optional dependencies | Owner for canonical edits |

### 11.2 Requirement mismatches from the 2026-10-03 production audit (RM-01 to RM-08)

| ID | Documented requirement | Actual then | Class |
|---|---|---|---|
| RM-01 | Authentication and session: registration, verification, OAuth, password reset, persistent secure session | Email and password login plus an insecure demo fallback | Incorrect implementation |
| RM-02 | Profile management page with editing and skills | API and domain existed; no `/profile` route | Partial |
| RM-03 | Direct messaging in the browser | API and tests, no browser surface | Partial |
| RM-04 | Notification center | APIs without a route | Partial |
| RM-05 | `/settings` | Backend routes only | Partial |
| RM-06 | Subscription purchase reconciled with the provider, webhook-owned fulfillment | Server activated immediately; frontend could display success locally | Incorrect |
| RM-07 | Webhook signature, timestamp and replay protection | Idempotency only | Incorrect |
| RM-08 | Offline resilience and PWA direction | Manifest only; the e2e test acknowledged no offline support | Missing |

### 11.3 Journeys an end-user and business-owner audit expected (2026-10-03 matrix A to L)

| Journey | Expected | Finding then | Severity |
|---|---|---|---|
| A First-time onboarding | Landing, sign up, verify email, onboarding wizard, goal selection, skill baseline, profile setup | Landing to dashboard without authentication; no `/register`, `/verify-email`, `/forgot-password` | Critical |
| B Returning user | Persistent session, personalized dashboard, retained data | Identity from `localStorage`; state in maps; restart orphaned tokens | Critical |
| C Authentication | Registration, verification, OAuth, reset, session recovery | Backend registration and signed tokens existed; UI had login plus fake fallback only | Partial |
| D Contact management | A relationship-management experience built on contact records | Connection requests existed in the API; no browser experience | High (Missing) |
| E Birthday tracking | A dedicated capability | None found anywhere in apps, packages, database or tests | High (Missing) |
| F Notification flow | Center, delivery, preferences | APIs and a log-only worker; no UI | High |
| G AI message generation | Composer, edit, send workflow | A deterministic assistant endpoint, no composer | Incorrect or incomplete |
| H Message editing | Edit with version semantics | Not demonstrated | Medium or High (Missing) |
| I Message delivery | End-to-end delivery | Threads and deduplication by `clientMessageId` existed; delivery only logged | High |
| J Subscription flow | Select plan, provider authorization, webhook, reconciled entitlement | Local confirmation after a best-effort API call | Incorrect |
| K Settings flow | Settings, export, erasure in the UI | Backend only | High |
| L Error recovery | Failure, explain, preserve, retry, alternate path, confirm final state | API envelopes good (request ids, 401, 403, 404, 409, 429, 500); the frontend turned failure into success | Weak |

Also expected and missing then: onboarding wizard, goal creation, skill onboarding, application tracking UI, offline mode, and APIs without any browser surface (recruiter search, talent pools, application review, resumes, portfolio, networking, search, saved searches, billing, career intelligence, moderation, analytics, alumni, referrals, reputation, salary intelligence). Quick wins the auditor listed: remove the demo fallback; make UI success depend on API success; make pages data-driven; route guards; a real settings surface; the first messaging UI; remove unsupported compliance claims. The auditor's remediation order: Phase 0 stop pretending transactions succeeded; Phase 1 real persistence; Phase 2 real billing; Phase 3 the core candidate loop in the order Register, Verify, Onboard, Goal, Skills, Evidence, Profile, Jobs, Apply, Track; Phase 4 expose backend capabilities (profile, applications, messages, notifications, networking, resumes, portfolio, settings); Phase 5 real worker integrations (email, push, queue persistence, retries, dead-letter, delivery status); Phase 6 AI productization (entitlement, provider selection, generation, provenance, cost accounting, human review, action); Phase 7 observability and load testing (API p50, p95, p99, database latency, queue age, failed jobs, webhook lag, payment reconciliation delay, AI cost per user, activation, application conversion, retention).

### 11.4 Prior scorecard (for calibration only)

2026-10-03 production-readiness scorecard at commit `8db0930`: architecture 5, business readiness 2, feature completeness 4, UX 4, accessibility 8, security 2, performance 5, test coverage 7; mean 4.625, reported as **4.6 of 10, NOT READY**. Four independent same-day passes produced materially identical findings. Verdicts afterwards: 2026-10-14 "not production-ready; ready for a closed developer-run demonstration"; 2026-10-21 "not ready for public beta or GA"; 2026-10-22 "gated"; 2026-10-23 "NOT READY for production or a paid public launch".

## 12. Developer-tooling requirements recorded in the reports (non-product)

These are requirements for repository tooling, not for the product. Suggested home: `29_DEVELOPER_IMPLEMENTATION_GUIDE`. Kept here so they are not lost.

### 12.1 Universal clean-and-reinstall tool (Windows; `ORIGINAL_REQUEST.md` of 2026-10-22, quoted in MAINTENANCE_AUDIT)

- **R1 Discovery.** Scan recursively to a configurable `--max-depth` (default 5). Detect Node (npm, Yarn classic and berry, pnpm, Bun), Python (pip, poetry, pipenv, uv, venv or .venv), .NET (.sln, .csproj, .fsproj), Java (Maven pom.xml, Gradle, wrappers), PHP Composer, Ruby Bundler, Rust Cargo, Go, CMake or Make. Be workspace aware (pnpm-workspace.yaml, npm or yarn workspaces, Lerna, Turborepo, Nx, cargo workspaces): install only at the workspace root. Never traverse dependency or output directories (`node_modules`, `.venv`, `vendor`, `target`, `bin`, `obj`, `.next`) and reject symlinks or junctions that point outside the repository.
- **R2 Cleanup.** Remove build output, local dependency folders and temporary caches per technology. Never delete source, configuration (`.env*`, `.git`, IDE settings), manifests or lockfiles. Canonicalize every target and verify it is strictly inside the project root; forbid drive roots and system directories. Optional `--deep-clean` and `--clean-only`.
- **R3 Reinstall.** Deterministic installs from lockfiles (`pnpm install --frozen-lockfile`, `npm ci`, `yarn install --immutable`, `poetry install`, `uv sync`, `cargo fetch/build`, `dotnet restore`); prefer local wrappers (`mvnw`, `gradlew`); detect tools on PATH and warn and skip when absent; optional `--build`; `--install-only`.
- **R4 CLI.** A batch entry point forwarding all arguments to a PowerShell engine; flags `--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root`, `--exclude`, `--max-depth`, `--continue-on-error`, `--verbose`, `--help`; interactive confirmation when run without arguments; a structured timestamped log without secrets and a console summary with a non-zero exit code on errors.
- **Acceptance.** Polyglot structures identified with monorepo packages marked workspace-managed and no redundant installs; dependency folders ignored and escaping symlinks skipped; `--dry-run` prints exact paths and changes nothing; cleanup removes generated folders and preserves 100 percent of lockfiles, `.env`, `.git` and source; path canonicalization blocks deletion outside the root; frozen install commands match the detected manager; missing tools warn without stopping independent projects under `--continue-on-error`; a run summary and log with counts of discovered, cleaned, reinstalled and failed projects.
- **Prior test suite (38 cases, 4 tiers, all passed in about 77 seconds).** Tier 1 feature coverage TC-01 to TC-20 (entry point, parameter parsing and aliases, mutual exclusion, logging and secret redaction, path containment, depth scanning, traversal pruning, junction security, ecosystem detection for Node, Python, Rust, Java, .NET, workspace resolution, standard and deep cleanup, absolute guardrails, dry run, missing-tool detection, wrapper preference, frozen reinstall, post-install build); Tier 2 boundaries and attack vectors TC-21 to TC-28 (special characters in paths, non-interactive guard, complex secret patterns in URLs, AWS keys and JWTs, traversal escape, exact depth boundary, escaping junctions, mixed workspaces, read-only file attributes); Tier 3 pairwise interactions TC-29 to TC-33; Tier 4 realistic polyglot monorepo scenarios TC-34 to TC-38. A defect found and escalated: an empty scan result wrapped as a one-element array (`return ,$rawProjects`) made target paths resolve against the working directory.

### 12.2 Bash maintenance tool design (MAINTENANCE_AUDIT, 2026-10-21; deliverables were absent from the next checkout)

- Default execution mutates nothing; a plan with exact deletion targets and command arrays is shown, then a fresh explicit confirmation (the exact token `APPLY`; `EXPORT` for report export); empty input and end-of-input cancel; no `--yes` bypass.
- Discovery uses `find -P` with NUL delimiters, physical roots, no symlink traversal; workspace membership from configuration, never executing configuration modules; ambiguous output configuration is review-only; unsupported language families are reported, not guessed.
- Candidate classes: safe (configured TypeScript output, composite metadata, known test output), review-only (`graphify-out` cache, `supabase/.temp`, names like `build`, `cache`, `vendor` without a project-specific contract), prohibited (tracked files, `.audit`, browser evidence, vault, project memory, backups, env files, lockfiles, manifests, source, migrations, static assets, compose volumes).
- Safety: recheck root containment, ancestors, symlinks and provenance immediately before deletion; a repository-local lock; no eval or string-concatenated commands; no global cache purge; lifecycle scripts disabled during restore; no database writes, Docker cleanup or server termination; report files private (mode 600 temporary capture), no environment dump; exit codes 0 success or cancel, 1 partial failure, 2 invalid input, 3 fatal safety or prerequisite error, 130 interrupt, 143 termination.
- Tests: fixture repositories under the system temp directory, stub package managers, 74 assertions in the prior run (native symlink and Unix permission checks explicitly skipped on Windows rather than reported as passing).
- Existing repository script treatment (from the discovery table): installation was one frozen workspace-root restore (not ten installs) after enforcing the declared package-manager version and inspecting lifecycle scripts; builds are opt-in and compile shared packages before applications; type-check emits output and metadata, so it is write-producing, not read-only; offer the format check, never the format writer, as validation; tests that import built workspace packages need a rebuild after output cleanup; browser tests need built outputs, Chromium and free server ports (4000 and 4173); the real-database tests need an explicitly isolated test database, never one inferred from available credentials; migration, seed, release preflight, asset generation, the test server bootstrap, deployment files and backup and restore scripts are excluded from routine maintenance; compose volumes for database, proxy data and proxy config are never local cleanup targets; there was no separately named smoke script.
- Candidate artifacts then present: nine `dist` directories, nine incremental-build metadata files, ten `node_modules` (about 150 MB root), Playwright `test-results`; sizes are allocation readings, not reclaimable space, and must not be summed.

## 13. Requirement gaps the reports left open (X-00 scope)

- Of 248 business rules, none had semantic acceptance verified: 106 carried code or test annotation matches (a matching `BR-` comment is not proof of satisfaction), 142 had no reference. Exhaustive reduction of PRD, TRD and the SSOT subrequirements into atomic requirements was never done; only 46 of 173 features got an extracted contract.
- All 28 journeys (J-01 to J-28) were inventoried; selected subsets were traced (identity and session, work-history proof, J-02 apply and track, J-03 and J-04 recruiter, communication, account deletion, J-01 and J-19 learning and proof, J-26 career, monetization); none was run end to end; J-05 to J-28 terminals not covered by those traces were explicitly unverified.
- Journey list (persona and terminal state as recorded): J-01 Learn, Prove, Showcase (portfolio with verified signals); J-02 Apply, Track, Hire (offer accepted); J-03 Post, Source, Hire (offer extended); J-04 Org Setup, Team, Launch (first hire); J-05 Profile, Network, Referral (referred hire); J-06 AI Career Path (gaps addressed); J-07 Creator Author, Publish, Monetize (revenue); J-08 Mentor Match, Guide, Impact; J-09 Institution Cohort, Place, Track (placement reported); J-10 Agency Multi-Org, Pipeline, Bill; J-11 Extension Install, Local-First, Sync (profile diff applied); J-12 B2B2C Graduation Flywheel; J-13 Institutional Media Authoring; J-14 Institutional Procurement and Licensing (seats provisioned); J-15 Faculty Teach, Monitor, Intervene; J-16 Corporate L&D Mandate, Track, Certify (certification plus HRIS sync); J-17 LinkedIn Migration On-ramp; J-18 Creator Author, Publish, Sell, Payout (monthly settlement); J-19 Self-Paced Learner Discover, Certify; J-20 Learner Path, Courses, Capstone, Cert (program certificate); J-21 Contestant Register, Compete, Rank, Certify; J-22 Researcher Company, Reviews, Compare, Apply; J-23 Author Post, Engage, Article, Newsletter; J-24 Reviewer Write, Moderate, Publish, Response; J-25 Peer Reviewer Assigned, Rubric Review, Feedback (grade finalized); J-26 Career Switcher Assess, Plan, Transition (role transition confirmed); J-27 Hiring Manager Define, Assess, Hire, Track (post-hire outcome recorded); J-28 Skills Analyst Analyze, Recommend, Measure (learning program impact reported). The target's journey set is in `06_BUSINESS_PROCESSES`.
- Not measured by the prior attempt and therefore without a baseline: revenue, conversion, cost, usage, capacity, production performance SLOs, database query counts, queue age under load, cold-boot time at volume, restore time, or real mailbox delivery.
- Items "not found" are search-limited: "no matching code found" is a checklist to confirm with the owner, not proof of absence.

### 13.1 Earlier "what to add next" ordering (static assessment of 2026-10-21, retained as history)

Ordered by value for effort, items 1 to 3 using code that already existed: (1) durable storage for the long-tail modules behind the persistence path before adding more features; (2) web screens for existing APIs, highest value first: referrals (F-142) and warm intros (F-121) on the network page; endorsements (F-110) and peer credibility (F-150) on profile and work history; public certificate verification (F-52) at `/verify/:hash`; admin console (F-17, F-35, F-83) and moderation queue (F-24); saved searches and job alerts (F-32); skills graph (F-84) and career transitions (F-85, F-95) as profile tabs; (3) wire billing for real, with simulated mode clearly labelled, and gate the candidate plan (F-61); (4) a digest job (F-29) once an email provider exists; (5) quiz and course reviews (F-68, F-72); (6) a service worker for offline caching, or stop calling the app offline-capable; (7) interview room UI (F-33, F-88); (8) features not in the registry that reuse existing APIs: a member directory so network search finds people without typing a name, and an email-verified outreach flow for recruiters. Matrix of 2026-10-22 recommended this durability order for the 91 partial features: F-08 challenges and assessment, F-07 LMS, F-36 draft autosave, F-26 portfolio, F-17 admin console.

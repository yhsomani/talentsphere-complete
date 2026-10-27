# Legacy Merge B-13: API Contracts, Error Envelope and Billing/Webhook Semantics (Prior Attempt) Reconciled to the Target API Standard

Doc ID: LGM-B-13 · Owner: Backend Architecture Team · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: API-STD, APIC-01, API-REF-01, EVC-01, INT-01, ADR-T06, ADR-T08, ADR-T15, OPEN-46, OPEN-52 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/engineering/API_CONTRACTS.md` (30.8 KB; source cross-check `431c425a`, 2026-10-23; "describes the checked-in HTTP implementation; it is not a live API or production acceptance result").

## 0. Frame

- **No API exists in this project.** "Prior attempt reported" = a claim by legacy docs about an earlier attempt. "Target requires" = requirement here.
- The legacy 278-route static endpoint index is **already preserved row for row** in `OBSERVED_REFERENCE_API_INVENTORY.csv` (API-REF-01). Verification performed for this merge: all 278 legacy rows (method+path, request-schema label, registry flag P/S/E, source anchor) were compared with the CSV: 278 of 278 present, 0 missing, 0 differing. Route-level target mapping is in `OBSERVED_ROUTE_TARGET_CROSSWALK.csv`. Nothing from the endpoint index is therefore re-copied here; the group-level reading of it is in section 6.
- Legacy measured counts (preserve as provenance): 281 literal registrations; 278 unique method/path pairs (three Stripe paths had conditional disabled-mode registrations and enabled-mode implementations); 78 durable-registry entries and 3 stateless entries in the registry file at that snapshot (another legacy inventory file reported 80 durable-or-stateless; the two counts differ by snapshot - keep both as unresolved provenance); by method 132 GET, 123 POST, 13 PATCH, 11 DELETE, 2 PUT.

## 1. Contract ownership statement (prior attempt)

Routes lived in one server file (plus a separate billing module); request fields, defaults and bounds in a shared Zod contracts package; business transitions in domain modules; roles/ownership/known exceptions in the route-authorization review; persistence in the database reference. "A route header is not a whole-feature durability guarantee."

The former service, integration, queue, realtime and media target registers were canonical in SSOT section 13; the legacy file deliberately did not duplicate them. Those targets (OpenAPI 3.1, cursor pagination, general mutation idempotency, circuit breakers, heavy workers, realtime) were **not** universal implemented contracts. BYO-key integration: encrypted key storage existed but provider execution did not. Heavy-queue technology selection remained open.

**Target requires:** SSOT section 13 plus API-STD govern. Open item OPEN-46 (envelope, pagination default, deprecation window) already tracks the SSOT-vs-target mismatch.

## 2. Transport, authentication and validation (prior attempt)

- JSON over HTTP under `/api/v1`; `/health` also available; no generated OpenAPI document.
- Protected routes accept `Authorization: Bearer <token>`; tokens were TalentSphere HMAC sessions, not provider JWTs; an `extractUser` step checked token validity and current account/session state; individual handlers checked roles and record ownership; public reads and provider callbacks had their own access rules. "Never infer authorization from the URL or frontend guard."
- **Target requires:** cookie sessions (ADR-T06) with `X-CSRF-Token`; central policy check per route (ADR-T07); route-registry lint that every route declares a policy action, idempotency (unsafe routes), pagination (lists) and a rate class (API-STD section 8/9).

## 3. Error envelope and status mapping (prior attempt) with target slug mapping

Prior global handler body (kept exactly because it is a contract example):

```json
{"error":{"code":"VALIDATION_FAILED","message":"The submitted payload failed schema validation.","request_id":"request-id","details":[{"path":"email","message":"Invalid email"}]}}
```

| Failure (prior attempt) | HTTP | Prior code | Target slug (API-STD section 5) | Note |
|---|---|---|---|---|
| Zod payload parsing | 400 | `VALIDATION_FAILED`, field paths in `details` | `validation-failed` is 422; `malformed-request` is 400 | **Conflict L-B13-01:** prior used 400 for schema failures and 422 for domain/policy failures; target uses 422 for both validation kinds and 400 only for unparseable input. Decision needed: adopt target (recommended; owner: API Owner). |
| Missing/invalid/expired/revoked session | 401 | `UNAUTHENTICATED` | `unauthenticated` | same |
| Role, ownership, tenant or assessment-AI denial | 403 | domain authorization code | `forbidden`, `ai-prohibited`, `consent-required` | target splits by cause |
| Missing record | 404 | `NOT_FOUND` ("concealment differs by handler") | `not-found` ("missing or not visible") | **Target requires** uniform concealment (BE-01 section 5); the prior inconsistency is a lesson |
| Conflicting state, unique key or guarded concurrent update | 409 | `CONFLICT` | `conflict`, `duplicate-application`, `state-transition-invalid`, `precondition-failed` (412 for stale If-Match) | target distinguishes |
| Domain validation, policy or illegal transition | 422 | domain code | `validation-failed` (422) / `state-transition-invalid` (409) | **Conflict:** prior used 422 for illegal transitions in some places and 409 `INVALID_STATE_TRANSITION` in others (job transitions returned 409); target = 409 |
| AI quota or payment requirement | 402 | `FREE_USER_AI_QUOTA_EXCEEDED` / `PAYMENT_REQUIRED` | `entitlement-required` (402) | same status |
| Throttling | 429 | `RATE_LIMIT_EXCEEDED`; plugin supplies retry timing | `rate-limited` + `Retry-After` | same |
| Disabled provider/service | 503 | `SERVICE_UNAVAILABLE` | `upstream-unavailable` (503) | same |
| Unexpected error | 500 | `INTERNAL_SERVER_ERROR`, details masked in deployed environments | `internal` | same; keep masking in deployed environments |

- Every response carried `x-request-id` (error bodies echoed it as `request_id`). **Target:** `X-Request-Id` plus `traceparent`, and `traceId` in every problem body.
- Global limiter default: 300 requests per minute per verified account, otherwise per client address; health exempt; login/signup stricter; `TRUST_PROXY` controlled address interpretation; Stripe webhooks still shared the global throttling (a defect, conflict CF-30). **Target requires** a separate `RL-WEBHOOK` class (API-STD section 9) and `TRUST_PROXY`-equivalent config documented in the deployment architecture.
- Success bodies were handler-specific objects, not a universal envelope. `PaginationQuerySchema` was page/limit based but not universally used ("do not add `cursor` to arbitrary calls and expect pagination"); an idempotency field was meaningful only where the handler consumed it. **Target requires** the opposite: one list envelope and mandatory pagination/idempotency per route class (OPEN-46 for the exact envelope).
- Lesson recorded from a previous incident: the former default limiter (100 requests per 15 minutes per address) locked a normal user out after about 20 page views; it was found only by driving the running app. **Target requires** SPA-aware limits (RL-READ 600/min) plus a rate-limit E2E that performs a realistic page-view session.

## 4. Representative requests and effects (prior attempt) - business behaviours worth carrying

All paths had the `/api/v1` prefix; exact fields lived in named schemas to avoid a second drifting schema definition (**target requires** the same: no hand-written duplicate schemas; OpenAPI is generated).

| Request (prior attempt) | Input / success body | Rules and side effects reported | Target note |
|---|---|---|---|
| `POST /auth/register` | email, password, fullName, candidate/recruiter role; returns token, user, profile | persists account/profile; arbitrary elevated roles cannot be self-registered | target also needs consent capture and email verification (SEC-02) |
| `POST /auth/login` | token, user, profile | password verification; **decoy hash for unknown email** so timing does not reveal existence; legacy-hash upgrade | keep decoy hash |
| `GET /auth/session` | bearer; user/profile/memberships | uses current account roles, status, revocation and issuance cutoff | maps to `GET /me` + capabilities (ADR-T07) |
| `POST /auth/password` | change-password schema | verifies current password; advances session cutoff | keep: password change revokes other sessions |
| `POST /evidence` | create-evidence schema; evidence | uses caller's profile; validates all skill IDs before one transaction | one transaction |
| `POST /evidence/:id/verify` | verify schema; evidence | verification level requires matching authority; guarded state update | SM-EVIDENCE, INV-T04 |
| `POST /jobs/:id/apply` | optional coverLetter, attachedEvidenceIds; application | evidence ownership, published job, one active application, DB conflict handling; example body `{"coverLetter":"I would like to apply."}` with `Content-Type: application/json`, job id in the route; a duplicate active application is a conflict, not a second success | BR-T001, `duplicate-application` |
| `POST /applications/:id/transition` | transition schema | party authorization + allowed-transition table; persists before response | SM-APPLICATION |
| `POST /billing/checkout` | `{ "planTier": "candidate_pro", "billingCycle": "monthly", "idempotencyKey": "purchase-1" }`; 201 `{ "url": "..." }` | server chooses the provider price; role eligibility and existing paid subscription checked | client names plan+cycle only (ADR-T15) |
| `POST /billing/portal` | session; 200 `{ "url": "..." }` | requires a linked provider customer | same |
| `POST /billing/stripe-webhook` | raw JSON + `stripe-signature`; processing status | SDK signature verification, normalized events, atomic billing event/state storage | INT-01, INV-T17 |
| `POST /ai/career-assistant/chat` | conversationId, message, provenance | assessment prohibition, prompt checks, hardcoded free quota, heuristic response; memory state | AI gateway only (ADR-T12) |
| `POST /ai/assistant/query` | answer, disclaimer | **separate echo-style scaffold; assessment check but no chat quota/firewall** | **target forbids a second AI path**: one gateway, one policy chain (INV-T06/T07) |
| `POST /settings/erasure/execute` | session | immediate multi-stage erasure; does not enforce the request grace period | see database file L-B12-01 |

## 5. Billing modes, webhook and retry semantics (prior attempt)

- Modes: `disabled` (default); `simulated` (activates test subscriptions without taking money, refused in production); `stripe` (registers the real adapter; missing keys / webhook secret / catalog or duplicate configured price IDs fail configuration checks). Outside Stripe mode, checkout/portal/provider-callback routes returned 503. A **generic** `/billing/webhook` used `x-talentsphere-signature` (a separate HMAC format) and was *not* the Stripe callback.
- Checkout scoped provider idempotency by account, plan, cycle and client key. Provider event IDs were recorded with state changes (`BillingStore.applyEvent`). Subscription reconciliation handled event ordering and entitlement changes; invoice events updated invoice records. A **full current-period refund** ended access only when its payment belonged to the active subscription; partial, old-period and unrelated refunds did not. **Disputes and voided invoices remained unsupported.** A browser checkout-success redirect alone granted no entitlement.
- Known gaps: two concurrent checkout sessions could still yield a superseded paid subscription whose resolution was a policy gap (conflict CF-30, issue #50); event dispatch occurred after billing commit, not in a transactional outbox; tests used fake gateways; live processing unverified.
- **Target requires:** one processor (Stripe, ADR-T15); no `simulated` billing mode in any deployed environment (test mode keys only in non-production, with the provider's test cards); signature + timestamp tolerance + dedupe by provider event id; disputes and voided/refunded handling specified before billing launch (decision OPEN-33, OPEN-19); concurrent-checkout supersession policy specified (cancel/refund the superseded subscription automatically or block creation while a session is open); outbox for post-commit dispatch (INV-T12); webhook route in its own rate class.
- Open decision kept visible: **L-B13-02** - policy for superseded paid subscriptions and for dispute/void handling (owner: Finance Ops + Legal + Backend; relates to OPEN-33 and OPEN-19).

## 6. Group-level reading of the 278-route index (prior attempt) - capability list to compare with APIC-01

Registry flag `P` = listed durable (PostgreSQL mode only), `S` = stateless, `E` = labelled ephemeral. Area groupings are hand-summarised from the CSV (no per-area counts are claimed); use them only as a coverage checklist.

| Area (path prefix) | Observed behaviours (capability seeds) | Durable at prior snapshot? |
|---|---|---|
| health, feature-flags | liveness, environment health, read of flags | S / P |
| auth, profile | register, login, change password, sign-out, sign-out-others, session, profile get/patch/get-by-id | P |
| evidence, skills | create/list/verify/dispute/revoke, public verify; skill list/create; skill graph and relationships | P (relationships/graph E) |
| organizations, jobs, job-templates, saved searches, saved jobs, drafts | org create/list/member add; job create/list/status; templates (create/get/patch/delete/instantiate/save-as); saved searches CRUD+run; job alerts; saved jobs; application drafts with versions and restore | jobs P; templates E; drafts E; saved searches/jobs P; alerts E |
| applications, feedback | apply, my, get, per-job list, transition; application feedback + request + templates + aggregate insights | apply/transition P; feedback E |
| skill freshness / decay, endorsements, forecast, market signals | register, my, refresh-all, reverify; endorsements give/list/delete; forecast top-growth/generate/query; admin-only market signals | E |
| interviews | questions; assessments schedule/join/consent/end/code/scorecard/compensate/ai-feedback/review | E |
| reputation | signals, user score, recovery plans, instructor and employer reputation, reviews, metrics, recompute | E |
| challenges, courses, lessons, certificates, XP, gamification, learning impact | list/get/create/start/submit; course CRUD, modules, lessons, publish, enroll, progress, complete; certificates verify/revoke; ledger; summary/badges/leaderboard/claim-activity; learning outcomes/impact/compute/dashboard | E (evidence from completion P) |
| messaging, notifications | threads, messages, read; notifications list/summary/mark-read/preferences | P |
| AI | conversations, career-assistant chat, usage, assistant query | E |
| resumes, connections, networking, referrals, portfolio | resume CRUD+export+exports; connection request/respond/withdraw/delete/status; warm-intro prefs/paths/requests; referral requests/outcomes; portfolio projects CRUD+showcase | E |
| recruiter | talent pools (+members, intelligence), behavioral discovery, talent segmentation | E |
| alumni | affiliations, directory, groups, mentorship | E |
| career | transitions, benchmarks, probability, pathways, milestones | E |
| activity, analytics | activity events/scores; analytics events/KPIs | E |
| salaries | reports, my reports, benchmarks, company summary | E |
| search, moderation | search/autocomplete/commands/history; scan/reports/appeals/review | E |
| settings | get/patch, export, latest export, erasure request/status/cancel/execute | P (export & execute partly E) |
| billing | plans, subscription, subscribe, cancel, invoices, generic webhook, Stripe checkout/portal/webhook | P (plans S) |
| admin | users list/status/roles; feature flags get/put; audit logs; health diagnostics; maintenance | flags/audit P; others E |
| internal | worker jobs list | E |

**Target requires:** this is the third coverage cross-check (after API-REF-01's row-level inventory and the route-target crosswalk) and is intentionally coarse. Owner decision OPEN-50 covers semantic mapping and disposition of each of the 259 routes with no target shape match; nothing here approves or retires a route.

## 7. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B13-01 | 400 vs 422 for schema validation; 409 vs 422 for illegal state transitions | API Owner + Backend Architect (relates to OPEN-46) |
| L-B13-02 | Superseded paid subscription and dispute/void policy | Finance Ops + Legal + Backend (OPEN-33, OPEN-19) |
| L-B13-03 | Reconcile the durable/stateless registry counts (78 + 3 vs 80) across legacy files before using either as a metric | Documentation Architect |
| OPEN-46 | Success/list envelope, pagination default (20 vs 25), deprecation window (6 months vs 90 days) | API Owner |

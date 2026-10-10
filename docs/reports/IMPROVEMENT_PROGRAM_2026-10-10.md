# TalentSphere — Improvement Program Report (2026-10-10)

- **Branch:** `improvement/core-loop-durability` (from `main` at `32a3abc7`), not pushed.
- **Commits:** `1bb0f625` (API: durable core loop, proof-based verification, authz), `ae99e31c` (web: real journeys, honest pricing and copy), `93dfe125` (fixes from adversarial review), plus the documentation commit that adds this file.
- **Method:** multidisciplinary audit → prioritised fixes in small increments → each increment verified by tests that drive the real API, a real PostgreSQL and a real browser → independent adversarial review of the diff → its findings reproduced, fixed and regression-tested.
- **Evidence rule:** every "fixed" below names the test that covers it; the fixes whose tests were mutation-checked (shown to fail without the fix) are listed in G. Where something was not verified, this report says so.

---

## A. Project understanding

**What TalentSphere is for.** A career platform whose differentiator is _trust_: a candidate's claims (work history, skills, evidence) carry visible, explainable verification — a confirmed work email, references from named people, assessed evidence — so employers can hire on proof rather than self-description. The core loop is:

```text
Candidate: sign up → build profile → add work history → prove it (email code, references) → apply
Recruiter: set up company → post job → review applicants (with verification summary) → move them through the pipeline
Referee:   receive a one-time link → confirm dates/title, rate → the candidate's record upgrades
```

**What the repository actually is.** A pnpm monorepo: Fastify 5 API (`apps/api`, one 12k-line `server.ts`, 269 routes), React 19 + Vite web app (`apps/web`), a job worker (`apps/worker`), and shared packages (`domain` — all business rules, `contracts` — Zod schemas, `config`, `observability`, `ui`, `testing`). PostgreSQL schema in 43 migrations. Self-issued HMAC session tokens; no external identity, payment, email, AI or notification provider is integrated.

**Three architectures in circulation.** Documents in the claude.ai project describe stacks that are not this repository: `TALENTSPHERE_MASTER_BLUEPRINT.md` locks Next.js App Router + Supabase Auth/RLS + Vercel; `starting-implementation-of-data-heavy-project.md` describes Java 21/Spring Boot microservices with a Redux frontend; `SSOT.md` assumes Supabase Auth and Edge Functions. This repository is a Fastify modular monolith with its own auth. `ARCHITECTURE.md` (root) is the record of what exists. **Which architecture is canonical is an owner decision** (see H).

## B. Critical audit — findings and status

Severity: **P0** breaks the product's promise or allows abuse; **P1** serious defect; **P2** quality/operability.

| #  | Sev | Finding (as found)                                                                                                                                                                                                 | Status                                                                                       | Covered by                                                       |
| -- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1  | P0  | In `STORAGE=pg` (the default) the API wrote **no entity rows**: a registered user could not log in after a restart (`users` count 0).                                                                               | **Fixed** — ADR-015                                                                          | `tests/pg/core-persistence.test.ts` (mutation-checked)           |
| 2  | P0  | A reference could be submitted **without the referee's token**; the reference id was returned to the candidate, who could vouch for themselves anonymously.                                                         | **Fixed** — token required, single-use, stored as SHA-256, delivered only to the referee      | `tests/integration/work-history-graph.test.ts`, e2e `core-loop`  |
| 3  | P0  | "Corporate email verified" was granted for **any typed address** — no proof of mailbox control.                                                                                                                    | **Fixed** — 6-digit code (hashed, 15 min, 5 attempts) sent to the address                    | same + `tests/security/core-authz.test.ts`                       |
| 4  | P0  | `PATCH /jobs/:id/status` used the job's own org as the actor's: **any recruiter could close any company's jobs**.                                                                                                   | **Fixed** (BR-12)                                                                            | `core-authz` "tenant isolation on job postings"                  |
| 5  | P0  | The web app was a façade: every user saw a hardcoded "Sarah Chen" dashboard; the three listed jobs did not exist on the server, so **Apply always failed**; no sign-up page; no recruiter side.                     | **Fixed** — candidate, recruiter and referee journeys on real data                           | `tests/e2e/core-loop.spec.ts` (3 people, UI only)                |
| 6  | P0  | Checkout **collected card numbers** it never sent anywhere and **activated paid plans without payment**.                                                                                                           | **Fixed** — no card fields; paid plans refused unless `BILLING_MODE=simulated` (refused in production) | `tests/integration/billing*.test.ts`, e2e `web-ui` pricing       |
| 7  | P0  | Billing webhook accepted **unsigned** requests.                                                                                                                                                                    | **Fixed** — HMAC-SHA256 + 5-min timestamp tolerance; no secret ⇒ 503                         | `tests/security/api-security.test.ts`                            |
| 8  | P0  | _(review)_ With Postgres, **40 concurrent wrong email codes were recorded as one attempt** and the correct code was then accepted — the 6-digit code was brute-forcible in batches.                               | **Fixed** — optimistic concurrency in `persist()` + database guard                            | `tests/pg/concurrency.test.ts` (40 > 5 without the fix)          |
| 9  | P0  | _(review)_ Interview routes acted for **any signed-in user**: a rival org could link another company's application to its own assessment and score it, moving that company's pipeline; anyone could join as interviewer, end or review; candidates received hidden test inputs/outputs; any org's private question could be run. | **Fixed** — hiring-team/participant scoping, linkage checks, redaction                       | `core-authz` "interview assessments are scoped…"       |
| 10 | P1  | Unpublished (draft) jobs readable by anyone.                                                                                                                                                                       | **Fixed**                                                                                    | `core-authz`                                                     |
| 11 | P1  | Org member endpoint accepted any role string (including `owner`), unknown users and duplicates; admin role update accepted arbitrary strings.                                                                      | **Fixed**                                                                                    | `core-authz`                                                     |
| 12 | P1  | Suspended/banned accounts kept full access until token expiry; role changes ignored until re-login.                                                                                                               | **Fixed** — status and roles resolved per request; restricted accounts may only appeal and exercise data rights | `core-authz` "account state is enforced…"                         |
| 13 | P1  | Passwords: PBKDF2 at 10k iterations; `AUTH_RATE_LIMIT_MAX_REQUESTS` configured but never applied; unknown-email logins answered faster (enumeration).                                                             | **Fixed** — 210k iterations, versioned format, re-hash on login; per-account/IP limits; timing decoy | `tests/unit/password-hashing.test.ts`, `core-authz`              |
| 14 | P1  | Production would start with no `TOKEN_SECRET`, in-memory storage, a localhost DSN or CORS.                                                                                                                         | **Fixed** — `index.ts` refuses                                                               | `tests/unit/production-config.test.ts`                           |
| 15 | P1  | `/internal/worker-jobs` (unauthenticated; payloads hold codes and reference links) served in every environment.                                                                                                   | **Fixed** — development/test only                                                            | `api-security`                                                   |
| 16 | P1  | GDPR erasure left work history, references and evidence in place.                                                                                                                                                  | **Fixed** — removed in the database, survives restart                                        | `tests/pg/core-persistence.test.ts`                              |
| 17 | P1  | Interview scorecard set application status directly, bypassing the ATS state machine (could resurrect rejected applications).                                                                                     | **Fixed**                                                                                    | `core-authz` "a scorecard never resurrects…"                     |
| 18 | P1  | _(review)_ A concurrent hire and withdrawal **both returned 200**; only one survived.                                                                                                                               | **Fixed** — exactly one is acknowledged                                                      | `tests/pg/concurrency.test.ts`                                   |
| 19 | P1  | _(review)_ One-time reference tokens and email codes stayed in `background_jobs.payload` indefinitely.                                                                                                             | **Fixed** — stripped on every terminal transition (still present while queued)               | `tests/pg/concurrency.test.ts`                                   |
| 20 | P1  | Unsupported claims in the UI: "SOC2 Type II Ready", "GDPR & CCPA Compliant", "DKIM Verified", fabricated provenance hashes, a 555 phone number, a support address at an unowned domain.                          | **Fixed** — removed; support address now `VITE_SUPPORT_EMAIL`; legal pages marked unreviewed drafts | e2e `web-ui`, `navigation`                                        |
| 21 | P2  | _(review)_ Impossible dates (2023-02-30), 300-character emails, 1e20 salaries → **500** in Postgres; duplicate ids → misleading 409.                                                                              | **Fixed** — contract validation; SQLSTATE class 22 → 422                                     | `core-authz`, `tests/pg/concurrency.test.ts`                     |
| 22 | P2  | Every 4xx logged at **error** level with a stack — error-level alerting would be noise.                                                                                                                            | **Fixed** — 4xx at info, 5xx at error                                                        | (behaviour visible in test output)                               |
| 23 | P2  | Several write paths updated a record's `byId` Map but left per-org/per-subject lists stale.                                                                                                                       | **Fixed** — one `applyToReadModel` per entity                                                | covered by integration suite                                     |
| 24 | P1  | _(Reticle)_ The global rate limit was **100 requests per 15 minutes per address**. A dashboard view makes ~5 API calls, so a normal user was locked out after ~20 page views and shown "Refresh to try again" (which spent more budget); behind a load balancer every user would share one bucket, and health checks counted against it. The E2E suite raises the limit to 100,000, so it never saw this. | **Fixed** — 300/min per signed-in account (per address when anonymous), `TRUST_PROXY`, health exempt, plain 429 message with the wait time, session error offers *Try again* | `api-security` "Rate limiting" (mutation-checked), `tests/unit/rate-limit-config.test.ts`, e2e `session-resilience` |
| 25 | P1  | Nothing in the core loop sent a notification: a candidate was never told their application moved or that a referee had responded, and a hiring team never heard of a new applicant. Notifications that other modules did send lived only in memory, and the `notifications` table would have rejected 10 of the domain's 16 types. | **Fixed** — durable notifications in the same transaction as their event (migration 00044); hiring team told of applications and withdrawals, candidate of every move and of referee responses, no candidate names or private rejection reasons in the text; bell with unread count and a notifications page; erasure deletes the person's notifications | `tests/integration/core-notifications.test.ts`, `tests/pg/notifications.test.ts`, e2e `notifications`, Reticle (§G) |
| 26 | P2  | Signed-in pages shifted as they loaded (Cumulative Layout Shift): up to **0.82** on the profile page and 0.16–0.39 elsewhere at phone width ("poor" is > 0.25). The PWA pill first rendered "Not installable" then "Installable", the account label changed from email to name, and the footer sat in view during loading then jumped. | **Fixed** — PWA status detected before first paint, fixed-width account label (hidden on phones), content area at least one screen tall; every page now ≤ 0.008 | e2e `performance` "Layout stability" (CLS ≤ 0.1 at 390 px and 1280 px; mutation-checked: 0.28 on the old layout) |
| 27 | P1  | There was no way to change a password, and no session could be ended before its 24-hour expiry — someone who suspected their password was known could do nothing. Adding it exposed a latent race: the login re-hash and moderation/admin status changes rewrite the whole user record, so one computed from a stale read could restore an old password. | **Fixed** — change password on the profile page (current password required, throttled per account); every earlier session refused from the next second (migration 00045), this device kept signed in; user-record writes carry `base` with a database re-check | `core-authz` "changing a password ends every other session" (mutation-checked; 10/10 repeat runs), `tests/pg/concurrency.test.ts`, e2e `account-security` (two devices), Reticle (§G) |

**Open findings** are in section H.

## C. Ideal-state blueprint (what "good" looks like for this product)

1. **Every claim is either proven or labelled.** Verification tiers derive only from evidence a third party controls (mailbox, referee, assessor). Nothing in the UI asserts a capability, certification or result the system did not produce.
2. **Everything the product promises to remember is durable**, transactional, and survives restarts, with concurrent writes that cannot silently overwrite each other.
3. **Authorization is object-level everywhere**: every route that loads a record by id checks the caller's relationship to it (owner, org member, participant), not just that they are signed in.
4. **The three roles each have a complete journey** in the UI, with real states (empty, loading, error, conflict, offline).
5. **Delivery channels exist**: transactional email (codes, reference links), and in-app notifications for status changes. Without email the verification loop cannot run outside development.
6. **Operable**: one documented deployment, health that reports what is measured, error-level logs that mean faults, backups and a tested restore.
7. **One architecture of record**, with documents that describe it.

## D. Architectural decisions

| Decision                                                                                                                       | Reversible?                         | Record                                                 | Needs owner ratification                         |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Persist the core loop to Postgres; Maps become a boot-hydrated read model; single API writer                                    | Yes (exit path documented)          | `docs/engineering/adr/ADR-015-core-loop-persistence.md` | **Yes** — includes schema change `00043`          |
| Optimistic concurrency on core records (`CoreOp.base` + in-flight set + database re-check)                                       | Yes                                 | ADR-015 §Decision 5                                     | No                                               |
| Verification requires proof of control (email code, referee token); secrets stored only as SHA-256                               | Yes                                 | `SECURITY.md` §8–9                                      | No                                               |
| No payment processor ⇒ paid plans **cannot be bought** (`BILLING_MODE=disabled` default); `simulated` for demos/tests only       | Yes                                 | `.env.example`, `OPERATIONS.md`                         | **Yes** — pricing/entitlement (see H)             |
| Webhook signing scheme is TalentSphere's own (Stripe-style `t=…,v1=…`) until a provider is chosen                               | Yes                                 | `SECURITY.md` §9                                        | Replace with the provider's scheme when chosen   |
| State what is not durable instead of hiding it (`x-talentsphere-durability: ephemeral`)                                         | Yes                                 | `apps/api/src/durability.ts`                            | No                                               |
| Log refused requests (4xx) at info, faults (5xx) at error                                                                      | Yes                                 | `server.ts` error handler                               | No                                               |

## E. Roadmap (remaining work, prioritised)

**P0 — before any real user**

1. **Transactional email provider.** Reference links and email codes are only printed to the development log ("DEV OUTBOX"); outside development the worker fails those jobs permanently. Until an email provider is chosen and integrated (owner decision, new infrastructure), the verification loop works only in development.
2. **Ratify ADR-015 and migration 00043** (owner), then apply migrations to the target database.
3. **Decide the architecture of record** among the three in circulation (A) and archive the others' documents as historical.
4. **Legal review** of the draft privacy policy and terms; confirm a support/privacy contact on a domain the company owns.

**P1 — before a public beta**

5. Persist the next modules users will expect to survive a restart: messaging, saved searches/drafts, erasure requests (30-day grace flow). Notifications are done (finding 25).
6. Recruiter account erasure semantics (owned organizations, posted jobs) — not handled today.
7. Interview code execution is **simulated** (results do not depend on the code). Either integrate a sandbox or remove the feature from any user-visible surface.
8. Session hardening: revocation on sign-out (a password change now ends every other session — finding 27); consider httpOnly cookies over localStorage.
9. Deployment: one documented target (single API replica per ADR-015), backups with a tested restore, alerting on error-level logs.

**P2 — scale and maintainability**

10. Split `server.ts` (12k lines) into per-context route modules sharing injected stores.
11. Move core reads to SQL (ADR-015 exit path) before a second API replica or large data volume.
12. Review the scoring rule that lets candidate-typed skills add points to a verification score (owner decision; see H).

**P3**

13. Replace the local-heuristic AI with a provider behind the existing gateway (cost invariant preserved), if the product wants it.

## F. Implemented improvements (by increment)

1. **`1bb0f625` — API.** Core-loop persistence (ADR-015, migration 00043); proof-based verification (email code, referee token); tenant isolation fixes; per-request account state; password hardening and rate limiting; production config refusal; GDPR erasure in the database; secondary-index consistency; Postgres error mapping; ephemeral labelling. CI gains a Postgres service, a migration-idempotency step and the pg suite.
2. **`ae99e31c` — Web.** Sign-up; server-backed session (`GET /auth/session`); candidate dashboard, jobs, job detail and apply, applications with withdraw, profile with privacy and account deletion; recruiter company setup, job posting and lifecycle, applicant pipeline with verification summary and state-machine-limited stage moves; referee landing page; role-based navigation. Honest pricing (no card collection), signed webhook, removal of unsupported claims, legal pages marked draft.
3. **`93dfe125` — Adversarial review fixes.** Findings 8, 9, 18, 19, 21, 22 above.
4. **Reticle verification (follow-up session).** Drove the running app (Postgres-backed dev server) through Reticle's HTTP MCP transport and found finding 24; see G.
5. **Core-loop notifications (2026-10-11).** Finding 25; verified with Reticle in the running app (§G).
6. **Documentation.** ADR-015; this report; `ARCHITECTURE.md`, `README.md`, `SECURITY.md`, `OPERATIONS.md`, `FINAL_VALIDATION_REPORT.md`, `BRAIN/MEMORY.md` and `.env.example` brought in line with the code.

## G. Validation evidence

Measured on this branch (2026-10-10). Baseline at `32a3abc7`: Vitest 976 tests / 94 files, Playwright 183, no Postgres suite.

| Gate                                               | Result                                   |
| -------------------------------------------------- | ---------------------------------------- |
| `pnpm lint` (Prettier)                              | clean                                    |
| `pnpm typecheck` (`tsc -b`, 10 projects)            | clean                                    |
| `pnpm test` (Vitest: unit, integration, security)   | **1049 / 1049** passed, 100 files        |
| `pnpm test:pg` (real PostgreSQL 16)                 | **15 / 15** passed, 3 files              |
| `pnpm build`                                        | clean                                    |
| Playwright (Chromium; e2e, a11y, performance)       | **196 / 196** passed                     |

**Mutation checks (the tests catch the bug they claim to):**

- Disabling `PgCoreStore.commit` fails all `core-persistence` tests.
- Removing the optimistic-concurrency guards: the email burst records 40 evaluated guesses (limit 5) and the hire/withdraw race acknowledges both — both pg tests fail.
- Removing only the in-process guard (simulating a second API writer): the pg tests still pass — the database guard holds alone.
- Letting a scorecard move any application: the "never resurrects a rejected application" test fails.
- Removing per-account rate-limit keys, or the health-check exemption: the matching `api-security` tests fail.

**Adversarial review.** An independent reviewer agent probed the diff and wrote reproduction scripts; its run ended early (rate limit) without a written report. Its probes were run here against the pre-fix code: they reproduced findings 8, 18, 19 and 21, and the cross-tenant application linking in 9 (its scorecard step used an invalid payload, so the pipeline move was confirmed by reading the code); the rest of 9 came from reading every interview route after that lead. All are fixed and covered above. The memory-mode email race did _not_ reproduce (requests happened to serialise); only the Postgres test discriminates — which is why that test lives in the pg suite.

**Not verified:**

**Reticle (in-app verification, follow-up session).** The `reticle_*` tools were not loaded in the agent's tool list, so the session drove the daemon through Reticle's documented HTTP MCP transport — the same tools, verdicts from `reticle_act_and_wait`/`reticle_assert` only. Against the Postgres-backed dev server:

- **Sign-up → job → apply → applications: every step `verified: "yes"`.** Registration (one `POST /auth/register`, 201) lands on a dashboard headed with the new user's name, no demo person, and holds after a reload; the jobs page renders the real posting from `GET /api/v1/jobs`; the job page shows the apply form; applying sends exactly one `POST …/apply` (201) and confirms; the application is listed as Submitted and holds after a reload. The recruiter sees the candidate's note (checked through the API). Zero network or console errors in any step.
- **Saved flow `candidate-navigation`** (from an earlier session) failed with _drift_: it clicked a landing-page "Launch Dashboard" link that the web rewrite removed on purpose. Re-recorded against the current navigation for a signed-in candidate, with consequence assertions on every step; replay passes.
- **Finding 24** surfaced while replaying: after a few minutes of driving, the dashboard showed "We could not confirm your session" — the API was answering 429 to everything. Fixed, then re-verified in the running app: 20 navigations at a human pace, every step `yes`, and an assertion that no request was throttled `yes`. Driving ~10× faster than a person still trips the new limit, which is the limiter working.
- **Not verified / limits:** not every Reticle verdict in the session was "yes" (its end-of-session summary for the last tab: 84 of 96 claims held). The ones that were not fall into four groups: the saved flow's drift above; real throttling (finding 24); throttling I caused by driving ~10× faster than a person after the fix; and checks where my expectation was wrong — a miscounted note length, a logo click on the dashboard (for signed-in users the logo leads to the dashboard by design), and navigation checks whose target link also existed on the previous page. None of the last group is an app defect. Correction (2026-10-11): I described Reticle's layout-shift figures (0.24–0.46) as per-navigation shifts; they are a running total for the session. Measured directly, real page-load CLS was a genuine problem (finding 26, now fixed), while client-side navigation driven by real clicks adds exactly 0 — the running total keeps growing only under Reticle's own driving (reported to Reticle). Response-body capture was left off on purpose (login/register bodies carry session tokens).
- **Notifications (2026-10-11):** signed in as the candidate after the recruiter moved her application — the header's accessible count "Notifications, 1 unread" `yes`; opening notifications shows "Platform Engineer: in review" and the plain-words message `yes`; *Mark all as read* sends one request, clears the count, and holds after a reload `yes`. One `unknown` on the way: the badge digit is `aria-hidden` (its count is in the link's accessible name), so Reticle would not call it on screen; the browser test asserts its visual visibility instead.
- **Password change (2026-10-11):** on a fresh account — sign in `yes`, profile shows the password form `yes`, changing it sends one request and shows the confirmation `yes`, and after a reload this device is still signed in (`reticle_assert` wait: pass). The session from before the change gets 401 from the API. One `no` on the way was my condition: I first required the one-off confirmation to survive a reload.
- The Playwright suite (including `core-loop.spec.ts`, three people driving the whole loop through the UI) remains the CI-level UI verification.
- No load, soak, backup/restore or deployment testing — there is no deployment target.
- Email delivery, payments and notifications are not integrated, so they are not verified.

## H. Remaining risks and decisions for the owner

**Decisions (not taken autonomously):**

1. **Architecture of record** — this repository (Fastify monolith, own auth) vs the Next.js/Supabase blueprint vs the Spring Boot plan.
2. **Ratify ADR-015 / migration 00043** — schema change: replaces `UNIQUE(job_id, candidate_id)` with a partial index (re-apply after withdrawal allowed), drops the plaintext `employment_references.token` after hashing it, re-points work-history/reference FKs to `users(id)`.
3. **Pricing and billing** — paid plans are not purchasable. Choose a processor and plan entitlements, or keep the product free for launch.
4. **Email provider** — required for the verification loop outside development.
5. **Legal** — privacy policy and terms are unreviewed drafts; the previous contact address (`privacy@talentsphere.dev`) may be at a domain the company does not own.
6. **Account deletion semantics** — the UI erases immediately; SSOT describes a 30-day grace period (the request/cancel API exists but is not durable). Choose one.
7. **Scoring rule** — listing two or more skills (typed by the candidate) adds 5 points to a work-history _verification_ score (`calculateVerificationScoreAndBadge`). A verification score that rises without verification may undercut the product's promise.

**Risks:**

| Risk                                                                                         | Likelihood | Impact | Mitigation in place                                         |
| -------------------------------------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------- |
| ~220 routes (messaging, learning, gamification, interviews, saved searches, billing records, …) lose state on restart | Certain    | High   | Labelled `ephemeral`; core loop durable                      |
| A second API replica is started against the same database (ADR-015 single writer)            | Medium     | High   | Documented in OPERATIONS and ADR; database guards stop lost updates on guarded records, not stale reads |
| Verification loop unusable outside development (no email provider)                          | Certain    | High   | Worker fails such jobs permanently and visibly              |
| Interview "code execution" is simulated                                                      | Certain    | Medium | API only — no screen in the web app exposes interviews      |
| Session tokens in localStorage; sign-out does not revoke server-side                          | Medium     | Medium | 24 h expiry; a password change ends every other session; suspension/erasure take effect per request |
| Migration 00043's case-insensitive email index fails on a database with case-duplicate emails | Low        | Medium | Noted in ADR-015; no populated database exists              |
| `server.ts` size slows change and review                                                     | Certain    | Medium | Roadmap P2                                                  |

## I. Final assessment

**Before:** the product could not keep a single user across a restart, its central trust feature could be forged by anyone (self-submitted references, unproven email "verification"), recruiters could close each other's jobs, and the web app showed a fabricated person and jobs that could not be applied to.

**Now:** the career loop the product exists for — sign up, prove a role, apply, review, move through the pipeline, vouch as a referee — works end to end in the browser on real, durable data; its verification can no longer be forged by the person being verified; and the defects found by adversarial review are fixed with regression tests (the race fixes mutation-checked).

**Readiness:** **not production-ready.** It is ready for a closed, developer-run demonstration of the core loop. A real-user beta is gated on the P0 items in E (email provider, ADR ratification, architecture decision, legal review); a public launch additionally on the P1 items. No production readiness is claimed beyond what section G measures.

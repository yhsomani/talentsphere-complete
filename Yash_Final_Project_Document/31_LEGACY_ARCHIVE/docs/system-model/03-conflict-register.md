# System model 03 — Conflict register and decision records

Status values used: **Verified** (fixed here and the check passed), **Confirmed** (the lead re-read the code and the contradiction holds), **Reported** (an investigator read it; not independently re-read), **Open - decision needed** (needs an owner; `AGENTS.md` says to escalate, not guess), **Blocked** (external access or approval missing).

Severity: P0 security or financial integrity, P1 broken core behaviour, P2 integrity or reliability gap, P3 documentation or minor.

How the "council" was run: five read-only investigators (auth, jobs, work history, data and worker, web app) worked independently and each reported contradictions with citations. They did not see each other's output. The lead then re-read the code for the items marked Confirmed. A separate adversarial pass (`05-audit.md`, Audit H) challenged the claims. No investigator had authority to approve a change; decisions marked "needs owner" are not approved.

## Resolved in this work

| ID | Conflict | Evidence | Sev | Status | Fix and check |
| -- | -------- | -------- | --- | ------ | ------------- |
| CF-01 | The API served invented people and demand: 60 career transitions, market signals for four skills, baseline signals made up in three forecast routes. Benchmarks and forecasts presented statistics about people who do not exist. | `fb38674b` removed `server.ts` seed blocks | P1 | Verified | Removed; forecast routes return no ranking or 404 until data is recorded. Tests record their own data. `pnpm test` and the two e2e specs pass. |
| CF-02 | The benchmark "at least 20 people" rule counted rows, so one person posting 20 moves published their own salary change. | `packages/domain/src/career-trajectory.ts` | P1 | Verified | Counts distinct people. New unit tests (3). |
| CF-03 | The benchmark carried a constant retention rate of 88.5 and cited a data source (`verified_ats_outcomes`) that is never collected. | same file | P2 | Verified | Field and claim removed. |
| CF-04 | A sample course (stub lessons, nil-UUID instructor), a sample challenge and 35 invented learner outcomes (80% hire rate) were loaded at boot and shown as real. | `server.ts` LMS, challenges and learning-impact sections | P1 | Verified (unit and integration); full e2e re-run result in `05-audit.md` | Removed; `tests/helpers/content.ts` creates content through the API. |
| CF-05 | Account erasure could not finish after Stripe had deleted the customer (retry got `resource_missing` and returned 503). | `stripe-gateway.ts` | P2 | Verified | Treated as done; 2 unit tests. |
| CF-06 | A Stripe checkout for a customer already linked to another account hit a unique constraint and Stripe retried for days. | `billing-stripe.ts` | P3 | Verified | Event ignored; integration test. |
| CF-07 | Refund handling matched a refunded charge to the customer's subscription by time only. | CodeRabbit review of `9a7bc350` | P1 | Verified | Resolved through Stripe invoice payments; integration tests. |

## Open conflicts

| ID | Conflict (claim A versus claim B) | Evidence | Sev | Status | Needed |
| -- | ---------------------------------- | -------- | --- | ------ | ------ |
| CF-10 | The referee token never expired: only a hash was stored and compared, yet the error text said "Invalid or expired reference token" and `SECURITY.md` says the link dies on use. | `server.ts` referee view and submit routes | P2 | **Verified (fixed)**: the link stops working 30 days after the request (uses the stored `requestedAt`; no schema change). View returns 404, submit returns 403. Integration test with a moved clock. | Owner may change the 30-day limit. |
| CF-11 | Email-ownership check is meant to prove the person works at the company, but the domain match runs only when the role has a company with a website. Otherwise any non-webmail address passes. A candidate can verify a mailbox they control. | `server.ts:12274-12281`; `ARCHITECTURE.md:332` | P1 | Confirmed, open - decision needed | Decide whether verification requires a company with a website. This changes product behaviour. |
| CF-12 | Any signed-in account (including a candidate) could post a market signal, and signals feed the public forecasts. | `server.ts` market-signals route | P2 | **Verified (fixed)**: the route now requires a platform admin; 403 for anyone else. Integration and e2e tests cover the refusal. | Decide later whether a verified external source may also supply data. |
| CF-13 | Hosted Supabase: migrations 00016, 00018, 00022 and 00023 reference `auth.users(id)`, but the app keeps users in `public.users` (decision D4). On hosted Supabase those inserts would fail, and `auth.uid()` policies do not recognise the app's own tokens. The migration runner refuses hosted Supabase for this reason. | `supabase/migrations/00016`, `00018`, `00022`, `00023`; `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md`; `scripts/lib/pg.mjs` | P1 | Confirmed, Blocked | Owner choice of a hosted-specific path (issue #46); rehearse on a disposable project. |
| CF-14 | Anyone with any membership in an organization can manage jobs and move applicants; comments and the SSOT say "authorized recruiters". The organization role is not checked. | `server.ts:922` (`canManageJobs`), `:2763`; `applications.ts:76,97` | P2 | Reported, open - decision needed | Define which organization roles may act. |
| CF-15 | Job approval: `SSOT.md:1051-1053` describes admin approval and a `rejected_by_moderation` state. Code lets an organization recruiter move `pending_approval` to `approved` themselves, allows `draft` to `published` directly, and has no moderation state. | `packages/domain/src/jobs.ts:28,111` | P2 | Reported, open - decision needed | Product decision on whether approval is required. |
| CF-16 | An organization owner without the `recruiter` role passes the route check but is refused by the domain layer when creating a job or changing its status. | `server.ts:1743`; `jobs.ts:61,111` | P3 | Reported | Decide how the `recruiter` role is granted to organization creators. |
| CF-17 | `ARCHITECTURE.md` says there is no database client, no Stripe and no session revocation (lines 217, 104, 220, 464). The code has all three, and the same document says revocation exists at line 606. | `ARCHITECTURE.md`; `apps/api/src/storage/index.ts`; `stripe-gateway.ts`; migrations 00045, 00046 | P3 | Reported | Documentation update. |
| CF-18 | `ARCHITECTURE.md:393` says registration assigns a role from the 10-role union. Code accepts only `candidate` or `recruiter`. | `packages/contracts/src/index.ts:108` | P3 | Reported | Documentation update. |
| CF-19 | Docs and comments mention a "banned" status; the user status type has `active`, `pending_verification`, `suspended`, `deactivated` and no `banned`. Any non-active status is treated as restricted. | `packages/domain/src/core.ts:26`; `server.ts:824` | P3 | Reported | Documentation update. |
| CF-20 | `assertPlatformAdmin` also accepts the string `admin`, and a hiring list includes `employer`; neither is in the `Role` union, so no account can hold them. Harmless dead branches. | `admin.ts:45`; `server.ts:3951` and `server.ts:8300` (the line drifted from the investigator's 8307) | P3 | Confirmed (adversarial review) | Remove or document. |
| CF-21 | The domain layer (`auth.ts:120-123`) silently falls back to a random per-process key when `TOKEN_SECRET` is shorter than 32 characters, so every session would die on restart. The config layer rejects such a value (`env.ts:44` requires at least 32 characters when set, and deployed environments require it). `SECURITY.md:150` is therefore probably right. | `auth.ts:120-123`; `packages/config/src/env.ts:44` | P3 | Reported (corrected by the adversarial review) | Confirm that `validateServerEnv` runs at every boot, including the worker. |
| CF-22 | `ReferenceStatus` has `declined` and `flagged`, but no code sets them; a referee cannot decline. The domain token check is dead code (the real check is in the API). | `work-history-graph.ts:19,555` | P3 | Reported | Decide whether declining is a feature. |
| CF-23 | Background job enqueue errors are logged and swallowed, so the request succeeds and the event is lost. (The two email routes avoid this by returning 503 when the queue fails.) | `server.ts:569-591` | P2 | Reported | Decide per event kind. |
| CF-24 | Job reclaim after a lease expires does not check `attempts`, so a job whose worker keeps crashing can exceed `maxAttempts` before it is marked dead. | `packages/domain/src/background-jobs.ts:443-458` | P3 | Reported | Add an attempts check. |
| CF-25 | The UI offers application drafts and job alerts while those routes are in-memory and lost on restart (issue #48). Learning, Network and Resumes pages say so; the drafts page does not. | `durability.ts`; web pages | P2 | Reported | Make durable or label. |
| CF-26 | Settings offers email and summary-frequency toggles; no digest sending or notification email was found. The Privacy page claims k >= 10 with Laplace noise and "purge within 30 days"; the investigator found no implementation (erasure scheduler unresolved, issue #45). | `SettingsPage.tsx:300-316`; `PrivacyPage.tsx:329,419` | P2 | Reported | Verify or remove the claims. |
| CF-27 | Interview code evaluation is simulated: the result depends on the text of the code. It fails closed in staging and production only (`server.ts:3609-3616`). A second placeholder exists for challenge submissions (`assessment.ts:132`); it is mitigated because the evidence is stored unverified with `executed:false`. | `technical-interview.ts:530-536`; `assessment.ts:132` | P1 | Confirmed (adversarial review), open - decision needed | Issue #49: sandbox or disable. |
| CF-28 | Routes `/portfolio`, `/resumes`, `/network`, `/learning`, `/career`, `/assessments` have no navigation link; `GET /challenges` is public while `/assessments` is guarded. | `Layout.tsx`; `App.tsx` | P3 | Reported | Product decision. |
| CF-29 | `Layout.tsx:91` reads `.roles` from the stored user, whose type declares `role` but also has an index signature, so it compiles. The login response does return `roles`. Whether navigation is wrong before the session loads was not tested. | `Layout.tsx:91`; `session.ts:14-21` | P3 | Reported, speculative (corrected by the adversarial review) | Align the type if it is confusing. |
| CF-30 | Concurrent Checkout sessions can both be paid; the second subscription is ignored but still billed. Disputes and voided invoices are not handled. The Stripe webhook shares the global rate limit. | `docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md` O-1 to O-5 | P2 | Confirmed, open - decision needed | Pricing and entitlement policy (issue #50). |

## Decision records

| Conflict | Options considered | Decision | Approval |
| -------- | ------------------ | -------- | -------- |
| CF-01 to CF-04 | Keep the data as a demo; label it as sample; remove it | Remove. A figure about people shown without a source misstates the product; the `FEATURE_STATUS` rule is that nothing is called implemented without evidence. Honest empty states replace it. | Requested by the owner in the current goal ("only dummy, mock, sample, fake things ... remove all"). |
| CF-02 | Count rows; count people | Count people. k-anonymity protects individuals, so the unit must be a person. | Within `AGENTS.md` authority (defect fix). |
| CF-07 | Time window only; resolve the payment to its subscription | Resolve through invoice payments and fail safe when unresolved. | Owner chose "refund revokes access"; CodeRabbit finding fixed. |
| CF-10, CF-11, CF-12, CF-14, CF-15, CF-27, CF-30 | Several | **No decision made.** Each changes security architecture, schema or product behaviour and needs an owner. | Not approved. |


## Documentation reconciliation at source 431c425a (2026-10-23)

CF-17 and CF-18 are resolved as documentation changes: architecture now describes
PostgreSQL, Stripe, revocation and candidate/recruiter-only self-registration.
CF-19 is clarified: current account access uses active/restricted/erased handling,
not an invented `banned` enum. CF-13 is partially advanced in source: the manual
hosted adapter and migration 00054 exist, but complete applied state and isolation
remain unverified. CF-10's source TTL is 30 days; older ?no expiry? audit rows are
historical. No product/security decision or code fix was made by this pass.

Additional source discrepancy: AI flags use `z.coerce.boolean()` in `env.ts`, so
textual `false` is not a strict false parser. Documented in operations; code is
unchanged. The maintenance dry-run writes a log and explicit flags may avoid the
no-argument confirmation branch; the current guide now states these limits.

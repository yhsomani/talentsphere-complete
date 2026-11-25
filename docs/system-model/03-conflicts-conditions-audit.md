# System model: conflicts, conditions and audit

> **Status.** Dated verification record (2026-10-23). Re-check any `path:line` before relying on it.
>
> **What this file holds.** The conflict register (code vs documents vs tests), the condition and business-rule matrix, and the completeness audit of the system model.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| System model 03 — Conflict register and decision records | `docs/system-model/03-conflict-register.md` |
| System model 04 — Condition and business-rule matrix | `docs/system-model/04-conditions.md` |
| System model 05 — Audit, traceability sample and limits | `docs/system-model/05-audit.md` |

## System model 03 — Conflict register and decision records

_Former file: `docs/system-model/03-conflict-register.md`._

Status values used: **Verified** (fixed here and the check passed), **Confirmed** (the lead re-read the code and the contradiction holds), **Reported** (an investigator read it; not independently re-read), **Open - decision needed** (needs an owner; `AGENTS.md` says to escalate, not guess), **Blocked** (external access or approval missing).

Severity: P0 security or financial integrity, P1 broken core behaviour, P2 integrity or reliability gap, P3 documentation or minor.

How the "council" was run: five read-only investigators (auth, jobs, work history, data and worker, web app) worked independently and each reported contradictions with citations. They did not see each other's output. The lead then re-read the code for the items marked Confirmed. A separate adversarial pass (the [audit and limits section](#system-model-05--audit-traceability-sample-and-limits) (formerly `05-audit.md`), Audit H) challenged the claims. No investigator had authority to approve a change; decisions marked "needs owner" are not approved.

### Resolved in this work

| ID | Conflict | Evidence | Sev | Status | Fix and check |
| -- | -------- | -------- | --- | ------ | ------------- |
| CF-01 | The API served invented people and demand: 60 career transitions, market signals for four skills, baseline signals made up in three forecast routes. Benchmarks and forecasts presented statistics about people who do not exist. | `fb38674b` removed `server.ts` seed blocks | P1 | Verified | Removed; forecast routes return no ranking or 404 until data is recorded. Tests record their own data. `pnpm test` and the two e2e specs pass. |
| CF-02 | The benchmark "at least 20 people" rule counted rows, so one person posting 20 moves published their own salary change. | `packages/domain/src/career-trajectory.ts` | P1 | Verified | Counts distinct people. New unit tests (3). |
| CF-03 | The benchmark carried a constant retention rate of 88.5 and cited a data source (`verified_ats_outcomes`) that is never collected. | same file | P2 | Verified | Field and claim removed. |
| CF-04 | A sample course (stub lessons, nil-UUID instructor), a sample challenge and 35 invented learner outcomes (80% hire rate) were loaded at boot and shown as real. | `server.ts` LMS, challenges and learning-impact sections | P1 | Verified (unit and integration); full e2e re-run result in the [audit and limits section](#system-model-05--audit-traceability-sample-and-limits) (formerly `05-audit.md`) | Removed; `tests/helpers/content.ts` creates content through the API. |
| CF-05 | Account erasure could not finish after Stripe had deleted the customer (retry got `resource_missing` and returned 503). | `stripe-gateway.ts` | P2 | Verified | Treated as done; 2 unit tests. |
| CF-06 | A Stripe checkout for a customer already linked to another account hit a unique constraint and Stripe retried for days. | `billing-stripe.ts` | P3 | Verified | Event ignored; integration test. |
| CF-07 | Refund handling matched a refunded charge to the customer's subscription by time only. | CodeRabbit review of `9a7bc350` | P1 | Verified | Resolved through Stripe invoice payments; integration tests. |

### Open conflicts

| ID | Conflict (claim A versus claim B) | Evidence | Sev | Status | Needed |
| -- | ---------------------------------- | -------- | --- | ------ | ------ |
| CF-10 | The referee token never expired: only a hash was stored and compared, yet the error text said "Invalid or expired reference token" and `SECURITY.md` says the link dies on use. | `server.ts` referee view and submit routes | P2 | **Verified (fixed)**: the link stops working 30 days after the request (uses the stored `requestedAt`; no schema change). View returns 404, submit returns 403. Integration test with a moved clock. | Owner may change the 30-day limit. |
| CF-11 | Email-ownership check is meant to prove the person works at the company, but the domain match runs only when the role has a company with a website. Otherwise any non-webmail address passes. A candidate can verify a mailbox they control. | `server.ts:12274-12281`; `ARCHITECTURE.md:332` | P1 | Confirmed, open - decision needed | Decide whether verification requires a company with a website. This changes product behaviour. |
| CF-12 | Any signed-in account (including a candidate) could post a market signal, and signals feed the public forecasts. | `server.ts` market-signals route | P2 | **Verified (fixed)**: the route now requires a platform admin; 403 for anyone else. Integration and e2e tests cover the refusal. | Decide later whether a verified external source may also supply data. |
| CF-13 | Hosted Supabase: migrations 00016, 00018, 00022 and 00023 reference `auth.users(id)`, but the app keeps users in `public.users` (decision D4). On hosted Supabase those inserts would fail, and `auth.uid()` policies do not recognise the app's own tokens. The migration runner refuses hosted Supabase for this reason. | `supabase/migrations/00016`, `00018`, `00022`, `00023`; `docs/engineering/DATABASE.md` (hosted migration gate section, former `HOSTED_SUPABASE_MIGRATION_GATE.md`); `scripts/lib/pg.mjs` | P1 | Confirmed, Blocked | Owner choice of a hosted-specific path (issue #46); rehearse on a disposable project. |
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
| CF-25 | The UI offers application drafts and job alerts while those routes are in-memory and lost on restart (issue #48). Learning, Network and Resumes pages say so; the drafts page does not. **Update 2026-11-25:** application drafts are now durable (`application-draft-store.ts`, migration 00056, PR #87), and no page in `apps/web/src` calls the draft or job-alert routes, so the UI half of this finding no longer reproduces. **Update 2026-11-25 (later):** job alerts are durable too (`job-alert-store.ts`, table from migration 00018). | `durability.ts`; web pages | P2 | Resolved 2026-11-25 | None. |
| CF-26 | Settings offers email and summary-frequency toggles; no digest sending or notification email was found. The Privacy page claims k >= 10 with Laplace noise and "purge within 30 days"; the investigator found no implementation (erasure scheduler unresolved, issue #45). | `SettingsPage.tsx:300-316`; `PrivacyPage.tsx:329,419` | P2 | Reported | Verify or remove the claims. |
| CF-27 | Interview code evaluation is simulated: the result depends on the text of the code. It fails closed in staging and production only (`server.ts:3609-3616`). A second placeholder exists for challenge submissions (`assessment.ts:132`); it is mitigated because the evidence is stored unverified with `executed:false`. | `technical-interview.ts:530-536`; `assessment.ts:132` | P1 | Confirmed (adversarial review), open - decision needed | Issue #49: sandbox or disable. |
| CF-28 | Routes `/portfolio`, `/resumes`, `/network`, `/learning`, `/career`, `/assessments` have no navigation link; `GET /challenges` is public while `/assessments` is guarded. | `Layout.tsx`; `App.tsx` | P3 | Reported | Product decision. |
| CF-29 | `Layout.tsx:91` reads `.roles` from the stored user, whose type declares `role` but also has an index signature, so it compiles. The login response does return `roles`. Whether navigation is wrong before the session loads was not tested. | `Layout.tsx:91`; `session.ts:14-21` | P3 | Reported, speculative (corrected by the adversarial review) | Align the type if it is confusing. |
| CF-30 | Concurrent Checkout sessions can both be paid; the second subscription is ignored but still billed. Disputes and voided invoices are not handled. The Stripe webhook shares the global rate limit. | `docs/reports/AUDITS_2026-10.md` (Stripe and Supabase audit 2026-10-23, former `STRIPE_SUPABASE_AUDIT_2026-10-23.md`) O-1 to O-5 | P2 | Confirmed, open - decision needed | Pricing and entitlement policy (issue #50). |

### Decision records

| Conflict | Options considered | Decision | Approval |
| -------- | ------------------ | -------- | -------- |
| CF-01 to CF-04 | Keep the data as a demo; label it as sample; remove it | Remove. A figure about people shown without a source misstates the product; the `FEATURE_STATUS` rule is that nothing is called implemented without evidence. Honest empty states replace it. | Requested by the owner in the current goal ("only dummy, mock, sample, fake things ... remove all"). |
| CF-02 | Count rows; count people | Count people. k-anonymity protects individuals, so the unit must be a person. | Within `AGENTS.md` authority (defect fix). |
| CF-07 | Time window only; resolve the payment to its subscription | Resolve through invoice payments and fail safe when unresolved. | Owner chose "refund revokes access"; CodeRabbit finding fixed. |
| CF-10, CF-11, CF-12, CF-14, CF-15, CF-27, CF-30 | Several | **No decision made.** Each changes security architecture, schema or product behaviour and needs an owner. | Not approved. |

### Documentation reconciliation at source 431c425a (2026-10-23)

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

## System model 04 — Condition and business-rule matrix

_Former file: `docs/system-model/04-conditions.md`._

Each row is a condition read from the code. "Unknown or failed evaluation" is given where the code defines it; where the investigators did not read it, the cell says so. Status: **Read** (investigator cited `path:line`), **Spot-checked** (the lead re-read it), **Tested** (a named test run on 2026-10-23 exercises it). Conflict IDs refer to the [conflict register](#system-model-03--conflict-register-and-decision-records) (formerly `03-conflict-register.md`).

Abbreviations: S = `apps/api/src/server.ts`, D = `packages/domain/src/work-history-graph.ts`, C = `packages/contracts/src/index.ts`, A = `packages/domain/src/auth.ts`.

### Authentication and sessions (Read)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| AU-01 | Email already registered | 409 | account created, 201 | S:967 | | Read |
| AU-02 | Sign-up role is candidate or recruiter | accepted | 400 | C:108 | CF-18 | Read |
| AU-03 | Password length 8 to 256 | accepted | 400 | C:101,124 | | Read |
| AU-04 | Login password correct for a known email | 200 and token | 401 with the same text as unknown email (decoy hash runs) | S:1008-1016 | | Read |
| AU-05 | Login attempts under 10 per 15 min per IP and email | allowed | 429 | S:938-949 | | Read |
| AU-06 | Sign-ups under 20 per 15 min per IP | allowed | 429 | S:950-956 | | Read |
| AU-07 | Global requests under 300 per 60 s per user or IP | allowed | 429 | S:614-628 | | Read |
| AU-08 | Token has a `sessionId` | sign-out revokes it | `{ended:false}`; lives until expiry (24 h) | S:1134 | | Read |
| AU-09 | `issuedAt` before `sessionsValidAfter` | 401 | pass | S:854-861 | | Read |
| AU-10 | Account status not active and route not allowed | 403 | pass | S:863-872 | CF-19 | Read |
| AU-11 | No account row | pg storage: 401; memory storage: signed claims trusted | n/a | S:842-845 | | Read |
| AU-12 | Only a platform admin may change roles; may not remove their own admin role | allowed | 403 or rejected | S:10739-10791 | CF-20 | Read |
| AU-13 | `TOKEN_SECRET` at least 32 characters | used as the key | random per-process key (sessions die on restart) | A:120-123 | CF-21 | Read |
| AU-14 | Web: a token string exists | page renders | redirect to `/login?return=` (no role check) | W/App.tsx:40-47 | | Read |
| AU-15 | `return` starts with one slash | follow it | go to `/dashboard` | W/LoginPage.tsx:11 | | Read; hostile `return` values tested in `tests/e2e/ui-sweep.spec.ts` |

### Jobs and applications (Read)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| JB-01 | Caller is a member of the organization or platform admin (BR-12) | continue | 403 | S:1881 | CF-14 | Read |
| JB-02 | Caller has the recruiter or platform_admin role | job created as draft | 403 | jobs.ts:61 | CF-16 | Read |
| JB-03 | Job transition is in the allowed table | continue | 409 | jobs.ts:28 | CF-15 | Read |
| JB-04 | Job is published | visible to everyone | 404 for non-managers | S:1962 | | Read |
| AP-01 | Caller is a recruiter without the candidate role (BR-02) | 403 | continue | applications.ts:41 | | Read |
| AP-02 | Job is published (BR-16) | continue | 422 | applications.ts:47 | | Read |
| AP-03 | An active application exists for this job and candidate (BR-15) | 409 | created as submitted | applications.ts:56; migration 00043 partial unique index | | Read |
| AP-04 | Application transition is in the table (BR-41) | continue | 409 | applications.ts:80 | | Read |
| AP-05 | Target is withdrawn: caller is the candidate or admin | allowed | 403 | applications.ts:90 | | Read |
| AP-06 | Other target: caller is any member of the job's organization or admin (BR-40) | allowed | 403 | S:2763 | CF-14 | Read |
| AP-07 | Application draft saved | in memory only, lost on restart (until 2026-11-25; now written to `application_drafts` in pg mode, `application-draft-store.ts`) | n/a | durability.ts | CF-25 | Read |

### Verified work history (Read; WH-04, WH-05 Spot-checked)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| WH-01 | Dates valid, none in the future, end after start | role created | VALIDATION_FAILED | D:144-185 | | Read |
| WH-02 | Production or staging and email delivery not fully configured (`emailDeliveryConfigured`: `EMAIL_PROVIDER=brevo`, `BREVO_API_KEY`, `EMAIL_FROM`, https `APP_URL`; was Resend at the time of this audit) | 503, nothing stored | continue | S:12286,12418 | | Read; `tests/integration/email-delivery-gate.test.ts` |
| WH-03 | Address is not webmail or disposable | continue | VALIDATION_FAILED | D:427 | | Read |
| WH-04 | Role has a company with a website | the address domain must match it | any non-webmail domain passes | S:12274-12281 | CF-11 | Spot-checked |
| WH-05 | Referee token present, hash matches and the request is under 30 days old | continue | 404 on view, 403 on submit (`UNAUTHORIZED` maps to 403) | S `referenceLinkExpired` and the two routes | CF-10 | Tested (`tests/integration/work-history-graph.test.ts`) |
| WH-06 | Email challenge expired (15 min) | deleted, VALIDATION_FAILED | continue | S:12339 | | Read |
| WH-07 | Wrong-code attempts below 5 | attempts + 1 and VALIDATION_FAILED | RATE_LIMIT_EXCEEDED; challenge kept | S:12343-12357 | | Read |
| WH-08 | Referee equals the candidate (id or email) | CONFLICT | continue | D:500-507 | | Read |
| WH-09 | Reference status is requested | submit allowed | INVALID_STATE_TRANSITION | D:548 | CF-22 | Read |
| WH-10 | Ratings are integers 1 to 5 | continue | VALIDATION_FAILED | D:568 | | Read |
| WH-11 | Verification score thresholds | 25 verified, 50 silver, 80 gold; email +40 | lower tier | D:262, D:343-357 | | Read |
| WH-12 | Viewer is not the owner or an admin | email hidden; referee names and ratings hidden; average shown only with at least 3 ratings | full detail | S:12712; D:606,818 | | Read |
| WH-13 | Only the owner may delete a role | allowed | 403 (admins too) | S:12777 | | Read |

### Career benchmarks and forecasts (Verified: unit, integration and e2e tests)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| CB-01 | At least 20 different people made the move (BR-160) | benchmark published | `insufficient_data`; no figures | `career-trajectory.ts`; `tests/unit/career-trajectory-domain.test.ts` | CF-02 | Tested |
| CB-02 | Caller asks for a lower threshold | ignored; floor stays 20 | n/a | S career benchmarks route | | Tested |
| CB-03 | Skill has recorded market signals | forecast computed | 404 (single skill); skill omitted (ranking) | S forecast routes | CF-01 | Tested |
| CB-04 | Who may record a market signal | any signed-in account | 401 when anonymous | S market-signals route | CF-12 | Spot-checked |
| LI-01 | Learner is enrolled and has not recorded an outcome (REV-01) | outcome recorded | 403 or 409 | S learning-impact route | | Tested |
| LI-02 | Cohort of at least 30 outcomes (BR-189) | impact published | insufficient-data message | `learning-impact.ts` | CF-04 | Tested |

### Billing and Stripe (Tested: `tests/integration/stripe-billing.test.ts`, `tests/unit/stripe-gateway.test.ts`)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| BL-01 | `BILLING_MODE` is stripe | Stripe routes active | routes answer 503 "not enabled" | S ~10240 | | Tested |
| BL-02 | Signature valid over the raw body | event processed | 401, nothing changed | stripe-gateway.ts | | Tested |
| BL-03 | Event id already recorded | replayed, no change | processed | migration 00052 unique index | | Tested |
| BL-04 | Subscription event older than stored state | recorded only | state updated | `stripe-billing.ts` | | Tested |
| BL-05 | Subscription price in the server catalog and status active or trialing | paid tier and entitlements | free tier | `stripe-billing.ts` | | Tested |
| BL-06 | Checkout while a paid subscription is live | 409 | session created | `billing-stripe.ts` | CF-30 | Tested |
| BL-07 | Full refund of the live subscription's current-period charge | cancel at Stripe, access ends | recorded only | `billing-stripe.ts` | CF-07 | Tested |
| BL-08 | Customer already linked to another account | event ignored | link created | `billing-stripe.ts` | CF-06 | Tested |
| BL-09 | Deployed with `BILLING_MODE=simulated` | refused at boot | allowed | env.ts | | Read |

### Boot, storage and jobs (Read)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| ST-01 | `STORAGE`: explicit, else process env, else memory under test, else pg | n/a | n/a | storage/index.ts:275-276 | | Read |
| ST-02 | pg and database unreachable | refuse to start | continue | S:523-530 | | Read |
| ST-03 | Advisory lock (718201,1) acquired | continue | refuse: second writer | storage/index.ts:142-150 | | Read |
| ST-04 | Lease lost while running | 503 on every request | normal | S:546-558 | | Read |
| ST-05 | Deployed with memory storage, weak or published token secret, PBKDF2 below 210000, default database URL | exit 1 | continue | env.ts:189-214 | | Read |
| ST-06 | Job handler outcome | success completes; permanent error fails; other error retries below 3 attempts then dead; no handler is dead | n/a | background-jobs.ts:108-115 | CF-24 | Read |
| ST-07 | Worker heartbeat 45 s or newer | alive | degraded | storage/index.ts:180 | | Read |
| ST-08 | Route not in the durable or stateless lists | response carries `x-talentsphere-durability: ephemeral` | no header | durability.ts:123-127 | CF-25 | Read |

### Rules whose evaluation depends on time, configuration or concurrency

- Time: token expiry (24 h), email challenge (15 min), Stripe signature tolerance (300 s), job lease (60 s), worker staleness (45 s).
- Configuration: every `ST-05` row, `BL-01`, the email-delivery gate (`WH-02`, Brevo since Resend was replaced), `NODE_ENV` (development logs codes instead of sending).
- Concurrency: `persist()` refuses when another write to the same record is in flight (409); the application one-active rule is enforced in the database by a partial unique index.

## System model 05 — Audit, traceability sample and limits

_Former file: `docs/system-model/05-audit.md`._

### Commands run and their results (2026-10-23)

| Command | Result |
| ------- | ------ |
| `pnpm test` (unit, integration, security) | 120 files, 1266 tests, all pass |
| `pnpm lint` | passes |
| `tsc -p apps/api --noEmit`, `tsc -p tests --noEmit` | no errors |
| `pnpm build` (approved by the owner for refreshing generated output) | all packages and apps build |
| `pnpm test:e2e` (Playwright, Chromium, one worker) | 256 passed in 5.0 minutes |
| Not run | `pnpm test:pg` (needs `TEST_DATABASE_URL`; no throwaway database was available), any test against live Stripe or the hosted Supabase project, any deployment |

An earlier e2e run found 17 failures in 8 specs that depended on the removed sample course and challenge. They were fixed by creating the content through the API (`tests/e2e/content.ts`) and the run above is the re-run.

### Audits A to I

| Audit | Result | Limit |
| ----- | ------ | ----- |
| A Code to flowchart | Five investigators read the code behind F2 to F7 and cited `path:line`. An independent reviewer re-checked 14 claims: 11 confirmed, 3 corrected in the documents (CF-21, CF-29, the CF-20 citation), 4 omissions added (full Resend requirements, the second simulated evaluator, order of the job-transition checks). | Each diagram was checked by one investigator plus, for some branches, the lead and the reviewer. No diagram was checked against a running system. |
| B Requirements to flowchart | Not done as a full pass. `SSOT.md` and the PRD were only grepped for the topics in the conflict register (job approval, registration roles, token handling). | Most requirement IDs (F-xx, BR-xx) were not traced. |
| C Documentation to code | 21 open discrepancies recorded in the [conflict register](#system-model-03--conflict-register-and-decision-records) (formerly `03-conflict-register.md`) (CF-10 to CF-30). `ARCHITECTURE.md` and `SECURITY.md` were compared for auth, storage, billing and work history only. | Other documents in `docs/` were not compared. |
| D Decision-branch completeness | The diagrams show every branch the investigators reported. Failure of evaluation (unknown, missing input) is shown only where the code defines it. | Branches in code nobody read are absent. |
| E Cross-module consistency | Found: any organization membership authorizes job and applicant actions (CF-14); two different checks for "who is a recruiter" (CF-16); role strings outside the `Role` union (CF-20). | Permission checks across the other roughly 230 routes were not compared. |
| F Conflict closure | Seven resolved and verified (CF-01 to CF-07). The rest are open and each states what is needed. Seven carry a note that no decision was made because the choice belongs to an owner. | None of the open items is accepted as a risk by anyone. |
| G Regression and test coverage | New or changed tests: career benchmark, forecasts, learning impact, LMS, certificates, challenges, Stripe refunds and erasure, settings validation, hostile-input e2e. Everything above ran green. | There is no automated test that the diagrams match the code. |
| H Adversarial review | Run by an independent agent (see Audit A). Its corrections are applied. | It checked 14 claims, not all. It did not read the [condition matrix](#system-model-04--condition-and-business-rule-matrix) (formerly `04-conditions.md`) or the F7 page claims. |
| I Final evidence check | Each completion claim in these documents names a command or a `path:line`. | See limits below. |

### Traceability sample (requirement to code to test)

Complete traceability was not built. The rows below are the ones this work verified.

| Requirement or rule | Code | Test | Flow | Status |
| ------------------- | ---- | ---- | ---- | ------ |
| BR-15 one active application per job and candidate | `applications.ts:56`; migration 00043 | `tests/integration/jobs-applications.test.ts` | F3 A5 | Test passes |
| BR-160 benchmarks need at least 20 people | `career-trajectory.ts` | `tests/unit/career-trajectory-domain.test.ts`, integration and e2e career specs | CB-01 | Verified |
| BR-189 learning impact needs a cohort of 30 | `learning-impact.ts` | `tests/integration/learning-impact.test.ts`, e2e spec | LI-02 | Verified |
| Webhook signature over the raw body, replay safe | `stripe-gateway.ts`, migration 00052 | `tests/integration/stripe-billing.test.ts` | F5 H1, H12 | Test passes (fake gateway) |
| Production email delivery gate | `server.ts:12286,12418` | `tests/integration/email-delivery-gate.test.ts` | F4 V2 | Test passes |
| One-time referee link (no expiry) | `server.ts:12544` | none for expiry | F4 G2 | Gap: CF-10 |

### Behaviour with no documented requirement found

The investigators did not search for undocumented behaviour systematically. The ones noticed: the job-alert evaluation on publish (only in memory), the `/challenges` list being public, and the unlinked routes in CF-28. None was classified further.

### Limitations

- Not every route, page and migration was read. `apps/api/src/server.ts` has 278 unique routes. `02-flows.md` models auth, jobs and applications, work history, billing and boot with diagrams; `06-route-authorization.md` records the authorization and persistence of about 170 more routes from four further investigators, without diagrams. Per-route request validation schemas, several domain helpers and the storage SQL for those groups were not read.
- GitHub issue threads were read through the public API only; private discussion and approved stakeholder decisions were not accessible.
- No production or staging behaviour was observed. The Supabase project was inspected read-only (one keepalive migration, no application tables).
- The "council" was five investigators and one reviewer, each an AI agent working from the code. They did not debate each other, and no human approved a decision.
- Line numbers drift; two had already drifted during this work.

# System model 04 — Condition and business-rule matrix

Each row is a condition read from the code. "Unknown or failed evaluation" is given where the code defines it; where the investigators did not read it, the cell says so. Status: **Read** (investigator cited `path:line`), **Spot-checked** (the lead re-read it), **Tested** (a named test run on 2026-10-23 exercises it). Conflict IDs refer to `03-conflict-register.md`.

Abbreviations: S = `apps/api/src/server.ts`, D = `packages/domain/src/work-history-graph.ts`, C = `packages/contracts/src/index.ts`, A = `packages/domain/src/auth.ts`.

## Authentication and sessions (Read)

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

## Jobs and applications (Read)

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
| AP-07 | Application draft saved | in memory only, lost on restart | n/a | durability.ts | CF-25 | Read |

## Verified work history (Read; WH-04, WH-05 Spot-checked)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| WH-01 | Dates valid, none in the future, end after start | role created | VALIDATION_FAILED | D:144-185 | | Read |
| WH-02 | Production or staging and Resend not fully configured | 503, nothing stored | continue | S:12286,12418 | | Read; `tests/integration/email-delivery-gate.test.ts` |
| WH-03 | Address is not webmail or disposable | continue | VALIDATION_FAILED | D:427 | | Read |
| WH-04 | Role has a company with a website | the address domain must match it | any non-webmail domain passes | S:12274-12281 | CF-11 | Spot-checked |
| WH-05 | Referee token present and hash matches | continue | 401 (no expiry check exists) | S:12544 | CF-10 | Spot-checked |
| WH-06 | Email challenge expired (15 min) | deleted, VALIDATION_FAILED | continue | S:12339 | | Read |
| WH-07 | Wrong-code attempts below 5 | attempts + 1 and VALIDATION_FAILED | RATE_LIMIT_EXCEEDED; challenge kept | S:12343-12357 | | Read |
| WH-08 | Referee equals the candidate (id or email) | CONFLICT | continue | D:500-507 | | Read |
| WH-09 | Reference status is requested | submit allowed | INVALID_STATE_TRANSITION | D:548 | CF-22 | Read |
| WH-10 | Ratings are integers 1 to 5 | continue | VALIDATION_FAILED | D:568 | | Read |
| WH-11 | Verification score thresholds | 25 verified, 50 silver, 80 gold; email +40 | lower tier | D:262, D:343-357 | | Read |
| WH-12 | Viewer is not the owner or an admin | email hidden; referee names and ratings hidden; average shown only with at least 3 ratings | full detail | S:12712; D:606,818 | | Read |
| WH-13 | Only the owner may delete a role | allowed | 403 (admins too) | S:12777 | | Read |

## Career benchmarks and forecasts (Verified: unit, integration and e2e tests)

| ID | Condition | True | False | Evidence | Conflict | Status |
| -- | --------- | ---- | ----- | -------- | -------- | ------ |
| CB-01 | At least 20 different people made the move (BR-160) | benchmark published | `insufficient_data`; no figures | `career-trajectory.ts`; `tests/unit/career-trajectory-domain.test.ts` | CF-02 | Tested |
| CB-02 | Caller asks for a lower threshold | ignored; floor stays 20 | n/a | S career benchmarks route | | Tested |
| CB-03 | Skill has recorded market signals | forecast computed | 404 (single skill); skill omitted (ranking) | S forecast routes | CF-01 | Tested |
| CB-04 | Who may record a market signal | any signed-in account | 401 when anonymous | S market-signals route | CF-12 | Spot-checked |
| LI-01 | Learner is enrolled and has not recorded an outcome (REV-01) | outcome recorded | 403 or 409 | S learning-impact route | | Tested |
| LI-02 | Cohort of at least 30 outcomes (BR-189) | impact published | insufficient-data message | `learning-impact.ts` | CF-04 | Tested |

## Billing and Stripe (Tested: `tests/integration/stripe-billing.test.ts`, `tests/unit/stripe-gateway.test.ts`)

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

## Boot, storage and jobs (Read)

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

## Rules whose evaluation depends on time, configuration or concurrency

- Time: token expiry (24 h), email challenge (15 min), Stripe signature tolerance (300 s), job lease (60 s), worker staleness (45 s).
- Configuration: every `ST-05` row, `BL-01`, the Resend gate (`WH-02`), `NODE_ENV` (development logs codes instead of sending).
- Concurrency: `persist()` refuses when another write to the same record is in flight (409); the application one-active rule is enforced in the database by a partial unique index.

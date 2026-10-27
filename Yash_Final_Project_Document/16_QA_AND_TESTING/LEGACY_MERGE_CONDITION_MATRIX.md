# Legacy Merge B-16b: Condition and Business-Rule Matrix (62 Rules, Prior Attempt) as Test-Design Seeds

Doc ID: LGM-B-16B · Owner: QA Architect · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: QA-CAT, QA-CAT-R2, BR-T registry (`../06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md`), LEGACY_RULE_CROSSWALK, OPEN-43 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/system-model/04-conditions.md` (10 KB; the "Condition and business-rule matrix (62 rules)").

## 0. Frame

- **Every row in section 3 is an observation about an earlier attempt**, read from its code on 2026-10-23 (columns: Condition, True outcome, False outcome, Evidence as `path:line` in that repository, Conflict id, Status Read / Spot-checked / Tested). There is no code here: the Evidence and Status columns are provenance of the *prior attempt* and are not claims about this project. Abbreviations S, D, C, A in the source refer to prior-attempt files (API server, work-history domain module, contracts, auth module).
- Why it is valuable now: each row is a *condition with both branches defined*, which is exactly the shape of a decision-table test. This file turns the matrix into (a) a rule-to-target mapping and (b) a list of branch conditions that the new implementation must test.
- The business rule ids in the matrix (BR-02, BR-12, BR-15, BR-16, BR-25, BR-40, BR-41, BR-160, BR-180, BR-189, REV-01) are **legacy registry ids** (legacy `BUSINESS_RULE_REGISTRY` / SSOT section 19). They are not the target BR-T ids. The row-level legacy-to-target comparison is `../06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.csv` (OPEN-43). Do not treat the mapping in section 2 as approved.

## 1. Time, configuration and concurrency dependencies (legacy summary section, preserved)

- **Time:** session token expiry 24 h; email challenge 15 min; payment-provider signature tolerance 300 s; job lease 60 s; worker staleness 45 s.
- **Configuration:** every ST-05 row (deployed refusals), BL-01 (billing mode), the email-delivery gate WH-02, `NODE_ENV` (development logs codes instead of sending).
- **Concurrency:** the single write function refused a write when another write to the same record was in flight (409); the one-active-application rule was enforced in the database by a partial unique index.
- **Target requires:** every time constant above is a named configuration value with a documented default and a moved-clock test; the target values differ where deliberately redesigned (reference link 14 days vs 30 days; sessions per ADR-T06; job leases fenced per ADR-T09) - those differences are decisions, not drift.

## 2. Rule groups, target mapping and target-side test requirements

| Group (ids) | What the group defines | Target mapping | Target-side test requirement (additions beyond the table) |
|---|---|---|---|
| AU-01..AU-15 authentication and sessions | duplicate email 409; role at signup restricted to candidate/recruiter; password length 8-256; login uniform error with decoy hash; login 10/15 min per IP+email; signup 20/15 min per IP; global 300/60 s; sign-out revocation only when token has a session id; issued-before-cutoff 401; non-active status 403 except allowed routes; no account row -> 401 (durable) / signed claims trusted (memory); only platform admin may change roles and not their own admin role; secret >= 32 chars else random key; web guard checks token presence only; `return` must start with one slash | SEC-02, API-STD rate classes (target RL-AUTH 20/10 min per IP and 10/15 min per identifier), BR-T auth rules, FF-01 | (a) no "memory mode trusts signed claims" path exists in target - delete AU-11's memory branch; (b) AU-12 admin cannot demote/suspend self: keep as rule and test; (c) AU-14: client guard is UX only - add test that API denies independent of UI; (d) AU-15 hostile `return` values table-driven test (absolute URL, protocol-relative `//host`, backslash, encoded slash); (e) password length bound: target password policy per SEC-02 (check minimum/maximum parity) |
| JB-01..JB-04, AP-01..AP-07 jobs and applications | member of org or admin (BR-12); recruiter/admin role to create; job transition table; published job visible to everyone, drafts 404 to non-managers; recruiter without candidate role cannot apply (BR-02); only published jobs accept applications (BR-16); one active application per job+candidate (BR-15); application transition table (BR-41); withdraw only by candidate or admin; other transitions by any org member or admin (BR-40, flagged CF-14); draft saved in memory only (CF-25) | SM-JOB, SM-APPLICATION, BR-T001 (duplicate application), org-role RBAC | decision-table tests for every transition pair (allowed/forbidden) per role; **change from legacy**: "any org member" becomes role-scoped (OPEN-44); drafts durable; add explicit "recruiter without candidate role" rule only if it is still a product rule (verify in LEGACY_RULE_CROSSWALK) |
| WH-01..WH-13 verified work history | date validity (none in the future, end after start); delivery-config gate returns 503 with nothing stored; webmail/disposable addresses rejected; domain match only if role has a company with a website (CF-11); referee token valid under 30 days (CF-10); email challenge expires at 15 min; 5 wrong attempts then rate-limit; referee cannot be the candidate (id or email); reference must be in `requested` status to submit; ratings integers 1-5; score thresholds: verified 25, silver 50, gold 80, email +40; viewer privacy: email hidden, referee names and ratings hidden, average shown only with at least 3 ratings; only the owner may delete a role (admins too are refused) | verification module (DOM-06), SM-REFERENCE, INV-T05, ladder ADR-T14, UJ referee journey | keep all rule rows as acceptance tests; **open**: scoring weights (WH-11) are policy - adopt, redesign or retire in OPEN-43 review; WH-12 privacy thresholds (min 3 ratings) must be reconciled with cohort k (OPEN-25); WH-13 "admins too refused" must be reconciled with support-access grants (INV-T18) |
| CB-01..CB-04, LI-01..LI-02 career benchmarks and learning impact | at least 20 distinct people (BR-160) else `insufficient_data` with no figures; caller cannot lower the threshold; forecasts only from recorded signals (404 or omitted when none); who may record a market signal (later fixed: admin only); learner enrolled and no existing outcome (REV-01); cohort of at least 30 outcomes (BR-189) else insufficient-data message | BR-T analytics rules (k floors), OPEN-25 | test that the floor counts distinct people (the prior defect CF-02 counted rows); test that client cannot override the floor; no seeded/fabricated data anywhere (CF-01/CF-04) |
| BL-01..BL-09 billing | billing-mode off -> 503 "not enabled"; invalid signature 401 and nothing changes; event id already recorded -> replay no-op; subscription event older than stored state -> record only; price in server catalog and status active/trialing -> paid tier; checkout while a paid subscription is live -> 409; full refund of live subscription current-period charge -> cancel at provider, access ends; customer already linked to another account -> event ignored; `simulated` mode refused at boot in deployed envs | ADR-T15, INV-T17, INT-01 | keep as webhook test matrix; add dispute and voided-invoice branches (L-B13-02); drop `simulated` mode |
| ST-01..ST-08 boot, storage and jobs | storage selection precedence; DB unreachable -> refuse to start; advisory lock failure -> refuse (second writer); lease lost -> 503 on every request; deployed config refusals (memory storage, weak/published token secret, PBKDF2 iterations below 210000, default database URL) -> exit 1; job handler outcomes (success completes, permanent error fails, other error retries below 3 attempts then dead, no handler -> dead); worker heartbeat 45 s -> alive/degraded; non-durable route carries durability header | BE-01 startup rules; OPS-OBS health; ADR-T09 | writer-lease rows are retired (no read model); keep config-refusal and job-outcome rows; add: reclaim path checks `attempts` (CF-24), abortable handler timeout |

## 3. The matrix (verbatim prior-attempt record)

`?` marks a lost non-ASCII character in the export. "Status" refers to the prior attempt's review.

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
| WH-05 | Referee token present, hash matches and the request is under 30 days old | continue | 404 on view, 403 on submit (`UNAUTHORIZED` maps to 403) | S `referenceLinkExpired` and the two routes | CF-10 | Tested (`tests/integration/work-history-graph.test.ts`) |
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

## 4. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B16-06 | Which of the 62 legacy rules become target BR-T rules (adopt / redesign / retire) - the 171 "no match" rows of the legacy-rule crosswalk include several of these | Product Director + Business Analyst Lead (OPEN-43) |
| L-B16-07 | Verification scoring weights and tiers (+40 email; manager +30 / peer +20 / else +15; two-references +15; average >= 4.0 +10; two endorsed skills +5; cap 100; bronze and `verified` status from 25, silver 50, gold 80) - adopt as target scoring or replace with the evidence ladder only | Product Director |
| L-B16-08 | Minimum ratings shown (3) vs cohort k policy | Privacy Lead (OPEN-25) |

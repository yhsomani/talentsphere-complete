# Legacy Merge B-23a: Conflict Register CF-01..CF-45 (Prior Attempt) with Target Disposition and Consolidated Conflict Index

Doc ID: LGM-B-23A · Owner: Architecture Review Board secretary (with Migration Lead) · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: MIG-01, MIG-DATA-01, DEC-OPEN, DEC-ADR, TRC-04, OPEN-17, OPEN-43, OPEN-44, OPEN-48, OPEN-50, OPEN-52 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/system-model/03-conflict-register.md` (12.8 KB; 7 resolved and 21 open conflicts in the register, plus decision records and the 2026-10-23 reconciliation), `.../system-model/00-index.md`, and the finding rows of `06-route-authorization.md` (CF-31..CF-45, merged in `../14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_ROUTE_AUTHORIZATION_FINDINGS.md`).

## 0. Frame

- **These conflicts are about an earlier attempt.** They compare that attempt's code, documents and tests; they are not conflicts in this project. They matter here because (a) each is a *defect class* the new build must avoid, (b) each states a *decision that was left to an owner* which this project must now take, and (c) the register's method is worth keeping.
- Legacy vocabulary (kept): status **Verified** (fixed and the check passed), **Confirmed** (re-read and holds), **Reported** (investigator read it; not independently re-read), **Open - decision needed** (owner required; the agent rules said escalate, not guess), **Blocked** (external access or approval missing). Severity: **P0** security or financial integrity, **P1** broken core behaviour, **P2** integrity or reliability gap, **P3** documentation or minor.
- Method kept as a pattern (system-model index): change a diagram in the same commit as the code it describes; re-check a `path:line` before relying on it (lines drift); add every new contradiction to the register instead of silently fixing a document. **Target requires** the same discipline in this repository once code exists: contradictions go to a register (`24_RISKS_AND_DECISIONS`), not into silent edits.
- Prior system-model index (preserved): six files - inventory and coverage; flows F1 to F7; conflict register (7 resolved and 21 open); condition matrix (62 rules); route authorization (second coverage pass, about 170 more routes, 6 fixes, 15 further findings CF-31 to CF-45); audit (completeness audit, traceability sample, commands, limitations). Recommended reading order for a new engineer: flows (F1, then the flow you work on), then conditions, then the conflict register "for what to distrust". In this blueprint the equivalents are: flows -> `../25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md`; conditions -> `../16_QA_AND_TESTING/LEGACY_MERGE_CONDITION_MATRIX.md`; conflicts -> this file; route authorization -> `../14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_ROUTE_AUTHORIZATION_FINDINGS.md`; audit -> `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md`; inventory -> `LEGACY_MERGE_INVENTORY_AND_COVERAGE.md`.
- "Council" method of the prior attempt (five independent read-only investigators plus a lead re-check plus an adversarial pass; no investigator could approve a change; decisions marked "needs owner" were **not** approved) is recorded verbatim below. It is a lesson in evidence quality: agent consensus is not an approval (see testing file section 6).

## 1. Target disposition for each prior-attempt conflict (CF-01..CF-30)

"Target handling" states the rule the new build follows; "Decision" cites an existing OPEN id or a local id raised in Ledger B files.

| ID | Prior conflict (short) | Prior status | Target handling | Decision / owner |
|---|---|---|---|---|
| CF-01 | API served invented people and demand (60 transitions, market signals, baseline signals in forecast routes) | Verified fixed (P1) | **Hard rule: no fabricated records presented as real.** Seed only reference data (skill taxonomy, feature-flag defaults); tests create their own data | none (rule adopted; add to PR checklist) |
| CF-02 | Benchmark "at least 20 people" rule counted rows, so one person's 20 moves published their own salary change | Verified fixed (P1) | Cohort rules count **distinct people** | OPEN-25 (k policy) |
| CF-03 | Constant retention rate 88.5 and a data source that was never collected | Verified fixed (P2) | No statistic without a collected source; metric catalog cites source per metric | Analytics Lead |
| CF-04 | Sample course, sample challenge and 35 invented learner outcomes (80% hire rate) loaded at boot | Verified fixed (P1) | Same as CF-01 | none |
| CF-05 | Erasure could not finish after the payment provider had already deleted the customer (retry got `resource_missing`, returned 503) | Verified fixed (P2) | Idempotent erasure steps: "already deleted" = success | saga design (DB-03) |
| CF-06 | Checkout for a customer already linked to another account hit a unique constraint; provider retried for days | Verified fixed (P3) | Ignore with audit record; acknowledge provider | INT-01 |
| CF-07 | Refund matched to subscription by time only (found by automated review) | Verified fixed (P1) | Resolve via invoice payments; fail safe when unresolved | OPEN-33 for policy |
| CF-10 | Referee token never expired though text implied it did | Fixed (P2): 30 days | 14-day expiry in target diagram; owner may change | L-B15-03 |
| CF-11 | Email-ownership check matched domain only when role had a company with a website | Confirmed, open (P1) | Decide rule; never rely on candidate-entered domain | L-B14-05 (OPEN-48) |
| CF-12 | Any signed-in account could post a market signal | Fixed (P2): admin only | Public statistics fed only by authorized sources | Product |
| CF-13 | Hosted managed-database: migrations referenced the provider's `auth.users` while the app kept users in `public.users`; policies keyed on provider functions | Confirmed, blocked (P1) | Application-owned identity; never FK to provider schema | OPEN-14; hosted gate (database file section 6) |
| CF-14 | Any organization membership authorized job management and applicant moves | Reported, open (P2) | Organization-role RBAC | OPEN-44 |
| CF-15 | Job approval described by SSOT, but code let the recruiter self-approve, allowed draft->published, and had no moderation state | Reported, open (P2) | Decide whether approval is required; model in SM-JOB | L-B14-13 |
| CF-16 | Org owner without `recruiter` role passed the route check, refused by the domain layer | Reported (P3) | One role check in one place | OPEN-44 |
| CF-17 | Architecture document claimed no DB client, no payments, no session revocation; code had all three | Reported (P3) -> resolved as documentation change 2026-10-23 | Docs updated in the same change as code (rule above) | none |
| CF-18 | Architecture doc said registration assigns from the 10-role union; code accepted two roles | Reported (P3) -> doc fixed | Self-registration role set stated once | OPEN-44 |
| CF-19 | Docs mentioned a "banned" status; user-status type had `active`, `pending_verification`, `suspended`, `deactivated` | Reported (P3) -> clarified | Account status set defined once (SM-ACCOUNT); sanction states explicit | Domain Architect |
| CF-20 | Admin check also accepted string `admin`; hiring list included `employer`; neither in the role union | Confirmed (P3) | Closed role enum; no string literals outside it | none |
| CF-21 | Domain layer silently fell back to a random per-process key when the secret was short; config layer rejected short secrets | Reported (P3), corrected by adversarial review | Fail closed on weak/missing secret in every deployed environment, single validator used by API and worker | Security Architect |
| CF-22 | Reference statuses `declined` and `flagged` existed but nothing set them; referee could not decline | Reported (P3) | Decide whether a referee can decline or flag | **L-B23-01** (Product Director) |
| CF-23 | Background-job enqueue errors logged and swallowed | Reported (P2) | Transactional outbox | INV-T12 |
| CF-24 | Job reclaim after lease expiry did not check `attempts` | Reported (P3) | Reclaim checks attempts | ADR-T09 |
| CF-25 | UI offered application drafts and job alerts while memory-only | Reported (P2) | Durable | ADR-T05 |
| CF-26 | Settings offered email/digest toggles with no sending; privacy page claimed k >= 10, Laplace noise, purge within 30 days without implementation | Reported (P2) | Claims register | L-B10-02 |
| CF-27 | Interview code evaluation simulated (result depends on text of the code); second placeholder for challenge submissions | Confirmed, open (P1) | Sandbox runner or `unverified` | OPEN-27 (ADR-T13) |
| CF-28 | Several routes had no navigation link; public challenge list while assessments guarded | Reported (P3) | Route registry | L-B10-04 |
| CF-29 | Layout read `.roles` from stored user whose type declared `role` (compiled via index signature) | Reported, speculative (P3) | Typed session object | none |
| CF-30 | Concurrent checkouts could both be paid; disputes and voided invoices unhandled; webhook shared the global rate limit | Confirmed, open (P2) | Specify supersession and dispute policy; own webhook rate class | L-B13-02 |
| CF-31..CF-45 | Route authorization findings | Open | See the 14b file section 2 (target requirement per finding) | OPEN-44, OPEN-48, OPEN-50 |

### 1.1 Decision records of the prior attempt (kept as history)

- CF-01..CF-04: options were keep as demo, label as sample, or remove; **decision: remove** - "A figure about people shown without a source misstates the product; ... nothing is called implemented without evidence. Honest empty states replace it." Approval recorded: requested by the owner in that attempt's goal ("only dummy, mock, sample, fake things ... remove all").
- CF-02: count rows vs count people; **count people** (k-anonymity protects individuals). Within the agent authority (defect fix).
- CF-07: time window vs resolve the payment to its subscription; **resolve through invoice payments and fail safe when unresolved**; owner chose "refund revokes access".
- CF-10, CF-11, CF-12, CF-14, CF-15, CF-27, CF-30: **no decision made** in the prior attempt; each changes security architecture, schema or product behaviour. **This project must decide them** (see disposition column).

## 2. Consolidated index of conflicts and decisions raised by Ledger B merge files

All ids are local to the files listed; owners are suggestions for the ARB secretary to confirm. "Existing OPEN" ids are not renumbered.

| Local id | Subject (legacy vs target) | File | Existing OPEN / owner |
|---|---|---|---|
| L-B11-01 | Realtime scope (client state library already decided FD-F2) | 11 rules and ADRs | OPEN-49 |
| L-B11-02 | ARCH-013..020 IDs vs INV-T01..T20 | 11 rules and ADRs | OPEN-47 |
| L-B11-03 | Three ADR numbering namespaces; retire legacy ones | 11 rules and ADRs | ARB secretary |
| L-B11-04 | Legacy INVARIANT-002/003/004/005/009/011 have no INV-T counterpart | 11 topology lessons | ARB |
| OPEN-52 | ADR-015 hybrid read model vs ADR-T05 SQL-only | 11 rules and ADRs, 12 | existing |
| L-B12-01..03 | Erasure grace policy; schema gap check; DB-04 runner behaviours | 12 | OPEN-08 / Data Architect |
| L-B13-01..03 | 400 vs 422 and 409 vs 422; supersession/dispute policy; registry count provenance | 13 | OPEN-46 / OPEN-33 |
| L-B14-01..07 | PBKDF2 vs argon2id; bearer vs cookie; DPDP/India absent from compliance matrix; classification vocabularies; employer-domain rule; independent-endorsement scoring rule; AI gateway step order | 14 security controls | OPEN-08, OPEN-48, OPEN-43 |
| L-B14-10..13 | Gamification model; activity score visibility; warm-intro path privacy; job approval states | 14 route authorization | OPEN-44, OPEN-50 |
| L-B15-01..03 | Failure-mode mapping; cohort k; reference-link validity | 15 | OPEN-25 |
| L-B16-01..08 | Test retries; compiler unused-code gate; responsive/hostile gates; no-write verification; TEST-id gap checks; rule adoption; scoring weights; min-ratings vs k | 16 | OPEN-43, OPEN-25 |
| L-B17-01..04 | First-admin bootstrap; Oracle VM option; preflight sub-gates; strict boolean parsing | 17 | OPEN-14 |
| L-B18-01..04 | Alert/runbook gap check; email opt-in/secondary provider; heartbeat/readiness; export job | 18 | OPEN-26 |
| L-B10-01..04 | URL-state/loading-state gap; claims register; route registry; orphan pages | 10 | Product Director |
| L-B08-01 | Six-flag offline declaration vs tiers | 08 | Frontend Architect |
| L-B09-01 | Lint for deep imports in bundled mode | 09 | Frontend Platform Lead |
| L-B25-01..03 | AI thresholds; transition comparison; Mermaid validation | 25 | AI owner / Domain Architect |
| L-B23-01 | Can a referee decline or flag? (CF-22) | 23 (this file) | Product Director |
| L-B23-02 | Which prior feature-status claims (section 1 of the inventory file) become requirements vs are dropped | 23 inventory | OPEN-41, OPEN-42 |
| L-B23-04 | Map the 49 prior domain modules to target domains | 23 inventory | Domain Architect |
| L-B23-03 | Reference-data import scope: does any prior database hold real users (relates OPEN-17)? | 23 inventory | OPEN-17 |

## 3. Verbatim prior-attempt conflict register and decision records

The text below is the legacy file after its title (status vocabulary, council method, resolved table, open table, decision records, 2026-10-23 reconciliation). Evidence column cites the earlier attempt's files and issue numbers (for example issue #46 = migrations, #48 persistence, #49 sandbox, #50 billing, #45 deletion policy). `?` marks a lost non-ASCII character in the source export. Statuses are as of that attempt.

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

## 4. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B23-01 | Can a referee decline or flag a request (CF-22)? | Product Director |
| L-B23-03 | Does any earlier database contain real users that must be migrated (OPEN-17)? | Program Director + CPO |

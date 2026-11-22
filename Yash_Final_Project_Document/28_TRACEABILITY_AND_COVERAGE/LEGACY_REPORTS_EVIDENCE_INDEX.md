# Legacy Reports: Evidence Index and Verification Methodology (reports group)

Doc ID: TRC-LEGACY-C · Owner: QA and Traceability Lead (proposed) · Version 1.0 · Status: Proposed (Under Review) · Date: 2026-10-26 · Merge track: C (source group `31_LEGACY_ARCHIVE/docs/reports/**`)

**Relationship (no original file was edited).** This file **supersedes nothing**. It complements, and does not replace, the earlier crosswalks in this folder that index the same audit evidence from other angles: `AUDIT_EVIDENCE_2026-10-21_INDEX.md` (TRC-05), `AUDIT_FEATURE_EVIDENCE_CROSSWALK.csv`, `AUDIT_ROUTE_EVIDENCE_CROSSWALK.md`, `AUDIT_MIGRATION_EVIDENCE_CROSSWALK.md`, `AUDIT_TEST_EVIDENCE_CROSSWALK.md`, `AUDIT_PROBE_EVIDENCE_CROSSWALK.md`, `AUDIT_INVENTORY_EVIDENCE_CROSSWALK.md`, `AUDIT_JOURNEY_EVIDENCE_CROSSWALK.csv`, `AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK.md` (exact issue-comment bodies), `AUDIT_DOCUMENTATION_CROSSCHECK.md`, `ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.md`, `PHASE_GATE_GOVERNANCE_CROSSWALK.md`. This file adds: a catalogue of all 16 files in the reports folder, the **verification methodology** the reports used, a metric timeline, the test inventory, and a structural index of the 17 top-level members of the evidence JSON with record counts. It is linked from `00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md`; the documentation owner must also link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`. Owner instruction behind this merge: *"i dont want to loos information keep everything in use untile it get improved"*.

**Greenfield frame.** No source code exists in this repository and nothing is implemented. The reports are dated evidence about an **earlier attempt**; their pass counts, commit ids and statuses describe that attempt's code and are not evidence about the target. The methodology (how to prove a claim) is reusable; the results are not.

Companion files: `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` (`LES-nn`), `05_FEATURE_SPECIFICATIONS/LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md` (`LGR-nn`), `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (`LRG-nn`).

## 1. Catalogue of the source folder (`31_LEGACY_ARCHIVE/docs/reports/`, 16 files)

Every file begins with a banner: "Historical report: findings, counts and executed checks below belong to the recorded revision/session ... No historical pass is a fresh release certification." Several add their own supersession notes, recorded below. IDs `LEI-01` to `LEI-16`.

| ID | File | Bytes | Date and state audited | Method and purpose | Headline content | Supersession notes inside |
|---|---|---:|---|---|---|---|
| LEI-01 | `PRODUCTION_AUDIT_2026-10-03.md` | 48,541 | 2026-10-03, commit `8db0930`, `main`; revisions A to D | End-user and business-owner audit by static reading of source, routes, tests, migrations; no deployment run | Verdict NOT READY 4.6 of 10; P0-01 to P0-08; journey matrix A to L; feature completeness table; RM-01 to RM-08; TD-01 to TD-10; quick wins; seven-phase remediation; scorecard; confidence High with the limit that no deployed environment was run | Banner: most P0 items marked Fixed in the improvement program with the test that proves each; verdict still holds; later status in FEATURE_STATUS |
| LEI-02 | `IMPROVEMENT_PROGRAM_2026-10-10.md` | 59,228 | 2026-10-10 to 10-14; branch `improvement/core-loop-durability` from `main` at `32a3abc7`, not pushed | Audit, prioritized fixes in small increments, tests against the real API, real PostgreSQL and a real browser, independent adversarial review, in-app (Reticle) verification, mutation checks, cleanup audit | Findings 1 to 37, external audit TS-001 to TS-007, ideal-state blueprint, decisions, roadmap P0 to P3, validation evidence G, owner decisions H, cleanup audit J, final assessment | Banner: historical snapshot; Resend and extra SQL stores now exist, which does not establish live delivery |
| LEI-03 | `FINAL_VALIDATION_REPORT.md` | 6,239 | v6.0; measurements 2026-10-14 on `improvement/core-loop-durability`; earlier head `aad8b54d` 2026-10-08 | Corpus structure check and executable evidence summary | 173 features, 28 journeys, 66 workflows, 248 business rules, 8 migration rules, 100 UX micro-interactions; founder corrections; Vitest 1072 in 104 files, PG 23 in 5 files, Playwright 205, 46 migrations; "Not produced: load, soak, backup/restore, deployment tests"; production readiness NOT met | Banner: historical snapshot |
| LEI-04 | `E2E_AUDIT_2026-10-21.md` | 12,292 | 2026-10-21, isolated stack on current source | Browser-driven audit with `playwright-cli` plus direct API probes (see 2.6) | 227 checks, 191 passed, 36 failed (16 real defects, 20 test or tooling errors); defect register; held-up security controls; coverage gaps; release readiness | Banner: earlier-session evidence, not rerun by the later repository audit, not a fresh-browser certification of `a771a87b` |
| LEI-05 | `FEATURE_STATUS_2026-10-21.md` | 144,836 | 2026-10-21, `main`, initial head `a30b35bf`, final source head `a771a87b` (external commit mid-audit) | Static inventory with targeted deep traces and memory-mode tests; 173-row matrix; requirements traceability; flow traces; defect register D-01 to D-10 and O-01 to O-03; GitHub reconciliation; historical static assessment retained verbatim | 6 impl-unverified, 87 partial, 1 broken, 75 not implemented, 4 excluded; 1,172 Vitest tests in 115 files; two reproduced defects (D-01, D-02) | Supersedes its own earlier static assessment (kept as history); source of the 173-row register |
| LEI-06 | `FEATURE_PLAN_2026-10-21.md` | 153,831 | 2026-10-21 | Dependency-aware roadmap: scope options, X-00 to X-11, ready stories, dependency graph, sprints S0 to S6, quality strategy, documentation reconciliation, 169 feature work packets, historical plan retained verbatim | Recommends a restricted trusted-career beta; separates registry score from delivery urgency | Supersedes the earlier plan's blanket persistence rewrite, missing-email-adapter assumption, registry-derived P0 labels and simulated-score acceptance |
| LEI-07 | `AUDIT_EVIDENCE_2026-10-21.json` | 1,827,134 | 2026-10-21 | Machine-readable ledger with 17 top-level members (section 5) | Per-feature, per-rule, per-journey, per-route, per-migration, per-file, per-test records | "Supporting evidence for the two reports; not a new source of product authority" |
| LEI-08 | `MAINTENANCE_AUDIT_2026-10-21.md` | 55,558 | 2026-10-21, `a771a87b` (correction), plus 2026-10-22 requirement and test-readiness appendices | Repository maintenance discovery, Bash tool design, implementation evidence, archived Bash guide, original Windows tool requirements (R1 to R4), 38-case test-readiness report, plan location note | Ten Node manifests (workspace root plus nine members), cleanup candidates and protections | Banner: the Bash tool described is absent in the checkout; commands are historical or proposed |
| LEI-09 | `PAYMENT_AUDIT_2026-10-23.md` | 9,456 | 2026-10-23 (before the Stripe integration merged) | Audit of an in-memory billing scaffold; fixes P-1 to P-6; run in a scratch copy because protected files were read-only | Baseline 4 failed of 9 billing tests; after fixes full suite 115 files, 1,182 tests | Banner: superseded in part, Stripe now exists in source; live billing remains unverified |
| LEI-10 | `STRIPE_SUPABASE_AUDIT_2026-10-23.md` | 8,151 | 2026-10-23, after PR #71 | Read-only review of Stripe code against fake gateways and the hosted Supabase project; S-1 to S-4, O-1 to O-5, refund update, hosted-database update | 117 files, 1,231 tests after rebuild | Follows LEI-09 |
| LEI-11 | `REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` | 54,974 | 2026-10-23 UTC, upstream `main` `0f40b6c`, branch `chatgpt/second-pass-audit-20261023` | Remote read-only second pass using hosted CI logs, issue and pull-request metadata, read-only Stripe and Supabase queries; 173-feature appendix imported from LEI-05 | Verdict NOT READY; 7 issues all open; R2-01 to R2-10; action plan 0 to 8 | States it is not an independent line-by-line review of 859 files and does not recertify the 173 features; supersedes PAYMENT_AUDIT scope statement |
| LEI-12 | `AUDIT_MASTER_REPORT.md` | 24,018 | 2026-10-22, `83dc7d24`, branch `repository_audit_roadmap` | Master synthesis by a "Teamwork Master Synthesis Engineering Group": baseline diagnostics, feature distribution, security findings, git reconciliation, roadmap | 1,143 tests in 112 files; Full 26, Partial 91, Stub 6, Missing 50; SEC-01 to SEC-06, OPS-01, OPS-02; stages A to F | Describes a different checkout than LEI-05 (49 migrations; see lessons section 12) |
| LEI-13 | `ARCHITECTURE_DURABILITY_REPORT.md` | 29,091 | 2026-10-22, `83dc7d24` | Persistence, durability, work-history proof, auth and session, AI governance, integrations and staging audit | 274 routes: 54 durable, 3 stateless, 217 ephemeral; SEC and OPS findings with remediation | Same checkout caveat |
| LEI-14 | `FEATURE_TRACEABILITY_MATRIX.md` | 63,400 | 2026-10-22, `83dc7d24` | Code-level register of 173 features against domain modules, routes, durability, UI, tables and migrations | Full 26 (15.0%), Partial 91 (52.6%), Stub 6 (3.5%), Missing 50 (28.9%) | Disagrees with LEI-05 on many rows (lessons LES-06) |
| LEI-15 | `GIT_RECONCILIATION_REPORT.md` | 38,588 | 2026-10-22, head `83dc7d24`, 302 commits | Branch ancestry (`git merge-base --is-ancestor`), PR spine #40 to #58, issues #44 to #50 | Zero unmerged branches; issue titles inferred from commits | Issue titles differ from the issue bodies read in LEI-05 and LEI-11 |
| LEI-16 | `RELEASE_SCOPE_AND_BACKLOG.md` | 28,458 | 2026-10-22, `83dc7d24` | Release scope, BL-001 to BL-018 with Given/When/Then, stages A to F | Core career loop as GA scope | Superseded for sequencing by LEI-06 and LEI-11 |

Total: 15 Markdown files (736,661 bytes) and one JSON file (1,827,134 bytes).

## 2. Verification methodology used by the reports

### 2.1 Vocabulary and rubric

- **Reality separation (SSOT rubric quoted in LEI-12 and LEI-14):** documented is not implemented; implemented is not verified; verified is not production-ready. A statement is classified by the weakest layer it has evidence for.
- **Status vocabularies.** Strict (LEI-05): Implemented and verified (zero awarded), Implemented but unverified, Partially implemented, Broken or regressed, Not implemented (search-limited), Deprecated or rejected. Earlier static (LEI-05 history): Implemented (reachable in UI, backed by API, covered by a test), Partial (some layer exists but no UI path or a subset of scope), Not started (no code found), Deprecated, Not recommended. Matrix (LEI-14): Full, Partial, Stub or mock, Missing. Plan abbreviations: IMPL, PART, NONE, DEP, NR.
- **Ten maturity dimensions per feature (LEI-07 `features[].maturity`):** UI, backend, integration, persistence, testing, security, resilience, operations, product acceptance, release readiness; each recorded with its own limitation text. No whole feature was promoted to implemented-and-verified from associations alone.
- **Three defect-evidence grades (LEI-05 F):** reproduced defect (executed probe), static failure path, evidence gap or owner decision; kept separate.
- **Honest test verdicts (from Reticle practice, LEI-02 G):** only `verified: "yes"` is a pass; `unknown` and `no-fault` are not passes; a verdict over an unrelated flow proves nothing; do not weaken a check to make it green.
- **Severity scales:** P0 to P3 (LEI-02, LEI-05); Critical, High, Medium, Low, Info (LEI-04); registry value score 0 to 10 is not urgency.

### 2.2 Command ledger discipline (LEI-05 B)

Each check is recorded with command, current result and limitation. Examples of the pattern (results are historical): migration-history helper 5 passed (does not apply SQL); lint failed on seven files; full Vitest 1,172 passed in 115 files via a native config loader with no cache and a JSON reporter (limits: memory mode and prebuilt dependency output); non-emitting `tsc --noEmit --incremental false --composite false --declaration false --declarationMap false` per project for ten projects; install, typecheck, build, PG tests, browser tests, deployment and live email recorded as NOT RUN with the reason (protected-file rule, missing `TEST_DATABASE_URL`, no authorized target). The Vitest reporter counted 458 suites including nested `describe` blocks; 115 is the file count; do not confuse them.

### 2.3 Layered test pyramid in the earlier attempt

| Layer | Command (earlier attempt) | What it proved | What it did not prove |
|---|---|---|---|
| Static | Prettier check; `tsc -b` then `tsc -p tests` | Format; types of code and, from 2026-10-14, of the tests themselves | Behavior |
| Unit | Vitest `tests/unit` (60 files, 669 tests at 2026-10-21) | Domain rules, helpers, configuration | Integration |
| Integration | Vitest `tests/integration` using in-memory Fastify `inject` (50 files, 402 tests) | API contracts and route handlers in memory mode | Real database, browser, worker, provider |
| Security | Vitest `tests/security` (5 files, 101 tests) | Authorization, injection, RLS text, session sign-out | Hosted RLS |
| Real database | `pnpm test:pg` against an isolated `TEST_DATABASE_URL` (5 files and 23 tests on 2026-10-14; 8 files in the 10-22 report; 11 files and 50 tests in CI on 2026-10-23) | Restart round trip, race arbitration, erasure in the database, concurrency, durability labelling, token stripping | Production database, hosted roles |
| Browser | Playwright on Chromium (183, 205, 221, 236 across dates) including accessibility, responsive and performance specs | User journeys, 23 pages at 7 viewports, layout shift | Other browsers, real devices, screen readers |
| Migrations | Node test of the ledger helper; CI applies all migrations to an empty database and re-runs the runner | Checksums, sequence, idempotency | Application against a populated or hosted database |
| Secrets | Client-bundle sentinel build and scan | Server secrets not compiled into the web bundle | Real secrets in other places |
| In-app verification | Reticle `reticle_act_and_wait` and `reticle_assert` against the real app | End states of driven flows; found three real defects | Anything not driven |

### 2.4 Mutation checks and adversarial review (LEI-02 G)

Practice: for each important fix, remove or disable the fix and show the named test fails ("mutation-checked"). Recorded examples: disabling the core commit fails all core-persistence tests; removing the optimistic-concurrency guards yields 40 evaluated guesses (limit 5) and both outcomes of the hire and withdraw race; removing only the in-process guard still passes because the database guard held alone; letting a scorecard move any application fails "never resurrects"; removing per-account rate-limit keys or the health exemption fails matching tests; letting an administrator remove someone else's role fails the owner-only test; skipping the sign-out check in session resolution fails the sign-out tests; dropping the conversation start rule fails 6 messaging tests and dropping the pair lock finds two conversations; not remembering the 401 reason fails both two-device browser tests (a first mutant did not compile, so the tests ran against the previous build and passed; the mutant was rewritten). Not discriminated by any test: the lock against a retried send racing itself (a unique constraint stores one row regardless); a teardown race fix that could not be reproduced on demand. An independent reviewer agent wrote reproduction scripts; its run ended early without a written report, and its probes were rerun against pre-fix code to reproduce findings 8, 18, 19, 21 and the cross-tenant linking in 9; a memory-mode email race did not reproduce (requests happened to serialize), which is why that test lives in the PG suite.

### 2.5 Probes (LEI-05, LEI-07 `probes`)

1. D-01 challenge text: source evaluator transpiled in memory; candidate UUID, allowed language `javascript`, one input/output case, code `this is not executable code`; result `passed`, score 100, `executed=false`, verification `unverified`.
2. D-02 batch lease: `runClaimCycle` twice on one in-memory job store; six jobs; lease 600 ms, handler timeout 300 ms, handler duration 190 ms, batch six; second worker starts after 650 ms; result 6 jobs, 9 executions, 3 duplicated. Defaults (batch ten, lease 60 s, timeout 30 s, mail timeout 20 s) share the structural risk; this proves duplicate handler execution under synthetic timing, not duplicate real mail (the adapter retains a provider idempotency key). Recommended next test: a PG claim-generation test before changing the store contract; measure heartbeat aging with the same drill.
3. D-03 (not run): inject a rejection of the metadata-erase step after the core erasure commit; the account is already deactivated.

### 2.6 E2E audit design (LEI-04)

Isolated stack: API on :4100 (`STORAGE=memory`, pinned token secret, raised rate limits) and web dev server on :5199 proxying to it; a stale shared API on :4000 was deliberately not used. Accounts: two candidates, a recruiter, a platform administrator promoted with an ops token. Browser: Chromium desktop 1280x900 and mobile 390x844; the Reticle overlay produced extra dialogs and unlabeled buttons that were counted as tooling artifacts. Results by suite:

| Suite | Area | Run | Passed | Real defects | Test or tooling errors |
|---|---|---:|---:|---:|---:|
| A | Public routes, 404, protected-route redirects, malformed ids | 18 | 18 | 0 | 0 |
| B | Sign-up and login validation, enumeration, XSS in name, open redirect, double submit, session, logout | 20 | 18 | 2 | 0 |
| C | API authorization: admin routes, token tampering, privilege escalation, IDOR, headers, CORS, payload limits, admin governance | 53 | 52 | 1 | 0 |
| D | Admin console in the browser | 23 | 20 | 1 | 2 |
| E | Candidate flows | 31 | 24 | 2 | 5 |
| E2 | Re-probes of E failures | 10 | 5 | 4 | 1 |
| F | Recruiter: job validation, publish, XSS in titles, two-tab race | 14 | 12 | 0 | 2 |
| F2 | Cross-user hiring pipeline | 10 | 9 | 0 | 1 |
| G | Resilience: 500, bad bodies, timeout, offline, revoked and expired sessions | 11 | 8 | 2 | 1 |
| H | Mobile, keyboard, labels, headings, focus, zoom, color scheme | 12 | 8 | 1 | 3 |
| I | Work history, network, messaging (IDOR, XSS), learning | 18 | 14 | 0 | 4 |
| I2 | Network and work-email re-run | 7 | 3 | 3 | 1 |
| R | Regression of every fix | 13 | 13 | 0 | 0 |

First pass 227 checks, 191 passed, 36 failed; after fixes 13 of 13 regression checks and a full suite of 113 files and 1,159 tests. Scripts, raw outputs and screenshots lived in a session scratchpad and are not in the repository. Routes exercised: public (`/`, `/login`, `/signup`, `/checkout`, `/privacy`, `/terms`, `/jobs`, `/jobs/:id`, `/reference/:id`, unknown path), candidate (`/dashboard`, `/applications`, `/evidence`, `/profile`, `/settings`, `/portfolio`, `/resumes`, `/network`, `/learning`, `/notifications`, `/messages`, `/messages/:id`, `/assessments`), hiring (`/hiring`, `/hiring/jobs/:id`), admin (`/admin`); about 240 API routes existed, most without UI.

### 2.7 Boundaries stated by the reports (read before trusting any number)

- Static route and file search, test-title feature ids and web API-call inspection were the basis of the early status; "Not started" means no matching code was found, so a feature with a different name could exist.
- Coverage by subsystem (LEI-05 B): authority and product documents (registries indexed completely; the long SSOT not read line by line); architecture (core paths traced; no review of all 13,356 server lines); web (source and helper tests; no live UI, keyboard, responsive, contrast or screen-reader validation); persistence (core transaction, guard, hydration, writer lease, stores; applied schema, hosted grants, restart and concurrency unverified); worker and integrations (claim loop, mail adapter, event registry, heartbeat; mocks only); quality and release (CI definition inspected; no current remote job logs); history and planning; remaining portfolio (source and test feature-id references and domain filename candidates, not semantic proof).
- LEI-11 inspected a 978-entry tree (859 tracked files) at inventory level only; detailed review was targeted to billing, migrations, security, E2E and high-risk modules; hosted CI results were not re-executed locally.
- Inventory coverage in the JSON: 684 tracked files, of which 358 "inventoried; not necessarily inspected" and 326 "indexed for ID references; only narrative-named paths deeply reviewed".
- Files absent from the audited checkout: `ALL_DOCUMENTS.md`, `FINAL_DOCUMENT_INDEX.md`, `docs/engineering/ARCHITECTURE.md`, `docs/features/`; the Bash maintenance tool and its fixture tests.

## 3. Metric timeline (all historical; each row is a different commit or checkout)

| Date | Source | Commit or branch | Vitest tests / files | Real-DB tests | Browser tests | Migrations | Routes (durable / stateless / ephemeral) | Other |
|---|---|---|---|---|---|---|---|---|
| 2026-10-03 | LEI-01 | `8db0930` | n/a (CI red at type-check) | none | 9 browser routes | 41 | 147 in-process maps | `server.ts` 390,170 bytes; score 4.6 of 10 |
| 2026-10-08 | LEI-03 | `aad8b54d` | 976 | none | 183 | n/a | n/a | |
| 2026-10-10 | LEI-02 | `32a3abc7` baseline | 976 / 94 | none | 183 | 43 | 269 | `server.ts` about 12k lines |
| 2026-10-14 | LEI-02, LEI-03 | `improvement/core-loop-durability` | 1,072 / 104 | 23 / 5 files | 205 | 46 | 274 (51 / 3 / 220) | knip, jscpd cleanup; 320 lines removed |
| 2026-10-21 | LEI-04 | current source | 1,159 / 113 | n/a | 227 browser checks | n/a | about 240 `/api/v1` paths | 13 of 13 regression |
| 2026-10-21 | LEI-05 | `a771a87b` | 1,172 / 115 (unit 669, integration 402, security 101) | not run | 221 e2e quoted | 51 | 274 (70 registry entries / 3 / 201 ephemeral header) | 684 tracked files; 13,356 server lines (13,404 in the older line) |
| 2026-10-22 | LEI-12, LEI-13, LEI-14 | `83dc7d24` | 1,143 / 112 (627 unit, 402 integration, 101 security, 13 browser) | 8 files, gated | 7 + 6 browser journeys run | 49 | 274 (54 / 3 / 217) | 302 commits |
| 2026-10-23 | LEI-09 | scratch copy | 1,182 / 115 | not run | not run | n/a | n/a | |
| 2026-10-23 | LEI-10 | after rebuild | 1,231 / 117 | not run | not run | 53 | n/a | stale-output baseline: 55 files failed |
| 2026-10-23 | LEI-11 | CI on `0f40b6c` | 1,231 / 117 | 50 / 11 files | 235 of 236 | 52 | n/a | 978 tree entries, 859 tracked files |

## 4. Durable and ephemeral families in the earlier attempt (for LGR-50)

**Durable (database-backed) families at the last measurement:** identity and sessions (users, profiles, `revoked_sessions`, `sessions_valid_after`), skills taxonomy and relationships, evidence, organizations and memberships, jobs, applications, verified work history, employment references, corporate-email challenges, messaging (threads, participants, messages, read positions), notifications and preferences, saved searches, saved jobs, account settings, data export requests, data erasure requests, admin audit log, feature flags, worker heartbeat, billing records in database mode (migration 00052), background jobs. 54 routes (about 20 percent) at 2026-10-22; 70 registry entries at 2026-10-21.

**Ephemeral families (process memory, header `x-talentsphere-durability: ephemeral`), about 217 routes at 2026-10-22:** learning and courses about 24 (courses, enrollments, module progress, certificates); code arena and assessments about 14; gamification and XP about 8; technical interviews about 18; reputation and endorsements about 22; career trajectory and forecasts about 16; moderation and trust and safety about 12; application drafts and resumes about 14; billing and subscriptions about 6 (before the database-backed billing); also connections, portfolio, alumni networks, referral requests, warm introductions, analytics, salary intelligence, talent pools, talent segmentation, behavioral discovery, search history, AI conversations and usage.

## 5. Index of `AUDIT_EVIDENCE_2026-10-21.json` (17 top-level members)

File: 1,827,134 bytes; SHA-256 `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8` (recomputed on 2026-10-26, matches the value recorded by TRC-05); declares no `$schema` or schema version. The file stays archived unchanged; this table indexes it. Approximate serialized size per member is given to show where the bulk is.

| # | Member | Type and count | Contents | Approx. size |
|---|---|---|---|---:|
| 1 | `remote` | object, 4 keys: `prs` (9 records), `issues` (7 records, 17 comments in total), `openPullRequests` (empty), `ciRunsAtBothObservedCommits` (empty) | PR records (number, url, state, merged, merge commit, title) for #43 and #51 to #58; issue records (#44 to #50) with state `open` and exact comment bodies | 12 KB |
| 2 | `snapshot` | object, 9 keys | Date (2026-10-21 America/Los_Angeles), initial head `a30b35bfb01d648632e8df57ab378c00ca9313aa`, final source head `a771a87be85869fac4cf30c16cab7f4c715a6178`, branch `main`, concurrent-change note, Node 24.19.0, pnpm 11.7.0, 27 initial staged entries with provenance, tracked-file hash comparison (8 documentation files changed, product source unchanged, protected files unchanged) | 5 KB |
| 3 | `method` | string | "Current static reference inventory with targeted deep traces and memory-mode tests. Candidate associations are not proof" | 0.2 KB |
| 4 | `features` | array, 173 records of 32 fields | id, name, category, registry score and phase, registry dependencies, requirement source (file and line), expected and actual behavior, overall status and basis, previous assessment, ten-dimension maturity, frontend and domain paths, 688 reference candidates, test evidence, external dependencies, scope disposition, delivery urgency, backlog id, next action, acceptance and qualification, estimate, release stage, verification limitation, roles and permissions, subfeatures (empty in all), data lineage, deferral consequence, canonical contract (46 features) | 762 KB |
| 5 | `businessRules` | array, 248 records of 8 fields | id (BR-001 to BR-248), rule text, source line, 1,003 code or test annotation references across 106 rules (142 rules have none), status ("Reference inventory only; semantic acceptance and exhaustive feature mapping not verified" for all 248), next action, feature-association candidates, association warning | 277 KB |
| 6 | `journeys` | array, 28 records | J-01 to J-28 with personas, terminal state, source line, verification ("Not verified end to end in this audit" for all 28), next action | 10 KB |
| 7 | `routes` | array, 274 records | method (GET 132, POST 116, PATCH 13, DELETE 11, PUT 2), path, source line, durability class (stateless 3, registered durable 70, ephemeral header 201) | 29 KB |
| 8 | `migrations` | array, 51 records | path, SHA-256, tables created, applied state ("unknown; no test or target database queried" for all 51); `00001_core_schema.sql` to `00051_feature_flags.sql` | 14 KB |
| 9 | `inventory` | array, 684 records | tracked file path, SHA-256, coverage class (358 inventoried only; 326 indexed for id references); by extension: .ts 275, .json 158, .tsx 54, .sql 52, .md 46, .yml 30, .png 23, .mjs 9 | 139 KB |
| 10 | `tests` | object, 9 keys | command, passed 1,172, failed 0, pending 0, `files` (115 records with per-test names and statuses, summarized in section 6), limitations, migration-history result (5 passed), non-emitting type-check result, lint result (exit 1; seven files) | 215 KB |
| 11 | `probes` | array, 2 records | D-01 arbitrary challenge text; D-02 batch lease expiry (section 2.5) | 0.5 KB |
| 12 | `inspectionLimitations` | array, 5 strings | Not all SSOT, PRD, TRD prose converted to atomic requirements; reference candidates are not call-graph proofs; 28 journeys inventoried, subsets traced, none run end to end; no actual database migration state or provider or deployment acceptance; no compatible document or presentation template export capability | 0.3 KB |
| 13 | `contractInventory` | object, 3 keys | 46 features mapped from SSOT detailed headings; limitation: top-level numbered behavior and declared fields only | 0.2 KB |
| 14 | `summaryCounts` | object, 5 keys | Partially implemented 87; Implemented, unverified 6; Broken or regressed 1; Not implemented 75; Deprecated or rejected 4 | 0.1 KB |
| 15 | `artifactValidation` | object, 9 keys | 173 features, 248 business rules, 28 journeys, 169 backlog packets, 1,172 tests, 115 test files; checks (unique ids, source, test and UI path existence, line bounds, backlog coverage, all test assertions passed, migration hashes unchanged, tracked changes documentation-only); passed true | 0.4 KB |
| 16 | `documentationCrossCheck` | object, 10 keys | Source head, 46 tracked Markdown files scanned (documents array of 46 with category, disposition, link check), no missing relative link targets, 30 browser route declarations (layout, index and catch-all included), two missing historical deliverables (`project-maintenance.sh`, `scripts/tests/project-maintenance.test.sh`), 24 documents changed since the source snapshot, limits | 14 KB |
| 17 | `focusedContractReviews` | array, 2 records | D-09 (F-07, F-52; BR-048; X-11; 6 passed, the existing test asserts a certificate after three lesson completions with no assessment) and D-10 (F-52, F-96; X-11) | 1 KB |

Feature status counts, delivery urgency (P0 3, P1 30, P2 53, P3 83, N/A 4), release stage (Proposed beta 24, Proposed GA 9, Expansion 124, Decision gate 12, Excluded 4) and estimate (169 "Unestimated; decompose after contract/trace review", 4 N/A) are summarized in the requirements file section 9. The pull-request and issue facts are in `LEGACY_RELEASE_GATES.md` section 7.

## 6. Test inventory at 2026-10-21 (from `tests.files`, memory mode, 115 files, 1,172 tests, all passed)

Counts per file in parentheses. Real-database and browser suites are listed in 6.2 by name only, because the JSON recorded results only for the Vitest memory-mode run.

### 6.1 Vitest memory-mode suites

#### tests/integration: 50 files, 402 tests
activity-contributions(5), admin(9), ai-gateway(5), alumni-networks(7), analytics(6), api-server(9), application-drafts(10), application-feedback(7), auth-profile(9), behavioral-talent-discovery(14), billing(9), career-trajectory(13), certificate-verification(6), challenges-assessment(4), core-notifications(8), email-delivery-gate(2), employer-reputation(5), evidence-skills(9), gamification(9), instructor-reputation(7), job-observability(3), job-templates(10), jobs-applications(9), learning-impact(12), lms-courses(6), messaging-rules(6), messaging(3), moderation(21), networking(9), notifications(5), peer-credibility(6), portfolio(7), referral-requests(5), reputation-engine(7), reputation-visibility(4), resumes(6), review-r2-regressions(4), salary-intelligence(10), saved-searches(13), search(11), settings(7), skill-decay(6), skill-forecasting(7), storage-boot(2), talent-pool-intelligence(11), talent-segmentation(14), technical-interview(7), warm-introductions(8), work-history-graph(25), work-history-removal(5)

#### tests/security: 5 files, 101 tests
api-security(38), core-authz(30), injection-defenses(21), private-data-rls(5), session-sign-out(7)

#### tests/unit: 60 files, 669 tests
activity-contributions-domain(6), admin-domain(14), ai-gateway-domain(11), alumni-networks-domain(18), analytics-domain(7), application-drafts-domain(8), application-feedback-domain(8), background-jobs(20), behavioral-talent-discovery-domain(19), billing-domain(12), career-trajectory-domain(17), certificate-verification-domain(8), challenges-assessment-domain(8), contracts-url(16), database-migrations(32), employer-reputation-domain(10), evidence-skills-domain(14), feature-flag-store(2), foundation(14), gamification-domain(15), instructor-reputation-domain(13), job-templates-domain(6), jobs-applications-domain(9), learning-impact-domain(9), lms-domain(6), messaging-domain(4), migration-references(2), moderation-domain(23), networking-domain(12), notifications-domain(6), password-hashing(6), peer-credibility-domain(13), persistence-honesty(12), portfolio-domain(10), private-data-rls-hardening(6), production-config(11), rate-limit-config(4), referral-requests-domain(12), reputation-engine-domain(8), resumes-domain(6), salary-intelligence-domain(8), saved-searches-domain(13), search-domain(26), session-ended-reason(3), settings-domain(12), skill-decay-domain(5), skill-forecasting-domain(12), talent-pool-intelligence-domain(18), talent-segmentation-domain(31), technical-interview-domain(13), transactional-mail(4), warm-introductions-domain(16), web-api-json(11), web-career(6), web-course(7), web-domain-mirrors(2), web-shell(5), work-history-graph-domain(26), worker-claim(10), worker-queue(4)


### 6.2 Suites named in the reports but not recorded in the JSON (real database, browser, scripts)

- **Real PostgreSQL (`tests/pg/`):** `core-persistence` (restart round trip of the whole core loop, BR-15 re-apply, erasure in the database, durability labelling, job-payload credential stripping, settings and export metadata), `concurrency` (parallel wrong email codes, hire and withdraw race, data-exception mapping, signed-out session across restart, token for a removed account refused, expired revocation rows pruned), `notifications`, `messaging` (restart, read state, retried send, simultaneous starts, erasure), `work-history-removal` (rows, restart, queue, removal racing a referee submission), `saved-searches`, `saved-jobs`, `private-data-rls` (runtime two-account RLS), billing tests added with the payment integration; helper `test-db.ts` (teardown waits for connections to close).
- **Browser (`tests/e2e/`, Playwright, Chromium):** `core-loop` (recruiter, candidate and referee through the UI only), `frontend-fixes` (FE-02 to FE-07, FE-11, double-click guard), `account-security` (two devices, session reasons, sign-out), `responsive` (23 pages at 7 viewports), `performance` (layout stability), `accessibility`, `web-ui` (pricing, shell), `navigation`, `session-resilience`, `notifications`, `messaging`, `work-history-removal`, `mutation-feedback`, `reputation-engine`, `lesson-player`, `challenges`, `career-readiness`, `skills-graph`, `portfolio-resumes`.
- **Scripts:** `scripts/tests/migration-integrity.test.mjs` (5 tests), `scripts/release-preflight.mjs` (read-only schema drift check), `scripts/check-client-secrets.mjs` (bundle sentinel), `scripts/audit-hosted-supabase-migrations.mjs` (expected to exit 1 on known incompatibility), a hosted-target guard in CI.
- **Windows tool tests (maintenance appendix):** `tests/run-tests.ps1` with four tier files and a fixtures helper (38 cases); Bash fixture suite `scripts/tests/project-maintenance.test.sh` (74 assertions; absent in the next checkout).

## 7. Evidence rules the reports converge on (reusable by the target)

1. Record the exact commit, date, runtime versions and whether the working tree was clean; if another actor changes the tree mid-audit, say so and describe the evidence as "the working source observed during that transition".
2. Separate three kinds of finding: reproduced by an executed probe, a static failure path, and an evidence gap or owner decision.
3. A command that was not run is "NOT RUN" with its reason; never imply a pass. A test that exits 0 because a tool is missing (a swallowed `grep` failure) is not evidence.
4. Test counts name their unit: tests, files and nested suites are different numbers.
5. Memory-mode green does not certify database behavior; a database green does not certify a hosted platform; CI green does not certify a deployed environment; a mocked provider call does not certify a provider.
6. Prefer a mutation check: remove the fix, show the test fails; prove the mutant compiles.
7. Run at least one real-browser, real-database, real-limits path per release; a suite that raises the limit it should test hides defects.
8. Tests that import built output record the build provenance; a stale build can fail or pass for the wrong reason.
9. Historical results carry their banner and are never re-labelled as current; a later audit states which earlier statements it supersedes.
10. Candidate associations (a table, a route, a similar page, a comment naming a rule) are not proof of implementation or of requirement coverage.
11. For every external system (payment provider, managed database, mail provider, hosting) record read-only observations separately from mutations; the 2026-10-23 review made none.
12. A recommendation that needs a protected or owner-controlled change (dependency manifest, build configuration, pricing, legal text) is a proposal until the owner authorizes that path.

## 8. Index back to the other new files from this track

| Need | Where |
|---|---|
| Lessons and defects, `LES-01` to `LES-88`, with source-ID crosswalk | `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` |
| Acceptance criteria `LGR-01` to `LGR-99`, backlog `BL-001` to `BL-018`, packets `X-00` to `X-11`, 173-feature register, 46 intended contracts | `05_FEATURE_SPECIFICATIONS/LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md` |
| Gates `LRG-01` to `LRG-17`, issue and pull-request lineage, stages A to F, sprints S0 to S6, payment and managed-database gates | `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` |
| Ledger of what was merged from every source file and what was not | `00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md` |

## 9. Feature-to-module and data-table map from the 2026-10-22 matrix (data-model hints)

Extracted from `FEATURE_TRACEABILITY_MATRIX.md` rows for all 173 features. It describes the **earlier attempt's** module names, route counts and table names; the target data model is in `12_DATA_AND_DATABASE`. Use it as a completeness check (is each concept somewhere in the target?), not as a design. Status and engineering notes of the same matrix are in the requirements file register (section 9) and the archive; endpoints are listed in full in the archived matrix and in `AUDIT_ROUTE_EVIDENCE_CROSSWALK.md`.

| ID | Feature | Category | Domain module | Endpoints (count) | Durability | Tables and migrations (earlier attempt) |
|---|---|---|---|---:|---|---|
| F-01 | Authentication & Session | Identity | auth.ts, core.ts | 6 | Durable | 00001_core_schema.sql (users, profiles, audit_logs); 00045_session_revocation.sql; 00046_session_sign_out.sql (revoked_sessions) |
| F-02 | Landing Page | Shell | core.ts | 2 | Stateless | None (Static/Shell) |
| F-03 | Dashboard (Role-Adaptive) | Shell | core.ts, auth.ts | 5 | Durable | 00001_core_schema.sql |
| F-04 | Job Marketplace | Marketplace | jobs.ts | 6 | Durable | 00001_core_schema.sql (jobs, job_applications); 00003_jobs_applications_schema.sql (job_skills); 00018_saved_searches_job_alerts_schema.sql (saved_jobs) |
| F-05 | Post Job Studio | Marketplace | jobs.ts | 2 | Durable | 00001_core_schema.sql (jobs) |
| F-06 | ATS / Candidate Pipeline | Recruiting | applications.ts, jobs.ts | 4 | Durable | 00001_core_schema.sql (job_applications); 00003_jobs_applications_schema.sql (application_evidence) |
| F-07 | Learning Management System | Learning | lms.ts | 10 | Ephemeral | 00005_lms_courses_schema.sql (courses, course_modules, lessons, course_enrollments, lesson_progress, course_certificates, course_skills) |
| F-08 | Challenges Arena | Assessment | challenges.ts, assessment.ts | 5 | Ephemeral | 00004_challenges_assessment_schema.sql (challenges, assessment_sessions, challenge_submissions, xp_transactions) |
| F-09 | Professional Networking | Social | networking.ts | 6 | Ephemeral | 00010_networking_connections_schema.sql (connections) |
| F-10 | Direct Messaging | Communication | messaging.ts | 5 | Durable | 00006_messaging_schema.sql (message_threads, thread_participants, messages) |
| F-11 | AI Career Assistant (Basic) | AI | ai-gateway.ts | 5 | Ephemeral | 00008_ai_gateway_schema.sql (ai_conversations, ai_messages, ai_usage_meters) |
| F-12 | Profile Management | Identity | profile.ts | 3 | Durable | 00001_core_schema.sql (profiles) |
| F-13 | Resume Builder | Identity | resumes.ts | 7 | Ephemeral | 00009_resumes_schema.sql (resumes, resume_exports) |
| F-14 | Notification Center | Communication | notifications.ts | 5 | Durable | 00007_notifications_schema.sql; 00044_notifications_persistence.sql (notifications, notification_preferences); 00048_notification_preferences_rls_scope.sql |
| F-15 | Settings | Shell | settings.ts | 8 | Durable | 00013_account_settings_privacy_schema.sql (user_settings, data_erasure_requests, data_export_requests) |
| F-16 | Billing & Subscriptions | Monetization | billing.ts | 5 | Ephemeral | 00014_billing_subscriptions_schema.sql (subscriptions, invoices, entitlements, billing_events) |
| F-17 | Admin Console | Governance | admin.ts | 7 | Ephemeral | 00001_core_schema.sql (audit_logs, feature_flags); 00015_admin_governance_schema.sql (platform_config) |
| F-18 | Chrome Extension Companion | Edge | None (Edge companion) | None | N/A | None |
| F-19 | Product Analytics | Telemetry | analytics.ts | 3 | Ephemeral | 00020_product_analytics_schema.sql (analytics_events, analytics_daily_kpis) |
| F-20 | Command Search (⌘K) | Shell | search.ts | 5 | Ephemeral | 00016_search_discovery_schema.sql (search_history) |
| F-21 | Error Recovery & Resilience | Shell | input-security.ts, core.ts | Global Fastify errorHandler, rate-limiti | Durable | 00049_worker_liveness.sql (worker_health) |
| F-22 | Gamification & XP Ledger | Engagement | gamification.ts | 5 | Ephemeral | 00012_gamification_xp_ledger_schema.sql (user_gamification_profiles, gamification_badges, user_badges) |
| F-23 | Leaderboard & Badges | Engagement | gamification.ts | 2 | Ephemeral | 00012_gamification_xp_ledger_schema.sql (gamification_badges, user_badges) |
| F-24 | Trust, Safety & Moderation | Safety | moderation.ts, input-security.ts | 10 | Ephemeral | 00017_moderation_trust_safety_schema.sql (moderation_reports, moderation_appeals) |
| F-25 | Job Detail View | Marketplace | jobs.ts | 1 | Durable | 00001_core_schema.sql (jobs) |
| F-26 | Portfolio Showcase | Identity | portfolio.ts | 6 | Ephemeral | 00011_portfolio_showcase_schema.sql (portfolio_projects, portfolio_project_skills, portfolio_project_media, portfolio_project_evidence) |
| F-27 | Local Resume Match Preview | Edge | None (Edge) | None | N/A | None |
| F-28 | External Job Page Scanner | Edge | None (Edge) | None | N/A | None |
| F-29 | Scheduled Notification Digest | Communication | notifications.ts | 2 | Durable | 00007_notifications_schema.sql; 00044_notifications_persistence.sql |
| F-30 | Networking Stale-Request Nudges | Engagement | networking.ts | 1 | Ephemeral | 00010_networking_connections_schema.sql |
| F-31 | KPI Aggregation & Rollups | Analytics | analytics.ts | 1 | Ephemeral | 00020_product_analytics_schema.sql |
| F-32 | Saved Searches & Job Alerts | Candidate | saved-searches.ts | 6 | Durable | 00018_saved_searches_job_alerts_schema.sql (saved_searches, job_alerts, saved_jobs) |
| F-33 | Video Interview Rooms | Communication | technical-interview.ts | 2 | Ephemeral | 00026_technical_interview_platform_schema.sql (interview_assessments) |
| F-34 | Multi-Entity Backend Search | Platform | search.ts | 1 | Ephemeral | 00016_search_discovery_schema.sql |
| F-35 | Feature Flag Console | Administration | admin.ts | 2 | Ephemeral | 00001_core_schema.sql (feature_flags) |
| F-36 | Application Draft Autosave | Candidate | application-drafts.ts | 4 | Ephemeral | 00019_application_drafts_schema.sql (application_drafts, application_draft_versions) |
| F-37 | Job Templates | Recruiting | job-templates.ts | 6 | Ephemeral | 00022_job_templates_schema.sql (job_templates) |
| F-38 | Legacy Chat Service (DEPRECATED) | Communication | None (Deprecated) | None | N/A | None |
| F-39 | Unified Backend Stub (DEPRECATED) | Platform | None (Deprecated) | None | N/A | None |
| F-40 | Institutional Managed Learning | Institutions | lms.ts | 2 | Ephemeral | 00005_lms_courses_schema.sql |
| F-41 | Procurement & Seat Licensing | Institutions | billing.ts | 1 | Stateless | 00014_billing_subscriptions_schema.sql (entitlements) |
| F-42 | Provider-Agnostic Media Engine | Platform | lms.ts | 1 | Ephemeral | 00005_lms_courses_schema.sql (lessons.content_url) |
| F-43 | B2B2C Graduation Flywheel | Institutions | alumni-networks.ts | 1 | Ephemeral | 00033_alumni_networks_schema.sql (alumni_affiliations) |
| F-44 | AI Media Enrichment | Learning | ai-gateway.ts, lms.ts | 1 | Ephemeral | 00008_ai_gateway_schema.sql |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | Learning | assessment.ts | 1 | Ephemeral | 00004_challenges_assessment_schema.sql |
| F-46 | Institutional Analytics | Institutions | learning-impact.ts, analytics.ts | 1 | Ephemeral | 00037_learning_impact_schema.sql |
| F-47 | Faculty Dashboard | Institutions | instructor-reputation.ts | 1 | Ephemeral | 00031_instructor_reputation_schema.sql |
| F-48 | OS Shell & Workbench | OS | search.ts | 1 | Ephemeral | None |
| F-49 | Automation & Agents | OS | background-jobs.ts | 1 | Durable | 00042_background_jobs_schema.sql; 00049_worker_liveness.sql |
| F-50 | Institutional Course Marketplace | Institutions | lms.ts | 1 | Ephemeral | 00005_lms_courses_schema.sql |
| F-51 | Media Health Monitoring | Platform | None | None | N/A | None |
| F-52 | Certificate Verification | Verification | lms.ts | 2 | Ephemeral | 00005_lms_courses_schema.sql (course_certificates); 00021_certificate_verification_schema.sql (certificate_revocations) |
| F-53 | Professional Social Graph & Feed | Networking | networking.ts | 1 | Ephemeral | 00010_networking_connections_schema.sql |
| F-54 | Content Publishing | Networking | None | None | N/A | None |
| F-55 | Groups & Communities | Community | alumni-networks.ts | 3 | Ephemeral | 00033_alumni_networks_schema.sql (alumni_groups, alumni_group_members) |
| F-56 | Organization & Institution Pages | Recruiting | core.ts | 5 | Durable | 00001_core_schema.sql (organizations, org_memberships) |
| F-57 | Events & Webinars | Community | None | None | N/A | None |
| F-58 | Written Recommendations | Networking | work-history-graph.ts | 3 | Durable | 00041_verified_work_history_schema.sql (employment_references) |
| F-59 | Outreach Credits (TalentMail) | Recruiting | None | None | N/A | None |
| F-60 | Profile Views & Privacy Controls | Networking | profile.ts, settings.ts | 2 | Durable | 00001_core_schema.sql; 00013_account_settings_privacy_schema.sql |
| F-61 | Premium Candidate Tier (OD-34 gated) | Business | None (Gated OD-34) | None | N/A | None |
| F-62 | Sponsored Content (NOT RECOMMENDED) | Business | None (Not Recommended) | None | N/A | None |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | Intelligence | None (Not Recommended) | None | N/A | None |
| F-64 | LinkedIn Migration Engine | Integration | None | None | N/A | None |
| F-65 | LinkedIn Decoupling & Independence | Foundation | profile.ts, auth.ts | 2 | Durable | 00001_core_schema.sql |
| F-66 | Course Creation Studio | Learning | lms.ts | 4 | Ephemeral | 00005_lms_courses_schema.sql |
| F-67 | Categories, Discovery & Comparison | Learning | lms.ts | 1 | Ephemeral | 00005_lms_courses_schema.sql |
| F-68 | Quizzes, Practice Tests & Final Exams | Learning | lms.ts | 1 | Ephemeral | 00005_lms_courses_schema.sql |
| F-69 | Assignments & Peer Review | Learning | None | None | N/A | None |
| F-70 | Learning Paths, Programs & Specializations | Learning | lms.ts | 1 | Ephemeral | 00005_lms_courses_schema.sql |
| F-71 | Course Q&A, Discussions, Notes | Learning | None | None | N/A | None |
| F-72 | Course Reviews & Ratings | Learning | None | None | N/A | None |
| F-73 | Course Commerce | Learning | billing.ts | 1 | Ephemeral | 00014_billing_subscriptions_schema.sql |
| F-74 | Instructor Platform | Learning | instructor-reputation.ts | 2 | Ephemeral | 00031_instructor_reputation_schema.sql (instructor_reputation_breakdown) |
| F-75 | Employer Insights | Intelligence | employer-reputation.ts | 3 | Ephemeral | 00034_employer_reputation_schema.sql (employer_reputation_breakdown, employer_reviews) |
| F-76 | Coding Contests & Live Leaderboards | Assessment | None | None | N/A | None |
| F-77 | Skill Certification Exams | Assessment | assessment.ts, challenges.ts | 2 | Ephemeral | 00004_challenges_assessment_schema.sql |
| F-78 | Practice Sets & Interview Prep | Learning | challenges.ts | 1 | Ephemeral | 00004_challenges_assessment_schema.sql |
| F-79 | Articles & Newsletters | Networking | None | None | N/A | None |
| F-80 | Profile Enhancements | Profile | profile.ts | 1 | Durable | 00001_core_schema.sql |
| F-81 | Identity Verification | Verification | None | None | N/A | None |
| F-82 | Student Learning Analytics | Analytics | lms.ts | 1 | Ephemeral | 00005_lms_courses_schema.sql |
| F-83 | Admin Platform Expansion | Administration | admin.ts | 2 | Ephemeral | 00001_core_schema.sql; 00015_admin_governance_schema.sql |
| F-84 | Skills Graph & Taxonomy | Platform | skills.ts | 5 | Durable | 00002_evidence_skills_schema.sql (skills, skill_relationships, evidence_skills) |
| F-85 | Career Graph & Progression | Intelligence | career-trajectory.ts | 5 | Ephemeral | 00036_career_trajectory_schema.sql (career_transitions, progression_benchmarks, career_milestone_evaluations) |
| F-86 | Salary Intelligence | Intelligence | salary-intelligence.ts | 5 | Ephemeral | 00023_salary_intelligence_schema.sql (salary_reports, salary_aggregates) |
| F-87 | Interview Experience Repository | Candidate | None | None | N/A | None |
| F-88 | Technical Interview Platform | Hiring | technical-interview.ts | 10 | Ephemeral | 00026_technical_interview_platform_schema.sql (interview_questions, interview_assessments, interview_scorecards, interview_ai_feedbacks) |
| F-89 | Contribution Verification System | Verification | activity-contributions.ts | 3 | Ephemeral | 00030_activity_contributions_schema.sql (activity_events, contribution_scores) |
| F-90 | Peer Mentorship & Advisor Network | Community | alumni-networks.ts | 3 | Ephemeral | 00033_alumni_networks_schema.sql (alumni_mentorship) |
| F-91 | Career Readiness Assessment | Career | career-trajectory.ts | 1 | Ephemeral | 00036_career_trajectory_schema.sql |
| F-92 | Advanced Recruiter Search | Recruiting | talent-pool-intelligence.ts, search.ts | 2 | Ephemeral | 00038_talent_pool_intelligence_schema.sql |
| F-93 | Interview Video Recording & AI Feedback | Hiring | technical-interview.ts | 1 | Ephemeral | 00026_technical_interview_platform_schema.sql (interview_ai_feedbacks) |
| F-94 | Verified Work History & References | Verification | work-history-graph.ts | 8 | Durable | 00041_verified_work_history_schema.sql (verified_work_histories, employment_references); 00043_core_persistence_alignment.sql (work_history_email_challenges) |
| F-95 | Career Transition Planning | Career | career-trajectory.ts | 1 | Ephemeral | 00036_career_trajectory_schema.sql |
| F-96 | Skill Evidence & Digital Credentials | Verification | evidence.ts | 8 | Durable | 00001_core_schema.sql (evidence); 00002_evidence_skills_schema.sql (evidence_skills) |
| F-97 | Real-Time Job Market Analytics | Intelligence | skill-forecasting.ts | 2 | Ephemeral | 00035_skill_forecasting_schema.sql |
| F-98 | Employer Equity & Compensation Intelligence | Intelligence | salary-intelligence.ts | 1 | Ephemeral | 00023_salary_intelligence_schema.sql |
| F-99 | AI Career Coach (Enhanced) | AI | ai-gateway.ts | 2 | Ephemeral | 00008_ai_gateway_schema.sql |
| F-100 | Peer Project Collaboration | Learning | None | None | N/A | None |
| F-101 | Badge Marketplace & Recognition | Gamification | gamification.ts | 1 | Ephemeral | 00012_gamification_xp_ledger_schema.sql |
| F-102 | Hiring Manager Portal | Recruiting | jobs.ts, applications.ts | 2 | Durable | 00001_core_schema.sql |
| F-103 | Candidate Comparison & Rubric | Recruiting | technical-interview.ts, talent-segmentation.ts | 2 | Ephemeral | 00026_technical_interview_platform_schema.sql; 00040_talent_segmentation_schema.sql |
| F-104 | Pre-Hire Assessment Customization | Hiring | None | None | N/A | None |
| F-105 | Post-Hire Analytics & ROI Tracking | Analytics | None | None | N/A | None |
| F-106 | Skill Prerequisite Engine | Learning | skills.ts, lms.ts | 1 | Durable | 00002_evidence_skills_schema.sql |
| F-107 | Live Q&A with Instructors | Learning | None | None | N/A | None |
| F-108 | Expert Network Matching | Networking | None | None | N/A | None |
| F-109 | Salary Negotiation Guidance | Career | salary-intelligence.ts | 1 | Ephemeral | 00023_salary_intelligence_schema.sql |
| F-110 | Verified Skill Endorsements | Verification | peer-credibility.ts | 3 | Ephemeral | 00032_peer_credibility_schema.sql (skill_endorsements, endorsement_weights) |
| F-111 | Industry-Specific Learning Hubs | Learning | None | None | N/A | None |
| F-112 | Resume Parsing & Optimization | Candidate | resumes.ts | 1 | Ephemeral | 00009_resumes_schema.sql |
| F-113 | Recruiter Outreach Analytics | Recruiting | None | None | N/A | None |
| F-114 | Learning Impact Tracking | Analytics | learning-impact.ts | 4 | Ephemeral | 00037_learning_impact_schema.sql (learning_outcomes, learning_impact_metrics) |
| F-115 | Certification Exam Platform | Assessment | assessment.ts | 2 | Ephemeral | 00004_challenges_assessment_schema.sql |
| F-116 | Accessibility & Inclusive Learning | Platform | None | None | Stateless | None |
| F-117 | Mobile-First Job Application | Candidate | jobs.ts, applications.ts | 1 | Durable | 00001_core_schema.sql |
| F-118 | Emerging Skills Detection | Intelligence | skill-forecasting.ts | 1 | Ephemeral | 00035_skill_forecasting_schema.sql |
| F-119 | Diversity & Inclusion Analytics | Hiring | None | None | N/A | None |
| F-120 | API & Integration Platform | Platform | core.ts | All /api/v1 routes | Ephemeral | All 49 migrations |
| F-121 | Warm Introduction Paths | Networking | warm-introductions.ts | 6 | Ephemeral | 00028_warm_introductions_schema.sql (warm_introduction_preferences, warm_introduction_requests) |
| F-122 | Application Feedback Loop | Jobs | application-feedback.ts | 7 | Ephemeral | 00024_application_feedback_schema.sql (feedback_templates, application_feedback) |
| F-123 | Skill Decay Tracking (Freshness Engine) | Verification | skill-decay.ts | 4 | Ephemeral | 00025_skill_decay_schema.sql (skill_freshness, skill_freshness_history) |
| F-124 | Project Marketplace | Learning | None | None | N/A | None |
| F-125 | Alumni Networks | Networking | alumni-networks.ts | 9 | Ephemeral | 00033_alumni_networks_schema.sql (alumni_affiliations, alumni_groups, alumni_group_members, alumni_mentorship) |
| F-126 | Interview Prep Marketplace | Careers | None | None | N/A | None |
| F-127 | Company Culture Assessment | Companies | None | None | N/A | None |
| F-128 | Offer Comparison Tool | Careers | None | None | N/A | None |
| F-129 | Leadership Development | Learning | None | None | N/A | None |
| F-130 | Freelance Marketplace | Jobs | None | None | N/A | None |
| F-131 | Apprenticeship Matching | Jobs | None | None | N/A | None |
| F-132 | Scholarship Discovery | Learning | None | None | N/A | None |
| F-133 | Volunteer Matching | Community | None | None | N/A | None |
| F-134 | Code Review Practice | Skills | None | None | N/A | None |
| F-135 | System Design Practice | Skills | None | None | N/A | None |
| F-136 | Micro-Learning | Learning | None | None | N/A | None |
| F-137 | Spaced Repetition | Learning | None | None | N/A | None |
| F-138 | Study Accountability Partners | Learning | None | None | N/A | None |
| F-139 | Local Communities & Meetups | Networking | None | None | N/A | None |
| F-140 | Affinity Groups | Community | None | None | N/A | None |
| F-141 | Onboarding Preparation | Careers | None | None | N/A | None |
| F-142 | Referral Request System | Jobs | referral-requests.ts | 6 | Ephemeral | 00029_referral_requests_schema.sql (referral_requests, referral_outcomes) |
| F-143 | OSS Contribution Discovery | Portfolio | None | None | N/A | None |
| F-144 | Reputation Engine (multi-context) | Platform | reputation-engine.ts | 7 | Ephemeral | 00027_reputation_engine_schema.sql (reputation_scores, reputation_signals, reputation_history, reputation_recovery_plans) |
| F-145 | Recommendation Engine Core | Platform | search.ts, skills.ts | 2 | Ephemeral | 00002_evidence_skills_schema.sql; 00016_search_discovery_schema.sql |
| F-146 | Activity & Contribution Tracking | Platform | activity-contributions.ts | 5 | Ephemeral | 00030_activity_contributions_schema.sql (activity_events, contribution_scores) |
| F-147 | Unified Search & Discovery | Platform | search.ts | 3 | Ephemeral | 00016_search_discovery_schema.sql |
| F-148 | Instructor Reputation System | Reputation | instructor-reputation.ts | 4 | Ephemeral | 00031_instructor_reputation_schema.sql (instructor_reputation_breakdown, instructor_endorsements) |
| F-149 | Employer Reputation & Brand System | Reputation | employer-reputation.ts | 4 | Ephemeral | 00034_employer_reputation_schema.sql (employer_reputation_breakdown, employer_reviews) |
| F-150 | Peer Credibility Networks | Reputation | peer-credibility.ts | 3 | Ephemeral | 00032_peer_credibility_schema.sql (skill_endorsements, endorsement_weights) |
| F-151 | Skill Supply/Demand Forecasting | Intelligence | skill-forecasting.ts | 4 | Ephemeral | 00035_skill_forecasting_schema.sql (skill_market_signals, skill_forecasts) |
| F-152 | Career Trajectory Analysis | Intelligence | career-trajectory.ts | 5 | Ephemeral | 00036_career_trajectory_schema.sql (career_transitions, progression_benchmarks, career_milestone_evaluations) |
| F-153 | Learning Impact Dashboard (Enhanced) | Intelligence | learning-impact.ts | 4 | Ephemeral | 00037_learning_impact_schema.sql (learning_outcomes, learning_impact_metrics) |
| F-154 | Interview Prediction & Benchmarking | Intelligence | None | None | N/A | None |
| F-155 | Adaptive Learning System | Personalization | None | None | N/A | None |
| F-156 | Professional Development Plan System | Career | None | None | N/A | None |
| F-157 | Skills Co-Learning Path Optimizer | Learning | None | None | N/A | None |
| F-158 | Talent Pool Intelligence & Analytics | Recruiting | talent-pool-intelligence.ts | 4 | Ephemeral | 00038_talent_pool_intelligence_schema.sql (talent_pools, talent_pool_members) |
| F-159 | Behavioral Talent Discovery | Discovery | behavioral-talent-discovery.ts | 2 | Ephemeral | 00039_behavioral_talent_discovery_schema.sql (behavioral_talent_profiles) |
| F-160 | Talent Segmentation & Classification | Analytics | talent-segmentation.ts | 3 | Ephemeral | 00040_talent_segmentation_schema.sql (candidate_segmentations) |
| F-161 | Internal Mobility & Succession Platform | Enterprise | None | None | N/A | None |
| F-162 | Verified Work History Network & Graph | Verification | work-history-graph.ts | 1 | Durable | 00041_verified_work_history_schema.sql (verified_work_histories, employment_references) |
| F-163 | Credential Wallet & Portability | Credential | None | None | N/A | None |
| F-164 | Skills Evidence Narrative & Storytelling | Credential | portfolio.ts, evidence.ts | 2 | Durable | 00001_core_schema.sql; 00011_portfolio_showcase_schema.sql |
| F-165 | Diversity, Equity & Inclusion Data System | Analytics | None | None | N/A | None |
| F-166 | Interview Performance Benchmarking | Analytics | technical-interview.ts | 1 | Ephemeral | 00026_technical_interview_platform_schema.sql |
| F-167 | Candidate Comparison & Rubric (Enhanced) | Hiring | technical-interview.ts | 1 | Ephemeral | 00026_technical_interview_platform_schema.sql |
| F-168 | Hiring Prediction & Success Modeling | Analytics | None | None | N/A | None |
| F-169 | Community Contribution Scoring & Recognition | Community | activity-contributions.ts | 1 | Ephemeral | 00030_activity_contributions_schema.sql |
| F-170 | Expert Network (Enhanced) | Community | None | None | N/A | None |
| F-171 | Employer Brand Management System | Company | employer-reputation.ts | 2 | Ephemeral | 00034_employer_reputation_schema.sql |
| F-172 | Advanced Compensation Intelligence | Analytics | salary-intelligence.ts | 1 | Ephemeral | 00023_salary_intelligence_schema.sql |
| F-173 | Company-to-Skills Mapping | Intelligence | skills.ts, jobs.ts | 2 | Durable | 00002_evidence_skills_schema.sql; 00003_jobs_applications_schema.sql (job_skills) |

## 10. Selected end-to-end flow traces recorded on 2026-10-21 (FEATURE_STATUS D)

Each trace is UI, then API and authorization, then domain, then storage and asynchronous work, then outcome. None is a certification; J-05 to J-28 not covered were explicitly unverified.

| Journey | Trace | Evidence and limits recorded |
|---|---|---|
| Identity and session (supports all) | Sign-up, login, profile pages; auth and profile routes with session extraction and resolution; auth and profile domain; users, profiles, revocations in the core store; session UI | `auth-profile`, `session-sign-out` and production-config tests passed in memory; PG account authority differs from test token shortcuts; browser reload and multi-tab not run |
| Work-history proof (F-94, F-162) | Evidence and reference pages; owner check, mailbox challenge, token check; work-history graph domain; core store plus queued mail; badge and graph | Challenge hashed, expiring, bounded attempts; referee token mandatory and consumed; mocked mail adapter and authorization tests passed; real mailbox, PG race and restart not executed |
| J-02 apply and track | Jobs, job detail, applications; publish, ownership and eligibility checks; jobs and applications domain; guarded core transaction plus notification; application status | API tests passed; PG BR-15 duplicate and reapply tests exist but not run; full interview, offer, outcome terminal not proven |
| J-03 and J-04 recruiter | Hiring pages; organization membership and role checks; job and application transitions; core plus notifications; pipeline | Subset supported; organization lifecycle, scorecards, interviews and actual hire acceptance not fully traced |
| Communication | Messages, conversation, notifications; participant and recipient checks; messaging and notifications domain; core transaction; thread and badge | Memory tests passed; dedicated PG tests exist; browser delivery, reload, multi-user races and external notification delivery unverified |
| Account deletion | Profile and settings; session and erasure routes; settings anonymization; core commit, then separate queue, account, bookmark, search and request operations; deactivation | Request, status, cancel durable; cross-store failure after deactivation can strand cleanup (D-03); no due-date executor or approved retention and backup policy |
| J-01 and J-19 learning and proof | Learning and course pages; enrollment and prerequisite checks; LMS domain; process-local module, lesson, progress, certificate state; evidence in the core store | Helper and API tests passed; reload within one process is not restart durability; no full Learn, Prove, Showcase acceptance |
| J-26 career | Career, skills, career-paths components; readiness, relationship, transition APIs; career and skills rules; mixed ephemeral graph data | UI source existed; model validity, cohort boundaries, persistence and full transition outcome unverified |
| Monetization | Checkout shows plans; billing gate defaults disabled; billing domain; simulated process state only if permitted | Production simulation refusal tested; no live payment flow |

Architecture assessment of the same date (condensed): React/Vite to Fastify to shared contracts and domain to PostgreSQL plus an in-process read model, plus a separate PostgreSQL job worker; core operations committed before maps are updated; hydration reads the core dataset at boot (volume limits unmeasured); static route count 274 registrations, 70 durable-registry entries, 3 stateless, 201 ephemeral-header routes, which are labels and not 70 proven durable workflows; 51 SQL files; the AI assistant was a local heuristic and two assistant routes call the assessment-AI check; browser sessions were bearer tokens in storage; no rewrite or route-module split was justified merely by server size; profile measured boot and hot paths before changing the persistence design.

Matrix recommendations of 2026-10-22: the 26 "Full" features formed the closed core loop (identity F-01, 03, 12, 15, 60, 65, 80; skills and evidence F-84, 96, 173; proof of control F-58, 94, 162; marketplace and hiring F-04, 05, 06, 25, 32, 56, 102, 117; communication F-10, 14, 29; resilience F-02, 21); durability migration order for partial features F-08, F-07, F-36, F-26, F-17. Several of those "Full" labels were later rated partial or not implemented (lessons LES-06).


<!-- ledger-D D-13 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/FEATURE_STATUS_2026-10-21.md (gap closure D-13)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: 19 code/line tokens (`server.ts:5449`, `background-jobs.ts:441,462`, `apps/worker/src/claim.ts:74,90,93`, `tests/security/injection-defenses.test.ts:210-223`, ...) and the defect register D-01..D-10 rows (lines 298-310). The 173 status/expected/actual rows remain in `AUDIT_FEATURE_EVIDENCE_CROSSWALK.csv`.

~~~~text
L23: - Started on `main`, HEAD `a30b35bfb01d648632e8df57ab378c00ca9313aa`, with 27 staged entries. These included career/learning/profile/challenge UI, tests, maintenance documentation, deletion of six temporary E2E specs, and deletion of protected `apps/web/vite.audit.config.ts` and `playwright.audit.config.ts`.
[...]
L34: | `pnpm.cmd lint` | FAIL: exit 1 | `CareerPaths.tsx`, root `ARCHITECTURE.md`, and five `graphify-out` files listed in JSON. No write-formatting performed. |
[...]
L45: The Vitest reporter counts 458 suites including nested `describe` blocks; **115** is the file count. Do not confuse those numbers. The security test in `tests/security/injection-defenses.test.ts:210` catches a failed shell `grep` and substitutes an empty result. `Get-Command grep` found no executable here, so its passing assertion is not reliable secret-scan evidence on this host.
[...]
L298: | ID | Finding | Evidence | Severity | Scope/impact | Dependencies | Fix/next action | Verification | Status |
L299: |---|---|---|---|---|---|---|---|---|
L300: | D-01 | Unexecuted challenge receives passing score | `packages/domain/src/assessment.ts:97`; API submit at `server.ts:4612`; source probe `this is not executable code` → passed/100, executed=false | P0 before scored assessment exposure | F-08; misleading API assessment result, though evidence stays unverified | #49 trust/execution contract | X-05: submission-only result or fail-closed scoring until isolated executor approved | Arbitrary/wrong/malicious input never reports genuine pass; preserve AI policy and evidence trust tests | Reproduced source evaluator; API wiring statically traced |
L301: | D-02 | Batch lease expires before sequential jobs run | `apps/worker/src/claim.ts:74,90,93`; `background-jobs.ts:441,462` | P0 for reliable verification delivery | Two workers can execute one claimed job twice; later completion lacks claim-owner fencing | #44/#47 | X-06: claim only executable capacity, then fence acknowledgements; keep mail idempotency | Six jobs, two workers, slow handlers: each claimed execution bounded; stale owner cannot acknowledge newer claim | Reproduced synthetic memory-store probe: 6 jobs, 9 executions, 3 duplicates; PG/provider not tested |
L302: | D-03 | Erasure commits deactivation before all cleanup succeeds | `server.ts:10423–10495`; `resolveSession` rejects closed account at 829 | P0 privacy/recovery gate | Failure of later metadata/search/request operation leaves partial cleanup and no ordinary user retry | #45 policy; failure-injection test | X-07: durable resumable cleanup or transaction for owned SQL data; visible operator recovery | Inject failure after core commit; restart; complete cleanup exactly once while user remains closed | Static failure-path finding; not runtime reproduced |
L303: | D-04 | Email and legal readiness missing | mail-provider adapter plus #44/#45 comments | P0 release gate | Verification cannot be accepted without inbox proof; legal/contact/retention acceptance absent | Owner/provider/legal | X-02/X-07: configure existing adapter, approve policy and monitored contacts | Live inbox/token/replay/expiry/retry; counsel/owner record, erasure drill | External evidence/decision gap; not missing-adapter defect |
L304: | D-05 | Selected visible state remains ephemeral | server Maps, route ledger; network/portfolio/course code | P1, P0 if included as reliable launch promise | F-09/26/07 and drafts/alerts can lose state after restart | #48 and approved scope | X-01: complete one approved vertical slice at a time; retain truthful preview restrictions elsewhere | PG rows/restart/concurrent user/erasure plus full UI outcome | Source-confirmed limitation; restart not run |
L305: | D-06 | Current release evidence incomplete | CI lookup empty; DB env absent; protected-file build limits | P0 release gate | Green memory tests do not prove deployed product | #46/#47, build authorization/environment | X-00/X-08/X-09: clean permitted environment, populated migration, live drills | Exact-SHA CI, hosted RLS, HTTPS/worker-kill, restore/rollback, load/cold boot | Blocked verification |
L306: | D-07 | Secret-scan test passes on shell failure | `tests/security/injection-defenses.test.ts:210–223`; no `grep` command found here | P1 quality | A broken scanner can look clean | None for test fix | X-10: portable read-only source scan; fail on execution error | Seed synthetic match and scanner failure; both must fail | Confirmed static test weakness; no leaked secret alleged |
L307: | D-08 | Formatting gate already red | `pnpm.cmd lint`, seven paths in ledger | P2 locally; gate blocks merging | Existing source/docs/graph artifacts | Owner of pre-existing edits; protected-format controls unchanged | X-10: bounded authorized formatting fixes; do not run repository-wide writer | Prettier read-only check on intended diff then root check | Current command failed; no formatting fixes made |
L308: | O-01 | ADR-015/schema ratification | ADR status, #46 | P0 before populated migration | Uniqueness/FKs/token backfill semantics | Product/architecture owner | Ratify actual architecture and rehearse snapshot upgrade/rollback | Signed decision plus observed constraints/backfill results | Open decision |
L309: | O-02 | Beta/GA scope and commercial policy | PRD §8; #50; OD-34/35 | P1, release gating | Free-only vs payment provider; narrow beta vs full loop | Product owner | X-03: explicit free-only or approved paid scope; preserve disabled default | Consistent UI/API entitlement behavior | Open decision; free-only is recommendation |
L310: | O-03 | Trust, sessions and consequential logic | #49; SSOT E; work-history scorer | P1, release gating where exposed | Badge legacy values, real executor, cookies/CSRF, predictive hiring | Security/product/governance owners | Approve separate designs; no incidental provider/cookie/scoring migration | Adversarial trust/session tests and owner acceptance | Open decision |
[...]
L343: (`apps/api/src/server.ts:5449`) replaces three certificate Map entries and appends
[...]
L345: revocation (`server.ts:1559`) persists evidence but does not update a linked
[...]
L365: **D-01:** call the current source `evaluateChallengeSubmission` with a candidate UUID, allowed language `javascript`, one input/output test case, and code `this is not executable code`. The probe asserted `score === 100` and `evidence.metadata.executed === false`; result was `passed`, verification `unverified`. The source function was transpiled in memory; core/evidence/challenge dependencies came from existing `dist`. Existing integration tests explicitly expect the simulated 100, illustrating why a passing suite alone is insufficient.
[...]
L369: **D-03:** the failure injection to implement is a rejection of `accountMetadata.erase()` after `persist(...erasureOps)` succeeds. The account is already deactivated; `resolveSession` rejects the next user request, so recovery must be durable/operator-driven. The source demonstrates the ordering; no DB fault was injected in this audit.
[...]
L618: | Registry F-29: scheduled digest | Only an `emailDigestFrequency` preference. The worker has no digest job. |
[...]
L641: 5. **Quiz and course reviews (F-68, F-72).** `LessonContentType` already includes `quiz`, and the instructor review pattern can be reused for course ratings.
~~~~


<!-- ledger-D D-14 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/FEATURE_TRACEABILITY_MATRIX.md (gap closure D-14)

Frame: nothing is implemented in this project. The prior attempt's 173-feature traceability matrix (per-feature endpoint lists and UI component names, 174 rows not previously verbatim) and the two notes the earlier merge dropped (repository URL `https://github.com/yhsomani/talentsphere-complete.git` on line 7 and the `storage.core.persist()` migration note on line 258) are now quoted in full, line numbered, in [`LEGACY_TRACEABILITY_MATRIX_ROWS_FROM_PRIOR_ATTEMPT.md`](LEGACY_TRACEABILITY_MATRIX_ROWS_FROM_PRIOR_ATTEMPT.md). Evidence about the prior attempt only.


<!-- ledger-D D-24 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json (the 8 partially preserved members, gap closure D-24)

Frame: nothing is implemented in this project. The 1.83 MB JSON is the prior attempt's machine evidence (2026-10-21, source head `a771a87b`). It stays archived and unmodified. The preservation audit found 9 of its 17 top-level members effectively preserved (remote, journeys, routes, migrations, inventory, tests, probes, summaryCounts, documentationCrossCheck) and 8 only partly preserved. This section lists, per partial member, what was not preserved and how to recover it; where the missing content is small it is quoted verbatim below, and where it is per-row it is exported to two CSV files in this folder. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

| # | Member | Not preserved by the earlier merge | Closure now | How to recover the rest |
|---|---|---|---|---|
| 2 | `snapshot` | `initialStagedEntries` provenance (27 entries) and 8 paths; `concurrentChange`; `sourceHashComparison.limitation` | Quoted verbatim below | Not needed; complete below |
| 3 | `method` | the method sentence | Quoted verbatim below | Not needed; complete below |
| 4 | `features` (173 x 32 fields) | `referenceCandidates` excerpts (688), `testEvidence.association` (375), `subfeatures` text (174), `maturity` (10 dimensions x 173), `nextAction` (173), `verificationLimitation` (173, one distinct value), `previousAssessment` (21 non-empty), `canonicalContract` (46) | `nextAction`, `previousAssessment`, all `maturity.*` dimensions, `verificationLimitation`, `dataLineage` and `releaseDeferralConsequence` exported per feature to [`LEGACY_AUDIT_JSON_PER_FEATURE_JUDGEMENTS.csv`](LEGACY_AUDIT_JSON_PER_FEATURE_JUDGEMENTS.csv) | `referenceCandidates`, `testEvidence.association`: open the archived JSON, read `features[i].referenceCandidates` / `features[i].testEvidence.association` by `id` (prior-code evidence, not requirements). `subfeatures` and `canonicalContract` derive from `SSOT.md` (retained) and its 46 contract headings (see this index, intended contracts) |
| 5 | `businessRules` (248) | `references[].excerpt` (1,003 prior-code excerpts), `nextAction` (248), 47 reference line numbers | `nextAction`, `sourceLine`, `status`, `associationWarning` exported per rule to [`LEGACY_AUDIT_JSON_PER_BUSINESS_RULE_JUDGEMENTS.csv`](LEGACY_AUDIT_JSON_PER_BUSINESS_RULE_JUDGEMENTS.csv); ids and rule text already in `06_BUSINESS_PROCESSES/LEGACY_BR_CATALOGUE_BR001_BR248.md` | `references[].excerpt` and line numbers: archived JSON, `businessRules[i].references` by `id` (excerpts of prior code only) |
| 12 | `inspectionLimitations` | 5 limitation sentences | Quoted verbatim below | Not needed |
| 13 | `contractInventory` | `source` and `limitation` text | Quoted verbatim below | Not needed |
| 15 | `artifactValidation` | `checks` and `diffWhitespaceCheck` text | Quoted verbatim below | Not needed |
| 17 | `focusedContractReviews` | source lines, command, result, observed, limits (defects D-09, D-10) | Quoted verbatim below | Not needed |

Also quoted below because the audit counted a few strings as missing: member 10 `tests` (command, limitations, nonEmittingTypechecks) and member 16 `documentationCrossCheck` (limits sentences, routeCountingScope).

Recovery commands (read-only; run from the repository root against the archived file, do not write into the archive):

~~~~text
python -I -c "import json,sys;d=json.load(open('Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json',encoding='utf-8'));print(json.dumps(d['features'][0]['referenceCandidates'],indent=1))"
python -I -c "import json,sys;d=json.load(open('Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json',encoding='utf-8'));print(json.dumps(d['businessRules'][0]['references'],indent=1))"
~~~~

**method (member 3)**

~~~~json
"Current static reference inventory with targeted deep traces and memory-mode tests. Candidate associations are not proofs of implementation or requirements coverage."
~~~~

**snapshot without initialStagedEntries (member 2)**

~~~~json
{
 "date": "2026-10-21 America/Los_Angeles",
 "initialHead": "a30b35bfb01d648632e8df57ab378c00ca9313aa",
 "finalSourceHead": "a771a87be85869fac4cf30c16cab7f4c715a6178",
 "branch": "main",
 "concurrentChange": "Initial staged work committed externally during audit; no commit made by auditor",
 "node": "24.19.0",
 "pnpm": "11.7.0",
 "sourceHashComparison": {
  "baselineHead": "a771a87be85869fac4cf30c16cab7f4c715a6178",
  "changedTrackedFiles": [
   "ARCHITECTURE.md",
   "BRAIN/MEMORY.md",
   "SSOT.md",
   "docs/INDEX.md",
   "docs/experience/APP_FLOW.md",
   "docs/governance/IMPLEMENTATION_PLAN.md",
   "docs/reports/FEATURE_PLAN_2026-10-21.md",
   "docs/reports/FEATURE_STATUS_2026-10-21.md"
  ],
  "productSourceChanged": false,
  "protectedTrackedFilesChanged": false,
  "limitation": "Compared tracked-file SHA-256 snapshots after external commit; ignored build caches were not comprehensively hashed. Native config/no-cache/non-emitting commands were used."
 }
}
~~~~

**snapshot.initialStagedEntries (27 entries, `status path | provenance`)**

~~~~text
M apps/web/src/App.tsx | Initial git status recorded same staged path; committed externally during audit
A apps/web/src/components/CareerPaths.tsx | Initial git status recorded same staged path; committed externally during audit
A apps/web/src/components/SkillsSection.tsx | Initial git status recorded same staged path; committed externally during audit
A apps/web/src/lib/career.ts | Initial git status recorded same staged path; committed externally during audit
A apps/web/src/lib/course.ts | Initial git status recorded same staged path; committed externally during audit
M apps/web/src/pages/AssessmentsPage.tsx | Initial git status recorded same staged path; committed externally during audit
A apps/web/src/pages/CareerPage.tsx | Initial git status recorded same staged path; committed externally during audit
A apps/web/src/pages/CoursePage.tsx | Initial git status recorded same staged path; committed externally during audit
M apps/web/src/pages/LearningPage.tsx | Initial git status recorded same staged path; committed externally during audit
M apps/web/src/pages/ProfilePage.tsx | Initial git status recorded same staged path; committed externally during audit
D apps/web/vite.audit.config.ts | Initial git status recorded same staged path; committed externally during audit
A docs/engineering/PROJECT_MAINTENANCE.md | Initial git status recorded same staged path; committed externally during audit
M docs/reports/MAINTENANCE_AUDIT_2026-10-21.md | Initial git status recorded same staged path; committed externally during audit
D playwright.audit.config.ts | Initial git status recorded same staged path; committed externally during audit
D tests/e2e/_tmp_accessibility.spec.ts | Initial git status recorded same staged path; committed externally during audit
D tests/e2e/_tmp_account-security.spec.ts | Initial git status recorded same staged path; committed externally during audit
D tests/e2e/_tmp_auth-profile.spec.ts | Initial git status recorded same staged path; committed externally during audit
D tests/e2e/_tmp_frontend-fixes.spec.ts | Initial git status recorded same staged path; committed externally during audit
D tests/e2e/_tmp_portfolio-resumes.spec.ts | Initial git status recorded same staged path; committed externally during audit
D tests/e2e/_tmp_responsive.spec.ts | Initial git status recorded same staged path; committed externally during audit
A tests/e2e/career-readiness.spec.ts | Initial git status recorded same staged path; committed externally during audit
A tests/e2e/challenges.spec.ts | Initial git status recorded same staged path; committed externally during audit
A tests/e2e/lesson-player.spec.ts | Initial git status recorded same staged path; committed externally during audit
A tests/e2e/skills-graph.spec.ts | Initial git status recorded same staged path; committed externally during audit
M tests/e2e/web-ui.spec.ts | Initial git status recorded same staged path; committed externally during audit
A tests/unit/web-career.test.ts | Initial git status recorded same staged path; committed externally during audit
A tests/unit/web-course.test.ts | Initial git status recorded same staged path; committed externally during audit
~~~~

**inspectionLimitations (member 12)**

~~~~json
[
 "Not all SSOT/PRD/TRD prose converted to atomic requirements",
 "Feature references and domain candidates are not full call-graph proofs",
 "All 28 journeys inventoried, selected subsets traced, none run end to end",
 "No actual database migration state or provider/deployment acceptance",
 "No compatible document/presentation template export capability"
]
~~~~

**contractInventory (member 13)**

~~~~json
{
 "mappedFeatures": 46,
 "source": "SSOT detailed feature headings",
 "limitation": "Top-level numbered behavior and declared fields extracted; atomic semantic coverage not certified"
}
~~~~

**artifactValidation (member 15)**

~~~~json
{
 "features": 173,
 "businessRules": 248,
 "journeys": 28,
 "featureBacklogPackets": 169,
 "tests": 1172,
 "testFiles": 115,
 "checks": "Unique IDs, source/test/UI path existence, line bounds, backlog coverage, all test assertions passed, migration hashes unchanged, tracked changes documentation-only",
 "passed": true,
 "diffWhitespaceCheck": "passed after correcting audit-added trailing whitespace; pre-existing formatting failures remain"
}
~~~~

**focusedContractReviews (member 17)**

~~~~json
[
 {
  "featureIds": [
   "F-07",
   "F-52"
  ],
  "finding": "D-09",
  "canonicalRule": "BR-048",
  "requirement": "Final assessment >=70% before course completion",
  "source": "apps/api/src/server.ts:5254",
  "observed": "Completed lesson count alone triggers completed enrollment, authority_verified evidence and verified certificate.",
  "test": "tests/integration/lms-courses.test.ts",
  "command": "node node_modules/vitest/vitest.mjs run tests/integration/lms-courses.test.ts --configLoader native --no-cache --reporter=dot",
  "result": "6 passed; existing test asserts certificate after three lesson completions without any assessment",
  "limits": [
   "Memory mode; existing built workspace dependencies",
   "No browser or PostgreSQL execution",
   "Persist-failure retry hazard statically inspected, not fault-injected"
  ],
  "backlog": "X-11"
 },
 {
  "featureIds": [
   "F-52",
   "F-96"
  ],
  "finding": "D-10",
  "requirement": "SSOT 6.3 dependent signal invalidation; BR-149 append-only history",
  "source": [
   "apps/api/src/server.ts:5449",
   "apps/api/src/server.ts:1559",
   "apps/worker/src/index.ts:30"
  ],
  "observed": "Certificate/evidence revocation updates independent records; verification reads independent hashes; worker only records event.",
  "verification": "Static source tracing; cross-proof and restart test not executed",
  "backlog": "X-11"
 }
]
~~~~

**tests without the 115-file list (member 10: command, limitations, nonEmittingTypechecks and totals)**

~~~~json
{
 "command": "node node_modules/vitest/vitest.mjs run --configLoader native --no-cache --reporter=json --outputFile=$env:TEMP/talentsphere-audit-vitest.json",
 "passed": 1172,
 "failed": 0,
 "pending": 0,
 "limitations": "Memory mode; workspace dependencies may resolve pre-existing dist outputs; no clean build or PostgreSQL/browser proof",
 "migrationHistory": {
  "passed": 5,
  "failed": 0
 },
 "nonEmittingTypechecks": "All 10 tsconfig projects passed with --noEmit --incremental false --composite false --declaration false --declarationMap false",
 "lint": {
  "exitCode": 1,
  "files": [
   "apps/web/src/components/CareerPaths.tsx",
   "ARCHITECTURE.md",
   "graphify-out/.graphify_labels.json",
   "graphify-out/cost.json",
   "graphify-out/GRAPH_REPORT.md",
   "graphify-out/graph.json",
   "graphify-out/manifest.json"
  ]
 }
}
~~~~

**documentationCrossCheck without the 46-document list (member 16: limits, routeCountingScope and counts)**

~~~~json
{
 "sourceHead": "a771a87be85869fac4cf30c16cab7f4c715a6178",
 "trackedMarkdownFilesScanned": 46,
 "missingRelativeLinkTargets": [],
 "browserRouteDeclarations": 30,
 "routeCountingScope": "Includes layout, index and catch-all; not 30 unique user journeys",
 "missingHistoricalDeliverables": [
  "project-maintenance.sh",
  "scripts/tests/project-maintenance.test.sh"
 ],
 "changesSinceSourceSnapshot": [
  "ARCHITECTURE.md",
  "BRAIN/MEMORY.md",
  "README.md",
  "SSOT.md",
  "docs/INDEX.md",
  "docs/engineering/API_CONTRACTS.md",
  "docs/engineering/DATABASE.md",
  "docs/engineering/PROJECT_MAINTENANCE.md",
  "docs/experience/APP_FLOW.md",
  "docs/experience/JOURNEY_REGISTRY.md",
  "docs/governance/GAP_ANALYSIS.md",
  "docs/governance/IMPLEMENTATION_PLAN.md",
  "docs/quality/OPERATIONS.md",
  "docs/quality/SECURITY.md",
  "docs/quality/TESTING.md",
  "docs/registries/BUSINESS_RULE_REGISTRY.md",
  "docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md",
  "docs/reports/E2E_AUDIT_2026-10-21.md",
  "docs/reports/FEATURE_PLAN_2026-10-21.md",
  "docs/reports/FEATURE_STATUS_2026-10-21.md",
  "docs/reports/FINAL_VALIDATION_REPORT.md",
  "docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md",
  "docs/reports/MAINTENANCE_AUDIT_2026-10-21.md",
  "docs/superpowers/plans/2026-10-21-project-maintenance.md"
 ],
 "nonMarkdownTrackedChangesSinceSourceSnapshot": [],
 "limits": [
  "Link scan checks local file existence, not heading anchors or external URLs.",
  "Document scan is not semantic acceptance of every feature, rule or journey.",
  "Protected deploy documents were read only. Historical implementation claims are retained with current-checkout corrections."
 ]
}
~~~~

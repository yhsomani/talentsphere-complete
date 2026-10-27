# Legacy Merge B-16a: Testing Strategy, Commands, CI Gates, Audit Method and ADR-016 (Prior Attempt) Reconciled to the Target QA Strategy

Doc ID: LGM-B-16A · Owner: QA Architect · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: QA-STRAT, QA-CAT, QA-CAT-R2, QA-AC, OPS-REL, TRC-COV, ADR-T05, ADR-T13 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/quality/TESTING.md` v6.0 (8.9 KB), `31_LEGACY_ARCHIVE/docs/system-model/05-audit.md`, `31_LEGACY_ARCHIVE/docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md`, the testing-architecture section of root `ARCHITECTURE.md`. Companion: `LEGACY_MERGE_CONDITION_MATRIX.md` (the 62-rule condition matrix).

## 0. Frame

- **No test exists in this project.** Every count below (1,172 / 1,266 assertions, 236 / 256 e2e tests, and so on) is a **prior-attempt measurement at a named earlier snapshot**; none is a baseline for this project. They are kept as evidence of scale, as a record of what the prior attempt did *not* test, and as test-design seeds.
- "Target requires" lines are additions or reconciliations to QA-STRAT / QA-CAT.

## 1. Historical measured baselines (prior attempt) and their limits

| Snapshot | Result reported | Limit the prior docs stated |
|---|---|---|
| `a771a87b`, 2026-10-21 | 1,172 passing Vitest assertions across 115 files; 5 passing migration-helper tests; 10 project type-checks passed with emission and incremental output disabled; lint failed on 7 files | Used existing built workspace dependencies; no fresh source build, no PostgreSQL behaviour, no browser acceptance, no deployment readiness |
| 2026-10-23 (system-model audit) | `pnpm test` (unit, integration, security): 120 files, 1,266 tests, all pass; `pnpm lint` passes; API and test-project `tsc --noEmit` no errors; `pnpm build` (owner-approved) all packages and apps build; `pnpm test:e2e` (Playwright, Chromium, one worker): 256 passed in 5.0 minutes | **Not run:** `pnpm test:pg` (needs `TEST_DATABASE_URL`; no throwaway database), any test against live Stripe or hosted database, any deployment. An earlier e2e run found 17 failures in 8 specs that depended on removed sample content; fixed by creating the content through the API and re-running |

Other reported weaknesses to test against in a new build:

- The assessment suite accepted simulated scoring; an injection scan could pass when its external grep command was unavailable (a test that passes when its tool is missing is a defect - this is already QA-STRAT principle 2); the audit's worker probe reproduced duplicate execution outside the ordinary suite.
- Unit tests imported source while the API imported *built* workspace packages; stale build output could produce misleading results; shared test signing keys kept copies compatible but did not prove matching source.
- Agent constraint (prior attempt): checks had to respect a build-file restriction - no emitting builds, no installs, no tool caches. Read-only alternatives were documented:
  - type-check one project without emitting: `node node_modules/typescript/bin/tsc -p apps/api/tsconfig.json --noEmit --incremental false --composite false --declaration false --declarationMap false`
  - run tests without config bundling or cache writes: `node node_modules/vitest/vitest.mjs run --configLoader native --no-cache`
  - the root `typecheck` ran `tsc -b`, which emits protected files.
  - Default Playwright startup used compiled outputs; installing a browser, rebuilding outputs or starting the dev server could write protected paths.
- **Target requires:** CI uses one reproducible build per run and tests run against that artifact (or source), never a cached `dist`; a documented "no-write verification" command set for agent sessions is a nice-to-have, tracked as **L-B16-04**.

## 2. Philosophy, layers and coverage ownership (legacy section 1-3), preserved

- "Tests prove intended behavior, not accidental current behavior."
- Layers: Unit -> Component -> Integration -> API/Contract -> E2E -> Security -> Accessibility -> Performance -> Failure/Recovery -> Regression.
- Ownership: **Unit** domain rules, pure transformations, scoring, matching explanations, state transitions. **Component** UI states, forms, validation, accessibility behaviour. **Integration** database, RLS, queues, provider adapters, transactional workflows. **API** authZ, schema validation, pagination, errors, idempotency, rate limits. **E2E** critical user journeys. **Security** authorization fuzzing, RLS deny tests, tenant isolation, SSRF, upload, webhook replay, secrets. **Accessibility** keyboard, focus, semantics, screen reader, zoom, contrast, reduced motion. **Performance** route startup, interaction latency, API p95/p99, DB queries, queue age.
- Rule kept: "Only layers with executable coverage are listed. A layer named but absent has **no** dedicated suite yet and must not be reported as covered."

### 2.1 Layers and commands reported (prior attempt)

| Layer | Command | Runner | Status reported |
|---|---|---|---|
| Unit | `pnpm test:unit` | Vitest | Executable |
| Integration | `pnpm test:integration` | Vitest + in-process HTTP injection (`app.inject`) | Executable |
| API/Contract | `pnpm test` | Vitest + `app.inject` | Executable |
| Security | `pnpm test:security` | Vitest + `app.inject` | Executable |
| E2E | `pnpm test:e2e` | Playwright (Chromium) | Executable |
| Accessibility | `pnpm test:a11y` | Playwright (Chromium) | Executable (limits below) |
| Performance | `pnpm test:performance` | Playwright (Chromium) | Baseline + regression guards only |
| Durability | `pnpm test:pg` | Vitest + real PostgreSQL | Executable when `TEST_DATABASE_URL` is set (separate config) |

Accessibility and performance ran inside the full `pnpm test:e2e` gate so neither could be skipped by merging. Reported test volumes at the 2026-10-23 audit by area: unit 64 files, integration 51, security 5, e2e 59, pg 12 (plus helpers); 201 tracked test files total.

**Accessibility coverage reported:** real Chromium, no jsdom: semantics, landmarks, heading order, accessible names (including `<label for>` association), image `alt`, positive `tabindex`, skip link, keyboard reachability, visible focus, 320 px reflow, 200% zoom, `prefers-reduced-motion`. **Not covered:** automated contrast checking (the axe engine was not a dependency) and screen-reader verification; "contrast and screen-reader conformance remain unverified by automation and need manual audit before an accessibility claim is made."

**Performance coverage reported:** an e2e spec measured route startup, client interaction and API latency, wrote percentiles as JSON artifacts uploaded in CI, and asserted **gross-regression guards only** (a route stops rendering, an API stops responding), not SLOs, because SLOs were deferred until baseline measurement; ratifying SLOs would convert the layer into a budget check. Not measured: DB query counts, queue age.

**Target requires:** axe-class automated scan **plus** manual assistive-technology pass (QA-STRAT section 3, RG-06); performance budgets from WP-LOADBASE (OPEN-15); DB query-count and queue-age metrics included in the performance layer.

## 3. Critical E2E suites, assessment, AI and data-integrity test lists (legacy sections 5-8)

- **Candidate:** signup -> goal -> skills -> learning -> assessment -> evidence -> job -> apply.
- **Recruiter:** org -> job -> search -> review -> message -> interview -> decision.
- **Institution:** tenant -> learner -> learning -> assessment -> credential -> verification.
- **Assessment security tests:** session binding; timing; submission idempotency; answer protection; `AI_PROHIBITED` enforcement; AI escape-route closure; suspicious event capture; retry behaviour; replay resistance.
- **AI tests:** prompt injection; data boundary enforcement; provider fallback; free-user cost gate; provenance; malformed model output; policy denial; context minimization; hallucination/groundedness eval where applicable.
- **Data integrity tests:** unique constraints; FK constraints; state transition validity; audit records; evidence revocation impact; tenant isolation; migration verification.
- **Target mapping:** QA-STRAT section 5 (journeys J1-J14) and QA-CAT (TEST-* ids). Check that each bullet above has at least one TEST-id; where not, add (gap check **L-B16-05**, owner QA Architect).

## 4. Flaky-test policy and CI gates - conflict recorded

Legacy policy: "A flaky test is a defect. Do not permanently quarantine critical tests without owner, reason and removal deadline." CI enforced, in order, on every push and pull request:

1. frozen-lockfile install;
2. lint (formatter check);
3. typecheck: project build mode, then a separate type-check of the test projects ("Vitest and Playwright strip types without checking them");
4. unit, integration, API and security tests;
5. build of all packages and apps;
6. e2e (including accessibility and performance).

`noUnusedLocals` and `noUnusedParameters` were enabled in every project tsconfig so dead imports, locals and parameters failed the build ("deleting dead code is a compiler-enforced rule, not a review convention"); intentionally-unused parameters take a leading underscore; parameters in a published or cross-package signature are prefixed rather than removed. Playwright ran with `retries: 0` and `forbidOnly` in CI (flaky = defect, not something to absorb with retries); traces uploaded on failure; the performance baseline uploaded on every run. A migration-idempotency step and a PostgreSQL service container ran the durability suites.

**Conflict L-B16-01 (open):** legacy policy = **no retries**; target QA-STRAT section 7 = **at most one automatic retry for E2E/device tests** with quarantine within one cycle and flake-rate reporting. **Decision needed (owner: QA Architect):** keep the target (device and network flake is real) but add the legacy guard that every retry is reported and that unit/integration tests have no retries (already in target); also adopt `forbidOnly` in CI and the "typecheck the test projects" step as explicit gates (not yet explicit in RG-01). **L-B16-02:** adopt the compiler-enforced unused-code rule as RG-01 sub-gate.

## 5. Production verification (legacy section 11)

Post-deploy smoke tests verify: authentication; authorization; critical API; database connectivity; queue health; storage; observability; critical user journey. **Target:** matches OPS-REL post-deploy synthetic checks; confirm "queue health" and "authorization" smokes are both present (gap check L-B16-05).

## 6. Prior-attempt verification-method notes worth keeping (from the system-model audit)

- Audit method A-I: (A) code-to-flowchart: five investigators cited `path:line`, an independent reviewer re-checked 14 claims, 11 confirmed, 3 corrected in documents, 4 omissions added; (B) requirements-to-flowchart: not a full pass; (C) documentation-to-code: 21 open discrepancies recorded; (D) decision-branch completeness; (E) cross-module consistency found the "any organization membership" pattern, two different "who is a recruiter" checks and role strings outside the role union; (F) conflict closure: seven resolved and verified, the rest open, seven carrying "no decision made - owner's choice"; (G) regression coverage; (H) adversarial review by an independent agent; (I) final evidence check (each completion claim names a command or `path:line`).
- Limits stated by the prior audit that this project should avoid: "no automated test that the diagrams match the code"; per-route request schemas, several domain helpers, storage SQL, rate limiting and the error handler were not read; GitHub issue threads read through the public API only; no production/staging behaviour observed; the "council" was five investigators and one reviewer, all AI agents working from code, no human approved a decision; line numbers drift (two drifted during the work).
- **Target requires:** diagram-vs-code consistency is a CI check once code exists (generate flows from the state-machine tables where possible); decisions are approved by named humans in the ADR register, never by agent consensus; cite stable symbols rather than line numbers.
- Traceability sample the prior attempt completed (the only rows it verified): BR-15 one active application per job/candidate (code + partial unique index + integration test); BR-160 benchmarks need at least 20 *different people* (unit + integration + e2e); BR-189 learning impact needs a cohort of 30; webhook signature over raw body, replay safe (fake-gateway tests); production email-delivery gate; "one-time referee link (no expiry)" had **no** expiry test - gap CF-10 (since fixed with a 30-day limit and a moved-clock test). **Target:** these are candidate TEST ids: add a moved-clock (time-travel) test helper to the test platform so expiry rules (reference link, 15-minute email challenge, session cutoff) are testable.
- Undocumented behaviours the prior audit noticed but did not classify: job-alert evaluation on publish (memory only), a public challenge list, unlinked routes. **Target:** none inherited.

## 7. ADR-016 - "Measure UI quality in a real browser, and test it adversarially" (verbatim prior-attempt record)

Status in the prior attempt: **Proposed** (a test-strategy decision; no schema, auth or pricing change); a companion AI-employee tooling note and local-machine paths in the source are omitted from decisions here but are retained verbatim in the archive. **Target stance:** the substance (gates measured in a real browser; hostile-use assertions are about app misbehaviour, not screenshot match) is adopted as a proposal for QA-STRAT; the tooling-specific action items are not carried.

- **Status:** Proposed (a test-strategy decision; no schema, auth or pricing change).
- **Date:** 2026-10-23
- **Deciders:** product owner, whoever maintains `apps/web`.

## Context

The web app (`apps/web`, React 19 + Vite) is verified by Vitest for logic and by Playwright for the UI. The Playwright suite (`tests/e2e`, 236 tests at the time of writing) already measures accessibility (`accessibility.spec.ts`) and layout from 320 px to 2560 px (`responsive.spec.ts`). Two angles were missing: input a hostile user would send, and a sweep that every page loads without script errors or server faults. A "Web Dev Employee" (an AI Employee kit, hired 2026-10-23 into `C:\Users\yashs\ai-employees\web-dev-employee`) will also propose UI changes, so the gates it must pass need to be written down.

## Decision

1. UI quality is measured in Chromium against the built app, with real API records, not in jsdom.
2. Three gates guard every UI change: accessibility (`accessibility.spec.ts`), responsive layout (`responsive.spec.ts`), and hostile use (`hostile-user.spec.ts`, `ui-sweep.spec.ts`).
3. Hostile use means: script payloads in stored and typed text, oversized and SQL-looking input, double submit, forged tokens and roles, a candidate reaching admin data, `return=` redirect targets, hostile URL paths, and hostile API bodies. The assertion is always the app misbehaving (script runs, crash, duplicate write, off-site navigation, 5xx), never a screenshot match.
4. The Web Dev Employee, or any agent, changes the UI on a branch and merges only with these gates green. Build files stay protected under `AGENTS.md`.

## Options considered

| Option                                        | Complexity | Cost         | Verdict                                               |
| --------------------------------------------- | ---------- | ------------ | ----------------------------------------------------- |
| A. Browser-measured Playwright gates (chosen) | Low        | None extra   | Reuses fixtures and CI; catches what users see        |
| B. jsdom component tests plus axe             | Medium     | New deps     | Needs protected `package.json` changes; misses layout |
| C. Hosted visual-regression service           | Medium     | Subscription | Catches pixels, not behaviour; sends screenshots out  |

## Consequences

- Easier: every UI change has the same bar, and a regression in input handling fails CI.
- Harder: the e2e suite grows (about 4.6 minutes for the full run) and runs on one worker.
- Revisit: a visual-regression layer if design drift becomes a problem; component-level tests if the e2e run becomes too slow.

## Findings at adoption

Both new specs passed on first run (20 tests): no script execution, no off-site redirect, no 5xx under hostile input, no cross-user data on screen. This records that the surface held, not that it is unbreakable.

## Action items

1. [x] Add `tests/e2e/hostile-user.spec.ts` and `tests/e2e/ui-sweep.spec.ts`.
2. [ ] Start the Web Dev Employee session in its folder and point it at TalentSphere.
3. [ ] Add a flow to the sweep whenever a new page is added to `apps/web/src/App.tsx`.

### 7.1 Target interpretation

| Prior attempt | Target requires |
|---|---|
| Three gates guard every UI change: accessibility, responsive layout 320 px to 2560 px, hostile use | RG-06 a11y gate; add an explicit **responsive layout gate** across 320-2560 px (QA-STRAT lists devices but verify the width range); add a **hostile-use gate** |
| Hostile use = script payloads in stored and typed text, oversized and SQL-looking input, double submit, forged tokens and roles, a candidate reaching admin data, `return=` redirect targets, hostile URL paths, hostile API bodies; assertion is the app misbehaving (script runs, crash, duplicate write, off-site navigation, 5xx), never a screenshot match | Same list becomes the seed of the hostile-input suite (TEST-SEC / TEST-UI); add "open-redirect via `return` parameter must accept only same-origin relative paths starting with a single slash" as an explicit rule (legacy rule AU-15) |
| Every new page gets a flow in the UI sweep (every page loads without script errors or server faults) | A route-registry-driven sweep: each registered route is visited per role and must load with no console error and no 5xx |
| Options considered: A browser-measured gates (chosen); B jsdom component tests plus axe; C hosted visual-regression service (rejected: sends screenshots out, catches pixels not behaviour) | Record in QA-STRAT rationale; revisit visual regression only if design drift becomes a problem |
| Cost: full e2e about 4.6 minutes on one worker, 236 tests at the time (256 at a later audit) | Budget the full browser gate (PR smoke, nightly full per RG-05) |
| Both new specs passed first run (20 tests); "records that the surface held, not that it is unbreakable" | Never treat a first-run green as proof; periodic mutation sanity (QA-STRAT section 11) |

## 7A. Appendix: the prior attempt's audit record (verbatim)

Commands run and results (2026-10-23), audits A to I, traceability sample, behaviour with no documented requirement, and limitations - exactly as recorded, so no figure is lost. Nothing in it is a result for this project.

## Commands run and their results (2026-10-23)

| Command | Result |
| ------- | ------ |
| `pnpm test` (unit, integration, security) | 120 files, 1266 tests, all pass |
| `pnpm lint` | passes |
| `tsc -p apps/api --noEmit`, `tsc -p tests --noEmit` | no errors |
| `pnpm build` (approved by the owner for refreshing generated output) | all packages and apps build |
| `pnpm test:e2e` (Playwright, Chromium, one worker) | 256 passed in 5.0 minutes |
| Not run | `pnpm test:pg` (needs `TEST_DATABASE_URL`; no throwaway database was available), any test against live Stripe or the hosted Supabase project, any deployment |

An earlier e2e run found 17 failures in 8 specs that depended on the removed sample course and challenge. They were fixed by creating the content through the API (`tests/e2e/content.ts`) and the run above is the re-run.

## Audits A to I

| Audit | Result | Limit |
| ----- | ------ | ----- |
| A Code to flowchart | Five investigators read the code behind F2 to F7 and cited `path:line`. An independent reviewer re-checked 14 claims: 11 confirmed, 3 corrected in the documents (CF-21, CF-29, the CF-20 citation), 4 omissions added (full Resend requirements, the second simulated evaluator, order of the job-transition checks). | Each diagram was checked by one investigator plus, for some branches, the lead and the reviewer. No diagram was checked against a running system. |
| B Requirements to flowchart | Not done as a full pass. `SSOT.md` and the PRD were only grepped for the topics in the conflict register (job approval, registration roles, token handling). | Most requirement IDs (F-xx, BR-xx) were not traced. |
| C Documentation to code | 21 open discrepancies recorded in `03-conflict-register.md` (CF-10 to CF-30). `ARCHITECTURE.md` and `SECURITY.md` were compared for auth, storage, billing and work history only. | Other documents in `docs/` were not compared. |
| D Decision-branch completeness | The diagrams show every branch the investigators reported. Failure of evaluation (unknown, missing input) is shown only where the code defines it. | Branches in code nobody read are absent. |
| E Cross-module consistency | Found: any organization membership authorizes job and applicant actions (CF-14); two different checks for "who is a recruiter" (CF-16); role strings outside the `Role` union (CF-20). | Permission checks across the other roughly 230 routes were not compared. |
| F Conflict closure | Seven resolved and verified (CF-01 to CF-07). The rest are open and each states what is needed. Seven carry a note that no decision was made because the choice belongs to an owner. | None of the open items is accepted as a risk by anyone. |
| G Regression and test coverage | New or changed tests: career benchmark, forecasts, learning impact, LMS, certificates, challenges, Stripe refunds and erasure, settings validation, hostile-input e2e. Everything above ran green. | There is no automated test that the diagrams match the code. |
| H Adversarial review | Run by an independent agent (see Audit A). Its corrections are applied. | It checked 14 claims, not all. It did not read `04-conditions.md` or the F7 page claims. |
| I Final evidence check | Each completion claim in these documents names a command or a `path:line`. | See limits below. |

## Traceability sample (requirement to code to test)

Complete traceability was not built. The rows below are the ones this work verified.

| Requirement or rule | Code | Test | Flow | Status |
| ------------------- | ---- | ---- | ---- | ------ |
| BR-15 one active application per job and candidate | `applications.ts:56`; migration 00043 | `tests/integration/jobs-applications.test.ts` | F3 A5 | Test passes |
| BR-160 benchmarks need at least 20 people | `career-trajectory.ts` | `tests/unit/career-trajectory-domain.test.ts`, integration and e2e career specs | CB-01 | Verified |
| BR-189 learning impact needs a cohort of 30 | `learning-impact.ts` | `tests/integration/learning-impact.test.ts`, e2e spec | LI-02 | Verified |
| Webhook signature over the raw body, replay safe | `stripe-gateway.ts`, migration 00052 | `tests/integration/stripe-billing.test.ts` | F5 H1, H12 | Test passes (fake gateway) |
| Production email delivery gate | `server.ts:12286,12418` | `tests/integration/email-delivery-gate.test.ts` | F4 V2 | Test passes |
| One-time referee link (no expiry) | `server.ts:12544` | none for expiry | F4 G2 | Gap: CF-10 |

## Behaviour with no documented requirement found

The investigators did not search for undocumented behaviour systematically. The ones noticed: the job-alert evaluation on publish (only in memory), the `/challenges` list being public, and the unlinked routes in CF-28. None was classified further.

## Limitations

- Not every route, page and migration was read. `apps/api/src/server.ts` has 278 unique routes. `02-flows.md` models auth, jobs and applications, work history, billing and boot with diagrams; `06-route-authorization.md` records the authorization and persistence of about 170 more routes from four further investigators, without diagrams. Per-route request validation schemas, several domain helpers and the storage SQL for those groups were not read.
- GitHub issue threads were read through the public API only; private discussion and approved stakeholder decisions were not accessible.
- No production or staging behaviour was observed. The Supabase project was inspected read-only (one keepalive migration, no application tables).
- The "council" was five investigators and one reviewer, each an AI agent working from the code. They did not debate each other, and no human approved a decision.
- Line numbers drift; two had already drifted during this work.

## 8. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B16-01 | Retries: none (legacy) vs one for E2E (target) | QA Architect |
| L-B16-02 | Compiler-enforced unused-code rule and test-project typecheck as RG-01 sub-gates | QA Architect + Release Eng |
| L-B16-03 | Responsive-layout gate range (320-2560) and hostile-use gate not yet explicit as release gates | QA Architect |
| L-B16-04 | "No-write verification" command set for agent sessions | Documentation Architect (29_) |
| L-B16-05 | Gap checks: TEST-ids exist for each list in section 3 and section 5 | QA Architect |

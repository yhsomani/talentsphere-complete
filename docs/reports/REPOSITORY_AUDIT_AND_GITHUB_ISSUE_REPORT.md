# TalentSphere — Repository Re-Audit & GitHub Issue Reconciliation

**As-of:** 2026-10-23 UTC • **Repository:** [yhsomani/talentsphere-complete](https://github.com/yhsomani/talentsphere-complete) • **Reviewed upstream `main`:** [`0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2`](https://github.com/yhsomani/talentsphere-complete/commit/0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2) • **Report branch:** `chatgpt/second-pass-audit-20261023`.

> **Scope/verification warning.** This is a second-pass, remote/read-only repository and live integration audit with one isolated E2E regression-test improvement. It is **not** an independent line-by-line review of 859 files, execution of the repository locally, full 173-feature acceptance, a production penetration test, or a hosted/live billing signoff. The E2E change is **proposed, unverified until PR CI runs**. Every unexecuted step remains explicitly unverified. The feature appendix is the **historical 2026-10-21 registry assessment**, not newly certified statuses for all 173 features.

## A. Executive summary / verdict

**Verdict: NOT READY for production or a paid public launch.** The most recent GitHub Actions run for this precise `main` commit [#40017740619](https://github.com/yhsomani/talentsphere-complete/actions/runs/40017740619) **failed 1 of 236 Playwright cases** (`tests/e2e/account-security.spec.ts:127`); 235 passed. Preceding commits [`deaea7665`](https://github.com/yhsomani/talentsphere-complete/actions/runs/40016584724) and [`4d3cf5d4`](https://github.com/yhsomani/talentsphere-complete/actions/runs/40014603225) had successful CI. Latest job passed all prior lint, typecheck, memory-mode unit/integration/security tests, local migration checks, real-Postgres tests, build and browser secret scan.

**Latest CI measured evidence:** **1,231 passing Vitest tests (117 files)**; **50 passing PostgreSQL tests (11 files)**; **235/236 Playwright passing**; clean local PostgreSQL migrations **00001–00052** succeeded. These were executed by GitHub Actions, **not re-executed by this auditor locally**. The failing browser case saw `page.waitForURL: net::ERR_ABORTED; maybe frame was detached?` while checking the revoked other-device session. The test file was changed in this review branch to wait for the same final URL using `expect(page).toHaveURL` without requiring the transient navigation load event; the subsequent exact revoked-session-message assertion is **unchanged**. Classification: **timing/race hypothesis, pending CI confirmation**, not proved application fix.

**Integration reality:**
- **Stripe implementation now exists** (PR [#71](https://github.com/yhsomani/talentsphere-complete/pull/71)): SDK gateway, signed webhook, Postgres records, idempotent provider-event storage, cancellation and domain tests. This supersedes `docs/reports/PAYMENT_AUDIT_2026-10-23.md` §Scope's earlier statement that Stripe did not exist.
- **Stripe connected-account live read (read only):** account `talentsphere-production` accessible **in test mode only**; **1 active USD 2.99/month recurring price, 2 active test subscriptions, 0 configured webhook endpoints** (GET Prices, Subscriptions, Webhook Endpoints). This is **not a production payment test**. Nothing was charged, refunded, canceled, created or edited.
- **Supabase connected-project live read (read only):** `talentsphere-production`, Mumbai `ap-south-1`, project `qidckctwrkxyiwworchd`, healthy PostgreSQL 17; **0 public application tables, 1 recorded keepalive migration, 0 Edge Functions**; security/performance advisors returned no notices. Empty application schema means those advisors cannot certify TalentSphere's RLS, grants or authorization. The repository's 52 local migrations are **not deployed to that project** and use `auth.uid()/auth.users` constructs incompatible with the app's self-issued Fastify HMAC sessions without an explicit adapter and review.

**GitHub tracker:** **7 issues reviewed, all 7 remain open** ([#44](https://github.com/yhsomani/talentsphere-complete/issues/44)–[#50](https://github.com/yhsomani/talentsphere-complete/issues/50)); none meets full acceptance gates. **0 issue closures** justified. Recent merged PRs #61–#71 are implementation evidence, not hosted deployment proof. No open PR was present in the baseline GitHub query.

### Status accounting

| Review set | Fixed and verified | Implemented, not fully verified | Partially fixed / open | Regressed | Blocked | Not reproducible |
|---|---:|---:|---:|---:|---:|---:|
| Seven *full* GitHub issue acceptance gates #44–#50 | 0 | 0 | 3 (#48, #49, #50) | 0 | 4 (#44–#47; external proof/approval) | 0 |

The categories describe **whole issue acceptance**, not individual merged code changes. #49 remains partly implemented while product decisions block full completion; #48 partial and hosted rollout blocked by #46; #50 code progressed but price/production decision and live verification remain open. The CI navigation test failure is separately tracked below and has not yet been classified as a confirmed application regression.

## B. Scope, sources, repository inventory and limitations

| Area | Inspected evidence | Coverage / limitation |
|---|---|---|
| Git/GitHub | Remote branch `main` SHA, last 12 commits, merged PR metadata #40–#71, complete open-issue snapshot and latest comments, Actions latest run and full failed job log | GitHub remote state verified; **local working-tree `git status` unavailable** because repository clone/network access is unavailable in execution container; isolated GitHub branch created from exact SHA |
| Repository structure | Git tree API: **978 tree entries, 859 tracked files**, 52 SQL migrations, React/Vite web, Fastify API, worker, shared packages, tests, workflows, Oracle deployment files | Tree/path inventory comprehensive; detailed source review **targeted** to billing, migrations, security, E2E and high-risk modules; no claim of semantic review of all 859 files |
| Governing docs | `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, root `ARCHITECTURE.md` and `SSOT.md` referenced, `FEATURE_STATUS_2026-10-21.md`, `FEATURE_REGISTRY.md`, `FEATURE_PLAN_2026-10-21.md`, `PAYMENT_AUDIT_2026-10-23.md`, hosted-Supabase audit/gate, older master audit/release plan, issue descriptions | Dated snapshots conflict with Oct 23 state. `SSOT.md` is *intent*, code and CI prove *presence*; no line-by-line revalidation of massive SSOT |
| Stripe | `apps/api/src/stripe-gateway.ts`, `billing-stripe.ts`, `storage/billing-store.ts`, `server.ts` billing routes, `packages/domain/src/stripe-billing.ts`, `packages/config/src/env.ts`, migration 00052, unit/integration/PG tests, connected account **test mode read-only** | No live-mode Stripe account accessible; no remote delivery rehearsal; zero webhook endpoints in connected test account |
| Supabase | Connected project list, public table inventory, migration ledger, advisors and Edge Functions; historical/hosted migration gate docs; repository SQL history and CI guard | No application tables on hosted target; **no schema mutation or unsafe migration** performed; hosted owner/tenant RLS tests cannot run on absent tables |
| Auth/data | HMAC tokens (not Supabase Auth), session-revocation E2E, PostgreSQL billing idempotency and RLS assertions, worker claims, erasure store, project RLS tests | Two-user data-isolation tests passed in **CI local Postgres**, not hosted Supabase or running production |
| Operations | CI pipeline, `docs/quality/OPERATIONS.md`, `deploy/oracle` references, issue release gates | No deployed TLS/worker/backup/recovery/rollback drill performed; no production credentials used |

**Build-file safety:** `AGENTS.md` forbids AI edits to `package.json`, lockfiles, `tsconfig*`, Playwright/Vite/Vitest config, `.github/**`, `deploy/**`, generated builds and assets without **explicit build-file authorization**. This audit makes **no protected-file changes**. Creating this report and changing an E2E source test is permitted. The container could not resolve `github.com` via Git; GitHub integration supplied remote evidence; no local pnpm commands were run.

**Project commands (observed in package manifest, NOT run locally):** `pnpm lint`; `pnpm typecheck`; `pnpm test`; `node --test scripts/tests/migration-integrity.test.mjs`; `node scripts/audit-hosted-supabase-migrations.mjs` (expected incompatible-history exit 1); `pnpm db:migrate` (**only disposable local PostgreSQL; NOT hosted Supabase**); `node scripts/release-preflight.mjs --mode=schema`; `pnpm test:pg` (isolated TEST_DATABASE_URL); `pnpm build`; `node scripts/check-client-secrets.mjs`; `pnpm test:e2e`. These **were** run in the inspected GitHub workflow as applicable; do not run emitting builds in a protected local checkout without permission.

## C. Previous fixes independently cross-checked

| Change / reference | Claimed remediation | Current evidence | Status / missing proof |
|---|---|---|---|
| [PR #41](https://github.com/yhsomani/talentsphere-complete/pull/41), [#42](https://github.com/yhsomani/talentsphere-complete/pull/42) | Private-data RLS/ownership and security regression tests | `tests/pg/private-data-rls.test.ts` and security suite, Postgres tests green in CI | **Locally verified only**; hosted target has no tables; not production RLS verified |
| [PR #43](https://github.com/yhsomani/talentsphere-complete/pull/43), [#58](https://github.com/yhsomani/talentsphere-complete/pull/58) | Fail-closed assessment and reputation visibility, PBKDF2 floor | Domain/security paths and CI green earlier in run; no approved executor | **Partial** #49; do not advertise real scoring |
| [PR #51](https://github.com/yhsomani/talentsphere-complete/pull/51), [#53](https://github.com/yhsomani/talentsphere-complete/pull/53), [#54](https://github.com/yhsomani/talentsphere-complete/pull/54) | Durable privacy metadata, saved searches and saved bookmarks | PostgreSQL-backed store source, CI memory/PG tests; no hosted app schema | **Partial** #45/#48, deployment unverified |
| [PR #55](https://github.com/yhsomani/talentsphere-complete/pull/55), [#56](https://github.com/yhsomani/talentsphere-complete/pull/56) | Oracle deployment, backup/restore artifacts | `deploy/oracle` manifests/scripts exist | **Implemented, not operationally verified**; #47 open |
| [PR #61–#66](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged) | Hosted-target guard, preflight, migration incompatibility scanners, CI gate | `.github/workflows/ci.yml` explicitly expects hosted dependency scanner to detect legacy Auth dependencies; local 52 migrations green | **Fail-closed compatibility warning works in CI**, not a hosted-compatible schema; #46 open |
| [PR #67–#69](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged) | Refuse unpaid entitlements and remedy lint block | Later CI succeeded on `deaea7665` and `4d3cf5d4` | **CI verification** of merged guard/formatting; monetization still blocked |
| [PR #70](https://github.com/yhsomani/talentsphere-complete/pull/70) | Simulated billing lifecycle, idempotency and erasure | Unit/integration tests in latest run, domain paths | **Tested code**, but simulated billing must remain disabled outside dev/test |
| [PR #71](https://github.com/yhsomani/talentsphere-complete/pull/71) | Stripe SDK, signed webhook, durable PG billing, cancellation | `apps/api/src/{billing-stripe,stripe-gateway}.ts`, `billing-store.ts`, migration 00052, `tests/{integration,pg,unit}/*stripe* / billing*`; 50 PG cases pass in CI | **Implemented; integration & local PG verified**, but zero configured provider webhook endpoints and zero hosted app tables. Paid prod launch **not verified** |
| [Commit `fca16f5`](https://github.com/yhsomani/talentsphere-complete/commit/fca16f5117c8) | Two prior Playwright HTTP 5xx assertion failures | Latest run includes passing `mutation-feedback.spec.ts` cases; safe generic server message preserved | **Verified for current CI**, previous red E2E mismatch resolved |
| Latest `main` [`0f40b6c`](https://github.com/yhsomani/talentsphere-complete/commit/0f40b6c951bc305f0bf8faf13d4a0897dd80c0e2) | Readability refactor | Current run red only at session revocation E2E navigation wait | **Causality unproved**; isolated test improvement awaiting CI |

**Important:** `PAYMENT_AUDIT_2026-10-23.md` was written *before* PR #71 and explicitly reports Stripe absence, in-memory billing and no GitHub access. Those statements are **superseded by later code and connected-service evidence**, not evidence of regressions. Similarly `docs/reports/AUDIT_MASTER_REPORT.md`, `GIT_RECONCILIATION_REPORT.md`, `RELEASE_SCOPE_AND_BACKLOG.md` claim older SHAs, 49/51 migrations and historical counts; they must retain historical labels, not be treated as Oct 23 runtime state.

## D. Complete open GitHub issue inventory

| Issue | Priority | Original root gap and affected components | Current assessment / required action | Whole-issue status |
|---|---|---|---|---|
| [#44 Transactional email](https://github.com/yhsomani/talentsphere-complete/issues/44) | P0 | No proven delivery to external mailboxes; `apps/worker/src/mail-provider.ts`, token dispatch, delivery jobs | Opt-in Resend code exists, but sender ownership/DNS, live code + referee mail, retry/alert results absent. Test delivery without leaking raw tokens. | **BLOCKED** provider/live proof |
| [#45 Privacy/legal/erasure](https://github.com/yhsomani/talentsphere-complete/issues/45) | P0 | Unapproved terms, monitored contacts, due-execution and backup retention; erasure lifecycle | Approve policy, instrument scheduled execution and recovery, prove deletion across stores and Stripe when applicable, plus counsel signoff. | **BLOCKED** owner/legal and live proof |
| [#46 ADR-015/hosted migration](https://github.com/yhsomani/talentsphere-complete/issues/46) | P0 | Auth model/SQL conflict, populated schema, permission/RLS proof | CI local 52 migrations pass; **hosted project has 0 app tables**. Never apply historic scripts as-is. Create approved compatibility adaptation, disposable trial, grants/RLS/rollback test, then apply. | **BLOCKED** schema/approval |
| [#47 Deployment, restore, single writer](https://github.com/yhsomani/talentsphere-complete/issues/47) | P0 | No real proof of HTTPS, worker health alerts, backups, single API writer and recovery | Existing Oracle code not operational evidence; hosted schema prereq #46; finish staging boot/restore/rollback/load/monitoring and obtain signoff. | **BLOCKED** infrastructure proof |
| [#48 Durable beta modules](https://github.com/yhsomani/talentsphere-complete/issues/48) | P1 | Ephemeral drafts, networking, alerts and long-tail APIs | Saves/bookmarks/settings **and now billing in PG mode** are durable; drafts/network/alerts still need target-scope persistence and honest UI. Hosted realization depends #46. | **PARTIAL** |
| [#49 Interview/trust/token storage](https://github.com/yhsomani/talentsphere-complete/issues/49) | P1 | Simulated scoring, trust policy, browser token architecture | Fails closed in deployment; still no approved sandbox with determinism/resource limits, scoring provenance/badge ratification, cookie/CSRF decision. | **PARTIAL** / decisions blocked |
| [#50 Commercial policy/payment](https://github.com/yhsomani/talentsphere-complete/issues/50) | P1 | Paid plans previously impossible; entitlement trust and billing records | PR #71 implemented Stripe backend and 00052; **test Stripe has 0 webhook endpoints**, UI `CheckoutPage.tsx` still markets free-only, hosted target empty, no live/isolated end-to-end event reconciliation or pricing approval. | **PARTIAL** |

**Disposition:** Keep all seven **OPEN**. No issue may be auto-closed because unit/CI green does not meet its operational acceptance. Earlier issue comments from Oct 23 already note Supabase's empty hosted schema; post new comments only for **material changes**, particularly #50's Stripe implementation, #48's corrected durable billing and the updated 52-migration CI baseline.

## E. Supabase — architecture, live database and security

1. **Observed:** project `qidckctwrkxyiwworchd` ACTIVE_HEALTHY, `ap-south-1`; `list_tables(public)` **[]**, migration ledger exactly one `add_readonly_keepalive_ping`, `list_edge_functions` **[]**. Security/performance advisor output empty, but that **does not imply healthy application access control** when application tables are absent.
2. **Repository:** `supabase/migrations/00001_...` to `00052_billing_persistence_and_stripe.sql`. CI's custom local runner can apply all 52 to **disposable PostgreSQL 16** and rerun idempotently. This is **not evidence** they can run unmodified on **hosted Supabase PostgreSQL 17**.
3. **Identity incompatibility:** Fastify signs HMAC sessions; it does not use Supabase Auth. Historical SQL references `auth.users`, `auth.uid()`, `auth.jwt()` (documented by `HOSTED_SUPABASE_DEPENDENCY_AUDIT.md`). A real browser token is not a platform Auth identity. **Do not** insert fake `auth.users`, replace `auth.uid` globally or grant blanket access.
4. **RLS/grants:** Local PG tests for message/notification owner isolation and the 00052 `stripe_customers` table's RLS/grants passed. The new table declares RLS and `REVOKE ALL ... FROM PUBLIC`. Hosted grant, policy, tenant-crossing and application-user role behavior **cannot be verified** absent deployed schema. SQL local superuser execution must not be mistaken for Data API protection.
5. **Migrations:** `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` explicitly says **do not run `pnpm db:migrate` on hosted target**. Perform reviewable identity adaptation and populated migration rehearsal on separate throwaway environment; test drift, abort/rollback, grants, RLS and concurrent writes first.
6. **No destructive action:** No SQL, migrations, functions, policies or keys changed on the connected project. Local schema remains safe to inspect/test only, production target not initialized for TalentSphere.

## F. Stripe & subscription audit

| Capability | Code and measured evidence | Result / remaining gate |
|---|---|---|
| Server-side catalog & access | `buildPriceCatalog`, `CreateCheckoutSessionInputSchema`, `registerStripeBilling` enforce server-side prices and plan role; routes require session | Unit/integration CI passes; commercial price and entitlement policy must be approved (#50) |
| Checkout | `/api/v1/billing/checkout`, SDK `stripe.checkout.sessions.create`, idempotency including user/plan/cycle, client reference | Network is **mocked** in repo tests; connected Stripe has only one test recurring price; browser `CheckoutPage.tsx` still says no processor exists, and does not expose purchase UI |
| Source-of-truth & trust | `processStripeEvent`, `reconcileStripeSubscription`; paid access from signed known-price, eligible subscription; unknown prices grant free entitlements | Appropriate fail-closed design in tests; verify all user-facing gates really read `entitlements` and never `subscription.planTier` alone |
| Webhooks | `stripe.webhooks.constructEvent(rawBody, signature, whsec)`, normalized checkout/subscription/invoice events | Genuine local signature verification with **synthetic payloads**; connected test Stripe has **zero** configured endpoints, so remote delivery unproven |
| Idempotency/ordering | PG `billing_events(provider,provider_event_id)` unique and transactional write, timestamp freshness guard, concurrency tests | Tests green against local PG, but event IDs tied to seconds; test equal-second conflicting event order and asynchronous external side-effects; no remote retry drill |
| Subscriptions/cancel | Gateway calls Stripe, domain reconciles, cancels scheduled/immediate; PG persists | Integration/PG coverage exists; live cancel, portal behavior, downgrade at renewal, subscription replace and retries not verified |
| Invoices | `invoice.paid` and `invoice.payment_failed` events, Stripe invoice ID uniqueness, stored paid fields | PG tests; live provider invoice mapping/credit notes/refunds not independently verified |
| Refunds/disputes | `normalizeEvent` defaults `charge.refunded` to **ignored** (integration test explicitly does this) | **P1/P2 product decision & coverage gap:** clarify whether refunds/chargebacks need invoice/entitlement changes, then implement and test. Do not assume refund means auto-cancel without policy |
| Stripe erase | `eraseBillingData` calls `deleteCustomer` when Stripe mode is enabled, then local purge | **P1 risk:** if existing Stripe customer but server boots with billing disabled, code logs a warning and still purges local mapping; external customer may remain, requiring reconciliation/manual action. Add explicit operator workflow and failure test. |
| Live connected Stripe | Test-mode account: **1 price, 2 active test subscriptions, 0 endpoints** | Test data existence is **not** an app-integrated success signal; cannot claim webhook delivered, paid entitlements granted or live financial processing |

**Additional risk needing code-level verification:** status/order events use Stripe's Unix-second `event.created`; guard uses less-than and allows same-second events. Under particular arrival order, two status changes with equal timestamps could overwrite an outcome. This is a **potential ordering gap**, not a reproduced financial defect; design adversarial order tests before editing policy.

**Backend/UI discrepancy:** `apps/web/src/pages/CheckoutPage.tsx:8–14` comment and all visible plans still describe a free-only service and say no processor exists, while backend supports `BILLING_MODE=stripe`. A deliberate free-only launch can retain the non-purchasable UI, but update that misleading code comment and make operator/billing mode truthful; do not enable paid CTAs without approved price policy and full staging tests.

## G. New / outstanding defects and risk register

| ID | Priority | Finding & evidence | Classification | Remediation / proof |
|---|---|---|---|---|
| R2-01 | **P0 CI gate** | Latest `main` Actions 40017740619 failed `account-security.spec.ts:127` with aborted navigation; previous two runs green | Confirmed **E2E test failure**, root cause not yet proven | Replace transient load wait with eventual URL assertion without weakening session-revocation banner; run PR CI, investigate app/network traces if still failing |
| R2-02 | **P0 release** | Hosted Supabase public tables 0, repo migrations 52; custom HMAC != hosted Auth | Confirmed production deployment blocker | #46 hosted schema/identity and two-user hosted RLS/restore acceptance |
| R2-03 | **P1 paid release** | Stripe test account webhook endpoints 0 despite signed backend handler | Confirmed delivery-configuration gap | Configure webhook in approved test/staging environment; verify signed events/retry, replay, idempotent persistence, entitlements |
| R2-04 | **P1 UX/contracts** | `CheckoutPage.tsx` still says no processor despite merged Stripe backend | Confirmed **documentation/UI integration mismatch**; purchasability may intentionally remain gated | Decide free-only vs approved paid staging; conditional truthful CTA and decline states, real browser E2E |
| R2-05 | **P1 privacy** | `server.ts` erasure local purge even when Stripe mode disabled and external customer mapping exists | Confirmed branch of code, **external impact untested** | Fail closed or queue operator reconciliation depending policy, test mode-off delete and recoverability |
| R2-06 | **P2 payment policy** | `normalizeEvent` ignores `charge.refunded` | Confirmed missing handler; semantics undecided | Decide refund/dispute strategy, reconcile with invoice and entitlements; signed refund test |
| R2-07 | **P1 reliability investigation** | `apps/worker/src/claim.ts` sequential batch claims, lease/handler timeout assumptions; previous Oct 21 audit saw duplicate side effects with two synthetic workers | Current source pattern still present; **previous reproduction not rerun this pass** | Per-claim fenced ownership and bounded concurrency, two-worker Postgres lease-expiry E2E and idempotent side-effect proof |
| R2-08 | **P1 product** | Dated master audit/payment audit/feature docs describe 49/51 migrations, no Stripe and obsolete CI status | Confirmed doc drift | Point docs index to this report; retain old audit as historical, change any misleading *current* descriptions separately |
| R2-09 | **P1 billing ordering investigation** | Provider timestamp precision seconds allows same-second conflicting events | Potential only | Deterministic equal-timestamp event-order/recovery test; decide monotonic reconciliation strategy |
| R2-10 | **P0 operational** | No live mailbox test, counsel signoff, restore/worker alerts and single-writer staging proof in issues | Confirmed missing acceptance evidence | #44–#47 owner/ops gates |

Do **not** close R2-01 as fixed until PR CI passes; do **not** assert R2-07/R2-09 production failure without new reproductions.

## H. Code changes in this audit

| File | Branch action | Why / safety |
|---|---|---|
| `tests/e2e/account-security.spec.ts` | One narrow source-test change, replacing `waitForURL('**/login**')` after in-app navigation with `await expect(elsewhere).toHaveURL(/\/login(?:\?|$)/)` | Playwright's URL assertion retries through a client-side redirect without requiring an abort-prone `load` navigation event; exact revoked-session banner, re-login and landing checks **retained**. No app/auth code weakened. **CI verdict pending**. |
| `REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` | New consolidated report | Current provenance, complete open-issue register, full historical feature appendix, new live Stripe/Supabase read-only evidence and verification limits |

**Protected files:** none changed. **Hosted SQL/Stripe mutations:** none. **Existing user working tree:** not accessible, not modified/reset; remote `main` untouched.

## I. Test and verification ledger

| Check | Real source of result | Result | Limits |
|---|---|---|---|
| Latest GitHub `pnpm lint`, `pnpm typecheck` | Actions run 40017740619, earlier steps successful | PASS | No local command execution |
| GitHub `pnpm test` | Same run log | **1,231 pass**, 117 files | Memory-mode test suite; mocks for Stripe network |
| Migration integrity test & local runner | Same workflow successful earlier steps | PASS, 52 migrations to disposable PostgreSQL | Does **not** apply to connected Supabase |
| Hosted migration compatibility scanner | CI step expects exit code 1 for known auth incompatibility; step passed | **BLOCKER DETECTION PASS**, compatibility itself **FAIL/BLOCKED** | Not a hosted migration proof |
| GitHub `pnpm test:pg` | Same run log | **50 pass**, 11 files | PostgreSQL 16 CI, no real Stripe network |
| Production build + frontend secret sentinel scan | Same run, step successful | PASS | No deployed browser/release proof |
| GitHub `pnpm test:e2e` | Same run log | **235 pass / 1 fail** | Browser case R2-01; no retry to hide flake |
| Connected Supabase read-only | Supabase project, table, migration, Edge Function and advisor queries | 0 public app tables; 1 migration; 0 functions; 0 advisor notices | Zero app schema → no RLS acceptance possible |
| Connected Stripe read-only | Stripe test-mode Prices/Subscriptions/WebhookEndpoints | 1 price, 2 active test subscriptions, 0 endpoints | Test account only; no provider delivery test |
| New branch E2E test modification | GitHub write API | Source committed; **NOT EXECUTED YET** | Await PR CI before marking fixed |
| Local Git status / `pnpm` execution / Reticle / live email / real Stripe webhook / Oracle restore | No clone, local dependencies or deployed browser in this session | **NOT RUN** | Do not invent green outcomes; Reticle skipped because change is test/documentation only |

## J. GitHub issue reconciliation journal

**Baseline GitHub issue states:** #44–#50 OPEN. Existing latest issue comments from 2026-10-23 ~18:15–18:25 UTC already cover hosted Supabase and older provider work. This audit will comment only on substantive changed facts, and preserve issue state/labels/assignees. The Markdown report and any submitted comments are the traceability record; no duplicate issues created and **no issue closed**.

| Issue | Baseline state | Verified updated fact | Expected tracker disposition |
|---|---|---|---|
| #44 | OPEN | Live email remains unproven | Keep open; previous note adequate |
| #45 | OPEN | No approved deletion/legal/live contact; payment erasure mode-off risk R2-05 | Keep open; link cross-cutting risk on review |
| #46 | OPEN | Local migration count now 52; hosted public schema still empty | Comment change; keep open |
| #47 | OPEN | CI latest red; stage/restore remains unproven | Keep open; link current CI and PR |
| #48 | OPEN | Durable billing added to saved jobs/searches/settings; long-tail ephemeral | Comment correction; keep open |
| #49 | OPEN | Simulated assessment/executor/token decisions still not resolved | Keep open; previous note adequate |
| #50 | OPEN | Stripe added in PR71; connected test account zero webhook endpoints; UI free-only | Comment material change; keep open |

No unsupported claims of production delivery or hosted migrations should be posted. Where GitHub comments do not exist yet, this table records the **intended** comments pending their tool results.

## K. Remaining blockers, owners and decisions

- **Release P0:** Approve compatible application identity schema and deploy to disposable hosted target; owner/architecture approval of ADR-015; trusted HTTPS/network topology; real single-writer/worker heartbeat/backup restore drills (#46, #47).
- **Privacy P0:** Approve actual erasure schedule/retention and published legal contacts; prove scheduled due execution, recovery, deletion boundary including Stripe external retention, and notify users (#45).
- **Communication P0:** Configure email sender, DNS, live mailbox tests, retries/bounces/queue alerting (#44).
- **Monetization P1:** Select free-only vs paid production rollout; approve all prices/currencies, entitlements, refund/dispute behavior, Stripe webhook provisioning and replay monitoring; ensure UI truthfulness (#50). **Only test-mode connected account discovered**.
- **Trust P1:** Approve sandbox/executor and evidence provenance, score policy, browser-token migration decision; preserve fail-closed simulation (#49).
- **Product scope P1:** Decide which beta-scope ephemeral routes must persist before exposure (#48).
- **CI P0:** Prove E2E navigation wait improvement passes and revoked-token correctness still holds.

## L. Deployment readiness

| Gate | Observed state | Verdict |
|---|---|---|
| Latest upstream full CI | Failed 1/236 Playwright tests; earlier two green | **RED** |
| 52 local database migrations and 50 PG tests | Successful CI | **GREEN (local CI only)** |
| Managed Supabase target schema | No application tables | **BLOCKED** |
| Hosted RLS authorization / grants | Cannot test real app objects | **BLOCKED** |
| Stripe SDK / signed webhook / PG durability | Code present; mocked network tests and local PG green | **PARTIAL** |
| Stripe test account webhook delivery | 0 webhook endpoints configured | **BLOCKED** |
| Live-mode payments | Not accessed; no mutation performed | **NOT VERIFIED** |
| Legal, email, privacy, backups, worker, load, TLS | Acceptance evidence missing | **BLOCKED** |
| App-wide 173-feature production verification | Only historical provisional inventory | **NOT VERIFIED** |

**Do not enable `BILLING_MODE=stripe` for public users, deploy application migrations to the current Supabase project, or describe this as production ready before the relevant owner-approved gates and environment checks pass.**

## M. Dependency-ordered action plan (always-working delivery)

| Order | Priority | Workstream / link | Observable acceptance, no invented dates |
|---|---|---|---|
| 0 | P0 | CI R2-01 | PR CI completes with 236/236 E2E; revoked external session still redirected with exact banner, active session retained |
| 1 | P0 | Schema #46 | Approved identity model, migration adaption, clean + populated disposable rehearsal, 2-user/2-tenant RLS and grant checks; **no direct hosted target migration until signed approval** |
| 2 | P0 | Operations #47 | After #46: Oracle app boot, single-writer lock, worker liveness/queue backlog alarm, fresh encrypted off-host restore, rollback and smoke |
| 3 | P0 | Communication #44 | Verified sender, code/reference real-mailbox sends, expiry and replay negatives, bounces/retry alerting, secrets absent from logs |
| 4 | P0 | Privacy #45 + R2-05 | Legal/retention/contact approval, due-erasure scheduler/queue, restart recovery, Stripe disabled/enabled erasure consistency and staging tests |
| 5 | P1 | Monetization #50 + R2-03/04/06/09 | Decide launch mode; test-mode Stripe endpoint and signed delivery; complete refund/order policy, entitlement read model, honest UI; *then* any live-mode readiness |
| 6 | P1 | Core product #48 | Prioritize drafts/network/alerts by accepted beta scope; each vertical slice: API + Postgres + authz + UI + restart/tenant/browser tests |
| 7 | P1 | Trust #49 + worker R2-07 | Code executor sandbox/fail closed, policy provenance, safe worker lease fencing and replay proof |
| 8 | P2 | Doc reconciliation R2-08 | Mark stale snapshots clearly; link this report in `docs/INDEX.md`, refresh current feature ledger after acceptance not before |

**Sprint increments (capacity unknown; sequencing, not promises):** Sprint A CI+observability baseline (no new feature); Sprint B hosted schema proof on disposable target; Sprint C one staging candidate → reference → job application journey; Sprint D privacy+mail/erasure proof; Sprint E optional paid vertical slice *only after commercial approval*; Sprint F durable beta micro-features and technical-interview security. Each sprint merges only after lint/typecheck, unit/integration/security, PG, E2E, safe migration checks, manual stage flow when applicable, and rollback proof. A sprint with red CI does not complete or unlock next work.

**Definition of Done:** traceable requirement and reproducible observable acceptance; no fake verification; reviewed minimal diff; no protected-file edits or leaked secrets; authorizations/role boundaries/negative/retry/idempotency tests; main green and manual runtime proof for UI changes; schema migration and rollback signoff for DB work; documentation of deferred gaps and release decision.

## N. Feature inventory (historical baseline, not reverified)

The **173 entries below are imported directly from** [`docs/reports/FEATURE_STATUS_2026-10-21.md`](FEATURE_STATUS_2026-10-21.md). They retain its October 21 **provisional/search-limited** statuses, because the remote-only targeted re-audit cannot honestly recertify 173 end-to-end contracts. **F-16 has advanced since this snapshot** with PR #71; see section F. **¹NOT FOUND** means search-limited absence, not a universal impossibility; **¹BROKEN** references older reproduced evidence unless explicitly verified above.

| Feature | Canonical name | 2026-10-21 provisional status | Historical code/evidence observation (not new verification) |
|---|---|---|---|
| F-01 | Authentication & Session | PARTIAL | Email/password registration, HMAC session/revocation and UI exist. Full SSOT contract remains partial: account-email verification, OAuth, forgot/reset-password, refresh-token cookies and age-gate |
| F-02 | Landing Page | UNVERIFIED | Landing page, e2e |
| F-03 | Dashboard (Role-Adaptive) | UNVERIFIED | Role-adaptive dashboard, e2e |
| F-04 | Job Marketplace | PARTIAL | Jobs browse/filter/apply and saved bookmarks exist; full SSOT matching/discovery and dependent outcome acceptance remain incomplete or unverified. |
| F-05 | Post Job Studio | PARTIAL | Recruiter create/publish UI and durable job lifecycle exist. BR-11 includes scheduled status; current JobStatus union omits it. Full studio acceptance remains partial. |
| F-06 | ATS / Candidate Pipeline | PARTIAL | Recruiter pipeline UI and guarded durable transitions exist; full SSOT interview/scorecard/hiring-manager and outcome journey not established. |
| F-07 | Learning Management System | PARTIAL | Lesson player and sequential completion UI now exist; course/module/lesson/progress state is process-local. D-09: verified certificate issuance checks lesson count but omits canonical BR-048 fina |
| F-08 | Challenges Arena | BROKEN¹ | Submission UI explicitly says unexecuted/unscored; evaluator still returns passed/100 for arbitrary nonempty text (probe reproduced). Evidence is unverified. |
| F-09 | Professional Networking | PARTIAL | Network page: search, request, withdraw, e2e |
| F-10 | Direct Messaging | UNVERIFIED | Messages UI, threads API, e2e |
| F-11 | AI Career Assistant (Basic) | PARTIAL | Career assistant chat API; no UI route calls it |
| F-12 | Profile Management | PARTIAL | Profile UI, basic fields, skills and evidence exist. Full contract includes uploads, education/certification editing, per-section visibility and other capabilities not established by current subs |
| F-13 | Resume Builder | PARTIAL | Resume create and export API; UI creates only, no section editor |
| F-14 | Notification Center | UNVERIFIED | Notifications page and badge, e2e |
| F-15 | Settings | PARTIAL | Settings SQL, export metadata and erasure request/status/cancel exist. Due scheduler/policy unresolved; cleanup can fail after deactivation (D-03). |
| F-16 | Billing & Subscriptions | PARTIAL | Billing defaults disabled; paid activation refused. Simulated records exist only when allowed in development/test. Checkout displays plans; no real payment provider integration. |
| F-17 | Admin Console | PARTIAL | AdminPage exists: user search/status, audit log, health, maintenance. Broad governance scope remains partial. |
| F-18 | Chrome Extension Companion | NOT FOUND¹ | No extension code in repo |
| F-19 | Product Analytics | PARTIAL | Analytics events API; no UI |
| F-20 | Command Search (⌘K) | UNVERIFIED | Command palette, e2e |
| F-21 | Error Recovery & Resilience | PARTIAL | Session error notice only; no systematic recovery |
| F-22 | Gamification & XP Ledger | PARTIAL | XP ledger and gamification API; no UI |
| F-23 | Leaderboard & Badges | PARTIAL | Leaderboard and badges API; no UI |
| F-24 | Trust, Safety & Moderation | PARTIAL | Moderation API; no UI |
| F-25 | Job Detail View | UNVERIFIED | Job detail page, e2e |
| F-26 | Portfolio Showcase | PARTIAL | Portfolio page, e2e (server memory only) |
| F-27 | Local Resume Match Preview | NOT FOUND¹ | No extension code |
| F-28 | External Job Page Scanner | NOT FOUND¹ | No extension code |
| F-29 | Scheduled Notification Digest | PARTIAL | Digest preference stored; no digest sending in worker |
| F-30 | Networking Stale-Request Nudges | NOT FOUND¹ | No stale-request nudge code |
| F-31 | KPI Aggregation & Rollups | PARTIAL | KPI API; no UI |
| F-32 | Saved Searches & Job Alerts | PARTIAL | Saved-search SQL store exists; alert records/delivery remain incomplete. Do not rebuild saved searches. |
| F-33 | Video Interview Rooms | PARTIAL | Interview join API; no UI |
| F-34 | Multi-Entity Backend Search | PARTIAL | Search API; only the Network name lookup calls it |
| F-35 | Feature Flag Console | PARTIAL | PostgreSQL feature flags store exists; full console acceptance not traced. |
| F-36 | Application Draft Autosave | PARTIAL | Application drafts API; no UI calls it |
| F-37 | Job Templates | PARTIAL | Job templates API; no UI |
| F-38 | Legacy Chat Service (DEPRECATED) | EXCLUDED | Deprecated in registry |
| F-39 | Unified Backend Stub (DEPRECATED) | EXCLUDED | Deprecated in registry |
| F-40 | Institutional Managed Learning | PARTIAL | Alumni institutions API; no UI |
| F-41 | Procurement & Seat Licensing | NOT FOUND¹ | No seat licensing code |
| F-42 | Provider-Agnostic Media Engine | NOT FOUND¹ | No media engine code |
| F-43 | B2B2C Graduation Flywheel | NOT FOUND¹ | No graduation flywheel code |
| F-44 | AI Media Enrichment | NOT FOUND¹ | No AI media enrichment code |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | PARTIAL | Proctoring fields on interviews only; no vendor integration |
| F-46 | Institutional Analytics | NOT FOUND¹ | No institutional analytics code |
| F-47 | Faculty Dashboard | NOT FOUND¹ | No faculty dashboard code |
| F-48 | OS Shell & Workbench | NOT FOUND¹ | No OS shell or workbench code |
| F-49 | Automation & Agents | NOT FOUND¹ | AI orchestrator only; no automation product |
| F-50 | Institutional Course Marketplace | NOT FOUND¹ | No institutional marketplace code |
| F-51 | Media Health Monitoring | NOT FOUND¹ | No media health code |
| F-52 | Certificate Verification | PARTIAL | Public VerifyPage is routed at /verify/:hash. Course certificates are process-local; evidence proof has durable source. D-09: verified certificate issuance checks lesson count but omits canonical |
| F-53 | Professional Social Graph & Feed | NOT FOUND¹ | No social feed (feedback routes only) |
| F-54 | Content Publishing | NOT FOUND¹ | No content publishing code |
| F-55 | Groups & Communities | PARTIAL | Alumni groups API; no UI |
| F-56 | Organization & Institution Pages | PARTIAL | Organization API and hiring page; no public company page |
| F-57 | Events & Webinars | NOT FOUND¹ | No events or webinars code |
| F-58 | Written Recommendations | NOT FOUND¹ | No written recommendations code |
| F-59 | Outreach Credits (TalentMail) | NOT FOUND¹ | No outreach credits code |
| F-60 | Profile Views & Privacy Controls | PARTIAL | Profile visibility settings; no view tracking |
| F-61 | Premium Candidate Tier (OD-34 gated) | PARTIAL | Candidate plan defined; no gating |
| F-62 | Sponsored Content (NOT RECOMMENDED) | EXCLUDED | Not recommended by registry |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | EXCLUDED | Not recommended by registry |
| F-64 | LinkedIn Migration Engine | NOT FOUND¹ | No LinkedIn migration code |
| F-65 | LinkedIn Decoupling & Independence | NOT FOUND¹ | No LinkedIn decoupling code |
| F-66 | Course Creation Studio | PARTIAL | Course create and publish API; no studio UI |
| F-67 | Categories, Discovery & Comparison | PARTIAL | Level filter and skill categories; no category browse |
| F-68 | Quizzes, Practice Tests & Final Exams | PARTIAL | Quiz lesson type exists; no quiz engine |
| F-69 | Assignments & Peer Review | NOT FOUND¹ | No assignments code |
| F-70 | Learning Paths, Programs & Specializations | NOT FOUND¹ | No learning paths code (career pathways are separate) |
| F-71 | Course Q&A, Discussions, Notes | NOT FOUND¹ | No course Q&A or notes code |
| F-72 | Course Reviews & Ratings | NOT FOUND¹ | No course reviews (instructor reviews only) |
| F-73 | Course Commerce | NOT FOUND¹ | No course commerce code |
| F-74 | Instructor Platform | PARTIAL | Instructor reputation API; no instructor platform UI |
| F-75 | Employer Insights | PARTIAL | Employer reputation and metrics API; no UI |
| F-76 | Coding Contests & Live Leaderboards | NOT FOUND¹ | No coding contest code |
| F-77 | Skill Certification Exams | PARTIAL | Certificates API; no exam platform |
| F-78 | Practice Sets & Interview Prep | NOT FOUND¹ | No practice sets code |
| F-79 | Articles & Newsletters | NOT FOUND¹ | No articles code |
| F-80 | Profile Enhancements | PARTIAL | Headline, bio, location fields; no enhancements |
| F-81 | Identity Verification | PARTIAL | Work-email verification of roles; no identity document check |
| F-82 | Student Learning Analytics | PARTIAL | Per-course learning outcomes API; no UI |
| F-83 | Admin Platform Expansion | PARTIAL | Admin UI exists, but expanded institutional/governance coverage is not established. |
| F-84 | Skills Graph & Taxonomy | PARTIAL | Profile SkillsSection displays relationships; full taxonomy workflow and graph durability remain partial. |
| F-85 | Career Graph & Progression | PARTIAL | CareerPaths UI exists; career state remains process-local. |
| F-86 | Salary Intelligence | PARTIAL | Salary benchmarks and reports API; no UI |
| F-87 | Interview Experience Repository | PARTIAL | Interview question bank API; no UI |
| F-88 | Technical Interview Platform | PARTIAL | Technical interview API; no UI |
| F-89 | Contribution Verification System | PARTIAL | Contribution scores API; no UI |
| F-90 | Peer Mentorship & Advisor Network | PARTIAL | Alumni mentorship API; no UI |
| F-91 | Career Readiness Assessment | PARTIAL | CareerPage calls readiness API; outcome validation and persistence remain partial. |
| F-92 | Advanced Recruiter Search | PARTIAL | Recruiter talent pools API; no UI |
| F-93 | Interview Video Recording & AI Feedback | PARTIAL | Interview AI feedback API; no UI |
| F-94 | Verified Work History & References | PARTIAL | Hashed expiring mailbox codes, mandatory single-use reference token, anti-self checks, Resend queue adapter exist; real mailbox delivery unverified. |
| F-95 | Career Transition Planning | PARTIAL | CareerPaths UI exists; persistent plans and outcome validation remain partial. |
| F-96 | Skill Evidence & Digital Credentials | PARTIAL | Profile CredentialsSection and public VerifyPage exist; certificate persistence and full credential lifecycle incomplete. D-10: linked certificate/evidence revocation paths are independent (stati |
| F-97 | Real-Time Job Market Analytics | PARTIAL | Market signals API; no UI |
| F-98 | Employer Equity & Compensation Intelligence | PARTIAL | Company salary API; no UI |
| F-99 | AI Career Coach (Enhanced) | PARTIAL | Basic career assistant only; enhanced coach not built |
| F-100 | Peer Project Collaboration | NOT FOUND¹ | No peer project collaboration code |
| F-101 | Badge Marketplace & Recognition | PARTIAL | Badges API; no marketplace |
| F-102 | Hiring Manager Portal | PARTIAL | Recruiter hiring UI; no hiring-manager portal |
| F-103 | Candidate Comparison & Rubric | PARTIAL | Scorecard and comparison API; no UI |
| F-104 | Pre-Hire Assessment Customization | NOT FOUND¹ | No pre-hire customisation code |
| F-105 | Post-Hire Analytics & ROI Tracking | NOT FOUND¹ | No post-hire ROI code |
| F-106 | Skill Prerequisite Engine | PARTIAL | Skill relationships API; no UI |
| F-107 | Live Q&A with Instructors | NOT FOUND¹ | No live instructor Q&A code |
| F-108 | Expert Network Matching | NOT FOUND¹ | No expert matching code |
| F-109 | Salary Negotiation Guidance | NOT FOUND¹ | No salary negotiation code |
| F-110 | Verified Skill Endorsements | PARTIAL | Endorsements API; no UI |
| F-111 | Industry-Specific Learning Hubs | NOT FOUND¹ | No learning hubs code |
| F-112 | Resume Parsing & Optimization | NOT FOUND¹ | No resume parsing code |
| F-113 | Recruiter Outreach Analytics | NOT FOUND¹ | No outreach analytics code |
| F-114 | Learning Impact Tracking | PARTIAL | Learning impact API; no UI |
| F-115 | Certification Exam Platform | NOT FOUND¹ | No certification exam platform code |
| F-116 | Accessibility & Inclusive Learning | NOT FOUND¹ | No inclusive learning features |
| F-117 | Mobile-First Job Application | PARTIAL | Responsive apply flow; no offline or native app |
| F-118 | Emerging Skills Detection | PARTIAL | Top-growth skills API; no UI |
| F-119 | Diversity & Inclusion Analytics | NOT FOUND¹ | No diversity analytics code |
| F-120 | API & Integration Platform | NOT FOUND¹ | Only the billing webhook; no public API keys |
| F-121 | Warm Introduction Paths | PARTIAL | Warm intros API; no UI |
| F-122 | Application Feedback Loop | PARTIAL | Application feedback API; no UI |
| F-123 | Skill Decay Tracking (Freshness Engine) | PARTIAL | Skill freshness API; no UI |
| F-124 | Project Marketplace | NOT FOUND¹ | No project marketplace code |
| F-125 | Alumni Networks | PARTIAL | Alumni networks API; no UI |
| F-126 | Interview Prep Marketplace | NOT FOUND¹ | No interview prep marketplace code |
| F-127 | Company Culture Assessment | NOT FOUND¹ | Culture-fit score field on scorecards only |
| F-128 | Offer Comparison Tool | NOT FOUND¹ | Memory file says verified; no code or tests found |
| F-129 | Leadership Development | NOT FOUND¹ | No leadership development code |
| F-130 | Freelance Marketplace | NOT FOUND¹ | Memory file says verified; only a freelance employment type exists |
| F-131 | Apprenticeship Matching | NOT FOUND¹ | No apprenticeship code |
| F-132 | Scholarship Discovery | NOT FOUND¹ | Memory file says verified; no code or tests found |
| F-133 | Volunteer Matching | NOT FOUND¹ | Memory file says verified; no code or tests found |
| F-134 | Code Review Practice | NOT FOUND¹ | No code review practice code |
| F-135 | System Design Practice | NOT FOUND¹ | No system design practice code |
| F-136 | Micro-Learning | NOT FOUND¹ | No micro-learning code |
| F-137 | Spaced Repetition | NOT FOUND¹ | No spaced repetition code |
| F-138 | Study Accountability Partners | NOT FOUND¹ | No accountability partner code |
| F-139 | Local Communities & Meetups | NOT FOUND¹ | No meetup code |
| F-140 | Affinity Groups | NOT FOUND¹ | No affinity group code |
| F-141 | Onboarding Preparation | NOT FOUND¹ | No onboarding preparation code |
| F-142 | Referral Request System | PARTIAL | Referral requests API; no UI |
| F-143 | OSS Contribution Discovery | NOT FOUND¹ | No OSS discovery code |
| F-144 | Reputation Engine (multi-context) | PARTIAL | Reputation engine API; no UI |
| F-145 | Recommendation Engine Core | NOT FOUND¹ | Memory file says verified; no recommendation engine |
| F-146 | Activity & Contribution Tracking | PARTIAL | Activity tracking API; no UI |
| F-147 | Unified Search & Discovery | PARTIAL | Unified search API; no UI |
| F-148 | Instructor Reputation System | PARTIAL | Instructor reputation API; no UI |
| F-149 | Employer Reputation & Brand System | PARTIAL | Employer reputation API; no UI |
| F-150 | Peer Credibility Networks | PARTIAL | Peer credibility API; no UI |
| F-151 | Skill Supply/Demand Forecasting | PARTIAL | Skill forecasting API; no UI |
| F-152 | Career Trajectory Analysis | PARTIAL | Career trajectory API; no UI |
| F-153 | Learning Impact Dashboard (Enhanced) | PARTIAL | Learning impact dashboard API; no UI |
| F-154 | Interview Prediction & Benchmarking | NOT FOUND¹ | No interview prediction code |
| F-155 | Adaptive Learning System | NOT FOUND¹ | No adaptive learning code |
| F-156 | Professional Development Plan System | NOT FOUND¹ | No development plan code |
| F-157 | Skills Co-Learning Path Optimizer | NOT FOUND¹ | No co-learning optimiser code |
| F-158 | Talent Pool Intelligence & Analytics | PARTIAL | Talent pools API; no UI |
| F-159 | Behavioral Talent Discovery | PARTIAL | Behavioural discovery API; no UI |
| F-160 | Talent Segmentation & Classification | PARTIAL | Segmentation API; no UI |
| F-161 | Internal Mobility & Succession Platform | NOT FOUND¹ | No internal mobility code |
| F-162 | Verified Work History Network & Graph | PARTIAL | Work-history graph UI/API exists; independent-reference scoring implemented; policy ratification and live proof missing. |
| F-163 | Credential Wallet & Portability | NOT FOUND¹ | No credential wallet code |
| F-164 | Skills Evidence Narrative & Storytelling | NOT FOUND¹ | No narrative code |
| F-165 | Diversity, Equity & Inclusion Data System | NOT FOUND¹ | No DEI data system code |
| F-166 | Interview Performance Benchmarking | NOT FOUND¹ | No interview benchmarking code |
| F-167 | Candidate Comparison & Rubric (Enhanced) | NOT FOUND¹ | No enhanced comparison code |
| F-168 | Hiring Prediction & Success Modeling | NOT FOUND¹ | No hiring prediction code |
| F-169 | Community Contribution Scoring & Recognition | PARTIAL | Contribution scoring API; no UI |
| F-170 | Expert Network (Enhanced) | NOT FOUND¹ | No enhanced expert network code |
| F-171 | Employer Brand Management System | NOT FOUND¹ | No employer brand management code |
| F-172 | Advanced Compensation Intelligence | PARTIAL | Compensation reports API; no UI |
| F-173 | Company-to-Skills Mapping | NOT FOUND¹ | No company-skills mapping code |

## O. Evidence and review links

- [Latest red main CI, run 40017740619](https://github.com/yhsomani/talentsphere-complete/actions/runs/40017740619) — exact commit 0f40b6c, one E2E failure
- [Earlier green run 40016584724](https://github.com/yhsomani/talentsphere-complete/actions/runs/40016584724), [green run 40014603225](https://github.com/yhsomani/talentsphere-complete/actions/runs/40014603225)
- [PR #71: durable Stripe billing](https://github.com/yhsomani/talentsphere-complete/pull/71), [PR #70: billing fixes](https://github.com/yhsomani/talentsphere-complete/pull/70), [PRs #61–#66: hosted migration guards](https://github.com/yhsomani/talentsphere-complete/pulls?q=is%3Apr+is%3Amerged)
- [Original 173-feature matrix](FEATURE_STATUS_2026-10-21.md), [backlog](FEATURE_PLAN_2026-10-21.md), [docs index](../INDEX.md), [architecture ADR-015](../engineering/adr/ADR-015-core-loop-persistence.md)
- [Hosted dependency analysis](../engineering/HOSTED_SUPABASE_DEPENDENCY_AUDIT.md), [hosted migration release gate](../engineering/HOSTED_SUPABASE_MIGRATION_GATE.md), [historical payment audit](PAYMENT_AUDIT_2026-10-23.md)
- [Agent safety and build-file restrictions](../../AGENTS.md), [exact CI workflow](../../.github/workflows/ci.yml), [open issues](https://github.com/yhsomani/talentsphere-complete/issues)

**Review boundary:** A GitHub report is a maintainable evidence artifact, not authority to deploy, migrate hosted SQL, run live charges or declare all canonical features verified. Update this report as CI and staging proof become available.

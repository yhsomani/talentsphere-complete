# Legacy Pricing, Plans and Entitlements (prior attempt) merged

Doc ID: COM-LEG-01 · Owner: Head of Commercial Operations (with Finance Ops Lead and Product Director) · Version 1.0 · Status: Draft for Review · Relates: `COMMERCIAL_OPERATIONS.md` (COM-OPS section 2 pricing and packaging), `MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL.md`, OPEN-05, OPEN-18, OPEN-19, OPEN-33, `../06_BUSINESS_PROCESSES/LEGACY_BR_CATALOGUE_BR001_BR248.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/PRICING.md`

## 0. Frame and conflict with the target

| Item | Statement |
|---|---|
| Implementation status | **Nothing is implemented.** The prior attempt reported plan definitions in code, a Stripe test-mode catalogue and some enforcement tests. None of that exists in this project. |
| Status of the numbers | The prior attempt itself said: prices are **recommendations awaiting founder sign-off** (its decision "OD-34, price TBD"); **no market research or cost model backs them**. They are inputs to OPEN-19, not decisions. |
| Conflict with target | `COMMERCIAL_OPERATIONS.md` section 2 deliberately proposes **no prices** (all [OPEN]) and uses different tier names (Free, Plus; Team, Business, Enterprise; Cohort, Campus). Both are kept. The legacy tier names, numbers and quotas below are a candidate starting point only. Decision: OPEN-19 (pricing, packaging, quotas), OPEN-05 (margin), OPEN-LGA-17 (reconcile tier names and the legacy numbers). |
| Currency | The prior attempt was USD-only. Currency and tax are open (OPEN-18). |

## 1. Prior plan table (all numbers preserved)

Prices in US dollars; the prior attempt stored USD minor units (cents).

| Plan | Audience | Monthly | Yearly | AI chat per day | Active jobs |
|---|---|---|---|---|---|
| Free | Candidates | $0 | $0 | 5 requests / 5,000 tokens | n/a |
| Candidate Pro | Professionals | $19.99 | $199.90 | 50 requests / 100,000 tokens | n/a |
| Recruiter Starter | Small hiring teams | $99 | $990 | 25 requests / 50,000 tokens | 5 |
| Recruiter Enterprise | High-volume hiring | $299 | $2,990 | 200 requests / 500,000 tokens | 1,000 |

- Yearly price = **10 months'** price (two months free).
- No trials, add-ons or usage billing existed.
- Monetisation integrity invariant (prior "section 64", function `validateMonetizationIntegrity`): **no plan buys credibility, hiring rank, assessment bypass or private evidence.** Target equivalents: ADR-T22 and INV-T19 (never rank by payment), INV-T07, INV-T17 (redirect success grants nothing).
- Marketing copy and per-plan limits were meant to live in one place together, with a unit test failing if AI copy and AI limits drifted (target requirement: plan catalogue entry has an immutable version, `COMMERCIAL_OPERATIONS.md` section 2).

### Mapping to target tiers (candidate, for OPEN-19)

| Legacy plan | Nearest target tier | Differences to decide |
|---|---|---|
| Free | Candidate Free | Legacy AI quota 5 requests/day; target AI quota open |
| Candidate Pro | Candidate Plus | Legacy $19.99/$199.90; target open |
| Recruiter Starter | Employer Team | Legacy flat team price with 5 active jobs; target is per seat per period with job slots open |
| Recruiter Enterprise | Employer Business/Enterprise | Legacy 1,000 active jobs, $299; target Enterprise is custom contract |
| (none) | Institution Cohort/Campus, course commerce, verification services | The prior plan table had no institution, course or verification line |

## 2. Where plans lived in the prior attempt (requirement: one source)

| Concern | Prior location (reference only) | Target requirement |
|---|---|---|
| Plans, prices (USD minor units), marketing copy, per-plan limits | A single billing module in the shared domain package (`PLATFORM_PLANS`, `getPlanEntitlements`) | One plan catalogue; versioned (COM-OPS section 2) |
| Effective access from stored subscription (active/trialing only) | `effectiveEntitlements` in a Stripe-billing module | Entitlements derived server-side from subscription state only (ADR-T15; legacy BR-056) |
| AI quota derived from entitlements (no second table) | `AI_QUOTA_LIMITS`, `aiQuotaForEntitlements` | Same: AI quota is an entitlement dimension, not a separate store |
| Posting limit | `assertCanPublishAnotherJob` | Enforced by a domain function called by the route, with an API-level test that bypasses the UI |
| Stripe price mapping | six `STRIPE_PRICE_*` environment variables | See section 4 |
| Public catalogue and per-user state | `GET /api/v1/billing/plans`; `GET /api/v1/billing/subscription` | Candidate API paths; the target API catalogue is authoritative |

## 3. Enforcement rules the prior attempt reported (as target requirements)

| Rule | Prior status | Target requirement |
|---|---|---|
| AI chat quota follows the stored subscription; HTTP 402 when exceeded | Reported enforced by an integration test | Requirement; response code to be aligned with the target API error model (RFC 9457) |
| Recruiter Starter: maximum 5 published jobs per organisation, checked on create and on status change | Reported enforced by direct API tests | Requirement; check on both transitions |
| Paid access only from verified Stripe state; failed/unpaid/canceled collapses to free | Reported enforced | Requirement (INV-T17) |
| Duplicate, stale and forged Stripe webhooks handled | Reported covered by integration tests | Requirement: signed, idempotent, ordered-tolerant webhooks (legacy BR-032, BR-115) |
| `hasAdvancedAnalytics`, "unlimited resume variations", "priority showcase visibility", multi-seat workspace, "Deep Talent Graph" | **Listed in plan copy but not gated or not implemented** in the prior attempt | **Do not sell until each is implemented and gated.** Note "priority showcase visibility" conflicts with the never-rank-by-payment rule if it affects discovery rank; review before use. |
| Free recruiters (no subscription) posting jobs | Unlimited in the prior attempt; policy undecided; the posting limit deliberately ignored non-recruiter tiers | Open: OPEN-LGA-18 (free-employer posting policy) |

## 4. Stripe catalogue created in the prior attempt (test mode only; reference data)

Created 2026-10-24 in the prior account's **test mode** (`livemode:false`); each price carried a `lookup_key` and `plan_tier` metadata. These are test-mode identifiers (not secrets) from the earlier account and **must not be assumed to exist for this project**; they are preserved so the mapping (variable name to plan and cycle) is not lost.

| Environment variable | Plan and cycle | Prior test-mode price id |
|---|---|---|
| `STRIPE_PRICE_CANDIDATE_PRO_MONTHLY` | Candidate Pro monthly | `price_1UU4BXQrKkHLd2iB9CO3UBKk` |
| `STRIPE_PRICE_CANDIDATE_PRO_YEARLY` | Candidate Pro yearly | `price_1UU4BYQrKkHLd2iBxM57fYMV` |
| `STRIPE_PRICE_RECRUITER_STARTER_MONTHLY` | Recruiter Starter monthly | `price_1UU4BZQrKkHLd2iBd8RfXUF3` |
| `STRIPE_PRICE_RECRUITER_STARTER_YEARLY` | Recruiter Starter yearly | `price_1UU4BaQrKkHLd2iBdg6j10x9` |
| `STRIPE_PRICE_RECRUITER_ENTERPRISE_MONTHLY` | Recruiter Enterprise monthly | `price_1UU4BbQrKkHLd2iBQc7WxwhI` |
| `STRIPE_PRICE_RECRUITER_ENTERPRISE_YEARLY` | Recruiter Enterprise yearly | `price_1UU4BcQrKkHLd2iB53hLfihE` |

Prior test-mode products: `prod_VV4KkfaSHb0Frj` (Candidate Pro), `prod_VV4K2x3G9kR1Lk` (Recruiter Starter), `prod_VV4Kd7dtezjlpr` (Recruiter Enterprise).

Prior limits stated: nothing live was created; no payment, checkout or webhook delivery was exercised against Stripe. The webhook endpoint (`/api/v1/billing/stripe-webhook`) was not registered until a public HTTPS API URL existed; the signing secret belongs in the deployment environment, **never in chat or git**. Free-plan (Free) has no price variable. Target: payments provider choice and tax/merchant-of-record model are OPEN-18; do not reuse these identifiers without checking the account they belong to.

## 5. Changing a plan safely (prior procedure; carried over as target process)

1. Edit the plan catalogue (limits and marketing copy together; a unit test fails if AI copy and AI limits drift).
2. Create a **new** payment-provider price (prices are immutable), update the environment variable, archive the old price.
3. Enforce any new limit through a domain function called by the route, with an API-level test that bypasses the UI.

Target alignment: matches COM-OPS plan catalogue versioning and grandfathering (OPEN-19). Governance link: a commercial/entitlement change was change class C7 in the prior governance model and required founder approval (see `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, legacy governance).

## 6. Prior open decisions and review notes (carried over; each is an open item here)

| Item | Statement | Id |
|---|---|---|
| Price approval | Founder approval of the prices above; USD only | OPEN-19, OPEN-18 |
| Free-recruiter posting | Which policy for unsubscribed employers; which advertised features to build or drop | OPEN-LGA-18 |
| Plans page UI (prior) | A plans page shown only when the server reported checkout enabled, listing features from the plans API, with a monthly/yearly toggle; the browser sent only plan and cycle; it showed the user's current plan and today's AI usage (read-only) with a limit-reached prompt; no comparison table; not exercised in a running app | Requirement candidate for the billing screens (`../07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md`): **the client sends plan and cycle only; price comes from the server** |
| Payment provider gaps | Webhook registration, upgrade/downgrade proration, trials | OPEN-19, OPEN-33 |
| Verification | No live billing verified | n/a |
| AI quota lowering (review 2026-10-24) | Prior values were reduced to match the entitlement table: free 20 to 5, Candidate Pro 500 to 50, Enterprise 5,000 to 200 requests/day (tokens 1M to 500k). The prior note said to confirm before any paying customer exists | OPEN-24, OPEN-19 |
| Acting user vs organisation | Prior entitlements followed the **acting user's** subscription, not the organisation's: a free-plan member of a paying organisation was not capped, and downgrades did not unpublish existing jobs. Organisation-level billing owner was an open product decision | OPEN-LGA-18 |
| Durability of quota meter | The prior AI usage meter lived in process memory (reset on restart, not shared across instances) so quotas were not durable | Target requirement: quota counters are durable and shared (database or cache with persistence); see ADR-T15 and the AI gateway budget design |
| Concurrency | Publishes were serialised per organisation in a single process; a second instance would need a database-level guard | Target requirement: job-slot limit enforced with a database-level guard (for example locked counter or constraint), not process-local locks |

## 7. Legacy rules that touch pricing (cross-reference; text in the BR catalogue)

BR-007 (billing actions for recruiters only; conflicts with a candidate plan), BR-032 and BR-115 (subscription and course purchases webhook-owned and idempotent), BR-055 (changes at period boundary or prorated), BR-056 (entitlements from active subscription only), BR-099 (coupon floor), BR-100 (refund 30 days; conflict with target BR-T097, OPEN-33), BR-101 (instructor earnings = 70% of net revenue after platform commission, configurable; target Phase 2 sells first-party courses only, so payouts are deferred), BR-129/BR-130 (outreach credits and weekly caps; conflict with BR-T081), BR-195 (paid expert calls, transparent fee), BR-205 (API access requires enterprise tier).


<!-- ledger-D D-03 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/PRICING.md (gap closure D-03)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: prior-code pointers `PaidPlans.tsx`, `plan-limits-domain`, `activeJobPostingLimit`, `packages/domain/src/stripe-billing.ts`, `tests/integration/plan-enforcement.test.ts` (lines 12-14, 32-41, 64-91 including the 'Enforced by' column).

~~~~text
L8: ## Where plans live (one source)
L9: 
L10: | Concern | Location |
L11: |---|---|
L12: | Plans, prices (USD minor units), marketing copy, per-plan limits | `packages/domain/src/billing.ts` (`PLATFORM_PLANS`, `getPlanEntitlements`) |
L13: | Effective access from stored subscription (active/trialing only) | `effectiveEntitlements` in `packages/domain/src/stripe-billing.ts` |
L14: | AI quota (derived from entitlements, no second table) | `AI_QUOTA_LIMITS`, `aiQuotaForEntitlements` in `ai-gateway.ts` |
[...]
L32: ## Enforcement status (verified by tests)
L33: 
L34: | Rule | Status |
L35: |---|---|
L36: | AI chat quota follows the stored subscription (402 when exceeded) | **Enforced** (`tests/integration/plan-enforcement.test.ts`) |
L37: | Recruiter Starter: max 5 published jobs per organisation, on create and on status change | **Enforced** (same test, direct API calls) |
L38: | Paid access only from verified Stripe state; failed/unpaid/canceled = free | **Enforced** (`effectiveEntitlements`, `stripe-billing` tests) |
L39: | Duplicate / stale / forged Stripe webhooks | **Covered** by `tests/integration/stripe-billing.test.ts` |
L40: | `hasAdvancedAnalytics`, "unlimited resume variations", "priority showcase visibility", multi-seat workspace, Deep Talent Graph | **Listed in plan copy, not gated or not implemented.** Do not sell until each is implemented and gated. |
L41: | Free recruiters (no subscription) posting jobs | **Unlimited today.** Policy undecided; `activeJobPostingLimit` deliberately ignores non-recruiter tiers. |
L42: 
[...]
L64: ## Changing a plan safely
L65: 
L66: 1. Edit `PLATFORM_PLANS` / `getPlanEntitlements` (limits and copy together; the
L67:    unit test `plan-limits-domain` fails if AI copy and limits drift).
L68: 2. Create a **new** Stripe price (prices are immutable), update the env var,
L69:    archive the old price.
L70: 3. Enforce any new limit through a domain function called by the route, with an
L71:    API-level test that bypasses the UI.
L72: 
L73: ## Open decisions and not done
L74: 
L75: - Founder approval of the prices above; currency is USD only.
L76: - Free-recruiter posting policy; which advertised features to build or drop.
L77: - Frontend: `PaidPlans.tsx` (shown only when the server reports Stripe checkout
L78:   enabled) now lists each plan's features from `/billing/plans` and has a
L79:   monthly/yearly toggle; the browser sends the plan and cycle only. It also shows the signed-in user's current plan and today's AI usage (read from
L80:   `/billing/subscription` and `/ai/usage`, display only) with a limit-reached
L81:   prompt. It has no comparison table yet, and was not exercised in
L82:   a running app (needs Stripe test config).
L83: - Stripe: webhook registration, upgrade/downgrade proration, trials.
L84: - Not verified: any live billing.
L85: 
L86: ## Review notes (2026-10-24)
L87: 
L88: - AI quota values were aligned to the entitlement table: free 20 to 5, Candidate Pro 500 to 50, Enterprise 5,000 to 200 requests/day (tokens 1M to 500k). This lowers limits that were previously generous; confirm before any paying customer exists.
L89: - Entitlements follow the **acting user's** subscription, not the organisation's. A free-plan member of a paying organisation is not capped, and downgrades do not unpublish existing jobs. Deciding an organisation-level billing owner is an open product decision.
L90: - The AI usage meter is in process memory (ephemeral): it resets on restart and is not shared between API instances, so quotas are not durable.
L91: - Publishes are serialised per organisation in the API process; a second API instance would need a database-level guard.
~~~~


<!-- ledger-D D-22 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md (gap closure D-22)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: access-limit lines 9-10 ('gh' not installed, GitHub connector not authorised, no TODO/FIXME markers found, no credentials used) and the `FIXME` token.

~~~~text
L7: ## Access limits
L8: 
L9: - GitHub issues and PRs: not reachable. `gh` is not installed and the GitHub connector is not authorized. Only commit history, `docs/reports/` and in-code markers were reviewed. No `TODO`/`FIXME` markers were found in `apps`, `packages` or `supabase`.
L10: - Stripe and Supabase projects: not inspected. No credentials were used. Stripe code ran only against fake gateways.
L11: - Not run: `pnpm test:pg` (needs `TEST_DATABASE_URL`), Playwright e2e, Reticle (no UI change).
~~~~


<!-- ledger-D D-18 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/reports/PAYMENT_AUDIT_2026-10-23.md (gap closure D-18)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: root-cause cells of P-1..P-6, baseline/after test numbers (4 failed / 5 passed; 42 / 42), the TS2345 text, `billingEventsByIdempotency`, `invoicesById`, `invoicesByUserId`, `${t}.${rawBody}`, evidence limit for P-3..P-5 (line 51).

~~~~text
L7: ## Scope and what exists
L8: 
L9: TalentSphere has **no Stripe or other payment-processor integration** (`CLAUDE.md`, `docs/reports/FEATURE_STATUS_2026-10-21.md`, issue #50). Billing is an in-memory scaffold in `apps/api/src/server.ts` (`/api/v1/billing/*`) over pure rules in `packages/domain/src/billing.ts`, plus an HMAC-signed generic webhook. Supabase Auth is not used (self-issued HMAC session tokens). Tables from `00014_billing_subscriptions_schema.sql` exist, but the API does not read or write them.
L10: 
L11: Adding a processor is a product decision (O-02 / X-03) and needs new dependencies in the protected `package.json`, so it was **not** attempted. This audit fixed the defects in the billing code that exists.
L12: 
L13: ## Access limits
L14: 
L15: - GitHub issues, PRs and discussions: not reachable (the session token is invalid; the issues API needs write-level attachment, which was not requested). Issue #50 is known only from `FEATURE_STATUS_2026-10-21.md`. No other GitHub issue was reviewed.
L16: - Stripe and Supabase projects: not inspected. No Stripe account or Supabase project is wired into the repo.
L17: - Not run: `pnpm test:pg` (needs `TEST_DATABASE_URL`), Playwright e2e, and the Reticle browser verification. The changes have no UI surface.
L18: 
L19: ## Issue register
L20: 
L21: | ID  | Pri | Defect (verified)                                                                                                                                                                                         | Root cause                                                                                                          | Fix                                                                                                                                                                                    | Status                           |
L22: | --- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
L23: | P-1 | P1  | `packages/domain` failed `tsc` (`TS2345: '"PAYMENT_REQUIRED"' is not assignable to DomainErrorCode`), breaking `pnpm build`/`typecheck`                                                                    | `createSubscription` threw a code missing from the `DomainErrorCode` union                                          | Added `PAYMENT_REQUIRED` to the union; mapped to HTTP 402 in the API error handler                                                                                                     | Fixed and verified               |
L24: | P-2 | P1  | `BILLING_MODE=simulated` was broken: `/billing/subscribe` for a paid tier returned 422, so 4 integration tests failed (subscribe, invoices, cancel, worker jobs)                                           | Route allowed simulated paid plans, but the domain constructor refused every paid tier unconditionally              | `createSubscription` takes `allowSimulatedPayment` (default `false`); the route passes it only when `BILLING_MODE === 'simulated'`. Production config still refuses simulated mode    | Fixed and verified               |
L25: | P-3 | P2  | A subscription scheduled to cancel at period end never ended: paid state and entitlements persisted forever                                                                                               | Nothing applied elapsed time to `cancelAtPeriodEnd`                                                                 | New domain `settleSubscription`; the route settles on `GET /subscription` and `POST /cancel` and drops entitlements to free                                                            | Fixed; unit-verified (see below) |
L26: | P-4 | P2  | Repeating a period-end cancel overwrote `canceledAt`                                                                                                                                                      | `cancelSubscription` had no idempotency for an already-scheduled cancel                                             | Repeat is a no-op returning the same object; immediate cancel still allowed                                                                                                            | Fixed and verified               |
L27: | P-5 | P2  | Reusing an idempotency key with a different plan or cycle returned the first request's result as a 200 "duplicate"                                                                                        | Duplicate detection matched the key only                                                                            | Compare the requested catalog amount with the stored invoice; mismatch returns 409 `CONFLICT`                                                                                          | Fixed and verified               |
L28: | P-6 | P2  | Account erasure left billing data behind: `invoicesById` and `billingEventsByIdempotency` (carrying `userId`) were not purged                                                                             | Erasure deleted `invoicesByUserId` only                                                                             | Erasure now removes the user's invoices from `invoicesById` and their billing events                                                                                                   | Fixed; not covered by a test     |
L29: 
L30: ## Reviewed and left unchanged (no defect, or needs a decision)
L31: 
L32: - Webhook signature: HMAC-SHA256 over `${t}.${rawBody}` using the raw bytes, 5-minute tolerance, timing-safe compare, and refusal when no secret is configured. Sound for the generic scheme. It is **not** Stripe's `Stripe-Signature` format.
L33: - Webhook idempotency is in-memory (`billingEventsByIdempotency`), so replays after a restart are reprocessed, and the handler records the event but changes no entitlements. This is acceptable only while billing is disabled. A real integration needs durable `billing_events` writes keyed by the provider event id.
L34: - `billing_events.idempotency_key` and `invoices.idempotency_key` are globally `UNIQUE` in SQL, while the in-memory check is per-user. Persisting as-is would let two users collide on one key. Scope the key per user when persisting.
L35: - Webhook `userId` is not checked for existence. This would violate the `billing_events` foreign key once persisted.
L36: - Plan `targetRole` is not enforced on subscribe, so any role can pick any plan in simulated mode. Left alone: the role-to-plan rule is not defined in the registries, and inventing it would be a new requirement.
L37: - Entitlements are not consumed outside the billing routes (F-61: "no gating").
L38: 
L39: ## Verification (run in a scratch copy, because `AGENTS.md` forbids installs and builds that write protected files in the repo)
L40: 
L41: | Check                                                                                  | Result                             |
L42: | -------------------------------------------------------------------------------------- | ---------------------------------- |
L43: | Baseline `tests/integration/billing.test.ts`                                           | 4 failed / 5 passed                |
L44: | Baseline `pnpm --filter ./packages/* build`                                            | `packages/domain` failed (`TS2345`) |
L45: | After fixes: packages build                                                            | all pass                           |
L46: | After fixes: `tsc -b` and `tsc -p tests`                                               | pass                               |
L47: | After fixes: billing integration, billing domain, production-config                    | 42 / 42 pass                       |
L48: | After fixes: `vitest run` (full)                                                       | 115 files, 1182 tests pass         |
L49: | Prettier on all changed files                                                          | pass                               |
L50: 
L51: Evidence of "fails before, passes after": P-1 and P-2 were observed failing at baseline. P-3, P-4 and P-5 tests were written after the fix and were **not** run against the unfixed code. P-3 is verified at the domain level only; there is no HTTP-level test because the session token would expire under the clock jump needed.
L52: 
L53: ## Changed files
L54: 
L55: - `packages/domain/src/core.ts`, `packages/domain/src/billing.ts`
L56: - `apps/api/src/server.ts`
L57: - `tests/unit/billing-domain.test.ts`, `tests/integration/billing.test.ts`
L58: 
L59: No protected build file was modified.
~~~~

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

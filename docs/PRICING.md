# TalentSphere — Plans, pricing and entitlements

Single authoritative description of what is sold and how it is enforced. The
code is the source of truth; this file says what the code does today.
Prices are **recommendations awaiting founder sign-off** (SSOT OD-34 "price
TBD"); no market research or cost model backs them yet.

## Where plans live (one source)

| Concern | Location |
|---|---|
| Plans, prices (USD minor units), marketing copy, per-plan limits | `packages/domain/src/billing.ts` (`PLATFORM_PLANS`, `getPlanEntitlements`) |
| Effective access from stored subscription (active/trialing only) | `effectiveEntitlements` in `packages/domain/src/stripe-billing.ts` |
| AI quota (derived from entitlements, no second table) | `AI_QUOTA_LIMITS`, `aiQuotaForEntitlements` in `ai-gateway.ts` |
| Posting limit | `assertCanPublishAnotherJob` in `billing.ts` |
| Stripe price mapping | env `STRIPE_PRICE_*` (6 vars, see `.env.example`) |
| Public catalogue | `GET /api/v1/billing/plans`; per-user state `GET /api/v1/billing/subscription` |

## Segments and plans (as coded)

| Plan | Audience | Monthly | Yearly | AI chat/day | Active jobs |
|---|---|---|---|---|---|
| Free | Candidates | $0 | $0 | 5 req / 5,000 tokens | n/a |
| Candidate Pro | Professionals | $19.99 | $199.90 | 50 req / 100,000 tokens | n/a |
| Recruiter Starter | Small hiring teams | $99 | $990 | 25 req / 50,000 tokens | 5 |
| Recruiter Enterprise | High-volume hiring | $299 | $2,990 | 200 req / 500,000 tokens | 1,000 |

Yearly = 10 months' price. No trials, add-ons or usage billing exist. Section 64
invariants (`validateMonetizationIntegrity`): no plan buys credibility, hiring
rank, assessment bypass or private evidence.

## Enforcement status (verified by tests)

| Rule | Status |
|---|---|
| AI chat quota follows the stored subscription (402 when exceeded) | **Enforced** (`tests/integration/plan-enforcement.test.ts`) |
| Recruiter Starter: max 5 published jobs per organisation, on create and on status change | **Enforced** (same test, direct API calls) |
| Paid access only from verified Stripe state; failed/unpaid/canceled = free | **Enforced** (`effectiveEntitlements`, `stripe-billing` tests) |
| Duplicate / stale / forged Stripe webhooks | **Covered** by `tests/integration/stripe-billing.test.ts` |
| `hasAdvancedAnalytics`, "unlimited resume variations", "priority showcase visibility", multi-seat workspace, Deep Talent Graph | **Listed in plan copy, not gated or not implemented.** Do not sell until each is implemented and gated. |
| Free recruiters (no subscription) posting jobs | **Unlimited today.** Policy undecided; `activeJobPostingLimit` deliberately ignores non-recruiter tiers. |

## Stripe (test mode only)

Created 2026-10-24 in the account's test mode (`livemode:false`), prices carry
`lookup_key` and `plan_tier` metadata. Test-mode ids (not secrets):

| Env var | Stripe price id |
|---|---|
| `STRIPE_PRICE_CANDIDATE_PRO_MONTHLY` | `price_1UU4BXQrKkHLd2iB9CO3UBKk` |
| `STRIPE_PRICE_CANDIDATE_PRO_YEARLY` | `price_1UU4BYQrKkHLd2iBxM57fYMV` |
| `STRIPE_PRICE_RECRUITER_STARTER_MONTHLY` | `price_1UU4BZQrKkHLd2iBd8RfXUF3` |
| `STRIPE_PRICE_RECRUITER_STARTER_YEARLY` | `price_1UU4BaQrKkHLd2iBdg6j10x9` |
| `STRIPE_PRICE_RECRUITER_ENTERPRISE_MONTHLY` | `price_1UU4BbQrKkHLd2iBQc7WxwhI` |
| `STRIPE_PRICE_RECRUITER_ENTERPRISE_YEARLY` | `price_1UU4BcQrKkHLd2iB53hLfihE` |

Products: `prod_VV4KkfaSHb0Frj` (Candidate Pro), `prod_VV4K2x3G9kR1Lk`
(Recruiter Starter), `prod_VV4Kd7dtezjlpr` (Recruiter Enterprise). Nothing live
was created; no payment, checkout or webhook delivery was exercised against
Stripe. The webhook endpoint (`/api/v1/billing/stripe-webhook`) is not
registered until a public HTTPS API URL exists; the signing secret goes into
the deployment environment, never into chat or git.

## Changing a plan safely

1. Edit `PLATFORM_PLANS` / `getPlanEntitlements` (limits and copy together; the
   unit test `plan-limits-domain` fails if AI copy and limits drift).
2. Create a **new** Stripe price (prices are immutable), update the env var,
   archive the old price.
3. Enforce any new limit through a domain function called by the route, with an
   API-level test that bypasses the UI.

## Open decisions and not done

- Founder approval of the prices above; currency is USD only.
- Free-recruiter posting policy; which advertised features to build or drop.
- Frontend: `PaidPlans.tsx` shows monthly prices and a Subscribe button only. No
  yearly toggle, comparison table, usage meter or upgrade prompt yet; the
  API already returns what they need (`/billing/subscription`, `/ai/usage`).
- Stripe: webhook registration, upgrade/downgrade proration, trials.
- Not verified: any live billing.

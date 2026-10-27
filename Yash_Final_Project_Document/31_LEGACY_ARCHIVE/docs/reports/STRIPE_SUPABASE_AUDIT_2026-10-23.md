# Stripe and Supabase audit, 2026-10-23

> Historical report: findings, counts and executed checks below belong to the recorded revision/session. Current source references and inspection limits are in [the implementation inventory](../system-model/01-inventory-and-coverage.md). No historical pass is a fresh release certification.

Follows `PAYMENT_AUDIT_2026-10-23.md`, which predates the Stripe integration (PR #71).

## Access limits

- GitHub issues and PRs: not reachable. `gh` is not installed and the GitHub connector is not authorized. Only commit history, `docs/reports/` and in-code markers were reviewed. No `TODO`/`FIXME` markers were found in `apps`, `packages` or `supabase`.
- Stripe and Supabase projects: not inspected. No credentials were used. Stripe code ran only against fake gateways.
- Not run: `pnpm test:pg` (needs `TEST_DATABASE_URL`), Playwright e2e, Reticle (no UI change).

## Findings

| ID  | Pri | Defect                                                                                                                                                                                  | Root cause                                                              | Fix belongs in             | Status                                      |
| --- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------- | ------------------------------------------- |
| S-1 | P2  | Account erasure could not finish once Stripe had deleted the customer but the local purge failed: the retry's `customers.del` returns `resource_missing`, which was reported as 503    | `deleteCustomer` treated every provider error as a failure              | Application code (gateway) | Fixed, unit test                            |
| S-2 | P3  | A `checkout.session.completed` whose customer is already linked to another account hits the unique `stripe_customer_id` constraint, so Stripe retried the event for days               | The handler checked the account but not the customer's existing owner   | Application code (webhook) | Fixed, integration test (memory store)      |
| S-3 | P3  | `stripe_customers` was revoked from `PUBLIC` only. Supabase grants `anon`/`authenticated` directly, so only RLS-with-no-policy protected it. Client roles also kept write grants on billing tables | Migration 00052 revoked from the wrong grantee                          | Database migration         | Fixed in 00053; SQL text test, not executed |
| S-4 | -   | 55 test files failed with `stripeConfigProblems is not a function`                                                                                                                      | Stale generated `packages/config/dist`; tests import the built package  | Local build (not source)   | Rebuilt with user approval; tests green     |

## Open, needs a decision or access

| ID  | Pri | Issue                                                                                                                                                                                                                                    | Needed                                                                                                               |
| --- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| O-1 | P2  | Two concurrent Checkout sessions can both be paid. The second subscription is ignored as superseded (no access, no tracking) but Stripe keeps billing it. Auto-cancel or refund is a pricing/entitlement decision (`AGENTS.md`: escalate) | Product decision; until then watch the "superseded subscription ignored" warning and refund in the Stripe Dashboard |
| O-2 | P3  | `charge.refunded`, `charge.dispute.created` and `invoice.voided` are not handled, so a refund or lost dispute does not change access                                                                                                      | Product decision on access after refund/dispute                                                                      |
| O-3 | P3  | `billing.subscription.synced` is dispatched after the event commits. If dispatch throws, Stripe retries, sees a replay and the job is never sent. State stays correct                                                                     | Outbox write inside `applyEvent`                                                                                     |
| O-4 | P3  | `fastify` 5.12.2-5.12.5 has a low advisory (GHSA-389g-gv7q-r4x8); fixed in 5.12.6                                                                                                                                                         | Edit `apps/api/package.json` and the lockfile (protected; needs your authorization)                                  |
| O-5 | P3  | The Stripe webhook shares the global rate limit (300 requests/min per IP by default). A renewal burst could return 429; Stripe retries with backoff                                                                                       | Route-level limit; judge against real event volume                                                                   |

## Manual configuration (not in code)

- Stripe Dashboard: create the six `STRIPE_PRICE_*` prices; a webhook endpoint at `/api/v1/billing/stripe-webhook` for `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`; and the Customer Portal configuration. Keep `BILLING_MODE=disabled` until done.
- Supabase: apply migration 00053 with `pnpm db:migrate` after review. It only revokes privileges.

## Verification

| Check                                                   | Result                                       |
| ------------------------------------------------------- | -------------------------------------------- |
| Baseline `pnpm test` (stale dist)                       | 55 files failed, 6 tests failed, 496 skipped |
| `pnpm build` (user-authorized; tracked tree unchanged)  | all packages and apps pass                   |
| `pnpm test` after rebuild, before fixes                 | 117 files, 1231 tests pass                   |
| S-1 and S-3 tests                                       | written after the fix, not run against the unfixed code |

## Update: refund handling (O-2 partly closed)

Decision (owner, 2026-10-23): a full refund of the charge that paid for the current period ends paid access.

- `charge.refunded` is now handled. When the charge is fully refunded, was made at or after the current period start, and the subscription is live, the subscription is canceled at Stripe immediately; the existing subscription reconciliation then drops entitlements to free.
- A partial refund, or a refund of an older charge, changes nothing.
- The cancel runs before the event is recorded, so a Stripe failure makes Stripe retry the event. A replay is recorded once and does not cancel again.
- `charge.dispute.created` and `invoice.voided` are still not handled (O-2 remains open for them).

## Update: hosted Supabase (issues #46, #48)

Project `talentsphere-production` (`qidckctwrkxyiwworchd`) was inspected read-only: one migration (`add_readonly_keepalive_ping`), no security advisories, no application tables. Migrations were **not** applied. `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` forbids it, and migrations 00016, 00018, 00022 and 00023 hold foreign keys to `auth.users(id)` while the app keeps users in `public.users`, so the schema would reject inserts and the Data API could expose tables. A hosted-specific migration path is needed first.

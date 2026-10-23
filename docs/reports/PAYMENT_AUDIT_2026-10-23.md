# Payment audit and fixes, 2026-10-23

## Scope and what exists

TalentSphere has **no Stripe or other payment-processor integration** (`CLAUDE.md`, `docs/reports/FEATURE_STATUS_2026-10-21.md`, issue #50). Billing is an in-memory scaffold in `apps/api/src/server.ts` (`/api/v1/billing/*`) over pure rules in `packages/domain/src/billing.ts`, plus an HMAC-signed generic webhook. Supabase Auth is not used (self-issued HMAC session tokens). Tables from `00014_billing_subscriptions_schema.sql` exist, but the API does not read or write them.

Adding a processor is a product decision (O-02 / X-03) and needs new dependencies in the protected `package.json`, so it was **not** attempted. This audit fixed the defects in the billing code that exists.

## Access limits

- GitHub issues, PRs and discussions: not reachable (the session token is invalid; the issues API needs write-level attachment, which was not requested). Issue #50 is known only from `FEATURE_STATUS_2026-10-21.md`. No other GitHub issue was reviewed.
- Stripe and Supabase projects: not inspected. No Stripe account or Supabase project is wired into the repo.
- Not run: `pnpm test:pg` (needs `TEST_DATABASE_URL`), Playwright e2e, and the Reticle browser verification. The changes have no UI surface.

## Issue register

| ID  | Pri | Defect (verified)                                                                                                                                                                                         | Root cause                                                                                                          | Fix                                                                                                                                                                                    | Status                           |
| --- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| P-1 | P1  | `packages/domain` failed `tsc` (`TS2345: '"PAYMENT_REQUIRED"' is not assignable to DomainErrorCode`), breaking `pnpm build`/`typecheck`                                                                    | `createSubscription` threw a code missing from the `DomainErrorCode` union                                          | Added `PAYMENT_REQUIRED` to the union; mapped to HTTP 402 in the API error handler                                                                                                     | Fixed and verified               |
| P-2 | P1  | `BILLING_MODE=simulated` was broken: `/billing/subscribe` for a paid tier returned 422, so 4 integration tests failed (subscribe, invoices, cancel, worker jobs)                                           | Route allowed simulated paid plans, but the domain constructor refused every paid tier unconditionally              | `createSubscription` takes `allowSimulatedPayment` (default `false`); the route passes it only when `BILLING_MODE === 'simulated'`. Production config still refuses simulated mode    | Fixed and verified               |
| P-3 | P2  | A subscription scheduled to cancel at period end never ended: paid state and entitlements persisted forever                                                                                               | Nothing applied elapsed time to `cancelAtPeriodEnd`                                                                 | New domain `settleSubscription`; the route settles on `GET /subscription` and `POST /cancel` and drops entitlements to free                                                            | Fixed; unit-verified (see below) |
| P-4 | P2  | Repeating a period-end cancel overwrote `canceledAt`                                                                                                                                                      | `cancelSubscription` had no idempotency for an already-scheduled cancel                                             | Repeat is a no-op returning the same object; immediate cancel still allowed                                                                                                            | Fixed and verified               |
| P-5 | P2  | Reusing an idempotency key with a different plan or cycle returned the first request's result as a 200 "duplicate"                                                                                        | Duplicate detection matched the key only                                                                            | Compare the requested catalog amount with the stored invoice; mismatch returns 409 `CONFLICT`                                                                                          | Fixed and verified               |
| P-6 | P2  | Account erasure left billing data behind: `invoicesById` and `billingEventsByIdempotency` (carrying `userId`) were not purged                                                                             | Erasure deleted `invoicesByUserId` only                                                                             | Erasure now removes the user's invoices from `invoicesById` and their billing events                                                                                                   | Fixed; not covered by a test     |

## Reviewed and left unchanged (no defect, or needs a decision)

- Webhook signature: HMAC-SHA256 over `${t}.${rawBody}` using the raw bytes, 5-minute tolerance, timing-safe compare, and refusal when no secret is configured. Sound for the generic scheme. It is **not** Stripe's `Stripe-Signature` format.
- Webhook idempotency is in-memory (`billingEventsByIdempotency`), so replays after a restart are reprocessed, and the handler records the event but changes no entitlements. This is acceptable only while billing is disabled. A real integration needs durable `billing_events` writes keyed by the provider event id.
- `billing_events.idempotency_key` and `invoices.idempotency_key` are globally `UNIQUE` in SQL, while the in-memory check is per-user. Persisting as-is would let two users collide on one key. Scope the key per user when persisting.
- Webhook `userId` is not checked for existence. This would violate the `billing_events` foreign key once persisted.
- Plan `targetRole` is not enforced on subscribe, so any role can pick any plan in simulated mode. Left alone: the role-to-plan rule is not defined in the registries, and inventing it would be a new requirement.
- Entitlements are not consumed outside the billing routes (F-61: "no gating").

## Verification (run in a scratch copy, because `AGENTS.md` forbids installs and builds that write protected files in the repo)

| Check                                                                                  | Result                             |
| -------------------------------------------------------------------------------------- | ---------------------------------- |
| Baseline `tests/integration/billing.test.ts`                                           | 4 failed / 5 passed                |
| Baseline `pnpm --filter ./packages/* build`                                            | `packages/domain` failed (`TS2345`) |
| After fixes: packages build                                                            | all pass                           |
| After fixes: `tsc -b` and `tsc -p tests`                                               | pass                               |
| After fixes: billing integration, billing domain, production-config                    | 42 / 42 pass                       |
| After fixes: `vitest run` (full)                                                       | 115 files, 1182 tests pass         |
| Prettier on all changed files                                                          | pass                               |

Evidence of "fails before, passes after": P-1 and P-2 were observed failing at baseline. P-3, P-4 and P-5 tests were written after the fix and were **not** run against the unfixed code. P-3 is verified at the domain level only; there is no HTTP-level test because the session token would expire under the clock jump needed.

## Changed files

- `packages/domain/src/core.ts`, `packages/domain/src/billing.ts`
- `apps/api/src/server.ts`
- `tests/unit/billing-domain.test.ts`, `tests/integration/billing.test.ts`

No protected build file was modified.

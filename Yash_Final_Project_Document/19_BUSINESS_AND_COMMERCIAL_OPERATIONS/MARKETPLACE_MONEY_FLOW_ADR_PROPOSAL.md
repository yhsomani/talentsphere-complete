# Third-Party Marketplace Money Flow: ADR Proposal Outline

Doc ID: COM-MKT - Owner: Finance Lead with Chief Product Officer - Version 1.0 - Status: Proposal outline, not decided - Date 2026-10-25 - Relates: COM-OPS, FIN-COST, FIN-ENV, ADR-T15, STR-01 section 5, OPEN-06, OPEN-08, OPEN-18, SM-ENROLMENT t8 and t9, WP-BILLING-STRIPE, REVW-12, REVW-30

**Relationship statement:** this file supersedes nothing. It is the additive record of the REVW-30 decision in `27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md`. `COMMERCIAL_OPERATIONS.md` section 13A holds the same outline from an earlier in-place edit, together with in-place Phase 2 scope notes in its sections 2, 5, 7 and 13. If the owner reverts those edits, this file stands alone.

**No decision is made here.** The governance agent assigns the ADR number (working title ADR-MKT; it takes the next free `ADR-Tnn`). All values are [OPEN]. Nothing here is legal or tax advice (OPEN-08, OPEN-18).

## 1. Binding scope decision (from REV-RES)

1. **Phase 2 sells first-party (platform-sold) courses only.** The platform is the seller of record; authors are engaged under contract or licence; the product contains no payout, connected-account, seller-KYC or instructor-pricing flow.
2. **A third-party paid marketplace is deferred to Phase 3** and starts only after this ADR is accepted by the Architecture Review Board.
3. Until acceptance, no feature, screen, API, event, state transition or test that assumes instructor payouts, third-party seller-of-record logic or instructor-set pricing may appear in a Phase 1 or Phase 2 launch registry. `TEST-BIL-009` (in `16_*/TEST_CATALOG.md#record-test-catalog-rev2`) checks this.
4. Revenue share (OPEN-06) is a Phase 3 question. In Phase 2 any fee paid to an author is an ordinary contract payment outside the product.

## 2. Proposed ADR outline

| ADR section | What must be decided (all values [OPEN]) |
|---|---|
| Title | ADR-MKT: Money flow for third-party paid courses |
| Status | Proposed |
| Context | Paid third-party courses need a money flow that no accepted ADR designs. ADR-T15 covers a single payment processor with hosted checkout, customer portal and signed webhook for platform-sold products only. Open questions already recorded in OPEN-06 (revenue share) and OPEN-18 (tax) |
| Decision drivers | Legal and tax exposure; instructor trust; fraud (self-purchase, wash enrolment); load on Finance Ops; cost envelope row E18 in `21_*/COST_ENVELOPE.md`; the integrity of the evidence ladder (REVW-12) |
| Question 1: seller of record | Platform as seller (resale or licence model), versus instructor as seller with the platform as marketplace facilitator, versus a merchant-of-record provider. Consequences for invoices, consumer-rights liability, refund responsibility |
| Question 2: payouts | Connected accounts at the payment provider, versus manual payouts from accounts payable. Payout cycle, hold period, minimum amount, currency, treatment of refunds and chargebacks (negative balances, clawback), reversal path. Provider capabilities must be verified from the provider's documentation with a date; they are not assumed here |
| Question 3: seller identity | KYC and sanctions screening proportionate to risk; recovery of a seller account; who may receive money; link to the independence rules of REVW-12 (instructor different from learner, issuer independence, revocability) |
| Question 4: tax | Who collects and remits VAT or sales tax, by jurisdiction; collection and storage of tax forms; B2B tax identifiers; reporting. Requires a tax advisor. No rates or thresholds are stated in this documentation |
| Question 5: refunds and disputes | Refund policy visible before purchase; who funds a refund; effect on payout and on awarded evidence (a refunded enrolment must not leave a revocable attestation unreviewed); dispute evidence package |
| Question 6: content rights and moderation | Licence terms, takedown path (PROC-05), pre-publication review, liability |
| Question 7: data protection | Controller and processor roles between platform, instructor and payment provider; what learner data an instructor can see (aggregate only unless the learner consents) |
| Question 8: anti-gaming | Revenue share must not reward inflated completions: payout statements exclude completions flagged by the independence checks (instructor equals learner, shared account, device or payment-instrument signal) |
| Options to compare | A: stay first-party only (status quo; no ADR needed). B: provider-hosted connected accounts. C: merchant-of-record provider. D: manual payouts. Each option carries a cost row (E18) and an operations-load estimate from Finance Lead |
| Evidence required before acceptance | Counsel opinion (OPEN-08, OPEN-18); dated provider quotes in `COST_ENVELOPE.md`; a fraud and abuse entry in the threat model; Phase 2 operating data on refunds, disputes and reconciliation breaks (MET-032) |
| Consequences to size | New or extended state machines (SM-ENROLMENT, SM-SUBSCRIPTION, a payout machine); new business rules; webhook handlers; reconciliation rows (`COMMERCIAL_OPERATIONS.md` section 7); tests from TEST-BIL-010 onward; support runbooks; data-model changes |
| Revisit trigger | Business demand for third-party instructors that first-party content cannot meet, together with an accepted answer to every question above |
| Gate | The Phase 3 marketplace work package may start only after acceptance |

## 3. Items for the governance agent

| Item | Action |
|---|---|
| ADR number | Assign the next free `ADR-Tnn` to ADR-MKT; register it as Proposed in `ADR_REGISTER.md` |
| OPEN-06 | Re-tag as Phase 3, blocking only the marketplace work package |
| OPEN-18 | Keep open; Phase 2 first-party sales still need a seller-of-record and tax answer for the platform itself |
| Roadmap | Confirm `WP-BILLING-STRIPE` Phase 2 scope is first-party checkout only; add a Phase 3 marketplace work package that depends on this ADR |
| Capability map | `FEAT-08-09` stays deferred; any third-party commerce feature is Phase 3 |

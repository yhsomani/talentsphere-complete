# SSOT Workflow and Integrity Crosswalk

**Status: candidate mapping for owner review (OPEN-45).** The protected root `SSOT.md` defines 66 `WF-*` workflow identities and 25 `WIT-*` integrity traces. The target [Business Process Inventory](BUSINESS_PROCESS_INVENTORY.md) defines 38 `BP-*` processes. These registers have different scopes and identities; counts do not imply parity.

## Row-level mapping

The [CSV crosswalk](SSOT_WORKFLOW_CROSSWALK.csv) has one row for every SSOT `WF-*` and `WIT-*` identity. It retains the source title and terminal/guard, candidate BP IDs, a disposition, and a residual. The source integrity traces are safeguards attached to workflows, not standalone user journeys.

| Source set | Rows | Partial BP-level match | No BP-level match |
|---|---:|---:|---:|
| `WF-*` | 66 | 33 | 33 |
| `WIT-*` | 25 | 18 | 7 |
| **Total** | **91** | **51** | **40** |

`No match` means this inventory has no defensible end-to-end process counterpart; it does not prove the behavior is absent from every feature, rule, API, or operations document, and it is not a retirement decision. Partial matches preserve the target process IDs while naming the unrepresented source behavior or guard. No mapping establishes implementation or owner approval.

## Owner-review focus

- The source repeats the certification-exam workflow under both `WF-33` and `WF-53`; both identities remain visible until an owner decides whether they are duplicate records or distinct scenarios.
- No BP-level counterparts were identified for several source workflows, including institutional procurement/licensing and renewal, course publishing and creator payouts, contests, social/newsletter publishing, salary aggregation, mentorship/expert calls, custom assessment authoring, referrals/alumni, reputation, and internal mobility.
- High-impact source guards needing explicit disposition include mandatory scorecard preconditions, append-only moderation/audit, signed webhook plus entitlement reconciliation, validate-then-commit import, exact seat accounting, never-auto-convert at graduation, SSRF allow-listing, and webhook-owned course fulfillment.
- Review these process-level gaps together with the separate candidate J-to-UJ map in [User Journeys](../02_STAKEHOLDERS_AND_USERS/USER_JOURNEYS.md). State-machine identity coverage remains open; see OPEN-45.




# Patch 2026-10-27: Interaction traces (XT-01..XT-06) for unmatched workflows (OPEN-45)

**Status: candidate traces for owner review, [TARGET]/PROPOSED.** Closes six of the 33 unmatched `WF-*` rows (WF-16, WF-20, WF-23, WF-24, WF-30, WF-38) with an end-to-end chain. Source titles, terminals and guards come from the CSV crosswalk; where the source gives no guard, the guard here is PROPOSED. Action ids, `API-*` and event names are placeholders to be aligned with [ACTION_REGISTRY](../07_UI_UX_AND_DESIGN_SYSTEM/ACTION_REGISTRY.md), [13_API_EVENTS_AND_INTEGRATIONS](../13_API_EVENTS_AND_INTEGRATIONS/ACTION_TO_OPERATION_MAP.md) and audit names in [14_SECURITY_PRIVACY_COMPLIANCE](../14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md) (pending patch). No new ACT ids are claimed: where no ACT exists the row says `ACT gap`, which is an open finding, not a decision. The remaining 27 unmatched workflows stay open under OPEN-45.

**Chain stages (columns of every trace):** actor, UI, validation, module boundary, authz, API, invariant or transaction, outbox, async, UI feedback, audit, retry or rollback. The *Owner* is the party accountable at that boundary (role or module, not a person).

## XT-01 Institutional licence purchase (WF-16; terminal: pool active and invoice reconciled; guard: idempotency on PO number plus payment event id)

| Stage | Step | Owner |
|---|---|---|
| Actor | ROLE-INSTADM | Institution |
| UI | Billing area in institution workspace (MOD-ACC / SCR-ACC-08 family); ACT gap for "Request licence pool" (ACT-BIL-01 is plan checkout) | Interaction Design Lead |
| Validation | Seats >= 1, PO number format, currency; client convenience only | Client then `api/billing` |
| Module boundary | `mf-account` -> `api/billing`; institution identity from `api/institutions` | DOM-16, DOM-18 |
| Authz | Capability `billing.manage` in institution workspace, step-up (SU) | `packages/policy` |
| API | `API-billing-create-licence-checkout` with Idempotency-Key and PO number (PROPOSED) | `api/billing` |
| Invariant / tx | Unique (institution, PO number); pool row created `pending` in one transaction with the checkout record | `api/billing` |
| Outbox | `licence.pool.requested` written in the same transaction | `api/billing` |
| Async | Provider webhook (verified, idempotent by event id, INV-T17) activates pool and triggers invoice reconciliation job | BMOD-WORKER |
| UI feedback | "Confirming payment" until entitlement visible (CSV-07), then pool active with seat counts | MOD-ACC |
| Audit | `licence.pool.activated` (PROPOSED name) | 14 owns names |
| Retry / rollback | Lost response: status query by key; duplicate webhook no-op; failed payment leaves pool `pending` then expires; refund path compensates (CSV-09) | `api/billing` |

## XT-02 Licence revocation and seat reassignment (WF-20; terminal: seat returned and reassigned exactly once; guard: row lock, progress retained)

| Stage | Step | Owner |
|---|---|---|
| Actor | ROLE-INSTADM or ROLE-ORGADM | Institution / Org |
| UI | Seat list; ACT-ORG-05 assigns, a "Revoke seat" action is an ACT gap | Interaction Design Lead |
| Validation | Seat belongs to pool; target member eligible; reason required | `api/billing` |
| Module boundary | `mf-account` / `mf-admin` -> `api/billing` -> `api/learning` (progress) | DOM-16, DOM-08 |
| Authz | `billing.seat.manage`, step-up for revoke; cannot revoke own last owner seat | `packages/policy` |
| API | `API-billing-revoke-seat` then `API-billing-assign-seat` as one saga with a shared operation id (PROPOSED) | `api/billing` |
| Invariant / tx | Row lock on seat; seat count never negative or doubled; learner progress is retained, only entitlement changes | `api/billing` |
| Outbox | `seat.revoked`, `seat.assigned` in the same transaction | `api/billing` |
| Async | Entitlement cache invalidation; notification to both users (SM-NOTIFY) | BMOD-WORKER |
| UI feedback | Row shows `partial` if reassignment fails after revoke (CSV-11), with "Retry assign" | MOD-ACC |
| Audit | `seat.revoked`, `seat.assigned` (PROPOSED) | 14 |
| Retry / rollback | Re-run is idempotent by operation id; if assign fails seat returns to pool (compensated) | `api/billing` |

## XT-03 Purchase approval (WF-23; terminal: approved and PO issued; guard: configurable chain, RBAC per level)

| Stage | Step | Owner |
|---|---|---|
| Actor | Requester (ROLE-ORGADM / INSTADM) then approver per level | Org |
| UI | Request form and approval inbox; ACT gap (no approval ACT exists; ACT-PIPE-11 offer approval is a different flow, `[OPEN]`) | Interaction Design Lead |
| Validation | Amount, cost centre, justification; chain resolved server-side | `api/billing` |
| Module boundary | `mf-account` -> `api/billing`; chain config from `api/orgs` | DOM-16, DOM-02 |
| Authz | Each level requires its own role; requester cannot approve own request (separation of duties) | `packages/policy` |
| API | `API-billing-request-purchase`, `API-billing-approve-purchase` (PROPOSED) | `api/billing` |
| Invariant / tx | Request moves one level at a time; approval by a user already acted on a level is rejected; stale approval after chain change returns 409 | `api/billing` |
| Outbox | `purchase.approved` after final level, triggers XT-01 | `api/billing` |
| Async | Notification to next approver; reminder; escalation timeout PROPOSED | BMOD-WORKER |
| UI feedback | Status per level with names and times, not colour alone | MOD-ACC |
| Audit | `purchase.level.approved/rejected` (PROPOSED) | 14 |
| Retry / rollback | Rejection is terminal with reason; requester resubmits as new request; approve is idempotent by (request, level) | `api/billing` |

## XT-04 Course publish review (WF-24; terminal: approved or rejected with feedback; guard: admin review SLA of 72 h or less, maximum 3 rejections)

| Stage | Step | Owner |
|---|---|---|
| Actor | ROLE-INST submits; ROLE-ADM or reviewer decides | Learning / Platform |
| UI | Instructor studio "Submit for review" (ACT gap; SM-COURSE `draft`,`in_review`,`published`) and admin review queue | Interaction Design Lead |
| Validation | Completeness checklist (lessons, assessment, description, licence); server re-validates | `api/learning` |
| Module boundary | `mf-learning` -> `api/learning`; reviewer in `mf-admin` -> `api/admin` | DOM-08, DOM-20 |
| Authz | Instructor owns course; reviewer capability `course.review`; reviewer is not the author | `packages/policy` |
| API | `API-learning-submit-course-review`, `API-learning-decide-course-review` (PROPOSED) | `api/learning` |
| Invariant / tx | SM-COURSE draft to in_review to published/draft; rejection counter increments, a 4th submission is blocked pending human review (rule from source guard; exact rule needs BR-T id); decision requires a human actor (INV-T09) | `api/learning` |
| Outbox | `course.review.decided` | `api/learning` |
| Async | SLA timer at 72 h (source) alerts reviewers; notification to instructor | BMOD-WORKER |
| UI feedback | Instructor sees `in_review` with expected decision date, then feedback text; reviewer sees queue age | MOD-LRN / MOD-ADM |
| Audit | `course.review.decided` (PROPOSED) | 14 |
| Retry / rollback | Decision idempotent by review id; two reviewers: second gets 409 with first decision; unpublish via SM-COURSE `unpublished` | `api/learning` |

## XT-05 Assignment submit to grade or peer review (WF-30; terminal: grade finalised)

| Stage | Step | Owner |
|---|---|---|
| Actor | ROLE-CAND submits; ROLE-INST grades or peers review | Learning |
| UI | Lesson assignment area in SCR-LRN-04/05; ACT gap for "Submit assignment" and "Grade" (only ACT-LRN-03 quiz exists) | Interaction Design Lead |
| Validation | File type and size per FLD-EVD-04 rules, text limit PROPOSED, deadline | `api/learning` |
| Module boundary | `mf-learning` -> `api/learning`; files via `api/platform` (SM-FILE scan) | DOM-08, DOM-24 |
| Authz | Enrolled learner only; grader is instructor of that course; peer reviewers cannot be the author | `packages/policy` |
| API | `API-learning-submit-assignment`, `API-learning-grade-submission` (PROPOSED) | `api/learning` |
| Invariant / tx | One active submission per learner per assignment; late rule from course policy; grade changes create a new revision, never edit history | `api/learning` |
| Outbox | `assignment.submitted`, `assignment.graded` | `api/learning` |
| Async | File scan before reviewer sees attachment; notify grader; peer allocation job | BMOD-WORKER |
| UI feedback | States draft, submitted, processing (scanning), committed (graded) per CSV vocabulary; grade shown only when finalised | MOD-LRN |
| Audit | `assignment.graded` (PROPOSED) | 14 |
| Retry / rollback | Resubmit allowed until deadline (new revision); regrade by instructor audited; a graded result does not auto-create evidence (INV-T08, ACT-LRN-06 is learner-initiated) | `api/learning` |

## XT-06 Recommendation request, give, accept, display (WF-38; terminal: displayed or declined)

| Stage | Step | Owner |
|---|---|---|
| Actor | ROLE-CAND requests; referee gives; candidate accepts | Candidate / referee |
| UI | Candidate requests via ACT-VER-02 family; referee page ACT-REF-01/02 (SCR-SHELL-09); acceptance control is an ACT gap (SM-REFERENCE covers the confirmation, not display choice) | Interaction Design Lead |
| Validation | FLD-REF-01..03; referee token and fragment secret; text limits | `api/verification` |
| Module boundary | `mf-candidate` and shell token page -> `api/verification` -> `api/evidence` (rung recompute) | DOM-06, DOM-05 |
| Authz | Candidate owns request; referee is token-bound and non-account (ROLE-REFEREE); display requires candidate acceptance and visibility consent | `packages/policy` |
| API | `API-verification-create-request`, `API-verification-submit-public`, `API-evidence-accept-attestation` (PROPOSED for the last) | `api/verification` |
| Invariant / tx | Single-use expiring token; at most 3 open requests per claim; the attestation never sets a rung directly (INV-T04, rung recomputed by rule DT-04); candidate may decline display without deleting the referee's statement | `api/verification` |
| Outbox | `reference.submitted`, `attestation.accepted` | `api/verification` |
| Async | Email delivery (SM-NOTIFY); reminders (max 2, INV-T51); rung and skill-confidence recompute via SM-BGJOB | BMOD-WORKER |
| UI feedback | Candidate sees "Sent", "Received", "Shown on your profile" or "Not shown"; referee sees neutral thank-you page | MOD-CAND / SHELL |
| Audit | `reference.requested`, `reference.submitted`, `attestation.accepted/declined` (PROPOSED) | 14 |
| Retry / rollback | Lost response on referee submit: replay returns same result; expired link RD-15 neutral; withdrawal compensates (CSV-09) | `api/verification` |

## Trace coverage

| Trace | WF | Previously | Remaining ACT gaps raised |
|---|---|---|---|
| XT-01 | WF-16 | no match | Request licence pool |
| XT-02 | WF-20 | no match | Revoke seat |
| XT-03 | WF-23 | no match | Request and approve purchase |
| XT-04 | WF-24 | no match | Submit course for review; decide review |
| XT-05 | WF-30 | no match | Submit assignment; grade |
| XT-06 | WF-38 | no match | Accept attestation display |

Raised as **OPEN-UX-36** (PROPOSED): register the listed ACT gaps in the Action Registry before the traces move from candidate to approved.

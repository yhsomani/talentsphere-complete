# Decision Tables, Revision 2 (DT-00 REV2)

Doc ID: DT-00-R2 · Owner: Business Analyst Lead · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-12, 22, 27, 20 (decision-table parts) · Relates: DT-00 (DT-01…DT-12), BR-REG-R2, SM-00-R2

**Relationship (no original file was edited).** This file **supersedes, once accepted**, DT-06 (Evidence rung computation) and DT-05 row 5 of `DECISION_TABLES.md`, adds DT-05 row 5a, and amends DT-12 row 2 and the DT-03 introduction; all other tables and rows stand. New table ids are appended: DT-13 and DT-14. Hit policies, `*` and `{}` conventions are those of DT-00. All content **[TARGET]**.

## DT-06 (replacement) Evidence rung computation (hit policy F, highest satisfied rung wins)

Inputs are *currently valid* provenance records (INV-T22). Each authority record carries an `issuer_class` (BR-T118); each employer-domain proof carries `domain_binding` (BR-T017).

| # | Condition | Rung | Badge detail |
|---|---|---|---|
| 1 | Valid issuer verification exists: platform auto-graded assessment pass or platform course rule (`platform`); verified institution (`institution`); verified employer org confirmation (`employer_org`); instructor sign-off passing BR-T119 (`instructor`) | `authority_verified` | Class shown. The strongest present class is displayed; an item whose only authority record is `instructor` shows "Instructor attested", never "Platform verified" |
| 2 | At least one valid peer attestation (BR-T010) or valid referee confirmation (DT-04 row 1) | `peer_attested` | "Confirmed by referee" |
| 3 | Clean-scanned artefact attached, **or** live link passing BR-T009, **or** employer-domain proof of control with `domain_binding = bound` (SM-VERIFICATION `verified`) | `artifact_backed` | "Mailbox verified" for a bound proof |
| 3a | Employer-domain proof of control with `domain_binding = unbound` and none of the conditions in row 3 | `claimed` | "Mailbox verified, employer not confirmed" (a lower badge; not a rung) |
| 4 | none of the above | `claimed` | "Not verified" |

Revocation or lapse of the record that satisfied the current rung makes the next evaluation fall to the next row (audited downgrade, BR-T005). `source=ai` items are rejected before this table is reached (BR-T007).

**Matching weight note (extends DT-03 "Evidence rung per supporting item").** Weights differ by `issuer_class` within `authority_verified`: platform ≥ institution ≥ employer_org > instructor. Numeric weights are **[OPEN-05]** and must be shown in the explanation (BR-T071).

## DT-05 row 5a (addition) and row 5 clarification

| # | Condition | Result |
|---|---|---|
| 5 | Non-terminal application exists for (candidate, job) ≠ this draft | `409 already_applied` with link (BR-T001) (unchanged) |
| 5a | Previous application for (candidate, job) is `withdrawn` and less than {24 h} have passed since `withdrawn_at` | `409 reapply_cooldown` with the earliest allowed time (BR-T125). After the cooldown the submit proceeds and records `reapplied_from` |

Row 5a is evaluated after row 5 and before row 6.

## DT-12 row 2 (amendment)

Row 2 now reads: "Org `verification_state` ≠ `verified` and the org already has 1 live job → `409 org_verification_required`." After SM-ORG v5 (verification revoked) the same row applies to the organization with its remaining live job (BR-T123).

## DT-13 (new) Referee reminder eligibility (hit policy F)

Inputs: request state, reminders already sent (system plus manual), days since last send of any kind, trigger (`system_due` or `manual`).

| # | Request state | Reminders sent | Days since last send | Trigger | Decision |
|---|---|---|---|---|---|
| 1 | not `sent` / `opened` | * | * | * | No reminder |
| 2 | * | ≥ 2 | * | * | Deny `reminder_cap_reached` (ACT-VER-03 disabled with reason "2 of 2 reminders used") |
| 3 | `sent` / `opened` | < 2 | < 3 | manual | Deny `too_soon` (shows the earliest time) |
| 4 | `sent` / `opened` | < 2 | < 3 | system_due | Defer until 3 days have passed |
| 5 | `sent` / `opened` | < 2 | ≥ 3 | manual or system_due | Send; count + 1 |

## DT-14 (new) Instructor sign-off acceptance (hit policy F)

| # | Condition | Decision |
|---|---|---|
| 1 | Instructor account = learner account | Reject `self_signoff` (no review; 422) |
| 2 | Shared device, session cluster or payment-instrument signal (BR-T119 b) | Hold for human review; enrolment stays `completion_pending_signoff`; no evidence minted |
| 3 | Instructor not an approved instructor, or conflict-of-interest declaration missing | Hold for human review |
| 4 | Sign-offs for one learner cluster exceed {N} in {period} (BR-T119 d) | Hold for human review |
| 5 | otherwise | Accept; mint evidence at `authority_verified` with `issuer_class = instructor` |

A held sign-off never auto-rejects; a human decides (INV-T09, INV-T20).

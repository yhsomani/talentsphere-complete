# Decision Tables (DT-*)

Doc ID: DT-00 · Owner: Business Analyst Lead · Version 1.0 · Status: Under Review · Relates: INV-T15, INV-T17, INV-T19, INV-T20, BR-REG, SM-00, FEAT-05-02, FEAT-06-03, FEAT-10-02, FEAT-11-03, FEAT-16-04

> **Revision 2 folded in (2026-10-27).** Amended rows, new rules/tables/machines from `DECISION_TABLES_REV2.md` are now part of this file. The REV2 file stays as the change record. Status is unchanged: proposals still need owner/ARB ratification.

All tables are **[TARGET]**. **Hit policy:** `U` unique (exactly one row matches), `F` first match top-to-bottom. `*` = any. Implementation lives in `packages/domain` / `packages/policy` as pure functions with one test per row; routes never restate these rules. Thresholds in `{}` are **[OPEN]** tunables.

## DT-01 Visibility vs consent (hit policy F, default deny)

Consent scopes (canonical ids from `00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md`, FEAT-22-01.1; this list is generated from it, FF-12): `search.discoverable` appear in recruiter search · `outreach.recruiter_contact` allow first-contact outreach · `evidence.share_summary` evidence titles, skills, rungs · `evidence.share_artefact` open artefacts (per employer) · `profile.share_contact` email/phone (per employer) · `alumni.share_outcomes` institution outcome sharing (chosen fields) · `application.share_snapshot` implicit per application (BR-T062) · `evidence.share_institution` cohort reporting. Account-level scopes (`profile.public_view`, `matching.recommend`, `ai.assist.process`, `analytics.product`, `comms.marketing_email`, `data.research_aggregate`) gate processing, not viewer reads, and are not rows of this table. Retired legacy ids (`CS-*`) map in CSC section 4.

| # | Viewer | Data class | Condition | Result |
|---|---|---|---|---|
| 1 | Self | any own data | authenticated, record owner | Allow |
| 2 | Anonymous / any user | public profile fields (display name, headline, coarse location) | profile `public` and account `active` | Allow (fields per visibility setting) |
| 3 | Anonymous | evidence, work history, contact | — | Deny |
| 4 | Recruiter / HM (job team) | application snapshot incl. evidence listed in it | application to that job is active or within retention {12 months}; viewer on job's hiring team; `application.share_snapshot` for that application and org not expired | Allow snapshot; live items only if `application.share_snapshot` is still live, else tombstone |
| 5 | Recruiter in search | profile summary + `evidence.share_summary` items | `search.discoverable` live; `evidence.share_summary` live for summary items; candidate not restricted (BR-T069); org not on candidate blocklist | Allow summary |
| 6 | Recruiter in search | evidence artefact content | `evidence.share_artefact` live for that org (per-employer grant; `target_id` NULL or equal to the item) | Allow; else Deny |
| 7 | Recruiter | contact details | `profile.share_contact` live for that org, or accepted conversation (DT-08) | Allow; else Deny |
| 8 | Org admin | member-recruiter activity | within org | Allow metadata only (never candidate artefacts unless on job team) |
| 9 | HM not on job team | application | — | Deny |
| 10 | Faculty / institution admin | learner data | learner in own cohort and k-rules of BR-T100 satisfied | Allow aggregate or issued-credential records only |
| 10a | Institution admin (alumni) | learner outcome fields | learner graduated; `alumni.share_outcomes` live for that institution | Allow only the fields in `field_set`; else Deny (after graduation individual-level access otherwise ends, SPEC-G5 section 3.7) |
| 11 | Faculty | applications, saved jobs, messages | — | Deny (BR-T105) |
| 12 | Referee (token) | the single request prompt | token valid, unused | Allow request text only (claim title, employer, dates, candidate name) |
| 13 | Moderator | content under a case | case open and flagged target | Allow (case-scoped) |
| 14 | Support | any personal data | active support grant ≤ 4 h for that subject (BR-T041/T042) | Allow, audited |
| 15 | Auditor | audit and aggregate | role ROLE-AUD | Allow read-only |
| 16 | * | * | none of the above | **Deny** (INV-T01) |

Revocation: when a scope is revoked (or its `expires_at` passes), rows 5–7 and 10a flip to Deny on the first read after the revoking transaction commits (read-time check, no consent cache; CSC section 6, BR-T063); row 4 keeps the snapshot but redacts revoked live items. Search-index removal follows within the BR-T063 limit but never gates visibility.

## DT-02 Entitlements (derived; hit policy U)

### DT-02a Subscription state → entitlement posture

| Subscription state | Posture | Notes |
|---|---|---|
| none / incomplete / incomplete_expired / canceled / unpaid | Free tier | data retained |
| active | Plan entitlements in full | — |
| canceling | Plan entitlements until period end, then Free | banner to owner |
| past_due, within {7}-day grace | Plan entitlements in full | dunning notices |
| past_due, after grace | Degraded: paid features read-only, no new publishes or outreach | never delete |

### DT-02b Gates (plan names/prices **[OPEN-05]**)

| Gate | Free candidate | Candidate premium | Employer (any paid plan) | Free org | Institution licence | On denial |
|---|---|---|---|---|---|---|
| Profile, evidence, apply, message replies | Yes | Yes | n/a | n/a | n/a | never denied (BR-T091) |
| Extra résumé variants (>1) | No | Yes | n/a | n/a | n/a | upgrade prompt |
| AI assist quota | 0 paid inference (deterministic helpers only) | {N}/month | {N}/seat/month | 0 | {N}/seat | quota message (BR-T111) |
| Advanced candidate analytics | No | Yes | n/a | n/a | n/a | upgrade prompt |
| Publish job (slot) | n/a | n/a | up to plan slots | 1 slot (limited org) | n/a | `entitlement_exhausted` |
| Verified-search quota | n/a | n/a | {N}/month | 0 | n/a | quota message |
| Outreach quota | n/a | n/a | {N}/seat/month | 0 | n/a | quota message |
| Seats | n/a | n/a | per plan | 1 | per licence | unassign first |
| Cohort tools | n/a | n/a | n/a | n/a | Yes | contact sales |
| Interview scheduling, scorecards | n/a | n/a | Yes | basic only | n/a | upgrade prompt |

Posture overrides (degraded, grace) apply on top. **Never inputs:** a plan or payment never changes who ranks where (INV-T19).

## DT-03 Matching score input allowlist (hit policy U per input)

| Input | Status | Role | Rationale |
|---|---|---|---|
| Canonical skills required by job vs candidate skill confidence | **Allowed** | scored | Core signal |
| Evidence rung per supporting item | **Allowed** | scored (weights shown) | Verified over claimed |
| Evidence recency (decay) | **Allowed** | scored | Skills age |
| Verified relevant experience duration (from verified work history; capped) | **Allowed** | scored | Capped to limit age proxy |
| Candidate-stated work mode / location preference vs job | **Allowed** | eligibility filter, shown | Candidate-controlled |
| Availability date | **Allowed** | filter | Candidate-controlled |
| Languages required by job | **Allowed** | scored if job lists them | Explicit requirement |
| Salary expectation vs pay range | **Candidate-side only** | candidate sees overlap; **not** shown to recruiters, **not** scored | Prevents suppression |
| Work authorisation (user-declared) | **Filter only** | hard eligibility if job states it; not scored | Legal sensitivity [OPEN-08] |
| Education level | **Conditional** | only if job lists a stated minimum; displayed as requirement match, low fixed weight | Proxy risk |
| Age, date of birth, graduation year | **Prohibited** | — | Protected attribute / proxy |
| Gender, pronouns, name, photo | **Prohibited** | — | Protected / proxy |
| Ethnicity, religion, disability, marital status, nationality | **Prohibited** | — | Protected |
| School or employer prestige/brand | **Prohibited** | — | Proxy |
| Employment gaps | **Prohibited** | — | Proxy |
| Plan, payment, employer spend, promotion | **Prohibited** | — | INV-T19 |
| Engagement behaviour (views, logins, response speed) | **Prohibited** | — | Opaque, proxy |
| Previous rejections / other employers' decisions | **Prohibited** | — | Contagion |
| Device, IP, network, time zone | **Prohibited** | — | Proxy |
| AI memory, free-text sentiment | **Prohibited** | — | INV-T08 |

Any new input requires an ADR and a fairness review (FEAT-11-09); the validator rejects scorer configs containing a non-allowlisted input.

## DT-04 Referee outcome → effects (hit policy F)

Inputs: `outcome`, referee-quality checks (`distinct` = BR-T018; `flagged` = FEAT-06-09 signal), prior rung.

| # | Outcome | Quality | Effect on claim/evidence | Candidate notice | Follow-up |
|---|---|---|---|---|---|
| 1 | confirm | distinct, not flagged | adds valid peer attestation ⇒ rung to ≥ `peer_attested` | "Confirmed by a referee" | none |
| 2 | confirm | flagged (collusion/same cluster) | recorded **not counted**; case opened for human review | neutral "under review" | human decides (INV-T20) |
| 3 | confirm | not distinct (BR-T018) | rejected at submit | n/a | referee shown error |
| 4 | dispute with `reason=dates_differ` and difference ≤ 3 months (must precede row 5 under hit policy F) | distinct, not flagged | no rung change, no recruiter-visible flag, no case | "Your referee suggests different dates" (candidate may correct the claim) | SPEC-04 §3.3 |
| 4a | any other dispute | * | no automatic downgrade; claim marked `disputed` for recruiters only after human review (BR-T021) | notice + 7-day response window | FEAT-06-05 case |
| 5 | decline | * | no effect | "Referee declined" (no reason shown) | candidate may add another referee |
| 6 | unknown_candidate | * | no effect; counts toward referee-quality heuristic only | "Referee did not recognise the request" | candidate may fix details |
| 7 | (expired) | n/a | no effect | "Request expired" | re-request |
| 8 | (bounced) | n/a | no effect | "Email undeliverable" | fix address |

## DT-05 Application submit pre-checks (hit policy F; idempotency first)

| # | Condition | Result |
|---|---|---|
| 1 | `Idempotency-Key` seen with same payload | replay stored response (`200`/`201` same body) |
| 2 | `Idempotency-Key` seen with different payload | `422 idempotency_conflict` |
| 3 | Account not `active` | `403` |
| 4 | Job not `published` | `409 job_not_open` (INV-T44) |
| 5 | Non-terminal application exists for (candidate, job) ≠ this draft | `409 already_applied` with link (BR-T001) |
| 5a | Previous application for (candidate, job) is `withdrawn` and less than {24 h} have passed since `withdrawn_at` | `409 reapply_cooldown` with the earliest allowed time (BR-T125). After the cooldown the submit proceeds and records `reapplied_from` |
| 6 | Required answers/fields missing | `422` with field list |
| 7 | Profile minimum not met (name, headline, ≥ 1 skill) | `422 profile_incomplete` (checklist) |
| 8 | Consent choice absent for optional evidence | `422 consent_required` (nothing shared by default) |
| 9 | Org blocked by candidate | `409 employer_blocked` |
| 10 | otherwise | `201`: draft → submitted, snapshot, outbox events |

## DT-06 Evidence rung computation (hit policy F, highest satisfied rung wins)

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


## DT-07 Notification routing (hit policy F)

| # | Category | Condition | Decision |
|---|---|---|---|
| 1 | any | address in suppression list (non-mandatory security excepted per below) | Suppress |
| 2 | mandatory transactional (security, verification, legal, billing) | — | Send now on required channels (ignore prefs, quiet hours) |
| 3 | time-critical (interview reminder, offer) | channel enabled | Send now (ignore quiet hours) |
| 4 | engagement/transactional-optional | category disabled | Suppress |
| 5 | engagement | within quiet hours | Defer to quiet-hours end |
| 6 | digest-eligible | user digest = daily/weekly | Defer into digest window |
| 7 | nudge | cap reached (BR-T087) | Suppress |
| 8 | marketing | no explicit opt-in | Suppress |
| 9 | otherwise | — | Send now on enabled channels (in-app always) |

## DT-08 Recruiter → candidate contact permission (hit policy F)

| # | Applied to this org's job? | Block either way | `outreach.recruiter_contact` live | Quota available | Cooldown active | Decision |
|---|---|---|---|---|---|---|
| 1 | * | yes | * | * | * | Deny `blocked` |
| 2 | yes (application active) | no | * | * | * | Allow thread (application-linked) |
| 3 | no | no | no | * | * | Deny `no_consent` |
| 4 | no | no | yes | no | * | Deny `quota_exceeded` |
| 5 | no | no | yes | yes | yes | Deny `cooldown` |
| 6 | no | no | yes | yes | no | Create **pending first-contact request**; consumes 1 quota on creation; candidate accepts/declines/blocks (BR-T082) |

## DT-09 Session refresh outcome (hit policy F)

| # | Presented refresh token | Family | Account | Result |
|---|---|---|---|---|
| 1 | unknown/malformed | * | * | `401`; no side effect |
| 2 | generation g (current) | active | active | rotate to g+1, new access token |
| 3 | generation g−1, within 5 s, successor unused | active | active | return the same successor (idempotent) |
| 4 | generation < g (stale), outside leeway or successor used | active | * | revoke family, notify, `401 reuse_detected` (BR-T050) |
| 5 | any | expired | * | `401 session_expired` |
| 6 | any | revoked | * | `401 session_revoked` |
| 7 | current | active | not `active` | revoke family, `403 account_state` |

## DT-10 Assessment submission handling (hit policy F)

| # | Mode | AI policy violated? | Runner available | Integrity flags | Result |
|---|---|---|---|---|---|
| 1 | any | yes (gateway block log shows attempt) | * | * | Attempt continues; violation logged; **review case opened, no auto-void** (BR-T029) |
| 2 | auto-graded (MCQ etc.) | no | n/a | none | `grading` → `passed`/`failed`; pass mints `authority_verified` evidence |
| 3 | auto-graded | no | n/a | flagged | graded normally; result held `under_review` before minting until human clears |
| 4 | code | no | yes | none | runner grading → pass/fail; pass mints evidence |
| 5 | code | no | no (not shipped or outage) | * | `unverified`, no evidence; re-grade when runner exists (≤ 30 d) |
| 6 | manual-graded | no | n/a | none | `grading` by human; evidence minted on pass by instructor sign-off |

## DT-11 Erasure: data class → action (hit policy U) **[OPEN-08]**

| Data class | Action |
|---|---|
| Profile, portfolio, résumés, preferences | Delete |
| Evidence items and artefacts, attestation records authored by the subject | Delete; attestations about **others'** evidence: anonymise attester |
| Applications as candidate | Delete personal fields; employer-side hiring-record minimum retained per org policy and [OPEN-08], with subject identifiers pseudonymised in mutable rows (append-only `stage_transition` is untouched, see the history row below) |
| Messages | Delete subject's content; counterpart's copy shows "deleted user" |
| Search index, caches, recommendations | Delete |
| Analytics events | Delete or irreversibly aggregate |
| Audit log entries, consent ledger rows and stage-transition history about the subject | Retain unchanged: they hold only an opaque `subject_ref`; delete the `subject_identity_map` row (and per-subject key) so the refs no longer resolve; never UPDATE [OPEN-08 for how long the skeletons may be kept] |
| Billing records (invoices) | Retain as legally required [OPEN-08] |
| Referee responses about the subject | Delete content; keep counter for abuse stats without identity |
| Backups | Age out ≤ {35} days; restore procedures re-apply erasure log |

## DT-12 Job publish gate (hit policy F)

| # | Condition | Outcome |
|---|---|---|
| 1 | Actor lacks `job:publish` for org | `403` |
| 2 | Org unverified and already has 1 live job | `409 org_verification_required` | <!-- also applies after SM-ORG verification is revoked (BR-T123) -->
| 3 | Validation fails (BR-T035) | `422` with field list |
| 4 | No free slot after lock | `409 entitlement_exhausted` |
| 5 | Pre-publish check flags scam/discriminatory pattern | → `pending_review` (human moderator) |
| 6 | Org policy requires approver and actor ≠ approver | → `pending_review` (approver) |
| 7 | `publish_at` in future | → `scheduled` |
| 8 | otherwise | → `published` |

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

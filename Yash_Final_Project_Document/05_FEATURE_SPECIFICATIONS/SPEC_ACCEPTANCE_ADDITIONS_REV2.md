# Feature Specifications, Acceptance Additions (SPEC REV2)

Doc ID: SPEC-00-R2 · Owner: Product Director (Functional Spec) · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-12, REVW-17 (P0 feature gaps), REVW-18, REVW-20, REVW-21, REVW-22, REVW-26, REVW-27, REVW-29, REVW-38, REVW-43 (acceptance and spec-text parts) · Relates: SPEC-00 and SPEC-G1 to G5, MICRO-FEAT, QA-AC, BR-REG-R2, INV-REG-R2, SM-00-R2, DT-00-R2

**Relationship (no original file was edited).** This file **extends** the long-form specifications `SPEC_G1…G5` and `MICRO_FEATURE_SPECS.md` with acceptance criteria and with spec-text deltas. It supersedes nothing. The spec-text deltas in section 3 name the original passages they would replace **once accepted**. Criteria are numbered so they cannot collide with registered ones: for features that already have criteria the new numbers start at 51; for features with none they start at 01. The test catalogue is owned by QA; this file proposes no TEST ids. Governance should link this file from `05_FEATURE_SPECIFICATIONS/README.md` (index) and `00_CONTROL_CENTRE/MASTER_INDEX.md`.

This file registers **95 new criteria** (counted by script over rows that begin `| AC-DD-NN-NN |`; no id collides with a criterion registered in `05_*` or `16_*`). All content **[TARGET]**; nothing here claims anything is built. Table form is that of the long-form specs: `| AC id | Given | When | Then | Category |`.

## 1. Criteria for review-resolution rules

### 1.1 Evidence integrity (REVW-12, REVW-22, REVW-20 archive)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-05-04-51 | a learner completes a first-party course with a platform rule | the issuer mints the completion | one item at `authority_verified` with `issuer_class = platform`; the badge shows the class | Happy |
| AC-05-04-52 | any client sends an `issuerClass` or `rung` field when creating or editing evidence | POST/PATCH | field ignored or `422`; the stored class equals the class of the issuing record (INV-T46) | Security |
| AC-05-04-53 | instructor account equals the learner account | instructor signs off | `422 self_signoff`; nothing minted; enrolment unchanged (INV-T47) | Negative |
| AC-05-04-54 | instructor and learner share a device cluster or payment instrument | instructor signs off | sign-off held for human review; enrolment stays `completion_pending_signoff`; no evidence; no automatic rejection (DT-14 row 2) | Negative/Security |
| AC-05-04-55 | an item whose only authority record has `issuer_class = instructor` | rendered; filtered by "platform verified"; scored for matching | badge "Instructor attested"; excluded from the platform-verified filter; match explanation shows the lower class weight | Honesty |
| AC-05-04-56 | an `instructor`-class record is revoked by its issuer or a moderator | confirm | rung recomputes (falls to the next supported rung); holder notified within 24 h with appeal path; audited | Happy |
| AC-08-04-51 | an approved instructor with a completed conflict-of-interest declaration signs off a learner other than themselves with no shared signal | sign-off | accepted; evidence minted at `authority_verified` with class `instructor` (DT-14 row 5) | Happy |
| AC-06-01-51 | a work claim at a domain equal to a verified `org_domain` of a verified organization | candidate enters the code correctly | rung `artifact_backed`; badge "Mailbox verified" (`domain_binding = bound`) | Happy |
| AC-06-01-52 | a work claim at a domain the candidate owns or controls that is not bound to a verified organization | code entered correctly | rung stays `claimed`; badge "Mailbox verified, employer not confirmed"; the popover says the employer is not confirmed | Honesty |
| AC-06-01-53 | a `bound` proof exists and its organization's verification is revoked | revocation commits | the provenance record is invalidated; the item's rung recomputes; audited (INV-T48) | Happy |
| AC-05-01-51 | an active evidence item | user chooses Archive then Undo within 8 s | no withdraw request is sent; item still `active` | Happy |
| AC-05-01-52 | an active evidence item | user chooses Archive and does not undo | after 8 s the item is `withdrawn` (terminal); "Create again from this" creates a new `draft` with `restored_from` | Happy |

### 1.2 Organization lifecycle (REVW-20)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-02-01-01 | a new organization (`verification_state = unverified`) | owner publishes a first valid job | allowed (pending-limited mode, 1 live job) | Happy |
| AC-02-01-02 | the same organization with 1 live job | owner publishes a second job | `409 org_verification_required` | Negative |
| AC-02-01-03 | owner submits a domain with a correct DNS TXT proof | review completes | `pending → verified`; `org_domain` usable for employer-domain binding; audited | Happy |
| AC-02-01-04 | a verified organization with 3 live jobs | a reviewer revokes verification | in one transaction the oldest live job stays and two move to `paused` (reason `org_unverified`); applications on paused jobs continue; owner notified (BR-T123) | Happy |
| AC-02-01-05 | an automated check fails a domain re-check | the system runs | a review task opens; `verification_state` does not change by itself (U6) | Negative |

### 1.3 Account, age and erasure (REVW-21, REVW-29)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-01-01-51 | a registration without the minimum-age attestation | submit | `422 age_attestation_required`; no account row | Negative |
| AC-01-01-52 | the person declares an age below the minimum | submit | refused with a neutral message; no account created; only a hashed rate-limit signal kept for 24 h | Security |
| AC-01-01-53 | any account with status `active` | database constraint check | `min_age_attested_at` and the policy version are present (INV-T50) | Invariant |
| AC-19-07-01 | one moderator decides to suspend an account | submits without a second approver | rejected `second_person_required`; with the documented emergency exception the action applies and is reviewed within 24 h | Negative |
| AC-22-03-51 | a `suspended` account with an open moderation case | the holder requests erasure | request acknowledged and parked `on_hold` (reason `moderation_case_open`); the account stays `suspended`; the requester is told a hold applies (INV-T49) | Negative |
| AC-22-03-52 | the case in AC-22-03-51 becomes `closed` | the hold clears | the request resumes; cooling-off starts | Happy |

### 1.4 Applications, referees, matching view (REVW-27, REVW-38, REVW-43, REVW-11)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-10-03-51 | an application withdrawn 2 h ago, cooldown 24 h | the candidate re-applies | `409 reapply_cooldown` with the earliest allowed time | Negative |
| AC-10-03-52 | a withdrawn application, cooldown passed, job `published` | the candidate re-applies | a new application with `reapplied_from`; the hiring team sees the link and withdrawal date; a new evidence snapshot is taken | Happy |
| AC-10-03-53 | an application ended `rejected` | the candidate tries to re-apply | refused; only a recruiter invitation creates a new linked application | Negative |
| AC-06-10-51 | a manual reminder was sent on day 3 | day 4 arrives | the system reminder is deferred until 3 days after the manual one; the total never exceeds 2 | Happy |
| AC-06-10-52 | two reminders sent in any mix of system and manual | the candidate presses "Send reminder" | disabled with "2 of 2 reminders used"; the API returns `409 reminder_cap_reached` | Negative |
| AC-11-10-01 | a job with 12 applicants of mixed scores | a recruiter opens "Suggested order" | 12 rows are returned; none hidden; the view is labelled "Suggested order" and advisory (INV-T52) | Honesty |
| AC-11-10-02 | the UI and API surface | text and route lint | the advisory view is never named "shortlist" | Honesty |
| AC-11-09-01 | a tenant with no recorded fairness review | a recruiter requests score-ranked results | the feature flag `matching.recruiter_ranking` is off; the plain filter and the candidate-facing explanation still work (BR-T126) | Negative |
| AC-11-09-02 | ROLE-AUD has recorded the baseline review | the flag is switched on | the change is audited with the review reference | Happy |

### 1.5 Sessions, idempotency, retention (REVW-18, REVW-14, REVW-26, entitlement stub)

| AC | Given | When | Then | Category |
|---|---|---|---|---|
| AC-01-04-51 | a refresh token idle for more than CONST-S02 | refresh | `401 session_expired` (constants table in BR-REG-R2) | Negative |
| AC-01-04-52 | a sensitive action and a re-auth older than CONST-S06 (5 min) | the action is submitted | step-up required | Security |
| AC-01-04-53 | a refresh token presented again within CONST-S07 (5 s) with its successor unused | refresh | the same successor is returned; presented outside the leeway the family is revoked | Security |
| AC-24-03-51 | a queued offline write with an `Idempotency-Key` created on day 0 | replayed on day 13 | the stored response is returned, no second effect | Idempotency |
| AC-24-03-52 | a route with a natural key | the same logical write arrives twice after day 15 | the second is deduplicated by the natural key | Idempotency |
| AC-10-14-51 | an application whose consent window ended 31 days ago | the retention job has run | the organization's copy holds no snapshot content, answers or contact details; at most the minimal record with an opaque `subject_ref` remains, and only if the OPEN-08 policy keeps it (BR-T122) | Privacy |
| AC-16-04-51 | a free organization in Phase 1 | an admin compensation grant is created | the grant needs reason, approver and expiry; it is audited; a client or redirect cannot create it (BR-T090) | Security |
| AC-02-03-51 | a principal with role `viewer` in an organization | the principal opens candidate content | denied; metadata only where DT-01 allows | Security |
| AC-02-03-52 | an `org_admin` in an organization | the admin files a data-rights request for an employee | refused; the requester must be the subject (SM-DSR t1) | Security |

## 2. Criteria for P0 features that had none (REVW-17)

Method and list: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_PHASE_RECONCILIATION_REV2.md` section 5. Each feature below was a P0 feature in Phase 0 or 1 (or a P0 Phase 2 feature) with no criterion of its own.

| AC | Feature | Given | When | Then | Category |
|---|---|---|---|---|---|
| AC-01-09-01 | FEAT-01-09 | an authenticated principal with several scoped grants | `GET /me/capabilities` for one scope | returns only that scope's evaluated capability set | Happy |
| AC-01-09-02 | FEAT-01-09 | a capability absent from the response | the client calls the action directly | `403`; the capability set is a hint, never the enforcement (INV-T01) | Security |
| AC-01-09-03 | FEAT-01-09 | a grant changes | the next request is made | the response reflects the new set (no stale cache) | Happy |
| AC-02-07-01 | FEAT-02-07 | a principal of organization A | requests any tenant-scoped route with an id of organization B | `404` or `403`; the canary suite fails the build if any route returns B's data | Security |
| AC-02-07-02 | FEAT-02-07 | any tenant table | lint | it has `org_id` and a forced row-level security policy | Invariant |
| AC-02-07-03 | FEAT-02-07 | the application database role | role check | no `BYPASSRLS` | Invariant |
| AC-04-01-01 | FEAT-04-01 | the skills read API | list | canonical skills are returned with a taxonomy version | Happy |
| AC-04-01-02 | FEAT-04-01 | an alias of a skill | resolved | resolves to the canonical skill | Happy |
| AC-04-01-03 | FEAT-04-01 | two skills are merged | an old id is read | it still resolves (redirect) and a merge event is emitted | Happy |
| AC-04-02-01 | FEAT-04-02 | evidence, a job or a course | tagged with a canonical skill | accepted | Happy |
| AC-04-02-02 | FEAT-04-02 | a free-text skill | tagged | `422` (BR-T006) | Negative |
| AC-04-02-03 | FEAT-04-02 | any entity type | tagged | the same skill ids and API are used | Happy |
| AC-08-01-01 | FEAT-08-01 | the course catalogue | filtered by skill and level | only `published` courses are returned | Happy |
| AC-08-01-02 | FEAT-08-01 | a course with prerequisites | opened by a learner who has not met them | unmet prerequisites are shown with links | Happy |
| AC-15-01-01 | FEAT-15-01 | in-app notifications exist | the notification centre opens | newest first, with an unread count | Happy |
| AC-15-01-02 | FEAT-15-01 | an unread notification | marked read twice | idempotent | Idempotency |
| AC-15-03-01 | FEAT-15-03 | the email provider is down | a notification is raised | the in-app item exists; the `email.send` job retries (SM-BGJOB t4); no duplicate email on recovery | Failure |
| AC-15-03-02 | FEAT-15-03 | a mandatory security email during quiet hours | routed | sent now (DT-07 row 2) | Happy |
| AC-15-06-01 | FEAT-15-06 | a hard bounce | the provider webhook arrives | delivery `bounced`; the address is suppressed | Happy |
| AC-15-06-02 | FEAT-15-06 | a transient provider error | the job retries | delivery shows `failed_retry` and mirrors the job, not a second retry schedule | Happy |
| AC-15-07-01 | FEAT-15-07 | an engagement email | the recipient uses one-click unsubscribe | that category is suppressed | Happy |
| AC-15-07-02 | FEAT-15-07 | a mandatory transactional category | unsubscribe attempted | not suppressed; the page explains why | Negative |
| AC-15-07-03 | FEAT-15-07 | an address on the suppression list | a send is attempted | not sent (SM-NOTIFY t1) | Negative |
| AC-20-01-01 | FEAT-20-01 | a customer principal | opens a back-office route | `403`; back-office code is not served to the principal (authenticated edge rule) | Security |
| AC-20-01-02 | FEAT-20-01 | a staff principal without MFA | opens the console | denied until MFA is enrolled (BR-T044) | Security |
| AC-20-01-03 | FEAT-20-01 | a role grant changes | saved | audited with actor and reason | Happy |
| AC-20-03-01 | FEAT-20-03 | the audit viewer | a record is opened | actor, action, resource, reason and request id are shown | Happy |
| AC-20-03-02 | FEAT-20-03 | an audit export | requested | re-auth is required and the export is itself audited | Security |
| AC-21-01-01 | FEAT-21-01 | a user without `analytics.product` consent | uses the product | no product-analytics event is captured | Privacy |
| AC-21-01-02 | FEAT-21-01 | consent is withdrawn | the next event would fire | it is not captured | Privacy |
| AC-22-06-01 | FEAT-22-06 | a user accepts policy version v | stored | version, timestamp and account are recorded | Happy |
| AC-22-06-02 | FEAT-22-06 | policy version v+1 is published | the user's next sensitive action | acceptance of v+1 is required first | Happy |
| AC-24-01-01 | FEAT-24-01 | a state change commits | the process is killed before dispatch | the outbox row survives and the event is delivered after restart | Failure |
| AC-24-01-02 | FEAT-24-01 | an event is delivered twice | the consumer handles it | one effect (consumer dedupe on `event_id`) | Idempotency |
| AC-24-01-03 | FEAT-24-01 | the dispatcher restarts | mid-batch | no event is lost | Failure |
| AC-24-02-01 | FEAT-24-02 | two workers race for one job | claim | exactly one wins (`SKIP LOCKED`) | Concurrency |
| AC-24-02-02 | FEAT-24-02 | a stale worker finishes after its lease expired | complete | the fenced write affects zero rows and the result is discarded | Concurrency |
| AC-24-02-03 | FEAT-24-02 | jobs of kinds `email.send`, `ai.*` and a permanent error | failures repeat | `email.send` is attempted up to 12 times, `ai.*` 3 times, a permanent error goes straight to `dead`; a dead job of a protected kind raises an alert (SM-BGJOB t4, t7) | Failure |
| AC-24-04-01 | FEAT-24-04 | a signed download URL | used after expiry | `403` | Security |
| AC-24-04-02 | FEAT-24-04 | a non-image file | downloaded | forced as attachment (BR-T116) | Security |
| AC-24-05-01 | FEAT-24-05 | a request that passes shell, API and worker | traced | one trace id spans all three; logs redact secrets and direct identifiers | Observability |
| AC-24-08-01 | FEAT-24-08 | requests over the limit | sent | `429` with `Retry-After`; auth endpoints are stricter (BR-T115) | Security |
| AC-24-09-01 | FEAT-24-09 | two worker replicas | a scheduled tick fires | it runs once (unique kind and tick) | Concurrency |
| AC-24-09-02 | FEAT-24-09 | a time-driven transition is due | the job runs | the guard is re-checked at execution time (U7) | Happy |
| AC-24-11-01 | FEAT-24-11 | a migration that drops or rewrites a column in one step | lint | rejected unless it follows expand/contract with a rollback note | Invariant |
| AC-17-01-01 | FEAT-17-01 | code that imports a model provider directly | CI lint | the build fails (BR-T110) | Invariant |
| AC-17-01-02 | FEAT-17-01 | the Phase 0 gateway stub | a call is made | denied by default; no provider is contacted | Security |
| AC-17-02-01 | FEAT-17-02 | a free-tier user | requests AI assistance | no paid inference; the deterministic fallback runs (BR-T111) | Happy |
| AC-17-03-01 | FEAT-17-03 | a principal bound to `AI_PROHIBITED` | any gateway call | denied regardless of caller (BR-T025) | Security |
| AC-17-03-02 | FEAT-17-03 | a denial | logged | the log holds the policy and principal, not the prompt content | Privacy |
| AC-07-01-01 | FEAT-07-01 (Phase 2) | the assessment catalogue | an item is opened | mode badge and AI-policy label are shown | Happy |
| AC-16-01-01 | FEAT-16-01 (Phase 2) | a plan with no price set | the catalogue renders | no price is shown (prices are OPEN-05) | Honesty |
| AC-19-02-01 | FEAT-19-02 (Phase 2) | a report and a system flag on one target | the queue is built | one case (dedupe by target and category); automation cannot move it to `actioned` | Happy |
| AC-19-08-01 | FEAT-19-08 (Phase 2) | a reporter files more than 20 reports in a day | files one more | `429` (BR-T048) | Negative |

## 3. Spec-text deltas (passages replaced once accepted)

| Original passage | Replacement meaning |
|---|---|
| SPEC-G2 badge line (about L203): "`Mailbox verified` (artifact-backed via domain proof) ... `Employer confirmed` (authority; Phase 3 via verified org)" | Badges: "Not verified"; "Mailbox verified" only for a `bound` domain; "Mailbox verified, employer not confirmed" for an `unbound` domain (rung stays `claimed`); "Confirmed by referee"; for authority, the class is shown: "Platform verified", "Institution verified", "Employer confirmed", "Instructor attested" (DT-06 REV2) |
| SPEC-G2 actors table (about L20): ROLE-INST and issuers "mint `authority_verified` items" | Issuers mint authority records with a mandatory `issuer_class`; instructor-class records follow BR-T119 and DT-14 |
| SPEC-G3 actors and completion rule (about L189, L212 to L214): `instructorSignoff`, "rung `authority_verified` when ... instructor-signed-off" | Instructor sign-off mints `authority_verified` with class `instructor` only after DT-14; it never counts as platform-verified; revocable |
| SPEC-G3 offline lines (L76, L209, L256) | Assessment answers are online-only; lesson progress is a queued write; downloadable video is out of Phases 1 and 2 (REVW-15 decision) |
| SPEC-G1 onboarding (registration step, micro-feature FEAT-01-01.3 "age/guardian gate [OPEN-09]") | Registration requires the minimum-age attestation of BR-T120 (value [OPEN-counsel]); no account is created below the minimum |
| SPEC-G4 FEAT-10-03 "Withdraw & re-apply policy" and the application states paragraph | Withdrawn is terminal; the candidate may submit a new linked application after the cooldown (BR-T125, SM-APPLICATION t12) |
| SPEC-G4 FEAT-11-10 "Suggested shortlist per job (human-gated)" (also PCAP-01 title) | "Suggested order"; the view returns all applicants (INV-T52) |
| SPEC-G5 section 3.2 CSV columns and BR-T106 | The roster CSV may carry the attestation flag or date of birth only if counsel requires it (BR-T120); rows flagged under-age stay blocked |
| USER_JOURNEYS about line 115: "1st reminder after 3 days (ACT-VER-03)" | "Reminders: the system sends on day 4 and day 9; you can also send one yourself 3 days after the last send; two in total" (BR-T121) |
| ACT-VER-03 availability (`07_UI_UX`) | "≥ 3 days since last send of any kind and fewer than 2 reminders in total" (DT-13) |
| SPEC-G5 retention paragraph for applications; DATA-021 (24 months) | Identifiable content follows BR-T122; the 24-month figure applies only to the minimal record if OPEN-08 allows it |

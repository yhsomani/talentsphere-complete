# Business Rules Registry, Revision 2 (BR-REG REV2)

Doc ID: BR-REG-R2 · Owner: Business Analyst Lead + Product Director · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-12, 14 (BR part), 18, 21, 22, 26, 27, 29, 38, 43 and the rule parts of REVW-10/11 · Relates: BR-REG (BR-T001…T117), SM-00-R2, INV-REG-R2, DT-00-R2, ADR-T14a, CSC

**Relationship (no original file was edited).** This file **supersedes, once accepted by governance**, the rows of `BUSINESS_RULES_REGISTRY.md` listed in section 1 (the rows are replaced as a whole) and **extends** it with BR-T118 to BR-T127 (section 2) and the constants table (section 3). All other rows of BR-REG stand. Until accepted, BR-REG v1.0 remains the text of record. New ids are appended after BR-T117; no id is reused or renumbered. Governance should link this file from `00_CONTROL_CENTRE/MASTER_INDEX.md` and `00_CONTROL_CENTRE/ID_REGISTRY.md`.

Conventions are those of BR-REG: all rules **[TARGET]**; `{braces}` are **[OPEN]** tunables; legal-duty rules are **[OPEN-08]** until counsel review; enforcement and verification vocabularies as in BR-REG. A rule with only `UI` enforcement is invalid (INV-T01).

## 1. Amended rows (full replacement text)

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification | Why |
|---|---|---|---|---|---|---|---|---|
| BR-T001 | Application | Candidate submits to a job | At most one **active** (non-terminal, incl. draft) application per (candidate, job) (seed) | After terminal state, a recruiter-invited reconsideration may create a new linked application (`reconsidered_from`). **After `withdrawn` only, the candidate may re-apply as a new linked application (`reapplied_from`) once the cooldown has passed (BR-T125)** | DB partial unique index + DOM | FEAT-10-02, FEAT-10-03 | IT concurrency, UT | REVW-27 |
| BR-T011 | Evidence | `authority_verified` rung | Only from issuer classes {platform, institution, employer_org, instructor} (BR-T118), each under its own independence rule (BR-T119 for instructor); instructor sign-off never counts as platform-verified | None | DOM | FEAT-05-04 | UT per issuer class | REVW-12 |
| BR-T017 | Verification | Work-history proof | Code goes only to an address on the claimed employer domain; free-mail domains rejected. The result is `bound` when the domain equals a verified `org_domain` of a verified organization, otherwise `unbound`. `bound`: rung `artifact_backed`, badge "Mailbox verified". `unbound`: rung stays `claimed`, badge "Mailbox verified, employer not confirmed". A later loss of binding invalidates the provenance record and recomputes the rung | Employer without own domain ⇒ referee route only | DOM | FEAT-06-01 | UT, IT | REVW-22 |
| BR-T004 | Referee | Reference requested | Expires 14 days after send; **at most 2 reminders per request in total, shared by system and manual reminders (BR-T121)** (seed) | None | SM-REFERENCE + WRK | FEAT-06-02, FEAT-06-10 | UT clock, IT | REVW-38 |
| BR-T022 | Referee | Reminders | System reminders due on day 4 and day 9 while unanswered, subject to the shared cap and 3-day spacing of BR-T121 | None | WRK | FEAT-06-10 | UT clock | REVW-38 |
| BR-T090 | Billing | Entitlement change | Derived only from subscription state via DT-02; redirects and clients cannot grant (INV-T17). **Phase 1 stub:** `deriveEntitlements()` returns the free-tier baseline plus audited admin compensation grants (reason, approver, expiry); job slots come from the free-org slot value and compensation (BR-T093); there is no checkout in Phase 1 | Admin comp with audit | DOM + POL | FEAT-16-04 | Webhook tests; stub entitlement matrix | REVW-11 |
| BR-T114 | Platform | Unsafe mutation | `Idempotency-Key` required **or the route declares a natural key**; retained 24 h; **routes that accept queued offline writes retain keys for the outbox TTL (14 d), and routes that cannot hold keys that long must use a natural key**; payment keys 7 d; replay returns stored response; same key with different payload ⇒ 422 | Webhooks (own dedupe) | LINT + DOM | FEAT-24-03 | Replay tests, retention test at day 13 and day 15 | REVW-14 (decision) |
| BR-T062 | Privacy | Candidate applies | Grants the job's hiring team application-scoped consent over the snapshot only, while the application is active and for {12 months} after terminal state [OPEN-08]; **identifiable data then follows BR-T122** | Candidate may withdraw earlier | DOM | FEAT-10-14, FEAT-22-01 | IT | REVW-26 |
| BR-T056 | Session | Lifetimes | **Values are held in the constants table of section 3 (CONST-S01 to S05); this row cites them** | "Remember me" per CONST-S04 | SM-SESSION | FEAT-01-04 | Clock tests | REVW-18 |
| BR-T057 | Identity | Sensitive action | Re-auth no older than CONST-S06 for: change email/password/passkey, deactivate, erase, download export, billing change | None | POL | FEAT-01-05, FEAT-22-02 | SEC | REVW-18 |
| BR-T050 | Session | Refresh token reuse detected | Revoke the whole token family (seed); the leeway is CONST-S07 | Leeway returns the same unused successor | SM-SESSION | FEAT-01-04 | Token reuse tests | REVW-18 |
| BR-T072 | Matching | Recruiter views applicants | Score is advisory; **the view is named "Suggested order", never "shortlist"**; it returns **every** applicant of the job (count equals applicant count, INV-T52); default order selectable, no hiding by score | None | POL | FEAT-11-10, FEAT-10-17 | UT; count assertion | REVW-43 |

## 2. New rules (appended after BR-T117)

New block: **T118–T127 review-resolution additions** (evidence integrity, age, retention, lifecycle, fairness gate).

| ID | Scope | Condition | Behavior | Exception | Enforcement | FEAT | Verification | Why |
|---|---|---|---|---|---|---|---|---|
| BR-T118 | Evidence | An authority provenance record is created | It carries a mandatory `issuer_class` ∈ {`platform`, `institution`, `employer_org`, `instructor`}, set server-side from the issuing record, never from client input. The UI always shows the class beside the badge. Matching weights differ by class (DT-03 note). An `instructor` record never satisfies a "platform-verified" predicate. All records are revocable by their issuer or a moderator (BR-T012) | None | DOM + DB NOT NULL/CHECK | FEAT-05-04, FEAT-05-02, FEAT-06-04 | UT per class; UI test for class label; PROP: class derived from issuer | REVW-12 |
| BR-T119 | Evidence / Learning | Instructor sign-off is recorded (`instructorSignoff`) | Valid only if (a) instructor account ≠ learner account; (b) no shared device, session cluster or payment-instrument signal between them; (c) the issuer independence check passes (instructor is an approved instructor with completed conflict-of-interest declaration, and the course is not authored solely for the learner); (d) the instructor has not signed off more than {N} completions for one learner cluster in {period}. A failed check does not reject: the sign-off is held for human review and the enrolment stays `completion_pending_signoff`. Onboarding declaration (COM-OPS) remains but is not the only control | Platform staff acting as `platform` issuer under BR-T118 | DOM + POL | FEAT-05-04, FEAT-08-04, FEAT-06-09 | UT; SEC: self-enrolment and alternate-account negative controls | REVW-12 |
| BR-T120 | Identity | Registration | The person must confirm they meet the minimum age of {minimum age: **[OPEN-counsel]**} before the account can leave `pending_verification`. Prefer an attestation (checkbox, timestamp and policy version stored as `min_age_attested_at`); a date of birth is collected only if counsel requires it [OPEN-08]. Below the minimum, no account is created and only a hashed rate-limit signal is kept for {24 h}. Age is never a matching input (DT-03). Institution rosters keep BR-T106 | None | DOM | FEAT-01-01 (micro-feature .3), FEAT-01-13 | UT; SEC: bypass attempts | REVW-29 |
| BR-T121 | Referee | Reminders for one reference request | One cap of 2 reminders per request, counted across system and manual senders. A manual reminder needs at least 3 days since the last send of any kind. A system reminder that is due (day 4, day 9) but falls less than 3 days after the last send is deferred, not dropped. Reminders only while `sent` or `opened` | None | DOM + WRK | FEAT-06-10, FEAT-06-02 | UT clock; IT with mixed manual and system sequence | REVW-38 |
| BR-T122 | Privacy | Application-scoped consent window ends (BR-T062) | The organization's identifiable copy of the candidate's application data (snapshot content, answers, notes about the candidate, contact details) is deleted or pseudonymised within {30 d}. A minimal hiring record (job id, stage history, reason codes, dates, opaque `subject_ref`) may remain until {24 months} after the terminal state only if counsel confirms a legal basis and the org policy requires it **[OPEN-08]**; DATA-021's 24-month retention applies to that minimal record only, never to identifiable content | Legal hold (SM-DSR `on_hold`) | WRK + DOM | FEAT-10-14, FEAT-22-01, FEAT-22-07 | IT clock at consent end plus {30 d}; scan for identifiers | REVW-26 |
| BR-T123 | Organization | Verification is revoked (`verified → revoked`, SM-ORG v5) | In one transaction: the oldest live job stays; every other `published` or `scheduled` job moves to `paused` (reason `org_unverified`); new publishes beyond 1 are refused (DT-12 row 2); applications on paused jobs continue; provenance with a `bound` domain of that org is invalidated and rungs recomputed (BR-T005); the public "verified" mark is removed; owner notified with the reason category | None | DOM + SM + WRK | FEAT-02-01, FEAT-09-02 | IT: org with 3 live jobs un-verified | REVW-20 |
| BR-T124 | Privacy / Safety | Erasure is requested by an account that is `suspended` or is the subject of an open moderation case | The request is accepted and acknowledged but parked `on_hold` (reason `moderation_case_open`, SM-DSR t7); the account does not enter `pending_erasure`; cooling-off starts after the case is `closed`. Append-only audit and consent history is unaffected either way (BR-T065). The 30-day clock treatment is [OPEN-08] | Legal duty requiring immediate erasure [OPEN-08] | SM-DSR + SM-ACCOUNT | FEAT-22-03, FEAT-19-07 | IT: suspended account requests erasure | REVW-21 |
| BR-T125 | Application | Candidate re-applies after withdrawing | A new application may be created for the same job when the earlier one is `withdrawn`, at least {24 h} (**[OPEN]**) after `withdrawn_at`, the job is `published`, and BR-T001 holds. It carries `reapplied_from`; the hiring team sees the link; the earlier snapshot is not reused. Applications ended by `rejected`, `hired` or `offer_declined` do not qualify. Closes OPEN-B20 | None | DOM + DB | FEAT-10-03, FEAT-10-02 | IT: cooldown `409 reapply_cooldown`, link visible, new snapshot | REVW-27 |
| BR-T126 | Matching | Recruiter-facing ranking or recommendation by match score (FEAT-11-04, 11-05 ranking, 11-10) or any public matching surface | May not be enabled for a tenant until (1) the baseline adverse-impact audit (BR-T077, WP-FAIRNESS-AUDIT) has run and ROLE-AUD has recorded a review, and (2) the kill switch `matching.recruiter_ranking` exists. The candidate-facing explanation (FEAT-11-02) and plain job search are not gated | None | DOM + feature flag + LINT | FEAT-11-09, FEAT-11-10 | Process test; flag default-off test | REVW-11 |
| BR-T127 | Messaging | Account suspension, org suspension or revocation of org verification while conversations are open | Existing application threads stay readable by participants; new first-contact requests from the sanctioned org are refused; reports remain possible | Safety escalation by moderator | POL | FEAT-13-01, FEAT-13-05 | IT | REVW-20 (effects) |

Counts after acceptance: **118 rules** (108 in BR-REG v1.0 plus 10 here: BR-T118 to BR-T127), counted by the script described in section 4. Rows replaced in section 1 do not change the count.

## 3. Constants table: sessions, credentials and retention windows (REVW-18)

This table is the **single source** for these values. Other documents cite `CONST-Sxx`; where they differ (SEC-02 section 2.3: refresh idle 30 d / absolute 90 d and step-up 10 min; ACTION_REGISTRY: step-up 15 min; PWA-01 section 10 and OPEN-FE-08/OPEN-FE-10: "not fixed", grace "≤ 10 s") they are superseded once this file is accepted, and the open items OPEN-FE-08 and OPEN-FE-10 close. The backend owner updates SEC-02 to cite this table. Values in `{braces}` are tunables that the owner may change here without changing any rule.

| ID | Constant | Value | Source rule | Notes |
|---|---|---|---|---|
| CONST-S01 | Access token lifetime | 15 min | BR-T056 | |
| CONST-S02 | Refresh token idle timeout | {14 d} | BR-T056 | SEC-02 said 30 d |
| CONST-S03 | Refresh token absolute lifetime | {30 d} | BR-T056 | SEC-02 said 90 d |
| CONST-S04 | "Remember me" absolute lifetime | {90 d} | BR-T056 | |
| CONST-S05 | Privileged roles (moderator, support, admin, auditor): idle / absolute | 30 min / 8 h | BR-T044 | MFA mandatory |
| CONST-S06 | Step-up (re-auth) freshness | 5 min | BR-T057 | SEC-02 said 10 min, ACTION_REGISTRY 15 min |
| CONST-S07 | Refresh reuse leeway (same unused successor returned) | 5 s | BR-T050, INV-T33 | PWA-01 "≤ 10 s" retired |
| CONST-S08 | Email verification code TTL / attempts | 15 min / 5 | BR-T053 | |
| CONST-S09 | Password reset token TTL | 30 min | BR-T054 | |
| CONST-S10 | Referee token TTL | 14 d | BR-T020 | |
| CONST-S11 | Export download link TTL | 7 d | BR-T064 | |
| CONST-S12 | Idempotency key retention: default / queued-op routes / payment | 24 h / 14 d (outbox TTL) / 7 d | BR-T114 | |
| CONST-S13 | Consent revocation effect | first read after the revoking commit; no consent cache | BR-T063, INV-T29 | 60 s is a test timeout only |
| CONST-S14 | Application re-apply cooldown | {24 h} | BR-T125 | [OPEN] |
| CONST-S15 | Referee reminders cap / spacing | 2 / 3 d | BR-T121 | |

## 4. Count method (REVW-36 style)

A rule is a table row whose first cell matches `BR-T\d{3}` in a registry table. BR-REG v1.0 holds 108 such rows (BR-T001 to BR-T117 with the intentional gaps between blocks). This file adds rows BR-T118 to BR-T127 in section 2 (10 rules); section 1 rows repeat existing ids and are not counted twice. Governance regenerates the headline count by script after acceptance.

## 5. Open items raised

| Item | Question | Owner |
|---|---|---|
| OPEN-counsel (BR-T120) | Minimum age value, attestation versus date of birth | Privacy Lead + counsel |
| BR-T122 | Legal basis for the minimal hiring record and its period | Privacy Lead + counsel (OPEN-08) |
| BR-T119 | Thresholds {N}, {period} and the independence check's inputs | Trust PM |
| BR-T125 | Cooldown value | Product Director |
| CONST-S02, S03 | Final refresh lifetimes (06 and SEC-02 disagreed; this file picks the 06 values) | Security Architect |

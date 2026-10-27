# Product Invariant Registry

Doc ID: INV-REG · Owner: Architecture Review Board + Product Director · Version 1.0 · Status: Under Review · Relates: CC-INV (INV-T01…INV-T20 are defined there and not restated), BR-REG, SM-00, DT-00

> **Revision 2 folded in (2026-10-27).** Amended rows, new rules/tables/machines from `PRODUCT_INVARIANT_REGISTRY.md#record-product-invariant-registry-rev2` are now part of this file. The REV2 file stays as the change record. Status is unchanged: proposals still need owner/ARB ratification.

An invariant is a statement that must be true **at every committed instant**, enforced by construction (type, constraint, state machine, policy), not by convention. Business rules (BR-T) describe policy and may have exceptions; invariants have none. **[TARGET]**

## 1. Canonical invariants (defined in `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md`)

Not copied. This table only maps each to the product areas and specs that must honour it.

| INV | Where it bites in this document set |
|---|---|
| INV-T01 deny-by-default authz | every spec §2 (Actors & access); BR-T044, BR-T057 |
| INV-T02 record-level authz | specs for evidence, applications, messaging, DSR (IDOR ACs) |
| INV-T03 no cross-tenant access | specs g, i, j, n; BR-T100, T105 |
| INV-T04 verified only via server transitions | SM-EVIDENCE; spec c, d, e |
| INV-T05 hashed single-use verification credentials | BR-T016, T020, T053; spec a, d, n |
| INV-T06 AI_PROHIBITED at gateway | BR-T025; spec e |
| INV-T07 free tier never triggers paid inference | BR-T111; spec l |
| INV-T08 AI is never evidence | BR-T007; spec c |
| INV-T09 no autonomous consequential decision | BR-T040, T072; spec i, j; SM universal rule U6 |
| INV-T10 idempotent + audited side effects | spec i, l, m; BR-T114 |
| INV-T11 state changes only via declared SMs | SM-00 |
| INV-T12 outbox in same transaction | SM universal rule U4 |
| INV-T13 offline caches non-authoritative | BR-T117; spec i |
| INV-T14 secrets/PII never in logs | all NFR sections |
| INV-T15 purpose-bound, versioned, revocable consent | BR-T061…T063; spec b, c |
| INV-T16 remotes never read credentials | spec a developer guidance |
| INV-T17 redirect success grants nothing | BR-T033, T090; spec l |
| INV-T18 privileged access time-boxed/audited | BR-T041…T043 |
| INV-T19 explainable, never pay-to-rank | BR-T070…T073; spec h |
| INV-T20 anomaly ≠ guilt | BR-T029; spec e |

## 2. Domain invariants (new, INV-T21…INV-T45)

Severity: **S1** privacy/security breach or false verified status · **S2** data integrity loss · **S3** user-visible inconsistency.

| ID | Invariant | Enforced by | Verified by | Sev | Relates |
|---|---|---|---|---|---|
| INV-T21 | At most one non-terminal (including draft) application exists per (candidate, job). | partial unique index + DOM | concurrency IT | S2 | BR-T001; FEAT-10-02; SM-APPLICATION |
| INV-T22 | Evidence rung is a pure function of currently valid provenance records; no stored rung exists that cannot be recomputed from them. | DOM `computeRung()`; no write API for rung | PROP: recompute equals stored for all items | S1 | BR-T008; FEAT-05-02 |
| INV-T23 | An evidence item that is `active` with an artefact has that artefact's latest scan verdict = clean. | SM-EVIDENCE t3 only path; DB check | IT with infected fixture | S1 | BR-T003; FEAT-05-12 |
| INV-T24 | A referee token authorises exactly one submission for exactly one request; after submit, expiry, cancel or bounce it authorises nothing. | single-use consume under row lock | token concurrency tests | S1 | BR-T020; FEAT-06-02 |
| INV-T25 | A displayed verified rung is never older than the last recompute that followed a provenance change; read paths compute from live validity, not from a cached rung alone. | read model joins validity; cache TTL ≤ 60 s | revocation→read test | S1 | BR-T005; FEAT-05-05 |
| INV-T26 | An attempt in `unverified`, `voided` or `under_review` has no linked evidence at `authority_verified` (under review ⇒ evidence also `under_review`). | SM cross-effects | SM tests | S1 | BR-T026, T029; FEAT-07-04 |
| INV-T27 | Auto-graded evidence is minted at most once per attempt and only from `passed` attempts. | idempotency key `(attempt_id)` + SM | replay test | S1 | BR-T027; FEAT-07-06 |
| INV-T28 | An application's evidence snapshot is immutable after `submitted`. | no update path; row-level trigger denies UPDATE | IT | S2 | BR-T039; FEAT-10-14 |
| INV-T29 | A recruiter/hiring-team read of an evidence item succeeds only if, at read time, a live consent scope (`evidence.share_artefact` for that org, or `evidence.share_summary` for summary fields) or an active application snapshot (`application.share_snapshot`) covers that item and viewer; scope ids per the Consent Scope Catalogue, evaluated with no consent cache (CSC section 6). | POL on every read + RLS | IDOR + consent-revoke tests | S1 | BR-T061…T063; FEAT-05-07 |
| INV-T30 | A `published` job belongs to exactly one org that is verified (or pending-limited with ≤ 1 live job) and consumes at most one job slot. | publish transaction + slot lock | concurrency IT | S2 | BR-T035, T093; FEAT-09-02 |
| INV-T31 | Every application in `rejected`, every account in `suspended`, every evidence item `revoked` by moderation carries `actor.kind = human` and a reason code. | NOT NULL + check constraints; SM guard U6 | DB constraint tests | S1 | BR-T040, T045 |
| INV-T32 | Effective entitlements equal a pure function of (subscription state, plan version, admin grants); no stored entitlement lacks a cause. | DOM `deriveEntitlements()`; cache is derived | PROP | S1 | BR-T090; FEAT-16-04 |
| INV-T33 | A session family has at most one valid refresh generation (plus the 5-second unused-successor leeway). | row lock on rotation | rotation concurrency test | S1 | BR-T050; FEAT-01-04 |
| INV-T34 | Every `active` account has exactly one primary verified email; email is unique case-insensitively among non-erased accounts. | unique index on normalised email | UT, IT | S2 | FEAT-01-01 |
| INV-T35 | The consent ledger is append-only, including during erasure (it holds an opaque `subject_ref`, never a direct identifier, so erasure deletes the identity mapping instead of rewriting rows); current consent is the fold of the ledger. | no UPDATE/DELETE grants; DB trigger; no identifier columns (DB-02 §4.1) | IT | S1 | BR-T061; FEAT-22-01 |
| INV-T36 | The audit log is append-only and tamper-evident (per-row hashes sealed in KMS-signed batch anchors, verified daily; no inline chain lock on the write path); the application role cannot update or delete rows, and erasure never does either. | DB role + anchor job + anchor verifier job (DB-02 §4.2) | anchor verification job | S1 | BR-T042; FEAT-20-03 |
| INV-T37 | Every event consumer is idempotent on `event_id`; redelivery produces no second effect. | consumer dedupe table | replay tests | S2 | ADR-T09; FEAT-24-01 |
| INV-T38 | After erasure completes, no personal data of the subject remains in primary stores, search, caches or object storage; only a hashed tombstone and the retained-record list remain. Opaque `subject_ref` tokens left in append-only history are not personal data once the identity mapping is deleted; the sweep excludes them and instead asserts the mapping is gone. | fan-out + identity-map deletion + verification sweep | post-erasure scanner | S1 | BR-T065; FEAT-22-03 |
| INV-T39 | An interviewer has no two overlapping `scheduled` interviews; a candidate has no two overlapping `scheduled` interviews. | exclusion constraint on time range | concurrency IT | S3 | FEAT-10-07; SM-INTERVIEW |
| INV-T40 | Employers on a candidate's blocklist never see that candidate in search, shortlist suggestions or outreach targeting. | filter in search query and POL | IT | S1 | FEAT-03-09.3; BR-T074 |
| INV-T41 | Institution principals read learner data only as aggregates with k ≥ 5 or as institution-issued-credential records. | POL + DB views | CAN + IT | S1 | BR-T100, T105; FEAT-18-04 |
| INV-T42 | An org's first-contact message count in a period equals the outreach quota counter for that period (counter is derived, not independently incremented). | counter computed from messages | PROP | S3 | BR-T081; FEAT-13-02 |
| INV-T43 | Expiring credentials (verification code, reset token, invite, referee token, export link) are never valid after server-clock expiry, and their raw values appear in no log or event. | DOM + log redaction | clock tests, log scan | S1 | BR-T016, T020, T054, T064 |
| INV-T44 | No application can be submitted to a job that is not `published` at the commit instant. | submit transaction checks job state under share lock | race IT | S2 | BR-T038; FEAT-10-02 |
| INV-T45 | A stored match explanation is generated from exactly the inputs that produced its score (input hash stored); no post-hoc rationale. | matching module single compute path | explanation-hash test | S2 | BR-T071; FEAT-11-02 |
| INV-T46 | Every provenance record that supports the `authority_verified` rung carries an `issuer_class` ∈ {platform, institution, employer_org, instructor}, derived server-side from the issuing record; no write API accepts the class from a client. | DB NOT NULL + CHECK on `evidence_attestation.issuer_class`; DOM `computeRung()` | PROP: class equals the class of the issuing record for all items; SEC: client-supplied class ignored | S1 | BR-T118; ADR-T14a; FEAT-05-04 |
| INV-T47 | An `instructor`-class authority record exists only if the instructor account differs from the learner account and the independence checks of BR-T119 passed at issuance; an `instructor` record never satisfies a platform-verified predicate (UI filter, matching weight, badge). | DOM sign-off guard; DB check `instructor_account_id <> learner_account_id`; POL | SEC: self-enrolment and alternate-account negative controls; UT: predicate excludes the class | S1 | BR-T119, BR-T011; FEAT-08-04 |
| INV-T48 | A work claim sits at rung `artifact_backed` through employer-domain proof only while the proof's domain is bound to a verified `org_domain` of an organization in `verification_state = verified`; losing the binding invalidates the proof and the rung is recomputed. | DOM `computeRung()` reads binding validity at read time; SM-ORG v5 effect | IT: un-verify the org and observe the downgrade; UT: unbound proof stays `claimed` | S1 | BR-T017, BR-T123; DT-06 |
| INV-T49 | An account that is `suspended`, or is the subject of an open moderation case, is not in `pending_erasure` or `erased`. | SM-ACCOUNT t7 guard; SM-DSR t4/t7 | IT: suspended account requests erasure and is parked `on_hold` | S1 | BR-T124, BR-T045; SM-ACCOUNT |
| INV-T50 | No account is `active` without a recorded minimum-age attestation (`min_age_attested_at` and the policy version). | SM-ACCOUNT t1 guard; DB check on `status = 'active'` | UT, SEC bypass tests | S2 | BR-T120; FEAT-01-01 |
| INV-T51 | A reference request has at most 2 reminders in total across system and manual senders. | `reference_request.reminder_count` CHECK ≤ 2; DOM | UT clock; IT mixed sequence | S3 | BR-T121, BR-T004 |
| INV-T52 | The recruiter "Suggested order" view returns every applicant of the job: its row count equals the job's applicant count, whatever the score or filter state, and no applicant is hidden by score. | POL + query without a score predicate | IT: count assertion with a mix of scores | S1 | BR-T072, INV-T09; FEAT-11-10 |

## 3. Using invariants

1. **Specs** cite invariants in §6 (Data) and §9 (Failure scenarios) where a failure would violate one.
2. **Tests:** each invariant has a named test in the (later) test-strategy document; an invariant without a test is *unenforced* and blocks release.
3. **Violation handling:** S1 ⇒ incident, kill-switch via feature flag (FEAT-20-04), post-incident review; S2 ⇒ fix within sprint; S3 ⇒ backlog with owner.
4. **Change control:** adding an invariant is cheap; relaxing one needs an ADR (supersession policy in `ADR_REGISTER.md`).


---

<a id="record-product-invariant-registry-rev2"></a>
## Preserved source record: PRODUCT_INVARIANT_REGISTRY_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/06_BUSINESS_PROCESSES/PRODUCT_INVARIANT_REGISTRY_REV2.md -->
<a id="record-product-invariant-registry-rev2--product-invariant-registry-revision-2-inv-reg-rev2"></a>
# Product Invariant Registry, Revision 2 (INV-REG REV2)

Doc ID: INV-REG-R2 · Owner: Architecture Review Board + Product Director · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-12, 21, 22, 29, 38, 43 (invariant parts) · Relates: INV-REG (INV-T21…T45), CC-INV, BR-REG-R2, SM-00-R2

> **Folded into `PRODUCT_INVARIANT_REGISTRY.md` on 2026-10-27.** This file is now a change record; edit the original, not this file.

**Relationship (no original file was edited).** This file **extends** `PRODUCT_INVARIANT_REGISTRY.md` with INV-T46 to INV-T52, appended after INV-T45. It supersedes nothing; no existing invariant is relaxed. Governance should link it from `00_CONTROL_CENTRE/MASTER_INDEX.md` and record the range INV-T46…T52 in `ID_REGISTRY.md`. Severity scale and rules for using invariants are those of INV-REG sections 2 and 3: an invariant without a named test is unenforced and blocks release.

| ID | Invariant | Enforced by | Verified by | Sev | Relates |
|---|---|---|---|---|---|
| INV-T46 | Every provenance record that supports the `authority_verified` rung carries an `issuer_class` ∈ {platform, institution, employer_org, instructor}, derived server-side from the issuing record; no write API accepts the class from a client. | DB NOT NULL + CHECK on `evidence_attestation.issuer_class`; DOM `computeRung()` | PROP: class equals the class of the issuing record for all items; SEC: client-supplied class ignored | S1 | BR-T118; ADR-T14a; FEAT-05-04 |
| INV-T47 | An `instructor`-class authority record exists only if the instructor account differs from the learner account and the independence checks of BR-T119 passed at issuance; an `instructor` record never satisfies a platform-verified predicate (UI filter, matching weight, badge). | DOM sign-off guard; DB check `instructor_account_id <> learner_account_id`; POL | SEC: self-enrolment and alternate-account negative controls; UT: predicate excludes the class | S1 | BR-T119, BR-T011; FEAT-08-04 |
| INV-T48 | A work claim sits at rung `artifact_backed` through employer-domain proof only while the proof's domain is bound to a verified `org_domain` of an organization in `verification_state = verified`; losing the binding invalidates the proof and the rung is recomputed. | DOM `computeRung()` reads binding validity at read time; SM-ORG v5 effect | IT: un-verify the org and observe the downgrade; UT: unbound proof stays `claimed` | S1 | BR-T017, BR-T123; DT-06 |
| INV-T49 | An account that is `suspended`, or is the subject of an open moderation case, is not in `pending_erasure` or `erased`. | SM-ACCOUNT t7 guard; SM-DSR t4/t7 | IT: suspended account requests erasure and is parked `on_hold` | S1 | BR-T124, BR-T045; SM-ACCOUNT |
| INV-T50 | No account is `active` without a recorded minimum-age attestation (`min_age_attested_at` and the policy version). | SM-ACCOUNT t1 guard; DB check on `status = 'active'` | UT, SEC bypass tests | S2 | BR-T120; FEAT-01-01 |
| INV-T51 | A reference request has at most 2 reminders in total across system and manual senders. | `reference_request.reminder_count` CHECK ≤ 2; DOM | UT clock; IT mixed sequence | S3 | BR-T121, BR-T004 |
| INV-T52 | The recruiter "Suggested order" view returns every applicant of the job: its row count equals the job's applicant count, whatever the score or filter state, and no applicant is hidden by score. | POL + query without a score predicate | IT: count assertion with a mix of scores | S1 | BR-T072, INV-T09; FEAT-11-10 |

Summary after acceptance: 52 invariants (INV-T01 to INV-T45 plus the seven above). Counted from the first-cell pattern `INV-T\d\d` in CC-INV, INV-REG and this file; the script ignores prose mentions.

<!-- source-record-end: Yash_Final_Project_Document/06_BUSINESS_PROCESSES/PRODUCT_INVARIANT_REGISTRY_REV2.md -->

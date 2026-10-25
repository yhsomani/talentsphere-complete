# Feature Specifications â€” Index & Contract

Doc ID: SPEC-00 Â· Owner: Product Director (Functional Spec) Â· Version 1.0 Â· Status: Under Review Â· Relates: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md`, `06_BUSINESS_PROCESSES/*`, `00_CONTROL_CENTRE/ID_REGISTRY.md`, `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md`

Specs describe the **target** product. Nothing here asserts that any feature is built. Tags: **[CONF]** confirmed requirement, **[TARGET]** target decision (default for this folder), **[OPEN]** open assumption (`{â€¦}` marks tunable values), **[REF]** lesson from the existing repo.

## 1. The spec contract (every long-form spec follows it)

| Â§ | Section | Must contain |
|---|---|---|
| 0 | Metadata | Doc ID, Owner, Version, Status, phase, priority, FEAT list, modules, Relates (IDs) |
| 1 | Business purpose | why the feature exists, value, success measure |
| 2 | Actors & access | per role: what they may do + policy action name (deny by default, INV-T01/T02) |
| 3 | Functional behavior | inputs + validation, rules/calculations, side effects (events, notifications, audit), postconditions |
| 4 | User interaction | screens, flows, accessibility, offline behaviour |
| 5 | Backend behavior | module ownership, ordering, workers, ports, provisional endpoints |
| 6 | Data | logical entities and key fields, retention (not final DDL) |
| 7 | States & transitions | which `SM-*` apply; forbidden transitions |
| 8 | NFRs | performance, availability, security, privacy, accessibility, cost, i18n |
| 9 | Failure scenarios | what goes wrong and the expected behaviour |
| 10 | Acceptance criteria | Given/When/Then, tagged Happy / Negative / Boundary / Concurrency / Recovery / Security etc. |
| 11 | Testing | test types and key cases |
| 12 | Developer guidance | build order, pitfalls, pending decisions |
| 13 | Related docs | IDs and files |

**Conventions**
- AC IDs: `AC-<dom>-<nn>-<kk>` = *k*-th acceptance criterion of `FEAT-<dom>-<nn>` (micro-feature ACs: `AC-<dom>-<nn>.<m>-<kk>`).
- Endpoints are **provisional** paths under `/api/v1`; canonical `API-*` IDs belong to the API catalogue. Unsafe mutations take `Idempotency-Key` (FF-07); concurrent edits use `ETag`/`If-Match` (ADR-T08).
- Screens named `SCR-*` are provisional labels; canonical screen IDs are assigned in the UX documents.
- Events use the names in `DOMAIN_ARCHITECTURE.md` where they exist; new ones are marked *proposed*.
- Every FEAT or micro-feature cited here exists in the hierarchy (checked mechanically at authoring time).

## 2. Spec index

| Spec | Subject | Features | File | Phase | AC count |
|---|---|---|---|---|---|
| SPEC-01 | Registration, login, passkey, session refresh/revoke | FEAT-01-01â€¦01-06, FEAT-01-13 | `SPEC_G1_IDENTITY_AND_PROFILE.md` | 1 | 35 |
| SPEC-02 | Profile & consent scopes | FEAT-03-01, 03-02, 03-06, 03-08, 03-09, 22-01 | `SPEC_G1_IDENTITY_AND_PROFILE.md` | 1 | 21 |
| SPEC-03 | Evidence creation, evidence ladder, revocation impact | FEAT-05-01, 05-02, 05-04, 05-05, 05-07, 05-08, 05-12 | `SPEC_G2_EVIDENCE_AND_TRUST.md` | 1 | 29 |
| SPEC-04 | Work-history verification & tokenised referee flow | FEAT-03-07, 06-01â€¦06-04, 06-09, 06-10 | `SPEC_G2_EVIDENCE_AND_TRUST.md` | 1 | 26 |
| SPEC-05 | Assessment attempt (sandbox runner, AI_PROHIBITED, unverified fallback) | FEAT-07-02â€¦07-08, 17-03 | `SPEC_G3_ASSESSMENT_AND_LEARNING.md` | 1 (runner 2) | 30 |
| SPEC-06 | Course enrolment & completion â†’ evidence | FEAT-08-01â€¦08-04, 08-08, 16-09 | `SPEC_G3_ASSESSMENT_AND_LEARNING.md` | 1â€“2 | 21 |
| SPEC-07 | Job posting & publishing | FEAT-09-01â€¦09-03, 09-05, 09-08, 02-03 | `SPEC_G4_HIRING_LOOP.md` | 1â€“2 | 21 |
| SPEC-08 | Job search & explainable match | FEAT-11-01â€¦11-03, 11-07, 11-08, 24-12 | `SPEC_G4_HIRING_LOOP.md` | 1 | 21 |
| SPEC-09 | Application submit (idempotent, draft autosave, one-active rule) | FEAT-10-01â€¦10-04, 10-14, 24-03, 24-07 | `SPEC_G4_HIRING_LOOP.md` | 1 | 27 |
| SPEC-10 | Pipeline stage change & interview scheduling | FEAT-10-05â€¦10-08, 23-03 | `SPEC_G4_HIRING_LOOP.md` | 1â€“2 | 28 |
| SPEC-11 | Messaging & outreach quota | FEAT-13-01â€¦13-06, 16-11 | `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md` | 2 | 24 |
| SPEC-12 | Billing checkout & entitlement derivation | FEAT-16-01â€¦16-04, 16-07, 16-08, 16-11 | same | 2 | 23 |
| SPEC-13 | Data export & erasure | FEAT-22-02, 22-03, 22-07, 01-10 | same | 1 | 24 |
| SPEC-14 | Institution cohort onboarding & graduation | FEAT-18-01â€¦18-04, 18-06, 18-07 | same | 3 | 29 |
| â€” | **Micro-feature specs (65)** | see file | `MICRO_FEATURE_SPECS.md` | 1â€“3 | 65 |

Totals: **14 long-form specs, 359 acceptance criteria in long-form specs, 65 micro-feature specs with one AC each.** (Counts mechanically verified at authoring time.)

## 3. Mapping from the brief to specs

| Brief item | Spec |
|---|---|
| (a) registration & login incl. passkey, session refresh/revoke | SPEC-01 |
| (b) profile & consent scopes | SPEC-02 |
| (c) evidence + ladder + revocation impact | SPEC-03 |
| (d) work-history verification & referee flow | SPEC-04 |
| (e) assessment attempt | SPEC-05 |
| (f) course enrolment & completion â†’ evidence | SPEC-06 |
| (g) job posting & publishing | SPEC-07 |
| (h) job search & explainable match | SPEC-08 |
| (i) application submit | SPEC-09 |
| (j) pipeline stage change & interview scheduling | SPEC-10 |
| (k) messaging & outreach quota | SPEC-11 |
| (l) billing checkout & entitlement derivation | SPEC-12 |
| (m) data export & erasure | SPEC-13 |
| (n) institution cohort onboarding & graduation | SPEC-14 |

## 4. Cross-spec dependencies

| Producer â†’ consumer | Contract |
|---|---|
| SPEC-05, SPEC-06, SPEC-14 â†’ SPEC-03 | issuer API mints `authority_verified` evidence idempotently |
| SPEC-04 â†’ SPEC-03 | provenance records feed DT-06 rung computation |
| SPEC-02 â†’ SPEC-08, SPEC-09, SPEC-11 | `consent_current` drives search visibility, application snapshot, outreach |
| SPEC-03 â†’ SPEC-08 | rung + recency drive skill confidence and match |
| SPEC-07 â†’ SPEC-09 | job must be `published`; applications unaffected by later job state |
| SPEC-12 â†’ SPEC-06, SPEC-07, SPEC-11 | `entitlement.changed` activates paid enrolments, job slots, outreach meters |
| SPEC-09 â†’ SPEC-10 | submitted application feeds the pipeline; snapshot overlays |
| SPEC-13 â†’ all | every module implements export/erase contributors |

## 5. Known limits of this folder

1. Constants (thresholds, quotas, TTLs) are product defaults; values marked `{â€¦}` need owner sign-off.
2. Legal duties (pay-range disclosure, retention periods, statutory deadlines, minors) are **[OPEN-08]/[OPEN-09]**; the specs name the hook, not a legal conclusion.
3. Scoring constants in SPEC-08 are heuristic until calibrated against outcomes and fairness audits.
4. Stripe event and status names in SPEC-12 and SM-SUBSCRIPTION must be re-verified against current processor documentation before implementation.
5. No usability or security testing has been performed; acceptance criteria describe tests to be written, not tests that exist.

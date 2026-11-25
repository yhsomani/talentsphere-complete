# Target blueprint 05: Feature Specifications

> **Status.** Archive: proposal, not ratified. A greenfield redesign blueprint written in October 2026. Every area was Draft, Under Review or Revision Required (its own document status) and no test was run against it. Its content was mined into `docs/blueprint/`; `SSOT.md` remains the source of intent. Module federation described here was not adopted: the built system is a modular monolith (`ARCHITECTURE.md`).
>
> **What this file holds.** All files of the former `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/` folder, in order.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| README.md | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/README.md` |
| Legacy Feature Contract (31 fields), Status Rule and Product Acceptance (merged) | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` |
| Legacy Requirements and Acceptance Criteria Extracted from the Prior Attempt's Reports | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md` |
| Micro-Feature Specifications | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/MICRO_FEATURE_SPECS.md` |
| Feature Specifications — Group 1: Identity, Sessions, Profile & Consent | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G1_IDENTITY_AND_PROFILE.md` |
| Feature Specifications — Group 2: Evidence, Verification & Referees | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G2_EVIDENCE_AND_TRUST.md` |
| Feature Specifications — Group 3: Assessment & Learning | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G3_ASSESSMENT_AND_LEARNING.md` |
| Feature Specifications — Group 4: Jobs, Search & Match, Applications, Pipeline | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G4_HIRING_LOOP.md` |
| Feature Specifications — Group 5: Messaging, Billing, Data Rights, Institutions | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md` |
| Feature Specifications, Acceptance Additions (SPEC REV2) | `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_ACCEPTANCE_ADDITIONS_REV2.md` |

## README.md

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/README.md`._

﻿# Feature Specifications â€” Index & Contract

Doc ID: SPEC-00 Â· Owner: Product Director (Functional Spec) Â· Version 1.0 Â· Status: Under Review Â· Relates: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md`, `06_BUSINESS_PROCESSES/*`, `00_CONTROL_CENTRE/ID_REGISTRY.md`, `00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md`

Specs describe the **target** product. Nothing here asserts that any feature is built. Tags: **[CONF]** confirmed requirement, **[TARGET]** target decision (default for this folder), **[OPEN]** open assumption (`{â€¦}` marks tunable values), **[REF]** lesson from the existing repo.

### 1. The spec contract (every long-form spec follows it)

| Â§  | Section              | Must contain                                                                                         |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| 0   | Metadata             | Doc ID, Owner, Version, Status, phase, priority, FEAT list, modules, Relates (IDs)                   |
| 1   | Business purpose     | why the feature exists, value, success measure                                                       |
| 2   | Actors & access      | per role: what they may do + policy action name (deny by default, INV-T01/T02)                       |
| 3   | Functional behavior  | inputs + validation, rules/calculations, side effects (events, notifications, audit), postconditions |
| 4   | User interaction     | screens, flows, accessibility, offline behaviour                                                     |
| 5   | Backend behavior     | module ownership, ordering, workers, ports, provisional endpoints                                    |
| 6   | Data                 | logical entities and key fields, retention (not final DDL)                                           |
| 7   | States & transitions | which `SM-*` apply; forbidden transitions                                                            |
| 8   | NFRs                 | performance, availability, security, privacy, accessibility, cost, i18n                              |
| 9   | Failure scenarios    | what goes wrong and the expected behaviour                                                           |
| 10  | Acceptance criteria  | Given/When/Then, tagged Happy / Negative / Boundary / Concurrency / Recovery / Security etc.         |
| 11  | Testing              | test types and key cases                                                                             |
| 12  | Developer guidance   | build order, pitfalls, pending decisions                                                             |
| 13  | Related docs         | IDs and files                                                                                        |

**Conventions**

- AC IDs: `AC-<dom>-<nn>-<kk>` = _k_-th acceptance criterion of `FEAT-<dom>-<nn>` (micro-feature ACs: `AC-<dom>-<nn>.<m>-<kk>`).
- Endpoints are **provisional** paths under `/api/v1`; canonical `API-*` IDs belong to the API catalogue. Unsafe mutations take `Idempotency-Key` (FF-07); concurrent edits use `ETag`/`If-Match` (ADR-T08).
- Screens named `SCR-*` are provisional labels; canonical screen IDs are assigned in the UX documents.
- Events use the names in `DOMAIN_ARCHITECTURE.md` where they exist; new ones are marked _proposed_.
- Every FEAT or micro-feature cited here exists in the hierarchy (checked mechanically at authoring time).

### 2. Spec index

| Spec    | Subject                                                                 | Features                                             | File                                                  | Phase        | AC count |
| ------- | ----------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- | ------------ | -------- |
| SPEC-01 | Registration, login, passkey, session refresh/revoke                    | FEAT-01-01â€¦01-06, FEAT-01-13                       | `SPEC_G1_IDENTITY_AND_PROFILE.md`                     | 1            | 35       |
| SPEC-02 | Profile & consent scopes                                                | FEAT-03-01, 03-02, 03-06, 03-08, 03-09, 22-01        | `SPEC_G1_IDENTITY_AND_PROFILE.md`                     | 1            | 21       |
| SPEC-03 | Evidence creation, evidence ladder, revocation impact                   | FEAT-05-01, 05-02, 05-04, 05-05, 05-07, 05-08, 05-12 | `SPEC_G2_EVIDENCE_AND_TRUST.md`                       | 1            | 29       |
| SPEC-04 | Work-history verification & tokenised referee flow                      | FEAT-03-07, 06-01â€¦06-04, 06-09, 06-10              | `SPEC_G2_EVIDENCE_AND_TRUST.md`                       | 1            | 26       |
| SPEC-05 | Assessment attempt (sandbox runner, AI_PROHIBITED, unverified fallback) | FEAT-07-02â€¦07-08, 17-03                            | `SPEC_G3_ASSESSMENT_AND_LEARNING.md`                  | 1 (runner 2) | 30       |
| SPEC-06 | Course enrolment & completion â†’ evidence                              | FEAT-08-01â€¦08-04, 08-08, 16-09                     | `SPEC_G3_ASSESSMENT_AND_LEARNING.md`                  | 1â€“2        | 21       |
| SPEC-07 | Job posting & publishing                                                | FEAT-09-01â€¦09-03, 09-05, 09-08, 02-03              | `SPEC_G4_HIRING_LOOP.md`                              | 1â€“2        | 21       |
| SPEC-08 | Job search & explainable match                                          | FEAT-11-01â€¦11-03, 11-07, 11-08, 24-12              | `SPEC_G4_HIRING_LOOP.md`                              | 1            | 21       |
| SPEC-09 | Application submit (idempotent, draft autosave, one-active rule)        | FEAT-10-01â€¦10-04, 10-14, 24-03, 24-07              | `SPEC_G4_HIRING_LOOP.md`                              | 1            | 27       |
| SPEC-10 | Pipeline stage change & interview scheduling                            | FEAT-10-05â€¦10-08, 23-03                            | `SPEC_G4_HIRING_LOOP.md`                              | 1â€“2        | 28       |
| SPEC-11 | Messaging & outreach quota                                              | FEAT-13-01â€¦13-06, 16-11                            | `SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md` | 2            | 24       |
| SPEC-12 | Billing checkout & entitlement derivation                               | FEAT-16-01â€¦16-04, 16-07, 16-08, 16-11              | same                                                  | 2            | 23       |
| SPEC-13 | Data export & erasure                                                   | FEAT-22-02, 22-03, 22-07, 01-10                      | same                                                  | 1            | 24       |
| SPEC-14 | Institution cohort onboarding & graduation                              | FEAT-18-01â€¦18-04, 18-06, 18-07                     | same                                                  | 3            | 29       |
| â€”     | **Micro-feature specs (65)**                                            | see file                                             | `MICRO_FEATURE_SPECS.md`                              | 1â€“3        | 65       |

Totals: **14 long-form specs, 359 acceptance criteria in long-form specs, 65 micro-feature specs with one AC each.** (Counts mechanically verified at authoring time.)

### 3. Mapping from the brief to specs

| Brief item                                                     | Spec    |
| -------------------------------------------------------------- | ------- |
| (a) registration & login incl. passkey, session refresh/revoke | SPEC-01 |
| (b) profile & consent scopes                                   | SPEC-02 |
| (c) evidence + ladder + revocation impact                      | SPEC-03 |
| (d) work-history verification & referee flow                   | SPEC-04 |
| (e) assessment attempt                                         | SPEC-05 |
| (f) course enrolment & completion â†’ evidence                 | SPEC-06 |
| (g) job posting & publishing                                   | SPEC-07 |
| (h) job search & explainable match                             | SPEC-08 |
| (i) application submit                                         | SPEC-09 |
| (j) pipeline stage change & interview scheduling               | SPEC-10 |
| (k) messaging & outreach quota                                 | SPEC-11 |
| (l) billing checkout & entitlement derivation                  | SPEC-12 |
| (m) data export & erasure                                      | SPEC-13 |
| (n) institution cohort onboarding & graduation                 | SPEC-14 |

### 4. Cross-spec dependencies

| Producer â†’ consumer                 | Contract                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------- |
| SPEC-05, SPEC-06, SPEC-14 â†’ SPEC-03 | issuer API mints `authority_verified` evidence idempotently                 |
| SPEC-04 â†’ SPEC-03                   | provenance records feed DT-06 rung computation                              |
| SPEC-02 â†’ SPEC-08, SPEC-09, SPEC-11 | `consent_current` drives search visibility, application snapshot, outreach  |
| SPEC-03 â†’ SPEC-08                   | rung + recency drive skill confidence and match                             |
| SPEC-07 â†’ SPEC-09                   | job must be `published`; applications unaffected by later job state         |
| SPEC-12 â†’ SPEC-06, SPEC-07, SPEC-11 | `entitlement.changed` activates paid enrolments, job slots, outreach meters |
| SPEC-09 â†’ SPEC-10                   | submitted application feeds the pipeline; snapshot overlays                 |
| SPEC-13 â†’ all                       | every module implements export/erase contributors                           |

### 5. Known limits of this folder

1. Constants (thresholds, quotas, TTLs) are product defaults; values marked `{â€¦}` need owner sign-off.
2. Legal duties (pay-range disclosure, retention periods, statutory deadlines, minors) are **[OPEN-08]/[OPEN-09]**; the specs name the hook, not a legal conclusion.
3. Scoring constants in SPEC-08 are heuristic until calibrated against outcomes and fairness audits.
4. Stripe event and status names in SPEC-12 and SM-SUBSCRIPTION must be re-verified against current processor documentation before implementation.
5. No usability or security testing has been performed; acceptance criteria describe tests to be written, not tests that exist.

## Legacy Feature Contract (31 fields), Status Rule and Product Acceptance (merged)

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md`._

Doc ID: SPEC-LEG-01 · Owner: Product Director (Functional Spec) · Version 1.0 · Status: Draft for Review · Relates: `README.md` (SPEC-00 spec contract), `../04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md`, `../07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

### Merged from legacy: `31_LEGACY_ARCHIVE/docs/registries/FEATURE_REGISTRY.md` (contract template, status rule) and `31_LEGACY_ARCHIVE/docs/product/PRD.md` section 12 (product acceptance)

Frame: **nothing is implemented.** The items below were the prior attempt's rules for how a feature is described and accepted. They are requirements for how this project writes and accepts feature work.

### 1. Prior per-feature contract (31 fields) mapped to the target spec contract (SPEC-00)

The prior attempt required every feature to carry the following fields. The target spec contract (`README.md` section 1, sections 0 to 13) covers almost all of them; the right-hand column records where, and which fields have **no explicit home** so that nothing is lost.

| #   | Legacy field     | Target home (SPEC-00 section)                                                   | Gap?                                                                                                                                                                                                 |
| --- | ---------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Feature ID       | 0 Metadata                                                                      |                                                                                                                                                                                                      |
| 2   | Name             | 0 Metadata                                                                      |                                                                                                                                                                                                      |
| 3   | Purpose          | 1 Business purpose                                                              |                                                                                                                                                                                                      |
| 4   | User value       | 1 Business purpose                                                              |                                                                                                                                                                                                      |
| 5   | Business value   | 1 Business purpose                                                              |                                                                                                                                                                                                      |
| 6   | Target roles     | 2 Actors and access                                                             |                                                                                                                                                                                                      |
| 7   | Dependencies     | 0 Metadata (Relates) and the FEAT hierarchy                                     |                                                                                                                                                                                                      |
| 8   | Entry points     | 4 User interaction                                                              |                                                                                                                                                                                                      |
| 9   | Journey          | 4 User interaction (link UJ-*)                                                  |                                                                                                                                                                                                      |
| 10  | Behavior         | 3 Functional behavior                                                           |                                                                                                                                                                                                      |
| 11  | Rules            | 3 Functional behavior (BR-T references; legacy BR-* only through the crosswalk) |                                                                                                                                                                                                      |
| 12  | Inputs/outputs   | 3 Functional behavior                                                           |                                                                                                                                                                                                      |
| 13  | States           | 7 States and transitions                                                        |                                                                                                                                                                                                      |
| 14  | Permissions      | 2 Actors and access                                                             |                                                                                                                                                                                                      |
| 15  | Data             | 6 Data                                                                          |                                                                                                                                                                                                      |
| 16  | API/events       | 5 Backend behavior                                                              |                                                                                                                                                                                                      |
| 17  | Frontend         | 4 User interaction                                                              |                                                                                                                                                                                                      |
| 18  | Backend          | 5 Backend behavior                                                              |                                                                                                                                                                                                      |
| 19  | Integrations     | 5 Backend behavior (ports)                                                      |                                                                                                                                                                                                      |
| 20  | Analytics        | none explicit                                                                   | **Yes.** Add an "events and metrics emitted (MET-*)" line to section 3 side effects or section 8.                                                                                                    |
| 21  | Security/privacy | 8 NFRs                                                                          |                                                                                                                                                                                                      |
| 22  | Performance      | 8 NFRs                                                                          |                                                                                                                                                                                                      |
| 23  | Observability    | 8 NFRs (no dedicated line)                                                      | Partial. Name logs, metrics and traces required.                                                                                                                                                     |
| 24  | Errors           | 9 Failure scenarios                                                             |                                                                                                                                                                                                      |
| 25  | Edge cases       | 9 Failure scenarios and 10 acceptance (Boundary tags)                           |                                                                                                                                                                                                      |
| 26  | Recovery         | 9 Failure scenarios                                                             |                                                                                                                                                                                                      |
| 27  | Tests            | 11 Testing                                                                      |                                                                                                                                                                                                      |
| 28  | Acceptance       | 10 Acceptance criteria                                                          |                                                                                                                                                                                                      |
| 29  | Evidence/status  | none, by design                                                                 | **Yes (intentional).** Target specs never claim status; readiness lives in `99_FINAL_MASTER_BLUEPRINT/IMPLEMENTATION_READINESS.md` and release gates. Keep evidence and status out of the spec body. |
| 30  | Decision         | 12 Developer guidance (pending decisions)                                       |                                                                                                                                                                                                      |
| 31  | Future extension | none explicit                                                                   | **Yes.** Add a "deferred / future extension" line to section 12.                                                                                                                                     |

The legacy block listed exactly 31 field names in the order shown (Feature ID first, Future extension last).

Target action: adopt the three gap items (Analytics, Observability, Future extension) in SPEC-00 at its next revision (OPEN-LGA-12).

### 2. Feature status vocabulary and rule (legacy; carried over)

```text
PLANNED
-> IN DEVELOPMENT
-> IMPLEMENTED
-> VERIFIED
-> RELEASED
```

Side states: `BLOCKED`, `DEPRECATED`, `REJECTED`.

Rule: documentation alone cannot advance a feature to IMPLEMENTED. Implementation status is **not** recorded in the registry; it is recorded in a separate dated status report that changes only with current executable evidence.

Target position: every F-* / FEAT-* feature in this project starts at **PLANNED**. The same vocabulary and rule apply. Nothing may be promoted by editing documents.

### 3. Product acceptance (prior PRD section 12; carried over)

A product increment is accepted only when all of the following are satisfied:

1. the user outcome;
2. the journey;
3. security and privacy constraints;
4. accessibility behaviour;
5. operational readiness;
6. measurable acceptance criteria.

Related prior statements: GA requires the platform foundations plus a **complete trusted career loop**; the 173-feature portfolio is not a requirement to ship before validating the core product (see `../01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md`). Journey rule: a journey is not complete until its critical feature chain is testable end to end (see `../02_STAKEHOLDERS_AND_USERS/LEGACY_JOURNEY_REGISTRY_J01_J28.md`). UX acceptance checklist: see `../07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md` section 8.

### 4. Open items

| ID          | Item                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| OPEN-LGA-12 | Add Analytics, Observability and Future-extension lines to SPEC-00 (see section 1). Owner: Product Director. |

## Legacy Requirements and Acceptance Criteria Extracted from the Prior Attempt's Reports

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md`._

Doc ID: SPEC-LEGACY-C · Owner: Product Requirements Lead (proposed) · Version 1.0 · Status: Proposed (Under Review) · Date: 2026-10-26 · Merge track: C (source group `31_LEGACY_ARCHIVE/docs/reports/**`)

**Relationship (no original file was edited).** This file **supersedes nothing**. It is an **input register** that sits beside `SPEC_G1…G5`, `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` and `MICRO_FEATURE_SPECS.md`. Nothing here is approved scope. A requirement in this file becomes target scope only when a target specification or an ADR adopts it by ID. Linked from `00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md`; the documentation owner must also link it from `00_CONTROL_CENTRE/MASTER_INDEX.md`. Owner instruction behind this merge: _"i dont want to loos information keep everything in use untile it get improved"_.

**Greenfield frame.** No source code exists in this repository and nothing is implemented. The reports describe an **earlier attempt** (a pnpm monorepo with a Fastify API, a React web app, a PostgreSQL worker and shared packages). Statements such as "fixed" or "durable" below describe that attempt's code at a dated commit; here they become **acceptance criteria the target must meet**, not claims of existing behavior. Technology names in the criteria (PBKDF2, Fastify, Resend, Stripe, PostgreSQL) are the prior attempt's choices and are kept so that nothing is lost; the target may satisfy the same criterion with a different mechanism if its ADR says so.

Companion files: `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` (lessons, `LES-nn`), `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (gates, `LRG-nn`), `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` (evidence method, `LEI-nn`).

### 1. How to read the IDs

| Prefix            | Meaning                                                                                                            | Where defined      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `LGR-nn`          | Acceptance statement derived from a defect that the prior attempt fixed or specified, with the covering test noted | Sections 3 and 4   |
| `BL-001`…`BL-018` | Release backlog item with Given/When/Then, from `RELEASE_SCOPE_AND_BACKLOG.md` (2026-10-22)                        | Section 6          |
| `X-00`…`X-11`     | Cross-cutting delivery packets from `FEATURE_PLAN_2026-10-21.md`                                                   | Section 7          |
| `BL-F-nn`         | One work packet per canonical feature (169 packets; F-38, F-39, F-62, F-63 excluded)                               | Section 9 register |
| `F-nn`            | Canonical feature id of the prior registry (173 features)                                                          | Section 9          |
| `D-nn`, `O-nn`    | Defects and owner decisions in `FEATURE_STATUS_2026-10-21.md`                                                      | Lessons file       |

Priority vocabulary preserved: the registry's value score is 0 to 10 and is **not** release urgency. Delivery urgency is P0 (prevents safe or reliable release), P1 (completes a required journey), P2 (improves secondary capability or quality), P3 (can wait). Sizes S, M, L are uncertainty estimates, not days.

### 2. Product thesis, core loop and ideal state stated by the reports

**Thesis (IMPROVEMENT_PROGRAM A).** A career platform whose differentiator is trust: a candidate's claims (work history, skills, evidence) carry visible, explainable verification, such as a confirmed work email, references from named people and assessed evidence, so employers can hire on proof rather than self-description. Longer form from the 10-03 audit: a PWA-first career operating system around a Talent Graph and Evidence Graph with the loop _Goal, Gap, Learn, Practice, Prove, Verify, Discover, Match, Apply, Interview, Outcome, New Evidence_.

**Core loop (three actors).**

- Candidate: sign up, build profile, add work history, prove it (email code, references), apply.
- Recruiter: set up company, post job, review applicants (with a verification summary), move them through the pipeline.
- Referee: receive a one-time link, confirm dates and title, rate, so the candidate's record upgrades.

**Two-tier release boundary (RELEASE_SCOPE §1).** Tier 1, the core career loop (candidate sign-up, profile and skills graph, work-history proof of control, referee voucher, jobs, apply, ATS pipeline, messaging, notifications, settings and privacy) is the general-availability scope. Tier 2, the extended ecosystem (learning, challenge arena, video interview, multi-context reputation, salary intelligence), is staged and must be durable before broad release.

**Ideal-state blueprint (IMPROVEMENT_PROGRAM C), seven criteria the reports used as the definition of good:**

1. Every claim is proven or labelled; verification tiers derive only from evidence a third party controls; nothing in the UI asserts a capability, certification or result the system did not produce.
2. Everything the product promises to remember is durable, transactional and survives restarts, with concurrent writes that cannot silently overwrite each other.
3. Authorization is object-level everywhere: every route that loads a record by id checks the caller's relationship to it (owner, organization member, participant), not just that they are signed in.
4. The three roles each have a complete journey in the UI with real states (empty, loading, error, conflict, offline).
5. Delivery channels exist: transactional email (codes, reference links) and in-app notifications for status changes; without email the verification loop cannot run outside development.
6. Operable: one documented deployment, health that reports what is measured, error-level logs that mean faults, backups and a tested restore.
7. One architecture of record, with documents that describe it.

**Gap framing from the 10-03 audit (kept as requirement context).** A business owner cares about the terminal user outcome, not the number of backend endpoints; the intended first-visit path is _Landing, Sign up, Verify, Onboarding, Goal, Skills, Learning, Practice, Evidence, Profile, Jobs, Application, Interview, Outcome_; the golden rule is "documented, implemented, verified and production-ready are four different things".

### 3. Acceptance criteria derived from defects (by theme)

Each row is a testable statement. "Covering test" is the prior attempt's test file or suite where one was named; it is a pointer for test design only.

#### 3.1 Honest interface and zero-state

| ID     | Acceptance criterion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Source                              | Covering test in prior attempt                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| LGR-01 | When the sign-in API fails or returns non-OK, the UI shows a visible error and a retry; no token or identity is written to browser storage.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | PRODUCTION_AUDIT QW-01, P0-01       | e2e `web-ui`, `navigation`                             |
| LGR-02 | Every transactional action (sign in, checkout, evidence, apply) shows success only after HTTP success, a valid response body and a confirmed state change.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | QW-02                               | e2e `core-loop` (three people, UI only)                |
| LGR-03 | Dashboard, jobs and evidence pages render data from queries only; no hard-coded person, count, score or hash. A brand-new user sees a designed empty state.                                                                                                                                                                                                                                                                                                                                                                                                                                                 | P0 §7.2, §7.3, finding 5            | e2e `core-loop`                                        |
| LGR-04 | Authenticated experiences are guarded by route guards; unauthenticated navigation to `/dashboard` redirects to sign-in; login honors `?return=` only for in-app paths.                                                                                                                                                                                                                                                                                                                                                                                                                                      | QW-04; E2E audit                    | e2e `navigation`                                       |
| LGR-05 | The UI contains no unsupported compliance or certification claim, no fabricated phone number, and support, privacy and security addresses come from validated configuration. Legal pages are labelled drafts until counsel approves.                                                                                                                                                                                                                                                                                                                                                                        | finding 20; PR #43; BL-004          | e2e `web-ui`, `frontend-fixes` FE-02                   |
| LGR-06 | Failed loads offer retry; a single error boundary per page; clear messages for offline, timeout and server errors; action errors show a plain notice and do not discard input; not-found is final.                                                                                                                                                                                                                                                                                                                                                                                                          | F-21 requirement; E2E E10, G08, A16 | e2e `session-resilience`                               |
| LGR-07 | A 5xx response uses generic user wording (an explicit 503 may show its message); an unexpected HTML page shows "unexpected response"; field errors name the field using the API's `details`.                                                                                                                                                                                                                                                                                                                                                                                                                | E2E G01, G03, E19b, E23b, E24b, N06 | `web-api-json.test.ts` (11 tests)                      |
| LGR-08 | When a session ends on its own the sign-in page shows the API's specific reason once (this tab only, gone on reload; none after a deliberate sign-out); a specific reason is never overwritten by a generic one. Wording: "Your session has expired or is no longer valid. Sign in again."                                                                                                                                                                                                                                                                                                                  | finding 31                          | `session-ended-reason.test.ts`, e2e `account-security` |
| LGR-09 | A double click on sign-in, apply, add project, add role, send message and suspend produces exactly one request.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | E2E audit; FE sign-in guard         | e2e `frontend-fixes`                                   |
| LGR-10 | Closing a job asks for confirmation and Cancel leaves it published; a hiring retry after a failed publish reuses the created draft instead of duplicating the job; the reference page distinguishes API outage (503, retry button) from invalid or used token (404); the applicant pipeline filter is an accessible toggle-button group (`aria-pressed`) rather than fake tabs; form input borders meet a 3:1 contrast ratio (prior: `neutral[500]`, 4.76:1).                                                                                                                                               | PR #57 FE-04 to FE-07, FE-11        | e2e `frontend-fixes` (6 tests)                         |
| LGR-11 | Profile page offers "Download my data" with an explicit partial-export disclosure and error handling; the evidence page shows a session-ended notice.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | FE-02, FE-03                        | e2e `frontend-fixes`                                   |
| LGR-12 | Responsive matrix: 23 pages at 7 viewports from 320x568 to 2560x1440 (portrait and landscape at 14 sizes were measured): no sideways scroll, nothing cut off, a one-row 64 px header at every width (full navigation from 1024 px signed in or 640 px signed out, menu button below that), one shared container (1200 px, 16/24/32 px gutters), stats 2x2 then 4 across, standalone text links and choices at least 32 px (44 px on touch), dialogs become bottom sheets under 640 px, the sticky header never hides a focused control (`scroll-padding-top`), text at least 12 px, WCAG 2.5.8 target size. | finding 33                          | e2e `responsive`                                       |
| LGR-13 | Layout stability: cumulative layout shift at most 0.1 at 390 px and 1280 px on every signed-in page (prior fixed to at most 0.008): PWA status detected before first paint, fixed-width account label, content area at least one screen tall.                                                                                                                                                                                                                                                                                                                                                               | finding 26                          | e2e `performance`                                      |
| LGR-14 | Accessibility baseline automated in the browser: document language, titles, landmarks, one H1, heading order, accessible names, labels, alt text, no positive tabindex, skip link, keyboard navigation, visible focus, 320 px reflow, 200 percent zoom, reduced motion. Contrast and screen-reader behavior stay manual checks.                                                                                                                                                                                                                                                                             | PRODUCTION_AUDIT §8                 | e2e `accessibility`                                    |
| LGR-15 | URL fields (portfolio links, organization website, resume website, media and meeting URLs) accept only `http` and `https`; already-stored values render inert through a safe-href helper.                                                                                                                                                                                                                                                                                                                                                                                                                   | E2E E20                             | `contracts-url.test.ts` (16 tests)                     |
| LGR-16 | The Connect button is hidden or disabled while a request is pending; the member id is validated client-side in plain words; a notes field shows a counter instead of silently cutting at 3000 characters; a paused job paused again from a stale tab shows user wording; "Work mode" select is at least 44 px on touch.                                                                                                                                                                                                                                                                                     | E2E N02b, F10b, F13, H03, R04       | open in the prior attempt                              |

#### 3.2 Identity, sessions and passwords

| ID     | Acceptance criterion                                                                                                                                                                                                                                                                                                                                                                                                     | Source                  | Covering test                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| LGR-20 | Register, restart the API, sign in again: the account exists (real database).                                                                                                                                                                                                                                                                                                                                            | finding 1               | `tests/pg/core-persistence.test.ts`                                                                                                  |
| LGR-21 | Every request re-resolves account roles, suspension, erasure, password-change and sign-out cut-offs from the system of record; a role change applies to existing sessions immediately; restricted (suspended or banned) accounts may only appeal and exercise data rights; with durable storage a signed token for a missing account is refused ("This account no longer exists.").                                      | findings 12, 35; TS-005 | `core-authz` ("account state is enforced", "applies a role change to existing sessions immediately"), `tests/pg/concurrency.test.ts` |
| LGR-22 | Passwords use a versioned format with at least 210,000 PBKDF2-HMAC-SHA512 iterations (or an ADR-approved stronger scheme), transparent re-hash on sign-in, a timing decoy for unknown emails, and a deployed-environment floor on iterations. Legacy hashes verify and re-hash.                                                                                                                                          | finding 13; PR #58      | `password-hashing.test.ts`, `production-config.test.ts`                                                                              |
| LGR-23 | Sign-out records the session id and the API refuses the token on every route until it would have expired; "Sign out of other devices" ends every other session and keeps this one; changing the password (current password required, throttled per account) ends every other session from the next second and keeps this device signed in. Tokens without a session id report `ended: false` and expire within 24 hours. | findings 27, 30         | `session-sign-out.test.ts` (mutation-checked), e2e `account-security` (two devices)                                                  |
| LGR-24 | Rate limits: per signed-in account (per address when anonymous), prior default 300 requests per minute, proxy trust configurable, health endpoints exempt, a plain 429 message with the wait time; separate login throttle (prior: 10 per 15 minutes per account); a test must run with production limits.                                                                                                               | finding 24              | `api-security` "Rate limiting", `rate-limit-config.test.ts`, e2e `session-resilience`                                                |
| LGR-25 | A deployed environment (production and staging) refuses to start without a token secret, with in-memory storage, with the default or localhost database URL, or without explicit CORS; error messages are generic to clients; a Content-Security-Policy is sent; staging may still allow simulated billing and a localhost origin for testing.                                                                           | findings 14, 37; TS-004 | `production-config.test.ts`                                                                                                          |
| LGR-26 | Sign-up and password change reject common and breached passwords and enforce a documented minimum (prior accepted `password` and `12345678`; decision open).                                                                                                                                                                                                                                                             | E2E B03b, B03c, E15c    | open                                                                                                                                 |
| LGR-27 | Registration cannot grant admin (neither `role` nor `roles[]`); profile mass-assignment cannot change roles or owner; edited-role, `alg:none`, garbage and non-Bearer tokens are rejected.                                                                                                                                                                                                                               | E2E suites B, C         | `core-authz`, `api-security`                                                                                                         |

#### 3.3 Verification and trust

| ID     | Acceptance criterion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Source                                                       | Covering test                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| LGR-30 | Corporate-email proof: domain must match the company domain; disposable and consumer webmail domains are rejected; a six-digit code is generated with a cryptographic RNG, stored as a keyed hash, valid 15 minutes, at most 5 attempts, consumed on success, delivered only through the queue and never returned in the HTTP response.                                                                                                                                                                    | finding 3; SEC-01; BL-001                                    | `work-history-graph.test.ts`, `core-authz`                           |
| LGR-31 | Concurrency: 40 parallel wrong codes are evaluated at most 5 times and the correct code is then refused (conditional update `WHERE work_history_id = $1 AND code_hash = $3 AND attempts = $4`).                                                                                                                                                                                                                                                                                                            | finding 8                                                    | `tests/pg/concurrency.test.ts` (40 greater than 5 without the guard) |
| LGR-32 | Referee proof: a 128-bit random token, stored only as a hash, shown to the referee only, single-use, expiring (30 days proposed, `410 GONE` `reference_voucher_expired`), invalid or used tokens return a generic 404 (no id harvesting), submission refused when referee user id or referee email equals the candidate's, and refused for a signed-in session equal to the candidate (403); retries deduplicated by `clientRequestId` with a partial unique index on `(candidate_id, client_request_id)`. | findings 2, 19; SEC-02; BL-002; ARCHITECTURE_DURABILITY §3.2 | `work-history-graph.test.ts`, e2e `core-loop`                        |
| LGR-33 | Verification score: self-reported skills earn zero trust points; the score rises only with mailbox proof or independent references (prior question: 5 points for two typed skills undercut the promise).                                                                                                                                                                                                                                                                                                   | improvement H7; PR #57                                       | owner decision                                                       |
| LGR-34 | Removing a role deletes its references and any open email challenge in the same transaction, cancels still-queued emails and strips their secrets, is owner-only, names what goes with it in a dialog, and a replayed "add role" creates a new role rather than returning the removed one; a removal racing a referee's submission resolves to one outcome.                                                                                                                                                | finding 28                                                   | `work-history-removal` integration, pg and e2e                       |
| LGR-35 | A challenge submission is stored once as evidence; a duplicate passing submission returns the original evidence; self-verification is blocked; self-reported skills earn 0 trust points.                                                                                                                                                                                                                                                                                                                   | PR #57; R2-8                                                 | `review-r2-regressions.test.ts`                                      |
| LGR-36 | A submission that was not executed never reports `passed` or a score; the result is "submission recorded, unverified" until an approved isolated executor exists.                                                                                                                                                                                                                                                                                                                                          | D-01; X-05                                                   | contract regression tests (to write)                                 |
| LGR-37 | Course certificate issuance requires the final-assessment threshold (BR-048: at least 70 percent), is idempotent (no duplicate evidence or XP), recoverable when evidence persistence fails after completion, and linked certificate and evidence proofs agree on revocation with append-only history (BR-149).                                                                                                                                                                                            | D-09, D-10, X-11                                             | negative and boundary-score API tests, failure injection (to write)  |
| LGR-38 | Reputation visibility (BR-167): `GET reputation/users/:userId` only for the subject, a platform admin, or a recruiter whose organization has an active application from the candidate; others receive 403; stealth candidates are hidden from recruiter listings; recalculation is admin-only; an explicit candidate consent setting is required for browse-without-application (BL-014).                                                                                                                  | PR #57, #58; R2-2                                            | `reputation-visibility.test.ts`                                      |

#### 3.4 Authorization and tenancy

| ID     | Acceptance criterion                                                                                                                                                                                                                                                                                                   | Source                 | Covering test                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| LGR-40 | Job status changes require membership of the job's owning organization (BR-12); draft jobs are not readable by outsiders; organization member roles come from a closed set (no `owner` injection), users must exist, duplicates rejected; admin role update accepts only valid roles.                                  | findings 4, 10, 11     | `core-authz` "tenant isolation on job postings"                                 |
| LGR-41 | Interview assessments are scoped to the hiring team and participants: only they can link an application, score, end, review or join; candidates never receive hidden test inputs or outputs; interview questions are scoped to the organization; scorecards never move an application backwards from a terminal state. | findings 9, 17; PR #57 | `core-authz` "interview assessments are scoped", "a scorecard never resurrects" |
| LGR-42 | A candidate cannot read, transition or list another candidate's application, the applicants of another organization's job, or a thread they are not part of (IDOR). A second recruiter's organization cannot read the first's pipeline.                                                                                | E2E suite C, F2        | `core-authz`; cross-organization IDOR on hiring was a coverage gap              |
| LGR-43 | Admin governance: self-suspend and self-demotion refused; a reason is required; suspension takes effect on the next request; audit entries carry the reason; reactivation works. A suspended user may sign in by design but the session is confined and the UI says the account is restricted.                         | E2E suite C, D         | e2e admin                                                                       |
| LGR-44 | Maintenance mode, when on, answers non-exempt requests with 503 and a user message; named exemptions (admins, health, login) are decided; the toggle has an enforced effect.                                                                                                                                           | E2E M-1                | open                                                                            |
| LGR-45 | Internal routes (`/internal/*`) exist only in development and test.                                                                                                                                                                                                                                                    | finding 15             | `api-security`                                                                  |
| LGR-46 | A non-admin opening the admin area gets a refusal and no admin requests are sent.                                                                                                                                                                                                                                      | E2E D20                | regression R05                                                                  |

#### 3.5 Durability, concurrency and privacy lifecycle

| ID     | Acceptance criterion                                                                                                                                                                                                                                                                                                                                                                                                                                                | Source                      | Covering test                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| LGR-50 | After restart, all core-loop data returns: users, profiles, skills, organizations, memberships, jobs, evidence, applications, work history, references, notifications, sessions and revocations, messaging threads and read positions, settings, export and erasure requests, saved searches and saved jobs. Prior durable set listed in `LEGACY_REPORTS_EVIDENCE_INDEX.md`.                                                                                        | ADR-015; PRs #40-#54        | `tests/pg/*` (core-persistence, notifications, messaging, saved-jobs, saved-searches, work-history-removal, private-data-rls, concurrency) |
| LGR-51 | Concurrent hire and withdraw: exactly one is acknowledged; BR-15 re-apply after withdrawal allowed (partial unique index replaces `UNIQUE(job_id, candidate_id)`); user-record writes carry a base and a database re-check so a stale read cannot restore an old password.                                                                                                                                                                                          | findings 18, 27             | `tests/pg/concurrency.test.ts`                                                                                                             |
| LGR-52 | Impossible dates, 300-character emails and absurd numbers return 422 (SQLSTATE class 22 mapped), not 500; duplicate ids give accurate conflict messages.                                                                                                                                                                                                                                                                                                            | finding 21                  | `core-authz`, `concurrency.test.ts`                                                                                                        |
| LGR-53 | Erasure removes work history, references, evidence, notifications, messages, settings, export records, bookmarks and searches in the database, cancels the person's queued emails (best effort for an email already picked up), survives restart, and is resumable after a partial failure while the account stays closed; the 30-day request/cancel/execute lifecycle runs a scheduler that sets `status = executed` (BL-006) once the policy is ratified.         | findings 16, 28; D-03; X-07 | `core-persistence`, `work-history-removal`, failure injection (to write)                                                                   |
| LGR-54 | A durable store never keeps secrets after use: queue payload secrets are stripped on every terminal transition.                                                                                                                                                                                                                                                                                                                                                     | finding 19                  | `tests/pg/concurrency.test.ts`                                                                                                             |
| LGR-55 | Notifications are written in the same transaction as their cause; the hiring team is told of new applications and withdrawals; the candidate of every pipeline move and of referee responses; text contains no candidate names or private rejection reasons; a bell shows an unread count; mark-all-read persists after reload; erasure deletes the person's notifications; the in-app channel is the only channel until email push exists.                         | finding 25                  | `core-notifications` integration, `tests/pg/notifications.test.ts`, e2e `notifications`                                                    |
| LGR-56 | Messaging: a conversation may start between connected people, or between a recruiter and a candidate after an application; two people share exactly one conversation (simultaneous starts serialized); messages, read positions and each message's notification are durable; opening a conversation marks its message notifications read; erasure deletes the person's messages; a "Message" action exists on an applicant card and a Messages page for both sides. | finding 32                  | `messaging-rules` integration (start rule mutation-checked), `tests/pg/messaging.test.ts`, e2e `messaging`                                 |
| LGR-57 | Two-account runtime RLS validation against a real database for messaging, notifications and preference tables; SQL apostrophe-escape safety; a CI sentinel proves server secrets (`TOKEN_SECRET`, `DATABASE_URL`) are never compiled into the web bundle.                                                                                                                                                                                                           | PRs #41, #42                | `tests/pg/private-data-rls.test.ts`, `tests/security/private-data-rls.test.ts`, `scripts/check-client-secrets.mjs`                         |
| LGR-58 | BYO AI provider keys are encrypted at rest with AES-256-GCM using a separate 64-hex-character key; a plaintext downgrade is refused; the decrypted key is never sent to the client.                                                                                                                                                                                                                                                                                 | PR #51                      | `core-persistence.test.ts`                                                                                                                 |
| LGR-59 | Migrations: strictly sequential numbering (no skips), checksum ledger, missing or duplicate or gapped ledger rejected, clean apply to an empty database and an idempotent second run; a read-only release preflight verifies drift; migration text for `stripe_customers` revokes from `anon`/`authenticated` as well as `PUBLIC`.                                                                                                                                  | PR #52; S-3                 | `scripts/tests/migration-integrity.test.mjs` (5 tests), CI                                                                                 |

#### 3.6 Worker, email and background jobs

| ID     | Acceptance criterion                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Source                          | Covering test                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| LGR-60 | A job kind either performs its effect or fails visibly; kinds that only record an event say so ("event recorded") with the reason; no `notification.push` job exists without a channel.                                                                                                                                                                                                                                                                                                      | finding 34                      | `notifications` integration "queues no push delivery"; dispatch-kind drift guard in `background-jobs` |
| LGR-61 | Email adapter: development logs to a labelled dev outbox; staging and production require `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` and `EMAIL_FROM`; the provider call carries `Idempotency-Key: <jobId>`; 408, 429 and 5xx retry with exponential backoff; permanent 4xx raises a permanent error that ends retries; API endpoints that depend on mail return 503 when unconfigured in staging or production; worker configuration validation refuses incomplete email settings at startup. | PRs #43, #51                    | `production-config.test.ts`, transactional-mail tests                                                 |
| LGR-62 | Worker claims are bounded to execution capacity and acknowledgements are fenced by claim ownership; with six jobs and two workers no job runs twice beyond the bounded rule; a crashed claim recovers; cancellation wins; heartbeat is truthful.                                                                                                                                                                                                                                             | D-02; X-06                      | fake-clock unit test; two-worker PG test (to write)                                                   |
| LGR-63 | The worker records a heartbeat and the API reports queue age and worker health; losing the single-writer lease fails requests closed with 503 (prior design, see lessons LES-32).                                                                                                                                                                                                                                                                                                            | PR #43; ARCHITECTURE_DURABILITY | `tests/pg/core-persistence.test.ts`                                                                   |

#### 3.7 Billing and commerce

| ID     | Acceptance criterion                                                                                                                                                                                                                                                                                                                                                                                      | Source                      | Covering test                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| LGR-70 | No card fields are collected anywhere; paid plans are refused unless billing is enabled; `BILLING_MODE` defaults to `disabled`; simulated mode is refused by production configuration; free-only is an allowed launch decision.                                                                                                                                                                           | finding 6; X-03             | `billing*.test.ts`, e2e `web-ui` pricing                                                                                |
| LGR-71 | Paid access is granted only after a signed provider event is verified (raw body, signature, tolerance) and reconciled; unknown prices grant free entitlements; the redirect page grants nothing.                                                                                                                                                                                                          | PR #71; REPOSITORY_AUDIT §F | `stripe*` unit, integration, pg tests                                                                                   |
| LGR-72 | Billing events are stored durably keyed by `(provider, provider_event_id)` unique, transactionally; replays are recorded once; idempotency keys are scoped per user and compared with the requested plan and cycle (mismatch returns 409).                                                                                                                                                                | P-5; migration 00052        | `tests/pg` billing tests                                                                                                |
| LGR-73 | A subscription scheduled to cancel at period end settles to free on read and on cancel; repeating a period-end cancel is a no-op; immediate cancel remains allowed.                                                                                                                                                                                                                                       | P-3, P-4                    | `billing-domain.test.ts`                                                                                                |
| LGR-74 | Refund policy (owner decision 2026-10-23): a full refund of the charge that paid for the current period ends paid access by cancelling at the provider immediately; a partial refund or a refund of an older charge changes nothing; the cancel runs before the event is recorded so a provider failure makes the provider retry; a replay is recorded once. Dispute and void handling remain a decision. | STRIPE_SUPABASE update      | integration test with fake gateway                                                                                      |
| LGR-75 | Concurrent Checkout sessions: a second paid subscription must not be silently ignored while still billed; auto-cancel or refund is a pricing decision (O-1).                                                                                                                                                                                                                                              | O-1                         | open                                                                                                                    |
| LGR-76 | Erasing a user whose provider customer is already deleted completes; with provider mode off, erasure fails closed or queues operator reconciliation. Erasure removes invoices and billing events.                                                                                                                                                                                                         | S-1; P-6; R2-05             | unit test for `deleteCustomer`; failure test (to write)                                                                 |
| LGR-77 | Entitlements (not the plan tier) gate features; plan role target is enforced; the AI gateway reads the tier from persisted entitlements and persists usage meters.                                                                                                                                                                                                                                        | F-61; SEC-06; BL-010        | `ai-gateway*.test.ts`                                                                                                   |
| LGR-78 | Provider configuration checklist (manual, not code): six `STRIPE_PRICE_*` prices; a webhook endpoint at `/api/v1/billing/stripe-webhook` subscribed to `checkout.session.completed`, `customer.subscription.created                                                                                                                                                                                       | updated                     | deleted`, `invoice.paid`, `invoice.payment_failed`; a Customer Portal configuration; billing stays disabled until done. | STRIPE_SUPABASE | LRG gates |

#### 3.8 AI governance

| ID     | Acceptance criterion                                                                                                                                                                                                                     | Source                   | Covering test                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------- |
| LGR-80 | `AI_PROHIBITED` is consulted at every AI entry point (prior: the assistant query and career-assistant chat), reads active assessment sessions from durable storage and rejects with `403 ASSESSMENT_AI_PROHIBITED` even after a restart. | SEC-05; BL-009           | `injection-defenses.test.ts` "AI_PROHIBITED" |
| LGR-81 | AI quotas by tier (free 5,000 tokens and 20 requests per day, pro 100,000 and 500, enterprise 1,000,000 and 5,000); free-user spend is policy-gated; consumer AI subscriptions confer no API rights; usage meters persist.               | SEC-06; FINAL_VALIDATION | `ai-gateway-domain.test.ts`                  |

### 4. Adversarial regression acceptance (from the 227-check browser and API audit)

| ID     | Acceptance criterion                                                                                                                                                                     | Evidence in the prior attempt                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| LGR-90 | Public routes, 404, protected-route redirects and malformed ids behave (18 of 18 checks).                                                                                                | Suite A                                              |
| LGR-91 | Sign-up and login validation, enumeration resistance (same message for wrong password and unknown user), XSS in name, open redirect, double submit, session, logout.                     | Suite B (18 of 20 passed; 2 defects: weak passwords) |
| LGR-92 | API authorization: admin routes 401 unauthenticated and 403 for candidates and recruiters; token tampering; privilege escalation; IDOR; headers; CORS; payload limits; admin governance. | Suite C (52 of 53; open: no CSP header)              |
| LGR-93 | Admin console in the browser: user search, suspend or reactivate, role changes, audit log, health, maintenance.                                                                          | Suite D                                              |
| LGR-94 | Candidate flows: jobs, apply, withdraw, profile, password, settings, portfolio, resumes, network, learning.                                                                              | Suites E, E2                                         |
| LGR-95 | Recruiter: post job validation, publish, XSS in titles, two-tab race; cross-user pipeline: apply, review, reject, notifications.                                                         | Suites F, F2                                         |
| LGR-96 | Resilience: 500, bad bodies, timeout, offline, revoked and expired sessions.                                                                                                             | Suite G                                              |
| LGR-97 | Mobile (390x844), keyboard, labels, headings, focus, zoom, color scheme.                                                                                                                 | Suite H                                              |
| LGR-98 | Work history, network, messaging (IDOR, XSS), learning.                                                                                                                                  | Suites I, I2                                         |
| LGR-99 | Regression suite R: every fixed defect has a named regression check (13 of 13).                                                                                                          | Suite R                                              |

**Not covered by the prior audit (must be covered in the target):** rate-limit and lockout behavior with production limits; Postgres-mode end to end; real email (codes, digests), payments (checkout only rendered), file upload and resume export, certificate verification, reference-giving with a real token, interview and API-only features; browsers other than Chromium and real devices; screen-reader behavior beyond labels, headings, focus trap and visibility; a second recruiter's organization (cross-organization IDOR on hiring) and large datasets or pagination; session expiry by TTL; skip link as first Tab stop on a signed-in page; a Reticle verdict for F-17.

### 5. Founder corrections and corpus facts recorded in the reports

From `FINAL_VALIDATION_REPORT.md` v6.0 ("Founder corrections applied"). These are statements of intent in the prior attempt, kept as inputs; the target's ADR register decides which stand.

1. The application API is the browser mutation boundary.
2. A modular monolith is the starting architecture; the shared kernel is narrowed.
3. The AI Gateway is foundational; assessment AI policy is inherited server-side; free-user AI spend is policy-gated; a consumer AI subscription is not assumed to confer API rights.
4. Realtime is advisory, never business truth.
5. Queues plus workers are the initial async design (prior text: Supabase Queues).
6. Search, cache and service extraction are measurement-gated.
7. Sensitive analytics use configurable privacy thresholds: k at least 10 default for public or sensitive small cells, at least 20 for career benchmarks (BR-160), at least 30 for learning-impact correlations (BR-189).
8. Credential portability targets stable W3C VCDM 2.0 semantics; draft VCDM 2.1 is monitored, not required.
9. Production readiness remains an executable evidence gate.

External basis claimed as checked: Supabase RLS/grants guidance, Supabase Queues and Edge Functions, WCAG 2.2 AA in the web shell and tokens, W3C VCDM 2.0/2.1 status, India DPDP Rules and GDPR Article 17 erasure with a 30-day grace period.

**Corpus counts in the prior registries (for scope sizing):** 173 unique feature ids (F-01 to F-173, zero duplicate headings), 28 canonical journeys (J-01 to J-28), 66 workflows declared, 248 business rules (BR-001 to BR-248), 8 migration rules, 100 UX micro-interactions. Severity rubric: Critical, High, Medium, Low (E2E audit); P0 to P3 elsewhere.

### 6. Release backlog BL-001 to BL-018 (Given / When / Then)

Source: `RELEASE_SCOPE_AND_BACKLOG.md` (2026-10-22, HEAD `83dc7d24`). Urgency P0 blocker, P1 critical, P2 high, P3 medium. Verifying tests are the prior attempt's commands, kept as test-design pointers.

| ID     | Item (traces)                                                                                                                                                     | Acceptance criteria                                                                                                                                                                                                                                                                                         | Verifying test (prior)                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| BL-001 | **P0** Corporate-email challenge keyed hash (SEC-01, issue "email", F-94). As a security engineer I want OTP codes hashed with HMAC-SHA256 using a server secret. | Given a candidate requests corporate email verification for work history W; when the 6-digit OTP is stored in `work_history_email_challenges`; then `code_hash` is `createHmac('sha256', TOKEN_SECRET).update(workHistoryId:code)`; and raw `sha256(id:code)` without a server secret is not used anywhere. | `work-history-graph.test.ts`, `injection-defenses.test.ts`                                    |
| BL-002 | **P0** Referee token TTL (SEC-02, F-58, F-94).                                                                                                                    | Given a reference request with a 128-bit token; when the record is created in `employment_references`; then `expires_at` is `now() + 30 days`; and a lookup or submit after expiry is rejected `410 GONE` (`reference_voucher_expired`).                                                                    | `work-history-graph.test.ts -t "voucher expiration"`, `tests/pg/work-history-removal.test.ts` |
| BL-003 | **P0** Transactional email staging DNS and provider configuration (issue "email", F-94).                                                                          | Given staging config; when the API boots with `NODE_ENV=production`; then `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` validate; and the worker dispatches a live test email with valid DKIM alignment (SPF, DKIM, DMARC).                                                                       | `production-config.test.ts`; staging live test script                                         |
| BL-004 | **P0** Legal Terms and Privacy Policy review (issue "privacy", F-15).                                                                                             | Given the legal pages; when audited against GDPR, CCPA/CPRA and India DPDP; then formal legal approval is recorded in a governance record; and privacy and security mailboxes are active.                                                                                                                   | e2e `frontend-fixes` FE-02                                                                    |
| BL-005 | **P0** Reverse proxy root health route (OPS-02, PR #55).                                                                                                          | Given the proxy config; when GET `https://SITE/health`; then it proxies to the API and returns JSON `{"status":"ok"}` with 200 rather than static `index.html`.                                                                                                                                             | `curl` on staging                                                                             |
| BL-006 | **P1** Scheduled erasure after the 30-day grace period (issue "erasure", F-15).                                                                                   | Given an erasure request with `status: pending` and `scheduled_for <= now()`; when the scheduled worker runs; then due erasures purge work history, references, applications, messages and account, and set `status = executed`.                                                                            | `tests/pg/core-persistence.test.ts -t "erasure"`, `worker-queue.test.ts`                      |
| BL-007 | **P1** Fix the security test script (toolchain).                                                                                                                  | Given the test script; when `test:security` runs; then it invokes `vitest run tests/security` (no `--dir`) and exits 0 across all 5 security files.                                                                                                                                                         | `pnpm test:security`                                                                          |
| BL-008 | **P1** Ignore committed caches and agent folders in lint.                                                                                                         | Given the lint ignore file; when `graphify-out/` and `.agents/` are added; then `pnpm lint` exits 0.                                                                                                                                                                                                        | `pnpm lint`                                                                                   |
| BL-009 | **P1** Persist active assessment sessions (SEC-05, F-08, F-11).                                                                                                   | Given a candidate starts an assessment with `AI_PROHIBITED`; when the session is created; then it is written to `assessment_sessions`; and after an API restart the AI assistant call is rejected `403 ASSESSMENT_AI_PROHIBITED`.                                                                           | `injection-defenses.test.ts -t "AI_PROHIBITED"`, pg "assessment session restart"              |
| BL-010 | **P1** AI gateway tier and metering (SEC-06, F-11, F-16).                                                                                                         | Given a user with an active pro subscription; when POST career-assistant chat; then `userTier` resolves to `pro` from entitlements; and daily meters persist in `ai_usage_meters`.                                                                                                                          | `ai-gateway-domain.test.ts`, `ai-gateway.test.ts`                                             |
| BL-011 | **P2** Durable challenges and arena (F-08, issue "durability").                                                                                                   | Given a challenge submission; when evaluation completes; then writes pass through the persistence layer into `challenge_submissions` and `xp_transactions`; and the durability header is not `ephemeral`.                                                                                                   | pg "challenges durability"                                                                    |
| BL-012 | **P2** Wire the assessments page to the backend (F-08).                                                                                                           | Given a candidate on `/assessments`; when the page loads; then it fetches `GET /challenges`; and submitting code dispatches `POST /challenges/:id/submit` and displays verified test results.                                                                                                               | e2e `core-loop`                                                                               |
| BL-013 | **P2** Durable LMS courses and progression (F-07).                                                                                                                | Given an enrollment; when `POST /lessons/:id/progress`; then the record commits to `lesson_progress`; and certificates are written to `course_certificates`.                                                                                                                                                | pg "lms durability"                                                                           |
| BL-014 | **P2** Candidate reputation visibility consent (BR-167, F-144).                                                                                                   | Given candidate settings; when toggling "Allow verified recruiters to view reputation"; then `user_settings.reputation_visibility` updates; and `GET reputation/users/:userId` allows authorized recruiters when consent is granted.                                                                        | `reputation-visibility.test.ts`                                                               |
| BL-015 | **P2** Application draft autosave to the database (F-36).                                                                                                         | Given a candidate editing an application; when input changes (prior: every 30 seconds); then the draft is written to `application_drafts`; and reopening the job restores it.                                                                                                                               | pg "application drafts"                                                                       |
| BL-016 | **P3** Stripe Checkout and subscription lifecycle (issue "payment", F-16).                                                                                        | Given `BILLING_MODE=stripe` and a valid secret key; when a recruiter selects Pro; then a Checkout Session is created; and on `checkout.session.completed` the subscription activates.                                                                                                                       | `billing.test.ts`                                                                             |
| BL-017 | **P3** Containerized code-execution sandbox (issue "interview sandbox", F-88).                                                                                    | Given `POST /interviews/execute-code`; when executed; then the runner uses a container with a seccomp profile, zero network egress, a 128 MB memory cap and a 5-second CPU timeout; and stdout, stderr and exit code return to the API.                                                                     | `technical-interview.test.ts`                                                                 |
| BL-018 | **P3** Image pruning (OPS-01 as labelled there).                                                                                                                  | Given the production Dockerfile; when the image is built; then the runtime stage copies only compiled output and production dependencies, no test runner or compiler; and the image is below 250 MB.                                                                                                        | `docker images`                                                                               |

**Feature scope boundary of the 10-22 report (GA core loop):** F-01, F-03, F-12, F-15, F-60, F-65, F-80 (identity); F-84, F-96, F-173 (taxonomy and evidence); F-58, F-94, F-162 (proof of control); F-04, F-05, F-06, F-25, F-32, F-56, F-102, F-117 (jobs and hiring); F-10, F-14, F-29 (communication); F-02, F-21 (platform). Deferred: F-81, F-163, F-110, F-123, F-89, F-146, F-36, F-37, F-104, F-142, F-33, F-53, F-55, F-07, F-08, F-16, F-17. The 10-21 audit proposed a **different** beta subset (section 8) because it rated several of these features partial.

### 7. Cross-cutting delivery packets X-00 to X-11 and stories

Source: `FEATURE_PLAN_2026-10-21.md` sections G to L. Estimates are uncertainty classes, not dates.

| ID   | Outcome                                                                          | Feature ids / score                                   | Urgency                                    | Depends on                                                          | Estimate / risk                | Acceptance                                                                                                                                                                                                                                                                                                                                                                                                 | Evidence                                                                                                                                               |
| ---- | -------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| X-00 | Exact-source baseline, atomic contracts reconciled, launch scope approved        | All                                                   | P0                                         | Owner scope; permitted verification environment                     | M, high uncertainty            | Given a chosen release, every included subfeature has role, boundary, rule, failure and recovery acceptance and an evidence owner; the source or build SHA and baseline results are recorded; unreviewed rules remain unaccepted                                                                                                                                                                           | Ledger completeness and link checks; root CI, isolated PG and browser                                                                                  |
| X-01 | Persist one selected user journey per slice; no blanket migration                | BL-F-07, 09, 26, 32, 36, 84 and other admitted slices | P1 (P0 if a durable promise is made)       | X-00; ADR/schema gate X-08                                          | M per slice, L combined        | Given two users, one creates or updates, then API and worker restart: only authorized data returns; concurrent duplicates arbitrate; erasure removes it; the UI makes remaining preview limits explicit                                                                                                                                                                                                    | PG physical-row, restart, race, isolation, erasure tests; API negative cases; browser verdict                                                          |
| X-02 | Real verification delivery through the existing mail adapter                     | F-94 (7), F-162 (5)                                   | P0                                         | Provider, sender and cost approval, secrets, X-06                   | M, external uncertainty        | Given an approved staging sender, the mailbox receives the code or referee link; token is absent from requester and logs, expires, is single-use; retries preserve idempotency; failure raises a monitored alert                                                                                                                                                                                           | Transactional-mail and authz tests plus a live mailbox and queue drill                                                                                 |
| X-03 | Record the commercial decision and enforce it                                    | F-16 (7), F-61 (4)                                    | P1 decision                                | Owner decision; OD-34 if premium                                    | S decision, paid integration L | Free-only: paid activation consistently unavailable in UI and API. Paid: approved provider, durable replay-safe payment, entitlement, cancel, refund; no invented card storage                                                                                                                                                                                                                             | Billing negative and security tests; provider sandbox only after approval                                                                              |
| X-04 | Optional offline shell with truthful sensitive-data boundaries                   | Cross-cutting                                         | P2                                         | Offline scope; explicit build-config approval                       | M                              | Network-off shell works; sensitive API decisions stay server-authoritative; logout clears applicable private cache; failed writes never falsely succeed                                                                                                                                                                                                                                                    | Real browser offline, reconnect, logout; cache inspection                                                                                              |
| X-05 | Honest submission-only challenge semantics or approved isolated execution        | F-08 (9), F-88 (9)                                    | P0                                         | D-01; trust policy                                                  | S fail-closed, L executor      | Arbitrary or wrong text never claims verified execution or a genuine pass; evidence stays pending or unverified; assessment policy stays enforced; retries mint no duplicate evidence                                                                                                                                                                                                                      | Domain and API contract regressions; UI outcome; adversarial sandbox suite only if an executor is approved                                             |
| X-06 | Bound job claims to capacity and fence stale acknowledgements                    | Supports F-94, F-14                                   | P0                                         | D-02; operations coordination                                       | M                              | With two workers and a slow batch, expired owners cannot complete newer claims; unfinished jobs recover after a crash; cancellation wins; mailbox idempotency preserved; heartbeat truthful                                                                                                                                                                                                                | Fake-clock unit regression, real PG two-worker and kill test, mail retry and cancel tests                                                              |
| X-07 | Approved, recoverable erasure and privacy lifecycle                              | F-15 (10)                                             | P0                                         | Policy and legal decisions; D-03; X-08                              | M/L, high                      | Failure after core deactivation: cleanup resumes without user login; status records completion; request, cancel and due behavior match policy; shared data and backups have explicit retention                                                                                                                                                                                                             | Failure injection at each store boundary, restart and idempotency tests, closed-session tests, browser request and cancel, restore and redaction drill |
| X-08 | Ratify the persistence design and rehearse populated migration and hosted access | Core features                                         | P0 before any target upgrade               | Owner approval; isolated snapshot; target role model                | M, high data uncertainty       | Migration ledger rejects drift; duplicate case-folded emails and active applications resolved by approved policy; target grants and RLS deny cross-account reads; rollback and restore exercised                                                                                                                                                                                                           | Migration guard, PG suite, read-only preflight, populated upgrade and recovery record                                                                  |
| X-09 | Prove operations and release acceptance                                          | All in scope                                          | P0 gate                                    | X-02, X-07, X-08; authorized host and secrets; approved RPO and RTO | L, split by drill              | One writer enforced (if relevant); HTTPS and proxy correct; worker-kill and queue-age alerts observed; backup restored independently; smoke passes on the restored app; measured load and cold boot accepted; rollback and go/no-go signed                                                                                                                                                                 | Exact-SHA CI, staging browser and API, live drills, latency, boot and memory evidence; no fictitious SLOs                                              |
| X-10 | Verification fails honestly; formatting gate restored                            | All; D-07, D-08                                       | P1 scan, P2 format                         | Scope of pre-existing edits                                         | S                              | A scanner detects a synthetic secret and fails on scanner error on Windows and Linux; a bounded format change passes intended checks; no coverage weakened                                                                                                                                                                                                                                                 | Focused scanner tests and a read-only format check                                                                                                     |
| X-11 | Course completion trust and recoverable issuance                                 | F-07, F-52                                            | P0 before assessed credentials are exposed | D-09, D-10, BR-048, BR-149, X-00, X-01                              | M/L                            | Absent or failed attempts cannot issue a credential; an eligible passing attempt issues once; repeated requests cannot duplicate evidence or XP; failure between completion and evidence or certificate writes is recoverable; restart preserves completion and public verification truth; linked proofs agree on revocation with append-only history and no accidental revocation of independent evidence | Negative and boundary-score tests, failure injection, concurrent retry, PG restart, browser completion and public verification                         |

**Ready stories proposed for first engineering review (FEATURE_PLAN G).**

| Story                                  | Included / excluded                                                              | Given / When / Then                                                                                                                                              | Sequence                                                                                                                                                                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X-05a honest challenge submission      | Shared result contract, API consumers, tests; no sandbox                         | Given a valid session and non-executable text; when submitted; then return a submission-only, unverified outcome without a real score                            | Find every caller of the submission result, agree the bounded contract, change domain, API and UI together, negative and retry tests, browser outcome; preserve arbitrary-language validation and the AI prohibition                                 |
| X-06a safe claim capacity              | Runner and store claim ownership and cancel; no queue replacement                | Given a batch slower than its lease and a second worker; when work is reclaimed; then the old owner cannot execute or acknowledge it                             | Reproduce the six-job case with a controlled clock, smallest capacity and lease fix, claim-token fencing if needed, PG dual-worker and crash or cancel test, live mail retry; a single batch-size change does not prove generic timeout cancellation |
| X-07a resumable cleanup                | Durable completion and retry of existing stages; no new retention policy         | Given core erasure commits and the next store fails; when recovery runs; then cleanup completes while the account stays inaccessible and status is accurate      | Decide transaction versus persisted workflow, fault injection, atomic or resumable implementation, restart and operator recovery, approved privacy copy                                                                                              |
| BL-F-32a saved-search alert completion | Reuse SQL search and bookmark stores; alert state and chosen UI; no email digest | Given a saved search; when an eligible job publishes; then the owner sees one durable alert after restart and another user cannot read it                        | Confirm scope, inspect publish and matching calls, scoped persistence, UI list and recovery, duplicate publish, restart, isolation and erasure tests, browser verdict                                                                                |
| BL-F-07a durable lesson progression    | One enrollment, lesson, progress path; no quiz engine, commerce or marketplace   | Given an enrolled learner; when a sequential lesson completes and the API restarts; then progress persists and unauthorized or out-of-order completion is denied | Reuse the course page, persist exact entities, API and domain tests, PG constraints and races, browser reload plus process restart                                                                                                                   |

**Definition of Ready.** Approved user outcome and included and excluded subfeatures; accountable role; exact API, domain and storage boundary; prerequisite decisions; observable positive, denied and recovery criteria; migration and rollback impact; estimate with uncertainty; available verification environment. "API exists, add UI" is not automatically Ready.

**Definition of Done.** All agreed acceptance passes across affected layers; authorization, privacy and evidence rules preserved; PG durability, race and erasure checks where relevant; browser journey and an in-app verification verdict for visible changes; loading, empty, error and retry behavior; no regression in selected core flows; lint, types, build and CI pass in an authorized environment; docs and status updated with command, commit and date; operations and rollback evidence; no unresolved critical defect. `unknown`, `no-fault`, a test title or code presence is not a pass. Release-level addition (REPOSITORY_AUDIT M): reviewed minimal diff, no protected-file edits or leaked secrets, role-boundary, negative, retry and idempotency tests, main green and manual runtime proof for UI changes, schema migration and rollback sign-off for database work, deferred gaps documented.

**Earlier foundation packets X-01 to X-04 (superseded wording of the first 2026-10-21 plan, kept because their "done when" sentences are acceptance criteria).** X-01 durable storage for in-memory modules (P0): move every route outside the durable set behind the persistence path with its own tables, list routes in the durability module, add database tests; done when, after an API restart, data created before it is still there for each migrated module. X-02 real email delivery (P0): replace the development outbox with a provider adapter configured by environment variables, with templates for verification codes, notifications and digests; done when a verification code arrives in a real test inbox from staging and a fake-provider test covers the adapter. X-03 payment provider decision and billing wiring (P1): the owner chooses a provider; until then keep simulated billing with a visible "simulated" label; after the choice add the adapter and webhook signature checks; done when the decision is recorded, the simulated flow works end to end and the real flow passes sandbox tests. X-04 offline app shell (P2): precache the app shell and recently viewed pages with a service worker and only then describe the app as offline-capable; done when, with the network off, the dashboard shell loads and shows a clear offline message. The first plan also listed "already built, keep, do not rebuild" 16 features (F-01, 02, 03, 04, 05, 06, 09, 10, 12, 14, 15, 20, 25, 26, 94, 162) and parked F-38, F-39, F-62, F-63.

**Always-working quality strategy (FEATURE_PLAN J).** Loop: understand, search callers, contracts and tests, plan a bounded increment, change the shared root cause, run focused tests, verify the real flow, run an appropriate regression, review, document, report; finish and verify each feature before starting a dependent one; a failing integration stops dependent work; never weaken or delete checks to turn a dashboard green.

| Gate                                | Mechanism in the prior attempt                                                          | Required improvement noted there                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Static, format, types               | Prettier check, TypeScript project references, non-emitting substitutes                 | Resolve baseline formatting; no evidence for replacing tooling              |
| Domain, API, security               | Vitest; production-config and authorization regressions                                 | Add D-01, D-02, D-03 cases; portable fail-closed scanner                    |
| Database                            | CI Postgres service, migrations applied twice, ledger guard, schema preflight, PG tests | Add populated upgrade and rollback and hosted role evidence                 |
| Browser, accessibility, performance | Playwright on built API and web                                                         | Source-matched build; manual contrast and screen-reader gaps; measured SLOs |
| Client secrets                      | CI sentinel build and scan; source check                                                | Fix Windows false green                                                     |
| Operations                          | Writer lock, worker heartbeat, preflight, backup and restore scripts                    | Execute drills; monitor externally; fix lease fencing                       |
| Release                             | CI plus release checklist                                                               | Attach exact-SHA acceptance and owner decision                              |

### 8. Release scope options and the beta subset proposed on 2026-10-21

| Option                         | Value                                                                                                                               | Tradeoff                                                                                                        | Disposition then                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Restricted trusted-career beta | Identity, profile and evidence, mailbox and reference proof, jobs, apply, recruiter review, outcome, messaging and account controls | Learning, proof and career portions of full GA remain incomplete; must be labelled beta and approved            | Recommended first; owner decision pending    |
| Full PRD career-loop GA        | Adds dependable learning, practice, portfolio, proof and career progression                                                         | Needs persistence and assessment-trust work plus outcome acceptance                                             | Follow beta; keep PRD section 8 requirements |
| Broad portfolio launch         | More surface                                                                                                                        | The 173-feature inventory is not a coherent first increment; magnifies durability, provider and governance risk | Not recommended                              |

Proposed beta subsets (relevant parts of): F-01, 02, 03, 04, 05, 06, 10, 12, 14, 15, 17, 20, 21, 24, 25, 32, 35, 52, 56, 60, 84, 94, 96, 162 (24 features, "Proposed beta"). Needed for full-loop GA (9 features, "Proposed GA"): F-07, 08, 26, 85, 91, 95, 106, 122, 145. Decision gates (12): F-11, 16, 33, 45, 61, 88, 93, 99, 154, 159, 165, 168. Excluded (4): F-38, 39 (deprecated), F-62, 63 (not recommended). Deferred (124): everything else, "Expansion; unscheduled". Preview-only screens (networking, learning, assessment, career) must not be silently deleted: decide to restrict access or communicate durability and assessment limits, with an impact review and full-flow verification. Proctoring, premium-candidate policies and candidate-level predictive decisions keep their gates.

### 9. The 173-feature register of the prior attempt, with dependencies and candidate acceptance

**What this is.** A compact join of three archived sources: the `features` array of `AUDIT_EVIDENCE_2026-10-21.json` (173 records), the build-order and backlog tables of `FEATURE_PLAN_2026-10-21.md` (wave and order) and the 173-row matrix of `FEATURE_TRACEABILITY_MATRIX.md` (2026-10-22). It was produced by a script that reads those files unchanged, so every cell traces to a source cell. The JSON keeps the longer text (actual behavior, reference candidates, test evidence, ten maturity dimensions per feature), which stays archived; the expected-behavior sentence of each feature is reproduced in section 9.1.

**It is a register of the earlier attempt's claims, not a target feature list.** The target feature list is in `04_PRODUCT_CAPABILITIES` and `05_FEATURE_SPECIFICATIONS`. Use this register to check that no prior feature, dependency edge or candidate acceptance statement is missing from the target, and to see which prior features were judged absent, partial, broken or excluded.

**Columns.**

- _Reg. score / phase_: the prior registry's value score (0 to 10) and phase (Ph0 to Ph10); not urgency.
- _Registry dependencies_: the registry's edges as recorded. The reports warn that these are not necessarily hard runtime blockers (for example F-94 lists F-58 written recommendations although work-history verification existed without it), and that registry cycles (skills, learning and assessment depend on each other) need interpretation, not automatic topological sorting.
- _Status 2026-10-21 (earlier static)_: the stricter status of `FEATURE_STATUS_2026-10-21.md` with the earlier static assessment of the same day in brackets (Implemented, Partial, Not started and so on). Vocabulary: Impl-unverified = implemented but unverified; Partial = partially implemented; Not impl = no matching code found by a search-limited scan (a checklist to confirm with the owner, not proof of absence); BROKEN = broken or regressed; Excluded = deprecated or not recommended by the registry.
- _Matrix 2026-10-22_: the traceability matrix's status (Full, Partial, Missing, Stub) and durability (Durable, Ephemeral, Stateless, N/A). It disagrees with the previous column on many rows (lessons file LES-06).
- _Delivery / stage_: delivery urgency P0 to P3 and the release stage proposed on 2026-10-21 (Proposed beta, Proposed GA, Decision gate, Expansion; unscheduled, Excluded).
- _Wave / order_: the historical plan's wave (count of not-yet-started dependencies above the feature; W0 can start now) and build order number, for the 153 features still to build or finish.
- _External dependency_: an external condition recorded in the JSON (owner decision on provider, policy, entitlement or consequential logic; email provider and live delivery evidence).
- _Candidate acceptance_: the feature-specific sentence from the plan. Where the plan used its generic sentence it is abbreviated; the generic sentence is: "Given an authorized actor and approved contract, when the complete journey and its denied/recovery cases run, then outcomes match the contract and survive required restarts."

**Counts (2026-10-21 audit).** Partially implemented 87, Implemented but unverified 6 (F-02, F-03, F-10, F-14, F-20, F-25), Broken or regressed 1 (F-08), Not implemented 75, Deprecated or rejected 4 (F-38, F-39, F-62, F-63); total 173; zero features certified implemented-and-verified. Delivery urgency: P0 3 (F-08, F-15, F-94), P1 30, P2 53, P3 83, not applicable 4. Release stage: Proposed beta 24, Proposed GA 9, Decision gate 12, Expansion 124, Excluded 4. Earlier static assessment of the same day (kept as history in the report): Implemented 16, Partial 78, Not started 75, Deprecated 2, Not recommended 2. Traceability matrix 2026-10-22: Full 26, Partial 91, Stub or mock 6, Missing 50. Historical plan counts by registry-derived tier: P0 16, P1 45, P2 53, P3 39; by wave: W0 117, W1 29, W2 6, W3 1.

The 14 external-dependency rows are F-11, 16, 33, 45, 61, 88, 93, 99, 154, 159, 165, 168 (owner decision) and F-94, F-162 (email provider and live delivery evidence).

| ID    | Feature (category)                                          | Reg. score / phase | Registry dependencies   | Status 2026-10-21 (earlier static) | Matrix 2026-10-22     | Delivery / stage            | Wave / order | External dependency                                                   | Candidate acceptance                                                                                          |
| ----- | ----------------------------------------------------------- | ------------------ | ----------------------- | ---------------------------------- | --------------------- | --------------------------- | ------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| F-01  | Authentication & Session (Identity)                         | 10 / Ph0           | –                       | Partial (Implemented)              | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-02  | Landing Page (Shell)                                        | 3 / Ph0            | –                       | Impl-unverified (Implemented)      | Full / Stateless      | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-03  | Dashboard (Role-Adaptive) (Shell)                           | 10 / Ph0           | F-01                    | Impl-unverified (Implemented)      | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-04  | Job Marketplace (Marketplace)                               | 9 / Ph2            | F-01, F-12              | Partial (Implemented)              | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-05  | Post Job Studio (Marketplace)                               | 8 / Ph2            | F-04                    | Partial (Implemented)              | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-06  | ATS / Candidate Pipeline (Recruiting)                       | 9 / Ph2–3          | F-04, F-05              | Partial (Implemented)              | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-07  | Learning Management System (Learning)                       | 9 / Ph1            | F-01, F-12              | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed GA            | W0 / #5      | -                                                                     | A learner completes a lesson in the UI and the progress bar and server agree after a reload.                  |
| F-08  | Challenges Arena (Assessment)                               | 9 / Ph1            | F-01, F-12              | BROKEN (Partial)                   | Partial / Ephemeral   | P0 / Proposed GA            | W0 / #6      | -                                                                     | A candidate starts a challenge, submits code and sees a stored score.                                         |
| F-09  | Professional Networking (Social)                            | 8 / Ph2            | F-12                    | Partial (Implemented)              | Partial / Ephemeral   | P2 / Expansion; unscheduled | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-10  | Direct Messaging (Communication)                            | 10 / Ph0           | F-01                    | Impl-unverified (Implemented)      | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-11  | AI Career Assistant (Basic) (AI)                            | 8 / Ph1/Ph4        | F-12                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Decision gate          | W0 / #26     | Owner decision for provider/policy/entitlement or consequential logic | A candidate asks a question, gets an answer, and sees usage go up.                                            |
| F-12  | Profile Management (Identity)                               | 10 / Ph0           | F-01                    | Partial (Implemented)              | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-13  | Resume Builder (Identity)                                   | 7 / Ph1            | F-12                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #31     | -                                                                     | A candidate edits a resume section, exports it, and the export contains the edit.                             |
| F-14  | Notification Center (Communication)                         | 10 / Ph0           | F-01                    | Impl-unverified (Implemented)      | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-15  | Settings (Shell)                                            | 10 / Ph0           | F-01                    | Partial (Implemented)              | Full / Durable        | P0 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-16  | Billing & Subscriptions (Monetization)                      | 7 / Ph5            | F-01                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Decision gate          | W0 / #48     | Owner decision for provider/policy/entitlement or consequential logic | A user subscribes in simulated mode, sees the plan change, and sees an invoice.                               |
| F-17  | Admin Console (Governance)                                  | 10 / Ph0           | F-01                    | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed beta          | W0 / #1      | -                                                                     | An admin suspends a test user, the user is blocked, and the audit log shows the action.                       |
| F-18  | Chrome Extension Companion (Edge)                           | 5 / Ph2            | F-01                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #79     | -                                                                     | Installed extension shows the user's name after sign-in and can open the dashboard.                           |
| F-19  | Product Analytics (Telemetry)                               | 7 / Ph1            | F-01                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #32     | -                                                                     | After applying to a job, the KPI screen counts one more application.                                          |
| F-20  | Command Search (⌘K) (Shell)                                 | 7 / Ph2            | F-01                    | Impl-unverified (Implemented)      | Partial / Ephemeral   | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-21  | Error Recovery & Resilience (Shell)                         | 10 / Ph0           | F-01                    | Partial (Partial)                  | Full / Durable        | P1 / Proposed beta          | W0 / #2      | -                                                                     | Turning the API off shows a retry message on each page, and retry works when it comes back.                   |
| F-22  | Gamification & XP Ledger (Engagement)                       | 8 / Ph1            | F-07, F-08              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #16     | -                                                                     | Completing a tracked action raises the XP shown on the dashboard.                                             |
| F-23  | Leaderboard & Badges (Engagement)                           | 7 / Ph2            | F-22                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #34     | -                                                                     | A user with XP appears on the leaderboard and sees their badges.                                              |
| F-24  | Trust, Safety & Moderation (Safety)                         | 8 / Ph2            | F-01                    | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed beta          | W0 / #17     | -                                                                     | A report filed in the UI appears in the admin queue and can be resolved.                                      |
| F-25  | Job Detail View (Marketplace)                               | 7 / Ph2            | F-04                    | Impl-unverified (Implemented)      | Full / Durable        | P1 / Proposed beta          | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-26  | Portfolio Showcase (Identity)                               | 8 / Ph1            | F-12                    | Partial (Implemented)              | Partial / Ephemeral   | P1 / Proposed GA            | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-27  | Local Resume Match Preview (Edge)                           | 6 / Ph2            | F-18                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #125    | -                                                                     | On a job page, the extension shows a match score and the matching skills.                                     |
| F-28  | External Job Page Scanner (Edge)                            | 6 / Ph2            | F-18                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #126    | -                                                                     | On a job posting page, the extension shows a "save to TalentSphere" button that creates a saved job.          |
| F-29  | Scheduled Notification Digest (Communication)               | 7 / Ph2            | F-14                    | Partial (Partial)                  | Full / Durable        | P2 / Expansion; unscheduled | W0 / #35     | -                                                                     | A test user receives one digest email at the chosen frequency.                                                |
| F-30  | Networking Stale-Request Nudges (Engagement)                | 6 / Ph2            | F-09                    | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #63     | -                                                                     | A request left pending for the set time creates one nudge notification.                                       |
| F-31  | KPI Aggregation & Rollups (Analytics)                       | 6 / Ph2            | F-19                    | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #53     | -                                                                     | The KPI screen shows yesterday's counts, equal to a manual count of the events.                               |
| F-32  | Saved Searches & Job Alerts (Candidate)                     | 7 / Ph2            | F-04                    | Partial (Partial)                  | Full / Durable        | P1 / Proposed beta          | W0 / #36     | -                                                                     | A candidate saves a search, a matching job is published, and an alert appears.                                |
| F-33  | Video Interview Rooms (Communication)                       | 8 / Ph3            | F-10                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Decision gate          | W0 / #18     | Owner decision for provider/policy/entitlement or consequential logic | Both parties join a test session and the consent is recorded.                                                 |
| F-34  | Multi-Entity Backend Search (Platform)                      | 7 / Ph2            | F-04, F-07              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #37     | -                                                                     | Typing a job title in the palette shows matching jobs.                                                        |
| F-35  | Feature Flag Console (Administration)                       | 6 / Ph2            | F-17                    | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed beta          | W0 / #54     | -                                                                     | An admin turns a flag on, the flag changes for the next request, and the audit log records it.                |
| F-36  | Application Draft Autosave (Candidate)                      | 7 / Ph1            | F-04                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #33     | -                                                                     | A candidate types a note, reloads, and the note is still there.                                               |
| F-37  | Job Templates (Recruiting)                                  | 6 / Ph2            | F-05                    | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #55     | -                                                                     | A recruiter creates a job from a saved template.                                                              |
| F-38  | Legacy Chat Service (DEPRECATED) (Communication)            | 0 / –              | –                       | Excluded (Deprecated)              | Stub/Mock / N/A       | N/A / Excluded              | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-39  | Unified Backend Stub (DEPRECATED) (Platform)                | 0 / –              | –                       | Excluded (Deprecated)              | Stub/Mock / N/A       | N/A / Excluded              | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-40  | Institutional Managed Learning (Institutions)               | 8 / Ph3            | F-01, F-07              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #19     | -                                                                     | An institution admin enrols two members in a course and both see it.                                          |
| F-41  | Procurement & Seat Licensing (Institutions)                 | 6 / Ph6            | F-40, F-16              | Not impl (Not started)             | Partial / Stateless   | P3 / Expansion; unscheduled | W0 / #67     | -                                                                     | An institution with 10 seats can assign 10 members and not an eleventh.                                       |
| F-42  | Provider-Agnostic Media Engine (Platform)                   | 8 / Ph2            | F-07                    | Not impl (Not started)             | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #27     | -                                                                     | A course video uploads, plays back, and is stored outside the API process.                                    |
| F-43  | B2B2C Graduation Flywheel (Institutions)                    | 6 / Ph3            | F-40                    | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #64     | -                                                                     | A learner who finishes a course sees a single invitation to create a profile.                                 |
| F-44  | AI Media Enrichment (Learning)                              | 6 / Ph4            | F-42, F-11              | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W1 / #128    | -                                                                     | An uploaded course video gets a caption file and a summary a learner can read.                                |
| F-45  | Proctoring (Third-Party, vendor-gated OD-35) (Learning)     | 4 / Ph10           | F-40, F-115             | Partial (Partial)                  | Stub/Mock / Ephemeral | P2 / Decision gate          | W1 / #140    | Owner decision for provider/policy/entitlement or consequential logic | Owner picks a vendor; a test session records a proctoring session ID returned by the vendor.                  |
| F-46  | Institutional Analytics (Institutions)                      | 6 / Ph3            | F-40                    | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #65     | -                                                                     | An institution admin sees completion rate for one course, matching the database.                              |
| F-47  | Faculty Dashboard (Institutions)                            | 6 / Ph3            | F-40                    | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #66     | -                                                                     | A faculty user sees their course list with student counts.                                                    |
| F-48  | OS Shell & Workbench (OS)                                   | 4 / Ph2+           | F-01, F-03              | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #93     | -                                                                     | A user saves a two-panel layout and sees it again after sign-in.                                              |
| F-49  | Automation & Agents (OS)                                    | 4 / Ph3+           | F-48                    | Not impl (Not started)             | Partial / Durable     | P3 / Expansion; unscheduled | W1 / #141    | -                                                                     | A user schedules a weekly saved search and gets a summary; nothing is sent without approval.                  |
| F-50  | Institutional Course Marketplace (Institutions)             | 6 / Ph3            | F-40, F-42              | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W1 / #127    | -                                                                     | An institution lists a course, another institution buys seats for it.                                         |
| F-51  | Media Health Monitoring (Platform)                          | 6 / Ph4            | F-42                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #129    | -                                                                     | A broken video creates an alert for the course owner within one hour.                                         |
| F-52  | Certificate Verification (Verification)                     | 8 / Ph3            | F-07                    | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed beta          | W0 / #20     | -                                                                     | Opening a valid certificate link shows "valid" without signing in.                                            |
| F-53  | Professional Social Graph & Feed (Networking)               | 5 / Ph8            | F-12                    | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #83     | -                                                                     | A user posts a text update and their connections see it in the feed.                                          |
| F-54  | Content Publishing (Networking)                             | 5 / Ph8            | F-12                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #84     | -                                                                     | A member publishes a post and it appears on their profile and in connections' feeds.                          |
| F-55  | Groups & Communities (Community)                            | 5 / Ph8            | F-53                    | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W1 / #136    | -                                                                     | A user joins a group and sees its members and a message thread.                                               |
| F-56  | Organization & Institution Pages (Recruiting)               | 5 / Ph8            | F-12, F-40              | Partial (Partial)                  | Full / Durable        | P1 / Proposed beta          | W0 / #76     | -                                                                     | Opening /organizations/:id without signing in shows the company's open jobs.                                  |
| F-57  | Events & Webinars (Community)                               | 5 / Ph8            | F-53                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #137    | -                                                                     | A user signs up for an event and gets a reminder notification.                                                |
| F-58  | Written Recommendations (Networking)                        | 6 / Ph8            | F-53                    | Not impl (Not started)             | Full / Durable        | P3 / Expansion; unscheduled | W1 / #133    | -                                                                     | A colleague writes a recommendation and it shows on the candidate's profile after they accept it.             |
| F-59  | Outreach Credits (TalentMail) (Recruiting)                  | 5 / Ph8            | F-10                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #85     | -                                                                     | A recruiter with zero credits cannot send outreach; after a top-up, one message uses one credit.              |
| F-60  | Profile Views & Privacy Controls (Networking)               | 6 / Ph8            | F-12                    | Partial (Partial)                  | Full / Durable        | P1 / Proposed beta          | W0 / #61     | -                                                                     | A visitor views a profile, and the owner sees one more view.                                                  |
| F-61  | Premium Candidate Tier (OD-34 gated) (Business)             | 4 / Ph10+          | F-60                    | Partial (Partial)                  | Stub/Mock / N/A       | P2 / Decision gate          | W0 / #92     | Owner decision for provider/policy/entitlement or consequential logic | A free user is blocked from the gated feature with an upgrade message; a paid test user is not.               |
| F-62  | Sponsored Content (NOT RECOMMENDED) (Business)              | 0 / Ph10+          | –                       | Excluded (Not recommended)         | Stub/Mock / N/A       | N/A / Excluded              | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-63  | Business-Development Graph (NOT RECOMMENDED) (Intelligence) | 0 / Ph10+          | –                       | Excluded (Not recommended)         | Stub/Mock / N/A       | N/A / Excluded              | -            | -                                                                     | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-64  | LinkedIn Migration Engine (Integration)                     | 5 / Ph1/2          | F-12                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #89     | -                                                                     | Uploading a LinkedIn export creates the work history entries in the profile.                                  |
| F-65  | LinkedIn Decoupling & Independence (Foundation)             | 8 / Ph1/2          | F-64                    | Not impl (Not started)             | Full / Durable        | P2 / Expansion; unscheduled | W1 / #121    | -                                                                     | A user with an imported profile signs in without LinkedIn and sees the same data.                             |
| F-66  | Course Creation Studio (Learning)                           | 8 / Ph7            | F-07, F-42              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W1 / #119    | -                                                                     | An instructor creates a course with two lessons in the UI and publishes it.                                   |
| F-67  | Categories, Discovery & Comparison (Learning)               | 6 / Ph7            | F-07, F-145             | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W1 / #124    | -                                                                     | A learner filters by category and compares two courses.                                                       |
| F-68  | Quizzes, Practice Tests & Final Exams (Learning)            | 8 / Ph7            | F-07                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #25     | -                                                                     | A learner answers a quiz and sees a stored score.                                                             |
| F-69  | Assignments & Peer Review (Learning)                        | 8 / Ph7            | F-07                    | Not impl (Not started)             | Missing / N/A         | P2 / Expansion; unscheduled | W0 / #28     | -                                                                     | A learner submits an assignment and receives two peer reviews.                                                |
| F-70  | Learning Paths, Programs & Specializations (Learning)       | 8 / Ph7            | F-07, F-66              | Not impl (Not started)             | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #29     | -                                                                     | A learner enrols in a path of three courses and sees progress across all three.                               |
| F-71  | Course Q&A, Discussions, Notes (Learning)                   | 6 / Ph7            | F-07                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #68     | -                                                                     | A learner asks a question on a lesson and sees the answer; their note stays private.                          |
| F-72  | Course Reviews & Ratings (Learning)                         | 6 / Ph7            | F-07                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #69     | -                                                                     | A learner rates a completed course and the rating shows on the course.                                        |
| F-73  | Course Commerce (Learning)                                  | 6 / Ph7            | F-07, F-16              | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #70     | -                                                                     | A learner buys a course in sandbox payment mode and gets access.                                              |
| F-74  | Instructor Platform (Learning)                              | 6 / Ph7            | F-07, F-66              | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #59     | -                                                                     | An instructor sees the count of enrolments and the average rating for their course.                           |
| F-75  | Employer Insights (Intelligence)                            | 7 / Ph9            | F-12, F-56              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #51     | -                                                                     | A recruiter sees time-to-hire for the company's last closed job.                                              |
| F-76  | Coding Contests & Live Leaderboards (Assessment)            | 5 / Ph9            | F-08                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #87     | -                                                                     | Two test users enter a contest and the leaderboard updates after each submission.                             |
| F-77  | Skill Certification Exams (Assessment)                      | 8 / Ph3            | F-08                    | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #21     | -                                                                     | A candidate passes a test exam and a certificate appears in their profile.                                    |
| F-78  | Practice Sets & Interview Prep (Learning)                   | 5 / Ph9            | F-08                    | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #88     | -                                                                     | A candidate completes a practice set and sees a score per question.                                           |
| F-79  | Articles & Newsletters (Networking)                         | 5 / Ph8            | F-54                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #138    | -                                                                     | A subscriber receives an email when an author publishes an article.                                           |
| F-80  | Profile Enhancements (Profile)                              | 6 / Ph1/Ph8        | F-12                    | Partial (Partial)                  | Full / Durable        | P3 / Expansion; unscheduled | W0 / #62     | -                                                                     | A candidate adds one language and one education entry, and both show on the profile.                          |
| F-81  | Identity Verification (Verification)                        | 3 / Ph9            | F-12                    | Partial (Partial)                  | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #106    | -                                                                     | An applicant completes a document check and sees a verified badge on the profile.                             |
| F-82  | Student Learning Analytics (Analytics)                      | 6 / Ph7            | F-07                    | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #60     | -                                                                     | An instructor sees each student's lesson completion for their course.                                         |
| F-83  | Admin Platform Expansion (Administration)                   | 3 / Ph8            | F-17                    | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #105    | -                                                                     | An admin opens the organisation list and sees each organisation's status.                                     |
| F-84  | Skills Graph & Taxonomy (Platform)                          | 10 / Ph1–2         | F-12, F-07, F-08        | Partial (Partial)                  | Full / Durable        | P1 / Proposed beta          | W0 / #4      | -                                                                     | A candidate sees related skills on their profile.                                                             |
| F-85  | Career Graph & Progression (Intelligence)                   | 9 / Ph3            | F-12, F-04, F-06, F-84  | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed GA            | W0 / #8      | -                                                                     | A candidate sees one suggested transition with its probability.                                               |
| F-86  | Salary Intelligence (Intelligence)                          | 9 / Ph3            | F-04, F-06, F-56        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #9      | -                                                                     | A candidate searches a role and sees a benchmark, or a clear "not enough data" message.                       |
| F-87  | Interview Experience Repository (Candidate)                 | 7 / Ph4            | F-04, F-56, F-88        | Partial (Partial)                  | Missing / N/A         | P2 / Expansion; unscheduled | W0 / #40     | -                                                                     | A candidate searches a company and sees posted interview experiences.                                         |
| F-88  | Technical Interview Platform (Hiring)                       | 9 / Ph3            | F-08, F-33, F-06        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Decision gate          | W0 / #10     | Owner decision for provider/policy/entitlement or consequential logic | An interviewer and a candidate join a test session, submit code, and the interviewer saves a scorecard.       |
| F-89  | Contribution Verification System (Verification)             | 5 / Ph8            | F-26, F-12              | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #77     | -                                                                     | A contribution with a verified link adds to the activity score; an unverified one does not.                   |
| F-90  | Peer Mentorship & Advisor Network (Community)               | 5 / Ph4            | F-12, F-10, F-55        | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #72     | -                                                                     | A mentee requests a mentor, the mentor accepts, and both see the session.                                     |
| F-91  | Career Readiness Assessment (Career)                        | 9 / Ph2            | F-84, F-08, F-12        | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed GA            | W0 / #7      | -                                                                     | A candidate picks a target role and sees a readiness score with the missing milestones.                       |
| F-92  | Advanced Recruiter Search (Recruiting)                      | 9 / Ph3            | F-12, F-34, F-08, F-96  | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #11     | -                                                                     | A recruiter filters candidates by a skill and verified work history and sees matching results.                |
| F-93  | Interview Video Recording & AI Feedback (Hiring)            | 7 / Ph4            | F-33, F-06, F-88        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Decision gate          | W0 / #41     | Owner decision for provider/policy/entitlement or consequential logic | A candidate records one answer and sees a transcript and feedback.                                            |
| F-94  | Verified Work History & References (Verification)           | 7 / Ph3            | F-12, F-58              | Partial (Implemented)              | Full / Durable        | P0 / Proposed beta          | -            | Email provider configuration and live delivery evidence               | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-95  | Career Transition Planning (Career)                         | 7 / Ph4            | F-84, F-91, F-07        | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed GA            | W0 / #42     | -                                                                     | A candidate sees one transition with its ordered steps.                                                       |
| F-96  | Skill Evidence & Digital Credentials (Verification)         | 10 / Ph2           | F-12, F-26              | Partial (Partial)                  | Full / Durable        | P1 / Proposed beta          | W0 / #3      | -                                                                     | A certificate issued to a candidate shows on their profile with a working verification link.                  |
| F-97  | Real-Time Job Market Analytics (Intelligence)               | 5 / Ph4            | F-04, F-06              | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #73     | -                                                                     | A candidate searches a skill and sees a demand chart for the last 90 days.                                    |
| F-98  | Employer Equity & Compensation Intelligence (Intelligence)  | 7 / Ph3            | F-56, F-86              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #38     | -                                                                     | A candidate opens a company and sees a pay range or "not enough data".                                        |
| F-99  | AI Career Coach (Enhanced) (AI)                             | 7 / Ph4            | F-12, F-84, F-91, F-07  | Partial (Partial)                  | Partial / Ephemeral   | P2 / Decision gate          | W0 / #43     | Owner decision for provider/policy/entitlement or consequential logic | A candidate sets a goal, gets a three-step plan, and the plan is still there next visit.                      |
| F-100 | Peer Project Collaboration (Learning)                       | 4 / Ph5            | F-07, F-69, F-10        | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #142    | -                                                                     | Two members share a project, add a task, and both see it.                                                     |
| F-101 | Badge Marketplace & Recognition (Gamification)              | 4 / Ph8            | F-23, F-26              | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #90     | -                                                                     | A member lists a badge for claim and another member claims it.                                                |
| F-102 | Hiring Manager Portal (Recruiting)                          | 8 / Ph3            | F-06, F-88              | Partial (Partial)                  | Full / Durable        | P2 / Expansion; unscheduled | W0 / #22     | -                                                                     | A hiring manager sees each scorecard next to the applicant.                                                   |
| F-103 | Candidate Comparison & Rubric (Recruiting)                  | 6 / Ph3            | F-06, F-92              | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #56     | -                                                                     | A recruiter compares two applicants and sees each rubric score.                                               |
| F-104 | Pre-Hire Assessment Customization (Hiring)                  | 7 / Ph3            | F-06, F-08, F-88        | Not impl (Not started)             | Missing / N/A         | P2 / Expansion; unscheduled | W0 / #52     | -                                                                     | A recruiter adds two questions and a 30-minute limit to a job, and a candidate sees them.                     |
| F-105 | Post-Hire Analytics & ROI Tracking (Analytics)              | 4 / Ph4            | F-102, F-93             | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #94     | -                                                                     | A recruiter sees retention at 90 days for hires from each source.                                             |
| F-106 | Skill Prerequisite Engine (Learning)                        | 7 / Ph5            | F-07, F-70, F-84        | Partial (Partial)                  | Partial / Durable     | P1 / Proposed GA            | W1 / #122    | -                                                                     | A candidate opening a skill sees its prerequisites and which ones they already have.                          |
| F-107 | Live Q&A with Instructors (Learning)                        | 6 / Ph5            | F-07, F-71, F-10        | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #131    | -                                                                     | A learner joins a live Q&A and posts a question that the instructor can see.                                  |
| F-108 | Expert Network Matching (Networking)                        | 4 / Ph7            | F-09, F-12, F-10        | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #100    | -                                                                     | A member asks for an expert in a skill and gets a list of two matches.                                        |
| F-109 | Salary Negotiation Guidance (Career)                        | 5 / Ph8            | F-86, F-98              | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #86     | -                                                                     | A candidate enters an offer and sees a range compared with benchmarks.                                        |
| F-110 | Verified Skill Endorsements (Verification)                  | 7 / Ph8            | F-96, F-12, F-58        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W2 / #148    | -                                                                     | A user endorses a colleague's skill and the endorsement shows on the profile.                                 |
| F-111 | Industry-Specific Learning Hubs (Learning)                  | 4 / Ph8            | F-07, F-55              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #102    | -                                                                     | A learner opens the healthcare hub and sees its courses.                                                      |
| F-112 | Resume Parsing & Optimization (Candidate)                   | 6 / Ph8            | F-13, F-12              | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #71     | -                                                                     | Uploading a PDF resume fills at least the name, title and two roles into the profile.                         |
| F-113 | Recruiter Outreach Analytics (Recruiting)                   | 6 / Ph8            | F-59, F-06              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #134    | -                                                                     | A recruiter sees the reply rate for a campaign of ten messages.                                               |
| F-114 | Learning Impact Tracking (Analytics)                        | 9 / Ph4            | F-07, F-04, F-06        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #14     | -                                                                     | A learner sees the outcome change for a course with at least 30 learners, or "not enough data".               |
| F-115 | Certification Exam Platform (Assessment)                    | 9 / Ph3            | F-77, F-45              | Not impl (Not started)             | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #15     | -                                                                     | A candidate books an exam slot and receives a certificate after passing.                                      |
| F-116 | Accessibility & Inclusive Learning (Platform)               | 7 / Ph8            | F-07, F-44              | Not impl (Not started)             | Partial / Stateless   | P2 / Expansion; unscheduled | W2 / #149    | -                                                                     | A course shows a transcript for every video and can be finished with the keyboard only.                       |
| F-117 | Mobile-First Job Application (Candidate)                    | 5 / Ph8            | F-04, F-33              | Partial (Partial)                  | Full / Durable        | P3 / Expansion; unscheduled | W0 / #78     | -                                                                     | A candidate applies on a 390 px screen in three taps using saved answers.                                     |
| F-118 | Emerging Skills Detection (Intelligence)                    | 4 / Ph8            | F-84                    | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #91     | -                                                                     | The emerging skills list shows the top five skills with their growth percentage.                              |
| F-119 | Diversity & Inclusion Analytics (Hiring)                    | 4 / Ph8            | F-06                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #103    | -                                                                     | A recruiter sees the pipeline split by stage for groups of at least 10 people, and smaller groups are hidden. |
| F-120 | API & Integration Platform (Platform)                       | 2 / Ph10           | F-01, F-34              | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #116    | -                                                                     | A developer creates an API key, lists jobs with it, and receives a webhook when a job is published.           |
| F-121 | Warm Introduction Paths (Networking)                        | 8 / Ph4            | F-09, F-12, F-56, F-125 | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #23     | -                                                                     | A user requests an intro, the intermediary accepts, and both see the status.                                  |
| F-122 | Application Feedback Loop (Jobs)                            | 9 / Ph3            | F-06, F-04              | Partial (Partial)                  | Partial / Ephemeral   | P1 / Proposed GA            | W0 / #12     | -                                                                     | A recruiter sends feedback on a rejection and the candidate sees it on the application page.                  |
| F-123 | Skill Decay Tracking (Freshness Engine) (Verification)      | 9 / Ph3            | F-84, F-96              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #13     | -                                                                     | A candidate sees a skill marked "stale" after the set period and can refresh it.                              |
| F-124 | Project Marketplace (Learning)                              | 5 / Ph5            | F-07, F-26, F-100       | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W2 / #150    | -                                                                     | A company posts a project, a member applies, and the company accepts them.                                    |
| F-125 | Alumni Networks (Networking)                                | 7 / Ph4            | F-12, F-09, F-40        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #44     | -                                                                     | A graduate of an institution joins its alumni group and sees its members.                                     |
| F-126 | Interview Prep Marketplace (Careers)                        | 5 / Ph4            | F-87, F-90, F-88        | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #81     | -                                                                     | A candidate books a paid mock interview with an expert in sandbox payment mode.                               |
| F-127 | Company Culture Assessment (Companies)                      | 4 / Ph5            | F-56, F-75              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #95     | -                                                                     | An employee completes the survey and the company page shows a culture score once five responses exist.        |
| F-128 | Offer Comparison Tool (Careers)                             | 7 / Ph4            | F-86, F-98, F-109       | Not impl (Not started)             | Missing / N/A         | P2 / Expansion; unscheduled | W1 / #123    | -                                                                     | A candidate compares two offers and sees the totals side by side.                                             |
| F-129 | Leadership Development (Learning)                           | 3 / Ph5            | F-07, F-84              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #108    | -                                                                     | A candidate starts the leadership track and sees the first two goals.                                         |
| F-130 | Freelance Marketplace (Jobs)                                | 3 / Ph7            | F-04, F-100, F-124      | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W3 / #153    | -                                                                     | A client posts a gig and a freelancer applies to it.                                                          |
| F-131 | Apprenticeship Matching (Jobs)                              | 3 / Ph6            | F-04, F-40              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #110    | -                                                                     | A candidate with the listed skills sees the matching apprenticeship first.                                    |
| F-132 | Scholarship Discovery (Learning)                            | 3 / Ph6            | F-40, F-07              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #111    | -                                                                     | A learner filters scholarships by country and sees matching ones.                                             |
| F-133 | Volunteer Matching (Community)                              | 2 / Ph7            | F-26, F-100             | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W2 / #152    | -                                                                     | A member filters volunteer roles by skill and applies to one.                                                 |
| F-134 | Code Review Practice (Skills)                               | 4 / Ph5            | F-08, F-26              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #96     | -                                                                     | A member submits a review of a sample PR and sees a score against the expert review.                          |
| F-135 | System Design Practice (Skills)                             | 4 / Ph5            | F-88, F-08              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #97     | -                                                                     | A candidate submits a design and gets a rubric score.                                                         |
| F-136 | Micro-Learning (Learning)                                   | 2 / Ph4            | F-07, F-42              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #146    | -                                                                     | A learner gets one lesson a day and marks it done.                                                            |
| F-137 | Spaced Repetition (Learning)                                | 2 / Ph6            | F-07, F-68              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #115    | -                                                                     | A learner sees a card due tomorrow after answering one correctly today.                                       |
| F-138 | Study Accountability Partners (Learning)                    | 3 / Ph6            | F-07, F-55              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #112    | -                                                                     | Two learners are paired and each sees the other's weekly progress.                                            |
| F-139 | Local Communities & Meetups (Networking)                    | 3 / Ph7            | F-09, F-55, F-57        | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W2 / #151    | -                                                                     | A member searches their city and sees meetups they can join.                                                  |
| F-140 | Affinity Groups (Community)                                 | 3 / Ph7            | F-55, F-09              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #113    | -                                                                     | A member joins an affinity group that requires an invitation, and is refused without one.                     |
| F-141 | Onboarding Preparation (Careers)                            | 1 / Ph8            | F-06, F-33              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #117    | -                                                                     | A new hire sees a checklist of three tasks before their start date.                                           |
| F-142 | Referral Request System (Jobs)                              | 8 / Ph4            | F-09, F-04              | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #24     | -                                                                     | A candidate asks a contact for a referral, and the contact sees and answers it.                               |
| F-143 | OSS Contribution Discovery (Portfolio)                      | 4 / Ph8            | F-89, F-26              | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #104    | -                                                                     | A member sees three matching open issues with their skills.                                                   |
| F-144 | Reputation Engine (multi-context) (Platform)                | 9 / Ph2            | F-96, F-58, F-72        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W2 / #147    | -                                                                     | A candidate sees their reputation score and the factors that make it up.                                      |
| F-145 | Recommendation Engine Core (Platform)                       | 8 / Ph2–3          | F-84, F-144             | Not impl (Not started)             | Partial / Ephemeral   | P1 / Proposed GA            | W0 / #30     | -                                                                     | A candidate sees a ranked job list whose top results match their skills.                                      |
| F-146 | Activity & Contribution Tracking (Platform)                 | 7 / Ph3            | F-123, F-84, F-144      | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #39     | -                                                                     | A candidate sees their activity history for the last 30 days on the profile.                                  |
| F-147 | Unified Search & Discovery (Platform)                       | 8 / Ph2            | F-84, F-145             | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W1 / #118    | -                                                                     | Typing a company name in the header returns the company and its jobs.                                         |
| F-148 | Instructor Reputation System (Reputation)                   | 8 / Ph7            | F-72, F-144             | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W1 / #120    | -                                                                     | An instructor's profile shows their average rating and review count.                                          |
| F-149 | Employer Reputation & Brand System (Reputation)             | 7 / Ph8            | F-75, F-56, F-144       | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #49     | -                                                                     | A company page shows its reputation band and review count.                                                    |
| F-150 | Peer Credibility Networks (Reputation)                      | 7 / Ph8            | F-110, F-144            | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #50     | -                                                                     | A candidate profile shows endorsement counts by weight.                                                       |
| F-151 | Skill Supply/Demand Forecasting (Intelligence)              | 7 / Ph4            | F-84, F-86, F-97        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #45     | -                                                                     | A candidate opens a skill and sees its forecast chart.                                                        |
| F-152 | Career Trajectory Analysis (Intelligence)                   | 7 / Ph4            | F-85, F-86, F-93        | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #46     | -                                                                     | A candidate sees their trajectory chart and a benchmark, or "not enough data".                                |
| F-153 | Learning Impact Dashboard (Enhanced) (Intelligence)         | 7 / Ph4            | F-114, F-85, F-86       | Partial (Partial)                  | Partial / Ephemeral   | P2 / Expansion; unscheduled | W0 / #47     | -                                                                     | An instructor sees the outcome summary for their course.                                                      |
| F-154 | Interview Prediction & Benchmarking (Intelligence)          | 6 / Ph4            | F-88, F-102, F-105      | Not impl (Not started)             | Missing / N/A         | P2 / Decision gate          | W1 / #130    | Owner decision for provider/policy/entitlement or consequential logic | A recruiter sees a benchmark for a role only when enough interviews exist.                                    |
| F-155 | Adaptive Learning System (Personalization)                  | 6 / Ph5            | F-07, F-84, F-145       | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #132    | -                                                                     | A learner who fails a quiz gets a review lesson next.                                                         |
| F-156 | Professional Development Plan System (Career)               | 6 / Ph4–5          | F-91, F-95, F-145       | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #135    | -                                                                     | A candidate gets a three-goal plan with dates and can tick off tasks.                                         |
| F-157 | Skills Co-Learning Path Optimizer (Learning)                | 4 / Ph5            | F-84, F-114, F-07       | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #98     | -                                                                     | A learner gets a course order that covers their three largest skill gaps.                                     |
| F-158 | Talent Pool Intelligence & Analytics (Recruiting)           | 6 / Ph3            | F-92, F-84, F-144       | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #57     | -                                                                     | A recruiter opens a talent pool and sees its skill mix.                                                       |
| F-159 | Behavioral Talent Discovery (Discovery)                     | 6 / Ph4            | F-123, F-84, F-144      | Partial (Partial)                  | Partial / Ephemeral   | P2 / Decision gate          | W0 / #58     | Owner decision for provider/policy/entitlement or consequential logic | A recruiter runs discovery for a role and sees ranked candidates who opted in.                                |
| F-160 | Talent Segmentation & Classification (Analytics)            | 5 / Ph4            | F-84, F-85, F-144       | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #74     | -                                                                     | A recruiter filters candidates by a segment and sees the count.                                               |
| F-161 | Internal Mobility & Succession Platform (Enterprise)        | 3 / Ph6–7          | F-84, F-91, F-132       | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W1 / #145    | -                                                                     | An employee sees an internal role that matches their skills and applies to it.                                |
| F-162 | Verified Work History Network & Graph (Verification)        | 5 / Ph4            | F-94, F-84              | Partial (Implemented)              | Full / Durable        | P1 / Proposed beta          | -            | Email provider configuration and live delivery evidence               | (generic: complete journey incl. denied/recovery cases survives restart)                                      |
| F-163 | Credential Wallet & Portability (Credential)                | 3 / Ph5            | F-96                    | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #109    | -                                                                     | A candidate exports a file with their credentials and the file verifies.                                      |
| F-164 | Skills Evidence Narrative & Storytelling (Credential)       | 4 / Ph5            | F-96, F-26              | Not impl (Not started)             | Partial / Durable     | P3 / Expansion; unscheduled | W0 / #99     | -                                                                     | A candidate gets a draft narrative and saves an edited version.                                               |
| F-165 | Diversity, Equity & Inclusion Data System (Analytics)       | 3 / Ph8            | F-119                   | Not impl (Not started)             | Missing / N/A         | P2 / Decision gate          | W1 / #144    | Owner decision for provider/policy/entitlement or consequential logic | A candidate can opt in and out, and the report shows only groups above the minimum size.                      |
| F-166 | Interview Performance Benchmarking (Analytics)              | 5 / Ph4            | F-88, F-102             | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #82     | -                                                                     | An interviewer sees their average score next to the panel average.                                            |
| F-167 | Candidate Comparison & Rubric (Enhanced) (Hiring)           | 5 / Ph3            | F-88, F-103             | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #80     | -                                                                     | A recruiter compares four candidates with weighted rubric scores.                                             |
| F-168 | Hiring Prediction & Success Modeling (Analytics)            | 3 / Ph5            | F-88, F-105             | Not impl (Not started)             | Missing / N/A         | P2 / Decision gate          | W1 / #143    | Owner decision for provider/policy/entitlement or consequential logic | A recruiter sees a success estimate only when enough past hires exist.                                        |
| F-169 | Community Contribution Scoring & Recognition (Community)    | 5 / Ph7            | F-55, F-144             | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #75     | -                                                                     | A member who mentors three people sees a recognition badge.                                                   |
| F-170 | Expert Network (Enhanced) (Community)                       | 4 / Ph7            | F-144, F-90             | Not impl (Not started)             | Missing / N/A         | P3 / Expansion; unscheduled | W0 / #101    | -                                                                     | An expert's profile shows availability and endorsement count.                                                 |
| F-171 | Employer Brand Management System (Company)                  | 3 / Ph8            | F-56, F-75, F-149       | Not impl (Not started)             | Partial / Ephemeral   | P3 / Expansion; unscheduled | W0 / #114    | -                                                                     | A company admin edits the about text and it shows on the public page.                                         |
| F-172 | Advanced Compensation Intelligence (Analytics)              | 4 / Ph8            | F-86, F-98, F-109       | Partial (Partial)                  | Partial / Ephemeral   | P3 / Expansion; unscheduled | W1 / #139    | -                                                                     | A recruiter opens a pay band for a role and location, with the sample size shown.                             |
| F-173 | Company-to-Skills Mapping (Intelligence)                    | 3 / Ph4            | F-84, F-04              | Not impl (Not started)             | Full / Durable        | P3 / Expansion; unscheduled | W0 / #107    | -                                                                     | A candidate opens a company and sees its top five hiring skills.                                              |

#### 9.1 Feature intent statements (expected behavior as recorded in the audit ledger)

The ledger's `expectedBehavior` field is the most specific per-feature requirement sentence the earlier attempt kept. 155 features have a specific sentence (below); 18 features (02, 03, 04, 05, 06, 09, 10, 14, 15, 20, 25, 26, 38, 39, 62, 63, 94, 162) carry only the placeholder "according to canonical registry and SSOT section 9; detailed acceptance not independently enumerated", which means their intent lives in the earlier registry and SSOT (see section 10 for the 46 extracted contracts). Some sentences contain instructions to a builder ("Uses /courses/:id/modules ..."); the route names are the earlier attempt's and are kept as written.

| ID    | Feature                                      | Expected behavior (prior ledger)                                                                                                                                                                                         |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-01  | Authentication & Session                     | SSOT F-01: registration/account verification, login/restore/logout, reset, OAuth, role normalization and age/security gates                                                                                              |
| F-07  | Learning Management System                   | Lesson player: learners open a course, move through modules and lessons, mark lessons complete and see progress. Uses existing /courses/:id/modules, /modules/:id/lessons, /lessons/:id/complete, /courses/:id/progress. |
| F-08  | Challenges Arena                             | Connect the assessments page to real challenges: start a session, submit a solution, see a score. Remove the "preview, nothing scored" state for live challenges. Uses /challenges/:id/start-session and /submit.        |
| F-11  | AI Career Assistant (Basic)                  | AI career assistant chat screen that calls /ai/career-assistant/chat and shows the free-tier usage meter from /ai/usage.                                                                                                 |
| F-12  | Profile Management                           | SSOT F-12: complete professional record, skills/experience/education/certifications/portfolio, safe uploads, privacy and concurrent-edit behavior                                                                        |
| F-13  | Resume Builder                               | Resume editor: edit sections (summary, roles, skills), pick a template, export. Uses /resumes and /resumes/:id/export.                                                                                                   |
| F-16  | Billing & Subscriptions                      | Billing screens wired to /billing/subscribe, /billing/subscription, /billing/cancel and /billing/invoices, labelled "simulated" until a payment provider is chosen (see X-03).                                           |
| F-17  | Admin Console                                | Admin console: user search, suspend or reactivate, role changes, audit log, health diagnostics, maintenance mode. Uses /admin/* routes. Only platform_admin can open it.                                                 |
| F-18  | Chrome Extension Companion                   | Chrome extension: a manifest-v3 extension that signs in with the user's session and reads the active tab. Needs a new apps/extension package and a secure token hand-off. Depends on F-01.                               |
| F-19  | Product Analytics                            | Analytics events are recorded from the main flows (sign-up, apply, publish). Admin KPI screen reads /analytics/kpis.                                                                                                     |
| F-21  | Error Recovery & Resilience                  | Make errors recoverable everywhere: retry buttons on failed loads, a single error boundary per page, and clear messages for offline, timeout and server errors.                                                          |
| F-22  | Gamification & XP Ledger                     | XP and streaks shown on the dashboard, from /gamification/summary and /xp/ledger.                                                                                                                                        |
| F-23  | Leaderboard & Badges                         | Leaderboard and badges screen, from /gamification/leaderboard and /gamification/badges.                                                                                                                                  |
| F-24  | Trust, Safety & Moderation                   | Moderation: users can report content, admins see a queue (/moderation/reports), resolve, and users can appeal (/moderation/reports/:id/appeal).                                                                          |
| F-27  | Local Resume Match Preview                   | Resume match preview in the extension: compare the user's resume skills with the job text on the page and show a match score. Needs F-18 and F-112 or a simple keyword match.                                            |
| F-28  | External Job Page Scanner                    | External job page scanner: detect job postings on common job sites and offer to save them to TalentSphere. Needs F-18.                                                                                                   |
| F-29  | Scheduled Notification Digest                | Worker job that sends a digest email to users who chose a frequency. Needs X-02 (email provider).                                                                                                                        |
| F-30  | Networking Stale-Request Nudges              | Worker job that nudges users about stale network requests (older than a set number of days), using notifications.                                                                                                        |
| F-31  | KPI Aggregation & Rollups                    | KPI rollups: nightly worker job that aggregates analytics events into daily KPI tables, and an admin screen that reads them.                                                                                             |
| F-32  | Saved Searches & Job Alerts                  | Save a job search and get alerts: "Save this search" on the jobs page, list of saved searches, alerts from /jobs/saved-searches and /jobs/alerts.                                                                        |
| F-33  | Video Interview Rooms                        | Interview room screen: join a scheduled session using /interviews/assessments/:id/join, after consent (/consent).                                                                                                        |
| F-34  | Multi-Entity Backend Search                  | Connect the command palette and search box to /search, not only to navigation commands.                                                                                                                                  |
| F-35  | Feature Flag Console                         | Feature flag console: admin screen to list, turn on and off flags via /admin/feature-flags, with an audit log entry for each change.                                                                                     |
| F-36  | Application Draft Autosave                   | Application draft autosave on the apply form, using /jobs/:jobId/draft and restore.                                                                                                                                      |
| F-37  | Job Templates                                | Job templates on the hiring page: save a job as a template and create a new job from it (/job-templates).                                                                                                                |
| F-40  | Institutional Managed Learning               | Institutional managed learning: an institution account that enrols its members in courses, using the alumni institution records. Needs a UI to create the institution and invite members.                                |
| F-41  | Procurement & Seat Licensing                 | Seat licensing: an institution buys a number of seats and assigns them to members. Needs F-40 and X-03 for real billing.                                                                                                 |
| F-42  | Provider-Agnostic Media Engine               | Media engine: one interface for uploading and serving course media (video, images), with a storage provider behind it. No media code exists yet.                                                                         |
| F-43  | B2B2C Graduation Flywheel                    | Graduation flywheel: when a learner finishes an institution course, prompt them to create a profile and join the candidate network. Needs F-40.                                                                          |
| F-44  | AI Media Enrichment                          | AI media enrichment: generate captions and summaries for uploaded course media. Needs F-42 and F-11. Needs a model provider decision first.                                                                              |
| F-45  | Proctoring (Third-Party, vendor-gated OD-35) | Proctoring: connect a third-party proctoring vendor for timed assessments. Vendor choice is gated (OD-35). Today only fields exist.                                                                                      |
| F-46  | Institutional Analytics                      | Institutional analytics: completion, engagement and outcome charts per institution, built on F-40 and F-82.                                                                                                              |
| F-47  | Faculty Dashboard                            | Faculty dashboard: a teacher view of their courses, students and assignment status. Needs F-40 and F-69.                                                                                                                 |
| F-48  | OS Shell & Workbench                         | OS shell and workbench: a configurable multi-panel workspace for power users. Large scope; start with a saved panel layout on the dashboard.                                                                             |
| F-49  | Automation & Agents                          | Automation and agents: let a user schedule an agent task (for example, a weekly job search). Needs F-48 and a safe approval step for every outgoing action.                                                              |
| F-50  | Institutional Course Marketplace             | Institutional course marketplace: institutions list and sell courses to other institutions. Needs F-40, F-42 and F-73.                                                                                                   |
| F-51  | Media Health Monitoring                      | Media health monitoring: check uploaded media for broken or unplayable files and alert the owner. Needs F-42.                                                                                                            |
| F-52  | Certificate Verification                     | Public certificate verification page at /verify/:hash, showing issuer and status, with no login.                                                                                                                         |
| F-53  | Professional Social Graph & Feed             | Social graph and feed: a feed of posts from connections, built on the connections API. No feed route exists today.                                                                                                       |
| F-54  | Content Publishing                           | Content publishing: members write and publish posts or articles, with draft and publish states. Needs F-53.                                                                                                              |
| F-55  | Groups & Communities                         | Groups and communities: a group page with join, members and a discussion thread. Alumni groups exist in the API; add the UI and a general group type.                                                                    |
| F-56  | Organization & Institution Pages             | Public organisation page: a company page showing its name, open jobs and reputation summary, reachable without login.                                                                                                    |
| F-57  | Events & Webinars                            | Events and webinars: create an event with a date and join link, list upcoming events and allow sign-up. Needs F-53 for visibility.                                                                                       |
| F-58  | Written Recommendations                      | Written recommendations: one member writes a recommendation for another, tied to a work-history entry. Needs F-53 and F-94.                                                                                              |
| F-59  | Outreach Credits (TalentMail)                | Outreach credits (TalentMail): recruiters buy credits to send outreach messages. Needs F-10 and X-03 for payment.                                                                                                        |
| F-60  | Profile Views & Privacy Controls             | Profile views and privacy controls: count profile views, show them to the owner, and let the owner turn off view tracking.                                                                                               |
| F-61  | Premium Candidate Tier (OD-34 gated)         | Premium candidate tier: gate one or two features (for example, extra AI assistant usage) behind the paid plan. Needs F-16 and X-03.                                                                                      |
| F-64  | LinkedIn Migration Engine                    | LinkedIn migration: import a LinkedIn data export (CSV or JSON) into the profile and work history. No migration code exists yet.                                                                                         |
| F-65  | LinkedIn Decoupling & Independence           | LinkedIn decoupling: export all data and remove the dependency on LinkedIn login. Needs F-64.                                                                                                                            |
| F-66  | Course Creation Studio                       | Course creation studio: a UI for instructors to create a course, add modules and lessons, and publish. The API exists; the UI does not.                                                                                  |
| F-67  | Categories, Discovery & Comparison           | Course categories and discovery: browse courses by category, compare two courses side by side.                                                                                                                           |
| F-68  | Quizzes, Practice Tests & Final Exams        | Quiz lessons: a quiz lesson type that grades answers and stores the score. Needs F-07.                                                                                                                                   |
| F-69  | Assignments & Peer Review                    | Assignments and peer review: an instructor sets an assignment; learners submit work and review two peers. No code exists yet.                                                                                            |
| F-70  | Learning Paths, Programs & Specializations   | Learning paths and programs: an ordered set of courses with a completion goal. Needs F-66 for course authoring. Career pathways (F-85) are a separate feature.                                                           |
| F-71  | Course Q&A, Discussions, Notes               | Course Q&A, discussions and notes: a question thread per lesson and private notes for the learner. Needs F-07.                                                                                                           |
| F-72  | Course Reviews & Ratings                     | Course ratings and written reviews, reusing the instructor-review pattern. Needs F-07.                                                                                                                                   |
| F-73  | Course Commerce                              | Course commerce: sell a course for money. Needs F-07, F-16 and X-03.                                                                                                                                                     |
| F-74  | Instructor Platform                          | Instructor platform: an instructor dashboard with course stats, reviews and earnings. Needs F-66 and F-72.                                                                                                               |
| F-75  | Employer Insights                            | Employer insights: a company dashboard with hiring funnel and time-to-hire, from the reputation metrics API.                                                                                                             |
| F-76  | Coding Contests & Live Leaderboards          | Coding contests and live leaderboards: time-boxed contests with live scoring. Needs F-08 and a judge.                                                                                                                    |
| F-77  | Skill Certification Exams                    | Skill certification exams: a timed exam for a skill that issues a certificate on pass. Needs F-08 and F-115.                                                                                                             |
| F-78  | Practice Sets & Interview Prep               | Practice sets and interview prep: sets of practice questions by role, with answers and scoring. Needs F-08.                                                                                                              |
| F-79  | Articles & Newsletters                       | Articles and newsletters: publish articles and let subscribers receive them by email. Needs F-54 and X-02.                                                                                                               |
| F-80  | Profile Enhancements                         | Profile enhancements: add sections for languages, education and certifications to the profile form.                                                                                                                      |
| F-81  | Identity Verification                        | Identity verification: confirm the person is who they say, beyond work email. Needs a provider decision. Today only work-email checks exist.                                                                             |
| F-82  | Student Learning Analytics                   | Student learning analytics: per-student progress and outcomes for instructors, built on F-07 and the learning impact API.                                                                                                |
| F-83  | Admin Platform Expansion                     | Admin platform expansion: add the remaining admin screens (organisations, challenges, billing overview) on the existing admin routes.                                                                                    |
| F-84  | Skills Graph & Taxonomy                      | Skills graph visible on the profile: skills and their links, from /skills/:id/graph and /skills/relationships.                                                                                                           |
| F-85  | Career Graph & Progression                   | Career transitions screen: pathways and transition probability from /career/transitions and /career/pathways.                                                                                                            |
| F-86  | Salary Intelligence                          | Salary benchmarks screen from /salaries/benchmarks, with the k-anonymity threshold shown.                                                                                                                                |
| F-87  | Interview Experience Repository              | Interview experience repository: candidates post their interview experiences per company; search them. Needs F-04 and F-88 for the data.                                                                                 |
| F-88  | Technical Interview Platform                 | Technical interview platform: candidate and interviewer screens for scheduled sessions, with consent, a shared code pad and a scorecard. The API exists; the UI does not.                                                |
| F-89  | Contribution Verification System             | Contribution verification: verify a contribution (for example, a merged pull request) before it counts toward the activity score.                                                                                        |
| F-90  | Peer Mentorship & Advisor Network            | Peer mentorship and advisors: match mentors and mentees and run a request and accept flow. The alumni mentorship API exists; add the UI.                                                                                 |
| F-91  | Career Readiness Assessment                  | Career readiness assessment: score a candidate's readiness for a target role using milestones and skills. The API exists; add a UI.                                                                                      |
| F-92  | Advanced Recruiter Search                    | Advanced recruiter search: search candidates by skill, location, work history and verification level. Uses the talent pools and search APIs.                                                                             |
| F-93  | Interview Video Recording & AI Feedback      | Interview video recording and AI feedback: record the answer, transcribe it, and show AI feedback. Needs F-33 and a media provider.                                                                                      |
| F-95  | Career Transition Planning                   | Career transition planning: show a candidate's suggested transitions with the steps to take, from the career transitions API.                                                                                            |
| F-96  | Skill Evidence & Digital Credentials         | Digital credentials: show certificates and skill evidence on the profile, each with a verification link (the API exists).                                                                                                |
| F-97  | Real-Time Job Market Analytics               | Real-time job market analytics: show demand trends for a skill or role, from the market signals API.                                                                                                                     |
| F-98  | Employer Equity & Compensation Intelligence  | Employer compensation intelligence: company-level pay ranges, from the company salary API, with a minimum sample size shown.                                                                                             |
| F-99  | AI Career Coach (Enhanced)                   | AI career coach (enhanced): multi-turn coaching plans built on the career assistant, with saved goals. Needs F-11 first.                                                                                                 |
| F-100 | Peer Project Collaboration                   | Peer project collaboration: two or more members work on one project with shared tasks and comments. Needs F-07, F-69 and F-10.                                                                                           |
| F-101 | Badge Marketplace & Recognition              | Badge marketplace: members can offer and claim badges that others have earned. Badges API exists; the marketplace does not.                                                                                              |
| F-102 | Hiring Manager Portal                        | Hiring-manager view: scorecards and interview feedback on each applicant, from /interviews/assessments/:id/scorecards.                                                                                                   |
| F-103 | Candidate Comparison & Rubric                | Candidate comparison: side-by-side scorecards and rubric scores for shortlisted applicants.                                                                                                                              |
| F-104 | Pre-Hire Assessment Customization            | Pre-hire assessment customisation: recruiters choose questions and time limits for each job's assessment. Needs F-06, F-08 and F-88.                                                                                     |
| F-105 | Post-Hire Analytics & ROI Tracking           | Post-hire analytics and ROI: track new hires' ratings and retention against the hiring source. Needs F-102 and F-93.                                                                                                     |
| F-106 | Skill Prerequisite Engine                    | Skill prerequisite engine: show which skills must be learned first, from the skill relationships API.                                                                                                                    |
| F-107 | Live Q&A with Instructors                    | Live Q&A with instructors: scheduled live sessions where learners ask questions. Needs F-07, F-71 and F-10 plus a live session provider.                                                                                 |
| F-108 | Expert Network Matching                      | Expert network matching: match a member with experts by skill and availability. Needs F-09, F-12 and F-10.                                                                                                               |
| F-109 | Salary Negotiation Guidance                  | Salary negotiation guidance: give a candidate a suggested range and talking points for an offer, using salary benchmarks.                                                                                                |
| F-110 | Verified Skill Endorsements                  | Endorse a skill from a profile or work history entry, using /skills/endorsements.                                                                                                                                        |
| F-111 | Industry-Specific Learning Hubs              | Industry learning hubs: curated course and resource pages per industry. Needs F-07 and F-55.                                                                                                                             |
| F-112 | Resume Parsing & Optimization                | Resume parsing and optimisation: parse an uploaded resume into the profile and suggest keyword improvements. Needs F-13 and F-12.                                                                                        |
| F-113 | Recruiter Outreach Analytics                 | Recruiter outreach analytics: reply and open rates per campaign, from the outreach messages. Needs F-59 and F-06.                                                                                                        |
| F-114 | Learning Impact Tracking                     | Learning impact tracking: show how a course changed a learner's outcomes, from the learning impact API, with the minimum cohort size shown.                                                                              |
| F-115 | Certification Exam Platform                  | Certification exam platform: schedule and proctor certification exams, then issue certificates. Needs F-77 and F-45.                                                                                                     |
| F-116 | Accessibility & Inclusive Learning           | Accessibility and inclusive learning: captions, transcripts, keyboard-only course navigation and an accessibility statement per course. Needs F-07 and F-44.                                                             |
| F-117 | Mobile-First Job Application                 | Mobile-first job application: a short apply flow that works on a phone, with saved answers. The responsive apply page exists; finish the steps and add saved answers.                                                    |
| F-118 | Emerging Skills Detection                    | Emerging skills detection: list skills with the fastest growth in demand, from the top-growth API.                                                                                                                       |
| F-119 | Diversity & Inclusion Analytics              | Diversity and inclusion analytics: aggregate, anonymised diversity figures for a hiring pipeline, with a minimum group size.                                                                                             |
| F-120 | API & Integration Platform                   | API and integration platform: API keys per organisation, a documented public API subset, and webhooks for job events.                                                                                                    |
| F-121 | Warm Introduction Paths                      | Warm introductions UI on the network page: ask a mutual connection for an intro and respond (/networking/warm-intros/*).                                                                                                 |
| F-122 | Application Feedback Loop                    | Application feedback loop: a recruiter sends structured feedback on a rejected application and the candidate sees it. The API exists; add the UI on both sides.                                                          |
| F-123 | Skill Decay Tracking (Freshness Engine)      | Skill decay tracking: show each skill's freshness and prompt the candidate to refresh old skills, from the freshness API.                                                                                                |
| F-124 | Project Marketplace                          | Project marketplace: post a paid project, let members apply, and pick one. Needs F-07, F-26 and F-100.                                                                                                                   |
| F-125 | Alumni Networks                              | Alumni networks: the alumni directory and groups for each institution, with a join flow. The API exists; add the UI.                                                                                                     |
| F-126 | Interview Prep Marketplace                   | Interview prep marketplace: experts sell interview practice sessions. Needs F-87, F-90 and F-88 plus payments.                                                                                                           |
| F-127 | Company Culture Assessment                   | Company culture assessment: a short culture survey for employees and candidates, with results per company. Needs F-56 and F-75.                                                                                          |
| F-128 | Offer Comparison Tool                        | Offer comparison tool: compare two or three job offers side by side (pay, benefits, location). Not built: the memory file wrongly lists it as verified.                                                                  |
| F-129 | Leadership Development                       | Leadership development: a leadership track with skills, goals and manager feedback. Needs F-07 and F-84.                                                                                                                 |
| F-130 | Freelance Marketplace                        | Freelance marketplace: post and find short freelance gigs with payment. Not built: only the freelance employment type exists, and the memory file wrongly lists it as verified.                                          |
| F-131 | Apprenticeship Matching                      | Apprenticeship matching: list apprenticeships and match them to candidates by skill. No code exists yet.                                                                                                                 |
| F-132 | Scholarship Discovery                        | Scholarship discovery: list scholarships and match them to learners. Not built: the memory file wrongly lists it as verified.                                                                                            |
| F-133 | Volunteer Matching                           | Volunteer matching: list volunteer roles and match them to members. Not built: the memory file wrongly lists it as verified.                                                                                             |
| F-134 | Code Review Practice                         | Code review practice: members review a sample pull request and compare with an expert review. Needs F-08 and F-26.                                                                                                       |
| F-135 | System Design Practice                       | System design practice: a timed design exercise with a diagram and a rubric score. Needs F-88 and F-08.                                                                                                                  |
| F-136 | Micro-Learning                               | Micro-learning: five-minute lessons delivered daily. Needs F-07 and F-42 for media.                                                                                                                                      |
| F-137 | Spaced Repetition                            | Spaced repetition: review cards at growing intervals for things learned. Needs F-07 and F-68.                                                                                                                            |
| F-138 | Study Accountability Partners                | Study accountability partners: pair two learners on the same course and show each other's progress. Needs F-07 and F-55.                                                                                                 |
| F-139 | Local Communities & Meetups                  | Local communities and meetups: find and join meetups near the user. Needs F-57 and location data.                                                                                                                        |
| F-140 | Affinity Groups                              | Affinity groups: groups for a shared background or interest, with membership rules. Needs F-55 and F-09.                                                                                                                 |
| F-141 | Onboarding Preparation                       | Onboarding preparation: a pre-start plan for a new hire with tasks and reading, from a hiring outcome. Needs F-06 and F-33.                                                                                              |
| F-142 | Referral Request System                      | Referral requests UI on the network page (/referrals/requests and respond).                                                                                                                                              |
| F-143 | OSS Contribution Discovery                   | OSS contribution discovery: list open-source issues that match a member's skills. No code exists yet.                                                                                                                    |
| F-144 | Reputation Engine (multi-context)            | Reputation engine UI: show the reputation score breakdown on the profile and explain each factor. The API exists; add the UI.                                                                                            |
| F-145 | Recommendation Engine Core                   | Recommendation engine core: rank jobs, people and courses for each user. Not built: the memory file wrongly lists it as verified; the only "recommendation" fields are interview hire decisions.                         |
| F-146 | Activity & Contribution Tracking             | Activity and contribution tracking UI: show the activity score and history on the profile. The API exists.                                                                                                               |
| F-147 | Unified Search & Discovery                   | Unified search and discovery: one search box across jobs, people, courses and companies, using the search API.                                                                                                           |
| F-148 | Instructor Reputation System                 | Instructor reputation UI: show an instructor's reviews, metrics and endorsements on their profile.                                                                                                                       |
| F-149 | Employer Reputation & Brand System           | Employer reputation and brand UI: show a company's reputation on its page. The API exists.                                                                                                                               |
| F-150 | Peer Credibility Networks                    | Peer credibility UI: show peer endorsements and their weight on a profile. The API exists.                                                                                                                               |
| F-151 | Skill Supply/Demand Forecasting              | Skill supply and demand forecasting UI: show the forecast for a skill over the next year. The API exists.                                                                                                                |
| F-152 | Career Trajectory Analysis                   | Career trajectory UI: show a candidate's trajectory and benchmarks against peers with at least 20 people. The API exists.                                                                                                |
| F-153 | Learning Impact Dashboard (Enhanced)         | Learning impact dashboard UI: show course outcome summaries to instructors and admins. The API exists.                                                                                                                   |
| F-154 | Interview Prediction & Benchmarking          | Interview prediction and benchmarking: predict the likelihood of success from past interview data, with a benchmark. Needs F-88 and a sufficient sample.                                                                 |
| F-155 | Adaptive Learning System                     | Adaptive learning: change the next lesson based on the learner's quiz results. Needs F-07, F-84 and F-145.                                                                                                               |
| F-156 | Professional Development Plan System         | Professional development plan: a plan with goals, tasks and check-ins, built from readiness and transitions. Needs F-91, F-95 and F-145.                                                                                 |
| F-157 | Skills Co-Learning Path Optimizer            | Skills co-learning path optimiser: suggest the order of courses that fills the most skill gaps. Needs F-84, F-114 and F-07.                                                                                              |
| F-158 | Talent Pool Intelligence & Analytics         | Talent pool intelligence UI: show pool size, skill mix and pipeline health for each pool. The API exists.                                                                                                                |
| F-159 | Behavioral Talent Discovery                  | Behavioural talent discovery UI: show recruiters the discovery results for a role. The API exists; add a screen and the consent check.                                                                                   |
| F-160 | Talent Segmentation & Classification         | Talent segmentation UI: show candidate segments and let a recruiter filter by segment. The API exists.                                                                                                                   |
| F-161 | Internal Mobility & Succession Platform      | Internal mobility and succession: employees see roles in their company and managers name successors. Needs F-84, F-91 and F-132 (not built).                                                                             |
| F-163 | Credential Wallet & Portability              | Credential wallet and portability: export all certificates and credentials in one signed file. Needs F-96.                                                                                                               |
| F-164 | Skills Evidence Narrative & Storytelling     | Skills evidence narrative: generate a short written story of a candidate's evidence, which the candidate can edit. Needs F-96 and F-26.                                                                                  |
| F-165 | Diversity, Equity & Inclusion Data System    | DEI data system: collect opt-in diversity data with a privacy notice and report it in aggregate. Needs F-119.                                                                                                            |
| F-166 | Interview Performance Benchmarking           | Interview performance benchmarking: compare an interviewer's scores with the panel average. Needs F-88 and F-102.                                                                                                        |
| F-167 | Candidate Comparison & Rubric (Enhanced)     | Candidate comparison and rubric (enhanced): side-by-side rubric scores for more than two candidates, with weights. Needs F-88 and F-103.                                                                                 |
| F-168 | Hiring Prediction & Success Modeling         | Hiring prediction and success modelling: estimate the chance a hire succeeds from past outcomes. Needs F-88 and F-105 and a large sample.                                                                                |
| F-169 | Community Contribution Scoring & Recognition | Community contribution scoring: score contributions to groups and mentoring, with a recognition badge. The API exists; add the UI.                                                                                       |
| F-170 | Expert Network (Enhanced)                    | Expert network (enhanced): expert profiles with availability, rates and verified endorsements. Needs F-144 and F-90.                                                                                                     |
| F-171 | Employer Brand Management System             | Employer brand management: a company edits its page, tracks reputation and responds to reviews. Needs F-56, F-75 and F-149.                                                                                              |
| F-172 | Advanced Compensation Intelligence           | Compensation intelligence reports: pay bands by role and location, from the compensation reports API. The API exists; add a UI.                                                                                          |
| F-173 | Company-to-Skills Mapping                    | Company-to-skills mapping: list the skills each company hires for, from its job postings. Needs F-84 and F-04.                                                                                                           |

### 10. Intended feature contracts extracted from the earlier SSOT (46 of 173 features)

The audit JSON (`features[].canonicalContract`) holds, for **46 features**, the actors, permissions, data dependencies, external dependencies, security requirements, rule references and acceptance bullets that the earlier attempt's SSOT stated for them (source file and line range given per row). Extracted by script from the JSON; whitespace-normalized only.

**Caveats the audit itself stated.** These are the _intended_ contract of an earlier SSOT, not implementation evidence. Individual clauses and stale cross-references need reconciliation with founder amendments and the rule registry. Several clauses assume the earlier SSOT's stack (for example Supabase Auth, Edge Functions, Google and GitHub OAuth) which differs from what the earlier attempt built; the target may keep the outcome and change the mechanism. The extraction captured top-level numbered behavior and declared fields only; atomic semantic coverage was never certified, and the other 127 features had no extracted contract.

##### F-01 Authentication & Session

- Source: `SSOT.md` lines 617-700. Actors: Anonymous visitor, Candidate, Recruiter, Admin, Institution Admin. Permissions: Public: register/login/reset · Authenticated: logout/refresh/change password · Admin: revoke any session.
- Data dependencies (intended): `auth.users` (Supabase-managed), `profiles`, `user_settings`, `audit_logs`
- External dependencies (intended): Supabase Auth (GoTrue), Resend (transactional email), Google OAuth, GitHub OAuth
- Security requirements: HDN-008 (rate limits, lockout, jti denylist) · HDN-014 (TLS, no plaintext credentials) · MFA readiness (AUTH-008) · age gate (AUTH-017)
- Rule references: BR-001, BR-002, AUTH-001, SCI-04, HDN-008, HDN-014, AUTH-008, AUTH-017
- Acceptance (SSOT-extracted): Login p95 latency <300ms; 100% duplicate email rejection; 100% weak password rejection; Zero plaintext secrets in client bundle; Rate limits enforced at edge; Age gate blocks <16

##### F-04 Job Marketplace

- Source: `SSOT.md` lines 999-1077. Actors: Candidate, Recruiter, Org Admin. Permissions: Public read of published jobs · Authenticated apply · Recruiter/Admin post.
- Data dependencies (intended): `jobs`, `job_skills`, `organizations`, `job_applications`, `application_status_events`, `saved_jobs`, `saved_searches`, `job_alerts`, `job_views`, `job_fit`
- External dependencies (intended): not stated in extract
- Security requirements: RLS public read of published · Own-row for applications · Rate limit apply (5/hour/candidate) · Salary transparency enforced
- Rule references: BR-010, BR-011, BR-013, BR-015, BR-016, SCI-01, SCI-02
- Acceptance (SSOT-extracted): Search p95 <300ms for 100k jobs; Apply submission <500ms; Zero duplicate active applications; Salary transparency enforced (100%); Cursor pagination stable across pages

##### F-06 ATS / Candidate Pipeline

- Source: `SSOT.md` lines 1078-1112. Actors: Recruiter, Hiring Manager, Interviewer. Permissions: not stated in extract.
- Data dependencies (intended): `job_applications`, `application_status_events`, `scorecards`, `offers`, `interviews`, `application_drafts`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-017, BR-019, BR-020, BR-042, SCI-02, SCI-07
- Acceptance (SSOT-extracted): Kanban sync <200ms · 0 duplicate prevention failures · 0 cross-tenant access · audit 100%

##### F-07 Learning Management System

- Source: `SSOT.md` lines 1113-1172. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `courses`, `course_modules`, `course_enrollments`, `module_progress`, `content_items`, `media_sources`, `media_progress`, `certificates`, `quizzes`, `quiz_attempts`
- External dependencies (intended): not stated in extract
- Security requirements: RLS enrollment-gated lesson access · Time-limited media tokens · Certificate SHA-256 hash · Zero unauthorized content access
- Rule references: BR-048, BR-023, BR-021, BR-022, BR-046, BR-047, LMS-001, SCI-08, SCI-16, SCI-17, BR-114
- Acceptance (SSOT-extracted): Lesson completion <150ms · Certificate hash reproducible · Zero unauthorized content access · Video start <3s · Progress survives refresh/crash

##### F-08 Challenges Arena

- Source: `SSOT.md` lines 1173-1243. Actors: Candidate, Instructor, Employer. Permissions: not stated in extract.
- Data dependencies (intended): `challenges`, `challenge_submissions`, `challenge_test_cases`, `xp_transactions`
- External dependencies (intended): not stated in extract
- Security requirements: TD-05 sandbox (30s/512MB/1GB/no-network/seccomp) · Rate limit 10 sub/min/user · Hidden test cases RLS-protected · Zero code execution outside sandbox
- Rule references: CHALL-013, BR-024, BR-049, BR-050, BR-051, BR-052, BR-025, TD-05, CHALL-001, SCI-04
- Acceptance (SSOT-extracted): Submission → result <3s typical · 100% sandbox containment (no escape) · Deterministic scoring · No XP until pass confirmed · Rate limit enforced

##### F-12 Profile Management

- Source: `SSOT.md` lines 701-779. Actors: Candidate, Recruiter, Admin. Permissions: Own-row edit only. Admin can edit any. Public read of public-safe columns..
- Data dependencies (intended): `profiles`, `profile_skills`, `profile_experience`, `profile_education`, `profile_portfolios`, `profile_certifications`, `profile_media`, `career_signals`, `user_settings`
- External dependencies (intended): Supabase Storage, HaveIBeenPwned (password breach check), AI service (resume parsing)
- Security requirements: RLS own-row + public-safe view · Field-level encryption (phone_number, tax_id) · XSS sanitization on rich text · Upload pipeline
- Rule references: BR-005, BR-061, PROFILE-001
- Acceptance (SSOT-extracted): Profile save p95 <250ms; Public view never exposes PII columns; Completeness score 100% reproducible; Avatar upload succeeds for supported formats only; Concurrent edit returns 409 with clear message

##### F-13 Resume Builder

- Source: `SSOT.md` lines 1871-1876. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `resumes`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Resume generation <2s · PDF renders correctly · ATS parse-compatible

##### F-16 Billing & Subscriptions

- Source: `SSOT.md` lines 1877-1882. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `subscriptions`, `invoices`, `entitlements`, `payment_methods`, `billing_events`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Webhook idempotency 100% · entitlement enforcement server-side · zero double-billing

##### F-75 Employer Insights

- Source: `SSOT.md` lines 1883-1888. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `company_reviews`, `salary_reports`, `interview_experiences`, `interview_questions`, `company_responses`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-135
- Acceptance (SSOT-extracted): Acceptance: Salary aggregation k ≥5 · anonymity protection 100% · moderation SLA <24h

##### F-84 Skills Graph & Taxonomy

- Source: `SSOT.md` lines 780-884. Actors: Platform Admin (taxonomy curation), all users (read), recommendation engine (read), instructors (tag content). Permissions: Public read. Admin write. Instructor/Course Author can propose skill tags (subject to moderation)..
- Data dependencies (intended): `skills`, `skill_relationships`, `skill_market_signals`, `course_skills`, `challenge_skills`, `job_skills`, `profile_skills`, `portfolio_skills`
- External dependencies (intended): None required. Optional: licensed market data feed (OD-46).
- Security requirements: Public read of taxonomy · Admin-only writes · No PII in graph · RLS enforced on tagging tables · Rate limits on search API
- Rule references: BR-144, BR-141, BR-148, BR-142, BR-143, BR-145, BR-146, BR-147, SCI-35, SCI-45, SCI-46
- Acceptance (SSOT-extracted): Skill search p95 <100ms (cached); Traversal p95 <200ms for depth ≤3; 100% of course/challenge/job skill tags reference canonical skills; Zero cycles in `prerequisite_of` graph; Market signal updates daily (measure via scheduler); Typeahead returns relevant results for common typos; Unit: traversal algorithms, cycle detection, merge logic; Integration: CRUD, RLS on tagging tables, market signal computation; E2E: admin curates taxonomy → instructor tags course → learner typeahead shows skill

##### F-85 Career Graph & Progression

- Source: `SSOT.md` lines 1244-1286. Actors: Candidate (readiness), Recruiter (benchmarks), Analyst. Permissions: not stated in extract.
- Data dependencies (intended): `career_transitions`, `career_outcomes`, `progression_benchmarks`, `profiles`, `jobs`, `job_applications`, `offers`
- External dependencies (intended): not stated in extract
- Security requirements: Opt-in enforced · k-anonymity enforced · Individual data RLS-scoped · Aggregates public-safe
- Rule references: BR-160, BR-157, BR-163, SCI-36
- Acceptance (SSOT-extracted): Benchmark query <400ms · k-anonymity always enforced · opt-out removes data within 24h · Benchmarks only shown with ≥20 samples · Consent captured before any data collection

##### F-86 Salary Intelligence

- Source: `SSOT.md` lines 1287-1341. Actors: Candidate (research), Recruiter (offer calibration), Analyst. Permissions: not stated in extract.
- Data dependencies (intended): `salary_reports`, `salary_aggregates`, `compensation_benchmarks`, `equity_norms`
- External dependencies (intended): not stated in extract
- Security requirements: Strict anonymization · No PII in aggregates · k-anonymity enforced · Rate limit submissions
- Rule references: BR-178, BR-181, BR-177, BR-183, SCI-37
- Acceptance (SSOT-extracted): Aggregate query <400ms · minimum cohort/privacy threshold enforced by policy; k≥10 default for sensitive/public aggregates · No PII in aggregates · Outliers excluded from computation · Withdrawal effective within 24h

##### F-87 Interview Experience Repository

- Source: `SSOT.md` lines 1889-1893. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `interview_experiences`, `interview_questions`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Aggregation k ≥3 · moderation before display · zero interviewer PII

##### F-88 Technical Interview Platform

- Source: `SSOT.md` lines 1342-1400. Actors: Recruiter, Interviewer, Candidate. Permissions: not stated in extract.
- Data dependencies (intended): `interview_assessments`, `interview_recordings`, `interview_scores`, `interview_questions`, `assessment_templates`, `job_applications`, `interviews`
- External dependencies (intended): not stated in extract
- Security requirements: Room-scoped JWT tokens · Dual-consent for recording · Encryption at rest · Recording access audited · HDN-024 (peer-review fairness analog for interviews)
- Rule references: BR-169, BR-176, SCI-38, SCI-39, HDN-024, TD-05
- Acceptance (SSOT-extracted): Session join <3s · Code execution reuses TD-05 sandbox · Recording dual-consent enforced (100%) · AI feedback excludes protected attributes · Score append-only

##### F-91 Career Readiness Assessment

- Source: `SSOT.md` lines 1401-1439. Actors: Candidate. Permissions: not stated in extract.
- Data dependencies (intended): Derived from `profile_skills`, `profile_experience`, `profile_education`, `verified_credentials`, `course_enrollments`, `jobs`, `career_transitions`
- External dependencies (intended): not stated in extract
- Security requirements: Own-row only · AI computation transparent (factors shown) · No protected attributes in scoring
- Rule references: BR-163, BR-185, SCI-40
- Acceptance (SSOT-extracted): Readiness computed <500ms · Factors disclosed on every score · Zero protected attributes in model · Recalculation triggers within 60s of profile change

##### F-92 Advanced Recruiter Search

- Source: `SSOT.md` lines 1440-1474. Actors: Recruiter, Org Admin, Agency Recruiter. Permissions: not stated in extract.
- Data dependencies (intended): Derived from `profiles`, `profile_skills`, `verified_credentials`, `candidate_reputation`, `course_enrollments`, `challenge_submissions`
- External dependencies (intended): not stated in extract
- Security requirements: RLS org-scoped · Candidate privacy controls enforced · Zero stealth-mode leakage · Bulk operations audited
- Rule references: BR-064, SCI-41
- Acceptance (SSOT-extracted): Search p95 <500ms for 1M candidates · Zero stealth-mode leakage · Candidate consent revocation <24h · Bulk operations stable under load

##### F-93 Interview Video Recording & AI Feedback

- Source: `SSOT.md` lines 1894-1899. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `interview_recordings`, `interview_feedback`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-169, BR-176
- Acceptance (SSOT-extracted): Acceptance: Dual consent 100% · encryption at rest · retention ≤90d · no emotion analysis

##### F-94 Verified Work History & References

- Source: `SSOT.md` lines 1900-1904. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `verified_work_history`, `references`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Employment verification <7d · reference structured · zero resume fraud

##### F-95 Career Transition Planning

- Source: `SSOT.md` lines 1905-1910. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-84, F-85, F-91, F-07
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Plan generated <1s · progress tracked server-side

##### F-96 Skill Evidence & Digital Credentials

- Source: `SSOT.md` lines 885-996. Actors: Candidate (evidence contributor), Instructor/Peer (verifier), Recruiter (verifier), Employer (consumer). Permissions: User: issue (via achievement), view own, export. Public: verify via hash. Admin: revoke. Peer: endorse connected users..
- Data dependencies (intended): `verified_credentials`, `credential_evidence`, `endorsement_weights`, `profiles`, `xp_transactions`, `skill_endorsements`
- External dependencies (intended): not stated in extract
- Security requirements: SHA-256 hashing · Public verify endpoint rate-limited (60/min/IP) · No PII in verify response · RLS own-row for full credential list · Append-only enforcement at DB layer
- Rule references: BR-149, BR-156, BR-150, BR-151, BR-152, BR-153, BR-154, BR-155, SCI-42, SCI-17
- Acceptance (SSOT-extracted): Credential issuance <500ms; Public verify <200ms (cached); Zero PII exposure in public verify; 100% append-only enforcement (DB grants); Endorsement weight computation deterministic; Appeal resolved within 7 days SLA; Unit: hash generation, weight computation, appeal logic; Integration: issuance from each evidence source, revocation, RLS; E2E: complete course → credential issued → recruiter verifies

##### F-98 Employer Equity & Compensation Intelligence

- Source: `SSOT.md` lines 1911-1915. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `equity_norms`, `equity_reports`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-183
- Acceptance (SSOT-extracted): Acceptance: Separate from salary · aggregation k ≥5 · company-specific with ≥3 reports

##### F-99 AI Career Coach (Enhanced)

- Source: `SSOT.md` lines 1916-1920. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): not stated in extract
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Capability-specific evidence/quality gate · human review where required · no autonomous consequential action

##### F-102 Hiring Manager Portal

- Source: `SSOT.md` lines 1475-1503. Actors: Hiring Manager, Org Admin. Permissions: not stated in extract.
- Data dependencies (intended): `job_applications`, `scorecards`, `interviews`, `offers`, `interview_scores`, `career_outcomes`
- External dependencies (intended): not stated in extract
- Security requirements: RLS team-scoped · Aggregated team view only for HM · Org Admin sees all
- Rule references:
- Acceptance (SSOT-extracted): Dashboard p95 <800ms · Scorecard queue accurate · Zero cross-team leakage

##### F-104 Pre-Hire Assessment Customization

- Source: `SSOT.md` lines 1921-1925. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `custom_assessments`, `custom_assessment_attempts`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Admin approval required · assessment results feed ATS

##### F-106 Skill Prerequisite Engine

- Source: `SSOT.md` lines 1926-1931. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-84
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-022
- Acceptance (SSOT-extracted): Acceptance: Prereq check <100ms · auto-unlock on completion

##### F-110 Verified Skill Endorsements

- Source: `SSOT.md` lines 1932-1937. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `skill_endorsements`, `endorsement_weights`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-131, BR-152
- Acceptance (SSOT-extracted): Acceptance: Endorsement weight deterministic · endorsement revocable within 30d

##### F-114 Learning Impact Tracking

- Source: `SSOT.md` lines 1504-1538. Actors: Platform Admin, Instructor, Analyst. Permissions: not stated in extract.
- Data dependencies (intended): `learning_outcomes`, `outcome_correlations`, `course_enrollments`, `module_progress`, `job_applications`, `offers`, `hires`, `career_outcomes`
- External dependencies (intended): not stated in extract
- Security requirements: Aggregate-only · k ≥30 threshold · RLS instructor-scoped
- Rule references: BR-190, BR-193, BR-189, SCI-43
- Acceptance (SSOT-extracted): Correlation job completes nightly · k ≥30 enforced · Instructor sees only own course data · All claims labelled correlational

##### F-115 Certification Exam Platform

- Source: `SSOT.md` lines 1539-1598. Actors: Candidate, Exam Administrator, Proctor (Phase 6). Permissions: not stated in extract.
- Data dependencies (intended): `skill_certifications`, `certification_attempts`, `questions`, `question_banks`, `assessment_attempts`
- External dependencies (intended): not stated in extract
- Security requirements: Answer keys encrypted · Never sent to client before grading · Server-authoritative timer · Per-attempt question randomization
- Rule references: BR-124, BR-140, SCI-32, SCI-44
- Acceptance (SSOT-extracted): Server-authoritative timer (±100ms) · Answer keys never in client payload · Auto-grading <500ms · Exam submission idempotent · Item analysis computed within 24h

##### F-116 Accessibility & Inclusive Learning

- Source: `SSOT.md` lines 1938-1941. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): not stated in extract
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: WCAG 2.2 AA conformance · axe 0 critical/serious

##### F-121 Warm Introduction Paths

- Source: `SSOT.md` lines 1793-1805. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `introduction_paths` (derived), `introduction_requests`, `introduction_consents`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-209, BR-216, SCI-47, SCI-48
- Acceptance (SSOT-extracted): Acceptance: Path p95 <500ms depth ≤3 · 0 unauthorized path exposure · introducer consent DB-enforced · rate limit 10/week · delivery <5s

##### F-122 Application Feedback Loop

- Source: `SSOT.md` lines 1599-1657. Actors: Candidate, Recruiter, Hiring Manager. Permissions: not stated in extract.
- Data dependencies (intended): `application_feedback`, `feedback_templates`, `feedback_requests`, `job_applications`, `application_status_events`
- External dependencies (intended): not stated in extract
- Security requirements: RLS own-row for candidates · Org-scoped for recruiters · Feedback immutable once delivered · Audit trail for all feedback
- Rule references: BR-217, BR-224, SCI-49, SCI-50
- Acceptance (SSOT-extracted): Feedback delivery within 7 days of decision (when provided) · Zero PII leakage in feedback · Aggregate insights k ≥10 always · Candidate can request feedback (30-day window enforced) · Recruiter feedback rate >60% (target metric)

##### F-123 Skill Decay Tracking (Freshness Engine)

- Source: `SSOT.md` lines 1658-1716. Actors: Candidate, Recruiter, Admin. Permissions: not stated in extract.
- Data dependencies (intended): `skill_freshness`, `reverification_prompts`, `skill_currency_scores`, `verified_credentials`, `skill_market_signals`
- External dependencies (intended): not stated in extract
- Security requirements: Own-row RLS for freshness data · Recruiter visibility gated by consent or application context
- Rule references: BR-225, BR-232, SCI-51, SCI-52
- Acceptance (SSOT-extracted): Freshness computed nightly for all verified skills · Decay curves validated against market data (quarterly review) · Re-verification restores freshness within 24h · Zero freshness leakage without consent · Market drift alerts accurate (measure false positive rate)

##### F-125 Alumni Networks

- Source: `SSOT.md` lines 1942-1946. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `alumni_affiliations`, `alumni_groups`, `alumni_group_members`, `alumni_hiring`, `alumni_mentorship`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Affiliation verified · cross-institution isolation 100% · discovery p95 <500ms

##### F-142 Referral Request System

- Source: `SSOT.md` lines 1806-1818. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `referral_requests`, `referral_outcomes`, `referral_rewards`, `job_applications`, `connections`, `xp_transactions`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-233, BR-240, SCI-53
- Acceptance (SSOT-extracted): Acceptance: Delivery <5s · 100% employment verification · rate limits enforced · attribution 12mo · anti-abuse active

##### F-144 Reputation Engine (multi-context)

- Source: `SSOT.md` lines 1717-1751. Actors: All authenticated users. Permissions: not stated in extract.
- Data dependencies (intended): `reputation_scores`, `reputation_signals`, `reputation_history`, `reputation_config`
- External dependencies (intended): not stated in extract
- Security requirements: RLS own-row + aggregate public
- Rule references: BR-247, BR-254, SCI-55
- Acceptance (SSOT-extracted): Reputation computation nightly · Deterministic weighting · Zero individual signal leakage · Recovery path functional

##### F-145 Recommendation Engine Core

- Source: `SSOT.md` lines 1752-1788. Actors: All authenticated users. Permissions: not stated in extract.
- Data dependencies (intended): `recommendation_signals`, `user_preferences`, `recommendation_history`
- External dependencies (intended): not stated in extract
- Security requirements: RLS-scoped · No protected attributes (FAIR-001)
- Rule references: BR-255, BR-262, SCI-56
- Acceptance (SSOT-extracted): Recommendation p95 <500ms · Confidence threshold enforced · Explanations always present · Diversity injection active

##### F-146 Activity & Contribution Tracking

- Source: `SSOT.md` lines 1819-1829. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `activity_events`, `contribution_scores`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Activity tracked real-time · engagement scores deterministic · contributions feed F-159 Behavioral Talent Discovery

##### F-147 Unified Search & Discovery

- Source: `SSOT.md` lines 1830-1842. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): `search_index` (derived)
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references: BR-263, BR-268, SCI-57
- Acceptance (SSOT-extracted): Acceptance: Search p95 <300ms · 0 RLS leakage · autocomplete <100ms · typo tolerance active

##### F-148 Instructor Reputation System

- Source: `SSOT.md` lines 1843-1854. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `reputation_scores`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Instructor reputation computed nightly · transparent factor breakdown · no individual review manipulation

##### F-149 Employer Reputation & Brand System

- Source: `SSOT.md` lines 1947-1952. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `reputation_scores`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Multi-dimensional scoring · transparent factors

##### F-150 Peer Credibility Networks

- Source: `SSOT.md` lines 1855-1866. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `endorsement_weights`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Endorsement weight computation deterministic · network distance calculated correctly · zero gaming vectors

##### F-151 Skill Supply/Demand Forecasting

- Source: `SSOT.md` lines 1953-1958. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends `skill_market_signals`
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Forecast accuracy tracked · 12-month horizon · confidence intervals disclosed

##### F-152 Career Trajectory Analysis

- Source: `SSOT.md` lines 1959-1963. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-85
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Pattern detection statistically valid · k ≥20 per cell

##### F-153 Learning Impact Dashboard (Enhanced)

- Source: `SSOT.md` lines 1964-1968. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Extends F-114
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Correlation not causation · k ≥30 · all claims labelled

##### F-158 Talent Pool Intelligence & Analytics

- Source: `SSOT.md` lines 1969-1973. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-92
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Pool analytics computed on-demand · diversity metrics anonymized

##### F-159 Behavioral Talent Discovery

- Source: `SSOT.md` lines 1974-1980. Actors: not stated in extract. Permissions: not stated in extract.
- Data dependencies (intended): Derived from F-146
- External dependencies (intended): not stated in extract
- Security requirements: not stated in extract
- Rule references:
- Acceptance (SSOT-extracted): Acceptance: Discovery based on real activity · no gaming vectors

### 11. Requirement conflicts and gaps the reports recorded (decisions the target must make)

#### 11.1 Intent versus build (FEATURE_STATUS section D)

| Requirement source                                         | Intended behavior                                                                                                                                                           | What the earlier attempt built                                                                    | Conflict or gap                                                                 | Resolution proposed there                                                                   | Approval needed                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| SSOT amendments B; PRD section 8                           | Full trusted career loop for GA                                                                                                                                             | Durable job and evidence core; learning, assessment and career partial                            | A narrow job beta is not the full GA                                            | Ratify a beta subset and keep full-loop GA gates                                            | Product owner                                  |
| SSOT D; BR-49 and BR-51; F-08                              | Real assessment integrity                                                                                                                                                   | String-based simulated score; evidence unverified; UI disclaimer                                  | `passed`/100 stayed misleading API output                                       | Submission-only contract or an approved sandbox; never promote fake evidence                | Trust policy for scoring                       |
| SSOT architecture; TRD section 2                           | Supabase Auth and Queues, TanStack Query                                                                                                                                    | HMAC and PBKDF2 auth, Postgres job table, React state and `fetch`                                 | Intended and built architectures differ                                         | Keep the implemented architecture; ratify ADR-015; no framework rewrite                     | Owner                                          |
| SSOT F-01 and F-12 detail                                  | Account verification, reset, OAuth, refresh-token cookies, age gate, complete professional record with uploads, education and certification editing, per-section visibility | Email and password sign-up, basic profile                                                         | Whole-feature "implemented" labels exceeded the evidence                        | Classify partial; approve included subfeatures and sequence missing outcomes                | Product owner; security owner for auth changes |
| SSOT BR-001 versus registry BR-01                          | Unambiguous requirement ids                                                                                                                                                 | SSOT calls BR-001 auth-required; the registry's BR-01 is recruiter or admin job-posting authority | The same normalized id has different meanings                                   | Keep canonical registry identity; reconcile prose and test meaning before claiming coverage | Requirement owner                              |
| SSOT F-94 acceptance                                       | Employment verification under seven days and zero resume fraud                                                                                                              | Mailbox and token proof plus structured references                                                | An absolute fraud claim is not verifiable                                       | Bounded anti-fraud controls and measurable review outcome; do not promise zero fraud        | Product and trust owner                        |
| F-94; old X-02                                             | Working verification delivery                                                                                                                                               | A Resend adapter existed                                                                          | The old plan wrongly asked to create a missing adapter                          | Configure and test the existing adapter, sender and alerts                                  | Provider, cost, domain approval                |
| F-32, F-35; old X-01                                       | Durable feature state                                                                                                                                                       | Saved searches, bookmarks, flags and settings already had SQL stores                              | The blanket claim "every partial feature is ephemeral" was false                | Per-entity durability ledger and scoped migrations                                          | Launch scope; schema changes                   |
| F-07, 17, 52, 84, 85, 91, 95, 96                           | Reachable interfaces                                                                                                                                                        | Course, admin, verify, skills, career, credentials UI existed                                     | Older status and APP_FLOW said absent                                           | Updated evidence; keep partial and unverified                                               | None (factual)                                 |
| Settings and PRD privacy; issue "erasure"                  | Approved erasure lifecycle and recovery                                                                                                                                     | Durable request and cancel, immediate core anonymization, no due scheduler                        | 30-day request versus immediate execution; cross-store completion can fail      | Ratify policy; resumable cleanup; no legal-compliance claim                                 | Privacy and legal owner                        |
| Root architecture; ADR-015                                 | Accurate current architecture                                                                                                                                               | Resend, saved-search SQL, writer lease, heartbeat existed                                         | Some passages said no providers, no deployment config, all other modules memory | The current audit erratum governs                                                           | None                                           |
| Feature plan priority legend                               | Registry score 0 to 10 stays separate                                                                                                                                       | The old plan converted scores 9 to 10 into P0                                                     | Value confused with urgency                                                     | Separate columns; P0 only for evidenced release blockers                                    | Owner ratifies release scope                   |
| F-45, F-61; SSOT E                                         | Gated proctoring, premium tier, predictive hiring                                                                                                                           | Fields or stubs, or restricted implementations                                                    | API presence does not admit a capability to GA                                  | Keep gates and exclusions                                                                   | OD-35, OD-34, governance owner                 |
| PWA, TRD, accessibility targets                            | Offline layer and WCAG target                                                                                                                                               | Manifest and runtime detection; no registered service worker                                      | Installability does not prove offline or conformance                            | Offline work (X-04) only if scope requires it; manual accessibility checks                  | Scope and accessibility acceptance             |
| F-94 dependency F-58; F-84, learning and assessment cycles | Traceable dependencies                                                                                                                                                      | Work-history verification existed without written recommendations                                 | Registry edges are not necessarily hard blockers                                | Preserve ids and edges; distinguish product, technical and optional dependencies            | Owner for canonical edits                      |

#### 11.2 Requirement mismatches from the 2026-10-03 production audit (RM-01 to RM-08)

| ID    | Documented requirement                                                                                   | Actual then                                                          | Class                    |
| ----- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------ |
| RM-01 | Authentication and session: registration, verification, OAuth, password reset, persistent secure session | Email and password login plus an insecure demo fallback              | Incorrect implementation |
| RM-02 | Profile management page with editing and skills                                                          | API and domain existed; no `/profile` route                          | Partial                  |
| RM-03 | Direct messaging in the browser                                                                          | API and tests, no browser surface                                    | Partial                  |
| RM-04 | Notification center                                                                                      | APIs without a route                                                 | Partial                  |
| RM-05 | `/settings`                                                                                              | Backend routes only                                                  | Partial                  |
| RM-06 | Subscription purchase reconciled with the provider, webhook-owned fulfillment                            | Server activated immediately; frontend could display success locally | Incorrect                |
| RM-07 | Webhook signature, timestamp and replay protection                                                       | Idempotency only                                                     | Incorrect                |
| RM-08 | Offline resilience and PWA direction                                                                     | Manifest only; the e2e test acknowledged no offline support          | Missing                  |

#### 11.3 Journeys an end-user and business-owner audit expected (2026-10-03 matrix A to L)

| Journey                 | Expected                                                                                         | Finding then                                                                                             | Severity                 |
| ----------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| A First-time onboarding | Landing, sign up, verify email, onboarding wizard, goal selection, skill baseline, profile setup | Landing to dashboard without authentication; no `/register`, `/verify-email`, `/forgot-password`         | Critical                 |
| B Returning user        | Persistent session, personalized dashboard, retained data                                        | Identity from `localStorage`; state in maps; restart orphaned tokens                                     | Critical                 |
| C Authentication        | Registration, verification, OAuth, reset, session recovery                                       | Backend registration and signed tokens existed; UI had login plus fake fallback only                     | Partial                  |
| D Contact management    | A relationship-management experience built on contact records                                    | Connection requests existed in the API; no browser experience                                            | High (Missing)           |
| E Birthday tracking     | A dedicated capability                                                                           | None found anywhere in apps, packages, database or tests                                                 | High (Missing)           |
| F Notification flow     | Center, delivery, preferences                                                                    | APIs and a log-only worker; no UI                                                                        | High                     |
| G AI message generation | Composer, edit, send workflow                                                                    | A deterministic assistant endpoint, no composer                                                          | Incorrect or incomplete  |
| H Message editing       | Edit with version semantics                                                                      | Not demonstrated                                                                                         | Medium or High (Missing) |
| I Message delivery      | End-to-end delivery                                                                              | Threads and deduplication by `clientMessageId` existed; delivery only logged                             | High                     |
| J Subscription flow     | Select plan, provider authorization, webhook, reconciled entitlement                             | Local confirmation after a best-effort API call                                                          | Incorrect                |
| K Settings flow         | Settings, export, erasure in the UI                                                              | Backend only                                                                                             | High                     |
| L Error recovery        | Failure, explain, preserve, retry, alternate path, confirm final state                           | API envelopes good (request ids, 401, 403, 404, 409, 429, 500); the frontend turned failure into success | Weak                     |

Also expected and missing then: onboarding wizard, goal creation, skill onboarding, application tracking UI, offline mode, and APIs without any browser surface (recruiter search, talent pools, application review, resumes, portfolio, networking, search, saved searches, billing, career intelligence, moderation, analytics, alumni, referrals, reputation, salary intelligence). Quick wins the auditor listed: remove the demo fallback; make UI success depend on API success; make pages data-driven; route guards; a real settings surface; the first messaging UI; remove unsupported compliance claims. The auditor's remediation order: Phase 0 stop pretending transactions succeeded; Phase 1 real persistence; Phase 2 real billing; Phase 3 the core candidate loop in the order Register, Verify, Onboard, Goal, Skills, Evidence, Profile, Jobs, Apply, Track; Phase 4 expose backend capabilities (profile, applications, messages, notifications, networking, resumes, portfolio, settings); Phase 5 real worker integrations (email, push, queue persistence, retries, dead-letter, delivery status); Phase 6 AI productization (entitlement, provider selection, generation, provenance, cost accounting, human review, action); Phase 7 observability and load testing (API p50, p95, p99, database latency, queue age, failed jobs, webhook lag, payment reconciliation delay, AI cost per user, activation, application conversion, retention).

#### 11.4 Prior scorecard (for calibration only)

2026-10-03 production-readiness scorecard at commit `8db0930`: architecture 5, business readiness 2, feature completeness 4, UX 4, accessibility 8, security 2, performance 5, test coverage 7; mean 4.625, reported as **4.6 of 10, NOT READY**. Four independent same-day passes produced materially identical findings. Verdicts afterwards: 2026-10-14 "not production-ready; ready for a closed developer-run demonstration"; 2026-10-21 "not ready for public beta or GA"; 2026-10-22 "gated"; 2026-10-23 "NOT READY for production or a paid public launch".

### 12. Developer-tooling requirements recorded in the reports (non-product)

These are requirements for repository tooling, not for the product. Suggested home: `29_DEVELOPER_IMPLEMENTATION_GUIDE`. Kept here so they are not lost.

#### 12.1 Universal clean-and-reinstall tool (Windows; `ORIGINAL_REQUEST.md` of 2026-10-22, quoted in MAINTENANCE_AUDIT)

- **R1 Discovery.** Scan recursively to a configurable `--max-depth` (default 5). Detect Node (npm, Yarn classic and berry, pnpm, Bun), Python (pip, poetry, pipenv, uv, venv or .venv), .NET (.sln, .csproj, .fsproj), Java (Maven pom.xml, Gradle, wrappers), PHP Composer, Ruby Bundler, Rust Cargo, Go, CMake or Make. Be workspace aware (pnpm-workspace.yaml, npm or yarn workspaces, Lerna, Turborepo, Nx, cargo workspaces): install only at the workspace root. Never traverse dependency or output directories (`node_modules`, `.venv`, `vendor`, `target`, `bin`, `obj`, `.next`) and reject symlinks or junctions that point outside the repository.
- **R2 Cleanup.** Remove build output, local dependency folders and temporary caches per technology. Never delete source, configuration (`.env*`, `.git`, IDE settings), manifests or lockfiles. Canonicalize every target and verify it is strictly inside the project root; forbid drive roots and system directories. Optional `--deep-clean` and `--clean-only`.
- **R3 Reinstall.** Deterministic installs from lockfiles (`pnpm install --frozen-lockfile`, `npm ci`, `yarn install --immutable`, `poetry install`, `uv sync`, `cargo fetch/build`, `dotnet restore`); prefer local wrappers (`mvnw`, `gradlew`); detect tools on PATH and warn and skip when absent; optional `--build`; `--install-only`.
- **R4 CLI.** A batch entry point forwarding all arguments to a PowerShell engine; flags `--dry-run`, `--clean-only`, `--install-only`, `--build`, `--deep-clean`, `--root`, `--exclude`, `--max-depth`, `--continue-on-error`, `--verbose`, `--help`; interactive confirmation when run without arguments; a structured timestamped log without secrets and a console summary with a non-zero exit code on errors.
- **Acceptance.** Polyglot structures identified with monorepo packages marked workspace-managed and no redundant installs; dependency folders ignored and escaping symlinks skipped; `--dry-run` prints exact paths and changes nothing; cleanup removes generated folders and preserves 100 percent of lockfiles, `.env`, `.git` and source; path canonicalization blocks deletion outside the root; frozen install commands match the detected manager; missing tools warn without stopping independent projects under `--continue-on-error`; a run summary and log with counts of discovered, cleaned, reinstalled and failed projects.
- **Prior test suite (38 cases, 4 tiers, all passed in about 77 seconds).** Tier 1 feature coverage TC-01 to TC-20 (entry point, parameter parsing and aliases, mutual exclusion, logging and secret redaction, path containment, depth scanning, traversal pruning, junction security, ecosystem detection for Node, Python, Rust, Java, .NET, workspace resolution, standard and deep cleanup, absolute guardrails, dry run, missing-tool detection, wrapper preference, frozen reinstall, post-install build); Tier 2 boundaries and attack vectors TC-21 to TC-28 (special characters in paths, non-interactive guard, complex secret patterns in URLs, AWS keys and JWTs, traversal escape, exact depth boundary, escaping junctions, mixed workspaces, read-only file attributes); Tier 3 pairwise interactions TC-29 to TC-33; Tier 4 realistic polyglot monorepo scenarios TC-34 to TC-38. A defect found and escalated: an empty scan result wrapped as a one-element array (`return ,$rawProjects`) made target paths resolve against the working directory.

#### 12.2 Bash maintenance tool design (MAINTENANCE_AUDIT, 2026-10-21; deliverables were absent from the next checkout)

- Default execution mutates nothing; a plan with exact deletion targets and command arrays is shown, then a fresh explicit confirmation (the exact token `APPLY`; `EXPORT` for report export); empty input and end-of-input cancel; no `--yes` bypass.
- Discovery uses `find -P` with NUL delimiters, physical roots, no symlink traversal; workspace membership from configuration, never executing configuration modules; ambiguous output configuration is review-only; unsupported language families are reported, not guessed.
- Candidate classes: safe (configured TypeScript output, composite metadata, known test output), review-only (`graphify-out` cache, `supabase/.temp`, names like `build`, `cache`, `vendor` without a project-specific contract), prohibited (tracked files, `.audit`, browser evidence, vault, project memory, backups, env files, lockfiles, manifests, source, migrations, static assets, compose volumes).
- Safety: recheck root containment, ancestors, symlinks and provenance immediately before deletion; a repository-local lock; no eval or string-concatenated commands; no global cache purge; lifecycle scripts disabled during restore; no database writes, Docker cleanup or server termination; report files private (mode 600 temporary capture), no environment dump; exit codes 0 success or cancel, 1 partial failure, 2 invalid input, 3 fatal safety or prerequisite error, 130 interrupt, 143 termination.
- Tests: fixture repositories under the system temp directory, stub package managers, 74 assertions in the prior run (native symlink and Unix permission checks explicitly skipped on Windows rather than reported as passing).
- Existing repository script treatment (from the discovery table): installation was one frozen workspace-root restore (not ten installs) after enforcing the declared package-manager version and inspecting lifecycle scripts; builds are opt-in and compile shared packages before applications; type-check emits output and metadata, so it is write-producing, not read-only; offer the format check, never the format writer, as validation; tests that import built workspace packages need a rebuild after output cleanup; browser tests need built outputs, Chromium and free server ports (4000 and 4173); the real-database tests need an explicitly isolated test database, never one inferred from available credentials; migration, seed, release preflight, asset generation, the test server bootstrap, deployment files and backup and restore scripts are excluded from routine maintenance; compose volumes for database, proxy data and proxy config are never local cleanup targets; there was no separately named smoke script.
- Candidate artifacts then present: nine `dist` directories, nine incremental-build metadata files, ten `node_modules` (about 150 MB root), Playwright `test-results`; sizes are allocation readings, not reclaimable space, and must not be summed.

### 13. Requirement gaps the reports left open (X-00 scope)

- Of 248 business rules, none had semantic acceptance verified: 106 carried code or test annotation matches (a matching `BR-` comment is not proof of satisfaction), 142 had no reference. Exhaustive reduction of PRD, TRD and the SSOT subrequirements into atomic requirements was never done; only 46 of 173 features got an extracted contract.
- All 28 journeys (J-01 to J-28) were inventoried; selected subsets were traced (identity and session, work-history proof, J-02 apply and track, J-03 and J-04 recruiter, communication, account deletion, J-01 and J-19 learning and proof, J-26 career, monetization); none was run end to end; J-05 to J-28 terminals not covered by those traces were explicitly unverified.
- Journey list (persona and terminal state as recorded): J-01 Learn, Prove, Showcase (portfolio with verified signals); J-02 Apply, Track, Hire (offer accepted); J-03 Post, Source, Hire (offer extended); J-04 Org Setup, Team, Launch (first hire); J-05 Profile, Network, Referral (referred hire); J-06 AI Career Path (gaps addressed); J-07 Creator Author, Publish, Monetize (revenue); J-08 Mentor Match, Guide, Impact; J-09 Institution Cohort, Place, Track (placement reported); J-10 Agency Multi-Org, Pipeline, Bill; J-11 Extension Install, Local-First, Sync (profile diff applied); J-12 B2B2C Graduation Flywheel; J-13 Institutional Media Authoring; J-14 Institutional Procurement and Licensing (seats provisioned); J-15 Faculty Teach, Monitor, Intervene; J-16 Corporate L&D Mandate, Track, Certify (certification plus HRIS sync); J-17 LinkedIn Migration On-ramp; J-18 Creator Author, Publish, Sell, Payout (monthly settlement); J-19 Self-Paced Learner Discover, Certify; J-20 Learner Path, Courses, Capstone, Cert (program certificate); J-21 Contestant Register, Compete, Rank, Certify; J-22 Researcher Company, Reviews, Compare, Apply; J-23 Author Post, Engage, Article, Newsletter; J-24 Reviewer Write, Moderate, Publish, Response; J-25 Peer Reviewer Assigned, Rubric Review, Feedback (grade finalized); J-26 Career Switcher Assess, Plan, Transition (role transition confirmed); J-27 Hiring Manager Define, Assess, Hire, Track (post-hire outcome recorded); J-28 Skills Analyst Analyze, Recommend, Measure (learning program impact reported). The target's journey set is in `06_BUSINESS_PROCESSES`.
- Not measured by the prior attempt and therefore without a baseline: revenue, conversion, cost, usage, capacity, production performance SLOs, database query counts, queue age under load, cold-boot time at volume, restore time, or real mailbox delivery.
- Items "not found" are search-limited: "no matching code found" is a checklist to confirm with the owner, not proof of absence.

#### 13.1 Earlier "what to add next" ordering (static assessment of 2026-10-21, retained as history)

Ordered by value for effort, items 1 to 3 using code that already existed: (1) durable storage for the long-tail modules behind the persistence path before adding more features; (2) web screens for existing APIs, highest value first: referrals (F-142) and warm intros (F-121) on the network page; endorsements (F-110) and peer credibility (F-150) on profile and work history; public certificate verification (F-52) at `/verify/:hash`; admin console (F-17, F-35, F-83) and moderation queue (F-24); saved searches and job alerts (F-32); skills graph (F-84) and career transitions (F-85, F-95) as profile tabs; (3) wire billing for real, with simulated mode clearly labelled, and gate the candidate plan (F-61); (4) a digest job (F-29) once an email provider exists; (5) quiz and course reviews (F-68, F-72); (6) a service worker for offline caching, or stop calling the app offline-capable; (7) interview room UI (F-33, F-88); (8) features not in the registry that reuse existing APIs: a member directory so network search finds people without typing a name, and an email-verified outreach flow for recruiters. Matrix of 2026-10-22 recommended this durability order for the 91 partial features: F-08 challenges and assessment, F-07 LMS, F-36 draft autosave, F-26 portfolio, F-17 admin console.

## Micro-Feature Specifications

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/MICRO_FEATURE_SPECS.md`._

Doc ID: SPEC-MICRO · Owner: Product Director (Functional Spec) · Version 1.0 · Status: Under Review · Relates: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` (every ID below exists there), BR-REG, INV-REG, DT-00, SM-00, SPEC-01…SPEC-14

> **Revision 2 folded in (2026-10-27)** from `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

Compact, implementation-ready specs for small behaviours that need an unambiguous rule but not a full document. **[TARGET]**; `{…}` **[OPEN]**. Each row carries: **Rule** (what is always true), **Inputs/validation**, **Behaviour**, **Edge/failure**, **AC** (Given/When/Then in one line; ID `AC-<micro id>-NN`), **Test** (UT unit, IT integration, E2E, SEC, A11Y accessibility, PROP property). Phase and priority are inherited from the parent feature in the hierarchy. Where a micro-feature is fully specified in a long-form spec, the row points there instead of repeating.

### 1. Identity & access

| ID           | Micro-feature                            | Rule · Inputs · Behaviour                                                                                                                               | Edge / failure                                                               | AC                                                                                                             | Test         |
| ------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| FEAT-01-01.2 | Breached-password check                  | Password hashed-prefix lookup (k-anonymity) against breach list; reject if present (BR-T051). Input: candidate password (never sent in full).           | List unavailable ⇒ accept only ≥ 14 chars and schedule re-check (SPEC-01 §9) | AC-01-01.2-01: Given password in list, When register, Then `422 password_breached`, no account                 | UT, SEC      |
| FEAT-01-01.4 | Enumeration-safe responses               | Register/login/reset return the same status and body for known and unknown emails; existing-owner gets an informational email.                          | Latency difference ≤ noise floor in test harness                             | AC-01-01.4-01: Given known and unknown email, When request reset, Then identical body and status               | SEC          |
| FEAT-01-02.1 | Progressive lockout                      | After 5 consecutive failures per (account, IP bucket): delay = min(15 min, 2^(n−5)·15 s); applies even to correct password during delay (BR-T052).      | Different IP bucket unaffected; success resets counter                       | AC-01-02.1-01: Given 5 failures, When correct password 1 s later, Then `429 Retry-After`                       | IT, SEC      |
| FEAT-01-02.2 | New-device sign-in notice                | On sign-in from a device label/UA hash not seen in last 90 d, email holder within 5 min with "revoke" link (BR-T059).                                   | Suppressed for first sign-in after registration                              | AC-01-02.2-01: Given new device, When login, Then one email within 5 min                                       | IT           |
| FEAT-01-02.3 | Remember-me                              | Checkbox extends session absolute lifetime to {90} d; idle timeout unchanged; ignored for privileged roles.                                             | Shared-device warning text shown                                             | AC-01-02.3-01: Given remember-me, When 31 d pass with activity, Then session still valid; without it ⇒ expired | IT           |
| FEAT-01-03.4 | Passkey fallback                         | WebAuthn feature-detected; if unsupported or cancelled, password path remains fully functional; no dead ends.                                           | Passkey-only account on unsupported device ⇒ recovery email flow             | AC-01-03.4-01: Given no WebAuthn API, When open login, Then passkey UI absent and password login works         | E2E (WebKit) |
| FEAT-01-05.1 | Revoke other sessions on password change | Password change/reset revokes all families except the current (change) or all (reset).                                                                  | Concurrent refresh during revoke ⇒ 401 reuse-safe                            | AC-01-05.1-01: Given 3 sessions, When change password, Then 2 revoked within 60 s                              | IT           |
| FEAT-02-02.1 | Invite expiry                            | Org invite token hashed, TTL 7 d, single-use, bound to invited email; accepting requires matching verified email.                                       | Expired ⇒ admin may resend (new token)                                       | AC-02-02.1-01: Given invite 7 d + 1 s old, When accept, Then `410`                                             | UT           |
| FEAT-02-02.3 | Revoke pending invite                    | Admin can revoke any pending invite; token dies immediately.                                                                                            | Revoke after accept ⇒ no-op with message                                     | AC-02-02.3-01: Given pending invite, When revoke, Then accept ⇒ `410`                                          | IT           |
| FEAT-02-03.1 | Last-owner protection                    | An org must always have ≥ 1 `org_owner`; demoting/removing the last owner is refused; transfer ownership first.                                         | Concurrent demotions of two owners ⇒ one fails (row lock)                    | AC-02-03.1-01: Given 2 owners, When both demote each other concurrently, Then exactly one succeeds             | IT           |
| FEAT-20-02.3 | Subject notification of support access   | When a support grant starts, notify the subject ("Support accessed your data for ticket X, until HH:MM") unless suppression applies (BR-T042, OPEN-08). | Notification failure does not block the grant but is audited                 | AC-20-02.3-01: Given grant created, When start, Then subject receives notice and audit shows grant id          | IT           |

### 2. Profile, showcase, preferences

| ID           | Micro-feature                    | Rule · Inputs · Behaviour                                                                                                                                                                                                                                                                                                | Edge / failure                                                                                   | AC                                                                                                         | Test    |
| ------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------- |
| FEAT-03-04.1 | Resume variant                   | Per-target-role variant = (selected evidence ids ≤ 12, work claims, skills ≤ 20, summary ≤ 600, template). Free ≤ 1 variant; premium more (DT-02b). Variant never contains data the owner hasn't made visible for applications.                                                                                          | Referenced evidence later revoked ⇒ variant shows "evidence removed" placeholder and warns owner | AC-03-04.1-01: Given 2 variants, When export B, Then output contains only B's selections                   | IT, E2E |
| FEAT-03-04.2 | Accessible PDF export            | Tagged PDF (headings, reading order, language, alt text); filename `<name>-<variant>.pdf`.                                                                                                                                                                                                                               | Fonts missing ⇒ fallback embedded font                                                           | AC-03-04.2-01: Given exported PDF, When checked with an accessibility validator, Then no critical failures | A11Y    |
| FEAT-03-04.3 | Variant evidence/skill selection | Picker shows rung chips; unverified items allowed but labelled "Not verified" on the résumé.                                                                                                                                                                                                                             | Selection limit exceeded ⇒ `422`                                                                 | AC-03-04.3-01: Given 13th evidence selected, When save, Then `422`                                         | UT      |
| FEAT-03-06.1 | Vanity slug                      | 3–30 `[a-z0-9-]`, no edge hyphens, unique, reserved list; change ≤ once per 30 d; old slug redirects 90 d (SPEC-02 §3.3).                                                                                                                                                                                                | Race ⇒ `409`                                                                                     | AC-03-06.1-01: Given taken slug, When set, Then `409 slug_taken`                                           | UT      |
| FEAT-03-06.2 | Expiring share link              | Random ≥128-bit token stored hashed; expiry default 14 d, max 90 d; revocable; shows evidence subset (SPEC-02).                                                                                                                                                                                                          | Expired vs missing ⇒ same `404`                                                                  | AC-03-06.2-01: Given expired and unknown links, When open, Then identical responses                        | SEC     |
| FEAT-03-08.1 | Draft conflict resolution        | Edits carry `If-Match`; mismatch ⇒ `412` + server doc; UI offers per-field choose-mine/theirs/merge for text.                                                                                                                                                                                                            | Both edited same field ⇒ explicit choice, never auto-merge text                                  | AC-03-08.1-01: Given stale ETag, When save, Then `412` and neither version lost                            | IT, E2E |
| FEAT-03-08.2 | Offline queued profile edit      | Edits stored locally with `baseVersion`; replayed on reconnect through same PATCH; max queue {50} edits; user sees "will sync".                                                                                                                                                                                          | Account state changed (deactivated) ⇒ discarded with notice                                      | AC-03-08.2-01: Given offline edit and newer server version, When reconnect, Then conflict UI               | E2E     |
| FEAT-03-09.1 | Private salary expectation       | Optional range + currency; visible only to the candidate; used only for candidate-side overlap hints; never sent to recruiters or scorers (DT-03).                                                                                                                                                                       | Export includes it                                                                               | AC-03-09.1-01: Given salary set, When recruiter fetches profile, Then field absent in payload              | SEC     |
| FEAT-03-09.3 | Blocked employers                | ≤ 200 orgs; hides candidate from the org's search, shortlist and outreach (INV-T40); candidate may still apply (explicit confirm clears block for that org).                                                                                                                                                             | Org merges/renames ⇒ block follows org id                                                        | AC-03-09.3-01: Given org blocked, When org searches, Then candidate absent                                 | IT      |
| FEAT-22-01.4 | Per-employer artefact grant      | Grant `evidence.share_artefact` (was `CS-EVID-ARTEFACT`) to one org id (`grantee_type=org`, `grantee_id`), optionally narrowed to one evidence item (`target_id`), with optional expiry (default {12 months}); revocable; listed in consent centre; denial applies from the first read after revocation (CSC section 6). | Org deleted ⇒ grant auto-ends                                                                    | AC-22-01.4-01: Given grant to Org A, When Org B recruiter opens artefact, Then denied                      | SEC     |

### 3. Evidence, verification, assessment

| ID           | Micro-feature                       | Rule · Inputs · Behaviour                                                                                                                                                                       | Edge / failure                                                   | AC                                                                                            | Test |
| ------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| FEAT-05-01.2 | Link evidence liveness check        | HTTPS only; DNS resolved server-side; private/link-local/metadata ranges rejected; ≤ 3 redirects; 5 s timeout; success on 200; recheck every 30 d; failing 14 d ⇒ provenance invalid (BR-T009). | Slow host ⇒ saved as `claimed` with "not yet checked"            | AC-05-01.2-01: Given link to 169.254.169.254, When submit, Then rejected, no outbound request | SEC  |
| FEAT-05-05.3 | Holder notified of revocation       | Notice ≤ 24 h: reason category, effects (skills, matches updated), appeal link and deadline (30 d).                                                                                             | Email fails ⇒ in-app notice remains; retry                       | AC-05-05.3-01: Given revoke, When 24 h pass, Then in-app and email notices exist              | IT   |
| FEAT-05-12.1 | Quarantine until scan clean         | Uploaded blob lives in private quarantine bucket; unreadable by any other principal; promoted only on clean verdict (BR-T003).                                                                  | Scanner outage ⇒ stays pending; never auto-promote               | AC-05-12.1-01: Given pending_scan item, When another user requests blob, Then `404`           | SEC  |
| FEAT-05-12.3 | Preview thumbnails                  | Generated only after clean scan; images re-encoded; EXIF location stripped; non-image types show icon.                                                                                          | Thumbnail failure ⇒ item still usable                            | AC-05-12.3-01: Given JPEG with GPS, When thumbnail served, Then no GPS tags                   | UT   |
| FEAT-06-02.3 | Referee reminders                   | Exactly two reminders on day 4 and day 9 while unanswered; none after submit/cancel/expiry (BR-T022).                                                                                           | Job rerun ⇒ no duplicates (key `(request, n)`)                   | AC-06-02.3-01: Given job run twice on day 4, When count emails, Then 1                        | IT   |
| FEAT-06-02.4 | Referee decline / "don't know them" | Single-click decline; optional reason not shown to candidate; outcome per DT-04 rows 5–6.                                                                                                       | Decline then later submit with same token ⇒ refused (single-use) | AC-06-02.4-01: Given decline, When candidate views, Then neutral message, no rung change      | IT   |
| FEAT-06-02.5 | Referee consent to be named         | Unticked checkbox "recruiters may see my name"; stored on response; governs display (BR-T023).                                                                                                  | Consent cannot be added later without a new response             | AC-06-02.5-01: Given unticked, When recruiter views, Then "former colleague" only             | UT   |
| FEAT-07-02.1 | Answer autosave                     | `PUT` per question with `clientSeq`; highest seq wins; idempotent; rejected after deadline (SPEC-05).                                                                                           | Out-of-order seqs tolerated                                      | AC-07-02.1-01: Given seq 5 then 4, When both arrive, Then stored value = seq 5                | UT   |
| FEAT-07-02.2 | Server-authoritative timer          | `deadline_at` from DB time; client shows synced countdown; auto-submit at deadline (job + lazy check).                                                                                          | Client clock manipulation has no effect                          | AC-07-02.2-01: Given client clock −2 h, When view timer, Then derived from server             | SEC  |
| FEAT-07-02.4 | Accommodation extra time            | Multiplier {1.25, 1.5, 2.0} stored on attempt by support/instructor; invisible to recruiters (BR-T030).                                                                                         | Granted after start ⇒ applies to next attempt only               | AC-07-02.4-01: Given ×1.5 on 40 min, When start, Then deadline = +60 min                      | UT   |
| FEAT-07-08.1 | Retake cooldown                     | {24 h} after a failed attempt; ≤ {3} attempts/7 d (BR-T028).                                                                                                                                    | Instructor override with reason                                  | AC-07-08.1-01: Given fail at T, When start at T+23:59, Then `409`; at T+24:00 allowed         | UT   |

### 4. Learning

| ID           | Micro-feature                   | Rule · Inputs · Behaviour                                                                                                                       | Edge / failure                                        | AC                                                                                                                      | Test |
| ------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---- |
| FEAT-08-03.1 | Resume lesson position          | Server stores last `positionSeconds` per lesson (max seq wins); resume offered at ≥ 5 s and < 95 %.                                             | Different devices ⇒ latest wins                       | AC-08-03.1-01: Given pause at 120 s on phone, When open on laptop, Then offered resume at 120 s                         | E2E  |
| FEAT-08-03.2 | Offline lesson cache            | Only lessons flagged cacheable; read-only; cache invalidated on version change; progress queued, never completion (INV-T13).                    | Storage quota exceeded ⇒ user chooses what to keep    | AC-08-03.2-01: Given cached text lesson offline, When mark complete, Then queued; completion only after server confirms | E2E  |
| FEAT-08-03.3 | Captions & transcripts required | Video lesson cannot be published without captions + transcript (instructor studio gate); learner player shows captions by default if available. | Auto-captions flagged "auto-generated" until reviewed | AC-08-03.3-01: Given video without captions, When publish, Then blocked with reason                                     | UT   |

### 5. Opportunities, applications, hiring

| ID           | Micro-feature              | Rule · Inputs · Behaviour                                                                                                                                                   | Edge / failure                                               | AC                                                                                                           | Test          |
| ------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------- |
| FEAT-09-01.2 | Pay-range disclosure       | Fields `{currency, min, max, period, disclosed}`; `min ≤ max`; undisclosed allowed unless org policy/jurisdiction requires {OPEN-08}; disclosed pay searchable by `payMin`. | Currency mismatch with location ⇒ warning only               | AC-09-01.2-01: Given min > max, When save, Then `422`                                                        | UT            |
| FEAT-09-01.5 | Inclusive-language check   | Configurable term lists: warn on flagged terms, hard-block only "never allowed" list; results logged for audit; no legal claim.                                             | False positives dismissible with reason                      | AC-09-01.5-01: Given flagged term, When publish, Then warning shown and dismissal recorded                   | UT            |
| FEAT-09-02.3 | Scheduled publish          | `publish_at` future ≤ 30 d; at run time re-check entitlement + validation; failure ⇒ back to `draft` + notify (SM-JOB t6).                                                  | Clock change ⇒ uses UTC instant                              | AC-09-02.3-01: Given lapsed subscription at run time, When scheduled time arrives, Then job returns to draft | IT            |
| FEAT-09-06.1 | Saved search alert         | Saved search = normalised query + filters; alert when a _new published_ job matches; consent for email/push per FEAT-15-02. Limit {20} saved searches.                      | Search deleted while alert queued ⇒ drop                     | AC-09-06.1-01: Given saved search, When matching job published, Then one alert within 15 min                 | IT            |
| FEAT-09-06.2 | Alert frequency            | `instant`, `daily` (digest at 08:00 local), `weekly`; default daily.                                                                                                        | Changing frequency applies to next window                    | AC-09-06.2-01: Given daily, When 3 jobs match in a day, Then one digest with 3 jobs                          | IT            |
| FEAT-09-06.3 | Alert dedupe               | A job is alerted at most once per (user, saved search) and at most once per user per day across searches (merged into one message).                                         | Job edited ⇒ not re-alerted                                  | AC-09-06.3-01: Given job matches 2 saved searches, When published, Then one notification listing both        | UT            |
| FEAT-10-01.1 | Offline draft queue        | Draft edits queued with `baseVersion`/`clientSeq`; submit disabled offline; replay idempotent (SPEC-09).                                                                    | Quota/localStorage full ⇒ visible warning                    | AC-10-01.1-01: Given offline edits, When reconnect, Then synced without loss                                 | E2E           |
| FEAT-10-02.2 | Duplicate-click protection | Submit button disables on first click; server idempotency by `Idempotency-Key`; second request returns first result.                                                        | Network retry with new key ⇒ `409 already_applied` with link | AC-10-02.2-01: Given double click, When processed, Then one application                                      | E2E, IT       |
| FEAT-10-07.2 | Interview reschedule       | Either party ≥ 2 h before start; new `proposed` linked; ICS SEQUENCE+1; old `rescheduled` (SM-INTERVIEW t4).                                                                | < 2 h ⇒ `409 too_late`                                       | AC-10-07.2-01: Given 3 h before, When reschedule, Then new proposal created                                  | IT            |
| FEAT-10-07.5 | Time-zone-safe display     | Store UTC + IANA zone; render in viewer zone with explicit offset; show both when zones differ; DST-safe.                                                                   | Missing zone ⇒ prompt                                        | AC-10-07.5-01: Given interview across DST change, When viewed, Then correct local time and offset            | UT (property) |

### 6. Engagement, notifications, billing, privacy, institutions, platform

| ID           | Micro-feature                      | Rule · Inputs · Behaviour                                                                                                                       | Edge / failure                                                            | AC                                                                                                    | Test |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---- |
| FEAT-13-02.2 | Per-candidate outreach cooldown    | After a decline, same org blocked from first contact to that candidate for {30} d (BR-T081).                                                    | Different org unaffected                                                  | AC-13-02.2-01: Given decline at T, When same org at T+29 d, Then `409 cooldown`                       | UT   |
| FEAT-13-03.1 | Queued send with idempotency key   | Offline-composed message has `clientMessageId`; server dedupes; ordered replay; > 24 h asks confirmation.                                       | Thread blocked meanwhile ⇒ returns to composer                            | AC-13-03.1-01: Given 3 queued, When reconnect, Then delivered once, in order                          | E2E  |
| FEAT-13-05.2 | Mute thread                        | Mute suppresses notifications for that thread; unread count continues; unmute any time.                                                         | Mute does not affect safety notices                                       | AC-13-05.2-01: Given muted, When new message, Then no email/push                                      | IT   |
| FEAT-15-02.1 | Quiet hours                        | Default 21:00–08:00 local (user tz); defers non-mandatory, non-time-critical deliveries until end; user may change/disable; DST-safe (BR-T086). | Tz unknown ⇒ use account locale tz; ask on first prompt                   | AC-15-02.1-01: Given engagement notice at 22:00, When route, Then deferred to 08:00                   | IT   |
| FEAT-15-02.2 | Mandatory transactional categories | Security, verification, legal, billing categories cannot be disabled; preferences UI shows them as locked with reason (BR-T085).                | Suppression list still honoured for hard bounces                          | AC-15-02.2-01: Given user disabled all optional, When password reset requested, Then email still sent | UT   |
| FEAT-15-05.1 | Nudge frequency cap                | ≤ 3 nudges/week and ≤ 1/day/user; priority order; suppressed when user acted recently (BR-T087).                                                | Cap resets Monday 00:00 user tz                                           | AC-15-05.1-01: Given 3 nudges this week, When 4th eligible, Then suppressed                           | UT   |
| FEAT-16-07.1 | Past-due grace window              | {7} d full entitlements after `invoice.payment_failed`, then degrade; notices day 0/3/6 (SPEC-12).                                              | Payment on day 7 exact boundary ⇒ restored                                | AC-16-07.1-01: Given past_due day 6/day 8, When derive, Then full/degraded                            | UT   |
| FEAT-16-11.1 | AI quota meter                     | Credits per period by plan; atomic conditional decrement; blocked at 0 with upgrade message; free tier 0 paid inference (INV-T07).              | Streaming call partially consumed ⇒ charge actual units, floor at limit   | AC-16-11.1-01: Given 1 credit and 2 concurrent calls, When processed, Then one succeeds               | IT   |
| FEAT-22-02.2 | Expiring download link             | One-time signed URL TTL 15 min created after re-auth; archive deleted after 7 d (SPEC-13).                                                      | Link reuse ⇒ `410`                                                        | AC-22-02.2-01: Given used link, When reused, Then `410`                                               | SEC  |
| FEAT-22-03.1 | Erasure cooling-off cancel         | 7-day window; sign-in only shows cancel page; cancel restores prior state; reminders day 1 and 6.                                               | Cancel at day 7 + 1 s ⇒ refused                                           | AC-22-03.1-01: Given day 3, When cancel, Then account restored                                        | IT   |
| FEAT-18-02.1 | CSV roster dedupe                  | Dedupe by NFKC-lowercased email within file and cohort; first row wins; report lists dropped rows.                                              | Plus-addressing treated as distinct (no provider-specific normalisation)  | AC-18-02.1-01: Given `A@x.edu` and `a@x.edu`, When dry-run, Then one valid + one duplicate            | UT   |
| FEAT-18-02.2 | Roster dry-run preview             | Creates nothing; downloadable error report; counts only (no disclosure of existing platform accounts).                                          | Large files processed async with progress                                 | AC-18-02.2-01: Given dry-run, When inspect DB, Then no rows created                                   | IT   |
| FEAT-24-03.1 | Idempotency key scope              | Key unique per `(principal, method+route)`; retained 24 h; same key + same payload ⇒ stored response; different payload ⇒ `422`.                | Concurrent identical requests ⇒ second waits for first, then replays      | AC-24-03.1-01: Given same key twice concurrently, When processed, Then one execution                  | IT   |
| FEAT-24-06.2 | Offline read cache                 | Cache own profile, evidence list, applications list, saved jobs, last search results with age label; never authoritative (INV-T13).             | Logout clears cache                                                       | AC-24-06.2-01: Given offline, When open My applications, Then cached list with "as of" time           | E2E  |
| FEAT-24-06.3 | Service-worker update prompt       | New version detected ⇒ non-blocking "Update available" toast; apply on next navigation or user action; never reload mid-form.                   | Incompatible remote/host versions ⇒ force refresh with draft preservation | AC-24-06.3-01: Given unsaved draft and new version, When update available, Then no auto-reload        | E2E  |

### 7. Intelligence, safety, AI, search

| ID           | Micro-feature                             | Rule · Inputs · Behaviour                                                                                                                                | Edge / failure                                         | AC                                                                                                     | Test |
| ------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---- |
| FEAT-04-04.1 | Recency decay                             | Evidence weight × exp(−age_years/τ), τ = {3}; applies to rung weight in skill confidence (SPEC-08 §3.2).                                                 | Ongoing evidence age counted from latest activity date | AC-04-04.1-01: Given evidence aged 0 and 3 y, When compute, Then weights 1.0 and ≈0.37                 | PROP |
| FEAT-11-01.1 | Typeahead & spell tolerance               | Typeahead suggests canonical skills/titles (≥ 2 chars); typo tolerance via trigram similarity ≥ {0.3}; suggestions never include sponsored items.        | Empty result ⇒ suggestions                             | AC-11-01.1-01: Given "pyton", When search, Then Python jobs returned                                   | IT   |
| FEAT-11-02.3 | Uncertainty band                          | Band from verified-weight share: low/medium/high with ±δ shown as range; copy explains meaning (SPEC-08).                                                | No evidence ⇒ guidance state, not 0                    | AC-11-02.3-01: Given only claimed evidence, When view, Then wide range + "mostly self-reported"        | UT   |
| FEAT-17-04.1 | Per-field accept/reject of AI suggestions | AI suggestions appear as diffs; user accepts per field; nothing saved without explicit action; marked "AI-assisted" optionally (INV-T09, BR-T112).       | Free tier ⇒ deterministic suggestions only             | AC-17-04.1-01: Given suggestion, When user leaves page, Then profile unchanged                         | E2E  |
| FEAT-19-01.1 | Report with context snapshot              | Report attaches frozen context (message window, job text, profile fields) at report time; retained for case life + {90 d}; reporter hidden from subject. | Content deleted later ⇒ snapshot preserved             | AC-19-01.1-01: Given report then message delete, When moderator opens case, Then original text visible | IT   |

### 8. Coverage

Count: **65 micro-feature specs**, covering all 24 domains except DOM-12, DOM-14, DOM-21, DOM-23 (no Phase-1/2 micro-behaviours needing a standalone rule; they are specified when their parent features enter delivery). Each row's parent feature, phase and priority are authoritative in the hierarchy. Rows must be promoted to a full spec (SPEC-n) if they gain more than one actor, more than one state, or any money/privacy consequence.

## Revision 2 additions (folded 2026-10-27 from `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2`)

### 1. Criteria for review-resolution rules

#### 1.1 Evidence integrity (REVW-12, REVW-22, REVW-20 archive)

| AC          | Given                                                                                                                                    | When                                                           | Then                                                                                                                            | Category          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| AC-05-04-51 | a learner completes a first-party course with a platform rule                                                                            | the issuer mints the completion                                | one item at `authority_verified` with `issuer_class = platform`; the badge shows the class                                      | Happy             |
| AC-05-04-52 | any client sends an `issuerClass` or `rung` field when creating or editing evidence                                                      | POST/PATCH                                                     | field ignored or `422`; the stored class equals the class of the issuing record (INV-T46)                                       | Security          |
| AC-05-04-53 | instructor account equals the learner account                                                                                            | instructor signs off                                           | `422 self_signoff`; nothing minted; enrolment unchanged (INV-T47)                                                               | Negative          |
| AC-05-04-54 | instructor and learner share a device cluster or payment instrument                                                                      | instructor signs off                                           | sign-off held for human review; enrolment stays `completion_pending_signoff`; no evidence; no automatic rejection (DT-14 row 2) | Negative/Security |
| AC-05-04-55 | an item whose only authority record has `issuer_class = instructor`                                                                      | rendered; filtered by "platform verified"; scored for matching | badge "Instructor attested"; excluded from the platform-verified filter; match explanation shows the lower class weight         | Honesty           |
| AC-05-04-56 | an `instructor`-class record is revoked by its issuer or a moderator                                                                     | confirm                                                        | rung recomputes (falls to the next supported rung); holder notified within 24 h with appeal path; audited                       | Happy             |
| AC-08-04-51 | an approved instructor with a completed conflict-of-interest declaration signs off a learner other than themselves with no shared signal | sign-off                                                       | accepted; evidence minted at `authority_verified` with class `instructor` (DT-14 row 5)                                         | Happy             |
| AC-06-01-51 | a work claim at a domain equal to a verified `org_domain` of a verified organization                                                     | candidate enters the code correctly                            | rung `artifact_backed`; badge "Mailbox verified" (`domain_binding = bound`)                                                     | Happy             |
| AC-06-01-52 | a work claim at a domain the candidate owns or controls that is not bound to a verified organization                                     | code entered correctly                                         | rung stays `claimed`; badge "Mailbox verified, employer not confirmed"; the popover says the employer is not confirmed          | Honesty           |
| AC-06-01-53 | a `bound` proof exists and its organization's verification is revoked                                                                    | revocation commits                                             | the provenance record is invalidated; the item's rung recomputes; audited (INV-T48)                                             | Happy             |
| AC-05-01-51 | an active evidence item                                                                                                                  | user chooses Archive then Undo within 8 s                      | no withdraw request is sent; item still `active`                                                                                | Happy             |
| AC-05-01-52 | an active evidence item                                                                                                                  | user chooses Archive and does not undo                         | after 8 s the item is `withdrawn` (terminal); "Create again from this" creates a new `draft` with `restored_from`               | Happy             |

#### 1.2 Organization lifecycle (REVW-20)

| AC          | Given                                                  | When                              | Then                                                                                                                                                            | Category |
| ----------- | ------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-02-01-01 | a new organization (`verification_state = unverified`) | owner publishes a first valid job | allowed (pending-limited mode, 1 live job)                                                                                                                      | Happy    |
| AC-02-01-02 | the same organization with 1 live job                  | owner publishes a second job      | `409 org_verification_required`                                                                                                                                 | Negative |
| AC-02-01-03 | owner submits a domain with a correct DNS TXT proof    | review completes                  | `pending → verified`; `org_domain` usable for employer-domain binding; audited                                                                                  | Happy    |
| AC-02-01-04 | a verified organization with 3 live jobs               | a reviewer revokes verification   | in one transaction the oldest live job stays and two move to `paused` (reason `org_unverified`); applications on paused jobs continue; owner notified (BR-T123) | Happy    |
| AC-02-01-05 | an automated check fails a domain re-check             | the system runs                   | a review task opens; `verification_state` does not change by itself (U6)                                                                                        | Negative |

#### 1.3 Account, age and erasure (REVW-21, REVW-29)

| AC          | Given                                              | When                              | Then                                                                                                                                                     | Category  |
| ----------- | -------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AC-01-01-51 | a registration without the minimum-age attestation | submit                            | `422 age_attestation_required`; no account row                                                                                                           | Negative  |
| AC-01-01-52 | the person declares an age below the minimum       | submit                            | refused with a neutral message; no account created; only a hashed rate-limit signal kept for 24 h                                                        | Security  |
| AC-01-01-53 | any account with status `active`                   | database constraint check         | `min_age_attested_at` and the policy version are present (INV-T50)                                                                                       | Invariant |
| AC-19-07-01 | one moderator decides to suspend an account        | submits without a second approver | rejected `second_person_required`; with the documented emergency exception the action applies and is reviewed within 24 h                                | Negative  |
| AC-22-03-51 | a `suspended` account with an open moderation case | the holder requests erasure       | request acknowledged and parked `on_hold` (reason `moderation_case_open`); the account stays `suspended`; the requester is told a hold applies (INV-T49) | Negative  |
| AC-22-03-52 | the case in AC-22-03-51 becomes `closed`           | the hold clears                   | the request resumes; cooling-off starts                                                                                                                  | Happy     |

#### 1.4 Applications, referees, matching view (REVW-27, REVW-38, REVW-43, REVW-11)

| AC          | Given                                                     | When                                      | Then                                                                                                                             | Category |
| ----------- | --------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-10-03-51 | an application withdrawn 2 h ago, cooldown 24 h           | the candidate re-applies                  | `409 reapply_cooldown` with the earliest allowed time                                                                            | Negative |
| AC-10-03-52 | a withdrawn application, cooldown passed, job `published` | the candidate re-applies                  | a new application with `reapplied_from`; the hiring team sees the link and withdrawal date; a new evidence snapshot is taken     | Happy    |
| AC-10-03-53 | an application ended `rejected`                           | the candidate tries to re-apply           | refused; only a recruiter invitation creates a new linked application                                                            | Negative |
| AC-06-10-51 | a manual reminder was sent on day 3                       | day 4 arrives                             | the system reminder is deferred until 3 days after the manual one; the total never exceeds 2                                     | Happy    |
| AC-06-10-52 | two reminders sent in any mix of system and manual        | the candidate presses "Send reminder"     | disabled with "2 of 2 reminders used"; the API returns `409 reminder_cap_reached`                                                | Negative |
| AC-11-10-01 | a job with 12 applicants of mixed scores                  | a recruiter opens "Suggested order"       | 12 rows are returned; none hidden; the view is labelled "Suggested order" and advisory (INV-T52)                                 | Honesty  |
| AC-11-10-02 | the UI and API surface                                    | text and route lint                       | the advisory view is never named "shortlist"                                                                                     | Honesty  |
| AC-11-09-01 | a tenant with no recorded fairness review                 | a recruiter requests score-ranked results | the feature flag `matching.recruiter_ranking` is off; the plain filter and the candidate-facing explanation still work (BR-T126) | Negative |
| AC-11-09-02 | ROLE-AUD has recorded the baseline review                 | the flag is switched on                   | the change is audited with the review reference                                                                                  | Happy    |

#### 1.5 Sessions, idempotency, retention (REVW-18, REVW-14, REVW-26, entitlement stub)

| AC          | Given                                                                            | When                                                  | Then                                                                                                                                                                                              | Category    |
| ----------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| AC-01-04-51 | a refresh token idle for more than CONST-S02                                     | refresh                                               | `401 session_expired` (constants table in BR-REG-R2)                                                                                                                                              | Negative    |
| AC-01-04-52 | a sensitive action and a re-auth older than CONST-S06 (5 min)                    | the action is submitted                               | step-up required                                                                                                                                                                                  | Security    |
| AC-01-04-53 | a refresh token presented again within CONST-S07 (5 s) with its successor unused | refresh                                               | the same successor is returned; presented outside the leeway the family is revoked                                                                                                                | Security    |
| AC-24-03-51 | a queued offline write with an `Idempotency-Key` created on day 0                | replayed on day 13                                    | the stored response is returned, no second effect                                                                                                                                                 | Idempotency |
| AC-24-03-52 | a route with a natural key                                                       | the same logical write arrives twice after day 15     | the second is deduplicated by the natural key                                                                                                                                                     | Idempotency |
| AC-10-14-51 | an application whose consent window ended 31 days ago                            | the retention job has run                             | the organization's copy holds no snapshot content, answers or contact details; at most the minimal record with an opaque `subject_ref` remains, and only if the OPEN-08 policy keeps it (BR-T122) | Privacy     |
| AC-16-04-51 | a free organization in Phase 1                                                   | an admin compensation grant is created                | the grant needs reason, approver and expiry; it is audited; a client or redirect cannot create it (BR-T090)                                                                                       | Security    |
| AC-02-03-51 | a principal with role `viewer` in an organization                                | the principal opens candidate content                 | denied; metadata only where DT-01 allows                                                                                                                                                          | Security    |
| AC-02-03-52 | an `org_admin` in an organization                                                | the admin files a data-rights request for an employee | refused; the requester must be the subject (SM-DSR t1)                                                                                                                                            | Security    |

### 2. Criteria for P0 features that had none (REVW-17)

Method and list: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2` section 5. Each feature below was a P0 feature in Phase 0 or 1 (or a P0 Phase 2 feature) with no criterion of its own.

| AC          | Feature              | Given                                                    | When                                                          | Then                                                                                                                                                                  | Category      |
| ----------- | -------------------- | -------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| AC-01-09-01 | FEAT-01-09           | an authenticated principal with several scoped grants    | `GET /me/capabilities` for one scope                          | returns only that scope's evaluated capability set                                                                                                                    | Happy         |
| AC-01-09-02 | FEAT-01-09           | a capability absent from the response                    | the client calls the action directly                          | `403`; the capability set is a hint, never the enforcement (INV-T01)                                                                                                  | Security      |
| AC-01-09-03 | FEAT-01-09           | a grant changes                                          | the next request is made                                      | the response reflects the new set (no stale cache)                                                                                                                    | Happy         |
| AC-02-07-01 | FEAT-02-07           | a principal of organization A                            | requests any tenant-scoped route with an id of organization B | `404` or `403`; the canary suite fails the build if any route returns B's data                                                                                        | Security      |
| AC-02-07-02 | FEAT-02-07           | any tenant table                                         | lint                                                          | it has `org_id` and a forced row-level security policy                                                                                                                | Invariant     |
| AC-02-07-03 | FEAT-02-07           | the application database role                            | role check                                                    | no `BYPASSRLS`                                                                                                                                                        | Invariant     |
| AC-04-01-01 | FEAT-04-01           | the skills read API                                      | list                                                          | canonical skills are returned with a taxonomy version                                                                                                                 | Happy         |
| AC-04-01-02 | FEAT-04-01           | an alias of a skill                                      | resolved                                                      | resolves to the canonical skill                                                                                                                                       | Happy         |
| AC-04-01-03 | FEAT-04-01           | two skills are merged                                    | an old id is read                                             | it still resolves (redirect) and a merge event is emitted                                                                                                             | Happy         |
| AC-04-02-01 | FEAT-04-02           | evidence, a job or a course                              | tagged with a canonical skill                                 | accepted                                                                                                                                                              | Happy         |
| AC-04-02-02 | FEAT-04-02           | a free-text skill                                        | tagged                                                        | `422` (BR-T006)                                                                                                                                                       | Negative      |
| AC-04-02-03 | FEAT-04-02           | any entity type                                          | tagged                                                        | the same skill ids and API are used                                                                                                                                   | Happy         |
| AC-08-01-01 | FEAT-08-01           | the course catalogue                                     | filtered by skill and level                                   | only `published` courses are returned                                                                                                                                 | Happy         |
| AC-08-01-02 | FEAT-08-01           | a course with prerequisites                              | opened by a learner who has not met them                      | unmet prerequisites are shown with links                                                                                                                              | Happy         |
| AC-15-01-01 | FEAT-15-01           | in-app notifications exist                               | the notification centre opens                                 | newest first, with an unread count                                                                                                                                    | Happy         |
| AC-15-01-02 | FEAT-15-01           | an unread notification                                   | marked read twice                                             | idempotent                                                                                                                                                            | Idempotency   |
| AC-15-03-01 | FEAT-15-03           | the email provider is down                               | a notification is raised                                      | the in-app item exists; the `email.send` job retries (SM-BGJOB t4); no duplicate email on recovery                                                                    | Failure       |
| AC-15-03-02 | FEAT-15-03           | a mandatory security email during quiet hours            | routed                                                        | sent now (DT-07 row 2)                                                                                                                                                | Happy         |
| AC-15-06-01 | FEAT-15-06           | a hard bounce                                            | the provider webhook arrives                                  | delivery `bounced`; the address is suppressed                                                                                                                         | Happy         |
| AC-15-06-02 | FEAT-15-06           | a transient provider error                               | the job retries                                               | delivery shows `failed_retry` and mirrors the job, not a second retry schedule                                                                                        | Happy         |
| AC-15-07-01 | FEAT-15-07           | an engagement email                                      | the recipient uses one-click unsubscribe                      | that category is suppressed                                                                                                                                           | Happy         |
| AC-15-07-02 | FEAT-15-07           | a mandatory transactional category                       | unsubscribe attempted                                         | not suppressed; the page explains why                                                                                                                                 | Negative      |
| AC-15-07-03 | FEAT-15-07           | an address on the suppression list                       | a send is attempted                                           | not sent (SM-NOTIFY t1)                                                                                                                                               | Negative      |
| AC-20-01-01 | FEAT-20-01           | a customer principal                                     | opens a back-office route                                     | `403`; back-office code is not served to the principal (authenticated edge rule)                                                                                      | Security      |
| AC-20-01-02 | FEAT-20-01           | a staff principal without MFA                            | opens the console                                             | denied until MFA is enrolled (BR-T044)                                                                                                                                | Security      |
| AC-20-01-03 | FEAT-20-01           | a role grant changes                                     | saved                                                         | audited with actor and reason                                                                                                                                         | Happy         |
| AC-20-03-01 | FEAT-20-03           | the audit viewer                                         | a record is opened                                            | actor, action, resource, reason and request id are shown                                                                                                              | Happy         |
| AC-20-03-02 | FEAT-20-03           | an audit export                                          | requested                                                     | re-auth is required and the export is itself audited                                                                                                                  | Security      |
| AC-21-01-01 | FEAT-21-01           | a user without `analytics.product` consent               | uses the product                                              | no product-analytics event is captured                                                                                                                                | Privacy       |
| AC-21-01-02 | FEAT-21-01           | consent is withdrawn                                     | the next event would fire                                     | it is not captured                                                                                                                                                    | Privacy       |
| AC-22-06-01 | FEAT-22-06           | a user accepts policy version v                          | stored                                                        | version, timestamp and account are recorded                                                                                                                           | Happy         |
| AC-22-06-02 | FEAT-22-06           | policy version v+1 is published                          | the user's next sensitive action                              | acceptance of v+1 is required first                                                                                                                                   | Happy         |
| AC-24-01-01 | FEAT-24-01           | a state change commits                                   | the process is killed before dispatch                         | the outbox row survives and the event is delivered after restart                                                                                                      | Failure       |
| AC-24-01-02 | FEAT-24-01           | an event is delivered twice                              | the consumer handles it                                       | one effect (consumer dedupe on `event_id`)                                                                                                                            | Idempotency   |
| AC-24-01-03 | FEAT-24-01           | the dispatcher restarts                                  | mid-batch                                                     | no event is lost                                                                                                                                                      | Failure       |
| AC-24-02-01 | FEAT-24-02           | two workers race for one job                             | claim                                                         | exactly one wins (`SKIP LOCKED`)                                                                                                                                      | Concurrency   |
| AC-24-02-02 | FEAT-24-02           | a stale worker finishes after its lease expired          | complete                                                      | the fenced write affects zero rows and the result is discarded                                                                                                        | Concurrency   |
| AC-24-02-03 | FEAT-24-02           | jobs of kinds `email.send`, `ai.*` and a permanent error | failures repeat                                               | `email.send` is attempted up to 12 times, `ai.*` 3 times, a permanent error goes straight to `dead`; a dead job of a protected kind raises an alert (SM-BGJOB t4, t7) | Failure       |
| AC-24-04-01 | FEAT-24-04           | a signed download URL                                    | used after expiry                                             | `403`                                                                                                                                                                 | Security      |
| AC-24-04-02 | FEAT-24-04           | a non-image file                                         | downloaded                                                    | forced as attachment (BR-T116)                                                                                                                                        | Security      |
| AC-24-05-01 | FEAT-24-05           | a request that passes shell, API and worker              | traced                                                        | one trace id spans all three; logs redact secrets and direct identifiers                                                                                              | Observability |
| AC-24-08-01 | FEAT-24-08           | requests over the limit                                  | sent                                                          | `429` with `Retry-After`; auth endpoints are stricter (BR-T115)                                                                                                       | Security      |
| AC-24-09-01 | FEAT-24-09           | two worker replicas                                      | a scheduled tick fires                                        | it runs once (unique kind and tick)                                                                                                                                   | Concurrency   |
| AC-24-09-02 | FEAT-24-09           | a time-driven transition is due                          | the job runs                                                  | the guard is re-checked at execution time (U7)                                                                                                                        | Happy         |
| AC-24-11-01 | FEAT-24-11           | a migration that drops or rewrites a column in one step  | lint                                                          | rejected unless it follows expand/contract with a rollback note                                                                                                       | Invariant     |
| AC-17-01-01 | FEAT-17-01           | code that imports a model provider directly              | CI lint                                                       | the build fails (BR-T110)                                                                                                                                             | Invariant     |
| AC-17-01-02 | FEAT-17-01           | the Phase 0 gateway stub                                 | a call is made                                                | denied by default; no provider is contacted                                                                                                                           | Security      |
| AC-17-02-01 | FEAT-17-02           | a free-tier user                                         | requests AI assistance                                        | no paid inference; the deterministic fallback runs (BR-T111)                                                                                                          | Happy         |
| AC-17-03-01 | FEAT-17-03           | a principal bound to `AI_PROHIBITED`                     | any gateway call                                              | denied regardless of caller (BR-T025)                                                                                                                                 | Security      |
| AC-17-03-02 | FEAT-17-03           | a denial                                                 | logged                                                        | the log holds the policy and principal, not the prompt content                                                                                                        | Privacy       |
| AC-07-01-01 | FEAT-07-01 (Phase 2) | the assessment catalogue                                 | an item is opened                                             | mode badge and AI-policy label are shown                                                                                                                              | Happy         |
| AC-16-01-01 | FEAT-16-01 (Phase 2) | a plan with no price set                                 | the catalogue renders                                         | no price is shown (prices are OPEN-05)                                                                                                                                | Honesty       |
| AC-19-02-01 | FEAT-19-02 (Phase 2) | a report and a system flag on one target                 | the queue is built                                            | one case (dedupe by target and category); automation cannot move it to `actioned`                                                                                     | Happy         |
| AC-19-08-01 | FEAT-19-08 (Phase 2) | a reporter files more than 20 reports in a day           | files one more                                                | `429` (BR-T048)                                                                                                                                                       | Negative      |

### 3. Spec-text deltas (passages replaced once accepted)

| Original passage                                                                                                                                        | Replacement meaning                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPEC-G2 badge line (about L203): "`Mailbox verified` (artifact-backed via domain proof) ... `Employer confirmed` (authority; Phase 3 via verified org)" | Badges: "Not verified"; "Mailbox verified" only for a `bound` domain; "Mailbox verified, employer not confirmed" for an `unbound` domain (rung stays `claimed`); "Confirmed by referee"; for authority, the class is shown: "Platform verified", "Institution verified", "Employer confirmed", "Instructor attested" (DT-06 REV2) |
| SPEC-G2 actors table (about L20): ROLE-INST and issuers "mint `authority_verified` items"                                                               | Issuers mint authority records with a mandatory `issuer_class`; instructor-class records follow BR-T119 and DT-14                                                                                                                                                                                                                 |
| SPEC-G3 actors and completion rule (about L189, L212 to L214): `instructorSignoff`, "rung `authority_verified` when ... instructor-signed-off"          | Instructor sign-off mints `authority_verified` with class `instructor` only after DT-14; it never counts as platform-verified; revocable                                                                                                                                                                                          |
| SPEC-G3 offline lines (L76, L209, L256)                                                                                                                 | Assessment answers are online-only; lesson progress is a queued write; downloadable video is out of Phases 1 and 2 (REVW-15 decision)                                                                                                                                                                                             |
| SPEC-G1 onboarding (registration step, micro-feature FEAT-01-01.3 "age/guardian gate [OPEN-09]")                                                        | Registration requires the minimum-age attestation of BR-T120 (value [OPEN-counsel]); no account is created below the minimum                                                                                                                                                                                                      |
| SPEC-G4 FEAT-10-03 "Withdraw & re-apply policy" and the application states paragraph                                                                    | Withdrawn is terminal; the candidate may submit a new linked application after the cooldown (BR-T125, SM-APPLICATION t12)                                                                                                                                                                                                         |
| SPEC-G4 FEAT-11-10 "Suggested shortlist per job (human-gated)" (also PCAP-01 title)                                                                     | "Suggested order"; the view returns all applicants (INV-T52)                                                                                                                                                                                                                                                                      |
| SPEC-G5 section 3.2 CSV columns and BR-T106                                                                                                             | The roster CSV may carry the attestation flag or date of birth only if counsel requires it (BR-T120); rows flagged under-age stay blocked                                                                                                                                                                                         |
| USER_JOURNEYS about line 115: "1st reminder after 3 days (ACT-VER-03)"                                                                                  | "Reminders: the system sends on day 4 and day 9; you can also send one yourself 3 days after the last send; two in total" (BR-T121)                                                                                                                                                                                               |
| ACT-VER-03 availability (`07_UI_UX`)                                                                                                                    | "≥ 3 days since last send of any kind and fewer than 2 reminders in total" (DT-13)                                                                                                                                                                                                                                                |
| SPEC-G5 retention paragraph for applications; DATA-021 (24 months)                                                                                      | Identifiable content follows BR-T122; the 24-month figure applies only to the minimal record if OPEN-08 allows it                                                                                                                                                                                                                 |

---

<a id="record-spec-acceptance-additions-rev2"></a>

### Preserved source record: SPEC_ACCEPTANCE_ADDITIONS_REV2

> Consolidated on 2026-10-27. The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. Approval conditions and authority remain unchanged: this move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_ACCEPTANCE_ADDITIONS_REV2.md -->

<a id="record-spec-acceptance-additions-rev2--feature-specifications-acceptance-additions-spec-rev2"></a>

## Feature Specifications, Acceptance Additions (SPEC REV2)

Doc ID: SPEC-00-R2 · Owner: Product Director (Functional Spec) · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-12, REVW-17 (P0 feature gaps), REVW-18, REVW-20, REVW-21, REVW-22, REVW-26, REVW-27, REVW-29, REVW-38, REVW-43 (acceptance and spec-text parts) · Relates: SPEC-00 and SPEC-G1 to G5, MICRO-FEAT, QA-AC, BR-REG-R2, INV-REG-R2, SM-00-R2, DT-00-R2

> **Folded into `MICRO_FEATURE_SPECS.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (no original file was edited).** This file **extends** the long-form specifications `SPEC_G1…G5` and `MICRO_FEATURE_SPECS.md` with acceptance criteria and with spec-text deltas. It supersedes nothing. The spec-text deltas in section 3 name the original passages they would replace **once accepted**. Criteria are numbered so they cannot collide with registered ones: for features that already have criteria the new numbers start at 51; for features with none they start at 01. The test catalogue is owned by QA; this file proposes no TEST ids. Governance should link this file from `05_FEATURE_SPECIFICATIONS/README.md` (index) and `00_CONTROL_CENTRE/MASTER_INDEX.md`.

This file registers **95 new criteria** (counted by script over rows that begin `| AC-DD-NN-NN |`; no id collides with a criterion registered in `05_*` or `16_*`). All content **[TARGET]**; nothing here claims anything is built. Table form is that of the long-form specs: `| AC id | Given | When | Then | Category |`.

<a id="record-spec-acceptance-additions-rev2--1-criteria-for-review-resolution-rules"></a>

### 1. Criteria for review-resolution rules

<a id="record-spec-acceptance-additions-rev2--11-evidence-integrity-revw-12-revw-22-revw-20-archive"></a>

#### 1.1 Evidence integrity (REVW-12, REVW-22, REVW-20 archive)

| AC          | Given                                                                                                                                    | When                                                           | Then                                                                                                                            | Category          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| AC-05-04-51 | a learner completes a first-party course with a platform rule                                                                            | the issuer mints the completion                                | one item at `authority_verified` with `issuer_class = platform`; the badge shows the class                                      | Happy             |
| AC-05-04-52 | any client sends an `issuerClass` or `rung` field when creating or editing evidence                                                      | POST/PATCH                                                     | field ignored or `422`; the stored class equals the class of the issuing record (INV-T46)                                       | Security          |
| AC-05-04-53 | instructor account equals the learner account                                                                                            | instructor signs off                                           | `422 self_signoff`; nothing minted; enrolment unchanged (INV-T47)                                                               | Negative          |
| AC-05-04-54 | instructor and learner share a device cluster or payment instrument                                                                      | instructor signs off                                           | sign-off held for human review; enrolment stays `completion_pending_signoff`; no evidence; no automatic rejection (DT-14 row 2) | Negative/Security |
| AC-05-04-55 | an item whose only authority record has `issuer_class = instructor`                                                                      | rendered; filtered by "platform verified"; scored for matching | badge "Instructor attested"; excluded from the platform-verified filter; match explanation shows the lower class weight         | Honesty           |
| AC-05-04-56 | an `instructor`-class record is revoked by its issuer or a moderator                                                                     | confirm                                                        | rung recomputes (falls to the next supported rung); holder notified within 24 h with appeal path; audited                       | Happy             |
| AC-08-04-51 | an approved instructor with a completed conflict-of-interest declaration signs off a learner other than themselves with no shared signal | sign-off                                                       | accepted; evidence minted at `authority_verified` with class `instructor` (DT-14 row 5)                                         | Happy             |
| AC-06-01-51 | a work claim at a domain equal to a verified `org_domain` of a verified organization                                                     | candidate enters the code correctly                            | rung `artifact_backed`; badge "Mailbox verified" (`domain_binding = bound`)                                                     | Happy             |
| AC-06-01-52 | a work claim at a domain the candidate owns or controls that is not bound to a verified organization                                     | code entered correctly                                         | rung stays `claimed`; badge "Mailbox verified, employer not confirmed"; the popover says the employer is not confirmed          | Honesty           |
| AC-06-01-53 | a `bound` proof exists and its organization's verification is revoked                                                                    | revocation commits                                             | the provenance record is invalidated; the item's rung recomputes; audited (INV-T48)                                             | Happy             |
| AC-05-01-51 | an active evidence item                                                                                                                  | user chooses Archive then Undo within 8 s                      | no withdraw request is sent; item still `active`                                                                                | Happy             |
| AC-05-01-52 | an active evidence item                                                                                                                  | user chooses Archive and does not undo                         | after 8 s the item is `withdrawn` (terminal); "Create again from this" creates a new `draft` with `restored_from`               | Happy             |

<a id="record-spec-acceptance-additions-rev2--12-organization-lifecycle-revw-20"></a>

#### 1.2 Organization lifecycle (REVW-20)

| AC          | Given                                                  | When                              | Then                                                                                                                                                            | Category |
| ----------- | ------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-02-01-01 | a new organization (`verification_state = unverified`) | owner publishes a first valid job | allowed (pending-limited mode, 1 live job)                                                                                                                      | Happy    |
| AC-02-01-02 | the same organization with 1 live job                  | owner publishes a second job      | `409 org_verification_required`                                                                                                                                 | Negative |
| AC-02-01-03 | owner submits a domain with a correct DNS TXT proof    | review completes                  | `pending → verified`; `org_domain` usable for employer-domain binding; audited                                                                                  | Happy    |
| AC-02-01-04 | a verified organization with 3 live jobs               | a reviewer revokes verification   | in one transaction the oldest live job stays and two move to `paused` (reason `org_unverified`); applications on paused jobs continue; owner notified (BR-T123) | Happy    |
| AC-02-01-05 | an automated check fails a domain re-check             | the system runs                   | a review task opens; `verification_state` does not change by itself (U6)                                                                                        | Negative |

<a id="record-spec-acceptance-additions-rev2--13-account-age-and-erasure-revw-21-revw-29"></a>

#### 1.3 Account, age and erasure (REVW-21, REVW-29)

| AC          | Given                                              | When                              | Then                                                                                                                                                     | Category  |
| ----------- | -------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AC-01-01-51 | a registration without the minimum-age attestation | submit                            | `422 age_attestation_required`; no account row                                                                                                           | Negative  |
| AC-01-01-52 | the person declares an age below the minimum       | submit                            | refused with a neutral message; no account created; only a hashed rate-limit signal kept for 24 h                                                        | Security  |
| AC-01-01-53 | any account with status `active`                   | database constraint check         | `min_age_attested_at` and the policy version are present (INV-T50)                                                                                       | Invariant |
| AC-19-07-01 | one moderator decides to suspend an account        | submits without a second approver | rejected `second_person_required`; with the documented emergency exception the action applies and is reviewed within 24 h                                | Negative  |
| AC-22-03-51 | a `suspended` account with an open moderation case | the holder requests erasure       | request acknowledged and parked `on_hold` (reason `moderation_case_open`); the account stays `suspended`; the requester is told a hold applies (INV-T49) | Negative  |
| AC-22-03-52 | the case in AC-22-03-51 becomes `closed`           | the hold clears                   | the request resumes; cooling-off starts                                                                                                                  | Happy     |

<a id="record-spec-acceptance-additions-rev2--14-applications-referees-matching-view-revw-27-revw-38-revw-43-revw-11"></a>

#### 1.4 Applications, referees, matching view (REVW-27, REVW-38, REVW-43, REVW-11)

| AC          | Given                                                     | When                                      | Then                                                                                                                             | Category |
| ----------- | --------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-10-03-51 | an application withdrawn 2 h ago, cooldown 24 h           | the candidate re-applies                  | `409 reapply_cooldown` with the earliest allowed time                                                                            | Negative |
| AC-10-03-52 | a withdrawn application, cooldown passed, job `published` | the candidate re-applies                  | a new application with `reapplied_from`; the hiring team sees the link and withdrawal date; a new evidence snapshot is taken     | Happy    |
| AC-10-03-53 | an application ended `rejected`                           | the candidate tries to re-apply           | refused; only a recruiter invitation creates a new linked application                                                            | Negative |
| AC-06-10-51 | a manual reminder was sent on day 3                       | day 4 arrives                             | the system reminder is deferred until 3 days after the manual one; the total never exceeds 2                                     | Happy    |
| AC-06-10-52 | two reminders sent in any mix of system and manual        | the candidate presses "Send reminder"     | disabled with "2 of 2 reminders used"; the API returns `409 reminder_cap_reached`                                                | Negative |
| AC-11-10-01 | a job with 12 applicants of mixed scores                  | a recruiter opens "Suggested order"       | 12 rows are returned; none hidden; the view is labelled "Suggested order" and advisory (INV-T52)                                 | Honesty  |
| AC-11-10-02 | the UI and API surface                                    | text and route lint                       | the advisory view is never named "shortlist"                                                                                     | Honesty  |
| AC-11-09-01 | a tenant with no recorded fairness review                 | a recruiter requests score-ranked results | the feature flag `matching.recruiter_ranking` is off; the plain filter and the candidate-facing explanation still work (BR-T126) | Negative |
| AC-11-09-02 | ROLE-AUD has recorded the baseline review                 | the flag is switched on                   | the change is audited with the review reference                                                                                  | Happy    |

<a id="record-spec-acceptance-additions-rev2--15-sessions-idempotency-retention-revw-18-revw-14-revw-26-entitlement-stub"></a>

#### 1.5 Sessions, idempotency, retention (REVW-18, REVW-14, REVW-26, entitlement stub)

| AC          | Given                                                                            | When                                                  | Then                                                                                                                                                                                              | Category    |
| ----------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| AC-01-04-51 | a refresh token idle for more than CONST-S02                                     | refresh                                               | `401 session_expired` (constants table in BR-REG-R2)                                                                                                                                              | Negative    |
| AC-01-04-52 | a sensitive action and a re-auth older than CONST-S06 (5 min)                    | the action is submitted                               | step-up required                                                                                                                                                                                  | Security    |
| AC-01-04-53 | a refresh token presented again within CONST-S07 (5 s) with its successor unused | refresh                                               | the same successor is returned; presented outside the leeway the family is revoked                                                                                                                | Security    |
| AC-24-03-51 | a queued offline write with an `Idempotency-Key` created on day 0                | replayed on day 13                                    | the stored response is returned, no second effect                                                                                                                                                 | Idempotency |
| AC-24-03-52 | a route with a natural key                                                       | the same logical write arrives twice after day 15     | the second is deduplicated by the natural key                                                                                                                                                     | Idempotency |
| AC-10-14-51 | an application whose consent window ended 31 days ago                            | the retention job has run                             | the organization's copy holds no snapshot content, answers or contact details; at most the minimal record with an opaque `subject_ref` remains, and only if the OPEN-08 policy keeps it (BR-T122) | Privacy     |
| AC-16-04-51 | a free organization in Phase 1                                                   | an admin compensation grant is created                | the grant needs reason, approver and expiry; it is audited; a client or redirect cannot create it (BR-T090)                                                                                       | Security    |
| AC-02-03-51 | a principal with role `viewer` in an organization                                | the principal opens candidate content                 | denied; metadata only where DT-01 allows                                                                                                                                                          | Security    |
| AC-02-03-52 | an `org_admin` in an organization                                                | the admin files a data-rights request for an employee | refused; the requester must be the subject (SM-DSR t1)                                                                                                                                            | Security    |

<a id="record-spec-acceptance-additions-rev2--2-criteria-for-p0-features-that-had-none-revw-17"></a>

### 2. Criteria for P0 features that had none (REVW-17)

Method and list: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2` section 5. Each feature below was a P0 feature in Phase 0 or 1 (or a P0 Phase 2 feature) with no criterion of its own.

| AC          | Feature              | Given                                                    | When                                                          | Then                                                                                                                                                                  | Category      |
| ----------- | -------------------- | -------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| AC-01-09-01 | FEAT-01-09           | an authenticated principal with several scoped grants    | `GET /me/capabilities` for one scope                          | returns only that scope's evaluated capability set                                                                                                                    | Happy         |
| AC-01-09-02 | FEAT-01-09           | a capability absent from the response                    | the client calls the action directly                          | `403`; the capability set is a hint, never the enforcement (INV-T01)                                                                                                  | Security      |
| AC-01-09-03 | FEAT-01-09           | a grant changes                                          | the next request is made                                      | the response reflects the new set (no stale cache)                                                                                                                    | Happy         |
| AC-02-07-01 | FEAT-02-07           | a principal of organization A                            | requests any tenant-scoped route with an id of organization B | `404` or `403`; the canary suite fails the build if any route returns B's data                                                                                        | Security      |
| AC-02-07-02 | FEAT-02-07           | any tenant table                                         | lint                                                          | it has `org_id` and a forced row-level security policy                                                                                                                | Invariant     |
| AC-02-07-03 | FEAT-02-07           | the application database role                            | role check                                                    | no `BYPASSRLS`                                                                                                                                                        | Invariant     |
| AC-04-01-01 | FEAT-04-01           | the skills read API                                      | list                                                          | canonical skills are returned with a taxonomy version                                                                                                                 | Happy         |
| AC-04-01-02 | FEAT-04-01           | an alias of a skill                                      | resolved                                                      | resolves to the canonical skill                                                                                                                                       | Happy         |
| AC-04-01-03 | FEAT-04-01           | two skills are merged                                    | an old id is read                                             | it still resolves (redirect) and a merge event is emitted                                                                                                             | Happy         |
| AC-04-02-01 | FEAT-04-02           | evidence, a job or a course                              | tagged with a canonical skill                                 | accepted                                                                                                                                                              | Happy         |
| AC-04-02-02 | FEAT-04-02           | a free-text skill                                        | tagged                                                        | `422` (BR-T006)                                                                                                                                                       | Negative      |
| AC-04-02-03 | FEAT-04-02           | any entity type                                          | tagged                                                        | the same skill ids and API are used                                                                                                                                   | Happy         |
| AC-08-01-01 | FEAT-08-01           | the course catalogue                                     | filtered by skill and level                                   | only `published` courses are returned                                                                                                                                 | Happy         |
| AC-08-01-02 | FEAT-08-01           | a course with prerequisites                              | opened by a learner who has not met them                      | unmet prerequisites are shown with links                                                                                                                              | Happy         |
| AC-15-01-01 | FEAT-15-01           | in-app notifications exist                               | the notification centre opens                                 | newest first, with an unread count                                                                                                                                    | Happy         |
| AC-15-01-02 | FEAT-15-01           | an unread notification                                   | marked read twice                                             | idempotent                                                                                                                                                            | Idempotency   |
| AC-15-03-01 | FEAT-15-03           | the email provider is down                               | a notification is raised                                      | the in-app item exists; the `email.send` job retries (SM-BGJOB t4); no duplicate email on recovery                                                                    | Failure       |
| AC-15-03-02 | FEAT-15-03           | a mandatory security email during quiet hours            | routed                                                        | sent now (DT-07 row 2)                                                                                                                                                | Happy         |
| AC-15-06-01 | FEAT-15-06           | a hard bounce                                            | the provider webhook arrives                                  | delivery `bounced`; the address is suppressed                                                                                                                         | Happy         |
| AC-15-06-02 | FEAT-15-06           | a transient provider error                               | the job retries                                               | delivery shows `failed_retry` and mirrors the job, not a second retry schedule                                                                                        | Happy         |
| AC-15-07-01 | FEAT-15-07           | an engagement email                                      | the recipient uses one-click unsubscribe                      | that category is suppressed                                                                                                                                           | Happy         |
| AC-15-07-02 | FEAT-15-07           | a mandatory transactional category                       | unsubscribe attempted                                         | not suppressed; the page explains why                                                                                                                                 | Negative      |
| AC-15-07-03 | FEAT-15-07           | an address on the suppression list                       | a send is attempted                                           | not sent (SM-NOTIFY t1)                                                                                                                                               | Negative      |
| AC-20-01-01 | FEAT-20-01           | a customer principal                                     | opens a back-office route                                     | `403`; back-office code is not served to the principal (authenticated edge rule)                                                                                      | Security      |
| AC-20-01-02 | FEAT-20-01           | a staff principal without MFA                            | opens the console                                             | denied until MFA is enrolled (BR-T044)                                                                                                                                | Security      |
| AC-20-01-03 | FEAT-20-01           | a role grant changes                                     | saved                                                         | audited with actor and reason                                                                                                                                         | Happy         |
| AC-20-03-01 | FEAT-20-03           | the audit viewer                                         | a record is opened                                            | actor, action, resource, reason and request id are shown                                                                                                              | Happy         |
| AC-20-03-02 | FEAT-20-03           | an audit export                                          | requested                                                     | re-auth is required and the export is itself audited                                                                                                                  | Security      |
| AC-21-01-01 | FEAT-21-01           | a user without `analytics.product` consent               | uses the product                                              | no product-analytics event is captured                                                                                                                                | Privacy       |
| AC-21-01-02 | FEAT-21-01           | consent is withdrawn                                     | the next event would fire                                     | it is not captured                                                                                                                                                    | Privacy       |
| AC-22-06-01 | FEAT-22-06           | a user accepts policy version v                          | stored                                                        | version, timestamp and account are recorded                                                                                                                           | Happy         |
| AC-22-06-02 | FEAT-22-06           | policy version v+1 is published                          | the user's next sensitive action                              | acceptance of v+1 is required first                                                                                                                                   | Happy         |
| AC-24-01-01 | FEAT-24-01           | a state change commits                                   | the process is killed before dispatch                         | the outbox row survives and the event is delivered after restart                                                                                                      | Failure       |
| AC-24-01-02 | FEAT-24-01           | an event is delivered twice                              | the consumer handles it                                       | one effect (consumer dedupe on `event_id`)                                                                                                                            | Idempotency   |
| AC-24-01-03 | FEAT-24-01           | the dispatcher restarts                                  | mid-batch                                                     | no event is lost                                                                                                                                                      | Failure       |
| AC-24-02-01 | FEAT-24-02           | two workers race for one job                             | claim                                                         | exactly one wins (`SKIP LOCKED`)                                                                                                                                      | Concurrency   |
| AC-24-02-02 | FEAT-24-02           | a stale worker finishes after its lease expired          | complete                                                      | the fenced write affects zero rows and the result is discarded                                                                                                        | Concurrency   |
| AC-24-02-03 | FEAT-24-02           | jobs of kinds `email.send`, `ai.*` and a permanent error | failures repeat                                               | `email.send` is attempted up to 12 times, `ai.*` 3 times, a permanent error goes straight to `dead`; a dead job of a protected kind raises an alert (SM-BGJOB t4, t7) | Failure       |
| AC-24-04-01 | FEAT-24-04           | a signed download URL                                    | used after expiry                                             | `403`                                                                                                                                                                 | Security      |
| AC-24-04-02 | FEAT-24-04           | a non-image file                                         | downloaded                                                    | forced as attachment (BR-T116)                                                                                                                                        | Security      |
| AC-24-05-01 | FEAT-24-05           | a request that passes shell, API and worker              | traced                                                        | one trace id spans all three; logs redact secrets and direct identifiers                                                                                              | Observability |
| AC-24-08-01 | FEAT-24-08           | requests over the limit                                  | sent                                                          | `429` with `Retry-After`; auth endpoints are stricter (BR-T115)                                                                                                       | Security      |
| AC-24-09-01 | FEAT-24-09           | two worker replicas                                      | a scheduled tick fires                                        | it runs once (unique kind and tick)                                                                                                                                   | Concurrency   |
| AC-24-09-02 | FEAT-24-09           | a time-driven transition is due                          | the job runs                                                  | the guard is re-checked at execution time (U7)                                                                                                                        | Happy         |
| AC-24-11-01 | FEAT-24-11           | a migration that drops or rewrites a column in one step  | lint                                                          | rejected unless it follows expand/contract with a rollback note                                                                                                       | Invariant     |
| AC-17-01-01 | FEAT-17-01           | code that imports a model provider directly              | CI lint                                                       | the build fails (BR-T110)                                                                                                                                             | Invariant     |
| AC-17-01-02 | FEAT-17-01           | the Phase 0 gateway stub                                 | a call is made                                                | denied by default; no provider is contacted                                                                                                                           | Security      |
| AC-17-02-01 | FEAT-17-02           | a free-tier user                                         | requests AI assistance                                        | no paid inference; the deterministic fallback runs (BR-T111)                                                                                                          | Happy         |
| AC-17-03-01 | FEAT-17-03           | a principal bound to `AI_PROHIBITED`                     | any gateway call                                              | denied regardless of caller (BR-T025)                                                                                                                                 | Security      |
| AC-17-03-02 | FEAT-17-03           | a denial                                                 | logged                                                        | the log holds the policy and principal, not the prompt content                                                                                                        | Privacy       |
| AC-07-01-01 | FEAT-07-01 (Phase 2) | the assessment catalogue                                 | an item is opened                                             | mode badge and AI-policy label are shown                                                                                                                              | Happy         |
| AC-16-01-01 | FEAT-16-01 (Phase 2) | a plan with no price set                                 | the catalogue renders                                         | no price is shown (prices are OPEN-05)                                                                                                                                | Honesty       |
| AC-19-02-01 | FEAT-19-02 (Phase 2) | a report and a system flag on one target                 | the queue is built                                            | one case (dedupe by target and category); automation cannot move it to `actioned`                                                                                     | Happy         |
| AC-19-08-01 | FEAT-19-08 (Phase 2) | a reporter files more than 20 reports in a day           | files one more                                                | `429` (BR-T048)                                                                                                                                                       | Negative      |

<a id="record-spec-acceptance-additions-rev2--3-spec-text-deltas-passages-replaced-once-accepted"></a>

### 3. Spec-text deltas (passages replaced once accepted)

| Original passage                                                                                                                                        | Replacement meaning                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPEC-G2 badge line (about L203): "`Mailbox verified` (artifact-backed via domain proof) ... `Employer confirmed` (authority; Phase 3 via verified org)" | Badges: "Not verified"; "Mailbox verified" only for a `bound` domain; "Mailbox verified, employer not confirmed" for an `unbound` domain (rung stays `claimed`); "Confirmed by referee"; for authority, the class is shown: "Platform verified", "Institution verified", "Employer confirmed", "Instructor attested" (DT-06 REV2) |
| SPEC-G2 actors table (about L20): ROLE-INST and issuers "mint `authority_verified` items"                                                               | Issuers mint authority records with a mandatory `issuer_class`; instructor-class records follow BR-T119 and DT-14                                                                                                                                                                                                                 |
| SPEC-G3 actors and completion rule (about L189, L212 to L214): `instructorSignoff`, "rung `authority_verified` when ... instructor-signed-off"          | Instructor sign-off mints `authority_verified` with class `instructor` only after DT-14; it never counts as platform-verified; revocable                                                                                                                                                                                          |
| SPEC-G3 offline lines (L76, L209, L256)                                                                                                                 | Assessment answers are online-only; lesson progress is a queued write; downloadable video is out of Phases 1 and 2 (REVW-15 decision)                                                                                                                                                                                             |
| SPEC-G1 onboarding (registration step, micro-feature FEAT-01-01.3 "age/guardian gate [OPEN-09]")                                                        | Registration requires the minimum-age attestation of BR-T120 (value [OPEN-counsel]); no account is created below the minimum                                                                                                                                                                                                      |
| SPEC-G4 FEAT-10-03 "Withdraw & re-apply policy" and the application states paragraph                                                                    | Withdrawn is terminal; the candidate may submit a new linked application after the cooldown (BR-T125, SM-APPLICATION t12)                                                                                                                                                                                                         |
| SPEC-G4 FEAT-11-10 "Suggested shortlist per job (human-gated)" (also PCAP-01 title)                                                                     | "Suggested order"; the view returns all applicants (INV-T52)                                                                                                                                                                                                                                                                      |
| SPEC-G5 section 3.2 CSV columns and BR-T106                                                                                                             | The roster CSV may carry the attestation flag or date of birth only if counsel requires it (BR-T120); rows flagged under-age stay blocked                                                                                                                                                                                         |
| USER_JOURNEYS about line 115: "1st reminder after 3 days (ACT-VER-03)"                                                                                  | "Reminders: the system sends on day 4 and day 9; you can also send one yourself 3 days after the last send; two in total" (BR-T121)                                                                                                                                                                                               |
| ACT-VER-03 availability (`07_UI_UX`)                                                                                                                    | "≥ 3 days since last send of any kind and fewer than 2 reminders in total" (DT-13)                                                                                                                                                                                                                                                |
| SPEC-G5 retention paragraph for applications; DATA-021 (24 months)                                                                                      | Identifiable content follows BR-T122; the 24-month figure applies only to the minimal record if OPEN-08 allows it                                                                                                                                                                                                                 |

<!-- source-record-end: Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_ACCEPTANCE_ADDITIONS_REV2.md -->

### P0 acceptance gap closure (finding 17) — 2026-10-27

Scope: review finding 17 (traceability). `COVERAGE_MATRICES.md` rows flag 36 P0 features as "P0 without AC" (the request counted 37; 36 IDs were listed and checked). That matrix predates the REV2 fold: **28 of the 36 already have feature-level ACs** in section 2 of this file ("Criteria for P0 features that had none (REVW-17)"). Of the other 8, six have only micro-level ACs and two are `Remove` features with no AC at all. This section adds ACs for those 8. **Every AC below has status PROPOSED** (not approved, not implemented, not tested). Rows whose Category is OPEN are questions, not criteria; the named document is silent. IDs follow `AC-<feature>-NN` and reuse none of the existing IDs (the micro-level `AC-02-02.1-01`, `AC-02-02.3-01`, `AC-04-04.1-01`, `AC-15-02.1-01`, `AC-15-02.2-01`, `AC-19-01.1-01`, `AC-20-02.3-01`, `AC-24-06.2-01` and `AC-24-06.3-01` stay valid and are cited, not repeated).

#### P0.1 Criteria

| AC           | Feature             | Given                                                                      | When                                                                | Then                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Category      | Status   |
| ------------ | ------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| AC-02-02-01  | FEAT-02-02          | an `org_admin` invites a valid email                                       | the invite is created                                               | the token is stored hashed, expires after 7 d, is single-use and is bound to the invited email (micro FEAT-02-02.1)                                                                                                                                                                                                                                                                                                                                                                                     | Happy         | PROPOSED |
| AC-02-02-02  | FEAT-02-02          | an invite for a@x and an account whose verified email is b@y               | b@y accepts                                                         | refused; acceptance needs a matching verified email                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Security      | PROPOSED |
| AC-02-02-03  | FEAT-02-02          | an invite that was already accepted                                        | the same token is used again                                        | refused (single-use); no second membership                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Negative      | PROPOSED |
| AC-02-02-04  | FEAT-02-02          | one pending invite                                                         | two accept requests arrive concurrently                             | exactly one succeeds; the other is refused as used (derived from the single-use token in FEAT-02-02.1; no document states the concurrent case, so this row is unsourced)                                                                                                                                                                                                                                                                                                                                | Concurrency   | PROPOSED |
| AC-02-02-05  | FEAT-02-02          | OPEN: bulk invite by CSV (FEAT-02-02.2)                                    | an admin uploads a file                                             | OPEN: row limit, dry-run report, duplicate handling and role per row are not specified. `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` names ".2 bulk invite CSV" and no spec defines it (the only CSV rules, SPEC-G5 section 3.2, are for institution rosters)                                                                                                                                                                                                                                              | OPEN          | PROPOSED |
| AC-04-04-01  | FEAT-04-04          | evidence aged 0 y and 3 y                                                  | confidence is computed                                              | weights are 1.0 and about 0.37 (decay constant {3}, micro FEAT-04-04.1)                                                                                                                                                                                                                                                                                                                                                                                                                                 | Boundary      | PROPOSED |
| AC-04-04-02  | FEAT-04-04          | evidence that supported a skill is revoked                                 | the outbox event is processed                                       | confidence is recomputed asynchronously, excludes the revoked item and is audited (BR-T005; SPEC-G2 05-05 impact pipeline)                                                                                                                                                                                                                                                                                                                                                                              | Happy         | PROPOSED |
| AC-04-04-03  | FEAT-04-04          | the same revocation event delivered twice                                  | the recompute job handles both                                      | one effect, same result (consumer dedupe on `event_id`, as AC-24-01-02)                                                                                                                                                                                                                                                                                                                                                                                                                                 | Idempotency   | PROPOSED |
| AC-04-04-04  | FEAT-04-04          | any client or role                                                         | tries to set a skill's confidence directly                          | rejected; confidence derives only from evidence rungs (hierarchy rationale "never self-set")                                                                                                                                                                                                                                                                                                                                                                                                            | Negative      | PROPOSED |
| AC-04-04-05  | FEAT-04-04          | OPEN: uncertainty interval (FEAT-04-04.3)                                  | the confidence is shown                                             | OPEN: the interval formula and display bounds. SPEC-G2 and BR-T071 define an uncertainty band only for match display, and the decay constant {3} is unratified                                                                                                                                                                                                                                                                                                                                          | OPEN          | PROPOSED |
| AC-15-02-01  | FEAT-15-02          | default preferences and an engagement notice at 22:00 local                | it is routed                                                        | deferred to 08:00 (BR-T086; micro FEAT-15-02.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Happy         | PROPOSED |
| AC-15-02-02  | FEAT-15-02          | an interview reminder raised during quiet hours                            | it is routed                                                        | sent now; interview reminders are time-critical (BR-T086)                                                                                                                                                                                                                                                                                                                                                                                                                                               | Happy         | PROPOSED |
| AC-15-02-03  | FEAT-15-02          | a security, verification, legal or billing category                        | the user tries to disable it                                        | refused; shown as locked with a reason (BR-T085; micro FEAT-15-02.2)                                                                                                                                                                                                                                                                                                                                                                                                                                    | Negative      | PROPOSED |
| AC-15-02-04  | FEAT-15-02          | a user who disabled quiet hours                                            | an engagement notice is routed at 22:00                             | sent now, not deferred (BR-T086 exception)                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Happy         | PROPOSED |
| AC-15-02-05  | FEAT-15-02          | OPEN: digest frequency (FEAT-15-02.3)                                      | the user picks a frequency                                          | OPEN: allowed values. BR-T087 caps digests at 1 per day; the instant/daily/weekly list in micro FEAT-09-06.2 is for job alerts only; no doc lists the values for notification digests. Also OPEN: whether 21:00 and 08:00 themselves are inside quiet hours                                                                                                                                                                                                                                             | OPEN          | PROPOSED |
| AC-19-01-01  | FEAT-19-01          | a report filed, then the reported message deleted                          | a moderator opens the case                                          | the frozen context snapshot shows the original text (micro FEAT-19-01.1)                                                                                                                                                                                                                                                                                                                                                                                                                                | Happy         | PROPOSED |
| AC-19-01-02  | FEAT-19-01          | one reporter with {20} reports today                                       | files the 21st                                                      | pointer only: the same assertion is AC-19-08-01 (`429` on the 21st, the 20th accepted; BR-T048, limit {20} unratified); not counted as a separate test                                                                                                                                                                                                                                                                                                                                                  | Boundary      | PROPOSED |
| AC-19-01-03  | FEAT-19-01          | two reports on one target in one category                                  | the second is filed                                                 | merged into the existing open case, no second case (BR-T048; SM-MODCASE t1)                                                                                                                                                                                                                                                                                                                                                                                                                             | Happy         | PROPOSED |
| AC-19-01-04  | FEAT-19-01          | a report is filed                                                          | the subject views any notice or case data                           | the reporter's identity is not exposed (BR-T048)                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Privacy       | PROPOSED |
| AC-19-01-05  | FEAT-19-01          | OPEN: report category (FEAT-19-01.2)                                       | a reporter chooses a category                                       | OPEN: the category list. BR-T048 and SM-MODCASE use "category" for dedupe but no spec or decision table enumerates the values                                                                                                                                                                                                                                                                                                                                                                           | OPEN          | PROPOSED |
| AC-20-02-01  | FEAT-20-02          | a support operator                                                         | creates a grant without a reason code                               | denied (BR-T041; TEST-SEC-022)                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Negative      | PROPOSED |
| AC-20-02-02  | FEAT-20-02          | grants of 4 h and of 4 h + 1 s                                             | each is created                                                     | the 4 h grant is allowed; the longer one is denied (BR-T041, at most 4 h)                                                                                                                                                                                                                                                                                                                                                                                                                               | Boundary      | PROPOSED |
| AC-20-02-03  | FEAT-20-02          | a grant past its expiry                                                    | the operator reads the subject's data                               | denied; the grant is shown as expired; audited (TEST-SEC-022; INV-T18)                                                                                                                                                                                                                                                                                                                                                                                                                                  | Security      | PROPOSED |
| AC-20-02-04  | FEAT-20-02          | an operator with no grant                                                  | reads a user's personal data                                        | denied and the attempt is audited (TEST-SEC-023; INV-T18)                                                                                                                                                                                                                                                                                                                                                                                                                                               | Security      | PROPOSED |
| AC-20-02-05a | FEAT-20-02          | a grant for subject A with a ticket id                                     | the operator reads subject B                                        | B denied (BR-T041)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Security      | PROPOSED |
| AC-20-02-05b | FEAT-20-02          | a grant for subject A with a ticket id                                     | the operator writes A's evidence, application or verification state | the write is denied (BR-T043)                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Security      | PROPOSED |
| AC-20-02-05c | FEAT-20-02          | a grant for subject A with a ticket id that has expired or needs more time | the operator continues                                              | a new grant is required; every read of A under the original grant was audited (BR-T042)                                                                                                                                                                                                                                                                                                                                                                                                                 | Security      | PROPOSED |
| AC-24-06-01  | FEAT-24-06          | Android Chrome                                                             | the app is installed                                                | installability and the offline shell work (per TEST-MOB-001, Android Chrome case; that test also covers push and is registered to FEAT-15-04, so it is a shared reference, not this feature's own test)                                                                                                                                                                                                                                                                                                 | Happy         | PROPOSED |
| AC-24-06-02  | FEAT-24-06          | cached profile, evidence, applications and saved jobs                      | the user logs out                                                   | the offline cache is cleared (micro FEAT-24-06.2)                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Privacy       | PROPOSED |
| AC-24-06-03  | FEAT-24-06          | remote and host versions that are incompatible                             | the update is detected                                              | a forced refresh runs and the unsaved draft is preserved (micro FEAT-24-06.3 edge case)                                                                                                                                                                                                                                                                                                                                                                                                                 | Failure       | PROPOSED |
| AC-24-06-04  | FEAT-24-06          | an offline cached list that the server has since changed                   | the device reconnects                                               | the cache is never treated as authoritative; queued writes are revalidated server-side (INV-T13)                                                                                                                                                                                                                                                                                                                                                                                                        | Invariant     | PROPOSED |
| AC-24-06-05  | FEAT-24-06          | a platform lacks installability or push (FEAT-24-06.4)                     | the user opens the app on it                                        | the fallback listed for that capability in `08_PWA_AND_MOBILE/PLATFORM_COMPATIBILITY_MATRIX.md` (PLT-01) section 3 applies, for example the instruction sheet for install or the in-app notification centre plus email for push (ADR-T20); correction 2026-10-27: an earlier version of this row said no document holds the matrix, which an independent review showed was wrong; the matrix is Under Review and its cells are not device-verified (OPEN-FE-01), so ratification is still owner-pending | Compatibility | PROPOSED |
| AC-10-17-01  | FEAT-10-17 (Remove) | an application whose match score is below any value                        | scoring completes                                                   | the application state is unchanged; nothing moves it to `rejected` automatically (INV-T09; SM universal rule U6)                                                                                                                                                                                                                                                                                                                                                                                        | Negative      | PROPOSED |
| AC-10-17-02  | FEAT-10-17 (Remove) | a rejection                                                                | it is recorded                                                      | the actor is a human and a `reasonCode` is present (SPEC-G4 rejection rule)                                                                                                                                                                                                                                                                                                                                                                                                                             | Negative      | PROPOSED |
| AC-10-17-03  | FEAT-10-17 (Remove) | a job with N applicants                                                    | the recruiter opens the applicant view                              | all N are returned; no score cut-off hides any (BR-T072, INV-T52)                                                                                                                                                                                                                                                                                                                                                                                                                                       | Invariant     | PROPOSED |
| AC-20-07-01  | FEAT-20-07 (Remove) | a staff principal of any role                                              | looks for a "log in as user" or impersonation route or role         | none exists; no impersonation role is defined (STAKEHOLDERS_ROLES_PERMISSIONS, "removed on principle")                                                                                                                                                                                                                                                                                                                                                                                                  | Negative      | PROPOSED |
| AC-20-07-02  | FEAT-20-07 (Remove) | a support operator holding a valid grant                                   | views the subject's data                                            | only a read-only scoped view is served; writes are denied (BR-T043; hierarchy: "replaced by read-only scoped view under grant")                                                                                                                                                                                                                                                                                                                                                                         | Security      | PROPOSED |
| AC-20-07-03  | FEAT-20-07 (Remove) | OPEN: proof that staff cannot obtain a session as the subject              | a test asserts it                                                   | OPEN: the mechanism to assert (token issuance guard, route lint). No document specifies how the absence is enforced                                                                                                                                                                                                                                                                                                                                                                                     | OPEN          | PROPOSED |

#### P0.2 Coverage table (feature to AC)

| Feature    | Result            | AC ids or location                                                                        |
| ---------- | ----------------- | ----------------------------------------------------------------------------------------- |
| FEAT-01-09 | already covered   | AC-01-09-01..03 (section 2 above)                                                         |
| FEAT-02-01 | already covered   | AC-02-01-01..05 (section 1.2 and section 2 above)                                         |
| FEAT-02-02 | new ACs, one OPEN | AC-02-02-01..04, OPEN AC-02-02-05                                                         |
| FEAT-02-07 | already covered   | AC-02-07-01..03                                                                           |
| FEAT-04-01 | already covered   | AC-04-01-01..03                                                                           |
| FEAT-04-02 | already covered   | AC-04-02-01..03                                                                           |
| FEAT-04-04 | new ACs, one OPEN | AC-04-04-01..04, OPEN AC-04-04-05                                                         |
| FEAT-07-01 | already covered   | AC-07-01-01                                                                               |
| FEAT-08-01 | already covered   | AC-08-01-01..02                                                                           |
| FEAT-10-17 | new ACs           | AC-10-17-01..03                                                                           |
| FEAT-15-01 | already covered   | AC-15-01-01..02                                                                           |
| FEAT-15-02 | new ACs, one OPEN | AC-15-02-01..04, OPEN AC-15-02-05                                                         |
| FEAT-15-03 | already covered   | AC-15-03-01..02                                                                           |
| FEAT-15-06 | already covered   | AC-15-06-01..02                                                                           |
| FEAT-15-07 | already covered   | AC-15-07-01..03                                                                           |
| FEAT-16-01 | already covered   | AC-16-01-01                                                                               |
| FEAT-17-01 | already covered   | AC-17-01-01..02                                                                           |
| FEAT-17-02 | already covered   | AC-17-02-01                                                                               |
| FEAT-17-03 | already covered   | AC-17-03-01..02                                                                           |
| FEAT-19-01 | new ACs, one OPEN | AC-19-01-01..04, OPEN AC-19-01-05                                                         |
| FEAT-19-02 | already covered   | AC-19-02-01                                                                               |
| FEAT-19-08 | already covered   | AC-19-08-01                                                                               |
| FEAT-20-01 | already covered   | AC-20-01-01..03                                                                           |
| FEAT-20-02 | new ACs           | AC-20-02-01..04, 05a, 05b, 05c (grant notification stays in AC-20-02.3-01)                |
| FEAT-20-03 | already covered   | AC-20-03-01..02                                                                           |
| FEAT-20-07 | new ACs, one OPEN | AC-20-07-01..02, OPEN AC-20-07-03                                                         |
| FEAT-21-01 | already covered   | AC-21-01-01..02                                                                           |
| FEAT-22-06 | already covered   | AC-22-06-01..02                                                                           |
| FEAT-24-01 | already covered   | AC-24-01-01..03                                                                           |
| FEAT-24-02 | already covered   | AC-24-02-01..03                                                                           |
| FEAT-24-04 | already covered   | AC-24-04-01..02                                                                           |
| FEAT-24-05 | already covered   | AC-24-05-01                                                                               |
| FEAT-24-06 | new ACs           | AC-24-06-01..05 (05 cites PLT-01 section 3; ratification and device verification pending) |
| FEAT-24-08 | already covered   | AC-24-08-01                                                                               |
| FEAT-24-09 | already covered   | AC-24-09-01..02                                                                           |
| FEAT-24-11 | already covered   | AC-24-11-01                                                                               |

Counts: 36 features checked; 28 already covered; 8 get new ACs (each also carries at least one concrete AC, so none is blocked outright); 38 new AC rows after review fixes, of which 32 are testable (AC-24-06-05 now cites PLT-01 section 3 after a second review caught the earlier wrong "no matrix" claim), 5 are OPEN placeholders and 1 (AC-19-01-02) is a pointer to AC-19-08-01 and not a separate test; all PROPOSED. Independent review (2026-10-27, Sonnet, read-only): PASS-WITH-FIXES; four fixes applied (AC-02-02-04 flagged unsourced, AC-19-01-02 made a pointer, AC-20-02-05 split into 05a/05b/05c, AC-24-06-01 reference corrected). Review limits: 20 of the 28 "already covered" claims were opened and all held; 02-01, 15-03, 15-07, 17-01, 17-03, 24-01, 24-04 and 24-09 were not opened. Weak existing ACs noted by the reviewer: AC-04-02-01 and AC-07-01-01 test little. Documents that still say "AC pending" or flag these features as blockers (COVERAGE_MATRICES.md, TEST_CATALOG.md, ROADMAP.md) are stale relative to this section.

#### P0.3 OPEN questions

1. FEAT-02-02.2 bulk invite CSV: row limit, dry run, duplicate handling, role per row. Silent: all feature specs (only the institution roster CSV exists, in SPEC-G5).
2. FEAT-04-04.3 uncertainty interval: formula and display bounds; ratification of decay constant {3}. Silent: SPEC-G2, BR-REG.
3. FEAT-15-02.3 digest frequency values, and whether the 21:00 and 08:00 instants are inside quiet hours. Silent: BR-T086, BR-T087, SPEC-G5.
4. FEAT-19-01.2 report category list. Silent: SPEC-G4/G5, DECISION_TABLES, STATE_MACHINES.
5. FEAT-24-06.4 platform fallback matrix. RESOLVED on paper 2026-10-27 (this item previously said all documents were silent, which was wrong): `PLATFORM_COMPATIBILITY_MATRIX.md` section 3 holds it. Remaining OPEN: owner ratification and device verification (OPEN-FE-01).
6. FEAT-20-07 how the absence of impersonation is enforced and tested. Silent: STAKEHOLDERS_ROLES_PERMISSIONS, BUSINESS_RULES_REGISTRY.
7. Limits in braces ({20} reports per day, {3} decay constant) remain unratified; the ACs cite them as written.

#### P0.4 Cross-document findings

- `COVERAGE_MATRICES.md` is stale: it still flags 28 features that section 2 above already covers, and it counts the two `Remove` features (FEAT-10-17, FEAT-20-07) as P0 blockers (already noted as REVW2-26).
- `TEST_CATALOG.md` and `ROADMAP.md` still say "AC pending" for FEAT-20-02, FEAT-15-02, FEAT-19-01 and FEAT-19-02, although micro-level or section 2 ACs exist.
- This file holds the REV2 acceptance additions twice (the folded copy and the preserved source record), so every REV2 AC ID appears twice; the two copies agree in the rows checked.

## Feature Specifications — Group 1: Identity, Sessions, Profile & Consent

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G1_IDENTITY_AND_PROFILE.md`._

Doc ID: SPEC-G1 · Owner: Product Director + Identity/Profile leads · Version 1.0 · Status: Under Review · Relates: DOM-01, DOM-03, DOM-22, FEAT-01-01…01-06, FEAT-01-13, FEAT-03-01, FEAT-03-02, FEAT-03-06, FEAT-03-08, FEAT-03-09, FEAT-22-01, SM-ACCOUNT, SM-SESSION, BR-T050…T059, BR-T061…T063, INV-T01, INV-T05, INV-T15, INV-T16, ADR-T06

Contract and conventions: see `README.md` in this folder. Endpoints are **provisional** paths under `/api/v1` (canonical `API-*` IDs are assigned in the API catalogue). All content **[TARGET]**; `{…}` values **[OPEN]**.

---

## SPEC-01 Registration, Login, Passkey, Session Refresh & Revocation

**Metadata:** Doc ID SPEC-01 · Owner: Identity PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 (passkey P1) · Features: FEAT-01-01, FEAT-01-02, FEAT-01-03, FEAT-01-04, FEAT-01-05, FEAT-01-06, FEAT-01-13 · Modules: MOD-SHELL, MOD-ACC · `api/identity` · Relates: ADR-T06, BR-T050…T059, INV-T05, INV-T16, INV-T33, INV-T34, SM-ACCOUNT, SM-SESSION, DT-09

### 1. Business purpose

Let a person create an identity, prove control of an email, sign in with a password or a phishing-resistant passkey, and hold a short-lived session that is renewable, listable and revocable. Remove the reference design's script-readable bearer token [REF] so that remotes never touch credentials (INV-T16). Business value: trust baseline for every other feature; activation funnel start (BP-01).

### 2. Actors & access

| Actor                       | May                                                                                                               | Policy action                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| ROLE-ANON                   | register, verify email, sign in, request reset                                                                    | `auth:register`, `auth:login`, `auth:reset` (public, rate-limited) |
| Any authenticated principal | list/revoke own sessions, manage own passkeys/password                                                            | `session:read:own`, `session:revoke:own`, `credential:manage:own`  |
| ROLE-ADM / ROLE-SUP         | no direct access to credentials or session secrets; may revoke sessions of a user under an active grant (BR-T042) | `session:revoke:subject` (grant-bound)                             |
| System                      | purge unverified accounts, expire sessions, send mail                                                             | worker jobs                                                        |

### 3. Functional behavior

#### 3.1 Inputs and validation

| Field                    | Rule                                                                                                                           | Error                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| email                    | trimmed, NFKC, lower-cased domain; local part case preserved but compared case-insensitively; ≤ 254; one `@`; no control chars | `422 email_invalid`                                           |
| password                 | 12–128 chars (Unicode allowed, no composition rules); not in breached list (BR-T051); not equal to email local part            | `422 password_weak` / `password_breached`                     |
| displayName              | 1–80 chars, no control chars, trimmed                                                                                          | `422`                                                         |
| acceptedPolicies         | array of `{policyId, version}` for current Terms and Privacy versions (FEAT-01-13, FEAT-22-06)                                 | `422 policy_not_accepted`                                     |
| ageAttestation           | boolean checkbox "I am old enough to use this service" **[OPEN-09: age and guardian rules not decided]**                       | `422`                                                         |
| passkey creation options | WebAuthn `PublicKeyCredentialCreationOptions` generated server-side; challenge ≥ 16 bytes, single-use, TTL 5 min               | `400 challenge_expired`                                       |
| verification code        | 6 digits (≥ 6), TTL 15 min, ≤ 5 attempts, hashed (BR-T053)                                                                     | `422 code_invalid`, `429 too_many_attempts`                   |
| reset token              | ≥ 128-bit random, TTL 30 min, single-use (BR-T054)                                                                             | `410 token_invalid` (single message for expired/used/unknown) |

#### 3.2 Rules and calculations

1. **Enumeration safety:** `POST /auth/register`, `/auth/login`, `/auth/password/reset-request` return responses whose body, status and (within tolerance) latency do not depend on whether the email exists. If the email exists, the owner receives an "already registered / someone tried to sign up" email instead.
2. **Login throttle (BR-T052):** delay = min(15 min, 2^(n−5) × 15 s) after the 5th consecutive failure, tracked per (normalised email, IP /24 or /64 bucket) and per IP globally; during a delay even correct credentials return `429 Retry-After` (denies an oracle).
3. **Session creation (BR-T056):** on success create a _session family_ (SM-SESSION t1); issue access (15 min) and refresh (generation 1) cookies; family `idle_expires_at = +14 d`, `abs_expires_at = +30 d` ("remember me": +90 d; privileged roles: idle 30 min, abs 8 h, BR-T044).
4. **Refresh:** per DT-09 (rotation, 5 s leeway, reuse ⇒ family revoke).
5. **Cookies:** access `__Host-ts_at` (`Secure; HttpOnly; SameSite=Lax; Path=/`); refresh `__Secure-ts_rt` (`Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth/refresh` — `__Host-` cannot be path-scoped). CSRF: unsafe requests require an `X-CSRF-Token` header equal to the per-session value issued by `GET /me` / login **and** a matching `Origin`.
6. **Passkey login:** verify origin, `rpId`, challenge, user-presence/verification flags; if stored `signCount` > 0 and presented ≤ stored ⇒ reject, mark credential `suspect`, notify holder (synced passkeys reporting 0 are exempt).
7. **Step-up (BR-T057):** sensitive actions require a re-authentication newer than 5 min (`reauthAt` claim).
8. **Password change/reset:** revokes all other sessions (SM-SESSION t5); reset also revokes the current one.

#### 3.3 Side effects

Events (outbox, INV-T12): `account.registered`, `account.verified`, `session.created`, `session.revoked`, `credential.added/removed`, `auth.reuse_detected`. Notifications: verification code, new-device sign-in (BR-T059), password changed, passkey added, reset requested, reuse detected. Audit entries for all credential and session changes.

#### 3.4 Postconditions

After register: exactly one `pending_verification` account (INV-T34). After verification: `active`, one primary verified email, session issued. After revoke: family `revoked`, effective on every request within 60 s p95 (access tokens carry `sid`, checked against a revocation cache).

### 4. User interaction

| Screen (provisional)                                                                                                                                                                                                                                                                                                                                                                        | Behaviour                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCR-SIGNUP                                                                                                                                                                                                                                                                                                                                                                                  | email, password with strength hint (length first), "Use a passkey instead" if feature-detected, policy acceptance with links; generic success state "Check your email" |
| SCR-VERIFY-EMAIL                                                                                                                                                                                                                                                                                                                                                                            | 6-digit field `autocomplete="one-time-code"`, resend (countdown 60 s), paste allowed                                                                                   |
| SCR-LOGIN                                                                                                                                                                                                                                                                                                                                                                                   | email field with `autocomplete="username webauthn"` enabling conditional-UI passkey autofill; password field `current-password`; show/hide toggle; no CAPTCHA          |
| SCR-PASSKEY-PROMPT                                                                                                                                                                                                                                                                                                                                                                          | after first password login, offer "Add a passkey" (skippable, re-offered after 30 d, max 3 times)                                                                      |
| SCR-RESET / SCR-RESET-SET                                                                                                                                                                                                                                                                                                                                                                   | non-enumerating copy; new password with `new-password`                                                                                                                 |
| SCR-SESSIONS (MOD-ACC)                                                                                                                                                                                                                                                                                                                                                                      | device label, approx location (country/region from IP prefix), last used, current marked; revoke one, revoke others                                                    |
| **Accessibility (WCAG 2.2 AA):** labels and error summary, focus to first error, 3.3.8 Accessible Authentication (paste, password managers, passkeys; no cognitive tests), touch targets ≥ 24 px, no reliance on colour. **Offline:** all auth is online-only (ADR-T10). **Remotes:** call `host.auth.requireAuth()`/`host.auth.onSessionLost()`; they never receive credentials (INV-T16). |

### 5. Backend behavior

Same-origin BFF routes (ADR-T06). Order on `POST /auth/login`: rate-limit check → normalise → lookup (constant-time path for unknown email: hash a dummy) → verify → account-state check (`active` only) → create family + tokens → audit + outbox → set cookies. Workers: `purge-unverified-accounts` (daily), `expire-sessions` (hourly sweep; lazy check on use), `send-email` via notify. Ports: `EmailPort`, `ClockPort`, `BreachListPort` (k-anonymity range query; if unavailable at registration accept only length ≥ 14 and set `breach_recheck_at` — fail-safe, not fail-open), `WebAuthnPort`.

| Endpoint (provisional)                                 | Method                | Notes                                        |
| ------------------------------------------------------ | --------------------- | -------------------------------------------- |
| `/auth/register`                                       | POST                  | idempotent by normalised email; always `202` |
| `/auth/verify-email`                                   | POST                  | consumes code; issues session                |
| `/auth/verify-email/resend`                            | POST                  | ≤ 3/h                                        |
| `/auth/login`                                          | POST                  | password                                     |
| `/auth/passkey/options` + `/auth/passkey/verify`       | POST                  | login ceremony                               |
| `/me/passkeys`                                         | GET/POST/PATCH/DELETE | requires step-up for POST/DELETE             |
| `/auth/refresh`                                        | POST                  | cookie only                                  |
| `/auth/logout`                                         | POST                  | revokes current family                       |
| `/auth/sessions`                                       | GET                   | own families                                 |
| `/auth/sessions/{id}`                                  | DELETE                | revoke one                                   |
| `/auth/sessions/revoke-others`                         | POST                  |                                              |
| `/auth/password/reset-request`, `/auth/password/reset` | POST                  |                                              |

### 6. Data (logical, not final DDL)

| Entity                                          | Key fields                                                                                                                          | Retention                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `account`                                       | id, email_normalised (unique among non-erased), email_verified_at, state (SM-ACCOUNT), display_name, locale, version                | until erasure                   |
| `credential_password`                           | account_id, hash + parameters, changed_at, breach_recheck_at                                                                        | until erasure                   |
| `credential_passkey`                            | id, account_id, credential_id (unique), public_key, sign_count, transports, name, status (`ok`/`suspect`), created_at, last_used_at | until removed                   |
| `one_time_code`                                 | id, account_id, purpose, code_hash, expires_at, attempts, consumed_at                                                               | 30 d after expiry               |
| `session_family`                                | id, account_id, state, reason, created_at, last_seen_at, idle_expires_at, abs_expires_at, device_label, ua_hash, ip_prefix          | 90 d after end (security audit) |
| `refresh_token`                                 | id, family_id, generation, token_hash, issued_at, used_at                                                                           | with family                     |
| `login_attempt`                                 | account_key_hash, ip_bucket, outcome, at                                                                                            | 30 d                            |
| `policy_acceptance`                             | account_id, policy_id, version, accepted_at                                                                                         | permanent ledger                |
| Invariants: INV-T05, INV-T33, INV-T34, INV-T43. |

### 7. States and transitions

Account: SM-ACCOUNT t1, t2 (this spec). Session: SM-SESSION t1–t6. Forbidden examples: `revoked → active`; refresh for non-`active` account (DT-09 row 7).

### 8. Non-functional requirements

| Area          | Requirement (targets; authoritative values in NFR docs)                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance   | login server time p95 ≤ 400 ms (hash cost dominates); refresh p95 ≤ 150 ms                                                                        |
| Availability  | auth is tier-0; if the session store is down, fail **closed** (`503`), never allow                                                                |
| Security      | memory-hard password hashing; constant-time compares; no token in URL/body/log; Origin+CSRF; credential stuffing throttles; INV-T14 log redaction |
| Privacy       | IP stored as prefix; device label derived from UA; no raw UA retained beyond hash + label                                                         |
| Accessibility | WCAG 2.2 AA incl. 3.3.8                                                                                                                           |
| i18n          | emails and errors localisable; email normalisation Unicode-safe                                                                                   |
| Compatibility | WebAuthn feature-detected; Safari/iOS installed-PWA cookie behaviour covered in the platform matrix (FF-09)                                       |

### 9. Failure scenarios

| Scenario                                      | Expected behaviour                                                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Email provider down at registration           | `202` still; outbox retries (SM-NOTIFY); resend available; no duplicate account                                                        |
| Duplicate submit / double click               | idempotent by normalised email; one account, one active code                                                                           |
| Two tabs refresh at once                      | client uses Web Locks single-flight; server leeway returns same successor; no logout                                                   |
| Cookies blocked by browser                    | login succeeds server-side but app detects missing session cookie and shows explanatory screen                                         |
| Stolen refresh cookie replayed after rotation | reuse ⇒ family revoked, victim notified (BR-T050)                                                                                      |
| Breach-list service unavailable               | accept ≥ 14-char password, schedule re-check, force change if later found breached                                                     |
| Passkey device lost                           | sign in with password/recovery; remove passkey; if passkey-only account ⇒ recovery email flow (FEAT-01-06.3) with 24 h hold and notice |
| Clock skew on client                          | irrelevant: all expiry on server clock                                                                                                 |
| Account suspended while session active        | next request 403 `account_state`; family revoked (SM-SESSION t6)                                                                       |

### 10. Acceptance criteria

| AC          | Given                                                                | When                                                         | Then                                                                                         | Type                 |
| ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------- |
| AC-01-01-01 | no account for `a@x.com`                                             | register with valid password and policies                    | `202` generic body; one `pending_verification` account; one code email queued; no cookie set | Happy                |
| AC-01-01-02 | account for `a@x.com` exists                                         | register again (any case variant)                            | identical `202` body; no second account; owner gets "already registered" email               | Negative/enumeration |
| AC-01-01-03 | password lengths 11, 12, 128, 129                                    | register                                                     | 11 and 129 ⇒ `422`; 12 and 128 ⇒ accepted                                                    | Boundary             |
| AC-01-01-04 | breached password                                                    | register                                                     | `422 password_breached`; no account                                                          | Negative             |
| AC-01-01-05 | valid code, age 14 min                                               | verify                                                       | account `active`, session cookies set, code consumed                                         | Happy                |
| AC-01-01-06 | same code                                                            | verify again                                                 | `422 code_invalid`; no second session                                                        | Negative             |
| AC-01-01-07 | 5 wrong codes                                                        | 6th attempt with the correct code                            | `429`; requires new code                                                                     | Boundary             |
| AC-01-01-08 | two concurrent registrations `A@x.com` and `a@x.com`                 | submitted simultaneously                                     | exactly one account exists                                                                   | Concurrency          |
| AC-01-01-09 | email provider returns 5xx for 10 min                                | register                                                     | `202`; delivery retried per SM-NOTIFY; user can resend                                       | Recovery             |
| AC-01-01-10 | unverified 7 days                                                    | purge job runs                                               | account `purged`, email reusable                                                             | Time                 |
| AC-01-13-01 | policies not accepted                                                | register                                                     | `422 policy_not_accepted`; with acceptance, ledger rows store versions                       | Negative/Happy       |
| AC-01-02-01 | valid credentials                                                    | login                                                        | cookies `HttpOnly; Secure; SameSite=Lax`; response body contains no token                    | Happy/Security       |
| AC-01-02-02 | 5 failures for (account, IP bucket)                                  | 6th attempt with the correct password immediately            | `429 Retry-After`; same account from another IP bucket unaffected                            | Boundary             |
| AC-01-02-03 | unknown email vs wrong password                                      | login                                                        | identical status/body; latency distributions indistinguishable in test                       | Negative             |
| AC-01-02-04 | first login from new device                                          | login                                                        | "new sign-in" email within 5 min                                                             | Happy                |
| AC-01-02-05 | account `suspended`                                                  | login                                                        | read-only appeal screen only; no profile data returned                                       | Negative             |
| AC-01-03-01 | authenticated user with recent re-auth                               | add passkey                                                  | credential stored; appears in list; confirmation email                                       | Happy                |
| AC-01-03-02 | add passkey without recent re-auth                                   | POST                                                         | `403 reauth_required`                                                                        | Negative             |
| AC-01-03-03 | browser without WebAuthn                                             | open login                                                   | passkey UI hidden; password path works                                                       | Fallback             |
| AC-01-03-04 | challenge already used or older than 5 min                           | verify assertion                                             | rejected `400`                                                                               | Negative/Replay      |
| AC-01-03-05 | assertion with wrong origin/rpId                                     | verify                                                       | rejected                                                                                     | Security             |
| AC-01-03-06 | account with a single passkey and no password/recovery               | remove it                                                    | `409 last_method`                                                                            | Negative             |
| AC-01-03-07 | stored signCount 5, presented 3                                      | verify                                                       | rejected; credential `suspect`; holder notified                                              | Security             |
| AC-01-04-01 | access token expired                                                 | next API call                                                | client refreshes silently; request retried once; user sees nothing                           | Happy                |
| AC-01-04-02 | refresh token generation 1 presented after rotation to 2, 10 s later | refresh                                                      | `401 reuse_detected`; family revoked; notice sent                                            | Security             |
| AC-01-04-03 | two tabs refresh within 1 s                                          | both refresh                                                 | both succeed; family valid; exactly one successor exists                                     | Concurrency          |
| AC-01-04-04 | idle 14 d + 1 s                                                      | any call                                                     | `401 session_expired`; absolute 30 d likewise                                                | Boundary             |
| AC-01-04-05 | running app                                                          | inspect `localStorage`, `sessionStorage`, JS-visible cookies | no access or refresh token present                                                           | Security             |
| AC-01-04-06 | unsafe request with missing CSRF header or foreign Origin            | POST                                                         | `403`                                                                                        | Security             |
| AC-01-05-01 | 3 sessions                                                           | open sessions page                                           | 3 rows, current flagged                                                                      | Happy                |
| AC-01-05-02 | revoke other device                                                  | that device's next request                                   | `401` within 60 s                                                                            | Happy                |
| AC-01-05-03 | change password                                                      | complete                                                     | all other families revoked, current kept                                                     | Happy                |
| AC-01-06-01 | unknown or known email                                               | request reset                                                | identical response                                                                           | Negative             |
| AC-01-06-02 | reset token used once                                                | reuse                                                        | `410`; expired at 30 min + 1 s also `410`                                                    | Negative/Boundary    |
| AC-01-06-03 | successful reset                                                     | complete                                                     | all sessions revoked; notice to account email                                                | Happy                |

### 11. Testing

Unit: normaliser, throttle curve, code/token lifecycle, DT-09 table (one test per row). Integration: full ceremonies with fake `EmailPort` and `ClockPort`; passkey with virtual authenticator. Security suite: enumeration timing, CSRF, token-in-log scan (INV-T14), cookie flags, reuse detection. E2E (Playwright): signup→verify→login→refresh across tab pair→revoke; WebKit run for FF-09. Accessibility: automated axe + manual keyboard/screen-reader script for SCR-LOGIN. Load: credential-stuffing profile against throttle.

### 12. Developer guidance

Build order: account+code lifecycle → password login → sessions/refresh → session UI → passkeys → reset. Pitfalls: never return `Set-Cookie` tokens in JSON; do not log request bodies on `/auth/*`; email scanners prefetch links, so **codes** (not click-through tokens) are used for verification; ensure refresh path cookie scoping does not break the shell's silent refresh. Decision pending: **OPEN-09** age/guardian rules; **OPEN** idle/absolute lifetimes; **OPEN** whether to allow passwordless-only signup in Phase 1.

### 13. Related

`ADR_REGISTER.md` ADR-T06 · `CANONICAL_INVARIANTS.md` INV-T05/T14/T16 · `STATE_MACHINES.md` SM-ACCOUNT, SM-SESSION · `DECISION_TABLES.md` DT-09 · `BUSINESS_RULES_REGISTRY.md` BR-T050…T059.

---

## SPEC-02 Profile & Consent Scopes

**Metadata:** Doc ID SPEC-02 · Owner: Profile PM + Privacy PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-03-01, FEAT-03-02, FEAT-03-06, FEAT-03-08, FEAT-03-09, FEAT-22-01 · Modules: MOD-CAND, MOD-ACC, MOD-SHELL · `api/profile`, `api/privacy` · Relates: INV-T15, INV-T29, INV-T40, BR-T061…T063, BR-T069, BR-T117, DT-01, ADR-T08, ADR-T10

### 1. Business purpose

Let a candidate present themselves truthfully and decide, per field and per grantee, who may see what. Consent scopes are the product's answer to "recruiters see evidence only with permission" (INV-T15): without this feature, search, outreach and application snapshots cannot ship. Business value: candidate trust, regulatory posture, higher-quality discoverable pool.

### 2. Actors & access

| Actor              | May                                                                            | Policy action                            |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------------- |
| ROLE-CAND          | create/read/update own profile; grant/revoke consents; manage links, blocklist | `profile:write:own`, `consent:write:own` |
| Any viewer         | read visible fields per DT-01                                                  | `profile:read:visible`                   |
| ROLE-REC / ROLE-HM | read per DT-01 rows 4–7                                                        | `profile:read:consented`                 |
| ROLE-SUP           | read under grant only (DT-01 row 14)                                           | `profile:read:granted`                   |
| ROLE-AUD           | read consent ledger aggregates                                                 | `consent:audit`                          |

### 3. Functional behavior

#### 3.1 Profile inputs and validation

| Field                         | Rule                                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| displayName                   | 1–80, trimmed                                                                                                                                               |
| headline                      | ≤ 120 (boundary tested at 120/121)                                                                                                                          |
| summary                       | ≤ 2,000, plain text + limited inline (no HTML; sanitised Markdown subset)                                                                                   |
| location                      | structured: country (ISO 3166-1 alpha-2), region, city; coarse display by default                                                                           |
| links                         | ≤ 10, `https` only, host not in private ranges, normalised                                                                                                  |
| pronouns / name pronunciation | ≤ 20 / ≤ 80 chars, optional                                                                                                                                 |
| photo                         | JPEG/PNG/WebP ≤ 5 MB, scanned (BR-T003), shown only after clean scan                                                                                        |
| skills                        | references to canonical skills only (BR-T006 analogue: FEAT-04-02)                                                                                          |
| field visibility              | each of: `private` · `applications` (only inside submitted application snapshots) · `discoverable` (recruiter search with `search.discoverable`) · `public` |

#### 3.2 Consent scopes (FEAT-22-01)

The scope ids, defaults, grain, expiry and revocation effects are defined only in `00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md` (CSC). This table is the candidate-facing view; the former `CS-*` ids map to canonical ids in CSC section 4.

| Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Purpose text (versioned)                                                  | Grantee                                        | Default | Effect                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------- | ------- | --------------------------------------------------------- |
| `search.discoverable` (was `CS-DISCOVER`)                                                                                                                                                                                                                                                                                                                                                                                                                         | "Let recruiters find my profile summary in search"                        | all verified orgs                              | off     | appears in index; honours blocklist                       |
| `outreach.recruiter_contact` (was `CS-CONTACT`)                                                                                                                                                                                                                                                                                                                                                                                                                   | "Let recruiters send me first-contact requests"                           | all verified orgs                              | off     | enables DT-08 row 6                                       |
| `evidence.share_summary` (was `CS-EVID-SUMMARY`)                                                                                                                                                                                                                                                                                                                                                                                                                  | "Show evidence titles, skills and strength to recruiters who find me"     | all verified orgs                              | off     | summary visible in search (needs `search.discoverable`)   |
| `evidence.share_artefact` (was `CS-EVID-ARTEFACT`)                                                                                                                                                                                                                                                                                                                                                                                                                | "Let this employer open my evidence files"                                | **specific org**, optionally one evidence item | off     | per-employer grant; optional expiry (default {12 months}) |
| `profile.share_contact` (was `CS-CONTACT-DETAILS`)                                                                                                                                                                                                                                                                                                                                                                                                                | "Share my email/phone with this employer"                                 | specific org                                   | off     | optional expiry (default {12 months}) [OPEN-CS-05]        |
| `alumni.share_outcomes` (was `CS-ALUMNI`)                                                                                                                                                                                                                                                                                                                                                                                                                         | "Share outcomes with my institution"                                      | specific institution, chosen fields            | off     | FEAT-18-07                                                |
| `profile.public_view`                                                                                                                                                                                                                                                                                                                                                                                                                                             | "Make my profile visible to anyone with its public page"                  | anyone                                         | off     | public page and `public` fields                           |
| `matching.recommend`                                                                                                                                                                                                                                                                                                                                                                                                                                              | "Use my profile and evidence to recommend jobs and explain matches to me" | none                                           | off     | recommendations, match explanations                       |
| `evidence.share_institution`                                                                                                                                                                                                                                                                                                                                                                                                                                      | "Include my work in my institution's cohort reports"                      | specific institution                           | off     | cohort reads and aggregates (BR-T100)                     |
| `ai.assist.process`                                                                                                                                                                                                                                                                                                                                                                                                                                               | "Send my content, redacted, to AI providers to get suggestions"           | none (processor)                               | off     | AI endpoints; INV-T06..T09                                |
| `analytics.product`                                                                                                                                                                                                                                                                                                                                                                                                                                               | "Help improve the product with usage analytics"                           | none                                           | off     | client and server analytics                               |
| `comms.marketing_email`                                                                                                                                                                                                                                                                                                                                                                                                                                           | "Send me tips and product news by email"                                  | none                                           | off     | marketing sends (DT-07 row 8)                             |
| `data.research_aggregate`                                                                                                                                                                                                                                                                                                                                                                                                                                         | "Include my data in anonymised research"                                  | none                                           | off     | hidden until OPEN-B10 is decided                          |
| `application.share_snapshot` (was `CS-APPLICATION`) is implicit per application and is not a toggle (BR-T062); it is written as a ledger row in the apply transaction. Each grant stores: scope, scope-text version, grantee (all verified orgs / org id / institution id), target (evidence or application id, optional), optional `field_set` (alumni only), granted_at, expires_at, source (UI/API/application), and appends to an immutable ledger (INV-T35). |

#### 3.3 Rules and calculations

1. Visibility changes that imply a scope (e.g. setting a field `discoverable`) **call the consent API**; there is a single source of truth, not two flags.
2. **Completeness guidance (03-01.1):** score = Σ weights of present items {headline, ≥3 skills, ≥1 work claim, ≥1 evidence at rung ≥ artifact-backed, visibility chosen}; displayed as a checklist of next actions, never as a rank or "profile strength" shown to recruiters.
3. **Slug (03-06.1):** 3–30 chars `[a-z0-9-]`, no leading/trailing hyphen, not in reserved list, unique; change ≤ 1 per 30 days; old slug redirects 90 d.
4. **Share link (03-06.2):** ≥ 128-bit random token stored hashed, selected evidence set, expiry ≤ 90 d (default 14 d), revocable, view count, `noindex`.
5. **Public profile SEO (03-06.3):** `noindex` by default; candidate may opt in.
6. **Blocklist (03-09.3):** ≤ 200 orgs; applied in search, shortlist suggestions and outreach (INV-T40); candidate remains free to apply to a blocked org (explicit action clears block for that org with confirm).
7. **Draft conflicts (03-08.1):** profile reads return `ETag`; writes use `If-Match`; mismatch ⇒ `412` with current server representation.

#### 3.4 Side effects & postconditions

`profile.updated`, `consent.changed` events (outbox). On `consent.changed` the search indexer and cache invalidator run (BR-T063). Access logging for recruiter reads feeds FEAT-22-04. Postcondition: DT-01 evaluated afresh on every read; no cached allow outlives 60 s.

### 4. User interaction

| Screen                                                                                                                                                              | Behaviour                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCR-PROFILE-EDIT                                                                                                                                                    | sectioned form, autosave per section (debounced 1.5 s) with "Saved" status; offline edits queued with "will sync" badge (FEAT-03-08.2); conflict dialog shows field-level diff (mine/theirs) |
| SCR-VISIBILITY                                                                                                                                                      | table "who can see what", presets (Private · Apply-only · Discoverable summary); **Preview as recruiter** (FEAT-03-02.2) renders DT-01 row 5                                                 |
| SCR-CONSENTS                                                                                                                                                        | per-scope list with purpose text, grantee, date, version; revoke button; per-employer grants listed by org name; history tab                                                                 |
| SCR-SHARE                                                                                                                                                           | create/revoke links, expiry picker, evidence selector                                                                                                                                        |
| SCR-BLOCKLIST                                                                                                                                                       | search orgs; list                                                                                                                                                                            |
| Plain-language consent copy (reading grade ≤ 9), no pre-ticked boxes, no dark patterns. A11y: switch controls have programmatic names and live-region confirmation. |

### 5. Backend behavior

`PATCH /me/profile` (If-Match) → validate → persist new version → outbox `profile.updated` (only on change). `PUT /me/consents/{scope}` with body `{granted, policyVersion, granteeType?, granteeId?, targetType?, targetId?, fieldSet?, expiresAt?}` (shape validated against the scope's grain, CSC section 2; `granted:false` revokes, matching the OpenAPI contract) → ledger append → derived `consent_current` projection updated in the same transaction. Read paths: `GET /profiles/{slug}`, `GET /share/{token}`, recruiter reads go through POL `can(principal,"profile:read",resource)` which evaluates DT-01 using `consent_current`. Worker: re-confirmation prompts for `search.discoverable` every {12 months}; expiry sweeper for per-employer grants (notify 14 d before).

### 6. Data

| Entity            | Fields (key)                                                                                                           | Notes                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `profile`         | account_id, version, display_name, headline, summary, location, links[], photo_ref, visibility map, slug, updated_at   | one per account         |
| `profile_history` | profile_id, version, diff, changed_at                                                                                  | FEAT-03-10 later        |
| `consent_ledger`  | id, account_id, scope, scope_text_version, grantee_type, grantee_id, action (`grant`/`revoke`), expires_at, source, at | append-only (INV-T35)   |
| `consent_current` | derived projection per (account, scope, grantee)                                                                       | rebuildable from ledger |
| `share_link`      | id, account_id, token_hash, evidence_ids[], expires_at, revoked_at, views                                              |                         |
| `blocked_org`     | account_id, org_id, at                                                                                                 |                         |
| `consent_text`    | scope, version, text, effective_at                                                                                     | versioned copy          |

### 7. States and transitions

Profile has no lifecycle SM beyond account state (SM-ACCOUNT: hidden when `deactivated`/`pending_erasure`/`suspended`). Consent grants: `granted → revoked | expired` (terminal; re-grant creates a new row).

### 8. Non-functional requirements

| Area          | Requirement                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Performance   | profile read p95 ≤ 150 ms; consent change visible to POL ≤ 60 s; index removal ≤ 15 min p95       |
| Privacy       | purpose-bound, versioned, revocable (INV-T15); minimal default exposure                           |
| Security      | IDOR tests on every profile/consent endpoint (INV-T02); no recruiter read without DT-01 allow     |
| Accessibility | WCAG 2.2 AA; consent text readable by screen readers                                              |
| Offline       | read cache of own profile; queued edits only (ADR-T10); server revalidates                        |
| i18n          | consent text translated per locale **with version parity** (translation updates are new versions) |

### 9. Failure scenarios

| Scenario                                       | Expected behaviour                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Concurrent edit on two devices                 | second writer gets `412` and a merge dialog; no silent overwrite                              |
| Revoke during recruiter session                | recruiter's next read denied (≤ 60 s); previously exported data not recalled (stated in copy) |
| Indexer lag                                    | search may show stale entry ≤ 15 min p95, but profile **fetch** is denied immediately         |
| Consent text updated                           | existing grants stay bound to old version; new purposes need fresh consent                    |
| Photo scan fails                               | photo hidden; owner informed; profile otherwise saved                                         |
| Slug race                                      | unique constraint decides; loser gets `409 slug_taken`                                        |
| Offline queued edit applies to deleted account | `410`; queue discarded with notice                                                            |

### 10. Acceptance criteria

| AC          | Given                                                  | When                                                   | Then                                                                                                                                | Type                 |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| AC-03-01-01 | valid profile payload                                  | save                                                   | `200`, new ETag, one `profile.updated`                                                                                              | Happy                |
| AC-03-01-02 | headline of 120 and 121 chars                          | save                                                   | 120 ok; 121 ⇒ `422`                                                                                                                 | Boundary             |
| AC-03-01-03 | link `javascript:alert(1)` or private-range host       | save                                                   | `422`                                                                                                                               | Negative/Security    |
| AC-03-01-04 | uploaded photo fails scan                              | view profile                                           | photo not shown to anyone; owner notified                                                                                           | Negative             |
| AC-03-02-01 | new account                                            | recruiter searches / anonymous opens profile URL       | not found / `404` (private by default)                                                                                              | Negative             |
| AC-03-02-02 | set field to `discoverable`                            | save                                                   | `search.discoverable` ledger row exists; indexer notified                                                                           | Happy                |
| AC-03-02-03 | preview as recruiter                                   | open                                                   | output equals DT-01 row 5 result for the same data                                                                                  | Consistency          |
| AC-22-01-01 | grant `search.discoverable`                            | complete                                               | ledger row with scope, text version, ts; `consent.changed`; visible in search ≤ 15 min p95                                          | Happy                |
| AC-22-01-02 | revoke `search.discoverable`                           | recruiter next fetch                                   | denied on the first read after the revoke commits (no consent cache, CSC section 6; test timeout 60 s); removed from index ≤ 15 min | Happy/Timing         |
| AC-22-01-03 | `evidence.share_artefact` granted to Org A             | Org B recruiter opens artefact URL                     | `403`/`404`; no existence leak                                                                                                      | Negative/IDOR        |
| AC-22-01-04 | scope text v2 published                                | existing v1 grant                                      | still active as v1; re-confirm prompt only for new purposes                                                                         | Happy                |
| AC-22-01-05 | attempt `UPDATE consent_ledger` as app role            | execute                                                | denied by DB                                                                                                                        | Security             |
| AC-22-01-06 | per-employer grant with expiry in 12 months            | day 349                                                | notification sent; day 365 grant `expired`, access denied                                                                           | Time                 |
| AC-03-06-01 | slug `Admin`, `-ab`, `ab`, 31 chars, taken             | set                                                    | each `422/409`; valid unique slug ok                                                                                                | Boundary             |
| AC-03-06-02 | share link expired vs never existed                    | open both                                              | identical `404`                                                                                                                     | Negative/Enumeration |
| AC-03-06-03 | revoke share link                                      | open within 60 s                                       | denied                                                                                                                              | Happy                |
| AC-03-06-04 | new public profile                                     | crawl headers                                          | `X-Robots-Tag: noindex` unless opted in                                                                                             | Default              |
| AC-03-08-01 | two devices edit headline                              | second saves stale                                     | `412` + server version; UI shows diff; neither edit lost                                                                            | Concurrency          |
| AC-03-08-02 | offline edit, then reconnect with newer server version | sync                                                   | conflict dialog; no overwrite (BR-T117)                                                                                             | Recovery             |
| AC-03-09-01 | candidate blocks Org X                                 | Org X recruiter searches / lists shortlist suggestions | candidate absent (INV-T40)                                                                                                          | Negative             |
| AC-03-09-02 | 200 blocked orgs                                       | add 201st                                              | `422`                                                                                                                               | Boundary             |

### 11. Testing

Policy matrix test generated from DT-01 (one case per row). IDOR suite across profile/consent/share endpoints. Ledger immutability test. Timing tests with controllable clock for revocation propagation. Cross-tenant canary (FF-05) for recruiter reads. E2E: grant→appear in search→revoke→disappear. Content test: consent copy renders in each launched locale with the right version.

### 12. Developer guidance

Implement `consent_current` as a pure fold of the ledger and test equivalence (PROP). Put DT-01 in `packages/policy` only; the search query builder must call the same predicate (do not reimplement in SQL by hand — generate the SQL filter from the same rule definition or test both against the matrix). Pitfall: caching recruiter reads at CDN level; set `private, no-store` on all consented endpoints. Decision pending: **OPEN-07** persona validation of default presets; **OPEN-08** retention of ledger after erasure (ledger rows for the subject are not rewritten or deleted by erasure: they hold an opaque `subject_ref`, and erasure deletes the identity mapping so they no longer resolve; DB-02 §4.1).

### 13. Related

`DECISION_TABLES.md` DT-01 · `STATE_MACHINES.md` SM-ACCOUNT · `BUSINESS_RULES_REGISTRY.md` BR-T061…T063, T069 · `PRODUCT_INVARIANT_REGISTRY.md` INV-T29, T35, T40 · SPEC-03 (evidence sharing), SPEC-09 (application snapshot), SPEC-13 (export/erasure).

### Contract links (patch 2026-10-27)

Evidence label: PROPOSED mapping. Every id below was grepped in its owner file on 2026-10-27; ids marked "none" do not exist and are OPEN. Owners: ACT-ATOM-nn in 07 ACTION_REGISTRY; FLD-* in 07 SCREEN_SPECIFICATIONS_KEY; EDG-nn in 06 BUSINESS_PROCESS_INVENTORY; XT-nn in 06 SSOT_WORKFLOW_CROSSWALK; UXH-nn in 07 PROGRESSIVE_UX_AND_FEEDBACK; audit.* in 14 SECURITY_ARCHITECTURE and 07; TEST-ACT-nnn in 07 ACTION_REGISTRY (not yet in TEST_CATALOG, OPEN-P04).

| SPEC                                                    | ACT-ATOM                          | Base ACT without atom                                 | FLD                                   | EDG                    | XT   | UXH    | audit events                                                                                                                                           | TEST         | Contract gap                                                                                  |
| ------------------------------------------------------- | --------------------------------- | ----------------------------------------------------- | ------------------------------------- | ---------------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------- |
| SPEC-01 (FEAT-01-01..01-06, 01-13)                      | ACT-ATOM-01 (sign in with `next`) | ACT-AUTH-01, -02, -05, -09, -11, -14; ACT-ACC-04, -05 | FLD-AUTH-01, FLD-AUTH-02, FLD-AUTH-03 | EDG-01, EDG-03, EDG-11 | none | UXH-07 | `audit.auth.login_succeeded`, `audit.auth.login_failed`, `audit.auth.passkey_changed`, `audit.session.revoked`, `audit.session.refresh_reuse_detected` | TEST-ACT-001 | OPEN-F01: registration, confirm, passkey, refresh and revoke have no atomic contract          |
| SPEC-02 (FEAT-03-01, 03-02, 03-06, 03-08, 03-09, 22-01) | none                              | ACT-PRO-01, -03, -04; ACT-PRV-01, -02                 | FLD-PRO-01, FLD-PRO-02, FLD-PRO-03    | EDG-01, EDG-06         | none | UXH-07 | `audit.consent.granted` (no consent-withdrawn name exists, see OPEN-X06)                                                                               | none         | OPEN-F02: profile save, visibility and consent grant/withdraw have no atomic contract or TEST |

## Feature Specifications — Group 2: Evidence, Verification & Referees

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G2_EVIDENCE_AND_TRUST.md`._

Doc ID: SPEC-G2 · Owner: Product Director + Evidence/Verification leads · Version 1.0 · Status: Under Review · Relates: DOM-05, DOM-06, FEAT-05-01, FEAT-05-02, FEAT-05-04, FEAT-05-05, FEAT-05-07, FEAT-05-08, FEAT-05-12, FEAT-03-07, FEAT-06-01…06-04, FEAT-06-09, FEAT-06-10, SM-EVIDENCE, SM-VERIFICATION, SM-REFERENCE, DT-04, DT-06, BR-T003…T023, INV-T04, INV-T05, INV-T08, INV-T22…T25, ADR-T14

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**.

---

## SPEC-03 Evidence Creation, Evidence Ladder & Revocation Impact

**Metadata:** Doc ID SPEC-03 · Owner: Evidence PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-05-01, FEAT-05-02, FEAT-05-04, FEAT-05-05, FEAT-05-07, FEAT-05-08, FEAT-05-12 · Modules: MOD-CAND · `api/evidence`, `api/platform`, `apps/worker` · Relates: ADR-T14, INV-T04, INV-T08, INV-T22, INV-T23, INV-T25, INV-T28, BR-T003…T015, BR-T005, SM-EVIDENCE, DT-06

### 1. Business purpose

Evidence is the product's core asset (ADR-T01). This feature lets a candidate turn work, credentials and results into structured, graded items; assigns each an honest rung on the evidence ladder `claimed → artifact-backed → peer-attested → authority-verified` with provenance; and guarantees that when support for an item disappears the whole system tells the truth (skills, matches, recruiter views) without manual cleanup. Value: GOAL-01 (≥ 3 items at rung ≥ artifact-backed), GOAL-03 (explainable matches depend on rung).

### 2. Actors & access

| Actor                                                                 | May                                                                                  | Policy action                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| ROLE-CAND                                                             | create/edit/withdraw own evidence; request attestation; share (via consent)          | `evidence:write:own`                       |
| ROLE-INST, issuers (platform course, assessment engine, ROLE-INSTADM) | mint `authority_verified` items for learners in their scope; revoke what they issued | `evidence:issue`, `evidence:revoke:issued` |
| ROLE-REC / ROLE-HM / ROLE-ORGADM                                      | read per DT-01 (snapshot or live consent)                                            | `evidence:read:consented`                  |
| ROLE-MOD                                                              | open review, revoke after human decision                                             | `evidence:revoke:case`                     |
| ROLE-SUP / ROLE-ADM                                                   | read under grant only; **cannot** edit rung or content                               | `evidence:read:granted`                    |
| System                                                                | scan, liveness-check, recompute                                                      | worker                                     |
| Nobody can set `rung` directly, including admins (INV-T04).           |

### 3. Functional behavior

#### 3.1 Inputs and validation

| Field           | Rule                                                                                                                                                                                                                                                    | Error                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| type            | user-created ∈ {`project`, `work_sample`, `publication`, `certificate_external`, `contribution`, `other`}; system-created ∈ {`course_completion`, `assessment_result`, `reference_attestation`, `institution_credential`} (clients cannot create these) | `422` / `403`         |
| title           | 1–120                                                                                                                                                                                                                                                   | `422`                 |
| description     | ≤ 2,000 plain text                                                                                                                                                                                                                                      | `422`                 |
| skills          | 1–10 canonical skill IDs (BR-T006); deprecated skills rejected                                                                                                                                                                                          | `422 skills_required` |
| period          | `start` ≤ `end` ≤ today, or `ongoing`                                                                                                                                                                                                                   | `422`                 |
| artefacts       | 0–{20} files, each ≤ {25 MB}; allowlist {pdf, png, jpg, webp, txt, md, csv, docx, pptx, mp4}; archives (zip/tar) not accepted in Phase 1                                                                                                                | `413` / `415`         |
| links           | 0–10 `https` URLs                                                                                                                                                                                                                                       | `422`                 |
| aiAssisted      | boolean declaration; has no effect on rung (BR-T007)                                                                                                                                                                                                    | —                     |
| source          | server-set only; a client-supplied `source=ai` ⇒ `422 source_forbidden` (INV-T08)                                                                                                                                                                       | `422`                 |
| Idempotency-Key | required on create/submit (FF-07)                                                                                                                                                                                                                       | `400`                 |

#### 3.2 Rules and calculations

1. **Rung** is computed by DT-06 from valid provenance records; stored as a cache column with `computed_at`; **reads recompute from validity** so a revoked supporter cannot leave a stale verified display (INV-T25).
2. **Provenance record** = `{id, evidenceId, kind ∈ {artefact_scan, link_liveness, attestation, issuer_verification, employer_domain_proof, referee_confirmation}, issuerRef, createdAt, validUntil?, revokedAt?, dataHash}`.
3. **Artefact pipeline (FEAT-05-12):** upload → object store `quarantine/` bucket (private) → scan + content-type sniff + image re-encode stripping EXIF location → promote to `clean/` on pass → derive thumbnails. Evidence stays `pending_scan` until clean (BR-T003). Download via signed URL, `Content-Disposition: attachment` for non-images (BR-T116).
4. **Link liveness (05-01.2):** DNS resolve; reject loopback, link-local, private and cloud-metadata ranges; ≤ 3 redirects; 5 s timeout; response size cap; success only on HTTP 200 content; repeated every 30 d; failing 14 consecutive days ⇒ provenance record invalid ⇒ rung recompute (BR-T009).
5. **Duplicate signal:** identical artefact hash on two accounts ⇒ internal flag for human review; never auto-action (INV-T20).
6. **Authority issuance (05-04):** only registered issuer services call `POST /internal/evidence/issue` with a signed service identity (ROLE-SVC); issuers: platform course completion (SPEC-06), auto-graded assessment pass (SPEC-05), verified institution (SPEC-14), verified employer org. Issuance is idempotent on `(issuer, sourceRef)` (BR-T027, BR-T032).
7. **Revocation (05-05):** human issuer or moderator supplies reason ∈ {`issuer_withdrawn`, `fraud_confirmed`, `policy_violation`, `error_correction`, `legal`}; SM-EVIDENCE t8. Impact pipeline (same transaction writes state + audit + outbox `evidence.revoked`; worker does the rest): (a) recompute skill confidence for each tagged skill (FEAT-04-04) (b) recompute matches/explanations for the owner (FEAT-11-07) (c) update search index (d) notify holder ≤ 24 h with reason category and appeal path (e) for already-submitted application snapshots, recruiter views overlay `Revoked on <date>` — the snapshot itself is not edited (INV-T28).
8. **Withdrawal (owner):** SM-EVIDENCE t9; recipients lose live access; snapshots keep tombstones (BR-T013).
9. **Appeal:** within 30 d via moderation case (SM-MODCASE t6); if upheld, a **new** evidence item is created with `supersedes=<old id>` and provenance re-validated; the old item stays `revoked`.
10. **Sharing (05-07):** evidence is `private` unless covered by `evidence.share_summary` (all verified orgs: titles, skills, rung; needs `search.discoverable`) or `evidence.share_artefact` (specific org, optionally one item) or an application snapshot (`application.share_snapshot`; DT-01). Scope ids: Consent Scope Catalogue.

#### 3.3 Side effects and postconditions

Events: `evidence.created`, `evidence.verified` (rung rises), `evidence.revoked`, `evidence.rung_changed` (proposed event; not in the domain seed list). Audit on every state or rung change. Postconditions: rung = DT-06(valid provenance); revoked item excluded from skill confidence, matches, search, share links; counts in "evidence strength" exclude non-`active` items.

### 4. User interaction

| Screen                                                                                                                                                                                                                                                                                      | Behaviour                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SCR-EVIDENCE-NEW                                                                                                                                                                                                                                                                            | stepper: type → details → skills (typeahead from taxonomy only) → attach (drag-drop, camera capture on mobile, link) → review; autosave as `draft`; upload progress with resume on flaky networks (chunked/tus-style, **[OPEN]** protocol) |
| SCR-EVIDENCE-DETAIL                                                                                                                                                                                                                                                                         | rung chip + "What this means" popover; provenance timeline; actions: add attestation request, withdraw; `Claimed` items show a neutral "Not verified" label (never a green tick)                                                           |
| SCR-EVIDENCE-LIST (05-08)                                                                                                                                                                                                                                                                   | filter by rung, skill, type; "next best evidence" hints from gap analysis (never auto-created)                                                                                                                                             |
| SCR-REVOKED-NOTICE                                                                                                                                                                                                                                                                          | reason category, effect (skills/matches updated), appeal button, deadline                                                                                                                                                                  |
| Offline: read cache only; creation requires connectivity (consequential, ADR-T10), though the draft form may be saved locally and uploaded later with explicit user action. A11y: drag-drop has a button alternative; progress announced politely; chips use text + icon, not colour alone. |

### 5. Backend behavior

Flow for submit: validate → create `evidence` (`draft`→`pending_scan` or `active`) → enqueue scan/liveness job (SM-BGJOB) → on result worker calls domain `applyProvenance()` (DT-06) → writes rung + outbox. Revocation handler `evidence.revoked` consumers: skills (recompute), matching (recompute), search (reindex), notify, application (overlay cache bust). All consumers idempotent on `event_id` (INV-T37). Public interface for other modules: `evidence.getForViewer(principal, id)` which applies DT-01 and returns rung computed from validity.

| Endpoint (provisional)        | Method                                                        |
| ----------------------------- | ------------------------------------------------------------- |
| `/me/evidence`                | POST create draft / GET list                                  |
| `/me/evidence/{id}`           | GET / PATCH (draft or active text fields) / DELETE (withdraw) |
| `/me/evidence/{id}/submit`    | POST (Idempotency-Key)                                        |
| `/me/evidence/{id}/artefacts` | POST upload init (returns signed upload)                      |
| `/evidence/{id}/revoke`       | POST (moderator/issuer; reason)                               |
| `/me/evidence/{id}/appeal`    | POST                                                          |
| `/internal/evidence/issue`    | POST (ROLE-SVC only)                                          |

### 6. Data

| Entity                                                                                                                          | Key fields                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `evidence`                                                                                                                      | id, owner_id, type, title, description, skills[], period, state (SM-EVIDENCE), rung (cache), rung_computed_at, source, ai_assisted, supersedes_id, version |
| `evidence_artefact`                                                                                                             | id, evidence_id, object_key, sha256, size, mime, scan_state, scanned_at                                                                                    |
| `evidence_link`                                                                                                                 | id, evidence_id, url, last_checked_at, last_ok_at, failing_since                                                                                           |
| `provenance`                                                                                                                    | as §3.2                                                                                                                                                    |
| `evidence_revocation`                                                                                                           | evidence_id, reason, actor_id, case_id, at                                                                                                                 |
| Retention: artefacts and metadata until withdrawal/erasure; revocation records kept (minimised) for appeal and audit {OPEN-08}. |

### 7. States and transitions

SM-EVIDENCE t1–t11 and rung rules (this spec implements all). Forbidden: any → rung field write; revoked → active; client creation of system types.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Performance   | evidence create (metadata) p95 ≤ 250 ms; scan completion p95 ≤ 60 s for ≤ 25 MB; revocation→recompute p95 ≤ 15 min (BR-T076)           |
| Security      | virus scan; SSRF-hardened fetcher; signed URLs ≤ 5 min; no artefact served from the app origin; EXIF stripping                         |
| Privacy       | artefacts private by default; erasure deletes blobs (BR-T065)                                                                          |
| Reliability   | scan dead-letter alerts; recompute idempotent; no promotion without clean verdict                                                      |
| Accessibility | alt-text field for image artefacts; captions for video evidence recommended, required for recruiter-facing "showcase" video **[OPEN]** |
| Cost          | storage lifecycle: quarantined blobs deleted after 30 d; per-user storage cap {1 GB} free                                              |

### 9. Failure scenarios

| Scenario                                       | Expected behaviour                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Scan service unavailable                       | item stays `pending_scan`; retries per SM-BGJOB; dead-letter ⇒ ops alert; never auto-clean |
| Upload interrupted                             | resumable; abandoned uploads reaped after 24 h                                             |
| Link host slow/unreachable at submit           | item saved at `claimed` with "link not yet checked"; re-check scheduled                    |
| Revoke and withdraw race                       | one wins by version; other `409`; final state consistent and audited                       |
| Recompute job fails                            | retries; meanwhile reads already reflect lower rung (INV-T25)                              |
| Issuer service replays mint                    | idempotency returns same item                                                              |
| Appeal after 30 d                              | `422 appeal_window_closed`; support may open a manual case                                 |
| Malware found after promotion (new signatures) | rescan sweep quarantines retroactively; recipients lose access; owner notified (neutral)   |

### 10. Acceptance criteria

| AC          | Given                                                      | When                                           | Then                                                                                     | Type              |
| ----------- | ---------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------- |
| AC-05-01-01 | claim-only payload with 1 skill                            | submit                                         | state `active`, rung `claimed`, `evidence.created`                                       | Happy             |
| AC-05-01-02 | 0, 1, 10, 11 skills                                        | submit                                         | 0 and 11 ⇒ `422`; 1 and 10 accepted                                                      | Boundary          |
| AC-05-01-03 | payload with `source=ai` or `rung=authority_verified`      | POST                                           | `422`; nothing stored                                                                    | Negative/Security |
| AC-05-01-04 | file of 25 MB and 25 MB + 1 byte; `.exe`                   | upload                                         | accepted / `413` / `415`                                                                 | Boundary          |
| AC-05-01-05 | same Idempotency-Key submitted twice                       | submit                                         | exactly one item                                                                         | Idempotency       |
| AC-05-01-06 | link to `http://169.254.169.254/` or private IP            | submit                                         | rejected `422`; no outbound request made                                                 | Security/SSRF     |
| AC-05-01-07 | link returns 404                                           | liveness                                       | item stays `claimed`; owner warned; re-check scheduled                                   | Negative          |
| AC-05-01-08 | draft untouched 83 and 90 days                             | sweeper                                        | notice at day 83; deleted at day 90                                                      | Time              |
| AC-05-12-01 | item `pending_scan`                                        | any other user requests artefact or lists item | `404`; not in search or shares                                                           | Security          |
| AC-05-12-02 | scan verdict positive                                      | worker completes                               | `quarantined`; owner notified; never visible to others                                   | Negative          |
| AC-05-12-03 | scanner down 2 h                                           | worker retries                                 | item remains `pending_scan`; no promotion; alert after dead-letter                       | Recovery          |
| AC-05-12-04 | JPEG with GPS EXIF                                         | view served file                               | served derivative has no GPS tags                                                        | Privacy           |
| AC-05-02-01 | clean artefact                                             | scan passes                                    | rung `artifact_backed`; provenance `artefact_scan` exists                                | Happy             |
| AC-05-02-02 | any client                                                 | PATCH `rung`                                   | `422`/`405`; unchanged                                                                   | Security          |
| AC-05-02-03 | valid attestation added, then revoked                      | recompute                                      | rung `peer_attested` then back to `artifact_backed`; both transitions audited            | Happy             |
| AC-05-02-04 | `claimed` item displayed to anyone                         | render                                         | label "Not verified"; no verified styling anywhere (UI test)                             | Honesty           |
| AC-05-04-01 | course-completion issuer mints twice with same `sourceRef` | issue                                          | one item at `authority_verified`                                                         | Idempotency       |
| AC-05-04-02 | candidate token calls issue endpoint                       | POST                                           | `403`                                                                                    | Security          |
| AC-05-05-01 | moderator revokes with reason `fraud_confirmed`            | confirm                                        | state `revoked`; `evidence.revoked`; holder notified ≤ 24 h with appeal link             | Happy             |
| AC-05-05-02 | revoke without reason or by non-human actor                | POST                                           | `422` / `403`                                                                            | Negative          |
| AC-05-05-03 | revoked evidence supported a skill and a match             | recompute                                      | skill confidence lower and match explanation refreshed ≤ 15 min p95; audit entries exist | Happy             |
| AC-05-05-04 | evidence inside an already-submitted application           | recruiter opens application                    | item shows "Revoked on <date>" overlay; stored snapshot bytes unchanged                  | Consistency       |
| AC-05-05-05 | revoked item                                               | reactivate attempt                             | `409 invalid_transition`                                                                 | Negative          |
| AC-05-05-06 | owner withdraw and moderator revoke simultaneously         | both submit                                    | one succeeds, other `409`; final state valid                                             | Concurrency       |
| AC-05-05-07 | recompute worker down                                      | read evidence after revoke                     | displayed rung already reflects revocation                                               | Recovery          |
| AC-05-05-08 | appeal upheld                                              | reviewer decides                               | new item with `supersedes`; old stays `revoked`                                          | Happy             |
| AC-05-07-01 | per-employer artefact grant to Org A                       | Org A opens; Org B opens                       | allowed / denied                                                                         | Negative/IDOR     |
| AC-05-07-02 | grant revoked                                              | Org A next fetch                               | denied ≤ 60 s                                                                            | Timing            |
| AC-05-08-01 | filter rung = peer_attested                                | list                                           | only matching items                                                                      | Happy             |

### 11. Testing

State-machine matrix (SM-EVIDENCE). Property test: for random provenance sets, `computeRung` equals DT-06 and never exceeds the highest valid record. Integration: EICAR-style fixture, SSRF fixtures, revoke→recompute chain with outbox. Security: IDOR on evidence and artefact URLs; signed URL expiry. E2E: create→scan→share→revoke→recruiter overlay. Visual honesty test: snapshot test failing if any green-check component renders for rung `claimed`.

### 12. Developer guidance

Build order: evidence core + SM → artefact pipeline → rung computation → issuer API → revocation pipeline → sharing. Keep `computeRung` pure and in `packages/domain`; the DB column is a cache. Pitfalls: treating `verified` as a boolean in the UI; fetching links from the API process without the hardened fetcher; letting search return stale rung. Decisions pending: upload protocol; storage caps; whether video evidence ships in Phase 1; **OPEN-08** retention of revocation records.

### 13. Related

`ADR_REGISTER.md` ADR-T14 · `STATE_MACHINES.md` SM-EVIDENCE · `DECISION_TABLES.md` DT-06, DT-01 · `BUSINESS_RULES_REGISTRY.md` BR-T003…T015 · SPEC-04 (referee/work history), SPEC-05, SPEC-06, SPEC-09.

---

## SPEC-04 Work-History Verification & Tokenised Referee Flow

**Metadata:** Doc ID SPEC-04 · Owner: Verification PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-03-07, FEAT-06-01, FEAT-06-02, FEAT-06-03, FEAT-06-04, FEAT-06-09, FEAT-06-10 · Modules: MOD-CAND, MOD-HIR (display) · `api/verification`, `api/profile`, `apps/worker` · Relates: INV-T05, INV-T20, INV-T24, BR-T004, BR-T016…T023, SM-VERIFICATION, SM-REFERENCE, DT-04, DT-06, ADR-T14

### 1. Business purpose

Employment history is the most-claimed, least-checked part of hiring. This feature gives a candidate two cheap ways to raise a work claim above `claimed`: (1) proof of control of an employer-domain mailbox, (2) one or more **referees** who confirm in under three minutes without an account. Value: GOAL-01/02, differentiator vs. résumé-only platforms. Risk it must control: collusion, referee harassment, phishing look-alikes.

### 2. Actors & access

| Actor                             | May                                                                    | Policy action                                     |
| --------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| ROLE-CAND                         | create work claims; start verification; invite/cancel referee requests | `claim:write:own`, `verification:request:own`     |
| ROLE-REFEREE (token, non-account) | open one request, answer once                                          | `referee:respond:token` (single-use, INV-T05/T24) |
| ROLE-REC / ROLE-HM                | read status/provenance per DT-01                                       | `verification:read:consented`                     |
| ROLE-MOD                          | resolve disputes and abuse flags                                       | `verification:review`                             |
| System                            | send emails, reminders, expire                                         | worker                                            |

### 3. Functional behavior

#### 3.1 Work claim (FEAT-03-07)

| Field                                                                                                                                                                           | Rule                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| employerName                                                                                                                                                                    | 1–120                                                                                |
| employerDomain                                                                                                                                                                  | optional; registrable domain, lower-case, not a free-mail provider (list maintained) |
| title                                                                                                                                                                           | 1–120                                                                                |
| employmentType                                                                                                                                                                  | `full_time`, `part_time`, `contract`, `internship`, `self_employed`, `volunteer`     |
| start / end                                                                                                                                                                     | `start` ≥ 1950-01-01 and ≤ today; `end` ≥ `start` or `current=true`                  |
| description                                                                                                                                                                     | ≤ 1,500                                                                              |
| skills                                                                                                                                                                          | ≤ 10 canonical                                                                       |
| Overlapping claims allowed. Editing dates/employer of a **verified** claim creates a new claim version and resets its verification (old provenance stays bound to old version). |

#### 3.2 Employer-email proof (FEAT-06-01) — SM-VERIFICATION

Candidate enters an address `name@<employerDomain>`; the system checks the domain equals the claim's `employerDomain`, is not free-mail, and not blocked; sends a 6-digit code (hashed, TTL 15 min, ≤ 5 attempts, ≤ 3 resends/h, ≤ 3 requests/24 h per claim; BR-T016/T017). On success a provenance record `employer_domain_proof` (valid until claim version changes) is attached; rung ≥ `artifact_backed` (DT-06 row 3). It proves control of a mailbox at that domain **now**, not employment at the stated dates — the UI says exactly that.

#### 3.3 Referee request (FEAT-06-02)

Inputs: `refereeName` 1–80; `refereeEmail` valid, ≠ any candidate email (BR-T018); `relationship` ∈ {`manager`, `peer`, `report`, `hr`, `client`, `other`}; `message` ≤ 300; candidate attests "this person may be contacted" and sees the exact text the referee will get. Limits: ≤ 3 open requests per claim, ≤ {10} referee emails/24 h (BR-T019).
Token: 32 random bytes, URL-safe, SHA-256 stored; link `/r/{token}`; TTL 14 d; **GET is side-effect free** (email security scanners prefetch links) and only POST consumes; `opened` is advisory.
Referee form (mobile-first, no login): shows candidate name, employer, title, dates, and "Report this request" link. Questions: Q1 _Did they work there during these dates?_ (`yes` / `partly` / `no` / `dont_know_them`); Q2 if `partly` or `no`: which detail differs (dates / title / employer) + ≤ 200 chars; Q3 relationship confirmation; Q4 optional comment ≤ 500; Q5 "You may be named to recruiters" (unticked default; BR-T023). Submit ⇒ outcome mapping: `yes` ⇒ `confirm`; `no` ⇒ `dispute`; `partly` ⇒ `dispute` with `reason=dates_differ|title_differs`; `dont_know_them` ⇒ `unknown_candidate`; "Decline" button ⇒ `decline`.
Handling per DT-04, with refinement: `dispute` with `reason=dates_differ` and ≤ 3 months difference is shown to the candidate as "your referee suggests different dates" (candidate may correct the claim; nothing is shown to recruiters, no human case) — all other disputes follow DT-04 row 4.

#### 3.4 Abuse detection (FEAT-06-09)

Signals, all **flag-only** (INV-T09/T20): referee submit from the same IP-hash/device-hash cluster as the candidate's recent sessions; referee email domain free-mail while claim has an employer domain (warning, not a block); same referee used by ≥ 5 unrelated candidates in 24 h; response in < 20 s from open; referee registered with the candidate within 24 h. A flag moves the response to "recorded, not counted" (DT-04 row 2) pending human review; the candidate sees only "under review".

#### 3.5 Reminders & expiry (FEAT-06-10)

Worker sends reminder on day 4 and day 9 if still unanswered (max 2, BR-T022); marks `expired` at day 14 (SM-REFERENCE t4); bounces handled via provider webhooks; all jobs idempotent via `(request_id, reminder_no)`.

#### 3.6 Display (FEAT-06-04)

Badges: `Not verified` (claimed), `Mailbox verified` (artifact-backed via domain proof), `Confirmed by referee` (peer-attested), `Employer confirmed` (authority; Phase 3 via verified org). A "What this means" popover states exactly what was checked. Referee identity appears only if named consent (BR-T023).

#### 3.7 Side effects and postconditions

Events: `verification.requested`, `verification.completed`, `reference.requested`, `reference.reminded`, `reference.submitted` (proposed), each with outbox. After any outcome the owning evidence/claim rung is recomputed (DT-06). Postcondition: token unusable after submit/expiry/cancel (INV-T24).

### 4. User interaction

Candidate: SCR-CLAIMS (list with status chips), SCR-VERIFY-EMAIL-PROOF (code entry), SCR-REFEREE-INVITE (form + preview of email text + consent attestation), SCR-REFEREE-STATUS (per request: sent/opened/expired, reminder count, cancel). Referee: SCR-REFEREE-LANDING (single column, large controls, language auto-detected, ≤ 5 fields, progress-less), SCR-REFEREE-THANKS (no marketing; link to privacy notice; optional "how we use this"). Accessibility: referee page WCAG 2.2 AA, works with 200 % zoom, no timer. Phishing resistance: email contains candidate name and employer; page shows the same; the domain is the product's own; no attachments. Offline: none (online-only).

### 5. Backend behavior

Modules: `api/verification` owns requests/responses/tokens; `api/profile` owns claims; `api/evidence` consumes `verification.completed` to attach provenance. Referee page is served by the shell on a public route; its API (`/referee/{token}`) is separately rate-limited (per IP 20/h, per token 10/h) and returns identical `404` for unknown/expired/used tokens. Referee email stored encrypted (for sending) plus salted hash (anti-abuse counters); content removed after retention {12 months, OPEN-08}. Candidate-visible details of the response are limited to outcome + reason category (not free-text comment unless referee ticks "share my comment with the candidate").

| Endpoint (provisional)          | Method                                         |
| ------------------------------- | ---------------------------------------------- |
| `/me/claims`, `/me/claims/{id}` | CRUD                                           |
| `/me/claims/{id}/verify/email`  | POST start; `/verify/email/confirm` POST code  |
| `/me/claims/{id}/referees`      | POST create request / GET list                 |
| `/me/referees/{reqId}`          | DELETE cancel                                  |
| `/referee/{token}`              | GET read request (no side effect); POST submit |
| `/referee/{token}/report`       | POST report suspicious request                 |

### 6. Data

| Entity                                          | Key fields                                                                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `work_claim`                                    | id, account_id, version, employer_name, employer_domain, title, type, start, end, current, description, skills[]                                                      |
| `verification_request`                          | id, claim_id, claim_version, method (`employer_email`), address_hash, code_hash, state (SM-VERIFICATION), attempts, expires_at                                        |
| `reference_request`                             | id, claim_id, claim_version, referee_email_enc, referee_email_hash, relationship, token_hash, state (SM-REFERENCE), sent_at, expires_at, reminders_sent, submitted_at |
| `reference_response`                            | request_id, answers (JSON), outcome, reason, named_consent, share_comment_consent, submit_ip_hash, submit_device_hash, opened_to_submit_ms                            |
| `abuse_flag`                                    | id, subject_ref, signal, created_at, case_id                                                                                                                          |
| Invariants: INV-T05, INV-T22, INV-T24, INV-T43. |

### 7. States and transitions

SM-VERIFICATION t1–t7; SM-REFERENCE t1–t6 (+ reminders). Forbidden: `submitted → any`; `verified → awaiting_proof`; submission after cancel.

### 8. Non-functional requirements

| Area           | Requirement                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Usability      | referee median completion ≤ 3 min; ≥ 95 % complete on mobile browsers in usability test **[OPEN-07]**                                         |
| Performance    | referee page p95 TTFB ≤ 300 ms; submit ≤ 400 ms                                                                                               |
| Security       | hashed tokens/codes; constant-time compare; per-IP/token rate limits; no PII in URLs; `Referrer-Policy: no-referrer`; `X-Robots-Tag: noindex` |
| Privacy        | referee told what is stored and for how long; named-consent opt-in; erasure rights extend to referee data on request (support path)           |
| Deliverability | SPF/DKIM/DMARC aligned sending; plain-text alternative; no link shorteners                                                                    |
| Reliability    | reminder job exactly-once per `(request, n)`                                                                                                  |

### 9. Failure scenarios

| Scenario                                                  | Expected behaviour                                                                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Referee email bounces                                     | `bounced`; candidate told to fix; no reminders                                                                                     |
| Mail scanner opens the link                               | `opened` may be set early; token not consumed; reminders continue per schedule                                                     |
| Referee double-submits / two devices                      | first POST wins (row lock); second sees "already answered"                                                                         |
| Referee and candidate are the same person (alias address) | same-session/device-hash heuristics flag for review; rule BR-T018 blocks identical addresses only                                  |
| Claim edited after request sent                           | requests bound to old `claim_version`; referee sees old text; result applies to old version only; candidate prompted to re-request |
| Candidate cancels after referee opened                    | token dead; referee sees neutral "request withdrawn"                                                                               |
| Domain proof code email delayed                           | resend limits apply; code TTL not extended; user may restart after cooldown                                                        |
| Referee submits dispute                                   | DT-04 row 4 path; candidate sees notice and may respond ≤ 7 d                                                                      |
| Provider webhook lost                                     | daily reconcile of `sent` requests older than 48 h without delivery receipt triggers a single retry                                |

### 10. Acceptance criteria

| AC          | Given                                                        | When                                    | Then                                                                                            | Type             |
| ----------- | ------------------------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| AC-03-07-01 | start 2024-05-01, end 2024-04-01                             | save claim                              | `422`                                                                                           | Negative         |
| AC-03-07-02 | start in the future / before 1950                            | save                                    | `422`; today and 1950-01-01 accepted                                                            | Boundary         |
| AC-03-07-03 | verified claim, change employer                              | save                                    | new claim version; verification reset; old provenance bound to old version                      | Consistency      |
| AC-06-01-01 | claim domain `acme.com`, address `a@acme.com`                | request code                            | code emailed; stored hashed; never in API response or logs                                      | Happy/Security   |
| AC-06-01-02 | address `a@gmail.com` or other domain                        | request                                 | `422 domain_mismatch`                                                                           | Negative         |
| AC-06-01-03 | code age 15:00 vs 15:01                                      | confirm                                 | accepted / `422`                                                                                | Boundary         |
| AC-06-01-04 | 5 wrong codes, then right code                               | confirm                                 | locked ⇒ `429`; state `failed`                                                                  | Boundary         |
| AC-06-01-05 | verified                                                     | read claim                              | rung `artifact_backed`; label "Mailbox verified"; popover states limits                         | Happy            |
| AC-06-01-06 | 4th request within 24 h for one claim                        | request                                 | `429`                                                                                           | Boundary         |
| AC-06-02-01 | valid request                                                | referee opens link on phone, no account | form renders ≤ 5 fields; submit works                                                           | Happy            |
| AC-06-02-02 | scanner issues GET                                           | then referee POSTs                      | token still valid; GET caused no state other than `opened`                                      | Edge             |
| AC-06-02-03 | two simultaneous POSTs                                       | submit                                  | exactly one response stored; other "already answered"                                           | Concurrency      |
| AC-06-02-04 | referee email equals candidate email                         | create                                  | `422`                                                                                           | Negative         |
| AC-06-02-05 | 4th open request on one claim                                | create                                  | `422`                                                                                           | Boundary         |
| AC-06-02-06 | no response                                                  | day 4 and day 9                         | exactly 2 reminders (rerun job ⇒ still 2); day 14 `expired`; link ⇒ neutral 404                 | Time/Idempotency |
| AC-06-02-07 | candidate cancels                                            | referee opens link                      | neutral "withdrawn" page; no form                                                               | Negative         |
| AC-06-02-08 | referee does not tick "may be named"                         | recruiter views attestation             | "Confirmed by a former colleague"; no name                                                      | Privacy          |
| AC-06-03-01 | outcome `confirm`, no flags                                  | submit                                  | rung ≥ `peer_attested`; candidate notified                                                      | Happy            |
| AC-06-03-02 | outcome `dispute` (title differs)                            | submit                                  | no downgrade, no recruiter flag until human review; candidate notice with 7-day response window | Negative         |
| AC-06-03-03 | outcome `dispute` reason `dates_differ`, difference 2 months | submit                                  | candidate sees suggestion; recruiters see nothing; no case                                      | Edge             |
| AC-06-03-04 | outcome `unknown_candidate` or `decline`                     | submit                                  | no rung change; candidate told neutrally                                                        | Negative         |
| AC-06-04-01 | claim at `claimed`                                           | any viewer                              | label "Not verified"; no verified styling                                                       | Honesty          |
| AC-06-09-01 | referee submit shares device-hash with candidate             | submit                                  | response recorded not counted; case opened; candidate sees "under review"; no auto-penalty      | Abuse            |
| AC-06-09-02 | same referee answers 5 unrelated candidates in 24 h          | 5th submit                              | flagged for review (not blocked)                                                                | Abuse            |
| AC-06-10-01 | job run twice for the same day                               | reminder job                            | one email per `(request, n)`                                                                    | Idempotency      |
| AC-06-10-02 | token past 14 d                                              | referee POST                            | neutral `404`; no state change                                                                  | Time             |

### 11. Testing

Token suite (entropy length, hash-only storage, single use, expiry, constant-time compare, log scan). SM tests for SM-VERIFICATION and SM-REFERENCE incl. forbidden pairs. Concurrency tests on token consume. Email-scanner simulation (HEAD/GET prefetch). Abuse-signal unit tests with fixtures. E2E on a mobile viewport with Playwright, plus a usability script for the 3-minute target. Deliverability checks in staging (SPF/DKIM). Fairness check: no signal uses protected attributes.

### 12. Developer guidance

Build order: claims → email proof → referee request/response → DT-04 mapping → reminders/expiry → abuse flags → badges. Pitfalls: do not mark a click as consent; do not email the candidate the raw token; do not let the referee API distinguish unknown vs used tokens; avoid exposing referee free-text to candidates by default (retaliation risk). Decisions pending: **OPEN-07** usability evidence; **OPEN-08** retention of referee data; whether `partly` should have its own SM outcome in a later version (currently handled as `dispute` + reason).

### 13. Related

`DECISION_TABLES.md` DT-04, DT-06 · `STATE_MACHINES.md` SM-VERIFICATION, SM-REFERENCE · `BUSINESS_RULES_REGISTRY.md` BR-T016…T023 · SPEC-03 · SPEC-13 (referee data in erasure).

### Contract links (patch 2026-10-27)

Evidence label: PROPOSED mapping. Every id below was grepped in its owner file on 2026-10-27; ids marked "none" do not exist and are OPEN. Owners: ACT-ATOM-nn in 07 ACTION_REGISTRY; FLD-* in 07 SCREEN_SPECIFICATIONS_KEY; EDG-nn in 06 BUSINESS_PROCESS_INVENTORY; XT-nn in 06 SSOT_WORKFLOW_CROSSWALK; UXH-nn in 07 PROGRESSIVE_UX_AND_FEEDBACK; audit.* in 14 SECURITY_ARCHITECTURE and 07; TEST-ACT-nnn in 07 ACTION_REGISTRY (not yet in TEST_CATALOG, OPEN-P04).

| SPEC                                                           | ACT-ATOM                                 | Base ACT without atom                 | FLD                                | EDG                    | XT                          | UXH    | audit events                                              | TEST         | Contract gap                                                                       |
| -------------------------------------------------------------- | ---------------------------------------- | ------------------------------------- | ---------------------------------- | ---------------------- | --------------------------- | ------ | --------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| SPEC-03 (FEAT-05-01, 05-02, 05-04, 05-05, 05-07, 05-08, 05-12) | ACT-ATOM-04 (save evidence, dirty close) | ACT-EVD-02, -03, -04, -06, -07, -08   | FLD-EVD-01..FLD-EVD-05             | EDG-01, EDG-02, EDG-06 | none                        | UXH-07 | `audit.evidence.created`, `audit.evidence.status_changed` | TEST-ACT-004 | OPEN-F03: revocation impact, dispute and archive have no atomic contract           |
| SPEC-04 (FEAT-03-07, 06-01..06-04, 06-09, 06-10)               | none                                     | ACT-VER-01..-04, -07; ACT-REF-01..-03 | FLD-REF-01, FLD-REF-02, FLD-REF-03 | EDG-03, EDG-05, EDG-10 | XT-06 (attestation display) | UXH-08 | `audit.verification.decided`                              | none         | OPEN-F04: send request, referee submit and decline have no atomic contract or TEST |

## Feature Specifications — Group 3: Assessment & Learning

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G3_ASSESSMENT_AND_LEARNING.md`._

Doc ID: SPEC-G3 · Owner: Product Director + Learning/Assessment leads · Version 1.0 · Status: Under Review · Relates: DOM-07, DOM-08, DOM-17, FEAT-07-02…07-08, FEAT-08-01…08-04, FEAT-08-08, FEAT-17-03, SM-ATTEMPT, SM-ENROLMENT, DT-10, BR-T024…T034, INV-T06, INV-T17, INV-T20, INV-T26, INV-T27, ADR-T12, ADR-T13

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**.

---

## SPEC-05 Assessment Attempt (Sandbox Runner, AI_PROHIBITED, Unverified Fallback)

**Metadata:** Doc ID SPEC-05 · Owner: Assessment PM · Version 1.0 · Status Under Review · Phase 1 (auto-graded, fallback, AI policy) / Phase 2 (runner) · Priority P0 · Features: FEAT-07-02, FEAT-07-03, FEAT-07-04, FEAT-07-05, FEAT-07-06, FEAT-07-07, FEAT-07-08, FEAT-17-03 · Modules: MOD-LRN, MOD-ADM · `api/assessment`, `api/ai`, `api/safety`, `apps/worker` · Relates: ADR-T12, ADR-T13, INV-T06, INV-T20, INV-T26, INV-T27, BR-T024…T030, SM-ATTEMPT, DT-10

### 1. Business purpose

"Prove" in the loop needs assessments whose results employers can trust. This feature delivers fair, time-bounded attempts; honest grading (never a simulated pass, ADR-T13); an enforced no-AI policy during evidence-minting assessments (INV-T06); and an integrity process that treats anomalies as questions for a human, not verdicts (INV-T20). Value: GOAL-01, GOAL-04; protects the authority rung from inflation.

### 2. Actors & access

| Actor                   | May                                                                                           | Policy action                                 |
| ----------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| ROLE-CAND               | start/answer/submit own attempts; view own result; appeal                                     | `attempt:write:own`                           |
| ROLE-INST               | author assessments in own courses; view attempts in own courses; grade manual items; sign off | `assessment:author`, `attempt:read:course`    |
| ROLE-INSTADM / ROLE-FAC | read attempts for own cohort (aggregate by default)                                           | `attempt:read:cohort`                         |
| ROLE-MOD                | review integrity cases, void or clear                                                         | `integrity:review`                            |
| ROLE-SUP                | read under grant; grant accommodations after verification                                     | `attempt:read:granted`, `accommodation:grant` |
| System                  | grade, run sandbox, auto-submit, mint evidence                                                | worker                                        |
| ROLE-REC/HM             | no access to attempts; see only resulting evidence per DT-01                                  | —                                             |

### 3. Functional behavior

#### 3.1 Assessment definition (inputs for authors; consumed here)

`mode` ∈ {`auto_graded`, `code`, `manual`}; `durationMinutes` 5–240; `passThreshold` 1–100 (%); `skills` 1–5 canonical; `aiPolicy` ∈ {`AI_PROHIBITED`, `AI_ALLOWED`} — **any assessment that can mint evidence must be `AI_PROHIBITED`**; `attemptPolicy` {cooldown, maxPerWindow} (BR-T028); `accommodationsAllowed` boolean. A published assessment version is immutable; edits create a new version; running attempts stay on their version.

#### 3.2 Attempt lifecycle (SM-ATTEMPT)

1. **Start** (`created → in_progress`): checks account active, entitlement if gated, cooldown/cap (BR-T028), no other `in_progress` attempt for the same assessment. The server fixes `started_at`, `deadline_at = started_at + duration × accommodationMultiplier` (1.0 default), question order seed, and `aiPolicy` copy. Returns the question set (no answers/grading data). The start screen **discloses** the AI policy, the retake rules and every integrity signal collected.
2. **Answer autosave:** `PUT /attempts/{id}/answers` with `{questionId, value, clientSeq}`; server keeps highest `clientSeq` per question (idempotent, order-tolerant); rejected after deadline (`409 attempt_closed`).
3. **Heartbeat** every 30 s: refreshes `last_seen_at` and carries signal counters; absent for > 5 min ⇒ attempt continues (timer still runs) but flagged `connection_gaps`.
4. **Submit** or **deadline**: scheduler job auto-submits the last autosaved answers (`auto_submitted=true`); lazy deadline check on any request guarantees correctness if the job lags.
5. **Grading:** `auto_graded` ⇒ deterministic scorer; `code` ⇒ runner (§3.3) else fallback (§3.4); `manual` ⇒ instructor queue.
6. **Pass:** `score ≥ passThreshold` (inclusive); evidence minted (§3.5). **Fail:** result summary; retake after cooldown.

#### 3.3 Code sandbox runner (FEAT-07-03)

Contract (implementation technology is an architecture decision, not fixed here):

| Aspect                                                                                                   | Requirement                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input                                                                                                    | `{attemptId, submissionSnapshotHash, language, files, testSuiteId, limits}`; snapshot immutable once submitted                                                   |
| Isolation                                                                                                | ephemeral sandbox per run; **no network**; read-only base filesystem; writable scratch only; no host mounts; no secrets in environment; processes/threads capped |
| Limits                                                                                                   | CPU {2 s}/test, wall {10 s}/test, {30 s} total, memory {256 MB}, stdout/stderr {64 KB}, file size {1 MB}                                                         |
| Tests                                                                                                    | public tests (shown) + hidden tests (never shown) from `testSuiteId`; deterministic seeds                                                                        |
| Output                                                                                                   | `{attemptId, snapshotHash, runnerVersion, testResults[], signature}`; grading service verifies signature **and** `snapshotHash` before using the result          |
| Failure                                                                                                  | crash/timeout of the runner (not the code) ⇒ retry ≤ 3 (SM-BGJOB) then fallback §3.4                                                                             |
| User code that loops or exhausts memory fails that test; it does not fail the attempt as "runner error". |

#### 3.4 Unverified fallback (FEAT-07-04, ADR-T13)

If a `code` attempt is submitted while no runner is available (not yet shipped, or outage past retry budget): state `unverified` (SM-ATTEMPT t5). **No evidence is minted.** The candidate sees: "Submitted. This challenge can't be automatically verified yet, so it won't count as verified evidence." They may attach their solution as ordinary user evidence (which will be `claimed`/`artifact_backed` by normal rules). When a runner exists, the system re-grades eligible attempts (≤ 30 d old; snapshot intact) via t6; older ones require a retake. No score, pass/fail wording or badge is shown for `unverified`.

#### 3.5 Scoring and evidence minting (FEAT-07-06)

`score = Σ(question points earned) / Σ(points available) × 100`, rounded half-up to 0.01; multi-select partial credit = (correct selected − incorrect selected)/total correct, floored at 0; unanswered = 0. Pass mints evidence once per attempt: type `assessment_result`, rung `authority_verified`, skills from the assessment, `issuerRef=assessment:<id>@<version>`, idempotent on `attemptId` (BR-T027, INV-T27). If an integrity hold exists (DT-10 row 3), minting waits for the human decision; a `voided` attempt mints nothing and revokes any minted item (SM-ATTEMPT t9).

#### 3.6 AI_PROHIBITED enforcement (FEAT-07-05, FEAT-17-03)

On `in_progress` start with `aiPolicy=AI_PROHIBITED` the assessment module writes a `principal_restriction {principal, kind: ai_prohibited, attemptId, until: deadline_at + 5 min}`. The AI gateway checks restrictions on **every** call for that principal regardless of route, client or feature and returns `403 ai_prohibited` (INV-T06, BR-T025). The UI hides AI assist inside the assessment and shows a persistent banner. A blocked attempt to call AI is logged as a signal and may open a review (never auto-fail, BR-T029).

#### 3.7 Integrity signals and review (FEAT-07-07)

Signals (disclosed, minimal): window-blur count and total blur seconds; paste events count (no clipboard contents); answer-time anomalies (e.g. all answers < 3 s each); second-device attempt to join the same attempt (blocked, logged); code-similarity score against other submissions (flag only); gateway AI-block events. No keystroke logging, screen capture or webcam. A flag opens a case (SM-MODCASE) and the candidate can see which signals were considered; reviewers see context, can clear or void; voiding needs reason; appeal goes to another reviewer (BR-T047). Aggregated false-positive rate is tracked.

#### 3.8 Retake and accommodations (FEAT-07-08, 07-02.4)

Cooldown {24 h} after fail; ≤ {3} attempts per 7 days (BR-T028). Accommodation multipliers {1.25, 1.5, 2.0} granted by support/instructor after verification of need; the multiplier is stored on the attempt and never shown to recruiters (BR-T030).

#### 3.9 Side effects & postconditions

Events: `attempt.started`, `attempt.submitted`, `assessment.passed` (seed domain event), `assessment.failed`, `attempt.unverified`, `integrity.flagged`. Postconditions: INV-T26 (no `authority_verified` evidence from `unverified`/`voided`/`under_review` attempts), INV-T27 (≤ 1 mint per attempt).

### 4. User interaction

| Screen                                                                                                                                                                                                                                                                                                                                                                                            | Behaviour                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCR-ASSESS-DETAIL                                                                                                                                                                                                                                                                                                                                                                                 | mode badge, duration, threshold, AI policy label, retake rules, accommodation link                                                                                                                                                            |
| SCR-ASSESS-START                                                                                                                                                                                                                                                                                                                                                                                  | disclosure checklist (must read; checkbox)                                                                                                                                                                                                    |
| SCR-ASSESS-RUN                                                                                                                                                                                                                                                                                                                                                                                    | question navigator, visible server-synced timer (announces 10, 5, 1 min via polite live region; no auto-focus theft), "Saved" indicator, banner "AI assistance is disabled for this assessment", submit confirmation listing unanswered count |
| SCR-ASSESS-RESULT                                                                                                                                                                                                                                                                                                                                                                                 | pass/fail with score band, per-skill summary, next steps; `unverified` explanation; flagged ⇒ "Your result is being reviewed" with signals considered and appeal                                                                              |
| Resume after reload/disconnect lands on the same question with the server timer. Offline: answers are cached locally and replayed idempotently when back online _before_ the deadline; submission after deadline is not accepted (INV-T13). Accessibility: full keyboard operation, timer is not the only cue, screen-reader order, no time pressure beyond accommodation, high-contrast support. |

### 5. Backend behavior

Modules: `api/assessment` (definitions, attempts, scoring), `apps/worker` (auto-submit, grading, runner dispatch, re-grade), `api/ai` (restriction checks), `api/evidence` (issuer API), `api/safety` (cases). Grading queue jobs carry `(attemptId, snapshotHash)`; result writes are fenced by job generation (SM-BGJOB) and idempotent on attempt id. Question bank API never serves answer keys to clients; answer keys stored separately and only loaded by the grader.

| Endpoint (provisional)              | Method                         |
| ----------------------------------- | ------------------------------ |
| `/assessments`, `/assessments/{id}` | GET catalogue/detail           |
| `/assessments/{id}/attempts`        | POST start                     |
| `/attempts/{id}`                    | GET state/timer                |
| `/attempts/{id}/answers`            | PUT autosave                   |
| `/attempts/{id}/heartbeat`          | POST                           |
| `/attempts/{id}/submit`             | POST (Idempotency-Key)         |
| `/attempts/{id}/appeal`             | POST                           |
| `/internal/runner/result`           | POST (runner service identity) |

### 6. Data

| Entity                             | Key fields                                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `assessment`, `assessment_version` | id, version, mode, duration, threshold, ai_policy, skills[], published_at, immutable                                                                   |
| `question`                         | id, version_id, type, points, body, options, answer_key_ref                                                                                            |
| `attempt`                          | id, account_id, assessment_version_id, state, started_at, deadline_at, multiplier, auto_submitted, score, result, unverified_reason, evidence_id, seed |
| `attempt_answer`                   | attempt_id, question_id, value, client_seq, saved_at                                                                                                   |
| `attempt_signal`                   | attempt_id, kind, count, detail_min, at                                                                                                                |
| `submission_snapshot`              | attempt_id, hash, files_ref, created_at                                                                                                                |
| `runner_job`                       | id, attempt_id, snapshot_hash, generation, state, runner_version, result_signature                                                                     |
| `principal_restriction`            | principal, kind, attempt_id, until                                                                                                                     |
| `accommodation`                    | account_id, multiplier, granted_by, reason_code, expires_at                                                                                            |

### 7. States and transitions

SM-ATTEMPT t1–t10; SM-EVIDENCE creation by issuer; SM-MODCASE for integrity. Forbidden: `unverified → passed`; edits after submit; minting from non-`passed`.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Performance   | start p95 ≤ 400 ms; autosave p95 ≤ 150 ms; auto-grade p95 ≤ 5 s; runner end-to-end p95 ≤ 60 s for suites ≤ 30 s             |
| Reliability   | timer correctness independent of job lag; grading idempotent; runner outage degrades to `unverified`, never to wrong grades |
| Security      | answer keys never in client payloads; runner network-less (ADR-T13); signed results; restriction checks in gateway not UI   |
| Privacy       | signals minimised; no recordings; retention of signals {90 d} unless case open                                              |
| Fairness      | accommodations; disclosure; human review; false-positive monitoring                                                         |
| Accessibility | WCAG 2.2 AA; time extensions; no mandatory fullscreen or camera                                                             |

### 9. Failure scenarios

| Scenario                                                 | Expected behaviour                                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Browser crash/closed mid-attempt                         | resume on same device or another within deadline; second simultaneous session blocked                            |
| Network lost during final minutes                        | local cache replays on reconnect if before deadline; otherwise last server autosave graded                       |
| Auto-submit job delayed                                  | any request after the deadline triggers lazy submission; late answers rejected                                   |
| Runner returns bad signature or mismatched snapshot hash | result discarded; retry; ultimately `unverified`                                                                 |
| Runner outage during peak                                | queue backs up; candidates see "grading in progress"; SLA alert; after budget ⇒ `unverified` with re-grade later |
| Gateway cache misses restriction                         | restriction table is authoritative and checked inline; cache TTL ≤ 5 s and fail-closed for restricted principals |
| Integrity false positive                                 | reviewer clears; evidence minted; candidate notified                                                             |
| Duplicate evidence mint on retry                         | idempotent by `attemptId`                                                                                        |
| Assessment version retired mid-attempt                   | attempt continues on its version                                                                                 |
| Clock drift between app nodes                            | all deadlines computed from DB time                                                                              |

### 10. Acceptance criteria

| AC          | Given                                                             | When                                                              | Then                                                                            | Type        |
| ----------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------- |
| AC-07-02-01 | cooldown not elapsed (23 h 59 m)                                  | start                                                             | `409 cooldown`; at 24 h 00 m accepted                                           | Boundary    |
| AC-07-02-02 | client clock set 2 h back                                         | start and view timer                                              | deadline and remaining time derive from server only                             | Security    |
| AC-07-02-03 | autosave of question 3 sent twice and out of order (seq 5 then 4) | PUT                                                               | stored value is seq 5; no error                                                 | Idempotency |
| AC-07-02-04 | disconnect at minute 10 of 30, reconnect at minute 12             | resume                                                            | same attempt, same question, timer at minute 12                                 | Recovery    |
| AC-07-02-05 | deadline passed, no submit                                        | job delayed 10 min then runs                                      | answers as of deadline graded; later PUT answers rejected `409`                 | Time        |
| AC-07-02-06 | attempt open on device A                                          | start/join on device B                                            | second session refused with explanation                                         | Concurrency |
| AC-07-02-07 | accommodation 1.5 on 40-min test                                  | start                                                             | deadline = 60 min                                                               | Happy       |
| AC-07-02-08 | any client                                                        | fetch attempt payload                                             | no answer keys, no grading config                                               | Security    |
| AC-07-05-01 | `AI_PROHIBITED` attempt `in_progress`                             | candidate calls AI endpoint via UI, API client, or another remote | `403 ai_prohibited` each time; signal logged; attempt unaffected                | Security    |
| AC-07-05-02 | deadline + 5 min passed                                           | candidate calls AI                                                | allowed (subject to quota)                                                      | Boundary    |
| AC-07-05-03 | assessment with `AI_ALLOWED`                                      | attempt starts                                                    | cannot mint evidence (publish blocked)                                          | Negative    |
| AC-07-05-04 | in assessment UI                                                  | open page                                                         | persistent banner; AI controls absent                                           | UX          |
| AC-07-04-01 | `code` assessment, no runner                                      | submit                                                            | state `unverified`; zero evidence rows; explanatory message; no score displayed | Honesty     |
| AC-07-04-02 | runner ships; attempt 20 days old                                 | re-grade job                                                      | graded normally; pass mints evidence                                            | Recovery    |
| AC-07-04-03 | attempt 31 days old                                               | re-grade job                                                      | stays `unverified`; candidate prompted to retake                                | Boundary    |
| AC-07-03-01 | submission opens a network socket                                 | run                                                               | connection fails; test reports failure                                          | Security    |
| AC-07-03-02 | infinite loop                                                     | run                                                               | killed at wall limit; that test fails; attempt gradable                         | Negative    |
| AC-07-03-03 | output exceeds 64 KB                                              | run                                                               | truncated; test fails if output compared                                        | Boundary    |
| AC-07-03-04 | result with wrong signature or hash                               | submit to `/internal/runner/result`                               | `403`; ignored; job retried                                                     | Security    |
| AC-07-03-05 | runner crashes 3 times                                            | grading                                                           | `unverified (runner_unavailable)`                                               | Recovery    |
| AC-07-03-06 | two workers grade same attempt                                    | both finish                                                       | only highest-generation result stored (fenced)                                  | Concurrency |
| AC-07-06-01 | threshold 70, score 69.99 and 70.00                               | grade                                                             | fail / pass                                                                     | Boundary    |
| AC-07-06-02 | passed auto-graded attempt                                        | mint                                                              | one evidence item at `authority_verified` with issuerRef                        | Happy       |
| AC-07-06-03 | mint job retried 3 times                                          | replay                                                            | still one item (INV-T27)                                                        | Idempotency |
| AC-07-06-04 | failed attempt                                                    | read evidence                                                     | no item                                                                         | Negative    |
| AC-07-06-05 | passed but integrity-flagged                                      | grade                                                             | evidence not minted until reviewer clears; then minted once                     | Edge        |
| AC-07-07-01 | high blur count only                                              | flagged                                                           | case opened; attempt not failed; candidate sees signal list                     | Fairness    |
| AC-07-07-02 | reviewer voids                                                    | decision                                                          | attempt `voided`; any minted evidence revoked; notice with appeal               | Happy       |
| AC-07-07-03 | appeal                                                            | assign                                                            | reviewer ≠ original                                                             | Process     |
| AC-07-08-01 | 3 attempts in 7 days                                              | 4th start                                                         | `409 attempt_cap`                                                               | Boundary    |

### 11. Testing

SM-ATTEMPT matrix (all transitions and forbidden pairs). Property tests for scoring (monotonicity, bounds). Gateway test matrix: restricted principal × route × client type. Runner conformance suite (network, FS, resource, determinism, signature). Chaos: kill grader mid-job; delay scheduler; duplicate queue delivery. Time tests with controllable clock. Accessibility audit of timer and navigator. Fairness review of signal thresholds before enabling any flagging.

### 12. Developer guidance

Ship order: auto-graded path → fallback + AI restriction → integrity signals/case → runner. Never let the front end decide pass/fail or time. Pitfalls: storing answer keys with questions in the client bundle; counting a `unverified` attempt toward "assessments passed"; treating AI-block logs as proof of cheating. Decisions pending: runner technology (architecture doc), per-language support, whether to reveal correct answers after pass, signal retention length.

### 13. Related

`ADR_REGISTER.md` ADR-T12, T13 · `STATE_MACHINES.md` SM-ATTEMPT · `DECISION_TABLES.md` DT-10 · `BUSINESS_RULES_REGISTRY.md` BR-T024…T030 · SPEC-03 (issuance), SPEC-06 (course assessments), SPEC-12 (AI quota).

---

## SPEC-06 Course Enrolment & Completion → Evidence

**Metadata:** Doc ID SPEC-06 · Owner: Learning PM · Version 1.0 · Status Under Review · Phase 1 (free + platform-authored), Phase 2 (paid, instructor-authored) · Priority P0 · Features: FEAT-08-01, FEAT-08-02, FEAT-08-03, FEAT-08-04, FEAT-08-08, FEAT-16-09 · Modules: MOD-LRN · `api/learning`, `api/billing`, `api/evidence`, `apps/worker` · Relates: SM-ENROLMENT, BR-T031…T034, INV-T17, INV-T27, ADR-T10, ADR-T14

### 1. Business purpose

"Learn" must feed "Prove": finishing a course produces graded evidence automatically, not a PDF the learner must self-describe. This feature covers discovery, enrolment (free and paid), progress that survives bad networks, rule-based completion, and the hand-off to evidence. Value: GOAL-04 (completion→evidence rate), institutional use (SPEC-14).

### 2. Actors & access

| Actor               | May                                                                                                     | Policy action                                |
| ------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| ROLE-ANON           | browse catalogue and public course pages                                                                | `course:read:public`                         |
| ROLE-CAND (learner) | enrol, learn, drop, review                                                                              | `enrolment:write:own`                        |
| ROLE-INST           | see enrolments and progress of own courses (aggregate + per learner within course), sign off completion | `course:read:learners`, `completion:signoff` |
| ROLE-FAC            | cohort-scoped progress (aggregate default)                                                              | `course:read:cohort`                         |
| ROLE-MOD            | takedown a course                                                                                       | `course:takedown`                            |
| System              | track progress, evaluate rules, issue evidence                                                          | worker                                       |

### 3. Functional behavior

#### 3.1 Course model (as consumed)

`course` → immutable `course_version` → ordered `module`s → `lesson`s of type {`video`, `text`, `quiz`, `assessment_link`, `assignment` (Phase 2)}. Each lesson: stable `lessonKey`, `optional` flag, estimated minutes, captions/transcript required for video (FEAT-08-03.3). A `completion_rule` is stored per version: `{requiredLessonKeys (default all non-optional), requiredAssessments[{assessmentId, minScore}], instructorSignoff: boolean}`. `price`: null/0 ⇒ free. `prerequisites[]`: courses completed and/or skills with confidence ≥ {level}.

#### 3.2 Enrolment (FEAT-08-02)

| Step          | Rule                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Idempotency   | `POST /courses/{id}/enrolments` with `Idempotency-Key`; natural key `(account, course)`: second call returns the existing enrolment                                                         |
| Checks        | course published; learner account active; prerequisites met else `409 prerequisites_unmet` with list; not sanctioned; plan gate (FEAT-08-08 lock reasons: `prerequisite`, `plan`, `region`) |
| Free          | ⇒ `active` (SM-ENROLMENT t1) pinned to current `course_version`                                                                                                                             |
| Paid          | ⇒ `pending_payment` (t2); client is sent to checkout (SPEC-12). **Return from checkout grants nothing** (INV-T17); access begins on t3 from the verified webhook; `expired` after 24 h (t4) |
| Drop/re-enrol | t6/t7, progress kept 90 d                                                                                                                                                                   |

#### 3.3 Progress (FEAT-08-03)

Events `{enrolmentId, lessonKey, courseVersion, kind ∈ {started, position, completed}, positionSeconds?, clientSeq}`. Server stores per lesson `max(clientSeq)`; `completed` is sticky; `position` never decreases completion state. Idempotent on `(enrolmentId, lessonKey, kind, clientSeq)`. A `video` lesson counts complete when watched ≥ {90 %} of duration with seek-skipping > {25 %} not credited **or** instructor marks "no minimum" **[OPEN]**; `quiz` lessons need pass per quiz rule; `assessment_link` completes on `assessment.passed` (SPEC-05).
Offline (ADR-T10): designated lessons (text, transcripts, downloadable video **[OPEN]**) may be cached for reading/watching; progress events queue locally and replay; the server decides completion (INV-T13). Resume position stored per lesson; `FEAT-08-03.4` conflicts resolved by server max.

#### 3.4 Completion evaluation (FEAT-08-04)

Triggered after each progress/assessment event and by a nightly sweep. Rule: all `requiredLessonKeys` complete **and** each required assessment passed at ≥ `minScore` **and** (if `instructorSignoff`) a sign-off exists. Rules are those of the enrolment's pinned `course_version` (BR-T031); if the instructor publishes a new version, the learner is offered an optional "move to latest" with progress mapped by `lessonKey`; never forced.
On true: set `completed` (t5), outbox `course.completed`. With `instructorSignoff=true` the enrolment stays `active` with attribute `completion_pending_signoff=true` and the instructor receives a task; `completed` is set on sign-off.
Evidence minting: consumer calls the evidence issuer API with `(issuer=course:<id>@<version>, sourceRef=enrolmentId)`: type `course_completion`, rung `authority_verified` when completion is rule-based/auto-verifiable or instructor-signed-off, skills = course skills, title = course title + version, period = enrolment dates. Exactly once (BR-T032, INV-T27 analogue). Learner is notified and offered next steps (add to profile, related assessments, gap analysis).

#### 3.5 Refund, takedown, suspension

Refund per policy (BR-T097): before completion ⇒ `refunded` (t8) and access removed; after completion only by human exception (t9) and the linked evidence is then revoked by a **human** issuer (BR-T012). Course takedown (moderator): existing enrolees keep access unless the takedown reason is safety/legal; new enrolments blocked. Learner sanction ⇒ `suspended` (t10).

#### 3.6 Side effects & postconditions

Events: `enrolment.created`, `enrolment.activated`, `lesson.completed`, `course.completed` (seed), `evidence.created`. Notifications: enrolment confirmed, payment pending/failed, completion + evidence, sign-off pending (instructor). Postcondition: `completed` ⇔ rule satisfied at pinned version (verifiable by recomputation); one evidence item per completed enrolment.

### 4. User interaction

SCR-COURSE-LIST (filters: skill, level, price, duration, language, accessibility features); SCR-COURSE-DETAIL (syllabus, prerequisites with met/unmet states, price, captions available, "what evidence you'll earn"); SCR-ENROL-CONFIRM; SCR-LESSON (player: captions on by default if available, keyboard shortcuts, speed 0.5–2×, transcript panel, next-lesson focus management, reduced-motion respected); SCR-MY-LEARNING (progress, resume, locked reasons); SCR-COMPLETION (celebration without confetti dependence, evidence link). Payment pending state: "We're confirming your payment" with auto-refresh (poll/SSE) up to 2 min then email. Mobile: lesson text and quiz usable one-handed; video adaptive. Offline badge on cached lessons.

### 5. Backend behavior

`api/learning` owns courses/enrolments/progress; `api/billing` raises `entitlement.changed`/`purchase.fulfilled` consumed by learning to activate paid enrolments (idempotent on payment event id); `apps/worker` runs completion sweep and expiry of unpaid enrolments. Public service interface exposes `learning.getEnrolmentState`, `learning.markAssessmentPassed` (consumer of `assessment.passed`).

| Endpoint (provisional)                  | Method                          |
| --------------------------------------- | ------------------------------- |
| `/courses`, `/courses/{id}`             | GET                             |
| `/courses/{id}/enrolments`              | POST (Idempotency-Key)          |
| `/me/enrolments`, `/me/enrolments/{id}` | GET; DELETE = drop              |
| `/me/enrolments/{id}/progress`          | POST batch of events            |
| `/me/enrolments/{id}/migrate`           | POST (opt-in to latest version) |
| `/instructor/enrolments/{id}/signoff`   | POST                            |

### 6. Data

| Entity                                                          | Key fields                                                                                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `course`, `course_version`                                      | id, version, rule JSON, price, prerequisites, published_at                                                                          |
| `lesson`                                                        | course_version_id, lesson_key, type, optional, duration, captions_ref                                                               |
| `enrolment`                                                     | id, account_id, course_id, course_version, state (SM-ENROLMENT), completion_pending_signoff, completed_at, evidence_id, payment_ref |
| `lesson_progress`                                               | enrolment_id, lesson_key, status, position_s, max_client_seq, updated_at                                                            |
| `signoff`                                                       | enrolment_id, instructor_id, at, note                                                                                               |
| Unique `(account_id, course_id)` among non-terminal enrolments. |

### 7. States and transitions

SM-ENROLMENT t1–t10. Forbidden: `completed → active`, completion without recomputed rule, unlock from payment redirect.

### 8. Non-functional requirements

| Area          | Requirement                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Performance   | catalogue p95 ≤ 300 ms; progress batch p95 ≤ 200 ms; completion evaluation ≤ 2 s after final event |
| Reliability   | progress events idempotent; evidence issuance exactly-once effect                                  |
| Accessibility | captions/transcripts mandatory to publish video; keyboard-operable player; WCAG 2.2 AA             |
| Offline       | read cache + queued progress; revalidated                                                          |
| Cost          | video delivery via CDN; offline video only if cost model accepted                                  |
| Privacy       | learning activity visible to instructor only within their course; institutions per BR-T100         |

### 9. Failure scenarios

| Scenario                                            | Expected behaviour                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Double-click enrol                                  | single enrolment (idempotent)                                                                                 |
| Payment webhook delayed                             | "processing" state; no access; auto-activates when event arrives; unpaid for 24 h ⇒ `expired`                 |
| Progress events arrive out of order or duplicated   | max-seq wins; no regression                                                                                   |
| Learner completes offline, device lost              | nothing is completed until events reach the server                                                            |
| Course updated mid-enrolment                        | pinned version continues; optional migration                                                                  |
| Evidence issuance fails                             | enrolment stays `completed`; issue job retried (SM-BGJOB); dead-letter alert; learner sees "evidence pending" |
| Instructor never signs off                          | reminder at 3 and 7 days; escalate to course owner; learner sees "awaiting sign-off"                          |
| Refund after completion                             | only by human exception; evidence revoked by human issuer with notice                                         |
| Prerequisite skill confidence drops after enrolment | enrolment unaffected (checked at enrol time only)                                                             |

### 10. Acceptance criteria

| AC          | Given                                                    | When                                             | Then                                                                            | Type          |
| ----------- | -------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- | ------------- |
| AC-08-02-01 | free course, prerequisites met                           | POST enrol twice (same key, then new key)        | one enrolment `active`; both calls return it                                    | Idempotency   |
| AC-08-02-02 | unmet prerequisite                                       | enrol                                            | `409 prerequisites_unmet` listing items; no enrolment                           | Negative      |
| AC-08-02-03 | paid course                                              | enrol                                            | `pending_payment`; lesson endpoints `403`                                       | Happy         |
| AC-08-02-04 | checkout success redirect, no webhook yet                | open lesson                                      | still `403`; status page says processing (INV-T17)                              | Security      |
| AC-08-02-05 | verified payment webhook                                 | processed                                        | enrolment `active` exactly once even if event redelivered                       | Idempotency   |
| AC-08-02-06 | unpaid for 24 h                                          | sweep                                            | `expired`                                                                       | Time          |
| AC-08-02-07 | dropped 89 d ago vs 91 d ago                             | re-enrol                                         | progress restored / fresh start                                                 | Boundary      |
| AC-08-08-01 | course locked by plan                                    | learner opens                                    | lock reason displayed; enrol blocked                                            | Negative      |
| AC-08-03-01 | `position` events seq 7 then 5                           | process                                          | stored position from seq 7                                                      | Idempotency   |
| AC-08-03-02 | `completed` event for lesson, then `started` event later | process                                          | lesson remains completed                                                        | Edge          |
| AC-08-03-03 | offline progress queued then sync                        | reconnect                                        | accepted idempotently; conflicts resolved by max seq                            | Recovery      |
| AC-08-03-04 | video w/o captions                                       | instructor publishes                             | publish blocked with reason                                                     | Accessibility |
| AC-08-03-05 | keyboard only                                            | complete lesson and navigate next                | all controls operable; focus order logical                                      | Accessibility |
| AC-08-04-01 | last required lesson done, all assessments passed        | event                                            | enrolment `completed`; `course.completed` once                                  | Happy         |
| AC-08-04-02 | one required assessment not passed                       | all lessons done                                 | stays `active`                                                                  | Negative      |
| AC-08-04-03 | `instructorSignoff=true`                                 | all criteria met                                 | `completion_pending_signoff`; instructor task; `completed` after sign-off       | Happy         |
| AC-08-04-04 | `course.completed` redelivered 3 times                   | consumer                                         | exactly one `course_completion` item at `authority_verified`                    | Idempotency   |
| AC-08-04-05 | course new version published mid-enrolment               | learner continues                                | completion judged on pinned version                                             | Consistency   |
| AC-08-04-06 | evidence issuer down                                     | completion                                       | enrolment `completed`, evidence created after retry; learner sees pending state | Recovery      |
| AC-08-04-07 | refund after completion by human exception               | decision                                         | `refunded`; evidence revoked by human with reason                               | Edge          |
| AC-16-09-01 | paid course purchase                                     | webhook order inverted (invoice before checkout) | final state correct, single activation                                          | Concurrency   |

### 11. Testing

SM-ENROLMENT matrix; idempotency suite for enrol and progress; webhook replay and ordering tests (shared with SPEC-12); completion-rule property tests (monotonic, version-pinned); offline/queue tests with network throttling; accessibility audit on player; issuer replay tests; load test for progress batches (peak 10k concurrent learners **[OPEN]**).

### 12. Developer guidance

Build order: catalogue → free enrolment → progress → completion rule engine → evidence hand-off → paid enrolment → sign-off. Keep the rule evaluator pure and shared with the nightly sweep. Pitfalls: computing completion in the client; using floating percentage thresholds without defining rounding; binding evidence to course title strings instead of `course_version`. Decisions pending: offline video, video-watch threshold, instructor sign-off SLAs, refund window (OPEN-06).

### 13. Related

`STATE_MACHINES.md` SM-ENROLMENT · `BUSINESS_RULES_REGISTRY.md` BR-T031…T034, T097 · SPEC-03 · SPEC-05 · SPEC-12 · SPEC-14.

### Contract links (patch 2026-10-27)

Evidence label: PROPOSED mapping. Every id below was grepped in its owner file on 2026-10-27; ids marked "none" do not exist and are OPEN. Owners: ACT-ATOM-nn in 07 ACTION_REGISTRY; FLD-* in 07 SCREEN_SPECIFICATIONS_KEY; EDG-nn in 06 BUSINESS_PROCESS_INVENTORY; XT-nn in 06 SSOT_WORKFLOW_CROSSWALK; UXH-nn in 07 PROGRESSIVE_UX_AND_FEEDBACK; audit.* in 14 SECURITY_ARCHITECTURE and 07; TEST-ACT-nnn in 07 ACTION_REGISTRY (not yet in TEST_CATALOG, OPEN-P04).

| SPEC                                      | ACT-ATOM                                   | Base ACT without atom               | FLD  | EDG                                     | XT                                                                           | UXH    | audit events                         | TEST         | Contract gap                                                                               |
| ----------------------------------------- | ------------------------------------------ | ----------------------------------- | ---- | --------------------------------------- | ---------------------------------------------------------------------------- | ------ | ------------------------------------ | ------------ | ------------------------------------------------------------------------------------------ |
| SPEC-05 (FEAT-07-02..07-08, 17-03)        | ACT-ATOM-08 (submit attempt, timer expiry) | ACT-ASM-01, -02, -04, -06, -09, -10 | none | EDG-08                                  | none                                                                         | UXH-08 | `audit.assessment.attempt_submitted` | TEST-ACT-008 | OPEN-F05: start, run code, pause and accommodation have no atomic contract                 |
| SPEC-06 (FEAT-08-01..08-04, 08-08, 16-09) | none                                       | ACT-LRN-01, -05, -06, -07           | none | EDG-05 (paid enrolment webhook), EDG-10 | XT-04, XT-05 (course review, assignment grading: adjacent, scope to confirm) | UXH-07 | none                                 | none         | OPEN-F06: enrol, complete and add-to-evidence have no atomic contract, audit event or TEST |

## Feature Specifications — Group 4: Jobs, Search & Match, Applications, Pipeline

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G4_HIRING_LOOP.md`._

Doc ID: SPEC-G4 · Owner: Product Director + Hiring/Matching leads · Version 1.0 · Status: Under Review · Relates: DOM-09, DOM-10, DOM-11, FEAT-09-01…09-03, FEAT-09-05, FEAT-09-08, FEAT-10-01…10-08, FEAT-10-14, FEAT-11-01…11-03, FEAT-11-07, FEAT-11-08, FEAT-23-03, FEAT-24-12, SM-JOB, SM-APPLICATION, SM-INTERVIEW, DT-03, DT-05, DT-12, BR-T001, BR-T002, BR-T035…T040, BR-T070…T077, INV-T09, INV-T19, INV-T21, INV-T28, INV-T30, INV-T39, INV-T44, INV-T45

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**; numeric scoring constants are illustrative defaults to be calibrated against GOAL-03 audits.

---

## SPEC-07 Job Posting & Publishing

**Metadata:** Doc ID SPEC-07 · Owner: Opportunities PM · Version 1.0 · Status Under Review · Phase 1 (minimal) / Phase 2 (teams, approvals, templates) · Priority P0 · Features: FEAT-09-01, FEAT-09-02, FEAT-09-03, FEAT-09-05, FEAT-09-08, FEAT-02-03 · Modules: MOD-HIR, MOD-OPP, MOD-SHELL · `api/jobs`, `api/orgs`, `api/billing`, `api/safety`, `apps/worker` · Relates: SM-JOB, DT-12, BR-T035…T037, BR-T093, INV-T30, INV-T44, ADR-T22

### 1. Business purpose

Employers create postings whose structure (canonical skills, disclosed pay, clear location) drives match quality and candidate trust, and publish them under entitlement and safety checks. Value: supply side of the marketplace (GOAL-02), source data for explainable matching (GOAL-03).

### 2. Actors & access

| Actor                                                                                                           | May                                                        | Policy action                       |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------- |
| ROLE-REC                                                                                                        | create/edit/publish/pause/close jobs of own org            | `job:write:org`                     |
| ROLE-HM                                                                                                         | edit assigned jobs; request publish; approve if designated | `job:write:assigned`, `job:approve` |
| ROLE-ORGADM                                                                                                     | all of the above + assign teams + view billing gates       | `job:admin:org`                     |
| ROLE-MOD                                                                                                        | review flagged jobs; take down                             | `job:review`, `job:takedown`        |
| ROLE-ANON / ROLE-CAND                                                                                           | read published jobs                                        | `job:read:public`                   |
| ROLE-SUP/ADM                                                                                                    | read under grant                                           | `job:read:granted`                  |
| Org membership is checked per record (INV-T02/T03): a recruiter of Org A cannot read or write a draft of Org B. |

### 3. Functional behavior

#### 3.1 Inputs and validation

| Field                | Rule                                                                                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title                | 5–100 chars                                                                                                                                                                                                                  |
| description          | 200–10,000 chars; sanitised rich text subset; no scripts                                                                                                                                                                     |
| employmentType       | `full_time`, `part_time`, `contract`, `internship`, `temporary`                                                                                                                                                              |
| workMode             | `onsite`, `hybrid`, `remote`                                                                                                                                                                                                 |
| locations            | 1–5 `{country (ISO), region?, city?}`; remote may carry allowed countries                                                                                                                                                    |
| requiredSkills       | 1–15 canonical skills; optional `minLevel`                                                                                                                                                                                   |
| preferredSkills      | 0–15 canonical, no overlap with required                                                                                                                                                                                     |
| experienceLevel      | `entry`, `mid`, `senior`, `lead`                                                                                                                                                                                             |
| pay                  | `{currency (ISO 4217), min, max, period ∈ {hour, month, year}, disclosed}`; `0 ≤ min ≤ max`; max ≤ {20}× min (sanity); if `disclosed=false` allowed unless org policy or jurisdiction rule requires disclosure **[OPEN-08]** |
| applicationQuestions | 0–10: `text` (≤ 500), `yes_no`, `single_select` (≤ 10 options); no questions on protected attributes (lint)                                                                                                                  |
| closesOn             | optional, ≤ 90 d from publish                                                                                                                                                                                                |
| hiringTeam           | 1–10 org members (default: author)                                                                                                                                                                                           |
| `Idempotency-Key`    | required on create and publish                                                                                                                                                                                               |

#### 3.2 Rules

1. **Draft** is private to the hiring team. Autosave with `ETag` (`If-Match`); conflicting edits ⇒ `412` + diff.
2. **Publish gate = DT-12** evaluated inside one transaction: permission → org verification state (unverified org ⇒ at most one live job) → validation (BR-T035) → **slot reservation** (row lock on the org's entitlement counter, derived per DT-02/BR-T093) → policy checks (§3.3) → target state. Failure returns the first failing row's code.
3. **Publishing effects:** state `published` (or `scheduled`/`pending_review`), `job.published` event, search indexing ≤ 60 s p95 (FEAT-24-12), alert fan-out job for saved searches (FEAT-09-06), employer page update.
4. **Post-publish edits:** _safe fields_ (typos in description, `closesOn`, hiring team, questions not yet answered) editable freely; _material fields_ (title, skills, pay, locations, workMode) editable but recorded as a revision; if applications exist, candidates see "Updated <date>"; existing applications are not altered.
5. **Lifecycle (FEAT-09-03):** `pause` (hidden from search, existing apps continue), `resume`, `close` with reason (`filled`, `cancelled`) or auto `expired` at 45 d (BR-T036; reminder 7 d before expiry; extend by publisher up to 90 d). Closed jobs cannot reopen — **clone** to a new draft (`cloned_from`); open applicants are notified within 24 h if closed unfilled (BR-T037).
6. **Templates (09-01.3):** copy-on-create; changing a template never alters existing jobs.
7. **AI-assisted draft (09-01.4, FEAT-17-05):** only through the AI gateway, only a draft that the recruiter edits and confirms (INV-T09 spirit); orgs without AI entitlement get deterministic template fill, no paid inference (INV-T07).
8. **Inclusive-language lint (09-01.5):** configurable term lists produce warnings; hard-blocking only for terms on an admin-maintained "never allowed" list (e.g. explicit discriminatory phrases) — no legal claim is made about completeness.

#### 3.3 Safety checks (FEAT-09-08)

Signals: payment requested from applicant; contact via off-platform messenger or free-mail only; pay > {5}× median for title; copied description hash seen in other orgs within 24 h; org created < 24 h ago with first posting; links to non-https or URL shorteners. Any signal ⇒ `pending_review` with the signal list shown to the moderator; nothing is auto-rejected; the recruiter is told "a reviewer will check this posting" (SLA {1 business day}).

#### 3.4 Side effects and postconditions

Events: `job.created`, `job.published`, `job.paused`, `job.closed`, `job.revised`, `job.taken_down`. Audit on every transition. Postconditions: INV-T30 (verified org, ≤ 1 slot), INV-T44 (closed ⇒ no new applications).

### 4. User interaction

SCR-JOB-EDIT (sections: basics, skills picker with typeahead and required/preferred toggle, location, pay with disclosure explainer, questions, team, preview as candidate); live validation per field; "Publish" opens a summary modal listing slot usage and warnings; SCR-JOB-LIST (filters by state, owner; bulk pause/close with confirm); SCR-JOB-REVIEW for moderators. Mobile: recruiter drafts on phone are possible but publishing requires online confirmation. Accessibility: error summary; skills picker keyboard-operable; preview uses same components as candidate view. Pay-range wording is neutral and includes currency/period.

### 5. Backend behavior

`api/jobs` owns jobs, revisions, questions, slot reservations; it calls `billing.getEntitlements(org)` (public interface) and `safety.precheck(job)`; never reads their tables (FF-02). Worker jobs: publish-at, expiry sweep, reminder, alert fan-out, index sync. Idempotency: publish keyed `(job_id, version)`.

| Endpoint (provisional)                                       | Method                              |
| ------------------------------------------------------------ | ----------------------------------- |
| `/orgs/{org}/jobs`                                           | POST create / GET list              |
| `/jobs/{id}`                                                 | GET (role-aware) / PATCH (If-Match) |
| `/jobs/{id}/publish`                                         | POST (Idempotency-Key)              |
| `/jobs/{id}/pause`, `/resume`, `/close`, `/clone`, `/extend` | POST                                |
| `/jobs/{id}/review/approve`, `/request-changes`              | POST (approver/moderator)           |
| `/public/jobs/{slug}`                                        | GET public detail                   |

### 6. Data

| Entity                                            | Key fields                                                                                                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `job`                                             | id, org_id, state (SM-JOB), version, title, slug, description, type, work_mode, level, pay jsonb, closes_on, published_at, expires_at, cloned_from |
| `job_skill`                                       | job_id, skill_id, kind (required/preferred), min_level                                                                                             |
| `job_location`                                    | job_id, country, region, city                                                                                                                      |
| `job_question`                                    | id, job_id, type, prompt, options, required                                                                                                        |
| `job_revision`                                    | job_id, version, changed_fields, at, by                                                                                                            |
| `job_team`                                        | job_id, member_id, role (owner/hm/viewer)                                                                                                          |
| `slot_reservation`                                | org_id, job_id, state (held/consumed/released), at                                                                                                 |
| `precheck_result`                                 | job_id, signals[], outcome, reviewer_id                                                                                                            |
| All tenant tables carry `org_id` + RLS (INV-T03). |

### 7. States and transitions

SM-JOB t1–t10. Forbidden: `closed → *`; `draft → paused`; publish without slot.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Performance   | publish p95 ≤ 500 ms (excluding async index); public detail p95 ≤ 200 ms cached                                             |
| SEO           | public pages SSR/prerender with structured data (FEAT-09-05.1); closed jobs return a proper "closed" page, not 404 for 30 d |
| Security      | per-record org authz; HTML sanitisation; no unsafe URLs; audit                                                              |
| Accessibility | WCAG 2.2 AA both editor and public page                                                                                     |
| Concurrency   | slot reservation serialised per org                                                                                         |
| Fairness      | pay disclosure encouraged; lint warnings logged for audit                                                                   |

### 9. Failure scenarios

| Scenario                                           | Expected behaviour                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Two recruiters publish with one free slot          | one succeeds; other `409 entitlement_exhausted` and keeps a draft                      |
| Publish retried after network error                | idempotent; one `job.published`                                                        |
| Subscription lapses between schedule and execution | scheduled job re-checks entitlement; fails to `draft` with notification (U7)           |
| Indexer down                                       | job is `published` but search lag; alert; repair job reconciles                        |
| Moderator takes down job with applicants           | applications continue for existing applicants; new applications blocked; notice to org |
| Draft edited by two people                         | `412` merge dialog                                                                     |
| Org loses verification                             | live jobs stay up 7 d with banner then pause **[OPEN]**                                |
| Description paste includes script tags             | sanitised; stored without them                                                         |

### 10. Acceptance criteria

| AC          | Given                                                | When           | Then                                                                 | Type              |
| ----------- | ---------------------------------------------------- | -------------- | -------------------------------------------------------------------- | ----------------- |
| AC-09-01-01 | description of 199 and 200 chars                     | publish        | 199 ⇒ `422`; 200 passes                                              | Boundary          |
| AC-09-01-02 | 0 or 16 required skills; free-text skill             | save           | `422`                                                                | Negative          |
| AC-09-01-03 | pay min 100 > max 50                                 | save           | `422`                                                                | Negative          |
| AC-09-01-04 | question asking about age or marital status          | save           | rejected by lint with reason                                         | Negative/Fairness |
| AC-09-01-05 | recruiter of Org A requests Org B draft              | GET            | `404` (no existence leak)                                            | IDOR              |
| AC-09-01-06 | free org requests AI draft                           | click          | deterministic template offered; no paid inference (INV-T07)          | Cost              |
| AC-09-02-01 | entitled org, valid draft                            | publish        | `published`; indexed ≤ 60 s p95; `job.published` once                | Happy             |
| AC-09-02-02 | one free slot, two concurrent publishes              | submit         | exactly one `published`                                              | Concurrency       |
| AC-09-02-03 | same publish request replayed                        | submit         | same response; no second slot used                                   | Idempotency       |
| AC-09-02-04 | unverified org with 1 live job                       | publish second | `409 org_verification_required`                                      | Negative          |
| AC-09-02-05 | scam signals present                                 | publish        | `pending_review`; moderator sees signals; not rejected automatically | Safety            |
| AC-09-02-06 | `publish_at` future; subscription lapsed before time | scheduler      | job returns to `draft`; owner notified                               | Recovery          |
| AC-09-02-07 | org policy requires approver; author = approver      | publish        | `pending_review` for a different approver                            | Process           |
| AC-09-03-01 | published job, day 38                                | sweep          | reminder sent; day 45 `closed(expired)`                              | Time              |
| AC-09-03-02 | closed job                                           | reopen attempt | `409`; clone endpoint offered                                        | Negative          |
| AC-09-03-03 | close unfilled with 12 applicants                    | close          | each notified ≤ 24 h                                                 | Happy             |
| AC-09-03-04 | paused job                                           | search         | not returned; direct link shows "not accepting applications"         | Happy             |
| AC-09-03-05 | material edit with applicants                        | save           | revision recorded; "Updated" marker; applications unchanged          | Consistency       |
| AC-09-05-01 | published job                                        | crawl page     | structured data present; canonical URL; no PII                       | SEO               |
| AC-09-08-01 | description asks for payment to apply                | publish        | held for review with signal "payment_requested"                      | Safety            |
| AC-02-03-01 | HM not assigned to job                               | edit           | `403`; assigned HM can edit                                          | Negative          |

### 11. Testing

SM-JOB matrix; DT-12 row tests; concurrency test for slot lock (parallel publishes); scheduler tests with clock control; sanitiser fuzzing; cross-tenant canary on every job endpoint; E2E recruiter journey from draft to candidate-visible page; accessibility audit of editor.

### 12. Developer guidance

Order: draft model → validation → publish gate (DT-12) → public page → lifecycle jobs → safety checks → templates. Implement DT-12 as a pure function plus a transactional wrapper. Pitfalls: counting drafts as slots (BR-T093 counts published + paused only), reading entitlements from a client-supplied header, indexing before commit (use outbox). Decisions pending: pay disclosure duty (OPEN-08), org-verification mechanics, slot semantics for paused jobs.

### 13. Related

`STATE_MACHINES.md` SM-JOB · `DECISION_TABLES.md` DT-12, DT-02 · `BUSINESS_RULES_REGISTRY.md` BR-T035…T037, T093 · SPEC-08, SPEC-09, SPEC-12.

---

## SPEC-08 Job Search & Explainable Match

**Metadata:** Doc ID SPEC-08 · Owner: Matching PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-11-01, FEAT-11-02, FEAT-11-03, FEAT-11-07, FEAT-11-08, FEAT-24-12, FEAT-09-05 · Modules: MOD-OPP, MOD-HIR · `api/search`, `api/matching`, `api/skills`, `apps/worker` · Relates: ADR-T11, ADR-T22, INV-T19, INV-T25, INV-T45, BR-T070…T076, DT-03

### 1. Business purpose

Let candidates find relevant jobs quickly and understand **why** a job matches or not, using evidence strength as a first-class signal, while guaranteeing the ranking cannot be bought and cannot use protected attributes. Value: GOAL-03 (100 % of matches with rationale; audits pass), conversion from search to qualified application.

### 2. Actors & access

| Actor               | May                                                 | Policy action                   |
| ------------------- | --------------------------------------------------- | ------------------------------- |
| ROLE-ANON           | search public jobs (no match scores)                | `search:jobs:public`            |
| ROLE-CAND           | search, see own match explanations, hide categories | `search:jobs`, `match:read:own` |
| ROLE-REC / ROLE-HM  | see match explanations for applicants to their jobs | `match:read:applicant`          |
| ROLE-AUD / ROLE-ADM | read audit aggregates                               | `match:audit`                   |
| System              | index, compute                                      | worker                          |

### 3. Functional behavior

#### 3.1 Search inputs (FEAT-11-01)

| Parameter                                                                                                                                                                                                                                                                                                            | Rule                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`                                                                                                                                                                                                                                                                                                                  | ≤ 200 chars, Unicode-normalised, treated as data (never as query syntax)                                                                       |
| filters                                                                                                                                                                                                                                                                                                              | `country`, `region`, `city`, `radiusKm` ≤ 200 (when geo available), `workMode[]`, `employmentType[]`, `level[]`, `skills[]` (+ `skillsMode=any | all`), `payMin`(only jobs with`disclosed=true`), `postedWithin ∈ {1d,7d,30d}`, `org`, `eligibleOnly` (hides jobs failing declared eligibility filters) |
| `sort`                                                                                                                                                                                                                                                                                                               | `relevance` (default), `date`; there is no "sponsored" or "featured" sort (FEAT-09-11 removed)                                                 |
| pagination                                                                                                                                                                                                                                                                                                           | opaque cursor; `limit` 20 default, 50 max; stable ordering within a cursor session                                                             |
| Relevance = weighted FTS rank (title 3, skills 2, description 1) + trigram similarity on title for typo tolerance + freshness decay; **no organisation plan, payment, or engagement input** (INV-T19, DT-03). Results show `postedAt`, org, location, work mode, disclosed pay, and — if signed in — `MatchSummary`. |
| Recent searches stored on device only; account-level search history is not retained beyond anonymised aggregate telemetry (consent-gated).                                                                                                                                                                           |

#### 3.2 Match computation (FEAT-11-02, 11-03)

Inputs are **only** the DT-03 allowlist. For job `J` and candidate `C`:

1. For each skill `s` in `J`: weight `w_s` = 1.0 (required) or 0.4 (preferred).
2. **Skill confidence** `conf_s(C) ∈ [0,1]` from FEAT-04-04: `1 − Π_i (1 − r_i × d_i)` over active evidence items tagged `s`, where `r_i` = rung weight {claimed 0.15, artifact_backed 0.45, peer_attested 0.70, authority_verified 1.00} and `d_i = exp(−age_years_i / τ)` with `τ = 3` (recency decay).
3. `coverage_s = min(1, conf_s / target_s)` with `target_s = 0.8` by default (`minLevel` can raise it).
4. `score = 100 × Σ w_s × coverage_s / Σ w_s`.
5. **Uncertainty:** `verifiedShare = Σ w_s × coverage_s computed from rungs ≥ artifact_backed / Σ w_s × coverage_s`; `uncertainty = 1 − verifiedShare`; band ∈ {`low` < 0.25, `medium` < 0.60, `high`}. Displayed score is a **range** `[score − δ, score + δ]` with `δ = 4 / 8 / 14` for low/medium/high, clamped to 0–100 (tunable).
6. **Eligibility** (work mode, location, availability, declared work-authorisation) is evaluated separately and shown as pass/fail chips; it never lowers `score`.
7. **Label bands (copy):** ≥ 75 "Strong", 50–74 "Possible", < 50 "Stretch"; wording never says "unqualified" or "reject".
   `MatchResult = {jobId, accountId, scoreRange, band, uncertainty, matched[{skill, rung, weightShare}], missing[{skill, w}], eligibility[], computedAt, inputHash, explanationVersion}`. `inputHash` covers all inputs used (INV-T45).

#### 3.3 "Why" and "what would change this" (FEAT-11-02.4, 11-08)

The panel lists matched skills with rung chips ("SQL — verified by assessment"), missing skills, eligibility results, uncertainty text ("Most of this match rests on self-reported skills"), and up to 3 **actions** ranked by `Δscore` (e.g. "Complete the SQL assessment: about +8"), each linking to a real action (assessment, course, evidence form). Actions never claim a guaranteed outcome. Candidates may hide a recommendation category ("not interested in this role family"); this affects only their own feed.

#### 3.4 Recompute & freshness (FEAT-11-07)

Triggers: `evidence.created/verified/revoked`, `skill.merged`, `job.revised`, `profile.updated` (preferences). Worker recomputes affected `(candidate, job)` pairs lazily (only for jobs the candidate viewed/applied/saved, plus top-N feed) within 15 min p95 (BR-T076). Reads compare stored `inputHash` with current inputs; mismatch ⇒ shows "updating" and recomputes on demand (≤ 1 s budget) rather than showing stale as fresh.

#### 3.5 Recruiter view

For applicants, recruiters see the **same** `MatchResult` the candidate sees (symmetry), labelled advisory; order of applicants defaults to application date with optional sort by score; no applicant is hidden by score (BR-T072). Recruiter-initiated candidate search/shortlists are specified with FEAT-11-05/11-10 (Phase 2).

#### 3.6 Indexing (FEAT-24-12)

Outbox → indexer: `job.published/revised/closed/paused/taken_down` update the search table (FTS vector, trigram, skills array, geo). Visible ≤ 60 s p95; removal on close/pause/takedown ≤ 60 s. Reindex job is idempotent; drift detector compares counts hourly.

#### 3.7 Side effects & postconditions

Events: `match.computed` (internal, proposed), telemetry `search.performed` (consent-gated, no query text unless consented). Postconditions: every displayed match has rationale (BR-T071); no stored score without `inputHash`.

### 4. User interaction

SCR-JOB-SEARCH: query box with typeahead (skills/titles), filter drawer (mobile bottom sheet), result cards with match chip and rung hints, empty state with suggestions ("remove filter X", "see similar roles"); SCR-JOB-DETAIL with "Why this match" panel (expandable, keyboard accessible, plain language, no jargon), eligibility chips, "Gap to qualify" actions. Candidates with no evidence see guidance ("Add your first evidence to see a match") rather than a zero. Offline: last results cached read-only, labelled with time. Accessibility: result list semantics, filter state announced, chips not colour-only, charts have text equivalents.

### 5. Backend behavior

`api/search` serves queries from Postgres (FTS + `pg_trgm`; `pgvector` Phase 3) behind `SearchPort` (ADR-T11). `api/matching` exposes `getMatch(candidate, job)`; calls `skills.getConfidence(candidate)` through public interfaces. Scorer config validated at boot against the DT-03 allowlist; unknown input ⇒ startup failure. Telemetry for tuning is anonymised.

| Endpoint (provisional)     | Method         |
| -------------------------- | -------------- |
| `/jobs/search`             | GET (cursor)   |
| `/jobs/{id}/match`         | GET (own)      |
| `/jobs/{id}/match/actions` | GET            |
| `/me/recommendations`      | GET (Phase 2)  |
| `/applications/{id}/match` | GET (job team) |

### 6. Data

| Entity             | Key fields                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `job_search_doc`   | job_id, fts vector, title trigram, skills[], geo, work_mode, pay_min, posted_at, state                                                                      |
| `skill_confidence` | account_id, skill_id, value, computed_at, input_hash                                                                                                        |
| `match_result`     | account_id, job_id, score_low, score_high, band, uncertainty, matched jsonb, missing jsonb, eligibility jsonb, computed_at, input_hash, explanation_version |
| `scorer_config`    | version, weights, allowlist_hash, approved_by, effective_at                                                                                                 |
| `fairness_sample`  | period, group_ref (audit-only), outcomes (aggregate)                                                                                                        |

### 7. States and transitions

No SM of its own; depends on SM-JOB (indexable states: `published` only), SM-EVIDENCE (`active` only), SM-ACCOUNT (`active`, not restricted).

### 8. Non-functional requirements

| Area           | Requirement                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Performance    | search p95 ≤ 400 ms at target corpus {1 M jobs-equivalent rows}; `getMatch` cached ≤ 50 ms, recompute ≤ 1 s |
| Fairness       | allowlist enforced in code; quarterly adverse-impact audit (FEAT-11-09); changes need ADR                   |
| Explainability | rationale generated from the same inputs as score (INV-T45)                                                 |
| Privacy        | no personal data in search logs; telemetry consent-gated                                                    |
| Availability   | search degrades to cached/last-known with banner, never to unranked "random"                                |
| Accessibility  | WCAG 2.2 AA; filters operable by keyboard/screen reader                                                     |
| i18n           | multilingual stemming deferred; English at launch **[OPEN]**                                                |

### 9. Failure scenarios

| Scenario                                | Expected behaviour                                                          |
| --------------------------------------- | --------------------------------------------------------------------------- |
| Index lag                               | recently published job missing ≤ 60 s p95; alert at > 5 min                 |
| Closed job still in index               | detail page shows closed state; indexer reconciliation purges               |
| Evidence revoked while viewing          | next fetch recomputes; UI shows "updated" note                              |
| Taxonomy merge changes skill ids        | `skill.merged` triggers recompute; old ids resolved by alias                |
| Scorer config contains disallowed input | process refuses to start; CI test fails                                     |
| Search outage                           | friendly error; saved searches and applications unaffected                  |
| Candidate with only claimed evidence    | match shown with wide range and "mostly self-reported" text, not suppressed |
| Query contains operators/injection      | treated as plain text; no error leak                                        |

### 10. Acceptance criteria

| AC          | Given                                           | When                       | Then                                                            | Type        |
| ----------- | ----------------------------------------------- | -------------------------- | --------------------------------------------------------------- | ----------- |
| AC-11-01-01 | job "Data Analyst"                              | search "data analist"      | job returned (typo tolerance)                                   | Happy       |
| AC-11-01-02 | filters workMode=remote + skills=[SQL] mode=all | search                     | only jobs satisfying both                                       | Happy       |
| AC-11-01-03 | payMin=50000                                    | search                     | only jobs with disclosed pay ≥ 50,000                           | Boundary    |
| AC-11-01-04 | job paused, closed, taken down                  | search ≤ 60 s later        | absent                                                          | Happy       |
| AC-11-01-05 | two orgs identical posts; one has premium plan  | search                     | order identical; swapping plans does not change order (INV-T19) | Fairness    |
| AC-11-01-06 | cursor request after new jobs published         | page 2                     | no duplicates/skips within session                              | Consistency |
| AC-11-01-07 | `q` = `'; DROP TABLE jobs;--`                   | search                     | treated as text; normal results                                 | Security    |
| AC-11-01-08 | limit=51                                        | search                     | `422` or clamped to 50 per contract                             | Boundary    |
| AC-11-02-01 | signed-in candidate                             | open result                | every match shows rationale, computedAt, uncertainty band       | Happy       |
| AC-11-02-02 | stored match                                    | recompute with same inputs | identical score and `inputHash` (reproducible)                  | Consistency |
| AC-11-02-03 | candidate skills only `claimed`                 | view match                 | range wide; text "mostly self-reported"                         | Honesty     |
| AC-11-02-04 | recruiter opens applicant                       | match view                 | same result as candidate sees; no extra hidden fields           | Symmetry    |
| AC-11-02-05 | applicants with low scores                      | recruiter lists            | all applicants visible; no auto-hide                            | Fairness    |
| AC-11-02-06 | candidate has zero evidence                     | view match                 | guidance state, not "0 %" shaming                               | UX          |
| AC-11-03-01 | scorer config adds `age` or `plan` input        | boot/CI                    | rejected                                                        | Fairness    |
| AC-11-03-02 | profile photo or name changed                   | recompute                  | score unchanged                                                 | Fairness    |
| AC-11-07-01 | evidence revoked                                | recompute                  | match and skill confidence updated ≤ 15 min p95                 | Happy       |
| AC-11-07-02 | recompute worker down                           | open match                 | `inputHash` mismatch ⇒ on-demand recompute or "updating" label  | Recovery    |
| AC-11-08-01 | missing skill with assessment available         | open panel                 | action listed with estimated Δscore and link                    | Happy       |
| AC-24-12-01 | indexer redelivers event                        | process                    | idempotent; one row                                             | Idempotency |
| AC-24-12-02 | drift between jobs table and index              | hourly check               | alert + repair job                                              | Recovery    |

### 11. Testing

Property tests: score monotonic in evidence rung and in number of matched skills; clamps; reproducibility. Allowlist/fairness tests (swap protected attributes ⇒ identical output; plan swap ⇒ identical ranking). Relevance regression suite with labelled queries. Index consistency tests via outbox replay. Load test at target corpus. Quarterly adverse-impact job (BP-35). Accessibility testing of explanation panel.

### 12. Developer guidance

Implement the scorer as a pure function in `packages/domain`, versioned (`explanation_version`) so old explanations remain interpretable. Store rationale with the score, never regenerate it with different logic. Pitfalls: leaking `Δscore` as a promise; caching match per candidate without `inputHash`; letting the search ranker read `org.plan`. Decisions pending: calibration of constants against real outcomes (needs data; until then mark as heuristic in the UI copy), languages, geo provider.

### 13. Related

`ADR_REGISTER.md` ADR-T11, T22 · `DECISION_TABLES.md` DT-03 · `BUSINESS_RULES_REGISTRY.md` BR-T070…T077 · SPEC-03 (rungs) · SPEC-07 · SPEC-09.

---

## SPEC-09 Application Submit (Idempotent, Draft Autosave, One-Active Rule)

**Metadata:** Doc ID SPEC-09 · Owner: Applications PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-10-01, FEAT-10-02, FEAT-10-03, FEAT-10-04, FEAT-10-14, FEAT-24-03, FEAT-24-07 · Modules: MOD-OPP, MOD-SHELL · `api/applications`, `api/privacy`, `api/platform`, `apps/worker` · Relates: SM-APPLICATION, DT-05, DT-01, BR-T001, BR-T038, BR-T039, BR-T062, BR-T114, BR-T117, INV-T10, INV-T13, INV-T21, INV-T28, INV-T44

### 1. Business purpose

Applying is the moment evidence becomes a hiring decision input. It must be effortless on a bad mobile connection, impossible to duplicate, and precise about what the employer will see. Value: qualified applications (success measure), candidate trust (consent snapshot), recruiter data quality.

### 2. Actors & access

| Actor                                     | May                                                        | Policy action              |
| ----------------------------------------- | ---------------------------------------------------------- | -------------------------- |
| ROLE-CAND                                 | create/edit draft, submit, withdraw, view own applications | `application:write:own`    |
| ROLE-REC / ROLE-HM (job team)             | read submitted applications of own jobs (snapshot)         | `application:read:job`     |
| ROLE-ORGADM                               | read within org (metadata; content only if on job team)    | `application:read:org`     |
| ROLE-SUP                                  | grant-based                                                | `application:read:granted` |
| Drafts are visible to the candidate only. |

### 3. Functional behavior

#### 3.1 Draft (FEAT-10-01)

Creation: `POST /jobs/{id}/applications` (Idempotency-Key) creates a `draft` if none exists for (candidate, job) (INV-T21); an existing active application is returned instead. Autosave: `PUT /me/applications/{id}/draft` with `If-Match`; fields: `answers[]`, `evidenceIds[]` (≤ 20, active only), `coverNote` ≤ 2,000, `resumeVariantId?`, `contactVisibility ∈ {platform_messages_only (default), share_email}`. Draft expires 30 d after last edit (notice at 23 d); if the job closes mid-draft, draft is retained 7 d with a banner "This job is no longer accepting applications" (BR-T038).
**Offline (ADR-T10):** edits queue locally with client sequence and `baseVersion`; on reconnect each is replayed through the same PUT; a `412` shows the conflict UI with both versions (BR-T117). Submit is **never** queued: the Submit button is disabled offline with an explanation.

#### 3.2 Pre-submit checklist & consent (FEAT-10-02.1)

The UI computes and the server enforces DT-05. The checklist shows: required answers, minimum profile (display name, headline, ≥ 1 skill), selected evidence with rung chips, each work claim and its verification label, and the **exact list of what the employer will see** (the preview _is_ the snapshot render). Evidence not selected is not shared; no default pre-selection beyond "strongest 3 relevant to this job" suggestions the candidate must confirm. Truthfulness attestation: "I confirm the information I submit is accurate" (logged). Optional `CS-*` upgrades (e.g. let this employer open artefact files) are separate, unticked toggles that create per-employer grants (SPEC-02).

#### 3.3 Submit (FEAT-10-02) — idempotent

`POST /me/applications/{id}/submit` with `Idempotency-Key`. In one transaction:

1. Replay check: same key+payload ⇒ return stored response; same key different payload ⇒ `422` (BR-T114).
2. DT-05 rows 3–9 evaluated under a **share lock on the job row** (INV-T44) and the unique-index guard (INV-T21).
3. Build **snapshot** (§3.4); set state `draft → submitted` (SM-APPLICATION t1); write audit; outbox `application.submitted`.
4. Return `201` with receipt `{applicationId, submittedAt, snapshotId, nextSteps}`.
   Duplicate clicks and two devices racing resolve to one submission; the loser receives the same or `409 already_submitted` carrying the winner's id.
   After commit: notify hiring team (in-app + email per prefs), notify candidate (receipt), trigger match compute for the pair (SPEC-08), index for recruiter queue.

#### 3.4 Evidence snapshot (FEAT-10-14)

Immutable record (INV-T28) of: profile fields visible to applications, selected evidence items (title, description, skills, **rung and provenance summary at submit**, artefact references), work claims with verification states, résumé variant rendered to PDF at submit time, answers, cover note, `MatchResult` at submit, consent scopes applied, policy versions. At read time the viewer sees the snapshot **plus overlays**: current status of each evidence item (`revoked`/`withdrawn` markers; BR-T039) and live items only if consent still live (DT-01 row 4). Retention: while application active + {12 months} after terminal state (BR-T062, OPEN-08), then deleted or anonymised per org policy.

#### 3.5 Withdraw & re-apply (FEAT-10-03)

`POST /me/applications/{id}/withdraw` (optional reason): allowed from any non-terminal state including `draft`; cancels open interviews, notifies the team, ends team access to live items (snapshot stays until retention end unless the candidate also requests erasure). Re-apply to the same job after `withdrawn` is allowed while the job is `published` (creates a new application linked `previous_application_id`); after `rejected` it is not allowed except via recruiter invitation (BR-T001 exception).

#### 3.6 Status tracker (FEAT-10-04)

Candidate sees a timeline from SM-APPLICATION events: submitted → in review → shortlisted → interviewing → offer → outcome, with the org's stage label next to the canonical state and a plain-language note for rejections (reason category and optional recruiter feedback). If `stale` (no activity 45 d) the candidate may "ask for an update" (1 per 14 d), which notifies the team. No state changes automatically (INV-T09).

#### 3.7 Postconditions

Exactly one active application per (candidate, job); snapshot exists iff state ≠ `draft`; every state change has audit + outbox; submit response replays identical bytes for the same key.

### 4. User interaction

SCR-APPLY (stepper: questions → evidence → review & consent → submit): autosave status ("Saved"/"Saved on this device — will sync"), keyboard-first, one task per screen on mobile, progress retained on refresh; SCR-APPLY-RECEIPT; SCR-MY-APPLICATIONS (tabs: active/closed, filters, sort by last update); SCR-APPLICATION-DETAIL (timeline, messages link, interview items, withdraw with confirm). Error handling: field-level errors with focus; duplicate-application error links to the existing one. Accessibility: confirmation dialogs focus-trapped; timeline has text alternatives.

### 5. Backend behavior

`api/applications` public interface: `applications.submit`, `applications.getForViewer(principal, id)` (applies DT-01 + overlays). Dependencies via interfaces: `evidence.getForViewer`, `profile.getApplicationView`, `privacy.recordApplicationConsent`, `matching.getMatch`. Idempotency middleware (FEAT-24-03) stores `(principal, route, key) → response` for 24 h. Partial unique index: `UNIQUE (candidate_id, job_id) WHERE state IN ('draft','submitted','in_review','shortlisted','interviewing','offer_extended')`.

| Endpoint (provisional)           | Method                     |
| -------------------------------- | -------------------------- |
| `/jobs/{id}/applications`        | POST (create-or-get draft) |
| `/me/applications`               | GET list                   |
| `/me/applications/{id}`          | GET                        |
| `/me/applications/{id}/draft`    | PUT (If-Match)             |
| `/me/applications/{id}/submit`   | POST (Idempotency-Key)     |
| `/me/applications/{id}/withdraw` | POST                       |
| `/me/applications/{id}/nudge`    | POST                       |

### 6. Data

| Entity                 | Key fields                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `application`          | id, candidate_id, job_id, org_id, state, version, org_stage_id, submitted_at, previous_application_id, stale, terminal_at |
| `application_draft`    | application_id, answers, evidence_ids, cover_note, resume_variant_id, contact_visibility, base_version, updated_at        |
| `application_snapshot` | id, application_id, payload (encrypted), payload_hash, created_at                                                         |
| `application_event`    | application_id, from_state, to_state, actor_id, actor_kind, reason, at                                                    |
| `idempotency_record`   | principal, route, key, request_hash, response, expires_at                                                                 |
| Retention per BR-T062. |

### 7. States and transitions

SM-APPLICATION t1 (submit), t9 (withdraw), plus read-only exposure of later states. Forbidden: edit after submit; submit while job not `published`; reject by system.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Performance   | autosave p95 ≤ 150 ms; submit p95 ≤ 600 ms (snapshot + PDF render async-finalised: PDF attached ≤ 30 s later, snapshot hash covers inputs) |
| Reliability   | exactly-once visible effect under retries; no lost drafts across offline/online                                                            |
| Security      | per-record authz; snapshot encrypted at rest; recruiters cannot enumerate other jobs' applications                                         |
| Privacy       | only selected evidence shared; consent recorded with versions                                                                              |
| Accessibility | WCAG 2.2 AA; no timeouts that lose data                                                                                                    |
| Offline       | draft edits only (ADR-T10)                                                                                                                 |

### 9. Failure scenarios

| Scenario                                       | Expected behaviour                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| Submit request times out, client retries       | same key ⇒ same result; no duplicate                                      |
| Two devices submit simultaneously              | one `201`, other receives winner's id (`409`/`200` replay)                |
| Job closes between page load and submit        | `409 job_not_open`; draft retained 7 d                                    |
| Selected evidence revoked before submit        | submit blocked with list; candidate removes or replaces                   |
| Evidence revoked right after submit            | snapshot unchanged; recruiter overlay shows revocation                    |
| Candidate account suspended mid-draft          | submit `403`; draft kept                                                  |
| PDF render fails                               | snapshot still valid; PDF retried; recruiter sees HTML résumé until ready |
| Offline edit conflicts with newer server draft | conflict UI; user chooses per field                                       |
| Idempotency store unavailable                  | fail closed for submit (`503`), drafts continue locally                   |

### 10. Acceptance criteria

| AC          | Given                                                     | When                           | Then                                                                               | Type         |
| ----------- | --------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- | ------------ |
| AC-10-01-01 | no application exists                                     | create                         | one `draft`; second create returns same draft                                      | Idempotency  |
| AC-10-01-02 | edit on device A saved; device B edits stale              | PUT with old ETag              | `412` + server version                                                             | Concurrency  |
| AC-10-01-03 | offline edits queued, then online with newer server draft | sync                           | conflict UI; nothing silently overwritten                                          | Recovery     |
| AC-10-01-04 | draft idle 22 d / 23 d / 30 d                             | sweeper                        | no action / notice / deleted at 30 d                                               | Time         |
| AC-10-01-05 | job closes while draft open                               | candidate opens                | banner; submit disabled; draft retained until +7 d                                 | Edge         |
| AC-10-02-01 | complete draft, job published                             | submit                         | `201`; state `submitted`; snapshot; events; receipt                                | Happy        |
| AC-10-02-02 | same submit repeated with same key                        | submit                         | identical response; one snapshot                                                   | Idempotency  |
| AC-10-02-03 | same key, different body                                  | submit                         | `422 idempotency_conflict`                                                         | Negative     |
| AC-10-02-04 | existing active application for (candidate, job)          | create/submit another          | `409 already_applied` with link                                                    | Negative     |
| AC-10-02-05 | 10 parallel submits from 2 devices                        | race                           | exactly one submitted application                                                  | Concurrency  |
| AC-10-02-06 | job `paused`/`closed`                                     | submit                         | `409 job_not_open`                                                                 | Negative     |
| AC-10-02-07 | 21 evidence items selected                                | submit                         | `422`                                                                              | Boundary     |
| AC-10-02-08 | selected evidence revoked pre-submit                      | submit                         | blocked, list of items                                                             | Negative     |
| AC-10-02-09 | required job question unanswered                          | submit                         | `422` with question ids                                                            | Negative     |
| AC-10-02-10 | candidate selects no evidence                             | submit                         | allowed (profile-only) if job doesn't require; recruiter sees "no evidence shared" | Edge         |
| AC-10-02-11 | offline                                                   | open Review step               | Submit disabled with explanation                                                   | Offline      |
| AC-10-14-01 | submitted application                                     | candidate edits evidence title | snapshot unchanged (hash equal)                                                    | Immutability |
| AC-10-14-02 | evidence revoked after submit                             | recruiter opens                | overlay "Revoked on <date>" on that item                                           | Consistency  |
| AC-10-14-03 | candidate revokes consent to Org after submit             | recruiter opens                | snapshot visible per BR-T062 but live artefacts denied                             | Privacy      |
| AC-10-14-04 | recruiter of other org requests snapshot id               | GET                            | `404`                                                                              | IDOR         |
| AC-10-03-01 | withdraw from `interviewing`                              | withdraw                       | state `withdrawn`; interviews cancelled; team notified                             | Happy        |
| AC-10-03-02 | re-apply after `withdrawn` while job published            | create                         | new application with `previous_application_id`                                     | Happy        |
| AC-10-03-03 | re-apply after `rejected`                                 | create                         | `409 rejected_no_reapply` unless invited                                           | Negative     |
| AC-10-04-01 | no activity 45 d                                          | sweeper                        | `stale=true`; prompt; no state change                                              | Fairness     |
| AC-10-04-02 | candidate nudges twice in 14 d                            | second nudge                   | `429`                                                                              | Boundary     |
| AC-24-03-01 | idempotency record older than 24 h                        | replay                         | treated as new request (and DT-05 row 5 may then apply)                            | Boundary     |
| AC-24-07-01 | queued drafts exceed local storage quota                  | save                           | user warned; no silent loss                                                        | Recovery     |

### 11. Testing

Concurrency tests (parallel submits across connections), idempotency replay tests, snapshot immutability trigger test, overlay consistency tests, offline conflict e2e (Playwright with network emulation), cross-tenant canary on recruiter endpoints, consent-revocation timing tests, load test on submit bursts after a popular job posts. Visual check that preview equals snapshot render (golden snapshot).

### 12. Developer guidance

Build order: draft model → idempotency middleware → DT-05 → snapshot → submit → withdraw → tracker → offline queue. The preview and the snapshot must use the same render function. Pitfalls: building the snapshot from live data after commit; using application `state` without the partial unique index; treating `409` on duplicate as an error screen instead of a link to the existing application. Decisions pending: retention (OPEN-08), PDF rendering approach, whether to allow multiple concurrent applications to different jobs of one org (allowed by default).

### 13. Related

`STATE_MACHINES.md` SM-APPLICATION · `DECISION_TABLES.md` DT-05, DT-01 · `BUSINESS_RULES_REGISTRY.md` BR-T001, T038, T039, T062, T114, T117 · SPEC-02, SPEC-03, SPEC-08, SPEC-10.

---

## SPEC-10 Pipeline Stage Change & Interview Scheduling

**Metadata:** Doc ID SPEC-10 · Owner: Hiring PM · Version 1.0 · Status Under Review · Phase 1 (stage moves, rejection) / Phase 2 (interviews, scorecards) · Priority P0 / P1 · Features: FEAT-10-05, FEAT-10-06, FEAT-10-07, FEAT-10-08, FEAT-23-03, FEAT-02-06 · Modules: MOD-HIR, MOD-OPP · `api/applications`, `api/integrations`, `apps/worker`, `api/notify` · Relates: SM-APPLICATION, SM-INTERVIEW, BR-T002, BR-T040, INV-T09, INV-T11, INV-T39

### 1. Business purpose

Give hiring teams a fast, auditable way to move candidates through stages and schedule interviews without double-bookings, while preserving candidate dignity: no automated rejection, clear communication, and recoverable mistakes. Value: GOAL-02 (time-to-shortlist), candidate response time, reduced no-shows.

### 2. Actors & access

| Actor                       | May                                                                                          | Policy action                                |
| --------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| ROLE-REC                    | move stages, reject, propose/cancel interviews, add notes/scorecards for jobs they belong to | `application:transition`, `interview:manage` |
| ROLE-HM                     | same for assigned jobs; offer permission per org setting                                     | `application:transition:assigned`            |
| ROLE-ORGADM                 | configure stages, view all org pipelines                                                     | `pipeline:configure`                         |
| viewer (org)                | read only                                                                                    | `application:read:job`                       |
| ROLE-CAND                   | choose/decline slots, request reschedule, contest no-show                                    | `interview:respond:own`                      |
| System                      | reminders, expiry, ICS dispatch                                                              | worker                                       |
| Service accounts (ROLE-SVC) | **cannot** perform `reject` (INV-T09)                                                        | —                                            |

### 3. Functional behavior

#### 3.1 Pipeline model

An org (or job) pipeline is an ordered list of **stages**; each stage has a `label` and maps to one **canonical state** of SM-APPLICATION (`in_review`, `shortlisted`, `interviewing`, `offer_extended`). Several stages may map to the same canonical state. Defaults: Screening→`in_review`, Shortlist→`shortlisted`, Interview→`interviewing`, Offer→`offer_extended`. Custom stage lists arrive in Phase 3 (FEAT-10-12); Phase 1 uses defaults.

#### 3.2 Stage change (FEAT-10-05)

`POST /applications/{id}/transition` body `{toStageId, reason?, expectedVersion}` with `If-Match`/Idempotency-Key.

1. Authorize (job team membership, INV-T02).
2. Map `toStageId` to canonical target; check SM-APPLICATION (allowed forward moves, skips t11, corrections t10 with `reason`); `hired` only via offer acceptance.
3. Version check: stale ⇒ `409 stale_version` + current state.
4. Write transition, audit (actor, reason, from/to stage), outbox `application.stage.changed`.
5. Notifications: candidate is notified for `interviewing`, `offer_extended`, `rejected`, `hired`; for `shortlisted` per org setting (default on); other moves silent. Notification copy is templated by canonical state to avoid inconsistent promises.
   Bulk moves (FEAT-10-11, Phase 3) apply the same checks per item with a per-item result list.

#### 3.3 Rejection (FEAT-10-06)

Two-step: `POST …/reject/preview` returns what will happen (candidate notification text, effects on interviews) and a short-lived `confirmToken` (5 min); `POST …/reject/confirm` with `{confirmToken, reasonCode, feedbackTemplateId?, message?}`.
`reasonCode` ∈ {`skills_not_matched`, `position_filled`, `eligibility`, `candidate_unresponsive`, `role_cancelled`, `other`}. `message` ≤ 1,000 chars, linted against protected-attribute terms (blocked with explanation). Actor must be `human` with permission; API tokens of service accounts get `403`. Effects: state `rejected`, open interviews cancelled, candidate notified ≤ 24 h with optional feedback and standard wording, hiring-team notes untouched. Bulk reject ≤ 50 per action with a summary confirm; each item individually audited (BR-T040). No automatic rejection exists anywhere, including "auto-close on job fill": closing a job notifies applicants but does not change application states (INV-T09; recruiters are prompted to resolve each).

#### 3.4 Interview scheduling (FEAT-10-07)

**Propose:** `POST /applications/{id}/interviews` `{slots[1..5] {start, durationMin 15–240}, interviewerIds[1..5], mode ∈ {video, phone, onsite}, location/link?, note?}`. Validation: application in `in_review`, `shortlisted` or `interviewing` (in_review → interviewing is an allowed skip, SM-APPLICATION t11); each slot starts ≥ 2 h from now and ≤ 60 d ahead; interviewers are job-team members; **no overlap** with the interviewer's other `scheduled` interviews (exclusion constraint, INV-T39) or the candidate's. Creating the first interview moves application to `interviewing` (SM-APPLICATION t4). Proposed slots are held 72 h (SM-INTERVIEW t1/t3).
**Choose:** candidate picks a slot; transaction re-checks overlap; success ⇒ `scheduled` (t2), ICS invites (METHOD:REQUEST, stable UID, SEQUENCE 0) to candidate and interviewers via email and calendar integration (FEAT-23-03), reminders 24 h and 1 h before (BR-T086: time-critical, ignore quiet hours). If a slot was taken, `409 slot_unavailable` with remaining alternatives.
**Reschedule** (either side, ≥ 2 h before start): creates a new `proposed` interview with `reschedule_of`, marks the old `rescheduled` (t4); ICS update with SEQUENCE+1 or CANCEL for the old UID as applicable.
**Cancel:** `scheduled/proposed → cancelled` with reason; ICS METHOD:CANCEL; counterpart notified.
**Complete:** after end time the scheduler marks `completed` unless a human marked `no_show`; triggers scorecard prompts.
**No-show:** marked only by a human within 48 h of start; the other party is notified and may contest (opens moderation-lite review for the org admin; no penalty automation).
**Time zones:** all times stored as UTC + IANA zone of the organiser; displayed in each viewer's zone with explicit offset; DST transitions handled by storing the instant, not wall time; slot picker warns when a slot falls outside the candidate's declared working hours.
**Calendar integrations (FEAT-23-03):** Phase 2 baseline = ICS attachment/links; direct Google/Microsoft calendar write is **[OPEN]**.

#### 3.5 Scorecards (FEAT-10-08)

Per interview, each interviewer completes a scorecard from a template (3–8 criteria, rating 1–4, comment ≤ 500, overall recommendation `strong_yes|yes|no|strong_no` — advisory only). **Blind until all required interviewers submit or 48 h pass**; editable 1 h after submit; never visible to candidates; no auto-ranking from scores (INV-T09).

#### 3.6 Side effects & postconditions

Events: `application.stage.changed`, `application.rejected`, `interview.proposed/scheduled/rescheduled/cancelled/completed/no_show`, `scorecard.submitted`. Postconditions: every state change auditable with actor and reason; no overlapping scheduled interviews for any person; terminal applications cannot receive new interviews.

### 4. User interaction

SCR-PIPELINE (Kanban columns per stage + list view; drag-and-drop with a keyboard alternative "Move to…" menu; card shows candidate, match band (advisory), days in stage, stale flag, next interview); move errors shown inline with refresh action; SCR-REJECT-CONFIRM (summary, reason, optional feedback, preview of candidate message); SCR-INTERVIEW-PROPOSE (calendar view of interviewer availability, drag to choose up to 5 slots, tz indicator); candidate SCR-INTERVIEW-CHOOSE (slots in local time with offset, add to calendar); SCR-SCORECARD. Mobile: recruiters can triage and confirm on phone; scheduling grid is list-based on narrow screens. Accessibility: drag-drop alternative, status changes announced, timezone text always visible.

### 5. Backend behavior

`api/applications` owns pipelines, applications, interviews, scorecards. Transition endpoint is the only writer of application state. Interview overlap enforced by a Postgres exclusion constraint on `(person_id, tstzrange)` for `scheduled` rows (hence INV-T39) plus transaction retry on serialization failure. ICS generation in `api/integrations`; dispatch via notify. Scheduler jobs: proposal expiry, reminders, auto-complete, stale flag, scorecard unblinding.

| Endpoint (provisional)                                                      | Method                            |
| --------------------------------------------------------------------------- | --------------------------------- |
| `/jobs/{id}/pipeline`                                                       | GET / PUT (Phase 3 customisation) |
| `/jobs/{id}/applications`                                                   | GET (job team; filters, sort)     |
| `/applications/{id}/transition`                                             | POST                              |
| `/applications/{id}/reject/preview`, `/reject/confirm`                      | POST                              |
| `/applications/{id}/interviews`                                             | POST / GET                        |
| `/interviews/{id}/choose`, `/reschedule`, `/cancel`, `/no-show`, `/contest` | POST                              |
| `/interviews/{id}/scorecards`                                               | POST / GET                        |

### 6. Data

| Entity                                                                                                                          | Key fields                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `pipeline`, `pipeline_stage`                                                                                                    | id, org/job, ordinal, label, canonical_state                                                                               |
| `application` (see SPEC-09)                                                                                                     | + stage_id, version                                                                                                        |
| `interview`                                                                                                                     | id, application_id, state (SM-INTERVIEW), start_utc, end_utc, tz, mode, location, uid, sequence, reschedule_of, created_by |
| `interview_slot`                                                                                                                | interview_id, start_utc, end_utc, held_until, chosen                                                                       |
| `interview_participant`                                                                                                         | interview_id, person_id, role (candidate/interviewer), response                                                            |
| `scorecard`                                                                                                                     | interview_id, interviewer_id, ratings, comment, recommendation, submitted_at, visible_at                                   |
| `application_note`                                                                                                              | application_id, author_id, body, mentions[] (team-only)                                                                    |
| Exclusion constraint: `EXCLUDE USING gist (person_id WITH =, tstzrange(start_utc, end_utc) WITH &&) WHERE state = 'scheduled'`. |

### 7. States and transitions

SM-APPLICATION t2–t11; SM-INTERVIEW t1–t7. Forbidden: jump to `hired`; moves on terminal applications; scheduling in the past; overlapping interviews.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Performance   | transition p95 ≤ 250 ms; pipeline board load p95 ≤ 600 ms for 500 applications; interview choose p95 ≤ 400 ms |
| Concurrency   | optimistic locking on applications; exclusion constraint for slots                                            |
| Security      | job-team scoped; IDOR tests; no candidate access to notes/scorecards                                          |
| Audit         | every transition and decision logged with actor kind                                                          |
| Reliability   | reminders and ICS dispatch idempotent per `(interview, kind)`                                                 |
| Accessibility | WCAG 2.2 AA; DnD alternative; time zone clarity                                                               |
| i18n          | date/time formatting per locale; ICS with locale-neutral content                                              |

### 9. Failure scenarios

| Scenario                                     | Expected behaviour                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Two recruiters move same card                | second gets `409 stale_version`; UI refreshes with current stage                                       |
| Candidate chooses slot that was just taken   | `409 slot_unavailable`; alternatives shown                                                             |
| Interviewer double-booked via another system | cannot be detected externally; platform conflict only; calendar integration (Phase 2) warns **[OPEN]** |
| ICS delivery bounces                         | in-app invite remains; recruiter alerted                                                               |
| DST change between proposal and interview    | instant stored in UTC; display adjusts; reminder times computed from instant                           |
| Job closed while interview pending           | interview proceeds; application remains; recruiter prompted to resolve                                 |
| Candidate withdraws with scheduled interview | interview cancelled with CANCEL ICS; interviewers notified                                             |
| Rejection notification fails                 | retried (SM-NOTIFY); rejection stands; failure surfaced to recruiter if dead-lettered                  |
| Bulk reject partially fails                  | per-item result list; no all-or-nothing hiding                                                         |
| No-show contested                            | org admin reviews; outcome recorded; status changed by human                                           |

### 10. Acceptance criteria

| AC          | Given                                                      | When                                        | Then                                                                 | Type               |
| ----------- | ---------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------- | ------------------ |
| AC-10-05-01 | application `in_review`, version 3                         | recruiter moves to Shortlist with version 3 | `shortlisted`; audit; event; candidate notified per setting          | Happy              |
| AC-10-05-02 | version 3 stale (actual 4)                                 | move                                        | `409 stale_version`                                                  | Concurrency        |
| AC-10-05-03 | move `shortlisted → submitted`                             | POST                                        | `409 invalid_transition`                                             | Negative           |
| AC-10-05-04 | move `in_review → hired`                                   | POST                                        | `409 invalid_transition`                                             | Negative           |
| AC-10-05-05 | HM not on job's team                                       | move                                        | `403`/`404`                                                          | IDOR               |
| AC-10-05-06 | terminal application                                       | move                                        | `409`                                                                | Negative           |
| AC-10-05-07 | `offer_extended → interviewing` without reason             | POST                                        | `422 reason_required`                                                | Negative           |
| AC-10-06-01 | recruiter requests reject preview                          | then confirm within 5 min with reason       | `rejected`; candidate notified ≤ 24 h; interviews cancelled          | Happy              |
| AC-10-06-02 | confirm without preview token or after 5 min               | confirm                                     | `409 confirm_required`                                               | Negative           |
| AC-10-06-03 | service-account token calls confirm                        | POST                                        | `403`                                                                | Security (INV-T09) |
| AC-10-06-04 | message contains protected-attribute term                  | confirm                                     | blocked with explanation                                             | Fairness           |
| AC-10-06-05 | bulk reject of 50 vs 51                                    | submit                                      | 50 accepted with summary confirm; 51 ⇒ `422`                         | Boundary           |
| AC-10-06-06 | job closes as filled                                       | system                                      | applicants notified; no application state changes automatically      | Fairness           |
| AC-10-07-01 | `shortlisted` application, 3 valid slots                   | propose                                     | interview `proposed`; application `interviewing`; candidate notified | Happy              |
| AC-10-07-02 | slot starting in 90 minutes                                | propose                                     | `422 slot_too_soon`; 2 h exactly accepted                            | Boundary           |
| AC-10-07-03 | slot overlaps interviewer's scheduled interview            | candidate chooses                           | `409 slot_unavailable`; no double booking                            | Concurrency        |
| AC-10-07-04 | two candidates choose same interviewer slot simultaneously | race                                        | exactly one `scheduled`                                              | Concurrency        |
| AC-10-07-05 | scheduled                                                  | invites                                     | ICS has stable UID, correct UTC time, organiser, METHOD:REQUEST      | Happy              |
| AC-10-07-06 | reschedule 3 h before start                                | request                                     | old `rescheduled`, new `proposed`, ICS SEQUENCE+1                    | Happy              |
| AC-10-07-07 | reschedule 1 h before start                                | request                                     | `409 too_late` (contact organiser)                                   | Boundary           |
| AC-10-07-08 | proposal unanswered 72 h                                   | sweep                                       | `expired`; recruiter notified                                        | Time               |
| AC-10-07-09 | interview crosses DST change                               | view in candidate zone                      | correct local time and offset                                        | Edge               |
| AC-10-07-10 | recruiter marks candidate no-show 49 h after start         | POST                                        | `409 window_closed`                                                  | Boundary           |
| AC-10-07-11 | candidate contests no-show                                 | POST                                        | review opened; no automatic penalty                                  | Fairness           |
| AC-10-07-12 | candidate withdraws application                            | interview scheduled                         | interview `cancelled` + CANCEL ICS                                   | Consistency        |
| AC-10-08-01 | two interviewers, one has submitted                        | other interviewer views peer scorecard      | hidden until both submit or 48 h                                     | Process            |
| AC-10-08-02 | candidate requests scorecard                               | GET                                         | `403`                                                                | Privacy            |
| AC-23-03-01 | ICS bounce                                                 | worker                                      | in-app invite stays; recruiter alerted                               | Recovery           |

### 11. Testing

Full SM-APPLICATION and SM-INTERVIEW matrices incl. forbidden pairs; concurrency tests for stale version and slot races with real DB; ICS conformance tests with common calendar parsers; time-zone/DST property tests; IDOR/cross-tenant canary; process test that no code path outside the transition service writes `state`; bulk-operation tests; accessibility tests for the board.

### 12. Developer guidance

Order: transition service + audit → pipeline UI → rejection flow → interview propose/choose with exclusion constraint → reminders/ICS → scorecards. Lint rule: only `applications.transition()` may update `application.state`. Pitfalls: storing wall-clock times without zone; treating drag-and-drop as the only way to move cards; sending ICS with changing UIDs; making "job filled" bulk-update applications. Decisions pending: external calendar sync scope, no-show policy window, whether HMs can reject (default: yes with confirm; org setting may restrict).

### 13. Related

`STATE_MACHINES.md` SM-APPLICATION, SM-INTERVIEW · `BUSINESS_RULES_REGISTRY.md` BR-T002, T040, T086 · `PRODUCT_INVARIANT_REGISTRY.md` INV-T39 · SPEC-09, SPEC-11 (messaging), SPEC-12 (entitlements for scheduling features).

### Contract links (patch 2026-10-27)

Evidence label: PROPOSED mapping. Every id below was grepped in its owner file on 2026-10-27; ids marked "none" do not exist and are OPEN. Owners: ACT-ATOM-nn in 07 ACTION_REGISTRY; FLD-* in 07 SCREEN_SPECIFICATIONS_KEY; EDG-nn in 06 BUSINESS_PROCESS_INVENTORY; XT-nn in 06 SSOT_WORKFLOW_CROSSWALK; UXH-nn in 07 PROGRESSIVE_UX_AND_FEEDBACK; audit.* in 14 SECURITY_ARCHITECTURE and 07; TEST-ACT-nnn in 07 ACTION_REGISTRY (not yet in TEST_CATALOG, OPEN-P04).

| SPEC                                             | ACT-ATOM                                           | Base ACT without atom             | FLD                      | EDG                    | XT   | UXH                    | audit events                                                                                                        | TEST                       | Contract gap                                                                                                |
| ------------------------------------------------ | -------------------------------------------------- | --------------------------------- | ------------------------ | ---------------------- | ---- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| SPEC-07 (FEAT-09-01..09-03, 09-05, 09-08, 02-03) | none                                               | ACT-HIRE-01, -02, -03, -04, -05   | none                     | EDG-02, EDG-06, EDG-09 | none | UXH-07                 | none                                                                                                                | none                       | OPEN-F07: publish, pause and close have no atomic contract, audit event or TEST                             |
| SPEC-08 (FEAT-11-01..11-03, 11-07, 11-08, 24-12) | none                                               | ACT-JOB-01, -02, -05 (read-only)  | none                     | EDG-06                 | none | UXH-01, UXH-05         | none                                                                                                                | none                       | OPEN-F08: read-only search; decide whether an atomic contract is needed or a UXH-only exemption is recorded |
| SPEC-09 (FEAT-10-01..10-04, 10-14, 24-03, 24-07) | ACT-ATOM-02 (submit), ACT-ATOM-03 (draft autosave) | ACT-APP-01, -04, -09, -10         | FLD-APP-01               | EDG-06, EDG-07, EDG-10 | none | UXH-03, UXH-07, UXH-08 | `audit.application.submitted`, `audit.application.draft_synced`                                                     | TEST-ACT-002, TEST-ACT-003 | none for submit and draft; withdraw (ACT-APP-04) has no atom                                                |
| SPEC-10 (FEAT-10-05..10-08, 23-03)               | ACT-ATOM-06 (stage move), ACT-ATOM-07 (bulk move)  | ACT-PIPE-05, -07; ACT-APP-05, -06 | FLD-PIPE-01, FLD-PIPE-02 | EDG-02, EDG-12         | none | UXH-01, UXH-03         | `audit.application.stage_changed`, `audit.application.bulk_move_completed`, `audit.application.bulk_move_cancelled` | TEST-ACT-006, TEST-ACT-007 | OPEN-F09: interview schedule and candidate confirm/reschedule have no atomic contract or audit event        |

## Feature Specifications — Group 5: Messaging, Billing, Data Rights, Institutions

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md`._

Doc ID: SPEC-G5 · Owner: Product Director + Messaging/Billing/Privacy/Institution leads · Version 1.0 · Status: Under Review · Relates: DOM-13, DOM-15, DOM-16, DOM-18, DOM-22, FEAT-13-01…13-06, FEAT-16-01…16-04, FEAT-16-07, FEAT-16-08, FEAT-16-11, FEAT-22-02, FEAT-22-03, FEAT-22-07, FEAT-18-01…18-04, FEAT-18-06, FEAT-18-07, SM-SUBSCRIPTION, SM-DSR, SM-ACCOUNT, DT-02, DT-08, DT-11, BR-T060…T066, BR-T080…T084, BR-T090…T097, BR-T100…T106, INV-T17, INV-T35, INV-T38, INV-T41, INV-T42, ADR-T15

Conventions: see `README.md`. Endpoints provisional under `/api/v1`. All **[TARGET]**; `{…}` **[OPEN]**. Stripe event names and statuses are cited from general knowledge of the processor and must be **re-verified against current Stripe documentation at build time [OPEN]**.

---

## SPEC-11 Messaging & Recruiter Outreach Quota

**Metadata:** Doc ID SPEC-11 · Owner: Messaging PM · Version 1.0 · Status Under Review · Phase 2 · Priority P0 · Features: FEAT-13-01, FEAT-13-02, FEAT-13-03, FEAT-13-05, FEAT-13-06, FEAT-16-11, FEAT-11-05 · Modules: MOD-MSG, MOD-HIR · `api/messaging`, `api/billing`, `api/safety`, `apps/worker` · Relates: DT-08, BR-T080…T084, INV-T40, INV-T42, SM-MODCASE, ADR-T10

### 1. Business purpose

Allow useful candidate–employer conversation while making unsolicited recruiter contact **consented, rate-limited and candidate-controlled**. Value: recruiter response speed, candidate trust, spam control; the quota is both the abuse brake and a plan lever (never a ranking lever).

### 2. Actors & access

| Actor              | May                                                                                               | Policy action                        |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| ROLE-CAND          | read/write own threads; accept/decline/block first contact; mute; report                          | `message:write:own`                  |
| ROLE-REC / ROLE-HM | message applicants of their jobs; send outreach within quota; read threads of own jobs            | `message:write:job`, `outreach:send` |
| ROLE-ORGADM        | read thread **metadata** (participants, timestamps) for org threads; no bodies unless on job team | `message:read:meta:org`              |
| ROLE-MOD           | read reported content via case snapshot                                                           | `message:read:case`                  |
| ROLE-SUP           | read under grant                                                                                  | `message:read:granted`               |
| ROLE-INSTADM/FAC   | none (BR-T105)                                                                                    | —                                    |

### 3. Functional behavior

#### 3.1 Conversation model

Thread types: `application` (created with an application or when a job-team member first messages an applicant; participants = candidate + job team) and `outreach` (created on acceptance of a first-contact request; participants = candidate + sender + sender-nominated colleagues, visible to the candidate). A thread belongs to exactly one candidate and one org (INV-T03).
Message: `body` 1–4,000 chars plain text with auto-linked https URLs (no HTML); attachments Phase 3 (scanned). Rate limits: 30 messages/min/user; 200 messages/day to distinct first-contact targets (quota separate, §3.3).
Edit: within 5 min, marked "edited"; delete = tombstone ("message deleted"), reported messages retained for review (BR-T084).

#### 3.2 Sending, delivery, offline (FEAT-13-01, 13-03)

`POST /threads/{id}/messages` with `clientMessageId` + `Idempotency-Key`; server dedupes on `(thread, clientMessageId)`. Real-time via SSE with polling fallback (15 s). **Offline compose queue:** composed messages are stored locally and shown as "Queued"; on reconnect each is sent in order. Revalidation at send time: thread still exists and is not blocked/archived, sender still authorised; queued > 24 h ⇒ user must confirm before send; rejected items return to composer with reason. Notifications: new-message notification per thread, collapsed to one email per thread per 10 min; push if enabled; quiet hours per BR-T086 (messages are not time-critical).

#### 3.3 Recruiter outreach (FEAT-13-02) — DT-08

`POST /outreach {candidateId, jobId?, templateId?, body ≤ 1,000}` with Idempotency-Key:

1. Authorise recruiter; candidate must be discoverable for contact (`outreach.recruiter_contact` live), org not blocked by candidate (INV-T40).
2. Evaluate DT-08: if candidate applied to this org's job ⇒ no outreach needed, use application thread.
3. **Quota:** decrement atomically — `UPDATE quota SET used = used + 1 WHERE subject = ? AND period = ? AND used + 1 <= limit`; zero rows ⇒ `409 quota_exceeded` with reset date (INV-T42; counter is derived/recomputable from requests). Quota is per org per period, allocated per plan and seats (DT-02b); display shows remaining.
4. Create `first_contact_request` (`pending`), 14-day expiry, notify candidate. **No quota refund** on expiry or decline (prevents spray-and-pray); a withdrawn request (sender cancels before candidate action) is refunded once.
5. Cooldown: after a decline, the same org cannot send another request to that candidate for 30 d (BR-T081).
   Candidate actions (FEAT-13-06): **Accept** (creates `outreach` thread, sender notified), **Decline** (optional reason code `not_interested|not_looking|wrong_role|other`; sender sees only "not interested"), **Block org** (BR-T083). Candidates may pause all outreach by revoking `outreach.recruiter_contact`; pending requests stay but cannot be answered by sender follow-ups.

#### 3.4 Block, mute, report (FEAT-13-05)

Block user/org: bidirectional; existing threads become read-only archived; candidate disappears from the blocked org's search/shortlist suggestions; org members see only "unavailable". Mute thread: suppresses notifications, thread remains. Report: attaches a frozen snapshot of the last 20 messages and metadata, opens SM-MODCASE; the reported party is not told who reported (BR-T048). Automated content classifiers may flag messages for review; they never delete or block by themselves (INV-T09).

#### 3.5 Metering (FEAT-16-11.2) and side effects

Events: `message.sent` (seed), `outreach.requested/accepted/declined/expired`, `thread.blocked`. Postconditions: first-contact count in a period equals quota counter (INV-T42); blocked pairs have no new messages.

### 4. User interaction

Candidate: SCR-INBOX (tabs: Messages · Requests), request card shows sender, org, role, message, **Accept / Decline / Block org**, one-tap "Pause outreach"; SCR-THREAD (bubbles with timestamps, participants header, report/mute/block menu). Recruiter: SCR-OUTREACH-COMPOSE (template picker, remaining quota "37 of 50 · resets 1 Nov", preview of what candidate sees), SCR-OUTREACH-LIST (pending/accepted/declined/expired with reasons as candidate allows). Accessibility: live region for new messages, keyboard send, no auto-play; mobile-first thread view. Offline: banner "Messages will send when you're back online".

### 5. Backend behavior

`api/messaging` owns threads/messages/requests/blocks; calls `privacy.hasConsent` and `billing.consumeQuota` via public interfaces; emits events to notify. Quota consumption is a single-statement conditional update inside the request-creation transaction; quota counters are rebuilt nightly from requests and compared (drift alert). SSE gateway authenticates with cookie session; per-user connection cap.

| Endpoint (provisional)                           | Method                        |
| ------------------------------------------------ | ----------------------------- |
| `/threads`, `/threads/{id}`                      | GET                           |
| `/threads/{id}/messages`                         | GET (cursor) / POST           |
| `/messages/{id}`                                 | PATCH (edit ≤ 5 min) / DELETE |
| `/outreach`                                      | POST (recruiter) / GET        |
| `/outreach/{id}/accept`, `/decline`, `/withdraw` | POST                          |
| `/blocks`                                        | POST/DELETE                   |
| `/threads/{id}/mute`, `/report`                  | POST                          |
| `/orgs/{org}/quota`                              | GET                           |

### 6. Data

| Entity                  | Key fields                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `thread`                | id, type, candidate_id, org_id, job_id?, state (`open`/`archived`), created_at                                                              |
| `thread_participant`    | thread_id, member_id, role, muted                                                                                                           |
| `message`               | id, thread_id, sender_id, client_message_id, body, created_at, edited_at, deleted_at                                                        |
| `first_contact_request` | id, org_id, sender_id, candidate_id, job_id?, body, state (`pending`/`accepted`/`declined`/`expired`/`withdrawn`), expires_at, decline_code |
| `block`                 | blocker_id (person or org), blocked_id, created_at                                                                                          |
| `quota_counter`         | subject (org), meter, period_start, limit, used (derived)                                                                                   |
| `report_snapshot`       | case_id, messages jsonb, created_at                                                                                                         |

### 7. States and transitions

First-contact request: `pending → accepted | declined | expired | withdrawn` (all terminal). Thread: `open → archived` (block, or application terminal + 90 d **[OPEN]**). Moderation: SM-MODCASE.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Performance   | send p95 ≤ 250 ms; delivery via SSE p95 ≤ 2 s                                                                         |
| Security      | per-thread authz; anti-enumeration of candidates; message bodies encrypted at rest                                    |
| Privacy       | counterpart sees only display name and role; contact details only by explicit share                                   |
| Abuse         | rate limits; quota; report flow; classifier flags (human decides)                                                     |
| Accessibility | WCAG 2.2 AA; live regions politely announced                                                                          |
| Offline       | compose queue per ADR-T10                                                                                             |
| Retention     | messages kept while participants' accounts exist + {12 months} after application end for hiring records **[OPEN-08]** |

### 9. Failure scenarios

| Scenario                                                 | Expected behaviour                                                           |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Duplicate send (retry)                                   | deduped by `clientMessageId`                                                 |
| Quota race: 2 recruiters, 1 remaining                    | exactly one succeeds; other `409 quota_exceeded`                             |
| Candidate blocks org while recruiter composing           | send fails with neutral "unavailable"; no leak that block exists beyond that |
| SSE connection drops                                     | client falls back to polling and resumes with last event id                  |
| Queued message after consent revoked                     | rejected on replay; returns to composer                                      |
| Mass-outreach pattern (≥ 100 requests/hour from one org) | throttle + case for review (flag-only)                                       |
| Candidate account deactivated                            | pending requests hidden; expire on schedule                                  |
| Report on a deleted message                              | snapshot already holds content; case proceeds                                |

### 10. Acceptance criteria

| AC          | Given                                              | When                     | Then                                                                                       | Type        |
| ----------- | -------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ | ----------- |
| AC-13-01-01 | submitted application                              | job-team member messages | `application` thread created; candidate notified                                           | Happy       |
| AC-13-01-02 | same `clientMessageId` sent twice                  | POST                     | one message                                                                                | Idempotency |
| AC-13-01-03 | message of 4,000 / 4,001 chars                     | POST                     | accepted / `422`                                                                           | Boundary    |
| AC-13-01-04 | user not in thread                                 | GET thread               | `404`                                                                                      | IDOR        |
| AC-13-01-05 | edit at 4:59 / 5:01 after send                     | PATCH                    | allowed / `409`                                                                            | Boundary    |
| AC-13-03-01 | offline, 3 messages queued                         | reconnect                | sent in order exactly once                                                                 | Recovery    |
| AC-13-03-02 | queued message when thread now blocked             | replay                   | rejected; text returns to composer                                                         | Edge        |
| AC-13-03-03 | message queued 25 h                                | reconnect                | asks user to confirm before sending                                                        | Boundary    |
| AC-13-02-01 | `outreach.recruiter_contact` live, quota available | outreach                 | request `pending`; quota −1                                                                | Happy       |
| AC-13-02-02 | no `outreach.recruiter_contact`                    | outreach                 | `403 no_consent` (DT-08 row 3)                                                             | Negative    |
| AC-13-02-03 | quota exhausted                                    | outreach                 | `409 quota_exceeded` with reset date                                                       | Negative    |
| AC-13-02-04 | quota 1, two concurrent requests                   | submit                   | exactly one succeeds; counter = limit                                                      | Concurrency |
| AC-13-02-05 | decline 10 days ago                                | same org outreach        | `409 cooldown` until day 30                                                                | Boundary    |
| AC-13-02-06 | request pending 14 d                               | sweep                    | `expired`; no refund                                                                       | Time        |
| AC-13-02-07 | sender withdraws before candidate acts             | withdraw                 | `withdrawn`; one refund only (second withdraw no-op)                                       | Idempotency |
| AC-13-02-08 | quota counter vs requests                          | nightly check            | equal; drift raises alert                                                                  | Consistency |
| AC-13-06-01 | candidate accepts                                  | accept                   | thread created; sender notified                                                            | Happy       |
| AC-13-06-02 | candidate declines with reason `wrong_role`        | decline                  | sender sees "not interested" only                                                          | Privacy     |
| AC-13-06-03 | candidate blocks org                               | block                    | all org members blocked; earlier threads archived                                          | Happy       |
| AC-13-05-01 | candidate blocked by org-side recruiter            | search                   | candidate absent for that org                                                              | Negative    |
| AC-13-05-02 | report with 20-message snapshot                    | submit                   | case opened; reporter hidden from subject; deleting messages later does not alter snapshot | Safety      |
| AC-13-05-03 | muted thread                                       | new message              | in-app unread increments; no email/push                                                    | Happy       |
| AC-16-11-04 | org plan without outreach                          | outreach                 | `403 entitlement`                                                                          | Negative    |
| AC-11-05-01 | recruiter search                                   | results                  | only candidates with live `search.discoverable` + not blocking org                         | Consent     |

### 11. Testing

DT-08 table tests (one per row); concurrency tests for quota; SSE reconnect tests; offline queue e2e; cross-tenant canary on thread endpoints; abuse simulation (burst outreach); notification collapse tests; accessibility audit of live regions.

### 12. Developer guidance

Order: threads/messages → application-thread auto-creation → blocks/reports → first-contact request → quota → SSE → offline queue. Pitfalls: counting quota in application memory; leaking "blocked" state through error text; sending email per message. Decisions pending: quota values (OPEN-05), message retention (OPEN-08), attachment scope.

### 13. Related

`DECISION_TABLES.md` DT-08, DT-01 · `BUSINESS_RULES_REGISTRY.md` BR-T080…T084 · SPEC-02 (consent) · SPEC-10 · SPEC-12.

---

## SPEC-12 Billing Checkout & Entitlement Derivation

**Metadata:** Doc ID SPEC-12 · Owner: Monetisation PM · Version 1.0 · Status Under Review · Phase 2 · Priority P0 · Features: FEAT-16-01, FEAT-16-02, FEAT-16-03, FEAT-16-04, FEAT-16-07, FEAT-16-08, FEAT-16-09, FEAT-16-11 · Modules: MOD-ACC · `api/billing`, `packages/policy`, `apps/worker` · Relates: ADR-T15, INV-T17, INV-T32, SM-SUBSCRIPTION, DT-02, BR-T090…T097

### 1. Business purpose

Take payment safely and translate it into exactly the access the buyer paid for — no more, no less — with the processor's signed word as the only authority. Value: GOAL-07 (sustainability), reduced fraud/support load, never charging for core candidate loop (BR-T091).

### 2. Actors & access

| Actor                   | May                                                            | Policy action                             |
| ----------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| ROLE-CAND               | buy candidate premium or paid courses; manage own subscription | `billing:buy:self`, `billing:manage:self` |
| ROLE-ORGADM / org_owner | buy org plans, manage seats, view invoices                     | `billing:manage:org`                      |
| other org roles         | read entitlement status                                        | `billing:read:org`                        |
| ROLE-INSTADM            | institution licence billing (SPEC-14, invoice-based)           | `billing:manage:institution`              |
| ROLE-SUP                | read billing status under grant; initiate refunds per policy   | `billing:read:granted`, `billing:refund`  |
| Stripe (system)         | signed webhooks                                                | `webhook:stripe`                          |

### 3. Functional behavior

#### 3.1 Catalogue (FEAT-16-01)

`plan {id, audience ∈ {candidate, org, institution}, name, interval ∈ {month, year}, stripePriceId, entitlements{}, seatBased, version, active}`. Entitlement keys (examples): `job_slots`, `seats`, `outreach_per_seat_month`, `verified_search_month`, `ai_credits_month`, `resume_variants`, `analytics_advanced`, `scheduling_tools`. Prices and tiers are **[OPEN-05]**; the catalogue is data, versioned; existing subscribers stay on their plan version until they change.

#### 3.2 Checkout (FEAT-16-02) — redirect grants nothing

`POST /billing/checkout {planId, quantity?}` + Idempotency-Key:

1. Authorise buyer for the billing subject (self or org).
2. If an active subscription for the same audience/plan family exists ⇒ `409 already_subscribed` with portal link.
3. Create local `checkout_attempt (pending)` and a Stripe Checkout Session with `client_reference_id = billing_subject_id`, metadata `{checkoutAttemptId, planId}`, success/cancel URLs. Return `{url}`.
4. Return page `/billing/return?attempt=<id>`: **informational only**; polls `GET /billing/status` until the local subscription state reflects the webhook (max 2 min), then shows result; at timeout shows "still processing — we'll email you".
   Card data never touches the platform.

#### 3.3 Webhook processing (FEAT-16-03) — authority

`POST /webhooks/stripe`: (a) verify signature on the raw body against the current and, during rotation, the previous endpoint secret, tolerance 5 min; invalid ⇒ `400`, alert on rate; (b) insert `stripe_event(event_id)` — unique violation ⇒ already processed ⇒ `200`; (c) for subscription/invoice events, **fetch the current object from the processor** (or use `created` ordering) and apply only if its version/timestamp ≥ stored `processor_version` (out-of-order safe); (d) transition SM-SUBSCRIPTION; (e) write entitlement snapshot; (f) outbox `entitlement.changed`; (g) respond `200` quickly, heavy work async. Unknown event types are stored and ignored. Failures return `5xx` so the processor retries; poison events dead-lettered after 5 internal failures with alert (SM-BGJOB).
Handled event families (illustrative; re-verify at build): `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created`.
Daily **reconciliation**: list processor subscriptions changed in the last 48 h and compare with local state; differences are applied via the same handler and reported.

#### 3.4 Entitlement derivation (FEAT-16-04)

`deriveEntitlements(subjectState, plan, adminGrants, now) → EntitlementSet` is a **pure function** implementing DT-02a/b (INV-T32). Results cached as `entitlement_snapshot {subject, set, version, derived_at}` and invalidated by `entitlement.changed`; consumers call `billing.can(subject, "job.publish")` or read the snapshot via the public interface — never subscription tables. Admin comps are explicit grants with expiry, reason and audit. Grace: `past_due` keeps full entitlements for {7} d (BR-T092) then degrades (DT-02a).

#### 3.5 Seats (FEAT-16-08), meters (FEAT-16-11)

Seat assignment: org admin assigns purchased seats to members; `assigned ≤ purchased`; lowering quantity below assigned requires unassign first (BR-T094). Meters: `ai_credits`, `outreach`, `verified_search` with `(subject, meter, period_start)` counters; consumption by conditional update (no overspend race); period = subscription billing period (free tier: calendar month); resets by period roll; exceeding ⇒ typed `409 quota_exceeded` — **no overage billing** (BR-T095). Free-tier AI = 0 paid inference (INV-T07).

#### 3.6 Dunning (FEAT-16-07)

On `invoice.payment_failed`: state `past_due`, notify billing contacts day 0, 3, 6 (mandatory transactional); day 7 degrade; recover on `invoice.paid` (restore instantly). Never delete data.

#### 3.7 Postconditions

Entitlements at any time = pure function of current state; no code path grants access from a redirect, a client claim or a cache older than invalidation (INV-T17/T32).

### 4. User interaction

SCR-PLANS (comparison; recommended plan marker never pushy; prices localised; currency shown; annual savings computed server-side), SCR-CHECKOUT-RETURN (processing/success/cancelled states, no premature "unlocked" copy), SCR-BILLING (current plan, status chip, next renewal, seats, meters with bars + text, invoices list, "Manage payment details" opening Stripe Customer Portal), SCR-SEATS, upgrade prompts at gates with explicit reason ("You've used 50 of 50 outreach requests; resets 1 Nov"). Accessibility: WCAG 2.2 AA; meters as text + progressbar semantics. Mobile-friendly checkout via processor.

### 5. Backend behavior

`api/billing` owns plans, subjects, subscriptions, snapshots, meters, events. Stripe access only through `PaymentProviderPort` (single adapter; ADR-T15). The webhook route is excluded from CSRF and cookie auth, protected by signature; IP allow-listing optional. Secrets from config; never logged (INV-T14). Entitlement reads must be < 5 ms (in-memory cache keyed by snapshot version).

| Endpoint (provisional) | Method                    |
| ---------------------- | ------------------------- |
| `/billing/plans`       | GET                       |
| `/billing/checkout`    | POST (Idempotency-Key)    |
| `/billing/status`      | GET                       |
| `/billing/portal`      | POST (returns portal URL) |
| `/billing/seats`       | GET/PUT                   |
| `/billing/usage`       | GET                       |
| `/webhooks/stripe`     | POST (signature)          |

### 6. Data

| Entity                                                         | Key fields                                                                                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `billing_subject`                                              | id, type (account/org/institution), processor_customer_id                                                                                       |
| `plan`, `plan_entitlement`                                     | see §3.1                                                                                                                                        |
| `checkout_attempt`                                             | id, subject_id, plan_id, state (`pending`/`completed`/`abandoned`), created_at                                                                  |
| `subscription`                                                 | id, subject_id, plan_id, plan_version, state (SM-SUBSCRIPTION), processor_id, current_period_start/end, cancel_at_period_end, processor_version |
| `stripe_event`                                                 | event_id (unique), type, received_at, processed_at, outcome                                                                                     |
| `entitlement_snapshot`                                         | subject_id, set jsonb, version, derived_at                                                                                                      |
| `entitlement_grant`                                            | subject_id, key, value, reason, granted_by, expires_at                                                                                          |
| `usage_meter`                                                  | subject_id, meter, period_start, limit, used                                                                                                    |
| `seat_assignment`                                              | subject_id, member_id, assigned_at                                                                                                              |
| `invoice_ref`                                                  | processor_invoice_id, subject_id, amount, currency, status, issued_at                                                                           |
| Retention of invoice records: legal requirement **[OPEN-08]**. |

### 7. States and transitions

SM-SUBSCRIPTION t1–t10. Forbidden: any transition from a browser request; applying an older processor object.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| Correctness   | exactly-once effect per event id; reconciliation drift = 0 target                                                   |
| Performance   | webhook ack p95 ≤ 300 ms; entitlement check ≤ 5 ms cached                                                           |
| Security      | signature verification; secret rotation procedure; PCI scope minimised (hosted checkout); no card data stored       |
| Availability  | checkout creation errors degrade gracefully; paid users keep entitlements if the processor is down (state is local) |
| Privacy       | billing identifiers separated from profile data; export includes own invoices                                       |
| Auditability  | every entitlement change traceable to an event or admin grant                                                       |
| Accessibility | WCAG 2.2 AA on plan/billing pages                                                                                   |

### 9. Failure scenarios

| Scenario                                | Expected behaviour                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| Customer pays, closes tab before return | webhook activates entitlements; email confirms                                           |
| Webhook delayed/failed                  | return page shows "processing"; reconciliation job repairs ≤ 1 h; no manual grant needed |
| Duplicate/replayed webhook              | idempotent (unique event id)                                                             |
| Events arrive out of order              | version/refetch rule yields correct final state                                          |
| Signature invalid                       | `400`; no state change; alert on spikes                                                  |
| Secret rotation                         | both secrets accepted during window; then old removed                                    |
| Double checkout click                   | one attempt per Idempotency-Key; `already_subscribed` for second subscription            |
| Downgrade below used job slots/seats    | change scheduled at period end or blocked with required actions; no data deletion        |
| Stripe API outage at checkout           | friendly error with retry; nothing charged                                               |
| Refund/dispute                          | state per events; access removal per policy; human review of disputes                    |
| Currency/tax mismatch                   | **[OPEN]** tax handling (FEAT-16-12) not specified                                       |

### 10. Acceptance criteria

| AC          | Given                                             | When                | Then                                                                       | Type               |
| ----------- | ------------------------------------------------- | ------------------- | -------------------------------------------------------------------------- | ------------------ |
| AC-16-02-01 | org admin picks plan                              | checkout            | session URL returned; `checkout_attempt` pending; no entitlement change    | Happy              |
| AC-16-02-02 | same Idempotency-Key twice                        | POST                | same session URL                                                           | Idempotency        |
| AC-16-02-03 | active subscription same family                   | checkout            | `409 already_subscribed`                                                   | Negative           |
| AC-16-02-04 | user hits success URL manually without payment    | open return page    | status stays processing/failed; entitlements unchanged                     | Security (INV-T17) |
| AC-16-02-05 | non-owner org member                              | checkout            | `403`                                                                      | Negative           |
| AC-16-03-01 | valid signed event                                | POST webhook        | `200`; state updated; `entitlement.changed`                                | Happy              |
| AC-16-03-02 | tampered body or wrong secret                     | POST                | `400`; nothing changed                                                     | Security           |
| AC-16-03-03 | event id seen before                              | POST                | `200`; no second effect                                                    | Idempotency        |
| AC-16-03-04 | `updated` event older than stored version         | process             | ignored                                                                    | Concurrency        |
| AC-16-03-05 | handler throws                                    | process             | `5xx` returned; processor retries; success later applies once              | Recovery           |
| AC-16-03-06 | webhook lost for 2 h                              | reconcile job       | local state corrected; report lists the drift                              | Recovery           |
| AC-16-04-01 | state `active`                                    | derive              | plan entitlements per DT-02                                                | Happy              |
| AC-16-04-02 | `past_due` day 6 vs day 8                         | derive              | full / degraded                                                            | Boundary           |
| AC-16-04-03 | `canceled`                                        | derive              | free tier; data intact                                                     | Happy              |
| AC-16-04-04 | any plan                                          | derive              | candidate core loop features always available (BR-T091)                    | Invariant          |
| AC-16-04-05 | admin comp with expiry                            | derive after expiry | comp absent                                                                | Time               |
| AC-16-04-06 | property test over random state/plan/grant combos | derive              | deterministic; monotone with plan tier; never grants key not in plan/grant | Property           |
| AC-16-07-01 | payment fails                                     | day 0, 3, 6         | three notices; no feature loss until day 7                                 | Process            |
| AC-16-08-01 | 5 seats, 5 assigned                               | reduce to 3         | `409` until 2 unassigned                                                   | Boundary           |
| AC-16-11-01 | 1 outreach left, two parallel consumes            | consume             | exactly one succeeds                                                       | Concurrency        |
| AC-16-11-02 | period rolls                                      | reset job           | counters reset once; replay safe                                           | Idempotency        |
| AC-16-11-03 | free-tier user triggers AI feature                | call                | deterministic fallback; no paid inference (INV-T07)                        | Cost               |
| AC-16-09-02 | paid course                                       | pay                 | enrolment activates from webhook only (SPEC-06)                            | Integration        |

### 11. Testing

Stripe test-mode integration suite using the processor's test fixtures; signed-payload fixtures for replay, tamper, out-of-order, duplicate; pure-function property tests for `deriveEntitlements`; concurrency tests on meters and seats; reconciliation tests with a fake provider; time-travel tests for grace; security test that no route mutates `subscription` except the webhook handler and admin grants.

### 12. Developer guidance

Build order: plans → `deriveEntitlements` + snapshot → webhook handler with event table → checkout → status page → portal → meters → seats → dunning → reconciliation. Pitfalls: trusting `client_reference_id` without matching a local attempt; computing entitlements ad hoc in feature code; using JSON body parsing before signature verification (raw body required). Decisions pending: pricing/tiers (OPEN-05), tax (FEAT-16-12), refund windows (OPEN-06), annual proration rules.

### 13. Related

`ADR_REGISTER.md` ADR-T15 · `STATE_MACHINES.md` SM-SUBSCRIPTION · `DECISION_TABLES.md` DT-02 · `BUSINESS_RULES_REGISTRY.md` BR-T090…T097 · SPEC-06, SPEC-07, SPEC-11.

---

## SPEC-13 Data Export & Erasure

**Metadata:** Doc ID SPEC-13 · Owner: Privacy PM · Version 1.0 · Status Under Review · Phase 1 · Priority P0 · Features: FEAT-22-02, FEAT-22-03, FEAT-01-10, FEAT-22-07 · Modules: MOD-ACC · `api/privacy` (orchestrator) + contributor interface in every module · Relates: SM-DSR, SM-ACCOUNT, DT-11, BR-T060, BR-T064…T066, INV-T35, INV-T38, INV-T43, OPEN-08

### 1. Business purpose

Give every person a trustworthy way to take their data with them and to leave completely, within defined time limits, without support heroics. Value: GOAL-06 (privacy), trust, regulatory posture (statutory specifics are **[OPEN-08]**; no legal claim is made).

### 2. Actors & access

| Actor                                      | May                                                                                   | Policy action                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------ |
| Data subject (any authenticated principal) | request export/erasure for self; cancel in allowed windows                            | `dsr:create:self`, `dsr:cancel:self` |
| ROLE-ORGADM                                | assist org employees' requests (Phase 3)                                              | `dsr:assist:org`                     |
| ROLE-SUP                                   | assist a locked-out subject after identity verification; cannot read archive contents | `dsr:assist` (grant-bound)           |
| ROLE-ADM                                   | replay failed jobs; place/lift legal hold                                             | `dsr:operate`, `legalhold:manage`    |
| ROLE-AUD                                   | read request metrics and receipts                                                     | `dsr:audit`                          |

### 3. Functional behavior

#### 3.1 Export (FEAT-22-02) — SM-DSR

Request: `POST /me/data-requests {type:"export"}` with Idempotency-Key; requires re-auth ≤ 5 min (BR-T057); one open request per type; ≤ 1 completed export per 24 h (BR-T064).
Archive contents (by category; each module registers an **export contributor**; CI fails if a module owning personal-data tables has none):

| Category                                                                                                                                                                                                                                                      | Included                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account                                                                                                                                                                                                                                                       | email addresses (verified status), created/last-seen dates, policy acceptances, passkey names (not keys), session list metadata                                                  |
| Profile                                                                                                                                                                                                                                                       | all profile fields, links, preferences, blocklist, résumé variants                                                                                                               |
| Evidence                                                                                                                                                                                                                                                      | items, provenance summaries, artefact files, revocation records about the subject                                                                                                |
| Verification                                                                                                                                                                                                                                                  | work claims, verification requests (no codes/tokens), referee requests the subject sent and the **outcomes** (not referee free text unless referee consented to share)           |
| Learning / assessment                                                                                                                                                                                                                                         | enrolments, progress, attempts, results, certificates                                                                                                                            |
| Applications                                                                                                                                                                                                                                                  | submitted answers, snapshots as submitted, status history, notes **visible to candidate** only                                                                                   |
| Messages                                                                                                                                                                                                                                                      | the subject's sent and received messages in their threads; counterpart identified by display name/role only                                                                      |
| Consents                                                                                                                                                                                                                                                      | full ledger                                                                                                                                                                      |
| Billing                                                                                                                                                                                                                                                       | invoices metadata, plan history (no card data)                                                                                                                                   |
| Notifications                                                                                                                                                                                                                                                 | preferences, delivery log                                                                                                                                                        |
| Access log                                                                                                                                                                                                                                                    | who accessed the subject's data (FEAT-22-04)                                                                                                                                     |
| Excluded                                                                                                                                                                                                                                                      | other people's personal data, fraud/abuse signals, moderation reporter identities, secrets, internal notes about the subject written by staff for security reasons **[OPEN-08]** |
| Format: ZIP with `manifest.json` (schema version, generated_at, categories, counts, sha256 per file), `data/*.json` (UTF-8), `files/` (artefacts), `README.txt` describing structure. Large archives split in parts ≤ 2 GB.                                   |
| Delivery: worker builds async; on completion the subject gets an email that **links to the authenticated Privacy page, not to the file**; download requires re-auth ≤ 5 min and uses a one-time signed URL (TTL 15 min); archive deleted after 7 d (BR-T064). |

#### 3.2 Erasure (FEAT-22-03)

1. **Request:** `POST /me/data-requests {type:"erasure"}`; screen lists consequences; requires re-auth and typing the account email; blocks with `409` if the subject is the **sole owner** of an organisation/institution (transfer or close first, FEAT-02-08) or has an open legal hold; for instructors with live courses the subject chooses _transfer_, _unpublish and keep learner access for 30 d_, or _remove_.
2. **Cooling-off (7 d):** SM-DSR `cooling_off`; account `pending_erasure` (SM-ACCOUNT t7): sessions revoked, profile hidden, search removed, scheduled jobs for the subject paused; sign-in leads only to a **Cancel erasure** page; reminder emails day 1 and 6. Cancel restores prior state (t8) and re-publishes profile if it was public.
3. **Execution (≤ 30 d from request, BR-T060):** orchestrator fans out `eraseContributor(subjectId, requestId)` to every module (idempotent, returns checkpoint). Sequence: (a) stop processing: revoke credentials, push tokens, share links; (b) billing: cancel subscriptions at period end or immediately per user choice, request deletion of the processor customer except legally retained records; (c) applications: withdraw active ones (employers are notified "candidate withdrew"); employer-held hiring records follow org policy/**[OPEN-08]**, with subject identifiers pseudonymised; (d) evidence/profile/learning/messages per DT-11; (e) referee data about the subject deleted; responses the subject gave **as a referee** for others are anonymised (attester becomes "former colleague") so others' verification does not silently collapse — a documented trade-off **[OPEN-08]**; (f) search index and caches purged; (g) analytics deleted or aggregated irreversibly; (h) billing records pseudonymised and retained (list in receipt); audit, consent and stage-transition history is **not rewritten**: it holds only the opaque `subject_ref`, and the orchestrator deletes the `subject_identity_map` row (and per-subject key) as the last contributor step, so those rows are retained as unlinkable records listed on the receipt (REVW-04, DB-02 §4.1); (i) object storage blobs deleted; (j) **verification sweep** (INV-T38): scans every store for the subject id, email hash and artefact hashes (opaque `subject_ref` tokens are excluded from the hit terms; instead it asserts that no identity-map row or key remains and that the audit/consent anchors covering the subject's rows still verify); any hit fails the request into `failed` for ops.
4. **Receipt:** email to the verified address plus on-screen page (while it exists) listing: what was deleted, what was retained and why, and the date. The receipt itself stores no personal data beyond a salted hash of the email, kept for {30 d} to answer follow-ups **[OPEN-08]**.
5. **Deactivation (FEAT-01-10)** is separate and reversible: profile hidden, alerts paused, data kept {12 months} **[OPEN]**; the UI explains the difference between deactivate and erase.

#### 3.3 Legal hold (FEAT-22-07)

Admins can place a hold on a subject with reason and case reference; the DSR moves to `on_hold` (SM-DSR t7); the subject is told only that a lawful restriction applies [OPEN-08]. Holds are reviewed monthly.

#### 3.4 Side effects & postconditions

Events: `dsr.requested`, `export.ready`, `erasure.requested`, `erasure.completed` (seed), `account.erased`. Postconditions: INV-T38 after completion; an audit trail of the request (not of personal content) persists.

### 4. User interaction

SCR-PRIVACY-HOME (export, erase, consents, access log, deactivate); SCR-EXPORT-STATUS (queued/building/ready with expiry countdown; failure message with retry); SCR-ERASE-WARN (plain-language consequences, checkbox per irreversible item, typed confirmation), SCR-ERASE-PENDING (countdown, cancel button prominent), SCR-ERASE-RECEIPT. Copy avoids dark patterns: Cancel is as visible as Confirm. Accessibility: WCAG 2.2 AA; no timed controls beyond security re-auth; screen-reader friendly status updates.

### 5. Backend behavior

`api/privacy` hosts the orchestrator and the DSR state machine; modules implement `privacy.exportContributor` and `privacy.eraseContributor` in their public interface (FF-02). The orchestrator persists per-module checkpoints so a crash resumes without repeating destructive steps (idempotent deletes). Export builds stream data (no full in-memory) to object storage in a `dsr/` bucket with lifecycle expiry. SLA monitor alerts ops at day 20, 25 and 28 for any open erasure. Export and erase jobs run with a service identity limited to the subject's data (not general admin).

| Endpoint (provisional)             | Method                               |
| ---------------------------------- | ------------------------------------ |
| `/me/data-requests`                | POST create / GET list               |
| `/me/data-requests/{id}`           | GET status                           |
| `/me/data-requests/{id}/cancel`    | POST                                 |
| `/me/data-requests/{id}/download`  | POST (re-auth; returns one-time URL) |
| `/admin/legal-holds`               | POST/DELETE (ROLE-ADM)               |
| `/admin/data-requests/{id}/replay` | POST (audited)                       |

### 6. Data

| Entity                | Key fields                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `data_request`        | id, subject_id, type, state (SM-DSR), requested_at, deadline_at, verified_at, completed_at, outcome, receipt_ref |
| `dsr_checkpoint`      | request_id, module, step, status, at, detail_min                                                                 |
| `export_archive`      | request_id, object_key, size, sha256, expires_at, downloads                                                      |
| `legal_hold`          | id, subject_id, reason_code, case_ref, placed_by, placed_at, lifted_at                                           |
| `erasure_tombstone`   | email_hash_salted, request_id, expires_at                                                                        |
| `retained_record_ref` | request_id, store, category, legal_basis_note                                                                    |

### 7. States and transitions

SM-DSR t1–t10; SM-ACCOUNT t7–t9. Forbidden: cancelling an erasure in `in_progress`; marking `completed` without a clean sweep.

### 8. Non-functional requirements

| Area          | Requirement                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Timeliness    | export ready p95 ≤ 4 h for typical accounts (≤ 5 GB); erasure complete ≤ 30 d (target ≤ 10 d)          |
| Reliability   | resumable, idempotent; no partial-delete-without-record                                                |
| Security      | re-auth; archive encrypted at rest; one-time URLs; support cannot read archives; archive never emailed |
| Privacy       | exports exclude third-party personal data; receipts minimal                                            |
| Completeness  | contributor coverage enforced by CI lint; sweep verifies                                               |
| Accessibility | WCAG 2.2 AA; plain-language                                                                            |
| Cost          | archive TTL 7 d; storage lifecycle                                                                     |

### 9. Failure scenarios

| Scenario                                           | Expected behaviour                                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Build crashes mid-export                           | job resumes from checkpoint; same request id; no duplicate archives                           |
| Archive link forwarded                             | useless: link requires authenticated session and re-auth                                      |
| Subject locked out                                 | support-assisted verification flow (documented, audited, human) before any request is created |
| Module contributor missing/failing                 | request `failed`; ops alert; deadline clock visible; replay after fix                         |
| Sweep finds residual data                          | request stays `in_progress`/`failed`; residual deleted by targeted job; sweep re-run          |
| Legal hold appears mid-erasure                     | execution pauses at next safe checkpoint (`on_hold`)                                          |
| Subject cancels during cooling-off                 | account restored; profile republished only if previously public                               |
| Subject re-registers with same email after erasure | allowed; no data linked; tombstone only blocks receipt replay                                 |
| Backups contain subject                            | restore procedure replays erasure log before serving; backups age out {35 d}                  |
| Employer disputes deletion of hiring record        | follows org policy/legal guidance [OPEN-08]; subject informed in receipt                      |

### 10. Acceptance criteria

| AC          | Given                                                    | When                                                                      | Then                                                                                                                        | Type             |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| AC-22-02-01 | authenticated, re-auth fresh                             | request export                                                            | `202`; request `received`; one open per type                                                                                | Happy            |
| AC-22-02-02 | stale re-auth                                            | request                                                                   | `403 reauth_required`                                                                                                       | Negative         |
| AC-22-02-03 | export 23 h after previous                               | request                                                                   | `429` until 24 h                                                                                                            | Boundary         |
| AC-22-02-04 | export built                                             | inspect archive                                                           | manifest lists categories/hashes; contains own data only; excludes counterpart emails, fraud signals, reporter identities   | Privacy          |
| AC-22-02-05 | email notification                                       | read email                                                                | contains no file link; contains link to authenticated page                                                                  | Security         |
| AC-22-02-06 | download                                                 | POST download without re-auth                                             | `403`; with re-auth one-time URL valid ≤ 15 min                                                                             | Security         |
| AC-22-02-07 | archive older than 7 d                                   | sweep                                                                     | deleted; status `expired`                                                                                                   | Time             |
| AC-22-02-08 | a new module with personal-data table and no contributor | CI                                                                        | build fails                                                                                                                 | Fitness function |
| AC-22-02-09 | worker killed during build                               | restart                                                                   | resumes; one archive                                                                                                        | Recovery         |
| AC-22-03-01 | sole owner of org                                        | erase                                                                     | `409 transfer_ownership_first`                                                                                              | Negative         |
| AC-22-03-02 | valid request                                            | confirm                                                                   | state `cooling_off`; account `pending_erasure`; sessions revoked; profile not publicly visible                              | Happy            |
| AC-22-03-03 | day 3 of cooling-off                                     | cancel                                                                    | account restored; request `cancelled`                                                                                       | Happy            |
| AC-22-03-04 | day 7 reached                                            | worker                                                                    | `in_progress`; cancel now `409`                                                                                             | Boundary         |
| AC-22-03-05 | execution completes                                      | sweep                                                                     | zero hits for subject id/email hash/artefact hashes in all stores (INV-T38)                                                 | Invariant        |
| AC-22-03-06 | request day 29 not complete                              | monitor                                                                   | alert raised day 20/25/28; day 30 breach recorded as incident                                                               | Time             |
| AC-22-03-07 | retained billing/audit records                           | receipt                                                                   | lists categories and reason; billing records pseudonymised, audit/consent history unlinkable (opaque refs, mapping deleted) | Transparency     |
| AC-22-03-08 | active applications at erase                             | execute                                                                   | withdrawn; employers notified; snapshots handled per policy                                                                 | Process          |
| AC-22-03-09 | subject was referee for others                           | execute                                                                   | attester anonymised; others' claims keep rung                                                                               | Edge             |
| AC-22-03-10 | legal hold placed                                        | execute                                                                   | `on_hold`; subject sees generic notice                                                                                      | Edge             |
| AC-22-03-11 | duplicate erase submit                                   | POST twice                                                                | single request                                                                                                              | Idempotency      |
| AC-22-03-12 | same step executed twice after crash                     | resume                                                                    | idempotent; no error                                                                                                        | Recovery         |
| AC-22-03-13 | execution completes                                      | run audit/consent anchor verifier over ranges covering the subject's rows | all anchors verify; no history row changed; identity-map row and key are gone (TEST-PRV-009)                                | Invariant        |
| AC-01-10-01 | deactivate                                               | confirm                                                                   | profile hidden; sign-in within window reactivates                                                                           | Happy            |
| AC-22-07-01 | admin lifts hold                                         | lift                                                                      | DSR resumes automatically                                                                                                   | Process          |

### 11. Testing

SM-DSR matrix; contributor conformance test per module (export completeness vs schema; erase idempotency); end-to-end fixture account with data in every store, then erase and run the sweep; time-travel tests for cooling-off and SLA alerts; security tests for archive access; fault injection (kill worker at each step); restore-from-backup drill replays erasure log.

### 12. Developer guidance

Order: DSR state machine → contributor interface + CI lint → export → erase orchestrator + sweep → legal hold → UI. Keep erase steps idempotent and checkpointed. Pitfalls: forgetting derived stores (search index, caches, analytics), emailing archive links, treating soft-delete as erasure. Decisions pending: **OPEN-08** retention list, backup age-out, statutory timelines, employer-held record treatment; **OPEN-09** minors.

### 13. Related

`STATE_MACHINES.md` SM-DSR, SM-ACCOUNT · `DECISION_TABLES.md` DT-11 · `BUSINESS_RULES_REGISTRY.md` BR-T060…T066 · SPEC-01, SPEC-02, SPEC-14.

---

## SPEC-14 Institution Cohort Onboarding & Graduation

**Metadata:** Doc ID SPEC-14 · Owner: Institutions PM · Version 1.0 · Status Under Review · Phase 3 · Priority P1 · Features: FEAT-18-01, FEAT-18-02, FEAT-18-03, FEAT-18-04, FEAT-18-06, FEAT-18-07, FEAT-22-01 (`alumni.share_outcomes`) · Modules: MOD-ADM (institution workspace), MOD-SHELL · `api/institutions`, `api/verification`, `api/evidence`, `api/billing`, `apps/worker` · Relates: DOM-18, BR-T100…T106, INV-T41, DT-01, OPEN-09

### 1. Business purpose

Let institutions bring a cohort into the platform, see **aggregate** skill coverage without seeing private job-search data, issue verifiable credentials, and hand learners their career identity intact at graduation. Value: GOAL-05, cold-start supply of learners, B2B2C revenue.

### 2. Actors & access

| Actor                                                                                                              | May                                                                                                | Policy action       |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------- |
| ROLE-INSTADM                                                                                                       | manage institution, faculty, cohorts, rosters, licences; view aggregates; issue credentials        | `inst:admin`        |
| ROLE-FAC                                                                                                           | cohorts/courses assigned only; view aggregates and own-course work; issue credentials if delegated | `inst:faculty`      |
| proctor                                                                                                            | Phase 4                                                                                            | —                   |
| ROLE-CAND (learner)                                                                                                | claim/decline invite; manage own consents; keep identity after graduation                          | `cohort:claim:self` |
| ROLE-ADM                                                                                                           | create institution tenant, verify, suspend                                                         | `inst:provision`    |
| ROLE-SUP                                                                                                           | grant-bound reads                                                                                  | —                   |
| Institution principals never read applications, saved jobs, messages or consents beyond their own scope (BR-T105). |

### 3. Functional behavior

#### 3.1 Onboarding (FEAT-18-01)

Platform admin creates an institution tenant (`pending`), records contract and licence reference, and verifies the institution (domain proof and a named signatory **[OPEN]**); state `active`. A bootstrap admin invite (hashed token, TTL 7 d, single-use) is sent to the signatory's institutional address; the admin must enable MFA before first use (BR-T044 spirit). Admin adds faculty (roles `inst_admin`, `faculty`), programmes and cohorts. Tenant isolation by `institution_id` with RLS (INV-T03).

#### 3.2 Cohort and roster import (FEAT-18-02)

Cohort: `{name 1–120, programme, startDate, graduationDate (> startDate), seatPoolId, sizeLimit}`.
CSV columns: `email` (required), `given_name`, `family_name`, `student_id` (optional), `cohort` (name/id). Limits: ≤ 2,000 rows/file, UTF-8, ≤ 2 MB. **Dry run** returns a report: valid, duplicates (normalised email within file and already in cohort), invalid emails, role-conflicts (email already an institution staff member), rows flagged for age (if the institution supplies a date of birth column, under-age rows are blocked pending OPEN-09, BR-T106), seat shortfall. Nothing is created until the admin confirms. Confirm creates `cohort_member` rows in state `invited_pending` — **no learner accounts or profiles are created** (BR-T101).

#### 3.3 Invitation and claim (FEAT-18-03)

Invites are sent in rate-limited batches (≤ 200/min) from the product's verified sender; token ≥ 128-bit hashed, TTL 14 d, single-use; reminder once at day 7; bounces reported to admin. Claim flow: (a) invitee already signed in with matching verified email ⇒ link; (b) signed in with a different email ⇒ add and verify the invited email, then link; (c) no account ⇒ register with the invited email pre-filled; clicking the invite proves mailbox control, so no second code is required **[TARGET; OPEN to security review]**. Before accepting, the learner sees a plain-language **consent screen** stating what the institution will and will not see (course progress and credentials in institution courses, aggregates; **not** applications, saved jobs, messages) and can **decline** (`declined`). A claim consumes one licence seat (not at import). The learner owns the account; the institution can never edit or delete the learner's evidence or profile (BR-T102).

#### 3.4 Cohort member states

| State                                   | Meaning                                                 |
| --------------------------------------- | ------------------------------------------------------- |
| `invited_pending`                       | Imported, invite not yet sent or not accepted           |
| `claimed`                               | Linked to a learner account; seat consumed              |
| `declined`                              | Learner declined; seat free; admin sees only "declined" |
| `expired`                               | Invite lapsed (14 d); can be re-invited                 |
| `graduated`                             | Graduation date reached; institution access sunset      |
| `left`                                  | Removed by admin or learner leaves early; same sunset   |
| Transitions: `invited_pending → claimed | declined                                                | expired`; `expired → invited_pending`(re-invite);`claimed → graduated | left`; `declined → invited_pending`(admin re-invites only after 30 d). Terminal:`graduated`, `left` (re-enrolment creates a new membership). |

#### 3.5 Cohort dashboard (FEAT-18-04)

Metrics: for target skills (from programme competency map), the count of claimed learners with skill confidence ≥ threshold, rung distribution per skill, course progress distribution, assessment pass rates, evidence count distribution. **Small-cell suppression:** any cell with n < {5} is hidden (BR-T100, INV-T41). No per-learner rows except (i) institution-issued credentials and (ii) work inside institution courses by faculty with a course assignment. Exports are aggregate CSV only. Learners can see what contributes to their cohort's aggregates.

#### 3.6 Institution-issued credentials (FEAT-18-06)

Authorised staff issue `institution_credential` evidence to a **claimed** learner (title, programme, date, optional grade), via the evidence issuer API (SPEC-03) at `authority_verified`. Only the issuing institution may revoke, with reason (BR-T102); the learner may hide a credential from recruiters (visibility) but cannot alter or delete issued content except by erasure of their account (the credential then disappears with it, but the institution retains its issuance record per its own policy **[OPEN-08]**). Verification link for third parties shows credential status without personal data beyond what the learner shares.

#### 3.7 Graduation (FEAT-18-07)

At the cohort's `graduationDate` (institution time zone, 00:00), the scheduler sets `claimed → graduated` and enqueues sunset: within 24 h institution access to individual-level data ends (except issued credentials and aggregates). Prior: reminders T−30 d and T−7 d to learners to **add and verify a personal email** (institutional addresses may be deprovisioned) and to review sharing. On graduation the learner receives "Welcome, alumni" with choices: keep everything (default), opt in to `alumni.share_outcomes` outcome sharing (specific fields chosen by the learner), convert licensed premium features to free tier (entitlements derive from the institution seat ending, SPEC-12). The learner's career identity — profile, evidence, applications, messages — is unchanged. Graduation date edits are allowed until the day before; afterwards only by platform admin with audit.

#### 3.8 Side effects & postconditions

Events: `institution.activated`, `cohort.created`, `roster.imported`, `cohort.member.claimed`, `cohort.member.graduated`, `credential.issued`, `credential.revoked`. Postconditions: INV-T41; seats consumed = number of `claimed` members; after graduation no institution principal can read individual-level learner data other than issued credentials.

### 4. User interaction

Institution workspace (MOD-ADM): SCR-INST-SETUP (stepper), SCR-COHORTS, SCR-ROSTER-IMPORT (upload → dry-run report with row-level errors downloadable → confirm), SCR-INVITES (status per member, resend/expire), SCR-COHORT-DASH (charts with data tables and suppression notices "fewer than 5 learners — hidden"), SCR-CREDENTIALS. Learner: SCR-INVITE-LANDING (institution name, what is shared, Accept/Decline), SCR-COHORT-PRIVACY (view and withdraw), SCR-ALUMNI-WELCOME. Accessibility: WCAG 2.2 AA; charts have text equivalents; CSV import accessible with error list. Offline: not applicable to admin workflows.

### 5. Backend behavior

`api/institutions` owns institutions, cohorts, members, imports, invites. Dashboards are computed from derived, pre-aggregated tables updated by workers (not by querying learner tables directly), applying suppression in SQL views so that no code path can bypass it. Cross-module reads use public interfaces (`skills.getConfidenceAggregate`, `learning.getProgressAggregate`). Credential issuance calls `evidence.issue` with the institution service identity. Scheduler jobs: invite batches/reminders/expiry, graduation, reminders T−30/T−7, aggregate refresh (hourly), sunset enforcement.

| Endpoint (provisional)                                        | Method                                                |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `/admin/institutions`                                         | POST (ROLE-ADM)                                       |
| `/institution/cohorts`                                        | POST/GET                                              |
| `/institution/cohorts/{id}/roster/dry-run`, `/roster/confirm` | POST                                                  |
| `/institution/cohorts/{id}/invites`                           | POST (send)                                           |
| `/invites/{token}`                                            | GET (landing, side-effect free) / POST accept/decline |
| `/institution/cohorts/{id}/dashboard`                         | GET (aggregates)                                      |
| `/institution/credentials`                                    | POST issue / POST revoke                              |
| `/me/cohorts`                                                 | GET / DELETE (leave)                                  |

### 6. Data

| Entity                                                                                  | Key fields                                                                                            |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `institution`                                                                           | id, name, state (`pending`/`active`/`suspended`), domain, contract_ref, licence_seats, tz             |
| `institution_member`                                                                    | institution_id, account_id, role (`inst_admin`/`faculty`), mfa_required                               |
| `cohort`                                                                                | id, institution_id, name, programme_id, start_date, graduation_date, size_limit, seat_pool_id         |
| `cohort_member`                                                                         | id, cohort_id, email_hash, account_id?, state, invited_at, claimed_at, graduated_at, source_import_id |
| `roster_import`                                                                         | id, cohort_id, uploaded_by, rows, valid, duplicates, invalid, state                                   |
| `invite`                                                                                | id, cohort_member_id, token_hash, expires_at, reminded_at, consumed_at                                |
| `agg_cohort_skill`                                                                      | cohort_id, skill_id, n, n_above_threshold, rung_dist (suppressed views)                               |
| `credential_issuance`                                                                   | id, institution_id, evidence_id, issued_by, revoked_at, reason                                        |
| Roster emails stored encrypted + hashed; unclaimed rows deleted after {90 d} of expiry. |

### 7. States and transitions

Cohort member states §3.4; institution `pending → active → suspended`; credentials per SM-EVIDENCE; invite tokens like SM-REFERENCE patterns (single-use, expiry). Forbidden: institution editing learner evidence; accessing individual rows after graduation.

### 8. Non-functional requirements

| Area          | Requirement                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Scale         | roster ≤ 2,000 rows/file; import dry-run p95 ≤ 10 s; invite throughput ≤ 200/min                                            |
| Security      | tenant RLS; MFA for institution admins; hashed tokens; CSV injection hardening on export (prefix `'` for leading `= + - @`) |
| Privacy       | k ≥ 5 suppression in DB views; learner consent screen; no job-search data                                                   |
| Reliability   | graduation job idempotent; sunset verified by sweep                                                                         |
| Auditability  | roster uploads, invites, credential issue/revoke, graduation changes audited                                                |
| Accessibility | WCAG 2.2 AA; import errors screen-reader friendly                                                                           |
| i18n          | names with non-ASCII; date formats; institution time zone                                                                   |

### 9. Failure scenarios

| Scenario                                            | Expected behaviour                                                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate emails in file or across cohorts          | flagged in dry run; one membership per (cohort, email)                                                                                                                                                  |
| Learner already has an account on a different email | claim flow adds and verifies the invited email                                                                                                                                                          |
| Invite forwarded to someone else                    | token binds to invited email; claim requires matching verified email unless via invite mailbox proof, which only the recipient controls; forwarded link attempts by another logged-in email are refused |
| Invite bounces                                      | admin sees status; learner can be re-invited with corrected email                                                                                                                                       |
| Licence seats insufficient at claim                 | claim blocked "no seats"; admin notified; learner can retry; nothing lost                                                                                                                               |
| Graduation job misses a cohort                      | catch-up sweep on next run; lazy access check also denies after date                                                                                                                                    |
| Graduation date changed after passing               | platform admin with audit only                                                                                                                                                                          |
| Learner leaves early                                | `left`; same sunset                                                                                                                                                                                     |
| Institution suspended (non-payment)                 | institution workspace read-only 30 d then locked; learners unaffected                                                                                                                                   |
| Credential revoked by institution                   | evidence revoked per SM-EVIDENCE with reason; learner notified with appeal route to the institution and platform                                                                                        |
| Dashboard tiny cohort                               | everything suppressed; message explains why                                                                                                                                                             |
| Minor flagged                                       | row blocked; admin sees "requires review" (OPEN-09)                                                                                                                                                     |

### 10. Acceptance criteria

| AC          | Given                                                                    | When                         | Then                                                         | Type        |
| ----------- | ------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------ | ----------- |
| AC-18-01-01 | platform admin creates institution                                       | verify                       | `active`; bootstrap invite sent; token hashed, TTL 7 d       | Happy       |
| AC-18-01-02 | institution admin without MFA                                            | opens workspace              | forced MFA enrolment                                         | Security    |
| AC-18-01-03 | admin of Institution A requests cohort of B                              | GET                          | `404`                                                        | IDOR/Tenant |
| AC-18-02-01 | CSV with 2,000 valid rows vs 2,001                                       | dry run                      | accepted / `422 too_many_rows`                               | Boundary    |
| AC-18-02-02 | duplicate emails differing by case                                       | dry run                      | one valid, one flagged duplicate                             | Negative    |
| AC-18-02-03 | dry run completed                                                        | inspect DB                   | no members or accounts created                               | Safety      |
| AC-18-02-04 | confirm import                                                           | check                        | members `invited_pending`; no profiles created               | Happy       |
| AC-18-02-05 | cell value `=HYPERLINK(...)` in name                                     | export                       | neutralised in CSV                                           | Security    |
| AC-18-02-06 | under-age flagged row                                                    | confirm                      | blocked (BR-T106)                                            | Negative    |
| AC-18-03-01 | invite sent                                                              | learner opens link           | landing has no side effect (GET); shows what is shared       | Happy       |
| AC-18-03-02 | learner accepts                                                          | accept                       | `claimed`; seat consumed; institution sees membership only   | Happy       |
| AC-18-03-03 | learner declines                                                         | decline                      | `declined`; seat unused; no further invites for 30 d         | Happy       |
| AC-18-03-04 | invite older than 14 d                                                   | accept                       | `expired`; admin can re-invite                               | Time        |
| AC-18-03-05 | same invite used twice                                                   | accept again                 | rejected (single-use)                                        | Negative    |
| AC-18-03-06 | no seats left                                                            | accept                       | blocked with message; no seat consumed                       | Edge        |
| AC-18-04-01 | cohort of 12 with skill coverage                                         | dashboard                    | aggregates shown; cells < 5 suppressed                       | Privacy     |
| AC-18-04-02 | cohort of 4                                                              | dashboard                    | all cells suppressed with explanation                        | Boundary    |
| AC-18-04-03 | faculty tries to open learner's applications                             | GET                          | `403` (BR-T105)                                              | Negative    |
| AC-18-04-04 | direct SQL view bypass attempt by app role                               | query raw learner tables     | denied by DB grants                                          | Security    |
| AC-18-06-01 | faculty issues credential to claimed learner                             | issue                        | evidence at `authority_verified` with issuer ref             | Happy       |
| AC-18-06-02 | issue to unclaimed row                                                   | issue                        | `409`                                                        | Negative    |
| AC-18-06-03 | institution revokes with reason                                          | revoke                       | evidence `revoked`; learner notified                         | Happy       |
| AC-18-06-04 | institution tries to edit learner's non-issued evidence                  | PATCH                        | `403`                                                        | Negative    |
| AC-18-07-01 | graduation date T                                                        | job at T                     | members `graduated`; individual access denied ≤ 24 h         | Happy       |
| AC-18-07-02 | post-graduation                                                          | faculty opens learner detail | denied; aggregates remain                                    | Negative    |
| AC-18-07-03 | T−30 and T−7                                                             | scheduler                    | reminders to add personal email sent once each               | Time        |
| AC-18-07-04 | graduate opts in `alumni.share_outcomes` for chosen fields (`field_set`) | check                        | only chosen fields shared; ledger entry                      | Consent     |
| AC-18-07-05 | graduation job runs twice                                                | rerun                        | idempotent                                                   | Idempotency |
| AC-18-07-06 | institutional email deprovisioned after graduation                       | learner signs in             | works via personal email; if none, support-assisted recovery | Recovery    |

### 11. Testing

Cohort-member state tests; cross-tenant canary for every institution endpoint (FF-05); aggregate suppression tests incl. differencing attacks (two overlapping cohorts) — rule: suppress when subtracting overlapping published aggregates would reveal n < 5 **[OPEN]**; import fuzzing (encodings, huge cells, CSV injection); graduation time-zone tests; invite replay/forwarding tests; E2E from import to graduation with a fake clock; consent-screen content review.

### 12. Developer guidance

Order: tenant + roles → cohorts → roster dry-run → invites/claim → aggregates with suppression views → credentials → graduation. Do aggregation in the database layer so suppression cannot be skipped by new endpoints. Pitfalls: creating accounts at import; leaking existence of accounts by email in dry-run (report only counts and the admin's own file rows, never "this email already has a TalentSphere account"); reading learner tables from dashboards. Decisions pending: **OPEN-09** minors, institution verification process, aggregate differencing rule, alumni sharing fields, licence mechanics.

### 13. Related

`BUSINESS_RULES_REGISTRY.md` BR-T100…T106 · `PRODUCT_INVARIANT_REGISTRY.md` INV-T41 · `DECISION_TABLES.md` DT-01 rows 10–11 · SPEC-02, SPEC-03, SPEC-06, SPEC-12, SPEC-13.

### Contract links (patch 2026-10-27)

Evidence label: PROPOSED mapping. Every id below was grepped in its owner file on 2026-10-27; ids marked "none" do not exist and are OPEN. Owners: ACT-ATOM-nn in 07 ACTION_REGISTRY; FLD-* in 07 SCREEN_SPECIFICATIONS_KEY; EDG-nn in 06 BUSINESS_PROCESS_INVENTORY; XT-nn in 06 SSOT_WORKFLOW_CROSSWALK; UXH-nn in 07 PROGRESSIVE_UX_AND_FEEDBACK; audit.* in 14 SECURITY_ARCHITECTURE and 07; TEST-ACT-nnn in 07 ACTION_REGISTRY (not yet in TEST_CATALOG, OPEN-P04).

| SPEC                                             | ACT-ATOM                                    | Base ACT without atom                 | FLD        | EDG                                    | XT                                                                         | UXH            | audit events                                                                                                                          | TEST                            | Contract gap                                                                                              |
| ------------------------------------------------ | ------------------------------------------- | ------------------------------------- | ---------- | -------------------------------------- | -------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| SPEC-11 (FEAT-13-01..13-06, 16-11)               | none                                        | ACT-MSG-01, -06                       | FLD-MSG-01 | EDG-01, EDG-09 (message quota), EDG-10 | none                                                                       | UXH-07, UXH-06 | none                                                                                                                                  | none                            | OPEN-F10: send message and outreach have no atomic contract, audit event or TEST                          |
| SPEC-12 (FEAT-16-01..16-04, 16-07, 16-08, 16-11) | ACT-ATOM-11 (choose plan; webhook confirms) | ACT-BIL-02..-05                       | none       | EDG-05, EDG-10, EDG-14                 | XT-01, XT-03 (licence pool, purchase approval: adjacent, scope to confirm) | UXH-08         | `audit.billing.subscription_confirmed`, `audit.billing.plan_changed`, `audit.billing.webhook_rejected`, `audit.billing.refund_issued` | TEST-ACT-011                    | cancel plan and change seats (ACT-BIL-04, -05) have no atom; covered by OPEN-F13                          |
| SPEC-13 (FEAT-22-02, 22-03, 22-07, 01-10)        | none                                        | ACT-PRV-04, -05, -06, -07             | none       | EDG-06                                 | none                                                                       | UXH-08         | `audit.privacy.export_requested`, `audit.privacy.erasure_requested`                                                                   | none                            | OPEN-F11: export, delete and cancel-deletion have no atomic contract or TEST                              |
| SPEC-14 (FEAT-18-01..18-04, 18-06, 18-07)        | ACT-ATOM-10 (role change; adjacent)         | ACT-INS-01, -02, -03, -04; ACT-ORG-01 | FLD-ORG-01 | EDG-09 (seat limits), EDG-12           | XT-02 (revoke seat; adjacent, scope to confirm)                            | UXH-07         | `audit.org.member_added`, `audit.org.role_changed`                                                                                    | TEST-ACT-010 (role change only) | OPEN-F12: cohort create, invite, issue and revoke credential have no atomic contract, audit event or TEST |

Proposed OPEN ids (not registered; governance owner to add to OPEN_DECISIONS.md): OPEN-F01..OPEN-F12 as above, plus OPEN-F13 (billing cancel and seats atoms, SPEC-12). Numbering checked: no OPEN-F[0-9] id exists (only OPEN-FE-nn). Counts of ACT-ATOM rows: 12 exist; none of them was invented here.

## Change record: Feature Specifications, Acceptance Additions (SPEC REV2)

_Former file: `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_ACCEPTANCE_ADDITIONS_REV2.md`._

Doc ID: SPEC-00-R2 · Owner: Product Director (Functional Spec) · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-12, REVW-17 (P0 feature gaps), REVW-18, REVW-20, REVW-21, REVW-22, REVW-26, REVW-27, REVW-29, REVW-38, REVW-43 (acceptance and spec-text parts) · Relates: SPEC-00 and SPEC-G1 to G5, MICRO-FEAT, QA-AC, BR-REG-R2, INV-REG-R2, SM-00-R2, DT-00-R2

**Relationship (no original file was edited).** This file **extends** the long-form specifications `SPEC_G1…G5` and `MICRO_FEATURE_SPECS.md` with acceptance criteria and with spec-text deltas. It supersedes nothing. The spec-text deltas in section 3 name the original passages they would replace **once accepted**. Criteria are numbered so they cannot collide with registered ones: for features that already have criteria the new numbers start at 51; for features with none they start at 01. The test catalogue is owned by QA; this file proposes no TEST ids. Governance should link this file from `05_FEATURE_SPECIFICATIONS/README.md` (index) and `00_CONTROL_CENTRE/MASTER_INDEX.md`.

This file registers **95 new criteria** (counted by script over rows that begin `| AC-DD-NN-NN |`; no id collides with a criterion registered in `05_*` or `16_*`). All content **[TARGET]**; nothing here claims anything is built. Table form is that of the long-form specs: `| AC id | Given | When | Then | Category |`.

### 1. Criteria for review-resolution rules

#### 1.1 Evidence integrity (REVW-12, REVW-22, REVW-20 archive)

| AC          | Given                                                                                                                                    | When                                                           | Then                                                                                                                            | Category          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| AC-05-04-51 | a learner completes a first-party course with a platform rule                                                                            | the issuer mints the completion                                | one item at `authority_verified` with `issuer_class = platform`; the badge shows the class                                      | Happy             |
| AC-05-04-52 | any client sends an `issuerClass` or `rung` field when creating or editing evidence                                                      | POST/PATCH                                                     | field ignored or `422`; the stored class equals the class of the issuing record (INV-T46)                                       | Security          |
| AC-05-04-53 | instructor account equals the learner account                                                                                            | instructor signs off                                           | `422 self_signoff`; nothing minted; enrolment unchanged (INV-T47)                                                               | Negative          |
| AC-05-04-54 | instructor and learner share a device cluster or payment instrument                                                                      | instructor signs off                                           | sign-off held for human review; enrolment stays `completion_pending_signoff`; no evidence; no automatic rejection (DT-14 row 2) | Negative/Security |
| AC-05-04-55 | an item whose only authority record has `issuer_class = instructor`                                                                      | rendered; filtered by "platform verified"; scored for matching | badge "Instructor attested"; excluded from the platform-verified filter; match explanation shows the lower class weight         | Honesty           |
| AC-05-04-56 | an `instructor`-class record is revoked by its issuer or a moderator                                                                     | confirm                                                        | rung recomputes (falls to the next supported rung); holder notified within 24 h with appeal path; audited                       | Happy             |
| AC-08-04-51 | an approved instructor with a completed conflict-of-interest declaration signs off a learner other than themselves with no shared signal | sign-off                                                       | accepted; evidence minted at `authority_verified` with class `instructor` (DT-14 row 5)                                         | Happy             |
| AC-06-01-51 | a work claim at a domain equal to a verified `org_domain` of a verified organization                                                     | candidate enters the code correctly                            | rung `artifact_backed`; badge "Mailbox verified" (`domain_binding = bound`)                                                     | Happy             |
| AC-06-01-52 | a work claim at a domain the candidate owns or controls that is not bound to a verified organization                                     | code entered correctly                                         | rung stays `claimed`; badge "Mailbox verified, employer not confirmed"; the popover says the employer is not confirmed          | Honesty           |
| AC-06-01-53 | a `bound` proof exists and its organization's verification is revoked                                                                    | revocation commits                                             | the provenance record is invalidated; the item's rung recomputes; audited (INV-T48)                                             | Happy             |
| AC-05-01-51 | an active evidence item                                                                                                                  | user chooses Archive then Undo within 8 s                      | no withdraw request is sent; item still `active`                                                                                | Happy             |
| AC-05-01-52 | an active evidence item                                                                                                                  | user chooses Archive and does not undo                         | after 8 s the item is `withdrawn` (terminal); "Create again from this" creates a new `draft` with `restored_from`               | Happy             |

#### 1.2 Organization lifecycle (REVW-20)

| AC          | Given                                                  | When                              | Then                                                                                                                                                            | Category |
| ----------- | ------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-02-01-01 | a new organization (`verification_state = unverified`) | owner publishes a first valid job | allowed (pending-limited mode, 1 live job)                                                                                                                      | Happy    |
| AC-02-01-02 | the same organization with 1 live job                  | owner publishes a second job      | `409 org_verification_required`                                                                                                                                 | Negative |
| AC-02-01-03 | owner submits a domain with a correct DNS TXT proof    | review completes                  | `pending → verified`; `org_domain` usable for employer-domain binding; audited                                                                                  | Happy    |
| AC-02-01-04 | a verified organization with 3 live jobs               | a reviewer revokes verification   | in one transaction the oldest live job stays and two move to `paused` (reason `org_unverified`); applications on paused jobs continue; owner notified (BR-T123) | Happy    |
| AC-02-01-05 | an automated check fails a domain re-check             | the system runs                   | a review task opens; `verification_state` does not change by itself (U6)                                                                                        | Negative |

#### 1.3 Account, age and erasure (REVW-21, REVW-29)

| AC          | Given                                              | When                              | Then                                                                                                                                                     | Category  |
| ----------- | -------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AC-01-01-51 | a registration without the minimum-age attestation | submit                            | `422 age_attestation_required`; no account row                                                                                                           | Negative  |
| AC-01-01-52 | the person declares an age below the minimum       | submit                            | refused with a neutral message; no account created; only a hashed rate-limit signal kept for 24 h                                                        | Security  |
| AC-01-01-53 | any account with status `active`                   | database constraint check         | `min_age_attested_at` and the policy version are present (INV-T50)                                                                                       | Invariant |
| AC-19-07-01 | one moderator decides to suspend an account        | submits without a second approver | rejected `second_person_required`; with the documented emergency exception the action applies and is reviewed within 24 h                                | Negative  |
| AC-22-03-51 | a `suspended` account with an open moderation case | the holder requests erasure       | request acknowledged and parked `on_hold` (reason `moderation_case_open`); the account stays `suspended`; the requester is told a hold applies (INV-T49) | Negative  |
| AC-22-03-52 | the case in AC-22-03-51 becomes `closed`           | the hold clears                   | the request resumes; cooling-off starts                                                                                                                  | Happy     |

#### 1.4 Applications, referees, matching view (REVW-27, REVW-38, REVW-43, REVW-11)

| AC          | Given                                                     | When                                      | Then                                                                                                                             | Category |
| ----------- | --------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-10-03-51 | an application withdrawn 2 h ago, cooldown 24 h           | the candidate re-applies                  | `409 reapply_cooldown` with the earliest allowed time                                                                            | Negative |
| AC-10-03-52 | a withdrawn application, cooldown passed, job `published` | the candidate re-applies                  | a new application with `reapplied_from`; the hiring team sees the link and withdrawal date; a new evidence snapshot is taken     | Happy    |
| AC-10-03-53 | an application ended `rejected`                           | the candidate tries to re-apply           | refused; only a recruiter invitation creates a new linked application                                                            | Negative |
| AC-06-10-51 | a manual reminder was sent on day 3                       | day 4 arrives                             | the system reminder is deferred until 3 days after the manual one; the total never exceeds 2                                     | Happy    |
| AC-06-10-52 | two reminders sent in any mix of system and manual        | the candidate presses "Send reminder"     | disabled with "2 of 2 reminders used"; the API returns `409 reminder_cap_reached`                                                | Negative |
| AC-11-10-01 | a job with 12 applicants of mixed scores                  | a recruiter opens "Suggested order"       | 12 rows are returned; none hidden; the view is labelled "Suggested order" and advisory (INV-T52)                                 | Honesty  |
| AC-11-10-02 | the UI and API surface                                    | text and route lint                       | the advisory view is never named "shortlist"                                                                                     | Honesty  |
| AC-11-09-01 | a tenant with no recorded fairness review                 | a recruiter requests score-ranked results | the feature flag `matching.recruiter_ranking` is off; the plain filter and the candidate-facing explanation still work (BR-T126) | Negative |
| AC-11-09-02 | ROLE-AUD has recorded the baseline review                 | the flag is switched on                   | the change is audited with the review reference                                                                                  | Happy    |

#### 1.5 Sessions, idempotency, retention (REVW-18, REVW-14, REVW-26, entitlement stub)

| AC          | Given                                                                            | When                                                  | Then                                                                                                                                                                                              | Category    |
| ----------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| AC-01-04-51 | a refresh token idle for more than CONST-S02                                     | refresh                                               | `401 session_expired` (constants table in BR-REG-R2)                                                                                                                                              | Negative    |
| AC-01-04-52 | a sensitive action and a re-auth older than CONST-S06 (5 min)                    | the action is submitted                               | step-up required                                                                                                                                                                                  | Security    |
| AC-01-04-53 | a refresh token presented again within CONST-S07 (5 s) with its successor unused | refresh                                               | the same successor is returned; presented outside the leeway the family is revoked                                                                                                                | Security    |
| AC-24-03-51 | a queued offline write with an `Idempotency-Key` created on day 0                | replayed on day 13                                    | the stored response is returned, no second effect                                                                                                                                                 | Idempotency |
| AC-24-03-52 | a route with a natural key                                                       | the same logical write arrives twice after day 15     | the second is deduplicated by the natural key                                                                                                                                                     | Idempotency |
| AC-10-14-51 | an application whose consent window ended 31 days ago                            | the retention job has run                             | the organization's copy holds no snapshot content, answers or contact details; at most the minimal record with an opaque `subject_ref` remains, and only if the OPEN-08 policy keeps it (BR-T122) | Privacy     |
| AC-16-04-51 | a free organization in Phase 1                                                   | an admin compensation grant is created                | the grant needs reason, approver and expiry; it is audited; a client or redirect cannot create it (BR-T090)                                                                                       | Security    |
| AC-02-03-51 | a principal with role `viewer` in an organization                                | the principal opens candidate content                 | denied; metadata only where DT-01 allows                                                                                                                                                          | Security    |
| AC-02-03-52 | an `org_admin` in an organization                                                | the admin files a data-rights request for an employee | refused; the requester must be the subject (SM-DSR t1)                                                                                                                                            | Security    |

### 2. Criteria for P0 features that had none (REVW-17)

Method and list: `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_PHASE_RECONCILIATION_REV2.md` section 5. Each feature below was a P0 feature in Phase 0 or 1 (or a P0 Phase 2 feature) with no criterion of its own.

| AC          | Feature              | Given                                                    | When                                                          | Then                                                                                                                                                                  | Category      |
| ----------- | -------------------- | -------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| AC-01-09-01 | FEAT-01-09           | an authenticated principal with several scoped grants    | `GET /me/capabilities` for one scope                          | returns only that scope's evaluated capability set                                                                                                                    | Happy         |
| AC-01-09-02 | FEAT-01-09           | a capability absent from the response                    | the client calls the action directly                          | `403`; the capability set is a hint, never the enforcement (INV-T01)                                                                                                  | Security      |
| AC-01-09-03 | FEAT-01-09           | a grant changes                                          | the next request is made                                      | the response reflects the new set (no stale cache)                                                                                                                    | Happy         |
| AC-02-07-01 | FEAT-02-07           | a principal of organization A                            | requests any tenant-scoped route with an id of organization B | `404` or `403`; the canary suite fails the build if any route returns B's data                                                                                        | Security      |
| AC-02-07-02 | FEAT-02-07           | any tenant table                                         | lint                                                          | it has `org_id` and a forced row-level security policy                                                                                                                | Invariant     |
| AC-02-07-03 | FEAT-02-07           | the application database role                            | role check                                                    | no `BYPASSRLS`                                                                                                                                                        | Invariant     |
| AC-04-01-01 | FEAT-04-01           | the skills read API                                      | list                                                          | canonical skills are returned with a taxonomy version                                                                                                                 | Happy         |
| AC-04-01-02 | FEAT-04-01           | an alias of a skill                                      | resolved                                                      | resolves to the canonical skill                                                                                                                                       | Happy         |
| AC-04-01-03 | FEAT-04-01           | two skills are merged                                    | an old id is read                                             | it still resolves (redirect) and a merge event is emitted                                                                                                             | Happy         |
| AC-04-02-01 | FEAT-04-02           | evidence, a job or a course                              | tagged with a canonical skill                                 | accepted                                                                                                                                                              | Happy         |
| AC-04-02-02 | FEAT-04-02           | a free-text skill                                        | tagged                                                        | `422` (BR-T006)                                                                                                                                                       | Negative      |
| AC-04-02-03 | FEAT-04-02           | any entity type                                          | tagged                                                        | the same skill ids and API are used                                                                                                                                   | Happy         |
| AC-08-01-01 | FEAT-08-01           | the course catalogue                                     | filtered by skill and level                                   | only `published` courses are returned                                                                                                                                 | Happy         |
| AC-08-01-02 | FEAT-08-01           | a course with prerequisites                              | opened by a learner who has not met them                      | unmet prerequisites are shown with links                                                                                                                              | Happy         |
| AC-15-01-01 | FEAT-15-01           | in-app notifications exist                               | the notification centre opens                                 | newest first, with an unread count                                                                                                                                    | Happy         |
| AC-15-01-02 | FEAT-15-01           | an unread notification                                   | marked read twice                                             | idempotent                                                                                                                                                            | Idempotency   |
| AC-15-03-01 | FEAT-15-03           | the email provider is down                               | a notification is raised                                      | the in-app item exists; the `email.send` job retries (SM-BGJOB t4); no duplicate email on recovery                                                                    | Failure       |
| AC-15-03-02 | FEAT-15-03           | a mandatory security email during quiet hours            | routed                                                        | sent now (DT-07 row 2)                                                                                                                                                | Happy         |
| AC-15-06-01 | FEAT-15-06           | a hard bounce                                            | the provider webhook arrives                                  | delivery `bounced`; the address is suppressed                                                                                                                         | Happy         |
| AC-15-06-02 | FEAT-15-06           | a transient provider error                               | the job retries                                               | delivery shows `failed_retry` and mirrors the job, not a second retry schedule                                                                                        | Happy         |
| AC-15-07-01 | FEAT-15-07           | an engagement email                                      | the recipient uses one-click unsubscribe                      | that category is suppressed                                                                                                                                           | Happy         |
| AC-15-07-02 | FEAT-15-07           | a mandatory transactional category                       | unsubscribe attempted                                         | not suppressed; the page explains why                                                                                                                                 | Negative      |
| AC-15-07-03 | FEAT-15-07           | an address on the suppression list                       | a send is attempted                                           | not sent (SM-NOTIFY t1)                                                                                                                                               | Negative      |
| AC-20-01-01 | FEAT-20-01           | a customer principal                                     | opens a back-office route                                     | `403`; back-office code is not served to the principal (authenticated edge rule)                                                                                      | Security      |
| AC-20-01-02 | FEAT-20-01           | a staff principal without MFA                            | opens the console                                             | denied until MFA is enrolled (BR-T044)                                                                                                                                | Security      |
| AC-20-01-03 | FEAT-20-01           | a role grant changes                                     | saved                                                         | audited with actor and reason                                                                                                                                         | Happy         |
| AC-20-03-01 | FEAT-20-03           | the audit viewer                                         | a record is opened                                            | actor, action, resource, reason and request id are shown                                                                                                              | Happy         |
| AC-20-03-02 | FEAT-20-03           | an audit export                                          | requested                                                     | re-auth is required and the export is itself audited                                                                                                                  | Security      |
| AC-21-01-01 | FEAT-21-01           | a user without `analytics.product` consent               | uses the product                                              | no product-analytics event is captured                                                                                                                                | Privacy       |
| AC-21-01-02 | FEAT-21-01           | consent is withdrawn                                     | the next event would fire                                     | it is not captured                                                                                                                                                    | Privacy       |
| AC-22-06-01 | FEAT-22-06           | a user accepts policy version v                          | stored                                                        | version, timestamp and account are recorded                                                                                                                           | Happy         |
| AC-22-06-02 | FEAT-22-06           | policy version v+1 is published                          | the user's next sensitive action                              | acceptance of v+1 is required first                                                                                                                                   | Happy         |
| AC-24-01-01 | FEAT-24-01           | a state change commits                                   | the process is killed before dispatch                         | the outbox row survives and the event is delivered after restart                                                                                                      | Failure       |
| AC-24-01-02 | FEAT-24-01           | an event is delivered twice                              | the consumer handles it                                       | one effect (consumer dedupe on `event_id`)                                                                                                                            | Idempotency   |
| AC-24-01-03 | FEAT-24-01           | the dispatcher restarts                                  | mid-batch                                                     | no event is lost                                                                                                                                                      | Failure       |
| AC-24-02-01 | FEAT-24-02           | two workers race for one job                             | claim                                                         | exactly one wins (`SKIP LOCKED`)                                                                                                                                      | Concurrency   |
| AC-24-02-02 | FEAT-24-02           | a stale worker finishes after its lease expired          | complete                                                      | the fenced write affects zero rows and the result is discarded                                                                                                        | Concurrency   |
| AC-24-02-03 | FEAT-24-02           | jobs of kinds `email.send`, `ai.*` and a permanent error | failures repeat                                               | `email.send` is attempted up to 12 times, `ai.*` 3 times, a permanent error goes straight to `dead`; a dead job of a protected kind raises an alert (SM-BGJOB t4, t7) | Failure       |
| AC-24-04-01 | FEAT-24-04           | a signed download URL                                    | used after expiry                                             | `403`                                                                                                                                                                 | Security      |
| AC-24-04-02 | FEAT-24-04           | a non-image file                                         | downloaded                                                    | forced as attachment (BR-T116)                                                                                                                                        | Security      |
| AC-24-05-01 | FEAT-24-05           | a request that passes shell, API and worker              | traced                                                        | one trace id spans all three; logs redact secrets and direct identifiers                                                                                              | Observability |
| AC-24-08-01 | FEAT-24-08           | requests over the limit                                  | sent                                                          | `429` with `Retry-After`; auth endpoints are stricter (BR-T115)                                                                                                       | Security      |
| AC-24-09-01 | FEAT-24-09           | two worker replicas                                      | a scheduled tick fires                                        | it runs once (unique kind and tick)                                                                                                                                   | Concurrency   |
| AC-24-09-02 | FEAT-24-09           | a time-driven transition is due                          | the job runs                                                  | the guard is re-checked at execution time (U7)                                                                                                                        | Happy         |
| AC-24-11-01 | FEAT-24-11           | a migration that drops or rewrites a column in one step  | lint                                                          | rejected unless it follows expand/contract with a rollback note                                                                                                       | Invariant     |
| AC-17-01-01 | FEAT-17-01           | code that imports a model provider directly              | CI lint                                                       | the build fails (BR-T110)                                                                                                                                             | Invariant     |
| AC-17-01-02 | FEAT-17-01           | the Phase 0 gateway stub                                 | a call is made                                                | denied by default; no provider is contacted                                                                                                                           | Security      |
| AC-17-02-01 | FEAT-17-02           | a free-tier user                                         | requests AI assistance                                        | no paid inference; the deterministic fallback runs (BR-T111)                                                                                                          | Happy         |
| AC-17-03-01 | FEAT-17-03           | a principal bound to `AI_PROHIBITED`                     | any gateway call                                              | denied regardless of caller (BR-T025)                                                                                                                                 | Security      |
| AC-17-03-02 | FEAT-17-03           | a denial                                                 | logged                                                        | the log holds the policy and principal, not the prompt content                                                                                                        | Privacy       |
| AC-07-01-01 | FEAT-07-01 (Phase 2) | the assessment catalogue                                 | an item is opened                                             | mode badge and AI-policy label are shown                                                                                                                              | Happy         |
| AC-16-01-01 | FEAT-16-01 (Phase 2) | a plan with no price set                                 | the catalogue renders                                         | no price is shown (prices are OPEN-05)                                                                                                                                | Honesty       |
| AC-19-02-01 | FEAT-19-02 (Phase 2) | a report and a system flag on one target                 | the queue is built                                            | one case (dedupe by target and category); automation cannot move it to `actioned`                                                                                     | Happy         |
| AC-19-08-01 | FEAT-19-08 (Phase 2) | a reporter files more than 20 reports in a day           | files one more                                                | `429` (BR-T048)                                                                                                                                                       | Negative      |

### 3. Spec-text deltas (passages replaced once accepted)

| Original passage                                                                                                                                        | Replacement meaning                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPEC-G2 badge line (about L203): "`Mailbox verified` (artifact-backed via domain proof) ... `Employer confirmed` (authority; Phase 3 via verified org)" | Badges: "Not verified"; "Mailbox verified" only for a `bound` domain; "Mailbox verified, employer not confirmed" for an `unbound` domain (rung stays `claimed`); "Confirmed by referee"; for authority, the class is shown: "Platform verified", "Institution verified", "Employer confirmed", "Instructor attested" (DT-06 REV2) |
| SPEC-G2 actors table (about L20): ROLE-INST and issuers "mint `authority_verified` items"                                                               | Issuers mint authority records with a mandatory `issuer_class`; instructor-class records follow BR-T119 and DT-14                                                                                                                                                                                                                 |
| SPEC-G3 actors and completion rule (about L189, L212 to L214): `instructorSignoff`, "rung `authority_verified` when ... instructor-signed-off"          | Instructor sign-off mints `authority_verified` with class `instructor` only after DT-14; it never counts as platform-verified; revocable                                                                                                                                                                                          |
| SPEC-G3 offline lines (L76, L209, L256)                                                                                                                 | Assessment answers are online-only; lesson progress is a queued write; downloadable video is out of Phases 1 and 2 (REVW-15 decision)                                                                                                                                                                                             |
| SPEC-G1 onboarding (registration step, micro-feature FEAT-01-01.3 "age/guardian gate [OPEN-09]")                                                        | Registration requires the minimum-age attestation of BR-T120 (value [OPEN-counsel]); no account is created below the minimum                                                                                                                                                                                                      |
| SPEC-G4 FEAT-10-03 "Withdraw & re-apply policy" and the application states paragraph                                                                    | Withdrawn is terminal; the candidate may submit a new linked application after the cooldown (BR-T125, SM-APPLICATION t12)                                                                                                                                                                                                         |
| SPEC-G4 FEAT-11-10 "Suggested shortlist per job (human-gated)" (also PCAP-01 title)                                                                     | "Suggested order"; the view returns all applicants (INV-T52)                                                                                                                                                                                                                                                                      |
| SPEC-G5 section 3.2 CSV columns and BR-T106                                                                                                             | The roster CSV may carry the attestation flag or date of birth only if counsel requires it (BR-T120); rows flagged under-age stay blocked                                                                                                                                                                                         |
| USER_JOURNEYS about line 115: "1st reminder after 3 days (ACT-VER-03)"                                                                                  | "Reminders: the system sends on day 4 and day 9; you can also send one yourself 3 days after the last send; two in total" (BR-T121)                                                                                                                                                                                               |
| ACT-VER-03 availability (`07_UI_UX`)                                                                                                                    | "≥ 3 days since last send of any kind and fewer than 2 reminders in total" (DT-13)                                                                                                                                                                                                                                                |
| SPEC-G5 retention paragraph for applications; DATA-021 (24 months)                                                                                      | Identifiable content follows BR-T122; the 24-month figure applies only to the minimal record if OPEN-08 allows it                                                                                                                                                                                                                 |

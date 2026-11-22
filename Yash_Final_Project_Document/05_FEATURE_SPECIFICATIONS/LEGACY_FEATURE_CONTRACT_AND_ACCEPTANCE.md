# Legacy Feature Contract (31 fields), Status Rule and Product Acceptance (merged)

Doc ID: SPEC-LEG-01 · Owner: Product Director (Functional Spec) · Version 1.0 · Status: Draft for Review · Relates: `README.md` (SPEC-00 spec contract), `../04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md`, `../07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/registries/FEATURE_REGISTRY.md` (contract template, status rule) and `31_LEGACY_ARCHIVE/docs/product/PRD.md` section 12 (product acceptance)

Frame: **nothing is implemented.** The items below were the prior attempt's rules for how a feature is described and accepted. They are requirements for how this project writes and accepts feature work.

## 1. Prior per-feature contract (31 fields) mapped to the target spec contract (SPEC-00)

The prior attempt required every feature to carry the following fields. The target spec contract (`README.md` section 1, sections 0 to 13) covers almost all of them; the right-hand column records where, and which fields have **no explicit home** so that nothing is lost.

| # | Legacy field | Target home (SPEC-00 section) | Gap? |
|---|---|---|---|
| 1 | Feature ID | 0 Metadata | |
| 2 | Name | 0 Metadata | |
| 3 | Purpose | 1 Business purpose | |
| 4 | User value | 1 Business purpose | |
| 5 | Business value | 1 Business purpose | |
| 6 | Target roles | 2 Actors and access | |
| 7 | Dependencies | 0 Metadata (Relates) and the FEAT hierarchy | |
| 8 | Entry points | 4 User interaction | |
| 9 | Journey | 4 User interaction (link UJ-*) | |
| 10 | Behavior | 3 Functional behavior | |
| 11 | Rules | 3 Functional behavior (BR-T references; legacy BR-* only through the crosswalk) | |
| 12 | Inputs/outputs | 3 Functional behavior | |
| 13 | States | 7 States and transitions | |
| 14 | Permissions | 2 Actors and access | |
| 15 | Data | 6 Data | |
| 16 | API/events | 5 Backend behavior | |
| 17 | Frontend | 4 User interaction | |
| 18 | Backend | 5 Backend behavior | |
| 19 | Integrations | 5 Backend behavior (ports) | |
| 20 | Analytics | none explicit | **Yes.** Add an "events and metrics emitted (MET-*)" line to section 3 side effects or section 8. |
| 21 | Security/privacy | 8 NFRs | |
| 22 | Performance | 8 NFRs | |
| 23 | Observability | 8 NFRs (no dedicated line) | Partial. Name logs, metrics and traces required. |
| 24 | Errors | 9 Failure scenarios | |
| 25 | Edge cases | 9 Failure scenarios and 10 acceptance (Boundary tags) | |
| 26 | Recovery | 9 Failure scenarios | |
| 27 | Tests | 11 Testing | |
| 28 | Acceptance | 10 Acceptance criteria | |
| 29 | Evidence/status | none, by design | **Yes (intentional).** Target specs never claim status; readiness lives in `99_FINAL_MASTER_BLUEPRINT/IMPLEMENTATION_READINESS.md` and release gates. Keep evidence and status out of the spec body. |
| 30 | Decision | 12 Developer guidance (pending decisions) | |
| 31 | Future extension | none explicit | **Yes.** Add a "deferred / future extension" line to section 12. |

The legacy block listed exactly 31 field names in the order shown (Feature ID first, Future extension last).

Target action: adopt the three gap items (Analytics, Observability, Future extension) in SPEC-00 at its next revision (OPEN-LGA-12).

## 2. Feature status vocabulary and rule (legacy; carried over)

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

## 3. Product acceptance (prior PRD section 12; carried over)

A product increment is accepted only when all of the following are satisfied:

1. the user outcome;
2. the journey;
3. security and privacy constraints;
4. accessibility behaviour;
5. operational readiness;
6. measurable acceptance criteria.

Related prior statements: GA requires the platform foundations plus a **complete trusted career loop**; the 173-feature portfolio is not a requirement to ship before validating the core product (see `../01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md`). Journey rule: a journey is not complete until its critical feature chain is testable end to end (see `../02_STAKEHOLDERS_AND_USERS/LEGACY_JOURNEY_REGISTRY_J01_J28.md`). UX acceptance checklist: see `../07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md` section 8.

## 4. Open items

| ID | Item |
|---|---|
| OPEN-LGA-12 | Add Analytics, Observability and Future-extension lines to SPEC-00 (see section 1). Owner: Product Director. |

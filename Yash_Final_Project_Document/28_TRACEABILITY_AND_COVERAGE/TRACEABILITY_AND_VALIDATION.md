# Traceability, Coverage & Validation Report

Doc ID: TRC-01 · Owner: Documentation Architect · Version 1.0 · Status: Draft · Date 2026-10-25

Canonical SSOT §7 feature identities and the local feature decomposition have a **candidate, unapproved mapping** in [SSOT_FEATURE_CROSSWALK](SSOT_FEATURE_CROSSWALK.md). It is not implementation coverage evidence; OPEN-41 remains open until the product owner approves the links and gaps.

Section-based source-to-target audit findings across contracts, controls, phases, governance, and UX are consolidated in [SSOT_RECONCILIATION_AUDIT](SSOT_RECONCILIATION_AUDIT.md). Candidate row-level maps include the [100-row UX pattern crosswalk](UX_PATTERN_SOURCE_CROSSWALK.md) and [69-row phase/gate/governance crosswalk](PHASE_GATE_GOVERNANCE_CROSSWALK.md), plus the [observed implementation control crosswalk](OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.md); these are candidate maps and establish neither approval nor implementation. The 2026-10-21 structured audit evidence is indexed in [AUDIT_EVIDENCE_2026-10-21_INDEX](AUDIT_EVIDENCE_2026-10-21_INDEX.md), with a 173-row historical feature crosswalk and the [28-row historical journey evidence crosswalk](AUDIT_JOURNEY_EVIDENCE_CROSSWALK.csv); the original JSON remains the detail source. The 54 source SCI identities and 16 CON identities have candidate maps in the [SCI crosswalk](../13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.md) and [CON crosswalk](../13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.md). A 278-row [observed route-to-target map](../13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_ROUTE_TARGET_CROSSWALK.csv) records 9 name-preserving method/path overlaps and 4 same-name-path method mismatches; among 265 routes without a name-preserving path match, 6 have parameter-agnostic shape candidates and 259 have no shape match. Semantic contract mapping remains open. OPEN-46/48–50 track unresolved dispositions; these reports do not imply source adoption or implementation.

## 1. Chain
`GOAL → DOM → CAP → FEAT → FR/BR/INV → UJ → SCR/ACT → API/EVT/DATA → AC → TEST`
Row-level links live where each ID is defined:
| Link | Defined in |
|---|---|
| GOAL | `01_*/PRODUCT_VISION_AND_BUSINESS_MODEL.md` |
| DOM, MOD, ROLE | `00_CONTROL_CENTRE/ID_REGISTRY.md` |
| CAP, FEAT | `04_*/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` |
| AC, feature behaviour | `05_FEATURE_SPECIFICATIONS/SPEC_G*.md` |
| BR, INV, SM, decision tables | `06_*`, `00_*/CANONICAL_INVARIANTS.md` |
| UJ, SCR, ACT | `02_*/USER_JOURNEYS.md`, `07_*` |
| API, EVT, DATA | `13_*`, `12_*` |
| TEST → AC/INV/FF | `16_QA_AND_TESTING/TEST_CATALOG.md` |
| WP | `22_*/ROADMAP.md` |
| RISK, OPEN, ADR | `24_*` |

## 2. Mechanical check performed (script, 2026-10-25)
A Python scan of all `.md` files compared IDs in a definition position (first table cell / heading / bold bullet) against all references.

| Prefix | Defined | Undefined refs | Note |
|---|---|---|---|
| FEAT | 253 | 0 | |
| BR-T | 108 | 0 | |
| INV-T | 45 | 0 | |
| ADR-T | 22 | 1 | ADR-T23 is a *proposal* (frontend `FD-nn` decisions), not yet registered |
| RISK | 50 | 0 | |
| OPEN | 36 + OPEN-40 through OPEN-50 | OPEN-01/02/04 reserved, unused | OPEN-14 collision fixed; OPEN-41–50 document owner review still needed. Agent-local namespaces `OPEN-FE-*`, `OPEN-UX-*`, `OPEN-B*` still need global numbers |
| TEST | 214 | 0 | Current extraction counts unique test IDs in catalog first cells and compares fully qualified references across Markdown. Shortened ranges and semantic test relevance are not verified. |
| SCR / ACT | 130 / 231 | 0 | |
| SM / EVT / FF / DOM | 19 / 74 / 10 / 25 | 0 | |
| AC | 389 | 0 exact full-ID references | 359 feature criteria plus 30 shared platform criteria. Direct catalog links: 125/389 (96/359 feature, 29/30 shared); 264 have no direct test-ID link. See the generated [AC-to-test matrix](AC_TEST_TRACEABILITY_MATRIX.md). Shorthand/range references are excluded from this exact-ID count. |

Current documentation check: 209 local Markdown links, 0 missing; 21 distinct exact/grouped AC references in the roadmap, 0 unmatched against the criteria files. The direct-reference scan finds 125 criteria named by catalog tests and 264 without a direct AC-ID link; this does not determine semantic coverage or whether a FEAT-/INV-level test is adequate. Not checked: Mermaid rendering, whether each FEAT has a screen, or semantic suitability of a linked test. 26 features have no ACs yet (TEST_CATALOG §15).

## 3. Known gaps
- 26 features without acceptance criteria.
- A candidate root `SSOT.md` §7 `F-01…F-173` to local `FEAT-*` crosswalk is drafted in [SSOT_FEATURE_CROSSWALK](SSOT_FEATURE_CROSSWALK.md), but is not approved (OPEN-41); the local 253-row count and candidate links do not prove canonical portfolio coverage.
- Agent-local OPEN namespaces need global numbering.
- ADR-T23+ not registered; two ADR-T10 amendments proposed by the frontend team (saved-job read cache, instructor authoring offline).
- 264 of 389 defined ACs have no direct AC-ID reference in a catalog test (matrix); review indirect feature/invariant coverage and add direct references where justified.
- Security/AI and reliability/operations dispositions remain open under OPEN-48/49. Candidate row-level UX (`M-01…M-100`) and phase/gate/governance maps now exist in the linked crosswalks. A path-level route crosswalk is available, including separately labelled parameter-agnostic shape candidates; semantic route/API mapping, owner approval, remaining registers, source conflicts, and nested historical evidence migration remain open under OPEN-50.
- The catalog's 26 FEATs with no AC row and the review scan's 158 FEATs with no AC carrying their own FEAT ID use different definitions; reconcile the discrepancy before using either as a feature-coverage rate.
- Contradictions: see `27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md`.

## 4. Contract validation
Frontend team (agent-reported): `REMOTE_MANIFEST.schema.json` and `REMOTE_REGISTRY.schema.json` passed JSON-Schema 2020-12 meta-validation; example registry validated; 7 Ed25519 signatures verified. Backend team: see its report summarized in the review report. The orchestrator has not independently re-run any validator.

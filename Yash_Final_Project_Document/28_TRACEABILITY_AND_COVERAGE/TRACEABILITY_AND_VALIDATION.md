# Traceability, Coverage & Validation Report

Doc ID: TRC-01 · Owner: Documentation Architect · Version 1.0 · Status: Draft · Date 2026-10-25

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
| OPEN | 36 + OPEN-40 | OPEN-01/02/04 reserved, unused | OPEN-14 collision fixed (simulations now use OPEN-40). Agent-local namespaces `OPEN-FE-*`, `OPEN-UX-*`, `OPEN-B*` still need global numbers |
| TEST | 210 | 2 | truncated pattern matches (`TEST-A11-`, `TEST-REC-`); heuristic artefact, not individually verified |
| SCR / ACT | 130 / 231 | 0 | |
| SM / EVT / FF / DOM | 19 / 74 / 10 / 25 | 0 | |
| AC | 388 | 63 | Mostly `AC-NN-NN` shorthand and `AC-00-*` platform criteria whose definition format the heuristic missed; **not individually verified** |

Not checked: Markdown relative links, Mermaid rendering, whether each AC has a test, whether each FEAT has a screen. 26 features have no ACs yet (TEST_CATALOG §15).

## 3. Known gaps
- 26 features without acceptance criteria.
- Agent-local OPEN namespaces need global numbering.
- ADR-T23+ not registered; two ADR-T10 amendments proposed by the frontend team (saved-job read cache, instructor authoring offline).
- Contradictions: see `27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md`.

## 4. Contract validation
Frontend team (agent-reported): `REMOTE_MANIFEST.schema.json` and `REMOTE_REGISTRY.schema.json` passed JSON-Schema 2020-12 meta-validation; example registry validated; 7 Ed25519 signatures verified. Backend team: see its report summarized in the review report. The orchestrator has not independently re-run any validator.

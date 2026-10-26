# Information Reconciliation Matrix (V9 control document)

Doc ID: CC-REC · Version 1.0 · Status: Draft · Additive; summarises and links existing candidate crosswalks. Nothing here approves equivalence between a source item and a target item.

| Source area | Target area | Reconciliation artifact | State |
|---|---|---|---|
| `SSOT.md` §7 features F-01…F-173 | 04 FEAT hierarchy | [SSOT_FEATURE_CROSSWALK](../28_TRACEABILITY_AND_COVERAGE/SSOT_FEATURE_CROSSWALK.md) | Candidate, unapproved (OPEN-41) |
| `docs/registries/BUSINESS_RULE_REGISTRY.md` + SSOT §19 (BR-001…248, MIG) | 06 BR-T registry | [LEGACY_RULE_CROSSWALK](../06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.md) + `.csv` | Per manifest: 9 exact, 67 partial, 8 conflicts, 1 superseded, 171 no-match; owner review OPEN-43 |
| SSOT UX micro-patterns (100) | 07 UX | [UX_PATTERN_SOURCE_CROSSWALK](../28_TRACEABILITY_AND_COVERAGE/UX_PATTERN_SOURCE_CROSSWALK.md) | Candidate |
| SSOT phases/gates/governance (69) | 22, 24 | [PHASE_GATE_GOVERNANCE_CROSSWALK](../28_TRACEABILITY_AND_COVERAGE/PHASE_GATE_GOVERNANCE_CROSSWALK.md) | Candidate |
| Observed implementation controls (38) | 11, 14, 17 | [OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK](../28_TRACEABILITY_AND_COVERAGE/OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.md) | Candidate |
| Audit evidence JSON 2026-10-21 (173 features, 28 journeys, 274 routes …) | 28 | [AUDIT_EVIDENCE_2026-10-21_INDEX](../28_TRACEABILITY_AND_COVERAGE/AUDIT_EVIDENCE_2026-10-21_INDEX.md) | Partially migrated |
| SSOT service/interface contracts (SCI 54, CON 16) | 13 | SSOT_SERVICE_CONTRACT_CROSSWALK, SSOT_INTERFACE_CONTRACT_CROSSWALK | Candidate (OPEN-46/50) |
| Observed routes (278) | 13 | OBSERVED_ROUTE_TARGET_CROSSWALK.csv | 9 candidates, 4 method mismatches, 265 unmatched; semantic mapping open |

## Known unreconciled areas (from the independent review, still open)
Source/target conflicts: target-vs-built stack, phase vocabularies, privacy thresholds, pricing, role model, ADR-015, feature-register authority. See `27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md` (45 findings) and `REVIEW_RESOLUTION_DECISIONS.md`. REVW-01..05 were fixed in docs earlier; REVW-06..45 are only partly addressed (fix agents were interrupted by a usage limit).

# Document Status Register

Doc ID: CC-DSR · Owner: Documentation Architect · Version 1.0 · Status: Under Review · Date: 2026-10-25

This register tracks specification maturity, not software delivery. **Ready for Implementation** requires the relevant contracts, rules, ownership, acceptance criteria, and dependencies to be complete and reviewed; no implementation or compliance claim follows from a document status.

The folder statuses below reflect the independent review in [FINAL_REVIEW_REPORT](../27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md), updated with the post-review disposition in that report. The full deliverable inventory is in [MASTER_INDEX](MASTER_INDEX.md). Review findings and external decisions remain controlling where they identify a blocker.

| Folder | Status | Main outstanding condition |
|---|---|---|
| 00_CONTROL_CENTRE | Revision Required | Consolidate invariant authority and globally number OPEN records; verify generated consent/state vocabularies; complete the 204-entry source mapping in the [knowledge preservation manifest](KNOWLEDGE_PRESERVATION_MANIFEST.md) before considering any legacy cleanup. |
| 01_EXECUTIVE_AND_STRATEGY | Under Review | OPEN-05, OPEN-06, OPEN-07; validate product and commercial assumptions with stakeholders. |
| 02_STAKEHOLDERS_AND_USERS | Revision Required | Reconcile the SSOT, observed role union, and target scoped-grant model under OPEN-44; complete remaining role coverage and validate personas/permissions (REVW-28, OPEN-07). A 28-row historical J-to-UJ candidate map has 22 partial mappings and 6 without a direct target journey; owner review remains open under OPEN-50. |
| 03_BUSINESS_DOMAINS | Under Review | Resolve payout scope and phase alignment; reconcile source domain boundaries under OPEN-47 (REVW-30, REVW-34). |
| 04_PRODUCT_CAPABILITIES | Revision Required | Reconcile feature phases to roadmap (OPEN-42); the 173-to-253 candidate mapping is drafted but awaits owner approval under OPEN-41. The capability count is corrected to 108. |
| 05_FEATURE_SPECIFICATIONS | Revision Required | Add missing critical specs/acceptance criteria and reconcile offline scope; REVW-15, REVW-17, REVW-25, REVW-29. |
| 06_BUSINESS_PROCESSES | Revision Required | Source-aware rule crosswalk covers 256 normalized BR/MIG identities, with 8 conflicts and 171 unmatched rules; 91 WF/WIT-to-BP candidate mappings are drafted, while state-machine reconciliation and owner disposition remain open (OPEN-43/45; REVW-19 through REVW-22, REVW-27). 2026-10-27: REV2 folded into the originals (BR-REG, DT-00, INV-REG, SM-00 in 06; API_CATALOG and contracts/openapi.yaml, 226 operations, Redocly valid, in 13); status stays Revision Required until owners ratify. |
| 07_UI_UX_AND_DESIGN_SYSTEM | Revision Required | Complete action-to-API mapping and status/permission behavior; review the 100-row candidate source UX crosswalk and resolve M-pattern conflicts under OPEN-50; REVW-09, REVW-18, REVW-20. |
| 08_PWA_AND_MOBILE | Revision Required | Reconcile offline boundaries; device compatibility claims still require real-device verification (OPEN-12). |
| 09_MODULE_FEDERATION | Deferred | Federation is optional; bundled mode remains the proposed baseline. Any activation requires ADR-T23 ratification, OPEN-03/11 and WP-FED-SPIKE; domain boundary reconciliation OPEN-47 remains open. |
| 10_FRONTEND_ARCHITECTURE | Revision Required | Reconcile budgets and route contracts; federation-specific release work is conditional on OPEN-03/11 and ADR-T23, not a prerequisite for the bundled baseline. |
| 11_BACKEND_ARCHITECTURE | Revision Required | Resolve write amplification, job-engine, rate-limit and module-graph findings. 2026-10-27: REV2 folded (BACKEND_ARCHITECTURE sections 8 and 16 replaced, other REV2 parts appended); status stays Revision Required until owners ratify. |
| 12_DATA_AND_DATABASE | Revision Required | Complete retention/erasure decisions, reconcile source ADR-015 with target ADR-T05 under OPEN-52, and verify persisted-state and consent constraints. 2026-10-27: REV2 folded (PHYSICAL_DESIGN REV2 appended (write budget, idempotency, auth_throttle)); status stays Revision Required until owners ratify. |
| 13_API_EVENTS_AND_INTEGRATIONS | Revision Required | Resolve SSOT-vs-target envelope, pagination and deprecation differences (OPEN-46); owner-review the 54-row SCI candidate crosswalk (33 partial, 21 no-specific-match) and 278-row observed route crosswalk (9 name-preserving method/path overlaps, 4 named-path method mismatches, 6 additional parameter-agnostic shape candidates, 259 no shape match); map CON identities, and complete semantic P0 API coverage, state parity, idempotency definitions and error vocabulary. 2026-10-27: REV2 folded into the originals (BR-REG, DT-00, INV-REG, SM-00 in 06; API_CATALOG and contracts/openapi.yaml, 226 operations, Redocly valid, in 13); status stays Revision Required until owners ratify. |
| 14_SECURITY_PRIVACY_COMPLIANCE | Revision Required | Resolve remaining data lifecycle and session details; counsel review required for applicability claims. 2026-10-27: REV2 folded (SECURITY_ARCHITECTURE REV2 appended); status stays Revision Required until owners ratify. |
| 15_RELIABILITY_AND_PERFORMANCE | Draft | Reconcile budgets; calibrate proposed SLOs against measured baselines (OPEN-15). |
| 16_QA_AND_TESTING | Draft | Direct AC-to-test links are inventoried (125/389); complete BR-to-AC traceability, review semantic suitability, and close coverage gaps. Historical 2026-10-21 test records are cross-referenced by TRC-11; not a current run or coverage proof. |
| 17_DEVOPS_AND_INFRASTRUCTURE | Blocked | Hosting and platform decisions remain open (OPEN-14, OPEN-22, OPEN-36). |
| 18_OPERATIONS_AND_SUPPORT | Draft | Assign support and on-call ownership (OPEN-16, OPEN-39). |
| 19_BUSINESS_AND_COMMERCIAL_OPERATIONS | Draft | Resolve payout/tax flows and validate commercial assumptions (REVW-30). |
| 20_ANALYTICS_AND_MEASUREMENT | Revision Required | Define measurable thresholds and align consent-gated measurement; resolve the PRD primary metric versus target EBHC north star under OPEN-51. |
| 21_COST_AND_FINOPS | Draft | Cost envelope and sustainability inputs are not evidenced. |
| 22_IMPLEMENTATION_ROADMAP | Revision Required | Reconcile capability-map phases and feature-to-work-package coverage (OPEN-42); verify semantic AC/test coverage and resolve cost/complexity gates (REVW-10, REVW-11, REVW-24). Roadmap AC identifiers now resolve against registered criteria, but that is not proof of coverage. |
| 23_MIGRATION_AND_EVOLUTION | Blocked | Determine whether reference data exists and reconcile migration contracts (OPEN-17). |
| 24_RISKS_AND_DECISIONS | Revision Required | Resolve numbering, register proposed ADRs, and close OPEN-52 only after owners approve the persistence bridge and its migration, operational and scale-out evidence gates. |
| 25_DIAGRAM_LIBRARY | Under Review | Mermaid rendering and full diagram review have not been performed. |
| 26_RESEARCH_AND_REFERENCES | Draft | Recheck technical sources and date/version claims against authoritative references. |
| 27_INDEPENDENT_REVIEWS | Draft | Findings are tracked; specialist spot checks do not replace full independent review. |
| 28_TRACEABILITY_AND_COVERAGE | Draft | Candidate feature map awaits OPEN-41 approval; journey/workflow/state/API/domain maps remain open under OPEN-45 through OPEN-47; security/operations/source-register reconciliation is tracked by OPEN-48 through OPEN-50. The 278-route inventory and path crosswalk (9 name-preserving method/path overlaps, 4 named-path method mismatches, 6 additional parameter-agnostic shape candidates, 259 no shape match), 173-row historical feature-evidence map, 100-row UX pattern crosswalk, 69-row phase/gate/governance crosswalk, and 38-row observed implementation control crosswalk are candidate evidence; semantic route/API mapping, owner dispositions, remaining source registers, and nested JSON dispositions remain incomplete. Migration, test, probe, external issue and nested route and inventory records now have cross-references; inventory content-level disposition remains incomplete; documentation scan entries now link to manifest DOC IDs, but their semantic disposition is not certified; TRC-17 and TRC-18 map historical durability and persistence ADR claims while retaining route-count, target-vs-implementation, migration and verification conflicts; semantics and current external states remain unresolved. AC-to-test matrix is mechanical only. A 28-row historical J-to-UJ map (22 partial, 6 no direct target match) is candidate evidence only; owner disposition remains open. |
| 29_DEVELOPER_IMPLEMENTATION_GUIDE | Draft | Depends on unresolved roadmap, API, and architecture decisions. |
| 99_FINAL_MASTER_BLUEPRINT | Revision Required | Keep under review until critical/high contracts and readiness blockers are resolved. |

## Status vocabulary

- **Discovery:** evidence and scope are still being gathered.
- **Draft:** content exists but has not completed substantive review.
- **Under Review:** content has a defined owner and is being checked.
- **Revision Required:** a review found material gaps or contradictions.
- **Blocked:** progress depends on an external decision, environment, or evidence.
- **Ready for Implementation:** critical behavior and contracts are sufficiently explicit for an implementation work item; this is not production readiness.
- **Deferred:** intentionally outside the current milestone.

## Verification notes

- The current blueprint is a target design. It does not document implementation verification.
- Review counts and finding dispositions are maintained in `27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md`.
- Device behavior, legal interpretation, production controls, and stakeholder approval require evidence outside this documentation review.

# Historical Audit Evidence Index - 2026-10-21

Doc ID: TRC-05 | Status: Historical evidence index; owner review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json) (1,827,134 bytes; SHA-256 `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`). The source file is retained unchanged and remains authoritative for its nested historical details. This index and the [173-row feature evidence crosswalk](AUDIT_FEATURE_EVIDENCE_CROSSWALK.csv) make the evidence addressable; they do not make it current, approve scope, or complete migration. The JSON declares no `$schema` or schema version.

## Snapshot and source limits

The snapshot is dated 2026-10-21 America/Los_Angeles. Initial head: `a30b35bfb01d648632e8df57ab378c00ca9313aa`; final source head: `a771a87be85869fac4cf30c16cab7f4c715a6178`. An external commit occurred during the audit. Its method statement describes a current static reference inventory with targeted deep traces and memory-mode tests; candidate associations do not prove implementation or requirement coverage.

| JSON pointer | Content and recorded scope |
|---|---|
| `/remote` | 9 PR records, 7 issue records, 17 issue comments; row-level snapshot pointers and exact comment bodies are in the [TRC-13 crosswalk](TRACEABILITY_AND_VALIDATION.md#record-audit-external-issue-evidence-crosswalk). No open PRs or observed CI runs in that snapshot. External states are historical; current states were not checked. |
| `/snapshot` | Provenance, tool/runtime versions, 27 initial staged entries, source-hash comparison and concurrent-change notes. |
| `/method` | Audit-method qualification. |
| `/features` | 173 unique `F-*` records; candidate behavior, historical status, evidence, maturity dimensions, acceptance qualifications, urgency, backlog, release and limitations. Crosswalked by F ID; details remain in JSON. |
| `/businessRules` | 248 `BR-*` records, linked by ID to EVD-000243?EVD-000490 in the [legacy rule crosswalk](../06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.csv). The snapshot contains 1,003 code/test reference objects (576 reference paths under `tests/`); 106 rules have at least one reference and 142 have none. It records 33 candidate feature associations across 24 rules; these are targeted, unverified, and not exhaustive. Full excerpts remain in the source JSON. |
| `/journeys` | 28 `J-*` records with personas, terminal outcomes, verification limits and next actions; all source anchors match the current `JOURNEY_REGISTRY.md` (`31_LEGACY_ARCHIVE/docs/experience/JOURNEY_REGISTRY.md`, removed 2026-10-27; recover with `git show 85706db0:Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/experience/JOURNEY_REGISTRY.md`). The [TRC-08 candidate crosswalk](AUDIT_JOURNEY_EVIDENCE_CROSSWALK.csv) maps 22 partially overlapping journeys and 6 with no direct match in the 20-row target journey catalog. All 28 remain historically unverified end to end; mappings are not adoption or implementation evidence. |
| `/routes` | 274 method/path/source-line/durability records, linked row-by-row to the 278-row [TRC-14 crosswalk](TRACEABILITY_AND_VALIDATION.md#record-audit-route-evidence-crosswalk): 70 durable-in-PostgreSQL-mode, 201 ephemeral-header and 3 stateless. The JSON route records do not identify a source file for their line numbers. |
| `/migrations` | 51 path/hash/table/applied-state records, mapped row by row in the [TRC-10 crosswalk](TRACEABILITY_AND_VALIDATION.md#record-audit-migration-evidence-crosswalk). All applied states are unknown; no database was queried. All 51 source hashes match this checkout in a read-only comparison. |
| `/inventory` | 684 path/hash/inspection-scope records, individually compared in the [TRC-15 crosswalk](TRACEABILITY_AND_VALIDATION.md#record-audit-inventory-evidence-crosswalk): 573 hashes match, 108 differ and 3 paths are missing. All source coverage labels say ?Inventoried; not necessarily inspected?; no content-level disposition is implied. |
| `/tests` | 115 files and 1,172 named assertions recorded passed, zero failed or pending, in memory mode; all rows are preserved in the [TRC-11 assertion crosswalk](TRACEABILITY_AND_VALIDATION.md#record-audit-test-evidence-crosswalk). One historical path is absent at this checkout. No browser, PostgreSQL, clean-build or deployment proof. Feature associations include 247 passed-memory-run references and 128 not-run references. |
| `/probes` | Two synthetic probes, mapped in the [TRC-12 crosswalk](TRACEABILITY_AND_VALIDATION.md#record-audit-probe-evidence-crosswalk); one records `executed=false` and `verification=unverified`, and the other is an in-memory simulation. |
| `/inspectionLimitations` | Five explicit limits: prose not fully atomicized; references are not call-graph proofs; journeys were not run end to end; database/provider/deployment acceptance is absent; compatible document/presentation export was unavailable. |
| `/contractInventory` | Aggregate says 46 feature contracts extracted from SSOT detailed headings, with atomic semantic coverage uncertified. The `/features` crosswalk retains 46 `canonicalContractPresent` candidates across 173 features; this matching count does not establish which clauses are complete or semantically approved. |
| `/summaryCounts` | Historical feature-status totals: 87 partially implemented, 6 implemented-unverified, 1 broken/regressed, 75 not implemented, 4 deprecated/rejected. |
| `/artifactValidation` | Historical counts/checks were recorded as passed, but are limited to the dated audit scope; pre-existing formatting failures were noted. Do not reuse as current validation. |
| `/documentationCrossCheck` | 46 scanned-document records joined to manifest DOC IDs, 24 changed-path flags, and 2 absent historical deliverable paths in the [TRC-16 map](TRACEABILITY_AND_VALIDATION.md#record-audit-documentation-crosscheck). Link scanning did not certify semantic acceptance. |
| `/focusedContractReviews` | D-09 and D-10 source reviews and verification limits. |

### Journey evidence crosswalk (TRC-08)

The [CSV](AUDIT_JOURNEY_EVIDENCE_CROSSWALK.csv) joins each source `J-01` through `J-28` to its audit JSON pointer, current source-registry line/hash, terminal outcome and historical verification limit. Candidate `UJ-*` links are static and unapproved; ?no direct match? is limited to the target journey catalog, not a whole-repository absence claim. The recorded terminals and next actions remain reference evidence pending owner review under OPEN-50.

## Feature evidence crosswalk

The [CSV](AUDIT_FEATURE_EVIDENCE_CROSSWALK.csv) retains all 173 feature identities, JSON pointers, historical status basis, registry metadata, scope/urgency/backlog/release, expected and observed behavior at audit time, acceptance qualification, candidate evidence/test paths and counts, canonical-contract presence, and the existing candidate local FEAT mapping. It is not a revalidation. Across the source records are 688 reference candidates across 68 features, 375 test associations across 95 features, 46 canonical contracts, and 174 numbered subfeatures across 20 features. Candidate associations are not exhaustive coverage.

The feature evidence includes 10 maturity dimensions; `rolesAndPermissions` is heterogeneous (19 objects and 154 strings). The crosswalk does not flatten that field; use the unchanged JSON for its exact structure.

## Material qualifications and discrepancies

- All 274 `/routes` entries match exact method/path entries in the 278-row [observed reference API inventory](../13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_REFERENCE_API_INVENTORY.md), as linked in TRC-14. The four additional inventory routes are `POST /api/v1/billing/checkout`, `/portal`, `/stripe-webhook`, and `/webhook`; retain the snapshot/scope delta rather than forcing equal totals.
- `/probes/0/result` records `status=passed`, `score=100`, `executed=false`, `verification=unverified`. That is not a verification pass. `/probes/1` records 6 synthetic jobs, 9 executions and 3 duplicates using a memory store and timing assumptions.
- D-09 (`/focusedContractReviews/0`) links F-07/F-52, BR-048 and X-11; it describes completion without the required assessment and details memory-mode test limits. D-10 (`/focusedContractReviews/1`) links F-52/F-96 and X-11; the revocation cross-proof and restart behavior were not executed. These are dated findings, not current defect claims.
- The snapshot feature status `F-08` is the single broken/regressed row. None of the status totals is an approved scope decision or current implementation status.
- Of the 684 inventory paths, the three missing at this checkout are `/inventory/199` (`apps/worker/src/mail-provider.ts`), `/inventory/287` (a Graphify hook-session cache), and `/inventory/671` (`tests/unit/transactional-mail.test.ts`). Preserve the source's row-level data; do not infer deletion or a migration failure from path/hash drift.

## Disposition

Retain the original JSON as historical evidence. This index and crosswalk improve discoverability and traceability only. The manifest remains `Read but partially processed`: detailed nested findings, business-rule reference excerpts, journey dispositions, feature/rule/journey semantics and semantic migration dispositions have not all been migrated and revalidated. Probe records now have row-level pointers but remain unverified; external PR, issue and comment records have snapshot pointers and exact comment bodies, while current status and owner mapping remain unchecked. The 46 documentation cross-check records map to manifest rows; semantic acceptance and the two absent historical deliverables remain unresolved. The test crosswalk preserves assertion names/statuses as historical pointers, not current test results or semantic coverage proof. The 51 migration records now have file-identity pointers only; database execution and schema/data mapping remain unknown. No source cleanup is authorized by these artifacts.

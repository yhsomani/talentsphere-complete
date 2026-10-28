# Traceability, Coverage & Validation Report

Doc ID: TRC-01 · Owner: Documentation Architect · Version 1.0 · Status: Draft · Date 2026-10-25

Canonical SSOT §7 feature identities and the local feature decomposition have a **candidate, unapproved mapping** in [SSOT_FEATURE_CROSSWALK](SSOT_FEATURE_CROSSWALK.md). It is not implementation coverage evidence; OPEN-41 remains open until the product owner approves the links and gaps.

Section-based source-to-target audit findings across contracts, controls, phases, governance, and UX are consolidated in [SSOT_RECONCILIATION_AUDIT](SSOT_RECONCILIATION_AUDIT.md). Candidate row-level maps include the [100-row UX pattern crosswalk](#record-ux-pattern-source-crosswalk) and [69-row phase/gate/governance crosswalk](PHASE_GATE_GOVERNANCE_CROSSWALK.md), plus the [observed implementation control crosswalk](#record-observed-implementation-control-crosswalk); these are candidate maps and establish neither approval nor implementation. The 2026-10-21 structured audit evidence is indexed in [AUDIT_EVIDENCE_2026-10-21_INDEX](AUDIT_EVIDENCE_2026-10-21_INDEX.md), with a 173-row historical feature crosswalk and the [28-row historical journey evidence crosswalk](AUDIT_JOURNEY_EVIDENCE_CROSSWALK.csv); the original JSON remains the detail source. The 54 source SCI identities and 16 CON identities have candidate maps in the [SCI crosswalk](../13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.md) and [CON crosswalk](../13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.md). A 278-row [observed route-to-target map](../13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_ROUTE_TARGET_CROSSWALK.csv) records 9 name-preserving method/path overlaps and 4 same-name-path method mismatches; among 265 routes without a name-preserving path match, 6 have parameter-agnostic shape candidates and 259 have no shape match. Semantic contract mapping remains open. OPEN-46/48–50 track unresolved dispositions; these reports do not imply source adoption or implementation.

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


<a id="record-adr-015-persistence-crosswalk"></a>
## Preserved source record: ADR_015_PERSISTENCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ADR_015_PERSISTENCE_CROSSWALK.md -->
<a id="record-adr-015-persistence-crosswalk--adr-015-persistence-crosswalk"></a>
# ADR-015 Persistence Crosswalk

Doc ID: TRC-18 · Status: Candidate mapping; not approved · Source: DOC-000133, docs/engineering/adr/ADR-015-core-loop-persistence.md.

The source ADR is dated 2026-10-10 and says “Accepted for this branch, pending owner ratification.” It describes the branch implementation decision to persist core-loop writes in PostgreSQL while retaining a boot-hydrated Map read model. The target blueprint's ADR-T05 selects PostgreSQL for all reads and writes, without an in-process Map read model. This is a current-implementation versus target-design difference; neither statement is silently substituted for the other.

The row-level source anchors and dispositions are in [ADR_015_PERSISTENCE_CROSSWALK.csv](ADR_015_PERSISTENCE_CROSSWALK.csv), EVD-003073 through EVD-003082.

<a id="record-adr-015-persistence-crosswalk--reconciliation"></a>
## Reconciliation

- The ADR's write sequence is commit first, then update the Map read model. It also records per-record base checks, database predicates, and a 409 conflict response. The design explicitly says these guards prevent selected lost updates but do not prevent stale reads between API writers.
- The ADR's operating constraint is one API process per database, guarded by a PostgreSQL session advisory lock; startup refuses a second writer, and lock loss makes the API unhealthy. Out-of-band SQL changes require restart and rehydration. Boot hydration grows with core data; the ADR's exit path is SQL reads and removal of Maps before scaling replicas.
- The ADR's entity scope grew across migrations 00043, 00044 and 00046 and a later messaging addition. Its route durability statements and test results belong to that dated branch and do not establish current coverage or hosted deployment state.
- Migration 00043 includes consequential uniqueness, foreign-key and token-storage changes. The ADR requires owner ratification before applying those changes to populated data and flags duplicate case-insensitive emails. The 2026-10-23 repository audit (DOC-000171) (`31_LEGACY_ARCHIVE/docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`, removed 2026-10-27; recover with `git show 85706db0:Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`) separately reports the hosted identity/schema mismatch at §A line 18, 52 local migrations at §B line 35, and migration/single-writer blockers at §D lines 69-70 and §E lines 79-82. These are dated audit statements, not current external-state verification.
- Target ADR-T05 remains the blueprint's proposed SQL-only system-of-record decision. OPEN-52 now asks the architecture, database and platform owners to approve a compatible migration/implementation bridge, acceptance evidence, and the point at which single-writer operation may be retired.

<a id="record-adr-015-persistence-crosswalk--review-limits"></a>
## Review limits

This was a full read of the ADR and a documentation cross-check against current architecture notes, target ADR-T05, data/migration documents, readiness and the later repository audit. I did not inspect migration SQL, rerun PostgreSQL tests, check CI, query a hosted database, or verify the current deployment. No implementation or migration status is upgraded by this crosswalk.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ADR_015_PERSISTENCE_CROSSWALK.md -->


<a id="record-architecture-durability-report-crosswalk"></a>
## Preserved source record: ARCHITECTURE_DURABILITY_REPORT_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.md -->
<a id="record-architecture-durability-report-crosswalk--historical-architecture-durability-report-crosswalk"></a>
# Historical Architecture Durability Report Crosswalk

Doc ID: TRC-17 · Status: Candidate mapping; not approved · Source: [DOC-000158](../00_CONTROL_CENTRE/KNOWLEDGE_PRESERVATION_MANIFEST.csv), docs/reports/ARCHITECTURE_DURABILITY_REPORT.md.

This crosswalk maps the dated 2026-10-22 report at Git HEAD 83dc7d247efbd3b3c3312bf74ac49978d33e924 to the current target blueprint and later evidence. It records what the report asserted, where the subject belongs, and known conflicts. The report is evidence about that recorded revision, not a current security assessment, benchmark, production certification, or approval of its proposed fixes.

The row-level source anchors and dispositions are in [ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.csv](ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.csv), EVD-003061 through EVD-003072.

<a id="record-architecture-durability-report-crosswalk--reconciliation-notes"></a>
## Reconciliation notes

- **Persistence and route counts:** The report's 54 durable / 3 stateless / 217 ephemeral split is a distinct dated classification of 274 routes. The later audit crosswalk records 70 / 3 / 201 over 274 records, while the observed reference inventory has 278 routes. Keep these populations separate until route-level semantic disposition is approved.
- **Scale estimates:** The 2GB and tens-of-seconds projection is based on an assumed workload. It is not a measured capacity result. Current architecture documentation does identify hydrated reads and single-writer scope as trade-offs.
- **Security findings:** OTP hashing, referee expiry, RLS database role, assessment-session persistence, and AI quota claims remain historical until rechecked against current source and required tests. The target contracts specify intended controls, not implementation proof.
- **Billing:** The report's statement that Stripe was absent or simulated predates the 2026-10-23 UTC repository audit, which records Stripe backend and durable PostgreSQL billing after PR #71. This supersession concerns the code snapshot; webhook delivery, hosted schema, commercial approval, and production behavior remain separate questions.
- **Deployment:** The Oracle Caddy and image findings refer to the report's dated configuration. They need current configuration and staging evidence before they can be closed or presented as present-day defects.
- **Identity:** SEC-* and OPS-* are source-local identifiers. Do not reuse them as target RISK-*, OPEN-*, or TEST-* IDs.

<a id="record-architecture-durability-report-crosswalk--review-limits"></a>
## Review limits

This pass read the full report and mapped its major claim groups to current target documents and known later evidence. It did not re-run the report's checks, inspect the current source code for each security claim, test the running app, inspect hosted database roles, verify provider delivery, or exercise Oracle staging. Therefore the crosswalk does not mark any report finding fixed, current, or production-verified.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.md -->


<a id="record-audit-documentation-crosscheck"></a>
## Preserved source record: AUDIT_DOCUMENTATION_CROSSCHECK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_DOCUMENTATION_CROSSCHECK.md -->
<a id="record-audit-documentation-crosscheck--historical-documentation-cross-check-map"></a>
# Historical Documentation Cross-Check Map

Doc ID: TRC-16 | Status: Historical audit-to-manifest pointer map; content review incomplete | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/documentationCrossCheck`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_DOCUMENTATION_CROSSCHECK.csv) maps the 46 scanned-document records to their exact manifest DOC IDs and preserves the audit's category, disposition, link-scan flag, semantic-acceptance flag, and whether each path appears in the 24-item changed-since-snapshot list. It also records the two historical missing-deliverable paths, both still absent in the current checkout.

<a id="record-audit-documentation-crosscheck--limits-and-disposition"></a>
## Limits and disposition

The audit says its local link scan checked file targets, not heading anchors or external URLs, and explicitly did not certify whole-document semantic acceptance for these records. A manifest join establishes discoverability, not completeness or cleanup eligibility. The two missing paths (`project-maintenance.sh` and `scripts/tests/project-maintenance.test.sh`) are merely preserved as audit claims; their purpose and whether they should exist remain unresolved. No file was created or deleted. DOC-000191 and affected manifest source entries retain their existing processing statuses.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_DOCUMENTATION_CROSSCHECK.md -->


<a id="record-audit-external-issue-evidence-crosswalk"></a>
## Preserved source record: AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK.md -->
<a id="record-audit-external-issue-evidence-crosswalk--historical-external-issue-evidence-crosswalk"></a>
# Historical External Issue Evidence Crosswalk

Doc ID: TRC-13 | Status: Historical external-record pointer map; owner review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/remote`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK.csv) maps 9 pull-request snapshots, 7 issue snapshots, and all 17 issue comments to their JSON pointers (EVD-002022 through EVD-002054). It retains PR titles, recorded merge metadata, issue/comment URLs, snapshot states, and exact comment bodies with body hashes. Candidate destinations are the open-decision and review registers; no issue-to-OPEN/ADR mapping is asserted.

<a id="record-audit-external-issue-evidence-crosswalk--limits-and-disposition"></a>
## Limits and disposition

All state values are from the 2026-10-21 audit snapshot. Current GitHub status, issue titles and initial bodies, acceptance criteria, and owner dispositions were not checked. The JSON has no issue title/body fields; a comment's content must not be treated as the complete issue requirement. No current state, approval, or closure is inferred. This crosswalk improves row-level discoverability and preserves the snapshot's comments; it does not replace source review or current-state verification. DOC-000191 remains partially processed and no cleanup is authorized.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK.md -->


<a id="record-audit-inventory-evidence-crosswalk"></a>
## Preserved source record: AUDIT_INVENTORY_EVIDENCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_INVENTORY_EVIDENCE_CROSSWALK.md -->
<a id="record-audit-inventory-evidence-crosswalk--historical-audit-inventory-crosswalk"></a>
# Historical Audit Inventory Crosswalk

Doc ID: TRC-15 | Status: Inventory identity comparison; content review incomplete | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/inventory` (684 entries). The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_INVENTORY_EVIDENCE_CROSSWALK.csv) assigns EVD-002329 through EVD-003012 and records each path, historical hash, current hash, current presence, and original coverage label. The read-only comparison found 573 matching hashes, 108 different hashes, and 3 missing paths.

<a id="record-audit-inventory-evidence-crosswalk--limits-and-disposition"></a>
## Limits and disposition

The source calls every entry “Inventoried; not necessarily inspected.” The crosswalk verifies path/hash identity only; it does not inspect or preserve each file's material content, classify every path, or prove that a changed/missing file was deleted. It does not make a source eligible for cleanup. Continue using the original JSON for its detailed historical inventory, and complete file-by-file content classification and source-to-destination mapping before any cleanup decision. DOC-000191 remains partially processed.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_INVENTORY_EVIDENCE_CROSSWALK.md -->


<a id="record-audit-migration-evidence-crosswalk"></a>
## Preserved source record: AUDIT_MIGRATION_EVIDENCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_MIGRATION_EVIDENCE_CROSSWALK.md -->
<a id="record-audit-migration-evidence-crosswalk--historical-migration-evidence-crosswalk"></a>
# Historical Migration Evidence Crosswalk

Doc ID: TRC-10 | Status: Historical evidence pointer map; owner review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/migrations` (51 records). The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The companion [CSV](AUDIT_MIGRATION_EVIDENCE_CROSSWALK.csv) gives each record a stable evidence ID (EVD-000797 through EVD-000847), source JSON pointer, recorded migration hash, current checkout hash, table names, recorded applied state, and candidate links to the target migration and physical-design documents.

<a id="record-audit-migration-evidence-crosswalk--verified-snapshot-facts"></a>
## Verified snapshot facts

- All 51 referenced migration files exist in this checkout, and each file hash matches the hash recorded in the audit snapshot.
- The records list 112 table-name references in total; an empty table list remains empty.
- All 51 `appliedState` values say `unknown; no test/target database queried`.

<a id="record-audit-migration-evidence-crosswalk--limits-and-disposition"></a>
## Limits and disposition

This verifies only the historical file identity against the current checkout. A hash match does not establish whether a migration ran, what data exists, whether a migration is safe, or whether the reference schema maps to the target design. Candidate destination links are for traceability, not approval or a one-to-one schema mapping. Database inventory and migration scope remain blocked by OPEN-17 and OPEN-B33. The JSON manifest remains partially processed; tests, probes, external issue records, and other nested evidence still require review. No source file was changed and no cleanup is authorized.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_MIGRATION_EVIDENCE_CROSSWALK.md -->


<a id="record-audit-probe-evidence-crosswalk"></a>
## Preserved source record: AUDIT_PROBE_EVIDENCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_PROBE_EVIDENCE_CROSSWALK.md -->
<a id="record-audit-probe-evidence-crosswalk--historical-probe-evidence-crosswalk"></a>
# Historical Probe Evidence Crosswalk

Doc ID: TRC-12 | Status: Historical probe pointer map; verification review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/probes`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_PROBE_EVIDENCE_CROSSWALK.csv) preserves both probe records as EVD-002020 and EVD-002021, including method, result, and recorded limits.

<a id="record-audit-probe-evidence-crosswalk--interpretation"></a>
## Interpretation

- `arbitrary challenge text` reports `status=passed` and `score=100` while also recording `executed=false` and `verification=unverified`. It is not a pass or verification result.
- `batch lease expiry` reports 6 jobs, 9 executions, and 3 duplicated jobs from a synthetic `MemoryJobStore` scenario with timing assumptions. It does not establish behavior with PostgreSQL or a live provider.

These are dated audit records, not current tests. No probe was rerun; the test strategy and failure analysis are candidate documentation destinations, not proof that their requirements are implemented.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_PROBE_EVIDENCE_CROSSWALK.md -->


<a id="record-audit-route-evidence-crosswalk"></a>
## Preserved source record: AUDIT_ROUTE_EVIDENCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_ROUTE_EVIDENCE_CROSSWALK.md -->
<a id="record-audit-route-evidence-crosswalk--historical-route-evidence-crosswalk"></a>
# Historical Route Evidence Crosswalk

Doc ID: TRC-14 | Status: Historical route pointer map; semantic review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/routes`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_ROUTE_EVIDENCE_CROSSWALK.csv) links all 274 route records (EVD-002055 through EVD-002328) to the exact method/path entry in the 278-row observed API inventory. The recorded durability totals are 70 `registered durable (PG mode)`, 201 `ephemeral header`, and 3 `stateless`.

<a id="record-audit-route-evidence-crosswalk--limits-and-disposition"></a>
## Limits and disposition

All 274 method/path keys match one inventory row. Four inventory rows have no counterpart in this audit JSON route list; the broader API inventory documents those separately. The JSON route objects provide a line number but no source-file path, so that line is retained as reported metadata and not presented as a verified source anchor. The join establishes a route-string cross-reference only; it does not establish semantic equivalence with target APIs, feature presence or absence, current execution, persistence behavior, or owner approval. The audit index and JSON remain the detailed historical sources; current code/runtime was not revalidated.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_ROUTE_EVIDENCE_CROSSWALK.md -->


<a id="record-audit-test-evidence-crosswalk"></a>
## Preserved source record: AUDIT_TEST_EVIDENCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_TEST_EVIDENCE_CROSSWALK.md -->
<a id="record-audit-test-evidence-crosswalk--historical-test-evidence-crosswalk"></a>
# Historical Test Evidence Crosswalk

Doc ID: TRC-11 | Status: Historical test-record pointer map; owner review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/tests`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_TEST_EVIDENCE_CROSSWALK.csv) preserves all 1,172 recorded assertion names and statuses from 115 files as individual JSON-pointer rows (EVD-000848 through EVD-002019). It includes the recorded file status, feature IDs parsed from test names as candidate labels, and whether each historical path currently exists. Four assertion rows point to the one absent path, `tests/unit/transactional-mail.test.ts`.

<a id="record-audit-test-evidence-crosswalk--historical-record-and-limits"></a>
## Historical record and limits

The snapshot records 1,172 passed, 0 failed, and 0 pending assertions in memory mode on 2026-10-21. These are historical claims from the audit JSON, not a current run or proof of browser, PostgreSQL, clean-build, deployment, security, or production behavior. Test names and embedded feature IDs do not establish semantic requirement coverage. The absent path's status is unresolved; no deletion or migration is inferred. Target TEST IDs and the target test strategy are design artifacts, not links proving execution.

This is a locator and preservation crosswalk. The JSON remains the detailed historical source; no application tests or source files were changed or run. DOC-000191 remains partially processed, and no cleanup is authorized.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_TEST_EVIDENCE_CROSSWALK.md -->


<a id="record-feature-registry-metadata-crosswalk"></a>
## Preserved source record: FEATURE_REGISTRY_METADATA_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/FEATURE_REGISTRY_METADATA_CROSSWALK.md -->
<a id="record-feature-registry-metadata-crosswalk--feature-registry-metadata-crosswalk"></a>
# Feature Registry Metadata Crosswalk

Doc ID: TRC-03 · Status: Candidate preservation map; owner review required · Date: 2026-10-25

The protected root SSOT feature inventory and `docs/registries/FEATURE_REGISTRY.md` share 173 `F-*` identities, but the registry also carries source category, priority (`P`), phase, and dependency metadata. Those fields are not implementation status and do not automatically map to the target capability map's local priorities or Ph0–Ph4.

The [machine-readable crosswalk](FEATURE_REGISTRY_METADATA_CROSSWALK.csv) has one row per `F-01…F-173`. It preserves the registry name/category/priority/phase/dependencies, the root SSOT feature name, and the candidate local FEAT IDs/match from [SSOT_FEATURE_CROSSWALK](SSOT_FEATURE_CROSSWALK.md). This is a documentation preservation aid; product owners must decide whether source metadata remains useful and how it relates to target sequencing. OPEN-41 remains open for identity and metadata disposition.

Source `FEATURE_REGISTRY.md` states implementation status belongs to the dated feature-status report, not the canonical registry. Do not treat source priority or phase as current implementation readiness, and do not infer a migration or retirement from a blank candidate mapping.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/FEATURE_REGISTRY_METADATA_CROSSWALK.md -->


<a id="record-observed-implementation-control-crosswalk"></a>
## Preserved source record: OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.md -->
<a id="record-observed-implementation-control-crosswalk--observed-implementation-control-crosswalk"></a>
# Observed Implementation Control Crosswalk

Doc ID: TRC-07 | Owner: Documentation Architect | Version: 1.0 | Status: Candidate preservation map; owner review required | Date: 2026-10-25

This crosswalk maps dated reference claims in four repository documents to candidate target documents. It separates implementation observations, source requirements, historical test results, stale prose, and future target design. It is not a code audit, current test report, adopted requirement, or approval. Every row remains an unapproved candidate. The companion [CSV](OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.csv) preserves 38 row-level claims, source document/evidence IDs, revision and content hash, anchors, target candidates, comparison labels, and unresolved disposition.

<a id="record-observed-implementation-control-crosswalk--sources-and-provenance"></a>
## Sources and provenance

| Source | Manifest record | Source revision | Content SHA-256 | Scope note |
|---|---|---|---|---|
| `docs/engineering/DATABASE.md` (`31_LEGACY_ARCHIVE/docs/engineering/DATABASE.md`, removed 2026-10-27; recover with `git show 85706db0:Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/engineering/DATABASE.md`) | DOC-000137 / EVD-000137 | `431c425a`, 2026-10-23 | `0879ff0703827fa3253380daca3232a45f78407fe5f21e31f92e8706a4915f82` | Static storage, migration, privacy and RLS observations; no live DB proof. |
| `docs/quality/OPERATIONS.md` (`31_LEGACY_ARCHIVE/docs/quality/OPERATIONS.md`, removed 2026-10-27; recover with `git show 85706db0:Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/quality/OPERATIONS.md`) | DOC-000152 / EVD-000152 | `2aea1085`, 2026-10-24; current-build section checked 2026-10-23 | `f4977e0a82c853064fd27137f03b8ae7fc836cba68955f6fb6b2b01c81627c18` | Sections 1-8 are a target operating model; section 9 is reference implementation/operations. |
| `docs/quality/SECURITY.md` (`31_LEGACY_ARCHIVE/docs/quality/SECURITY.md`, removed 2026-10-27; recover with `git show 85706db0:Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/quality/SECURITY.md`) | DOC-000153 / EVD-000153 | `2aea1085`, 2026-10-24 | `dda6537adf773b945e8fbd2ffae16e050902d0ae76bc392a811df6a100bb7006` | Source limits evidence scope and distinguishes requirements from assurance. |
| `docs/quality/TESTING.md` (`31_LEGACY_ARCHIVE/docs/quality/TESTING.md`, removed 2026-10-27; recover with `git show 85706db0:Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/quality/TESTING.md`) | DOC-000154 / EVD-000154 | `335e9827`, 2026-10-23 | `fbe7077f12d7ea0893fdc04a3a2d88b35ca3a93a4368e74fc1882df9252b2f11` | Historical baseline is dated 2026-10-21; coverage claims are not current test results. |

<a id="record-observed-implementation-control-crosswalk--interpretation"></a>
## Interpretation

- `candidate-partial`, `candidate-conflict`, and `candidate-stale-reference` describe the comparison in named target files; they do not select future policy.
- `candidate-historical-evidence` preserves dated results. `candidate-covered` means a similar control or caveat exists, not that implementation is verified.
- `VerificationState` is conservative: current code/runtime was not revalidated for these rows in this checkpoint. The four source Markdown files were read and content hashes recorded.
- Repeated topics (erasure, RLS, delivery and export) retain distinct source evidence; they are not independent proof. Target design remains subject to owner review. Root `SSOT.md` remains unchanged.

<a id="record-observed-implementation-control-crosswalk--principal-unresolved-dispositions"></a>
## Principal unresolved dispositions

1. Reconcile single-writer API topology, Map-backed durability, worker duplicate execution and target outbox/fencing design.
2. Complete table/module durability and erasure/export inventories, retry behavior, legal holds, shared-record retention and deletion evidence.
3. Map source RLS/grant limits to target tenant policies and define evidence beyond `RLS enabled`.
4. Map provider acceptance versus delivery, queue retry/idempotency and integration incident handling.
5. Keep authentication, hashing, session and billing reference behavior separate from target designs; verify current claims against code when required.
6. Separate historical tests from target test specifications; close accessibility, performance and release-evidence gaps.
7. Route the `z.coerce.boolean()` discrepancy to a separately authorized code task; this initiative does not change source code.

<a id="record-observed-implementation-control-crosswalk--validation-limits"></a>
## Validation limits

CSV structure and row IDs can be checked mechanically; source anchors can be compared to current text. No database query, migration, app test, browser, deployment, live provider, legal review or production control was exercised. Source Markdown and target design documents remain in place; no cleanup is authorized by this map.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.md -->


<a id="record-route-authorization-finding-crosswalk"></a>
## Preserved source record: ROUTE_AUTHORIZATION_FINDING_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ROUTE_AUTHORIZATION_FINDING_CROSSWALK.md -->
<a id="record-route-authorization-finding-crosswalk--route-authorization-finding-crosswalk"></a>
# Route Authorization Finding Crosswalk

Doc ID: TRC-04 | Status: Candidate preservation map; owner review required | Date: 2026-10-25

The [CSV crosswalk](ROUTE_AUTHORIZATION_FINDING_CROSSWALK.csv) preserves CF-31 through CF-45 from `docs/system-model/06-route-authorization.md`, including each finding, evidence anchor, source rationale, candidate target documents, and related open decisions. The source labels these findings open in its review; this map does not establish that any defect is present in current code. The review says claims are reported unless marked Fixed or Tested, and routes outside its listed groups were not read. Revalidate implementation and tests before changing security or product behavior.

The candidate target links organize follow-up only. They do not imply that target policy has been approved or that the source finding has been resolved. OPEN-44, OPEN-48 and OPEN-50 retain the related authorization and traceability decisions.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ROUTE_AUTHORIZATION_FINDING_CROSSWALK.md -->


<a id="record-ux-pattern-source-crosswalk"></a>
## Preserved source record: UX_PATTERN_SOURCE_CROSSWALK

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/UX_PATTERN_SOURCE_CROSSWALK.md -->
<a id="record-ux-pattern-source-crosswalk--ux-pattern-source-crosswalk"></a>
# UX Pattern Source Crosswalk

Doc ID: TRC-06 | Status: Candidate preservation map; owner review required | Date: 2026-10-25

The [CSV crosswalk](UX_PATTERN_SOURCE_CROSSWALK.csv) preserves all 100 root SSOT Appendix D IDs, titles, line anchors and exact Symptom/Cost/Fix/Applies-to/Acceptance fields, alongside candidate UX destinations, relationship, and concise residuals from a read-only comparison of seven target UX files. It does not establish owner approval, implementation, or current behavior. Exact means substantive overlap, not verbatim equivalence. `No target` means none was located in the reviewed seven UX files, not that no related content exists elsewhere.

Material conflicts include loading and mutation feedback (M-01/02/18/82), progress and timeouts (M-04/06), success and confirmation patterns (M-16/17), form validation and autosave (M-21/22/24), offline action scope (M-42), Undo timing (M-47), error privacy (M-34), notification disclosure (M-52/54), stale-write status (M-66), optimistic saves (M-70), and motion duration (M-73). OPEN-50 and relevant OPEN-UX records remain unresolved.

The source says the 100 patterns should be applied through feature specifications rather than copied into each one. This crosswalk therefore provides traceability and residuals without duplicating every pattern throughout the feature corpus. Source citations embedded in the old register and its quantitative claims have not been independently researched or verified.
<!-- source-record-end: Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/UX_PATTERN_SOURCE_CROSSWALK.md -->

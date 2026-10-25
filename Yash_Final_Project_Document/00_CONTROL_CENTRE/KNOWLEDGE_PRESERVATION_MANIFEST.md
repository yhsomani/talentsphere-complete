# Knowledge Preservation Manifest

**Status: inventory established; source processing and cleanup are incomplete.** This register is the controlling record for legacy-source review. The companion CSV has one row per inventoried source and stable `DOC-*` / `EVD-*` identifiers. Do not treat inventory presence or provisional path-based classification as evidence that a source was read, migrated, or is eligible for deletion.

## Scope and baseline

- Repository root: `C:/Users/yashs/OneDrive/Desktop/talentsphere-complete`.
- Protected destination: `Yash_Final_Project_Document/`. Its 112 files present before this turn were preserved; the new source manifest CSV was added after the baseline enumeration and is included in the baseline CSV. The baseline CSV excludes itself and is separately required to remain present.
- External source inventory: 190 Markdown/text documents plus `docs/reports/AUDIT_EVIDENCE_2026-10-21.json` and 13 related non-text utility artifacts (204 total source records). The added non-text entries are protected/out of scope and remain uninspected. The JSON audit evidence is structured source material, not a disposable generated cache. The 28 historical journey records are also crosswalked to target UJ candidates (22 partial, 6 without a direct target journey); the map is unapproved and the manifest record remains partially processed.
- SSOT inventory: one accessible `SSOT.md`, at repository root. SHA-256 at inventory start: `891CB4A472B7BAA7C9259778922AE26AC46D8BDD97508B2B05C9FD0A2792F68D`. It is protected from modification, rename, move, and deletion.
- No external source has been deleted. No source is marked eligible for cleanup. Some entries are explicitly ineligible or out of scope; every unreviewed or incompletely mapped entry remains unresolved and must be preserved.
- `graphify-out/`, `.agents/`, `.claude/`, `.github/`, `.playwright-*`, `.reticle/`, `.omc/`, application, test, deployment, and build/configuration artifacts are not included as source-document cleanup candidates merely because some are text or JSON. Their exclusions are recorded here as generated evidence, tool instructions/state, or protected technical artifacts; none were changed.

## Processing status vocabulary

Use these exact states in the CSV as review advances: `Read and fully processed`, `Read but partially processed`, `Not yet inspected`, `Unreadable`, `Out of scope`, `Preserved without migration`, `Migrated and verified`, `Retained as historical evidence`, `Eligible for cleanup`, `Deleted after verification`, `Protected from deletion`, and `Unresolved`. A source can carry a processing status plus a disposition; do not mark it migrated or eligible until destinations and evidence are recorded.

`SourceClassification` is provisional until content review. `TBD`, `Not yet assessed`, and `Not evaluated; do not delete` are deliberate unresolved values, not omissions. Assign each verified destination as a repository-relative path and cite the exact headings, IDs, rows, tests, or source evidence used. Record conflicts in the relevant open-decision, risk, ADR, or historical record before marking preservation complete.

## Inventory files

- [Machine-readable source manifest](KNOWLEDGE_PRESERVATION_MANIFEST.csv)
- [Protected destination tree baseline](PROTECTED_DOCUMENT_TREE_BASELINE.csv)

## Processing snapshot (2026-10-25)

The current 204-row manifest records 174 sources as `Read but partially processed`, 28 as `Out of scope`, 1 as `Read and fully processed`, and 1 as `Retained as historical evidence`. No source is eligible for cleanup. The high partial count reflects unfinished destination mapping, semantic review, evidence validation, or source-level disposition; it must not be read as 174 completed migrations. Recompute these totals from the CSV whenever statuses change.

## Initial findings

The documentation tree includes canonical intent (`SSOT.md`), product and engineering docs, route/security/test/operations material, dated audits, feature status and plan matrices, conflict/gap registers, and agent/tool-produced records. They have different authority and retention needs. Dated audit findings are historical evidence and cannot be silently rewritten as current requirements. Tool instructions/configuration and generated outputs are not automatic cleanup targets. The initial content review confirmed conflicts around target versus implemented architecture, phase vocabularies, privacy thresholds, pricing, ADR-015, and role models; preserve these as open conflicts until source-level mapping and the relevant owner decision are complete.

## Cleanup gate

No file may be deleted based on a filename, age, duplicate topic, or directory-level judgment. For each candidate, the CSV must first record source content reviewed, unique information, destination path(s), supporting evidence, contradictions/history, non-documentation dependency checks, and a final rationale. Any unknown, unreadable, unverified, or unmapped source remains preserved. Deletions, if later made, must be individual and followed by checks that every `SSOT.md` and every baseline file still exists.

## Read-only source review: `docs/` and root `SSOT.md`

A read-only subagent reviewed the 49 files under `docs/` (48 Markdown and one JSON) plus the root `SSOT.md`. Individual read scope is recorded in the review findings; partial means sections or structure were sampled, and the largest feature matrices and JSON evidence ledger were not read in full. The CSV marks these records `Read but partially processed` because migration and destination verification are still pending, including for sources fully read.

High-value mappings and conflicts found:

- `docs/product/PRD.md` → candidate destinations in product vision, capability map, feature specs, and success metrics. It covers the north-star loop, personas/JTBD, non-goals, launch scope, and measures. Feature-register authority differs between PRD and SSOT/registry.
- `docs/registries/FEATURE_REGISTRY.md` → feature hierarchy/specifications and ID registry (F-01…F-173, phases, dependencies, contract template). This is identity/intent evidence, not implementation status.
- `docs/registries/BUSINESS_RULE_REGISTRY.md` and root `SSOT.md` §19 → [source-aware rule crosswalk](../06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.md) and [row-level mapping](../06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.csv), plus the proposed [BR-T target registry](../06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md). All 248 BR and 8 MIG identities are represented across both sources; 252 rule texts match after ID normalization and 4 differ. Current dispositions are 9 exact, 67 partial, 8 conflicts, 1 superseded and 171 no-match. OPEN-43 owner review remains required; both sources stay unchanged and no rules are cleared for deletion.
- `docs/engineering/` and `docs/quality/` → architecture, data, API, security, QA, operations, and developer guide. The target stack differs from observed implementation; hosted migration is an explicit gate; ADR-015 ratification and ADR-016 proposal status must remain explicit.
- `docs/engineering/DATABASE.md` and `docs/quality/{OPERATIONS,SECURITY,TESTING}.md` also map to the 38-row candidate [observed implementation control crosswalk](../28_TRACEABILITY_AND_COVERAGE/OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.md). It preserves dated hashes/anchors and separates observed behavior, historical tests, stale claims, and target design. All four source entries remain partially processed; no code/runtime checks or cleanup were performed.
- `docs/experience/` → journeys, screens, navigation, and UX. The route audit reports target routes missing from mounted routes; keep intent and observed implementation distinct.
- `docs/governance/GAP_ANALYSIS.md` and `docs/system-model/03-conflict-register.md` → open decisions and traceability. Material conflicts include target-vs-built stack, privacy thresholds, pricing, role model, ADR-015, feature-register authority, and target-vs-mounted routes.
- `docs/system-model/01-inventory-and-coverage.md`, `02-flows.md`, `04-conditions.md`, `05-audit.md`, and `06-route-authorization.md` → implementation coverage, diagrams, business condition evidence, audit limits, and authorization/security. The route audit retains CF-31–45; these are high-risk evidence and not cleared by a summary.
- Dated `docs/reports/*` → independent reviews, risks, roadmap, and traceability as historical evidence. Findings span different commits; dated status, pass counts, and readiness statements must not be recast as current. Notable history includes core-loop changes, test/browser exclusions, Stripe/Supabase gates, PR/issue lineage, and maintenance-tool findings.
- `docs/reports/AUDIT_EVIDENCE_2026-10-21.json` contains 17 top-level evidence members (173 feature, 248 rule, 28 journey, 274 route, 51 migration, 684 inventory, test, probe, source-snapshot and focused-review records). The source SHA-256, current migration hashes and inventory-path drift were checked; a 173-row candidate feature crosswalk and addressable [historical evidence index](../28_TRACEABILITY_AND_COVERAGE/AUDIT_EVIDENCE_2026-10-21_INDEX.md) now preserve its provenance and selected evidence. The unchanged JSON remains the detail authority; nested rule excerpts, route/migration evidence, probes, and external issue history are not fully migrated, so DOC-000191 remains partially processed and ineligible for cleanup. The 28 historical journey records are also crosswalked to target UJ candidates (22 partial, 6 without a direct target journey); the map is unapproved and the manifest record remains partially processed.
- Root `SSOT.md` is canonical intent and is **protected unchanged**. Candidate source maps now include the 100-row UX pattern crosswalk and 69-row phase/gate/governance crosswalk; both preserve source identifiers and gaps without owner approval or equivalence claims. The source-to-destination review remains incomplete. It contains
No source has been cleared for deletion by this review. All candidate destinations above remain provisional until the target document is checked for the source's unique rules, IDs, exceptions, and evidence. Retain every source during this checkpoint.

## Other root and tool documents

A targeted manual sample review covered the root `README.md`, `ARCHITECTURE.md` (read during initial project orientation), `BRAIN/BRAIN.md`, `BRAIN/MEMORY.md`, Reticle guidance, Obsidian notes, deployment guidance, and the root audit pointer. The manifest CSV records a per-file status and candidate destination for each entry. Key preservation decisions:

- Root `README.md` and `ARCHITECTURE.md` describe observed implementation and operator commands; route their verified details to the developer guide, backend, data, and operations docs while keeping target design separate.
- `BRAIN/BRAIN.md` holds the career/evidence graph mental model. Compare it against product vision and domain architecture before calling it fully migrated.
- `BRAIN/MEMORY.md` is a dated execution history. It contains stale snapshots and current-at-the-time audit results; preserve chronology and do not promote old counts or branch states.
- `TalentSphere/` is identified by `docs/INDEX.md` as the user's personal Obsidian vault. Its default welcome note and empty example note remain untouched and are excluded from cleanup.
- `.agents/skills/**`, `.claude/commands/**`, `.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `RETICLE.md` are tool/agent instructions, not product-document cleanup candidates. Preserve them in place.
- `deploy/oracle/**` and `supabase/hosted/README.md` contain operator/migration guidance. Preserve as safety-critical operational documentation until fully reconciled.
- The root audit report is a pointer to the canonical dated report, and `docs/INDEX.md` links it. Retain while referenced.
- `graphify-out/**/GRAPH_REPORT.md` is generated, commit-bound discovery output. It is not a canonical source and is not eligible for documentation cleanup under this review.

These are triage decisions, not blanket completion claims. No file has been deleted or moved.

## `.agents/teamwork/` archive review

A read-only subagent reviewed all 117 Markdown/text files (648,828 bytes). They were UTF-8 readable and had no byte-identical duplicates. The material clusters as 83 briefing/dispatch/context/progress records, 20 handoffs, and 14 other substantive text artifacts. The review found both TalentSphere audit history and a separate Windows clean/reinstall utility effort. The latter's project and test design are not TalentSphere requirements and have no destination in this blueprint.

Material TalentSphere history already has candidate counterparts in the audit reports: feature matrix → `docs/reports/FEATURE_TRACEABILITY_MATRIX.md` and `FEATURE_STATUS_2026-10-21.md`; architecture/security → `ARCHITECTURE_DURABILITY_REPORT.md` and `AUDIT_MASTER_REPORT.md`; Git lineage → `GIT_RECONCILIATION_REPORT.md`; baseline diagnostics → `AUDIT_MASTER_REPORT.md`. These candidate mappings do not yet establish content-level migration or clear a source for deletion. Route inventory text should be verified against current source before use.

The records contain historical conflicts: 217 vs 220 ephemeral routes in one audit; F-01 full/operational vs partial; and 49 vs 52 migrations at different commits. Keep commit and date provenance. Agent `PASS`/`APPROVE` statements are not fresh implementation evidence.

Thirteen related non-text artifacts (six scripts, six JSON files, one JavaScript file) are listed as `DOC-000192`–`DOC-000204` in the CSV. Their dependencies and contents were not inspected. They are explicitly out of scope for documentation cleanup and remain untouched. Because the archive contains mixed projects, workflow history, unique findings, and these uninspected artifacts, no individual entry is cleared for deletion in this checkpoint.



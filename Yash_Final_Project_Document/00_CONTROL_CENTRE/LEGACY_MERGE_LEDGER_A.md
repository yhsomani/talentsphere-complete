# Legacy Merge Ledger A (preservation record for source group A)

Doc ID: CC-LEDGER-A · Owner: Documentation Architect · Version 1.0 · Status: Draft for Review · Relates: `KNOWLEDGE_PRESERVATION_MANIFEST.md`, `INFORMATION_RECONCILIATION_MATRIX.md`, `MASTER_INDEX.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`

Supersedes nothing. This ledger is the link target for every `LEGACY_*` file created by the Group A merge; `MASTER_INDEX.md` is not edited by Group A and should link here (control-centre owner action). Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## 1. Scope and method

- Branch: `chore/remove-app-code-keep-docs-2026-10-26` only. No other branch, no `git show main:`.
- Frame: no source code exists; **nothing is implemented**. Legacy statements are rewritten as "prior attempt reported X" or "target requires X".
- Source group A: `31_LEGACY_ARCHIVE/docs/` (`INDEX.md`, `PRICING.md`, `product/**`, `registries/**`, `governance/**`, `experience/**`, `superpowers/**`) and `31_LEGACY_ARCHIVE/BRAIN/**`. Source files are untouched (no deletion, no edit).
- Large tables (248 business rules, 173 features) were generated mechanically from the source with a script and checked by row count (248 + 8 MIG rules; 173 features); journey rows (28) likewise. Narrative sections were written by hand and checked against the source.
- Not edited: `SSOT.md`, `AGENTS.md`, `CLAUDE.md`, `.env` files, `MASTER_INDEX*`, any file outside folders 00 (this ledger only), 01 to 07, 19, 20, 22, 24 (new file only).

## 2. Ledger: source to target

| Source file | Size (bytes) | Where merged (file / section) | What was merged | What was NOT merged and why | Status |
|---|---|---|---|---|---|
| `docs/INDEX.md` | 10,398 | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` sections 6 and 7 | Authority order (code, then intent, then history), no-duplication convention, dated-report naming convention, personal-vault note, 2026-10-23 documentation audit result (197 to 193 files), statements about retired documents | The per-document link and purpose tables (sections "Start here", 1 to 8) are navigation to archived or retired files and carry no requirement; they remain verbatim in the archive. References to repo-root files (README, ARCHITECTURE, deploy) not present in this project | Partial |
| `docs/PRICING.md` | 5,792 | `19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md` (all sections); pointer appended to `COMMERCIAL_OPERATIONS.md` | Four-plan table with every price, AI quota and job limit; yearly = 10 months; six `STRIPE_PRICE_*` variable names with test-mode ids and three product ids; enforcement table; plan-change procedure; open decisions; review notes (AI quota lowering, acting-user entitlements, in-memory meter, serialised publishes); monetisation integrity invariant; mapping to target tiers; conflicts | Source-code locations are kept only as "prior location (reference)"; Stripe ids kept as reference with warning | Complete |
| `docs/product/PRD.md` | 4,524 | `01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md`; metrics note appended to `20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md`; acceptance in `05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` | Product definition, 13-stage loop, problem, 14 target users, JTBD (17 jobs), value proposition, 6 goals, 7 non-goals, GA scope and path, metrics (primary, supporting, business), 8 product rules, product acceptance (6 conditions) | None omitted | Complete |
| `docs/registries/FEATURE_REGISTRY.md` | 14,799 | `04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md`; contract template and status rule in `05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` | All 173 rows (ID, name, category, priority, phase, dependencies); three families and renumbering note; portfolio rule; flags; computed distribution (the source's "6.4" was an empty heading); 24 phase-order inversions and 1 dependency cycle found; 31-field contract template mapped to SPEC-00; status vocabulary and rule; ZK terminology correction | Nothing omitted. Row-level metadata also exists in `28_*/FEATURE_REGISTRY_METADATA_CROSSWALK.csv` (not edited) | Complete |
| `docs/registries/BUSINESS_RULE_REGISTRY.md` | 20,209 | `06_BUSINESS_PROCESSES/LEGACY_BR_CATALOGUE_BR001_BR248.md` | All 248 BR rules and 8 MIG rules with verbatim text; crosswalk dispositions and target BR-T ids; authority and ID-display notes; rule-governance and change policy; traceability limitation; 8 conflicts plus 1 superseded restated; 4 source-text differences vs SSOT; 11 editorial tensions inside the legacy corpus | The canonical SSOT wording of BR-065/066/158/178 (not in this group; only the crosswalk's description is cited) | Complete |
| `docs/experience/APP_FLOW.md` | 5,336 | `07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_APP_FLOW_MERGE.md` | Reported route table; planned routes (7 groups); universal request flow; candidate, recruiter, institution flows; recovery pattern; state preservation; error screens 401 to 5xx and maintenance; assessment and evidence flows; pointer to retired workflow corpus; lessons on token-only guards and local return paths | Nothing omitted | Complete |
| `docs/experience/JOURNEY_REGISTRY.md` | 4,426 | `02_STAKEHOLDERS_AND_USERS/LEGACY_JOURNEY_REGISTRY_J01_J28.md` | All 28 journeys (name, persona, terminal) with candidate UJ mapping from the existing crosswalk; J-02 and J-26 diagrams (Mermaid, verbatim structure); journey contract; status rule; groupings; the 6 unmatched journeys | Persona definitions P-A to P-T are not in this group | Complete |
| `docs/experience/UI_UX_DESIGN_SYSTEM.md` | 3,569 | `07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md` | Design intent, core rules, token rules and values with side-by-side target values, component architecture and promotion rule, 15 canonical states and 8 lifecycle labels vs target, micro-interaction contract (11 interactions), accessibility list, responsive behaviour, 22 screen families, UX acceptance list | The 100-pattern micro-interaction register (prior SSOT Appendix D) is not in this group (tracked by `28_*/UX_PATTERN_SOURCE_CROSSWALK`) | Complete |
| `docs/governance/GAP_ANALYSIS.md` | 11,628 | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` sections 2 to 5 | 15 resolved gaps, 8 decision-gated gaps, 9 verification gaps, gap-closure rule, conflicts C-1 to C-21 (C-19 absent in source), 2026-10-23 reconciliation note, each with target disposition | Nothing omitted | Complete |
| `docs/governance/GOVERNANCE.md` | 1,771 | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` section 6 | Authority list, no-duplication, change classes C1 to C7 and review rule, traceability chain, status vocabulary, documentation sync, historical-material rule | Nothing omitted | Complete |
| `docs/superpowers/**` | n/a | n/a | n/a | The folder does not exist in `31_LEGACY_ARCHIVE/docs/` on this branch (no files to read) | n/a (absent) |
| `BRAIN/BRAIN.md` | 2,270 | `03_BUSINESS_DOMAINS/LEGACY_BRAIN_CONCEPTUAL_MODEL.md` | Core mental model, claim vs evidence, three graphs, decision systems, AI rules, assessment trust boundary, privacy by purpose, architecture heuristic, common mistakes | Nothing omitted | Complete |
| `BRAIN/MEMORY.md` | 20,196 | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md`; `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` section 8 | 2026-10-21 audit update; snapshot figures and their internal conflicts; milestone M6; capability groups; Stages A to F with BL-001 to BL-018; four production blockers; issues #44 to #50; PR #40 to #58 lineage; known risks SEC-01, SEC-02, SEC-04, OPS-01, OPS-02 and 5 more; documentation index | Branch name, HEAD hash and individual commit hashes of the prior repository, memory-control metadata (version 4.0 date), and exact per-test-file counts beyond the totals are history with no requirement value; they remain in the archive | Partial |

Totals: 12 source files present; 10 Complete, 2 Partial (`INDEX.md`, `MEMORY.md`); 1 declared folder absent (`superpowers/**`).

## 3. Files created or edited by this merge

| Action | File |
|---|---|
| Created | `01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md` |
| Created | `02_STAKEHOLDERS_AND_USERS/LEGACY_JOURNEY_REGISTRY_J01_J28.md` |
| Created | `03_BUSINESS_DOMAINS/LEGACY_BRAIN_CONCEPTUAL_MODEL.md` |
| Created | `04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md` |
| Created | `05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` |
| Created | `06_BUSINESS_PROCESSES/LEGACY_BR_CATALOGUE_BR001_BR248.md` |
| Created | `07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_APP_FLOW_MERGE.md` |
| Created | `07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md` |
| Created | `19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md` |
| Created | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` |
| Created | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` |
| Created | `00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` (this file) |
| Appended section | `19_BUSINESS_AND_COMMERCIAL_OPERATIONS/COMMERCIAL_OPERATIONS.md` ("Merged from legacy: PRICING.md" pointer) |
| Appended section | `20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md` ("Merged from legacy: PRD.md section 9") |

## 4. Conflicts found (both sides kept; decision ids in `OPEN_DECISIONS_LEGACY_MERGE.md`)

1. Legacy business rules vs target BR-T: 8 conflict rows (BR-015, 036, 057, 095, 100, 128, 130, 190) and 1 superseded (BR-035); 4 legacy-vs-SSOT text differences (BR-065, 066, 158, 178). Decisions: OPEN-43, OPEN-09, OPEN-33, OPEN-LGA-03, OPEN-LGA-04.
2. Eleven tensions inside the legacy rule corpus (duplicates, k thresholds, completion vs final exam, billing audience, caps, decay, promotion). OPEN-LGA-01, OPEN-LGA-02, OPEN-LGA-06.
3. Legacy feature registry: 24 phase-order inversions and one dependency cycle (F-45 and F-115). OPEN-LGA-05.
4. Pricing: legacy concrete plan prices vs target "no prices proposed"; tier names differ. OPEN-19, OPEN-LGA-17, OPEN-LGA-18.
5. Design system: motion tokens 120/200/320 ms vs 80/150/240/400 ms; state vocabularies; "Aura" token origin. OPEN-LGA-16.
6. Strategy: legacy 13-stage loop, 6 goals, extra non-goals and GA path vs STR-01; primary metric (existing OPEN-51). OPEN-LGA-09, OPEN-LGA-10.
7. Journeys and roles: 6 legacy journeys without target match; persona and role counts (14, 19, 3+24, 10) vs target. OPEN-45, OPEN-44, OPEN-LGA-07, OPEN-LGA-08.
8. Prior-attempt stack and ADR numbering vs target ADRs (C-5, C-13, C-14). OPEN-LGA-20, OPEN-LGA-21, OPEN-52.
9. Internal conflicts inside MEMORY.md (migration, feature-maturity and test counts) preserved as history.

Total new open decisions: 21 (OPEN-LGA-01 to OPEN-LGA-21).

## 5. Unread, absent or out-of-group material

- `docs/superpowers/**`: absent on this branch.
- Documents the legacy files reference but that are outside group A and were not read here: `docs/engineering/*`, `docs/quality/*`, `docs/reports/*`, `docs/system-model/*` (other merge groups); the retired `WORKFLOWS_AND_BUSINESS_RULES.md`, `IMPLEMENTATION_PLAN.md`, `SOURCE_RECONCILIATION.md` (their content is described in `30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` Appendix A/B); the root `SSOT.md` (protected; canonical wording of BR-065/066/158/178 and persona definitions P-A to P-T live there).
- Group A items that depend on those documents are flagged as open (OPEN-LGA-07, OPEN-LGA-15, OPEN-LGA-19).


<a id="record-legacy-merge-ledger-b"></a>
## Preserved source record: LEGACY_MERGE_LEDGER_B

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md -->
<a id="record-legacy-merge-ledger-b--legacy-merge-ledger-b-preservation-record-for-source-group-b"></a>
# Legacy Merge Ledger B (preservation record for source group B)

Doc ID: CC-LEDGER-B · Owner: Documentation Architect · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: `KNOWLEDGE_PRESERVATION_MANIFEST.md`, `INFORMATION_RECONCILIATION_MATRIX.md`, `MASTER_INDEX.md`, `LEGACY_MERGE_LEDGER_A.md`, `LEGACY_MERGE_LEDGER_C.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md`

Supersedes nothing. This ledger is the link target for every `LEGACY_MERGE_*` file created by the Group B merge in folders 08 to 18, 23 and 25. `MASTER_INDEX.md` is not edited by Group B and should link here (control-centre owner action). Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

<a id="record-legacy-merge-ledger-b--1-scope-and-method"></a>
## 1. Scope and method

- Branch: `chore/remove-app-code-keep-docs-2026-10-26` only. No other branch, no `git show main:`.
- Frame: no source code exists; **nothing is implemented**. Legacy statements are rewritten as "prior attempt reported X" or "target requires X". Verbatim legacy blocks are always introduced by a frame paragraph that says they describe an earlier attempt.
- Source group B: `31_LEGACY_ARCHIVE/docs/engineering/**` (including `adr/`), `.../docs/system-model/**`, `.../docs/quality/**`, `31_LEGACY_ARCHIVE/deploy/*.md`, plus root `ARCHITECTURE.md` (read, not edited). 22 archive files plus the root file. No source file was edited, moved or deleted.
- Method: each source was read in full. Narrative was rewritten by hand into the target folder that matches its subject. Large tables, diagrams and ADR texts were copied **unchanged** by a script (line-range includes) so no character was retyped; the script only removed legacy relative markdown links (their targets do not exist in this tree) and removed the duplicate title line. Source files contain `?` where non-ASCII characters were lost in an earlier export; copied blocks keep the `?`.
- Folders edited (ownership list): 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 23, 25 (new files only), plus one appended index line in each of `11_BACKEND_ARCHITECTURE/INDEX.md`, `12_DATA_AND_DATABASE/INDEX.md`, `13_API_EVENTS_AND_INTEGRATIONS/INDEX.md`, `14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md`, and this ledger in 00. Not touched: `SSOT.md`, `AGENTS.md`, `CLAUDE.md`, `.env` files, `MASTER_INDEX*`, `24_RISKS_AND_DECISIONS/*` (existing OPEN ids are cited, never renumbered; new items are local ids in the new files), `28_TRACEABILITY_AND_COVERAGE/*`, `CANONICAL_INVARIANTS.md`.

<a id="record-legacy-merge-ledger-b--2-new-files-created-17"></a>
## 2. New files created (17)

| Doc ID | File | Size (bytes) |
|---|---|---|
| LGM-B-08 | `08_PWA_AND_MOBILE/LEGACY_MERGE_PWA_AND_OFFLINE.md` | 3,870 |
| LGM-B-09 | `09_MODULE_FEDERATION/LEGACY_MERGE_MODULE_BOUNDARY_RULES.md` | 2,784 |
| LGM-B-10 | `10_FRONTEND_ARCHITECTURE/LEGACY_MERGE_FRONTEND_AND_UI_QUALITY.md` | 9,662 |
| LGM-B-11A | `11_BACKEND_ARCHITECTURE/LEGACY_MERGE_ARCHITECTURE_RULES_AND_ADRS.md` | 31,738 |
| LGM-B-11B | `11_BACKEND_ARCHITECTURE/LEGACY_MERGE_IMPLEMENTED_TOPOLOGY_LESSONS.md` | 34,165 |
| LGM-B-12 | `12_DATA_AND_DATABASE/LEGACY_MERGE_DATABASE_REFERENCE.md` | 23,137 |
| LGM-B-13 | `13_API_EVENTS_AND_INTEGRATIONS/LEGACY_MERGE_API_CONTRACTS.md` | 17,075 |
| LGM-B-14A | `14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` | 23,240 |
| LGM-B-14B | `14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_ROUTE_AUTHORIZATION_FINDINGS.md` | 25,646 |
| LGM-B-15 | `15_RELIABILITY_AND_PERFORMANCE/LEGACY_MERGE_RELIABILITY_AND_FAILURE_MODES.md` | 9,590 |
| LGM-B-16A | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` | 25,443 |
| LGM-B-16B | `16_QA_AND_TESTING/LEGACY_MERGE_CONDITION_MATRIX.md` | 19,088 |
| LGM-B-17 | `17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md` | 26,461 |
| LGM-B-18 | `18_OPERATIONS_AND_SUPPORT/LEGACY_MERGE_OPERATIONS_RUNBOOK_MATERIAL.md` | 12,240 |
| LGM-B-23A | `23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_CONFLICT_REGISTER.md` | 26,741 |
| LGM-B-23B | `23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_INVENTORY_AND_COVERAGE.md` | 44,872 |
| LGM-B-25 | `25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md` | 24,801 |

(Sizes in bytes as measured after the final build.)

<a id="record-legacy-merge-ledger-b--3-ledger-source-to-target"></a>
## 3. Ledger: source to target

| Source file | Size (bytes) | Where merged (file / section) | What was merged | What was NOT merged and why | Status |
|---|---|---|---|---|---|
| `docs/engineering/adr/ADR-015-core-loop-persistence.md` | 6,542 | 11A section 7 (verbatim) and 7.1 (target interpretation table) | Full ADR text (context, 6-point decision incl. write path, concurrency `base` guard, schema alignment 00043; consequences; exit path; verification; escalation) and a row-by-row target requirement table; conflict with ADR-T05 kept as OPEN-52 | Nothing omitted | Complete |
| `docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md` | 3,224 | 16A section 7 (verbatim) and 7.1 (target interpretation) | Full text: context, decision (3 gates, hostile-use list), options table A/B/C, consequences, findings, action items; mapping to target gates | Nothing omitted (the AI-employee tooling note is retained inside the verbatim block) | Complete |
| `docs/engineering/API_CONTRACTS.md` | 30,833 | 13 sections 1 to 7; endpoint index preserved by existing `13_*/OBSERVED_REFERENCE_API_INVENTORY.csv` | Contract ownership, transport/validation, error envelope example and status table with target slug mapping, 14 representative requests, billing modes and retry semantics, area-level reading of 278 routes, measured counts (281/278/78+3/132-123-13-11-2) | The 278-row endpoint table is not re-copied: verified 278 of 278 rows, registry flag and source anchor identical in the CSV (0 missing, 0 different) | Complete |
| `docs/engineering/CODE_STYLE.md` | 1,818 | 11A section 6 | All 10 rules and the PR rule, plus project-level additions | Nothing omitted | Complete |
| `docs/engineering/DATABASE.md` | 17,302 | 12 sections 1 to 8 | Store ownership table (verbatim), advisory-lock single-writer facts, id-space cautions, transaction/failure behaviour, lifecycle and privacy, erasure and export limits, migration runner steps 1 to 7, hosted adapter note, RLS boundary, full 55-migration / 112-table inventory (verbatim) | Nothing omitted | Complete |
| `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` | 3,444 | 12 section 6 | Rule, adapter sequence, unknown live state, historical project ref and region, static dependency audit semantics, six release prerequisites, CF-13 | Nothing omitted | Complete |
| `docs/engineering/PROJECT_MAINTENANCE.md` | 3,442 | 17 section 9 (verbatim) | Whole text: execution path, parameters, differences from historical safety claims, tests, archive pointers | Nothing omitted | Complete |
| `docs/engineering/TARGET_ARCHITECTURE.md` | 12,029 | 11A sections 1 to 4; diagrams in 25 sections 1 and 3 (verbatim); 09 (boundary rules) | Decision and stance, runtime diagram, repository tree, 29 domains, import rules, barrel-cycle rule (full), persistence/API/async/realtime rules, scale-evolution criteria, 7 bounded contexts, ARCH-013..020, legacy ADR-001..013 list, V6 corrections, overlap warning, system-context, auth sequence and AI-safety diagrams | Nothing omitted | Complete |
| `docs/engineering/TRD.md` | 4,191 | 11A section 5 | Baseline table with as-built and target columns, architecture and non-functional requirements, data rules, AI pipeline, assessment, offline six-flag template (also 08), release/CI requirements | Nothing omitted | Complete |
| `docs/system-model/00-index.md` | 1,567 | 23A section 0 | File list with counts, reading order, rules for keeping the model true | Nothing omitted | Complete |
| `docs/system-model/01-inventory-and-coverage.md` | 67,308 | 23B sections 0 to 6 | Scope and vocabulary (verbatim), feature-status table (verbatim), 49-module domain map (verbatim) plus candidate target-domain mapping, algorithms, documentation consolidation decisions, classification counts and the substantive-document rows (verbatim), coverage statement, repository size, API surface, removed sample data, validation and remaining work | The per-file classification rows for the 116 `.agents` collaboration artefacts and 6 tooling rows (about 120 rows of pure provenance: same label "historical agent briefing/plan/evidence", or tooling instruction) are only counted; they remain in the archive | Partial |
| `docs/system-model/02-flows.md` | 14,085 | 25 section 4 (verbatim, 7 Mermaid diagrams) with target-side notes | F1 to F7 including evidence statements, transition tables, scoring weights, delivery behaviour | Nothing omitted | Complete |
| `docs/system-model/03-conflict-register.md` | 12,812 | 23A sections 1 to 3 | Full register (7 resolved, 21 open), decision records, method, reconciliation note (verbatim) plus target disposition for CF-01 to CF-30 and a consolidated conflict index of all Ledger B local ids | Nothing omitted | Complete |
| `docs/system-model/04-conditions.md` | 10,010 | 16B (verbatim matrix, 62 rows) with rule-group mapping | All condition tables AU, JB, AP, WH, CB, LI, BL, ST and the time/config/concurrency summary | Nothing omitted | Complete |
| `docs/system-model/05-audit.md` | 5,771 | 16A section 6 (summary) and section 7A (verbatim appendix) | Commands and results, audits A to I, traceability sample, undocumented behaviours, limitations | Nothing omitted | Complete |
| `docs/system-model/06-route-authorization.md` | 13,801 | 14B section 4 (verbatim) with sections 1 to 3 (patterns, target requirement per finding CF-31 to CF-45, fixed-defect seeds) | Fixed table, open findings, all route tables, not-read list | Nothing omitted | Complete |
| `docs/quality/OPERATIONS.md` | 15,120 | 18 (all runbook material); 17 sections 1, 3, 4, 5 (config table verbatim, preflight, single-writer, bootstrap); 15 (constants, failures) | Sections 1 to 8 target model mapped; section 9: processes, config, advisory lock, heartbeat, retention, erasure durability, transactional email gate, account metadata, data export, preflight modes, logging/alerting, health, payment configuration, common failures, flag-parsing discrepancy | Nothing omitted | Complete |
| `docs/quality/SECURITY.md` | 17,684 | 14A sections 0 to 9 | All 14 sections: objective, pipeline, authorization chain, RLS corrections (00047/00048 lessons), deployment safety boundaries, 15 threats, data tiers, file pipeline, API security, session key, ending sessions, account state, passwords, verification credentials, object-level authorization, webhooks (exact signature header format), payment provider rules, AI/assessment security, ASVS/API Top 10, incident sequence, DPDP privacy pointer | Names of individual prior test files (kept as test classes instead); the external vendor guidance links | Complete |
| `docs/quality/TESTING.md` | 8,925 | 16A sections 1 to 5 | Historical baselines, read-only commands, layers/commands table, accessibility and performance limits, critical E2E suites, assessment/AI/data-integrity lists, flaky policy conflict, 6-step CI gate order, unused-code compiler rule, production smoke | Links to the dated audit JSON and evidence ledger (outside this group; owned by another agent) | Complete |
| `deploy/README.md` | 3,401 | 17 section 6 (verbatim) and 6.1 (target interpretation) | Host preparation, firewall rules, initial deployment commands, limitations | Compose and proxy files it references do not exist in the archive | Complete |
| `deploy/NEW_SUPABASE_PROJECT.md` | 3,090 | 17 section 7 (verbatim) | Project ref and region, compose-with-hosted-database variant (placeholder env values only), STOP notice, release gates, issue mapping #44 to #50 | Nothing omitted | Complete |
| `deploy/RECOVERY.md` | 943 | 17 section 8 (verbatim) and target requirements | Backup/restore script usage and the "not yet executed" caveat | The scripts it references do not exist in the archive | Complete |
| root `ARCHITECTURE.md` (read only) | 29,095 | 11B (all 28 sections: tables 3, 4, 10, 25, 26 verbatim); 25 section 2 (diagram) | Topology, boundary table, component table, owners, rationale, dependency direction, essential transaction boundaries, extension points, escalation, auth/data/API/frontend facts, startup, integrations (email provider structure and how to add one), async constants and defects, error handling, security limits, observability, testing architecture, deployment, risks R-2/R-3/R-4/R-6 and U-1 to U-3, INVARIANT-001..015 with INV-T mapping, ADR register, agent quick reference, evidence vocabulary | The tool-specific rule to verify visible changes with the Reticle browser tool (belongs to agent instructions, not architecture); the prose is condensed in places | Complete (substance); prose condensed |

Totals: 23 sources, **22 fully merged, 1 partly merged** (the inventory file; only pure-provenance classification rows are counted instead of copied). Nothing was unreadable.

<a id="record-legacy-merge-ledger-b--4-conflicts-and-decisions-surfaced-full-index-23_migration_and_evolutionlegacy_merge_conflict_registermd-section-2"></a>
## 4. Conflicts and decisions surfaced (full index: `23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_CONFLICT_REGISTER.md` section 2)

- 53 local items (ids `L-B08-..` to `L-B25-..`); about 20 are true legacy-versus-target conflicts, the rest are gap checks or ownership questions. Existing OPEN ids reused, none renumbered: OPEN-08, 12, 14, 17, 19, 22, 25, 26, 27, 33, 40, 41, 42, 43, 44, 46, 47, 48, 49, 50, 52.
- Highest-impact items:
  - **ADR-015 hybrid read model versus ADR-T05 SQL-only** (OPEN-52): kept visible; the legacy ADR is a lesson, not a decision.
  - **Three ADR numbering namespaces** (legacy SSOT-aligned ADR-001..013, implemented-architecture ADR-001..011/015/016, blueprint ADR-T01..T23) collide on ADR-001 (L-B11-03).
  - **India / DPDP absent from the target compliance matrix** (L-B14-03): text search of the whole target blueprint finds no mention; the legacy security doc told the program to map to the DPDP Act and the prior hosting was in Mumbai. Decision needed from Legal/Privacy (OPEN-08, 30, 34).
  - **Test retries**: legacy zero retries and `forbidOnly` versus target one retry for E2E (L-B16-01).
  - **Password hashing** PBKDF2 versus argon2id (L-B14-01), **bearer storage versus cookies** (L-B14-02), **400 versus 422 and 409 versus 422** (L-B13-01).
  - **Employer-domain verification rule** (legacy CF-11, still undecided: L-B14-05), **referee decline/flag** (CF-22: L-B23-01), **reference-link validity** 30 versus 14 days (L-B15-03), **supersession and dispute policy** for payments (L-B13-02), **erasure grace period** (L-B12-01).
  - Legacy INVARIANT-002, 003, 004, 005, 009, 011 have no INV-T counterpart (L-B11-04); `CANONICAL_INVARIANTS.md` was not edited.
- Corrections to earlier assumptions made during the merge: the client server-state library is already decided in the blueprint (FD-F2 TanStack Query v5), so the legacy TRD row is consistent; the legacy count of "16 threats" is 15 in the actual list.

<a id="record-legacy-merge-ledger-b--5-verification-performed"></a>
## 5. Verification performed

- Endpoint index: all 278 legacy rows compared with `13_*/OBSERVED_REFERENCE_API_INVENTORY.csv` by method+path, registry flag and source anchor: 278 of 278 present, 0 differing.
- Line-range includes: every range was checked against the source for table or fence boundaries (header and separator present, no cut rows); Mermaid code fences in the diagram library file are balanced (12 `mermaid` blocks, 24 fences).
- Secret scan of all new files (live-key prefixes, webhook secret prefixes, JWT-like strings, credentialed connection strings): none found. The only connection string is a documented placeholder (`REPLACE_ME`); the hosted project reference is an identifier, not a credential.
- Existing ids used in cross-references (ADR-T01..T23, INV-T01..T20, DOM-01..24, OPEN-nn, Doc IDs of target files) were read from the target files before use. Cross-references to RB/FM/ALT/TEST ids were kept generic where the exact id was not confirmed.
- Not performed: Mermaid syntax validation (no tool run), link checking of the new files, rendering. No application code, tests or build were run (none exist).

<a id="record-legacy-merge-ledger-b--6-follow-up-actions-for-the-control-centre-owner"></a>
## 6. Follow-up actions for the control-centre owner

1. Add this ledger and the 17 files to `MASTER_INDEX.md` (or an addendum) and to `KNOWLEDGE_PRESERVATION_MANIFEST.*` rows for the 23 sources above; mark those sources `Read and fully processed` (22) or `Read but partially processed` (1) only after reviewing this ledger.
2. Ask the ARB secretary to adopt or reject the local ids and assign owners (section 4).
3. Review OPEN_DECISIONS for the new DPDP and ADR-namespace items.
4. No source is cleared for deletion by this ledger; the standing instruction applies.
<!-- source-record-end: Yash_Final_Project_Document/00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md -->


<a id="record-legacy-merge-ledger-c"></a>
## Preserved source record: LEGACY_MERGE_LEDGER_C

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md -->
<a id="record-legacy-merge-ledger-c--legacy-merge-ledger-c-preservation-record-for-source-group-c-dated-reports"></a>
# Legacy Merge Ledger C (preservation record for source group C: dated reports)

Doc ID: CC-LEDGER-C · Owner: Documentation Architect · Version 1.0 · Status: Draft for Review · Date: 2026-10-26 · Relates: `LEGACY_MERGE_LEDGER_A.md`, `KNOWLEDGE_PRESERVATION_MANIFEST.md`, `INFORMATION_RECONCILIATION_MATRIX.md`, `MASTER_INDEX.md`

Supersedes nothing. This ledger is the link target for the four `LEGACY_*` and `*_FROM_PRIOR_ATTEMPT` files created by the Group C merge. `MASTER_INDEX.md` is not edited by Group C and must link here and to the four files (control-centre owner action). Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

<a id="record-legacy-merge-ledger-c--1-scope-and-method"></a>
## 1. Scope and method

- Branch: `chore/remove-app-code-keep-docs-2026-10-26` only. No other branch, no `git show main:`.
- Frame: no source code exists; **nothing is implemented**. Legacy statements are rewritten as "prior attempt reported X; target must prevent X" or as acceptance criteria the target must meet. No sentence in the new files presents a legacy capability as present.
- Source group C: `31_LEGACY_ARCHIVE/docs/reports/**` (16 files: 15 Markdown, 1 JSON). Source files are untouched: no deletion, no edit, no move.
- All 16 files were read. The 144 KB feature-status report, the 154 KB feature plan and the 63 KB traceability matrix were read in portions (offset and limit). The 1.83 MB evidence JSON was read structurally by script (top-level keys, record counts, status distributions, field names, samples) and its 173-feature, 46-contract and 155-intent-sentence content was extracted by script. Repetitive per-feature table rows (the backlog and build-order rows of the plan) were checked by script for equality with the JSON (169 backlog rows and 153 build-order rows matched on dependencies and acceptance with zero differences; two further backlog rows are story rows); the 173 feature-level rows were read.
- Large generated tables (173-feature register, 46 contracts, 155 intent sentences, 173-row module and table map, 115-file test inventory) were produced by script from the archived sources and checked by row count (173, 46, 155 plus 18 placeholders, 173, 115 files with 1,172 tests). Narrative sections were written by hand and checked against the sources.
- Not edited: `SSOT.md`, `AGENTS.md`, `CLAUDE.md`, `.env` files, `MASTER_INDEX*`, any existing file. No secrets were read or written (the reports contain none; hosted project ids and GitHub comment ids are public identifiers).
- New files by Group C (4 plus this ledger):

| New file | Folder | Doc ID | Content |
|---|---|---|---|
| `RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` | `24_RISKS_AND_DECISIONS` | RSK-LESSONS-C | 88 lessons `LES-01` to `LES-88` in 16 sections, source-ID crosswalk, conflicts between reports, risk table, patterns worth re-implementing |
| `LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md` | `05_FEATURE_SPECIFICATIONS` | SPEC-LEGACY-C | Acceptance criteria `LGR-01`..`LGR-99`, `BL-001`..`BL-018`, `X-00`..`X-11`, ready stories, DoR and DoD, 173-feature register with dependencies, 155 intent sentences, 46 intended contracts, conflicts, journey list, tooling requirements |
| `LEGACY_RELEASE_GATES.md` | `22_IMPLEMENTATION_ROADMAP` | RDM-GATES-C | Gates `LRG-01`..`LRG-17`, issue lineage in both numberings, stages A to F, sprints S0 to S6, Stripe and managed-database gates, PR lineage, verdict timeline |
| `LEGACY_REPORTS_EVIDENCE_INDEX.md` | `28_TRACEABILITY_AND_COVERAGE` | TRC-LEGACY-C | Catalogue of the 16 files, verification methodology, metric timeline, durable and ephemeral families, index of the 17 JSON members, test inventory, module and table map, flow traces |

<a id="record-legacy-merge-ledger-c--2-ledger-source-to-target"></a>
## 2. Ledger: source to target

Status rule: **Complete** means every distinct finding, requirement, acceptance criterion, gate, identifier, decision, count and dated measurement in the source was carried over (prose condensed, code line citations and implementation-level snippets left in the archive). **Partial** means a section or table of requirement, gate or lesson-level content was deliberately not carried over; the reason is stated and the content stays in the archive.

| Source file | Size (bytes) | Where merged (file / section) | What was merged | What was NOT merged and why | Status |
|---|---|---|---|---|---|
| `docs/reports/PRODUCTION_AUDIT_2026-10-03.md` | 48,541 | Lessons sections 1 to 6, 9, 15 (LES-01 to LES-08, LES-30 to LES-31, LES-45, LES-51, LES-52, LES-65, LES-68, LES-74); requirements 3.1, 11.2, 11.3, 11.4; gates section 8; evidence LEI-01 and timeline | P0-01 to P0-08, S-01 to S-06, RM-01 to RM-08, TD-01 to TD-10, QW-01 to QW-07, journey matrix A to L, remediation phases 0 to 7, scorecard (5/2/4/4/8/2/5/7 = 4.6), go-live decision, revisions B to D facts (CI red, fake hash, apply simulation, compliance copy, radio accessibility), accessibility strengths and gaps, performance caveat | Code line citations (for example login page lines 38 to 58); the 27-row feature completeness table (superseded by the 173-row register); wording of the business-value narrative. Reason: implementation-level or superseded by later reports | Complete |
| `docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md` | 59,228 | Lessons sections 1 to 9, 11, 14, 16; requirements 2, 3.1 to 3.7, 4; gates 9, 10; evidence 2.4, 2.5, 3 | Project understanding, ideal-state blueprint (7 criteria), findings 1 to 37, external audit TS-001 to TS-007, decisions table, roadmap P0 to P3, validation evidence and mutation checks, adversarial review, Reticle drive results (summarized with their `unknown`/`no` caveats), owner decisions H1 to H9, risk table, cleanup audit measures and kept-with-reason list | Per-flow Reticle verdict narratives are condensed (sign-up, notifications, password change, remove role, sign-out, session reason, messaging, screen sizes) to their findings and caveats; commit-by-commit increment list kept only as commit ids. Reason: step-level driver detail has no requirement content beyond the acceptance statements already extracted | Complete |
| `docs/reports/FINAL_VALIDATION_REPORT.md` | 6,239 | Requirements 5; evidence LEI-03, timeline; gates 8 | Corpus counts (173, 28, 66, 248, 8, 100), 13 founder corrections, external basis, executable evidence of 2026-10-14, "not produced" list, operational status | None | Complete |
| `docs/reports/E2E_AUDIT_2026-10-21.md` | 12,292 | Lessons LES-29, LES-46 to LES-50, LES-88; requirements 3.1, 3.2, 3.4, 4; evidence 2.6; gates 3.5 | Method, environment, route inventory, 13-suite result table, defect register (fixed and open), held-up controls, coverage gaps, release readiness | None (scripts and screenshots were never in the repository) | Complete |
| `docs/reports/FEATURE_STATUS_2026-10-21.md` | 144,836 | Requirements 8, 9, 9.1, 10, 11.1, 13; lessons LES-05, LES-06, LES-07, LES-17, LES-18, LES-35, LES-38, LES-70, LES-71; evidence 1, 2.2, 2.5, 2.7, 3, 10; gates 2.1, 3.5 | Executive assessment and counts, baseline and command ledger, coverage-by-subsystem table, 173-row register (status, urgency, stage, dependencies, external dependency, acceptance), expected-behavior sentences, intent-versus-build conflict table, flow traces, architecture assessment, defects D-01 to D-10 with reproduction recipes, owner decisions O-01 to O-03, GitHub reconciliation, historical static assessment counts and its discrepancy table, cross-cutting risks, "what to add next" | Per-feature "actual behavior" prose, UI, backend and persistence file paths, per-feature associated-test counts and templated maturity and next-action cells (kept only as status, urgency and stage columns); the 16-row historical "Implemented" table is represented by the status column. Reason: implementation description of the earlier code; kept verbatim in the archive and in the JSON | Partial |
| `docs/reports/FEATURE_PLAN_2026-10-21.md` | 153,831 | Requirements 6 (feature scope), 7 (X-00 to X-11, ready stories, DoR, DoD, quality gates, foundation packets), 8, 9 (wave and order); gates 3.2, 3.3, 9; lessons LES-56 | Scope options and beta subset, X-00 to X-11, X-11 course-completion trust, five ready stories, dependency graph, sprint S0 to S6 table and risk contract, DoR and DoD, quality-gate table, 169 feature packets (epic, priority, dependencies, acceptance), build order and wave, tier and wave counts, parked list, documentation-authority rules, immediate execution list, earlier X-01 to X-04 | Per-packet "candidate test file" counts, repeated per-row sprint text, the document-reconciliation table's row-level corrections to legacy documents (summarized in gates 9) and the blocked template export note. Reason: counts duplicated by the JSON; corrections concern legacy documents that are archived | Complete |
| `docs/reports/FEATURE_TRACEABILITY_MATRIX.md` | 63,400 | Requirements 9 (matrix status and durability columns); evidence 3, 9, 10; lessons LES-06 | Method and rubric, distribution (26/91/6/50), durability breakdown, per-feature status, durability, domain module, endpoint count, tables and migrations, core-loop grouping, migration priority order | Full per-feature endpoint lists (route text), UI component names and the per-row engineering note prose. Reason: describe the earlier code structure; endpoint lists are indexed by `AUDIT_ROUTE_EVIDENCE_CROSSWALK.md` and retained verbatim in the archive | Partial |
| `docs/reports/AUDIT_MASTER_REPORT.md` | 24,018 | Lessons LES-12, LES-13, LES-26, LES-31, LES-32, LES-57, LES-58, LES-76; gates 3.1, 7, 8; evidence LEI-12, 3 | Hybrid-state summary, diagnostics (counts, results), distribution, high-level domain breakdown, SEC-01 to SEC-06 and OPS-01, OPS-02, PR spine, issue reconciliation summary, stages A to F, deliverable list | Command durations of the diagnostic battery and the ASCII layout of tables. Reason: not requirement content | Complete |
| `docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` | 29,091 | Lessons LES-12 to LES-14, LES-26, LES-27, LES-31, LES-32, LES-41, LES-43, LES-57 to LES-59, LES-76; requirements 3.3, 3.5, 3.8; evidence 3, 4; gates 5.1 | Single-writer and hydrated-read-model design and limits, concurrency controls, durable versus ephemeral route counts and domain table, SEC-01 and SEC-02 mechanisms and remedies, auth and session lifecycle, RLS bypass, identity fragmentation, AI governance and tier limits, mail adapter behavior, Oracle topology and defects | SQL snippets, exact source line numbers, per-table guard predicates and the topological write-order chain beyond the summary in lessons section 11. Reason: implementation-level detail of the earlier code | Complete |
| `docs/reports/GIT_RECONCILIATION_REPORT.md` | 38,588 | Gates 2.2, 2.3, 7.1; lessons section 12; evidence LEI-15 | Branch ancestry and topology, chronological merge lineage, PR #40 to #58 (merge commit, date, branch, delivered items), issue #44 to #50 with commits, defect text and verifying tests, numbering fact, final reconciliation matrix content | Row-level key-file lists per PR (paths in the earlier code) and the ASCII diagrams. Reason: implementation paths | Complete |
| `docs/reports/RELEASE_SCOPE_AND_BACKLOG.md` | 28,458 | Requirements 2, 6; gates 3.1; lessons LES-12, LES-13, LES-57, LES-58, LES-61, LES-66, LES-76 | Two-tier boundary, GA feature scope, BL-001 to BL-018 with Given/When/Then and verifying tests, stages A to F with exit criteria | None | Complete |
| `docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | 55,558 | Requirements 12.1, 12.2; lessons LES-79; evidence LEI-08 | Windows clean-and-reinstall requirements R1 to R4 and acceptance, 38-case test-suite structure and the empty-array defect, Bash tool design principles, candidate classes and protections, exit codes, test approach, repository script treatment, limitations | The detected-projects table, per-candidate approximate KiB table, the archived Bash guide's menu numbering and flag examples, and per-test-case timings of the 38 cases. Reason: developer tooling for the earlier repository, not product; sizes are allocation readings that the report says not to add up | Partial |
| `docs/reports/PAYMENT_AUDIT_2026-10-23.md` | 9,456 | Lessons LES-53, LES-70; requirements 3.7; gates 5; evidence LEI-09 | Scope, access limits, issue register P-1 to P-6, reviewed-and-unchanged items, verification table, "fails before, passes after" evidence limits | Changed-file list (earlier repository paths) | Complete |
| `docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md` | 8,151 | Lessons LES-26, LES-36, LES-37, LES-54, LES-69, LES-77; requirements 3.7; gates 5, 6; evidence LEI-10 | Findings S-1 to S-4, open items O-1 to O-5, manual configuration list, verification table, refund decision (2026-10-23), hosted-database facts and the reason migrations were not applied | None | Complete |
| `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` | 54,974 | Lessons LES-36, LES-39, LES-54, LES-55, LES-65, LES-77, LES-78; requirements 7 (DoD); gates 1, 2.1, 3.4, 4, 5, 6, 7.2; evidence LEI-11, 3 | Verdict and CI evidence, scope and limits, cross-checks of PRs #41 to #71, open-issue inventory and status accounting, Supabase and Stripe live read-only facts, risk register R2-01 to R2-10, code change description, verification ledger, issue journal, blockers, deployment readiness table, action plan 0 to 8, definition of done | The 173-row appendix is identical in content to the status report's register (the register in the requirements file was built from the JSON and plan; this appendix's note column adds no separate fact) and external hyperlinks; CI run ids were kept | Complete |
| `docs/reports/AUDIT_EVIDENCE_2026-10-21.json` | 1,827,134 | Evidence index section 5 (17 members, sizes, record counts), 6 (115 test files, 1,172 tests), 2.5; requirements 9, 9.1, 10, 13 | Structural index: 17 top-level members with counts (features 173 of 32 fields, businessRules 248, journeys 28, routes 274, migrations 51, inventory 684, tests 115 files, remote 9 PRs and 7 issues with 17 comments, documentationCrossCheck 46 documents, and the rest), SHA-256 recomputed and matched, status and urgency and stage distributions, the 173-feature register join, 46 intended contracts, 155 intent sentences, 28 journey names and terminals | Row-level content stays archived as instructed: 248 business-rule text records with 1,003 code references, 274 route records, 51 migration hash records, 684 file hashes, 688 reference candidates, per-test names, 27 initial staged entries, issue-comment bodies. Row-level indexes exist in `AUDIT_*_CROSSWALK` files from other tracks | Complete (as scoped: index plus counts, JSON stays archived) |

Totals: 16 source files; **13 Complete** (including the JSON as scoped), **3 Partial** (`FEATURE_STATUS_2026-10-21.md`, `FEATURE_TRACEABILITY_MATRIX.md`, `MAINTENANCE_AUDIT_2026-10-21.md`); unread: none.

<a id="record-legacy-merge-ledger-c--3-information-deliberately-kept-only-in-the-archive"></a>
## 3. Information deliberately kept only in the archive

These items were judged to be implementation description of the earlier code, machine evidence, or evidence of artifacts that no longer exist; they remain unmodified in `31_LEGACY_ARCHIVE/docs/reports/` and are cited by file and ID.

- Per-feature actual-behavior prose, UI and backend paths, and endpoint route lists (status and traceability reports; JSON).
- Row-level machine evidence in the JSON (rules, routes, migrations, file hashes, test names, issue-comment bodies).
- Maintenance reports' size tables and per-test timings.
- SQL and code snippets, source line numbers, exact exploit mechanics beyond the stated remedy.
- External hyperlinks to the earlier GitHub repository, CI runs and issues (ids are recorded where useful).

<a id="record-legacy-merge-ledger-c--4-cross-links-added-by-this-merge"></a>
## 4. Cross-links added by this merge

| From | To |
|---|---|
| Lessons file section 12 | Gates section 2 (two issue numberings) |
| Requirements file section 9 | Lessons LES-06 (matrix versus status disagreement) |
| Requirements file `LGR-50` | Evidence index section 4 (durable and ephemeral families) |
| Gates `LRG-04`, `LRG-09` | Lessons LES-63, LES-78 |
| Evidence index sections 1 to 10 | The other three new files (section 8) |

<a id="record-legacy-merge-ledger-c--5-items-for-the-control-centre-owner-not-done-by-group-c"></a>
## 5. Items for the control-centre owner (not done by Group C)

1. Link this ledger and the four files from `MASTER_INDEX.md` (an addendum is the established pattern) and add the four Doc IDs (`RSK-LESSONS-C`, `SPEC-LEGACY-C`, `RDM-GATES-C`, `TRC-LEGACY-C`) and the new prefixes (`LES-`, `LGR-`, `LRG-`, `LEI-`) to `ID_REGISTRY.md`.
2. Decide whether the 88 lessons should be merged into `RISK_REGISTER` rows (the lessons file is an input register; it does not assign likelihood or owners).
3. Reconcile the two issue-number mappings (lessons section 12) if the earlier GitHub issues are ever consulted again; prefer the mapping read from issue bodies.
4. Confirm that `OPEN_DECISIONS.md` covers the owner decisions listed in lessons section 13 (architecture of record, commercial scope, email provider, legal review, erasure semantics, scoring rule, session storage, sandbox technology, password policy, maintenance-mode exemptions).
5. The evidence JSON's feature-level `previousAssessment`, `maturity` and `canonicalContract` fields are queryable by script; if the target adopts a coverage tool, ingest from the archived JSON instead of re-typing.
<!-- source-record-end: Yash_Final_Project_Document/00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_C.md -->


<a id="record-legacy-merge-ledger-d"></a>
## Preserved source record: LEGACY_MERGE_LEDGER_D

> Consolidated on 2026-10-27 (batch 3). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_D.md -->
<a id="record-legacy-merge-ledger-d--legacy-merge-ledger-d-gap-closure-after-the-independent-preservation-audit"></a>
# Legacy Merge Ledger D (gap closure after the independent preservation audit)

Doc ID: CC-LEDGER-D · Owner: Documentation Architect · Version 1.0 · Status: Draft for Review · Date: 2026-10-27 · Supersedes nothing · Relates: [`LEGACY_MERGE_LEDGER_A.md`](#), [`LEGACY_MERGE_LEDGER_B.md`](#record-legacy-merge-ledger-b), [`LEGACY_MERGE_LEDGER_C.md`](#record-legacy-merge-ledger-c), [`KNOWLEDGE_PRESERVATION_MANIFEST.md`](KNOWLEDGE_PRESERVATION_MANIFEST.md) · Linked from: [`MASTER_INDEX.md#record-master-index-v9-addendum-3`](MASTER_INDEX.md#record-master-index-v9-addendum-3)

Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

<a id="record-legacy-merge-ledger-d--1-scope-and-method"></a>
## 1. Scope and method

- Branch: `chore/remove-app-code-keep-docs-2026-10-26` only. No other branch, no `git show main:`.
- Frame: nothing is implemented. Every closure section is headed "Merged from legacy: <source path>" and states that the prior attempt reported or required the quoted items; quoted code paths, hashes and counts are evidence about the prior attempt only.
- Input: the independent validator's preservation report (50 archive files: FULL 26, PARTIAL 24, NOT 0; 36 missing named ids; 8 partial JSON members).
- Method: for each PARTIAL source, the named sentences and tables were quoted by line range from the unchanged archive file by script (no retyping), and every source line carrying a backticked code token, id, date, commit hash, migration name or URL that was absent from the blueprint was quoted as well. Quotes are line-numbered (`L<n>`) in fenced blocks so legacy relative links do not become broken links. Each block is appended at the end of the existing target file (no existing line was edited). Two CSV files and one quote file are new.
- Not touched: `SSOT.md`, `AGENTS.md`, `CLAUDE.md`, `.env` files, any archive file. Nothing deleted or moved. Archive files stay in use.
- New files: this ledger; [`LEGACY_TRACEABILITY_MATRIX_ROWS_FROM_PRIOR_ATTEMPT.md`](../28_TRACEABILITY_AND_COVERAGE/LEGACY_TRACEABILITY_MATRIX_ROWS_FROM_PRIOR_ATTEMPT.md); [`LEGACY_AUDIT_JSON_PER_FEATURE_JUDGEMENTS.csv`](../28_TRACEABILITY_AND_COVERAGE/LEGACY_AUDIT_JSON_PER_FEATURE_JUDGEMENTS.csv); [`LEGACY_AUDIT_JSON_PER_BUSINESS_RULE_JUDGEMENTS.csv`](../28_TRACEABILITY_AND_COVERAGE/LEGACY_AUDIT_JSON_PER_BUSINESS_RULE_JUDGEMENTS.csv).

<a id="record-legacy-merge-ledger-d--2-ledger-source-gap-where-added-status"></a>
## 2. Ledger: source, gap, where added, status

| Source | Gap | Where added | Status |
|---|---|---|---|
| `31_LEGACY_ARCHIVE/BRAIN/MEMORY.md` | branch name and memory-control metadata (lines 1-14, 38-41), Next Action (line 53), and the code snippets `deploy/oracle/verify-backup-restore.sh`, `pnpm exec tsc -b`, `pnpm exec tsc -p tests`, `rgb(100, 116, 139)`, `crypto.createHmac('sha256', ...)`. | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` (section gap closure D-01; 23 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/INDEX.md` | the navigation tables ('Start here' and sections 1-8, lines 9-102), the 12 relative link targets, line 3 ('single entry point') and line 106 (same-day reports can describe different source revisions). | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` (section gap closure D-02; 105 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/PRICING.md` | prior-code pointers `PaidPlans.tsx`, `plan-limits-domain`, `activeJobPostingLimit`, `packages/domain/src/stripe-billing.ts`, `tests/integration/plan-enforcement.test.ts` (lines 12-14, 32-41, 64-91 including the 'Enforced by' column). | `19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md` (section gap closure D-03; 46 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` | closing scope sentence (lines 59-60: the dependency-audit document is consolidated; no migration, credential, grant, schema, policy or deployment was changed) and the audit script name `scripts/audit-hosted-supabase-migrations.mjs` (line 30). | `12_DATA_AND_DATABASE/LEGACY_MERGE_DATABASE_REFERENCE.md` (section gap closure D-04; 11 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/governance/GAP_ANALYSIS.md` | the open documentation-conflicts register C-1..C-21 with its full evidence and 'Owner decision needed' columns (lines 64-91), including C-1 SSOT line refs, C-3, C-10 enumeration of removed duplicate sections and C-12 marker names `reticle:begin`/`reticle:end`. | `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` (section gap closure D-05; 28 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/quality/OPERATIONS.md` | sentence 'Legacy plaintext keys, if any, must be remediated explicitly' (line 182), identifier `normalizeEvent` (line 269), and the Stripe configuration/troubleshooting and common-failure tables (lines 258-end) whose rows were reworded. | `18_OPERATIONS_AND_SUPPORT/LEGACY_MERGE_OPERATIONS_RUNBOOK_MATERIAL.md` (section gap closure D-06; 46 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/quality/SECURITY.md` | 4 external guidance URLs (lines 37, 330, 340), prior test file names `tests/pg/billing.test.ts`, `tests/unit/stripe-billing-domain.test.ts`, the `tests/security/api-security.test.ts` describe block (line 157), and `apps/worker/src/email/brevo.ts` (line 243). | `14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` (section gap closure D-07; 14 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/quality/TESTING.md` | sentences 'No merge if required checks fail. High-risk domain changes require expanded test suites.' (line 193), 'Inspect selected tests' own side effects before running them' (line 43) and the read-only substitute command intro (lines 29, 36). | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` (section gap closure D-08; 24 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` | CWE-328 / CWE-916 (SEC-01, line 142) and CWE-613 (SEC-02, line 189) with the full vulnerability text. | `14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` (section gap closure D-09a; 14 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` | about 118 code/SQL/line-reference tokens (for example `server.ts:12701`, `core-store.ts:803-854`, `EMAIL_CHALLENGE_TTL_MS = 15 * 60 * 1000`, `EMAIL_CHALLENGE_MAX_ATTEMPTS = 5`, `writesInFlight: Set<string>`) and the URL https://api.resend.com/emails; token-bearing lines quoted. | `11_BACKEND_ARCHITECTURE/LEGACY_MERGE_ARCHITECTURE_RULES_AND_ADRS.md` (section gap closure D-09b; 88 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_MASTER_REPORT.md` | statement 'BL-001 through BL-032' (line 208), 15 command/line-reference tokens (`pnpm exec tsc -b`, `playwright test tests/e2e/core-loop.spec.ts`, `apps/api/src/server.ts:6097`, `deploy/oracle/Caddyfile:7`) and URL https://SITE_DOMAIN/health. | `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` (section gap closure D-10; 26 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/E2E_AUDIT_2026-10-21.md` | stored-XSS vector `<a href="javascript:alert(1)">` and remedy `safeHref()` (E20, line 60), row N04b raw-id example (line 61), `borderColor` (D90, line 67). | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` (section gap closure D-11; 11 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md` | access-limit lines 9-10 ('gh' not installed, GitHub connector not authorised, no TODO/FIXME markers found, no credentials used) and the `FIXME` token. | `19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md` (section gap closure D-22; 5 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/PAYMENT_AUDIT_2026-10-23.md` | root-cause cells of P-1..P-6, baseline/after test numbers (4 failed / 5 passed; 42 / 42), the TS2345 text, `billingEventsByIdempotency`, `invoicesById`, `invoicesByUserId`, `${t}.${rawBody}`, evidence limit for P-3..P-5 (line 51). | `19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md` (section gap closure D-18; 53 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/FEATURE_PLAN_2026-10-21.md` | row-level corrections to retired documents (section K, lines 137-162 including line 154) and the blocked template-export note (line 150); per-packet candidate-test-file counts below. | `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (section gap closure D-12; 26 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/FEATURE_PLAN_2026-10-21.md` | per-packet candidate-test-file counts and repeated sprint text for 169 BL-F packets | `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (section D-12-packets; 169 packets) | Closed (generated from source rows) |
| `31_LEGACY_ARCHIVE/docs/reports/FEATURE_STATUS_2026-10-21.md` | 19 code/line tokens (`server.ts:5449`, `background-jobs.ts:441,462`, `apps/worker/src/claim.ts:74,90,93`, `tests/security/injection-defenses.test.ts:210-223`, ...) and the defect register D-01..D-10 rows (lines 298-310). The 173 status/expected/actual rows remain in `AUDIT_FEATURE_EVIDENCE_CROSSWALK.csv`. | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` (section gap closure D-13; 22 source lines) | Closed for tokens; per-feature actual-behaviour prose recoverable from AUDIT_FEATURE_EVIDENCE_CROSSWALK.csv |
| `31_LEGACY_ARCHIVE/docs/reports/GIT_RECONCILIATION_REPORT.md` | 5 commit hashes (2f88ff86, 9f8ad4df, b0036b84, e8290345, e0882707), the ~35-row branch table with tip hash, subject and merged-by cells (lines 22-41), `Merge pull request #37 from yhsomani/vibe-coding`, key-file cells per PR (reconciliation matrix, lines 394-end) and `MIN_DEPLOYED_PBKDF2_ITERATIONS` (line 241). | `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (section gap closure D-15; 77 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md` | about 20 code/name tokens (`confirmDangerous`, `formatMoney`, `emptySnapshot`, `routeKey`, `evidence.propagate`, `DROP DATABASE ... WITH (FORCE)`, `starting-implementation-of-data-heavy-project.md`) and the per-flow Reticle verdict narratives (lines 184-200). | `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` (section gap closure D-16; 26 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | the 28 missing test-case ids TC-04..TC-37 (all of TC-01..TC-38 with results and timings are quoted in the 16_QA section), ~113 code tokens (flags `--max-depth`, `--approve-cleanup`, ecosystem markers `build.gradle`, `package-lock.json`, `.nuxt`), detected-projects table, per-candidate size tables, menu numbering, per-test timings. | `17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md` (section gap closure D-17; 183 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | the 28 missing test-case ids TC-04..TC-37 (all of TC-01..TC-38 with results and timings are quoted in the 16_QA section), ~113 code tokens (flags `--max-depth`, `--approve-cleanup`, ecosystem markers `build.gradle`, `package-lock.json`, `.nuxt`), detected-projects table, per-candidate size tables, menu numbering, per-test timings. | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` (section gap closure D-17; 132 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/PRODUCTION_AUDIT_2026-10-03.md` | ids QW-03, QW-05, QW-06 and TD-04 as named items (sections 15 and 16, lines 1070-1175), scorecard arithmetic chains ('30 + 7 = 37', '5 + 2 = 7'), causal-chain strings ('real browser -> real backend -> real database -> ...'), about 78 code/line tokens (`LoginPage.tsx:38`, `CheckoutPage.tsx:331`, `package-lock.json`). | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` (section gap closure D-19; 194 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/RELEASE_SCOPE_AND_BACKLOG.md` | about 36 verifying-test command strings per backlog item (for example `pnpm test:pg tests/pg/core-persistence.test.ts -t "..."`, `pnpm exec playwright test tests/e2e/core-loop.spec.ts`, `curl -k https://127.0.0.1/health`, `node scripts/test-staging-mail.mjs`), SQL/API snippets in the Given/When/Then text, URL https://SITE_DOMAIN/health. | `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (section gap closure D-20; 260 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` | 15 of 31 URLs (issue-comment links #46/#48, CI run URLs), commit hash fca16f5117c8, ~21 code tokens (`stripe.webhooks.constructEvent(rawBody, signature, whsec)`, `processStripeEvent`, Playwright assertions). | `22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` (section gap closure D-21; 32 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/system-model/01-inventory-and-coverage.md` | the ~124 per-file classification rows for `.agents/**` and tooling (lines 181-388) that survived only as a count. | `23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_INVENTORY_AND_COVERAGE.md` (section gap closure D-23; 208 source lines) | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/FEATURE_TRACEABILITY_MATRIX.md` | 174 matrix rows not verbatim (endpoint lists, UI components); old-repository URL; `storage.core.persist()` note | `28_TRACEABILITY_AND_COVERAGE/LEGACY_TRACEABILITY_MATRIX_ROWS_FROM_PRIOR_ATTEMPT.md` (whole source, 258 lines, numbered) and pointer section D-14 in `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` | Closed (verbatim quote) |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `snapshot` | initialStagedEntries provenance, concurrentChange, sourceHashComparison.limitation | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24 | Closed (verbatim)  |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `method` | method sentence | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24 | Closed (verbatim)  |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `features` | referenceCandidates excerpts, testEvidence.association, subfeatures, maturity, nextAction, verificationLimitation, previousAssessment, canonicalContract | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24; CSV files LEGACY_AUDIT_JSON_PER_FEATURE_JUDGEMENTS.csv, LEGACY_AUDIT_JSON_PER_BUSINESS_RULE_JUDGEMENTS.csv | Partly closed: per-row judgements exported to CSV; prior-code excerpts remain only in archived JSON (recovery commands given) |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `businessRules` | references[].excerpt, nextAction, 47 reference line numbers | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24; CSV files LEGACY_AUDIT_JSON_PER_FEATURE_JUDGEMENTS.csv, LEGACY_AUDIT_JSON_PER_BUSINESS_RULE_JUDGEMENTS.csv | Partly closed: per-row judgements exported to CSV; prior-code excerpts remain only in archived JSON (recovery commands given) |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `inspectionLimitations` | 5 limitation sentences | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24 | Closed (verbatim)  |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `contractInventory` | source and limitation text | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24 | Closed (verbatim)  |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `artifactValidation` | checks and diffWhitespaceCheck text | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24 | Closed (verbatim)  |
| `31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json` member `focusedContractReviews` | source lines, command, result, observed, limits | `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24 | Closed (verbatim)  |

<a id="record-legacy-merge-ledger-d--3-the-36-missing-ids"></a>
## 3. The 36 missing ids

| Id | Source | Where added | Status |
|---|---|---|---|
| `QW-03` | `31_LEGACY_ARCHIVE/docs/reports/PRODUCTION_AUDIT_2026-10-03.md` | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` section D-19 | Closed |
| `QW-05` | `31_LEGACY_ARCHIVE/docs/reports/PRODUCTION_AUDIT_2026-10-03.md` | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` section D-19 | Closed |
| `QW-06` | `31_LEGACY_ARCHIVE/docs/reports/PRODUCTION_AUDIT_2026-10-03.md` | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` section D-19 | Closed |
| `TD-04` | `31_LEGACY_ARCHIVE/docs/reports/PRODUCTION_AUDIT_2026-10-03.md` | `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` section D-19 | Closed |
| `CWE-328` | `31_LEGACY_ARCHIVE/docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` | `14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` section D-09a | Closed |
| `CWE-916` | `31_LEGACY_ARCHIVE/docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` | `14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` section D-09a | Closed |
| `CWE-613` | `31_LEGACY_ARCHIVE/docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` | `14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` section D-09a | Closed |
| `BL-032` | `31_LEGACY_ARCHIVE/docs/reports/AUDIT_MASTER_REPORT.md` | `24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` section D-10 (source inconsistency, no definition exists) | Closed |
| `TC-01` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-02` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-03` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-04` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-05` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-06` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-07` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-08` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-09` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-10` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-11` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-12` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-13` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-14` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-15` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-16` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-17` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-18` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-19` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-20` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-21` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-22` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-23` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-24` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-25` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-26` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-27` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-28` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-29` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-30` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-31` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-32` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-33` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-34` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-35` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-36` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-37` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |
| `TC-38` | `31_LEGACY_ARCHIVE/docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | `16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section D-17 | Closed |

TC-01..TC-38 are all quoted (the audit named TC-04..TC-37 as missing; TC-01..TC-03 and TC-38 were included for completeness). `BL-032` is a source inconsistency: the prior attempt's master report cites a backlog range up to `BL-032`, but only `BL-001`..`BL-018` are defined anywhere in the archive.

<a id="record-legacy-merge-ledger-d--4-verification-re-run-2026-10-27-script-in-the-session-scratch-folder-repository-untouched-by-it"></a>
## 4. Verification (re-run 2026-10-27, script in the session scratch folder, repository untouched by it)

Method: extract every `XX-nn` id from the 49 archived Markdown files and search the blueprint (all folders except `31_LEGACY_ARCHIVE`, including the new files); extract every backticked code token, id, date, commit hash, migration name and URL from each source line of the 23 Markdown PARTIAL files and search the blueprint; check every string of the six small JSON members.

| Check | Before (audit) | After |
|---|---|---|
| Distinct source ids missing from the blueprint | 36 of 532 | **0 of 532** |
| Named ids (QW-03, QW-05, QW-06, TD-04, CWE-328, CWE-613, CWE-916, BL-032, TC-01..TC-38) missing | 36 | **0** |
| Code/id/date/hash/migration/URL tokens missing in the 23 Markdown PARTIAL files | several hundred (about 1,000 by the audit's count) | **0** |
| JSON members snapshot, method, inspectionLimitations, contractInventory, artifactValidation, focusedContractReviews: leaf strings missing | 8 members partial | **0** (all leaf strings found) |

<a id="record-legacy-merge-ledger-d--5-remaining-gaps-honest-count"></a>
## 5. Remaining gaps (honest count)

- **Missing ids: 0. Missing named code/URL/hash tokens: 0.**
- JSON `features` and `businessRules`: **2,701 leaf strings** are still only in the archived JSON (1,698 in `features`, 1,003 in `businessRules`). They are prior-code reference excerpts and line numbers (`referenceCandidates`, `references[].excerpt`), `testEvidence.association` text, and `subfeatures`/`canonicalContract` text that derives from the retained `SSOT.md`. The per-row judgements (`nextAction`, `previousAssessment`, all `maturity` dimensions, rule `nextAction`) are now exported to the two CSV files. The JSON must stay archived; recovery commands are in `28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` section D-24.
- Table-row condensation in the large reports (the audit counted, for example, 397 of 416 rows in `FEATURE_PLAN`, 268 of 434 in `FEATURE_STATUS`, 167 of 268 in `REPOSITORY_AUDIT`, 108 of 111 in `MAINTENANCE_AUDIT`): every id, code token, number, hash and URL in those rows is now present, but sentence-level wording of reworded rows was **not re-measured** by a new sentence-coverage run. The source text remains in the archive. Status for those files: closed at token and named-item level, not proven at sentence level.
- Link-only and prose wording differences judged immaterial by the audit were not chased (for example `docs/INDEX.md` relative link targets are quoted inside fenced blocks, not as live links).
- Deletion readiness is unchanged: no archive file is cleared for deletion. All 50 archive files stay in use.
- Not done by this ledger: Mermaid or link checking, rendering of the appended blocks, update of `KNOWLEDGE_PRESERVATION_MANIFEST.csv` rows.
<!-- source-record-end: Yash_Final_Project_Document/00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_D.md -->

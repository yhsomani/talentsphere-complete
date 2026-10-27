# Legacy Merge Ledger B (preservation record for source group B)

Doc ID: CC-LEDGER-B · Owner: Documentation Architect · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: `KNOWLEDGE_PRESERVATION_MANIFEST.md`, `INFORMATION_RECONCILIATION_MATRIX.md`, `MASTER_INDEX.md`, `LEGACY_MERGE_LEDGER_A.md`, `LEGACY_MERGE_LEDGER_C.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md`

Supersedes nothing. This ledger is the link target for every `LEGACY_MERGE_*` file created by the Group B merge in folders 08 to 18, 23 and 25. `MASTER_INDEX.md` is not edited by Group B and should link here (control-centre owner action). Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## 1. Scope and method

- Branch: `chore/remove-app-code-keep-docs-2026-10-26` only. No other branch, no `git show main:`.
- Frame: no source code exists; **nothing is implemented**. Legacy statements are rewritten as "prior attempt reported X" or "target requires X". Verbatim legacy blocks are always introduced by a frame paragraph that says they describe an earlier attempt.
- Source group B: `31_LEGACY_ARCHIVE/docs/engineering/**` (including `adr/`), `.../docs/system-model/**`, `.../docs/quality/**`, `31_LEGACY_ARCHIVE/deploy/*.md`, plus root `ARCHITECTURE.md` (read, not edited). 22 archive files plus the root file. No source file was edited, moved or deleted.
- Method: each source was read in full. Narrative was rewritten by hand into the target folder that matches its subject. Large tables, diagrams and ADR texts were copied **unchanged** by a script (line-range includes) so no character was retyped; the script only removed legacy relative markdown links (their targets do not exist in this tree) and removed the duplicate title line. Source files contain `?` where non-ASCII characters were lost in an earlier export; copied blocks keep the `?`.
- Folders edited (ownership list): 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 23, 25 (new files only), plus one appended index line in each of `11_BACKEND_ARCHITECTURE/INDEX.md`, `12_DATA_AND_DATABASE/INDEX.md`, `13_API_EVENTS_AND_INTEGRATIONS/INDEX.md`, `14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md`, and this ledger in 00. Not touched: `SSOT.md`, `AGENTS.md`, `CLAUDE.md`, `.env` files, `MASTER_INDEX*`, `24_RISKS_AND_DECISIONS/*` (existing OPEN ids are cited, never renumbered; new items are local ids in the new files), `28_TRACEABILITY_AND_COVERAGE/*`, `CANONICAL_INVARIANTS.md`.

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

## 5. Verification performed

- Endpoint index: all 278 legacy rows compared with `13_*/OBSERVED_REFERENCE_API_INVENTORY.csv` by method+path, registry flag and source anchor: 278 of 278 present, 0 differing.
- Line-range includes: every range was checked against the source for table or fence boundaries (header and separator present, no cut rows); Mermaid code fences in the diagram library file are balanced (12 `mermaid` blocks, 24 fences).
- Secret scan of all new files (live-key prefixes, webhook secret prefixes, JWT-like strings, credentialed connection strings): none found. The only connection string is a documented placeholder (`REPLACE_ME`); the hosted project reference is an identifier, not a credential.
- Existing ids used in cross-references (ADR-T01..T23, INV-T01..T20, DOM-01..24, OPEN-nn, Doc IDs of target files) were read from the target files before use. Cross-references to RB/FM/ALT/TEST ids were kept generic where the exact id was not confirmed.
- Not performed: Mermaid syntax validation (no tool run), link checking of the new files, rendering. No application code, tests or build were run (none exist).

## 6. Follow-up actions for the control-centre owner

1. Add this ledger and the 17 files to `MASTER_INDEX.md` (or an addendum) and to `KNOWLEDGE_PRESERVATION_MANIFEST.*` rows for the 23 sources above; mark those sources `Read and fully processed` (22) or `Read but partially processed` (1) only after reviewing this ledger.
2. Ask the ARB secretary to adopt or reject the local ids and assign owners (section 4).
3. Review OPEN_DECISIONS for the new DPDP and ADR-namespace items.
4. No source is cleared for deletion by this ledger; the standing instruction applies.

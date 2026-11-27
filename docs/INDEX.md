# TalentSphere — Documentation Index

The single entry point to the project's documentation. Every project document lives under `docs/`, including the as-built record [`ARCHITECTURE.md`](ARCHITECTURE.md), the canonical intent [`SSOT.md`](SSOT.md) and the generated mind map [`mindmap/`](mindmap/README.md). The only documents left outside are files a tool reads from a fixed path; they are listed under [Layout](#layout). Links are relative to this file; `../` reaches the repository root.

The documentation was consolidated on 2026-11-25: about 580 files in eight folders became about 150 Markdown files, and a third round the same day merged the 130 agent working files from `.agents/teamwork/`. Every old path, and where its content went, is listed in [`archive/REMOVED_FILES.md`](archive/REMOVED_FILES.md).

## Start here

| Need | Read |
|---|---|
| Set up and run the project | [`../README.md`](../README.md) |
| What is built, and the rules to follow before changing code | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| What the product is meant to be (canonical intent) | [`SSOT.md`](SSOT.md) |
| Reverse-engineered map of everything in the code: stable IDs, evidence, test results, docs-vs-code gaps | [`mindmap/README.md`](mindmap/README.md) (start at the [master mind map](mindmap/master/MASTER_PROJECT_MINDMAP.md)) |
| Every feature from module down to nano-feature (single rule, field constraint, error branch, UI binding), with status, evidence and tests | [`mindmap/catalog/FEATURE_CATALOG.md`](mindmap/catalog/FEATURE_CATALOG.md) (generated; journey, data-flow, API, database, state and test views next to it) |
| What work is in flight, blocked or waiting on the owner, and where to resume | [`governance/IMPLEMENTATION_TRACKER.md`](governance/IMPLEMENTATION_TRACKER.md) |
| How the product should change next, and why: audit, positioning, new modules, import strategy, architecture evolution, phased roadmap (proposed) | [`product/TRANSFORMATION_PLAN.md`](product/TRANSFORMATION_PLAN.md) |
| Plans, prices, entitlements and what is actually enforced | [`PRICING.md`](PRICING.md) |
| Current source coverage, status and documentation disposition | [`system-model/01-inventory-and-coverage.md`](system-model/01-inventory-and-coverage.md) |
| Complete historical 173-feature matrix | [`reports/FEATURE_STATUS_2026-10-21.md`](reports/FEATURE_STATUS_2026-10-21.md) (dated snapshot, not current acceptance) |
| The full intended product, module by module (not ratified) | [`blueprint/README.md`](blueprint/README.md) |
| Coding-agent workflow | [`../AGENTS.md`](../AGENTS.md), [`../CLAUDE.md`](../CLAUDE.md) |

## Canonical set

The minimal documentation set, mapped onto the files that already hold each subject. One file owns each subject; the others link to it.

| Subject | Canonical file | Also read |
|---|---|---|
| Project single source of truth (purpose, scope, users, modules, intended rules) | [`SSOT.md`](SSOT.md) | [`product/PRD.md`](product/PRD.md) (short product summary) |
| Architecture (as built) | [`ARCHITECTURE.md`](ARCHITECTURE.md) | [`engineering/TARGET_ARCHITECTURE.md`](engineering/TARGET_ARCHITECTURE.md) (intended, not built) |
| Feature catalog, module to nano-feature | [`mindmap/catalog/FEATURE_CATALOG.md`](mindmap/catalog/FEATURE_CATALOG.md) (generated) | [`registries/FEATURE_REGISTRY.md`](registries/FEATURE_REGISTRY.md) (feature IDs) |
| User journeys and navigation | [`experience/JOURNEY_REGISTRY.md`](experience/JOURNEY_REGISTRY.md), [`experience/APP_FLOW.md`](experience/APP_FLOW.md) | [`mindmap/catalog/JOURNEY_GRAPHS.md`](mindmap/catalog/JOURNEY_GRAPHS.md) (journeys proven by e2e) |
| Business rules, permissions, state transitions | [`registries/BUSINESS_RULE_REGISTRY.md`](registries/BUSINESS_RULE_REGISTRY.md) | [`system-model/06-route-authorization.md`](system-model/06-route-authorization.md), [`mindmap/catalog/STATE_GRAPHS.md`](mindmap/catalog/STATE_GRAPHS.md) |
| Data and API | [`engineering/API_CONTRACTS.md`](engineering/API_CONTRACTS.md), [`engineering/DATABASE.md`](engineering/DATABASE.md) | [`mindmap/catalog/API_DEPENDENCY_GRAPH.md`](mindmap/catalog/API_DEPENDENCY_GRAPH.md), [`mindmap/catalog/DATABASE_GRAPH.md`](mindmap/catalog/DATABASE_GRAPH.md), [`mindmap/catalog/DATA_FLOW_GRAPHS.md`](mindmap/catalog/DATA_FLOW_GRAPHS.md) |
| Engineering quality (security, testing, operations, reliability) | [`quality/SECURITY.md`](quality/SECURITY.md), [`quality/TESTING.md`](quality/TESTING.md), [`quality/OPERATIONS.md`](quality/OPERATIONS.md) | [`engineering/CODE_STYLE.md`](engineering/CODE_STYLE.md), [`mindmap/catalog/TEST_TRACEABILITY.md`](mindmap/catalog/TEST_TRACEABILITY.md) |
| Implementation tracker | [`governance/IMPLEMENTATION_TRACKER.md`](governance/IMPLEMENTATION_TRACKER.md) | GitHub issues and pull requests |
| Decisions | [Decisions](#decisions) below (an index: ADRs in [`engineering/DECISIONS.md`](engineering/DECISIONS.md), open conflicts in [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md#documentation-conflicts-open-2026-10-21)) | |
| Project graph and mind map views | [`mindmap/README.md`](mindmap/README.md) (one machine-readable dataset, `master/MASTER_PROJECT_GRAPH.json`, and the views generated from it) | [`catalog/GRAPH_VALIDATION.md`](mindmap/catalog/GRAPH_VALIDATION.md) |

The two product contradictions that waited on the owner were decided on 2026-11-26: **C-8** (privacy threshold) becomes k ≥ 10 distinct people (ADR-028), and **C-22** (rule text drift for BR-065, BR-066, BR-35 and BR-208) keeps the SSOT wording (ADR-029). See [`engineering/DECISIONS.md`](engineering/DECISIONS.md#owner-delegated-decisions-2026-11-26) and tracker row T-015.

## Authority order

When two documents disagree:

1. **What exists today:** the code, then [`ARCHITECTURE.md`](ARCHITECTURE.md), then the generated [`docs/mindmap/`](mindmap/README.md) (regenerated from source; it names the commit of its test results), then [`system-model/01-inventory-and-coverage.md`](system-model/01-inventory-and-coverage.md) (a 2026-10-23 snapshot). Dated reports do not override newer source.
2. **What is intended:** [`SSOT.md`](SSOT.md), then the requirement documents and registries in sections 1 to 4 below. [`blueprint/`](blueprint/README.md) and [`archive/target-blueprint/`](archive/target-blueprint/README.md) are unratified proposals for the same intent: the blueprint's own `DEC-001` says it does not supersede `SSOT.md` until `OD-PRD-31` defines ratification.
3. **History:** [`reports/`](#7-reports-dated-snapshots), [`history/PROJECT_HISTORY.md`](history/PROJECT_HISTORY.md) and [`archive/`](#8-archive) are evidence of what happened, not current state.

Unresolved conflicts are listed in [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md#documentation-conflicts-open-2026-10-21) and [`system-model/03-conflicts-conditions-audit.md`](system-model/03-conflicts-conditions-audit.md). They are not resolved by assumption.

## Layout

```text
docs/
  INDEX.md                     this file
  ARCHITECTURE.md              architecture as built (former root ARCHITECTURE.md)
  SSOT.md                      canonical intent (former root SSOT.md)
  PRICING.md                   plans and entitlements (read by a test)
  product/ engineering/ experience/ quality/ registries/ governance/ system-model/
                               as-built references, requirements and registries
  reports/                     dated audits and status snapshots
  history/                     agent memory, execution history and superseded records (former BRAIN/, .agents/teamwork/, MASTER_SYSTEM_MODEL)
  blueprint/                   intended-product blueprint (former PRODUCT_BLUEPRINT/)
  archive/target-blueprint/    earlier redesign blueprint (former Yash_Final_Project_Document/)
  archive/REMOVED_FILES.md     every moved, merged or deleted path
  mindmap/                     generated from source; do not edit by hand (former project-mindmap/; see its README)
```

Documents that stay outside `docs/` because a tool or host reads them from a fixed path:

| Path | Why it stays |
| --- | --- |
| `README.md` | GitHub shows it as the repository front page |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | Coding agents (Codex and others, Claude Code, Gemini CLI) load them from the repository root |
| `RETICLE.md` | Reticle's own reference file, linked from the block `reticle init` writes into `CLAUDE.md` |
| `.github/copilot-instructions.md` | GitHub Copilot reads it there; `.github/` is a protected build path |
| `.cursor/rules/repository.mdc` | Cursor reads rules from `.cursor/rules/` |
| `.claude/commands/`, `.claude/skills/`, `.agents/skills/` | Claude Code and other agents load commands and skills from these folders |
| `deploy/oracle/README.md`, `RECOVERY.md`, `NEW_SUPABASE_PROJECT.md` | Deployment runbooks beside the files they operate; `deploy/` is a protected build path that agents may not change |

## 1. Requirements

| Document | Purpose |
|---|---|
| [`SSOT.md`](SSOT.md) | Canonical project and system definition. Owns intent. |
| [`product/PRD.md`](product/PRD.md) | Product requirements, personas, capability matrix. |
| [`registries/FEATURE_REGISTRY.md`](registries/FEATURE_REGISTRY.md) | 173 feature IDs (F-01 to F-173). An inventory, not a status tracker. |
| [`registries/BUSINESS_RULE_REGISTRY.md`](registries/BUSINESS_RULE_REGISTRY.md) | Business rules BR-001 to BR-248, then (appended) where the 66 workflow state machines live, from the former `WORKFLOWS_AND_BUSINESS_RULES.md`. |
| [`experience/JOURNEY_REGISTRY.md`](experience/JOURNEY_REGISTRY.md) | User journeys J-01 to J-28. |

## 2. Architecture

| Document | Purpose |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | **Architecture as built.** Boundaries, invariants, decision register, and what does not exist. Governs what exists. |
| [`engineering/TARGET_ARCHITECTURE.md`](engineering/TARGET_ARCHITECTURE.md) | **Target architecture**, then (appended) the technical requirements from the former `TRD.md`. Not a description of the running code. |
| [`engineering/DECISIONS.md`](engineering/DECISIONS.md) | Full text of ADR-015 (persist the core career loop; the API's maps are a read model; ratified by ADR-017), ADR-016 (browser-measured UI quality gates) and ADR-017 to ADR-029, the decisions the owner delegated on 2026-11-26 (issues #44 to #50, C-8, C-22, cookie session, file storage, code runner, `server.ts` split, course evidence), plus ADR-030 (free-tier services for the pilot), each with options, pros and cons and owner-only steps. |

### System model

Source model and dated verification records, updated 2026-10-23. A source diagram is not a live-system verdict. Reading order for a new engineer: `02` (F1, then the flow you work on), the condition matrix in `03`, then the conflict register in `03` for what to distrust.

| Document | Purpose |
|---|---|
| [`system-model/01-inventory-and-coverage.md`](system-model/01-inventory-and-coverage.md) | Current status, documentation classification, domain/source map, validation and historical inventory |
| [`system-model/02-flows.md`](system-model/02-flows.md) | Mermaid flowcharts F1 to F7: architecture, auth, jobs and applications, verified work history, Stripe billing, boot and background jobs, web journeys |
| [`system-model/03-conflicts-conditions-audit.md`](system-model/03-conflicts-conditions-audit.md) | Conflict register (7 resolved, 21 open, with decision records), the condition and business-rule matrix (62 rules) and the completeness audit |
| [`system-model/06-route-authorization.md`](system-model/06-route-authorization.md) | Who may call each of about 170 more routes, what is durable, 6 fixes and 15 findings (CF-31 to CF-45). Read by a test |
| [`history/PROJECT_HISTORY.md`](history/PROJECT_HISTORY.md#talentsphere--master-system-model) | The former `system-model/MASTER_SYSTEM_MODEL.md`: a hand-built Mermaid system model (2026-11-10 snapshot), superseded by the generated [`docs/mindmap/`](mindmap/README.md) |

Rules for keeping it true: change a diagram in the same commit as the code it describes; re-check a `path:line` before relying on it (lines drift); add every new contradiction to the conflict register instead of fixing a document silently.

## 3. Implementation details

| Document | Purpose |
|---|---|
| [`engineering/DATABASE.md`](engineering/DATABASE.md) | Actual SQL stores, relationships, all 57 migrations, lifecycle and hosted/local boundaries, then (appended) the hosted Supabase migration gate. |
| [`engineering/API_CONTRACTS.md`](engineering/API_CONTRACTS.md) | All 279 unique method/path pairs (282 registrations), request-schema locators, response/error semantics and billing retries. |
| [`engineering/CODE_STYLE.md`](engineering/CODE_STYLE.md) | TypeScript conventions, formatting, linting. |
| [`quality/OPERATIONS.md` §10](quality/OPERATIONS.md#10-project-maintenance-tooling) | Windows maintenance scripts and their safety limits. |
| [`experience/UI_UX_DESIGN_SYSTEM.md`](experience/UI_UX_DESIGN_SYSTEM.md) | Design tokens, components, accessibility (WCAG 2.2 AA). |
| [`experience/APP_FLOW.md`](experience/APP_FLOW.md) | Routes, navigation guards, state transitions. |

## 4. Quality, security, operations and deployment

| Document | Purpose |
|---|---|
| [`quality/TESTING.md`](quality/TESTING.md) | Test strategy: Vitest unit and integration, Postgres suite, Playwright. |
| [`quality/SECURITY.md`](quality/SECURITY.md) | Security architecture, RLS, session handling, AI safety, privacy. |
| [`quality/OPERATIONS.md`](quality/OPERATIONS.md) | Runbooks, health checks, degradation, backups, observability. |
| [`../deploy/oracle/README.md`](../deploy/oracle/README.md) | Oracle Always Free staging. Not evidence of a production release. Kept next to the deploy files it describes. |
| [`../deploy/oracle/RECOVERY.md`](../deploy/oracle/RECOVERY.md) | PostgreSQL backup and restore checks. |

## 5. Governance and planning

| Document | Purpose |
|---|---|
| [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md) | Authority, change classes, no-duplication rule and status vocabulary; then the gap analysis with the open documentation-conflicts register, the phased implementation plan, and the historical 2026-09-24 source reconciliation (its "greenfield" status is superseded). |
| [`product/TRANSFORMATION_PLAN.md`](product/TRANSFORMATION_PLAN.md) | **Proposed** product transformation plan (2026-11-26): evidence-based audit, positioning and wedge, module register with phases, skill-signal ledger, import strategy, architecture evolution, roadmap P0 to P3 and first slices TS-01 to TS-14, decisions TPD-01 to TPD-10. Owns the reasoning; work items are tracker rows T-021 to T-033. |
| [`reports/FEATURE_PLAN_2026-10-21.md`](reports/FEATURE_PLAN_2026-10-21.md) | Proposed releases, sprint goals and explicit decision gates. |
| [`governance/IMPLEMENTATION_TRACKER.md`](governance/IMPLEMENTATION_TRACKER.md) | Living tracker: work items with priority, status, evidence and next action, the current test baseline, and how to resume. |

### Decisions

Decisions are kept where they are made; this list is the index, not a copy.

| Kind | Where |
|---|---|
| Approved decisions | Decision register in [`ARCHITECTURE.md`](ARCHITECTURE.md); full text of ADR-015 to ADR-030 in [`engineering/DECISIONS.md`](engineering/DECISIONS.md) |
| Intended architecture decisions | ADR-001 to ADR-013 in [`SSOT.md`](SSOT.md) |
| Unresolved documentation conflicts (including C-8 and C-22) | [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md#documentation-conflicts-open-2026-10-21) and the conflict register in [`system-model/03-conflicts-conditions-audit.md`](system-model/03-conflicts-conditions-audit.md) |
| Open product decisions awaiting the owner | GitHub issues #44 to #50 and the `REQUIRES_APPROVAL` rows in [`governance/IMPLEMENTATION_TRACKER.md`](governance/IMPLEMENTATION_TRACKER.md) |
| Proposed (unratified) blueprint decisions | [`blueprint/09_REGISTERS/OPEN_DECISIONS_REGISTER.md`](blueprint/09_REGISTERS/OPEN_DECISIONS_REGISTER.md) |
| How past decisions were reached | [`history/PROJECT_HISTORY.md`](history/PROJECT_HISTORY.md) |

### User journeys

Documented target journeys: [`experience/JOURNEY_REGISTRY.md`](experience/JOURNEY_REGISTRY.md) (J-01 to J-28) and navigation in [`experience/APP_FLOW.md`](experience/APP_FLOW.md). Journeys proven by the e2e suite, with the screens and endpoints each one exercises: [`mindmap/catalog/JOURNEY_GRAPHS.md`](mindmap/catalog/JOURNEY_GRAPHS.md) and [`mindmap/journeys/USER_JOURNEYS.md`](mindmap/journeys/USER_JOURNEYS.md).

## 6. Intended product blueprint

[`blueprint/`](blueprint/README.md) is a from-scratch definition of the intended product: 30 modules and about 1,144 features, with registers and intended-product mind maps. It is **not ratified**. Sections `00`, `01`, `03` to `08`, `10` and `11` are one file each; the 30 module specs stay one file per module in [`blueprint/02_MODULES/`](blueprint/02_MODULES/); the large registers stay one file each in [`blueprint/09_REGISTERS/`](blueprint/09_REGISTERS/), and the seven small ones are in [`OTHER_REGISTERS.md`](blueprint/09_REGISTERS/OTHER_REGISTERS.md).

## 7. Reports (dated snapshots)

Each report is a point-in-time record. Even reports dated the same day can describe different source revisions; current code and the implementation inventory govern factual conflicts.

| Document | Date | Contents |
|---|---|---|
| [`reports/FEATURE_STATUS_2026-10-21.md`](reports/FEATURE_STATUS_2026-10-21.md) | 2026-10-21 | **Historical.** Provisional inventory of 173 features; semantic acceptance and runtime coverage limits are explicit. Read by the mind map generator. |
| [`reports/FEATURE_PLAN_2026-10-21.md`](reports/FEATURE_PLAN_2026-10-21.md) | 2026-10-21 | Plan that follows from the status cross-check. |
| [`reports/FEATURE_TRACEABILITY_MATRIX.md`](reports/FEATURE_TRACEABILITY_MATRIX.md) | 2026-10-22 | The 173 features traced to code and tests. |
| [`reports/IMPROVEMENT_PROGRAM_2026-10-10.md`](reports/IMPROVEMENT_PROGRAM_2026-10-10.md) | 2026-10-10 | Improvement program and open risks. |
| [`reports/AUDITS_2026-10.md`](reports/AUDITS_2026-10.md) | 2026-10-03 to 10-23 | Every October audit, oldest first: production audit (verdict: not ready), final validation, maintenance audit, E2E audit, master repository audit, payment audit, Stripe and Supabase audit. |
| [`reports/REPOSITORY_STATE_2026-10.md`](reports/REPOSITORY_STATE_2026-10.md) | 2026-10-22 to 10-23 | Architecture and durability review, git and issue reconciliation, release scope and backlog, and the second-pass re-audit with live Stripe/Supabase release gates. |
| [`reports/DOC_DEDUP_2026-11-25.md`](reports/DOC_DEDUP_2026-11-25.md) | 2026-11-25 | Paragraph- and section-level duplicate scan of every Markdown file, the duplicate-resolution matrix, contradictions, and the doc-to-code sync edits. |
| [`reports/AUDIT_EVIDENCE_2026-10-21.md`](reports/AUDIT_EVIDENCE_2026-10-21.md) | 2026-10-21 | Evidence ledger (173 features, 248 rules, 28 journeys, routes, migrations and dated tests), converted from JSON to tables; continues in [part 2](reports/AUDIT_EVIDENCE_2026-10-21_PART2.md). |

## 8. Archive

| Document | Contents |
|---|---|
| [`archive/target-blueprint/README.md`](archive/target-blueprint/README.md) | The earlier greenfield redesign blueprint (former `Yash_Final_Project_Document/`), one file per numbered section (`00` to `30` and `99`; large sections in parts). CSV, JSON and YAML became Markdown. Its content was mined into `blueprint/`. |
| [`history/PROJECT_HISTORY.md`](history/PROJECT_HISTORY.md) | Agent conceptual model, execution memory and audit log (former `BRAIN/`), and the 2026-10-21 maintenance plan. |
| [`history/AGENT_TEAMWORK_2026-10.md`](history/AGENT_TEAMWORK_2026-10.md) | The 116 Markdown working files of the October 2026 multi-agent audit (former `.agents/teamwork/`), byte for byte; its scripts and JSON output are in [`AGENT_TEAMWORK_2026-10_DATA.md`](history/AGENT_TEAMWORK_2026-10_DATA.md). |
| [`archive/REMOVED_FILES.md`](archive/REMOVED_FILES.md) | Every path removed on 2026-11-25 and where its content is now, with the commit to restore from. |

## 9. Agent and tooling instructions

| Document | Purpose |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | Coding-agent rules and workflow. |
| [`../CLAUDE.md`](../CLAUDE.md) | Project instructions loaded into Claude Code, including the Reticle verification block. |
| [`../GEMINI.md`](../GEMINI.md) | Pointer to `AGENTS.md` for Gemini. |
| [`../RETICLE.md`](../RETICLE.md) | Full Reticle verification rules. |
| [`../.claude/commands/reticle.md`](../.claude/commands/reticle.md) | `/reticle` skill: detect, connect, drive one flow, report. |
| `../.claude/skills/` and `../.agents/skills/` | CodeRabbit review skills. The two folders are byte-identical on purpose: each agent tool reads its own folder. |

## Conventions

- Each definition lives in one canonical document. Other documents link to it rather than copying it (see [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md) §2).
- Every project document is Markdown. Machine data that tools read (the mind map's JSON, CSV, DOT and MMD files, `.env.example`, configuration) is not documentation and keeps its format.
- Dated report filenames carry their date. Undated files are living documents.
- A merged file starts with a status block and a table of the former files it holds; each former file is a section under its original title. Old links resolve through [`archive/REMOVED_FILES.md`](archive/REMOVED_FILES.md).
- Paths read by tests, code comments, CI or the mind map generator keep their exact names: `PRICING.md`, `system-model/01`, `02`, `06`, `quality/*`, `engineering/API_CONTRACTS.md`, `CODE_STYLE.md`, `experience/*`, `registries/*`, `reports/FEATURE_STATUS_2026-10-21.md`, `reports/IMPROVEMENT_PROGRAM_2026-10-10.md` and this file.
- On 2026-10-21, copies of SSOT sections that had drifted were replaced with pointers: the workflow sections of the former `WORKFLOWS_AND_BUSINESS_RULES.md`, `engineering/DATABASE.md` §15–§22 and §31–§32, and `experience/UI_UX_DESIGN_SYSTEM.md` Appendix D. Their content is canonical in [`SSOT.md`](SSOT.md).

## Documentation audits

- **2026-10-23:** the [file-by-file inventory](system-model/01-inventory-and-coverage.md#file-by-file-documentation-classification) classified every tracked Markdown document then; four redundant files were consolidated (197 to 193).
- **2026-11-25:** one documentation home. `PRODUCT_BLUEPRINT/` moved to `docs/blueprint/` (106 files to 49), `Yash_Final_Project_Document/` to `docs/archive/target-blueprint/` (246 files to 40), `BRAIN/` into `docs/history/`, and the rest of `docs/` went from 50 files to 32. The tool output in `graphify-out/` (127 files) and the empty Obsidian vault in `TalentSphere/` were deleted. See [`archive/REMOVED_FILES.md`](archive/REMOVED_FILES.md).
- **2026-11-26 (one folder):** the last documents outside `docs/` moved in with `git mv`, history kept: `ARCHITECTURE.md` and `SSOT.md` from the root to `docs/`, `project-mindmap/` to `docs/mindmap/` (its generator scripts now write there), and `supabase/hosted/README.md` to `engineering/HOSTED_SUPABASE.md`. Links were rewritten; the files that must stay where a tool reads them are listed under [Layout](#layout). Dated reports, history and archive text keep the old names as written at the time.
- **2026-11-26 (owner-approved cuts):** the 2 MB `reports/DOC_DEDUP_2026-11-25_GROUPS.md` appendix was retired, and the mind map catalog's 137 module pages became 9 files, one per application (in parts when large). Logged in [`archive/REMOVED_FILES.md` §7](archive/REMOVED_FILES.md#7-retired-or-folded-on-2026-11-26-owner-approved-cuts) and [`reports/DOC_DEDUP_2026-11-25.md` §12](reports/DOC_DEDUP_2026-11-25.md#12-owner-approved-cuts-2026-11-26).
- **2026-11-26 (fourth round, by reading):** superseded records moved out of living documents into [`history/PROJECT_HISTORY.md`](history/PROJECT_HISTORY.md): `system-model/MASTER_SYSTEM_MODEL.md` (a hand-built 2026-11-10 graph, now replaced by the generated `project-mindmap/`), the greenfield source reconciliation from `governance/GOVERNANCE.md`, and `engineering/TARGET_ARCHITECTURE.md` §11 (an older copy of SSOT §12.6 to §12.12). Stale statements fixed in `README.md`, `quality/TESTING.md`, `system-model/02-flows.md` and the `GOVERNANCE.md` authority list. See [`reports/DOC_DEDUP_2026-11-25.md` §11](reports/DOC_DEDUP_2026-11-25.md#11-fourth-round-by-reading).
- **2026-11-25 (third round):** the 130 files in `.agents/teamwork/` became two history files, `engineering/PROJECT_MAINTENANCE.md` became §10 of `quality/OPERATIONS.md`, and the canonical set above was mapped. Documentation files went from 429 to 313 with 0 broken relative links. Per-file inventory and classification: [`reports/DOC_DEDUP_2026-11-25.md` §10](reports/DOC_DEDUP_2026-11-25.md#10-third-round-inventory-and-consolidation).
- **2026-11-25 (second pass):** paragraph-level duplicate scan and doc-to-code sync; the copies of the feature and business-rule registries in `system-model/MASTER_SYSTEM_MODEL.md` §4 and §5 were replaced with links. See [`reports/DOC_DEDUP_2026-11-25.md`](reports/DOC_DEDUP_2026-11-25.md).

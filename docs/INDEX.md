# TalentSphere — Documentation Index

This is the single entry point to the project's documentation. Links are resolved relative to this file; `../` here reaches the repository root. The index lists files that exist; it does not repeat their content.

## Start here

| Need | Read |
|---|---|
| Set up and run the project | [`../README.md`](../README.md) |
| What is built, and the rules to follow before changing code | [`../ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Plans, prices, entitlements and what is actually enforced | [`PRICING.md`](PRICING.md) |
| Second-pass re-audit (2026-10-23) and live Stripe/Supabase release gates | [`../REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`](../REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md) |
| Current source coverage, status and documentation disposition | [`system-model/01-inventory-and-coverage.md`](system-model/01-inventory-and-coverage.md) |
| Complete historical 173-feature matrix | [`reports/FEATURE_STATUS_2026-10-21.md`](reports/FEATURE_STATUS_2026-10-21.md) (dated snapshot, not current acceptance) |
| Historical evidence ledger: 173 features, 248 rules, 28 journeys, routes and dated tests | [`reports/AUDIT_EVIDENCE_2026-10-21.json`](reports/AUDIT_EVIDENCE_2026-10-21.json) |
| Proposed releases, sprint goals and explicit decision gates | [`reports/FEATURE_PLAN_2026-10-21.md`](reports/FEATURE_PLAN_2026-10-21.md) |
| Canonical intent | [`../SSOT.md`](../SSOT.md) |
| Coding-agent workflow | [`../AGENTS.md`](../AGENTS.md), [`../CLAUDE.md`](../CLAUDE.md) |
| Browser verification with Reticle | [`../RETICLE.md`](../RETICLE.md) |
| Project memory and execution history | [`../BRAIN/MEMORY.md`](../BRAIN/MEMORY.md) |

## Authority order

When two documents disagree:

1. **What exists today:** the code, then the root `ARCHITECTURE.md`, then the source-scoped `system-model/01-inventory-and-coverage.md`. Dated reports do not override newer source.
2. **What is intended:** `SSOT.md`, then the specialised files below (`PRD`, `TRD`, registries, `TARGET_ARCHITECTURE`).
3. **History:** dated reports and `BRAIN/MEMORY.md` are evidence of what happened, not current state.

Unresolved conflicts are listed in [`governance/GAP_ANALYSIS.md`](governance/GAP_ANALYSIS.md#documentation-conflicts-open-2026-10-21). They are not resolved by assumption.

## 1. Requirements

| Document | Purpose |
|---|---|
| [`../SSOT.md`](../SSOT.md) | Canonical project and system definition. Owns intent. |
| [`product/PRD.md`](product/PRD.md) | Product requirements, personas, capability matrix. |
| [`engineering/TRD.md`](engineering/TRD.md) | Technical requirements: runtime constraints, latency, security posture. |
| [`registries/FEATURE_REGISTRY.md`](registries/FEATURE_REGISTRY.md) | 173 feature IDs (F-01 to F-173). An inventory, not a status tracker. |
| [`registries/BUSINESS_RULE_REGISTRY.md`](registries/BUSINESS_RULE_REGISTRY.md) | Business rules BR-001 to BR-248. |
| [`registries/WORKFLOWS_AND_BUSINESS_RULES.md`](registries/WORKFLOWS_AND_BUSINESS_RULES.md) | 66 declared workflow state machines, invariants and transition triggers. |
| [`experience/JOURNEY_REGISTRY.md`](experience/JOURNEY_REGISTRY.md) | User journeys J-01 to J-28. |

## 2. Architecture

| Document | Purpose |
|---|---|
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | **Architecture as built.** Boundaries, invariants, decision register, and what does not exist. Governs what exists. |
| [`engineering/TARGET_ARCHITECTURE.md`](engineering/TARGET_ARCHITECTURE.md) | **Target architecture.** Intended modular monolith, bounded contexts, flows. Not a description of the running code. |
| [`engineering/adr/ADR-015-core-loop-persistence.md`](engineering/adr/ADR-015-core-loop-persistence.md) | ADR: persist the core career loop; the API's in-memory maps are a read model. |
| [`engineering/adr/ADR-016-browser-measured-ui-quality-gates.md`](engineering/adr/ADR-016-browser-measured-ui-quality-gates.md) | ADR: measure UI quality in a real browser and test it adversarially. |
| [`system-model/00-index.md`](system-model/00-index.md) | **System model.** Source inventory, flowcharts, conflict register, rule matrix and dated verification evidence. Coverage limits are explicit. |

## 3. Implementation details

| Document | Purpose |
|---|---|
| [`engineering/DATABASE.md`](engineering/DATABASE.md) | Actual SQL stores, relationships, all 55 migrations, lifecycle and hosted/local boundaries. |
| [`engineering/API_CONTRACTS.md`](engineering/API_CONTRACTS.md) | All 278 unique method/path pairs, request-schema locators, response/error semantics and billing retries. |
| [`engineering/CODE_STYLE.md`](engineering/CODE_STYLE.md) | TypeScript conventions, formatting, linting. |
| [`experience/UI_UX_DESIGN_SYSTEM.md`](experience/UI_UX_DESIGN_SYSTEM.md) | Design tokens, components, accessibility (WCAG 2.2 AA). |
| [`experience/APP_FLOW.md`](experience/APP_FLOW.md) | Routes, navigation guards, state transitions. |

## 4. Quality, security and testing

| Document | Purpose |
|---|---|
| [`quality/TESTING.md`](quality/TESTING.md) | Test strategy: Vitest unit and integration, Postgres suite, Playwright. |
| [`quality/SECURITY.md`](quality/SECURITY.md) | Security architecture, RLS, session handling, AI safety, privacy. |
| [`quality/OPERATIONS.md`](quality/OPERATIONS.md) | Runbooks, health checks, degradation, backups, observability. |

## 5. Setup and deployment

| Document | Purpose |
|---|---|
| [`../README.md`](../README.md) | Local setup, commands, test suites, CI. |
| [`../deploy/oracle/README.md`](../deploy/oracle/README.md) | Oracle Always Free staging. Not evidence of a production release. |
| [`../deploy/oracle/RECOVERY.md`](../deploy/oracle/RECOVERY.md) | PostgreSQL backup and restore checks. |

| [`engineering/HOSTED_SUPABASE_MIGRATION_GATE.md`](engineering/HOSTED_SUPABASE_MIGRATION_GATE.md) | Hosted adapter, dependency audit and release prerequisites; no live application claim. |
| [`engineering/PROJECT_MAINTENANCE.md`](engineering/PROJECT_MAINTENANCE.md) | Current Windows maintenance implementation and safety limits; historical material is archived. |

## 6. Agent and tooling instructions

| Document | Purpose |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | Coding-agent rules and workflow. |
| [`../CLAUDE.md`](../CLAUDE.md) | Project instructions loaded into Claude Code, including the Reticle verification block. |
| [`../RETICLE.md`](../RETICLE.md) | Full Reticle verification rules. |
| [`../.claude/commands/reticle.md`](../.claude/commands/reticle.md) | `/reticle` skill: detect, connect, drive one flow, report. |
| [`../BRAIN/BRAIN.md`](../BRAIN/BRAIN.md) | Conceptual model. |
| [`../BRAIN/MEMORY.md`](../BRAIN/MEMORY.md) | Living execution memory and audit log. Historical. |

## 7. Governance and planning

| Document | Purpose |
|---|---|
| [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md) | Authority, change classes, no-duplication rule, status vocabulary. |
| [`governance/IMPLEMENTATION_PLAN.md`](governance/IMPLEMENTATION_PLAN.md) | Phased execution order. |
| [`governance/GAP_ANALYSIS.md`](governance/GAP_ANALYSIS.md) | Design gaps, verification gaps, and the open documentation-conflicts register. |
| [`governance/SOURCE_RECONCILIATION.md`](governance/SOURCE_RECONCILIATION.md) | **Historical** (2026-09-24). Its "greenfield" status is superseded. |

## 8. Reports (dated snapshots)

Each report is a point-in-time record. Even reports dated the same day can describe different source revisions; current code and the implementation inventory govern factual conflicts.

| Document | Date | Status |
|---|---|---|
| [`reports/FEATURE_STATUS_2026-10-21.md`](reports/FEATURE_STATUS_2026-10-21.md) | 2026-10-21 | **Historical.** Provisional inventory of 173 features; semantic acceptance and runtime coverage limits are explicit. |
| [`reports/FEATURE_PLAN_2026-10-21.md`](reports/FEATURE_PLAN_2026-10-21.md) | 2026-10-21 | Plan that follows from the status cross-check. |
| [`reports/FINAL_VALIDATION_REPORT.md`](reports/FINAL_VALIDATION_REPORT.md) | 2026-10-18 | Corpus integrity and founder corrections. Its test and feature counts are not re-measured. |
| [`reports/IMPROVEMENT_PROGRAM_2026-10-10.md`](reports/IMPROVEMENT_PROGRAM_2026-10-10.md) | 2026-10-10 | Improvement program and open risks. |
| [`reports/PRODUCTION_AUDIT_2026-10-03.md`](reports/PRODUCTION_AUDIT_2026-10-03.md) | 2026-10-03 | Business-owner production audit (verdict: not ready). Partly superseded by later work. |

## Conventions

- Each definition lives in one canonical document. Other documents link to it rather than copying it (see [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md) §2).
- Dated report filenames carry their date. Undated files are living documents.
- The `TalentSphere/` folder is a personal Obsidian vault, not project documentation.
- On 2026-10-21, copies of SSOT sections that had drifted were replaced with pointers: `registries/WORKFLOWS_AND_BUSINESS_RULES.md` §11–§26, `engineering/DATABASE.md` §15–§22 and §31–§32, and `experience/UI_UX_DESIGN_SYSTEM.md` Appendix D. Their content is canonical in [`../SSOT.md`](../SSOT.md). Conflicts are in [`governance/GAP_ANALYSIS.md`](governance/GAP_ANALYSIS.md#documentation-conflicts-open-2026-10-21).


## Documentation audit, 2026-10-23

The [file-by-file inventory](system-model/01-inventory-and-coverage.md#file-by-file-documentation-classification)
classifies every original tracked Markdown document. Four redundant/superseded files
were consolidated: 197 ? 193 Markdown files, no new file, SSOT unchanged. API and
database target registers now link to SSOT; their files describe implementation.
Maintenance requirements/test evidence are retained in the maintenance archive;
the exact duplicate root plan remains in agent history. Build/deployment files,
personal notes and managed tooling instructions are preserved.

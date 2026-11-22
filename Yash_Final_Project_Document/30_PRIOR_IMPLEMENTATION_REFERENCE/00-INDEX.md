# TalentSphere — Canonical Documentation Index

> **Reference only — prior attempt.** This file analyses an EARLIER implementation attempt. For this project nothing is assumed implemented: labels such as `Implemented-verified` describe what the prior attempt's code reportedly did, not the state of this project. Target design lives in `Yash_Final_Project_Document/` folders 00-29; founder intent is the root `SSOT.md`.

This folder is the consolidated, evidence-checked documentation set. It was built on branch `docs/consolidation-2026-10-26` from `SSOT.md`, `ARCHITECTURE.md`, `docs/`, `BRAIN/`, deploy notes, the source code, and the earlier target-design blueprint in `Yash_Final_Project_Document/`.

## Authority rules
1. **Code, migrations and tests decide what is implemented.** Where a document and the code disagree, these files say so and cite the code.
2. **`SSOT.md` is the intent source** (protected, unchanged). It describes what the product should be, not what is built.
3. **`Yash_Final_Project_Document/` is a proposed target design.** Its content appears here only as sections labelled *Proposed*; it has open review findings (see its `27_INDEPENDENT_REVIEWS/`).
4. Every statement in the canonical files carries a status: Implemented-verified, Implemented-unverified, Partial, Planned, Proposed-only, Deprecated or Unknown. No test, build or deployment is claimed unless a file says it was run.
5. One topic has one canonical home (table below). Other documents link instead of repeating.

## Reading order
| # | File | Read it to |
|---|---|---|
| 01 | [Product requirements](01-PRODUCT-REQUIREMENTS.md) | understand the product, roles, scope, rules, requirements |
| 02 | [Architecture](02-ARCHITECTURE.md) | understand the stack, components, flows, invariants |
| 03 | [Development guide](03-DEVELOPMENT-GUIDE.md) | set up, build, run, extend; repo rules |
| 04 | [Features and workflows](04-FEATURES-AND-WORKFLOWS.md) | see every feature, its status, journeys, permissions |
| 05 | [Database and API](05-DATABASE-AND-API.md) | schema, migrations, all 278 routes |
| 06 | [Security and integrations](06-SECURITY-AND-INTEGRATIONS.md) | auth, authorization, privacy, Stripe, email, AI, gaps |
| 07 | [Testing and operations](07-TESTING-AND-OPERATIONS.md) | tests, CI, deploy, recovery, release checks |
| 08 | [Roadmap and decisions](08-ROADMAP-AND-DECISIONS.md) | open work, ADRs, 32 recorded documentation conflicts |

## Files that must stay where they are
- `docs/PRICING.md`: `tests/unit/pricing-consistency.test.ts` reads it at runtime.
- `docs/registries/FEATURE_REGISTRY.md`: read by `.agents/teamwork/explorer_features_1/extract_audit_data.cjs`.
- `SSOT.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `RETICLE.md`, `README.md`, `.github/**`, `deploy/**`: tool, agent and release files.
- Linked from root files (`AGENTS.md`, `RETICLE.md`, `ARCHITECTURE.md`, `SSOT.md`) and therefore kept: `docs/INDEX.md`, `docs/engineering/{API_CONTRACTS,CODE_STYLE,DATABASE,HOSTED_SUPABASE_MIGRATION_GATE}.md`, `docs/engineering/adr/ADR-015-*.md`, `docs/engineering/adr/ADR-016-*.md`, `docs/experience/APP_FLOW.md`, `docs/quality/{OPERATIONS,SECURITY,TESTING}.md`, `docs/reports/FEATURE_STATUS_2026-10-21.md`, `docs/system-model/{01,02,03,06}-*.md`. They are also source evidence for the canonical files here; do not delete them without first repointing every link.
- `Yash_Final_Project_Document/`: proposed target design with open review findings; kept as a whole.

## Maintenance rules
Search before creating a document. Update the canonical file instead of adding a new one. Do not create `FINAL`, `V2`, `NEW` or per-task Markdown files. Link, do not copy. Update the status label when behaviour changes. Keep scratch and agent logs out of the permanent tree.

# Implementation Tracker

> **Status.** Living document. Update it at the end of every work session so the next session resumes from here instead of re-discovering. Last updated 2026-11-26 (main at `cc2b806`; baseline below still measured at `9b3032f`, no code changed since).
>
> **What this file holds.** Work items, their state and the next action. It does not restate features, rules or decisions: features are in the generated [feature catalog](../mindmap/catalog/FEATURE_CATALOG.md), rules in the [business-rule registry](../registries/BUSINESS_RULE_REGISTRY.md), decisions in the places listed under [Decisions](../INDEX.md#decisions). GitHub issues and pull requests are the source of truth for their own state; re-check them before acting on a row here.

## Statuses

`DISCOVERED`, `PLANNED`, `APPROVED`, `IN_PROGRESS`, `IMPLEMENTED` (merged, not yet verified beyond CI), `VERIFIED` (merged and checked by tests or in the running app), `BLOCKED`, `DEFERRED`, `REQUIRES_APPROVAL`.

Priorities follow the issue labels: P0 critical (security, data loss, launch blocker), P1 major broken or missing capability, P2 significant reliability or UX problem, P3 maintainability, P4 cosmetic.

## Baseline (2026-11-25, main `9b3032f`)

Measured in a throwaway copy of the tracked files (AGENTS.md forbids installs in the repository): build, typecheck and lint pass; Vitest 1,572/1,572; PostgreSQL suite 71/71; Playwright 265/265; migration-integrity node test 5/5. Results: [`docs/mindmap/quality/EXECUTION_RESULTS.json`](../mindmap/quality/EXECUTION_RESULTS.json). There are no known pre-existing test failures at this commit.

Gaps computed from the [feature catalog](../mindmap/catalog/FEATURE_CATALOG.md) at the same commit: 184 of 282 endpoints keep state in process memory (ephemeral); 211 endpoints have no first-party web caller; 3 endpoints have no linked test; of 368 explicit failure branches, only 6 are asserted by their message text in a test (the rest are covered at endpoint level only); 105 registry features are not cited by any code or test; 19 screen states (loading, empty, error) were not detected on screens that call the API.

## Work items

| Task | Description | Priority | Related | Status | Evidence | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| T-001 | Transactional email delivery for verification codes and referee links | P0 | issue #44 | REQUIRES_APPROVAL | Provider-independent service and dev outbox exist (`apps/worker/src/email`); live delivery not established | Owner chooses and approves the provider (Brevo is wired as opt-in) |
| T-002 | Privacy and deletion policy, working contacts, legal agreement | P0 | issue #45 | REQUIRES_APPROVAL | Owner decision | Owner ratifies policy text |
| T-003 | Ratify ADR-015 and validate migrations against the target database | P0 | issue #46, [ADR-015](../engineering/DECISIONS.md) | REQUIRES_APPROVAL | Migrations pass on a clean PostgreSQL 16 in CI and locally | Owner ratifies; run against the target database |
| T-004 | Prove deployment, single-writer enforcement, worker detection and restore | P0 | issue #47 | PLANNED | [`deploy/oracle/RECOVERY.md`](../../deploy/oracle/RECOVERY.md) describes checks; no recorded run | Needs a staging environment and owner approval for any production step |
| T-005 | Store job alerts in PostgreSQL | P1 | issue #48, PR #92 | IMPLEMENTED | PR #92 merged 2026-11-25; tests pass at `9b3032f` | None |
| T-006 | Store professional connections in PostgreSQL | P1 | issue #48, PR #93 | IMPLEMENTED | PR #93 merged 2026-11-25 (migration 00057); tests pass at `9b3032f` | None |
| T-007 | Store resumes durably | P1 | issue #48 | IN_PROGRESS | Built in the code-improvement thread, not yet on GitHub | That thread opens its PR |
| T-008 | Remove the web copy of job and application transition rules; import them from `packages/domain` | P2 | ARCHITECTURE rule "business rules live only in packages/domain" | REQUIRES_APPROVAL | Needs build-file edits (`packages/domain/package.json`, `apps/web/tsconfig.json`) | Owner answers the pending approval in the code thread |
| T-009 | Service worker app-shell cache | P2 | PWA claims in [`quality/IMPLEMENTATION_GAPS.md`](../mindmap/quality/IMPLEMENTATION_GAPS.md) | IN_PROGRESS | Built in the code-improvement thread, not yet on GitHub | That thread opens its PR |
| T-010 | Make the remaining ephemeral beta modules durable or label them | P1 | issue #48; [ephemeral list](../mindmap/catalog/TEST_TRACEABILITY.md) | PLANNED | 184 ephemeral endpoints at `9b3032f` | Pick modules in beta scope first; one PR per module |
| T-011 | Assert failure branches by message or code in tests | P3 | [failure branches](../mindmap/catalog/TEST_TRACEABILITY.md) | DISCOVERED | 6 of 368 branches matched by message text | Add assertions per module when it is next changed |
| T-012 | Decide the 105 registry features with no code or test: build, defer or retire | P2 | [list](../mindmap/catalog/FEATURE_CATALOG.md) | REQUIRES_APPROVAL | Catalog "Documented features not found in code" | Owner triage; some may exist under another name ([reconciliation](../mindmap/quality/DOC_CODE_RECONCILIATION.md)) |
| T-013 | Real interview executor, scoring trust rules, token storage | P1 | issue #49 | REQUIRES_APPROVAL | Owner decision | Owner approves the architecture |
| T-014 | Free-only launch versus payment provider and entitlement policy | P1 | issue #50, [`PRICING.md`](../PRICING.md) | REQUIRES_APPROVAL | Stripe is wired behind `BILLING_MODE=stripe` (default disabled) | Owner decision; payment changes need explicit approval |
| T-015 | Resolve documentation conflicts C-8 and C-22 | P2 | [GOVERNANCE.md](GOVERNANCE.md#documentation-conflicts-open-2026-10-21) | REQUIRES_APPROVAL | Both change approved product rules | Owner decision |
| T-016 | Feature catalog to nano level and graph views | P3 | this file, `docs/mindmap/catalog/` | IMPLEMENTED | PR #94 merged 2026-11-25; graph validation passes | None |
| T-017 | Third documentation consolidation round: merge agent working files, map the canonical set | P3 | [`reports/DOC_DEDUP_2026-11-25.md` §10](../reports/DOC_DEDUP_2026-11-25.md#10-third-round-inventory-and-consolidation) | IMPLEMENTED | PR #95 merged 2026-11-25; 429 to 313 doc files, 0 broken links | None. Further merges need owner calls: see §10.7 of that report |
| T-018 | Fourth documentation round, by reading: move superseded records to history, fix stale statements | P3 | [`reports/DOC_DEDUP_2026-11-25.md` §11](../reports/DOC_DEDUP_2026-11-25.md#11-fourth-round-by-reading) | IMPLEMENTED | PR #97 merged 2026-11-26 | None |
| T-019 | Gather every document into `docs/` (one folder) | P3 | [`archive/REMOVED_FILES.md` §6](../archive/REMOVED_FILES.md#6-moved-into-docs-on-2026-11-26-one-folder), [`INDEX.md` Layout](../INDEX.md#layout) | IMPLEMENTED | PR #98 merged 2026-11-26 | None |
| T-020 | Owner-approved cuts: retire the 2 MB dedup groups appendix, fold the 137 catalog module pages into 9 | P3 | [`reports/DOC_DEDUP_2026-11-25.md` §12](../reports/DOC_DEDUP_2026-11-25.md#12-owner-approved-cuts-2026-11-26) | IMPLEMENTED | PR #99 merged 2026-11-26 | None |
| T-021 | Product transformation plan: audit, vision, module hierarchy, import strategy, architecture, roadmap | P2 | [plan](../product/TRANSFORMATION_PLAN.md) | IN_PROGRESS | Draft PR on `claude/project-thread-i0dg5f` (documentation only) | Owner reviews; ratifies vision wording, wedge and SSOT A.3 change into `SSOT.md` |
| T-022 | Park list: feature flags off in deployed environments for behavioral scoring, segmentation, transition probability, reputation, XP and seed-data insights (TS-02) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#43-what-to-park-and-why), TPD-04 | PLANNED | 34 scoring and reputation endpoints plus the seed-data insight endpoints, all ephemeral, none with a screen | Build behind existing feature flags (migration 00051) |
| T-023 | Organization-role policy in `packages/domain` and route checks (TS-04) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#22-architecture-and-engineering-findings) A-09; ARCHITECTURE R-2, U-3 | PLANNED | Several organization actions accept any membership | One PR with PostgreSQL cross-role tests |
| T-024 | Worker claim fencing: completion checks the claim token (TS-05) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#22-architecture-and-engineering-findings) A-05; ARCHITECTURE §18 | PLANNED | Completion not fenced by claim generation | One PR with a kill-the-worker test |
| T-025 | File service: storage adapter, scanning, `files` table (TS-06) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#153-first-implementation-slices) | REQUIRES_APPROVAL | No upload route exists | Owner approves storage and scanning vendor (new infrastructure, INVARIANT-011) |
| T-026 | Skill-signal ledger and profile projector (TS-07) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#72-the-skill-signal-ledger) | PLANNED | Skills read per module today | Build; acceptance cases in plan §7.2 |
| T-027 | Import v1: JSON Resume and CSV, review, commit, undo (TS-08) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#10-data-import-migration-and-integrations) | PLANNED | No import exists | After T-025 and T-026 |
| T-028 | Experience band on jobs; job-type and band filters (TS-09) | P2 | [plan](../product/TRANSFORMATION_PLAN.md#23-product-and-business-logic-findings) P-07 | PLANNED | `jobType` has `internship`; jobs screen filters by work mode only | One PR with contract and e2e tests |
| T-029 | Session token in httpOnly cookie; password reset (TS-10) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#131-security); ARCHITECTURE §12 | REQUIRES_APPROVAL | Token in localStorage; no reset flow | Owner approves the security change; reset needs T-001 |
| T-030 | Import v2: resume PDF and DOCX, LinkedIn data export, GitHub OAuth (TS-11) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#102-per-platform-strategy) | PLANNED | — | After T-027 and T-029; re-check each provider's terms first |
| T-031 | Split `server.ts` into per-module plugins, no behavior change (TS-12) | P3 | [plan](../product/TRANSFORMATION_PLAN.md#22-architecture-and-engineering-findings) A-01 | REQUIRES_APPROVAL | 13,887-line file | Owner approves a big refactor (`CLAUDE.md`) |
| T-032 | Goals, gaps and explained matching from the skill profile (TS-13) | P1 | [plan](../product/TRANSFORMATION_PLAN.md#65-goal-to-plan) | PLANNED | `CareerPage` career paths only | After T-026 |
| T-033 | Course completion may not mint authority-verified evidence without a graded assessment | P1 | [plan](../product/TRANSFORMATION_PLAN.md#23-product-and-business-logic-findings) P-02; ARCHITECTURE §20 | REQUIRES_APPROVAL | Changes an evidence rule | Owner decides the rule |

## Documentation work completed

| PR | Merged | What |
| --- | --- | --- |
| #89 | 2026-11-25 | Execution-backed project mind map, stable ID ledger, docs-vs-code reconciliation |
| #90 | 2026-11-25 | About 580 documentation files consolidated into about 150 Markdown files under `docs/` |
| #91 | 2026-11-25 | Paragraph-level duplicate scan, doc-to-code sync, mind map refresh |
| #94 | 2026-11-25 | Feature catalog to nano level, graph views, this tracker |
| #95 | 2026-11-25 | `.agents/teamwork/` merged into `docs/history/`, canonical-set map in `INDEX.md`, per-file inventory |
| #96 | 2026-11-25 | What remains unmerged and why (`DOC_DEDUP_2026-11-25.md` §10.7) |
| #97 | 2026-11-26 | Fourth documentation round, by reading |
| #98 | 2026-11-26 | Every document gathered into `docs/` |
| #99 | 2026-11-26 | Dedup groups appendix retired; catalog module pages folded into 9 |

## How to resume

1. Check the open issues and pull requests on GitHub; update any row here whose state changed.
2. If code changed since the commit above, regenerate the map and catalog ([`docs/mindmap/README.md`](../mindmap/README.md)) and copy the new gap counts into the baseline.
3. Take the highest-priority row that is not waiting on the owner. Rows marked `REQUIRES_APPROVAL` wait for the owner; do not start them on assumption.

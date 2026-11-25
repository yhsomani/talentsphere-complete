# Implementation Tracker

> **Status.** Living document. Update it at the end of every work session so the next session resumes from here instead of re-discovering. Last updated 2026-11-25 (main at `9b3032f`).
>
> **What this file holds.** Work items, their state and the next action. It does not restate features, rules or decisions: features are in the generated [feature catalog](../../project-mindmap/catalog/FEATURE_CATALOG.md), rules in the [business-rule registry](../registries/BUSINESS_RULE_REGISTRY.md), decisions in the places listed under [Decisions](../INDEX.md#decisions). GitHub issues and pull requests are the source of truth for their own state; re-check them before acting on a row here.

## Statuses

`DISCOVERED`, `PLANNED`, `APPROVED`, `IN_PROGRESS`, `IMPLEMENTED` (merged, not yet verified beyond CI), `VERIFIED` (merged and checked by tests or in the running app), `BLOCKED`, `DEFERRED`, `REQUIRES_APPROVAL`.

Priorities follow the issue labels: P0 critical (security, data loss, launch blocker), P1 major broken or missing capability, P2 significant reliability or UX problem, P3 maintainability, P4 cosmetic.

## Baseline (2026-11-25, main `9b3032f`)

Measured in a throwaway copy of the tracked files (AGENTS.md forbids installs in the repository): build, typecheck and lint pass; Vitest 1,572/1,572; PostgreSQL suite 71/71; Playwright 265/265; migration-integrity node test 5/5. Results: [`project-mindmap/quality/EXECUTION_RESULTS.json`](../../project-mindmap/quality/EXECUTION_RESULTS.json). There are no known pre-existing test failures at this commit.

Gaps computed from the [feature catalog](../../project-mindmap/catalog/FEATURE_CATALOG.md) at the same commit: 184 of 282 endpoints keep state in process memory (ephemeral); 211 endpoints have no first-party web caller; 3 endpoints have no linked test; of 368 explicit failure branches, only 6 are asserted by their message text in a test (the rest are covered at endpoint level only); 105 registry features are not cited by any code or test; 19 screen states (loading, empty, error) were not detected on screens that call the API.

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
| T-009 | Service worker app-shell cache | P2 | PWA claims in [`quality/IMPLEMENTATION_GAPS.md`](../../project-mindmap/quality/IMPLEMENTATION_GAPS.md) | IN_PROGRESS | Built in the code-improvement thread, not yet on GitHub | That thread opens its PR |
| T-010 | Make the remaining ephemeral beta modules durable or label them | P1 | issue #48; [ephemeral list](../../project-mindmap/catalog/TEST_TRACEABILITY.md) | PLANNED | 184 ephemeral endpoints at `9b3032f` | Pick modules in beta scope first; one PR per module |
| T-011 | Assert failure branches by message or code in tests | P3 | [failure branches](../../project-mindmap/catalog/TEST_TRACEABILITY.md) | DISCOVERED | 6 of 368 branches matched by message text | Add assertions per module when it is next changed |
| T-012 | Decide the 105 registry features with no code or test: build, defer or retire | P2 | [list](../../project-mindmap/catalog/FEATURE_CATALOG.md) | REQUIRES_APPROVAL | Catalog "Documented features not found in code" | Owner triage; some may exist under another name ([reconciliation](../../project-mindmap/quality/DOC_CODE_RECONCILIATION.md)) |
| T-013 | Real interview executor, scoring trust rules, token storage | P1 | issue #49 | REQUIRES_APPROVAL | Owner decision | Owner approves the architecture |
| T-014 | Free-only launch versus payment provider and entitlement policy | P1 | issue #50, [`PRICING.md`](../PRICING.md) | REQUIRES_APPROVAL | Stripe is wired behind `BILLING_MODE=stripe` (default disabled) | Owner decision; payment changes need explicit approval |
| T-015 | Resolve documentation conflicts C-8 and C-22 | P2 | [GOVERNANCE.md](GOVERNANCE.md#documentation-conflicts-open-2026-10-21) | REQUIRES_APPROVAL | Both change approved product rules | Owner decision |
| T-016 | Feature catalog to nano level and graph views | P3 | this file, `project-mindmap/catalog/` | IMPLEMENTED | PR #94 merged 2026-11-25; graph validation passes | None |
| T-017 | Third documentation consolidation round: merge agent working files, map the canonical set | P3 | [`reports/DOC_DEDUP_2026-11-25.md` §10](../reports/DOC_DEDUP_2026-11-25.md#10-third-round-inventory-and-consolidation) | IMPLEMENTED | PR #95 merged 2026-11-25; 429 to 313 doc files, 0 broken links | None. Further merges need owner calls: see §10.7 of that report |

## Documentation work completed

| PR | Merged | What |
| --- | --- | --- |
| #89 | 2026-11-25 | Execution-backed project mind map, stable ID ledger, docs-vs-code reconciliation |
| #90 | 2026-11-25 | About 580 documentation files consolidated into about 150 Markdown files under `docs/` |
| #91 | 2026-11-25 | Paragraph-level duplicate scan, doc-to-code sync, mind map refresh |
| #94 | 2026-11-25 | Feature catalog to nano level, graph views, this tracker |
| #95 | 2026-11-25 | `.agents/teamwork/` merged into `docs/history/`, canonical-set map in `INDEX.md`, per-file inventory |

## How to resume

1. Check the open issues and pull requests on GitHub; update any row here whose state changed.
2. If code changed since the commit above, regenerate the map and catalog ([`project-mindmap/README.md`](../../project-mindmap/README.md)) and copy the new gap counts into the baseline.
3. Take the highest-priority row that is not waiting on the owner. Rows marked `REQUIRES_APPROVAL` wait for the owner; do not start them on assumption.

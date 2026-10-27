# Migration Matrix (working record for deletion gates)

Temporary: source document to canonical destination, as reported by the four drafting agents. Not independently verified yet. A source with Partial or Unresolved rows is NOT deletable.

## Agent 1
# Migration matrix rows - agent 1 (Requirements and Knowledge Preservation)

Destinations: 01 = docs/final-project-documentation/01-PRODUCT-REQUIREMENTS.md, 08 = docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md. Other numbered files are owned by other agents. Read depth is stated per row; "not read" areas are Unresolved by definition. No source file was edited, moved or deleted.

| Original path | Destination (file#section) | Information preserved | Gaps / unique items NOT migrated and why |
|---|---|---|---|
| SSOT.md (lines 1-4620 structure; 1-330, 326-385, 560-615, 617-707, 1895-1980 greps, 2372 BR headings, 3591-4620, 5655-5675 read) | 01#1-#8; 08#2.3,#4.1-#4.3,#5 | Partial. Founder amendments A-H, vision, flywheels, metrics, 12 principles, 15 invariants, scope/non-goals/gates, two-tier roles, personas, lifecycles, boundary principles, permission-matrix pointer, 173 register structure, S-01..S-14, F-01 contract + ACs, per-feature ACs (via grep), NFRs (security, privacy, AI safety, a11y, perf, DR, go-live gates PROD-001..024, MVP/institutional exits), phases Ph0-10, OD-01..53, GAP summary, DOR names, D-01..D-05, 42.1 register inventory, change classes C1-C7, glossary pointer, Appendix A/B/C, research basis | NOT read / not migrated: SSOT 9/13/14/15 feature bodies (except F-01 and AC greps) - owned by 04; WF-01..66, WIT, 53 state machines (lines 1985-2770) - 04; 11 UX and Appendix D 100 micro-patterns (4621-5650) - 04/UX owner; 12-14 architecture, data, API/event/media/queue contracts, 24.1 schema (2776-3590) - 02/05; full text of HDN-001..032 (only list in 06). The permission matrix is summarised not copied (4.1 rows). Interpretation: SSOT stays untouched as canonical source |
| docs/product/PRD.md | 01#1,#1.1,#1.2,#1.4,#3.2,#4.1,#6.1,#6.5 | Complete | Nothing unique dropped; PRD 11 (feature portfolio pointer) replaced by 01#6.3 |
| docs/INDEX.md | 08#4.2 (authority order restated in 01#0.2); other index rows left to the doc-set owner | Partial | Navigation tables are superseded by the new set; conventions, 2026-10-21/23 pointer-replacement notes not migrated (history of docs hygiene, not requirement) |
| docs/registries/BUSINESS_RULE_REGISTRY.md | 01#5 (family summary, parameters, hygiene issues); full text stays in the registry | Partial by design: summarised by theme with key numbers; recommended to keep the file as the single rule home | Individual BR sentences (248 + 8 MIG) not copied (one-topic-one-home; link provided). Per-rule implementation status Unknown (X-00 not done) |
| docs/registries/FEATURE_REGISTRY.md (head + parsed IDs/names F-45..F-105 read; table F-106+ read via FEATURE_STATUS) | 01#6.3 (status ledger by ID), #6.4; names left to 04 | Partial | Per-feature category/priority/phase/dependency columns not copied (inventory lives in registry/SSOT 7, K-17); 04 should own per-feature rows |
| docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md | 01#5 (pointer targets), 08#5 K-09 | Complete | Pointer document; no unique content |
| docs/governance/GOVERNANCE.md | 01#8 (change classes, status vocabulary), 01#7 Documentation row | Complete | - |
| docs/governance/IMPLEMENTATION_PLAN.md | 08#2.3 (founder execution order, exit gates, first 20 epics) | Complete | Epic list kept as one line in 2.3 summary only |
| docs/governance/GAP_ANALYSIS.md | 08#4.1-#4.3, #5 (K-xx from C-1..C-21 conflicts), #4.4 | Complete for conflicts C-1..C-21 (re-keyed K-01..K-32; C-7, C-10..C-12, C-16 minor items folded into 08#3 debt) | Resolved-gap table (15 rows) not copied: all are SSOT amendments already in 08#4.1 |
| docs/governance/SOURCE_RECONCILIATION.md | 08#5 K-01 (greenfield claim is historical) | Partial | Greenfield forensic baseline (2026-09-24) and document map are history; dropped as obsolete |
| docs/reports/FEATURE_STATUS_2026-10-21.md (sections A-F fully; historical part lines 386-649 read) | 01#0.3,#6.3,#6.2; 08#2.1,#2.2 | Partial: counts, ID lists by status, defects D-01..D-10, owner decisions O-01..O-03, GitHub #44-#50 reconciliation, flow-trace conclusions, requirement-traceability discrepancies | Per-feature rows (expected/actual/next action, 173 rows) and command ledger details stay in the dated report (retain) or 04/07; flow-trace table not copied |
| docs/reports/FEATURE_PLAN_2026-10-21.md (G-L read; feature-level coverage lines 174-351 and historical plan 351-579 not read) | 08#2.3 (X-xx, S0-S6), #4.4, 01#6.1 (scope options), 01#8 (Definition of Ready/Done not copied) | Partial | X-00..X-11 acceptance text, Ready stories (X-05a, X-06a, X-07a, BL-F-32a, BL-F-07a), dependency graph, DoR/DoD and quality-gate table not migrated (belong to 07/03). Feature-level backlog (BL-F-xx rows) Unresolved - not read |
| docs/reports/RELEASE_SCOPE_AND_BACKLOG.md | 01#6.1; 08#2.3,#2.4 | Complete for scope boundary table, BL-001..BL-018, Stages A-F, with 2026-10-26 status | Given/When/Then acceptance bodies and verifying-test commands per BL not copied (stale, partly contradicted by code, e.g. Resend, 410 GONE) |
| docs/reports/AUDIT_MASTER_REPORT.md (sections 1-6 read) | 08#2.1 (SEC-01..06, OPS-01/02), 08#5 K-01, 01#0.3 | Partial | Command/diagnostic table and PR spine (#40-#58) not migrated (07/history) |
| docs/reports/FEATURE_TRACEABILITY_MATRIX.md (sections 1, 2, 4 read; 173-row table not read) | 08#5 K-01, K-30; 01#0.3 | Partial | 173-row matrix not read - Unresolved; durable/ephemeral route counts (54/217/3) cited only |
| docs/reports/ARCHITECTURE_DURABILITY_REPORT.md (section 7 read) | 08#2.1 (SEC/OPS register) | Partial | Sections 2-6 (persistence, work-history proof, auth, AI governance, integrations) not read - owned by 02/06 |
| docs/reports/GIT_RECONCILIATION_REPORT.md (headings only) | 08#1 (issues #44-#50 summary via other reports) | Unresolved | Not read in detail; PR lineage #40-#58 left to history |
| docs/reports/E2E_AUDIT_2026-10-21.md | 08#2.1 (open defects M-1, B03b, C26, H03, F13, N02b), 01#6.2 | Complete for open defects | Fixed-defect table, suites A-R, security-held list belong to 07 |
| docs/reports/FINAL_VALIDATION_REPORT.md | 08#5 K-08 (thresholds), K-01; 01#7 | Complete | Dated metrics (1,072 tests, 205 Playwright) only as conflict evidence |
| docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md (A, B.1, C, D, E, H, I, J read; F, G not read) | 08#3 (debt), #4.4 (owner decisions 1-9), #6 | Partial | Findings 1-37 table, implemented increments (F), validation evidence (G) not migrated - history/07 |
| docs/reports/MAINTENANCE_AUDIT_2026-10-21.md (headings; R1-R4 requirements read) | 01#8 (dev-tooling requirement row) | Partial | Tool design, cleanup inventory, bash guide, archived request details belong to 03; not read in full |
| docs/reports/PAYMENT_AUDIT_2026-10-23.md | 01#9; 08#2.1 (billing items) | Complete | Fixed items P-1..P-6 are historical code facts (04/05) |
| docs/reports/PRODUCTION_AUDIT_2026-10-03.md (head, journey D/E, completeness table, RM list read) | 08#5 K-29, #1 | Partial | P0-01..P0-08 narratives (mostly fixed per IMPROVEMENT B), UX audit, scorecard not migrated; 4.6/10 noted |
| docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md (docs/reports copy sections A-H read; I-O not read) and the root pointer file | 08#2.1, #1, #7; 01#0.3 | Partial | Feature appendix N (historical) not read; verification ledger I and action plan M not migrated. Root file is a one-line pointer (no content) |
| docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md | 08#2.1 (O-1..O-5, refund decision); 01#9 | Complete | Manual Stripe/Supabase configuration list belongs to 06/07 |
| docs/reports/AUDIT_EVIDENCE_2026-10-21.json (structure only, 1.8 MB) | 08#5 K-01 (counts) | Unresolved | Per-feature/BR/route/test evidence records not read - machine ledger, keep in place |
| BRAIN/BRAIN.md | 01#1 (mental model), #4.1 (heuristics, mistakes) | Complete | - |
| BRAIN/MEMORY.md | 08#1,#2.4,#5 (K-01, K-04); 01#0.3 | Partial | Milestone M6 (target 2026-11-15), PR lineage, issue reconciliation dated 2026-10-22: stale, kept only as conflict evidence |
| docs/PRICING.md | 01#9 (link; decisions only), 08#5 K-12 | Partial by design | Plan table, prices, Stripe price ids deliberately NOT copied (unit test reads file at runtime) |
| docs/engineering/TRD.md | 01#7 (NFR), #8 (constraints), 08#5 K-03 | Complete | Technical baseline table (target stack) left to 02 |
| docs/engineering/adr/ADR-015-core-loop-persistence.md | 08#4.2, #7; 01#8 | Complete | Verification test file list belongs to 07 |
| docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md | 08#4.2 | Complete | Option table not copied |
| docs/engineering/TARGET_ARCHITECTURE.md (first ~140 lines read) | 08#6 | Partial | Domain list, import rules, async/realtime sections belong to 02 |
| docs/experience/JOURNEY_REGISTRY.md | 01#6.5 | Complete for J-01..J-28 terminals | Mermaid diagrams for J-02, J-26 left to 04 |
| docs/system-model/03-conflict-register.md (first ~60 lines read) | 08#2.1 (CF-xx), 08#5 K-14, K-24, K-25 | Partial | Resolved CF-01..07 and decision records not migrated; rest of file Unresolved |
| docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md (first 40 lines) | 08#2.1 (R2-02), #7 | Partial | Static audit commands and release prerequisites belong to 05/07 |
| ARCHITECTURE.md | 01#8, 08#4.2 (built ADR register), 08#6 | Partial (owned by 02) | Whole file belongs to 02; only decision register, invariant pointers, risk IDs used here |
| AGENTS.md (first 140 lines) | 01#8 (build-file rule, escalation) | Partial (owned by 03) | Reticle block not migrated (tooling, 03) |
| Yash_Final_Project_Document/README.md and 00_CONTROL_CENTRE/PROJECT_SCOPE.md, ASSUMPTIONS.md, CANONICAL_INVARIANTS.md | 01#4.2, 08#6 | Complete for these four | Other 00_CONTROL_CENTRE files (MASTER_INDEX*, ID_REGISTRY, EXECUTION_LEDGER*, KNOWLEDGE_PRESERVATION_MANIFEST*, DOCUMENT_STATUS, GLOSSARY, CONSENT_SCOPE_CATALOGUE, CLEANUP_CANDIDATES, SOURCE_DOCUMENT_INVENTORY, INFORMATION_RECONCILIATION_MATRIX, PROTECTED_DOCUMENT_TREE_BASELINE.csv) not read - Unresolved |
| Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md, PRODUCT_VISION_AND_BUSINESS_MODEL.md#record-product-vision-goals-rev2 | 01#1.2,#1.5,#3.2 | Complete | - |
| Yash_Final_Project_Document/02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md, STAKEHOLDERS_ROLES_PERMISSIONS.md#record-permission-matrix-rev2 | 01#2.1-#2.4 | Partial | Full permission matrix cells (12 resources x 12-17 columns) and access reviews not copied (target, Proposed-only); USER_JOURNEYS.md (38 KB; only index of 20 UJ read) Unresolved |
| Yash_Final_Project_Document/03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md | 08#6 (scope row), 01#3.2 | Partial | Context map, ownership table and family coverage belong to 02 |
| Yash_Final_Project_Document/04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md (head) and CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2 (head) | 08#6 (counts), K-06 | Partial | 108 CAP / 253 FEAT rows not read; phase crosswalk tables not migrated (Proposed-only) |
| Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP.md (sections 1-4, 7-8, WP names) and ROADMAP.md#record-roadmap-rev2 (head) | 08#2.3, #6 | Partial | Per-WP tables (scope, tests, DoD+) and dependency graph not migrated - Proposed-only; WP-level detail stays in the blueprint |
| Yash_Final_Project_Document/23_MIGRATION_AND_EVOLUTION/MIGRATION_AND_EVOLUTION_PLAN.md (first ~6 KB) | 08#7 | Partial | Strangler stages, routing facade detail read only to S6; REFERENCE_TO_TARGET_DATA_MIGRATION.md not read - Unresolved |
| Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/ADR_REGISTER.md, OPEN_DECISIONS.md, RISK_REGISTER.md, RISK_REGISTER.md#record-risk-register-rev2 (head) | 08#4.2,#5,#6 | Partial | OPEN-01..52 summarised, not copied row by row (register stays in blueprint); RISK-01..56 only P1 items named; ADR_REGISTER.md#record-governance-registrations-rev2 not read |
| Yash_Final_Project_Document/27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md (head ~7 KB), SECOND_REVIEW_REPORT.md (head ~6 KB), REVIEW_RESOLUTION_DECISIONS.md, REVIEW_FIX_STATUS.md | 08#6 | Partial | Individual REVW-01..46 / REVW2 findings beyond totals and the structural issues not migrated; SCENARIO_SIMULATIONS.md not read |
| Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md | 08#5 (K-26, K-27, K-28, K-22), 08#6 | Complete for its conflict list | Other 28_* files (crosswalks, CSVs, COVERAGE_MATRICES, AC_TEST matrix) not read |
| Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/{PROJECT_MASTER_BLUEPRINT,FINAL_ARCHITECTURE_SUMMARY,FINAL_DOMAIN_COVERAGE,IMPLEMENTATION_READINESS}.md | 08#6; 01#1,#3 | Complete | - |
| Yash_Final_Project_Document folders 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 29 | none | Unresolved: not read | Target design detail (specs, rules BR-T, state machines, UX, PWA, federation, backend, data, API, security, SRE, QA, DevOps, ops, commercial, analytics, FinOps, diagrams, research, developer guide). Out of requested priority list; treated as Proposed-only; recommend the doc-set owner decides retention |
| Other repo files read for verification only: supabase/migrations (listing), apps/api/src/server.ts, packages/domain/src/{core,assessment,jobs}.ts, apps/worker/src/{claim,email/config}.ts, packages/config/src/env.ts, deploy/oracle/Caddyfile, package.json (line 17), .prettierignore, git log | 08#2.1 status checks | n/a | Spot checks only (graphify query run first; graph is stale for email/worker, grep used for exact lines) |

## Conflicts found (also in 08#5): K-01 maturity/test/migration counts; K-02 four GA scopes; K-03 intended vs built stack; K-04 Resend vs Brevo; K-05 roles 3+24 vs 10 vs scoped grants; K-06 five phase vocabularies; K-07 erasure 30-day vs immediate; K-08 k thresholds; K-09 BR ID semantics; K-10 ADR registers; K-11 ADR-015 ratification; K-12 pricing/premium/refund; K-13..K-32 as listed in 08.

## Agent 2
# Migration matrix, agent 2 (Project Architecture and Technical Truth)

Destinations: `docs/final-project-documentation/02-ARCHITECTURE.md` (02) and `docs/final-project-documentation/05-DATABASE-AND-API.md` (05). Nothing existing was edited, moved or deleted. Status: Complete = everything of lasting value is in the destination (or intentionally replaced by code-derived content); Partial = named gaps remain; Unresolved = sources conflict and the repository cannot settle it.

Read depth is stated per row. "Scanned" = searched with patterns only. Where a row says "code wins", the destination records the current code, not the document.

| Original path | Destination | Preserved | Gaps not migrated and why |
| --- | --- | --- | --- |
| `ARCHITECTURE.md` (read in full) | 02 (sections 1-15), 05 (A1, A9) | Partial | Not copied: section 10 extension-points table, section 11 escalation, section 27 agent quick reference (belong in 03/AGENTS.md); section 22 testing and 23 deployment detail (to 07); section 20 security narrative (to 06); full ADR text (to 08). Claims in sections 18, R-4, components table were stale against code and were replaced by code facts; see 02 section 15. |
| `docs/engineering/DATABASE.md` (read in full) | 05 (A1-A11) | Partial | Per-migration created-table inventory not copied (re-derived and regrouped by domain; the file stays as the per-migration index). Hosted-Supabase operational flow left to 03 section 7 and 07. Erasure/privacy narrative summarized; policy detail belongs to 06. Hosted applied range (00054 vs 00055) is a source conflict, recorded as Unknown. |
| `docs/engineering/API_CONTRACTS.md` (lines 1-135 and 340-406 read; middle rows compared programmatically with a code parse, not read as prose) | 05 (B1-B9) | Partial | Route index regenerated from code (278 pairs, auth tier, durability, request schema); anchors (`S:743`) dropped as stale. "Representative requests" table and billing retry semantics not copied (feature behavior to 04, Stripe detail to 06). |
| `docs/engineering/TRD.md` (read in full) | 02 (section 15 item 8, section 16), 05 (B10) | Partial | Used only to label target-baseline items Proposed-only. Non-functional requirements (accessibility, reliability, performance, offline, release gates) are not architecture facts; they belong to 01/07/08. |
| `docs/engineering/TARGET_ARCHITECTURE.md` (read in full) | 02 (section 13 namespace warning, section 16) | Partial | Bounded-context table, import rules for the target repo layout, target Mermaid diagrams (system context, auth flow, AI safety flow) and its ADR-001..013 list not copied; the ADR list is a different register and goes to 08. |
| `docs/engineering/adr/ADR-015-core-loop-persistence.md` (read in full) | 02 (section 13, R1), 05 (A8, A9) | Complete | Verification test list left to 07. Ratification still pending (recorded). |
| `docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md` (read in full) | 02 (section 13 one row) | Partial | Option analysis and findings belong to 07/08. |
| `docs/system-model/00-index.md` (read) | none (navigation only) | Complete | Nothing of technical content. |
| `docs/system-model/01-inventory-and-coverage.md` (lines 35-155 read: feature status, domain-module map, algorithms) | 02 (section 4 domain grouping, section 15) | Partial | File-by-file classification (lines 181-389), validation section, repo-size and API-surface paragraphs not read. Per-module symbol/test table not copied (stays in the source file). Feature status rows go to 04. |
| `docs/system-model/02-flows.md` (lines 1-60 and 154-245 read: F1, F2 head, F5, F6, F7) | 02 (sections 6-8), 05 (B5) | Partial | F2 tail, F3 (jobs), F4 (work history) flows not read; they belong to 04. F1 contains stale facts ("Resend", "53 migrations"); recorded in 02 section 15. Mermaid diagrams were re-derived from code, not copied. |
| `docs/system-model/03-conflict-register.md` (read in full) | 02 (R3, R4, R6, R9, R10, section 15), 05 (B9) | Partial | Findings referenced by CF id; authorization and product-decision findings (CF-10..CF-45) are not restated here and belong to 06/08. Resolved items CF-01..CF-07 not migrated (history). |
| `docs/system-model/04-conditions.md`, `05-audit.md` | none | Unresolved | Not read (05-audit only its headings were seen). The hosted-state conflict cited in 03 as coming from 05-audit could not be checked. |
| `docs/system-model/06-route-authorization.md` (read in full) | 05 (B2, B6) | Partial | Per-group role/ownership tables and CF-31..CF-45 not reproduced (06 owns authorization). Persistent/ephemeral column used to cross-check `durability.ts`. |
| `docs/final-project-documentation/03-DEVELOPMENT-GUIDE.md` (header and section 7 read; written by another agent) | linked from 02 and 05 | Complete | Not edited; used to avoid duplicating setup and migration commands. Its claim about the hosted state conflict was carried into 05 A11 #1. |
| `apps/api/src/server.ts` (13,416 lines: imports, bootstrap, hooks, error handler, session resolution, health, persist, hydration, all route registrations via parser, ~12 handlers sampled) | 02 (3-12), 05 (A1, A9, B1-B8) | Partial | Handler bodies for ~260 routes not read; authorization rules per route not enumerated (06). Auth column in 05 B8 is a first-level heuristic from handler text. |
| `apps/api/src/index.ts` (read in full) | 02 (section 11) | Complete | |
| `apps/api/src/durability.ts` (read in full) | 02 (section 6, R2), 05 (A8, B6) | Complete | |
| `apps/api/src/billing-stripe.ts` (lines 1-120 and 300-333 read) | 02 (section 7), 05 (B5, B8) | Partial | Remainder (subscription reconciliation, invoices, refunds, portal) not read; Stripe behavior detail belongs to 06. |
| `apps/api/src/stripe-gateway.ts` | none | Unresolved | Not read; only its role (the only Stripe SDK boundary) is taken from `ARCHITECTURE.md`. |
| `apps/api/src/storage/index.ts` (read in full) | 02 (sections 4, 6), 05 (A1, A4) | Complete | |
| `apps/api/src/storage/core-store.ts` (lines 100-260 and 750-830 read; rest scanned) | 05 (A4, A5, A9) | Partial | Individual `writeOp` SQL per entity and `load()` mapping not read. |
| `apps/api/src/storage/{account,erasure,billing,saved-search,saved-job,admin-audit,feature-flag}-store.ts` | 05 (A4) | Partial | Scanned for SQL verbs and table names only; transaction details inferred from those scans. |
| `apps/worker/src/index.ts`, `apps/worker/src/claim.ts` (read in full) | 02 (section 8), 05 (A4, A9) | Complete | |
| `apps/worker/src/email/config.ts` (read in full); `service.ts`, `types.ts`, `brevo.ts`, `templates.ts`; `apps/worker/src/queue.ts` | 02 (sections 4, 8) | Partial | Last five not read (listed and grepped only); email adapter and templates belong to 06. `queue.ts` unused-at-runtime claim confirmed by search. |
| `packages/config/src/env.ts` (read in full) | 02 (section 11), 05 (B1) | Complete | Variable-by-variable reference is owned by 03. |
| `packages/observability/src/*` (read in full) | 02 (section 10) | Complete | |
| `packages/domain/src/index.ts`, `core.ts` (lines 1-60, 135-161), `auth.ts` (selected), `background-jobs.ts` (lines 115-205, 395-528) | 02 (sections 4, 8, 12), 05 (A9, B2, B3) | Partial | About 45 other domain modules not read; described from the index barrel and the inventory in system-model 01. |
| `packages/contracts/src/index.ts` (1,782 lines: structure, error envelope, pagination, billing and idempotency schemas, grep counts) | 05 (B1, B4) | Partial | The ~140 schemas are not individually documented. |
| `apps/web/src/App.tsx` (route grep), `apps/web/src/lib/api.ts` (lines 1-140), `apps/web/src/lib/session.ts` (grep), `apps/web/src/pwa.ts` (grep), `apps/web/vite.config.ts` | 02 (sections 2-4, 9, R5, R15) | Partial | Pages, components and hooks not read; frontend feature behavior belongs to 04. |
| `supabase/migrations/00001_core_schema.sql`, `00014`, `00041`, `00042`, `00043` to `00055` (read in full) | 05 (A1-A7) | Complete | |
| `supabase/migrations/00002`-`00013`, `00015`-`00040` (structure counted by script: tables, RLS, policies, constraints; not read line by line) | 05 (A2, A5, A6) | Partial | Column definitions and policy bodies for 112-24 unused or long-tail tables are not documented; the SQL is the source. |
| `scripts/migrate.mjs`, `scripts/lib/pg.mjs`, `scripts/lib/migration-integrity.mjs` (read in full); `scripts/seed.mjs` (head); `scripts/check-new-hosted-migrations.mjs` (read in full and executed read-only) | 05 (A7, A11 #9) | Complete | Other scripts (`release-preflight`, `hosted-supabase-preflight`, audit script) not read; owned by 03/07. |
| `supabase/hosted/README.md` (head), `supabase/hosted/02_data_api_lockdown.sql` (head), `supabase/seed/01_initial_seed.sql` | 05 (A6, A7, A11) | Partial | `01_org_aliases.sql` not read. Applied hosted state is not verifiable from the repository. |
| `.github/workflows/hosted-supabase-audit.yml` (head), `ci.yml` (grep), `pnpm-workspace.yaml`, `apps/api/package.json`, `packages/domain/package.json` (partial) | 02, 05 (A11 #9) | Partial | CI jobs are owned by 07. |
| `tests/unit/persistence-honesty.test.ts`, `tests/unit/database-migrations.test.ts` (test names grepped), `tests/` directory listing | 05 (A8) | Partial | Tests not run; no claim of passing. |
| `Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md` (lines 1-230 read; headings of the rest) | 02 (section 16), 05 (A12, B10) | Partial | Sections 8-22 (idempotency original, concurrency, search port, files, AI gateway, sandbox runner, media, secrets, extraction triggers, failure policy, contradictions) not read; superseded in part by REV2. Proposed-only. |
| `.../11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2` (read in full), `INDEX.md` | 02 (section 16), 05 (A12, B10) | Partial | Summarized only; REV2 is Proposed (Under Review) with open governance actions. |
| `.../12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md#record-physical-design-rev2` (read in full), `INDEX.md` | 05 (A12) | Partial | DDL details, write budget table not copied (illustrative, unmeasured). |
| `.../12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md` (lines 95-125 and 159-185 read; headings of the rest) | 05 (A12) | Partial | Keys, index design, partitioning, isolation per operation, JSONB policy, extensions, connection management not read. |
| `.../12_DATA_AND_DATABASE/CONCEPTUAL_AND_LOGICAL_MODEL.md` (3,321 lines: lines 1-30 and entity-id count only) | 05 (A12) | Unresolved | The ~126-entity target model was not read; only conventions and RLS classes. |
| `.../12_DATA_AND_DATABASE/MIGRATION_POLICY.md` (lines 1-80 read) | 05 (A12) | Partial | Sections 5-9 (rollback table beyond a few rows, CI, tooling, runbooks) not read. |
| `.../12_DATA_AND_DATABASE/DATA_GOVERNANCE_AND_LIFECYCLE.md` | none | Unresolved | Not read; erasure/retention target design belongs to 06. |
| `.../13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md` (lines 1-60 read), `API_CATALOG.md` (lines 1-30), `EVENT_CATALOG.md` (lines 1-40), `INTEGRATION_ARCHITECTURE.md` (lines 1-30), `OBSERVED_REFERENCE_API_INVENTORY.md`, `OBSERVED_ROUTE_TARGET_CROSSWALK.csv` (head) | 05 (B10), 02 (section 16) | Partial | Catalog rows, per-route policy actions, event rows, rest of the standards and integration matrix not read. |
| `.../13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md#record-api-catalog-addendum`, `ACTION_TO_OPERATION_MAP.md`, `contracts/openapi.yaml`, `openapi.addendum.yaml`, `asyncapi.yaml`, `contracts/schemas/*`, SSOT crosswalks | none | Unresolved | Not read (about 27,000 lines of YAML). Only their existence and the counts quoted by `API_CATALOG.md` (230 endpoints, 74 events) are used. |
| `.../10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE.md` (lines 1-60 read, headings of the rest), `FRONTEND_ARCHITECTURE.md#record-frontend-architecture-rev2` (headings only) | 02 (section 16) | Partial | Server state, client state, error handling, telemetry, security, flags, budgets, build pipeline not read; frontend design belongs to 04/08. |
| `.../25_DIAGRAM_LIBRARY/SYSTEM_DIAGRAMS.md` (headings only) | none | Unresolved | Not read; 02 uses its own diagrams derived from code. |
| `.../24_RISKS_AND_DECISIONS/ADR_REGISTER.md` (read, long cells truncated), `.../23_MIGRATION_AND_EVOLUTION/REFERENCE_TO_TARGET_DATA_MIGRATION.md` (lines 1-40), `.../27_INDEPENDENT_REVIEWS/REVIEW_FIX_STATUS.md` (lines 1-40) | 02 (section 16), 05 (A12) | Partial | Context for the Proposed-only labels and open review findings. Decision register content belongs to 08. Other files in folders 23, 24, 27 not read. |

## Sources not read at all

`SSOT.md` (including Part VII table clusters), `docs/INDEX.md`, `docs/engineering/{CODE_STYLE,HOSTED_SUPABASE_MIGRATION_GATE,PROJECT_MAINTENANCE}.md`, `docs/quality/*`, `docs/registries/*`, `docs/reports/*`, `graphify-out/GRAPH_REPORT.md`. Reason: outside this agent's scope (other canonical files) or not needed to decide what the code does. One `graphify query` was run at the start to locate files (it reported a truncated 842-node subgraph).

## Discrepancies recorded in the destinations

See 02 section 15 (nine items) and 05 sections A11 (nine items) and B9 (eight items). Highest value: worker claims are fenced and batch size is 1 (document says otherwise); AI quota now follows plan entitlements (document says hardcoded free); guard script `check-new-hosted-migrations.mjs` exits 1 on migration 00054; `PaginationQuerySchema` is used by no route; hosted applied range conflicts across three documents.

## Agent 3
# matrix_3 - Development / Operations agent (docs 03 and 07)

Destinations: `03` = docs/final-project-documentation/03-DEVELOPMENT-GUIDE.md, `07` = docs/final-project-documentation/07-TESTING-AND-OPERATIONS.md.
Nothing was moved, edited or deleted. "Preserved" = content carried into the destination. Originals remain in place.

| Original path | Destination | Preserved | Gaps not migrated and why |
| --- | --- | --- | --- |
| README.md | 03 sec 1, 3, 5, 8; 07 sec 2 | Node 24 / pnpm 11.7.0, setup steps, port 5173/4000, memory-mode caveat, pnpm.cmd note, single-writer rule, root test scripts | Product status prose ("What exists") left to docs 01/02; links to other docs not copied |
| AGENTS.md | 03 sec 2, 9.3 | Protected-file list, indirect-write rule, record-status-before/after rule, golden workflow, escalation list, completion report fields, Reticle block summary | Full Reticle managed block not repeated (see RETICLE.md); "Never" list shortened to dev-relevant items |
| CLAUDE.md (repo) | 03 sec 2, 9.1, 9.4, 9.5; 07 sec 0 | Commands list, rules, style, Reticle verify/skip rules, no-commit rule, graphify rule | Reticle setup recovery ladder and feedback procedure not copied (reference only) |
| CLAUDE.md (C:\Users\yashs, ~/.claude) | 03 sec 9.3 | graphify query-before-grep, graphify update rule | Personal global instructions; only the repo-relevant rule carried |
| GEMINI.md | 03 sec 2 | Points to AGENTS.md rule | 3-line file; nothing else to migrate |
| RETICLE.md | 03 sec 9.4 | Verdict honesty rules, skip conditions | Missing-tools, version_skew, update_available, empty-state and feedback procedures not migrated (tool-operation detail, stays in RETICLE.md) |
| package.json (root) | 03 sec 1, 5, 6; 07 sec 2 | All script names and commands, packageManager | Dev-dependency versions not listed (lockfile is authority) |
| apps/*/package.json, packages/*/package.json | 03 sec 1, 5, 6 | Package names and build/dev scripts | Dependency lists not migrated |
| pnpm-workspace.yaml | 03 sec 1 | Workspace globs, esbuild build allowance | - |
| tsconfig.json, tests/tsconfig.json | 03 sec 6 | Compiler flags, project references, noEmit test config | Per-project tsconfig files not read |
| vitest.config.ts, vitest.pg.config.ts | 07 sec 2 | Include globs, env pins, timeouts, no file parallelism | - |
| playwright.config.ts | 07 sec 2 | Workers, retries, timeout, base URL, webServer commands | - |
| apps/web/vite.config.ts | 03 sec 5, 9.4 | Port 5173, /api proxy, Reticle plugin presence | Build options not detailed |
| .prettierrc | 03 sec 6 | Formatting settings | .prettierignore not read |
| .env.example | 03 sec 3, 4 | All variable names, purposes, required/optional (names only, no values) | Comment prose on Stripe webhook events summarized, not copied |
| .env, .env.local | none | None | Deliberately NOT read (secrets rule) |
| test-secrets.mjs | 03 sec 4.7 | Variable names only (TEST_TOKEN_SECRET, TEST_WEBHOOK_SECRET), fact they are public and refused when deployed | Values deliberately omitted |
| packages/config/src/env.ts | 03 sec 4; 07 sec 4 | Full variable schema, defaults, deployed-environment refusals, schema-only variables | Code not copied; zod regexes summarized |
| apps/api/src/index.ts, apps/worker/src/index.ts, apps/worker/src/email/config.ts | 03 sec 3, 4, 10; 07 sec 6, 9 | .env load order, boot refusal, worker env reads, email config rules | Handler logic left to doc 02 |
| apps/api/src/durability.ts | 03 sec 11 | DURABLE_ROUTES / ephemeral header mechanism | Route list not copied |
| packages/observability/src/logger.ts, audit.ts | 07 sec 7 | Redaction list, in-memory audit sink fact | - |
| apps/api/src/server.ts (health, x-request-id, helmet lines only) | 07 sec 6, 7 | Health endpoints, request-id, helmet | Rest of 12k-line file not read (doc 02/04 scope) |
| scripts/migrate.mjs, scripts/lib/pg.mjs, scripts/lib/migration-integrity.mjs (head) | 03 sec 7; 07 sec 3 | Runner behavior, hosted-endpoint refusal, ledger and checksum, idempotency | migration-integrity.mjs body and scripts/tests/migration-integrity.test.mjs not read; only CI invocation documented |
| scripts/seed.mjs | 03 sec 5 | Behavior and write-on-missing-file caveat | - |
| scripts/release-preflight.mjs | 07 sec 3, 6 | Three modes, checks, exit code, read-only | - |
| scripts/check-client-secrets.mjs | 07 sec 3 | Sentinel names, purpose | - |
| scripts/check-new-hosted-migrations.mjs, scripts/hosted-supabase-preflight.mjs | 03 sec 7; 07 sec 3, 6 | Purpose and usage | scripts/audit-hosted-supabase-migrations.mjs body not read; only its CI contract (exit 1, thresholds) documented |
| scripts/start-e2e-api.mjs | 07 sec 2 | E2E API configuration facts | - |
| scripts/generate-icons.js | 03 sec 2 (protected list) | Existence only | Not read beyond header |
| .github/workflows/ci.yml | 07 sec 3 | Every step, order, env sentinels, artifacts | - |
| .github/workflows/oracle-staging.yml, hosted-supabase-audit.yml | 07 sec 3 | Triggers and gate logic | - |
| deploy/oracle/README.md | 07 sec 4, 5.2, 5.4, 10 | Host prep, deploy commands, limitations, readiness checks | - |
| deploy/oracle/compose.yaml, compose.supabase.yaml, Dockerfile, Caddyfile, .env.example | 07 sec 5.1, 5.5; 03 sec 4.7 | Topology, networks, targets, variables, defects found (RESEND_API_KEY, missing healthchecks) | .env.example values omitted; project ref string not reproduced |
| deploy/oracle/NEW_SUPABASE_PROJECT.md | 07 sec 5.2, 10 | Release gates, stop notice, issue mapping | Detailed prose compressed |
| deploy/oracle/RECOVERY.md, backup.sh, verify-restore.sh | 07 sec 8 | Backup and restore-check behavior and limits | - |
| deploy/coolify/compose.yaml, Caddyfile | 07 sec 5.1, 5.3 | Coolify variant differences, TRUST_PROXY=2, healthchecks | - |
| deploy/oracle/.omc/** | none | None | Agent-tool state files, not project documentation |
| supabase/hosted/README.md | 03 sec 7 | Hosted manual sequence, applied-state claim and caveats | SQL files 01/02 not read |
| supabase/migrations/ (listing only) | 03 sec 7 | Count 55, naming, next number 00056 | SQL content out of scope (doc 05) |
| docs/quality/TESTING.md | 07 sec 1, 2, 2.1, 2.2, 3 | Layers, commands, limits, read-only alternatives, CI list (noted stale) | Vision sections 6-8 (assessment/AI/data-integrity test lists) referenced as not-built, not copied |
| docs/quality/OPERATIONS.md | 07 sec 4, 6, 7, 9, 10; 03 sec 4, 5, 10 | Processes, config rules, health, logs, preflight, email/Stripe/erasure operations, local failures | Sections 1-8 target model summarized only as Proposed |
| docs/engineering/CODE_STYLE.md | 03 sec 9.1 | All ten sections condensed | - |
| docs/engineering/PROJECT_MAINTENANCE.md | 03 sec 8 | clean-reinstall behavior, flags, safety limits | Test tier internals not read |
| docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md | 03 sec 7; 07 sec 5.2, 10 | Gate, prerequisites, audit tool | - |
| docs/engineering/DATABASE.md (first 60 lines) | 03 sec 7, 11 | Advisory lock, persist/commit flow, store list pointers | Remainder not read (doc 05 scope) |
| docs/engineering/TRD.md (first 25 lines) | none | None | Target baseline table; belongs to docs 01/02 |
| docs/INDEX.md | 03 sec 0 (authority order) | Authority ordering rule | Link tables not migrated |
| ARCHITECTURE.md (first 140 lines) | 03 sec 5, 11 | Component locations, owners, extension points | Remainder (sections 9+) not read; belongs to doc 02 |
| docs/reports/E2E_AUDIT_2026-10-21.md | 07 sec 2.3, 11 | Counts, method limits, open defects relevant to ops/testing | Defect register details not migrated |
| docs/reports/FEATURE_STATUS_2026-10-21.md (grep only) | 07 sec 2.3 | Test counts, defect probes | 173-feature matrix not read (doc 01/08 scope) |
| docs/reports/PAYMENT_AUDIT_2026-10-23.md, STRIPE_SUPABASE_AUDIT_2026-10-23.md | none | None (previewed only) | Billing history belongs to doc 04/08 |
| docs/reports/MAINTENANCE_AUDIT_2026-10-21.md (head) | 03 sec 1, 8 | Node 24.19.0 local observation, package inventory | Rest is historical/proposed bash tool design (tool absent) |
| docs/reports/ARCHITECTURE_DURABILITY_REPORT, AUDIT_MASTER_REPORT, FINAL_VALIDATION_REPORT, GIT_RECONCILIATION_REPORT, IMPROVEMENT_PROGRAM, PRODUCTION_AUDIT_2026-10-03, RELEASE_SCOPE_AND_BACKLOG, REPOSITORY_AUDIT*, FEATURE_PLAN, FEATURE_TRACEABILITY_MATRIX, AUDIT_EVIDENCE json | none | None | Only grepped for test counts; dated history, not read in full |
| docs/system-model/05-audit.md (first 60 lines) | 07 sec 2.3 | 2026-10-23 command results | Audit tables A-I not migrated (docs 01/08) |
| Yash_Final_Project_Document/29_DEVELOPER_IMPLEMENTATION_GUIDE | 03 sec 12 | Rules and DoD as Proposed | - |
| Yash_Final_Project_Document/16_QA_AND_TESTING (TEST_STRATEGY full; TEST_CATALOG_REV2 head; TEST_CATALOG, ACCEPTANCE_CRITERIA_GUIDE headings only) | 07 sec 1, 2.4, 10 | Risk classes, layers, gates RG-01..14 as Proposed | Full test catalog IDs not migrated (design, unbuilt); AC guide not read in detail |
| Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE (DevOps sec 4, 8, 9; Deployment sec 7-8; Observability sec 6; Frontend delivery headings) | 07 sec 5.6, 7, 8 | Delivery model, migration deployment, backup/DR, alert model as Proposed | Monorepo/CI pipeline per deployable, supply chain, IaC, hosting options, rollback sequencing sections not read in detail |
| Yash_Final_Project_Document/18_OPERATIONS_AND_SUPPORT (Runbook index full; Incident sec 1-3; Processes headings) | 07 sec 9.2 | Severity matrix, lifecycle, relevant runbooks as Proposed | PROC-01..15 bodies, comms templates, RACI not migrated |
| Yash_Final_Project_Document/15_RELIABILITY_AND_PERFORMANCE (SLO sec 4, 8; Capacity head; others headings) | 07 sec 7, 8 | SLO/RPO/RTO placeholders as Proposed | FMEA, capacity formulas, SLO_REV2 not migrated (design) |
| Yash_Final_Project_Document/23_MIGRATION_AND_EVOLUTION (plan sec 1-3 only; data migration note headings) | 03 sec 12 | Strangler plan summary as Proposed | Slice sequencing, rollback, data mapping not migrated |
| clean-reinstall.bat (head), clean-reinstall.ps1 (not read) | 03 sec 8 | Wrapper behavior | PowerShell engine body not read; flags taken from PROJECT_MAINTENANCE.md |
| .claude/launch.json | 03 sec 5; 07 sec 5.5 | Port-3000 discrepancy | - |
| tests/ (listings, tests/helpers/content.ts, tests/pg/test-db.ts, performance.spec.ts head) | 07 sec 2 | Layout, counts, DB-creation requirement, performance guards | Individual test files not read |
| docs/engineering/adr/, docs/governance/*, docs/superpowers/plans | none | None | Not in assigned sources; listed only |

## Agent 4
# Migration matrix 4 - features, workflows, security, integrations

Destinations: `docs/final-project-documentation/04-FEATURES-AND-WORKFLOWS.md` (04) and `docs/final-project-documentation/06-SECURITY-AND-INTEGRATIONS.md` (06). Paths are relative to the repository root. Preserved: Complete = everything this source says on 04/06 topics is carried (restated, corrected, or deliberately linked as the canonical owner); Partial = some of it carried, remainder named; Unresolved = read but not fully reconciled. No source file was edited, moved or deleted.

| Original path | Destination | Preserved | Gaps not migrated and why |
|---|---|---|---|
| apps/api/src/server.ts (read: imports/helpers 100-483, boot/hooks/auth/profile/evidence 484-1650, orgs/jobs 1755-2060, apply/transition 2597-2900, challenges/AI/LMS/certs/messaging 4593-5600, AI chat 5960-6160, activity 9483-9535, gamification/settings/erasure/billing/admin 9832-11140, moderation resolve 11675-11700, work history/references/internal 12385-13040; route list extracted by regex) | 04 sections 2, 3, 5, 7; 06 sections 2-4, 6-11 | Partial | Not read line by line: job templates, salaries (2060-2596), application feedback, skill freshness, interviews (except `/code`), reputation (2900-4593), resumes, networking, referrals, endorsements, career, learning impact, recruiter pools, alumni, portfolio (6160-9483), search, moderation intake, saved searches, drafts, analytics (11140-12385). These appear in 04 as Partial/M with status taken from the route list, `durability.ts`, web-call search and the dated audit; their authorization detail is delegated to docs/system-model/06-route-authorization.md. File is 493 KB; full read out of scope. |
| apps/api/src/durability.ts | 04 section 1, 2, 7 (G-23) | Complete | none |
| apps/api/src/billing-stripe.ts | 06 section 9; 04 section 5.6 | Complete | none |
| apps/api/src/stripe-gateway.ts (event kinds, webhook verify, customer delete grep/excerpt) | 06 section 9 | Partial | Gateway construction details (API version, retries, session parameters) not read; not needed at this level. |
| apps/api/src/index.ts, apps/api/dist/index.js (head) | 06 section 2.1 | Complete | none |
| apps/api/src/storage/index.ts (lease, pool grep), core-store.ts (op kinds grep), account-store.ts (encryption grep) | 06 sections 4, 5, 8; 04 section 2.1 | Partial | SQL of stores not audited for injection or column coverage; stated as "not exhaustively audited". |
| apps/web/src/App.tsx | 04 sections 2, 4 | Complete | none |
| apps/web/src/lib/session.ts, components/Layout.tsx (nav/roles), pwa.ts (grep), public/manifest.webmanifest, pages and components (API-call search only) | 04 sections 2, 4; 06 sections 2, 6 | Partial | Page internals (form validation, copy, accessibility) not read; UI column in 04 is based on which API paths each page calls. `dangerouslySetInnerHTML` audit not done (06 section 7 says Not verified). |
| apps/worker/src/index.ts, claim.ts, email/config.ts, email/service.ts, email/templates.ts, email/brevo.ts (first 60 lines) | 04 section 5.8; 06 section 10 | Complete | Rest of brevo.ts (status mapping) and email/types.ts, queue.ts not read; behaviour restated from comments and ARCHITECTURE.md. |
| packages/domain/src/core.ts (roles, status, evidence/application types, transitions), auth.ts, evidence.ts, jobs.ts, applications.ts, assessment.ts, ai-gateway.ts | 04 sections 3, 5; 06 sections 2, 11 | Complete | none |
| packages/domain/src/admin.ts (grep), billing.ts (grep), stripe-billing.ts (entitlement/reconcile excerpt), lms.ts (enroll excerpt), work-history-graph.ts (score/tier, email eligibility), background-jobs.ts (dispatch kinds, secret keys), input-security.ts (head), challenges.ts (grep), moderation.ts (grep), type unions via grep across domain | 04 sections 5, 7; 06 sections 7, 9 | Partial | Other ~35 domain modules (reputation, salary, talent pools, alumni, referrals, interviews, gamification, search, etc.) not read; only their state/status type unions were extracted. Their scoring formulas are intentionally not documented here. |
| packages/contracts/src/index.ts (Register, Login, ChangePassword, Admin roles schemas via grep) | 06 section 2; 04 section 3 | Partial | ~60 KB of other schemas not read; request shapes belong to the API/data docs. |
| packages/config/src/env.ts | 06 sections 5, 9, 10 | Complete | none |
| packages/observability/src/logger.ts, audit.ts | 06 sections 5, 8 | Complete | none |
| supabase/migrations/*.sql (grep counts of RLS/policies/auth.uid; head of 00045, 00053) | 06 section 4 | Partial | Policy bodies not read; allow/deny correctness relies on tests described in docs (not run). |
| deploy/oracle/Caddyfile, scripts/check-client-secrets.mjs, .github/workflows (names and grep), .gitignore check, `git ls-files` for env files, tests directory listings, tests/integration/challenges-assessment.test.ts (excerpt) | 06 sections 5, 6, 13; 04 G-01 | Partial | CI workflow bodies, Compose files, backup/restore scripts not read (doc 08 owns operations). Test contents not run; test names cited only as existence. |
| ARCHITECTURE.md | 04 sections 3, 5, 7, 8; 06 sections 1, 3, 4, 13, 15 | Complete | Decision register ADR-001 to ADR-016 and invariants are owned by the architecture docs; only cross-referenced. Several claims corrected (04 section 8, 06 section 15). |
| AGENTS.md (grep for secrets/escalation only), CLAUDE.md files (instructions, as loaded) | 06 section 5 rules; 04 section 1 | Partial | AGENTS.md not read in full; only the secrets/escalation/build-file rules were used. |
| docs/system-model/06-route-authorization.md | 04 sections 3, 7, 8; 06 section 3 | Complete | Route tables are summarized, not copied; kept in place as the route-level reference. Stale rows (CF-35 tier, CF-38, CF-44 resumeId, free quota 20) recorded as corrections. |
| docs/system-model/03-conflict-register.md | 04 section 7; 06 sections 3, 13 | Complete | Decision records and resolved items not copied (kept in source). CF-13 (hosted Supabase) carried as blocked in 06 section 4. |
| docs/quality/SECURITY.md | 06 sections 2, 5, 8, 9, 10, 13, 15 | Complete | Generic checklists (sections 5-7, 12-14: threat list, data classes, file security, incident response, privacy statement) are targets, not built behaviour; not migrated as controls. |
| docs/quality/OPERATIONS.md (grep: first-admin bootstrap, durability note) | 04 section 3.1; 06 A-10 | Partial | Rest is operations content for the operations doc. |
| docs/reports/FEATURE_STATUS_2026-10-21.md (matrix rows F-01 to F-173 extracted by script; rows F-01 to F-41 read in full text; status counts; D-01, D-09, D-10 text; retained historical counts) | 04 section 2 (inventory, counts), 7, 8 | Partial | 144 KB: sections A (executive), B (command ledger), D-F (requirements trace, architecture assessment, defects D-02 to D-08) and the historical static assessment were not read in full. Per-row expected-behaviour text and next-action backlog IDs (BL-F-nn, X-nn) not carried; rows not re-verified are labelled historical claim, unverified. A sample of about 25 rows was checked against code (F-01, 07, 08, 10, 11, 12, 14, 15, 16, 17, 18, 19, 22-24, 26, 29, 32, 33, 35-37, 52, 94, 162). |
| docs/experience/APP_FLOW.md | 04 sections 2, 4 | Complete | Sections 1-10 are target journeys; only the "current browser routes" table was treated as built-state. |
| docs/experience/JOURNEY_REGISTRY.md | 04 section 4 | Partial | J-01 to J-28 summarized into built-state journeys; diagrams for J-02/J-26 and persona IDs not copied (target). |
| docs/experience/UI_UX_DESIGN_SYSTEM.md (first 60 lines) | 04 section 9 pointer | Partial | Owned by the UI/design doc; remaining sections not read. |
| docs/product/PRD.md | 04 sections 2.6, 4, 7 (north-star loop gaps), 9 | Complete | Metrics and non-goals belong to the product/overview doc. |
| docs/PRICING.md (read only, lines 1-80) | 04 intro and 2.6; 06 sections 9, 11 (link only) | Complete | Deliberately not copied (a unit test reads it); Stripe test-mode price ids not repeated. Tail (frontend note, open decisions) not read. |
| docs/registries/FEATURE_REGISTRY.md (head), WORKFLOWS_AND_BUSINESS_RULES.md | 04 section 2 (IDs), 9 | Partial | 173-row register read only through F-24 and via the audit's copy; BUSINESS_RULE_REGISTRY.md (248 rules) not read; BR ids cited only where code comments cite them. |
| Yash_Final_Project_Document/README.md (head) | 04 section 9 | Complete | none |
| Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/README.md | 04 section 9 | Partial | SPEC_G1 to G5, MICRO_FEATURE_SPECS and SPEC_ACCEPTANCE_ADDITIONS_REV2 not read (about 200 KB); target acceptance criteria stay Proposed-only. |
| Yash_Final_Project_Document/06_BUSINESS_PROCESSES/STATE_MACHINES.md (headings), PRODUCT_INVARIANT_REGISTRY.md (head) | 04 section 9 | Partial | State tables, business-rule registries, decision tables and crosswalks not read; listed by SM name only. |
| Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/* | none (UI/design doc owns it) | Unresolved | Not read in this pass; 04 only points to the folder as target. |
| Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md, SECURITY_ARCHITECTURE.md#record-security-rev2 (full), SECURITY_ARCHITECTURE.md (section 2 and headings), COMPLIANCE_APPLICABILITY_MATRIX.md (head) | 06 section 14 (pointer summary) | Partial | THREAT_MODEL.md (32 KB), PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md (24 KB), rest of SECURITY_ARCHITECTURE.md (authorization, crypto, CSP values, audit) not read; summarized from the files that were read; target values intentionally not copied. |
| Yash_Final_Project_Document/27_INDEPENDENT_REVIEWS/REVIEW_FIX_STATUS.md | 04 section 9; 06 section 14 | Complete | FINAL_REVIEW_REPORT.md and SECOND_REVIEW_REPORT.md (about 138 KB) not read; open findings taken from the fix-status table. |
| docs/system-model/01-inventory-and-coverage.md, 02-flows.md, 04-conditions.md, 05-audit.md, 00-index.md | none | Unresolved | Not read in this pass (about 100 KB). Their flow diagrams and conditions may add edge cases to 04 section 7; link rather than copy if needed. |
| SSOT.md, docs/engineering/* (API_CONTRACTS, DATABASE, adr/*), docs/quality/TESTING.md, docs/governance/*, docs/superpowers/* | none | Unresolved | Out of the assigned source list; SSOT is intent and was not used as evidence. API_CONTRACTS.md and DATABASE.md are named by ARCHITECTURE.md as owners of endpoint counts and store maps; 04/06 do not duplicate them. |

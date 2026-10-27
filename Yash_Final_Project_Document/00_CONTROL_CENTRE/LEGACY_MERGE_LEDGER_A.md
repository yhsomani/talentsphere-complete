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

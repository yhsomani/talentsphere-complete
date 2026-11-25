# Documentation map

Until 2026-11-25 the repository held several large documentation trees written at different times for different purposes. They were consolidated that day into one home, [`docs/`](../docs/INDEX.md). This page says what each part is for, which one wins when they disagree, and where `project-mindmap/` fits. It reconciles by pointing, not by copying: each topic stays in its owning document.

## 1. The documentation set

| Part                                                                                                                | Files (2026-11-25) | What it describes                                                                                                       | Status of its claims                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Source code (`apps/`, `packages/`, `supabase/`, `tests/`)                                                           | n/a                | What exists                                                                                                             | The only implementation evidence                                                                                           |
| [`ARCHITECTURE.md`](../ARCHITECTURE.md)                                                                             | 1                  | Architecture as built: boundaries, invariants, decisions                                                                | Hand-written as-built record; governs what exists after the code                                                           |
| **`project-mindmap/`** (this folder)                                                                                | generated          | Everything that exists, reverse-engineered from source, with stable IDs, evidence and test results                      | Generated from source and an executed test run; see [FINAL_REPORT](FINAL_REPORT.md) for its limits                         |
| [`docs/`](../docs/INDEX.md) (as-built references, registries, system model, reports)                                | 32                 | Requirements registries (F-, BR-, J-), engineering references (API, database), quality, governance, dated reports       | Mixed: registries are intent; engineering references describe implementation at their date; `reports/` are dated snapshots |
| [`SSOT.md`](../SSOT.md)                                                                                             | 1                  | Canonical product and system intent                                                                                     | Intent. The accepted source of intent until a replacement is ratified                                                      |
| [`docs/blueprint/`](../docs/blueprint/README.md) (was `PRODUCT_BLUEPRINT/`)                                         | 49                 | A from-scratch definition of the intended product (30 modules, 1,144 features), with its own intended-product mind maps | Intent. Not ratified: its own `DEC-001` says it does not supersede `SSOT.md` until `OD-PRD-31` defines ratification        |
| [`docs/archive/target-blueprint/`](../docs/archive/target-blueprint/README.md) (was `Yash_Final_Project_Document/`) | 40                 | A greenfield redesign blueprint (sections `00` to `30` and `99`; final authority is section 99)                         | Archived proposal. Every area was Draft, Under Review or Revision Required; `tests_executed = 0` by its own statement      |
| [`docs/history/PROJECT_HISTORY.md`](../docs/history/PROJECT_HISTORY.md) (was `BRAIN/`)                              | 1                  | Agent execution memory and a conceptual model                                                                           | History                                                                                                                    |

Removed on 2026-11-25 and not replaced: `graphify-out/` (output of a knowledge-graph tool run on 2026-10-23, superseded by this folder) and `TalentSphere/` (an empty personal Obsidian vault). Every moved, merged or deleted path is listed in [`docs/archive/REMOVED_FILES.md`](../docs/archive/REMOVED_FILES.md).

## 2. Which one wins

This follows the authority order in [`docs/INDEX.md`](../docs/INDEX.md).

1. **What exists:** the code, then `ARCHITECTURE.md`, then this folder (which is regenerated from the code and records the commit its test results come from). Dated reports and snapshots never override newer source.
2. **What is intended:** `SSOT.md`, then the `docs/` registries and specialised documents. `docs/blueprint/` and `docs/archive/target-blueprint/` are proposals until ratified; the gated plan for retiring older documents is in [`docs/blueprint/11_LEGACY_DISPOSITION.md`](../docs/blueprint/11_LEGACY_DISPOSITION.md).
3. **History:** `docs/reports/`, `docs/history/`, `docs/archive/`.

## 3. Two kinds of mind map

There are two mind-map sets and they answer different questions:

| Set                                                                 | Question                                          | Source                                |
| ------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------- |
| [`project-mindmap/master`](master/MASTER_PROJECT_MINDMAP.md)        | What does the repository actually contain and do? | Source code and test results          |
| [`docs/blueprint/10_MINDMAPS.md`](../docs/blueprint/10_MINDMAPS.md) | What is the product meant to become?              | The blueprint's module specifications |

Read them side by side to see the distance between intent and implementation. The link between the two is the documented ID: this map carries `F-`, `J-` and `BR-` IDs from the `docs/` registries as nodes and shows which code and tests cite each one ([DOC_CODE_RECONCILIATION](quality/DOC_CODE_RECONCILIATION.md)). The blueprint uses its own module-based feature IDs; a crosswalk from those to `F-` IDs is in the "Legacy feature coverage" section of [`11_LEGACY_DISPOSITION.md`](../docs/blueprint/11_LEGACY_DISPOSITION.md).

## 4. Overlaps and disagreements found

- **Three intent corpora.** `SSOT.md`, `docs/blueprint/` and `docs/archive/target-blueprint/` each describe the whole intended product. Only `SSOT.md` is named as the source of intent in `docs/INDEX.md`; the other two say themselves that they are not ratified. Choosing one is an owner decision (open issue #46, ADR-015 ratification, and `OD-PRD-31` cover parts of it); the consolidation put them in one tree and labelled them, but did not make that decision.
- **Numbers drift.** Counts of routes, migrations and durable routes are restated in several documents. The [numeric-claims check](quality/DOC_CODE_RECONCILIATION.md#2-numeric-claims-in-living-documents) compares each against source on every regeneration. Dated snapshots are expected to differ and are labelled as such.
- **Documented status vs code.** Feature statuses in `docs/reports/FEATURE_STATUS_2026-10-21.md` are a dated snapshot. Where today's code contradicts one, the reconciliation file flags it rather than silently changing it.
- **Product description vs code.** The product is described as PWA-first and ships a manifest and capability detection (`apps/web/src/pwa.ts`), but no service worker is registered anywhere in `apps/web`, so there is no offline behaviour ([IMPLEMENTATION_GAPS section 11](quality/IMPLEMENTATION_GAPS.md#11-duplicated-rules-and-pwa-claims)).
- **Module federation.** The archived target blueprint describes module federation; the built system is a modular monolith and `SSOT.md` (V61-15) lists federation as Proposed only.

## 5. Keeping this map current

Regenerate after code changes (see [README](README.md#regenerating)). Re-run the test suites in a throwaway copy before regenerating if you want the `HIGH` confidence levels and run results to describe the new commit; otherwise the map keeps the last results and names the commit they came from. The generator reads `docs/registries/`, `docs/experience/JOURNEY_REGISTRY.md`, `docs/reports/FEATURE_STATUS_2026-10-21.md` and a few `docs/` files for numeric claims; those paths were deliberately left in place.

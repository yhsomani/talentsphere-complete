# Documentation map

The repository holds several large documentation trees written at different times for different purposes. This page says what each one is for, which one wins when they disagree, and where `project-mindmap/` fits. It reconciles them by pointing, not by copying: each topic stays in its owning document.

## 1. The trees

| Tree                                                                       | Tracked files (2026-11-25) | What it describes                                                                                                                         | Status of its claims                                                                                                                  |
| -------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Source code (`apps/`, `packages/`, `supabase/`, `tests/`)                  | n/a                        | What exists                                                                                                                               | The only implementation evidence                                                                                                      |
| [`ARCHITECTURE.md`](../ARCHITECTURE.md)                                    | 1                          | Architecture as built: boundaries, invariants, decisions                                                                                  | Hand-written as-built record; governs what exists after the code                                                                      |
| **`project-mindmap/`** (this folder)                                       | generated                  | Everything that exists, reverse-engineered from source, with stable IDs, evidence and test results                                        | Generated from source and an executed test run; see [FINAL_REPORT](FINAL_REPORT.md) for its limits                                    |
| [`docs/`](../docs/INDEX.md)                                                | 50                         | Requirements registries (F-, BR-, J-), engineering references (API, database), quality, governance, and dated reports                     | Mixed: registries are intent; engineering references describe implementation at their date; `reports/` are dated snapshots            |
| [`SSOT.md`](../SSOT.md)                                                    | 1                          | Canonical product and system intent                                                                                                       | Intent. The accepted source of intent until a replacement is ratified                                                                 |
| [`PRODUCT_BLUEPRINT/`](../PRODUCT_BLUEPRINT/00_START_HERE/README.md)       | 106                        | A from-scratch definition of the intended product (30 modules, 1,144 features), with its own intended-product mind maps in `10_MINDMAPS/` | Intent. Not ratified: its own `DEC-001` says it does not supersede `SSOT.md` until `OD-PRD-31` defines ratification                   |
| [`Yash_Final_Project_Document/`](../Yash_Final_Project_Document/README.md) | 246                        | A greenfield redesign blueprint (33 numbered sections, `00` to `31` and `99`; its final authority is `99_FINAL_MASTER_BLUEPRINT`)         | Intent. Every area is Draft, Under Review or Revision Required (its own `DOCUMENT_STATUS`); `tests_executed = 0` by its own statement |
| [`BRAIN/`](../BRAIN/MEMORY.md)                                             | 2                          | Agent execution memory and a conceptual model                                                                                             | History                                                                                                                               |
| `graphify-out/`                                                            | 127                        | Output of a knowledge-graph tool run on 2026-10-23                                                                                        | Tool output, dated; superseded for structure by this folder                                                                           |
| `TalentSphere/`                                                            | 7                          | A personal Obsidian vault                                                                                                                 | Not project documentation ([docs/INDEX.md](../docs/INDEX.md) conventions)                                                             |

## 2. Which one wins

This follows the authority order in [`docs/INDEX.md`](../docs/INDEX.md) and adds the trees it does not name.

1. **What exists:** the code, then `ARCHITECTURE.md`, then this folder (which is regenerated from the code and records the commit its test results come from). Dated reports and snapshots never override newer source.
2. **What is intended:** `SSOT.md`, then the `docs/` registries and specialised documents. `PRODUCT_BLUEPRINT/` and `Yash_Final_Project_Document/` are proposals until ratified; the disposition plan in [`PRODUCT_BLUEPRINT/11_LEGACY_DISPOSITION`](../PRODUCT_BLUEPRINT/11_LEGACY_DISPOSITION/DISPOSITION_PLAN.md) is the existing, gated plan for retiring older documents.
3. **History:** `docs/reports/`, `BRAIN/`, `graphify-out/`.

## 3. Two kinds of mind map

There are two mind-map sets and they answer different questions:

| Set                                                                                      | Question                                          | Source                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------- |
| [`project-mindmap/master`](master/MASTER_PROJECT_MINDMAP.md)                             | What does the repository actually contain and do? | Source code and test results          |
| [`PRODUCT_BLUEPRINT/10_MINDMAPS`](../PRODUCT_BLUEPRINT/10_MINDMAPS/00_MASTER_MINDMAP.md) | What is the product meant to become?              | The blueprint's module specifications |

Read them side by side to see the distance between intent and implementation. The link between the two is the documented ID: this map carries `F-`, `J-` and `BR-` IDs from the `docs/` registries as nodes and shows which code and tests cite each one ([DOC_CODE_RECONCILIATION](quality/DOC_CODE_RECONCILIATION.md)). The blueprint uses its own module-based feature IDs; a crosswalk from those to `F-` IDs is in [`LEGACY_FEATURE_COVERAGE`](../PRODUCT_BLUEPRINT/11_LEGACY_DISPOSITION/LEGACY_FEATURE_COVERAGE.md).

## 4. Overlaps and disagreements found

- **Three intent corpora.** `SSOT.md`, `PRODUCT_BLUEPRINT/` and `Yash_Final_Project_Document/` each describe the whole intended product. Only `SSOT.md` is named as the source of intent in `docs/INDEX.md`; the other two say themselves that they are not ratified. Choosing one is an owner decision (open issue #46, ADR-015 ratification, and `OD-PRD-31` cover parts of it); this map does not make it.
- **Numbers drift.** Counts of routes, migrations and durable routes are restated in several documents. The [numeric-claims check](quality/DOC_CODE_RECONCILIATION.md#2-numeric-claims-in-living-documents) compares each against source on every regeneration. Dated snapshots are expected to differ and are labelled as such.
- **Documented status vs code.** Feature statuses in `docs/reports/FEATURE_STATUS_2026-10-21.md` are a dated snapshot. Where today's code contradicts one, the reconciliation file flags it rather than silently changing it.
- **Product description vs code.** The product is described as PWA-first, but no service worker is registered anywhere in `apps/web`, so there is no offline behaviour ([IMPLEMENTATION_GAPS section 11](quality/IMPLEMENTATION_GAPS.md#11-duplicated-rules-and-pwa-claims)).
- **`graphify-out/`** is an earlier automated structure map. It is not regenerated and is older than this folder; prefer this folder for structure.

## 5. Keeping this map current

Regenerate after code changes (see [README](README.md#regenerating)). Re-run the test suites in a throwaway copy before regenerating if you want the `HIGH` confidence levels and run results to describe the new commit; otherwise the map keeps the last results and names the commit they came from.

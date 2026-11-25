# project-mindmap — reverse-engineered map of the actual TalentSphere repository

Evidence-backed, ID-stable, interconnected map generated from the source on the date of the commit. It describes the **real** project (what code exists), not the intended product (see `docs/blueprint/` for that). Nothing in the application was changed.

Start with [`master/MASTER_PROJECT_MINDMAP.md`](master/MASTER_PROJECT_MINDMAP.md) for the overview, or [`catalog/FEATURE_CATALOG.md`](catalog/FEATURE_CATALOG.md) for the full feature hierarchy from module down to nano-feature.

## Structure

| Path                                        | Contents                                                                                                                                                                                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `master/MASTER_PROJECT_MINDMAP.md` / `.mmd` | **Master mind map (Mermaid)**: 20 branches in three zones, legend, type-level cross-connection graph, module table                                                                                                                                                                                  |
| `master/MASTER_PROJECT_DIAGRAMS.md`         | Mermaid only: hub/zone overview flowchart, cross-connection chain, and one detail mind map per branch (every item, with status emoji)                                                                                                                                                               |
| `master/MASTER_PROJECT_GRAPH.json`          | **The master graph, the one canonical dataset**: 2,635 code and documentation nodes and 7,004 typed edges from this script, plus the feature-hierarchy layer that `tools/catalog.py` adds (nodes and edges with `layer: feature-hierarchy`; counts in `catalog/GRAPH_VALIDATION.md`)                |
| `master/MASTER_PROJECT_GRAPH.dot`           | The code and documentation graph for Graphviz (without the feature-hierarchy layer)                                                                                                                                                                                                                 |
| `catalog/`                                  | **Feature catalog**: hierarchy PROJECT → APPLICATION → MODULE → MAJOR → MINOR → SUB → SMALL → TINY → NANO, one file per module with Mermaid maps and a row per node, plus journey, data-flow, API dependency, database, state, test-traceability and validation views, all generated from the graph |
| `master/ID_LEDGER.json`                     | Logical key → stable ID for every generated node; IDs are never renumbered or reused                                                                                                                                                                                                                |
| `journeys/USER_JOURNEYS.md` / `.json`       | Personas, navigation sets, 100 e2e-derived journeys with run results, 28 documented target journeys                                                                                                                                                                                                 |
| `features/COMPLETE_FEATURE_INVENTORY.json`  | Hierarchy with parent IDs, status, evidence, business rules                                                                                                                                                                                                                                         |
| `ui/SCREEN_INTERACTION_INVENTORY.md`        | Screens, components, interactions, navigation                                                                                                                                                                                                                                                       |
| `architecture/`                             | Frontend, backend/infra, API (all 282 endpoints), dependency graph, per-module subgraphs                                                                                                                                                                                                            |
| `data/`                                     | Database entity map, end-to-end data flows, state machines                                                                                                                                                                                                                                          |
| `quality/`                                  | Implementation gaps, test coverage map with execution results, documentation-vs-code reconciliation, traceability matrix (CSV), `EXECUTION_RESULTS.json`                                                                                                                                            |
| `DOCUMENTATION_MAP.md`                      | Which document tree owns what (code, SSOT, `docs/` and its blueprint, archive and history), and where they overlap                                                                                                                                                                                  |
| `evidence/`                                 | Evidence register (CSV + summary)                                                                                                                                                                                                                                                                   |
| `VALIDATION_REPORT.md`, `FINAL_REPORT.md`   | Phase 9–10 checks and computed totals                                                                                                                                                                                                                                                               |

## ID system

`PROJ ROLE JOUR MOD FEAT API SCR COMP INT ERR RULE SCH SVC DB STATE TEST EXT INFRA` for generated nodes, plus the project's own registry IDs `F-` (features), `J-` (journeys) and `BR-` (business rules) for documented entities, so a documented feature has exactly one ID everywhere.

Generated IDs are **stable across runs**: `tools/enrich.py` keeps `master/ID_LEDGER.json`, which maps each node's logical key (type, name, defining file, and an ordinal when the same triple repeats) to its ID. A new entity gets the next free number for its prefix; a removed entity's ID is retired and never reused. The graph JSON is the source of truth for ID → file:line.

## Hierarchy levels used

The deep feature hierarchy (MAJOR to NANO, prefixes `MIN SUB SML TNY NANO FLOW APP`) is defined in [`catalog/FEATURE_CATALOG.md`](catalog/FEATURE_CATALOG.md). The older, shallower inventory below is kept in `features/COMPLETE_FEATURE_INVENTORY.json`:

APPLICATION → MODULE (API module) → FEATURE (resource group, shared component, job kind) → SUB-FEATURE (endpoint, screen) → MICRO-FEATURE (UI interaction) → NANO-FEATURE (error branch). Business rules (exported domain functions) hang off domain modules and are linked by `CALLS` edges. Deeper levels (action, interaction, system response) are carried by the interaction's `handler`/`event` properties and the error branch; there is no separate evidence for finer nodes.

## Status and confidence

Statuses: IMPLEMENTED, PARTIALLY_IMPLEMENTED, NOT_IMPLEMENTED, BROKEN, MOCKED, UNREACHABLE, DEPRECATED, UNKNOWN. `HIGH` = source evidence plus a passing executed test: the journey's own e2e test passed, or every executed test file linked to the node passed (the link is path-level: a test that names the route or function, not an assertion-level trace). `MEDIUM` = supported by source. `LOW` = inferred.

## Method

Python scripts in `tools/` (standard library only) that read the repository and write only to `project-mindmap/`: `extract.py` parses route registrations, handler bodies, `durability.ts`, `core-store.ts`, `App.tsx`, page and component source, domain exports, contract schemas, migrations, test files and workflows; `enrich.py` applies the ID ledger, adds the documented F-/J-/BR- entities and attaches test results; `generate.py` and `mermaid_master.py` write every artifact. See VALIDATION_REPORT for checks.

## Limits

See [FINAL_REPORT](FINAL_REPORT.md) "Known limitations".

## Regenerating

The map is generated, not hand-written. From the repository root (read-only on the repo; outputs go to `project-mindmap/`):

```bash
W=$(mktemp -d)                                                   # any directory outside the repository
python3 -I project-mindmap/tools/extract.py "$W"
python3 -I project-mindmap/tools/enrich.py "$W" [RESULTS_DIR]     # RESULTS_DIR optional, see below
python3 -I project-mindmap/tools/generate.py "$W"
python3 -I project-mindmap/tools/mermaid_master.py "$W"          # master mind map + per-branch Mermaid diagrams
python3 -I project-mindmap/tools/generate.py "$W"                # again, so the master map embeds the rich mind map
python3 -I project-mindmap/tools/catalog.py "$W"                 # last: feature hierarchy into the graph + catalog/ views; exits non-zero if validation fails
```

**Test results.** AGENTS.md forbids installing dependencies or building in the repository, so tests are run in a throwaway copy: `git ls-files -co --exclude-standard | tar -cf - -T - | tar -xf - -C <copy>`, then in the copy `pnpm install --frozen-lockfile`, `pnpm build`, `npx vitest run --reporter=json --outputFile=<RESULTS_DIR>/vitest.json`, `TEST_DATABASE_URL=... npx vitest run --config vitest.pg.config.ts --reporter=json --outputFile=<RESULTS_DIR>/vitest-pg.json` and `npx playwright test --reporter=json --trace off > <RESULTS_DIR>/e2e.json`. Add `<RESULTS_DIR>/run.json` with `commit`, `date`, `root` (the copy's path, stripped from file names), `commands` and `checks`. `enrich.py` reduces these to `quality/EXECUTION_RESULTS.json`; without RESULTS_DIR it reuses that file and the map states which commit it was measured on.

Optional parser checks (install `mermaid@11.4.1 jsdom dotparser` in a directory **outside** the repository, put `validate-mermaid.mjs` and `validate-dot.mjs` there, and write their JSON output to `<parent of workdir>/mmtest/mm_out.json` and `dot_out.json`; `generate.py` embeds the results in the validation report). Output is deterministic: two runs on the same commit produce an identical graph.

The scripts are documentation tooling only: they are not part of any build, test or CI step, and they never write outside `project-mindmap/`. Generated Markdown is formatted with the repository's Prettier config afterwards (`pnpm lint` checks it).

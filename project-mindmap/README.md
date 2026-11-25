# project-mindmap — reverse-engineered map of the actual TalentSphere repository

Evidence-backed, ID-stable, interconnected map generated from the source on the date of the commit. It describes the **real** project (what code exists), not the intended product (see `PRODUCT_BLUEPRINT/` for that). Nothing in the application was changed.

Start with [`master/MASTER_PROJECT_MINDMAP.md`](master/MASTER_PROJECT_MINDMAP.md).

## Structure

| Path                                        | Contents                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `master/MASTER_PROJECT_MINDMAP.md` / `.mmd` | 20-branch mind map, legend, type-level cross-connection graph, module table              |
| `master/MASTER_PROJECT_GRAPH.json`          | **The master graph**: 2,188 nodes, 5,582 typed edges, each with evidence                 |
| `master/MASTER_PROJECT_GRAPH.dot`           | The same graph for Graphviz                                                              |
| `journeys/USER_JOURNEYS.md` / `.json`       | Personas, navigation sets, 109 e2e-derived journeys                                      |
| `features/COMPLETE_FEATURE_INVENTORY.json`  | Hierarchy with parent IDs, status, evidence, business rules                              |
| `ui/SCREEN_INTERACTION_INVENTORY.md`        | Screens, components, interactions, navigation                                            |
| `architecture/`                             | Frontend, backend/infra, API (all 282 endpoints), dependency graph, per-module subgraphs |
| `data/`                                     | Database entity map, end-to-end data flows, state machines                               |
| `quality/`                                  | Implementation gaps, test coverage map, traceability matrix (CSV)                        |
| `evidence/`                                 | Evidence register (CSV + summary)                                                        |
| `VALIDATION_REPORT.md`, `FINAL_REPORT.md`   | Phase 9–10 checks and computed totals                                                    |

## ID system

`PROJ ROLE JOUR MOD FEAT API SCR COMP INT ERR RULE SCH SVC DB STATE TEST EXT INFRA`, numbered per prefix in a deterministic scan order. An ID is only stable for one generation run; regenerating after code changes can renumber. The graph JSON is the source of truth for ID → file:line.

## Hierarchy levels used

APPLICATION → MODULE (API module) → FEATURE (resource group, shared component, job kind) → SUB-FEATURE (endpoint, screen) → MICRO-FEATURE (UI interaction) → NANO-FEATURE (error branch). Business rules (exported domain functions) hang off domain modules and are linked by `CALLS` edges. Deeper levels (action, interaction, system response) are carried by the interaction's `handler`/`event` properties and the error branch; there is no separate evidence for finer nodes.

## Status and confidence

Statuses: IMPLEMENTED, PARTIALLY_IMPLEMENTED, NOT_IMPLEMENTED, BROKEN, MOCKED, UNREACHABLE, DEPRECATED, UNKNOWN. Confidence: HIGH (source + execution/test), MEDIUM (source only), LOW (inferred). **No HIGH**: nothing was executed.

## Method

Read-only extractor (Python, standard library, kept outside the repo) parsing: route registrations, handler bodies, `durability.ts`, `core-store.ts`, `App.tsx`, page and component source, domain exports, contract schemas, migrations, test files, workflows. See VALIDATION_REPORT for checks.

## Limits

See [FINAL_REPORT](FINAL_REPORT.md) "Known limitations".

## Regenerating

The map is generated, not hand-written. From the repository root (read-only on the repo; outputs go to `project-mindmap/`):

```bash
mkdir -p /tmp/mindmap-work
python3 -I project-mindmap/tools/extract.py /tmp/mindmap-work
python3 -I project-mindmap/tools/generate.py /tmp/mindmap-work
```

Optional parser checks (install `mermaid@11.4.1 jsdom dotparser` in a directory **outside** the repository, put `validate-mermaid.mjs` and `validate-dot.mjs` there, and write their JSON output to `<parent of workdir>/mmtest/mm_out.json` and `dot_out.json`; `generate.py` embeds the results in the validation report). Output is deterministic: two runs on the same commit produce an identical graph.

The scripts are documentation tooling only: they are not part of any build, test or CI step, and they never write outside `project-mindmap/`.

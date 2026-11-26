# Graph Validation

Checks run by `docs/mindmap/tools/catalog.py` on the merged graph at `9b3032f`. The script exits with an error and writes nothing if any check fails, so this file only exists for a passing graph. Back to the [feature catalog](FEATURE_CATALOG.md).

| Check                                                                                     | Result                                             |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Node IDs unique                                                                           | pass (8962 nodes)                                  |
| Every edge has a relationship type                                                        | pass (18833 edges, 20 types)                       |
| No dangling edges (both ends exist)                                                       | pass                                               |
| Every hierarchy node has an existing parent of a shallower level                          | pass (6607 hierarchy nodes)                        |
| Every hierarchy node is reachable from PROJ-001                                           | pass                                               |
| Every new node has a description and source evidence; every evidence file exists          | pass (6327 new nodes)                              |
| Every API resource group (FEAT-) and registry feature (F-) is placed in the hierarchy     | pass                                               |
| Every endpoint has a MINOR node; every screen a MAJOR node; every interaction a TINY node | pass (282 endpoints, 29 screens, 211 interactions) |
| IDs stable: new IDs recorded in master/ID_LEDGER.json under catalog: keys, never reused   | pass (6327 catalog keys)                           |

## Counts (computed from the data)

| Level       | Nodes |
| ----------- | ----- |
| PROJECT     | 1     |
| APPLICATION | 4     |
| MODULE      | 137   |
| MAJOR       | 414   |
| MINOR       | 431   |
| SUB         | 1208  |
| SMALL       | 1006  |
| TINY        | 824   |
| NANO        | 2582  |

| Node type | Nodes |
| --------- | ----- |
| API       | 282   |
| APP       | 1     |
| COMP      | 44    |
| DB        | 112   |
| DOCBR     | 248   |
| DOCF      | 173   |
| DOCJ      | 28    |
| ERR       | 254   |
| EXT       | 6     |
| FEAT      | 241   |
| FLOW      | 96    |
| INFRA     | 14    |
| INT       | 211   |
| JOUR      | 100   |
| MIN       | 431   |
| MOD       | 251   |
| NANO      | 2582  |
| PROJ      | 1     |
| ROLE      | 12    |
| RULE      | 279   |
| SCH       | 141   |
| SCR       | 29    |
| SML       | 1006  |
| STATE     | 45    |
| SUB       | 1208  |
| SVC       | 117   |
| TEST      | 226   |
| TNY       | 824   |

| Relationship   | Edges |
| -------------- | ----- |
| AUTHORIZES     | 247   |
| BLOCKED_BY     | 18    |
| CALLS          | 824   |
| CONTAINS       | 7859  |
| CREATES        | 112   |
| DEPENDS_ON     | 413   |
| EXERCISES      | 143   |
| FALLBACK_TO    | 2     |
| IMPLEMENTED_BY | 3342  |
| IMPLEMENTS     | 807   |
| NAVIGATES_TO   | 167   |
| PRODUCES       | 368   |
| READS          | 40    |
| REQUIRES       | 52    |
| STARTS_AT      | 94    |
| TESTED_BY      | 3710  |
| TRIGGERS       | 378   |
| UPDATES        | 9     |
| VALIDATES      | 132   |
| WRITES         | 116   |

## Not checked here

- Whether each nano behaviour is correct at runtime: only tests can say that, and the verification column shows which ones a test asserts.
- Mermaid syntax: checked by `tools/validate-mermaid.mjs` (see README); its result for this run is in the PR description.
- Inline handlers that call helpers in other files: their state changes and requests are followed one hop inside the same file only.

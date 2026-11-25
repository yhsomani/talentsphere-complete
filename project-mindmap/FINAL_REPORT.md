# Final Report

All numbers are computed from the generated graph (`master/MASTER_PROJECT_GRAPH.json`) or from the stated source scan. Nothing is estimated.

| #   | Item                                                      | Value                                                                                                               | How it is counted                                                                                                |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | Repository investigation                                  | 466 source-like files outside documentation/tool-output folders: 409 (87.8%) analysed in depth, 57 inventoried only | see VALIDATION_REPORT                                                                                            |
| 2   | Modules                                                   | 157 total: 45 API modules, 48 domain modules, 55 migrations, 3 applications                                         | `MOD-` nodes                                                                                                     |
| 3   | Features (feature groups + shared components + job kinds) | 243                                                                                                                 | inventory level FEATURE                                                                                          |
| 4   | Sub-features (endpoints + screens)                        | 311 (282 endpoints + 29 screens)                                                                                    | level SUB-FEATURE                                                                                                |
| 5   | Micro-features (UI interactions)                          | 211                                                                                                                 | level MICRO-FEATURE                                                                                              |
| 6   | Nano-features (error branches)                            | 256                                                                                                                 | level NANO-FEATURE                                                                                               |
| 7   | User journeys                                             | 109 (e2e-derived)                                                                                                   | `JOUR-` nodes                                                                                                    |
| 8   | Screens                                                   | 29                                                                                                                  | `SCR-` nodes                                                                                                     |
| 9   | Interactions                                              | 211                                                                                                                 | `INT-` nodes                                                                                                     |
| 10  | APIs                                                      | 282 (85 durable, 197 ephemeral)                                                                                     | `API-` nodes                                                                                                     |
| 11  | Database entities                                         | 112 tables                                                                                                          | `DB-` nodes                                                                                                      |
| 12  | Business rules                                            | 279 exported domain functions/classes                                                                               | `RULE-` nodes                                                                                                    |
| 13  | Cross-connections                                         | 4,335 non-hierarchy edges (5,582 total incl. 1,247 CONTAINS)                                                        | edges                                                                                                            |
| 14  | Status distribution                                       | IMPLEMENTED 1053, NOT_IMPLEMENTED 78, PARTIALLY_IMPLEMENTED 46, UNKNOWN 21, MOCKED 1                                | capability nodes (API, SCR, INT, COMP, RULE, DB, EXT, JOUR, SVC, INFRA); per-type matrix in master map section 4 |
| 15  | Contract schemas                                          | 141                                                                                                                 | `SCH-` nodes                                                                                                     |
| 16  | Tests                                                     | 223 files, 1883 cases (not executed)                                                                                | `TEST-` nodes                                                                                                    |
| 17  | Validation                                                | 14/14 checks pass                                                                                                   | VALIDATION_REPORT                                                                                                |

## Known limitations

- Static analysis only; **nothing was run**. No `node_modules` exist in this environment and installing writes protected files, so no unit, integration, e2e or runtime evidence was produced and no `HIGH` confidence exists.
- Journeys come from e2e specs; documented-only journeys are not mapped. Per-journey fields such as business logic per step, decision branches and recovery paths are not derivable statically.
- Response shapes, request field-level validation, per-column constraints, RLS policy semantics and data retention rules are not extracted (see the evidence in migrations and contracts).
- `TESTED_BY` is textual and path-level.
- All Mermaid diagrams pass the Mermaid 11.4.1 parser and the DOT file passes a DOT parser, but nothing was _rendered or laid out_ (no browser or Graphviz binary used); very large diagrams may need a layout engine tuned for size. The parser checks ran from a throwaway directory outside the repository.
- The master map is Mermaid only. All Mermaid diagrams (master mind map, overview, chain, 20 branch mind maps) were parsed and also rendered in headless Chromium with Mermaid 11.4.1 and inspected; the master mind map shows branches and sub-branches, and the per-branch mind maps carry every item. The lossless forms are the JSON and DOT.

## Remaining unknowns

- Whether the e2e/unit/integration tests pass today (CI on `main` is red; cause not examined).
- Live behaviour of Stripe, Brevo and hosted Supabase.
- Runtime state of the worker queue and the production database.
- Which ephemeral modules are intended to be persisted next (documented in ADR-015 and the roadmap, not decided by code).

## Output locations

All under `project-mindmap/` (see [README](README.md)).

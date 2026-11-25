# Blueprint 09: smaller registers

> **Status.** Intent, not ratified. Nothing here claims anything is built; what is built is in `ARCHITECTURE.md` and `project-mindmap/`. Decision `DEC-001`: this blueprint does not supersede `SSOT.md` until `OD-PRD-31` defines ratification.
>
> **What this file holds.** Acceptance coverage, decisions, dependencies, features by release tier, integrity report, journeys and state machines. The large registers have their own files in this folder.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| ACCEPTANCE_CRITERIA_COVERAGE.md | `PRODUCT_BLUEPRINT/09_REGISTERS/ACCEPTANCE_CRITERIA_COVERAGE.md` |
| DECISION_REGISTER.md | `PRODUCT_BLUEPRINT/09_REGISTERS/DECISION_REGISTER.md` |
| DEPENDENCY_REGISTER.md | `PRODUCT_BLUEPRINT/09_REGISTERS/DEPENDENCY_REGISTER.md` |
| FEATURES_BY_RELEASE_TIER.md | `PRODUCT_BLUEPRINT/09_REGISTERS/FEATURES_BY_RELEASE_TIER.md` |
| INTEGRITY_REPORT.md | `PRODUCT_BLUEPRINT/09_REGISTERS/INTEGRITY_REPORT.md` |
| JOURNEY_REGISTER.md | `PRODUCT_BLUEPRINT/09_REGISTERS/JOURNEY_REGISTER.md` |
| STATE_MACHINE_REGISTER.md | `PRODUCT_BLUEPRINT/09_REGISTERS/STATE_MACHINE_REGISTER.md` |

## ACCEPTANCE_CRITERIA_COVERAGE.md

_Former file: `PRODUCT_BLUEPRINT/09_REGISTERS/ACCEPTANCE_CRITERIA_COVERAGE.md`._

<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

## Acceptance Criteria Coverage

Counts of acceptance bullets per feature (negative-case detection is a keyword heuristic, so a no means review, not defect), used to check that every feature has at least three acceptance cases. Test-case traceability method: see [`../06_QUALITY_AND_PERFORMANCE/02_QA_AND_TEST_STRATEGY.md`](../06_QUALITY_AND_PERFORMANCE.md#qa-and-test-strategy).

| Module | Features | With 3+ acceptance cases | Below 3 | With a negative case | Fields complete (≥17) |
| ------ | -------- | ------------------------ | ------- | -------------------- | --------------------- |
| ADM    | 40       | 40                       | 0       | 36                   | 40                    |
| AIC    | 35       | 35                       | 0       | 31                   | 35                    |
| ANL    | 37       | 37                       | 0       | 34                   | 37                    |
| ASM    | 59       | 59                       | 0       | 59                   | 59                    |
| ATS    | 48       | 48                       | 0       | 48                   | 48                    |
| BGV    | 31       | 31                       | 0       | 31                   | 31                    |
| BIL    | 33       | 33                       | 0       | 29                   | 33                    |
| EMP    | 35       | 35                       | 0       | 35                   | 35                    |
| ENT    | 32       | 32                       | 0       | 27                   | 32                    |
| EVD    | 34       | 34                       | 0       | 34                   | 34                    |
| EVT    | 38       | 38                       | 0       | 38                   | 38                    |
| GIG    | 32       | 32                       | 0       | 26                   | 32                    |
| IDN    | 32       | 32                       | 0       | 32                   | 32                    |
| INS    | 33       | 33                       | 0       | 33                   | 33                    |
| INT    | 34       | 34                       | 0       | 34                   | 34                    |
| JOB    | 45       | 45                       | 0       | 45                   | 45                    |
| LRN    | 76       | 76                       | 0       | 76                   | 76                    |
| MEN    | 28       | 28                       | 0       | 24                   | 28                    |
| MKT    | 37       | 37                       | 0       | 32                   | 37                    |
| MSG    | 33       | 33                       | 0       | 28                   | 33                    |
| NET    | 37       | 37                       | 0       | 36                   | 37                    |
| NTF    | 33       | 33                       | 0       | 29                   | 33                    |
| PLT    | 43       | 43                       | 0       | 40                   | 43                    |
| PRF    | 36       | 36                       | 0       | 36                   | 36                    |
| PWA    | 39       | 39                       | 0       | 37                   | 39                    |
| REP    | 31       | 31                       | 0       | 29                   | 31                    |
| SET    | 32       | 32                       | 0       | 31                   | 32                    |
| SRC    | 35       | 35                       | 0       | 35                   | 35                    |
| STU    | 53       | 53                       | 0       | 53                   | 53                    |
| TSF    | 33       | 33                       | 0       | 27                   | 33                    |

### Features needing attention

| Feature    | Fields | Acceptance cases | Negative case |
| ---------- | ------ | ---------------- | ------------- |
| FR-ADM-008 | 19     | 3                | no            |
| FR-ADM-009 | 19     | 3                | no            |
| FR-ADM-013 | 19     | 3                | no            |
| FR-ADM-027 | 19     | 3                | no            |
| FR-AIC-018 | 19     | 3                | no            |
| FR-AIC-026 | 19     | 3                | no            |
| FR-AIC-028 | 19     | 3                | no            |
| FR-AIC-033 | 19     | 3                | no            |
| FR-ANL-008 | 19     | 3                | no            |
| FR-ANL-023 | 19     | 3                | no            |
| FR-ANL-027 | 19     | 3                | no            |
| FR-BIL-009 | 19     | 3                | no            |
| FR-BIL-016 | 19     | 3                | no            |
| FR-BIL-031 | 19     | 3                | no            |
| FR-BIL-032 | 19     | 3                | no            |
| FR-ENT-008 | 19     | 3                | no            |
| FR-ENT-009 | 19     | 3                | no            |
| FR-ENT-023 | 19     | 3                | no            |
| FR-ENT-027 | 19     | 3                | no            |
| FR-ENT-028 | 19     | 3                | no            |
| FR-GIG-005 | 19     | 3                | no            |
| FR-GIG-009 | 19     | 3                | no            |
| FR-GIG-010 | 19     | 3                | no            |
| FR-GIG-020 | 19     | 3                | no            |
| FR-GIG-027 | 19     | 3                | no            |
| FR-GIG-028 | 19     | 3                | no            |
| FR-MEN-009 | 19     | 3                | no            |
| FR-MEN-017 | 19     | 3                | no            |
| FR-MEN-019 | 19     | 3                | no            |
| FR-MEN-021 | 19     | 3                | no            |
| FR-MKT-012 | 19     | 3                | no            |
| FR-MKT-016 | 19     | 3                | no            |
| FR-MKT-018 | 19     | 3                | no            |
| FR-MKT-024 | 19     | 3                | no            |
| FR-MKT-026 | 19     | 3                | no            |
| FR-MSG-008 | 19     | 3                | no            |
| FR-MSG-023 | 19     | 3                | no            |
| FR-MSG-025 | 19     | 3                | no            |
| FR-MSG-026 | 19     | 3                | no            |
| FR-MSG-033 | 19     | 3                | no            |
| FR-NET-020 | 19     | 3                | no            |
| FR-NTF-019 | 19     | 4                | no            |
| FR-NTF-012 | 19     | 4                | no            |
| FR-NTF-028 | 19     | 4                | no            |
| FR-NTF-031 | 19     | 4                | no            |
| FR-PLT-015 | 19     | 3                | no            |
| FR-PLT-033 | 19     | 3                | no            |
| FR-PLT-035 | 19     | 3                | no            |
| FR-PWA-024 | 19     | 3                | no            |
| FR-PWA-026 | 19     | 3                | no            |
| FR-REP-008 | 19     | 4                | no            |
| FR-REP-025 | 19     | 4                | no            |
| FR-SET-012 | 19     | 4                | no            |
| FR-TSF-004 | 19     | 3                | no            |
| FR-TSF-016 | 19     | 4                | no            |
| FR-TSF-022 | 19     | 4                | no            |
| FR-TSF-030 | 19     | 3                | no            |
| FR-TSF-031 | 19     | 3                | no            |
| FR-TSF-033 | 19     | 3                | no            |

## DECISION_REGISTER.md

_Former file: `PRODUCT_BLUEPRINT/09_REGISTERS/DECISION_REGISTER.md`._

<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

## Decision Register

Recorded decisions (`DEC-`).

**Total: 27.**

### 04_ARCHITECTURE/01_SYSTEM_ARCHITECTURE.md

Source: [04_ARCHITECTURE/01_SYSTEM_ARCHITECTURE.md](../04_ARCHITECTURE.md#01--system-architecture)

| ID          | Decision                                                                                                                                                                                                                                                               | Detail                                      | Status |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------ |
| DEC-ARC-nnn | An architecture decision recorded in this folder (§22). Status is `Proposed` until the owner ratifies it. The `DEC-ARC` prefix is this folder's namespace and is distinct from the repository's `ADR-001…016`, SSOT `ADR-001…013` and the legacy target `ADR-T01…T25`. |                                             |        |
| DEC-ARC-001 | Modular monolith, one server codebase, six process roles                                                                                                                                                                                                               | ADR-001, SSOT ADR-002, ADR-T04              |        |
| DEC-ARC-002 | PostgreSQL is the only system of record; retire the boot-hydrated read model                                                                                                                                                                                           | supersedes ADR-015 on ratification; ADR-T05 |        |
| DEC-ARC-003 | Module anatomy: Fastify plugin per module, module-owned tables, public interfaces                                                                                                                                                                                      | SSOT ARCH-013..020                          |        |
| DEC-ARC-004 | Zod-first contracts; generated OpenAPI 3.1 and AsyncAPI; breaking-change gate                                                                                                                                                                                          | ADR-005, ADR-T08                            |        |
| DEC-ARC-005 | Central authorization policy package with obligations                                                                                                                                                                                                                  | ADR-T07                                     |        |
| DEC-ARC-006 | HttpOnly cookie sessions with server-side session records                                                                                                                                                                                                              | supersedes ADR-004 token transport; ADR-T06 |        |
| DEC-ARC-007 | In-house identity broker for social login, enterprise SSO, passkeys, SCIM                                                                                                                                                                                              | SSOT ADR-001                                |        |
| DEC-ARC-008 | Shared-schema row-level tenancy; RLS enforced under a non-bypass role                                                                                                                                                                                                  | SSOT ADR-003, ADR-008, ADR-010; ADR-T21     |        |
| DEC-ARC-009 | Transactional outbox, dispatcher and consumer inbox; no broker yet                                                                                                                                                                                                     | SSOT ADR-009, ADR-013; ADR-T09              |        |
| DEC-ARC-010 | Fenced-lease job engine evolving `background_jobs`                                                                                                                                                                                                                     | ADR-008, INVARIANT-012                      |        |
| DEC-ARC-011 | Realtime gateway process; signals only                                                                                                                                                                                                                                 | SSOT ADR-004                                |        |
| DEC-ARC-012 | Search behind `SearchPort` on PostgreSQL FTS, trigram and vectors                                                                                                                                                                                                      | ADR-T11                                     |        |
| DEC-ARC-013 | Object storage and media provider ports; quarantine and scan                                                                                                                                                                                                           | SSOT ADR-007, ADR-011                       |        |
| DEC-ARC-014 | AI gateway is the only path to models                                                                                                                                                                                                                                  | ADR-007, SSOT §16, ADR-T12                  |        |
| DEC-ARC-015 | Isolated, network-less code runner as a separate service                                                                                                                                                                                                               | ADR-T13                                     |        |
| DEC-ARC-016 | Cache strategy: CDN and HTTP first, in-process reference cache, Redis at trigger                                                                                                                                                                                       | SSOT CON-014                                |        |
| DEC-ARC-017 | Typed configuration; runtime config table; targeted flags separate from entitlements                                                                                                                                                                                   | as-built migration 00051                    |        |
| DEC-ARC-018 | REST API with two audiences, RFC 9457 errors, cursor pagination, idempotency keys, ETags                                                                                                                                                                               | ADR-006, SSOT CON-001..016, ADR-T08         |        |
| DEC-ARC-019 | OpenTelemetry end-to-end tracing including through the outbox                                                                                                                                                                                                          | ADR-T16                                     |        |
| DEC-ARC-020 | Web client: feature modules, bundled lazy routes, server-state cache layer                                                                                                                                                                                             | SSOT A.6, ADR-T23                           |        |
| DEC-ARC-021 | Provider-agnostic adapter pattern with contract test suites                                                                                                                                                                                                            | as-built email service                      |        |
| DEC-ARC-022 | Erasure by design: `subject_ref` in append-only history, participants per module                                                                                                                                                                                       | V61-19                                      |        |
| DEC-ARC-023 | Stateless containers on a managed platform; managed PostgreSQL                                                                                                                                                                                                         | ADR-T04; deploy assets                      |        |
| DEC-ARC-024 | Single home region with residency-ready columns                                                                                                                                                                                                                        | V61-27                                      |        |
| DEC-ARC-025 | Partner API and outbound webhooks for integrators                                                                                                                                                                                                                      | SSOT CON-007, PLT module                    |        |
| DEC-ARC-026 | Secret manager plus envelope encryption for per-tenant credentials and PII fields                                                                                                                                                                                      | SSOT §15.5                                  |        |

## DEPENDENCY_REGISTER.md

_Former file: `PRODUCT_BLUEPRINT/09_REGISTERS/DEPENDENCY_REGISTER.md`._

<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

## Dependency Register

Module-level dependency counts are extracted from each feature's `Dependencies` field (cross-module `FR-` references only). Row depends on column. See also [`../01_PRODUCT/07_MODULE_MAP_AND_DEPENDENCIES.md`](../01_PRODUCT.md#07--module-map-and-dependencies).

| from \ to | ADM | AIC | ANL | ASM | ATS | BGV | BIL | EMP | ENT | EVD | EVT | GIG | IDN | INS | INT | JOB | LRN | MEN | MKT | MSG | NET | NTF | PLT | PRF | PWA | REP | SET | SRC | STU | TSF |
| --------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **ADM**   |     |     | 1   |     |     |     | 1   |     |     | 1   |     |     | 2   |     |     | 1   | 1   |     |     |     |     |     | 16  |     | 1   |     | 2   |     |     |     |
| **AIC**   |     |     |     |     |     |     |     |     |     | 1   |     |     |     |     |     |     | 1   |     |     |     |     |     | 2   |     |     |     | 1   |     |     | 1   |
| **ANL**   |     |     |     |     |     |     |     |     |     |     |     |     | 1   |     |     | 1   | 1   |     |     |     | 1   | 2   |     |     | 2   |     | 2   | 1   |     |     |
| **ASM**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 2   |     |     |     |     |     |     |     | 1   |     |     |     | 4   |     |
| **ATS**   |     |     |     |     |     |     |     | 13  |     |     |     |     |     |     | 4   | 20  |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **BGV**   |     |     |     |     |     |     |     |     |     | 3   |     |     |     |     |     |     |     |     |     |     |     |     |     | 1   |     |     |     |     |     |     |
| **BIL**   |     |     |     |     |     |     |     |     |     |     |     |     |     | 2   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **EMP**   |     |     |     |     | 13  |     |     |     |     | 1   |     |     |     |     | 2   | 11  |     |     |     |     |     |     |     |     |     |     |     | 2   |     | 2   |
| **ENT**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 1   |     |     |     |     |     |     |     |     |     |     |     |
| **EVD**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 3   |     |     |     | 2   |     |     |
| **EVT**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **GIG**   |     |     |     |     |     |     | 10  |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **IDN**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 8   |     |     |     |     | 8   |     |     |     |
| **INS**   |     |     |     |     |     |     | 2   | 1   |     |     |     |     |     |     |     |     | 1   |     |     |     |     | 1   |     |     |     |     | 1   |     |     | 2   |
| **INT**   |     |     |     |     | 13  |     |     | 1   |     |     |     |     |     |     |     | 4   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **JOB**   | 1   | 2   |     |     | 24  |     |     | 5   |     |     |     |     |     |     | 4   |     | 1   |     | 5   | 2   |     | 1   | 1   |     |     |     |     |     |     |     |
| **LRN**   |     |     |     | 17  |     |     |     |     |     |     | 1   |     |     |     |     |     |     |     | 2   |     | 1   |     | 1   |     |     |     |     |     | 44  | 1   |
| **MEN**   |     |     |     |     |     |     | 6   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **MKT**   |     |     |     |     |     |     |     | 1   |     |     |     |     |     |     |     | 1   | 2   |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **MSG**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 2   |     |     |     |     |     |     |     |     | 4   |
| **NET**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 3   |
| **NTF**   | 2   | 1   | 1   |     |     |     |     |     |     |     |     |     | 1   |     |     | 1   |     |     |     |     |     |     |     |     |     |     | 2   |     |     |     |
| **PLT**   | 15  |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **PRF**   |     |     |     |     |     | 1   |     |     |     | 8   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 5   |     |     |
| **PWA**   | 8   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 14  |     |     |     |     |     |     |     |
| **REP**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 2   |     |     |     |     | 6   |     |     |     |
| **SET**   |     |     |     |     |     |     |     |     |     |     |     |     | 12  |     |     |     |     |     |     |     |     | 3   |     |     |     |     |     |     |     |     |
| **SRC**   |     |     |     |     |     | 1   |     |     |     | 9   |     |     |     |     |     |     |     |     | 1   |     |     |     |     | 3   |     | 2   | 1   |     |     |     |
| **STU**   |     |     |     | 10  |     |     |     |     |     |     |     |     |     |     |     |     | 44  |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **TSF**   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     | 2   | 1   |     |     |     |     |     |     |     |     |     |

### Most depended-on modules

| Module | Inbound references | Outbound references |
| ------ | ------------------ | ------------------- |
| LRN    | 53                 | 67                  |
| ATS    | 50                 | 37                  |
| STU    | 48                 | 54                  |
| JOB    | 39                 | 46                  |
| PLT    | 34                 | 15                  |
| ASM    | 27                 | 7                   |
| ADM    | 26                 | 26                  |
| EVD    | 23                 | 5                   |
| SET    | 23                 | 15                  |
| EMP    | 21                 | 31                  |
| BIL    | 19                 | 2                   |
| NTF    | 17                 | 8                   |
| IDN    | 16                 | 16                  |
| TSF    | 13                 | 3                   |
| INT    | 10                 | 18                  |
| SRC    | 10                 | 17                  |
| MKT    | 9                  | 4                   |
| PRF    | 7                  | 14                  |
| NET    | 5                  | 3                   |
| MSG    | 4                  | 6                   |
| PWA    | 4                  | 22                  |
| AIC    | 3                  | 6                   |
| ANL    | 2                  | 11                  |
| BGV    | 2                  | 4                   |
| INS    | 2                  | 8                   |
| REP    | 2                  | 8                   |
| EVT    | 1                  | 0                   |
| ENT    | 0                  | 1                   |
| GIG    | 0                  | 10                  |
| MEN    | 0                  | 6                   |

### Feature-level cross-module dependencies

| Feature    | Depends on                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ADM-002 | FR-PLT-021                                                                                                                                     |
| FR-ADM-015 | FR-PLT-039                                                                                                                                     |
| FR-ADM-018 | FR-PWA-014                                                                                                                                     |
| FR-ADM-020 | FR-PLT-030, FR-PLT-031                                                                                                                         |
| FR-ADM-029 | FR-PLT-030, FR-PLT-036                                                                                                                         |
| FR-ADM-032 | FR-PLT-039                                                                                                                                     |
| FR-ADM-034 | FR-PLT-037, FR-PLT-039                                                                                                                         |
| FR-ADM-036 | FR-PLT-034, FR-PLT-038                                                                                                                         |
| FR-ADM-037 | FR-PLT-039, FR-PLT-040                                                                                                                         |
| FR-ADM-039 | FR-PLT-026, FR-PLT-039                                                                                                                         |
| FR-ADM-040 | FR-ANL-007, FR-BIL-005, FR-EVD-018, FR-IDN-001, FR-IDN-021, FR-JOB-001, FR-LRN-001, FR-PLT-036, FR-SET-009, FR-SET-020                         |
| FR-AIC-029 | FR-TSF-025                                                                                                                                     |
| FR-AIC-035 | FR-EVD-007, FR-LRN-005, FR-PLT-016, FR-PLT-041, FR-SET-029                                                                                     |
| FR-ANL-037 | FR-IDN-022, FR-JOB-010, FR-LRN-007, FR-NET-017, FR-NTF-028, FR-NTF-033, FR-PWA-011, FR-PWA-014, FR-SET-013, FR-SET-022, FR-SRC-001             |
| FR-ASM-016 | FR-STU-029                                                                                                                                     |
| FR-ASM-020 | FR-STU-030                                                                                                                                     |
| FR-ASM-023 | FR-LRN-043                                                                                                                                     |
| FR-ASM-027 | FR-STU-031                                                                                                                                     |
| FR-ASM-045 | FR-LRN-071                                                                                                                                     |
| FR-ASM-056 | FR-STU-048                                                                                                                                     |
| FR-ASM-059 | FR-PWA-013                                                                                                                                     |
| FR-ATS-001 | FR-EMP-010, FR-EMP-013, FR-EMP-014                                                                                                             |
| FR-ATS-002 | FR-EMP-014                                                                                                                                     |
| FR-ATS-004 | FR-EMP-004                                                                                                                                     |
| FR-ATS-007 | FR-JOB-018, FR-JOB-019                                                                                                                         |
| FR-ATS-008 | FR-EMP-002, FR-JOB-036                                                                                                                         |
| FR-ATS-009 | FR-EMP-026                                                                                                                                     |
| FR-ATS-010 | FR-JOB-035, FR-JOB-040                                                                                                                         |
| FR-ATS-011 | FR-INT-001                                                                                                                                     |
| FR-ATS-012 | FR-JOB-019                                                                                                                                     |
| FR-ATS-013 | FR-JOB-023                                                                                                                                     |
| FR-ATS-015 | FR-JOB-028                                                                                                                                     |
| FR-ATS-017 | FR-JOB-020                                                                                                                                     |
| FR-ATS-022 | FR-JOB-029                                                                                                                                     |
| FR-ATS-026 | FR-INT-002                                                                                                                                     |
| FR-ATS-027 | FR-INT-029                                                                                                                                     |
| FR-ATS-028 | FR-EMP-011, FR-EMP-012                                                                                                                         |
| FR-ATS-030 | FR-INT-034                                                                                                                                     |
| FR-ATS-031 | FR-JOB-041                                                                                                                                     |
| FR-ATS-032 | FR-JOB-041                                                                                                                                     |
| FR-ATS-034 | FR-JOB-023                                                                                                                                     |
| FR-ATS-035 | FR-EMP-017, FR-EMP-018, FR-JOB-024                                                                                                             |
| FR-ATS-038 | FR-EMP-026, FR-JOB-031, FR-JOB-032                                                                                                             |
| FR-ATS-039 | FR-JOB-032                                                                                                                                     |
| FR-ATS-040 | FR-EMP-025                                                                                                                                     |
| FR-ATS-041 | FR-JOB-035                                                                                                                                     |
| FR-ATS-042 | FR-JOB-018                                                                                                                                     |
| FR-ATS-045 | FR-JOB-042                                                                                                                                     |
| FR-BGV-004 | FR-PRF-032                                                                                                                                     |
| FR-BGV-005 | FR-EVD-016, FR-EVD-022                                                                                                                         |
| FR-BGV-006 | FR-EVD-008                                                                                                                                     |
| FR-BIL-024 | FR-INS-010, FR-INS-012                                                                                                                         |
| FR-EMP-005 | FR-JOB-039                                                                                                                                     |
| FR-EMP-006 | FR-JOB-003                                                                                                                                     |
| FR-EMP-008 | FR-JOB-001                                                                                                                                     |
| FR-EMP-012 | FR-ATS-028                                                                                                                                     |
| FR-EMP-014 | FR-ATS-002, FR-ATS-037                                                                                                                         |
| FR-EMP-015 | FR-ATS-044, FR-ATS-047, FR-INT-021                                                                                                             |
| FR-EMP-017 | FR-ATS-035                                                                                                                                     |
| FR-EMP-018 | FR-ATS-035                                                                                                                                     |
| FR-EMP-021 | FR-JOB-026                                                                                                                                     |
| FR-EMP-022 | FR-ATS-046, FR-JOB-035                                                                                                                         |
| FR-EMP-026 | FR-ATS-009, FR-ATS-038, FR-ATS-040                                                                                                             |
| FR-EMP-029 | FR-JOB-036                                                                                                                                     |
| FR-EMP-030 | FR-INT-013, FR-JOB-036                                                                                                                         |
| FR-EMP-032 | FR-JOB-010, FR-JOB-039                                                                                                                         |
| FR-EMP-033 | FR-ATS-044, FR-ATS-045, FR-JOB-040                                                                                                             |
| FR-EMP-034 | FR-JOB-025, FR-SRC-006, FR-SRC-025, FR-TSF-012                                                                                                 |
| FR-EMP-035 | FR-EVD-008, FR-TSF-018                                                                                                                         |
| FR-ENT-007 | FR-MKT-001                                                                                                                                     |
| FR-EVD-002 | FR-PRF-007, FR-SRC-030                                                                                                                         |
| FR-EVD-006 | FR-PRF-029                                                                                                                                     |
| FR-EVD-007 | FR-PRF-010                                                                                                                                     |
| FR-EVD-027 | FR-SRC-030                                                                                                                                     |
| FR-GIG-003 | FR-BIL-029                                                                                                                                     |
| FR-GIG-007 | FR-BIL-022                                                                                                                                     |
| FR-GIG-009 | FR-BIL-003, FR-BIL-022                                                                                                                         |
| FR-GIG-018 | FR-BIL-016, FR-BIL-028, FR-BIL-029                                                                                                             |
| FR-GIG-021 | FR-BIL-014, FR-BIL-029                                                                                                                         |
| FR-GIG-025 | FR-BIL-016                                                                                                                                     |
| FR-IDN-001 | FR-SET-028                                                                                                                                     |
| FR-IDN-002 | FR-NTF-007                                                                                                                                     |
| FR-IDN-003 | FR-NTF-013                                                                                                                                     |
| FR-IDN-004 | FR-SET-028                                                                                                                                     |
| FR-IDN-007 | FR-NTF-007                                                                                                                                     |
| FR-IDN-012 | FR-NTF-029                                                                                                                                     |
| FR-IDN-018 | FR-NTF-029                                                                                                                                     |
| FR-IDN-019 | FR-NTF-029, FR-SET-002                                                                                                                         |
| FR-IDN-020 | FR-NTF-029                                                                                                                                     |
| FR-IDN-025 | FR-NTF-007                                                                                                                                     |
| FR-IDN-027 | FR-SET-015, FR-SET-018                                                                                                                         |
| FR-IDN-029 | FR-SET-032                                                                                                                                     |
| FR-IDN-031 | FR-SET-013                                                                                                                                     |
| FR-IDN-032 | FR-SET-028                                                                                                                                     |
| FR-INS-010 | FR-BIL-024                                                                                                                                     |
| FR-INS-011 | FR-BIL-024                                                                                                                                     |
| FR-INS-033 | FR-EMP-002, FR-LRN-008, FR-NTF-028, FR-SET-005, FR-TSF-001, FR-TSF-008                                                                         |
| FR-INT-001 | FR-ATS-011, FR-ATS-026                                                                                                                         |
| FR-INT-002 | FR-ATS-026                                                                                                                                     |
| FR-INT-007 | FR-JOB-030                                                                                                                                     |
| FR-INT-008 | FR-JOB-030                                                                                                                                     |
| FR-INT-009 | FR-JOB-030                                                                                                                                     |
| FR-INT-013 | FR-JOB-027                                                                                                                                     |
| FR-INT-015 | FR-ATS-012                                                                                                                                     |
| FR-INT-016 | FR-EMP-013                                                                                                                                     |
| FR-INT-023 | FR-ATS-027                                                                                                                                     |
| FR-INT-025 | FR-ATS-047                                                                                                                                     |
| FR-INT-028 | FR-ATS-027, FR-ATS-048                                                                                                                         |
| FR-INT-029 | FR-ATS-027, FR-ATS-041                                                                                                                         |
| FR-INT-030 | FR-ATS-019, FR-ATS-027                                                                                                                         |
| FR-INT-033 | FR-ATS-044                                                                                                                                     |
| FR-JOB-006 | FR-ATS-004                                                                                                                                     |
| FR-JOB-007 | FR-ATS-004, FR-ATS-006                                                                                                                         |
| FR-JOB-018 | FR-ATS-007                                                                                                                                     |
| FR-JOB-019 | FR-ATS-007, FR-ATS-047                                                                                                                         |
| FR-JOB-023 | FR-ATS-013                                                                                                                                     |
| FR-JOB-024 | FR-ATS-035                                                                                                                                     |
| FR-JOB-026 | FR-ATS-020, FR-ATS-022                                                                                                                         |
| FR-JOB-027 | FR-ATS-020, FR-INT-013                                                                                                                         |
| FR-JOB-028 | FR-ATS-015                                                                                                                                     |
| FR-JOB-029 | FR-ATS-022, FR-ATS-023                                                                                                                         |
| FR-JOB-030 | FR-INT-008, FR-INT-009, FR-INT-032                                                                                                             |
| FR-JOB-031 | FR-ATS-036, FR-ATS-038, FR-ATS-039                                                                                                             |
| FR-JOB-032 | FR-ATS-036                                                                                                                                     |
| FR-JOB-035 | FR-ATS-010, FR-ATS-041                                                                                                                         |
| FR-JOB-036 | FR-EMP-002, FR-EMP-029                                                                                                                         |
| FR-JOB-037 | FR-EMP-009                                                                                                                                     |
| FR-JOB-039 | FR-EMP-005                                                                                                                                     |
| FR-JOB-040 | FR-ATS-010                                                                                                                                     |
| FR-JOB-041 | FR-ATS-032                                                                                                                                     |
| FR-JOB-042 | FR-ATS-045                                                                                                                                     |
| FR-JOB-043 | FR-MKT-019, FR-MKT-021, FR-MKT-034                                                                                                             |
| FR-JOB-044 | FR-ADM-025, FR-AIC-004, FR-AIC-007, FR-MKT-019, FR-MKT-021, FR-MSG-013                                                                         |
| FR-JOB-045 | FR-ATS-040, FR-EMP-015, FR-LRN-022, FR-MSG-013, FR-NTF-028, FR-PLT-031                                                                         |
| FR-LRN-002 | FR-STU-007                                                                                                                                     |
| FR-LRN-008 | FR-STU-014                                                                                                                                     |
| FR-LRN-009 | FR-STU-008, FR-STU-041                                                                                                                         |
| FR-LRN-010 | FR-ASM-011, FR-STU-013                                                                                                                         |
| FR-LRN-011 | FR-STU-002, FR-STU-004, FR-STU-016                                                                                                             |
| FR-LRN-012 | FR-STU-019                                                                                                                                     |
| FR-LRN-015 | FR-STU-033, FR-STU-034                                                                                                                         |
| FR-LRN-017 | FR-STU-034                                                                                                                                     |
| FR-LRN-019 | FR-STU-033                                                                                                                                     |
| FR-LRN-021 | FR-STU-037                                                                                                                                     |
| FR-LRN-022 | FR-STU-019                                                                                                                                     |
| FR-LRN-024 | FR-STU-031                                                                                                                                     |
| FR-LRN-027 | FR-STU-022                                                                                                                                     |
| FR-LRN-029 | FR-STU-022                                                                                                                                     |
| FR-LRN-030 | FR-STU-023                                                                                                                                     |
| FR-LRN-031 | FR-STU-023                                                                                                                                     |
| FR-LRN-035 | FR-STU-009, FR-STU-022                                                                                                                         |
| FR-LRN-037 | FR-STU-024                                                                                                                                     |
| FR-LRN-038 | FR-STU-028                                                                                                                                     |
| FR-LRN-039 | FR-STU-024                                                                                                                                     |
| FR-LRN-040 | FR-STU-027                                                                                                                                     |
| FR-LRN-041 | FR-STU-010, FR-STU-011                                                                                                                         |
| FR-LRN-042 | FR-ASM-005, FR-ASM-016, FR-ASM-029, FR-ASM-030, FR-ASM-040, FR-STU-029                                                                         |
| FR-LRN-043 | FR-ASM-003, FR-ASM-011, FR-ASM-012, FR-ASM-023, FR-ASM-025                                                                                     |
| FR-LRN-044 | FR-ASM-020, FR-ASM-033, FR-STU-030, FR-STU-031                                                                                                 |
| FR-LRN-045 | FR-ASM-020, FR-STU-032                                                                                                                         |
| FR-LRN-046 | FR-STU-030, FR-STU-031                                                                                                                         |
| FR-LRN-047 | FR-STU-047                                                                                                                                     |
| FR-LRN-048 | FR-STU-041                                                                                                                                     |
| FR-LRN-049 | FR-STU-013                                                                                                                                     |
| FR-LRN-050 | FR-STU-043                                                                                                                                     |
| FR-LRN-053 | FR-STU-044                                                                                                                                     |
| FR-LRN-058 | FR-ASM-043, FR-STU-042                                                                                                                         |
| FR-LRN-062 | FR-STU-031                                                                                                                                     |
| FR-LRN-064 | FR-STU-045                                                                                                                                     |
| FR-LRN-071 | FR-ASM-045                                                                                                                                     |
| FR-LRN-073 | FR-ASM-018                                                                                                                                     |
| FR-LRN-075 | FR-STU-026, FR-STU-050                                                                                                                         |
| FR-LRN-076 | FR-EVT-006, FR-MKT-007, FR-MKT-012, FR-NET-025, FR-PLT-043, FR-TSF-001                                                                         |
| FR-MEN-003 | FR-BIL-029                                                                                                                                     |
| FR-MEN-009 | FR-BIL-016, FR-BIL-028, FR-BIL-029                                                                                                             |
| FR-MEN-019 | FR-BIL-028                                                                                                                                     |
| FR-MEN-026 | FR-BIL-016                                                                                                                                     |
| FR-MKT-037 | FR-EMP-005, FR-JOB-008, FR-LRN-005, FR-LRN-025                                                                                                 |
| FR-MSG-013 | FR-NET-010                                                                                                                                     |
| FR-MSG-017 | FR-TSF-013, FR-TSF-015                                                                                                                         |
| FR-MSG-018 | FR-NET-006, FR-TSF-001                                                                                                                         |
| FR-MSG-027 | FR-TSF-027                                                                                                                                     |
| FR-NET-014 | FR-TSF-014                                                                                                                                     |
| FR-NET-034 | FR-TSF-013, FR-TSF-018                                                                                                                         |
| FR-NTF-013 | FR-IDN-003                                                                                                                                     |
| FR-NTF-015 | FR-SET-020                                                                                                                                     |
| FR-NTF-021 | FR-SET-020                                                                                                                                     |
| FR-NTF-033 | FR-ADM-015, FR-ADM-024, FR-AIC-008, FR-ANL-037, FR-JOB-025                                                                                     |
| FR-PLT-005 | FR-ADM-016                                                                                                                                     |
| FR-PLT-021 | FR-ADM-007                                                                                                                                     |
| FR-PLT-022 | FR-ADM-035                                                                                                                                     |
| FR-PLT-026 | FR-ADM-039                                                                                                                                     |
| FR-PLT-027 | FR-ADM-010                                                                                                                                     |
| FR-PLT-028 | FR-ADM-010                                                                                                                                     |
| FR-PLT-033 | FR-ADM-033                                                                                                                                     |
| FR-PLT-034 | FR-ADM-009                                                                                                                                     |
| FR-PLT-036 | FR-ADM-029                                                                                                                                     |
| FR-PLT-038 | FR-ADM-036                                                                                                                                     |
| FR-PLT-039 | FR-ADM-015, FR-ADM-037                                                                                                                         |
| FR-PLT-040 | FR-ADM-019, FR-ADM-037                                                                                                                         |
| FR-PLT-042 | FR-ADM-032                                                                                                                                     |
| FR-PRF-005 | FR-EVD-008                                                                                                                                     |
| FR-PRF-007 | FR-SRC-014, FR-SRC-030                                                                                                                         |
| FR-PRF-009 | FR-EVD-015, FR-EVD-016                                                                                                                         |
| FR-PRF-010 | FR-EVD-007                                                                                                                                     |
| FR-PRF-013 | FR-SRC-020                                                                                                                                     |
| FR-PRF-016 | FR-SRC-021, FR-SRC-022                                                                                                                         |
| FR-PRF-029 | FR-EVD-006, FR-EVD-007                                                                                                                         |
| FR-PRF-032 | FR-BGV-004, FR-EVD-001, FR-EVD-018                                                                                                             |
| FR-PWA-001 | FR-PLT-036                                                                                                                                     |
| FR-PWA-004 | FR-ADM-015                                                                                                                                     |
| FR-PWA-005 | FR-ADM-016                                                                                                                                     |
| FR-PWA-010 | FR-ADM-018                                                                                                                                     |
| FR-PWA-014 | FR-PLT-007                                                                                                                                     |
| FR-PWA-015 | FR-PLT-007                                                                                                                                     |
| FR-PWA-019 | FR-ADM-018                                                                                                                                     |
| FR-PWA-020 | FR-PLT-034, FR-PLT-035                                                                                                                         |
| FR-PWA-021 | FR-PLT-016                                                                                                                                     |
| FR-PWA-022 | FR-PLT-039                                                                                                                                     |
| FR-PWA-027 | FR-PLT-035, FR-PLT-036                                                                                                                         |
| FR-PWA-028 | FR-PLT-030, FR-PLT-031                                                                                                                         |
| FR-PWA-029 | FR-PLT-030                                                                                                                                     |
| FR-PWA-031 | FR-ADM-030                                                                                                                                     |
| FR-PWA-032 | FR-PLT-002, FR-PLT-004                                                                                                                         |
| FR-PWA-038 | FR-ADM-015, FR-ADM-016                                                                                                                         |
| FR-PWA-039 | FR-ADM-039                                                                                                                                     |
| FR-REP-002 | FR-SET-015                                                                                                                                     |
| FR-REP-011 | FR-SET-020                                                                                                                                     |
| FR-REP-012 | FR-NTF-015, FR-NTF-017                                                                                                                         |
| FR-REP-015 | FR-SET-003                                                                                                                                     |
| FR-REP-016 | FR-SET-031                                                                                                                                     |
| FR-REP-021 | FR-SET-005, FR-SET-006                                                                                                                         |
| FR-SET-001 | FR-IDN-022                                                                                                                                     |
| FR-SET-008 | FR-NTF-001                                                                                                                                     |
| FR-SET-013 | FR-IDN-015                                                                                                                                     |
| FR-SET-014 | FR-IDN-015                                                                                                                                     |
| FR-SET-015 | FR-IDN-015, FR-IDN-027                                                                                                                         |
| FR-SET-020 | FR-NTF-015, FR-NTF-021                                                                                                                         |
| FR-SET-024 | FR-IDN-015                                                                                                                                     |
| FR-SET-027 | FR-IDN-029                                                                                                                                     |
| FR-SET-028 | FR-IDN-001, FR-IDN-032                                                                                                                         |
| FR-SET-030 | FR-IDN-015                                                                                                                                     |
| FR-SET-031 | FR-IDN-023                                                                                                                                     |
| FR-SET-032 | FR-IDN-029                                                                                                                                     |
| FR-SRC-004 | FR-PRF-013                                                                                                                                     |
| FR-SRC-021 | FR-EVD-026, FR-PRF-013                                                                                                                         |
| FR-SRC-023 | FR-BGV-004, FR-EVD-001                                                                                                                         |
| FR-SRC-035 | FR-EVD-004, FR-EVD-005, FR-EVD-007, FR-EVD-013, FR-EVD-014, FR-EVD-027, FR-EVD-030, FR-MKT-005, FR-PRF-016, FR-REP-023, FR-REP-024, FR-SET-006 |
| FR-STU-004 | FR-LRN-011                                                                                                                                     |
| FR-STU-007 | FR-LRN-002                                                                                                                                     |
| FR-STU-009 | FR-LRN-036                                                                                                                                     |
| FR-STU-011 | FR-LRN-041                                                                                                                                     |
| FR-STU-012 | FR-LRN-005, FR-LRN-071                                                                                                                         |
| FR-STU-013 | FR-LRN-049, FR-LRN-058                                                                                                                         |
| FR-STU-014 | FR-LRN-008                                                                                                                                     |
| FR-STU-016 | FR-LRN-011                                                                                                                                     |
| FR-STU-019 | FR-LRN-012                                                                                                                                     |
| FR-STU-020 | FR-LRN-026                                                                                                                                     |
| FR-STU-022 | FR-LRN-029                                                                                                                                     |
| FR-STU-023 | FR-LRN-030, FR-LRN-031                                                                                                                         |
| FR-STU-024 | FR-LRN-037, FR-LRN-039                                                                                                                         |
| FR-STU-027 | FR-LRN-040                                                                                                                                     |
| FR-STU-028 | FR-LRN-038                                                                                                                                     |
| FR-STU-029 | FR-ASM-016, FR-ASM-017, FR-ASM-018, FR-ASM-021, FR-LRN-042                                                                                     |
| FR-STU-030 | FR-ASM-019, FR-ASM-020, FR-LRN-044, FR-LRN-049                                                                                                 |
| FR-STU-031 | FR-ASM-027, FR-ASM-033, FR-LRN-044, FR-LRN-062                                                                                                 |
| FR-STU-032 | FR-ASM-020, FR-LRN-045                                                                                                                         |
| FR-STU-033 | FR-LRN-015                                                                                                                                     |
| FR-STU-034 | FR-LRN-015, FR-LRN-017                                                                                                                         |
| FR-STU-037 | FR-LRN-021                                                                                                                                     |
| FR-STU-041 | FR-LRN-001                                                                                                                                     |
| FR-STU-042 | FR-LRN-058, FR-LRN-071                                                                                                                         |
| FR-STU-043 | FR-LRN-050                                                                                                                                     |
| FR-STU-044 | FR-LRN-053                                                                                                                                     |
| FR-STU-045 | FR-LRN-064, FR-LRN-065                                                                                                                         |
| FR-STU-046 | FR-LRN-016, FR-LRN-055                                                                                                                         |
| FR-STU-047 | FR-LRN-047, FR-LRN-048                                                                                                                         |
| FR-STU-048 | FR-ASM-056, FR-LRN-055                                                                                                                         |
| FR-STU-049 | FR-LRN-075                                                                                                                                     |
| FR-STU-051 | FR-LRN-030                                                                                                                                     |
| FR-STU-053 | FR-LRN-064                                                                                                                                     |
| FR-TSF-027 | FR-MSG-027, FR-NET-037                                                                                                                         |
| FR-TSF-028 | FR-MSG-029                                                                                                                                     |

## FEATURES_BY_RELEASE_TIER.md

_Former file: `PRODUCT_BLUEPRINT/09_REGISTERS/FEATURES_BY_RELEASE_TIER.md`._

<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

## Features by Release Tier

Tiers follow dependencies, not dates. See [`../08_ROADMAP/`](../08_ROADMAP.md).

| Tier        | Features | Must | Should | Could |
| ----------- | -------- | ---- | ------ | ----- |
| R0          | 42       | 41   | 1      | 0     |
| R1          | 214      | 172  | 39     | 3     |
| R2          | 306      | 191  | 103    | 12    |
| R3          | 167      | 94   | 60     | 13    |
| R4          | 190      | 61   | 88     | 41    |
| R5          | 84       | 23   | 38     | 22    |
| R6          | 135      | 68   | 47     | 20    |
| unspecified | 6        | 0    | 0      | 0     |

| Module | R0  | R1  | R2  | R3  | R4  | R5  | R6  | unspecified |
| ------ | --- | --- | --- | --- | --- | --- | --- | ----------- |
| ADM    | 9   | 24  | 5   | 0   | 1   | 1   | 0   | 0           |
| AIC    | 0   | 0   | 0   | 0   | 34  | 1   | 0   | 0           |
| ANL    | 0   | 7   | 17  | 3   | 7   | 2   | 1   | 0           |
| ASM    | 0   | 9   | 3   | 24  | 20  | 0   | 3   | 0           |
| ATS    | 0   | 0   | 38  | 0   | 4   | 6   | 0   | 0           |
| BGV    | 0   | 0   | 0   | 0   | 26  | 5   | 0   | 0           |
| BIL    | 0   | 4   | 0   | 1   | 1   | 27  | 0   | 0           |
| EMP    | 0   | 0   | 16  | 0   | 7   | 12  | 0   | 0           |
| ENT    | 0   | 0   | 0   | 0   | 0   | 0   | 32  | 0           |
| EVD    | 0   | 3   | 17  | 11  | 2   | 1   | 0   | 0           |
| EVT    | 0   | 0   | 0   | 0   | 0   | 0   | 38  | 0           |
| GIG    | 0   | 0   | 0   | 0   | 0   | 0   | 30  | 2           |
| IDN    | 9   | 14  | 6   | 1   | 1   | 0   | 0   | 1           |
| INS    | 0   | 0   | 0   | 28  | 0   | 4   | 0   | 1           |
| INT    | 0   | 0   | 20  | 7   | 7   | 0   | 0   | 0           |
| JOB    | 0   | 4   | 34  | 0   | 7   | 0   | 0   | 0           |
| LRN    | 0   | 35  | 2   | 23  | 12  | 3   | 1   | 0           |
| MEN    | 0   | 0   | 0   | 0   | 1   | 0   | 26  | 1           |
| MKT    | 0   | 4   | 0   | 0   | 27  | 6   | 0   | 0           |
| MSG    | 0   | 13  | 16  | 2   | 0   | 2   | 0   | 0           |
| NET    | 0   | 7   | 14  | 1   | 12  | 2   | 0   | 1           |
| NTF    | 7   | 12  | 10  | 1   | 1   | 2   | 0   | 0           |
| PLT    | 0   | 13  | 21  | 5   | 1   | 1   | 2   | 0           |
| PRF    | 0   | 33  | 3   | 0   | 0   | 0   | 0   | 0           |
| PWA    | 11  | 13  | 11  | 3   | 0   | 0   | 1   | 0           |
| REP    | 0   | 8   | 15  | 6   | 1   | 0   | 1   | 0           |
| SET    | 6   | 9   | 10  | 4   | 1   | 2   | 0   | 0           |
| SRC    | 0   | 0   | 24  | 7   | 3   | 1   | 0   | 0           |
| STU    | 0   | 0   | 0   | 39  | 8   | 6   | 0   | 0           |
| TSF    | 0   | 2   | 24  | 1   | 6   | 0   | 0   | 0           |

## INTEGRITY_REPORT.md

_Former file: `PRODUCT_BLUEPRINT/09_REGISTERS/INTEGRITY_REPORT.md`._

<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

## Integrity Report

Generated consistency checks. A dangling reference means an id is mentioned but not defined in any blueprint file; most are legitimate references to legacy or planned items and should be reviewed, not auto-fixed.

- Defined ids: 6821
- Duplicate definitions: 0
- Dangling references: 2

### Dangling references

| ID          | Referenced in                              |
| ----------- | ------------------------------------------ |
| BR-XXX-000  | 00_START_HERE/CONVENTIONS.md               |
| SCR-XXX-000 | 03_EXPERIENCE/07_SCREEN_STATE_CHECKLIST.md |

## JOURNEY_REGISTER.md

_Former file: `PRODUCT_BLUEPRINT/09_REGISTERS/JOURNEY_REGISTER.md`._

<!-- Generated from 01_PRODUCT/05_USER_JOURNEYS.md headings. Do not edit by hand; edit the source and regenerate. -->

## Journey Register

End-to-end user journeys. Each journey is specified in [`../01_PRODUCT/05_USER_JOURNEYS.md`](../01_PRODUCT.md#05--user-journeys) with starting conditions, steps, system responses, alternatives, failures and completion conditions.

**Total: 78.**

| ID         | Journey                                                                | Actor group                                                 |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| JRN-GUE-01 | Find a public job and sign up to apply                                 | Guest journeys                                              |
| JRN-GUE-02 | Verify a credential from a shared link                                 | Guest journeys                                              |
| JRN-GUE-03 | Referee confirms a work-history claim from a single-use link           | Guest journeys                                              |
| JRN-GUE-04 | Preview a course and register to enroll                                | Guest journeys                                              |
| JRN-CAN-01 | Register, confirm email and reach first value                          | Candidate journeys                                          |
| JRN-CAN-02 | Import a résumé and build a profile with field visibility              | Candidate journeys                                          |
| JRN-CAN-03 | Add a work-history claim and request referee verification              | Candidate journeys                                          |
| JRN-CAN-04 | Set a career goal, see the gap and accept a learning plan              | Candidate journeys                                          |
| JRN-CAN-05 | Enroll, learn, complete a course and receive completion evidence       | Candidate journeys                                          |
| JRN-CAN-06 | Take a timed assessment under AI-prohibited mode and earn a credential | Candidate journeys                                          |
| JRN-CAN-07 | Search jobs, read the match explanation and apply                      | Candidate journeys                                          |
| JRN-CAN-08 | Track an application, self-schedule an interview and attend            | Candidate journeys                                          |
| JRN-CAN-09 | Receive an offer, accept it, and the outcome becomes new evidence      | Candidate journeys                                          |
| JRN-CAN-10 | Respond to a recruiter first-contact request                           | Candidate journeys                                          |
| JRN-CAN-11 | Review consents and revoke an employer share                           | Candidate journeys                                          |
| JRN-CAN-12 | Export data, then delete the account                                   | Candidate journeys                                          |
| JRN-CAN-13 | Recover access after losing password and passkey                       | Candidate journeys                                          |
| JRN-CAN-14 | Dispute a verification outcome                                         | Candidate journeys                                          |
| JRN-CAN-15 | Ask a connection for a referral                                        | Candidate journeys                                          |
| JRN-CAN-16 | Upgrade to a paid plan, hit a quota and cancel                         | Candidate journeys                                          |
| JRN-CAN-17 | Tailor a résumé variant for a job with the AI assistant                | Candidate journeys                                          |
| JRN-CAN-18 | Benchmark salary before negotiating                                    | Candidate journeys                                          |
| JRN-CAN-19 | Use the app offline and sync drafts                                    | Candidate journeys                                          |
| JRN-CAN-20 | Consent to and review a background check                               | Candidate journeys                                          |
| JRN-CAN-21 | Appeal a moderation takedown                                           | Candidate journeys                                          |
| JRN-CAN-22 | Register for a hackathon, form a team, submit and receive results      | Candidate journeys                                          |
| JRN-STD-01 | Claim an institution-provisioned account                               | Student journeys                                            |
| JRN-STD-02 | Complete an assigned course with a peer-reviewed assignment            | Student journeys                                            |
| JRN-STD-03 | Apply through a campus placement drive                                 | Student journeys                                            |
| JRN-STD-04 | Graduate and move to an independent career identity                    | Student journeys                                            |
| JRN-INS-01 | Apply to teach and get approved                                        | Instructor journeys                                         |
| JRN-INS-02 | Author, submit and publish a course                                    | Instructor journeys                                         |
| JRN-INS-03 | Grade submissions and attest learner skills                            | Instructor journeys                                         |
| JRN-INS-04 | Run a faculty batch and intervene with at-risk learners                | Instructor journeys                                         |
| JRN-MNT-01 | Become a mentor and publish availability                               | Mentor journeys (gated `OD-PRD-02`)                         |
| JRN-MNT-02 | Run a booked session with notes and follow-up                          | Mentor journeys (gated `OD-PRD-02`)                         |
| JRN-MNT-03 | Handle a mentee no-show and refund                                     | Mentor journeys (gated `OD-PRD-02`)                         |
| JRN-FRL-01 | Turn on gig mode and publish a service offering                        | Freelancer journeys (gated `OD-PRD-02`, `OD-PRD-03`)        |
| JRN-FRL-02 | Win a project, deliver milestones and get paid                         | Freelancer journeys (gated `OD-PRD-02`, `OD-PRD-03`)        |
| JRN-FRL-03 | Dispute an unpaid milestone                                            | Freelancer journeys (gated `OD-PRD-02`, `OD-PRD-03`)        |
| JRN-REC-01 | Accept an org invite and set up the workspace                          | Recruiter journeys                                          |
| JRN-REC-02 | Open a requisition, get approval and publish a job                     | Recruiter journeys                                          |
| JRN-REC-03 | Screen applicants with evidence and move or reject                     | Recruiter journeys                                          |
| JRN-REC-04 | Search discoverable candidates and send outreach                       | Recruiter journeys                                          |
| JRN-REC-05 | Schedule a panel interview loop                                        | Recruiter journeys                                          |
| JRN-REC-06 | Prepare an offer through the approval chain                            | Recruiter journeys                                          |
| JRN-REC-07 | Agency recruiter submits a candidate to a client                       | Recruiter journeys                                          |
| JRN-REC-08 | Participate in a campus placement drive                                | Recruiter journeys                                          |
| JRN-HMG-01 | Define role requirements, scorecard and assessment                     | Hiring manager journeys                                     |
| JRN-HMG-02 | Review a candidate packet and submit a blind scorecard                 | Hiring manager journeys                                     |
| JRN-HMG-03 | Run the debrief, decide and record a post-hire outcome                 | Hiring manager journeys                                     |
| JRN-EAD-01 | Create and verify an employer organization                             | Employer admin journeys                                     |
| JRN-EAD-02 | Invite members, assign roles and enforce SSO                           | Employer admin journeys                                     |
| JRN-EAD-03 | Buy seats, survive a failed payment, downgrade                         | Employer admin journeys                                     |
| JRN-EAD-04 | Offboard a member and run an access review                             | Employer admin journeys                                     |
| JRN-EAD-05 | Publish the brand page and respond to reviews                          | Employer admin journeys                                     |
| JRN-IAD-01 | Set up an institution, buy a licence and provision a cohort            | Institution admin journeys                                  |
| JRN-IAD-02 | Read cohort skill coverage without seeing private data                 | Institution admin journeys                                  |
| JRN-IAD-03 | Issue institution credentials and correct one                          | Institution admin journeys                                  |
| JRN-PLO-01 | Organize a placement drive with employers                              | Placement officer journeys                                  |
| JRN-PLO-02 | Produce the placement outcome report                                   | Placement officer journeys                                  |
| JRN-EXA-01 | Launch internal mobility and post an internal role                     | Enterprise talent journeys (gated `OD-PRD-02`, `OD-PRD-20`) |
| JRN-EXA-02 | Assign mandatory learning and track completion                         | Enterprise talent journeys (gated `OD-PRD-02`, `OD-PRD-20`) |
| JRN-EXA-03 | Run a skills inventory and gap report                                  | Enterprise talent journeys (gated `OD-PRD-02`, `OD-PRD-20`) |
| JRN-MOD-01 | Work the report queue and take down content                            | Moderator journeys                                          |
| JRN-MOD-02 | Decide an appeal as a second moderator                                 | Moderator journeys                                          |
| JRN-MOD-03 | Review an assessment integrity flag                                    | Moderator journeys                                          |
| JRN-SUP-01 | Resolve a ticket with time-boxed scoped access                         | Support agent journeys                                      |
| JRN-SUP-02 | Assist an identity-proofed account recovery                            | Support agent journeys                                      |
| JRN-FIN-01 | Process a refund and a chargeback                                      | Finance operator journeys                                   |
| JRN-FIN-02 | Run monthly reconciliation and a payout batch                          | Finance operator journeys                                   |
| JRN-PAD-01 | Roll out a feature flag and use the kill switch                        | Platform admin journeys                                     |
| JRN-PAD-02 | Change the skill taxonomy safely                                       | Platform admin journeys                                     |
| JRN-PAD-03 | Grant a privileged role with two-person approval                       | Platform admin journeys                                     |
| JRN-SAD-01 | Use break-glass access during an incident                              | Security officer journeys                                   |
| JRN-SAD-02 | Respond to a suspected cross-tenant exposure                           | Security officer journeys                                   |
| JRN-API-01 | Partner ATS syncs jobs and applications through the public API         | Integration principal journeys                              |
| JRN-API-02 | Webhook delivery fails, retries and is replayed                        | Integration principal journeys                              |

## STATE_MACHINE_REGISTER.md

_Former file: `PRODUCT_BLUEPRINT/09_REGISTERS/STATE_MACHINE_REGISTER.md`._

<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

## State Machine Register

State machines declared per module. Transitions and guards are in the owning module file section 6.

**Total: 224.**

### ADM

Source: [02_MODULES/ADM_Admin_Console_Support_Operations.md](../02_MODULES/ADM_Admin_Console_Support_Operations.md)

| ID        | Name                                                     |
| --------- | -------------------------------------------------------- |
| SM-ADM-01 | Support ticket                                           |
| SM-ADM-02 | Privileged grant (including break-glass)                 |
| SM-ADM-03 | Approval request (two-person)                            |
| SM-ADM-04 | Impersonation (view-as) session                          |
| SM-ADM-05 | Incident                                                 |
| SM-ADM-06 | Announcement and maintenance window                      |
| SM-ADM-07 | Content version (CMS page, legal document, help article) |
| SM-ADM-08 | Data request case (staff handling)                       |
| SM-ADM-09 | Feature flag lifecycle                                   |
| SM-ADM-10 | Administrative account state                             |

### AIC

Source: [02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md](../02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md)

| ID        | Name                              |
| --------- | --------------------------------- |
| SM-AIC-01 | AI request                        |
| SM-AIC-02 | Recommendation                    |
| SM-AIC-03 | Model version                     |
| SM-AIC-04 | Assistant session                 |
| SM-AIC-05 | AI suggestion (apply with review) |
| SM-AIC-06 | AI incident                       |

### ANL

Source: [02_MODULES/ANL_Analytics_Reporting_Insights.md](../02_MODULES/ANL_Analytics_Reporting_Insights.md)

| ID        | Name                |
| --------- | ------------------- |
| SM-ANL-01 | Metric definition   |
| SM-ANL-02 | Dashboard           |
| SM-ANL-03 | Scheduled report    |
| SM-ANL-04 | Export job          |
| SM-ANL-05 | Experiment          |
| SM-ANL-06 | Data access request |
| SM-ANL-07 | Alert               |

### ASM

Source: [02_MODULES/ASM_Assessments_Challenges_Integrity.md](../02_MODULES/ASM_Assessments_Challenges_Integrity.md)

| ID        | Name                 |
| --------- | -------------------- |
| SM-ASM-01 | Attempt              |
| SM-ASM-02 | Assessment version   |
| SM-ASM-03 | Question item        |
| SM-ASM-04 | Judge job            |
| SM-ASM-05 | Integrity case       |
| SM-ASM-06 | Appeal               |
| SM-ASM-07 | Certification record |
| SM-ASM-08 | Exam registration    |
| SM-ASM-09 | Contest              |
| SM-ASM-10 | Employer assignment  |
| SM-ASM-11 | Manual grading task  |
| SM-ASM-12 | Accommodation grant  |

### ATS

Source: [02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md](../02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md)

| ID        | Name                     |
| --------- | ------------------------ |
| SM-ATS-01 | Requisition              |
| SM-ATS-02 | Job posting              |
| SM-ATS-03 | Offer                    |
| SM-ATS-04 | Scorecard                |
| SM-ATS-05 | Talent pool membership   |
| SM-ATS-06 | Candidate rights request |
| SM-ATS-07 | Approval request         |

### BGV

Source: [02_MODULES/BGV_Verification_Background_Checks.md](../02_MODULES/BGV_Verification_Background_Checks.md)

| ID        | Name                            |
| --------- | ------------------------------- |
| SM-BGV-01 | Check request                   |
| SM-BGV-02 | Check item                      |
| SM-BGV-03 | Adjudication and adverse action |
| SM-BGV-04 | Identity verification session   |
| SM-BGV-05 | Candidate dispute               |
| SM-BGV-06 | Reference check (per referee)   |

### BIL

Source: [02_MODULES/BIL_Billing_Plans_Entitlements.md](../02_MODULES/BIL_Billing_Plans_Entitlements.md)

| ID        | Name                          |
| --------- | ----------------------------- |
| SM-BIL-01 | Subscription                  |
| SM-BIL-02 | Invoice                       |
| SM-BIL-03 | Dunning case                  |
| SM-BIL-04 | Refund                        |
| SM-BIL-05 | Coupon                        |
| SM-BIL-06 | Seat pool                     |
| SM-BIL-07 | Purchase request              |
| SM-BIL-08 | Enterprise quote and contract |
| SM-BIL-09 | Webhook event                 |
| SM-BIL-10 | Payout                        |
| SM-BIL-11 | Dispute (chargeback)          |
| SM-BIL-12 | Reconciliation run            |

### EMP

Source: [02_MODULES/EMP_Employer_Organisation_Teams_Brand.md](../02_MODULES/EMP_Employer_Organisation_Teams_Brand.md)

| ID        | Name                       |
| --------- | -------------------------- |
| SM-EMP-01 | Organisation               |
| SM-EMP-02 | Membership and invitation  |
| SM-EMP-03 | Agency-client relationship |
| SM-EMP-04 | Employer review            |
| SM-EMP-05 | Webhook endpoint           |
| SM-EMP-06 | Data processing agreement  |
| SM-EMP-07 | Company claim              |
| SM-EMP-08 | Sanction and appeal        |

### ENT

Source: [02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md](../02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md)

| ID        | Name                              |
| --------- | --------------------------------- |
| SM-ENT-01 | Enterprise workspace              |
| SM-ENT-02 | Enterprise member (employee link) |
| SM-ENT-03 | Internal posting                  |
| SM-ENT-04 | Internal application              |
| SM-ENT-05 | Learning assignment               |
| SM-ENT-06 | Talent review cycle               |
| SM-ENT-07 | Skill inventory entry             |
| SM-ENT-08 | Learning request                  |

### EVD

Source: [02_MODULES/EVD_Evidence_Work_History_Credentials.md](../02_MODULES/EVD_Evidence_Work_History_Credentials.md)

| ID        | Name                              |
| --------- | --------------------------------- |
| SM-EVD-01 | Evidence rung (per claim)         |
| SM-EVD-02 | Work history verification request |
| SM-EVD-03 | Credential lifecycle              |
| SM-EVD-04 | Dispute                           |
| SM-EVD-05 | Evidence share link               |
| SM-EVD-06 | Endorsement                       |

### EVT

Source: [02_MODULES/EVT_Events_Hackathons_Community_Programmes.md](../02_MODULES/EVT_Events_Hackathons_Community_Programmes.md)

| ID        | Name                 |
| --------- | -------------------- |
| SM-EVT-01 | Event lifecycle      |
| SM-EVT-02 | Registration         |
| SM-EVT-03 | Hackathon            |
| SM-EVT-04 | Hackathon team       |
| SM-EVT-05 | Hackathon submission |
| SM-EVT-06 | Career-fair booth    |

### GIG

Source: [02_MODULES/GIG_Freelance_Contract_Project_Work.md](../02_MODULES/GIG_Freelance_Contract_Project_Work.md)

| ID        | Name               |
| --------- | ------------------ |
| SM-GIG-01 | Freelancer mode    |
| SM-GIG-02 | Project listing    |
| SM-GIG-03 | Proposal           |
| SM-GIG-04 | Contract           |
| SM-GIG-05 | Milestone          |
| SM-GIG-06 | Change request     |
| SM-GIG-07 | Dispute            |
| SM-GIG-08 | Time entry (gated) |

### IDN

Source: [02_MODULES/IDN_Identity_Authentication_Account.md](../02_MODULES/IDN_Identity_Authentication_Account.md)

| ID        | Name                    |
| --------- | ----------------------- |
| SM-IDN-01 | Account                 |
| SM-IDN-02 | Session family          |
| SM-IDN-03 | Recovery request        |
| SM-IDN-04 | Organization invitation |
| SM-IDN-05 | Impersonation grant     |

### INS

Source: [02_MODULES/INS_Institutions_Managed_Learning.md](../02_MODULES/INS_Institutions_Managed_Learning.md)

| ID        | Name                         |
| --------- | ---------------------------- |
| SM-INS-01 | Institution tenant lifecycle |
| SM-INS-02 | Import batch                 |
| SM-INS-03 | Student membership           |
| SM-INS-04 | Seat assignment              |
| SM-INS-05 | Placement drive              |
| SM-INS-06 | Drive application            |
| SM-INS-07 | Intervention case            |
| SM-INS-08 | Guardian consent             |
| SM-INS-09 | Graduation transition        |
| SM-INS-10 | Placement outcome            |

### INT

Source: [02_MODULES/INT_Interviews_Scheduling.md](../02_MODULES/INT_Interviews_Scheduling.md)

| ID        | Name                       |
| --------- | -------------------------- |
| SM-INT-01 | Interview                  |
| SM-INT-02 | Scheduling invitation      |
| SM-INT-03 | Room session               |
| SM-INT-04 | Recording artifact         |
| SM-INT-05 | Async interview invitation |
| SM-INT-06 | Feedback request           |
| SM-INT-07 | Accommodation request      |
| SM-INT-08 | Calendar connection        |

### JOB

Source: [02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md](../02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md)

| ID        | Name                                      |
| --------- | ----------------------------------------- |
| SM-JOB-01 | Application (candidate-visible lifecycle) |
| SM-JOB-02 | Application draft                         |
| SM-JOB-03 | Job report                                |
| SM-JOB-04 | Saved search alert subscription           |
| SM-JOB-05 | Imported listing                          |

### LRN

Source: [02_MODULES/LRN_Learning_Course_Experience.md](../02_MODULES/LRN_Learning_Course_Experience.md)

| ID        | Name                    |
| --------- | ----------------------- |
| SM-LRN-01 | Enrollment              |
| SM-LRN-02 | Lesson progress         |
| SM-LRN-03 | Certificate             |
| SM-LRN-04 | Assignment submission   |
| SM-LRN-05 | Review                  |
| SM-LRN-06 | Path enrollment         |
| SM-LRN-07 | Offline license         |
| SM-LRN-08 | Live session attendance |
| SM-LRN-09 | Q&A thread              |
| SM-LRN-10 | Playback session        |

### MEN

Source: [02_MODULES/MEN_Mentorship_Coaching_Career_Services.md](../02_MODULES/MEN_Mentorship_Coaching_Career_Services.md)

| ID        | Name                                                   |
| --------- | ------------------------------------------------------ |
| SM-MEN-01 | Mentor application and listing                         |
| SM-MEN-02 | Mentorship request                                     |
| SM-MEN-03 | Session                                                |
| SM-MEN-04 | Mentorship relationship                                |
| SM-MEN-05 | Program                                                |
| SM-MEN-06 | Program pairing                                        |
| SM-MEN-07 | Service order (resume review, mock interview, package) |
| SM-MEN-08 | Safeguarding report                                    |

### MKT

Source: [02_MODULES/MKT_Market_Intelligence_Career_Pathing.md](../02_MODULES/MKT_Market_Intelligence_Career_Pathing.md)

| ID        | Name                                 |
| --------- | ------------------------------------ |
| SM-MKT-01 | Skill lifecycle                      |
| SM-MKT-02 | Taxonomy version                     |
| SM-MKT-03 | Salary report                        |
| SM-MKT-04 | Emerging skill candidate             |
| SM-MKT-05 | Dataset snapshot (published insight) |
| SM-MKT-06 | Dispute                              |
| SM-MKT-07 | Career transition record             |

### MSG

Source: [02_MODULES/MSG_Messaging_Realtime_Communication.md](../02_MODULES/MSG_Messaging_Realtime_Communication.md)

| ID        | Name                           |
| --------- | ------------------------------ |
| SM-MSG-01 | Message                        |
| SM-MSG-02 | Conversation (per participant) |
| SM-MSG-03 | Message request                |
| SM-MSG-04 | Recruiter outreach             |
| SM-MSG-05 | Group membership               |
| SM-MSG-06 | Realtime connection (client)   |

### NET

Source: [02_MODULES/NET_Networking_Community_Referrals.md](../02_MODULES/NET_Networking_Community_Referrals.md)

| ID        | Name                   |
| --------- | ---------------------- |
| SM-NET-01 | Connection request     |
| SM-NET-02 | Connection             |
| SM-NET-03 | Post                   |
| SM-NET-04 | Group membership       |
| SM-NET-05 | Referral request       |
| SM-NET-06 | Written recommendation |
| SM-NET-07 | Introduction request   |
| SM-NET-08 | Group                  |

### NTF

Source: [02_MODULES/NTF_Notifications_Communication.md](../02_MODULES/NTF_Notifications_Communication.md)

| ID        | Name                                         |
| --------- | -------------------------------------------- |
| SM-NTF-01 | Delivery (one notification on one channel)   |
| SM-NTF-02 | Template version                             |
| SM-NTF-03 | Admin broadcast                              |
| SM-NTF-04 | Channel endpoint (push device or SMS number) |

### PLT

Source: [02_MODULES/PLT_Platform_API_Integrations_Media_Files.md](../02_MODULES/PLT_Platform_API_Integrations_Media_Files.md)

| ID        | Name                                |
| --------- | ----------------------------------- |
| SM-PLT-01 | Webhook delivery                    |
| SM-PLT-02 | Webhook endpoint                    |
| SM-PLT-03 | Integration connection              |
| SM-PLT-04 | Stored file                         |
| SM-PLT-05 | Media asset processing              |
| SM-PLT-06 | Background job                      |
| SM-PLT-07 | API credential (key, client secret) |
| SM-PLT-08 | Import run                          |
| SM-PLT-09 | Developer application               |
| SM-PLT-10 | Export run                          |
| SM-PLT-11 | API version                         |

### PRF

Source: [02_MODULES/PRF_Profile_Resume_Portfolio.md](../02_MODULES/PRF_Profile_Resume_Portfolio.md)

| ID        | Name                                                       |
| --------- | ---------------------------------------------------------- |
| SM-PRF-01 | Profile publication                                        |
| SM-PRF-02 | Resume share link                                          |
| SM-PRF-03 | Document job (resume parse, resume export, profile import) |
| SM-PRF-04 | Recommendation                                             |
| SM-PRF-05 | Open-to-work signal                                        |

### PWA

Source: [02_MODULES/PWA_PWA_Offline_Mobile_Extension.md](../02_MODULES/PWA_PWA_Offline_Mobile_Extension.md)

| ID        | Name                                          |
| --------- | --------------------------------------------- |
| SM-PWA-01 | Service worker and update lifecycle           |
| SM-PWA-02 | Install state (per device and account)        |
| SM-PWA-03 | Draft and outbox item                         |
| SM-PWA-04 | Push permission and subscription (per device) |
| SM-PWA-05 | Connectivity                                  |
| SM-PWA-06 | Extension pairing                             |
| SM-PWA-07 | Native wrapper decision                       |

### REP

Source: [02_MODULES/REP_Gamification_Reputation.md](../02_MODULES/REP_Gamification_Reputation.md)

| ID        | Name                               |
| --------- | ---------------------------------- |
| SM-REP-01 | XP event evaluation                |
| SM-REP-02 | Badge award                        |
| SM-REP-03 | Streak                             |
| SM-REP-04 | Integrity case                     |
| SM-REP-05 | Season                             |
| SM-REP-06 | Gamification configuration version |

### SET

Source: [02_MODULES/SET_Settings_Privacy_Consent.md](../02_MODULES/SET_Settings_Privacy_Consent.md)

| ID        | Name                                                                                |
| --------- | ----------------------------------------------------------------------------------- |
| SM-SET-01 | Data request (export, erasure, rectification, restriction, objection, human review) |
| SM-SET-02 | Consent grant (per scope and grantee)                                               |
| SM-SET-03 | Export archive                                                                      |
| SM-SET-04 | Legal hold                                                                          |
| SM-SET-05 | API token and app grant                                                             |

### SRC

Source: [02_MODULES/SRC_Search_Discovery.md](../02_MODULES/SRC_Search_Discovery.md)

| ID        | Name                       |
| --------- | -------------------------- |
| SM-SRC-01 | Saved search               |
| SM-SRC-02 | Index version              |
| SM-SRC-03 | Taxonomy skill             |
| SM-SRC-04 | Ranking or synonym release |
| SM-SRC-05 | Index document             |

### STU

Source: [02_MODULES/STU_Instructor_Studio_Content_Production.md](../02_MODULES/STU_Instructor_Studio_Content_Production.md)

| ID        | Name                     |
| --------- | ------------------------ |
| SM-STU-01 | Course                   |
| SM-STU-02 | Course version           |
| SM-STU-03 | Instructor application   |
| SM-STU-04 | Media asset              |
| SM-STU-05 | Publish review case      |
| SM-STU-06 | Payout                   |
| SM-STU-07 | Coupon                   |
| SM-STU-08 | Copyright case           |
| SM-STU-09 | Grading task             |
| SM-STU-10 | Co-instructor invitation |

### TSF

Source: [02_MODULES/TSF_Trust_Safety_Moderation.md](../02_MODULES/TSF_Trust_Safety_Moderation.md)

| ID        | Name                                                     |
| --------- | -------------------------------------------------------- |
| SM-TSF-01 | Report                                                   |
| SM-TSF-02 | Moderation case                                          |
| SM-TSF-03 | Appeal                                                   |
| SM-TSF-04 | Sanction                                                 |
| SM-TSF-05 | Content moderation status                                |
| SM-TSF-06 | Legal request                                            |
| SM-TSF-07 | Fraud investigation (employer, job, credential, network) |
| SM-TSF-08 | Evidence hold                                            |

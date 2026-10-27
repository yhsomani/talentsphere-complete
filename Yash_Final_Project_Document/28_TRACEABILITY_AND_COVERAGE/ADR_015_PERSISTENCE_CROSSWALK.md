# ADR-015 Persistence Crosswalk

Doc ID: TRC-18 · Status: Candidate mapping; not approved · Source: DOC-000133, docs/engineering/adr/ADR-015-core-loop-persistence.md.

The source ADR is dated 2026-10-10 and says “Accepted for this branch, pending owner ratification.” It describes the branch implementation decision to persist core-loop writes in PostgreSQL while retaining a boot-hydrated Map read model. The target blueprint's ADR-T05 selects PostgreSQL for all reads and writes, without an in-process Map read model. This is a current-implementation versus target-design difference; neither statement is silently substituted for the other.

The row-level source anchors and dispositions are in [ADR_015_PERSISTENCE_CROSSWALK.csv](ADR_015_PERSISTENCE_CROSSWALK.csv), EVD-003073 through EVD-003082.

## Reconciliation

- The ADR's write sequence is commit first, then update the Map read model. It also records per-record base checks, database predicates, and a 409 conflict response. The design explicitly says these guards prevent selected lost updates but do not prevent stale reads between API writers.
- The ADR's operating constraint is one API process per database, guarded by a PostgreSQL session advisory lock; startup refuses a second writer, and lock loss makes the API unhealthy. Out-of-band SQL changes require restart and rehydration. Boot hydration grows with core data; the ADR's exit path is SQL reads and removal of Maps before scaling replicas.
- The ADR's entity scope grew across migrations 00043, 00044 and 00046 and a later messaging addition. Its route durability statements and test results belong to that dated branch and do not establish current coverage or hosted deployment state.
- Migration 00043 includes consequential uniqueness, foreign-key and token-storage changes. The ADR requires owner ratification before applying those changes to populated data and flags duplicate case-insensitive emails. The 2026-10-23 repository audit (DOC-000171) (`31_LEGACY_ARCHIVE/docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`, removed 2026-10-27; recover with `git show 85706db0:Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`) separately reports the hosted identity/schema mismatch at §A line 18, 52 local migrations at §B line 35, and migration/single-writer blockers at §D lines 69-70 and §E lines 79-82. These are dated audit statements, not current external-state verification.
- Target ADR-T05 remains the blueprint's proposed SQL-only system-of-record decision. OPEN-52 now asks the architecture, database and platform owners to approve a compatible migration/implementation bridge, acceptance evidence, and the point at which single-writer operation may be retired.

## Review limits

This was a full read of the ADR and a documentation cross-check against current architecture notes, target ADR-T05, data/migration documents, readiness and the later repository audit. I did not inspect migration SQL, rerun PostgreSQL tests, check CI, query a hosted database, or verify the current deployment. No implementation or migration status is upgraded by this crosswalk.

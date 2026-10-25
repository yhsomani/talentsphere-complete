# Database Migration Policy (Target)

Doc ID: DB-04 · Owner: Database Architecture + Release Engineering · Version 1.0 · Status: Under Review · Relates: FF-10, ADR-T05, ADR-T18, INV-T03, INV-T04 · Companions: DB-02, DB-03, MIG-DATA-01, BE-01

Tags: **[TARGET]** policy · **[OPEN]** open · **[REF]** reference. The reference repository's migration runner (`scripts/migrate.mjs`, `migration-integrity` checks, 55 numbered files) is **[REF]**: its contiguity/checksum idea is kept, the rest is re-specified. Nothing here has been executed.

## 1. Principles
1. **Append-only.** An applied migration file is never edited, renamed or deleted. Fixes are new migrations. Enforced by checksum (FF-10).
2. **Contiguous and ordered.** Versions are zero-padded integers `00001…` with no gaps and no duplicates (FF-10). Parallel branches that collide are renumbered *before* merge, never after release.
3. **Forward-only in practice.** Prefer forward-fix over down-migrations; every migration still documents how to recover (§5).
4. **Compatible with the previous app release.** Schema N must work with application N-1 and N (expand/contract, §3), so deploys and rollbacks of the application never require a schema rollback.
5. **Reviewed like code, tested like code**: every migration has an owner module, a risk assessment and CI evidence (§7).
6. **No data and schema mixing.** Backfills are separate, resumable, throttled jobs (§4.3), not DML inside DDL migrations.

## 2. File format and metadata
Path `supabase/migrations`-equivalent (final directory name decided with the build team; the reference location is **[REF]**): `db/migrations/NNNNN_<kebab-description>.sql`. Migrations that cannot run in a transaction (`CREATE INDEX CONCURRENTLY`, `ALTER TYPE ... ADD VALUE` where used) are `NNNNN_<name>.nontx.sql` and must be idempotent (`IF NOT EXISTS`).

Mandatory header (parsed by the lint):
```sql
-- migration: 00123
-- title: add reference_request partial unique index
-- class: expand            -- expand | backfill | contract | repair | seed
-- owner: api/verification
-- adr/inv: BR-T004, INV-T05
-- risk: low                -- low | medium | high (high needs DBA approval)
-- locks: none (CONCURRENTLY); lock_timeout 2s
-- rls-impact: none         -- or: new table, policies rls_x_*
-- data-class: C3 (referee_email_hash)   -- required for new columns on C2+ tables
-- rollback: R0 drop index uq_reference_pending
-- compat: app N-1 unaffected
-- est-rows: 2.1M
-- verified-on: staging snapshot 2026-xx-xx, 41s
```
Rollback/forward-fix categories: **R0** reversible by dropping the added object; **R1** forward-fix only (data changed; describe the corrective migration or job); **R2** irreversible (contract phase; requires backup point reference and approval).

## 3. Expand / backfill / contract
| Phase | Release | Allowed | Forbidden |
|---|---|---|---|
| Expand (class `expand`) | N | Add tables, nullable columns, columns with constant defaults, new indexes (concurrently), new constraints `NOT VALID`, new enum values (via CHECK replacement), new functions/triggers/views, new RLS policies, new partitions | Drop/rename anything; tighten constraints on existing data; change column type in place |
| Dual write / read-switch (application) | N | App writes old and new shapes; reads prefer new with fallback; feature flag governs the switch | Reading new shape exclusively before backfill complete |
| Backfill (class `backfill` job) | N | Batched, throttled, resumable, idempotent population; verification query proves completeness | Single large UPDATE; holding locks > lock_timeout |
| Validate | N+ | `VALIDATE CONSTRAINT`; then `SET NOT NULL` using the validated CHECK | Skipping validation |
| Contract (class `contract`) | N+1 or later, after N-1 is fully retired (all API replicas, workers, and any rollback target) | Drop old columns/tables/indexes, drop dual-write code first, remove old CHECK values | Running before the code that reads the old shape is gone (CI check against code search for column names) |
Rename = add new + dual write + backfill + switch + drop old. Type change = new column of new type, same pattern.

Remote/shell independence: the database is hidden behind the API, so remote releases (ADR-T18) are not blocked by schema changes; the API contract diff (FF-06) is the compatibility gate. Remote manifests declare `dataSchema`/`apiRange`; a migration that requires an API breaking change is a two-release sequence announced in the deprecation window (API-STD §3).

## 4. Zero-downtime rules
### 4.1 Lock and timeout discipline
Every migration session sets `SET lock_timeout = '2s'; SET statement_timeout = '15min'` (long backfills run elsewhere); on `lock_timeout` the runner retries with jittered backoff (max 5 attempts) and then fails the deploy rather than queueing behind a long transaction and blocking all traffic. Migrations run during normal hours with metrics on lock waits; no maintenance window is assumed [TARGET].

### 4.2 Operation playbook
| Operation | Safe pattern | Notes |
|---|---|---|
| Add column | `ADD COLUMN x type NULL` or with constant `DEFAULT` (metadata-only on modern PostgreSQL) | Volatile defaults rewrite the table: forbidden |
| Make column NOT NULL | `ADD CONSTRAINT ck CHECK (x IS NOT NULL) NOT VALID` -> `VALIDATE CONSTRAINT` -> `SET NOT NULL` -> drop CHECK | Validate scans without blocking writes |
| Add FK | `ADD FOREIGN KEY ... NOT VALID` -> `VALIDATE CONSTRAINT`; index on FK column first (concurrently) | |
| Add index | `CREATE INDEX CONCURRENTLY IF NOT EXISTS`; check for `INVALID` indexes after failure and drop/retry | Non-tx migration |
| Unique constraint on populated table | Build unique index concurrently, then `ADD CONSTRAINT ... USING INDEX` | |
| Drop index / column / table | Contract phase only; `DROP INDEX CONCURRENTLY`; `DROP COLUMN` after code has stopped reading for >= one release | |
| Add enum value | Replace CHECK: add new CHECK `NOT VALID` including the value, validate, drop old CHECK | no table rewrite |
| Change type / rename | New column + dual write + backfill + switch + drop (§3) | |
| Create table | Create with RLS enabled, policies, grants, indexes in the same migration (lint-enforced) | |
| Partitioned tables | Create partition ahead of use; attach with `NOT VALID` CHECK then validate to avoid scans | |
| Large deletes | Batched `DELETE ... WHERE ctid IN (SELECT ... LIMIT n)` job with sleeps, or drop partitions | |
| Functions / `SECURITY DEFINER` | `CREATE OR REPLACE`; set `search_path` explicitly; owner = `ts_migrator`; revoke default `PUBLIC` execute | |
| Extensions | Added by DBA-approved migration only; version recorded | availability OPEN-B19 |

### 4.3 Backfill jobs
Kind `migration.backfill:<name>` on the job engine (BE-01 §7): processes keyset batches (default 1,000 rows, adjustable), commits per batch, records a cursor for resumability, throttles on replication lag and p95 latency of the primary, is idempotent (`WHERE new_col IS NULL`), supports pause/cancel, and ends by running its verification query (expected remaining = 0). Progress and ETA are visible in `/admin/jobs`. A backfill never holds locks across batches.

## 5. Rollback vs forward-fix
| Situation | Action |
|---|---|
| Migration fails mid-way (transactional) | Whole migration rolled back automatically; fix and re-run |
| Non-transactional migration partially applied | Idempotent re-run (`IF NOT EXISTS`); check/drop `INVALID` indexes |
| Application release bad | Roll back application only (schema is compatible by §1.4) |
| Schema change harmful but compatible | New forward migration (R0 drop / R1 corrective job) |
| Data corruption | Stop writes if needed; PITR to a side instance; compare; selective repair via a `repair` migration/job; full PITR restore is last resort and triggers the erasure-ledger replay (DB-03 §5.6) |
| Contract migration (R2) | Requires a verified backup/PITR point recorded in the migration header and explicit approval; run only after observation window of the previous expand/backfill |
Down migrations are not authored for data-bearing changes (they invite untested destructive paths). Reversible DDL-only changes may include a documented inverse in the header.

## 6. Runner behaviour
| Aspect | Rule |
|---|---|
| Ledger | `schema_migration(version, checksum, applied_at, applied_by, kind)`; checksum mismatch on any applied file aborts and pages |
| Concurrency | Single runner via `pg_advisory_lock`; deploys wait or fail fast, never run two |
| Role | Connects as `ts_migrator` with short-lived credentials from CI; the application roles cannot DDL |
| Order in deploy | 1) expand migrations 2) deploy workers + API (compatible) 3) backfills 4) flip flags 5) later release: contract migrations (separately gated) |
| Dry run | Executed in CI against a schema-only clone of production plus a data-sampled staging copy; DDL timings recorded; high-risk migrations require a rehearsal on production-sized data |
| Observability | Lock-wait, duration and error metrics per migration; deploy blocked if replication lag or long-running transactions exceed thresholds |
| Seeds | Reference data (taxonomy, plans, permissions registry) uses class `seed` migrations that are idempotent `INSERT ... ON CONFLICT DO UPDATE`, versioned, and never touch user data |

## 7. CI lints and tests (FF-10 and related)
| Check | Rule |
|---|---|
| Contiguity/immutability | No gaps/duplicates; checksum of applied files unchanged |
| Header | All fields present; `class` consistent with content |
| Statement policy | `expand` migrations contain no `DROP`, `RENAME`, `ALTER COLUMN TYPE`, `SET NOT NULL` on populated tables, non-concurrent `CREATE INDEX` on existing tables, or volatile defaults; `contract` must carry `-- destructive: approved-by <name>` |
| RLS (INV-T03) | Each new table in tenant/personal classes enables + forces RLS and declares policies, or is listed as P8 internal (DB-02 §6) |
| Data class | New columns on C2+ tables carry a data-class label registered in the column registry (DB-03) |
| Indexing | FK columns indexed; each new index names a query |
| Privileges | New table grants limited to module roles; protected columns (e.g. `evidence_item.rung`) not granted to `ts_app` (INV-T04) |
| Back-compat test | Previous release's integration suite runs against the migrated schema (N-1 compatibility) |
| RLS regression | DB-level cross-tenant canary (FF-05) runs after migrations |
| Migrate-from-empty and from-snapshot | Both paths must produce an identical schema dump (`pg_dump --schema-only` diff) |
| Parser | SQL parsed (libpg_query-class parser); unknown/unsafe constructs fail closed |

## 8. Governance
Approvers: owning module lead + DBA for any migration; security review for RLS/privilege/crypto changes; privacy lead for new C3 columns. Emergency (hotfix) migrations follow the same lints with a fast-track reviewer pair and a retrospective entry. A quarterly review lists R2 migrations and open expand-without-contract debt (columns/tables awaiting removal) so expand/contract does not rot.

## 9. Open items
| ID | Item |
|---|---|
| OPEN-B19 | Managed PostgreSQL vendor/version determines `uuidv7()`, `pg_partman` and extension availability |
| OPEN-B34 | Whether a maintenance window is acceptable for a rare high-risk R2 migration (policy default: no) |
| OPEN-B35 | Choice of migration runner (build vs adopt) — must satisfy §6-§7 regardless |

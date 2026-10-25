# Historical Migration Evidence Crosswalk

Doc ID: TRC-10 | Status: Historical evidence pointer map; owner review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../../docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/migrations` (51 records). The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The companion [CSV](AUDIT_MIGRATION_EVIDENCE_CROSSWALK.csv) gives each record a stable evidence ID (EVD-000797 through EVD-000847), source JSON pointer, recorded migration hash, current checkout hash, table names, recorded applied state, and candidate links to the target migration and physical-design documents.

## Verified snapshot facts

- All 51 referenced migration files exist in this checkout, and each file hash matches the hash recorded in the audit snapshot.
- The records list 112 table-name references in total; an empty table list remains empty.
- All 51 `appliedState` values say `unknown; no test/target database queried`.

## Limits and disposition

This verifies only the historical file identity against the current checkout. A hash match does not establish whether a migration ran, what data exists, whether a migration is safe, or whether the reference schema maps to the target design. Candidate destination links are for traceability, not approval or a one-to-one schema mapping. Database inventory and migration scope remain blocked by OPEN-17 and OPEN-B33. The JSON manifest remains partially processed; tests, probes, external issue records, and other nested evidence still require review. No source file was changed and no cleanup is authorized.

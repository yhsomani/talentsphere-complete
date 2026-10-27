# Historical Probe Evidence Crosswalk

Doc ID: TRC-12 | Status: Historical probe pointer map; verification review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/probes`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_PROBE_EVIDENCE_CROSSWALK.csv) preserves both probe records as EVD-002020 and EVD-002021, including method, result, and recorded limits.

## Interpretation

- `arbitrary challenge text` reports `status=passed` and `score=100` while also recording `executed=false` and `verification=unverified`. It is not a pass or verification result.
- `batch lease expiry` reports 6 jobs, 9 executions, and 3 duplicated jobs from a synthetic `MemoryJobStore` scenario with timing assumptions. It does not establish behavior with PostgreSQL or a live provider.

These are dated audit records, not current tests. No probe was rerun; the test strategy and failure analysis are candidate documentation destinations, not proof that their requirements are implemented.

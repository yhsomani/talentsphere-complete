# Historical Test Evidence Crosswalk

Doc ID: TRC-11 | Status: Historical test-record pointer map; owner review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/tests`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_TEST_EVIDENCE_CROSSWALK.csv) preserves all 1,172 recorded assertion names and statuses from 115 files as individual JSON-pointer rows (EVD-000848 through EVD-002019). It includes the recorded file status, feature IDs parsed from test names as candidate labels, and whether each historical path currently exists. Four assertion rows point to the one absent path, `tests/unit/transactional-mail.test.ts`.

## Historical record and limits

The snapshot records 1,172 passed, 0 failed, and 0 pending assertions in memory mode on 2026-10-21. These are historical claims from the audit JSON, not a current run or proof of browser, PostgreSQL, clean-build, deployment, security, or production behavior. Test names and embedded feature IDs do not establish semantic requirement coverage. The absent path's status is unresolved; no deletion or migration is inferred. Target TEST IDs and the target test strategy are design artifacts, not links proving execution.

This is a locator and preservation crosswalk. The JSON remains the detailed historical source; no application tests or source files were changed or run. DOC-000191 remains partially processed, and no cleanup is authorized.

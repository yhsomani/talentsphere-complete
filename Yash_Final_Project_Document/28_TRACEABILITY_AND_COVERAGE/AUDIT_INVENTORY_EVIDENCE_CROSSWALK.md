# Historical Audit Inventory Crosswalk

Doc ID: TRC-15 | Status: Inventory identity comparison; content review incomplete | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../../docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/inventory` (684 entries). The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_INVENTORY_EVIDENCE_CROSSWALK.csv) assigns EVD-002329 through EVD-003012 and records each path, historical hash, current hash, current presence, and original coverage label. The read-only comparison found 573 matching hashes, 108 different hashes, and 3 missing paths.

## Limits and disposition

The source calls every entry “Inventoried; not necessarily inspected.” The crosswalk verifies path/hash identity only; it does not inspect or preserve each file's material content, classify every path, or prove that a changed/missing file was deleted. It does not make a source eligible for cleanup. Continue using the original JSON for its detailed historical inventory, and complete file-by-file content classification and source-to-destination mapping before any cleanup decision. DOC-000191 remains partially processed.

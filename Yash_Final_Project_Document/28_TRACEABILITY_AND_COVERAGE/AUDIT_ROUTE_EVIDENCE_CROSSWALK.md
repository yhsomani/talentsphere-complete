# Historical Route Evidence Crosswalk

Doc ID: TRC-14 | Status: Historical route pointer map; semantic review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/routes`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_ROUTE_EVIDENCE_CROSSWALK.csv) links all 274 route records (EVD-002055 through EVD-002328) to the exact method/path entry in the 278-row observed API inventory. The recorded durability totals are 70 `registered durable (PG mode)`, 201 `ephemeral header`, and 3 `stateless`.

## Limits and disposition

All 274 method/path keys match one inventory row. Four inventory rows have no counterpart in this audit JSON route list; the broader API inventory documents those separately. The JSON route objects provide a line number but no source-file path, so that line is retained as reported metadata and not presented as a verified source anchor. The join establishes a route-string cross-reference only; it does not establish semantic equivalence with target APIs, feature presence or absence, current execution, persistence behavior, or owner approval. The audit index and JSON remain the detailed historical sources; current code/runtime was not revalidated.

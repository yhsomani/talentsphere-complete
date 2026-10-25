# Historical External Issue Evidence Crosswalk

Doc ID: TRC-13 | Status: Historical external-record pointer map; owner review required | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../../docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/remote`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK.csv) maps 9 pull-request snapshots, 7 issue snapshots, and all 17 issue comments to their JSON pointers (EVD-002022 through EVD-002054). It retains PR titles, recorded merge metadata, issue/comment URLs, snapshot states, and exact comment bodies with body hashes. Candidate destinations are the open-decision and review registers; no issue-to-OPEN/ADR mapping is asserted.

## Limits and disposition

All state values are from the 2026-10-21 audit snapshot. Current GitHub status, issue titles and initial bodies, acceptance criteria, and owner dispositions were not checked. The JSON has no issue title/body fields; a comment's content must not be treated as the complete issue requirement. No current state, approval, or closure is inferred. This crosswalk improves row-level discoverability and preserves the snapshot's comments; it does not replace source review or current-state verification. DOC-000191 remains partially processed and no cleanup is authorized.

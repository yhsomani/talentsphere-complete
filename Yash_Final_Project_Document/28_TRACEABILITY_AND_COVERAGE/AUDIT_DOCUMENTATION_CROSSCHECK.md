# Historical Documentation Cross-Check Map

Doc ID: TRC-16 | Status: Historical audit-to-manifest pointer map; content review incomplete | Date: 2026-10-25

**Source:** [`docs/reports/AUDIT_EVIDENCE_2026-10-21.json`](../../docs/reports/AUDIT_EVIDENCE_2026-10-21.json), `/documentationCrossCheck`. The source JSON remains unchanged; its SHA-256 is `5a851fdce1ceeac241133f3116efa2710f5d6dfb7c3c056abfad4141d8eff2a8`.

The [CSV](AUDIT_DOCUMENTATION_CROSSCHECK.csv) maps the 46 scanned-document records to their exact manifest DOC IDs and preserves the audit's category, disposition, link-scan flag, semantic-acceptance flag, and whether each path appears in the 24-item changed-since-snapshot list. It also records the two historical missing-deliverable paths, both still absent in the current checkout.

## Limits and disposition

The audit says its local link scan checked file targets, not heading anchors or external URLs, and explicitly did not certify whole-document semantic acceptance for these records. A manifest join establishes discoverability, not completeness or cleanup eligibility. The two missing paths (`project-maintenance.sh` and `scripts/tests/project-maintenance.test.sh`) are merely preserved as audit claims; their purpose and whether they should exist remain unresolved. No file was created or deleted. DOC-000191 and affected manifest source entries retain their existing processing statuses.

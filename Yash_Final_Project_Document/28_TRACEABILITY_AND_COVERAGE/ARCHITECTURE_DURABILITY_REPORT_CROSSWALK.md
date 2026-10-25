# Historical Architecture Durability Report Crosswalk

Doc ID: TRC-17 · Status: Candidate mapping; not approved · Source: [DOC-000158](../00_CONTROL_CENTRE/KNOWLEDGE_PRESERVATION_MANIFEST.csv), docs/reports/ARCHITECTURE_DURABILITY_REPORT.md.

This crosswalk maps the dated 2026-10-22 report at Git HEAD 83dc7d247efbd3b3c3312bf74ac49978d33e924 to the current target blueprint and later evidence. It records what the report asserted, where the subject belongs, and known conflicts. The report is evidence about that recorded revision, not a current security assessment, benchmark, production certification, or approval of its proposed fixes.

The row-level source anchors and dispositions are in [ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.csv](ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.csv), EVD-003061 through EVD-003072.

## Reconciliation notes

- **Persistence and route counts:** The report's 54 durable / 3 stateless / 217 ephemeral split is a distinct dated classification of 274 routes. The later audit crosswalk records 70 / 3 / 201 over 274 records, while the observed reference inventory has 278 routes. Keep these populations separate until route-level semantic disposition is approved.
- **Scale estimates:** The 2GB and tens-of-seconds projection is based on an assumed workload. It is not a measured capacity result. Current architecture documentation does identify hydrated reads and single-writer scope as trade-offs.
- **Security findings:** OTP hashing, referee expiry, RLS database role, assessment-session persistence, and AI quota claims remain historical until rechecked against current source and required tests. The target contracts specify intended controls, not implementation proof.
- **Billing:** The report's statement that Stripe was absent or simulated predates the 2026-10-23 UTC repository audit, which records Stripe backend and durable PostgreSQL billing after PR #71. This supersession concerns the code snapshot; webhook delivery, hosted schema, commercial approval, and production behavior remain separate questions.
- **Deployment:** The Oracle Caddy and image findings refer to the report's dated configuration. They need current configuration and staging evidence before they can be closed or presented as present-day defects.
- **Identity:** SEC-* and OPS-* are source-local identifiers. Do not reuse them as target RISK-*, OPEN-*, or TEST-* IDs.

## Review limits

This pass read the full report and mapped its major claim groups to current target documents and known later evidence. It did not re-run the report's checks, inspect the current source code for each security claim, test the running app, inspect hosted database roles, verify provider delivery, or exercise Oracle staging. Therefore the crosswalk does not mark any report finding fixed, current, or production-verified.

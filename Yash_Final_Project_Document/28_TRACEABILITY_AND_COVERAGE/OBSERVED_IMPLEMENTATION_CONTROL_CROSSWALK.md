# Observed Implementation Control Crosswalk

Doc ID: TRC-07 | Owner: Documentation Architect | Version: 1.0 | Status: Candidate preservation map; owner review required | Date: 2026-10-25

This crosswalk maps dated reference claims in four repository documents to candidate target documents. It separates implementation observations, source requirements, historical test results, stale prose, and future target design. It is not a code audit, current test report, adopted requirement, or approval. Every row remains an unapproved candidate. The companion [CSV](OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.csv) preserves 38 row-level claims, source document/evidence IDs, revision and content hash, anchors, target candidates, comparison labels, and unresolved disposition.

## Sources and provenance

| Source | Manifest record | Source revision | Content SHA-256 | Scope note |
|---|---|---|---|---|
| [`docs/engineering/DATABASE.md`](../../docs/engineering/DATABASE.md) | DOC-000137 / EVD-000137 | `431c425a`, 2026-10-23 | `0879ff0703827fa3253380daca3232a45f78407fe5f21e31f92e8706a4915f82` | Static storage, migration, privacy and RLS observations; no live DB proof. |
| [`docs/quality/OPERATIONS.md`](../../docs/quality/OPERATIONS.md) | DOC-000152 / EVD-000152 | `2aea1085`, 2026-10-24; current-build section checked 2026-10-23 | `f4977e0a82c853064fd27137f03b8ae7fc836cba68955f6fb6b2b01c81627c18` | Sections 1-8 are a target operating model; section 9 is reference implementation/operations. |
| [`docs/quality/SECURITY.md`](../../docs/quality/SECURITY.md) | DOC-000153 / EVD-000153 | `2aea1085`, 2026-10-24 | `dda6537adf773b945e8fbd2ffae16e050902d0ae76bc392a811df6a100bb7006` | Source limits evidence scope and distinguishes requirements from assurance. |
| [`docs/quality/TESTING.md`](../../docs/quality/TESTING.md) | DOC-000154 / EVD-000154 | `335e9827`, 2026-10-23 | `fbe7077f12d7ea0893fdc04a3a2d88b35ca3a93a4368e74fc1882df9252b2f11` | Historical baseline is dated 2026-10-21; coverage claims are not current test results. |

## Interpretation

- `candidate-partial`, `candidate-conflict`, and `candidate-stale-reference` describe the comparison in named target files; they do not select future policy.
- `candidate-historical-evidence` preserves dated results. `candidate-covered` means a similar control or caveat exists, not that implementation is verified.
- `VerificationState` is conservative: current code/runtime was not revalidated for these rows in this checkpoint. The four source Markdown files were read and content hashes recorded.
- Repeated topics (erasure, RLS, delivery and export) retain distinct source evidence; they are not independent proof. Target design remains subject to owner review. Root `SSOT.md` remains unchanged.

## Principal unresolved dispositions

1. Reconcile single-writer API topology, Map-backed durability, worker duplicate execution and target outbox/fencing design.
2. Complete table/module durability and erasure/export inventories, retry behavior, legal holds, shared-record retention and deletion evidence.
3. Map source RLS/grant limits to target tenant policies and define evidence beyond `RLS enabled`.
4. Map provider acceptance versus delivery, queue retry/idempotency and integration incident handling.
5. Keep authentication, hashing, session and billing reference behavior separate from target designs; verify current claims against code when required.
6. Separate historical tests from target test specifications; close accessibility, performance and release-evidence gaps.
7. Route the `z.coerce.boolean()` discrepancy to a separately authorized code task; this initiative does not change source code.

## Validation limits

CSV structure and row IDs can be checked mechanically; source anchors can be compared to current text. No database query, migration, app test, browser, deployment, live provider, legal review or production control was exercised. Source Markdown and target design documents remain in place; no cleanup is authorized by this map.

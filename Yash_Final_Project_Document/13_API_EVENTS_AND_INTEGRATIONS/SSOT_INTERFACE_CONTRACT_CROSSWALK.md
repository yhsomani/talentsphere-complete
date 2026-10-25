# SSOT Interface Contract Crosswalk

Doc ID: APIC-03 · Status: Candidate mapping; owner review required · Date: 2026-10-25

This crosswalk compares root SSOT `CON-001…CON-016` (§23.3) with proposed target API, migration, privacy, and observability specifications. It preserves the source contract IDs and records candidate destinations; it does not establish approval or runtime behavior.

| Disposition | Count | Notes |
|---|---:|---|
| Aligned candidate | 8 | Similar target contracts exist, with residuals documented in the row-level CSV. |
| Partial candidate | 6 | Related controls exist, but exact coverage remains incomplete or unverified. |
| Conflict | 2 | Cursor default differs (20 vs 25); stale-write response differs (409 vs ETag/412). |

The [row-level crosswalk](SSOT_INTERFACE_CONTRACT_CROSSWALK.csv) includes each source contract statement, target section, and unresolved condition. “Aligned candidate” means the written design appears similar at the stated level; it is not an owner-approved equivalence decision or evidence that controls run.

OPEN-46 remains open for envelope, pagination default, deprecation lifecycle, timeout/serialization choices, and owner disposition of the crosswalk. The source requires minimum six-month deprecation while the target currently proposes 90 days; this is not resolved by the 16-row interface comparison.

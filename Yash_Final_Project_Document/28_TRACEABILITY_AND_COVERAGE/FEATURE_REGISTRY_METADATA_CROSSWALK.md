# Feature Registry Metadata Crosswalk

Doc ID: TRC-03 · Status: Candidate preservation map; owner review required · Date: 2026-10-25

The protected root SSOT feature inventory and `docs/registries/FEATURE_REGISTRY.md` share 173 `F-*` identities, but the registry also carries source category, priority (`P`), phase, and dependency metadata. Those fields are not implementation status and do not automatically map to the target capability map's local priorities or Ph0–Ph4.

The [machine-readable crosswalk](FEATURE_REGISTRY_METADATA_CROSSWALK.csv) has one row per `F-01…F-173`. It preserves the registry name/category/priority/phase/dependencies, the root SSOT feature name, and the candidate local FEAT IDs/match from [SSOT_FEATURE_CROSSWALK](SSOT_FEATURE_CROSSWALK.md). This is a documentation preservation aid; product owners must decide whether source metadata remains useful and how it relates to target sequencing. OPEN-41 remains open for identity and metadata disposition.

Source `FEATURE_REGISTRY.md` states implementation status belongs to the dated feature-status report, not the canonical registry. Do not treat source priority or phase as current implementation readiness, and do not infer a migration or retirement from a blank candidate mapping.

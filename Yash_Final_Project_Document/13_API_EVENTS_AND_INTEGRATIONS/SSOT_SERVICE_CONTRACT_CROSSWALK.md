# SSOT Service Contract Crosswalk

Doc ID: APIC-02 · Status: Candidate mapping; owner review required · Date: 2026-10-25

This crosswalk compares the root SSOT's 54 service contract identities to the proposed target API catalog. It preserves each source operation, actor and idempotency key. Candidate API IDs indicate a possible destination for review; they do not prove semantic equivalence, adoption, or implementation.

## Coverage summary

| Source SCI contracts | Candidate mapping | Count | Meaning |
|---|---:|---:|---|
| SCI-01…SCI-54 | Partial candidate | 33 | Related target endpoint(s) exist, but the row records a material gap in identity, lifecycle, actor, or idempotency behavior. |
| SCI-01…SCI-54 | No specific match | 21 | No sufficiently specific endpoint was identified in the current target API catalog. This does not prove that the product capability is absent from all other target docs. |

The row-level evidence is in [SSOT_SERVICE_CONTRACT_CROSSWALK.csv](SSOT_SERVICE_CONTRACT_CROSSWALK.csv). All 33 candidate API IDs resolve against [API_CATALOG.md](API_CATALOG.md). No direct match is marked exact because source and target idempotency, lifecycle, or resource semantics still need owner review.

## High-impact no-match groups

- Institution operations: batch course assignment and explicit seat assign/revoke/reassign (SCI-11/12).
- Learning/media: assignment submission and peer review (SCI-22/23); Q&A (SCI-28); playlist import is only a generic-import candidate (SCI-14).
- Commerce and migration: creator payout settlement (SCI-27); migration abort/rollback is only partially adjacent to generic import/job operations (SCI-25).
- Community and growth: contests (SCI-29…31), publishing/newsletters (SCI-33/34), emerging skills and relationship validation (SCI-45/46), introductions (SCI-47/48), feedback (SCI-49/50), freshness (SCI-51), referrals (SCI-53), alumni (SCI-54).
- Media and assessment: recording lifecycle (SCI-39).

## Decisions required

OPEN-46 governs API identity, envelope and compatibility decisions; OPEN-50 governs broader source-register reconciliation. Owners should confirm each candidate, split or merge target endpoints where necessary, identify explicit out-of-scope operations, or add target contracts where approved. Preserve source idempotency keys and actor constraints in that review. The candidate map does not supersede the protected root `SSOT.md` or authorize deleting source material.

## Limits

This comparison covers the API catalog only. It does not search every feature spec for implicit behavior, establish API behavior outside that catalog, or prove implementation. “No specific match” means only that this catalog contains no sufficiently specific endpoint candidate.

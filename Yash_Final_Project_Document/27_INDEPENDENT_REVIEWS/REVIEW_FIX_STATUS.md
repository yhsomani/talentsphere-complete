# Review Fix Status (REVW-01..45)

Doc ID: REV-FIX · Version 1.0 · 2026-10-25 · Additive; supersedes nothing (the original [FINAL_REVIEW_REPORT](FINAL_REVIEW_REPORT.md) is unchanged). Status values: **Fixed in docs** (originals edited earlier), **Addressed in REV2** (a new revision file proposes the fix; originals are not changed, so readers must follow the supersession pointer), **Partial**, **Open**.

Source of these statuses: the fix agents' own reports plus this session's scripts. The orchestrator did **not** re-read every REV2 file; "Addressed" means the agent reports the change, not that it was independently reviewed. A new independent review pass is still needed.

| Finding | Status | Where |
|---|---|---|
| 01 permission matrix over-grant | Fixed in docs + REV2 | `02_*/STAKEHOLDERS_ROLES_PERMISSIONS.md` (edited), `PERMISSION_MATRIX_REV2.md`, TEST-SEC-NEG-01 |
| 02 consent vocabularies | Fixed in docs | `00_*/CONSENT_SCOPE_CATALOGUE.md` |
| 03 state vocabularies | Fixed in docs + REV2 | `STATE_MACHINES.md` vocabulary authority; `STATE_MACHINES_REV2.md` |
| 04 audit vs erasure | Fixed in docs | `PHYSICAL_DESIGN.md` §4.1–4.2, §17 |
| 05 cookie contract | Fixed in docs | SEC-02 contract applied across 08–14 |
| 06 write contention | Addressed in REV2 | `BACKEND_ARCHITECTURE_REV2.md`, `PHYSICAL_DESIGN_REV2.md` |
| 07 federation default | Addressed in REV2 | `FEDERATION_REVIEW_FIXES.md` (bundled default); ADR-T23 proposal |
| 08 MOD-ADM split | Addressed in REV2 | `FEDERATION_REVIEW_FIXES.md`, `REMOTE_*_REV2.json` (8 remotes; agent reports schemas valid and 8 signatures verified with a published example key); `ID_REGISTRY` NOT yet updated |
| 09 UI→API mapping | Partial | `ACTION_TO_OPERATION_MAP.md`: of 231 ACTs 153 OK, 59 catalogued-not-in-OpenAPI, 15 client-only, 3 deferred, 1 MISSING (ACT-HIRE-09); 126 of 206 SCREEN_REGISTRY placeholder names unmapped; `openapi.addendum.yaml` (117 operations) |
| 10 phases | Addressed in REV2 | `CAPABILITY_MAP_PHASE_RECONCILIATION_REV2.md`, `ROADMAP_REV2.md`; OPEN-42 (first-party learning in Ph1 vs decision) |
| 11 dependencies | Addressed in REV2 | `ROADMAP_REV2.md` |
| 12 instructor rung | Addressed in REV2 | `issuer_class` in BR/DT/INV REV2, `EvidenceIssuer.schema.json`; ADR-T14a to register |
| 13 SEO | Addressed in REV2 | `FRONTEND_ARCHITECTURE_REV2.md` (ADR-T24 proposal) |
| 14 idempotency retention | Addressed in REV2; original backend TTL row aligned 2026-10-27 | `OFFLINE_AND_SYNC_DESIGN_REV2.md`, `BACKEND_ARCHITECTURE_REV2.md`; FF-07 reworded only in REV2 text (CANONICAL_INVARIANTS unchanged) |
| 15 offline scope | Addressed in REV2 | `OFFLINE_AND_SYNC_DESIGN_REV2.md`; ADR-T10a to register; SPEC-G3/SM wording owner action open |
| 16 cost evidence | Partial | `COST_ENVELOPE.md` structure only; vendor quotes empty; Ph0-exit blocker remains |
| 17 traceability | Partial | `COVERAGE_MATRICES.md`: 359 long-form ACs, 97 directly cited by tests, 262 uncited; 168 of 253 features have no AC (review said 158; not reproduced); 36 P0 features without AC, 26 also without test; `SPEC_ACCEPTANCE_ADDITIONS_REV2.md` adds 95 ACs; `TEST_CATALOG_REV2.md` adds 22 tests |
| 18 session constants | Addressed in REV2 | `BUSINESS_RULES_REGISTRY_REV2.md` CONST-S01..15 |
| 19 job engine | Fixed in docs + REV2 | `BACKEND_ARCHITECTURE_REV2.md` §3.2 (60 s base, 6 h cap, ≈20.5 h, arithmetic rechecked 2026-10-27); original `BACKEND_ARCHITECTURE.md` §7.3 and failure table now agree |
| 20 missing state machines | Addressed in REV2 | `STATE_MACHINES_REV2.md` |
| 21 account guard | Addressed in REV2 | `STATE_MACHINES_REV2.md` |
| 22 employer-domain badge | Addressed in REV2 | `BUSINESS_RULES_REGISTRY_REV2.md` |
| 23 budgets | Addressed in REV2 | `FRONTEND_ARCHITECTURE_REV2.md`; `SLO_REV2.md` §4 needs recheck |
| 24 offline outbox | Addressed in REV2 | `OFFLINE_AND_SYNC_DESIGN_REV2.md` (Ph1: read cache + local drafts) |
| 25 consent timing | Fixed in docs | no consent cache (catalogue) |
| 26 retention after consent | Partial | REV2 states basis OPEN-08 |
| 27 withdrawn re-apply | Addressed in REV2 | BR/state REV2; OPEN-B20 closed on paper |
| 28 role columns | Addressed in REV2 | `PERMISSION_MATRIX_REV2.md` |
| 29 minimum age | Partial | BR in REV2; value awaits counsel |
| 30 marketplace money flow | Addressed in REV2 | `MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL.md` (Ph2 first-party only) |
| 31 telemetry | Addressed in REV2 | `SLO_REV2.md`, `SECURITY_REV2.md` |
| 32 cookie tossing / UGC domain | Addressed in REV2 | `SECURITY_REV2.md` |
| 33 OPEN register | **Open** | no consolidated register yet; proposed rules in `GOVERNANCE_REGISTRATIONS_REV2.md` |
| 34 networking phases | Partial | roadmap/API addenda |
| 35 registries / route prefixes | **Open** | prefixes listed in REV2 files; `ID_REGISTRY` unchanged (V9: no in-place edit) |
| 36 headline counts | **Open** | corrected counts computed in `COVERAGE_MATRICES.md` (e.g. 108 CAP not 97; 236 individual tests); originals still stale |
| 37 iOS push markers | Addressed in REV2 | `PWA_MOBILE_REVIEW_FIXES.md` |
| 38 referee reminder cap | Addressed in REV2 (unverified) | BR REV2 |
| 39 binary goals | Addressed in REV2 | `PRODUCT_VISION_GOALS_REV2.md` (folder owner to confirm) |
| 40 tool state in folder | **Open** | `.omc/state/*` (tracked) sits in the folder; not deleted (no deletion without authorization) |
| 41 unlogged tables / limiter | Addressed in REV2 | `SLO_REV2.md`, `SECURITY_REV2.md`, backend REV2 |
| 42 module graph | Addressed in REV2 | `BACKEND_ARCHITECTURE_REV2.md` |
| 43 "shortlist" naming | Addressed in REV2 (unverified) | product REV2 files |
| 44 envelope `human` | Fixed in docs | `EventEnvelope.schema.json`, `asyncapi.yaml`, `EVENT_CATALOG.md` |
| 45 SQL/domain parity | Addressed in REV2 | `BACKEND_ARCHITECTURE_REV2.md` |

Validation run by the orchestrator after the REV2 pass: YAML loads for `openapi.yaml`, `asyncapi.yaml`, `openapi.addendum.yaml`; 10 JSON files parse; 340 relative Markdown links, 0 broken. Backend agent reports Redocly valid on openapi + addendum (0 errors, 1 warning) and AsyncAPI parser valid; not re-run by the orchestrator. Mermaid not rendered.

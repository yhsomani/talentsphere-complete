# Review Fix Status (REVW-01..45)

Doc ID: REV-FIX · Version 1.0 · 2026-10-25 · Additive; supersedes nothing (the original [FINAL_REVIEW_REPORT](FINAL_REVIEW_REPORT.md) is unchanged). Status values: **Fixed in docs** (originals edited earlier), **Addressed in REV2** (a new revision file proposed the fix; since 2026-10-27 that text is folded into the original, and the REV2 file is a change record), **Partial**, **Open**.

**Tally after the 2026-10-27 fold (findings 01-45; REVW-46 is separate and closed in documentation):** 10 fixed in docs, 27 addressed in REV2 text that is now folded into the originals (proposed, awaiting owner/ARB ratification), 6 partial (09, 16, 17, 26, 29, 34), 2 open (33, 40). Folded means the text is in the original files, not that it was ratified, implemented or tested. REVW-35 and 36 were closed in place on 2026-10-27. The three REV2 JSON files in `09_MODULE_FEDERATION` are not swapped into the originals, and several appended sections override older text above them rather than replacing it row by row.

Source of these statuses: the fix agents' own reports plus this session's scripts. The orchestrator did **not** re-read every REV2 file; "Addressed" means the agent reports the change, not that it was independently reviewed. A new independent review pass is still needed.

| Finding | Status | Where |
|---|---|---|
| 01 permission matrix over-grant | Fixed in docs + REV2 | `02_*/STAKEHOLDERS_ROLES_PERMISSIONS.md` (edited), `STAKEHOLDERS_ROLES_PERMISSIONS.md#record-permission-matrix-rev2`, TEST-SEC-NEG-01 |
| 02 consent vocabularies | Fixed in docs | `00_*/CONSENT_SCOPE_CATALOGUE.md` |
| 03 state vocabularies | Fixed in docs + REV2 | `STATE_MACHINES.md` vocabulary authority; `STATE_MACHINES.md#record-state-machines-rev2` |
| 04 audit vs erasure | Fixed in docs | `PHYSICAL_DESIGN.md` §4.1–4.2, §17 |
| 05 cookie contract | Fixed in docs | SEC-02 contract applied across 08–14 |
| 06 write contention | Addressed in REV2 | `BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2`, `PHYSICAL_DESIGN.md#record-physical-design-rev2` |
| 07 federation default | Addressed in REV2 | `FEDERATION_REVIEW_FIXES.md` (bundled default); ADR-T23 proposal |
| 08 MOD-ADM split | Addressed in REV2 | `FEDERATION_REVIEW_FIXES.md`, `REMOTE_*_REV2.json` (8 remotes; agent reports schemas valid and 8 signatures verified with a published example key); `ID_REGISTRY` NOT yet updated |
| 09 UI→API mapping | Partial | `ACTION_TO_OPERATION_MAP.md`: of 231 ACTs 153 OK, 59 catalogued-not-in-OpenAPI, 15 client-only, 3 deferred, 1 MISSING (ACT-HIRE-09); 126 of 206 SCREEN_REGISTRY placeholder names unmapped; `openapi.addendum.yaml` (117 operations) |
| 10 phases | Addressed in REV2 | `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2`, `ROADMAP.md#record-roadmap-rev2`; OPEN-42 (first-party learning in Ph1 vs decision) |
| 11 dependencies | Addressed in REV2 | `ROADMAP.md#record-roadmap-rev2` |
| 12 instructor rung | Addressed in REV2 | `issuer_class` in BR/DT/INV REV2, `EvidenceIssuer.schema.json`; ADR-T14a to register |
| 13 SEO | Addressed in REV2 | `FRONTEND_ARCHITECTURE.md#record-frontend-architecture-rev2` (ADR-T24 proposal) |
| 14 idempotency retention | Addressed in REV2; original backend TTL row aligned 2026-10-27 | `OFFLINE_AND_SYNC_DESIGN.md#record-offline-and-sync-design-rev2`, `BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2`; FF-07 reworded only in REV2 text (CANONICAL_INVARIANTS unchanged) |
| 15 offline scope | Addressed in REV2 | `OFFLINE_AND_SYNC_DESIGN.md#record-offline-and-sync-design-rev2`; ADR-T10a to register; SPEC-G3/SM wording owner action open |
| 16 cost evidence | Partial | `COST_ENVELOPE.md` structure only; vendor quotes empty; Ph0-exit blocker remains |
| 17 traceability | Partial | `COVERAGE_MATRICES.md`: 359 long-form ACs, 97 directly cited by tests, 262 uncited; 168 of 253 features have no AC (review said 158; not reproduced); 36 P0 features without AC, 26 also without test; `MICRO_FEATURE_SPECS.md#record-spec-acceptance-additions-rev2` adds 95 ACs; `TEST_CATALOG.md#record-test-catalog-rev2` adds 22 tests |
| 18 session constants | Addressed in REV2 | `BUSINESS_RULES_REGISTRY.md#record-business-rules-registry-rev2` CONST-S01..15 |
| 19 job engine | Fixed in docs + REV2 | `BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2` §3.2 (60 s base, 6 h cap, ≈20.5 h, arithmetic rechecked 2026-10-27); original `BACKEND_ARCHITECTURE.md` §7.3 and failure table now agree |
| 20 missing state machines | Addressed in REV2 | `STATE_MACHINES.md#record-state-machines-rev2` |
| 21 account guard | Addressed in REV2 | `STATE_MACHINES.md#record-state-machines-rev2` |
| 22 employer-domain badge | Addressed in REV2 | `BUSINESS_RULES_REGISTRY.md#record-business-rules-registry-rev2` |
| 23 budgets | Addressed in REV2 | `FRONTEND_ARCHITECTURE.md#record-frontend-architecture-rev2`; `SLO_AND_PERFORMANCE_TARGETS.md#record-slo-rev2` §4 needs recheck |
| 24 offline outbox | Addressed in REV2 | `OFFLINE_AND_SYNC_DESIGN.md#record-offline-and-sync-design-rev2` (Ph1: read cache + local drafts) |
| 25 consent timing | Fixed in docs | no consent cache (catalogue) |
| 26 retention after consent | Partial | REV2 states basis OPEN-08 |
| 27 withdrawn re-apply | Addressed in REV2 | BR/state REV2; OPEN-B20 closed on paper |
| 28 role columns | Addressed in REV2 | `STAKEHOLDERS_ROLES_PERMISSIONS.md#record-permission-matrix-rev2` |
| 29 minimum age | Partial | BR in REV2; value awaits counsel |
| 30 marketplace money flow | Addressed in REV2 | `MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL.md` (Ph2 first-party only) |
| 31 telemetry | Addressed in REV2 | `SLO_AND_PERFORMANCE_TARGETS.md#record-slo-rev2`, `SECURITY_ARCHITECTURE.md#record-security-rev2` |
| 32 cookie tossing / UGC domain | Addressed in REV2 | `SECURITY_ARCHITECTURE.md#record-security-rev2` |
| 33 OPEN register | **Open** | no consolidated register yet; proposed rules in `ADR_REGISTER.md#record-governance-registrations-rev2` |
| 34 networking phases | Partial | roadmap/API addenda |
| 35 registries / route prefixes | Fixed in docs (2026-10-27, in place) | `ID_REGISTRY` MOD-SHELL row now lists the shell route prefixes from SCREEN_REGISTRY. The second invariant registry (CC-INV vs INV-REG) is not merged. |
| 36 headline counts | Fixed in docs | No live document states "97 capabilities" (grep 2026-10-27; only historical review and ledger text); 108 CAP rows is the stated figure. Counts are still not script-generated. |
| 37 iOS push markers | Addressed in REV2 | `PWA_MOBILE_REVIEW_FIXES.md` |
| 38 referee reminder cap | Addressed in REV2 (unverified) | BR REV2 |
| 39 binary goals | Addressed in REV2 | `PRODUCT_VISION_AND_BUSINESS_MODEL.md#record-product-vision-goals-rev2` (folder owner to confirm) |
| 40 tool state in folder | **Open** | `.omc/state/*` (tracked) sits in the folder; not deleted (no deletion without authorization) |
| 41 unlogged tables / limiter | Addressed in REV2 | `SLO_AND_PERFORMANCE_TARGETS.md#record-slo-rev2`, `SECURITY_ARCHITECTURE.md#record-security-rev2`, backend REV2 |
| 42 module graph | Addressed in REV2 | `BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2` |
| 43 "shortlist" naming | Addressed in REV2 (unverified) | product REV2 files |
| 44 envelope `human` | Fixed in docs | `EventEnvelope.schema.json`, `asyncapi.yaml`, `EVENT_CATALOG.md` |
| 45 SQL/domain parity | Addressed in REV2 | `BACKEND_ARCHITECTURE.md#record-backend-architecture-rev2` |

Validation run by the orchestrator after the REV2 pass: YAML loads for `openapi.yaml`, `asyncapi.yaml`, `openapi.addendum.yaml`; 10 JSON files parse; 340 relative Markdown links, 0 broken. Backend agent reports Redocly valid on openapi + addendum (0 errors, 1 warning) and AsyncAPI parser valid; not re-run by the orchestrator. Mermaid not rendered.

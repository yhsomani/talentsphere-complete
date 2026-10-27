# TalentSphere — Project Master Blueprint (target design)

Doc ID: MASTER · Version 1.0 · Date 2026-10-25 · Status: **Revision Required** (2026-10-27 tally of 45 review findings: 10 fixed in documentation, 27 addressed in revision text folded into the originals but not ratified, 6 partial, 2 open; REVW-46 closed in documentation; OPEN-41 through OPEN-47 are owner decisions still open) (not "Ready for Implementation" — see [IMPLEMENTATION_READINESS](IMPLEMENTATION_READINESS.md) and [FINAL_REVIEW_REPORT](../27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md))

This is a design. No feature described here is claimed to exist, and documentation completeness does not demonstrate production readiness. The existing codebase and docs were used as **[REF]** only.

## 1. Target product and why
A **verified career-evidence platform**: candidates prove skills and work history with graded evidence; recruiters, hiring managers and institutions review that evidence; matching is explainable and never pay-to-rank. Loop: Learn → Prove → Showcase → Match → Apply → Hire → Grow. Detail: [vision & business model](../01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md). Goals GOAL-01…08.

## 2. Users and permissions
15 roles proposed as scoped grants, deny-by-default, consent-gated evidence reads, time-boxed audited staff access, tokenised no-account referees. The authorization model and mapping from the SSOT role hierarchy remain open under OPEN-44; no implementation claim is made. [Roles & permission matrix](../02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md) · [20 user journeys](../02_STAKEHOLDERS_AND_USERS/USER_JOURNEYS.md).

## 3. Domains and capabilities
24 domains (DOM-01…24), bounded contexts, event-based integration, no cross-module table reads: [domain architecture](../03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md). The capability map contains 108 `CAP-*` rows, 253 local `FEAT-*` rows, and 318 micro-features: [hierarchy](../04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md). Root `SSOT.md` section 7 remains authoritative for 173 canonical `F-*` portfolio identities; a candidate mapping to the local hierarchy is recorded in [SSOT_FEATURE_CROSSWALK](../28_TRACEABILITY_AND_COVERAGE/SSOT_FEATURE_CROSSWALK.md), but remains owner-unapproved under OPEN-41. These counts must not be treated as equivalent coverage.

## 4. Functional specification
14 indexed full feature specs (359 ACs) + 65 micro-feature specs: [05_FEATURE_SPECIFICATIONS](../05_FEATURE_SPECIFICATIONS/README.md). A direct-reference scan finds 126 of 389 total feature and shared-platform ACs cited by catalog tests (97 long-form + 29 platform; recounted 2026-10-27, an earlier scan said 125); see the [AC-to-test matrix](../28_TRACEABILITY_AND_COVERAGE/AC_TEST_TRACEABILITY_MATRIX.md). 108 business rules, 45 invariants, 15 state machines, 12 decision tables, 38 processes: [06_BUSINESS_PROCESSES](../06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md). Core invariants and architecture fitness functions: [CANONICAL_INVARIANTS](../00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md).

## 5. Experience
130 screens, 231 actions, key-screen specs, navigation, design system, WCAG 2.2 AA design target (not measured), progressive/truthful feedback: [07_UI_UX_AND_DESIGN_SYSTEM](../07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md).

## 6. Platform architecture (full list in [ADR register](../24_RISKS_AND_DECISIONS/ADR_REGISTER.md))
| Area | Decision | Doc |
|---|---|---|
| Client | PWA-first, no store packaging at launch; server is system of record; iOS push only for installed apps | [08](../08_PWA_AND_MOBILE/PWA_ARCHITECTURE.md), [matrix](../08_PWA_AND_MOBILE/PLATFORM_COMPATIBILITY_MATRIX.md) |
| Offline | Read cache + few queued drafts; consequential actions online-only; server revalidates | [offline](../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md) |
| Frontend | Typed host/module contract; bundled lazy-module delivery is the proposed initial baseline. Runtime federation and its signed registry are optional, gated by proposed ADR-T23, OPEN-03 and a passing spike; ADR-T23 awaits ARB ratification. | [09](../09_MODULE_FEDERATION/FEDERATION_ARCHITECTURE.md), [contracts](../09_MODULE_FEDERATION/HOST_CONTRACT_AND_REMOTE_CONTRACTS.md), [versioning](../09_MODULE_FEDERATION/VERSION_COMPATIBILITY_DESIGN.md), [fault isolation](../09_MODULE_FEDERATION/FAULT_ISOLATION_MATRIX.md), [10](../10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE.md) |
| Backend | Modular monolith + worker; central policy module; outbox; fenced job leases; AI gateway; sandbox runner | [11](../11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md) |
| Data | PostgreSQL single system of record, RLS, SQL reads, tenant scoping | [12](../12_DATA_AND_DATABASE/CONCEPTUAL_AND_LOGICAL_MODEL.md), [physical](../12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md) |
| API/events | REST v1, OpenAPI 3.1 (109 operations in the contract file; 230 in the catalog), problem+json, idempotency keys, ETags; 74 events, AsyncAPI | [13](../13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md), [openapi](../13_API_EVENTS_AND_INTEGRATIONS/contracts/openapi.yaml), [asyncapi](../13_API_EVENTS_AND_INTEGRATIONS/contracts/asyncapi.yaml) |
| Security/privacy | BFF cookie sessions, passkeys, STRIDE threat model (32 abuse cases), consent scopes, compliance matrix (applicability to be confirmed by counsel) | [14](../14_SECURITY_PRIVACY_COMPLIANCE/THREAT_MODEL.md) |

Federation is **fault containment, not security isolation** (ADR-T19).

## 7. Reliability, quality, operations
SLO hypotheses and failure modes: [15](../15_RELIABILITY_AND_PERFORMANCE/SLO_AND_PERFORMANCE_TARGETS.md). Test strategy and 214 specified test cases (not claimed implemented): [16](../16_QA_AND_TESTING/TEST_STRATEGY.md). DevOps, hosting options (undecided, OPEN-14), observability: [17](../17_DEVOPS_AND_INFRASTRUCTURE/DEVOPS_AND_RELEASE_STRATEGY.md). Operations, 37 runbooks, incidents: [18](../18_OPERATIONS_AND_SUPPORT/OPERATIONS_AND_SUPPORT_PROCESSES.md). Commercial ops [19](../19_BUSINESS_AND_COMMERCIAL_OPERATIONS/COMMERCIAL_OPERATIONS.md), metrics [20](../20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md), cost model [21](../21_COST_AND_FINOPS/COST_MODEL.md).

## 8. Delivery
60 work packages across 5 phases, including 3 conditional migration packages; no dates or staffing: [roadmap](../22_IMPLEMENTATION_ROADMAP/ROADMAP.md). Migration from the reference system (plan only): [23](../23_MIGRATION_AND_EVOLUTION/MIGRATION_AND_EVOLUTION_PLAN.md). Developer guide: [29](../29_DEVELOPER_IMPLEMENTATION_GUIDE/DEVELOPER_IMPLEMENTATION_GUIDE.md).

## 9. Risks and open decisions
56 distinct risk ids (RISK-01..56; the register file has 63 table rows because the folded Revision 2 section repeats RISK-32 and RISK-51..56): [register](../24_RISKS_AND_DECISIONS/RISK_REGISTER.md). Blocking open decisions include hosting OPEN-14, SLO calibration OPEN-15, support model OPEN-16, legal/retention OPEN-08, sub-processors OPEN-34, on-call OPEN-39, sandbox build-vs-buy OPEN-27, federation spike OPEN-11, device lab OPEN-12, source-rule disposition OPEN-43, authorization OPEN-44, journey/workflow/state traceability OPEN-45, API contract alignment OPEN-46, and domain/federation boundaries OPEN-47, plus OPEN-50 (source register and governance reconciliation), OPEN-51 (primary outcome metric) and OPEN-52 (persistence bridge, ADR-015 vs ADR-T05). This list is non-exhaustive. All: [OPEN_DECISIONS](../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md).

## 10. The 50 acceptance questions (each with a deep link)

Status words: ANSWERED = answered in the documents (design only, unratified; says nothing about implementation); PARTIAL = answered with named gaps; OPEN = not answerable from evidence in this folder. Questions 1 to 40 keep the numbering of the earlier pointer table. The wording of questions 41 to 50 is RECONSTRUCTED (the original prompt text is not stored in the repository); the owner must confirm it. Totals: 18 ANSWERED, 30 PARTIAL, 2 OPEN, of 50.

| # | Question | Where | Status |
|---:|---|---|---|
| 1 | What is TalentSphere (target)? | §1; [vision](../01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md) | ANSWERED |
| 2 | Why does it exist; what problem and business model? | §1; [vision and business model](../01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md) | PARTIAL: no user research; OPEN-05/06/07 |
| 3 | Who are the users and stakeholders? | §2; [roles](../02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md), [journeys](../02_STAKEHOLDERS_AND_USERS/USER_JOURNEYS.md) | PARTIAL: personas unvalidated; OPEN-44/45 |
| 4 | Which business domains exist? | §3; [DOMAIN_ARCHITECTURE](../03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md) | PARTIAL: OPEN-47 |
| 5 | Which capabilities exist? | §3; [capability map](../04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md) | PARTIAL: phases unreconciled, OPEN-42 |
| 6 | Which features exist and how do they trace to SSOT F-ids? | §3; [SSOT_FEATURE_CROSSWALK](../28_TRACEABILITY_AND_COVERAGE/SSOT_FEATURE_CROSSWALK.md) | PARTIAL: candidate map, OPEN-41 |
| 7 | How does each feature behave? | §4; [feature specs](../05_FEATURE_SPECIFICATIONS/README.md) | PARTIAL: 26 features lack ACs (COVERAGE_MATRICES §5.1) |
| 8 | What are the micro-features? | §4; [MICRO_FEATURE_SPECS](../05_FEATURE_SPECIFICATIONS/MICRO_FEATURE_SPECS.md) | ANSWERED (65 specs, unratified) |
| 9 | Which business rules govern behaviour? | §4; [BUSINESS_RULES_REGISTRY](../06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md) | PARTIAL: 171 source rules unmatched, OPEN-43 |
| 10 | Who may do what (actors and permissions)? | §2; [permission matrix](../02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md) | PARTIAL: OPEN-44 |
| 11 | How does navigation work? | §5; [NAVIGATION_ARCHITECTURE](../07_UI_UX_AND_DESIGN_SYSTEM/NAVIGATION_ARCHITECTURE.md) | ANSWERED (design) |
| 12 | Which screens exist? | §5; [SCREEN_REGISTRY](../07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md) | PARTIAL: 130 screens registered; key specs only, not every screen specified |
| 13 | Which actions exist and what do they call? | §5; [ACTION_REGISTRY](../07_UI_UX_AND_DESIGN_SYSTEM/ACTION_REGISTRY.md), [ACTION_TO_OPERATION_MAP](../13_API_EVENTS_AND_INTEGRATIONS/ACTION_TO_OPERATION_MAP.md) | PARTIAL: action-to-API map incomplete |
| 14 | What states and transitions exist? | [STATE_MACHINES](../06_BUSINESS_PROCESSES/STATE_MACHINES.md) | PARTIAL: source state mapping OPEN-45 |
| 15 | What data exists? | [logical model](../12_DATA_AND_DATABASE/CONCEPTUAL_AND_LOGICAL_MODEL.md), [physical](../12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md) | ANSWERED (design; no SQL executed) |
| 16 | Who owns each datum? | [DOMAIN_ARCHITECTURE](../03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md) §3 | ANSWERED |
| 17 | Which APIs and events exist? | [API catalog](../13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md), [EVENT_CATALOG](../13_API_EVENTS_AND_INTEGRATIONS/EVENT_CATALOG.md) | PARTIAL: OPEN-46, OPEN-X06, OPEN-P01 |
| 18 | How are transactions and consistency handled? | [BACKEND_ARCHITECTURE](../11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md) (outbox), [PHYSICAL_DESIGN](../12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md) DC-01..10 | ANSWERED (design); OPEN-52 persistence bridge |
| 19 | How do federated modules interact? | [FEDERATION_ARCHITECTURE](../09_MODULE_FEDERATION/FEDERATION_ARCHITECTURE.md), [contracts](../09_MODULE_FEDERATION/HOST_CONTRACT_AND_REMOTE_CONTRACTS.md) | PARTIAL: federation optional; spike not run, OPEN-03/11 |
| 20 | How are modules deployed? | [FEDERATION_ARCHITECTURE](../09_MODULE_FEDERATION/FEDERATION_ARCHITECTURE.md), [DEPLOYMENT_ARCHITECTURE](../17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md) | PARTIAL: hosting undecided, OPEN-14 |
| 21 | How are versions kept compatible? | [VERSION_COMPATIBILITY_DESIGN](../09_MODULE_FEDERATION/VERSION_COMPATIBILITY_DESIGN.md) | ANSWERED (design; FED-RT-01..10 PROPOSED) |
| 22 | What happens when a module fails? | [FAULT_ISOLATION_MATRIX](../09_MODULE_FEDERATION/FAULT_ISOLATION_MATRIX.md) | ANSWERED (design; chaos tests not in catalog, OPEN-P02) |
| 23 | How are shared dependencies handled? | [VERSION_COMPATIBILITY_DESIGN](../09_MODULE_FEDERATION/VERSION_COMPATIBILITY_DESIGN.md), [FRONTEND_ARCHITECTURE](../10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE.md) | ANSWERED (design) |
| 24 | How are failures contained? | [FAULT_ISOLATION_MATRIX](../09_MODULE_FEDERATION/FAULT_ISOLATION_MATRIX.md); ADR-T19 (fault containment, not security isolation) | ANSWERED (design) |
| 25 | How does the PWA behave? | [PWA_ARCHITECTURE](../08_PWA_AND_MOBILE/PWA_ARCHITECTURE.md), [platform matrix](../08_PWA_AND_MOBILE/PLATFORM_COMPATIBILITY_MATRIX.md) | PARTIAL: no iOS or Android device verification, OPEN-12 |
| 26 | How does offline work? | [OFFLINE_AND_SYNC_DESIGN](../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md) | PARTIAL: OPEN-40; cache values unmeasured |
| 27 | How does sync work? | [OFFLINE_AND_SYNC_DESIGN](../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md) | ANSWERED (design) |
| 28 | How are conflicts resolved? | [OFFLINE_AND_SYNC_DESIGN](../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md), [API_DESIGN_STANDARDS](../13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md) (ETag, 412) | ANSWERED (design) |
| 29 | How are permissions enforced? | [BACKEND_ARCHITECTURE](../11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md) (policy module), [SECURITY_ARCHITECTURE](../14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md) | PARTIAL: revocation values OPEN-X02 |
| 30 | How is the system secured? | [THREAT_MODEL](../14_SECURITY_PRIVACY_COMPLIANCE/THREAT_MODEL.md), [SECURITY_ARCHITECTURE](../14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md) | PARTIAL: no penetration test; OPEN-48 |
| 31 | How is data protected and its lifecycle governed? | [PRIVACY_AND_DATA_LIFECYCLE_DESIGN](../14_SECURITY_PRIVACY_COMPLIANCE/PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md), [DATA_GOVERNANCE_AND_LIFECYCLE](../12_DATA_AND_DATABASE/DATA_GOVERNANCE_AND_LIFECYCLE.md) | PARTIAL: counsel review absent, OPEN-08, OPEN-X03 |
| 32 | What are the performance targets? | [SLO_AND_PERFORMANCE_TARGETS](../15_RELIABILITY_AND_PERFORMANCE/SLO_AND_PERFORMANCE_TARGETS.md) | PARTIAL: hypotheses only, no benchmark, OPEN-15 |
| 33 | How is the system monitored? | [OBSERVABILITY_DESIGN](../17_DEVOPS_AND_INFRASTRUCTURE/OBSERVABILITY_DESIGN.md) | ANSWERED (design) |
| 34 | How is it deployed and released? | [DEVOPS_AND_RELEASE_STRATEGY](../17_DEVOPS_AND_INFRASTRUCTURE/DEVOPS_AND_RELEASE_STRATEGY.md) | PARTIAL: hosting OPEN-14 |
| 35 | How is it recovered after failure? | [FAILURE_MODE_ANALYSIS](../15_RELIABILITY_AND_PERFORMANCE/FAILURE_MODE_ANALYSIS.md), [RUNBOOK_INDEX](../18_OPERATIONS_AND_SUPPORT/RUNBOOK_INDEX.md) | PARTIAL: restore drill not run (RG-14) |
| 36 | How is each requirement tested? | [TEST_STRATEGY](../16_QA_AND_TESTING/TEST_STRATEGY.md), [traceability](../28_TRACEABILITY_AND_COVERAGE/TRACEABILITY_AND_VALIDATION.md), [COVERAGE_MATRICES](../28_TRACEABILITY_AND_COVERAGE/COVERAGE_MATRICES.md) | PARTIAL: 126 of 389 ACs cited (97 + 29, COVERAGE_MATRICES §3; earlier scan said 125); tests_executed = 0 |
| 37 | What is built first? | [DEVELOPER_IMPLEMENTATION_GUIDE](../29_DEVELOPER_IMPLEMENTATION_GUIDE/DEVELOPER_IMPLEMENTATION_GUIDE.md) §2 | ANSWERED (plan) |
| 38 | In what order is it delivered? | [ROADMAP](../22_IMPLEMENTATION_ROADMAP/ROADMAP.md) | ANSWERED (60 WPs, no dates by design) |
| 39 | Who approves releases? | [ROADMAP](../22_IMPLEMENTATION_ROADMAP/ROADMAP.md) §7 release gates; [ADR_REGISTER](../24_RISKS_AND_DECISIONS/ADR_REGISTER.md) | PARTIAL: approvers are roles; ARB not convened |
| 40 | What is unresolved? | §9; [OPEN_DECISIONS](../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md) §6 | ANSWERED (registered) |
| 41 | Can a new engineer start from the docs alone (cold start)? | [DEVELOPER_IMPLEMENTATION_GUIDE](../29_DEVELOPER_IMPLEMENTATION_GUIDE/DEVELOPER_IMPLEMENTATION_GUIDE.md) §6 rehearsal | PARTIAL: rehearsal is paper-only, not executed; several FAIL and PARTIAL rows |
| 42 | Is every source item preserved or dispositioned? | [KNOWLEDGE_PRESERVATION_MANIFEST](../00_CONTROL_CENTRE/KNOWLEDGE_PRESERVATION_MANIFEST.md) Part 66.3 | PARTIAL: 0 of 132 CSV rows terminal (204 per narrative; see D1); 0 deletions |
| 43 | Have the specifications been validated by tools? | [DOCUMENT_STATUS](../00_CONTROL_CENTRE/DOCUMENT_STATUS.md) verification notes | PARTIAL: SOURCE (agent-reported, not re-run): Redocly and AsyncAPI results. A Haiku check this session parsed openapi.yaml, openapi.addendum.yaml and asyncapi.yaml as valid YAML only (syntax, not OpenAPI/AsyncAPI validity). Spec validation, Mermaid and SQL not run in this round |
| 44 | Is behaviour verified on real Android and iOS devices? | [PLATFORM_COMPATIBILITY_MATRIX](../08_PWA_AND_MOBILE/PLATFORM_COMPATIBILITY_MATRIX.md) | OPEN: no device tested (OPEN-12) |
| 45 | How do identifiers and traces link end to end? | [ID_REGISTRY](../00_CONTROL_CENTRE/ID_REGISTRY.md), [TRACEABILITY_AND_VALIDATION](../28_TRACEABILITY_AND_COVERAGE/TRACEABILITY_AND_VALIDATION.md) | PARTIAL: crosswalks are candidates |
| 46 | What is designed versus implemented? | [IMPLEMENTATION_READINESS](IMPLEMENTATION_READINESS.md), [DOCUMENT_STATUS](../00_CONTROL_CENTRE/DOCUMENT_STATUS.md) | ANSWERED: nothing here is implemented or tested |
| 47 | What will it cost and what is the commercial model? | [COST_MODEL](../21_COST_AND_FINOPS/COST_MODEL.md), [COMMERCIAL_OPERATIONS](../19_BUSINESS_AND_COMMERCIAL_OPERATIONS/COMMERCIAL_OPERATIONS.md) | OPEN: no price or cost data |
| 48 | How are AI features governed? | [SECURITY_ARCHITECTURE](../14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md) (AI gateway, INV-T08/T14); [ADR_REGISTER](../24_RISKS_AND_DECISIONS/ADR_REGISTER.md) ADR-T12 | PARTIAL: log retention OPEN-X03; TEST-AI-001..006 not run |
| 49 | What are the top risks? | [RISK_REGISTER](../24_RISKS_AND_DECISIONS/RISK_REGISTER.md) | ANSWERED (56 risks; P1 list in the register) |
| 50 | Who reviewed this and how independent is the review? | [FINAL_REVIEW_REPORT](../27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md), [SECOND_REVIEW_REPORT](../27_INDEPENDENT_REVIEWS/SECOND_REVIEW_REPORT.md), [PROJECT_SCOPE](../00_CONTROL_CENTRE/EXECUTION_LEDGER.md#record-project-scope) (model policy) | PARTIAL: same model family; effort setting not verified; model-policy enforcement unverified |

## 11. Honest limits
No user research, device testing, legal review, cost/price data, executed tests or benchmarks. Agent-written documents were not cross-checked line by line; the independent review lists contradictions found. Federation tooling stability must be proven by spike before commitment. In this documentation pass, roadmap package counts and registered AC references were checked; `git diff --check` passed. Mermaid rendering, machine-readable schema validation and application tests were not rerun.

**Link scans (one table; definitions below; details in [DOCUMENT_STATUS](../00_CONTROL_CENTRE/DOCUMENT_STATUS.md) link triage).** "Broken" = a relative link whose target exists neither inside this folder nor at the repository root. "Outside-folder" = target absent from this folder but present at the repository root (correct in the repository, unresolved only if the folder is read alone).

| Scan (2026-10-27) | Scope | Links | Unresolved inside folder | Genuinely broken |
|---|---|---:|---:|---:|
| Haiku scan (scratchpad `metrics_before.md`) | 267 files in the folder | 639 | 158 | classified later, see next row |
| Governance-agent rescan (read-only) | 202+ Markdown files, later folder state | 726 | 158 (all outside-folder) | 0 |

The earlier audit-pass figures (159 and 636 links, 232 dead in five `LEGACY_*` files) were from different scopes and are superseded by this table. Model-policy enforcement (Sonnet or Haiku only) is unverified; `tests_executed = 0`.

2026-10-27 patch round: the 50-question table above was expanded (questions 41 to 50 are reconstructed wording), and ID families and open items were registered. No test, validator, renderer or build was run.


<a id="record-final-architecture-summary"></a>
## Preserved source record: FINAL_ARCHITECTURE_SUMMARY

> Consolidated on 2026-10-27 (batch 2). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/FINAL_ARCHITECTURE_SUMMARY.md -->
# Final Architecture Summary

Version 1.1 · Under Review. This is a target design, not an implementation report. Decision status is governed by the [ADR register](../24_RISKS_AND_DECISIONS/ADR_REGISTER.md); diagrams are in [system diagrams](../25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md#record-system-diagrams).

**Browser:** installable PWA with a host shell, cookie-based BFF session, router, design system, and error boundaries. The proposed initial delivery uses bundled lazy domain modules behind the typed `RemoteModule`/`HostApi` contract. Runtime Module Federation 2.0 with Vite is optional and awaits ADR-T23 ratification, OPEN-03 evidence, at least three named independent frontend teams, a demonstrated independent-release need, and a passing WP-FED-SPIKE. The signed registry, per-remote deployment, and last-known-good fallback belong to that gated federated mode; they are not approved or verified runtime controls.

**Server:** proposed Fastify modular monolith with public-interface-only module boundaries, central `can()` policy, worker/outbox processing, PostgreSQL as the system of record with RLS, and external providers behind ports. The sandbox runner and AI gateway remain target components subject to their release gates; this document does not claim they exist.

**Contracts and quality:** REST/OpenAPI and AsyncAPI are specified; fitness functions FF-01…FF-10 and 214 test cases are documented as target checks. The catalog does not establish that these tests or CI gates are implemented or passing.

**Boundaries and open evidence:** offline data is a cache, never authoritative (INV-T13). Modules sharing the browser execution context are not a security boundary (ADR-T19). iOS/Android device behavior remains unverified. Open decisions include federation activation and integrity evidence (OPEN-03, OPEN-11, OPEN-FE-03), hosting/HA (OPEN-14), and sandbox build-vs-buy (OPEN-27).
<!-- source-record-end: Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/FINAL_ARCHITECTURE_SUMMARY.md -->


<a id="record-final-domain-coverage"></a>
## Preserved source record: FINAL_DOMAIN_COVERAGE

> Consolidated on 2026-10-27 (batch 2). The following is the complete source record, retained for provenance, exceptions and rationale. Its dates, counts and statements about files describe the earlier revision, not the current filesystem. This move neither ratifies proposals nor overrides the owning document’s current precedence rules. Relative references now point to the consolidated records.

<!-- source-record-begin: Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/FINAL_DOMAIN_COVERAGE.md -->
# Final Domain Coverage

Version 1.0 · Under Review. Full matrix of mission families A–X: [DOMAIN_ARCHITECTURE §4](../03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md). Features per domain: [hierarchy](../04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md).

Portfolio identity is not yet crosswalked: root `SSOT.md` §7 owns 173 canonical `F-*` IDs, while the hierarchy contains 253 decomposed `FEAT-*` rows. Domain-family coverage does not prove one-to-one or one-to-many feature coverage; OPEN-41 blocks a complete portfolio-coverage claim.

| Family | Covered by | Depth |
|---|---|---|
| Identity, orgs, profile, skills, evidence, verification, assessment, learning, jobs, applications, matching | DOM-01…11 | Full specs, rules, state machines, screens, APIs |
| Career intelligence, messaging, notifications, billing, privacy, AI gateway | DOM-12/13/15/16/17/22 | Specs + rules + APIs |
| Institutions, networking/community, integrations | DOM-18/14/23 | Lighter; phased (Ph3/Ph4); community deferred |
| Safety, admin/support, analytics, platform | DOM-19/20/21/24 | Processes, runbooks, metrics; fewer feature specs |
| Deliberately not built | generic workflow engine, CRM, payroll, ad network, crypto credentials, native apps at launch | Rationale in DOMAIN_ARCHITECTURE |

Known coverage gaps: 26 features without acceptance criteria; no UI research validation; legal regimes unconfirmed (OPEN-08).
<!-- source-record-end: Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/FINAL_DOMAIN_COVERAGE.md -->

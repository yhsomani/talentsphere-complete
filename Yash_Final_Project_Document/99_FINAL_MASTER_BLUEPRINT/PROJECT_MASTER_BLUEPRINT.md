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
14 indexed full feature specs (359 ACs) + 65 micro-feature specs: [05_FEATURE_SPECIFICATIONS](../05_FEATURE_SPECIFICATIONS/README.md). A direct-reference scan finds 125 of 389 total feature and shared-platform ACs cited by catalog tests; see the [AC-to-test matrix](../28_TRACEABILITY_AND_COVERAGE/AC_TEST_TRACEABILITY_MATRIX.md). 108 business rules, 45 invariants, 15 state machines, 12 decision tables, 38 processes: [06_BUSINESS_PROCESSES](../06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md). Core invariants and architecture fitness functions: [CANONICAL_INVARIANTS](../00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md).

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
50 risks: [register](../24_RISKS_AND_DECISIONS/RISK_REGISTER.md). Blocking open decisions include hosting OPEN-14, SLO calibration OPEN-15, support model OPEN-16, legal/retention OPEN-08, sub-processors OPEN-34, on-call OPEN-39, sandbox build-vs-buy OPEN-27, federation spike OPEN-11, device lab OPEN-12, source-rule disposition OPEN-43, authorization OPEN-44, journey/workflow/state traceability OPEN-45, API contract alignment OPEN-46, and domain/federation boundaries OPEN-47. All: [OPEN_DECISIONS](../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md).

## 10. The 40 acceptance questions (pointers)
| # | Question | Where |
|---|---|---|
| 1–3 | What / why / who | §1, §2 |
| 4–6 | Domains, capabilities, features | §3 |
| 7–8 | Feature behaviour, micro-features | §4 |
| 9–10 | Rules, actors/permissions | §4, §2 |
| 11–14 | Navigation, screens, actions, states | §5, 06 state machines |
| 15–16 | Data, ownership | 12, DOMAIN_ARCHITECTURE §3 |
| 17–18 | APIs/events, transactions | 13, 11 (outbox) |
| 19–24 | Federation interaction, deploy, versions, failure, shared deps, containment | 09 |
| 25–28 | PWA, offline, sync, conflicts | 08 |
| 29–31 | Permission enforcement, security, data protection | 11 policy, 14 |
| 32–35 | Performance, monitoring, deploy, recovery | 15, 17, 18 |
| 36 | Requirement testing | 16, [traceability](../28_TRACEABILITY_AND_COVERAGE/TRACEABILITY_AND_VALIDATION.md) |
| 37–39 | Build first, delivery order, release approvals | 29 §2, 22 |
| 40 | Unresolved decisions | §9 |

## 11. Honest limits
No user research, device testing, legal review, cost/price data, executed tests or benchmarks. Agent-written documents were not cross-checked line by line; the independent review lists contradictions found. Federation tooling stability must be proven by spike before commitment. In this documentation pass, roadmap package counts, registered AC references, and 159 local Markdown links were checked; `git diff --check` passed. A later audit pass (2026-10-27) rescanned 636 local Markdown links outside code fences: 232 were dead (all in five `LEGACY_*` merge files that kept source-relative paths); 153 were repointed to files that exist in the repo and 79 became plain references to absent files; the rescan found 0 dead links. Mermaid rendering, machine-readable schema validation, and application tests were not rerun.

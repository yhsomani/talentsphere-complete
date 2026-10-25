# TalentSphere — Project Master Blueprint (target design)

Doc ID: MASTER · Version 1.0 · Date 2026-10-25 · Status: **Revision Required** (45 independent-review findings open, 4 Critical) (not "Ready for Implementation" — see [IMPLEMENTATION_READINESS](IMPLEMENTATION_READINESS.md) and [FINAL_REVIEW_REPORT](../27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md))

This is a design. No feature described here is claimed to exist, and documentation completeness does not demonstrate production readiness. The existing codebase and docs were used as **[REF]** only.

## 1. What is built and why
A **verified career-evidence platform**: candidates prove skills and work history with graded evidence; recruiters, hiring managers and institutions review that evidence; matching is explainable and never pay-to-rank. Loop: Learn → Prove → Showcase → Match → Apply → Hire → Grow. Detail: [vision & business model](../01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md). Goals GOAL-01…08.

## 2. Users and permissions
15 roles as scoped grants, deny-by-default, consent-gated evidence reads, time-boxed audited staff access, tokenised no-account referees. [Roles & permission matrix](../02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md) · [20 user journeys](../02_STAKEHOLDERS_AND_USERS/USER_JOURNEYS.md).

## 3. Domains and capabilities
24 domains (DOM-01…24), bounded contexts, event-based integration, no cross-module table reads: [domain architecture](../03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md). Capability/feature hierarchy: 97 capabilities, 253 features, 318 micro-features with disposition and phase: [hierarchy](../04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md).

## 4. Functional specification
14 full feature specs (358 ACs) + 65 micro-feature specs: [05_FEATURE_SPECIFICATIONS](../05_FEATURE_SPECIFICATIONS/README.md). 108 business rules, 45 invariants, 15 state machines, 12 decision tables, 38 processes: [06_BUSINESS_PROCESSES](../06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md). Core invariants and architecture fitness functions: [CANONICAL_INVARIANTS](../00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md).

## 5. Experience
130 screens, 231 actions, key-screen specs, navigation, design system, WCAG 2.2 AA design target (not measured), progressive/truthful feedback: [07_UI_UX_AND_DESIGN_SYSTEM](../07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md).

## 6. Platform architecture (full list in [ADR register](../24_RISKS_AND_DECISIONS/ADR_REGISTER.md))
| Area | Decision | Doc |
|---|---|---|
| Client | PWA-first, no store packaging at launch; server is system of record; iOS push only for installed apps | [08](../08_PWA_AND_MOBILE/PWA_ARCHITECTURE.md), [matrix](../08_PWA_AND_MOBILE/PLATFORM_COMPATIBILITY_MATRIX.md) |
| Offline | Read cache + few queued drafts; consequential actions online-only; server revalidates | [offline](../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md) |
| Frontend | Host shell + 7 remotes via Module Federation 2.0 (Vite), `bundled` fallback mode; signed manifest registry; host contract v1 | [09](../09_MODULE_FEDERATION/FEDERATION_ARCHITECTURE.md), [contracts](../09_MODULE_FEDERATION/HOST_CONTRACT_AND_REMOTE_CONTRACTS.md), [versioning](../09_MODULE_FEDERATION/VERSION_COMPATIBILITY_DESIGN.md), [fault isolation](../09_MODULE_FEDERATION/FAULT_ISOLATION_MATRIX.md), [10](../10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE.md) |
| Backend | Modular monolith + worker; central policy module; outbox; fenced job leases; AI gateway; sandbox runner | [11](../11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md) |
| Data | PostgreSQL single system of record, RLS, SQL reads, tenant scoping | [12](../12_DATA_AND_DATABASE/CONCEPTUAL_AND_LOGICAL_MODEL.md), [physical](../12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md) |
| API/events | REST v1, OpenAPI 3.1 (109 operations in the contract file; 230 in the catalog), problem+json, idempotency keys, ETags; 74 events, AsyncAPI | [13](../13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md), [openapi](../13_API_EVENTS_AND_INTEGRATIONS/contracts/openapi.yaml), [asyncapi](../13_API_EVENTS_AND_INTEGRATIONS/contracts/asyncapi.yaml) |
| Security/privacy | BFF cookie sessions, passkeys, STRIDE threat model (32 abuse cases), consent scopes, compliance matrix (applicability to be confirmed by counsel) | [14](../14_SECURITY_PRIVACY_COMPLIANCE/THREAT_MODEL.md) |

Federation is **fault containment, not security isolation** (ADR-T19).

## 7. Reliability, quality, operations
SLO hypotheses and failure modes: [15](../15_RELIABILITY_AND_PERFORMANCE/SLO_AND_PERFORMANCE_TARGETS.md). Test strategy and 213 tests linked to invariants/fitness functions: [16](../16_QA_AND_TESTING/TEST_STRATEGY.md). DevOps, hosting options (undecided, OPEN-14), observability: [17](../17_DEVOPS_AND_INFRASTRUCTURE/DEVOPS_AND_RELEASE_STRATEGY.md). Operations, 37 runbooks, incidents: [18](../18_OPERATIONS_AND_SUPPORT/OPERATIONS_AND_SUPPORT_PROCESSES.md). Commercial ops [19](../19_BUSINESS_AND_COMMERCIAL_OPERATIONS/COMMERCIAL_OPERATIONS.md), metrics [20](../20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md), cost model [21](../21_COST_AND_FINOPS/COST_MODEL.md).

## 8. Delivery
56 work packages in 5 phases (Ph0 spikes → Ph4 optional community), no dates or staffing: [roadmap](../22_IMPLEMENTATION_ROADMAP/ROADMAP.md). Migration from the reference system (plan only): [23](../23_MIGRATION_AND_EVOLUTION/MIGRATION_AND_EVOLUTION_PLAN.md). Developer guide: [29](../29_DEVELOPER_IMPLEMENTATION_GUIDE/DEVELOPER_IMPLEMENTATION_GUIDE.md).

## 9. Risks and open decisions
50 risks: [register](../24_RISKS_AND_DECISIONS/RISK_REGISTER.md). Blocking open decisions: hosting OPEN-14, SLO calibration OPEN-15, support model OPEN-16, legal/retention OPEN-08, sub-processors OPEN-34, on-call OPEN-39, sandbox build-vs-buy OPEN-27, federation spike OPEN-11, device lab OPEN-12. All: [OPEN_DECISIONS](../24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md).

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
No user research, device testing, legal review, cost/price data, executed tests or benchmarks. Agent-written documents were not cross-checked line by line; the independent review lists contradictions found. Federation tooling stability must be proven by spike before commitment. Validation that actually ran: Redocly lint (openapi.yaml), AsyncAPI CLI (asyncapi.yaml), JSON-Schema meta-checks, ID scan; Mermaid and Markdown links were not validated.

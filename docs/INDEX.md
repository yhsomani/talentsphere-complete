# TalentSphere — Documentation Index v6.0

This index provides an organized map of all architectural, product, engineering, quality, and governance specifications within the `docs/` tree.

For the single source of truth across all systems, see [`../SSOT.md`](../SSOT.md).
For active project memory and execution history, see [`../BRAIN/MEMORY.md`](../BRAIN/MEMORY.md).
For root agent operational guidelines, see [`../AGENTS.md`](../AGENTS.md).

---

## 1. Product Specifications

- [`product/PRD.md`](product/PRD.md) — Product Requirements Document (PRD) detailing user personas, high-level capability matrices, and vision.

---

## 2. Experience & Design System

- [`experience/UI_UX_DESIGN_SYSTEM.md`](experience/UI_UX_DESIGN_SYSTEM.md) — Design tokens, color ramps, typography scale, component library specifications, WCAG 2.2 AA accessibility standards.
- [`experience/APP_FLOW.md`](experience/APP_FLOW.md) — Visual routing maps, modal trees, role-based navigation guards, and state transitions.
- [`experience/JOURNEY_REGISTRY.md`](experience/JOURNEY_REGISTRY.md) — Complete inventory of 28 canonical user journeys (J-01 through J-28).

---

## 3. Engineering & Technical Architecture

- [`engineering/TRD.md`](engineering/TRD.md) — Technical Requirements Document outlining runtime constraints, throughput, latency budgets, and security posture.
- [`engineering/ARCHITECTURE.md`](engineering/ARCHITECTURE.md) — Modular monolith architecture, package topology, client-server boundaries, and worker queue engines.
- [`engineering/DATABASE.md`](engineering/DATABASE.md) — Authoritative relational schema, PostgreSQL/Supabase tables, RLS policies, indexing strategies, and migration controls.
- [`engineering/API_CONTRACTS.md`](engineering/API_CONTRACTS.md) — RESTful API endpoints, request/response envelopes, error semantics, and OpenAPI guidelines.
- [`engineering/CODE_STYLE.md`](engineering/CODE_STYLE.md) — TypeScript conventions, strict typing rules, formatting standards, and linter definitions.

---

## 4. Quality, Security & Operations

- [`quality/SECURITY.md`](quality/SECURITY.md) — Defense-in-depth architecture, RLS policy enforcement, HMAC/PBKDF2 session handling, AI Gateway firewalls, and GDPR compliance.
- [`quality/TESTING.md`](quality/TESTING.md) — Test strategy across Vitest unit suites, Fastify integration suites, and Playwright end-to-end browser specs.
- [`quality/OPERATIONS.md`](quality/OPERATIONS.md) — Operational runbooks, health check probes, graceful degradation policies, backup protocols, and observability sinks.

---

## 5. Product & Business Registries

- [`registries/FEATURE_REGISTRY.md`](registries/FEATURE_REGISTRY.md) — Authoritative 173-feature capability inventory (F-01 through F-173) with status tracking.
- [`registries/BUSINESS_RULE_REGISTRY.md`](registries/BUSINESS_RULE_REGISTRY.md) — Exhaustive registry of platform business rules (BR-001 through BR-248).
- [`registries/WORKFLOWS_AND_BUSINESS_RULES.md`](registries/WORKFLOWS_AND_BUSINESS_RULES.md) — 66 declared workflow state machines, state invariants, and transition triggers.

---

## 6. Governance, Planning & Reports

- [`governance/SOURCE_RECONCILIATION.md`](governance/SOURCE_RECONCILIATION.md) — Historical audit reconciling raw source texts into the v6 canonical documentation corpus.
- [`governance/IMPLEMENTATION_PLAN.md`](governance/IMPLEMENTATION_PLAN.md) — Sequential 10-phase execution roadmap from foundation to enterprise scale.
- [`governance/GAP_ANALYSIS.md`](governance/GAP_ANALYSIS.md) — Traceability matrix identifying previously unmapped requirements and closing gaps.
- [`governance/GOVERNANCE.md`](governance/GOVERNANCE.md) — SSOT change control, RFC escalation procedures, and agent authority boundaries.
- [`reports/FINAL_VALIDATION_REPORT.md`](reports/FINAL_VALIDATION_REPORT.md) — Executable validation metrics, test pass rates, migration milestones, and operational status.

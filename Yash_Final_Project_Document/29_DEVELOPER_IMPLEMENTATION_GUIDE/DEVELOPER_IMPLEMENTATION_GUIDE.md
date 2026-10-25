# Developer Implementation Guide

Doc ID: DEV-01 · Owner: Developer Experience · Version 1.0 · Status: Draft · This is a design guide; nothing described here is built.

## 1. Reading order
1. `00_CONTROL_CENTRE/ID_REGISTRY.md`, `CANONICAL_INVARIANTS.md`, `24_*/ADR_REGISTER.md` (binding).
2. `03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md` → your domain's rows in `04_*` (features) and `05_*` (specs).
3. `06_*` state machines, rules, decision tables for your domain.
4. `13_*/contracts/openapi.yaml` + `EVENT_CATALOG.md`; `12_*` data model.
5. UI: `07_*` screens/actions for your remote; `09_*` host + remote contracts.
6. Tests: `16_*` catalog rows linked to your features.

## 2. What to build first (dependency order; detail in `22_IMPLEMENTATION_ROADMAP/ROADMAP.md`)
| Step | Work | Why first | Gate |
|---|---|---|---|
| 0 | iOS/Android device lab (OPEN-12), assessment runner decision; evaluate Module Federation + Vite only if the ARB seeks activation (OPEN-03/11) | Retire platform and assessment unknowns; bundled delivery remains the proposed baseline whether or not federation is evaluated | Device matrix and runner decision; federation spike/ARB decision only if pursued |
| 1 | Monorepo, CI with FF-01..FF-10 checks, OpenAPI generation, design-system package | Fitness functions must exist before features | CI green on empty modules |
| 2 | Postgres schema core (identity, org, audit, outbox, idempotency), policy module, BFF sessions | Everything depends on authz + sessions + outbox | INV-T01/02/03/12 tests |
| 3 | Shell + typed `RemoteModule`/`HostApi` contract + one bundled domain module | Proves module boundaries, routing, error boundaries and server authorization without requiring federation | Bundled route and module-contract tests |
| 4 | Core loop MVP: profile → evidence → verification (referee) → jobs → apply | Value loop | Phase 1 release gate |
| 5 | Hiring and learning modules, assessments (with runner), billing | Phase 2 | Per roadmap; no independent remote deployment unless federation is activated |
| 6+ | Institutions, intelligence, community (Phase 3/4) | Conditional value | Per roadmap |

## 3. Rules every developer follows
- Business rules live only in the owning backend module (state-machine tables in `06_*`); routes and UI call them.
- No cross-module imports except `index.ts` public interface (FF-02); no remote→remote imports (FF-03).
- Every mutation: `Idempotency-Key`, policy action, audit event, outbox event in the same transaction (INV-T10, T12).
- Never display a claim as verified; use the ladder components from the design system (INV-T04).
- Never read or store tokens in JS; use BFF cookies (ADR-T06).
- Don't call AI providers directly; use the gateway (ADR-T12). AI output is never evidence (INV-T08).
- Every new endpoint ships with: OpenAPI entry, policy action, tenant canary (FF-05), error cases, tests from `16_*`.
- Every new screen ships with: loading/empty/error/offline states, a11y checks (`07_*/ACCESSIBILITY_SPEC.md`).

## 4. Definition of Done (feature)
Spec ACs implemented and automated; contract diff clean (FF-06); policy + tenant tests pass; a11y checks pass; telemetry/trace propagated; runbook/alert updated if operational; docs and traceability row updated; feature flag default off until release gate.

## 5. Escalation
Schema-breaking changes, new infrastructure technology, auth/security architecture, AI entitlement, pricing, public API versioning → ADR + ARB (supersession policy in the ADR register). Open items: `24_*/OPEN_DECISIONS.md`.

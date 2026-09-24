# TalentSphere — TRD.md v6.0

## 1. Purpose

Translate product requirements into technical requirements without duplicating the full architecture.

## 2. Technical Baseline

| Area | Standard |
|---|---|
| Frontend | React + TypeScript + Vite |
| PWA | Service Worker + offline capability layer |
| Routing | React Router |
| Server state | TanStack Query |
| Backend | Node.js + Fastify + TypeScript |
| Validation | Zod |
| API | REST/JSON + OpenAPI 3.1 |
| Database | PostgreSQL |
| Platform | Supabase |
| Auth | Supabase Auth behind an application identity boundary |
| Storage | Supabase Storage |
| Queue | Supabase Queues |
| Workers | Dedicated worker process |
| Search | PostgreSQL FTS + trigram initially |
| Realtime | Selective |
| Telemetry | OpenTelemetry-compatible |
| Product analytics | Event pipeline with privacy controls |
| AI | Central AI Gateway / Orchestrator |
| Tests | Vitest/React Testing Library/Playwright-compatible stack |

## 3. Architecture Requirements

### Frontend
- Feature-oriented modules.
- Shared UI only after demonstrated reuse.
- No domain mutation directly from presentation components.
- Server state separated from UI state.
- URL state for shareable filters/search.

### Backend
- Thin routes.
- Use-case/application services.
- Domain invariants in domain layer.
- Repository ports in domain/application boundary.
- Infrastructure adapters implement ports.
- No duplicated business logic across controllers.

### Database
- SQL migrations are authoritative.
- Foreign keys, unique/check constraints and transaction boundaries are explicit.
- RLS is mandatory where Supabase/Data API exposure exists.
- Sensitive tables have deny-by-default access.
- Important lifecycle history is auditable.

### API
- Consistent error contract.
- Idempotency on retriable side effects.
- Cursor pagination.
- Allow-listed filters/sorts.
- Rate limiting.
- Request/trace IDs.

## 4. Non-Functional Requirements

### Security
- No critical unresolved security findings at release.
- Server-side authorization for every protected mutation.
- Tenant isolation tests required.

### Accessibility
- WCAG 2.2 AA target.

### Reliability
- Service-specific SLOs.
- Explicit retry/timeout policies.
- Provider outage fallback.

### Performance
- Measure real p75/p95/p99 behavior.
- Define route-specific budgets after baseline measurement.
- Avoid false precision before measurement.

### Scalability
Evolution path:
`modular monolith → worker scaling → cache → search extraction → replicas → selective service extraction`.

## 5. Data Rules

- UTC timestamps.
- Integer minor units for money + ISO 4217.
- Opaque external identifiers.
- Optimistic concurrency for high-value editable records.
- Append-only audit/event semantics where required.

## 6. AI Technical Requirements

```text
Feature
→ Identity
→ Entitlement
→ Data classification
→ Policy
→ Assessment context
→ Provider selection
→ Execution
→ Output validation
→ Provenance
```

No paid free-user cloud inference outside policy.

## 7. Assessment Technical Requirements

Active assessment session must carry policy context. The AI gateway checks that context on every AI invocation.

## 8. Offline Technical Requirements

Each feature declares:

`READ_OFFLINE`, `WRITE_OFFLINE`, `QUEUE`, `SYNC`, `CONFLICT`, `SERVER_REQUIRED`.

No secure assessment or other explicitly server-authoritative decision relies on offline authority.

## 9. Release Technical Requirements

CI must run:
- lint/format;
- typecheck;
- unit/component;
- build;
- migration checks;
- authorization/RLS tests;
- API contract tests;
- security scans;
- critical E2E;
- accessibility smoke;
- performance checks for release-critical paths.

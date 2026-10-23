# Project: TalentSphere Repository Master Audit & Agile Roadmap

## Architecture
- Monorepo structure:
  - `apps/api`: Fastify backend, OpenAPI/Swagger, routing (274 routes in `server.ts`), domain handlers.
  - `apps/web`: React / Vite / Tailwind frontend with client pages (20 pages), components, auth contexts.
  - `packages/domain`: Core domain models (48 modules), schemas, validations, service contracts.
  - `packages/contracts`: API contracts, schemas, type definitions.
  - `supabase/migrations`: PostgreSQL database migrations (49 files), RLS policies, tables.
  - `tests/`: Unit (55 files, 627 passed), integration (50 files, 402 passed), security (`tests/security`, 5 files, 101 passed), PostgreSQL (`vitest.pg.config.ts`, 8 files), and E2E Playwright tests (`tests/e2e/`, 2 files, 13 passed).

## Feature Inventory (173 Canonical Features F-01 through F-173)
- Canonical listing in `docs/registries/FEATURE_REGISTRY.md` and `docs/reports/FEATURE_TRACEABILITY_MATRIX.md`:
  - 26 Full (15.0%) — Core Career Loop end-to-end
  - 91 Partial (52.6%) — Rich backend/DB, ephemeral durability or UI unbuilt
  - 6 Stub/Mock (3.5%) — Deprecated stubs or prohibited by policy
  - 50 Missing (28.9%) — Phased future roadmap (Ph4-Ph10) / Chrome extensions

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Baseline Verification & Diagnostics | Typecheck, Vitest unit/integration/security, Playwright E2E, pnpm build | none | DONE |
| 2 | 173 Canonical Features Audit | Comprehensive Traceability Matrix across API, Domain, UI, DB | none | DONE |
| 3 | Architecture, Durability & Security Audit | ADR-015 single-writer PostgreSQL vs ephemeral maps, HMAC challenges, referee vouchers, session revocation, AI governance, integrations | none | DONE |
| 4 | Git Issues & PRs Reconciliation | Issues #44-#50 and PRs #40-#58 reconciliation against HEAD 83dc7d24 | none | DONE |
| 5 | Release Scope & Backlog Construction | Core career loop scope, deduplicated backlog with Given/When/Then acceptance criteria and P0-P3 priority | M1, M2, M3, M4 | DONE |
| 6 | Sprint Roadmap (Stages A-F) | Stage A through F dependency-aware execution plan | M5 | DONE |
| 7 | Audit Deliverables & BRAIN/MEMORY.md | Generated 5 reports in `docs/reports/` and updated project memory to v4.0 | M5, M6 | DONE |

## Code Layout
- `apps/api/src/server.ts`: API route definitions, durability header middleware, Fastify server setup.
- `apps/web/src/`: Frontend React applications, pages, components, hooks.
- `packages/domain/src/`: Domain logic, entities, value objects, domain rules.
- `supabase/migrations/`: SQL migration files defining tables, triggers, and RLS policies.
- `tests/`: Automated test suites across all tiers.
- `docs/reports/`: Complete official deliverable reports suite (`AUDIT_MASTER_REPORT.md`, `FEATURE_TRACEABILITY_MATRIX.md`, `ARCHITECTURE_DURABILITY_REPORT.md`, `GIT_RECONCILIATION_REPORT.md`, `RELEASE_SCOPE_AND_BACKLOG.md`).
- `BRAIN/MEMORY.md`: Project persistent memory file v4.0.

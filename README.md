# TalentSphere

PWA-first Career Operating System built around a Talent Graph + Evidence Graph.

## Current status

**IN ACTIVE DEVELOPMENT — 47 / 173 FEATURES VERIFIED**

- **Automated Tests:** 1,090 tests
  - **Unit, integration and security:** 930 tests across 89 files (`pnpm test`)
  - **Playwright E2E, accessibility and performance:** 160 tests (`pnpm test:e2e`)
  - **Continuous Integration:** every push and pull request runs lint, typecheck, tests, build and E2E through GitHub Actions (`.github/workflows/ci.yml`)
- **Database Migrations:** 41 sequential Supabase SQL migrations with comprehensive RLS policies (`supabase/migrations/`)
- **Monorepo Build:** 10/10 packages and applications cleanly compiling with TypeScript project references (`pnpm typecheck`)

## Core loop

```text
Goal → Gap → Learn → Practice → Prove → Verify
→ Discover → Match → Apply → Interview → Outcome → New Evidence
```

## Architecture & Stack

- **Backend:** Node.js + Fastify modular monolith (`apps/api`) with Zod contract validation, central AI Gateway, rate limiting, and standard error envelopes.
- **Frontend:** React 19 + TypeScript + Vite + TanStack Query + PWA shell (`apps/web`), targeting WCAG 2.2 AA accessibility and offline resilience.
- **Background Worker:** Async job queue engine with dead letter queue (DLQ) and idempotency (`apps/worker`).
- **Shared Packages:** Pure domain models (`packages/domain`), API/error contracts (`packages/contracts`), UI design tokens (`packages/ui`), structured logging & audit sink (`packages/observability`), environment configuration (`packages/config`), and test utilities (`packages/testing`).
- **Database:** PostgreSQL / Supabase with strict SQL migrations, strict RLS, and integer-minor-unit monetary calculations.
- **AI Gateway:** Centralized policy enforcement, prompt injection firewall, session assessment boundary (`AI_PROHIBITED`), and Free-User Cost Invariant daily metering.

## Start here

1. [`SSOT.md`](SSOT.md) — Single Source of Truth
2. [`BRAIN/MEMORY.md`](BRAIN/MEMORY.md) — Living project memory & execution history
3. [`FINAL_DOCUMENT_INDEX.md`](FINAL_DOCUMENT_INDEX.md) — Master documentation index
4. [`docs/INDEX.md`](docs/INDEX.md) — Intra-docs documentation navigation
5. [`docs/product/PRD.md`](docs/product/PRD.md) — Product requirements
6. [`docs/engineering/ARCHITECTURE.md`](docs/engineering/ARCHITECTURE.md) — System architecture
7. [`docs/engineering/TRD.md`](docs/engineering/TRD.md) — Technical requirements
8. [`docs/registries/FEATURE_REGISTRY.md`](docs/registries/FEATURE_REGISTRY.md) — 173-feature inventory
9. [`docs/governance/IMPLEMENTATION_PLAN.md`](docs/governance/IMPLEMENTATION_PLAN.md) — Sequential execution roadmap
10. [`AGENTS.md`](AGENTS.md) — Coding agent rules and golden workflow

## Golden rule

Do not confuse:
`documented → implemented → verified → production-ready`.

## Development & Testing

TalentSphere uses `pnpm` workspaces.

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Start development servers (API, Web, Worker)
pnpm dev

# Execute full automated test suites
pnpm test               # Runs unit, integration and security suites
pnpm test:unit          # Runs unit tests only
pnpm test:integration   # Runs integration tests only
pnpm test:e2e           # Runs Playwright E2E browser and API tests

# Typecheck and lint
pnpm typecheck          # Compiles all packages with tsc -b
pnpm lint               # Verifies Prettier code style
```

## Security & Privacy Invariants

- **Zero-PII Public Proofs:** Public evidence verification uses SHA-256 cryptographic proofs without exposing personal candidate data (BR-150, BR-155).
- **Free-User Cost Invariant:** Zero unbudgeted third-party AI cost for free-tier users; hard token budgets strictly enforced.
- **Server-Authoritative AI Integrity:** Assessment sessions forbid AI assistance (`ASSESSMENT_AI_PROHIBITED`, BR-10).
- **Differential Privacy Thresholds:** Career benchmarks require $k \ge 20$ (BR-160) and learning impact dashboards require $k \ge 30$ (BR-189) to prevent deanonymization.
- **Dual Consent & Multi-Admin Checks:** Audio/video recording mandates dual participant consent (BR-169); permanent account bans require dual-admin approval (BR-068).

## Contribution

Every behavior-changing PR updates:

- tests (unit, integration, and E2E);
- required documentation under `docs/`;
- migrations in `supabase/migrations/` if applicable;
- analytics/observability events;
- feature status in `BRAIN/MEMORY.md`.

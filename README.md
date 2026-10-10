# TalentSphere

PWA-first Career Operating System built around a Talent Graph + Evidence Graph.

## Current status

**IN ACTIVE DEVELOPMENT — NOT PRODUCTION-READY.** Per-feature verification is tracked in
[`BRAIN/MEMORY.md`](BRAIN/MEMORY.md); the latest assessment, open risks and owner decisions
are in [`docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md`](docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md).

What works end to end, in the browser, on durable data: sign-up (candidate or recruiter),
profile, work history with proof (corporate-email code, referee link), job posting and
lifecycle, applying, application tracking and withdrawal, the recruiter's applicant
pipeline, and GDPR erasure. What does not exist yet: email delivery outside development,
payments (paid plans cannot be bought), notifications, and durable storage for modules
outside the core loop (their responses carry `x-talentsphere-durability: ephemeral`).

Test suites (counts as measured on 2026-10-10; re-run rather than trust them):

- `pnpm test` — unit, integration and security (Vitest, ~1,000 tests, in-memory storage)
- `pnpm test:pg` — durability and concurrency against a real PostgreSQL (`TEST_DATABASE_URL` required)
- `pnpm test:e2e` — Playwright: end-to-end journeys, accessibility, performance (~190 tests)
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, all three suites (with a Postgres
  service container), a migration-idempotency check and the build on every push and PR.
- 43 sequential SQL migrations (`supabase/migrations/`), applied by `pnpm db:migrate`.

## Core loop

```text
Goal → Gap → Learn → Practice → Prove → Verify
→ Discover → Match → Apply → Interview → Outcome → New Evidence
```

## Architecture & Stack

What exists (see [`ARCHITECTURE.md`](ARCHITECTURE.md) — the record of the implemented system):

- **Backend:** Node.js + Fastify modular monolith (`apps/api`) with Zod contract validation, self-issued HMAC session tokens, rate limiting and one error envelope. The core career loop is persisted to PostgreSQL ([ADR-015](docs/engineering/adr/ADR-015-core-loop-persistence.md)); run **one API process per database**.
- **Frontend:** React 19 + TypeScript + Vite PWA shell (`apps/web`), plain React state and a small `fetch` helper (no data-fetching library), design tokens from `packages/ui`.
- **Background worker:** claims durable jobs from Postgres (`background_jobs`, `FOR UPDATE SKIP LOCKED`) with retries, permanent failures and dead-lettering (`apps/worker`).
- **Shared packages:** pure business rules (`packages/domain`), request contracts (`packages/contracts`), UI tokens (`packages/ui`), logging (`packages/observability`), environment configuration (`packages/config`), test utilities (`packages/testing`).
- **AI:** a local heuristic behind a gateway-shaped API with prompt sanitising, the assessment `AI_PROHIBITED` boundary and free-tier quotas — no model provider is integrated.

Documents under `docs/` and `SSOT.md` describe the intended product and architecture, which
differs in places (e.g. Supabase Auth, Edge Functions, Stripe). Where they disagree about
what exists, `ARCHITECTURE.md` and the code win.

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

# Configure (copy, then edit — see comments in the file)
cp .env.example .env

# Run database migrations (needs a reachable Postgres at DATABASE_URL)
pnpm db:migrate

# Start development servers (API, Web, Worker)
pnpm dev

# Execute full automated test suites
pnpm test               # Runs unit, integration and security suites
pnpm test:unit          # Runs unit tests only
pnpm test:integration   # Runs integration tests only
pnpm test:pg            # Real-PostgreSQL durability/concurrency suite (TEST_DATABASE_URL=...)
pnpm test:e2e           # Runs Playwright E2E browser and API tests

# Typecheck and lint
pnpm typecheck          # Compiles all packages with tsc -b
pnpm lint               # Verifies Prettier code style
```

## Security & Privacy Invariants

- **Proof, not self-description:** a work-history tier rises only on proof the candidate does not control — a code sent to the corporate mailbox, or a reference submitted through a one-time link sent to the referee. Codes and tokens are stored only as SHA-256 hashes ([`docs/quality/SECURITY.md`](docs/quality/SECURITY.md) §8).
- **Zero-PII Public Proofs:** Public evidence verification uses SHA-256 proofs without exposing personal candidate data (BR-150, BR-155).
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

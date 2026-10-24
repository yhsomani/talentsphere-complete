# TalentSphere

Career identity, evidence, learning and hiring in a React application backed by a
Fastify API and PostgreSQL worker. **In development; production readiness is not
established.**

## Start here

- [Documentation index](docs/INDEX.md): topic ownership and reading order.
- [Architecture](ARCHITECTURE.md): implementation, boundaries and failure modes.
- [Implementation coverage](docs/system-model/01-inventory-and-coverage.md): source
  inventory, feature status and documentation audit scope.
- [SSOT](SSOT.md): preserved canonical product intent; requirements are not proof
  of implementation.
- [API contracts](docs/engineering/API_CONTRACTS.md),
  [database](docs/engineering/DATABASE.md),
  [operations](docs/quality/OPERATIONS.md), and
  [testing](docs/quality/TESTING.md): developer references.

## What exists

The API persists accounts, profiles, organizations, jobs, applications, evidence,
work history, messaging and notifications through a boot-hydrated read model.
Dedicated SQL stores handle settings, erasure requests, saved searches/bookmarks,
admin audit, feature flags and billing. Run **one API process per database**;
an advisory lock refuses a second writer.

Stripe Checkout, Customer Portal, signed webhooks and subscription reconciliation
exist in source. Billing defaults to disabled. Brevo email delivery is opt-in. Neither
adapter's presence proves a successful live payment or mailbox delivery. AI uses
local heuristics; no external model provider is connected.

Learning, assessments, portfolios, resumes, networking and many intelligence
features retain process-local state. Some write durable evidence while losing
their originating records on restart. Challenge evaluation is simulated; worker
batch leases and multi-store erasure have unresolved recovery risks. See the
[conflict register](docs/system-model/03-conflict-register.md) and
[route review](docs/system-model/06-route-authorization.md).

## Local development

Use Node 24 (the CI runtime), pnpm 11.7.0 (the root `packageManager`), and a local
PostgreSQL database. The commands below are operator setup instructions. **Agents
must follow [AGENTS.md](AGENTS.md): installs, builds, emitting typechecks and cache
writes require explicit authorization because build files are read-only.**

1. Run `pnpm install --frozen-lockfile`.
2. Copy `.env.example` to `.env`, then set `DATABASE_URL` and a private, stable
   `TOKEN_SECRET`. API and worker load `.env` from the root or two directories
   above their working directory. Existing environment values take precedence.
3. For **local PostgreSQL**, run `pnpm db:migrate`. This changes the database and
   may create it. Do not use this runner on hosted Supabase; follow the
   [hosted migration gate](docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md).
4. Run `pnpm build` before `pnpm dev`. API and worker `dev` scripts execute
   `dist/index.js`; they do not compile or watch TypeScript. Rebuild and restart
   those processes after source changes. The web `dev` script runs Vite.
5. Open `http://localhost:5173`. The API defaults to port 4000; Vite proxies `/api`
   there. `/health` is liveness, not database or delivery acceptance.

For disposable development, `STORAGE=memory` avoids a database but loses data on
restart; the separate worker idles and does not process the API's memory queue.
It is refused by deployed API startup checks. Keep `BILLING_MODE=disabled` unless
intentionally configuring the billing adapter.

On Windows, use `pnpm.cmd` if PowerShell blocks the `pnpm.ps1` shim. No change to
machine execution policy is necessary.

## Checks and contribution

Root scripts: `pnpm test` (Vitest unit/integration/security), `pnpm test:pg`
(isolated PostgreSQL via `TEST_DATABASE_URL`), `pnpm test:e2e` (Playwright),
`pnpm lint` (Prettier check), and `pnpm typecheck` (emitting project-reference
build). Prerequisites, read-only alternatives and evidence limits are in
[TESTING.md](docs/quality/TESTING.md). Dated test counts in reports describe their
recorded source revisions, not this checkout.

Keep domain rules in `packages/domain`, request validation in `packages/contracts`,
and persistence/provider code behind the API or worker boundaries. Update the
owning document and relevant tests when behavior changes. UI changes require a
real browser verdict under [Reticle](RETICLE.md). Never promote documented,
implemented, verified and production-ready to equivalent statuses.

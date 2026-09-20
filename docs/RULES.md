# Development Rules — TalentSphere

These rules govern how code is written in this project. All AI and human contributors must follow them.

---

## General Principles

1. **Read before writing** — Always inspect existing implementation before creating new code.
2. **Reuse before creating** — Use existing components, hooks, and services before writing new ones.
3. **Small functions** — Functions should do one thing. Break up anything over ~50 lines.
4. **No duplication** — Never copy-paste logic. Extract to a shared utility or hook.
5. **No scope creep** — Do not modify files unrelated to the current task.
6. **TypeScript everywhere** — Never use `any`. Prefer explicit types.
7. **Verify before committing** — Run lint, type-check, and tests before marking a task done.
8. **Naming Conventions** —  Use clear, descriptive, and consistent names for files, folders, components, functions, variables, hooks, services, and types. Follow the project’s established naming conventions and avoid vague abbreviations or ambiguous names.

---

## Architecture Rules

1. **Thin page files** — `src/app/**/page.tsx` files are entry points only. They import from `features/`.
2. **Feature modules** — Domain logic lives in `src/features/<domain>/`.
3. **Service layer** — All Supabase / API calls go in `src/services/*.service.ts`.
4. **No database logic in UI** — Components must not contain Supabase queries directly.
5. **Hooks for state** — Complex state belongs in custom hooks or Zustand stores.
6. **Types in one place** — Domain types belong in `src/types/index.ts`.
7. **Never bypass RLS** — Authorization must be enforced at the database layer via RLS, not only in UI.

---

## Document Hierarchy & Single Source of Truth (SSOT)

Before touching any code or creating tasks, understand the document hierarchy:
1. **Authoritative Requirements Baseline**: `TalentSphere Project & Product Specification.md` (The Master SSOT for all 424 functional & non-functional requirements across 23 modules).
2. **Implementation Control Tracker**: `IMPLEMENTATION_TRACKER.md` (The living status of all 424 requirements: verified implementation state, evidence, remaining tasks).
3. **Product Vision**: `docs/PRD.md` (Personas, graduation flywheel, domain modules, release roadmap).
4. **Design System**: `docs/DESIGN.md` (Aether Slate / Orchid dark theme, Geist typography, component primitives, UI patterns).
5. **Architectural Decisions**: `docs/DECISIONS.md` (ADR-001 through ADR-014).
6. **Security & Compliance**: `docs/SECURITY.md` (Dual-layer proxy/RLS, 5 storage buckets, FERPA, GDPR, EEO).
7. **Testing Strategy**: `docs/TEST_PLAN.md` (Test suites, database pooler integration, Playwright E2E).

---

## Architecture & Framework Rules (Next.js 16)

1. **Thin page files** — `src/app/**/page.tsx` files are entry points only. They import from `src/features/<domain>/`.
2. **Feature modules** — Domain logic, UI components, custom hooks, and domain-specific types live in `src/features/<domain>/`.
3. **Proxy over Middleware** — In Next.js 16, route protection and auth redirects are strictly handled in `src/proxy.ts` via `export function proxy()`. Do NOT create `middleware.ts`.
4. **Service layer** — All Supabase database calls go in `src/services/*.service.ts`.
5. **No database logic in UI** — Components must never invoke `supabase.from(...)` directly; call the service layer.
6. **Hooks for state** — Local UI state in React hooks; cross-component client state in Zustand stores (`src/stores/`).
7. **Shared types** — Global domain types belong in `src/types/index.ts`.
8. **Never bypass RLS** — Authorization must be enforced at the database layer via RLS across all 46 tables.

---

## UI & Component Rules

1. Use only components from `src/components/ui/` for base primitives (Button, Input, Card, Badge, Modal, etc.).
2. Follow `DESIGN.md` for colors (Aether Slate / Orchid palette), typography (Geist Sans / Mono), and border radii.
3. All views must be fully responsive across mobile (375px), tablet (768px), and desktop (1280px+).
4. All interactive views must supply:
   - Loading state (skeleton or subtle pulse)
   - Empty state (clean illustration/icon + clear call to action)
   - Error state (user-friendly message + retry trigger)
5. All interactive elements must be keyboard accessible with visible focus rings (`focus-visible:ring-2`).
6. All icon-only buttons must include descriptive `aria-label` attributes.
7. Use `cn()` (from `@/components/ui`) for conditional class merging.

---

## TypeScript Rules

1. Never use `any` — use `unknown` and type guards if narrowing is required.
2. All function parameters, return values, and Server Actions must have explicit type annotations.
3. Prefer `interface` for extensible entity schemas; use `type` for unions, primitives, and utility types.
4. Use `import type { ... }` for type-only imports to allow efficient bundler tree-shaking.
5. All exported React components must define explicit prop interfaces.

---

## Security & Secrets Rules

1. **Secrets isolation** — All API keys and secrets belong in `.env.local` (strictly gitignored).
2. **Public variables** — Only variables prefixed with `NEXT_PUBLIC_` may be referenced in client components.
3. **Server-side validation** — Client-side Zod/React Hook Form is for UX; every Server Action and service mutation must validate inputs on the server.
4. **Session verification** — Never trust client-provided `userId`, `candidateId`, or `organizationId`; verify via `supabase.auth.getUser()`.
5. **No raw SQL concatenation** — Use parameterized queries (`$1`, `$2` or Supabase query builders) to prevent SQL injection.

---

## Testing & Quality Assurance Rules

1. **Test Runner**: Tests execute via Node.js native test runner: `npm test` (`node --test`).
2. **Pooler Integration**: Relational queries and schema consistency must be validated against the live Supabase pooler (port 5432/6543) in `tests/*.test.mjs`.
3. **Zero Test Regressions**: All 29 tests must pass with zero failures before committing or completing tasks.
4. **Zero Lint Errors**: Run `npm run lint` — maintain 0 errors and 0 warnings.
5. **Clean Build**: Run `npm run build` — all 30 App Router routes must compile cleanly in Turbopack.
6. **Windows CLI**: When running commands on Windows, use `npm.cmd` or `npx.cmd`.

---

## Git & Commit Conventions

1. Make atomic commits: one logical feature, refactor, or fix per commit.
2. Commit message format: `type(scope): description`
   - Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `docs(decisions): record ADR-009 through ADR-014`
3. Never commit `.env.local`, build artifacts (`.next/`), or temporary scratch files.

---

*Rules v2.0.0 — TalentSphere Engineering Standards*

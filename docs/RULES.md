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

## Before Coding Any Task

1. Read `PRD.md` — understand what we're building and why.
2. Read `ARCHITECTURE.md` — understand how the codebase is organized.
3. Read `DESIGN.md` — understand the visual system.
4. Search for existing implementations in `src/features/`, `src/components/`, `src/services/`.
5. Make a plan for the task before writing code. For large changes, describe the approach first.
6. Confirm which files will be touched and which will be left unchanged.

---

## UI / Component Rules

1. Use only components from `src/components/ui/` for base elements.
2. Follow `DESIGN.md` for colors, typography, spacing, and border radii.
3. All pages must be mobile-responsive (test at 375px, 768px, 1280px).
4. All pages must have:
   - Loading state (skeleton or spinner)
   - Empty state (when no data exists)
   - Error state (when fetch fails)
5. All interactive elements must be keyboard accessible with visible focus rings.
6. All icon-only buttons must have `aria-label` attributes.
7. Never use inline styles for values available in Tailwind.
8. Use `cn()` (from `@/components/ui`) to merge conditional class names.

---

## TypeScript Rules

1. Never use `any` — use `unknown` and narrow if needed.
2. All function parameters and return values must be typed.
3. Prefer `interface` for object shapes that can be extended.
4. Prefer `type` for unions, primitives, and non-extensible shapes.
5. Import types with `import type { ... }` when the import is type-only.
6. All exported components must have explicit prop interfaces.

---

## Security Rules

1. **Never expose secrets client-side** — all secret keys in `.env.local` only.
2. **Use `NEXT_PUBLIC_` prefix only for values safe to expose to browser**.
3. **Validate input on the server** — client-side validation is UX only, not security.
4. **Verify auth in every Server Action** — do not trust client-sent user IDs.
5. **Row-Level Security** — every Supabase table must have RLS enabled.
6. **No direct SQL** — use Supabase client methods, not raw SQL in application code.
7. **Parameterize queries** — never interpolate user input into query strings.
8. **Sanitize display data** — avoid dangerouslySetInnerHTML; use text nodes.

---

## Data Access Rules

1. Browser client (`createBrowserClient`) — for client components only.
2. Server client (`createServerClient`) — for Server Components and Route Handlers.
3. Admin client (`createAdminClient`) — only for privileged background operations.
4. All service functions must handle errors gracefully and return `null` or throw.
5. Never leak service layer errors directly to the UI — show user-friendly messages.

---

## Testing Rules

1. Add tests for all new critical paths (auth, data mutations, key calculations).
2. Run existing tests after every task: `npm test`.
3. Do not commit code that breaks existing tests.
4. Test file convention: `*.test.mjs` in `tests/` folder (unit) or `tests/e2e/` (E2E).

---

## Git / Commit Rules

1. Make small, atomic commits — one feature or fix per commit.
2. Commit message format: `type(scope): description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Examples: `feat(jobs): add job search filter by salary`, `fix(auth): handle expired session`
3. Never commit `.env.local` or secrets.
4. Never commit broken code to `main`.
5. Use feature branches: `feature/<name>`, `fix/<name>`.

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `JobCard.tsx` |
| Hooks | camelCase with `use` prefix | `useJobs.ts` |
| Services | camelCase with `.service.ts` | `jobs.service.ts` |
| Types | PascalCase | `JobListing`, `UserRole` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| CSS class utilities | Tailwind conventions | — |
| Files | kebab-case for non-components | `use-jobs.ts` |

---

## Prohibited Patterns

❌ `import * as React from 'react'` — use named imports  
❌ Hardcoded URLs in components — use env vars or config  
❌ `console.log()` in production code — remove before commit  
❌ Inline `style={{}}` for values that Tailwind covers  
❌ Mutating state directly — always use setter functions  
❌ `setTimeout` for polling — use proper async patterns  
❌ Storing auth tokens in `localStorage` — Supabase handles this  

---

*Rules v1.0 — TalentSphere*

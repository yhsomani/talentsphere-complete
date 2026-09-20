# Architecture Decision Records — TalentSphere

This file records key technical decisions made during development.
Do not change these without discussion and a new ADR entry.

---

## ADR-001: Next.js App Router (not Pages Router)

**Status**: Accepted  
**Date**: Project Start

**Decision**: Use Next.js App Router exclusively.

**Reason**:
- App Router enables React Server Components by default, reducing client-side JavaScript.
- Nested layouts avoid prop-drilling for auth state.
- Native Server Actions for mutations (no separate API routes needed for basic CRUD).
- Aligned with Next.js 16 deprecation of Pages Router patterns.

**Consequences**:
- All `page.tsx` files are Server Components by default.
- Client Components must explicitly add `'use client'` directive.
- Careful management of server/client boundary is required.

---

## ADR-002: Supabase as Unified Backend

**Status**: Accepted  
**Date**: Project Start

**Decision**: Use Supabase for all backend services (Auth, Database, Storage, Realtime).

**Reason**:
- Provides PostgreSQL + authentication + row-level security without managing infrastructure.
- Supabase SSR package handles cookie-based sessions correctly with Next.js.
- Real-time subscriptions available for messages and notifications without WebSocket server.
- Built-in storage for avatars, resumes, and course content.

**Alternatives Considered**:
- Firebase: Less SQL-capable, no row-level security.
- Prisma + custom auth: More control but much more infrastructure to manage.
- AWS Amplify: Too complex for current team size.

---

## ADR-003: Thin Page Entry Points Pattern

**Status**: Accepted  
**Date**: Project Start

**Decision**: `src/app/**/page.tsx` files are thin entry points that import from `src/features/`.

**Reason**:
- Keeps route files minimal and readable.
- Feature logic can be tested independently of routing.
- Supports co-location of feature-specific components, hooks, and types.

**Pattern**:
```typescript
// src/app/jobs/page.tsx
import JobsListPage from '@/features/jobs/JobsListPage';
export default function Page() { return <JobsListPage />; }
```

---

## ADR-004: Zustand for Client State

**Status**: Accepted  
**Date**: Project Start

**Decision**: Use Zustand for client-side global state management.

**Reason**:
- Simpler API than Redux with much less boilerplate.
- Works well with React Server Components (client components opt in explicitly).
- No context wrapping required at root level.

**Stores**:
- `useAuthStore` — Auth state (user, isAuthenticated)
- `useUIStore` — UI state (sidebar open, theme, modal state)
- `useGamificationStore` — XP, level, badges

---

## ADR-005: Row-Level Security as Primary Authorization Boundary

**Status**: Accepted  
**Date**: Project Start

**Decision**: Supabase Row-Level Security (RLS) is the primary authorization mechanism.
Middleware and client-side checks are secondary (UX) layers only.

**Reason**:
- Database-level security cannot be bypassed by client code.
- RLS policies centralize authorization logic in one place.
- Reduces risk of authorization bugs in application code.

**Consequences**:
- All tables must have RLS enabled.
- Service role key (admin client) is restricted to server-only operations.
- Application code never needs to check user ownership for data queries — RLS handles it.

---

## ADR-006: middleware → proxy Migration (Next.js 16)

**Status**: Accepted  
**Date**: Current Session

**Decision**: Migrate `src/middleware.ts` to `src/proxy.ts` with `export function proxy()`.

**Reason**:
- Next.js 16 deprecated the `middleware` file convention.
- The new `proxy` convention aligns with Next.js's direction toward explicit proxy semantics.
- Build emits deprecation warning; failing to migrate will eventually become a build error.

**Migration**:
- Created `src/proxy.ts` with identical logic, function renamed from `middleware` to `proxy`.
- Old `src/middleware.ts` can be deleted once proxy.ts is verified.

---

## ADR-007: Service Layer for Data Access

**Status**: Accepted  
**Date**: Project Start

**Decision**: All Supabase database operations are encapsulated in `src/services/*.service.ts` files.

**Reason**:
- UI components should not contain query logic.
- Centralizes error handling and data transformation.
- Enables testing services in isolation without rendering.
- Easy to swap Supabase for another provider if needed.

**Pattern**:
```typescript
// src/services/jobs.service.ts
export const jobService = {
  async getJobs(filters: JobFilters, page: number) { ... },
  async getJob(id: string) { ... },
  async createJob(data: JobInsert) { ... },
};
```

---

## ADR-008: Tailwind CSS v4 (not v3)

**Status**: Accepted  
**Date**: Project Start

**Decision**: Use Tailwind CSS v4 with `@import "tailwindcss"` and CSS custom properties.

**Reason**:
- v4 introduces CSS-native configuration (no `tailwind.config.ts` file needed).
- Better performance with new oxide engine.
- Simpler theming via CSS variables in `globals.css`.

**Consequences**:
- Color utilities reference CSS variables, not hard-coded colors.
- Some v3 utilities may have different names in v4.
- Arbitrary values may need different syntax.

---

*Last Updated: Current Session*

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

**Status**: Accepted (Implemented)  
**Date**: 2026-09-20

**Decision**: Migrate `src/middleware.ts` to `src/proxy.ts` with `export function proxy()`.

**Reason**:
- Next.js 16 deprecated the `middleware` file convention in favor of explicit proxy routing.
- The new `proxy` convention provides explicit proxy semantics and integrates cleanly with Next.js 16 runtime internals.
- Build emits deprecation warnings if `middleware.ts` is present; removing it guarantees a clean build.

**Consequences**:
- `src/proxy.ts` is the active gateway for route protection and auth redirects.
- `src/middleware.ts` has been permanently deleted.
- Route matching and cookie-based Supabase session inspection are maintained with zero regression.

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
- The project utilizes the Aether Slate / Orchid dark-theme palette defined in `src/app/globals.css`.
- Arbitrary values use native CSS variables rather than JS config lookups.

---

## ADR-009: Gamification XP Ledger & Level Progression Engine

**Status**: Accepted  
**Date**: 2026-09-20

**Decision**: Implement gamification using an immutable, append-only `xp_ledger` paired with transactional balance reconciliation in `user_levels`.

**Reason**:
- Prevents balance drift, race conditions, and gamification exploits.
- Idempotency keys (`idempotency_key`) guarantee that network retries for course completions, challenge submissions, or daily login streaks never award duplicate XP.
- Full auditability: every point of XP has an immutable reason, source entity reference, and timestamp.

**Architecture**:
- `xp_ledger(id, user_id, amount, reason, entity_id, idempotency_key, created_at)`
- `user_levels(user_id, current_level, current_xp, next_level_xp, total_xp_earned, streak_days, last_active_date)`
- Level progression algorithm: Level \(n\) requires \(500 \times n\) XP with progressive scaling.

---

## ADR-010: Candidate Profile Sub-Entities Normalization

**Status**: Accepted  
**Date**: 2026-09-20

**Decision**: Model candidate qualifications across normalized relational tables (`candidate_profiles`, `skills`, `candidate_skills`, `experience`, `education`, `certifications`, `portfolio_items`) rather than an unindexed JSONB blob.

**Reason**:
- Enables high-performance SQL indexing for recruiter talent discovery (e.g., filtering candidates by exact skill proficiency, degree level, or minimum years of experience).
- Guarantees referential integrity with foreign key constraints to verified skills taxonomy.
- Simplifies atomic updates: a candidate editing an education entry does not risk overwriting work experience or skill ratings.

---

## ADR-011: ATS 7-Stage Pipeline & Structured Scorecards Rubric

**Status**: Accepted  
**Date**: 2026-09-20

**Decision**: Standardize applicant tracking with a 7-stage hiring pipeline (`applied`, `screening`, `interview_1`, `interview_2`, `technical`, `offer`, `hired`/`rejected`), complete transition audit logging (`application_activity_log`), and structured interview scorecards (`scorecards`).

**Reason**:
- Removes hiring bias through structured scoring (1–5 rubric across domain competence, problem-solving, communication, culture add).
- Implements strict recommendations (`strong_hire`, `hire`, `neutral`, `do_not_hire`, `strong_no_hire`) with private interviewer notes.
- Guarantees full EEO compliance audit trails: every stage move, reviewer, and timestamp is immutably logged in `application_activity_log`.

---

## ADR-012: Provider-Agnostic Media Engine & Video Processing

**Status**: Accepted  
**Date**: 2026-09-20

**Decision**: Abstract rich media uploads, video resume recordings, and LMS video streaming behind `media_assets` and `transcoding_jobs` with storage adapter interfaces.

**Reason**:
- Decouples video delivery from specific cloud storage vendors.
- Supports asynchronous video transcoding (multi-bitrate HLS chunking for adaptive bitrate streaming in LMS lessons and candidate video pitches).
- Enforces strict mime-type validation, size limits (100MB video, 10MB PDF), and time-limited signed URLs for private educational and recruiter content.

---

## ADR-013: Institutional Multi-Tenancy & B2B2C Graduation Flywheel

**Status**: Accepted  
**Date**: 2026-09-20

**Decision**: Model university cohorts, bootcamps, and enterprise academies via `organizations(type = 'institution')` and `institution_members`, providing automated transition to the global recruitment marketplace upon graduation.

**Reason**:
- Drives TalentSphere's core B2B2C flywheel: institutions license LMS & Code Arena to train cohorts; upon graduation, student profiles seamlessly transition into the candidate marketplace with verified institutional credentials and alumni badges.
- Guarantees student FERPA compliance: academic progress, internal grades, and early code arena scores are confidential to institutional faculty until the candidate explicitly toggles their profile to public/marketplace visibility.

---

## ADR-014: Automated Test Strategy & Supabase Pooler Validation

**Status**: Accepted  
**Date**: 2026-09-20

**Decision**: Execute continuous verification using a three-tier test architecture: fast unit tests (`src/utils/index.test.ts`), live schema and relational query verification against the Supabase connection pooler (`tests/*.test.mjs`), and Playwright E2E browser tests.

**Reason**:
- Pure mock-based unit tests mask schema drift, foreign key mismatches, and Postgres syntax errors (such as missing join columns or undefined table aliases).
- Validating service queries directly against the live PostgreSQL 17 pooler ensures that RLS policies, column types, and relational foreign keys work identically in staging and production.
- Keeps feedback cycles fast: all 29 automated tests execute in under 10 seconds.

---

*Last Updated: 2026-09-20 — Architecture Decision Records v2.0.0*

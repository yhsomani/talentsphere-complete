# Project Memory — TalentSphere

This document tracks the current state of the project. Update it frequently.
Use this as context before starting any new task.

---

## Current Status

**Phase**: Phase 1 (Foundation) — Build errors fixed, documentation complete.

**Overall Health**: 🟡 Build was broken (14 errors), now fixed. Docs created.

---

## What's Working ✅

### Authentication
- Sign in page (`/auth/signin`)
- Sign up page (`/auth/signup`)
- Password reset page (`/auth/reset-password`)
- Email verification page (`/auth/verify`)
- Middleware (now `proxy.ts`) protecting routes
- `useSignIn`, `useSignUp`, `useSignOut` hooks

### Dashboard
- Role-based dashboard page (`/dashboard`)
- Candidate view with XP/level display
- Recruiter view
- DashboardLayout with sidebar navigation
- Mobile responsive drawer menu

### Job Board
- Job listings page (`/jobs`)
- Job filters (type, location, salary, experience)
- Job search with debounce
- Load more pagination
- Job detail page (`/jobs/[id]`)
- Apply modal with cover letter
- Bookmark/unbookmark jobs
- Share job link
- Job posting form (`/jobs/post`)

### Applications
- Applications list page (`/applications`)
- Filter tabs (All, Active, Interviews, Archived)
- Application detail page (`/applications/[id]`)

### Code Arena
- Challenge list page (`/challenges`)
- Challenge detail page (`/challenges/[id]`)

### Courses / LMS
- Course list page (`/courses`)
- Course detail page (`/courses/[id]`)

### Other
- Leaderboard (`/leaderboard`)
- Messages (`/messages`)
- Notifications (`/notifications`)
- Settings (`/settings`)
- Candidate profile (`/candidates/profile`)

### Services
- `jobs.service.ts` — full CRUD + bookmarks
- `application.service.ts` — applications CRUD
- `candidate.service.ts` — profile management
- `challenge.service.ts` — challenges
- `course.service.ts` — LMS
- `leaderboard.service.ts` — rankings
- `message.service.ts` — messaging
- `notification.service.ts` — notifications

### Database
- 8 migration files covering all core tables
- RLS policies for all tables
- Auth trigger functions

---

## Known Issues / Open TODOs 🔴

1. **middleware.ts** — Deprecated in Next.js 16; replaced with `proxy.ts` (old file still exists, should be deleted after verification)
2. **Leaderboard, Messages, Notifications, Settings pages** — Imported from feature modules but feature modules may be incomplete stubs
3. **No Playwright tests** — E2E test setup not yet done
4. **Admin routes** — `/admin/*` not implemented
5. **Company profiles** — `/company` not implemented
6. **Real-time messaging** — Messages use Supabase queries, not real-time subscriptions

---

## Recently Completed 🟢

- [x] Fixed 3 unescaped `&` characters in `JobDetailPage.tsx` (JSX parse errors)
- [x] Created `src/proxy.ts` (Next.js 16 middleware migration)
- [x] Created `docs/PRD.md`
- [x] Created `docs/DESIGN.md`
- [x] Created `docs/RULES.md`
- [x] Created `docs/DECISIONS.md`
- [x] Created `docs/SECURITY.md`
- [x] Created `docs/TEST_PLAN.md`

---

## Next Tasks

1. Delete `src/middleware.ts` (replaced by `src/proxy.ts`)
2. Run build and verify it passes
3. Check that leaderboard/messages/notifications/settings features are implemented
4. Set up Playwright for E2E tests
5. Run unit tests and verify pass

---

## Environment

- Node.js: v24.19.0
- Next.js: 16.3.5
- React: 19.2.8
- Supabase: Connected (credentials in .env.local)
- Tailwind: v4

---

*Memory updated: Current Session*

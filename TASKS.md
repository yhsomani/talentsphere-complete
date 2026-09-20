# TASKS.md — TalentSphere

> This is the master task list for building TalentSphere following the Vibe Coding workflow.
> Update this file frequently. Mark tasks as they are completed.

---

## Legend
- `[x]` = Done
- `[/]` = In Progress
- `[ ]` = Not Started

---

## Phase 0: Foundation & Documentation

- [x] Audit existing codebase
- [x] Read Next.js 16 docs (proxy.md, authentication.md, forms.md)
- [x] Create `docs/PRD.md`
- [x] Create `docs/DESIGN.md`
- [x] Create `docs/RULES.md`
- [x] Create `docs/DECISIONS.md`
- [x] Create `docs/SECURITY.md`
- [x] Create `docs/TEST_PLAN.md`
- [x] Create `docs/MEMORY.md`
- [x] Create `TASKS.md`
- [x] Create `.cursor/rules/*.mdc`
- [x] Update `.env.example`

---

## Phase 1: Build Errors & Infrastructure

- [x] Fix `JobDetailPage.tsx` — Unescaped `&` in JSX text (lines 308, 323, 337)
- [x] Verify `DashboardLayout.tsx` has `export default DashboardLayout`
- [x] Migrate `middleware.ts` → `proxy.ts` (Next.js 16)
- [ ] Delete deprecated `middleware.ts`
- [ ] Verify build passes: `npm run build`
- [ ] Verify TypeScript: `npx tsc --noEmit`
- [ ] Verify lint: `npm run lint`
- [ ] Verify unit tests: `npm test`

---

## Phase 2: Feature Completion

### Authentication
- [x] Sign-in page
- [x] Sign-up page  
- [x] Password reset page
- [x] Email verification page
- [x] Auth hooks (useSignIn, useSignUp, useSignOut)
- [x] Auth proxy (protect routes)
- [ ] Google OAuth button (currently disabled stub)
- [ ] GitHub OAuth button (currently disabled stub)

### Dashboard
- [x] Candidate dashboard view
- [x] Recruiter dashboard view
- [x] XP progress display
- [ ] Admin dashboard view

### Job Board
- [x] Jobs listing page
- [x] Job filters
- [x] Job search
- [x] Job detail page
- [x] Apply modal
- [x] Application tracking
- [x] Job posting form (recruiter)

### Applications
- [x] Applications list page
- [x] Application detail page
- [ ] Application status updates (recruiter changes status)

### Code Arena / Challenges
- [x] Challenge list page
- [x] Challenge solver page
- [ ] Code execution (requires backend code runner)
- [ ] Challenge submission grading

### Courses / LMS
- [x] Course list page
- [x] Course detail page
- [x] Lesson player page
- [ ] Lesson completion tracking
- [ ] Course progress persistence

### Leaderboard
- [x] Leaderboard page

### Messages
- [x] Messages page (static)
- [ ] Real-time message subscriptions

### Notifications
- [x] Notifications page

### Settings
- [x] Settings page

### Profile
- [x] Candidate profile view
- [ ] Profile edit (update skills, bio, avatar)
- [ ] Resume upload

### Candidates Directory
- [x] Candidates list (recruiter view)
- [ ] Candidate detail view

---

## Phase 3: Testing

- [ ] Run unit tests (`npm test`)
- [ ] Install Playwright (`npm install -D @playwright/test`)
- [ ] Configure Playwright (`playwright.config.ts`)
- [ ] Write E2E test: Auth flow (signup, login, logout)
- [ ] Write E2E test: Job browsing
- [ ] Write E2E test: Job application
- [ ] Write E2E test: Application tracking
- [ ] Write E2E test: Responsive breakpoints
- [ ] Run E2E tests: `npx playwright test`

---

## Phase 4: Security Review

- [x] All RLS policies in migrations
- [x] Auth proxy protecting routes
- [x] Server-side auth check in dashboard
- [x] `SUPABASE_SERVICE_ROLE_KEY` not exposed to client
- [ ] Manually verify RLS prevents cross-user data access
- [ ] Input validation in all Server Actions
- [ ] File upload size/type enforcement
- [ ] Content Security Policy headers

---

## Phase 5: Performance & Quality

- [ ] All pages have loading skeletons (check each route)
- [ ] All pages have empty states
- [ ] All pages have error states
- [ ] Mobile responsive at 375px (test each page)
- [ ] Lighthouse performance score > 80
- [ ] Image optimization (next/image)

---

## Phase 6: Pre-Production Deployment

- [ ] Create Vercel project
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy to Vercel preview
- [ ] Run QA checklist from `TEST_PLAN.md`
- [ ] Fix any issues found in QA
- [ ] Deploy to Vercel production
- [ ] Update README.md with live URL

---

*Tasks updated: Current Session — v1.0*

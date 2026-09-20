# TalentSphere — The Unified Talent Operating System

TalentSphere closes the structural gap between learning, verifiable skill evaluation, and hiring. Built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

---

## ✅ Production Status

| Check | Result |
|-------|--------|
| `npm run build` | ✅ 0 errors — 26 pages generated |
| `npx tsc --noEmit` | ✅ 0 TypeScript errors |
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm test` | ✅ 28/28 pass |
| E2E tests | ✅ Playwright configured (3 spec files) |

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library (`src/components/ui/`)
- **State**: Zustand
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL, 46 tables)
- **Authentication**: Supabase Auth + `src/proxy.ts` route protection
- **Authorization**: Row-Level Security (RLS) on all tables
- **Storage**: Supabase Storage

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Build**: Turbopack (3.4s production compile)

---

## Getting Started

### Prerequisites
- Node.js 20+ (Node.js 24 recommended)
- npm
- Supabase account

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

Run migrations in order in the Supabase SQL Editor:

```
supabase/001_core_extensions_enums.sql
supabase/002_users_organizations.sql
supabase/003_jobs_applications.sql
supabase/004_lms.sql
supabase/005_challenges.sql
supabase/006_gamification_notifications.sql
supabase/007_rls_policies.sql
supabase/008_auth_trigger_functions.sql
```

Or use the combined migration: `supabase/ALL_MIGRATIONS_COMBINED.sql`

### Create Supabase Storage Buckets

| Bucket | Access |
|--------|--------|
| `avatars` | Public |
| `resumes` | Private |
| `course-content` | Private |
| `portfolio` | Public |
| `media-assets` | Private |

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint (0 errors, 0 warnings) |
| `npm test` | Unit + integration tests (28/28) |
| `npx tsc --noEmit` | TypeScript check |
| `npx playwright install` | Install E2E browsers (first time) |
| `npx playwright test` | Run E2E tests |

---

## Project Structure

```
talentsphere-complete/
├── docs/                         # Vibe Coding documentation
│   ├── PRD.md                    # Product Requirements
│   ├── DESIGN.md                 # Design System
│   ├── RULES.md                  # Development Rules
│   ├── DECISIONS.md              # Architecture Decision Records
│   ├── SECURITY.md               # Security Requirements
│   ├── TEST_PLAN.md              # Test Plan
│   └── MEMORY.md                 # Project State (update per session)
├── .cursor/rules/                # AI coding assistant rules
│   ├── general.mdc
│   ├── frontend.mdc
│   ├── backend.mdc
│   └── testing.mdc
├── src/
│   ├── app/                      # Next.js App Router (thin entry points)
│   ├── features/                 # Feature modules (UI + business logic)
│   ├── services/                 # Data access layer (Supabase queries)
│   ├── components/               # Shared components (UI + layout)
│   ├── lib/                      # Supabase client setup
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
│   └── proxy.ts                  # Next.js 16 auth middleware
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── e2e/                      # Playwright E2E tests
│   └── *.test.mjs                # Node.js test runner tests
├── supabase/                     # Database migrations + RLS
├── ARCHITECTURE.md               # Detailed architecture docs
├── .env.example                  # Environment variable template
└── playwright.config.ts          # E2E test configuration
```

---

## Features

### For Candidates
- 🔐 Secure authentication (email + password)
- 📊 Gamified dashboard (XP, levels, badges)
- 💼 Job board with search, filters, bookmarks
- 📝 Job applications with cover letter + tracking
- 🏆 Code Arena — coding challenges with solver UI
- 📚 LMS — courses, modules, lesson player
- 🥇 Leaderboard with period filter
- 💬 Messages (conversation list + thread)
- 🔔 Notifications with mark-read
- ⚙️ Settings + Billing
- 👤 Candidate profile with portfolio + skills

### For Recruiters
- 📋 Post job requisitions
- 📂 Manage applications pipeline
- 👥 Browse candidate directory

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

**Key principles:**
1. **Thin pages** — `app/**/page.tsx` are entry points only; all logic in `features/`
2. **Service layer** — All Supabase calls in `services/*.service.ts`
3. **RLS as security boundary** — Row-Level Security policies on all 46 tables
4. **Server-first auth** — Route protection via `src/proxy.ts` (Next.js 16 proxy)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/PRD.md](./docs/PRD.md) | What are we building and why? |
| [docs/ARCHITECTURE.md](./ARCHITECTURE.md) | How does it work? |
| [docs/DESIGN.md](./docs/DESIGN.md) | How should it look and feel? |
| [docs/RULES.md](./docs/RULES.md) | How should AI code? |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Why did we make this decision? |
| [docs/SECURITY.md](./docs/SECURITY.md) | How do we protect it? |
| [docs/TEST_PLAN.md](./docs/TEST_PLAN.md) | How do we verify it works? |
| [docs/MEMORY.md](./docs/MEMORY.md) | What is the current project state? |

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "feat: production ready"
git push origin main
```

2. Go to [vercel.com/new](https://vercel.com/new) → Import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**

Your app will be live at `https://talentsphere-<hash>.vercel.app`.

### Configure Supabase for Production

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: `https://your-vercel-url.vercel.app/auth/callback`

---

## Contributing

1. Read [`docs/RULES.md`](./docs/RULES.md) before making any changes
2. Update [`docs/MEMORY.md`](./docs/MEMORY.md) at the start of each AI session
3. Create a feature branch: `feature/<name>` or `fix/<name>`
4. Follow the Vibe Coding loop: READ → PLAN → IMPLEMENT → TEST → REVIEW → COMMIT → UPDATE DOCS
5. Run `npm test && npm run lint && npm run build` before pushing
6. Submit a pull request

---

## License

Proprietary — All rights reserved

---

**TalentSphere v1.0** — The Unified Talent Operating System  
*Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Vercel*  
*Built following the complete 40-step Vibe Coding methodology*

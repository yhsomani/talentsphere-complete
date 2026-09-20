# TalentSphere - The Unified Talent Operating System

## Overview

TalentSphere is a comprehensive browser-based SaaS application that closes the structural gap between learning, verifiable skill evaluation, professional networking, and hiring. Built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library (`src/components/ui`)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Authorization**: Row-Level Security (RLS)

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: Supabase Cloud

## Project Structure

```
talentsphere/
├── src/
│   ├── app/                      # Next.js App Router pages/routes
│   │   ├── auth/                 # Authentication pages
│   │   ├── candidates/           # Candidate profile pages
│   │   ├── dashboard/            # User dashboard
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page (thin entry point)
│   ├── components/               # Shared React components
│   │   ├── ui/                   # Base UI components (Button, Input, Card, etc.)
│   │   └── layout/               # Layout components (Sidebar, Header)
│   ├── config/                   # Application configuration
│   ├── features/                 # Feature modules (domain-specific)
│   │   └── home/                 # Home page feature
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Library configurations (Supabase client)
│   ├── stores/                   # Zustand state stores
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── middleware.ts             # Route protection middleware
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables (gitignored)
├── package.json
├── README.md
├── ARCHITECTURE.md               # Detailed architecture documentation
└── IMPLEMENTATION_PROGRESS.md    # Implementation status tracking
```

## Core Features

### For Candidates
- Learn skills through courses (LMS)
- Prove abilities via Code Arena & assessments
- Build verifiable portfolios
- Search and apply to jobs
- Track application status transparently
- Earn XP points and badges (Gamification)

### For Employers/Recruiters
- Post job requisitions
- Run structured ATS pipeline
- Review candidates with verified signals
- Scorecard-based evaluations

### For Institutions (B2B)
- Bulk seat licensing
- Managed learner provisioning
- Cohort management
- B2B2C graduation flywheel

## Getting Started

### Prerequisites
- Node.js 20+ (Node.js 22+ recommended for Supabase compatibility)
- npm or pnpm
- Supabase account (for backend integration)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Set up Supabase database**:
   
   **Option A: Using Supabase CLI** (Recommended)
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-id
   
   # Apply migrations
   ./scripts/setup-database.sh
   ```
   
   **Option B: Manual Setup**
   - Go to SQL Editor in Supabase dashboard
   - Execute migration files in order:
     - `supabase/001_core_extensions_enums.sql`
     - `supabase/002_users_organizations.sql`
     - `supabase/003_jobs_applications.sql`
     - `supabase/004_lms.sql`
     - `supabase/005_challenges.sql`
     - `supabase/006_gamification_notifications.sql`
     - `supabase/007_rls_policies.sql`
     - `supabase/008_auth_trigger_functions.sql`

4. **Create Storage Buckets** in Supabase Dashboard:
   - Navigate to Storage → Create bucket
   - Create these buckets:
     - `avatars` (Public)
     - `resumes` (Private)
     - `course-content` (Private)
     - `portfolio` (Public)

5. **Configure Authentication**:
   - Go to Authentication → Providers
   - Enable Email provider
   - Optionally configure OAuth providers (Google, GitHub)
   - Set site URL to `http://localhost:3000`
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`

6. **Run development server**:
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation on:
- Folder structure and organization
- Separation of concerns
- Data flow
- Security (RLS, middleware)
- Deployment

## Implementation Status

### ✅ Phase 0: Environment & Database Setup (COMPLETE)
- Environment configuration template
- Database setup script
- Dashboard page with role-based content
- Documentation

### ✅ Phase 1: Foundation (COMPLETE)
- Next.js 16 with App Router
- TypeScript configuration
- Tailwind CSS v4
- Type definitions (complete domain model)
- Configuration module
- Supabase client setup
- Zustand state stores
- Custom React hooks
- UI component library
- Layout components
- Landing page
- Authentication pages (signin, signup, reset-password)
- Middleware for route protection
- Candidate profile page

### ⏳ Next Phases
1. Job board functionality
2. Company profiles
3. Application tracking system
4. Code Arena implementation
5. LMS integration
6. Messaging & notifications
7. Admin panel

## Key Architecture Decisions

1. **Modular Monolith** - Single codebase with clear boundaries
2. **Server-First** - Next.js Server Components where possible
3. **RLS Authorization** - Row-Level Security as final boundary
4. **Human-in-the-Loop AI** - AI assists, humans decide
5. **Verified Over Claimed** - All skills must be verifiable

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass (when implemented)
4. Submit a pull request

## License

Proprietary - All rights reserved

---

**Built according to the TalentSphere Project & Product Specification**  
*Version: 0.1.0*

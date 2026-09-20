# TalentSphere Architecture

## Overview

TalentSphere is a Unified Talent Operating System built with Next.js 16, TypeScript, and Supabase. This document describes the architectural decisions, folder structure, and separation of concerns implemented in the codebase.

## Architecture Principles

1. **Separation of Concerns**: UI, styling, business logic, data access, and types are separated into distinct modules
2. **Feature-First Organization**: Related functionality is grouped by feature domain
3. **Framework Compliance**: Respects Next.js App Router conventions while maintaining clean architecture
4. **Type Safety**: Comprehensive TypeScript types for all domain models
5. **Reusable Components**: Shared UI components extracted to maximize reusability

## Folder Structure

```
talentsphere/
├── src/
│   ├── app/                      # Next.js App Router (routes & pages)
│   │   ├── auth/                 # Authentication routes
│   │   │   ├── signin/           # Sign-in page (thin entry point)
│   │   │   ├── signup/           # Sign-up page (thin entry point)
│   │   │   └── reset-password/   # Password reset page (thin entry point)
│   │   ├── candidates/           # Candidate-related routes
│   │   │   └── profile/          # Profile management page
│   │   ├── dashboard/            # User dashboard route
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page (thin entry point)
│   │   └── globals.css           # Global styles
│   │
│   ├── components/               # Shared React components
│   │   ├── ui/                   # Base UI components (Button, Input, Card, etc.)
│   │   └── layout/               # Layout components (Sidebar, Header, DashboardLayout)
│   │
│   ├── config/                   # Application configuration
│   │   └── index.ts              # AppConfig, RolePermissions, constants
│   │
│   ├── features/                 # Feature modules (domain-specific functionality)
│   │   ├── home/                 # Home/Landing page feature
│   │   │   ├── HomePage.tsx      # Home page component
│   │   │   └── index.ts          # Feature exports
│   │   ├── auth/                 # Authentication feature (future)
│   │   ├── dashboard/            # Dashboard feature (future)
│   │   └── candidates/           # Candidate feature (future)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── index.ts              # useAuth, useSignIn, useSignUp, usePagination, etc.
│   │
│   ├── lib/                      # Library configurations & clients
│   │   └── supabase.ts           # Supabase client setup
│   │
│   ├── services/                 # API & data access services (8 service files)
│   │   ├── application.service.ts
│   │   ├── candidate.service.ts
│   │   ├── challenge.service.ts
│   │   ├── course.service.ts
│   │   ├── jobs.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── message.service.ts
│   │   └── notification.service.ts
│   │
│   ├── stores/                   # Zustand state management
│   │   └── index.ts              # Auth store, UI store, Gamification store
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── index.ts              # Complete domain model types
│   │   └── domain/               # Domain-specific types (future expansion)
│   │
│   ├── utils/                    # Utility functions
│   │   ├── index.ts              # General utilities (cn, formatDate, etc.)
│   │   ├── format/               # Formatting utilities (future)
│   │   ├── validation/           # Validation utilities (future)
│   │   └── supabase/             # Supabase utilities
│   │       ├── client.ts         # Browser client
│   │       └── server.ts         # Server client
│   │
│   ├── middleware.ts             # Next.js middleware (auth protection)
│   │
│   └── styles/                   # Global styles (future expansion)
│
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment variable template
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── README.md                     # Project overview & setup guide
├── ARCHITECTURE.md               # This file
└── IMPLEMENTATION_PROGRESS.md    # Implementation status tracking
```

## Separation of Concerns

### UI Structure (Components)
- **Location**: `src/components/`, `src/features/*/`
- **Responsibility**: Render UI, handle user interactions
- **Examples**: `DashboardLayout.tsx`, `HomePage.tsx`, `Button.tsx`

### Styling
- **Location**: Inline Tailwind classes, `src/app/globals.css`
- **Responsibility**: Visual presentation
- **Strategy**: Tailwind CSS v4 with utility classes

### Business Logic (Hooks)
- **Location**: `src/hooks/`
- **Responsibility**: State management, side effects, reusable logic
- **Examples**: `useAuth`, `useSignIn`, `usePagination`

### Data Access (Services/Lib)
- **Location**: `src/lib/`, `src/services/`
- **Responsibility**: API calls, database operations
- **Examples**: `supabase.ts` client configuration, 8 service files (`application.service.ts`, `candidate.service.ts`, `challenge.service.ts`, `course.service.ts`, `jobs.service.ts`, `leaderboard.service.ts`, `message.service.ts`, `notification.service.ts`)

### Types
- **Location**: `src/types/`
- **Responsibility**: Type definitions, interfaces, enums
- **Examples**: `User`, `CandidateProfile`, `Job`, `Course`

### Configuration
- **Location**: `src/config/`
- **Responsibility**: App settings, constants, feature flags
- **Examples**: `AppConfig`, `RolePermissions`, `XPRewards`

## Key Architectural Decisions

### 1. Thin Page Entry Points
Next.js route files (`page.tsx`) serve as thin entry points that import from feature modules:

```typescript
// src/app/page.tsx
import { HomePage } from '@/features/home';

export default function Page() {
  return <HomePage />;
}
```

This keeps route files minimal and allows feature logic to be tested independently.

### 2. Feature Modules
Features encapsulate domain-specific functionality:

```
src/features/home/
├── HomePage.tsx      # Component implementation
└── index.ts          # Public exports
```

Future expansion will include hooks, services, and types specific to each feature.

### 3. Centralized Configuration
All application configuration lives in `src/config/index.ts`:
- App settings
- Supabase configuration
- Feature flags
- Role permissions
- XP rewards and level thresholds

### 4. Type-Safe Domain Model
Comprehensive TypeScript types in `src/types/index.ts` define:
- User & role types
- Skill & verification types
- Job & application types
- Course & learning types
- Assessment & challenge types
- Gamification types
- Notification types

### 5. Zustand for State Management
Client-side state managed with Zustand stores:
- `useAuthStore`: Authentication state
- `useUIStore`: UI state (sidebar, modals, theme)
- `useGamificationStore`: XP, levels, badges

### 6. Supabase Integration
Supabase used for:
- Authentication (Supabase Auth)
- Database (PostgreSQL with RLS)
- Real-time subscriptions
- File storage (avatars, resumes)

Two client configurations:
- Browser client (`src/lib/supabase.ts`)
- Server client (`src/utils/supabase/server.ts`)

## Data Flow

### Authentication Flow
1. User submits credentials via `SignInPage` component
2. `useSignIn` hook calls Supabase Auth API
3. On success, redirect to `/dashboard`
4. Middleware protects authenticated routes
5. `useAuth` hook provides user state throughout app

### Profile Management Flow
1. `CandidateProfilePage` loads user data via Supabase client
2. User edits form fields (controlled components)
3. File uploads go to Supabase Storage buckets
4. Profile data saved via Supabase upsert
5. XP transaction recorded for gamification

## Security

### Row-Level Security (RLS)
Database-level authorization ensures users can only access their own data:
- Candidates can only modify their own profiles
- Recruiters can only see public profiles or applications they're assigned to
- Admins have elevated privileges via RLS policies

### Middleware Protection
Next.js middleware validates authentication state on protected routes:
- `/dashboard/*` requires authentication
- `/candidates/profile` requires authentication
- Redirects unauthenticated users to `/auth/signin`

## Testing Strategy (Future)

- **Unit Tests**: Utilities, hooks, services
- **Component Tests**: UI components with Storybook
- **Integration Tests**: Feature workflows
- **E2E Tests**: Critical user journeys with Playwright/Cypress

## Deployment

- **Platform**: Vercel (recommended for Next.js)
- **Environment Variables**: Configured in Vercel dashboard
- **Database**: Supabase (managed PostgreSQL)
- **CI/CD**: Automatic deployments on git push

## Future Enhancements

1. **API Routes**: Move data access logic to dedicated service layer
2. **Server Actions**: Use Next.js Server Actions for mutations
3. **React Query**: Add for advanced caching and data synchronization
4. **Micro-frontends**: Consider for large-scale feature isolation
5. **Monorepo**: Expand to include mobile apps, browser extension

---

**Last Updated**: Current Session  
**Version**: 1.0.0

# Security Requirements — TalentSphere

## Overview

TalentSphere handles sensitive data: user careers, application status, hiring decisions,
and compensation information. Security is non-negotiable.

---

## Authentication

### Requirements
- All authentication is handled by Supabase Auth (email/password)
- Passwords are never stored in the application database — Supabase Auth manages this
- Sessions are managed via HTTP-only cookies (not localStorage)
- Session refresh is handled automatically by `@supabase/ssr`

### Protected Routes
The following routes require a valid authenticated session:
- `/dashboard` and all sub-routes
- `/candidates/*` (profile management)
- `/applications/*` (application tracking)
- `/messages/*` (messaging)
- `/notifications/*`
- `/settings/*`
- `/jobs/post` (recruiter only)
- `/admin/*` (admin only)

### Proxy / Middleware
The `src/proxy.ts` file enforces redirect behavior:
- Unauthenticated → protected route → redirect to `/auth/signin?redirect=<path>`
- Authenticated → auth route → redirect to `/dashboard`

---

## Authorization

### Row-Level Security (RLS)

Every Supabase table (46 public tables) has RLS policies enabled. Key policies across the domain modules:

| Table | Read Policy | Write Policy |
|-------|------------|--------------|
| `users` | Authenticated users (public profile fields); own record for private settings | Own record only |
| `candidate_profiles` | Public (marketplace view, respecting privacy toggles) | Own profile only (`user_id = auth.uid()`) |
| `organizations` | Public (verified profiles); members see internal metadata | Org admins / recruiters with matching `organization_id` |
| `jobs` | Public (active/published); draft/closed visible only to org members | Own organization's recruiters/admins |
| `applications` | Candidate (own applications) + Recruiter (for jobs in their organization) | Candidate (insert own); Recruiter (update stage/status) |
| `application_activity_log` | Candidate (timeline events) + Recruiter (full audit trail) | Append-only via trigger or authorized recruiter actions |
| `scorecards` | Organization hiring team and assigned interviewers only | Interviewer (insert/update own scorecard) |
| `hiring_pipeline_stages` | Public or org members (depending on custom stage config) | Organization admins |
| `challenges` | Public (published challenges) | Admin / Content team only |
| `challenge_submissions` | Own submissions; leaderboard aggregates public | Authenticated user (`user_id = auth.uid()`) |
| `courses` | Public (published courses) | Instructor / Course author / Admin |
| `course_enrollments` | Enrolled student + course instructor | Student (enroll own) |
| `conversations` | Conversation participants only | Participants only |
| `messages` | Conversation participants only | Message author (`sender_id = auth.uid()`) |
| `notifications` | Own notifications only (`user_id = auth.uid()`) | System / Server Actions only |
| `xp_ledger` | Own ledger entries | Append-only via server service role or verified event triggers |
| `user_levels` | Public (for leaderboard and profiles) | System-calculated only (no direct user write) |

### Server-Side Verification
- Every Server Action must re-validate authentication and authorization.
- Never trust client-sent `userId`, `candidateId`, or `organizationId` — always derive from session (`supabase.auth.getUser()`).
- Recruiter authorization must verify that `users.organization_id` matches the target entity's `organization_id`.
- Service functions use the server Supabase client (`createServerClient`) for user sessions or `createAdminClient` strictly for privileged background processes.

---

## Secrets Management

### Environment Variables
- All secrets stored in `.env.local` (gitignored)
- Only `NEXT_PUBLIC_` prefixed variables are safe for browser exposure
- Production secrets managed in Vercel dashboard environment variables

### Safe to Expose (NEXT_PUBLIC_)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (has RLS protection)

### Must Stay Server-Only
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS, admin-level access
- Any payment processor keys
- Any third-party API keys with write access

---

## Input Validation

### Client-Side (UX Only)
- React Hook Form + Zod for all form validation
- Validation errors displayed inline
- Prevents unnecessary network requests

### Server-Side (Security Enforced)
- All Server Actions must validate and sanitize inputs
- Never trust client-sent data for authorization decisions
- Use Zod schemas for Server Action parameter validation

### Example Pattern
```typescript
// Server Action
'use server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
});

export async function createJob(formData: FormData) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid input');
  
  // Safe to proceed with parsed.data
}
```

---

## File Uploads

### Validation Requirements
- **File type**: Whitelist allowed MIME types (no executable files)
- **File size**: Maximum 10MB per file
- **Filename**: Sanitize filename (remove path traversal characters)

### Storage Buckets
| Bucket | Visibility | Allowed Types | Max Size | Purpose |
|--------|-----------|---------------|----------|---------|
| `avatars` | Public | `image/jpeg`, `image/png`, `image/webp` | 5MB | User profile pictures & org logos |
| `resumes` | Private | `application/pdf` | 10MB | Candidate resumes (signed URLs only) |
| `course-content` | Private | `video/mp4`, `application/pdf` | 100MB | LMS course materials & instructor assets |
| `portfolio` | Public | `image/jpeg`, `image/png`, `image/webp` | 10MB | Project screenshots & portfolio media |
| `media-assets` | Private | `video/mp4`, `video/webm`, `audio/mpeg` | 100MB | HLS chunked media, async interview videos |

---

## HTTP Security Headers (`next.config.ts`)

TalentSphere enforces strict security headers on all routes (`/(.*)`):

```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];
```

---

## XSS Prevention

- Never use `dangerouslySetInnerHTML` unless explicitly sanitized via DOMPurify.
- All user-generated content rendered via React JSX text nodes (auto-escaped by React 19).
- Strict Content Security Policy configured in production with nonce-based script validation.

---

## SQL Injection Prevention

- All database operations utilize `@supabase/supabase-js` parameterized queries or `pg` parameterized client queries with `$1`, `$2` bind variables.
- Dynamic string interpolation into SQL queries is strictly prohibited.
- ILike search patterns are escaped to prevent `%` and `_` wildcard injection.

---

## CSRF & Session Protection

- Supabase Auth uses SameSite cookie protection with `HttpOnly` flags.
- Next.js Server Actions have native origin-verification and CSRF protection.
- Session tokens are renewed automatically via `@supabase/ssr` with rolling expiry.

---

## Regulatory Compliance & Privacy

### FERPA Compliance (Educational & Student Data)
- Institutional student records, including internal course grades, quiz responses, and preliminary code arena attempts, are strictly isolated within the institution tenant.
- Recruiters cannot view student profiles until the candidate formally graduates or opts into public marketplace discovery.
- Institutional instructors and faculty see student performance strictly within their authorized cohort/department.

### GDPR & Right to be Forgotten
- User account deletion triggers database foreign-key cascade deletions on `auth.users`, purging personal identifiers, resumes, and direct messages.
- Anonymized audit logs (e.g., hiring pipeline metrics and aggregate challenge statistics) retain no personally identifiable information (PII).
- Candidates can export their complete data profile (profile, applications, scorecards, course progress) in machine-readable JSON.

### EEO Compliance & Blind Hiring Mode
- ATS supports "Blind Resume Review" mode: candidate names, profile photos, graduation years, and demographic indicators can be masked during the initial screening stage to prevent unconscious bias.
- Structured scorecards enforce standardized evaluation rubrics (1–5 scale) across all candidates, providing verifiable audit trails in `application_activity_log`.

---

## Security Checklist (Pre-Production)

- [x] All 46 RLS policies enabled and verified against Supabase pooler
- [x] Zero `SUPABASE_SERVICE_ROLE_KEY` exposures in client-side code
- [x] All secrets contained in `.env.local` (gitignored)
- [x] Dual-layer security gateway: `src/proxy.ts` route protection + database RLS
- [x] File upload MIME-type whitelist and size limits enforced across all 5 buckets
- [x] Production HTTP security headers configured in `next.config.ts` (HSTS, DENY, nosniff)
- [x] Server-side Zod validation on all Server Actions and service mutation methods
- [x] Strict parameterization on all SQL/Supabase queries
- [x] FERPA and GDPR data access boundaries validated

---

*Security v2.0.0 — TalentSphere Enterprise Security Baseline*

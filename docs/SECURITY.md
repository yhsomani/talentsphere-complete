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

Every Supabase table has RLS policies enabled. Key policies:

| Table | Read Policy | Write Policy |
|-------|------------|--------------|
| `users` | Own record only | Own record only |
| `candidate_profiles` | Public (for visibility) | Own profile only |
| `recruiter_profiles` | Authenticated users | Own profile only |
| `jobs` | Public (published) | Own organization's recruiter |
| `applications` | Candidate (own) + Recruiter (for their jobs) | Candidate (create own) |
| `messages` | Participants only | Participants only |
| `notifications` | Own notifications only | System-created only |

### Server-Side Verification
- Every Server Action must re-validate authentication and authorization
- Never trust client-sent `userId` or `candidateId` — always derive from session
- Service functions should use the server Supabase client (cookie-based session)

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
| Bucket | Visibility | Allowed Types | Max Size |
|--------|-----------|---------------|----------|
| `avatars` | Public | `image/jpeg`, `image/png`, `image/webp` | 5MB |
| `resumes` | Private | `application/pdf` | 10MB |
| `course-content` | Private | `video/mp4`, `application/pdf` | 100MB |
| `portfolio` | Public | `image/jpeg`, `image/png` | 10MB |

---

## XSS Prevention

- Never use `dangerouslySetInnerHTML` unless explicitly required and sanitized
- All user-generated content rendered via React text nodes (auto-escaped)
- Content Security Policy headers should be configured in production

---

## SQL Injection Prevention

- All database queries use Supabase client library (parameterized queries internally)
- Never interpolate user input into query strings
- iLike patterns for search sanitized before use

---

## CSRF Protection

- Supabase Auth uses SameSite cookie protection
- Next.js Server Actions have built-in CSRF protection
- No custom form tokens needed for same-origin requests

---

## Sensitive Data Handling

- Salary information: only shown if explicitly set by employer
- Email addresses: never shown in public candidate profiles
- Password reset tokens: single-use, expire after 1 hour
- Application details: only visible to candidate and assigned recruiter

---

## Security Checklist (Pre-Production)

- [ ] All RLS policies reviewed and tested
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- [ ] No secrets in git history
- [ ] All user inputs validated server-side
- [ ] File upload size and type limits enforced
- [ ] Auth redirect chains cannot be exploited
- [ ] CSP headers configured in production
- [ ] Rate limiting on auth endpoints (Supabase default)
- [ ] Supabase Auth email confirmations enabled
- [ ] Session expiry configured appropriately

---

*Security v1.0 — TalentSphere*

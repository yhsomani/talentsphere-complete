# Test Plan — TalentSphere

## Philosophy

Testing verifies that the application does what the PRD requires.
A test plan makes "working" concrete and measurable.

---

## Test Levels

| Level | Tool | Coverage |
|-------|------|---------|
| Unit | Node.js built-in test (`node --test`) | Utilities, services (mocked), pure functions |
| Integration | Node.js test + Supabase | Service functions against test DB |
| E2E | Playwright | Critical user journeys in real browser |

---

## Unit Test Plan

### Utilities (`src/utils/index.ts`)
| Test | Expected |
|------|----------|
| `cn()` merges classes correctly | `cn('a', 'b', false && 'c')` → `'a b'` |
| `formatDate()` formats ISO date | `'2024-01-15'` → `'Jan 15, 2024'` |
| `getLevelDetails()` calculates XP correctly | Level 1 at 0 XP, Level 2 at 500 XP |
| `formatSalary()` handles min/max/single values | Various cases pass |
| Truncation utilities work correctly | Long strings are truncated properly |

### Authentication Logic
| Test | Expected |
|------|----------|
| Empty email/password shows error | Form doesn't submit |
| Invalid email format shows error | `@` check works |
| Mismatched passwords shows error | Confirm password validation |

---

## E2E Test Plan (Playwright)

### Auth Flow
| Scenario | Steps | Expected |
|----------|-------|---------|
| **Signup** | Visit `/auth/signup` → fill form → submit | Redirect to `/auth/verify` |
| **Login with valid credentials** | Visit `/auth/signin` → fill credentials → submit | Redirect to `/dashboard` |
| **Login with invalid credentials** | Submit wrong password | Error message shown |
| **Access protected route unauthenticated** | Visit `/dashboard` directly | Redirect to `/auth/signin` |
| **Access auth route when logged in** | Visit `/auth/signin` when authenticated | Redirect to `/dashboard` |
| **Logout** | Click logout button | Redirect to `/` |
| **Password Reset** | Submit reset form | Confirmation message shown |

### Job Board Flow
| Scenario | Steps | Expected |
|----------|-------|---------|
| **Browse jobs** | Visit `/jobs` | Job listings shown |
| **Filter by job type** | Select "Full-time" filter | Only full-time jobs shown |
| **Search jobs** | Type in search box | Matching jobs shown |
| **View job detail** | Click on a job | Full job description shown |
| **Apply for job (authenticated)** | Click Apply → fill modal → submit | Success message shown |
| **Apply for job (unauthenticated)** | Click Apply | Redirect to signin with return URL |

### Application Tracking Flow
| Scenario | Steps | Expected |
|----------|-------|---------|
| **View applications** | Visit `/applications` | All submitted applications listed |
| **Filter by status** | Click "Active" tab | Shows only active applications |
| **View application detail** | Click on an application | Full application details shown |

### Candidate Profile Flow
| Scenario | Steps | Expected |
|----------|-------|---------|
| **View own profile** | Visit `/candidates/profile` | Own profile shown with edit options |
| **Update headline** | Edit headline → save | Headline updated |
| **Update availability** | Change status dropdown | Status updated |

### Code Arena Flow
| Scenario | Steps | Expected |
|----------|-------|---------|
| **View challenges** | Visit `/challenges` | Challenge list shown |
| **View challenge detail** | Click on a challenge | Full challenge description shown |

### Responsive Design
| Breakpoint | Test |
|-----------|------|
| 375px | Navigation shows hamburger menu |
| 768px | Two-column grid layouts work |
| 1280px | Three-column grid, full sidebar visible |

---

## Manual QA Checklist (Pre-Production)

### Functionality
- [ ] Signup with new email creates account and profile
- [ ] Login with correct credentials works
- [ ] Login with wrong credentials shows error
- [ ] Logout clears session
- [ ] Password reset sends email
- [ ] Dashboard loads for candidate user
- [ ] Dashboard loads for recruiter user
- [ ] Job listings page loads and shows jobs
- [ ] Job filter by type/location/salary works
- [ ] Job search works
- [ ] Apply to job flow completes
- [ ] Applications page shows submitted applications
- [ ] Challenge list page loads
- [ ] Course list page loads
- [ ] Leaderboard loads
- [ ] Settings page loads
- [ ] Profile page loads

### UI Quality
- [ ] Mobile menu works at 375px
- [ ] All pages scroll correctly on mobile
- [ ] Loading skeletons appear during data fetch
- [ ] Empty states appear when no data
- [ ] Error states appear when fetch fails
- [ ] All forms show validation errors
- [ ] All forms show loading state during submission
- [ ] Toast notifications appear for actions
- [ ] Focus visible on all interactive elements (keyboard tab test)

### Security (Manual)
- [ ] Cannot access `/dashboard` without login
- [ ] Cannot access another user's application by URL manipulation
- [ ] No sensitive data in browser Network tab (client-side)
- [ ] `.env.local` not committed

---

## Running Tests

```bash
# Unit tests
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# E2E tests (requires app running)
npx playwright test

# Build check
npm run build
```

---

*Test Plan v1.0 — TalentSphere*

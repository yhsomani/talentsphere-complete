# Screen and Interaction Inventory

Screens come from `apps/web/src/App.tsx` route entries; controls, states and API calls are counted from each page file. `loading/empty/error` mean the page source contains the corresponding pattern (`loading|isLoading|pending`, `EmptyState`, `LoadError|Notice|setError`): they show a state is _handled in source_, not that it renders correctly.

29 routed screens · 44 shared components · 211 interactions · web API call sites: 96 (all 96 match a server route; 0 do not).

## 1. Route table (Branch 07)

| ID      | Route            | Gate    | Component file                           | Inbound nav links | Outbound nav | E2E specs | Status             | Notes                                                                                                                                        |
| ------- | ---------------- | ------- | ---------------------------------------- | ----------------- | ------------ | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| SCR-001 | /                | public  | apps/web/src/pages/LandingPage.tsx       | 1                 | 1            | 5         | IMPLEMENTED/HIGH   | no API call found in this screen file (static or composed); 5 linked test file(s) executed and passed (2026-11-25); link is path-level       |
| SCR-002 | /login           | public  | apps/web/src/pages/LoginPage.tsx         | 3                 | 1            | 13        | IMPLEMENTED/HIGH   | 13 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                  |
| SCR-003 | /signup          | public  | apps/web/src/pages/SignUpPage.tsx        | 4                 | 3            | 2         | IMPLEMENTED/HIGH   | 2 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-004 | /checkout        | public  | apps/web/src/pages/CheckoutPage.tsx      | 3                 | 0            | 4         | IMPLEMENTED/HIGH   | no API call found in this screen file (static or composed); 4 linked test file(s) executed and passed (2026-11-25); link is path-level       |
| SCR-005 | /privacy         | public  | apps/web/src/pages/PrivacyPage.tsx       | 3                 | 0            | 5         | IMPLEMENTED/HIGH   | no API call found in this screen file (static or composed); 5 linked test file(s) executed and passed (2026-11-25); link is path-level       |
| SCR-006 | /terms           | public  | apps/web/src/pages/TermsPage.tsx         | 3                 | 0            | 2         | IMPLEMENTED/HIGH   | no API call found in this screen file (static or composed); 2 linked test file(s) executed and passed (2026-11-25); link is path-level       |
| SCR-007 | /jobs            | public  | apps/web/src/pages/JobsPage.tsx          | 12                | 1            | 6         | IMPLEMENTED/HIGH   | 6 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-008 | /jobs/:id        | public  | apps/web/src/pages/JobDetailPage.tsx     | 0                 | 2            | 2         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 2 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-009 | /reference/:id   | public  | apps/web/src/pages/ReferencePage.tsx     | 0                 | 0            | 1         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 1 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-010 | /verify/:hash    | public  | apps/web/src/pages/VerifyPage.tsx        | 0                 | 1            | 1         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 1 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-011 | /dashboard       | guarded | apps/web/src/pages/DashboardPage.tsx     | 3                 | 2            | 11        | IMPLEMENTED/HIGH   | 11 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                  |
| SCR-012 | /applications    | guarded | apps/web/src/pages/ApplicationsPage.tsx  | 3                 | 1            | 2         | IMPLEMENTED/HIGH   | 2 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-013 | /evidence        | guarded | apps/web/src/pages/EvidencePage.tsx      | 1                 | 0            | 6         | IMPLEMENTED/HIGH   | 6 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-014 | /profile         | guarded | apps/web/src/pages/ProfilePage.tsx       | 4                 | 1            | 5         | IMPLEMENTED/HIGH   | 5 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-015 | /settings        | guarded | apps/web/src/pages/SettingsPage.tsx      | 2                 | 0            | 1         | IMPLEMENTED/HIGH   | 1 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-016 | /portfolio       | guarded | apps/web/src/pages/PortfolioPage.tsx     | 0                 | 0            | 1         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 1 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-017 | /resumes         | guarded | apps/web/src/pages/ResumesPage.tsx       | 0                 | 0            | 1         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 1 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-018 | /network         | guarded | apps/web/src/pages/NetworkPage.tsx       | 0                 | 0            | 1         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 1 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-019 | /learning        | guarded | apps/web/src/pages/LearningPage.tsx      | 1                 | 0            | 2         | IMPLEMENTED/HIGH   | 2 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-020 | /learning/:id    | guarded | apps/web/src/pages/CoursePage.tsx        | 0                 | 1            | 1         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 1 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-021 | /career          | guarded | apps/web/src/pages/CareerPage.tsx        | 1                 | 1            | 1         | IMPLEMENTED/HIGH   | 1 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-022 | /notifications   | guarded | apps/web/src/pages/NotificationsPage.tsx | 2                 | 0            | 1         | IMPLEMENTED/HIGH   | 1 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-023 | /messages        | guarded | apps/web/src/pages/MessagesPage.tsx      | 5                 | 1            | 1         | IMPLEMENTED/HIGH   | 1 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-024 | /messages/:id    | guarded | apps/web/src/pages/ConversationPage.tsx  | 0                 | 1            | 0         | IMPLEMENTED/MEDIUM | no inbound navigation link found in source; no e2e page.goto to this route found                                                             |
| SCR-025 | /hiring          | guarded | apps/web/src/pages/HiringPage.tsx        | 2                 | 1            | 4         | IMPLEMENTED/HIGH   | 4 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-026 | /hiring/jobs/:id | guarded | apps/web/src/pages/HiringJobPage.tsx     | 0                 | 3            | 2         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 2 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-027 | /assessments     | guarded | apps/web/src/pages/AssessmentsPage.tsx   | 0                 | 0            | 3         | IMPLEMENTED/HIGH   | no inbound navigation link found in source; 3 linked test file(s) executed and passed (2026-11-25); link is path-level                       |
| SCR-028 | /admin           | guarded | apps/web/src/pages/AdminPage.tsx         | 1                 | 0            | 1         | IMPLEMENTED/HIGH   | 1 linked test file(s) executed and passed (2026-11-25); link is path-level                                                                   |
| SCR-029 | /*               | public  | apps/web/src/pages/NotFoundPage.tsx      | 0                 | 0            | 0         | IMPLEMENTED/LOW    | no API call found in this screen file (static or composed); no inbound navigation link found in source; no e2e page.goto to this route found |

### Navigation analysis

- Screens with **no inbound navigation link** in source (reachable only by URL, redirect or `navigate`): /jobs/:id, /reference/:id, /verify/:hash, /portfolio, /resumes, /network, /learning/:id, /messages/:id, /hiring/jobs/:id, /assessments, /*.
- Screens with **no outbound link to another routed screen** from their own file (they rely on the shared Layout nav): /checkout, /privacy, /terms, /reference/:id, /evidence, /settings, /portfolio, /resumes, /network, /learning, /notifications, /assessments, /admin, /*. Layout supplies header/footer links to every screen, so none are true dead ends for a user with the matching nav set.
- Unresolved navigation targets (link to a path that is not a route entry as written): /hiring/jobs/, /verify/ (template-built paths such as `/verify/${hash}` truncate in the static scan and are not defects by themselves).
- Catch-all `*` renders `NotFoundPage`.

## 2. Per-screen detail (Branch 05)

### SCR-001 `/` — LandingPage

- Gate: public · File: `apps/web/src/pages/LandingPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=False, empty=False, error=False
- Shared components: HeroRecordArt, StepRoleArt, StepEmailArt, StepReferenceArt, CandidateArt, RecruiterArt, ButtonLink
- APIs: none
- Navigates to: /signup
- Interactions: 0
- E2E specs: accessibility.spec.ts, mutation-feedback.spec.ts, navigation.spec.ts, performance.spec.ts, web-ui.spec.ts

### SCR-002 `/login` — LoginPage

- Gate: public · File: `apps/web/src/pages/LoginPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 1, inputs 2, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Notice
- APIs: API-006 POST /api/v1/auth/login
- Navigates to: /signup
- Interactions: 3 (change×2, submit×1), 1 api-backed
- E2E specs: accessibility.spec.ts, career-readiness.spec.ts, challenges.spec.ts, credentials.spec.ts, frontend-fixes.spec.ts, learning-page.spec.ts, lesson-player.spec.ts, network-page.spec.ts, portfolio-resumes.spec.ts, settings-page.spec.ts, skills-graph.spec.ts, ui-sweep.spec.ts, web-ui.spec.ts

### SCR-003 `/signup` — SignUpPage

- Gate: public · File: `apps/web/src/pages/SignUpPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 1, inputs 4, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Input, Notice
- APIs: API-005 POST /api/v1/auth/register
- Navigates to: /login, /privacy, /terms
- Interactions: 5 (change×4, submit×1), 1 api-backed
- E2E specs: frontend-fixes.spec.ts, hostile-user.spec.ts

### SCR-004 `/checkout` — CheckoutPage

- Gate: public · File: `apps/web/src/pages/CheckoutPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=False, empty=False, error=False
- Shared components: PaidPlans, ButtonLink, CheckIcon, PageHeader
- APIs: none
- Navigates to: none from page file
- Interactions: 0
- E2E specs: accessibility.spec.ts, checkout-idempotency.spec.ts, mutation-feedback.spec.ts, web-ui.spec.ts

### SCR-005 `/privacy` — PrivacyPage

- Gate: public · File: `apps/web/src/pages/PrivacyPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=False, empty=False, error=False
- Shared components: Card, CardHeader, CardTitle, CardContent, LockIcon
- APIs: none
- Navigates to: none from page file
- Interactions: 0
- E2E specs: accessibility.spec.ts, hostile-user.spec.ts, performance.spec.ts, privacy-contact.spec.ts, web-ui.spec.ts

### SCR-006 `/terms` — TermsPage

- Gate: public · File: `apps/web/src/pages/TermsPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=False, empty=False, error=False
- Shared components: Badge, Card, CardHeader, CardTitle, CardContent, AlertCircleIcon
- APIs: none
- Navigates to: none from page file
- Interactions: 0
- E2E specs: accessibility.spec.ts, web-ui.spec.ts

### SCR-007 `/jobs` — JobsPage

- Gate: public · File: `apps/web/src/pages/JobsPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 1, modals 0
- States handled in source: loading=True, empty=True, error=True
- Shared components: ButtonLink, EmptyState, Select, Input, LoadError, PageHeader, StatusPill
- APIs: API-032 GET /api/v1/jobs, API-048 GET /api/v1/applications/my
- Navigates to: /jobs
- Interactions: 2 (change×2), 0 api-backed
- E2E specs: accessibility.spec.ts, analytics.spec.ts, core-loop.spec.ts, mutation-feedback.spec.ts, navigation.spec.ts, web-ui.spec.ts

### SCR-008 `/jobs/:id` — JobDetailPage

- Gate: public · File: `apps/web/src/pages/JobDetailPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 1, inputs 1, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, ButtonLink, Card, CardContent, TextArea, LoadError, Notice, StatusPill
- APIs: API-016 GET /api/v1/evidence/mine, API-033 GET /api/v1/jobs/:id, API-047 POST /api/v1/jobs/:id/apply, API-048 GET /api/v1/applications/my
- Navigates to: /jobs, /applications
- Interactions: 3 (change×2, submit×1), 1 api-backed
- E2E specs: mutation-feedback.spec.ts, web-ui.spec.ts

### SCR-009 `/reference/:id` — ReferencePage

- Gate: public · File: `apps/web/src/pages/ReferencePage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 2, forms 1, inputs 2, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Card, CardContent, TextArea, Notice
- APIs: API-274 GET /api/v1/references/:refId, API-275 POST /api/v1/candidates/work-history/references/:refId/submit
- Navigates to: none from page file
- Interactions: 5 (change×3, click×1, submit×1), 1 api-backed
- E2E specs: frontend-fixes.spec.ts

### SCR-010 `/verify/:hash` — VerifyPage

- Gate: public · File: `apps/web/src/pages/VerifyPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=False, empty=False, error=True
- Shared components: ButtonLink, Card, CardContent, LoadError, Notice, PageHeader
- APIs: API-108 GET /api/v1/verify/:hash
- Navigates to: /jobs
- Interactions: 1 (retry×1), 1 api-backed
- E2E specs: credentials.spec.ts

### SCR-011 `/dashboard` — DashboardPage

- Gate: RequireAuth · File: `apps/web/src/pages/DashboardPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: SessionErrorNotice, ButtonLink, LoadError, Notice, PageHeader, StatusPill
- APIs: API-016 GET /api/v1/evidence/mine, API-027 GET /api/v1/organizations/mine, API-028 GET /api/v1/organizations/:id/jobs, API-032 GET /api/v1/jobs, API-048 GET /api/v1/applications/my, API-276 GET /api/v1/candidates/:candidateId/work-history
- Navigates to: /jobs, /applications
- Interactions: 0
- E2E specs: accessibility.spec.ts, account-security.spec.ts, core-loop.spec.ts, hostile-user.spec.ts, messaging.spec.ts, navigation.spec.ts, notifications.spec.ts, restricted-account.spec.ts, session-resilience.spec.ts, settings-page.spec.ts, web-ui.spec.ts

### SCR-012 `/applications` — ApplicationsPage

- Gate: RequireAuth · File: `apps/web/src/pages/ApplicationsPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 3, forms 0, inputs 0, modals 1
- States handled in source: loading=True, empty=True, error=True
- Shared components: Button, ButtonLink, EmptyState, LoadError, Modal, Notice, PageHeader, StatusPill
- APIs: API-048 GET /api/v1/applications/my, API-051 POST /api/v1/applications/:id/transition
- Navigates to: /jobs
- Interactions: 5 (click×3, retry×1, close×1), 2 api-backed
- E2E specs: core-loop.spec.ts, web-ui.spec.ts

### SCR-013 `/evidence` — EvidencePage

- Gate: RequireAuth · File: `apps/web/src/pages/EvidencePage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 12, forms 4, inputs 10, modals 3
- States handled in source: loading=True, empty=False, error=True
- Shared components: SessionErrorNotice, Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Select, CheckIcon, AlertCircleIcon, Input, Modal, Notice, PageHeader, VerificationSeal
- APIs: API-271 POST /api/v1/candidates/work-history, API-272 POST /api/v1/candidates/work-history/:id/verify-email, API-273 POST /api/v1/candidates/work-history/:id/references/request, API-276 GET /api/v1/candidates/:candidateId/work-history, API-278 DELETE /api/v1/candidates/work-history/:id
- Navigates to: none from page file
- Interactions: 26 (change×11, click×8, submit×4, close×3), 6 api-backed
- E2E specs: accessibility.spec.ts, core-loop.spec.ts, mutation-feedback.spec.ts, navigation.spec.ts, web-ui.spec.ts, work-history-removal.spec.ts

### SCR-014 `/profile` — ProfilePage

- Gate: RequireAuth · File: `apps/web/src/pages/ProfilePage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 5, forms 1, inputs 5, modals 1
- States handled in source: loading=True, empty=False, error=True
- Shared components: ChangePasswordForm, CredentialsSection, SessionErrorNotice, SignOutOtherDevices, SkillsSection, Button, Card, CardContent, TextArea, Select, Input, Modal, Notice, PageHeader
- APIs: API-012 PATCH /api/v1/profile/me, API-214 POST /api/v1/settings/export, API-219 POST /api/v1/settings/erasure/execute
- Navigates to: /
- Interactions: 13 (change×7, click×4, submit×1, close×1), 3 api-backed
- E2E specs: account-deletion.spec.ts, account-security.spec.ts, credentials.spec.ts, settings-page.spec.ts, skills-graph.spec.ts

### SCR-015 `/settings` — SettingsPage

- Gate: RequireAuth · File: `apps/web/src/pages/SettingsPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 1, inputs 1, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Select, LoadError, Notice, PageHeader
- APIs: API-212 GET /api/v1/settings, API-213 PATCH /api/v1/settings
- Navigates to: none from page file
- Interactions: 6 (change×5, submit×1), 1 api-backed
- E2E specs: settings-page.spec.ts

### SCR-016 `/portfolio` — PortfolioPage

- Gate: RequireAuth · File: `apps/web/src/pages/PortfolioPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 1, inputs 4, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Card, CardContent, TextArea, Select, Input, LoadError, Notice, PageHeader
- APIs: API-201 POST /api/v1/portfolio/projects, API-202 GET /api/v1/portfolio/projects
- Navigates to: none from page file
- Interactions: 7 (change×6, submit×1), 1 api-backed
- E2E specs: portfolio-resumes.spec.ts

### SCR-017 `/resumes` — ResumesPage

- Gate: RequireAuth · File: `apps/web/src/pages/ResumesPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 1, inputs 3, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Card, CardContent, TextArea, Select, Input, LoadError, Notice, PageHeader
- APIs: API-127 POST /api/v1/resumes, API-128 GET /api/v1/resumes
- Navigates to: none from page file
- Interactions: 6 (change×5, submit×1), 1 api-backed
- E2E specs: portfolio-resumes.spec.ts

### SCR-018 `/network` — NetworkPage

- Gate: RequireAuth · File: `apps/web/src/pages/NetworkPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 6, forms 2, inputs 2, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Card, CardContent, TextArea, Input, LoadError, Notice, PageHeader
- APIs: API-134 POST /api/v1/connections/request, API-135 GET /api/v1/connections, API-137 POST /api/v1/connections/:id/respond, API-237 GET /api/v1/search
- Navigates to: none from page file
- Interactions: 10 (click×4, change×3, submit×2, retry×1), 7 api-backed
- E2E specs: network-page.spec.ts

### SCR-019 `/learning` — LearningPage

- Gate: RequireAuth · File: `apps/web/src/pages/LearningPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 0, inputs 1, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, ButtonLink, Card, CardContent, Select, Input, LoadError, Notice, PageHeader
- APIs: API-098 GET /api/v1/courses, API-104 POST /api/v1/courses/:id/enroll
- Navigates to: none from page file
- Interactions: 3 (change×2, click×1), 1 api-backed
- E2E specs: learning-page.spec.ts, lesson-player.spec.ts

### SCR-020 `/learning/:id` — CoursePage

- Gate: RequireAuth · File: `apps/web/src/pages/CoursePage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 3, forms 0, inputs 0, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, ButtonLink, Card, CardContent, LoadError, Notice, PageHeader
- APIs: API-100 GET /api/v1/courses/:id, API-104 POST /api/v1/courses/:id/enroll, API-105 GET /api/v1/courses/:id/progress, API-106 POST /api/v1/lessons/:id/complete
- Navigates to: /learning
- Interactions: 4 (click×3, retry×1), 3 api-backed
- E2E specs: lesson-player.spec.ts

### SCR-021 `/career` — CareerPage

- Gate: RequireAuth · File: `apps/web/src/pages/CareerPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 1, inputs 0, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Card, CardContent, Select, LoadError, Notice, PageHeader
- APIs: API-022 GET /api/v1/skills, API-059 GET /api/v1/skills/freshness/my, API-167 POST /api/v1/career/milestones/readiness, API-276 GET /api/v1/candidates/:candidateId/work-history
- Navigates to: /profile
- Interactions: 4 (change×2, retry×1, submit×1), 2 api-backed
- E2E specs: career-readiness.spec.ts

### SCR-022 `/notifications` — NotificationsPage

- Gate: RequireAuth · File: `apps/web/src/pages/NotificationsPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 1, forms 0, inputs 0, modals 0
- States handled in source: loading=True, empty=True, error=True
- Shared components: Button, EmptyState, LoadError, PageHeader
- APIs: API-117 GET /api/v1/notifications, API-119 POST /api/v1/notifications/mark-read
- Navigates to: none from page file
- Interactions: 3 (click×2, retry×1), 1 api-backed
- E2E specs: notifications.spec.ts

### SCR-023 `/messages` — MessagesPage

- Gate: RequireAuth · File: `apps/web/src/pages/MessagesPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=True, empty=True, error=True
- Shared components: EmptyState, LoadError, PageHeader
- APIs: API-112 GET /api/v1/threads
- Navigates to: /messages
- Interactions: 2 (listener:focus×1, retry×1), 1 api-backed
- E2E specs: messaging.spec.ts

### SCR-024 `/messages/:id` — ConversationPage

- Gate: RequireAuth · File: `apps/web/src/pages/ConversationPage.tsx` · Status: IMPLEMENTED/MEDIUM
- Controls (source counts): buttons 1, forms 1, inputs 0, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, TextArea, LoadError, Notice, PageHeader
- APIs: API-114 GET /api/v1/threads/:id, API-115 POST /api/v1/threads/:id/messages
- Navigates to: /messages
- Interactions: 4 (listener:focus×1, retry×1, submit×1, change×1), 2 api-backed
- E2E specs: none

### SCR-025 `/hiring` — HiringPage

- Gate: RequireAuth · File: `apps/web/src/pages/HiringPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 8, forms 2, inputs 9, modals 2
- States handled in source: loading=True, empty=True, error=True
- Shared components: Button, Card, CardContent, EmptyState, TextArea, Select, Input, LoadError, Modal, Notice, PageHeader, StatusPill
- APIs: API-022 GET /api/v1/skills, API-026 POST /api/v1/organizations, API-027 GET /api/v1/organizations/mine, API-028 GET /api/v1/organizations/:id/jobs, API-031 POST /api/v1/jobs, API-034 PATCH /api/v1/jobs/:id/status
- Navigates to: /jobs
- Interactions: 26 (change×15, click×6, close×3, submit×2), 4 api-backed
- E2E specs: core-loop.spec.ts, messaging.spec.ts, notifications.spec.ts, responsive.spec.ts

### SCR-026 `/hiring/jobs/:id` — HiringJobPage

- Gate: RequireAuth · File: `apps/web/src/pages/HiringJobPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 12, forms 1, inputs 0, modals 3
- States handled in source: loading=True, empty=False, error=True
- Shared components: Badge, Button, TextArea, LoadError, Modal, Notice, PageHeader, StatusPill
- APIs: API-033 GET /api/v1/jobs/:id, API-034 PATCH /api/v1/jobs/:id/status, API-050 GET /api/v1/jobs/:id/applications, API-051 POST /api/v1/applications/:id/transition, API-113 POST /api/v1/threads
- Navigates to: /jobs, /messages, /hiring
- Interactions: 18 (click×11, close×3, change×2, retry×1, submit×1), 6 api-backed
- E2E specs: messaging.spec.ts, responsive.spec.ts

### SCR-027 `/assessments` — AssessmentsPage

- Gate: RequireAuth · File: `apps/web/src/pages/AssessmentsPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 3, forms 1, inputs 0, modals 0
- States handled in source: loading=True, empty=False, error=True
- Shared components: Button, Card, CardContent, TextArea, Select, LoadError, Notice, PageHeader
- APIs: API-091 GET /api/v1/challenges, API-094 POST /api/v1/challenges/:id/start-session, API-095 POST /api/v1/challenges/:id/submit
- Navigates to: none from page file
- Interactions: 6 (change×2, click×2, submit×1, retry×1), 3 api-backed
- E2E specs: accessibility.spec.ts, challenges.spec.ts, web-ui.spec.ts

### SCR-028 `/admin` — AdminPage

- Gate: RequireAuth · File: `apps/web/src/pages/AdminPage.tsx` · Status: IMPLEMENTED/HIGH
- Controls (source counts): buttons 3, forms 0, inputs 3, modals 0
- States handled in source: loading=True, empty=True, error=True
- Shared components: Button, Card, CardContent, EmptyState, Select, Input, Notice, PageHeader
- APIs: API-229 GET /api/v1/admin/users, API-230 PATCH /api/v1/admin/users/:id/status, API-234 GET /api/v1/admin/audit-logs, API-235 GET /api/v1/admin/health-diagnostics, API-236 POST /api/v1/admin/maintenance
- Navigates to: none from page file
- Interactions: 7 (change×4, click×3), 3 api-backed
- E2E specs: hostile-user.spec.ts

### SCR-029 `/*` — NotFoundPage

- Gate: public · File: `apps/web/src/pages/NotFoundPage.tsx` · Status: IMPLEMENTED/LOW
- Controls (source counts): buttons 0, forms 0, inputs 0, modals 0
- States handled in source: loading=False, empty=False, error=False
- Shared components: ButtonLink, ShieldCheckIcon, SearchXIcon
- APIs: none
- Navigates to: none from page file
- Interactions: 0
- E2E specs: none

## 3. Shared components (Branch 05)

| ID       | Component           | File                                            | Imported/used by (files) | Status             |
| -------- | ------------------- | ----------------------------------------------- | ------------------------ | ------------------ |
| COMP-001 | CareerPaths         | apps/web/src/components/CareerPaths.tsx         | 0                        | UNKNOWN/LOW        |
| COMP-002 | ChangePasswordForm  | apps/web/src/components/ChangePasswordForm.tsx  | 1                        | IMPLEMENTED/MEDIUM |
| COMP-003 | CommandPalette      | apps/web/src/components/CommandPalette.tsx      | 1                        | IMPLEMENTED/MEDIUM |
| COMP-004 | CredentialsSection  | apps/web/src/components/CredentialsSection.tsx  | 1                        | IMPLEMENTED/MEDIUM |
| COMP-005 | HeroRecordArt       | apps/web/src/components/LandingArt.tsx          | 1                        | IMPLEMENTED/MEDIUM |
| COMP-006 | StepRoleArt         | apps/web/src/components/LandingArt.tsx          | 1                        | IMPLEMENTED/MEDIUM |
| COMP-007 | StepEmailArt        | apps/web/src/components/LandingArt.tsx          | 1                        | IMPLEMENTED/MEDIUM |
| COMP-008 | StepReferenceArt    | apps/web/src/components/LandingArt.tsx          | 1                        | IMPLEMENTED/MEDIUM |
| COMP-009 | CandidateArt        | apps/web/src/components/LandingArt.tsx          | 1                        | IMPLEMENTED/MEDIUM |
| COMP-010 | RecruiterArt        | apps/web/src/components/LandingArt.tsx          | 1                        | IMPLEMENTED/MEDIUM |
| COMP-011 | Layout              | apps/web/src/components/Layout.tsx              | 1                        | IMPLEMENTED/MEDIUM |
| COMP-012 | PaidPlans           | apps/web/src/components/PaidPlans.tsx           | 1                        | IMPLEMENTED/MEDIUM |
| COMP-013 | SessionErrorNotice  | apps/web/src/components/SessionErrorNotice.tsx  | 3                        | IMPLEMENTED/MEDIUM |
| COMP-014 | SignOutOtherDevices | apps/web/src/components/SignOutOtherDevices.tsx | 1                        | IMPLEMENTED/MEDIUM |
| COMP-015 | SkillsSection       | apps/web/src/components/SkillsSection.tsx       | 1                        | IMPLEMENTED/MEDIUM |
| COMP-016 | Badge               | apps/web/src/components/ui/Badge.tsx            | 7                        | IMPLEMENTED/MEDIUM |
| COMP-017 | Button              | apps/web/src/components/ui/Button.tsx           | 29                       | IMPLEMENTED/MEDIUM |
| COMP-018 | ButtonLink          | apps/web/src/components/ui/Button.tsx           | 10                       | IMPLEMENTED/MEDIUM |
| COMP-019 | Card                | apps/web/src/components/ui/Card.tsx             | 20                       | IMPLEMENTED/MEDIUM |
| COMP-020 | CardHeader          | apps/web/src/components/ui/Card.tsx             | 3                        | IMPLEMENTED/MEDIUM |
| COMP-021 | CardTitle           | apps/web/src/components/ui/Card.tsx             | 3                        | IMPLEMENTED/MEDIUM |
| COMP-022 | CardDescription     | apps/web/src/components/ui/Card.tsx             | 1                        | IMPLEMENTED/MEDIUM |
| COMP-023 | CardContent         | apps/web/src/components/ui/Card.tsx             | 19                       | IMPLEMENTED/MEDIUM |
| COMP-024 | EmptyState          | apps/web/src/components/ui/EmptyState.tsx       | 7                        | IMPLEMENTED/MEDIUM |
| COMP-025 | TextArea            | apps/web/src/components/ui/Field.tsx            | 10                       | IMPLEMENTED/MEDIUM |
| COMP-026 | Select              | apps/web/src/components/ui/Field.tsx            | 12                       | IMPLEMENTED/MEDIUM |
| COMP-027 | ShieldCheckIcon     | apps/web/src/components/ui/Icons.tsx            | 1                        | IMPLEMENTED/MEDIUM |
| COMP-028 | CheckIcon           | apps/web/src/components/ui/Icons.tsx            | 2                        | IMPLEMENTED/MEDIUM |
| COMP-029 | AlertCircleIcon     | apps/web/src/components/ui/Icons.tsx            | 2                        | IMPLEMENTED/MEDIUM |
| COMP-030 | CodeIcon            | apps/web/src/components/ui/Icons.tsx            | 0                        | UNKNOWN/LOW        |
| COMP-031 | LockIcon            | apps/web/src/components/ui/Icons.tsx            | 1                        | IMPLEMENTED/MEDIUM |
| COMP-032 | XIcon               | apps/web/src/components/ui/Icons.tsx            | 2                        | IMPLEMENTED/MEDIUM |
| COMP-033 | MenuIcon            | apps/web/src/components/ui/Icons.tsx            | 1                        | IMPLEMENTED/MEDIUM |
| COMP-034 | SearchXIcon         | apps/web/src/components/ui/Icons.tsx            | 1                        | IMPLEMENTED/MEDIUM |
| COMP-035 | BellIcon            | apps/web/src/components/ui/Icons.tsx            | 1                        | IMPLEMENTED/MEDIUM |
| COMP-036 | ChevronDownIcon     | apps/web/src/components/ui/Icons.tsx            | 1                        | IMPLEMENTED/MEDIUM |
| COMP-037 | Input               | apps/web/src/components/ui/Input.tsx            | 16                       | IMPLEMENTED/MEDIUM |
| COMP-038 | LoadError           | apps/web/src/components/ui/LoadError.tsx        | 22                       | IMPLEMENTED/MEDIUM |
| COMP-039 | Modal               | apps/web/src/components/ui/Modal.tsx            | 6                        | IMPLEMENTED/MEDIUM |
| COMP-040 | Notice              | apps/web/src/components/ui/Notice.tsx           | 31                       | IMPLEMENTED/MEDIUM |
| COMP-041 | PageHeader          | apps/web/src/components/ui/PageHeader.tsx       | 23                       | IMPLEMENTED/MEDIUM |
| COMP-042 | StatusPill          | apps/web/src/components/ui/StatusPill.tsx       | 7                        | IMPLEMENTED/MEDIUM |
| COMP-043 | TIER_LABEL          | apps/web/src/components/ui/VerificationSeal.tsx | 1                        | IMPLEMENTED/MEDIUM |
| COMP-044 | VerificationSeal    | apps/web/src/components/ui/VerificationSeal.tsx | 3                        | IMPLEMENTED/MEDIUM |

## 4. Interaction inventory (Branch 06)

Trigger → handler → API. `api-backed` = the body of the handler (`Link` = `direct`) or a local function it calls (`one-hop`) performs a request to a matched route. `local-handler` / `inline-handler` = no request found within one call of the handler (local state, navigation, or deeper indirection). `global-listener` = `window`/`document` event listener registered in an effect. Preconditions, validation and persistence are properties of the API row (see [API architecture](../architecture/API_ARCHITECTURE.md)); the interaction links to it.

| ID      | Owner               | Event                        | Handler               | Class           | Link    | Triggers API                                                                                                                                  | Location                                           |
| ------- | ------------------- | ---------------------------- | --------------------- | --------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| INT-001 | CareerPaths         | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/career/benchmarks, GET /api/v1/candidates/:candidateId/work-history                                                               | apps/web/src/components/CareerPaths.tsx:93         |
| INT-002 | CareerPaths         | submit                       | show                  | api-backed      | direct  | GET /api/v1/career/pathways                                                                                                                   | apps/web/src/components/CareerPaths.tsx:94         |
| INT-003 | CareerPaths         | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/CareerPaths.tsx:100        |
| INT-004 | ChangePasswordForm  | submit                       | submit                | api-backed      | direct  | POST /api/v1/auth/password                                                                                                                    | apps/web/src/components/ChangePasswordForm.tsx:63  |
| INT-005 | ChangePasswordForm  | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/ChangePasswordForm.tsx:80  |
| INT-006 | ChangePasswordForm  | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/ChangePasswordForm.tsx:91  |
| INT-007 | ChangePasswordForm  | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/ChangePasswordForm.tsx:101 |
| INT-008 | CommandPalette      | listener:keydown             | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/CommandPalette.tsx:45      |
| INT-009 | CommandPalette      | press                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/CommandPalette.tsx:91      |
| INT-010 | CommandPalette      | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/CommandPalette.tsx:128     |
| INT-011 | CommandPalette      | keyboard                     | onInputKeyDown        | local-handler   | none    |                                                                                                                                               | apps/web/src/components/CommandPalette.tsx:132     |
| INT-012 | CommandPalette      | hover                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/CommandPalette.tsx:170     |
| INT-013 | CommandPalette      | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/CommandPalette.tsx:171     |
| INT-014 | CredentialsSection  | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/certificates/my, GET /api/v1/evidence/mine, GET /api/v1/evidence/:id/verify-public                                                | apps/web/src/components/CredentialsSection.tsx:105 |
| INT-015 | Layout              | listener:focus               | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:130             |
| INT-016 | Layout              | listener:NOTIFICATIONS_EVENT | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:131             |
| INT-017 | Layout              | listener:online              | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:148             |
| INT-018 | Layout              | listener:offline             | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:149             |
| INT-019 | Layout              | listener:keydown             | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:195             |
| INT-020 | Layout              | listener:pointerdown         | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:205             |
| INT-021 | Layout              | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:324             |
| INT-022 | Layout              | click                        | signOut               | local-handler   | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:370             |
| INT-023 | Layout              | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:394             |
| INT-024 | Layout              | click                        | signOut               | local-handler   | none    |                                                                                                                                               | apps/web/src/components/Layout.tsx:449             |
| INT-025 | PaidPlans           | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/PaidPlans.tsx:161          |
| INT-026 | PaidPlans           | click                        | (inline)              | api-backed      | direct  | POST /api/v1/billing/checkout                                                                                                                 | apps/web/src/components/PaidPlans.tsx:254          |
| INT-027 | PaidPlans           | click                        | (inline)              | api-backed      | direct  | POST /api/v1/billing/portal                                                                                                                   | apps/web/src/components/PaidPlans.tsx:338          |
| INT-028 | SessionErrorNotice  | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/SessionErrorNotice.tsx:31  |
| INT-029 | SignOutOtherDevices | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/auth/sign-out-others                                                                                                             | apps/web/src/components/SignOutOtherDevices.tsx:59 |
| INT-030 | SkillsSection       | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/skills, GET /api/v1/skills/freshness/my, GET /api/v1/skills/:id/graph                                                             | apps/web/src/components/SkillsSection.tsx:134      |
| INT-031 | SkillsSection       | submit                       | addSkill              | api-backed      | direct  | POST /api/v1/skills/freshness, GET /api/v1/skills, GET /api/v1/skills/freshness/my, GET /api/v1/skills/:id/graph                              | apps/web/src/components/SkillsSection.tsx:194      |
| INT-032 | SkillsSection       | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/SkillsSection.tsx:207      |
| INT-033 | Input               | focus                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/ui/Input.tsx:76            |
| INT-034 | Input               | blur                         | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/ui/Input.tsx:80            |
| INT-035 | LoadError           | click                        | onRetry               | local-handler   | none    |                                                                                                                                               | apps/web/src/components/ui/LoadError.tsx:23        |
| INT-036 | Modal               | listener:keydown             | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/components/ui/Modal.tsx:75            |
| INT-037 | Modal               | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/ui/Modal.tsx:113           |
| INT-038 | Modal               | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/components/ui/Modal.tsx:175           |
| INT-039 | apps/web            | listener:SESSION_EVENT       | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/lib/SessionContext.tsx:99             |
| INT-040 | apps/web            | listener:storage             | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/lib/SessionContext.tsx:100            |
| INT-041 | apps/web            | listener:online              | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/lib/SessionContext.tsx:103            |
| INT-042 | /admin              | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/AdminPage.tsx:205               |
| INT-043 | /admin              | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/AdminPage.tsx:213               |
| INT-044 | /admin              | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/AdminPage.tsx:218               |
| INT-045 | /admin              | click                        | (inline)              | api-backed      | one-hop | PATCH /api/v1/admin/users/:id/status                                                                                                          | apps/web/src/pages/AdminPage.tsx:278               |
| INT-046 | /admin              | click                        | (inline)              | api-backed      | one-hop | GET /api/v1/admin/health-diagnostics                                                                                                          | apps/web/src/pages/AdminPage.tsx:328               |
| INT-047 | /admin              | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/admin/maintenance                                                                                                                | apps/web/src/pages/AdminPage.tsx:333               |
| INT-048 | /admin              | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/AdminPage.tsx:341               |
| INT-049 | /applications       | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ApplicationsPage.tsx:132        |
| INT-050 | /applications       | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/applications/my                                                                                                                   | apps/web/src/pages/ApplicationsPage.tsx:162        |
| INT-051 | /applications       | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ApplicationsPage.tsx:194        |
| INT-052 | /applications       | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ApplicationsPage.tsx:209        |
| INT-053 | /applications       | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/applications/:id/transition                                                                                                      | apps/web/src/pages/ApplicationsPage.tsx:214        |
| INT-054 | /assessments        | submit                       | submit                | api-backed      | direct  | POST /api/v1/challenges/:id/submit                                                                                                            | apps/web/src/pages/AssessmentsPage.tsx:175         |
| INT-055 | /assessments        | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/AssessmentsPage.tsx:181         |
| INT-056 | /assessments        | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/AssessmentsPage.tsx:188         |
| INT-057 | /assessments        | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/AssessmentsPage.tsx:201         |
| INT-058 | /assessments        | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/challenges                                                                                                                        | apps/web/src/pages/AssessmentsPage.tsx:210         |
| INT-059 | /assessments        | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/challenges/:id/start-session                                                                                                     | apps/web/src/pages/AssessmentsPage.tsx:237         |
| INT-060 | /career             | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/skills, GET /api/v1/skills/freshness/my, GET /api/v1/candidates/:candidateId/work-history                                         | apps/web/src/pages/CareerPage.tsx:136              |
| INT-061 | /career             | submit                       | check                 | api-backed      | direct  | POST /api/v1/career/milestones/readiness                                                                                                      | apps/web/src/pages/CareerPage.tsx:156              |
| INT-062 | /career             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/CareerPage.tsx:162              |
| INT-063 | /career             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/CareerPage.tsx:170              |
| INT-064 | /messages/:id       | listener:focus               | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/pages/ConversationPage.tsx:70         |
| INT-065 | /messages/:id       | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/threads/:id                                                                                                                       | apps/web/src/pages/ConversationPage.tsx:132        |
| INT-066 | /messages/:id       | submit                       | send                  | api-backed      | direct  | POST /api/v1/threads/:id/messages, GET /api/v1/threads/:id                                                                                    | apps/web/src/pages/ConversationPage.tsx:205        |
| INT-067 | /messages/:id       | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ConversationPage.tsx:219        |
| INT-068 | /learning/:id       | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/courses/:id, GET /api/v1/courses/:id/progress                                                                                     | apps/web/src/pages/CoursePage.tsx:126              |
| INT-069 | /learning/:id       | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/courses/:id/enroll                                                                                                               | apps/web/src/pages/CoursePage.tsx:157              |
| INT-070 | /learning/:id       | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/CoursePage.tsx:220              |
| INT-071 | /learning/:id       | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/lessons/:id/complete                                                                                                             | apps/web/src/pages/CoursePage.tsx:292              |
| INT-072 | /evidence           | submit                       | confirm               | api-backed      | direct  | POST /api/v1/candidates/work-history/:id/verify-email                                                                                         | apps/web/src/pages/EvidencePage.tsx:168            |
| INT-073 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:187            |
| INT-074 | /evidence           | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/candidates/work-history/:id/verify-email                                                                                         | apps/web/src/pages/EvidencePage.tsx:204            |
| INT-075 | /evidence           | submit                       | (inline)              | api-backed      | one-hop | POST /api/v1/candidates/work-history/:id/verify-email                                                                                         | apps/web/src/pages/EvidencePage.tsx:221            |
| INT-076 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:238            |
| INT-077 | /evidence           | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:535            |
| INT-078 | /evidence           | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:683            |
| INT-079 | /evidence           | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:747            |
| INT-080 | /evidence           | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:760            |
| INT-081 | /evidence           | submit                       | handleAddSubmit       | api-backed      | direct  | POST /api/v1/candidates/work-history, POST /api/v1/candidates/work-history/:id/verify-email, GET /api/v1/candidates/:candidateId/work-history | apps/web/src/pages/EvidencePage.tsx:770            |
| INT-082 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:777            |
| INT-083 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:786            |
| INT-084 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:802            |
| INT-085 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:811            |
| INT-086 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:827            |
| INT-087 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:839            |
| INT-088 | /evidence           | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:847            |
| INT-089 | /evidence           | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:860            |
| INT-090 | /evidence           | submit                       | handleReferenceSubmit | api-backed      | direct  | POST /api/v1/candidates/work-history/:id/references/request, GET /api/v1/candidates/:candidateId/work-history                                 | apps/web/src/pages/EvidencePage.tsx:875            |
| INT-091 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:881            |
| INT-092 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:891            |
| INT-093 | /evidence           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:898            |
| INT-094 | /evidence           | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:907            |
| INT-095 | /evidence           | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:920            |
| INT-096 | /evidence           | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/EvidencePage.tsx:966            |
| INT-097 | /evidence           | click                        | (inline)              | api-backed      | one-hop | DELETE /api/v1/candidates/work-history/:id                                                                                                    | apps/web/src/pages/EvidencePage.tsx:974            |
| INT-098 | /hiring/jobs/:id    | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/jobs/:id, GET /api/v1/jobs/:id/applications                                                                                       | apps/web/src/pages/HiringJobPage.tsx:173           |
| INT-099 | /hiring/jobs/:id    | click                        | (inline)              | api-backed      | one-hop | PATCH /api/v1/jobs/:id/status                                                                                                                 | apps/web/src/pages/HiringJobPage.tsx:212           |
| INT-100 | /hiring/jobs/:id    | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:243           |
| INT-101 | /hiring/jobs/:id    | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/applications/:id/transition                                                                                                      | apps/web/src/pages/HiringJobPage.tsx:354           |
| INT-102 | /hiring/jobs/:id    | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:363           |
| INT-103 | /hiring/jobs/:id    | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:378           |
| INT-104 | /hiring/jobs/:id    | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:394           |
| INT-105 | /hiring/jobs/:id    | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:456           |
| INT-106 | /hiring/jobs/:id    | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:472           |
| INT-107 | /hiring/jobs/:id    | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:475           |
| INT-108 | /hiring/jobs/:id    | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/applications/:id/transition                                                                                                      | apps/web/src/pages/HiringJobPage.tsx:481           |
| INT-109 | /hiring/jobs/:id    | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:494           |
| INT-110 | /hiring/jobs/:id    | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:508           |
| INT-111 | /hiring/jobs/:id    | click                        | (inline)              | api-backed      | one-hop | PATCH /api/v1/jobs/:id/status                                                                                                                 | apps/web/src/pages/HiringJobPage.tsx:515           |
| INT-112 | /hiring/jobs/:id    | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:526           |
| INT-113 | /hiring/jobs/:id    | submit                       | sendFirstMessage      | api-backed      | direct  | POST /api/v1/threads                                                                                                                          | apps/web/src/pages/HiringJobPage.tsx:531           |
| INT-114 | /hiring/jobs/:id    | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:547           |
| INT-115 | /hiring/jobs/:id    | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringJobPage.tsx:555           |
| INT-116 | /hiring             | submit                       | submit                | api-backed      | direct  | POST /api/v1/organizations, POST /api/v1/jobs, PATCH /api/v1/jobs/:id/status                                                                  | apps/web/src/pages/HiringPage.tsx:120              |
| INT-117 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:126              |
| INT-118 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:137              |
| INT-119 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:149              |
| INT-120 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:156              |
| INT-121 | /hiring             | close                        | onClose               | local-handler   | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:258              |
| INT-122 | /hiring             | submit                       | submit                | api-backed      | direct  | POST /api/v1/organizations, POST /api/v1/jobs, PATCH /api/v1/jobs/:id/status                                                                  | apps/web/src/pages/HiringPage.tsx:264              |
| INT-123 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:270              |
| INT-124 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:279              |
| INT-125 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:293              |
| INT-126 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:300              |
| INT-127 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:312              |
| INT-128 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:333              |
| INT-129 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:342              |
| INT-130 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:348              |
| INT-131 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:367              |
| INT-132 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:393              |
| INT-133 | /hiring             | click                        | onClose               | local-handler   | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:399              |
| INT-134 | /hiring             | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:501              |
| INT-135 | /hiring             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:513              |
| INT-136 | /hiring             | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:543              |
| INT-137 | /hiring             | click                        | (inline)              | api-backed      | one-hop | PATCH /api/v1/jobs/:id/status                                                                                                                 | apps/web/src/pages/HiringPage.tsx:607              |
| INT-138 | /hiring             | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:638              |
| INT-139 | /hiring             | close                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:645              |
| INT-140 | /hiring             | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/HiringPage.tsx:659              |
| INT-141 | /hiring             | click                        | (inline)              | api-backed      | one-hop | PATCH /api/v1/jobs/:id/status                                                                                                                 | apps/web/src/pages/HiringPage.tsx:666              |
| INT-142 | /jobs/:id           | submit                       | apply                 | api-backed      | direct  | POST /api/v1/jobs/:id/apply, GET /api/v1/applications/my                                                                                      | apps/web/src/pages/JobDetailPage.tsx:323           |
| INT-143 | /jobs/:id           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/JobDetailPage.tsx:342           |
| INT-144 | /jobs/:id           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/JobDetailPage.tsx:366           |
| INT-145 | /jobs               | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/JobsPage.tsx:108                |
| INT-146 | /jobs               | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/JobsPage.tsx:115                |
| INT-147 | /learning           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/LearningPage.tsx:96             |
| INT-148 | /learning           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/LearningPage.tsx:103            |
| INT-149 | /learning           | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/courses/:id/enroll                                                                                                               | apps/web/src/pages/LearningPage.tsx:167            |
| INT-150 | /login              | submit                       | handleSubmit          | api-backed      | direct  | POST /api/v1/auth/login                                                                                                                       | apps/web/src/pages/LoginPage.tsx:171               |
| INT-151 | /login              | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/LoginPage.tsx:192               |
| INT-152 | /login              | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/LoginPage.tsx:235               |
| INT-153 | /messages           | listener:focus               | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/pages/MessagesPage.tsx:35             |
| INT-154 | /messages           | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/threads                                                                                                                           | apps/web/src/pages/MessagesPage.tsx:51             |
| INT-155 | /network            | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/connections                                                                                                                       | apps/web/src/pages/NetworkPage.tsx:175             |
| INT-156 | /network            | submit                       | search                | api-backed      | direct  | GET /api/v1/search                                                                                                                            | apps/web/src/pages/NetworkPage.tsx:192             |
| INT-157 | /network            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/NetworkPage.tsx:198             |
| INT-158 | /network            | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/connections/request                                                                                                              | apps/web/src/pages/NetworkPage.tsx:247             |
| INT-159 | /network            | submit                       | send                  | api-backed      | one-hop | POST /api/v1/connections/request                                                                                                              | apps/web/src/pages/NetworkPage.tsx:260             |
| INT-160 | /network            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/NetworkPage.tsx:266             |
| INT-161 | /network            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/NetworkPage.tsx:275             |
| INT-162 | /network            | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/connections/:id/respond                                                                                                          | apps/web/src/pages/NetworkPage.tsx:325             |
| INT-163 | /network            | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/connections/:id/respond                                                                                                          | apps/web/src/pages/NetworkPage.tsx:340             |
| INT-164 | /network            | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/connections/:id/respond                                                                                                          | apps/web/src/pages/NetworkPage.tsx:358             |
| INT-165 | /notifications      | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/NotificationsPage.tsx:87        |
| INT-166 | /notifications      | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/notifications                                                                                                                     | apps/web/src/pages/NotificationsPage.tsx:97        |
| INT-167 | /notifications      | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/NotificationsPage.tsx:155       |
| INT-168 | /portfolio          | submit                       | create                | api-backed      | direct  | POST /api/v1/portfolio/projects                                                                                                               | apps/web/src/pages/PortfolioPage.tsx:134           |
| INT-169 | /portfolio          | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/PortfolioPage.tsx:140           |
| INT-170 | /portfolio          | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/PortfolioPage.tsx:150           |
| INT-171 | /portfolio          | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/PortfolioPage.tsx:158           |
| INT-172 | /portfolio          | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/PortfolioPage.tsx:166           |
| INT-173 | /portfolio          | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/PortfolioPage.tsx:173           |
| INT-174 | /portfolio          | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/PortfolioPage.tsx:185           |
| INT-175 | /profile            | submit                       | save                  | api-backed      | direct  | PATCH /api/v1/profile/me                                                                                                                      | apps/web/src/pages/ProfilePage.tsx:214             |
| INT-176 | /profile            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:220             |
| INT-177 | /profile            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:233             |
| INT-178 | /profile            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:244             |
| INT-179 | /profile            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:256             |
| INT-180 | /profile            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:266             |
| INT-181 | /profile            | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/settings/export                                                                                                                  | apps/web/src/pages/ProfilePage.tsx:319             |
| INT-182 | /profile            | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:331             |
| INT-183 | /profile            | close                        | closeDelete           | local-handler   | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:341             |
| INT-184 | /profile            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:355             |
| INT-185 | /profile            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:365             |
| INT-186 | /profile            | click                        | closeDelete           | local-handler   | none    |                                                                                                                                               | apps/web/src/pages/ProfilePage.tsx:372             |
| INT-187 | /profile            | click                        | (inline)              | api-backed      | one-hop | POST /api/v1/settings/erasure/execute                                                                                                         | apps/web/src/pages/ProfilePage.tsx:378             |
| INT-188 | /reference/:id      | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ReferencePage.tsx:139           |
| INT-189 | /reference/:id      | click                        | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ReferencePage.tsx:177           |
| INT-190 | /reference/:id      | submit                       | submit                | api-backed      | direct  | POST /api/v1/candidates/work-history/references/:refId/submit                                                                                 | apps/web/src/pages/ReferencePage.tsx:210           |
| INT-191 | /reference/:id      | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ReferencePage.tsx:240           |
| INT-192 | /reference/:id      | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ReferencePage.tsx:254           |
| INT-193 | /resumes            | submit                       | create                | api-backed      | direct  | POST /api/v1/resumes                                                                                                                          | apps/web/src/pages/ResumesPage.tsx:126             |
| INT-194 | /resumes            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ResumesPage.tsx:132             |
| INT-195 | /resumes            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ResumesPage.tsx:139             |
| INT-196 | /resumes            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ResumesPage.tsx:148             |
| INT-197 | /resumes            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ResumesPage.tsx:157             |
| INT-198 | /resumes            | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/ResumesPage.tsx:165             |
| INT-199 | /settings           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SettingsPage.tsx:75             |
| INT-200 | /settings           | submit                       | save                  | api-backed      | direct  | PATCH /api/v1/settings                                                                                                                        | apps/web/src/pages/SettingsPage.tsx:204            |
| INT-201 | /settings           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SettingsPage.tsx:210            |
| INT-202 | /settings           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SettingsPage.tsx:218            |
| INT-203 | /settings           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SettingsPage.tsx:224            |
| INT-204 | /settings           | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SettingsPage.tsx:230            |
| INT-205 | /signup             | submit                       | handleSubmit          | api-backed      | direct  | POST /api/v1/auth/register                                                                                                                    | apps/web/src/pages/SignUpPage.tsx:109              |
| INT-206 | /signup             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SignUpPage.tsx:148              |
| INT-207 | /signup             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SignUpPage.tsx:174              |
| INT-208 | /signup             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SignUpPage.tsx:185              |
| INT-209 | /signup             | change                       | (inline)              | inline-handler  | none    |                                                                                                                                               | apps/web/src/pages/SignUpPage.tsx:197              |
| INT-210 | /verify/:hash       | retry                        | (inline)              | api-backed      | one-hop | GET /api/v1/verify/:hash                                                                                                                      | apps/web/src/pages/VerifyPage.tsx:101              |
| INT-211 | apps/web            | listener:controllerchange    | (inline)              | global-listener | none    |                                                                                                                                               | apps/web/src/pwa.ts:43                             |

## 5. Event kinds

| Event                        | Count |
| ---------------------------- | ----- |
| change                       | 84    |
| click                        | 61    |
| submit                       | 23    |
| retry                        | 13    |
| close                        | 11    |
| listener:keydown             | 3     |
| listener:focus               | 3     |
| listener:online              | 2     |
| press                        | 1     |
| keyboard                     | 1     |
| hover                        | 1     |
| listener:NOTIFICATIONS_EVENT | 1     |
| listener:offline             | 1     |
| listener:pointerdown         | 1     |
| focus                        | 1     |
| blur                         | 1     |
| listener:SESSION_EVENT       | 1     |
| listener:storage             | 1     |
| listener:controllerchange    | 1     |

Interaction types with **no occurrence** in `apps/web/src` (JSX `on*` props and `addEventListener`): long press, swipe, drag and drop, wheel/scroll handlers, paste. Touch events exist only as press feedback on `Button` (`onTouchStart/End`), not as swipe gestures. Global keyboard handling exists in `Modal`, `CommandPalette` (a keyboard-driven palette) and `Layout`.

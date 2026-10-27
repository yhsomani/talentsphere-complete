# 04 - Features and Workflows

> **Reference only — prior attempt.** This file analyses an EARLIER implementation attempt. For this project nothing is assumed implemented: labels such as `Implemented-verified` describe what the prior attempt's code reportedly did, not the state of this project. Target design lives in `Yash_Final_Project_Document/` folders 00-29; founder intent is the root `SSOT.md`.

Canonical home for: the feature inventory (with honest status), roles and permissions as enforced, user journeys as built, state machines, feature dependencies, and edge cases and known gaps. Security and integration detail is in [06-SECURITY-AND-INTEGRATIONS.md](06-SECURITY-AND-INTEGRATIONS.md). Pricing and plan limits are owned by [`docs/PRICING.md`](../31_LEGACY_ARCHIVE/docs/PRICING.md) (not copied here).

Evidence basis: repository HEAD `40ee2de3` on branch `docs/consolidation-2026-10-26`, read 2026-10-26. Nothing feature-level was executed (no tests, no PostgreSQL, no browser, no Stripe or Brevo calls); the only run was the small TOKEN_SECRET command in doc 06 section 2.1. Status labels follow the single definition in [01-PRODUCT-REQUIREMENTS.md](01-PRODUCT-REQUIREMENTS.md) section 0.1, where **Implemented-verified** needs source plus automated tests plus a recorded PostgreSQL/browser pass. This pass recorded no such run, so no row here claims it. Rows whose handler and domain code were read in this pass carry **Implemented-unverified (code-read)**.

## 1. Truth rule and status legend

Code decides what is implemented. Documentation (SSOT, PRD, registries, the Yash target blueprint) states intent. A feature is never called working because a document says so.

| Label | Meaning |
|---|---|
| Implemented-unverified (code-read) | Source exists and the route plus domain/store code was read in this pass and behaves as described; not executed. Never upgraded to Implemented-unverified (code-read) here. |
| Implemented-unverified | Source or UI exists per a dated report or grep, but its logic was not read in this pass. |
| Partial | Some of the feature exists; the missing part is named. |
| Planned-approved | Described in SSOT/registries, no code found. |
| Proposed-only | Exists only in the Yash target blueprint (`Yash_Final_Project_Document/`), including its open review findings. Not a commitment. |
| Deprecated | Marked deprecated or not recommended in the registry. |
| Unknown | Could not be established. |

Persistence key: **P** = durable in PostgreSQL when `STORAGE=pg`; **M** = process memory only, lost on restart (the API adds the response header `x-talentsphere-durability: ephemeral`; source `apps/api/src/durability.ts`, `DURABLE_ROUTES`). The API registers 278 unique routes (281 literal registrations across `server.ts` and `billing-stripe.ts`). `DURABLE_ROUTES` lists 78 of them (P) and `STATELESS_ROUTES` 3 (health, plans); the remaining 197 (71%) are M. Counts agree with the architecture and database docs in this folder.

"UI" means a page or component in `apps/web/src` calls the route (checked by searching the web source for API paths). "API-only" means no web code calls it.

## 2. Feature inventory

Feature IDs (`F-nn`) come from the 173-row registry in `docs/registries/FEATURE_REGISTRY.md`. The dated audit `docs/reports/FEATURE_STATUS_2026-10-21.md` holds the per-row historical assessment; its row counts for the 173 features are: 87 partial, 6 implemented-unverified, 1 broken (since fixed, see section 7), 75 not implemented, 4 deprecated or not recommended. Rows below were re-checked against code in this pass unless marked otherwise. The audit is a **historical claim, unverified** wherever this document does not restate a row.

### 2.1 Identity, account, profile

| Feature (F-ID) | Status | P/M | UI | Code location | Notes |
|---|---|---|---|---|---|
| Register (candidate or recruiter only), login, session restore, change password, sign out (this session), sign out other devices (F-01) | Implemented-unverified (code-read) | P | LoginPage, SignUpPage, SessionContext, ChangePasswordForm, SignOutOtherDevices | `server.ts` auth block; `packages/domain/src/auth.ts` | Details in doc 06. |
| Account verification email, forgot/reset password, OAuth/SSO, refresh tokens, age gate, MFA, passkeys (F-01 remainder) | Planned-approved (passkeys, refresh/cookie sessions: Proposed-only) | - | none | none | No route or page exists. |
| Restricted accounts (suspended/deactivated) confined to appeal and data-rights routes | Implemented-unverified (code-read) | P | none | `resolveSession`, `RESTRICTED_SESSION_ROUTES` | Login still succeeds for them by design. |
| Profile read/update, privacy levels `public`, `connections_only`, `recruiters_only`, `private` (F-12, F-60) | Partial | P | ProfilePage | `profile.ts`, `server.ts` profile routes | No uploads/avatars, no education/certification editing, no per-section visibility. |
| Settings (notification prefs, profile visibility, BYO AI key storage), JSON data export, erasure request/status/cancel/execute (F-15) | Partial | P (settings, erasure requests); export is compiled on request | SettingsPage, ProfilePage | `settings.ts`, `account-store.ts`, `erasure-store.ts` | Export returns JSON inline, no download URL, no CSV. Erasure execute has no grace-period check (section 7). |
| Admin console: user list, suspend/reactivate, audit log view, health diagnostics, maintenance toggle (F-17) | Partial | P (users, audit); maintenance flag is memory | AdminPage | `server.ts` `/admin/*`, `admin.ts` | Role changes and feature flags have routes but no UI. |
| Feature flags (F-35) | Partial | P | none | `feature-flag-store.ts`, `/admin/feature-flags`, `/feature-flags` | Flags are stored and listed; **nothing in API or web consumes a flag value to gate behaviour**. |

### 2.2 Evidence, skills, work history (the core trust loop)

| Feature (F-ID) | Status | P/M | UI | Code location | Notes |
|---|---|---|---|---|---|
| Evidence create, read, list mine/by subject, verify, dispute, revoke, public proof (F-96) | Implemented-unverified (code-read) | P | CredentialsSection (read own + public proof link) | `evidence.ts`, `server.ts` `/evidence/*` | **No UI creates evidence**; only API. Created evidence starts `unverified/pending`. |
| Verification ladder `unverified < peer_reviewed < institution_verified < authority_verified` | Implemented-unverified (code-read) | P | none | `verifyEvidence` | Rules in section 5.3. |
| Skills taxonomy list/create; 4 seeded skills in code; relationships and graph (F-84, F-106) | Partial | skills P; relationships M | SkillsSection | `skills.ts`, `/skills*` | Creating skills is platform-admin only. |
| Skill freshness/decay records and re-verify (F-123) | Partial | M | SkillsSection, CareerPage | `skill-decay.ts`, `/skills/freshness*` | |
| Verified work history: add role, corporate-email challenge, reference request, referee response, score and badge, delete role (F-94) | Implemented-unverified (code-read) | P | EvidencePage, ReferencePage | `work-history-graph.ts`, `server.ts` `/candidates/work-history*`, `/references/:refId` | Email delivery depends on the worker; see section 6 and doc 06. |
| Work-history graph and recruiter-facing summary (F-162) | Implemented-unverified (code-read) | P | EvidencePage (score), HiringJobPage (summary in pipeline) | `buildWorkHistoryGraph`, `GET /candidates/:id/work-history-graph` | Referees redacted unless viewer is owner/admin. |
| Skill endorsements (F-110, F-150), forecasts and market signals (F-118, F-151), career transitions/benchmarks/pathways/readiness (F-85, F-91, F-95, F-152) | Partial | M | CareerPage and CareerPaths call benchmarks, pathways, readiness only | `skill-forecasting.ts`, `career-trajectory.ts`, `peer-credibility.ts` | Seed/demo data was removed (conflict register CF-01); empty states are real. Benchmarks need a 20-distinct-person cohort. |

### 2.3 Jobs, applications, hiring

| Feature (F-ID) | Status | P/M | UI | Code location | Notes |
|---|---|---|---|---|---|
| Organizations and members (F-56) | Partial | P | HiringPage (create org, list mine) | `server.ts` `/organizations*` | Add-member route exists, **no UI**. Roles `owner`/`admin`/other. |
| Job create, list, detail, status transitions (F-04, F-05, F-25) | Implemented-unverified (code-read) | P | JobsPage, JobDetailPage, HiringPage | `jobs.ts`, `server.ts` `/jobs*` | Public list shows `published` only. Posting limit enforced per plan (see `docs/PRICING.md`). |
| Apply, my applications, application detail, job applicant list, state transitions (F-06) | Implemented-unverified (code-read) | P | JobDetailPage, ApplicationsPage, HiringJobPage | `applications.ts`, `core.ts` | State machine in section 5.1. Notifications written in the same transaction. |
| Application feedback loop and feedback templates (F-122) | Partial | M | none | `application-feedback.ts` | API-only. |
| Application drafts with versions (F-36) | Partial | M | none | `application-drafts.ts` | API-only; draft is marked submitted on apply. |
| Job templates (F-37) | Partial | M | none | `job-templates.ts` | API-only. |
| Saved searches (P), saved jobs (P), job alerts (M) (F-32) | Partial | mixed | none | `saved-search-store.ts`, `saved-job-store.ts` | API-only; alerts are generated in memory on publish. |
| Salary reports/benchmarks (F-86, F-172) | Partial | M | none | `salary-intelligence.ts` | Cohort floors 3 (company) and 5 (benchmark); gaps in section 7. |
| Interviews: questions, scheduling, consent, code run, scorecards, AI feedback (F-88, F-93) | Partial | M | none | `technical-interview.ts`, `server.ts` `/interviews/*` | Code execution is a **text-based simulation**; the route returns 503 in staging/production. |
| Recruiter tools: talent pools, behavioral discovery, segmentation (F-92, F-158-160) | Partial | M | none | `talent-pool-intelligence.ts`, `behavioral-talent-discovery.ts`, `talent-segmentation.ts` | API-only. |
| Warm intros and referral requests (F-121, F-142) | Partial | M | none | `warm-introductions.ts`, `referral-requests.ts` | API-only. |
| Hiring manager portal, candidate comparison (F-102, F-103) | Partial | - | HiringJobPage is the only pipeline UI | - | The `hiring_manager` role has no dedicated route or page. |

### 2.4 Learning and assessment

| Feature (F-ID) | Status | P/M | UI | Code location | Notes |
|---|---|---|---|---|---|
| Courses, modules, lessons, publish, enroll, progress, complete lessons (F-07, F-66, F-74) | Partial | M (completion evidence is P) | LearningPage (list, enroll), CoursePage (player) | `lms.ts`, `server.ts` `/courses*`, `/modules/*`, `/lessons/*` | **No UI to author or publish courses.** Needs an `instructor`/`course_author`/`platform_admin` role, which only an admin or SQL can grant. |
| Certificates: mint on completion, public verify, revoke (F-52) | Partial | M | VerifyPage, CredentialsSection, CoursePage | `lms.ts`, `/certificates/*`, `/verify/:hash` | Revocation does not touch linked evidence (section 7). |
| Quizzes, final exams, assignments, learning paths, reviews, commerce (F-68, F-69, F-70, F-72, F-73) | Planned-approved | - | none | none | The lesson type `quiz` exists as content metadata only. |
| Challenges arena: list, start session, submit (F-08) | Partial | M (evidence P) | AssessmentsPage | `challenges.ts`, `assessment.ts` | Submissions are **stored, not executed, not scored** (section 7). |
| Gamification: XP ledger, badges, leaderboard (F-22, F-23) | Partial | M | none | `gamification.ts`, `/xp/ledger`, `/gamification/*` | API-only; abusable claim route (section 7). |
| Learning impact (F-114, F-153) | Partial | M | none | `learning-impact.ts` | Cohort floor 30. |
| Contribution/activity scores (F-146, F-169), reputation engine and instructor/employer reputation (F-144, F-148, F-149) | Partial | M | none | `activity-contributions.ts`, `reputation-engine.ts` | API-only. |

### 2.5 Networking and communication

| Feature (F-ID) | Status | P/M | UI | Code location | Notes |
|---|---|---|---|---|---|
| Connections: request, accept/reject, withdraw, remove (F-09) | Partial | M | NetworkPage | `networking.ts` | |
| Direct messaging threads (F-10) | Implemented-unverified (code-read) | P | MessagesPage, ConversationPage, HiringJobPage | `messaging.ts`, `server.ts` `/threads*` | Start rule: accepted connection, or candidate and a member of a team the candidate applied to. Participants only. No real-time channel (fetch on demand). |
| In-app notifications and preferences (F-14) | Implemented-unverified (code-read) | P | NotificationsPage, Layout badge | `notifications.ts` | In-app only; no email/push channel. Digest frequency is stored but nothing sends a digest (F-29). |
| Portfolio projects and showcase (F-26) | Partial | M | PortfolioPage | `portfolio.ts` | Lost on restart. |
| Resume builder and export (F-13) | Partial | M | ResumesPage (create and list only) | `resumes.ts` | No section editor in the UI. |
| Alumni networks and mentorship (F-125, F-40, F-90, F-55) | Partial | M | none | `alumni-networks.ts` | API-only. |

### 2.6 Platform shell, billing, AI, safety

| Feature (F-ID) | Status | P/M | UI | Code location | Notes |
|---|---|---|---|---|---|
| Landing, dashboard (role-adaptive), jobs browse, 404, legal pages (F-02, F-03) | Implemented-unverified | - | LandingPage, DashboardPage, PrivacyPage, TermsPage | `apps/web/src/pages` | Legal pages are unapproved drafts. |
| Command palette and unified search (F-20, F-34, F-147) | Partial | M (history) | CommandPalette (navigation); NetworkPage calls `/search` | `search.ts`, `/search*` | In-process matching, no PostgreSQL full-text search. |
| Billing and subscriptions, Stripe Checkout, portal, webhook, invoices (F-16, F-61) | Partial | P | CheckoutPage with PaidPlans | `billing.ts`, `stripe-billing.ts`, `billing-stripe.ts`, `stripe-gateway.ts` | Default `BILLING_MODE=disabled`. Live payments never exercised. See doc 06. |
| AI career assistant chat, conversations, usage meter (F-11, F-99) | Partial | M | usage meter in PaidPlans only; **no chat UI** | `ai-gateway.ts`, `/ai/*` | Local heuristic responder, no model call. |
| AI assistant query (`POST /ai/assistant/query`) | Partial | M | none | `server.ts` | Echoes the prompt; **skips quota** (section 7). |
| Moderation reports, appeals, content scan (F-24) | Partial | M | none | `moderation.ts` | API-only. |
| Product analytics events and KPIs (F-19, F-31) | Partial | M | none | `analytics.ts` | Honours the user's telemetry setting; KPIs admin-only. |
| PWA: manifest, capability detection (F-21 partly) | Partial | - | Layout, `pwa.ts` | `apps/web/public/manifest.webmanifest` | No service worker is installed by the app; no offline mutation queue. |
| Background jobs and worker (infrastructure) | Implemented-unverified (code-read) | P | none | `background-jobs.ts`, `apps/worker` | Only two job kinds do real work (email); all others are event records. |

### 2.7 Not built (summary)

Planned with no code (audit rows marked not implemented): Chrome extension (F-18, F-27, F-28), OS shell/workbench (F-48), automation agents (F-49), media engine (F-42, F-44, F-51), institutional analytics, faculty dashboard, seat licensing (F-41, F-46, F-47), social feed, articles, events, communities beyond alumni groups (F-53, F-54, F-57, F-79), LinkedIn migration (F-64, F-65), course commerce and marketplaces (F-50, F-73, F-124, F-126, F-130), outreach credits (F-59), written recommendations (F-58), stale-request nudges (F-30), notification digest sending (F-29, partial: preference only), recommendation engine (F-145), most F-100 to F-173 long-tail rows. Deprecated or not recommended: F-38, F-39, F-62, F-63. The Yash blueprint specifies many of these as Proposed-only; see section 9.

## 3. Roles and permissions as actually enforced

### 3.1 How roles are obtained

| Role | How an account gets it |
|---|---|
| `candidate`, `recruiter` | Self-registration (`RegisterInputSchema`: only these two, default `candidate`). |
| `platform_admin` | **Not via the API.** The first admin is created with SQL (`UPDATE public.users SET roles = array_append(roles,'platform_admin') ...`, documented in `docs/quality/OPERATIONS.md`). Afterwards any admin can set roles with `PATCH /admin/users/:id/roles`. |
| `hiring_manager`, `course_author`, `instructor`, `institution_admin`, `moderator`, `verification_staff`, `service_account` | Only by an admin via the roles route (or SQL). There is no application flow that grants them. |
| organization membership roles `owner` (creator), `admin`, other | `POST /organizations` makes the creator `owner`; `POST /organizations/:id/members` (owner/admin or platform admin) adds members. Ownership cannot be granted through that endpoint. |

Current account roles and status are re-read on every request; the signed token's role snapshot does not decide authorization when the account exists.

### 3.2 Capability matrix (enforced behaviour)

| Capability | Anonymous | Candidate (owner) | Recruiter / org member | Moderator | Verification staff | Instructor / author | Platform admin |
|---|---|---|---|---|---|---|---|
| Browse published jobs, public profiles, public proofs, certificates, challenges list | Yes (profiles subject to privacy) | Yes | Yes | Yes | Yes | Yes | Yes |
| Create/read/edit own profile, evidence, work history, settings | - | Yes (own) | Yes (own) | Own | Own | Own | Own |
| Apply to a job | No | Yes | No (BR-02 refuses an account whose roles include `recruiter` but not `candidate`) | Allowed (only the recruiter-without-candidate case is blocked) | Allowed | Allowed | Allowed |
| Create a job / change job status | No | No | Needs role `recruiter` (or admin) **and** any membership of the org (member role is not read) | No | No | No | Yes (any org) |
| See a job's applicants, move applications, schedule interviews | No | Own application only | Any member of the job's org | No | No | No | Yes |
| Withdraw an application | No | Yes (own) | No | No | No | No | Yes |
| Verify evidence: peer level | No | No (needs confirmed referee relationship) | No | No | Yes | No | Yes |
| Verify evidence: institution level | No | No | No | No | No | `instructor`, `institution_admin` | Yes |
| Verify evidence: authority level | No | No | No | No | Yes | No | Yes |
| Dispute evidence | No | No | No | Yes | Yes | Verifier of the record | Yes; also confirmed referee |
| Revoke evidence | No | Owner | No | No | Yes | Original issuer (not a peer) | Yes |
| Create/publish a course; add modules and lessons | No | No | No | No | No | Course instructor (profile match), or `instructor`/`course_author` to create | Yes |
| Revoke a certificate | No | No | No | No | No | Course instructor | Yes |
| Create a challenge | No | No | No | No | No | `instructor` or `course_author` | Yes |
| Moderation queue, resolve, appeal review | No | File reports/appeals only | No | Yes (cannot resolve own report; cannot ban an admin) | No | No | Yes; user ban needs two distinct admins |
| Admin routes (`/admin/*`), analytics events list/KPIs | No | No | No | No | No | No | Yes |
| Billing checkout | No | Candidate plans only | Recruiter plans for `recruiter`/`hiring_manager` | n/a | n/a | n/a | n/a |

Organization-role granularity, `hiring_manager`, and `service_account` have no distinct enforced behaviour beyond the lines above (known policy gap, section 7).

## 4. User journeys as built

Journey IDs J-01 to J-28 in `docs/experience/JOURNEY_REGISTRY.md` are **target** journeys; none was certified end to end by the audit. The table states what a user can actually do today.

| Journey | Steps that exist in code and UI | Steps that do not | Status |
|---|---|---|---|
| Candidate: join, prove, apply (J-02 core) | Sign up (`/signup`) -> add work history and verify work email by code (`/evidence`) -> request references -> referee responds from emailed link (`/reference/:id`) -> browse `/jobs` -> apply with attached evidence (`/jobs/:id`) -> track on `/applications` -> receive status notifications and messages | Creating self-declared evidence in the UI; autosave draft; interview scheduling UI; offer acceptance flow; outcome feedback UI | Partial |
| Recruiter: org, job, pipeline | Sign up as recruiter -> create organization (`/hiring`) -> create/publish job (plan limit applies) -> view applicants with evidence and work-history summary (`/hiring/jobs/:id`) -> transition states -> message candidate | Adding team members in the UI; templates; scorecards/interviews UI; hiring-manager sign-off; candidate search | Partial |
| Referee (no account) | Open emailed link, view role details with the one-time token, submit confirmation and ratings; token dies on use and after 30 days | Declining a request (the `declined` status is never set) | Implemented-unverified (code-read) |
| Learner (J-19-like) | Browse `/learning`, enroll, complete lessons in order, receive certificate and authority-verified evidence, verify at `/verify/:hash` | Course authoring UI, quizzes, final assessment gate, durable course data | Partial |
| Challenge taker | List challenges, start a session, submit code | Execution, scoring, XP (all zero by design) | Partial |
| Admin | Sign in, view users, suspend/reactivate, read audit log and health, toggle maintenance | Role editing and flag management UI; maintenance does not block traffic | Partial |
| Account lifecycle | Change password, sign out others, export JSON, erase account | Grace-period enforcement, scheduled erasure, CSV export | Partial |
| Billing | View plans; with `BILLING_MODE=stripe` start Checkout, open portal, webhook syncs plan | Verified live payment; invoice UI beyond the plan card | Partial, unverified live |

## 5. State machines and workflows (from `packages/domain` and API orchestration)

### 5.1 Application (`core.ts`, `applications.ts`)

States: `draft, submitted, in_review, shortlisted, interviewing, offered, hired, rejected, withdrawn, expired`. Source of truth: `ALLOWED_APPLICATION_TRANSITIONS` (INVARIANT-010).

| From | Allowed to |
|---|---|
| draft | submitted, withdrawn |
| submitted | in_review, withdrawn, rejected |
| in_review | shortlisted, rejected, withdrawn |
| shortlisted | interviewing, rejected, withdrawn |
| interviewing | offered, rejected, withdrawn |
| offered | hired, rejected, withdrawn |
| hired, rejected, withdrawn, expired | none (terminal) |

Guards: only `withdrawn` by the candidate owner (or admin); every other move by a member of the job's organization (or admin). Apply creates `submitted` directly: **`draft` and `expired` are never produced by any route.** One active application per (job, candidate) is enforced by domain check and a partial unique index. Only `published` jobs accept applications. Evidence attached must belong to the applicant's profile.

### 5.2 Job (`jobs.ts`)

`draft -> pending_approval | published | archived`; `pending_approval -> approved | draft | archived`; `approved -> published | draft | archived`; `published -> paused | closed | archived`; `paused -> published | closed | archived`; `closed -> archived`; `archived` terminal. Actor must be `recruiter` of that org or admin. Nothing enforces approval: a recruiter can approve their own job or publish straight from `draft`. Publishing is checked against the plan's active-job limit; the status route serialises per organization, the create route does not (section 7).

### 5.3 Evidence (`evidence.ts`)

Status `pending | verified | disputed | revoked | expired`; level `unverified | peer_reviewed | institution_verified | authority_verified`.

- Created as `unverified/pending` (a claim is not evidence is not verification).
- `verify`: refused if revoked or expired; a `disputed` record can be changed only by platform admin/verification staff; level may only rise (equal level only by staff); the subject cannot verify their own evidence; level 1 needs staff or a confirmed referee; level 2 needs `institution_admin`, `instructor` or admin; level 3 needs admin or verification staff.
- `dispute`: staff, moderator, the original verifier, or a confirmed referee.
- `revoke`: owner, staff, or the original verifier unless that verification was by a peer. Append-only metadata records reason and actor.
- `expired` exists as a type but **no code transitions into it**.
- Public proof (`/evidence/:id/verify-public`, `/verify/:hash`) exposes title, type, level, status, dates and a SHA-256 proof hash, no personal data.

### 5.4 Work-history verification (`work-history-graph.ts`, API)

Score: +40 verified corporate email; references that confirm dates and title: +30 manager, else +20 peer, else +15; +15 for two or more; +10 if average of three ratings >= 4.0; +5 for two or more skills the references independently endorse; cap 100. Tier: `gold >= 80`, `silver >= 50`, `bronze >= 25`, else none. Status `verified` at score >= 25, `pending_verification` if an email or reference exists, else `unverified`. Self-typed skills never add points.

Email challenge: 6-digit code (`crypto.randomInt`), only SHA-256 stored, 15-minute expiry, 5 attempts, code delivered by the worker, never returned to the requester. Reference: one-time token, SHA-256 stored, emailed to the referee, 30-day expiry, single use; the candidate cannot submit their own reference; the submitter must present the token (sign-in alone is not accepted). Reference statuses `declined` and `flagged` exist in the type but nothing sets them.

### 5.5 Learning (`lms.ts` and API)

Course `draft -> published -> archived` (publish needs readiness validation; only published courses enroll). Enrollment `enrolled | completed | dropped | expired`; a duplicate active enrollment and enrolling in your own course are refused. Lesson completion is idempotent, sequential by module, and respects `prerequisiteLessonId`. When every lesson is complete the API (a) creates evidence `course_completion`, sets it `verified/authority_verified` directly, (b) mints a certificate (`verified | revoked | expired`), (c) awards capped XP, (d) enqueues `lms.course.completed`. No final assessment is required (section 7).

### 5.6 Billing (`billing.ts`, `stripe-billing.ts`, `billing-stripe.ts`)

Subscription status `active | past_due | canceled | incomplete | trialing`. Entitlements follow `entitledTier`: only `active` or `trialing` grant a paid tier; everything else is free. A paid plan appears only after a signed Stripe subscription event whose price id is in the server catalog; checkout redirect grants nothing. Cancel: scheduled (period end) or immediate; a full refund of the current period's charge cancels. Elapsed cancellations are settled on read. Detail in doc 06 section 8.

### 5.7 Account and erasure

User status `active | suspended | pending_verification | deactivated`; non-active = restricted session. Admin cannot suspend/deactivate or strip the admin role from themselves. Erasure request statuses `pending | grace_period | processing | completed | cancelled`. Execute: writes a durable `processing` marker, deletes the Stripe customer and local billing rows, then one core transaction (user to `deactivated` with destroyed credential and anonymized email, profile anonymized, notifications/messages/evidence/work history deleted, open applications withdrawn with cover letters blanked), then clears in-memory stores. Resumable if interrupted after the core commit. Reviews, chat held by others and some memory modules are not redacted (comment in code).

### 5.8 Background job (`background-jobs.ts`, `apps/worker/src/claim.ts`)

`queued -> running -> succeeded | failed | dead | canceled`. Claim uses `FOR UPDATE SKIP LOCKED` with a 60 s lease and 30 s handler timeout; batch size is capped so jobs fit inside one lease (default 1); a job whose remaining lease is too short is not started; success/failure acknowledgements are fenced by the attempt counter. Max 3 attempts, exponential backoff with jitter. Unknown kinds dead-letter. `PermanentJobError` skips retries. Handlers: `work_history.email_verification_requested` and `reference.requested` send email; the other 43 of the 45 kinds in `DISPATCH_EVENT_KINDS` only log "event recorded". `JobQueueEngine` (`apps/worker/src/queue.ts`) is unit-tested but not used at runtime.

### 5.9 Other machines (domain types, lighter enforcement)

Moderation report `pending | under_review | resolved | dismissed`, actions `none | warning | content_removed | user_suspended | user_banned | dismissed`, appeal `pending | under_review | upheld | denied`. Connection `pending | accepted | rejected | withdrawn`. Referral `pending | approved | forwarded | declined | expired`, outcome `referred | interviewing | hired | rejected`. Alumni verification `unverified | pending | verified | rejected`. Mentorship `requested | active | completed | declined`. Salary report `submitted | verified | flagged_outlier | withdrawn`. Assessment session `in_progress | submitted | timed_out | abandoned | invalidated` (only `in_progress -> submitted` is produced by the API). None of the machines in this subsection is durable (all M).

## 6. Feature dependencies

| Feature | Depends on |
|---|---|
| Every authenticated feature | Auth (HMAC sessions), account read model hydrated from PostgreSQL at boot, single API writer holding the advisory lock |
| Work-email verification, reference requests | `background_jobs` row, worker process running, `EMAIL_PROVIDER=brevo` with `EMAIL_FROM` and `BREVO_API_KEY` (deployed) or the dev outbox log (development); API refuses with 503 in deployed environments when email is not configured |
| Apply to a job | Candidate profile, published job, optional evidence ownership check |
| Plan-limited publishing and AI quota | Stored subscription (`storage.billing`), which in turn depends on Stripe webhook delivery when `BILLING_MODE=stripe` |
| Course certificates and authority-verified course evidence | LMS data (memory) plus evidence store (PostgreSQL); a restart loses the course, enrollment and certificate while keeping the evidence |
| Reputation, salary, career, forecasts, recruiter intelligence | Data recorded by users through API-only routes; no seed data, so outputs are empty until recorded |
| Messaging start rule | Connections (memory) or applications (PostgreSQL); after a restart a connection-based thread start is refused until reconnected, existing threads persist |
| Admin health "queue operational" | Worker heartbeat row `worker_health` fresher than 45 s |
| Erasure | Stripe gateway reachable (when a Stripe customer exists), PostgreSQL |

## 7. Edge cases and known gaps (verified against code in this pass)

Verdicts (these map to the 01 labels: Confirmed = code-read, Open/Fixed = state of the code; nothing here is a run result): **Confirmed** = true in current code; **Fixed** = was reported, code no longer matches; **Open** = true and unresolved. "Claim source" is where the claim was made.

| # | Item | Verdict | Evidence | Claim source |
|---|---|---|---|---|
| G-01 | "Simulated `passed`/100 for any challenge submission" | **Fixed 2026-10-24** (commit `3e9bedbf`). `evaluateChallengeSubmission` now returns `status:'submitted'`, `score:0`, `xpEarned:0`, evidence `unverified/pending` with `metadata.executed:false`; the route adds `executed:false, verified:false`. The integration test now asserts zero XP. | `assessment.ts`, `server.ts` submit route, `tests/integration/challenges-assessment.test.ts` | ARCHITECTURE.md section 20, SECURITY.md header, FEATURE_STATUS D-01/F-08, conflict register CF-27 (second sentence) are stale. |
| G-02 | Interview code execution is simulated | **Confirmed**, mitigated: the route returns 503 outside development/test. Result depends on code text. | `server.ts` `/interviews/assessments/:id/code`, `technical-interview.ts` | CF-27 |
| G-03 | Course completion mints authority-verified evidence without the BR-048 final assessment | **Confirmed Open.** `evidence.status='verified'` and `authority_verified` are assigned directly on last-lesson completion. Because only the course's own instructor is blocked from enrolling, a second account can enroll in a trivial published course and mint authority-level evidence. Not a tested exploit, a reading of the code. | `server.ts` `POST /lessons/:id/complete` | SECURITY.md header, audit D-09 |
| G-04 | Certificate revocation does not revoke linked evidence | **Confirmed Open.** The revoke route only updates the certificate maps. | `server.ts` `POST /certificates/:n/revoke` | audit D-10, CF-41 |
| G-05 | `POST /ai/assistant/query` skips the quota | **Confirmed Open.** It checks only the assessment prohibition and echoes the prompt. | `server.ts` | ARCHITECTURE.md section 20, CF-35 |
| G-06 | "AI tier is hardcoded free" (R-4) | **Fixed 2026-10-24** (commit `53a9eaf3`). Chat uses `aiTierForPlan(entitlements)` and `aiQuotaForEntitlements`; limits come from the plan table (`docs/PRICING.md`). | `server.ts` chat route, `ai-gateway.ts` | ARCHITECTURE.md R-4, CF-35, F-11 note |
| G-07 | AI data-consent setting not enforced on AI routes | **Confirmed Open** (no consent check in any AI route). | grep of `server.ts` | CF-35 |
| G-08 | `POST /settings/erasure/execute` ignores the 30-day grace period; the Profile page calls it directly | **Confirmed Open.** | `server.ts`, `ProfilePage.tsx` | CF-33 |
| G-09 | Maintenance mode changes diagnostics only, resets on restart | **Confirmed Open.** | `systemInMaintenance` used only in diagnostics | CF-42 |
| G-10 | Any org membership manages jobs/applicants; org role is never read; `hiring_manager` cannot create jobs | **Confirmed Open** (`canManageJobs`, `createJobPosting` requires `recruiter` or admin). An org owner without the `recruiter` role is refused by the domain layer. | `server.ts`, `jobs.ts` | CF-14, CF-16 |
| G-11 | No approval gate on jobs; no moderation state | **Confirmed Open** | `jobs.ts` | CF-15 |
| G-12 | Plan limit race on `POST /jobs` with `published` | **Open (new reading).** Only the status route uses `withOrgPublishLock`; create does not. | `server.ts` | not previously recorded |
| G-13 | Corporate-email domain match runs only if the role's organization has a website; otherwise any non-webmail, non-disposable address passes | **Confirmed Open** | `assertCorporateEmailEligible` | CF-11 |
| G-14 | `POST /gamification/claim-activity` lets any user award XP/badges for self-chosen references (cap 200/day) | **Confirmed Open** | `server.ts` | CF-31 |
| G-15 | `GET /activity/users/:userId/score` readable by any signed-in user | **Confirmed Open** | `server.ts` | CF-34 |
| G-16 | Instructor review `isVerifiedEnrollment` taken from request body | **Fixed.** Derived server-side from enrollments. | `server.ts` instructor review route | CF-38 (stale) |
| G-17 | Referral `resumeId` not ownership-checked | **Fixed.** `assertOwnedResume` is called. | `server.ts` | CF-44 (partly stale) |
| G-18 | Worker batch can burn later jobs' leases; completion not fenced | **Fixed.** Safe batch size, lease-fit check, attempt fence. | `claim.ts` | ARCHITECTURE.md section 18, audit D-02 |
| G-19 | Generic `/billing/webhook` ("dispute/refund not acted on") | **Partly stale.** The Stripe path acts on a full refund of the current period's charge (cancels). The generic HMAC webhook only records an event. Disputes and voided invoices are still not handled. | `billing-stripe.ts` | SECURITY.md section 9 |
| G-20 | Feature flags gate nothing | **Confirmed Open** | no consumer in API or web | new |
| G-21 | `Evidence.status = 'expired'`, `Application draft/expired`, reference `declined/flagged`, assessment `timed_out/abandoned/invalidated` are unreachable states | **Confirmed** | domain types vs routes | partly CF-22 |
| G-22 | No UI to create evidence, author courses, add org members, change roles, or manage flags | **Confirmed** | web API-path search | new |
| G-23 | Long-tail modules are memory only: resumes, portfolio, connections, courses, certificates, XP, reputation, salaries, interviews, talent pools, alumni, referrals, job templates, drafts, alerts, analytics, moderation | **Confirmed** (`DURABLE_ROUTES`) | `durability.ts` | CF-43 |
| G-24 | Jobs enqueue failure is logged and swallowed for all event kinds except the two email routes | **Confirmed Open** | `dispatchJob` | CF-23 |
| G-25 | Document claims "no downloadable export / CSV unavailable" | **Confirmed** (JSON inline only) | settings export | - |
| G-26 | Salary cohorts can be filled by one account; floor is 3 | **Open, not re-read in depth** (historical claim, unverified) | `salary-intelligence.ts` | CF-37 |

Further edge cases recorded from code: login by a restricted account succeeds but is confined; the first admin needs SQL; new accounts get no skills or goals (onboarding, goal and gap analysis steps in the north-star loop are Planned); posting limits and AI quota depend on a stored subscription so a failed webhook leaves a paying customer on free; job alerts and course progress vanish on restart while evidence from the same flow persists.

## 8. Claims in other documents found false or stale against code

| Document and claim | Reality |
|---|---|
| ARCHITECTURE.md section 20 and SECURITY.md header: challenge submission "can return simulated passed/100" | Fixed 2026-10-24 (G-01). |
| ARCHITECTURE.md R-4, conflict register CF-35: AI tier "hardcoded free" | Fixed 2026-10-24 (G-06). Assistant-query quota skip and consent gap remain. |
| ARCHITECTURE.md section 18: later jobs' leases consumed; completion not fenced | Fixed (G-18). Timeouts still do not abort the underlying promise. |
| Audit F-16 / SECURITY.md: "no real payment provider integration" | Stripe integration exists since 2026-10-23, default disabled, live use unverified. |
| Conflict register CF-38, part of CF-44 | Fixed (G-16, G-17). |
| FEATURE_STATUS retained 'Implemented 16' count | Historical; the dated matrix counts 6 implemented-unverified. Treat both as unverified. |
| `docs/system-model/06-route-authorization.md`: free AI quota "20 requests and 5000 tokens per day" | Free plan is 5 requests / 5,000 tokens per day (`billing.ts`, `docs/PRICING.md`); use those. |

## 9. Target design (Proposed-only) pointers

The blueprint in `Yash_Final_Project_Document/` is a greenfield target, not a description of this code. Its feature specs (folder 05, 14 long-form specs, 359 acceptance criteria, 65 micro-features), business processes and state machines (folder 06, `SM-*` including account, session, evidence, verification, reference, attempt, enrolment, job, application, interview, subscription, DSR, moderation, notification, background job with fenced lease) and UI/UX system (folder 07) are all **Proposed-only**. Its own review fix status (`27_INDEPENDENT_REVIEWS/REVIEW_FIX_STATUS.md`) lists open findings (no consolidated OPEN register, stale headline counts, cost evidence missing, 168 of 253 features without an acceptance criterion) and states that REV2 fixes were not independently re-read. Use it for design intent only. Where it differs from this document (for example cookie sessions with refresh rotation, passkeys, `Idempotency-Key`/ETag on mutations, outbox in the same transaction, `issuer_class` for instructors), this document describes the code and the blueprint describes a future.

## 10. Frontend (React PWA)

Sources: `apps/web/src/App.tsx`, `components/Layout.tsx`, `lib/*`, `packages/ui/src/tokens.ts`, `docs/experience/APP_FLOW.md` and `UI_UX_DESIGN_SYSTEM.md`. Labels as in section 1; the web app was not run in this pass.

### 10.1 Route map (built, from `App.tsx`)

`App.tsx` mounts `SessionProvider` > `BrowserRouter` > one `Layout` route. There are 30 `<Route>` elements: the layout, the index, 27 named paths and a catch-all. `RequireAuth` only checks that a token exists in `localStorage` and redirects to `/login?return=<path>`; the API remains the authority.

| Access | Paths (page component) |
|---|---|
| Public | `/` (LandingPage), `/login`, `/signup`, `/checkout` (CheckoutPage with PaidPlans), `/privacy`, `/terms`, `/jobs` (JobsPage), `/jobs/:id` (JobDetailPage), `/reference/:id` (ReferencePage, referee uses emailed token, no account), `/verify/:hash` (VerifyPage) |
| Guarded (token present) | `/dashboard`, `/applications`, `/evidence` (labelled "Work history" in the nav), `/profile`, `/settings`, `/portfolio`, `/resumes`, `/network`, `/learning`, `/learning/:id` (CoursePage), `/career`, `/notifications`, `/messages`, `/messages/:id`, `/hiring`, `/hiring/jobs/:id`, `/assessments`, `/admin` |
| Catch-all | `*` (NotFoundPage) |

29 page files exist in `apps/web/src/pages`. Listed as target routes in `APP_FLOW.md` but not built: `/register`, `/courses`, `/challenges`, `/career/*`, `/recruiter/*`, `/hm/dashboard`, `/paths`, `/teach/*`, `/cart`, `/orders`, `/feed`, `/posts/:id`, `/articles/:id`, `/communities`, `/events`, `/institution/*`. Backend endpoints with similar names do not imply those pages.

### 10.2 Navigation model (built)

`Layout.tsx` chooses navigation from the session's roles: signed-out visitors get Jobs and Pricing; accounts holding `recruiter`, `hiring_manager` or `platform_admin` get Dashboard, Hiring, Jobs, Messages; everyone else gets Dashboard, Jobs, Applications, Work history, Messages; `platform_admin` additionally sees Admin. Notifications show as a header badge (unread count refreshed on route change and focus). `/portfolio`, `/resumes`, `/network`, `/learning`, `/career`, `/assessments` are routed but have no nav link (CF-28). A 64 px one-row header is used at every width; below 1024 px a menu button opens an overlay panel. The layout announces route changes through a polite live region, provides a skip link, restores focus to `<main>` after navigation, shows an offline indicator and wraps pages in `RouteErrorBoundary` keyed by path.

### 10.3 Client behaviour that matters

| Concern | Built behaviour |
|---|---|
| Session | `SessionProvider` loads `/auth/session` on start; token and user stored under `talentsphere_token` / `talentsphere_user` (`lib/session.ts`). The session-end reason is shown once on the sign-in page. |
| Requests | `apiFetch`/`apiJson` (`lib/api.ts`): attaches the bearer token; on 401 with a token clears the session and redirects; 403 keeps the session; default 20 s timeout; the login helper treats 401 as bad credentials. |
| State | React hooks and context; no TanStack Query or Redux. |
| PWA | Manifest (standalone, theme `#1e5b45`, 192/512 icons) and capability detection in `pwa.ts`; offline readiness is reported only if a service worker already controls the page. No service worker is shipped, no offline mutation queue, no push. |
| Errors | Error boundary per route; `LoadError`, `Notice`, `EmptyState` primitives; server 5xx messages are masked. The target error-screen catalogue (401/403/404/409/429/5xx/maintenance with request id) is only partly realised. |

### 10.4 Design system essentials

| Item | Target (`UI_UX_DESIGN_SYSTEM.md`, status: design target) | Built |
|---|---|---|
| Tokens location | one generated token source; no hard-coded colours or spacing in feature code | `packages/ui/src/tokens.ts` (colors, spacing, typography, textColors, motion, breakpoints). Components live in `apps/web/src/components` and `components/ui` (Badge, Button, Card, EmptyState, Field, Icons, Input, LoadError, Modal, Notice, PageHeader, StatusPill, VerificationSeal); CSS in `apps/web/src/styles` (`global.css`, `layout.css`, `landing.css`). `packages/ui` exports tokens only. |
| Palette | semantic roles | "Spruce" green primary (`primary.700 #1e5b45`), green-grey neutrals, paper background `#f4f5f1`; semantic tones split into display tones (icons/badges only) and AA text-safe tones (`successText`, `warningText`, `errorText`, `infoText`) |
| Spacing | 4 px grid | 4/8/16/24/32/48/64 px scale |
| Type | scale xs-4xl | IBM Plex Sans/Mono, Newsreader serif; xs 0.75rem to 4xl 2.25rem plus two fluid display sizes |
| Radii | 6/10/16/50% | not defined in `tokens.ts` |
| Motion | 120/200/320 ms | 0/150/250/400 ms with two easings; `prefers-reduced-motion` handled in `global.css` |
| Breakpoints | mobile-first | sm 640, md 768, lg 1024, xl 1280, 2xl 1536 |
| Dark mode | first-class | not built (no `prefers-color-scheme` rule found) |
| Component rule | atoms > molecules > organisms > templates > pages; promote after second reuse | flat `components/ui` primitives; no formal layering |
| Canonical states | IDLE, HOVER, FOCUS, PRESSED, LOADING, SUCCESS, ERROR, EMPTY, DISABLED, VALIDATION, PARTIAL, OFFLINE, SYNCING, PERMISSION_DENIED, RESTRICTED; lifecycle PENDING, PROCESSING, VERIFIED, REJECTED, EXPIRED, REVOKED, DISPUTED, ARCHIVED | Partial: loading, empty, error, disabled, validation exist per page; OFFLINE is a banner; SYNCING, PARTIAL and RESTRICTED have no shared component (`StatusPill` and `VerificationSeal` cover evidence and verification states) |
| Responsive | mobile bottom nav and sheets, tablet two-pane, desktop sidebar | One header navigation at all widths; no bottom nav, sheets or sidebar |
| Design intent | trustworthy, calm, dense for professionals, progressive disclosure, honest loading, actionable empty states | Stated target; the 100-pattern micro-interaction register is in `SSOT.md` Appendix D |

### 10.5 Accessibility targets

Target: WCAG 2.2 AA. Required by the design doc: keyboard navigation, visible focus, logical focus management, semantic HTML, labels and descriptions, screen-reader status messages, accessible dialogs and tables, reduced motion, sufficient touch targets, zoom and reflow. Built evidence: skip link, route-announcer live regions, focus recovery to `<main>`, AA-checked text tokens, reduced-motion CSS, a `Modal` primitive. Not established: measured conformance (browser accessibility runs, manual screen-reader checks). `tests/e2e/accessibility.spec.ts` exists; nothing was run. Treat AA as a target, not a result.

### 10.6 Target journey flows (APP_FLOW, not acceptance claims)

Candidate core: landing > sign up/in > onboarding > career goal > skill profile > gap analysis > learning > practice > evidence > career profile > job discovery > match explanation > application > interview > outcome > feedback > next action. Built portion: sign up > work history and proof > jobs > apply > applications. Onboarding, goals, gap analysis, practice-to-evidence, match explanation, interview and outcome feedback are Planned-approved with no UI. Recruiter: organization setup > job > publish readiness > candidate discovery > evidence-aware review > shortlist > communication > interview > scorecard > decision > outcome. Built: organization, job, pipeline, messaging; discovery, interview, scorecard and outcome have no UI. The institution flow (tenant, programs, seats, cohorts, graduation) is not built. Cross-cutting rules in `APP_FLOW.md` (preserve work on refresh and back, recovery steps, error screens, assessment flow with `AI_PROHIBITED`, evidence flow) are targets; the server-side parts (assessment AI prohibition, evidence ladder) are built (sections 5.3 and 7).

## 11. Traceability chain

The governance rule (`docs/governance/GOVERNANCE.md` section 4) is: business outcome > user need > journey (J-nn) > feature (F-nn) > requirement (BR-nn / SSOT) > data/API/event > implementation > test > release gate. This document supplies the middle and right-hand links as built: features and journeys (sections 2 and 4), the code-location column (implementation), test names where known (`tests/unit`, `tests/integration`, `tests/security`, `tests/pg`, `tests/e2e`; for example `tests/integration/challenges-assessment.test.ts` for G-01), and the open gaps in section 7 as the release gates not yet met. The per-feature test association and evidence ledger stay in `docs/reports/FEATURE_STATUS_2026-10-21.md` and `AUDIT_EVIDENCE_2026-10-21.json` (historical, unverified); no new mapping was produced in this pass.

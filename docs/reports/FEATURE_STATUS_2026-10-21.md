# Feature status cross-check — 2026-10-21

Source of truth: `docs/registries/FEATURE_REGISTRY.md` (173 features). Each feature was checked against the code (API routes in `apps/api/src/server.ts`, web routes in `apps/web/src/App.tsx`, worker, domain, migrations) and against the test suites (`tests/`, F-IDs in test titles).

## Rule

- **Implemented:** reachable in the web UI, backed by the API, and covered by a test.
- **Partial:** some layer exists (API, domain or a thin subset), but there is no UI path or the feature is a subset of its registry scope.
- **Not started:** no code found for the feature.
- **Deprecated / Not recommended:** as stated by the registry.

## Counts

| Status | Count |
|---|---:|
| Implemented | 16 |
| Partial | 78 |
| Not started | 75 |
| Deprecated | 2 |
| Not recommended | 2 |
| **Total** | **173** |

## Implemented

| ID | Feature | Evidence |
|---|---|---|
| F-01 | Authentication & Session | Login/signup UI, auth API, e2e |
| F-02 | Landing Page | Landing page, e2e |
| F-03 | Dashboard (Role-Adaptive) | Role-adaptive dashboard, e2e |
| F-04 | Job Marketplace | Jobs list and apply, e2e |
| F-05 | Post Job Studio | Recruiter posts and publishes jobs, e2e |
| F-06 | ATS / Candidate Pipeline | Recruiter applicant pipeline, e2e |
| F-09 | Professional Networking | Network page: search, request, withdraw, e2e |
| F-10 | Direct Messaging | Messages UI, threads API, e2e |
| F-12 | Profile Management | Profile page, e2e |
| F-14 | Notification Center | Notifications page and badge, e2e |
| F-15 | Settings | Settings page saves to API, e2e |
| F-20 | Command Search (⌘K) | Command palette, e2e |
| F-25 | Job Detail View | Job detail page, e2e |
| F-26 | Portfolio Showcase | Portfolio page, e2e (server memory only) |
| F-94 | Verified Work History & References | Work history, email verification, references UI, e2e |
| F-162 | Verified Work History Network & Graph | Work-history graph score shown on evidence page, e2e |

## Partial

| ID | Feature | Evidence |
|---|---|---|
| F-07 | Learning Management System | Course enrol and progress API; UI shows enrol only, no lesson player |
| F-08 | Challenges Arena | Challenge API; assessments page is a preview, nothing scored |
| F-11 | AI Career Assistant (Basic) | Career assistant chat API; no UI route calls it |
| F-13 | Resume Builder | Resume create and export API; UI creates only, no section editor |
| F-16 | Billing & Subscriptions | Billing API is simulated; checkout shows plans, does not call billing |
| F-17 | Admin Console | Admin API; no admin UI |
| F-19 | Product Analytics | Analytics events API; no UI |
| F-21 | Error Recovery & Resilience | Session error notice only; no systematic recovery |
| F-22 | Gamification & XP Ledger | XP ledger and gamification API; no UI |
| F-23 | Leaderboard & Badges | Leaderboard and badges API; no UI |
| F-24 | Trust, Safety & Moderation | Moderation API; no UI |
| F-29 | Scheduled Notification Digest | Digest preference stored; no digest sending in worker |
| F-31 | KPI Aggregation & Rollups | KPI API; no UI |
| F-32 | Saved Searches & Job Alerts | Saved searches and alerts API; no UI |
| F-33 | Video Interview Rooms | Interview join API; no UI |
| F-34 | Multi-Entity Backend Search | Search API; only the Network name lookup calls it |
| F-35 | Feature Flag Console | Feature flags API; no UI |
| F-36 | Application Draft Autosave | Application drafts API; no UI calls it |
| F-37 | Job Templates | Job templates API; no UI |
| F-40 | Institutional Managed Learning | Alumni institutions API; no UI |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | Proctoring fields on interviews only; no vendor integration |
| F-52 | Certificate Verification | Certificate verify API at /verify/:hash; no UI route |
| F-55 | Groups & Communities | Alumni groups API; no UI |
| F-56 | Organization & Institution Pages | Organization API and hiring page; no public company page |
| F-60 | Profile Views & Privacy Controls | Profile visibility settings; no view tracking |
| F-61 | Premium Candidate Tier (OD-34 gated) | Candidate plan defined; no gating |
| F-66 | Course Creation Studio | Course create and publish API; no studio UI |
| F-67 | Categories, Discovery & Comparison | Level filter and skill categories; no category browse |
| F-68 | Quizzes, Practice Tests & Final Exams | Quiz lesson type exists; no quiz engine |
| F-74 | Instructor Platform | Instructor reputation API; no instructor platform UI |
| F-75 | Employer Insights | Employer reputation and metrics API; no UI |
| F-77 | Skill Certification Exams | Certificates API; no exam platform |
| F-80 | Profile Enhancements | Headline, bio, location fields; no enhancements |
| F-81 | Identity Verification | Work-email verification of roles; no identity document check |
| F-82 | Student Learning Analytics | Per-course learning outcomes API; no UI |
| F-83 | Admin Platform Expansion | Admin routes; no UI |
| F-84 | Skills Graph & Taxonomy | Skills graph API; no UI |
| F-85 | Career Graph & Progression | Career transitions and benchmarks API; no UI |
| F-86 | Salary Intelligence | Salary benchmarks and reports API; no UI |
| F-87 | Interview Experience Repository | Interview question bank API; no UI |
| F-88 | Technical Interview Platform | Technical interview API; no UI |
| F-89 | Contribution Verification System | Contribution scores API; no UI |
| F-90 | Peer Mentorship & Advisor Network | Alumni mentorship API; no UI |
| F-91 | Career Readiness Assessment | Career readiness milestones API; no UI |
| F-92 | Advanced Recruiter Search | Recruiter talent pools API; no UI |
| F-93 | Interview Video Recording & AI Feedback | Interview AI feedback API; no UI |
| F-95 | Career Transition Planning | Career transitions API; no UI |
| F-96 | Skill Evidence & Digital Credentials | Evidence UI; certificates and credentials not in UI |
| F-97 | Real-Time Job Market Analytics | Market signals API; no UI |
| F-98 | Employer Equity & Compensation Intelligence | Company salary API; no UI |
| F-99 | AI Career Coach (Enhanced) | Basic career assistant only; enhanced coach not built |
| F-101 | Badge Marketplace & Recognition | Badges API; no marketplace |
| F-102 | Hiring Manager Portal | Recruiter hiring UI; no hiring-manager portal |
| F-103 | Candidate Comparison & Rubric | Scorecard and comparison API; no UI |
| F-106 | Skill Prerequisite Engine | Skill relationships API; no UI |
| F-110 | Verified Skill Endorsements | Endorsements API; no UI |
| F-114 | Learning Impact Tracking | Learning impact API; no UI |
| F-117 | Mobile-First Job Application | Responsive apply flow; no offline or native app |
| F-118 | Emerging Skills Detection | Top-growth skills API; no UI |
| F-121 | Warm Introduction Paths | Warm intros API; no UI |
| F-122 | Application Feedback Loop | Application feedback API; no UI |
| F-123 | Skill Decay Tracking (Freshness Engine) | Skill freshness API; no UI |
| F-125 | Alumni Networks | Alumni networks API; no UI |
| F-142 | Referral Request System | Referral requests API; no UI |
| F-144 | Reputation Engine (multi-context) | Reputation engine API; no UI |
| F-146 | Activity & Contribution Tracking | Activity tracking API; no UI |
| F-147 | Unified Search & Discovery | Unified search API; no UI |
| F-148 | Instructor Reputation System | Instructor reputation API; no UI |
| F-149 | Employer Reputation & Brand System | Employer reputation API; no UI |
| F-150 | Peer Credibility Networks | Peer credibility API; no UI |
| F-151 | Skill Supply/Demand Forecasting | Skill forecasting API; no UI |
| F-152 | Career Trajectory Analysis | Career trajectory API; no UI |
| F-153 | Learning Impact Dashboard (Enhanced) | Learning impact dashboard API; no UI |
| F-158 | Talent Pool Intelligence & Analytics | Talent pools API; no UI |
| F-159 | Behavioral Talent Discovery | Behavioural discovery API; no UI |
| F-160 | Talent Segmentation & Classification | Segmentation API; no UI |
| F-169 | Community Contribution Scoring & Recognition | Contribution scoring API; no UI |
| F-172 | Advanced Compensation Intelligence | Compensation reports API; no UI |

## Not started

| ID | Feature | Evidence |
|---|---|---|
| F-18 | Chrome Extension Companion | No extension code in repo |
| F-27 | Local Resume Match Preview | No extension code |
| F-28 | External Job Page Scanner | No extension code |
| F-30 | Networking Stale-Request Nudges | No stale-request nudge code |
| F-41 | Procurement & Seat Licensing | No seat licensing code |
| F-42 | Provider-Agnostic Media Engine | No media engine code |
| F-43 | B2B2C Graduation Flywheel | No graduation flywheel code |
| F-44 | AI Media Enrichment | No AI media enrichment code |
| F-46 | Institutional Analytics | No institutional analytics code |
| F-47 | Faculty Dashboard | No faculty dashboard code |
| F-48 | OS Shell & Workbench | No OS shell or workbench code |
| F-49 | Automation & Agents | AI orchestrator only; no automation product |
| F-50 | Institutional Course Marketplace | No institutional marketplace code |
| F-51 | Media Health Monitoring | No media health code |
| F-53 | Professional Social Graph & Feed | No social feed (feedback routes only) |
| F-54 | Content Publishing | No content publishing code |
| F-57 | Events & Webinars | No events or webinars code |
| F-58 | Written Recommendations | No written recommendations code |
| F-59 | Outreach Credits (TalentMail) | No outreach credits code |
| F-64 | LinkedIn Migration Engine | No LinkedIn migration code |
| F-65 | LinkedIn Decoupling & Independence | No LinkedIn decoupling code |
| F-69 | Assignments & Peer Review | No assignments code |
| F-70 | Learning Paths, Programs & Specializations | No learning paths code (career pathways are separate) |
| F-71 | Course Q&A, Discussions, Notes | No course Q&A or notes code |
| F-72 | Course Reviews & Ratings | No course reviews (instructor reviews only) |
| F-73 | Course Commerce | No course commerce code |
| F-76 | Coding Contests & Live Leaderboards | No coding contest code |
| F-78 | Practice Sets & Interview Prep | No practice sets code |
| F-79 | Articles & Newsletters | No articles code |
| F-100 | Peer Project Collaboration | No peer project collaboration code |
| F-104 | Pre-Hire Assessment Customization | No pre-hire customisation code |
| F-105 | Post-Hire Analytics & ROI Tracking | No post-hire ROI code |
| F-107 | Live Q&A with Instructors | No live instructor Q&A code |
| F-108 | Expert Network Matching | No expert matching code |
| F-109 | Salary Negotiation Guidance | No salary negotiation code |
| F-111 | Industry-Specific Learning Hubs | No learning hubs code |
| F-112 | Resume Parsing & Optimization | No resume parsing code |
| F-113 | Recruiter Outreach Analytics | No outreach analytics code |
| F-115 | Certification Exam Platform | No certification exam platform code |
| F-116 | Accessibility & Inclusive Learning | No inclusive learning features |
| F-119 | Diversity & Inclusion Analytics | No diversity analytics code |
| F-120 | API & Integration Platform | Only the billing webhook; no public API keys |
| F-124 | Project Marketplace | No project marketplace code |
| F-126 | Interview Prep Marketplace | No interview prep marketplace code |
| F-127 | Company Culture Assessment | Culture-fit score field on scorecards only |
| F-128 | Offer Comparison Tool | Memory file says verified; no code or tests found |
| F-129 | Leadership Development | No leadership development code |
| F-130 | Freelance Marketplace | Memory file says verified; only a freelance employment type exists |
| F-131 | Apprenticeship Matching | No apprenticeship code |
| F-132 | Scholarship Discovery | Memory file says verified; no code or tests found |
| F-133 | Volunteer Matching | Memory file says verified; no code or tests found |
| F-134 | Code Review Practice | No code review practice code |
| F-135 | System Design Practice | No system design practice code |
| F-136 | Micro-Learning | No micro-learning code |
| F-137 | Spaced Repetition | No spaced repetition code |
| F-138 | Study Accountability Partners | No accountability partner code |
| F-139 | Local Communities & Meetups | No meetup code |
| F-140 | Affinity Groups | No affinity group code |
| F-141 | Onboarding Preparation | No onboarding preparation code |
| F-143 | OSS Contribution Discovery | No OSS discovery code |
| F-145 | Recommendation Engine Core | Memory file says verified; no recommendation engine |
| F-154 | Interview Prediction & Benchmarking | No interview prediction code |
| F-155 | Adaptive Learning System | No adaptive learning code |
| F-156 | Professional Development Plan System | No development plan code |
| F-157 | Skills Co-Learning Path Optimizer | No co-learning optimiser code |
| F-161 | Internal Mobility & Succession Platform | No internal mobility code |
| F-163 | Credential Wallet & Portability | No credential wallet code |
| F-164 | Skills Evidence Narrative & Storytelling | No narrative code |
| F-165 | Diversity, Equity & Inclusion Data System | No DEI data system code |
| F-166 | Interview Performance Benchmarking | No interview benchmarking code |
| F-167 | Candidate Comparison & Rubric (Enhanced) | No enhanced comparison code |
| F-168 | Hiring Prediction & Success Modeling | No hiring prediction code |
| F-170 | Expert Network (Enhanced) | No enhanced expert network code |
| F-171 | Employer Brand Management System | No employer brand management code |
| F-173 | Company-to-Skills Mapping | No company-skills mapping code |

## Deprecated

| ID | Feature | Evidence |
|---|---|---|
| F-38 | Legacy Chat Service (DEPRECATED) | Deprecated in registry |
| F-39 | Unified Backend Stub (DEPRECATED) | Deprecated in registry |

## Not recommended

| ID | Feature | Evidence |
|---|---|---|
| F-62 | Sponsored Content (NOT RECOMMENDED) | Not recommended by registry |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | Not recommended by registry |

## Where the documents disagree with the code

| Document says | Code shows |
|---|---|
| BRAIN/MEMORY §5: 51 features "IMPLEMENTED & VERIFIED" | 16 are reachable in the UI and tested. Most of the other 35 are API-only (Partial). |
| BRAIN/MEMORY §5 lists F-128, F-130, F-132, F-133, F-145 as verified | No code or test exists for F-128, F-132, F-133 or F-145. F-130 has only a `freelance` employment-type value. All five are Not started. |
| BRAIN/MEMORY §6: 51 feature route modules in `apps/api` | One file, `apps/api/src/server.ts` (13,404 lines), with 240 unique `/api/v1` paths. |
| BRAIN/MEMORY §6: frontend uses TanStack Query | No `@tanstack` package in `package.json` or `apps/web/src`. README is correct: plain React state and `fetch`. |
| BRAIN/MEMORY §2: 160 e2e and 898 unit/integration tests | Current runs: 221 e2e and 1130 Vitest (unit and integration) passing. |
| BRAIN/MEMORY §2 and README: installable PWA | Manifest only. No service worker and no offline mode (`apps/web/public` has no `sw` file). |
| Registry F-29: scheduled digest | Only an `emailDigestFrequency` preference. The worker has no digest job. |

## Cross-cutting risks

- **Most backend modules are not durable.** `apps/api/src/durability.ts` lists the routes backed by Postgres. Everything else is held in process memory and returns `x-talentsphere-durability: ephemeral`. Every Partial feature with an API loses its data on restart.
- **Most Partial features have no UI.** Skills graph, career, salaries, reputation, talent pools, interviews, referrals, endorsements, warm intros, admin, moderation, certificates and learning impact are all API-only. A user cannot reach them from the web app.
- **Billing is simulated and not wired.** Checkout shows plans and does not call `/billing/subscribe`. The README already says paid plans cannot be bought.
- **No outbound email.** The worker's mail provider is for development. Verification codes reach users only through the dev outbox.

## What to add next

Ordered by value for the effort. Items 1–3 use code that already exists.

1. **Durable storage for the long-tail modules.** Move the in-memory modules behind `persist()` and add their tables (ADR-015 is the pattern). Do this before adding more features, so new data is not lost on restart.
2. **Web screens for existing APIs, highest value first:**
   - Referrals (F-142) and warm intros (F-121): the network page can host them.
   - Endorsements (F-110) and peer credibility (F-150): add endorse buttons to profile and work history.
   - Public certificate verification (F-52): add a `/verify/:hash` route, which the API already serves.
   - Admin console (F-17, F-35, F-83) and moderation queue (F-24): needed to operate the platform.
   - Saved searches and job alerts (F-32): the job page already runs searches.
   - Skills graph (F-84) and career transitions (F-85, F-95): a profile tab each.
3. **Wire billing for real.** Connect the checkout to `/billing/subscribe` in simulated mode, clearly labelled, and gate the candidate plan (F-61). This turns a static page into a working flow.
4. **Digest job (F-29).** Add a worker job that sends the digest once an email provider exists. The preference is already stored.
5. **Quiz and course reviews (F-68, F-72).** `LessonContentType` already includes `quiz`, and the instructor review pattern can be reused for course ratings.
6. **Service worker (PWA claim).** Add offline caching for the app shell, or stop describing the app as offline-capable.
7. **Interview room UI (F-33, F-88).** The join, consent and scorecard APIs exist, so a candidate and interviewer screen is mostly UI work.
8. **New features not in the registry yet:** a member directory so Network search finds people without typing a name, and an email-verified outreach flow for recruiters. Both reuse existing APIs.

## Method limits

- The status is based on static checks: route and file search, test-title F-IDs, and the web app's API calls. I did not drive every feature in a browser. Items marked "API only" were not exercised through the UI.
- "Not started" means no matching code was found. A feature with a different name could still exist, so treat those 75 as a checklist to confirm with the owner.

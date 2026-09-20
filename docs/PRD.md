# Product Requirements Document (PRD) — TalentSphere

## 1. Product Overview
**TalentSphere** is the Unified Talent Operating System that closes the structural loop between **learning**, **skills verification**, and **employment**. By uniting a consumer talent marketplace with an algorithmic Code Arena, a rich Learning Management System (LMS), and an institutional B2B licensing engine, TalentSphere eliminates resume fraud, reduces employer interview overhead, and creates a continuous talent pipeline.

---

## 2. Problem Statement
The current employment and educational ecosystem is severely fragmented:
- **Candidates** struggle with unverifiable self-reported claims, redundant job applications, and disconnected credentialing silos.
- **Employers & Recruiters** suffer from overwhelming applicant noise, high interview-to-offer ratios, and lack of pre-verified coding and domain competence.
- **Educational Institutions & Bootcamps** lack direct, transparent visibility into student skill outcomes, employer hiring demand, and placement outcomes.

TalentSphere unifies this lifecycle into a single verifiable platform.

---

## 3. The Core Product Flywheel: B2B2C Talent Pipeline

```
  ┌────────────────────────────────────────────────────────────────┐
  │                   1. INSTITUTIONAL ONBOARDING                  │
  │     Colleges / Bootcamps purchase seat pools & assign batches  │
  └───────────────────────────────┬────────────────────────────────┘
                                  ▼
  ┌────────────────────────────────────────────────────────────────┐
  │                    2. MANAGED LEARNING & LMS                   │
  │   Students master courses & complete assessed coding problems   │
  └───────────────────────────────┬────────────────────────────────┘
                                  ▼
  ┌────────────────────────────────────────────────────────────────┐
  │                    3. VERIFIED SIGNAL ENGINE                   │
  │    XP ledger, skill levels, badges & challenge certificates    │
  └───────────────────────────────┬────────────────────────────────┘
                                  ▼
  ┌────────────────────────────────────────────────────────────────┐
  │               4. B2B2C GRADUATION TRANSITION (J-12)            │
  │ Institutional PII severed; verified skills & credentials stay   │
  └───────────────────────────────┬────────────────────────────────┘
                                  ▼
  ┌────────────────────────────────────────────────────────────────┐
  │                    5. ACTIVE TALENT MARKETPLACE                │
  │  Pre-vetted candidates discover jobs; recruiters hire faster   │
  └────────────────────────────────────────────────────────────────┘
```

---

## 4. Target User Personas & Roles

TalentSphere natively supports 8 distinct personas across 10 system roles:

| Persona | System Role | Primary Goals & Capabilities |
|---|---|---|
| **Candidate** | `USER` / `INDEPENDENT` | Build career profile, upload resume, showcase portfolio, solve coding challenges, enroll in courses, earn XP, apply for jobs, track applications. |
| **Managed Learner** | `USER` / `MANAGED` | Complete assigned institutional batches, access licensed courses, take proctored assessments, transition to independent profile upon graduation. |
| **Recruiter** | `RECRUITER` | Post requisitions, manage applicant streams, advance candidates through a 7-stage Kanban board, submit interview scorecards, message talent. |
| **Organization Admin** | `ORG_ADMIN` | Manage company profile, invite hiring team members, assign recruiter seats, manage job post billing and subscription tiers. |
| **Course Instructor** | `INSTRUCTOR` | Author modular curricula, embed multi-source video lessons, create quizzes, track learner drop-off, issue certificates. |
| **Institution Admin** | `INSTITUTION_ADMIN` | Procure course seat pools, create departments, monitor license utilization, manage bulk student imports, view cohort analytics. |
| **Department Admin / Faculty** | `FACULTY` | Oversee assigned student cohorts, monitor at-risk learners, grade assignments, verify assessment submissions. |
| **Platform Administrator** | `PLATFORM_ADMIN` | Platform governance, feature flag controls, tenant oversight, abuse moderation, telemetry heatmaps, system audit logs. |

---

## 5. Scope & Functional Domains (23 Functional Modules)

TalentSphere encompasses 23 core functional domain modules and 52 registered features (`F-01..F-52`):

### Domain Cluster A: Identity & Organization
1. **Module 1: Identity & Authentication (`AUTH`)** — Supabase Auth, email/password, session cookies, Next.js proxy token verification, role normalization, OAuth (Google/GitHub), password reset.
2. **Module 2: Candidate Profile & Portfolio (`PROFILE`, `RESUME`, `PORTFOLIO`)** — Profile bio/headline, avatars storage, normalized sub-entities (`experience`, `education`, `certifications`, `candidate_skills`), multi-version resumes, interactive project portfolio.
3. **Module 3: Organizations & Teams (`ORG`, `RECRUIT`)** — Employer branding, multi-user accounts, team RBAC, domain verification, hiring team collaboration.

### Domain Cluster B: Talent Marketplace & ATS Pipeline
4. **Module 4: Requisitions, Jobs & Marketplace (`JOB`)** — Public/authenticated job board, sticky multi-facet filtering, detailed requisition view, recruiter job posting studio, job bookmarks, salary transparency chips.
5. **Module 5: Applications & Review Pipeline (`APPL`)** — Candidate application submission, status tracker, 7-stage Recruiter Kanban pipeline board, multi-dimensional interview scorecard rubrics (1-10), activity audit logging.

### Domain Cluster C: Learning, Challenges & Skills Verification
6. **Module 6: Learning Management System (`COURSE`, `LMS`)** — Modular course catalog, syllabus outline, lesson player with curriculum drawer, lesson completion tracking, XP rewards, certificates.
7. **Module 7: Challenges & Code Arena (`CHALL`)** — Algorithmic challenge catalog, Monaco editor IDE, test case runner, automated submission verification, XP awards.
8. **Module 10: Gamification & XP Ledger (`GAMI`, `GAM`)** — Dynamic level progression curve, append-only `xp_ledger`, global and periodic leaderboards, rank tier badges.
9. **Module 23: Provider-Agnostic Media Engine (`MEDIA`)** — Multi-provider media abstraction (`MediaSource`, `ProviderAdapter`), supporting platform uploads, YouTube, Vimeo, and enterprise video players with resume playback.

### Domain Cluster D: Communication, Search & Engagement
10. **Module 8: Networking & Social (`NET`)** — Professional connections, mutual contacts, activity feed.
11. **Module 9: Direct Messaging (`MSG`)** — Real-time direct messaging between recruiters and candidates, conversation threads, unread counters.
12. **Module 11: Search & Discovery (`SEARCH`, `SRCH`)** — Global header search, faceted search, command palette (⌘K), full-text PostgreSQL indexing.
13. **Module 12: Notifications & Preferences (`NOTIF`, `NTF`)** — In-app notification center, unread badge counter, email preferences, digest delivery.

### Domain Cluster E: Institutional B2B & Monetization
14. **Module 13: Billing, Subscriptions & Licensing (`BILL`, `LIC`)** — Stripe subscription tiers (Free, Pro, Enterprise), job post credits, seat-based institutional license pools.
15. **Module 22: Institutional Managed Learning (`INST`)** — Multi-tenant hierarchy (`Organization` → `Department` → `Batch` → `Student`), bulk CSV import, faculty dashboards, institutional certificate verification.

### Domain Cluster F: Governance, Analytics & Infrastructure
16. **Module 14: Trust, Safety & Content Moderation (`TRUST`, `TRU`)** — Content flag queue, automated profanity filters, suspension workflow, DMCA takedowns.
17. **Module 15: Platform Administration (`ADMIN`, `ADM`)** — System metrics, feature flag toggles, global audit logs, tenant inspection.
18. **Module 16: Product Analytics & Telemetry (`ANALYTICS`, `ANA`)** — Event dictionary (`EVT-001..048`), funnel conversion tracking, cohort retention.
19. **Module 17: Chrome Extension Companion (`EXT`)** — Manifest V3 browser extension for external job saving and resume autofill.
20. **Module 18: Core Platform Shell (`CORE`)** — Aether Slate / Orchid dark theme, tactile UI component suite, error boundaries, canonical route aliases.
21. **Module 19: Reporting & Dashboards (`DASH`)** — Role-adaptive dashboards for Candidates, Recruiters, Instructors, Admins, and Institutions.
22. **Module 20: Integrations & API Ecosystem (`INT`, `API`)** — Supabase, Stripe, Sentry, PostHog, Vercel, Resend, Gemini AI router.
23. **Module 21: Localization & Internationalization (`L10N`)** — Multi-currency formatting (INR, USD, GBP, EUR), message catalogs, RTL layout readiness.

---

## 6. Phased Implementation Roadmap

| Phase | Milestone Name | Scope & Key Deliverables | Status |
|---|---|---|---|
| **Phase 1** | **MVP Foundation Core** | Auth, Candidate Profiles & Sub-Entities, Job Marketplace, Applications & Recruiter Kanban, Scorecards Rubric, Course Player, Code Arena, Gamification XP, Platform Shell, CI/CD | ✅ **COMPLETE** (101 items verified) |
| **Phase 2** | **Engagement & Monetization** | Realtime Messaging, Provider-Agnostic Media Adapters (YouTube/Vimeo), Stripe Checkout, Multi-version Resumes, Saved Search Alerts, Social Connections | 🟡 **IN PROGRESS** (Active focus) |
| **Phase 3** | **Institutional B2B & Advanced LMS** | Multi-tenant Institutional Hierarchy, Seat Licensing Pools, Bulk CSV Import, Faculty Dashboard, Interview Scheduling | 📋 **PLANNED** |
| **Phase 4** | **AI Router & Execution Sandbox** | In-app Gemini/Claude AI Career Assistant, Sandboxed Code Execution Container, Anti-plagiarism scanner | 📋 **PLANNED** |
| **Phase 5** | **Edge & Extension Ecosystem** | Chrome Extension Companion (Manifest V3), External ATS Exporters, Mobile Web Optimization | 📋 **PLANNED** |
| **Phase 6** | **Global & Enterprise Scale** | Institutional SSO (SAML 2.0 / OIDC), Multi-lingual i18n Message Catalogs, RTL Support, HRIS Integrations | 📋 **FUTURE** |

---

## 7. Non-Functional Requirements & Performance Targets
- **Performance**: Largest Contentful Paint (LCP) < 2.5s; API p95 latency < 200ms; Next.js Turbopack production builds with 0 errors.
- **Accessibility**: Strict compliance with **WCAG 2.2 AA** (visible focus rings, aria-labels, semantic headings, minimum 44×44px touch targets).
- **Security**: 100% of PostgreSQL tables protected by Row-Level Security (RLS); dual-layer proxy authentication; strict Content Security Policy headers; zero secrets in client bundles.
- **Availability & Resilience**: 99.9% uptime target; optimistic UI updates; graceful error boundaries on all routes.

---

*Authoritative PRD v2.0.0 — Reconciled with Master Specification and Codebase.*

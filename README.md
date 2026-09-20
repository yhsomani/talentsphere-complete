# TalentSphere — Final Master Project & Product Specification

**Document Type:** Single Source of Truth (SSOT) — Implementation-Ready Specification
**Version Status:** Final Consolidated Edition
**Reality Baseline:** Target-state specification. Nothing described herein is implemented or verified. All status markers denote documented intent.

**Status Label Legend**

| Label | Meaning |
|---|---|
| CONFIRMED | Explicitly established and locked in prior specification |
| UPDATED | Changed or refined during consolidation; latest version governs |
| RECOMMENDED ADDITION | Newly identified as necessary/beneficial; not previously explicit |
| ASSUMPTION | Inferred to complete the specification; requires validation |
| TBD / REQUIRES DECISION | Cannot be determined; needs owner sign-off |

---

## Table of Contents

1. Executive Summary
2. Product Overview & Vision
3. Problem Statement & Market Gap
4. Goals, Objectives & Success Metrics
5. Target Users, Roles & Personas
6. User Needs & Use Cases
7. Scope
8. Out of Scope
9. Features & Capabilities Register
10. User Roles & Permissions
11. Functional Requirements (Domain Modules)
12. Business Rules Register
13. State Machines & Lifecycles
14. User Journeys & Workflows
15. Cross-Module Workflows & The B2B2C Flywheel
16. System & Technical Architecture
17. Components, Modules & Operating Layer
18. Data Model & Data Requirements
19. APIs & Integrations
20. UI/UX Requirements & Design System
21. Screens, Pages & Navigation
22. Authentication & Authorization
23. Security Requirements
24. Privacy & Data Protection
25. Notifications & Communication
26. Search, Filtering, Sorting & Reporting
27. Admin & Management Features
28. Error Handling & Edge Cases
29. Non-Functional Requirements
30. Performance Requirements
31. Scalability & Reliability
32. Logging, Monitoring & Auditing
33. Backup & Recovery
34. Deployment Requirements & Environment Configuration
35. Testing & Quality Assurance
36. Acceptance Criteria
37. Accessibility Requirements
38. SEO Requirements
39. Analytics & Tracking
40. Maintenance & Support
41. Risks & Mitigation Strategies
42. Dependencies, Assumptions & Constraints
43. Future Enhancements & Roadmap
44. Implementation Phases & Priorities
45. Deliverables & Definition of Done
46. Open Decisions Register

---

## 1. Executive Summary

TalentSphere is a unified **Career Acceleration and Talent Operating System** delivered as browser-based SaaS. It closes the structural gap between learning, verifiable skill evaluation, professional networking, and high-velocity talent recruitment by integrating them into one continuous, self-reinforcing ecosystem.

The platform operates a **multi-sided, B2B2C ecosystem**:

- **B2C side:** Candidates learn (LMS), prove skills (Code Arena, assessments), build verifiable portfolios, network, and apply to jobs with transparent tracking.
- **B2B Employer side:** Employers post requisitions, run structured ATS pipelines with scorecards, and hire using verified signals.
- **B2B Institutional side** *(UPDATED — expanded in this edition)*: Schools, colleges, universities, coaching institutes, corporate L&D, and government education bodies purchase course seats in bulk, provision managed learners, assign courses by batch, track cohort outcomes, and issue branded certificates.
- **The B2B2C Graduation Flywheel** *(UPDATED)*: When institutional learners graduate or their licenses expire, they transition into independent candidate profiles, retaining platform-verified signals while institutional PII is severed — continuously supplying the talent marketplace with pre-verified candidates.

**Architecture position:** TalentSphere is a **modular monolith** (Next.js App Router + Supabase/PostgreSQL + Vercel) with Row-Level Security as the final authorization boundary, a centralized multi-model AI service with mandatory human-in-the-loop review, and a shared "Talent Operating System" layer (workspace shell, universal object model, knowledge graph, domain event backbone, automation engine, governed AI agents).

**Critical scope clarification:** The "Web OS / Talent OS" concept is an **application-architecture pattern and product metaphor**, not a literal operating system. It is not a kernel, bootloader, hypervisor, device driver host, or general-purpose OS, and manages no hardware or native processes. Every "OS" capability is a web-app feature. Any requirement implying a real OS is out of scope.

**Reality baseline:** This document is complete as an architectural specification. 0% of runtime application code, automated tests, migrations, or integrations exist or are verified. All historical claims of implementation are treated as unverified documented intent.

### Key Consolidation Changes in This Edition

| Change | Type | Summary |
|---|---|---|
| Institutional Course Licensing module | UPDATED + EXPANDED | Full B2B managed-learning capability integrated as a first-class module |
| Institutional roles & hierarchy | RECOMMENDED ADDITION | Department Admin, Faculty/Proctor, Managed Learner, Billing/Procurement Manager roles |
| Seat/License Management | RECOMMENDED ADDITION | Reusable seat pool with assign/revoke/reassign/extend lifecycle |
| Bulk Student Enrollment | RECOMMENDED ADDITION | CSV/Excel import with validation, dedupe, dry-run preview |
| Batch-Based Enrollment | RECOMMENDED ADDITION | Cohort/division grouping for scale assignment |
| Institutional Analytics | RECOMMENDED ADDITION | Multi-level drill-down reporting |
| Institutional Certificates | RECOMMENDED ADDITION | Branded certificates with QR + verification URL |
| Purchase Approval Workflow | RECOMMENDED ADDITION | Faculty → Dept Admin → Org Admin → Purchase chain |
| Provider-Agnostic Media System | UPDATED + EXPANDED | Replaces single-source video with multi-provider media engine |
| Media provider adapters | RECOMMENDED ADDITION | YouTube, Vimeo, Wistia, Loom, Mux, Cloudflare Stream, Brightcove, uploads |
| Playlist sync modes | RECOMMENDED ADDITION | Dynamic vs. snapshot import |
| Media health monitoring | RECOMMENDED ADDITION | External video availability validation + alerting |
| Media version history | RECOMMENDED ADDITION | Source replacement without data loss |
| B2B2C Graduation Flywheel | UPDATED | Formal lifecycle linking institutional to consumer side |
| Unified Content Model | UPDATED | Courses built from polymorphic content items, not video-only |

---

## 2. Product Overview & Vision

**Vision Statement:** TalentSphere exists to make career growth transparent, verifiable, and accessible — replacing the fragmented, trust-deficient talent marketplace with a unified ecosystem where learning, proof, opportunity, and advancement form a continuous, self-reinforcing loop.

### The TalentSphere Value Flywheel

| Loop | Candidate Action | Platform Signal | Employer/Institution Value |
|---|---|---|---|
| Learn → Prove | Completes course module | XP + verified skill tag | Trusts skill claim |
| Prove → Match | Passes challenge | Score + badge on profile | Surfaces in ranked search |
| Match → Apply | Applies to job | Application + portfolio link | Reviews with verified context |
| Apply → Hire | Interview + scorecard | Hiring decision recorded | Candidate placed |
| Hire → Grow | On-the-job learning | Continuous skill update | Retention signal |
| Grow → Learn | Skill gap identified | Personalized recommendation | Upskilling path triggered |
| **Institution → Graduate** *(UPDATED)* | Learner completes institutional program | Verified signals + certificate | Placement + marketplace supply |

### Core Ecosystem Pillars

1. **Verified Skill Signals** — Candidates earn verifiable XP, certificates, and challenge badges feeding profiles and recruiter search ranking.
2. **Transparent Candidate Experience** — Real-time application tracking, stage notifications, explainable match feedback, draft autosave recovery.
3. **High-Velocity Recruiter Workspace** — Multi-stage ATS pipeline, structured scorecards, private collaboration notes, integrated messaging.
4. **Responsible AI Copilot** — Server-side AI providing reviewable draft suggestions with human-in-the-loop sign-off, zero autonomous hiring, full PII redaction.
5. **Institutional Learning Platform** *(UPDATED)* — Bulk seat licensing, batch assignment, cohort analytics, branded certificates for education and corporate training organizations.
6. **Provider-Agnostic Media Engine** *(UPDATED)* — Courses built from mixed media sources (uploads, YouTube, Vimeo, and other providers) with a unified learner experience.
7. **Modern Maintainable Architecture** — Next.js modular monolith, Supabase PostgreSQL, RLS isolation, Aura design tokens, Vercel edge deployment.
8. **Talent Operating System Layer** — Shared runtime unifying modules into an OS-like experience: workspace shell, universal object model, knowledge graph, event backbone, automation, governed agents.
9. **Self-Operating & Self-Auditing Platform** — Journey Healing Engine, Marketplace Liquidity Engine, Data Quality Engine, Self-Healing Operations, Continuous Audit Agent.

---

## 3. Problem Statement & Market Gap

### The Five Structural Failures

| # | Failure | Candidate Impact | Employer Impact | TalentSphere Resolution |
|---|---|---|---|---|
| 1 | Unverified credentials | Honest candidates lose to resume padding | Costly bad hires | Verifiable XP, challenge scores, completions as tamper-proof records |
| 2 | Opaque application black hole | 60% of applicants get no response | Employer brand damage | Real-time tracking, stage notifications, timeline |
| 3 | Disconnected learning → hiring | Completions don't create opportunities | Can't assess practical skill | Unified platform; every signal recruiter-searchable |
| 4 | Fragmented tooling | Candidates juggle 5+ platforms | Recruiters juggle ATS, CRM, assessments, scheduling | Single ecosystem end-to-end |
| 5 | Poor candidate experience | Form re-entry, lost drafts | High drop-off, manual data entry | Autosave drafts, one-click apply, structured scorecards, messaging |

### Additional Market Gaps

| # | Gap | Opportunity |
|---|---|---|
| 6 | No career path visibility | Visual roadmaps: required skills, gaps, recommended paths |
| 7 | No skill verification standard | Platform-wide portable XP/badge system |
| 8 | No structured mentorship at scale | Mentor matching, scheduling, progress tracking |
| 9 | No employer brand transparency | Verified culture signals, response rates, hiring velocity |
| 10 | No continuous post-hire relationship | Alumni networks, upskilling, referrals |

### Institutional & Media Gaps *(RECOMMENDED ADDITION)*

| # | Gap | Opportunity |
|---|---|---|
| 11 | Institutions cannot measure learning outcomes | Cohort analytics, placement tracking, completion reporting |
| 12 | No bulk learner provisioning | CSV/Excel import, batch assignment, seat management |
| 13 | Course content locked to one video host | Provider-agnostic media: uploads, YouTube, Vimeo, and more |
| 14 | No institutional certificate branding | Branded certificates with QR + public verification |
| 15 | Institutions lack purchase governance | Approval workflows, PO/Net-terms invoicing, GSTIN support |
| 16 | No learner-to-candidate transition | Graduation flywheel feeds marketplace with verified talent |

---

## 4. Goals, Objectives & Success Metrics

**North-Star Metric:** "Verified Hires per Month" — candidates placed into roles where the hiring decision was substantively informed by TalentSphere-verified skill signals.

### Metric Framework

| Category | Metric | MVP Target | 12-Month | 24-Month |
|---|---|---|---|---|
| Growth | Registered candidates | 1,000 | 25,000 | 150,000 |
| Growth | Active employers | 10 | 100 | 500 |
| Growth | Active institutions *(UPDATED)* | 0 | 5 | 25 |
| Engagement | Weekly active candidates | 30% | 40% | 50% |
| Engagement | Course completion rate | 25% | 35% | 45% |
| Engagement | Challenge participation | 15% | 25% | 35% |
| Verification | Profiles with ≥1 verified signal | 50% | 70% | 85% |
| Matching | Application-to-interview rate | 10% | 18% | 25% |
| Hiring | Time-to-fill (days) | 45 | 30 | 21 |
| Hiring | Verified hires per month | 5 | 50 | 300 |
| Retention | Candidate 90-day retention | 40% | 55% | 65% |
| Retention | Employer 12-month retention | 60% | 75% | 85% |
| Retention | Institutional renewal rate *(UPDATED)* | — | 70% | 85% |
| Revenue | MRR | $500 | $8,000 | $50,000 |
| NPS | Candidate NPS | 30 | 45 | 60 |
| NPS | Employer NPS | 35 | 50 | 65 |
| AI | AI suggestion acceptance rate | 40% | 60% | 75% |
| Quality | Platform uptime | 99.5% | 99.9% | 99.95% |
| Institutional *(UPDATED)* | Managed learner seats provisioned | 0 | 2,500 | 25,000 |
| Institutional *(UPDATED)* | Seat utilization rate | — | 70% | 80% |
| Institutional *(UPDATED)* | B2B2C graduation conversion | — | 40% | 60% |

### Leading Health Indicators

| Indicator | Warning Threshold | Action |
|---|---|---|
| Candidate-to-employer ratio | < 20:1 | Increase candidate acquisition |
| Job view-to-apply ratio | < 3% | Review job post quality, simplify apply flow |
| Application-to-interview ratio | < 5% | Review matching, employer response time |
| Course drop-off rate | > 70% at module 3 | Review content quality, add engagement hooks |
| AI suggestion rejection rate | > 60% | Review prompt quality, adjust confidence threshold |
| Support ticket volume | > 5% of WAU | Investigate UX friction, expand help content |
| Institutional seat utilization *(UPDATED)* | < 50% after 60 days | Adoption outreach; renewal risk flag |
| External media health *(UPDATED)* | > 2% broken embeds | Notify course owners; admin alert |

---

## 5. Target Users, Roles & Personas

### Two-Tier Authorization Model

**Tier 1 — System RBAC (JWT Claims):** `ROLE_USER`, `ROLE_RECRUITER`, `ROLE_ADMIN` enforced at Supabase Auth JWT boundary.

**Tier 2 — Contextual Capability Roles (Workspace-Scoped):** Resolved via membership tables and enforced at RLS + middleware.

| Role | Status | Scope |
|---|---|---|
| Candidate | CONFIRMED | Own profile, applications, learning |
| Recruiter | CONFIRMED | Org jobs, pipeline, candidates |
| Hiring Manager | CONFIRMED | Shortlisted candidates, offers |
| Interviewer | CONFIRMED | Assigned candidates, scorecards |
| Organization Admin | CONFIRMED | All org records, team, billing |
| Agency Recruiter | CONFIRMED | Client-org scoped records |
| Finance Admin | CONFIRMED | Org billing only |
| Support Agent | CONFIRMED | Ticket scope, consented access |
| Moderator | CONFIRMED | Content, violations |
| Platform Admin | CONFIRMED | All platform data (audited) |
| Service Account | CONFIRMED | Scoped API grants |
| Instructor | CONFIRMED | Owned cohorts/enrollments |
| Mentor | CONFIRMED | Mentorship scope |
| Course Author | CONFIRMED | Owned course content/analytics |
| Institution Admin | CONFIRMED | Institution-scoped records, cohorts |
| **Department Admin** *(UPDATED)* | RECOMMENDED ADDITION | Department-scoped batches, faculty assignment |
| **Faculty / Proctor** *(UPDATED)* | RECOMMENDED ADDITION | Assigned batches only; grading, at-risk monitoring |
| **Managed Learner** *(UPDATED)* | RECOMMENDED ADDITION | License-bounded learning; transitions to Candidate |
| **Billing/Procurement Manager** *(UPDATED)* | RECOMMENDED ADDITION | Institutional purchasing, invoices, POs |

**Authorization resolution order (highest wins):** `ROLE_ADMIN` platform override (audit-logged) → workspace contextual grants → `ROLE_RECRUITER` (requires valid org membership) → `ROLE_USER` base.

### Persona Register

| ID | Name & Role | Demographics | Goals | Pain Points | Primary Journeys |
|---|---|---|---|---|---|
| P-A | Aisha — Early-Career Candidate | 22, Mumbai; CS grad | First job, skill proof | No network, unclear skill demand | J-1, J-2 |
| P-B | Rohan — Mid-Career Professional | 31, Bengaluru; 8 yrs backend | AI/ML transition | Dated assessments, rigid filters | J-1, J-6 |
| P-C | Priya — Recruiter at Startup | 29, remote; 2-person TA | Source fast, manage pipeline | Unqualified candidates, no signals | J-3 |
| P-D | Dev — Platform Administrator | 34, remote; platform ops | Platform health, abuse response | Manual moderation, silent failures | WF-08 |
| P-E | Elena — Hiring Manager | 38, product director | Right-fit hires | Scorecard noise, slow feedback | J-3 |
| P-F | Farid — Agency Recruiter | 40, agency lead | Multi-client placements | Multi-org confusion, reporting | J-10 |
| P-G | Grace — Course Creator | 35, ex-ML engineer | Publish/monetize course | No marketplace reach, no analytics | J-7 |
| P-H | Hugo — Mentor | 45, principal engineer | Grow mentees | Hard to find mentees, no structure | J-8 |
| P-I | Ivy — Institutional Partner | 33, career counsellor | Place graduating class | No alumni outcome data | J-9 |
| **P-J** *(UPDATED)* | Dr. Rao — Department Head | 52, faculty admin | Approve curriculum, monitor cohorts | No visibility, manual spreadsheets | J-9, J-14 |
| **P-K** *(UPDATED)* | Meera — Faculty/Proctor | 34, assistant professor | Teach, grade, spot at-risk students | No centralized dashboard | J-9, J-15 |
| **P-L** *(UPDATED)* | Tomas — Corporate L&D Manager | 41, enterprise training | Compliance training, skill mapping | Scattered tools, no HRIS sync | J-16 |

---

## 6. User Needs & Use Cases

*(CONFIRMED — baseline needs retained; institutional/media needs added below)*

### Candidate Needs
Know which skills matter · Prove skills credibly · Build a portfolio · Find relevant jobs · Apply without re-entering data · Never lose progress · Know application status · Understand match reasoning · Get career guidance · Grow a network · Get mentorship · Continue learning post-hire.

### Recruiter/Employer Needs
Post jobs quickly · Find qualified candidates · Manage a pipeline · Evaluate consistently · Collaborate internally · Schedule interviews · Extend/track offers · Prove hiring ROI · Build employer brand.

### Institutional Needs *(UPDATED)*

| Need | Use Case | Fulfilling Capability |
|---|---|---|
| Buy courses in bulk | 500 seats for Java + Python, 12-month validity | License pool management, procurement |
| Onboard hundreds of students | Bulk import with validation | CSV/Excel import engine with dry-run |
| Organize learners | Departments → batches → students | Hierarchy + batch management |
| Assign at scale | Assign course to entire batch | Batch-based enrollment |
| Track progress | Drill-down to lesson/assessment level | Institutional analytics |
| Monitor faculty | Faculty see only assigned classes | Faculty dashboard with RBAC |
| Conduct exams | Quizzes, assignments, coding, finals | Assessment engine + completion rules |
| Issue certificates | Branded, verifiable credentials | Institutional certificates with QR |
| Reassign unused seats | Student leaves → seat returns to pool | Seat lifecycle management |
| Renew without disruption | Expiry warnings, grace period | Renewal system |
| Control content sources | Restrict media providers | Org-level provider allowlisting |
| Pay via procurement | PO, Net-terms, GSTIN | Institutional invoicing |
| Report outcomes | Student/batch/institution reports | Reporting + export (CSV/Excel/PDF) |
| Integrate existing systems | ERP, LMS, SIS, HRIS | API + webhooks (future) |
| Protect student privacy | FERPA/GDPR consent | Privacy controls, tenant isolation |

### Course Author Media Needs *(UPDATED)*

| Need | Use Case | Fulfilling Capability |
|---|---|---|
| Mix media sources | Uploads + YouTube + Vimeo in one course | Provider-agnostic media engine |
| Reuse existing content | Import YouTube playlist as lessons | Playlist import (snapshot mode) |
| Keep content current | Replace video without losing data | Media source replacement + versioning |
| Structure flexibly | Drag-drop reorder, bulk operations | Course builder |
| Set completion rules | Video ≥90% AND quiz ≥60% | Configurable completion rules |
| Understand performance | Views, completion, drop-off | Tutor media analytics |

---

## 7. Scope

### In-Scope

**Candidate-facing:** Authentication, unified profile, resume builder, portfolio, course catalog/enrollment/completion, coding challenges, XP/levels/badges, job search/saved searches/alerts, application with draft autosave, application tracking, direct messaging, notifications, AI career assistant, networking, endorsements, referrals, mentorship.

**Employer-facing:** Organization creation/verification, team management, job requisition authoring, publishing with moderation gate, ATS pipeline, scorecards, private notes, interview coordination, offer management, employer brand profile, hiring analytics.

**Institutional-facing** *(UPDATED):* Institutional tenancy and hierarchy, institutional marketplace with configurable pricing, seat/license management, bulk student import, student provisioning (invite/match/SSO), batch-based enrollment, faculty dashboard, institutional analytics, assessments/exams, institutional certificates, completion rules, course customization, purchase approval workflows, procurement invoicing, renewal system, license utilization dashboard, institutional reporting, course catalog visibility controls.

**Media & Content** *(UPDATED):* Provider-agnostic media engine supporting uploads, YouTube videos/playlists, Vimeo, and pluggable adapters for Wistia/Loom/Mux/Cloudflare Stream/Brightcove; unified content model; playlist sync modes; drag-drop ordering; media versioning; playback tracking; captions/transcripts; media health monitoring.

**Platform:** Admin console, audit log viewer, feature flags, moderation queue/appeals, product analytics, universal search, error boundaries, billing, Chrome extension, localization.

**Operating Layer (Web OS):** Workspace shell, universal object model, talent intelligence graph, domain event backbone, automation engine, journey healing, marketplace liquidity, data quality engine, AI agent OS, zero-trust runtime.

---

## 8. Out of Scope

### Scope Guardrails (Binding)

| ID | Guardrail | Rationale |
|---|---|---|
| SCOPE-001 | Not a real operating system. No kernel, bootloader, scheduler, driver model, hypervisor, hardware management. | "OS" is a UX/architecture metaphor |
| SCOPE-002 | Browser-delivered only. No native desktop/mobile runtime required; PWA is convenience. | Locked web stack |
| SCOPE-003 | Niche-bound. Tier-3 plugins must stay within talent/career lifecycle. | Product focus & trust |
| SCOPE-004 | No device/hardware integration beyond standard browser APIs. | Out of niche |
| SCOPE-005 | No general-purpose filesystem. Storage scoped to talent artifacts. | Compliance surface |
| SCOPE-006 | No arbitrary user code execution beyond isolated, quota'd challenge sandbox. | Abuse prevention |
| SCOPE-007 | No open app marketplace beyond governed, reviewed plugins. | Moderation control |
| SCOPE-008 | Niche-creep guard. New verticals require explicit governance change + founder sign-off. | Roadmap honesty |

### Deferred (Valid but Scheduled Later)

| Item | Timing | Interim Behavior |
|---|---|---|
| LLM AI features beyond heuristic | Phase 4 | Heuristic baseline serves deterministic capabilities |
| Multi-org agency workflow | Phase 6 | Single-org ATS; agency in demo mode |
| Video interviews | Post-MVP | Manual scheduling with external links |
| Native mobile app | Post-MVP | PWA with offline caching |
| SSO/SAML, public API, webhooks | Phase 6 | Internal APIs only |
| Additional locales beyond English | Phase 6 | English default; Hindi + Spanish first |
| Course authoring marketplace | Phase 6 | Demo-mode billing stub |
| Mentorship program | Phase 4+ | Not available at MVP |
| Badges, streaks, leaderboards | Post-MVP | Linear XP + levels only at MVP |
| White-label institutional portals | Future (Enterprise) | Standard TalentSphere branding |
| AI proctoring / lockdown browser | Phase 6 | Standard timed assessments |
| LMS/SIS integrations (Moodle, Canvas, Blackboard) | Future | API/webhooks approach, no tight coupling |
| Provider marketplace/plugin system for media | Phase 3+ | Built-in adapters only |

---

## 9. Features & Capabilities Register

*(CONFIRMED baseline F-01..F-39 retained; new features F-40..F-52 added for institutional and media capabilities)*

| Feature ID | Feature Name | Domain | Build Phase | Status |
|---|---|---|---|---|
| F-01 | Authentication & Session Management | IAM | Phase 1 (MVP) | CONFIRMED |
| F-02 | Public Landing Page | Shell | Phase 1 | CONFIRMED |
| F-03 | Role-Adaptive Dashboard | Shell | Phase 1 | CONFIRMED |
| F-04 | Job Marketplace | Marketplace | Phase 1 | CONFIRMED |
| F-05 | Post Job Studio | ATS | Phase 1 | CONFIRMED |
| F-06 | Candidate Review Pipeline | ATS | Phase 1 | CONFIRMED |
| F-07 | Learning Management System | LMS | Phase 1 | CONFIRMED |
| F-08 | Challenges Arena | Assessment | Phase 1 | CONFIRMED |
| F-09 | Professional Networking | Social | Phase 2 | CONFIRMED |
| F-10 | Direct Messaging | Communication | Phase 1 | CONFIRMED |
| F-11 | AI Career Assistant | AI | Phase 1 (heuristic) / Phase 4 (LLM) | CONFIRMED |
| F-12 | Profile Management | Identity | Phase 1 | CONFIRMED |
| F-13 | Resume Builder | Identity | Phase 1 | CONFIRMED |
| F-14 | Notification Center | Communication | Phase 1 | CONFIRMED |
| F-15 | Settings | Shell | Phase 1 | CONFIRMED |
| F-16 | Billing & Subscriptions | Monetization | Phase 2 | CONFIRMED |
| F-17 | Admin Console | Governance | Phase 1 | CONFIRMED |
| F-18 | Chrome Extension Companion | Edge | Phase 2 | CONFIRMED |
| F-19 | Product Analytics | Telemetry | Phase 2 | CONFIRMED |
| F-20 | Command Search | OS Shell | Phase 2 | CONFIRMED |
| F-21 | Error Recovery & Resilience | Shell | Phase 1 | CONFIRMED |
| F-22 | Gamification & XP Ledger | Engagement | Phase 1 | CONFIRMED |
| F-23 | Leaderboard & Badges | Engagement | Phase 2 | CONFIRMED |
| F-24 | Trust, Safety & Moderation | Governance | Phase 2 | CONFIRMED |
| F-25 | Job Detail View | Marketplace | Phase 1 | CONFIRMED |
| F-26 | Portfolio Showcase | Identity | Phase 1 | CONFIRMED |
| F-27 | Local Resume Match Preview | Edge | Phase 2 | CONFIRMED |
| F-28 | External Job Page Scanner | Edge | Phase 2 | CONFIRMED |
| F-29 | Scheduled Notification Digest | Communication | Phase 2 | CONFIRMED |
| F-30 | Networking Stale-Request Nudges | Communication | Phase 2 | CONFIRMED |
| F-31 | KPI Aggregation & Rollups | Telemetry | Phase 2 | CONFIRMED |
| F-32 | Saved Searches & Job Alerts | Marketplace | Phase 2 | CONFIRMED |
| F-33 | Video Interview Rooms | Communication | Phase 3 | CONFIRMED |
| F-34 | Multi-Entity Backend Search | Search | Phase 3 | CONFIRMED |
| F-35 | Feature Flag Console | Governance | Phase 2 | CONFIRMED |
| F-36 | Application Draft Autosave | ATS | Phase 1 | CONFIRMED |
| F-37 | Job Templates | ATS | Phase 2 | CONFIRMED |
| F-38 | Legacy Chat Service | — | None | DEPRECATED |
| F-39 | Unified Backend Stub | — | None | DEPRECATED |
| **F-40** | Institutional Managed Learning | Institutional | Phase 3 | UPDATED |
| **F-41** | Institutional Procurement & Seat Licensing | Institutional | Phase 3 | UPDATED |
| **F-42** | Provider-Agnostic Media Engine | LMS/Media | Phase 2 | UPDATED |
| **F-43** | B2B2C Graduation Flywheel | Institutional | Phase 3 | UPDATED |
| **F-44** | AI Media Enrichment | AI/LMS | Phase 4 | RECOMMENDED ADDITION |
| **F-45** | Academic Integrity & Proctoring | Assessment | Phase 6 | RECOMMENDED ADDITION |
| **F-46** | Institutional Analytics & Reporting | Institutional | Phase 3 | UPDATED |
| **F-47** | Faculty Dashboard | Institutional | Phase 3 | UPDATED |
| **F-48** | Talent OS Shell & Workbench | OS Layer | Phase 2+ | CONFIRMED |
| **F-49** | Automation, Healing & Agent Layer | OS Layer | Phase 3+ | CONFIRMED |
| **F-50** | Institutional Course Marketplace | Institutional | Phase 3 | UPDATED |
| **F-51** | Media Health Monitoring | Media | Phase 2 | RECOMMENDED ADDITION |
| **F-52** | Institutional Certificate Verification | Institutional | Phase 3 | UPDATED |

---

## 10. User Roles & Permissions

### Master Permission Matrix (Capability × Role)

Legend: ✅ full · ✅* consent/context-scoped · ⛔ denied · IA=Institution Admin · DA=Department Admin · FA=Faculty · ML=Managed Learner

| Capability | Candidate | Recruiter | Org Admin | Instructor | IA | DA | FA | ML | Moderator | Platform Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Browse public jobs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ |
| Manage own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Limited | ✅ | ✅ |
| Enroll in courses | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | Via license | ✅ | ✅ |
| Attempt challenges | ✅ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ✅ | ✅ | ✅ | ✅ |
| Apply to jobs | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ (until graduation) | ⛔ | ✅ |
| Post jobs | ⛔ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Review applications | ⛔ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Direct message | ✅* | ✅* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅* | ✅ | ✅ |
| Manage billing (own) | ✅ | ⛔ | ✅ | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Moderate content | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ✅ |
| Publish courses | ⛔ | ⛔ | ✅(corp) | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Manage institution profile | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Manage departments | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ✅(own) | ⛔ | ⛔ | ⛔ | ✅ |
| Manage batches | ⛔ | ⛔ | ⛔ | ✅(owned) | ✅ | ✅ | ⛔ | ⛔ | ⛔ | ✅ |
| Purchase/assign licenses | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| View institutional analytics | ⛔ | ⛔ | ⛔ | ⛔ | ✅ | ✅ | ✅(assigned) | ⛔ | ⛔ | ✅ |
| Grade assessments | ⛔ | ⛔ | ⛔ | ✅ | ⛔ | ⛔ | ✅(assigned) | ⛔ | ⛔ | ✅ |
| Issue certificates | ⛔ | ⛔ | ⛔ | ✅ | ✅ | ⛔ | Configurable | ⛔ | ⛔ | ✅ |
| Feature flags | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |

**Boundary principles:** No role may mutate another user's private data without consent/legal basis · Recruiter candidate access is application-scoped · Moderation escalations are quorum-based · Faculty access is scoped to assigned batches only *(UPDATED)* · Managed Learners cannot self-enroll outside their license pool *(UPDATED)*.

### Role Lifecycles

**Account lifecycle:** REGISTERED → UNVERIFIED → VERIFIED → ACTIVE ⇄ SUSPENDED → DEACTIVATED → DELETED | TERMINATED.

**Managed Learner lifecycle** *(UPDATED):* PROVISIONED → CLAIMED → ACTIVE_MANAGED → GRADUATION_PENDING → INDEPENDENT | REVOKED.

---

## 11. Functional Requirements (Domain Modules)

*(Modules 1–21 from CONFIRMED baseline retained in summary; Modules 22–24 added for institutional and media capabilities. Full 17-dimension matrices are maintained in the engineering annex; key requirements are listed here.)*

### Module 1–21 Summary (CONFIRMED)

| Module | Name | Key Requirement Families |
|---|---|---|
| 1 | Identity, Authentication & Account Security | AUTH-001..015 |
| 2 | Candidate Profile, Career Identity & Portfolio | PROFILE-001..010, RESUME-001..003, PORTFOLIO-001 |
| 3 | Organizations, Teams & Employer Verification | ORG-001..008, RECRUIT-001..005 |
| 4 | Requisitions, Jobs & Talent Marketplace | JOB-001..016 |
| 5 | Applications & Candidate Review Pipeline | APPL-001..015 |
| 6 | Learning Management System | COURSE-001..005, LMS-001..014 |
| 7 | Challenges, Assessment & Code Arena | CHALL-001..013 |
| 8 | Networking, Social & Community | NET-001..013 |
| 9 | Direct Messaging & Video Coordination | MSG-001..016 |
| 10 | Gamification & XP Ledger | GAMI-001..004, GAM-005..011 |
| 11 | Search & Discovery | SEARCH-001..003, SRCH-001..010 |
| 12 | Notifications & Preference Center | NOTIF-001..005, NTF-006..011 |
| 13 | Billing, Subscriptions & Metering | BILL-001..014 |
| 14 | Trust, Safety & Content Moderation | TRUST-001..004, TRU-005..012 |
| 15 | Platform Administration & Governance | ADMIN-001..007, ADM-008..014 |
| 16 | Product Analytics & Telemetry | ANALYTICS-001..003, ANA-004..010 |
| 17 | Chrome Extension Companion | EXT-001..012 |
| 18 | Core Platform Shell & State Machines | CORE-001..013 |
| 19 | Reporting & Dashboards | Dashboard family |
| 20 | Integrations & API Ecosystem | INT-001..008, API-001..008 |
| 21 | Localization & Internationalization | L10N-001..008 |

### Module 22: Institutional Managed Learning *(UPDATED — expanded)*

**Purpose:** Enable education and training organizations to purchase course seats in bulk, provision and organize learners, assign courses by batch, track outcomes, and issue branded certificates.

**Organization Types Supported:** School, College, University, Coaching Institute, Training Institute, EdTech Partner, Corporate/L&D, Government/Education Organization.

**Organization Hierarchy:**

```
Organization (Institution)
├── Department(s)
│   ├── Batch(es) / Division(s) / Cohort(s)
│   │   └── Students (Managed Learners)
│   └── Faculty
└── Institution Admin / Billing-Procurement Manager
```

**Requirement Catalog (INST-001..INST-030):**

| ID | Requirement | Priority | Status |
|---|---|---|---|
| INST-001 | Institutional tenancy with org type, branding, subdomain, hierarchy (org→dept→batch→student) | Phase 3 | UPDATED |
| INST-002 | Institutional course marketplace with configurable volume-tier pricing | Phase 3 | UPDATED |
| INST-003 | Seat/license pool management: purchase, assign, revoke, reassign, extend, view unused/expired/expiring | Phase 3 | UPDATED |
| INST-004 | Bulk student import via CSV/Excel with validation, dedupe, dry-run preview | Phase 3 | UPDATED |
| INST-005 | Student provisioning: email invite, existing-account match, institutional SSO | Phase 3/6 | UPDATED |
| INST-006 | Batch-based enrollment: assign course to batch/division | Phase 3 | UPDATED |
| INST-007 | Faculty assignment to batches with RBAC-scoped dashboard | Phase 3 | UPDATED |
| INST-008 | Institutional analytics: institution→dept→batch→student→course→module→lesson→assessment drill-down | Phase 3 | UPDATED |
| INST-009 | Assessments & institutional exams: quizzes, assignments, coding, MCQs, practice tests, final exams | Phase 3 | UPDATED |
| INST-010 | Institutional certificates: branded, QR code, verification URL, certificate ID | Phase 3 | UPDATED |
| INST-011 | Configurable course completion rules per institutional course instance | Phase 3 | UPDATED |
| INST-012 | Institutional course customization (dates, required/optional modules, passing score, cert requirements) without altering underlying content | Phase 3 | UPDATED |
| INST-013 | Purchase models: seat-based, subscription, course bundle, custom enterprise contract | Phase 3/6 | UPDATED |
| INST-014 | Purchase approval workflow: Faculty→Dept Admin→Org Admin→Purchase | Phase 6 | UPDATED |
| INST-015 | Institutional invoicing: billing address, GSTIN/tax ID, PO number, invoice number, tax, discount, payment status, seats, license period | Phase 6 | UPDATED |
| INST-016 | Renewal system: expiry warnings at 30/15/7/1 days; renew, extend, upgrade, add seats | Phase 3 | UPDATED |
| INST-017 | License utilization dashboard: purchased, assigned, active, unused, expiring | Phase 3 | UPDATED |
| INST-018 | Institutional notifications for admins, faculty, students | Phase 3 | UPDATED |
| INST-019 | Institutional RBAC: IA, DA, Faculty, Billing Manager with least privilege | Phase 3 | UPDATED |
| INST-020 | Multi-tenant isolation: all institutional records scoped by organization_id; backend-enforced | Phase 3 | UPDATED |
| INST-021 | Institutional audit log: batch created, students imported, course assigned, license revoked, assessment changed, certificate issued, billing changed, role changed | Phase 3 | UPDATED |
| INST-022 | Data privacy: FERPA/GDPR for student data; consent for employer showcase | Phase 3 | UPDATED |
| INST-023 | Course access rules: access linked to Org + Student + License + Enrollment + Validity; server-side authorization | Phase 3 | UPDATED |
| INST-024 | Institutional reporting: student, batch, institution reports; CSV/Excel/PDF export | Phase 3 | UPDATED |
| INST-025 | Course catalog visibility: PUBLIC, INSTITUTION_ONLY, PRIVATE, UNLISTED | Phase 3 | UPDATED |
| INST-026 | Institutional-only courses (campus placement prep, industry readiness, etc.) | Phase 6 | UPDATED |
| INST-027 | White-label/co-branded portals (institution logo, colors, custom domain, cert branding, email branding) | Future | RECOMMENDED ADDITION |
| INST-028 | LMS/SIS integration: Moodle, Canvas, Blackboard, college ERP, MS Entra, Google Workspace (via API/webhooks, no tight coupling) | Future | RECOMMENDED ADDITION |
| INST-029 | Institutional API + webhooks: student.created, student.enrolled, course.assigned, course.completed, assessment.completed, certificate.issued, license.expiring | Phase 6 | RECOMMENDED ADDITION |
| INST-030 | B2B2C graduation transition: managed learner → independent candidate | Phase 3 | UPDATED |

### Module 23: Provider-Agnostic Media Engine *(UPDATED — expanded)*

**Purpose:** Allow course authors to build courses from any combination of media sources — platform uploads, YouTube videos/playlists, Vimeo, and other providers — with a unified learner experience.

**Supported Delivery Modes:**

| Mode | Description | Storage | Playback |
|---|---|---|---|
| A — Upload to TalentSphere | File uploaded, validated, transcoded, stored, CDN-delivered | Platform storage (private bucket) | Platform video player |
| B — External video | URL supplied, normalized, validated, metadata fetched | Provider-hosted | Provider embedded player |
| C — Playlist embed | External playlist embedded as single player | Provider-hosted | Provider playlist player |
| D — Playlist import (snapshot) | Playlist items imported as individual content items | Reference only | Provider players, platform ordering |
| E — External link fallback | Provider prohibits embedding; learner opens on provider site | N/A | External link with warning |

**Supported Providers:** TalentSphere Upload, YouTube (video + playlist), Vimeo (video), Wistia, Loom, Mux, Cloudflare Stream, Brightcove, and a pluggable FutureProvider interface.

**Provider Capability System:** Each provider declares capabilities: `canEmbed`, `canPlayPlaylist`, `canTrackPlayback`, `canTrackProgress`, `supportsCaptions`, `supportsSubtitles`, `supportsTranscript`, `supportsPlaybackSpeed`, `supportsStartTime`, `supportsEndTime`, `supportsFullscreen`, `supportsPictureInPicture`, `supportsThumbnail`, `supportsMetadataLookup`, `supportsOAuth`. The frontend enables/disables UI options based on declared capabilities.

**Requirement Catalog (MEDIA-001..MEDIA-048):**

| ID | Requirement | Priority | Status |
|---|---|---|---|
| MEDIA-001 | Provider-agnostic MediaSource abstraction: provider, source_type, external_id, source_url, embed_url, metadata, playback_configuration, provider_configuration | Phase 2 | UPDATED |
| MEDIA-002 | Provider adapter interface: validateUrl, parseUrl, getMetadata, validateAvailability, getEmbedConfiguration, getCapabilities, getThumbnail, getDuration, validateEmbedding | Phase 2 | UPDATED |
| MEDIA-003 | Client-side player adapter interface: initialize, play, pause, seek, destroy, getCurrentTime, getDuration, subscribeToEvents | Phase 2 | UPDATED |
| MEDIA-004 | Provider capability declaration and capability-driven UI | Phase 2 | UPDATED |
| MEDIA-005 | Mixed-source courses: no restriction that all lessons use the same provider | Phase 2 | UPDATED |
| MEDIA-006 | URL normalization for YouTube/Vimeo formats; canonical external ID extraction | Phase 2 | UPDATED |
| MEDIA-007 | Playlist sync modes: Dynamic (external source of truth) vs. Snapshot (captured at import) | Phase 2 | UPDATED |
| MEDIA-008 | Playlist import options: single playlist lesson, individual lessons, or selected lessons only | Phase 2 | UPDATED |
| MEDIA-009 | Imported playlist videos become normal media items, independently reorderable | Phase 2 | UPDATED |
| MEDIA-010 | Bulk playlist import with select-all, per-item selection, virtualized rendering for 100+ items | Phase 2 | UPDATED |
| MEDIA-011 | Replace video without losing lesson data (title, description, resources, notes, assessment, completion rules, position, progress metadata) | Phase 2 | UPDATED |
| MEDIA-012 | Media version history with authorized restore | Phase 4 | UPDATED |
| MEDIA-013 | Draft → validate → preview → publish → live workflow for media | Phase 2 | UPDATED |
| MEDIA-014 | Video lesson configuration: title, description, source, thumbnail, duration, preview availability, required/optional, completion rule, start/end time, captions, transcript, resources, notes, download permission, visibility, publish status, ordering | Phase 2 | UPDATED |
| MEDIA-015 | Playback configuration where supported: autoplay, muted start, speed, start/end position, fullscreen, captions, language, picture-in-picture; unsupported controls hidden | Phase 2 | UPDATED |
| MEDIA-016 | Playback progress tracking: VIDEO_OPENED, STARTED, PAUSED, RESUMED, PROGRESS, COMPLETED, ERROR, EXITED; store user, course, section, lesson, media, provider, position, watched %, last played, completed | Phase 2 | UPDATED |
| MEDIA-017 | External-provider tracking uses provider APIs/events; marked provider-dependent; never claim exact watch-time when unsupported | Phase 2 | UPDATED |
| MEDIA-018 | Resume playback: "Continue watching" with Resume/Start Again choice for supported providers | Phase 2 | UPDATED |
| MEDIA-019 | Course completion integration: video completion → lesson completed → section progress → course progress → certificate eligibility | Phase 2 | UPDATED |
| MEDIA-020 | Playlist lesson completion configuration: watch any 1 / 50% / 80% / all videos; imported videos individually controllable | Phase 2 | UPDATED |
| MEDIA-021 | Captions, subtitles, transcripts: multiple languages, VTT/SRT upload for hosted videos, transcript display, search within transcript, accessibility metadata | Phase 2 | UPDATED |
| MEDIA-022 | Thumbnail management: use provider thumbnail or upload custom | Phase 2 | UPDATED |
| MEDIA-023 | Normalized media metadata: title, description, duration, thumbnail, width, height, provider, external_id, author, publishedAt, language, privacyStatus; external metadata is informational | Phase 2 | UPDATED |
| MEDIA-024 | External video availability validation: VALID, INVALID_URL, VIDEO_NOT_FOUND, PRIVATE_VIDEO, EMBED_DISABLED, PROVIDER_UNAVAILABLE, AUTH_REQUIRED, UNSUPPORTED_PROVIDER, TEMPORARY_ERROR | Phase 2 | UPDATED |
| MEDIA-025 | Automatic health monitoring of published external lessons; alert on unavailability; never auto-delete broken lessons | Phase 2 | UPDATED |
| MEDIA-026 | Unified player container: one UI wrapper with provider-specific renderers selected by media.provider | Phase 2 | UPDATED |
| MEDIA-027 | Drag-and-drop ordering of sections, modules, lessons, videos, playlist items, assessments, resources; transactional persistence | Phase 2 | UPDATED |
| MEDIA-028 | Cross-section reordering: move lesson between sections updating membership + ordering | Phase 2 | UPDATED |
| MEDIA-029 | Bulk operations: move, delete, publish, unpublish, change section, duplicate, set required, set optional | Phase 2 | UPDATED |
| MEDIA-030 | Duplicate detection: warn if same external video already exists; offer Use Existing / Add Anyway / Cancel | Phase 2 | UPDATED |
| MEDIA-031 | Security: no arbitrary HTML/JS from authors; provider-specific renderers; strict allowlists; no raw iframe injection | Phase 2 | UPDATED |
| MEDIA-032 | Tutor permissions: course.media.create, edit, delete, reorder, publish, external_provider, playlist_import | Phase 2 | UPDATED |
| MEDIA-033 | Organization-level provider controls: institutional admins allow/disallow specific providers | Phase 3 | UPDATED |
| MEDIA-034 | Copyright/ownership: author confirms right to use external content; embed only, never download protected content | Phase 2 | UPDATED |
| MEDIA-035 | External link fallback when embedding prohibited; warn author before publishing | Phase 2 | UPDATED |
| MEDIA-036 | Ordering model: stable ordering mechanism; backend persists and validates; concurrent editing must not corrupt order | Phase 2 | UPDATED |
| MEDIA-037 | Autosave in course builder: lesson title, description, media config, ordering, visibility, completion settings; Saved/Saving/Failed states; never silently discard | Phase 2 | UPDATED |
| MEDIA-038 | Undo/Redo for structural actions (moved lesson, deleted video, changed provider) | Phase 4 | UPDATED |
| MEDIA-039 | Media analytics: views, unique learners, starts, completions, avg watch %, avg watch time, drop-off point, replay count, errors, provider; by course/section/lesson/provider/video/student/date | Phase 4 | UPDATED |
| MEDIA-040 | Admin external-media health dashboard: total, healthy, unavailable, embedding blocked, validation pending, provider errors; drill-down to affected courses | Phase 4 | UPDATED |
| MEDIA-041 | Notifications for media: video unavailable, playlist changed, video non-embeddable, provider auth expired, processing failed/completed | Phase 2 | UPDATED |
| MEDIA-042 | Course copy/clone behavior defined: uploaded media reuse/copy; external media reuse reference; imported playlists copy snapshot | Phase 2 | UPDATED |
| MEDIA-043 | Course export/import: uploaded media as asset references; external as provider+ID; playlists as provider+ID+sync mode; no provider secrets in export | Phase 6 | UPDATED |
| MEDIA-044 | Media API: POST/GET/PATCH/DELETE media; validate; playlist validate/import; reorder sections/lessons/media; status; analytics; idempotency | Phase 2 | UPDATED |
| MEDIA-045 | Async background processing for uploads: asset created → processing queue → transcoding → thumbnail → caption processing → CDN publish → READY; expose PROCESSING/READY/FAILED | Phase 2 | UPDATED |
| MEDIA-046 | Failure handling: provider unavailable, invalid URL, playlist deleted, video private, embedding disabled, upload failed, transcoding failed, timeout, rate limit, auth failure; course must keep functioning when one video fails | Phase 2 | UPDATED |
| MEDIA-047 | Caching: cache non-sensitive external metadata (title, thumbnail, duration, availability) with TTL; never permanently assume cached availability correct | Phase 2 | UPDATED |
| MEDIA-048 | Provider API quota/rate-limit handling: caching, dedupe, retry with backoff, background sync, circuit breakers; no per-playback provider calls unless necessary | Phase 2 | UPDATED |

### Module 24: B2B2C Graduation Flywheel *(UPDATED — expanded)*

**Purpose:** Transition managed institutional learners into independent candidate profiles, retaining verified signals while severing institutional PII, continuously supplying the marketplace with pre-verified talent.

| Step | Actor | Action | System Response | Guard |
|---|---|---|---|---|
| 1 | System | Trigger: license expires, batch graduated, or learner leaves | Detect termination; set account to GRADUATION_PENDING | Grace period for mid-course learners |
| 2 | System | Send "Claim Your Verified Career Profile" invitation | 30-day claim window; reminders at 15/7/1 days | Never auto-convert without learner action |
| 3 | Learner | Accept invitation; set personal credential; update contact info | Validate; establish independent session | SSO-only learners must create platform credential |
| 4 | System | Sever institutional PII and FERPA-restricted records | Cryptographic dissociation from public profile | FERPA/GDPR compliance |
| 5 | System | Retain platform-verified signals (XP, badges, certificates, portfolio) | Re-attribute to independent profile with provenance | Only platform-earned signals retained |
| 6 | Learner | Complete independent profile | Completeness recalculated; enter B2C talent pool | Completeness ≥70% for job applications |

---

## 12. Business Rules Register

*(CONFIRMED BR-01..BR-35 canonical + BR-036..BR-071 expanded retained. Institutional and media rules added below.)*

### Institutional Business Rules *(UPDATED)*

| Rule ID | Rule | Status | Enforcement |
|---|---|---|---|
| BR-072 | A managed learner may access a course only if the organization holds an unexpired license seat for that course AND the seat is assigned to that learner | UPDATED | RLS + entitlement check |
| BR-073 | License revocation triggers a grace period (default 7 days) before course access is hard-locked; mid-assessment learners not interrupted | UPDATED | Application + cron |
| BR-074 | Seat consumption is atomic; concurrent assignment of the last seat must not oversell | UPDATED | DB transaction + row lock |
| BR-075 | Revoking a learner's seat returns it to the pool; learner's progress and certificates retained but access suspended | UPDATED | Application |
| BR-076 | Graduation transition preserves platform-verified signals and severs FERPA-restricted institutional records from public profile | UPDATED | Application + privacy job |
| BR-077 | Bulk imports must pass dry-run validation before commit; partial silent imports prohibited | UPDATED | Import engine |
| BR-078 | Faculty roles may not access organization-level billing, licensing, or user management | UPDATED | RBAC + RLS |
| BR-079 | Student showcase to employers requires explicit, recorded, revocable consent | UPDATED | Consent record + RLS |
| BR-080 | Every institutional record is scoped by organization_id; cross-tenant reads prohibited at database layer | UPDATED | RLS |
| BR-081 | Institutional pricing tiers are configurable per course/package; never hard-coded | UPDATED | Admin config |
| BR-082 | Course access authorization is server-side, bound to Org + Student + License + Enrollment + Validity | UPDATED | RLS + application |

### Media Business Rules *(UPDATED)*

| Rule ID | Rule | Status | Enforcement |
|---|---|---|---|
| BR-083 | External media must be validated before publication; courses may not publish with invalid/private/embed-blocked sources | UPDATED | Validation gate |
| BR-084 | Provider embedding restrictions must never be bypassed; no downloading protected third-party content | UPDATED | Policy + adapter |
| BR-085 | Provider-specific capabilities determine available playback/completion settings; unsupported controls hidden, not faked | UPDATED | Capability registry |
| BR-086 | A broken external provider must not break the course; failure isolated to the affected content item | UPDATED | Error boundary |
| BR-087 | Media source replacement preserves lesson metadata, position, completion rules, and progress; only the media reference changes | UPDATED | Application |
| BR-088 | Reordering persists server-side; concurrent editing must not silently corrupt order | UPDATED | Optimistic locking |
| BR-089 | Authors must attest right to use external content before publication | UPDATED | Attestation record |
| BR-090 | Institution admins may restrict which media providers instructors use; enforced server-side | UPDATED | Org config + RLS |

---

## 13. State Machines & Lifecycles

*(CONFIRMED state machines retained: Account, Organization, Membership, Job, Application, Interview, Offer, Course, Enrollment, Lesson, Challenge/Submission, Connection, Message, Report/Moderation, Subscription, Payment, Notification, AI Suggestion, Mentor Relationship, Event, Certificate.)*

### License/Seat State Machine *(UPDATED)*

```
purchased → assigned → revoked → (returned to pool) → assigned ...
          → expired → (renewed) → active
          → exhausted (all seats assigned)
```

| From State | Allowed Transitions | Trigger | Guard |
|---|---|---|---|
| purchased | → assigned, → expired | Learner assignment / expiry | Seat available |
| assigned | → revoked, → expired | Learner departure / expiry | Grace period honored |
| revoked | → assigned (returned to pool) | Reassignment | Atomic pool update |
| expired | → active (renewed) | Renewal payment | Webhook-owned |
| active | → exhausted | All seats assigned | Count check |

### Media Asset State Machine *(UPDATED)*

```
uploaded → processing → transcoding → ready → archived
                                    → failed
pending_validation → valid → published → degraded / unavailable → replaced / archived
```

### Managed Learner Account State Machine *(UPDATED)*

```
provisioned → invited → claimed → active_managed → graduation_pending → independent
                                                    → revoked → archived
```

---

## 14. User Journeys & Workflows

*(CONFIRMED J-1..J-11 and WF-01..WF-15 retained. New journeys J-12..J-16 and workflows added.)*

### Journey Register

| Journey ID | Name | Persona | Starts At | Ends At | Phase |
|---|---|---|---|---|---|
| J-1..J-8 | *(CONFIRMED baseline journeys)* | Various | Various | Various | MVP+ |
| J-9 | Institution: Cohort → Place → Track | P-I | Cohort upload | Placement reported | Phase 3 |
| J-10 | Agency: Multi-Org → Pipeline → Bill | P-F | Agency registration | Client invoice | Phase 6 |
| J-11 | Extension: Install → Local-first → Sync | P-A | Extension install | Profile diff applied | Phase 2 |
| **J-12** | B2B2C Graduation Flywheel | ML | License expiry/graduation | Independent candidate in marketplace | Phase 3 |
| **J-13** | Institutional Media & Curriculum Authoring | P-G, P-K | Course creation with mixed media | Course assigned to batch | Phase 2/3 |
| **J-14** | Institutional Procurement & Licensing | P-J, Billing Mgr | Course selection | Seats provisioned, PO issued | Phase 6 |
| **J-15** | Faculty: Teach → Monitor → Intervene | P-K | Batch assignment | At-risk students intervened | Phase 3 |
| **J-16** | Corporate L&D: Mandate → Track → Certify | P-L | Compliance mandate | Certification + HRIS sync | Phase 6 |

### Workflow Register

*(WF-01..WF-15 CONFIRMED retained.)*

| Workflow ID | Name | Status |
|---|---|---|
| WF-16 | Institutional License Purchase & Pool Creation | UPDATED |
| WF-17 | Bulk Student Import & Provisioning | UPDATED |
| WF-18 | Batch Course Assignment | UPDATED |
| WF-19 | Media Ingestion & Validation | UPDATED |
| WF-20 | License Revocation & Seat Reassignment | UPDATED |
| WF-21 | Graduation Transition (B2B2C) | UPDATED |
| WF-22 | Institutional Renewal | UPDATED |
| WF-23 | Purchase Approval Workflow | UPDATED |

---

## 15. Cross-Module Workflows & The B2B2C Flywheel

*(CONFIRMED: Journey Healing Engine, Circular-Workflow Breakers, Workflow Ownership Matrix, Automation Engine, Domain Event Backbone retained.)*

### The B2B2C Flywheel (System-Level Integration) *(UPDATED)*

The institutional and consumer sides are connected through a continuous flywheel:

```
Institution purchases seats
        ↓
Learners provisioned & enrolled (managed)
        ↓
Learners complete courses, earn XP, certificates (verified signals)
        ↓
Institution tracks outcomes, issues branded certificates
        ↓
License expires / batch graduates / learner leaves
        ↓
GRADUATION_PENDING → learner claims independent profile
        ↓
Verified signals retained; institutional PII severed (FERPA)
        ↓
Independent candidate enters B2C talent marketplace
        ↓
Recruiters discover pre-verified candidates
        ↓
Verified hires → platform credibility → more institutions join
        ↓
(Loop repeats)
```

**Key integration points:**
- Learning module (Module 6) feeds verified signals to Gamification (Module 10) and Profile (Module 2).
- Institutional certificates (Module 22) are recognized as verified signals in the consumer profile.
- Media engine (Module 23) serves both consumer and institutional courses through the same content model.
- Graduation transition (Module 24) is triggered by license lifecycle events from the Domain Event Backbone.

---

## 16. System & Technical Architecture

*(CONFIRMED locked stack retained.)*

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js (App Router), React 18+, TypeScript strict, Tailwind CSS 4.x | Server-rendered + interactive UI |
| Database & Auth | Supabase (PostgreSQL 15+, PostgREST, Auth, Realtime, Storage, Edge Functions) | Full BaaS |
| AI | Multi-Model Router: Gemini + Claude + Heuristic | LLM with deterministic baseline |
| Hosting | Vercel (serverless, edge, previews) | CI/CD + global edge |
| Payments | Stripe (Subscriptions, Metered Billing, Webhooks) | Monetization |
| Email | Resend or Postmark | Transactional email |
| Monitoring | Sentry + Vercel Analytics + Supabase Dashboard | Observability |
| Design System | Aura (CSS custom properties) via Tailwind | Semantic tokens |
| UI Components | Radix UI + Tailwind + shadcn/ui patterns | Accessible foundation |
| Chrome Extension | Manifest V3 | Client companion |
| **Media Transcoding** *(UPDATED)* | Mux / Cloudflare Stream *(ASSUMPTION — provider TBD)* | Video transcoding + CDN |
| **Media Storage** *(UPDATED)* | Supabase Storage (private buckets) + provider-hosted for external | Media assets |

**Explicitly Rejected Stack:** Spring Boot/Java microservices, Kubernetes/Helm, RabbitMQ/Kafka, Redis, Express/tRPC/MySQL, MongoDB/STOMP chat, Aurora design tokens, NextAuth. (See Architecture Decision Records ADR-001..006.)

### Media Architecture *(UPDATED)*

```
Media Service
     │
┌────┴────────────┐
│                 │
Provider Registry   Media Repository
│
┌──────┼──────┬──────────┬──────────┐
│      │      │          │          │
YouTube Vimeo Upload   Wistia/Loom  Future
Adapter Adapter Adapter  Adapters    Adapter
│      │      │          │          │
▼      ▼      ▼          ▼          ▼
YouTube Vimeo TalentSphere Provider  Provider
Player  Player Player      Players   Player
```

### Frontend Media Component Architecture *(UPDATED)*

```
CourseBuilder
└── SectionEditor
    └── LessonEditor
        └── MediaEditor
            ├── UploadSourceForm
            ├── YouTubeSourceForm
            ├── YouTubePlaylistForm
            ├── VimeoSourceForm
            └── ExternalSourceForm

VideoPlayer
└── ProviderResolver
    ├── UploadedVideoPlayer
    ├── YouTubePlayer
    ├── VimeoPlayer
    ├── WistiaPlayer
    └── ExternalPlayer
```

---

## 17. Components, Modules & Operating Layer

*(CONFIRMED: Workspace OS Shell, Universal Object Model, Talent Intelligence Graph, Domain Event Backbone, OS Consistency & Command Palette, Personal Workbench, Marketplace Liquidity Engine, AI Agent OS, Event Governance Layer — all retained with their requirement catalogs WOS-, UOM-, TIG-, DEB-, OSUX-, WB-, LIQ-, AG/ASF-, EVG-.)*

*(CONFIRMED: Automation Engine AUTO-, Journey Healing HEAL-, Workflow Ownership WOM-, Data Quality DQ-, Continuous Audit CQA- retained.)*

---

## 18. Data Model & Data Requirements

### 50 Canonical Tables (CONFIRMED)

The canonical data model defines 50 production tables across 10 domain clusters. Every table has RLS enabled, UUID primary keys, created_at/updated_at audit columns, and soft-delete where applicable. *(Full catalog with field-level detail maintained in engineering annex.)*

### Non-Canonical Operational Tables

*(CONFIRMED OS-layer and journey tables retained.)*

### Institutional Tables *(UPDATED)*

| Table | Owning Journey | Keys & Relations | RLS Posture | Retention |
|---|---|---|---|---|
| departments | J-9 | id, institution_id→organizations.id | IA/DA write; faculty read | Life of org |
| batches | J-9 | id, department_id→departments.id | IA/DA write; FA read assigned | Life of org |
| batch_memberships | J-9 | batch_id→batches.id, student_id→profiles.id | IA write; student read own | 7 years |
| institutional_licenses | J-14 | id, institution_id→organizations.id, course_id→courses.id, total_seats, used_seats, expiry | IA/Billing write; system decrement | 7 years |
| license_assignments | J-14 | license_id→institutional_licenses.id, student_id→profiles.id, status | IA write; student read own | 7 years |
| institutional_certificates | J-9 | id, student_id, institution_id, course_id, cert_id, verification_hash, qr_code | System write; public verify read | Indefinite |
| purchase_requests | J-14 | id, requester_id, department_id, course_id, status | Requester/approvers scoped | 7 years |
| institutional_invoices | J-14 | id, institution_id, po_number, tax_id, amount, tax, discount, payment_status | IA/Billing read | 7 years |
| student_consent_records | J-9 | student_id, institution_id, consent_type, granted_at, revoked_at | Student own; institution status read | Life + 7 years |

### Media Tables *(UPDATED)*

| Table | Purpose | Key Fields | RLS Posture | Retention |
|---|---|---|---|---|
| media_sources | Provider-agnostic media reference | id, provider, source_type, external_id, source_url, embed_url, metadata, playback_config, provider_config | Course author write; enrolled read | Life of course |
| media_assets | Platform-hosted uploads | id, media_source_id, storage_bucket, storage_key, mime, size, duration, width, height, processing_status, renditions | System write; author read | Life of course |
| media_versions | Version history of media changes | id, media_source_id, version, snapshot, created_at | System append-only | Life of course |
| playlist_sources | External playlist references | id, provider, external_playlist_id, source_url, sync_mode, last_synced_at, sync_status | Course author write | Life of course |
| playlist_items | Playlist item snapshots | id, playlist_source_id, external_video_id, title, thumbnail, external_order, course_order, status | Derived from import | Life of course |
| media_progress | Playback tracking | id, user_id, content_item_id, media_id, provider, current_position, watched_percentage, last_played_at, completed | Own-row; instructor aggregate | 13 months |
| media_events | Playback lifecycle events | user_id, media_id, event_type, position, timestamp | Append-only | 13 months |
| media_provider_configs | Org-level provider allowlists | org_id, provider, allowed | Org Admin write; system enforce | Life of org |
| media_health_checks | External media availability monitoring | media_source_id, status, checked_at, error | System write; admin/author read | 90 days |
| content_items | Polymorphic lesson container | id, lesson_id, content_type (VIDEO/PLAYLIST/ARTICLE/PDF/QUIZ/ASSIGNMENT), media_source_id, display_order, is_required, completion_threshold, status | Course author write; enrolled read | Life of course |

### Unified Content Model *(UPDATED)*

```
Course
└── Section
    └── ContentItem (polymorphic: VIDEO, PLAYLIST, ARTICLE, PDF, QUIZ, ASSIGNMENT, EXTERNAL_LINK)
        └── MediaSource (provider-agnostic reference)
            └── ProviderAdapter
                └── ProviderPlayer
```

This replaces the previous video-centric model. Video-specific configuration attaches to the video content item, preventing the architecture from becoming video-specific.

---

## 19. APIs & Integrations

*(CONFIRMED: SCI-01..SCI-08 core contracts, API versioning, PostgREST access, CON-001..CON-016 interface contracts, error taxonomy, pagination, idempotency retained.)*

### Media API Endpoints *(UPDATED)*

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/v1/courses/{courseId}/media | Create media source |
| GET | /api/v1/courses/{courseId}/media | List media sources |
| PATCH | /api/v1/media/{mediaId} | Update media source |
| DELETE | /api/v1/media/{mediaId} | Delete media source |
| POST | /api/v1/media/validate | Validate external media URL |
| POST | /api/v1/media/playlist/validate | Validate playlist URL |
| POST | /api/v1/media/playlist/import | Import playlist items |
| PATCH | /api/v1/courses/{courseId}/sections/reorder | Reorder sections |
| PATCH | /api/v1/sections/{sectionId}/lessons/reorder | Reorder lessons |
| PATCH | /api/v1/lessons/{lessonId}/media/reorder | Reorder media |
| GET | /api/v1/media/{mediaId}/status | Media processing status |
| GET | /api/v1/media/{mediaId}/analytics | Media analytics |

### Institutional API Endpoints *(UPDATED)*

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/v1/institutions/{id}/licenses | Purchase license pool |
| POST | /api/v1/institutions/{id}/licenses/{licenseId}/assign | Assign seat |
| POST | /api/v1/institutions/{id}/licenses/{licenseId}/revoke | Revoke seat |
| POST | /api/v1/institutions/{id}/licenses/{licenseId}/reassign | Reassign seat |
| POST | /api/v1/institutions/{id}/students/import | Bulk student import (dry-run + commit) |
| POST | /api/v1/institutions/{id}/batches/{batchId}/enroll | Batch course assignment |
| GET | /api/v1/institutions/{id}/analytics | Institutional analytics |
| POST | /api/v1/institutions/{id}/certificates | Issue certificate |
| GET | /api/v1/certificates/{certId}/verify | Public certificate verification |
| POST | /api/v1/institutions/{id}/purchase-requests | Purchase approval workflow |

### Institutional Webhooks (Future — Phase 6) *(UPDATED)*

| Event | Payload |
|---|---|
| student.created | Student provisioned |
| student.enrolled | Student enrolled in course |
| course.assigned | Course assigned to batch |
| course.completed | Student completed course |
| assessment.completed | Student completed assessment |
| certificate.issued | Certificate issued |
| license.expiring | License nearing expiry |

### Integration Ecosystem *(CONFIRMED baseline retained; institutional integrations added)*

| Integration | Direction | Purpose | Phase |
|---|---|---|---|
| Supabase Auth/DB/Storage/Realtime | Core | BaaS | MVP |
| Stripe | Outbound | Payments, subscriptions, institutional invoicing | MVP/Phase 3 |
| Google OAuth | Inbound | Social login + Gemini access | MVP |
| GitHub OAuth | Inbound | Social login + portfolio import | MVP |
| Jitsi/Zoom | Outbound | Video interview rooms | Post-MVP |
| Resend/Postmark | Outbound | Transactional email | MVP |
| Sentry | Outbound | Error monitoring | MVP |
| PostHog | Outbound | Product analytics | MVP |
| Gemini/Claude | Outbound | AI providers | MVP/Phase 4 |
| Mux/Cloudflare Stream *(ASSUMPTION)* | Outbound | Video transcoding + CDN | Phase 2 |
| **Moodle / Canvas / Blackboard** *(UPDATED)* | Bidirectional | LMS integration via API/webhooks | Future |
| **College ERP / SIS** *(UPDATED)* | Inbound | Student roster sync | Future |
| **MS Entra / Google Workspace (SSO)** *(UPDATED)* | Inbound | Institutional SSO | Phase 6 |
| **HRIS (Workday, SAP, BambooHR)** *(UPDATED)* | Bidirectional | Corporate L&D sync | Phase 6 |
| LinkedIn | Outbound | Cross-post jobs | Post-MVP |
| Slack | Outbound | Recruiter notifications | Post-MVP |
| Zapier/Make | Outbound | No-code integration | Future |

---

## 20. UI/UX Requirements & Design System

*(CONFIRMED: Aura Semantic Design System with token families, Core UX Principles U-1..U-10, Universal Object Model UI, Navigation, Core Component Library, Page Structure Standard, Interactive Pattern Contracts, Accessibility WCAG 2.2 AA, Loading/Empty/Error States, UX State Completeness UXC-001..UXC-012, Web OS Experience OSX-001..OSX-012 — all retained.)*

### Media Builder UI Requirements *(UPDATED)*

**Course Builder Structure:**

```
Course Builder
├── Course
│   ├── Section 1
│   │   ├── Lesson 1
│   │   ├── Lesson 2
│   │   └── Add Content
│   ├── Section 2
│   └── Add Section
```

**Add Content Menu:** Video · YouTube Video · YouTube Playlist · Vimeo Video · External Video · PDF · Article · Quiz · Assignment.

**Video Source Selection:**

```
Video Source
○ Upload to TalentSphere
● YouTube
○ Vimeo
○ Other supported provider
```

**Provider-Specific Forms:**
- Upload: drag & drop, supported format, file size, upload progress, processing status
- YouTube: URL input, validate button, preview (title, duration, thumbnail)
- YouTube Playlist: URL input, validate, embed entire playlist vs. import videos
- Vimeo: URL input, validate button

**Preview Before Saving:** Validated media shows playable preview with title, provider, duration, and Save button. Invalid media shows actionable error (invalid URL, unavailable, embedding disabled, private, unsupported).

**Drag-and-Drop Ordering:** Reorder sections, modules, lessons, videos, playlist items, assessments, resources. Transactional persistence. Cross-section moves update membership + ordering.

### Institutional UI Requirements *(UPDATED)*

**License Utilization Dashboard:**

```
Purchased Seats      1,000
Assigned Seats         850
Active Learners        790
Unused Seats            150
Expiring Soon            42
```

**Institutional Analytics Drill-Down:**

```
Institution
└── Department
    └── Batch
        └── Student
            └── Course
                └── Module
                    └── Lesson
                        └── Assessment
```

**Bulk Import Preview:**

```
Total records: 500
Valid: 487
Duplicates: 8
Invalid: 5

[Import 487 Students]
```

**Institutional Certificate:**

```
CERTIFICATE OF COMPLETION

This certifies that
[Student Name]
has successfully completed
[Course Name]
provided through
[Institution Name]

Certificate ID: TS-2027-JAVA-000123
[QR Code for Verification]
```

---

## 21. Screens, Pages & Navigation

*(CONFIRMED: 22 canonical routes (3 public + 19 protected), OS-layer route extension (9 paths), institutional routes, route guard enforcement — all retained.)*

### Institutional Routes *(UPDATED)*

| Route Path | Access | Page Component |
|---|---|---|
| /institution | Institution Admin, Dept Admin | Institution dashboard |
| /institution/students | IA, DA | Learner management |
| /institution/students/import | IA | Bulk import wizard |
| /institution/departments | IA | Department management |
| /institution/batches | IA, DA | Batch management |
| /institution/marketplace | IA, Billing Mgr | Institutional marketplace |
| /institution/licenses | IA, Billing Mgr | License management & utilization |
| /institution/procurement | IA, Billing Mgr | PO, invoices, approvals |
| /institution/analytics | IA, DA | Analytics & reporting |
| /institution/certificates | IA | Certificate management |
| /institution/settings | IA | Branding, providers, hierarchy, integrations |
| /institution/faculty | Faculty, Proctor | Faculty dashboard |
| /institution/faculty/[batchId] | Faculty | Batch detail |

### Media Builder Routes *(UPDATED)*

| Route Path | Access | Page Component |
|---|---|---|
| /courses/[courseId]/build | Course Author, Instructor, IA | Course builder with media engine |
| /courses/[courseId]/media/[mediaId] | Course Author | Media source editor |

---

## 22. Authentication & Authorization

*(CONFIRMED: Supabase Auth with PKCE, Argon2id, TOTP MFA readiness, JWT session tokens, two-tier RBAC, RLS as final boundary — all retained.)*

### Institutional SSO *(UPDATED)*

| Provider | Mechanism | Phase |
|---|---|---|
| Microsoft Entra ID | SAML / OIDC federation | Phase 6 |
| Google Workspace | OIDC | Phase 6 |
| Okta | SAML / OIDC | Phase 6 |

**Provisioning:** Just-in-time learner provisioning on first SSO login. SSO is optional; email invite and existing-account match are available at Phase 3.

---

## 23. Security Requirements

*(CONFIRMED: Defense-in-depth 5 layers, PII field-level encryption, authorization & audit logging, secrets management, API security & rate limiting, CSP headers, vulnerability lifecycle, disclosure program, anti-scraping, STRIDE threat model, Secure-by-Design Hardening HDN-001..HDN-016, Responsible AI security, Zero Trust Runtime ZTR-, Secrets Governance SGC-, Runtime Threat Detection RTD-, Tenant Isolation Tiers TIT-, Runtime Secrets/Prompt Exfiltration/Internal Abuse RST/PED/IAB — all retained.)*

### Media Security *(UPDATED)*

| Control | Requirement |
|---|---|
| No arbitrary HTML/JS | Authors cannot inject raw scripts/iframes; provider-specific renderers only |
| Domain allowlisting | Only approved provider domains in CSP frame-src |
| SSRF protection | Server-side URL validation against allow-listed hosts/schemes |
| Upload safety | MIME sniffing + extension match + AV scan + size caps |
| Signed URLs | Private buckets with short-lived signed URLs |
| Copyright attestation | Author confirms right to use external content |
| No protected content download | Embed only; never rip protected third-party media |

### Institutional Security *(UPDATED)*

| Control | Requirement |
|---|---|
| Tenant isolation | All institutional records scoped by organization_id; backend-enforced RLS |
| FERPA compliance | Student educational records protected; consent for employer showcase |
| GDPR compliance | Student data rights; erasure; portability |
| Least-privilege faculty | Faculty access scoped to assigned batches only |
| Audit logging | All institutional actions logged (batch created, import, assignment, license revoke, assessment change, certificate issue, billing change, role change) |
| Purchase authorization | Purchase approval workflow prevents unauthorized spending |

---

## 24. Privacy & Data Protection

*(CONFIRMED: GDPR matrix, EEOC, CCPA/CPRA, data residency, DSR automated queue, cookie consent, sub-processor register, DPA/SCC, compliance roadmap, FERPA — all retained.)*

### Student Data Privacy *(UPDATED)*

**FERPA for Institutional Records:**
- **Protected Educational Records:** Cohort progress, grades, completion timestamps, assessment scores classified as `FERPA_RESTRICTED`.
- **Explicit Opt-In Showcase Consent:** Before student profile/signals published to employer-facing showcases, platform requires affirmative, digitally-signed consent with timestamp and IP logged.
- **Right to Revoke & Inspect:** Students can inspect what institutional data is presented and revoke consent at any time, immediately soft-deleting from showcases.
- **School Official Exemption:** TalentSphere functions as "School Official with Legitimate Educational Interest" under 34 CFR §99.31(a)(1)(i)(B), under direct institutional control, subject to §99.33(a) re-disclosure restrictions.

**Graduation Privacy:** When a managed learner transitions to independent candidate, institutional PII and FERPA-restricted records are cryptographically severed from the public profile. Only platform-earned verified signals (XP, badges, certificates) are retained, with provenance attribution.

---

## 25. Notifications & Communication

*(CONFIRMED: Notification framework, email delivery EML-001..012, multi-channel CHAN-001..008, lifecycle & marketing governance LMSG-001..010 — all retained.)*

### Institutional Notifications *(UPDATED)*

| Audience | Notification | Channel | Timing |
|---|---|---|---|
| Institution Admin | Student enrollment completed | In-app + email | Immediate |
| Institution Admin | Bulk import failed rows | In-app + email | Immediate |
| Institution Admin | License expiry warning | In-app + email | 30/15/7/1 days before |
| Institution Admin | Low license availability (<10% free) | In-app + email | On threshold |
| Institution Admin | Course completion (aggregate) | In-app | Daily digest |
| Institution Admin | Assessment results (aggregate) | In-app | Daily digest |
| Institution Admin | Payment/invoice events | Email | Immediate |
| Faculty | Student inactivity | In-app | Weekly digest |
| Faculty | Assessment deadline approaching | In-app | 3 days before |
| Faculty | Low-performing students | In-app | Weekly digest |
| Student | Course assignment | In-app + email | Immediate |
| Student | Enrollment confirmation | In-app + email | Immediate |
| Student | Course deadline approaching | In-app + email | 7/3/1 days before |
| Student | Assessment deadline | In-app + email | 3/1 days before |
| Student | Certificate available | In-app + email | Immediate |
| Student | License expiring / graduation transition | In-app + email | 30/15/7/1 days before |

### Media Notifications *(UPDATED)*

| Trigger | Audience | Notification |
|---|---|---|
| External video becomes unavailable | Course author | "Video unavailable — replace?" |
| Playlist changed significantly | Course author | "Playlist updated — review?" |
| Video becomes non-embeddable | Course author | "Embedding disabled — external link fallback?" |
| Provider authorization expires | Course author | "Re-authorize provider" |
| Media processing fails | Course author | "Processing failed — retry/re-upload" |
| Uploaded video processing completes | Course author | "Video ready" |

---

## 26. Search, Filtering, Sorting & Reporting

*(CONFIRMED: Search & discovery, faceted filtering, universal search, Search Maturity Roadmap SMR-001..SMR-008 — all retained.)*

### Institutional Reporting *(UPDATED)*

**Report Types:**

| Report | Scope | Export Formats |
|---|---|---|
| Student report | Per-student: course, progress, score, completion, certificate | CSV, Excel, PDF |
| Batch report | Per-batch: enrollment, active, completed, avg score, completion rate | CSV, Excel, PDF |
| Institution report | Aggregate: total learners, utilization, completion, assessment performance, certificates, license utilization | CSV, Excel, PDF |

**Analytics Dashboards:**

| Dashboard | Audience | Key Metrics |
|---|---|---|
| Institution Dashboard | IA | Total students, active learners, courses assigned, avg completion, certificates issued, inactive students |
| Course Analytics | IA, DA | Enrolled, started, completed, completion %, avg score |
| Batch Analytics | IA, DA, FA | Students, active, completed, avg score |
| License Utilization | IA, Billing Mgr | Purchased, assigned, active, unused, expiring |
| Faculty Dashboard | FA | Assigned classes, student progress, at-risk learners, grading queue |

### Media Analytics *(UPDATED)*

| Metric | Breakdown |
|---|---|
| Views, unique learners, starts, completions | By course, section, lesson, provider, video, student, date |
| Avg watch %, avg watch time, drop-off point | By course, section, lesson, provider |
| Replay count, errors | By provider |

Provider-specific limitations reflected as: Tracked by TalentSphere / Provider-reported / Estimated / Unavailable. Never present unavailable data as exact.

---

## 27. Admin & Management Features

*(CONFIRMED: Admin console, audit log viewer, feature flags, scheduler status, source-labeled status, admin action safety, product analytics admin, expanded administration requirements — all retained.)*

### Institutional Admin Features *(UPDATED)*

| Feature | Description | Access |
|---|---|---|
| Institution profile management | Branding, hierarchy, subdomain | IA |
| Department management | Create/edit departments | IA, DA |
| Batch management | Create/edit batches, assign students | IA, DA |
| License management | Purchase, assign, revoke, reassign, extend seats | IA, Billing Mgr |
| Bulk student import | CSV/Excel with validation, dry-run | IA |
| Course assignment | Assign courses to batches | IA, DA |
| Faculty management | Assign faculty to batches | IA, DA |
| Institutional analytics | Multi-level drill-down | IA, DA, FA |
| Certificate management | Issue, verify, revoke certificates | IA, FA (configurable) |
| Purchase approval | Review/approve purchase requests | IA, DA |
| Procurement & invoicing | PO, GSTIN, tax, payment tracking | IA, Billing Mgr |
| Provider controls | Allow/disallow media providers | IA |
| Institutional settings | Branding, integrations, consent policies | IA |

### Media Admin Features *(UPDATED)*

| Feature | Description | Access |
|---|---|---|
| External media health dashboard | Total, healthy, unavailable, embedding blocked, validation pending, provider errors; drill-down | Platform Admin |
| Media processing monitor | Transcoding queue, failures | Platform Admin |
| Provider configuration | Global provider settings | Platform Admin |

---

## 28. Error Handling & Edge Cases

*(CONFIRMED: Edge case matrix EC-01..EC-17, error taxonomy, degraded-mode design — all retained.)*

### Media Edge Cases *(UPDATED)*

| # | Edge Case | Handling |
|---|---|---|
| MEC-01 | External video becomes unavailable after publication | Health check detects; author notified; course continues functioning; isolated error state |
| MEC-02 | Playlist deleted or made private | Detect via health check; notify author; snapshot-mode playlists unaffected |
| MEC-03 | Provider embedding disabled | Fallback to external link with warning; author notified |
| MEC-04 | Upload interrupted | Resumable/chunked upload with integrity check |
| MEC-05 | Transcoding failure | Mark asset failed; notify author; allow re-upload/retry |
| MEC-06 | Concurrent reordering | Optimistic locking; conflict returns 409 with reload guidance |
| MEC-07 | Replace video with different provider | Preserve all lesson data; only media reference changes |
| MEC-08 | Duplicate external video in course | Warn with location; offer Use Existing / Add Anyway / Cancel |
| MEC-09 | Provider rate limit during metadata fetch | Queue validation; show "validation pending"; retry with backoff |
| MEC-10 | Video exceeds size/format limits | Reject with actionable error at upload |

### Institutional Edge Cases *(UPDATED)*

| # | Edge Case | Handling |
|---|---|---|
| IEC-01 | Concurrent assignment of last seat | Atomic transaction; second assignment fails with "no seats available" |
| IEC-02 | Student leaves mid-assessment | Grace period; complete in-progress assessment before access lock |
| IEC-03 | Bulk import with duplicate emails | Dedupe by verified email; report duplicates; no silent merge |
| IEC-04 | License expires mid-course | Grace period for content access; new enrollments blocked |
| IEC-05 | Revoke seat from learner with certificates | Certificates retained; access suspended |
| IEC-06 | Purchase request rejected | Requester notified with reason; can revise and resubmit |
| IEC-07 | Two admins import same batch simultaneously | Idempotency key prevents duplicate import |
| IEC-08 | Faculty accesses unassigned batch | RLS denies; audit logged |
| IEC-09 | Student consent revoked after showcase | Immediate soft-delete from showcase |
| IEC-10 | Institutional SSO fails | Fallback to email invite / existing-account match |

---

## 29. Non-Functional Requirements

*(CONFIRMED: NFR-01..NFR-07 retained.)*

| ID | Requirement | Priority | Status |
|---|---|---|---|
| NFR-01 | Performance: LCP <2.5s, API p95 <200ms, lazy-loaded pages, optimistic UI, realtime | MVP | CONFIRMED |
| NFR-02 | Accessibility: WCAG 2.2 AA | MVP | CONFIRMED |
| NFR-03 | Security: RLS all tables, JWT, RBAC, zero secrets in source | MVP | CONFIRMED |
| NFR-04 | Testing standards: every UI surface implements loading/empty/error/permission/degraded states | MVP | CONFIRMED |
| NFR-05 | Realtime resilience: auto-reconnect, dedupe, ordering, unread reconciliation | MVP | CONFIRMED |
| NFR-06 | Code execution sandbox: isolated, quotas, 30s timeout | Post-MVP | CONFIRMED |
| NFR-07 | Availability 99.9%; data integrity 99.99% | Post-MVP | CONFIRMED |

---

## 30. Performance Requirements

*(CONFIRMED: Core Web Vitals targets, per-route budgets, performance anti-patterns, hot-path budgets PERF-001..PERF-010 — all retained.)*

### Media Performance *(UPDATED)*

| Requirement | Target |
|---|---|
| Video start time (broadband) | < 3s |
| Lazy player initialization | Only active player initialized; no dozens of iframes |
| Thumbnail/placeholder | Shown until learner selects lesson |
| Transcoding (≤2GB video) | < 30 min *(ASSUMPTION)* |
| Media metadata fetch | Cached with TTL; no per-playback provider calls |

---

## 31. Scalability & Reliability

*(CONFIRMED: Sizing model, scaling principles, SLOs & error budgets, degraded-mode design — all retained.)*

### Institutional Scalability *(UPDATED)*

| Axis | Consideration |
|---|---|
| Bulk import | Async background job; 5,000-row import completes validation <60s *(ASSUMPTION)* |
| Batch enrollment | Atomic seat consumption; no oversell under concurrency |
| Institutional analytics | Pre-aggregated rollups for timeframes >30 days |
| Multi-tenant | Per-org RLS; no cross-tenant leakage |

---

## 32. Logging, Monitoring & Auditing

*(CONFIRMED: Structured JSON logging, end-to-end request tracing, monitoring triad, alert severity routing, distributed tracing, AI observability, incident management, runbooks R-001..R-010, platform health score PHS-, self-healing SHEAL-, support operations SUP/DOC/VOC — all retained.)*

### Institutional Audit Events *(UPDATED)*

| Event | Logged Fields |
|---|---|
| Admin created batch | actor, batch_id, department_id, timestamp |
| Admin imported students | actor, count, valid/duplicate/invalid, timestamp |
| Admin assigned course | actor, course_id, batch_id, seats_consumed, timestamp |
| Admin revoked license | actor, license_id, student_id, reason, timestamp |
| Faculty changed assessment | actor, assessment_id, change_type, timestamp |
| Certificate issued | student_id, course_id, cert_id, timestamp |
| Billing information changed | actor, field, old_value_masked, new_value_masked, timestamp |
| Role changed | actor, user_id, old_role, new_role, timestamp |

---

## 33. Backup & Recovery

*(CONFIRMED: Backup strategy, PITR, DR runbook, recovery testing schedule, DR cost model & multi-region tradeoff — all retained.)*

---

## 34. Deployment Requirements & Environment Configuration

*(CONFIRMED: Environment ladder, external dependency governance, CI/CD pipeline, deployment strategy & release criteria, rollback/canary/feature flags, monitoring infrastructure, alerting policies, backup/PITR, production go-live gates PROD-001..PROD-018 — all retained.)*

### Media Deployment Dependencies *(UPDATED)*

| Dependency | Category | What It Needs | Blocked-by |
|---|---|---|---|
| Mux / Cloudflare Stream *(ASSUMPTION)* | Requires external configuration | API token, webhook endpoint, transcoding profile | Provider account; founder decision on provider |
| YouTube Data API | Requires external configuration | API key, quota approval | Google Cloud project |
| Vimeo API | Requires external configuration | API token, app approval | Vimeo developer account |

### Institutional Deployment Dependencies *(UPDATED)*

| Dependency | Category | What It Needs | Blocked-by |
|---|---|---|---|
| Stripe Invoicing | Requires external configuration | Invoicing API, tax calculation | Stripe account + legal |
| Institutional SSO (Entra/Google/Okta) | Requires external configuration | IdP metadata, SAML/OIDC client | Customer IT engagement |
| LMS/SIS integrations | Requires external configuration | API credentials, field mapping | Customer contract |

---

## 35. Testing & Quality Assurance

*(CONFIRMED: Test pyramid, module test matrix, test fixtures, API & contract testing, E2E & edge case matrix, security testing, performance/load testing, AI quality/fairness evaluation, accessibility testing, regression protection REG-, verification gates VER-001..VER-016, review methodology & production readiness — all retained.)*

### Media Testing Requirements *(UPDATED)*

| Test Type | Scope |
|---|---|
| Unit | Provider adapter validation, URL normalization, capability registry, completion rule evaluation |
| Integration | Media source CRUD, playlist import, reordering transactions, progress tracking |
| E2E | Author builds mixed-media course → publishes → learner consumes → progress recorded → completion |
| Contract | Media API endpoints, provider adapter interfaces |
| Failure | Provider unavailable, invalid URL, playlist deleted, video private, embedding disabled, upload failed, transcoding failed, timeout, rate limit |
| Performance | Video start time, lazy player initialization, transcoding throughput |

### Institutional Testing Requirements *(UPDATED)*

| Test Type | Scope |
|---|---|
| Unit | Seat arithmetic, import validation, completion rules, certificate generation |
| Integration | License lifecycle, bulk import, batch enrollment, purchase approval, RLS tenant isolation |
| E2E | Institution purchases seats → imports students → assigns course → learner completes → certificate issued → graduation transition |
| Contract | Institutional API endpoints, webhooks |
| Security | Cross-tenant isolation, FERPA consent, faculty scope enforcement, purchase authorization |
| Performance | Bulk import throughput, analytics query latency |

---

## 36. Acceptance Criteria

*(CONFIRMED: Core domain, Web OS shell, security & compliance, operational & performance acceptance criteria — all retained.)*

### Institutional Acceptance Criteria *(UPDATED)*

| Criterion | Target |
|---|---|
| Bulk import | 5,000-row CSV produces accurate dry-run preview; commit creates correct student records; duplicates reported, not silently merged |
| Seat assignment | Concurrent assignment of last seat never oversells; seat count always equals active assignments |
| License lifecycle | Expiry warnings fire at 30/15/7/1 days; renewal resets expiry; grace period honored for mid-course learners |
| Batch enrollment | Assigning course to batch consumes exactly N seats; all batch members enrolled |
| Certificate | Certificate displays student name, institution, course, completion date, cert ID, verification URL, QR code; public verification returns validity without exposing PII |
| FERPA consent | No student appears in employer showcase without recorded, unrevoked consent; revocation immediately removes student |
| Faculty scope | Faculty can access only assigned batches; attempts to access unassigned batches denied and audited |
| Graduation transition | Learner retains XP, badges, certificates; institutional PII severed; profile enters B2C pool |

### Media Acceptance Criteria *(UPDATED)*

| Criterion | Target |
|---|---|
| Mixed-media course | Course containing upload + YouTube video + YouTube playlist + Vimeo video renders, plays, and tracks progress correctly |
| Provider validation | Invalid/private/embed-blocked sources rejected before publication with actionable error |
| Playlist import | Importing playlist of 100 items completes with virtualized rendering; imported items independently reorderable |
| Media replacement | Replacing YouTube source with Vimeo source preserves title, description, resources, notes, assessment, completion rules, position, progress metadata |
| Playback tracking | Platform-hosted media reports accurate position; external providers report only what their APIs expose; UI never claims exact watch-time when unsupported |
| Failure isolation | A broken external video produces isolated error state; course page and remaining lessons function normally |
| Security | No arbitrary HTML/JS injection possible; only allowlisted provider domains in frame-src |

---

## 37. Accessibility Requirements

*(CONFIRMED: WCAG 2.2 AA conformance matrix, keyboard navigation, screen reader support, high-contrast & color independence, touch target sizing, accessible authentication, accessibility evidence A11Y-001..A11Y-010 — all retained.)*

### Media Accessibility *(UPDATED)*

| Requirement | Implementation |
|---|---|
| Captions/subtitles | Supported where provider allows; VTT/SRT upload for hosted videos |
| Transcript | Display + search within transcript where available |
| Keyboard navigation | Player controls keyboard-operable |
| Screen reader | Player state announced; provider limitations disclosed, not hidden |
| Reduced motion | Respects prefers-reduced-motion |

---

## 38. SEO Requirements *(RECOMMENDED ADDITION)*

| Requirement | Implementation |
|---|---|
| Public pages indexable | Homepage, public job listings, public course catalog, public company profiles |
| Structured data | JSON-LD for JobPosting, Course, Organization schemas |
| Meta tags | Unique title/description per public page |
| Sitemap | Dynamic XML sitemap for public content |
| robots.txt | Exclude authenticated routes (/dashboard, /applications, /messages, /settings, /admin, /institution) |
| Canonical URLs | Prevent duplicate content for job/course listings |
| Open Graph / Twitter Cards | Rich previews for shared job/course links |
| Performance | Core Web Vitals within budget (LCP <2.5s) for SEO ranking |
| Institutional pages | Not indexed (authenticated); noindex on /institution/* |
| Media | Video content not directly indexed by search engines; course pages indexed |

---

## 39. Analytics & Tracking

*(CONFIRMED: Product analytics event dictionary EVT-001..EVT-032, metric computation register, experimentation framework EXP-, measurement integrity — all retained.)*

### Institutional Events *(UPDATED)*

| ID | Event | Trigger | Key Properties |
|---|---|---|---|
| EVT-033 | license_pool_created | Institutional purchase confirmed | institution_id, course_id, total_seats, expiry |
| EVT-034 | license_assigned | Seat assigned to learner | license_id, student_id |
| EVT-035 | license_revoked | Seat returned to pool | license_id, student_id, reason |
| EVT-036 | bulk_import_completed | Student import committed | institution_id, valid, duplicates, invalid |
| EVT-037 | batch_course_assigned | Course assigned to batch | batch_id, course_id, seats_consumed |
| EVT-038 | institutional_certificate_issued | Certificate issued | student_id, course_id, cert_id |
| EVT-039 | graduation_transition_completed | Managed learner → independent | student_id, signals_retained_count |
| EVT-040 | purchase_request_submitted | Purchase approval workflow initiated | requester_id, course_id, seats |
| EVT-041 | license_expiring_soon | Expiry warning triggered | license_id, days_remaining |

### Media Events *(UPDATED)*

| ID | Event | Trigger | Key Properties |
|---|---|---|---|
| EVT-042 | media_source_created | Media source added to course | media_id, provider, source_type |
| EVT-043 | media_validated | External media validated | media_id, provider, status |
| EVT-044 | media_playback_progress | Playback progress recorded | media_id, position, watched_percentage |
| EVT-045 | media_completed | Media playback completed | media_id, provider |
| EVT-046 | media_became_unavailable | Health check detected unavailability | media_id, provider, reason |
| EVT-047 | playlist_imported | Playlist items imported | playlist_id, item_count, sync_mode |
| EVT-048 | media_source_replaced | Media source replaced | media_id, old_provider, new_provider |

---

## 40. Maintenance & Support

*(CONFIRMED: Support & service experience SUP-, documentation & user enablement DOC-, voice-of-customer VOC- — all retained.)*

### Institutional Support *(UPDATED)*

| Requirement | Description |
|---|---|
| Institution onboarding guide | Setup, bulk import templates, license management, faculty assignment, reporting |
| Media authoring guide | Supported providers, playlist import, completion rules, copyright attestation |
| Institutional FAQ | Seat management, renewals, FERPA consent, certificates |
| Dedicated support tier | Enterprise institutions get dedicated CSM + SLA |

---

## 41. Risks & Mitigation Strategies

*(CONFIRMED: RSK-01..RSK-10 retained.)*

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RSK-01 | Scope becomes unbounded | Delayed launch, burnout | Strict release gates, outcome-based prioritization, explicit exclusions |
| RSK-02 | Tenant isolation failure | Severe privacy violation | Database-enforced RLS, automated negative tests |
| RSK-03 | Fraudulent employers/fake jobs | Candidate harm, trust collapse | Domain verification, moderation triage, user reporting |
| RSK-04 | Biased/opaque AI decision-making | Legal liability, unfair rejection | AI suggestions only; no autonomous rejection; human review |
| RSK-05 | Candidate data overcollection/leakage | Privacy/GDPR breach | Data minimization, strict RLS, no resume text in analytics |
| RSK-06 | Third-party provider outage | Workflow disruption | Provider abstraction, offline fallback, local state caching |
| RSK-07 | Marketplace liquidity failure | Low engagement | Focused segments, high-signal assessments, seed listings |
| RSK-08 | Notification fatigue/spam | User churn | Preference center, frequency caps, digest batching |
| RSK-09 | Weak operational readiness/long MTTR | Extended downtime | Structured logging, tracing, automated backups, restore testing |
| RSK-10 | Code execution sandbox escape | Server compromise | Quota-enforced isolated sandboxes, timeouts, zero network |

### Institutional Risks *(UPDATED)*

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RSK-11 | FERPA violation through improper student data disclosure | Federal penalties, loss of institutional contracts | Consent-gated showcases, FERPA-restricted classification, right to revoke |
| RSK-12 | Institutional contract concentration | Revenue volatility if large tenant churns | Diversify portfolio; multi-year contracts; monitor utilization as churn leading indicator |
| RSK-13 | Bulk import errors corrupt institutional rosters | Wrong students enrolled; seats wasted | Mandatory dry-run; transactional per-row; reversible batches |
| RSK-14 | Seat oversell under concurrency | Financial loss; institutional dispute | Row-level locking; DB check constraint; concurrency tests |
| RSK-15 | License expiry disrupts mid-course learners | Learner experience damage; institutional complaint | Grace period; early warnings; renewal nudges |

### Media Risks *(UPDATED)*

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RSK-16 | External video unavailable | Broken course content | Health monitoring; author notification; isolated error state; never auto-delete |
| RSK-17 | Provider API changes break adapters | Media features degrade | Adapter abstraction; versioned contracts; monitoring |
| RSK-18 | Copyright infringement via external content | Legal liability; provider ToS violation | Author attestation; embed-only; no download of protected content |
| RSK-19 | Video hosting/transcoding costs exceed budget | Negative unit economics | Per-tenant storage/egress metering; cost caps; external providers for high-volume |
| RSK-20 | Provider embedding restrictions | Content unplayable | Capability-driven UI; external link fallback; author warning |

---

## 42. Dependencies, Assumptions & Constraints

### External Dependencies

*(CONFIRMED dependency governance table retained. Media and institutional dependencies listed in Section 34.)*

### Assumptions

| ID | Assumption | Requires Validation |
|---|---|---|
| ASM-01 | Supabase Postgres can serve target scale (50k MAU) without sharding | Load test at 2× ceiling |
| ASM-02 | YouTube/Vimeo embed APIs remain available and permit educational embedding | Review provider terms |
| ASM-03 | Institutions accept platform-hosted certificates as valid credentials | Pilot with 2–3 institutions |
| ASM-04 | Managed learners opt in to graduation transition at meaningful rate (>40%) | Track conversion in pilot |
| ASM-05 | Faculty adopt platform dashboard instead of external spreadsheets | Pilot usability testing |
| ASM-06 | Stripe supports institutional invoicing (PO, Net-terms, GSTIN) | Validate against Stripe Invoicing API |
| ASM-07 | AI transcription cost per hour of video is acceptable within unit economics | Cost model before enabling enrichment |
| ASM-08 | Mux or Cloudflare Stream selected for transcoding | Founder decision on provider |

### Constraints

| ID | Constraint | Type |
|---|---|---|
| CON-C1 | Locked technology stack; changes require C6 governance approval | Technical |
| CON-C2 | 50 canonical tables; additions require formal governance change | Technical |
| CON-C3 | RLS is final authorization boundary; no client-side or middleware-only authorization | Security |
| CON-C4 | AI never makes consequential decisions autonomously | Product/Legal |
| CON-C5 | WCAG 2.2 AA is a release gate | Legal/Product |
| CON-C6 | English is canonical default/fallback for all layers | Product |
| CON-C7 | USD is billing/clearing currency; display currency locale-based | Commercial |
| CON-C8 | No arbitrary user code execution outside quota'd sandbox | Security |
| CON-C9 | Third-party video content embedded only, never downloaded | Legal |
| CON-C10 | Browser-delivered only; no native runtime | Product |
| CON-C11 | Solo founder + AI coding agent is delivery capacity for Phases 0–2 | Resource |
| CON-C12 | Nothing implemented until independently verified | Governance |

---

## 43. Future Enhancements & Roadmap

### Tier 3 Differentiators (Deferred — No Commitment, No Dates)

| Differentiator | Description | Depends On |
|---|---|---|
| Agent Marketplace | Third parties publish governed agents | Agent registry + policy engine |
| Plugin Ecosystem | Sandboxed plugins extending OS surfaces | Command registry + objects |
| Visual Workflow Designer | No-code builder over automations | Automation engine |
| Custom App Builder | Compose objects/widgets into internal apps | Workspace + objects + DQ |
| AI-Native Dashboards | Natural-language dashboard generation | TIG + AI + DQ |
| Enterprise Workspace OS | Multi-tenant org workspaces, cross-org collaboration | Workspace + zero-trust + RLS |
| Public OS API/SDK | Programmatic OS access for partners | Event backbone + command + zero-trust |
| **White-Label Institutional Portals** *(UPDATED)* | Institution logo, colors, custom domain, cert/email branding | Institutional tenancy + enterprise tier |
| **LMS/SIS Integrations** *(UPDATED)* | Moodle, Canvas, Blackboard, college ERP | API/webhooks; no tight coupling |
| **Provider Marketplace for Media** *(UPDATED)* | Third-party media provider plugins | Media adapter interface |
| **AI Proctoring / Lockdown Browser** *(UPDATED)* | Proctored exams for institutional assessments | Assessment engine + enterprise tier |

**Deferral rule:** None of these may be started before MVP-OS items are complete and verified.

---

## 44. Implementation Phases & Priorities

*(CONFIRMED: Phases 0–6, Definition of Ready/Done, V-01..V-10 verification gates, tier sequencing, FDR-, SEQ- — all retained.)*

### Updated Phase Scope

| Phase | Title | Scope (additions marked UPDATED) |
|---|---|---|
| Phase 0 | Foundation | Supabase setup, Next.js skeleton, Aura tokens, auth, RLS baseline, CI/CD, test harness |
| Phase 1 | Candidate Core | Profile, resume, portfolio, course catalog, challenge arena, XP + levels |
| Phase 2 | Marketplace + Media Foundations *(UPDATED)* | Job posting/search, application pipeline, candidate tracking; **provider-agnostic media engine (upload + YouTube + Vimeo), unified content model, course builder with drag-drop** |
| Phase 3 | Recruiter Suite + Institutional Foundations *(UPDATED)* | Scorecards, interview coordination, messaging, offers, org admin; **institutional tenancy, hierarchy, bulk import, license pools, batch assignment, institutional certificates, graduation transition** |
| Phase 4 | AI Copilot + Media Expansion *(UPDATED)* | Heuristic AI baseline, resume/career AI drafts; **playlist sync modes, captions/transcripts, AI media enrichment, provider health monitoring** |
| Phase 5 | Trust & Scale | Moderation, admin dashboard, platform analytics, observability, performance |
| Phase 6 | Enterprise Expansion *(UPDATED)* | SSO/SAML, API + webhooks, custom pipelines, multi-currency, additional locales, white labeling; **institutional procurement (PO, Net-terms), purchase approval workflows, HRIS/SIS/LMS integrations, institutional SSO, enterprise video providers, AI proctoring** |

### Updated Phase-to-Lane Evidence Mapping

| Phase | Must-deliver surfaces | DB tables needed | Must-pass evidence | Gate close evidence |
|---|---|---|---|---|
| Phase 0 | Auth/session, landing, shell, route registry, Aura | profiles, user_settings, audit_logs, feature_flags | Unit RLS own-row; WF-12 onboarding E2E; tenant isolation T1 | Foundation release checklist |
| Phase 1 | Profile, resume, portfolio, courses, challenges, XP | profiles, resumes, courses, course_modules, module_progress, course_enrollments, certificates, challenges, challenge_submissions, xp_transactions | Idempotent challenge submission; linear XP ledger; WCAG AA clean | Candidate loop closes (J-1) |
| Phase 2 | Jobs, applications, **course builder with media engine** | organizations, jobs, job_applications, application_status_events, saved_jobs, **media_sources, media_assets, content_items, playlist_sources, playlist_items, media_progress** | SCI-01/02; application state machine; **media CRUD + playlist import + reordering + mixed-media course E2E** | Candidate apply & track loop + author builds mixed-media course |
| Phase 3 | Recruiter ATS, **institutional tenancy, licenses, batches, certificates, graduation** | scorecards, interviews, message_threads, messages, organization_memberships, **departments, batches, batch_memberships, institutional_licenses, license_assignments, institutional_certificates, student_consent_records** | Scorecard pipeline; interview state machine; Realtime ordering; **license lifecycle + bulk import + batch enrollment + certificate verification + graduation transition** | Two-sided recruiter-to-hire loop + institutional loop closes |
| Phase 4 | AI copilot, career path, **media enrichment, health monitoring** | ai_suggestions, ai_sessions, career_roadmaps, **media_health_checks, media_versions** | Multi-model router fallback; EU residency routing; PII redaction; **media health check + version history** | AI accuracy thresholds; media health dashboard live |
| Phase 5 | Stripe billing, entitlements, moderation, admin | subscriptions, entitlements, webhook_events, reports, moderation_actions, analytics_rollups | Webhook signature & idempotency; entitlement state machine; moderation SLA; 50k simulated users | Billing contract tests; moderation SLA dashboard |
| Phase 6 | SSO, agency, institutional cohorts, extension, i18n, **procurement, HRIS/SIS/LMS integrations, institutional SSO** | cohorts, cohort_members, agency_client_contracts, job_trackers, talent_pool, **purchase_requests, institutional_invoices** | Extension zero-exfiltration; FERPA consent; i18n snapshot; **purchase approval + PO invoicing + SSO federation** | Enterprise pilot fulfillment; security audit signed |

---

## 45. Deliverables & Definition of Done

### Definition of Ready (Feature Board)

- [ ] User story has clear acceptance criteria
- [ ] Dependencies identified and unblocked
- [ ] Design/UX approved (Aura tokens used)
- [ ] Data model impact assessed
- [ ] RLS impact assessed
- [ ] Accessibility impact assessed
- [ ] Analytics/telemetry events defined
- [ ] Security review completed
- [ ] Effort estimated (S/M/L)

### Definition of Done (Code Complete)

- [ ] Code implements acceptance criteria
- [ ] TypeScript strict passes
- [ ] Unit tests written and passing (≥80% for changed code)
- [ ] Integration test (RLS) written and passing
- [ ] E2E test updated (if journey changed)
- [ ] Accessibility scan passes (0 critical/serious)
- [ ] Documentation updated
- [ ] Feature flag added (if high-risk)
- [ ] Release notes & version summary entry added
- [ ] No secrets committed

---

## 46. Open Decisions Register

*(CONFIRMED OD-01..OD-13 and CF-11..CF-17 open conflicts retained. New decisions added below.)*

### New Open Decisions *(UPDATED)*

| ID | Decision | Current Status | Options | Recommended | Decision Needed |
|---|---|---|---|---|---|
| OD-14 | Video transcoding provider | NOT SPECIFIED | Mux vs. Cloudflare Stream vs. Supabase-native | Mux (developer experience, adaptive streaming) | Founder to select provider before Phase 2 media build |
| OD-15 | Institutional pricing model defaults | NOT SPECIFIED | Per-seat vs. per-course vs. subscription | Configurable volume-tier per-seat pricing | Founder to approve default tier structure |
| OD-16 | Institutional SSO timing | Phase 6 | Phase 3 vs. Phase 6 | Phase 6 (email invite + account match at Phase 3) | Confirm SSO phase placement |
| OD-17 | Media provider allowlist defaults | NOT SPECIFIED | All providers enabled vs. upload+YouTube only at MVP | Upload + YouTube at MVP; Vimeo Phase 2; others Phase 3+ | Confirm provider rollout sequence |
| OD-18 | Certificate validity period | NOT SPECIFIED | Perpetual vs. time-limited vs. configurable | Perpetual default; configurable per course | Confirm certificate validity policy |
| OD-19 | Institutional data retention beyond 7 years | NOT SPECIFIED | 7 years vs. 10 years vs. configurable | 7 years default (aligns with financial/legal) | Legal review |
| OD-20 | White-label institutional portals scope | Future | Full white-label vs. co-branded | Co-branded first (institution logo + colors); full white-label enterprise-only | Confirm white-label scope |
| OD-21 | Bulk import row limit | NOT SPECIFIED | 1,000 vs. 5,000 vs. 10,000 per import | 5,000 per import; chunked for larger | Confirm limit + chunking strategy |
| OD-22 | Media analytics provider attribution | NOT SPECIFIED | TalentSphere-tracked vs. provider-reported vs. hybrid | Hybrid with clear labeling | Confirm attribution model |
| OD-23 | Faculty certificate issuance permission | NOT SPECIFIED | IA-only vs. configurable per faculty | Configurable per faculty by IA | Confirm default |

### Retained Open Conflicts (CF-11..CF-15, CF-17)

| ID | Conflict | Options | Recommendation | Decision Needed |
|---|---|---|---|---|
| CF-11 | Free tier scope | (a) Full catalog free; (b) 5 free courses; (c) free browse + paid enroll | (b) | Define free-tier course limits |
| CF-12 | AI feature scope at MVP | (a) Heuristic only; (b) LLM beta 10%; (c) LLM all tiers | (a) heuristic at MVP | Confirm AI release timing |
| CF-13 | Candidate-to-employer ratio target | 20:1 vs. 50:1 vs. 100:1 | 20:1 at MVP | Set growth target composition |
| CF-14 | Enterprise contract billing | (a) Annual only; (b) monthly + annual discount; (c) hybrid | (c) | Confirm enterprise billing |
| CF-15 | Localization language priority | hi, es, de, fr, ar | hi + es first; English default/fallback | Confirm language priority |
| CF-17 | Gamification intensity | (a) XP+levels; (b) +leaderboards; (c) +badges+streaks | (c) post-MVP; (a) at MVP | Confirm gameplay scope |

---

## Appendix A: Requirement ID Inventory

*(Full inventory of all requirement ID families maintained. Key additions in this edition:)*

| Code Prefix | Count | Domain | Source |
|---|---|---|---|
| INST | 30 | Institutional Managed Learning | Module 22 (UPDATED) |
| MEDIA | 48 | Provider-Agnostic Media Engine | Module 23 (UPDATED) |
| BR (institutional) | BR-072..BR-082 | Institutional Business Rules | §12 (UPDATED) |
| BR (media) | BR-083..BR-090 | Media Business Rules | §12 (UPDATED) |
| EVT (institutional) | EVT-033..EVT-041 | Institutional Events | §39 (UPDATED) |
| EVT (media) | EVT-042..EVT-048 | Media Events | §39 (UPDATED) |
| MEC | MEC-01..MEC-10 | Media Edge Cases | §28 (UPDATED) |
| IEC | IEC-01..IEC-10 | Institutional Edge Cases | §28 (UPDATED) |
| RSK (institutional) | RSK-11..RSK-15 | Institutional Risks | §41 (UPDATED) |
| RSK (media) | RSK-16..RSK-20 | Media Risks | §41 (UPDATED) |
| OD (new) | OD-14..OD-23 | New Open Decisions | §46 (UPDATED) |
| F (new) | F-40..F-52 | New Features | §9 (UPDATED) |
| J (new) | J-12..J-16 | New Journeys | §14 (UPDATED) |
| WF (new) | WF-16..WF-23 | New Workflows | §14 (UPDATED) |
| ASM (new) | ASM-01..ASM-08 | Assumptions | §42 (UPDATED) |

*(All CONFIRMED baseline IDs retained: AUTH, PROFILE, RESUME, PORTFOLIO, ORG, JOB, RECRUIT, APPL, COURSE, LMS, CHALL, NET, MSG, GAMI/GAM, SEARCH/SRCH, NOTIF/NTF, BILL, TRUST/TRU, ADMIN/ADM, ANALYTICS/ANA, EXT, CORE, AI, F-01..F-39, NFR, BR-01..BR-071, WF-01..WF-15, J-1..J-11, CF, OD-01..OD-13, SEC, RSK-01..RSK-10, R-001..R-010, V-01..V-10, Q-01..Q-12, P-1..P-10, U-1..U-10, EVT-001..EVT-032, SCI-01..SCI-08, GAP-001..GAP-030, TD-01..TD-18, FC-01..FC-17, FR-01..FR-23, AU-01..AU-06, EC-01..EC-17, MVD-01..MVD-05, ADR-001..ADR-006, WOS, UOM, TIG, DEB, OSUX, WB, AUTO, HEAL, LIQ, DQ, AG, ZTR, SGC, RTD, SHEAL, CQA, FDR, SEQ, EVG, ASF, WOM, RG, TIT, AIE, SMR, PHS, RST, PED, IAB, OSX, HDN, FEC, SCOPE, DOR, VER, PROD, CON, WIT, UXC, ARCH, PERF, REG, AIQ, FAIR, DSR, L10N, A11Y, COST, CAP, EXP, SUP, DOC, VOC, TRC, ENG, DEBT, EML, CHAN, LMSG, IMP, PORT, IOP.)*

---

## Appendix B: Consolidation Summary

This edition consolidates the complete TalentSphere specification, integrating:

1. **Baseline platform** (CONFIRMED): 21 domain modules, 39 features, all requirement families, security architecture, testing strategy, deployment, observability.

2. **Institutional Course Licensing** (UPDATED): Full B2B managed-learning capability with 30 requirements (INST-001..INST-030), 4 new roles, seat/license management, bulk enrollment, batch assignment, institutional analytics, certificates, procurement, renewal, FERPA/GDPR compliance, and the B2B2C graduation flywheel.

3. **Provider-Agnostic Media Engine** (UPDATED): 48 requirements (MEDIA-001..MEDIA-048) replacing single-source video with a multi-provider media architecture supporting uploads, YouTube, Vimeo, and pluggable adapters, with playlist sync modes, media versioning, health monitoring, and unified content model.

4. **Cross-cutting improvements** (RECOMMENDED ADDITION): SEO requirements, media/institutional edge cases, media/institutional risks, new assumptions, new open decisions.

**Nothing has been deleted.** All CONFIRMED functionality is preserved. All new capabilities are clearly labeled UPDATED or RECOMMENDED ADDITION. All undecided items are flagged TBD / REQUIRES DECISION.

---

**End of TalentSphere Final Master Project & Product Specification**

*This document is the Single Source of Truth for product, design, development, QA, deployment, and future maintenance. All content is target-state specification; nothing described is implemented or verified until independently confirmed.*
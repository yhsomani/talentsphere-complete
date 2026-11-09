# TalentSphere — Master System Model (single authoritative Mermaid diagram)

**Repository:** https://github.com/yhsomani/talentsphere-complete  
**Branch:** `chatgpt/talentsphere-master-system-model`  
**Source branch inspected:** `main`  
**Prepared:** 2026-11-10  
**Authority:** This document is the consolidated visual model for the inspected implementation and canonical portfolio. It does not supersede the product authority of `SSOT.md`, nor turn requirements into implementation facts.

## 1. Evidence and status contract

This model is based on the current repository tree, `README.md`, `AGENTS.md`, `ARCHITECTURE.md`, `SSOT.md`, `docs/system-model/*`, the feature and business-rule registries, API contracts, database reference, migrations inventory, application router, API/server/storage/worker source, and test inventory.

Status vocabulary:

- **Implemented (bounded):** a specific behavior is present in inspected source. This is not a whole-feature or production-ready claim.
- **Partially implemented:** some paths exist, but one or more required workflows, policy checks, durable records, integrations or acceptance gates are incomplete.
- **Specified:** present in SSOT, registry or architecture target, not verified in runtime source.
- **Proposed:** recommended target architecture or control not present in current runtime.
- **Unresolved / unverified:** requires owner decision, live-provider evidence, target database evidence, operational evidence or additional source trace.

`DOCUMENTED ≠ IMPLEMENTED`; `IMPLEMENTED ≠ VERIFIED`; `VERIFIED ≠ PRODUCTION-READY`.

### Snapshot facts

- Public repository, default branch `main`; repository tree contained 1,143 tracked paths when inspected.
- Canonical feature registry contains 173 feature IDs; canonical business-rule registry contains 248 rules.
- The API contract inventory contains 277 unique literal `/api/v1` endpoint entries (inventory dated 2026-10-23; source may have changed since).
- Database reference enumerates 112 named table/entity references; 55 migration files were present at inspection.
- Open release issues found: #44 transactional email; #45 privacy/deletion/legal; #46 ADR-015 and hosted migration validation; #47 deployment/single-writer/worker/restore; #48 durable beta modules; #49 interview executor/trust/session architecture; #50 monetization/entitlement policy.
- The README says production readiness is not established.

## 2. Architecture facts and critical constraints

1. **Web:** React 19 + TypeScript + Vite + React Router PWA. The current route guard checks token presence only; server-side authentication, authorization and ownership remain authoritative.
2. **API:** Fastify 5 modular monolith; JSON HTTP under `/api/v1`; Zod contracts; domain rules in `packages/domain`; API handlers in `apps/api/src/server.ts` plus Stripe billing module.
3. **Authentication:** custom HMAC bearer sessions and PBKDF2 password hashing. Supabase Auth is not used. Deployed environments require stable private `TOKEN_SECRET`; revocation uses `revoked_sessions` and `sessionsValidAfter`.
4. **Persistence:** PostgreSQL via `pg`; ADR-015 persists core users/profiles/orgs/memberships/skills/jobs/applications/evidence/work history/references, messages and notifications. Maps remain a boot-hydrated read model. Dedicated SQL stores persist settings, erasure, saved jobs/searches, audit, flags and billing. Other modules retain in-memory state and can be lost on restart.
5. **Single writer:** current API uses a Postgres advisory lock and must run exactly one API process per database while core reads use in-memory Maps. Multi-replica scale-out requires moving reads to SQL or another approved consistent read model.
6. **Worker:** durable `background_jobs` claimed with `FOR UPDATE SKIP LOCKED`, leases, attempts, fencing and retry/dead-letter handling. Email job handlers exist for work-history verification and referee requests. Worker delivery is not evidence of mailbox delivery.
7. **Email:** provider-independent service and Brevo adapter exist. Live sending requires approved provider configuration, verified sender domain, credentials, integration and real mailbox proof. Dev outbox is not delivery.
8. **Billing:** Stripe gateway, Checkout, Portal, signed webhooks and durable billing reconciliation exist behind `BILLING_MODE=stripe`; default is disabled. Browser redirect is not proof of payment. Entitlements must be webhook-owned.
9. **AI:** current assistant uses local heuristics; no external model provider is connected. AI consent/quota/firewall/entitlement checks differ between routes and remain unresolved.
10. **Assessment:** challenge code evaluation is simulated; unsafe evaluation must not be introduced. Interview execution fails closed in deployed environments until a sandbox and scoring policy are approved.
11. **Privacy:** settings/export/erasure persistence exists, but immediate execute vs 30-day grace promise and scheduler/recovery/legal policy conflict.
12. **Hosting:** Coolify/Oracle deployment files and Supabase hosted DB instructions exist. Hosted migration compatibility, RLS/grants, deployment topology, backups and restore require target-environment proof.

## 3. One complete system diagram

The following is the **only Mermaid diagram in this document**. It intentionally includes the full 173-feature portfolio, 248 rule identities, mounted browser pages, endpoint inventory, data entities, explicit condition branches, core state flows, providers, worker, security, failure recovery, infrastructure and verification boundaries. Registry items marked specified are not evidence that they run.

```mermaid
flowchart LR
SYS["TalentSphere system model | current implementation + explicit target portfolio"]
FOUND["Evidence boundary: code and tests prove bounded implementation; registries/SSOT define intent; runtime and production evidence are separate"]
SYS --> FOUND
subgraph ACTORS["01 Users and authority"]
CAND(["Candidate / learner"])
RECR(["Recruiter / employer member"])
HM(["Hiring manager"])
INST(["Institution administrator / faculty / learner"])
REF(["External referee"])
ADMIN(["Platform administrator"])
ANON(["Anonymous visitor"])
SVC(["API / worker service identity"])
end
subgraph ENTRY["02 Browser application and entry points"]
PWA["React 19 + TypeScript + Vite PWA shell; React Router; design system tokens"]
LAYOUT["Layout / navigation / command palette / notices / route error boundary"]
SESSION["SessionProvider + browser token helper; localStorage bearer session"]
PUBLIC["Public pages: landing, login, signup, job browse/detail, reference, proof verify, checkout shell, privacy, terms"]
CANDP["Candidate pages: dashboard, profile, applications, evidence, assessments, career, learning, course, portfolio, resumes, network"]
RECRP["Recruiter pages: hiring workspace, hiring job, job/application review"]
SHARED["Shared pages: messages, conversation, notifications, settings, admin, not-found"]
UISTATE["Loading / empty / validation / success / failure / retry / offline-not-supported states"]
PWA --> LAYOUT --> SESSION
SESSION --> PUBLIC
SESSION --> CANDP
SESSION --> RECRP
SESSION --> SHARED
PUBLIC --> UISTATE
CANDP --> UISTATE
RECRP --> UISTATE
SHARED --> UISTATE
end
ANON --> PUBLIC
CAND --> CANDP
RECR --> RECRP
HM --> RECRP
INST --> CANDP
REF --> PUBLIC
ADMIN --> SHARED
subgraph NAV["03 Mounted browser routes and screen-to-feature entry"]
PG_0["/ → LandingPage"]
LAYOUT --> PG_0
PG_1["/login → LoginPage"]
LAYOUT --> PG_1
PG_2["/signup → SignUpPage"]
LAYOUT --> PG_2
PG_3["/checkout → CheckoutPage"]
LAYOUT --> PG_3
PG_4["/jobs → JobsPage"]
LAYOUT --> PG_4
PG_5["/jobs/:id → JobDetailPage"]
LAYOUT --> PG_5
PG_6["/reference/:id → ReferencePage"]
LAYOUT --> PG_6
PG_7["/verify/:hash → VerifyPage"]
LAYOUT --> PG_7
PG_8["/dashboard → DashboardPage"]
LAYOUT --> PG_8
PG_9["/applications → ApplicationsPage"]
LAYOUT --> PG_9
PG_10["/evidence → EvidencePage"]
LAYOUT --> PG_10
PG_11["/assessments → AssessmentsPage"]
LAYOUT --> PG_11
PG_12["/profile → ProfilePage"]
LAYOUT --> PG_12
PG_13["/settings → SettingsPage"]
LAYOUT --> PG_13
PG_14["/portfolio → PortfolioPage"]
LAYOUT --> PG_14
PG_15["/resumes → ResumesPage"]
LAYOUT --> PG_15
PG_16["/network → NetworkPage"]
LAYOUT --> PG_16
PG_17["/learning → LearningPage"]
LAYOUT --> PG_17
PG_18["/learning/:id → CoursePage"]
LAYOUT --> PG_18
PG_19["/career → CareerPage"]
LAYOUT --> PG_19
PG_20["/notifications → NotificationsPage"]
LAYOUT --> PG_20
PG_21["/messages → MessagesPage"]
LAYOUT --> PG_21
PG_22["/messages/:id → ConversationPage"]
LAYOUT --> PG_22
PG_23["/hiring → HiringPage"]
LAYOUT --> PG_23
PG_24["/hiring/jobs/:id → HiringJobPage"]
LAYOUT --> PG_24
PG_25["/admin → AdminPage"]
LAYOUT --> PG_25
PG_26["/privacy → PrivacyPage"]
LAYOUT --> PG_26
PG_27["/terms → TermsPage"]
LAYOUT --> PG_27
PG_28["* → NotFoundPage"]
LAYOUT --> PG_28
PLANNED["Planned routes only: institution, social feed, course marketplace, teaching, recruiter search, advanced career and OS workbench"]
SYS -.-> PLANNED
end
subgraph FEATURESET["04 Canonical 173-feature portfolio | registry identity; not proof of implementation"]
subgraph FC_IDENTITY["Identity capabilities"]
F_F_01["F-01 Authentication & Session P10 Ph0"]
F_F_01 -.-> MOD_IDENTITY
F_F_12["F-12 Profile Management P10 Ph0"]
F_F_12 -.-> MOD_IDENTITY
F_F_13["F-13 Resume Builder P7 Ph1"]
F_F_13 -.-> MOD_GOVERNANCE
F_F_26["F-26 Portfolio Showcase P8 Ph1"]
F_F_26 -.-> MOD_GOVERNANCE
end
subgraph FC_SHELL["Shell capabilities"]
F_F_02["F-02 Landing Page P3 Ph0"]
F_F_02 -.-> MOD_GOVERNANCE
F_F_03["F-03 Dashboard (Role-Adaptive) P10 Ph0"]
F_F_03 -.-> MOD_GOVERNANCE
F_F_15["F-15 Settings P10 Ph0"]
F_F_15 -.-> MOD_GOVERNANCE
F_F_20["F-20 Command Search (⌘K) P7 Ph2"]
F_F_20 -.-> MOD_SEARCH
F_F_21["F-21 Error Recovery & Resilience P10 Ph0"]
F_F_21 -.-> MOD_GOVERNANCE
end
subgraph FC_MARKETPLACE["Marketplace capabilities"]
F_F_04["F-04 Job Marketplace P9 Ph2"]
F_F_04 -.-> MOD_JOBS
F_F_05["F-05 Post Job Studio P8 Ph2"]
F_F_05 -.-> MOD_JOBS
F_F_25["F-25 Job Detail View P7 Ph2"]
F_F_25 -.-> MOD_JOBS
end
subgraph FC_RECRUITING["Recruiting capabilities"]
F_F_06["F-06 ATS / Candidate Pipeline P9 Ph2–3"]
F_F_06 -.-> MOD_GOVERNANCE
F_F_37["F-37 Job Templates P6 Ph2"]
F_F_37 -.-> MOD_JOBS
F_F_56["F-56 Organization & Institution Pages P5 Ph8"]
F_F_56 -.-> MOD_JOBS
F_F_59["F-59 Outreach Credits (TalentMail) P5 Ph8"]
F_F_59 -.-> MOD_INTELLIGENCE
F_F_92["F-92 Advanced Recruiter Search P9 Ph3"]
F_F_92 -.-> MOD_JOBS
F_F_102["F-102 Hiring Manager Portal P8 Ph3"]
F_F_102 -.-> MOD_JOBS
F_F_103["F-103 Candidate Comparison & Rubric P6 Ph3"]
F_F_103 -.-> MOD_GOVERNANCE
F_F_113["F-113 Recruiter Outreach Analytics P6 Ph8"]
F_F_113 -.-> MOD_JOBS
F_F_158["F-158 Talent Pool Intelligence & Analytics P6 Ph3"]
F_F_158 -.-> MOD_INTELLIGENCE
end
subgraph FC_LEARNING["Learning capabilities"]
F_F_07["F-07 Learning Management System P9 Ph1"]
F_F_07 -.-> MOD_LEARNING
F_F_44["F-44 AI Media Enrichment P6 Ph4"]
F_F_44 -.-> MOD_AI
F_F_45["F-45 Proctoring (Third-Party, vendor-gated OD-35) P4 Ph10"]
F_F_45 -.-> MOD_GOVERNANCE
F_F_66["F-66 Course Creation Studio P8 Ph7"]
F_F_66 -.-> MOD_LEARNING
F_F_67["F-67 Categories, Discovery & Comparison P6 Ph7"]
F_F_67 -.-> MOD_SEARCH
F_F_68["F-68 Quizzes, Practice Tests & Final Exams P8 Ph7"]
F_F_68 -.-> MOD_ASSESSMENT
F_F_69["F-69 Assignments & Peer Review P8 Ph7"]
F_F_69 -.-> MOD_GOVERNANCE
F_F_70["F-70 Learning Paths, Programs & Specializations P8 Ph7"]
F_F_70 -.-> MOD_LEARNING
F_F_71["F-71 Course Q&A, Discussions, Notes P6 Ph7"]
F_F_71 -.-> MOD_LEARNING
F_F_72["F-72 Course Reviews & Ratings P6 Ph7"]
F_F_72 -.-> MOD_LEARNING
F_F_73["F-73 Course Commerce P6 Ph7"]
F_F_73 -.-> MOD_LEARNING
F_F_74["F-74 Instructor Platform P6 Ph7"]
F_F_74 -.-> MOD_LEARNING
F_F_78["F-78 Practice Sets & Interview Prep P5 Ph9"]
F_F_78 -.-> MOD_ASSESSMENT
F_F_100["F-100 Peer Project Collaboration P4 Ph5"]
F_F_100 -.-> MOD_GOVERNANCE
F_F_106["F-106 Skill Prerequisite Engine P7 Ph5"]
F_F_106 -.-> MOD_EVIDENCE
F_F_107["F-107 Live Q&A with Instructors P6 Ph5"]
F_F_107 -.-> MOD_LEARNING
F_F_111["F-111 Industry-Specific Learning Hubs P4 Ph8"]
F_F_111 -.-> MOD_LEARNING
F_F_124["F-124 Project Marketplace P5 Ph5"]
F_F_124 -.-> MOD_GOVERNANCE
F_F_129["F-129 Leadership Development P3 Ph5"]
F_F_129 -.-> MOD_GOVERNANCE
F_F_132["F-132 Scholarship Discovery P3 Ph6"]
F_F_132 -.-> MOD_SEARCH
F_F_136["F-136 Micro-Learning P2 Ph4"]
F_F_136 -.-> MOD_LEARNING
F_F_137["F-137 Spaced Repetition P2 Ph6"]
F_F_137 -.-> MOD_GOVERNANCE
F_F_138["F-138 Study Accountability Partners P3 Ph6"]
F_F_138 -.-> MOD_IDENTITY
F_F_157["F-157 Skills Co-Learning Path Optimizer P4 Ph5"]
F_F_157 -.-> MOD_EVIDENCE
end
subgraph FC_ASSESSMENT["Assessment capabilities"]
F_F_08["F-08 Challenges Arena P9 Ph1"]
F_F_08 -.-> MOD_ASSESSMENT
F_F_76["F-76 Coding Contests & Live Leaderboards P5 Ph9"]
F_F_76 -.-> MOD_GOVERNANCE
F_F_77["F-77 Skill Certification Exams P8 Ph3"]
F_F_77 -.-> MOD_EVIDENCE
F_F_115["F-115 Certification Exam Platform P9 Ph3"]
F_F_115 -.-> MOD_ASSESSMENT
end
subgraph FC_SOCIAL["Social capabilities"]
F_F_09["F-09 Professional Networking P8 Ph2"]
F_F_09 -.-> MOD_NETWORK
end
subgraph FC_COMMUNICATION["Communication capabilities"]
F_F_10["F-10 Direct Messaging P10 Ph0"]
F_F_10 -.-> MOD_GOVERNANCE
F_F_14["F-14 Notification Center P10 Ph0"]
F_F_14 -.-> MOD_COMMUNICATION
F_F_29["F-29 Scheduled Notification Digest P7 Ph2"]
F_F_29 -.-> MOD_COMMUNICATION
F_F_33["F-33 Video Interview Rooms P8 Ph3"]
F_F_33 -.-> MOD_ASSESSMENT
F_F_38["F-38 Legacy Chat Service (DEPRECATED) P0 – deprecated/not recommended"]
F_F_38 -.-> MOD_GOVERNANCE
end
subgraph FC_AI["AI capabilities"]
F_F_11["F-11 AI Career Assistant (Basic) P8 Ph1/Ph4"]
F_F_11 -.-> MOD_INTELLIGENCE
F_F_99["F-99 AI Career Coach (Enhanced) P7 Ph4"]
F_F_99 -.-> MOD_INTELLIGENCE
end
subgraph FC_MONETIZATION["Monetization capabilities"]
F_F_16["F-16 Billing & Subscriptions P7 Ph5"]
F_F_16 -.-> MOD_BILLING
end
subgraph FC_GOVERNANCE["Governance capabilities"]
F_F_17["F-17 Admin Console P10 Ph0"]
F_F_17 -.-> MOD_GOVERNANCE
end
subgraph FC_EDGE["Edge capabilities"]
F_F_18["F-18 Chrome Extension Companion P5 Ph2"]
F_F_18 -.-> MOD_GOVERNANCE
F_F_27["F-27 Local Resume Match Preview P6 Ph2"]
F_F_27 -.-> MOD_GOVERNANCE
F_F_28["F-28 External Job Page Scanner P6 Ph2"]
F_F_28 -.-> MOD_JOBS
end
subgraph FC_TELEMETRY["Telemetry capabilities"]
F_F_19["F-19 Product Analytics P7 Ph1"]
F_F_19 -.-> MOD_GOVERNANCE
end
subgraph FC_ENGAGEMENT["Engagement capabilities"]
F_F_22["F-22 Gamification & XP Ledger P8 Ph1"]
F_F_22 -.-> MOD_COMMUNITY
F_F_23["F-23 Leaderboard & Badges P7 Ph2"]
F_F_23 -.-> MOD_COMMUNITY
F_F_30["F-30 Networking Stale-Request Nudges P6 Ph2"]
F_F_30 -.-> MOD_NETWORK
end
subgraph FC_SAFETY["Safety capabilities"]
F_F_24["F-24 Trust, Safety & Moderation P8 Ph2"]
F_F_24 -.-> MOD_GOVERNANCE
end
subgraph FC_ANALYTICS["Analytics capabilities"]
F_F_31["F-31 KPI Aggregation & Rollups P6 Ph2"]
F_F_31 -.-> MOD_GOVERNANCE
F_F_82["F-82 Student Learning Analytics P6 Ph7"]
F_F_82 -.-> MOD_LEARNING
F_F_105["F-105 Post-Hire Analytics & ROI Tracking P4 Ph4"]
F_F_105 -.-> MOD_GOVERNANCE
F_F_114["F-114 Learning Impact Tracking P9 Ph4"]
F_F_114 -.-> MOD_LEARNING
F_F_160["F-160 Talent Segmentation & Classification P5 Ph4"]
F_F_160 -.-> MOD_INTELLIGENCE
F_F_165["F-165 Diversity, Equity & Inclusion Data System P3 Ph8"]
F_F_165 -.-> MOD_GOVERNANCE
F_F_166["F-166 Interview Performance Benchmarking P5 Ph4"]
F_F_166 -.-> MOD_ASSESSMENT
F_F_168["F-168 Hiring Prediction & Success Modeling P3 Ph5"]
F_F_168 -.-> MOD_JOBS
F_F_172["F-172 Advanced Compensation Intelligence P4 Ph8"]
F_F_172 -.-> MOD_GOVERNANCE
end
subgraph FC_CANDIDATE["Candidate capabilities"]
F_F_32["F-32 Saved Searches & Job Alerts P7 Ph2"]
F_F_32 -.-> MOD_JOBS
F_F_36["F-36 Application Draft Autosave P7 Ph1"]
F_F_36 -.-> MOD_JOBS
F_F_87["F-87 Interview Experience Repository P7 Ph4"]
F_F_87 -.-> MOD_ASSESSMENT
F_F_112["F-112 Resume Parsing & Optimization P6 Ph8"]
F_F_112 -.-> MOD_GOVERNANCE
F_F_117["F-117 Mobile-First Job Application P5 Ph8"]
F_F_117 -.-> MOD_JOBS
end
subgraph FC_PLATFORM["Platform capabilities"]
F_F_34["F-34 Multi-Entity Backend Search P7 Ph2"]
F_F_34 -.-> MOD_SEARCH
F_F_39["F-39 Unified Backend Stub (DEPRECATED) P0 – deprecated/not recommended"]
F_F_39 -.-> MOD_GOVERNANCE
F_F_42["F-42 Provider-Agnostic Media Engine P8 Ph2"]
F_F_42 -.-> MOD_GOVERNANCE
F_F_51["F-51 Media Health Monitoring P6 Ph4"]
F_F_51 -.-> MOD_GOVERNANCE
F_F_84["F-84 Skills Graph & Taxonomy P10 Ph1–2"]
F_F_84 -.-> MOD_EVIDENCE
F_F_116["F-116 Accessibility & Inclusive Learning P7 Ph8"]
F_F_116 -.-> MOD_LEARNING
F_F_120["F-120 API & Integration Platform P2 Ph10"]
F_F_120 -.-> MOD_GOVERNANCE
F_F_144["F-144 Reputation Engine (multi-context) P9 Ph2"]
F_F_144 -.-> MOD_COMMUNITY
F_F_145["F-145 Recommendation Engine Core P8 Ph2–3"]
F_F_145 -.-> MOD_INTELLIGENCE
F_F_146["F-146 Activity & Contribution Tracking P7 Ph3"]
F_F_146 -.-> MOD_COMMUNITY
F_F_147["F-147 Unified Search & Discovery P8 Ph2"]
F_F_147 -.-> MOD_SEARCH
end
subgraph FC_ADMINISTRATION["Administration capabilities"]
F_F_35["F-35 Feature Flag Console P6 Ph2"]
F_F_35 -.-> MOD_GOVERNANCE
F_F_83["F-83 Admin Platform Expansion P3 Ph8"]
F_F_83 -.-> MOD_COMMUNITY
end
subgraph FC_INSTITUTIONS["Institutions capabilities"]
F_F_40["F-40 Institutional Managed Learning P8 Ph3"]
F_F_40 -.-> MOD_LEARNING
F_F_41["F-41 Procurement & Seat Licensing P6 Ph6"]
F_F_41 -.-> MOD_GOVERNANCE
F_F_43["F-43 B2B2C Graduation Flywheel P6 Ph3"]
F_F_43 -.-> MOD_GOVERNANCE
F_F_46["F-46 Institutional Analytics P6 Ph3"]
F_F_46 -.-> MOD_GOVERNANCE
F_F_47["F-47 Faculty Dashboard P6 Ph3"]
F_F_47 -.-> MOD_GOVERNANCE
F_F_50["F-50 Institutional Course Marketplace P6 Ph3"]
F_F_50 -.-> MOD_LEARNING
end
subgraph FC_OS["OS capabilities"]
F_F_48["F-48 OS Shell & Workbench P4 Ph2+"]
F_F_48 -.-> MOD_GOVERNANCE
F_F_49["F-49 Automation & Agents P4 Ph3+"]
F_F_49 -.-> MOD_GOVERNANCE
end
subgraph FC_VERIFICATION["Verification capabilities"]
F_F_52["F-52 Certificate Verification P8 Ph3"]
F_F_52 -.-> MOD_EVIDENCE
F_F_81["F-81 Identity Verification P3 Ph9"]
F_F_81 -.-> MOD_IDENTITY
F_F_89["F-89 Contribution Verification System P5 Ph8"]
F_F_89 -.-> MOD_EVIDENCE
F_F_94["F-94 Verified Work History & References P7 Ph3"]
F_F_94 -.-> MOD_EVIDENCE
F_F_96["F-96 Skill Evidence & Digital Credentials P10 Ph2"]
F_F_96 -.-> MOD_EVIDENCE
F_F_110["F-110 Verified Skill Endorsements P7 Ph8"]
F_F_110 -.-> MOD_EVIDENCE
F_F_123["F-123 Skill Decay Tracking (Freshness Engine) P9 Ph3"]
F_F_123 -.-> MOD_EVIDENCE
F_F_162["F-162 Verified Work History Network & Graph P5 Ph4"]
F_F_162 -.-> MOD_EVIDENCE
end
subgraph FC_NETWORKING["Networking capabilities"]
F_F_53["F-53 Professional Social Graph & Feed P5 Ph8"]
F_F_53 -.-> MOD_GOVERNANCE
F_F_54["F-54 Content Publishing P5 Ph8"]
F_F_54 -.-> MOD_GOVERNANCE
F_F_58["F-58 Written Recommendations P6 Ph8"]
F_F_58 -.-> MOD_INTELLIGENCE
F_F_60["F-60 Profile Views & Privacy Controls P6 Ph8"]
F_F_60 -.-> MOD_IDENTITY
F_F_79["F-79 Articles & Newsletters P5 Ph8"]
F_F_79 -.-> MOD_GOVERNANCE
F_F_108["F-108 Expert Network Matching P4 Ph7"]
F_F_108 -.-> MOD_NETWORK
F_F_121["F-121 Warm Introduction Paths P8 Ph4"]
F_F_121 -.-> MOD_NETWORK
F_F_125["F-125 Alumni Networks P7 Ph4"]
F_F_125 -.-> MOD_NETWORK
F_F_139["F-139 Local Communities & Meetups P3 Ph7"]
F_F_139 -.-> MOD_GOVERNANCE
end
subgraph FC_COMMUNITY["Community capabilities"]
F_F_55["F-55 Groups & Communities P5 Ph8"]
F_F_55 -.-> MOD_GOVERNANCE
F_F_57["F-57 Events & Webinars P5 Ph8"]
F_F_57 -.-> MOD_GOVERNANCE
F_F_90["F-90 Peer Mentorship & Advisor Network P5 Ph4"]
F_F_90 -.-> MOD_NETWORK
F_F_133["F-133 Volunteer Matching P2 Ph7"]
F_F_133 -.-> MOD_GOVERNANCE
F_F_140["F-140 Affinity Groups P3 Ph7"]
F_F_140 -.-> MOD_GOVERNANCE
F_F_169["F-169 Community Contribution Scoring & Recognition P5 Ph7"]
F_F_169 -.-> MOD_COMMUNITY
F_F_170["F-170 Expert Network (Enhanced) P4 Ph7"]
F_F_170 -.-> MOD_NETWORK
end
subgraph FC_BUSINESS["Business capabilities"]
F_F_61["F-61 Premium Candidate Tier (OD-34 gated) P4 Ph10+"]
F_F_61 -.-> MOD_GOVERNANCE
F_F_62["F-62 Sponsored Content (NOT RECOMMENDED) P0 Ph10+ deprecated/not recommended"]
F_F_62 -.-> MOD_INTELLIGENCE
end
subgraph FC_INTELLIGENCE["Intelligence capabilities"]
F_F_63["F-63 Business-Development Graph (NOT RECOMMENDED) P0 Ph10+ deprecated/not recommended"]
F_F_63 -.-> MOD_INTELLIGENCE
F_F_75["F-75 Employer Insights P7 Ph9"]
F_F_75 -.-> MOD_GOVERNANCE
F_F_85["F-85 Career Graph & Progression P9 Ph3"]
F_F_85 -.-> MOD_INTELLIGENCE
F_F_86["F-86 Salary Intelligence P9 Ph3"]
F_F_86 -.-> MOD_INTELLIGENCE
F_F_97["F-97 Real-Time Job Market Analytics P5 Ph4"]
F_F_97 -.-> MOD_JOBS
F_F_98["F-98 Employer Equity & Compensation Intelligence P7 Ph3"]
F_F_98 -.-> MOD_GOVERNANCE
F_F_118["F-118 Emerging Skills Detection P4 Ph8"]
F_F_118 -.-> MOD_EVIDENCE
F_F_151["F-151 Skill Supply/Demand Forecasting P7 Ph4"]
F_F_151 -.-> MOD_EVIDENCE
F_F_152["F-152 Career Trajectory Analysis P7 Ph4"]
F_F_152 -.-> MOD_INTELLIGENCE
F_F_153["F-153 Learning Impact Dashboard (Enhanced) P7 Ph4"]
F_F_153 -.-> MOD_LEARNING
F_F_154["F-154 Interview Prediction & Benchmarking P6 Ph4"]
F_F_154 -.-> MOD_ASSESSMENT
F_F_173["F-173 Company-to-Skills Mapping P3 Ph4"]
F_F_173 -.-> MOD_EVIDENCE
end
subgraph FC_INTEGRATION["Integration capabilities"]
F_F_64["F-64 LinkedIn Migration Engine P5 Ph1/2"]
F_F_64 -.-> MOD_GOVERNANCE
end
subgraph FC_FOUNDATION["Foundation capabilities"]
F_F_65["F-65 LinkedIn Decoupling & Independence P8 Ph1/2"]
F_F_65 -.-> MOD_GOVERNANCE
end
subgraph FC_PROFILE["Profile capabilities"]
F_F_80["F-80 Profile Enhancements P6 Ph1/Ph8"]
F_F_80 -.-> MOD_IDENTITY
end
subgraph FC_HIRING["Hiring capabilities"]
F_F_88["F-88 Technical Interview Platform P9 Ph3"]
F_F_88 -.-> MOD_ASSESSMENT
F_F_93["F-93 Interview Video Recording & AI Feedback P7 Ph4"]
F_F_93 -.-> MOD_ASSESSMENT
F_F_104["F-104 Pre-Hire Assessment Customization P7 Ph3"]
F_F_104 -.-> MOD_ASSESSMENT
F_F_119["F-119 Diversity & Inclusion Analytics P4 Ph8"]
F_F_119 -.-> MOD_GOVERNANCE
F_F_167["F-167 Candidate Comparison & Rubric (Enhanced) P5 Ph3"]
F_F_167 -.-> MOD_GOVERNANCE
end
subgraph FC_CAREER["Career capabilities"]
F_F_91["F-91 Career Readiness Assessment P9 Ph2"]
F_F_91 -.-> MOD_ASSESSMENT
F_F_95["F-95 Career Transition Planning P7 Ph4"]
F_F_95 -.-> MOD_INTELLIGENCE
F_F_109["F-109 Salary Negotiation Guidance P5 Ph8"]
F_F_109 -.-> MOD_INTELLIGENCE
F_F_156["F-156 Professional Development Plan System P6 Ph4–5"]
F_F_156 -.-> MOD_GOVERNANCE
end
subgraph FC_GAMIFICATION["Gamification capabilities"]
F_F_101["F-101 Badge Marketplace & Recognition P4 Ph8"]
F_F_101 -.-> MOD_COMMUNITY
end
subgraph FC_JOBS["Jobs capabilities"]
F_F_122["F-122 Application Feedback Loop P9 Ph3"]
F_F_122 -.-> MOD_JOBS
F_F_130["F-130 Freelance Marketplace P3 Ph7"]
F_F_130 -.-> MOD_GOVERNANCE
F_F_131["F-131 Apprenticeship Matching P3 Ph6"]
F_F_131 -.-> MOD_GOVERNANCE
F_F_142["F-142 Referral Request System P8 Ph4"]
F_F_142 -.-> MOD_NETWORK
end
subgraph FC_CAREERS["Careers capabilities"]
F_F_126["F-126 Interview Prep Marketplace P5 Ph4"]
F_F_126 -.-> MOD_ASSESSMENT
F_F_128["F-128 Offer Comparison Tool P7 Ph4"]
F_F_128 -.-> MOD_GOVERNANCE
F_F_141["F-141 Onboarding Preparation P1 Ph8"]
F_F_141 -.-> MOD_GOVERNANCE
end
subgraph FC_COMPANIES["Companies capabilities"]
F_F_127["F-127 Company Culture Assessment P4 Ph5"]
F_F_127 -.-> MOD_ASSESSMENT
end
subgraph FC_SKILLS["Skills capabilities"]
F_F_134["F-134 Code Review Practice P4 Ph5"]
F_F_134 -.-> MOD_GOVERNANCE
F_F_135["F-135 System Design Practice P4 Ph5"]
F_F_135 -.-> MOD_GOVERNANCE
end
subgraph FC_PORTFOLIO["Portfolio capabilities"]
F_F_143["F-143 OSS Contribution Discovery P4 Ph8"]
F_F_143 -.-> MOD_COMMUNITY
end
subgraph FC_REPUTATION["Reputation capabilities"]
F_F_148["F-148 Instructor Reputation System P8 Ph7"]
F_F_148 -.-> MOD_LEARNING
F_F_149["F-149 Employer Reputation & Brand System P7 Ph8"]
F_F_149 -.-> MOD_COMMUNITY
F_F_150["F-150 Peer Credibility Networks P7 Ph8"]
F_F_150 -.-> MOD_NETWORK
end
subgraph FC_PERSONALIZATION["Personalization capabilities"]
F_F_155["F-155 Adaptive Learning System P6 Ph5"]
F_F_155 -.-> MOD_LEARNING
end
subgraph FC_DISCOVERY["Discovery capabilities"]
F_F_159["F-159 Behavioral Talent Discovery P6 Ph4"]
F_F_159 -.-> MOD_INTELLIGENCE
end
subgraph FC_ENTERPRISE["Enterprise capabilities"]
F_F_161["F-161 Internal Mobility & Succession Platform P3 Ph6–7"]
F_F_161 -.-> MOD_GOVERNANCE
end
subgraph FC_CREDENTIAL["Credential capabilities"]
F_F_163["F-163 Credential Wallet & Portability P3 Ph5"]
F_F_163 -.-> MOD_EVIDENCE
F_F_164["F-164 Skills Evidence Narrative & Storytelling P4 Ph5"]
F_F_164 -.-> MOD_EVIDENCE
end
subgraph FC_COMPANY["Company capabilities"]
F_F_171["F-171 Employer Brand Management System P3 Ph8"]
F_F_171 -.-> MOD_GOVERNANCE
end
end
subgraph CORELOOP["05 Product outcome and core career loop"]
GOAL["Goal / target role / career intent"]
GAP["Gap analysis from profile, skills and evidence"]
LEARN["Learn: course / lesson / path"]
PRACTICE["Practice: challenge / assessment / interview prep"]
PROVE["Prove: project / resume / portfolio / work history"]
VERIFY["Verify: referee / credential / skill endorsement"]
DISCOVER["Discover: search / recommendations / recruiter discovery"]
MATCH["Match: eligibility / skill / role / job requirements"]
APPLY["Apply: application / evidence snapshot"]
INTERVIEW["Interview: assessment / human scorecard / feedback"]
OUTCOME["Outcome: decision / offer / hire / rejection / withdrawal"]
NEW_EVIDENCE["New evidence / career graph update / next goal"]
GOAL --> GAP --> LEARN --> PRACTICE --> PROVE --> VERIFY --> DISCOVER --> MATCH --> APPLY --> INTERVIEW --> OUTCOME --> NEW_EVIDENCE --> GOAL
end
F_03 -.-> GOAL
F_07 -.-> LEARN
F_08 -.-> PRACTICE
F_96 -.-> VERIFY
F_04 -.-> DISCOVER
F_06 -.-> INTERVIEW
subgraph DOMAINS["06 Backend bounded contexts and domain services"]
MOD_IDENTITY["IDENTITY: auth, profile, sessions, account lifecycle"]
MOD_EVIDENCE["EVIDENCE: skills, evidence, work history, credentials, freshness"]
MOD_JOBS["JOBS: organizations, jobs, applications, feedback, templates, saved jobs"]
MOD_LEARNING["LEARNING: courses, modules, lessons, enrollments, learning impact"]
MOD_ASSESSMENT["ASSESSMENT: challenges, exams, interviews, scorecards"]
MOD_NETWORK["NETWORK: connections, messaging, warm introductions, referrals, alumni"]
MOD_INTELLIGENCE["INTELLIGENCE: career, salary, forecasts, recommendations, talent pools, segmentation"]
MOD_COMMUNITY["COMMUNITY: activity, reputation, endorsements, gamification"]
MOD_COMMUNICATION["COMMUNICATION: notifications, email delivery"]
MOD_GOVERNANCE["GOVERNANCE: admin, moderation, settings, privacy, exports, erasure"]
MOD_BILLING["BILLING: plans, subscriptions, invoices, entitlements, Stripe"]
MOD_SEARCH["SEARCH: search, autocomplete, saved searches, alerts"]
MOD_AI["AI: assistant, conversations, policy, quota"]
DOM_POLICY["Cross-cutting domain policy: ownership, role checks, state machines, consent, idempotency, limits, provenance"]
DOM_ERROR["DomainError taxonomy: validation, unauthenticated, forbidden, not found, conflict, payment required, unavailable"]
DOM_POLICY --> DOM_ERROR
end
MOD_IDENTITY --> API_ROUTER
MOD_EVIDENCE --> API_ROUTER
MOD_JOBS --> API_ROUTER
MOD_LEARNING --> API_ROUTER
MOD_ASSESSMENT --> API_ROUTER
MOD_NETWORK --> API_ROUTER
MOD_INTELLIGENCE --> API_ROUTER
MOD_COMMUNITY --> API_ROUTER
MOD_COMMUNICATION --> API_ROUTER
MOD_GOVERNANCE --> API_ROUTER
MOD_BILLING --> API_ROUTER
MOD_SEARCH --> API_ROUTER
MOD_AI --> API_ROUTER
subgraph API_LAYER["07 API transport and request processing"]
API_ROUTER["Fastify 5 modular monolith | /api/v1 | 278 documented unique endpoint registrations (2026-10-23 inventory)"]
API_MW["CORS / trusted proxy / global rate limit / request ID / structured logger / raw-body webhook capture"]
API_AUTH{"Bearer HMAC token valid, unrevoked, account active and route policy satisfied?"}
API_SCHEMA{"Zod request schema passes field, type, length and enum constraints?"}
API_HANDLER["Feature route handler: authenticate → authorize → validate → domain operation → storage/provider → response"]
API_ERR["HTTP error envelope: 400 / 401 / 403 / 404 / 409 / 422 / 402 / 429 / 503"]
API_OK(["HTTP JSON response + request ID + durability header where applicable"])
API_ROUTER --> API_MW --> API_AUTH
API_AUTH -->|TRUE| API_SCHEMA
API_AUTH -->|FALSE 401 or 403| API_ERR
API_SCHEMA -->|TRUE| API_HANDLER
API_SCHEMA -->|FALSE 400| API_ERR
API_HANDLER -->|success| API_OK
API_HANDLER -->|domain or infrastructure failure| API_ERR
end
PWA -->|fetch JSON /api/v1; Authorization Bearer| API_ROUTER
subgraph ROUTES["08 Endpoint inventory | route nodes grouped by API domain"]
subgraph RG_HEALTH["health routes"]
EP_0["GET /api/v1/health"]
EP_0 --> API_HANDLER
end
subgraph RG_FEATURE_FLAGS["feature-flags routes"]
EP_1["GET /api/v1/feature-flags"]
EP_1 --> API_HANDLER
end
subgraph RG_AUTH["auth routes"]
EP_2["POST /api/v1/auth/register"]
EP_2 --> API_HANDLER
EP_3["POST /api/v1/auth/login"]
EP_3 --> API_HANDLER
EP_4["POST /api/v1/auth/password"]
EP_4 --> API_HANDLER
EP_5["POST /api/v1/auth/sign-out"]
EP_5 --> API_HANDLER
EP_6["POST /api/v1/auth/sign-out-others"]
EP_6 --> API_HANDLER
EP_7["GET /api/v1/auth/session"]
EP_7 --> API_HANDLER
end
subgraph RG_PROFILE["profile routes"]
EP_8["GET /api/v1/profile/me"]
EP_8 --> API_HANDLER
EP_9["PATCH /api/v1/profile/me"]
EP_9 --> API_HANDLER
EP_10["GET /api/v1/profile/:id"]
EP_10 --> API_HANDLER
end
subgraph RG_EVIDENCE["evidence routes"]
EP_11["POST /api/v1/evidence"]
EP_11 --> API_HANDLER
EP_12["GET /api/v1/evidence/:id"]
EP_12 --> API_HANDLER
EP_13["GET /api/v1/evidence/mine"]
EP_13 --> API_HANDLER
EP_14["GET /api/v1/evidence/subject/:subjectId"]
EP_14 --> API_HANDLER
EP_15["POST /api/v1/evidence/:id/verify"]
EP_15 --> API_HANDLER
EP_16["POST /api/v1/evidence/:id/dispute"]
EP_16 --> API_HANDLER
EP_17["POST /api/v1/evidence/:id/revoke"]
EP_17 --> API_HANDLER
EP_18["GET /api/v1/evidence/:id/verify-public"]
EP_18 --> API_HANDLER
end
subgraph RG_SKILLS["skills routes"]
EP_19["GET /api/v1/skills"]
EP_19 --> API_HANDLER
EP_20["POST /api/v1/skills"]
EP_20 --> API_HANDLER
EP_21["POST /api/v1/skills/relationships"]
EP_21 --> API_HANDLER
EP_22["GET /api/v1/skills/:id/graph"]
EP_22 --> API_HANDLER
EP_23["POST /api/v1/skills/freshness"]
EP_23 --> API_HANDLER
EP_24["GET /api/v1/skills/freshness/my"]
EP_24 --> API_HANDLER
EP_25["POST /api/v1/skills/:skillId/reverify"]
EP_25 --> API_HANDLER
EP_26["POST /api/v1/skills/freshness/refresh-all"]
EP_26 --> API_HANDLER
EP_27["POST /api/v1/skills/endorsements"]
EP_27 --> API_HANDLER
EP_28["GET /api/v1/skills/endorsements/recipients/:recipientId"]
EP_28 --> API_HANDLER
EP_29["DELETE /api/v1/skills/endorsements/:id"]
EP_29 --> API_HANDLER
EP_30["GET /api/v1/skills/endorsements/my/given"]
EP_30 --> API_HANDLER
EP_31["GET /api/v1/skills/forecast/top-growth"]
EP_31 --> API_HANDLER
EP_32["POST /api/v1/skills/:skillId/market-signals"]
EP_32 --> API_HANDLER
EP_33["GET /api/v1/skills/:skillId/forecast"]
EP_33 --> API_HANDLER
EP_34["POST /api/v1/skills/:skillId/forecast/generate"]
EP_34 --> API_HANDLER
end
subgraph RG_ORGANIZATIONS["organizations routes"]
EP_35["POST /api/v1/organizations"]
EP_35 --> API_HANDLER
EP_36["GET /api/v1/organizations/mine"]
EP_36 --> API_HANDLER
EP_37["GET /api/v1/organizations/:id/jobs"]
EP_37 --> API_HANDLER
EP_38["GET /api/v1/organizations/:id"]
EP_38 --> API_HANDLER
EP_39["POST /api/v1/organizations/:id/members"]
EP_39 --> API_HANDLER
EP_40["POST /api/v1/organizations/:orgId/feedback-templates"]
EP_40 --> API_HANDLER
EP_41["GET /api/v1/organizations/:orgId/feedback-templates"]
EP_41 --> API_HANDLER
end
subgraph RG_JOBS["jobs routes"]
EP_42["POST /api/v1/jobs"]
EP_42 --> API_HANDLER
EP_43["GET /api/v1/jobs"]
EP_43 --> API_HANDLER
EP_44["GET /api/v1/jobs/:id"]
EP_44 --> API_HANDLER
EP_45["PATCH /api/v1/jobs/:id/status"]
EP_45 --> API_HANDLER
EP_46["POST /api/v1/jobs/:id/save-as-template"]
EP_46 --> API_HANDLER
EP_47["POST /api/v1/jobs/:id/apply"]
EP_47 --> API_HANDLER
EP_48["GET /api/v1/jobs/:id/applications"]
EP_48 --> API_HANDLER
EP_49["POST /api/v1/jobs/saved-searches"]
EP_49 --> API_HANDLER
EP_50["GET /api/v1/jobs/saved-searches"]
EP_50 --> API_HANDLER
EP_51["GET /api/v1/jobs/saved-searches/:id"]
EP_51 --> API_HANDLER
EP_52["PATCH /api/v1/jobs/saved-searches/:id"]
EP_52 --> API_HANDLER
EP_53["DELETE /api/v1/jobs/saved-searches/:id"]
EP_53 --> API_HANDLER
EP_54["POST /api/v1/jobs/saved-searches/:id/run"]
EP_54 --> API_HANDLER
EP_55["GET /api/v1/jobs/alerts"]
EP_55 --> API_HANDLER
EP_56["PATCH /api/v1/jobs/alerts/:id/read"]
EP_56 --> API_HANDLER
EP_57["POST /api/v1/jobs/:id/save"]
EP_57 --> API_HANDLER
EP_58["DELETE /api/v1/jobs/:id/save"]
EP_58 --> API_HANDLER
EP_59["GET /api/v1/jobs/saved"]
EP_59 --> API_HANDLER
EP_60["PUT /api/v1/jobs/:jobId/draft"]
EP_60 --> API_HANDLER
EP_61["GET /api/v1/jobs/:jobId/draft"]
EP_61 --> API_HANDLER
EP_62["DELETE /api/v1/jobs/:jobId/draft"]
EP_62 --> API_HANDLER
EP_63["POST /api/v1/jobs/:jobId/draft/restore"]
EP_63 --> API_HANDLER
end
subgraph RG_JOB_TEMPLATES["job-templates routes"]
EP_64["POST /api/v1/job-templates"]
EP_64 --> API_HANDLER
EP_65["GET /api/v1/job-templates"]
EP_65 --> API_HANDLER
EP_66["GET /api/v1/job-templates/:id"]
EP_66 --> API_HANDLER
EP_67["PATCH /api/v1/job-templates/:id"]
EP_67 --> API_HANDLER
EP_68["DELETE /api/v1/job-templates/:id"]
EP_68 --> API_HANDLER
EP_69["POST /api/v1/job-templates/:id/instantiate"]
EP_69 --> API_HANDLER
end
subgraph RG_SALARIES["salaries routes"]
EP_70["POST /api/v1/salaries/reports"]
EP_70 --> API_HANDLER
EP_71["GET /api/v1/salaries/reports/my"]
EP_71 --> API_HANDLER
EP_72["DELETE /api/v1/salaries/reports/:id"]
EP_72 --> API_HANDLER
EP_73["GET /api/v1/salaries/benchmarks"]
EP_73 --> API_HANDLER
EP_74["GET /api/v1/salaries/company/:companyName"]
EP_74 --> API_HANDLER
end
subgraph RG_APPLICATIONS["applications routes"]
EP_75["GET /api/v1/applications/my"]
EP_75 --> API_HANDLER
EP_76["GET /api/v1/applications/:id"]
EP_76 --> API_HANDLER
EP_77["POST /api/v1/applications/:id/transition"]
EP_77 --> API_HANDLER
EP_78["POST /api/v1/applications/:id/feedback"]
EP_78 --> API_HANDLER
EP_79["GET /api/v1/applications/:id/feedback"]
EP_79 --> API_HANDLER
EP_80["POST /api/v1/applications/:id/feedback/request"]
EP_80 --> API_HANDLER
EP_81["GET /api/v1/applications/drafts"]
EP_81 --> API_HANDLER
end
subgraph RG_FEEDBACK["feedback routes"]
EP_82["GET /api/v1/feedback/aggregate-insights"]
EP_82 --> API_HANDLER
end
subgraph RG_CANDIDATES["candidates routes"]
EP_83["GET /api/v1/candidates/:candidateProfileId/skills/freshness"]
EP_83 --> API_HANDLER
EP_84["POST /api/v1/candidates/work-history"]
EP_84 --> API_HANDLER
EP_85["POST /api/v1/candidates/work-history/:id/verify-email"]
EP_85 --> API_HANDLER
EP_86["POST /api/v1/candidates/work-history/:id/references/request"]
EP_86 --> API_HANDLER
EP_87["POST /api/v1/candidates/work-history/references/:refId/submit"]
EP_87 --> API_HANDLER
EP_88["GET /api/v1/candidates/:candidateId/work-history"]
EP_88 --> API_HANDLER
EP_89["GET /api/v1/candidates/:candidateId/work-history-graph"]
EP_89 --> API_HANDLER
EP_90["DELETE /api/v1/candidates/work-history/:id"]
EP_90 --> API_HANDLER
end
subgraph RG_INTERVIEWS["interviews routes"]
EP_91["POST /api/v1/interviews/questions"]
EP_91 --> API_HANDLER
EP_92["GET /api/v1/interviews/questions"]
EP_92 --> API_HANDLER
EP_93["POST /api/v1/interviews/assessments"]
EP_93 --> API_HANDLER
EP_94["GET /api/v1/interviews/assessments/:id"]
EP_94 --> API_HANDLER
EP_95["POST /api/v1/interviews/assessments/:id/join"]
EP_95 --> API_HANDLER
EP_96["POST /api/v1/interviews/assessments/:id/consent"]
EP_96 --> API_HANDLER
EP_97["POST /api/v1/interviews/assessments/:id/end"]
EP_97 --> API_HANDLER
EP_98["POST /api/v1/interviews/assessments/:id/code"]
EP_98 --> API_HANDLER
EP_99["POST /api/v1/interviews/assessments/:id/scorecard"]
EP_99 --> API_HANDLER
EP_100["POST /api/v1/interviews/assessments/:id/scorecard/compensate"]
EP_100 --> API_HANDLER
EP_101["GET /api/v1/interviews/assessments/:id/scorecards"]
EP_101 --> API_HANDLER
EP_102["POST /api/v1/interviews/assessments/:id/ai-feedback"]
EP_102 --> API_HANDLER
EP_103["POST /api/v1/interviews/assessments/:id/review"]
EP_103 --> API_HANDLER
end
subgraph RG_REPUTATION["reputation routes"]
EP_104["POST /api/v1/reputation/signals"]
EP_104 --> API_HANDLER
EP_105["GET /api/v1/reputation/users/:userId"]
EP_105 --> API_HANDLER
EP_106["GET /api/v1/reputation/my/signals"]
EP_106 --> API_HANDLER
EP_107["POST /api/v1/reputation/recovery"]
EP_107 --> API_HANDLER
EP_108["POST /api/v1/reputation/recovery/:planId/tasks/:taskId/complete"]
EP_108 --> API_HANDLER
EP_109["POST /api/v1/reputation/recalculate-all"]
EP_109 --> API_HANDLER
EP_110["GET /api/v1/reputation/instructors/:instructorId"]
EP_110 --> API_HANDLER
EP_111["POST /api/v1/reputation/instructors/:instructorId/metrics"]
EP_111 --> API_HANDLER
EP_112["POST /api/v1/reputation/instructors/:instructorId/endorse"]
EP_112 --> API_HANDLER
EP_113["POST /api/v1/reputation/instructors/:instructorId/reviews"]
EP_113 --> API_HANDLER
EP_114["POST /api/v1/reputation/instructors/recompute"]
EP_114 --> API_HANDLER
EP_115["GET /api/v1/reputation/organizations/:organizationId"]
EP_115 --> API_HANDLER
EP_116["POST /api/v1/reputation/organizations/:organizationId/reviews"]
EP_116 --> API_HANDLER
EP_117["POST /api/v1/reputation/organizations/:organizationId/metrics"]
EP_117 --> API_HANDLER
EP_118["GET /api/v1/reputation/organizations/:organizationId/reviews"]
EP_118 --> API_HANDLER
end
subgraph RG_CHALLENGES["challenges routes"]
EP_119["GET /api/v1/challenges"]
EP_119 --> API_HANDLER
EP_120["GET /api/v1/challenges/:id"]
EP_120 --> API_HANDLER
EP_121["POST /api/v1/challenges"]
EP_121 --> API_HANDLER
EP_122["POST /api/v1/challenges/:id/start-session"]
EP_122 --> API_HANDLER
EP_123["POST /api/v1/challenges/:id/submit"]
EP_123 --> API_HANDLER
end
subgraph RG_AI["ai routes"]
EP_124["POST /api/v1/ai/assistant/query"]
EP_124 --> API_HANDLER
EP_125["POST /api/v1/ai/conversations"]
EP_125 --> API_HANDLER
EP_126["GET /api/v1/ai/conversations"]
EP_126 --> API_HANDLER
EP_127["GET /api/v1/ai/conversations/:id"]
EP_127 --> API_HANDLER
EP_128["POST /api/v1/ai/career-assistant/chat"]
EP_128 --> API_HANDLER
EP_129["GET /api/v1/ai/usage"]
EP_129 --> API_HANDLER
end
subgraph RG_XP["xp routes"]
EP_130["GET /api/v1/xp/ledger"]
EP_130 --> API_HANDLER
end
subgraph RG_COURSES["courses routes"]
EP_131["GET /api/v1/courses"]
EP_131 --> API_HANDLER
EP_132["POST /api/v1/courses"]
EP_132 --> API_HANDLER
EP_133["GET /api/v1/courses/:id"]
EP_133 --> API_HANDLER
EP_134["POST /api/v1/courses/:id/modules"]
EP_134 --> API_HANDLER
EP_135["POST /api/v1/courses/:id/publish"]
EP_135 --> API_HANDLER
EP_136["POST /api/v1/courses/:id/enroll"]
EP_136 --> API_HANDLER
EP_137["GET /api/v1/courses/:id/progress"]
EP_137 --> API_HANDLER
end
subgraph RG_MODULES["modules routes"]
EP_138["POST /api/v1/modules/:id/lessons"]
EP_138 --> API_HANDLER
end
subgraph RG_LESSONS["lessons routes"]
EP_139["POST /api/v1/lessons/:id/complete"]
EP_139 --> API_HANDLER
end
subgraph RG_CERTIFICATES["certificates routes"]
EP_140["GET /api/v1/certificates/:certificateNumber"]
EP_140 --> API_HANDLER
EP_141["GET /api/v1/certificates/verify/:hash"]
EP_141 --> API_HANDLER
EP_142["GET /api/v1/certificates/my"]
EP_142 --> API_HANDLER
EP_143["POST /api/v1/certificates/:certificateNumber/revoke"]
EP_143 --> API_HANDLER
end
subgraph RG_VERIFY["verify routes"]
EP_144["GET /api/v1/verify/:hash"]
EP_144 --> API_HANDLER
end
subgraph RG_THREADS["threads routes"]
EP_145["GET /api/v1/threads"]
EP_145 --> API_HANDLER
EP_146["POST /api/v1/threads"]
EP_146 --> API_HANDLER
EP_147["GET /api/v1/threads/:id"]
EP_147 --> API_HANDLER
EP_148["POST /api/v1/threads/:id/messages"]
EP_148 --> API_HANDLER
EP_149["POST /api/v1/threads/:id/read"]
EP_149 --> API_HANDLER
end
subgraph RG_NOTIFICATIONS["notifications routes"]
EP_150["GET /api/v1/notifications"]
EP_150 --> API_HANDLER
EP_151["GET /api/v1/notifications/summary"]
EP_151 --> API_HANDLER
EP_152["POST /api/v1/notifications/mark-read"]
EP_152 --> API_HANDLER
EP_153["GET /api/v1/notifications/preferences"]
EP_153 --> API_HANDLER
EP_154["PATCH /api/v1/notifications/preferences"]
EP_154 --> API_HANDLER
end
subgraph RG_RESUMES["resumes routes"]
EP_155["POST /api/v1/resumes"]
EP_155 --> API_HANDLER
EP_156["GET /api/v1/resumes"]
EP_156 --> API_HANDLER
EP_157["GET /api/v1/resumes/:id"]
EP_157 --> API_HANDLER
EP_158["PATCH /api/v1/resumes/:id"]
EP_158 --> API_HANDLER
EP_159["POST /api/v1/resumes/:id/export"]
EP_159 --> API_HANDLER
EP_160["GET /api/v1/resumes/:id/exports"]
EP_160 --> API_HANDLER
EP_161["DELETE /api/v1/resumes/exports/:exportId"]
EP_161 --> API_HANDLER
end
subgraph RG_CONNECTIONS["connections routes"]
EP_162["POST /api/v1/connections/request"]
EP_162 --> API_HANDLER
EP_163["GET /api/v1/connections"]
EP_163 --> API_HANDLER
EP_164["GET /api/v1/connections/status/:targetUserId"]
EP_164 --> API_HANDLER
EP_165["POST /api/v1/connections/:id/respond"]
EP_165 --> API_HANDLER
EP_166["POST /api/v1/connections/:id/withdraw"]
EP_166 --> API_HANDLER
EP_167["DELETE /api/v1/connections/:id"]
EP_167 --> API_HANDLER
end
subgraph RG_NETWORKING["networking routes"]
EP_168["POST /api/v1/networking/warm-intros/preferences"]
EP_168 --> API_HANDLER
EP_169["GET /api/v1/networking/warm-intros/preferences"]
EP_169 --> API_HANDLER
EP_170["GET /api/v1/networking/warm-intros/paths"]
EP_170 --> API_HANDLER
EP_171["POST /api/v1/networking/warm-intros/requests"]
EP_171 --> API_HANDLER
EP_172["GET /api/v1/networking/warm-intros/requests/incoming"]
EP_172 --> API_HANDLER
EP_173["GET /api/v1/networking/warm-intros/requests/outgoing"]
EP_173 --> API_HANDLER
EP_174["GET /api/v1/networking/warm-intros/requests/:id"]
EP_174 --> API_HANDLER
EP_175["POST /api/v1/networking/warm-intros/requests/:id/respond"]
EP_175 --> API_HANDLER
end
subgraph RG_REFERRALS["referrals routes"]
EP_176["POST /api/v1/referrals/requests"]
EP_176 --> API_HANDLER
EP_177["GET /api/v1/referrals/requests/incoming"]
EP_177 --> API_HANDLER
EP_178["GET /api/v1/referrals/requests/outgoing"]
EP_178 --> API_HANDLER
EP_179["GET /api/v1/referrals/requests/:id"]
EP_179 --> API_HANDLER
EP_180["POST /api/v1/referrals/requests/:id/respond"]
EP_180 --> API_HANDLER
EP_181["GET /api/v1/referrals/outcomes"]
EP_181 --> API_HANDLER
end
subgraph RG_CAREER["career routes"]
EP_182["POST /api/v1/career/transitions"]
EP_182 --> API_HANDLER
EP_183["GET /api/v1/career/transitions/my"]
EP_183 --> API_HANDLER
EP_184["GET /api/v1/career/benchmarks"]
EP_184 --> API_HANDLER
EP_185["POST /api/v1/career/transition-probability"]
EP_185 --> API_HANDLER
EP_186["GET /api/v1/career/pathways"]
EP_186 --> API_HANDLER
EP_187["POST /api/v1/career/milestones/readiness"]
EP_187 --> API_HANDLER
end
subgraph RG_LEARNING["learning routes"]
EP_188["POST /api/v1/learning/impact/outcomes"]
EP_188 --> API_HANDLER
EP_189["GET /api/v1/learning/impact/courses/:courseId"]
EP_189 --> API_HANDLER
EP_190["POST /api/v1/learning/impact/courses/:courseId/compute"]
EP_190 --> API_HANDLER
EP_191["GET /api/v1/learning/impact/dashboard"]
EP_191 --> API_HANDLER
end
subgraph RG_RECRUITER["recruiter routes"]
EP_192["POST /api/v1/recruiter/talent-pools"]
EP_192 --> API_HANDLER
EP_193["GET /api/v1/recruiter/talent-pools"]
EP_193 --> API_HANDLER
EP_194["GET /api/v1/recruiter/talent-pools/:poolId"]
EP_194 --> API_HANDLER
EP_195["POST /api/v1/recruiter/talent-pools/:poolId/members"]
EP_195 --> API_HANDLER
EP_196["PATCH /api/v1/recruiter/talent-pools/:poolId/members/:memberId"]
EP_196 --> API_HANDLER
EP_197["GET /api/v1/recruiter/talent-pools/:poolId/intelligence"]
EP_197 --> API_HANDLER
EP_198["POST /api/v1/recruiter/discovery/behavioral/compute"]
EP_198 --> API_HANDLER
EP_199["GET /api/v1/recruiter/discovery/behavioral"]
EP_199 --> API_HANDLER
EP_200["GET /api/v1/recruiter/discovery/behavioral/:candidateId"]
EP_200 --> API_HANDLER
EP_201["POST /api/v1/recruiter/talent-segmentation/classify"]
EP_201 --> API_HANDLER
EP_202["GET /api/v1/recruiter/talent-segmentation/segments"]
EP_202 --> API_HANDLER
EP_203["GET /api/v1/recruiter/talent-segmentation/candidates"]
EP_203 --> API_HANDLER
EP_204["GET /api/v1/recruiter/talent-segmentation/candidates/:candidateId"]
EP_204 --> API_HANDLER
end
subgraph RG_ALUMNI["alumni routes"]
EP_205["POST /api/v1/alumni/affiliations"]
EP_205 --> API_HANDLER
EP_206["POST /api/v1/alumni/affiliations/:id/verify"]
EP_206 --> API_HANDLER
EP_207["GET /api/v1/alumni/affiliations/my"]
EP_207 --> API_HANDLER
EP_208["GET /api/v1/alumni/institutions/:institutionId/directory"]
EP_208 --> API_HANDLER
EP_209["POST /api/v1/alumni/institutions/:institutionId/groups"]
EP_209 --> API_HANDLER
EP_210["GET /api/v1/alumni/institutions/:institutionId/groups"]
EP_210 --> API_HANDLER
EP_211["POST /api/v1/alumni/groups/:id/join"]
EP_211 --> API_HANDLER
EP_212["GET /api/v1/alumni/groups/:id/members"]
EP_212 --> API_HANDLER
EP_213["POST /api/v1/alumni/mentorship/request"]
EP_213 --> API_HANDLER
EP_214["POST /api/v1/alumni/mentorship/:id/respond"]
EP_214 --> API_HANDLER
EP_215["GET /api/v1/alumni/mentorship/my"]
EP_215 --> API_HANDLER
end
subgraph RG_ACTIVITY["activity routes"]
EP_216["POST /api/v1/activity/events"]
EP_216 --> API_HANDLER
EP_217["GET /api/v1/activity/events"]
EP_217 --> API_HANDLER
EP_218["GET /api/v1/activity/scores/me"]
EP_218 --> API_HANDLER
EP_219["GET /api/v1/activity/users/:userId/score"]
EP_219 --> API_HANDLER
EP_220["POST /api/v1/activity/recalculate"]
EP_220 --> API_HANDLER
end
subgraph RG_PORTFOLIO["portfolio routes"]
EP_221["POST /api/v1/portfolio/projects"]
EP_221 --> API_HANDLER
EP_222["GET /api/v1/portfolio/projects"]
EP_222 --> API_HANDLER
EP_223["GET /api/v1/portfolio/projects/:id"]
EP_223 --> API_HANDLER
EP_224["PATCH /api/v1/portfolio/projects/:id"]
EP_224 --> API_HANDLER
EP_225["DELETE /api/v1/portfolio/projects/:id"]
EP_225 --> API_HANDLER
EP_226["GET /api/v1/portfolio/showcase/:targetUserId"]
EP_226 --> API_HANDLER
end
subgraph RG_GAMIFICATION["gamification routes"]
EP_227["GET /api/v1/gamification/summary"]
EP_227 --> API_HANDLER
EP_228["GET /api/v1/gamification/transactions"]
EP_228 --> API_HANDLER
EP_229["GET /api/v1/gamification/badges"]
EP_229 --> API_HANDLER
EP_230["GET /api/v1/gamification/leaderboard"]
EP_230 --> API_HANDLER
EP_231["POST /api/v1/gamification/claim-activity"]
EP_231 --> API_HANDLER
end
subgraph RG_SETTINGS["settings routes"]
EP_232["GET /api/v1/settings"]
EP_232 --> API_HANDLER
EP_233["PATCH /api/v1/settings"]
EP_233 --> API_HANDLER
EP_234["POST /api/v1/settings/export"]
EP_234 --> API_HANDLER
EP_235["GET /api/v1/settings/export/latest"]
EP_235 --> API_HANDLER
EP_236["POST /api/v1/settings/erasure/request"]
EP_236 --> API_HANDLER
EP_237["GET /api/v1/settings/erasure/status"]
EP_237 --> API_HANDLER
EP_238["POST /api/v1/settings/erasure/cancel"]
EP_238 --> API_HANDLER
EP_239["POST /api/v1/settings/erasure/execute"]
EP_239 --> API_HANDLER
end
subgraph RG_BILLING["billing routes"]
EP_240["POST /api/v1/billing/checkout"]
EP_240 --> API_HANDLER
EP_241["POST /api/v1/billing/portal"]
EP_241 --> API_HANDLER
EP_242["POST /api/v1/billing/stripe-webhook"]
EP_242 --> API_HANDLER
EP_243["GET /api/v1/billing/plans"]
EP_243 --> API_HANDLER
EP_244["GET /api/v1/billing/subscription"]
EP_244 --> API_HANDLER
EP_245["POST /api/v1/billing/subscribe"]
EP_245 --> API_HANDLER
EP_246["POST /api/v1/billing/cancel"]
EP_246 --> API_HANDLER
EP_247["GET /api/v1/billing/invoices"]
EP_247 --> API_HANDLER
EP_248["POST /api/v1/billing/webhook"]
EP_248 --> API_HANDLER
end
subgraph RG_ADMIN["admin routes"]
EP_249["GET /api/v1/admin/users"]
EP_249 --> API_HANDLER
EP_250["PATCH /api/v1/admin/users/:id/status"]
EP_250 --> API_HANDLER
EP_251["PATCH /api/v1/admin/users/:id/roles"]
EP_251 --> API_HANDLER
EP_252["GET /api/v1/admin/feature-flags"]
EP_252 --> API_HANDLER
EP_253["PUT /api/v1/admin/feature-flags/:key"]
EP_253 --> API_HANDLER
EP_254["GET /api/v1/admin/audit-logs"]
EP_254 --> API_HANDLER
EP_255["GET /api/v1/admin/health-diagnostics"]
EP_255 --> API_HANDLER
EP_256["POST /api/v1/admin/maintenance"]
EP_256 --> API_HANDLER
end
subgraph RG_SEARCH["search routes"]
EP_257["GET /api/v1/search"]
EP_257 --> API_HANDLER
EP_258["GET /api/v1/search/autocomplete"]
EP_258 --> API_HANDLER
EP_259["GET /api/v1/search/commands"]
EP_259 --> API_HANDLER
EP_260["GET /api/v1/search/history"]
EP_260 --> API_HANDLER
EP_261["DELETE /api/v1/search/history"]
EP_261 --> API_HANDLER
end
subgraph RG_MODERATION["moderation routes"]
EP_262["POST /api/v1/moderation/scan"]
EP_262 --> API_HANDLER
EP_263["POST /api/v1/moderation/reports"]
EP_263 --> API_HANDLER
EP_264["GET /api/v1/moderation/reports/my"]
EP_264 --> API_HANDLER
EP_265["GET /api/v1/moderation/reports"]
EP_265 --> API_HANDLER
EP_266["GET /api/v1/moderation/reports/:id"]
EP_266 --> API_HANDLER
EP_267["PATCH /api/v1/moderation/reports/:id/status"]
EP_267 --> API_HANDLER
EP_268["POST /api/v1/moderation/reports/:id/resolve"]
EP_268 --> API_HANDLER
EP_269["POST /api/v1/moderation/reports/:id/appeal"]
EP_269 --> API_HANDLER
EP_270["GET /api/v1/moderation/appeals"]
EP_270 --> API_HANDLER
EP_271["POST /api/v1/moderation/appeals/:id/review"]
EP_271 --> API_HANDLER
end
subgraph RG_ANALYTICS["analytics routes"]
EP_272["POST /api/v1/analytics/events"]
EP_272 --> API_HANDLER
EP_273["GET /api/v1/analytics/events"]
EP_273 --> API_HANDLER
EP_274["GET /api/v1/analytics/kpis"]
EP_274 --> API_HANDLER
end
subgraph RG_REFERENCES["references routes"]
EP_275["GET /api/v1/references/:refId"]
EP_275 --> API_HANDLER
end
subgraph RG_INTERNAL["internal routes"]
EP_276["GET /api/v1/internal/worker-jobs"]
EP_276 --> API_HANDLER
end
end
subgraph CONTRACTS["09 Contracts and domain rule ownership"]
CONTRACTS["packages/contracts: Zod request/response schemas, defaults, bounds, enums, URL validation"]
DOMAIN["packages/domain: pure business rules, transitions, authorization helpers and calculations"]
CONFIG["packages/config: validated environment schema and deployed-config refusals"]
OBS["packages/observability: structured logs and audit helpers"]
UIKIT["packages/ui: design tokens and shared primitives"]
API_HANDLER --> CONTRACTS --> DOMAIN
API_HANDLER --> CONFIG
API_HANDLER --> OBS
PWA --> UIKIT
end
subgraph DATA["10 PostgreSQL relational model | migration-defined; actual writes differ by module"]
PG[(PostgreSQL / Supabase-hosted PostgreSQL target; pg driver in current runtime)]
CORESTORE["PgCoreStore: boot hydrate + one transaction for core ops + optimistic concurrency"]
READMODEL["API in-process Maps as hydrated read model; one API process per DB"]
SPECIALSTORE["Dedicated SQL stores: settings, erasure, saved searches/jobs, admin audit, feature flags, billing"]
EPHEMERAL["Other route state in process Maps; response may carry x-talentsphere-durability: ephemeral; lost on restart"]
PG --> CORESTORE --> READMODEL
PG --> SPECIALSTORE
API_HANDLER --> CORESTORE
API_HANDLER --> SPECIALSTORE
API_HANDLER --> EPHEMERAL
TX{"Postgres transaction committed and guarded base version still matches?"}
TX_OK["Commit succeeds; only then update read model and acknowledge"]
TX_FAIL["Rollback; do not mutate read model; return 409/503 as appropriate"]
CORESTORE --> TX
TX -->|TRUE| TX_OK --> READMODEL
TX -->|FALSE| TX_FAIL --> API_ERR
ONEWRITER{"Advisory lock 718201,1 acquired by this API process?"}
ONEWRITER_OK["Single writer active"]
ONEWRITER_NO["Second API writer refused at boot; scale-out blocked until SQL read path replaces Maps"]
API_ROUTER --> ONEWRITER
ONEWRITER -->|TRUE| ONEWRITER_OK
ONEWRITER -->|FALSE| ONEWRITER_NO
T_USERS[("users")]
T_USERS --> PG
MOD_GOVERNANCE --> T_USERS
T_PROFILES[("profiles")]
T_PROFILES --> PG
MOD_IDENTITY --> T_PROFILES
T_ORG_MEMBERSHIPS[("org_memberships")]
T_ORG_MEMBERSHIPS --> PG
MOD_GOVERNANCE --> T_ORG_MEMBERSHIPS
T_JOB_SKILLS[("job_skills")]
T_JOB_SKILLS --> PG
MOD_EVIDENCE --> T_JOB_SKILLS
T_APPLICATION_EVIDENCE[("application_evidence")]
T_APPLICATION_EVIDENCE --> PG
MOD_EVIDENCE --> T_APPLICATION_EVIDENCE
T_EVIDENCE_SKILLS[("evidence_skills")]
T_EVIDENCE_SKILLS --> PG
MOD_EVIDENCE --> T_EVIDENCE_SKILLS
T_USER_SETTINGS[("user_settings")]
T_USER_SETTINGS --> PG
MOD_GOVERNANCE --> T_USER_SETTINGS
T_DATA_EXPORT_REQUESTS[("data_export_requests")]
T_DATA_EXPORT_REQUESTS --> PG
MOD_COMMUNITY --> T_DATA_EXPORT_REQUESTS
T_DATA_ERASURE_REQUESTS[("data_erasure_requests")]
T_DATA_ERASURE_REQUESTS --> PG
MOD_GOVERNANCE --> T_DATA_ERASURE_REQUESTS
T_SAVED_SEARCHES[("saved_searches")]
T_SAVED_SEARCHES --> PG
MOD_SEARCH --> T_SAVED_SEARCHES
T_SAVED_JOBS[("saved_jobs")]
T_SAVED_JOBS --> PG
MOD_JOBS --> T_SAVED_JOBS
T_ADMIN_AUDIT_LOGS[("admin_audit_logs")]
T_ADMIN_AUDIT_LOGS --> PG
MOD_GOVERNANCE --> T_ADMIN_AUDIT_LOGS
T_FEATURE_FLAGS[("feature_flags")]
T_FEATURE_FLAGS --> PG
MOD_GOVERNANCE --> T_FEATURE_FLAGS
T_SUBSCRIPTIONS[("subscriptions")]
T_SUBSCRIPTIONS --> PG
MOD_BILLING --> T_SUBSCRIPTIONS
T_INVOICES[("invoices")]
T_INVOICES --> PG
MOD_BILLING --> T_INVOICES
T_ENTITLEMENTS[("entitlements")]
T_ENTITLEMENTS --> PG
MOD_BILLING --> T_ENTITLEMENTS
T_BILLING_EVENTS[("billing_events")]
T_BILLING_EVENTS --> PG
MOD_BILLING --> T_BILLING_EVENTS
T_STRIPE_CUSTOMERS[("stripe_customers")]
T_STRIPE_CUSTOMERS --> PG
MOD_BILLING --> T_STRIPE_CUSTOMERS
T_BACKGROUND_JOBS[("background_jobs")]
T_BACKGROUND_JOBS --> PG
MOD_JOBS --> T_BACKGROUND_JOBS
T_EVIDENCE[("evidence")]
T_EVIDENCE --> PG
MOD_EVIDENCE --> T_EVIDENCE
T_ORGANIZATIONS[("organizations")]
T_ORGANIZATIONS --> PG
MOD_JOBS --> T_ORGANIZATIONS
T_JOBS[("jobs")]
T_JOBS --> PG
MOD_JOBS --> T_JOBS
T_JOB_APPLICATIONS[("job_applications")]
T_JOB_APPLICATIONS --> PG
MOD_JOBS --> T_JOB_APPLICATIONS
T_AUDIT_LOGS[("audit_logs")]
T_AUDIT_LOGS --> PG
MOD_GOVERNANCE --> T_AUDIT_LOGS
T_SKILLS[("skills")]
T_SKILLS --> PG
MOD_EVIDENCE --> T_SKILLS
T_SKILL_RELATIONSHIPS[("skill_relationships")]
T_SKILL_RELATIONSHIPS --> PG
MOD_EVIDENCE --> T_SKILL_RELATIONSHIPS
T_CHALLENGES[("challenges")]
T_CHALLENGES --> PG
MOD_ASSESSMENT --> T_CHALLENGES
T_ASSESSMENT_SESSIONS[("assessment_sessions")]
T_ASSESSMENT_SESSIONS --> PG
MOD_IDENTITY --> T_ASSESSMENT_SESSIONS
T_CHALLENGE_SUBMISSIONS[("challenge_submissions")]
T_CHALLENGE_SUBMISSIONS --> PG
MOD_ASSESSMENT --> T_CHALLENGE_SUBMISSIONS
T_XP_TRANSACTIONS[("xp_transactions")]
T_XP_TRANSACTIONS --> PG
MOD_COMMUNITY --> T_XP_TRANSACTIONS
T_COURSES[("courses")]
T_COURSES --> PG
MOD_LEARNING --> T_COURSES
T_COURSE_MODULES[("course_modules")]
T_COURSE_MODULES --> PG
MOD_LEARNING --> T_COURSE_MODULES
T_LESSONS[("lessons")]
T_LESSONS --> PG
MOD_LEARNING --> T_LESSONS
T_COURSE_ENROLLMENTS[("course_enrollments")]
T_COURSE_ENROLLMENTS --> PG
MOD_LEARNING --> T_COURSE_ENROLLMENTS
T_LESSON_PROGRESS[("lesson_progress")]
T_LESSON_PROGRESS --> PG
MOD_LEARNING --> T_LESSON_PROGRESS
T_COURSE_CERTIFICATES[("course_certificates")]
T_COURSE_CERTIFICATES --> PG
MOD_LEARNING --> T_COURSE_CERTIFICATES
T_COURSE_SKILLS[("course_skills")]
T_COURSE_SKILLS --> PG
MOD_EVIDENCE --> T_COURSE_SKILLS
T_MESSAGE_THREADS[("message_threads")]
T_MESSAGE_THREADS --> PG
MOD_NETWORK --> T_MESSAGE_THREADS
T_THREAD_PARTICIPANTS[("thread_participants")]
T_THREAD_PARTICIPANTS --> PG
MOD_NETWORK --> T_THREAD_PARTICIPANTS
T_MESSAGES[("messages")]
T_MESSAGES --> PG
MOD_NETWORK --> T_MESSAGES
T_NOTIFICATIONS[("notifications")]
T_NOTIFICATIONS --> PG
MOD_COMMUNICATION --> T_NOTIFICATIONS
T_NOTIFICATION_PREFERENCES[("notification_preferences")]
T_NOTIFICATION_PREFERENCES --> PG
MOD_COMMUNICATION --> T_NOTIFICATION_PREFERENCES
T_AI_CONVERSATIONS[("ai_conversations")]
T_AI_CONVERSATIONS --> PG
MOD_AI --> T_AI_CONVERSATIONS
T_AI_MESSAGES[("ai_messages")]
T_AI_MESSAGES --> PG
MOD_NETWORK --> T_AI_MESSAGES
T_AI_USAGE_METERS[("ai_usage_meters")]
T_AI_USAGE_METERS --> PG
MOD_AI --> T_AI_USAGE_METERS
T_RESUMES[("resumes")]
T_RESUMES --> PG
MOD_GOVERNANCE --> T_RESUMES
T_RESUME_EXPORTS[("resume_exports")]
T_RESUME_EXPORTS --> PG
MOD_COMMUNITY --> T_RESUME_EXPORTS
T_CONNECTIONS[("connections")]
T_CONNECTIONS --> PG
MOD_NETWORK --> T_CONNECTIONS
T_PORTFOLIO_PROJECTS[("portfolio_projects")]
T_PORTFOLIO_PROJECTS --> PG
MOD_GOVERNANCE --> T_PORTFOLIO_PROJECTS
T_PORTFOLIO_PROJECT_SKILLS[("portfolio_project_skills")]
T_PORTFOLIO_PROJECT_SKILLS --> PG
MOD_EVIDENCE --> T_PORTFOLIO_PROJECT_SKILLS
T_PORTFOLIO_PROJECT_MEDIA[("portfolio_project_media")]
T_PORTFOLIO_PROJECT_MEDIA --> PG
MOD_GOVERNANCE --> T_PORTFOLIO_PROJECT_MEDIA
T_PORTFOLIO_PROJECT_EVIDENCE[("portfolio_project_evidence")]
T_PORTFOLIO_PROJECT_EVIDENCE --> PG
MOD_EVIDENCE --> T_PORTFOLIO_PROJECT_EVIDENCE
T_USER_GAMIFICATION_PROFILES[("user_gamification_profiles")]
T_USER_GAMIFICATION_PROFILES --> PG
MOD_IDENTITY --> T_USER_GAMIFICATION_PROFILES
T_GAMIFICATION_BADGES[("gamification_badges")]
T_GAMIFICATION_BADGES --> PG
MOD_COMMUNITY --> T_GAMIFICATION_BADGES
T_USER_BADGES[("user_badges")]
T_USER_BADGES --> PG
MOD_COMMUNITY --> T_USER_BADGES
T_PLATFORM_CONFIG[("platform_config")]
T_PLATFORM_CONFIG --> PG
MOD_GOVERNANCE --> T_PLATFORM_CONFIG
T_SEARCH_HISTORY[("search_history")]
T_SEARCH_HISTORY --> PG
MOD_SEARCH --> T_SEARCH_HISTORY
T_MODERATION_REPORTS[("moderation_reports")]
T_MODERATION_REPORTS --> PG
MOD_GOVERNANCE --> T_MODERATION_REPORTS
T_MODERATION_APPEALS[("moderation_appeals")]
T_MODERATION_APPEALS --> PG
MOD_GOVERNANCE --> T_MODERATION_APPEALS
T_JOB_ALERTS[("job_alerts")]
T_JOB_ALERTS --> PG
MOD_JOBS --> T_JOB_ALERTS
T_APPLICATION_DRAFTS[("application_drafts")]
T_APPLICATION_DRAFTS --> PG
MOD_JOBS --> T_APPLICATION_DRAFTS
T_APPLICATION_DRAFT_VERSIONS[("application_draft_versions")]
T_APPLICATION_DRAFT_VERSIONS --> PG
MOD_JOBS --> T_APPLICATION_DRAFT_VERSIONS
T_ANALYTICS_EVENTS[("analytics_events")]
T_ANALYTICS_EVENTS --> PG
MOD_GOVERNANCE --> T_ANALYTICS_EVENTS
T_ANALYTICS_DAILY_KPIS[("analytics_daily_kpis")]
T_ANALYTICS_DAILY_KPIS --> PG
MOD_AI --> T_ANALYTICS_DAILY_KPIS
T_CERTIFICATE_REVOCATIONS[("certificate_revocations")]
T_CERTIFICATE_REVOCATIONS --> PG
MOD_ASSESSMENT --> T_CERTIFICATE_REVOCATIONS
T_JOB_TEMPLATES[("job_templates")]
T_JOB_TEMPLATES --> PG
MOD_JOBS --> T_JOB_TEMPLATES
T_SALARY_REPORTS[("salary_reports")]
T_SALARY_REPORTS --> PG
MOD_INTELLIGENCE --> T_SALARY_REPORTS
T_SALARY_AGGREGATES[("salary_aggregates")]
T_SALARY_AGGREGATES --> PG
MOD_INTELLIGENCE --> T_SALARY_AGGREGATES
T_FEEDBACK_TEMPLATES[("feedback_templates")]
T_FEEDBACK_TEMPLATES --> PG
MOD_GOVERNANCE --> T_FEEDBACK_TEMPLATES
T_APPLICATION_FEEDBACK[("application_feedback")]
T_APPLICATION_FEEDBACK --> PG
MOD_JOBS --> T_APPLICATION_FEEDBACK
T_SKILL_FRESHNESS[("skill_freshness")]
T_SKILL_FRESHNESS --> PG
MOD_EVIDENCE --> T_SKILL_FRESHNESS
T_SKILL_FRESHNESS_HISTORY[("skill_freshness_history")]
T_SKILL_FRESHNESS_HISTORY --> PG
MOD_EVIDENCE --> T_SKILL_FRESHNESS_HISTORY
T_INTERVIEW_QUESTIONS[("interview_questions")]
T_INTERVIEW_QUESTIONS --> PG
MOD_ASSESSMENT --> T_INTERVIEW_QUESTIONS
T_INTERVIEW_ASSESSMENTS[("interview_assessments")]
T_INTERVIEW_ASSESSMENTS --> PG
MOD_ASSESSMENT --> T_INTERVIEW_ASSESSMENTS
T_INTERVIEW_SCORECARDS[("interview_scorecards")]
T_INTERVIEW_SCORECARDS --> PG
MOD_ASSESSMENT --> T_INTERVIEW_SCORECARDS
T_INTERVIEW_AI_FEEDBACKS[("interview_ai_feedbacks")]
T_INTERVIEW_AI_FEEDBACKS --> PG
MOD_ASSESSMENT --> T_INTERVIEW_AI_FEEDBACKS
T_REPUTATION_SCORES[("reputation_scores")]
T_REPUTATION_SCORES --> PG
MOD_COMMUNITY --> T_REPUTATION_SCORES
T_REPUTATION_SIGNALS[("reputation_signals")]
T_REPUTATION_SIGNALS --> PG
MOD_COMMUNITY --> T_REPUTATION_SIGNALS
T_REPUTATION_HISTORY[("reputation_history")]
T_REPUTATION_HISTORY --> PG
MOD_COMMUNITY --> T_REPUTATION_HISTORY
T_REPUTATION_RECOVERY_PLANS[("reputation_recovery_plans")]
T_REPUTATION_RECOVERY_PLANS --> PG
MOD_COMMUNITY --> T_REPUTATION_RECOVERY_PLANS
T_WARM_INTRODUCTION_PREFERENCES[("warm_introduction_preferences")]
T_WARM_INTRODUCTION_PREFERENCES --> PG
MOD_GOVERNANCE --> T_WARM_INTRODUCTION_PREFERENCES
T_WARM_INTRODUCTION_REQUESTS[("warm_introduction_requests")]
T_WARM_INTRODUCTION_REQUESTS --> PG
MOD_GOVERNANCE --> T_WARM_INTRODUCTION_REQUESTS
T_REFERRAL_REQUESTS[("referral_requests")]
T_REFERRAL_REQUESTS --> PG
MOD_NETWORK --> T_REFERRAL_REQUESTS
T_REFERRAL_OUTCOMES[("referral_outcomes")]
T_REFERRAL_OUTCOMES --> PG
MOD_NETWORK --> T_REFERRAL_OUTCOMES
T_ACTIVITY_EVENTS[("activity_events")]
T_ACTIVITY_EVENTS --> PG
MOD_COMMUNITY --> T_ACTIVITY_EVENTS
T_CONTRIBUTION_SCORES[("contribution_scores")]
T_CONTRIBUTION_SCORES --> PG
MOD_COMMUNITY --> T_CONTRIBUTION_SCORES
T_INSTRUCTOR_REPUTATION_BREAKDOWN[("instructor_reputation_breakdown")]
T_INSTRUCTOR_REPUTATION_BREAKDOWN --> PG
MOD_LEARNING --> T_INSTRUCTOR_REPUTATION_BREAKDOWN
T_INSTRUCTOR_ENDORSEMENTS[("instructor_endorsements")]
T_INSTRUCTOR_ENDORSEMENTS --> PG
MOD_LEARNING --> T_INSTRUCTOR_ENDORSEMENTS
T_SKILL_ENDORSEMENTS[("skill_endorsements")]
T_SKILL_ENDORSEMENTS --> PG
MOD_EVIDENCE --> T_SKILL_ENDORSEMENTS
T_ENDORSEMENT_WEIGHTS[("endorsement_weights")]
T_ENDORSEMENT_WEIGHTS --> PG
MOD_COMMUNITY --> T_ENDORSEMENT_WEIGHTS
T_ALUMNI_AFFILIATIONS[("alumni_affiliations")]
T_ALUMNI_AFFILIATIONS --> PG
MOD_NETWORK --> T_ALUMNI_AFFILIATIONS
T_ALUMNI_GROUPS[("alumni_groups")]
T_ALUMNI_GROUPS --> PG
MOD_NETWORK --> T_ALUMNI_GROUPS
T_ALUMNI_GROUP_MEMBERS[("alumni_group_members")]
T_ALUMNI_GROUP_MEMBERS --> PG
MOD_NETWORK --> T_ALUMNI_GROUP_MEMBERS
T_ALUMNI_MENTORSHIP[("alumni_mentorship")]
T_ALUMNI_MENTORSHIP --> PG
MOD_NETWORK --> T_ALUMNI_MENTORSHIP
T_EMPLOYER_REPUTATION_BREAKDOWN[("employer_reputation_breakdown")]
T_EMPLOYER_REPUTATION_BREAKDOWN --> PG
MOD_COMMUNITY --> T_EMPLOYER_REPUTATION_BREAKDOWN
T_EMPLOYER_REVIEWS[("employer_reviews")]
T_EMPLOYER_REVIEWS --> PG
MOD_GOVERNANCE --> T_EMPLOYER_REVIEWS
T_SKILL_MARKET_SIGNALS[("skill_market_signals")]
T_SKILL_MARKET_SIGNALS --> PG
MOD_EVIDENCE --> T_SKILL_MARKET_SIGNALS
T_SKILL_FORECASTS[("skill_forecasts")]
T_SKILL_FORECASTS --> PG
MOD_EVIDENCE --> T_SKILL_FORECASTS
T_CAREER_TRANSITIONS[("career_transitions")]
T_CAREER_TRANSITIONS --> PG
MOD_INTELLIGENCE --> T_CAREER_TRANSITIONS
T_PROGRESSION_BENCHMARKS[("progression_benchmarks")]
T_PROGRESSION_BENCHMARKS --> PG
MOD_INTELLIGENCE --> T_PROGRESSION_BENCHMARKS
T_CAREER_MILESTONE_EVALUATIONS[("career_milestone_evaluations")]
T_CAREER_MILESTONE_EVALUATIONS --> PG
MOD_INTELLIGENCE --> T_CAREER_MILESTONE_EVALUATIONS
T_LEARNING_OUTCOMES[("learning_outcomes")]
T_LEARNING_OUTCOMES --> PG
MOD_LEARNING --> T_LEARNING_OUTCOMES
T_LEARNING_IMPACT_METRICS[("learning_impact_metrics")]
T_LEARNING_IMPACT_METRICS --> PG
MOD_LEARNING --> T_LEARNING_IMPACT_METRICS
T_TALENT_POOLS[("talent_pools")]
T_TALENT_POOLS --> PG
MOD_INTELLIGENCE --> T_TALENT_POOLS
T_TALENT_POOL_MEMBERS[("talent_pool_members")]
T_TALENT_POOL_MEMBERS --> PG
MOD_INTELLIGENCE --> T_TALENT_POOL_MEMBERS
T_BEHAVIORAL_TALENT_PROFILES[("behavioral_talent_profiles")]
T_BEHAVIORAL_TALENT_PROFILES --> PG
MOD_IDENTITY --> T_BEHAVIORAL_TALENT_PROFILES
T_CANDIDATE_SEGMENTATIONS[("candidate_segmentations")]
T_CANDIDATE_SEGMENTATIONS --> PG
MOD_INTELLIGENCE --> T_CANDIDATE_SEGMENTATIONS
T_VERIFIED_WORK_HISTORIES[("verified_work_histories")]
T_VERIFIED_WORK_HISTORIES --> PG
MOD_GOVERNANCE --> T_VERIFIED_WORK_HISTORIES
T_EMPLOYMENT_REFERENCES[("employment_references")]
T_EMPLOYMENT_REFERENCES --> PG
MOD_GOVERNANCE --> T_EMPLOYMENT_REFERENCES
T_WORK_HISTORY_EMAIL_CHALLENGES[("work_history_email_challenges")]
T_WORK_HISTORY_EMAIL_CHALLENGES --> PG
MOD_ASSESSMENT --> T_WORK_HISTORY_EMAIL_CHALLENGES
T_REVOKED_SESSIONS[("revoked_sessions")]
T_REVOKED_SESSIONS --> PG
MOD_IDENTITY --> T_REVOKED_SESSIONS
T_WORKER_HEALTH[("worker_health")]
T_WORKER_HEALTH --> PG
MOD_COMMUNICATION --> T_WORKER_HEALTH
end
subgraph AUTHZ["11 Identity, roles, authorization and session lifecycle"]
REG["POST auth/register: candidate or recruiter only; email unique; password 8–256; PBKDF2 hash"]
LOGIN["POST auth/login: IP+email throttle; decoy hash for unknown email; HMAC token 24h"]
TOKEN["HMAC signed token; stable TOKEN_SECRET >=32 chars in deployed env; random process key only local fallback"]
REVOKE["revoked_sessions + sessionsValidAfter; sign-out / sign-out-others / password change"]
AUTHDEC{"Token signature + expiry + sessionId not revoked + account row/status + route role/owner check?"}
AUTH_ALLOW["Continue with current account roles/email; handler enforces ownership and tenant"]
AUTH_DENY["401 unauthenticated or 403 forbidden; do not trust client role or supplied ownership flags"]
REG --> TOKEN
LOGIN --> TOKEN
TOKEN --> REVOKE --> AUTHDEC
AUTHDEC -->|TRUE| AUTH_ALLOW
AUTHDEC -->|FALSE| AUTH_DENY
AUTH_ALLOW --> API_AUTH
AUTH_DENY --> API_ERR
CAND --> REG
RECR --> REG
end
subgraph RULES["12 Canonical business rules BR-001…BR-248 | specification text; verify per current handler"]
RULE_GATE{"Rule preconditions satisfied for the requested workflow?"}
RULE_PASS["Proceed only with the allowed state transition and recorded provenance"]
RULE_FAIL["Reject, conceal or constrain operation; preserve audit and existing state"]
RULE_GATE -->|TRUE| RULE_PASS
RULE_GATE -->|FALSE| RULE_FAIL
RULE_PASS --> API_HANDLER
RULE_FAIL --> API_ERR
R_BR_01["BR-01 Only 'ROLE_RECRUITER'/'ROLE_ADMIN' may create/edit job postings"]
R_BR_01 --> RULE_GATE
R_BR_01 -.-> MOD_JOBS
R_BR_02["BR-02 Only 'ROLE_USER' may submit applications; recruiters may not apply"]
R_BR_02 --> RULE_GATE
R_BR_02 -.-> MOD_JOBS
R_BR_03["BR-03 Candidates review own applications only; recruiters all for their companies"]
R_BR_03 --> RULE_GATE
R_BR_03 -.-> MOD_JOBS
R_BR_04["BR-04 Only recruiters/admins create scorecards and notes"]
R_BR_04 --> RULE_GATE
R_BR_04 -.-> MOD_JOBS
R_BR_05["BR-05 User edits own profile only; admin any"]
R_BR_05 --> RULE_GATE
R_BR_05 -.-> MOD_IDENTITY
R_BR_06["BR-06 Flags, audit, settings, user mgmt, moderation are admin-only"]
R_BR_06 --> RULE_GATE
R_BR_06 -.-> MOD_GOVERNANCE
R_BR_07["BR-07 Billing actions available to recruiters, not users/admins"]
R_BR_07 --> RULE_GATE
R_BR_07 -.-> MOD_JOBS
R_BR_08["BR-08 Route-level RBAC matches shared route registry"]
R_BR_08 --> RULE_GATE
R_BR_08 -.-> MOD_GOVERNANCE
R_BR_09["BR-09 Domain-level authorization backs state-changing commands"]
R_BR_09 --> RULE_GATE
R_BR_09 -.-> MOD_IDENTITY
R_BR_10["BR-10 Job publish-readiness rule server-validated"]
R_BR_10 --> RULE_GATE
R_BR_10 -.-> MOD_JOBS
R_BR_11["BR-11 Job lifecycle: draft→pending_approval→approved→scheduled→published→paused→closed→archived"]
R_BR_11 --> RULE_GATE
R_BR_11 -.-> MOD_JOBS
R_BR_12["BR-12 Recruiters update/publish/archive only own-company jobs"]
R_BR_12 --> RULE_GATE
R_BR_12 -.-> MOD_JOBS
R_BR_13["BR-13 Hidden jobs are client-preference; reversible"]
R_BR_13 --> RULE_GATE
R_BR_13 -.-> MOD_JOBS
R_BR_14["BR-14 Saved-search digest runs as service-owned/audited scheduler"]
R_BR_14 --> RULE_GATE
R_BR_14 -.-> MOD_GOVERNANCE
R_BR_15["BR-15 No duplicate ACTIVE application per user per job (partial UNIQUE + 90-day cooldown post-terminal)"]
R_BR_15 --> RULE_GATE
R_BR_15 -.-> MOD_JOBS
R_BR_16["BR-16 No applications to closed/unavailable jobs"]
R_BR_16 --> RULE_GATE
R_BR_16 -.-> MOD_JOBS
R_BR_17["BR-17 Application lifecycle server-owned append-only"]
R_BR_17 --> RULE_GATE
R_BR_17 -.-> MOD_JOBS
R_BR_18["BR-18 Application drafts autosave 30s; recoverable; versions retained"]
R_BR_18 --> RULE_GATE
R_BR_18 -.-> MOD_JOBS
R_BR_19["BR-19 Candidate notes/scorecards recruiter-scoped; never candidate-visible"]
R_BR_19 --> RULE_GATE
R_BR_19 -.-> MOD_JOBS
R_BR_20["BR-20 Status-event history append-only"]
R_BR_20 --> RULE_GATE
R_BR_20 -.-> MOD_GOVERNANCE
R_BR_21["BR-21 Lesson completion idempotent"]
R_BR_21 --> RULE_GATE
R_BR_21 -.-> MOD_LEARNING
R_BR_22["BR-22 Lesson prerequisites gate progression"]
R_BR_22 --> RULE_GATE
R_BR_22 -.-> MOD_LEARNING
R_BR_23["BR-23 Course completion → certificate + XP bonus"]
R_BR_23 --> RULE_GATE
R_BR_23 -.-> MOD_LEARNING
R_BR_24["BR-24 Challenge language allowlist; execution limits per TD-05"]
R_BR_24 --> RULE_GATE
R_BR_24 -.-> MOD_ASSESSMENT
R_BR_25["BR-25 XP idempotent UNIQUE(user_id, reference_type, reference_id); daily cap **200 XP/day**"]
R_BR_25 --> RULE_GATE
R_BR_25 -.-> MOD_COMMUNITY
R_BR_26["BR-26 Resume exports append-only; artifact soft-delete"]
R_BR_26 --> RULE_GATE
R_BR_26 -.-> MOD_COMMUNITY
R_BR_27["BR-27 Analytics metadata whitelist-only; no raw text/tokens/secrets"]
R_BR_27 --> RULE_GATE
R_BR_27 -.-> MOD_GOVERNANCE
R_BR_28["BR-28 Admin status distinguishes live/inferred/degraded/not-configured"]
R_BR_28 --> RULE_GATE
R_BR_28 -.-> MOD_GOVERNANCE
R_BR_29["BR-29 Admin actions: confirmation + audit + rollback"]
R_BR_29 --> RULE_GATE
R_BR_29 -.-> MOD_GOVERNANCE
R_BR_30["BR-30 Extension data stays in chrome.storage.local; no sync/fetch/network"]
R_BR_30 --> RULE_GATE
R_BR_30 -.-> MOD_NETWORK
R_BR_31["BR-31 Schedulers dry-run default; idempotent delivery keys"]
R_BR_31 --> RULE_GATE
R_BR_31 -.-> MOD_GOVERNANCE
R_BR_32["BR-32 Subscription state webhook-owned"]
R_BR_32 --> RULE_GATE
R_BR_32 -.-> MOD_BILLING
R_BR_33["BR-33 AI drafts never auto-commit to records"]
R_BR_33 --> RULE_GATE
R_BR_33 -.-> MOD_AI
R_BR_34["BR-34 T&S report lifecycle pending→under_review→resolved/dismissed"]
R_BR_34 --> RULE_GATE
R_BR_34 -.-> MOD_GOVERNANCE
R_BR_35["BR-35 SUPERSEDED — closures cited in §19.6"]
R_BR_35 --> RULE_GATE
R_BR_35 -.-> MOD_GOVERNANCE
R_BR_036["BR-036 Jobs require approved org + verified owner"]
R_BR_036 --> RULE_GATE
R_BR_036 -.-> MOD_JOBS
R_BR_037["BR-037 Applications require ≥70% profile"]
R_BR_037 --> RULE_GATE
R_BR_037 -.-> MOD_IDENTITY
R_BR_038["BR-038 Candidates may apply only to open jobs"]
R_BR_038 --> RULE_GATE
R_BR_038 -.-> MOD_JOBS
R_BR_039["BR-039 Duplicate applications prevented (DB + app)"]
R_BR_039 --> RULE_GATE
R_BR_039 -.-> MOD_JOBS
R_BR_040["BR-040 Recruiters access only their org's applications"]
R_BR_040 --> RULE_GATE
R_BR_040 -.-> MOD_JOBS
R_BR_041["BR-041 Strict application state machine"]
R_BR_041 --> RULE_GATE
R_BR_041 -.-> MOD_JOBS
R_BR_042["BR-042 Offers require completed HM-scoped scorecard review"]
R_BR_042 --> RULE_GATE
R_BR_042 -.-> MOD_ASSESSMENT
R_BR_043["BR-043 Resumes are scanned for viruses before text extraction"]
R_BR_043 --> RULE_GATE
R_BR_043 -.-> MOD_GOVERNANCE
R_BR_044["BR-044 Extracted resume text encrypted at rest"]
R_BR_044 --> RULE_GATE
R_BR_044 -.-> MOD_GOVERNANCE
R_BR_045["BR-045 Rejection emails sent with configurable delay (default 24h)"]
R_BR_045 --> RULE_GATE
R_BR_045 -.-> MOD_COMMUNICATION
R_BR_046["BR-046 Course enrollments unique per (user, course) for active status"]
R_BR_046 --> RULE_GATE
R_BR_046 -.-> MOD_LEARNING
R_BR_047["BR-047 Module progress strictly sequential"]
R_BR_047 --> RULE_GATE
R_BR_047 -.-> MOD_GOVERNANCE
R_BR_048["BR-048 Course completion requires passing final assessment (≥70%)"]
R_BR_048 --> RULE_GATE
R_BR_048 -.-> MOD_LEARNING
R_BR_049["BR-049 Challenge submissions run in isolated sandbox"]
R_BR_049 --> RULE_GATE
R_BR_049 -.-> MOD_ASSESSMENT
R_BR_050["BR-050 Sandbox execution has hard resource limits (30s CPU, 512MB RAM, 1GB disk)"]
R_BR_050 --> RULE_GATE
R_BR_050 -.-> MOD_GOVERNANCE
R_BR_051["BR-051 Challenge test cases split: public + hidden"]
R_BR_051 --> RULE_GATE
R_BR_051 -.-> MOD_ASSESSMENT
R_BR_052["BR-052 Plagiarism detection runs asynchronously"]
R_BR_052 --> RULE_GATE
R_BR_052 -.-> MOD_GOVERNANCE
R_BR_053["BR-053 Badges minted only upon verified milestone completion"]
R_BR_053 --> RULE_GATE
R_BR_053 -.-> MOD_COMMUNITY
R_BR_054["BR-054 Referral rewards pay out after referred candidate's first verified hire"]
R_BR_054 --> RULE_GATE
R_BR_054 -.-> MOD_NETWORK
R_BR_055["BR-055 Subscription changes apply at period boundary (or prorated)"]
R_BR_055 --> RULE_GATE
R_BR_055 -.-> MOD_BILLING
R_BR_056["BR-056 Entitlements derive from active subscription only"]
R_BR_056 --> RULE_GATE
R_BR_056 -.-> MOD_BILLING
R_BR_057["BR-057 Jobs auto-close after expiry (configurable, default 60 days)"]
R_BR_057 --> RULE_GATE
R_BR_057 -.-> MOD_JOBS
R_BR_058["BR-058 Applications auto-archive after 90 days in submitted"]
R_BR_058 --> RULE_GATE
R_BR_058 -.-> MOD_JOBS
R_BR_059["BR-059 Moderation flags expire after 7 days if not actioned"]
R_BR_059 --> RULE_GATE
R_BR_059 -.-> MOD_COMMUNITY
R_BR_060["BR-060 XP transactions unique per (user, reference_type, reference_id)"]
R_BR_060 --> RULE_GATE
R_BR_060 -.-> MOD_COMMUNITY
R_BR_061["BR-061 Profile completeness ≥70% gate for job applications"]
R_BR_061 --> RULE_GATE
R_BR_061 -.-> MOD_IDENTITY
R_BR_062["BR-062 Verified organizations receive accelerated job approval"]
R_BR_062 --> RULE_GATE
R_BR_062 -.-> MOD_JOBS
R_BR_063["BR-063 Candidates may request data export; delivered within 30 days"]
R_BR_063 --> RULE_GATE
R_BR_063 -.-> MOD_COMMUNITY
R_BR_064["BR-064 Recruiters see verified signals on candidate profiles"]
R_BR_064 --> RULE_GATE
R_BR_064 -.-> MOD_IDENTITY
R_BR_065["BR-065 AI outputs below 0.7 confidence display disclaimer"]
R_BR_065 --> RULE_GATE
R_BR_065 -.-> MOD_AI
R_BR_066["BR-066 AI outputs below 0.5 confidence are suppressed"]
R_BR_066 --> RULE_GATE
R_BR_066 -.-> MOD_AI
R_BR_067["BR-067 All admin actions are audit-logged"]
R_BR_067 --> RULE_GATE
R_BR_067 -.-> MOD_GOVERNANCE
R_BR_068["BR-068 Account termination requires Platform Admin dual approval"]
R_BR_068 --> RULE_GATE
R_BR_068 -.-> MOD_IDENTITY
R_BR_069["BR-069 Interviewer inactivity auto-escalation: 7 business days → HM escalation; 14 days → auto-transition stale_withdrawn"]
R_BR_069 --> RULE_GATE
R_BR_069 -.-> MOD_ASSESSMENT
R_BR_070["BR-070 Candidate non-response auto-release: 5 business days → reminders; 8 days → candidate_unresponsive"]
R_BR_070 --> RULE_GATE
R_BR_070 -.-> MOD_GOVERNANCE
R_BR_071["BR-071 Abandoned requisition protection: 21 calendar days → review; 30 days → auto-pause + billing credit"]
R_BR_071 --> RULE_GATE
R_BR_071 -.-> MOD_BILLING
R_BR_072["BR-072 Managed learners access course only while org holds unexpired assigned seat"]
R_BR_072 --> RULE_GATE
R_BR_072 -.-> MOD_LEARNING
R_BR_073["BR-073 Seat revocation triggers 7-day grace; in-progress assessments never interrupted"]
R_BR_073 --> RULE_GATE
R_BR_073 -.-> MOD_ASSESSMENT
R_BR_074["BR-074 Seat consumption atomic; last-seat concurrency never oversells"]
R_BR_074 --> RULE_GATE
R_BR_074 -.-> MOD_GOVERNANCE
R_BR_075["BR-075 Revoked seat returns to pool; learner progress and certificates retained"]
R_BR_075 --> RULE_GATE
R_BR_075 -.-> MOD_ASSESSMENT
R_BR_076["BR-076 Graduation transition retains all verified signals and severs FERPA-restricted records"]
R_BR_076 --> RULE_GATE
R_BR_076 -.-> MOD_AI
R_BR_077["BR-077 Bulk imports require dry-run validation preview; no silent partial imports"]
R_BR_077 --> RULE_GATE
R_BR_077 -.-> MOD_GOVERNANCE
R_BR_078["BR-078 Faculty/Proctor hold no org-level billing, licensing, or user-management privileges"]
R_BR_078 --> RULE_GATE
R_BR_078 -.-> MOD_BILLING
R_BR_079["BR-079 Employer-facing student showcases require recorded, revocable consent"]
R_BR_079 --> RULE_GATE
R_BR_079 -.-> MOD_LEARNING
R_BR_080["BR-080 Every org-owned record scoped by 'organization_id'; cross-tenant reads prohibited"]
R_BR_080 --> RULE_GATE
R_BR_080 -.-> MOD_JOBS
R_BR_081["BR-081 Institutional pricing tiers configurable per course/package; never hard-coded"]
R_BR_081 --> RULE_GATE
R_BR_081 -.-> MOD_LEARNING
R_BR_082["BR-082 Course-access authorization server-side: org + learner + license + enrollment + validity"]
R_BR_082 --> RULE_GATE
R_BR_082 -.-> MOD_IDENTITY
R_BR_083["BR-083 External media validated before publication; invalid/private/embed-blocked rejected"]
R_BR_083 --> RULE_GATE
R_BR_083 -.-> MOD_GOVERNANCE
R_BR_084["BR-084 Provider embedding restrictions never bypassed; protected content never downloaded"]
R_BR_084 --> RULE_GATE
R_BR_084 -.-> MOD_GOVERNANCE
R_BR_085["BR-085 Provider capabilities determine available playback/completion settings"]
R_BR_085 --> RULE_GATE
R_BR_085 -.-> MOD_GOVERNANCE
R_BR_086["BR-086 Broken external provider isolated to affected content item; course remains functional"]
R_BR_086 --> RULE_GATE
R_BR_086 -.-> MOD_LEARNING
R_BR_087["BR-087 Platform stores learner progress even for externally hosted playback where trackable"]
R_BR_087 --> RULE_GATE
R_BR_087 -.-> MOD_GOVERNANCE
R_BR_088["BR-088 Unsupported providers produce explicit errors, never silent broken embeds"]
R_BR_088 --> RULE_GATE
R_BR_088 -.-> MOD_COMMUNITY
R_BR_089["BR-089 Authors attest right to use external content before publication"]
R_BR_089 --> RULE_GATE
R_BR_089 -.-> MOD_IDENTITY
R_BR_090["BR-090 Org provider allowlists enforced server-side"]
R_BR_090 --> RULE_GATE
R_BR_090 -.-> MOD_GOVERNANCE
R_BR_091["BR-091 Course submission requires ≥5 lessons and ≥30 min total content"]
R_BR_091 --> RULE_GATE
R_BR_091 -.-> MOD_LEARNING
R_BR_092["BR-092 Course requires ≥1 video or text lesson (no quiz-only courses)"]
R_BR_092 --> RULE_GATE
R_BR_092 -.-> MOD_LEARNING
R_BR_093["BR-093 Structural edits to a published course require a new version"]
R_BR_093 --> RULE_GATE
R_BR_093 -.-> MOD_LEARNING
R_BR_094["BR-094 Free-preview lessons ≤20% of course content"]
R_BR_094 --> RULE_GATE
R_BR_094 -.-> MOD_LEARNING
R_BR_095["BR-095 Rating requires ≥20% course progress and verified enrolment"]
R_BR_095 --> RULE_GATE
R_BR_095 -.-> MOD_LEARNING
R_BR_096["BR-096 Category assignment required before submission"]
R_BR_096 --> RULE_GATE
R_BR_096 -.-> MOD_GOVERNANCE
R_BR_097["BR-097 Instructor must have an approved profile before publishing"]
R_BR_097 --> RULE_GATE
R_BR_097 -.-> MOD_IDENTITY
R_BR_098["BR-098 Course image ≥750×422, ≤4MB"]
R_BR_098 --> RULE_GATE
R_BR_098 -.-> MOD_LEARNING
R_BR_099["BR-099 Coupon cannot reduce price below platform minimum"]
R_BR_099 --> RULE_GATE
R_BR_099 -.-> MOD_GOVERNANCE
R_BR_100["BR-100 Refund window 30 days from purchase (configurable), pro-rated after"]
R_BR_100 --> RULE_GATE
R_BR_100 -.-> MOD_GOVERNANCE
R_BR_101["BR-101 Instructor earnings = 70% of net revenue after platform commission (configurable)"]
R_BR_101 --> RULE_GATE
R_BR_101 -.-> MOD_LEARNING
R_BR_102["BR-102 Course announcements limited to 1/day/course"]
R_BR_102 --> RULE_GATE
R_BR_102 -.-> MOD_LEARNING
R_BR_103["BR-103 Peer review requires ≥2 completed reviews per submission"]
R_BR_103 --> RULE_GATE
R_BR_103 -.-> MOD_GOVERNANCE
R_BR_104["BR-104 Instructor cannot review or rate own course"]
R_BR_104 --> RULE_GATE
R_BR_104 -.-> MOD_LEARNING
R_BR_105["BR-105 Course version preserves existing student progress"]
R_BR_105 --> RULE_GATE
R_BR_105 -.-> MOD_LEARNING
R_BR_106["BR-106 Learning-path courses complete in declared order when sequenced"]
R_BR_106 --> RULE_GATE
R_BR_106 -.-> MOD_LEARNING
R_BR_107["BR-107 Quiz attempts bounded by configured max; practice quizzes unlimited"]
R_BR_107 --> RULE_GATE
R_BR_107 -.-> MOD_GOVERNANCE
R_BR_108["BR-108 Graded quiz contributes to course grade; passing score configurable"]
R_BR_108 --> RULE_GATE
R_BR_108 -.-> MOD_LEARNING
R_BR_109["BR-109 Final exam cumulative; required for course completion when configured"]
R_BR_109 --> RULE_GATE
R_BR_109 -.-> MOD_LEARNING
R_BR_110["BR-110 Program certificate issued only when all required path courses complete"]
R_BR_110 --> RULE_GATE
R_BR_110 -.-> MOD_LEARNING
R_BR_111["BR-111 Assignment late submission flagged, graded per instructor policy"]
R_BR_111 --> RULE_GATE
R_BR_111 -.-> MOD_LEARNING
R_BR_112["BR-112 Auto-grading for code assignments reuses the challenge sandbox"]
R_BR_112 --> RULE_GATE
R_BR_112 -.-> MOD_ASSESSMENT
R_BR_113["BR-113 Question-bank reuse preserves per-attempt snapshots (no retroactive edits)"]
R_BR_113 --> RULE_GATE
R_BR_113 -.-> MOD_GOVERNANCE
R_BR_114["BR-114 Course archive/unpublish preserves enrolled-student access per policy"]
R_BR_114 --> RULE_GATE
R_BR_114 -.-> MOD_LEARNING
R_BR_115["BR-115 All course purchases are idempotent and webhook-owned"]
R_BR_115 --> RULE_GATE
R_BR_115 -.-> MOD_LEARNING
R_BR_116["BR-116 One reaction per user per target; changeable, never additive"]
R_BR_116 --> RULE_GATE
R_BR_116 -.-> MOD_GOVERNANCE
R_BR_117["BR-117 One repost per user per post"]
R_BR_117 --> RULE_GATE
R_BR_117 -.-> MOD_GOVERNANCE
R_BR_118["BR-118 Post edits retain an 'edited' marker and version history"]
R_BR_118 --> RULE_GATE
R_BR_118 -.-> MOD_AI
R_BR_119["BR-119 Comment authors and post authors may moderate; authors may disable comments"]
R_BR_119 --> RULE_GATE
R_BR_119 -.-> MOD_IDENTITY
R_BR_120["BR-120 Mentions notify only if the recipient allows mentions"]
R_BR_120 --> RULE_GATE
R_BR_120 -.-> MOD_GOVERNANCE
R_BR_121["BR-121 Follows unique; blocked/muted targets cannot be followed"]
R_BR_121 --> RULE_GATE
R_BR_121 -.-> MOD_GOVERNANCE
R_BR_122["BR-122 Post visibility enforced server-side (public/connections/org/private)"]
R_BR_122 --> RULE_GATE
R_BR_122 -.-> MOD_NETWORK
R_BR_123["BR-123 Newsletter subscriptions opt-in only; one-click unsubscribe (RFC 8058)"]
R_BR_123 --> RULE_GATE
R_BR_123 -.-> MOD_BILLING
R_BR_124["BR-124 Feed must always offer a chronological view; ranking factors disclosed on demand"]
R_BR_124 --> RULE_GATE
R_BR_124 -.-> MOD_GOVERNANCE
R_BR_125["BR-125 UGC passes pre-publish abuse scan; post rate limits per actor"]
R_BR_125 --> RULE_GATE
R_BR_125 -.-> MOD_GOVERNANCE
R_BR_126["BR-126 Sponsored content labelled as sponsored; never undisclosed in organic ranking"]
R_BR_126 --> RULE_GATE
R_BR_126 -.-> MOD_GOVERNANCE
R_BR_127["BR-127 Mute hides content without unfollowing and without notifying the muted party"]
R_BR_127 --> RULE_GATE
R_BR_127 -.-> MOD_GOVERNANCE
R_BR_128["BR-128 Minors (16+) get private-by-default profiles and restricted outreach"]
R_BR_128 --> RULE_GATE
R_BR_128 -.-> MOD_IDENTITY
R_BR_129["BR-129 Outreach credit consumed on send to a non-connection; refunded on reply within 7 days"]
R_BR_129 --> RULE_GATE
R_BR_129 -.-> MOD_NETWORK
R_BR_130["BR-130 Outreach weekly caps: 20 (Pro), 50 (Team), custom (Enterprise)"]
R_BR_130 --> RULE_GATE
R_BR_130 -.-> MOD_GOVERNANCE
R_BR_131["BR-131 Endorsements require an existing connection"]
R_BR_131 --> RULE_GATE
R_BR_131 -.-> MOD_NETWORK
R_BR_132["BR-132 Written recommendations display only after recipient acceptance"]
R_BR_132 --> RULE_GATE
R_BR_132 -.-> MOD_INTELLIGENCE
R_BR_133["BR-133 Profile-view logging honours the viewer's privacy mode"]
R_BR_133 --> RULE_GATE
R_BR_133 -.-> MOD_IDENTITY
R_BR_134["BR-134 Identity-verification badges only via approved partners; failure never blocks core use"]
R_BR_134 --> RULE_GATE
R_BR_134 -.-> MOD_IDENTITY
R_BR_135["BR-135 Salary aggregates displayed only with ≥5 reports for a role/location cell"]
R_BR_135 --> RULE_GATE
R_BR_135 -.-> MOD_INTELLIGENCE
R_BR_136["BR-136 Anonymous reviews hide identity from employer and public, never from Platform Admin/legal"]
R_BR_136 --> RULE_GATE
R_BR_136 -.-> MOD_IDENTITY
R_BR_137["BR-137 Company responses are appended, never edit the original review"]
R_BR_137 --> RULE_GATE
R_BR_137 -.-> MOD_GOVERNANCE
R_BR_138["BR-138 Interview questions require moderation before public display"]
R_BR_138 --> RULE_GATE
R_BR_138 -.-> MOD_ASSESSMENT
R_BR_139["BR-139 Contest submissions locked at server-authoritative end time; clock skew never extends"]
R_BR_139 --> RULE_GATE
R_BR_139 -.-> MOD_IDENTITY
R_BR_140["BR-140 Certification exam pass requires the configured score in a single attempt (retake policy configurable)"]
R_BR_140 --> RULE_GATE
R_BR_140 -.-> MOD_ASSESSMENT
R_BR_141["BR-141 Skills taxonomy curated by Platform Admin; no user can create canonical skills"]
R_BR_141 --> RULE_GATE
R_BR_141 -.-> MOD_EVIDENCE
R_BR_142["BR-142 Skill relationships are directional: 'prerequisite_of', 'subskill_of', 'supersedes'"]
R_BR_142 --> RULE_GATE
R_BR_142 -.-> MOD_EVIDENCE
R_BR_143["BR-143 Correlations ('correlates_with') are bidirectional and computed statistically"]
R_BR_143 --> RULE_GATE
R_BR_143 -.-> MOD_GOVERNANCE
R_BR_144["BR-144 Every course, challenge, job, and candidate skill tag MUST reference a canonical skill"]
R_BR_144 --> RULE_GATE
R_BR_144 -.-> MOD_EVIDENCE
R_BR_145["BR-145 Skill market signals update daily from aggregated data"]
R_BR_145 --> RULE_GATE
R_BR_145 -.-> MOD_EVIDENCE
R_BR_146["BR-146 Skill graph traversal depth bounded (max 5 hops)"]
R_BR_146 --> RULE_GATE
R_BR_146 -.-> MOD_EVIDENCE
R_BR_147["BR-147 Skill relationships must be acyclic for 'prerequisite_of' (validated at write time)"]
R_BR_147 --> RULE_GATE
R_BR_147 -.-> MOD_EVIDENCE
R_BR_148["BR-148 Emerging skills require minimum 5 independent signals before taxonomy promotion"]
R_BR_148 --> RULE_GATE
R_BR_148 -.-> MOD_EVIDENCE
R_BR_149["BR-149 Credentials are append-only; revocation creates a new record with 'revoked_at'"]
R_BR_149 --> RULE_GATE
R_BR_149 -.-> MOD_EVIDENCE
R_BR_150["BR-150 Every credential has a public verification URL (no PII exposed)"]
R_BR_150 --> RULE_GATE
R_BR_150 -.-> MOD_EVIDENCE
R_BR_151["BR-151 Credential evidence links are immutable once issued"]
R_BR_151 --> RULE_GATE
R_BR_151 -.-> MOD_EVIDENCE
R_BR_152["BR-152 Endorsement weights derive from endorser's verified reputation + relationship proximity"]
R_BR_152 --> RULE_GATE
R_BR_152 -.-> MOD_COMMUNITY
R_BR_153["BR-153 Anonymous endorsements are not permitted (P-01)"]
R_BR_153 --> RULE_GATE
R_BR_153 -.-> MOD_COMMUNITY
R_BR_154["BR-154 Appeal path exists for disputed credentials; SLA ≤7 days"]
R_BR_154 --> RULE_GATE
R_BR_154 -.-> MOD_EVIDENCE
R_BR_155["BR-155 Privacy-preserving proofs allow skill verification without revealing full profile"]
R_BR_155 --> RULE_GATE
R_BR_155 -.-> MOD_IDENTITY
R_BR_156["BR-156 Credential issue requires underlying achievement verified by platform activity"]
R_BR_156 --> RULE_GATE
R_BR_156 -.-> MOD_EVIDENCE
R_BR_157["BR-157 Career outcome tracking requires explicit user opt-in"]
R_BR_157 --> RULE_GATE
R_BR_157 -.-> MOD_INTELLIGENCE
R_BR_158["BR-158 Aggregated career data requires k ≥5 for display"]
R_BR_158 --> RULE_GATE
R_BR_158 -.-> MOD_INTELLIGENCE
R_BR_159["BR-159 Individual career transitions visible only to the user"]
R_BR_159 --> RULE_GATE
R_BR_159 -.-> MOD_INTELLIGENCE
R_BR_160["BR-160 Progression benchmarks by role require ≥20 data points to publish"]
R_BR_160 --> RULE_GATE
R_BR_160 -.-> MOD_INTELLIGENCE
R_BR_161["BR-161 Salary progression tracked separately from base salary"]
R_BR_161 --> RULE_GATE
R_BR_161 -.-> MOD_INTELLIGENCE
R_BR_162["BR-162 Career graph updates do not retroactively alter historical benchmarks"]
R_BR_162 --> RULE_GATE
R_BR_162 -.-> MOD_INTELLIGENCE
R_BR_163["BR-163 Career path recommendations must disclose data sources and confidence intervals"]
R_BR_163 --> RULE_GATE
R_BR_163 -.-> MOD_INTELLIGENCE
R_BR_164["BR-164 Reputation score is derived, never manually set"]
R_BR_164 --> RULE_GATE
R_BR_164 -.-> MOD_COMMUNITY
R_BR_165["BR-165 Reputation is skill-specific"]
R_BR_165 --> RULE_GATE
R_BR_165 -.-> MOD_EVIDENCE
R_BR_166["BR-166 Time-decay: signals older than 24 months count less"]
R_BR_166 --> RULE_GATE
R_BR_166 -.-> MOD_GOVERNANCE
R_BR_167["BR-167 Reputation is private by default; recruiter visibility requires candidate consent or active application"]
R_BR_167 --> RULE_GATE
R_BR_167 -.-> MOD_JOBS
R_BR_168["BR-168 Reputation signals are auditable"]
R_BR_168 --> RULE_GATE
R_BR_168 -.-> MOD_COMMUNITY
R_BR_169["BR-169 Interview recording requires dual consent"]
R_BR_169 --> RULE_GATE
R_BR_169 -.-> MOD_ASSESSMENT
R_BR_170["BR-170 Recordings encrypted at rest; retention ≤90 days unless extended"]
R_BR_170 --> RULE_GATE
R_BR_170 -.-> MOD_GOVERNANCE
R_BR_171["BR-171 AI feedback is advisory; never a hiring decision input without human review"]
R_BR_171 --> RULE_GATE
R_BR_171 -.-> MOD_JOBS
R_BR_172["BR-172 AI analysis excludes protected attributes"]
R_BR_172 --> RULE_GATE
R_BR_172 -.-> MOD_AI
R_BR_173["BR-173 Interview questions are company-scoped; not visible to candidates before assessment"]
R_BR_173 --> RULE_GATE
R_BR_173 -.-> MOD_ASSESSMENT
R_BR_174["BR-174 Assessment scores are append-only; changes are compensating entries"]
R_BR_174 --> RULE_GATE
R_BR_174 -.-> MOD_ASSESSMENT
R_BR_175["BR-175 Live coding environment reuses the challenge sandbox"]
R_BR_175 --> RULE_GATE
R_BR_175 -.-> MOD_ASSESSMENT
R_BR_176["BR-176 Comparison across candidates uses structured rubrics, never free-form scores"]
R_BR_176 --> RULE_GATE
R_BR_176 -.-> MOD_GOVERNANCE
R_BR_177["BR-177 Salary reports require verification: self-reported (0.5) or verified via employment (1.0)"]
R_BR_177 --> RULE_GATE
R_BR_177 -.-> MOD_EVIDENCE
R_BR_178["BR-178 Aggregated salary data requires k ≥5 submissions per cell"]
R_BR_178 --> RULE_GATE
R_BR_178 -.-> MOD_INTELLIGENCE
R_BR_179["BR-179 Salary data displayed in minor units + ISO-4217 currency"]
R_BR_179 --> RULE_GATE
R_BR_179 -.-> MOD_INTELLIGENCE
R_BR_180["BR-180 Company-specific salary data shown only if company has ≥3 reports OR opted in"]
R_BR_180 --> RULE_GATE
R_BR_180 -.-> MOD_INTELLIGENCE
R_BR_181["BR-181 Users may withdraw their salary submission at any time"]
R_BR_181 --> RULE_GATE
R_BR_181 -.-> MOD_INTELLIGENCE
R_BR_182["BR-182 Salary intelligence updates quarterly; historical data versioned"]
R_BR_182 --> RULE_GATE
R_BR_182 -.-> MOD_INTELLIGENCE
R_BR_183["BR-183 Equity data (F-98) separately aggregated from salary"]
R_BR_183 --> RULE_GATE
R_BR_183 -.-> MOD_INTELLIGENCE
R_BR_184["BR-184 Recommendation factors must be disclosed ('why am I seeing this?')"]
R_BR_184 --> RULE_GATE
R_BR_184 -.-> MOD_INTELLIGENCE
R_BR_185["BR-185 Recommendations never use protected attributes"]
R_BR_185 --> RULE_GATE
R_BR_185 -.-> MOD_INTELLIGENCE
R_BR_186["BR-186 Users can dismiss recommendations; dismissals train the model"]
R_BR_186 --> RULE_GATE
R_BR_186 -.-> MOD_INTELLIGENCE
R_BR_187["BR-187 Recommendations may not include promoted content without explicit 'sponsored' label"]
R_BR_187 --> RULE_GATE
R_BR_187 -.-> MOD_INTELLIGENCE
R_BR_188["BR-188 Recommendation engine must be replaceable without breaking downstream features"]
R_BR_188 --> RULE_GATE
R_BR_188 -.-> MOD_INTELLIGENCE
R_BR_189["BR-189 Course outcome correlation requires ≥30 enrolled learners with measurable outcomes"]
R_BR_189 --> RULE_GATE
R_BR_189 -.-> MOD_LEARNING
R_BR_190["BR-190 Individual learner outcomes are never exposed without consent"]
R_BR_190 --> RULE_GATE
R_BR_190 -.-> MOD_COMMUNITY
R_BR_191["BR-191 Course quality scores derived from outcomes visible to instructors, not publicly ranked"]
R_BR_191 --> RULE_GATE
R_BR_191 -.-> MOD_LEARNING
R_BR_192["BR-192 Learning impact analytics do not create incentives to lower standards"]
R_BR_192 --> RULE_GATE
R_BR_192 -.-> MOD_LEARNING
R_BR_193["BR-193 Correlation is not causation — all outcome claims labelled as correlational"]
R_BR_193 --> RULE_GATE
R_BR_193 -.-> MOD_AI
R_BR_194["BR-194 Peer mentorship sessions have a 30-day inactivity auto-close"]
R_BR_194 --> RULE_GATE
R_BR_194 -.-> MOD_IDENTITY
R_BR_195["BR-195 Expert network calls may be paid; platform takes a transparent fee"]
R_BR_195 --> RULE_GATE
R_BR_195 -.-> MOD_NETWORK
R_BR_196["BR-196 Industry hubs must have ≥3 active contributors to display"]
R_BR_196 --> RULE_GATE
R_BR_196 -.-> MOD_GOVERNANCE
R_BR_197["BR-197 Resume parsing never auto-applies changes without user review"]
R_BR_197 --> RULE_GATE
R_BR_197 -.-> MOD_GOVERNANCE
R_BR_198["BR-198 Custom assessments must be approved by Platform Admin before deployment"]
R_BR_198 --> RULE_GATE
R_BR_198 -.-> MOD_ASSESSMENT
R_BR_199["BR-199 Candidate comparison requires verified profiles only"]
R_BR_199 --> RULE_GATE
R_BR_199 -.-> MOD_IDENTITY
R_BR_200["BR-200 DE&I analytics use aggregated data only; individual demographic data never stored"]
R_BR_200 --> RULE_GATE
R_BR_200 -.-> MOD_GOVERNANCE
R_BR_201["BR-201 Post-hire analytics require employer consent and are aggregate-only"]
R_BR_201 --> RULE_GATE
R_BR_201 -.-> MOD_GOVERNANCE
R_BR_202["BR-202 Badge marketplace prohibits paid badges; all badges earned"]
R_BR_202 --> RULE_GATE
R_BR_202 -.-> MOD_COMMUNITY
R_BR_203["BR-203 Mobile-first application must maintain feature parity with desktop"]
R_BR_203 --> RULE_GATE
R_BR_203 -.-> MOD_JOBS
R_BR_204["BR-204 Accessibility is a release gate; WCAG 2.2 AA mandatory"]
R_BR_204 --> RULE_GATE
R_BR_204 -.-> MOD_GOVERNANCE
R_BR_205["BR-205 API access requires enterprise tier; rate-limited per CON-006"]
R_BR_205 --> RULE_GATE
R_BR_205 -.-> MOD_GOVERNANCE
R_BR_206["BR-206 Emerging skills require platform-wide adoption before taxonomy promotion"]
R_BR_206 --> RULE_GATE
R_BR_206 -.-> MOD_EVIDENCE
R_BR_207["BR-207 Job market analytics require k ≥10 data points per geographic cell"]
R_BR_207 --> RULE_GATE
R_BR_207 -.-> MOD_JOBS
R_BR_208["BR-208 All new AI-powered features inherit AI safety rules §32"]
R_BR_208 --> RULE_GATE
R_BR_208 -.-> MOD_AI
R_BR_209["BR-209 Introducer consent required for each introduction"]
R_BR_209 --> RULE_GATE
R_BR_209 -.-> MOD_GOVERNANCE
R_BR_210["BR-210 Max path depth = 4"]
R_BR_210 --> RULE_GATE
R_BR_210 -.-> MOD_GOVERNANCE
R_BR_211["BR-211 Max 10 intro requests/week/user"]
R_BR_211 --> RULE_GATE
R_BR_211 -.-> MOD_GOVERNANCE
R_BR_212["BR-212 Introducer can opt out of intro services"]
R_BR_212 --> RULE_GATE
R_BR_212 -.-> MOD_GOVERNANCE
R_BR_213["BR-213 Target can block all intro requests"]
R_BR_213 --> RULE_GATE
R_BR_213 -.-> MOD_GOVERNANCE
R_BR_214["BR-214 Introduction messages separate from cold outreach"]
R_BR_214 --> RULE_GATE
R_BR_214 -.-> MOD_NETWORK
R_BR_215["BR-215 Paths visible only to requester"]
R_BR_215 --> RULE_GATE
R_BR_215 -.-> MOD_GOVERNANCE
R_BR_216["BR-216 No path suggestion for blocked users"]
R_BR_216 --> RULE_GATE
R_BR_216 -.-> MOD_GOVERNANCE
R_BR_217["BR-217 Minimum reason category required on rejection"]
R_BR_217 --> RULE_GATE
R_BR_217 -.-> MOD_GOVERNANCE
R_BR_218["BR-218 Feedback delivered within 7 days of decision"]
R_BR_218 --> RULE_GATE
R_BR_218 -.-> MOD_GOVERNANCE
R_BR_219["BR-219 Feedback visible only to candidate"]
R_BR_219 --> RULE_GATE
R_BR_219 -.-> MOD_GOVERNANCE
R_BR_220["BR-220 Aggregate insights use k ≥10"]
R_BR_220 --> RULE_GATE
R_BR_220 -.-> MOD_GOVERNANCE
R_BR_221["BR-221 AI drafts require human review before sending"]
R_BR_221 --> RULE_GATE
R_BR_221 -.-> MOD_AI
R_BR_222["BR-222 Candidate can request feedback if not provided (30-day window)"]
R_BR_222 --> RULE_GATE
R_BR_222 -.-> MOD_GOVERNANCE
R_BR_223["BR-223 Negative feedback must include actionable element"]
R_BR_223 --> RULE_GATE
R_BR_223 -.-> MOD_GOVERNANCE
R_BR_224["BR-224 Feedback templates org-configurable"]
R_BR_224 --> RULE_GATE
R_BR_224 -.-> MOD_JOBS
R_BR_225["BR-225 Freshness score computed nightly, immutable per day"]
R_BR_225 --> RULE_GATE
R_BR_225 -.-> MOD_EVIDENCE
R_BR_226["BR-226 Decay curves per skill category, admin-configurable"]
R_BR_226 --> RULE_GATE
R_BR_226 -.-> MOD_EVIDENCE
R_BR_227["BR-227 Freshness 20 demotes to self-reported"]
R_BR_227 --> RULE_GATE
R_BR_227 -.-> MOD_EVIDENCE
R_BR_228["BR-228 Re-verification restores freshness to 100"]
R_BR_228 --> RULE_GATE
R_BR_228 -.-> MOD_EVIDENCE
R_BR_229["BR-229 Self-attestation counts 0.5×"]
R_BR_229 --> RULE_GATE
R_BR_229 -.-> MOD_GOVERNANCE
R_BR_230["BR-230 Freshness visible to candidate always; recruiter-visible only with consent"]
R_BR_230 --> RULE_GATE
R_BR_230 -.-> MOD_EVIDENCE
R_BR_231["BR-231 Market drift alerts opt-in"]
R_BR_231 --> RULE_GATE
R_BR_231 -.-> MOD_SEARCH
R_BR_232["BR-232 Freshness stored historically (time-series)"]
R_BR_232 --> RULE_GATE
R_BR_232 -.-> MOD_EVIDENCE
R_BR_233["BR-233 Max 3 referral requests per 30 days per candidate"]
R_BR_233 --> RULE_GATE
R_BR_233 -.-> MOD_NETWORK
R_BR_234["BR-234 Referrer consent required per request"]
R_BR_234 --> RULE_GATE
R_BR_234 -.-> MOD_GOVERNANCE
R_BR_235["BR-235 Referral tag visible to recruiter (priority signal)"]
R_BR_235 --> RULE_GATE
R_BR_235 -.-> MOD_JOBS
R_BR_236["BR-236 Referral rewards follow org policy; XP default"]
R_BR_236 --> RULE_GATE
R_BR_236 -.-> MOD_NETWORK
R_BR_237["BR-237 System verifies referrer's employment"]
R_BR_237 --> RULE_GATE
R_BR_237 -.-> MOD_GOVERNANCE
R_BR_238["BR-238 No referral request from blocked user"]
R_BR_238 --> RULE_GATE
R_BR_238 -.-> MOD_NETWORK
R_BR_239["BR-239 Referrer max 20 referrals/quarter"]
R_BR_239 --> RULE_GATE
R_BR_239 -.-> MOD_NETWORK
R_BR_240["BR-240 Referral attribution tracked 12 months"]
R_BR_240 --> RULE_GATE
R_BR_240 -.-> MOD_NETWORK
R_BR_241["BR-241 Affiliation verified (email domain or institutional seat)"]
R_BR_241 --> RULE_GATE
R_BR_241 -.-> MOD_COMMUNICATION
R_BR_242["BR-242 Alumni discovery respects privacy settings"]
R_BR_242 --> RULE_GATE
R_BR_242 -.-> MOD_NETWORK
R_BR_243["BR-243 Alumni group default-join, opt-out allowed"]
R_BR_243 --> RULE_GATE
R_BR_243 -.-> MOD_NETWORK
R_BR_244["BR-244 Alumni job postings must be from verified alumni"]
R_BR_244 --> RULE_GATE
R_BR_244 -.-> MOD_JOBS
R_BR_245["BR-245 Alumni mentorship opt-in"]
R_BR_245 --> RULE_GATE
R_BR_245 -.-> MOD_NETWORK
R_BR_246["BR-246 No cross-institution data leakage"]
R_BR_246 --> RULE_GATE
R_BR_246 -.-> MOD_GOVERNANCE
R_BR_247["BR-247 Graduated students retain alumni status"]
R_BR_247 --> RULE_GATE
R_BR_247 -.-> MOD_LEARNING
R_BR_248["BR-248 Alumni networks public or private (institution choice)"]
R_BR_248 --> RULE_GATE
R_BR_248 -.-> MOD_NETWORK
end
subgraph CONDITIONS["13 Explicit implementation conditions read from condition matrix; branches reflect recorded current behavior"]
C_AU_01{"AU-01 Email already registered"}
CY_AU_01["TRUE: 409"]
CN_AU_01["FALSE: account created, 201"]
C_AU_01 -->|TRUE| CY_AU_01
C_AU_01 -->|FALSE| CN_AU_01
C_AU_01 -.-> MOD_COMMUNICATION
CY_AU_01 --> API_HANDLER
CN_AU_01 --> API_ERR
C_AU_02{"AU-02 Sign-up role is candidate or recruiter"}
CY_AU_02["TRUE: accepted"]
CN_AU_02["FALSE: 400"]
C_AU_02 -->|TRUE| CY_AU_02
C_AU_02 -->|FALSE| CN_AU_02
C_AU_02 -.-> MOD_JOBS
CY_AU_02 --> API_HANDLER
CN_AU_02 --> API_ERR
C_AU_03{"AU-03 Password length 8 to 256"}
CY_AU_03["TRUE: accepted"]
CN_AU_03["FALSE: 400"]
C_AU_03 -->|TRUE| CY_AU_03
C_AU_03 -->|FALSE| CN_AU_03
C_AU_03 -.-> MOD_GOVERNANCE
CY_AU_03 --> API_HANDLER
CN_AU_03 --> API_ERR
C_AU_04{"AU-04 Login password correct for a known email"}
CY_AU_04["TRUE: 200 and token"]
CN_AU_04["FALSE: 401 with the same text as unknown email (decoy hash runs)"]
C_AU_04 -->|TRUE| CY_AU_04
C_AU_04 -->|FALSE| CN_AU_04
C_AU_04 -.-> MOD_COMMUNICATION
CY_AU_04 --> API_HANDLER
CN_AU_04 --> API_ERR
C_AU_05{"AU-05 Login attempts under 10 per 15 min per IP and email"}
CY_AU_05["TRUE: allowed"]
CN_AU_05["FALSE: 429"]
C_AU_05 -->|TRUE| CY_AU_05
C_AU_05 -->|FALSE| CN_AU_05
C_AU_05 -.-> MOD_COMMUNICATION
CY_AU_05 --> API_HANDLER
CN_AU_05 --> API_ERR
C_AU_06{"AU-06 Sign-ups under 20 per 15 min per IP"}
CY_AU_06["TRUE: allowed"]
CN_AU_06["FALSE: 429"]
C_AU_06 -->|TRUE| CY_AU_06
C_AU_06 -->|FALSE| CN_AU_06
C_AU_06 -.-> MOD_GOVERNANCE
CY_AU_06 --> API_HANDLER
CN_AU_06 --> API_ERR
C_AU_07{"AU-07 Global requests under 300 per 60 s per user or IP"}
CY_AU_07["TRUE: allowed"]
CN_AU_07["FALSE: 429"]
C_AU_07 -->|TRUE| CY_AU_07
C_AU_07 -->|FALSE| CN_AU_07
C_AU_07 -.-> MOD_GOVERNANCE
CY_AU_07 --> API_HANDLER
CN_AU_07 --> API_ERR
C_AU_08{"AU-08 Token has a 'sessionId'"}
CY_AU_08["TRUE: sign-out revokes it"]
CN_AU_08["FALSE: ' ended:false '; lives until expiry (24 h)"]
C_AU_08 -->|TRUE| CY_AU_08
C_AU_08 -->|FALSE| CN_AU_08
C_AU_08 -.-> MOD_IDENTITY
CY_AU_08 --> API_HANDLER
CN_AU_08 --> API_ERR
C_AU_09{"AU-09 'issuedAt' before 'sessionsValidAfter'"}
CY_AU_09["TRUE: 401"]
CN_AU_09["FALSE: pass"]
C_AU_09 -->|TRUE| CY_AU_09
C_AU_09 -->|FALSE| CN_AU_09
C_AU_09 -.-> MOD_IDENTITY
CY_AU_09 --> API_HANDLER
CN_AU_09 --> API_ERR
C_AU_10{"AU-10 Account status not active and route not allowed"}
CY_AU_10["TRUE: 403"]
CN_AU_10["FALSE: pass"]
C_AU_10 -->|TRUE| CY_AU_10
C_AU_10 -->|FALSE| CN_AU_10
C_AU_10 -.-> MOD_IDENTITY
CY_AU_10 --> API_HANDLER
CN_AU_10 --> API_ERR
C_AU_11{"AU-11 No account row"}
CY_AU_11["TRUE: pg storage: 401; memory storage: signed claims trusted"]
CN_AU_11["FALSE: n/a"]
C_AU_11 -->|TRUE| CY_AU_11
C_AU_11 -->|FALSE| CN_AU_11
C_AU_11 -.-> MOD_IDENTITY
CY_AU_11 --> API_HANDLER
CN_AU_11 --> API_ERR
C_AU_12{"AU-12 Only a platform admin may change roles; may not remove their own admin role"}
CY_AU_12["TRUE: allowed"]
CN_AU_12["FALSE: 403 or rejected"]
C_AU_12 -->|TRUE| CY_AU_12
C_AU_12 -->|FALSE| CN_AU_12
C_AU_12 -.-> MOD_GOVERNANCE
CY_AU_12 --> API_HANDLER
CN_AU_12 --> API_ERR
C_AU_13{"AU-13 'TOKEN_SECRET' at least 32 characters"}
CY_AU_13["TRUE: used as the key"]
CN_AU_13["FALSE: random per-process key (sessions die on restart)"]
C_AU_13 -->|TRUE| CY_AU_13
C_AU_13 -->|FALSE| CN_AU_13
C_AU_13 -.-> MOD_GOVERNANCE
CY_AU_13 --> API_HANDLER
CN_AU_13 --> API_ERR
C_AU_14{"AU-14 Web: a token string exists"}
CY_AU_14["TRUE: page renders"]
CN_AU_14["FALSE: redirect to '/login?return=' (no role check)"]
C_AU_14 -->|TRUE| CY_AU_14
C_AU_14 -->|FALSE| CN_AU_14
C_AU_14 -.-> MOD_GOVERNANCE
CY_AU_14 --> API_HANDLER
CN_AU_14 --> API_ERR
C_AU_15{"AU-15 'return' starts with one slash"}
CY_AU_15["TRUE: follow it"]
CN_AU_15["FALSE: go to '/dashboard'"]
C_AU_15 -->|TRUE| CY_AU_15
C_AU_15 -->|FALSE| CN_AU_15
C_AU_15 -.-> MOD_GOVERNANCE
CY_AU_15 --> API_HANDLER
CN_AU_15 --> API_ERR
C_JB_01{"JB-01 Caller is a member of the organization or platform admin (BR-12)"}
CY_JB_01["TRUE: continue"]
CN_JB_01["FALSE: 403"]
C_JB_01 -->|TRUE| CY_JB_01
C_JB_01 -->|FALSE| CN_JB_01
C_JB_01 -.-> MOD_JOBS
CY_JB_01 --> API_HANDLER
CN_JB_01 --> API_ERR
C_JB_02{"JB-02 Caller has the recruiter or platform_admin role"}
CY_JB_02["TRUE: job created as draft"]
CN_JB_02["FALSE: 403"]
C_JB_02 -->|TRUE| CY_JB_02
C_JB_02 -->|FALSE| CN_JB_02
C_JB_02 -.-> MOD_JOBS
CY_JB_02 --> API_HANDLER
CN_JB_02 --> API_ERR
C_JB_03{"JB-03 Job transition is in the allowed table"}
CY_JB_03["TRUE: continue"]
CN_JB_03["FALSE: 409"]
C_JB_03 -->|TRUE| CY_JB_03
C_JB_03 -->|FALSE| CN_JB_03
C_JB_03 -.-> MOD_JOBS
CY_JB_03 --> API_HANDLER
CN_JB_03 --> API_ERR
C_JB_04{"JB-04 Job is published"}
CY_JB_04["TRUE: visible to everyone"]
CN_JB_04["FALSE: 404 for non-managers"]
C_JB_04 -->|TRUE| CY_JB_04
C_JB_04 -->|FALSE| CN_JB_04
C_JB_04 -.-> MOD_JOBS
CY_JB_04 --> API_HANDLER
CN_JB_04 --> API_ERR
C_AP_01{"AP-01 Caller is a recruiter without the candidate role (BR-02)"}
CY_AP_01["TRUE: 403"]
CN_AP_01["FALSE: continue"]
C_AP_01 -->|TRUE| CY_AP_01
C_AP_01 -->|FALSE| CN_AP_01
C_AP_01 -.-> MOD_JOBS
CY_AP_01 --> API_HANDLER
CN_AP_01 --> API_ERR
C_AP_02{"AP-02 Job is published (BR-16)"}
CY_AP_02["TRUE: continue"]
CN_AP_02["FALSE: 422"]
C_AP_02 -->|TRUE| CY_AP_02
C_AP_02 -->|FALSE| CN_AP_02
C_AP_02 -.-> MOD_JOBS
CY_AP_02 --> API_HANDLER
CN_AP_02 --> API_ERR
C_AP_03{"AP-03 An active application exists for this job and candidate (BR-15)"}
CY_AP_03["TRUE: 409"]
CN_AP_03["FALSE: created as submitted"]
C_AP_03 -->|TRUE| CY_AP_03
C_AP_03 -->|FALSE| CN_AP_03
C_AP_03 -.-> MOD_JOBS
CY_AP_03 --> API_HANDLER
CN_AP_03 --> API_ERR
C_AP_04{"AP-04 Application transition is in the table (BR-41)"}
CY_AP_04["TRUE: continue"]
CN_AP_04["FALSE: 409"]
C_AP_04 -->|TRUE| CY_AP_04
C_AP_04 -->|FALSE| CN_AP_04
C_AP_04 -.-> MOD_JOBS
CY_AP_04 --> API_HANDLER
CN_AP_04 --> API_ERR
C_AP_05{"AP-05 Target is withdrawn: caller is the candidate or admin"}
CY_AP_05["TRUE: allowed"]
CN_AP_05["FALSE: 403"]
C_AP_05 -->|TRUE| CY_AP_05
C_AP_05 -->|FALSE| CN_AP_05
C_AP_05 -.-> MOD_GOVERNANCE
CY_AP_05 --> API_HANDLER
CN_AP_05 --> API_ERR
C_AP_06{"AP-06 Other target: caller is any member of the job's organization or admin (BR-40)"}
CY_AP_06["TRUE: allowed"]
CN_AP_06["FALSE: 403"]
C_AP_06 -->|TRUE| CY_AP_06
C_AP_06 -->|FALSE| CN_AP_06
C_AP_06 -.-> MOD_JOBS
CY_AP_06 --> API_HANDLER
CN_AP_06 --> API_ERR
C_AP_07{"AP-07 Application draft saved"}
CY_AP_07["TRUE: in memory only, lost on restart"]
CN_AP_07["FALSE: n/a"]
C_AP_07 -->|TRUE| CY_AP_07
C_AP_07 -->|FALSE| CN_AP_07
C_AP_07 -.-> MOD_JOBS
CY_AP_07 --> API_HANDLER
CN_AP_07 --> API_ERR
C_WH_01{"WH-01 Dates valid, none in the future, end after start"}
CY_WH_01["TRUE: role created"]
CN_WH_01["FALSE: VALIDATION_FAILED"]
C_WH_01 -->|TRUE| CY_WH_01
C_WH_01 -->|FALSE| CN_WH_01
C_WH_01 -.-> MOD_GOVERNANCE
CY_WH_01 --> API_HANDLER
CN_WH_01 --> API_ERR
C_WH_02{"WH-02 Production or staging and Resend not fully configured"}
CY_WH_02["TRUE: 503, nothing stored"]
CN_WH_02["FALSE: continue"]
C_WH_02 -->|TRUE| CY_WH_02
C_WH_02 -->|FALSE| CN_WH_02
C_WH_02 -.-> MOD_GOVERNANCE
CY_WH_02 --> API_HANDLER
CN_WH_02 --> API_ERR
C_WH_03{"WH-03 Address is not webmail or disposable"}
CY_WH_03["TRUE: continue"]
CN_WH_03["FALSE: VALIDATION_FAILED"]
C_WH_03 -->|TRUE| CY_WH_03
C_WH_03 -->|FALSE| CN_WH_03
C_WH_03 -.-> MOD_AI
CY_WH_03 --> API_HANDLER
CN_WH_03 --> API_ERR
C_WH_04{"WH-04 Role has a company with a website"}
CY_WH_04["TRUE: the address domain must match it"]
CN_WH_04["FALSE: any non-webmail domain passes"]
C_WH_04 -->|TRUE| CY_WH_04
C_WH_04 -->|FALSE| CN_WH_04
C_WH_04 -.-> MOD_GOVERNANCE
CY_WH_04 --> API_HANDLER
CN_WH_04 --> API_ERR
C_WH_05{"WH-05 Referee token present, hash matches and the request is under 30 days old"}
CY_WH_05["TRUE: continue"]
CN_WH_05["FALSE: 404 on view, 403 on submit ('UNAUTHORIZED' maps to 403)"]
C_WH_05 -->|TRUE| CY_WH_05
C_WH_05 -->|FALSE| CN_WH_05
C_WH_05 -.-> MOD_GOVERNANCE
CY_WH_05 --> API_HANDLER
CN_WH_05 --> API_ERR
C_WH_06{"WH-06 Email challenge expired (15 min)"}
CY_WH_06["TRUE: deleted, VALIDATION_FAILED"]
CN_WH_06["FALSE: continue"]
C_WH_06 -->|TRUE| CY_WH_06
C_WH_06 -->|FALSE| CN_WH_06
C_WH_06 -.-> MOD_ASSESSMENT
CY_WH_06 --> API_HANDLER
CN_WH_06 --> API_ERR
C_WH_07{"WH-07 Wrong-code attempts below 5"}
CY_WH_07["TRUE: attempts + 1 and VALIDATION_FAILED"]
CN_WH_07["FALSE: RATE_LIMIT_EXCEEDED; challenge kept"]
C_WH_07 -->|TRUE| CY_WH_07
C_WH_07 -->|FALSE| CN_WH_07
C_WH_07 -.-> MOD_GOVERNANCE
CY_WH_07 --> API_HANDLER
CN_WH_07 --> API_ERR
C_WH_08{"WH-08 Referee equals the candidate (id or email)"}
CY_WH_08["TRUE: CONFLICT"]
CN_WH_08["FALSE: continue"]
C_WH_08 -->|TRUE| CY_WH_08
C_WH_08 -->|FALSE| CN_WH_08
C_WH_08 -.-> MOD_COMMUNICATION
CY_WH_08 --> API_HANDLER
CN_WH_08 --> API_ERR
C_WH_09{"WH-09 Reference status is requested"}
CY_WH_09["TRUE: submit allowed"]
CN_WH_09["FALSE: INVALID_STATE_TRANSITION"]
C_WH_09 -->|TRUE| CY_WH_09
C_WH_09 -->|FALSE| CN_WH_09
C_WH_09 -.-> MOD_GOVERNANCE
CY_WH_09 --> API_HANDLER
CN_WH_09 --> API_ERR
C_WH_10{"WH-10 Ratings are integers 1 to 5"}
CY_WH_10["TRUE: continue"]
CN_WH_10["FALSE: VALIDATION_FAILED"]
C_WH_10 -->|TRUE| CY_WH_10
C_WH_10 -->|FALSE| CN_WH_10
C_WH_10 -.-> MOD_GOVERNANCE
CY_WH_10 --> API_HANDLER
CN_WH_10 --> API_ERR
C_WH_11{"WH-11 Verification score thresholds"}
CY_WH_11["TRUE: 25 verified, 50 silver, 80 gold; email +40"]
CN_WH_11["FALSE: lower tier"]
C_WH_11 -->|TRUE| CY_WH_11
C_WH_11 -->|FALSE| CN_WH_11
C_WH_11 -.-> MOD_EVIDENCE
CY_WH_11 --> API_HANDLER
CN_WH_11 --> API_ERR
C_WH_12{"WH-12 Viewer is not the owner or an admin"}
CY_WH_12["TRUE: email hidden; referee names and ratings hidden; average shown only with at least 3 ratings"]
CN_WH_12["FALSE: full detail"]
C_WH_12 -->|TRUE| CY_WH_12
C_WH_12 -->|FALSE| CN_WH_12
C_WH_12 -.-> MOD_GOVERNANCE
CY_WH_12 --> API_HANDLER
CN_WH_12 --> API_ERR
C_WH_13{"WH-13 Only the owner may delete a role"}
CY_WH_13["TRUE: allowed"]
CN_WH_13["FALSE: 403 (admins too)"]
C_WH_13 -->|TRUE| CY_WH_13
C_WH_13 -->|FALSE| CN_WH_13
C_WH_13 -.-> MOD_GOVERNANCE
CY_WH_13 --> API_HANDLER
CN_WH_13 --> API_ERR
C_CB_01{"CB-01 At least 20 different people made the move (BR-160)"}
CY_CB_01["TRUE: benchmark published"]
CN_CB_01["FALSE: 'insufficient_data'; no figures"]
C_CB_01 -->|TRUE| CY_CB_01
C_CB_01 -->|FALSE| CN_CB_01
C_CB_01 -.-> MOD_GOVERNANCE
CY_CB_01 --> API_HANDLER
CN_CB_01 --> API_ERR
C_CB_02{"CB-02 Caller asks for a lower threshold"}
CY_CB_02["TRUE: ignored; floor stays 20"]
CN_CB_02["FALSE: n/a"]
C_CB_02 -->|TRUE| CY_CB_02
C_CB_02 -->|FALSE| CN_CB_02
C_CB_02 -.-> MOD_GOVERNANCE
CY_CB_02 --> API_HANDLER
CN_CB_02 --> API_ERR
C_CB_03{"CB-03 Skill has recorded market signals"}
CY_CB_03["TRUE: forecast computed"]
CN_CB_03["FALSE: 404 (single skill); skill omitted (ranking)"]
C_CB_03 -->|TRUE| CY_CB_03
C_CB_03 -->|FALSE| CN_CB_03
C_CB_03 -.-> MOD_EVIDENCE
CY_CB_03 --> API_HANDLER
CN_CB_03 --> API_ERR
C_CB_04{"CB-04 Who may record a market signal"}
CY_CB_04["TRUE: any signed-in account"]
CN_CB_04["FALSE: 401 when anonymous"]
C_CB_04 -->|TRUE| CY_CB_04
C_CB_04 -->|FALSE| CN_CB_04
C_CB_04 -.-> MOD_GOVERNANCE
CY_CB_04 --> API_HANDLER
CN_CB_04 --> API_ERR
C_LI_01{"LI-01 Learner is enrolled and has not recorded an outcome (REV-01)"}
CY_LI_01["TRUE: outcome recorded"]
CN_LI_01["FALSE: 403 or 409"]
C_LI_01 -->|TRUE| CY_LI_01
C_LI_01 -->|FALSE| CN_LI_01
C_LI_01 -.-> MOD_GOVERNANCE
CY_LI_01 --> API_HANDLER
CN_LI_01 --> API_ERR
C_LI_02{"LI-02 Cohort of at least 30 outcomes (BR-189)"}
CY_LI_02["TRUE: impact published"]
CN_LI_02["FALSE: insufficient-data message"]
C_LI_02 -->|TRUE| CY_LI_02
C_LI_02 -->|FALSE| CN_LI_02
C_LI_02 -.-> MOD_GOVERNANCE
CY_LI_02 --> API_HANDLER
CN_LI_02 --> API_ERR
C_BL_01{"BL-01 'BILLING_MODE' is stripe"}
CY_BL_01["TRUE: Stripe routes active"]
CN_BL_01["FALSE: routes answer 503 'not enabled'"]
C_BL_01 -->|TRUE| CY_BL_01
C_BL_01 -->|FALSE| CN_BL_01
C_BL_01 -.-> MOD_BILLING
CY_BL_01 --> API_HANDLER
CN_BL_01 --> API_ERR
C_BL_02{"BL-02 Signature valid over the raw body"}
CY_BL_02["TRUE: event processed"]
CN_BL_02["FALSE: 401, nothing changed"]
C_BL_02 -->|TRUE| CY_BL_02
C_BL_02 -->|FALSE| CN_BL_02
C_BL_02 -.-> MOD_GOVERNANCE
CY_BL_02 --> API_HANDLER
CN_BL_02 --> API_ERR
C_BL_03{"BL-03 Event id already recorded"}
CY_BL_03["TRUE: replayed, no change"]
CN_BL_03["FALSE: processed"]
C_BL_03 -->|TRUE| CY_BL_03
C_BL_03 -->|FALSE| CN_BL_03
C_BL_03 -.-> MOD_GOVERNANCE
CY_BL_03 --> API_HANDLER
CN_BL_03 --> API_ERR
C_BL_04{"BL-04 Subscription event older than stored state"}
CY_BL_04["TRUE: recorded only"]
CN_BL_04["FALSE: state updated"]
C_BL_04 -->|TRUE| CY_BL_04
C_BL_04 -->|FALSE| CN_BL_04
C_BL_04 -.-> MOD_BILLING
CY_BL_04 --> API_HANDLER
CN_BL_04 --> API_ERR
C_BL_05{"BL-05 Subscription price in the server catalog and status active or trialing"}
CY_BL_05["TRUE: paid tier and entitlements"]
CN_BL_05["FALSE: free tier"]
C_BL_05 -->|TRUE| CY_BL_05
C_BL_05 -->|FALSE| CN_BL_05
C_BL_05 -.-> MOD_BILLING
CY_BL_05 --> API_HANDLER
CN_BL_05 --> API_ERR
C_BL_06{"BL-06 Checkout while a paid subscription is live"}
CY_BL_06["TRUE: 409"]
CN_BL_06["FALSE: session created"]
C_BL_06 -->|TRUE| CY_BL_06
C_BL_06 -->|FALSE| CN_BL_06
C_BL_06 -.-> MOD_BILLING
CY_BL_06 --> API_HANDLER
CN_BL_06 --> API_ERR
C_BL_07{"BL-07 Full refund of the live subscription's current-period charge"}
CY_BL_07["TRUE: cancel at Stripe, access ends"]
CN_BL_07["FALSE: recorded only"]
C_BL_07 -->|TRUE| CY_BL_07
C_BL_07 -->|FALSE| CN_BL_07
C_BL_07 -.-> MOD_BILLING
CY_BL_07 --> API_HANDLER
CN_BL_07 --> API_ERR
C_BL_08{"BL-08 Customer already linked to another account"}
CY_BL_08["TRUE: event ignored"]
CN_BL_08["FALSE: link created"]
C_BL_08 -->|TRUE| CY_BL_08
C_BL_08 -->|FALSE| CN_BL_08
C_BL_08 -.-> MOD_IDENTITY
CY_BL_08 --> API_HANDLER
CN_BL_08 --> API_ERR
C_BL_09{"BL-09 Deployed with 'BILLING_MODE=simulated'"}
CY_BL_09["TRUE: refused at boot"]
CN_BL_09["FALSE: allowed"]
C_BL_09 -->|TRUE| CY_BL_09
C_BL_09 -->|FALSE| CN_BL_09
C_BL_09 -.-> MOD_BILLING
CY_BL_09 --> API_HANDLER
CN_BL_09 --> API_ERR
C_ST_01{"ST-01 'STORAGE': explicit, else process env, else memory under test, else pg"}
CY_ST_01["TRUE: n/a"]
CN_ST_01["FALSE: n/a"]
C_ST_01 -->|TRUE| CY_ST_01
C_ST_01 -->|FALSE| CN_ST_01
C_ST_01 -.-> MOD_COMMUNITY
CY_ST_01 --> API_HANDLER
CN_ST_01 --> API_ERR
C_ST_02{"ST-02 pg and database unreachable"}
CY_ST_02["TRUE: refuse to start"]
CN_ST_02["FALSE: continue"]
C_ST_02 -->|TRUE| CY_ST_02
C_ST_02 -->|FALSE| CN_ST_02
C_ST_02 -.-> MOD_GOVERNANCE
CY_ST_02 --> API_HANDLER
CN_ST_02 --> API_ERR
C_ST_03{"ST-03 Advisory lock (718201,1) acquired"}
CY_ST_03["TRUE: continue"]
CN_ST_03["FALSE: refuse: second writer"]
C_ST_03 -->|TRUE| CY_ST_03
C_ST_03 -->|FALSE| CN_ST_03
C_ST_03 -.-> MOD_GOVERNANCE
CY_ST_03 --> API_HANDLER
CN_ST_03 --> API_ERR
C_ST_04{"ST-04 Lease lost while running"}
CY_ST_04["TRUE: 503 on every request"]
CN_ST_04["FALSE: normal"]
C_ST_04 -->|TRUE| CY_ST_04
C_ST_04 -->|FALSE| CN_ST_04
C_ST_04 -.-> MOD_GOVERNANCE
CY_ST_04 --> API_HANDLER
CN_ST_04 --> API_ERR
C_ST_05{"ST-05 Deployed with memory storage, weak or published token secret, PBKDF2 below 210000, default database URL"}
CY_ST_05["TRUE: exit 1"]
CN_ST_05["FALSE: continue"]
C_ST_05 -->|TRUE| CY_ST_05
C_ST_05 -->|FALSE| CN_ST_05
C_ST_05 -.-> MOD_GOVERNANCE
CY_ST_05 --> API_HANDLER
CN_ST_05 --> API_ERR
C_ST_06{"ST-06 Job handler outcome"}
CY_ST_06["TRUE: success completes; permanent error fails; other error retries below 3 attempts then dead; no handler is dead"]
CN_ST_06["FALSE: n/a"]
C_ST_06 -->|TRUE| CY_ST_06
C_ST_06 -->|FALSE| CN_ST_06
C_ST_06 -.-> MOD_JOBS
CY_ST_06 --> API_HANDLER
CN_ST_06 --> API_ERR
C_ST_07{"ST-07 Worker heartbeat 45 s or newer"}
CY_ST_07["TRUE: alive"]
CN_ST_07["FALSE: degraded"]
C_ST_07 -->|TRUE| CY_ST_07
C_ST_07 -->|FALSE| CN_ST_07
C_ST_07 -.-> MOD_COMMUNICATION
CY_ST_07 --> API_HANDLER
CN_ST_07 --> API_ERR
C_ST_08{"ST-08 Route not in the durable or stateless lists"}
CY_ST_08["TRUE: response carries 'x-talentsphere-durability: ephemeral'"]
CN_ST_08["FALSE: no header"]
C_ST_08 -->|TRUE| CY_ST_08
C_ST_08 -->|FALSE| CN_ST_08
C_ST_08 -.-> MOD_GOVERNANCE
CY_ST_08 --> API_HANDLER
CN_ST_08 --> API_ERR
end
subgraph ASYNC["14 Durable background processing and communications"]
JOBTABLE[("background_jobs: kind, payload, status, attempts, run_after, lock expiry, fence")]
ENQUEUE["API dispatch after/with durable DB event; email jobs for referee and work-history challenges"]
CLAIM["Worker claim loop: FOR UPDATE SKIP LOCKED; lease + attempts fence; safe batch"]
HANDLER{"Registered job kind and lease time sufficient for bounded handler?"}
EMAIL["Email templates + provider-independent EmailService + Brevo adapter"]
DEVOUT["Development DEV OUTBOX: rendered only; NOT sent"]
DELIVERY["Provider accepts request with job ID idempotency key; acceptance is not inbox delivery"]
RETRY{"Transient failure and attempts below max?"}
RETRYQ["Retry with backoff; lease expires / redelivery"]
DEAD["Permanent / unknown handler / retries exhausted → dead-letter and alert"]
ACK["Fenced completion acknowledgement; cancellation/superseded outcome"]
HEART["worker_health heartbeat; API diagnostics can inspect queue; liveness alerting still needs operational proof"]
API_HANDLER --> ENQUEUE --> JOBTABLE --> CLAIM --> HANDLER
CLAIM --> HEART
HANDLER -->|email kind| EMAIL
HANDLER -->|event record kind| ACK
EMAIL -->|development + no provider| DEVOUT
EMAIL -->|configured provider| DELIVERY
EMAIL -->|configuration or delivery error| RETRY
RETRY -->|TRUE| RETRYQ --> JOBTABLE
RETRY -->|FALSE| DEAD
DELIVERY --> ACK
SVC --> CLAIM
end
subgraph EXT["15 External integrations and provider boundaries"]
STRIPE["Stripe SDK gateway: customer, Checkout, Portal, cancel, invoice/subscription/refund normalization"]
STRIPE_SIG{"Webhook signature valid over raw request bytes?"}
STRIPE_EVENT["billing_events idempotency by Stripe event ID; reconcile subscription and entitlements"]
BREVO["Brevo transactional email API; requires API key, verified sender/domain and mailbox test"]
SUPABASE["Supabase PostgreSQL hosting target; Supabase Auth / Storage / Realtime / Queues are not current adapters"]
AI_LOCAL["AI gateway: local heuristic implementation; prompt firewall/quota in one path; second assistant route has gaps"]
AI_REMOTE["Remote model provider / BYO key execution: not connected; consent, entitlement and cost policy gates unresolved"]
MEDIA["Media object storage / CDN / transcoding: target only; no current provider pipeline"]
OAUTH["OAuth / external identity providers: target only; not implemented"]
API_HANDLER --> STRIPE
STRIPE --> STRIPE_SIG
STRIPE_SIG -->|TRUE| STRIPE_EVENT --> SPECIALSTORE
STRIPE_SIG -->|FALSE| API_ERR
EMAIL --> BREVO
PG --> SUPABASE
API_HANDLER --> AI_LOCAL
AI_LOCAL -.-> AI_REMOTE
PWA -.-> MEDIA
PWA -.-> OAUTH
end
subgraph BILLING["16 Billing, subscription and entitlement lifecycle"]
BILLING_MODE{"BILLING_MODE = disabled, simulated or stripe?"}
BILL_DISABLED["disabled default: checkout/paid activation denied; no paid entitlement"]
BILL_SIM["simulated: development/test only; production refused"]
BILL_STRIPE["stripe: server-side price catalog; role-plan mapping; create customer/checkout"]
PAID{"Signed provider event maps to known user, known catalog price and paid/live subscription?"}
ENTITLE["Durably reconcile subscription, invoice, customer, provider event and entitlements"]
NO_ENTITLE["Ignore unknown/superseded/duplicate event or deny paid activation"]
BILLING_MODE -->|disabled| BILL_DISABLED
BILLING_MODE -->|simulated| BILL_SIM
BILLING_MODE -->|stripe| BILL_STRIPE
BILL_STRIPE --> STRIPE
STRIPE_EVENT --> PAID
PAID -->|TRUE| ENTITLE --> SPECIALSTORE
PAID -->|FALSE| NO_ENTITLE
end
subgraph SECURITY["17 Security, privacy and governance controls"]
SEC["Password PBKDF2; HMAC session; rate limits; CORS; trusted proxy; Zod; SQL parameterization; webhook signature"]
TENANT["Owner/participant/org membership checks; RLS policies and grants; tenant boundaries; server-derived trust flags"]
AI_POLICY["AI policy: AI_PROHIBITED assessment mode; user consent; cost/entitlement; human review; no automatic evidence"]
PRIVACY["Settings / data export / erasure request, status, cancel and execute; retention, legal text and 30-day policy unresolved"]
AUDIT["Admin audit logs; moderation reports/appeals; feature flags; governance actions"]
PRIVACY_DEC{"Erasure policy approved and grace period / due scheduler / backup deletion behavior implemented?"}
PRIVACY_HOLD["Do not claim compliant scheduled erasure; current execute route may execute immediately"]
PRIVACY_OK["Execute approved lifecycle with durable status, idempotent cleanup, recovery and audit"]
SEC --> API_MW
TENANT --> API_AUTH
AI_POLICY --> AI_LOCAL
PRIVACY --> SPECIALSTORE
AUDIT --> SPECIALSTORE
PRIVACY --> PRIVACY_DEC
PRIVACY_DEC -->|FALSE| PRIVACY_HOLD
PRIVACY_DEC -->|TRUE| PRIVACY_OK
end
subgraph FAILURE["18 Error, resilience, cancellation and recovery outcomes"]
FAIL["Failure classes: validation / auth / forbidden / not-found / conflict / provider / DB / timeout / lease lapse / quota / policy"]
RECOVER{"Failure is transient, safe to retry and idempotency/fencing guarantees hold?"}
RETRY_API["Client retry with bounded backoff and same idempotency key; refresh stale version after 409"]
REPAIR["Operational recovery: inspect logs, audit, queue, DB, provider; reconcile state; replay only idempotent events"]
CANCEL["Cancellation: stop before commit where possible; job cancel cooperative at acknowledgement; side effects may already have happened"]
TERMINAL(["Terminal outcomes: success / rejected / not found / conflict / degraded / dead-letter / canceled / manual intervention"])
API_ERR --> FAIL
FAIL --> RECOVER
RECOVER -->|TRUE| RETRY_API --> API_ROUTER
RECOVER -->|FALSE| REPAIR --> TERMINAL
FAIL --> CANCEL --> TERMINAL
API_OK --> TERMINAL
DEAD --> TERMINAL
PRIVACY_HOLD --> TERMINAL
end
subgraph OPS["19 Runtime, deployment, observability and operations"]
WEBHOST["Static web hosting / HTTPS reverse proxy / Caddy target"]
APIHOST["API container: exactly one replica per DB until read-model exit path"]
WORKHOST["Worker container: durable queue poller; heartbeat; separate process"]
DBHOST["PostgreSQL volume / managed Supabase DB; migrations; connection pool"]
SECRETS["Environment secrets: DATABASE_URL, TOKEN_SECRET, CORS_ALLOWED_ORIGINS, TRUST_PROXY, billing/email secrets"]
LOGS["Structured JSON logs / request IDs / audit trail"]
METRICS["Target metrics: API latency/errors, DB saturation, queue age/depth, worker heartbeat, webhook failures, mail delivery, AI cost"]
BACKUP["Backup + restore + PITR where supported + storage/config/queue recovery + rollback rehearsal"]
RELEASE{"Security, migrations, critical E2E, accessibility, performance, restore, observability and owner sign-off all evidenced?"}
RELEASE_GO["Release candidate accepted for defined scope"]
RELEASE_NO["Release blocked; retain staging/preview; remediate and rerun gates"]
WEBHOST --> PWA
APIHOST --> API_ROUTER
WORKHOST --> CLAIM
DBHOST --> PG
SECRETS --> APIHOST
SECRETS --> WORKHOST
API_ROUTER --> LOGS
CLAIM --> LOGS
PG --> METRICS
LOGS --> METRICS
PG --> BACKUP
BACKUP --> RELEASE
METRICS --> RELEASE
RELEASE -->|TRUE| RELEASE_GO --> TERMINAL
RELEASE -->|FALSE| RELEASE_NO --> FAIL
end
subgraph QA["20 Testing and evidence gates"]
UNIT["Vitest unit: domain rules, contracts, helpers, config, migration integrity, email/billing"]
INTEGRATION["Vitest integration: Fastify routes, authz, persistence honesty, providers, workflows"]
PGTEST["PostgreSQL tests: transaction, isolation, RLS, concurrency, migrations, queue fencing"]
E2E["Playwright: browser journeys, auth, jobs, evidence, learning, messaging, admin, responsive, accessibility, performance"]
CI["GitHub Actions CI: install/build/typecheck/test/lint workflows; current run evidence must be rechecked"]
BROWSER["Reticle browser verification for user-visible changes; docs-only changes skip browser verdict"]
TESTRESULT{"Relevant test passes on current commit and environment evidence available?"}
TESTPASS["Record exact commit, command, environment, count and limitations"]
TESTFAIL["Failure / skipped / blocked / stale evidence remains open; do not claim pass"]
DOMAIN --> UNIT
API_HANDLER --> INTEGRATION
CORESTORE --> PGTEST
PWA --> E2E
API_ROUTER --> CI
PWA --> BROWSER
UNIT --> TESTRESULT
INTEGRATION --> TESTRESULT
PGTEST --> TESTRESULT
E2E --> TESTRESULT
CI --> TESTRESULT
BROWSER --> TESTRESULT
TESTRESULT -->|TRUE| TESTPASS --> RELEASE
TESTRESULT -->|FALSE| TESTFAIL --> FAIL
end
subgraph TRACE["21 Evidence and traceability boundary"]
IMPL["Implemented: source path + test path + durable storage evidence"]
PART["Partial: source exists but persistence, policy, end-to-end or acceptance incomplete"]
SPEC["Specified: SSOT / feature registry / business rule registry only"]
PROPOSED["Proposed: architecture target not present in current runtime"]
UNKNOWN["Unresolved: owner decision, live service evidence or uninspected behavior missing"]
FOUND --> IMPL
FOUND --> PART
FOUND --> SPEC
FOUND --> PROPOSED
FOUND --> UNKNOWN
IMPL --> TESTRESULT
PART --> RELEASE
SPEC --> RULES
PROPOSED --> RELEASE
UNKNOWN --> TERMINAL
end
classDef actor fill:#e9f2ff,stroke:#3465a4,color:#142b45
classDef screen fill:#f0edff,stroke:#6652a3,color:#241a4a
classDef feature fill:#edf8f1,stroke:#3c8058,color:#173d27
classDef api fill:#fff3df,stroke:#ad7625,color:#50350c
classDef data fill:#e8f7f8,stroke:#27818a,color:#12383b
classDef decision fill:#fff0f0,stroke:#a94343,color:#4c1616
classDef external fill:#f4f0e8,stroke:#8b7752,color:#3d321e
classDef outcome fill:#eeeeee,stroke:#666,color:#222
class CAND,RECR,HM,INST,REF,ADMIN,ANON,SVC actor
class PWA,LAYOUT,SESSION,PUBLIC,CANDP,RECRP,SHARED,UISTATE screen
class API_ROUTER,API_MW,API_HANDLER,CONTRACTS,DOMAIN,CONFIG,OBS api
class PG,CORESTORE,READMODEL,SPECIALSTORE,EPHEMERAL,JOBTABLE data
class API_AUTH,API_SCHEMA,TX,ONEWRITER,AUTHDEC,RULE_GATE,PRIVACY_DEC,STRIPE_SIG,PAID,RECOVER,RELEASE,TESTRESULT decision
class STRIPE,BREVO,SUPABASE,AI_REMOTE,MEDIA,OAUTH external
class API_ERR,API_OK,TERMINAL,RELEASE_GO,RELEASE_NO,TESTPASS,TESTFAIL outcome
```

## 4. Canonical feature inventory and dependency traceability

The feature nodes in the master diagram use the following stable registry IDs, priorities, phases and dependency references. Priority/phase/dependency values are product-planning metadata, not implementation status.

| ID | Feature | Category | Priority | Phase | Dependencies |
|---|---|---|---:|---|---|
| F-01 | Authentication & Session | Identity | 10 | Ph0 | – |
| F-02 | Landing Page | Shell | 3 | Ph0 | – |
| F-03 | Dashboard (Role-Adaptive) | Shell | 10 | Ph0 | F-01 |
| F-04 | Job Marketplace | Marketplace | 9 | Ph2 | F-01, F-12 |
| F-05 | Post Job Studio | Marketplace | 8 | Ph2 | F-04 |
| F-06 | ATS / Candidate Pipeline | Recruiting | 9 | Ph2–3 | F-04, F-05 |
| F-07 | Learning Management System | Learning | 9 | Ph1 | F-01, F-12 |
| F-08 | Challenges Arena | Assessment | 9 | Ph1 | F-01, F-12 |
| F-09 | Professional Networking | Social | 8 | Ph2 | F-12 |
| F-10 | Direct Messaging | Communication | 10 | Ph0 | F-01 |
| F-11 | AI Career Assistant (Basic) | AI | 8 | Ph1/Ph4 | F-12 |
| F-12 | Profile Management | Identity | 10 | Ph0 | F-01 |
| F-13 | Resume Builder | Identity | 7 | Ph1 | F-12 |
| F-14 | Notification Center | Communication | 10 | Ph0 | F-01 |
| F-15 | Settings | Shell | 10 | Ph0 | F-01 |
| F-16 | Billing & Subscriptions | Monetization | 7 | Ph5 | F-01 |
| F-17 | Admin Console | Governance | 10 | Ph0 | F-01 |
| F-18 | Chrome Extension Companion | Edge | 5 | Ph2 | F-01 |
| F-19 | Product Analytics | Telemetry | 7 | Ph1 | F-01 |
| F-20 | Command Search (⌘K) | Shell | 7 | Ph2 | F-01 |
| F-21 | Error Recovery & Resilience | Shell | 10 | Ph0 | F-01 |
| F-22 | Gamification & XP Ledger | Engagement | 8 | Ph1 | F-07, F-08 |
| F-23 | Leaderboard & Badges | Engagement | 7 | Ph2 | F-22 |
| F-24 | Trust, Safety & Moderation | Safety | 8 | Ph2 | F-01 |
| F-25 | Job Detail View | Marketplace | 7 | Ph2 | F-04 |
| F-26 | Portfolio Showcase | Identity | 8 | Ph1 | F-12 |
| F-27 | Local Resume Match Preview | Edge | 6 | Ph2 | F-18 |
| F-28 | External Job Page Scanner | Edge | 6 | Ph2 | F-18 |
| F-29 | Scheduled Notification Digest | Communication | 7 | Ph2 | F-14 |
| F-30 | Networking Stale-Request Nudges | Engagement | 6 | Ph2 | F-09 |
| F-31 | KPI Aggregation & Rollups | Analytics | 6 | Ph2 | F-19 |
| F-32 | Saved Searches & Job Alerts | Candidate | 7 | Ph2 | F-04 |
| F-33 | Video Interview Rooms | Communication | 8 | Ph3 | F-10 |
| F-34 | Multi-Entity Backend Search | Platform | 7 | Ph2 | F-04, F-07 |
| F-35 | Feature Flag Console | Administration | 6 | Ph2 | F-17 |
| F-36 | Application Draft Autosave | Candidate | 7 | Ph1 | F-04 |
| F-37 | Job Templates | Recruiting | 6 | Ph2 | F-05 |
| F-38 | Legacy Chat Service (DEPRECATED) | Communication | 0 | – | – |
| F-39 | Unified Backend Stub (DEPRECATED) | Platform | 0 | – | – |
| F-40 | Institutional Managed Learning | Institutions | 8 | Ph3 | F-01, F-07 |
| F-41 | Procurement & Seat Licensing | Institutions | 6 | Ph6 | F-40, F-16 |
| F-42 | Provider-Agnostic Media Engine | Platform | 8 | Ph2 | F-07 |
| F-43 | B2B2C Graduation Flywheel | Institutions | 6 | Ph3 | F-40 |
| F-44 | AI Media Enrichment | Learning | 6 | Ph4 | F-42, F-11 |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | Learning | 4 | Ph10 | F-40, F-115 |
| F-46 | Institutional Analytics | Institutions | 6 | Ph3 | F-40 |
| F-47 | Faculty Dashboard | Institutions | 6 | Ph3 | F-40 |
| F-48 | OS Shell & Workbench | OS | 4 | Ph2+ | F-01, F-03 |
| F-49 | Automation & Agents | OS | 4 | Ph3+ | F-48 |
| F-50 | Institutional Course Marketplace | Institutions | 6 | Ph3 | F-40, F-42 |
| F-51 | Media Health Monitoring | Platform | 6 | Ph4 | F-42 |
| F-52 | Certificate Verification | Verification | 8 | Ph3 | F-07 |
| F-53 | Professional Social Graph & Feed | Networking | 5 | Ph8 | F-12 |
| F-54 | Content Publishing | Networking | 5 | Ph8 | F-12 |
| F-55 | Groups & Communities | Community | 5 | Ph8 | F-53 |
| F-56 | Organization & Institution Pages | Recruiting | 5 | Ph8 | F-12, F-40 |
| F-57 | Events & Webinars | Community | 5 | Ph8 | F-53 |
| F-58 | Written Recommendations | Networking | 6 | Ph8 | F-53 |
| F-59 | Outreach Credits (TalentMail) | Recruiting | 5 | Ph8 | F-10 |
| F-60 | Profile Views & Privacy Controls | Networking | 6 | Ph8 | F-12 |
| F-61 | Premium Candidate Tier (OD-34 gated) | Business | 4 | Ph10+ | F-60 |
| F-62 | Sponsored Content (NOT RECOMMENDED) | Business | 0 | Ph10+ | – |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | Intelligence | 0 | Ph10+ | – |
| F-64 | LinkedIn Migration Engine | Integration | 5 | Ph1/2 | F-12 |
| F-65 | LinkedIn Decoupling & Independence | Foundation | 8 | Ph1/2 | F-64 |
| F-66 | Course Creation Studio | Learning | 8 | Ph7 | F-07, F-42 |
| F-67 | Categories, Discovery & Comparison | Learning | 6 | Ph7 | F-07, F-145 |
| F-68 | Quizzes, Practice Tests & Final Exams | Learning | 8 | Ph7 | F-07 |
| F-69 | Assignments & Peer Review | Learning | 8 | Ph7 | F-07 |
| F-70 | Learning Paths, Programs & Specializations | Learning | 8 | Ph7 | F-07, F-66 |
| F-71 | Course Q&A, Discussions, Notes | Learning | 6 | Ph7 | F-07 |
| F-72 | Course Reviews & Ratings | Learning | 6 | Ph7 | F-07 |
| F-73 | Course Commerce | Learning | 6 | Ph7 | F-07, F-16 |
| F-74 | Instructor Platform | Learning | 6 | Ph7 | F-07, F-66 |
| F-75 | Employer Insights | Intelligence | 7 | Ph9 | F-12, F-56 |
| F-76 | Coding Contests & Live Leaderboards | Assessment | 5 | Ph9 | F-08 |
| F-77 | Skill Certification Exams | Assessment | 8 | Ph3 | F-08 |
| F-78 | Practice Sets & Interview Prep | Learning | 5 | Ph9 | F-08 |
| F-79 | Articles & Newsletters | Networking | 5 | Ph8 | F-54 |
| F-80 | Profile Enhancements | Profile | 6 | Ph1/Ph8 | F-12 |
| F-81 | Identity Verification | Verification | 3 | Ph9 | F-12 |
| F-82 | Student Learning Analytics | Analytics | 6 | Ph7 | F-07 |
| F-83 | Admin Platform Expansion | Administration | 3 | Ph8 | F-17 |
| F-84 | Skills Graph & Taxonomy | Platform | 10 | Ph1–2 | F-12, F-07, F-08 |
| F-85 | Career Graph & Progression | Intelligence | 9 | Ph3 | F-12, F-04, F-06, F-84 |
| F-86 | Salary Intelligence | Intelligence | 9 | Ph3 | F-04, F-06, F-56 |
| F-87 | Interview Experience Repository | Candidate | 7 | Ph4 | F-04, F-56, F-88 |
| F-88 | Technical Interview Platform | Hiring | 9 | Ph3 | F-08, F-33, F-06 |
| F-89 | Contribution Verification System | Verification | 5 | Ph8 | F-26, F-12 |
| F-90 | Peer Mentorship & Advisor Network | Community | 5 | Ph4 | F-12, F-10, F-55 |
| F-91 | Career Readiness Assessment | Career | 9 | Ph2 | F-84, F-08, F-12 |
| F-92 | Advanced Recruiter Search | Recruiting | 9 | Ph3 | F-12, F-34, F-08, F-96 |
| F-93 | Interview Video Recording & AI Feedback | Hiring | 7 | Ph4 | F-33, F-06, F-88 |
| F-94 | Verified Work History & References | Verification | 7 | Ph3 | F-12, F-58 |
| F-95 | Career Transition Planning | Career | 7 | Ph4 | F-84, F-91, F-07 |
| F-96 | Skill Evidence & Digital Credentials | Verification | 10 | Ph2 | F-12, F-26 |
| F-97 | Real-Time Job Market Analytics | Intelligence | 5 | Ph4 | F-04, F-06 |
| F-98 | Employer Equity & Compensation Intelligence | Intelligence | 7 | Ph3 | F-56, F-86 |
| F-99 | AI Career Coach (Enhanced) | AI | 7 | Ph4 | F-12, F-84, F-91, F-07 |
| F-100 | Peer Project Collaboration | Learning | 4 | Ph5 | F-07, F-69, F-10 |
| F-101 | Badge Marketplace & Recognition | Gamification | 4 | Ph8 | F-23, F-26 |
| F-102 | Hiring Manager Portal | Recruiting | 8 | Ph3 | F-06, F-88 |
| F-103 | Candidate Comparison & Rubric | Recruiting | 6 | Ph3 | F-06, F-92 |
| F-104 | Pre-Hire Assessment Customization | Hiring | 7 | Ph3 | F-06, F-08, F-88 |
| F-105 | Post-Hire Analytics & ROI Tracking | Analytics | 4 | Ph4 | F-102, F-93 |
| F-106 | Skill Prerequisite Engine | Learning | 7 | Ph5 | F-07, F-70, F-84 |
| F-107 | Live Q&A with Instructors | Learning | 6 | Ph5 | F-07, F-71, F-10 |
| F-108 | Expert Network Matching | Networking | 4 | Ph7 | F-09, F-12, F-10 |
| F-109 | Salary Negotiation Guidance | Career | 5 | Ph8 | F-86, F-98 |
| F-110 | Verified Skill Endorsements | Verification | 7 | Ph8 | F-96, F-12, F-58 |
| F-111 | Industry-Specific Learning Hubs | Learning | 4 | Ph8 | F-07, F-55 |
| F-112 | Resume Parsing & Optimization | Candidate | 6 | Ph8 | F-13, F-12 |
| F-113 | Recruiter Outreach Analytics | Recruiting | 6 | Ph8 | F-59, F-06 |
| F-114 | Learning Impact Tracking | Analytics | 9 | Ph4 | F-07, F-04, F-06 |
| F-115 | Certification Exam Platform | Assessment | 9 | Ph3 | F-77, F-45 |
| F-116 | Accessibility & Inclusive Learning | Platform | 7 | Ph8 | F-07, F-44 |
| F-117 | Mobile-First Job Application | Candidate | 5 | Ph8 | F-04, F-33 |
| F-118 | Emerging Skills Detection | Intelligence | 4 | Ph8 | F-84 |
| F-119 | Diversity & Inclusion Analytics | Hiring | 4 | Ph8 | F-06 |
| F-120 | API & Integration Platform | Platform | 2 | Ph10 | F-01, F-34 |
| F-121 | Warm Introduction Paths | Networking | 8 | Ph4 | F-09, F-12, F-56, F-125 |
| F-122 | Application Feedback Loop | Jobs | 9 | Ph3 | F-06, F-04 |
| F-123 | Skill Decay Tracking (Freshness Engine) | Verification | 9 | Ph3 | F-84, F-96 |
| F-124 | Project Marketplace | Learning | 5 | Ph5 | F-07, F-26, F-100 |
| F-125 | Alumni Networks | Networking | 7 | Ph4 | F-12, F-09, F-40 |
| F-126 | Interview Prep Marketplace | Careers | 5 | Ph4 | F-87, F-90, F-88 |
| F-127 | Company Culture Assessment | Companies | 4 | Ph5 | F-56, F-75 |
| F-128 | Offer Comparison Tool | Careers | 7 | Ph4 | F-86, F-98, F-109 |
| F-129 | Leadership Development | Learning | 3 | Ph5 | F-07, F-84 |
| F-130 | Freelance Marketplace | Jobs | 3 | Ph7 | F-04, F-100, F-124 |
| F-131 | Apprenticeship Matching | Jobs | 3 | Ph6 | F-04, F-40 |
| F-132 | Scholarship Discovery | Learning | 3 | Ph6 | F-40, F-07 |
| F-133 | Volunteer Matching | Community | 2 | Ph7 | F-26, F-100 |
| F-134 | Code Review Practice | Skills | 4 | Ph5 | F-08, F-26 |
| F-135 | System Design Practice | Skills | 4 | Ph5 | F-88, F-08 |
| F-136 | Micro-Learning | Learning | 2 | Ph4 | F-07, F-42 |
| F-137 | Spaced Repetition | Learning | 2 | Ph6 | F-07, F-68 |
| F-138 | Study Accountability Partners | Learning | 3 | Ph6 | F-07, F-55 |
| F-139 | Local Communities & Meetups | Networking | 3 | Ph7 | F-09, F-55, F-57 |
| F-140 | Affinity Groups | Community | 3 | Ph7 | F-55, F-09 |
| F-141 | Onboarding Preparation | Careers | 1 | Ph8 | F-06, F-33 |
| F-142 | Referral Request System | Jobs | 8 | Ph4 | F-09, F-04 |
| F-143 | OSS Contribution Discovery | Portfolio | 4 | Ph8 | F-89, F-26 |
| F-144 | Reputation Engine (multi-context) | Platform | 9 | Ph2 | F-96, F-58, F-72 |
| F-145 | Recommendation Engine Core | Platform | 8 | Ph2–3 | F-84, F-144 |
| F-146 | Activity & Contribution Tracking | Platform | 7 | Ph3 | F-123, F-84, F-144 |
| F-147 | Unified Search & Discovery | Platform | 8 | Ph2 | F-84, F-145 |
| F-148 | Instructor Reputation System | Reputation | 8 | Ph7 | F-72, F-144 |
| F-149 | Employer Reputation & Brand System | Reputation | 7 | Ph8 | F-75, F-56, F-144 |
| F-150 | Peer Credibility Networks | Reputation | 7 | Ph8 | F-110, F-144 |
| F-151 | Skill Supply/Demand Forecasting | Intelligence | 7 | Ph4 | F-84, F-86, F-97 |
| F-152 | Career Trajectory Analysis | Intelligence | 7 | Ph4 | F-85, F-86, F-93 |
| F-153 | Learning Impact Dashboard (Enhanced) | Intelligence | 7 | Ph4 | F-114, F-85, F-86 |
| F-154 | Interview Prediction & Benchmarking | Intelligence | 6 | Ph4 | F-88, F-102, F-105 |
| F-155 | Adaptive Learning System | Personalization | 6 | Ph5 | F-07, F-84, F-145 |
| F-156 | Professional Development Plan System | Career | 6 | Ph4–5 | F-91, F-95, F-145 |
| F-157 | Skills Co-Learning Path Optimizer | Learning | 4 | Ph5 | F-84, F-114, F-07 |
| F-158 | Talent Pool Intelligence & Analytics | Recruiting | 6 | Ph3 | F-92, F-84, F-144 |
| F-159 | Behavioral Talent Discovery | Discovery | 6 | Ph4 | F-123, F-84, F-144 |
| F-160 | Talent Segmentation & Classification | Analytics | 5 | Ph4 | F-84, F-85, F-144 |
| F-161 | Internal Mobility & Succession Platform | Enterprise | 3 | Ph6–7 | F-84, F-91, F-132 |
| F-162 | Verified Work History Network & Graph | Verification | 5 | Ph4 | F-94, F-84 |
| F-163 | Credential Wallet & Portability | Credential | 3 | Ph5 | F-96 |
| F-164 | Skills Evidence Narrative & Storytelling | Credential | 4 | Ph5 | F-96, F-26 |
| F-165 | Diversity, Equity & Inclusion Data System | Analytics | 3 | Ph8 | F-119 |
| F-166 | Interview Performance Benchmarking | Analytics | 5 | Ph4 | F-88, F-102 |
| F-167 | Candidate Comparison & Rubric (Enhanced) | Hiring | 5 | Ph3 | F-88, F-103 |
| F-168 | Hiring Prediction & Success Modeling | Analytics | 3 | Ph5 | F-88, F-105 |
| F-169 | Community Contribution Scoring & Recognition | Community | 5 | Ph7 | F-55, F-144 |
| F-170 | Expert Network (Enhanced) | Community | 4 | Ph7 | F-144, F-90 |
| F-171 | Employer Brand Management System | Company | 3 | Ph8 | F-56, F-75, F-149 |
| F-172 | Advanced Compensation Intelligence | Analytics | 4 | Ph8 | F-86, F-98, F-109 |
| F-173 | Company-to-Skills Mapping | Intelligence | 3 | Ph4 | F-84, F-04 |

## 5. Canonical business-rule inventory

All 248 canonical rules are included as individual nodes in the diagram. The following text table preserves their canonical identity. Rule registry status is specification authority only; each rule must be checked against current code and approved policy before implementation claims.

| ID | Canonical rule |
|---|---|
| BR-01 | Only `ROLE_RECRUITER`/`ROLE_ADMIN` may create/edit job postings |
| BR-02 | Only `ROLE_USER` may submit applications; recruiters may not apply |
| BR-03 | Candidates review own applications only; recruiters all for their companies |
| BR-04 | Only recruiters/admins create scorecards and notes |
| BR-05 | User edits own profile only; admin any |
| BR-06 | Flags, audit, settings, user mgmt, moderation are admin-only |
| BR-07 | Billing actions available to recruiters, not users/admins |
| BR-08 | Route-level RBAC matches shared route registry |
| BR-09 | Domain-level authorization backs state-changing commands |
| BR-10 | Job publish-readiness rule server-validated |
| BR-11 | Job lifecycle: draft→pending_approval→approved→scheduled→published→paused→closed→archived |
| BR-12 | Recruiters update/publish/archive only own-company jobs |
| BR-13 | Hidden jobs are client-preference; reversible |
| BR-14 | Saved-search digest runs as service-owned/audited scheduler |
| BR-15 | No duplicate ACTIVE application per user per job (partial UNIQUE + 90-day cooldown post-terminal) |
| BR-16 | No applications to closed/unavailable jobs |
| BR-17 | Application lifecycle server-owned append-only |
| BR-18 | Application drafts autosave 30s; recoverable; versions retained |
| BR-19 | Candidate notes/scorecards recruiter-scoped; never candidate-visible |
| BR-20 | Status-event history append-only |
| BR-21 | Lesson completion idempotent |
| BR-22 | Lesson prerequisites gate progression |
| BR-23 | Course completion → certificate + XP bonus |
| BR-24 | Challenge language allowlist; execution limits per TD-05 |
| BR-25 | XP idempotent UNIQUE(user_id, reference_type, reference_id); daily cap **200 XP/day** |
| BR-26 | Resume exports append-only; artifact soft-delete |
| BR-27 | Analytics metadata whitelist-only; no raw text/tokens/secrets |
| BR-28 | Admin status distinguishes live/inferred/degraded/not-configured |
| BR-29 | Admin actions: confirmation + audit + rollback |
| BR-30 | Extension data stays in chrome.storage.local; no sync/fetch/network |
| BR-31 | Schedulers dry-run default; idempotent delivery keys |
| BR-32 | Subscription state webhook-owned |
| BR-33 | AI drafts never auto-commit to records |
| BR-34 | T&S report lifecycle pending→under_review→resolved/dismissed |
| BR-35 | SUPERSEDED — closures cited in §19.6 |
| BR-036 | Jobs require approved org + verified owner |
| BR-037 | Applications require ≥70% profile |
| BR-038 | Candidates may apply only to open jobs |
| BR-039 | Duplicate applications prevented (DB + app) |
| BR-040 | Recruiters access only their org's applications |
| BR-041 | Strict application state machine |
| BR-042 | Offers require completed HM-scoped scorecard review |
| BR-043 | Resumes are scanned for viruses before text extraction |
| BR-044 | Extracted resume text encrypted at rest |
| BR-045 | Rejection emails sent with configurable delay (default 24h) |
| BR-046 | Course enrollments unique per (user, course) for active status |
| BR-047 | Module progress strictly sequential |
| BR-048 | Course completion requires passing final assessment (≥70%) |
| BR-049 | Challenge submissions run in isolated sandbox |
| BR-050 | Sandbox execution has hard resource limits (30s CPU, 512MB RAM, 1GB disk) |
| BR-051 | Challenge test cases split: public + hidden |
| BR-052 | Plagiarism detection runs asynchronously |
| BR-053 | Badges minted only upon verified milestone completion |
| BR-054 | Referral rewards pay out after referred candidate's first verified hire |
| BR-055 | Subscription changes apply at period boundary (or prorated) |
| BR-056 | Entitlements derive from active subscription only |
| BR-057 | Jobs auto-close after expiry (configurable, default 60 days) |
| BR-058 | Applications auto-archive after 90 days in submitted |
| BR-059 | Moderation flags expire after 7 days if not actioned |
| BR-060 | XP transactions unique per (user, reference_type, reference_id) |
| BR-061 | Profile completeness ≥70% gate for job applications |
| BR-062 | Verified organizations receive accelerated job approval |
| BR-063 | Candidates may request data export; delivered within 30 days |
| BR-064 | Recruiters see verified signals on candidate profiles |
| BR-065 | AI outputs below 0.7 confidence display disclaimer |
| BR-066 | AI outputs below 0.5 confidence are suppressed |
| BR-067 | All admin actions are audit-logged |
| BR-068 | Account termination requires Platform Admin dual approval |
| BR-069 | Interviewer inactivity auto-escalation: 7 business days → HM escalation; 14 days → auto-transition stale_withdrawn |
| BR-070 | Candidate non-response auto-release: 5 business days → reminders; 8 days → candidate_unresponsive |
| BR-071 | Abandoned requisition protection: >21 calendar days → review; 30 days → auto-pause + billing credit |
| BR-072 | Managed learners access course only while org holds unexpired assigned seat |
| BR-073 | Seat revocation triggers 7-day grace; in-progress assessments never interrupted |
| BR-074 | Seat consumption atomic; last-seat concurrency never oversells |
| BR-075 | Revoked seat returns to pool; learner progress and certificates retained |
| BR-076 | Graduation transition retains all verified signals and severs FERPA-restricted records |
| BR-077 | Bulk imports require dry-run validation preview; no silent partial imports |
| BR-078 | Faculty/Proctor hold no org-level billing, licensing, or user-management privileges |
| BR-079 | Employer-facing student showcases require recorded, revocable consent |
| BR-080 | Every org-owned record scoped by `organization_id`; cross-tenant reads prohibited |
| BR-081 | Institutional pricing tiers configurable per course/package; never hard-coded |
| BR-082 | Course-access authorization server-side: org + learner + license + enrollment + validity |
| BR-083 | External media validated before publication; invalid/private/embed-blocked rejected |
| BR-084 | Provider embedding restrictions never bypassed; protected content never downloaded |
| BR-085 | Provider capabilities determine available playback/completion settings |
| BR-086 | Broken external provider isolated to affected content item; course remains functional |
| BR-087 | Platform stores learner progress even for externally hosted playback where trackable |
| BR-088 | Unsupported providers produce explicit errors, never silent broken embeds |
| BR-089 | Authors attest right to use external content before publication |
| BR-090 | Org provider allowlists enforced server-side |
| BR-091 | Course submission requires ≥5 lessons and ≥30 min total content |
| BR-092 | Course requires ≥1 video or text lesson (no quiz-only courses) |
| BR-093 | Structural edits to a published course require a new version |
| BR-094 | Free-preview lessons ≤20% of course content |
| BR-095 | Rating requires ≥20% course progress and verified enrolment |
| BR-096 | Category assignment required before submission |
| BR-097 | Instructor must have an approved profile before publishing |
| BR-098 | Course image ≥750×422, ≤4MB |
| BR-099 | Coupon cannot reduce price below platform minimum |
| BR-100 | Refund window 30 days from purchase (configurable), pro-rated after |
| BR-101 | Instructor earnings = 70% of net revenue after platform commission (configurable) |
| BR-102 | Course announcements limited to 1/day/course |
| BR-103 | Peer review requires ≥2 completed reviews per submission |
| BR-104 | Instructor cannot review or rate own course |
| BR-105 | Course version preserves existing student progress |
| BR-106 | Learning-path courses complete in declared order when sequenced |
| BR-107 | Quiz attempts bounded by configured max; practice quizzes unlimited |
| BR-108 | Graded quiz contributes to course grade; passing score configurable |
| BR-109 | Final exam cumulative; required for course completion when configured |
| BR-110 | Program certificate issued only when all required path courses complete |
| BR-111 | Assignment late submission flagged, graded per instructor policy |
| BR-112 | Auto-grading for code assignments reuses the challenge sandbox |
| BR-113 | Question-bank reuse preserves per-attempt snapshots (no retroactive edits) |
| BR-114 | Course archive/unpublish preserves enrolled-student access per policy |
| BR-115 | All course purchases are idempotent and webhook-owned |
| BR-116 | One reaction per user per target; changeable, never additive |
| BR-117 | One repost per user per post |
| BR-118 | Post edits retain an "edited" marker and version history |
| BR-119 | Comment authors and post authors may moderate; authors may disable comments |
| BR-120 | Mentions notify only if the recipient allows mentions |
| BR-121 | Follows unique; blocked/muted targets cannot be followed |
| BR-122 | Post visibility enforced server-side (public/connections/org/private) |
| BR-123 | Newsletter subscriptions opt-in only; one-click unsubscribe (RFC 8058) |
| BR-124 | Feed must always offer a chronological view; ranking factors disclosed on demand |
| BR-125 | UGC passes pre-publish abuse scan; post rate limits per actor |
| BR-126 | Sponsored content labelled as sponsored; never undisclosed in organic ranking |
| BR-127 | Mute hides content without unfollowing and without notifying the muted party |
| BR-128 | Minors (16+) get private-by-default profiles and restricted outreach |
| BR-129 | Outreach credit consumed on send to a non-connection; refunded on reply within 7 days |
| BR-130 | Outreach weekly caps: 20 (Pro), 50 (Team), custom (Enterprise) |
| BR-131 | Endorsements require an existing connection |
| BR-132 | Written recommendations display only after recipient acceptance |
| BR-133 | Profile-view logging honours the viewer's privacy mode |
| BR-134 | Identity-verification badges only via approved partners; failure never blocks core use |
| BR-135 | Salary aggregates displayed only with ≥5 reports for a role/location cell |
| BR-136 | Anonymous reviews hide identity from employer and public, never from Platform Admin/legal |
| BR-137 | Company responses are appended, never edit the original review |
| BR-138 | Interview questions require moderation before public display |
| BR-139 | Contest submissions locked at server-authoritative end time; clock skew never extends |
| BR-140 | Certification exam pass requires the configured score in a single attempt (retake policy configurable) |
| BR-141 | Skills taxonomy curated by Platform Admin; no user can create canonical skills |
| BR-142 | Skill relationships are directional: `prerequisite_of`, `subskill_of`, `supersedes` |
| BR-143 | Correlations (`correlates_with`) are bidirectional and computed statistically |
| BR-144 | Every course, challenge, job, and candidate skill tag MUST reference a canonical skill |
| BR-145 | Skill market signals update daily from aggregated data |
| BR-146 | Skill graph traversal depth bounded (max 5 hops) |
| BR-147 | Skill relationships must be acyclic for `prerequisite_of` (validated at write time) |
| BR-148 | Emerging skills require minimum 5 independent signals before taxonomy promotion |
| BR-149 | Credentials are append-only; revocation creates a new record with `revoked_at` |
| BR-150 | Every credential has a public verification URL (no PII exposed) |
| BR-151 | Credential evidence links are immutable once issued |
| BR-152 | Endorsement weights derive from endorser's verified reputation + relationship proximity |
| BR-153 | Anonymous endorsements are not permitted (P-01) |
| BR-154 | Appeal path exists for disputed credentials; SLA ≤7 days |
| BR-155 | Privacy-preserving proofs allow skill verification without revealing full profile |
| BR-156 | Credential issue requires underlying achievement verified by platform activity |
| BR-157 | Career outcome tracking requires explicit user opt-in |
| BR-158 | Aggregated career data requires k ≥5 for display |
| BR-159 | Individual career transitions visible only to the user |
| BR-160 | Progression benchmarks by role require ≥20 data points to publish |
| BR-161 | Salary progression tracked separately from base salary |
| BR-162 | Career graph updates do not retroactively alter historical benchmarks |
| BR-163 | Career path recommendations must disclose data sources and confidence intervals |
| BR-164 | Reputation score is derived, never manually set |
| BR-165 | Reputation is skill-specific |
| BR-166 | Time-decay: signals older than 24 months count less |
| BR-167 | Reputation is private by default; recruiter visibility requires candidate consent or active application |
| BR-168 | Reputation signals are auditable |
| BR-169 | Interview recording requires dual consent |
| BR-170 | Recordings encrypted at rest; retention ≤90 days unless extended |
| BR-171 | AI feedback is advisory; never a hiring decision input without human review |
| BR-172 | AI analysis excludes protected attributes |
| BR-173 | Interview questions are company-scoped; not visible to candidates before assessment |
| BR-174 | Assessment scores are append-only; changes are compensating entries |
| BR-175 | Live coding environment reuses the challenge sandbox |
| BR-176 | Comparison across candidates uses structured rubrics, never free-form scores |
| BR-177 | Salary reports require verification: self-reported (0.5) or verified via employment (1.0) |
| BR-178 | Aggregated salary data requires k ≥5 submissions per cell |
| BR-179 | Salary data displayed in minor units + ISO-4217 currency |
| BR-180 | Company-specific salary data shown only if company has ≥3 reports OR opted in |
| BR-181 | Users may withdraw their salary submission at any time |
| BR-182 | Salary intelligence updates quarterly; historical data versioned |
| BR-183 | Equity data (F-98) separately aggregated from salary |
| BR-184 | Recommendation factors must be disclosed ("why am I seeing this?") |
| BR-185 | Recommendations never use protected attributes |
| BR-186 | Users can dismiss recommendations; dismissals train the model |
| BR-187 | Recommendations may not include promoted content without explicit "sponsored" label |
| BR-188 | Recommendation engine must be replaceable without breaking downstream features |
| BR-189 | Course outcome correlation requires ≥30 enrolled learners with measurable outcomes |
| BR-190 | Individual learner outcomes are never exposed without consent |
| BR-191 | Course quality scores derived from outcomes visible to instructors, not publicly ranked |
| BR-192 | Learning impact analytics do not create incentives to lower standards |
| BR-193 | Correlation is not causation — all outcome claims labelled as correlational |
| BR-194 | Peer mentorship sessions have a 30-day inactivity auto-close |
| BR-195 | Expert network calls may be paid; platform takes a transparent fee |
| BR-196 | Industry hubs must have ≥3 active contributors to display |
| BR-197 | Resume parsing never auto-applies changes without user review |
| BR-198 | Custom assessments must be approved by Platform Admin before deployment |
| BR-199 | Candidate comparison requires verified profiles only |
| BR-200 | DE&I analytics use aggregated data only; individual demographic data never stored |
| BR-201 | Post-hire analytics require employer consent and are aggregate-only |
| BR-202 | Badge marketplace prohibits paid badges; all badges earned |
| BR-203 | Mobile-first application must maintain feature parity with desktop |
| BR-204 | Accessibility is a release gate; WCAG 2.2 AA mandatory |
| BR-205 | API access requires enterprise tier; rate-limited per CON-006 |
| BR-206 | Emerging skills require platform-wide adoption before taxonomy promotion |
| BR-207 | Job market analytics require k ≥10 data points per geographic cell |
| BR-208 | All new AI-powered features inherit AI safety rules §32 |
| BR-209 | Introducer consent required for each introduction |
| BR-210 | Max path depth = 4 |
| BR-211 | Max 10 intro requests/week/user |
| BR-212 | Introducer can opt out of intro services |
| BR-213 | Target can block all intro requests |
| BR-214 | Introduction messages separate from cold outreach |
| BR-215 | Paths visible only to requester |
| BR-216 | No path suggestion for blocked users |
| BR-217 | Minimum reason category required on rejection |
| BR-218 | Feedback delivered within 7 days of decision |
| BR-219 | Feedback visible only to candidate |
| BR-220 | Aggregate insights use k ≥10 |
| BR-221 | AI drafts require human review before sending |
| BR-222 | Candidate can request feedback if not provided (30-day window) |
| BR-223 | Negative feedback must include actionable element |
| BR-224 | Feedback templates org-configurable |
| BR-225 | Freshness score computed nightly, immutable per day |
| BR-226 | Decay curves per skill category, admin-configurable |
| BR-227 | Freshness <20 demotes to self-reported |
| BR-228 | Re-verification restores freshness to 100 |
| BR-229 | Self-attestation counts 0.5× |
| BR-230 | Freshness visible to candidate always; recruiter-visible only with consent |
| BR-231 | Market drift alerts opt-in |
| BR-232 | Freshness stored historically (time-series) |
| BR-233 | Max 3 referral requests per 30 days per candidate |
| BR-234 | Referrer consent required per request |
| BR-235 | Referral tag visible to recruiter (priority signal) |
| BR-236 | Referral rewards follow org policy; XP default |
| BR-237 | System verifies referrer's employment |
| BR-238 | No referral request from blocked user |
| BR-239 | Referrer max 20 referrals/quarter |
| BR-240 | Referral attribution tracked 12 months |
| BR-241 | Affiliation verified (email domain or institutional seat) |
| BR-242 | Alumni discovery respects privacy settings |
| BR-243 | Alumni group default-join, opt-out allowed |
| BR-244 | Alumni job postings must be from verified alumni |
| BR-245 | Alumni mentorship opt-in |
| BR-246 | No cross-institution data leakage |
| BR-247 | Graduated students retain alumni status |
| BR-248 | Alumni networks public or private (institution choice) |

## 6. Explicit conditions read from the implementation condition matrix

These conditions and their TRUE/FALSE outcomes are represented as separate decision and branch nodes in the diagram. The evidence matrix is a source-inspection record, not proof that every branch was freshly executed during this task.

| ID | Condition | TRUE outcome | FALSE outcome |
|---|---|---|---|
| AU-01 | Email already registered | 409 | account created, 201 |
| AU-02 | Sign-up role is candidate or recruiter | accepted | 400 |
| AU-03 | Password length 8 to 256 | accepted | 400 |
| AU-04 | Login password correct for a known email | 200 and token | 401 with the same text as unknown email (decoy hash runs) |
| AU-05 | Login attempts under 10 per 15 min per IP and email | allowed | 429 |
| AU-06 | Sign-ups under 20 per 15 min per IP | allowed | 429 |
| AU-07 | Global requests under 300 per 60 s per user or IP | allowed | 429 |
| AU-08 | Token has a `sessionId` | sign-out revokes it | `{ended:false}`; lives until expiry (24 h) |
| AU-09 | `issuedAt` before `sessionsValidAfter` | 401 | pass |
| AU-10 | Account status not active and route not allowed | 403 | pass |
| AU-11 | No account row | pg storage: 401; memory storage: signed claims trusted | n/a |
| AU-12 | Only a platform admin may change roles; may not remove their own admin role | allowed | 403 or rejected |
| AU-13 | `TOKEN_SECRET` at least 32 characters | used as the key | random per-process key (sessions die on restart) |
| AU-14 | Web: a token string exists | page renders | redirect to `/login?return=` (no role check) |
| AU-15 | `return` starts with one slash | follow it | go to `/dashboard` |
| JB-01 | Caller is a member of the organization or platform admin (BR-12) | continue | 403 |
| JB-02 | Caller has the recruiter or platform_admin role | job created as draft | 403 |
| JB-03 | Job transition is in the allowed table | continue | 409 |
| JB-04 | Job is published | visible to everyone | 404 for non-managers |
| AP-01 | Caller is a recruiter without the candidate role (BR-02) | 403 | continue |
| AP-02 | Job is published (BR-16) | continue | 422 |
| AP-03 | An active application exists for this job and candidate (BR-15) | 409 | created as submitted |
| AP-04 | Application transition is in the table (BR-41) | continue | 409 |
| AP-05 | Target is withdrawn: caller is the candidate or admin | allowed | 403 |
| AP-06 | Other target: caller is any member of the job's organization or admin (BR-40) | allowed | 403 |
| AP-07 | Application draft saved | in memory only, lost on restart | n/a |
| WH-01 | Dates valid, none in the future, end after start | role created | VALIDATION_FAILED |
| WH-02 | Production or staging and Resend not fully configured | 503, nothing stored | continue |
| WH-03 | Address is not webmail or disposable | continue | VALIDATION_FAILED |
| WH-04 | Role has a company with a website | the address domain must match it | any non-webmail domain passes |
| WH-05 | Referee token present, hash matches and the request is under 30 days old | continue | 404 on view, 403 on submit (`UNAUTHORIZED` maps to 403) |
| WH-06 | Email challenge expired (15 min) | deleted, VALIDATION_FAILED | continue |
| WH-07 | Wrong-code attempts below 5 | attempts + 1 and VALIDATION_FAILED | RATE_LIMIT_EXCEEDED; challenge kept |
| WH-08 | Referee equals the candidate (id or email) | CONFLICT | continue |
| WH-09 | Reference status is requested | submit allowed | INVALID_STATE_TRANSITION |
| WH-10 | Ratings are integers 1 to 5 | continue | VALIDATION_FAILED |
| WH-11 | Verification score thresholds | 25 verified, 50 silver, 80 gold; email +40 | lower tier |
| WH-12 | Viewer is not the owner or an admin | email hidden; referee names and ratings hidden; average shown only with at least 3 ratings | full detail |
| WH-13 | Only the owner may delete a role | allowed | 403 (admins too) |
| CB-01 | At least 20 different people made the move (BR-160) | benchmark published | `insufficient_data`; no figures |
| CB-02 | Caller asks for a lower threshold | ignored; floor stays 20 | n/a |
| CB-03 | Skill has recorded market signals | forecast computed | 404 (single skill); skill omitted (ranking) |
| CB-04 | Who may record a market signal | any signed-in account | 401 when anonymous |
| LI-01 | Learner is enrolled and has not recorded an outcome (REV-01) | outcome recorded | 403 or 409 |
| LI-02 | Cohort of at least 30 outcomes (BR-189) | impact published | insufficient-data message |
| BL-01 | `BILLING_MODE` is stripe | Stripe routes active | routes answer 503 "not enabled" |
| BL-02 | Signature valid over the raw body | event processed | 401, nothing changed |
| BL-03 | Event id already recorded | replayed, no change | processed |
| BL-04 | Subscription event older than stored state | recorded only | state updated |
| BL-05 | Subscription price in the server catalog and status active or trialing | paid tier and entitlements | free tier |
| BL-06 | Checkout while a paid subscription is live | 409 | session created |
| BL-07 | Full refund of the live subscription's current-period charge | cancel at Stripe, access ends | recorded only |
| BL-08 | Customer already linked to another account | event ignored | link created |
| BL-09 | Deployed with `BILLING_MODE=simulated` | refused at boot | allowed |
| ST-01 | `STORAGE`: explicit, else process env, else memory under test, else pg | n/a | n/a |
| ST-02 | pg and database unreachable | refuse to start | continue |
| ST-03 | Advisory lock (718201,1) acquired | continue | refuse: second writer |
| ST-04 | Lease lost while running | 503 on every request | normal |
| ST-05 | Deployed with memory storage, weak or published token secret, PBKDF2 below 210000, default database URL | exit 1 | continue |
| ST-06 | Job handler outcome | success completes; permanent error fails; other error retries below 3 attempts then dead; no handler is dead | n/a |
| ST-07 | Worker heartbeat 45 s or newer | alive | degraded |
| ST-08 | Route not in the durable or stateless lists | response carries `x-talentsphere-durability: ephemeral` | no header |

## 7. Mounted browser route inventory

Current mounted routes (from `apps/web/src/App.tsx`): `/`, `/login`, `/signup`, `/checkout`, `/privacy`, `/terms`, `/jobs`, `/jobs/:id`, `/reference/:id`, `/verify/:hash`, `/dashboard`, `/applications`, `/evidence`, `/profile`, `/settings`, `/portfolio`, `/resumes`, `/network`, `/learning`, `/learning/:id`, `/career`, `/notifications`, `/messages`, `/messages/:id`, `/hiring`, `/hiring/jobs/:id`, `/assessments`, `/admin`, and catch-all `*`. The route guards are token-presence checks; the API remains the permission boundary.

Routes described in the intended navigation but not mounted include institution, social feed, course marketplace, teaching, recruiter search, advanced career and OS workbench pages. Backend endpoints do not make those browser screens implemented.

## 8. API endpoint inventory

The diagram contains one node for every unique endpoint entry in the checked-in API contract index. This list is the transport inventory; it is not a claim that each endpoint has durable storage or full feature acceptance.

- `GET /api/v1/health`
- `GET /api/v1/feature-flags`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/password`
- `POST /api/v1/auth/sign-out`
- `POST /api/v1/auth/sign-out-others`
- `GET /api/v1/auth/session`
- `GET /api/v1/profile/me`
- `PATCH /api/v1/profile/me`
- `GET /api/v1/profile/:id`
- `POST /api/v1/evidence`
- `GET /api/v1/evidence/:id`
- `GET /api/v1/evidence/mine`
- `GET /api/v1/evidence/subject/:subjectId`
- `POST /api/v1/evidence/:id/verify`
- `POST /api/v1/evidence/:id/dispute`
- `POST /api/v1/evidence/:id/revoke`
- `GET /api/v1/evidence/:id/verify-public`
- `GET /api/v1/skills`
- `POST /api/v1/skills`
- `POST /api/v1/skills/relationships`
- `GET /api/v1/skills/:id/graph`
- `POST /api/v1/organizations`
- `GET /api/v1/organizations/mine`
- `GET /api/v1/organizations/:id/jobs`
- `GET /api/v1/organizations/:id`
- `POST /api/v1/organizations/:id/members`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:id`
- `PATCH /api/v1/jobs/:id/status`
- `POST /api/v1/job-templates`
- `GET /api/v1/job-templates`
- `GET /api/v1/job-templates/:id`
- `PATCH /api/v1/job-templates/:id`
- `DELETE /api/v1/job-templates/:id`
- `POST /api/v1/job-templates/:id/instantiate`
- `POST /api/v1/jobs/:id/save-as-template`
- `POST /api/v1/salaries/reports`
- `GET /api/v1/salaries/reports/my`
- `DELETE /api/v1/salaries/reports/:id`
- `GET /api/v1/salaries/benchmarks`
- `GET /api/v1/salaries/company/:companyName`
- `POST /api/v1/jobs/:id/apply`
- `GET /api/v1/applications/my`
- `GET /api/v1/applications/:id`
- `GET /api/v1/jobs/:id/applications`
- `POST /api/v1/applications/:id/transition`
- `POST /api/v1/applications/:id/feedback`
- `GET /api/v1/applications/:id/feedback`
- `POST /api/v1/applications/:id/feedback/request`
- `POST /api/v1/organizations/:orgId/feedback-templates`
- `GET /api/v1/organizations/:orgId/feedback-templates`
- `GET /api/v1/feedback/aggregate-insights`
- `POST /api/v1/skills/freshness`
- `GET /api/v1/skills/freshness/my`
- `GET /api/v1/candidates/:candidateProfileId/skills/freshness`
- `POST /api/v1/skills/:skillId/reverify`
- `POST /api/v1/skills/freshness/refresh-all`
- `POST /api/v1/interviews/questions`
- `GET /api/v1/interviews/questions`
- `POST /api/v1/interviews/assessments`
- `GET /api/v1/interviews/assessments/:id`
- `POST /api/v1/interviews/assessments/:id/join`
- `POST /api/v1/interviews/assessments/:id/consent`
- `POST /api/v1/interviews/assessments/:id/end`
- `POST /api/v1/interviews/assessments/:id/code`
- `POST /api/v1/interviews/assessments/:id/scorecard`
- `POST /api/v1/interviews/assessments/:id/scorecard/compensate`
- `GET /api/v1/interviews/assessments/:id/scorecards`
- `POST /api/v1/interviews/assessments/:id/ai-feedback`
- `POST /api/v1/interviews/assessments/:id/review`
- `POST /api/v1/reputation/signals`
- `GET /api/v1/reputation/users/:userId`
- `GET /api/v1/reputation/my/signals`
- `POST /api/v1/reputation/recovery`
- `POST /api/v1/reputation/recovery/:planId/tasks/:taskId/complete`
- `POST /api/v1/reputation/recalculate-all`
- `GET /api/v1/reputation/instructors/:instructorId`
- `POST /api/v1/reputation/instructors/:instructorId/metrics`
- `POST /api/v1/reputation/instructors/:instructorId/endorse`
- `POST /api/v1/reputation/instructors/:instructorId/reviews`
- `POST /api/v1/reputation/instructors/recompute`
- `GET /api/v1/reputation/organizations/:organizationId`
- `POST /api/v1/reputation/organizations/:organizationId/reviews`
- `POST /api/v1/reputation/organizations/:organizationId/metrics`
- `GET /api/v1/reputation/organizations/:organizationId/reviews`
- `GET /api/v1/challenges`
- `GET /api/v1/challenges/:id`
- `POST /api/v1/challenges`
- `POST /api/v1/challenges/:id/start-session`
- `POST /api/v1/challenges/:id/submit`
- `POST /api/v1/ai/assistant/query`
- `GET /api/v1/xp/ledger`
- `GET /api/v1/courses`
- `POST /api/v1/courses`
- `GET /api/v1/courses/:id`
- `POST /api/v1/courses/:id/modules`
- `POST /api/v1/modules/:id/lessons`
- `POST /api/v1/courses/:id/publish`
- `POST /api/v1/courses/:id/enroll`
- `GET /api/v1/courses/:id/progress`
- `POST /api/v1/lessons/:id/complete`
- `GET /api/v1/certificates/:certificateNumber`
- `GET /api/v1/verify/:hash`
- `GET /api/v1/certificates/verify/:hash`
- `GET /api/v1/certificates/my`
- `POST /api/v1/certificates/:certificateNumber/revoke`
- `GET /api/v1/threads`
- `POST /api/v1/threads`
- `GET /api/v1/threads/:id`
- `POST /api/v1/threads/:id/messages`
- `POST /api/v1/threads/:id/read`
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/summary`
- `POST /api/v1/notifications/mark-read`
- `GET /api/v1/notifications/preferences`
- `PATCH /api/v1/notifications/preferences`
- `POST /api/v1/ai/conversations`
- `GET /api/v1/ai/conversations`
- `GET /api/v1/ai/conversations/:id`
- `POST /api/v1/ai/career-assistant/chat`
- `GET /api/v1/ai/usage`
- `POST /api/v1/resumes`
- `GET /api/v1/resumes`
- `GET /api/v1/resumes/:id`
- `PATCH /api/v1/resumes/:id`
- `POST /api/v1/resumes/:id/export`
- `GET /api/v1/resumes/:id/exports`
- `DELETE /api/v1/resumes/exports/:exportId`
- `POST /api/v1/connections/request`
- `GET /api/v1/connections`
- `GET /api/v1/connections/status/:targetUserId`
- `POST /api/v1/connections/:id/respond`
- `POST /api/v1/connections/:id/withdraw`
- `DELETE /api/v1/connections/:id`
- `POST /api/v1/networking/warm-intros/preferences`
- `GET /api/v1/networking/warm-intros/preferences`
- `GET /api/v1/networking/warm-intros/paths`
- `POST /api/v1/networking/warm-intros/requests`
- `GET /api/v1/networking/warm-intros/requests/incoming`
- `GET /api/v1/networking/warm-intros/requests/outgoing`
- `GET /api/v1/networking/warm-intros/requests/:id`
- `POST /api/v1/networking/warm-intros/requests/:id/respond`
- `POST /api/v1/referrals/requests`
- `GET /api/v1/referrals/requests/incoming`
- `GET /api/v1/referrals/requests/outgoing`
- `GET /api/v1/referrals/requests/:id`
- `POST /api/v1/referrals/requests/:id/respond`
- `GET /api/v1/referrals/outcomes`
- `POST /api/v1/skills/endorsements`
- `GET /api/v1/skills/endorsements/recipients/:recipientId`
- `DELETE /api/v1/skills/endorsements/:id`
- `GET /api/v1/skills/endorsements/my/given`
- `GET /api/v1/skills/forecast/top-growth`
- `POST /api/v1/skills/:skillId/market-signals`
- `GET /api/v1/skills/:skillId/forecast`
- `POST /api/v1/skills/:skillId/forecast/generate`
- `POST /api/v1/career/transitions`
- `GET /api/v1/career/transitions/my`
- `GET /api/v1/career/benchmarks`
- `POST /api/v1/career/transition-probability`
- `GET /api/v1/career/pathways`
- `POST /api/v1/career/milestones/readiness`
- `POST /api/v1/learning/impact/outcomes`
- `GET /api/v1/learning/impact/courses/:courseId`
- `POST /api/v1/learning/impact/courses/:courseId/compute`
- `GET /api/v1/learning/impact/dashboard`
- `POST /api/v1/recruiter/talent-pools`
- `GET /api/v1/recruiter/talent-pools`
- `GET /api/v1/recruiter/talent-pools/:poolId`
- `POST /api/v1/recruiter/talent-pools/:poolId/members`
- `PATCH /api/v1/recruiter/talent-pools/:poolId/members/:memberId`
- `GET /api/v1/recruiter/talent-pools/:poolId/intelligence`
- `POST /api/v1/recruiter/discovery/behavioral/compute`
- `GET /api/v1/recruiter/discovery/behavioral`
- `GET /api/v1/recruiter/discovery/behavioral/:candidateId`
- `POST /api/v1/recruiter/talent-segmentation/classify`
- `GET /api/v1/recruiter/talent-segmentation/segments`
- `GET /api/v1/recruiter/talent-segmentation/candidates`
- `GET /api/v1/recruiter/talent-segmentation/candidates/:candidateId`
- `POST /api/v1/alumni/affiliations`
- `POST /api/v1/alumni/affiliations/:id/verify`
- `GET /api/v1/alumni/affiliations/my`
- `GET /api/v1/alumni/institutions/:institutionId/directory`
- `POST /api/v1/alumni/institutions/:institutionId/groups`
- `GET /api/v1/alumni/institutions/:institutionId/groups`
- `POST /api/v1/alumni/groups/:id/join`
- `GET /api/v1/alumni/groups/:id/members`
- `POST /api/v1/alumni/mentorship/request`
- `POST /api/v1/alumni/mentorship/:id/respond`
- `GET /api/v1/alumni/mentorship/my`
- `POST /api/v1/activity/events`
- `GET /api/v1/activity/events`
- `GET /api/v1/activity/scores/me`
- `GET /api/v1/activity/users/:userId/score`
- `POST /api/v1/activity/recalculate`
- `POST /api/v1/portfolio/projects`
- `GET /api/v1/portfolio/projects`
- `GET /api/v1/portfolio/projects/:id`
- `PATCH /api/v1/portfolio/projects/:id`
- `DELETE /api/v1/portfolio/projects/:id`
- `GET /api/v1/portfolio/showcase/:targetUserId`
- `GET /api/v1/gamification/summary`
- `GET /api/v1/gamification/transactions`
- `GET /api/v1/gamification/badges`
- `GET /api/v1/gamification/leaderboard`
- `POST /api/v1/gamification/claim-activity`
- `GET /api/v1/settings`
- `PATCH /api/v1/settings`
- `POST /api/v1/settings/export`
- `GET /api/v1/settings/export/latest`
- `POST /api/v1/settings/erasure/request`
- `GET /api/v1/settings/erasure/status`
- `POST /api/v1/settings/erasure/cancel`
- `POST /api/v1/settings/erasure/execute`
- `POST /api/v1/billing/checkout`
- `POST /api/v1/billing/portal`
- `POST /api/v1/billing/stripe-webhook`
- `GET /api/v1/billing/plans`
- `GET /api/v1/billing/subscription`
- `POST /api/v1/billing/subscribe`
- `POST /api/v1/billing/cancel`
- `GET /api/v1/billing/invoices`
- `POST /api/v1/billing/webhook`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/status`
- `PATCH /api/v1/admin/users/:id/roles`
- `GET /api/v1/admin/feature-flags`
- `PUT /api/v1/admin/feature-flags/:key`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/health-diagnostics`
- `POST /api/v1/admin/maintenance`
- `GET /api/v1/search`
- `GET /api/v1/search/autocomplete`
- `GET /api/v1/search/commands`
- `GET /api/v1/search/history`
- `DELETE /api/v1/search/history`
- `POST /api/v1/moderation/scan`
- `POST /api/v1/moderation/reports`
- `GET /api/v1/moderation/reports/my`
- `GET /api/v1/moderation/reports`
- `GET /api/v1/moderation/reports/:id`
- `PATCH /api/v1/moderation/reports/:id/status`
- `POST /api/v1/moderation/reports/:id/resolve`
- `POST /api/v1/moderation/reports/:id/appeal`
- `GET /api/v1/moderation/appeals`
- `POST /api/v1/moderation/appeals/:id/review`
- `POST /api/v1/jobs/saved-searches`
- `GET /api/v1/jobs/saved-searches`
- `GET /api/v1/jobs/saved-searches/:id`
- `PATCH /api/v1/jobs/saved-searches/:id`
- `DELETE /api/v1/jobs/saved-searches/:id`
- `POST /api/v1/jobs/saved-searches/:id/run`
- `GET /api/v1/jobs/alerts`
- `PATCH /api/v1/jobs/alerts/:id/read`
- `POST /api/v1/jobs/:id/save`
- `DELETE /api/v1/jobs/:id/save`
- `GET /api/v1/jobs/saved`
- `PUT /api/v1/jobs/:jobId/draft`
- `GET /api/v1/jobs/:jobId/draft`
- `DELETE /api/v1/jobs/:jobId/draft`
- `POST /api/v1/jobs/:jobId/draft/restore`
- `GET /api/v1/applications/drafts`
- `POST /api/v1/analytics/events`
- `GET /api/v1/analytics/events`
- `GET /api/v1/analytics/kpis`
- `POST /api/v1/candidates/work-history`
- `POST /api/v1/candidates/work-history/:id/verify-email`
- `POST /api/v1/candidates/work-history/:id/references/request`
- `GET /api/v1/references/:refId`
- `POST /api/v1/candidates/work-history/references/:refId/submit`
- `GET /api/v1/candidates/:candidateId/work-history`
- `GET /api/v1/candidates/:candidateId/work-history-graph`
- `DELETE /api/v1/candidates/work-history/:id`
- `GET /api/v1/internal/worker-jobs`

## 9. Database entities and relationships

The diagram contains one node for every named entity/table reference enumerated in the database reference. Canonical relational clusters include identity/profile, organization/membership, jobs/applications, evidence/skills, work history/references, learning/courses/progress/certificates, assessment/interview, messaging/notifications, networking/referrals/alumni, reputation/gamification, analytics/intelligence, settings/privacy, moderation, billing/entitlements, and background jobs.

- `users`
- `profiles`
- `org_memberships`
- `job_skills`
- `application_evidence`
- `evidence_skills`
- `user_settings`
- `data_export_requests`
- `data_erasure_requests`
- `saved_searches`
- `saved_jobs`
- `admin_audit_logs`
- `feature_flags`
- `subscriptions`
- `invoices`
- `entitlements`
- `billing_events`
- `stripe_customers`
- `background_jobs`
- `evidence`
- `organizations`
- `jobs`
- `job_applications`
- `audit_logs`
- `skills`
- `skill_relationships`
- `challenges`
- `assessment_sessions`
- `challenge_submissions`
- `xp_transactions`
- `courses`
- `course_modules`
- `lessons`
- `course_enrollments`
- `lesson_progress`
- `course_certificates`
- `course_skills`
- `message_threads`
- `thread_participants`
- `messages`
- `notifications`
- `notification_preferences`
- `ai_conversations`
- `ai_messages`
- `ai_usage_meters`
- `resumes`
- `resume_exports`
- `connections`
- `portfolio_projects`
- `portfolio_project_skills`
- `portfolio_project_media`
- `portfolio_project_evidence`
- `user_gamification_profiles`
- `gamification_badges`
- `user_badges`
- `platform_config`
- `search_history`
- `moderation_reports`
- `moderation_appeals`
- `job_alerts`
- `application_drafts`
- `application_draft_versions`
- `analytics_events`
- `analytics_daily_kpis`
- `certificate_revocations`
- `job_templates`
- `salary_reports`
- `salary_aggregates`
- `feedback_templates`
- `application_feedback`
- `skill_freshness`
- `skill_freshness_history`
- `interview_questions`
- `interview_assessments`
- `interview_scorecards`
- `interview_ai_feedbacks`
- `reputation_scores`
- `reputation_signals`
- `reputation_history`
- `reputation_recovery_plans`
- `warm_introduction_preferences`
- `warm_introduction_requests`
- `referral_requests`
- `referral_outcomes`
- `activity_events`
- `contribution_scores`
- `instructor_reputation_breakdown`
- `instructor_endorsements`
- `skill_endorsements`
- `endorsement_weights`
- `alumni_affiliations`
- `alumni_groups`
- `alumni_group_members`
- `alumni_mentorship`
- `employer_reputation_breakdown`
- `employer_reviews`
- `skill_market_signals`
- `skill_forecasts`
- `career_transitions`
- `progression_benchmarks`
- `career_milestone_evaluations`
- `learning_outcomes`
- `learning_impact_metrics`
- `talent_pools`
- `talent_pool_members`
- `behavioral_talent_profiles`
- `candidate_segmentations`
- `verified_work_histories`
- `employment_references`
- `work_history_email_challenges`
- `revoked_sessions`
- `worker_health`

**Data consistency rules:** core `CoreOp[]` commits are one Postgres transaction; the Maps update only after commit. Guarded updates use optimistic concurrency and return conflict on stale bases. SQL uniqueness/FK constraints are the final race guard. A durability header on an API response is route-specific; a module can write an auxiliary durable row while its principal state remains ephemeral.

## 10. Role and permission model

### Runtime roles observed

- `candidate`
- `recruiter`
- `hiring_manager`
- `platform_admin`

Institutional roles and expanded personas in SSOT (institution admin, faculty, learner/proctor, mentor, referee, employer operators) are not all represented as first-class runtime authorization roles. Registration currently accepts candidate or recruiter. External referee access is token-based and does not require a normal user account.

### Authorization chain

1. Browser route guard checks only whether a token string exists.
2. API extracts and verifies the HMAC token, expiry and session revocation.
3. API reloads current account state where configured and checks status.
4. Handler checks role, owner, participant, organization membership, tenant and workflow state.
5. Domain functions enforce state transitions and invariants.
6. Database constraints and RLS/grants provide defense in depth; hosted Supabase behavior still requires a compatible identity/tenant policy and target DB test.

### Known authorization decisions / findings

- Organization membership is used broadly in several recruiting/interview/talent-pool paths without role-specific checks; define membership role matrix.
- Candidate application, recruiter job management and admin governance must be server-authorized; client-provided flags are never trusted.
- Gamification claim endpoint has a self-award abuse finding; instructor review verified-enrollment flags have a trust gap.
- Warm-introduction path visibility, block handling and connection-request rate limits need policy review.
- Salary/company aggregate thresholds differ between product rule and runtime behavior; small cohort disclosure needs review.
- Public reputation, feedback and reviewer identifiers require an approved disclosure policy.
- AI consent is not checked consistently; one assistant path skips quota and prompt firewall.
- Account erasure semantics and multi-store cleanup need a durable lifecycle and recovery design.

## 11. Workflow and state specifications

### Candidate core

Register/sign in → complete profile → define goal → inspect skill gap → learn → practice → create evidence → verify skill/work history → discover jobs → match → apply → track status → interview → outcome → append new evidence.

### Recruiter

Create organization → establish membership → create job draft → validate readiness → publish/status transition → review eligible applications → request/record feedback → interview and scorecard → human decision → outcome and audit.

### Learning

Instructor creates course → modules/lessons → publish → candidate enrolls → prerequisites/progress → lesson completion → assessment → certificate/XP. Current runtime stores much of this state in memory; durable completion evidence can outlive its originating enrollment/certificate state. Course/assessment rules in the canonical registry are not all implemented.

### Evidence and work history

Candidate submits evidence/work history → validate date/ownership and company/email rules → enqueue verification code or referee request → worker sends provider email → referee token/hash checked and expiry enforced → accept/dispute/revoke → evidence status affects skill and career views. Email delivery and employer identity proof remain gates.

### Messaging and notifications

Conversation start requires accepted connection or application context; each thread operation checks participant membership. Message and its in-app notification are committed with core data. No realtime, browser push or digest delivery is established.

### Billing

User requests plan → role/plan mapping and server-owned Stripe price → customer/Checkout → signed webhook → event ID idempotency → reconcile customer/subscription/invoice/refund → persist entitlement. Default billing is disabled. Payment and refund edge cases/live acceptance remain unresolved.

### Background job lifecycle

Queued → claimed with lease and attempt fence → handler executes → success acknowledged; transient failure schedules retry/backoff; permanent/unknown handler or exhausted attempts becomes dead-letter; lease lapse may redeliver; cancellation is cooperative and cannot roll back an already completed external side effect.

### Account lifecycle

Settings/export/erasure request → status → cancel or execute → delete/anonymize related rows and provider resources → audit and reconcile. The current immediate execute path does not reliably enforce the promised grace period; no scheduled deletion should be claimed without scheduler evidence.

## 12. Error and recovery contract

| Condition | Runtime response / behavior |
|---|---|
| Zod payload invalid | 400 VALIDATION_FAILED with field details |
| Missing, invalid, expired or revoked session | 401 UNAUTHENTICATED |
| Role, owner, participant or tenant denied | 403 FORBIDDEN (some read paths conceal as 404) |
| Record absent | 404 NOT_FOUND |
| Unique conflict, invalid concurrent transition or stale base | 409 CONFLICT |
| Domain policy/transition invalid | 422 |
| Payment required / AI quota | 402 |
| Rate limit exceeded | 429 with retry metadata |
| Provider disabled or unavailable | 503 |
| Postgres commit fails | rollback; read model unchanged; request fails |
| Worker transient error | bounded retry/backoff with attempt fence |
| Worker permanent/unknown handler | dead-letter; requires operational visibility |
| Provider accepts mail | not equivalent to mailbox delivery |
| Stripe webhook invalid signature | reject; never grant entitlement |
| Stripe duplicate event | idempotent replay/no duplicate grant |
| API second writer | startup refused by advisory lock |
| Ephemeral route state | lost on process restart; hide or label preview until durable |

## 13. Testing and quality evidence

The repository has Vitest unit/integration/security suites, PostgreSQL-specific tests, Playwright end-to-end suites, migration integrity checks, and GitHub Actions workflows. Tests listed in the repository are not automatically a passing test run on the current commit. The dated 2026-10-21 audit records a historical test result (1,172 passing / 115 files) and blocked build/typecheck/install checks under protected-file restrictions; that historical result must not be presented as current.

Required release evidence:
- Current-commit unit, integration, security and relevant Playwright outcomes.
- Clean Postgres migration and populated target-database migration/rollback rehearsal.
- RLS, grants, tenant isolation and multi-user concurrency against the actual hosted project.
- Browser verification for user-visible changes.
- Mailbox delivery and signed Stripe test/live staging evidence.
- Queue age, worker heartbeat, API health, error rate and provider failure alerts.
- Single-writer enforcement or SQL-read-model migration before horizontal API scale-out.
- Backup/restore, cold boot, rollback and disaster recovery rehearsal.
- WCAG 2.2 AA, responsive and performance evidence for the approved release scope.
- Legal/privacy policy approval and functioning privacy/security contact channels.

## 14. Deployment and configuration model

Current runtime settings include `NODE_ENV`, `APP_URL`, `API_URL`, `PORT`, `HOST`, `DATABASE_URL`, `STORAGE`, `TOKEN_SECRET`, `CORS_ALLOWED_ORIGINS`, `TRUST_PROXY`, rate limits, `EMAIL_PROVIDER`, Brevo sender/API key, `BILLING_MODE`, Stripe secret/webhook/price IDs, AI enablement/quota/timeout settings and BYO-key encryption key. The repo's environment schema still contains legacy Supabase anon/service-role key names; the current database adapter uses Postgres rather than Supabase Auth. Validate the actual deploy environment and never paste real secrets into this document.

Deployment assets include Coolify and Oracle compose/Docker/Caddy/backup/restore scripts. Their presence does not prove a live deployment. Production needs one API writer, worker process, HTTPS reverse proxy, private secrets, durable PostgreSQL, verified backups and monitored recovery.

## 15. Unresolved decisions and release blockers

| Priority | Item | Required decision / evidence |
|---|---|---|
| P0 | #44 Email | Approve provider, sender domain, credentials, quota/cost; real mailbox E2E, retry/idempotency, alerting |
| P0 | #45 Privacy/legal | Counsel-approved terms/privacy/retention, contact inboxes, erasure grace/scheduler/appeal/backup boundaries |
| P0 | #46 Hosted DB / ADR-015 | Ratify Fastify/Postgres and ADR-015; resolve auth.users vs public.users FK/RLS mismatch; populated DB migration and rollback |
| P0 | #47 Operations | Enforce single API writer; worker heartbeat/queue-age alerting; HTTPS/proxy; backup restore and rollback evidence |
| P1 | #48 Durability | Scope launch routes; move selected saved searches/application drafts/networking/resume/export records to durable stores; hide preview-only promises |
| P1 | #49 Interviews / trust / sessions | Approve trust-score/badge migration; choose safe sandbox or disable scoring; decide HttpOnly cookie + CSRF vs bearer token |
| P1 | #50 Billing | Decide free-only vs Stripe paid launch; approve entitlements, refund/cancel/dispute semantics, legal policy and live staging |
| P1 | Authorization | Role-specific organization permissions; public data visibility; block/rate limits; trust flags server-derived |
| P1 | AI | Consent enforcement on every route; consistent firewall/quota; provider/cost/entitlement policy; no AI-generated verified evidence |
| P1 | Learning integrity | Durable enrollment/progress/assessment/certificate/revocation linkage and final-assessment gating |
| P2 | Scale | Remove in-memory read model or adopt a consistent read model before multi-replica API |
| P2 | Search/realtime/media | PostgreSQL search first; realtime/media/queue integrations only after measured need and approved contracts |

## 16. Validation report and limits

- **Repository discovery:** performed against public GitHub `main`, current root and recursive tree, key instructions, architecture/SSOT, registries, route inventory, database reference, system-model condition/authorization/conflict documents, API/server/storage/worker/email/billing source and tests inventory.
- **Feature identity coverage:** 173/173 registry entries included in the diagram.
- **Business-rule identity coverage:** 248/248 registry entries included in the diagram.
- **API endpoint coverage:** 277/277 unique literal API contract index entries included.
- **Database entity coverage:** 112/112 named database-reference entity references included. Some names are conceptual references and must be reconciled against CREATE TABLE SQL before a physical-schema assertion.
- **Condition matrix coverage:** 62/62 parsed conditions included with explicit TRUE/FALSE branches.
- **Browser routes:** current mounted routes included; planned routes labelled separately.
- **Mermaid syntax:** source generated with consistent identifiers, quoted labels, subgraphs and explicit branches. No Mermaid renderer/parser was available through the repository connector in this execution; therefore syntax is **source-reviewed, not renderer-validated**. Validate with Mermaid CLI/editor before treating rendering as accepted.
- **Source semantic coverage:** not every handler in the large `server.ts` was independently re-read line by line in this pass; use route authorization and current tests as evidence candidates. All untraced endpoints remain unverified.
- **Runtime/production:** no live app, hosted Supabase migration, provider mailbox, Stripe staging account, backup restore or production environment was exercised in this task.
- **No code, schema, build configuration, deployment file, secret or existing document was modified.** This branch adds only this documentation artifact.

## 17. Recommended implementation sequence

1. Owner decisions: P0 #44–#47 plus P1 #49–#50; do not guess provider, privacy, database, interview or monetization policy.
2. Freeze the approved GA scope to the trusted career loop; explicitly mark preview-only modules and hide unsupported promises.
3. Resolve hosted database migration/auth/RLS compatibility; ratify ADR-015; prove migration on clean and populated copies.
4. Close authz/tenant/privacy/security defects and test adversarial cross-user access.
5. Complete durable storage for launch-scope features; preserve transactional writes, idempotency and concurrency fences.
6. Prove worker/email delivery, lease safety, heartbeat and alerting.
7. Choose and implement safe assessment execution or keep real scoring disabled.
8. Decide free-only or Stripe; verify subscription/refund/cancel/dispute → entitlement lifecycle.
9. Run current-commit quality gates, browser tests, accessibility/performance, backup/restore and rollback rehearsals.
10. Sign release readiness only for the explicitly accepted scope with dated evidence.

---
*End of authoritative master system model.*

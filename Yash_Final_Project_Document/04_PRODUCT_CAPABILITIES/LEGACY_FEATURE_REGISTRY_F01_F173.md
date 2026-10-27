# Legacy Feature Registry (F-01 to F-173): identity, priority, phase, dependencies

Doc ID: CAP-LEG-01 · Owner: Product Director (with Domain Architect) · Version 1.0 · Status: Draft for Review · Relates: `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` (target FEAT hierarchy), `CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md#record-capability-map-phase-reconciliation-rev2`, `../28_TRACEABILITY_AND_COVERAGE/FEATURE_REGISTRY_METADATA_CROSSWALK.md` (OPEN-41), `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/registries/FEATURE_REGISTRY.md` (v6.0)

## 0. Frame

| Item | Statement |
|---|---|
| Implementation status | **None.** This project has no source code. The prior attempt kept implementation status in a separate dated status report and never in this register; this merge keeps that separation. No row below carries a status, and none may be read as "built". |
| What the register is | The prior attempt's **173-feature capability inventory** with category, priority (P, 0 to 10), phase (Ph0 to Ph10) and key dependencies. Target sequencing is Ph0 to Ph4 in `22_IMPLEMENTATION_ROADMAP`; the legacy phases are **historical metadata**, not the target plan. |
| Portfolio rule (carried) | 173 features is a capability inventory, **not a promise of simultaneous GA scope**. The prior PRD stated the 173-feature portfolio is not a requirement to ship all 173 features before validating the core product. |
| Identity owner | Prior attempt left open which document owns the register (root SSOT section 7 vs the registry; the two inventories were identical except headings). Target: `FEATURE_REGISTRY_METADATA_CROSSWALK.csv` in `28_*` carries the row-level machine-readable copy (name, category, P, phase, dependencies, candidate FEAT map). This file is the human-readable form and adds computed analysis (sections 3 and 4). |
| Numbering history | F-01..F-120 baseline; F-121..F-143 v2.1 integration family (numbering preserved); F-144..F-173 gap-analysis family, **renumbered from former F-121..F-150** in the prior attempt. Historical references to old F-121..F-150 meanings may be stale; check name before ID. |

## 1. Register (verbatim metadata)

Columns: P = priority 0 to 10 (higher = more important); Phase = legacy phase label; Key dependencies = legacy `F-*` prerequisites; Flag = added by this merge from other legacy statements (blank if none).


### Baseline and core (F-01..F-120)

| ID | Feature | Category | P | Phase | Key dependencies | Flag |
|---|---|---|---|---|---|---|
| F-01 | Authentication & Session | Identity | 10 | Ph0 | – |  |
| F-02 | Landing Page | Shell | 3 | Ph0 | – |  |
| F-03 | Dashboard (Role-Adaptive) | Shell | 10 | Ph0 | F-01 |  |
| F-04 | Job Marketplace | Marketplace | 9 | Ph2 | F-01, F-12 |  |
| F-05 | Post Job Studio | Marketplace | 8 | Ph2 | F-04 |  |
| F-06 | ATS / Candidate Pipeline | Recruiting | 9 | Ph2–3 | F-04, F-05 |  |
| F-07 | Learning Management System | Learning | 9 | Ph1 | F-01, F-12 |  |
| F-08 | Challenges Arena | Assessment | 9 | Ph1 | F-01, F-12 |  |
| F-09 | Professional Networking | Social | 8 | Ph2 | F-12 |  |
| F-10 | Direct Messaging | Communication | 10 | Ph0 | F-01 |  |
| F-11 | AI Career Assistant (Basic) | AI | 8 | Ph1/Ph4 | F-12 |  |
| F-12 | Profile Management | Identity | 10 | Ph0 | F-01 |  |
| F-13 | Resume Builder | Identity | 7 | Ph1 | F-12 |  |
| F-14 | Notification Center | Communication | 10 | Ph0 | F-01 |  |
| F-15 | Settings | Shell | 10 | Ph0 | F-01 |  |
| F-16 | Billing & Subscriptions | Monetization | 7 | Ph5 | F-01 |  |
| F-17 | Admin Console | Governance | 10 | Ph0 | F-01 |  |
| F-18 | Chrome Extension Companion | Edge | 5 | Ph2 | F-01 | Chrome extension companion; legacy BR-030 keeps extension data local |
| F-19 | Product Analytics | Telemetry | 7 | Ph1 | F-01 |  |
| F-20 | Command Search (⌘K) | Shell | 7 | Ph2 | F-01 |  |
| F-21 | Error Recovery & Resilience | Shell | 10 | Ph0 | F-01 |  |
| F-22 | Gamification & XP Ledger | Engagement | 8 | Ph1 | F-07, F-08 |  |
| F-23 | Leaderboard & Badges | Engagement | 7 | Ph2 | F-22 |  |
| F-24 | Trust, Safety & Moderation | Safety | 8 | Ph2 | F-01 |  |
| F-25 | Job Detail View | Marketplace | 7 | Ph2 | F-04 |  |
| F-26 | Portfolio Showcase | Identity | 8 | Ph1 | F-12 |  |
| F-27 | Local Resume Match Preview | Edge | 6 | Ph2 | F-18 |  |
| F-28 | External Job Page Scanner | Edge | 6 | Ph2 | F-18 |  |
| F-29 | Scheduled Notification Digest | Communication | 7 | Ph2 | F-14 |  |
| F-30 | Networking Stale-Request Nudges | Engagement | 6 | Ph2 | F-09 |  |
| F-31 | KPI Aggregation & Rollups | Analytics | 6 | Ph2 | F-19 |  |
| F-32 | Saved Searches & Job Alerts | Candidate | 7 | Ph2 | F-04 |  |
| F-33 | Video Interview Rooms | Communication | 8 | Ph3 | F-10 |  |
| F-34 | Multi-Entity Backend Search | Platform | 7 | Ph2 | F-04, F-07 |  |
| F-35 | Feature Flag Console | Administration | 6 | Ph2 | F-17 |  |
| F-36 | Application Draft Autosave | Candidate | 7 | Ph1 | F-04 |  |
| F-37 | Job Templates | Recruiting | 6 | Ph2 | F-05 |  |
| F-38 | Legacy Chat Service (DEPRECATED) | Communication | 0 | – | – | DEPRECATED (legacy chat service); P=0 |
| F-39 | Unified Backend Stub (DEPRECATED) | Platform | 0 | – | – | DEPRECATED (unified backend stub); P=0 |
| F-40 | Institutional Managed Learning | Institutions | 8 | Ph3 | F-01, F-07 |  |
| F-41 | Procurement & Seat Licensing | Institutions | 6 | Ph6 | F-40, F-16 |  |
| F-42 | Provider-Agnostic Media Engine | Platform | 8 | Ph2 | F-07 |  |
| F-43 | B2B2C Graduation Flywheel | Institutions | 6 | Ph3 | F-40 |  |
| F-44 | AI Media Enrichment | Learning | 6 | Ph4 | F-42, F-11 |  |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | Learning | 4 | Ph10 | F-40, F-115 | Vendor-gated (OD-35); third-party proctoring; dependency cycle with F-115 |
| F-46 | Institutional Analytics | Institutions | 6 | Ph3 | F-40 |  |
| F-47 | Faculty Dashboard | Institutions | 6 | Ph3 | F-40 |  |
| F-48 | OS Shell & Workbench | OS | 4 | Ph2+ | F-01, F-03 |  |
| F-49 | Automation & Agents | OS | 4 | Ph3+ | F-48 |  |
| F-50 | Institutional Course Marketplace | Institutions | 6 | Ph3 | F-40, F-42 |  |
| F-51 | Media Health Monitoring | Platform | 6 | Ph4 | F-42 |  |
| F-52 | Certificate Verification | Verification | 8 | Ph3 | F-07 |  |
| F-53 | Professional Social Graph & Feed | Networking | 5 | Ph8 | F-12 |  |
| F-54 | Content Publishing | Networking | 5 | Ph8 | F-12 |  |
| F-55 | Groups & Communities | Community | 5 | Ph8 | F-53 |  |
| F-56 | Organization & Institution Pages | Recruiting | 5 | Ph8 | F-12, F-40 |  |
| F-57 | Events & Webinars | Community | 5 | Ph8 | F-53 |  |
| F-58 | Written Recommendations | Networking | 6 | Ph8 | F-53 |  |
| F-59 | Outreach Credits (TalentMail) | Recruiting | 5 | Ph8 | F-10 |  |
| F-60 | Profile Views & Privacy Controls | Networking | 6 | Ph8 | F-12 |  |
| F-61 | Premium Candidate Tier (OD-34 gated) | Business | 4 | Ph10+ | F-60 | Gated by pricing decision OD-34 (candidate premium tier) |
| F-62 | Sponsored Content (NOT RECOMMENDED) | Business | 0 | Ph10+ | – | NOT RECOMMENDED (sponsored content); P=0 |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | Intelligence | 0 | Ph10+ | – | NOT RECOMMENDED (business-development graph); P=0 |
| F-64 | LinkedIn Migration Engine | Integration | 5 | Ph1/2 | F-12 | LinkedIn migration engine: governed by MIG-01..MIG-08 |
| F-65 | LinkedIn Decoupling & Independence | Foundation | 8 | Ph1/2 | F-64 | LinkedIn decoupling: adapter-only (prior gap resolution) |
| F-66 | Course Creation Studio | Learning | 8 | Ph7 | F-07, F-42 |  |
| F-67 | Categories, Discovery & Comparison | Learning | 6 | Ph7 | F-07, F-145 |  |
| F-68 | Quizzes, Practice Tests & Final Exams | Learning | 8 | Ph7 | F-07 |  |
| F-69 | Assignments & Peer Review | Learning | 8 | Ph7 | F-07 |  |
| F-70 | Learning Paths, Programs & Specializations | Learning | 8 | Ph7 | F-07, F-66 |  |
| F-71 | Course Q&A, Discussions, Notes | Learning | 6 | Ph7 | F-07 |  |
| F-72 | Course Reviews & Ratings | Learning | 6 | Ph7 | F-07 |  |
| F-73 | Course Commerce | Learning | 6 | Ph7 | F-07, F-16 |  |
| F-74 | Instructor Platform | Learning | 6 | Ph7 | F-07, F-66 |  |
| F-75 | Employer Insights | Intelligence | 7 | Ph9 | F-12, F-56 |  |
| F-76 | Coding Contests & Live Leaderboards | Assessment | 5 | Ph9 | F-08 |  |
| F-77 | Skill Certification Exams | Assessment | 8 | Ph3 | F-08 |  |
| F-78 | Practice Sets & Interview Prep | Learning | 5 | Ph9 | F-08 |  |
| F-79 | Articles & Newsletters | Networking | 5 | Ph8 | F-54 |  |
| F-80 | Profile Enhancements | Profile | 6 | Ph1/Ph8 | F-12 |  |
| F-81 | Identity Verification | Verification | 3 | Ph9 | F-12 |  |
| F-82 | Student Learning Analytics | Analytics | 6 | Ph7 | F-07 |  |
| F-83 | Admin Platform Expansion | Administration | 3 | Ph8 | F-17 |  |
| F-84 | Skills Graph & Taxonomy | Platform | 10 | Ph1–2 | F-12, F-07, F-08 |  |
| F-85 | Career Graph & Progression | Intelligence | 9 | Ph3 | F-12, F-04, F-06, F-84 |  |
| F-86 | Salary Intelligence | Intelligence | 9 | Ph3 | F-04, F-06, F-56 |  |
| F-87 | Interview Experience Repository | Candidate | 7 | Ph4 | F-04, F-56, F-88 |  |
| F-88 | Technical Interview Platform | Hiring | 9 | Ph3 | F-08, F-33, F-06 |  |
| F-89 | Contribution Verification System | Verification | 5 | Ph8 | F-26, F-12 |  |
| F-90 | Peer Mentorship & Advisor Network | Community | 5 | Ph4 | F-12, F-10, F-55 |  |
| F-91 | Career Readiness Assessment | Career | 9 | Ph2 | F-84, F-08, F-12 |  |
| F-92 | Advanced Recruiter Search | Recruiting | 9 | Ph3 | F-12, F-34, F-08, F-96 |  |
| F-93 | Interview Video Recording & AI Feedback | Hiring | 7 | Ph4 | F-33, F-06, F-88 |  |
| F-94 | Verified Work History & References | Verification | 7 | Ph3 | F-12, F-58 |  |
| F-95 | Career Transition Planning | Career | 7 | Ph4 | F-84, F-91, F-07 |  |
| F-96 | Skill Evidence & Digital Credentials | Verification | 10 | Ph2 | F-12, F-26 |  |
| F-97 | Real-Time Job Market Analytics | Intelligence | 5 | Ph4 | F-04, F-06 |  |
| F-98 | Employer Equity & Compensation Intelligence | Intelligence | 7 | Ph3 | F-56, F-86 |  |
| F-99 | AI Career Coach (Enhanced) | AI | 7 | Ph4 | F-12, F-84, F-91, F-07 |  |
| F-100 | Peer Project Collaboration | Learning | 4 | Ph5 | F-07, F-69, F-10 |  |
| F-101 | Badge Marketplace & Recognition | Gamification | 4 | Ph8 | F-23, F-26 |  |
| F-102 | Hiring Manager Portal | Recruiting | 8 | Ph3 | F-06, F-88 |  |
| F-103 | Candidate Comparison & Rubric | Recruiting | 6 | Ph3 | F-06, F-92 |  |
| F-104 | Pre-Hire Assessment Customization | Hiring | 7 | Ph3 | F-06, F-08, F-88 |  |
| F-105 | Post-Hire Analytics & ROI Tracking | Analytics | 4 | Ph4 | F-102, F-93 |  |
| F-106 | Skill Prerequisite Engine | Learning | 7 | Ph5 | F-07, F-70, F-84 |  |
| F-107 | Live Q&A with Instructors | Learning | 6 | Ph5 | F-07, F-71, F-10 |  |
| F-108 | Expert Network Matching | Networking | 4 | Ph7 | F-09, F-12, F-10 |  |
| F-109 | Salary Negotiation Guidance | Career | 5 | Ph8 | F-86, F-98 |  |
| F-110 | Verified Skill Endorsements | Verification | 7 | Ph8 | F-96, F-12, F-58 |  |
| F-111 | Industry-Specific Learning Hubs | Learning | 4 | Ph8 | F-07, F-55 |  |
| F-112 | Resume Parsing & Optimization | Candidate | 6 | Ph8 | F-13, F-12 |  |
| F-113 | Recruiter Outreach Analytics | Recruiting | 6 | Ph8 | F-59, F-06 |  |
| F-114 | Learning Impact Tracking | Analytics | 9 | Ph4 | F-07, F-04, F-06 |  |
| F-115 | Certification Exam Platform | Assessment | 9 | Ph3 | F-77, F-45 |  |
| F-116 | Accessibility & Inclusive Learning | Platform | 7 | Ph8 | F-07, F-44 |  |
| F-117 | Mobile-First Job Application | Candidate | 5 | Ph8 | F-04, F-33 |  |
| F-118 | Emerging Skills Detection | Intelligence | 4 | Ph8 | F-84 |  |
| F-119 | Diversity & Inclusion Analytics | Hiring | 4 | Ph8 | F-06 |  |
| F-120 | API & Integration Platform | Platform | 2 | Ph10 | F-01, F-34 |  |

### v2.1 integration family (F-121..F-143)

| ID | Feature | Category | P | Phase | Key dependencies | Flag |
|---|---|---|---|---|---|---|
| F-121 | Warm Introduction Paths | Networking | 8 | Ph4 | F-09, F-12, F-56, F-125 |  |
| F-122 | Application Feedback Loop | Jobs | 9 | Ph3 | F-06, F-04 |  |
| F-123 | Skill Decay Tracking (Freshness Engine) | Verification | 9 | Ph3 | F-84, F-96 |  |
| F-124 | Project Marketplace | Learning | 5 | Ph5 | F-07, F-26, F-100 |  |
| F-125 | Alumni Networks | Networking | 7 | Ph4 | F-12, F-09, F-40 |  |
| F-126 | Interview Prep Marketplace | Careers | 5 | Ph4 | F-87, F-90, F-88 |  |
| F-127 | Company Culture Assessment | Companies | 4 | Ph5 | F-56, F-75 |  |
| F-128 | Offer Comparison Tool | Careers | 7 | Ph4 | F-86, F-98, F-109 |  |
| F-129 | Leadership Development | Learning | 3 | Ph5 | F-07, F-84 |  |
| F-130 | Freelance Marketplace | Jobs | 3 | Ph7 | F-04, F-100, F-124 |  |
| F-131 | Apprenticeship Matching | Jobs | 3 | Ph6 | F-04, F-40 |  |
| F-132 | Scholarship Discovery | Learning | 3 | Ph6 | F-40, F-07 |  |
| F-133 | Volunteer Matching | Community | 2 | Ph7 | F-26, F-100 |  |
| F-134 | Code Review Practice | Skills | 4 | Ph5 | F-08, F-26 |  |
| F-135 | System Design Practice | Skills | 4 | Ph5 | F-88, F-08 |  |
| F-136 | Micro-Learning | Learning | 2 | Ph4 | F-07, F-42 |  |
| F-137 | Spaced Repetition | Learning | 2 | Ph6 | F-07, F-68 |  |
| F-138 | Study Accountability Partners | Learning | 3 | Ph6 | F-07, F-55 |  |
| F-139 | Local Communities & Meetups | Networking | 3 | Ph7 | F-09, F-55, F-57 |  |
| F-140 | Affinity Groups | Community | 3 | Ph7 | F-55, F-09 |  |
| F-141 | Onboarding Preparation | Careers | 1 | Ph8 | F-06, F-33 |  |
| F-142 | Referral Request System | Jobs | 8 | Ph4 | F-09, F-04 |  |
| F-143 | OSS Contribution Discovery | Portfolio | 4 | Ph8 | F-89, F-26 |  |

### Gap-analysis family (F-144..F-173)

| ID | Feature | Category | P | Phase | Key dependencies | Flag |
|---|---|---|---|---|---|---|
| F-144 | Reputation Engine (multi-context) | Platform | 9 | Ph2 | F-96, F-58, F-72 |  |
| F-145 | Recommendation Engine Core | Platform | 8 | Ph2–3 | F-84, F-144 |  |
| F-146 | Activity & Contribution Tracking | Platform | 7 | Ph3 | F-123, F-84, F-144 |  |
| F-147 | Unified Search & Discovery | Platform | 8 | Ph2 | F-84, F-145 |  |
| F-148 | Instructor Reputation System | Reputation | 8 | Ph7 | F-72, F-144 |  |
| F-149 | Employer Reputation & Brand System | Reputation | 7 | Ph8 | F-75, F-56, F-144 |  |
| F-150 | Peer Credibility Networks | Reputation | 7 | Ph8 | F-110, F-144 |  |
| F-151 | Skill Supply/Demand Forecasting | Intelligence | 7 | Ph4 | F-84, F-86, F-97 |  |
| F-152 | Career Trajectory Analysis | Intelligence | 7 | Ph4 | F-85, F-86, F-93 |  |
| F-153 | Learning Impact Dashboard (Enhanced) | Intelligence | 7 | Ph4 | F-114, F-85, F-86 |  |
| F-154 | Interview Prediction & Benchmarking | Intelligence | 6 | Ph4 | F-88, F-102, F-105 | Reframed as governed/descriptive intelligence, not candidate-level prediction (prior gap resolution) |
| F-155 | Adaptive Learning System | Personalization | 6 | Ph5 | F-07, F-84, F-145 |  |
| F-156 | Professional Development Plan System | Career | 6 | Ph4–5 | F-91, F-95, F-145 |  |
| F-157 | Skills Co-Learning Path Optimizer | Learning | 4 | Ph5 | F-84, F-114, F-07 |  |
| F-158 | Talent Pool Intelligence & Analytics | Recruiting | 6 | Ph3 | F-92, F-84, F-144 |  |
| F-159 | Behavioral Talent Discovery | Discovery | 6 | Ph4 | F-123, F-84, F-144 |  |
| F-160 | Talent Segmentation & Classification | Analytics | 5 | Ph4 | F-84, F-85, F-144 |  |
| F-161 | Internal Mobility & Succession Platform | Enterprise | 3 | Ph6–7 | F-84, F-91, F-132 |  |
| F-162 | Verified Work History Network & Graph | Verification | 5 | Ph4 | F-94, F-84 |  |
| F-163 | Credential Wallet & Portability | Credential | 3 | Ph5 | F-96 |  |
| F-164 | Skills Evidence Narrative & Storytelling | Credential | 4 | Ph5 | F-96, F-26 |  |
| F-165 | Diversity, Equity & Inclusion Data System | Analytics | 3 | Ph8 | F-119 |  |
| F-166 | Interview Performance Benchmarking | Analytics | 5 | Ph4 | F-88, F-102 |  |
| F-167 | Candidate Comparison & Rubric (Enhanced) | Hiring | 5 | Ph3 | F-88, F-103 |  |
| F-168 | Hiring Prediction & Success Modeling | Analytics | 3 | Ph5 | F-88, F-105 | Reframed as governed/descriptive intelligence, not candidate-level prediction (prior gap resolution) |
| F-169 | Community Contribution Scoring & Recognition | Community | 5 | Ph7 | F-55, F-144 |  |
| F-170 | Expert Network (Enhanced) | Community | 4 | Ph7 | F-144, F-90 |  |
| F-171 | Employer Brand Management System | Company | 3 | Ph8 | F-56, F-75, F-149 |  |
| F-172 | Advanced Compensation Intelligence | Analytics | 4 | Ph8 | F-86, F-98, F-109 |  |
| F-173 | Company-to-Skills Mapping | Intelligence | 3 | Ph4 | F-84, F-04 |  |

## 2. Distribution summary (computed by this merge; the legacy section "6.4 Distribution Summary" was an empty heading)

### By priority P

| P | Count |
|---|---|
| 10 | 10 |
| 9 | 14 |
| 8 | 22 |
| 7 | 29 |
| 6 | 31 |
| 5 | 23 |
| 4 | 19 |
| 3 | 16 |
| 2 | 4 |
| 1 | 1 |
| 0 | 4 |

### By earliest legacy phase (first phase named in the label)

| Earliest phase | Count |
|---|---|
| Ph0 | 9 |
| Ph1 | 12 |
| Ph2 | 25 |
| Ph3 | 24 |
| Ph4 | 26 |
| Ph5 | 14 |
| Ph6 | 6 |
| Ph7 | 18 |
| Ph8 | 28 |
| Ph9 | 4 |
| Ph10 | 5 |
| none ("-") | 2 |

### By category (top-level label in the legacy table)

| Category | Count |
|---|---|
| Learning | 24 |
| Intelligence | 12 |
| Platform | 11 |
| Analytics | 9 |
| Networking | 9 |
| Recruiting | 9 |
| Verification | 8 |
| Community | 7 |
| Institutions | 6 |
| Candidate | 5 |
| Communication | 5 |
| Hiring | 5 |
| Shell | 5 |
| Assessment | 4 |
| Career | 4 |
| Identity | 4 |
| Jobs | 4 |
| Careers | 3 |
| Edge | 3 |
| Engagement | 3 |
| Marketplace | 3 |
| Reputation | 3 |
| AI | 2 |
| Administration | 2 |
| Business | 2 |
| Credential | 2 |
| OS | 2 |
| Skills | 2 |
| Companies | 1 |
| Company | 1 |
| Discovery | 1 |
| Enterprise | 1 |
| Foundation | 1 |
| Gamification | 1 |
| Governance | 1 |
| Integration | 1 |
| Monetization | 1 |
| Personalization | 1 |
| Portfolio | 1 |
| Profile | 1 |
| Safety | 1 |
| Social | 1 |
| Telemetry | 1 |

Category labels are inconsistent in the source (for example `Career` / `Careers`, `Company` / `Companies`, `Networking` / `Social`); the 43 labels are preserved as written. Normalising them is a taxonomy decision for OPEN-41.

## 3. Computed dependency analysis (editorial; reproducible from section 1)

Method: for each row, take the earliest phase named in the Phase label; flag a dependency whose earliest phase is **later** than the dependent feature's earliest phase. All 173 dependency IDs resolve to existing features (no dangling references).

**Dependency cycle (1):** F-45 (Proctoring) depends on F-40 and F-115; F-115 (Certification Exam Platform) depends on F-77 and F-45. Neither can be built first as written. Both carry phase labels Ph10 / Ph3, so the cycle is also a phase inversion.

**Phase-order inversions (24):** the dependent feature is scheduled in an earlier phase than something it needs.

| Feature | Its phase | Depends on | That phase |
|---|---|---|---|
| F-36 | Ph1 | F-04 | Ph2 |
| F-86 | Ph3 | F-56 | Ph8 |
| F-87 | Ph4 | F-56 | Ph8 |
| F-90 | Ph4 | F-55 | Ph8 |
| F-94 | Ph3 | F-58 | Ph8 |
| F-98 | Ph3 | F-56 | Ph8 |
| F-100 | Ph5 | F-69 | Ph7 |
| F-106 | Ph5 | F-70 | Ph7 |
| F-107 | Ph5 | F-71 | Ph7 |
| F-115 | Ph3 | F-45 | Ph10 |
| F-121 | Ph4 | F-56 | Ph8 |
| F-127 | Ph5 | F-56 | Ph8 |
| F-127 | Ph5 | F-75 | Ph9 |
| F-128 | Ph4 | F-109 | Ph8 |
| F-137 | Ph6 | F-68 | Ph7 |
| F-138 | Ph6 | F-55 | Ph8 |
| F-139 | Ph7 | F-55 | Ph8 |
| F-139 | Ph7 | F-57 | Ph8 |
| F-140 | Ph7 | F-55 | Ph8 |
| F-144 | Ph2 | F-58 | Ph8 |
| F-144 | Ph2 | F-72 | Ph7 |
| F-149 | Ph8 | F-75 | Ph9 |
| F-169 | Ph7 | F-55 | Ph8 |
| F-171 | Ph8 | F-75 | Ph9 |

Reading: the legacy phase column was not derived from the dependency column. Target action: when the legacy P/phase metadata is reconciled with target Ph0 to Ph4 (OPEN-41), re-derive phases from dependencies (topological order) rather than copying the legacy phase labels. Recorded as OPEN-LGA-05.

## 4. Flags and gated features (restated from legacy statements)

| Feature | Statement | Source |
|---|---|---|
| F-38, F-39 | Marked DEPRECATED with P=0 in the legacy register (legacy chat service; unified backend stub). Target: do not rebuild; confirm retirement. | FEATURE_REGISTRY section 6.1 |
| F-45 | Third-party proctoring, vendor-gated by decision OD-35; Ph10. Target equivalent decision is OPEN-28. | FEATURE_REGISTRY |
| F-61 | Premium Candidate Tier, gated by pricing decision OD-34 ("price TBD"). Target equivalent is OPEN-19. | FEATURE_REGISTRY; PRICING |
| F-62, F-63 | Sponsored Content and Business-Development Graph marked NOT RECOMMENDED, P=0. Target product constitution already excludes ad-network and ranking by payment. | FEATURE_REGISTRY |
| F-154, F-168 | Prior memory file described candidate-level hiring-prediction features as "strictly banned" by the prior SSOT section E; the prior gap list says they were reframed as governed, descriptive intelligence. Target position: INV-T09 (no autonomous adverse decisions) governs; any predictive feature needs an ADR and fairness gate. | BRAIN/MEMORY section 5; GAP_ANALYSIS resolved gaps |
| F-65 / F-64 | LinkedIn decoupling is adapter-only ("LinkedIn runtime dependency" gap resolved to adapter-only); migration is governed by MIG-01..MIG-08. | GAP_ANALYSIS; BUSINESS_RULE_REGISTRY |
| Detailed feature records | The prior register once held long contracts for F-01, F-12, F-84 and others; they were moved to the root SSOT section 9. One correction was recorded: a privacy-preserving proof was once described as zero-knowledge-style, but a hash commitment is **not** zero-knowledge; the prior gap list resolved this as "Hash commitment called ZK: corrected terminology; stable VC 2.0 target". Target: never describe a hash commitment as zero-knowledge. | FEATURE_REGISTRY; GAP_ANALYSIS |

## 5. Per-feature contract template and status rule

The 31-field per-feature contract template and the status vocabulary (PLANNED, IN DEVELOPMENT, IMPLEMENTED, VERIFIED, RELEASED plus BLOCKED, DEPRECATED, REJECTED) are preserved in `../05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md`. Rule carried: documentation alone cannot advance a feature to IMPLEMENTED.

# Canonical SSOT Feature Crosswalk (Draft)

**Status:** Candidate mapping for owner review; OPEN-41 remains open.  
**Sources:** root `SSOT.md` §7 (173 canonical `F-*` identities) and `04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` (253 local `FEAT-*` rows).  
**Authority:** This is a traceability aid, not a new source of product scope, phase assignment, or implementation status.

## Method and limits

Each canonical feature was compared with local feature titles and behavior notes. `D` means a direct name/behavior overlap; `P` means a partial overlap or one component of a broader canonical feature; `—` means no defensible local match was found. A match is not a claim of complete coverage or implementation. Several F-to-FEAT mappings are intentionally one-to-many and many canonical identities have no candidate. The entries are proposed and need product-owner review before portfolio coverage or implementation readiness can be claimed.

The phase systems are not comparable: SSOT §7 uses its own `Ph0`–`Ph10` sequencing, while the capability map's local `P0`–`P4` values are proposed product sequencing. This crosswalk does not translate or reconcile phases. Feature dispositions such as `Remove`, `Defer`, and `Introduce` remain as written in the local map and require their own owner decisions where applicable.

## Candidate mapping

The related source registry's category, priority, phase and dependency columns are preserved separately in [FEATURE_REGISTRY_METADATA_CROSSWALK](FEATURE_REGISTRY_METADATA_CROSSWALK.md) and its [row-level CSV](FEATURE_REGISTRY_METADATA_CROSSWALK.csv). Those source fields are not target phase or implementation-status assignments.

| SSOT ID | Canonical feature | Candidate local FEAT IDs | Match |
|---|---|---|---|
| F-01 | Authentication & Session | FEAT-01-01–13 | D |
| F-02 | Landing Page | — | — |
| F-03 | Dashboard (Role-Adaptive) | — | — |
| F-04 | Job Marketplace | FEAT-09-05–07; FEAT-11-01, 11-04 | P |
| F-05 | Post Job Studio | FEAT-09-01, 09-02, 09-04 | D |
| F-06 | ATS / Candidate Pipeline | FEAT-10-04–06, 10-08–13 | P |
| F-07 | Learning Management System | FEAT-08-01–08 | D |
| F-08 | Challenges Arena | FEAT-07-01–09, 07-11 | P |
| F-09 | Professional Networking | FEAT-14-01, 14-07 | P |
| F-10 | Direct Messaging | FEAT-13-01, 13-03–06, 13-09–10 | D |
| F-11 | AI Career Assistant (Basic) | FEAT-17-06 | P |
| F-12 | Profile Management | FEAT-03-01–02, 03-06–10 | D |
| F-13 | Resume Builder | FEAT-03-04–05 | D |
| F-14 | Notification Center | FEAT-15-01–08 | D |
| F-15 | Settings | FEAT-15-02; FEAT-22-05 | P |
| F-16 | Billing & Subscriptions | FEAT-16-01–08, 16-11–14 | D |
| F-17 | Admin Console | FEAT-20-01–03, 20-05–08, 20-10 | D |
| F-18 | Chrome Extension Companion | — | — |
| F-19 | Product Analytics | FEAT-21-01, 21-05 | P |
| F-20 | Command Search (⌘K) | — | — |
| F-21 | Error Recovery & Resilience | FEAT-24-02–03, 24-06–07 | P |
| F-22 | Gamification & XP Ledger | — | — |
| F-23 | Leaderboard & Badges | FEAT-07-13 | P |
| F-24 | Trust, Safety & Moderation | FEAT-19-01–10; FEAT-13-05 | D |
| F-25 | Job Detail View | FEAT-09-05 | D |
| F-26 | Portfolio Showcase | FEAT-03-03; FEAT-05-08 | D |
| F-27 | Local Resume Match Preview | — | — |
| F-28 | External Job Page Scanner | — | — |
| F-29 | Scheduled Notification Digest | FEAT-15-05; FEAT-24-09 | P |
| F-30 | Networking Stale-Request Nudges | FEAT-15-05 | P |
| F-31 | KPI Aggregation & Rollups | FEAT-21-02–05 | P |
| F-32 | Saved Searches & Job Alerts | FEAT-09-06 | D |
| F-33 | Video Interview Rooms | — | — |
| F-34 | Multi-Entity Backend Search | FEAT-11-01, 11-05; FEAT-24-12 | P |
| F-35 | Feature Flag Console | FEAT-20-04 | D |
| F-36 | Application Draft Autosave | FEAT-10-01 | D |
| F-37 | Job Templates | FEAT-09-04 | D |
| F-38 | Legacy Chat Service (DEPRECATED) | FEAT-13-08 | D |
| F-39 | Unified Backend Stub (DEPRECATED) | — | — |
| F-40 | Institutional Managed Learning | FEAT-18-01–09; FEAT-08-06 | P |
| F-41 | Procurement & Seat Licensing | FEAT-18-08; FEAT-16-08, 16-13 | P |
| F-42 | Provider-Agnostic Media Engine | — | — |
| F-43 | B2B2C Graduation Flywheel | FEAT-18-07 | P |
| F-44 | AI Media Enrichment | — | — |
| F-45 | Proctoring (Third-Party, vendor-gated OD-35) | FEAT-07-12; FEAT-18-10 | D |
| F-46 | Institutional Analytics | FEAT-18-04, 18-09; FEAT-21-04 | D |
| F-47 | Faculty Dashboard | FEAT-18-04–05 | P |
| F-48 | OS Shell & Workbench | — | — |
| F-49 | Automation & Agents | — | — |
| F-50 | Institutional Course Marketplace | FEAT-08-01; FEAT-16-09; FEAT-18-01 | P |
| F-51 | Media Health Monitoring | — | — |
| F-52 | Certificate Verification | FEAT-05-06; FEAT-06-07; FEAT-08-04; FEAT-18-06 | P |
| F-53 | Professional Social Graph & Feed | FEAT-14-01 | P |
| F-54 | Content Publishing | FEAT-14-04 | P |
| F-55 | Groups & Communities | FEAT-14-02 | D |
| F-56 | Organization & Institution Pages | FEAT-02-05; FEAT-18-01 | P |
| F-57 | Events & Webinars | FEAT-14-03 | D |
| F-58 | Written Recommendations | — | — |
| F-59 | Outreach Credits (TalentMail) | FEAT-13-02; FEAT-16-11 | P |
| F-60 | Profile Views & Privacy Controls | FEAT-03-02; FEAT-22-01, 22-10; FEAT-21-02 | P |
| F-61 | Premium Candidate Tier (OD-34 gated) | — | — |
| F-62 | Sponsored Content (NOT RECOMMENDED) | FEAT-14-08 | D |
| F-63 | Business-Development Graph (NOT RECOMMENDED) | FEAT-14-09 | D |
| F-64 | LinkedIn Migration Engine | FEAT-23-05 | P |
| F-65 | LinkedIn Decoupling & Independence | — | — |
| F-66 | Course Creation Studio | FEAT-08-06 | D |
| F-67 | Categories, Discovery & Comparison | FEAT-08-01 | P |
| F-68 | Quizzes, Practice Tests & Final Exams | FEAT-07-01–02, 07-06, 07-09 | D |
| F-69 | Assignments & Peer Review | — | — |
| F-70 | Learning Paths, Programs & Specializations | FEAT-08-05 | P |
| F-71 | Course Q&A, Discussions, Notes | FEAT-08-12 | P |
| F-72 | Course Reviews & Ratings | FEAT-08-07 | D |
| F-73 | Course Commerce | FEAT-08-02, 08-10; FEAT-16-09 | D |
| F-74 | Instructor Platform | FEAT-08-06, 08-09; FEAT-18-05 | P |
| F-75 | Employer Insights | — | — |
| F-76 | Coding Contests & Live Leaderboards | FEAT-07-13 | D |
| F-77 | Skill Certification Exams | FEAT-07-01–02, 07-06; FEAT-05-04 | P |
| F-78 | Practice Sets & Interview Prep | FEAT-07-11; FEAT-17-10 | P |
| F-79 | Articles & Newsletters | FEAT-14-04 | P |
| F-80 | Profile Enhancements | FEAT-03-01–04, 03-06, 03-09 | P |
| F-81 | Identity Verification | FEAT-06-08 | D |
| F-82 | Student Learning Analytics | FEAT-21-02, 21-04 | P |
| F-83 | Admin Platform Expansion | FEAT-20-01, 20-03, 20-05–06 | P |
| F-84 | Skills Graph & Taxonomy | FEAT-04-01, 04-03, 04-06 | D |
| F-85 | Career Graph & Progression | FEAT-12-01, 12-03, 12-05 | P |
| F-86 | Salary Intelligence | FEAT-12-04 | D |
| F-87 | Interview Experience Repository | — | — |
| F-88 | Technical Interview Platform | — | — |
| F-89 | Contribution Verification System | — | — |
| F-90 | Peer Mentorship & Advisor Network | FEAT-08-11; FEAT-14-06 | P |
| F-91 | Career Readiness Assessment | FEAT-12-01 | P |
| F-92 | Advanced Recruiter Search | FEAT-11-03, 11-05–06 | P |
| F-93 | Interview Video Recording & AI Feedback | FEAT-10-16 | D |
| F-94 | Verified Work History & References | FEAT-03-07; FEAT-06-01–04 | D |
| F-95 | Career Transition Planning | FEAT-12-02–03, 12-05 | D |
| F-96 | Skill Evidence & Digital Credentials | FEAT-04-04; FEAT-05-01–02, 05-04, 05-06, 05-11 | D |
| F-97 | Real-Time Job Market Analytics | FEAT-12-07 | P |
| F-98 | Employer Equity & Compensation Intelligence | FEAT-11-09; FEAT-12-04 | P |
| F-99 | AI Career Coach (Enhanced) | FEAT-17-06 | P |
| F-100 | Peer Project Collaboration | — | — |
| F-101 | Badge Marketplace & Recognition | — | — |
| F-102 | Hiring Manager Portal | FEAT-02-06; FEAT-10-05, 10-08–09 | P |
| F-103 | Candidate Comparison & Rubric | FEAT-10-08; FEAT-11-10 | P |
| F-104 | Pre-Hire Assessment Customization | FEAT-07-09–10 | P |
| F-105 | Post-Hire Analytics & ROI Tracking | FEAT-18-09 | P |
| F-106 | Skill Prerequisite Engine | FEAT-04-03; FEAT-08-01–02, 08-08 | P |
| F-107 | Live Q&A with Instructors | FEAT-08-12 | P |
| F-108 | Expert Network Matching | FEAT-08-11; FEAT-14-06 | P |
| F-109 | Salary Negotiation Guidance | — | — |
| F-110 | Verified Skill Endorsements | FEAT-05-03 | P |
| F-111 | Industry-Specific Learning Hubs | — | — |
| F-112 | Resume Parsing & Optimization | FEAT-03-04–05; FEAT-17-04 | P |
| F-113 | Recruiter Outreach Analytics | — | — |
| F-114 | Learning Impact Tracking | FEAT-08-03; FEAT-18-09; FEAT-21-02, 21-04 | P |
| F-115 | Certification Exam Platform | FEAT-07-01–02, 07-06; FEAT-05-04 | P |
| F-116 | Accessibility & Inclusive Learning | FEAT-03-04; FEAT-08-03 | P |
| F-117 | Mobile-First Job Application | FEAT-10-01–02; FEAT-24-06 | P |
| F-118 | Emerging Skills Detection | — | — |
| F-119 | Diversity & Inclusion Analytics | FEAT-11-09 | P |
| F-120 | API & Integration Platform | FEAT-23-01–04, 23-07 | D |
| F-121 | Warm Introduction Paths | FEAT-14-01, 14-07 | P |
| F-122 | Application Feedback Loop | FEAT-10-04, 10-06 | P |
| F-123 | Skill Decay Tracking (Freshness Engine) | FEAT-04-04; FEAT-11-07 | D |
| F-124 | Project Marketplace | — | — |
| F-125 | Alumni Networks | FEAT-18-07; FEAT-14-01 | P |
| F-126 | Interview Prep Marketplace | FEAT-07-11; FEAT-17-10; FEAT-08-11 | P |
| F-127 | Company Culture Assessment | — | — |
| F-128 | Offer Comparison Tool | FEAT-10-10; FEAT-12-04 | P |
| F-129 | Leadership Development | FEAT-08-05; FEAT-12-05 | P |
| F-130 | Freelance Marketplace | FEAT-09-01–03 | P |
| F-131 | Apprenticeship Matching | — | — |
| F-132 | Scholarship Discovery | — | — |
| F-133 | Volunteer Matching | — | — |
| F-134 | Code Review Practice | FEAT-07-03, 07-11 | P |
| F-135 | System Design Practice | — | — |
| F-136 | Micro-Learning | FEAT-08-03, 08-05 | P |
| F-137 | Spaced Repetition | — | — |
| F-138 | Study Accountability Partners | — | — |
| F-139 | Local Communities & Meetups | FEAT-14-02–03 | D |
| F-140 | Affinity Groups | FEAT-14-02 | D |
| F-141 | Onboarding Preparation | — | — |
| F-142 | Referral Request System | FEAT-14-07 | D |
| F-143 | OSS Contribution Discovery | FEAT-23-08; FEAT-03-03 | P |
| F-144 | Reputation Engine (multi-context) | — | — |
| F-145 | Recommendation Engine Core | FEAT-11-04, 11-07; FEAT-12-02 | P |
| F-146 | Activity & Contribution Tracking | FEAT-21-01 | P |
| F-147 | Unified Search & Discovery | FEAT-08-01; FEAT-11-01, 11-06; FEAT-24-12 | P |
| F-148 | Instructor Reputation System | FEAT-08-07 | P |
| F-149 | Employer Reputation & Brand System | FEAT-02-05; FEAT-06-04 | P |
| F-150 | Peer Credibility Networks | FEAT-05-03; FEAT-14-01 | P |
| F-151 | Skill Supply/Demand Forecasting | FEAT-12-07, 12-04 | P |
| F-152 | Career Trajectory Analysis | FEAT-12-01, 12-03, 12-05 | P |
| F-153 | Learning Impact Dashboard (Enhanced) | FEAT-21-04–05; FEAT-18-04, 18-09 | P |
| F-154 | Interview Prediction & Benchmarking | FEAT-10-08, 10-16 | P |
| F-155 | Adaptive Learning System | FEAT-08-03, 08-05; FEAT-12-02 | P |
| F-156 | Professional Development Plan System | FEAT-12-05–06 | D |
| F-157 | Skills Co-Learning Path Optimizer | FEAT-04-03; FEAT-08-05; FEAT-12-02 | P |
| F-158 | Talent Pool Intelligence & Analytics | FEAT-10-13; FEAT-21-03 | P |
| F-159 | Behavioral Talent Discovery | — | — |
| F-160 | Talent Segmentation & Classification | — | — |
| F-161 | Internal Mobility & Succession Platform | — | — |
| F-162 | Verified Work History Network & Graph | FEAT-03-07; FEAT-06-01–04; FEAT-14-01 | P |
| F-163 | Credential Wallet & Portability | FEAT-05-06, 05-11 | D |
| F-164 | Skills Evidence Narrative & Storytelling | FEAT-03-03–04; FEAT-05-08 | P |
| F-165 | Diversity, Equity & Inclusion Data System | FEAT-11-09 | P |
| F-166 | Interview Performance Benchmarking | — | — |
| F-167 | Candidate Comparison & Rubric (Enhanced) | FEAT-10-08; FEAT-11-10 | P |
| F-168 | Hiring Prediction & Success Modeling | — | — |
| F-169 | Community Contribution Scoring & Recognition | — | — |
| F-170 | Expert Network (Enhanced) | FEAT-08-11; FEAT-14-06 | P |
| F-171 | Employer Brand Management System | FEAT-02-05 | P |
| F-172 | Advanced Compensation Intelligence | FEAT-12-04 | P |
| F-173 | Company-to-Skills Mapping | — | — |

## Owner-review focus

- Confirm every proposed link and whether the local row is an acceptable decomposition of the canonical scope; `P` entries especially need confirmation.
- Confirm whether canonical features marked deprecated or not recommended should map to local rows marked `Remove` (F-38, F-62, F-63).
- Decide disposition for canonical features with no local candidate; a blank candidate is a traceability gap to resolve, not an automatic request to add scope.
- F-144's multi-context reputation engine has no candidate. F-148 instructor reputation and F-149 employer reputation are narrower partials and do not establish a shared reputation engine covering context, recovery, privacy, and derived signals.
- Review phase alignment separately. The SSOT and local phase labels are different scales, and this table intentionally does not infer a translation.

## Validation state

The table contains one row for each canonical F-01 through F-173 identity. Candidate links are based on document names and behavior notes only. No product owner has approved this mapping; no feature implementation, runtime behavior, or acceptance-test coverage is implied. OPEN-41 stays open until the owner confirms the crosswalk and the capability map, roadmap, and traceability report are reconciled to that decision.

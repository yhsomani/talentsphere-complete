# TalentSphere — WORKFLOWS_AND_BUSINESS_RULES.md v6.0

This document contains the detailed behavioral corpus. Global rules are governed by SSOT.md.

## 10. Journeys, Workflows, State Machines & Business Rules

The following is the canonical behavioral corpus for end-to-end journeys, workflow integrity, state transitions, and business rules. Repeated definitions elsewhere should reference these records rather than recreate them.

### 16.1 Complete Journey Register (J-01..J-28)

| ID | Name | Persona | Terminal |
|---|---|---|---|
| J-01 | Learn → Prove → Showcase | P-A, P-B | Portfolio with verified signals |
| J-02 | Apply → Track → Hire | P-A, P-B | Offer accepted |
| J-03 | Post → Source → Hire | P-C, P-E, P-S | Offer extended |
| J-04 | Org Setup → Team → Launch | P-C, P-E | First hire |
| J-05 | Profile → Network → Referral | P-A, P-B | Referred hire |
| J-06 | AI Career Path: Gap → Plan → Execute | P-B | Gaps addressed |
| J-07 | Creator: Author → Publish → Monetize | P-G | Revenue |
| J-08 | Mentor: Match → Guide → Impact | P-H | Impact measured |
| J-09 | Institution: Cohort → Place → Track | P-I | Placement reported |
| J-10 | Agency: Multi-Org → Pipeline → Bill | P-F | Client invoice |
| J-11 | Extension: Install → Local-First → Sync | P-A | Profile diff applied |
| J-12 | B2B2C Graduation Flywheel | P-I, ML | Independent candidate |
| J-13 | Institutional Media Authoring | P-G, P-K | Course assigned to batch |
| J-14 | Institutional Procurement & Licensing | P-J | Seats provisioned |
| J-15 | Faculty: Teach → Monitor → Intervene | P-K | At-risk students intervened |
| J-16 | Corporate L&D: Mandate → Track → Certify | P-L, P-T | Certification + HRIS sync |
| J-17 | LinkedIn Migration On-ramp | New user | Native account complete |
| J-18 | Creator: Author → Publish → Sell → Payout | P-G | Monthly settlement |
| J-19 | Self-Paced Learner: Discover → Certify | P-M | Path enrolled |
| J-20 | Learner: Path → Courses → Capstone → Cert | P-M | Program certificate |
| J-21 | Contestant: Register → Compete → Rank → Certify | P-Q | Certification badge |
| J-22 | Researcher: Company → Reviews → Compare → Apply | P-O | Apply started |
| J-23 | Author: Post → Engage → Article → Newsletter | P-N | Audience established |
| J-24 | Reviewer: Write → Moderate → Publish → Response | Any verified user | Published review |
| J-25 | Peer Reviewer: Assigned → Rubric Review → Feedback | Student | Grade finalized |
| J-26 | Career Switcher: Assess → Plan → Transition | P-R | Role transition confirmed |
| J-27 | Hiring Manager: Define → Assess → Hire → Track | P-S | Post-hire outcome recorded |
| J-28 | Skills Analyst: Analyze → Recommend → Measure | P-T | Learning program impact reported |

### 16.2 J-02 Apply → Track → Hire (Detailed)

```mermaid
journey
    title J-02 Apply → Track → Hire
    section Discovery
      Browse jobs: 5: Candidate
      Filter results: 4: Candidate
      View detail: 5: Candidate
    section Application
      Click Apply: 5: Candidate
      Completeness gate: 3: System
      Autosave draft: 4: System
      Submit: 5: Candidate
      Recruiter notified: 5: System
    section Review
      Recruiter screens: 3: Recruiter
      Shortlist: 4: Recruiter
      Schedule interview: 4: Recruiter
      Interview: 4: Both
      Scorecard: 3: Interviewer
    section Decision
      HM review: 4: Hiring Manager
      Offer: 5: Recruiter
      Accept: 5: Candidate
      Hire recorded: 5: System
```

### 16.3 J-26 Career Switcher (Detailed)

```mermaid
flowchart LR
    A[Target role identified] --> B[F-91 Career Readiness]
    B --> C{Skills gap?}
    C -->|Yes| D[F-95 Career Transition Plan]
    D --> E[F-84 suggests learning]
    E --> F[F-07 enroll courses]
    F --> G[F-08 challenges + F-69 assignments]
    G --> H[F-96 Skill Evidence]
    H --> I[F-85 Career Graph comparison]
    I --> J{Ready?}
    J -->|Yes| K[Apply via F-04]
    J -->|No| D
    K --> L[F-88 Interview Platform]
    L --> M[Hired + outcome tracked]
```

---

### Workflows & Integrity Traces

### 17.1 Complete Workflow Register (WF-01..WF-66)

| ID | Workflow | Terminal |
|---|---|---|
| WF-01 | Candidate Discovery → Application | Application submitted |
| WF-02 | Recruiter Sourcing Pipeline | Shortlist confirmed |
| WF-03 | Course Enrollment & Completion | Certificate + XP |
| WF-04 | Challenge Participation & Scoring | Score recorded |
| WF-05 | Application Review & Decision | Hired / rejected |
| WF-06 | Offer Management & Negotiation | Offer accepted / expired |
| WF-07 | AI Career Assistant Conversation | User-accepted action |
| WF-08 | Content Moderation & Enforcement | Resolution logged |
| WF-09 | Subscription Purchase & Upgrade | Active entitlement |
| WF-10 | Messaging Thread & Response | Message persisted + ack |
| WF-11 | XP Earning & Level Progression | Ledger row + level |
| WF-12 | Onboarding & First-Experience | First meaningful action |
| WF-13 | Reported Content Review | Action logged + appeal window |
| WF-14 | Invitation & Team Growth | Membership active |
| WF-15 | Employer Brand Profile Setup | Profile published + verified |
| WF-16 | Institutional License Purchase | Pool active + invoice reconciled |
| WF-17 | Bulk Student Import | Students provisioned + report |
| WF-18 | Batch Course Assignment | Batch enrolled + seats exact |
| WF-19 | Media Ingestion & Validation | Media validated + ready |
| WF-20 | License Revocation & Seat Reassignment | Seat returned + reassigned |
| WF-21 | Graduation Transition (B2B2C) | Independent profile active |
| WF-22 | Institutional Renewal | Renewal confirmed |
| WF-23 | Purchase Approval | Purchase approved + PO issued |
| WF-24 | Course Publish Review | Approved / rejected with feedback |
| WF-25 | Course Purchase & Enrolment | Enrolled |
| WF-26 | Coupon Redemption | Discount applied |
| WF-27 | Refund Request → Review → Refund/Deny | Refunded / denied |
| WF-28 | Instructor Payout Settlement | Payout paid |
| WF-29 | Quiz Attempt & Grading | Grade recorded |
| WF-30 | Assignment Submit → Grade / Peer Review | Grade finalized |
| WF-31 | Path Enrolment & Progression | Path completed |
| WF-32 | Contest Lifecycle | Results published |
| WF-33 | Certification Exam Attempt | Pass / fail / expired |
| WF-34 | Post Publish → Feed Distribution | Post visible in feed |
| WF-35 | Newsletter Issue Send | Sent / paused |
| WF-36 | Company Review Moderation | Published / removed |
| WF-37 | Salary Report Aggregation | Aggregated |
| WF-38 | Recommendation Request → Give → Accept → Display | Displayed / declined |
| WF-39 | Outreach Credit Send → Reply → Refund | Replied / expired |
| WF-40 | Profile View Logging | Logged per privacy mode |
| WF-41 | LinkedIn Migration Import | Native account complete |
| WF-42 | Skill Gap Assessment → Learning Plan | Learning plan activated |
| WF-43 | Career Readiness Evaluation | Readiness score computed |
| WF-44 | Salary Data Submission → Aggregation | Aggregated |
| WF-45 | Technical Interview Assessment | Assessment completed |
| WF-46 | Interview Recording + AI Feedback | Feedback report generated |
| WF-47 | Skill Evidence Issuance | Credential verified |
| WF-48 | Contribution Verification | Commit impact verified |
| WF-49 | Peer Mentorship Match → Session | Session completed |
| WF-50 | Expert Network Call Request | Call concluded |
| WF-51 | Custom Assessment Creation → Deployment | Assessment live |
| WF-52 | Post-Hire Outcome Tracking | Outcome recorded |
| WF-53 | Certification Exam Attempt | Pass/fail/expired |
| WF-54 | Emerging Skill Detection → Publication | New skill added to taxonomy |
| WF-55 | Warm Introduction Request → Delivery | Intro delivered |
| WF-56 | Application Feedback → Learning Loop | Improvement action |
| WF-57 | Skill Freshness → Re-verification | Freshness restored |
| WF-58 | Referral Request → Hire | Referral outcome |
| WF-59 | Alumni Network Join → Connect | Alumni connection |
| WF-60 | Reputation Signal → Score Update | Score recomputed |
| WF-61 | Recommendation → Acceptance → Learning | Feedback loop |
| WF-62 | Activity Tracking → Discovery | Behavioral signal |
| WF-63 | Interview Prep → Session → Feedback | Prep completed |
| WF-64 | Adaptive Learning → Mastery | Skill mastered |
| WF-65 | PDP Goal → Milestone → Achievement | Goal achieved |
| WF-66 | Internal Mobility Match → Transition | Internal move |

### 17.2 Workflow Integrity Traces (WIT-001..WIT-025)

| WF | Name | Trace | Terminal Exit | Primary Guard |
|---|---|---|---|---|
| WF-01 | Candidate Discovery → Application | WIT-001 | Application submitted + confirmation | Idempotency-Key + draft restore |
| WF-02 | Recruiter Sourcing Pipeline | WIT-002 | Shortlist confirmed + invite sent | Tenant-scoped RLS + optimistic locking |
| WF-03 | Course Enrollment & Completion | WIT-003 | Enrollment completed + certificate + XP | Unique enrollment guard + idempotent XP |
| WF-04 | Challenge Participation & Scoring | WIT-004 | Scored (≥70%) + XP | Sandbox ≤30s + idempotent score |
| WF-05 | Application Review & Decision | WIT-005 | Terminal hired/rejected + event | Mandatory scorecard precondition |
| WF-06 | Offer Management & Negotiation | WIT-006 | Offer accepted or expired | Single active offer constraint |
| WF-07 | AI Career Assistant Conversation | WIT-007 | User-accepted action (or dismissal) | `<user_content>` sanitization + heuristic fallback |
| WF-08 | Content Moderation & Enforcement | WIT-008 | Resolution logged + notice sent | Append-only queue + two-human review on bans |
| WF-09 | Subscription Purchase & Upgrade | WIT-009 | Active entitlement reconciled with Stripe | Webhook signature + idempotent credit |
| WF-10 | Messaging Thread & Response | WIT-010 | Message persisted + delivery ack | clientMessageId dedupe + Realtime RLS |
| WF-11 | XP Earning & Level Progression | WIT-011 | XP ledger row + recomputed level | UNIQUE(user_id, reference_type, reference_id) |
| WF-12 | Onboarding & First-Experience | WIT-012 | First meaningful action complete | Resumable onboarding + email verify retry |
| WF-13 | Reported Content Review | WIT-013 | Admin action logged + appeal window open | Severity SLA escalation + immutable audit |
| WF-14 | Invitation & Team Growth | WIT-014 | Membership active with mapped role | Unique crypto token + 7-day TTL |
| WF-15 | Employer Brand Profile Setup | WIT-015 | Profile published & verified | Domain verification gate |
| WF-16 | Institutional License Purchase | WIT-016 | Pool active + invoice reconciled | Idempotency (PO number + Stripe event.id) |
| WF-17 | Bulk Student Import | WIT-017 | Students provisioned + error report | Validate-then-commit |
| WF-18 | Batch Course Assignment | WIT-018 | Batch enrolled + seats consumed exactly N | Row lock + CHECK used≤total |
| WF-19 | Media Ingestion & Validation | WIT-019 | Media validated + asset ready | Validation states + SSRF allow-list |
| WF-20 | License Revocation & Seat Reassignment | WIT-020 | Seat returned + reassigned exactly once | Row lock + progress retained |
| WF-21 | Graduation Transition (B2B2C) | WIT-021 | Independent profile active | Never auto-convert + transactional |
| WF-22 | Institutional Renewal | WIT-022 | Renewal confirmed or graceful expiry path | Expiry scan job + grace period |
| WF-23 | Purchase Approval | WIT-023 | Purchase approved + PO issued | Configurable chain + RBAC per level |
| WF-24 | Course Publish Review | WIT-024 | Approved / rejected with feedback | Admin review SLA ≤72h + max 3 rejections |
| WF-25 | Course Purchase & Enrolment | WIT-025 | Enrolled | Webhook-owned fulfillment |

---

### State Machines

### 18.1 Complete State Machine Index

| Entity | Terminal States |
|---|---|
| Application | hired, rejected, withdrawn, stale_withdrawn, candidate_unresponsive |
| Job | closed, archived |
| Offer | hired, closed |
| Enrollment | completed, dropped, expired |
| Organization | active, archived |
| Interview | completed, cancelled |
| Mentor Relationship | completed, cancelled |
| Certificate | verified, revoked, expired |
| Moderation | approved, rejected |
| Challenge Submission | passed, failed, error |
| Background Job | succeeded, dead |
| License/Seat | expired, revoked, returned |
| Managed Learner | independent, archived |
| Media Asset | ready, failed, archived |
| Purchase Request | purchased, cancelled |
| Course (authoring) | published, archived, unpublished |
| Course Version | current, superseded |
| Quiz Attempt | graded |
| Assignment | graded, returned |
| Peer Review | completed |
| Learning Path Enrollment | completed, dropped |
| Course Order | enrolled, cancelled, refunded |
| Coupon | exhausted, expired, revoked |
| Payout | paid, failed |
| Company Review | published, removed |
| Salary Report | aggregated |
| Interview Question | published, rejected |
| Contest | results_published, archived |
| Certification Attempt | passed, failed, expired |
| Post | deleted, hidden_by_moderation |
| Comment | deleted, removed_by_moderation |
| Newsletter Issue | sent, failed |
| Recommendation | displayed, declined, withdrawn |
| Outreach Message | replied, expired |
| Group Membership | left, removed |
| Event | completed, cancelled |
| Migration Job | completed, failed, cancelled |
| Instructor | active, retired |
| Skill (F-84) | Merged |
| Credential (F-96) | revoked, expired |
| Interview Assessment (F-88) | reviewed, cancelled, no_show |
| Career Readiness (F-91) | completed, abandoned |
| Mentorship Session (F-90) | rated, declined, cancelled |
| Certification Attempt (F-115) | certified |
| Skill Freshness (F-123) | demoted |

### 18.2 Canonical State Machines

#### Application

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> submitted
    submitted --> under_review
    submitted --> withdrawn
    submitted --> archived
    under_review --> shortlisted
    under_review --> rejected
    under_review --> archived
    shortlisted --> interview
    shortlisted --> rejected
    shortlisted --> archived
    interview --> assessment
    interview --> offer
    interview --> rejected
    assessment --> offer
    assessment --> rejected
    offer --> hired
    offer --> rejected
    hired --> [*]
    rejected --> [*]
    withdrawn --> [*]
    archived --> [*]
```

#### Job

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> pending_approval
    pending_approval --> approved
    pending_approval --> rejected_by_moderation
    rejected_by_moderation --> draft: revise
    approved --> scheduled
    approved --> published
    scheduled --> published
    published --> paused
    paused --> published
    published --> closed
    closed --> archived
    archived --> [*]
```

#### Credential (F-96)

```mermaid
stateDiagram-v2
    [*] --> issued
    issued --> verified
    issued --> disputed
    disputed --> upheld
    disputed --> revoked
    verified --> expired
    verified --> revoked
    upheld --> issued
    revoked --> [*]
    expired --> [*]
```

#### Certification Attempt (F-115)

```mermaid
stateDiagram-v2
    [*] --> registered
    registered --> in_progress
    in_progress --> submitted
    submitted --> graded
    graded --> passed
    graded --> failed
    passed --> certified
    failed --> cooldown
    cooldown --> registered: 7 days
    certified --> [*]
```

#### Interview Assessment (F-88)

```mermaid
stateDiagram-v2
    [*] --> scheduled
    scheduled --> in_progress
    in_progress --> completed
    in_progress --> cancelled
    in_progress --> no_show
    completed --> scored
    scored --> reviewed
    reviewed --> [*]
    cancelled --> [*]
    no_show --> [*]
```

#### Course Order

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> paid
    pending --> cancelled
    paid --> enrolled
    enrolled --> completed
    enrolled --> refund_requested
    refund_requested --> refund_approved
    refund_requested --> refund_denied
    refund_approved --> refunded
    refund_denied --> enrolled
    refunded --> [*]
    cancelled --> [*]
    completed --> [*]
```

#### Contest

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> scheduled
    scheduled --> registration_open
    registration_open --> active
    active --> ended
    ended --> results_published
    results_published --> archived
    archived --> [*]
```

### 18.3 Invariants Across All State Machines

> [!IMPORTANT]
> - No state may be skipped
> - Every transition writes an audit record
> - Terminal states are irreversible without a new entity
> - Server is authoritative (client optimism is UI-only)
> - **INV-TERMINAL:** Every state machine has an acyclic path to an explicit terminal state

---

### Canonical Business Rules (BR-01..BR-248 consolidated)

### 19.1 Access Control Rules (BR-01..BR-09)

| ID | Rule |
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

### 19.2 Job Rules (BR-10..BR-14)

| ID | Rule |
|---|---|
| BR-10 | Job publish-readiness rule server-validated |
| BR-11 | Job lifecycle: draft→pending_approval→approved→scheduled→published→paused→closed→archived |
| BR-12 | Recruiters update/publish/archive only own-company jobs |
| BR-13 | Hidden jobs are client-preference; reversible |
| BR-14 | Saved-search digest runs as service-owned/audited scheduler |

### 19.3 Application Rules (BR-15..BR-20)

| ID | Rule |
|---|---|
| BR-15 | No duplicate ACTIVE application per user per job (partial UNIQUE + 90-day cooldown post-terminal) |
| BR-16 | No applications to closed/unavailable jobs |
| BR-17 | Application lifecycle server-owned append-only |
| BR-18 | Application drafts autosave 30s; recoverable; versions retained |
| BR-19 | Candidate notes/scorecards recruiter-scoped; never candidate-visible |
| BR-20 | Status-event history append-only |

### 19.4 Learning & Challenge Rules (BR-21..BR-25)

| ID | Rule |
|---|---|
| BR-21 | Lesson completion idempotent |
| BR-22 | Lesson prerequisites gate progression |
| BR-23 | Course completion → certificate + XP bonus |
| BR-24 | Challenge language allowlist; execution limits per TD-05 |
| BR-25 | XP idempotent UNIQUE(user_id, reference_type, reference_id); daily cap **200 XP/day** |

### 19.5 Data Governance Rules (BR-26..BR-35)

| ID | Rule |
|---|---|
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

### 19.6 Expanded Rules (BR-036..BR-071)

| ID | Rule |
|---|---|
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

### 19.7 Institutional Rules (BR-072..BR-082)

| ID | Rule |
|---|---|
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

### 19.8 Media Rules (BR-083..BR-090)

| ID | Rule |
|---|---|
| BR-083 | External media validated before publication; invalid/private/embed-blocked rejected |
| BR-084 | Provider embedding restrictions never bypassed; protected content never downloaded |
| BR-085 | Provider capabilities determine available playback/completion settings |
| BR-086 | Broken external provider isolated to affected content item; course remains functional |
| BR-087 | Platform stores learner progress even for externally hosted playback where trackable |
| BR-088 | Unsupported providers produce explicit errors, never silent broken embeds |
| BR-089 | Authors attest right to use external content before publication |
| BR-090 | Org provider allowlists enforced server-side |

### 19.9 Learning Marketplace Rules (BR-091..BR-115)

| ID | Rule |
|---|---|
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

### 19.10 Social/Content Rules (BR-116..BR-128)

| ID | Rule |
|---|---|
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

### 19.11 Outreach, Recommendations, Privacy (BR-129..BR-134)

| ID | Rule |
|---|---|
| BR-129 | Outreach credit consumed on send to a non-connection; refunded on reply within 7 days |
| BR-130 | Outreach weekly caps: 20 (Pro), 50 (Team), custom (Enterprise) |
| BR-131 | Endorsements require an existing connection |
| BR-132 | Written recommendations display only after recipient acceptance |
| BR-133 | Profile-view logging honours the viewer's privacy mode |
| BR-134 | Identity-verification badges only via approved partners; failure never blocks core use |

### 19.12 Employer Insights Rules (BR-135..BR-138)

| ID | Rule |
|---|---|
| BR-135 | Salary aggregates displayed only with ≥5 reports for a role/location cell |
| BR-136 | Anonymous reviews hide identity from employer and public, never from Platform Admin/legal |
| BR-137 | Company responses are appended, never edit the original review |
| BR-138 | Interview questions require moderation before public display |

### 19.13 Contests/Certification & Migration Rules (BR-139..BR-140 + MIG-01..08)

| ID | Rule |
|---|---|
| BR-139 | Contest submissions locked at server-authoritative end time; clock skew never extends |
| BR-140 | Certification exam pass requires the configured score in a single attempt (retake policy configurable) |
| MIG-01 | Imported data becomes project-owned; user may edit/delete/replace/export |
| MIG-02 | Migration is one-way and user-initiated; no continuous sync by default |
| MIG-03 | Migration never auto-publishes; imported posts land as drafts |
| MIG-04 | Imported skills are self-reported until natively verified |
| MIG-05 | Connection graphs are never imported; hashed-email mutual-consent discovery only, hashes TTL-bound |
| MIG-06 | Provider tokens server-side, short-lived, revocable; disconnect purges tokens + raw archive |
| MIG-07 | External provider IDs are never primary keys, auth claims, URLs, or analytics keys |
| MIG-08 | Every provider surface is feature-flagged and removable without core schema change |

### 19.14 Skills Graph Rules (BR-141..BR-148)

| ID | Rule |
|---|---|
| BR-141 | Skills taxonomy curated by Platform Admin; no user can create canonical skills |
| BR-142 | Skill relationships are directional: `prerequisite_of`, `subskill_of`, `supersedes` |
| BR-143 | Correlations (`correlates_with`) are bidirectional and computed statistically |
| BR-144 | Every course, challenge, job, and candidate skill tag MUST reference a canonical skill |
| BR-145 | Skill market signals update daily from aggregated data |
| BR-146 | Skill graph traversal depth bounded (max 5 hops) |
| BR-147 | Skill relationships must be acyclic for `prerequisite_of` (validated at write time) |
| BR-148 | Emerging skills require minimum 5 independent signals before taxonomy promotion |

### 19.15 Verification Rules (BR-149..BR-156)

| ID | Rule |
|---|---|
| BR-149 | Credentials are append-only; revocation creates a new record with `revoked_at` |
| BR-150 | Every credential has a public verification URL (no PII exposed) |
| BR-151 | Credential evidence links are immutable once issued |
| BR-152 | Endorsement weights derive from endorser's verified reputation + relationship proximity |
| BR-153 | Anonymous endorsements are not permitted (P-01) |
| BR-154 | Appeal path exists for disputed credentials; SLA ≤7 days |
| BR-155 | Privacy-preserving proofs allow skill verification without revealing full profile |
| BR-156 | Credential issue requires underlying achievement verified by platform activity |

### 19.16 Career Graph Rules (BR-157..BR-163)

| ID | Rule |
|---|---|
| BR-157 | Career outcome tracking requires explicit user opt-in |
| BR-158 | Aggregated career data requires k ≥5 for display |
| BR-159 | Individual career transitions visible only to the user |
| BR-160 | Progression benchmarks by role require ≥20 data points to publish |
| BR-161 | Salary progression tracked separately from base salary |
| BR-162 | Career graph updates do not retroactively alter historical benchmarks |
| BR-163 | Career path recommendations must disclose data sources and confidence intervals |

### 19.17 Reputation Rules (BR-164..BR-168)

| ID | Rule |
|---|---|
| BR-164 | Reputation score is derived, never manually set |
| BR-165 | Reputation is skill-specific |
| BR-166 | Time-decay: signals older than 24 months count less |
| BR-167 | Reputation is private by default; recruiter visibility requires candidate consent or active application |
| BR-168 | Reputation signals are auditable |

### 19.18 Interview Platform Rules (BR-169..BR-176)

| ID | Rule |
|---|---|
| BR-169 | Interview recording requires dual consent |
| BR-170 | Recordings encrypted at rest; retention ≤90 days unless extended |
| BR-171 | AI feedback is advisory; never a hiring decision input without human review |
| BR-172 | AI analysis excludes protected attributes |
| BR-173 | Interview questions are company-scoped; not visible to candidates before assessment |
| BR-174 | Assessment scores are append-only; changes are compensating entries |
| BR-175 | Live coding environment reuses the challenge sandbox |
| BR-176 | Comparison across candidates uses structured rubrics, never free-form scores |

### 19.19 Salary Intelligence Rules (BR-177..BR-183)

| ID | Rule |
|---|---|
| BR-177 | Salary reports require verification: self-reported (0.5) or verified via employment (1.0) |
| BR-178 | Aggregated salary data requires k ≥5 submissions per cell |
| BR-179 | Salary data displayed in minor units + ISO-4217 currency |
| BR-180 | Company-specific salary data shown only if company has ≥3 reports OR opted in |
| BR-181 | Users may withdraw their salary submission at any time |
| BR-182 | Salary intelligence updates quarterly; historical data versioned |
| BR-183 | Equity data (F-98) separately aggregated from salary |

### 19.20 Recommendation Rules (BR-184..BR-188)

| ID | Rule |
|---|---|
| BR-184 | Recommendation factors must be disclosed ("why am I seeing this?") |
| BR-185 | Recommendations never use protected attributes |
| BR-186 | Users can dismiss recommendations; dismissals train the model |
| BR-187 | Recommendations may not include promoted content without explicit "sponsored" label |
| BR-188 | Recommendation engine must be replaceable without breaking downstream features |

### 19.21 Learning Impact Rules (BR-189..BR-193)

| ID | Rule |
|---|---|
| BR-189 | Course outcome correlation requires ≥30 enrolled learners with measurable outcomes |
| BR-190 | Individual learner outcomes are never exposed without consent |
| BR-191 | Course quality scores derived from outcomes visible to instructors, not publicly ranked |
| BR-192 | Learning impact analytics do not create incentives to lower standards |
| BR-193 | Correlation is not causation — all outcome claims labelled as correlational |

### 19.22 Feature-Specific Rules (BR-194..BR-208)

| ID | Rule |
|---|---|
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

### 19.23 Warm Introduction Rules (BR-209..BR-216)

| ID | Rule |
|---|---|
| BR-209 | Introducer consent required for each introduction |
| BR-210 | Max path depth = 4 |
| BR-211 | Max 10 intro requests/week/user |
| BR-212 | Introducer can opt out of intro services |
| BR-213 | Target can block all intro requests |
| BR-214 | Introduction messages separate from cold outreach |
| BR-215 | Paths visible only to requester |
| BR-216 | No path suggestion for blocked users |

### 19.24 Application Feedback Rules (BR-217..BR-224)

| ID | Rule |
|---|---|
| BR-217 | Minimum reason category required on rejection |
| BR-218 | Feedback delivered within 7 days of decision |
| BR-219 | Feedback visible only to candidate |
| BR-220 | Aggregate insights use k ≥10 |
| BR-221 | AI drafts require human review before sending |
| BR-222 | Candidate can request feedback if not provided (30-day window) |
| BR-223 | Negative feedback must include actionable element |
| BR-224 | Feedback templates org-configurable |

### 19.25 Skill Decay Rules (BR-225..BR-232)

| ID | Rule |
|---|---|
| BR-225 | Freshness score computed nightly, immutable per day |
| BR-226 | Decay curves per skill category, admin-configurable |
| BR-227 | Freshness <20 demotes to self-reported |
| BR-228 | Re-verification restores freshness to 100 |
| BR-229 | Self-attestation counts 0.5× |
| BR-230 | Freshness visible to candidate always; recruiter-visible only with consent |
| BR-231 | Market drift alerts opt-in |
| BR-232 | Freshness stored historically (time-series) |

### 19.26 Referral Rules (BR-233..BR-240)

| ID | Rule |
|---|---|
| BR-233 | Max 3 referral requests per 30 days per candidate |
| BR-234 | Referrer consent required per request |
| BR-235 | Referral tag visible to recruiter (priority signal) |
| BR-236 | Referral rewards follow org policy; XP default |
| BR-237 | System verifies referrer's employment |
| BR-238 | No referral request from blocked user |
| BR-239 | Referrer max 20 referrals/quarter |
| BR-240 | Referral attribution tracked 12 months |

### 19.27 Alumni Rules (BR-241..BR-248)

| ID | Rule |
|---|---|
| BR-241 | Affiliation verified (email domain or institutional seat) |
| BR-242 | Alumni discovery respects privacy settings |
| BR-243 | Alumni group default-join, opt-out allowed |
| BR-244 | Alumni job postings must be from verified alumni |
| BR-245 | Alumni mentorship opt-in |
| BR-246 | No cross-institution data leakage |
| BR-247 | Graduated students retain alumni status |
| BR-248 | Alumni networks public or private (institution choice) |

---

### 16.1 Complete Journey Register (J-01..J-28)

| ID | Name | Persona | Terminal |
|---|---|---|---|
| J-01 | Learn → Prove → Showcase | P-A, P-B | Portfolio with verified signals |
| J-02 | Apply → Track → Hire | P-A, P-B | Offer accepted |
| J-03 | Post → Source → Hire | P-C, P-E, P-S | Offer extended |
| J-04 | Org Setup → Team → Launch | P-C, P-E | First hire |
| J-05 | Profile → Network → Referral | P-A, P-B | Referred hire |
| J-06 | AI Career Path: Gap → Plan → Execute | P-B | Gaps addressed |
| J-07 | Creator: Author → Publish → Monetize | P-G | Revenue |
| J-08 | Mentor: Match → Guide → Impact | P-H | Impact measured |
| J-09 | Institution: Cohort → Place → Track | P-I | Placement reported |
| J-10 | Agency: Multi-Org → Pipeline → Bill | P-F | Client invoice |
| J-11 | Extension: Install → Local-First → Sync | P-A | Profile diff applied |
| J-12 | B2B2C Graduation Flywheel | P-I, ML | Independent candidate |
| J-13 | Institutional Media Authoring | P-G, P-K | Course assigned to batch |
| J-14 | Institutional Procurement & Licensing | P-J | Seats provisioned |
| J-15 | Faculty: Teach → Monitor → Intervene | P-K | At-risk students intervened |
| J-16 | Corporate L&D: Mandate → Track → Certify | P-L, P-T | Certification + HRIS sync |
| J-17 | LinkedIn Migration On-ramp | New user | Native account complete |
| J-18 | Creator: Author → Publish → Sell → Payout | P-G | Monthly settlement |
| J-19 | Self-Paced Learner: Discover → Certify | P-M | Path enrolled |
| J-20 | Learner: Path → Courses → Capstone → Cert | P-M | Program certificate |
| J-21 | Contestant: Register → Compete → Rank → Certify | P-Q | Certification badge |
| J-22 | Researcher: Company → Reviews → Compare → Apply | P-O | Apply started |
| J-23 | Author: Post → Engage → Article → Newsletter | P-N | Audience established |
| J-24 | Reviewer: Write → Moderate → Publish → Response | Any verified user | Published review |
| J-25 | Peer Reviewer: Assigned → Rubric Review → Feedback | Student | Grade finalized |
| J-26 | Career Switcher: Assess → Plan → Transition | P-R | Role transition confirmed |
| J-27 | Hiring Manager: Define → Assess → Hire → Track | P-S | Post-hire outcome recorded |
| J-28 | Skills Analyst: Analyze → Recommend → Measure | P-T | Learning program impact reported |

### 16.3 J-26 Career Switcher (Detailed)

```mermaid
flowchart LR
    A[Target role identified] --> B[F-91 Career Readiness]
    B --> C{Skills gap?}
    C -->|Yes| D[F-95 Career Transition Plan]
    D --> E[F-84 suggests learning]
    E --> F[F-07 enroll courses]
    F --> G[F-08 challenges + F-69 assignments]
    G --> H[F-96 Skill Evidence]
    H --> I[F-85 Career Graph comparison]
    I --> J{Ready?}
    J -->|Yes| K[Apply via F-04]
    J -->|No| D
    K --> L[F-88 Interview Platform]
    L --> M[Hired + outcome tracked]
```

---

### 17.1 Complete Workflow Register (WF-01..WF-66)

| ID | Workflow | Terminal |
|---|---|---|
| WF-01 | Candidate Discovery → Application | Application submitted |
| WF-02 | Recruiter Sourcing Pipeline | Shortlist confirmed |
| WF-03 | Course Enrollment & Completion | Certificate + XP |
| WF-04 | Challenge Participation & Scoring | Score recorded |
| WF-05 | Application Review & Decision | Hired / rejected |
| WF-06 | Offer Management & Negotiation | Offer accepted / expired |
| WF-07 | AI Career Assistant Conversation | User-accepted action |
| WF-08 | Content Moderation & Enforcement | Resolution logged |
| WF-09 | Subscription Purchase & Upgrade | Active entitlement |
| WF-10 | Messaging Thread & Response | Message persisted + ack |
| WF-11 | XP Earning & Level Progression | Ledger row + level |
| WF-12 | Onboarding & First-Experience | First meaningful action |
| WF-13 | Reported Content Review | Action logged + appeal window |
| WF-14 | Invitation & Team Growth | Membership active |
| WF-15 | Employer Brand Profile Setup | Profile published + verified |
| WF-16 | Institutional License Purchase | Pool active + invoice reconciled |
| WF-17 | Bulk Student Import | Students provisioned + report |
| WF-18 | Batch Course Assignment | Batch enrolled + seats exact |
| WF-19 | Media Ingestion & Validation | Media validated + ready |
| WF-20 | License Revocation & Seat Reassignment | Seat returned + reassigned |
| WF-21 | Graduation Transition (B2B2C) | Independent profile active |
| WF-22 | Institutional Renewal | Renewal confirmed |
| WF-23 | Purchase Approval | Purchase approved + PO issued |
| WF-24 | Course Publish Review | Approved / rejected with feedback |
| WF-25 | Course Purchase & Enrolment | Enrolled |
| WF-26 | Coupon Redemption | Discount applied |
| WF-27 | Refund Request → Review → Refund/Deny | Refunded / denied |
| WF-28 | Instructor Payout Settlement | Payout paid |
| WF-29 | Quiz Attempt & Grading | Grade recorded |
| WF-30 | Assignment Submit → Grade / Peer Review | Grade finalized |
| WF-31 | Path Enrolment & Progression | Path completed |
| WF-32 | Contest Lifecycle | Results published |
| WF-33 | Certification Exam Attempt | Pass / fail / expired |
| WF-34 | Post Publish → Feed Distribution | Post visible in feed |
| WF-35 | Newsletter Issue Send | Sent / paused |
| WF-36 | Company Review Moderation | Published / removed |
| WF-37 | Salary Report Aggregation | Aggregated |
| WF-38 | Recommendation Request → Give → Accept → Display | Displayed / declined |
| WF-39 | Outreach Credit Send → Reply → Refund | Replied / expired |
| WF-40 | Profile View Logging | Logged per privacy mode |
| WF-41 | LinkedIn Migration Import | Native account complete |
| WF-42 | Skill Gap Assessment → Learning Plan | Learning plan activated |
| WF-43 | Career Readiness Evaluation | Readiness score computed |
| WF-44 | Salary Data Submission → Aggregation | Aggregated |
| WF-45 | Technical Interview Assessment | Assessment completed |
| WF-46 | Interview Recording + AI Feedback | Feedback report generated |
| WF-47 | Skill Evidence Issuance | Credential verified |
| WF-48 | Contribution Verification | Commit impact verified |
| WF-49 | Peer Mentorship Match → Session | Session completed |
| WF-50 | Expert Network Call Request | Call concluded |
| WF-51 | Custom Assessment Creation → Deployment | Assessment live |
| WF-52 | Post-Hire Outcome Tracking | Outcome recorded |
| WF-53 | Certification Exam Attempt | Pass/fail/expired |
| WF-54 | Emerging Skill Detection → Publication | New skill added to taxonomy |
| WF-55 | Warm Introduction Request → Delivery | Intro delivered |
| WF-56 | Application Feedback → Learning Loop | Improvement action |
| WF-57 | Skill Freshness → Re-verification | Freshness restored |
| WF-58 | Referral Request → Hire | Referral outcome |
| WF-59 | Alumni Network Join → Connect | Alumni connection |
| WF-60 | Reputation Signal → Score Update | Score recomputed |
| WF-61 | Recommendation → Acceptance → Learning | Feedback loop |
| WF-62 | Activity Tracking → Discovery | Behavioral signal |
| WF-63 | Interview Prep → Session → Feedback | Prep completed |
| WF-64 | Adaptive Learning → Mastery | Skill mastered |
| WF-65 | PDP Goal → Milestone → Achievement | Goal achieved |
| WF-66 | Internal Mobility Match → Transition | Internal move |

### 17.2 Workflow Integrity Traces (WIT-001..WIT-025)

| WF | Name | Trace | Terminal Exit | Primary Guard |
|---|---|---|---|---|
| WF-01 | Candidate Discovery → Application | WIT-001 | Application submitted + confirmation | Idempotency-Key + draft restore |
| WF-02 | Recruiter Sourcing Pipeline | WIT-002 | Shortlist confirmed + invite sent | Tenant-scoped RLS + optimistic locking |
| WF-03 | Course Enrollment & Completion | WIT-003 | Enrollment completed + certificate + XP | Unique enrollment guard + idempotent XP |
| WF-04 | Challenge Participation & Scoring | WIT-004 | Scored (≥70%) + XP | Sandbox ≤30s + idempotent score |
| WF-05 | Application Review & Decision | WIT-005 | Terminal hired/rejected + event | Mandatory scorecard precondition |
| WF-06 | Offer Management & Negotiation | WIT-006 | Offer accepted or expired | Single active offer constraint |
| WF-07 | AI Career Assistant Conversation | WIT-007 | User-accepted action (or dismissal) | `<user_content>` sanitization + heuristic fallback |
| WF-08 | Content Moderation & Enforcement | WIT-008 | Resolution logged + notice sent | Append-only queue + two-human review on bans |
| WF-09 | Subscription Purchase & Upgrade | WIT-009 | Active entitlement reconciled with Stripe | Webhook signature + idempotent credit |
| WF-10 | Messaging Thread & Response | WIT-010 | Message persisted + delivery ack | clientMessageId dedupe + Realtime RLS |
| WF-11 | XP Earning & Level Progression | WIT-011 | XP ledger row + recomputed level | UNIQUE(user_id, reference_type, reference_id) |
| WF-12 | Onboarding & First-Experience | WIT-012 | First meaningful action complete | Resumable onboarding + email verify retry |
| WF-13 | Reported Content Review | WIT-013 | Admin action logged + appeal window open | Severity SLA escalation + immutable audit |
| WF-14 | Invitation & Team Growth | WIT-014 | Membership active with mapped role | Unique crypto token + 7-day TTL |
| WF-15 | Employer Brand Profile Setup | WIT-015 | Profile published & verified | Domain verification gate |
| WF-16 | Institutional License Purchase | WIT-016 | Pool active + invoice reconciled | Idempotency (PO number + Stripe event.id) |
| WF-17 | Bulk Student Import | WIT-017 | Students provisioned + error report | Validate-then-commit |
| WF-18 | Batch Course Assignment | WIT-018 | Batch enrolled + seats consumed exactly N | Row lock + CHECK used≤total |
| WF-19 | Media Ingestion & Validation | WIT-019 | Media validated + asset ready | Validation states + SSRF allow-list |
| WF-20 | License Revocation & Seat Reassignment | WIT-020 | Seat returned + reassigned exactly once | Row lock + progress retained |
| WF-21 | Graduation Transition (B2B2C) | WIT-021 | Independent profile active | Never auto-convert + transactional |
| WF-22 | Institutional Renewal | WIT-022 | Renewal confirmed or graceful expiry path | Expiry scan job + grace period |
| WF-23 | Purchase Approval | WIT-023 | Purchase approved + PO issued | Configurable chain + RBAC per level |
| WF-24 | Course Publish Review | WIT-024 | Approved / rejected with feedback | Admin review SLA ≤72h + max 3 rejections |
| WF-25 | Course Purchase & Enrolment | WIT-025 | Enrolled | Webhook-owned fulfillment |

---

### 18.1 Complete State Machine Index

| Entity | Terminal States |
|---|---|
| Application | hired, rejected, withdrawn, stale_withdrawn, candidate_unresponsive |
| Job | closed, archived |
| Offer | hired, closed |
| Enrollment | completed, dropped, expired |
| Organization | active, archived |
| Interview | completed, cancelled |
| Mentor Relationship | completed, cancelled |
| Certificate | verified, revoked, expired |
| Moderation | approved, rejected |
| Challenge Submission | passed, failed, error |
| Background Job | succeeded, dead |
| License/Seat | expired, revoked, returned |
| Managed Learner | independent, archived |
| Media Asset | ready, failed, archived |
| Purchase Request | purchased, cancelled |
| Course (authoring) | published, archived, unpublished |
| Course Version | current, superseded |
| Quiz Attempt | graded |
| Assignment | graded, returned |
| Peer Review | completed |
| Learning Path Enrollment | completed, dropped |
| Course Order | enrolled, cancelled, refunded |
| Coupon | exhausted, expired, revoked |
| Payout | paid, failed |
| Company Review | published, removed |
| Salary Report | aggregated |
| Interview Question | published, rejected |
| Contest | results_published, archived |
| Certification Attempt | passed, failed, expired |
| Post | deleted, hidden_by_moderation |
| Comment | deleted, removed_by_moderation |
| Newsletter Issue | sent, failed |
| Recommendation | displayed, declined, withdrawn |
| Outreach Message | replied, expired |
| Group Membership | left, removed |
| Event | completed, cancelled |
| Migration Job | completed, failed, cancelled |
| Instructor | active, retired |
| Skill (F-84) | Merged |
| Credential (F-96) | revoked, expired |
| Interview Assessment (F-88) | reviewed, cancelled, no_show |
| Career Readiness (F-91) | completed, abandoned |
| Mentorship Session (F-90) | rated, declined, cancelled |
| Certification Attempt (F-115) | certified |
| Skill Freshness (F-123) | demoted |

### 18.2 Canonical State Machines

#### Application

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> submitted
    submitted --> under_review
    submitted --> withdrawn
    submitted --> archived
    under_review --> shortlisted
    under_review --> rejected
    under_review --> archived
    shortlisted --> interview
    shortlisted --> rejected
    shortlisted --> archived
    interview --> assessment
    interview --> offer
    interview --> rejected
    assessment --> offer
    assessment --> rejected
    offer --> hired
    offer --> rejected
    hired --> [*]
    rejected --> [*]
    withdrawn --> [*]
    archived --> [*]
```

#### Job

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> pending_approval
    pending_approval --> approved
    pending_approval --> rejected_by_moderation
    rejected_by_moderation --> draft: revise
    approved --> scheduled
    approved --> published
    scheduled --> published
    published --> paused
    paused --> published
    published --> closed
    closed --> archived
    archived --> [*]
```

#### Credential (F-96)

```mermaid
stateDiagram-v2
    [*] --> issued
    issued --> verified
    issued --> disputed
    disputed --> upheld
    disputed --> revoked
    verified --> expired
    verified --> revoked
    upheld --> issued
    revoked --> [*]
    expired --> [*]
```

#### Certification Attempt (F-115)

```mermaid
stateDiagram-v2
    [*] --> registered
    registered --> in_progress
    in_progress --> submitted
    submitted --> graded
    graded --> passed
    graded --> failed
    passed --> certified
    failed --> cooldown
    cooldown --> registered: 7 days
    certified --> [*]
```

#### Interview Assessment (F-88)

```mermaid
stateDiagram-v2
    [*] --> scheduled
    scheduled --> in_progress
    in_progress --> completed
    in_progress --> cancelled
    in_progress --> no_show
    completed --> scored
    scored --> reviewed
    reviewed --> [*]
    cancelled --> [*]
    no_show --> [*]
```

#### Course Order

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> paid
    pending --> cancelled
    paid --> enrolled
    enrolled --> completed
    enrolled --> refund_requested
    refund_requested --> refund_approved
    refund_requested --> refund_denied
    refund_approved --> refunded
    refund_denied --> enrolled
    refunded --> [*]
    cancelled --> [*]
    completed --> [*]
```

#### Contest

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> scheduled
    scheduled --> registration_open
    registration_open --> active
    active --> ended
    ended --> results_published
    results_published --> archived
    archived --> [*]
```

---

## Canonical Business Rules — Full Source Corpus

### 19.2 Job Rules (BR-10..BR-14)

| ID | Rule |
|---|---|
| BR-10 | Job publish-readiness rule server-validated |
| BR-11 | Job lifecycle: draft→pending_approval→approved→scheduled→published→paused→closed→archived |
| BR-12 | Recruiters update/publish/archive only own-company jobs |
| BR-13 | Hidden jobs are client-preference; reversible |
| BR-14 | Saved-search digest runs as service-owned/audited scheduler |

### 19.3 Application Rules (BR-15..BR-20)

| ID | Rule |
|---|---|
| BR-15 | No duplicate ACTIVE application per user per job (partial UNIQUE + 90-day cooldown post-terminal) |
| BR-16 | No applications to closed/unavailable jobs |
| BR-17 | Application lifecycle server-owned append-only |
| BR-18 | Application drafts autosave 30s; recoverable; versions retained |
| BR-19 | Candidate notes/scorecards recruiter-scoped; never candidate-visible |
| BR-20 | Status-event history append-only |

### 19.4 Learning & Challenge Rules (BR-21..BR-25)

| ID | Rule |
|---|---|
| BR-21 | Lesson completion idempotent |
| BR-22 | Lesson prerequisites gate progression |
| BR-23 | Course completion → certificate + XP bonus |
| BR-24 | Challenge language allowlist; execution limits per TD-05 |
| BR-25 | XP idempotent UNIQUE(user_id, reference_type, reference_id); daily cap **200 XP/day** |

### 19.5 Data Governance Rules (BR-26..BR-35)

| ID | Rule |
|---|---|
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

### 19.6 Expanded Rules (BR-036..BR-071)

| ID | Rule |
|---|---|
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

### 19.7 Institutional Rules (BR-072..BR-082)

| ID | Rule |
|---|---|
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

### 19.8 Media Rules (BR-083..BR-090)

| ID | Rule |
|---|---|
| BR-083 | External media validated before publication; invalid/private/embed-blocked rejected |
| BR-084 | Provider embedding restrictions never bypassed; protected content never downloaded |
| BR-085 | Provider capabilities determine available playback/completion settings |
| BR-086 | Broken external provider isolated to affected content item; course remains functional |
| BR-087 | Platform stores learner progress even for externally hosted playback where trackable |
| BR-088 | Unsupported providers produce explicit errors, never silent broken embeds |
| BR-089 | Authors attest right to use external content before publication |
| BR-090 | Org provider allowlists enforced server-side |

### 19.9 Learning Marketplace Rules (BR-091..BR-115)

| ID | Rule |
|---|---|
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

### 19.10 Social/Content Rules (BR-116..BR-128)

| ID | Rule |
|---|---|
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

### 19.11 Outreach, Recommendations, Privacy (BR-129..BR-134)

| ID | Rule |
|---|---|
| BR-129 | Outreach credit consumed on send to a non-connection; refunded on reply within 7 days |
| BR-130 | Outreach weekly caps: 20 (Pro), 50 (Team), custom (Enterprise) |
| BR-131 | Endorsements require an existing connection |
| BR-132 | Written recommendations display only after recipient acceptance |
| BR-133 | Profile-view logging honours the viewer's privacy mode |
| BR-134 | Identity-verification badges only via approved partners; failure never blocks core use |

### 19.12 Employer Insights Rules (BR-135..BR-138)

| ID | Rule |
|---|---|
| BR-135 | Salary aggregates displayed only with ≥5 reports for a role/location cell |
| BR-136 | Anonymous reviews hide identity from employer and public, never from Platform Admin/legal |
| BR-137 | Company responses are appended, never edit the original review |
| BR-138 | Interview questions require moderation before public display |

### 19.13 Contests/Certification & Migration Rules (BR-139..BR-140 + MIG-01..08)

| ID | Rule |
|---|---|
| BR-139 | Contest submissions locked at server-authoritative end time; clock skew never extends |
| BR-140 | Certification exam pass requires the configured score in a single attempt (retake policy configurable) |
| MIG-01 | Imported data becomes project-owned; user may edit/delete/replace/export |
| MIG-02 | Migration is one-way and user-initiated; no continuous sync by default |
| MIG-03 | Migration never auto-publishes; imported posts land as drafts |
| MIG-04 | Imported skills are self-reported until natively verified |
| MIG-05 | Connection graphs are never imported; hashed-email mutual-consent discovery only, hashes TTL-bound |
| MIG-06 | Provider tokens server-side, short-lived, revocable; disconnect purges tokens + raw archive |
| MIG-07 | External provider IDs are never primary keys, auth claims, URLs, or analytics keys |
| MIG-08 | Every provider surface is feature-flagged and removable without core schema change |

### 19.14 Skills Graph Rules (BR-141..BR-148)

| ID | Rule |
|---|---|
| BR-141 | Skills taxonomy curated by Platform Admin; no user can create canonical skills |
| BR-142 | Skill relationships are directional: `prerequisite_of`, `subskill_of`, `supersedes` |
| BR-143 | Correlations (`correlates_with`) are bidirectional and computed statistically |
| BR-144 | Every course, challenge, job, and candidate skill tag MUST reference a canonical skill |
| BR-145 | Skill market signals update daily from aggregated data |
| BR-146 | Skill graph traversal depth bounded (max 5 hops) |
| BR-147 | Skill relationships must be acyclic for `prerequisite_of` (validated at write time) |
| BR-148 | Emerging skills require minimum 5 independent signals before taxonomy promotion |

### 19.15 Verification Rules (BR-149..BR-156)

| ID | Rule |
|---|---|
| BR-149 | Credentials are append-only; revocation creates a new record with `revoked_at` |
| BR-150 | Every credential has a public verification URL (no PII exposed) |
| BR-151 | Credential evidence links are immutable once issued |
| BR-152 | Endorsement weights derive from endorser's verified reputation + relationship proximity |
| BR-153 | Anonymous endorsements are not permitted (P-01) |
| BR-154 | Appeal path exists for disputed credentials; SLA ≤7 days |
| BR-155 | Privacy-preserving proofs allow skill verification without revealing full profile |
| BR-156 | Credential issue requires underlying achievement verified by platform activity |

### 19.16 Career Graph Rules (BR-157..BR-163)

| ID | Rule |
|---|---|
| BR-157 | Career outcome tracking requires explicit user opt-in |
| BR-158 | Aggregated career data requires k ≥5 for display |
| BR-159 | Individual career transitions visible only to the user |
| BR-160 | Progression benchmarks by role require ≥20 data points to publish |
| BR-161 | Salary progression tracked separately from base salary |
| BR-162 | Career graph updates do not retroactively alter historical benchmarks |
| BR-163 | Career path recommendations must disclose data sources and confidence intervals |

### 19.17 Reputation Rules (BR-164..BR-168)

| ID | Rule |
|---|---|
| BR-164 | Reputation score is derived, never manually set |
| BR-165 | Reputation is skill-specific |
| BR-166 | Time-decay: signals older than 24 months count less |
| BR-167 | Reputation is private by default; recruiter visibility requires candidate consent or active application |
| BR-168 | Reputation signals are auditable |

### 19.18 Interview Platform Rules (BR-169..BR-176)

| ID | Rule |
|---|---|
| BR-169 | Interview recording requires dual consent |
| BR-170 | Recordings encrypted at rest; retention ≤90 days unless extended |
| BR-171 | AI feedback is advisory; never a hiring decision input without human review |
| BR-172 | AI analysis excludes protected attributes |
| BR-173 | Interview questions are company-scoped; not visible to candidates before assessment |
| BR-174 | Assessment scores are append-only; changes are compensating entries |
| BR-175 | Live coding environment reuses the challenge sandbox |
| BR-176 | Comparison across candidates uses structured rubrics, never free-form scores |

### 19.19 Salary Intelligence Rules (BR-177..BR-183)

| ID | Rule |
|---|---|
| BR-177 | Salary reports require verification: self-reported (0.5) or verified via employment (1.0) |
| BR-178 | Aggregated salary data requires k ≥5 submissions per cell |
| BR-179 | Salary data displayed in minor units + ISO-4217 currency |
| BR-180 | Company-specific salary data shown only if company has ≥3 reports OR opted in |
| BR-181 | Users may withdraw their salary submission at any time |
| BR-182 | Salary intelligence updates quarterly; historical data versioned |
| BR-183 | Equity data (F-98) separately aggregated from salary |

### 19.20 Recommendation Rules (BR-184..BR-188)

| ID | Rule |
|---|---|
| BR-184 | Recommendation factors must be disclosed ("why am I seeing this?") |
| BR-185 | Recommendations never use protected attributes |
| BR-186 | Users can dismiss recommendations; dismissals train the model |
| BR-187 | Recommendations may not include promoted content without explicit "sponsored" label |
| BR-188 | Recommendation engine must be replaceable without breaking downstream features |

### 19.21 Learning Impact Rules (BR-189..BR-193)

| ID | Rule |
|---|---|
| BR-189 | Course outcome correlation requires ≥30 enrolled learners with measurable outcomes |
| BR-190 | Individual learner outcomes are never exposed without consent |
| BR-191 | Course quality scores derived from outcomes visible to instructors, not publicly ranked |
| BR-192 | Learning impact analytics do not create incentives to lower standards |
| BR-193 | Correlation is not causation — all outcome claims labelled as correlational |

### 19.22 Feature-Specific Rules (BR-194..BR-208)

| ID | Rule |
|---|---|
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

### 19.23 Warm Introduction Rules (BR-209..BR-216)

| ID | Rule |
|---|---|
| BR-209 | Introducer consent required for each introduction |
| BR-210 | Max path depth = 4 |
| BR-211 | Max 10 intro requests/week/user |
| BR-212 | Introducer can opt out of intro services |
| BR-213 | Target can block all intro requests |
| BR-214 | Introduction messages separate from cold outreach |
| BR-215 | Paths visible only to requester |
| BR-216 | No path suggestion for blocked users |

### 19.24 Application Feedback Rules (BR-217..BR-224)

| ID | Rule |
|---|---|
| BR-217 | Minimum reason category required on rejection |
| BR-218 | Feedback delivered within 7 days of decision |
| BR-219 | Feedback visible only to candidate |
| BR-220 | Aggregate insights use k ≥10 |
| BR-221 | AI drafts require human review before sending |
| BR-222 | Candidate can request feedback if not provided (30-day window) |
| BR-223 | Negative feedback must include actionable element |
| BR-224 | Feedback templates org-configurable |

### 19.25 Skill Decay Rules (BR-225..BR-232)

| ID | Rule |
|---|---|
| BR-225 | Freshness score computed nightly, immutable per day |
| BR-226 | Decay curves per skill category, admin-configurable |
| BR-227 | Freshness <20 demotes to self-reported |
| BR-228 | Re-verification restores freshness to 100 |
| BR-229 | Self-attestation counts 0.5× |
| BR-230 | Freshness visible to candidate always; recruiter-visible only with consent |
| BR-231 | Market drift alerts opt-in |
| BR-232 | Freshness stored historically (time-series) |

### 19.26 Referral Rules (BR-233..BR-240)

| ID | Rule |
|---|---|
| BR-233 | Max 3 referral requests per 30 days per candidate |
| BR-234 | Referrer consent required per request |
| BR-235 | Referral tag visible to recruiter (priority signal) |
| BR-236 | Referral rewards follow org policy; XP default |
| BR-237 | System verifies referrer's employment |
| BR-238 | No referral request from blocked user |
| BR-239 | Referrer max 20 referrals/quarter |
| BR-240 | Referral attribution tracked 12 months |

### 19.27 Alumni Rules (BR-241..BR-248)

| ID | Rule |
|---|---|
| BR-241 | Affiliation verified (email domain or institutional seat) |
| BR-242 | Alumni discovery respects privacy settings |
| BR-243 | Alumni group default-join, opt-out allowed |
| BR-244 | Alumni job postings must be from verified alumni |
| BR-245 | Alumni mentorship opt-in |
| BR-246 | No cross-institution data leakage |
| BR-247 | Graduated students retain alumni status |
| BR-248 | Alumni networks public or private (institution choice) |

---

# PART VI — TECHNICAL ARCHITECTURE

---

## 11. UX/UI, Design System & Micro-Interaction Architecture

### 11.1 UX principles

- Mobile-first, PWA-native composition; do not merely shrink a desktop UI.
- Progressive disclosure and consistent interaction patterns.
- Honest loading, guided empty states, actionable errors, and recoverable workflows.
- Trust through transparency: expose why something happened and what the user can do next.
- Keyboard-first support and accessible touch targets.
- Dark mode is first-class.
- Motion communicates state and respects `prefers-reduced-motion`.

### 11.2 Canonical UI states

```text
IDLE · HOVER · FOCUS · PRESSED · LOADING · SUCCESS · ERROR · EMPTY · DISABLED · VALIDATION · PARTIAL · OFFLINE · SYNCING · PERMISSION_DENIED · RESTRICTED
```

Domain lifecycle states include pending, processing, verified, rejected, expired, revoked, disputed, archived, and deleted/anonymized.

### 11.3 Interaction contract

```text
USER ACTION → SYSTEM STATE CHANGE → IMMEDIATE FEEDBACK → RESULT → NEXT BEST ACTION
```

Important actions such as saving, uploading, evidence submission, assessment autosave/submission, AI streaming, applications, matching explanations, messaging, notifications, offline sync, destructive actions, and errors must specify feedback, reversibility, and recovery.

### 11.4 Design system

The Aura/TalentSphere design system is the sole source for color, spacing, typography, elevation, radius, motion, focus, validation, and component states. Avoid raw visual values in feature code. Components expose accessible semantics and predictable state machines.

### 11.5 Component behavior

Buttons, inputs, forms, cards, data tables, dialogs, drawers, tabs, search, filters, pagination, tooltips, toasts, uploaders, editors, timers, progress indicators, and media controls must have explicit state and accessibility behavior. Critical information cannot be conveyed by color or animation alone.

---

## 12. Canonical Application Architecture

### 12.1 Initial architecture

Use a **modular monolith** with explicit domain boundaries and extraction points. Avoid premature microservices, Kubernetes, service meshes, or large event platforms until measured requirements justify them.

### 12.2 Canonical stack

| Layer | Decision |
|---|---|
| Frontend | React + TypeScript + Vite PWA |
| Routing | React Router |
| Server state | TanStack Query |
| UI | Aura/TalentSphere design system |
| Backend | TypeScript modular monolith |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth or replaceable equivalent |
| Storage | Supabase Storage initially |
| Short-lived serverless | Supabase Edge Functions or equivalent |
| Heavy async | Queue + dedicated worker |
| Search | PostgreSQL FTS/trigram initially |
| Realtime | Selective, never correctness-critical |
| Hosting | Managed infrastructure selected for cost/reliability/region |

### 12.3 Logical architecture

```text
PWA UI
→ Feature/Application Layer
→ Domain Modules
→ Policy / Authorization / Privacy / AI Governance
→ Repositories / Transactions
→ PostgreSQL / Storage / Queues / Events
→ External Providers / AI Adapters
```

### 12.4 Domain boundaries

Identity & Access; Profiles; Skills & Ontology; Evidence & Verification; Learning; Assessments; Credentials; Jobs & Opportunities; Applications & Hiring; Interviews; Matching; Recommendations; Networking; Messaging; Organizations; Institutions; Reputation; Notifications; Billing & Entitlements; Analytics; Moderation/Trust & Safety; AI; Integrations; Administration; Audit.

### 12.5 Data and change ownership

Each domain owns its invariants and application contracts. Cross-domain behavior uses explicit APIs/events rather than direct table coupling. Database constraints remain authoritative for data integrity.

### 20.1 System Context

```mermaid
flowchart TB
    subgraph Users
        C[Candidates]
        R[Recruiters]
        I[Institution Admins]
        F[Faculty]
        A[Admins]
    end
    
    subgraph Frontend
        WEB[React/Vite Web App]
        EXT[Chrome Extension]
        PWA[PWA]
    end
    
    subgraph Edge
        MW[Edge Middleware]
        SA[HTTP application APIs]
        EH[Edge Handlers]
    end
    
    subgraph Core
        DOM[Domain Modules]
        OSL[Web OS Layer]
        AI[AI Router]
        Q[Queue]
    end
    
    subgraph Data
        AUTH[Supabase Auth]
        PG[(PostgreSQL)]
        RLS[RLS Policies]
        RT[Realtime]
        ST[Storage]
    end
    
    subgraph External
        STRIPE[Stripe]
        EMAIL[Resend]
        LLM[Gemini/Claude]
        MEDIA[Mux/CF Stream]
        LI[LinkedIn optional]
    end
    
    C & R & I & F & A --> WEB
    C --> EXT
    C --> PWA
    WEB --> MW
    EXT --> MW
    MW --> SA
    MW --> EH
    SA --> DOM
    DOM --> OSL
    DOM --> AI
    DOM --> Q
    DOM --> PG
    PG --- RLS
    MW --> AUTH
    DOM --> RT
    DOM --> ST
    EH --> STRIPE
    EH --> EMAIL
    AI --> LLM
    Q --> MEDIA
    DOM -.-> LI
```

### 20.2 Logical Architecture

| Layer | Contents | Technology |
|---|---|---|
| Presentation | Web app, extension, PWA, admin | React + TypeScript + Vite PWA, React 18+, Tailwind, Radix |
| Application | HTTP application APIs, route handlers, use cases | TypeScript strict |
| Domain | Aggregates, entities, VOs, domain events, business rules | Pure TS |
| Infrastructure | Repositories, adapters, integrations | Supabase, Stripe, providers |
| Data | PostgreSQL with RLS, storage buckets, realtime channels | Supabase |
| External | AI providers, payment, media, email, IDV | Integration Layer |

### 20.3 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant S as Supabase Auth
    participant MW as Edge Middleware
    participant D as Database
    
    U->>W: Credentials / OAuth
    W->>S: Authenticate
    S-->>W: JWT + refresh token
    W->>MW: Request with JWT
    MW->>MW: Verify + normalize role claims
    MW->>D: Set local app.user_id
    D->>D: Apply RLS policies
    D-->>W: Authorized data
    W-->>U: Rendered page
```

### 20.4 AI Safety Flow

```mermaid
flowchart TD
    A[User Input] --> B[PII Detection]
    B --> C[Redaction]
    C --> D[Prompt Construction + canary + user_content fencing]
    D --> E[AI Provider]
    E --> F[Output Validation Zod]
    F --> G{Canary leaked?}
    G -->|Yes| H[Drop response + alert + flag account]
    G -->|No| I{Confidence}
    I -->|<0.5| J[Suppress]
    I -->|0.5-0.7| K[Show with disclaimer]
    I -->|≥0.7| L[Show with evidence]
    K --> M{Human review required?}
    L --> M
    M -->|Yes| N[Human Gate]
    M -->|No| O[User sees draft]
    N --> O
```

---

### 21.1 Bounded Contexts (7 + Shared Kernel)

| Context | Contents | Aggregates |
|---|---|---|
| `identity` | Auth, profiles, orgs, tenancy, managed learners, instructor approval | User, Profile, Organization, Membership |
| `marketplace` | Jobs, requisitions, applications, offers, interviews, employer insights | Job, Application, Offer, CompanyReview |
| `learning` | Courses, lessons/content items, media, enrolments, progress, quizzes, assignments, paths, certificates, XP/gamification, contests, certifications | Course, Enrolment, Assessment, XPLedger, Contest |
| `community` | Connections, follows, posts/articles/newsletters, comments/reactions/reposts, groups, events, messaging, notifications | Thread, Post, Community |
| `billing` | Subscriptions, entitlements, course commerce, coupons, orders, refunds, licence pools, procurement, payouts | Subscription, Order, LicencePool, Payout |
| `governance` | Admin, moderation, trust, audit, flags, verification | Report, ModerationAction, FeatureFlag |
| `analytics` | Event tracking, KPIs, dashboards, experimentation | AnalyticsEvent, KPISnapshot |
| **Shared kernel** | Event backbone, UOM, TIG, automation, agents, healing, liquidity, DQ, health, media engine, integrations, AI service, UI kit, types, utilities | DomainEvent, MediaSource, ProviderAdapter |

### 21.2 Domain Boundary Rules

- Domain layer pure TS (ARCH-013)
- Application layer orchestrates; HTTP application APIs are thin adapters (ARCH-014)
- Infrastructure implements domain ports (ARCH-015)
- Cross-feature imports via `index.ts` barrels only (ARCH-016)
- Atomic promotion rule (ARCH-017)
- Cross-context via events or application-service interfaces (ARCH-018)
- Zero circular dependencies (ARCH-019)
- Routes are thin composition (ARCH-020)

### 21.3 ADRs (Locked at 13)

| ID | Decision |
|---|---|
| ADR-001 | Supabase Auth sole session authority |
| ADR-002 | Modular monolith (React/Vite + Supabase + managed hosting provider) |
| ADR-003 | 50 canonical tables + RLS deny-by-default |
| ADR-004 | Supabase Realtime messaging authority |
| ADR-005 | Stripe webhook idempotency + demo stubs |
| ADR-006 | Chrome extension local-first |
| ADR-007 | Provider-agnostic media |
| ADR-008 | Institutional tenancy |
| ADR-009 | Dual-queue boundary |
| ADR-010 | RLS policy template generator |
| ADR-011 | Media model is authority for lesson content |
| ADR-012 | DDD + Feature-Based + Atomic Design combination |
| ADR-013 | Cross-domain via events or application-service interfaces only |

---

### 22.1 Aura Design System

**Zero raw hex values.** Tokens exposed as CSS variables + TS constants from one generated source.

**Light theme:** `--aura-bg-base` #FFFFFF · `--aura-bg-raised` #F8FAFC · `--aura-bg-sunken` #F1F5F9 · `--aura-text-primary` #0F172A · `--aura-text-secondary` #475569 · `--aura-brand-600` #2563EB · `--aura-success-500` #16A34A · `--aura-warning-500` #F59E0B · `--aura-danger-500` #DC2626 · `--aura-border` #E2E8F0 · `--aura-border-focus` #2563EB.

**Dark theme:** `--aura-bg-base` #0F172A · `--aura-bg-raised` #1E293B · `--aura-bg-sunken` #334155 · `--aura-text-primary` #F8FAFC · `--aura-brand-600` #3B82F6 · `--aura-border` #334155.

**Spacing:** 4px base (0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192px).
**Radius:** 6/10/16/50%.
**Motion:** 120/200/320ms + reduced-motion.
**Typography:** xs..4xl ramp.
**Z-index:** dropdown 30, modal 40, toast 50, palette 60.

### 22.2 Atomic Design Mapping

| Level | Contents |
|---|---|
| **Atoms (14+)** | Button, Input, Badge, Icon, Avatar, Skeleton, Spinner, Text, Divider, SourceStatusBadge, Checkbox, Radio, Toggle, Tag |
| **Molecules (12+)** | SearchField, FormField, Pagination, Toast, Dropdown, Tabs, Modal, EmptyState, SelectField, FileInput, DateRangePicker, ConfirmationDialog |
| **Organisms (20+)** | DataTable, NavigationSidebar, TopBar, CommandPalette, NotificationBell, FileUploader, CourseCard, JobCard, ProfileCard, QuizPanel, MediaSourceForm, LicenseUtilizationChart, SixStateRenderer, UnifiedPlayer, ObjectPreviewCard, PostComposer, PostCard, CommentThread, ReviewSummary, CurriculumTree, LeaderboardTable |
| **Templates (8)** | DashboardLayout, AuthLayout, SettingsLayout, AdminLayout, InstitutionLayout, LearningLayout, CourseBuilderLayout, FeedLayout |
| **Pages** | Live inside features (`domains/<ctx>/features/<f>/pages/`) |

**Promotion rule:** Components used by only one feature stay in that feature; promotion to `shared/ui/` happens on second use, never preemptively.

### 22.3 Route Registry

**Core Routes:**

| Route | Access | Page |
|---|---|---|
| `/` | Public | Landing |
| `/login`, `/register` | Public | Auth |
| `/verify/:hash` | Public | Credential verification |
| `/dashboard` | Auth | Role-adaptive |
| `/profile`, `/profile/[userId]` | Auth (RLS) | Profile |
| `/jobs`, `/jobs/[jobId]` | Auth | Jobs |
| `/jobs/new` | Recruiter+ | Post job |
| `/applications`, `/applications/[applicationId]` | Auth (RLS) | Applications |
| `/courses`, `/courses/[id]`, `/courses/[id]/learn` | Auth | Courses |
| `/challenges`, `/challenges/[id]`, `/challenges/[id]/attempt` | Auth | Challenges |
| `/messages`, `/notifications`, `/leaderboard` | Auth | Communication |
| `/settings`, `/settings/billing` | Auth / Org Admin+ | Settings |
| `/admin/*` | Platform Admin | Admin |

**Career Intelligence Routes:** `/career/readiness`, `/career/transition`, `/career/benchmarks`, `/salaries`, `/salaries/[role]`, `/companies/[slug]/salaries`

**Verification Routes:** `/verify/:hash`, `/credentials`, `/credentials/export`

**Interview Routes:** `/interviews/[id]`, `/interviews/[id]/results`, `/assessments/[id]`

**Recruiter Routes:** `/recruiter/search`, `/recruiter/pools`, `/recruiter/analytics`, `/hm/dashboard`

**Learning Routes:** `/paths`, `/paths/[id]`, `/teach/*`, `/cart`, `/checkout`, `/orders`

**Social Routes:** `/feed`, `/posts/[id]`, `/articles/[id]`, `/communities`, `/events`

**Institutional Routes:** `/institution/*` (13 paths)

**Admin Extension Routes:** `/admin/courses`, `/admin/instructors`, `/admin/reviews`, `/admin/orders`, `/admin/revenue`, `/admin/certificates`, `/admin/contests`

**OS Routes (Tier-gated):** `/workspace`, `/command`, `/automations`, `/agents`

**Intro/Referral Routes:** `/intro/request`, `/intro/inbox`, `/referrals`, `/referrals/request`

### 22.4 Repository Layout

```
src/
├── app/                      # React/Vite router: thin shell only
│   ├── (auth)/ (platform)/ api/v1/ api/health/
├── domains/
│   ├── identity/ marketplace/ learning/ community/ billing/ governance/ analytics/
│   │   ├── domain/{entities,value-objects,aggregates,events,rules,repositories}
│   │   ├── application/{use-cases,services}
│   │   ├── infrastructure/{repositories,adapters}
│   │   └── features/<feature>/{index.ts,pages,components,hooks,services,api,models,validators,tests}
├── shared/
│   ├── platform/{events,object-model,graph,automation,agents,healing,liquidity,data-quality,health}
│   ├── infrastructure/{supabase,media,integrations/{linkedin,stripe,resend,oauth,hris},ai,jobs,heavy-jobs,email}
│   ├── ui/{tokens,atoms,molecules,organisms,templates,patterns,index.ts}
│   ├── types/  utilities/
└── config/{routes.ts,roles.ts,env.ts,feature-flags.ts}
```

### 22.5 UX State Matrix

**Six-State Standard:** Every data surface implements:

| State | Requirement |
|---|---|
| Idle | Default pre-fetch state |
| Loading | Skeleton ≤400ms; `aria-busy="true"` |
| Populated | Data rendered |
| Empty | Actionable CTA; never blank |
| Error | Friendly message + retry + correlation ID; `role="alert"` |
| Stale | Cached banner + refresh option |

**Surface Matrix:**

| ID | Surface | Required States |
|---|---|---|
| UXC-001 | Public auth | loading, error, validation, success, degraded |
| UXC-002 | Dashboard | loading, empty, error, partial, degraded |
| UXC-003 | Profile | loading, empty, error, permission-denied, success |
| UXC-004 | List/search | loading, empty, error, partial, offline |
| UXC-005 | Detail | loading, not-found, error, permission-denied, deleted |
| UXC-006 | Long-running | loading, running, partial, timeout, error, success, cancelled |
| UXC-007 | Realtime | loading, empty, error, degraded, reconnecting, offline |
| UXC-008 | Notifications | loading, empty, error, unread/read, degraded |
| UXC-009 | Settings/billing | loading, error, saving, saved, payment-pending, degraded |
| UXC-010 | Admin | loading, empty, error, permission-denied, destructive-confirm, audit-success |
| UXC-011 | OS routes | loading, empty, error, degraded, permission-scoped, success |
| UXC-012 | Destructive actions | confirm, in-progress, success, failure, undo |
| UXC-013 | Bulk import | upload, parsing, validating, preview, committing, partial, failed |
| UXC-014 | Course builder | autosaving, saved, save-failed, empty, media-validating, media-invalid, publish-blocked |
| UXC-015 | License management | loading, empty, assigned, low-availability, expiring-soon, expired, grace-period |
| UXC-016 | Quiz attempt | in-progress, time-warning, submitted, graded, timed-out |
| UXC-017 | Checkout | cart, processing, paid, failed, refunded |
| UXC-018 | Contest | pre-start, live, ended, results |
| UXC-019 | Migration wizard | upload, parsing, preview, conflicts, committing, partial, failed |
| UXC-020 | Review composition | draft, submitting, pending-moderation, published, removed |
| UXC-021 | Skills graph | loading, empty, error, populated, stale |
| UXC-022 | Credential | loading, empty, error, verified, revoked, expired |
| UXC-023 | Career readiness | loading, computing, ready, insufficient-data, error |
| UXC-024 | Interview session | scheduled, joining, in-progress, reconnecting, completed, cancelled, no-show |
| UXC-025 | Salary insight | loading, insufficient-data, populated, error |
| UXC-026 | Certification attempt | registered, in-progress, time-warning, submitted, passed, failed, expired |
| UXC-027 | Recruiter search | loading, empty, error, populated, rate-limited |
| UXC-028 | Salary report submission | idle, validating, submitted, rejected, error |

---

### 23.1 API Architecture

**Two-Tier Access:**

| Channel | Pattern | AuthZ Boundary | Guardrails |
|---|---|---|---|
| Direct PostgREST | `/rest/v1/{table}` | RLS (JWT) | Max page 100; embedding depth ≤3 |
| HTTP application APIs/APIs | `/api/v1/{service}/{op}` | Session + CSRF + role | Zod validation; rate limits; idempotency |

**Deprecation Policy:** ≥6-month lifecycle with Sunset + Deprecation headers. Additive changes within a major version require no bump.

### 23.2 Response Envelope

```json
{
  "success": true,
  "data": { },
  "meta": { "cursor": "…", "has_more": true, "limit": 20 }
}
```

### 23.3 Interface Contracts (CON-001..CON-016)

| ID | Contract |
|---|---|
| CON-001 | Error contract: RFC 9457 |
| CON-002 | API versioning: path-versioned; additive within major |
| CON-003 | Pagination: cursor-based; limit default 20, max 100 |
| CON-004 | Filtering & sorting: allow-listed; sort keys indexed |
| CON-005 | Idempotency: `Idempotency-Key` on non-idempotent writes; 24h replay |
| CON-006 | Rate limiting: per-class budgets; 429 + Retry-After |
| CON-007 | Webhooks: HMAC signed; timestamp + replay window |
| CON-008 | Retry / timeout: 10s default (AI 30s); exponential backoff |
| CON-009 | Time: UTC; ISO-8601 with offset |
| CON-010 | Money: integer minor units + ISO-4217 |
| CON-011 | Files / uploads: allow-list + MIME sniff + size caps + AV |
| CON-012 | Concurrency: optimistic locking; stale write → 409 |
| CON-013 | Migrations: forward-only in production |
| CON-014 | Caching: only derived reads; keys include tenant + actor |
| CON-015 | Data lifecycle: retention windows; erasure propagates |
| CON-016 | Logging / telemetry: structured JSON; redacted |

### 23.4 Service Contracts (SCI-01..SCI-54)

*(See §25.2 for the complete service contract register.)*

---

---

## 13. API, Event, Integration, Queue, Realtime & Media Contracts

All external and cross-domain interfaces are contract-first. Public API behavior must not accidentally mirror internal tables. Every mutation specifies authorization, validation, idempotency, rate limits, errors, audit, and observability.

### 25.1 Complete Service Contract Register (SCI-01..SCI-54)

| ID | Operation | Actor | Idempotency |
|---|---|---|---|
| SCI-01 | Create job | Org recruiter | Client `jobIdempotencyKey` |
| SCI-02 | Apply to job | Candidate | Natural (unique job+applicant) |
| SCI-03 | Send message | Participant | `clientMessageId` |
| SCI-04 | Submit challenge | Candidate | Submission idempotency key |
| SCI-05 | AI suggest | Authed user | Deterministic heuristic |
| SCI-06 | Payment webhook | Stripe | Stripe `event.id` |
| SCI-07 | Moderate content | Moderator/Admin | Action key |
| SCI-08 | Enroll in course | Learner | Partial unique active |
| SCI-09 | Purchase license pool | Institution Admin | PO + Stripe event ID |
| SCI-10 | Bulk import students | Institution Admin | import_batch_id + row hash |
| SCI-11 | Batch course assignment | Institution Admin | (pool_id, batch_id) |
| SCI-12 | Seat assign/revoke/reassign | Institution Admin | (pool_id, learner_id) |
| SCI-13 | Add media source | Course Author | (content_item_id, provider, external_id) |
| SCI-14 | Import playlist | Course Author | (playlist_source_id, import_run_id) |
| SCI-15 | Reorder content | Course Author | Client operation ID |
| SCI-16 | Record playback progress | Learner | (learner_id, content_item_id) |
| SCI-17 | Certificate issue / verify | System / Public | UNIQUE(enrollment_id) |
| SCI-18 | Graduate learner | System / Learner | (learner_id, transition_id) |
| SCI-19 | Create course version | Course Author | Version key |
| SCI-20 | Submit course for review | Course Author | Submission id |
| SCI-21 | Attempt quiz | Learner | (quiz, user, attempt_no) |
| SCI-22 | Submit assignment | Learner | (assignment, learner, attempt_no) |
| SCI-23 | Assign peer review | System | (submission, reviewer) |
| SCI-24 | Enrol in path | Learner | (path, user) active |
| SCI-25 | Abort / rollback migration | System / User | (migration_id, stage) |
| SCI-26 | Purchase course | Learner | PaymentIntent id |
| SCI-27 | Submit payout settlement | System | (period, creator) |
| SCI-28 | Q&A post / accept answer | Learner / Instructor | Client post id |
| SCI-29 | Create contest | Instructor / Org | Contest key |
| SCI-30 | Register for contest | Learner | (contest, user) |
| SCI-31 | Submit contest entry | Learner | (contest, challenge, user, submission_key) |
| SCI-32 | Attempt certification | Learner | (certification, user, attempt_no) |
| SCI-33 | Publish post | Author | Client post id |
| SCI-34 | Send newsletter issue | Author | Issue key |
| SCI-35 | Skill CRUD / relationship / market signal / traversal | Admin / Public | — |
| SCI-36 | Career graph query / benchmark / opt-in | Candidate | — |
| SCI-37 | Salary submission / aggregate / withdrawal | Candidate | Submission key |
| SCI-38 | Assessment lifecycle | Recruiter/Interviewer | Assessment id |
| SCI-39 | Recording lifecycle | Recruiter/Interviewer | Recording id |
| SCI-40 | Readiness computation / gap analysis | Candidate | Recompute key |
| SCI-41 | Recruiter search / pool CRUD | Recruiter | — |
| SCI-42 | Credential issue / verify / revoke / endorse | System / Public / Peer | UNIQUE(enrollment) |
| SCI-43 | Correlation query / instructor analytics | Instructor / Admin | — |
| SCI-44 | Exam CRUD | Admin | — |
| SCI-45 | Emerging skill proposal | System | — |
| SCI-46 | Relationship validation | System | — |
| SCI-47 | Introduction path discovery | Candidate | — |
| SCI-48 | Introduction request lifecycle | Candidate | (path_id, requester) |
| SCI-49 | Feedback CRUD | Recruiter | Feedback key |
| SCI-50 | Feedback request | Candidate | Request key |
| SCI-51 | Freshness query | Candidate | — |
| SCI-52 | Re-verification | Candidate | Verification key |
| SCI-53 | Referral request lifecycle | Candidate | (job_id, referrer_id) |
| SCI-54 | Alumni affiliation / group lifecycle | User | Affiliation key |

### 25.2 Error Taxonomy

| Error Class | HTTP | Client-Visible Behavior |
|---|---|---|
| Validation | 422 | Field-level actionable messages |
| Authentication | 401 | "Sign in to continue" |
| Authorization / RLS denial | 403 / 404-equivalent | Generic "not permitted"; no existence leakage |
| Not found | 404 | RLS-masked |
| Conflict | 409 | "Changed since you loaded it — refresh" |
| Rate limit | 429 | Retry-After respected |
| Dependency failure | 503 / degraded | Never a false success |
| Timeout | 504 | Idempotent resume |
| Realtime failure | RPC error | Resubscribe + reconcile/poll |
| AI failure | 503 | Heuristic fallback + badge |
| Billing failure | 503 | Entitlements unchanged |
| Scheduler failure | Retry / DLQ | Skip reason surfaced |

---

### 26.1 Integration Register

| Integration | Direction | Purpose | Phase |
|---|---|---|---|
| Supabase (Auth/DB/Storage/Realtime/Edge) | Core | Platform substrate | MVP |
| Stripe | Bidirectional | Billing, webhooks, metering, invoicing | MVP (demo-guard) |
| Google / GitHub OAuth | Inbound | Social login | MVP |
| Resend / Postmark | Outbound | Transactional email | MVP |
| Gemini / Claude | Outbound | AI via `lib/ai/service.ts` | MVP heuristic; LLM Ph4 |
| BYO AI key | Outbound | Zero-platform-cost AI | MVP |
| managed hosting provider | Deploy | Hosting/edge | MVP |
| Sentry / managed hosting provider Analytics / PostHog | Outbound | Observability | MVP |
| HaveIBeenPwned | Outbound | Breached-password check | MVP |
| Mux / Cloudflare Stream | Outbound | Transcode + CDN | Ph2 (OD-14) |
| Kaltura / Panopto / MS Stream | Outbound | Enterprise video gateways | Ph6 |
| MS Entra / Google Workspace / Okta SSO | Inbound | Institutional SSO | Ph6 |
| Workday / SAP / BambooHR | Bidirectional | HRIS sync | Ph6 |
| Moodle / Canvas / Blackboard / SIS | Bidirectional | LMS interop | Ph6 |
| LinkedIn | Outbound/inbound | Job cross-post, extension scan, OIDC bootstrap, migration source | Post-MVP |
| Slack / Cal.com | Outbound | Notifications/scheduling | Post-MVP |
| IDV vendor | Outbound | Identity verification | Ph9 (OD-27) |
| Proctoring vendor | Outbound | Exam proctoring | Ph10 (OD-35) |
| Zapier / Make | Outbound | Automation | Future |

### 26.2 Integration Layer Doctrine (ADR-009)

```
Core Domain ← Integration Layer (ProviderAdapter + anti-corruption mappers) ← Provider Adapters
```

**Rules:**
- Server-side only for secrets
- Idempotency keys on webhook-triggered operations
- Circuit breakers with degraded modes
- Status visible in admin health
- Every dependency has an owner and documented degraded mode
- Removal drill (VER-021) gates every integration-touching release

---

### 27.1 Dual-Queue Boundary (ADR-009)

| Queue | Infra | Workloads | SLA |
|---|---|---|---|
| Transactional | Postgres `background_jobs` (SKIP LOCKED) | XP settle, notifications, webhooks, digests, rollups, retention purge, search reindex | Enqueue <10ms; process <5s |
| Heavy async | Dedicated worker pool (Redis/BullMQ or equivalent, OD-38) | Video transcode, AI enrichment, 5k+ row imports, large exports, embedding generation | Enqueue <100ms; process best-effort; DLQ after 3 retries |

### 27.2 Transactional Job Catalog

| Kind | Cadence | Retries |
|---|---|---|
| `notification.digest` | Daily 07:30 | 5 |
| `notification.fanout` | On event | 5 |
| `xp.settle` | Event or hourly | 3 |
| `streak.rollover` | Daily 00:05 | 5 |
| `leaderboard.rebuild` | Daily off-peak | 3 |
| `metrics.rollup` | Hourly/daily | 5 |
| `retention.purge` | Daily 02:00 | 5 |
| `stripe.sync` | On backlog | 5 |
| `search.reindex` | On write + nightly | 3 |
| `skill.market_signal_update` | Daily | 3 |
| `career.benchmark_compute` | Nightly | 3 |
| `salary.aggregate` | Nightly | 3 |
| `learning.outcome_correlation` | Nightly | 3 |
| `emerging_skill.detect` | Weekly | 3 |

### 27.3 Heavy Job Catalog

| Kind | Cadence | Retries |
|---|---|---|
| `media.transcode` | On upload | 3 → DLQ |
| `media.enrich` | On transcode complete | 3 → DLQ |
| `media.healthcheck` | Periodic | 3 |
| `institutional.import` | On request | 3 |
| `migration.parse` / `.commit` / `.purge-archive` | On request | 3 |
| `feed.fanout` | On post publish | 3 |
| `earnings.settle` | Monthly | 5 |
| `coupon.expiry_scan` | Daily | 3 |
| `interview.ai_analysis` | On session complete | 3 |

### 27.4 Job Schema

```
id UUID · kind · payload jsonb · status (queued/running/succeeded/failed/dead)
attempts · run_after · lock_expires_at · last_error (≤4KB)
idempotency_key UNIQUE(kind, idempotency_key) · created_at · updated_at
```

---

### 28.1 Realtime vs Polling Boundary

| Surface | Mechanism |
|---|---|
| Direct messaging | Supabase Realtime |
| Notification badges | Supabase Realtime |
| Presence (workspace) | Supabase Realtime |
| Feed | Cursor polling (30s) |
| Job listings | Cursor polling |
| Community posts | Cursor polling |
| Leaderboards | Polling + optimistic |
| Contest live leaderboard | Realtime (bounded) |

### 28.2 Channel Contract

- Payload ≤4KB `{type, entity, id, ts}` + monotonic cursor
- No raw rows; server RLS projection
- JWT-authenticated channels; RLS applied before event body
- Channel registry `<channelType>:<boundedId>`

### 28.3 Resilience

- Reconnect backoff 1s → 8s
- >3 failures → polling path with cursor resync
- Server cap 50 events/s/channel
- Overflow → `refresh` signal
- Launch capacity target ≤2,500 concurrent / 40 topics

---

### 29.1 Unified Content Model

```
Course → Section → ContentItem (VIDEO | PLAYLIST | ARTICLE | PDF | QUIZ | ASSIGNMENT | EXTERNAL_LINK)
                → MediaSource
                → ProviderAdapter
                → ProviderPlayer
```

### 29.2 Delivery Modes

| Mode | Description | Storage | Playback |
|---|---|---|---|
| A — Upload | File uploaded, validated, transcoded, CDN-delivered | Platform | Platform player |
| B — External video | URL normalized, validated, metadata fetched | Provider-hosted | Provider embed |
| C — Playlist embed | External playlist embedded | Provider-hosted | Provider playlist |
| D — Playlist import | Items imported as individual content items | Reference only | Provider players |
| E — External link | Provider prohibits embedding | N/A | External link |

### 29.3 Provider Capability System

Each provider declares: `canEmbed`, `canPlayPlaylist`, `canTrackPlayback`, `canTrackProgress`, `supportsCaptions`, `supportsSubtitles`, `supportsTranscript`, `supportsPlaybackSpeed`, `supportsStartTime`, `supportsEndTime`, `supportsFullscreen`, `supportsPictureInPicture`, `supportsThumbnail`, `supportsMetadataLookup`, `supportsOAuth`.

### 29.4 Media Pipeline

```mermaid
flowchart LR
    U[Upload] --> V[Validation]
    V --> A[AV Scan]
    A --> T[Transcode]
    T --> H[HLS renditions]
    H --> TH[Thumbnail]
    TH --> C[Caption/transcript]
    C --> CDN[CDN publish]
    CDN --> R[READY]
    T -.->|failure| F[FAILED]
```

### 29.5 Media Security

> [!WARNING]
> No arbitrary HTML/JS from authors. Provider-specific renderers only. Domain allowlist in CSP `frame-src`. Reject `javascript:`, `data:`, unknown iframes. SSRF allow-list on server fetches. iframe sandboxing where compatible. Never download protected third-party content.

---

# PART VII — QUALITY & OPERATIONS

---

## 14. Data Architecture & Lifecycle

PostgreSQL is the system of record. The physical table count is not a product invariant; domain ownership, migrations, constraints, indexes, lifecycle rules, and RLS policies are.

### Data integrity requirements

Use foreign keys, appropriate uniqueness, transactions, state constraints, timestamps, versioning, migration parity checks, idempotency records, audit history, and lifecycle states. Derived data must retain provenance and be rebuildable when practical.

### RLS and access

RLS is a database-level boundary for applicable tables. Policies are tested for allowed and denied paths. Application authorization remains required; RLS is not a license to expose arbitrary data endpoints.

### Evidence and credential lifecycle

Evidence and credentials support issuance, active use, expiration, renewal, suspension, revocation, replacement, dispute, and archival semantics with downstream impact handling.

### 24.1 Canonical logical core schema + operational extensions — LOCKED)

| # | Table | Domain |
|---|---|---|
| 1 | `profiles` | Profile |
| 2 | `profile_skills` | Profile |
| 2a | `user_profiles` | Profile (1:1) |
| 2b | `user_settings` | Profile (1:1) |
| 3 | `profile_experience` | Profile |
| 4 | `profile_education` | Profile |
| 5 | `profile_portfolios` | Profile |
| 6 | `resumes` | Profile |
| 7 | `organizations` | Organizations |
| 8 | `org_memberships` | Organizations |
| 9 | `jobs` | Jobs |
| 10 | `job_skills` | Jobs |
| 11 | `job_applications` | Applications |
| 12 | `application_status_events` | Applications |
| 13 | `scorecards` | Applications |
| 14 | `offers` | Applications |
| 15 | `requisitions` | Jobs |
| 16 | `courses` | Learning |
| 17 | `course_modules` | Learning |
| 18 | `course_enrollments` | Learning |
| 19 | `module_progress` | Learning |
| 20 | `course_reviews` | Learning |
| 21 | `challenges` | Assessment |
| 22 | `challenge_submissions` | Assessment |
| 23 | `badges` | Gamification |
| 24 | `user_badges` | Gamification |
| 25 | `xp_transactions` | Gamification |
| 26 | `leaderboards` | Gamification |
| 27 | `messages` | Messaging |
| 28 | `message_threads` | Messaging |
| 29 | `thread_participants` | Messaging |
| 30 | `connections` | Social |
| 31 | `feed_activities` | Social |
| 32 | `notifications` | Messaging |
| 33 | `subscriptions` | Billing |
| 34 | `invoices` | Billing |
| 35 | `entitlements` | Billing |
| 36 | `payment_methods` | Billing |
| 37 | `billing_events` | Billing |
| 38 | `reports` | Moderation |
| 39 | `moderation_flags` | Moderation |
| 40 | `audit_logs` | Admin |
| 41 | `feature_flags` | Admin |
| 42 | `platform_config` | Admin |
| 43 | `ai_audit_log` | Admin |
| 44 | `saved_jobs` | Marketplace |
| 45 | `saved_searches` | Marketplace |
| 46 | `job_alerts` | Marketplace |
| 47 | `email_templates` | Admin |
| 48 | `system_announcements` | Admin |
| 49 | `mentorship_relationships` | Social |
| 50 | `course_cohorts` | Learning |

**Canonical invariants:** Every table has RLS enabled · UUID primary keys · `created_at`/`updated_at` audit columns · soft delete where applicable.

### 24.2 Operational Clusters (Non-Canonical, ~185 tables)

| Cluster | Count | Examples |
|---|---|---|
| Journey | 20 | connection_requests, skill_endorsements, job_referrals, career_roadmaps, cohorts, cohort_members, cohort_curriculum, payout_profiles, creator_payouts, mentor_profiles, mentorship_sessions, mentorship_notes, mentor_reviews, institutional_showcases, agency_client_contracts, agency_placements, agency_invoices, job_trackers, course_challenges, talent_pool |
| OS layer | 27+4 | workspaces, saved_workspace_layouts, workspace_widgets, user_tasks, os_objects, os_object_links, os_tags, os_bookmarks, os_favorites, os_history, knowledge_graph_nodes, knowledge_graph_edges, domain_events, event_subscriptions, workbench_boards, automation_rules, automation_runs, journey_instances, interventions, liquidity_signals, data_quality_findings, agents, agent_runs, agent_memory, device_trust, session_risk_scores, fraud_cases, audit_findings + os_clipboard_items, os_undo_log, os_mentions, notification_center_events |
| Institutional | 12 | departments, batches, batch_memberships, license_pools, license_assignments, purchase_requests, procurement_orders, institutional_courses, certificates, organization_invitations, import_batches, student_consent_records |
| Media | 10 | content_items, media_sources, media_assets, media_versions, playlist_sources, playlist_items, media_progress, media_events, media_provider_configs, media_health_checks |
| Migration/LinkedIn | 5 | migration_jobs, migration_import_batches, imported_records, migration_consents, external_identity_references |
| Learning marketplace | 27 | course_categories, course_versions, lessons, lesson_resources, quizzes, quiz_questions, quiz_attempts, assignments, assignment_submissions, peer_reviews, course_qna, course_qna_replies, course_discussions, course_discussion_replies, lesson_notes, lesson_bookmarks, course_wishlist, course_announcements, learning_paths, learning_path_courses, learning_path_enrollments, path_progress, course_pricing, coupons, coupon_redemptions, course_orders, instructor_earnings |
| Social/content | 24 | follows, posts, post_media, comments, reactions, reposts, bookmarks, hashtags, post_hashtags, mentions, polls, poll_votes, articles, article_versions, newsletters, newsletter_issues, newsletter_subscriptions, post_analytics, feed_ranking_signals, muted_accounts, communities, community_memberships, community_moderation_log, profile_views |
| Profile expansion | 11 | profile_media, career_signals, profile_certifications, profile_achievements, profile_publications, profile_test_scores, profile_volunteer, profile_languages, profile_interests, experience_media, identity_verifications |
| Recommendations/outreach/pools | 5 | written_recommendations, outreach_credits, outreach_messages, talent_pools, talent_pool_members |
| Pages/events | 6 | organization_pages, showcase_pages, events, event_speakers, event_rsvps, event_updates |
| Employer insights | 6 | company_reviews, company_review_ratings, salary_reports, interview_experiences, interview_questions, company_responses |
| Contests/certification | 9 | coding_contests, contest_problems, contest_registrations, contest_submissions, contest_leaderboard, skill_certifications, certification_attempts, practice_problems, problem_discussions |
| Commerce ops | 2 | refunds, instructor_payouts |

**Effective schema ≈ 220 tables.** The "50 canonical" lock refers only to the baseline cluster; count is fixed by migrations and verified by VER-002.

### 24.3 RLS Policy Model (ADR-010)

**Policy Categories:**

| Category | Pattern |
|---|---|
| Own-row | `auth.uid() = user_id` |
| Org-scoped | Membership subquery on `org_memberships` |
| Application-scoped | `auth.uid() = applicant_id OR recruiter_for_job(job_id)` |
| Public-read | Always true for SELECT on published records |
| Admin-all | `auth.jwt()->>'role' = 'ROLE_ADMIN'` |
| Deny-by-default | No matching policy → access denied |

**Generator Model:**

```
generate_tenant_rls_policy(table, tenant_column, owner_column, is_public_read)
```

Creates admin-override, owner, org-member, and optional public-read policies. Helpers: `auth_is_admin()`, `auth_is_org_member(org)`, `auth_is_owner(user)`.

**RLS Fuzzing (CI Gate):** On every migration: create Tenant A/B users + orgs, seed rows, assert cross-tenant SELECT returns 0 rows, cross-tenant UPDATE/DELETE fails, owner-only tables deny non-owners, public-read tables expose no PII. Blocks merge on any failure.

---

---

## 15. Security, Privacy & Data Protection Architecture

Security is defense in depth: authentication, authorization, RLS, validation, secure transport, secrets management, rate limiting, audit, file controls, webhook verification, abuse detection, and operational response.

### Sensitive file controls

Validate type and size; isolate storage; use policy-controlled access and signed URLs; scan where the threat model requires it; define retention and deletion; never expose raw object paths as an authorization mechanism.

### Privacy by purpose

Data visibility is contextual: private, public profile, connections, recruiters, specific employer, institution, evaluator, AI, and admin/operations. Consent is versioned, timestamped, purpose-bound, auditable, and revocable where applicable.

### Incident handling

Cross-tenant access, credential compromise, assessment leakage, and material integrity violations require containment, evidence preservation, credential rotation where relevant, notification according to applicable obligations, and post-incident review.

### 30.1 Defense in Depth (5 Layers)

```
LAYER 1 — CLIENT
  Input validation (Zod) · XSS prevention · CSRF tokens · No secrets in bundle

LAYER 2 — EDGE / MIDDLEWARE
  JWT verification · Rate limiting · Path guards · Request size limits · CORS

LAYER 3 — APPLICATION / API
  Server-side role resolution · Input sanitization · Business rule validation
  Output encoding · Audit logging

LAYER 4 — DATABASE (RLS — FINAL BOUNDARY)
  Generated policies · FK constraints · Check constraints · Unique constraints

LAYER 5 — INFRASTRUCTURE
  managed hosting provider DDoS/WAF/TLS · Supabase SSL · AES-256 at rest · Automated backups
```

### 30.2 Field-Level PII Encryption (AES-256-GCM)

| Column | Sensitivity | Key |
|---|---|---|
| `profiles.phone_number` | Confidential PII | KMS_PII_KEY |
| `profiles.tax_id` / SSN | Restricted Financial | KMS_FIN_KEY |
| `resumes.raw_text_content` | Confidential | KMS_PII_KEY |
| `billing_events.payload` | PCI-adjacent | KMS_FIN_KEY |
| `user_settings.byo_ai_key` | Restricted | KMS_PII_KEY |

### 30.3 Security Headers

| Header | Value |
|---|---|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` |
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' [CDN]; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss://*.supabase.co; frame-src 'self' https://www.youtube.com https://player.vimeo.com [approved media]; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), geolocation=(), microphone=(), payment=()` |
| Cross-Origin-Opener-Policy | `same-origin` |
| Cross-Origin-Resource-Policy | `same-site` |

### 30.4 Hardening Controls (HDN-001..HDN-032)

| ID | Control |
|---|---|
| HDN-001 | DB-enforced authorization (RLS final) |
| HDN-002 | Service-role confinement (server-only) |
| HDN-003 | Object-level OS checks |
| HDN-004 | SSRF guard (allow-listed hosts/schemes) |
| HDN-005 | Webhook hardening (signature + replay window + idempotency) |
| HDN-006 | Upload safety (MIME sniff + AV + private buckets) |
| HDN-007 | Prompt-injection & PII-leak defense |
| HDN-008 | Authentication hardening (rate limits, lockout, jti denylist) |
| HDN-009 | Tamper-evident audit (append-only hash-chained) |
| HDN-010 | Non-leaky errors (generic + correlation id) |
| HDN-011 | Supply-chain hygiene (pinned deps, CVE scan, SBOM) |
| HDN-012 | Delegated-token care |
| HDN-013 | Insider-abuse detection |
| HDN-014 | Crypto & key management |
| HDN-015 | Least-privilege automation |
| HDN-016 | Data-subject rights end-to-end |
| HDN-017 | Media embed & SSRF guardrails |
| HDN-018 | Institutional tenant boundary enforcement |
| HDN-019 | Consent-gated disclosure |
| HDN-020 | Quiz/answer confidentiality (keys encrypted) |
| HDN-021 | Contest integrity (server clock + sandbox + AST) |
| HDN-022 | Payment/commerce hardening (price re-validation + coupon atomicity + refund dual-control) |
| HDN-023 | Instructor payout security (KYC + append-only + dual approval) |
| HDN-024 | Peer-review fairness (double-blind + rubric-bound) |
| HDN-025 | Skills graph write protection (admin-only; audit-logged) |
| HDN-026 | Salary data anonymization (k ≥5 enforced at query layer) |
| HDN-027 | Interview recording dual-consent (block if not recorded) |
| HDN-028 | Post-hire data consent (employer + candidate both opt-in) |

### 30.5 Vulnerability SLAs

| Severity | Response |
|---|---|
| SEV-1 Critical | <24h mitigation + 72h patch |
| SEV-2 High | <72h patch / 7d with blocking control |
| SEV-3 Medium | <14d |
| SEV-4 Low | Next release |

---

## §31. Privacy & Compliance

### 31.1 GDPR Matrix

| Article | Requirement | Implementation |
|---|---|---|
| 5(1)(a) | Lawfulness, fairness, transparency | Privacy policy; explicit consent at sign-up |
| 5(1)(b) | Purpose limitation | Data collected only for stated purposes |
| 5(1)(c) | Data minimization | Only required fields collected |
| 5(1)(d) | Accuracy | Users can edit data |
| 5(1)(e) | Storage limitation | Retention schedule; automated cleanup |
| 5(1)(f) | Integrity and confidentiality | RLS, encryption, access controls, audit |
| 15 | Right of access | Settings export; admin-assisted full export |
| 17 | Right to erasure | Account deletion with 30-day grace + anonymization |
| 20 | Data portability | JSON export |
| 22 | Automated decision-making | AI never makes consequential decisions |
| 33 | Breach notification | 72-hour notification |
| 35 | DPIA | Required before launch |

### 31.2 Other Frameworks

- **EEOC:** No discriminatory screening · accommodation field · quarterly adverse-impact monitoring · 2-year decision retention
- **CCPA/CPRA:** Right to know, right to delete, no sale of personal data, non-discrimination
- **FERPA:** Protected educational records · explicit opt-in showcase consent · perpetual inspection + revocation right

### 31.3 Data Residency

- Primary: US-East (Supabase + managed hosting provider)
- EU sovereign partition (Phase 3 target): PII and resume embeddings tagged `data_residency_region='EU'`
- AI egress enforcement: EU tenancies route to EU LLM endpoints only; no EU endpoint → heuristic fallback
- Cross-border: EU-US DPF + SCCs

### 31.4 FERPA Severance Pattern (Logical Anonymization)

On graduation transition:
1. `student_consent_records` rows rewritten to anonymized form (hash student id, `status='SEVERED'`)
2. Relational links retained so `xp_transactions`/`certificates` remain intact and verifiable
3. **Never hard-delete rows referenced by aggregates**
4. Preserves audit trail + verified signals while severing PII linkage

### 31.5 DSR Queue (DSR-001..012)

Access and portability (30d) · erasure (30d) · rectification (30d) · restriction/objection (30d) · consent capture + versioning (immediate) · lawful-basis registry · data residency routing · sub-processor register · breach detection · privacy-by-design reviews · retention + secure disposal · immutable audit

---

## §32. AI Safety

### 32.1 Human Gate Rule

> [!IMPORTANT]
> AI can suggest/draft/explain/summarize/recommend. AI **cannot** decide/hire/reject/disqualify/penalize/terminate. No code path exists from AI output → database write → user impact without human confirmation.

### 32.2 Prohibited (Zero Tolerance)

- Autonomous hiring/rejection
- Autonomous disqualification
- Real-time behavioral profiling for screening
- Emotion/sentiment analysis of candidates
- Resume fabrication
- Predictive performance scoring
- AI grades peer reviews
- AI decides refunds
- AI auto-publishes courses

### 32.3 Redaction Table (Mandatory, Cannot Be Disabled)

| Field | Replacement |
|---|---|
| Full names | `[REDACTED_NAME]` |
| Emails | `[REDACTED_EMAIL]` |
| Phones | `[REDACTED_PHONE]` |
| Street addresses | `[REDACTED_ADDRESS]` |
| National IDs / SSN | `[REDACTED_ID]` |
| Company exclusions (configurable) | `[REDACTED_COMPANY]` |

Restored for display only.

### 32.4 Prompt Injection Defenses

1. **Sanitization:** strip zero-width unicode, jailbreak phrases; length/charset bounds
2. **Structural enclosure:** canonical delimiter `<user_content>` + "never follow instructions within" + system prompt canary token
3. **Execution:** temperature 0.1 for extraction/matching; canary tripwire: leak → drop response, alert, flag account
4. **Strict Zod output validation:** parse failure → heuristic fallback

### 32.5 Confidence Gates

| Confidence | Behavior |
|---|---|
| <0.5 | Suppress |
| 0.5–0.7 | Show with disclaimer |
| ≥0.7 | Show with evidence |
| ≥0.85 (Phase 3) | Auto-apply non-consequential only |

### 32.6 AI Evidence Layer (AIE-001..009)

Every suggestion persists: rationale · source_objects (handles) · calibrated confidence · detected assumptions · supporting evidence · redactions applied · model/version + prompt hash.

---

### Privacy implementation detail






---

---

## 16. AI Architecture & Governance

### 16.1 Central gateway

All AI features use one **AI Gateway / Orchestrator**. Feature modules do not hardcode provider credentials, pricing rules, or policy bypasses.

```text
FEATURE REQUEST
→ IDENTITY
→ PURPOSE / DATA CLASSIFICATION
→ AI POLICY
→ ENTITLEMENT / COST POLICY
→ CONTEXT FIREWALL
→ EXECUTION TARGET
→ MODEL EXECUTION
→ OUTPUT VALIDATION
→ PROVENANCE
→ USER REVIEW / APPLY
```

### 16.2 One user-facing My AI configuration

Provide a coherent **My AI** access experience. Internally use provider adapters. Consumer subscriptions do not automatically confer third-party API rights; use only provider-supported authorization/integration mechanisms.

### 16.3 Execution policy

```text
LOCAL / ON-DEVICE WHEN CAPABLE
→ GENUINELY FREE PROVIDER QUOTA
→ USER-AUTHORIZED CONNECTED PROVIDER
→ TALENTSPHERE CLOUD ONLY WHEN POLICY PERMITS
→ NON-AI FALLBACK
```

### 16.4 Free-user cost invariant

TalentSphere must not incur paid third-party inference cost for a free user unless an explicit active cost policy permits it. No silent paid fallback.

### 16.5 AI data boundary

Classify input as PUBLIC, INTERNAL, PRIVATE, SENSITIVE, RESTRICTED, or NEVER-EXTERNAL. Minimize context and preserve provenance.

### 16.6 Memory separation

```text
AI CONVERSATION MEMORY ≠ USER PROFILE ≠ TALENT GRAPH ≠ VERIFIED EVIDENCE
```

AI suggestions cannot silently alter verified state. Consequential changes require explicit user/authorized workflow acceptance.

### 16.7 Output impact

INFORMATION, DRAFT, RECOMMENDATION, ANALYSIS, DECISION SUPPORT, and CONSEQUENTIAL DECISION are governed differently. Autonomous consequential decisions are prohibited.

### 16.8 Provenance and evaluation

AI outputs retain request ID, capability, provider/model, execution mode, timestamp, data classification, context references, policy decision, applicable sources, output, and user modifications. Evaluate correctness, groundedness, relevance, safety, privacy, consistency, latency, reliability, cost, and domain-specific quality.

---

## 17. Assessment & Exam Integrity

### AI modes

`AI_PROHIBITED`, `AI_RESTRICTED`, `AI_ALLOWED`, `POST_ASSESSMENT_ONLY`.

### AI-prohibited contract

While an AI-prohibited assessment is active, TalentSphere must not provide answers, materially solving hints, generated code, debugging, screenshot-to-answer assistance, alternative solution paths, or indirect help through another TalentSphere feature/provider.

### Enforcement

Assessment context is carried server-side into the AI policy layer. Hiding buttons is insufficient. Provider adapters cannot override assessment policy.

### Integrity controls

Server-authoritative timer; attempt limits; session/device binding where justified; protected questions/answers; randomized questions/options; no answer-key exposure; autosave and submission idempotency; replay resistance; appropriate copy/paste/focus/device signals; suspicious-event logs; plagiarism/code similarity where relevant; human review and appeals.

Behavioral and AI-detection signals are indicators for review, not definitive proof of cheating.

---

## 18. Matching, Recommendations, Reputation & Career Intelligence

### Matching pipeline

```text
HARD CONSTRAINTS
→ ELIGIBILITY
→ REQUIRED CAPABILITIES
→ EVIDENCE QUALITY
→ EXPERIENCE
→ RECENCY
→ TRANSFERABLE SKILLS
→ PREFERENCES
→ UNCERTAINTY
→ EXPLAINABLE RESULT
```

Do not present an opaque universal Talent Score. Any fit indicator must expose the meaningful dimensions and limitations.

### Recommendations

Important recommendations preserve what, why, evidence/inputs, expected benefit, confidence/uncertainty, alternatives, freshness/expiry, and user feedback.

### Reputation and trust

Reputation is contextual and multi-dimensional. Resist fake projects, credentials, endorsement rings, review manipulation, assessment farming, duplicate identities, suspicious evidence, and misleading AI-generated work. Anomaly is not guilt. Consequential restrictions require governed review and appeal.

### Career intelligence

Provide decision support: goals, gaps, possible paths, trade-offs, actions, and evidence. Forecasts are conditional and time-bounded. Market data includes source, collection time, geography, population, coverage, methodology, freshness, and limitations.

---

## 19. PWA, Offline & Synchronization

TalentSphere is a real PWA with progressive enhancement across Android, iOS/iPadOS, and desktop browsers. Do not assume identical browser capabilities.

### Capability abstraction

Detect installability, push/notifications, camera/microphone, sharing, filesystem, background behavior, secure authentication/WebAuthn, offline storage, and local AI capability.

### Per-feature offline contract

```text
READ_OFFLINE?
WRITE_OFFLINE?
QUEUE?
SYNC_STRATEGY?
CONFLICT_STRATEGY?
SERVER_REQUIRED?
SENSITIVE_DATA?
```

The service worker/cache is never the business source of truth. Sensitive assessments, authoritative submissions, payments, and privileged actions use server authority.

### Sync

Use operation IDs, entity versions, device context, timestamps, mutation type, and bounded retries where needed. Conflicts follow entity-specific policy; material concurrent changes are not silently overwritten.

---

## 20. Performance, Reliability & Observability

Design for 10, 100, 1K, 10K, 100K, and 1M+ users by identifying the trigger for architecture evolution rather than overbuilding from day one.

### Reliability

Every retry is bounded and idempotent. Integrations define timeouts, retry policy, circuit behavior, outage handling, and reconciliation. Major workflows degrade gracefully when a dependency fails.

### Observability

```text
REQUEST → USER → TENANT / PURPOSE → FEATURE → API → DB / QUEUE → PROVIDER → RESULT
```

Provide structured logs, correlation IDs, metrics, traces, audit events, health checks, SLOs/SLIs, alerts, dashboards, runbooks, and incident recovery. Unknown telemetry is not silently treated as healthy.

### 33.1 Trace Propagation

```
Client → Edge middleware (inject/validate x-request-id UUIDv4)
      → React/Vite handler (structured log)
      → PostgreSQL (SET LOCAL app.request_id; captured in audit_logs)
      → AI SDK (metadata: {request_id}; captured in ai_audit_log)
      → Stripe (client_reference_id)
      → Response header + Sentry context
```

### 33.2 Monitoring Triad

| Realm | Tool | Alert On |
|---|---|---|
| Errors | Sentry | 5+ in 5 min |
| Web Vitals | managed hosting provider Analytics | Budget regression |
| Database | Supabase Dashboard | Query >1s; RLS spikes; connections >80% |
| Realtime | Supabase Realtime metrics | Latency >2s |
| AI | `ai_audit_log` | Error >5%; acceptance <30% |
| Stripe | Stripe dashboard | Webhook error >2% |
| Business | PostHog | Funnel regression >10% WoW |
| Availability | Uptime monitor | 3 consecutive failures |

### 33.3 Alert Severity

| Severity | Response | Escalation |
|---|---|---|
| P0 Critical | 10 min | Phone + Slack + email |
| P1 High | 30 min | Slack + email |
| P2 Medium | 4h | Ticket |
| P3 Low | 1 business day | Ticket |

### 33.4 Dashboards

- **Platform Health** (availability, latency, error rates, queue depths, health score)
- **Business Health** (WAU, conversions, funnel, MRR)
- **AI Health** (requests, latencies, acceptance, cost)
- **Security Health** (auth events, RLS denials, threat detections)
- **Learning Ecosystem Health** (course enrollments, completions, revenue)
- **UGC Health** (posts, moderation queue, SLA)
- **Institutional Health** (tenant activity, seat utilization, renewal)

---

### Performance detail

### 35.1 Core Web Vitals

LCP <2.5s mobile / <2.0s desktop · INP <200ms · CLS <0.1 · TTFB <800ms · FCP <1.8s / <1.5s

### 35.2 Per-Route Budgets

| Route Class | LCP | JS | CLS | INP |
|---|---|---|---|---|
| Marketing | ≤1.8s | ≤120KB | ≤0.05 | ≤200ms |
| Search/marketplace | ≤2.0s | ≤200KB | ≤0.1 | ≤200ms |
| Dashboard/ATS | ≤2.5s | ≤250KB | ≤0.1 | ≤200ms |
| LMS player | ≤3.0s | ≤300KB | ≤0.1 | ≤300ms |
| Challenge arena | ≤3.0s | ≤400KB | ≤0.1 | ≤300ms |
| Messaging | ≤2.0s | ≤220KB | ≤0.1 | ≤200ms |
| Admin/reporting | ≤3.5s | ≤350KB | ≤0.1 | ≤300ms |
| Profile/portfolio | ≤2.0s | ≤180KB | ≤0.1 | ≤200ms |
| Course builder | ≤3.5s | ≤400KB | ≤0.1 | ≤300ms |
| Institutional analytics | ≤3.5s | ≤350KB | ≤0.1 | ≤300ms |
| Feed first page | ≤2.5s | ≤220KB | ≤0.1 | ≤300ms |

### 35.3 Forbidden Anti-Patterns

- >200KB gzipped route bundles
- N+1 queries
- Client-side fetching for SSR pages
- Unbounded client lists
- Synchronous heavy render operations
- Missing cache headers

### 35.4 Performance Hot-Paths (PERF-001..PERF-013)

List endpoints p95 <200ms · search p95 <300ms · detail LCP <2.5s · dashboard aggregates p95 <400ms · bounded Realtime subscriptions · zero N+1 · bundle budgets · long tasks never block request path · media lazy + transformed + sized · background jobs batched/idempotent · UnifiedPlayer lazy init, single active instance · institutional drill-down p95 <400ms via rollups · discovery surfaces p95 <300ms via ISR + rollups

---

---

## 21. Testing, Accessibility & Quality Engineering

### Test layers

```text
UNIT → COMPONENT → INTEGRATION → API/CONTRACT → E2E → SECURITY → ACCESSIBILITY → PERFORMANCE → DATA INTEGRITY → REGRESSION → FAILURE/RECOVERY
```

### Completion evidence

A feature is complete only when behavior, permissions, data integrity, security/privacy, accessibility, observability, analytics, recovery, tests, and acceptance criteria all pass.

### Accessibility gate

WCAG 2.2 AA is a release requirement. Verify keyboard navigation, visible focus, semantic structure, labels/errors, contrast, touch targets, zoom/reflow, reduced motion, captions/transcripts, accessible charts/timers/editors/dialogs, and alternatives to gesture-only interactions.

### 36.1 WCAG 2.2 AA Conformance (Release Gate)

| Principle | Requirements |
|---|---|
| Perceivable | Text alternatives; color never sole indicator; contrast ≥4.5:1 text, ≥3:1 large/UI |
| Operable | Full keyboard; no traps; skip nav; visible focus |
| Understandable | Language declared; consistent nav; input assistance; error identification |
| Robust | Valid HTML; name/role/value on custom components; status messages |

### 36.2 WCAG 2.2 Forward-Alignment Targets

- 2.4.11 Focus Not Obscured
- 2.4.13 Focus Appearance (≥2px, 3:1)
- 2.5.7 Dragging Movements (single-pointer alternative)
- 2.5.8 Target Size (24×24px min)
- 3.2.6 Consistent Help
- 3.3.7 Redundant Entry
- 3.3.8 Accessible Authentication (password-manager fill; pasteable TOTP)

### 36.3 Accessibility Evidence (A11Y-001..010)

Per-route conformance matrix · CI axe 0 critical/serious · manual SR testing on critical journeys · keyboard-only operability · focus management evidence · contrast + target-size audit · accessible auth evidence · reduced-motion tests · DoD/regression inclusion · published statement/VPAT

### 36.4 Added Accessibility Requirements

- Quiz timers announce remaining time and support extended-time accommodations
- Contest leaderboards expose a data-table alternative
- Media player keyboard-operable with caption toggle
- Feed infinite scroll has a "load more" non-scroll alternative
- Drag-drop curriculum builder has a mandatory keyboard reorder path

---

---

## 22. Deployment, Disaster Recovery & Release Operations

The project begins with managed infrastructure and reproducible environments. No deployment artifact is considered production-ready until security, tests, migrations, observability, rollback, backup/restore, and operational ownership are proven.

### 37.1 Environments

| Env | Purpose | Data | Secrets |
|---|---|---|---|
| local | Developer loop | Seeded synthetic | `.env.local`; anon key only |
| CI | Automated gates V0–V4 | Ephemeral Postgres + fixtures | CI-scoped |
| staging | Pre-production verification/UAT | Anonymized/synthetic at scale | Vault staging |
| prod | Live | Real | Vault production scope with rotation |

### 37.2 CI/CD Pipeline

```
Code Push
  → Lint + Type Check
  → Unit Tests
  → Build
  → Preview Deploy (managed hosting provider PR)
  → E2E Tests (critical journeys)
  → Migration Round-Trip
  → RLS Fuzzing
  → QA Sign-Off (staging)
  → Production Deploy
```

### 37.3 Progressive Rollout

| Stage | % | Window | Validation |
|---|---|---|---|
| Canary | 5% | 24h | Error rate + CWV within budget |
| Beta | 25% | 72h | Business metrics stable |
| Wide | 50% | 72h | All external SLAs met |
| GA | 100% | Locked | Flag remains as kill switch |

**Automated rollback:** p95 degrades >20% or 5xx >0.1% → traffic to previous stable within 15s.

### 37.4 Backup & DR

| Data | Mechanism | Frequency | RPO | RTO |
|---|---|---|---|---|
| PostgreSQL | Supabase automated + PITR | Daily + 15-min WAL | ≤15m | ≤2h |
| Storage | Managed with retention | Continuous | Near-zero | ≤4h |
| Auth | Included in DB backup | Daily | ≤24h | ≤2h |
| managed hosting provider deployment | Reproducible from git | Per deploy | n/a | ≤15m |
| Env vars | `.env.example` + dashboard | As changed | n/a | ≤1h |

### 37.5 Recovery Testing

- Quarterly DB restore to staging
- Quarterly PITR record recovery
- Quarterly rollback drill (<15m)
- Semi-annual secrets rotation drill
- Annual full DR simulation

### 37.6 Go-Live Gates (PROD-001..PROD-024)

| ID | Gate | Evidence |
|---|---|---|
| PROD-001 | Code freeze & change control | Freeze record + manifest |
| PROD-002 | CI fully green | CI run link |
| PROD-003 | Migrations applied & reversible | VER-002 |
| PROD-004 | Secrets provisioned & rotatable | Secret manifest + rotation test |
| PROD-005 | Observability live | Dashboard + alert test |
| PROD-006 | Runbooks & on-call | Drill log |
| PROD-007 | Backup verified | Restore report |
| PROD-008 | DR targets proven | VER-010 |
| PROD-009 | Load headroom | VER-006 at 2× |
| PROD-010 | Security sign-off | Pen-test letter |
| PROD-011 | Accessibility sign-off | VER-008 |
| PROD-012 | Privacy/compliance sign-off | DPA + retention + erasure + EEOC + FERPA legal review |
| PROD-013 | Billing verified | VER-013 |
| PROD-014 | Flags default-safe | Flag registry audit |
| PROD-015 | Rollback/canary plan | Rehearsed |
| PROD-016 | Incident response | IR plan + drill |
| PROD-017 | Cost guardrails | Budget alerts + kill switches |
| PROD-018 | Post-launch verification | Hypercare plan |
| PROD-019 | Institutional tenant isolation | VER-017 |
| PROD-020 | Media provider allowlist verified | CSP scan + config review |
| PROD-021 | Course commerce production proof | GAP-021 cutover + VER-023 + refund drill + coupon abuse suite |
| PROD-022 | UGC moderation live | SLA dashboard |
| PROD-023 | Contest infra load-proven | Load test report |
| PROD-024 | Migration engine privacy-proven | Privacy scan + TTL purge proof |

---

# PART VIII — EXECUTION

---

## 23. Implementation Roadmap & Dependency-Aware Build Order

Implementation starts from the greenfield baseline. The roadmap is capability-driven; phases can shift when dependencies or validated business priorities change, but no phase may bypass foundational security, authorization, data integrity, or testing controls.

### 38.1 Phases (0–10)

| Phase | Title | Scope | Exit Criteria |
|---|---|---|---|
| **Ph0** | Foundation | Supabase setup, React/Vite skeleton (ADR-012 structure), Aura tokens, auth, RLS baseline, CI/CD, test harness | Registration + login working; RLS verified allow+deny; CI green |
| **Ph1** | Candidate Core + Skills Graph Foundation | Profile + resume + portfolio, courses, challenge arena, XP + levels, profile depth, **F-84 Skills Graph foundation**, Migration Center v1 | Candidate completes Learn→Prove→Showcase loop; skills graph operational; migration import idempotent |
| **Ph2** | Marketplace + Media + Social v1 + Skill Evidence + Career Readiness | Job posting/search, application pipeline, media engine foundations, course builder, social graph + feed v1, extension, command search, **F-96 Skill Evidence**, **F-91 Career Readiness** | Recruiter posts → candidate applies → recruiter processes; mixed-media course publishes; credentials issued; readiness scores computed |
| **Ph3** | Recruiter Suite + Institutional + Career Intelligence | Scorecards, interviews, messaging, offers, org admin, institutional tenancy/hierarchy, bulk import, license pools, batches, branded certificates, graduation flywheel, communities, pages, events, assignments, programs, instructor console, **F-85 Career Graph**, **F-86 Salary Intel**, **F-88 Interview Platform**, **F-92 Advanced Recruiter Search**, **F-94 Work History**, **F-102 HM Portal**, **F-103 Comparison**, **F-104 Custom Assessment**, **F-115 Exam Platform**, **F-122 App Feedback**, **F-123 Skill Decay** | Full 5-stage hiring pipeline; 5 institutional MVP exits; career intelligence operational |
| **Ph4** | AI Copilot + Media Expansion + Learning Impact + Career Transition | LLM copilot, AI enrichment, playlists/Vimeo, feed ranking v2, articles, newsletters, recommendations, **F-87 Interview Repo**, **F-90 Mentorship**, **F-93 Video + AI Feedback**, **F-95 Career Transition**, **F-97 Job Market Analytics**, **F-99 AI Coach**, **F-105 Post-Hire Analytics**, **F-114 Learning Impact**, **F-121 Warm Intros**, **F-125 Alumni**, **F-128 Offer Comparison**, **F-142 Referrals** | AI live with confidence thresholds; learning outcomes correlated; career transition planning operational |
| **Ph5** | Trust & Scale + Peer Learning | Moderation at scale, admin dashboard, analytics, observability hardening, **F-100 Peer Projects**, **F-106 Prerequisites**, **F-107 Live Q&A**, **F-111 Industry Hubs**, **F-155 Adaptive Learning**, **F-156 PDP** | Admin console live; 50k-user load verification; peer learning operational |
| **Ph6** | Enterprise Expansion | SSO/SAML, public API, webhooks, HRIS/SIS/LMS integrations, enterprise video, white-label, proctoring (F-45), **F-131 Apprenticeship**, **F-132 Scholarship**, **F-137 Spaced Repetition**, **F-138 Study Accountability** | Enterprise contract fulfillment |
| **Ph7** | Learning Marketplace + Expert Network | Course Studio, categories/discovery, quizzes/exams, assignments/peer review, paths/programs, course community, reviews, course commerce, instructor platform, student analytics, **F-108 Expert Network**, **F-130 Freelance**, **F-133 Volunteer**, **F-139 Local**, **F-140 Affinity** | Full learning marketplace operational |
| **Ph8** | Social Parity + Verification Depth | Feed, publishing, articles, newsletters, groups, pages, events, recommendations, outreach, profile views, IDV, **F-89 Contribution Verification**, **F-101 Badge Marketplace**, **F-109 Negotiation**, **F-110 Verified Endorsements**, **F-112 Resume Parsing**, **F-113 Recruiter Analytics**, **F-116 Accessibility**, **F-117 Mobile-First**, **F-118 Emerging Skills**, **F-119 DE&I Analytics** | Feed + content + community stack operational; verification depth complete |
| **Ph9** | Insights & Assessment | Company reviews, salaries, interviews, benefits, contests, certifications, practice sets, admin expansion | Insights + assessment stack operational |
| **Ph10** | Decision-Gated & Future | Premium Candidate (OD-34), sponsored content (OD-32), BD graph (OD-31), live video (OD-33), white-label, **F-120 API Platform** | Founder-gated |

### 38.2 Dependency-Aware Build Order

```mermaid
flowchart LR
    A[W0 Foundation<br/>Auth + RLS + Shell] --> B[W1 Candidate Core<br/>+ Skills Graph F-84]
    B --> C[W2 Skill Evidence F-96<br/>+ Career Readiness F-91]
    C --> D[W3 Career Graph F-85<br/>+ Salary F-86 + Interview F-88]
    D --> E[W3 Advanced Recruiter<br/>F-92 + F-102 + F-103]
    E --> F[W4 Learning Impact F-114<br/>+ AI Coach F-99]
    F --> G[W5 Community<br/>+ Peer Learning]
    G --> H[W6 Enterprise<br/>+ Integrations]
    H --> I[W7 Learning Marketplace]
    I --> J[W8 Social Parity<br/>+ Verification Depth]
    J --> K[W9 Insights + Assessment]
    K --> L[W10 Decision-Gated]
```

### 38.3 MVP Exit Criteria (7)

1. Candidate full loop: enroll → complete course → attempt challenge → earn XP → apply → track
2. Recruiter full loop: create org → verify → post job → review → shortlist → message → offer
3. RLS verification suite: 100% of policies tested with allow + deny assertions
4. Accessibility: axe scan 0 critical on all MVP routes
5. Performance: Core Web Vitals within budgets on mobile 4G
6. Reliability: 5 consecutive green staging deploys
7. Security: external penetration test with 0 critical/high findings

### 38.4 Institutional MVP Exit Criteria (5)

1. Tenant + departments + batches + ≥500-student bulk import with dry-run preview
2. License pool purchase + atomic batch assignment (seats never oversold)
3. Managed learner completes course + branded certificate with working public verification URL
4. Seat revoke + reassign exact (progress retained)
5. Cross-tenant isolation tests pass for all institutional tables

---

---

## 24. Gap Closure, Weak Decisions, Risks & Open Decisions

Every material problem follows: **identify → understand → validate → classify → root cause → options → selected solution → implementation → failure/recovery → tests → acceptance criteria**.

### 40.1 Resolved Gaps

| ID | Class | Gap | Disposition |
|---|---|---|---|
| GAP-001 | D, N | Salary-range representation | RESOLVED (FC-01) |
| GAP-002 | O | Currency display policy | RESOLVED (FC-02) |
| GAP-003 | Q | Course-video hosting | CLOSED — TD-01 |
| GAP-004 | Q | Final LLM provider selection | RESOLVED — MVD-01 |
| GAP-005 | P | Moderation automation level | RESOLVED (FC-13) |
| GAP-006 | N | Leaderboard reset period | RESOLVED (FC-10) |
| GAP-007 | O, Q | AI quota & provider paths | RESOLVED (FC-03) + DOR-019 dual fallback |
| GAP-008 | R, N | Job-alert retroactivity | RESOLVED (FC-14) |
| GAP-009 | Q, K | Calendar/meeting scheduling | DEFERRED · POST-MVP |
| GAP-010 | Q | Transactional email provider | RESOLVED (FC-11) |
| GAP-011 | Q | Product-analytics stack | RESOLVED (FC-12) |
| GAP-012 | D, F | Storage bucket layout | CLOSED — TD-01 |
| GAP-013 | L | Backup cadence & PITR window | RESOLVED (FC-15) |
| GAP-014 | O | Free-tier course limits | RESOLVED (FC-04) |
| GAP-015 | A | AI scope at MVP | RESOLVED (FC-06) |
| GAP-016 | B, N | Candidate:employer ratio target | RESOLVED (FC-07) |
| GAP-017 | O | Enterprise contract billing | RESOLVED (FC-08) |
| GAP-018 | J, R | First additional languages | RESOLVED (FC-09) |
| GAP-019 | A | Gamification intensity | DEFERRED · POST-MVP |
| GAP-020 | H, C | Sandbox execution limits | RESOLVED (FC-16/TD-05) |
| GAP-021 | K | Production checkout | DEFERRED · POST-MVP (with cutover criteria) |
| GAP-022 | Q | Provider abstraction runtime contract | UNVERIFIED (no live model integration) |
| GAP-023 | D, Q | Resume storage provider | CLOSED — TD-01 |
| GAP-024 | G | File/avatar size & type limits | CLOSED — TD-02 |
| GAP-025 | I, L | Retention periods | RESOLVED (FC-17/TD-03) |
| GAP-026 | N | Digest frequency/limits | CLOSED — TD-04 |
| GAP-027 | D, C | Scorecard naming divergence | RESOLVED — canonical `scorecards` |
| GAP-028 | A, D | Citus sharding proposal | CLOSED — TD-06 |
| GAP-029 | F, M | RLS runtime enforcement unverified | UNVERIFIED — Phase 0 harness specified |
| GAP-030 | J | WCAG conformance untested | UNVERIFIED — CI axe-core gate specified |

### 40.2 Expansion Gaps (GAP-031..038)

| ID | Class | Gap | Disposition |
|---|---|---|---|
| GAP-031 | B, Q | Migration engine missing from baseline | Specified Module 29 + SCI-19..25 |
| GAP-032 | D | Native social graph & content cluster missing | Specified Modules 25–26 |
| GAP-033 | D, A | Structured profile depth missing | Specified PROFILE-011..021 |
| GAP-034 | A | Events/communities promotion | Promoted to Module 27 |
| GAP-035 | Q | LinkedIn job cross-post dependency | RE-SCOPED — fallback chain (LIN-010) |
| GAP-036 | A, Q | Optional LinkedIn OIDC login | Specified AUTH-016 |
| GAP-037 | K | Feed fan-out strategy at scale | Hybrid fan-out spec (FEED-003) |
| GAP-038 | I | Connection-email handling legal basis | Hash-match only (BR-096) |

### 40.3 Schema Gaps (All Closed)

| Gap | Table | Status |
|---|---|---|
| GAP-T1 | `organization_invitations` | CLOSED — §24 |
| GAP-T2 | `interviews` | CLOSED — §24 |
| GAP-T3 | `certificates` | CLOSED — §24 |
| GAP-T4 | `api_keys`, `webhook_subscriptions` | CLOSED — §24 |
| GAP-T5 | Org domain events | CLOSED — EVT-076..078 |
| GAP-T6 | `requisitions` relationship | CLOSED — §24 |
| GAP-T7 | Various operational tables | CLOSED — §24 |
| GAP-T8 | `cohorts` vs `course_cohorts` | RESOLVED — distinct entities |

---

### Open decisions and blockers

### 41.1 Complete OD Register (OD-01..OD-53)

| ID | Decision | Recommended | Owner | Blocks |
|---|---|---|---|---|
| OD-01 | Workspace primary metric | Active learners | Founder | Ph1 |
| OD-02 | Curriculum structure depth | Module → Lesson (2-level) | Founder | Ph1 |
| OD-03 | Video hosting | Mux | Founder | Ph2 |
| OD-04 | AI primary engine | Hybrid (MVD-01) | Founder | Ph4 |
| OD-05 | Moderation automation | AI-triage for spam; human for bans | Founder | Ph5 |
| OD-06 | Leaderboard reset | Weekly + all-time tabs | Founder | Ph2 |
| OD-07 | AI quota & paths | Hybrid (FC-03) | Founder | Ph4 |
| OD-08 | Job alert retroactivity | New-only | Founder | Ph2 |
| OD-09 | Interview scheduling | Manual at MVP; integration Ph6 | Founder | Ph3 |
| OD-10 | Email provider | Resend primary; SendGrid failover | Founder | Ph1 |
| OD-11 | Analytics stack | PostHog self-managed | Founder | Ph2 |
| OD-12 | Storage buckets | Per-entity with RLS | Founder | Ph1 |
| OD-13 | Backup cadence | Daily + 15-min PITR | Founder | Ph1 |
| OD-14 | Video transcoding | Mux | Founder | Ph2 |
| OD-15 | Institutional pricing | Volume-tier per-seat | Founder | Ph3 |
| OD-16 | Institutional SSO timing | Phase 6 | Founder | Ph6 |
| OD-17 | Provider allowlist defaults | Upload+YouTube MVP; Vimeo Ph2; others Ph3+ | Founder | Ph2 |
| OD-18 | Certificate validity | Perpetual default; configurable | Founder | Ph3 |
| OD-19 | Institutional data retention | 7y default | Legal | Ph3 |
| OD-20 | White-label scope | Co-branded first; full enterprise-only | Founder | Ph10 |
| OD-21 | Import row limit | 5k per batch, chunked | Eng | Ph3 |
| OD-22 | Media analytics attribution | Hybrid with labels | Product | Ph4 |
| OD-23 | Faculty certificate issuance | Configurable per faculty | Product | Ph3 |
| OD-24 | Archive max size | 50MB | Eng | Ph1 |
| OD-25 | Migration rollback window | 30 days | Product | Ph1 |
| OD-26 | Contact-hash TTL | 30 days | Legal | Ph1 |
| OD-27 | Instructor verification | Optional badge at launch | Product | Ph7 |
| OD-28 | Course revenue share | 70/30 default; tiered later | Founder | Ph7 |
| OD-29 | Refund window/policy | 30 days; pro-rated after 20% | Founder | Ph7 |
| OD-30 | Quiz attempt defaults | 3 graded, unlimited practice | Product | Ph7 |
| OD-31 | BD graph | Exclude (SCOPE-003) unless ratified | Founder | Ph10 |
| OD-32 | Sponsored content | Listings only | Founder | Ph10 |
| OD-33 | Live video | Defer; vendor evaluate | Founder | Ph10 |
| OD-34 | Premium Candidate tier | Profile views + outreach + insights; price TBD | Founder | Ph10 |
| OD-35 | Proctoring | Vendor at Phase 10 | Founder | Ph10 |
| OD-36 | Default profile-view privacy | Semi-anonymous default | Product | Ph8 |
| OD-37 | Peer-review minimum | 2 | Product | Ph7 |
| OD-38 | Salary aggregation minimum | 5 | Legal | Ph9 |
| OD-39 | Certification retake policy | Cooldown 7d, configurable | Product | Ph9 |
| OD-40 | Numeric targets for new metrics | Set after 90 days of data | Product | Analytics |
| OD-41 | `module_progress` retirement date | After Phase 7 verification | Eng | Data cleanup |
| OD-42 | Course publish review SLA | 72 hours | Ops | Ph7 |
| OD-43 | Coupon max discount bound | 75% | Finance | Ph7 |
| OD-44 | Contest infrastructure | Reuse sandbox with separate pool | Eng | Ph9 |
| OD-45 | Anonymous reviews allowed? | Yes with credibility badge | Legal | Ph9 |
| OD-46 | Skills graph — build vs. license | Build (defensible moat) | Founder | Ph1 |
| OD-47 | Salary data source | User submissions + licensed market data | Founder | Ph3 |
| OD-48 | Interview recording default | Off by default (opt-in per interview) | Legal + Product | Ph3 |
| OD-49 | AI feedback scope in interviews | Communication signals only | Legal + AI governance | Ph4 |
| OD-50 | Expert network — free vs. paid | Hybrid (free tier + paid premium calls) | Founder | Ph7 |
| OD-51 | Learning impact — causal claim scope | Correlational only (no causal marketing) | Legal | Ph4 |
| OD-52 | DE&I analytics — aggregate minimum | k ≥10 for demographic cells | Legal | Ph8 |
| OD-53 | API pricing tier | Enterprise-only at launch | Founder | Ph10 |

### 41.2 Structural Decisions

| ID | Decision | Recommended | Owner |
|---|---|---|---|
| D-01 | Bounded context count | 7 consolidated | Founder |
| D-02 | Realtime vs polling boundary | Confirm §28.1 | Founder |
| D-03 | Dual-queue implementation | Postgres + dedicated worker (ADR-009) | Founder |
| D-04 | Atomic Design adoption | Full | Founder |
| D-05 | FERPA severance mechanism | Logical anonymization | Founder |

### 41.3 Pre-Implementation Blockers (DOR-001..DOR-026)

| ID | Blocker | Gate |
|---|---|---|
| DOR-001 | API error contract | Before MVP |
| DOR-002 | Versioning/deprecation policy | Before MVP |
| DOR-003 | Migration order/ownership | Before MVP |
| DOR-004 | Seed/fixture strategy | Before MVP |
| DOR-005 | Environment ladder | Before MVP |
| DOR-006 | Secret provisioning | Before MVP |
| DOR-007 | Rate-limit numbers | Before MVP |
| DOR-008 | Pagination/filter/sort | Before MVP |
| DOR-009 | Idempotency-key contract | Before MVP |
| DOR-010 | Time/timezone | Before MVP |
| DOR-011 | Money/currency | Before MVP |
| DOR-012 | Upload limits | Before MVP |
| DOR-013 | Feature-flag lifecycle | Before MVP |
| DOR-014 | Migration rollback | Before MVP |
| DOR-015 | Local onboarding | Before MVP |
| DOR-016 | DoR/DoD gate | Before build |
| DOR-017 | Retention/erasure SLAs | Before prod |
| DOR-018 | Concurrency/conflict rule | Before MVP |
| DOR-019 | Consumer OAuth delegated billing | Before MVP |
| DOR-020 | Institutional controller/processor split | Before institutional contract |
| DOR-021 | Media provider ToS review | Before Phase 2 media |
| DOR-022 | Transcode/CDN provider selection | Before Phase 2 media |
| DOR-023 | Institutional pricing validation | Before institutional GA |
| DOR-024 | FERPA compliance review | Before institutional launch |
| DOR-025 | Skills graph build vs. license decision | Before Phase 1 skills graph |
| DOR-026 | Interview recording legal review (dual consent) | Before Phase 3 interview platform |

---

## §42. Registers

### 42.1 Locked Register Inventory

| Register | Prefix | Count | Purpose |
|---|---|---|---|
| Features | F-* | **173** | Feature register |
| Business Rules | BR-* | **246** + 8 MIG | Business rules |
| Journeys | J-* | **31** | User journeys |
| Workflows | WF-* | **66** | Workflows |
| State Machines | — | **53** | State machines |
| Product Principles | P-* | **11** | Immutable principles |
| UX Principles | U-* | **12** | UX principles |
| Invariants | INV-* | **16** | Non-negotiable invariants |
| Scope Guardrails | SCOPE-* | **8** | Scope limits |
| Analytics Events | EVT-* | **72 locked + 20 proposed** | Event dictionary |
| Service Contracts | SCI-* | **54** | Service contracts |
| Interface Contracts | CON-* | **16** | Interface contracts |
| ADRs | ADR-* | **13** | Architecture decisions |
| Technical Defaults | TD-* | **26** | Technical defaults |
| Founder Decisions | FC-* | **23** | Ratified decisions |
| Open Decisions | OD-* | **58** | Open decisions |
| Blockers | DOR-* | **26** | Pre-implementation blockers |
| Verification Gates | VER-* | **27** | Verification gates |
| Production Gates | PROD-* | **24** | Go-live gates |
| Runbooks | R-* | **24** | Operational runbooks |
| Hardening Controls | HDN-* | **32** | Security controls |
| Failure/Edge Cases | FEC-* | **32** | Failure register |
| Edge Cases | EC-* | **48** | Edge-case matrix |
| UX States | UXC-* | **28** | UX completeness |
| NFRs | NFR-* | **21** | Non-functional requirements |
| Modules | — | **52** | Functional modules |
| Operational Tables | — | **~220** | Non-canonical tables |

### 42.2 Change Classes (C1–C7)

| Class | Examples | Approval |
|---|---|---|
| C1 Trivial | Typo, copy | Auto-merge on CI green |
| C2 Code change | Feature PR, fix | One approving review |
| C3 Schema/data | Migration, RLS policy | Two approvals; Founder for destructive |
| C4 Dependency | New dep, major upgrade | Two approvals |
| C5 Config/secret | Env var, provider key | Founder for secrets |
| C6 Architecture | Stack, provider | Founder sign-off (formal ADR) |
| C7 Commercial | Pricing, entitlement | Founder sign-off only |

### 42.3 Register-Integrity Invariant

> [!IMPORTANT]
> No register count may be modified, reordered, or deleted without a ratified C3 change. Additive families only. Any change to a locked register is a C3 change and must be recorded in the governance ledger.

---

---

## 25. Governance, Traceability & SSOT Maintenance

### One canonical definition

Features, roles, journeys, business rules, APIs, entities, architectural decisions, metrics, and terminology each have one authoritative definition. Other sections reference it instead of re-defining it.

### Traceability

```text
BUSINESS OUTCOME → USER NEED → JOURNEY → FEATURE → REQUIREMENT → DATA/API/EVENT → IMPLEMENTATION → TEST → RELEASE GATE
```

Cross-cutting traceability includes permission, privacy, security, observability, and analytics.

### Change discipline

Material changes must update dependencies, tests, analytics, migrations, operational controls, and documentation. Deprecated decisions remain only as history/provenance, not active architecture.

### Completion gate

A feature may be labeled implemented only when current executable evidence supports it. Specification completeness is separate from implementation completion.

---

## 26. Canonical Glossary

| Term | Definition |
|---|---|
| **ATS** | Applicant Tracking System |
| **ADR** | Architecture Decision Record |
| **B2B2C Flywheel** | Institution → independent candidate pipeline |
| **BYO AI Key** | User-supplied AI provider key |
| **ContentItem** | Polymorphic lesson container |
| **Credential** | Verified proof of skill (F-96) |
| **Domain Event** | Immutable `<aggregate>.<past_tense>` outbox record |
| **Emerging Skill** | New skill with growing market signals (F-118) |
| **Expert Network** | Verified advisors for consultation (F-108) |
| **FERPA** | US Family Educational Rights and Privacy Act |
| **Graduation Transition** | Managed learner → independent candidate |
| **Human-in-the-Loop** | AI never acts alone on consequential decisions |
| **Interview Assessment** | Structured technical/behavioral evaluation (F-88) |
| **License Pool** | Institutional purchase of N seats |
| **Managed Learner** | Institutional tenant user |
| **MediaSource** | Provider-agnostic media reference |
| **PII** | Personally Identifiable Information |
| **Provider Adapter** | Plugin for one media provider |
| **Readiness Score** | Per-role score of candidate readiness (F-91) |
| **Reputation Engine** | Multi-context reputation system (F-144) |
| **RLS** | Row Level Security |
| **Salary Aggregate** | k-anonymized benchmark (F-86) |
| **Skill Evidence** | Verified proof of skill (F-96) |
| **Skills Graph** | Semantic model of skills (F-84) |
| **SSOT** | Single Source of Truth — this document |
| **Tenant Isolation Tier** | T1/T2/T3/T4 |
| **TIG** | Talent Intelligence Graph |
| **UOM** | Universal Object Model |
| **Verified Signal** | Platform-earned credential |
| **Warm Introduction** | Intro via mutual connection (F-121) |
| **Web OS / Talent OS** | Application-architecture metaphor |
| **XP** | Experience Points |

---

---

## Appendix A — Conflict Adjudications

| ID | Conflict | Adjudication |
|---|---|---|
| D-1 | Daily XP cap 200 vs 5,000 | 200 XP/day canonical |
| D-2 | Job expiry 45d vs 60d | Configurable, default 60 days |
| D-3 | Duplicate application lifetime vs 90-day | Partial UNIQUE over ACTIVE + 90-day cooldown |
| D-4 | Referral reward on completion vs hire | Two distinct milestones |
| D-5 | SCOPE count 10 vs 8 | 8 canonical |
| D-6 | Register count divergence | Locked at §42.1 counts |
| D-7 | BR-091+ double-assignment | Independence BR-091..105; parity BR-106..121 |
| D-8 | EVT double-assignment | Locked ranges retained |
| D-9 | Module 25/26 triple-definition | Single numbering |
| D-10 | F-53+ double-assignment | S-12 governs |
| D-11 | SCI-09+ double-assignment | Migration renumbered SCI-19..25 |
| D-12 | Operational-table name drift | Canonical names per §24.2 |
| D-13 | AUTH-019 phantom | AUTH-016 in register |
| D-14 | VER-ID-001 collision | Folded into IDV-001..002 |
| D-15 | FC-19 "Phase 3" vs "Phase 6" | Phase 6 governs |
| D-16 | Non-negotiable rule #11 collision | LinkedIn rule = #16 |
| D-17 | Parity/migration phase placement | Harmonized |
| D-18 | S-15 gap IDs vs S-12 families | GAP-031..038 |
| D-19 | OD register double-definition | Recovered; OD-01..053 |
| D-20 | Seat-revocation grace vs licence-expiry grace | Distinct |
| D-21 | WCAG 2.1 vs 2.2 | 2.2 AA canonical |
| D-22 | Early FC-18 patch counts vs expanded | Expanded govern |
| D-23 | `proctoring_sessions` dropped | Retained (Ph10, F-45) |
| D-24 | `b2b_invoices` vs canonical | Folded |
| D-25 | XP dual-value retained vs 5,000 | 200/day single cap |
| D-26 | F-62/F-63 gap analysis says NOT RECOMMENDED | Confirmed decision-gated |
| D-27 | F-99 vs F-11 | F-11 base; F-99 Ph4 enhancement |
| D-28 | F-115 vs F-77 | Both retained; F-115 extends F-77 |
| D-29 | F-116 vs §36 | F-116 = feature entry; §36 = platform-wide gate |
| D-30 | New operational tables → canonical lock | All new non-canonical; 50+2 unchanged |
| D-31 | F-89 contribution verification scope | GitHub/GitLab only; no scraping |
| D-32 | Q&A gets dedicated tables vs reuse posts | Dedicated tables |
| D-33 | Course commerce extends BILL | Extends; no new stack |
| D-34 | Programs vs roadmaps vs cohorts vs batches | Each has distinct role |
| D-35 | "No shadows" vs focus ring | Focus ring retained; decorative shadows deprecated |
| D-36 | "One color" vs semantic hues | Indigo sole accent; muted semantic icons |
| D-37 | "<150ms" vs 320ms emphasis | 80/120/150ms; emphasis deprecated |
| D-38 | "13px/32px" vs mobile 44px | Scoped to ≥1024px |
| D-39 | Single-key shortcuts vs WCAG 2.1.4 | Context-focus only; remappable; disableable |

---

## Appendix B — Register Corrections

| Register | Correction |
|---|---|
| SCOPE | 10 → 8 (corrected) |
| HDN | 16 → 32 |
| FEC | 14 → 32 |
| EC | 17 → 48 |
| UXC | 15 → 28 |
| VER | 20 → 27 |
| PROD | 20 → 24 |
| R | 15 → 24 |
| DOR | 19 → 26 |
| TD | 18 → 26 |
| FC | 17 → 23 |
| ADR | 8 → 13 |
| BR | 90 → 246 |
| F | 65 → 173 |
| Modules | 24 → 52 |
| J | 17 → 31 |
| WF | 23 → 66 |
| EVT | 48 → 72 (32 locked + 40 proposed) |
| SCI | 18 → 54 |
| NFR | 7 → 21 |
| Q | 19 → 34 |

---

## Appendix C — Zero-Trust Rules

No assumption of implementation for: 26 microservices · 846 tests · 28 E2E specs · 50 tables · 119 RLS policies · `routeRegistry.ts` · Aura tokens · Supabase Auth config · Stripe webhooks · email delivery · AI service contract · any table/RLS policy · Realtime delivery · Chrome extension · JWT role claims · managed hosting provider ISR · file uploads · accessibility · GDPR flows · webhook idempotency · **documentation is reality**. Truth is: code → tests → migrations → served behavior.

---

---

## Appendix D — UX Micro-Interaction Register (100 Patterns)

The following patterns are a single canonical micro-interaction reference. Apply them to the feature specifications rather than copying their text into individual features.

## §UX-MICRO-01 — Loading & Waiting

*The video's topic. Waiting is the single most common UX failure because it's the one designers forget to design.*

### M-01 · The Spinner Tax

**Symptom:** A generic rotating circle appears where content should be. User has no idea what's coming, how big it will be, or whether the page is even working.
**Cost:** Perceived load time increases by 30–50% vs. skeleton screens (Nielsen Norman Group). Users abandon when they can't predict what's coming.
**Fix:** Replace every content-area spinner with a **skeleton screen** that mirrors the final layout — same number of rows, same approximate widths, same image blocks. Spinner is reserved only for *sub-200ms* operations where a skeleton would flash.
**Applies to:** Job list, course catalog, profile view, feed, application list, notification center, admin tables, institutional analytics.
**Acceptance:** Every content surface in §UXC-004 through §UXC-028 has a defined skeleton state. Zero spinners in content areas. Skeleton appears <100ms, disappears <50ms after data arrives.

---

### M-02 · The 100ms Rule

**Symptom:** User clicks "Apply" or "Submit" or "Save." Nothing happens for 400ms. They click again. Now the form submits twice, or the button state is ambiguous.
**Cost:** Double-submissions, duplicate records, user anxiety, and support tickets.
**Fix:** Every button that triggers a mutation must give **visual feedback within 100ms** (Miller's response-time threshold) — a pressed state, a spinner *inside the button*, or an immediate state change — then **disable itself** until the response returns. Never rely on the round-trip to provide feedback.
**Applies to:** Apply, Submit, Save, Post, Publish, Enroll, Purchase, Send, Follow, Connect, Report, Refund, Approve, Reject.
**Acceptance:** `<Button>` component has a mandatory `pending` prop. Lint rule blocks mutation buttons without a pending state. 100ms verified via synthetic click test.

---

### M-03 · Layout Shift

**Symptom:** User goes to click "Apply," but a late-loading banner pushes the button down 40px, and their click lands on "Save Job" or an ad. They didn't get what they clicked.
**Cost:** Frustration, accidental actions, ad-click fraud (in the video's example), broken trust.
**Fix:** **Reserve space** for every late-loading element. Banners, images, video players, embedded content, and third-party widgets must declare their dimensions in layout before content arrives. Use `aspect-ratio`, `min-height`, or explicit skeleton heights.
**Applies to:** Job detail (salary widget, company logo), course player (video frame), profile (avatar, banner), feed (media, link previews), institutional dashboard (charts).
**Acceptance:** Cumulative Layout Shift (CLS) <0.1 on every route class (§35.2). Zero post-click element displacement in E2E tests.

---

### M-04 · Real Progress

**Symptom:** A progress bar shows "Loading…" with no percentage, no step, no ETA. User has no idea if this will take 5 seconds or 5 minutes.
**Cost:** Abandonment on long operations; duplicate submission attempts; support tickets asking "is it stuck?"
**Fix:** For any operation >2 seconds, show **three things simultaneously**: percentage complete, current step name, and estimated time remaining. For operations with defined steps (bulk import, migration, media transcode), show a **stepper** with completed/current/pending states.
**Applies to:** Bulk student import, migration engine, media transcode, large exports, institutional reports, contest scoring.
**Acceptance:** Operations >2s show all three metrics. Step names come from a centralized registry. ETA accuracy tracked post-launch (target ±30%).

---

### M-05 · Stream It

**Symptom:** User opens the jobs page. One slow query (e.g., company logos) freezes the entire page. The whole screen is blank for 3 seconds, then everything pops in at once.
**Cost:** Perceived load time = slowest request. Users blame the whole page for one slow part.
**Fix:** **Render the shell immediately** (navigation, page header, static chrome), then **fill regions independently** as their data arrives. Use React route-level code splitting and Suspense boundaries. Regions that fail to load show their own error state without affecting neighbors.
**Applies to:** Dashboard, profile, job detail, course detail, admin console, institutional analytics.
**Acceptance:** Every page has a defined shell + ≥2 independently streamed regions. One region failing never blanks the page. TTFB <800ms for the shell.

---

### M-06 · The Forever Spinner

**Symptom:** The spinner spins. And spins. And spins. There is no timeout, no error, no retry. The user closes the tab.
**Cost:** This is the one that loses the customer. No error, no exit — they just leave. Highest-severity UX defect.
**Fix:** **Every async operation needs a terminal state.** After 10 seconds, show "Taking longer than expected…" with a cancel option. After 30 seconds, fail with a specific error, correlation ID, and a retry button. Never leave a spinner spinning indefinitely.
**Applies to:** Every async operation in the platform — no exceptions.
**Acceptance:** Every `useQuery`/`useMutation`/fetch has a timeout. `error_code_catalog` contains a timeout entry. R-003 runbook covers mass-timeout incidents. Zero infinite spinners in staging soak test.

---

### M-07 · Optimistic Update With Rollback

**Symptom:** User clicks "Like" on a post. The heart fills instantly, then 400ms later it unfills because the server rejected it. No explanation.
**Cost:** User distrust; second-guessing whether their action "took"; abandonment of low-stakes interactions.
**Fix:** Optimistic updates must ship with a **visible rollback path**: on failure, show a small inline error ("Couldn't save. Retry?") *near the element*, not just a global toast. For high-stakes actions (Apply, Purchase, Submit), do NOT use optimistic UI — show explicit loading state and confirmation.
**Applies to:** Reactions, follows, bookmarks, saves, mutes, dismissals (optimistic OK). Applications, purchases, submissions (never optimistic).
**Acceptance:** Optimistic patterns documented per action type. Rollback UX tested with forced 500 response.

---

### M-08 · The Cold Start Problem

**Symptom:** First-time user lands on the dashboard. Everything is empty. No guidance, no next step. Just "No data" in six panels.
**Cost:** 40%+ of new users abandon within 2 minutes when the first screen is a void.
**Fix:** First-time users get a **guided empty state** — never a blank dashboard. Show 2–3 clearly labeled actions ("Complete your profile", "Take your first challenge", "Browse open roles"). Track which one they click. Adapt the second session based on their first action.
**Applies to:** Dashboard, jobs, courses, applications, portfolio, notifications, feed, institutional admin.
**Acceptance:** Every empty state has a primary CTA. First-session funnel instrumented (EVT-001 → first meaningful action). Target: 40% complete first action within 24h.

---

### M-09 · Stale-While-Revalidate

**Symptom:** User navigates back to a page they saw 5 minutes ago. It shows a spinner and re-fetches everything, even though nothing changed.
**Cost:** Perceived slowness on repeat visits; wasted bandwidth; unnecessary server load.
**Fix:** Show **cached data immediately** with a subtle "Refreshing…" indicator in the corner. Only escalate to a full skeleton if cache is >24h old or explicitly invalidated.
**Applies to:** Profile, feed, notifications, job list, course list, saved searches.
**Acceptance:** Repeat navigation within 5 minutes uses cache. Stale indicator appears only when revalidating. Manual refresh always available.

---

### M-10 · The Prefetch Whisper

**Symptom:** User hovers over a job card, clicks, waits 800ms for the detail page.
**Cost:** Every click feels 800ms slower than it needs to be.
**Fix:** Prefetch the **most likely next page** on hover (desktop) or on viewport entry (mobile). Prefetch budget: ≤2 pages per session, ≤100KB per prefetch. Do not prefetch on metered connections.
**Applies to:** Job cards → job detail; course cards → course detail; profile avatars → profile; notification items → target.
**Acceptance:** Prefetch hit rate >60% on desktop. Prefetch budget enforced. `navigator.connection.saveData` respected.

---

## §UX-MICRO-02 — Interaction Feedback

### M-11 · The Ghost Button

**Symptom:** User clicks a button. It does something, but there's no visual change. Did it work? Did I misclick?
**Cost:** User clicks again, or gives up.
**Fix:** Every interactive element has **four distinct visual states**: default, hover, active (pressed), focus. The active state must be *visually different* from default (not just a cursor change). Focus state must meet WCAG 2.4.13 (≥2px, 3:1 contrast).
**Applies to:** Every button, link, tab, card, menu item.
**Acceptance:** Aura `<Button>`, `<Link>`, `<Card>` components have all four states. Contrast measured. Zero elements missing states.

---

### M-12 · The Dead Zone

**Symptom:** User clicks the edge of a button, misses by 2px, nothing happens.
**Cost:** Micro-frustration repeated hundreds of times per session.
**Fix:** Every clickable element has a **minimum 44×44px tap target** on touch, **24×24px** on desktop (WCAG 2.5.8 AA). Use padding, not visual size, to expand the hit area when the visual is smaller.
**Applies to:** Icon buttons, close buttons, checkbox labels, table row actions, mobile nav items.
**Acceptance:** Automated audit reports zero violations on all routes. Manual spot-check on mobile.

---

### M-13 · Focus Never Lost

**Symptom:** User tabs through a form, a modal opens, and focus drops to the top of the page. Now they have to tab 40 times to get back.
**Cost:** Keyboard users abandon forms. Accessibility violation.
**Fix:** Modal opens → focus moves to the first focusable element. Modal closes → focus returns to the trigger. Content updates dynamically → focus stays anchored. Never silently move focus.
**Applies to:** Every modal, dialog, dropdown, drawer, popover.
**Acceptance:** `focus-return` test on every modal component. Keyboard-only sweep per release.

---

### M-14 · The Keyboard Shortcut Whisper

**Symptom:** User sees a button. It's fast to click. But there's a faster way they'll never discover.
**Cost:** Power users don't become power users; every action is mouse-dependent.
**Fix:** Show the shortcut **in the tooltip or as an inline kbd chip** on hover for common actions. `⌘K` for command palette, `Esc` to dismiss, `↑↓` for list navigation, `Enter` to open, `/` to focus search.
**Applies to:** Command palette, modals, list navigation, form submission, notification panel.
**Acceptance:** Every shortcut discoverable via tooltip or `/help`. WCAG 2.1.4 compliant (context-scoped, remappable, disableable).

---

### M-15 · The Tooltip That Never Comes

**Symptom:** User hovers over an icon-only button (e.g., "flag", "archive"). They wait. Nothing. They click. It does something unexpected.
**Cost:** Users avoid icon-only actions; features go unused.
**Fix:** Every icon-only button has a **tooltip within 300ms of hover** with a label (not a description). Add `aria-label` regardless of tooltip.
**Applies to:** All icon buttons: edit, delete, flag, share, mute, archive, filter, sort.
**Acceptance:** Zero icon-only buttons without `aria-label` or tooltip. Tooltip delay ≤300ms.

---

### M-16 · The Silent Success

**Symptom:** User saves their profile. Nothing happens. No toast, no state change, no confirmation.
**Cost:** User re-saves; refresh reveals it worked; trust eroded.
**Fix:** Every mutation has **explicit success feedback** — either a state change (button → "Saved ✓"), a toast, or an inline message. For major actions (application submitted, course enrolled, offer accepted), use a **full-screen or modal confirmation** with a clear next step.
**Applies to:** Every mutation.
**Acceptance:** Every `useMutation` has success UI. Toast duration ≥4s for info, ≥6s for actions requiring acknowledgment.

---

### M-17 · The Confirmation Circus

**Symptom:** User tries to delete a comment. Modal: "Are you sure?" Yes. Modal: "This cannot be undone." Yes. Modal: "Really?" Yes. User gives up.
**Cost:** Destructive actions feel hostile; users hesitate on everything.
**Fix:** **One confirmation** for reversible actions, **two** for irreversible ones. Use **soft delete with undo** for anything that can be recovered (comments, posts, drafts, saved items). Reserve hard confirms for truly irreversible ops (account deletion, license revocation, payout).
**Applies to:** Delete, archive, revoke, cancel, unsubscribe, leave.
**Acceptance:** Audit of all destructive actions. Reversible actions use undo toast. Hard confirms limited to a documented list.

---

### M-18 · The Optimistic Disable

**Symptom:** User clicks "Enroll." Button grays out. 800ms later it un-grays with an error. But the button *still says "Enroll"* — did it work or not?
**Cost:** Ambiguity; user retries; duplicate enrollment attempts.
**Fix:** Disabled state must show **what's happening**, not just gray out. Change the label ("Enrolling…") or add an inline spinner *inside* the button. Never leave a disabled button with its original label.
**Applies to:** Every async button.
**Acceptance:** No disabled button retains its original label. `pendingLabel` prop enforced in `<Button>`.

---

### M-19 · The Hover Heavy

**Symptom:** User moves the mouse across a dense list. Every row triggers a 200ms shadow animation. The screen vibrates.
**Cost:** Visual noise; users lose track of their cursor; motion-sensitive users feel ill.
**Fix:** Hover feedback must be **subtle and fast** (≤80ms per Dense Profile §5.4.1), not a 200–300ms shadow choreography. Change surface value, not shadow. No bounce, no spring. Honor `prefers-reduced-motion`.
**Applies to:** Table rows, list items, cards, menu items.
**Acceptance:** Every hover ≤80ms. Zero hover shadows on dense surfaces. Reduced-motion collapses to 0ms.

---

### M-20 · The Right-Click Menace

**Symptom:** User right-clicks a table row expecting native context menu. Gets nothing, or gets a truncated custom menu that fights the OS.
**Cost:** Platform-inconsistent feel; lost productivity; power-user frustration.
**Fix:** Do not **override** the native context menu unless you have a *richer* one (multiple typed actions the user needs). If you do, replicate expected items (Copy, Open in new tab) and label them clearly. If you don't have richer, leave native behavior alone.
**Applies to:** Table rows, list items, editable cells, code editors (where the arena uses Monaco's native menu).
**Acceptance:** Zero custom context menus without native-behavior parity. Right-click on Monaco uses Monaco's menu.

---

## §UX-MICRO-03 — Forms & Validation

### M-21 · The Silent Invalid

**Symptom:** User fills a form, clicks Submit. Nothing happens. No error, no highlight, no scroll. They can't find what's wrong.
**Cost:** Form abandonment; rage-submit; support tickets.
**Fix:** On submit failure, **scroll to the first invalid field**, **focus it**, and show an inline error. Add an **error summary** at the top of the form with anchor links to each invalid field.
**Applies to:** Every form with >3 fields.
**Acceptance:** Error summary present on every multi-field form. Focus moves to first invalid field on submit failure.

---

### M-22 · The Late Validation

**Symptom:** User types an email. On every keystroke: "Invalid email." They haven't finished.
**Cost:** Users feel scolded; validation feels hostile; users stop typing mid-form.
**Fix:** Validate on **blur**, not on keystroke. Re-validate on keystroke **only after the first error** (to clear the error as they fix it). Never show an error before the user has finished interacting with the field.
**Applies to:** Every text input, email, password, phone.
**Acceptance:** Zod schema wraps blur/change events distinctly. Zero keystroke-validated fields on first entry.

---

### M-23 · The Password Purgatory

**Symptom:** User types a password. Rule: "Must contain 8+ chars, 1 uppercase, 1 number, 1 symbol, no dictionary words, no repeats." No indication of which rule they've satisfied.
**Cost:** Password creation takes 4× longer; users pick weak passwords out of frustration.
**Fix:** **Live rule checklist** as the user types — each rule ticks off in real-time as satisfied. Show the checker *before* submission, not after. Never use CAPTCHA (use rate limiting per §30).
**Applies to:** Registration, password reset, password change.
**Acceptance:** Real-time password rule checklist on every password field. zxcvbn score shown as strength bar.

---

### M-24 · The Autosave Void

**Symptom:** User writes a long post/article/application. They assume it's saved. They close the tab. It's gone.
**Cost:** Catastrophic — user loses hours of work; never returns.
**Fix:** Autosave with **visible status** — "Saved 2s ago", "Saving…", "Saved draft". For long-form content (posts, articles, applications, course descriptions), autosave every 5s to localStorage + every 30s to server. On return, prompt: "We found a saved draft. Recover?"
**Applies to:** Post composer, article editor, application form, course builder, assignment submission, Q&A drafts.
**Acceptance:** Autosave status visible in every long-form editor. Draft recovery prompt tested for each surface.

---

### M-25 · The Required Field Mystery

**Symptom:** User fills out a form. Submits. Error: "field X is required." Wait — it was never marked required.
**Cost:** User feels tricked; trust eroded.
**Fix:** Mark all required fields with a **visible indicator** (asterisk or "required" label). If most fields are required, invert: mark *optional* fields and say "All fields required unless marked optional." Never surprise.
**Applies to:** Every form.
**Acceptance:** Zero required fields without visual marker. Screen readers announce required state.

---

### M-26 · The Dropdown Dump

**Symptom:** User opens a "Country" dropdown with 195 options. No search. They scroll.
**Cost:** Form completion time × 10; abandonment on long lists.
**Fix:** Any list >15 options gets a **searchable combobox**. Country, language, skill, category, industry, company — all searchable. Alphabetical or frequency-sorted. Keyboard-navigable.
**Applies to:** Country, city, skill, category, industry, language, currency, company, org.
**Acceptance:** Every select >15 options is a combobox with search. Combobox a11y conformance verified.

---

### M-27 · The Focus Trap Escape

**Symptom:** User opens a modal, tabs through it, and focus escapes to the background page. Now the modal is still open, but the user is interacting with the hidden page behind.
**Cost:** Accessibility failure; keyboard users lose their place.
**Fix:** Modals must **trap focus** until closed. Tab from last element → first element (wrap). Shift+Tab from first → last. Escape closes. Focus returns to trigger.
**Applies to:** Every modal, dialog, drawer, sheet.
**Acceptance:** Focus trap test on every modal component. Zero escape in automated test.

---

### M-28 · The Field Re-Entry

**Symptom:** User enters shipping/billing info. Next step: "Re-enter your address."
**Cost:** WCAG 3.3.7 violation (Redundant Entry); user frustration.
**Fix:** Never ask for the same information twice. Prefill from profile, previous entry, or saved data. If a "different billing address" case exists, default to "same as above" with an opt-in to change.
**Applies to:** Application forms, checkout, institutional import, event registration.
**Acceptance:** Zero redundant fields across multi-step forms. WCAG 3.3.7 conformance evidence.

---

### M-29 · The Destructive Default

**Symptom:** User opens a "Clear filters" dropdown. The default highlighted option is "Reset all". They hit Enter.
**Cost:** Accidental data loss; user has to rebuild their filters.
**Fix:** The **safe option is the default**. Destructive actions are never the default-focused element. Confirm destructive actions explicitly. Provide undo where possible.
**Applies to:** Filter reset, form reset, bulk actions, leave-without-save.
**Acceptance:** Default-focus audit of every dropdown and menu. Zero destructive defaults.

---

### M-30 · The Copy-Paste Punishment

**Symptom:** User's password manager tries to fill the password field. It's blocked. Or they paste a TOTP code and it doesn't work.
**Cost:** WCAG 3.3.8 violation (Accessible Authentication); user cannot use their tools.
**Fix:** **Allow paste** in all fields. Never block paste. Never block password managers. Never require CAPTCHA as a gate. TOTP fields accept pasted codes (and handle spaces).
**Applies to:** Login, registration, TOTP, recovery codes, any input.
**Acceptance:** `onPaste` never prevented. Password manager autofill works. TOTP accepts paste.

---

## §UX-MICRO-04 — Empty States

### M-31 · The Empty Void

**Symptom:** User goes to "Saved Jobs." Blank page. No text, no CTA. "Is this broken?"
**Cost:** User assumes the feature doesn't work; doesn't discover the feature.
**Fix:** Every empty state has: **illustration or icon**, **one-sentence explanation**, **primary CTA** to the next action. Never blank. Never just "No data."
**Applies to:** Every list, every table, every dashboard panel.
**Acceptance:** Every list has a designed empty state. Empty state CTA is a primary button.

---

### M-32 · The Empty Dashboard

**Symptom:** New user logs in for the first time. Dashboard shows 6 empty widgets, no guidance, no next step.
**Cost:** 40%+ abandon within 2 minutes.
**Fix:** **First-session dashboard is different** from the steady-state dashboard. Show 3 guided actions with progress indicators. Adapt the second session based on what they did first.
**Applies to:** Candidate dashboard, recruiter dashboard, institution dashboard, admin console.
**Acceptance:** First-session variant defined per role. Tracked via `first_meaningful_action` event.

---

### M-33 · The Search That Finds Nothing

**Symptom:** User searches "React developer remote." Zero results. Blank screen. No suggestion.
**Cost:** User assumes no jobs exist; leaves.
**Fix:** Zero-result searches get **recovery UX**: "No matches for [query]. Try: [related term 1], [related term 2], [relax this filter]." Suggest relaxed filters, related skills, broader locations.
**Applies to:** Job search, course search, people search, company search, salary search.
**Acceptance:** Zero-result state has ≥2 recovery options. Search analytics track query→zero-result rate (target <10%).

---

### M-34 · The Permission Denied Void

**Symptom:** User navigates to a page they don't have access to. 404, or worse, a blank screen.
**Cost:** User thinks the platform is broken, not that they lack access.
**Fix:** Permission-denied is **explicit and actionable**: "You don't have access to this page. [Request access] or [Return to dashboard]." Never 404 on a permission issue. Never blank.
**Applies to:** Admin routes, institutional routes, recruiter-only views, org-scoped resources.
**Acceptance:** Zero 404s on permission-denied. Every denied state has a contact/request path.

---

### M-35 · The "Coming Soon" Black Hole

**Symptom:** User clicks a menu item. "Coming soon." No timeline, no alternative.
**Cost:** User perceives the product as incomplete; trust erodes.
**Fix:** Either **hide** the feature entirely (cleaner), or show a **waitlist/notify-me** option with a realistic timeline. Never show "Coming soon" without a way to be notified.
**Applies to:** Deferred features, OD-gated items, Phase 8+ surfaces.
**Acceptance:** Zero "coming soon" without an email capture. Feature flags hide deferred surfaces by default.

---

### M-36 · The Draft Graveyard

**Symptom:** User wrote a post draft months ago. It's still there, halfway done, cluttering their drafts list.
**Cost:** Clutter; user feels bad about "unfinished work"; abandonment of the composer.
**Fix:** Auto-archive drafts after 30 days of no edit. Send a "Still working on this?" nudge at day 25. Draft archived, not deleted — one-click restore.
**Applies to:** Post drafts, article drafts, application drafts, migration imports.
**Acceptance:** Auto-archive job runs daily. Nudge at day 25. Restore path tested.

---

### M-37 · The Emptied Notification Center

**Symptom:** User clears all notifications. Blank screen. No satisfaction, no direction.
**Cost:** Missed opportunity to re-engage; user leaves the page.
**Fix:** "You're all caught up" with a **suggested next action** — recent jobs matching your profile, new courses, unread messages, pending tasks. Empty notifications ≠ dead end.
**Applies to:** Notifications, messages inbox, task lists.
**Acceptance:** Every "all caught up" state has ≥1 next-action suggestion.

---

## §UX-MICRO-05 — Error Handling

### M-38 · The Blame-Free Error

**Symptom:** Error message: "Invalid input." What input? Which field? Why?
**Cost:** User cannot recover; abandons.
**Fix:** Every error message must: **(1) say what happened**, **(2) say why**, **(3) say what to do**. Never blame the user. Never use system jargon. Never expose a stack trace or correlation ID without explanation.
**Applies to:** Every user-facing error.
**Acceptance:** Error message audit per release. `error_code_catalog` maps every code to a human-readable message + action.

---

### M-39 · The Correlation ID Whisper

**Symptom:** Error: "Something went wrong. Reference: abc-123." User has no idea what to do with that.
**Cost:** User cannot self-recover; support ticket volume increases.
**Fix:** Every error page shows a **correlation ID** with a **copy button** and the text "Quote this ID if you contact support." Pair with a **retry button** and a link to support. Never show a raw ID without context.
**Applies to:** All error pages (500-class, timeout, dependency failure).
**Acceptance:** Every error surface has copy-ID button + retry + support link.

---

### M-40 · The Retry That Doesn't

**Symptom:** Error page says "Try again." User clicks. Same error, immediately, with no additional info.
**Cost:** User loses trust in the retry affordance; abandons.
**Fix:** Retry must **have a chance of succeeding**. If the underlying dependency is down, retry waits (backoff) or explains ("Our payment provider is temporarily unavailable"). Never offer retry on a non-retryable error.
**Applies to:** Dependency failures, timeouts, 5xx.
**Acceptance:** Retry button only on retryable errors. Non-retryable errors offer alternate paths.

---

### M-41 · The Hostile Validation

**Symptom:** Error: "Username already taken." User rage-quits because they spent 5 minutes crafting a username.
**Cost:** Form abandonment; user feels unwelcome.
**Fix:** Validation errors are **constructive, not accusatory**. For taken usernames, suggest alternatives ("Try: raj_2026, raj_dev, raj.codes"). For weak passwords, show what's missing, not just "too weak". For invalid emails, say "This doesn't look like an email address. Check for typos."
**Applies to:** Every validation error.
**Acceptance:** Zero errors that only state "invalid" or "taken." Every error offers a next step.

---

### M-42 · The Offline Blame

**Symptom:** User is on a train. They try to post. Error: "Something went wrong." No indication that they're offline.
**Cost:** User blames the platform; doesn't understand why posting failed.
**Fix:** Detect `navigator.onLine`. When offline, show explicit "You're offline. We'll send this when you're back." Queue the action. When back online, execute automatically.
**Applies to:** Post composer, message send, form submission, comment.
**Acceptance:** Offline banner visible. Offline actions queued. Auto-retry on reconnection.

---

### M-43 · The Partial Failure

**Symptom:** User bulk-imports 500 students. 487 succeed, 13 fail. The screen says "Import complete." The 13 failures are invisible.
**Cost:** Silent data loss; user doesn't know which records to fix.
**Fix:** Bulk operations report **explicit partial-success state**: "487 of 500 imported. 13 failed. [Download error report]." Never say "complete" when partial. Never hide failures.
**Applies to:** Bulk import, bulk actions, migration, batch assignment, bulk exports.
**Acceptance:** Every bulk operation has a partial-success UI state. Error report downloadable as CSV.

---

### M-44 · The Cascading Failure

**Symptom:** User tries to view a job. The page errors because the *salary widget* failed. The whole job detail is gone.
**Cost:** One failure breaks everything; user can't access the primary content.
**Fix:** **Isolate failures per region.** The job description should still render even if the salary widget fails. Each region has its own error boundary with a degraded state.
**Applies to:** Any page with multiple data sources.
**Acceptance:** Every page has ≥2 error boundaries. Region failure never blanks the page.

---

### M-45 · The Angry Error Color

**Symptom:** A minor warning (e.g., "This job posting expires in 3 days") is shown in the same red as a fatal error. User panics.
**Cost:** Users can't distinguish severity; real errors get lost in the noise.
**Fix:** **Severity-appropriate color.** Error (red, danger) for blocking failures. Warning (amber) for attention-needed. Info (blue/neutral) for context. Success (green) for confirmations. Never use red for non-errors.
**Applies to:** All messaging surfaces.
**Acceptance:** Severity-color mapping enforced in Aura tokens. Zero red non-errors.

---

### M-46 · The Error Without Exit

**Symptom:** User hits a 403. Page shows error. No navigation, no back button visible, no link to home.
**Cost:** User is trapped; closes tab.
**Fix:** Every error page has **≥2 exit paths**: back, home, contact support, retry, or an alternative action. Never a dead-end error.
**Applies to:** 403, 404, 500, timeout, dependency-failure pages.
**Acceptance:** Zero dead-end error pages. Every error has exit paths.

---

### M-47 · The Auto-Dismiss Surprise

**Symptom:** User is reading a toast. It disappears in 3 seconds before they can read it. Or worse, the toast contains the only "Undo" button.
**Cost:** Missed critical info; missed undo; accidental deletion.
**Fix:** Info toasts auto-dismiss after ≥6s. Action toasts (with Undo) **never auto-dismiss** — they require explicit dismissal. Critical errors never auto-dismiss. Hovering a toast pauses its timer.
**Applies to:** All toasts.
**Acceptance:** Action toasts require manual dismiss. Hover pauses timer. No auto-dismissal for errors.

---

### M-48 · The Silent Failure

**Symptom:** User clicks something. Nothing happens. No error, no loading, no state change. Just nothing.
**Cost:** User cannot determine if it worked; retries; double-submits; loses trust.
**Fix:** **Every click produces visible feedback within 100ms** (see M-02). If the click did nothing, either disable the element or remove it. Never a silent no-op.
**Applies to:** Every interactive element.
**Acceptance:** Automated click test on every button verifies state change within 100ms.

---

## §UX-MICRO-06 — Notifications & Toasts

### M-49 · The Toast Avalanche

**Symptom:** User performs a bulk action. 47 toasts cascade down the screen, each stacking on top of the last.
**Cost:** Visual chaos; important messages buried; users dismiss without reading.
**Fix:** **Group related toasts.** "47 items archived" — one toast with a "View details" link. Max 3 concurrent toasts. Queue the rest. Never stack more than 3 visually.
**Applies to:** Bulk actions, batch operations, multi-item processes.
**Acceptance:** Toast grouping implemented. Max 3 concurrent. Queue accessible.

---

### M-50 · The Toast That Blocks

**Symptom:** User is about to click "Submit" but a toast is covering the button.
**Cost:** Accidental toast dismissal; missed submission.
**Fix:** Toasts appear in a **non-blocking position** — bottom-right or top-right, never over primary CTAs. Never full-width. Never center-screen. Respect safe zones.
**Applies to:** All toasts.
**Acceptance:** Toast position never overlaps primary actions. Verified by screenshot test.

---

### M-51 · The Notification Flood

**Symptom:** User gets 12 notifications in 5 minutes. Follow, comment, mention, reaction, follow, comment…
**Cost:** Notification fatigue; user disables notifications entirely.
**Fix:** **Group and coalesce** (NTF-012). "3 people reacted to your post." "2 new comments." "5 new followers." Digest when >5 events in 15 minutes. Never one notification per event when events cluster.
**Applies to:** Social notifications, community notifications, course announcements.
**Acceptance:** Grouping rules per event type. Digest threshold configurable. Verified in staging.

---

### M-52 · The Email That Never Arrives

**Symptom:** User requests a password reset. Nothing arrives. They check spam — nothing.
**Cost:** User cannot access account; support ticket; potential churn.
**Fix:** After sending, show **explicit confirmation**: "We sent a reset link to raj@example.com. Check your spam folder if it doesn't arrive within 2 minutes." Add a "Resend" button (rate-limited) after 30 seconds.
**Applies to:** Password reset, verification email, job alert email, digest.
**Acceptance:** Every email-triggering action shows recipient + spam guidance + resend.

---

### M-53 · The Unsubscribe Maze

**Symptom:** User wants to unsubscribe from emails. Link goes to a "preferences" page requiring login, then a settings page, then a modal.
**Cost:** User marks as spam; sender reputation damaged; legal compliance risk.
**Fix:** **One-click unsubscribe** (RFC 8058). Link in email footer directly unsubscribes without login. Confirm on-page. Offer "Adjust preferences" as optional next step, never as required.
**Applies to:** Newsletters, digests, marketing, job alerts.
**Acceptance:** One-click unsubscribe per email. RFC 8058 compliance verified.

---

### M-54 · The Silent Notification

**Symptom:** User receives an important notification (offer received, application rejected) but there's no visual or audible signal. They miss it.
**Cost:** Missed opportunities; user blames platform.
**Fix:** Critical notifications (application status, offer, hire, message) get **in-app toast + email + optional push**. Ambient notifications (reactions, follows) get in-app only. Never silent for time-sensitive items.
**Applies to:** Application status, offers, messages, mentorship requests, license expiry.
**Acceptance:** Notification matrix per §2.6. Critical = multi-channel; ambient = in-app only.

---

### M-55 · The Badge That Lies

**Symptom:** Notification badge shows "3" but opening the panel shows "0 new". Or badge shows "0" but there's an unread message.
**Cost:** User loses trust in the badge; ignores notifications.
**Fix:** Badge count **must match actual unread**. Reconcile on every panel open. Server-authoritative count. Never optimistic count that can drift.
**Applies to:** Notification bell, messages badge, unread count anywhere.
**Acceptance:** Badge-count reconciliation test. Zero drift in soak test.

---

## §UX-MICRO-07 — Navigation & Wayfinding

### M-56 · The Unsaved Warning

**Symptom:** User has a half-filled application form. They click a nav link. Form is gone. No warning.
**Cost:** Data loss; user rage-quits.
**Fix:** Before navigating away from a dirty form, show a **confirmation dialog**: "You have unsaved changes. Leave anyway?" This applies to back button, nav clicks, external link clicks, and refresh (beforeunload).
**Applies to:** Application forms, course builder, post composer, profile edits, migration wizard.
**Acceptance:** Dirty-form guard on every form with >5 fields. Back/refresh/nav all intercepted.

---

### M-57 · The Breadcrumb Void

**Symptom:** User navigates deep: Jobs → Senior Engineer at Acme → Apply. They want to go back to the job detail. No breadcrumb.
**Cost:** User clicks browser back repeatedly; loses context.
**Fix:** Every page deeper than 2 levels shows a **breadcrumb**. Even better: a "Back to [parent]" link near the page title.
**Applies to:** Job detail, course detail, application detail, profile detail, admin detail pages.
**Acceptance:** Breadcrumb on every detail page. Parent link tested.

---

### M-58 · The Modal Inception

**Symptom:** User opens a modal. Inside it, a link opens another modal. Inside that, another.
**Cost:** User loses context; cannot close; UX trap.
**Fix:** **Modals never open other modals.** If a flow needs multiple steps, use a single modal with a stepper, or navigate to a full page. Escape always closes the *current* thing.
**Applies to:** Every modal.
**Acceptance:** Zero nested modals. Escape handling tested.

---

### M-59 · The Back Button Betrayal

**Symptom:** User clicks browser back. Instead of going to the previous page, they get logged out, or land on the login page, or the app redirects them to the dashboard.
**Cost:** User loses their place; breaks browser expectations.
**Fix:** Back button must **respect browser history**. Never intercept back to redirect. If a user is on a page they shouldn't be on (e.g., logged out), back takes them to the previous valid page, not home.
**Applies to:** All routes.
**Acceptance:** Browser back behavior tested per route. No forced redirects.

---

### M-60 · The Deep Link Surprise

**Symptom:** User shares a job link on WhatsApp. Friend clicks it. Gets "You must log in." Logs in. Lands on the dashboard, not the job.
**Cost:** Broken sharing; lost viral loop.
**Fix:** Deep links **preserve destination**. Login page accepts `?return=` param. Post-login redirect honors it. Never drop the destination.
**Applies to:** Jobs, courses, profiles, posts, articles, events.
**Acceptance:** Deep-link login flow tested. `return` param preserved.

---

### M-61 · The Mobile Menu Maze

**Symptom:** On mobile, user taps the hamburger. 40-item menu drops down. They can't find anything.
**Cost:** Mobile usability collapses; feature discovery dies.
**Fix:** Mobile nav shows **5 primary items max** (bottom tab bar). Everything else lives in a "More" sheet or search. Group by task, not by module.
**Applies to:** Mobile navigation for all roles.
**Acceptance:** Bottom nav ≤5 items on mobile. All major flows reachable in ≤3 taps.

---

### M-62 · The Active State Amnesia

**Symptom:** User is on the "Jobs" page but the sidebar shows "Dashboard" as active. They're lost.
**Cost:** User can't tell where they are.
**Fix:** Active state matches the **current page**, not the last clicked link. Sub-routes activate their parent (`/jobs/[id]` → "Jobs" active). Persistent across reloads.
**Applies to:** Sidebar, top nav, tab bars.
**Acceptance:** Active state test on every route. Sub-route parent activation verified.

---

### M-63 · The Search Bar Disappearing Act

**Symptom:** User is on a list page. They scroll down. The search bar scrolls away. They have to scroll up to search again.
**Cost:** Repeated scrolling; frustration on long lists.
**Fix:** Search bar **sticky at top** on list pages. Same for filter controls. The controls stick; the content scrolls.
**Applies to:** Job list, course list, application list, people search, admin tables.
**Acceptance:** Sticky search/filters on every list page. Sticky behavior tested.

---

### M-64 · The Modal Escape

**Symptom:** User opens a modal, presses Escape, nothing happens. Or it closes the wrong thing.
**Cost:** Users feel trapped in modals.
**Fix:** **Escape always closes the topmost dismissible layer.** This is universal. Escape on a modal closes the modal. Escape on a dropdown closes the dropdown. Escape on a form with a dirty state shows the confirmation. Never let Escape do nothing.
**Applies to:** Every dismissible layer.
**Acceptance:** Escape handler on every modal, dropdown, drawer. Tested via keyboard-only sweep.

---

## §UX-MICRO-08 — Data Freshness & Concurrency

### M-65 · The Stale Data Trap

**Symptom:** User has the jobs page open in one tab. Recruiter changes salary in another. User applies at old salary. Contract disputes.
**Cost:** Legal risk; user distrust.
**Fix:** Re-validate critical fields **at submission time**. If salary/role/dates have changed since the user last loaded the page, show a diff and require re-confirmation.
**Applies to:** Applications, purchases, offers, contract acceptance.
**Acceptance:** Pre-submit re-validation on every high-stakes form. Diff UI tested.

---

### M-66 · The Concurrent Edit Conflict

**Symptom:** Two admins edit the same course. Both save. Second save silently overwrites the first.
**Cost:** Silent data loss; user distrust.
**Fix:** **Optimistic concurrency** on every multi-user editable resource. On conflict, return 409 with a diff ("Someone else changed this. Review changes before saving."). Never silent overwrite.
**Applies to:** Course builder, org profile, institutional settings, admin config, job posting.
**Acceptance:** Version column on every concurrency-sensitive table. 409 on stale save.

---

### M-67 · The Stale Badge

**Symptom:** User's dashboard shows "5 new applications" but it was last refreshed 2 hours ago and there are actually 12.
**Cost:** User acts on stale information; trusts numbers less.
**Fix:** Any live-updating surface shows **last-updated timestamp** + a subtle refresh button. Never present stale data as fresh.
**Applies to:** Dashboard widgets, admin metrics, analytics, recruiter pipeline.
**Acceptance:** Every stale-able surface has last-updated timestamp. Manual refresh available.

---

### M-68 · The Refresh That Loses State

**Symptom:** User has filters applied, page 3 selected, sorted by date. They refresh. All filters reset.
**Cost:** User has to re-apply every filter; frustration.
**Fix:** Filters, sort, and pagination persist in **URL params**. Refresh preserves everything. Shareable via URL.
**Applies to:** Every list, search, and filterable surface.
**Acceptance:** All filter state in URL. Refresh preserves state. Shareable links work.

---

### M-69 · The Optimistic Avatar

**Symptom:** User uploads a new avatar. It shows immediately. 10 seconds later, it reverts because the server rejected it (bad format). No error.
**Cost:** User confused; thinks the avatar feature is broken.
**Fix:** Optimistic image uploads **require visible upload progress + success/failure feedback**. Show the new avatar as a *preview* (with a "processing" badge) until the server confirms. On failure, revert to old and show error.
**Applies to:** Avatar, cover, portfolio images, post media, course thumbnails.
**Acceptance:** Upload progress visible. Preview state shown until server confirm. Failure reverts.

---

### M-70 · The Save That Doesn't

**Symptom:** User clicks "Save" on a settings change. Button says "Saved ✓". User comes back tomorrow. The setting is back to default.
**Cost:** Silent data loss; trust collapse.
**Fix:** "Saved" means **server-confirmed**. Never show a success state until the server has acknowledged the write. If the write later fails (rare), retry silently and only surface to the user if retries exhaust.
**Applies to:** Every save action.
**Acceptance:** Success state only after server 200. Retry logic for transient failures.

---

### M-71 · The Optimistic Follow

**Symptom:** User follows someone. The button flips to "Following". 3 seconds later, it flips back. No explanation.
**Cost:** User doesn't know if they're following; may follow again; confuses the followed person.
**Fix:** Low-stakes optimistic updates (follow, react, bookmark) are OK, **but must show rollback**. A tiny inline "Couldn't follow. Try again." near the button. Never silent rollback.
**Applies to:** Follow, react, bookmark, save, mute, hide.
**Acceptance:** Silent-rollback audit. Every optimistic pattern has visible rollback.

---

## §UX-MICRO-09 — Motion & Transition

### M-72 · The Motion Sickness

**Symptom:** User has `prefers-reduced-motion: reduce` set. Page still plays a 400ms slide-in animation.
**Cost:** Accessibility violation; users with vestibular disorders experience nausea.
**Fix:** Honor `prefers-reduced-motion` **everywhere**. Collapse animations to 0ms or a simple opacity fade. Never override user preference.
**Applies to:** Every animation, transition, parallax, auto-play video.
**Acceptance:** Reduced-motion verification on every animated surface. Automated test enforces.

---

### M-73 · The Slow Fade

**Symptom:** User clicks a tab. Content takes 400ms to fade in. Feels sluggish.
**Cost:** Every interaction feels 400ms slower than it is.
**Fix:** **Motion is ≤150ms** (Dense Profile §5.4.1). Hover 80ms. Transitions 120–150ms. Never 300ms+ for utility interactions. Motion is for orientation, not decoration.
**Applies to:** Tabs, dropdowns, modals, page transitions, list updates.
**Acceptance:** Motion audit. All utility motion ≤150ms.

---

### M-74 · The Bouncy Button

**Symptom:** User clicks a button. It bounces. It overshoots. It settles. Adorable. Slow.
**Cost:** Playful ≠ professional. Reads as toys, not tools.
**Fix:** **No bounce, no spring, no overshoot.** Ease-out. Fast in, fast out. Motion conveys causality, not personality.
**Applies to:** Every interactive element.
**Acceptance:** Motion library audit. Zero spring/overshoot on utility transitions.

---

### M-75 · The Flash of Unstyled Content

**Symptom:** User loads the page. For 200ms, raw HTML with no CSS is visible. Then the stylesheet kicks in.
**Cost:** Perceived as broken/slow; trust damaged.
**Fix:** **Inline critical CSS** in the initial HTML. Load the rest asynchronously. Never let raw HTML flash. Server-render above-the-fold styles.
**Applies to:** Every page load.
**Acceptance:** Zero FOUC in Lighthouse CI. Critical CSS inlined.

---

### M-76 · The Jumpy Scroll

**Symptom:** User scrolls a list. New items load. The scroll position jumps up 200px because content was inserted above.
**Cost:** User loses their place; scrolls back down; frustration.
**Fix:** Never insert content **above** the current scroll position without compensating. Infinite scroll appends **below**. If content must be prepended, use scroll anchoring.
**Applies to:** Infinite lists, feeds, message threads, comments.
**Acceptance:** Scroll anchoring verified on every infinite list.

---

### M-77 · The Silent Transition

**Symptom:** User clicks "Next" in a multi-step form. The form changes. But there's no transition indicator — did it advance? Did it fail?
**Cost:** User hesitates; double-clicks; loses place.
**Fix:** Step transitions use a **subtle directional slide** (80–120ms) to communicate forward vs. backward motion. Progress bar updates. Never a hard cut.
**Applies to:** Multi-step forms, wizards, onboarding, checkout.
**Acceptance:** Directional transitions on every step-based flow.

---

### M-78 · The Autoplay Ambush

**Symptom:** User opens a course player. Video auto-plays at full volume.
**Cost:** Startles user; often mutes and never unmutes; dark pattern.
**Fix:** Video **never auto-plays with sound**. If autoplay is enabled (course player), it's **muted**. User opts into sound. No exceptions.
**Applies to:** Course player, interview recordings, event streams.
**Acceptance:** Autoplay muted-only. Unmute requires explicit user action.

---

## §UX-MICRO-10 — Mobile-Specific

### M-79 · The Tap Target Trap

**Symptom:** User taps a small "×" to close a modal. Misses. Taps again. Misses. Modal stays open.
**Cost:** Mobile usability collapses; users rage-close the app.
**Fix:** **44×44px minimum** for every tappable element on mobile. Use padding, not visual size. Close buttons in particular are often too small.
**Applies to:** Every tap target on every mobile surface.
**Acceptance:** Automated mobile a11y audit. Zero violations.

---

### M-80 · The Keyboard Cover

**Symptom:** User taps a text input near the bottom of the screen. The keyboard covers the input. They type blind.
**Cost:** Cannot complete the form; abandonment.
**Fix:** Scroll the focused input into view **above the keyboard**. Reserve space with `scroll-padding-bottom`. Never let the keyboard cover the active input.
**Applies to:** Every form on mobile.
**Acceptance:** Keyboard-cover test on iOS Safari + Android Chrome.

---

### M-81 · The Swipe Back Surprise

**Symptom:** On iOS, user swipes from left edge to go back. Instead of navigating back, they trigger a horizontal carousel or a menu drawer.
**Cost:** Breaks OS expectations; user confusion.
**Fix:** **Never intercept edge-swipe-back** unless the screen is a modal or full-screen sheet. Carousels start after 20px inset. Respect OS gestures.
**Applies to:** Every mobile screen.
**Acceptance:** Edge-swipe-back works on all non-modal screens.

---

### M-82 · The Slow Tap

**Symptom:** User taps a button. Nothing happens for 300ms. They tap again. Now two actions fire.
**Cost:** Double-actions; incorrect state.
**Fix:** On tap, **immediately** disable the button and show a pressed state. Don't wait for the API. 100ms rule (M-02) applies on mobile too.
**Applies to:** Every tappable action on mobile.
**Acceptance:** Mobile tap test on every action.

---

### M-83 · The Pull-to-Refresh Fight

**Symptom:** User pulls down to refresh. Instead of refreshing, they scroll up slightly and the page bounces.
**Cost:** Broken muscle memory; frustration.
**Fix:** Implement **pull-to-refresh** on every list surface. Match OS behavior — resistance curve, threshold, spring release.
**Applies to:** Job list, course list, feed, notifications, messages.
**Acceptance:** Pull-to-refresh on every list. Behavior matches native.

---

### M-84 · The Bottom Sheet Trap

**Symptom:** User opens a bottom sheet. Taps outside to dismiss. Sheet stays. Taps again. Nothing.
**Cost:** User feels trapped; closes the app.
**Fix:** Bottom sheets dismiss on **tap-outside + swipe-down + Esc**. Always. Even if the sheet has unsaved data, prompt before dismiss.
**Applies to:** Every bottom sheet, action sheet, half-modal.
**Acceptance:** Dismiss behavior tested on every sheet.

---

### M-85 · The Landscape Lobotomy

**Symptom:** User rotates phone to landscape. The layout breaks — elements overlap, buttons vanish, content is cut off.
**Cost:** Unusable in landscape; accessibility issue (users who can only use landscape).
**Fix:** Every screen **works in both orientations**. Or explicitly lock to portrait with a clear reason. Never silently break.
**Applies to:** Every screen (or documented portrait-lock list).
**Acceptance:** Landscape audit on every critical screen.

---

## §UX-MICRO-11 — Accessibility Micro-Details

### M-86 · The Invisible Focus Ring

**Symptom:** User tabs through a page. They can't see where focus is. Every element looks the same.
**Cost:** Keyboard users cannot navigate; accessibility failure.
**Fix:** **Visible focus ring on every focusable element** (2px solid, ≥3:1 contrast — WCAG 2.4.13). Never `outline: none` without replacement. Never a subtle 1px ring.
**Applies to:** Every focusable element.
**Acceptance:** Focus-visible audit. Contrast measured. Zero missing focus rings.

---

### M-87 · The Screen Reader Silence

**Symptom:** A toast appears. Screen reader says nothing. Content updates. Screen reader doesn't announce.
**Cost:** SR users miss all dynamic content.
**Fix:** Dynamic updates use `role="status"` (polite) or `role="alert"` (assertive). Toasts, validation errors, and loading completions all announce.
**Applies to:** Toasts, errors, loading completions, dynamic list updates.
**Acceptance:** SR announcement test on every dynamic surface. NVDA + VoiceOver.

---

### M-88 · The Heading Hierarchy Chaos

**Symptom:** Screen reader user navigates by heading. Page has h1, then h4, then h2. Confusing structure.
**Cost:** SR users cannot build mental model of the page.
**Fix:** **Logical heading hierarchy** on every page. One h1. No skipped levels. Every section has a heading.
**Applies to:** Every page.
**Acceptance:** Heading audit per release. Zero skips.

---

### M-89 · The Alt Text Void

**Symptom:** SR user lands on a page with 12 images. All say "image". No context.
**Cost:** Critical information inaccessible.
**Fix:** **Descriptive alt text** on every meaningful image. `alt=""` for purely decorative. Never `alt="image"`.
**Applies to:** Every image.
**Acceptance:** Alt-text audit. Zero unlabeled meaningful images.

---

### M-90 · The Form Label Void

**Symptom:** SR user tabs to an input. It says "edit text". No label. They don't know what to type.
**Cost:** Form unusable via SR.
**Fix:** Every input has a **programmatically associated label** (`<label for>`). Placeholders are not labels. ARIA labels for icon-only inputs.
**Applies to:** Every form input.
**Acceptance:** Label audit. Zero unlabeled inputs.

---

### M-91 · The Color-Only Cue

**Symptom:** Form error is shown by red border only. Colorblind user cannot see it.
**Cost:** WCAG 1.4.1 violation; form unusable.
**Fix:** Errors use **color + icon + text**. Never color alone. Same for success, warnings, and status indicators.
**Applies to:** Every status indicator, error, validation.
**Acceptance:** Color-only audit. Zero color-only indicators.

---

### M-92 · The Invisible Loading

**Symptom:** User clicks "Load more". Nothing visible changes. SR user doesn't know content is loading.
**Cost:** User thinks nothing happened; retries; confusion.
**Fix:** Loading states announce via `aria-live` or `aria-busy`. The button changes to "Loading…" with visible state.
**Applies to:** Load-more buttons, infinite scroll, async content.
**Acceptance:** Loading states announced. Verified via NVDA/VoiceOver.

---

### M-93 · The Skip Nav Absence

**Symptom:** Keyboard user lands on a page with 40 nav items. They have to tab through all of them to reach content.
**Cost:** Keyboard users take 40 tabs to reach main content.
**Fix:** **Skip-to-main-content link** is the first focusable element. Visible on focus.
**Applies to:** Every page.
**Acceptance:** Skip-nav present + working on every page.

---

### M-94 · The Reduced-Motion Ignore

**Symptom:** User has `prefers-reduced-motion` enabled. Progress bar still animates. Spinner still spins.
**Cost:** Motion-sensitive users feel ill.
**Fix:** Honor reduced-motion **everywhere**. Even spinners get a static "Loading…" text alternative.
**Applies to:** Every animated element.
**Acceptance:** Reduced-motion verification.

---

### M-95 · The Zoom Blocker

**Symptom:** User pinch-zooms to read text. Page doesn't zoom because `user-scalable=no`.
**Cost:** WCAG 1.4.4 violation.
**Fix:** **Never disable pinch zoom.** Never `user-scalable=no`. Never `maximum-scale=1`. Users have the right to zoom.
**Applies to:** Every page's viewport meta.
**Acceptance:** Viewport audit. Zero zoom-blocked pages.

---

## §UX-MICRO-12 — Performance Perception

### M-96 · The Perceived Speed Trick

**Symptom:** User waits for actual data to load. The page feels slow even if it's technically fast.
**Cost:** Perceived speed drives satisfaction more than actual speed.
**Fix:** **Prioritize perceived speed.** Skeleton first, then real content. Primary content above-the-fold loads first. Secondary content streams after. The user perceives the page as fast.
**Applies to:** Every content-heavy page.
**Acceptance:** Perceived-load-time measurement post-launch. Target: perceived <1.5s on 4G.

---

### M-97 · The Above-the-Fold First

**Symptom:** Page loads all content at once. Above-the-fold is delayed by below-the-fold.
**Cost:** User waits longer for what they see first.
**Fix:** **Above-the-fold content loads first, below-the-fold lazily.** Images below fold use lazy loading. Charts render only when scrolled into view.
**Applies to:** All long pages.
**Acceptance:** LCP <2.5s on mobile. Lazy loading verified.

---

### M-98 · The Image Optimization Gap

**Symptom:** User loads a page with 20 images. Each is a 4MB PNG.
**Cost:** Slow load; excessive bandwidth; higher bounce.
**Fix:** Images served in **WebP/AVIF** with responsive `srcset`. Lazy-loaded below fold. Compressed. CDN-served. Never serve a 4MB PNG for a 200×200 avatar.
**Applies to:** Every image.
**Acceptance:** Image audit. LCP image <200KB. All images modern format.

---

### M-99 · The Font Blink

**Symptom:** Page loads. Font flashes from system font to custom font. Text jumps.
**Cost:** Visual jank; perceived as broken.
**Fix:** Use `font-display: swap` and **preload critical fonts**. Subset fonts. Never load 12 weights of a variable font.
**Applies to:** Every custom font.
**Acceptance:** Zero font flash. Font preload verified.

---

### M-100 · The Bundle Bloat

**Symptom:** User loads the login page. They download 2MB of JavaScript for the entire app.
**Cost:** Slow load; wasted bandwidth; high bounce.
**Fix:** **Route-based code splitting**. Each route loads only its code. Shared code is cached. Never load the whole app on the first page.
**Applies to:** Every route.
**Acceptance:** Route bundles ≤200KB gzipped (§35.2). No shared bundle >150KB.

---
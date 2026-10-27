# Legacy Business-Rule Catalogue (BR-001 to BR-248 and MIG-01 to MIG-08)

Doc ID: BRC-LEG-01 · Owner: Business Analyst Lead (with Product Director) · Version 1.0 · Status: Draft for Review · Relates: `LEGACY_RULE_CROSSWALK.md` / `.csv`, `BUSINESS_RULES_REGISTRY.md` (BR-T series), `PRODUCT_INVARIANT_REGISTRY.md`, `OPEN_DECISIONS.md` (OPEN-43), `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` (OPEN-LGA-*), `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/registries/BUSINESS_RULE_REGISTRY.md`

## 0. How to read this catalogue

| Item | Statement |
|---|---|
| Frame | **Nothing is implemented.** The legacy registry (v6.0) belongs to a prior attempt. Every rule below is a **candidate requirement carried forward from that attempt**; none is adopted, none is verified, and none overrides the target `BR-T###` series in `BUSINESS_RULES_REGISTRY.md`. |
| Why this file exists | The crosswalk (`LEGACY_RULE_CROSSWALK.csv`) maps identities and dispositions but deliberately omits the full rule text. This catalogue keeps the **verbatim legacy rule text for all 248 + 8 rules in the target blueprint**, so the text survives independently of the archive folder. |
| Authority | Prior attempt declared `BR-001..BR-248` canonical and `MIG-01..MIG-08` as separate migration rules. Out-of-range `BR-` mentions in historical prose were treated there as stale unless ratified. Target position: identities are preserved; adoption is an owner decision (OPEN-43). |
| ID display | Legacy table printed `BR-01..BR-35` with two digits and `BR-036..BR-248` with three. The "Canonical ID" column normalises to three digits. Number similarity with the target `BR-T###` namespace is **not** evidence of equivalent meaning. |
| Disposition column | Taken from `LEGACY_RULE_CROSSWALK.csv` (exact / partial / conflict / superseded / no match). `no match` means "no semantically equivalent target rule found"; it does **not** mean the behaviour is retired. |
| Rule governance carried over | Rules are not duplicated inside feature prose; a feature references the relevant rule IDs. |
| Editorial groupings | The family headings below are **added by this merge** for navigation; the legacy table was a single flat list. |

Crosswalk totals (256 rows): exact 9 · partial 67 · conflict 8 · superseded 1 · no match 171.

## BR-001 to BR-008: Role-based authorization (legacy base set)

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-01 | BR-001 | Only `ROLE_RECRUITER`/`ROLE_ADMIN` may create/edit job postings | partial | BR-T035 |
| BR-02 | BR-002 | Only `ROLE_USER` may submit applications; recruiters may not apply | partial | BR-T038;BR-T001 |
| BR-03 | BR-003 | Candidates review own applications only; recruiters all for their companies | partial | BR-T062 |
| BR-04 | BR-004 | Only recruiters/admins create scorecards and notes | no match | (none) |
| BR-05 | BR-005 | User edits own profile only; admin any | partial | BR-T067 |
| BR-06 | BR-006 | Flags, audit, settings, user mgmt, moderation are admin-only | partial | BR-T041;BR-T042;BR-T045 |
| BR-07 | BR-007 | Billing actions available to recruiters, not users/admins | no match | (none) |
| BR-08 | BR-008 | Route-level RBAC matches shared route registry | no match | (none) |

## BR-009 to BR-020: Job and application lifecycle, drafts, notes

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-09 | BR-009 | Domain-level authorization backs state-changing commands | no match | (none) |
| BR-10 | BR-010 | Job publish-readiness rule server-validated | exact | BR-T035 |
| BR-11 | BR-011 | Job lifecycle: draft→pending_approval→approved→scheduled→published→paused→closed→archived | partial | BR-T035;BR-T036;BR-T037 |
| BR-12 | BR-012 | Recruiters update/publish/archive only own-company jobs | no match | (none) |
| BR-13 | BR-013 | Hidden jobs are client-preference; reversible | no match | (none) |
| BR-14 | BR-014 | Saved-search digest runs as service-owned/audited scheduler | partial | BR-T087 |
| BR-15 | BR-015 | No duplicate ACTIVE application per user per job (partial UNIQUE + 90-day cooldown post-terminal) | conflict | BR-T001 |
| BR-16 | BR-016 | No applications to closed/unavailable jobs | exact | BR-T038 |
| BR-17 | BR-017 | Application lifecycle server-owned append-only | partial | BR-T002 |
| BR-18 | BR-018 | Application drafts autosave 30s; recoverable; versions retained | partial | BR-T117 |
| BR-19 | BR-019 | Candidate notes/scorecards recruiter-scoped; never candidate-visible | no match | (none) |
| BR-20 | BR-020 | Status-event history append-only | partial | BR-T002 |

## BR-021 to BR-026: Learning completion, challenges, XP, resume exports

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-21 | BR-021 | Lesson completion idempotent | partial | BR-T032 |
| BR-22 | BR-022 | Lesson prerequisites gate progression | no match | (none) |
| BR-23 | BR-023 | Course completion → certificate + XP bonus | partial | BR-T032 |
| BR-24 | BR-024 | Challenge language allowlist; execution limits per TD-05 | no match | (none) |
| BR-25 | BR-025 | XP idempotent UNIQUE(user_id, reference_type, reference_id); daily cap **200 XP/day** | no match | (none) |
| BR-26 | BR-026 | Resume exports append-only; artifact soft-delete | no match | (none) |

## BR-027 to BR-031: Analytics, admin status, extension data, schedulers

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-27 | BR-027 | Analytics metadata whitelist-only; no raw text/tokens/secrets | no match | (none) |
| BR-28 | BR-028 | Admin status distinguishes live/inferred/degraded/not-configured | no match | (none) |
| BR-29 | BR-029 | Admin actions: confirmation + audit + rollback | partial | BR-T041;BR-T042;BR-T043;BR-T045 |
| BR-30 | BR-030 | Extension data stays in chrome.storage.local; no sync/fetch/network | no match | (none) |
| BR-31 | BR-031 | Schedulers dry-run default; idempotent delivery keys | partial | BR-T087;BR-T096 |

## BR-032 to BR-035: Billing state, AI drafts, trust-and-safety reports

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-32 | BR-032 | Subscription state webhook-owned | exact | BR-T090;BR-T096 |
| BR-33 | BR-033 | AI drafts never auto-commit to records | exact | BR-T112 |
| BR-34 | BR-034 | T&S report lifecycle pending→under_review→resolved/dismissed | partial | BR-T045;BR-T048 |
| BR-35 | BR-035 | SUPERSEDED — closures cited in §19.6 | superseded | (none) |

## BR-036 to BR-045: Organisation, application gates, resume handling, rejection

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-036 | BR-036 | Jobs require approved org + verified owner | conflict | BR-T035 |
| BR-037 | BR-037 | Applications require ≥70% profile | no match | (none) |
| BR-038 | BR-038 | Candidates may apply only to open jobs | exact | BR-T038 |
| BR-039 | BR-039 | Duplicate applications prevented (DB + app) | partial | BR-T001 |
| BR-040 | BR-040 | Recruiters access only their org's applications | partial | BR-T062 |
| BR-041 | BR-041 | Strict application state machine | exact | BR-T002 |
| BR-042 | BR-042 | Offers require completed HM-scoped scorecard review | no match | (none) |
| BR-043 | BR-043 | Resumes are scanned for viruses before text extraction | partial | BR-T003 |
| BR-044 | BR-044 | Extracted resume text encrypted at rest | no match | (none) |
| BR-045 | BR-045 | Rejection emails sent with configurable delay (default 24h) | no match | (none) |

## BR-046 to BR-052: Enrolment, sequential progress, challenge sandbox

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-046 | BR-046 | Course enrollments unique per (user, course) for active status | no match | (none) |
| BR-047 | BR-047 | Module progress strictly sequential | no match | (none) |
| BR-048 | BR-048 | Course completion requires passing final assessment (≥70%) | partial | BR-T031 |
| BR-049 | BR-049 | Challenge submissions run in isolated sandbox | no match | (none) |
| BR-050 | BR-050 | Sandbox execution has hard resource limits (30s CPU, 512MB RAM, 1GB disk) | no match | (none) |
| BR-051 | BR-051 | Challenge test cases split: public + hidden | no match | (none) |
| BR-052 | BR-052 | Plagiarism detection runs asynchronously | no match | (none) |

## BR-053 to BR-062: Badges, referrals, subscriptions, expiry, XP, profile gate

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-053 | BR-053 | Badges minted only upon verified milestone completion | no match | (none) |
| BR-054 | BR-054 | Referral rewards pay out after referred candidate's first verified hire | no match | (none) |
| BR-055 | BR-055 | Subscription changes apply at period boundary (or prorated) | no match | (none) |
| BR-056 | BR-056 | Entitlements derive from active subscription only | partial | BR-T090 |
| BR-057 | BR-057 | Jobs auto-close after expiry (configurable, default 60 days) | conflict | BR-T036 |
| BR-058 | BR-058 | Applications auto-archive after 90 days in submitted | no match | (none) |
| BR-059 | BR-059 | Moderation flags expire after 7 days if not actioned | no match | (none) |
| BR-060 | BR-060 | XP transactions unique per (user, reference_type, reference_id) | no match | (none) |
| BR-061 | BR-061 | Profile completeness ≥70% gate for job applications | no match | (none) |
| BR-062 | BR-062 | Verified organizations receive accelerated job approval | no match | (none) |

## BR-063 to BR-071: Privacy export, verified signals, AI confidence, admin audit, hiring SLAs

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-063 | BR-063 | Candidates may request data export; delivered within 30 days | partial | BR-T064 |
| BR-064 | BR-064 | Recruiters see verified signals on candidate profiles | partial | BR-T062 |
| BR-065 | BR-065 | AI outputs below 0.7 confidence display disclaimer | partial | BR-T112 |
| BR-066 | BR-066 | AI outputs below 0.5 confidence are suppressed | no match | (none) |
| BR-067 | BR-067 | All admin actions are audit-logged | partial | BR-T041;BR-T042;BR-T045 |
| BR-068 | BR-068 | Account termination requires Platform Admin dual approval | no match | (none) |
| BR-069 | BR-069 | Interviewer inactivity auto-escalation: 7 business days → HM escalation; 14 days → auto-transition stale_withdrawn | no match | (none) |
| BR-070 | BR-070 | Candidate non-response auto-release: 5 business days → reminders; 8 days → candidate_unresponsive | no match | (none) |
| BR-071 | BR-071 | Abandoned requisition protection: >21 calendar days → review; 30 days → auto-pause + billing credit | no match | (none) |

## BR-072 to BR-082: Institutional seats, graduation, imports, tenancy, pricing tiers

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-072 | BR-072 | Managed learners access course only while org holds unexpired assigned seat | partial | BR-T094 |
| BR-073 | BR-073 | Seat revocation triggers 7-day grace; in-progress assessments never interrupted | no match | (none) |
| BR-074 | BR-074 | Seat consumption atomic; last-seat concurrency never oversells | partial | BR-T094 |
| BR-075 | BR-075 | Revoked seat returns to pool; learner progress and certificates retained | no match | (none) |
| BR-076 | BR-076 | Graduation transition retains all verified signals and severs FERPA-restricted records | partial | BR-T102;BR-T103 |
| BR-077 | BR-077 | Bulk imports require dry-run validation preview; no silent partial imports | partial | BR-T101 |
| BR-078 | BR-078 | Faculty/Proctor hold no org-level billing, licensing, or user-management privileges | partial | BR-T104 |
| BR-079 | BR-079 | Employer-facing student showcases require recorded, revocable consent | partial | BR-T061;BR-T062 |
| BR-080 | BR-080 | Every org-owned record scoped by `organization_id`; cross-tenant reads prohibited | no match | (none) |
| BR-081 | BR-081 | Institutional pricing tiers configurable per course/package; never hard-coded | no match | (none) |
| BR-082 | BR-082 | Course-access authorization server-side: org + learner + license + enrollment + validity | partial | BR-T033 |

## BR-083 to BR-090: External media and provider controls

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-083 | BR-083 | External media validated before publication; invalid/private/embed-blocked rejected | no match | (none) |
| BR-084 | BR-084 | Provider embedding restrictions never bypassed; protected content never downloaded | no match | (none) |
| BR-085 | BR-085 | Provider capabilities determine available playback/completion settings | no match | (none) |
| BR-086 | BR-086 | Broken external provider isolated to affected content item; course remains functional | no match | (none) |
| BR-087 | BR-087 | Platform stores learner progress even for externally hosted playback where trackable | no match | (none) |
| BR-088 | BR-088 | Unsupported providers produce explicit errors, never silent broken embeds | no match | (none) |
| BR-089 | BR-089 | Authors attest right to use external content before publication | no match | (none) |
| BR-090 | BR-090 | Org provider allowlists enforced server-side | no match | (none) |

## BR-091 to BR-115: Course authoring, pricing, reviews, assessment and commerce

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-091 | BR-091 | Course submission requires ≥5 lessons and ≥30 min total content | no match | (none) |
| BR-092 | BR-092 | Course requires ≥1 video or text lesson (no quiz-only courses) | no match | (none) |
| BR-093 | BR-093 | Structural edits to a published course require a new version | no match | (none) |
| BR-094 | BR-094 | Free-preview lessons ≤20% of course content | no match | (none) |
| BR-095 | BR-095 | Rating requires ≥20% course progress and verified enrolment | conflict | BR-T034 |
| BR-096 | BR-096 | Category assignment required before submission | no match | (none) |
| BR-097 | BR-097 | Instructor must have an approved profile before publishing | no match | (none) |
| BR-098 | BR-098 | Course image ≥750×422, ≤4MB | no match | (none) |
| BR-099 | BR-099 | Coupon cannot reduce price below platform minimum | no match | (none) |
| BR-100 | BR-100 | Refund window 30 days from purchase (configurable), pro-rated after | conflict | BR-T097 |
| BR-101 | BR-101 | Instructor earnings = 70% of net revenue after platform commission (configurable) | no match | (none) |
| BR-102 | BR-102 | Course announcements limited to 1/day/course | no match | (none) |
| BR-103 | BR-103 | Peer review requires ≥2 completed reviews per submission | no match | (none) |
| BR-104 | BR-104 | Instructor cannot review or rate own course | no match | (none) |
| BR-105 | BR-105 | Course version preserves existing student progress | no match | (none) |
| BR-106 | BR-106 | Learning-path courses complete in declared order when sequenced | no match | (none) |
| BR-107 | BR-107 | Quiz attempts bounded by configured max; practice quizzes unlimited | partial | BR-T028 |
| BR-108 | BR-108 | Graded quiz contributes to course grade; passing score configurable | no match | (none) |
| BR-109 | BR-109 | Final exam cumulative; required for course completion when configured | partial | BR-T031 |
| BR-110 | BR-110 | Program certificate issued only when all required path courses complete | partial | BR-T031;BR-T032 |
| BR-111 | BR-111 | Assignment late submission flagged, graded per instructor policy | no match | (none) |
| BR-112 | BR-112 | Auto-grading for code assignments reuses the challenge sandbox | no match | (none) |
| BR-113 | BR-113 | Question-bank reuse preserves per-attempt snapshots (no retroactive edits) | no match | (none) |
| BR-114 | BR-114 | Course archive/unpublish preserves enrolled-student access per policy | no match | (none) |
| BR-115 | BR-115 | All course purchases are idempotent and webhook-owned | exact | BR-T033;BR-T096 |

## BR-116 to BR-134: Social feed, newsletters, outreach credits, endorsements, minors, identity

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-116 | BR-116 | One reaction per user per target; changeable, never additive | no match | (none) |
| BR-117 | BR-117 | One repost per user per post | no match | (none) |
| BR-118 | BR-118 | Post edits retain an "edited" marker and version history | no match | (none) |
| BR-119 | BR-119 | Comment authors and post authors may moderate; authors may disable comments | no match | (none) |
| BR-120 | BR-120 | Mentions notify only if the recipient allows mentions | no match | (none) |
| BR-121 | BR-121 | Follows unique; blocked/muted targets cannot be followed | no match | (none) |
| BR-122 | BR-122 | Post visibility enforced server-side (public/connections/org/private) | no match | (none) |
| BR-123 | BR-123 | Newsletter subscriptions opt-in only; one-click unsubscribe (RFC 8058) | partial | BR-T085 |
| BR-124 | BR-124 | Feed must always offer a chronological view; ranking factors disclosed on demand | no match | (none) |
| BR-125 | BR-125 | UGC passes pre-publish abuse scan; post rate limits per actor | no match | (none) |
| BR-126 | BR-126 | Sponsored content labelled as sponsored; never undisclosed in organic ranking | no match | (none) |
| BR-127 | BR-127 | Mute hides content without unfollowing and without notifying the muted party | no match | (none) |
| BR-128 | BR-128 | Minors (16+) get private-by-default profiles and restricted outreach | conflict | BR-T106 |
| BR-129 | BR-129 | Outreach credit consumed on send to a non-connection; refunded on reply within 7 days | partial | BR-T081 |
| BR-130 | BR-130 | Outreach weekly caps: 20 (Pro), 50 (Team), custom (Enterprise) | conflict | BR-T081 |
| BR-131 | BR-131 | Endorsements require an existing connection | partial | BR-T010 |
| BR-132 | BR-132 | Written recommendations display only after recipient acceptance | no match | (none) |
| BR-133 | BR-133 | Profile-view logging honours the viewer's privacy mode | partial | BR-T068 |
| BR-134 | BR-134 | Identity-verification badges only via approved partners; failure never blocks core use | no match | (none) |

## BR-135 to BR-140: Salary cells, employer reviews, interview questions, contests, exams

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-135 | BR-135 | Salary aggregates displayed only with ≥5 reports for a role/location cell | no match | (none) |
| BR-136 | BR-136 | Anonymous reviews hide identity from employer and public, never from Platform Admin/legal | no match | (none) |
| BR-137 | BR-137 | Company responses are appended, never edit the original review | no match | (none) |
| BR-138 | BR-138 | Interview questions require moderation before public display | no match | (none) |
| BR-139 | BR-139 | Contest submissions locked at server-authoritative end time; clock skew never extends | partial | BR-T024 |
| BR-140 | BR-140 | Certification exam pass requires the configured score in a single attempt (retake policy configurable) | partial | BR-T027;BR-T028 |

## BR-141 to BR-148: Skills taxonomy and skill graph

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-141 | BR-141 | Skills taxonomy curated by Platform Admin; no user can create canonical skills | partial | BR-T006 |
| BR-142 | BR-142 | Skill relationships are directional: `prerequisite_of`, `subskill_of`, `supersedes` | no match | (none) |
| BR-143 | BR-143 | Correlations (`correlates_with`) are bidirectional and computed statistically | no match | (none) |
| BR-144 | BR-144 | Every course, challenge, job, and candidate skill tag MUST reference a canonical skill | partial | BR-T006;BR-T035 |
| BR-145 | BR-145 | Skill market signals update daily from aggregated data | no match | (none) |
| BR-146 | BR-146 | Skill graph traversal depth bounded (max 5 hops) | no match | (none) |
| BR-147 | BR-147 | Skill relationships must be acyclic for `prerequisite_of` (validated at write time) | no match | (none) |
| BR-148 | BR-148 | Emerging skills require minimum 5 independent signals before taxonomy promotion | no match | (none) |

## BR-149 to BR-156: Credentials and endorsements

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-149 | BR-149 | Credentials are append-only; revocation creates a new record with `revoked_at` | partial | BR-T012 |
| BR-150 | BR-150 | Every credential has a public verification URL (no PII exposed) | no match | (none) |
| BR-151 | BR-151 | Credential evidence links are immutable once issued | partial | BR-T008;BR-T013 |
| BR-152 | BR-152 | Endorsement weights derive from endorser's verified reputation + relationship proximity | no match | (none) |
| BR-153 | BR-153 | Anonymous endorsements are not permitted (P-01) | partial | BR-T010 |
| BR-154 | BR-154 | Appeal path exists for disputed credentials; SLA ≤7 days | partial | BR-T012;BR-T021;BR-T047 |
| BR-155 | BR-155 | Privacy-preserving proofs allow skill verification without revealing full profile | no match | (none) |
| BR-156 | BR-156 | Credential issue requires underlying achievement verified by platform activity | partial | BR-T011 |

## BR-157 to BR-163: Career graph and outcome tracking

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-157 | BR-157 | Career outcome tracking requires explicit user opt-in | no match | (none) |
| BR-158 | BR-158 | Aggregated career data requires k ≥5 for display | partial | BR-T100 |
| BR-159 | BR-159 | Individual career transitions visible only to the user | no match | (none) |
| BR-160 | BR-160 | Progression benchmarks by role require ≥20 data points to publish | no match | (none) |
| BR-161 | BR-161 | Salary progression tracked separately from base salary | no match | (none) |
| BR-162 | BR-162 | Career graph updates do not retroactively alter historical benchmarks | no match | (none) |
| BR-163 | BR-163 | Career path recommendations must disclose data sources and confidence intervals | partial | BR-T071 |

## BR-164 to BR-168: Reputation

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-164 | BR-164 | Reputation score is derived, never manually set | no match | (none) |
| BR-165 | BR-165 | Reputation is skill-specific | no match | (none) |
| BR-166 | BR-166 | Time-decay: signals older than 24 months count less | partial | BR-T005 |
| BR-167 | BR-167 | Reputation is private by default; recruiter visibility requires candidate consent or active application | no match | (none) |
| BR-168 | BR-168 | Reputation signals are auditable | partial | BR-T005 |

## BR-169 to BR-176: Interview recording, AI feedback and comparison

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-169 | BR-169 | Interview recording requires dual consent | no match | (none) |
| BR-170 | BR-170 | Recordings encrypted at rest; retention ≤90 days unless extended | no match | (none) |
| BR-171 | BR-171 | AI feedback is advisory; never a hiring decision input without human review | partial | BR-T040;BR-T072 |
| BR-172 | BR-172 | AI analysis excludes protected attributes | partial | BR-T070 |
| BR-173 | BR-173 | Interview questions are company-scoped; not visible to candidates before assessment | no match | (none) |
| BR-174 | BR-174 | Assessment scores are append-only; changes are compensating entries | no match | (none) |
| BR-175 | BR-175 | Live coding environment reuses the challenge sandbox | no match | (none) |
| BR-176 | BR-176 | Comparison across candidates uses structured rubrics, never free-form scores | no match | (none) |

## BR-177 to BR-183: Salary and equity intelligence

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-177 | BR-177 | Salary reports require verification: self-reported (0.5) or verified via employment (1.0) | no match | (none) |
| BR-178 | BR-178 | Aggregated salary data requires k ≥5 submissions per cell | no match | (none) |
| BR-179 | BR-179 | Salary data displayed in minor units + ISO-4217 currency | no match | (none) |
| BR-180 | BR-180 | Company-specific salary data shown only if company has ≥3 reports OR opted in | no match | (none) |
| BR-181 | BR-181 | Users may withdraw their salary submission at any time | no match | (none) |
| BR-182 | BR-182 | Salary intelligence updates quarterly; historical data versioned | no match | (none) |
| BR-183 | BR-183 | Equity data (F-98) separately aggregated from salary | no match | (none) |

## BR-184 to BR-188: Recommendations

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-184 | BR-184 | Recommendation factors must be disclosed ("why am I seeing this?") | partial | BR-T071 |
| BR-185 | BR-185 | Recommendations never use protected attributes | partial | BR-T070 |
| BR-186 | BR-186 | Users can dismiss recommendations; dismissals train the model | no match | (none) |
| BR-187 | BR-187 | Recommendations may not include promoted content without explicit "sponsored" label | no match | (none) |
| BR-188 | BR-188 | Recommendation engine must be replaceable without breaking downstream features | no match | (none) |

## BR-189 to BR-193: Learning-impact analytics

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-189 | BR-189 | Course outcome correlation requires ≥30 enrolled learners with measurable outcomes | no match | (none) |
| BR-190 | BR-190 | Individual learner outcomes are never exposed without consent | conflict | BR-T061;BR-T100 |
| BR-191 | BR-191 | Course quality scores derived from outcomes visible to instructors, not publicly ranked | no match | (none) |
| BR-192 | BR-192 | Learning impact analytics do not create incentives to lower standards | no match | (none) |
| BR-193 | BR-193 | Correlation is not causation — all outcome claims labelled as correlational | no match | (none) |

## BR-194 to BR-208: Mentorship, hubs, parsing, assessments, DE&I, badges, accessibility, API, AI inheritance

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-194 | BR-194 | Peer mentorship sessions have a 30-day inactivity auto-close | no match | (none) |
| BR-195 | BR-195 | Expert network calls may be paid; platform takes a transparent fee | no match | (none) |
| BR-196 | BR-196 | Industry hubs must have ≥3 active contributors to display | no match | (none) |
| BR-197 | BR-197 | Resume parsing never auto-applies changes without user review | exact | BR-T112 |
| BR-198 | BR-198 | Custom assessments must be approved by Platform Admin before deployment | no match | (none) |
| BR-199 | BR-199 | Candidate comparison requires verified profiles only | no match | (none) |
| BR-200 | BR-200 | DE&I analytics use aggregated data only; individual demographic data never stored | partial | BR-T077 |
| BR-201 | BR-201 | Post-hire analytics require employer consent and are aggregate-only | no match | (none) |
| BR-202 | BR-202 | Badge marketplace prohibits paid badges; all badges earned | no match | (none) |
| BR-203 | BR-203 | Mobile-first application must maintain feature parity with desktop | no match | (none) |
| BR-204 | BR-204 | Accessibility is a release gate; WCAG 2.2 AA mandatory | no match | (none) |
| BR-205 | BR-205 | API access requires enterprise tier; rate-limited per CON-006 | partial | BR-T115 |
| BR-206 | BR-206 | Emerging skills require platform-wide adoption before taxonomy promotion | no match | (none) |
| BR-207 | BR-207 | Job market analytics require k ≥10 data points per geographic cell | no match | (none) |
| BR-208 | BR-208 | All new AI-powered features inherit AI safety rules §32 | partial | BR-T110;BR-T111;BR-T112;BR-T113 |

## BR-209 to BR-217: Warm introductions

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-209 | BR-209 | Introducer consent required for each introduction | no match | (none) |
| BR-210 | BR-210 | Max path depth = 4 | no match | (none) |
| BR-211 | BR-211 | Max 10 intro requests/week/user | no match | (none) |
| BR-212 | BR-212 | Introducer can opt out of intro services | no match | (none) |
| BR-213 | BR-213 | Target can block all intro requests | no match | (none) |
| BR-214 | BR-214 | Introduction messages separate from cold outreach | no match | (none) |
| BR-215 | BR-215 | Paths visible only to requester | no match | (none) |
| BR-216 | BR-216 | No path suggestion for blocked users | no match | (none) |
| BR-217 | BR-217 | Minimum reason category required on rejection | exact | BR-T040 |

## BR-218 to BR-224: Application feedback loop

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-218 | BR-218 | Feedback delivered within 7 days of decision | no match | (none) |
| BR-219 | BR-219 | Feedback visible only to candidate | partial | BR-T040 |
| BR-220 | BR-220 | Aggregate insights use k ≥10 | partial | BR-T100 |
| BR-221 | BR-221 | AI drafts require human review before sending | partial | BR-T112 |
| BR-222 | BR-222 | Candidate can request feedback if not provided (30-day window) | no match | (none) |
| BR-223 | BR-223 | Negative feedback must include actionable element | no match | (none) |
| BR-224 | BR-224 | Feedback templates org-configurable | no match | (none) |

## BR-225 to BR-232: Skill freshness and decay

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-225 | BR-225 | Freshness score computed nightly, immutable per day | no match | (none) |
| BR-226 | BR-226 | Decay curves per skill category, admin-configurable | partial | BR-T005 |
| BR-227 | BR-227 | Freshness <20 demotes to self-reported | no match | (none) |
| BR-228 | BR-228 | Re-verification restores freshness to 100 | no match | (none) |
| BR-229 | BR-229 | Self-attestation counts 0.5× | no match | (none) |
| BR-230 | BR-230 | Freshness visible to candidate always; recruiter-visible only with consent | partial | BR-T061;BR-T071 |
| BR-231 | BR-231 | Market drift alerts opt-in | no match | (none) |
| BR-232 | BR-232 | Freshness stored historically (time-series) | no match | (none) |

## BR-233 to BR-240: Referral requests

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-233 | BR-233 | Max 3 referral requests per 30 days per candidate | no match | (none) |
| BR-234 | BR-234 | Referrer consent required per request | no match | (none) |
| BR-235 | BR-235 | Referral tag visible to recruiter (priority signal) | no match | (none) |
| BR-236 | BR-236 | Referral rewards follow org policy; XP default | no match | (none) |
| BR-237 | BR-237 | System verifies referrer's employment | no match | (none) |
| BR-238 | BR-238 | No referral request from blocked user | no match | (none) |
| BR-239 | BR-239 | Referrer max 20 referrals/quarter | no match | (none) |
| BR-240 | BR-240 | Referral attribution tracked 12 months | no match | (none) |

## BR-241 to BR-248: Alumni networks

| Legacy ID | Canonical ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|---|
| BR-241 | BR-241 | Affiliation verified (email domain or institutional seat) | no match | (none) |
| BR-242 | BR-242 | Alumni discovery respects privacy settings | no match | (none) |
| BR-243 | BR-243 | Alumni group default-join, opt-out allowed | no match | (none) |
| BR-244 | BR-244 | Alumni job postings must be from verified alumni | no match | (none) |
| BR-245 | BR-245 | Alumni mentorship opt-in | partial | BR-T103 |
| BR-246 | BR-246 | No cross-institution data leakage | no match | (none) |
| BR-247 | BR-247 | Graduated students retain alumni status | partial | BR-T103 |
| BR-248 | BR-248 | Alumni networks public or private (institution choice) | no match | (none) |

## MIG-01 to MIG-08: Migration rules (LinkedIn on-ramp and provider integration)

| ID | Legacy rule text (verbatim) | Crosswalk disposition | Candidate target BR-T |
|---|---|---|---|
| MIG-01 | Imported data becomes project-owned; user may edit/delete/replace/export | partial | BR-T064;BR-T067 |
| MIG-02 | Migration is one-way and user-initiated; no continuous sync by default | no match | (none) |
| MIG-03 | Migration never auto-publishes; imported posts land as drafts | no match | (none) |
| MIG-04 | Imported skills are self-reported until natively verified | partial | BR-T008;BR-T011 |
| MIG-05 | Connection graphs are never imported; hashed-email mutual-consent discovery only, hashes TTL-bound | no match | (none) |
| MIG-06 | Provider tokens server-side, short-lived, revocable; disconnect purges tokens + raw archive | no match | (none) |
| MIG-07 | External provider IDs are never primary keys, auth claims, URLs, or analytics keys | no match | (none) |
| MIG-08 | Every provider surface is feature-flagged and removable without core schema change | no match | (none) |

## Change policy (legacy; carried over)

Business-rule changes must:

1. identify affected journeys and features;
2. identify data and API impact;
3. identify security and privacy impact;
4. add or update tests;
5. update the SSOT and affected documentation;
6. record the decision rationale.

Target position: compatible with the target change process (ADR and OPEN registers). Step 5 names the root SSOT, which is protected from edits by this merge; any SSOT update is a separate owner action.

## Recorded conflicts between the legacy rules and the target BR-T series

These are the eight `conflict` rows plus the one `superseded` row in `LEGACY_RULE_CROSSWALK.csv`, restated so the decision does not depend on opening the CSV. Both positions are kept; neither is chosen here. Decisions are owned by OPEN-43 (and the other OPEN ids named).

| Legacy rule | Legacy position | Target position | Decision needed (id) |
|---|---|---|---|
| BR-015 | No second active application per user per job; 90-day cooldown after a terminal state (partial UNIQUE index) | `BR-T001` allows a recruiter-invited linked application after a terminal status; the cooldown is absent | OPEN-43 |
| BR-036 | Jobs require an approved organisation and a verified owner | `BR-T035` lets a pending organisation have one live job | OPEN-43 |
| BR-057 | Jobs auto-close after expiry, default 60 days | `BR-T036`: default 45 days, 90-day continuous maximum | OPEN-43 |
| BR-095 | A rating requires at least 20% course progress and verified enrolment | `BR-T034`: course completion or at least 50% progress | OPEN-43 |
| BR-100 | Refund window 30 days from purchase, pro-rated afterwards | `BR-T097`: under 14 days and under 20% progress | OPEN-33, OPEN-43 |
| BR-128 | Minors (16+) get private-by-default profiles and restricted outreach | `BR-T106`: under-age onboarding blocked pending OPEN-09 | OPEN-09 |
| BR-130 | Weekly outreach caps: 20 (Pro), 50 (Team), custom (Enterprise) | `BR-T081`: monthly reset; plan quota values open | OPEN-05, OPEN-19 |
| BR-190 | Individual learner outcomes never exposed without consent | `BR-T061` / `BR-T100` are purpose-bound but do not expressly make institution views consent-gated | OPEN-43, OPEN-LGA-03 |
| BR-035 | SUPERSEDED in the legacy registry (closures were cited in a legacy section) | No active target rule | OPEN-43 (confirm retire) |

### Source-text differences against the root SSOT (from the crosswalk)

The crosswalk reports 252 of 256 rule texts identical to the root SSOT after ID normalisation and four that differ: `BR-065`, `BR-066`, `BR-158`, `BR-178`. For these the legacy registry text is:

| Rule | Legacy registry text | Note |
|---|---|---|
| BR-065 | AI outputs below 0.7 confidence display disclaimer | SSOT version requires capability-specific uncertainty/evaluation policy (per crosswalk); not carried here |
| BR-066 | AI outputs below 0.5 confidence are suppressed | SSOT version requires suppression or human/non-AI fallback on gate failure (per crosswalk) |
| BR-158 | Aggregated career data requires k >= 5 for display | SSOT specifies k >= 10 for sensitive aggregate career analytics |
| BR-178 | Aggregated salary data requires k >= 5 submissions per cell | SSOT specifies k >= 10 |

The aggregation-threshold family is a single open decision (legacy conflict C-8; see `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, OPEN-LGA-01).

## Editorial analysis added by this merge: tensions inside the legacy corpus

These were found by reading the 248 rules against each other. They are **observations for owner review**, not decisions, and each is registered in `OPEN_DECISIONS_LEGACY_MERGE.md`.

| Observation | Rules | Why it matters |
|---|---|---|
| Duplicate or near-duplicate rules | BR-025 and BR-060 (XP idempotency key); BR-037 and BR-061 (profile completeness >= 70% gate); BR-015 and BR-039 (duplicate applications; only BR-015 has the cooldown); BR-016 and BR-038 (closed jobs); BR-017, BR-020, BR-041 (application lifecycle) | Consolidating avoids two tests per behaviour; keep both IDs in the traceability map until the owner merges them. |
| Different k-anonymity thresholds | BR-135 (k >= 5), BR-158 (k >= 5), BR-178 (k >= 5), BR-207 (k >= 10), BR-220 (k >= 10), BR-189 (>= 30 learners), BR-160 (>= 20 data points), BR-196 (>= 3 contributors), BR-180 (>= 3 reports) | One privacy policy needs one default and an explicit per-use override table. |
| Course completion vs final exam | BR-023 (completion yields certificate and XP bonus), BR-048 (completion requires passing final assessment >= 70%), BR-109 (final exam required only when configured) | Whether a final assessment is always mandatory is ambiguous. |
| Billing audience | BR-007 says billing actions are for recruiters, not users or admins, while the prior attempt also sold a candidate plan (see `../19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md`) | Candidate-side paid plans need an explicit authorisation rule. |
| Refund rules | BR-055 (changes at period boundary or prorated), BR-100 (30-day pro-rated) | Subscription vs course refunds are not distinguished. |
| Emerging-skills promotion | BR-148 (minimum 5 independent signals) vs BR-206 (platform-wide adoption) | Two promotion tests for the same event. |
| Decay | BR-166 (signals older than 24 months count less) vs BR-226 (decay curves per skill category, admin-configurable) | Fixed vs configurable decay. |
| Outreach and introduction caps | BR-130 (weekly outreach caps), BR-211 (10 intro requests per week), BR-233 (3 referral requests per 30 days), BR-239 (20 referrals per quarter) | Four cap windows (weekly, 30-day, quarterly) with no common model. |
| Rule IDs vs role names | BR-001 and BR-002 use legacy JWT role names (`ROLE_RECRUITER`, `ROLE_ADMIN`, `ROLE_USER`); BR-003..BR-008 use informal role labels; the target uses scoped roles | See OPEN-44; role mapping must precede adopting these rules. |
| AI thresholds | BR-065 / BR-066 hard-code 0.7 / 0.5 confidence thresholds, while BR-208 says new AI features inherit the AI safety section | Hard-coded thresholds conflict with the general principle that policy values are configurable (legacy gap list: "Hard-coded retention" was resolved to policy-driven). |
| Policy values hard-coded in rules | BR-025 (200 XP/day), BR-050 (30 s CPU, 512 MB RAM, 1 GB disk), BR-098 (image >= 750x422, <= 4 MB), BR-045 (24 h rejection-email delay) | Candidates for configuration rather than rule text. |

## Traceability limitation (carried over from the legacy registry)

Rule IDs and text were inventoried in a prior audit ledger, but a code comment or a matching numeric ID did not verify a rule. Some prior feature summaries attached a different meaning to the same ID (for example the prior F-01 summary used BR-001/BR-002 for authentication and role separation, whereas the registry's BR-01/BR-02 govern job-posting roles and application roles). Target requirement: reconcile each feature reference by canonical rule meaning; do not create `BR-249+` from historical prose; do not renumber code or tests as a formatting fix (legacy conflict C-9).

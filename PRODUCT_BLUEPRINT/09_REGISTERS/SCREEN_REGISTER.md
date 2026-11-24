<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->


# Screen Register

Every screen with its proposed route, roles and states.

**Total: 930.**

## ADM

Source: [02_MODULES/ADM_Admin_Console_Support_Operations.md](../02_MODULES/ADM_Admin_Console_Support_Operations.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-ADM-001 | Admin sign-in | `/login` | all staff | Passkey or SSO sign-in | default, SSO redirect, blocked, locked, device-clock error |
| SCR-ADM-002 | Step-up dialog | modal | all staff | Re-authenticate for mutation | challenge, success, failed, timed out |
| SCR-ADM-003 | Admin home | `/` | all staff | Role-specific overview, badges | loading, partial data, incident banner |
| SCR-ADM-004 | Command palette | modal | all staff | Global search and jump | empty (recent), results, throttled, no access |
| SCR-ADM-005 | User directory | `/people/users` | SUP, SUP-L, MOD, FIN, PAD, SAD | Exact-identifier lookup | empty, results, refused partial match |
| SCR-ADM-006 | User detail | `/people/users/:id` | same | Masked account facts, actions | masked, unmasked (grant), tombstone, erased |
| SCR-ADM-007 | Account action dialogs and merge wizard | modal, `/people/users/:id/merge` | SUP-L, PAD, SAD | Suspend, reinstate, merge | confirm, pending approval, executed, error |
| SCR-ADM-008 | Organization and institution list and detail | `/people/orgs`, `/people/orgs/:id`, `/people/institutions/:id` | SUP-L, PAD, SAD (view: SUP, FIN) | Verification queue, suspension, ownership transfer, tenant config | queue empty, cascade preview, suspended |
| SCR-ADM-009 | Staff and roles | `/settings/staff` | PAD, SAD | Invite, assign roles, effective permissions | list, invite, pending approval, expiring |
| SCR-ADM-010 | Access reviews | `/settings/access-reviews` | SAD, SUP-L, FIN-L, PAD | Quarterly recertification | open, in progress, overdue, closed |
| SCR-ADM-011 | Approvals inbox | `/approvals` | requesters and approvers | Review, approve, reject, withdraw | to approve, mine, history, stale, expired |
| SCR-ADM-012 | Grant request and active-grant chip | modal and top bar | SUP, MOD, FIN, PAD | Request and monitor privileged access | requested, active, expiring, expired |
| SCR-ADM-013 | Break-glass | `/incidents/:id/break-glass` | roster (PAD, SAD) | Invoke emergency access; review | not on roster (hidden), active, under review |
| SCR-ADM-014 | Staff activity alerts | `/compliance/staff-activity` | SAD, PAD | Anomaly queue and rules | queue, rule editor, suppressed storm |
| SCR-ADM-015 | Feature flags | `/controls/flags`, `/controls/flags/:key` | PAD, SAD (read: all) | Targeting, rollout, history | list, editing, pending approval, stale |
| SCR-ADM-016 | Kill switches | `/controls/switches` | PAD, SAD, MOD (scoped) | Activate, deactivate, ramp back | inactive, active, partial propagation |
| SCR-ADM-017 | Configuration | `/controls/config` | PAD, SAD | Typed settings, diff, rollback | editing, canary, halted, rolled back |
| SCR-ADM-018 | Announcements | `/content/announcements` | PAD, SAD, SUP-L (draft) | Compose, target, schedule | draft, in review, live, ended |
| SCR-ADM-019 | Maintenance and change calendar | `/ops/maintenance`, `/ops/calendar` | PAD, SAD (view: all) | Windows, freeze, exceptions | scheduled, active read-only, freeze |
| SCR-ADM-020 | Support queue | `/support/queue` | SUP, SUP-L, PAD | Prioritized queues | empty, filtered, SLA breaching |
| SCR-ADM-021 | Ticket workspace | `/support/tickets/:id` | SUP, SUP-L, PAD | Thread, context, macros, actions | collision warning, pending approval, merged |
| SCR-ADM-022 | SLA policies and reports | `/support/sla` | SUP-L, PAD | Policies, calendars, attainment | editing, report, no data |
| SCR-ADM-023 | Macros | `/support/macros` | SUP-L, PAD (use: SUP) | Library and editor | list, editor, retired |
| SCR-ADM-024 | View-as session | `/support/viewas/:id` | SUP, SUP-L, PAD | Consented read-only view | awaiting consent, active, ended |
| SCR-ADM-025 | Knowledge base editor and analytics | `/content/help`, `/content/help/:id` | SUP-L, PAD (draft: SUP) | Articles, review queue, misses | draft, in review, outdated |
| SCR-ADM-026 | Support quality and CSAT | `/support/quality` | SUP-L, PAD | Ratings, rubric reviews | trend, review form, empty |
| SCR-ADM-027 | Problems and known issues | `/support/problems` | SUP, SUP-L, PAD | Link tickets, known-issue messages | open, resolved, bulk send |
| SCR-ADM-028 | Content pages (CMS) | `/content/pages` | PAD, SAD | Template-bound editing, preview, publish | draft, review, published, cache pending |
| SCR-ADM-029 | Legal documents | `/content/legal` | PAD, SAD | Versions, effective dates, acceptance | draft, 2P pending, scheduled, live |
| SCR-ADM-030 | Localization | `/content/locales` | PAD, SUP-L | Locale coverage and stale items | coverage matrix, stale, import errors |
| SCR-ADM-031 | Audit log viewer | `/audit` | SAD, PAD, scoped others | Search and verify events | filtered, lagging banner, integrity result |
| SCR-ADM-032 | Data requests | `/compliance/requests`, `/compliance/requests/:id` | SUP, SUP-L, PAD, SAD | Cases, deadlines, decisions | list, blocked, hold, completed |
| SCR-ADM-033 | Bulk operations | `/ops/bulk` | PAD, SAD | Dry-run, execute, undo | dry-run report, running, stopped |
| SCR-ADM-034 | Finance worklists | `/finance/refunds`, `/finance/disputes`, `/finance/reconciliation` | FIN, FIN-L (read: SAD) | Refunds, disputes, variance | queue, decision dialog, provider degraded |
| SCR-ADM-035 | Exports and saved views | modal, `/me/exports` | PAD, SAD, leads | Export dialog and downloads | preparing, ready, expired |
| SCR-ADM-036 | Jobs and dead letters | `/ops/jobs`, `/ops/jobs/:id` | PAD (view: SAD) | Queue health, retry, requeue | healthy, dead jobs, stuck |
| SCR-ADM-037 | Incidents and incident room | `/incidents`, `/incidents/:id` | PAD, SAD, declarers | Declare, coordinate, communicate | active, resolved, review pending |
| SCR-ADM-038 | Platform health | `/ops/health` | all staff | Service, queue, integration state | healthy, degraded, unknown, monitoring down |
| SCR-ADM-039 | User-side: Contact support and My requests | `/help/contact`, `/help/requests` (product origin) | all signed-in roles, GUE (form) | Ticket intake and tracking | empty, submitted, attachment failed |
| SCR-ADM-040 | User-side: Support access settings and consent prompt | `/settings/privacy/support-access` (product origin) | all signed-in roles | Consent, revoke, view past sessions | prompt, active session banner, history |
| SCR-ADM-041 | Public help center | `/help`, `/help/:slug` (product origin) | GUE and all | Search, read, rate | home, article, no results, outdated label |
| SCR-ADM-042 | Public status page | separate host | GUE and all | Component status and incidents | operational, degraded, maintenance |

## AIC

Source: [02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md](../02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-AIC-001 | Assistant panel | global overlay | CAN, STD, INS, MNT | Chat | streaming, quota-exhausted, unavailable, assessment-locked |
| SCR-AIC-002 | Assistant history | `/assistant/history` | same | Browse and delete chats | empty |
| SCR-AIC-003 | My AI settings | `/settings/ai` | all members | Context sources, memory, provider, opt-out | institution-locked |
| SCR-AIC-004 | AI memory manager | `/settings/ai/memory` | same | View and edit memory | empty |
| SCR-AIC-005 | AI usage | `/settings/ai/usage` | same | Allowance and history | exhausted |
| SCR-AIC-006 | Resume feedback | `/resume/:id/feedback` | CAN, STD | Scorecard and suggestions | processing, needs-input |
| SCR-AIC-007 | Interview practice setup | `/practice/new` | CAN, STD | Configure session | voice-unavailable |
| SCR-AIC-008 | Interview practice session | `/practice/:id` | CAN, STD | Q and A with feedback | recording, offline |
| SCR-AIC-009 | Practice summary | `/practice/:id/summary` | CAN, STD | Strengths and areas | deleted |
| SCR-AIC-010 | Career plan | `/plan` | CAN, STD | Goal and staged plan | draft, active, stale-data |
| SCR-AIC-011 | Skill-gap matrix | `/skills/gap/:targetId` | CAN, STD | Gap analysis | insufficient-data |
| SCR-AIC-012 | Drafting dialog | modal | members | Draft messages and letters | consent-required |
| SCR-AIC-013 | Suggestion inbox | `/assistant/suggestions` | CAN, STD | Review and apply suggestions | stale |
| SCR-AIC-014 | Job fit panel | panel on `/jobs/:id` | CAN, STD | Candidate-side fit | unavailable, unclear-requirements |
| SCR-AIC-015 | Recruiter fit view | panel in ATS | REC, HMG | Dimension chips and summary | disabled, loading |
| SCR-AIC-016 | Explanation sheet | sheet | members, REC, HMG | Why for matches and recommendations | expired |
| SCR-AIC-017 | Job preferences | `/settings/job-preferences` | CAN, STD | Must-haves and nice-to-haves | conflict-warning |
| SCR-AIC-018 | Suggested skills | inline | CAN, STD, REC, EAD | Confirm extracted skills | none |
| SCR-AIC-019 | Feedback and human review | dialog | CAN, STD | Feedback and review request | submitted |
| SCR-AIC-020 | Employer review queue | `/org/:id/ai-reviews` | REC, EAD | Human review requests | overdue |
| SCR-AIC-021 | Job recommendations | `/jobs/recommended` | CAN, STD | Recommended jobs | empty |
| SCR-AIC-022 | Learning recommendations | `/learn/recommended` | CAN, STD | Recommended learning | catalog-gap |
| SCR-AIC-023 | People recommendations | `/network/recommended` | CAN, STD, MNT | Suggested people and mentors | none |
| SCR-AIC-024 | Dismissed items | `/recommendations/dismissed` | members | Restore dismissed | empty |
| SCR-AIC-025 | AI policy admin | `/admin/ai/policies` | PAD, SAD | Capabilities, policies, routes | pending-change |
| SCR-AIC-026 | Model registry | `/admin/ai/models` | PAD, SAD | Models and cards | awaiting-approval |
| SCR-AIC-027 | Evaluation dashboard | `/admin/ai/evaluations` | PAD | Runs and gates | gate-failed |
| SCR-AIC-028 | Fairness reports | `/admin/ai/fairness` | PAD, SAD, EAD (own) | Bias audit results | alert |
| SCR-AIC-029 | Provider health and cost | `/admin/ai/providers` | PAD, FIN | Health, cost, kill switches | circuit-open |
| SCR-AIC-030 | AI incidents | `/admin/ai/incidents` | PAD, MOD, SAD | Triage board | S1 |
| SCR-AIC-031 | AI transparency page | `/ai` | GUE, all | Capabilities, model summaries, data use | none |
| SCR-AIC-032 | Provider connection | `/settings/ai/providers` | members | On-device and connected providers | unsupported-device |

## ANL

Source: [02_MODULES/ANL_Analytics_Reporting_Insights.md](../02_MODULES/ANL_Analytics_Reporting_Insights.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-ANL-001 | Candidate dashboard | `/me/progress` | CAN, STD | Own progress and next steps | New user empty, populated, hidden widgets |
| SCR-ANL-002 | Instructor analytics | `/studio/analytics` | INS | Course performance | Not enough learners, outcome label |
| SCR-ANL-003 | Recruiter dashboard | `/recruit/home` | REC | Own pipeline health | Stalled candidates, empty |
| SCR-ANL-004 | Hiring manager dashboard | `/hiring/home` | HMG | Requisition status | Waiting on you |
| SCR-ANL-005 | Employer admin dashboard | `/employer/analytics` | EAD | Org hiring performance | Benchmark unavailable |
| SCR-ANL-006 | Institution dashboard | `/institution/analytics` | IAD | Cohort adoption and outcomes | Cohort too small, consent note |
| SCR-ANL-007 | Placement dashboard | `/institution/placement` | PLO, IAD | Placement funnel, outreach segments | Segment below minimum |
| SCR-ANL-008 | Enterprise dashboard | `/enterprise/analytics` | EXA | Learning, mobility, skills rollup | Feature not enabled in country |
| SCR-ANL-009 | Executive and product health | `/admin/analytics` | PAD, Analyst, FIN | North star, inputs, guardrails | Unverified metric, annotation |
| SCR-ANL-010 | Operations dashboards | `/admin/analytics/ops` | SUP, MOD, FIN, PAD | Support, moderation, finance ops | Stale source |
| SCR-ANL-011 | Fairness monitoring | `/admin/analytics/fairness` | PAD (RAI), SAD | Adverse-impact audit | Not assessable |
| SCR-ANL-012 | Funnel analysis | `/analytics/funnels` | Analyst, PAD, tenant admins | Funnel builder and results | Suppressed breakdown |
| SCR-ANL-013 | Cohort analysis | `/analytics/cohorts` | Analyst, PAD, tenant admins | Retention tables | Partial period |
| SCR-ANL-014 | Report builder | `/analytics/reports/new` | Roles per matrix | Build and save reports | Blocked dimension, budget exceeded |
| SCR-ANL-015 | Scheduled reports | `/analytics/schedules` | Owners, admins | Manage schedules | Suspended, failed |
| SCR-ANL-016 | Experiments | `/admin/analytics/experiments` | PAD, Analyst | Registry, results, decisions | Halted, inconclusive |
| SCR-ANL-017 | Alerts inbox | `/analytics/alerts` | Owners, admins | Rules and alerts | Open, snoozed |
| SCR-ANL-018 | Analyst workspace | `/admin/analytics/workspace` | Analyst | Governed querying | Access expired |
| SCR-ANL-019 | Access requests | `/admin/analytics/access` | Analyst, privacy lead | Request and approve | Pending, expired |
| SCR-ANL-020 | Metric registry | `/admin/analytics/metrics` | PAD, all read | Definitions and versions | Draft, certified, deprecated |
| SCR-ANL-021 | Pipeline monitor | `/admin/analytics/pipeline` | PAD | Lag, rejects, replay | Paused source |
| SCR-ANL-022 | Data catalogue | `/admin/analytics/catalogue` | PAD, privacy lead | Field classification | Unclassified |
| SCR-ANL-023 | Analytics preferences | `/settings/privacy/analytics` | Signed-in | Consent and own data export | Opt-in, withdrawn |
| SCR-ANL-024 | Event schema registry | `/admin/analytics/schemas` | PAD, engineers | Schemas and reviews | Breaking change blocked |
| SCR-ANL-025 | Data quality | `/admin/analytics/quality` | PAD | Reconciliation results | Failing, inconclusive |
| SCR-ANL-026 | My exports | `/analytics/exports` | Roles per matrix | Download aggregate exports | Ready, expired |
| SCR-ANL-027 | Dashboard home and saved views | `/analytics` | All with a dashboard | Entry point and saved views | No access |
| SCR-ANL-028 | API and embed grants | `/settings/analytics/api` | EAD, IAD, EXA, PAD | Grants, embeds, usage | Pending, revoked |
| SCR-ANL-029 | Unit economics | `/admin/analytics/economics` | FIN, PAD | Revenue, cost, margin | Forecast label, break flagged |
| SCR-ANL-030 | Changelog and certification | `/admin/analytics/changes` | PAD (steward) | Impact preview, approvals | Review overdue |

## ASM

Source: [02_MODULES/ASM_Assessments_Challenges_Integrity.md](../02_MODULES/ASM_Assessments_Challenges_Integrity.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-ASM-001 | Challenge catalog | `/challenges` | GUE, CAN, STD, INS | Browse and filter (FR-ASM-001) | no results, approximate counts |
| SCR-ASM-002 | Challenge and assessment detail | `/challenges/:id`, `/assessments/:id` | GUE, CAN, STD, INS | Rules, policy box and start (FR-ASM-002) | cooldown, not eligible, resume, acknowledgment pending |
| SCR-ASM-003 | Coding workspace | `/challenges/:id/attempt` | CAN, STD, INS | Edit, run, submit (FR-ASM-003, 004) | queued, running, rate limited, runner unavailable, unverified |
| SCR-ASM-004 | Objective attempt | `/assessments/:id/attempt` | CAN, STD, INS | Questions, navigator, timer (FR-ASM-005, 029, 030) | saved, offline queue, deadline passed, submit confirm |
| SCR-ASM-005 | Scenario attempt | `/assessments/:id/scenario` | CAN, STD, INS | Branching scenario (FR-ASM-006) | awaiting manual review |
| SCR-ASM-006 | Project submission | `/challenges/:id/project` | CAN, STD, INS | Project submit and status (FR-ASM-007) | link unreachable, in review |
| SCR-ASM-007 | System design workspace | `/challenges/:id/design` | CAN, STD, INS | Canvas and notes (FR-ASM-008) | outline mode |
| SCR-ASM-008 | SQL workspace | `/challenges/:id/sql` | CAN, STD, INS | Schema, editor, results (FR-ASM-009) | timeout, syntax error |
| SCR-ASM-009 | Data workspace | `/challenges/:id/notebook` | CAN, STD, INS | Notebook and submit (FR-ASM-010) | kernel restart |
| SCR-ASM-010 | Practice hub | `/practice` | CAN, STD, INS | Practice entry and history (FR-ASM-011) | none |
| SCR-ASM-011 | Hints and editorial panel | panel within SCR-ASM-003 | CAN, STD, INS | Hints and solutions (FR-ASM-012) | locked, assisted warning |
| SCR-ASM-012 | Challenge discussion | `/challenges/:id/discuss` | CAN, STD, INS | Threads (FR-ASM-013) | spoiler hidden, disabled |
| SCR-ASM-013 | Challenge sets | `/challenges/sets`, `/challenges/sets/:id` | CAN, STD, INS | Sets and mock rounds (FR-ASM-014) | retired item |
| SCR-ASM-014 | Contest lobby | `/contests/:id` | CAN, STD, INS | Register and enter (FR-ASM-015) | before start, live, ended |
| SCR-ASM-015 | Contest standings | `/contests/:id/standings` | all signed-in | Live standings | frozen, final |
| SCR-ASM-016 | Result page | `/assessments/:id/attempts/:attemptId/result` | CAN, STD, INS | Results and feedback (FR-ASM-050) | passed, failed, under review, unverified, pending manual, voided |
| SCR-ASM-017 | Share dialog and shared view | dialog; `/r/:shareId` | CAN; recipients | Consented sharing (FR-ASM-051) | revoked, expired |
| SCR-ASM-018 | My assessments | `/me/assessments` | CAN, STD, INS | History, reports (FR-ASM-053) | no attempts |
| SCR-ASM-019 | Score report verification | `/verify/report/:id` | GUE, all | Verify score report | valid, under review, voided |
| SCR-ASM-020 | Leaderboard | `/challenges/leaderboard` | GUE, all | Rankings (FR-ASM-052) | opted out, refresh lag |
| SCR-ASM-021 | Certification catalog | `/certifications` | GUE, CAN, STD | Browse certifications (FR-ASM-048) | none |
| SCR-ASM-022 | Certification detail and registration | `/certifications/:id` | CAN, STD | Eligibility and slots (FR-ASM-042) | full, not eligible, registered |
| SCR-ASM-023 | Exam check-in and system check | `/exams/:regId/check-in` | CAN, STD | Pre-exam steps | camera failed, ready |
| SCR-ASM-024 | Proctoring consent | `/exams/:regId/consent` | CAN, STD | Consent and alternative (FR-ASM-036) | declined, alternative chosen |
| SCR-ASM-025 | Identity check | `/exams/:regId/identity` | CAN, STD | Identity verification (FR-ASM-035) | pending, failed |
| SCR-ASM-026 | Accommodations | `/me/accommodations` | CAN, STD | Request and view (FR-ASM-041) | pending, active, denied |
| SCR-ASM-027 | Appeal | `/appeals/:id` | CAN, STD, INS, MOD | File and track (FR-ASM-038) | window closed, decided |
| SCR-ASM-028 | Author assessment list | `/author/assessments` | INS, EAD, IAD, PAD | Manage assessments | filters |
| SCR-ASM-029 | Assessment builder | `/author/assessments/:id` | INS, EAD, IAD, PAD | Build and publish (FR-ASM-016, 022) | validation errors, version conflict |
| SCR-ASM-030 | Composition and integrity settings | `/author/assessments/:id/composition` | INS, EAD, IAD, PAD | Blueprint, randomization, integrity (FR-ASM-021, 031) | unsatisfiable blueprint |
| SCR-ASM-031 | Question editor | `/author/questions/:id` | INS, EAD, IAD, PAD | Item authoring (FR-ASM-017) | review needed |
| SCR-ASM-032 | Question bank | `/author/bank` | INS, EAD, IAD, PAD | Bank (FR-ASM-018) | import report |
| SCR-ASM-033 | Test suite editor | `/author/challenges/:id/tests` | INS, EAD, IAD, PAD | Tests and checkers (FR-ASM-019) | validation run |
| SCR-ASM-034 | Rubric editor | `/author/rubrics/:id` | INS, EAD, IAD, PAD | Rubrics (FR-ASM-020) | total mismatch |
| SCR-ASM-035 | Author analytics and item analysis | `/author/assessments/:id/analytics` | INS, EAD, IAD, PAD | Results and item stats (FR-ASM-044, 056) | insufficient data |
| SCR-ASM-036 | Grading queue and workbench | `/grading`, `/grading/:taskId` | graders | Manual grading (FR-ASM-027) | claimed, moderation |
| SCR-ASM-037 | Integrity review queue | `/staff/integrity` | MOD, PAD | Cases queue (FR-ASM-037) | SLA warning |
| SCR-ASM-038 | Integrity case workbench | `/staff/integrity/:caseId` | MOD, PAD | Evidence and decision | awaiting candidate |
| SCR-ASM-039 | Exam administration | `/staff/exams` | PAD, IAD | Definitions, sessions, seats (FR-ASM-048, 042) | capacity |
| SCR-ASM-040 | Runtime and sandbox operations | `/staff/runtimes` | PAD | Runtimes and pools (FR-ASM-023, 024) | degraded pool |
| SCR-ASM-041 | Fairness dashboard | `/staff/fairness` | PAD, analyst | Fairness reports (FR-ASM-055) | suppressed groups |
| SCR-ASM-042 | Issue triage and regrade | `/author/issues` | authors, MOD, PAD | Reports and remediation (FR-ASM-057) | impact preview |
| SCR-ASM-043 | Employer assignments | `/employer/assessments` | EAD, REC, HMG | Assign and track (FR-ASM-046) | declined, expired |
| SCR-ASM-044 | Employer invitation | `/assessments/invite/:token` | CAN, STD | Consent and accept (FR-ASM-046) | expired, declined |
| SCR-ASM-045 | Employer template builder | `/employer/assessment-templates` | EAD, REC, HMG | Templates (FR-ASM-047) | policy blocked |
| SCR-ASM-046 | Certification record and verification | `/me/certifications`, `/verify/cert/:id` | CAN, GUE | Validity and renewal (FR-ASM-049) | expiring, revoked |
| SCR-ASM-047 | Assessment privacy settings | `/settings/assessments` | CAN, STD | Retention, export, leaderboard visibility (FR-ASM-058) | export pending |

## ATS

Source: [02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md](../02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-ATS-001 | Recruiter home | `/ats` | REC, Coordinator, EAD | Daily tasks | empty, counts, errors |
| SCR-ATS-002 | Requisition list | `/ats/requisitions` | REC, HMG, EAD | Manage requisitions | filters, aging, confidential |
| SCR-ATS-003 | Requisition editor and detail | `/ats/requisitions/:id` | REC, HMG, EAD | Create, approve status | each SM-ATS-01 state |
| SCR-ATS-004 | Approvals inbox | `/ats/approvals` | Approvers | Decide | pending, decided |
| SCR-ATS-005 | Job list | `/ats/jobs` | REC, HMG, EAD | Jobs by status | empty, expiring |
| SCR-ATS-006 | Job authoring studio | `/ats/jobs/:id/edit` | REC, HMG, EAD | Write job | readiness fail/pass, conflicts |
| SCR-ATS-007 | Question builder | `/ats/jobs/:id/questions` | REC, EAD | Define questions | forbidden, preview |
| SCR-ATS-008 | Publish and distribution | `/ats/jobs/:id/publish` | REC, EAD | Review, schedule, distribute | pending review, scheduled, failed board |
| SCR-ATS-009 | Pipeline board | `/ats/jobs/:id/pipeline` | Hiring team | Kanban | loading, conflict toast, blind mode |
| SCR-ATS-010 | Pipeline table and views | `/ats/jobs/:id/table` | Hiring team | Table | saved views |
| SCR-ATS-011 | Application detail | `/ats/applications/:id` | Hiring team | Review | tabs; withdrawn; erased |
| SCR-ATS-012 | Comparison | `/ats/jobs/:id/compare` | Hiring team | Side by side | hidden scores |
| SCR-ATS-013 | Scorecard form | `/ats/scorecards/:id` | Interviewers, REC, HMG | Rate | drafting, submitted, overdue |
| SCR-ATS-014 | Hiring manager workspace | `/ats/manager` | HMG | Decisions | empty |
| SCR-ATS-015 | Talent pools | `/ats/pools` | REC, EAD | CRM | consent status |
| SCR-ATS-016 | Sourcing search | `/ats/sourcing` | REC, EAD | Find candidates | cap reached |
| SCR-ATS-017 | Outreach campaigns | `/ats/outreach` | REC, EAD | Sequences | running, paused |
| SCR-ATS-018 | Duplicates queue | `/ats/duplicates` | REC, EAD | Merge | empty |
| SCR-ATS-019 | Offer editor | `/ats/offers/:id` | REC, EAD | Build, track | each SM-ATS-03 state |
| SCR-ATS-020 | Pipeline and stage settings | `/ats/settings/pipelines` | EAD | Configure | impact preview |
| SCR-ATS-021 | Templates (job, message, scorecard) | `/ats/settings/templates` | EAD, REC | Reuse | versions |
| SCR-ATS-022 | Compliance and DEI | `/ats/compliance` | EAD | Impact reports | small sample |
| SCR-ATS-023 | Audit log | `/ats/audit` | EAD | Review | filters |
| SCR-ATS-024 | Retention and holds | `/ats/settings/retention` | EAD | Policies | preview |
| SCR-ATS-025 | Rights requests | `/ats/rights` | EAD | Fulfil | due soon, escalated |
| SCR-ATS-026 | Reports | `/ats/reports` | REC, HMG, EAD | Analytics | empty period |
| SCR-ATS-027 | AI-assist settings | `/ats/settings/ai` | EAD | Govern AI | off by default |

## BGV

Source: [02_MODULES/BGV_Verification_Background_Checks.md](../02_MODULES/BGV_Verification_Background_Checks.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-BGV-001 | Check catalog admin | `/admin/bgv/catalog` | PAD | Define types (FR-BGV-001) | empty, country matrix |
| SCR-BGV-002 | Screening packages | `/employer/screening/packages` | EAD | Build packages (FR-BGV-001) | draft, needs update |
| SCR-BGV-003 | Rule pack editor | `/admin/bgv/rules` | PAD | Jurisdiction rules (FR-BGV-002) | draft, awaiting second approval, effective |
| SCR-BGV-004 | Identity verification start | `/settings/identity` | CAN | Consent and start (FR-BGV-003) | not started, in progress, verified, expired |
| SCR-BGV-005 | Identity capture (vendor hosted) | external | CAN | Capture and liveness | capturing, failed |
| SCR-BGV-006 | Identity result and mark controls | `/settings/identity/result` | CAN | Badge toggle, share (FR-BGV-004) | verified, expired |
| SCR-BGV-007 | Start checks dialog | modal in ATS | REC, HMG | Initiate, rules and estimate (FR-BGV-013) | blocked, allowed with conditions |
| SCR-BGV-008 | Consent and disclosure | `/checks/:id/consent` | CAN | Consent per type (FR-BGV-014) | unsigned, signed, withdrawn, declined |
| SCR-BGV-009 | Candidate check list | `/checks` | CAN | All requests (FR-BGV-015) | none, active, completed |
| SCR-BGV-010 | Candidate check detail | `/checks/:id` | CAN | Timeline, provide info (FR-BGV-015) | info needed, delayed |
| SCR-BGV-011 | Provide information form | `/checks/:id/info` | CAN | Education, employment, license details | draft, submitted |
| SCR-BGV-012 | Discrepancy explanation | `/checks/:id/items/:itemId/explain` | CAN | Explain mismatch (FR-BGV-005) | open |
| SCR-BGV-013 | Candidate report viewer | `/checks/:id/report` | CAN | Own report copy (FR-BGV-023) | step-up required, retained, purged |
| SCR-BGV-014 | Candidate dispute form | `/checks/:id/dispute` | CAN | Dispute (FR-BGV-024) | open, reinvestigating, resolved |
| SCR-BGV-015 | Employer check list | `/employer/screening` | REC, HMG, EAD | Requests and statuses | filters, empty |
| SCR-BGV-016 | Employer check detail (status view) | `/employer/screening/:id` | REC, HMG, EAD | Status only (FR-BGV-019) | pending, review needed |
| SCR-BGV-017 | Restricted report viewer | `/employer/screening/:id/report` | adjudicators | View report (FR-BGV-019) | reason prompt, step-up, watermark, purged |
| SCR-BGV-018 | Adjudication case | `/employer/screening/:id/case` | adjudicators | Checklist and decision (FR-BGV-020) | assessing, info requested |
| SCR-BGV-019 | Pre-adverse notice | `/employer/screening/:id/pre-adverse` | adjudicators | Preview and send (FR-BGV-021) | countdown, dispute pending |
| SCR-BGV-020 | Final adverse notice | `/employer/screening/:id/final` | adjudicators | Send final (FR-BGV-022) | blocked, ready, sent |
| SCR-BGV-021 | Reference nomination | `/checks/:id/references` | CAN | Nominate referees (FR-BGV-007) | 0 to 4 referees |
| SCR-BGV-022 | Reference results | `/employer/screening/:id/references` | REC, HMG | Completed responses | pending, completed |
| SCR-BGV-023 | Referee response form | `/bgv/ref/:token` | referee | Answer questionnaire (FR-BGV-008) | disclosure, form, declined, expired |
| SCR-BGV-024 | Right-to-work | `/employer/screening/:id/rtw` | EAD, REC | Method and outcome (FR-BGV-010) | share code, document, outcome |
| SCR-BGV-025 | Verified profile bundle (portable) | `/settings/verifications` | CAN | Portable checks (FR-BGV-025) | not started, valid, expiring |
| SCR-BGV-026 | Budget and costs | `/employer/screening/costs` | EAD, FIN | Ledger, budget (FR-BGV-028) | over budget |
| SCR-BGV-027 | Compliance reports and audit log | `/employer/screening/compliance` | EAD | Reports (FR-BGV-027) | filters, export |
| SCR-BGV-028 | Fair hiring dashboard | `/employer/screening/fair-hiring` | EAD | Aggregates (FR-BGV-031) | suppressed cells |
| SCR-BGV-029 | Vendor admin | `/admin/bgv/vendors` | PAD | Adapters and health (FR-BGV-016, 029) | test, live, degraded |
| SCR-BGV-030 | Webhook monitor | `/admin/bgv/webhooks` | PAD | Intake health (FR-BGV-017) | DLQ |
| SCR-BGV-031 | Retention and holds | `/admin/bgv/retention` | PAD | Schedules, disposal logs (FR-BGV-026) | hold active |
| SCR-BGV-032 | Test mode and go-live | `/admin/bgv/test` | PAD, SAD | Sandbox (FR-BGV-030) | test banner, approval |

## BIL

Source: [02_MODULES/BIL_Billing_Plans_Entitlements.md](../02_MODULES/BIL_Billing_Plans_Entitlements.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-BIL-001 | Pricing | `/pricing` | GUE, all | Compare plans | loading, country unsupported, cached |
| SCR-BIL-002 | Checkout summary | `/billing/checkout` | buyers | Confirm plan and details | invalid, processing |
| SCR-BIL-003 | Checkout return | `/billing/success`, `/billing/cancelled` | buyers | Processing and result | processing, delayed, failed |
| SCR-BIL-004 | Billing home | `/billing` | billing owner | Plan, next invoice, methods | past due banner, trial banner |
| SCR-BIL-005 | Change plan | `/billing/plan` | billing owner | Upgrade, downgrade, cancel, pause | preview, over-limit |
| SCR-BIL-006 | Payment methods | `/billing/methods` | billing owner | Manage cards | expiring, only-method |
| SCR-BIL-007 | Invoices | `/billing/invoices` | billing owner | History, PDFs | empty, open invoice |
| SCR-BIL-008 | Refund request | `/billing/invoices/:id/refund` | buyer | Request refund | eligible, outside window |
| SCR-BIL-009 | Usage | `/billing/usage` | all authenticated | Quotas and history | at limit, reset time |
| SCR-BIL-010 | Limit dialog | in-app modal | all | Explain limit and options | hard cap, credits |
| SCR-BIL-011 | Organization billing | `/billing/organization` | EAD | Owner, coverage, seats | no owner, covered list |
| SCR-BIL-012 | Purchase requests | `/billing/purchase-requests` | IAD, EAD | PO flow | draft, awaiting approval, invoiced |
| SCR-BIL-013 | Quote acceptance | `/quotes/:token` | EAD, IAD | Accept enterprise quote | valid, expired |
| SCR-BIL-014 | Earnings | `/earnings` | INS, MNT, FRL | Balances, payouts | onboarding needed, hold, negative |
| SCR-BIL-015 | Order receipt | `/orders/:id` | buyers | Purchase confirmation | paid, activating |
| SCR-BIL-016 | Admin plans and prices | `/admin/billing/plans` | FIN, PAD | Price book | draft, pending approval |
| SCR-BIL-017 | Entitlement keys | `/admin/billing/entitlements` | FIN, PAD | Vocabulary | unenforced warning |
| SCR-BIL-018 | Regions | `/admin/billing/regions` | FIN | Currency and tax mode | conflict |
| SCR-BIL-019 | Coupons | `/admin/billing/coupons` | FIN | Create, revoke | list, near limit |
| SCR-BIL-020 | Refund and dispute queue | `/admin/billing/refunds` | FIN | Decide refunds | awaiting second approval |
| SCR-BIL-021 | Customer billing view | `/admin/billing/customers/:id` | FIN, SUP | Inspect and adjust | restricted for SUP |
| SCR-BIL-022 | Adjustments inbox | `/admin/billing/adjustments` | FIN, PAD | Approve adjustments | pending |
| SCR-BIL-023 | Webhooks | `/admin/billing/webhooks` | FIN, PAD | Event health | dead letters |
| SCR-BIL-024 | Reconciliation | `/admin/billing/reconciliation` | FIN | Resolve discrepancies | clean, items |
| SCR-BIL-025 | Ledger | `/admin/billing/ledger` | FIN | Entries, mappings | period closed |
| SCR-BIL-026 | Pools | `/admin/billing/pools` | FIN | Seat pools | pending, expiring |
| SCR-BIL-027 | Contracts | `/admin/billing/contracts` | FIN, PAD | Quotes and contracts | renewing |
| SCR-BIL-028 | Dunning view | `/admin/billing/dunning` | FIN | Failed payments | extension dialog |
| SCR-BIL-029 | Reports | `/admin/billing/reports` | FIN | Finance reports | suppressed segment |
| SCR-BIL-030 | Compliance | `/admin/billing/compliance` | SAD, FIN | Controls | overdue rotation |
| SCR-BIL-031 | Notification templates | `/admin/billing/templates` | FIN, PAD | Preview templates | locale fallback |

## EMP

Source: [02_MODULES/EMP_Employer_Organisation_Teams_Brand.md](../02_MODULES/EMP_Employer_Organisation_Teams_Brand.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-EMP-001 | Employer start wizard | `/employers/start` | GUE, new owner | Sign-up and checklist | email unverified, claim suggestion |
| SCR-EMP-002 | Verification | `/employers/verification` | EAD | Submit evidence | each SM-EMP-01 verification state |
| SCR-EMP-003 | Company profile editor | `/employers/profile` | EAD, Brand editor | Edit | moderation hold, completeness |
| SCR-EMP-004 | Public company page | `/companies/:slug` | All | Candidate-facing | verified, unverified, suspended |
| SCR-EMP-005 | Careers page designer | `/employers/careers` | EAD, Brand editor | Theme and sections | domain pending, contrast fail |
| SCR-EMP-006 | Brand content | `/employers/brand` | EAD, Brand editor | Media | consent pending |
| SCR-EMP-007 | Embeds and feeds | `/employers/embed` | EAD | Snippets | origin list |
| SCR-EMP-008 | Claim and dispute | `/companies/:slug/claim` | EAD | Claim | disputed |
| SCR-EMP-009 | Team | `/employers/team` | EAD | Members | invited, suspended |
| SCR-EMP-010 | Seats | `/employers/seats` | EAD, Billing | Assign | waitlist, grace |
| SCR-EMP-011 | Roles | `/employers/roles` | EAD | Custom roles | diff |
| SCR-EMP-012 | Structure | `/employers/structure` | EAD | Departments, locations | import preview |
| SCR-EMP-013 | Approval policies | `/employers/approvals` | EAD | Rules | simulator |
| SCR-EMP-014 | Hiring policies | `/employers/policies` | EAD | Defaults | out of bounds |
| SCR-EMP-015 | Organisations (sub-orgs) | `/employers/organisations` | EAD | Tree | detach |
| SCR-EMP-016 | Clients and agencies | `/employers/clients` | EAD | Relationships | paused |
| SCR-EMP-017 | Agency workspace | `/agency` | Agency recruiter | Client contexts | read-only |
| SCR-EMP-018 | Reviews (public) | `/companies/:slug/reviews` | All | Browse | small sample |
| SCR-EMP-019 | Write review | `/companies/:slug/reviews/new` | CAN | Submit | in moderation |
| SCR-EMP-020 | Reviews inbox | `/employers/reviews` | EAD, Brand editor | Respond, flag | unanswered |
| SCR-EMP-021 | Reputation breakdown | `/employers/reputation` | EAD | Components | hidden for small sample |
| SCR-EMP-022 | Billing and usage | `/employers/billing` | EAD, Billing | Entitlements | limit warnings |
| SCR-EMP-023 | Legal and DPA | `/employers/legal` | EAD | Sign | unsigned banner |
| SCR-EMP-024 | Webhooks | `/employers/webhooks` | EAD | Endpoints | degraded, disabled |
| SCR-EMP-025 | Integrations and API keys | `/employers/integrations` | EAD | Connectors | needs reauth |
| SCR-EMP-026 | SSO and SCIM | `/employers/security/sso` | EAD | Configure | enforced |
| SCR-EMP-027 | Security and audit | `/employers/security` | EAD | Policies, log | anomaly |
| SCR-EMP-028 | Notification preferences | `/settings/notifications/employer` | Members | Tune | mandatory locked |
| SCR-EMP-029 | Insights | `/employers/insights` | EAD, Brand editor | Brand analytics | not enough data |
| SCR-EMP-030 | Closure and export | `/employers/settings/close` | EAD owner | Export, close | cooling-off |
| SCR-EMP-031 | Sanction notice and appeal | `/employers/notice` | EAD | Appeal | each SM-EMP-08 state |
| SCR-EMP-032 | Platform verification queue | `/admin/employers/verification` | PAD | Review | risk sorted |

## ENT

Source: [02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md](../02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-ENT-001 | Enterprise setup wizard | `/enterprise/setup` | EAD, EXA | Create and activate workspace | Steps, checks failing |
| SCR-ENT-002 | Identity and provisioning | `/enterprise/identity` | EXA | SSO, SCIM, HRIS, test and logs | Test results, failures |
| SCR-ENT-003 | Directory and members | `/enterprise/members` | EXA | Members, link status, roles | Unlinked, suspended |
| SCR-ENT-004 | Access and roles | `/enterprise/access` | EXA, EAD | Roles, scopes, approvals | Pending approval |
| SCR-ENT-005 | Job architecture | `/enterprise/jobs/architecture` | EXA | Profiles and mappings | Unmapped |
| SCR-ENT-006 | Skills map and gaps | `/enterprise/skills` | EXA | Aggregate map, workforce gaps | Suppressed, low coverage |
| SCR-ENT-007 | Internal job board | `/careers-internal` | CAN | Browse and filter internal postings | Eligible, ineligible reasons |
| SCR-ENT-008 | Internal posting editor | `/enterprise/postings/:id` | REC, HMG, EXA | Create and manage postings | Approval, internal-first |
| SCR-ENT-009 | Internal pipeline | `/enterprise/postings/:id/pipeline` | REC, HMG | Review, interview, offer, transfer | Stages, SLA warnings |
| SCR-ENT-010 | My applications | `/me/enterprise/applications` | CAN | Track, withdraw, see who sees what | Confidential banner |
| SCR-ENT-011 | Gigs board and editor | `/enterprise/gigs` | CAN, HMG | Browse, apply, approve | Allocation, approval |
| SCR-ENT-012 | Employee career hub | `/me/enterprise` | CAN | Learning, jobs, plan, privacy | Unlinked, suspended |
| SCR-ENT-013 | My skills inventory | `/me/enterprise/skills` | CAN | Manage skills and visibility | Stale, endorsed |
| SCR-ENT-014 | Mobility preferences | `/me/enterprise/mobility` | CAN | Opt-in and visibility | Off, passive, active |
| SCR-ENT-015 | Development plan | `/me/enterprise/plan` | CAN | Goals and actions | Shared, private |
| SCR-ENT-016 | What my employer sees and access log | `/me/enterprise/privacy` | CAN | Projection and log | Entries, concern form |
| SCR-ENT-017 | Learning assignments console | `/enterprise/learning` | EXA | Assign and track | Audience counts |
| SCR-ENT-018 | Compliance dashboard | `/enterprise/compliance` | EXA, auditor | Requirements, status, audit export | Overdue, waived |
| SCR-ENT-019 | Learning paths | `/enterprise/paths` | EXA | Build and publish paths | Cycle error |
| SCR-ENT-020 | My learning | `/me/enterprise/learning` | CAN | Assigned and requested learning | Due soon, overdue |
| SCR-ENT-021 | Learning requests | `/enterprise/requests` | CAN, HMG, EXA | Request and approve | Pending, escalated |
| SCR-ENT-022 | Talent review and succession | `/enterprise/talent-review` | Reviewers, EXA | Cycle, nominations, slates | Locked, restricted |
| SCR-ENT-023 | Manager workspace | `/enterprise/manager` | HMG | Tasks, reports, aggregates | Empty, suppressed |
| SCR-ENT-024 | Regional policy | `/enterprise/regions` | EXA, EAD | Country feature matrix | Needs acknowledgement |
| SCR-ENT-025 | Reports and exports | `/enterprise/reports` | EXA | Aggregates, purpose-bound exports | Suppressed, expired link |
| SCR-ENT-026 | Notification channels | `/enterprise/notifications` | EXA | Teams, Slack, email routing | Connector revoked |
| SCR-ENT-027 | Offboarding queue | `/enterprise/offboarding` | EXA | Retention, legal holds | Pending purge |

## EVD

Source: [02_MODULES/EVD_Evidence_Work_History_Credentials.md](../02_MODULES/EVD_Evidence_Work_History_Credentials.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-EVD-001 | Evidence drawer | overlay on claim | CAN | Rung, evidence list, how to strengthen (FR-EVD-001, 003) | empty, partial, disputed |
| SCR-EVD-002 | Skill evidence panel | `/skills/:id/evidence` | CAN | Claim evidence, freshness, strength (FR-EVD-002, 026, 027) | no evidence, stale |
| SCR-EVD-003 | Add evidence | `/evidence/new` | CAN | Upload or link artifact (FR-EVD-003) | uploading, scan failed, unreachable link |
| SCR-EVD-004 | Contribution connect | `/evidence/connect` | CAN | OAuth and repo selection (FR-EVD-007) | connected, needs reconnect |
| SCR-EVD-005 | Project review request and review form | `/reviews/:id` | CAN, INS, MNT | Request and perform review (FR-EVD-006) | pending, conflict, submitted |
| SCR-EVD-006 | Verify a role wizard | `/verify-role/:entryId` | CAN | Start work history verification (FR-EVD-008) | step n, bounced, expired |
| SCR-EVD-007 | Verification status | `/verifications` | CAN | Track requests (FR-EVD-008) | sent, corrected, confirmed |
| SCR-EVD-008 | Responder portal | `/v/:token` | verifier (token) | Confirm facts (FR-EVD-009) | identity step, form, expired, locked |
| SCR-EVD-009 | Employer verification program | `/employer/verification` | EAD | Contacts, CSV, matches (FR-EVD-010) | upload, match report, approved |
| SCR-EVD-010 | References manager | `/references` | CAN | Request and share references (FR-EVD-011) | none, pending, completed |
| SCR-EVD-011 | Reference response form | `/ref/:token` | referee | Answer questions (FR-EVD-012) | form, submitted, expired |
| SCR-EVD-012 | Endorsements | `/endorsements` | CAN | Given and received (FR-EVD-013, 014) | none, limit reached |
| SCR-EVD-013 | Weight explanation | popover | all | Why this weight (FR-EVD-014) | components shown |
| SCR-EVD-014 | Credential wallet | `/wallet` | CAN | Cards, filters (FR-EVD-017) | empty, expiring, revoked |
| SCR-EVD-015 | Credential detail | `/wallet/:id` | CAN | Details, history, actions | issued, disputed |
| SCR-EVD-016 | Import credential | `/wallet/import` | CAN | Methods and result (FR-EVD-016) | verified, unverified, blocked |
| SCR-EVD-017 | Public verification page | `/verify/:id` | public | Status and signature (FR-EVD-018) | valid, expired, revoked, erased, 429 |
| SCR-EVD-018 | Export credentials | `/wallet/export` | CAN | Formats (FR-EVD-021) | processing, ready |
| SCR-EVD-019 | Selective proof builder | `/wallet/:id/proof` | CAN | Field checklist (FR-EVD-025) | created, expired |
| SCR-EVD-020 | Share evidence | `/share/new` | CAN | Scope, recipient, expiry (FR-EVD-023) | created, limits |
| SCR-EVD-021 | Share manager and access log | `/share` | CAN | Links, log, revoke (FR-EVD-024) | no access, revoked |
| SCR-EVD-022 | Shared evidence viewer | `/s/:token` | recipient | Read scoped evidence | email code, expired, partially unavailable |
| SCR-EVD-023 | Recruiter evidence panel | tab on candidate | REC, HMG | Review evidence (FR-EVD-030) | not shared, changed, declined |
| SCR-EVD-024 | Evidence pack request | modal | REC, CAN | Request and consent | pending, granted |
| SCR-EVD-025 | Dispute form and tracker | `/disputes/:id` | all parties | Open, respond, appeal (FR-EVD-028) | open, decided |
| SCR-EVD-026 | Impact notice | banner and `/impact/:id` | CAN, staff | Downstream effects (FR-EVD-029) | pending consumers |
| SCR-EVD-027 | Narrative editor | `/skills/:id/story` | CAN | Write story (FR-EVD-031) | draft, AI suggestion |
| SCR-EVD-028 | Staff review queue | `/admin/evidence-review` | PAD | Manual decisions (FR-EVD-032) | locked, second approval |
| SCR-EVD-029 | Issuer application and console | `/issuer` | EAD, IAD | Issuer onboarding, templates, keys (FR-EVD-015, 022) | pending, approved, suspended |
| SCR-EVD-030 | Issuer directory | `/issuers` | public | Issuer list | filtered |
| SCR-EVD-031 | Revocation console | `/admin/credentials/:id` | issuer admins, PAD | Suspend, revoke (FR-EVD-020) | impact preview |
| SCR-EVD-032 | API keys and usage | `/employer/api` | EAD | Verification API (FR-EVD-033) | quota, revoked key |

## EVT

Source: [02_MODULES/EVT_Events_Hackathons_Community_Programmes.md](../02_MODULES/EVT_Events_Hackathons_Community_Programmes.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-EVT-001 | Events hub | `/events` | GUE, all | Discover and filter events | Loading, results, empty with alert CTA, error with retry |
| SCR-EVT-002 | Event detail | `/events/:slug` | GUE, all | Overview, agenda, speakers, sponsors, register | Open, full (waitlist), ended, cancelled, invite-only 404 |
| SCR-EVT-003 | Registration flow | `/events/:slug/register` | Signed-in users | Ticket, questions, consents | Validation errors, payment pending, success |
| SCR-EVT-004 | My events | `/me/events` | Signed-in users | Registrations, waitlist, certificates, transfers | Upcoming, past, empty |
| SCR-EVT-005 | Host dashboard | `/host/events` | Hosts | Draft, published, ended events and tasks | Empty first-run, list |
| SCR-EVT-006 | Event editor | `/host/events/:id/edit` | Hosts | Details, agenda, tickets, questions, team, rooms, sponsors | Autosave states, conflict, read-only |
| SCR-EVT-007 | Publish checklist | `/host/events/:id/publish` | Hosts | Pre-flight and review status | Failing items, in review, rejected |
| SCR-EVT-008 | Attendee manager | `/host/events/:id/attendees` | Hosts | Approvals, waitlist, invites, export | Bulk selection, progress, empty |
| SCR-EVT-009 | Announcements | `/host/events/:id/announce` | Hosts | Compose and schedule updates | Draft, scheduled, sent report |
| SCR-EVT-010 | Check-in scanner | `/host/events/:id/checkin` | Hosts, staff | Scan, search, mark present | Valid, duplicate, invalid, offline |
| SCR-EVT-011 | Live event room page | `/events/:slug/live` | Registrants | Join link, Q&A, polls | Before window, live, ended |
| SCR-EVT-012 | Replay | `/events/:slug/replay` | Per access setting | Recording with captions | Processing, available, expired |
| SCR-EVT-013 | Career fair floor | `/events/:slug/fair` | Candidates, hosts | Halls and booths | Hall list, booth view, closed |
| SCR-EVT-014 | Booth editor and lead manager | `/host/events/:id/booth/:boothId` | Booth staff | Booth content, slots, shared profiles | Slots, shares, notes |
| SCR-EVT-015 | My shares | `/me/events/shares` | CAN, STD | Review/withdraw shared data | List, withdrawn |
| SCR-EVT-016 | Hackathon home | `/events/:slug/hackathon` | Participants | Timeline, rules, tracks, prizes | Phase banners |
| SCR-EVT-017 | Team finder and team page | `/events/:slug/teams` | Participants | Create, join, manage team | Open, full, locked |
| SCR-EVT-018 | Submission editor | `/events/:slug/submission` | Team members | Submit project | Draft, submitted, locked |
| SCR-EVT-019 | Judging console | `/judge/events/:id` | Judges | Assigned submissions and scoring | Conflicts, progress |
| SCR-EVT-020 | Results and prizes | `/events/:slug/results` | All, hosts | Leaderboard and fulfillment | Pending, published, corrected |
| SCR-EVT-021 | Event privacy | `/me/events/privacy` | CAN, STD | Consents and access log | Toggles, log |
| SCR-EVT-022 | Organizer analytics | `/host/events/:id/analytics` | Hosts | Funnel and outcomes | No data, suppressed cells |
| SCR-EVT-023 | Moderation queue | `/admin/events/reports` | MOD, PAD | Triage event reports and review queue | Empty, backlog |
| SCR-EVT-024 | Series and programme page | `/series/:slug` | All | Follow, enroll, progress | Instances, completed |

## GIG

Source: [02_MODULES/GIG_Freelance_Contract_Project_Work.md](../02_MODULES/GIG_Freelance_Contract_Project_Work.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-GIG-001 | Start freelancing | `/freelance/start` | CAN | Explain, activate | underage blocked |
| SCR-GIG-002 | Requirements checklist | `/freelance/requirements` | FRL | Identity, payout, tax | partial, expired |
| SCR-GIG-003 | Freelancer profile editor | `/freelance/profile` | FRL | Services and evidence | preview |
| SCR-GIG-004 | Freelancer public page | `/freelancers/:slug` | all | View services | paused, NDA items |
| SCR-GIG-005 | Project brief editor | `/projects/new` | Client | Create brief | blockers, warnings |
| SCR-GIG-006 | Listing review queue | `/admin/projects/review` | MOD | Review listings | empty, decision |
| SCR-GIG-007 | Project search | `/projects` | FRL, CAN | Discover | empty, filtered |
| SCR-GIG-008 | Project detail | `/projects/:id` | all | Read brief, propose | NDA teaser, closed |
| SCR-GIG-009 | Invite freelancer dialog | modal | Client | Invite | limit reached |
| SCR-GIG-010 | Proposal form | `/projects/:id/propose` | FRL | Submit proposal | quota, closed |
| SCR-GIG-011 | My proposals | `/freelance/proposals` | FRL | Track | by status |
| SCR-GIG-012 | Proposals comparison | `/projects/:id/proposals` | Client | Compare, shortlist | none, many |
| SCR-GIG-013 | Offer and terms | `/contracts/:id/offer` | Client, FRL | Review and accept | edited resets |
| SCR-GIG-014 | Contract workroom | `/contracts/:id` | parties | Timeline, files | access denied |
| SCR-GIG-015 | Milestone page | `/contracts/:id/milestones/:mid` | parties | Submit, review | submitted, auto-accept countdown |
| SCR-GIG-016 | Change requests | `/contracts/:id/changes` | parties | Propose and agree | pending |
| SCR-GIG-017 | End contract | `/contracts/:id/end` | parties | Complete, cancel, terminate | settlement |
| SCR-GIG-018 | Payment mode and funding | `/contracts/:id/payments` | Client | Mode, funding status | mode unavailable |
| SCR-GIG-019 | Timesheet (gated) | `/contracts/:id/time` | FRL, Client | Time entries | flag off |
| SCR-GIG-020 | Earnings and tax | `/freelance/earnings` | FRL | Payments, forms | held |
| SCR-GIG-021 | Spend and invoices | `/projects/manage/spend` | Client | Costs | failed charge |
| SCR-GIG-022 | Reviews and evidence | `/contracts/:id/reviews` | parties | Rate, confirm | hidden until both |
| SCR-GIG-023 | Dispute center | `/contracts/:id/disputes` | parties | Open, respond | each ladder state |
| SCR-GIG-024 | Dispute review queue | `/admin/projects/disputes` | FIN, MOD | Decide | conflict |
| SCR-GIG-025 | Reputation panel | `/freelance/reputation` | FRL, Client | Metrics | insufficient data |
| SCR-GIG-026 | Fraud and risk queue | `/admin/projects/risk` | MOD, FIN | Flags | held |
| SCR-GIG-027 | NDA and permissions | `/contracts/:id/confidentiality` | parties | NDA, portfolio | pending |
| SCR-GIG-028 | Hire conversion | `/contracts/:id/hire` | Client, FRL | Convert | declined |
| SCR-GIG-029 | Learning projects | `/projects/learning` | STD, IAD, EAD | Learning flow | sign-off |
| SCR-GIG-030 | Freelancer dashboard | `/freelance/dashboard` | FRL | Overview | empty |
| SCR-GIG-031 | Client dashboard | `/projects/manage` | Client | Overview | empty |
| SCR-GIG-032 | Compliance review | `/admin/projects/compliance` | FIN, PAD | Sanctions, classification | hit, cleared |

## IDN

Source: [02_MODULES/IDN_Identity_Authentication_Account.md](../02_MODULES/IDN_Identity_Authentication_Account.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-IDN-001 | Sign in | `/login` | GUE | Email/password, passkey autofill, social, SSO routing | idle, submitting, throttled, MFA required, provider down |
| SCR-IDN-002 | Create account | `/register` | GUE | Registration form | idle, validating, success, error |
| SCR-IDN-003 | Check your email | `/verify-email` | GUE | Code entry and resend | waiting, wrong code, locked, expired, verified |
| SCR-IDN-004 | Provider return and collision | `/auth/callback`, `/auth/link` | GUE | Handle provider return; collision prompt | redirecting, collision, cancelled, error |
| SCR-IDN-005 | SSO routing | `/login/sso` | GUE | Org domain detection and IdP redirect | detecting, redirecting, failed |
| SCR-IDN-006 | Passkey prompt | `/welcome/passkey` | CAN+ | Offer passkey after first password login | offer, in progress, done, dismissed |
| SCR-IDN-007 | Second step | `/login/mfa` | GUE | TOTP, passkey, recovery code | input, wrong, locked, expired |
| SCR-IDN-008 | Email sign-in code | `/login/code` | GUE | Request and enter code; landing confirm | request, waiting, confirm, expired |
| SCR-IDN-009 | Reset password | `/forgot-password`, `/reset-password` | GUE | Request and set | request, sent, invalid token, success |
| SCR-IDN-010 | Can't sign in | `/recover` | GUE | Start account recovery | start, held status, ready, complete, cancelled |
| SCR-IDN-011 | Onboarding wizard | `/welcome` | CAN+ | Goal selection and steps | per step states, resume |
| SCR-IDN-012 | Context switcher | top-bar component | CAN+ | Switch active role context | single (hidden), multiple, step-up |
| SCR-IDN-013 | Invitation landing | `/invite/:token` | GUE, any | Accept or decline org invitation | valid, wrong account, expired, accepted |
| SCR-IDN-014 | Security settings | `/settings/security` | all authed | Password, passkeys, TOTP, phone, linked methods, deactivate | per card states |
| SCR-IDN-015 | Where you're signed in | `/settings/security/sessions` | all authed | Sessions and devices | loading, list, empty, error |
| SCR-IDN-016 | Security activity | `/settings/security/activity` | all authed | Personal security log | loading, empty, list |
| SCR-IDN-017 | Two-step verification | `/settings/security/mfa` | all authed | Enroll, manage, recovery codes | off, pending, on, policy-required |
| SCR-IDN-018 | Cancel deletion | `/account/pending-deletion` | pending_erasure holder | Cancel erasure in cooling-off | countdown date, cancelled, final |
| SCR-IDN-019 | Appeal | `/account/appeal` | suspended holder | Notice and appeal | no appeal, drafting, submitted, decided |
| SCR-IDN-020 | Org security and SSO | `/org/:id/settings/security` | EAD, IAD | SSO, MFA requirement, domains | unconfigured, tested, enforced |
| SCR-IDN-021 | Members and invitations | `/org/:id/members` | EAD, IAD | Members, roles, invitations, join requests | empty, list, last-admin blocked |
| SCR-IDN-022 | Re-authentication modal | overlay | all authed | Step-up | prompt, verifying, failed |
| SCR-IDN-023 | Policy update gate | `/policy-update` | all authed | Re-accept policies | grace, blocking |
| SCR-IDN-024 | Reactivate account | `/account/reactivate` | deactivated holder | Reactivation offer | offer, done |
| SCR-IDN-025 | Age block | `/register/age` | GUE | Under-age message | blocked |
| SCR-IDN-026 | Support grant request | `/support/access` | SUP, PAD | Request and approve impersonation | requested, awaiting approval, active |
| SCR-IDN-027 | View-as banner | overlay | SUP, PAD | Persistent read-only banner | active, expiring |
| SCR-IDN-028 | Staff grants | `/admin/roles` | SAD | Dual-control staff grants and review | requested, approved, expired |
| SCR-IDN-029 | Session expired interstitial | `/signed-out` | GUE | Explain sign-out reason | expired, revoked, reuse |
| SCR-IDN-030 | Abuse dashboard | `/admin/auth-abuse` | PAD, SAD | Thresholds and attack view | normal, attack, provider down |

## INS

Source: [02_MODULES/INS_Institutions_Managed_Learning.md](../02_MODULES/INS_Institutions_Managed_Learning.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-INS-001 | Institution application | `/institutions/apply` | CAN | Create and submit tenant | draft, validation errors, submitted |
| SCR-INS-002 | Verification status | `/institution/verification` | IAD | Provide proofs, see status | pending, passed, failed, changes requested |
| SCR-INS-003 | Verification review queue | `/admin/institutions/verification` | PAD | Review cases | empty, list, case detail, conflict |
| SCR-INS-004 | Institution profile and branding | `/institution/settings/profile` | IAD | Edit profile, preview | saved, contrast error, conflict |
| SCR-INS-005 | Public institution page | `/i/:slug` | GUE, CAN | Public face | off, on, unverified |
| SCR-INS-006 | Staff and roles | `/institution/staff` | IAD | Manage grants | empty, list, invite modal |
| SCR-INS-007 | Structure | `/institution/structure` | IAD, PLO | Departments, programs, terms | tree, archive blocked |
| SCR-INS-008 | Batches list and detail | `/institution/batches`, `/institution/batches/:id` | IAD, PLO, INS | Batch management | list, tabs, full |
| SCR-INS-009 | Roster | `/institution/roster` | IAD, PLO, INS | Search and act on students | empty, filtered, bulk selected, undo |
| SCR-INS-010 | Student detail drawer | `/institution/roster/:id` | IAD, PLO, INS | Per-student view | tabs, restricted |
| SCR-INS-011 | Invitation acceptance | `/join/:token` | CAN | Accept membership | valid, expired, wrong email |
| SCR-INS-012 | Bulk import wizard | `/institution/import` | IAD | Import students | each step, errors, processing, done |
| SCR-INS-013 | Seats and pools | `/institution/seats` | IAD, FIN | Pools, assignments | low, expiring, mismatch |
| SCR-INS-014 | Course assignments | `/institution/batches/:id/courses` | IAD, INS | Assign courses | insufficient seats, ok |
| SCR-INS-015 | Faculty assignments | `/institution/faculty` | IAD | Teaching matrix | empty, populated |
| SCR-INS-016 | Certificate settings and issued list | `/institution/settings/certificates` | IAD | Template and revoke | preview, revoked |
| SCR-INS-017 | Certificate verification | `/verify/:code` | GUE | Public check | valid, revoked, expired, not found |
| SCR-INS-018 | Progress dashboard | `/institution/progress` | IAD, INS, PLO | Monitor progress | stale, empty |
| SCR-INS-019 | At-risk rules and flags | `/institution/settings/at-risk` | IAD, INS | Configure, review | list, dismissed |
| SCR-INS-020 | Intervention board | `/institution/interventions` | IAD, INS | Cases | board columns, case detail |
| SCR-INS-021 | Placement workspace | `/institution/placement` | PLO, IAD | Readiness and tags | not shared, nudge cooldown |
| SCR-INS-022 | Drives list and wizard | `/institution/placement/drives` | PLO | Create and run drives | draft, published, in rounds |
| SCR-INS-023 | Employer partners | `/institution/placement/employers` | PLO | Partnership list | invited, active, paused |
| SCR-INS-024 | Drive student view | `/me/institution/drives` | STD | See and register | eligible, blocked, registered |
| SCR-INS-025 | Showcase sharing settings | `/me/institution/sharing` | STD | Consent management | off, on, revoked, minor blocked |
| SCR-INS-026 | Employer drive view | `/employer/drives/:id` | REC, EAD | Candidate review | loading, no candidates, closed |
| SCR-INS-027 | Placement outcomes | `/institution/placement/outcomes` | PLO | Record and track | reported, disputed |
| SCR-INS-028 | Institution dashboard | `/institution` | IAD | KPIs | suppressed, stale, empty |
| SCR-INS-029 | Reports | `/institution/reports` | IAD, PLO | Templates and runs | running, ready, restated |
| SCR-INS-030 | Graduation (admin) | `/institution/graduation` | IAD | Schedule and monitor | preview, running |
| SCR-INS-031 | Graduation (student) | `/me/institution/graduation` | STD | Choose what stays | prompted, completed |
| SCR-INS-032 | Alumni outcomes and surveys | `/institution/alumni/outcomes` | PLO | Surveys | draft, sent, responses |
| SCR-INS-033 | SSO settings | `/institution/settings/sso` | IAD | Configure SSO | test passed, failed |
| SCR-INS-034 | LTI settings | `/institution/settings/lti` | IAD | Platforms and mappings | launch log |
| SCR-INS-035 | Roster sync | `/institution/settings/roster-sync` | IAD | Sync runs | guard tripped |
| SCR-INS-036 | Guardian consent page | `/guardian/:token` | Guardian | Grant per purpose | pending, granted, expired |
| SCR-INS-037 | Privacy and disclosures | `/institution/privacy` | IAD | Requests and log | deadline near |
| SCR-INS-038 | My records | `/me/institution/records` | STD | See, request copy | request open |
| SCR-INS-039 | Data and offboarding | `/institution/settings/data` | IAD | Export, offboard | countdown |

## INT

Source: [02_MODULES/INT_Interviews_Scheduling.md](../02_MODULES/INT_Interviews_Scheduling.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-INT-001 | Interview plans | `/interviews/plans` | REC, HMG, EAD | Plans and rounds | versions, in use |
| SCR-INT-002 | Kits and question bank | `/interviews/kits` | REC, HMG, EAD | Questions | lint blocked |
| SCR-INT-003 | Interviewer pool | `/interviews/interviewers` | EAD, REC | Qualifications and load | paused |
| SCR-INT-004 | Calendar settings | `/settings/calendar` | Employer members | Connect and availability | connected, needs reauth |
| SCR-INT-005 | Scheduler panel | modal on application | REC, Coordinator | Offer, book | no common slots |
| SCR-INT-006 | Self-schedule page | `/schedule/:token` | Candidate (signed link) | Pick slot | expired, taken, booked |
| SCR-INT-007 | Negotiation inbox | `/interviews/negotiations` | REC, Coordinator | Proposals | open |
| SCR-INT-008 | Candidate interview hub | `/interviews/:id/hub` | Candidate | Prepare and join | pre-open, open, cancelled |
| SCR-INT-009 | Pre-join and lobby | `/room/:id/join` | Participants | Devices, lobby | permission denied |
| SCR-INT-010 | Live room | `/room/:id` | Participants | Video, chat, tools | live, reconnecting |
| SCR-INT-011 | Room live notes panel | in room | Interviewers | Notes, markers | offline buffer |
| SCR-INT-012 | Code and whiteboard | in room | Participants | Collaboration | sandbox down |
| SCR-INT-013 | Interview record | `/interviews/:id` | Hiring team | Details, recording, transcript | each SM-INT-01 state |
| SCR-INT-014 | Async setup | `/interviews/async/:id` | REC, HMG | Define | preview |
| SCR-INT-015 | Async candidate flow | `/async/:token` | Candidate | Answer | resume, expired |
| SCR-INT-016 | Async review queue | `/interviews/async/review` | Reviewers | Rate | empty |
| SCR-INT-017 | Feedback tasks | `/interviews/feedback` | Interviewers | Submit feedback | overdue |
| SCR-INT-018 | Debrief | `/interviews/:id/debrief` | Hiring team | Decide | missing feedback |
| SCR-INT-019 | Accommodation queue | `/interviews/accommodations` | REC, Coordinator | Fulfil | urgent |
| SCR-INT-020 | Operations dashboard | `/interviews` | Coordinator, REC, EAD | Overview | risks |
| SCR-INT-021 | Retention and access log | `/interviews/:id/media` | Hiring team, EAD | Media controls | hold, expiring |

## JOB

Source: [02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md](../02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-JOB-001 | Job feed | `/jobs` | GUE, CAN, STD, FRL | Browse tabs | loading, empty, degraded, error |
| SCR-JOB-002 | Search results | `/jobs/search` | GUE, CAN, STD, FRL | Query and filter | no results, filtered, degraded |
| SCR-JOB-003 | Job detail | `/jobs/:jobId` | All | Evaluate and apply | live, closed (410), taken down, imported, warning banner |
| SCR-JOB-004 | Saved jobs | `/jobs/saved` | CAN, STD, FRL | Manage saved | empty, closed items, limit reached |
| SCR-JOB-005 | Saved searches | `/jobs/searches` | CAN, STD, FRL | Manage searches | empty, paused, suspended |
| SCR-JOB-006 | Easy apply sheet | modal on `/jobs/:jobId` | CAN, STD, FRL | One-step apply | gates failed, submitting, success |
| SCR-JOB-007 | Application form | `/jobs/:jobId/apply` | CAN, STD, FRL | Multi-step apply | per step, offline, definition changed, closed |
| SCR-JOB-008 | Application tracker | `/applications` | CAN, STD, FRL | All applications | tabs, empty, needs action |
| SCR-JOB-009 | Application detail | `/applications/:applicationId` | CAN, STD, FRL | Timeline and actions | each SM-JOB-01 state, listing removed |
| SCR-JOB-010 | Interview invite | `/applications/:applicationId/interviews/:inviteId` | CAN, STD, FRL | Respond to invite | pending, expired, confirmed |
| SCR-JOB-011 | Offer view | `/applications/:applicationId/offer` | CAN, STD, FRL | Review and decide | extended, expired, rescinded, accepted |
| SCR-JOB-012 | Report dialog | modal | GUE, CAN, STD, FRL | Report listing | submitting, success, rate limited |
| SCR-JOB-013 | Hidden items | `/settings/jobs/hidden` | CAN, STD, FRL | Unhide | empty, populated |
| SCR-JOB-014 | Job search preferences | `/settings/jobs` | CAN, STD, FRL | Preferences, blocks | saved, validation errors |
| SCR-JOB-015 | Alert preferences | `/settings/notifications/jobs` | CAN, STD, FRL | Alert controls | paused, all off |
| SCR-JOB-016 | Track external job | `/applications/external/new` | CAN, STD, FRL | Self-report | fetched, manual, duplicate |
| SCR-JOB-017 | Following | `/jobs/following` | CAN, STD, FRL | Followed companies | empty, populated |
| SCR-JOB-018 | Job data export | `/settings/privacy/jobs-data` | CAN, STD, FRL | Export and delete | queued, ready, expired |
| SCR-JOB-019 | Listing risk queue | `/admin/jobs/risk` | MOD, PAD | Review suspect listings | empty, high risk first |
| SCR-JOB-020 | Import sources | `/admin/jobs/imports` | PAD | Configure imports | failing, healthy |

## LRN

Source: [02_MODULES/LRN_Learning_Course_Experience.md](../02_MODULES/LRN_Learning_Course_Experience.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-LRN-001 | Learn home | `/learn` | GUE, CAN, STD | Curated rails and entry to catalog | rails loading per rail, personalized vs generic |
| SCR-LRN-002 | Course catalog and search results | `/learn/courses` | GUE, CAN, STD | List, search, filter, sort (FR-LRN-001 to 004) | zero results, filter conflict, index behind |
| SCR-LRN-003 | Category page | `/learn/c/:slug` | GUE, CAN, STD | Category description and courses | retired category redirect |
| SCR-LRN-004 | Skill and goal page | `/learn/skills/:skill`, `/learn/goals/:goalSlug` | GUE, CAN, STD | Skill-based browse and gap view | consent missing, no courses |
| SCR-LRN-005 | Course comparison | `/learn/compare` | GUE, CAN, STD | Side-by-side compare | course unavailable column |
| SCR-LRN-006 | Saved courses | `/learn/saved` | CAN, STD | Wishlist | list full, price dropped, unavailable |
| SCR-LRN-007 | Course detail | `/learn/courses/:slug` | GUE, CAN, STD, INS | Detail, curriculum, reviews, action | not enrolled, enrolled, locked with reason, 410 |
| SCR-LRN-008 | Enroll confirmation | `/learn/courses/:slug/enroll` | CAN, STD | Confirm free or invite enrollment | gate blocked, success |
| SCR-LRN-009 | Payment status | `/learn/enrollments/:id/status` | CAN, STD | Pending payment confirmation | processing, failed, succeeded, expired |
| SCR-LRN-010 | Redeem code | `/learn/redeem` | CAN, STD | Access and discount codes | invalid, exhausted, rate limited |
| SCR-LRN-011 | Path and track catalog | `/learn/paths` | GUE, CAN, STD | Browse paths and tracks | empty track |
| SCR-LRN-012 | Path or track detail | `/learn/paths/:slug`, `/learn/tracks/:slug` | GUE, CAN, STD | Path structure and enrollment | sequenced locked members, unavailable member |
| SCR-LRN-013 | Learner dashboard | `/learn/home` | CAN, STD | What to do next | first-steps, card error |
| SCR-LRN-014 | My courses and history | `/me/learning/courses` | CAN, STD | Enrollments by state and transcript | tabs with counts, expiring, assigned |
| SCR-LRN-015 | Learning player | `/learn/courses/:slug/lessons/:lessonKey` | CAN, STD, GUE (preview) | All lesson types, panels, drawer | locked, preview, expired read-only, sync pending |
| SCR-LRN-016 | Assignment workspace | `/learn/courses/:slug/assignments/:id` | CAN, STD | Brief, draft, submit, feedback | draft, submitted, in review, graded, late |
| SCR-LRN-017 | Peer review workspace | `/learn/courses/:slug/reviews/:id` | CAN, STD | Review queue and forms | queue empty, overdue |
| SCR-LRN-018 | Project workspace | `/learn/courses/:slug/projects/:id` | CAN, STD | Milestones and team | team unconfirmed, milestone due |
| SCR-LRN-019 | Live session lobby and room | `/learn/courses/:slug/live/:id` | CAN, STD | Join live session | too early, open, full, ended, recording |
| SCR-LRN-020 | Cohort schedule | `/learn/courses/:slug/schedule` | CAN, STD | Calendar and deadlines | no schedule, past |
| SCR-LRN-021 | Course Q&A | `/learn/courses/:slug/qa` | CAN, STD | Questions and answers | no answers, rate limited |
| SCR-LRN-022 | Discussion forum | `/learn/courses/:slug/discuss` | CAN, STD | Threads and categories | locked thread, hidden post |
| SCR-LRN-023 | Notes and bookmarks | `/me/learning/notes` | CAN, STD | Search and export notes | none, quota near |
| SCR-LRN-024 | Announcements | `/learn/courses/:slug/announcements` | CAN, STD | Instructor updates | none, muted |
| SCR-LRN-025 | Gradebook | `/learn/courses/:slug/grades` | CAN, STD | Scores, weights, what-if | pending items, disputed |
| SCR-LRN-026 | Course completion | `/learn/courses/:slug/complete` | CAN, STD | Completion summary and next steps | awaiting sign-off, evidence pending |
| SCR-LRN-027 | Certificates | `/me/certificates`, `/me/certificates/:id` | CAN, STD | View, download, share | pending render, revoked, superseded |
| SCR-LRN-028 | Certificate verification | `/verify/:certId` | GUE, all | Public verification | valid, revoked, expired, private, not found |
| SCR-LRN-029 | Review composer | `/learn/courses/:slug/review` | CAN, STD | Write or edit review | ineligible, held |
| SCR-LRN-030 | Goals and learning plan | `/me/learning/plan` | CAN, STD | Goals, plan, study blocks | over capacity, paused goal |
| SCR-LRN-031 | Learning insights | `/me/learning/insights` | CAN, STD | Learner analytics | insufficient data |
| SCR-LRN-032 | Achievements | `/me/learning/achievements` | CAN, STD | Earned and locked | engine delayed |
| SCR-LRN-033 | Downloads manager | `/me/learning/downloads` | CAN, STD | Offline lessons and devices | device limit, expiring, storage full |
| SCR-LRN-034 | Study groups | `/learn/groups` | CAN, STD | Groups and check-ins | full group, no matches |
| SCR-LRN-035 | Learning settings | `/settings/learning` | CAN, STD | Player, reminders, personalization, accessibility, data export | export in progress |
| SCR-LRN-036 | Refund request | `/me/learning/orders/:id/refund` | CAN, STD | Refund eligibility and request | eligible, pro-rated, not eligible, processing |
| SCR-LRN-037 | Report a problem dialog | modal (no route) | GUE, CAN, STD | Content problem report | submitted, duplicate |
| SCR-LRN-038 | Daily review | `/me/learning/review` | CAN, STD | Spaced repetition session | none due, backlog capped |

## MEN

Source: [02_MODULES/MEN_Mentorship_Coaching_Career_Services.md](../02_MODULES/MEN_Mentorship_Coaching_Career_Services.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-MEN-001 | Become a mentor | `/mentoring/become-a-mentor` | CAN | Application form | draft, blocked claim, submitted |
| SCR-MEN-002 | Verification status | `/mentoring/verification` | MNT | Checklist | pending, expired |
| SCR-MEN-003 | Applications review | `/admin/mentoring/applications` | PAD, MOD | Review queue | empty, conflict |
| SCR-MEN-004 | Availability and rates | `/mentoring/availability` | MNT | Slots, rates | calendar disconnected |
| SCR-MEN-005 | Mentor directory | `/mentoring` | all | Search | empty, filtered |
| SCR-MEN-006 | Mentor profile | `/mentors/:slug` | all | Public listing | paused, not accepting |
| SCR-MEN-007 | Intake | `/mentoring/intake` | CAN, STD | Needs and sharing | saved, warning |
| SCR-MEN-008 | Suggestions | `/mentoring/suggestions` | CAN, STD | Matches with reasons | none |
| SCR-MEN-009 | Request form and inbox | `/mentoring/requests` | CAN, MNT | Send and answer | limit reached |
| SCR-MEN-010 | Booking | `/mentoring/book/:mentor` | CAN, STD | Pick slot, pay | held, taken |
| SCR-MEN-011 | Session page | `/mentoring/sessions/:id` | participants | Join, agenda, notes | window closed |
| SCR-MEN-012 | Notes and actions | `/mentoring/sessions/:id/notes` | participants | Private and shared | conflict |
| SCR-MEN-013 | Feedback | `/mentoring/sessions/:id/feedback` | participants | Rate | hidden until both |
| SCR-MEN-014 | Relationship and plan | `/mentoring/relationships/:id` | pair | Goals, check-ins | paused |
| SCR-MEN-015 | Dashboard | `/mentoring/dashboard` | CAN, MNT | Overview | empty |
| SCR-MEN-016 | Program builder | `/programs/new` | IAD, EAD, PLO | Create program | invalid |
| SCR-MEN-017 | Program page and apply | `/programs/:id` | all | Apply | closed |
| SCR-MEN-018 | Program dashboard | `/programs/:id/dashboard` | organizers | Metrics | suppressed |
| SCR-MEN-019 | Pairing board | `/programs/:id/pairing` | organizers | Assign | capacity |
| SCR-MEN-020 | Peer mentoring | `/mentoring/peers` | CAN, STD | Opt in, find | not enabled |
| SCR-MEN-021 | Resume review order and viewer | `/career-services/resume-review` | CAN, MNT | Order, annotate | late |
| SCR-MEN-022 | Mock interview | `/career-services/mock-interview` | CAN, MNT | Book, scorecard | pending scorecard |
| SCR-MEN-023 | Packages | `/mentoring/packages` | MNT, CAN | Create, buy | expiring |
| SCR-MEN-024 | Group sessions and experts | `/mentoring/group`, `/experts` | all | Join, request | full, waitlist |
| SCR-MEN-025 | Report a concern | modal | all | Safeguarding | submitted |
| SCR-MEN-026 | Safeguarding queue | `/admin/mentoring/reports` | MOD, PAD | Decide | urgent |
| SCR-MEN-027 | Quality management | `/admin/mentoring/quality` | PAD, MOD | Flags | flagged |
| SCR-MEN-028 | Disputes | `/mentoring/disputes`, `/admin/mentoring/disputes` | participants, FIN | Resolve | open, decided |
| SCR-MEN-029 | Earnings | `/earnings` (BIL SCR-BIL-014) | MNT | Statements | hold |
| SCR-MEN-030 | Conflict disclosures | `/mentoring/disclosures` | MNT | Declare | incomplete |

## MKT

Source: [02_MODULES/MKT_Market_Intelligence_Career_Pathing.md](../02_MODULES/MKT_Market_Intelligence_Career_Pathing.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-MKT-001 | Market insights explorer | `/market` | All | Demand, supply, trend by skill, role, region | Loading, suppressed cell, stale banner, empty |
| SCR-MKT-002 | Skill detail | `/market/skills/:skillId` | All | Description, relationships, demand, related roles | Deprecated redirect |
| SCR-MKT-003 | Regional gap map | `/market/gaps` | Signed-in | Heat map and ranked list | Threshold greyed regions |
| SCR-MKT-004 | Trends and forecast | `/market/trends` | Signed-in | Forecast with intervals | Low confidence, withheld |
| SCR-MKT-005 | Salary benchmarks | `/salaries` | GUE (national), signed-in | Bands, trend, methodology | Not enough reports, currency failure |
| SCR-MKT-006 | Career path explorer | `/careers` | All | Role transition graph and details | Sparse role, skill-similarity mode |
| SCR-MKT-007 | Role detail | `/careers/roles/:roleId` | All | Requirements, pay, demand | Deprecated redirect |
| SCR-MKT-008 | Skill-gap analysis | `/me/careers/gap` | CAN, STD | Compare skills to target role | Outdated, empty profile |
| SCR-MKT-009 | Readiness and time estimate | `/me/careers/readiness/:id` | CAN, STD | Factors and range | Insufficient data |
| SCR-MKT-010 | Action plan | `/me/careers/plan/:id` | CAN, STD | Plan items and progress | Item unavailable |
| SCR-MKT-011 | Compare careers | `/careers/compare` | CAN, STD | Side-by-side roles | Missing cells |
| SCR-MKT-012 | Add salary / equity | `/salaries/contribute` | Signed-in | Submit and manage reports | Validation, under review, withdrawn |
| SCR-MKT-013 | My contributions | `/me/market/contributions` | Signed-in | Salary, transitions, withdrawal | Empty, pending |
| SCR-MKT-014 | Employer market view | `/employer/market` | REC, HMG, EAD, EXA | Workforce planning, benchmarks | No entitlement, thin data |
| SCR-MKT-015 | Pay-equity analysis | `/employer/market/equity` | EAD, EXA | Upload and aggregate report | Parsing errors, suppressed cells |
| SCR-MKT-016 | Market data consent | `/settings/privacy/market` | Signed-in | Contribution consents | Toggles, history |
| SCR-MKT-017 | Institution market dashboard | `/institution/market` | IAD, PLO | Programme alignment | Unmapped programme |
| SCR-MKT-018 | Admin: skills catalogue | `/admin/market/skills` | PAD | Create, merge, deprecate | Duplicates, conflicts |
| SCR-MKT-019 | Admin: taxonomy versions | `/admin/market/versions` | PAD | Draft, approve, publish | Migration progress |
| SCR-MKT-020 | Admin: data quality and sources | `/admin/market/data` | PAD | Pipeline, sources, quality queue | Alerts, license expiry |
| SCR-MKT-021 | Admin: privacy policy and fairness | `/admin/market/policy` | PAD, SAD | k parameters, simulation, reviews | Simulation results |
| SCR-MKT-022 | Partner API and exports | `/settings/market/api` | IAD, EXA, PAD | Grants, keys, usage, exports | Pending, revoked |

## MSG

Source: [02_MODULES/MSG_Messaging_Realtime_Communication.md](../02_MODULES/MSG_Messaging_Realtime_Communication.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-MSG-001 | Messages home | `/messages` | members | Conversation list and tabs | loading, empty, degraded-connection |
| SCR-MSG-002 | Conversation view | `/messages/:id` | participants | Thread and composer | sending, failed, closed, scanning |
| SCR-MSG-003 | New message | `/messages/new` | members | Pick recipient | request-mode, unavailable |
| SCR-MSG-004 | Message requests | `/messages/requests` | members | Accept, decline, ignore | empty, bulk-select |
| SCR-MSG-005 | Outreach tab | `/messages/outreach` | REC, HMG, EAD | Sent outreach and states | empty, cap-reached |
| SCR-MSG-006 | Outreach composer | modal or `/messages/outreach/new` | REC, HMG, EAD | Compose outreach | preference-warning, refused |
| SCR-MSG-007 | Outreach usage | `/org/:id/outreach/usage` | EAD, FIN | Cap, credits, ledger | low-balance |
| SCR-MSG-008 | Messaging preferences | `/settings/messaging` | members | Who can message, outreach controls | institution-locked |
| SCR-MSG-009 | Messaging privacy | `/settings/messaging/privacy` | members | Receipts, typing, presence, access log | none |
| SCR-MSG-010 | Notification settings (messages) | `/settings/notifications/messages` | members | Channels and quiet hours | push-denied |
| SCR-MSG-011 | Group create and settings | `/messages/groups/new`, `/messages/:id/settings` | admins | Group management | cap-reached |
| SCR-MSG-012 | Search results | `/messages/search` | members | Search messages | no-results, index-degraded |
| SCR-MSG-013 | Media and files | `/messages/:id/media` | participants | Attachments in a conversation | empty |
| SCR-MSG-014 | Saved replies | `/settings/messaging/templates` | senders | Manage templates | empty |
| SCR-MSG-015 | Org shared inbox | `/org/:id/messages` | REC, HMG, EAD | Assigned threads and notes | unassigned |
| SCR-MSG-016 | Announcements | `/messages/announcements` | members | Read broadcasts | muted |
| SCR-MSG-017 | Broadcast composer | `/messages/announcements/new` | senders | Send announcements | audience-too-large |
| SCR-MSG-018 | Report dialog | modal | participants | Report messages | submitted |
| SCR-MSG-019 | Export | `/settings/data/messages` | members | Request and download export | processing, ready, expired |
| SCR-MSG-020 | Staff access viewer | `/admin/messaging/access` | SUP, SAD, PAD | Scoped content view and audit | consent-pending, expired |
| SCR-MSG-021 | Messaging admin | `/admin/messaging` | PAD | Thresholds, kill switches, health | degraded |
| SCR-MSG-022 | Link interstitial | modal | members | Leaving site warning | blocked |

## NET

Source: [02_MODULES/NET_Networking_Community_Referrals.md](../02_MODULES/NET_Networking_Community_Referrals.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-NET-001 | My Network home | `/network` | CAN, STD, INS, MNT, REC, HMG, EAD, IAD, PLO | Counts, invitations, suggestions | loading, empty, populated, error |
| SCR-NET-002 | Invitations | `/network/invitations` | same | Received and sent requests | empty, bulk-select, error |
| SCR-NET-003 | Connections | `/network/connections` | same | List, search, tags, notes, remove | empty, loading, 30k cap |
| SCR-NET-004 | Following | `/network/following` | same | Manage follows | empty, populated |
| SCR-NET-005 | Discover people | `/network/discover` | same | PYMK and filters | empty, fallback-simplified |
| SCR-NET-006 | Find people I know | `/network/contacts` | adult members | Hashed contact match | consent, processing, results, disabled |
| SCR-NET-007 | Introduction request | `/network/introductions/new/:targetId` | adults | Choose path and write purpose | no-path, cap-reached |
| SCR-NET-008 | Introductions inbox | `/network/introductions` | adults | Introducer decisions and history | empty, populated |
| SCR-NET-009 | Endorsements and recommendations | `/profile/proof` | same | Give, receive, manage | empty, pending |
| SCR-NET-010 | Recommendation editor | `/network/recommendations/:id` | same | Write and submit | draft, saved, rejected |
| SCR-NET-011 | Profile views | `/network/profile-views` | same | Insights and viewing mode | empty, below-threshold |
| SCR-NET-012 | Home feed | `/feed` | members | Top and Recent feed | loading, empty, caught-up, degraded |
| SCR-NET-013 | Post composer | modal on `/feed` | members | Create posts | draft, scanning, error |
| SCR-NET-014 | Post detail | `/posts/:id` | per visibility | Post with comments | deleted, hidden, comments-off |
| SCR-NET-015 | Edit history | `/posts/:id/history` | author, MOD | Versions and diff | empty |
| SCR-NET-016 | Why am I seeing this | popover | members | Explanation | expired-explanation |
| SCR-NET-017 | Feed preferences | `/settings/feed` | members | Muted topics, snoozes, reset | empty |
| SCR-NET-018 | Saved items | `/saved` | members | Bookmarks and folders | empty |
| SCR-NET-019 | Topic page | `/topics/:slug` | members, GUE public | Topic posts and follow | empty |
| SCR-NET-020 | Article editor | `/write` | adults | Article and newsletter composing | autosaved, scheduled |
| SCR-NET-021 | Newsletter settings | `/settings/newsletters` | authors | Cadence, subscribers (aggregate) | none |
| SCR-NET-022 | Groups directory | `/communities` | members | Browse groups | empty, filtered |
| SCR-NET-023 | Group page | `/communities/:slug` | per group type | Posts, members, rules | joined, requested, banned, suspended |
| SCR-NET-024 | Group create or settings | `/communities/new`, `/communities/:slug/settings` | owners, admins | Configure | validation errors |
| SCR-NET-025 | Group admin | `/communities/:slug/admin` | admins, moderators | Queue, members, audit | empty queue |
| SCR-NET-026 | Alumni home | `/alumni` | verified alumni | Alumni group and directory | not-verified |
| SCR-NET-027 | Referral request | `/jobs/:id/referral` | CAN, STD | Request referral | ineligible, quota-reached |
| SCR-NET-028 | Referral inbox | `/network/referrals` | employees | Respond to requests | empty |
| SCR-NET-029 | Refer someone | `/jobs/:id/refer` | verified employees | Employee-initiated referral | quota, invite-sent |
| SCR-NET-030 | My referrals | `/me/referrals` | members | Status of all referrals | empty |
| SCR-NET-031 | Referral programme settings | `/org/:id/referrals/settings` | EAD | Configure programme | draft, saved |
| SCR-NET-032 | Referral rewards queue | `/org/:id/referrals/rewards` | EAD | Approve eligibility | empty |
| SCR-NET-033 | Network privacy settings | `/settings/privacy/network` | members | Visibility and contact controls | locked-by-institution |
| SCR-NET-034 | Blocked and muted | `/settings/privacy/blocked` | members | Manage lists | empty |
| SCR-NET-035 | Ranking admin | `/admin/feed-ranking` | PAD | Versions, experiments, audit | rollout, rolled-back |

## NTF

Source: [02_MODULES/NTF_Notifications_Communication.md](../02_MODULES/NTF_Notifications_Communication.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-NTF-001 | Notification bell and panel | top-bar component | all authenticated | Recent items, unread badge | loading, list, empty, offline |
| SCR-NTF-002 | Notifications page | `/notifications` | all authenticated | Full list, filters, bulk actions | list, empty, bulk mode, archive |
| SCR-NTF-003 | Notification preferences | `/settings/notifications` | all authenticated | Category by channel matrix, digests | loaded, locked cell, saving |
| SCR-NTF-004 | Quiet hours and DND | `/settings/notifications/quiet-hours` | all authenticated | Schedule | off, on, DND |
| SCR-NTF-005 | Push devices | `/settings/notifications/devices` | all authenticated | Manage push devices | none, list, blocked |
| SCR-NTF-006 | SMS settings | `/settings/notifications/sms` | all authenticated | SMS opt-in | off, pending confirmation, on, stopped |
| SCR-NTF-007 | Alerts | `/settings/notifications/alerts` | all authenticated | Alert subscriptions | list, paused |
| SCR-NTF-008 | Reminders | `/reminders` | all authenticated | Scheduled reminders | list, empty |
| SCR-NTF-009 | Message history | `/settings/notifications/history` | all authenticated | Delivery log | list, empty |
| SCR-NTF-010 | Unsubscribe confirmation | `/unsubscribe/:token` | GUE, all | One-step unsubscribe, undo | done, expired, mandatory |
| SCR-NTF-011 | Address problem banner | in-app banner | all authenticated | Undeliverable email help | shown, resolved |
| SCR-NTF-012 | System banner | app shell | all | Broadcast banners | info, warning, critical |
| SCR-NTF-013 | Org notification rules | `/org/:id/settings/notifications` | EAD, IAD, EXA | Team routing and channels | rules list, channel failing |
| SCR-NTF-014 | Notification catalog | `/admin/notifications/catalog` | PAD | Catalog management | list, entry, in review |
| SCR-NTF-015 | Template editor | `/admin/notifications/templates/:key` | PAD, SAD | Edit, preview, approve | draft, review, active |
| SCR-NTF-016 | Locale coverage | `/admin/notifications/locales` | PAD | Translation coverage | matrix |
| SCR-NTF-017 | Delivery operations | `/admin/notifications/deliveries` | PAD, SAD, SUP (G) | Search, timeline, replay | found, not found |
| SCR-NTF-018 | Dead letters | `/admin/notifications/dead-letters` | PAD | Replay failed | list, replay done |
| SCR-NTF-019 | Suppression list | `/admin/notifications/suppression` | PAD, SAD | View and unsuppress | list |
| SCR-NTF-020 | Deliverability dashboard | `/admin/notifications/deliverability` | PAD, SAD | Reputation, DNS | healthy, paused |
| SCR-NTF-021 | Campaigns | `/admin/notifications/campaigns` | PAD, SAD | Create and send | draft, sending, sent |
| SCR-NTF-022 | Broadcasts | `/admin/notifications/broadcasts` | PAD, SAD | Create and manage | draft, active, resolved |
| SCR-NTF-023 | Dev outbox | `/dev/outbox` | non-production only | Captured messages | list, viewer |
| SCR-NTF-024 | Digest preview | `/settings/notifications/digest-preview` | all authenticated | See what the next digest holds | preview, empty |

## PLT

Source: [02_MODULES/PLT_Platform_API_Integrations_Media_Files.md](../02_MODULES/PLT_Platform_API_Integrations_Media_Files.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-PLT-001 | Developer portal home | `developers /` | GUE and all | Docs entry, quickstart, status, changelog | default, maintenance banner |
| SCR-PLT-002 | API reference and try-it | `developers /docs/*` | GUE and all | Endpoint docs, sandbox console | loading, search no results, try-it error |
| SCR-PLT-003 | Changelog and versions | `developers /changelog` | GUE and all | Versions, deprecations, migration guides | filtered, subscribed |
| SCR-PLT-004 | App list and create wizard | `developers /apps`, `/apps/new` | developers | Register apps | empty, draft, in review, approved, suspended |
| SCR-PLT-005 | App detail: credentials, scopes, redirect URIs | `developers /apps/:id` | developers | Secrets, scopes, review status | secret shown once, rotating, review needed |
| SCR-PLT-006 | OAuth consent screen | `/oauth/authorize` | all signed-in roles | Allow or deny scopes | consent, reduced scopes, denied, admin approval needed |
| SCR-PLT-007 | Connected apps | `/settings/connected-apps` | signed-in roles | Review and revoke app access | empty, list, revoked |
| SCR-PLT-008 | API keys | `/settings/developer/keys` | EAD, IAD, EXA, developers | Create, rotate, revoke keys | empty, one-time secret panel, expiring |
| SCR-PLT-009 | Usage and limits | `/settings/developer/usage` | EAD, developers | Requests, 429s, quotas, increase request | normal, near quota, exhausted |
| SCR-PLT-010 | Request logs | `/settings/developer/logs` | EAD, developers | Search requests, debug capture | filtered, delayed, capture on |
| SCR-PLT-011 | Webhook endpoints | `/settings/developer/webhooks` | EAD, developers | List and manage endpoints | empty, healthy, degraded, disabled |
| SCR-PLT-012 | Add or edit webhook endpoint | wizard | EAD, developers | URL, events, verify, secret | verifying, verification failed, secret once |
| SCR-PLT-013 | Webhook deliveries | `/settings/developer/webhooks/:id` | EAD, developers | Attempts, replay | list, detail, replay in progress |
| SCR-PLT-014 | Sandbox tenants and simulator | `developers /sandbox` | developers | Seeded data, scenarios, outbox | create, reset, inactive warning |
| SCR-PLT-015 | Integrations catalog | `/settings/integrations` | EAD, IAD, EXA, signed-in roles (personal) | Browse and connect | plan-gated, connected, needs sign-in |
| SCR-PLT-016 | Integration detail and settings | `/settings/integrations/:id` | EAD, IAD, EXA | Mapping, schedule, test, disconnect | healthy, degraded, reauth, syncing |
| SCR-PLT-017 | Sync run history and report | `/settings/integrations/:id/runs` | EAD, IAD, EXA | Run results and errors | running, failed rows, completed |
| SCR-PLT-018 | SSO and SCIM setup | `/settings/security/sso` | EAD, IAD, EXA | Configure IdP, test, enforce, SCIM | not configured, tested, enforced, cert expiring |
| SCR-PLT-019 | LMS and LTI registration | `/settings/integrations/lti` | IAD | Platform registration, tool config | registering, active, passback errors |
| SCR-PLT-020 | Connected accounts (calendar, video) | `/settings/connected-accounts` | signed-in roles | Personal connections | none, connected, reconnect |
| SCR-PLT-021 | Uploader component and file chips | component | signed-in roles | Upload with progress, states | idle, uploading, paused, scanning, ready, rejected |
| SCR-PLT-022 | Storage usage | `/settings/storage` | signed-in roles | Meter, breakdown, delete | normal, 80%, full |
| SCR-PLT-023 | Recently deleted files | `/settings/storage/deleted` | signed-in roles | Restore within 30 days | empty, list |
| SCR-PLT-024 | Share link dialog | modal | file owners | Expiry and revoke | default, copied, revoked |
| SCR-PLT-025 | Media processing status and player | component | INS, MNT, authors, viewers | Status, retry, captions | processing, ready, failed |
| SCR-PLT-026 | External media validation card | component | authors | Link validation result | valid, blocked, unsupported, attest needed |
| SCR-PLT-027 | Import wizard | `/imports/new` | IAD, EAD, REC (granted), EXA, PAD | Upload, map, validate, import | each step, errors, undo |
| SCR-PLT-028 | Import history and report | `/imports` | same | Past runs | list, report, rolled back |
| SCR-PLT-029 | Export dialog and My exports | modal, `/exports` | signed-in roles | Request and download exports | preparing, ready, expired |
| SCR-PLT-030 | Admin: integrations fleet health | admin origin `/ops/integrations` | PAD, SUP | Adapter state, breakers | healthy, degraded, unknown |
| SCR-PLT-031 | Admin: quarantine review | admin origin `/ops/quarantine` | PAD, MOD | Review suspicious files | queue, decision |
| SCR-PLT-032 | Admin: developer app review | admin origin `/ops/dev-apps` | PAD | Approve, reject, suspend apps | queue, decision |
| SCR-PLT-033 | Admin: schedules and event inspector | admin origin `/ops/schedules`, `/ops/events` | PAD, SAD | Run now, pause, inspect | list, history |
| SCR-PLT-034 | Admin: marketplace gate | admin origin `/ops/marketplace-gate` | PAD, SAD | Metrics and decision | monitoring, decided |

## PRF

Source: [02_MODULES/PRF_Profile_Resume_Portfolio.md](../02_MODULES/PRF_Profile_Resume_Portfolio.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-PRF-001 | Profile onboarding wizard | `/welcome/profile` | CAN, STD, INS, MNT | First-run guided setup (FR-PRF-001) | step n of 4, saving, offline, under-age restricted |
| SCR-PRF-002 | Profile home | `/profile` | own | Overview, completeness ring, suggestions (FR-PRF-012) | empty, partial, complete, suspended notice |
| SCR-PRF-003 | Profile editor | `/profile/edit` | own | Edit all sections, publish and hide (FR-PRF-002–011, 018) | dirty, saving, conflict 409, error |
| SCR-PRF-004 | Section editor drawer | `/profile/edit/:section/:id?` | own | Add or edit an entry (FR-PRF-005–011) | create, edit, invalid, verified-field warning |
| SCR-PRF-005 | Skills editor | `/profile/edit/skills` | own | Typeahead, pins, proficiency (FR-PRF-007) | empty, limit reached, suggest skill |
| SCR-PRF-006 | Visibility and privacy | `/profile/privacy` | own | Section visibility, preview as, discoverability (FR-PRF-013, 016) | propagating, preview mode |
| SCR-PRF-007 | Public profile | `/in/:slug` | any | Viewer page (FR-PRF-014) | full, partial, 404, loading section, print |
| SCR-PRF-008 | Public link settings | `/profile/privacy/link` | own | Slug, QR (FR-PRF-015) | available, taken, limit reached |
| SCR-PRF-009 | Preview as viewer | `/profile/preview?as=` | own | See what a viewer sees (FR-PRF-013) | public, connection, recruiter |
| SCR-PRF-010 | Profile history | `/profile/history` | own | Snapshots, compare, restore (FR-PRF-018) | empty, compare, restoring |
| SCR-PRF-011 | Import profile | `/profile/import` | own | Upload, diff, apply (FR-PRF-019) | uploading, processing, diff, failed |
| SCR-PRF-012 | Resume library | `/resumes` | own | Resume list and versions (FR-PRF-020) | empty, limit reached, archived filter |
| SCR-PRF-013 | Resume editor | `/resumes/:id/edit` | own | Builder with live preview (FR-PRF-021) | saving, preview failed, override |
| SCR-PRF-014 | Template gallery | `/resumes/templates` | own | Pick template (FR-PRF-022) | filtered, retired template |
| SCR-PRF-015 | Export dialog and history | `/resumes/:id/export` | own | Export and history (FR-PRF-023) | processing, ready, failed |
| SCR-PRF-016 | Resume upload | `/resumes/import` | own | Upload to parse (FR-PRF-024) | scanning, reading, failed, manual fallback |
| SCR-PRF-017 | Parse review | `/resumes/import/:jobId` | own | Review and merge (FR-PRF-025) | low-confidence rows, confirm, discarded |
| SCR-PRF-018 | ATS check panel | `/resumes/:id/ats` | own | Checklist and fixes (FR-PRF-026) | pass, warn, fail, error |
| SCR-PRF-019 | Tailor for a job | `/resumes/:id/tailor` | own | Coverage and suggestions (FR-PRF-027) | no AI, coverage ready |
| SCR-PRF-020 | Resume share manager | `/resumes/:id/share` | own | Links, views, revoke (FR-PRF-028) | none, active, locked |
| SCR-PRF-021 | Hosted resume page | `/r/:token` | any with token | Read-only resume (FR-PRF-028) | passcode, expired (410), loaded |
| SCR-PRF-022 | Portfolio manager | `/profile/portfolio` | own | Project list, featured (FR-PRF-029) | empty, drafts, limit |
| SCR-PRF-023 | Project editor | `/profile/portfolio/:id/edit` | own | Project form, media (FR-PRF-029, 030) | draft, publish blocked (alt text), quota |
| SCR-PRF-024 | Public project page | `/in/:slug/projects/:projectSlug` | any | Project view (FR-PRF-029) | visible, restricted (404), broken link |
| SCR-PRF-025 | Recommendations manager | `/profile/recommendations` | own | Request, approve, hide (FR-PRF-031) | empty, pending, published |
| SCR-PRF-026 | Write recommendation | `/recommend/:token` | author | Author form (FR-PRF-031) | sign-in required, draft, submitted, expired |
| SCR-PRF-027 | Open to work and preferences | `/profile/career` | own | Status and preferences (FR-PRF-033, 034) | not set, active, renewal due |
| SCR-PRF-028 | Profile views | `/profile/views` | own | Analytics (FR-PRF-035) | no data, low volume, named list |
| SCR-PRF-029 | Blocked viewers | `/profile/privacy/blocked` | own | Block rules (FR-PRF-017) | empty, rule list, anonymous-link caveat |
| SCR-PRF-030 | Report dialog and suspension notice | modal and `/profile/notice` | any, own | Report and notice (FR-PRF-036) | submitted, suspended, appeal |

## PWA

Source: [02_MODULES/PWA_PWA_Offline_Mobile_Extension.md](../02_MODULES/PWA_PWA_Offline_Mobile_Extension.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-PWA-001 | Install card | inline component | signed-in roles | Offer install | eligible, iOS instructions, dismissed |
| SCR-PWA-002 | iOS Add to Home Screen sheet | modal | signed-in roles | Step-by-step install on iOS | default |
| SCR-PWA-003 | Update banner and required-update dialog | inline, modal | all | Apply new version | optional, required, deferred (unsaved input) |
| SCR-PWA-004 | Settings: About and app data | `/settings/app` | signed-in roles | Versions, update check, Reset app data | default, resetting, confirm with unsent count |
| SCR-PWA-005 | Settings: Storage | `/settings/storage` | signed-in roles | Usage, persistence, clear, background refresh | normal, over 80%, persistence denied |
| SCR-PWA-006 | Connectivity chip and details | header | all | Show state, last contact, retry | online (hidden), degraded, offline, captive portal |
| SCR-PWA-007 | Offline page | `/offline` (precached) | all | Fallback when nothing is cached | offline, server error, maintenance, upgrade required |
| SCR-PWA-008 | Offline-aware screen states | pattern | all | As-of chips, disabled controls | cached, stale beyond TTL, not saved |
| SCR-PWA-009 | Draft restore banner and form status | inline | signed-in roles | Restore and status of unsent drafts | restored, storage full, expired warning |
| SCR-PWA-010 | Sync center | `/settings/sync` | signed-in roles | Drafts, waiting, needs attention | empty, mixed, offline |
| SCR-PWA-011 | Conflict resolution dialog | modal | signed-in roles | Keep mine, use theirs, edit | text diff, deleted on server, re-conflict |
| SCR-PWA-012 | Logout and account-switch dialog | modal | signed-in roles | Decide on unsent items; purge | with drafts, shared device |
| SCR-PWA-013 | Push priming card | inline | signed-in roles | Explain and request push | default, iOS needs install, denied help |
| SCR-PWA-014 | Settings: Notifications devices and channels | `/settings/notifications` | signed-in roles | Per-device push, class matrix, quiet hours, history | default, locked by org, test sent |
| SCR-PWA-015 | Data saver settings | `/settings/data` | all | Off, Auto, On | auto-on notice |
| SCR-PWA-016 | Share target picker | `/share-target` | CAN, STD, FRL | Choose how to use shared content | URL, file, unsupported, signed out |
| SCR-PWA-017 | Deep-link neutral screen | `/link-unavailable` | all | Unauthorized or missing target | default |
| SCR-PWA-018 | Permission explainer sheets | modal | all | Camera, microphone, notifications | explain, denied help |
| SCR-PWA-019 | Offline downloads manager | `/settings/downloads` | STD, CAN | Manage downloaded lessons | empty, downloading, expiring |
| SCR-PWA-020 | Settings: Extensions | `/settings/extensions` | CAN, STD, FRL, INS, MNT | List pairings, revoke | none, list, revoked |
| SCR-PWA-021 | Extension pairing consent | `/extensions/pair` | CAN, STD, FRL, INS, MNT | Authorize scopes | consent, success, error |
| SCR-PWA-022 | Extension popup | extension | all | Connection state, quick actions | unpaired, paired, reconnect needed, disabled by config |
| SCR-PWA-023 | Extension side panel: scan result | extension | CAN, STD, FRL | Parsed job, edit, actions | detected, list page, unsupported, partial |
| SCR-PWA-024 | Extension match card | extension | CAN, STD, FRL | Local match and skills | scored, not enough content, no resume |
| SCR-PWA-025 | Extension autofill panel | extension | CAN, STD, FRL | Review and fill fields | detected, sensitive skipped, permission needed |
| SCR-PWA-026 | Extension privacy page | extension, `/extensions/privacy` | all | Can do, stored, sent, delete | default, deleting |
| SCR-PWA-027 | Mobile review (admin) | admin origin `/ops/mobile-review` | PAD, SAD | Trigger dashboard and decisions | monitoring, trigger fired, evaluating |
| SCR-PWA-028 | Release and store checklist (admin) | admin origin `/ops/store-releases` | PAD, SAD | Submission checklist and status | incomplete, ready, in review, rejected |
| SCR-PWA-029 | PWA health dashboard (admin) | admin origin `/ops/pwa-health` | PAD | Install, offline, push, vitals | healthy, degraded, no data |

## REP

Source: [02_MODULES/REP_Gamification_Reputation.md](../02_MODULES/REP_Gamification_Reputation.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-REP-001 | Progress overview | `/progress` | participating roles | Level, XP, streak, goals, badges summary | loading, loaded, empty, hidden (opted out) |
| SCR-REP-002 | XP history | `/progress/xp` | same | Ledger table | list, empty, error |
| SCR-REP-003 | How XP works | `/progress/rules` | same, GUE | Rule list and limits | loaded |
| SCR-REP-004 | Levels | `/progress/levels` | same | Threshold table | loaded |
| SCR-REP-005 | Badges | `/progress/badges` | same | Earned and locked badges, visibility | list, locked with progress |
| SCR-REP-006 | Badge catalog and detail | `/badges`, `/badges/:id` | all authenticated | Criteria and rarity | catalog, detail |
| SCR-REP-007 | Public badge page and verification | `/b/:token` | GUE | Verify a badge | valid, expired, revoked, not found |
| SCR-REP-008 | Streaks and goals | `/progress/streaks` | participating roles | Streak, protection, vacation, goals | active, at risk, protected, vacation, broken |
| SCR-REP-009 | Leaderboards | `/progress/leaderboards` | participating roles | Boards and invitation | list, small board, not participating, error |
| SCR-REP-010 | Leaderboard privacy | `/settings/privacy/leaderboards` | participating roles | Name, alias or exclude | not chosen, name, alias, excluded |
| SCR-REP-011 | Cohort board | `/cohorts/:id/board` | STD, INS, IAD | Institution board | disabled, enabled, closed |
| SCR-REP-012 | Organization challenge | `/org/:id/learning/challenges/:cid` | employees, EXA | Enterprise board | draft, active, closed |
| SCR-REP-013 | Reputation overview | `/progress/reputation` | participating roles | Labels per domain and context | not enough signals, computed |
| SCR-REP-014 | Reputation explanation | `/progress/reputation/:domain` | subject | Breakdown and tips | computed, recalculating |
| SCR-REP-015 | Reputation visibility | `/settings/privacy/reputation` | subject | Who can see | private, shared |
| SCR-REP-016 | Gamification configuration | `/admin/gamification` | PAD, SAD | Rules, thresholds, simulations | draft, simulated, active |
| SCR-REP-017 | Badge administration | `/admin/gamification/badges` | PAD | Badge definitions | draft, in review, active |
| SCR-REP-018 | Signal registry | `/admin/gamification/signals` | PAD | Reputation signal types | list, edit |
| SCR-REP-019 | Integrity queue | `/admin/gamification/cases` | MOD, PAD | Cases and decisions | queue, case, appeal |
| SCR-REP-020 | Seasons | `/admin/gamification/seasons` | PAD | Define and monitor | scheduled, active, archived |
| SCR-REP-021 | Fairness report | `/admin/gamification/fairness` | SAD, PAD | Audit reports and actions | ready, actions open |
| SCR-REP-022 | Progress and rewards settings | `/settings/privacy/progress` | all authenticated | Intensity and data choices | standard, minimal, off |
| SCR-REP-023 | Share card dialog and list | overlay, `/progress/shared` | participating roles | Create, revoke share cards | preview, generated, revoked |
| SCR-REP-024 | Recognition inbox | `/progress/recognition` | participating roles | Recognitions given and received | list, empty |
| SCR-REP-025 | Recovery plan | `/progress/reputation/recovery` | subject | Steps and dates | none, in progress, completed |
| SCR-REP-026 | Sanction notice and appeal | `/progress/notice/:id` | subject | Notice and appeal form | notice, drafting, submitted, decided |
| SCR-REP-027 | What changed | `/progress/changes` | all | Published rule changes | list |

## SET

Source: [02_MODULES/SET_Settings_Privacy_Consent.md](../02_MODULES/SET_Settings_Privacy_Consent.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-SET-001 | Settings home and search | `/settings` | all authed | Entry, search | loading, results, offline |
| SCR-SET-002 | Account | `/settings/account` | all authed | Identity facts, links to IDN | loaded, locked name |
| SCR-SET-003 | Privacy dashboard | `/settings/privacy` | all authed | Summary cards, quick actions | loaded, partial error |
| SCR-SET-004 | Profile visibility | `/settings/privacy/visibility` | CAN, STD, INS, MNT, FRL | Presets and matrix | clean, dirty, blocked field |
| SCR-SET-005 | Preview as | `/settings/privacy/preview` | same | Audience preview | rendered, compare |
| SCR-SET-006 | Consents | `/settings/privacy/consents` | same | Scope switches, history | loaded, saving, conflict |
| SCR-SET-007 | Shared with organizations | `/settings/privacy/sharing` | same | Per-grantee grants | list, request pending, expiring |
| SCR-SET-008 | Hide from employers | `/settings/privacy/blocklist` | same | Blocklist | list, limit |
| SCR-SET-009 | Who accessed my data | `/settings/privacy/access-log` | CAN, STD, INS, MNT, FRL, REC, HMG, EAD | Access log | empty, list |
| SCR-SET-010 | Cookie banner | overlay | GUE, all | Cookie choices | undecided, saved |
| SCR-SET-011 | Privacy choices | `/privacy-choices` | GUE, all | Reopen cookie and GPC choices | saved |
| SCR-SET-012 | Data and deletion | `/settings/data` | all authed | Export, rectify, delete entry | idle |
| SCR-SET-013 | Export status | `/settings/data/export` | all authed | Request, status, download | queued, building, ready, expired |
| SCR-SET-014 | Delete account: consequences and pending | `/settings/data/delete` | all authed | Warn, confirm, countdown, cancel | composing, blocked, cooling-off, in progress, on hold |
| SCR-SET-015 | Erasure receipt | `/settings/data/receipt/:id` | holder (while exists) | Receipt | shown, expired |
| SCR-SET-016 | Correct or limit data | `/settings/data/requests/new` | all authed | Rectification, restriction, objection | form, submitted, decided |
| SCR-SET-017 | Language and region | `/settings/region` | all authed, GUE | Locale, time zone | detected, saved |
| SCR-SET-018 | Accessibility and display | `/settings/accessibility` | all authed, GUE | Preferences, theme | preview, saved |
| SCR-SET-019 | Connected apps | `/settings/apps` | all authed | App grants | none, list |
| SCR-SET-020 | Personal API tokens | `/settings/apps/tokens` | eligible | Create, list, revoke | none, created (reveal), list |
| SCR-SET-021 | Connected accounts | `/settings/apps/accounts` | all authed | Calendar and others | not connected, connected, reconnect |
| SCR-SET-022 | AI and recommendations | `/settings/privacy/ai` | all authed | AI consent, key | off, on, key invalid |
| SCR-SET-023 | Settings history | `/settings/history` | all authed | Changes and undo | list, empty |
| SCR-SET-024 | Member settings (org) | `/org/:id/settings/members` | EAD, IAD, EXA | Managed locks | unlocked, locked |
| SCR-SET-025 | Guardian | `/settings/guardian` | guardian | Minor consents | unverified, verified |
| SCR-SET-026 | DSAR queue | `/admin/privacy/requests` | PAD, SUP | Request operations | empty, list, action pending |
| SCR-SET-027 | DSAR request detail | `/admin/privacy/requests/:id` | PAD, SUP | Checkpoints, actions | in progress, failed |
| SCR-SET-028 | Legal holds | `/admin/privacy/holds` | PAD, SAD | Place and review holds | active, due |
| SCR-SET-029 | Retention schedule | `/admin/privacy/retention` | PAD, SAD | Policies, reports | current, proposed |
| SCR-SET-030 | Compliance regions | `/admin/privacy/regions` | PAD, SAD | Rule sets | draft, active |
| SCR-SET-031 | Policy editor | `/admin/policies` | PAD, SAD | Versions, publish | draft, published |
| SCR-SET-032 | Policy page | `/legal/:policy` | GUE, all | Public policy text, versions | current, older version |
| SCR-SET-033 | Consent catalog admin | `/admin/privacy/consents` | PAD, SAD | Scope catalog, text versions | draft, published |

## SRC

Source: [02_MODULES/SRC_Search_Discovery.md](../02_MODULES/SRC_Search_Discovery.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-SRC-001 | Command palette | overlay (`⌘K`) | all | Global search and actions (FR-SRC-001) | empty with recents, results, loading, degraded |
| SCR-SRC-002 | Search results | `/search` | all | Entity tabs, filters, sort (FR-SRC-002) | results, zero results, error, limited mode |
| SCR-SRC-003 | Job search | `/jobs` | all | Job search (FR-SRC-003) | results, closed job, no pay |
| SCR-SRC-004 | People search | `/search?type=people` | all | People search (FR-SRC-004) | results, guest capped |
| SCR-SRC-005 | Course search | `/learn` | all | Course search (FR-SRC-005) | results, private excluded |
| SCR-SRC-006 | Company search | `/companies` | all | Company search (FR-SRC-006) | results |
| SCR-SRC-007 | Challenge search | `/challenges` | all | Challenge search (FR-SRC-007) | results, contest upcoming |
| SCR-SRC-008 | Content search | `/search?type=content` | all | Content search (FR-SRC-008) | results |
| SCR-SRC-009 | Filter panel and drawer | component | all | Filters and facets (FR-SRC-012) | desktop, mobile drawer, invalid filter |
| SCR-SRC-010 | Why this result popover | component | all | Explanation (FR-SRC-015) | loaded, unavailable |
| SCR-SRC-011 | How results are ranked | `/help/ranking/:entity` | all | Transparency (FR-SRC-015) | per entity, changelog |
| SCR-SRC-012 | Search settings | `/settings/search` | signed-in | Personalization, history (FR-SRC-016, 019) | on, off, cleared |
| SCR-SRC-013 | Saved searches | `/searches` | signed-in | Manage (FR-SRC-017) | empty, limit reached, new badge |
| SCR-SRC-014 | Save search dialog | modal | signed-in | Name and frequency (FR-SRC-017) | valid, duplicate |
| SCR-SRC-015 | Alert settings and email | `/searches/:id/alerts` | signed-in | Alerts (FR-SRC-018) | none, daily, paused |
| SCR-SRC-016 | Recruiter talent search | `/recruiter/search` | REC, HMG, EAD | Talent search (FR-SRC-021) | results, blind mode, rate limited |
| SCR-SRC-017 | Talent candidate side panel | panel | REC, HMG | Quick review with evidence (FR-SRC-021, 023) | loaded, candidate unavailable |
| SCR-SRC-018 | Talent saved searches | `/recruiter/search/saved` | REC, HMG, EAD | Saved talent searches (FR-SRC-021) | entitlement lapsed |
| SCR-SRC-019 | Fair search report | `/recruiter/search/fairness` | EAD | Org fairness summary (FR-SRC-022) | insufficient data, alert |
| SCR-SRC-020 | Search appearances | `/profile/search-appearances` | CAN | Insights (FR-SRC-024) | low volume, stealth |
| SCR-SRC-021 | Empty and error states | component | all | Recovery (FR-SRC-028) | zero results, error, rate limited |
| SCR-SRC-022 | Index health | `/admin/search/index` | PAD | Pipelines (FR-SRC-025) | lag, drift, dead letters |
| SCR-SRC-023 | Index versions | `/admin/search/versions` | PAD | Build, validate, swap (FR-SRC-026) | building, awaiting approval |
| SCR-SRC-024 | Relevance console | `/admin/search/relevance` | PAD | Profiles and evaluations (FR-SRC-027) | draft, shadow, released |
| SCR-SRC-025 | Abuse console | `/admin/search/abuse` | PAD, SAD | Signals and blocks (FR-SRC-029) | signals, appeals |
| SCR-SRC-026 | Leakage audit | `/admin/search/audit` | SAD | Canary and synthetic viewer tests (FR-SRC-020) | pass, fail |
| SCR-SRC-027 | Taxonomy console | `/admin/taxonomy` | PAD | Skills, relationships (FR-SRC-030) | tree, merge wizard |
| SCR-SRC-028 | Proposals queue | `/admin/taxonomy/proposals` | PAD | Review proposals (FR-SRC-030) | pending, decided |
| SCR-SRC-029 | Synonym sets | `/admin/taxonomy/synonyms` | PAD | Synonyms (FR-SRC-014, 030) | test box |
| SCR-SRC-030 | Search analytics | `/admin/search/analytics` | PAD, EAD, IAD | Aggregates (FR-SRC-031) | suppressed cells |
| SCR-SRC-031 | Degraded status | banner and `/admin/search/status` | all, PAD | Mode (FR-SRC-034) | live, degraded, down |
| SCR-SRC-032 | Location picker | component | all | Place resolve (FR-SRC-033) | ambiguous, denied location |

## STU

Source: [02_MODULES/STU_Instructor_Studio_Content_Production.md](../02_MODULES/STU_Instructor_Studio_Content_Production.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-STU-001 | Instructor application | `/teach/apply` | CAN | Apply to teach (FR-STU-001) | draft, submitted, needs info, rejected with reapply date |
| SCR-STU-002 | Application status | `/teach/application` | CAN | Track application | in verification, approved |
| SCR-STU-003 | Verification center | `/studio/verification` | INS | Identity and expertise (FR-STU-002) | pending, failed, expiring |
| SCR-STU-004 | Agreements | `/studio/agreements` | INS | Accept terms and declare conflicts (FR-STU-003) | update required, grace ending |
| SCR-STU-005 | Instructor profile editor | `/studio/profile` | INS | Public teaching profile (FR-STU-004) | hidden by moderation |
| SCR-STU-006 | Payout setup | `/studio/earnings/payout-setup` | INS Owner | Payout and tax profile (FR-STU-005) | incomplete, verified, restricted, feature off |
| SCR-STU-007 | Studio home | `/studio` | INS, IAD | Courses and attention list (FR-STU-006) | no courses, attention items |
| SCR-STU-008 | Course workspace overview | `/studio/courses/:id` | INS | Hub with checklist and status | draft, in review, live, taken down |
| SCR-STU-009 | Course creation wizard | `/studio/courses/new` | INS, IAD | Start a course (FR-STU-007) | step errors, template pick |
| SCR-STU-010 | Curriculum builder | `/studio/courses/:id/curriculum` | INS | Sections and lessons, drag and drop (FR-STU-008) | stale version conflict, bulk selection |
| SCR-STU-011 | Lesson editor | `/studio/courses/:id/lessons/:lessonKey` | INS | Video, text, resource authoring (FR-STU-009 to 011) | media processing, locked by another editor |
| SCR-STU-012 | Landing page editor | `/studio/courses/:id/landing` | INS | Public page and SEO (FR-STU-014) | image too small, claims warning |
| SCR-STU-013 | Rules and prerequisites | `/studio/courses/:id/rules` | INS | Completion and navigation rules (FR-STU-013) | unsatisfiable rule, test result |
| SCR-STU-014 | Skills and objectives | `/studio/courses/:id/skills` | INS | Skill tagging (FR-STU-012) | evidence preview gaps |
| SCR-STU-015 | Team | `/studio/courses/:id/team` | INS Owner | Co-instructors and ownership (FR-STU-016) | invitation pending, split mismatch |
| SCR-STU-016 | Versions | `/studio/courses/:id/versions` | INS Owner | Version list and diff (FR-STU-019) | draft exists, patch eligible |
| SCR-STU-017 | Learner preview | `/studio/courses/:id/preview` | INS, reviewers | Preview as learner (FR-STU-020) | simulated day, media not ready |
| SCR-STU-018 | Media library | `/studio/library` | INS | Assets and usage (FR-STU-025) | quota near, asset in use |
| SCR-STU-019 | Asset detail and status | `/studio/library/:assetId` | INS, SUP | Pipeline status (FR-STU-026) | processing step, failed with reason |
| SCR-STU-020 | Caption editor | `/studio/library/:assetId/captions` | INS | Edit captions (FR-STU-023) | low-confidence highlights, ASR pending |
| SCR-STU-021 | Quiz settings | `/studio/courses/:id/quizzes/:lessonKey` | INS | Quiz placement and policy (FR-STU-029) | pool too small |
| SCR-STU-022 | Assignment and rubric editor | `/studio/courses/:id/assignments/:lessonKey` | INS | Assignment authoring (FR-STU-030) | rubric total mismatch |
| SCR-STU-023 | Grading queue | `/studio/grading` | INS, Assistant | Pending submissions (FR-STU-031) | claimed, late, flagged |
| SCR-STU-024 | Grading workbench | `/studio/grading/:taskId` | INS, Assistant | Grade and feedback | draft, released, dispute |
| SCR-STU-025 | Pricing | `/studio/courses/:id/pricing` | INS Owner, FIN | Price and schedule (FR-STU-033) | scheduled change, below minimum |
| SCR-STU-026 | Promotions | `/studio/courses/:id/promotions` | INS Owner | Coupons (FR-STU-034) | exhausted, expiring |
| SCR-STU-027 | Earnings and statements | `/studio/earnings` | INS (role-limited), FIN | Revenue views (FR-STU-035, 037) | ledger lag, feature off |
| SCR-STU-028 | Payouts | `/studio/earnings/payouts` | INS, FIN | Schedule and history (FR-STU-036) | held, failed, paid |
| SCR-STU-029 | Publish and submit | `/studio/courses/:id/publish` | INS Owner | Checklist, attestation, publish (FR-STU-038, 040, 041, 052) | blocking items, scheduled |
| SCR-STU-030 | Review queue | `/staff/course-review` | MOD, PAD | Reviewer queue (FR-STU-039) | SLA warning, conflict |
| SCR-STU-031 | Review workbench | `/staff/course-review/:caseId` | MOD, PAD | Checklist and decision | second reviewer required |
| SCR-STU-032 | Q&A inbox | `/studio/qa` | INS, Assistant | Answer questions (FR-STU-043) | unanswered backlog |
| SCR-STU-033 | Announcements | `/studio/courses/:id/announcements` | INS | Author announcements (FR-STU-044) | daily limit reached |
| SCR-STU-034 | Reviews | `/studio/reviews` | INS | Read, reply, report (FR-STU-045) | reply exists |
| SCR-STU-035 | Learners | `/studio/courses/:id/learners` | INS, Assistant, Viewer (aggregate) | Roster (FR-STU-046) | private learner, export |
| SCR-STU-036 | Live schedule and host console | `/studio/courses/:id/live` | INS | Sessions (FR-STU-047) | live, ended, recording processing |
| SCR-STU-037 | Analytics | `/studio/analytics` | INS, Viewer | Funnels and engagement (FR-STU-048) | insufficient data |
| SCR-STU-038 | Content moderation console | `/staff/content-moderation` | MOD, PAD | Cases and strikes (FR-STU-049) | emergency takedown |
| SCR-STU-039 | Copyright notice form | `/legal/copyright` | GUE, CAN | Submit notice (FR-STU-050) | incomplete, receipt |
| SCR-STU-040 | Copyright case console | `/staff/copyright` | MOD, PAD | Handle notices | counter-notice window running |
| SCR-STU-041 | Localization | `/studio/courses/:id/languages` | INS, Translator | Translations (FR-STU-051) | outdated track |
| SCR-STU-042 | Quality | `/studio/quality` | INS | Quality components (FR-STU-053) | insufficient data |
| SCR-STU-043 | Course import | `/studio/courses/:id/import` | INS | Import wizard (FR-STU-017) | mapping issues |
| SCR-STU-044 | Sign-off queue | `/studio/signoff` | INS | Completion sign-off (FR-STU-042) | held for review |

## TSF

Source: [02_MODULES/TSF_Trust_Safety_Moderation.md](../02_MODULES/TSF_Trust_Safety_Moderation.md)

| ID | Screen | Route | Roles | Purpose | Key states |
|---|---|---|---|---|---|
| SCR-TSF-001 | Report dialog | modal | all signed-in, GUE | Submit a report | stepper, submitted, rate-limited |
| SCR-TSF-002 | My reports | `/settings/safety/reports` | members | Status of my reports | empty, resolved |
| SCR-TSF-003 | Report detail | `/settings/safety/reports/:id` | members | Timeline and add information | reopenable |
| SCR-TSF-004 | Notice and statement of reasons | `/notices/:id` | affected users | Understand action and appeal | appeal-open, appeal-closed |
| SCR-TSF-005 | Appeal form | `/notices/:id/appeal` | affected users | Submit appeal | submitted, expired |
| SCR-TSF-006 | Appeal status | `/appeals/:id` | affected users | Track and request final review | decided |
| SCR-TSF-007 | Safety Center | `/safety` | GUE, all | Guidelines, scam tips, reporting help | none |
| SCR-TSF-008 | Community guidelines and policies | `/policies` | GUE, all | Public policies with versions | version-diff |
| SCR-TSF-009 | Transparency Center | `/transparency` | GUE, all | Reports and data | period filter |
| SCR-TSF-010 | Trusted flagger application and dashboard | `/safety/flaggers` | CAN, flagger | Apply, submit batches | pending, active, revoked |
| SCR-TSF-011 | Moderator home | `/mod` | MOD | Queues and workload | surge-mode |
| SCR-TSF-012 | Queue list | `/mod/queues/:id` | MOD | Cases by priority | empty, SLA-risk |
| SCR-TSF-013 | Case workspace | `/mod/cases/:id` | MOD | Evidence and decision | locked, execution-pending |
| SCR-TSF-014 | Second review | `/mod/second-review/:id` | MOD-2, MOD-3 | Blind review | submitted |
| SCR-TSF-015 | Account moderation history | `/mod/accounts/:id` | MOD-2+ | History and strikes | restricted-access |
| SCR-TSF-016 | Moderator search | `/mod/search` | MOD | Search cases | tier-limited |
| SCR-TSF-017 | Pre-moderation queue | `/mod/premod` | MOD-1, MOD-2 | Approve reviews and posts | empty |
| SCR-TSF-018 | Fraud workspace | `/mod/fraud/:id` | MOD-S | Employers, jobs, networks | verifying, restricted |
| SCR-TSF-019 | Network graph | `/mod/fraud/networks/:id` | MOD-S | Linked accounts | large-network |
| SCR-TSF-020 | Minors safety queue | `/mod/minors` | MOD-S | Restricted workspace | hash-only |
| SCR-TSF-021 | Imminent harm console | `/mod/urgent` | MOD-S | P0 handling and disclosure | paging |
| SCR-TSF-022 | Appeals queue | `/mod/appeals` | MOD-2+ | Decide appeals | overdue |
| SCR-TSF-023 | Evidence and holds | `/mod/evidence` | MOD-S, SAD | Evidence packages, holds | tamper-alert |
| SCR-TSF-024 | Legal requests | `/admin/legal` | SAD | Intake, validate, fulfill | gag-timer |
| SCR-TSF-025 | Policy editor | `/admin/policies` | PAD, SAD | Edit and publish policies | draft, review |
| SCR-TSF-026 | Enforcement matrix | `/admin/enforcement-matrix` | PAD, SAD | Configure actions | version-diff |
| SCR-TSF-027 | Detector management | `/admin/detectors` | PAD, SAD, MOD-3 | Rules, thresholds, kill switches | downgraded |
| SCR-TSF-028 | QA and calibration | `/mod/qa` | MOD-2, MOD-3 | Sampling and coaching | calibration |
| SCR-TSF-029 | Wellbeing | `/mod/wellbeing` | MOD | Personal exposure and support | limit-reached |
| SCR-TSF-030 | Safety dashboard | `/admin/safety` | MOD-3, PAD, SAD | SLA and prevalence | alerting |
| SCR-TSF-031 | Compliance register | `/admin/compliance` | SAD, PAD | DSA obligations | gap-open |
| SCR-TSF-032 | Macros | `/mod/macros` | MOD-3 | Approve macros | pending-approval |

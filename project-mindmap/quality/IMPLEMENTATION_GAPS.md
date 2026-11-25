# Implementation Gap Map (Branch 20)

Every item names its evidence. Classification uses the requested vocabulary. `ephemeral` means the endpoint works but its state is lost on restart (ADR-015); it is reported separately from `NOT_IMPLEMENTED` so a working in-memory feature is not mislabelled as missing.

## 1. Status distribution of mapped capabilities

| Node type | IMPLEMENTED | PARTIALLY_IMPLEMENTED | NOT_IMPLEMENTED | BROKEN | MOCKED | UNREACHABLE | DEPRECATED | UNKNOWN |
| --------- | ----------- | --------------------- | --------------- | ------ | ------ | ----------- | ---------- | ------- |
| API       | 273         | 0                     | 0               | 0      | 0      | 0           | 0          | 9       |
| SCR       | 29          | 0                     | 0               | 0      | 0      | 0           | 0          | 0       |
| INT       | 211         | 0                     | 0               | 0      | 0      | 0           | 0          | 0       |
| COMP      | 42          | 0                     | 0               | 0      | 0      | 0           | 0          | 2       |
| RULE      | 269         | 0                     | 0               | 0      | 0      | 0           | 0          | 10      |
| DB        | 34          | 0                     | 78              | 0      | 0      | 0           | 0          | 0       |
| EXT       | 2           | 3                     | 0               | 0      | 1      | 0           | 0          | 0       |
| JOUR      | 100         | 0                     | 0               | 0      | 0      | 0           | 0          | 0       |
| SVC       | 70          | 43                    | 0               | 0      | 0      | 0           | 0          | 0       |
| INFRA     | 14          | 0                     | 0               | 0      | 0      | 0           | 0          | 0       |

Totals: IMPLEMENTED 1044, NOT_IMPLEMENTED 78, PARTIALLY_IMPLEMENTED 46, UNKNOWN 21, MOCKED 1. Confidence: HIGH 658, MEDIUM 432, LOW 100. `HIGH` = source evidence plus a passing executed test: the journey's own e2e test passed, or every executed test file linked to the node passed (the link is path-level: a test that names the route or function, not an assertion-level trace). `MEDIUM` = supported by source. `LOW` = inferred.

## 2. Ephemeral (non-durable) endpoints — 197 of 282

State lives in process memory and is lost on restart; responses carry `x-talentsphere-durability: ephemeral`. Evidence: `apps/api/src/durability.ts` (the code's own list of durable routes; everything else is ephemeral).

| Module        | Ephemeral endpoints |
| ------------- | ------------------- |
| reputation    | 15                  |
| skills        | 14                  |
| interviews    | 13                  |
| recruiter     | 13                  |
| alumni        | 11                  |
| moderation    | 10                  |
| networking    | 8                   |
| jobs          | 7                   |
| courses       | 7                   |
| resumes       | 7                   |
| job-templates | 6                   |
| ai            | 6                   |
| connections   | 6                   |
| referrals     | 6                   |
| career        | 6                   |
| portfolio     | 6                   |
| salaries      | 5                   |
| challenges    | 5                   |
| activity      | 5                   |
| gamification  | 5                   |
| admin         | 5                   |
| search        | 5                   |
| applications  | 4                   |
| certificates  | 4                   |
| learning      | 4                   |
| analytics     | 3                   |
| organizations | 2                   |
| settings      | 2                   |
| feedback      | 1                   |
| candidates    | 1                   |
| xp            | 1                   |
| modules       | 1                   |
| lessons       | 1                   |
| verify        | 1                   |
| internal      | 1                   |

## 3. Schema-only tables — 78 of 112 (NOT_IMPLEMENTED persistence, LOW confidence)

Tables created by migrations with no SQL consumer found in `apps/` or `packages/`. Dynamic SQL would not be detected.

`audit_logs`, `skill_relationships`, `challenges`, `assessment_sessions`, `challenge_submissions`, `xp_transactions`, `courses`, `course_modules`, `lessons`, `course_enrollments`, `lesson_progress`, `course_certificates`, `course_skills`, `ai_conversations`, `ai_messages`, `ai_usage_meters`, `resumes`, `resume_exports`, `connections`, `portfolio_projects`, `portfolio_project_skills`, `portfolio_project_media`, `portfolio_project_evidence`, `user_gamification_profiles`, `gamification_badges`, `user_badges`, `platform_config`, `search_history`, `moderation_reports`, `moderation_appeals`, `job_alerts`, `application_drafts`, `application_draft_versions`, `analytics_events`, `analytics_daily_kpis`, `certificate_revocations`, `job_templates`, `salary_reports`, `salary_aggregates`, `feedback_templates`, `application_feedback`, `skill_freshness`, `skill_freshness_history`, `interview_questions`, `interview_assessments`, `interview_scorecards`, `interview_ai_feedbacks`, `reputation_scores`, `reputation_signals`, `reputation_history`, `reputation_recovery_plans`, `warm_introduction_preferences`, `warm_introduction_requests`, `referral_requests`, `referral_outcomes`, `activity_events`, `contribution_scores`, `instructor_reputation_breakdown`, `instructor_endorsements`, `skill_endorsements`, `endorsement_weights`, `alumni_affiliations`, `alumni_groups`, `alumni_group_members`, `alumni_mentorship`, `employer_reputation_breakdown`, `employer_reviews`, `skill_market_signals`, `skill_forecasts`, `career_transitions`, `progression_benchmarks`, `career_milestone_evaluations`, `learning_outcomes`, `learning_impact_metrics`, `talent_pools`, `talent_pool_members`, `behavioral_talent_profiles`, `candidate_segmentations`

## 4. Endpoints with no first-party web caller — 206 of 282

These are reachable by API clients and tests only. The documented audit also states "no UI route calls" the AI career assistant; this scan agrees for any endpoint listed.

`GET /api/v1/feature-flags`, `GET /api/v1/profile/me`, `GET /api/v1/profile/:id`, `POST /api/v1/evidence`, `GET /api/v1/evidence/:id`, `GET /api/v1/evidence/subject/:subjectId`, `POST /api/v1/evidence/:id/verify`, `POST /api/v1/evidence/:id/dispute`, `POST /api/v1/evidence/:id/revoke`, `POST /api/v1/skills`, `POST /api/v1/skills/relationships`, `GET /api/v1/organizations/:id`, `POST /api/v1/organizations/:id/members`, `POST /api/v1/job-templates`, `GET /api/v1/job-templates`, `GET /api/v1/job-templates/:id`, `PATCH /api/v1/job-templates/:id`, `DELETE /api/v1/job-templates/:id`, `POST /api/v1/job-templates/:id/instantiate`, `POST /api/v1/jobs/:id/save-as-template`, `POST /api/v1/salaries/reports`, `GET /api/v1/salaries/reports/my`, `DELETE /api/v1/salaries/reports/:id`, `GET /api/v1/salaries/benchmarks`, `GET /api/v1/salaries/company/:companyName`, `GET /api/v1/applications/:id`, `POST /api/v1/applications/:id/feedback`, `GET /api/v1/applications/:id/feedback`, `POST /api/v1/applications/:id/feedback/request`, `POST /api/v1/organizations/:orgId/feedback-templates`, `GET /api/v1/organizations/:orgId/feedback-templates`, `GET /api/v1/feedback/aggregate-insights`, `GET /api/v1/candidates/:candidateProfileId/skills/freshness`, `POST /api/v1/skills/:skillId/reverify`, `POST /api/v1/skills/freshness/refresh-all`, `POST /api/v1/interviews/questions`, `GET /api/v1/interviews/questions`, `POST /api/v1/interviews/assessments`, `GET /api/v1/interviews/assessments/:id`, `POST /api/v1/interviews/assessments/:id/join`, `POST /api/v1/interviews/assessments/:id/consent`, `POST /api/v1/interviews/assessments/:id/end`, `POST /api/v1/interviews/assessments/:id/code`, `POST /api/v1/interviews/assessments/:id/scorecard`, `POST /api/v1/interviews/assessments/:id/scorecard/compensate`, `GET /api/v1/interviews/assessments/:id/scorecards`, `POST /api/v1/interviews/assessments/:id/ai-feedback`, `POST /api/v1/interviews/assessments/:id/review`, `POST /api/v1/reputation/signals`, `GET /api/v1/reputation/users/:userId`, `GET /api/v1/reputation/my/signals`, `POST /api/v1/reputation/recovery`, `POST /api/v1/reputation/recovery/:planId/tasks/:taskId/complete`, `POST /api/v1/reputation/recalculate-all`, `GET /api/v1/reputation/instructors/:instructorId`, `POST /api/v1/reputation/instructors/:instructorId/metrics`, `POST /api/v1/reputation/instructors/:instructorId/endorse`, `POST /api/v1/reputation/instructors/:instructorId/reviews`, `POST /api/v1/reputation/instructors/recompute`, `GET /api/v1/reputation/organizations/:organizationId`, `POST /api/v1/reputation/organizations/:organizationId/reviews`, `POST /api/v1/reputation/organizations/:organizationId/metrics`, `GET /api/v1/reputation/organizations/:organizationId/reviews`, `GET /api/v1/challenges/:id`, `POST /api/v1/challenges`, `POST /api/v1/ai/assistant/query`, `GET /api/v1/xp/ledger`, `POST /api/v1/courses`, `POST /api/v1/courses/:id/modules`, `POST /api/v1/modules/:id/lessons`, `POST /api/v1/courses/:id/publish`, `GET /api/v1/certificates/:certificateNumber`, `GET /api/v1/certificates/verify/:hash`, `POST /api/v1/certificates/:certificateNumber/revoke`, `POST /api/v1/threads/:id/read`, `GET /api/v1/notifications/preferences`, `PATCH /api/v1/notifications/preferences`, `POST /api/v1/ai/conversations`, `GET /api/v1/ai/conversations`, `GET /api/v1/ai/conversations/:id`, `POST /api/v1/ai/career-assistant/chat`, `GET /api/v1/resumes/:id`, `PATCH /api/v1/resumes/:id`, `POST /api/v1/resumes/:id/export`, `GET /api/v1/resumes/:id/exports`, `DELETE /api/v1/resumes/exports/:exportId`, `GET /api/v1/connections/status/:targetUserId`, `POST /api/v1/connections/:id/withdraw`, `DELETE /api/v1/connections/:id`, `POST /api/v1/networking/warm-intros/preferences`, `GET /api/v1/networking/warm-intros/preferences`, `GET /api/v1/networking/warm-intros/paths`, `POST /api/v1/networking/warm-intros/requests`, `GET /api/v1/networking/warm-intros/requests/incoming`, `GET /api/v1/networking/warm-intros/requests/outgoing`, `GET /api/v1/networking/warm-intros/requests/:id`, `POST /api/v1/networking/warm-intros/requests/:id/respond`, `POST /api/v1/referrals/requests`, `GET /api/v1/referrals/requests/incoming`, `GET /api/v1/referrals/requests/outgoing`, `GET /api/v1/referrals/requests/:id`, `POST /api/v1/referrals/requests/:id/respond`, `GET /api/v1/referrals/outcomes`, `POST /api/v1/skills/endorsements`, `GET /api/v1/skills/endorsements/recipients/:recipientId`, `DELETE /api/v1/skills/endorsements/:id`, `GET /api/v1/skills/endorsements/my/given`, `GET /api/v1/skills/forecast/top-growth`, `POST /api/v1/skills/:skillId/market-signals`, `GET /api/v1/skills/:skillId/forecast`, `POST /api/v1/skills/:skillId/forecast/generate`, `POST /api/v1/career/transitions`, `GET /api/v1/career/transitions/my`, `POST /api/v1/career/transition-probability`, `POST /api/v1/learning/impact/outcomes`, `GET /api/v1/learning/impact/courses/:courseId`, `POST /api/v1/learning/impact/courses/:courseId/compute`, `GET /api/v1/learning/impact/dashboard`, `POST /api/v1/recruiter/talent-pools`, `GET /api/v1/recruiter/talent-pools`, `GET /api/v1/recruiter/talent-pools/:poolId`, `POST /api/v1/recruiter/talent-pools/:poolId/members`, `PATCH /api/v1/recruiter/talent-pools/:poolId/members/:memberId`, `GET /api/v1/recruiter/talent-pools/:poolId/intelligence`, `POST /api/v1/recruiter/discovery/behavioral/compute`, `GET /api/v1/recruiter/discovery/behavioral`, `GET /api/v1/recruiter/discovery/behavioral/:candidateId`, `POST /api/v1/recruiter/talent-segmentation/classify`, `GET /api/v1/recruiter/talent-segmentation/segments`, `GET /api/v1/recruiter/talent-segmentation/candidates`, `GET /api/v1/recruiter/talent-segmentation/candidates/:candidateId`, `POST /api/v1/alumni/affiliations`, `POST /api/v1/alumni/affiliations/:id/verify`, `GET /api/v1/alumni/affiliations/my`, `GET /api/v1/alumni/institutions/:institutionId/directory`, `POST /api/v1/alumni/institutions/:institutionId/groups`, `GET /api/v1/alumni/institutions/:institutionId/groups`, `POST /api/v1/alumni/groups/:id/join`, `GET /api/v1/alumni/groups/:id/members`, `POST /api/v1/alumni/mentorship/request`, `POST /api/v1/alumni/mentorship/:id/respond`, `GET /api/v1/alumni/mentorship/my`, `POST /api/v1/activity/events`, `GET /api/v1/activity/events`, `GET /api/v1/activity/scores/me`, `GET /api/v1/activity/users/:userId/score`, `POST /api/v1/activity/recalculate`, `GET /api/v1/portfolio/projects/:id`, `PATCH /api/v1/portfolio/projects/:id`, `DELETE /api/v1/portfolio/projects/:id`, `GET /api/v1/portfolio/showcase/:targetUserId`, `GET /api/v1/gamification/summary`, `GET /api/v1/gamification/transactions`, `GET /api/v1/gamification/badges`, `GET /api/v1/gamification/leaderboard`, `POST /api/v1/gamification/claim-activity`, `GET /api/v1/settings/export/latest`, `POST /api/v1/settings/erasure/request`, `GET /api/v1/settings/erasure/status`, `POST /api/v1/settings/erasure/cancel`, `POST /api/v1/billing/checkout [disabled-mode]`, `POST /api/v1/billing/portal [disabled-mode]`, `POST /api/v1/billing/stripe-webhook [disabled-mode]`, `POST /api/v1/billing/subscribe`, `POST /api/v1/billing/cancel`, `GET /api/v1/billing/invoices`, `POST /api/v1/billing/webhook`, `PATCH /api/v1/admin/users/:id/roles`, `GET /api/v1/admin/feature-flags`, `PUT /api/v1/admin/feature-flags/:key`, `GET /api/v1/search/autocomplete`, `GET /api/v1/search/commands`, `GET /api/v1/search/history`, `DELETE /api/v1/search/history`, `POST /api/v1/moderation/scan`, `POST /api/v1/moderation/reports`, `GET /api/v1/moderation/reports/my`, `GET /api/v1/moderation/reports`, `GET /api/v1/moderation/reports/:id`, `PATCH /api/v1/moderation/reports/:id/status`, `POST /api/v1/moderation/reports/:id/resolve`, `POST /api/v1/moderation/reports/:id/appeal`, `GET /api/v1/moderation/appeals`, `POST /api/v1/moderation/appeals/:id/review`, `POST /api/v1/jobs/saved-searches`, `GET /api/v1/jobs/saved-searches`, `GET /api/v1/jobs/saved-searches/:id`, `PATCH /api/v1/jobs/saved-searches/:id`, `DELETE /api/v1/jobs/saved-searches/:id`, `POST /api/v1/jobs/saved-searches/:id/run`, `GET /api/v1/jobs/alerts`, `PATCH /api/v1/jobs/alerts/:id/read`, `POST /api/v1/jobs/:id/save`, `DELETE /api/v1/jobs/:id/save`, `GET /api/v1/jobs/saved`, `PUT /api/v1/jobs/:jobId/draft`, `GET /api/v1/jobs/:jobId/draft`, `DELETE /api/v1/jobs/:jobId/draft`, `POST /api/v1/jobs/:jobId/draft/restore`, `GET /api/v1/applications/drafts`, `POST /api/v1/analytics/events`, `GET /api/v1/analytics/events`, `GET /api/v1/analytics/kpis`, `GET /api/v1/candidates/:candidateId/work-history-graph`, `GET /api/v1/internal/worker-jobs`, `POST /api/v1/billing/stripe-webhook`

## 5. Screens that call no API directly — 5

/, /checkout, /privacy, /terms, /* (static content or data via shared components).

## 6. Mocked / partial integrations

| ID      | Integration                         | Status                | Note                                                                                      |
| ------- | ----------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| EXT-002 | Stripe                              | PARTIALLY_IMPLEMENTED | Active only with BILLING_MODE=stripe; default disabled. Live behaviour not verified here. |
| EXT-003 | Brevo (email)                       | PARTIALLY_IMPLEMENTED | Opt-in; dev uses labelled outbox. Live delivery not established by source.                |
| EXT-005 | Supabase (hosted Postgres tenancy)  | PARTIALLY_IMPLEMENTED | Used as a hosting target for Postgres only.                                               |
| EXT-006 | Meeting links (technical interview) | MOCKED                | URL template only; no provider SDK or API call found.                                     |

Worker: **43** dispatch kinds are recorded with a no-op handler (PARTIALLY_IMPLEMENTED): no delivery, recomputation or notification happens in the worker for them.

## 7. Dead-code candidates (MEDIUM/LOW confidence)

- Exported domain functions with **no non-test reference** (10): `verifyAffiliationBySeatCode`, `validateMonetizationIntegrity`, `renewSubscription`, `isAIAssistanceAllowed`, `assertNoSqlInjection`, `assertSafeSqlIdentifier`, `assertNoXssPayload`, `validateOutboundUrl`, `computeSalaryAggregates`, `removeSavedJob`
- Exported components with no importing file (2): `CareerPaths`, `CodeIcon`
- Page files not routed (0): none

## 8. Role and permission findings

- Roles defined in `core.ts` but never named in an explicit endpoint role check (5): hiring_manager, course_author, instructor, verification_staff, service_account. They may still be enforced inside guard functions or domain logic; the scan only proves there is no `session.roles.includes('<role>')` in a handler.
- The route guard (`RequireAuth`) checks token presence only. Role-specific screens gate themselves inside the page: `AdminPage` renders an access-denied view unless `roles` includes `platform_admin` (AdminPage.tsx:72, 174) and `HiringPage` unless `session.isRecruiter` (HiringPage.tsx:478). The Layout only hides nav items. Server endpoints enforce authorisation independently.

## 9. State-machine gaps

Explicit transition tables exist for **application** and **job** only. The other 31 status vocabularies (AdminUserStatus, SystemHealthStatus, AlumniVerificationStatus, AlumniMentorshipStatus, FeedbackStatus, BackgroundJobStatus, SubscriptionStatus, InvoiceStatus, UserStatus, EvidenceStatus, ApplicationState, JobStatus, …) are defined as unions without a transition rule in the scanned domain source; transitions for them (if any) are enforced ad hoc in handlers or not at all. This is a finding about missing explicit transitions, not proof of a bug.

## 10. Documentation vs code (three-source comparison)

Full comparison, per documented ID: [DOC_CODE_RECONCILIATION.md](DOC_CODE_RECONCILIATION.md). Summary:

- Features documented as **Not implemented** (2026-10-21) whose endpoint handlers cite them today (1): F-130 Freelance Marketplace.
- Features documented as implemented or partial that **no** source or test file cites (30): F-21, F-29, F-33, F-45, F-55, F-60, F-61, F-66, F-67, F-68, F-74, F-77, F-80, F-81, F-82, F-83, F-87, F-89, F-90, F-93, F-95, F-98, F-99, F-101, F-103, F-106, F-117, F-118, F-169, F-172 (weak evidence: code is not required to cite IDs; needs review).
- 75 of 282 endpoints cite no documented F-/BR- ID (by module: interviews 12, reputation 8, evidence 7, organizations 7, auth 6, skills 6, jobs 6, job-templates 5). Those are capabilities in code that the registries cannot be traced to.
- Numeric claims in living documents that differ from today's source: 0 of 10 checked (5 more are in dated snapshots, where differences are expected; table in the reconciliation file).

Code-vs-test: endpoints with no test reference: 3 (see test map).

## 11. Duplicated rules and PWA claims

- `apps/web/src/lib/types.ts` `APPLICATION_TRANSITIONS` mirrors `ALLOWED_APPLICATION_TRANSITIONS` in `packages/domain/src/core.ts`: identical today; `apps/web/src/lib/types.ts` `JOB_TRANSITIONS` mirrors `ALLOWED_JOB_TRANSITIONS` in `packages/domain/src/jobs.ts`: identical today. A copy in the web app restates a domain rule outside `packages/domain` (CLAUDE.md: business rules live only there); it is a drift risk even while identical.
- PWA: web manifest present (`apps/web/public/manifest.webmanifest`); service-worker **registration** in `apps/web`: **none found**. `apps/web/src/pwa.ts` only _detects_ a controlling worker, so with no registration `offlineReady` stays false and there is no offline behaviour, although the product is described as PWA-first.

## 12. Other findings

- Billing routes are registered twice by design: 6 disabled-mode stubs in `server.ts` and Stripe-mode handlers in `billing-stripe.ts` (selected by `BILLING_MODE`).
- Interview join links are built from a fixed host string in `packages/domain/src/technical-interview.ts` (no provider integration): MOCKED.
- CI on `main` has been red since 2026-10-26 (GitHub Actions). Reproduced on 2026-11-25: `pnpm lint` fails (230 files unformatted: 199 in Yash_Final_Project_Document/, 25 tracked .omc/ agent-state JSON files (root, apps/web, deploy/oracle), 4 in PRODUCT_BLUEPRINT/, plus .claude/launch.json and tests/security/injection-defenses.test.ts. Lint is the first check step in .github/workflows/ci.yml, so CI on main stops there and the later steps never run.) Every later CI step that was re-run here passes.
- Not detected (no occurrences in source): GraphQL, WebSockets, IndexedDB, SQLite, mobile apps, feature-flag SDKs (flags are a first-party table + endpoint).

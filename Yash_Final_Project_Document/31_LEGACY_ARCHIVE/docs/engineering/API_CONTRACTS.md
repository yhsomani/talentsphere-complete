# API contracts and endpoint reference

Source cross-check: `431c425a`, 2026-10-23. This document describes the checked-in
HTTP implementation; it is not a live API or production acceptance result.

## Contract ownership

- Routes: [server.ts](../../apps/api/src/server.ts), with Stripe routes in
  [billing-stripe.ts](../../apps/api/src/billing-stripe.ts).
- Request fields, defaults and bounds: [contracts](../../packages/contracts/src/index.ts).
- Business transitions: [domain modules](../../packages/domain/src/index.ts).
- Roles, ownership and known exceptions: [route authorization](../system-model/06-route-authorization.md).
- Persistence: [database reference](DATABASE.md). A route header is not a whole-feature durability guarantee.

The former service, integration, queue, realtime and media target registers are
canonical in [SSOT section 13](../../SSOT.md#13-api-event-integration-queue-realtime--media-contracts).
This removes duplicated specifications without changing intent. Those targets
include OpenAPI 3.1, cursor pagination, general mutation idempotency, circuit
breakers, heavy workers and realtime; these are not universal implemented contracts.
The former BYO-key integration row remains a target: encrypted key storage exists,
but provider execution does not. Heavy-queue technology selection remains open.

## Transport, validation and errors

The API is JSON over HTTP under `/api/v1`; `/health` is also available. There is
no generated OpenAPI document. Protected routes accept `Authorization: Bearer
<token>`. Tokens are TalentSphere HMAC sessions, not Supabase JWTs. `extractUser`
checks token validity and current account/session state; individual handlers
check roles and record ownership. Public reads and provider callbacks have their
own access rules. Never infer authorization from the URL or frontend guard.

The global handler in `server.ts` returns:

```json
{"error":{"code":"VALIDATION_FAILED","message":"The submitted payload failed schema validation.","request_id":"request-id","details":[{"path":"email","message":"Invalid email"}]}}
```

| Failure | HTTP | Implementation |
| --- | --- | --- |
| Zod payload parsing | 400 | `VALIDATION_FAILED`, field paths in `details` |
| Missing/invalid/expired/revoked session | 401 | `UNAUTHENTICATED` |
| Role, ownership, tenant or assessment AI denial | 403 | Domain authorization code |
| Missing record | 404 | `NOT_FOUND`; concealment differs by handler |
| Conflicting state, unique key or guarded concurrent update | 409 | `CONFLICT` |
| Domain validation, policy or illegal transition | 422 | Domain code; distinct from Zod's 400 |
| AI quota or payment requirement | 402 | `FREE_USER_AI_QUOTA_EXCEEDED` / `PAYMENT_REQUIRED` |
| Throttling | 429 | `RATE_LIMIT_EXCEEDED`; plugin supplies retry timing |
| Disabled provider/service | 503 | `SERVICE_UNAVAILABLE` |
| Unexpected error | 500 | `INTERNAL_SERVER_ERROR`; details masked in deployed environments |

Every response gets `x-request-id`. The global limiter defaults to 300 requests
per minute per verified account, otherwise per client address. Health is exempt;
login/signup have stricter limits. `TRUST_PROXY` controls address interpretation.
Stripe webhooks still share global throttling. See [operations](../quality/OPERATIONS.md).

Success bodies are handler-specific objects, not a universal `data` envelope.
`PaginationQuerySchema` is page/limit based, but is not universally used; do not
add `cursor` to arbitrary calls and expect pagination. Likewise, an idempotency
field is meaningful only where the handler actually consumes it.

## Representative requests and effects

All paths in this table have the `/api/v1` prefix. Exact optional fields and
limits live in the named schemas, avoiding a second drifting schema definition.

| Request | Input / success body | Rules and side effects |
| --- | --- | --- |
| `POST /auth/register` | `RegisterInputSchema`: email, password, fullName, candidate/recruiter role; returns token, user and profile | Persists account/profile; arbitrary elevated roles cannot be self-registered |
| `POST /auth/login` | `LoginInputSchema`; token, user and profile | Password verification, decoy hash for unknown email, legacy-hash upgrade |
| `GET /auth/session` | Bearer token; user/profile/memberships | Uses current account roles, status, revocation and issuance cutoff |
| `POST /auth/password` | `ChangePasswordInputSchema` | Verifies current password; advances session cutoff |
| `POST /evidence` | `CreateEvidenceInputSchema`; evidence | Uses caller's profile; validates all skill IDs before one transaction |
| `POST /evidence/:id/verify` | `VerifyEvidenceInputSchema`; evidence | Verification level requires corresponding authority; guarded state update |
| `POST /jobs/:id/apply` | `SubmitApplicationInputSchema`: optional coverLetter and attachedEvidenceIds; application | Evidence ownership, published job, one active application, database conflict handling |
| `POST /applications/:id/transition` | `TransitionApplicationInputSchema` | Party authorization and `ALLOWED_APPLICATION_TRANSITIONS`; persists before response |
| `POST /billing/checkout` | `{ "planTier": "candidate_pro", "billingCycle": "monthly", "idempotencyKey": "purchase-1" }`; 201 `{ "url": "..." }` | Server chooses Stripe price; role eligibility and existing paid subscription checked |
| `POST /billing/portal` | Session; 200 `{ "url": "..." }` | Requires a linked Stripe customer |
| `POST /billing/stripe-webhook` | Raw JSON plus `stripe-signature`; processing status | SDK signature verification, normalized events, atomic billing event/state storage |
| `POST /ai/career-assistant/chat` | `AIChatInputSchema`; conversationId, message, provenance | Assessment prohibition, prompt checks, hardcoded free quota, heuristic response; memory state |
| `POST /ai/assistant/query` | `AIAssistantQueryInputSchema`; answer, disclaimer | Separate echo-style scaffold; assessment check but no chat quota/firewall |
| `POST /settings/erasure/execute` | Session | Immediate multi-stage erasure; does not enforce the request grace period; see database failure limits |

For example, a signed-in client can submit a job application with a JSON body
`{"coverLetter":"I would like to apply."}` and `Content-Type: application/json`.
The job ID belongs in the route. A duplicate active application is a conflict,
not a second successful application. Tests: `tests/integration/jobs-applications.test.ts`.

## Billing modes and retry semantics

`disabled` is the default. `simulated` activates test subscriptions without taking
money and is refused in production. `stripe` registers the real adapter; missing
keys/webhook secret/catalog or duplicate configured price IDs fail configuration
checks. Outside Stripe mode, checkout/portal/Stripe callback routes return 503.
The generic `/billing/webhook` uses `x-talentsphere-signature`, a separate HMAC
format; it is not the Stripe callback.

Checkout scopes provider idempotency by account, plan, cycle and client key.
Stripe event IDs are recorded with state changes by `BillingStore.applyEvent`.
Subscription reconciliation handles event ordering and entitlement changes;
invoice events update invoice records. A full current-period refund only ends
access when its payment belongs to the active subscription. Partial, old-period
and unrelated refunds do not. Disputes and voided invoices remain unsupported.
A browser checkout-success redirect alone does not grant entitlements.

Two concurrent checkout sessions can still produce a superseded paid subscription;
its automatic resolution remains a policy gap. Event dispatch occurs after billing
commit, not in a transactional outbox. Tests use fake gateways unless explicitly
identified otherwise; live processing is unverified here.

## Complete static endpoint index

The table below is a source-registration index, not an OpenAPI specification or
proof that every branch ran. `S` links to [server.ts](../../apps/api/src/server.ts);
`B` to [billing-stripe.ts](../../apps/api/src/billing-stripe.ts). Line numbers are
snapshot locators. Schemas are the named `.parse` calls inside each registration
span; `handler` means inspect inline validation or the callback adapter. Response
formats remain owned by the handler and its integration tests.

`P` means listed in `DURABLE_ROUTES`, `S` in `STATELESS_ROUTES`, and `E` means the
API labels it ephemeral. `P` only applies to PostgreSQL mode and does not prove
all downstream state survives restart. Some `E` routes also write durable rows.
Three Stripe paths have conditional disabled-mode registrations and enabled-mode
implementations; they are listed once with both locations.

Measured: 281 literal registrations, 278 unique method/path pairs; 78 durable registry entries and 3 stateless entries.

| Method and path | Request schema | Registry | Source |
| --- | --- | --- | --- |
| `GET /health` | handler | S | S:743 |
| `GET /api/v1/health` | handler | S | S:751 |
| `GET /api/v1/feature-flags` | handler | P | S:785 |
| `POST /api/v1/auth/register` | `RegisterInputSchema` | P | S:967 |
| `POST /api/v1/auth/login` | `LoginInputSchema` | P | S:1007 |
| `POST /api/v1/auth/password` | `ChangePasswordInputSchema` | P | S:1066 |
| `POST /api/v1/auth/sign-out` | handler | P | S:1137 |
| `POST /api/v1/auth/sign-out-others` | handler | P | S:1163 |
| `GET /api/v1/auth/session` | handler | P | S:1191 |
| `GET /api/v1/profile/me` | handler | P | S:1212 |
| `PATCH /api/v1/profile/me` | `UpdateProfileInputSchema` | P | S:1221 |
| `GET /api/v1/profile/:id` | handler | P | S:1236 |
| `POST /api/v1/evidence` | `CreateEvidenceInputSchema` | P | S:1368 |
| `GET /api/v1/evidence/:id` | handler | P | S:1412 |
| `GET /api/v1/evidence/mine` | handler | P | S:1445 |
| `GET /api/v1/evidence/subject/:subjectId` | handler | P | S:1453 |
| `POST /api/v1/evidence/:id/verify` | `VerifyEvidenceInputSchema` | P | S:1497 |
| `POST /api/v1/evidence/:id/dispute` | `DisputeEvidenceInputSchema` | P | S:1545 |
| `POST /api/v1/evidence/:id/revoke` | `RevokeEvidenceInputSchema` | P | S:1586 |
| `GET /api/v1/evidence/:id/verify-public` | handler | P | S:1627 |
| `GET /api/v1/skills` | handler | P | S:1642 |
| `POST /api/v1/skills` | `CreateSkillInputSchema` | P | S:1646 |
| `POST /api/v1/skills/relationships` | `CreateSkillRelationshipInputSchema` | E | S:1676 |
| `GET /api/v1/skills/:id/graph` | handler | E | S:1705 |
| `POST /api/v1/organizations` | `CreateOrganizationInputSchema` | P | S:1748 |
| `GET /api/v1/organizations/mine` | handler | P | S:1782 |
| `GET /api/v1/organizations/:id/jobs` | handler | P | S:1795 |
| `GET /api/v1/organizations/:id` | handler | P | S:1819 |
| `POST /api/v1/organizations/:id/members` | `AddOrganizationMemberInputSchema` | P | S:1831 |
| `POST /api/v1/jobs` | `CreateJobInputSchema` | P | S:1878 |
| `GET /api/v1/jobs` | handler | P | S:1944 |
| `GET /api/v1/jobs/:id` | handler | P | S:1958 |
| `PATCH /api/v1/jobs/:id/status` | `UpdateJobStatusInputSchema` | P | S:1978 |
| `POST /api/v1/job-templates` | `CreateJobTemplateInputSchema` | E | S:2019 |
| `GET /api/v1/job-templates` | handler | E | S:2086 |
| `GET /api/v1/job-templates/:id` | handler | E | S:2127 |
| `PATCH /api/v1/job-templates/:id` | `UpdateJobTemplateInputSchema` | E | S:2153 |
| `DELETE /api/v1/job-templates/:id` | handler | E | S:2237 |
| `POST /api/v1/job-templates/:id/instantiate` | `InstantiateJobFromTemplateInputSchema` | E | S:2284 |
| `POST /api/v1/jobs/:id/save-as-template` | `SaveJobAsTemplateInputSchema` | E | S:2362 |
| `POST /api/v1/salaries/reports` | `SubmitSalaryReportInputSchema` | E | S:2425 |
| `GET /api/v1/salaries/reports/my` | handler | E | S:2487 |
| `DELETE /api/v1/salaries/reports/:id` | handler | E | S:2493 |
| `GET /api/v1/salaries/benchmarks` | `SalaryBenchmarkQuerySchema` | E | S:2525 |
| `GET /api/v1/salaries/company/:companyName` | handler | E | S:2543 |
| `POST /api/v1/jobs/:id/apply` | `SubmitApplicationInputSchema` | P | S:2555 |
| `GET /api/v1/applications/my` | handler | P | S:2651 |
| `GET /api/v1/applications/:id` | handler | P | S:2675 |
| `GET /api/v1/jobs/:id/applications` | handler | P | S:2700 |
| `POST /api/v1/applications/:id/transition` | `TransitionApplicationInputSchema` | P | S:2751 |
| `POST /api/v1/applications/:id/feedback` | `CreateApplicationFeedbackInputSchema` | E | S:2841 |
| `GET /api/v1/applications/:id/feedback` | handler | E | S:2926 |
| `POST /api/v1/applications/:id/feedback/request` | handler | E | S:2967 |
| `POST /api/v1/organizations/:orgId/feedback-templates` | `CreateFeedbackTemplateInputSchema` | E | S:3019 |
| `GET /api/v1/organizations/:orgId/feedback-templates` | handler | E | S:3063 |
| `GET /api/v1/feedback/aggregate-insights` | handler | E | S:3085 |
| `POST /api/v1/skills/freshness` | `RegisterSkillFreshnessInputSchema` | E | S:3095 |
| `GET /api/v1/skills/freshness/my` | handler | E | S:3136 |
| `GET /api/v1/candidates/:candidateProfileId/skills/freshness` | handler | E | S:3147 |
| `POST /api/v1/skills/:skillId/reverify` | `ReverifySkillInputSchema` | E | S:3186 |
| `POST /api/v1/skills/freshness/refresh-all` | handler | E | S:3239 |
| `POST /api/v1/interviews/questions` | `CreateInterviewQuestionInputSchema` | E | S:3275 |
| `GET /api/v1/interviews/questions` | handler | E | S:3317 |
| `POST /api/v1/interviews/assessments` | `ScheduleInterviewAssessmentInputSchema` | E | S:3390 |
| `GET /api/v1/interviews/assessments/:id` | handler | E | S:3486 |
| `POST /api/v1/interviews/assessments/:id/join` | handler | E | S:3518 |
| `POST /api/v1/interviews/assessments/:id/consent` | `SetRecordingConsentInputSchema` | E | S:3546 |
| `POST /api/v1/interviews/assessments/:id/end` | handler | E | S:3567 |
| `POST /api/v1/interviews/assessments/:id/code` | `ExecuteInterviewCodeInputSchema` | E | S:3603 |
| `POST /api/v1/interviews/assessments/:id/scorecard` | `SubmitInterviewScorecardInputSchema` | E | S:3653 |
| `POST /api/v1/interviews/assessments/:id/scorecard/compensate` | `CompensateInterviewScorecardInputSchema` | E | S:3729 |
| `GET /api/v1/interviews/assessments/:id/scorecards` | handler | E | S:3789 |
| `POST /api/v1/interviews/assessments/:id/ai-feedback` | handler | E | S:3821 |
| `POST /api/v1/interviews/assessments/:id/review` | handler | E | S:3841 |
| `POST /api/v1/reputation/signals` | `AddReputationSignalInputSchema` | E | S:3867 |
| `GET /api/v1/reputation/users/:userId` | handler | E | S:3930 |
| `GET /api/v1/reputation/my/signals` | handler | E | S:4002 |
| `POST /api/v1/reputation/recovery` | `StartRecoveryPlanInputSchema` | E | S:4008 |
| `POST /api/v1/reputation/recovery/:planId/tasks/:taskId/complete` | handler | E | S:4039 |
| `POST /api/v1/reputation/recalculate-all` | handler | E | S:4104 |
| `GET /api/v1/reputation/instructors/:instructorId` | handler | E | S:4159 |
| `POST /api/v1/reputation/instructors/:instructorId/metrics` | `SubmitInstructorMetricsInputSchema` | E | S:4186 |
| `POST /api/v1/reputation/instructors/:instructorId/endorse` | `CreateInstructorEndorsementInputSchema` | E | S:4240 |
| `POST /api/v1/reputation/instructors/:instructorId/reviews` | `SubmitInstructorReviewInputSchema` | E | S:4290 |
| `POST /api/v1/reputation/instructors/recompute` | handler | E | S:4322 |
| `GET /api/v1/reputation/organizations/:organizationId` | handler | E | S:4353 |
| `POST /api/v1/reputation/organizations/:organizationId/reviews` | `SubmitEmployerReviewInputSchema` | E | S:4376 |
| `POST /api/v1/reputation/organizations/:organizationId/metrics` | `SubmitEmployerMetricsInputSchema` | E | S:4460 |
| `GET /api/v1/reputation/organizations/:organizationId/reviews` | handler | E | S:4505 |
| `GET /api/v1/challenges` | handler | E | S:4534 |
| `GET /api/v1/challenges/:id` | handler | E | S:4539 |
| `POST /api/v1/challenges` | `CreateChallengeInputSchema` | E | S:4551 |
| `POST /api/v1/challenges/:id/start-session` | handler | E | S:4583 |
| `POST /api/v1/challenges/:id/submit` | `SubmitChallengeSolutionInputSchema` | E | S:4616 |
| `POST /api/v1/ai/assistant/query` | `AIAssistantQueryInputSchema` | E | S:4719 |
| `GET /api/v1/xp/ledger` | handler | E | S:4737 |
| `GET /api/v1/courses` | handler | E | S:4764 |
| `POST /api/v1/courses` | `CreateCourseInputSchema` | E | S:4796 |
| `GET /api/v1/courses/:id` | handler | E | S:4843 |
| `POST /api/v1/courses/:id/modules` | `CreateCourseModuleInputSchema` | E | S:4886 |
| `POST /api/v1/modules/:id/lessons` | `CreateLessonInputSchema` | E | S:4931 |
| `POST /api/v1/courses/:id/publish` | handler | E | S:4991 |
| `POST /api/v1/courses/:id/enroll` | handler | E | S:5033 |
| `GET /api/v1/courses/:id/progress` | handler | E | S:5066 |
| `POST /api/v1/lessons/:id/complete` | handler | E | S:5101 |
| `GET /api/v1/certificates/:certificateNumber` | handler | E | S:5264 |
| `GET /api/v1/verify/:hash` | handler | E | S:5287 |
| `GET /api/v1/certificates/verify/:hash` | handler | E | S:5335 |
| `GET /api/v1/certificates/my` | handler | E | S:5357 |
| `POST /api/v1/certificates/:certificateNumber/revoke` | `RevokeCertificateInputSchema` | E | S:5382 |
| `GET /api/v1/threads` | handler | P | S:5518 |
| `POST /api/v1/threads` | `CreateThreadInputSchema` | P | S:5550 |
| `GET /api/v1/threads/:id` | handler | P | S:5641 |
| `POST /api/v1/threads/:id/messages` | `SendMessageInputSchema` | P | S:5684 |
| `POST /api/v1/threads/:id/read` | handler | P | S:5745 |
| `GET /api/v1/notifications` | handler | P | S:5773 |
| `GET /api/v1/notifications/summary` | handler | P | S:5804 |
| `POST /api/v1/notifications/mark-read` | `MarkNotificationsReadInputSchema` | P | S:5813 |
| `GET /api/v1/notifications/preferences` | handler | P | S:5843 |
| `PATCH /api/v1/notifications/preferences` | `UpdateNotificationPreferencesInputSchema` | P | S:5859 |
| `POST /api/v1/ai/conversations` | `CreateAIConversationInputSchema` | E | S:5918 |
| `GET /api/v1/ai/conversations` | handler | E | S:5932 |
| `GET /api/v1/ai/conversations/:id` | handler | E | S:5938 |
| `POST /api/v1/ai/career-assistant/chat` | `AIChatInputSchema` | E | S:5958 |
| `GET /api/v1/ai/usage` | handler | E | S:6051 |
| `POST /api/v1/resumes` | `CreateResumeInputSchema` | E | S:6066 |
| `GET /api/v1/resumes` | handler | E | S:6080 |
| `GET /api/v1/resumes/:id` | handler | E | S:6086 |
| `PATCH /api/v1/resumes/:id` | `UpdateResumeInputSchema` | E | S:6105 |
| `POST /api/v1/resumes/:id/export` | `ExportResumeInputSchema` | E | S:6136 |
| `GET /api/v1/resumes/:id/exports` | handler | E | S:6177 |
| `DELETE /api/v1/resumes/exports/:exportId` | handler | E | S:6205 |
| `POST /api/v1/connections/request` | `RequestConnectionInputSchema` | E | S:6242 |
| `GET /api/v1/connections` | handler | E | S:6306 |
| `GET /api/v1/connections/status/:targetUserId` | handler | E | S:6353 |
| `POST /api/v1/connections/:id/respond` | `RespondConnectionInputSchema` | E | S:6375 |
| `POST /api/v1/connections/:id/withdraw` | handler | E | S:6443 |
| `DELETE /api/v1/connections/:id` | handler | E | S:6479 |
| `POST /api/v1/networking/warm-intros/preferences` | `UpdateWarmIntroPreferencesInputSchema` | E | S:6546 |
| `GET /api/v1/networking/warm-intros/preferences` | handler | E | S:6573 |
| `GET /api/v1/networking/warm-intros/paths` | handler | E | S:6588 |
| `POST /api/v1/networking/warm-intros/requests` | `CreateWarmIntroRequestInputSchema` | E | S:6614 |
| `GET /api/v1/networking/warm-intros/requests/incoming` | handler | E | S:6693 |
| `GET /api/v1/networking/warm-intros/requests/outgoing` | handler | E | S:6702 |
| `GET /api/v1/networking/warm-intros/requests/:id` | handler | E | S:6711 |
| `POST /api/v1/networking/warm-intros/requests/:id/respond` | `RespondWarmIntroRequestInputSchema` | E | S:6737 |
| `POST /api/v1/referrals/requests` | `CreateReferralRequestInputSchema` | E | S:6818 |
| `GET /api/v1/referrals/requests/incoming` | handler | E | S:6898 |
| `GET /api/v1/referrals/requests/outgoing` | handler | E | S:6907 |
| `GET /api/v1/referrals/requests/:id` | handler | E | S:6916 |
| `POST /api/v1/referrals/requests/:id/respond` | `RespondReferralRequestInputSchema` | E | S:6941 |
| `GET /api/v1/referrals/outcomes` | handler | E | S:7055 |
| `POST /api/v1/skills/endorsements` | `CreateSkillEndorsementInputSchema` | E | S:7109 |
| `GET /api/v1/skills/endorsements/recipients/:recipientId` | handler | E | S:7200 |
| `DELETE /api/v1/skills/endorsements/:id` | handler | E | S:7227 |
| `GET /api/v1/skills/endorsements/my/given` | handler | E | S:7257 |
| `GET /api/v1/skills/forecast/top-growth` | `TopEmergingSkillsQuerySchema` | E | S:7285 |
| `POST /api/v1/skills/:skillId/market-signals` | `RecordSkillMarketSignalInputSchema` | E | S:7330 |
| `GET /api/v1/skills/:skillId/forecast` | `QuerySkillForecastInputSchema` | E | S:7382 |
| `POST /api/v1/skills/:skillId/forecast/generate` | `GenerateSkillForecastInputSchema` | E | S:7421 |
| `POST /api/v1/career/transitions` | `RecordCareerTransitionInputSchema` | E | S:7493 |
| `GET /api/v1/career/transitions/my` | handler | E | S:7552 |
| `GET /api/v1/career/benchmarks` | `QueryCareerBenchmarksQuerySchema` | E | S:7570 |
| `POST /api/v1/career/transition-probability` | `CalculateTransitionProbabilityInputSchema` | E | S:7613 |
| `GET /api/v1/career/pathways` | `CareerProgressionPathwaysQuerySchema` | E | S:7646 |
| `POST /api/v1/career/milestones/readiness` | `EvaluateMilestoneReadinessInputSchema` | E | S:7670 |
| `POST /api/v1/learning/impact/outcomes` | `RecordLearningOutcomeInputSchema` | E | S:7725 |
| `GET /api/v1/learning/impact/courses/:courseId` | `QueryLearningImpactInputSchema` | E | S:7803 |
| `POST /api/v1/learning/impact/courses/:courseId/compute` | `ComputeLearningImpactInputSchema` | E | S:7836 |
| `GET /api/v1/learning/impact/dashboard` | `LearningImpactDashboardQuerySchema` | E | S:7882 |
| `POST /api/v1/recruiter/talent-pools` | `CreateTalentPoolInputSchema` | E | S:7911 |
| `GET /api/v1/recruiter/talent-pools` | handler | E | S:7961 |
| `GET /api/v1/recruiter/talent-pools/:poolId` | handler | E | S:8001 |
| `POST /api/v1/recruiter/talent-pools/:poolId/members` | `AddPoolMemberInputSchema` | E | S:8028 |
| `PATCH /api/v1/recruiter/talent-pools/:poolId/members/:memberId` | `UpdatePoolMemberStatusInputSchema` | E | S:8120 |
| `GET /api/v1/recruiter/talent-pools/:poolId/intelligence` | `QueryPoolIntelligenceInputSchema` | E | S:8167 |
| `POST /api/v1/recruiter/discovery/behavioral/compute` | `ComputeBehavioralProfileInputSchema` | E | S:8375 |
| `GET /api/v1/recruiter/discovery/behavioral` | `DiscoverBehavioralTalentQuerySchema` | E | S:8426 |
| `GET /api/v1/recruiter/discovery/behavioral/:candidateId` | handler | E | S:8481 |
| `POST /api/v1/recruiter/talent-segmentation/classify` | `ClassifyCandidateInputSchema` | E | S:8603 |
| `GET /api/v1/recruiter/talent-segmentation/segments` | `QuerySegmentDistributionInputSchema` | E | S:8676 |
| `GET /api/v1/recruiter/talent-segmentation/candidates` | `FilterSegmentedTalentQuerySchema` | E | S:8701 |
| `GET /api/v1/recruiter/talent-segmentation/candidates/:candidateId` | handler | E | S:8764 |
| `POST /api/v1/alumni/affiliations` | `CreateAlumniAffiliationInputSchema` | E | S:8832 |
| `POST /api/v1/alumni/affiliations/:id/verify` | `VerifyAlumniAffiliationInputSchema` | E | S:8902 |
| `GET /api/v1/alumni/affiliations/my` | handler | E | S:8997 |
| `GET /api/v1/alumni/institutions/:institutionId/directory` | `QueryAlumniDirectoryInputSchema` | E | S:9007 |
| `POST /api/v1/alumni/institutions/:institutionId/groups` | `CreateAlumniGroupInputSchema` | E | S:9070 |
| `GET /api/v1/alumni/institutions/:institutionId/groups` | handler | E | S:9115 |
| `POST /api/v1/alumni/groups/:id/join` | `JoinAlumniGroupInputSchema` | E | S:9146 |
| `GET /api/v1/alumni/groups/:id/members` | handler | E | S:9200 |
| `POST /api/v1/alumni/mentorship/request` | `RequestAlumniMentorshipInputSchema` | E | S:9227 |
| `POST /api/v1/alumni/mentorship/:id/respond` | `RespondAlumniMentorshipInputSchema` | E | S:9278 |
| `GET /api/v1/alumni/mentorship/my` | handler | E | S:9306 |
| `POST /api/v1/activity/events` | `RecordActivityEventInputSchema` | E | S:9323 |
| `GET /api/v1/activity/events` | handler | E | S:9360 |
| `GET /api/v1/activity/scores/me` | handler | E | S:9385 |
| `GET /api/v1/activity/users/:userId/score` | handler | E | S:9394 |
| `POST /api/v1/activity/recalculate` | handler | E | S:9424 |
| `POST /api/v1/portfolio/projects` | `CreatePortfolioProjectInputSchema` | E | S:9437 |
| `GET /api/v1/portfolio/projects` | handler | E | S:9462 |
| `GET /api/v1/portfolio/projects/:id` | handler | E | S:9468 |
| `PATCH /api/v1/portfolio/projects/:id` | `UpdatePortfolioProjectInputSchema` | E | S:9496 |
| `DELETE /api/v1/portfolio/projects/:id` | handler | E | S:9535 |
| `GET /api/v1/portfolio/showcase/:targetUserId` | handler | E | S:9574 |
| `GET /api/v1/gamification/summary` | handler | E | S:9648 |
| `GET /api/v1/gamification/transactions` | handler | E | S:9672 |
| `GET /api/v1/gamification/badges` | handler | E | S:9678 |
| `GET /api/v1/gamification/leaderboard` | `GetLeaderboardQuerySchema` | E | S:9692 |
| `POST /api/v1/gamification/claim-activity` | `ClaimGamificationActivityInputSchema` | E | S:9734 |
| `GET /api/v1/settings` | handler | P | S:9873 |
| `PATCH /api/v1/settings` | `UpdateUserSettingsInputSchema` | P | S:9883 |
| `POST /api/v1/settings/export` | `RequestDataExportInputSchema` | E | S:9926 |
| `GET /api/v1/settings/export/latest` | handler | P | S:10031 |
| `POST /api/v1/settings/erasure/request` | `RequestErasureInputSchema` | P | S:10041 |
| `GET /api/v1/settings/erasure/status` | handler | P | S:10066 |
| `POST /api/v1/settings/erasure/cancel` | `CancelErasureInputSchema` | P | S:10079 |
| `POST /api/v1/settings/erasure/execute` | handler | E | S:10101 |
| `POST /api/v1/billing/checkout` | `CreateCheckoutSessionInputSchema` | P | S:10320, B:245 |
| `POST /api/v1/billing/portal` | handler | P | S:10324, B:297 |
| `POST /api/v1/billing/stripe-webhook` | handler | P | S:10328, B:320 |
| `GET /api/v1/billing/plans` | handler | S | S:10377 |
| `GET /api/v1/billing/subscription` | handler | P | S:10387 |
| `POST /api/v1/billing/subscribe` | `SubscribePlanInputSchema` | P | S:10417 |
| `POST /api/v1/billing/cancel` | `CancelSubscriptionInputSchema` | P | S:10531 |
| `GET /api/v1/billing/invoices` | handler | P | S:10580 |
| `POST /api/v1/billing/webhook` | `ProcessPaymentWebhookInputSchema` | P | S:10610 |
| `GET /api/v1/admin/users` | handler | E | S:10684 |
| `PATCH /api/v1/admin/users/:id/status` | `AdminUpdateUserStatusInputSchema` | E | S:10720 |
| `PATCH /api/v1/admin/users/:id/roles` | `AdminUpdateUserRolesInputSchema` | E | S:10777 |
| `GET /api/v1/admin/feature-flags` | handler | P | S:10832 |
| `PUT /api/v1/admin/feature-flags/:key` | `AdminToggleFeatureFlagInputSchema` | P | S:10844 |
| `GET /api/v1/admin/audit-logs` | `AdminQueryAuditLogsSchema` | P | S:10886 |
| `GET /api/v1/admin/health-diagnostics` | handler | E | S:10908 |
| `POST /api/v1/admin/maintenance` | `AdminSetMaintenanceModeInputSchema` | E | S:10960 |
| `GET /api/v1/search` | `SearchQueryInputSchema` | E | S:10989 |
| `GET /api/v1/search/autocomplete` | `AutocompleteQueryInputSchema` | E | S:11237 |
| `GET /api/v1/search/commands` | handler | E | S:11315 |
| `GET /api/v1/search/history` | handler | E | S:11325 |
| `DELETE /api/v1/search/history` | `ClearSearchHistoryInputSchema` | E | S:11335 |
| `POST /api/v1/moderation/scan` | `ScanContentInputSchema` | E | S:11358 |
| `POST /api/v1/moderation/reports` | `CreateModerationReportInputSchema` | E | S:11365 |
| `GET /api/v1/moderation/reports/my` | handler | E | S:11433 |
| `GET /api/v1/moderation/reports` | handler | E | S:11458 |
| `GET /api/v1/moderation/reports/:id` | handler | E | S:11480 |
| `PATCH /api/v1/moderation/reports/:id/status` | `UpdateModerationReportStatusInputSchema` | E | S:11501 |
| `POST /api/v1/moderation/reports/:id/resolve` | `ResolveModerationReportInputSchema` | E | S:11524 |
| `POST /api/v1/moderation/reports/:id/appeal` | `CreateModerationAppealInputSchema` | E | S:11661 |
| `GET /api/v1/moderation/appeals` | handler | E | S:11698 |
| `POST /api/v1/moderation/appeals/:id/review` | `ReviewModerationAppealInputSchema` | E | S:11707 |
| `POST /api/v1/jobs/saved-searches` | `CreateSavedSearchInputSchema` | P | S:11756 |
| `GET /api/v1/jobs/saved-searches` | handler | P | S:11774 |
| `GET /api/v1/jobs/saved-searches/:id` | handler | P | S:11781 |
| `PATCH /api/v1/jobs/saved-searches/:id` | `UpdateSavedSearchInputSchema` | P | S:11798 |
| `DELETE /api/v1/jobs/saved-searches/:id` | handler | P | S:11818 |
| `POST /api/v1/jobs/saved-searches/:id/run` | handler | P | S:11836 |
| `GET /api/v1/jobs/alerts` | handler | E | S:11855 |
| `PATCH /api/v1/jobs/alerts/:id/read` | handler | E | S:11864 |
| `POST /api/v1/jobs/:id/save` | handler | P | S:11883 |
| `DELETE /api/v1/jobs/:id/save` | handler | P | S:11900 |
| `GET /api/v1/jobs/saved` | handler | P | S:11911 |
| `PUT /api/v1/jobs/:jobId/draft` | `SaveApplicationDraftInputSchema` | E | S:11924 |
| `GET /api/v1/jobs/:jobId/draft` | handler | E | S:11990 |
| `DELETE /api/v1/jobs/:jobId/draft` | handler | E | S:12020 |
| `POST /api/v1/jobs/:jobId/draft/restore` | `RestoreApplicationDraftVersionInputSchema` | E | S:12046 |
| `GET /api/v1/applications/drafts` | handler | E | S:12087 |
| `POST /api/v1/analytics/events` | `RecordAnalyticsEventBatchInputSchema`, `RecordAnalyticsEventInputSchema` | E | S:12113 |
| `GET /api/v1/analytics/events` | handler | E | S:12174 |
| `GET /api/v1/analytics/kpis` | handler | E | S:12193 |
| `POST /api/v1/candidates/work-history` | `CreateWorkHistoryInputSchema` | P | S:12240 |
| `POST /api/v1/candidates/work-history/:id/verify-email` | `VerifyWorkHistoryEmailInputSchema` | P | S:12296 |
| `POST /api/v1/candidates/work-history/:id/references/request` | `RequestEmploymentReferenceInputSchema` | P | S:12424 |
| `GET /api/v1/references/:refId` | handler | P | S:12522 |
| `POST /api/v1/candidates/work-history/references/:refId/submit` | `SubmitEmploymentReferenceInputSchema` | P | S:12558 |
| `GET /api/v1/candidates/:candidateId/work-history` | handler | P | S:12715 |
| `GET /api/v1/candidates/:candidateId/work-history-graph` | `QueryWorkHistoryGraphSchema` | P | S:12764 |
| `DELETE /api/v1/candidates/work-history/:id` | handler | P | S:12808 |
| `GET /api/v1/internal/worker-jobs` | handler | E | S:12862 |

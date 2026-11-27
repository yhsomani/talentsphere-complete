# API contracts and endpoint reference

Source cross-check: `431c425a`, 2026-10-23; error table, status codes, billing
retry rules and the endpoint index re-checked against `50d9861` plus the pass-2
fixes K-01…K-12, 2026-11-22. This document describes the checked-in HTTP
implementation; it is not a live API or production acceptance result.

## Contract ownership

- Routes: [server.ts](../../apps/api/src/server.ts), with Stripe routes in
  [billing-stripe.ts](../../apps/api/src/billing-stripe.ts).
- Request fields, defaults and bounds: [contracts](../../packages/contracts/src/index.ts).
- Business transitions: [domain modules](../../packages/domain/src/index.ts).
- Roles, ownership and known exceptions: [route authorization](../system-model/06-route-authorization.md).
- Persistence: [database reference](DATABASE.md). A route header is not a whole-feature durability guarantee.

The former service, integration, queue, realtime and media target registers are
canonical in [SSOT section 13](../SSOT.md#13-api-event-integration-queue-realtime--media-contracts).
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
| Zod payload or query parsing (including strict booleans such as `includeUnverified=maybe`) | 400 | `VALIDATION_FAILED`, field paths in `details` as `[{ path, message }]` |
| Malformed JSON or another Fastify/plugin client error | 400 / 415 | `REQUEST_FAILED`; message masked as "The request could not be completed." in deployed environments |
| Body over a route's `bodyLimit` | 413 | `REQUEST_FAILED` (same masking). Analytics ingest 64 KB, activity ingest 16 KB |
| Missing/invalid/expired/revoked session | 401 | `UNAUTHENTICATED` |
| Role, ownership, tenant, privacy or assessment AI denial; restricted account outside its allow-list | 403 | `FORBIDDEN` / `UNAUTHORIZED` / domain code |
| Missing record | 404 | `NOT_FOUND`; concealment differs by handler |
| Conflicting state, unique key, repeated one-way action or guarded concurrent update | 409 | `CONFLICT` |
| Domain validation, policy or illegal transition | 422 | `VALIDATION_FAILED`, `INVALID_STATE_TRANSITION` or `POLICY_VIOLATION`; distinct from Zod's 400. A wrong re-entered password names the field in `details.field` |
| AI quota or payment requirement | 402 | `FREE_USER_AI_QUOTA_EXCEEDED` / `PAYMENT_REQUIRED` |
| Throttling by the rate-limit plugin (global, auth, per-route limits) | 429 | `RATE_LIMIT_EXCEEDED`, generic message; the plugin sets `Retry-After` |
| Throttling by a domain budget (per-account sign-in failures, work-email codes, reference invitations, salary reports, referrals) | 429 | `RATE_LIMIT_EXCEEDED` with a specific message; **no** `Retry-After` header and no `details` |
| Disabled provider/service, unqueued email, unreachable payment provider | 503 | `SERVICE_UNAVAILABLE` |
| Unexpected error | 500 | `INTERNAL_SERVER_ERROR`; details masked in deployed environments |

A `DomainError` code missing from the handler's status map is answered with 400.

Every response gets `x-request-id`. The global limiter defaults to 300 requests
per minute per verified account, otherwise per client address. `/health`,
`/api/v1/health` and `/ready` are exempt. Login/signup have stricter limits
(`AUTH_RATE_LIMIT_MAX_REQUESTS`, default 10 per 15 min per address and email for
sign-in, twice that per address for sign-up).
`TRUST_PROXY` controls address interpretation. Stripe webhooks still share global
throttling. See [operations](../quality/OPERATIONS.md).

Limits that answer 429, besides the global limiter:

| Limit | Scope | Raised by |
| --- | --- | --- |
| Sign-in attempts | `AUTH_RATE_LIMIT_MAX_REQUESTS` per 15 min per address + email | plugin |
| Failed sign-ins for one account, from any address | `AUTH_ACCOUNT_FAILURE_MAX` (default 50) per 15 min; unknown emails behave identically. Each attempt is counted before the password check, so parallel guesses count against each other; a success clears the window | domain |
| Erasure password checks | `AUTH_RATE_LIMIT_MAX_REQUESTS` per 15 min per account | plugin |
| Analytics ingest | 60 requests per minute per caller | plugin |
| Activity ingest | 60 requests per minute per account | plugin |
| Work-email codes | 1 per role per 60 s; 5 per account per hour; 10 per address per day | domain |
| Reference invitations | 10 per account per hour | domain |

The work-email and reference budgets are reserved when the request passes the
check, before anything is awaited, so parallel requests cannot all pass the same
check. A request that then fails (the record could not be saved or the email job
could not be queued, 503) gives its reservation back. Budgets are per API process.

## Readiness

`GET /ready` (no `/api/v1` prefix, no authentication, exempt from the limiter)
answers 200 `{"status":"ready"}` or 503 `{"status":"not_ready"}`. In PostgreSQL
mode it is a database round trip with a 2 s limit; concurrent calls share one
probe and its result is reused for 1 s. When the writer lease is lost, every
request including `/ready` is answered 503 before any handler runs. Memory mode
is always ready. `/health` does no I/O and is liveness only.

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
| `POST /auth/login` | `LoginInputSchema`; token, user and profile | Password verification, decoy hash for unknown email, legacy-hash upgrade. 401 for a wrong email or password; 429 above either sign-in limit (see above) |
| `GET /auth/session` | Bearer token; user/profile/memberships | Uses current account roles, status, revocation and issuance cutoff |
| `POST /auth/password` | `ChangePasswordInputSchema` | Verifies current password; advances session cutoff; ends unused reset links |
| `POST /auth/password-reset/request` | `PasswordResetRequestInputSchema`: email; 202 message | Same answer for every email; for a known account stores a hashed token and queues the reset email; at most 3 an hour per account (ADR-019) |
| `POST /auth/password-reset/confirm` | `PasswordResetConfirmInputSchema`: token, newPassword; 200 message | Claims the token once; refused after 30 minutes (422); sets the password, advances the session cutoff, clears the cookie, issues no session |
| `POST /evidence` | `CreateEvidenceInputSchema`; evidence | Uses caller's profile; validates all skill IDs before one transaction |
| `POST /evidence/:id/verify` | `VerifyEvidenceInputSchema`; evidence | Verification level requires corresponding authority; guarded state update |
| `POST /jobs/:id/apply` | `SubmitApplicationInputSchema`: optional coverLetter and attachedEvidenceIds; application | Evidence ownership, published job, one active application, database conflict handling |
| `POST /applications/:id/transition` | `TransitionApplicationInputSchema` | Party authorization and `ALLOWED_APPLICATION_TRANSITIONS`; persists before response |
| `POST /billing/checkout` | `{ "planTier": "candidate_pro", "billingCycle": "monthly", "idempotencyKey": "purchase-1" }`; 201 `{ "url": "..." }` | Server chooses Stripe price. 403 plan not for this role; 409 a paid subscription is already live; 503 price not configured, provider failure or billing not in `stripe` mode |
| `POST /billing/portal` | Session; 200 `{ "url": "..." }` | Requires a linked Stripe customer |
| `POST /billing/stripe-webhook` | Raw JSON plus `stripe-signature`; processing status | SDK signature verification, normalized events, atomic billing event/state storage |
| `POST /ai/career-assistant/chat` | `AIChatInputSchema`; conversationId, message, provenance | Assessment prohibition, prompt checks, hardcoded free quota, heuristic response; memory state |
| `POST /ai/assistant/query` | `AIAssistantQueryInputSchema`; answer, disclaimer | Separate echo-style scaffold; assessment check but no chat quota/firewall |
| `POST /settings/erasure/execute` | Session and `ExecuteErasureInputSchema` `{ "currentPassword": "..." }`; 200 with `anonymizedHash` | Immediate multi-stage erasure; does not enforce the request grace period. Missing password 400; wrong password 422 with `details.field = "currentPassword"`; a concurrent erasure of the same account 409; over the per-account limit 429. Resuming an interrupted erasure needs no password; an already completed one answers 200 again |

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
The web client reuses its key only when the previous attempt's outcome is
unknown (network failure or timeout); after any answered failure, or when the
plan or cycle changes, it sends a new key, so a retry cannot replay a failure
Stripe stored under the old key. A new key after an error can leave an extra,
unused Checkout Session open until it expires; one open session per user is an
owner decision. Stripe event IDs are recorded with state changes by
`BillingStore.applyEvent`. `customer.subscription.*` events apply the
subscription re-fetched from Stripe, not the event's snapshot, so same-second
events cannot undo a newer state; if Stripe cannot be reached the webhook
answers 503 before anything is recorded and Stripe redelivers. A second live
subscription for one user is logged at error level with both ids. Subscription
reconciliation handles event ordering and entitlement changes; invoice events
update invoice records. A full current-period refund only ends
access when its payment belongs to the active subscription. Partial, old-period
and unrelated refunds do not. Disputes and voided invoices remain unsupported.
A browser checkout-success redirect alone does not grant entitlements.

Two concurrent checkout sessions can still produce a superseded paid subscription;
its automatic resolution remains a policy gap. Event dispatch occurs after billing
commit, not in a transactional outbox. Tests use fake gateways unless explicitly
identified otherwise; live processing is unverified here.

## Status codes added or changed by SSOT-AMD and the pass-2 fixes

Paths have the `/api/v1` prefix. Each row names the requirement it comes from.

| Route | Status and code | When |
| --- | --- | --- |
| `POST /auth/login` | 429 `RATE_LIMIT_EXCEEDED` | Per-account failed sign-ins over `AUTH_ACCOUNT_FAILURE_MAX` in 15 min, from any address; same answer for unknown emails (AMD-04). Parallel attempts each count (K-05) |
| `GET /auth/session` | 200 | Also for suspended or banned accounts; their other non-allow-listed routes stay 403 (AMD-17) |
| `POST /settings/erasure/execute` | 400 / 422 / 409 / 429 | See the table above (AMD-01) |
| `POST /evidence/:id/dispute` | 409 `CONFLICT`; 422 `INVALID_STATE_TRANSITION` | Already disputed and awaiting review; the record is revoked (AMD-19) |
| `POST /evidence/:id/revoke` | 409 `CONFLICT` | Already revoked (AMD-19) |
| `POST /jobs/:id/apply` | 422 `INVALID_STATE_TRANSITION` | An attached evidence record is revoked or expired (AMD-19) |
| `GET /evidence/:id`, `GET /evidence/subject/:subjectId` | 200 / 403 / 404 unchanged | Non-owners other than admins get the record without its internal metadata (K-03) |
| `POST /notifications/mark-read` | 422 `VALIDATION_FAILED` | Neither `"all": true` nor a non-empty `notificationIds` (e.g. `{}`) (AMD-20) |
| `POST /connections/request` | 403 | The recipient's stored `allowConnectionRequests` is false (AMD-26). Reading it never creates the recipient's settings (K-11) |
| `GET /activity/users/:userId/score` | 403 / 404 | 403 when the profile is not visible to the caller (accepted connections can see `connections_only`, K-07) or the person hides activity and the caller is not owner, admin or moderator; 404 unknown user (AMD-05) |
| `POST /activity/events` | 413 / 422 / 429 | Body over 16 KB; metadata over the limits (30 keys, key over 64 characters, depth 4, 50 array items, 1,000-character strings, over 4 KB serialized) (AMD-11, K-06); over 60 per minute |
| `POST /analytics/events` | 413 / 422 / 429 | Body over 64 KB; metadata with over 30 keys, a key over 64 characters, depth over 4, over 4 KB after sanitising, a secret-looking key or a bearer-token value (longer strings and arrays are cut, not refused) (AMD-11, K-06); over 60 per minute |
| `POST /candidates/work-history/:id/verify-email` (no code) | 429 / 503 | 429 inside the 60 s cooldown for that role, or over 5 per account per hour or 10 per address per day (AMD-06). 503 if delivery is not configured in production/staging, or the email job could not be queued; in that case the new code is discarded, the budget is returned and an immediate retry is accepted (K-05) |
| `POST /candidates/work-history/:id/verify-email` | 409 `CONFLICT` | The address is a live referee on one of the candidate's roles (K-01) |
| `POST /candidates/work-history/:id/references/request` | 409 `CONFLICT` | The referee is the candidate's account email or this role's work email, another of the candidate's own addresses, or already asked on this role and the request is still live (AMD-21, K-01). A request whose link expired, or a declined one, can be asked again (K-02) |
| `POST /candidates/work-history/:id/references/request` | 429 / 503 | Over 10 per account per hour (AMD-06). 503 if delivery is not configured or the invitation could not be queued; the stored request is removed and the budget is returned, so a retry is accepted (K-02, K-05) |
| `POST /alumni/affiliations/:id/verify` | 422 | The `email_domain` method while account emails are unverified. Creating an affiliation with a matching domain no longer auto-verifies it (stays `unverified`, 201) (AMD-03) |
| `GET /candidates/:candidateId/work-history-graph` | 400 | `includeUnverified` other than `true/false/1/0` (AMD-10) |
| `POST /billing/stripe-webhook` | 503 | Stripe could not be reached to re-fetch the subscription; nothing recorded, Stripe redelivers (AMD-16) |
| `GET /ready` | 200 / 503 | See Readiness (AMD-13, K-08) |

Unchanged codes on changed routes: public employer reviews no longer include
`reviewerId` for other readers (K-04); erasure also clears the caller's
in-memory records (K-12). Neither changes a status code.

## Complete static endpoint index

The table below is a source-registration index, not an OpenAPI specification or
proof that every branch ran. It was generated from the literal
`app.<method>('<path>'` and `scope.<method>('<path>'` registrations in
[server.ts](../../apps/api/src/server.ts) and
[billing-stripe.ts](../../apps/api/src/billing-stripe.ts); source line numbers
are no longer listed because they went stale on every change. Schemas are the
named `.parse` calls inside each registration span; `handler` means inspect
inline validation or the callback adapter. Response formats remain owned by the
handler and its integration tests.

`P` means listed in `DURABLE_ROUTES`, `S` in `STATELESS_ROUTES`, and `E` means the
API labels it ephemeral. `P` only applies to PostgreSQL mode and does not prove
all downstream state survives restart. Some `E` routes also write durable rows.
Three Stripe paths have conditional disabled-mode registrations and enabled-mode
implementations; they are listed once.

Measured: 284 literal registrations, 281 unique method/path pairs; 93 of them in `DURABLE_ROUTES` and 4 in `STATELESS_ROUTES` (registry sizes 93 and 4). The five application-draft routes moved from `E` to `P` with migration 00056 (PR #87, 2026-11-25), the two job-alert routes with `job-alert-store.ts` (PR #92, 2026-11-25, no new migration), the six connection routes with migration 00057 (2026-11-25), and the two password reset routes were added as `P` with migration 00058 (2026-11-27); re-counted from `apps/api/src/durability.ts` on 2026-11-27.

| Method and path | Request schema | Registry |
| --- | --- | --- |
| `GET /health` | handler | S |
| `GET /ready` | handler | S |
| `GET /api/v1/health` | handler | S |
| `GET /api/v1/feature-flags` | handler | P |
| `POST /api/v1/auth/register` | `RegisterInputSchema` | P |
| `POST /api/v1/auth/login` | `LoginInputSchema` | P |
| `POST /api/v1/auth/password` | `ChangePasswordInputSchema` | P |
| `POST /api/v1/auth/sign-out` | handler | P |
| `POST /api/v1/auth/sign-out-others` | handler | P |
| `POST /api/v1/auth/password-reset/request` | `PasswordResetRequestInputSchema` | P |
| `POST /api/v1/auth/password-reset/confirm` | `PasswordResetConfirmInputSchema` | P |
| `GET /api/v1/auth/session` | handler | P |
| `GET /api/v1/profile/me` | handler | P |
| `PATCH /api/v1/profile/me` | `UpdateProfileInputSchema` | P |
| `GET /api/v1/profile/:id` | handler | P |
| `POST /api/v1/evidence` | `CreateEvidenceInputSchema` | P |
| `GET /api/v1/evidence/:id` | handler | P |
| `GET /api/v1/evidence/mine` | handler | P |
| `GET /api/v1/evidence/subject/:subjectId` | handler | P |
| `POST /api/v1/evidence/:id/verify` | `VerifyEvidenceInputSchema` | P |
| `POST /api/v1/evidence/:id/dispute` | `DisputeEvidenceInputSchema` | P |
| `POST /api/v1/evidence/:id/revoke` | `RevokeEvidenceInputSchema` | P |
| `GET /api/v1/evidence/:id/verify-public` | handler | P |
| `GET /api/v1/skills` | handler | P |
| `POST /api/v1/skills` | `CreateSkillInputSchema` | P |
| `POST /api/v1/skills/relationships` | `CreateSkillRelationshipInputSchema` | E |
| `GET /api/v1/skills/:id/graph` | handler | E |
| `POST /api/v1/organizations` | `CreateOrganizationInputSchema` | P |
| `GET /api/v1/organizations/mine` | handler | P |
| `GET /api/v1/organizations/:id/jobs` | handler | P |
| `GET /api/v1/organizations/:id` | handler | P |
| `POST /api/v1/organizations/:id/members` | `AddOrganizationMemberInputSchema` | P |
| `POST /api/v1/jobs` | `CreateJobInputSchema` | P |
| `GET /api/v1/jobs` | handler | P |
| `GET /api/v1/jobs/:id` | handler | P |
| `PATCH /api/v1/jobs/:id/status` | `UpdateJobStatusInputSchema` | P |
| `POST /api/v1/job-templates` | `CreateJobTemplateInputSchema` | E |
| `GET /api/v1/job-templates` | handler | E |
| `GET /api/v1/job-templates/:id` | handler | E |
| `PATCH /api/v1/job-templates/:id` | `UpdateJobTemplateInputSchema` | E |
| `DELETE /api/v1/job-templates/:id` | handler | E |
| `POST /api/v1/job-templates/:id/instantiate` | `InstantiateJobFromTemplateInputSchema` | E |
| `POST /api/v1/jobs/:id/save-as-template` | `SaveJobAsTemplateInputSchema` | E |
| `POST /api/v1/salaries/reports` | `SubmitSalaryReportInputSchema` | E |
| `GET /api/v1/salaries/reports/my` | handler | E |
| `DELETE /api/v1/salaries/reports/:id` | handler | E |
| `GET /api/v1/salaries/benchmarks` | `SalaryBenchmarkQuerySchema` | E |
| `GET /api/v1/salaries/company/:companyName` | handler | E |
| `POST /api/v1/jobs/:id/apply` | `SubmitApplicationInputSchema` | P |
| `GET /api/v1/applications/my` | handler | P |
| `GET /api/v1/applications/:id` | handler | P |
| `GET /api/v1/jobs/:id/applications` | handler | P |
| `POST /api/v1/applications/:id/transition` | `TransitionApplicationInputSchema` | P |
| `POST /api/v1/applications/:id/feedback` | `CreateApplicationFeedbackInputSchema` | E |
| `GET /api/v1/applications/:id/feedback` | handler | E |
| `POST /api/v1/applications/:id/feedback/request` | handler | E |
| `POST /api/v1/organizations/:orgId/feedback-templates` | `CreateFeedbackTemplateInputSchema` | E |
| `GET /api/v1/organizations/:orgId/feedback-templates` | handler | E |
| `GET /api/v1/feedback/aggregate-insights` | handler | E |
| `POST /api/v1/skills/freshness` | `RegisterSkillFreshnessInputSchema` | E |
| `GET /api/v1/skills/freshness/my` | handler | E |
| `GET /api/v1/candidates/:candidateProfileId/skills/freshness` | handler | E |
| `POST /api/v1/skills/:skillId/reverify` | `ReverifySkillInputSchema` | E |
| `POST /api/v1/skills/freshness/refresh-all` | handler | E |
| `POST /api/v1/interviews/questions` | `CreateInterviewQuestionInputSchema` | E |
| `GET /api/v1/interviews/questions` | handler | E |
| `POST /api/v1/interviews/assessments` | `ScheduleInterviewAssessmentInputSchema` | E |
| `GET /api/v1/interviews/assessments/:id` | handler | E |
| `POST /api/v1/interviews/assessments/:id/join` | handler | E |
| `POST /api/v1/interviews/assessments/:id/consent` | `SetRecordingConsentInputSchema` | E |
| `POST /api/v1/interviews/assessments/:id/end` | handler | E |
| `POST /api/v1/interviews/assessments/:id/code` | `ExecuteInterviewCodeInputSchema` | E |
| `POST /api/v1/interviews/assessments/:id/scorecard` | `SubmitInterviewScorecardInputSchema` | E |
| `POST /api/v1/interviews/assessments/:id/scorecard/compensate` | `CompensateInterviewScorecardInputSchema` | E |
| `GET /api/v1/interviews/assessments/:id/scorecards` | handler | E |
| `POST /api/v1/interviews/assessments/:id/ai-feedback` | handler | E |
| `POST /api/v1/interviews/assessments/:id/review` | handler | E |
| `POST /api/v1/reputation/signals` | `AddReputationSignalInputSchema` | E |
| `GET /api/v1/reputation/users/:userId` | handler | E |
| `GET /api/v1/reputation/my/signals` | handler | E |
| `POST /api/v1/reputation/recovery` | `StartRecoveryPlanInputSchema` | E |
| `POST /api/v1/reputation/recovery/:planId/tasks/:taskId/complete` | handler | E |
| `POST /api/v1/reputation/recalculate-all` | handler | E |
| `GET /api/v1/reputation/instructors/:instructorId` | handler | E |
| `POST /api/v1/reputation/instructors/:instructorId/metrics` | `SubmitInstructorMetricsInputSchema` | E |
| `POST /api/v1/reputation/instructors/:instructorId/endorse` | `CreateInstructorEndorsementInputSchema` | E |
| `POST /api/v1/reputation/instructors/:instructorId/reviews` | `SubmitInstructorReviewInputSchema` | E |
| `POST /api/v1/reputation/instructors/recompute` | handler | E |
| `GET /api/v1/reputation/organizations/:organizationId` | handler | E |
| `POST /api/v1/reputation/organizations/:organizationId/reviews` | `SubmitEmployerReviewInputSchema` | E |
| `POST /api/v1/reputation/organizations/:organizationId/metrics` | `SubmitEmployerMetricsInputSchema` | E |
| `GET /api/v1/reputation/organizations/:organizationId/reviews` | handler | E |
| `GET /api/v1/challenges` | handler | E |
| `GET /api/v1/challenges/:id` | handler | E |
| `POST /api/v1/challenges` | `CreateChallengeInputSchema` | E |
| `POST /api/v1/challenges/:id/start-session` | handler | E |
| `POST /api/v1/challenges/:id/submit` | `SubmitChallengeSolutionInputSchema` | E |
| `POST /api/v1/ai/assistant/query` | `AIAssistantQueryInputSchema` | E |
| `GET /api/v1/xp/ledger` | handler | E |
| `GET /api/v1/courses` | handler | E |
| `POST /api/v1/courses` | `CreateCourseInputSchema` | E |
| `GET /api/v1/courses/:id` | handler | E |
| `POST /api/v1/courses/:id/modules` | `CreateCourseModuleInputSchema` | E |
| `POST /api/v1/modules/:id/lessons` | `CreateLessonInputSchema` | E |
| `POST /api/v1/courses/:id/publish` | handler | E |
| `POST /api/v1/courses/:id/enroll` | handler | E |
| `GET /api/v1/courses/:id/progress` | `CourseProgressResponseSchema` | E |
| `POST /api/v1/lessons/:id/complete` | handler | E |
| `GET /api/v1/certificates/:certificateNumber` | handler | E |
| `GET /api/v1/verify/:hash` | handler | E |
| `GET /api/v1/certificates/verify/:hash` | handler | E |
| `GET /api/v1/certificates/my` | handler | E |
| `POST /api/v1/certificates/:certificateNumber/revoke` | `RevokeCertificateInputSchema` | E |
| `GET /api/v1/threads` | handler | P |
| `POST /api/v1/threads` | `CreateThreadInputSchema` | P |
| `GET /api/v1/threads/:id` | handler | P |
| `POST /api/v1/threads/:id/messages` | `SendMessageInputSchema` | P |
| `POST /api/v1/threads/:id/read` | handler | P |
| `GET /api/v1/notifications` | handler | P |
| `GET /api/v1/notifications/summary` | handler | P |
| `POST /api/v1/notifications/mark-read` | `MarkNotificationsReadInputSchema` | P |
| `GET /api/v1/notifications/preferences` | handler | P |
| `PATCH /api/v1/notifications/preferences` | `UpdateNotificationPreferencesInputSchema` | P |
| `POST /api/v1/ai/conversations` | `CreateAIConversationInputSchema` | E |
| `GET /api/v1/ai/conversations` | handler | E |
| `GET /api/v1/ai/conversations/:id` | handler | E |
| `POST /api/v1/ai/career-assistant/chat` | `AIChatInputSchema` | E |
| `GET /api/v1/ai/usage` | handler | E |
| `POST /api/v1/resumes` | `CreateResumeInputSchema` | E |
| `GET /api/v1/resumes` | handler | E |
| `GET /api/v1/resumes/:id` | handler | E |
| `PATCH /api/v1/resumes/:id` | `UpdateResumeInputSchema` | E |
| `POST /api/v1/resumes/:id/export` | `ExportResumeInputSchema` | E |
| `GET /api/v1/resumes/:id/exports` | handler | E |
| `DELETE /api/v1/resumes/exports/:exportId` | handler | E |
| `POST /api/v1/connections/request` | `RequestConnectionInputSchema` | P |
| `GET /api/v1/connections` | handler | P |
| `GET /api/v1/connections/status/:targetUserId` | handler | P |
| `POST /api/v1/connections/:id/respond` | `RespondConnectionInputSchema` | P |
| `POST /api/v1/connections/:id/withdraw` | handler | P |
| `DELETE /api/v1/connections/:id` | handler | P |
| `POST /api/v1/networking/warm-intros/preferences` | `UpdateWarmIntroPreferencesInputSchema` | E |
| `GET /api/v1/networking/warm-intros/preferences` | handler | E |
| `GET /api/v1/networking/warm-intros/paths` | handler | E |
| `POST /api/v1/networking/warm-intros/requests` | `CreateWarmIntroRequestInputSchema` | E |
| `GET /api/v1/networking/warm-intros/requests/incoming` | handler | E |
| `GET /api/v1/networking/warm-intros/requests/outgoing` | handler | E |
| `GET /api/v1/networking/warm-intros/requests/:id` | handler | E |
| `POST /api/v1/networking/warm-intros/requests/:id/respond` | `RespondWarmIntroRequestInputSchema` | E |
| `POST /api/v1/referrals/requests` | `CreateReferralRequestInputSchema` | E |
| `GET /api/v1/referrals/requests/incoming` | handler | E |
| `GET /api/v1/referrals/requests/outgoing` | handler | E |
| `GET /api/v1/referrals/requests/:id` | handler | E |
| `POST /api/v1/referrals/requests/:id/respond` | `RespondReferralRequestInputSchema` | E |
| `GET /api/v1/referrals/outcomes` | handler | E |
| `POST /api/v1/skills/endorsements` | `CreateSkillEndorsementInputSchema` | E |
| `GET /api/v1/skills/endorsements/recipients/:recipientId` | handler | E |
| `DELETE /api/v1/skills/endorsements/:id` | handler | E |
| `GET /api/v1/skills/endorsements/my/given` | handler | E |
| `GET /api/v1/skills/forecast/top-growth` | `TopEmergingSkillsQuerySchema` | E |
| `POST /api/v1/skills/:skillId/market-signals` | `RecordSkillMarketSignalInputSchema` | E |
| `GET /api/v1/skills/:skillId/forecast` | `QuerySkillForecastInputSchema` | E |
| `POST /api/v1/skills/:skillId/forecast/generate` | `GenerateSkillForecastInputSchema` | E |
| `POST /api/v1/career/transitions` | `RecordCareerTransitionInputSchema` | E |
| `GET /api/v1/career/transitions/my` | handler | E |
| `GET /api/v1/career/benchmarks` | `QueryCareerBenchmarksQuerySchema` | E |
| `POST /api/v1/career/transition-probability` | `CalculateTransitionProbabilityInputSchema` | E |
| `GET /api/v1/career/pathways` | `CareerProgressionPathwaysQuerySchema` | E |
| `POST /api/v1/career/milestones/readiness` | `EvaluateMilestoneReadinessInputSchema` | E |
| `POST /api/v1/learning/impact/outcomes` | `RecordLearningOutcomeInputSchema` | E |
| `GET /api/v1/learning/impact/courses/:courseId` | `QueryLearningImpactInputSchema` | E |
| `POST /api/v1/learning/impact/courses/:courseId/compute` | `ComputeLearningImpactInputSchema` | E |
| `GET /api/v1/learning/impact/dashboard` | `LearningImpactDashboardQuerySchema` | E |
| `POST /api/v1/recruiter/talent-pools` | `CreateTalentPoolInputSchema` | E |
| `GET /api/v1/recruiter/talent-pools` | handler | E |
| `GET /api/v1/recruiter/talent-pools/:poolId` | handler | E |
| `POST /api/v1/recruiter/talent-pools/:poolId/members` | `AddPoolMemberInputSchema` | E |
| `PATCH /api/v1/recruiter/talent-pools/:poolId/members/:memberId` | `UpdatePoolMemberStatusInputSchema` | E |
| `GET /api/v1/recruiter/talent-pools/:poolId/intelligence` | `QueryPoolIntelligenceInputSchema` | E |
| `POST /api/v1/recruiter/discovery/behavioral/compute` | `ComputeBehavioralProfileInputSchema` | E |
| `GET /api/v1/recruiter/discovery/behavioral` | `DiscoverBehavioralTalentQuerySchema` | E |
| `GET /api/v1/recruiter/discovery/behavioral/:candidateId` | handler | E |
| `POST /api/v1/recruiter/talent-segmentation/classify` | `ClassifyCandidateInputSchema` | E |
| `GET /api/v1/recruiter/talent-segmentation/segments` | `QuerySegmentDistributionInputSchema` | E |
| `GET /api/v1/recruiter/talent-segmentation/candidates` | `FilterSegmentedTalentQuerySchema` | E |
| `GET /api/v1/recruiter/talent-segmentation/candidates/:candidateId` | handler | E |
| `POST /api/v1/alumni/affiliations` | `CreateAlumniAffiliationInputSchema` | E |
| `POST /api/v1/alumni/affiliations/:id/verify` | `VerifyAlumniAffiliationInputSchema` | E |
| `GET /api/v1/alumni/affiliations/my` | handler | E |
| `GET /api/v1/alumni/institutions/:institutionId/directory` | `QueryAlumniDirectoryInputSchema` | E |
| `POST /api/v1/alumni/institutions/:institutionId/groups` | `CreateAlumniGroupInputSchema` | E |
| `GET /api/v1/alumni/institutions/:institutionId/groups` | handler | E |
| `POST /api/v1/alumni/groups/:id/join` | `JoinAlumniGroupInputSchema` | E |
| `GET /api/v1/alumni/groups/:id/members` | handler | E |
| `POST /api/v1/alumni/mentorship/request` | `RequestAlumniMentorshipInputSchema` | E |
| `POST /api/v1/alumni/mentorship/:id/respond` | `RespondAlumniMentorshipInputSchema` | E |
| `GET /api/v1/alumni/mentorship/my` | handler | E |
| `POST /api/v1/activity/events` | `RecordActivityEventInputSchema` | E |
| `GET /api/v1/activity/events` | handler | E |
| `GET /api/v1/activity/scores/me` | handler | E |
| `GET /api/v1/activity/users/:userId/score` | handler | E |
| `POST /api/v1/activity/recalculate` | handler | E |
| `POST /api/v1/portfolio/projects` | `CreatePortfolioProjectInputSchema` | E |
| `GET /api/v1/portfolio/projects` | handler | E |
| `GET /api/v1/portfolio/projects/:id` | handler | E |
| `PATCH /api/v1/portfolio/projects/:id` | `UpdatePortfolioProjectInputSchema` | E |
| `DELETE /api/v1/portfolio/projects/:id` | handler | E |
| `GET /api/v1/portfolio/showcase/:targetUserId` | handler | E |
| `GET /api/v1/gamification/summary` | handler | E |
| `GET /api/v1/gamification/transactions` | handler | E |
| `GET /api/v1/gamification/badges` | handler | E |
| `GET /api/v1/gamification/leaderboard` | `GetLeaderboardQuerySchema` | E |
| `POST /api/v1/gamification/claim-activity` | `ClaimGamificationActivityInputSchema` | E |
| `GET /api/v1/settings` | handler | P |
| `PATCH /api/v1/settings` | `UpdateUserSettingsInputSchema` | P |
| `POST /api/v1/settings/export` | `RequestDataExportInputSchema` | E |
| `GET /api/v1/settings/export/latest` | handler | P |
| `POST /api/v1/settings/erasure/request` | `RequestErasureInputSchema` | P |
| `GET /api/v1/settings/erasure/status` | handler | P |
| `POST /api/v1/settings/erasure/cancel` | `CancelErasureInputSchema` | P |
| `POST /api/v1/settings/erasure/execute` | `ExecuteErasureInputSchema` | E |
| `POST /api/v1/billing/checkout` | `CreateCheckoutSessionInputSchema` | P |
| `POST /api/v1/billing/portal` | handler | P |
| `POST /api/v1/billing/stripe-webhook` | handler | P |
| `GET /api/v1/billing/plans` | handler | S |
| `GET /api/v1/billing/subscription` | handler | P |
| `POST /api/v1/billing/subscribe` | `SubscribePlanInputSchema` | P |
| `POST /api/v1/billing/cancel` | `CancelSubscriptionInputSchema` | P |
| `GET /api/v1/billing/invoices` | handler | P |
| `POST /api/v1/billing/webhook` | `ProcessPaymentWebhookInputSchema` | P |
| `GET /api/v1/admin/users` | handler | E |
| `PATCH /api/v1/admin/users/:id/status` | `AdminUpdateUserStatusInputSchema` | E |
| `PATCH /api/v1/admin/users/:id/roles` | `AdminUpdateUserRolesInputSchema` | E |
| `GET /api/v1/admin/feature-flags` | handler | P |
| `PUT /api/v1/admin/feature-flags/:key` | `AdminToggleFeatureFlagInputSchema` | P |
| `GET /api/v1/admin/audit-logs` | `AdminQueryAuditLogsSchema` | P |
| `GET /api/v1/admin/health-diagnostics` | handler | E |
| `POST /api/v1/admin/maintenance` | `AdminSetMaintenanceModeInputSchema` | E |
| `GET /api/v1/search` | `SearchQueryInputSchema` | E |
| `GET /api/v1/search/autocomplete` | `AutocompleteQueryInputSchema` | E |
| `GET /api/v1/search/commands` | handler | E |
| `GET /api/v1/search/history` | handler | E |
| `DELETE /api/v1/search/history` | `ClearSearchHistoryInputSchema` | E |
| `POST /api/v1/moderation/scan` | `ScanContentInputSchema` | E |
| `POST /api/v1/moderation/reports` | `CreateModerationReportInputSchema` | E |
| `GET /api/v1/moderation/reports/my` | handler | E |
| `GET /api/v1/moderation/reports` | handler | E |
| `GET /api/v1/moderation/reports/:id` | handler | E |
| `PATCH /api/v1/moderation/reports/:id/status` | `UpdateModerationReportStatusInputSchema` | E |
| `POST /api/v1/moderation/reports/:id/resolve` | `ResolveModerationReportInputSchema` | E |
| `POST /api/v1/moderation/reports/:id/appeal` | `CreateModerationAppealInputSchema` | E |
| `GET /api/v1/moderation/appeals` | handler | E |
| `POST /api/v1/moderation/appeals/:id/review` | `ReviewModerationAppealInputSchema` | E |
| `POST /api/v1/jobs/saved-searches` | `CreateSavedSearchInputSchema` | P |
| `GET /api/v1/jobs/saved-searches` | handler | P |
| `GET /api/v1/jobs/saved-searches/:id` | handler | P |
| `PATCH /api/v1/jobs/saved-searches/:id` | `UpdateSavedSearchInputSchema` | P |
| `DELETE /api/v1/jobs/saved-searches/:id` | handler | P |
| `POST /api/v1/jobs/saved-searches/:id/run` | handler | P |
| `GET /api/v1/jobs/alerts` | handler | P |
| `PATCH /api/v1/jobs/alerts/:id/read` | handler | P |
| `POST /api/v1/jobs/:id/save` | handler | P |
| `DELETE /api/v1/jobs/:id/save` | handler | P |
| `GET /api/v1/jobs/saved` | handler | P |
| `PUT /api/v1/jobs/:jobId/draft` | `SaveApplicationDraftInputSchema` | P |
| `GET /api/v1/jobs/:jobId/draft` | handler | P |
| `DELETE /api/v1/jobs/:jobId/draft` | handler | P |
| `POST /api/v1/jobs/:jobId/draft/restore` | `RestoreApplicationDraftVersionInputSchema` | P |
| `GET /api/v1/applications/drafts` | handler | P |
| `POST /api/v1/analytics/events` | `RecordAnalyticsEventBatchInputSchema`, `RecordAnalyticsEventInputSchema` | E |
| `GET /api/v1/analytics/events` | handler | E |
| `GET /api/v1/analytics/kpis` | handler | E |
| `POST /api/v1/candidates/work-history` | `CreateWorkHistoryInputSchema` | P |
| `POST /api/v1/candidates/work-history/:id/verify-email` | `VerifyWorkHistoryEmailInputSchema` | P |
| `POST /api/v1/candidates/work-history/:id/references/request` | `RequestEmploymentReferenceInputSchema` | P |
| `GET /api/v1/references/:refId` | handler | P |
| `POST /api/v1/candidates/work-history/references/:refId/submit` | `SubmitEmploymentReferenceInputSchema` | P |
| `GET /api/v1/candidates/:candidateId/work-history` | handler | P |
| `GET /api/v1/candidates/:candidateId/work-history-graph` | `QueryWorkHistoryGraphSchema` | P |
| `DELETE /api/v1/candidates/work-history/:id` | handler | P |
| `GET /api/v1/internal/worker-jobs` | handler | E |

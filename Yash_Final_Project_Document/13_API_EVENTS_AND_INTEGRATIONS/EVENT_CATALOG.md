# Event Catalog

Doc ID: EVC-01 · Owner: Backend Architecture Team · Version 1.0 · Status: Under Review · Relates: ADR-T05, ADR-T09, INV-T10, INV-T12, FF-06, DOM-00 §3 · Machine-readable: `contracts/asyncapi.yaml`, `contracts/schemas/EventEnvelope.schema.json` · Companions: BE-01 §6, API-CAT, INT-01

Tags: **[TARGET]** design. Nothing here is implemented. 74 events; 15 flagged **core** (full operation pairs in AsyncAPI). Event names extend the examples in DOMAIN_ARCHITECTURE §3 (`account.registered`, `evidence.created/verified/revoked`, `application.submitted`, `application.stage.changed`, `job.published/closed`, `consent.changed`, `erasure.completed`, `entitlement.changed`, ...); additions are marked in the notes column of §5.

## 1. Envelope (all events)
| Field | Type | Meaning |
|---|---|---|
| `event_id` | UUIDv7 | Unique id = dedupe key |
| `type` | string | Dotted lowercase name; unit of subscription |
| `version` | int | Payload schema version for this type |
| `occurred_at` | RFC 3339 | Business time (transaction time) |
| `trace_id` | 32 hex | W3C trace id, restored by worker (ADR-T16) |
| `tenant` | `{org_id?, institution_id?}` | Tenancy scope; consumers must not widen it (INV-T03) |
| `aggregate` | `{type, id, seq}` | Ordering key and per-aggregate sequence |
| `actor` | `{kind, human, account_id?}` | Who caused it. `kind` ∈ user/service/system/support/referee; `human` is derived by the producer (true for user, support, referee; false for service, system). "Human actor" in SM-00 U6 and INV-T09 means `human = true` and `kind ∈ {user, support}`; a referee is human but never an authorised decider (REVW-44) |
| `correlation_id`, `causation_id` | string / uuid | Causal chain |
| `data` | object | Type-specific payload (ids and facts; no free-text personal data; consumers fetch details through owner interfaces under `policy.can`) |

## 2. Delivery classes (apply to all events unless the row says otherwise)
| Class | Semantics |
|---|---|
| EC-STD | At-least-once. Dedupe: `consumer_inbox(consumer, event_id)`. Retry: exponential backoff with full jitter, base 5 s, cap 15 min, 8 attempts, then `dead` (BE-01 §7.3) and alert. Consumers must be idempotent and must tolerate replay of any event within the 14-day outbox retention |
| EC-ORD | EC-STD plus per-aggregate order handling: consumer tracks `last_seq(aggregate)`; stale (`seq <= last`) skipped; gap (`seq > last+1`) deferred with bounded retries then rebuilt from the owner's interface. Projection tables are rebuildable |
| EC-CRIT | EC-STD with 12 attempts and a page (not just a ticket) on dead-letter, because failure leaves a user-visible or legal obligation unmet (erasure, evidence revocation, verification outcome, billing/entitlement, passed assessment) |

Failure semantics common to all: a producer never waits for consumers; consumer failure never rolls back the producer; no consumer may be the *only* enforcement point of a security rule (enforcement is at the source at use time; events drive projections and notifications). Replay/backfill: `POST /admin/jobs/{id}/retry` re-runs a dead consumer job; full projection rebuilds are job kinds owned by each consumer module.

Versioning: additive field = same version; removed/retyped/renamed field = new `version`, producer emits both versions for one deprecation window; consumers declare accepted versions; changes are checked in CI with the AsyncAPI diff (FF-06 extended to events).

## 3. Ordering and dedupe summary
Ordering key = `aggregate.id` of the producer's aggregate (see column). Cross-aggregate order is never assumed; consumers needing a relation (e.g. `evidence.verified` before `application.submitted` references it) re-read state rather than infer from event order. Dedupe is by `event_id` in the consumer's own inbox, in the same transaction as its state change.

## 4. Catalog
| Event ID | Type | v | Producer | Consumers | Payload (`?` optional) | Ordering key | Class | Core | On consumer failure |
|---|---|---|---|---|---|---|---|---|---|
| EVT-01-01 | `account.registered` | 1 | `identity` | notify, privacy, analytics | `accountId`:uuid, `intendedUse`:enum, `termsVersion`:string, `locale`?:string | account id | EC-STD | Y | Verification email delayed; user can request resend |
| EVT-01-02 | `account.email_verified` | 1 | `identity` | profile, notify | `accountId`:uuid, `verifiedAt`:date-time | account id | EC-STD |  | Profile "verified email" badge lags; harmless |
| EVT-01-03 | `session.revoked` | 1 | `identity` | notify, safety | `accountId`:uuid, `sessionId`:uuid, `reason`:enum, `familyRevoked`:boolean | account id | EC-STD |  | Security alert email delayed; session already revoked at source |
| EVT-01-04 | `password.changed` | 1 | `identity` | notify | `accountId`:uuid, `method`:enum, `changedAt`:date-time | account id | EC-STD |  | Alert email delayed |
| EVT-01-05 | `passkey.registered` | 1 | `identity` | notify | `accountId`:uuid, `passkeyId`:uuid | account id | EC-STD |  | Alert email delayed |
| EVT-01-06 | `account.locked` | 1 | `identity` | notify, safety | `accountId`:uuid, `reason`:enum, `until`?:date-time | account id | EC-STD |  | Lock already enforced at source |
| EVT-01-07 | `account.deactivated` | 1 | `identity` | profile, search, matching, messaging | `accountId`:uuid, `deactivatedAt`:date-time | account id | EC-STD |  | Search/match docs removed late; reads still policy-checked |
| EVT-02-01 | `org.created` | 1 | `orgs` | billing, analytics | `orgId`:uuid, `kind`:enum, `createdBy`:uuid | organization id | EC-ORD |  | Billing customer created lazily on first checkout |
| EVT-02-02 | `org.member.added` | 1 | `orgs` | notify, billing, policy-cache | `orgId`:uuid, `memberId`:uuid, `accountId`:uuid, `role`:string | organization id | EC-ORD |  | Seat sync retried; grants_version bumped at source |
| EVT-02-03 | `org.member.role_changed` | 1 | `orgs` | notify, applications | `orgId`:uuid, `memberId`:uuid, `accountId`:uuid, `fromRole`:string, `toRole`:string | organization id | EC-ORD |  | Policy freshness from grants_version, not from this event |
| EVT-02-04 | `org.member.removed` | 1 | `orgs` | applications, billing, messaging | `orgId`:uuid, `memberId`:uuid, `accountId`:uuid | organization id | EC-ORD |  | Assignment reassignment prompt delayed; access already removed at source |
| EVT-02-05 | `org.sso.configured` | 1 | `orgs` | identity, audit | `orgId`:uuid, `protocol`:enum, `enforced`:boolean | organization id | EC-ORD |  | None; configuration already effective |
| EVT-03-01 | `profile.updated` | 1 | `profile` | search, matching, careerintel | `accountId`:uuid, `changedFields`:string[], `version`:integer | account id | EC-ORD |  | Index stale until retry; reads authorised against source |
| EVT-03-02 | `profile.visibility_changed` | 1 | `profile` | search, matching | `accountId`:uuid, `visibility`:enum | account id | EC-ORD |  | Deindex delayed; query-time filter on visibility prevents exposure |
| EVT-04-01 | `skill.created` | 1 | `skills` | search, matching | `skillId`:uuid, `slug`:string | skill id | EC-ORD |  | Autocomplete lags |
| EVT-04-02 | `skill.merged` | 1 | `skills` | evidence, jobs, search, matching, careerintel | `fromSkillId`:uuid, `intoSkillId`:uuid | skill id | EC-ORD |  | Dual-read via merged_into until consumers finish |
| EVT-05-01 | `evidence.created` | 1 | `evidence` | verification, search, careerintel | `evidenceId`:uuid, `ownerAccountId`:uuid, `kind`:string, `source`:enum, `rung`:enum | evidence id | EC-ORD | Y | Auto-verification kick-off delayed; item stays claimed |
| EVT-05-02 | `evidence.updated` | 1 | `evidence` | verification, search | `evidenceId`:uuid, `ownerAccountId`:uuid, `changedFields`:string[], `rungBefore`:string, `rungAfter`:string | evidence id | EC-ORD |  | Reindex delayed |
| EVT-05-03 | `evidence.artifact.scanned` | 1 | `evidence` | notify, search | `evidenceId`:uuid, `fileId`:uuid, `result`:enum | evidence id | EC-ORD |  | Artifact stays pending/invisible (fail-closed) |
| EVT-05-04 | `evidence.verification_requested` | 1 | `evidence` | verification | `evidenceId`:uuid, `verificationRequestId`:uuid, `method`:string | evidence id | EC-ORD |  | Request stays `created`; sweep job re-publishes |
| EVT-05-05 | `evidence.verified` | 1 | `evidence` | matching, search, careerintel, notify, applications, skills | `evidenceId`:uuid, `ownerAccountId`:uuid, `rung`:enum, `attestationId`:uuid, `method`:string | evidence id | EC-ORD | Y | Derived scores stale; stale flag set; recomputed on retry |
| EVT-05-06 | `evidence.revoked` | 1 | `evidence` | skills, matching, applications, notify, search | `evidenceId`:uuid, `ownerAccountId`:uuid, `reason`:string, `revokedByKind`:enum | evidence id | EC-ORD+EC-CRIT | Y | Dependent confidence/match shown with stale marker until recomputed (BR-T005); alert if dead |
| EVT-05-07 | `credential.issued` | 1 | `evidence` | notify | `credentialId`:uuid, `evidenceId`:uuid, `issuerKind`:enum | evidence id | EC-STD |  | Notification delayed |
| EVT-05-08 | `credential.revoked` | 1 | `evidence` | notify, search | `credentialId`:uuid, `evidenceId`:uuid, `reason`:string | evidence id | EC-STD |  | Public verify page already reflects revocation at source |
| EVT-06-01 | `verification.requested` | 1 | `verification` | notify, admin | `verificationRequestId`:uuid, `evidenceId`:uuid, `method`:string, `expiresAt`?:date-time | verification id | EC-STD |  | Authority queue notification delayed; queue itself is a DB read |
| EVT-06-02 | `verification.completed` | 1 | `verification` | evidence, notify | `verificationRequestId`:uuid, `evidenceId`:uuid, `decision`:enum, `method`:string, `decidedByKind`:enum | verification id | EC-CRIT | Y | Evidence rung not updated until applied; request shows completed-pending-apply; retried then paged |
| EVT-06-03 | `reference.requested` | 1 | `verification` | notify | `referenceRequestId`:uuid, `verificationRequestId`:uuid, `expiresAt`:date-time | verification id | EC-STD |  | Referee email delayed; expiry clock already running (14 d) |
| EVT-06-04 | `reference.responded` | 1 | `verification` | verification, notify | `referenceRequestId`:uuid, `verificationRequestId`:uuid, `outcome`:enum | verification id | EC-STD | Y | Response stored at source; completion retried |
| EVT-06-05 | `reference.expired` | 1 | `verification` | evidence, notify | `referenceRequestId`:uuid, `verificationRequestId`:uuid | verification id | EC-STD |  | Candidate notice delayed |
| EVT-06-06 | `workclaim.employer_email_confirmed` | 1 | `verification` | evidence | `workClaimId`:uuid, `evidenceId`:uuid, `employerDomain`:string | verification id | EC-STD |  | Rung unchanged until applied |
| EVT-06-07 | `verification.disputed` | 1 | `verification` | safety, evidence | `disputeId`:uuid, `evidenceId`:uuid | verification id | EC-STD |  | Dispute queue is a DB read; notification delayed |
| EVT-07-01 | `attempt.started` | 1 | `assessment` | analytics, ai | `attemptId`:uuid, `assessmentId`:uuid, `accountId`:uuid, `aiMode`:enum | attempt id | EC-STD |  | Gateway reads the attempt directly (INV-T06); event is informational |
| EVT-07-02 | `attempt.submitted` | 1 | `assessment` | notify | `attemptId`:uuid, `assessmentId`:uuid, `accountId`:uuid, `requiresRunner`:boolean | attempt id | EC-STD |  | Runner job enqueued by the assessment module itself, not by this event |
| EVT-07-03 | `assessment.passed` | 1 | `assessment` | evidence, learning, notify | `attemptId`:uuid, `assessmentId`:uuid, `accountId`:uuid, `score`:number, `verificationBasis`:enum | attempt id | EC-CRIT | Y | Evidence creation retried; never emitted for unverified attempts (ADR-T13) |
| EVT-07-04 | `assessment.failed` | 1 | `assessment` | notify | `attemptId`:uuid, `assessmentId`:uuid, `accountId`:uuid, `score`?:number | attempt id | EC-STD |  | Notification delayed |
| EVT-07-05 | `integrity.flag.raised` | 1 | `assessment` | safety | `flagId`:uuid, `attemptId`:uuid, `severity`:enum, `signalKinds`:string[] | attempt id | EC-STD |  | Human review queue is a DB read; no automatic consequence (INV-T20) |
| EVT-07-06 | `integrity.flag.reviewed` | 1 | `assessment` | notify | `flagId`:uuid, `attemptId`:uuid, `outcome`:enum, `reviewedBy`:uuid | attempt id | EC-STD |  | Notification delayed |
| EVT-07-07 | `attempt.appealed` | 1 | `assessment` | safety, notify | `attemptId`:uuid, `appealId`:uuid | attempt id | EC-STD |  | Appeal queue is a DB read |
| EVT-08-01 | `enrollment.created` | 1 | `learning` | analytics, notify | `enrollmentId`:uuid, `courseId`:uuid, `accountId`:uuid | enrollment id | EC-STD |  | Welcome notice delayed |
| EVT-08-02 | `course.completed` | 1 | `learning` | evidence, notify, careerintel | `enrollmentId`:uuid, `courseId`:uuid, `accountId`:uuid, `completedAt`:date-time | enrollment id | EC-STD | Y | Evidence item creation retried; completion state already durable |
| EVT-08-03 | `course.published` | 1 | `learning` | search | `courseId`:uuid, `instructorAccountId`:uuid | enrollment id | EC-STD |  | Catalogue search lags |
| EVT-09-01 | `job.published` | 1 | `jobs` | search, matching, notify, applications | `jobId`:uuid, `orgId`:uuid, `publishedAt`:date-time, `skillIds`:uuid[] | job id | EC-ORD | Y | Job browsable via DB listing; search/alerts lag |
| EVT-09-02 | `job.updated` | 1 | `jobs` | search, matching | `jobId`:uuid, `orgId`:uuid, `version`:integer, `changedFields`:string[] | job id | EC-ORD |  | Index stale until retry |
| EVT-09-03 | `job.closed` | 1 | `jobs` | applications, search, matching, notify | `jobId`:uuid, `orgId`:uuid, `reason`:enum | job id | EC-ORD | Y | Applicants informed late; no automatic rejection (INV-T09) |
| EVT-09-04 | `job.expired` | 1 | `jobs` | search, notify | `jobId`:uuid, `orgId`:uuid | job id | EC-ORD |  | Scheduled job re-publishes on retry |
| EVT-10-01 | `application.submitted` | 1 | `applications` | notify, matching, analytics, messaging | `applicationId`:uuid, `jobId`:uuid, `orgId`:uuid, `candidateAccountId`:uuid, `evidenceIds`:uuid[], `consentSnapshotId`:uuid | application id | EC-ORD | Y | Recruiter notification delayed; application visible in pipeline immediately |
| EVT-10-02 | `application.withdrawn` | 1 | `applications` | notify, analytics, messaging | `applicationId`:uuid, `jobId`:uuid, `orgId`:uuid, `candidateAccountId`:uuid | application id | EC-ORD |  | Notification delayed |
| EVT-10-03 | `application.stage.changed` | 1 | `applications` | notify, analytics, messaging | `applicationId`:uuid, `jobId`:uuid, `orgId`:uuid, `fromStage`:string, `toStage`:string, `fromState`:string, `toState`:string, `actorAccountId`:uuid | application id | EC-ORD | Y | Candidate notification delayed; transition durable |
| EVT-10-04 | `interview.scheduled` | 1 | `applications` | notify, messaging | `interviewId`:uuid, `applicationId`:uuid, `scheduledAt`:date-time | application id | EC-STD |  | Invitation delayed |
| EVT-10-05 | `interview.completed` | 1 | `applications` | notify | `interviewId`:uuid, `applicationId`:uuid | application id | EC-STD |  | Scorecard prompt delayed |
| EVT-13-01 | `conversation.created` | 1 | `messaging` | notify | `conversationId`:uuid, `kind`:enum, `participantIds`:uuid[] | conversation id | EC-STD |  | Notice delayed |
| EVT-13-02 | `message.sent` | 1 | `messaging` | notify, safety, analytics | `messageId`:uuid, `conversationId`:uuid, `senderAccountId`:uuid | conversation id | EC-STD |  | Notification delayed; safety scan async and non-blocking |
| EVT-15-01 | `notification.email.bounced` | 1 | `notify` | identity, notify | `emailHash`:string, `reason`:enum, `providerEventId`:string | notification id | EC-STD |  | Suppression applied on retry; further sends blocked at send time |
| EVT-15-02 | `notification.delivered` | 1 | `notify` | analytics | `notificationId`:uuid, `channel`:enum | notification id | EC-STD |  | Metrics lag |
| EVT-16-01 | `subscription.changed` | 1 | `billing` | notify, orgs | `subscriptionId`:uuid, `subjectKind`:enum, `subjectId`:uuid, `state`:string, `planKey`:string, `stripeEventId`:string | subscription id | EC-ORD+EC-CRIT |  | Entitlements recomputed in the same transaction at source; event informational |
| EVT-16-02 | `entitlement.changed` | 1 | `billing` | jobs, search, ai, notify | `subjectKind`:enum, `subjectId`:uuid, `changedKeys`:string[], `computedAt`:date-time | subscription id | EC-ORD+EC-CRIT | Y | Consumers also read entitlements at use time (authoritative); event only warms caches |
| EVT-16-03 | `payment.failed` | 1 | `billing` | notify | `subscriptionId`:uuid, `subjectKind`:string, `subjectId`:uuid, `attempt`?:integer | subscription id | EC-STD |  | Dunning notice delayed |
| EVT-16-04 | `invoice.paid` | 1 | `billing` | notify | `invoiceId`:uuid, `subjectKind`:string, `subjectId`:uuid, `amountPaidMinor`:integer, `currency`:string | subscription id | EC-STD |  | Receipt delayed |
| EVT-17-01 | `ai.request.completed` | 1 | `ai` | billing, analytics | `requestId`:uuid, `accountId`:uuid, `purpose`:string, `model`:string, `costMicros`:integer | ai_request id | EC-STD |  | Metering reconciled by ai_spend ledger at source |
| EVT-17-02 | `ai.budget.exceeded` | 1 | `ai` | notify | `scope`:enum, `scopeKey`:string, `period`:enum | ai_request id | EC-STD |  | Alert delayed; hard stop enforced at source |
| EVT-18-01 | `credential.issued_by_institution` | 1 | `institutions` | evidence, notify | `institutionId`:uuid, `cohortId`?:uuid, `subjectAccountId`:uuid, `evidenceId`:uuid | institution id | EC-STD |  | Issuance retried; authority attestation applied by evidence module |
| EVT-19-01 | `report.filed` | 1 | `safety` | safety | `reportId`:uuid, `subjectType`:string, `subjectId`:uuid, `reasonCode`:string | case id | EC-STD |  | Queue is a DB read |
| EVT-19-02 | `case.resolved` | 1 | `safety` | notify, profile, jobs, messaging | `caseId`:uuid, `subjectType`:string, `subjectId`:uuid, `action`:string, `appealable`:boolean | case id | EC-STD |  | Content stays hidden/visible per source state; downstream views lag |
| EVT-20-01 | `support_access.granted` | 1 | `admin` | audit, notify | `grantId`:uuid, `granteeAccountId`:uuid, `subjectAccountId`:uuid, `scope`:string, `expiresAt`:date-time | audit id | EC-STD |  | Subject notification delayed; grant enforced at source |
| EVT-20-02 | `support_access.expired` | 1 | `admin` | audit | `grantId`:uuid | audit id | EC-STD |  | Grant already inert at expiry time (time-checked at use) |
| EVT-20-03 | `feature_flag.changed` | 1 | `admin` | audit | `flagKey`:string, `enabled`:boolean, `changedBy`:uuid | audit id | EC-STD |  | Replica caches converge within TTL |
| EVT-22-01 | `consent.changed` | 1 | `privacy` | search, matching, applications, ai, analytics, notify | `accountId`:uuid, `scope`:string, `granted`:boolean, `targetType`?:string, `targetId`?:uuid, `granteeType`?:string, `granteeId`?:uuid, `expiresAt`?:date-time, `policyVersion`:string, `consentEpoch`:integer | consent id | EC-ORD | Y | `scope` is a canonical id from the Consent Scope Catalogue. Consumers also check live consent at use time (no consent cache, CSC section 6); event drives deindexing and derived-data deletion |
| EVT-22-02 | `dataexport.ready` | 1 | `privacy` | notify | `requestId`:uuid, `accountId`:uuid, `expiresAt`:date-time | consent id | EC-STD |  | Notification delayed; export downloadable |
| EVT-22-03 | `erasure.requested` | 1 | `privacy` | identity, profile, evidence, verification, assessment, learning, applications, messaging, notify, billing, ai, analytics, search, matching, platform | `requestId`:uuid, `accountId`:uuid, `scheduledFor`:date-time | consent id | EC-CRIT |  | Each module step tracked in erasure_step; failure keeps request in_progress and alerts (BR-T060) |
| EVT-22-04 | `erasure.module_completed` | 1 | `each-module` | privacy | `requestId`:uuid, `module`:string, `outcome`:enum, `retainedReason`?:string | consent id | EC-CRIT |  | Request cannot complete until all steps done or retained |
| EVT-22-05 | `erasure.completed` | 1 | `privacy` | notify, audit | `requestId`:uuid, `erasedAccountId`:uuid, `completedAt`:date-time, `retainedCategories`:string[] | consent id | EC-CRIT | Y | Final confirmation email delayed |
| EVT-23-01 | `import.completed` | 1 | `integrations` | notify | `importJobId`:uuid, `adapterKey`:string, `created`:integer, `failed`:integer | webhook id | EC-STD |  | Report available in app |
| EVT-24-01 | `file.scanned` | 1 | `platform` | evidence, profile, learning | `fileId`:uuid, `result`:enum, `purpose`:string | job id | EC-STD |  | File stays invisible (fail-closed) |
| EVT-24-02 | `job.dead_lettered` | 1 | `platform` | admin | `jobId`:uuid, `kind`:string, `attempts`:integer | job id | EC-ORD |  | Operator alert path must itself be independent of the job engine |

## 5. Notes and additions
- Events not named in DOMAIN_ARCHITECTURE §3 are additions needed for the flows in BE-01 (e.g. `evidence.artifact.scanned`, `file.scanned`, `erasure.module_completed`, `notification.email.bounced`, `credential.issued_by_institution`, `integrity.flag.*`). They are **[TARGET]** and must be registered in the central event register if one is created.
- `session.revoked`, `password.changed`, `passkey.registered`, `account.locked` carry no email or address; the notify consumer resolves contact details through `api/identity` at send time.
- `evidence.verified` is emitted for every rung increase (the `rung` field says which). A rung decrease caused by expiry/revocation of an attestation is emitted as `evidence.updated` (rungBefore/rungAfter); full revocation of an item is `evidence.revoked`.
- `assessment.passed` is never emitted for `unverified` attempts (ADR-T13); its `verificationBasis` excludes `unverified` by schema.
- `application.stage.changed.actorAccountId` is required: a transition without a human actor is not representable (INV-T09).
- Security-relevant events (`session.revoked`, `account.locked`, `support_access.*`) are additionally written to `audit_event`; the audit table, not the event stream, is the tamper-evident record.
- State vocabulary: event names are facts about a transition, not states. `account.locked` is a sign-in lockout (`locked_until`), not an SM-ACCOUNT state; `reference.responded` fires on SM-REFERENCE t3 (state `submitted`); `attempt.appealed` fires on SM-ATTEMPT t7 (state `under_review`); `job.expired` and `job.closed` with reason `expired` both mean SM-JOB t8 (state `closed`, `close_reason = expired`). Any enum in a payload that carries a state or decision (`VerificationCompleted.decision`, `ReferenceResponded.outcome`, `application.stage.changed.fromState/toState`, `subscription.changed.state`) is a value of the owning SM-00 machine (FF-11, enum-vs-SM lint).
- Events are internal contracts. External customers receive a curated subset through signed outbound webhooks (INT-01 §7) whose payloads are separate DTOs, not these internal events.

## 6. Open items
| ID | Item |
|---|---|
| OPEN-B14 | Whether `message.sent` payload may ever carry body text (currently: id only) |
| OPEN-B15 | Event retention beyond 14 days for analytics replay (currently none; analytics consumes live and keeps its own table) |

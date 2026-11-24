# 08 — Technical Specification Index

Status: **Proposed target**. This file maps each of the 30 modules to its aggregates, key APIs, events, jobs and non-functional hot spots, fixes the synchronous dependency baseline, and gives build-order constraints for a development team. Aggregate ids (`ENT-<MOD>-nn`) and event ids (`EVT-<MOD>-nnn`) come from the module specifications in [02_MODULES](../02_MODULES/); routes come from [03](03_API_DESIGN.md), jobs from [04 §7](04_EVENTS_AND_ASYNC.md). Nothing here is built.

**Inputs checked on 2026-11-24.** 28 of 30 module specifications exist. `ASM` (Assessments, Challenges & Integrity) and `REP` (Gamification, Reputation & Recognition) have no file in `02_MODULES/`; their rows below use this folder's table and event names and are marked "(planned)". `PLT` exists but ends inside section 4 (37 features, no entity or event tables yet); its row uses this folder's names.

## 1. How a team uses this index

1. Pick a module row in §2. Read the module spec for features, rules and state machines; read the listed architecture sections for cross-cutting contracts.
2. Check §3 for which modules it may call synchronously and which events it consumes.
3. Check §4 for what must exist before it can be built.
4. Apply the per-module definition of done in §5.
5. Where the module spec and this folder disagree, §6 records the conflict and the interim rule.

## 2. Module map

Columns: **Aggregates** are the main roots (ids from the module spec; total entity count in brackets). **Key APIs** are route stems from [03 §15](03_API_DESIGN.md). **Events** gives the name prefix the spec uses, the event count in the spec, and representative events. **Jobs** are kinds from [04 §7](04_EVENTS_AND_ASYNC.md). **Hot spots** are the non-functional concerns most likely to fail review.

### 2.1 Foundation

| Module | Aggregates | Key APIs | Events | Jobs | Hot spots |
|---|---|---|---|---|---|
| IDN | ENT-IDN-01 Account, ENT-IDN-08 SessionFamily, ENT-IDN-05 PasskeyCredential, ENT-IDN-12 SsoConnection, ENT-IDN-14 RoleGrant, ENT-IDN-15 Invitation [19] | `/auth/*`, `/me`, `/me/capabilities`, `/me/sessions`, `/orgs/{orgId}/members`, `/orgs/{orgId}/invitations`, `/scim/v2/*` | `idn.` [38]: `idn.account.registered`, `idn.account.verified`, `idn.account.purged` | No IDN job kinds; security mail through `ntf.email.send` via events; challenge and expired-session cleanup by `adm.retention.sweep` | Session lookup on every request (latency budget); RL-AUTH durable counters; credential stuffing; SAML parsing; uniform failure responses; step-up |
| SET | ENT-SET-02 ConsentLedgerEntry, ENT-SET-03 ConsentCurrent, ENT-SET-07 DataRequest and Checkpoint, ENT-SET-09 LegalHold, ENT-SET-18 ErasureTombstone [18] | `/me/privacy-settings`, `/me/consents/{scope}`, `/me/data-exports`, `/me/erasure-request`, `/me/support-access-grants` | `set.` [20]: `set.consent.changed`, `set.consent.expired`, `set.visibility.changed` | `set.export.build`, `set.erasure.step`, `set.erasure.verify` | Consent read on the primary with no cache; `pv_consent_current` query plan under search load; erasure deadline tracking; legal hold correctness |
| NTF | ENT-NTF-01 NotificationRequest, ENT-NTF-02 Notification, ENT-NTF-03 Delivery, ENT-NTF-05 NotificationPreference, ENT-NTF-07 Template and TemplateVersion [14] | `/me/notifications`, `/me/notification-preferences`, `/me/push-subscriptions`, `/unsubscriptions/{token}` | `ntf.` [18]: `ntf.notification.created`, `ntf.notification.read`, `ntf.delivery.sent` | `ntf.email.send`, `ntf.push.send`, `ntf.digest.compose`, `ntf.reminder.scan` | Fan-out volume; one retry layer (job retry is the delivery retry); suppression list; local-time digests; quiet hours |
| ADM | ENT-ADM-05 AuditEvent, ENT-ADM-06 FeatureFlag, ENT-ADM-07 KillSwitch, ENT-ADM-08 ConfigEntry, ENT-ADM-10 Ticket, ENT-ADM-14 ImpersonationSession (read-only view-as), ENT-ADM-17 Incident [25] | `/admin/*`, `/support-tickets`, `/orgs/{orgId}/audit-events` | `admin.` [50]: `admin.action.performed`, `admin.session.started`, `admin.staff.invited` | `adm.retention.sweep`, `adm.audit.archive`; `/admin/jobs` retry | Audit write on every sensitive action; hash chain; two-person approval paths; admin console isolation and step-up |
| PLT | `file_objects`, `webhook_endpoints`, `webhook_deliveries`, `api_clients`, `integration_connections`, `external_identity_refs` (from [02 §3.10](02_DATA_MODEL.md); module spec has no entity table yet) | `/files/*`, `/orgs/{orgId}/webhook-endpoints`, `/orgs/{orgId}/api-clients`, `/orgs/{orgId}/integrations/*`, `/api/public/v1/*` | `plt.` (this folder): `plt.file.available`, `plt.file.rejected`, `plt.webhook_endpoint.disabled` | `plt.file.scan`, `plt.webhook.deliver`, `plt.integration.sync`, `plt.cdn.purge`, `plt.outbox.prune`, `plt.lease.reap` | Upload security (quarantine, type detection, scan); presign abuse; outbound webhook retries; partner rate limits; credential envelope encryption |
| PWA | ENT-PWA-01 PushSubscription, ENT-PWA-02 DeviceRegistration, ENT-PWA-03 ClientOutboxItem, ENT-PWA-05 OfflinePolicyEntry, ENT-PWA-06 ExtensionPairing, ENT-PWA-11 AppVersionManifest [12] | `/app/version-policy`, `/me/devices`, `/me/offline-operations`, `/extension/pairings` | `pwa.` [31]: `pwa.install.prompted`, `pwa.app.installed`, `pwa.sw.updated` | none server-side beyond push | Bundle size per route; service-worker update and stale clients; queued-write revalidation; cache clearing on sign-out; iOS push limits |

### 2.2 Career identity, discovery and engagement

| Module | Aggregates | Key APIs | Events | Jobs | Hot spots |
|---|---|---|---|---|---|
| PRF | ENT-PRF-01 Profile, ENT-PRF-02 ProfileExperience, ENT-PRF-04 ProfileSkill, ENT-PRF-11 Resume, ENT-PRF-16 PortfolioProject, ENT-PRF-19 OpenToWorkSetting [24] | `/me/profile`, `/profiles/{slug}`, `/me/resumes`, `/me/resume-imports`, `/me/portfolio-items`, `/me/skills/{skillId}` | `prf.` [27]: `prf.profile.created`, `prf.profile.updated`, `prf.slug.changed` | `prf.resume.parse`, `prf.resume.render`, `prf.skill_confidence.recompute` | Public profile prerender and CDN purge; stealth and blocked-employer rules; resume parsing of untrusted files; field visibility masking |
| EVD | ENT-EVD-01 EvidenceRecord, ENT-EVD-04 EvidenceEvent, ENT-EVD-06 WorkHistoryVerification, ENT-EVD-08 Reference, ENT-EVD-10 Credential, ENT-EVD-11 CredentialStatusRecord, ENT-EVD-12 Issuer [21] | `/me/evidence`, `/references/{token}`, `/me/credentials`, `/verify/{publicHash}`, `/orgs/{orgId}/credential-issuances` | `evd.` [27]: `evd.claim.created`, `evd.evidence.rung_changed`, `evd.evidence.created_from_assessment` | `evd.reference.expire`, `evd.credential.render` | Rung changes only by server transitions; issuer-class rules; revocation propagation (EC-CRIT); token single use; verification page availability |
| BGV | ENT-BGV-04 CheckRequest, ENT-BGV-06 ConsentRecord, ENT-BGV-10 CheckResult, ENT-BGV-11 AdjudicationCase, ENT-BGV-12 AdverseActionNotice, ENT-BGV-14 IdentityVerificationSession [23] | `/orgs/{orgId}/applications/{id}/background-checks`, `/me/background-checks`, `/me/identity-verifications`, `/webhooks/bgv/*` | `bgv.` [26]: `bgv.request.created`, `bgv.consent.given`, `bgv.order.placed` | `bgv.check.submit`, `bgv.check.poll`, `bgv.adverse.wait_expiry` | DC-RESTRICTED handling; jurisdiction rule packs; adverse-action waiting periods; vendor webhook ordering |
| SRC | ENT-SRC-01 SearchDocument, ENT-SRC-04 SavedSearch, ENT-SRC-10 RankingProfile, ENT-SRC-12 IndexJob, ENT-SRC-14 TalentSearchAuditEntry [22] | `/search/*`, `/orgs/{orgId}/search/candidates`, `/me/saved-searches` | `src.` [22]: `src.search.executed`, `src.search.zero_results`, `src.savedsearch.created` | `src.document.index`, `src.index.rebuild`, `src.embedding.compute`, `src.saved_search.run` | p95 search latency (`search.p95_ms`); live consent join cost; scraping; index lag; vector index build time |
| NET | ENT-NET-01 Connection, ENT-NET-06 Post, ENT-NET-15 Group, ENT-NET-17 Endorsement, ENT-NET-20 ReferralRequest, ENT-NET-26 NetworkPrivacySetting [27] | `/me/connections`, `/me/follows/*`, `/feed`, `/posts`, `/groups`, `/referral-requests`, `/intro-requests` | `net.` [34]: `net.connection_request.sent`, `net.connection_request.accepted`, `net.connection.removed` | `net.feed.fanout` | Feed read latency; fan-out cost; endorsement-ring abuse; social-clone non-goal boundary (SSOT §4.2) |
| MSG | ENT-MSG-01 Conversation, ENT-MSG-03 Message, ENT-MSG-06 MessageRequest, ENT-MSG-07 OutreachMessage, ENT-MSG-08 OutreachCreditLedger [20] | `/me/conversations`, `/conversations/{id}/messages`, `/conversations/{id}/read-marks` | `msg.` [32]: `msg.conversation.created`, `msg.message.sent`, `msg.message.edited` | `msg.offline.notify` | Gapless per-conversation `seq`; realtime delivery; outreach credit enforcement; harassment reporting; offline queued sends |
| REP (planned) | `reputation_ledger`, `xp_transactions`, `badges`, `badge_awards` (this folder's names; no module spec file) | `/me/reputation`, `/me/xp-ledger`, `/leaderboards/{code}`, `/me/badges/{awardId}` | `rep.` (this folder): `rep.badge.awarded`, `rep.level.changed` | `rep.xp.settle`, `rep.streak.rollover`, `rep.leaderboard.rebuild` | Idempotent ledger by source event; gaming and farming; leaderboard opt-in; contextual, multi-dimensional reputation (no single score) |

### 2.3 Learning and assessment

| Module | Aggregates | Key APIs | Events | Jobs | Hot spots |
|---|---|---|---|---|---|
| LRN | ENT-LRN-01 CatalogEntry, ENT-LRN-03 Enrollment, ENT-LRN-05 LessonProgress, ENT-LRN-09 Certificate, ENT-LRN-10 LearningPath, ENT-LRN-30 PlaybackSession [31] | `/courses`, `/courses/{id}/enrollments`, `/me/enrollments/*`, `/paths`, `/me/certificates` | `learning.` [31]: `learning.enrollment.created`, `learning.enrollment.activated`, `learning.course.viewed` | `lrn.enrollment.expire` | Progress write rate and offline replay; completion rule (no authority-verified evidence from lesson completion alone); playback token issuance; seat checks |
| STU | ENT-STU-05 Course, ENT-STU-06 CourseVersion, ENT-STU-08 Lesson, ENT-STU-09 MediaAsset, ENT-STU-20 PublishReviewCase, ENT-STU-16 PriceSetting [31] | `/studio/courses/*`, `/studio/media-assets`, `/admin/course-reviews/{id}/decision` | `studio.` [31]: `studio.instructor.applied`, `studio.instructor.approved`, `studio.course.created` | `stu.media.transcode`, `stu.media.captions`, `stu.media.healthcheck` | Large uploads (multipart); media provider webhooks; autosave conflicts; captions before publish; copyright cases |
| ASM (planned) | `assessments`, `item_banks`, `items`, `attempts`, `attempt_responses`, `runner_jobs`, `integrity_cases` (this folder's names; no module spec file) | `/assessments/{id}/attempts`, `/attempts/{id}/*`, `/orgs/{orgId}/assessments`, `/internal/runner-results` | `asm.` (this folder): `asm.attempt.started`, `asm.attempt.submitted`, `asm.attempt.graded` | `asm.attempt.grade`, `asm.code.run`, `asm.attempt.expire`, `asm.similarity.check` | Server-authoritative timers; answer-key protection; `AI_PROHIBITED` enforcement; code runner isolation (DEC-ARC-015); no simulated passes; autosave idempotency |

### 2.4 Hiring

| Module | Aggregates | Key APIs | Events | Jobs | Hot spots |
|---|---|---|---|---|---|
| JOB | ENT-JOB-01 Listing projection, ENT-JOB-07 Application, ENT-JOB-08 Application draft, ENT-JOB-11 Application status event, ENT-JOB-05 Saved search, ENT-JOB-17 Blocked employer [18] | `/jobs`, `/jobs/{id}/applications`, `/me/applications/*`, `/me/application-drafts/{jobId}`, `/me/saved-jobs/{jobId}` | `job.` [24]: `job.listing.viewed`, `job.listing.saved`, `job.saved_search.created` | none of its own beyond listing projection refresh through `src.document.index` | One active application per job (partial unique index); snapshot immutability; public listing caching and `410` for closed jobs; listing fraud |
| ATS | ENT-ATS-01 Requisition, ENT-ATS-02 Job posting and revision, ENT-ATS-05 Pipeline template, ENT-ATS-06 Stage assignment, ENT-ATS-09 Scorecard, ENT-ATS-13 Offer, ENT-ATS-11 Talent pool [22] | `/orgs/{orgId}/jobs/*`, `/orgs/{orgId}/applications/*`, `/orgs/{orgId}/requisitions`, `/orgs/{orgId}/offers/*`, `/orgs/{orgId}/talent-pools` | `ats.` [29]: `ats.requisition.created`, `ats.posting.published`, `ats.posting.closed` | `ats.posting.expire`, `ats.distribution.push`, `ats.stale_application.scan`, `ats.bulk_action.run` | Pipeline board concurrency (`If-Match`); bulk actions; org-internal data separation; EEO self-identification (DC-SENSITIVE); no AI auto-reject |
| INT | ENT-INT-01 Interview plan, ENT-INT-08 Interview, ENT-INT-07 Availability rule, ENT-INT-10 Scheduling invitation, ENT-INT-12 Room session, ENT-INT-14 Recording [22] | `/orgs/{orgId}/applications/{id}/interviews`, `/me/interviews`, `/scheduling-links/{token}`, `/me/availability`, `/interviews/{id}/room-sessions` | `int.` [22]: `int.invite.issued`, `int.interview.scheduled`, `int.interview.rescheduled` | `int.calendar.sync`, `int.room.provision` | Time-zone correctness; slot double-booking; calendar token handling; video provider fallback; recording consent |
| EMP | ENT-EMP-01 Organisation, ENT-EMP-02 Verification case, ENT-EMP-03 Company profile, ENT-EMP-05 Membership and invitation, ENT-EMP-12 Review, ENT-EMP-18 SSO and SCIM configuration [23] | `/companies/{slug}`, `/orgs/{orgId}/employer-page`, `/orgs/{orgId}/teams`, `/companies/{slug}/reviews` | `emp.` [25]: `emp.org.created`, `emp.org.verified`, `emp.org.suspended` | `plt.cdn.purge` on page publish | Org verification trust; review anonymity; tenant root ownership with IDN (§6 C-03) |

### 2.5 Intelligence, governance and institutions

| Module | Aggregates | Key APIs | Events | Jobs | Hot spots |
|---|---|---|---|---|---|
| AIC | ENT-AIC-03 AIRequest (provenance), ENT-AIC-05 Recommendation, ENT-AIC-07 MatchExplanation, ENT-AIC-08 CareerPlan, ENT-AIC-12 QuotaLedger, ENT-AIC-20 PromptTemplate [20] | `/ai/capabilities/{id}/runs`, `/ai/conversations/*`, `/me/recommendations`, `/me/jobs/{jobId}/match-explanation`, `/orgs/{orgId}/jobs/{jobId}/candidate-matches` | `aic.` [37]: `aic.assistant.turn_completed`, `aic.assistant.refused`, `aic.settings.updated` | `aic.run.execute`, `aic.match.recompute`, `aic.recommendation.batch`, `aic.eval.online_sample` | Cost (budget ledger); prompt injection; fairness; free-user invariant; provider fallback; latency of streaming |
| MKT | ENT-MKT-01 Skill, ENT-MKT-04 TaxonomyVersion, ENT-MKT-07 Role, ENT-MKT-10 MarketSignal, ENT-MKT-13 SalaryAggregate, ENT-MKT-15 CareerTransition [25] | `/skills`, `/market/*`, `/career-paths`, `/salaries`, `/me/salary-reports` | `mkt.` [25]: `mkt.skill.created`, `mkt.skill.deprecated`, `mkt.skill.proposal_decided` | `mkt.signals.aggregate`, `mkt.career_paths.compute` | Taxonomy needed at R1 although MKT is OS expansion (OD-ARC-07); `min_cohort_k` suppression; methodology and source labelling |
| TSF | ENT-TSF-01 Report, ENT-TSF-03 ModerationCase, ENT-TSF-04 Decision, ENT-TSF-09 Sanction, ENT-TSF-11 Appeal, ENT-TSF-14 RiskCase [25] | `/reports`, `/admin/moderation-cases/*`, `/me/appeals`, `/admin/appeals/{id}/decision`, `/me/sanctions` | `tsf.` [32]: `tsf.report.submitted`, `tsf.report.triaged`, `tsf.report.resolved` | triage and scan jobs through `aic.run.execute` (`tsf.content.classify`) | Statement of reasons; appeal independence; evidence holds; moderator wellbeing; sanctions enforced at read time across modules |
| ANL | ENT-ANL-01 MetricDefinition, ENT-ANL-03 EventSchema, ENT-ANL-06 Rollup, ENT-ANL-07 DashboardDefinition, ENT-ANL-13 Experiment, ENT-ANL-20 SuppressionPolicy [24] | `/analytics/events`, `/orgs/{orgId}/reports/{code}`, `/orgs/{orgId}/report-exports`, `/admin/metrics/{code}` | `analytics.` [24]: `analytics.metric.published`, `analytics.metric.deprecated`, `analytics.dashboard.published` | `anl.metrics.rollup`, `anl.report.export` | Consent for product analytics; small-cell suppression; analytics reads off the primary; erasure in aggregates |
| INS | ENT-INS-01 Institution, ENT-INS-07 Batch, ENT-INS-09 StudentMembership, ENT-INS-10 ImportBatch, ENT-INS-12 SeatAssignment, ENT-INS-13 CourseAssignment, ENT-INS-22 PlacementDrive, ENT-INS-28 GuardianConsent [31] | `/orgs/{orgId}/cohorts`, `/orgs/{orgId}/bulk-imports/*`, `/orgs/{orgId}/course-assignments`, `/orgs/{orgId}/placement-drives`, `/lti/1.3/*` | `ins.` [40]: `ins.institution.created`, `ins.institution.verified`, `ins.staff.invited` | `ins.import.parse`, `ins.import.commit`, `ins.progress.rollup` | Large imports; minors and guardian consent; graduation severance; institution-scoped visibility of learner data |
| ENT | ENT-ENT-01 EnterpriseWorkspace, ENT-ENT-02 EnterpriseMember, ENT-ENT-05 HrisConnection and SyncRun, ENT-ENT-08 SkillInventoryEntry, ENT-ENT-09 InternalPosting, ENT-ENT-23 LinkConsent [24] | `/orgs/{orgId}/workforce`, `/me/workforce/{orgId}/profile-sharing`, `/orgs/{orgId}/internal-opportunities/*`, `/orgs/{orgId}/skills-inventory` | `enterprise.` [25]: `enterprise.workspace.activated`, `enterprise.workspace.suspended`, `enterprise.sso.configured` | `ent.hris.sync`, `ent.inventory.snapshot` | Employer must never see external job search (RSK-ARC-04); HRIS data volume; generic-HR non-goal boundary |

### 2.6 Commercial and OS expansion

| Module | Aggregates | Key APIs | Events | Jobs | Hot spots |
|---|---|---|---|---|---|
| BIL | ENT-BIL-01 Plan, ENT-BIL-05 BillingAccount, ENT-BIL-06 Subscription, ENT-BIL-17 EntitlementGrant, ENT-BIL-18 SeatPool, ENT-BIL-29 Order, ENT-BIL-21 WebhookEvent, ENT-BIL-22 LedgerEntry [29] | `/plans`, `/billing/checkout-sessions`, `/billing/portal-sessions`, `/me/entitlements`, `/orgs/{orgId}/license-pool-orders`, `/webhooks/stripe` | `bil.` [40]: `bil.plan.published`, `bil.checkout.completed`, `bil.subscription.changed` | `bil.reconcile`, `bil.dunning.step`, `bil.entitlement.expire`, `bil.payout.settle` (gated) | Webhook idempotency; redirect grants nothing; entitlement correctness under concurrency; money in minor units; tax |
| MEN | ENT-MEN-01 MentorProfile, ENT-MEN-05 MentorshipRequest, ENT-MEN-06 Mentorship, ENT-MEN-07 Session, ENT-MEN-10 Program, ENT-MEN-15 ServiceOrder, ENT-MEN-16 SafeguardingReport [21] | `/mentors`, `/me/mentor-profile`, `/mentors/{id}/engagement-requests`, `/me/mentorship-engagements/*` | `men.` [29]: `men.application.submitted`, `men.mentor.approved`, `men.request.sent` | session reminders via `ntf.reminder.scan` | Safeguarding (minors, institution programs); paid sessions money flow; private versus shared notes |
| GIG | ENT-GIG-01 FreelancerProfile, ENT-GIG-03 ProjectListing, ENT-GIG-05 Proposal, ENT-GIG-06 Contract, ENT-GIG-08 Milestone, ENT-GIG-13 Dispute [21] | `/gig-projects/*`, `/gig-contracts/{id}/milestones/*`, `/gig-contracts/{id}/disputes` | `gig.` [28]: `gig.freelancer.activated`, `gig.listing.published`, `gig.invitation.sent` | milestone and dispute reminders via `ntf.reminder.scan` | General-marketplace non-goal boundary; payment release gated by money-flow decision; misclassification and tax documents |
| EVT | ENT-EVT-01 Event, ENT-EVT-03 Registration, ENT-EVT-06 TicketType, ENT-EVT-11 Hackathon, ENT-EVT-12 Submission, ENT-EVT-17 Score [20] | `/events`, `/events/{id}/registrations`, `/orgs/{orgId}/events/*`, `/events/{id}/teams`, `/events/{id}/submissions` | `events.` [30]: `events.event.created`, `events.event.submitted_for_review`, `events.event.published` | reminders via `ntf.reminder.scan` | Registration spikes at open; capacity and waitlist races; live contest leaderboards (bounded realtime); sponsor data sharing consent |

## 3. Synchronous dependency baseline

"May import" means a synchronous call to the target module's `index.ts` in the caller's transaction. Everything else is an event subscription (see [04 §4](04_EVENTS_AND_ASYNC.md)). CI generates the real import graph and fails on a cycle or on an edge missing from this table; a pull request that adds an edge edits this table in the same change [SRC: BE-01-R2 §2].

| Module | May import | Notes |
|---|---|---|
| IDN | none (platform/db only) | Root; tenant registry |
| SET | IDN | Publishes `pv_consent_current` read by all modules |
| ADM | IDN, SET | Audit append is an outbox consumer, not an import |
| NTF | IDN, SET | Leaf: nobody imports NTF |
| PLT | IDN, SET | Files are referenced by id; owners subscribe to `plt.file.*` |
| PWA | IDN, NTF (push subscriptions only through its own tables), PLT | |
| MKT (taxonomy sub-module) | none | Reference data; read by PRF, EVD, JOB, ATS, LRN, STU, ASM, SRC, AIC through `index.ts` |
| PRF | IDN, SET, MKT, PLT | |
| EVD | IDN, SET, MKT, PLT | Receives assessment, learning, hiring and event results by events only |
| BGV | IDN, SET, EVD, BIL | |
| BIL | IDN | Entitlement checks are imported by many modules (read only) |
| SRC | SET, AIC (embeddings) | Reads owner data through owner interfaces inside index jobs; consent through `pv_consent_current` |
| AIC | SET, ASM (`getActiveAiMode`), BIL, MKT | The single door to models [SRC: BE-01-R2 rule 5] |
| ASM | MKT, BIL | Publishes results; never writes evidence |
| LRN | ASM, BIL, MKT, AIC | |
| STU | LRN, PLT, BIL, AIC, MKT | |
| EMP | IDN, PLT, BIL | |
| ATS | IDN, SET, EMP, BIL, MKT, AIC | Owns posting write model |
| JOB | SET, ATS (posting read), EVD (snapshot read), BIL, AIC | Applications |
| INT | IDN, JOB (application read), ATS | |
| MSG | IDN, SET, JOB (application context read) | |
| NET | IDN, SET, PRF | |
| REP | IDN | Consumes events only |
| TSF | IDN, NET, MSG, PRF, JOB | Reads content to moderate; sanctions published by events |
| ANL | SET | Consumes events only otherwise |
| INS | IDN, SET, LRN, ASM, EVD, BIL | |
| ENT | IDN, SET, LRN, BIL, MKT | Workforce data separate from personal data (OD-ARC-15) |
| MEN | IDN, SET, PRF, BIL, INT (room provisioning through `VideoRoomPort` owner) | |
| GIG | IDN, SET, PRF, BIL | |
| EVT | IDN, SET, BIL | |

## 4. Implementation guidance and build order

### 4.1 Foundation first (R0)

These items block every module. Order within the list matters.

| Step | Deliverable | Depends on | Exit check |
|---|---|---|---|
| F1 | Owner approval of one batched build-file change: new packages `packages/policy`, `packages/adapters`; entrypoints per process role; dependency-cruiser config; contract generation scripts; server-state library if OD-ARC-04 chooses one (RSK-ARC-11) [SRC: CLAUDE.md build-file rule] | Owner decision | Approved change merged |
| F2 | Ratify or reject the foundational decisions: DEC-ARC-001, 002, 005, 006, 008, 009, 010, 018 and OD-ARC-01, 02, 03 | Owner | Recorded decisions |
| F3 | `platform/db.withTx` with transaction-local claims; `ts_app`, `ts_worker`, `ts_owner` roles; RLS generator; cross-tenant test generator | F1, F2 | Generated tenant A/B suite green on existing tables |
| F4 | Outbox writer, dispatcher (leader lock), consumer inbox; fenced job engine migration of `background_jobs` (OD-ARC-24); scheduler | F3 | Kill-the-worker test: no lost or duplicated effects for fenced handlers |
| F5 | Policy package with action registry; route registry lint; global error mapper producing the chosen error shape | F2 | Lint fails on an unregistered route |
| F6 | Session cookies, CSRF, step-up, capability endpoint; migration path off `localStorage` tokens | F5 | Browser tests: no token readable by script |
| F7 | Contracts per module folder, OpenAPI and AsyncAPI generation, `oasdiff` gate | F1 | CI regenerates and diffs |
| F8 | Observability: OpenTelemetry through outbox and jobs | F4 | One trace spans request, dispatcher and worker |
| F9 | Retire boot-hydrated Map reads module by module (DEC-ARC-002), starting with the core loop already persisted | F3 | Two API replicas pass the full test suite |
| F10 | Files (PLT upload pipeline), NTF email and push on the new engine, ADM audit store consolidation, SET consent ledger and `pv_consent_current`, MKT taxonomy sub-module | F4–F7 | Each with contract suite and fakes |

### 4.2 Module order after foundation

| Tier | Modules | Hard prerequisites |
|---|---|---|
| R1 core career loop | PRF, EVD, SRC (basic), LRN (first-party courses), ASM (unverified attempts), TSF (reporting and basic moderation), BIL (entitlement stub on as-built Stripe), ANL (event intake), AIC gateway with heuristic targets only | F1–F10; MKT taxonomy |
| R2 hiring marketplace | EMP, ATS, JOB, INT, MSG, NET | R1 PRF, EVD, SRC; BIL entitlements for posting and recruiter search |
| R3 institutions and instructors | INS, STU, LRN depth | R1 LRN; BIL seat pools; PLT media pipeline |
| R4 intelligence and trust at scale | AIC remote models, BGV, REP, ASM code runner | OD-ARC-09, OD-ARC-13, OD-ARC-26, OD-ARC-30 |
| R5 commercial scale | BIL full (orders, coupons, invoices, tax), partner API (PLT) | OD-ARC-22, OD-ARC-23 |
| R6 OS expansion | MEN, GIG, EVT, MKT (beyond taxonomy), ENT | `DEC-002` and each module's scope OD; OD-ARC-15 for ENT; money-flow decision for paid MEN, GIG, EVT |

Tier labels follow the dependency view; dates and final tiers belong to `08_ROADMAP`.

### 4.3 Rules for the team

1. Build vertical slices per feature inside one module: contract → domain rule → migration with `ownership.ts` → repository → use case with events → route → web feature → tests → Reticle verification for user-visible changes [SRC: CLAUDE.md "Verifying with Reticle"].
2. Never call a feature implemented from documentation; record status only from executable evidence [SRC: CLAUDE.md Rules].
3. A module that needs data from another module adds an `index.ts` function on the owner side, reviewed by the owner, or subscribes to an event; never a cross-module `SELECT`.
4. Every new external dependency goes through [05 §7](05_INTEGRATIONS_AND_ADAPTERS.md).
5. Every AI feature registers a capability ([06 §3](06_AI_ARCHITECTURE.md)) and has a non-AI fallback.

## 5. Per-module definition of done (architecture view)

| Check | Evidence |
|---|---|
| Tables declared in `ownership.ts` with ownership class, tenancy, data class, retention, erasure disposition | Migration lint passes |
| RLS policies generated; tenant A/B tests green | `pnpm test:pg` output |
| Routes registered with policy action, rate class, idempotency, pagination, audience | Route lint passes |
| Contracts generated; no unreviewed breaking diff | CI artifact |
| Events emitted through the outbox; consumers idempotent with inbox; replay test | Integration tests |
| Jobs registered with queue class and retry policy; fenced handlers | Kill-the-worker test |
| `ErasureParticipant` and `ExportParticipant` registered | Erasure and export integration test |
| Degraded mode for each external dependency exercised with the fake | Fault-injection test |
| Traces span request to async completion | Trace screenshot or query |
| User-visible flows verified in the running app | Reticle verdict (not `unknown`, not `no-fault`) |

## 6. Conflict register: architecture versus module specifications

Recorded, not silently resolved. "Interim rule" is what a team follows until the owner decides.

| Id | Conflict | Where | Interim rule | Decision |
|---|---|---|---|---|
| C-01 | Event name prefixes are not uniform: most modules use the lowercase module code, but LRN uses `learning.`, STU `studio.`, ADM `admin.`, ANL `analytics.`, ENT `enterprise.`, EVT `events.`; [04 §2.1](04_EVENTS_AND_ASYNC.md) requires the module code | Module specs §9 | Keep spec names as the contract text; the event registry maps each name to its owner code; new events use the code prefix | OD-ARC-36 |
| C-02 | Skills taxonomy ownership: MKT spec claims it (ENT-MKT-01), SRC has ENT-SRC-08 TaxonomySkill, this folder first proposed PRF | MKT, SRC specs; 01 OD-ARC-07 | MKT owns the taxonomy and releases that sub-module at R1; SRC holds a search projection only | OD-ARC-07 |
| C-03 | Organization ownership: EMP owns ENT-EMP-01 Organisation, INS owns ENT-INS-01 Institution, ENT owns ENT-ENT-01 EnterpriseWorkspace, while [02 §3.1](02_DATA_MODEL.md) puts `organizations` under IDN and treats enterprise as a capability of an employer tenant | EMP, INS, ENT specs; 01 §8.2 | One `organizations` tenant row (IDN, identity key and tenancy registry only); kind-specific aggregates owned by EMP, INS and ENT reference it 1:1; `EnterpriseWorkspace` is the ENT record for an employer tenant with the `enterprise_talent` capability | OD-ARC-37 |
| C-04 | Job posting ownership: ATS owns ENT-ATS-02 Job posting; JOB owns ENT-JOB-01 Listing projection and applications | ATS, JOB specs | Adopted in this folder: `jobs` write model owned by ATS (02, 03, 04, 06 updated); JOB owns the public listing projection and applications | Resolved by alignment |
| C-05 | Browser session model: IDN spec uses SessionFamily and RefreshToken (rotating refresh, legacy ADR-T06), DEC-ARC-006 proposes an opaque server-side session cookie | IDN spec; 01 DEC-ARC-006 | Both use HttpOnly cookies and no script-readable token; implement the IDN spec's model if OD-ARC-03 is not decided before IDN build starts | OD-ARC-03 |
| C-06 | Support "view-as": ADM spec defines a consented read-only impersonation session (ENT-ADM-14, SM-ADM-04); 01 originally said no impersonation | ADM spec; 01 §8.1 | 01 updated: read-only view-as runs as a `support_grant` principal; no write-capable impersonation | Resolved by alignment |
| C-07 | Coupons appear in both STU (ENT-STU-17) and BIL (ENT-BIL-12) | STU, BIL specs | BIL owns coupon redemption and money; STU owns instructor coupon configuration that BIL validates | Module owners |
| C-08 | ASM and REP module specs are missing; PLT spec lacks entity and event sections | `02_MODULES/` | This folder's table and event names stand in, marked planned | Blueprint coordinator |

## 7. Open decisions and risks

| Id | Question | Options | Default proposal | Who decides | Blocking |
|---|---|---|---|---|---|
| OD-ARC-36 | Normalize event prefixes to module codes (C-01)? | Rename spec events; keep and map in the registry | Rename before any event is emitted in code, since nothing is built; until then keep a mapping [DEC-REQ] | Architect with module owners | AsyncAPI generation |
| OD-ARC-37 | Organization and tenant ownership split (C-03) | IDN tenant registry plus kind aggregates; EMP, INS, ENT each own a separate tenant table | IDN tenant registry plus kind aggregates [DEC-REQ] | Architect with EMP, INS, ENT owners | RLS generator; IDN and EMP build |

| Id | Risk | Likelihood | Impact | Mitigation | Owner role |
|---|---|---|---|---|---|
| RSK-ARC-27 | Module specs written in parallel diverge further on names and ownership | High | Medium | This register; generated registries from headings; architecture review before each module starts build | Architect |
| RSK-ARC-28 | Foundation work (F1–F10) is underestimated and modules start on the as-built single-writer model | Medium | High | Treat F-steps as release gates; no new module enabled in a deployed environment before F9 | Product owner |

## 8. Legacy source trace

| Source | Used for |
|---|---|
| `PRODUCT_BLUEPRINT/02_MODULES/*.md` sections 8 and 9 (28 files) | Aggregate ids, entity counts, event prefixes and counts |
| [01](01_SYSTEM_ARCHITECTURE.md)–[07](07_SEARCH_MEDIA_REALTIME_ARCHITECTURE.md) | Routes, events, jobs, decisions |
| BE-01-R2 §2 | Generated dependency graph rule and baseline approach |
| CLAUDE.md, AGENTS.md | Build-file restriction, verification rule |

# Implementation inventory and documentation coverage

Source snapshot: `431c425a33f4bd97da73dd966ed28b9acfe1398c`, 2026-10-23.
Initial working tree: clean. During this work, another actor committed the first documentation edits as `335e9827`; this auditor did not commit or stage them. Comparisons use the original source snapshot, not only the current working-tree diff. This documentation-only audit preserves `SSOT.md`
byte-for-byte and changes no application code, tests, SQL or protected build file.

## Scope and evidence vocabulary

All 893 tracked paths were inventoried, including 197 Markdown documents and one
text route artifact. Every documentation file was structurally reviewed for
purpose, status framing, duplication and references; the file-by-file decisions
are below. Source discovery covered all application/shared modules, scripts,
SQL, test files and tooling definitions. Detailed manual traces focused on boot,
sessions, core commits, billing, worker delivery, erasure, AI, assessment, browser
routing/errors and maintenance. This is **not** a line-by-line semantic acceptance
review of every source file or all 173 feature contracts. Untraced behavior and
live environments remain unverified rather than being declared implemented.

| Status | Meaning in this reference |
| --- | --- |
| Implemented | The named bounded behavior exists in inspected source; not a claim of full feature acceptance |
| Partially implemented | Some behavior exists but significant required paths, persistence or policy are incomplete |
| Not implemented | No corresponding implementation found in the inventoried runtime surface; search scope matters |
| Planned/future | Explicit requirement or roadmap, not runtime behavior |
| Unverified | Evidence is insufficient, or runtime/production behavior was not exercised |

Current inventories: [all HTTP routes and schemas](../engineering/API_CONTRACTS.md#complete-static-endpoint-index),
[all migrations and storage owners](../engineering/DATABASE.md#migration-inventory),
[browser routes](../experience/APP_FLOW.md#current-browser-routes).
There are 146 TypeScript/TSX source files under application/package `src` directories,
49 domain files including the barrel, and 54 SQL migrations. Counts describe this
snapshot, not a release metric. The 278 unique API routes come from 281 literal
registrations; three Stripe paths have conditional enabled/disabled implementations.

## Feature status and important implementation limits

The canonical [173 feature IDs](../registries/FEATURE_REGISTRY.md) and
[248 business rules](../registries/BUSINESS_RULE_REGISTRY.md) remain requirements.
The complete [173-row historical feature matrix](../reports/FEATURE_STATUS_2026-10-21.md#complete-feature-matrix)
retains per-feature traces and explicitly incomplete acceptance. Its counts and
absence claims are dated; use the source updates below. All remaining detailed
subfeature/journey acceptance is **unverified** here, not silently promoted from
the old matrix. No new production-ready feature count is asserted.

| Area | Current implementation status | Source-backed behavior and gap |
| --- | --- | --- |
| Identity/auth (F-01) | Partially implemented | Password/HMAC sessions, revocation, current account roles, two public registration roles; OAuth/reset-email/account verification absent |
| Profile/evidence/work history | Partially implemented | Durable records, guarded verification, public proofs, hashed email/reference credentials; employer identity and complete append-only lineage remain gaps |
| Jobs/applications/organizations | Partially implemented | Durable creation/listing/applications/transitions; organization membership role and job approval rules differ from intent |
| Messaging/notifications | Implemented bounded APIs; whole feature unverified | Durable participant-authorized threads/messages and in-app notifications; no realtime/push/digest delivery |
| Settings/export/erasure | Partially implemented | SQL settings, encrypted BYO keys, request history and multi-stage immediate erasure; no scheduled deletion and incomplete failure recovery |
| Billing (F-16) | Partially implemented | Stripe adapter, Checkout/Portal, signed events, SQL state and current-period full-refund handling exist; superseded subscriptions, disputes and live acceptance remain gaps |
| Entitlement enforcement | Partially implemented | Billing writes entitlements; AI tier remains free and broader feature gates are not established |
| Worker/email | Partially implemented | Durable claim loop and two Resend handlers; batch lease duplication, non-aborting timeout and post-commit dispatch gaps |
| Learning/certificates | Partially implemented | Authoring, enrollment, lesson progress and certificates in memory; durable completion evidence can outlive source records; assessment/revocation linkage incomplete |
| Challenges/interviews | Partially implemented | Session/submission APIs; code evaluators simulate results. Interview execution fails closed when deployed; challenge evidence stays unverified |
| AI assistant | Partially implemented | Local heuristic chat with quota/firewall; separate scaffold skips those checks; no remote execution |
| Saved searches/bookmarks | Implemented bounded SQL CRUD; whole feature unverified | Owner-scoped durable stores; alerts and scheduling are separate, incomplete behavior |
| Resumes/portfolio/network | Partially implemented | UI and domain/API paths exist, process-local state; resume exports are Markdown rather than a full document-rendering service |
| Search/command palette | Partially implemented | In-memory matching/autocomplete/history; no runtime SQL FTS index or universal paging |
| Reputation/gamification/analytics | Partially implemented | Scoring/ledger/event helpers and endpoints exist; ephemeral data and trust/consent/XP discrepancies remain |
| Salary/career/learning intelligence | Partially implemented | Cohort suppression, statistics and advisory projections; incomplete data provenance and distinct-person controls vary by module |
| Recruiter intelligence/alumni/referrals | Partially implemented | Domain scoring, segmentation/pools, affiliation/mentorship and referral workflows; memory state and authorization policy gaps |
| Admin/moderation | Partially implemented | SQL flags/audit and account changes; reports/appeals ephemeral; maintenance flag does not block requests |
| Browser shell/PWA | Partially implemented | Mounted pages, session recovery, error boundaries, manifest/capability reporting; offline sync not implemented |
| OAuth, Supabase Auth/Storage/Realtime/Queues, remote AI, media pipeline, heavy queue | Not implemented in current runtime | Explicit targets; environment placeholders and SQL tables are not adapters |
| Broad social/institutional/marketplace/OS expansion | Planned/future | Canonical portfolio retained; absence from mounted routes does not certify every helper absent |
| Live billing/email, hosted DB final state, deployment/restore, load/accessibility acceptance | Unverified | No external services or running browser used in this pass |

## Domain-module map

This table covers every domain source module. Symbols locate implementation;
unit/integration tests are evidence candidates, not freshly executed passes.
Pure helpers can be implemented while the encompassing feature remains partial.
Storage and authorization are determined by API/store wiring, not these filenames.

| Module | Existing behavior / entry symbols | Test candidates |
| --- | --- | --- |
| [activity-contributions.ts](../../packages/domain/src/activity-contributions.ts) | `determineEngagementBand`, `recordActivityEvent`, `calculateContributionScores` | [activity-contributions.test.ts](../../tests/integration/activity-contributions.test.ts), [activity-contributions-domain.test.ts](../../tests/unit/activity-contributions-domain.test.ts) |
| [admin.ts](../../packages/domain/src/admin.ts) | `assertPlatformAdmin`, `computeSystemHealth`, `validateUserStatusTransition`, `updateFeatureFlagState`, `createAdminAuditLog` | [admin.test.ts](../../tests/integration/admin.test.ts), [admin-domain.test.ts](../../tests/unit/admin-domain.test.ts) |
| [ai-gateway.ts](../../packages/domain/src/ai-gateway.ts) | `estimateTokens`, `sanitizePromptInput`, `assertWithinAIQuota`, `createAIConversationEntity`, `generateCareerAssistantResponse` | [ai-gateway.test.ts](../../tests/integration/ai-gateway.test.ts), [ai-gateway-domain.test.ts](../../tests/unit/ai-gateway-domain.test.ts) |
| [alumni-networks.ts](../../packages/domain/src/alumni-networks.ts) | `validateGraduationYear`, `createAlumniAffiliation`, `verifyAffiliationBySeatCode`, `filterAlumniDirectory`, `createAlumniGroup`; additional helpers in source | [alumni-networks.test.ts](../../tests/integration/alumni-networks.test.ts), [alumni-networks-domain.test.ts](../../tests/unit/alumni-networks-domain.test.ts) |
| [analytics.ts](../../packages/domain/src/analytics.ts) | `sanitizeAnalyticsMetadata`, `recordAnalyticsEvent`, `computeKPIs` | [analytics.test.ts](../../tests/integration/analytics.test.ts), [analytics-domain.test.ts](../../tests/unit/analytics-domain.test.ts) |
| [application-drafts.ts](../../packages/domain/src/application-drafts.ts) | `saveApplicationDraft`, `restoreApplicationDraftVersion`, `markDraftSubmitted` | [application-drafts.test.ts](../../tests/integration/application-drafts.test.ts), [application-drafts-domain.test.ts](../../tests/unit/application-drafts-domain.test.ts) |
| [application-feedback.ts](../../packages/domain/src/application-feedback.ts) | `createApplicationFeedback`, `requestApplicationFeedback`, `markFeedbackViewed`, `computeFeedbackAggregateInsights`, `createFeedbackTemplate` | [application-feedback.test.ts](../../tests/integration/application-feedback.test.ts), [application-feedback-domain.test.ts](../../tests/unit/application-feedback-domain.test.ts) |
| [applications.ts](../../packages/domain/src/applications.ts) | `submitJobApplication`, `transitionApplicationState` | [jobs-applications.test.ts](../../tests/integration/jobs-applications.test.ts), [jobs-applications-domain.test.ts](../../tests/unit/jobs-applications-domain.test.ts) |
| [assessment.ts](../../packages/domain/src/assessment.ts) | `assertAIAssistanceAllowed`, `startAssessmentSession`, `evaluateChallengeSubmission`, `calculateCappedXp` | [challenges-assessment.test.ts](../../tests/integration/challenges-assessment.test.ts), [challenges-assessment-domain.test.ts](../../tests/unit/challenges-assessment-domain.test.ts) |
| [auth.ts](../../packages/domain/src/auth.ts) | `configuredPasswordIterations`, `hashPassword`, `verifyPassword`, `passwordNeedsRehash`, `createSessionToken`; additional helpers in source | [auth-profile.test.ts](../../tests/integration/auth-profile.test.ts) |
| [background-jobs.ts](../../packages/domain/src/background-jobs.ts) | `computeBackoffMs`, `decideFailure`, `withoutSecrets`, `truncateError`, `createPgJobStore` | [background-jobs.test.ts](../../tests/unit/background-jobs.test.ts) |
| [behavioral-talent-discovery.ts](../../packages/domain/src/behavioral-talent-discovery.ts) | `validateBehavioralWeights`, `computeActivityScore`, `computePeerCredibilityScore`, `computeLearningVelocityScore`, `computeEmergingExpertiseScore`; additional helpers in source | [behavioral-talent-discovery.test.ts](../../tests/integration/behavioral-talent-discovery.test.ts), [behavioral-talent-discovery-domain.test.ts](../../tests/unit/behavioral-talent-discovery-domain.test.ts) |
| [billing.ts](../../packages/domain/src/billing.ts) | `getPlanEntitlements`, `validateMonetizationIntegrity`, `createSubscription`, `cancelSubscription`, `settleSubscription`; additional helpers in source | [billing.test.ts](../../tests/integration/billing.test.ts), [stripe-billing.test.ts](../../tests/integration/stripe-billing.test.ts) |
| [career-trajectory.ts](../../packages/domain/src/career-trajectory.ts) | `recordCareerTransition`, `calculateWilsonConfidenceInterval`, `calculateCareerTransitionProbability`, `generateProgressionPathways`, `projectSalaryTrajectory`; additional helpers in source | [career-trajectory.test.ts](../../tests/integration/career-trajectory.test.ts), [career-trajectory-domain.test.ts](../../tests/unit/career-trajectory-domain.test.ts) |
| [challenges.ts](../../packages/domain/src/challenges.ts) | `createChallenge`, `filterChallengeForCandidate` | [challenges-assessment.test.ts](../../tests/integration/challenges-assessment.test.ts), [challenges-assessment-domain.test.ts](../../tests/unit/challenges-assessment-domain.test.ts) |
| [core.ts](../../packages/domain/src/core.ts) | `canTransitionApplication`, `isAIAssistanceAllowed` | [core-notifications.test.ts](../../tests/integration/core-notifications.test.ts) |
| [employer-reputation.ts](../../packages/domain/src/employer-reputation.ts) | `ratingToScore`, `determineEmployerReputationBand`, `trimOutlierEmployerReviews`, `calculateEmployerReputation`, `createEmployerReview` | [employer-reputation.test.ts](../../tests/integration/employer-reputation.test.ts), [employer-reputation-domain.test.ts](../../tests/unit/employer-reputation-domain.test.ts) |
| [evidence.ts](../../packages/domain/src/evidence.ts) | `createEvidence`, `verifyEvidence`, `disputeEvidence`, `revokeEvidence`, `generatePublicProof` | [evidence-skills.test.ts](../../tests/integration/evidence-skills.test.ts), [evidence-skills-domain.test.ts](../../tests/unit/evidence-skills-domain.test.ts) |
| [gamification.ts](../../packages/domain/src/gamification.ts) | `calculateLevel`, `updateStreak`, `processXpAward`, `evaluateEligibleBadges`, `computeLeaderboard` | [gamification.test.ts](../../tests/integration/gamification.test.ts), [gamification-domain.test.ts](../../tests/unit/gamification-domain.test.ts) |
| [index.ts](../../packages/domain/src/index.ts) | Public re-export barrel | Inspect shared/integration coverage; no same-name suite association |
| [input-security.ts](../../packages/domain/src/input-security.ts) | `assertNoSqlInjection`, `assertSafeSqlIdentifier`, `escapeHtml`, `assertNoXssPayload`, `isPrivateIpv4`; additional helpers in source | Inspect shared/integration coverage; no same-name suite association |
| [instructor-reputation.ts](../../packages/domain/src/instructor-reputation.ts) | `trimOutlierReviews`, `calculateCourseQualityScore`, `calculateTeachingEffectivenessScore`, `calculateCurrencyScore`, `calculateResponsivenessScore`; additional helpers in source | [instructor-reputation.test.ts](../../tests/integration/instructor-reputation.test.ts), [instructor-reputation-domain.test.ts](../../tests/unit/instructor-reputation-domain.test.ts) |
| [job-templates.ts](../../packages/domain/src/job-templates.ts) | `createJobTemplate`, `updateJobTemplate`, `archiveJobTemplate`, `instantiateJobFromTemplate` | [job-templates.test.ts](../../tests/integration/job-templates.test.ts), [job-templates-domain.test.ts](../../tests/unit/job-templates-domain.test.ts) |
| [jobs.ts](../../packages/domain/src/jobs.ts) | `canTransitionJob`, `createJobPosting`, `transitionJobStatus` | [jobs-applications.test.ts](../../tests/integration/jobs-applications.test.ts), [background-jobs.test.ts](../../tests/unit/background-jobs.test.ts) |
| [learning-impact.ts](../../packages/domain/src/learning-impact.ts) | `recordLearningOutcome`, `computeLearningImpactMetrics`, `aggregateLearningImpactDashboard` | [learning-impact.test.ts](../../tests/integration/learning-impact.test.ts), [learning-impact-domain.test.ts](../../tests/unit/learning-impact-domain.test.ts) |
| [lms.ts](../../packages/domain/src/lms.ts) | `validateCoursePublishReadiness`, `enrollUserInCourse`, `verifySequentialModuleProgress`, `verifyLessonPrerequisites`, `calculateCourseProgress`; additional helpers in source | [lms-courses.test.ts](../../tests/integration/lms-courses.test.ts), [lms-domain.test.ts](../../tests/unit/lms-domain.test.ts) |
| [messaging.ts](../../packages/domain/src/messaging.ts) | `createThreadEntities`, `assertThreadParticipant`, `createMessageEntity`, `calculateUnreadCount` | [messaging-rules.test.ts](../../tests/integration/messaging-rules.test.ts), [messaging.test.ts](../../tests/integration/messaging.test.ts) |
| [moderation.ts](../../packages/domain/src/moderation.ts) | `scanContentForAbuse`, `createModerationReport`, `assertModeratorAuthority`, `transitionReportStatus`, `resolveModerationReport`; additional helpers in source | [moderation.test.ts](../../tests/integration/moderation.test.ts), [moderation-domain.test.ts](../../tests/unit/moderation-domain.test.ts) |
| [networking.ts](../../packages/domain/src/networking.ts) | `requestConnection`, `acceptConnection`, `rejectConnection`, `withdrawConnection`, `areConnected`; additional helpers in source | [networking.test.ts](../../tests/integration/networking.test.ts), [networking-domain.test.ts](../../tests/unit/networking-domain.test.ts) |
| [notifications.ts](../../packages/domain/src/notifications.ts) | `createDefaultNotificationPreferences`, `shouldDeliverNotification`, `createNotificationEntity`, `markNotificationsAsRead`, `candidateApplicationUpdate` | [core-notifications.test.ts](../../tests/integration/core-notifications.test.ts), [notifications.test.ts](../../tests/integration/notifications.test.ts) |
| [peer-credibility.ts](../../packages/domain/src/peer-credibility.ts) | `calculateNetworkDistanceFactor`, `normalizeEndorserCredibility`, `calculateTrackRecordMultiplier`, `computeEndorsementWeight`, `createSkillEndorsement`; additional helpers in source | [peer-credibility.test.ts](../../tests/integration/peer-credibility.test.ts), [peer-credibility-domain.test.ts](../../tests/unit/peer-credibility-domain.test.ts) |
| [portfolio.ts](../../packages/domain/src/portfolio.ts) | `createPortfolioProject`, `updatePortfolioProject`, `canViewPortfolioProject` | [portfolio.test.ts](../../tests/integration/portfolio.test.ts), [portfolio-domain.test.ts](../../tests/unit/portfolio-domain.test.ts) |
| [profile.ts](../../packages/domain/src/profile.ts) | `createProfileEntity`, `updateProfileEntity`, `canViewProfile` | [auth-profile.test.ts](../../tests/integration/auth-profile.test.ts) |
| [referral-requests.ts](../../packages/domain/src/referral-requests.ts) | `createReferralRequest`, `respondToReferralRequest` | [referral-requests.test.ts](../../tests/integration/referral-requests.test.ts), [referral-requests-domain.test.ts](../../tests/unit/referral-requests-domain.test.ts) |
| [reputation-engine.ts](../../packages/domain/src/reputation-engine.ts) | `determineReputationBand`, `createReputationSignal`, `calculateReputationScore`, `startReputationRecoveryPlan`, `completeRecoveryTask` | [reputation-engine.test.ts](../../tests/integration/reputation-engine.test.ts), [reputation-engine-domain.test.ts](../../tests/unit/reputation-engine-domain.test.ts) |
| [resumes.ts](../../packages/domain/src/resumes.ts) | `createResumeEntity`, `updateResumeEntity`, `renderResumeToMarkdown`, `createResumeExport`, `softDeleteResumeExport` | [resumes.test.ts](../../tests/integration/resumes.test.ts), [resumes-domain.test.ts](../../tests/unit/resumes-domain.test.ts) |
| [salary-intelligence.ts](../../packages/domain/src/salary-intelligence.ts) | `calculateVerificationWeight`, `detectSalaryOutlier`, `createSalaryReport`, `withdrawSalaryReport`, `computeSalaryAggregates`; additional helpers in source | [salary-intelligence.test.ts](../../tests/integration/salary-intelligence.test.ts), [salary-intelligence-domain.test.ts](../../tests/unit/salary-intelligence-domain.test.ts) |
| [saved-searches.ts](../../packages/domain/src/saved-searches.ts) | `createSavedSearch`, `updateSavedSearch`, `matchJobAgainstCriteria`, `evaluateJobAlertsForPublishedJob`, `createSavedJob`; additional helpers in source | [saved-searches.test.ts](../../tests/integration/saved-searches.test.ts), [saved-searches-domain.test.ts](../../tests/unit/saved-searches-domain.test.ts) |
| [search.ts](../../packages/domain/src/search.ts) | `levenshteinDistance`, `scoreSearchMatch`, `generateAutocompleteSuggestions`, `rankSearchResults`, `getAvailableCommands`; additional helpers in source | [saved-searches.test.ts](../../tests/integration/saved-searches.test.ts), [search.test.ts](../../tests/integration/search.test.ts) |
| [settings.ts](../../packages/domain/src/settings.ts) | `createDefaultUserSettings`, `updateUserSettings`, `requestAccountErasure`, `cancelAccountErasure`, `executeLogicalAnonymization`; additional helpers in source | [settings.test.ts](../../tests/integration/settings.test.ts), [settings-contract.test.ts](../../tests/unit/settings-contract.test.ts) |
| [skill-decay.ts](../../packages/domain/src/skill-decay.ts) | `getCategoryHalfLifeDays`, `calculateFreshnessScore`, `createSkillFreshnessRecord`, `reverifySkill` | [skill-decay.test.ts](../../tests/integration/skill-decay.test.ts), [skill-decay-domain.test.ts](../../tests/unit/skill-decay-domain.test.ts) |
| [skill-forecasting.ts](../../packages/domain/src/skill-forecasting.ts) | `recordSkillMarketSignal`, `computeSkillForecast`, `rankTopEmergingSkills` | [skill-forecasting.test.ts](../../tests/integration/skill-forecasting.test.ts), [skill-forecasting-domain.test.ts](../../tests/unit/skill-forecasting-domain.test.ts) |
| [skills.ts](../../packages/domain/src/skills.ts) | `wouldCreatePrerequisiteCycle`, `createSkillRelationship`, `traverseSkillGraph` | [evidence-skills.test.ts](../../tests/integration/evidence-skills.test.ts), [evidence-skills-domain.test.ts](../../tests/unit/evidence-skills-domain.test.ts) |
| [stripe-billing.ts](../../packages/domain/src/stripe-billing.ts) | `buildPriceCatalog`, `mapStripeStatus`, `entitledTier`, `reconcileStripeSubscription`, `invoiceFromStripe` | [stripe-billing.test.ts](../../tests/integration/stripe-billing.test.ts), [stripe-billing-domain.test.ts](../../tests/unit/stripe-billing-domain.test.ts) |
| [talent-pool-intelligence.ts](../../packages/domain/src/talent-pool-intelligence.ts) | `validateCandidatePoolEligibility`, `createTalentPool`, `addCandidateToPool`, `updatePoolMemberStatus`, `computePoolSkillComposition`; additional helpers in source | [talent-pool-intelligence.test.ts](../../tests/integration/talent-pool-intelligence.test.ts), [talent-pool-intelligence-domain.test.ts](../../tests/unit/talent-pool-intelligence-domain.test.ts) |
| [talent-segmentation.ts](../../packages/domain/src/talent-segmentation.ts) | `classifyCandidateSpecialization`, `classifySeniorityTier`, `classifyEngagementSegment`, `classifyReadinessBand`, `classifyCandidate`; additional helpers in source | [talent-segmentation.test.ts](../../tests/integration/talent-segmentation.test.ts), [talent-segmentation-domain.test.ts](../../tests/unit/talent-segmentation-domain.test.ts) |
| [technical-interview.ts](../../packages/domain/src/technical-interview.ts) | `createInterviewQuestion`, `scheduleInterviewAssessment`, `joinInterviewAssessment`, `updateRecordingConsent`, `endInterviewAssessment`; additional helpers in source | [technical-interview.test.ts](../../tests/integration/technical-interview.test.ts), [technical-interview-domain.test.ts](../../tests/unit/technical-interview-domain.test.ts) |
| [warm-introductions.ts](../../packages/domain/src/warm-introductions.ts) | `discoverWarmIntroPaths`, `createWarmIntroRequest`, `respondToIntroRequest` | [warm-introductions.test.ts](../../tests/integration/warm-introductions.test.ts), [warm-introductions-domain.test.ts](../../tests/unit/warm-introductions-domain.test.ts) |
| [work-history-graph.ts](../../packages/domain/src/work-history-graph.ts) | `validateWorkHistoryDates`, `calculateTenureMonths`, `extractDomain`, `verifyCorporateEmailDomain`, `calculateVerificationScoreAndBadge`; additional helpers in source | [work-history-graph.test.ts](../../tests/integration/work-history-graph.test.ts), [work-history-graph-domain.test.ts](../../tests/unit/work-history-graph-domain.test.ts) |


## Algorithms and decision logic

- `core.ts` and `applications.ts` define legal application edges; the API adds
  actor/resource checks and a database uniqueness/concurrency boundary.
- `skills.ts` rejects prerequisite cycles and traverses relationships; these
  graph relationships are distinct from the durable skill taxonomy.
- `skill-decay.ts` calculates `100 * 0.5^(days / categoryHalfLife)` and records
  re-verification. `reputation-engine.ts` separately decays weighted signals;
  do not merge their policies merely because both use half-lives.
- `peer-credibility.ts` combines distance, credibility, track record and context,
  clamping endorsement weight to 0.05?2.0. Route identity/connection gaps are
  tracked as CF-40; a correct formula does not make its inputs trustworthy.
- `career-trajectory.ts` calculates transition probabilities with Wilson intervals
  and cohort checks, and projects advisory salary pathways. Fabricated seed
  outcomes were removed in earlier work; real provenance still needs validation.
- `salary-intelligence.ts` has benchmark threshold 5 and company-summary threshold
  3; `learning-impact.ts` uses 30, and segmentation defaults to 10. These are
  separate source policies, not proof of the conflicting SSOT-wide k=10 claim,
  differential privacy, or distinct people in every cohort.
- `lms.ts` enforces lesson/module prerequisites and computes progress. Certificate
  issuance/revocation and durable evidence are not one atomic lifecycle.
- `stripe-billing.ts` normalizes provider status into subscription/entitlement
  state; `billing-stripe.ts` adds identity mapping, replay handling and refund
  association. Neither browser redirects nor client prices are authoritative.

## Documentation structure and consolidation decisions

`README` is setup/navigation; root architecture is implementation topology;
API/database/operations/testing/security own their technical topics; system-model
files retain flow/rule/finding evidence. Requirements and registries retain stable
IDs; dated reports and agent artifacts retain provenance. Personal notes and
managed tooling instructions are not disposable application documentation.

Markdown count: **197 before, 193 after** (tracked files present, including hidden
agent history, generated graph reports, deployment docs and personal vault).
No new documentation file was introduced. Four files were removed after preserving
useful content:

| Former file | Retained home / reason |
| --- | --- |
| Root `ORIGINAL_REQUEST.md` | Original Windows maintenance requirements in [maintenance archive](../reports/MAINTENANCE_AUDIT_2026-10-21.md#original-windows-tool-requirements) |
| Root `TEST_READY.md` | Full dated test record and defect note in [maintenance archive](../reports/MAINTENANCE_AUDIT_2026-10-21.md#historical-windows-test-readiness) |
| Root `PROJECT.md` | Byte-identical existing [.agents plan](../../.agents/teamwork/orchestrator_1/PROJECT.md); linked from maintenance archive |
| `HOSTED_SUPABASE_DEPENDENCY_AUDIT.md` | [Hosted migration gate](../engineering/HOSTED_SUPABASE_MIGRATION_GATE.md), including static audit command and prerequisites |

137 substantive API-reference lines and 51 database-reference lines previously
matched SSOT verbatim. Their target registers now link to SSOT; unique contract,
provider-boundary, data-lifecycle and migration requirements were preserved.
Dated results remain labelled historical. Different-purpose documents are retained
rather than merged solely to reduce a count. No SSOT content was removed or edited.

## File-by-file documentation classification

The following lists every original tracked Markdown file, including hidden
artifacts. Classification describes document purpose and evidence status, not
certification of every claim it contains. Historical artifacts are retained for
provenance; their assertions require source/runtime re-check before reuse.

| File | Classification / disposition |
| --- | --- |
| `ORIGINAL_REQUEST.md` | Consolidated: original requirements retained in maintenance archive |
| `PROJECT.md` | Consolidated: byte-identical plan retained in `.agents/teamwork/orchestrator_1/PROJECT.md` |
| `TEST_READY.md` | Consolidated: historical test evidence retained in maintenance archive |
| `docs/engineering/HOSTED_SUPABASE_DEPENDENCY_AUDIT.md` | Consolidated: hosted migration gate owns dependency audit |
| [.agents/skills/autofix/SKILL.md](../../.agents/skills/autofix/SKILL.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.agents/skills/autofix/github.md](../../.agents/skills/autofix/github.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.agents/skills/code-review/SKILL.md](../../.agents/skills/code-review/SKILL.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.agents/skills/code-review/references/auth-recovery.md](../../.agents/skills/code-review/references/auth-recovery.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.agents/skills/code-review/references/cli-workflows.md](../../.agents/skills/code-review/references/cli-workflows.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.agents/teamwork/ORIGINAL_REQUEST.md](../../.agents/teamwork/ORIGINAL_REQUEST.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/auditor_1/BRIEFING.md](../../.agents/teamwork/auditor_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/auditor_1/DISPATCH.md](../../.agents/teamwork/auditor_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/auditor_1/context.md](../../.agents/teamwork/auditor_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/auditor_1/handoff.md](../../.agents/teamwork/auditor_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/auditor_1/progress.md](../../.agents/teamwork/auditor_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/auditor_iter2/DISPATCH.md](../../.agents/teamwork/auditor_iter2/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/auditor_iter2/context.md](../../.agents/teamwork/auditor_iter2/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_1/BRIEFING.md](../../.agents/teamwork/challenger_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_1/DISPATCH.md](../../.agents/teamwork/challenger_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_1/context.md](../../.agents/teamwork/challenger_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_1/handoff.md](../../.agents/teamwork/challenger_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_1/progress.md](../../.agents/teamwork/challenger_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_2/BRIEFING.md](../../.agents/teamwork/challenger_2/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_2/DISPATCH.md](../../.agents/teamwork/challenger_2/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_2/context.md](../../.agents/teamwork/challenger_2/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_2/handoff.md](../../.agents/teamwork/challenger_2/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_2/progress.md](../../.agents/teamwork/challenger_2/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_iter2_1/DISPATCH.md](../../.agents/teamwork/challenger_iter2_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_iter2_1/context.md](../../.agents/teamwork/challenger_iter2_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_iter2_2/DISPATCH.md](../../.agents/teamwork/challenger_iter2_2/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/challenger_iter2_2/context.md](../../.agents/teamwork/challenger_iter2_2/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_arch_sec_1/BRIEFING.md](../../.agents/teamwork/explorer_arch_sec_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_arch_sec_1/DISPATCH.md](../../.agents/teamwork/explorer_arch_sec_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_arch_sec_1/architecture_security_report.md](../../.agents/teamwork/explorer_arch_sec_1/architecture_security_report.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_arch_sec_1/handoff.md](../../.agents/teamwork/explorer_arch_sec_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_arch_sec_1/progress.md](../../.agents/teamwork/explorer_arch_sec_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_features_1/BRIEFING.md](../../.agents/teamwork/explorer_features_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_features_1/DISPATCH.md](../../.agents/teamwork/explorer_features_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_features_1/features_audit_report.md](../../.agents/teamwork/explorer_features_1/features_audit_report.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_features_1/handoff.md](../../.agents/teamwork/explorer_features_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_features_1/progress.md](../../.agents/teamwork/explorer_features_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_git_issues_1/BRIEFING.md](../../.agents/teamwork/explorer_git_issues_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_git_issues_1/DISPATCH.md](../../.agents/teamwork/explorer_git_issues_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_git_issues_1/git_reconciliation_report.md](../../.agents/teamwork/explorer_git_issues_1/git_reconciliation_report.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_git_issues_1/handoff.md](../../.agents/teamwork/explorer_git_issues_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_git_issues_1/progress.md](../../.agents/teamwork/explorer_git_issues_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_1/BRIEFING.md](../../.agents/teamwork/explorer_survey_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_1/DISPATCH.md](../../.agents/teamwork/explorer_survey_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_1/context.md](../../.agents/teamwork/explorer_survey_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_1/handoff.md](../../.agents/teamwork/explorer_survey_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_1/progress.md](../../.agents/teamwork/explorer_survey_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_2/BRIEFING.md](../../.agents/teamwork/explorer_survey_2/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_2/DISPATCH.md](../../.agents/teamwork/explorer_survey_2/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_2/context.md](../../.agents/teamwork/explorer_survey_2/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_2/handoff.md](../../.agents/teamwork/explorer_survey_2/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_2/progress.md](../../.agents/teamwork/explorer_survey_2/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_3/BRIEFING.md](../../.agents/teamwork/explorer_survey_3/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_3/DISPATCH.md](../../.agents/teamwork/explorer_survey_3/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_3/context.md](../../.agents/teamwork/explorer_survey_3/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_3/handoff.md](../../.agents/teamwork/explorer_survey_3/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/explorer_survey_3/progress.md](../../.agents/teamwork/explorer_survey_3/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/orchestrator_1/BRIEFING.md](../../.agents/teamwork/orchestrator_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/orchestrator_1/DISPATCH.md](../../.agents/teamwork/orchestrator_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/orchestrator_1/GATE_STATUS.md](../../.agents/teamwork/orchestrator_1/GATE_STATUS.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/orchestrator_1/PROJECT.md](../../.agents/teamwork/orchestrator_1/PROJECT.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/orchestrator_1/TEST_INFRA.md](../../.agents/teamwork/orchestrator_1/TEST_INFRA.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/orchestrator_1/context.md](../../.agents/teamwork/orchestrator_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/orchestrator_1/progress.md](../../.agents/teamwork/orchestrator_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_1/BRIEFING.md](../../.agents/teamwork/reviewer_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_1/DISPATCH.md](../../.agents/teamwork/reviewer_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_1/context.md](../../.agents/teamwork/reviewer_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_1/handoff.md](../../.agents/teamwork/reviewer_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_1/progress.md](../../.agents/teamwork/reviewer_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_2/BRIEFING.md](../../.agents/teamwork/reviewer_2/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_2/DISPATCH.md](../../.agents/teamwork/reviewer_2/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_2/context.md](../../.agents/teamwork/reviewer_2/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_2/handoff.md](../../.agents/teamwork/reviewer_2/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_2/progress.md](../../.agents/teamwork/reviewer_2/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_audit_1/BRIEFING.md](../../.agents/teamwork/reviewer_audit_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_audit_1/DISPATCH.md](../../.agents/teamwork/reviewer_audit_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_audit_1/handoff.md](../../.agents/teamwork/reviewer_audit_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_audit_1/progress.md](../../.agents/teamwork/reviewer_audit_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_iter2_1/DISPATCH.md](../../.agents/teamwork/reviewer_iter2_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_iter2_1/context.md](../../.agents/teamwork/reviewer_iter2_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_iter2_2/DISPATCH.md](../../.agents/teamwork/reviewer_iter2_2/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/reviewer_iter2_2/context.md](../../.agents/teamwork/reviewer_iter2_2/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/sentinel/BRIEFING.md](../../.agents/teamwork/sentinel/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/sentinel/handoff.md](../../.agents/teamwork/sentinel/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/BRIEFING.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/DISPATCH.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/GATE_STATUS.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/GATE_STATUS.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/PROJECT.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/PROJECT.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/README.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/README.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/handoff.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/plan.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/plan.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_orchestrator_1/progress.md](../../.agents/teamwork/teamwork_preview_orchestrator_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_victory_auditor_1/BRIEFING.md](../../.agents/teamwork/teamwork_preview_victory_auditor_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_victory_auditor_1/DISPATCH.md](../../.agents/teamwork/teamwork_preview_victory_auditor_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_victory_auditor_1/README.md](../../.agents/teamwork/teamwork_preview_victory_auditor_1/README.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_victory_auditor_1/handoff.md](../../.agents/teamwork/teamwork_preview_victory_auditor_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/teamwork_preview_victory_auditor_1/progress.md](../../.agents/teamwork/teamwork_preview_victory_auditor_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/test_writer_e2e_1/BRIEFING.md](../../.agents/teamwork/test_writer_e2e_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/test_writer_e2e_1/DISPATCH.md](../../.agents/teamwork/test_writer_e2e_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/test_writer_e2e_1/context.md](../../.agents/teamwork/test_writer_e2e_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/test_writer_e2e_1/handoff.md](../../.agents/teamwork/test_writer_e2e_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/test_writer_e2e_1/progress.md](../../.agents/teamwork/test_writer_e2e_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_baseline_diag_1/BRIEFING.md](../../.agents/teamwork/worker_baseline_diag_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_baseline_diag_1/DISPATCH.md](../../.agents/teamwork/worker_baseline_diag_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_baseline_diag_1/baseline_report.md](../../.agents/teamwork/worker_baseline_diag_1/baseline_report.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_baseline_diag_1/handoff.md](../../.agents/teamwork/worker_baseline_diag_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_baseline_diag_1/progress.md](../../.agents/teamwork/worker_baseline_diag_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_1/BRIEFING.md](../../.agents/teamwork/worker_impl_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_1/DISPATCH.md](../../.agents/teamwork/worker_impl_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_1/context.md](../../.agents/teamwork/worker_impl_1/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_1/handoff.md](../../.agents/teamwork/worker_impl_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_1/progress.md](../../.agents/teamwork/worker_impl_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_2/BRIEFING.md](../../.agents/teamwork/worker_impl_2/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_2/DISPATCH.md](../../.agents/teamwork/worker_impl_2/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_2/context.md](../../.agents/teamwork/worker_impl_2/context.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_2/handoff.md](../../.agents/teamwork/worker_impl_2/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_impl_2/progress.md](../../.agents/teamwork/worker_impl_2/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_synthesis_1/BRIEFING.md](../../.agents/teamwork/worker_synthesis_1/BRIEFING.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_synthesis_1/DISPATCH.md](../../.agents/teamwork/worker_synthesis_1/DISPATCH.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_synthesis_1/handoff.md](../../.agents/teamwork/worker_synthesis_1/handoff.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.agents/teamwork/worker_synthesis_1/progress.md](../../.agents/teamwork/worker_synthesis_1/progress.md) | Historical agent briefing/plan/evidence; retained for provenance |
| [.claude/commands/reticle.md](../../.claude/commands/reticle.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.claude/skills/autofix/SKILL.md](../../.claude/skills/autofix/SKILL.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.claude/skills/autofix/github.md](../../.claude/skills/autofix/github.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.claude/skills/code-review/SKILL.md](../../.claude/skills/code-review/SKILL.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.claude/skills/code-review/references/auth-recovery.md](../../.claude/skills/code-review/references/auth-recovery.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.claude/skills/code-review/references/cli-workflows.md](../../.claude/skills/code-review/references/cli-workflows.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [.github/copilot-instructions.md](../../.github/copilot-instructions.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [AGENTS.md](../../AGENTS.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [ARCHITECTURE.md](../../ARCHITECTURE.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [BRAIN/BRAIN.md](../../BRAIN/BRAIN.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [BRAIN/MEMORY.md](../../BRAIN/MEMORY.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [CLAUDE.md](../../CLAUDE.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [GEMINI.md](../../GEMINI.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [README.md](../../README.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md](../../REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md) | Compatibility pointer to retained report; no duplicated report body |
| [RETICLE.md](../../RETICLE.md) | Tooling/agent instruction; retained for distinct consumer, not feature status |
| [SSOT.md](../../SSOT.md) | Canonical intended requirements; preserved byte-for-byte |
| [TalentSphere/Welcome.md](../../TalentSphere/Welcome.md) | Personal vault/template; preserved, outside technical authority |
| [TalentSphere/create a link.md](../../TalentSphere/create%20a%20link.md) | Personal vault/template; preserved, outside technical authority |
| [deploy/oracle/NEW_SUPABASE_PROJECT.md](../../deploy/oracle/NEW_SUPABASE_PROJECT.md) | Protected deployment reference; read-only, live behavior unverified |
| [deploy/oracle/README.md](../../deploy/oracle/README.md) | Protected deployment reference; read-only, live behavior unverified |
| [deploy/oracle/RECOVERY.md](../../deploy/oracle/RECOVERY.md) | Protected deployment reference; read-only, live behavior unverified |
| [docs/INDEX.md](../INDEX.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/engineering/API_CONTRACTS.md](../engineering/API_CONTRACTS.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/engineering/CODE_STYLE.md](../engineering/CODE_STYLE.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/engineering/DATABASE.md](../engineering/DATABASE.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md](../engineering/HOSTED_SUPABASE_MIGRATION_GATE.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/engineering/PROJECT_MAINTENANCE.md](../engineering/PROJECT_MAINTENANCE.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/engineering/TARGET_ARCHITECTURE.md](../engineering/TARGET_ARCHITECTURE.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/engineering/TRD.md](../engineering/TRD.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/engineering/adr/ADR-015-core-loop-persistence.md](../engineering/adr/ADR-015-core-loop-persistence.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md](../engineering/adr/ADR-016-browser-measured-ui-quality-gates.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/experience/APP_FLOW.md](../experience/APP_FLOW.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/experience/JOURNEY_REGISTRY.md](../experience/JOURNEY_REGISTRY.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/experience/UI_UX_DESIGN_SYSTEM.md](../experience/UI_UX_DESIGN_SYSTEM.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/governance/GAP_ANALYSIS.md](../governance/GAP_ANALYSIS.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/governance/GOVERNANCE.md](../governance/GOVERNANCE.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/governance/IMPLEMENTATION_PLAN.md](../governance/IMPLEMENTATION_PLAN.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/governance/SOURCE_RECONCILIATION.md](../governance/SOURCE_RECONCILIATION.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/product/PRD.md](../product/PRD.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/quality/OPERATIONS.md](../quality/OPERATIONS.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/quality/SECURITY.md](../quality/SECURITY.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/quality/TESTING.md](../quality/TESTING.md) | Living navigation/technical/policy reference; retains distinct topic ownership |
| [docs/registries/BUSINESS_RULE_REGISTRY.md](../registries/BUSINESS_RULE_REGISTRY.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/registries/FEATURE_REGISTRY.md](../registries/FEATURE_REGISTRY.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md](../registries/WORKFLOWS_AND_BUSINESS_RULES.md) | Requirements/design/portfolio intent; retained, not implementation proof |
| [docs/reports/ARCHITECTURE_DURABILITY_REPORT.md](../reports/ARCHITECTURE_DURABILITY_REPORT.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/AUDIT_MASTER_REPORT.md](../reports/AUDIT_MASTER_REPORT.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/E2E_AUDIT_2026-10-21.md](../reports/E2E_AUDIT_2026-10-21.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/FEATURE_PLAN_2026-10-21.md](../reports/FEATURE_PLAN_2026-10-21.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/FEATURE_STATUS_2026-10-21.md](../reports/FEATURE_STATUS_2026-10-21.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/FEATURE_TRACEABILITY_MATRIX.md](../reports/FEATURE_TRACEABILITY_MATRIX.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/FINAL_VALIDATION_REPORT.md](../reports/FINAL_VALIDATION_REPORT.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/GIT_RECONCILIATION_REPORT.md](../reports/GIT_RECONCILIATION_REPORT.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md](../reports/IMPROVEMENT_PROGRAM_2026-10-10.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/MAINTENANCE_AUDIT_2026-10-21.md](../reports/MAINTENANCE_AUDIT_2026-10-21.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/PAYMENT_AUDIT_2026-10-23.md](../reports/PAYMENT_AUDIT_2026-10-23.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/PRODUCTION_AUDIT_2026-10-03.md](../reports/PRODUCTION_AUDIT_2026-10-03.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/RELEASE_SCOPE_AND_BACKLOG.md](../reports/RELEASE_SCOPE_AND_BACKLOG.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md](../reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md](../reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/superpowers/plans/2026-10-21-project-maintenance.md](../superpowers/plans/2026-10-21-project-maintenance.md) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| [docs/system-model/00-index.md](00-index.md) | Source model or dated evidence; coverage/verification limits explicit |
| [docs/system-model/01-inventory-and-coverage.md](01-inventory-and-coverage.md) | Source model or dated evidence; coverage/verification limits explicit |
| [docs/system-model/02-flows.md](02-flows.md) | Source model or dated evidence; coverage/verification limits explicit |
| [docs/system-model/03-conflict-register.md](03-conflict-register.md) | Source model or dated evidence; coverage/verification limits explicit |
| [docs/system-model/04-conditions.md](04-conditions.md) | Source model or dated evidence; coverage/verification limits explicit |
| [docs/system-model/05-audit.md](05-audit.md) | Source model or dated evidence; coverage/verification limits explicit |
| [docs/system-model/06-route-authorization.md](06-route-authorization.md) | Source model or dated evidence; coverage/verification limits explicit |
| [graphify-out/2026-10-23/GRAPH_REPORT.md](../../graphify-out/2026-10-23/GRAPH_REPORT.md) | Generated graph snapshot; retained, not implementation acceptance |
| [graphify-out/GRAPH_REPORT.md](../../graphify-out/GRAPH_REPORT.md) | Generated graph snapshot; retained, not implementation acceptance |
| [supabase/hosted/README.md](../../supabase/hosted/README.md) | Manual adapter sequence and historical partial deployment; current applied state unverified |


## Validation and remaining work

Validation results are recorded after the final checks below. Application tests,
PostgreSQL, Stripe/Resend, remote deployment and browser/Reticle are not implied
by documentation validation. Reticle is skipped because no app-visible behavior
changed. The build-file restriction prevents installs, emitting builds/typechecks
and generated cache/output writes in this task.

Remaining implementation work: resolve the referenced trust/authorization,
assessment/credential, worker, erasure and billing findings under the owning
policy decisions. Detailed acceptance of the full 173-feature portfolio,
all external integration states and historical report assertions remains
unverified. Protected deployment documentation may retain historical instructions;
use the current hosted gate and actual operator evidence before any deployment.

## Earlier system-model inventory (historical)

The original inventory is retained below as provenance, not current counts or
coverage. Its line-number references and external observations belong to that
session. The current source index above supersedes its snapshot counts.

# System model 01 — Inventory and coverage

Measured on 2026-10-23 from the git tree at the commit that adds this file. Every number below came from a command run against the repository, not from documentation.

## Coverage statement (read this first)

This model does **not** claim that 100% of the repository was inspected. The terms below are used strictly.

| Term         | Meaning here                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Discovered   | The file or route exists in the git tree or in a source listing.                               |
| Inspected    | A person or agent read the relevant lines and cited them as `path:line`.                       |
| Verified     | Inspected, and a test or command run during this work exercised the behaviour.                 |

Only the areas listed in `02-flows.md` were inspected for flow modelling. `apps/api/src/server.ts` is one 13,000-line file with 278 unique routes; each route was discovered, but only the routes named in the flow documents were inspected. Everything else is "discovered, not inspected".

Not accessible from this work: the GitHub issue and PR threads beyond what the public API returned, the live Stripe and Supabase projects' contents beyond a read-only look at Supabase migrations and advisors, and any production deployment. Documentation was read selectively (see the conflict register for what was compared).

## Repository size (git-tracked files: 880)

| Top-level directory | Tracked files | Note                                                                 |
| ------------------- | ------------- | -------------------------------------------------------------------- |
| `tests`             | 201           | unit 64, integration 51, security 5, e2e 59, pg 12 (plus helpers)    |
| `.agents`           | 135           | agent skill and collaboration artifacts, not application code        |
| `graphify-out`      | 127           | generated knowledge-graph output                                     |
| `apps`              | 126           | api, web, worker                                                     |
| `packages`          | 71            | config, contracts, domain, observability, testing, ui                |
| `supabase`          | 54            | 53 migrations (`00001`-`00053`) and seed folder                      |
| `docs`              | 42            | product, engineering, quality and report documents (plus this model) |
| other               | the rest      | `.playwright-cli`, `.audit`, `scripts`, `deploy`, `.github`, ...     |

Application source (non-test `.ts`/`.tsx` under `apps` and `packages`): 147 files.

## API surface

- 281 route registrations in `apps/api/src/server.ts` and `apps/api/src/billing-stripe.ts`; 278 unique method-and-path pairs. By method: 132 GET, 123 POST, 13 PATCH, 11 DELETE, 2 PUT.
- `apps/api/src/durability.ts` lists 80 routes whose state is durable in PostgreSQL or stateless. The remaining routes keep state in process memory and answer with `x-talentsphere-durability: ephemeral`.
- Web app: 29 page components in `apps/web/src/pages`.

## Sample, mock and fabricated data removed from the running application

| Item                                                                                       | Where                                  | Action                                    |
| ------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------------------------- |
| 60 invented career transitions (28 + 22 + 10 people)                                       | `server.ts` career section             | Removed (`fb38674b`)                      |
| Invented market signals for four skills, and invented baseline signals in three routes     | `server.ts` forecast section           | Removed (`fb38674b`)                      |
| Constant retention rate (88.5) and a data source that was never collected                  | `packages/domain/src/career-trajectory.ts` | Removed (`fb38674b`)                  |
| Sample course (3 stub lessons, nil-UUID instructor)                                        | `server.ts` LMS section                | Removed                                   |
| Sample coding challenge                                                                    | `server.ts` challenges section         | Removed                                   |
| 35 invented learner outcomes (80% hire rate) shown as the sample course's measured impact  | `server.ts` learning-impact section    | Removed                                   |

Reference data kept on purpose: the canonical skills taxonomy (`seedSkills`, BR-141) and the feature-flag defaults in `scripts/seed.mjs`.

Still simulated, awaiting an owner decision (issue #49): the interview code evaluator in `packages/domain/src/technical-interview.ts` decides pass or fail from the text of the code (it fails closed in staging and production), and a second placeholder in `packages/domain/src/assessment.ts:132` handles challenge submissions (mitigated: the evidence is stored unverified with `executed:false`).

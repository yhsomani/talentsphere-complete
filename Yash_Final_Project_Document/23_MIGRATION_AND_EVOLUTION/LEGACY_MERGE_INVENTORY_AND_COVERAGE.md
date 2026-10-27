# Legacy Merge B-23b: Prior-Attempt Inventory, Feature-Status Claims, Domain Module Map and Removed Sample Data

Doc ID: LGM-B-23B · Owner: Migration Lead (with Documentation Architect) · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: MIG-01, MIG-DATA-01, API-REF-01, TRC-COV, OPEN-17, OPEN-41, OPEN-42, OPEN-43 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/system-model/01-inventory-and-coverage.md` (67 KB; a current section dated 2026-10-23 plus an "earlier system-model inventory (historical)" section) and `.../system-model/05-audit.md` limitations (the audit commands are in the testing file).

## 0. Frame - what this file is and is not

- **Nothing is implemented in this project.** The inventory below describes an earlier attempt (source snapshot `431c425a33f4bd97da73dd966ed28b9acfe1398c`, 2026-10-23, 893 tracked paths, 197 Markdown documents). Its "Implemented / Partially implemented" labels apply to *that attempt's* source and are **not** statuses of this blueprint. For this project the only statuses are *specified*, *designed*, *not built*.
- The inventory is migration-relevant for three reasons: (1) it lists *behaviours* the earlier attempt built, which the product owner may want to carry over (feature requirements); (2) it lists *data stores and tables* that may hold real data (decision OPEN-17: does any earlier database contain real users?); (3) it records *fabricated sample data that was removed*, a hazard to avoid.
- The legacy evidence vocabulary (kept): **Implemented** (bounded behaviour exists in inspected source; not a claim of full acceptance), **Partially implemented**, **Not implemented**, **Planned/future**, **Unverified**. Coverage terms: **Discovered**, **Inspected** (read and cited as `path:line`), **Verified** (inspected and exercised by a test or command). The prior inventory explicitly did **not** claim 100% inspection ("discovered, not inspected" for most of the ~278 routes).

### 0.1 Scope and evidence vocabulary of the prior inventory (verbatim)

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

Current inventories: all HTTP routes and schemas,
all migrations and storage owners,
browser routes.
There are 146 TypeScript/TSX source files under application/package `src` directories,
49 domain files including the barrel, and 54 SQL migrations. Counts describe this
snapshot, not a release metric. The 278 unique API routes come from 281 literal
registrations; three Stripe paths have conditional enabled/disabled implementations.

## 1. Prior-attempt feature-status claims (dated; for requirement carry-over decisions)

How to use: for each row decide *adopt as requirement / redesign / drop* in the feature specifications (05_) and record the choice under **L-B23-02**. Do not treat the right-hand text as a status of this project. The table is verbatim from the legacy file's "Feature status and important implementation limits" section (table only), with legacy links removed.

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

Provenance of the figures around that table: 173 canonical feature ids (F-01..F-173) and 248 business rules (BR-nn) were requirements in the prior registries (their target-side crosswalks are `../28_TRACEABILITY_AND_COVERAGE/` and OPEN-41/OPEN-43); the 173-row historical feature matrix and all detailed sub-feature acceptance were "unverified" in the prior attempt and "no new production-ready feature count is asserted".

## 2. Domain-module map (49 modules) and candidate target domains

The prior attempt's pure-logic modules (one file each under its domain package) are the best single list of *business behaviours already modelled*. Candidate mapping to this blueprint's domains is **suggested and unapproved**; ambiguous modules are marked "?" for the Domain Architect.

| Prior module | Candidate target domain |
|---|---|
| activity-contributions | DOM-21 Analytics / DOM-15 engagement ? |
| admin | DOM-20 |
| ai-gateway | DOM-17 |
| alumni-networks | DOM-18 Institutions / DOM-14 ? |
| analytics | DOM-21 |
| application-drafts | DOM-10 |
| application-feedback | DOM-10 |
| applications | DOM-10 |
| assessment, challenges | DOM-07 |
| auth | DOM-01 |
| background-jobs | DOM-24 |
| behavioral-talent-discovery, talent-pool-intelligence, talent-segmentation | DOM-11 matching/search ? (recruiter intelligence; privacy review needed) |
| billing, stripe-billing | DOM-16 |
| career-trajectory, salary-intelligence, skill-forecasting, learning-impact | DOM-12 Career Intelligence |
| core | shared kernel (leaf module) |
| employer-reputation, instructor-reputation, reputation-engine, peer-credibility | DOM-06 Verification & Trust / DOM-19 ? (needs owner mapping) |
| evidence | DOM-05 |
| gamification | DOM-08 Learning / DOM-15 ? |
| input-security | platform security utilities (SEC-02) |
| job-templates, jobs, saved-searches | DOM-09 |
| lms | DOM-08 |
| messaging | DOM-13 |
| moderation | DOM-19 |
| networking, referral-requests, warm-introductions | DOM-14 Networking |
| notifications | DOM-15 |
| portfolio, profile, resumes | DOM-03 |
| search | DOM-11 |
| settings | DOM-22 Privacy, Consent & Data Rights / DOM-01 |
| skill-decay, skills | DOM-04 Skills Graph (decay: DOM-05/12 ?) |
| technical-interview | DOM-10 Applications & Hiring (interview) / DOM-07 ? |
| work-history-graph | DOM-06 |

The verbatim module table (entry symbols and the prior attempt's test candidates) follows. Test file names are prior-attempt names and exist nowhere in this repository; they are useful as a checklist of *which behaviours were unit-tested*.

This table covers every domain source module. Symbols locate implementation;
unit/integration tests are evidence candidates, not freshly executed passes.
Pure helpers can be implemented while the encompassing feature remains partial.
Storage and authorization are determined by API/store wiring, not these filenames.

| Module | Existing behavior / entry symbols | Test candidates |
| --- | --- | --- |
| activity-contributions.ts | `determineEngagementBand`, `recordActivityEvent`, `calculateContributionScores` | activity-contributions.test.ts, activity-contributions-domain.test.ts |
| admin.ts | `assertPlatformAdmin`, `computeSystemHealth`, `validateUserStatusTransition`, `updateFeatureFlagState`, `createAdminAuditLog` | admin.test.ts, admin-domain.test.ts |
| ai-gateway.ts | `estimateTokens`, `sanitizePromptInput`, `assertWithinAIQuota`, `createAIConversationEntity`, `generateCareerAssistantResponse` | ai-gateway.test.ts, ai-gateway-domain.test.ts |
| alumni-networks.ts | `validateGraduationYear`, `createAlumniAffiliation`, `verifyAffiliationBySeatCode`, `filterAlumniDirectory`, `createAlumniGroup`; additional helpers in source | alumni-networks.test.ts, alumni-networks-domain.test.ts |
| analytics.ts | `sanitizeAnalyticsMetadata`, `recordAnalyticsEvent`, `computeKPIs` | analytics.test.ts, analytics-domain.test.ts |
| application-drafts.ts | `saveApplicationDraft`, `restoreApplicationDraftVersion`, `markDraftSubmitted` | application-drafts.test.ts, application-drafts-domain.test.ts |
| application-feedback.ts | `createApplicationFeedback`, `requestApplicationFeedback`, `markFeedbackViewed`, `computeFeedbackAggregateInsights`, `createFeedbackTemplate` | application-feedback.test.ts, application-feedback-domain.test.ts |
| applications.ts | `submitJobApplication`, `transitionApplicationState` | jobs-applications.test.ts, jobs-applications-domain.test.ts |
| assessment.ts | `assertAIAssistanceAllowed`, `startAssessmentSession`, `evaluateChallengeSubmission`, `calculateCappedXp` | challenges-assessment.test.ts, challenges-assessment-domain.test.ts |
| auth.ts | `configuredPasswordIterations`, `hashPassword`, `verifyPassword`, `passwordNeedsRehash`, `createSessionToken`; additional helpers in source | auth-profile.test.ts |
| background-jobs.ts | `computeBackoffMs`, `decideFailure`, `withoutSecrets`, `truncateError`, `createPgJobStore` | background-jobs.test.ts |
| behavioral-talent-discovery.ts | `validateBehavioralWeights`, `computeActivityScore`, `computePeerCredibilityScore`, `computeLearningVelocityScore`, `computeEmergingExpertiseScore`; additional helpers in source | behavioral-talent-discovery.test.ts, behavioral-talent-discovery-domain.test.ts |
| billing.ts | `getPlanEntitlements`, `validateMonetizationIntegrity`, `createSubscription`, `cancelSubscription`, `settleSubscription`; additional helpers in source | billing.test.ts, stripe-billing.test.ts |
| career-trajectory.ts | `recordCareerTransition`, `calculateWilsonConfidenceInterval`, `calculateCareerTransitionProbability`, `generateProgressionPathways`, `projectSalaryTrajectory`; additional helpers in source | career-trajectory.test.ts, career-trajectory-domain.test.ts |
| challenges.ts | `createChallenge`, `filterChallengeForCandidate` | challenges-assessment.test.ts, challenges-assessment-domain.test.ts |
| core.ts | `canTransitionApplication`, `isAIAssistanceAllowed` | core-notifications.test.ts |
| employer-reputation.ts | `ratingToScore`, `determineEmployerReputationBand`, `trimOutlierEmployerReviews`, `calculateEmployerReputation`, `createEmployerReview` | employer-reputation.test.ts, employer-reputation-domain.test.ts |
| evidence.ts | `createEvidence`, `verifyEvidence`, `disputeEvidence`, `revokeEvidence`, `generatePublicProof` | evidence-skills.test.ts, evidence-skills-domain.test.ts |
| gamification.ts | `calculateLevel`, `updateStreak`, `processXpAward`, `evaluateEligibleBadges`, `computeLeaderboard` | gamification.test.ts, gamification-domain.test.ts |
| index.ts | Public re-export barrel | Inspect shared/integration coverage; no same-name suite association |
| input-security.ts | `assertNoSqlInjection`, `assertSafeSqlIdentifier`, `escapeHtml`, `assertNoXssPayload`, `isPrivateIpv4`; additional helpers in source | Inspect shared/integration coverage; no same-name suite association |
| instructor-reputation.ts | `trimOutlierReviews`, `calculateCourseQualityScore`, `calculateTeachingEffectivenessScore`, `calculateCurrencyScore`, `calculateResponsivenessScore`; additional helpers in source | instructor-reputation.test.ts, instructor-reputation-domain.test.ts |
| job-templates.ts | `createJobTemplate`, `updateJobTemplate`, `archiveJobTemplate`, `instantiateJobFromTemplate` | job-templates.test.ts, job-templates-domain.test.ts |
| jobs.ts | `canTransitionJob`, `createJobPosting`, `transitionJobStatus` | jobs-applications.test.ts, background-jobs.test.ts |
| learning-impact.ts | `recordLearningOutcome`, `computeLearningImpactMetrics`, `aggregateLearningImpactDashboard` | learning-impact.test.ts, learning-impact-domain.test.ts |
| lms.ts | `validateCoursePublishReadiness`, `enrollUserInCourse`, `verifySequentialModuleProgress`, `verifyLessonPrerequisites`, `calculateCourseProgress`; additional helpers in source | lms-courses.test.ts, lms-domain.test.ts |
| messaging.ts | `createThreadEntities`, `assertThreadParticipant`, `createMessageEntity`, `calculateUnreadCount` | messaging-rules.test.ts, messaging.test.ts |
| moderation.ts | `scanContentForAbuse`, `createModerationReport`, `assertModeratorAuthority`, `transitionReportStatus`, `resolveModerationReport`; additional helpers in source | moderation.test.ts, moderation-domain.test.ts |
| networking.ts | `requestConnection`, `acceptConnection`, `rejectConnection`, `withdrawConnection`, `areConnected`; additional helpers in source | networking.test.ts, networking-domain.test.ts |
| notifications.ts | `createDefaultNotificationPreferences`, `shouldDeliverNotification`, `createNotificationEntity`, `markNotificationsAsRead`, `candidateApplicationUpdate` | core-notifications.test.ts, notifications.test.ts |
| peer-credibility.ts | `calculateNetworkDistanceFactor`, `normalizeEndorserCredibility`, `calculateTrackRecordMultiplier`, `computeEndorsementWeight`, `createSkillEndorsement`; additional helpers in source | peer-credibility.test.ts, peer-credibility-domain.test.ts |
| portfolio.ts | `createPortfolioProject`, `updatePortfolioProject`, `canViewPortfolioProject` | portfolio.test.ts, portfolio-domain.test.ts |
| profile.ts | `createProfileEntity`, `updateProfileEntity`, `canViewProfile` | auth-profile.test.ts |
| referral-requests.ts | `createReferralRequest`, `respondToReferralRequest` | referral-requests.test.ts, referral-requests-domain.test.ts |
| reputation-engine.ts | `determineReputationBand`, `createReputationSignal`, `calculateReputationScore`, `startReputationRecoveryPlan`, `completeRecoveryTask` | reputation-engine.test.ts, reputation-engine-domain.test.ts |
| resumes.ts | `createResumeEntity`, `updateResumeEntity`, `renderResumeToMarkdown`, `createResumeExport`, `softDeleteResumeExport` | resumes.test.ts, resumes-domain.test.ts |
| salary-intelligence.ts | `calculateVerificationWeight`, `detectSalaryOutlier`, `createSalaryReport`, `withdrawSalaryReport`, `computeSalaryAggregates`; additional helpers in source | salary-intelligence.test.ts, salary-intelligence-domain.test.ts |
| saved-searches.ts | `createSavedSearch`, `updateSavedSearch`, `matchJobAgainstCriteria`, `evaluateJobAlertsForPublishedJob`, `createSavedJob`; additional helpers in source | saved-searches.test.ts, saved-searches-domain.test.ts |
| search.ts | `levenshteinDistance`, `scoreSearchMatch`, `generateAutocompleteSuggestions`, `rankSearchResults`, `getAvailableCommands`; additional helpers in source | saved-searches.test.ts, search.test.ts |
| settings.ts | `createDefaultUserSettings`, `updateUserSettings`, `requestAccountErasure`, `cancelAccountErasure`, `executeLogicalAnonymization`; additional helpers in source | settings.test.ts, settings-contract.test.ts |
| skill-decay.ts | `getCategoryHalfLifeDays`, `calculateFreshnessScore`, `createSkillFreshnessRecord`, `reverifySkill` | skill-decay.test.ts, skill-decay-domain.test.ts |
| skill-forecasting.ts | `recordSkillMarketSignal`, `computeSkillForecast`, `rankTopEmergingSkills` | skill-forecasting.test.ts, skill-forecasting-domain.test.ts |
| skills.ts | `wouldCreatePrerequisiteCycle`, `createSkillRelationship`, `traverseSkillGraph` | evidence-skills.test.ts, evidence-skills-domain.test.ts |
| stripe-billing.ts | `buildPriceCatalog`, `mapStripeStatus`, `entitledTier`, `reconcileStripeSubscription`, `invoiceFromStripe` | stripe-billing.test.ts, stripe-billing-domain.test.ts |
| talent-pool-intelligence.ts | `validateCandidatePoolEligibility`, `createTalentPool`, `addCandidateToPool`, `updatePoolMemberStatus`, `computePoolSkillComposition`; additional helpers in source | talent-pool-intelligence.test.ts, talent-pool-intelligence-domain.test.ts |
| talent-segmentation.ts | `classifyCandidateSpecialization`, `classifySeniorityTier`, `classifyEngagementSegment`, `classifyReadinessBand`, `classifyCandidate`; additional helpers in source | talent-segmentation.test.ts, talent-segmentation-domain.test.ts |
| technical-interview.ts | `createInterviewQuestion`, `scheduleInterviewAssessment`, `joinInterviewAssessment`, `updateRecordingConsent`, `endInterviewAssessment`; additional helpers in source | technical-interview.test.ts, technical-interview-domain.test.ts |
| warm-introductions.ts | `discoverWarmIntroPaths`, `createWarmIntroRequest`, `respondToIntroRequest` | warm-introductions.test.ts, warm-introductions-domain.test.ts |
| work-history-graph.ts | `validateWorkHistoryDates`, `calculateTenureMonths`, `extractDomain`, `verifyCorporateEmailDomain`, `calculateVerificationScoreAndBadge`; additional helpers in source | work-history-graph.test.ts, work-history-graph-domain.test.ts |


## 3. Algorithms and decision logic reported (prior attempt) - business formulae to evaluate

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

**Target requires:** each formula/threshold above is a candidate business rule to adopt, redesign or retire (OPEN-43). Specific cautions already identified: skill decay half-life formula `100 * 0.5^(days / categoryHalfLife)` and the reputation signal decay are separate policies, "do not merge their policies merely because both use half-lives"; peer endorsement weight clamp 0.05..2.0; cohort floors (salary benchmark 5, salary company 3, learning-impact 30, segmentation default 10, career benchmark 20 distinct people) are separate source policies and do not prove the SSOT-wide k = 10 or differential-privacy claims - reconcile under OPEN-25. Wilson confidence intervals for transition probabilities require provenance of real outcomes.

## 4. Documentation structure and consolidation decisions of the prior attempt

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
| Root `ORIGINAL_REQUEST.md` | Original Windows maintenance requirements in maintenance archive |
| Root `TEST_READY.md` | Full dated test record and defect note in maintenance archive |
| Root `PROJECT.md` | Byte-identical existing .agents plan; linked from maintenance archive |
| `HOSTED_SUPABASE_DEPENDENCY_AUDIT.md` | Hosted migration gate, including static audit command and prerequisites |

137 substantive API-reference lines and 51 database-reference lines previously
matched SSOT verbatim. Their target registers now link to SSOT; unique contract,
provider-boundary, data-lifecycle and migration requirements were preserved.
Dated results remain labelled historical. Different-purpose documents are retained
rather than merged solely to reduce a count. No SSOT content was removed or edited.

Classification of its 197 tracked Markdown files (counts computed for this merge from the file-by-file table; the per-file rows are preserved in the archive and not copied here because they are provenance of tool and agent artefacts):

| Classification (prior attempt) | Rows |
|---|---|
| Historical agent briefing / plan / evidence (the `.agents` collaboration archive) | 116 |
| Historical evidence or proposed plan (dated reports) | 18 |
| Tooling / agent instruction | 16 |
| Living navigation / technical / policy reference | 16 |
| Requirements / design / portfolio intent | 10 |
| Source model or dated evidence (system-model files) | 7 |
| Protected deployment reference (deploy and operator docs) | 3 |
| Personal vault / template | 2 |
| Generated graph snapshot | 2 |
| Consolidated and retired (original request, plan, test record, dependency audit) | 4 |
| Compatibility pointer; canonical intent; manual hosted adapter note | 3 |
| **Total** | **197** |

The substantive part of that classification (rows for documents outside `.agents/`) is included verbatim because it records how the prior attempt classified each important document and which ones were consolidated or retired:

| File | Classification / disposition |
| --- | --- |
| `ORIGINAL_REQUEST.md` | Consolidated: original requirements retained in maintenance archive |
| `PROJECT.md` | Consolidated: byte-identical plan retained in `.agents/teamwork/orchestrator_1/PROJECT.md` |
| `TEST_READY.md` | Consolidated: historical test evidence retained in maintenance archive |
| `docs/engineering/HOSTED_SUPABASE_DEPENDENCY_AUDIT.md` | Consolidated: hosted migration gate owns dependency audit |
| .claude/commands/reticle.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| .claude/skills/autofix/SKILL.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| .claude/skills/autofix/github.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| .claude/skills/code-review/SKILL.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| .claude/skills/code-review/references/auth-recovery.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| .claude/skills/code-review/references/cli-workflows.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| .github/copilot-instructions.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| AGENTS.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| ARCHITECTURE.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| BRAIN/BRAIN.md | Requirements/design/portfolio intent; retained, not implementation proof |
| BRAIN/MEMORY.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| CLAUDE.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| GEMINI.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| README.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md (retired root pointer; the report lives at `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`) | Compatibility pointer to retained report; no duplicated report body |
| RETICLE.md | Tooling/agent instruction; retained for distinct consumer, not feature status |
| SSOT.md | Canonical intended requirements; preserved byte-for-byte |
| TalentSphere/Welcome.md | Personal vault/template; preserved, outside technical authority |
| TalentSphere/create a link.md | Personal vault/template; preserved, outside technical authority |
| deploy/oracle/NEW_SUPABASE_PROJECT.md | Protected deployment reference; read-only, live behavior unverified |
| deploy/oracle/README.md | Protected deployment reference; read-only, live behavior unverified |
| deploy/oracle/RECOVERY.md | Protected deployment reference; read-only, live behavior unverified |
| docs/INDEX.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/engineering/API_CONTRACTS.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/engineering/CODE_STYLE.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/engineering/DATABASE.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/engineering/PROJECT_MAINTENANCE.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/engineering/TARGET_ARCHITECTURE.md | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/engineering/TRD.md | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/engineering/adr/ADR-015-core-loop-persistence.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/experience/APP_FLOW.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/experience/JOURNEY_REGISTRY.md | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/experience/UI_UX_DESIGN_SYSTEM.md | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/governance/GAP_ANALYSIS.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/governance/GOVERNANCE.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/governance/IMPLEMENTATION_PLAN.md (retired 2026-10-26; see `docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md` Appendix A/B; original in git history) | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/governance/SOURCE_RECONCILIATION.md (retired 2026-10-26; see `docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md` Appendix A/B; original in git history) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/product/PRD.md | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/quality/OPERATIONS.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/quality/SECURITY.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/quality/TESTING.md | Living navigation/technical/policy reference; retains distinct topic ownership |
| docs/registries/BUSINESS_RULE_REGISTRY.md | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/registries/FEATURE_REGISTRY.md | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md (retired 2026-10-26; see `docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md` Appendix A/B; original in git history) | Requirements/design/portfolio intent; retained, not implementation proof |
| docs/reports/ARCHITECTURE_DURABILITY_REPORT.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/AUDIT_MASTER_REPORT.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/E2E_AUDIT_2026-10-21.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/FEATURE_PLAN_2026-10-21.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/FEATURE_STATUS_2026-10-21.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/FEATURE_TRACEABILITY_MATRIX.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/FINAL_VALIDATION_REPORT.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/GIT_RECONCILIATION_REPORT.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/MAINTENANCE_AUDIT_2026-10-21.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/PAYMENT_AUDIT_2026-10-23.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/PRODUCTION_AUDIT_2026-10-03.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/RELEASE_SCOPE_AND_BACKLOG.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/superpowers/plans/2026-10-21-project-maintenance.md (retired 2026-10-26; see `docs/final-project-documentation/08-ROADMAP-AND-DECISIONS.md` Appendix A/B; original in git history) | Historical evidence or proposed plan; runtime assertions unverified by this pass |
| docs/system-model/00-index.md | Source model or dated evidence; coverage/verification limits explicit |
| docs/system-model/01-inventory-and-coverage.md | Source model or dated evidence; coverage/verification limits explicit |
| docs/system-model/02-flows.md | Source model or dated evidence; coverage/verification limits explicit |
| docs/system-model/03-conflict-register.md | Source model or dated evidence; coverage/verification limits explicit |
| docs/system-model/04-conditions.md | Source model or dated evidence; coverage/verification limits explicit |
| docs/system-model/05-audit.md | Source model or dated evidence; coverage/verification limits explicit |
| docs/system-model/06-route-authorization.md | Source model or dated evidence; coverage/verification limits explicit |
| graphify-out/2026-10-23/GRAPH_REPORT.md | Generated graph snapshot; retained, not implementation acceptance |
| graphify-out/GRAPH_REPORT.md | Generated graph snapshot; retained, not implementation acceptance |
| supabase/hosted/README.md | Manual adapter sequence and historical partial deployment; current applied state unverified |

**Retained-home findings relevant to this project:** the hosted dependency audit became the hosted gate (merged in the database file); the maintenance utility's request and test evidence were moved to a reports archive (outside this subset); a personal Obsidian vault folder and the generated knowledge-graph reports are not documentation cleanup candidates; four documents (implementation plan, source reconciliation, workflows-and-business-rules, a maintenance plan) were retired on 2026-10-26 with a pointer to the prior attempt's consolidated documentation set (its roadmap-and-decisions appendices; that set is now under `30_PRIOR_IMPLEMENTATION_REFERENCE`, another merge agent's scope).

## 5. Repository size, API surface and removed sample data (earlier inventory, historical)

Coverage statement of the earlier inventory (kept because it defines how little was actually inspected):

## Coverage statement (read this first)

This model does **not** claim that 100% of the repository was inspected. The terms below are used strictly.

| Term         | Meaning here                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Discovered   | The file or route exists in the git tree or in a source listing.                               |
| Inspected    | A person or agent read the relevant lines and cited them as `path:line`.                       |
| Verified     | Inspected, and a test or command run during this work exercised the behaviour.                 |

Only the areas listed in `02-flows.md` were inspected for flow modelling. `apps/api/src/server.ts` is one 13,000-line file with 278 unique routes; each route was discovered, but only the routes named in the flow documents were inspected. Everything else is "discovered, not inspected".

Not accessible from this work: the GitHub issue and PR threads beyond what the public API returned, the live Stripe and Supabase projects' contents beyond a read-only look at Supabase migrations and advisors, and any production deployment. Documentation was read selectively (see the conflict register for what was compared).

Repository size and API surface at that time:

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

**Sample, mock and fabricated data removed from the running application (the hazard to design out):**

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

**Target requires:** (1) only two kinds of seed data ever ship: reference data (canonical skills taxonomy with source, feature-flag defaults) and clearly synthetic data in test fixtures created through the public API or factories; (2) a CI check that no seed block in production code paths inserts people, organizations, outcomes or statistics; (3) empty-state UI for every statistic that lacks data ("insufficient data", never a made-up figure).

## 6. Validation and remaining work of the prior documentation pass (historical)

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

Limits from the prior audit (testing file section 6 holds the audit method): not every route, page and migration was read; per-route validation schemas and storage SQL for many groups were unread; GitHub issue threads were read through the public API only; the Supabase project was inspected read-only and held one keepalive migration and no application tables; "no production or staging behaviour was observed".

## 7. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B23-02 | For each prior feature-status row: adopt / redesign / drop as a requirement | Product Director (OPEN-41, OPEN-42) |
| L-B23-03 | Does any earlier database or hosted project hold real users or data (the prior hosted project was reported to contain one keepalive migration and empty tables as of one observation)? | Program Director + CPO (OPEN-17) |
| L-B23-04 | Map the 49 prior modules to target domains (table in section 2 is a suggestion only) | Domain Architect |

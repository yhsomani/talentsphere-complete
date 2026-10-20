# Graph Report - talentsphere-complete  (2026-10-20)

## Corpus Check
- Large corpus: 464 files · ~522,113 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2581 nodes · 5602 edges · 147 communities (121 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 95 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Domain Input Types
- API Server Bootstrap
- Test Fixtures & Seed Accounts
- Frontend Candidate Models
- Migration & PNG Utilities
- Job Queue & Email Delivery
- App Assembly & Work History
- Shared UI Component Props
- Account Metadata Stores
- Web App Package Manifest
- Session & Storage Types
- Fastify Service Manifest
- Storage Backends
- Saved Row Persistence
- API Package Manifest
- Work History & Employment Types
- Saved Jobs Store
- Card & Assessment Models
- Instructor Endorsements & Metrics
- Auth Forms & Roles
- Saved Search Store
- Interview Assessment Domain
- Core Store Operations
- Worker Package Manifest
- Candidate Skill Diversity Analytics
- Session & Registration Flows
- Course Certificates & Enrollment
- Webhook Signing & Auth
- Data Erasure Requests
- Conversations & Notifications State
- Notification Preferences
- Navigation & PWA Shell
- Alumni Groups & Mentorship
- Career Milestone Readiness
- Moderation & Appeals
- Salary Benchmarking
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Coding Challenges & Submissions
- Gamification & Badges
- Candidate Engagement Segmentation
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Billing & Subscriptions
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Input Sanitization & Security Guards
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Workspace Config Files
- Server Env & Startup
- AI Conversation Models
- Application Drafts
- Module: behavioral-talent-discovery.ts
- Module: search.ts
- Module: persist() and PgCoreStore (ADR-015)
- Module: Jobs page desktop fold screenshot
- Module: EvidenceStatus
- Module: resumes.ts
- Module: ../tsconfig.json
- Module: Safe implementation order
- Module: application-feedback.ts
- Module: employer-reputation.ts
- Module: peer-credibility.ts
- Module: audit.ts
- Module: Assessments page desktop fold screenshot
- Module: Client bundle server-only secret scan
- Module: Transactional email operational gate (op
- Module: admin.ts
- Module: auth.ts
- Module: core.ts
- Module: Drive it where the human can see
- Module: CoreSnapshot
- Module: queue.ts
- Module: No abstraction before real reuse need
- Module: Partial JSON data export (no statutory c
- Module: config/src/index.ts
- Module: job-templates.ts
- Module: learning-impact.ts
- Module: networking.ts
- Module: portfolio.ts
- Module: skill-decay.ts
- Module: Candidate Career Cockpit (desktop dashbo
- Module: Central AI Gateway / Orchestrator
- Module: activity-contributions.ts
- Module: generatePublicProof()
- Module: referral-requests.ts
- Module: warm-introductions.ts
- Module: F-04 Job Marketplace
- Module: BR-015 No duplicate active application p
- Module: analytics.ts
- Module: applications.ts
- Module: skill-forecasting.ts
- Module: concurrency.test.ts
- Module: pg/messaging.test.ts
- Module: Login page desktop fold screenshot (befo
- Module: License key handling
- Module: Never list for AI coding agents
- Module: Migrations run manually, never on public
- Module: Canonical mutation flow (authn, authz, v
- Module: integration/work-history-removal.test.ts
- Module: api service (Fastify, STORAGE=pg, BILLIN
- Module: Oracle staging README overview
- Module: persist() single-transaction write path 
- Module: durability.ts
- Module: Accessibility release gate (WCAG 2.2 AA)
- Module: Candidate core flow (landing to next act
- Module: core-authz.test.ts
- Module: core-notifications.test.ts
- Module: Claim vs Evidence principle
- Module: Non-goals (no social clone, no HR suite,
- Module: Accessibility test known limits (no cont
- Module: F-01 Authentication and Session
- Module: Central AI Gateway / Orchestrator
- Module: Application state machine (draft to subm
- Module: profile.ts
- Module: messaging-rules.test.ts
- Module: verify-restore.sh
- Module: Architectural reconciliation invariants 
- Module: Release preflight script modes (pre-0004
- Module: Account state enforced per request (susp
- Module: PostgreSQL must not publish host ports
- Module: Completion report requirements
- Module: background_jobs durable dispatch chain
- Module: Candidate Career Cockpit (mobile dashboa
- Module: Reticle onboarding modal (tablet viewpor
- Module: Verified Work History page (mobile evide
- Module: Reticle onboarding modal (tablet evidenc
- Module: backup.sh
- Module: Do not start downstream work merely beca
- Module: Phase exit gates (user outcome, security
- Module: Five-layer defense in depth (client, edg
- Module: Dual-queue boundary (transactional Postg
- Module: Executable evidence measured 2026-10-14 
- Module: Canonical business rules BR-001 to BR-24

## God Nodes (most connected - your core abstractions)
1. `buildApp()` - 273 edges
2. `DomainError` - 204 edges
3. `vitest` - 121 edges
4. `@playwright/test` - 50 edges
5. `usePageMeta()` - 42 edges
6. `react` - 41 edges
7. `Notice()` - 40 edges
8. `createSessionToken()` - 39 edges
9. `Button()` - 33 edges
10. `apiJson()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Reticle verdict on sign-up to apply flow` --conceptually_related_to--> `Verifying with Reticle`  [INFERRED]
  BRAIN/MEMORY.md → CLAUDE.md
- `Claim vs Evidence principle` --semantically_similar_to--> `Talent Graph and Evidence Graph`  [INFERRED] [semantically similar]
  BRAIN/BRAIN.md → SSOT.md
- `boot()` --calls--> `buildApp()`  [EXTRACTED]
  tests/pg/concurrency.test.ts → apps/api/src/server.ts
- `boot()` --calls--> `buildApp()`  [EXTRACTED]
  tests/pg/core-persistence.test.ts → apps/api/src/server.ts
- `boot()` --calls--> `buildApp()`  [EXTRACTED]
  tests/pg/messaging.test.ts → apps/api/src/server.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ADR-015 core-loop persistence decision** — docs_engineering_adr_adr_015_core_loop_persistence_write_path, docs_engineering_adr_adr_015_core_loop_persistence_single_writer, docs_engineering_adr_adr_015_core_loop_persistence_optimistic_concurrency, docs_engineering_adr_adr_015_core_loop_persistence_read_model [EXTRACTED 1.00]
- **Assessments page captured at desktop, tablet and mobile widths** — _audit_before_assessments_desktop_fold, _audit_before_assessments_tablet_fold, _audit_before_assessments_mobile_fold, _audit_before_assessments_desktop_fold_proctored_capability_assessments [EXTRACTED 1.00]
- **Jobs page responsive fold captures** — audit_before_jobs_desktop_fold, audit_before_jobs_mobile_fold, audit_before_jobs_tablet_fold [EXTRACTED 1.00]
- **Landing page responsive fold captures** — audit_before_landing_desktop_fold, audit_before_landing_mobile_fold, audit_before_landing_tablet_fold [EXTRACTED 1.00]
- **Checkout page captured at desktop, tablet and mobile widths** — _audit_before_checkout_desktop_fold, _audit_before_checkout_tablet_fold, _audit_before_checkout_mobile_fold, _audit_before_checkout_desktop_fold_checkout_plan_subscriptions [EXTRACTED 1.00]
- **Oracle staging compose services** — deploy_oracle_compose_db, deploy_oracle_compose_api, deploy_oracle_compose_worker, deploy_oracle_compose_web, deploy_oracle_compose_internal_network [EXTRACTED 1.00]
- **AI governance controls (gateway, human gate, free-user cost, assessment prohibition)** — docs_registries_workflows_and_business_rules_ai_gateway, docs_registries_workflows_and_business_rules_human_gate, docs_registries_workflows_and_business_rules_free_cost_invariant, docs_registries_workflows_and_business_rules_assessment_ai_prohibited [INFERRED 0.75]
- **Backup and restore verification chain** — deploy_oracle_recovery_backup_script, deploy_oracle_recovery_restore_verification, deploy_oracle_recovery_offsite_backup_requirement, docs_governance_gap_analysis_verification_gaps [INFERRED 0.75]
- **Production blockers named in the 2026-10-03 audit** — docs_reports_production_audit_2026_10_03_demo_auth_fallback_p0_01, docs_reports_production_audit_2026_10_03_in_memory_persistence_p0_04, docs_reports_production_audit_2026_10_03_ci_typecheck_red_p0_08 [INFERRED 0.75]
- **Reticle verification loop** — claude_verifying_with_reticle, claude_reticle_act_and_wait, claude_verdict_tools_rule, _claude_commands_reticle_drive_steps, reticle_full_rules [INFERRED 0.75]
- **Verification proof-of-control chain (email code, referee token, delivery provider)** — docs_quality_security_verification_credentials, docs_reports_improvement_program_2026_10_10_findings_table, docs_quality_operations_transactional_email_gate [INFERRED 0.75]
- **Authentication identity flow** — architecture_hmac_session_tokens, architecture_extract_user, architecture_supabase_auth_drift, ssot_f01_auth_session [INFERRED 0.85]
- **k-anonymity cohort privacy gates** — ssot_k_anonymity_thresholds, brain_memory_k_thresholds, ssot_f85_career_graph, ssot_f114_learning_impact, ssot_f86_salary_intelligence [INFERRED 0.85]
- **Login page responsive fold screenshots (desktop, tablet, mobile)** — _audit_before_login_desktop_fold, _audit_before_login_tablet_fold, _audit_before_login_mobile_fold [INFERRED 0.85]

## Communities (147 total, 26 thin omitted)

### Community 0 - "Domain Input Types"
Cohesion: 0.01
Nodes (151): RFC-5321, AddOrganizationMemberInput, AddPoolMemberInput, AddReputationSignalInput, AdminQueryAuditLogs, AdminSetMaintenanceModeInput, AdminToggleFeatureFlagInput, AdminToggleFeatureFlagInputSchema (+143 more)

### Community 1 - "API Server Bootstrap"
Cohesion: 0.02
Nodes (128): BuildAppEnv, ADR-0009, ADR-0015, AddOrganizationMemberInputSchema, AddPoolMemberInputSchema, AddReputationSignalInputSchema, AdminQueryAuditLogsSchema, AdminSetMaintenanceModeInputSchema (+120 more)

### Community 2 - "Test Fixtures & Seed Accounts"
Cohesion: 0.05
Nodes (22): @playwright/test, ROUTES, run, API_BASE, outbox(), PASSWORD, PublishedJob, publishJob() (+14 more)

### Community 3 - "Frontend Candidate Models"
Cohesion: 0.08
Nodes (54): ButtonLink(), CheckIcon(), APPLICATION_TONE, JOB_TONE, StatusPill(), Tone, TONE_STYLE, ApiError (+46 more)

### Community 4 - "Migration & PNG Utilities"
Cohesion: 0.06
Nodes (40): browserDist, findings, scanDirectory(), sentinels, serverOnly, textExtensions, crc32(), crcTable (+32 more)

### Community 5 - "Job Queue & Email Delivery"
Cohesion: 0.05
Nodes (39): ClaimCycleResult, ClaimHandler, logger, PermanentJobError, runClaimCycle(), runWithTimeout(), ADR-0009, APP_URL (+31 more)

### Community 6 - "App Assembly & Work History"
Cohesion: 0.08
Nodes (13): buildApp(), applyToReadModel(), computeGraphDistance(), currentRecord(), getAcceptedConnectionsGraph(), interviewAccess(), persist(), recordKey() (+5 more)

### Community 7 - "Shared UI Component Props"
Cohesion: 0.08
Nodes (34): BadgeProps, ButtonLinkProps, ButtonProps, sizeStyles, useButtonSurface(), variantStyles, EmptyStateProps, controlStyle (+26 more)

### Community 8 - "Account Metadata Stores"
Cohesion: 0.07
Nodes (26): AccountMetadataStore, ExportRow, fromExportRow(), fromSettingsRow(), MemoryAccountMetadataStore, PgAccountMetadataStore, SettingsRow, Profile (+18 more)

### Community 9 - "Web App Package Manifest"
Cohesion: 0.05
Nodes (35): dependencies, react, react-dom, react-router-dom, @talentsphere/ui, devDependencies, @reticlehq/react, @reticlehq/vite-plugin (+27 more)

### Community 10 - "Session & Storage Types"
Cohesion: 0.10
Nodes (30): App(), guarded(), RequireAuth(), SearchXIcon(), apiFetch(), announce(), clearSession(), forgetSessionEnded() (+22 more)

### Community 11 - "Fastify Service Manifest"
Cohesion: 0.05
Nodes (40): author, description, devDependencies, fastify, pg, @playwright/test, prettier, @types/node (+32 more)

### Community 12 - "Storage Backends"
Cohesion: 0.07
Nodes (12): CoreStore, createStorage(), MemoryStorage, PgStorage, redactDsn(), Storage, StorageHealth, StorageMode (+4 more)

### Community 13 - "Saved Row Persistence"
Cohesion: 0.07
Nodes (19): SavedRow, boot(), databaseUrl, Json, ADR-0015, alice, ben, databaseUrl (+11 more)

### Community 14 - "API Package Manifest"
Cohesion: 0.05
Nodes (38): dependencies, fastify, @fastify/cors, @fastify/helmet, @fastify/rate-limit, pg, @talentsphere/config, @talentsphere/contracts (+30 more)

### Community 15 - "Work History & Employment Types"
Cohesion: 0.09
Nodes (32): assertCorporateEmailEligible(), BadgeTier, buildWorkHistoryGraph(), BuildWorkHistoryGraphParams, calculateTenureMonths(), calculateVerificationScoreAndBadge(), CONSUMER_WEBMAIL_DOMAINS, createWorkHistory() (+24 more)

### Community 16 - "Saved Jobs Store"
Cohesion: 0.09
Nodes (18): MemorySavedJobStore, PgSavedJobStore, SavedJobStore, toSavedJob(), Job, AlertFrequency, createSavedJob(), createSavedSearch() (+10 more)

### Community 17 - "Card & Assessment Models"
Cohesion: 0.16
Nodes (27): Badge(), Card(), CardContent(), CardDescription(), CardHeader(), CardProps, CardTitle(), AlertCircleIcon() (+19 more)

### Community 18 - "Instructor Endorsements & Metrics"
Cohesion: 0.11
Nodes (29): calculateCommunityStandingScore(), calculateCourseQualityScore(), calculateCurrencyScore(), calculateInstructorReputation(), calculateResponsivenessScore(), calculateTeachingEffectivenessScore(), createInstructorEndorsement(), CreateInstructorEndorsementParams (+21 more)

### Community 19 - "Auth Forms & Roles"
Cohesion: 0.25
Nodes (27): ChangePasswordForm(), SessionErrorNotice(), SignOutOtherDevices(), Button(), FieldShell(), Select(), TextArea(), Input() (+19 more)

### Community 20 - "Saved Search Store"
Cohesion: 0.13
Nodes (6): fromRow(), MemorySavedSearchStore, PgSavedSearchStore, Row, SavedSearchStore, SavedSearch

### Community 21 - "Interview Assessment Domain"
Cohesion: 0.12
Nodes (25): DomainError, compensateInterviewScorecard(), CompensateScorecardParams, createInterviewQuestion(), CreateInterviewQuestionParams, endInterviewAssessment(), executeInterviewCode(), generateAdvisoryAiFeedback() (+17 more)

### Community 22 - "Core Store Operations"
Cohesion: 0.10
Nodes (21): assertGuardHeld(), concurrentModification(), CoreOp, EmailChallenge, emptySnapshot(), iso(), isoRequired(), MemoryCoreStore (+13 more)

### Community 23 - "Worker Package Manifest"
Cohesion: 0.07
Nodes (26): dependencies, pg, @talentsphere/domain, @talentsphere/observability, devDependencies, @types/node, @types/pg, typescript (+18 more)

### Community 24 - "Candidate Skill Diversity Analytics"
Cohesion: 0.13
Nodes (25): addCandidateToPool(), AggregatedDiversityResult, CandidateSkill, CandidateSkillProfile, computeAggregatedDiversity(), computePipelineStages(), computePoolSkillComposition(), computePoolSkillGaps() (+17 more)

### Community 25 - "Session & Registration Flows"
Cohesion: 0.13
Nodes (5): createSessionToken(), adminToken, moderatorToken, adminToken, ADR-0009

### Community 26 - "Course Certificates & Enrollment"
Cohesion: 0.13
Nodes (21): calculateCourseProgress(), CertificateStatus, Course, CourseCertificate, CourseEnrollment, CourseLevel, CourseModule, CoursePublishValidationResult (+13 more)

### Community 27 - "Webhook Signing & Auth"
Cohesion: 0.14
Nodes (7): TEST_TOKEN_SECRET, TEST_WEBHOOK_SECRET, signWebhook(), ADMIN_ONLY_ROUTES, token(), Json, ADR-0015

### Community 28 - "Data Erasure Requests"
Cohesion: 0.17
Nodes (8): ErasureRequestStore, isActive(), MemoryErasureRequestStore, PgErasureRequestStore, Row, toRequest(), cancelAccountErasure(), DataErasureRequest

### Community 29 - "Conversations & Notifications State"
Cohesion: 0.21
Nodes (16): EmptyState(), PageHeader(), formatDateTime(), createStableKeyer(), StableKeyer, ConversationMessage, ConversationParticipant, ConversationSummary (+8 more)

### Community 30 - "Notification Preferences"
Cohesion: 0.13
Nodes (17): candidateApplicationUpdate(), createDefaultNotificationPreferences(), createNotificationEntity(), CreateNotificationParams, EmailDigestFrequency, markNotificationsAsRead(), Notification, NOTIFICATION_TYPES (+9 more)

### Community 31 - "Navigation & PWA Shell"
Cohesion: 0.18
Nodes (18): CANDIDATE_NAV, HIRING_NAV, HIRING_ROLES, initialsOf(), isActivePath(), Layout(), NavItem, PUBLIC_NAV (+10 more)

### Community 32 - "Alumni Groups & Mentorship"
Cohesion: 0.14
Nodes (19): AlumniAffiliation, AlumniDegreeType, AlumniGroup, AlumniGroupMember, AlumniMentorshipRequest, AlumniMentorshipStatus, AlumniVerificationMethod, AlumniVerificationStatus (+11 more)

### Community 33 - "Career Milestone Readiness"
Cohesion: 0.14
Nodes (19): calculateCareerTransitionProbability(), calculateWilsonConfidenceInterval(), CareerMilestoneReadiness, CareerTransition, DEFAULT_RISK_FACTORS, DEFAULT_ROLE_SKILL_REQUIREMENTS, DEFAULT_SUCCESS_FACTORS, EDUCATION_WEIGHTS (+11 more)

### Community 34 - "Moderation & Appeals"
Cohesion: 0.14
Nodes (19): ABUSIVE_PATTERNS, assertModeratorAuthority(), ContentScanResult, createModerationAppeal(), createModerationReport(), CreateModerationReportParams, ModerationAction, ModerationAppeal (+11 more)

### Community 35 - "Salary Benchmarking"
Cohesion: 0.16
Nodes (19): BenchmarkQueryResult, calculatePercentile(), calculateVerificationWeight(), CompanyBenchmarkResult, computeSalaryAggregates(), createSalaryReport(), detectSalaryOutlier(), queryCompanySalarySummary() (+11 more)

### Community 36 - "Workspace Config Files"
Cohesion: 0.10
Nodes (19): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, jsx, module (+11 more)

### Community 37 - "Workspace Config Files"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, @types/node, typescript, exports, @types/node, typescript (+11 more)

### Community 38 - "Workspace Config Files"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, @types/node, typescript, exports, @types/node, typescript (+11 more)

### Community 39 - "Coding Challenges & Submissions"
Cohesion: 0.16
Nodes (17): assertAIAssistanceAllowed(), calculateCappedXp(), evaluateChallengeSubmission(), startAssessmentSession(), SubmissionResult, ALLOWED_LANGUAGES, AllowedLanguage, Challenge (+9 more)

### Community 40 - "Gamification & Badges"
Cohesion: 0.17
Nodes (18): XpTransaction, Badge, BadgeCategory, calculateLevel(), computeLeaderboard(), DAILY_XP_CAP, DEFAULT_PLATFORM_BADGES, evaluateEligibleBadges() (+10 more)

### Community 41 - "Candidate Engagement Segmentation"
Cohesion: 0.17
Nodes (18): aggregateSegmentDistribution(), buildDistributionDimension(), CandidateClassificationInput, CandidateSegmentation, classifyCandidate(), classifyCandidateSpecialization(), classifyEngagementSegment(), classifyReadinessBand() (+10 more)

### Community 42 - "Workspace Config Files"
Cohesion: 0.10
Nodes (19): dependencies, @talentsphere/domain, devDependencies, @types/node, typescript, exports, @talentsphere/domain, @types/node (+11 more)

### Community 43 - "Workspace Config Files"
Cohesion: 0.11
Nodes (18): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+10 more)

### Community 44 - "Workspace Config Files"
Cohesion: 0.11
Nodes (18): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+10 more)

### Community 45 - "Workspace Config Files"
Cohesion: 0.11
Nodes (18): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+10 more)

### Community 46 - "Billing & Subscriptions"
Cohesion: 0.14
Nodes (17): BillingCycle, BillingEvent, cancelSubscription(), createSubscription(), CreateSubscriptionParams, CreateSubscriptionResult, Entitlements, getPlanEntitlements() (+9 more)

### Community 47 - "Workspace Config Files"
Cohesion: 0.11
Nodes (18): dependencies, pino, devDependencies, @types/node, typescript, exports, @types/node, typescript (+10 more)

### Community 48 - "Workspace Config Files"
Cohesion: 0.11
Nodes (18): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+10 more)

### Community 49 - "Workspace Config Files"
Cohesion: 0.11
Nodes (17): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+9 more)

### Community 50 - "Input Sanitization & Security Guards"
Cohesion: 0.16
Nodes (16): ALLOWED_URL_SCHEMES, assertNoSqlInjection(), assertNoXssPayload(), assertSafeSqlIdentifier(), DEFAULT_OUTBOUND_HOST_ALLOWLIST, escapeHtml(), HTML_ESCAPE_MAP, isPrivateIpv4() (+8 more)

### Community 51 - "Workspace Config Files"
Cohesion: 0.11
Nodes (17): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+9 more)

### Community 52 - "Workspace Config Files"
Cohesion: 0.11
Nodes (17): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+9 more)

### Community 53 - "Workspace Config Files"
Cohesion: 0.11
Nodes (17): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+9 more)

### Community 54 - "Workspace Config Files"
Cohesion: 0.12
Nodes (16): devDependencies, @types/node, typescript, exports, @types/node, typescript, main, name (+8 more)

### Community 55 - "Workspace Config Files"
Cohesion: 0.12
Nodes (16): devDependencies, @types/node, typescript, exports, @types/node, typescript, main, name (+8 more)

### Community 56 - "Workspace Config Files"
Cohesion: 0.12
Nodes (16): compilerOptions, composite, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution (+8 more)

### Community 57 - "Server Env & Startup"
Cohesion: 0.22
Nodes (11): main(), parseTrustProxy(), isDeployed(), isPublishedTestSecret(), MIN_DEPLOYED_PBKDF2_ITERATIONS, productionConfigProblems(), PUBLISHED_TEST_SECRET_SHA256, ServerEnv (+3 more)

### Community 58 - "AI Conversation Models"
Cohesion: 0.20
Nodes (14): AI_ADVISORY_DISCLAIMER, AI_QUOTA_LIMITS, AIConversation, AIEngineResponse, AIMessage, AIProvenance, AISenderRole, AITier (+6 more)

### Community 59 - "Application Drafts"
Cohesion: 0.18
Nodes (13): StoredUser, ApplicationDraft, ApplicationDraftVersion, markDraftSubmitted(), restoreApplicationDraftVersion(), saveApplicationDraft(), SaveDraftParams, SaveDraftResult (+5 more)

### Community 60 - "Module: behavioral-talent-discovery.ts"
Cohesion: 0.32
Nodes (13): BehavioralDiscoveryFilter, BehavioralTalentProfile, BehavioralWeights, CandidateRawSignals, clamp(), computeActivityScore(), computeEmergingExpertiseScore(), computeLearningVelocityScore() (+5 more)

### Community 61 - "Module: search.ts"
Cohesion: 0.23
Nodes (13): AutocompleteSuggestion, BASE_COMMANDS, CommandItem, createSearchHistoryRecord(), filterCommandsByQuery(), generateAutocompleteSuggestions(), getAvailableCommands(), levenshteinDistance() (+5 more)

### Community 62 - "Module: persist() and PgCoreStore (ADR-015)"
Cohesion: 0.18
Nodes (10): persist() and PgCoreStore (ADR-015), Current blockers: no email provider and owner decisions, Release blocked pending GitHub issues 44-50, Reticle verdict on sign-up to apply flow, Project memory status snapshot, Final Documentation Index v6.0, pnpm install, dev and test commands, Not production-ready status (+2 more)

### Community 63 - "Module: Jobs page desktop fold screenshot"
Cohesion: 0.19
Nodes (12): Jobs page desktop fold screenshot, Jobs page mobile fold screenshot, Jobs page tablet fold screenshot, Landing page desktop fold screenshot, Landing page mobile fold screenshot, Landing page tablet fold screenshot, Landing hero: The Career Operating System Built on Verified Evidence, Verifiable Career Opportunities page (governed matchmaking) (+4 more)

### Community 64 - "Module: EvidenceStatus"
Cohesion: 0.23
Nodes (13): EvidenceStatus, EvidenceType, VerificationLevel, CreateEvidenceParams, disputeEvidence(), EVIDENCE_STAFF, EvidenceRelationship, heldRole() (+5 more)

### Community 65 - "Module: resumes.ts"
Cohesion: 0.20
Nodes (12): createResumeEntity(), createResumeExport(), renderResumeToMarkdown(), Resume, ResumeEducation, ResumeExperience, ResumeExport, ResumeFormat (+4 more)

### Community 66 - "Module: ../tsconfig.json"
Cohesion: 0.14
Nodes (13): ../tsconfig.json, compilerOptions, composite, declaration, declarationMap, jsx, noEmit, noUnusedLocals (+5 more)

### Community 67 - "Module: Safe implementation order"
Cohesion: 0.17
Nodes (12): Safe implementation order, extractUser authentication helper, Current security gaps G-5 G-6 G-9 G-10, Supabase Auth documented but not integrated, F-01 Authentication and Session, F-123 Skill Decay Tracking, F-12 Profile Management, F-144 Reputation Engine (+4 more)

### Community 68 - "Module: application-feedback.ts"
Cohesion: 0.23
Nodes (11): ApplicationFeedback, computeFeedbackAggregateInsights(), createApplicationFeedback(), CreateApplicationFeedbackParams, createFeedbackTemplate(), CreateFeedbackTemplateParams, FeedbackReasonCategory, FeedbackStatus (+3 more)

### Community 69 - "Module: employer-reputation.ts"
Cohesion: 0.27
Nodes (11): calculateEmployerReputation(), CalculateEmployerReputationParams, createEmployerReview(), determineEmployerReputationBand(), EmployerFactorBreakdown, EmployerOperationalMetrics, EmployerReputationBand, EmployerReputationProfile (+3 more)

### Community 70 - "Module: peer-credibility.ts"
Cohesion: 0.28
Nodes (11): aggregateSkillEndorsements(), CalculateEndorsementWeightParams, calculateNetworkDistanceFactor(), calculateTrackRecordMultiplier(), computeEndorsementWeight(), createSkillEndorsement(), CreateSkillEndorsementParams, EndorsementWeightBreakdown (+3 more)

### Community 71 - "Module: audit.ts"
Cohesion: 0.17
Nodes (6): AuditEvent, AuditSink, InMemoryAuditSink, createLogger(), CreateLoggerOptions, pino

### Community 72 - "Module: Assessments page desktop fold screenshot"
Cohesion: 0.24
Nodes (12): Assessments page desktop fold screenshot, Proctored Capability Assessments page, Proctored code challenge cards (Staff Tier, Senior Tier) with Open Code Sandbox action, Reticle onboarding modal (Step 1 of 6, Yayyy! It is connected), Assessments page mobile fold screenshot, Assessments page tablet fold screenshot, Checkout page desktop fold screenshot, Checkout & Plan Subscriptions page (+4 more)

### Community 73 - "Module: Client bundle server-only secret scan"
Cohesion: 0.17
Nodes (11): Client bundle server-only secret scan, Migration idempotency check, Postgres 16 service container, CI verify job, Agent escalation categories, packages/domain pure business logic, Central DomainError to ErrorEnvelope handler, Architectural invariants INVARIANT-001 to 015 (+3 more)

### Community 74 - "Module: Transactional email operational gate (op"
Cohesion: 0.17
Nodes (8): Password hashing (PBKDF2-SHA512, 210000 iterations, decoy hash), Private-data RLS corrections (migrations 00047-00048) and their limits, Rate limiting (300 per minute per account, 429 RATE_LIMIT_EXCEEDED), Improvement program findings table (findings 1-37), Mutation checks proving regression tests catch their bugs, Remaining owner decisions (architecture, ADR ratification, pricing, email, legal, deletion, session token), Reticle in-app verification of the core loop, Three architectures in circulation (Fastify monolith, Next.js/Supabase blueprint, Spring Boot plan)

### Community 75 - "Module: admin.ts"
Cohesion: 0.23
Nodes (10): AdminAuditLog, AdminUserStatus, assertPlatformAdmin(), computeSystemHealth(), createAdminAuditLog(), FeatureFlag, SystemDiagnostics, SystemHealthStatus (+2 more)

### Community 76 - "Module: auth.ts"
Cohesion: 0.33
Nodes (9): configuredPasswordIterations(), derive(), hashPassword(), ParsedHash, parseStoredHash(), passwordNeedsRehash(), PBKDF2_DEFAULT_ITERATIONS, verifyPassword() (+1 more)

### Community 77 - "Module: core.ts"
Cohesion: 0.23
Nodes (9): ALLOWED_APPLICATION_TRANSITIONS, DomainErrorCode, ProfilePrivacy, UserStatus, ALLOWED_JOB_TRANSITIONS, canTransitionJob(), CreateJobParams, JobStatus (+1 more)

### Community 78 - "Module: Drive it where the human can see"
Cohesion: 0.22
Nodes (6): Drive it where the human can see, Pick ONE flow rule, Step 0 session check and setup ladder, Four dev server guards, reticle_act_and_wait tool, Verifying with Reticle

### Community 79 - "Module: CoreSnapshot"
Cohesion: 0.31
Nodes (9): CoreSnapshot, assertThreadParticipant(), calculateUnreadCount(), createMessageEntity(), createThreadEntities(), Message, MessageStatus, MessageThread (+1 more)

### Community 80 - "Module: queue.ts"
Cohesion: 0.20
Nodes (3): Job, JobHandler, JobQueueEngine

### Community 81 - "Module: No abstraction before real reuse need"
Cohesion: 0.22
Nodes (6): Code style v6.0 overview, Gap closure rule (owner, evidence, decision, test, acceptance), GAP_ANALYSIS v6.0 overview (design gap register), GOVERNANCE v6.0 overview (SSOT change control), Status lifecycle PLANNED to RELEASED, Documentation index v6.0

### Community 82 - "Module: Partial JSON data export (no statutory c"
Cohesion: 0.18
Nodes (8): Durable core loop vs ephemeral long-tail routes (x-talentsphere-durability header), P0-08 Main CI red at typecheck (TS2307 for workspace packages), P0-01 Login demo-token fallback treats failed auth as success, P0-04 Application state held in in-process Maps (lost on restart), P0 critical production blockers (P0-01 to P0-08), Production readiness scorecard (4.6 of 10), pnpm onlyBuiltDependencies and allowBuilds for esbuild, pnpm workspace package globs (apps/* and packages/*)

### Community 83 - "Module: config/src/index.ts"
Cohesion: 0.25
Nodes (7): CONSTANTS, ErrorEnvelopeSchema, PaginationQuerySchema, isAIAssistanceAllowed(), createMockEvidence(), createMockProfile(), createMockUser()

### Community 84 - "Module: job-templates.ts"
Cohesion: 0.25
Nodes (9): ActorContext, archiveJobTemplate(), createJobTemplate(), CreateJobTemplateParams, InstantiateJobFromTemplateOverrides, JobTemplate, ScreeningQuestion, updateJobTemplate() (+1 more)

### Community 85 - "Module: learning-impact.ts"
Cohesion: 0.27
Nodes (9): aggregateLearningImpactDashboard(), computeLearningImpactMetrics(), CORRELATION_DISCLAIMER_LABEL, LEARNING_IMPACT_MIN_COHORT, LearningImpactDashboard, LearningImpactMetrics, LearningOutcome, recordLearningOutcome() (+1 more)

### Community 86 - "Module: networking.ts"
Cohesion: 0.29
Nodes (9): acceptConnection(), areConnected(), Connection, ConnectionStatus, getConnectionBetween(), rejectConnection(), requestConnection(), RequestConnectionInput (+1 more)

### Community 87 - "Module: portfolio.ts"
Cohesion: 0.24
Nodes (9): canViewPortfolioProject(), createPortfolioProject(), CreatePortfolioProjectInput, PortfolioMediaType, PortfolioProject, PortfolioProjectMedia, PortfolioVisibility, updatePortfolioProject() (+1 more)

### Community 88 - "Module: skill-decay.ts"
Cohesion: 0.29
Nodes (9): calculateFreshnessScore(), CreateSkillFreshnessParams, createSkillFreshnessRecord(), getCategoryHalfLifeDays(), ReverificationSource, reverifySkill(), SkillDecayCategory, SkillFreshnessBand (+1 more)

### Community 89 - "Module: Candidate Career Cockpit (desktop dashbo"
Cohesion: 0.20
Nodes (10): Candidate Career Cockpit (desktop dashboard fold), KPI stat tiles (Verified Evidence 12, Skill Readiness 88%, Active Applications, Eligible Opportunities 6), Proctored Assessment Transcripts panel (benchmark scores), Reticle onboarding modal (Step 1 of 6, 'Yayyy! It is connected'), Begin Verification Challenge call-to-action, Verified Career Evidence list (signed employer attestations with credential tiers), Attest Employment Record call-to-action, Employment attestation card (domain attestation, structured reference, confidence integrity bar, tier badge) (+2 more)

### Community 90 - "Module: Central AI Gateway / Orchestrator"
Cohesion: 0.22
Nodes (5): Central AI Gateway / Orchestrator, Seven bounded contexts plus shared kernel, Architecture v6.0 overview (modular monolith), TRD v6.0 overview, Technical baseline stack (React, Fastify, PostgreSQL, Supabase)

### Community 91 - "Module: activity-contributions.ts"
Cohesion: 0.29
Nodes (8): ActivityCategory, ActivityEvent, calculateContributionScores(), ContributionScore, determineEngagementBand(), EngagementBand, recordActivityEvent(), RecordActivityEventParams

### Community 92 - "Module: generatePublicProof()"
Cohesion: 0.31
Nodes (8): generatePublicProof(), createSkillRelationship(), Skill, SkillGraphNode, SkillRelationship, SkillRelationshipType, traverseSkillGraph(), wouldCreatePrerequisiteCycle()

### Community 93 - "Module: referral-requests.ts"
Cohesion: 0.24
Nodes (8): createReferralRequest(), CreateReferralRequestParams, ReferralOutcome, ReferralOutcomeStatus, ReferralRequest, ReferralRequestStatus, RespondReferralRequestResult, respondToReferralRequest()

### Community 94 - "Module: warm-introductions.ts"
Cohesion: 0.29
Nodes (8): createWarmIntroRequest(), CreateWarmIntroRequestParams, discoverWarmIntroPaths(), IntroductionPath, respondToIntroRequest(), WarmIntroPreferences, WarmIntroRequest, WarmIntroStatus

### Community 95 - "Module: F-04 Job Marketplace"
Cohesion: 0.29
Nodes (10): F-04 Job Marketplace, F-06 ATS Candidate Pipeline, F-08 Challenges Arena, F-114 Learning Impact Tracking, F-122 Application Feedback Loop, F-84 Skills Graph and Taxonomy, F-85 Career Graph and Progression Benchmarks, F-86 Salary Intelligence (+2 more)

### Community 96 - "Module: BR-015 No duplicate active application p"
Cohesion: 0.31
Nodes (9): BR-015 No duplicate active application per user per job, BR-025 XP idempotent with 200 XP/day cap, BR-033 AI drafts never auto-commit to records, BR-141 Skills taxonomy curated by Platform Admin, BR-144 Every skill tag must reference a canonical skill, BR-164 Reputation score derived, never manually set, BR-167 Reputation private by default; recruiter visibility needs consent or active application, BR-171 AI feedback advisory; never a hiring input without human review (+1 more)

### Community 97 - "Module: analytics.ts"
Cohesion: 0.36
Nodes (7): AnalyticsEvent, computeKPIs(), FORBIDDEN_KEY_PATTERNS, KPISummary, recordAnalyticsEvent(), RecordAnalyticsEventParams, sanitizeAnalyticsMetadata()

### Community 98 - "Module: applications.ts"
Cohesion: 0.33
Nodes (7): JobApplication, submitJobApplication(), transitionApplicationState(), ApplicationState, canTransitionApplication(), instantiateJobFromTemplate(), createJobPosting()

### Community 99 - "Module: skill-forecasting.ts"
Cohesion: 0.33
Nodes (7): computeSkillForecast(), ComputeSkillForecastParams, rankTopEmergingSkills(), recordSkillMarketSignal(), RecordSkillMarketSignalParams, SkillForecast, SkillMarketSignal

### Community 100 - "Module: concurrency.test.ts"
Cohesion: 0.25
Nodes (6): boot(), call(), databaseUrl, Json, register(), ADR-0015

### Community 101 - "Module: pg/messaging.test.ts"
Cohesion: 0.28
Nodes (6): boot(), call(), databaseUrl, Json, login(), register()

### Community 102 - "Module: Login page desktop fold screenshot (befo"
Cohesion: 0.39
Nodes (8): Login page desktop fold screenshot (before audit), Login page mobile fold screenshot (before audit), Login page tablet fold screenshot (before audit), TalentSphere favicon (blue shield with check mark), TalentSphere PWA icon 192px (solid blue, no visible glyph), TalentSphere PWA icon 512px (solid blue, no visible glyph), Reticle SDK connection onboarding overlay (step 1 of 6), TalentSphere sign-in page

### Community 103 - "Module: License key handling"
Cohesion: 0.29
Nodes (6): Report and finish steps, src/reticle-dev.ts store registration must be completed, Reticle feedback reporting protocol, Reticle full rules reference (RETICLE.md), update_available result field, version_skew result field

### Community 105 - "Module: Migrations run manually, never on public"
Cohesion: 0.25
Nodes (4): Base-value concurrency guard returning 409, In-memory Maps kept as hydrated read model, Migration definition requirements (purpose, rollback, RLS impact), Change classes C1 to C7 with review requirements

### Community 106 - "Module: Canonical mutation flow (authn, authz, v"
Cohesion: 0.25
Nodes (7): Canonical mutation flow (authn, authz, validation, transaction, audit), Dual-queue boundary: transactional vs heavy async, Error taxonomy (422, 401, 403, 404, 409, 429, 503, 504), API contracts v6.0 overview, Service contract register SCI-01 to SCI-54, RLS policy model with deny-by-default, Critical error screens (401, 403, 404, 409, 429, 5xx)

### Community 107 - "Module: integration/work-history-removal.test.ts"
Cohesion: 0.46
Nodes (7): addRole(), call(), jobs(), Json, listRoles(), register(), requestReference()

### Community 108 - "Module: api service (Fastify, STORAGE=pg, BILLIN"
Cohesion: 0.43
Nodes (6): api service (Fastify, STORAGE=pg, BILLING disabled), db service (postgres 16 bookworm), internal Docker network (internal: true), Compose staging stack talentsphere-staging, web edge service (Caddy, ports 80/443), worker service (background jobs)

### Community 109 - "Module: Oracle staging README overview"
Cohesion: 0.29
Nodes (5): Oracle staging README overview, backup.sh PostgreSQL dump script, PostgreSQL backup and restore checks overview, verify-restore.sh temporary database restore check, Verification gaps that documentation cannot close

### Community 110 - "Module: persist() single-transaction write path "
Cohesion: 0.29
Nodes (7): persist() single-transaction write path to Postgres, Assessment AI modes (AI_PROHIBITED, AI_RESTRICTED, AI_ALLOWED), 50 canonical core tables (LOCKED), FERPA severance pattern (logical anonymization on graduation), Field-level PII encryption with AES-256-GCM, Database v6.0 overview (PostgreSQL system of record), Assessment flow with server-side session binding

### Community 111 - "Module: durability.ts"
Cohesion: 0.40
Nodes (5): DURABLE_ROUTES, isEphemeralRoute(), routeKey(), STATELESS_ROUTES, ADR-0015

### Community 112 - "Module: Accessibility release gate (WCAG 2.2 AA)"
Cohesion: 0.33
Nodes (3): Accessibility release gate (WCAG 2.2 AA), Canonical UI states (IDLE to RESTRICTED), UI/UX design system v6.0 overview

### Community 113 - "Module: Candidate core flow (landing to next act"
Cohesion: 0.40
Nodes (5): Candidate core flow (landing to next action), APP_FLOW v6.0 navigation and flow overview, J-02 Apply Track Hire journey, J-26 Career Switcher journey, Journey registry J-01 to J-28

### Community 114 - "Module: core-authz.test.ts"
Cohesion: 0.47
Nodes (5): boot(), call(), Json, orgWithJob(), register()

### Community 115 - "Module: core-notifications.test.ts"
Cohesion: 0.60
Nodes (4): call(), inbox(), Json, register()

### Community 120 - "Module: F-01 Authentication and Session"
Cohesion: 0.50
Nodes (4): F-01 Authentication and Session, F-12 Profile Management, F-84 Skills Graph and Taxonomy System, F-96 Skill Evidence and Digital Credentials

### Community 122 - "Module: Application state machine (draft to subm"
Cohesion: 0.50
Nodes (3): Application state machine (draft to submitted to hired/rejected), J-02 Apply to Track to Hire journey, Job state machine (draft to pending_approval to published to archived)

### Community 123 - "Module: profile.ts"
Cohesion: 0.50
Nodes (3): canViewProfile(), createProfileEntity(), updateProfileEntity()

### Community 124 - "Module: messaging-rules.test.ts"
Cohesion: 0.67
Nodes (3): call(), Json, register()

### Community 127 - "Module: Release preflight script modes (pre-0004"
Cohesion: 0.67
Nodes (3): Release preflight script modes (pre-00043, schema, operational), Required production configuration table (TOKEN_SECRET, DATABASE_URL, STORAGE, BILLING_WEBHOOK_SECRET, TRUST_PROXY), Billing webhook HMAC signature scheme (t=,v1=) with 300s replay window

### Community 128 - "Module: Account state enforced per request (susp"
Cohesion: 0.67
Nodes (3): Account state enforced per request (suspension, erasure, restricted routes), Ending sessions (sessions_valid_after cut-off, revoked_sessions, sign-out), Session signing key (TOKEN_SECRET, HMAC-SHA256 tokens, no hardcoded fallback)

## Ambiguous Edges - Review These
- `Dual-queue boundary (transactional Postgres queue vs heavy async worker pool)` → `MVP exit criteria (7) and institutional MVP exit criteria (5)`  [AMBIGUOUS]
  docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md · relation: conceptually_related_to
- `pnpm workspace package globs (apps/* and packages/*)` → `pnpm onlyBuiltDependencies and allowBuilds for esbuild`  [AMBIGUOUS]
  pnpm-workspace.yaml · relation: conceptually_related_to

## Knowledge Gaps
- **136 isolated node(s):** `@talentsphere/config`, `@talentsphere/contracts`, `@talentsphere/domain`, `fastify`, `pg` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1168 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `App Assembly & Work History` to `Migration & PNG Utilities`, `Job Queue & Email Delivery`, `Shared UI Component Props`, `Account Metadata Stores`, `Session & Storage Types`, `Fastify Service Manifest`, `Saved Row Persistence`, `Work History & Employment Types`, `Saved Jobs Store`, `Instructor Endorsements & Metrics`, `Interview Assessment Domain`, `Candidate Skill Diversity Analytics`, `Session & Registration Flows`, `Course Certificates & Enrollment`, `Webhook Signing & Auth`, `Notification Preferences`, `Alumni Groups & Mentorship`, `Career Milestone Readiness`, `Moderation & Appeals`, `Salary Benchmarking`, `Coding Challenges & Submissions`, `Gamification & Badges`, `Candidate Engagement Segmentation`, `Billing & Subscriptions`, `Input Sanitization & Security Guards`, `Server Env & Startup`, `AI Conversation Models`, `Application Drafts`, `Module: behavioral-talent-discovery.ts`, `Module: search.ts`, `Module: resumes.ts`, `Module: application-feedback.ts`, `Module: employer-reputation.ts`, `Module: peer-credibility.ts`, `Module: admin.ts`, `Module: auth.ts`, `Module: core.ts`, `Module: CoreSnapshot`, `Module: queue.ts`, `Module: config/src/index.ts`, `Module: job-templates.ts`, `Module: learning-impact.ts`, `Module: networking.ts`, `Module: portfolio.ts`, `Module: skill-decay.ts`, `Module: activity-contributions.ts`, `Module: generatePublicProof()`, `Module: referral-requests.ts`, `Module: warm-introductions.ts`, `Module: analytics.ts`, `Module: applications.ts`, `Module: skill-forecasting.ts`, `Module: concurrency.test.ts`, `Module: pg/messaging.test.ts`, `Module: integration/work-history-removal.test.ts`, `Module: core-authz.test.ts`, `Module: core-notifications.test.ts`, `Module: messaging-rules.test.ts`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **What connects `@talentsphere/config`, `@talentsphere/contracts`, `@talentsphere/domain` to the rest of the system?**
  _136 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Domain Input Types` be split into smaller, more focused modules?**
  _Cohesion score 0.012987012987012988 - nodes in this community are weakly interconnected._
- **Why does `DomainError` connect `Interview Assessment Domain` to `API Server Bootstrap`, `App Assembly & Work History`, `Account Metadata Stores`, `Saved Row Persistence`, `Work History & Employment Types`, `Saved Jobs Store`, `Instructor Endorsements & Metrics`, `Saved Search Store`, `Core Store Operations`, `Candidate Skill Diversity Analytics`, `Course Certificates & Enrollment`, `Data Erasure Requests`, `Notification Preferences`, `Alumni Groups & Mentorship`, `Career Milestone Readiness`, `Moderation & Appeals`, `Salary Benchmarking`, `Coding Challenges & Submissions`, `Candidate Engagement Segmentation`, `Billing & Subscriptions`, `Input Sanitization & Security Guards`, `AI Conversation Models`, `Application Drafts`, `Module: behavioral-talent-discovery.ts`, `Module: EvidenceStatus`, `Module: resumes.ts`, `Module: application-feedback.ts`, `Module: employer-reputation.ts`, `Module: peer-credibility.ts`, `Module: admin.ts`, `Module: core.ts`, `Module: CoreSnapshot`, `Module: config/src/index.ts`, `Module: job-templates.ts`, `Module: learning-impact.ts`, `Module: networking.ts`, `Module: portfolio.ts`, `Module: skill-decay.ts`, `Module: activity-contributions.ts`, `Module: generatePublicProof()`, `Module: referral-requests.ts`, `Module: warm-introductions.ts`, `Module: analytics.ts`, `Module: applications.ts`, `Module: skill-forecasting.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `API Server Bootstrap` be split into smaller, more focused modules?**
  _Cohesion score 0.015384615384615385 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Dual-queue boundary (transactional Postgres queue vs heavy async worker pool)` and `MVP exit criteria (7) and institutional MVP exit criteria (5)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `pnpm workspace package globs (apps/* and packages/*)` and `pnpm onlyBuiltDependencies and allowBuilds for esbuild`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
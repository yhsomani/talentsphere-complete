const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');

// Load raw data
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'features_raw.json'), 'utf8'));
const uniqueFeatures = JSON.parse(fs.readFileSync(path.join(__dirname, 'unique_features.json'), 'utf8'));
const migrationTables = JSON.parse(fs.readFileSync(path.join(__dirname, 'migration_tables.json'), 'utf8'));
const routesWithLines = JSON.parse(fs.readFileSync(path.join(__dirname, 'routes_with_lines.json'), 'utf8'));
const webApiCalls = JSON.parse(fs.readFileSync(path.join(__dirname, 'web_api_calls.json'), 'utf8'));

// Durable routes set
const durableSet = new Set(rawData.durableRoutes);

// Build feature mapping rule set
// We map each feature F-01 to F-173 by known domain, routes, migrations, and UI
const featureMapping = {};

// Detailed manual + programmatic mapping rules for all 173 features
const rules = {
  'F-01': {
    domain: 'auth.ts, core.ts',
    routes: ['POST /api/v1/auth/register', 'POST /api/v1/auth/login', 'GET /api/v1/auth/session', 'POST /api/v1/auth/password', 'POST /api/v1/auth/sign-out', 'POST /api/v1/auth/sign-out-others'],
    migrations: ['00001_core_schema.sql (users, profiles, audit_logs)', '00045_session_revocation.sql', '00046_session_sign_out.sql (revoked_sessions)'],
    ui: 'LoginPage.tsx, SignUpPage.tsx, ChangePasswordForm.tsx, SignOutOtherDevices.tsx, SessionContext.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Complete end-to-end auth with PBKDF2 hashing, JWT/session cookies, session revocation in DB, and E2E coverage.'
  },
  'F-02': {
    domain: 'core.ts',
    routes: ['GET /health', 'GET /api/v1/health'],
    migrations: ['None (Static/Shell)'],
    ui: 'LandingPage.tsx, Layout.tsx',
    status: 'Full',
    durability: 'Stateless',
    notes: 'Responsive marketing landing page with hero, value propositions, navigation to login/signup/jobs.'
  },
  'F-03': {
    domain: 'core.ts, auth.ts',
    routes: ['GET /api/v1/auth/session', 'GET /api/v1/profile/me', 'GET /api/v1/notifications/summary', 'GET /api/v1/applications/my', 'GET /api/v1/organizations/mine'],
    migrations: ['00001_core_schema.sql'],
    ui: 'DashboardPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Role-adaptive dashboard dynamically switching candidate vs recruiter views, showing live application status, metrics, and shortcuts.'
  },
  'F-04': {
    domain: 'jobs.ts',
    routes: ['GET /api/v1/jobs', 'GET /api/v1/jobs/:id', 'POST /api/v1/jobs/:id/apply', 'POST /api/v1/jobs/:id/save', 'DELETE /api/v1/jobs/:id/save', 'GET /api/v1/jobs/saved'],
    migrations: ['00001_core_schema.sql (jobs, job_applications)', '00003_jobs_applications_schema.sql (job_skills)', '00018_saved_searches_job_alerts_schema.sql (saved_jobs)'],
    ui: 'JobsPage.tsx, JobDetailPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Complete job marketplace with search, filtering, detail views, bookmarking, and application submission.'
  },
  'F-05': {
    domain: 'jobs.ts',
    routes: ['POST /api/v1/jobs', 'PATCH /api/v1/jobs/:id/status'],
    migrations: ['00001_core_schema.sql (jobs)'],
    ui: 'HiringPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Recruiter job creation and status transition (draft, published, paused, closed) with company affiliation.'
  },
  'F-06': {
    domain: 'applications.ts, jobs.ts',
    routes: ['GET /api/v1/jobs/:id/applications', 'GET /api/v1/applications/my', 'GET /api/v1/applications/:id', 'POST /api/v1/applications/:id/transition'],
    migrations: ['00001_core_schema.sql (job_applications)', '00003_jobs_applications_schema.sql (application_evidence)'],
    ui: 'HiringJobPage.tsx, ApplicationsPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Recruiter candidate pipeline management across review stages, with candidate application withdrawal and tracking.'
  },
  'F-07': {
    domain: 'lms.ts',
    routes: ['POST /api/v1/courses', 'GET /api/v1/courses', 'GET /api/v1/courses/:id', 'POST /api/v1/courses/:id/publish', 'POST /api/v1/courses/:id/modules', 'POST /api/v1/modules/:id/lessons', 'POST /api/v1/courses/:id/enroll', 'GET /api/v1/courses/:id/progress', 'POST /api/v1/lessons/:id/progress', 'POST /api/v1/courses/:id/certificate'],
    migrations: ['00005_lms_courses_schema.sql (courses, course_modules, lessons, course_enrollments, lesson_progress, course_certificates, course_skills)'],
    ui: 'None (no dedicated LMS/courses page in apps/web)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Rich domain logic, DB tables, and Fastify endpoints exist, but routes are ephemeral (in-memory) and web UI is not yet built.'
  },
  'F-08': {
    domain: 'challenges.ts, assessment.ts',
    routes: ['POST /api/v1/challenges', 'GET /api/v1/challenges', 'GET /api/v1/challenges/:id', 'POST /api/v1/challenges/:id/start', 'POST /api/v1/challenges/:id/submit'],
    migrations: ['00004_challenges_assessment_schema.sql (challenges, assessment_sessions, challenge_submissions, xp_transactions)'],
    ui: 'AssessmentsPage.tsx (Client-side preview with hardcoded challenges; no backend API wiring)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Full domain models, DB schema, and API endpoints exist; frontend is currently a static preview modal without backend persistence.'
  },
  'F-09': {
    domain: 'networking.ts',
    routes: ['POST /api/v1/connections/request', 'POST /api/v1/connections/:id/accept', 'POST /api/v1/connections/:id/reject', 'POST /api/v1/connections/:id/withdraw', 'GET /api/v1/connections/my', 'GET /api/v1/connections/status/:targetUserId'],
    migrations: ['00010_networking_connections_schema.sql (connections)'],
    ui: 'None (no dedicated networking/connections page)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Connection request, accept, reject, withdraw lifecycle implemented in domain and API; lacks web UI and DB persistence.'
  },
  'F-10': {
    domain: 'messaging.ts',
    routes: ['GET /api/v1/threads', 'POST /api/v1/threads', 'GET /api/v1/threads/:id', 'POST /api/v1/threads/:id/messages', 'POST /api/v1/threads/:id/read'],
    migrations: ['00006_messaging_schema.sql (message_threads, thread_participants, messages)'],
    ui: 'MessagesPage.tsx, ConversationPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Direct 1:1 messaging fully implemented with durable PostgreSQL storage (migration 00006), thread list, chat view, and unread count.'
  },
  'F-11': {
    domain: 'ai-gateway.ts',
    routes: ['POST /api/v1/ai/assistant/query', 'POST /api/v1/ai/conversations', 'POST /api/v1/ai/conversations/:id/messages', 'GET /api/v1/ai/conversations/:id', 'GET /api/v1/ai/usage/my'],
    migrations: ['00008_ai_gateway_schema.sql (ai_conversations, ai_messages, ai_usage_meters)'],
    ui: 'None (embedded assistant UI not yet in web shell)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Domain models with local heuristic fallback (generateCareerAssistantResponse), quota metering, and AI_PROHIBITED checks; ephemeral routes.'
  },
  'F-12': {
    domain: 'profile.ts',
    routes: ['GET /api/v1/profile/me', 'PATCH /api/v1/profile/me', 'GET /api/v1/profile/:id'],
    migrations: ['00001_core_schema.sql (profiles)'],
    ui: 'ProfilePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Core profile management with headline, summary, location, skills, experience, education, completeness scoring, and durable persistence.'
  },
  'F-13': {
    domain: 'resumes.ts',
    routes: ['POST /api/v1/resumes', 'GET /api/v1/resumes/my', 'GET /api/v1/resumes/:id', 'PATCH /api/v1/resumes/:id', 'POST /api/v1/resumes/:id/export', 'GET /api/v1/resumes/:id/exports', 'DELETE /api/v1/resumes/exports/:exportId'],
    migrations: ['00009_resumes_schema.sql (resumes, resume_exports)'],
    ui: 'None (no dedicated resume builder in web app)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Resume CRUD, structured JSON-resume export, and soft delete in domain & API; ephemeral routes.'
  },
  'F-14': {
    domain: 'notifications.ts',
    routes: ['GET /api/v1/notifications', 'GET /api/v1/notifications/summary', 'POST /api/v1/notifications/mark-read', 'GET /api/v1/notifications/preferences', 'PATCH /api/v1/notifications/preferences'],
    migrations: ['00007_notifications_schema.sql', '00044_notifications_persistence.sql (notifications, notification_preferences)', '00048_notification_preferences_rls_scope.sql'],
    ui: 'NotificationsPage.tsx, Layout.tsx (header bell counter)',
    status: 'Full',
    durability: 'Durable',
    notes: 'Full notification center with preference toggles, summary counts, mark-as-read, and durable Postgres persistence.'
  },
  'F-15': {
    domain: 'settings.ts',
    routes: ['GET /api/v1/settings', 'PATCH /api/v1/settings', 'POST /api/v1/settings/export/request', 'GET /api/v1/settings/export/latest', 'POST /api/v1/settings/erasure/request', 'GET /api/v1/settings/erasure/status', 'POST /api/v1/settings/erasure/cancel', 'POST /api/v1/settings/erasure/execute'],
    migrations: ['00013_account_settings_privacy_schema.sql (user_settings, data_erasure_requests, data_export_requests)'],
    ui: 'PrivacyPage.tsx, TermsPage.tsx, ProfilePage.tsx (account security controls)',
    status: 'Full',
    durability: 'Durable',
    notes: 'Privacy controls, GDPR/CCPA data export, erasure requests with 30-day grace cancellation, and durable persistence.'
  },
  'F-16': {
    domain: 'billing.ts',
    routes: ['GET /api/v1/billing/plans', 'POST /api/v1/billing/subscriptions', 'GET /api/v1/billing/subscriptions/my', 'POST /api/v1/billing/subscriptions/cancel', 'POST /api/v1/billing/webhook'],
    migrations: ['00014_billing_subscriptions_schema.sql (subscriptions, invoices, entitlements, billing_events)'],
    ui: 'CheckoutPage.tsx (Truthful early access pricing page stating payments not yet active)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Domain models and simulated billing webhook endpoints exist; plans route is stateless; web UI honestly discloses no live payment gateway.'
  },
  'F-17': {
    domain: 'admin.ts',
    routes: ['GET /api/v1/admin/health', 'PATCH /api/v1/admin/users/:id/status', 'PATCH /api/v1/admin/users/:id/roles', 'POST /api/v1/admin/feature-flags/toggle', 'POST /api/v1/admin/maintenance', 'GET /api/v1/admin/audit-logs', 'GET /api/v1/admin/diagnostics'],
    migrations: ['00001_core_schema.sql (audit_logs, feature_flags)', '00015_admin_governance_schema.sql (platform_config)'],
    ui: 'None (no AdminConsole.tsx in web app)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Admin governance API handles user lockout, role assignment, audit logs, and maintenance toggles; lacks web UI console.'
  },
  'F-18': {
    domain: 'None (Edge companion)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None (Chrome extension artifact not part of web/api monorepo)',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Chrome extension client companion specified in PRD but not implemented in repository.'
  },
  'F-19': {
    domain: 'analytics.ts',
    routes: ['POST /api/v1/analytics/events', 'POST /api/v1/analytics/events/batch', 'GET /api/v1/analytics/kpis/daily'],
    migrations: ['00020_product_analytics_schema.sql (analytics_events, analytics_daily_kpis)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Telemetry event recording and daily KPI computation implemented in domain and API; ephemeral routes without analytics dashboard UI.'
  },
  'F-20': {
    domain: 'search.ts',
    routes: ['GET /api/v1/search', 'GET /api/v1/search/autocomplete', 'GET /api/v1/search/commands', 'GET /api/v1/search/history', 'DELETE /api/v1/search/history'],
    migrations: ['00016_search_discovery_schema.sql (search_history)'],
    ui: 'Layout.tsx (Header command/search input bar)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Command search scoring, ranked multi-entity search, and autocomplete API exist; UI has search trigger but lacks full ⌘K overlay palette.'
  },
  'F-21': {
    domain: 'input-security.ts, core.ts',
    routes: ['Global Fastify errorHandler, rate-limiting hooks, writer lease check'],
    migrations: ['00049_worker_liveness.sql (worker_health)'],
    ui: 'NotFoundPage.tsx, SessionErrorNotice.tsx, Layout.tsx error boundary',
    status: 'Full',
    durability: 'Durable',
    notes: 'Structured error envelopes, rate limiters, advisory lease liveness recovery, 404 handler, and session error banners.'
  },
  'F-22': {
    domain: 'gamification.ts',
    routes: ['POST /api/v1/gamification/activities/claim', 'GET /api/v1/gamification/profile/my', 'GET /api/v1/gamification/badges/catalog', 'GET /api/v1/gamification/leaderboard', 'GET /api/v1/gamification/xp-history'],
    migrations: ['00012_gamification_xp_ledger_schema.sql (user_gamification_profiles, gamification_badges, user_badges)'],
    ui: 'DashboardPage.tsx (XP summary pill/badge count display)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'XP transaction ledger, daily XP cap (500), level calculations, and badge evaluation in domain and API; ephemeral routes.'
  },
  'F-23': {
    domain: 'gamification.ts',
    routes: ['GET /api/v1/gamification/leaderboard', 'GET /api/v1/gamification/badges/catalog'],
    migrations: ['00012_gamification_xp_ledger_schema.sql (gamification_badges, user_badges)'],
    ui: 'None (no dedicated LeaderboardPage.tsx)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Leaderboard ranking computation and badge catalog exist in API; lacks dedicated standalone leaderboard UI.'
  },
  'F-24': {
    domain: 'moderation.ts, input-security.ts',
    routes: ['POST /api/v1/moderation/scan', 'POST /api/v1/moderation/reports', 'GET /api/v1/moderation/reports', 'GET /api/v1/moderation/reports/:id', 'PATCH /api/v1/moderation/reports/:id/status', 'POST /api/v1/moderation/reports/:id/resolve', 'POST /api/v1/moderation/reports/:id/appeal', 'GET /api/v1/moderation/appeals/:id', 'POST /api/v1/moderation/appeals/:id/review', 'GET /api/v1/moderation/stats'],
    migrations: ['00017_moderation_trust_safety_schema.sql (moderation_reports, moderation_appeals)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Complete moderation workflow with content scanning, report triage, action resolution, and appeals in domain & API; ephemeral routes.'
  },
  'F-25': {
    domain: 'jobs.ts',
    routes: ['GET /api/v1/jobs/:id'],
    migrations: ['00001_core_schema.sql (jobs)'],
    ui: 'JobDetailPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Detailed job description view with organization info, salary, requirements, and direct apply trigger.'
  },
  'F-26': {
    domain: 'portfolio.ts',
    routes: ['POST /api/v1/portfolio/projects', 'GET /api/v1/portfolio/projects/my', 'GET /api/v1/portfolio/projects/:id', 'PATCH /api/v1/portfolio/projects/:id', 'DELETE /api/v1/portfolio/projects/:id', 'GET /api/v1/portfolio/users/:userId'],
    migrations: ['00011_portfolio_showcase_schema.sql (portfolio_projects, portfolio_project_skills, portfolio_project_media, portfolio_project_evidence)'],
    ui: 'ProfilePage.tsx (Portfolio showcase section)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Portfolio project showcase, media assets, skill tagging, and public viewer checks in API; routes are ephemeral.'
  },
  'F-27': {
    domain: 'None (Edge)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Local resume match preview in Chrome extension; not implemented in core platform.'
  },
  'F-28': {
    domain: 'None (Edge)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'External job page scanner in Chrome extension; not implemented in core platform.'
  },
  'F-29': {
    domain: 'notifications.ts',
    routes: ['GET /api/v1/notifications/preferences', 'PATCH /api/v1/notifications/preferences'],
    migrations: ['00007_notifications_schema.sql', '00044_notifications_persistence.sql'],
    ui: 'NotificationsPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Preferences for digest frequency (daily, weekly, immediate) supported in domain, API, DB, and UI.'
  },
  'F-30': {
    domain: 'networking.ts',
    routes: ['GET /api/v1/networking/nudges/stale-requests'],
    migrations: ['00010_networking_connections_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Nudge logic for pending connection requests older than 7 days implemented in API; ephemeral.'
  },
  'F-31': {
    domain: 'analytics.ts',
    routes: ['GET /api/v1/analytics/kpis/daily'],
    migrations: ['00020_product_analytics_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Daily KPI rollups (active candidates, recruiters, applications, hires) computed in domain/API; ephemeral.'
  },
  'F-32': {
    domain: 'saved-searches.ts',
    routes: ['POST /api/v1/jobs/saved-searches', 'GET /api/v1/jobs/saved-searches', 'GET /api/v1/jobs/saved-searches/:id', 'PATCH /api/v1/jobs/saved-searches/:id', 'DELETE /api/v1/jobs/saved-searches/:id', 'POST /api/v1/jobs/saved-searches/:id/run'],
    migrations: ['00018_saved_searches_job_alerts_schema.sql (saved_searches, job_alerts, saved_jobs)'],
    ui: 'JobsPage.tsx (Search filters and criteria persistence)',
    status: 'Full',
    durability: 'Durable',
    notes: 'Saved searches and job alert evaluation fully integrated with durable Postgres persistence (ADR-015).'
  },
  'F-33': {
    domain: 'technical-interview.ts',
    routes: ['POST /api/v1/interviews/assessments/:id/join', 'POST /api/v1/interviews/assessments/:id/consent'],
    migrations: ['00026_technical_interview_platform_schema.sql (interview_assessments)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Interview session room coordination and WebRTC/recording consent in API; no live WebRTC UI component.'
  },
  'F-34': {
    domain: 'search.ts',
    routes: ['GET /api/v1/search'],
    migrations: ['00016_search_discovery_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Multi-entity search across jobs, skills, profiles, courses, and challenges with composite ranking.'
  },
  'F-35': {
    domain: 'admin.ts',
    routes: ['GET /api/v1/feature-flags', 'POST /api/v1/admin/feature-flags/toggle'],
    migrations: ['00001_core_schema.sql (feature_flags)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Feature flag query and admin toggle API exist; lacks dedicated admin UI console.'
  },
  'F-36': {
    domain: 'application-drafts.ts',
    routes: ['POST /api/v1/applications/drafts', 'GET /api/v1/applications/drafts/:jobId', 'POST /api/v1/applications/drafts/:jobId/versions/:versionId/restore', 'DELETE /api/v1/applications/drafts/:jobId'],
    migrations: ['00019_application_drafts_schema.sql (application_drafts, application_draft_versions)'],
    ui: 'None (UI submits directly without explicit draft autosave)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Application draft autosave and version history implemented in domain and API; ephemeral routes.'
  },
  'F-37': {
    domain: 'job-templates.ts',
    routes: ['POST /api/v1/job-templates', 'GET /api/v1/job-templates', 'GET /api/v1/job-templates/:id', 'PATCH /api/v1/job-templates/:id', 'POST /api/v1/job-templates/:id/instantiate', 'POST /api/v1/job-templates/from-job/:jobId'],
    migrations: ['00022_job_templates_schema.sql (job_templates)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Job template creation, instantiation into active jobs, and template management in domain & API; ephemeral.'
  },
  'F-38': {
    domain: 'None (Deprecated)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Stub/Mock',
    durability: 'N/A',
    notes: 'Deprecated legacy chat service; superseded by F-10 Direct Messaging.'
  },
  'F-39': {
    domain: 'None (Deprecated)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Stub/Mock',
    durability: 'N/A',
    notes: 'Deprecated unified backend stub; replaced by modular Fastify architecture.'
  },
  'F-40': {
    domain: 'lms.ts',
    routes: ['POST /api/v1/courses (institution-scoped)', 'GET /api/v1/courses'],
    migrations: ['00005_lms_courses_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Institutional course categorization supported in LMS domain; no institutional management portal UI.'
  },
  'F-41': {
    domain: 'billing.ts',
    routes: ['GET /api/v1/billing/plans'],
    migrations: ['00014_billing_subscriptions_schema.sql (entitlements)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Stateless',
    notes: 'Enterprise seat licensing concepts defined in billing domain; Phase 6 scope.'
  },
  'F-42': {
    domain: 'lms.ts',
    routes: ['POST /api/v1/modules/:id/lessons (media metadata)'],
    migrations: ['00005_lms_courses_schema.sql (lessons.content_url)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Lesson media asset metadata stored; third-party media engine abstraction not integrated.'
  },
  'F-43': {
    domain: 'alumni-networks.ts',
    routes: ['POST /api/v1/alumni/affiliations'],
    migrations: ['00033_alumni_networks_schema.sql (alumni_affiliations)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Transition of student to alumni affiliation supported in domain; Phase 3 scope.'
  },
  'F-44': {
    domain: 'ai-gateway.ts, lms.ts',
    routes: ['POST /api/v1/ai/assistant/query'],
    migrations: ['00008_ai_gateway_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'AI media transcript/enrichment concept; gated by AI gateway heuristics.'
  },
  'F-45': {
    domain: 'assessment.ts',
    routes: ['POST /api/v1/challenges/:id/start (AI_PROHIBITED flag enforcement)'],
    migrations: ['00004_challenges_assessment_schema.sql'],
    ui: 'None',
    status: 'Stub/Mock',
    durability: 'Ephemeral',
    notes: 'Third-party proctoring is vendor-gated (OD-35, Ph10); assessment session enforces AI_PROHIBITED invariant only.'
  },
  'F-46': {
    domain: 'learning-impact.ts, analytics.ts',
    routes: ['GET /api/v1/learning/impact/dashboard'],
    migrations: ['00037_learning_impact_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Cohort learning completion analytics in domain/API; Phase 3 scope.'
  },
  'F-47': {
    domain: 'instructor-reputation.ts',
    routes: ['GET /api/v1/reputation/instructors/:instructorId'],
    migrations: ['00031_instructor_reputation_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Instructor dashboard metrics in API; no web UI.'
  },
  'F-48': {
    domain: 'search.ts',
    routes: ['GET /api/v1/search/commands'],
    migrations: ['None'],
    ui: 'Layout.tsx (Workbench layout)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'OS shell / workspace concept realized as responsive web app layout and command launcher.'
  },
  'F-49': {
    domain: 'background-jobs.ts',
    routes: ['GET /api/v1/internal/worker-health'],
    migrations: ['00042_background_jobs_schema.sql', '00049_worker_liveness.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Durable',
    notes: 'Background worker dispatch queue and worker heartbeat health checks implemented; no autonomous agents.'
  },
  'F-50': {
    domain: 'lms.ts',
    routes: ['GET /api/v1/courses'],
    migrations: ['00005_lms_courses_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Course marketplace catalog supported via course query endpoints; Phase 3 scope.'
  },
  'F-51': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Media health monitoring service not implemented (Phase 4).'
  },
  'F-52': {
    domain: 'lms.ts',
    routes: ['GET /api/v1/certificates/verify/:proofHash', 'POST /api/v1/certificates/:id/revoke'],
    migrations: ['00005_lms_courses_schema.sql (course_certificates)', '00021_certificate_verification_schema.sql (certificate_revocations)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Cryptographic SHA-256 certificate verification and admin revocation in domain/API; ephemeral routes.'
  },
  'F-53': {
    domain: 'networking.ts',
    routes: ['GET /api/v1/connections/my'],
    migrations: ['00010_networking_connections_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Social graph connections exist; feed publication and social timeline deferred to Phase 8.'
  },
  'F-54': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Long-form content publishing deferred to Phase 8.'
  },
  'F-55': {
    domain: 'alumni-networks.ts',
    routes: ['POST /api/v1/alumni/groups', 'POST /api/v1/alumni/groups/:id/join', 'GET /api/v1/alumni/groups'],
    migrations: ['00033_alumni_networks_schema.sql (alumni_groups, alumni_group_members)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Groups and communities implemented for alumni domain; generalized community groups deferred to Phase 8.'
  },
  'F-56': {
    domain: 'core.ts',
    routes: ['POST /api/v1/organizations', 'GET /api/v1/organizations/mine', 'GET /api/v1/organizations/:id', 'GET /api/v1/organizations/:id/jobs', 'POST /api/v1/organizations/:id/members'],
    migrations: ['00001_core_schema.sql (organizations, org_memberships)'],
    ui: 'HiringPage.tsx (Organization selector and management)',
    status: 'Full',
    durability: 'Durable',
    notes: 'Organization creation, membership management, and company job listings backed by durable PostgreSQL.'
  },
  'F-57': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Events & Webinars deferred to Phase 8.'
  },
  'F-58': {
    domain: 'work-history-graph.ts',
    routes: ['POST /api/v1/candidates/work-history/:id/references/request', 'POST /api/v1/candidates/work-history/references/:refId/submit', 'GET /api/v1/references/:refId'],
    migrations: ['00041_verified_work_history_schema.sql (employment_references)'],
    ui: 'ReferencePage.tsx, EvidencePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Written structured referee recommendations with referee voucher token authentication, form submission, and verification scores.'
  },
  'F-59': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'TalentMail outreach credits deferred to Phase 8.'
  },
  'F-60': {
    domain: 'profile.ts, settings.ts',
    routes: ['GET /api/v1/profile/:id', 'PATCH /api/v1/settings'],
    migrations: ['00001_core_schema.sql', '00013_account_settings_privacy_schema.sql'],
    ui: 'ProfilePage.tsx, PrivacyPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Profile privacy controls and RLS row-level access gating public vs connection vs private.'
  },
  'F-61': {
    domain: 'None (Gated OD-34)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Stub/Mock',
    durability: 'N/A',
    notes: 'Premium candidate tier is vendor/founder gated (OD-34, Ph10+); excluded from GA.'
  },
  'F-62': {
    domain: 'None (Not Recommended)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Stub/Mock',
    durability: 'N/A',
    notes: 'Sponsored content explicitly marked NOT RECOMMENDED in SSOT §3.3.'
  },
  'F-63': {
    domain: 'None (Not Recommended)',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Stub/Mock',
    durability: 'N/A',
    notes: 'Business-development sales graph explicitly marked NOT RECOMMENDED in SSOT §4.2.'
  },
  'F-64': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'LinkedIn profile migration tool deferred; platform maintains independent canonical identity (SSOT §2.2).'
  },
  'F-65': {
    domain: 'profile.ts, auth.ts',
    routes: ['POST /api/v1/auth/register', 'GET /api/v1/profile/me'],
    migrations: ['00001_core_schema.sql'],
    ui: 'ProfilePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Architectural decoupling: independent identity, canonical skills taxonomy, and proprietary evidence graph.'
  },
  'F-66': {
    domain: 'lms.ts',
    routes: ['POST /api/v1/courses', 'POST /api/v1/courses/:id/publish', 'POST /api/v1/courses/:id/modules', 'POST /api/v1/modules/:id/lessons'],
    migrations: ['00005_lms_courses_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Course creation, module structuring, lesson drafting, and publish validation in API; no web studio UI.'
  },
  'F-67': {
    domain: 'lms.ts',
    routes: ['GET /api/v1/courses'],
    migrations: ['00005_lms_courses_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Course filtering by category and skill in LMS domain/API; Phase 7 scope.'
  },
  'F-68': {
    domain: 'lms.ts',
    routes: ['POST /api/v1/lessons/:id/progress'],
    migrations: ['00005_lms_courses_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Lesson completion checks; comprehensive exam engine deferred to Phase 7.'
  },
  'F-69': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Assignments and peer review grading system deferred to Phase 7.'
  },
  'F-70': {
    domain: 'lms.ts',
    routes: ['GET /api/v1/courses/:id/progress'],
    migrations: ['00005_lms_courses_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Sequential module and prerequisite enforcement in LMS domain; learning path bundles deferred to Phase 7.'
  },
  'F-71': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Course discussion forums and notes deferred to Phase 7.'
  },
  'F-72': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Course reviews & star ratings deferred to Phase 7.'
  },
  'F-73': {
    domain: 'billing.ts',
    routes: ['POST /api/v1/billing/subscriptions'],
    migrations: ['00014_billing_subscriptions_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Individual course purchasing models in billing domain; Phase 7 scope.'
  },
  'F-74': {
    domain: 'instructor-reputation.ts',
    routes: ['GET /api/v1/reputation/instructors/:instructorId', 'POST /api/v1/reputation/instructors/:instructorId/metrics'],
    migrations: ['00031_instructor_reputation_schema.sql (instructor_reputation_breakdown)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Instructor analytics and operations in API; Phase 7 scope.'
  },
  'F-75': {
    domain: 'employer-reputation.ts',
    routes: ['GET /api/v1/reputation/employers/:orgId', 'POST /api/v1/reputation/employers/:orgId/reviews', 'GET /api/v1/reputation/employers/:orgId/reviews'],
    migrations: ['00034_employer_reputation_schema.sql (employer_reputation_breakdown, employer_reviews)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Employer brand scores, ratings, and reviews in API; Phase 9 scope.'
  },
  'F-76': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Live coding contests and real-time contest leaderboards deferred to Phase 9.'
  },
  'F-77': {
    domain: 'assessment.ts, challenges.ts',
    routes: ['POST /api/v1/challenges/:id/start', 'POST /api/v1/challenges/:id/submit'],
    migrations: ['00004_challenges_assessment_schema.sql'],
    ui: 'AssessmentsPage.tsx (preview)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Proctored certification exam evaluation and pass/fail scoring in domain; frontend is preview modal.'
  },
  'F-78': {
    domain: 'challenges.ts',
    routes: ['GET /api/v1/challenges'],
    migrations: ['00004_challenges_assessment_schema.sql'],
    ui: 'AssessmentsPage.tsx (preview)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Interview prep challenge sets supported; Phase 9 scope.'
  },
  'F-79': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Articles and newsletters publishing deferred to Phase 8.'
  },
  'F-80': {
    domain: 'profile.ts',
    routes: ['PATCH /api/v1/profile/me'],
    migrations: ['00001_core_schema.sql'],
    ui: 'ProfilePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Profile enhancements (rich bio, structured skills, experience history, completeness metrics).'
  },
  'F-81': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Government ID verification deferred to Phase 9.'
  },
  'F-82': {
    domain: 'lms.ts',
    routes: ['GET /api/v1/courses/:id/progress'],
    migrations: ['00005_lms_courses_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Student learning progress analytics in domain/API; Phase 7 scope.'
  },
  'F-83': {
    domain: 'admin.ts',
    routes: ['GET /api/v1/admin/diagnostics', 'GET /api/v1/admin/audit-logs'],
    migrations: ['00001_core_schema.sql', '00015_admin_governance_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Admin diagnostics and governance audit endpoints; Phase 8 scope.'
  },
  'F-84': {
    domain: 'skills.ts',
    routes: ['POST /api/v1/skills', 'GET /api/v1/skills', 'GET /api/v1/skills/:id', 'POST /api/v1/skills/relationships', 'GET /api/v1/skills/:id/traverse'],
    migrations: ['00002_evidence_skills_schema.sql (skills, skill_relationships, evidence_skills)'],
    ui: 'JobsPage.tsx, EvidencePage.tsx, ProfilePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Canonical semantic skills graph with prerequisite traversal, relationship DAGs, and durable storage.'
  },
  'F-85': {
    domain: 'career-trajectory.ts',
    routes: ['POST /api/v1/career/transitions', 'GET /api/v1/career/benchmarks', 'POST /api/v1/career/trajectory/probability', 'GET /api/v1/career/pathways', 'POST /api/v1/career/milestones/readiness'],
    migrations: ['00036_career_trajectory_schema.sql (career_transitions, progression_benchmarks, career_milestone_evaluations)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Career path progression models, transition probability, and milestone readiness in domain & API; ephemeral.'
  },
  'F-86': {
    domain: 'salary-intelligence.ts',
    routes: ['POST /api/v1/salaries/reports', 'POST /api/v1/salaries/reports/:id/withdraw', 'GET /api/v1/salaries/benchmarks', 'GET /api/v1/salaries/companies/:orgId/summary', 'GET /api/v1/salaries/reports/my'],
    migrations: ['00023_salary_intelligence_schema.sql (salary_reports, salary_aggregates)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Salary benchmarking with differential privacy, minimum cohort k-anonymity (≥5 reports), and company summaries in API; ephemeral.'
  },
  'F-87': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Community interview question repository deferred to Phase 4.'
  },
  'F-88': {
    domain: 'technical-interview.ts',
    routes: ['POST /api/v1/interviews/questions', 'POST /api/v1/interviews/assessments', 'GET /api/v1/interviews/assessments/:id', 'POST /api/v1/interviews/assessments/:id/join', 'POST /api/v1/interviews/assessments/:id/consent', 'POST /api/v1/interviews/assessments/:id/end', 'POST /api/v1/interviews/assessments/:id/scorecard', 'POST /api/v1/interviews/assessments/:id/scorecard/compensate', 'POST /api/v1/interviews/assessments/:id/review', 'POST /api/v1/interviews/execute-code'],
    migrations: ['00026_technical_interview_platform_schema.sql (interview_questions, interview_assessments, interview_scorecards, interview_ai_feedbacks)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Interview scheduling, join flow, candidate consent, rubric scorecarding, and sandboxed code execution in API; ephemeral.'
  },
  'F-89': {
    domain: 'activity-contributions.ts',
    routes: ['POST /api/v1/activity/events', 'GET /api/v1/activity/scores/:userId', 'GET /api/v1/activity/history/:userId'],
    migrations: ['00030_activity_contributions_schema.sql (activity_events, contribution_scores)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Activity event logging and contribution scoring in domain & API; Phase 8 scope.'
  },
  'F-90': {
    domain: 'alumni-networks.ts',
    routes: ['POST /api/v1/alumni/mentorship/request', 'POST /api/v1/alumni/mentorship/:id/respond', 'GET /api/v1/alumni/mentorship/my'],
    migrations: ['00033_alumni_networks_schema.sql (alumni_mentorship)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Alumni peer mentorship request/response workflow in domain & API; Phase 4 scope.'
  },
  'F-91': {
    domain: 'career-trajectory.ts',
    routes: ['POST /api/v1/career/milestones/readiness'],
    migrations: ['00036_career_trajectory_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Career readiness score calculation from verified skills and experience overlap; ephemeral.'
  },
  'F-92': {
    domain: 'talent-pool-intelligence.ts, search.ts',
    routes: ['GET /api/v1/recruiter/talent-pools/:id/intelligence', 'GET /api/v1/search'],
    migrations: ['00038_talent_pool_intelligence_schema.sql'],
    ui: 'HiringPage.tsx',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Recruiter talent search with skills filtering; advanced Boolean talent search in ephemeral API.'
  },
  'F-93': {
    domain: 'technical-interview.ts',
    routes: ['POST /api/v1/interviews/assessments/:id/ai-feedback'],
    migrations: ['00026_technical_interview_platform_schema.sql (interview_ai_feedbacks)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Advisory AI feedback for interview assessments in domain/API; Phase 4 scope.'
  },
  'F-94': {
    domain: 'work-history-graph.ts',
    routes: ['POST /api/v1/candidates/work-history', 'POST /api/v1/candidates/work-history/:id/verify-email', 'POST /api/v1/candidates/work-history/:id/references/request', 'POST /api/v1/candidates/work-history/references/:refId/submit', 'DELETE /api/v1/candidates/work-history/:id', 'GET /api/v1/references/:refId', 'GET /api/v1/candidates/:candidateId/work-history', 'GET /api/v1/candidates/:candidateId/work-history-graph'],
    migrations: ['00041_verified_work_history_schema.sql (verified_work_histories, employment_references)', '00043_core_persistence_alignment.sql (work_history_email_challenges)'],
    ui: 'EvidencePage.tsx, ReferencePage.tsx, ProfilePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Core proof of control: corporate email HMAC challenge, referee voucher tokens, verification scores/badges, and durable persistence.'
  },
  'F-95': {
    domain: 'career-trajectory.ts',
    routes: ['GET /api/v1/career/pathways'],
    migrations: ['00036_career_trajectory_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Progression pathway graph between career roles; ephemeral.'
  },
  'F-96': {
    domain: 'evidence.ts',
    routes: ['POST /api/v1/evidence', 'GET /api/v1/evidence/mine', 'GET /api/v1/evidence/:id', 'GET /api/v1/evidence/subject/:subjectId', 'POST /api/v1/evidence/:id/verify', 'POST /api/v1/evidence/:id/dispute', 'POST /api/v1/evidence/:id/revoke', 'GET /api/v1/evidence/:id/verify-public'],
    migrations: ['00001_core_schema.sql (evidence)', '00002_evidence_skills_schema.sql (evidence_skills)'],
    ui: 'EvidencePage.tsx, ProfilePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Digital skill evidence with SHA-256 public verification tokens, dispute/revocation lifecycle, and durable PostgreSQL persistence.'
  },
  'F-97': {
    domain: 'skill-forecasting.ts',
    routes: ['POST /api/v1/skills/market-signals', 'GET /api/v1/skills/:id/forecast'],
    migrations: ['00035_skill_forecasting_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Market signal recording and demand forecasting in API; Phase 4 scope.'
  },
  'F-98': {
    domain: 'salary-intelligence.ts',
    routes: ['GET /api/v1/salaries/companies/:orgId/summary'],
    migrations: ['00023_salary_intelligence_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Employer compensation distributions; Phase 3 scope.'
  },
  'F-99': {
    domain: 'ai-gateway.ts',
    routes: ['POST /api/v1/ai/conversations', 'POST /api/v1/ai/conversations/:id/messages'],
    migrations: ['00008_ai_gateway_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Multi-turn AI career coaching conversation endpoint with quota metering; ephemeral.'
  },
  'F-100': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Peer project collaboration deferred to Phase 5.'
  },
  'F-101': {
    domain: 'gamification.ts',
    routes: ['GET /api/v1/gamification/badges/catalog'],
    migrations: ['00012_gamification_xp_ledger_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Badge catalog query in API; marketplace trading deferred to Phase 8.'
  },
  'F-102': {
    domain: 'jobs.ts, applications.ts',
    routes: ['GET /api/v1/organizations/:id/jobs', 'GET /api/v1/jobs/:id/applications'],
    migrations: ['00001_core_schema.sql'],
    ui: 'HiringPage.tsx, HiringJobPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Dedicated hiring manager portal view for team postings, applicant candidate pipelines, and review transitions.'
  },
  'F-103': {
    domain: 'technical-interview.ts, talent-segmentation.ts',
    routes: ['POST /api/v1/interviews/assessments/:id/scorecard', 'GET /api/v1/recruiter/talent/segmentation/filter'],
    migrations: ['00026_technical_interview_platform_schema.sql', '00040_talent_segmentation_schema.sql'],
    ui: 'HiringJobPage.tsx (Candidate review rubric)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Candidate comparison rubric and multi-criteria scoring in API; basic review in UI.'
  },
  'F-104': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Pre-hire custom assessment builder deferred to Phase 3.'
  },
  'F-105': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Post-hire retention and performance tracking deferred to Phase 4.'
  },
  'F-106': {
    domain: 'skills.ts, lms.ts',
    routes: ['GET /api/v1/skills/:id/traverse'],
    migrations: ['00002_evidence_skills_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Durable',
    notes: 'Graph traversal for unmet skill prerequisites implemented in domain/API.'
  },
  'F-107': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Live Q&A with instructors deferred to Phase 5.'
  },
  'F-108': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Expert network matching deferred to Phase 7.'
  },
  'F-109': {
    domain: 'salary-intelligence.ts',
    routes: ['GET /api/v1/salaries/benchmarks'],
    migrations: ['00023_salary_intelligence_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Salary benchmarking data available for negotiation guidance; dedicated wizard UI deferred to Phase 8.'
  },
  'F-110': {
    domain: 'peer-credibility.ts',
    routes: ['POST /api/v1/skills/:id/endorse', 'POST /api/v1/skills/:id/endorsements/revoke', 'GET /api/v1/skills/:id/endorsements'],
    migrations: ['00032_peer_credibility_schema.sql (skill_endorsements, endorsement_weights)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Reputation-weighted peer skill endorsements in domain & API; Phase 8 scope.'
  },
  'F-111': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Industry-specific learning hubs deferred to Phase 8.'
  },
  'F-112': {
    domain: 'resumes.ts',
    routes: ['POST /api/v1/resumes'],
    migrations: ['00009_resumes_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Structured resume entity parser schema; AI optimization wizard deferred to Phase 8.'
  },
  'F-113': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Recruiter outreach analytics deferred to Phase 8.'
  },
  'F-114': {
    domain: 'learning-impact.ts',
    routes: ['POST /api/v1/learning/outcomes', 'GET /api/v1/learning/impact/:courseId', 'POST /api/v1/learning/impact/compute', 'GET /api/v1/learning/impact/dashboard'],
    migrations: ['00037_learning_impact_schema.sql (learning_outcomes, learning_impact_metrics)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Learning outcome recording, salary uplift tracking, and impact metrics in API; ephemeral.'
  },
  'F-115': {
    domain: 'assessment.ts',
    routes: ['POST /api/v1/challenges/:id/start', 'POST /api/v1/challenges/:id/submit'],
    migrations: ['00004_challenges_assessment_schema.sql'],
    ui: 'AssessmentsPage.tsx (preview)',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Certification exam scoring and session management; frontend is preview modal.'
  },
  'F-116': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'Layout.tsx (ARIA landmarks, semantic HTML)',
    status: 'Partial',
    durability: 'Stateless',
    notes: 'UI adheres to WCAG 2.1 AA accessibility guidelines; specialized inclusive learning features deferred to Phase 8.'
  },
  'F-117': {
    domain: 'jobs.ts, applications.ts',
    routes: ['POST /api/v1/jobs/:id/apply'],
    migrations: ['00001_core_schema.sql'],
    ui: 'JobDetailPage.tsx, Layout.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Responsive mobile-first job application modal with responsive breakpoints.'
  },
  'F-118': {
    domain: 'skill-forecasting.ts',
    routes: ['GET /api/v1/skills/emerging/top'],
    migrations: ['00035_skill_forecasting_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Detection and ranking of top emerging skills based on market frequency signals; ephemeral.'
  },
  'F-119': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Diversity & Inclusion analytics pipeline deferred to Phase 8.'
  },
  'F-120': {
    domain: 'core.ts',
    routes: ['All /api/v1 routes'],
    migrations: ['All 49 migrations'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Public REST API platform exists (~274 endpoints); external developer API key management deferred to Phase 10.'
  },
  'F-121': {
    domain: 'warm-introductions.ts',
    routes: ['PATCH /api/v1/networking/intro-preferences', 'GET /api/v1/networking/intro-preferences/my', 'GET /api/v1/networking/intro-paths/:targetUserId', 'POST /api/v1/networking/intro-requests', 'POST /api/v1/networking/intro-requests/:id/respond', 'GET /api/v1/networking/intro-requests/my'],
    migrations: ['00028_warm_introductions_schema.sql (warm_introduction_preferences, warm_introduction_requests)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Multi-hop connection path discovery, double opt-in intro requests, and preferences in API; ephemeral.'
  },
  'F-122': {
    domain: 'application-feedback.ts',
    routes: ['POST /api/v1/feedback/templates', 'GET /api/v1/feedback/templates', 'POST /api/v1/applications/:id/feedback', 'POST /api/v1/applications/:id/feedback/request', 'PATCH /api/v1/applications/feedback/:id/viewed', 'GET /api/v1/applications/:id/feedback', 'GET /api/v1/feedback/insights/aggregate'],
    migrations: ['00024_application_feedback_schema.sql (feedback_templates, application_feedback)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Constructive application feedback loop, templates, request workflow, and aggregated insights in API; ephemeral.'
  },
  'F-123': {
    domain: 'skill-decay.ts',
    routes: ['POST /api/v1/skills/:id/freshness/register', 'GET /api/v1/skills/:id/freshness/my', 'POST /api/v1/skills/:id/freshness/reverify', 'GET /api/v1/skills/freshness/stale'],
    migrations: ['00025_skill_decay_schema.sql (skill_freshness, skill_freshness_history)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Half-life decay model for skills, freshness tracking, and re-verification triggers in API; ephemeral.'
  },
  'F-124': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Project marketplace deferred to Phase 5.'
  },
  'F-125': {
    domain: 'alumni-networks.ts',
    routes: ['POST /api/v1/alumni/affiliations', 'POST /api/v1/alumni/affiliations/:id/verify', 'GET /api/v1/alumni/directory', 'POST /api/v1/alumni/groups', 'POST /api/v1/alumni/groups/:id/join', 'GET /api/v1/alumni/groups', 'POST /api/v1/alumni/mentorship/request', 'POST /api/v1/alumni/mentorship/:id/respond', 'GET /api/v1/alumni/mentorship/my'],
    migrations: ['00033_alumni_networks_schema.sql (alumni_affiliations, alumni_groups, alumni_group_members, alumni_mentorship)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Alumni chapters, directory filtering, verification, and mentorship matching in API; ephemeral.'
  },
  'F-126': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Interview prep coach marketplace deferred to Phase 4.'
  },
  'F-127': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Company culture assessment deferred to Phase 5.'
  },
  'F-128': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Job offer comparison tool deferred to Phase 4.'
  },
  'F-129': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Leadership development programs deferred to Phase 5.'
  },
  'F-130': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Freelance marketplace deferred to Phase 7.'
  },
  'F-131': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Apprenticeship matching deferred to Phase 6.'
  },
  'F-132': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Scholarship discovery deferred to Phase 6.'
  },
  'F-133': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Volunteer matching deferred to Phase 7.'
  },
  'F-134': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Code review practice sandbox deferred to Phase 5.'
  },
  'F-135': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'System design practice module deferred to Phase 5.'
  },
  'F-136': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Micro-learning bites deferred to Phase 4.'
  },
  'F-137': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Spaced repetition flashcards deferred to Phase 6.'
  },
  'F-138': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Study accountability partners deferred to Phase 6.'
  },
  'F-139': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Local meetups deferred to Phase 7.'
  },
  'F-140': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Affinity groups deferred to Phase 7.'
  },
  'F-141': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Pre-onboarding preparation deferred to Phase 8.'
  },
  'F-142': {
    domain: 'referral-requests.ts',
    routes: ['POST /api/v1/referrals/requests', 'GET /api/v1/referrals/requests/:id', 'POST /api/v1/referrals/requests/:id/respond', 'GET /api/v1/referrals/requests/received', 'GET /api/v1/referrals/requests/sent', 'GET /api/v1/referrals/stats/my'],
    migrations: ['00029_referral_requests_schema.sql (referral_requests, referral_outcomes)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Employee referral requests, outcome tracking, and referrer stats in API; ephemeral.'
  },
  'F-143': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Open source contribution discovery deferred to Phase 8.'
  },
  'F-144': {
    domain: 'reputation-engine.ts',
    routes: ['POST /api/v1/reputation/signals', 'GET /api/v1/reputation/scores/:userId', 'GET /api/v1/reputation/scores/:userId/context/:context', 'GET /api/v1/reputation/scores/:userId/history', 'POST /api/v1/reputation/recovery/start', 'POST /api/v1/reputation/recovery/complete-task', 'GET /api/v1/reputation/recovery/my'],
    migrations: ['00027_reputation_engine_schema.sql (reputation_scores, reputation_signals, reputation_history, reputation_recovery_plans)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Contextual multi-domain reputation scores, decaying signals, reputation bands, and rehabilitation recovery plans in API; ephemeral.'
  },
  'F-145': {
    domain: 'search.ts, skills.ts',
    routes: ['GET /api/v1/search', 'GET /api/v1/skills/:id/traverse'],
    migrations: ['00002_evidence_skills_schema.sql', '00016_search_discovery_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Core recommendation logic using skill overlap and graph traversal; ephemeral.'
  },
  'F-146': {
    domain: 'activity-contributions.ts',
    routes: ['POST /api/v1/activity/events', 'GET /api/v1/activity/scores/:userId', 'GET /api/v1/activity/history/:userId', 'GET /api/v1/activity/stats/my', 'GET /api/v1/activity/feed/public'],
    migrations: ['00030_activity_contributions_schema.sql (activity_events, contribution_scores)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'User activity tracking and periodic contribution score aggregation in API; ephemeral.'
  },
  'F-147': {
    domain: 'search.ts',
    routes: ['GET /api/v1/search', 'GET /api/v1/search/autocomplete', 'GET /api/v1/search/commands'],
    migrations: ['00016_search_discovery_schema.sql'],
    ui: 'Layout.tsx',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Unified multi-entity search across jobs, skills, profiles, and courses in domain & API; ephemeral.'
  },
  'F-148': {
    domain: 'instructor-reputation.ts',
    routes: ['GET /api/v1/reputation/instructors/:instructorId', 'POST /api/v1/reputation/instructors/:instructorId/metrics', 'POST /api/v1/reputation/instructors/:instructorId/endorse', 'POST /api/v1/reputation/instructors/:instructorId/reviews'],
    migrations: ['00031_instructor_reputation_schema.sql (instructor_reputation_breakdown, instructor_endorsements)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Instructor quality metric computation, student ratings, and peer endorsements in API; ephemeral.'
  },
  'F-149': {
    domain: 'employer-reputation.ts',
    routes: ['GET /api/v1/reputation/employers/:orgId', 'POST /api/v1/reputation/employers/:orgId/reviews', 'GET /api/v1/reputation/employers/:orgId/reviews', 'POST /api/v1/reputation/employers/:orgId/metrics'],
    migrations: ['00034_employer_reputation_schema.sql (employer_reputation_breakdown, employer_reviews)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Employer brand scores, review moderation, and hiring operational transparency in API; ephemeral.'
  },
  'F-150': {
    domain: 'peer-credibility.ts',
    routes: ['POST /api/v1/skills/:id/endorse', 'POST /api/v1/skills/:id/endorsements/revoke', 'GET /api/v1/skills/:id/endorsements'],
    migrations: ['00032_peer_credibility_schema.sql (skill_endorsements, endorsement_weights)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Peer credibility scoring where endorser reputation weights endorsement strength; ephemeral.'
  },
  'F-151': {
    domain: 'skill-forecasting.ts',
    routes: ['POST /api/v1/skills/market-signals', 'POST /api/v1/skills/forecasts/generate', 'GET /api/v1/skills/:id/forecast', 'GET /api/v1/skills/emerging/top'],
    migrations: ['00035_skill_forecasting_schema.sql (skill_market_signals, skill_forecasts)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Skill supply/demand forecasting with growth projections and regional segmentation in API; ephemeral.'
  },
  'F-152': {
    domain: 'career-trajectory.ts',
    routes: ['POST /api/v1/career/transitions', 'GET /api/v1/career/benchmarks', 'POST /api/v1/career/trajectory/probability', 'GET /api/v1/career/pathways', 'POST /api/v1/career/milestones/readiness'],
    migrations: ['00036_career_trajectory_schema.sql (career_transitions, progression_benchmarks, career_milestone_evaluations)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Markov/statistical career trajectory transition probability and salary progression projections in API; ephemeral.'
  },
  'F-153': {
    domain: 'learning-impact.ts',
    routes: ['POST /api/v1/learning/outcomes', 'GET /api/v1/learning/impact/:courseId', 'POST /api/v1/learning/impact/compute', 'GET /api/v1/learning/impact/dashboard'],
    migrations: ['00037_learning_impact_schema.sql (learning_outcomes, learning_impact_metrics)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Learning ROI dashboard measuring career transition rates and post-course salary uplift with k-anonymity (≥5 cohort); ephemeral.'
  },
  'F-154': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Predictive hiring decision modeling excluded from GA per SSOT §E (Hiring Intelligence Governance); descriptive benchmarking only.'
  },
  'F-155': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Adaptive personalized learning system deferred to Phase 5.'
  },
  'F-156': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Professional development plan authoring system deferred to Phase 4–5.'
  },
  'F-157': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Co-learning path optimizer deferred to Phase 5.'
  },
  'F-158': {
    domain: 'talent-pool-intelligence.ts',
    routes: ['POST /api/v1/recruiter/talent-pools', 'POST /api/v1/recruiter/talent-pools/:id/members', 'PATCH /api/v1/recruiter/talent-pools/:id/members/:memberId', 'GET /api/v1/recruiter/talent-pools/:id/intelligence'],
    migrations: ['00038_talent_pool_intelligence_schema.sql (talent_pools, talent_pool_members)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Talent pool creation, member curation, skill coverage metrics, and pipeline readiness scoring in API; ephemeral.'
  },
  'F-159': {
    domain: 'behavioral-talent-discovery.ts',
    routes: ['GET /api/v1/recruiter/talent/behavioral/discover', 'POST /api/v1/recruiter/talent/behavioral/profile'],
    migrations: ['00039_behavioral_talent_discovery_schema.sql (behavioral_talent_profiles)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Objective activity-based discovery (commit cadence, problem solving tenacity, collaboration consistency) in API; ephemeral.'
  },
  'F-160': {
    domain: 'talent-segmentation.ts',
    routes: ['POST /api/v1/recruiter/talent/segmentation/classify', 'GET /api/v1/recruiter/talent/segmentation/distribution', 'GET /api/v1/recruiter/talent/segmentation/filter'],
    migrations: ['00040_talent_segmentation_schema.sql (candidate_segmentations)'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Multi-dimensional candidate classification (specialization, seniority, engagement, readiness) in API; ephemeral.'
  },
  'F-161': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Enterprise internal mobility and succession planning platform deferred to Phase 6–7.'
  },
  'F-162': {
    domain: 'work-history-graph.ts',
    routes: ['GET /api/v1/candidates/:candidateId/work-history-graph'],
    migrations: ['00041_verified_work_history_schema.sql (verified_work_histories, employment_references)'],
    ui: 'EvidencePage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Verified employment graph connecting candidate nodes, corporate domain verification, and referee voucher records backed by PostgreSQL.'
  },
  'F-163': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'W3C Verifiable Credentials export wallet deferred to Phase 5; JSON export supported in F-15.'
  },
  'F-164': {
    domain: 'portfolio.ts, evidence.ts',
    routes: ['GET /api/v1/evidence/:id/verify-public', 'GET /api/v1/portfolio/projects/:id'],
    migrations: ['00001_core_schema.sql', '00011_portfolio_showcase_schema.sql'],
    ui: 'EvidencePage.tsx',
    status: 'Partial',
    durability: 'Durable',
    notes: 'Evidence artifact context and portfolio storytelling supported in UI; AI narrative generator deferred.'
  },
  'F-165': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'DEI aggregation data system deferred to Phase 8.'
  },
  'F-166': {
    domain: 'technical-interview.ts',
    routes: ['POST /api/v1/interviews/assessments/:id/scorecard'],
    migrations: ['00026_technical_interview_platform_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Interview performance rubrics benchmarked against question criteria; ephemeral.'
  },
  'F-167': {
    domain: 'technical-interview.ts',
    routes: ['POST /api/v1/interviews/assessments/:id/review'],
    migrations: ['00026_technical_interview_platform_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Comprehensive interview assessment review and candidate comparison; ephemeral.'
  },
  'F-168': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Predictive hiring decision modeling excluded from GA per SSOT §E (Hiring Intelligence Governance).'
  },
  'F-169': {
    domain: 'activity-contributions.ts',
    routes: ['GET /api/v1/activity/scores/:userId'],
    migrations: ['00030_activity_contributions_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Community contribution scoring implemented in activity domain; ephemeral.'
  },
  'F-170': {
    domain: 'None',
    routes: ['None'],
    migrations: ['None'],
    ui: 'None',
    status: 'Missing',
    durability: 'N/A',
    notes: 'Enhanced expert network deferred to Phase 7.'
  },
  'F-171': {
    domain: 'employer-reputation.ts',
    routes: ['GET /api/v1/reputation/employers/:orgId', 'POST /api/v1/reputation/employers/:orgId/metrics'],
    migrations: ['00034_employer_reputation_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Employer brand management and operational transparency metrics in API; ephemeral.'
  },
  'F-172': {
    domain: 'salary-intelligence.ts',
    routes: ['GET /api/v1/salaries/benchmarks'],
    migrations: ['00023_salary_intelligence_schema.sql'],
    ui: 'None',
    status: 'Partial',
    durability: 'Ephemeral',
    notes: 'Advanced compensation benchmarks with percentiles (p10, p25, p50, p75, p90) in API; ephemeral.'
  },
  'F-173': {
    domain: 'skills.ts, jobs.ts',
    routes: ['GET /api/v1/skills', 'GET /api/v1/jobs/:id'],
    migrations: ['00002_evidence_skills_schema.sql', '00003_jobs_applications_schema.sql (job_skills)'],
    ui: 'JobsPage.tsx',
    status: 'Full',
    durability: 'Durable',
    notes: 'Mapping of employer job postings to canonical skills taxonomy with database enforcement.'
  }
};

// Check that all 173 features are mapped in rules
const missingRules = [];
uniqueFeatures.forEach(f => {
  if (!rules[f.id]) {
    missingRules.push(f.id);
  }
});

console.log('Features without explicit rule:', missingRules.length);
if (missingRules.length > 0) {
  console.log('Missing:', missingRules);
}

// Compute statistics across all 173 features
const stats = {
  total: uniqueFeatures.length,
  full: 0,
  partial: 0,
  stubMock: 0,
  missing: 0,
  durable: 0,
  ephemeral: 0,
  stateless: 0,
  na: 0
};

uniqueFeatures.forEach(f => {
  const r = rules[f.id];
  if (!r) return;
  if (r.status === 'Full') stats.full++;
  else if (r.status === 'Partial') stats.partial++;
  else if (r.status === 'Stub/Mock') stats.stubMock++;
  else if (r.status === 'Missing') stats.missing++;

  if (r.durability === 'Durable') stats.durable++;
  else if (r.durability === 'Ephemeral') stats.ephemeral++;
  else if (r.durability === 'Stateless') stats.stateless++;
  else stats.na++;
});

console.log('Feature Status Statistics:');
console.log(JSON.stringify(stats, null, 2));

// Save complete matrix data
const matrix = uniqueFeatures.map(f => {
  const r = rules[f.id] || {};
  return {
    id: f.id,
    name: f.name,
    category: f.category,
    priority: f.priority,
    phase: f.phase,
    dependencies: f.dependencies,
    domain: r.domain || 'None',
    routes: r.routes ? (Array.isArray(r.routes) ? r.routes.join(', ') : r.routes) : 'None',
    durability: r.durability || 'N/A',
    ui: r.ui || 'None',
    migrations: r.migrations ? (Array.isArray(r.migrations) ? r.migrations.join('; ') : r.migrations) : 'None',
    status: r.status || 'Missing',
    notes: r.notes || ''
  };
});

fs.writeFileSync(
  path.join(__dirname, 'traceability_matrix.json'),
  JSON.stringify({ stats, matrix }, null, 2)
);
console.log('Saved traceability_matrix.json successfully');

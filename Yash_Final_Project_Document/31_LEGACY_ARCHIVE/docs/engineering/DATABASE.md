# Database and persistence

Source cross-check: `431c425a`, 2026-10-23. This is a source/storage reference,
not a claim about an applied database. The schema is the ordered SQL in
[supabase/migrations](../../supabase/migrations); the API does not use every table.

## Ownership and relationships

[createStorage](../../apps/api/src/storage/index.ts) chooses PostgreSQL by default,
or memory for tests unless overridden. PostgreSQL failure does not silently fall
back to memory. `PgCoreStore` loads its tables before the API accepts traffic.
A retained connection holds `pg_try_advisory_lock(718201, 1)`; a second API writer
is refused. A lost lock connection makes traffic fail until restart. Transaction
pooling cannot be assumed compatible with this session-scoped lease.

| Store | Persisted records / relationship | Read/write behavior |
| --- | --- | --- |
| [core-store.ts](../../apps/api/src/storage/core-store.ts) | `users` ? `profiles`; organizations ? `org_memberships`; jobs ? `job_skills`; applications ? `application_evidence`; evidence ? `evidence_skills`; work histories ? references/email challenges; threads ? participants/messages; notifications/preferences; revoked sessions | Boot-hydrated Maps; `persist` commits operations then updates read model |
| [account-store.ts](../../apps/api/src/storage/account-store.ts) | `user_settings`, `data_export_requests`, keyed by account | SQL-backed settings/export history; BYO credentials encrypted with separate AES-GCM key |
| [erasure-store.ts](../../apps/api/src/storage/erasure-store.ts) | `data_erasure_requests`, account relationship | Request/status/cancel/complete; account-row locking serializes requests |
| [saved-search-store.ts](../../apps/api/src/storage/saved-search-store.ts) | `saved_searches` owned by user | Owner-scoped CRUD; alert-generation state remains separate |
| [saved-job-store.ts](../../apps/api/src/storage/saved-job-store.ts) | `saved_jobs` joins user/job | Database uniqueness prevents duplicate bookmarks |
| [admin-audit-store.ts](../../apps/api/src/storage/admin-audit-store.ts) | `admin_audit_logs` | Append and filtered list; distinct from observability's in-memory sink |
| [feature-flag-store.ts](../../apps/api/src/storage/feature-flag-store.ts) | `feature_flags` | SQL list/get/upsert; maintenance-mode state is separate |
| [billing-store.ts](../../apps/api/src/storage/billing-store.ts) | `subscriptions`, `invoices`, `entitlements`, `billing_events`, `stripe_customers` | Transactional state/event writes and customer ownership mapping |
| [background-jobs.ts](../../packages/domain/src/background-jobs.ts) | `background_jobs` | Injected query boundary; enqueue, leased claim, completion/failure, cancellation and retention |

User IDs and profile IDs are different: applications/evidence and messaging often
refer to profile IDs, while billing/settings use account IDs. Check the actual
foreign key and handler lookup before joining them. Migration 00043 aligns core
persistence; 00047?00048 repair selected private-data policies; 00052?00053 add
billing persistence and harden grants; 00054 repoints historical `auth.users`
foreign keys to application-owned `public.users`.

## Transactions, reads and failure recovery

`persist(...CoreOp[])` in `apps/api/src/server.ts` rejects guarded records already
being written or whose `base` object is stale. `PgCoreStore.commit` rechecks
important database columns and writes in one transaction. Only after COMMIT does
`applyToReadModel` update Maps and indexes. Unique violations become 409 conflicts;
foreign-key/check/data errors become validation failures. A failed commit leaves
the read model unchanged. Direct SQL changes to hydrated records need an API
restart; dedicated SQL-backed stores have their own read behavior.

This is a single-writer architecture, not a distributed cache. The core transaction
does not automatically include dedicated stores, Stripe calls or queued jobs.
`dispatchJob` follows committed effects and logs enqueue failures. There is no
transactional outbox guaranteeing delivery of every committed event.

Long-tail modules (courses/enrollments/certificates, challenge sessions, resumes,
portfolio, connections, analytics, reputation and intelligence) retain Maps even
where SQL tables exist. Course/challenge routes may persist evidence while their
originating records disappear on restart. See the
[route inventory](API_CONTRACTS.md#complete-static-endpoint-index) and
[authorization review](../system-model/06-route-authorization.md).

## Data lifecycle and privacy

Passwords use salted, versioned PBKDF2 hashes. Work-email codes and reference
bearer tokens are stored as SHA-256 hashes; pending email jobs necessarily carry
delivery payloads, which are scrubbed on terminal transitions. Development outbox
logs contain delivery text. Treat these logs as sensitive. BYO-key encryption
uses `BYO_AI_KEY_ENCRYPTION_KEY`, not the session signing secret; rotating it needs
re-encryption of existing ciphertext.

Erasure request history is durable, but there is no scheduled grace-period
executor. `/settings/erasure/execute` performs immediate deletion without checking
that grace period: billing/customer cleanup first, then one core anonymization
transaction, then queued-email cancellation and additional store/Map cleanup.
Failure after account deactivation can prevent the caller retrying later steps.
Retained multi-party records require a retention/redaction policy. Full erasure,
legal-hold behavior and recovery are not established by the core transaction.
Export compiles the available account data; it is not proof of an exhaustive
archive of every ephemeral module.

Requirements remain: explicit constraints, UTC timestamps, integer minor units
and currency, auditable lifecycle, concurrency policy, and corrections preserving
evidence lineage. The current evidence code mutates state; do not equate these
requirements with an implemented append-only version/event system. Target table
clusters and RLS generator design are in [SSOT](../../../../SSOT.md), Part VII sections
24.1?24.3. They replace the former duplicated 50/~220-table target lists here.

## Local migrations and hosted Supabase

For ordinary local PostgreSQL, `pnpm db:migrate` runs `scripts/migrate.mjs`:

1. Check nonempty, contiguous filenames from 00001.
2. Load `.env`; require `DATABASE_URL`; create the local database if needed.
3. Refuse detected hosted Supabase before its identity bootstrap.
4. Add local compatibility roles/auth helpers and organization alias views.
5. Validate `schema_migrations` filenames/checksums using `assertMigrationHistory`.
6. Apply each pending file and its ledger row in one transaction. On failure,
   that file rolls back; earlier files stay applied.
7. Maintain the local identity mirror compatibility helper.

This is a mutating command, not a schema linter. Preserve applied SQL checksums;
use additive migrations. Each migration needs purpose, affected data/index/RLS
impact, verification, release ordering and a rollback or forward-fix plan.

The runner deliberately refuses hosted Supabase. A manual ordered adapter exists
in [supabase/hosted/README.md](../../supabase/hosted/README.md), including aliases,
00054 and a Data API lockdown. That file records the state applied on 2026-10-23 (00001-00054, aliases, lockdown,
`schema_migrations` ledger; all tables empty), not a freshly observed state. Follow the
[hosted gate](HOSTED_SUPABASE_MIGRATION_GATE.md) before any live action. Never
create synthetic platform Auth users or replace hosted `auth.uid()`/`auth.jwt()`
to make custom Fastify identities appear compatible.

## Authorization and verification

Fastify enforces authorization using its own sessions. The privileged database
connection is not proof that RLS protects API calls. Review grants, policies,
views and privileged functions separately before any direct Data API access;
application tokens are not Supabase Auth identities. Private-data two-user tests
exist in `tests/pg/private-data-rls.test.ts`; memory and SQL-text tests cannot prove
hosted isolation. No database was queried, migrated or tested during this
source-only documentation pass.

## Migration inventory

The following is a static inventory of all checked-in migration files. Table names
are extracted from `CREATE TABLE` statements; alterations/policies are not table
creation, and presence does not establish applied state or runtime use. For column
bounds, foreign keys and indexes, read the linked SQL rather than a duplicate DDL.

55 numbered migrations; 112 distinct table names in CREATE TABLE statements (not a live schema count).

| Migration | Created tables |
| --- | --- |
| [00001_core_schema.sql](../../supabase/migrations/00001_core_schema.sql) | `users`, `profiles`, `evidence`, `organizations`, `org_memberships`, `jobs`, `job_applications`, `audit_logs`, `feature_flags` |
| [00002_evidence_skills_schema.sql](../../supabase/migrations/00002_evidence_skills_schema.sql) | `skills`, `skill_relationships`, `evidence_skills` |
| [00003_jobs_applications_schema.sql](../../supabase/migrations/00003_jobs_applications_schema.sql) | `job_skills`, `application_evidence` |
| [00004_challenges_assessment_schema.sql](../../supabase/migrations/00004_challenges_assessment_schema.sql) | `challenges`, `assessment_sessions`, `challenge_submissions`, `xp_transactions` |
| [00005_lms_courses_schema.sql](../../supabase/migrations/00005_lms_courses_schema.sql) | `courses`, `course_modules`, `lessons`, `course_enrollments`, `lesson_progress`, `course_certificates`, `course_skills` |
| [00006_messaging_schema.sql](../../supabase/migrations/00006_messaging_schema.sql) | `message_threads`, `thread_participants`, `messages` |
| [00007_notifications_schema.sql](../../supabase/migrations/00007_notifications_schema.sql) | `notifications`, `notification_preferences` |
| [00008_ai_gateway_schema.sql](../../supabase/migrations/00008_ai_gateway_schema.sql) | `ai_conversations`, `ai_messages`, `ai_usage_meters` |
| [00009_resumes_schema.sql](../../supabase/migrations/00009_resumes_schema.sql) | `resumes`, `resume_exports` |
| [00010_networking_connections_schema.sql](../../supabase/migrations/00010_networking_connections_schema.sql) | `connections` |
| [00011_portfolio_showcase_schema.sql](../../supabase/migrations/00011_portfolio_showcase_schema.sql) | `portfolio_projects`, `portfolio_project_skills`, `portfolio_project_media`, `portfolio_project_evidence` |
| [00012_gamification_xp_ledger_schema.sql](../../supabase/migrations/00012_gamification_xp_ledger_schema.sql) | `user_gamification_profiles`, `gamification_badges`, `user_badges` |
| [00013_account_settings_privacy_schema.sql](../../supabase/migrations/00013_account_settings_privacy_schema.sql) | `user_settings`, `data_erasure_requests`, `data_export_requests` |
| [00014_billing_subscriptions_schema.sql](../../supabase/migrations/00014_billing_subscriptions_schema.sql) | `subscriptions`, `invoices`, `entitlements`, `billing_events` |
| [00015_admin_governance_schema.sql](../../supabase/migrations/00015_admin_governance_schema.sql) | `platform_config` |
| [00016_search_discovery_schema.sql](../../supabase/migrations/00016_search_discovery_schema.sql) | `search_history` |
| [00017_moderation_trust_safety_schema.sql](../../supabase/migrations/00017_moderation_trust_safety_schema.sql) | `moderation_reports`, `moderation_appeals` |
| [00018_saved_searches_job_alerts_schema.sql](../../supabase/migrations/00018_saved_searches_job_alerts_schema.sql) | `saved_searches`, `job_alerts`, `saved_jobs` |
| [00019_application_drafts_schema.sql](../../supabase/migrations/00019_application_drafts_schema.sql) | `application_drafts`, `application_draft_versions` |
| [00020_product_analytics_schema.sql](../../supabase/migrations/00020_product_analytics_schema.sql) | `analytics_events`, `analytics_daily_kpis` |
| [00021_certificate_verification_schema.sql](../../supabase/migrations/00021_certificate_verification_schema.sql) | `certificate_revocations` |
| [00022_job_templates_schema.sql](../../supabase/migrations/00022_job_templates_schema.sql) | `job_templates` |
| [00023_salary_intelligence_schema.sql](../../supabase/migrations/00023_salary_intelligence_schema.sql) | `salary_reports`, `salary_aggregates` |
| [00024_application_feedback_schema.sql](../../supabase/migrations/00024_application_feedback_schema.sql) | `feedback_templates`, `application_feedback` |
| [00025_skill_decay_schema.sql](../../supabase/migrations/00025_skill_decay_schema.sql) | `skill_freshness`, `skill_freshness_history` |
| [00026_technical_interview_platform_schema.sql](../../supabase/migrations/00026_technical_interview_platform_schema.sql) | `interview_questions`, `interview_assessments`, `interview_scorecards`, `interview_ai_feedbacks` |
| [00027_reputation_engine_schema.sql](../../supabase/migrations/00027_reputation_engine_schema.sql) | `reputation_scores`, `reputation_signals`, `reputation_history`, `reputation_recovery_plans` |
| [00028_warm_introductions_schema.sql](../../supabase/migrations/00028_warm_introductions_schema.sql) | `warm_introduction_preferences`, `warm_introduction_requests` |
| [00029_referral_requests_schema.sql](../../supabase/migrations/00029_referral_requests_schema.sql) | `referral_requests`, `referral_outcomes` |
| [00030_activity_contributions_schema.sql](../../supabase/migrations/00030_activity_contributions_schema.sql) | `activity_events`, `contribution_scores` |
| [00031_instructor_reputation_schema.sql](../../supabase/migrations/00031_instructor_reputation_schema.sql) | `instructor_reputation_breakdown`, `instructor_endorsements` |
| [00032_peer_credibility_schema.sql](../../supabase/migrations/00032_peer_credibility_schema.sql) | `skill_endorsements`, `endorsement_weights` |
| [00033_alumni_networks_schema.sql](../../supabase/migrations/00033_alumni_networks_schema.sql) | `alumni_affiliations`, `alumni_groups`, `alumni_group_members`, `alumni_mentorship` |
| [00034_employer_reputation_schema.sql](../../supabase/migrations/00034_employer_reputation_schema.sql) | `employer_reputation_breakdown`, `employer_reviews` |
| [00035_skill_forecasting_schema.sql](../../supabase/migrations/00035_skill_forecasting_schema.sql) | `skill_market_signals`, `skill_forecasts` |
| [00036_career_trajectory_schema.sql](../../supabase/migrations/00036_career_trajectory_schema.sql) | `career_transitions`, `progression_benchmarks`, `career_milestone_evaluations` |
| [00037_learning_impact_schema.sql](../../supabase/migrations/00037_learning_impact_schema.sql) | `learning_outcomes`, `learning_impact_metrics` |
| [00038_talent_pool_intelligence_schema.sql](../../supabase/migrations/00038_talent_pool_intelligence_schema.sql) | `talent_pools`, `talent_pool_members` |
| [00039_behavioral_talent_discovery_schema.sql](../../supabase/migrations/00039_behavioral_talent_discovery_schema.sql) | `behavioral_talent_profiles` |
| [00040_talent_segmentation_schema.sql](../../supabase/migrations/00040_talent_segmentation_schema.sql) | `candidate_segmentations` |
| [00041_verified_work_history_schema.sql](../../supabase/migrations/00041_verified_work_history_schema.sql) | `verified_work_histories`, `employment_references` |
| [00042_background_jobs_schema.sql](../../supabase/migrations/00042_background_jobs_schema.sql) | `background_jobs` |
| [00043_core_persistence_alignment.sql](../../supabase/migrations/00043_core_persistence_alignment.sql) | `work_history_email_challenges` |
| [00044_notifications_persistence.sql](../../supabase/migrations/00044_notifications_persistence.sql) | Alterations, policies, indexes or operational alignment; inspect SQL |
| [00045_session_revocation.sql](../../supabase/migrations/00045_session_revocation.sql) | Alterations, policies, indexes or operational alignment; inspect SQL |
| [00046_session_sign_out.sql](../../supabase/migrations/00046_session_sign_out.sql) | `revoked_sessions` |
| [00047_private_data_rls_hardening.sql](../../supabase/migrations/00047_private_data_rls_hardening.sql) | Alterations, policies, indexes or operational alignment; inspect SQL |
| [00048_notification_preferences_rls_scope.sql](../../supabase/migrations/00048_notification_preferences_rls_scope.sql) | Alterations, policies, indexes or operational alignment; inspect SQL |
| [00049_worker_liveness.sql](../../supabase/migrations/00049_worker_liveness.sql) | `worker_health` |
| [00050_admin_audit_logs.sql](../../supabase/migrations/00050_admin_audit_logs.sql) | `admin_audit_logs` |
| [00051_feature_flags.sql](../../supabase/migrations/00051_feature_flags.sql) | `feature_flags` |
| [00052_billing_persistence_and_stripe.sql](../../supabase/migrations/00052_billing_persistence_and_stripe.sql) | `stripe_customers` |
| [00053_billing_role_grants_hardening.sql](../../supabase/migrations/00053_billing_role_grants_hardening.sql) | Alterations, policies, indexes or operational alignment; inspect SQL |
| [00054_repoint_auth_users_foreign_keys.sql](../../supabase/migrations/00054_repoint_auth_users_foreign_keys.sql) | Alterations, policies, indexes or operational alignment; inspect SQL |
| [00055_certificate_revocations_rls.sql](../../supabase/migrations/00055_certificate_revocations_rls.sql) | Alterations, policies, indexes or operational alignment; inspect SQL |

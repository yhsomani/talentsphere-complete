# Legacy Merge B-12: Database and Persistence Reference (Prior Attempt) Reconciled to the Target Data Design

Doc ID: LGM-B-12 · Owner: Data Architecture · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: DB-01..DB-04, DB-02-R2, ADR-T05, ADR-T21, INV-T03, INV-T04, INV-T05, MIG-DATA-01, OPEN-08, OPEN-14, OPEN-17, OPEN-52 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/engineering/DATABASE.md`, `.../HOSTED_SUPABASE_MIGRATION_GATE.md`, the schema-alignment section of `.../adr/ADR-015-core-loop-persistence.md`, and the database/lifecycle parts of `.../quality/OPERATIONS.md` and `.../quality/SECURITY.md`.

## 0. Frame

- **No database exists in this project.** "Prior attempt reported ..." means a legacy document claimed it of an earlier attempt (source cross-check `431c425a`, 2026-10-23, source-only; "no database was queried, migrated or tested" by that documentation pass). "Target requires ..." is a requirement for this project.
- Legacy `DATABASE.md` was itself a *source/storage reference, not a claim about an applied database*. Legacy text uses `?` where an arrow or en dash was lost in export; hand-written text below restores the meaning.
- The prior attempt's duplicated target-table lists ("50 / ~220 tables") were already removed upstream in favour of the SSOT Part VII sections 24.1-24.3; this blueprint's authoritative physical design is DB-02 / DB-02-R2.

## 1. Store ownership and relationships (prior attempt) - lessons for the target

Prior attempt reported: the storage factory chose PostgreSQL by default (memory for tests unless overridden); PostgreSQL failure never silently fell back to memory; the core store loaded its tables before the API accepted traffic; a retained connection held a session advisory lock `pg_try_advisory_lock(718201, 1)` so a second API writer was refused; losing that connection made traffic fail until restart; **transaction pooling could not be assumed compatible with the session-scoped lease**.

Store table as reported (verbatim; `?` = lost arrow):

| Store | Persisted records / relationship | Read/write behavior |
| --- | --- | --- |
| core-store.ts | `users` ? `profiles`; organizations ? `org_memberships`; jobs ? `job_skills`; applications ? `application_evidence`; evidence ? `evidence_skills`; work histories ? references/email challenges; threads ? participants/messages; notifications/preferences; revoked sessions | Boot-hydrated Maps; `persist` commits operations then updates read model |
| account-store.ts | `user_settings`, `data_export_requests`, keyed by account | SQL-backed settings/export history; BYO credentials encrypted with separate AES-GCM key |
| erasure-store.ts | `data_erasure_requests`, account relationship | Request/status/cancel/complete; account-row locking serializes requests |
| saved-search-store.ts | `saved_searches` owned by user | Owner-scoped CRUD; alert-generation state remains separate |
| saved-job-store.ts | `saved_jobs` joins user/job | Database uniqueness prevents duplicate bookmarks |
| admin-audit-store.ts | `admin_audit_logs` | Append and filtered list; distinct from observability's in-memory sink |
| feature-flag-store.ts | `feature_flags` | SQL list/get/upsert; maintenance-mode state is separate |
| billing-store.ts | `subscriptions`, `invoices`, `entitlements`, `billing_events`, `stripe_customers` | Transactional state/event writes and customer ownership mapping |
| background-jobs.ts | `background_jobs` | Injected query boundary; enqueue, leased claim, completion/failure, cancellation and retention |

Reported cautions kept as design lessons:

| Prior attempt reported | Target requires |
|---|---|
| User IDs and profile IDs were different keys: applications/evidence/messaging often used profile IDs while billing/settings used account IDs; joins required checking the actual FK first | One canonical person key (`subject`/`user_id`) and an explicit rule for what profile ids are; no table may use two interchangeable id spaces (DB-01 domain model; add lint "FK targets the canonical id"). |
| Migration 00043 aligned core persistence; 00047-00048 repaired private-data policies; 00052-00053 added billing persistence and hardened grants; 00054 repointed historical `auth.users` foreign keys to application-owned `public.users` | Design identity ownership once (application-owned `users`, never FK to a provider-managed schema) so no repoint migration is ever needed. See hosted Supabase section 6. |
| Long-tail modules (courses/enrollments/certificates, challenge sessions, resumes, portfolio, connections, analytics, reputation, intelligence) kept in-memory Maps *even where SQL tables existed*; course/challenge routes could persist evidence while their originating records vanished on restart | A table existing is not durability. Acceptance for any feature: restart-survival test against real PostgreSQL (see `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md`); no feature may be listed as "available" if its source of truth is process memory. |

## 2. Transactions, reads and failure recovery (prior attempt) - lessons

- Prior attempt: core writes went through one function that rejected writes to a record already being written, or whose `base` object was stale; the store re-checked important database columns and wrote in one transaction; only after COMMIT was the read model (Maps and indexes) updated; unique violations became 409 conflicts, FK/check/data errors became validation failures; a failed commit left the read model unchanged; direct SQL changes to hydrated records required an API restart. "This is a single-writer architecture, not a distributed cache."
- Prior attempt: the core transaction did **not** automatically include dedicated stores, Stripe calls or queued jobs; job dispatch followed committed effects and logged enqueue failures; **no transactional outbox** guaranteed delivery of every committed event (conflict CF-23).
- **Target requires:** (a) no read model - SQL-only reads and writes (ADR-T05; reconciles OPEN-52); (b) event write in the **same transaction** as the state change (INV-T12 / transactional outbox) so no committed change can lose its event; (c) unique violation -> 409, FK/check -> 422 (RFC 9457) - same mapping; (d) optimistic concurrency by version/ETag on guarded records plus decisive-column guards inside SQL for counters and state (`WHERE status = ...`, `WHERE attempts = ... AND code_hash = ...`); (e) external calls (payment gateway, email) never inside a DB transaction.

## 3. Data lifecycle and privacy (prior attempt facts that constrain the target)

- Passwords: salted, versioned PBKDF2 hashes (details in the security file). Work-email codes and reference bearer tokens stored as SHA-256 hashes. Pending email jobs necessarily carried delivery payloads; those payloads were scrubbed on terminal transitions. Development outbox logs contained delivery text and had to be treated as sensitive. BYO AI key encryption used its own key (`BYO_AI_KEY_ENCRYPTION_KEY`, AES-256-GCM, 64 hex chars) rather than the session signing secret; rotating it needed re-encryption of existing ciphertext; no key meant a BYO secret was refused rather than stored as plaintext.
- Erasure: request history was durable, but **no scheduled grace-period executor existed**; the execute route performed immediate deletion without checking the grace period: billing/customer cleanup first, then one core anonymization transaction, then queued-email cancellation and additional store/Map cleanup. Failure after account deactivation could stop the caller from retrying later steps. Retained multi-party records needed a retention/redaction policy; full erasure, legal-hold and recovery were not established. Export compiled the available account data and was **not** an exhaustive archive of ephemeral modules.
- Requirements the prior attempt said "remain": explicit constraints, UTC timestamps, integer minor units with currency, auditable lifecycle, concurrency policy, and corrections that preserve evidence lineage. "The current evidence code mutates state; do not equate these requirements with an implemented append-only version/event system."
- **Target requires** (all already designed in DB-03 / SEC-03; this list is the acceptance cross-check): erasure as an idempotent, resumable multi-step saga with per-step state (`erasure_request`, `erasure_step`), grace period enforced server-side (cancelled by login or user) with the exact period set by OPEN-08; no "execute immediately" route that bypasses the grace period except a separately authorized legal-hold-aware path; export that enumerates every personal-data table via the DATA-xxx inventory and declares what is excluded; append-only evidence lineage (ADR-T14) so corrections never overwrite. Conflict L-B12-01 (open): the legacy UI promised a 30-day grace period and the legacy API ignored it (CF-33); decide the period and the emergency-delete policy (OPEN-08, owner Legal/Privacy Lead).

## 4. Local migration runner steps (prior attempt) - kept as runner requirements

Reported runner behaviour (`pnpm db:migrate`, one mutating command, not a linter):

1. Check filenames are non-empty and contiguous from `00001`.
2. Load environment; require `DATABASE_URL`; create the local database if needed.
3. Refuse a detected hosted Supabase **before** its identity bootstrap.
4. Add local compatibility roles/auth helpers and organization alias views.
5. Validate the `schema_migrations` ledger filenames/checksums with a pure helper (`assertMigrationHistory`).
6. Apply each pending file and its ledger row in **one transaction**; a failing file rolls back, earlier files stay applied.
7. Maintain the local identity-mirror compatibility helper.

Rules reported: preserve applied SQL checksums; use additive migrations; each migration states purpose, affected data/index/RLS impact, verification, release ordering and a rollback or forward-fix plan. CI applied all migrations to an empty database and re-ran the runner on every push (second run a no-op). A manual read-only preflight script existed (modes `pre-00043`, `schema`, `operational`) - see `../17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md` section 5.

**Target requires:** DB-04 already specifies ledger `schema_migration(version, checksum, applied_at, applied_by, kind)`, append-only files, expand/contract and CI lints. Items from the reference not yet explicit in DB-04, to add when DB-04 is next revised: (i) filenames contiguous from the first file with a gap-check lint; (ii) "refuse to run against the wrong environment" guard keyed on a configured expected project reference and TLS verify-full; (iii) one transaction per file with the ledger row in the same transaction; (iv) the pure `assertMigrationHistory`-style checksum helper unit-tested separately from the runner (the prior attempt had five such helper tests); (v) idempotency step (second run is a no-op) in CI.

## 5. RLS and authorization boundary (prior attempt lessons)

- The API authorized in code using its own sessions; its privileged connection bypassed RLS; "the privileged database connection is not proof that RLS protects API calls". Grants, policies, views and privileged functions had to be reviewed separately before any direct Data API access; application tokens were not provider-auth identities.
- Two-user private-data RLS tests existed (`tests/pg/private-data-rls.test.ts`); memory and SQL-text tests could not prove hosted isolation.
- Lessons on RLS defects found by real two-account tests: profile-id vs auth-user-id comparison errors; recursive thread-participant policy (replaced by a fixed-search-path `SECURITY DEFINER` membership helper); an unqualified `user_id` inside a subquery bound to the inner table and denied legitimate owners (fixed by a forward-only migration qualifying the column). Details in `../14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` section 2.
- **Target requires:** every policy ships with an allow/deny two-principal test (CODE_STYLE rule 7, "RLS policy tests accompany policy migrations"); qualify every column in policy subqueries; membership helpers are `SECURITY DEFINER` with fixed `search_path`; RLS is defence-in-depth under ADR-T05/T21, never a substitute for API authorization.

## 6. Hosted Supabase migration gate (full text, reframed) - prerequisites for any managed-database use

**Rule (prior attempt, kept as a target rule):** an ordinary local migration runner must never be pointed at a hosted Supabase project. It prepares local compatibility objects, including `auth.users`, `auth.uid()` and `auth.jwt()`, and explicitly refuses the hosted identity footprint; hosted Auth objects belong to the platform.

Prior attempt reported current repository support and *unknown* live state:

- A manual adapter existed: first migration, organization alias views, migrations 00002-00053, migration 00054 (repoint FKs), then Data API lockdown and exact checksum ledger recording. This superseded an older statement that no hosted path existed. It did not establish the sequence had run or was safe on populated data. The adapter's README recorded a historical partial application through 00038; older reports described an earlier empty project; neither was a current observation; the documentation pass made no live connection.
- Named historical target: `talentsphere-production`, project ref `qidckctwrkxyiwworchd`, Mumbai (`ap-south-1`). **Target requires:** validate the intended target and current schema/ledger before any action; never infer current state from snapshots; never mark equivalent objects applied without matching checksums. (Project ref is not a secret; no credentials are recorded here.)

Static dependency audit (kept as a reusable gate): a script read all migrations without a database connection and printed JSON listing identity references (`auth.users`, `auth.uid()`, `auth.jwt()`), RLS declarations, privileged functions and public views. Exit code 1 was *expected* while historical SQL referenced the provider identity. It was a dependency signal, not a test of current grants or authorization. Migration 00054 fixed FKs but neither removed old file references nor made application tokens provider identities.

Release prerequisites (prior attempt, six steps, preserved):

1. Review all ordered migration/bootstrap dependencies and the hosted adapter; preserve historical SQL/checksums and the local migration path.
2. Keep the application identity boundary explicit: application users live in `public.users`. Do **not** insert synthetic platform Auth users or replace provider-managed functions. Changes of identity authority require approval.
3. Rehearse the complete additive sequence on a disposable managed project, including clean and populated upgrades, foreign keys, alias views and ledger.
4. Review grants, RLS, privileged functions and views. Deny unintended Data API access for `anon`/`authenticated`; test actual two-user/two-organization reads and forged-owner mutations. API checks remain mandatory with a privileged connection. **An empty advisor result is not acceptance evidence.**
5. Configure only a server-side `DATABASE_URL`; the API config checks the expected `SUPABASE_PROJECT_REF` and `sslmode=verify-full` when that ref is configured. Account for the session-scoped single-writer lease when choosing connectivity (no transaction pooler).
6. Verify backup/restore, restart, concurrent writes, application workflows and rollback/forward recovery before enabling production traffic or real users.

Conflict list kept visible: **CF-13** (migrations 00016, 00018, 00022, 00023 referenced `auth.users(id)` while the app kept users in `public.users`; on hosted Supabase those inserts would fail and `auth.uid()` policies would not recognise application tokens) - prior status "Confirmed, Blocked" (issue #46). **Target requires:** greenfield schema never references a provider-managed schema; hosting choice is OPEN-14; if a managed Supabase project is chosen later, use this gate as the checklist. **Decision needed:** identity authority (application sessions vs provider auth) is decided for this blueprint by ADR-T06; hosting by OPEN-14 (owner: Platform Architect + SRE Lead + ARB).

## 7. Migration inventory (prior attempt, static, not a live schema count)

"Table names are extracted from CREATE TABLE statements; alterations/policies are not table creation, and presence does not establish applied state or runtime use." 55 numbered migrations; 112 distinct table names. **Use in this project:** a checklist of capability areas the prior attempt thought worth tables - compare against DB-01/DB-02 entity lists (gap check, owner: Data Architect). Notably present in the prior list and worth verifying exist in DB-01/DB-02: `revoked_sessions`, `worker_health`, `admin_audit_logs`, `feature_flags`, `stripe_customers`, `work_history_email_challenges`, `salary_aggregates`, `analytics_daily_kpis`, `skill_freshness_history`, `certificate_revocations`, `application_draft_versions`.

55 numbered migrations; 112 distinct table names in CREATE TABLE statements (not a live schema count).

| Migration | Created tables |
| --- | --- |
| 00001_core_schema.sql | `users`, `profiles`, `evidence`, `organizations`, `org_memberships`, `jobs`, `job_applications`, `audit_logs`, `feature_flags` |
| 00002_evidence_skills_schema.sql | `skills`, `skill_relationships`, `evidence_skills` |
| 00003_jobs_applications_schema.sql | `job_skills`, `application_evidence` |
| 00004_challenges_assessment_schema.sql | `challenges`, `assessment_sessions`, `challenge_submissions`, `xp_transactions` |
| 00005_lms_courses_schema.sql | `courses`, `course_modules`, `lessons`, `course_enrollments`, `lesson_progress`, `course_certificates`, `course_skills` |
| 00006_messaging_schema.sql | `message_threads`, `thread_participants`, `messages` |
| 00007_notifications_schema.sql | `notifications`, `notification_preferences` |
| 00008_ai_gateway_schema.sql | `ai_conversations`, `ai_messages`, `ai_usage_meters` |
| 00009_resumes_schema.sql | `resumes`, `resume_exports` |
| 00010_networking_connections_schema.sql | `connections` |
| 00011_portfolio_showcase_schema.sql | `portfolio_projects`, `portfolio_project_skills`, `portfolio_project_media`, `portfolio_project_evidence` |
| 00012_gamification_xp_ledger_schema.sql | `user_gamification_profiles`, `gamification_badges`, `user_badges` |
| 00013_account_settings_privacy_schema.sql | `user_settings`, `data_erasure_requests`, `data_export_requests` |
| 00014_billing_subscriptions_schema.sql | `subscriptions`, `invoices`, `entitlements`, `billing_events` |
| 00015_admin_governance_schema.sql | `platform_config` |
| 00016_search_discovery_schema.sql | `search_history` |
| 00017_moderation_trust_safety_schema.sql | `moderation_reports`, `moderation_appeals` |
| 00018_saved_searches_job_alerts_schema.sql | `saved_searches`, `job_alerts`, `saved_jobs` |
| 00019_application_drafts_schema.sql | `application_drafts`, `application_draft_versions` |
| 00020_product_analytics_schema.sql | `analytics_events`, `analytics_daily_kpis` |
| 00021_certificate_verification_schema.sql | `certificate_revocations` |
| 00022_job_templates_schema.sql | `job_templates` |
| 00023_salary_intelligence_schema.sql | `salary_reports`, `salary_aggregates` |
| 00024_application_feedback_schema.sql | `feedback_templates`, `application_feedback` |
| 00025_skill_decay_schema.sql | `skill_freshness`, `skill_freshness_history` |
| 00026_technical_interview_platform_schema.sql | `interview_questions`, `interview_assessments`, `interview_scorecards`, `interview_ai_feedbacks` |
| 00027_reputation_engine_schema.sql | `reputation_scores`, `reputation_signals`, `reputation_history`, `reputation_recovery_plans` |
| 00028_warm_introductions_schema.sql | `warm_introduction_preferences`, `warm_introduction_requests` |
| 00029_referral_requests_schema.sql | `referral_requests`, `referral_outcomes` |
| 00030_activity_contributions_schema.sql | `activity_events`, `contribution_scores` |
| 00031_instructor_reputation_schema.sql | `instructor_reputation_breakdown`, `instructor_endorsements` |
| 00032_peer_credibility_schema.sql | `skill_endorsements`, `endorsement_weights` |
| 00033_alumni_networks_schema.sql | `alumni_affiliations`, `alumni_groups`, `alumni_group_members`, `alumni_mentorship` |
| 00034_employer_reputation_schema.sql | `employer_reputation_breakdown`, `employer_reviews` |
| 00035_skill_forecasting_schema.sql | `skill_market_signals`, `skill_forecasts` |
| 00036_career_trajectory_schema.sql | `career_transitions`, `progression_benchmarks`, `career_milestone_evaluations` |
| 00037_learning_impact_schema.sql | `learning_outcomes`, `learning_impact_metrics` |
| 00038_talent_pool_intelligence_schema.sql | `talent_pools`, `talent_pool_members` |
| 00039_behavioral_talent_discovery_schema.sql | `behavioral_talent_profiles` |
| 00040_talent_segmentation_schema.sql | `candidate_segmentations` |
| 00041_verified_work_history_schema.sql | `verified_work_histories`, `employment_references` |
| 00042_background_jobs_schema.sql | `background_jobs` |
| 00043_core_persistence_alignment.sql | `work_history_email_challenges` |
| 00044_notifications_persistence.sql | Alterations, policies, indexes or operational alignment; inspect SQL |
| 00045_session_revocation.sql | Alterations, policies, indexes or operational alignment; inspect SQL |
| 00046_session_sign_out.sql | `revoked_sessions` |
| 00047_private_data_rls_hardening.sql | Alterations, policies, indexes or operational alignment; inspect SQL |
| 00048_notification_preferences_rls_scope.sql | Alterations, policies, indexes or operational alignment; inspect SQL |
| 00049_worker_liveness.sql | `worker_health` |
| 00050_admin_audit_logs.sql | `admin_audit_logs` |
| 00051_feature_flags.sql | `feature_flags` |
| 00052_billing_persistence_and_stripe.sql | `stripe_customers` |
| 00053_billing_role_grants_hardening.sql | Alterations, policies, indexes or operational alignment; inspect SQL |
| 00054_repoint_auth_users_foreign_keys.sql | Alterations, policies, indexes or operational alignment; inspect SQL |
| 00055_certificate_revocations_rls.sql | Alterations, policies, indexes or operational alignment; inspect SQL |

## 8. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B12-01 | Erasure grace period and emergency-delete policy (legacy UI promised 30 days; legacy API ignored it) | Legal/Privacy Lead - OPEN-08 |
| L-B12-02 | Gap check: do DB-01/DB-02 cover each capability area of the 112-table legacy list (including worker liveness table, admin audit, revoked sessions, certificate revocations)? | Data Architect |
| L-B12-03 | Add the six migration-runner behaviours in section 4 to DB-04 on next revision | Database Architecture |
| OPEN-52 | Hybrid read model vs SQL-only | ARB |
| OPEN-14 | Hosting platform / managed Postgres | Platform Architect + SRE Lead |
